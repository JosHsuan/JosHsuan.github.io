import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {BENDING_SCROLL_ORIENTATION as path,createSourceScrollOrientation,sampleSourceScrollOrientation as sample} from '../components/source-scroll-orientation.mjs';
import {prepareSourceFamilies,resolveSourceSelection,sampleSourceScenePose} from '../components/source-scene-score.mjs';
import {createHash} from 'node:crypto';
// Exact JSON pose-grid digest sampled from unmodified 8afd5bc, Node 24.19.0.
const BASELINE_POSE_SHA256='5f0793b82eb3e54e5493f5ea63dec98c6ad062d9a5d69ff7dba3e859f53bd143';
import {sampleChapterScene} from '../components/chapter-scene-score.mjs';
const metadata=JSON.parse(await readFile(new URL('../release/public/assets/thesis/source-diagrams.json',import.meta.url)));
const families=prepareSourceFamilies(metadata,{bounds:{min:[-1.3,-.01,-1.6],max:[1.3,.97,1.6]},revision:'test-assembly'});
const zero={azimuthOffsetDeg:0,elevationOffsetDeg:0};
test('authored endpoints are exact, reverse is deterministic and absence span neutral',()=>{
 for(const key of path)assert.deepEqual(sample(path,key.at),{azimuthOffsetDeg:key.azimuthOffsetDeg,elevationOffsetDeg:key.elevationOffsetDeg});
 const forward=Array.from({length:701},(_,i)=>sample(path,i/700));
 for(let i=700;i>=0;i--)assert.deepEqual(sample(path,i/700),forward[i]);
 for(let i=400;i<=600;i++)assert.deepEqual(sample(path,i/700),zero);
 assert.deepEqual(sample(path,-1),zero);assert.deepEqual(sample(path,2),zero);
 for(const pose of forward){assert.ok(Math.abs(pose.azimuthOffsetDeg)<=48);assert.ok(pose.elevationOffsetDeg>=0&&pose.elevationOffsetDeg<=26);}
});
test('every key and semantic chapter join is continuous with no reset',()=>{
 for(const u of [...path.map(k=>k.at),...Array.from({length:6},(_,i)=>(i+1)/7)]){
  const a=sample(path,u-1e-7),b=sample(path,u+1e-7);
  assert.ok(Math.abs(a.azimuthOffsetDeg-b.azimuthOffsetDeg)<.0001);assert.ok(Math.abs(a.elevationOffsetDeg-b.elevationOffsetDeg)<.0001);
 }
});
test('finite inputs, ownership and reduced policy fail closed; no time dependency',()=>{
 for(const value of [NaN,Infinity,-Infinity,undefined,'0.5'])assert.throws(()=>sample(path,value),RangeError);
 assert.throws(()=>sample([],0),RangeError);assert.throws(()=>sample(path,0,{reducedMotion:'false'}),RangeError);
 for(const keys of [[],[path[0]],[path[1],path.at(-1)],[path[0],path[0],path.at(-1)],[path[0],{at:1,azimuthOffsetDeg:1e308,elevationOffsetDeg:0}]])assert.throws(()=>createSourceScrollOrientation(keys),RangeError);
 assert.ok(Object.isFrozen(path)&&path.every(Object.isFrozen));
 assert.deepEqual(sample(path,.23,{reducedMotion:true}),zero);
 const held=sample(path,.23);assert.deepEqual(sample(path,.23),held,'owner holds progress during pause; pure sampler has no time');
});
test('undefined and zero layer retain exact legacy poses; nonzero composes before source fit without changing recipes',()=>{
 const legacyPoses=[];
 for(let chapter=0;chapter<7;chapter++)for(const phase of [0,.25,.7])for(const aspect of [.4,1.44]){
  const playback={chapterWeights:Array.from({length:7},(_,i)=>Number(i===chapter)),phases:Array(7).fill(phase),activeSeconds:phase*10};
  const chapterScene=sampleChapterScene(playback),selection=resolveSourceSelection(playback,null,chapterScene);
  const args={playback,chapterScene,families,selection,aspect,compositionMode:'viewport-stage',viewportWidth:aspect<1?320:1440};
  const legacy=sampleSourceScenePose(args);legacyPoses.push(legacy);
  assert.deepEqual(sampleSourceScenePose({...args,scrollOrientation:zero}),legacy);
  const offset=sample(path,(chapter+.5)/7),posed=sampleSourceScenePose({...args,scrollOrientation:offset});
  assert.equal(posed.azimuth,legacy.azimuth+offset.azimuthOffsetDeg);
  for(const field of ['sourcePresence','modelVisibility','fov','surfaceEmphasis','framingSupportPoints'])assert.equal(posed[field],legacy[field],field);
  assert.deepEqual(posed.viewOffsetNormalized,legacy.viewOffsetNormalized);assert.deepEqual(posed.target,legacy.target);
  if(offset.azimuthOffsetDeg!==0)assert.notDeepEqual(posed.position,legacy.position);
 }
 assert.equal(legacyPoses.length,42);assert.equal(createHash('sha256').update(JSON.stringify(legacyPoses)).digest('hex'),BASELINE_POSE_SHA256);
 assert.throws(()=>sampleSourceScenePose({scrollOrientation:{azimuthOffsetDeg:NaN,elevationOffsetDeg:0}}),RangeError);
});
test('presented interval clamp holds outgoing endpoint without resetting the global curve',()=>{
 const presented=(u,index)=>sample(path,Math.max(index/7,Math.min((index+1)/7,u)));
 for(let chapter=0;chapter<7;chapter++){
  assert.deepEqual(presented(1,chapter),sample(path,(chapter+1)/7));
  assert.deepEqual(presented(0,chapter),sample(path,chapter/7));
  if(chapter<6)assert.deepEqual(presented(1,chapter),presented(0,chapter+1));
 }
});
test('fixed native orientation does not freeze independently advancing chapter idle',()=>{
 const poses=[0,.37].map(phase=>{
  const playback={chapterWeights:[0,1,0,0,0,0,0],phases:Array(7).fill(phase),activeSeconds:phase*10},chapterScene=sampleChapterScene(playback);
  const args={playback,chapterScene,families,selection:resolveSourceSelection(playback,null,chapterScene),aspect:1.44,compositionMode:'viewport-stage',viewportWidth:1440};
  const original=sampleSourceScenePose(args),posed=sampleSourceScenePose({...args,scrollOrientation:sample(path,1.5/7)});
  assert.equal(posed.azimuth,original.azimuth+46);return posed;
 });
 assert.notEqual(poses[0].azimuth,poses[1].azimuth);
});
test('direct source pose boundary rejects out-of-range offsets before fitting',()=>{
 for(const offset of [{azimuthOffsetDeg:60.01,elevationOffsetDeg:0},{azimuthOffsetDeg:-61,elevationOffsetDeg:0},{azimuthOffsetDeg:0,elevationOffsetDeg:28.01},{azimuthOffsetDeg:0,elevationOffsetDeg:-29},{azimuthOffsetDeg:1e308,elevationOffsetDeg:0}])assert.throws(()=>sampleSourceScenePose({scrollOrientation:offset}),RangeError);
});
