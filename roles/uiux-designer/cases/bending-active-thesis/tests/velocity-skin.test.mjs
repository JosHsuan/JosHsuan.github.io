import test from 'node:test';
import assert from 'node:assert/strict';
import {createVelocitySkin,advanceVelocitySkin,sampleVelocitySkin} from '../runtime/motion/velocity-skin.mjs';

test('viewport-normalized speed response is consistent across sample rates and viewport sizes',()=>{
 function run(hz,viewportHeight,speed){
  const state=createVelocitySkin();
  for(let i=1;i<=hz;i++)advanceVelocitySkin(state,{docY:speed*viewportHeight*i/hz,dt:1/hz,viewportHeight});
  return state;
 }
 const reference=run(60,800,1);
 for(const candidate of [run(30,800,1),run(120,800,1),run(60,400,1)])assert(Math.abs(candidate.strength-reference.strength)<1e-10);
 assert.equal(run(60,800,.04).strength,0,'slow reading is below dead zone');
 assert(run(60,800,2).strength>run(60,800,.5).strength);
 assert(run(60,800,1000).strength<=1,'extreme flick remains bounded');
});

test('whole-panel pose is perceptible, bounded and reversible without opacity or scale changes',()=>{
 const state={strength:1};
 for(const [width,height] of [[100,80],[390,300],[700,500]]){
  const {pose,edgeMaximum,perspective}=sampleVelocitySkin(state,width,height,24);
  assert.equal(pose.x,0);assert.equal(pose.y,0);
  assert.equal(pose.rx,-8);assert.equal(pose.ry,4);assert.equal(pose.rz,-1.1);assert.equal(pose.skew,.7);
  assert(perspective>=height*3&&perspective>=width*3&&perspective>=800);
  const reversed=sampleVelocitySkin({strength:-1},width,height,24).pose;
  for(const key of ['rx','ry','rz','skew'])assert.equal(reversed[key],-pose[key]);
  const rest=sampleVelocitySkin({strength:0},width,height,24).pose;
  for(const key of ['rx','ry','rz','skew'])assert(rest[key]===0);
  assert.equal(pose.sx,1);assert.equal(pose.sy,1);assert.equal(pose.alpha,1);
  assert(edgeMaximum<=Math.min(width,height)*.025);
  if(width<480)assert(edgeMaximum<=5);
 }
});

test('zero elapsed retarget preserves displacement for the Director tick and release becomes exactly idle',()=>{
 const state=createVelocitySkin();
 advanceVelocitySkin(state,{docY:800,dt:0,viewportHeight:800});
 advanceVelocitySkin(state,{docY:800,dt:1/60,viewportHeight:800});
 assert(state.strength>0);
 advanceVelocitySkin(state,{docY:820,dt:1/60,viewportHeight:800});
 assert(state.strength>0);
 for(let i=0;i<120;i++)advanceVelocitySkin(state,{docY:820,dt:1/60,viewportHeight:800});
 assert.equal(state.strength,0);assert.equal(state.resting,true);
});
