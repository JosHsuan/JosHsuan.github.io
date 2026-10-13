import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createWindowMotion,retargetWindowMotion,setWindowScrollTarget,advanceWindowMotion,injectWindowInput} from './window-motion.mjs';
import {sampleWindowPath,sampleWindowTangent} from './window-path.mjs';
import {windowEffects3D,windowEffects2D} from './window-transitions.mjs';

const effects=[...windowEffects3D,...windowEffects2D],membrane=effects[0];
const points=state=>[...state.corners,...state.edges];
const advance=(state,seconds,hz=240)=>{for(let i=0;i<Math.round(seconds*hz);i++)advanceWindowMotion(state,1/hz);return state;};
const close=(a,b,epsilon=1e-8)=>assert.ok(Math.abs(a-b)<epsilon,a+' != '+b);
const average=values=>values.reduce((sum,n)=>sum+n,0)/values.length;
const snapshot=state=>({q:state.progress,v:state.velocity,aperture:state.aperture,flow:state.flow,acceleration:state.acceleration,transport:structuredClone(state.transport),points:structuredClone(points(state))});

test('shared rigid path derivatives agree with actual curved transport for all four retained specimens',()=>{
 for(const effect of effects)for(const q of [-1,-.65,0,.42,1]){
  const epsilon=1e-5,a=sampleWindowPath(effect,q-epsilon),b=sampleWindowPath(effect,q+epsilon),tangent=sampleWindowTangent(effect,q);
  for(const axis of ['x','y','z'])close((b[axis]-a[axis])/(2*epsilon),tangent[axis],1e-6);
 }
 for(const effect of effects){const tangent=sampleWindowTangent(effect,0);assert.deepEqual([tangent.x,tangent.y,tangent.z],effect.axis);}
});

test('material rest is a rigid surface at every region, independent of distance to the reading position',()=>{
 for(const effect of effects)for(const [region,q] of [['before',-1],['inside',0],['after',1]]){
  const state=createWindowMotion(effect,{region});
  assert.equal(state.corners.length,4);assert.equal(state.edges.length,4);assert.equal(state.aperture,q);assert(state.resting);
  assert.deepEqual(state.edges.map(p=>p.point),[[0,-1],[1,0],[0,1],[-1,0]]);
  for(const p of points(state)){
   assert.equal(p.response.progress,q);assert.equal(p.error,0);assert.equal(p.errorVelocity,0);
   assert.deepEqual(sampleWindowPath(effect,p.response.progress),sampleWindowPath(effect,state.progress));
   assert(!('wait' in p));assert(!('pending' in p));assert(!('kick' in p));
  }
 }
});

test('acceleration stretches the tail and braking makes that same tail catch up and compress',()=>{
 const state=createWindowMotion(membrane,{region:'inside'});retargetWindowMotion(state,'after',{strength:0});advance(state,.1);
 assert(state.velocity>0&&state.acceleration>0);
 const front=average(state.corners.filter(p=>p.frontWeight>.9).map(p=>p.error));
 const rear=average(state.corners.filter(p=>p.frontWeight<.1).map(p=>p.error));
 assert(rear<front-.025,'accelerating rear must lag behind the carried front');
 assert(rear<0);
 advance(state,.15);
 assert(state.velocity>0&&state.acceleration<0,'compression must happen while still travelling in the original direction');
 const frontBraking=average(state.corners.filter(p=>p.frontWeight>.9).map(p=>p.error));
 const rearBraking=average(state.corners.filter(p=>p.frontWeight<.1).map(p=>p.error));
 assert(rearBraking>0&&rearBraking>frontBraking+.01,'braking rear must advance relative to front');
});

test('a softer trailing midpoint develops one broad trailing bow without an artificial onset delay',()=>{
 const state=createWindowMotion(membrane,{region:'inside'});retargetWindowMotion(state,'after',{strength:0});advanceWindowMotion(state,1/240);
 assert(points(state).every(p=>p.response.progress!==0),'every material point starts reacting on the first active step');
 advance(state,.1);
 const rearEdge=state.edges[2],rearCorners=[state.corners[2],state.corners[3]];
 assert(rearEdge.frontWeight<.1);
 assert(rearEdge.frequency<Math.min(...rearCorners.map(p=>p.frequency)));
 assert(rearEdge.error<average(rearCorners.map(p=>p.error))-.01);
});

