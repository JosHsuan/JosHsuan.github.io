import test from 'node:test';
import assert from 'node:assert/strict';
import {createSourceScrollCameraState as create,advanceSourceScrollCamera as advance} from '../components/source-scroll-camera-state.mjs';
import {BENDING_SCROLL_ORIENTATION as path,sampleSourceScrollOrientation as sample} from '../components/source-scroll-orientation.mjs';
import {sampleCanvasHold} from '../components/canvas-motion.mjs';
import {createReadingPlan,createReadingState,sampleReadingScore} from '../components/story-response.mjs';
const args=(patch={})=>({nativeU:1.5/7,presentedChapter:'form',dt:0,...patch});
test('first pose and steady forward/reverse scroll are immediate; continuous presented passage clamps outgoing interval',()=>{
 const state=create();
 for(const u of [1/7,1.5/7,1.8/7,1.5/7,1/7])assert.deepEqual(advance(state,args({nativeU:u})),{orientation:sample(path,u),needsFrame:false});
 assert.deepEqual(advance(state,args({nativeU:1})).orientation,sample(path,4/7));
 assert.deepEqual(advance(state,args({nativeU:0})).orientation,sample(path,0));
});
test('pause holds while native scroll moves; dt0 resume continuous, finite correction settles exactly',()=>{
 const state=create(),held=advance(state,args()).orientation;
 assert.deepEqual(advance(state,args({paused:true,nativeU:2/7,dt:9})),{orientation:held,needsFrame:false});
 assert.deepEqual(advance(state,args({nativeU:2/7,dt:0})),{orientation:held,needsFrame:true});
 for(let i=0;i<4;i++)advance(state,args({nativeU:2/7,dt:.1}));
 assert.deepEqual(advance(state,args({nativeU:2/7})),{orientation:sample(path,2/7),needsFrame:false});
});
test('resumed flag rejects hidden-time catchup during an existing correction',()=>{
 const state=create();advance(state,args());advance(state,args({paused:true}));advance(state,args({nativeU:2/7}));
 const before=advance(state,args({nativeU:2/7,dt:.1}));
 assert.deepEqual(advance(state,args({nativeU:2/7,dt:100,resumed:true})),before);
 assert.deepEqual(advance(state,args({nativeU:2/7,dt:.25})),{orientation:sample(path,2/7),needsFrame:false});
});
test('reduced motion neutralizes without autonomous recovery and invalid arguments fail closed',()=>{
 const state=create();advance(state,args());advance(state,args({paused:true}));
 assert.deepEqual(advance(state,args({systemReduced:true,dt:1})),{orientation:{azimuthOffsetDeg:0,elevationOffsetDeg:0},needsFrame:false});
 for(const patch of [{nativeU:NaN},{dt:Infinity},{dt:-1},{presentedChapter:'unknown'},{paused:'yes'},{systemReduced:1}])assert.throws(()=>advance(state,args(patch)),RangeError);
});
test('rapid opposite scrolling and repeated pause/resume remain inside authored bounds',()=>{
 const state=create();advance(state,args());
 for(let i=0;i<100;i++){
  const held={...state.orientation};advance(state,args({paused:true}));
  const nativeU=(i%2?1.5:3.5)/7,presentedChapter=i%2?'form':'pattern';
  assert.deepEqual(advance(state,args({nativeU,presentedChapter,dt:0})).orientation,held);
  for(let frame=0;frame<3;frame++){
   const result=advance(state,args({nativeU:(frame%2?1.5:3.5)/7,presentedChapter:frame%2?'form':'pattern',dt:.06}));
   assert.ok(Math.abs(result.orientation.azimuthOffsetDeg)<=7);assert.ok(result.orientation.elevationOffsetDeg>=0&&result.orientation.elevationOffsetDeg<=3);
  }
 }
 const result=advance(state,args({dt:.35}));assert.equal(result.needsFrame,false);assert.deepEqual(result.orientation,sample(path,1.5/7));
});


test('actual differing Canvas and native reading probes retain forward/reverse camera continuity at all internal joins',()=>{
 const anchors=Array.from({length:8},(_,i)=>i*1000),viewport={width:1440,height:1000};
 const plan=createReadingPlan({anchors,viewportHeight:viewport.height,maxScroll:7000});
 for(const boundary of [1,2,3])for(const direction of [1,-1]){
  const state=create(),poses=[];
  for(const delta of [-.001*direction,.001*direction]){
   const docY=anchors[boundary]-.62*viewport.height+delta,canvas=sampleCanvasHold({anchors,docY,viewport});
   const nativeU=sampleReadingScore(createReadingState(docY),plan).nativeU;
   const result=advance(state,args({nativeU,presentedChapter:canvas.chapter}));
   assert.equal(canvas.mode,'hold');assert.equal(result.needsFrame,false);assert.deepEqual(result.orientation,sample(path,nativeU));poses.push(result.orientation);
  }
  assert.ok(Math.abs(poses[1].azimuthOffsetDeg-poses[0].azimuthOffsetDeg)<.00003);
  assert.ok(Math.abs(poses[1].elevationOffsetDeg-poses[0].elevationOffsetDeg)<.00001);
 }
});
test('true outgoing Pattern caps at passage end; absent chapters neutral and presented Credits uses separate interval',()=>{
 const state=create();
 for(const nativeU of [4/7,5/7,6.5/7,1])assert.deepEqual(advance(state,args({nativeU,presentedChapter:'pattern'})).orientation,sample(path,4/7));
 for(const presentedChapter of ['make','validation'])for(const nativeU of [0,1.5/7,3.5/7,6.5/7,1])assert.deepEqual(advance(state,args({nativeU,presentedChapter})).orientation,{azimuthOffsetDeg:0,elevationOffsetDeg:0});
 for(const nativeU of [0,6/7,6.5/7,1])assert.deepEqual(advance(state,args({nativeU,presentedChapter:'credits'})).orientation,sample(path,Math.max(6/7,nativeU)));
});
