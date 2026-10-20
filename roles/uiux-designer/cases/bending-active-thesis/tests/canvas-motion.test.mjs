import test from 'node:test';
import assert from 'node:assert/strict';
import {CANVAS_CHAPTERS,CANVAS_SCENE_PROBE,createCanvasMotion,advanceCanvasMotion,sampleCanvasHold} from '../components/canvas-motion.mjs';

const anchors=[0,1300,3700,7800,10100,11500,12900,14700],viewport={width:1440,height:1000};
const input=(docY,patch={})=>({anchors,viewport,docY,...patch});
const near=(a,b,epsilon=1e-9)=>assert(Math.abs(a-b)<=epsilon,'Finite motion differs across sample rates');
const visual=state=>({x:state.x,y:state.y,scale:state.scale,opacity:state.opacity,mode:state.mode});
const advanceFor=(state,seconds,options,rate=120)=>{
 for(let time=0;time<seconds-1e-9;time+=1/rate)advanceCanvasMotion(state,Math.min(1/rate,seconds-time),options);
 return state;
};

test('Overview through Pattern keeps one viewport-scale surface while native chapter views change',()=>{
 for(const size of [viewport,{width:390,height:844},{width:820,height:1180}]){
  const state=advanceCanvasMotion(createCanvasMotion(),0,input(0,{viewport:size}));
  for(const chapter of ['overview','form','system','pattern','system','form']){
   const y=anchors[CANVAS_CHAPTERS.indexOf(chapter)];
   advanceCanvasMotion(state,.016,input(y,{viewport:size}));
   assert.equal(state.chapter,chapter);assert.equal(state.transition,null);
   assert.deepEqual(visual(state),{x:0,y:0,scale:1,opacity:1,mode:'hold'});
  }
 }
});

test('scene and information triggers stay independent without hiding at an internal chapter boundary',()=>{
 const y=anchors[2]-viewport.height*.52;
 assert(y+viewport.height*.42<anchors[2]);assert(y+viewport.height*CANVAS_SCENE_PROBE>anchors[2]);
 const scene=sampleCanvasHold(input(y));assert.equal(scene.chapter,'system');assert.equal(scene.mode,'hold');assert.equal(scene.opacity,1);
 for(const index of [1,2,3]){
  const boundary=anchors[index]-viewport.height*CANVAS_SCENE_PROBE;
  for(const delta of [-.001,.001])assert.equal(sampleCanvasHold(input(boundary+delta)).opacity,1);
 }
});

test('the single block has continuous outer entry and exit and retraces source-safe poses',()=>{
 for(const index of [0,3]){
  const hold=sampleCanvasHold(input(anchors[index]));
  for(const boundary of [hold.holdStart,hold.holdEnd]){
   const a=sampleCanvasHold(input(boundary-.001)),b=sampleCanvasHold(input(boundary+.001));
   near(a.x,b.x,1e-7);near(a.y,b.y,1e-7);near(a.opacity,b.opacity,1e-8);
  }
 }
 const positions=Array.from({length:301},(_,i)=>i*48),forward=positions.map(y=>sampleCanvasHold(input(y)));
 assert.deepEqual(positions.toReversed().map(y=>sampleCanvasHold(input(y))).reverse(),forward);
 assert(forward.some(p=>p.mode==='exit'&&p.x<-viewport.width*.5&&p.scale===1));
});

test('the final source departure retains its fixed active time at 3/30/60/120 Hz',()=>{
 const poses=[];
 for(const rate of [3,30,60,120]){
  const state=advanceCanvasMotion(createCanvasMotion(),0,input(8000));
  advanceCanvasMotion(state,0,input(9100));const id=state.request.id;
  advanceFor(state,1/3,input(9200),rate);assert.equal(state.request.id,id);assert.equal(state.mode,'exit');assert(state.opacity>0&&state.opacity<1);poses.push({...state.pose});
  advanceFor(state,.7,input(9200),rate);assert(state.settled);assert.equal(state.opacity,0);
 }
 for(const pose of poses.slice(1))for(const key of ['x','y','opacity'])near(pose[key],poses[0][key]);
});

test('fast skips retain an internal source but leave once for evidence and never re-enter Credits',()=>{
 const state=advanceCanvasMotion(createCanvasMotion(),0,input(1500));
 advanceCanvasMotion(state,0,input(8000));assert.equal(state.chapter,'pattern');assert.equal(state.opacity,1);assert.equal(state.transition,null);
 advanceCanvasMotion(state,.4,input(10100));assert.equal(state.chapter,'pattern');assert.equal(state.mode,'exit');
 advanceCanvasMotion(state,.55,input(12900));assert.equal(state.chapter,'credits');assert.equal(state.mode,'absent');assert.equal(state.opacity,0);assert(state.request.completed);
 advanceFor(state,3,input(12900));assert.equal(state.opacity,0);assert.equal(state.transition,null);
});

