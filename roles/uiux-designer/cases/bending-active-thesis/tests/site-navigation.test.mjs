import test from 'node:test';
import assert from 'node:assert/strict';
import {createSiteNavigation,SITE_HANDOFF_KEY,SITE_TERMINAL_KEY} from '../runtime/site/SiteNavigation.mjs';
import {acquireSiteReadiness} from '../runtime/site/SiteReadiness.mjs';
import {registerPagePreviewReadiness} from '../runtime/site/PagePreviewReadiness.mjs';
import {createPreviewLifecycle} from '../runtime/site/PreviewLifecycle.mjs';
import {createRuntimeInput} from '../runtime/RuntimeInput.ts';
import {createEntryManager} from '../runtime/features/EntryManager.mjs';

const deferred=()=>{let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return{promise,resolve,reject};};
const flush=async()=>{for(let i=0;i<12;i++)await Promise.resolve();};
class Element extends EventTarget{
 attributes=new Map();style={setProperty(){},getPropertyValue(){return'';}};
 setAttribute(name,value){this.attributes.set(name,String(value));}
 removeAttribute(name){this.attributes.delete(name);}
 getAttribute(name){return this.attributes.get(name)??null;}
 hasAttribute(name){return this.attributes.has(name);}
}
function environment({url='https://example.test/',storage=new Map(),images=[],previews=[],fontFamilies=[],readyState='complete',fonts=Promise.resolve()}={}){
 const loader=new Element(),content=new Element(),navigation=new Element(),doc=new EventTarget(),win=new EventTarget(),media=new EventTarget();
 const fontLinks=fontFamilies.map(family=>{const link=new Element();link.setAttribute('data-site-font-family',family);return link;});
 Object.assign(doc,{documentElement:new Element(),readyState,hidden:false,fonts:{ready:fonts},querySelectorAll:selector=>selector.includes('img')?images:selector==='[data-site-preview-required]'?previews:selector==='link[rel="preload"][as="font"][data-site-font-family]'?fontLinks:[content,navigation]});
 let clock=0,serial=0;const timers=new Map();
 Object.assign(media,{matches:false});
 Object.assign(win,{location:new URL(url),sessionStorage:{getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value),removeItem:key=>storage.delete(key)},matchMedia:()=>media,
  setTimeout(callback,delay){const id=++serial;timers.set(id,{at:clock+delay,callback});return id;},clearTimeout:id=>timers.delete(id)});
 const advance=delta=>{clock+=delta;for(const [id,timer] of [...timers])if(timer.at<=clock){timers.delete(id);timer.callback();}};
 const click=(href,properties={},anchorProperties={})=>{
  const anchor={href,target:'',rel:'',hasAttribute:()=>false,closest(){return this;},...anchorProperties};
  const event=new Event('click',{cancelable:true});Object.defineProperty(event,'target',{value:anchor});
  for(const [key,value] of Object.entries({button:0,...properties}))Object.defineProperty(event,key,{value});
  doc.dispatchEvent(event);return event;
 };
 const page=(type,persisted=false)=>{const event=new Event(type);Object.defineProperty(event,'persisted',{value:persisted});win.dispatchEvent(event);};
 return{win,doc,media,loader,content,navigation,timers,advance,elapse:delta=>{clock+=delta;},click,page,storage,now:()=>clock};
}
function connect(t,f,options={}){
 const manager=createSiteNavigation({window:f.win,document:f.doc,element:f.loader,now:f.now,...options});manager.start();t.after(()=>manager.dispose());return manager;
}
function phases(manager){return manager.inspect().history.map(fact=>fact.phase);}
function nativeReveal(f,{throwAt=-1,invalidAt=-1,invalidReadyAt=-1,manualReady=false}={}){
 const content=new Element(),calls=[],owned=[],frames=new Map(),requested=[],cancelled=[];let serial=0;
 f.win.requestAnimationFrame=callback=>{const id=++serial;frames.set(id,callback);requested.push({id,callback});return id;};
 f.win.cancelAnimationFrame=id=>{cancelled.push(id);frames.delete(id);};
 f.loader.querySelector=selector=>selector==='[data-site-loader-content]'?content:null;
 for(const target of [f.loader,content])target.animate=function(keyframes,options){
  assert.equal(this,target);const index=calls.length;calls.push({target,keyframes,options});
  if(index===throwAt)throw Error('Native animation unavailable');
  const completion=index===invalidAt?null:deferred(),preparation=index===invalidReadyAt?null:manualReady?deferred():{promise:Promise.resolve()};let preparationRead=false;
  const item={cancels:0,hiddenAtCancel:[],finish:()=>completion?.resolve(),reject:()=>completion?.reject(new DOMException('Cancelled','AbortError')),
   accept:()=>preparation?.resolve?.(),rejectReady:()=>preparation?.reject?.(new DOMException('Cancelled','AbortError'))};
  item.handle={...(completion?{finished:completion.promise}:{}),get ready(){preparationRead=true;return preparation?.promise;},cancel(){item.cancels++;item.hiddenAtCancel.push(f.loader.hasAttribute('hidden'));item.reject();if(preparationRead)item.rejectReady();}};
  owned.push(item);return item.handle;
 };
 return{content,calls,owned,frames,requested,cancelled,frame(){const next=frames.entries().next().value;assert.ok(next,'Expected one native presentation callback');frames.delete(next[0]);next[1](f.now());}};
}
async function presented(native){await flush();native.frame();await flush();}

test('generic arrival cannot reveal before every SSR-declared model has actually prepared',async t=>{
 const nodes=[new Element(),new Element()],f=environment({previews:nodes}),native=nativeReveal(f),manager=connect(t,f);
 await flush();assert.deepEqual(phases(manager),['requested']);assert.equal(native.frames.size,0);assert.deepEqual(manager.inspect().previews.pending,['preview-1','preview-2']);
 const first=registerPagePreviewReadiness(f.doc,nodes[0]);first.report({mode:'model'});await flush();assert.equal(native.frames.size,0);
 const second=registerPagePreviewReadiness(f.doc,nodes[1]);second.report({mode:'model'});await flush();assert.deepEqual(phases(manager),['requested']);assert.equal(native.frames.size,1);
 assert.equal(manager.inspect().readiness.ready,true);native.frame();await flush();assert.equal(manager.inspect().phase,'revealing');
 native.owned.forEach(item=>item.finish());await flush();assert.equal(manager.inspect().phase,'entered');
});

test('preview preparation consumes the existing arrival budget instead of receiving a new deadline',async t=>{
 const node=new Element(),f=environment({previews:[node]}),native=nativeReveal(f),manager=connect(t,f);await flush();
 const registration=registerPagePreviewReadiness(f.doc,node);f.advance(14000);registration.report({mode:'model'});await flush();
 assert.equal([...f.timers.values()][0].at,15000);f.advance(999);native.frame();await flush();assert.equal(manager.inspect().phase,'revealing');assert.equal([...f.timers.values()][0].at,16599);
 native.owned.forEach(item=>item.finish());await flush();assert.equal(manager.inspect().phase,'entered');
});

test('explicit static preview policy still waits for critical poster decoding before static entry',async t=>{
 const poster=new Element(),decoded=deferred(),node=new Element();Object.assign(poster,{complete:true,naturalWidth:100,decode:()=>decoded.promise});
 const f=environment({previews:[node],images:[poster]}),native=nativeReveal(f);f.media.matches=true;const manager=connect(t,f);
 registerPagePreviewReadiness(f.doc,node).report({mode:'static',reason:'reduced-motion'});await flush();assert.deepEqual(phases(manager),['requested']);assert.equal(f.content.hasAttribute('inert'),true);
 decoded.resolve();await flush();assert.deepEqual(phases(manager),['requested','ready','revealing','entered']);assert.deepEqual(manager.inspect().readiness.previews,[{mode:'static',reason:'reduced-motion'}]);
 assert.equal(native.calls.length,0);assert.equal(native.requested.length,0);
});

test('unknown preview markers fail open at the original startup endpoint without fabricating ready or entered',async t=>{
 const node=new Element(),f=environment({previews:[node]}),native=nativeReveal(f),manager=connect(t,f);await flush();f.advance(15000);await flush();
 assert.deepEqual(phases(manager),['requested','failed']);assert.equal(manager.inspect().reason,'readiness-timeout');assert.equal(native.frames.size,0);assert.equal(f.content.hasAttribute('inert'),false);
 registerPagePreviewReadiness(f.doc,node).report({mode:'model'});await flush();assert.deepEqual(phases(manager),['requested','failed']);assert.equal(f.timers.size,0);
});

test('global startup expiry aborts unfinished card enhancement before exposing its explicit static fallback',async t=>{
 const node=new Element(),f=environment({previews:[node]}),native=nativeReveal(f),events=[],manager=connect(t,f);let registration;
 registration=registerPagePreviewReadiness(f.doc,node,{onFallback:reason=>{
  assert.equal(f.loader.hasAttribute('hidden'),false);assert.equal(f.content.hasAttribute('inert'),true);
  events.push('abort');registration.report({mode:'static',reason});
 }});
 manager.onReadiness(fact=>{if(fact.phase==='failed'){events.push('uncovered');assert.equal(f.loader.hasAttribute('hidden'),true);assert.equal(manager.inspect().previews.previews[0].mode,'static');}});
 await flush();f.advance(15000);await flush();assert.deepEqual(events,['abort','uncovered']);assert.deepEqual(phases(manager),['requested','failed']);assert.equal(native.calls.length,0);
 assert.equal(registration.report({mode:'model'}),false);assert.equal(f.timers.size,0);
});

test('expired preview completion cannot receive a fresh reveal budget or enter after a delayed deadline callback',async t=>{
 const node=new Element(),f=environment({previews:[node]}),native=nativeReveal(f),manager=connect(t,f),registration=registerPagePreviewReadiness(f.doc,node);await flush();
 f.elapse(15000);registration.report({mode:'model'});await flush();assert.deepEqual(phases(manager),['requested','failed']);assert.equal(manager.inspect().reason,'presentation-timeout');
 assert.equal(native.calls.length,0);assert.equal(native.frames.size,0);assert.equal(f.timers.size,0);
});

