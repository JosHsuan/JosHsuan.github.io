import test from 'node:test';
import assert from 'node:assert/strict';
import {createRuntimeInput} from '../runtime/RuntimeInput.ts';
import {createEntryManager} from '../runtime/features/EntryManager.mjs';
import {createEntryMotion,advanceEntryMotion,ENTRY_REVEAL_SECONDS,ENTRY_DEADLINE_SECONDS} from '../runtime/motion/entry-motion.mjs';

function deferred(){
 let resolve,reject;
 const promise=new Promise((done,fail)=>{resolve=done;reject=fail;});
 return{promise,resolve,reject};
}

function element(){
 const attributes=new Map(),styles=new Map();
 return{
  getAttribute:name=>attributes.get(name)??null,
  setAttribute:(name,value)=>attributes.set(name,String(value)),
  removeAttribute:name=>attributes.delete(name),
  style:{getPropertyValue:name=>styles.get(name)??'',setProperty:(name,value)=>styles.set(name,String(value))},
 };
}

function fixture(t,{previousInert=null}={}){
 const input=createRuntimeInput(),manager=createEntryManager({input}),fonts=deferred();
 const loader=element(),content=element(),document={documentElement:element(),fonts:{ready:fonts.promise}};
 const facts=[],changes=[],layouts=[],scope=input.events.createScope('entry-test');let release=()=>{};
 if(previousInert!==null)content.setAttribute('inert',previousInert);
 input.events.on(scope,'entryReadiness',fact=>facts.push({fact,inert:content.getAttribute('inert'),busy:content.getAttribute('aria-busy'),hidden:loader.getAttribute('hidden'),phase:document.documentElement.getAttribute('data-entry-state')}));
 input.events.on(scope,'layoutInvalidated',request=>layouts.push(request));
 const connect=()=>{release=manager.connect({element:loader,content,document,onChange:value=>changes.push(value)});return release;};
 const preferences=patch=>{
  const state=input.get();
  const result=input.commands.execute('preferences.apply',{systemReduced:state.systemReduced,sceneEnabled:state.sceneEnabled,sceneFailed:state.sceneFailed,sceneReady:state.sceneReady,...patch});
  assert.equal(result.status,'accepted');return result;
 };
 const disconnect=()=>release();
 t.after(()=>{disconnect();scope.dispose();input.dispose();});
 return{input,manager,fonts,loader,content,document,facts,changes,layouts,preferences,connect,disconnect};
}

test('entry motion keeps a full 0.72 second reveal after readiness and emits its terminal only once',()=>{
 const state=createEntryMotion();
 assert.equal(ENTRY_REVEAL_SECONDS,.72);assert.equal(ENTRY_DEADLINE_SECONDS,30);
 assert(advanceEntryMotion(state,12));assert.equal(state.phase,'preparing');assert.equal(state.reveal,0);
 assert(advanceEntryMotion(state,8,{ready:true}));assert.deepEqual(state.events,['ready','revealing']);assert.equal(state.elapsed,0);
 assert(advanceEntryMotion(state,.36,{ready:true}));assert.equal(state.reveal,.5);
 assert.equal(advanceEntryMotion(state,.36,{ready:true}),false);assert.deepEqual(state.events,['entered']);assert.equal(state.reveal,1);
 assert.equal(advanceEntryMotion(state,100,{ready:true}),false);assert.deepEqual(state.events,[]);
 for(const delta of [-1,NaN,Infinity])assert.throws(()=>advanceEntryMotion(createEntryMotion(),delta),RangeError);
});