test('every later chapter remains absent under normal, Reduced, seek and explicit chapter entry',()=>{
 for(const chapter of ['make','validation','credits'])for(const patch of [{},{reducedMotion:true},{seek:true},{forcedChapter:chapter}]){
  const y=anchors[CANVAS_CHAPTERS.indexOf(chapter)],state=advanceCanvasMotion(createCanvasMotion(),0,input(8000));
  advanceCanvasMotion(state,0,input(y,patch));advanceFor(state,1,input(y,patch));
  assert.equal(state.chapter,chapter);assert.equal(state.mode,'absent');assert(!state.visible);assert.equal(state.opacity,0);
 }
});

test('reversal preserves a partially departing pose and returns without remount or scale',()=>{
 const state=advanceCanvasMotion(createCanvasMotion(),0,input(8000));advanceCanvasMotion(state,0,input(9100));advanceFor(state,.35,input(9100));
 const pose={...state.pose},old=state.request.id;advanceCanvasMotion(state,0,input(8500));
 assert.deepEqual(state.pose,pose);assert.equal(state.mode,'entry');assert.deepEqual(state.events.map(e=>[e.id,e.status]),[[old,'cancelled'],[old+1,'requested']]);
 advanceFor(state,1.11,input(8500));assert.equal(state.opacity,1);assert(state.settled);
});

test('resume and actual renderer waits freeze active departure time across large gaps',()=>{
 const state=advanceCanvasMotion(createCanvasMotion(),0,input(8000));advanceCanvasMotion(state,.2,input(9100));
 const pose={...state.pose},elapsed=state.transition.elapsed;
 for(const patch of [{resumed:true},{paused:true}]){advanceCanvasMotion(state,4,input(9100,patch));assert.deepEqual(state.pose,pose);assert.equal(state.transition.elapsed,elapsed);}
 advanceFor(state,.8,input(9100));assert(state.settled);assert.equal(state.opacity,0);
});

test('long delivered foreground frames complete a real return from evidence exactly once',()=>{
 const state=advanceCanvasMotion(createCanvasMotion(),0,input(10100));advanceCanvasMotion(state,0,input(8000));const id=state.request.id;
 advanceCanvasMotion(state,.6,input(8000));assert.equal(state.mode,'entry');assert(state.opacity>0&&state.opacity<1);
 advanceCanvasMotion(state,1.3166,input(8000));assert.deepEqual(visual(state),{x:0,y:0,scale:1,opacity:1,mode:'hold'});assert.equal(state.request.id,id);
 assert.deepEqual(state.events.map(e=>[e.id,e.status]),[[id,'completed']]);advanceCanvasMotion(state,4,input(8000));assert.deepEqual(state.events,[]);
});

test('seek, Reduced and explicit inspection replace a pending departure with one useful still terminal',()=>{
 for(const patch of [{seek:true},{reducedMotion:true},{forcedChapter:'pattern'}]){
  const state=advanceCanvasMotion(createCanvasMotion(),0,input(8000));advanceCanvasMotion(state,.1,input(9100));const old=state.request.id;
  advanceCanvasMotion(state,0,input(9100,patch));assert.equal(state.chapter,'pattern');assert.equal(state.opacity,1);assert(state.settled);
  assert.deepEqual(state.events.map(e=>[e.id,e.status]),[[old,'cancelled'],[old+1,'requested'],[old+1,'completed']]);
  advanceCanvasMotion(state,.1,input(9100,patch));assert.deepEqual(state.events,[]);
 }
});

test('small trackpad reversals accumulate from the actual turning point',()=>{
 const state=advanceCanvasMotion(createCanvasMotion(),0,input(8000));advanceCanvasMotion(state,.1,input(9100));const id=state.request.id;
 advanceCanvasMotion(state,.1,input(9150));advanceCanvasMotion(state,.1,input(9149));assert.equal(state.request.id,id);assert.equal(state.request.target,'away');
 advanceCanvasMotion(state,0,input(9137));assert.equal(state.request.target,'hold');
});

test('invalid chapter ranges, viewport, time and explicit request remain rejected',()=>{
 assert.throws(()=>sampleCanvasHold(input(0,{anchors:[0,1]})),/eight/);
 assert.throws(()=>sampleCanvasHold(input(0,{anchors:[0,1,1,3,4,5,6,7]})),/increasing/);
 assert.throws(()=>sampleCanvasHold(input(NaN)),/position/);
 assert.throws(()=>sampleCanvasHold(input(0,{viewport:{width:0,height:844}})),/viewport/);
 assert.throws(()=>sampleCanvasHold(input(0,{forcedChapter:'invented'})),/known/);
 assert.throws(()=>advanceCanvasMotion(createCanvasMotion(),-1,input(0)),/delta/);
});