test('pending cancellation releases acquisition and lease before uncovering; a prevented activation cannot introduce a late model',async t=>{
 for(const action of ['prevented-activation','pagehide','dispose']){
  const node=new Element(),f=environment({previews:[node]}),native=nativeReveal(f),manager=connect(t,f),acquired=deferred(),events=[];
  let signal,leases=0,lateDisposals=0,registration;
  const lifecycle=createPreviewLifecycle({start:options=>{signal=options.signal;signal.addEventListener('abort',()=>events.push('abort'),{once:true});return acquired.promise;},
   lease:{acquire(){leases++;return()=>{leases--;events.push('lease-released');};}},setTimeout:f.win.setTimeout,clearTimeout:f.win.clearTimeout,
   onState:snapshot=>{if(snapshot.phase==='ready')registration.report({mode:'model'});}});
  t.after(()=>lifecycle.dispose());
  registration=registerPagePreviewReadiness(f.doc,node,{onFallback:reason=>{
   assert.equal(f.loader.hasAttribute('hidden'),false);lifecycle.stop(reason);registration.report({mode:'static',reason});events.push('static');
  }});
  manager.onReadiness(fact=>{if(fact.phase==='cancelled'){assert.equal(signal.aborted,true);assert.equal(leases,0);assert.equal(f.loader.hasAttribute('hidden'),true);events.push(`uncovered:${fact.reason}`);}});
  lifecycle.setActive(true);await flush();assert.equal(leases,1);assert.equal(native.frames.size,0);
  if(action==='prevented-activation'){
   f.doc.addEventListener('click',event=>event.preventDefault());f.click('https://example.test/about/');await flush();assert.equal(manager.inspect().reason,'activation-prevented');
  }else if(action==='pagehide')f.page('pagehide',true);else manager.dispose();
  assert.deepEqual(events.slice(0,4),['abort','lease-released','static',`uncovered:${action==='prevented-activation'?'superseded':action==='pagehide'?'page-hidden':'disconnected'}`]);
  acquired.resolve({dispose(){lateDisposals++;},resize(){assert.fail('A cancelled late handle cannot draw');}});await flush();assert.equal(lateDisposals,1);
  assert.equal(lifecycle.inspect().phase,'poster');assert.equal(registration.report({mode:'model'}),false);assert.equal(native.calls.length,0);assert.equal(native.frames.size,0);assert.equal(f.timers.size,0);
  const lateReasons=[];const late=registerPagePreviewReadiness(f.doc,node,{onFallback:reason=>lateReasons.push(reason)});
  assert.equal(lateReasons.length,1);assert.equal(late.report({mode:'model'}),false);late.release();registration.release();
 }
});

test('cancelling pending preview composition prevents stale completion and BFCache starts a distinct bounded arrival',async t=>{
 const node=new Element(),f=environment({previews:[node]}),native=nativeReveal(f),manager=connect(t,f);await flush();const original=manager.inspect().id;
 f.page('pagehide',true);const reasons=[],registration=registerPagePreviewReadiness(f.doc,node,{onFallback:reason=>reasons.push(reason)});
 assert.deepEqual(reasons,['page-hidden']);assert.equal(registration.report({mode:'model'}),false);registration.report({mode:'static',reason:'page-hidden'});
 await flush();assert.equal(manager.inspect().phase,'cancelled');assert.equal(native.frames.size,0);
 f.advance(1);f.page('pageshow',true);await flush();assert.notEqual(manager.inspect().id,original);assert.equal(manager.inspect().phase,'entered');
 assert.deepEqual(manager.inspect().history.filter(fact=>fact.id===original).map(fact=>fact.phase),['requested','cancelled']);assert.equal(f.timers.size,0);
});

test('delegated Bending entry does not acquire generic page-preview readiness or native reveal ownership',async t=>{
 const f=environment({url:'https://example.test/projects/bending-active/',previews:[new Element()]}),native=nativeReveal(f);let scene,previewAcquisitions=0;
 const manager=connect(t,f,{acquirePreviews(){previewAcquisitions++;throw Error('Bending must not acquire card readiness');},subscribeScene(listener){scene=listener;return()=>{};}});await flush();
 scene({id:1,phase:'ready'});scene({id:1,phase:'revealing'});scene({id:1,phase:'entered'});await flush();assert.equal(manager.inspect().phase,'entered');
 assert.equal(previewAcquisitions,0);assert.equal(native.requested.length,0);assert.equal(native.calls.length,0);
});

test('resources, finite presentation and both native play acknowledgements share the original arrival budget',async t=>{
 const font=deferred(),f=environment({fonts:font.promise}),native=nativeReveal(f,{manualReady:true}),manager=connect(t,f);
 const [[timerId,timer]]=f.timers;assert.equal(timer.at,15000);f.advance(2000);font.resolve();await flush();
 assert.deepEqual(phases(manager),['requested']);assert.equal(manager.inspect().readiness.ready,true);assert.equal(native.calls.length,0);assert.equal(native.frames.size,1);
 assert.equal(f.timers.get(timerId),timer);assert.equal(f.timers.size,1);
 f.advance(350);native.frame();await flush();assert.equal(manager.inspect().phase,'requested');assert.equal(native.calls.length,2);assert.equal(native.frames.size,0);
 native.requested[0].callback(f.now());assert.equal(native.calls.length,2);f.advance(4000);native.owned[0].accept();await flush();assert.equal(manager.inspect().phase,'requested');
 native.owned[1].accept();await flush();assert.equal(manager.inspect().phase,'revealing');assert.equal(f.timers.has(timerId),false);
 assert.equal([...f.timers.values()][0].at,7950);assert.equal(f.timers.size,1);
 native.owned.forEach(item=>item.finish());await flush();assert.equal(manager.inspect().phase,'entered');assert.equal(f.timers.size,0);assert.equal(native.requested.length,1);
});

test('withheld presentation uses startup expiry while accepted but unfinished effects use the separate reveal deadline',async t=>{
 for(const delivered of [0,1]){
  const f=environment(),native=nativeReveal(f),manager=connect(t,f);await flush();if(delivered){native.frame();await flush();}
  const pending=native.requested.at(-1);f.advance((delivered?1600:15000)-1);assert.equal(manager.inspect().phase,delivered?'revealing':'requested');f.advance(1);
  assert.deepEqual(phases(manager),['requested',...(delivered?['ready','revealing']:[]),'failed']);assert.equal(manager.inspect().reason,delivered?'reveal-timeout':'presentation-timeout');
  assert.equal(native.calls.length,delivered?2:0);assert.equal(native.frames.size,0);assert.deepEqual(native.cancelled,delivered?[]:[pending.id]);assert.equal(f.timers.size,0);
  for(const item of native.owned)assert.equal(item.cancels,1);
  pending.callback(f.now());assert.equal(native.requested.length,1);assert.equal(native.calls.length,delivered?2:0);assert.equal(manager.inspect().phase,'failed');
 }
});

test('every interrupted presentation barrier cancels its sole pending frame and ignores a late delivery',async t=>{
 for(const delivered of [0,1])for(const action of ['navigation','pagehide','dispose','restored']){
  const f=environment(),native=nativeReveal(f),manager=connect(t,f);await flush();if(delivered){native.frame();await flush();}
  const id=manager.inspect().id,pending=native.requested.at(-1);
  if(action==='navigation')f.click('https://example.test/about/');
  else if(action==='dispose')manager.dispose();
  else{f.page('pagehide',action==='restored');if(action==='restored'){f.advance(1);f.page('pageshow',true);}}
  pending.callback(f.now());await flush();
  assert.deepEqual(manager.inspect().history.filter(fact=>fact.id===id).map(fact=>fact.phase),['requested',...(delivered?['ready','revealing']:[]),'cancelled']);
  assert.deepEqual(native.cancelled,delivered?[]:[pending.id]);assert.equal(native.frames.size,0);assert.equal(native.calls.length,delivered?2:0);assert.equal(native.requested.length,1);
  for(const item of native.owned){assert.equal(item.cancels,1);assert.deepEqual(item.hiddenAtCancel,[true]);}
  if(action==='restored'){assert.equal(manager.inspect().phase,'entered');assert.notEqual(manager.inspect().id,id);}
  if(action==='dispose')assert.equal(manager.inspect().events.nativeListeners,0);
  if(action!=='navigation')assert.equal(f.timers.size,0);
 }
});

test('Reduced or hidden before presentation or during the effects closes the existing visual owner statically',async t=>{
 for(const delivered of [0,1])for(const mode of ['reduced','hidden']){
  const f=environment(),native=nativeReveal(f),manager=connect(t,f);await flush();if(delivered){native.frame();await flush();}const pending=native.requested.at(-1);
  if(mode==='reduced'){f.media.matches=true;f.media.dispatchEvent(new Event('change'));}else{f.doc.hidden=true;f.doc.dispatchEvent(new Event('visibilitychange'));}
  assert.deepEqual(phases(manager),['requested','ready','revealing','entered']);assert.equal(manager.inspect().reason,mode==='reduced'?'reduced-motion':'hidden-static');
  assert.deepEqual(native.cancelled,delivered?[]:[pending.id]);assert.equal(native.frames.size,0);assert.equal(native.calls.length,delivered?2:0);assert.equal(f.timers.size,0);
  for(const item of native.owned){assert.equal(item.cancels,1);assert.deepEqual(item.hiddenAtCancel,[true]);}
  pending.callback(f.now());assert.equal(native.requested.length,1);assert.equal(native.calls.length,delivered?2:0);
 }
});

