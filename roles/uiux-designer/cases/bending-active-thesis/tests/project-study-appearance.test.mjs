import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {installProjectStudyAppearance} from '../components/project-study-appearance.mjs';

const close=(actual,expected,epsilon=1e-12)=>assert(Math.abs(actual-expected)<=epsilon,`${actual} differs from ${expected}`);
const vectorClose=(actual,expected)=>{assert.equal(actual.length,expected.length);actual.forEach((value,i)=>close(value,expected[i]));};
function fixture({material=new T.MeshStandardMaterial({color:'#bdc1c6',metalness:.3,roughness:.6,side:T.DoubleSide}),count=1,points=false,pointCount=3}={}){
 const scene=new T.Scene(),source=new T.Group(),geometry=new T.BufferGeometry();
 const positions=points?Float32Array.from({length:pointCount*3},(_,i)=>i*.00001):new Float32Array([0,0,0,1,0,0,0,1,0]);
 geometry.setAttribute('position',new T.BufferAttribute(positions,3));
 if(!points){geometry.setAttribute('normal',new T.Float32BufferAttribute([0,0,1,0,0,1,0,0,1],3));geometry.setAttribute('uv',new T.Float32BufferAttribute([0,0,1,0,0,1],2));geometry.setIndex([0,1,2]);}
 source.position.set(3,5,-2);source.rotation.set(.2,.3,.1);source.scale.setScalar(.001);
 const nodes=[];for(let i=0;i<count;i++){const node=points?new T.Points(geometry,material):new T.Mesh(geometry,material);node.position.set(i*.01,i*.02,-i*.03);node.onBeforeRender=()=>{};source.add(node);nodes.push(node);}
 scene.add(source);source.updateWorldMatrix(true,true);
 const bounds={min:[-1,2,4],max:[2,6,9]},renderer={outputColorSpace:T.SRGBColorSpace,toneMapping:T.ACESFilmicToneMapping,toneMappingExposure:1,transmissionResolutionScale:1,shadowMap:{enabled:false},render(){throw Error('Appearance must not render or own a clock');}};
 let generations=0,environmentDisposals=0;const targets=[],options=[];
 const createEnvironment=option=>{generations++;options.push(option);const target={width:384,height:512,texture:new T.Texture(),dispose(){environmentDisposals++;}};targets.push(target);return target;};
 const install=(projectId,extra={})=>installProjectStudyAppearance({scene,source,renderer,bounds,projectId,createEnvironment,...extra});
 return{scene,source,geometry,material,nodes,bounds,renderer,install,createEnvironment,targets,options,get generations(){return generations;},get environmentDisposals(){return environmentDisposals;}};
}
function protectSource(f){
 const geometry=f.geometry,attributes=Object.entries(geometry.attributes).map(([name,attribute])=>({name,attribute,array:attribute.array,bytes:Buffer.from(attribute.array.buffer,attribute.array.byteOffset,attribute.array.byteLength).toString('hex')})),index=geometry.index,indexBytes=index?Buffer.from(index.array.buffer,index.array.byteOffset,index.array.byteLength).toString('hex'):null;
 const transforms=[f.source,...f.nodes].map(node=>({node,matrix:node.matrix.toArray(),world:node.matrixWorld.toArray(),position:node.position.toArray(),quaternion:node.quaternion.toArray(),scale:node.scale.toArray(),beforeRender:node.onBeforeRender}));
 return()=>{
  for(const node of f.nodes)assert.equal(node.geometry,geometry);
  for(const {name,attribute,array,bytes}of attributes){assert.equal(geometry.attributes[name],attribute);assert.equal(attribute.array,array);assert.equal(Buffer.from(array.buffer,array.byteOffset,array.byteLength).toString('hex'),bytes);}
  assert.equal(geometry.index,index);if(index)assert.equal(Buffer.from(index.array.buffer,index.array.byteOffset,index.array.byteLength).toString('hex'),indexBytes);
  for(const before of transforms){assert.deepEqual(before.node.matrix.toArray(),before.matrix);assert.deepEqual(before.node.matrixWorld.toArray(),before.world);assert.deepEqual(before.node.position.toArray(),before.position);assert.deepEqual(before.node.quaternion.toArray(),before.quaternion);assert.deepEqual(before.node.scale.toArray(),before.scale);assert.equal(before.node.onBeforeRender,before.beforeRender);}
 };
}