test('reversal preserves eight material positions and velocities, and brakes before flow changes face',()=>{
 for(const effect of effects){
  const state=createWindowMotion(effect);retargetWindowMotion(state,'inside');advance(state,.125);
  const before=snapshot(state);assert(state.velocity>0&&state.flow>0);
  retargetWindowMotion(state,'before');assert.deepEqual(snapshot(state),before);
  let crossedVelocity=false,crossedFlow=false;
  for(let i=0;i<240;i++){
   advanceWindowMotion(state,1/240);
   if(state.velocity<0)crossedVelocity=true;
   if(!crossedVelocity)assert(state.flow>=0,'target reversal cannot relabel the leading face before braking');
   if(state.flow<0){assert(crossedVelocity);crossedFlow=true;break;}
  }
  assert(crossedVelocity&&crossedFlow,effect.id);
  advance(state,4);assert.equal(state.progress,-1);assert(state.resting,effect.id);
 }
});

test('a body input impulse preserves material momentum rather than kicking every point in parallel',()=>{
 const state=createWindowMotion(membrane,{region:'inside'}),before=structuredClone(points(state));
 injectWindowInput(state,{impulse:3,energy:.8});
 assert.equal(state.velocity,3);assert.deepEqual(points(state),before);
 advanceWindowMotion(state,1/240);
 assert(points(state).every(p=>p.response.velocity!==state.velocity));
 assert(points(state).some(p=>Math.abs(p.error)>0));
});

test('all four retained specimens settle exactly after forward, reverse and interrupted through travel',()=>{
 for(const effect of effects){
  for(const sequence of [['before','inside','after'],['after','inside','before']]){
   const state=createWindowMotion(effect,{region:sequence[0]});
   for(const region of sequence.slice(1)){
    retargetWindowMotion(state,region);advance(state,4);
    assert(state.resting,effect.id+' '+region);assert.equal(state.progress,{before:-1,inside:0,after:1}[region]);assert.equal(state.aperture,state.target);
    assert(points(state).every(p=>p.response.progress===state.progress&&p.response.velocity===0&&p.error===0));
   }
  }
  const state=createWindowMotion(effect);retargetWindowMotion(state,'inside');advance(state,.1);retargetWindowMotion(state,'after');
  advance(state,4);assert(state.resting);assert.equal(state.progress,1);
  const resting=structuredClone(state);advanceWindowMotion(state,20);assert.deepEqual(state,resting);
 }
});

test('pause freezes all material state and Reduced snaps all eight points with the body',()=>{
 const state=createWindowMotion(membrane);retargetWindowMotion(state,'inside');advance(state,.05);
 const frozen=structuredClone(state);advanceWindowMotion(state,20,{paused:true});assert.deepEqual(state,frozen);
 advanceWindowMotion(state,0,{reduced:true});assert(state.resting);assert.equal(state.progress,0);assert.equal(state.aperture,0);assert.equal(state.flow,0);assert.equal(state.acceleration,0);
 assert.deepEqual(state.transport,{vx:0,vy:0});
 assert(points(state).every(p=>p.response.progress===0&&p.response.velocity===0&&p.error===0));
 retargetWindowMotion(state,'after',{reduced:true});assert.equal(state.progress,1);assert.equal(state.aperture,1);assert(state.resting);
 assert(points(state).every(p=>p.response.progress===1&&p.response.velocity===0));
});

test('body and material response match at common active times across 30, 60 and 120 Hz',()=>{
 for(const effect of effects){
  const run=hz=>{
   const state=createWindowMotion(effect);retargetWindowMotion(state,'inside',{strength:1});advance(state,.2,hz);
   retargetWindowMotion(state,'after');advance(state,.3,hz);retargetWindowMotion(state,'inside');advance(state,.2,hz);
   return [state.progress,state.velocity,state.aperture,state.flow,state.acceleration,...points(state).flatMap(p=>[p.response.progress,p.response.velocity])];
  };
  const reference=run(120);
  for(const hz of [30,60])run(hz).forEach((n,i)=>close(n,reference[i],1e-7));
 }
});

