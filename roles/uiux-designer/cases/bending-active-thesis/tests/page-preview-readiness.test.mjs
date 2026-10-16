import test from 'node:test';
import assert from 'node:assert/strict';
import {acquirePagePreviewReadiness,registerPagePreviewReadiness} from '../runtime/site/PagePreviewReadiness.mjs';

const flush=async()=>{for(let i=0;i<8;i++)await Promise.resolve();};
const documentWith=(...elements)=>({querySelectorAll:selector=>{assert.equal(selector,'[data-site-preview-required]');return elements;}});

test('SSR-declared previews stay pending before component registration and actual first-draw reporting',async()=>{
 const node={},document=documentWith(node),readiness=acquirePagePreviewReadiness(document);let result=null;
 readiness.promise.then(value=>{result=value;});await flush();assert.equal(result,null);assert.deepEqual(readiness.inspect().pending,['preview-1']);
 const registration=registerPagePreviewReadiness(document,node);await flush();assert.equal(result,null);
 assert.equal(registration.report({mode:'model'}),true);await flush();assert.equal(result.ready,true);assert.deepEqual(result.previews,[{mode:'model',reason:''}]);
 assert.equal(registration.report({mode:'static',reason:'late-policy'}),false);registration.release();readiness.release();assert.equal(readiness.inspect().ready,true);
});

test('completion before loader acquisition is retained and empty pages need no fabricated preview',async()=>{
 const node={},document=documentWith(node),registration=registerPagePreviewReadiness(document,node);
 registration.report({mode:'model'});registration.release();
 const readiness=acquirePagePreviewReadiness(document);assert.equal((await readiness.promise).ready,true);
 const empty=await acquirePagePreviewReadiness(documentWith()).promise;assert.deepEqual(empty,{ready:true,failures:[],pending:[],previews:[]});
});

test('every declared model or explicit static terminal is required, including distinct unsupported or policy reasons',async()=>{
 const nodes=[{},{},{}],document=documentWith(...nodes),registrations=nodes.map(node=>registerPagePreviewReadiness(document,node)),readiness=acquirePagePreviewReadiness(document);let settled=false;
 readiness.promise.then(()=>{settled=true;});registrations[0].report({mode:'model'});registrations[1].report({mode:'static',reason:'reduced-motion'});await flush();assert.equal(settled,false);
 registrations[2].report({mode:'static',reason:'webgl-unavailable'});const result=await readiness.promise;
 assert.equal(result.ready,true);assert.deepEqual(result.pending,[]);assert.deepEqual(result.previews,[{mode:'model',reason:''},{mode:'static',reason:'reduced-motion'},{mode:'static',reason:'webgl-unavailable'}]);
});

test('a replaced or released registration cannot publish stale readiness',async()=>{
 const node={},document=documentWith(node),first=registerPagePreviewReadiness(document,node),second=registerPagePreviewReadiness(document,node),readiness=acquirePagePreviewReadiness(document);let settled=false;
 readiness.promise.then(()=>{settled=true;});assert.equal(first.report({mode:'model'}),false);first.release();await flush();assert.equal(settled,false);
 second.release();assert.equal(second.report({mode:'model'}),false);await flush();assert.equal(settled,false);
 const current=registerPagePreviewReadiness(document,node);current.report({mode:'static',reason:'save-data'});assert.equal((await readiness.promise).ready,true);
});

test('cancelled subscribers close once while a second subscriber still awaits the genuine terminal',async()=>{
 const node={},document=documentWith(node),first=acquirePagePreviewReadiness(document),second=acquirePagePreviewReadiness(document);let secondResult=null;
 second.promise.then(value=>{secondResult=value;});first.release();first.release();const cancelled=await first.promise;
 assert.equal(cancelled.ready,false);assert.deepEqual(cancelled.failures,['preview-readiness-cancelled']);assert.deepEqual(cancelled.pending,['preview-1']);await flush();assert.equal(secondResult,null);
 registerPagePreviewReadiness(document,node).report({mode:'model'});assert.equal((await second.promise).ready,true);assert.equal((await first.promise).ready,false);
});

test('a missing component cannot silently satisfy a declared required preview',async()=>{
 const readiness=acquirePagePreviewReadiness(documentWith({}));let settled=false;readiness.promise.then(()=>{settled=true;});await flush();assert.equal(settled,false);
 readiness.release();assert.deepEqual((await readiness.promise).pending,['preview-1']);
});

test('native-success and static fallback remain explicit immutable terminals',async()=>{
 const node={},document=documentWith(node),registration=registerPagePreviewReadiness(document,node);
 for(const invalid of [{},{mode:'ready'},{mode:'model',reason:42}])assert.throws(()=>registration.report(invalid),TypeError);
 registration.report({mode:'static',reason:'context-lost'});const result=await acquirePagePreviewReadiness(document).promise;
 assert(Object.isFrozen(result));assert(Object.isFrozen(result.previews));assert(Object.isFrozen(result.previews[0]));assert.equal(result.previews[0].mode,'static');
});

test('global fallback synchronously asks only pending owners to abort and publish an explicit static terminal',async()=>{
 const nodes=[{},{}],document=documentWith(...nodes),events=[];let pending;
 registerPagePreviewReadiness(document,nodes[0],{onFallback:()=>assert.fail('A prepared handle must remain owned')}).report({mode:'model'});
 pending=registerPagePreviewReadiness(document,nodes[1],{onFallback:reason=>{events.push(`abort:${reason}`);pending.report({mode:'static',reason});}});
 const readiness=acquirePagePreviewReadiness(document);readiness.fallback('readiness-timeout');events.push('uncover');
 assert.deepEqual(events,['abort:readiness-timeout','uncover']);const result=await readiness.promise;assert.deepEqual(result.previews,[{mode:'model',reason:''},{mode:'static',reason:'readiness-timeout'}]);
 readiness.fallback('again');assert.equal(events.length,2);
});

test('an unknown marker remains pending after fallback and late registration receives a permanent static latch',async()=>{
 const node={},document=documentWith(node),readiness=acquirePagePreviewReadiness(document);readiness.fallback('readiness-timeout');
 assert.deepEqual(readiness.inspect().previews,[{mode:'pending',reason:'readiness-timeout'}]);assert.equal(readiness.inspect().ready,false);
 const callbacks=[],registration=registerPagePreviewReadiness(document,node,{onFallback:reason=>callbacks.push(reason)});
 assert.deepEqual(callbacks,['readiness-timeout']);assert.equal(registration.report({mode:'model'}),false);assert.equal(readiness.inspect().ready,false);
 registration.report({mode:'static',reason:'readiness-timeout'});assert.equal((await readiness.promise).previews[0].mode,'static');
});

test('a throwing fallback owner cannot fabricate success or prevent another pending owner from cleaning up',async()=>{
 const nodes=[{},{}],document=documentWith(...nodes);registerPagePreviewReadiness(document,nodes[0],{onFallback(){throw Error('Owner failed');}});
 let second;second=registerPagePreviewReadiness(document,nodes[1],{onFallback:reason=>second.report({mode:'static',reason})});
 const readiness=acquirePagePreviewReadiness(document);readiness.fallback('readiness-timeout');assert.equal(readiness.inspect().ready,false);
 assert.deepEqual(readiness.inspect().previews,[{mode:'pending',reason:'readiness-timeout'},{mode:'static',reason:'readiness-timeout'}]);readiness.release();assert.equal((await readiness.promise).ready,false);
});