test('document, fonts and scene-ready facts are independent gates; completion follows visible DOM publication',async t=>{
 const f=fixture(t);f.manager.scenePolicy('required');f.connect();
 assert.deepEqual(f.manager.inspect().prerequisites,{document:true,typography:false,scene:false});
 assert.equal(f.content.getAttribute('inert'),'');assert.equal(f.content.getAttribute('aria-busy'),'true');assert.equal(f.loader.getAttribute('hidden'),null);
 assert.equal(f.changes.at(-1).progress,33);
 f.preferences({sceneEnabled:true});f.input.markPresented(1,'overview');
 f.manager.advance(5);
 assert.equal(f.manager.inspect().prerequisites.scene,false,'activation and passive presentation metadata cannot replace the scene-ready fact');
 assert.equal(f.manager.inspect().phase,'preparing');
 f.fonts.resolve();await Promise.resolve();assert.equal(f.changes.at(-1).progress,67);
 f.manager.advance(5);assert.equal(f.manager.inspect().phase,'preparing');
 f.preferences({sceneReady:true});assert.equal(f.manager.inspect().progress,100);
 assert.equal(f.manager.inspect().phase,'preparing','readiness wakes the owner rather than creating an independent clock');
 assert(f.layouts.every(request=>request.reason==='entry-readiness'&&request.resumed===false));
 f.manager.advance(10);assert.equal(f.manager.inspect().phase,'revealing');assert.equal(f.manager.inspect().reveal,0);
 f.manager.advance(.36);assert.equal(Number(f.loader.style.getPropertyValue('--entry-reveal')),.5);
 assert.equal(f.content.getAttribute('inert'),'');
 assert.equal(f.manager.advance(.36),false);
 assert.deepEqual(f.facts.map(row=>row.fact.phase),['preparing','ready','revealing','entered']);
 assert.deepEqual(f.facts.at(-1),{fact:{phase:'entered'},inert:null,busy:null,hidden:'',phase:'entered'});
 const count=f.facts.length;f.manager.advance(10);f.disconnect();assert.equal(f.facts.length,count);
});

test('scene readiness arriving before typography still waits for the actual fonts promise',async t=>{
 const f=fixture(t);f.connect();f.preferences({sceneEnabled:true,sceneReady:true});
 f.manager.advance(2);assert.equal(f.manager.inspect().phase,'preparing');assert.equal(f.manager.inspect().prerequisites.typography,false);
 f.fonts.resolve();await Promise.resolve();f.manager.advance(0);
 assert.equal(f.manager.inspect().phase,'revealing');assert.equal(f.manager.inspect().reveal,0);
});

test('deferred scene policy preserves the readable static route and Reduced completes without a reveal delay',async t=>{
 const f=fixture(t);f.manager.scenePolicy('deferred');f.preferences({systemReduced:true});f.connect();
 assert.equal(f.manager.inspect().prerequisites.scene,true);assert.equal(f.input.get().sceneEnabled,false);
 assert.equal(f.manager.inspect().reason,'static-ready');
 f.manager.advance(3,{systemReduced:true});assert.equal(f.manager.inspect().phase,'preparing','Reduced does not skip typography readiness');
 f.fonts.resolve();await Promise.resolve();
 assert.equal(f.manager.advance(0,{systemReduced:true}),false);
 assert.deepEqual(f.facts.map(row=>row.fact.phase),['preparing','ready','revealing','entered']);
 assert.equal(f.facts.at(-1).fact.reason,'static-ready');assert.equal(f.facts.at(-1).inert,null);
 assert.equal(f.facts.at(-1).hidden,'');assert.equal(f.manager.inspect().reveal,1);
 f.manager.advance(10,{systemReduced:true});assert.equal(f.facts.filter(row=>row.fact.phase==='entered').length,1);
});

test('hidden and resumed delivery consume neither waiting time nor a partially revealed entry',async t=>{
 const f=fixture(t);f.connect();
 f.manager.advance(200,{hidden:true});f.manager.advance(200,{resumed:true});
 assert.equal(f.manager.inspect().time,0);assert.deepEqual(f.facts.map(row=>row.fact.phase),['preparing']);
 f.fonts.resolve();await Promise.resolve();f.preferences({sceneEnabled:true,sceneReady:true});
 f.manager.advance(200,{hidden:true});assert.equal(f.manager.inspect().phase,'preparing');
 f.manager.advance(0);f.manager.advance(.18);const before=f.manager.inspect();
 f.manager.advance(200,{hidden:true});f.manager.advance(200,{resumed:true});
 assert.equal(f.manager.inspect().time,before.time);assert.equal(f.manager.inspect().reveal,before.reveal);
 assert.equal(f.manager.inspect().phase,'revealing');
 f.manager.advance(.54);assert.equal(f.manager.inspect().phase,'entered');
});

