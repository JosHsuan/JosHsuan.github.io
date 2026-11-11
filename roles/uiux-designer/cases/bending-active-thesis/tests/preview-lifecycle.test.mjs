import test from 'node:test';
import assert from 'node:assert/strict';
import {createPreviewLifecycle,createExclusivePreviewLease,observePreviewEligibility} from '../runtime/site/PreviewLifecycle.mjs';

const deferred=()=>{let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return{promise,resolve,reject};};
const flush=async()=>{for(let i=0;i<8;i++)await Promise.resolve();};

test('progressing acquisition survives the initial deadline while a stalled transfer still aborts',async t=>{
 let clock=0,serial=0,progress,signal;const timers=new Map(),pending=deferred();
 const controller=createPreviewLifecycle({now:()=>clock,transferDeadline:120000,
  start:options=>{progress=options.reportProgress;signal=options.signal;return pending.promise;},
  setTimeout:(callback,delay)=>{timers.set(++serial,{callback,at:clock+delay});return serial;},clearTimeout:id=>timers.delete(id)});
 t.after(()=>controller.dispose());controller.setActive(true);await flush();
 const advance=delta=>{clock+=delta;for(const [id,timer]of [...timers])if(timer.at<=clock){timers.delete(id);timer.callback();}};
 advance(8000);progress?.(1024);advance(6000);progress?.(2048);advance(2000);
 assert.equal(controller.inspect().phase,'requested');assert.equal(signal.aborted,false);
 advance(12999);assert.equal(controller.inspect().phase,'requested');advance(1);
 assert.equal(controller.inspect().reason,'load-timeout');assert.equal(signal.aborted,true);assert.equal(timers.size,0);
});

test('permanent disposal closes acquisition before notifying reentrant observers',async()=>{
 const timers=new Map();let serial=0,starts=0,controller;
 controller=createPreviewLifecycle({
  start:async()=>{starts++;return{dispose(){}};},
  setTimeout:callback=>{timers.set(++serial,callback);return serial;},
  clearTimeout:id=>timers.delete(id),
  onState:state=>{if(state.reason==='disposed')controller.setActive(true);},
 });
 controller.setActive(true);await flush();controller.dispose();await flush();
 assert.equal(controller.inspect().disposed,true);
 assert.equal(controller.inspect().active,false);
 assert.equal(controller.inspect().pending,false);
 assert.equal(timers.size,0);
 assert.equal(starts,1);
 controller.dispose();
});

test('late progress and late fulfillment cannot revive an expired transfer before timer delivery',async t=>{
 for(const kind of ['progress','fulfillment','maximum']){
  let clock=0,progress,signal,disposals=0;const pending=deferred();
  const f=fixture(t,options=>{progress=options.reportProgress;signal=options.signal;return pending.promise;},{now:()=>clock,transferDeadline:30000});
  f.controller.setActive(true);await flush();
  if(kind==='maximum'){clock=10000;assert.equal(progress(1),true);clock=20000;assert.equal(progress(2),true);clock=30000;assert.equal(progress(3),false);}
  else{clock=15000;if(kind==='progress')assert.equal(progress(1),false);}
  pending.resolve({dispose(){disposals++;}});await flush();
  assert.equal(f.controller.inspect().reason,'load-timeout');assert.equal(signal.aborted,true);assert.equal(disposals,1);assert.equal(f.timers.size,0);
 }
});
function fixture(t,start,options={}){
 const timers=new Map();let next=0;
 const controller=createPreviewLifecycle({start,setTimeout:(callback,delay)=>{const id=++next;timers.set(id,{callback,delay});return id;},clearTimeout:id=>timers.delete(id),...options});
 t.after(()=>controller.dispose());return{controller,timers,timeout(){for(const [id,timer] of timers){timers.delete(id);timer.callback();}}};
}

