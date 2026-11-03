import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {MeshoptDecoder} from 'three/addons/libs/meshopt_decoder.module.js';
const release=new URL('../release/',import.meta.url);
const manifest=JSON.parse(readFileSync(new URL('manifest.json',release),'utf8'));
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
function glb(file){const bytes=readFileSync(new URL('public/assets/projects/'+file,release)),size=bytes.readUInt32LE(12);return{bytes,json:JSON.parse(bytes.subarray(20,20+size)),binary:bytes.subarray(28+size)};}
const recipes=[
 {folder:'mode-s-of-making',original:'machine.glb',selected:'machine-materials.glb',originalHash:'3dbd3909d3eca07c765aa77f070231d3b0830b5de534f6520cce79138d86d382',selectedHash:'4b70d53fe51ed04e039285d797c1ead2babf027ffc05244b45080757a5877da9',attribute:'_SURFACE_FAMILY',count:503822,components:1,counts:[39244,356698,74494,3033,394,4755,17632,1196,24,6352]},
 {folder:'project-caschlatsch',original:'model.glb',selected:'model-materials.glb',originalHash:'4623278f7d9148d0ccdfd0080eb3f44dac36adb07bd6b8283b2863a7b9ad8f27',selectedHash:'4cf15112d405619ec27bc82fb81738f12d2da222ac1b720fd79f970a53af3e93',attribute:'_FIBER_AXIS',count:61362,components:3},
];
for(const recipe of recipes)test(`${recipe.folder} surface derivative retains every original geometry byte and one primitive`,async()=>{
 const original=glb(recipe.folder+'/'+recipe.original),selected=glb(recipe.folder+'/'+recipe.selected);
 assert.equal(sha(original.bytes),recipe.originalHash);assert.equal(sha(selected.bytes),recipe.selectedHash);
 for(const [name,source]of [[recipe.original,original],[recipe.selected,selected]]){
  const pin=manifest.assets.find(asset=>asset.path===`assets/projects/${recipe.folder}/${name}`);
  assert(pin,'Original and additive derivative both remain pinned');assert.equal(pin.bytes,source.bytes.length);assert.equal(pin.sha256,sha(source.bytes));
 }
 assert.deepEqual(selected.json.bufferViews.slice(0,4),original.json.bufferViews);
 assert.deepEqual(selected.json.accessors.slice(0,4),original.json.accessors);
 assert.deepEqual(selected.binary.subarray(0,original.binary.length),original.binary);
 assert.equal(selected.json.meshes.length,1);assert.equal(selected.json.meshes[0].primitives.length,1);
 const originalPrimitive=original.json.meshes[0].primitives[0],selectedPrimitive=structuredClone(selected.json.meshes[0].primitives[0]);
 delete selectedPrimitive.attributes[recipe.attribute];assert.deepEqual(selectedPrimitive,originalPrimitive);
 const loader=new GLTFLoader().setMeshoptDecoder(MeshoptDecoder),buffer=selected.bytes.buffer.slice(selected.bytes.byteOffset,selected.bytes.byteOffset+selected.bytes.byteLength);
 const loaded=await loader.parseAsync(buffer,''),mesh=loaded.scene.children[0],attribute=mesh.geometry.getAttribute(recipe.attribute.toLowerCase());
 assert.equal(attribute.count,recipe.count);assert.equal(attribute.itemSize,recipe.components);assert.equal(mesh.geometry.groups.length,0,'Family rendering adds no material groups/draws');
 if(recipe.counts){
  const counts=Array(10).fill(0);for(const value of attribute.array){assert(Number.isInteger(value)&&value>=0&&value<=9);counts[value]++;}assert.deepEqual(counts,recipe.counts);
 }else for(let i=0;i<attribute.count;i++)assert(Math.abs(Math.hypot(attribute.getX(i),attribute.getY(i),attribute.getZ(i))-1)<1e-6,'Every timber fibre axis is a finite unit vector');
 const indices=mesh.geometry.index.array;
 for(let i=0;i<indices.length;i+=3)for(let c=0;c<recipe.components;c++){
  const value=attribute.array[indices[i]*recipe.components+c];assert.equal(value,attribute.array[indices[i+1]*recipe.components+c]);assert.equal(value,attribute.array[indices[i+2]*recipe.components+c]);
 }
 mesh.geometry.dispose();mesh.material.dispose();
});
