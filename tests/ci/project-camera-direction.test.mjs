import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';
const root=new URL('../../roles/uiux-designer/cases/bending-active-thesis/',import.meta.url);
const projects=JSON.parse(await readFile(new URL('release/project-studies.json',root),'utf8')).projects;
const cases=projects.filter(project=>project.model);

test('authored camera direction covers every generic model without inventing a Caschlatsch model',()=>{
 assert.deepEqual(cases.map(p=>p.id),['mode-s-of-making','entrance-installation-art','dot-based-3d-printing','hc3dp-caustics','special-assemblies']);
 assert.equal(projects.find(p=>p.id==='project-caschlatsch').model,undefined);
 for(const {model} of cases){
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
   assert.equal(key.fovDeg,36);assert.equal(key.zoom,1.04);
   assert.ok(Math.abs(key.pitchRad)<=.42,'first authored pass stays within bounded oblique views');
  }
  const reference=model.views[model.chapters[0]];
  assert.deepEqual([path[0].yawRad,path[0].pitchRad],[reference.yaw,reference.pitch]);
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
 for(const {model} of cases)assert.doesNotMatch(model.alt,/\bdrag\b/i);
});

const protectedCaseHashes={
 "mode-s-of-making": "f9fddd9ff143121d989f5d2d7bab34e3f6d5442aa648772aed1481bb8544e8e6",
 "entrance-installation-art": "fae4716ed78f692062f483dcecfbb2085c02d8dcbfe536bf89a02c22a6110e66",
 "dot-based-3d-printing": "cc3e422f62aa6bff1c560647c7729209e134369e00125b57826380cca7ada8ec",
 "hc3dp-caustics": "7f8858c96d92da4a40ceb4263cfb7738bec11ef300c1fdac6af533246bd84aa2",
 "special-assemblies": "2a88ce084ce03dae280fac96ce2f5eafb84fabeae4a657c466c064570efbbb8f",
 "project-caschlatsch": "7c21805f54245e858bf108389048190cfe3fca8e393d41aa47171024776cd120"
};
test('only cameraPath and two obsolete imperative sentences change case data',async()=>{
 const {createHash}=await import('node:crypto');
 for(const project of projects){
  const protectedCopy=structuredClone(project);
  if(protectedCopy.model)delete protectedCopy.model.cameraPath;
  assert.equal(createHash('sha256').update(JSON.stringify(protectedCopy)).digest('hex'),protectedCaseHashes[project.id]);
 }
});