test('inactive previews do not import/acquire; eligible load draws once and resize is demand-only without new acquisition',async t=>{
 let starts=0,disposals=0;const sizes=[];
 const f=fixture(t,async()=>{starts++;return{dispose(){disposals++;},resize:(w,h)=>sizes.push([w,h])};});
 f.controller.resize(400,300);await flush();assert.equal(starts,0);
 f.controller.setActive(true);await flush();assert.equal(starts,1);assert.deepEqual(sizes,[[400,300]]);assert.equal(f.controller.inspect().phase,'ready');assert.equal(f.timers.size,0);
 f.controller.setActive(true);f.controller.resize(400,300);await flush();assert.deepEqual(sizes,[[400,300]]);
 f.controller.resize(300,300);assert.deepEqual(sizes,[[400,300],[300,300]]);assert.equal(starts,1);
 f.controller.setActive(false,'offscreen');assert.equal(disposals,1);assert.equal(f.controller.inspect().phase,'poster');assert.deepEqual(f.controller.inspect().history.map(fact=>fact.phase),['requested','ready']);
 f.controller.setActive(true);await flush();assert.equal(starts,2);assert.equal(f.controller.inspect().phase,'ready');
 f.controller.resize(0,0);assert.equal(f.controller.inspect().phase,'poster');f.controller.resize(250,250);await flush();assert.equal(starts,3);assert.equal(f.controller.inspect().phase,'ready');
});

test('leaving during asynchronous acquisition aborts partial work, closes once and disposes a late fulfilled handle',async t=>{
 const acquired=deferred();let signal,partialCleanups=0,lateCleanups=0;
 const f=fixture(t,options=>{signal=options.signal;signal.addEventListener('abort',()=>partialCleanups++,{once:true});return acquired.promise;});
 f.controller.setActive(true);await flush();f.controller.stop('hidden');assert.equal(signal.aborted,true);assert.equal(partialCleanups,1);assert.equal(f.timers.size,0);
 acquired.resolve({dispose(){lateCleanups++;}});await flush();assert.equal(lateCleanups,1);assert.equal(f.controller.inspect().phase,'poster');assert.deepEqual(f.controller.inspect().history.map(fact=>fact.phase),['requested','cancelled']);
});

test('page-prepared handles survive hidden and BFCache inactivity without resize draws or poster reversion',async t=>{
 let starts=0,disposals=0,suspensions=0,resumptions=0;const sizes=[];
 const f=fixture(t,async()=>{starts++;return{dispose(){disposals++;},suspend(){suspensions++;},resume(){resumptions++;},resize:(w,h)=>sizes.push([w,h])};},{retainWhenInactive:true});
 f.controller.resize(400,400);f.controller.setActive(true);await flush();assert.equal(f.controller.inspect().phase,'ready');
 f.controller.setActive(false,'hidden');assert.equal(f.controller.inspect().phase,'ready');assert.equal(f.controller.inspect().active,false);assert.equal(disposals,0);assert.equal(suspensions,1);
 f.controller.resize(300,300);f.controller.resize(0,0);f.controller.resize(240,240);assert.deepEqual(sizes,[[400,400]]);
 f.controller.setActive(true);assert.deepEqual(sizes,[[400,400],[240,240]]);assert.equal(starts,1);assert.equal(resumptions,1);assert.equal(f.controller.inspect().reason,'');
 f.controller.setActive(false,'page-exit');f.controller.setActive(true);assert.equal(starts,1);assert.equal(disposals,0);assert.equal(resumptions,2);
 assert.deepEqual(f.controller.inspect().history.map(fact=>fact.phase),['requested','ready']);f.controller.dispose();assert.equal(disposals,1);
});

test('retention does not keep partial acquisition alive and an explicit policy stop still releases an acquired handle',async t=>{
 const pending=deferred();let signal,lateDisposals=0;
 const f=fixture(t,options=>{signal=options.signal;return pending.promise;},{retainWhenInactive:true});f.controller.setActive(true);await flush();f.controller.setActive(false,'hidden');
 assert.equal(signal.aborted,true);assert.equal(f.controller.inspect().phase,'poster');assert.equal(f.timers.size,0);
 pending.resolve({dispose(){lateDisposals++;}});await flush();assert.equal(lateDisposals,1);assert.deepEqual(f.controller.inspect().history.map(fact=>fact.phase),['requested','cancelled']);
 let disposals=0;const ready=fixture(t,async()=>({dispose(){disposals++;}}),{retainWhenInactive:true});ready.controller.setActive(true);await flush();ready.controller.setActive(false,'hidden');ready.controller.stop('save-data');
 assert.equal(disposals,1);assert.equal(ready.controller.inspect().phase,'poster');assert.equal(ready.controller.inspect().reason,'save-data');
});