for(const [id,color,metalness,roughness,intensities]of [
 ['mode-s-of-making',[.76,.77,.74],0,.88,[.32,.4,2.2,.35,.55]],
 ['entrance-installation-art',[.58,.60,.62],.9,.36,[.85,.25,2.2,.3,1]],
 ['special-assemblies',[.49,.34,.20],0,.76,[.45,.35,2,.3,.65]],
])test(`${id} installs its reviewed neutral finish without rewriting original geometry or renderer policy`,()=>{
 const f=fixture(),unchanged=protectSource(f),originalColor=f.material.color.clone(),settings={...f.renderer},lease=f.install(id),clone=f.nodes[0].material;
 assert.notEqual(clone,f.material);assert.equal(clone.type,'MeshStandardMaterial');vectorClose(clone.color.toArray(),color);assert.equal(clone.metalness,metalness);assert.equal(clone.roughness,roughness);assert.equal(clone.side,T.DoubleSide);
 assert(f.material.color.equals(originalColor));assert.equal(f.material.metalness,.3);assert.equal(f.material.roughness,.6);unchanged();assert.deepEqual(f.renderer,settings);
 const info=lease.inspect();assert.equal(info.profileID,id);assert.equal(info.environment.intensity,intensities[0]);assert.deepEqual(info.lights.map(light=>light.intensity),intensities.slice(1));assert.equal(info.environment.generations,1);assert.equal(info.environment.size,128);assert.deepEqual(info.environment.atlas,[384,512]);assert.equal(f.scene.environment,f.targets[0].texture);assert.equal(f.scene.background,null);assert.equal(f.scene.environmentRotation.y,.35);
 assert.deepEqual(f.options,[{renderer:f.renderer,size:128,sigma:.04,near:.1,far:100}]);assert.equal(lease.inspect().environment.generations,1,'Inspect and retained reading do not bake again');
 lease.dispose();unchanged();assert.equal(f.nodes[0].material,f.material);assert.equal(f.environmentDisposals,1);assert.equal(f.scene.children.length,1);assert.deepEqual(f.renderer,settings);
});

test('Caustics retains every native physical channel, alpha semantics, maps and hooks, correcting only the evidenced scalar IOR',()=>{
 const texture=new T.DataTexture(new Uint8Array([240,220,190,255]),1,1),hook=()=>{},cacheKey=()=>'original-material-hook';
 const material=new T.MeshPhysicalMaterial({color:new T.Color(1,1,1),metalness:.31024929881095886,roughness:.14681440591812134,transmission:1,opacity:.1052631139755249,transparent:false,side:T.DoubleSide,ior:1.5,thickness:.025,attenuationDistance:6.2,attenuationColor:new T.Color(.2,.3,.4),clearcoat:.21,clearcoatRoughness:.44,map:texture,normalMap:texture,bumpMap:texture,bumpScale:.19,envMapIntensity:.73});
 material.onBeforeCompile=hook;material.customProgramCacheKey=cacheKey;
 const before=material.toJSON(),f=fixture({material}),unchanged=protectSource(f),lease=f.install('hc3dp-caustics'),clone=f.nodes[0].material,after=clone.toJSON();
 assert.equal(clone.type,'MeshPhysicalMaterial');assert.equal(clone.ior,1.5700000524520874);assert.equal(material.ior,1.5);
 // Three serializes IOR through its derived reflectivity getter. This exact
 // dependency changes with IOR; it is not a second material reinterpretation.
 close(clone.reflectivity,2.5*(clone.ior-1)/(clone.ior+1));after.uuid=before.uuid;after.reflectivity=before.reflectivity;assert.deepEqual(after,before,'Every other serialized native physical channel remains unchanged');
 assert.equal(clone.onBeforeCompile,hook);assert.equal(clone.customProgramCacheKey,cacheKey);assert.equal(clone.map,texture);assert.equal(clone.normalMap,texture);assert.equal(clone.bumpMap,texture);assert.equal(clone.envMapIntensity,.73,'The recipe is not multiplied into the material');
 assert.equal(f.scene.environmentIntensity,.7);assert.equal(f.renderer.transmissionResolutionScale,1);assert.deepEqual(lease.inspect().lights.map(light=>light.intensity),[.18,1.9,.25,1.2]);assert(lease.inspect().materials[0].sourceTextureReferencesPreserved);unchanged();
 lease.dispose();assert.equal(f.nodes[0].material,material);assert.deepEqual(material.toJSON(),before);unchanged();
});

test('all 14,810 native point samples remain points with one unlit graphic clone and no environment or light rig',()=>{
 const material=new T.PointsMaterial({color:'#92b3cc',size:7,sizeAttenuation:true}),f=fixture({material,points:true,pointCount:14810}),unchanged=protectSource(f),lease=f.install('dot-based-3d-printing'),clone=f.nodes[0].material;
 assert(f.nodes[0].isPoints);assert(clone.isPointsMaterial);assert.equal(f.geometry.getAttribute('position').count,14810);assert.equal(f.geometry.index,null);assert.equal(f.geometry.getAttribute('normal'),undefined);assert.equal(f.geometry.getAttribute('uv'),undefined);
 vectorClose(clone.color.toArray(),[.48,.68,.8]);assert.equal(clone.size,2);assert.equal(clone.sizeAttenuation,false);assert.equal(clone.toneMapped,false);assert.equal(material.size,7);assert.equal(material.sizeAttenuation,true);
 assert.equal(f.generations,0);assert.equal(f.scene.environment,null);assert.equal(f.scene.environmentIntensity,0);assert.equal(f.scene.children.length,1);assert.deepEqual(lease.inspect().lights,[]);assert.equal(lease.inspect().environment.kind,'none');unchanged();
 lease.dispose();assert.equal(f.environmentDisposals,0);assert.equal(f.nodes[0].material,material);unchanged();
});