test('overdue preparation, native completions, CSS events and policy changes cannot beat undelivered deadline timers',async t=>{
 for(const signal of ['presentation-frame','native-ready','preparation-policy','post-presentation-policy','native-finished','css-event','reduced']){
  const preparing=['presentation-frame','native-ready','preparation-policy'].includes(signal);
  const f=environment(),native=signal==='css-event'?null:nativeReveal(f,{manualReady:preparing}),manager=connect(t,f);await flush();
  if(signal==='native-ready'){native.frame();native.owned.forEach(item=>item.accept());}
  else if(signal==='post-presentation-policy'||signal==='native-finished'||signal==='reduced'){native.frame();await flush();}
  if(signal==='native-finished')native.owned.forEach(item=>item.finish());
  f.elapse(preparing?15000:1600);assert.equal(f.timers.size,1);
  if(signal==='presentation-frame')native.frame();
  else if(signal==='post-presentation-policy'||signal==='preparation-policy'){f.doc.hidden=true;f.doc.dispatchEvent(new Event('visibilitychange'));}
  else if(signal==='css-event')f.loader.dispatchEvent(new Event('animationend'));
  else if(signal==='reduced'){f.media.matches=true;f.media.dispatchEvent(new Event('change'));}
  await flush();assert.equal(manager.inspect().phase,'failed',signal);assert.equal(manager.inspect().reason,preparing?'presentation-timeout':'reveal-timeout',signal);
  assert.equal(phases(manager).includes('entered'),false);assert.equal(f.timers.size,0);if(native)assert.equal(native.frames.size,0);
 }
});

test('synchronous ready observers consume the same deadline budget instead of postponing its start',async t=>{
 const f=environment(),native=nativeReveal(f),manager=connect(t,f);manager.onReadiness(fact=>{if(fact.phase==='ready')f.elapse(450);});await flush();
 native.frame();await flush();
 assert.equal(f.now(),450);assert.equal([...f.timers.values()][0].at,1600);
 f.advance(1149);assert.equal(manager.inspect().phase,'revealing');f.advance(1);
 assert.deepEqual(phases(manager),['requested','ready','revealing','failed']);assert.equal(native.calls.length,2);assert.equal(native.frames.size,0);assert.equal(f.timers.size,0);
});

test('startup starts at arrival rather than resource settlement and bounds the full dynamic lifetime to 15 seconds plus reveal',async t=>{
 for(const overdue of [false,true]){
  const font=deferred(),f=environment({fonts:font.promise}),native=nativeReveal(f,{manualReady:true});
  const manager=createSiteNavigation({window:f.win,document:f.doc,element:f.loader,now:f.now});
  manager.onReadiness(fact=>{if(fact.phase==='requested')f.elapse(4000);});manager.start();t.after(()=>manager.dispose());
  assert.equal(f.timers.size,2);for(const timer of f.timers.values())assert.equal(timer.at,15000);
  f.advance(10000);font.resolve();await flush();assert.equal(manager.inspect().phase,'requested');assert.equal([...f.timers.values()][0].at,15000);
  f.advance(500);native.frame();await flush();f.advance(499);native.owned.forEach(item=>item.accept());await flush();
  assert.equal(manager.inspect().phase,'revealing');assert.equal([...f.timers.values()][0].at,16599);
  f.elapse(overdue?1600:1599);native.owned.forEach(item=>item.finish());await flush();
  assert.equal(manager.inspect().phase,overdue?'failed':'entered');assert.equal(manager.inspect().reason,overdue?'reveal-timeout':'');assert.equal(f.timers.size,0);
 }
});

test('actual finished signals arriving before play readiness are retained but cannot create an early terminal',async t=>{
 for(const overdue of [false,true]){
  const f=environment(),native=nativeReveal(f,{manualReady:true}),manager=connect(t,f);await presented(native);
  assert.deepEqual(phases(manager),['requested']);native.owned.forEach(item=>item.finish());await flush();assert.equal(manager.inspect().phase,'requested');
  native.owned[0].accept();await flush();assert.equal(manager.inspect().phase,'requested');
  if(overdue)f.elapse(15000);native.owned[1].accept();await flush();
  assert.deepEqual(phases(manager),overdue?['requested','failed']:['requested','ready','revealing','entered']);
  assert.equal(manager.inspect().reason,overdue?'presentation-timeout':'');assert.equal(f.timers.size,0);
  for(const item of native.owned){assert.equal(item.cancels,1);assert.deepEqual(item.hiddenAtCancel,[true]);}
 }
});

test('missing or rejected native play-readiness stays bounded without a CSS writer or unhandled finished rejection',async t=>{
 for(const index of [0,1])for(const missing of [false,true]){
  const f=environment(),native=nativeReveal(f,{manualReady:true,...(missing?{invalidReadyAt:index}:{})}),manager=connect(t,f);await presented(native);
  if(!missing)native.owned[index].rejectReady();native.owned.forEach(item=>{item.accept();item.reject();});await flush();
  f.loader.dispatchEvent(new Event('animationend'));assert.equal(manager.inspect().phase,'requested');assert.equal(f.loader.getAttribute('data-site-reveal'),'native');
  f.advance(14999);assert.equal(manager.inspect().phase,'requested');f.advance(1);await flush();
  assert.deepEqual(phases(manager),['requested','failed']);assert.equal(manager.inspect().reason,'presentation-timeout');assert.equal(f.timers.size,0);
 }
});

test('two fulfilled effects cannot bypass a withheld, rejected or missing second native play acknowledgement',async t=>{
 for(const mode of ['withheld','rejected','missing']){
  const f=environment(),native=nativeReveal(f,{manualReady:true,...(mode==='missing'?{invalidReadyAt:1}:{})}),manager=connect(t,f);await presented(native);
  assert.equal(native.owned.length,2);native.owned.forEach(item=>item.finish());native.owned[0].accept();if(mode==='rejected')native.owned[1].rejectReady();await flush();
  assert.deepEqual(phases(manager),['requested']);f.advance(14999);assert.equal(manager.inspect().phase,'requested');f.advance(1);await flush();
  assert.deepEqual(phases(manager),['requested','failed']);assert.equal(manager.inspect().reason,'presentation-timeout');assert.equal(f.timers.size,0);
  native.owned.forEach(item=>{item.accept();item.finish();});await flush();assert.deepEqual(phases(manager),['requested','failed']);
 }
});

test('Reduced and hidden policies cannot bypass unfinished or expired document resources',async t=>{
 for(const mode of ['reduced','hidden'])for(const expired of [false,true]){
  const font=deferred(),f=environment({fonts:font.promise}),native=nativeReveal(f),manager=connect(t,f);await flush();
  if(mode==='reduced'){f.media.matches=true;f.media.dispatchEvent(new Event('change'));}else{f.doc.hidden=true;f.doc.dispatchEvent(new Event('visibilitychange'));}
  assert.deepEqual(phases(manager),['requested']);assert.equal(f.content.hasAttribute('inert'),true);
  if(expired)f.elapse(15000);else f.advance(4000);font.resolve();await flush();
  assert.deepEqual(phases(manager),expired?['requested','failed']:['requested','ready','revealing','entered']);
  assert.equal(manager.inspect().reason,expired?'presentation-timeout':mode==='hidden'?'hidden-static':'');
  assert.equal(native.calls.length,0);assert.equal(native.requested.length,0);assert.equal(f.timers.size,0);assert.equal(f.content.hasAttribute('inert'),false);
 }
});

test('native pending-play handles release before any ready fact on cancellation and ignore all late promises',async t=>{
 for(const action of ['navigation','pagehide','dispose','restored']){
  const f=environment(),native=nativeReveal(f,{manualReady:true}),manager=connect(t,f);await presented(native);const id=manager.inspect().id;
  assert.deepEqual(phases(manager),['requested']);
  if(action==='navigation')f.click('https://example.test/about/');else if(action==='dispose')manager.dispose();
  else{f.page('pagehide',action==='restored');if(action==='restored'){f.advance(1);f.page('pageshow',true);}}
  native.owned.forEach(item=>{item.accept();item.finish();});await flush();
  assert.deepEqual(manager.inspect().history.filter(fact=>fact.id===id).map(fact=>fact.phase),['requested','cancelled']);
  for(const item of native.owned){assert.equal(item.cancels,1);assert.deepEqual(item.hiddenAtCancel,[true]);}
  assert.equal(native.requested.length,1);assert.equal(native.calls.length,2);assert.equal(native.frames.size,0);
  if(action==='restored')assert.equal(manager.inspect().phase,'entered');if(action!=='navigation')assert.equal(f.timers.size,0);
 }
});

test('static policy during native pending play closes only the resource-ready request and cancels both owned effects',async t=>{
 for(const mode of ['reduced','hidden']){
  const f=environment(),native=nativeReveal(f,{manualReady:true}),manager=connect(t,f);await presented(native);assert.equal(manager.inspect().phase,'requested');
  if(mode==='reduced'){f.media.matches=true;f.media.dispatchEvent(new Event('change'));}else{f.doc.hidden=true;f.doc.dispatchEvent(new Event('visibilitychange'));}
  assert.deepEqual(phases(manager),['requested','ready','revealing','entered']);assert.equal(manager.inspect().reason,mode==='reduced'?'reduced-motion':'hidden-static');
  native.owned.forEach(item=>{item.accept();item.finish();assert.equal(item.cancels,1);assert.deepEqual(item.hiddenAtCancel,[true]);});await flush();
  assert.equal(manager.inspect().phase,'entered');assert.equal(phases(manager).filter(phase=>phase==='entered').length,1);assert.equal(f.timers.size,0);
 }
});

test('an early startup timer preserves prerequisites and re-arms only the remaining original endpoint',async t=>{
 const font=deferred(),f=environment({fonts:font.promise}),native=nativeReveal(f,{manualReady:true}),manager=connect(t,f);
 const [[id,timer]]=f.timers;f.timers.delete(id);f.elapse(14999.25);timer.callback();await flush();
 assert.equal(manager.inspect().phase,'requested');assert.equal(manager.inspect().readiness,null);assert.equal(f.timers.size,2);
 font.resolve();await flush();assert.equal(manager.inspect().readiness.ready,true);assert.equal(manager.inspect().phase,'requested');
 assert.equal(f.timers.size,1);assert.equal([...f.timers.values()][0].at,15000.25);
 f.elapse(.75);native.frame();await flush();assert.deepEqual(phases(manager),['requested','failed']);
 assert.equal(manager.inspect().reason,'presentation-timeout');assert.equal(native.calls.length,0);assert.equal(f.timers.size,0);
});

