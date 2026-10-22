import test from 'node:test';
import assert from 'node:assert/strict';
import {createRuntimeInput} from '../runtime/RuntimeInput.ts';
import {StateStore} from '../runtime/core/StateStore.ts';
import {TransactionEngine} from '../runtime/core/TransactionEngine.ts';
import {CommandRouter} from '../runtime/core/CommandRouter.ts';
import {EventManager} from '../runtime/core/EventManager.ts';

test('invalid grouped requests cannot partially commit or run effects; model ownership is explicit',()=>{
 const input=createRuntimeInput(),before=input.state.get(),scope=input.events.createScope('test');let facts=0;
 input.events.on(scope,'stateChanged',()=>facts++);
 const invalid=input.commands.execute('model.select',{chapterId:'form',index:4,selectedAt:0});
 assert.equal(invalid.status,'rejected');assert.equal(input.state.get(),before);assert.equal(facts,0);
 assert.equal(input.commands.execute('model.interact',{detail:'light'}).status,'rejected');
 const result=input.commands.execute('model.select',{chapterId:'form',index:2,selectedAt:10});
 assert.equal(result.status,'accepted');assert.equal(facts,1);assert.equal(input.state.version,1);
 assert.deepEqual(input.state.get().sourceSelection,{chapterId:'form',index:2,selectedAt:10});
 assert.equal(input.state.get().modelInteractionChapter,'form');assert.equal(input.state.get().modelEngaged,false);
 assert.throws(()=>{input.state.get().sourceSelection.index=3;},TypeError);input.dispose();
});

test('frame publication and passive acknowledgments do not create domain transactions or UI updates',()=>{
 const input=createRuntimeInput();let domain=0,frames=0;
 const off=input.state.subscribe(state=>state.systemReduced,()=>domain++),release=input.subscribe(()=>frames++);
 for(let i=0;i<120;i++)input.publishFrame({controllerFrame:i,pointer:{x:i/120,y:0}});
 assert.equal(input.state.version,0);assert.equal(domain,0);assert.equal(frames,120);
 input.markPresented(119,'overview');assert.equal(frames,120);assert.equal(input.getPresentation().controllerFrame,119);
 assert.throws(()=>input.publishFrame({systemReduced:true}),/cannot change/);
 const preferences={systemReduced:true,sceneEnabled:true,sceneFailed:false};
 input.commands.execute('preferences.apply',preferences);assert.equal(domain,1);assert.equal(input.state.version,1);
 input.commands.execute('preferences.apply',preferences);assert.equal(domain,1);assert.equal(input.state.version,1);
 off();release();input.dispose();
});

test('commands requested by a subscriber commit only after the complete outer publication',()=>{
 const input=createRuntimeInput(),scope=input.events.createScope('observer'),order=[];let nested;
 input.events.on(scope,'stateChanged',event=>{
  order.push('a'+event.version);
  if(event.version===1){nested=input.commands.execute('preferences.apply',{systemReduced:false,sceneEnabled:true,sceneFailed:false});assert.equal(input.state.get().systemReduced,true);}
 });
 input.events.on(scope,'stateChanged',event=>order.push('b'+event.version));
 const outer=input.commands.execute('preferences.apply',{systemReduced:true,sceneEnabled:true,sceneFailed:false});
 assert.equal(outer.version,1);assert.equal(nested.status,'queued');assert.deepEqual(order,['a1','b1','a2','b2']);
 assert.equal(input.state.get().systemReduced,false);input.dispose();
});

test('duplicate command owners are rejected and a failed effect reports an already committed transition',()=>{
 const errors=[],events=new EventManager(error=>errors.push(error)),state=new StateStore(undefined,error=>errors.push(error));
 const scope=events.createScope('commands'),transactions=new TransactionEngine(state,events),commands=new CommandRouter(transactions);let effects=0;
 commands.register(scope,'owner','update',payload=>({patch:payload,effects:[()=>{effects++;throw Error('effect failed');}]}));
 assert.throws(()=>commands.register(scope,'other','update',()=>({patch:{}})),/already owned/);
 assert.equal(commands.execute('update',{systemReduced:'unknown'}).status,'rejected');assert.equal(effects,0);assert.equal(state.version,0);
 const result=commands.execute('update',{systemReduced:true});assert.equal(result.status,'failed');assert(result.committed);assert.equal(state.version,1);assert.equal(effects,1);
 scope.dispose();assert.equal(commands.execute('update',{systemReduced:false}).status,'rejected');events.dispose();state.dispose();
});

