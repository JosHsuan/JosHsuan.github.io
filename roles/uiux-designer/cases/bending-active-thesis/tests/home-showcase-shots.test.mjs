import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {MeshoptDecoder} from 'three/addons/libs/meshopt_decoder.module.js';
import {createHomeShowcaseShotPlan} from '../runtime/site/HomeShowcaseShots.mjs';
import {projectStudyShowcasePose} from '../components/project-study-scene.mjs';
import studies from '../release/project-studies.json' with {type:'json'};

const sources=studies.projects.flatMap(project=>[project.model,...project.additionalModels??[]].filter(Boolean).map(model=>({id:project.id,model})));
const cameraFor=(shot,width,height)=>{
 const pose=projectStudyShowcasePose(shot),camera=new T.PerspectiveCamera(pose.fov,width/height,pose.near,pose.far);
 camera.filmGauge=pose.filmGaugeMm;camera.position.fromArray(pose.position);camera.up.fromArray(pose.up);camera.setViewOffset(width,height,width*(.5-pose.frame.x),height*(.5-pose.frame.y),width,height);camera.lookAt(...pose.target);camera.updateProjectionMatrix();camera.updateMatrixWorld(true);return camera;
};

test('Home source scores are deterministic, scale-aware and continuous across authored shot joins',()=>{
 assert.equal(sources.length,7);const before=structuredClone(sources);
 for(const source of sources){
  const plan=createHomeShowcaseShotPlan(source);assert(plan.duration>=12&&plan.duration<=20);assert.equal(plan.shots.length,5);
  const first=plan.sample({seconds:0,aspect:1.6});assert.equal(first.time,0);assert.deepEqual(plan.sample({seconds:plan.duration+1,aspect:1.6}),plan.sample({seconds:plan.duration,aspect:1.6}));
  assert(plan.shots.some(shot=>shot.coverage==='partial'));assert(new Set(plan.shots.map(shot=>shot.focalLengthMm)).size>=3);
  if(plan.architecture){assert(Math.abs(first.position[1]-source.model.bounds.min[1]-1.65)<1e-12);assert(first.target[1]>first.position[1]);}
  for(const {at}of plan.shots.slice(1,-1)){
   const left=plan.sample({seconds:at-.0001,aspect:1.6}),right=plan.sample({seconds:at+.0001,aspect:1.6});
   assert(Math.hypot(...left.position.map((value,i)=>value-right.position[i]))<.00001);assert(Math.hypot(...left.target.map((value,i)=>value-right.target[i]))<.00001);assert(Math.abs(left.focalLengthMm-right.focalLengthMm)<.00001);
  }
  const mobile=plan.sample({seconds:plan.duration*.5,aspect:390/844});assert.deepEqual(mobile.frame,{x:.57,y:.3});assert(mobile.fovDeg>first.fovDeg||mobile.focalLengthMm>first.focalLengthMm);
  first.position[0]=999;assert.notEqual(plan.sample({seconds:0,aspect:1.6}).position[0],999);
 }
 assert.deepEqual(sources,before,'Shot sampling cannot normalize or rewrite original source coordinates');
 const machine=createHomeShowcaseShotPlan(sources.find(source=>source.model.id==='machine'||/\/machine(?:-materials)?\.glb$/.test(source.model.src)));
 assert.equal(machine.id,'mode-s-machine');assert.deepEqual(machine.sample({seconds:7.5,aspect:1.6}).target,[-.08755,.155,.17928]);assert.deepEqual(machine.sample({seconds:11.5,aspect:1.6}).target,[-.00978,.15,.0834]);
 assert.throws(()=>createHomeShowcaseShotPlan({id:'fictional',model:sources[0].model}),/No authored/);
 assert.throws(()=>createHomeShowcaseShotPlan({id:sources[0].id,model:{bounds:{min:[0,0,0],max:[0,0,0]}}}),/Nonempty/);
 assert.throws(()=>machine.sample({seconds:NaN,aspect:1.6}),/Finite/);
});

test('every authored Home shot contains real pinned source vertices and each source has genuine partial crops',async()=>{
 const records=[];
 for(const source of sources){
  const bytes=await readFile(new URL('../release/public'+source.model.src,import.meta.url));
  assert.equal(createHash('sha256').update(bytes).digest('hex'),source.model.sha256);
  const gltf=await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
  gltf.scene.updateWorldMatrix(true,true);const point=new T.Vector3(),objects=[];
  gltf.scene.traverse(node=>{if(node.isMesh||node.isPoints)objects.push(node);});
  const original=objects.map(node=>({position:node.position.toArray(),scale:node.scale.toArray(),quaternion:node.quaternion.toArray()}));
  const plan=createHomeShowcaseShotPlan(source);let cropped=false;
  for(const [width,height]of[[1440,900],[390,844]])for(const fraction of[0,.125,.25,.375,.5,.625,.75,.875,1]){
   const shot=plan.sample({seconds:plan.duration*fraction,aspect:width/height}),camera=cameraFor(shot,width,height);let visible=0,total=0;
   assert(Math.abs(camera.getFocalLength()-shot.focalLengthMm)<1e-10,'Declared focal length must agree with the final Three camera aperture');
   const projection=new T.Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);
   for(const object of objects){
    const attribute=object.geometry.getAttribute('position'),matrix=new T.Matrix4().multiplyMatrices(projection,object.matrixWorld);
    for(let index=0;index<attribute.count;index++){point.fromBufferAttribute(attribute,index).applyMatrix4(matrix);total++;if(point.x>=-1&&point.x<=1&&point.y>=-1&&point.y<=1&&point.z>=-1&&point.z<=1)visible++;}
   }
   assert.equal(total,source.model.vertices);assert(visible>=Math.min(30,total*.001),plan.id+' '+width+'×'+height+' '+shot.time+'s has no meaningful visible source: '+visible+'/'+total);
   if(shot.coverage==='partial'&&visible<total*.98)cropped=true;
   records.push({id:plan.id,width,height,time:shot.time,visible,total});
  }
  assert(cropped,plan.id+' must have an authored detail crop instead of fitting every vertex throughout');
  assert.deepEqual(objects.map(node=>({position:node.position.toArray(),scale:node.scale.toArray(),quaternion:node.quaternion.toArray()})),original);
  const geometries=new Set(),materials=new Set();for(const object of objects){geometries.add(object.geometry);for(const material of Array.isArray(object.material)?object.material:[object.material])materials.add(material);}for(const geometry of geometries)geometry.dispose();for(const material of materials)material.dispose();
 }
 assert.equal(records.length,126);
});