test('native reveal waits for both actual completions, ignores CSS events and releases fill effects after hiding',async t=>{
 for(const order of [[0,1],[1,0]]){
  const f=environment(),native=nativeReveal(f),manager=connect(t,f);await presented(native);
  assert.equal(f.loader.getAttribute('data-site-reveal'),'native');assert.equal(native.calls.length,2);
  assert.equal(native.calls[0].target,f.loader);assert.equal(native.calls[1].target,native.content);
  for(const call of native.calls)assert.deepEqual(call.options,{duration:720,easing:'cubic-bezier(.45,0,.15,1)',fill:'both'});
  assert.deepEqual(native.calls[0].keyframes,[{opacity:1},{opacity:0}]);
  assert.deepEqual(native.calls[1].keyframes,[{transform:'translateY(0)'},{transform:'translateY(-12px)'}]);
  f.loader.dispatchEvent(new Event('animationend'));assert.equal(manager.inspect().phase,'revealing');
  native.owned[order[0]].finish();await flush();assert.equal(manager.inspect().phase,'revealing');
  native.owned[order[1]].finish();await flush();assert.deepEqual(phases(manager),['requested','ready','revealing','entered']);
  f.loader.dispatchEvent(new Event('animationend'));await flush();assert.equal(phases(manager).filter(phase=>phase==='entered').length,1);
  assert.equal(f.timers.size,0);assert.equal(f.content.hasAttribute('inert'),false);assert.equal(f.loader.hasAttribute('data-site-reveal'),false);
  for(const item of native.owned){assert.equal(item.cancels,1);assert.deepEqual(item.hiddenAtCancel,[true]);}
 }
});

test('pending or rejected native completion keeps the unchanged failure deadline and never becomes a late success',async t=>{
 for(const reject of [false,true]){
  const f=environment(),native=nativeReveal(f),manager=connect(t,f);await presented(native);
  if(reject)native.owned[0].reject();await flush();
  f.loader.dispatchEvent(new Event('animationend'));f.advance(1599);assert.equal(manager.inspect().phase,'revealing');
  f.advance(1);assert.equal(manager.inspect().phase,'failed');assert.equal(manager.inspect().reason,'reveal-timeout');
  native.owned.forEach(item=>item.finish());await flush();
  assert.deepEqual(phases(manager),['requested','ready','revealing','failed']);assert.equal(f.timers.size,0);assert.equal(f.content.hasAttribute('inert'),false);
  for(const item of native.owned){assert.equal(item.cancels,1);assert.deepEqual(item.hiddenAtCancel,[true]);}
 }
});

test('native API exceptions and missing completion promises cannot synthesize success or start a CSS writer',async t=>{
 for(const options of [{throwAt:0},{throwAt:1},{invalidAt:0},{invalidAt:1}]){
  const f=environment(),native=nativeReveal(f,options),manager=connect(t,f);await presented(native);
  assert.equal(f.loader.getAttribute('data-site-reveal'),'native');f.loader.dispatchEvent(new Event('animationend'));
  native.owned.forEach(item=>item.finish());await flush();assert.equal(manager.inspect().phase,'requested');
  f.advance(15000);await flush();assert.equal(manager.inspect().phase,'failed');assert.equal(manager.inspect().reason,'presentation-timeout');
  assert.equal(f.timers.size,0);for(const item of native.owned)assert.equal(item.cancels,1);
 }
});

test('one missing animation API retains the original CSS completion path without partially creating native effects',async t=>{
 const f=environment(),native=nativeReveal(f);delete native.content.animate;
 const manager=connect(t,f);await flush();assert.equal(native.calls.length,0);assert.equal(f.loader.hasAttribute('data-site-reveal'),false);
 f.loader.dispatchEvent(new Event('animationend'));assert.equal(manager.inspect().phase,'entered');assert.equal(f.timers.size,0);
});

test('queued native completion cannot escape supersession, pagehide, disposal or a fresh BFCache arrival',async t=>{
 for(const action of ['navigation','pagehide','dispose','restored']){
  const f=environment(),native=nativeReveal(f),manager=connect(t,f);await presented(native);const id=manager.inspect().id;
  native.owned.forEach(item=>item.finish());
  if(action==='navigation')f.click('https://example.test/about/');
  else if(action==='dispose')manager.dispose();
  else{f.page('pagehide',action==='restored');if(action==='restored'){f.advance(1);f.page('pageshow',true);}}
  await flush();
  assert.deepEqual(manager.inspect().history.filter(fact=>fact.id===id).map(fact=>fact.phase),['requested','ready','revealing','cancelled']);
  for(const item of native.owned){assert.equal(item.cancels,1);assert.deepEqual(item.hiddenAtCancel,[true]);}
  assert.equal(native.calls.length,2);
  if(action==='navigation'){assert.equal(manager.inspect().phase,'requested');assert.notEqual(manager.inspect().id,id);}
  else if(action==='restored'){assert.equal(manager.inspect().phase,'entered');assert.notEqual(manager.inspect().id,id);assert.equal(f.timers.size,0);}
  else{assert.equal(manager.inspect().phase,'cancelled');assert.equal(f.timers.size,0);}
  if(action==='dispose')assert.equal(manager.inspect().events.nativeListeners,0);
 }
});

test('native-capable Reduced and hidden arrivals stay static and live policy changes release both effects',async t=>{
 for(const mode of ['reduced','hidden']){
  const initial=environment(),available=nativeReveal(initial);if(mode==='reduced')initial.media.matches=true;else initial.doc.hidden=true;
  const staticManager=connect(t,initial);await flush();assert.equal(staticManager.inspect().phase,'entered');assert.equal(available.calls.length,0);assert.equal(available.requested.length,0);assert.equal(initial.timers.size,0);
  const f=environment(),native=nativeReveal(f),manager=connect(t,f);await presented(native);
  if(mode==='reduced'){f.media.matches=true;f.media.dispatchEvent(new Event('change'));}else{f.doc.hidden=true;f.doc.dispatchEvent(new Event('visibilitychange'));}
  assert.equal(manager.inspect().phase,'entered');await flush();f.advance(1600);
  assert.deepEqual(phases(manager),['requested','ready','revealing','entered']);assert.equal(f.timers.size,0);
  for(const item of native.owned){assert.equal(item.cancels,1);assert.deepEqual(item.hiddenAtCancel,[true]);}
 }
});

test('Bending entry remains delegated without native reveal APIs, effects or another completion owner',async t=>{
 let scene;const f=environment({url:'https://example.test/projects/bending-active/'}),native=nativeReveal(f);
 const manager=connect(t,f,{subscribeScene:listener=>{scene=listener;return()=>{};}});await flush();
 scene({id:1,phase:'ready'});scene({id:1,phase:'revealing'});f.loader.dispatchEvent(new Event('animationend'));assert.equal(manager.inspect().phase,'revealing');
 assert.equal(native.calls.length,0);assert.equal(native.requested.length,0);assert.equal(f.loader.hasAttribute('data-site-reveal'),false);assert.equal(f.timers.size,0);
 scene({id:1,phase:'entered'});assert.deepEqual(phases(manager),['requested','ready','revealing','entered']);
});

test('generic arrival waits for DOM, fonts and selected critical-image decode, then one real CSS completion enters',async t=>{
 const font=deferred(),decode=deferred(),image=new Element();Object.assign(image,{complete:false,naturalWidth:0,decode:()=>decode.promise});
 const f=environment({fonts:font.promise,images:[image],readyState:'loading'}),manager=connect(t,f);
 assert.deepEqual(phases(manager),['requested']);assert.equal(f.content.getAttribute('inert'),'');
 font.resolve();await flush();assert.equal(manager.inspect().phase,'requested');
 f.doc.readyState='interactive';f.doc.dispatchEvent(new Event('DOMContentLoaded'));await flush();
 image.naturalWidth=900;image.dispatchEvent(new Event('load'));await flush();assert.equal(manager.inspect().phase,'requested');
 decode.resolve();await flush();assert.deepEqual(phases(manager),['requested','ready','revealing']);
 assert.equal(f.content.getAttribute('aria-busy'),'true');assert.equal(f.loader.hasAttribute('hidden'),false);
 f.loader.dispatchEvent(new Event('animationend'));assert.equal(manager.inspect().phase,'entered');
 assert.equal(f.content.hasAttribute('inert'),false);assert.equal(f.navigation.hasAttribute('inert'),false);assert.equal(f.loader.hasAttribute('hidden'),true);
 f.loader.dispatchEvent(new Event('animationend'));assert.deepEqual(phases(manager),['requested','ready','revealing','entered']);assert.equal(f.timers.size,0);
});

test('font/image failure and readiness deadline fail open with one failed terminal, never a later entered fact',async t=>{
 for(const kind of ['fonts','image','deadline']){
  const font=deferred(),image=new Element();Object.assign(image,{complete:true,naturalWidth:0});
  const f=environment({fonts:kind==='fonts'?font.promise:kind==='deadline'?new Promise(()=>{}):Promise.resolve(),images:kind==='image'?[image]:[]});
  const manager=connect(t,f);if(kind==='fonts')font.reject(Error('font'));await flush();if(kind==='deadline')f.advance(15000);await flush();
  assert.equal(manager.inspect().phase,'failed',kind);assert(manager.inspect().reason.includes(kind==='deadline'?'readiness-timeout':kind==='image'?'critical-image-unavailable':'fonts-unavailable'));
  assert.equal(f.content.hasAttribute('inert'),false);f.loader.dispatchEvent(new Event('animationend'));assert.deepEqual(phases(manager),['requested','failed']);assert.equal(f.timers.size,0);
 }
});