test('a resume draw failure releases a retained context and records a resource failure without a second acquisition terminal',async t=>{
 let draws=0,disposals=0;const f=fixture(t,async()=>({dispose(){disposals++;},resize(){if(++draws>1)throw Error('resume draw failed');}}),{retainWhenInactive:true});
 f.controller.setActive(true);await flush();f.controller.setActive(false,'hidden');f.controller.setActive(true);assert.equal(disposals,1);assert.equal(f.controller.inspect().phase,'failed');
 assert.deepEqual(f.controller.inspect().history.map(fact=>fact.phase),['requested','ready']);assert.equal(f.controller.inspect().resourceFailures[0].reason,'resume draw failed');
});

test('the bounded deadline fails once, aborts work and ignores stale readiness without resize-triggered retry',async t=>{
 const acquired=deferred();let signal,loads=0,cleanups=0;
 const f=fixture(t,options=>{loads++;signal=options.signal;return acquired.promise;});f.controller.setActive(true);await flush();
 assert.equal([...f.timers.values()][0].delay,15000);f.timeout();assert.equal(signal.aborted,true);assert.equal(f.controller.inspect().phase,'failed');assert.equal(f.controller.inspect().reason,'load-timeout');
 f.controller.resize(40,40);f.controller.setActive(true);await flush();assert.equal(loads,1);
 acquired.resolve({dispose(){cleanups++;}});await flush();assert.equal(cleanups,1);assert.deepEqual(f.controller.inspect().history.map(fact=>fact.phase),['requested','failed']);
});

test('exclusive model leases release old resources before another preview is acquired',async t=>{
 const lease=createExclusivePreviewLease();let live=0,max=0;
 const start=async()=>{live++;max=Math.max(max,live);return{dispose(){live--;}};};
 const first=fixture(t,start,{lease}),second=fixture(t,start,{lease});first.controller.setActive(true);await flush();second.controller.setActive(true);await flush();
 assert.equal(first.controller.inspect().phase,'poster');assert.equal(first.controller.inspect().reason,'replaced');assert.equal(live,1);assert.equal(max,1);
 second.controller.dispose();assert.equal(live,0);
});

test('render failure and context loss release resources; a completed loading request never receives a second terminal',async t=>{
 let disposals=0;const f=fixture(t,async()=>({dispose(){disposals++;},resize(){throw Error('draw failed');}}));
 f.controller.setActive(true);await flush();assert.equal(f.controller.inspect().phase,'failed');assert.equal(disposals,1);assert.deepEqual(f.controller.inspect().history.map(fact=>fact.phase),['requested','failed']);
 const ready=fixture(t,async()=>({dispose(){disposals++;}}));ready.controller.setActive(true);await flush();ready.controller.fail('context-lost');
 assert.equal(ready.controller.inspect().phase,'failed');assert.equal(ready.controller.inspect().reason,'context-lost');assert.deepEqual(ready.controller.inspect().history.map(fact=>fact.phase),['requested','ready']);
 assert.deepEqual(ready.controller.inspect().resourceFailures,[{id:ready.controller.inspect().id,phase:'resource-failed',reason:'context-lost'}]);
 ready.controller.fail('context-lost');assert.equal(ready.controller.inspect().resourceFailures.length,1);
});

