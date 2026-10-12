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
 const off=input.state.subscribe(state=>state.detail,()=>domain++),release=input.subscribe(()=>frames++);
 for(let i=0;i<120;i++)input.publishFrame({controllerFrame:i,pointer:{x:i/120,y:0}});
 assert.equal(input.state.version,0);assert.equal(domain,0);assert.equal(frames,120);
 input.markPresented(119,'overview');assert.equal(frames,120);assert.equal(input.getPresentation().controllerFrame,119);
 assert.throws(()=>input.publishFrame({paused:true}),/cannot change/);
 input.commands.execute('quality.set',{detail:'light'});assert.equal(domain,1);assert.equal(input.state.version,1);
 input.commands.execute('quality.set',{detail:'light'});assert.equal(domain,1);assert.equal(input.state.version,1);
 off();release();input.dispose();
});

test('commands requested by a subscriber commit only after the complete outer publication',()=>{
 const input=createRuntimeInput(),scope=input.events.createScope('observer'),order=[];let nested;
 input.events.on(scope,'stateChanged',event=>{
  order.push('a'+event.version);
  if(event.version===1){nested=input.commands.execute('quality.set',{detail:'full'});assert.equal(input.state.get().detail,'light');}
 });
 input.events.on(scope,'stateChanged',event=>order.push('b'+event.version));
 const outer=input.commands.execute('quality.set',{detail:'light'});
 assert.equal(outer.version,1);assert.equal(nested.status,'queued');assert.deepEqual(order,['a1','b1','a2','b2']);
 assert.equal(input.state.get().detail,'full');input.dispose();
});

test('duplicate command owners are rejected and a failed effect reports an already committed transition',()=>{
 const errors=[],events=new EventManager(error=>errors.push(error)),state=new StateStore(undefined,error=>errors.push(error));
 const scope=events.createScope('commands'),transactions=new TransactionEngine(state,events),commands=new CommandRouter(transactions);let effects=0;
 commands.register(scope,'owner','update',payload=>({patch:payload,effects:[()=>{effects++;throw Error('effect failed');}]}));
 assert.throws(()=>commands.register(scope,'other','update',()=>({patch:{}})),/already owned/);
 assert.equal(commands.execute('update',{detail:'unknown'}).status,'rejected');assert.equal(effects,0);assert.equal(state.version,0);
 const result=commands.execute('update',{detail:'light'});assert.equal(result.status,'failed');assert(result.committed);assert.equal(state.version,1);assert.equal(effects,1);
 scope.dispose();assert.equal(commands.execute('update',{detail:'full'}).status,'rejected');events.dispose();state.dispose();
});

test('selective observer failure cannot prevent subsequent observers or factual publication',()=>{
 const errors=[],events=new EventManager(error=>errors.push(error)),state=new StateStore(undefined,error=>errors.push(error)),transactions=new TransactionEngine(state,events),scope=events.createScope('facts');
 let notices=0;state.subscribe(value=>value.detail,()=>{throw Error('observer');});state.subscribe(value=>value.detail,()=>notices++);
 events.on(scope,'stateChanged',()=>notices++);
 transactions.apply({patch:{detail:'light'}});assert.equal(notices,2);assert.equal(errors.length,1);assert.equal(state.get().detail,'light');events.dispose();state.dispose();
});
