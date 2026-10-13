import {test} from 'node:test';
import assert from 'node:assert/strict';
import {windowEffects3D,windowEffects2D} from './window-transitions.mjs';
import {createWindowMotion,setWindowScrollTarget,advanceWindowMotion} from './window-motion.mjs';
import {sampleWindowOutline} from './window-outline.mjs';
import {scrollingEffect,scrollTarget,scrollGeometry,sampleScrollingPose} from './window-scroll.mjs';
const effects=[...windowEffects3D,...windowEffects2D];
test('native page position carries a complete window across both viewport edges',()=>{
 for(const [h,w] of [[380,281],[340,248]]){
  assert.equal(scrollGeometry(0,h,w).region,'before');assert.equal(scrollGeometry(.5,h,w).region,'inside');assert.equal(scrollGeometry(1,h,w).region,'after');
  const nearBottom=scrollGeometry(.1,h,w),nearTop=scrollGeometry(.9,h,w);
  assert(nearBottom.top>0&&nearBottom.top<h&&nearBottom.bottom>h);
  assert(nearTop.top<0&&nearTop.bottom>0&&nearTop.bottom<h);
  assert.equal(scrollGeometry(.5,h,w).top,(h-w)/2);
 }
});
test('all four retained windows remain opaque and fully open throughout scrolling and mid-flight reversal',()=>{
 for(const effect of effects){const moving=scrollingEffect(effect,380),s=createWindowMotion(moving);
  for(const p of [0,.1,.3,.5,.8,.95,.7,.5,0,1]){
   setWindowScrollTarget(s,scrollTarget(p),{energy:.2});
   for(let i=0;i<24;i++){advanceWindowMotion(s,1/120);const pose=sampleScrollingPose(moving,s);assert.equal(pose.alpha,1);assert.equal(pose.cut,1);assert.equal(pose.aperture,0);assert(Object.values(pose).every(Number.isFinite));}
  }
 }
});
test('stopping at any page position relaxes feedback without moving to an entrance or exit endpoint',()=>{
 for(const effect of effects)for(const p of [.12,.3,.5,.73,.88]){
  const moving=scrollingEffect(effect,380),s=createWindowMotion(moving);setWindowScrollTarget(s,scrollTarget(p));advanceWindowMotion(s,5);
  assert(s.resting);assert.equal(s.progress,scrollTarget(p));const pose=sampleScrollingPose(moving,s);
  for(const key of ['x','y','z','rx','ry','rz','skew','blur'])assert.equal(pose[key],0,effect.id+' '+key);
  assert.equal(pose.sx,1);assert.equal(pose.sy,1);assert.equal(sampleWindowOutline(effect,pose,670,281),'inset(0 round 18px)');
 }
});
test('Reduced keeps ordinary page travel while removing elastic lag',()=>{
 for(const effect of effects){const moving=scrollingEffect(effect,340),s=createWindowMotion(moving);
  for(const p of [.15,.6,.9,1]){setWindowScrollTarget(s,scrollTarget(p),{reduced:true});const pose=sampleScrollingPose(moving,s);assert.equal(pose.x,0);assert.equal(pose.y,0);assert.equal(pose.alpha,1);assert(s.resting);}
 }
});