test('eligibility composes true intersection, document/site/policy state and disconnects all native observers',()=>{
 const doc=new EventTarget(),win=new EventTarget(),media=Object.assign(new EventTarget(),{matches:false}),connection=Object.assign(new EventTarget(),{saveData:false});
 const attributes=new Map([['data-site-entry-state','requested']]);doc.documentElement={getAttribute:key=>attributes.get(key)??null};doc.hidden=false;
 const observers=[];
 const observer=kind=>class{constructor(callback){this.callback=callback;this.kind=kind;this.disconnected=false;observers.push(this);}observe(){}disconnect(){this.disconnected=true;}};
 Object.assign(win,{matchMedia:()=>media,navigator:{connection},IntersectionObserver:observer('intersection'),MutationObserver:observer('mutation')});
 const element={},states=[];const eligibility=observePreviewEligibility({element,window:win,document:doc,onChange:state=>states.push(state)});
 const intersection=observers.find(value=>value.kind==='intersection'),mutation=observers.find(value=>value.kind==='mutation');
 intersection.callback([{target:element,isIntersecting:true,intersectionRatio:1}]);assert.equal(states.at(-1).active,false);
 attributes.set('data-site-entry-state','entered');mutation.callback();assert.equal(states.at(-1).active,true);
 doc.hidden=true;doc.dispatchEvent(new Event('visibilitychange'));assert.equal(states.at(-1).reason,'hidden');doc.hidden=false;doc.dispatchEvent(new Event('visibilitychange'));
 media.matches=true;media.dispatchEvent(new Event('change'));assert.equal(states.at(-1).active,true,'Motion preference does not disable source preparation');media.matches=false;media.dispatchEvent(new Event('change'));
 connection.saveData=true;connection.dispatchEvent(new Event('change'));assert.equal(states.at(-1).active,true,'Data preference does not disable source preparation');connection.saveData=false;connection.dispatchEvent(new Event('change'));
 win.dispatchEvent(new Event('pagehide'));assert.equal(states.at(-1).reason,'page-exit');win.dispatchEvent(new Event('pageshow'));assert.equal(states.at(-1).active,true);
 intersection.callback([{target:element,isIntersecting:true,intersectionRatio:0}]);assert.equal(states.at(-1).active,false);eligibility.dispose();assert(observers.every(value=>value.disconnected));
 const count=states.length;doc.dispatchEvent(new Event('visibilitychange'));assert.equal(states.length,count);
});

test('page preparation begins before entry and outside the viewport while document and resource policies retain authority',()=>{
 const doc=new EventTarget(),win=new EventTarget(),media=Object.assign(new EventTarget(),{matches:false}),connection=Object.assign(new EventTarget(),{saveData:false});
 const attributes=new Map([['data-site-entry-state','requested']]);doc.documentElement={getAttribute:key=>attributes.get(key)??null};doc.hidden=false;
 Object.assign(win,{matchMedia:()=>media,navigator:{connection}});const states=[];
 const eligibility=observePreviewEligibility({element:{},window:win,document:doc,mode:'page',onChange:state=>states.push(state)});
 assert.equal(states.at(-1).active,true);assert.equal(states.at(-1).siteReady,false);assert.equal(states.at(-1).visible,false);assert.equal(states.at(-1).reason,'page-ready');
 doc.hidden=true;doc.dispatchEvent(new Event('visibilitychange'));assert.equal(states.at(-1).active,false);doc.hidden=false;doc.dispatchEvent(new Event('visibilitychange'));assert.equal(states.at(-1).active,true);
 media.matches=true;media.dispatchEvent(new Event('change'));assert.equal(states.at(-1).active,true,'Motion preference does not disable source preparation');media.matches=false;media.dispatchEvent(new Event('change'));
 connection.saveData=true;connection.dispatchEvent(new Event('change'));assert.equal(states.at(-1).active,true,'Data preference does not disable source preparation');connection.saveData=false;connection.dispatchEvent(new Event('change'));
 win.dispatchEvent(new Event('pagehide'));assert.equal(states.at(-1).active,false);win.dispatchEvent(new Event('pageshow'));assert.equal(states.at(-1).active,true);
 eligibility.dispose();const count=states.length;doc.dispatchEvent(new Event('visibilitychange'));assert.equal(states.length,count);
});