test('missing animation completion is failed rather than synthetic entered; Reduced and hidden arrivals do not animate',async t=>{
 const f=environment(),manager=connect(t,f);await flush();assert.equal(manager.inspect().phase,'revealing');f.advance(1600);
 assert.deepEqual(phases(manager),['requested','ready','revealing','failed']);assert.equal(manager.inspect().reason,'reveal-timeout');
 for(const mode of ['reduced','hidden']){
  const next=environment();if(mode==='reduced')next.media.matches=true;else next.doc.hidden=true;
  const current=connect(t,next);await flush();assert.deepEqual(phases(current),['requested','ready','revealing','entered']);assert.equal(next.timers.size,0);
 }
});

test('same-page hashes, modified/external/downloaded links remain native without starting requests',async t=>{
 const f=environment(),manager=connect(t,f);await flush();f.loader.dispatchEvent(new Event('animationend'));const count=manager.inspect().history.length;
 for(const [url,properties] of [['https://example.test/#projects',{}],['https://example.test/about/',{ctrlKey:true}],['https://elsewhere.test/about/',{}]])f.click(url,properties);
 f.click('https://example.test/about/',{},{hasAttribute:name=>name==='download'});
 f.click('https://example.test/about/',{},{target:'_blank'});
 assert.equal(manager.inspect().history.length,count);assert.equal(f.storage.has(SITE_HANDOFF_KEY),false);
});

test('native cross-document handoff continues the same request id, and superseding clicks cancel only their previous request',async t=>{
 const f=environment(),first=connect(t,f);await flush();f.loader.dispatchEvent(new Event('animationend'));
 f.click('https://example.test/about/');const cancelledId=first.inspect().id;
 f.click('https://example.test/contact/');const id=first.inspect().id;
 assert.notEqual(id,cancelledId);assert.equal(first.inspect().history.filter(fact=>fact.id===cancelledId&&fact.phase==='cancelled').length,1);
 assert.equal(f.loader.hasAttribute('hidden'),false);f.page('pagehide',true);assert.equal(first.inspect().handedOff,true);assert.equal(f.timers.size,0);
 const destination=environment({url:'https://example.test/contact/',storage:f.storage}),second=connect(t,destination);await flush();
 assert.equal(second.inspect().id,id);destination.loader.dispatchEvent(new Event('animationend'));assert.deepEqual(second.inspect().history.filter(fact=>fact.id===id).map(fact=>fact.phase),['requested','ready','revealing','entered']);
 f.page('pageshow',true);await flush();assert.equal(first.inspect().phase,'entered');assert.equal(first.inspect().history.filter(fact=>fact.id===id&&fact.phase==='entered').length,1);
});

test('prevented activation, navigation timeout and pagehide each release their own unfinished gate',async t=>{
 const f=environment(),manager=connect(t,f);await flush();f.loader.dispatchEvent(new Event('animationend'));
 const click=f.click('https://example.test/about/');click.preventDefault();await flush();assert.equal(manager.inspect().phase,'cancelled');assert.equal(manager.inspect().reason,'activation-prevented');
 f.click('https://example.test/about/');f.win.dispatchEvent(new Event('popstate'));assert.equal(manager.inspect().reason,'history-navigation');
 f.click('https://example.test/contact/');f.advance(15000);assert.equal(manager.inspect().phase,'failed');assert.equal(manager.inspect().reason,'navigation-timeout');assert.equal(f.loader.hasAttribute('hidden'),true);
 const pending=environment({fonts:new Promise(()=>{})}),other=connect(t,pending);pending.page('pagehide');await flush();assert.equal(other.inspect().phase,'cancelled');assert.equal(pending.content.hasAttribute('inert'),false);assert.equal(pending.timers.size,0);
});

test('a native same-URL reload is a new document request, while an explicit empty fragment is not',async t=>{
 const f=environment(),manager=connect(t,f);await flush();f.loader.dispatchEvent(new Event('animationend'));
 f.click('https://example.test/#');assert.equal(manager.inspect().phase,'entered');
 f.click('https://example.test/');assert.equal(manager.inspect().phase,'requested');assert.equal(manager.inspect().kind,'navigation');
});

test('scene routes delegate actual entry phases and never start a site reveal timer or generic content writer',async t=>{
 let scene;const f=environment({url:'https://example.test/projects/bending-active/#form'}),manager=connect(t,f,{subscribeScene:listener=>{scene=listener;return()=>{scene=null;};}});
 scene({id:7,phase:'preparing'});scene({id:7,phase:'ready'});scene({id:7,phase:'revealing'});await flush();
 assert.equal(f.content.hasAttribute('inert'),false);assert.equal(f.loader.hasAttribute('hidden'),true);assert.equal(manager.inspect().phase,'revealing');assert.equal(f.timers.size,0);
 scene({id:7,phase:'entered'});scene({id:7,phase:'entered'});assert.deepEqual(phases(manager),['requested','ready','revealing','entered']);
 manager.dispose();assert.equal(scene,null);assert.equal(manager.inspect().events.nativeListeners,0);
});

test('scene degraded entry produces failed, not failed plus entered; scene cancellation is terminal',async t=>{
 for(const phase of ['entered','cancelled']){
  let scene;const f=environment({url:'https://example.test/projects/bending-active/'}),manager=connect(t,f,{subscribeScene:listener=>{scene=listener;return()=>{};}});await flush();
  scene({id:3,phase:'ready'});scene({id:3,phase:'revealing'});scene({id:3,phase,reason:phase==='entered'?'scene-unavailable':''});scene({id:3,phase:'entered'});
  assert.equal(manager.inspect().phase,phase==='entered'?'failed':'cancelled');assert.equal(manager.inspect().history.filter(fact=>['failed','entered','cancelled'].includes(fact.phase)).length,1);
 }
});

test('readiness is shared by document, reference-counted, and releases native image listeners on cancellation',async()=>{
 const image=new Element();Object.assign(image,{complete:false,naturalWidth:0});const f=environment({images:[image],fonts:new Promise(()=>{})});
 let loads=0,removals=0;const add=image.addEventListener.bind(image),remove=image.removeEventListener.bind(image);
 image.addEventListener=(...args)=>{loads++;return add(...args);};image.removeEventListener=(...args)=>{removals++;return remove(...args);};
 const options={setTimeout:f.win.setTimeout,clearTimeout:f.win.clearTimeout};
 const one=acquireSiteReadiness(f.doc,options),two=acquireSiteReadiness(f.doc,options);
 assert.equal(one.promise,two.promise);assert.equal(loads,2);one.release();assert.equal(f.timers.size,1);two.release();
 const result=await two.promise;assert.deepEqual(result.failures,['readiness-cancelled']);assert.equal(removals,2);assert.equal(f.timers.size,0);
});

test('fulfilled FontFaceSet readiness reports requested error faces and accepts loaded or unused-unloaded faces without loading them',async t=>{
 for(const statuses of [['loaded','error','unloaded'],['loaded','unloaded'],['unloaded']]){
  let loads=0;
  const fonts=new Set(statuses.map(status=>({status,load(){loads++;throw Error('Unused fonts must not be requested');}})));
  fonts.ready=Promise.resolve(fonts);
  const f=environment();f.doc.fonts=fonts;const manager=connect(t,f);await flush();
  if(statuses.includes('error')){
   assert.equal(manager.inspect().phase,'failed');assert.equal(manager.inspect().reason,'fonts-unavailable');assert.deepEqual(phases(manager),['requested','failed']);
   assert.equal(f.content.hasAttribute('inert'),false);
  }else{assert.equal(manager.inspect().phase,'revealing');f.loader.dispatchEvent(new Event('animationend'));assert.equal(manager.inspect().phase,'entered');}
  assert.equal(loads,0);assert.equal(f.timers.size,0);
 }
});

test('an initially fulfilled font set cannot reveal before declared body and heading faces actually load after DOM readiness',async t=>{
 const body=deferred(),heading=deferred(),calls=[],f=environment({readyState:'loading',fontFamilies:['Portfolio OCR B','Space Grotesk','Space Grotesk']});
 f.doc.fonts={ready:Promise.resolve(),load(font,text){calls.push({font,text});return font.includes('OCR')?body.promise:heading.promise;}};
 const manager=connect(t,f);await flush();assert.deepEqual(calls,[]);assert.deepEqual(phases(manager),['requested']);
 f.doc.readyState='interactive';f.doc.dispatchEvent(new Event('DOMContentLoaded'));await flush();
 assert.deepEqual(calls,[{font:'16px "Portfolio OCR B"',text:'Aa0'},{font:'16px "Space Grotesk"',text:'Aa0'}]);
 body.resolve([{status:'loaded'}]);await flush();assert.deepEqual(phases(manager),['requested']);
 heading.reject(new Error('Native webfont unavailable'));await flush();
 assert.deepEqual(phases(manager),['requested','failed']);assert.equal(manager.inspect().reason,'fonts-unavailable');assert.equal(f.content.hasAttribute('inert'),false);
});

test('an absent declared face cannot turn a successful empty native font match into readable-font readiness',async t=>{
 const f=environment({fontFamilies:['Missing project font']});f.doc.fonts={ready:Promise.resolve(),load:async()=>[]};
 const manager=connect(t,f);await flush();assert.deepEqual(phases(manager),['requested','failed']);assert.equal(manager.inspect().reason,'fonts-unavailable');
});

test('declared font preparation shares the original deadline and cannot publish late success after its terminal',async t=>{
 const loading=deferred(),f=environment({fontFamilies:['Portfolio OCR B']});f.doc.fonts={ready:Promise.resolve(),load:()=>loading.promise};
 const manager=connect(t,f);await flush();f.advance(14999);assert.deepEqual(phases(manager),['requested']);
 f.advance(1);await flush();assert.deepEqual(phases(manager),['requested','failed']);assert.equal(manager.inspect().reason,'readiness-timeout');assert.equal(f.timers.size,0);
 loading.resolve([{status:'loaded'}]);await flush();assert.deepEqual(phases(manager),['requested','failed']);assert.equal(f.timers.size,0);
});

