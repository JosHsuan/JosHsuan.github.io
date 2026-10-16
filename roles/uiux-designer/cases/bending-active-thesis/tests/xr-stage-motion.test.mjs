import test from 'node:test';
import assert from 'node:assert/strict';
import {CANVAS_ENTRY_SECONDS,CANVAS_EXIT_SECONDS} from '../components/canvas-motion.mjs';
import {createXRStageMotion,advanceXRStageMotion,cancelXRStageMotion} from '../runtime/xr/XRStageMotion.mjs';

const advance=(state,seconds,input,rate=60)=>{
 for(let time=0;time<seconds-1e-10;time+=1/rate)advanceXRStageMotion(state,Math.min(1/rate,seconds-time),input);
 return state;
};
const seed=()=>advanceXRStageMotion(createXRStageMotion(),0,{chapter:'context',readyChapter:'context',reduced:true});
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} differs from ${b}`);
const closed=history=>{for(const id of new Set(history.map(item=>item.id))){const own=history.filter(item=>item.id===id);assert.equal(own.filter(item=>item.status==='requested').length,1);assert.equal(own.filter(item=>['completed','cancelled'].includes(item.status)).length,1);}};

test('XR uses the original finite Bending passage durations and identical active-time results at 3 and 60 Hz',()=>{
 const states=[];
 for(const rate of [3,60]){
  const state=seed();advance(state,CANVAS_EXIT_SECONDS/2,{chapter:'method',readyChapter:'context'},rate);states.push({...state.pose});
  assert.equal(state.chapter,'context');assert.equal(state.mode,'exit');assert.ok(state.pose.x<0&&state.pose.opacity>0&&state.pose.opacity<1);
  advance(state,CANVAS_EXIT_SECONDS/2,{chapter:'method',readyChapter:'context'},rate);
  assert.equal(state.chapter,'method');assert.equal(state.mode,'waiting');assert.equal(state.pose.opacity,0);
  advance(state,8,{chapter:'method',readyChapter:'context'},rate);assert.equal(state.pose.opacity,0,'Elapsed time cannot stand in for a real paint');
  advance(state,CANVAS_ENTRY_SECONDS,{chapter:'method',readyChapter:'method'},rate);
  assert.equal(state.mode,'hold');assert.equal(state.settled,true);assert.deepEqual(state.pose,{x:0,y:0,opacity:1});closed(state.history);
 }
 for(const key of ['x','y','opacity'])near(states[0][key],states[1][key]);
});

test('fast jumps exit the displayed source once, enter only the latest request and close every superseded request',()=>{
 const state=seed();advance(state,.3,{chapter:'method',readyChapter:'context'});
 advance(state,.3,{chapter:'join',readyChapter:'context'});assert.equal(state.chapter,'context');
 advance(state,.35,{chapter:'making',readyChapter:'context'});assert.equal(state.chapter,'making');assert.equal(state.pose.opacity,0);
 advance(state,CANVAS_ENTRY_SECONDS,{chapter:'making',readyChapter:'making'});
 assert.equal(state.mode,'hold');closed(state.history);
 assert.deepEqual(state.history.filter(item=>item.status==='cancelled').map(item=>item.chapter),['method','join']);
});

test('reversal begins from the current visible pose, and returning to the opening completes absence',()=>{
 const state=seed();advance(state,.4,{chapter:'method',readyChapter:'context'});const current={...state.pose};
 advanceXRStageMotion(state,0,{chapter:'context',readyChapter:'context'});assert.deepEqual(state.pose,current);assert.equal(state.mode,'entry');
 advance(state,CANVAS_ENTRY_SECONDS,{chapter:'context',readyChapter:'context'});assert.equal(state.mode,'hold');
 advance(state,CANVAS_EXIT_SECONDS,{chapter:'overview',readyChapter:'context'});
 assert.equal(state.chapter,'overview');assert.equal(state.mode,'absent');assert.equal(state.pose.opacity,0);assert.equal(state.visible,false);closed(state.history);
});

test('resuming rebases active time; static preferences pick useful stills; disposal cannot leave an open request',()=>{
 const state=seed();advance(state,.2,{chapter:'method',readyChapter:'context'});const before={...state.pose};
 advanceXRStageMotion(state,30,{chapter:'method',readyChapter:'context',resumed:true});assert.deepEqual(state.pose,before);
 advanceXRStageMotion(state,0,{chapter:'method',reduced:true});assert.equal(state.mode,'hold');assert.deepEqual(state.pose,{x:0,y:0,opacity:1});
 advanceXRStageMotion(state,0,{chapter:'adapt',readyChapter:'method'});cancelXRStageMotion(state,'page-exit');closed(state.history);
 assert.equal(state.transition,null);assert.equal(state.settled,true);
 assert.throws(()=>advanceXRStageMotion(state,0,{chapter:'limits'}),RangeError);
 assert.throws(()=>advanceXRStageMotion(state,-1,{chapter:'credits'}),RangeError);
});
