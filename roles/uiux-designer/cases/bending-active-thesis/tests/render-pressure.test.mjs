import test from 'node:test';
import assert from 'node:assert/strict';
import {createRenderPressure} from '../components/render-pressure.mjs';

test('only sustained slow delivery reduces density; fast recovery does not oscillate it',()=>{
  const policy=createRenderPressure();let now=0;
  for(;now<12000;now+=16)policy.observe(now);
  assert.equal(policy.inspect().stage,0);
  for(const end=now+6500;now<end;now+=100)policy.observe(now);
  assert.equal(policy.inspect().stage,1);
  for(const end=now+10000;now<end;now+=16)policy.observe(now);
  assert.equal(policy.inspect().scale,.8);
});
test('pause, interaction, lifecycle gaps and warmup discard incomplete observations',()=>{
  const policy=createRenderPressure();let now=0;
  for(;now<5000;now+=100)policy.observe(now);
  policy.suspend('hidden');now+=60000;
  policy.observe(now);assert.equal(policy.inspect().sampleCount,0);
  for(const end=now+5000;now<end;now+=100)policy.observe(now);
  policy.observe(now,{eligible:false,reason:'interaction'});
  assert.equal(policy.inspect().sampleCount,0);assert.equal(policy.inspect().stage,0);
  policy.observe(now+100);policy.observe(now+60100);
  assert.equal(policy.inspect().reason,'delivery-gap');assert.equal(policy.inspect().stage,0);
});
test('very slow devices require eight actual samples and stop at a bounded floor',()=>{
  const policy=createRenderPressure();let now=0;
  for(;now<=7000;now+=1000)policy.observe(now);
  assert.equal(policy.inspect().stage,0);
  for(;now<60000;now+=1000)policy.observe(now);
  assert.equal(policy.inspect().scale,.5);assert.equal(policy.inspect().decisions,3);
  assert.throws(()=>policy.observe(NaN),RangeError);
});