test('transport velocity uses the derivative of the actual path at the current body position',()=>{
 for(const effect of effects){
  const state=createWindowMotion(effect);retargetWindowMotion(state,'inside');advance(state,.1);
  const tangent=sampleWindowTangent(effect,state.progress);
  close(state.transport.vx,tangent.x*state.velocity);close(state.transport.vy,tangent.y*state.velocity);
 }
});

test('rapid alternating destinations and impulses remain finite and recover with no queued force',()=>{
 for(const effect of effects){
  const state=createWindowMotion(effect,{region:'inside'});
  for(let i=0;i<50;i++){
   retargetWindowMotion(state,i%2?'before':'after');injectWindowInput(state,{impulse:i%2?-2:2,energy:.8});advanceWindowMotion(state,.02);
   assert(Number.isFinite(state.acceleration)&&Number.isFinite(state.flow));
   assert(points(state).every(p=>Number.isFinite(p.response.progress)&&Number.isFinite(p.response.velocity)&&Math.abs(p.error)<=.28));
  }
  retargetWindowMotion(state,'inside');advance(state,5);assert(state.resting,effect.id);
 }
});

test('invalid time or target is rejected before changing the active body or material values',()=>{
 const state=createWindowMotion(membrane);retargetWindowMotion(state,'inside');advance(state,.1);const before=structuredClone(state);
 for(const operation of [()=>advanceWindowMotion(state,NaN),()=>advanceWindowMotion(state,-1),()=>retargetWindowMotion(state,'missing'),()=>retargetWindowMotion(state,'after',{strength:NaN})]){
  assert.throws(operation);assert.deepEqual(state,before);
 }
});

test('entrance aperture opens once and stays fully revealed through body overshoot and rebound',()=>{
 for(const effect of effects)for(const region of ['before','after']){
  const state=createWindowMotion(effect,{region});retargetWindowMotion(state,'inside',{strength:1});
  const sign=region==='before'?1:-1;let previous=state.aperture,revealed=false,sawOvershoot=false;
  for(let step=0;step<720;step++){
   advanceWindowMotion(state,1/240);
   assert((state.aperture-previous)*sign>=0,'reveal must be monotonic toward the reading hold');
   assert(state.aperture*sign<=0,'aperture cannot cross to the departing side');
   if(state.aperture===0)revealed=true;
   if(revealed){assert.equal(state.aperture,0);if(state.progress*sign>0.005)sawOvershoot=true;}
   previous=state.aperture;
  }
  assert(revealed&&sawOvershoot,effect.id+' '+region);assert(state.resting);
 }
});

test('reversing an exit holds its existing aperture until the body returns, then opens continuously',()=>{
 const effect=effects.find(e=>e.key==='ink');
 for(const region of ['before','after']){
  const sign=region==='after'?1:-1,state=createWindowMotion(effect,{region:'inside'});
  retargetWindowMotion(state,region,{strength:.8});advance(state,.12);
  const atTurn=state.aperture,bodyAtTurn=state.progress,velocityAtTurn=state.velocity;
  assert(atTurn*sign>0&&velocityAtTurn*sign>0);
  retargetWindowMotion(state,'inside');assert.equal(state.aperture,atTurn);assert.equal(state.progress,bodyAtTurn);assert.equal(state.velocity,velocityAtTurn);
  let heldSteps=0,opened=false,previous=atTurn;
  for(let step=0;step<960;step++){
   advanceWindowMotion(state,1/240);
   if((state.progress-atTurn)*sign>0){assert.equal(state.aperture,atTurn);heldSteps++;}
   assert((state.aperture-previous)*sign<=0,'reversal cannot close the old aperture farther');
   assert(Math.abs(state.aperture-previous)<=8/240+1e-8,'opening increments stay within bounded body travel');
   if(Math.abs(state.aperture)<Math.abs(atTurn))opened=true;
   previous=state.aperture;
  }
  assert(heldSteps>0&&opened);assert.equal(state.aperture,0);assert(state.resting);
 }
});

