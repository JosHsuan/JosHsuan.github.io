import test from 'node:test';
import assert from 'node:assert/strict';
import {registerProjectStudyStage,observeProjectStudyStage} from '../runtime/site/ProjectStudyStageRegistry.mjs';
import {registerHomeResearchStage,observeHomeResearchStage} from '../runtime/site/HomeResearchStageRegistry.mjs';

for(const [name,register,observe] of [
 ['project',registerProjectStudyStage,observeProjectStudyStage],
 ['home',registerHomeResearchStage,observeHomeResearchStage],
]){
 test(`${name}: failed registration rolls back every notified owner and permits retry`,()=>{
  const document={},seen=[];
  const off=observe(document,entry=>seen.push(entry?.id??null));
  const bad=observe(document,entry=>{if(entry)throw Error('stage setup failed');});
  assert.throws(()=>register(document,{id:'failed'}),/stage|registration/i);
  bad();
  assert.deepEqual(seen,[null,'failed',null]);
  const release=register(document,{id:'retry'});release();off();
  assert.deepEqual(seen,[null,'failed',null,'retry',null]);
 });

 test(`${name}: failed initial observer delivery does not retain the observer`,()=>{
  const document={};let calls=0;
  assert.throws(()=>observe(document,()=>{calls++;throw Error('initial delivery failed');}),/initial delivery failed/);
  const release=register(document,{id:'next'});release();
  assert.equal(calls,1);
 });

 test(`${name}: a release observer can install a replacement without stale null delivery`,()=>{
  const document={},seen=[];let replace=false,replacement;
  const first=observe(document,entry=>{if(entry===null&&replace){replace=false;replacement=register(document,{id:'replacement'});}});
  const second=observe(document,entry=>seen.push(entry?.id??null));
  const release=register(document,{id:'original'});
  replace=true;release();
  assert.equal(seen.at(-1),'replacement');
  release();assert.equal(seen.at(-1),'replacement');
  replacement();first();second();
 });

 test(`${name}: two subscriptions of the same callback retain independent lifetimes`,()=>{
  const document={},seen=[],callback=entry=>seen.push(entry?.id??null);
  const first=observe(document,callback),second=observe(document,callback);
  first();const release=register(document,{id:'active'});
  assert.deepEqual(seen,[null,null,'active']);
  second();release();
 });
}