test('blocked session storage preserves native navigation and explicitly cancels its untracked document handoff',async t=>{
 const f=environment();f.win.sessionStorage={getItem(){throw Error('blocked');},setItem(){throw Error('blocked');},removeItem(){throw Error('blocked');}};
 const manager=connect(t,f);await flush();f.loader.dispatchEvent(new Event('animationend'));
 const event=f.click('https://example.test/about/');assert.equal(event.defaultPrevented,false);assert.equal(manager.inspect().phase,'requested');
 f.page('pagehide');assert.equal(manager.inspect().phase,'cancelled');assert.equal(manager.inspect().reason,'untracked-handoff');assert.equal(f.timers.size,0);
});

test('source disposal after a tracked pagehide cannot cancel the destination-owned request',async t=>{
 const f=environment(),manager=connect(t,f);await flush();f.loader.dispatchEvent(new Event('animationend'));
 f.click('https://example.test/about/');const id=manager.inspect().id,ticket=f.storage.get(SITE_HANDOFF_KEY);f.page('pagehide');
 assert.equal(manager.inspect().disposed,true);assert.equal(manager.inspect().events.disposed,true);assert.equal(manager.inspect().events.nativeListeners,0);assert.equal(manager.inspect().events.scopes,0);assert.equal(f.storage.get(SITE_HANDOFF_KEY),ticket,'Permanent local cleanup cannot rewrite or cancel the serialized destination ticket');manager.dispose();
 assert.equal(manager.inspect().history.filter(fact=>fact.id===id&&fact.phase==='cancelled').length,0);assert.equal(manager.inspect().events.nativeListeners,0);
 const destination=environment({url:'https://example.test/about/',storage:f.storage}),arrival=connect(t,destination);await flush();destination.loader.dispatchEvent(new Event('animationend'));
 assert.equal(arrival.inspect().id,id);assert.deepEqual(phases(arrival),['requested','ready','revealing','entered']);
});

test('expired, mismatched, future and malformed recoverable handoffs close once before the new arrival enters',async t=>{
 for(const [patch,url,reason] of [
  [{startedAt:-61000},'https://example.test/about/','handoff-invalid-time'],
  [{startedAt:0},'https://example.test/about/','handoff-expired'],
  [{startedAt:60000},'https://example.test/contact/','handoff-destination-mismatch'],
  [{startedAt:62000},'https://example.test/about/','handoff-invalid-time'],
  [{startedAt:'60000'},'https://example.test/about/','handoff-invalid-time'],
  [{url:'not a URL',startedAt:60000},'https://example.test/about/','handoff-invalid'],
 ]){
  const id='previous-navigation',destination='https://example.test/about/';
  const record={id,url:destination,startedAt:0,history:[{id,phase:'requested',kind:'navigation',url:destination}],...patch};
  const storage=new Map([[SITE_HANDOFF_KEY,JSON.stringify(record)]]),f=environment({url,storage});f.advance(61000);
  const manager=connect(t,f);await flush();f.loader.dispatchEvent(new Event('animationend'));
  const previous=manager.inspect().history.filter(fact=>fact.id===id);
  assert.deepEqual(previous.map(fact=>fact.phase),['requested','cancelled']);assert.equal(previous.at(-1).reason,reason);
  assert.equal(manager.inspect().phase,'entered');assert.notEqual(manager.inspect().id,id);assert.equal(storage.has(SITE_HANDOFF_KEY),false);assert.equal(f.timers.size,0);
 }
});

test('closed receipts never receive another terminal and unrecognizable handoff data is consumed without invented facts',async t=>{
 const id='closed-navigation',url='https://example.test/about/';
 for(const phase of ['entered','cancelled','failed']){
  const storage=new Map([[SITE_HANDOFF_KEY,JSON.stringify({id,url,startedAt:0,history:[{id,url,phase:'requested',kind:'navigation'}]})],[SITE_TERMINAL_KEY,JSON.stringify({id,url,phase,kind:'arrival'})]]);
  const f=environment({url,storage});f.advance(61000);const manager=connect(t,f);await flush();f.loader.dispatchEvent(new Event('animationend'));
  assert.equal(manager.inspect().phase,'entered');assert.equal(manager.inspect().history.filter(fact=>fact.id===id).length,0);assert.equal(storage.has(SITE_HANDOFF_KEY),false);
 }
 for(const raw of ['', 'null','[]','not JSON',JSON.stringify({id,url,startedAt:0,history:[]}),JSON.stringify({unexpected:true})]){
  const storage=new Map([[SITE_HANDOFF_KEY,raw]]),f=environment({url,storage}),manager=connect(t,f);await flush();f.loader.dispatchEvent(new Event('animationend'));
  assert.deepEqual(phases(manager),['requested','ready','revealing','entered']);assert.equal(storage.has(SITE_HANDOFF_KEY),false);assert.equal(f.timers.size,0);
 }
});

test('BFCache after an interrupted arrival restores one readable document without reusing a cancelled request',async t=>{
 const font=deferred(),f=environment({fonts:font.promise}),manager=connect(t,f);const initial=manager.inspect().id;
 f.page('pagehide',true);assert.equal(manager.inspect().phase,'cancelled');font.resolve();await flush();f.advance(1);
 f.page('pageshow',true);await flush();assert.equal(manager.inspect().phase,'entered');assert.notEqual(manager.inspect().id,initial);assert.equal(f.timers.size,0);
 assert.equal(manager.inspect().history.filter(fact=>fact.id===initial&&fact.phase==='cancelled').length,1);
});

test('nonpersisted departure closes local registries and pending readiness without a late reveal, handoff or resurrected document',async t=>{
 const font=deferred(),f=environment({fonts:font.promise}),native=nativeReveal(f),manager=connect(t,f),initial=manager.inspect().id;
 f.page('pagehide',false);assert.equal(manager.inspect().disposed,true);assert.equal(manager.inspect().phase,'cancelled');assert.equal(manager.inspect().reason,'page-hidden');assert.equal(manager.inspect().events.nativeListeners,0);assert.equal(manager.inspect().events.subscriptions,0);assert.equal(manager.inspect().events.scopes,0);assert.equal(f.content.hasAttribute('inert'),false);assert.equal(f.timers.size,0);assert.equal(native.frames.size,0);
 const history=manager.inspect().history;font.resolve();await flush();f.page('pageshow',true);f.click('https://example.test/about/');f.loader.dispatchEvent(new Event('animationend'));f.advance(20000);manager.dispose();
 assert.equal(manager.inspect().id,initial);assert.deepEqual(manager.inspect().history,history);assert.equal(f.storage.has(SITE_HANDOFF_KEY),false);assert.equal(native.calls.length,0);assert.equal(native.frames.size,0);
});

test('persisted and bare synthetic pagehide keep local navigation registered for its existing readable restoration path',async t=>{
 for(const persisted of [true,undefined]){
  const f=environment(),manager=connect(t,f);f.media.matches=true;await flush();const initial=manager.inspect().id;
  if(persisted===undefined)f.win.dispatchEvent(new Event('pagehide'));else f.page('pagehide',persisted);
  assert.equal(manager.inspect().disposed,false);assert.equal(manager.inspect().events.disposed,false);assert(manager.inspect().events.nativeListeners>0);
  f.page('pageshow',true);await flush();assert.equal(manager.inspect().disposed,false);assert.equal(manager.inspect().phase,'entered');assert.notEqual(manager.inspect().id,initial);
  manager.dispose();assert.equal(manager.inspect().events.nativeListeners,0);
 }
});

test('synchronous disposal from a readiness observer cannot schedule a reveal after cancellation',async t=>{
 const f=environment(),manager=createSiteNavigation({window:f.win,document:f.doc,element:f.loader,now:f.now});
 manager.onReadiness(fact=>{if(fact.phase==='ready')manager.dispose();});manager.start();t.after(()=>manager.dispose());await flush();
 assert.deepEqual(phases(manager),['requested','ready','cancelled']);assert.equal(f.timers.size,0);assert.equal(manager.inspect().events.nativeListeners,0);
});

test('entry document rejection releases the real gate with a retained degradation reason',async t=>{
 const input=createRuntimeInput(),manager=createEntryManager({input}),document={documentElement:new Element(),fonts:{ready:Promise.resolve()}},page=deferred();
 manager.scenePolicy('deferred');const release=manager.connect({element:new Element(),content:new Element(),document,onChange(){},documentReady:page.promise});t.after(()=>{release();input.dispose();});
 page.reject(Error('images'));await flush();assert.equal(manager.inspect().reason,'page-resource-unavailable');manager.advance(0);manager.advance(.72);assert.equal(manager.inspect().phase,'entered');assert.equal(manager.inspect().prerequisites.document,true);
});

test('entry document promise composes with the existing Director gate; stale and timed-out promises cannot strand it',async t=>{
 const input=createRuntimeInput(),manager=createEntryManager({input}),page=deferred();
 const document={documentElement:new Element(),fonts:{ready:Promise.resolve()}};let release=()=>{};
 t.after(()=>{release();input.dispose();});manager.scenePolicy('deferred');
 release=manager.connect({element:new Element(),content:new Element(),document,onChange(){},documentReady:page.promise});
 await flush();manager.advance(2);assert.equal(manager.inspect().phase,'preparing');assert.equal(manager.inspect().prerequisites.document,false);
 page.resolve({ready:true});await flush();manager.advance(0);assert.equal(manager.inspect().phase,'revealing');manager.advance(.72);assert.equal(manager.inspect().phase,'entered');
 release();const stale=deferred();release=manager.connect({element:new Element(),content:new Element(),document,onChange(){},documentReady:stale.promise});release();
 release=manager.connect({element:new Element(),content:new Element(),document,onChange(){},documentReady:new Promise(()=>{})});stale.resolve({ready:true});await flush();assert.equal(manager.inspect().prerequisites.document,false);
 for(let i=0;i<31;i++)manager.advance(1);assert.equal(manager.inspect().prerequisites.document,true);manager.advance(0);manager.advance(.72);assert.equal(manager.inspect().phase,'entered');assert.equal(manager.inspect().reason,'document-timeout');
});