test('leaving during reading overshoot catches the aperture up at a bounded rate instead of cropping the gap at once',()=>{
 const effect=effects.find(e=>e.key==='ink');
 for(const [start,exit,sign] of [['before','after',1],['after','before',-1]]){
  const state=createWindowMotion(effect,{region:start});retargetWindowMotion(state,'inside',{strength:1});
  let found=false;
  for(let step=0;step<240;step++){
   advanceWindowMotion(state,1/240);
   if(state.aperture===0&&state.progress*sign>.08){found=true;break;}
  }
  assert(found,'test must begin while body overshoots a fully revealed reading aperture');
  const before=state.aperture;retargetWindowMotion(state,exit);assert.equal(state.aperture,before);
  const oldVelocity=state.velocity;advanceWindowMotion(state,1/240);
  const limit=Math.max(Math.abs(oldVelocity),Math.abs(state.velocity),1)/240;
  assert(state.aperture*sign>0);
  assert(Math.abs(state.aperture-before)<=limit+1e-10);
  assert(Math.abs(state.aperture)<Math.abs(state.progress)*.5,'first step must not jump to the already-advanced body');
  advance(state,4);assert.equal(state.aperture,sign);assert(state.resting);
 }
});

test('continuous scroll targets settle at arbitrary reading positions and stay there without an autonomous exit',()=>{
 for(const effect of effects){
  const state=createWindowMotion(effect,{region:'inside'});
  for(const target of [-.72,-.23,.18,.61,.07]){
   setWindowScrollTarget(state,target,{energy:.35});
   assert.equal(state.target,target);
   advance(state,4);
   assert.equal(state.progress,target);assert.equal(state.aperture,target);assert(state.resting,effect.id+' '+target);
   assert(points(state).every(p=>p.response.progress===target&&p.response.velocity===0));
   const resting=structuredClone(state);advanceWindowMotion(state,20);assert.deepEqual(state,resting);
  }
 }
});

test('continuous target changes preserve body and material momentum without an input kick',()=>{
 const state=createWindowMotion(membrane,{region:'inside'});
 setWindowScrollTarget(state,.6);assert.equal(state.velocity,0,'setting a destination must not inject velocity');
 advance(state,.1);assert(state.velocity>0);
 const before=snapshot(state);setWindowScrollTarget(state,-.4,{energy:.4});
 assert.equal(state.direction,-1);assert.equal(state.target,-.4);assert.deepEqual(snapshot(state),before);
 const sameTarget=snapshot(state);setWindowScrollTarget(state,-.4);
 assert.equal(state.direction,-1);assert.deepEqual(snapshot(state),sameTarget);
 advanceWindowMotion(state,1/240);assert(state.velocity>0,'existing momentum must brake before reversing');
 advance(state,4);assert.equal(state.progress,-.4);assert(state.resting);
});

test('continuous scroll Reduced mode snaps every channel to the exact intermediate destination',()=>{
 const state=createWindowMotion(membrane,{region:'before'});setWindowScrollTarget(state,.58,{energy:.7});advance(state,.08);
 setWindowScrollTarget(state,-.37,{energy:.6,reduced:true});
 assert.equal(state.target,-.37);assert.equal(state.progress,-.37);assert.equal(state.aperture,-.37);
 assert.equal(state.velocity,0);assert.equal(state.energy,0);assert.equal(state.flow,0);assert(state.resting);
 assert(points(state).every(p=>p.response.progress===-.37&&p.response.velocity===0&&p.error===0));
 setWindowScrollTarget(state,8,{reduced:true});assert.equal(state.progress,1);assert.equal(state.target,1);
 setWindowScrollTarget(state,-8,{reduced:true});assert.equal(state.progress,-1);assert.equal(state.target,-1);
});

test('invalid continuous targets or energy are rejected atomically',()=>{
 const state=createWindowMotion(membrane);setWindowScrollTarget(state,.3,{energy:.2});advance(state,.1);
 const before=structuredClone(state);
 for(const operation of [()=>setWindowScrollTarget(state,NaN),()=>setWindowScrollTarget(state,Infinity),()=>setWindowScrollTarget(state,-.2,{energy:NaN}),()=>setWindowScrollTarget(state,-.2,{energy:Infinity})]){
  assert.throws(operation);assert.deepEqual(state,before);
 }
});