test('60 shared source parts allocate one clone and restore exact material-array identities, disposing only owned resources once',()=>{
 const f=fixture({count:60}),texture=new T.Texture(),unchanged=protectSource(f);f.material.map=texture;
 const arrays=f.nodes.map(node=>(node.material=[f.material,f.material]));let originalsDisposed=0,textureDisposed=0,geometryDisposed=0,cloneDisposals=0,cloneCalls=0;
 f.material.addEventListener('dispose',()=>originalsDisposed++);texture.addEventListener('dispose',()=>textureDisposed++);f.geometry.addEventListener('dispose',()=>geometryDisposed++);
 const originalClone=f.material.clone.bind(f.material);f.material.clone=()=>{cloneCalls++;const value=originalClone();value.addEventListener('dispose',()=>cloneDisposals++);return value;};
 const lease=f.install('special-assemblies'),clone=f.nodes[0].material[0];assert.equal(cloneCalls,1);assert.equal(lease.inspect().materialClones,1);assert.equal(lease.inspect().renderables,60);
 for(const node of f.nodes){assert.notEqual(node.material,f.material);assert.equal(node.material[0],clone);assert.equal(node.material[1],clone);assert.equal(node.material[0].map,texture);}unchanged();
 lease.dispose();lease.dispose();for(let i=0;i<f.nodes.length;i++)assert.equal(f.nodes[i].material,arrays[i]);assert.equal(cloneDisposals,1);assert.equal(f.environmentDisposals,1);assert.equal(originalsDisposed,0);assert.equal(textureDisposed,0);assert.equal(geometryDisposed,0);unchanged();
 const terminal=lease.inspect();assert.equal(terminal.phase,'disposed');assert.equal(terminal.disposed,true);assert.equal(terminal.materialsRestored,true);assert.equal(terminal.ownedMaterialClones,0);assert.equal(terminal.ownedLightObjects,0);assert.equal(terminal.environment.owned,false);assert.equal(terminal.environment.released,true);assert(terminal.lights.every(light=>light.released&&!light.targetInScene));
});

test('directional lights target the retained Caustics source center, with the reviewed normalized three-radius positions',()=>{
 const f=fixture({material:new T.MeshPhysicalMaterial()}),bounds={min:[-.5265482969693305,1.9507327777447439,5.312554589282478],max:[-.09243401815698798,2.311166207416292,5.746669524182563]},unchanged=protectSource(f),lease=f.install('hc3dp-caustics',{bounds}),info=lease.inspect(),center=[-.30949115756315926,2.130949492580518,5.529612056732521];
 vectorClose(info.frame.center,center);close(info.frame.radius,.3559575961392241);
 const expected={key:[.17858575984134212,2.775908276293609,6.226864795881809],fill:[-1.1656941804741314,2.4163505002175087,6.100414072006503],rim:[-.7263460104097833,2.652018058638798,4.695902351039273]};
 for(const light of info.lights.filter(light=>light.role!=='hemisphere')){vectorClose(light.target,center);vectorClose(light.position,expected[light.role]);assert.equal(light.targetInScene,true);assert.equal(light.castShadow,false);close(new T.Vector3().fromArray(light.position).distanceTo(new T.Vector3().fromArray(center)),info.frame.radius*3);}
 vectorClose(info.lights[0].color,new T.Color('#d9e3ef').toArray());vectorClose(info.lights[0].groundColor,new T.Color('#4a4138').toArray());unchanged();lease.dispose();unchanged();
});

test('an unknown fixture is source-only and never changes existing scene state, clones, lights or environment',()=>{
 const f=fixture(),environment=new T.Texture(),background=new T.Color('#334455');f.scene.environment=environment;f.scene.background=background;f.scene.environmentIntensity=.81;f.scene.environmentRotation.set(.1,.2,.3);let cloned=0;f.material.clone=()=>{cloned++;throw Error('Unknown profile cannot clone source');};
 const lease=f.install('source-fixture',{bounds:null,createEnvironment(){throw Error('Unknown profile cannot bake');}});assert.equal(lease.inspect().profileID,'source-only');assert.equal(lease.inspect().materialClones,0);assert.equal(lease.inspect().environment.generations,0);assert.deepEqual(lease.inspect().lights,[]);lease.dispose();
 assert.equal(cloned,0);assert.equal(f.scene.environment,environment);assert.equal(f.scene.background,background);assert.equal(f.scene.environmentIntensity,.81);vectorClose(f.scene.environmentRotation.toArray().slice(0,3),[.1,.2,.3]);assert.equal(f.scene.children.length,1);assert.equal(f.nodes[0].material,f.material);
});

