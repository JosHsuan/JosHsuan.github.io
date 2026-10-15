import test from 'node:test';
import assert from 'node:assert/strict';
import {createSiteNavigation,SITE_HANDOFF_KEY,SITE_TERMINAL_KEY} from '../runtime/site/SiteNavigation.mjs';
import {acquireSiteReadiness} from '../runtime/site/SiteReadiness.mjs';
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
function environment({url='https://example.test/',storage=new Map(),images=[],readyState='complete',fonts=Promise.resolve()}={}){
 const loader=new Element(),content=new Element(),navigation=new Element(),doc=new EventTarget(),win=new EventTarget(),media=new EventTarget();
 Object.assign(doc,{documentElement:new Element(),readyState,hidden:false,fonts:{ready:fonts},querySelectorAll:selector=>selector.includes('img')?images:[content,navigation]});
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
 return{win,doc,media,loader,content,navigation,timers,advance,click,page,storage,now:()=>clock};
}
function connect(t,f,options={}){
 const manager=createSiteNavigation({window:f.win,document:f.doc,element:f.loader,now:f.now,...options});manager.start();t.after(()=>manager.dispose());return manager;
}
function phases(manager){return manager.inspect().history.map(fact=>fact.phase);}

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
 assert.equal(f.loader.hasAttribute('hidden'),false);f.page('pagehide');assert.equal(first.inspect().handedOff,true);assert.equal(f.timers.size,0);
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

test('blocked session storage preserves native navigation and explicitly cancels its untracked document handoff',async t=>{
 const f=environment();f.win.sessionStorage={getItem(){throw Error('blocked');},setItem(){throw Error('blocked');},removeItem(){throw Error('blocked');}};
 const manager=connect(t,f);await flush();f.loader.dispatchEvent(new Event('animationend'));
 const event=f.click('https://example.test/about/');assert.equal(event.defaultPrevented,false);assert.equal(manager.inspect().phase,'requested');
 f.page('pagehide');assert.equal(manager.inspect().phase,'cancelled');assert.equal(manager.inspect().reason,'untracked-handoff');assert.equal(f.timers.size,0);
});

test('source disposal after a tracked pagehide cannot cancel the destination-owned request',async t=>{
 const f=environment(),manager=connect(t,f);await flush();f.loader.dispatchEvent(new Event('animationend'));
 f.click('https://example.test/about/');const id=manager.inspect().id;f.page('pagehide');manager.dispose();
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
 f.page('pagehide');assert.equal(manager.inspect().phase,'cancelled');font.resolve();await flush();f.advance(1);
 f.page('pageshow',true);await flush();assert.equal(manager.inspect().phase,'entered');assert.notEqual(manager.inspect().id,initial);assert.equal(f.timers.size,0);
 assert.equal(manager.inspect().history.filter(fact=>fact.id===initial&&fact.phase==='cancelled').length,1);
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