test('selective observer failure cannot prevent subsequent observers or factual publication',()=>{
 const errors=[],events=new EventManager(error=>errors.push(error)),state=new StateStore(undefined,error=>errors.push(error)),transactions=new TransactionEngine(state,events),scope=events.createScope('facts');
 let notices=0;state.subscribe(value=>value.systemReduced,()=>{throw Error('observer');});state.subscribe(value=>value.systemReduced,()=>notices++);
 events.on(scope,'stateChanged',()=>notices++);
 transactions.apply({patch:{systemReduced:true}});assert.equal(notices,2);assert.equal(errors.length,1);assert.equal(state.get().systemReduced,true);events.dispose();state.dispose();
});

test('removed quality and pause settings cannot return through commands or state patches',()=>{
 const input=createRuntimeInput(),before=input.state.get();
 assert.equal('detail' in before,false);assert.equal('paused' in before,false);
 assert.equal(input.commands.execute('quality.set',{detail:'light'}).status,'rejected');
 for(const patch of [{detail:'full'},{detail:'light'},{paused:true},{paused:false}]){
  assert.equal(input.commands.execute('preferences.apply',{systemReduced:false,sceneEnabled:true,sceneFailed:false,...patch}).status,'rejected');
  assert.equal(input.state.get(),before);
 }
 assert.equal(input.state.version,0);input.dispose();
});

test('held sources are atomic, chapter-bound inspection intent and do not publish comparison requests',()=>{
 const input=createRuntimeInput(),scope=input.events.createScope('held-source-test');let comparisons=0;
 input.events.on(scope,'representationChanged',()=>comparisons++);
 const held={chapterId:'form',index:2},patch={modelEngaged:true,modelRecovering:false,modelInteractionChapter:'form',modelHeldSource:held};
 for(const invalid of [
  {modelHeldSource:held},
  {modelHeldSource:false},
  {...patch,modelEngaged:false},
  {...patch,modelInteractionChapter:'system'},
  {...patch,modelHeldSource:{chapterId:'form',index:4}},
  {...patch,modelHeldSource:{chapterId:'pattern',index:3}},
 ])assert.equal(input.commands.execute('model.interact',invalid).status,'rejected');
 assert.equal(input.state.version,0);
 assert.equal(input.commands.execute('model.interact',patch).status,'accepted');
 assert.deepEqual(input.state.get().modelHeldSource,held);assert.equal(comparisons,0);
 assert.throws(()=>{input.state.get().modelHeldSource.index=0;},TypeError);
 const version=input.state.version;
 input.commands.execute('model.interact',{...patch,modelHeldSource:{...held}});assert.equal(input.state.version,version);
 assert.equal(input.commands.execute('model.interact',{modelEngaged:false}).status,'rejected');
 input.commands.execute('model.select',{chapterId:'form',index:3,selectedAt:15});
 assert.equal(input.state.get().modelHeldSource,null);assert.equal(input.state.get().modelEngaged,false);assert.equal(comparisons,1);
 input.dispose();
});


test('motion pause is a discrete preference, not scene disposal or reduced-motion substitution',()=>{
 const input=createRuntimeInput();
 const prefs={systemReduced:false,sceneEnabled:true,sceneReady:true,sceneFailed:false,motionPaused:true};
 assert.equal(input.commands.execute('preferences.apply',prefs).status,'accepted');
 assert.equal(input.get().motionPaused,true);assert.equal(input.get().sceneEnabled,true);
 assert.equal(input.get().sceneReady,true);assert.equal(input.get().reduced,false);
 assert.throws(()=>input.publishFrame({motionPaused:false}),/Frame data cannot change/);
 const version=input.state.version;
 assert.equal(input.commands.execute('preferences.apply',{...prefs,motionPaused:'yes'}).status,'rejected');
 assert.equal(input.state.version,version);
 assert.equal(input.commands.execute('preferences.apply',{...prefs,motionPaused:false}).status,'accepted');
 assert.equal(input.get().motionPaused,false);assert.equal(input.get().sceneReady,true);
 input.dispose();
});
