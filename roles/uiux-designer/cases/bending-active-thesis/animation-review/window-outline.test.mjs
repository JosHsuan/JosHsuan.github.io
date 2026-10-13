import {test} from 'node:test';
import assert from 'node:assert/strict';
import {windowEffects3D,windowEffects2D,sampleKineticPose} from './window-transitions.mjs';
import {createWindowMotion,retargetWindowMotion,advanceWindowMotion} from './window-motion.mjs';
import {sampleWindowBoundary,sampleWindowOutline} from './window-outline.mjs';
import {scrollingEffect} from './window-scroll.mjs';
const effects=[...windowEffects3D,...windowEffects2D];
const bows=boundary=>boundary.corners.map((a,i)=>{
 const b=boundary.corners[(i+1)%4],c=boundary.centres[i],dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy);
 return ((c[0]-(a[0]+b[0])/2)*-dy+(c[1]-(a[1]+b[1])/2)*dx)/length;
});

test('caller radius controls both resting and active corners without changing the default outline',()=>{
 const effect=effects[0],active={ety:-8};
 assert.equal(sampleWindowOutline(effect,{},670,280),'inset(0 round 18px)');
 assert.equal(sampleWindowOutline(effect,{radius:6},670,280),'inset(0 round 6px)');
 assert.equal(sampleWindowOutline(effect,{radius:6},0,0),'inset(0 round 6px)');
 assert.equal(sampleWindowOutline(effect,active,670,280),sampleWindowOutline(effect,{...active,radius:18},670,280));
 assert(sampleWindowOutline(effect,{...active,radius:6},670,280).startsWith("path('M 6 0 "));
 assert(sampleWindowOutline(effect,{...active,radius:0},670,280).startsWith("path('M 0 0 "));
 assert(sampleWindowOutline(effect,{...active,radius:100},20,12).startsWith("path('M 3 0 "),'active corner radius is bounded by adjacent edge length');
 assert.equal(sampleWindowOutline(effect,{radius:NaN},670,280),'inset(0 round 18px)');
});

test('vertical traction bends one trailing edge, swaps sides in reverse, and changes sign under braking',()=>{
 const effect=scrollingEffect(effects.find(e=>e.key==='membrane'),380);
 for(const sign of [1,-1]){
  const state=createWindowMotion(effect,{region:'inside'});retargetWindowMotion(state,sign===1?'after':'before',{strength:0});advanceWindowMotion(state,.1);
  const a=bows(sampleWindowBoundary(effect,sampleKineticPose(effect,state),670,280)),rear=sign===1?2:0,front=sign===1?0:2;
  assert(Math.abs(a[rear])>4,'a broad trailing bow must be perceptible');
  assert(Math.abs(a[front])<.5,'leading edge must not develop an independent neck');
  assert(Math.abs(a[1])<1&&Math.abs(a[3])<1,'vertical traction must not pinch the two lateral edges');
  advanceWindowMotion(state,.2);
  assert(state.velocity*sign>0&&state.acceleration*sign<0);
  const b=bows(sampleWindowBoundary(effect,sampleKineticPose(effect,state),670,280));
  assert(a[rear]*b[rear]<0,'braking changes the bow before body velocity reverses');
 }
});

test('same body position can have opposite local shape when incoming momentum differs',()=>{
 const effect=effects[0],a=createWindowMotion(effect,{region:'inside'}),b=createWindowMotion(effect,{region:'inside'});
 retargetWindowMotion(a,'after',{strength:0});retargetWindowMotion(b,'before',{strength:0});advanceWindowMotion(a,.1);advanceWindowMotion(b,.1);
 a.progress=0;b.progress=0;
 const shapeA=sampleWindowOutline(effect,sampleKineticPose(effect,a),670,280),shapeB=sampleWindowOutline(effect,sampleKineticPose(effect,b),670,280);
 assert.notEqual(shapeA,shapeB,'local elasticity cannot be a function of distance from reading alone');
});

test('all four retained boundaries stay finite on desktop and mobile and return to an exact reading rectangle',()=>{
 for(const effect of effects)for(const [width,height] of [[670,280],[302,248]]){
  const state=createWindowMotion(effect);retargetWindowMotion(state,'inside',{strength:1});
  for(let i=0;i<240;i++){
   advanceWindowMotion(state,1/120);const pose=sampleKineticPose(effect,state),boundary=sampleWindowBoundary(effect,pose,width,height);
   assert.equal(boundary.corners.length,4);assert.equal(boundary.centres.length,4);
   assert([...boundary.corners,...boundary.centres].flat().every(Number.isFinite));
   assert(!/NaN|Infinity/.test(sampleWindowOutline(effect,pose,width,height)));
   const {vx,vy}=state.transport;assert(pose.echoX*vx+pose.echoY*vy<=0,'echo cannot lead curved transport');
  }
  advanceWindowMotion(state,4);assert(state.resting);
  assert.equal(sampleWindowOutline(effect,sampleKineticPose(effect,state),width,height),'inset(0 round 18px)');
 }
});

test('ink keeps its full reading opening during entry overshoot while the perimeter can still rebound',()=>{
 const effect=effects.find(e=>e.key==='ink'),state=createWindowMotion(effect);
 retargetWindowMotion(state,'inside',{strength:.7});advanceWindowMotion(state,.34);
 assert(state.progress>0,'sample must reproduce the former opposite-side cropping case');
 assert.equal(state.aperture,0);
 const boundary=sampleWindowBoundary(effect,sampleKineticPose(effect,state),670,280);
 assert(Math.abs(boundary.corners[0][0])<12&&Math.abs(boundary.corners[3][0])<12,'left edge can flex locally but cannot begin an exit crop');
 assert(Math.abs(boundary.corners[1][0]-670)<12&&Math.abs(boundary.corners[2][0]-670)<12);
});
