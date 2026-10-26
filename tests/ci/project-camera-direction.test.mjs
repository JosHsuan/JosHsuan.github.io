import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';
import {GENERIC_PROJECT_CAMERA_KEYS} from '../../roles/uiux-designer/cases/bending-active-thesis/runtime/motion/authored-project-camera-scores.mjs';
const root=new URL('../../roles/uiux-designer/cases/bending-active-thesis/',import.meta.url);
const projects=JSON.parse(await readFile(new URL('release/project-studies.json',root),'utf8')).projects;
const cases=projects.filter(project=>project.model);

test('authored camera direction covers every generic model without inventing a Caschlatsch model',()=>{
 assert.deepEqual(cases.map(p=>p.id),['mode-s-of-making','entrance-installation-art','dot-based-3d-printing','hc3dp-caustics','special-assemblies']);
 assert.equal(projects.find(p=>p.id==='project-caschlatsch').model,undefined);
 for(const {id,model} of cases){
  const path=model.cameraPath;
  assert.deepEqual(path,GENERIC_PROJECT_CAMERA_KEYS[id],'pinned release data must consume the exact authored score');
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
   assert.ok(key.fovDeg>=31&&key.fovDeg<=44,'authored lens range remains deliberate and bounded');
   assert.ok(key.zoom>=1&&key.zoom<=1.18,'full source fitting precedes exterior dolly/lens reframing; no rejected Dot crop');
   assert.ok(key.pitchRad>=.1&&key.pitchRad<=.82,'crane stays above the datum and clear of a pole singularity');
  }
  assert.ok(Math.max(...path.map(key=>key.yawRad))-Math.min(...path.map(key=>key.yawRad))>2.4,'bolder complementary-side arc replaces the old small-angle pass');
  assert.ok(Math.max(...path.map(key=>key.pitchRad))>=.7,'authored upper relationship receives a real crane view');
  // Legacy source-view recipes remain pinned by the protected-case digest below;
  // the owner now explicitly requests a different, bolder editorial opening.
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
test('native scroll alone owns the authored view without model gestures, source actions or reading-mode controls',async()=>{
 const component=await readFile(new URL('components/ProjectCaseStudy.jsx',root),'utf8');
 const presenter=await readFile(new URL('runtime/site/ProjectStudyScenePresenter.mjs',root),'utf8');
 const controls=await readFile(new URL('components/ProjectCaseStudyControls.jsx',root),'utf8');
 assert.match(component,/data-project-reading="scroll"/);
 assert.match(presenter,/root\.getAttribute\('data-project-reading'\)!=='scroll'&&canPresent\(\)/,'the actual pointer/keyboard inspection gate rejects the public scroll-only route');
 assert.doesNotMatch(component,/data-project-model-(?:target|help|reset)|data-project-motion-(?:toggle|source|replay)/);
 assert.match(controls,/<div hidden/);assert.doesNotMatch(controls,/<button\b|<a\b|<input\b|<select\b/);
 assert.doesNotMatch(component,/drag horizontally|Drag the model|Home or Escape returns|Return to scroll view/);
 for(const {model} of cases)assert.doesNotMatch(model.alt,/\bdrag\b/i);
});

const protectedCaseHashes={
 "mode-s-of-making": "f9fddd9ff143121d989f5d2d7bab34e3f6d5442aa648772aed1481bb8544e8e6",
 "entrance-installation-art": "fae4716ed78f692062f483dcecfbb2085c02d8dcbfe536bf89a02c22a6110e66",
 "dot-based-3d-printing": "4d6f8b85a87c315a1e015c726e43c4a9cf10f07d5d006024d0e5a0110c9a9575",
 "hc3dp-caustics": "7f8858c96d92da4a40ceb4263cfb7738bec11ef300c1fdac6af533246bd84aa2",
 "special-assemblies": "fe13ac6b75d9baddd1c674b3c77c3ae7be98c48f50f3d9fbc63452576abaeb56",
 "project-caschlatsch": "e5dc8f6f3f6a4cf957146b75569b9c1e2c7ff22e3ff8179103e85a34e988a77a"
};
// Three narrative digests advanced only after independently pinned source contracts
// in three-case-narrative.test.mjs passed; the other three digests stay unchanged.
test('approved case snapshots remain fixed apart from separately tested camera paths',async()=>{
 const {createHash}=await import('node:crypto');
 for(const project of projects){
  const protectedCopy=structuredClone(project);
  if(protectedCopy.model)delete protectedCopy.model.cameraPath;
  assert.equal(createHash('sha256').update(JSON.stringify(protectedCopy)).digest('hex'),protectedCaseHashes[project.id]);
 }
});
