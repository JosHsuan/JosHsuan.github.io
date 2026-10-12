import test from 'node:test';
import assert from 'node:assert/strict';
import {FeatureRegistry} from '../runtime/core/FeatureRegistry.ts';
import {Registrar} from '../runtime/core/Registrar.ts';
import {createRuntimeRoot} from '../runtime/RuntimeRoot.mjs';

test('feature declarations reject duplicate, missing and cyclic dependencies before creation',()=>{
 const registry=new FeatureRegistry();registry.register({id:'a',requires:['b'],create:()=>null});
 assert.throws(()=>registry.order(),/Missing feature b/);
 assert.throws(()=>registry.register({id:'a',create:()=>null}),/Duplicate/);
 registry.register({id:'b',requires:['a'],create:()=>null});assert.throws(()=>registry.order(),/Cyclic/);
});

test('dependency creation and partial startup rollback follow explicit reverse order',()=>{
 const registry=new FeatureRegistry(),log=[];
 registry.register({id:'last',requires:['middle'],create:()=>{throw Error('startup');}});
 registry.register({id:'middle',requires:['first'],create:()=>{log.push('middle');return{dispose:()=>log.push('release-middle')};}});
 registry.register({id:'first',create:()=>{log.push('first');return{dispose:()=>log.push('release-first')};}});
 const registrar=new Registrar(registry,{});assert.throws(()=>registrar.start(),/startup/);
 assert.deepEqual(log,['first','middle','release-middle','release-first']);assert.deepEqual(registrar.inspect().services,[]);
});

test('a runtime stop is reconnectable and releases only its own native feature work',()=>{
 const a=createRuntimeRoot(),b=createRuntimeRoot(),target=new EventTarget();let calls=0;
 const connect=root=>root.features.connect('test',()=>{
  const scope=root.events.createScope('test');root.events.listen(scope,target,'change',()=>calls++);return()=>scope.dispose();
 });
 const releaseA=connect(a),releaseB=connect(b);target.dispatchEvent(new Event('change'));assert.equal(calls,2);
 a.stop();releaseA();target.dispatchEvent(new Event('change'));assert.equal(calls,3);
 const again=connect(a);target.dispatchEvent(new Event('change'));assert.equal(calls,5);
 again();releaseB();a.dispose();b.dispose();assert.equal(a.events.inspect().nativeListeners,0);assert.equal(b.events.inspect().nativeListeners,0);
 assert.throws(()=>a.features.create('model',{}),/disposed/);
});

test('failed feature setup rolls back listeners it created before throwing',()=>{
 const root=createRuntimeRoot(),target=new EventTarget();let calls=0;
 assert.throws(()=>root.features.connect('failed',()=>{
  const scope=root.events.createScope('partial');root.events.listen(scope,target,'change',()=>calls++);throw Error('partial setup');
 }),/partial setup/);
 target.dispatchEvent(new Event('change'));assert.equal(calls,0);assert.equal(root.events.inspect().nativeListeners,0);
 assert.deepEqual(root.features.inspect().connections,[]);root.dispose();
});

test('startup rollback releases every dependency even when one cleanup fails',()=>{
 const registry=new FeatureRegistry(),log=[];
 registry.register({id:'first',create:()=>({dispose:()=>log.push('first')})});
 registry.register({id:'second',requires:['first'],create:()=>({dispose:()=>{log.push('second');throw Error('cleanup');}})});
 registry.register({id:'third',requires:['second'],create:()=>{throw Error('startup');}});
 const registrar=new Registrar(registry,{});
 assert.throws(()=>registrar.start(),error=>error instanceof AggregateError&&error.cause.message==='startup'&&error.errors.length===2);
 assert.deepEqual(log,['second','first']);assert.deepEqual(registrar.inspect().services,[]);
});

test('permanent disposal releases other connections and services after cleanup failure',()=>{
 const registry=new FeatureRegistry(),log=[];
 registry.register({id:'service',create:()=>({dispose:()=>log.push('service')})});
 const registrar=new Registrar(registry,{});
 registrar.connect('first',()=>()=>log.push('first'));
 registrar.connect('second',()=>()=>{log.push('second');throw Error('cleanup');});
 assert.throws(()=>registrar.dispose(),AggregateError);
 assert.deepEqual(log,['second','first','service']);assert.deepEqual(registrar.inspect(),{services:[],connections:[]});
 registrar.dispose();assert.throws(()=>registrar.start(),/disposed/);
});