test('Home specimen presentation hint follows only its native Bending ticket and never transfers destination readiness',async t=>{
 const f=environment(),manager=connect(t,f);await flush();f.loader.dispatchEvent(new Event('animationend'));
 const marked={hasAttribute:name=>name==='data-home-research-link'};
 const event=f.click('https://example.test/projects/bending-active/',{},marked);
 assert.equal(event.defaultPrevented,false);assert.equal(manager.inspect().presentation,'bending-active');
 const ticket=JSON.parse(f.storage.get(SITE_HANDOFF_KEY));assert.equal(ticket.presentation,'bending-active');
 f.page('pagehide',true);
 let publish;const destination=environment({url:ticket.url,storage:f.storage});
 const next=connect(t,destination,{subscribeScene:callback=>{publish=callback;return()=>{};}});await flush();
 assert.equal(next.inspect().presentation,'bending-active');assert.equal(next.inspect().phase,'requested');assert.equal(next.inspect().previews,null);
 publish({id:'actual-case',phase:'preparing'});assert.equal(next.inspect().phase,'requested');
 publish({id:'actual-case',phase:'entered'});assert.equal(next.inspect().phase,'entered');assert.equal(next.inspect().presentation,null);
 f.page('pageshow',true);await flush();assert.equal(manager.inspect().presentation,null);
});

test('specimen presentation cannot leak through modified, cancelled, superseded or unrelated native links',async t=>{
 const f=environment(),manager=connect(t,f);await flush();f.loader.dispatchEvent(new Event('animationend'));
 const marked={hasAttribute:name=>name==='data-home-research-link'};
 f.click('https://example.test/projects/bending-active/',{ctrlKey:true},marked);assert.equal(manager.inspect().presentation,null);
 f.click('https://example.test/about/',{},marked);assert.equal(manager.inspect().presentation,null);
 const event=f.click('https://example.test/projects/bending-active/',{},marked);event.preventDefault();await flush();assert.equal(manager.inspect().presentation,null);
 f.click('https://example.test/projects/bending-active/',{},marked);assert.equal(manager.inspect().presentation,'bending-active');
 f.click('https://example.test/contact/');assert.equal(manager.inspect().presentation,null);assert.equal(JSON.parse(f.storage.get(SITE_HANDOFF_KEY)).presentation,undefined);
});


test('eligible native departure guards content immediately without preventing its default activation',async t=>{
 const f=environment();f.content.setAttribute('aria-busy','false');f.navigation.setAttribute('inert','preserved');
 const manager=connect(t,f);await flush();f.loader.dispatchEvent(new Event('animationend'));
 assert.equal(f.content.hasAttribute('inert'),false);assert.equal(f.content.getAttribute('aria-busy'),'false');
 const event=f.click('https://example.test/projects/bending-active/');
 assert.equal(event.defaultPrevented,false);assert.equal(manager.inspect().kind,'navigation');assert.equal(manager.inspect().phase,'requested');assert.equal(f.loader.hasAttribute('hidden'),false);
 for(const node of [f.content,f.navigation]){assert.equal(node.getAttribute('inert'),'');assert.equal(node.getAttribute('aria-busy'),'true');}
 event.preventDefault();await flush();assert.equal(manager.inspect().reason,'activation-prevented');
 assert.equal(f.content.hasAttribute('inert'),false);assert.equal(f.content.getAttribute('aria-busy'),'false');assert.equal(f.navigation.getAttribute('inert'),'preserved');assert.equal(f.navigation.hasAttribute('aria-busy'),false);
});

test('outgoing content guard restores on timeout, history interruption, disposal and page handoff',async t=>{
 for(const action of ['timeout','history','dispose','pagehide','bfcache']){
  const f=environment(),manager=connect(t,f);await flush();f.loader.dispatchEvent(new Event('animationend'));
  f.click('https://example.test/about/');assert.equal(f.content.hasAttribute('inert'),true);const id=manager.inspect().id;
  if(action==='timeout')f.advance(15000);
  else if(action==='history')f.win.dispatchEvent(new Event('popstate'));
  else if(action==='dispose')manager.dispose();
  else f.page('pagehide',action==='bfcache');
  assert.equal(f.content.hasAttribute('inert'),false,action);assert.equal(f.content.hasAttribute('aria-busy'),false,action);assert.equal(f.navigation.hasAttribute('inert'),false,action);assert.equal(f.timers.size,0,action);
  if(action==='bfcache'){
   const ticket=f.storage.get(SITE_HANDOFF_KEY);assert.ok(ticket);f.page('pageshow',true);await flush();assert.equal(manager.inspect().phase,'entered');assert.equal(f.content.hasAttribute('inert'),false);assert.notEqual(manager.inspect().id,id);
  }
 }
});

test('modified, external, download, fragment and already-prevented activations never acquire outgoing content guard',async t=>{
 const f=environment();f.doc.addEventListener('click',event=>{if(event.cancelBeforeSite)event.preventDefault();});
 const manager=connect(t,f);await flush();f.loader.dispatchEvent(new Event('animationend'));const initial=manager.inspect().id;
 const cases=[
  ['https://example.test/about/',{ctrlKey:true},{}],['https://example.test/about/',{metaKey:true},{}],['https://example.test/about/',{shiftKey:true},{}],['https://example.test/about/',{altKey:true},{}],['https://example.test/about/',{button:1},{}],
  ['https://example.test/about/',{cancelBeforeSite:true},{}],['https://example.test/about/',{},{target:'_blank'}],['https://example.test/about/',{},{rel:'external'}],['https://example.test/about/',{},{hasAttribute:name=>name==='download'}],
  ['https://outside.test/work/',{},{}],['https://example.test/#projects',{},{}],
 ];
 for(const [href,event,anchor] of cases){f.click(href,event,anchor);assert.equal(manager.inspect().id,initial);assert.equal(manager.inspect().phase,'entered');assert.equal(f.content.hasAttribute('inert'),false);assert.equal(f.content.hasAttribute('aria-busy'),false);}
});

test('a superseding outgoing request keeps its own guard and ignores a stale cancelled activation',async t=>{
 const f=environment(),manager=connect(t,f);await flush();f.loader.dispatchEvent(new Event('animationend'));
 const first=f.click('https://example.test/about/'),firstId=manager.inspect().id;
 f.click('https://example.test/contact/');const secondId=manager.inspect().id;first.preventDefault();await flush();
 assert.notEqual(firstId,secondId);assert.equal(manager.inspect().phase,'requested');assert.equal(f.content.hasAttribute('inert'),true);assert.equal(f.content.getAttribute('aria-busy'),'true');
 assert.equal(manager.inspect().history.filter(fact=>fact.id===firstId&&fact.phase==='cancelled').length,1);
 f.advance(15000);assert.equal(manager.inspect().phase,'failed');assert.equal(f.content.hasAttribute('inert'),false);assert.equal(f.content.hasAttribute('aria-busy'),false);
});


test('synchronous outgoing-request disposal cannot acquire a fresh guard or navigation timer after cleanup',async t=>{
 const f=environment(),manager=connect(t,f);await flush();f.loader.dispatchEvent(new Event('animationend'));
 manager.onReadiness(fact=>{if(fact.kind==='navigation'&&fact.phase==='requested')manager.dispose();});
 const event=f.click('https://example.test/about/');await flush();
 assert.equal(event.defaultPrevented,false);assert.equal(manager.inspect().disposed,true);assert.equal(manager.inspect().phase,'cancelled');
 assert.equal(f.content.hasAttribute('inert'),false);assert.equal(f.content.hasAttribute('aria-busy'),false);assert.equal(f.timers.size,0);assert.equal(f.storage.has(SITE_HANDOFF_KEY),false);
});

const diagnosticEvents=manager=>manager.inspect().startupDiagnostics.events;
test('startup diagnostics are strict opt-in and preserve the default inspect and native scheduling shape',async t=>{
 for(const enabled of [undefined,false,'true']){
  const f=environment(),native=nativeReveal(f);f.win.__SITE_NAVIGATION_DIAGNOSTICS__=enabled;
  const manager=connect(t,f);await flush();assert.equal('startupDiagnostics' in manager.inspect(),false);
  assert.equal(native.frames.size,1);assert.equal(f.timers.size,1);
  native.frame();await flush();native.owned.forEach(item=>item.finish());await flush();
  assert.deepEqual(phases(manager),['requested','ready','revealing','entered']);assert.equal(f.timers.size,0);
 }
});

test('diagnostics separate synchronous preview report from late combined observation before any native RAF',async t=>{
 const node=new Element(),f=environment({previews:[node]}),native=nativeReveal(f);f.win.__SITE_NAVIGATION_DIAGNOSTICS__=true;
 const manager=connect(t,f),registration=registerPagePreviewReadiness(f.doc,node);await flush();f.elapse(15000);
 registration.report({mode:'model'});
 let events=diagnosticEvents(manager);assert.equal(events.at(-1).checkpoint,'preview-report');assert.equal(events.at(-1).at,15000);
 assert.equal(events.at(-1).provenance,'report-notification');assert.equal(events.some(event=>event.checkpoint==='combined-result-observed'),false);
 await flush();events=diagnosticEvents(manager);
 assert.equal(events.some(event=>event.checkpoint==='document-promise-observed'),true);
 assert.equal(events.some(event=>event.checkpoint==='combined-result-observed'&&event.ready),true);
 assert.equal(events.some(event=>event.checkpoint==='raf-scheduled'),false);
 assert.equal(events.at(-1).phase,'failed');assert.equal(events.at(-1).reason,'presentation-timeout');
 assert.equal(native.calls.length,0);assert.equal(f.timers.size,0);
});

