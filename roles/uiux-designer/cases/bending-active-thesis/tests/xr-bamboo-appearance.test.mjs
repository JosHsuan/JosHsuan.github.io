import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {deriveXRBambooCoordinates,installXRBambooAppearance} from '../components/xr-bamboo-appearance.mjs';

const bytes=await readFile(new URL('../release/public/assets/xr/xr-research-assembly.glb',import.meta.url));
const gltf=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
let mesh;gltf.scene.traverse(node=>{if(node.isMesh)mesh=node;});
const digest=array=>createHash('sha256').update(new Uint8Array(array.buffer,array.byteOffset,array.byteLength)).digest('hex');
const originalBuffers=()=>({position:digest(mesh.geometry.attributes.position.array),normal:digest(mesh.geometry.attributes.normal.array),index:digest(mesh.geometry.index.array)});

test('photograph-informed fibres follow every connected original four-corner sweep without changing geometry',()=>{
 const before=originalBuffers(),derived=deriveXRBambooCoordinates(mesh.geometry),p=mesh.geometry.attributes.position;
 assert(derived);assert.equal(derived.sweeps,384);assert.equal(derived.closedSweeps,96);assert.equal(derived.attribute.count,96312);assert.equal(derived.bytes,96312*4*4);
 assert(derived.minLength>0&&derived.maxLength>derived.minLength);
 const coordinates=derived.attribute.array;let starts=0,previous=null,previousSeed=null,previousArc=0;
 for(let i=0;i<p.count;i+=4){
  const center=[0,0,0];for(let j=0;j<4;j++){center[0]+=p.getX(i+j)/4;center[1]+=p.getY(i+j)/4;center[2]+=p.getZ(i+j)/4;}
  const arc=coordinates[i*4],seed=coordinates[i*4+3];
  if(seed!==previousSeed){assert.equal(arc,0);starts++;}
  else assert(Math.abs(arc-previousArc-Math.hypot(...center.map((v,axis)=>v-previous[axis])))<2e-7);
  for(let j=0;j<4;j++){assert.equal(coordinates[(i+j)*4],arc);assert.equal(coordinates[(i+j)*4+3],seed);}
  assert.deepEqual(Array.from(coordinates.slice(i*4,i*4+16)).filter((_,j)=>j%4===1||j%4===2),[1,0,0,1,-1,0,0,-1]);
  previous=center;previousSeed=seed;previousArc=arc;
 }
 assert.equal(starts,384);assert.deepEqual(originalBuffers(),before);assert.equal(mesh.geometry.attributes.uv,undefined);
});

test('only an owned bamboo PBR clone receives fibre shading; source buffers, color and material restore exactly',()=>{
 const before=originalBuffers(),source=mesh.material,normal=mesh.geometry.attributes.normal,position=mesh.geometry.attributes.position,index=mesh.geometry.index;
 const appearance=installXRBambooAppearance(gltf.scene),clone=mesh.material;let disposed=0;clone.addEventListener('dispose',()=>disposed++);
 try{
  const report=appearance.inspect();assert.equal(report.sweeps,384);assert.equal(report.materials,1);assert.equal(report.bitmapTextures,0);assert.equal(report.sourceGeometryChanged,false);
  assert.notEqual(clone,source);assert(clone.isMeshStandardMaterial);assert(clone.color.equals(source.color));assert.equal(source.roughness,1);assert.equal(clone.roughness,.61);assert.equal(clone.metalness,0);assert.equal(clone.transparent,source.transparent);assert.equal(clone.side,source.side);
  assert.equal(mesh.geometry.attributes.position,position);assert.equal(mesh.geometry.attributes.normal,normal);assert.equal(mesh.geometry.index,index);assert.deepEqual(originalBuffers(),before);
  const shader={uniforms:{},vertexShader:T.ShaderLib.standard.vertexShader,fragmentShader:T.ShaderLib.standard.fragmentShader};clone.onBeforeCompile(shader,{});
  assert(shader.vertexShader.includes('vXRBamboo = xrBambooCoordinate;'));assert(shader.vertexShader.includes('#include <begin_vertex>'));
  assert(shader.fragmentShader.includes('fwidth(phase)'));assert(shader.fragmentShader.includes('roughnessFactor = clamp'));
  assert(shader.fragmentShader.includes('dFdx(xrPhaseA)'));assert(!shader.fragmentShader.includes('dFdx(xrFibre)'),'Never differentiate the derivative-based anti-aliasing mask');
  assert(shader.fragmentShader.includes('#include <lights_physical_fragment>'));assert(shader.fragmentShader.includes('#include <tonemapping_fragment>'));assert(shader.fragmentShader.includes('#include <colorspace_fragment>'));
  assert.equal(source.onBeforeCompile.toString().includes('xrBamboo'),false);
 }finally{appearance.dispose();appearance.dispose();}
 assert.equal(disposed,1);assert.equal(mesh.material,source);assert.equal(mesh.geometry.attributes.xrBambooCoordinate,undefined);assert.deepEqual(originalBuffers(),before);assert.equal(appearance.inspect().disposed,true);
});

test('unrelated topology cannot silently acquire a fabricated bamboo direction',()=>{
 const geometry=new T.BoxGeometry(),source=new T.MeshStandardMaterial(),root=new T.Group(),node=new T.Mesh(geometry,source);root.add(node);
 const appearance=installXRBambooAppearance(root);
 try{assert.equal(deriveXRBambooCoordinates(geometry),null);assert.equal(appearance.inspect().sweeps,0);assert.equal(node.material,source);}
 finally{appearance.dispose();geometry.dispose();source.dispose();}
});
