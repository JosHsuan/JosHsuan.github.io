import test from 'node:test';
import assert from 'node:assert/strict';
import {createPreviewLifecycle,createExclusivePreviewLease,observePreviewEligibility} from '../runtime/site/PreviewLifecycle.mjs';

const deferred=()=>{let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return{promise,resolve,reject};};
const flush=async()=>{for(let i=0;i<8;i++)await Promise.resolve();};
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
 media.matches=true;media.dispatchEvent(new Event('change'));assert.equal(states.at(-1).reason,'reduced-motion');media.matches=false;media.dispatchEvent(new Event('change'));
 connection.saveData=true;connection.dispatchEvent(new Event('change'));assert.equal(states.at(-1).reason,'save-data');connection.saveData=false;connection.dispatchEvent(new Event('change'));
 win.dispatchEvent(new Event('pagehide'));assert.equal(states.at(-1).reason,'page-exit');win.dispatchEvent(new Event('pageshow'));assert.equal(states.at(-1).active,true);
 intersection.callback([{target:element,isIntersecting:true,intersectionRatio:0}]);assert.equal(states.at(-1).active,false);eligibility.dispose();assert(observers.every(value=>value.disconnected));
 const count=states.length;doc.dispatchEvent(new Event('visibilitychange'));assert.equal(states.length,count);
});