test('diagnostics distinguish withheld RAF from delivered RAF with pending or rejected native play',async t=>{
 for(const branch of ['raf','pending','rejected']){
  const f=environment(),native=nativeReveal(f,{manualReady:true});f.win.__SITE_NAVIGATION_DIAGNOSTICS__=true;
  const manager=connect(t,f);await flush();
  if(branch!=='raf'){native.frame();if(branch==='rejected')native.owned[0].rejectReady();await flush();}
  f.advance(15000);await flush();const events=diagnosticEvents(manager);
  assert.equal(events.some(event=>event.checkpoint==='raf-scheduled'),true);
  assert.equal(events.some(event=>event.checkpoint==='raf-delivered'),branch!=='raf');
  assert.equal(events.some(event=>event.checkpoint==='animation-ready-observed'&&event.status==='resolved'),false);
  if(branch==='rejected')assert.equal(events.some(event=>event.checkpoint==='animation-ready-observed'&&event.status==='rejected'),true);
  assert.equal(manager.inspect().reason,'presentation-timeout');assert.equal(f.timers.size,0);
 }
});

test('diagnostics preserve actual two-animation acceptance and retain terminal evidence as copied bounded records',async t=>{
 const f=environment(),native=nativeReveal(f,{manualReady:true});f.win.__SITE_NAVIGATION_DIAGNOSTICS__=true;
 const manager=connect(t,f);await flush();native.frame();native.owned[0].accept();await flush();
 assert.equal(manager.inspect().phase,'requested');native.owned[1].accept();await flush();
 assert.equal(manager.inspect().phase,'revealing');native.owned.forEach(item=>item.finish());await flush();
 assert.equal(manager.inspect().phase,'entered');assert.equal(diagnosticEvents(manager).filter(event=>event.checkpoint==='animation-ready-observed'&&event.status==='resolved').length,2);
 const copy=manager.inspect().startupDiagnostics;copy.events[0].checkpoint='mutated';copy.events.length=0;
 assert.notEqual(diagnosticEvents(manager)[0].checkpoint,'mutated');
 for(let i=0;i<30;i++)f.click(`https://example.test/next-${i}/`);
 const bounded=manager.inspect().startupDiagnostics;assert.equal(bounded.events.length,48);assert.ok(bounded.dropped>0);assert.ok(bounded.epoch>1);
 assert.ok(bounded.events.every(event=>Number.isFinite(event.at)&&Number.isInteger(event.epoch)));
 manager.dispose();assert.equal(manager.inspect().disposed,true);assert.ok(diagnosticEvents(manager).length>0);
});

test('diagnostics label stale promise deliveries without changing the superseding request or adding a reveal',async t=>{
 const readiness=deferred(),f=environment(),native=nativeReveal(f);f.win.__SITE_NAVIGATION_DIAGNOSTICS__=true;
 const manager=connect(t,f,{acquireReadiness:()=>({promise:readiness.promise,release(){}})});f.click('https://example.test/other/');
 readiness.resolve({ready:true,failures:[],pending:[]});await flush();
 const events=diagnosticEvents(manager),late=events.filter(event=>event.checkpoint==='document-promise-observed'||event.checkpoint==='combined-result-observed');
 assert.equal(late.length,2);assert.ok(late.every(event=>event.epoch===1&&!event.current));
 assert.equal(manager.inspect().kind,'navigation');assert.equal(manager.inspect().phase,'requested');assert.equal(native.calls.length,0);assert.equal(native.frames.size,0);
});

test('diagnostic epochs distinguish persisted restoration from a fresh manager without changing static restore entry',async t=>{
 const f=environment(),native=nativeReveal(f);f.win.__SITE_NAVIGATION_DIAGNOSTICS__=true;
 const manager=connect(t,f);await presented(native);native.owned.forEach(item=>item.finish());await flush();
 const first=manager.inspect().startupDiagnostics.epoch;f.page('pagehide',true);f.page('pageshow',true);await flush();
 assert.equal(manager.inspect().phase,'entered');assert.equal(manager.inspect().startupDiagnostics.epoch,first+1);
 assert.equal(diagnosticEvents(manager).filter(event=>event.checkpoint==='arrival').at(-1).restored,true);
 assert.equal(diagnosticEvents(manager).filter(event=>event.checkpoint==='presentation-accepted').at(-1).staticReveal,true);
 assert.equal(native.calls.length,2,'restoration adds no animation owner');assert.equal(f.timers.size,0);
 const fresh=environment();fresh.win.__SITE_NAVIGATION_DIAGNOSTICS__=true;const next=connect(t,fresh);await flush();
 assert.equal(next.inspect().startupDiagnostics.epoch,1);assert.equal(diagnosticEvents(next).find(event=>event.checkpoint==='arrival').restored,false);
});

function navigationTiming(f,type){f.win.performance={now:f.now,getEntriesByType:kind=>{assert.equal(kind,'navigation');return[{entryType:'navigation',type}];}};}
test('fresh native Back/Forward waits for real preview readiness then enters history-static without decorative animation',async t=>{
 for(const mode of ['model','static']){
  const node=new Element(),f=environment({previews:[node]}),native=nativeReveal(f);navigationTiming(f,'back_forward');f.win.__SITE_NAVIGATION_DIAGNOSTICS__=true;
  const manager=connect(t,f);await flush();assert.equal(manager.inspect().phase,'requested');assert.equal(f.content.hasAttribute('inert'),true);assert.equal(native.requested.length,0);
  registerPagePreviewReadiness(f.doc,node).report({mode,reason:mode==='static'?'reduced-motion':''});await flush();
  assert.deepEqual(phases(manager),['requested','ready','revealing','entered']);assert.equal(manager.inspect().reason,'history-static');
  assert.equal(manager.inspect().readiness.previews[0].mode,mode);assert.equal(f.content.hasAttribute('inert'),false);assert.equal(native.calls.length,0);assert.equal(native.requested.length,0);assert.equal(f.timers.size,0);
  assert.equal(diagnosticEvents(manager).find(row=>row.checkpoint==='arrival').freshHistory,true);
 }
});
test('fresh history cannot bypass document readiness or late startup expiry',async t=>{
 for(const late of [false,true]){
  const ready=deferred(),f=environment(),native=nativeReveal(f);navigationTiming(f,'back_forward');
  const manager=connect(t,f,{acquireReadiness:()=>({promise:ready.promise,release(){}})});await flush();assert.equal(manager.inspect().phase,'requested');
  if(late)f.elapse(15000);ready.resolve({ready:true,pending:[],failures:[]});await flush();
  assert.equal(manager.inspect().phase,late?'failed':'entered');assert.equal(manager.inspect().reason,late?'presentation-timeout':'history-static');
  assert.equal(native.calls.length,0);assert.equal(native.requested.length,0);assert.equal(f.timers.size,0);
 }
});
test('fresh history preserves resource failure, hidden/reduced policy and cancellation closure',async t=>{
 for(const policy of ['hidden','reduced','failed','cancelled']){
  const ready=deferred(),f=environment(),native=nativeReveal(f);navigationTiming(f,'back_forward');if(policy==='hidden')f.doc.hidden=true;if(policy==='reduced')f.media.matches=true;
  const manager=connect(t,f,{acquireReadiness:()=>({promise:ready.promise,release(){}})});await flush();
  if(policy==='cancelled')f.page('pagehide',true);
  ready.resolve({ready:policy!=='failed',pending:[],failures:policy==='failed'?['fonts-unavailable']:[]});await flush();
  assert.equal(manager.inspect().phase,policy==='failed'?'failed':policy==='cancelled'?'cancelled':'entered');
  assert.equal(manager.inspect().reason,policy==='hidden'?'hidden-static':policy==='failed'?'fonts-unavailable':policy==='cancelled'?'page-hidden':'history-static');
  assert.equal(native.calls.length,0);assert.equal(native.requested.length,0);assert.equal(f.timers.size,0);
 }
});
test('unsupported, malformed and ordinary navigation timing retain native play acknowledgements',async t=>{
 const throwingRecord={entryType:'navigation',get type(){throw Error('Malformed timing');}};
 const values=[[throwingRecord],undefined,[],[{entryType:'navigation',type:'navigate'}],[{entryType:'navigation',type:'reload'}],[{entryType:'resource',type:'back_forward'}],[{type:'back_forward'}],[null],[{entryType:'navigation',type:'back_forward'},{entryType:'navigation',type:'back_forward'}],{0:{entryType:'navigation',type:'back_forward'},length:1},'throw'];
 for(const value of values){
  const f=environment(),native=nativeReveal(f,{manualReady:true});f.win.performance={now:f.now,getEntriesByType(){if(value==='throw')throw Error('Unavailable');return value;}};
  const manager=connect(t,f);await flush();assert.equal(manager.inspect().phase,'requested');assert.equal(native.frames.size,1);native.frame();await flush();assert.equal(manager.inspect().phase,'requested');
  native.owned.forEach(item=>item.accept());await flush();assert.equal(manager.inspect().phase,'revealing');native.owned.forEach(item=>item.finish());await flush();assert.equal(manager.inspect().phase,'entered');assert.equal(manager.inspect().reason,'');
 }
});
test('fresh history unfinished preview still expires at the original deadline',async t=>{
 const f=environment({previews:[new Element()]}),native=nativeReveal(f);navigationTiming(f,'back_forward');const manager=connect(t,f);await flush();
 f.advance(14999);assert.equal(manager.inspect().phase,'requested');f.advance(1);await flush();
 assert.equal(manager.inspect().phase,'failed');assert.equal(manager.inspect().reason,'readiness-timeout');assert.equal(native.requested.length,0);assert.equal(f.timers.size,0);
});
test('delegated Bending arrival does not inspect or adopt ordinary history presentation policy',async t=>{
 const f=environment({url:'https://example.test/projects/bending-active/'});f.win.performance={now:f.now,getEntriesByType(){assert.fail('Delegated scene owns its entry');}};
 let emit;const manager=connect(t,f,{subscribeScene:callback=>{emit=callback;return()=>{};}});await flush();
 for(const phase of ['ready','revealing','entered'])emit({id:'scene-history',phase});
 assert.equal(manager.inspect().phase,'entered');assert.notEqual(manager.inspect().reason,'history-static');
});
