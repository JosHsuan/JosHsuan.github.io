import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';
import {projectStudyModels} from '../../scripts/project-studies.mjs';
import {fitResearchCamera} from '../../roles/uiux-designer/cases/bending-active-thesis/components/research-scene-geometry.mjs';
const root=new URL('../../roles/uiux-designer/cases/bending-active-thesis/',import.meta.url);
const projects=JSON.parse(await readFile(new URL('release/project-studies.json',root),'utf8')).projects;
const cases=projects.filter(project=>project.model),models=projects.flatMap(project=>projectStudyModels(project).map(model=>({project,model})));

test('authored camera direction covers all seven source assemblies with bounded lens changes',()=>{
 assert.deepEqual(cases.map(p=>p.id),['mode-s-of-making','entrance-installation-art','dot-based-3d-printing','hc3dp-caustics','special-assemblies','project-caschlatsch']);
 assert.equal(models.length,7);
 for(const {project,model} of models){
  const path=model.cameraPath;
  assert.ok(path.length>=3);
  assert.equal(path[0].chapter,model.chapters[0]);assert.equal(path[0].progress,0);
  assert.equal(path.at(-1).chapter,model.chapters.at(-1));assert.equal(path.at(-1).progress,1);
  let previous=-1;
  for(const key of path){
   assert.deepEqual(Object.keys(key),['chapter','progress','yawRad','pitchRad','fovDeg','zoom']);
   assert.ok(model.chapters.includes(key.chapter));
   assert.ok(Number.isFinite(key.progress)&&key.progress>=0&&key.progress<=1);
   const order=model.chapters.indexOf(key.chapter)+key.progress;
   assert.ok(order>previous,'shared chapter boundary must not create a duplicate anchor');previous=order;
   assert.ok(Number.isFinite(key.yawRad)&&Number.isFinite(key.pitchRad));
   assert.ok(key.fovDeg>=30&&key.fovDeg<=42,'reviewed product and architectural lens range');
   assert.ok(key.zoom>=1&&key.zoom<=1.1,'complete-source fit, without cropping or a remote subject');
   const architectural=['entrance-installation-art','project-caschlatsch'].includes(project.id);
   assert.ok(key.pitchRad>=(architectural?-.16:-.1)&&key.pitchRad<=.42,'source-scale-specific eye elevation');
  }
  assert.ok(new Set(path.map(key=>key.fovDeg)).size>=2,'lens progression is authored, not a fixed field of view');
 }
});
test('the two architectural openings keep a human-height eye above their actual source base',()=>{
 for(const id of ['entrance-installation-art','project-caschlatsch']){
  const {model}=projects.find(project=>project.id===id),support=[];
  for(const x of [model.bounds.min[0],model.bounds.max[0]])for(const y of [model.bounds.min[1],model.bounds.max[1]])for(const z of [model.bounds.min[2],model.bounds.max[2]])support.push(x,y,z);
  for(const [width,height] of [[1440,900],[390,844]]){
   // Match the production study aperture, not the full browser rectangle.
   const slot=width>=800?{width:.51,height:.78}:{width:.94,height:.45};
   const aspect=width*slot.width/(height*slot.height);
   const start=model.cameraPath[0],end=model.cameraPath.at(-1);
   const fit=key=>fitResearchCamera(support,aspect,{yaw:key.yawRad,pitch:key.pitchRad,fov:key.fovDeg,zoom:key.zoom});
   const firstEye=fit(start).position[1]-model.bounds.min[1],lastEye=fit(end).position[1]-model.bounds.min[1];
   assert.ok(firstEye>=1.5&&firstEye<=1.9,id+' human-height opening');
   assert.ok(lastEye>firstEye&&lastEye<model.bounds.max[1]-model.bounds.min[1],id+' rising exterior sweep');
   assert.ok(start.fovDeg>end.fovDeg,'wider establishing lens to longer closing lens');
  }
 }
});
test('Mode and Dot have genuine within-section paths rather than repeated fixed poses',()=>{
 for(const id of ['mode-s-of-making','dot-based-3d-printing']){
  const {model}=projects.find(p=>p.id===id);
  assert.ok(model.cameraPath.some((key,index,all)=>index>0&&key.chapter===all[index-1].chapter&&Math.abs(key.yawRad-all[index-1].yawRad)>=.1));
 }
 const mode=projects.find(p=>p.id==='mode-s-of-making').model;
 assert.deepEqual(mode.views.context,mode.views.system,'original equal endpoints remain research references');
 const dot=projects.find(p=>p.id==='dot-based-3d-printing').model;
 assert.equal(dot.primitive,'points');assert.equal(dot.triangles,0);assert.equal(dot.vertices,14810);
});
test('native reading leads optional keyboard inspection without a drag instruction',async()=>{
 const component=await readFile(new URL('components/ProjectCaseStudy.jsx',root),'utf8');
 assert.match(component,/Scroll to follow the camera/);
 assert.match(component,/Home or Escape returns to the current scroll view/);
 assert.match(component,/Return to scroll view/);
 assert.doesNotMatch(component,/drag horizontally|Drag the model/);
 for(const {model} of models)assert.doesNotMatch(model.alt,/\bdrag\b/i);
});

const protectedCaseHashes={
 "mode-s-of-making": "f9fddd9ff143121d989f5d2d7bab34e3f6d5442aa648772aed1481bb8544e8e6",
 "entrance-installation-art": "fae4716ed78f692062f483dcecfbb2085c02d8dcbfe536bf89a02c22a6110e66",
 "dot-based-3d-printing": "4d6f8b85a87c315a1e015c726e43c4a9cf10f07d5d006024d0e5a0110c9a9575",
 "hc3dp-caustics": "7f8858c96d92da4a40ceb4263cfb7738bec11ef300c1fdac6af533246bd84aa2",
 "special-assemblies": "fe13ac6b75d9baddd1c674b3c77c3ae7be98c48f50f3d9fbc63452576abaeb56",
 "project-caschlatsch": "e5dc8f6f3f6a4cf957146b75569b9c1e2c7ff22e3ff8179103e85a34e988a77a"
};
// These original digests are unchanged. The new machine chapter/source and
// Caschlatsch source have their own exact byte/provenance tests; exclude only
// those reviewed additions and the separately tested authored camera paths.
test('original case records stay fixed outside the reviewed camera and source additions',async()=>{
 const {createHash}=await import('node:crypto');
 for(const project of projects){
  const protectedCopy=structuredClone(project);
  if(project.id==='mode-s-of-making'){
   delete protectedCopy.additionalModels;
   protectedCopy.sections=protectedCopy.sections.filter(section=>section.id!=='mechanism');
  }
  if(project.id==='project-caschlatsch')delete protectedCopy.model;
  if(protectedCopy.model)delete protectedCopy.model.cameraPath;
  assert.equal(createHash('sha256').update(JSON.stringify(protectedCopy)).digest('hex'),protectedCaseHashes[project.id]);
 }
});