test('source and scene have one appearance owner; released sources can be acquired again without sharing a disposed environment',()=>{
 const f=fixture(),first=f.install('mode-s-of-making');assert.throws(()=>f.install('mode-s-of-making'),/active owner/);assert.equal(f.generations,1);
 first.dispose();const second=f.install('mode-s-of-making');assert.equal(f.generations,2);assert.notEqual(f.targets[0],f.targets[1]);assert.equal(second.inspect().environment.generations,1);second.dispose();assert.equal(f.environmentDisposals,2);
});

test('a later source-material clone failure rolls back earlier assignments, environment and ownership before throwing',()=>{
 const f=fixture({count:2}),originals=f.nodes.map(node=>node.material),bad=new T.MeshStandardMaterial();f.nodes[1].material=bad;let cloneDisposals=0;const clone=f.material.clone.bind(f.material);f.material.clone=()=>{const value=clone();value.addEventListener('dispose',()=>cloneDisposals++);return value;};bad.clone=()=>{throw Error('Deliberate later material failure');};
 const previous=new T.Texture(),background=new T.Color('#102030');f.scene.environment=previous;f.scene.environmentIntensity=.9;f.scene.background=background;f.scene.environmentRotation.set(.2,.4,.6);
 assert.throws(()=>f.install('entrance-installation-art'),/later material failure/);assert.equal(f.nodes[0].material,originals[0]);assert.equal(f.nodes[1].material,bad);assert.equal(cloneDisposals,1);assert.equal(f.environmentDisposals,1);assert.equal(f.scene.environment,previous);assert.equal(f.scene.background,background);assert.equal(f.scene.environmentIntensity,.9);vectorClose(f.scene.environmentRotation.toArray().slice(0,3),[.2,.4,.6]);assert.equal(f.scene.children.length,1);
 f.nodes[1].material=f.material;const recovered=f.install('entrance-installation-art');recovered.dispose();assert.equal(f.environmentDisposals,2,'Rollback released the source/scene ownership reservation');
});

test('failure while adding the rig removes already-added lights and releases the returned PMREM and clones',()=>{
 const f=fixture(),unchanged=protectSource(f),add=f.scene.add;f.scene.add=function(...objects){if(objects.some(object=>object.isDirectionalLight))throw Error('Deliberate rig insertion failure');return add.apply(this,objects);};
 assert.throws(()=>f.install('special-assemblies'),/rig insertion failure/);assert.equal(f.scene.children.length,1);assert.equal(f.scene.children[0],f.source);assert.equal(f.nodes[0].material,f.material);assert.equal(f.scene.environment,null);assert.equal(f.environmentDisposals,1);unchanged();
 f.scene.add=add;const next=f.install('special-assemblies');next.dispose();assert.equal(f.environmentDisposals,2);
});

test('invalid bounds fail before allocation and an incomplete environment is released before any source mutation',()=>{
 const f=fixture(),unchanged=protectSource(f);assert.throws(()=>f.install('mode-s-of-making',{bounds:{min:[0,0,0],max:[0,0,0]}}),/Nonempty/);assert.equal(f.generations,0);assert.equal(f.nodes[0].material,f.material);
 let released=0;assert.throws(()=>f.install('mode-s-of-making',{createEnvironment:()=>({width:1,height:1,texture:new T.Texture(),dispose(){released++;}})}),/complete 128-face/);assert.equal(released,1);assert.equal(f.nodes[0].material,f.material);assert.equal(f.scene.environment,null);assert.equal(f.scene.children.length,1);unchanged();
 const recovered=f.install('mode-s-of-making');recovered.dispose();
});

test('an environment factory failure restores prior scene state without acquiring or disposing source resources',()=>{
 const f=fixture(),environment=new T.Texture(),unchanged=protectSource(f);f.scene.environment=environment;f.scene.environmentIntensity=.7;let factoryCleanup=0;
 assert.throws(()=>f.install('mode-s-of-making',{createEnvironment(){try{throw Error('Deliberate incomplete bake');}finally{factoryCleanup++;}}}),/incomplete bake/);assert.equal(factoryCleanup,1,'The factory owns a bake that never returns a target');assert.equal(f.environmentDisposals,0);assert.equal(f.scene.environment,environment);assert.equal(f.scene.environmentIntensity,.7);assert.equal(f.nodes[0].material,f.material);unchanged();
 const recovered=f.install('mode-s-of-making');recovered.dispose();
});
