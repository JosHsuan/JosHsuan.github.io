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
 for(const candidate of [run(30,800,1),run(120,800,1),run(60,400,1)])assert(Math.abs(candidate.strength-reference.strength)<.0001);
 assert.equal(run(60,800,.02).strength,0,'slow reading is below dead zone');
 assert(run(60,800,2).strength>run(60,800,.5).strength);
 assert(run(60,800,1000).strength<=1,'extreme flick remains bounded');
});

test('central projection is symmetric; peripheral cards share opposite curvature and shear',()=>{
 const state={strength:1};
 for(const [width,height] of [[100,80],[390,300],[700,500]]){
  const {pose,edgeMaximum,perspective}=sampleVelocitySkin(state,width,height,24);
  assert.equal(pose.x,0);assert.equal(pose.y,0);
  assert.equal(pose.rx,-11);assert(pose.ry===0&&pose.rz===0&&pose.skew===0);
  assert(perspective>=height*2.7&&perspective>=width*2.7&&perspective>=850);
  const reversed=sampleVelocitySkin({strength:-1},width,height,24).pose;
  for(const key of ['rx','ry','rz','skew'])assert(reversed[key]===-pose[key]);
  const rest=sampleVelocitySkin({strength:0},width,height,24).pose;
  for(const key of ['rx','ry','rz','skew'])assert(rest[key]===0);
  assert.equal(pose.sx,1);assert.equal(pose.sy,1);assert.equal(pose.alpha,1);
  assert(edgeMaximum<=Math.min(width,height)*.035*1.35);
  if(width<480)assert(edgeMaximum<=7*1.35);
  const left=sampleVelocitySkin(state,width,height,24,{horizontal:-.8}).pose;
  const right=sampleVelocitySkin(state,width,height,24,{horizontal:.8}).pose;
  for(const key of ['ry','rz','skew','x'])assert(left[key]===-right[key]);
  assert(left.sx>1&&left.sx===right.sx&&left.sx<1.02);
 }
});

test('acceleration supplies bounded liquid stretch and recovery without modifying opacity',()=>{
 const state=createVelocitySkin();
 advanceVelocitySkin(state,{docY:80,dt:1/60,viewportHeight:800});
 const first=sampleVelocitySkin(state,600,420,24,{horizontal:.7});
 assert(state.surge>0&&first.pose.sy>1&&first.pose.sy<=1.012);
 for(let i=0;i<240;i++)advanceVelocitySkin(state,{docY:80,dt:1/60,viewportHeight:800});
 assert(state.resting);assert.equal(sampleVelocitySkin(state,600,420,24).pose.sy,1);
 assert.equal(first.pose.alpha,1);
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