// Exact pre-experiment output hashes captured from 8c9c33c. This catches changes
// to the normal window, including reason/count/window values, not just stages.
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {resolveRenderProfile} from '../components/render-profile.mjs';
const legacyHashes={
  16:'d9940964893dc851f2fc9c54cc171434b6f8e71dfb671fa428c8805d61b6bb6b',
  50:'3f44ff2792a25a4199cf480a9372dc5665ad1f8c055d078543e576b5bb6c392b',
  100:'0431fa6200928dc64f08093f077f8bd91898fe010cacf48448be172fcc8b81cc',
  500:'d69c9f2daba7cbf1d7e86fad1610b2ae1efe76c1d5865dbbcc5217db0f3bb5da',
  3000:'8ed8a9b6ea26d5728860c10195349a609958e485424da1820cd9d74ba3a03589',
  5000:'6d6933c38258e1e5e1516ae6b36be389ecfa9928b567afaa2c3390adf57fea59',
  5100:'4b95dd51e475381c6681b969cdde88554628f8e1b99b98253c21001fa7ed2430',
};
function traceHash(policy,delta){const rows=[];for(let t=0;t<=60000;t+=delta)rows.push([policy.observe(t),policy.inspect()]);return createHash('sha256').update(JSON.stringify(rows)).digest('hex');}
function warmed(){const p=createRenderPressure({severeDelivery:true});p.observe(0);p.observe(1999);p.observe(2000);return p;}
test('default and TOUCH preserve exact legacy delivery sequences; STANDARD normal delivery is unchanged',()=>{
 for(const options of [{},{coarsePointer:true},{platform:'MacIntel',maxTouchPoints:5}]){
  const profile=resolveRenderProfile(options),enabled=profile.id==='standard';
  for(const delta of [16,50,100])assert.equal(traceHash(createRenderPressure({severeDelivery:enabled}),delta),legacyHashes[delta]);
  if(!enabled)for(const delta of [500,3000,5000,5100])assert.equal(traceHash(createRenderPressure({severeDelivery:enabled}),delta),legacyHashes[delta]);
 }
 for(const delta of Object.keys(legacyHashes).map(Number))assert.equal(traceHash(createRenderPressure(),delta),legacyHashes[delta]);
 const integration=readFileSync(new URL('../components/CinematicScene.jsx',import.meta.url),'utf8');
 assert.match(integration,/createRenderPressure\(\{severeDelivery:profile\.id==='standard'\}\)/);
});
test('three inclusive severe samples after warmup lower exactly one step and clear the normal window',()=>{
 for(const delta of [500,3000,5000]){
  const p=warmed();assert.equal(p.observe(2000+delta),false);assert.equal(p.observe(2000+2*delta),false);assert.equal(p.inspect().stage,0);
  assert.equal(p.observe(2000+3*delta),true);assert.deepEqual(p.inspect(),{stage:1,scale:.8,reason:'sustained-severe-delivery',sampleCount:0,windowMs:0,decisions:1});
 }
});
test('short delivery clears severe streak only, and a single long task cannot lower density',()=>{
 const p=warmed();p.observe(2500);p.observe(3000);const before=p.inspect();p.observe(3016);
 assert.equal(p.inspect().sampleCount,before.sampleCount+1);assert.equal(p.inspect().windowMs,before.windowMs+16);
 assert.equal(p.observe(3516),false);assert.equal(p.observe(4016),false);assert.equal(p.inspect().stage,0);assert.equal(p.observe(4516),true);
 const single=warmed();single.observe(5000);for(let t=5016;t<8000;t+=16)single.observe(t);assert.equal(single.inspect().stage,0);
});
test('warmup, lifecycle suspension, eligibility and unknown gaps cannot carry a severe streak',()=>{
 for(const reason of ['hidden','viewport-change','shader-warmup','inactive','pause','interaction','offscreen','resume']){
  const p=warmed();p.observe(2500);p.observe(3000);p.suspend(reason);p.observe(4000);p.observe(4500);p.observe(5000);p.observe(5500);assert.equal(p.inspect().sampleCount,0);
  p.observe(6000);p.observe(6500);assert.equal(p.inspect().stage,0);p.observe(7000);assert.equal(p.inspect().stage,1);
 }
 const p=warmed();p.observe(2500);p.observe(3000);p.observe(3500,{eligible:false});p.observe(4000);p.observe(6000);p.observe(6500);assert.equal(p.inspect().stage,0);p.observe(7000);assert.equal(p.inspect().stage,1);
 const gap=warmed();gap.observe(2500);gap.observe(3000);gap.observe(8001);assert.equal(gap.inspect().reason,'delivery-gap');assert.equal(gap.inspect().sampleCount,0);gap.observe(10001);gap.observe(10501);assert.equal(gap.inspect().stage,0);gap.observe(11001);assert.equal(gap.inspect().stage,1);
});
test('duplicate and reversed time clear only severe evidence; invalid time preserves old fail-closed state',()=>{
 for(const now of [3000,2999]){const p=warmed();p.observe(2500);p.observe(3000);const before=p.inspect();p.observe(now);assert.equal(p.inspect().sampleCount,before.sampleCount);assert.equal(p.inspect().windowMs,before.windowMs);p.observe(now+2000);p.observe(now+2500);assert.equal(p.inspect().stage,0);p.observe(now+3000);assert.equal(p.inspect().stage,1);}
 const p=warmed();p.observe(2500);const before=p.inspect();for(const invalid of [NaN,Infinity,-Infinity]){assert.throws(()=>p.observe(invalid),RangeError);assert.deepEqual(p.inspect(),before);}
});
test('severe path respects rewarmup, a single decision per frame, and the existing monotone floor',()=>{
 const p=warmed();let last=0;
 for(let t=2500;t<=60000;t+=500){const previous=p.inspect().decisions;p.observe(t);assert.ok(p.inspect().decisions-previous<=1);assert.ok(p.inspect().stage>=last);last=p.inspect().stage;}
 assert.equal(p.inspect().scale,.5);assert.equal(p.inspect().decisions,3);
 const q=warmed();q.observe(2500);q.observe(3000);q.observe(3500);q.observe(4000);q.observe(4500);q.observe(5000);assert.equal(q.inspect().stage,1);assert.equal(q.inspect().sampleCount,0);
});


test('decision diagnostics retain only the three actual monotone decisions without changing legacy inspect',()=>{
 const p=warmed();assert.deepEqual(p.inspectDecisions(),[]);
 for(const t of [2500,3000,3500])p.observe(t);
 assert.deepEqual(p.inspectDecisions(),[{timestampMs:3500,stage:1,scale:.8,reason:'sustained-severe-delivery'}]);
 const external=p.inspectDecisions();external.length=0;
 assert.equal(p.inspectDecisions().length,1);assert.ok(Object.isFrozen(p.inspectDecisions()[0]));
 p.suspend('pause');assert.equal(p.inspect().reason,'pause');assert.equal(p.inspectDecisions()[0].reason,'sustained-severe-delivery');
 for(let t=4000;t<=60000;t+=500)p.observe(t);
 const history=p.inspectDecisions();assert.equal(history.length,3);
 assert.deepEqual(history.map(row=>[row.stage,row.scale]),[[1,.8],[2,.65],[3,.5]]);
 assert.ok(history.every((row,index)=>Number.isFinite(row.timestampMs)&&(!index||row.timestampMs>history[index-1].timestampMs)));
 const legacy=createRenderPressure();for(let t=0;t<=60000;t+=100)legacy.observe(t);
 assert.equal(legacy.inspectDecisions().length,3);assert.ok(legacy.inspectDecisions().every(row=>row.reason==='sustained-slow-delivery'));
 const before=legacy.inspectDecisions();assert.throws(()=>legacy.observe(NaN),RangeError);assert.deepEqual(legacy.inspectDecisions(),before);
});