test('the 30 active-second deadline requests failure once and enters the real static failure outcome',async t=>{
 const f=fixture(t);f.manager.scenePolicy('required');f.connect();f.preferences({sceneEnabled:true});
 let failures=0;f.manager.bindFailure(()=>{failures++;f.preferences({sceneFailed:true,sceneReady:false});});
 f.manager.advance(29);assert.equal(failures,0);assert.equal(f.manager.inspect().phase,'preparing');
 f.manager.advance(100,{hidden:true});f.manager.advance(100,{resumed:true});assert.equal(failures,0);
 f.manager.advance(1);assert.equal(failures,1);assert.equal(f.input.get().sceneStatus,'failed');
 assert.deepEqual(f.manager.inspect().prerequisites,{document:true,typography:true,scene:true});
 assert.equal(f.manager.inspect().phase,'preparing');
 f.manager.advance(0);assert.equal(f.manager.inspect().phase,'revealing');
 f.manager.advance(.72);assert.equal(f.manager.inspect().phase,'entered');
 f.manager.advance(100);assert.equal(failures,1);
 assert.equal(f.content.getAttribute('inert'),null);assert.equal(f.loader.getAttribute('hidden'),'');
 f.fonts.resolve();await Promise.resolve();assert.equal(f.facts.filter(row=>row.fact.phase==='entered').length,1);
});

test('a typography-only deadline releases its fallback without failing a ready scene',t=>{
 const f=fixture(t);f.connect();f.preferences({sceneEnabled:true,sceneReady:true});let failures=0;
 f.manager.bindFailure(()=>{failures++;});f.manager.advance(30);
 assert.equal(failures,0);assert.deepEqual(f.manager.inspect().prerequisites,{document:true,typography:true,scene:true});
 f.manager.advance(0,{systemReduced:true});assert.equal(f.manager.inspect().phase,'entered');
});

test('a rejected fonts promise retains a visible fallback and follows the same completion lifecycle',async t=>{
 const f=fixture(t);f.manager.scenePolicy('deferred');f.connect();
 f.fonts.reject(Error('Font unavailable'));await Promise.resolve();
 assert.equal(f.manager.inspect().reason,'fallback-typography');assert.equal(f.manager.inspect().prerequisites.typography,true);
 f.manager.advance(0,{systemReduced:true});assert.equal(f.manager.inspect().phase,'entered');
 assert.equal(f.facts.at(-1).fact.reason,'fallback-typography');assert.equal(f.content.getAttribute('aria-busy'),null);
});

test('disconnect cancels once, preserves inherited inert and ignores a stale fonts completion',async t=>{
 const f=fixture(t,{previousInert:''});f.connect();const connected=f.input.events.inspect();
 f.disconnect();const count=f.facts.length,writes=f.input.dom.inspect().entry.writes,changes=f.changes.length,layouts=f.layouts.length;
 assert.deepEqual(f.facts.at(-1),{fact:{phase:'cancelled'},inert:'',busy:null,hidden:'',phase:null},'Cancellation observers must see restored DOM, including inherited inert');
 assert.equal(f.content.getAttribute('inert'),'');assert.equal(f.content.getAttribute('aria-busy'),null);
 assert.equal(f.document.documentElement.getAttribute('data-entry-state'),null);assert.equal(f.loader.getAttribute('hidden'),'');
 assert.equal(f.input.events.inspect().subscriptions,connected.subscriptions-1);
 f.fonts.resolve();await Promise.resolve();f.preferences({sceneEnabled:true,sceneReady:true});
 assert.equal(f.manager.advance(100),false);f.disconnect();
 assert.equal(f.facts.length,count);assert.equal(f.input.dom.inspect().entry.writes,writes);assert.equal(f.changes.length,changes);assert.equal(f.layouts.length,layouts);
});

test('an old connection cannot resolve a replacement entry or dispose its live scope',async t=>{
 const f=fixture(t);const firstDisconnect=f.connect();f.disconnect();
 assert.deepEqual(f.facts.at(-1),{fact:{phase:'cancelled'},inert:null,busy:null,hidden:'',phase:null},'Ordinary content is interactive before cancellation is announced');
 const replacementFonts=deferred();f.document.fonts.ready=replacementFonts.promise;f.manager.scenePolicy('deferred');f.connect();
 f.fonts.resolve();await Promise.resolve();firstDisconnect();
 assert.equal(f.manager.inspect().phase,'preparing');assert.equal(f.manager.inspect().prerequisites.typography,false);
 replacementFonts.resolve();await Promise.resolve();f.manager.advance(0,{systemReduced:true});
 assert.equal(f.manager.inspect().phase,'entered');assert.equal(f.content.getAttribute('inert'),null);
 assert.deepEqual(f.facts.map(row=>row.fact.phase),['preparing','cancelled','preparing','ready','revealing','entered']);
});
