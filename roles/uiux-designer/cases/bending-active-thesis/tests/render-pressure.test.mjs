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
