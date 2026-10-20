import test from 'node:test';
import assert from 'node:assert/strict';
import {createRuntimeRoot} from '../runtime/RuntimeRoot.mjs';
import {connectRuntimeDocumentLifetime} from '../runtime/features/DocumentLifetime.mjs';
import {createBackgroundRuntime} from '../runtime/background/BackgroundRuntime.mjs';
import {createPreviewLifecycle} from '../runtime/site/PreviewLifecycle.mjs';

const pagehide=(win,persisted)=>{
 const event=new Event('pagehide');if(persisted!==undefined)Object.defineProperty(event,'persisted',{value:persisted});win.dispatchEvent(event);
};
const flush=async()=>{for(let i=0;i<8;i++)await Promise.resolve();};

test('an explicit nonpersisted departure closes Registrar features, background lease and kernel before idempotent unmount',()=>{
 const input=createRuntimeRoot(),win=new EventTarget(),released=[];let fieldDisposals=0,calls=0;
 const background=createBackgroundRuntime({createRenderer:()=>({inspect:()=>({}),dispose(){fieldDisposals++;}})});
 input.features.connect('director-lifetime',()=>{
  const scope=input.events.createScope('director-lifetime'),binding=background.acquire({owner:'bending-director',canvas:{},backdrop:{},publisher:{style(){}}});
  input.events.listen(scope,win,'scroll',()=>calls++);
  return()=>{binding.dispose();scope.dispose();released.push('director');};
 });
 input.features.connect('scene-lifetime',()=>{const scope=input.events.createScope('scene-lifetime');input.events.listen(scope,win,'pointermove',()=>calls++);return()=>{scope.dispose();released.push('scene');};});
 const unmount=input.features.connect('document-lifetime',()=>connectRuntimeDocumentLifetime({input,window:win}));
 assert.equal(background.inspect().activeBindings,1);pagehide(win,false);
 assert.equal(background.inspect().activeBindings,0);assert.equal(fieldDisposals,1);assert.deepEqual(released,['scene','director']);
 assert.deepEqual(input.features.inspect(),{services:[],connections:[]});assert.equal(input.inspect().events.disposed,true);assert.equal(input.inspect().events.nativeListeners,0);assert.equal(input.inspect().events.scopes,0);
 win.dispatchEvent(new Event('scroll'));win.dispatchEvent(new Event('pointermove'));pagehide(win,false);unmount();input.stop();input.dispose();
 assert.equal(calls,0);assert.equal(fieldDisposals,1);assert.deepEqual(released,['scene','director']);
});

test('persisted and bare synthetic pagehide retain runtime ownership, while effect reconnection closes only its own registration',()=>{
 const input=createRuntimeRoot(),win=new EventTarget();let releases=0;
 const connect=()=>input.features.connect('document-lifetime',()=>connectRuntimeDocumentLifetime({input,window:win}));
 input.features.connect('retained-feature',()=>()=>releases++);const first=connect();
 for(const persisted of [true,undefined]){pagehide(win,persisted);assert.equal(input.inspect().events.disposed,false);assert(input.features.inspect().connections.includes('retained-feature'));assert.equal(releases,0);}
 first();input.stop();assert.equal(releases,1);assert.equal(input.inspect().events.disposed,false);assert.equal(input.inspect().events.nativeListeners,0);
 const second=connect();assert.equal(input.inspect().events.nativeListeners,1);pagehide(win,true);assert.equal(input.inspect().events.disposed,false);
 pagehide(win,false);assert.equal(input.inspect().events.disposed,true);assert.equal(input.inspect().events.nativeListeners,0);second();input.stop();
});

test('permanent document disposal aborts pending acquisition and disposes late scene handles instead of reviving a closed feature',async()=>{
 const input=createRuntimeRoot(),win=new EventTarget(),timers=new Map();let resolve,signal,lateDisposals=0,serial=0;
 const pending=new Promise(done=>{resolve=done;}),preview=createPreviewLifecycle({start:options=>{signal=options.signal;return pending;},setTimeout:fn=>{timers.set(++serial,fn);return serial;},clearTimeout:id=>timers.delete(id)});
 input.features.connect('pending-scene',()=>{preview.setActive(true);return()=>preview.dispose();});
 input.features.connect('document-lifetime',()=>connectRuntimeDocumentLifetime({input,window:win}));await flush();assert.equal(signal.aborted,false);assert.equal(timers.size,1);
 pagehide(win,false);assert.equal(signal.aborted,true);assert.equal(timers.size,0);assert.equal(preview.inspect().disposed,true);
 resolve({dispose(){lateDisposals++;}});await flush();assert.equal(lateDisposals,1);assert.equal(preview.inspect().acquisitions,1);assert.equal(input.inspect().events.nativeListeners,0);assert.deepEqual(input.features.inspect().connections,[]);
});
