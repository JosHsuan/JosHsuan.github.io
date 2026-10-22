import test from 'node:test';
import assert from 'node:assert/strict';
import {createBackgroundRuntime} from '../runtime/background/BackgroundRuntime.mjs';
import {createSiteBackgroundDriver} from '../runtime/background/SiteBackgroundDriver.mjs';
import {createPageFieldRenderer} from '../components/page-field-renderer.mjs';
import {sampleChapterScene} from '../components/chapter-scene-score.mjs';
import {createChapterPlayback,advanceChapterPlayback,sampleChapterPlayback} from '../components/chapter-playback.mjs';

function canvas(){
 const calls=[],listeners=new Map();
 const context={setTransform(...args){calls.push(['transform',...args]);},clearRect(...args){calls.push(['clear',...args]);},drawImage(_atlas,...args){calls.push(['glyph',...args]);},createImageData(w,h){return{data:new Uint8ClampedArray(w*h*4)};},putImageData(){}};
 return{width:300,height:150,style:{setProperty(){}},calls,getContext:()=>context,addEventListener:(type,fn)=>listeners.set(type,fn),removeEventListener:type=>listeners.delete(type)};
}
const fieldFactory=element=>createPageFieldRenderer(element,{createCanvas:canvas});
const record=()=>{const calls=[];return{calls,style:(_el,key,value)=>calls.push([key,String(value)])};};

test('shared case presenter exactly preserves all existing backdrop writes, field calls and reports',()=>{
 for(let chapter=0;chapter<7;chapter++)for(const [width,height] of [[1440,1000],[390,844]]){
  const actualCanvas=canvas(),expectedCanvas=canvas(),actualPublisher=record(),expectedPublisher=record();
  const runtime=createBackgroundRuntime({createRenderer:fieldFactory});
  const actual=runtime.acquire({owner:'bending-director',canvas:actualCanvas,backdrop:{},publisher:actualPublisher});
  const expected=fieldFactory(expectedCanvas),playback=createChapterPlayback(chapter);
  for(const [frameTimeMs,dt,paused,hidden,systemReduced] of [[0,0,false,false,false],[40,.04,false,false,false],[80,.04,true,false,false],[120,.04,false,true,false],[160,.04,false,false,true],[200,.04,false,false,false]]){
   advanceChapterPlayback(playback,dt,{chapter,reducedMotion:systemReduced,paused,hidden});
   const scene=sampleChapterScene(sampleChapterPlayback(playback),{aspect:width/height,reducedMotion:systemReduced,pointer:{uv:[.75,.35],active:true,strength:.35}}),light=scene.backdrop;
   expectedPublisher.style({},'--backdrop-cool-rgb',light.coolRgb.join(' '));
   expectedPublisher.style({},'--backdrop-warm-rgb',light.warmRgb.join(' '));
   expectedPublisher.style({},'--backdrop-cool-energy',Math.round(light.coolEnergy*100)/100);
   expectedPublisher.style({},'--backdrop-warm-energy',Math.round(light.warmEnergy*100)/100);
   expectedPublisher.style({},'--backdrop-warm-x',Math.round(63-light.warmSide*45)+'%');
   expected.render({field:scene.field,frameTimeMs,paused,hidden,systemReduced},width,height);
   actual.present(scene,{frameTimeMs,paused,hidden,systemReduced},width,height);
   assert.deepEqual(actual.inspect(),expected.inspect());
   assert.deepEqual(actualCanvas.calls,expectedCanvas.calls);
   assert.deepEqual(actualPublisher.calls,expectedPublisher.calls);
  }
  actual.dispose();expected.dispose();assert.equal(runtime.inspect().activeBindings,0);
 }
});

test('a document lease rejects a second driver and releases idempotently without stale writes',()=>{
 const runtime=createBackgroundRuntime({createRenderer:fieldFactory}),publisher=record();
 const acquire=owner=>runtime.acquire({owner,canvas:canvas(),backdrop:{},publisher});
 const first=acquire('site');assert.throws(()=>acquire('bending-director'),/already owned/);
 first.dispose();first.dispose();assert.equal(runtime.inspect().releases,1);
 const second=acquire('bending-director');
 first.present(null,{frameTimeMs:0},100,100);assert.equal(publisher.calls.length,0);
 assert.equal(runtime.inspect().owner,'bending-director');second.dispose();
 assert.deepEqual(runtime.inspect().history.map(value=>value.phase),['acquired','released','acquired','released']);
});

class Target{constructor(){this.listeners=new Map();}addEventListener(type,fn,options){const list=this.listeners.get(type)??[];list.push({fn,options});this.listeners.set(type,list);}removeEventListener(type,fn){this.listeners.set(type,(this.listeners.get(type)??[]).filter(item=>item.fn!==fn));}fire(type,event={}){for(const {fn} of [...this.listeners.get(type)??[]])fn(event);}}
function environment({home=false,section='home',plane=false}={}){
 const win=new Target(),doc=new Target(),html=new Target(),pending=new Map(),queries=new Map(),observers=[];
 const frameStats={requested:0,cancelled:0,delivered:0,maxPending:0};let next=0;
 html.phase='requested';html.getAttribute=()=>html.phase;doc.documentElement=html;doc.hidden=false;
 Object.assign(win,{innerWidth:1440,innerHeight:1000,scrollY:0,
  requestAnimationFrame:fn=>{pending.set(++next,fn);frameStats.requested++;frameStats.maxPending=Math.max(frameStats.maxPending,pending.size);return next;},
  cancelAnimationFrame:id=>{if(pending.delete(id))frameStats.cancelled++;},
  matchMedia(query){if(!queries.has(query))queries.set(query,Object.assign(new Target(),{matches:false}));return queries.get(query);},
  MutationObserver:class{constructor(fn){this.fn=fn;this.target=null;this.disconnected=false;observers.push(this);}observe(target,options){this.target=target;this.options=options;}disconnect(){this.disconnected=true;}}});
 let homeRoot=null,homeWindow=null;
 if(home){
  const element=()=>Object.assign(new Target(),{attributes:new Map(),properties:new Map(),
   getAttribute(key){return this.attributes.get(key)??null;},setAttribute(key,value){this.attributes.set(key,String(value));},removeAttribute(key){this.attributes.delete(key);},
   get style(){const properties=this.properties;return{getPropertyValue:key=>properties.get(key)??'',setProperty:(key,value)=>properties.set(key,String(value))};},
   closest:()=>null,contains:()=>false,offsetTop:0,offsetParent:null,ownerDocument:doc,
  });
  homeRoot=element();homeWindow=element();Object.assign(homeWindow,{parentElement:homeRoot,clientWidth:480,clientHeight:300,tagName:'DIV',offsetTop:100,
   querySelector:selector=>selector===':scope > [data-information-skin]'?{}:null,
  });homeWindow.setAttribute('data-information-window','home-introduction');
  homeRoot.querySelectorAll=()=>[homeWindow];doc.querySelector=selector=>selector===`[data-portfolio-root][data-portfolio-section="${section}"]`?homeRoot:null;
  if(plane){homeRoot.setAttribute('data-information-motion-profile','velocity-skin');homeWindow.setAttribute('data-information-motion-surface','plane');}
  doc.defaultView=win;doc.activeElement=null;doc.fonts={ready:Promise.resolve()};
  win.navigator={connection:Object.assign(new Target(),{saveData:false})};
  win.getComputedStyle=()=>({background:'transparent',borderTopWidth:'0px',borderRightWidth:'0px',borderBottomWidth:'0px',borderLeftWidth:'0px',
   borderTopColor:'transparent',borderRightColor:'transparent',borderBottomColor:'transparent',borderLeftColor:'transparent',
   outlineStyle:'none',outlineWidth:'0px',boxShadow:'none',borderTopLeftRadius:'0px'});
 }
 const frame=now=>{const work=[...pending.values()];pending.clear();for(const fn of work){frameStats.delivered++;fn(now);}};
 return{win,doc,html,queries,pending,observers,frameStats,homeRoot,homeWindow,frame,
  siteReady(){html.phase='entered';for(const observer of observers)if(!observer.disconnected&&observer.target===html)observer.fn();}};
}

function studyEnvironment(){
 const env=environment({home:true}),root=env.homeRoot;
 const element=()=>{
  const node=new Target();node.attributes=new Map();node.dataset={};node.textContent='';
  node.getAttribute=key=>node.attributes.get(key)??null;node.hasAttribute=key=>node.attributes.has(key);
  node.setAttribute=(key,value)=>node.attributes.set(key,String(value));node.removeAttribute=key=>node.attributes.delete(key);
  return node;
 };
 const tools=element(),counter=element(),toggle=element(),navigation=element();let reads=0,resolveFonts;
 const chapters=['overview','context','system','credits'].map((id,index)=>{const node=element();node.dataset.projectChapter=id;node.top=index*1200+.25;node.getBoundingClientRect=()=>{reads++;return{top:node.top-env.win.scrollY};};return node;});
 const links=chapters.map(chapter=>{const link=element();link.dataset.projectChapterLink=chapter.dataset.projectChapter;return link;});
 tools.setAttribute('hidden','');tools.querySelector=selector=>selector==='[data-project-chapter-count]'?counter:selector==='[data-study-motion-toggle]'?toggle:null;navigation.querySelectorAll=()=>links;
 root.dataset={};root.hasAttribute=key=>root.attributes.has(key);
 const set=root.setAttribute.bind(root),remove=root.removeAttribute.bind(root);
 root.setAttribute=(key,value)=>{set(key,value);if(key==='data-project-active-chapter')root.dataset.projectActiveChapter=String(value);};
 root.removeAttribute=key=>{remove(key);if(key==='data-project-active-chapter')delete root.dataset.projectActiveChapter;};
 const windows=root.querySelectorAll;root.querySelectorAll=selector=>selector==='[data-project-chapter]'?chapters:selector.startsWith('[data-project-')?[]:windows(selector);
 env.doc.querySelector=selector=>({'[data-project-study]':root,'[data-project-reading-tools]':tools,'[data-project-chapter-navigation]':navigation}[selector]??null);env.doc.querySelectorAll=()=>[];
 env.doc.fonts={ready:new Promise(resolve=>{resolveFonts=resolve;})};
 return{...env,tools,counter,toggle,navigation,chapters,links,resolveFonts,get chapterReads(){return reads;},
  pauseReceipt(){for(const observer of env.observers)if(observer.target===root&&observer.options?.attributeFilter?.includes('data-study-paused'))observer.fn([{attributeName:'data-study-paused'}]);},
  layoutReceipt(){for(const observer of env.observers)if(observer.target===root&&observer.options?.childList)observer.fn([{type:'childList'}]);}};
}

test('the native study chapter owner shares one frame through rapid reading, reduced motion and pause without repeated geometry scans',()=>{
 const env=studyEnvironment(),surface=canvas();surface.getContext=()=>null;
 const runtime=createBackgroundRuntime({createRenderer:fieldFactory}),driver=createSiteBackgroundDriver({window:env.win,document:env.doc,runtime,canvas:surface,backdrop:{style:{getPropertyValue(){return'';},setProperty(){}}}});
 const reduced=env.win.matchMedia('(prefers-reduced-motion: reduce)');reduced.matches=true;env.siteReady();env.frame(100);
 const root=env.homeRoot;assert.equal(root.dataset.projectActiveChapter,'overview');assert.equal(env.counter.textContent,'01 / 04');assert.equal(env.chapterReads,4);
 let now=100;
 for(const y of [701,2000,3101,2000,701,0]){env.win.scrollY=y;for(let i=0;i<8;i++)env.win.fire('scroll');assert.equal(env.pending.size,1);env.frame(now+=16);}
 assert.equal(env.chapterReads,4,'Only actual layout invalidation may rescan chapters');assert.equal(root.dataset.projectActiveChapter,'overview');assert.equal(env.frameStats.maxPending,1);
 env.toggle.fire('click');assert.equal(env.toggle.getAttribute('aria-pressed'),'true');assert.equal(env.toggle.textContent,'Resume motion');env.frame(now+=16);const afterPause=driver.inspect().frames;env.pauseReceipt();assert.equal(env.pending.size,0,'Same pause mutation must not reschedule its synchronous control');
 env.win.scrollY=2000;env.win.fire('hashchange');env.win.fire('scroll');env.frame(now+=16);assert.equal(root.dataset.projectActiveChapter,'system');assert.equal(env.counter.textContent,'03 / 04');assert.equal(driver.inspect().playback.activeSeconds,0);
 assert.equal(driver.inspect().frames,afterPause+1);assert.equal(env.pending.size,0);assert.deepEqual(env.links.map(link=>link.getAttribute('aria-current')),[null,null,'location',null]);
 root.removeAttribute('data-study-paused');env.pauseReceipt();assert.equal(env.toggle.getAttribute('aria-pressed'),'false');assert.equal(env.toggle.textContent,'Pause motion');env.frame(now+=16);
 driver.dispose();assert.equal(env.toggle.listeners.get('click').length,0);assert.equal(driver.inspect().events.nativeListeners,0);assert.equal(env.tools.hasAttribute('hidden'),true);
});

test('retained study chapters remeasure native layout on BFCache restore and late sources, then reject delayed work after departure',async()=>{
 const env=studyEnvironment(),surface=canvas();surface.getContext=()=>null;
 const runtime=createBackgroundRuntime({createRenderer:fieldFactory}),driver=createSiteBackgroundDriver({window:env.win,document:env.doc,runtime,canvas:surface,backdrop:{style:{getPropertyValue(){return'';},setProperty(){}}}});
 env.win.matchMedia('(prefers-reduced-motion: reduce)').matches=true;env.siteReady();env.win.scrollY=701;env.frame(100);assert.equal(env.homeRoot.dataset.projectActiveChapter,'context');
 env.doc.hidden=true;env.doc.fire('visibilitychange');env.win.fire('pagehide',{persisted:true});env.chapters[1].top=1800.5;env.win.scrollY=801;env.win.fire('scroll');assert.equal(env.pending.size,0);
 env.doc.hidden=false;env.doc.fire('visibilitychange');assert.equal(env.pending.size,0,'Visibility cannot clear retained-page suspension');env.win.fire('pageshow',{persisted:true});assert.equal(env.pending.size,1);env.frame(10000);
 assert.equal(env.homeRoot.dataset.projectActiveChapter,'overview');assert.equal(env.chapterReads,8);assert.equal(runtime.inspect().acquisitions,1);assert.equal(driver.inspect().playback.activeSeconds,0);
 env.chapters[1].top=1200.25;env.layoutReceipt();env.frame(10016);assert.equal(env.homeRoot.dataset.projectActiveChapter,'context');assert.equal(env.chapterReads,12);
 env.win.fire('pagehide',{persisted:false});const before=driver.inspect().frames,reads=env.chapterReads;env.resolveFonts();await Promise.resolve();await Promise.resolve();env.win.fire('scroll');env.win.fire('pageshow',{persisted:true});env.toggle.fire('click');env.frame(20000);
 assert.equal(driver.inspect().frames,before);assert.equal(env.chapterReads,reads);assert.equal(env.pending.size,0);assert.equal(driver.inspect().projectStudy.chapters.disposed,true);assert.equal(driver.inspect().events.nativeListeners,0);assert.equal(runtime.inspect().releases,1);assert(env.observers.every(observer=>observer.disconnected));
});

test('Home native scroll uses the single site scheduler, resets on policy and suspension, and closes every source on exit',async()=>{
 const env=environment({home:true}),surface=canvas();surface.getContext=()=>null;
 // With optional ASCII unavailable, any continuing frame is attributable to
 // Home's finite material response rather than a background animation loop.
 const runtime=createBackgroundRuntime({createRenderer:fieldFactory});
 const driver=createSiteBackgroundDriver({window:env.win,document:env.doc,runtime,canvas:surface,backdrop:{style:{getPropertyValue(){return'';},setProperty(){}}}});
 await Promise.resolve();env.frame(100);
 const home=()=>driver.inspect().homeScrolling,window=()=>home().informationWindows.items[0];
 assert.equal(home().enabled,false);assert.equal(window().y,0);assert.equal(env.pending.size,0);
 env.win.scrollY=180;env.win.fire('scroll');assert.equal(env.pending.size,0,'Preparing content cannot start material motion');
 env.siteReady();assert.equal(env.pending.size,1);env.frame(200);assert.equal(home().enabled,true);assert.equal(window().y,0);assert.equal(env.pending.size,0);
 const initialFrames=driver.inspect().frames;
 env.win.scrollY=380;env.win.fire('scroll');env.win.fire('scroll');assert.equal(env.pending.size,1,'Native scroll coalesces on the existing site scheduler');
 env.frame(216);assert.equal(driver.inspect().frames,initialFrames+1);assert.equal(home().informationWindows.moving,true);assert.ok(window().edgeMaximum>0);assert.equal(env.pending.size,1);
 assert.equal(env.win.listeners.get('scroll')[0].options.passive,true);
 const reduced=env.queries.get('(prefers-reduced-motion: reduce)');reduced.matches=true;reduced.fire('change');env.frame(232);
 assert.equal(home().enabled,false);assert.equal(window().y,0);assert.equal(window().edgeMaximum,0);assert.equal(env.pending.size,0);
 const reducedFrames=driver.inspect().frames;env.win.scrollY=420;env.win.fire('scroll');env.frame(248);assert.equal(driver.inspect().frames,reducedFrames);
 reduced.matches=false;reduced.fire('change');env.frame(264);assert.equal(home().enabled,true);assert.equal(window().y,0);
 env.win.scrollY=280;env.win.fire('scroll');env.frame(280);assert.equal(home().informationWindows.moving,true);
 const stale=[...env.pending.values()][0],beforeHidden=driver.inspect().frames;
 env.doc.hidden=true;env.doc.fire('visibilitychange');assert.equal(home().enabled,false);assert.equal(window().y,0);assert.equal(window().edgeMaximum,0);assert.equal(env.pending.size,0);
 stale(10280);assert.equal(driver.inspect().frames,beforeHidden,'An already queued callback cannot publish after suspension');
 env.win.fire('pagehide',{persisted:true});env.doc.hidden=false;env.doc.fire('visibilitychange');assert.equal(env.pending.size,0);
 env.win.fire('pageshow',{persisted:true});assert.equal(env.pending.size,1);env.frame(20280);assert.equal(home().enabled,true);assert.equal(window().y,0);assert.equal(env.pending.size,0);
 let time=20280;const nextFrame=()=>env.frame(time+=16);
 for(const [policy,value] of [[env.win.navigator.connection,'saveData'],[env.queries.get('(forced-colors: active)'),'matches']]){
  env.win.scrollY-=100;env.win.fire('scroll');nextFrame();assert.equal(home().informationWindows.moving,true);
  policy[value]=true;policy.fire('change');nextFrame();assert.equal(home().enabled,false);assert.equal(window().y,0);assert.equal(env.pending.size,0);
  env.win.scrollY-=20;env.win.fire('scroll');assert.equal(env.pending.size,0);
  policy[value]=false;policy.fire('change');nextFrame();assert.equal(home().enabled,true);assert.equal(window().y,0);
 }
 env.win.scrollY+=100;env.win.fire('scroll');nextFrame();assert.equal(home().informationWindows.moving,true);
 const beforeExit=driver.inspect().frames;env.win.fire('pagehide',{persisted:false});
 assert.equal(driver.inspect().disposed,true);assert.equal(home().disposed,true);assert.equal(home().informationWindows.count,0);assert.equal(env.homeRoot.getAttribute('data-home-scrolling-ready'),null);
 assert.equal(env.homeWindow.getAttribute('data-information-ready'),null);assert.equal(env.homeWindow.style.getPropertyValue('--information-y'),'');
 assert.equal(env.pending.size,0);assert.equal(driver.inspect().events.nativeListeners,0);assert(env.observers.every(observer=>observer.disconnected));assert.equal(runtime.inspect().activeBindings,0);assert.equal(runtime.inspect().releases,1);
 env.win.fire('scroll');env.win.fire('pageshow',{persisted:true});env.doc.fire('visibilitychange');env.frame(30344);await Promise.resolve();assert.equal(driver.inspect().frames,beforeExit);assert.equal(env.pending.size,0);
 assert.equal(env.frameStats.maxPending,1,'Home and the shared background never own simultaneous RAF requests');
 assert.equal(env.frameStats.delivered,driver.inspect().frames,'Every delivered RAF belongs to the existing site driver');driver.dispose();assert.equal(runtime.inspect().releases,1);
});

test('documentary studies share one clock, pause decorative time and release their extra control ownership on native exit',async()=>{
 const env=environment({home:true});
 env.doc.querySelector=selector=>selector==='[data-project-study]'?env.homeRoot:null;
 env.doc.querySelectorAll=()=>[];
 env.homeRoot.hasAttribute=key=>env.homeRoot.attributes.has(key);
 env.homeRoot.dataset={projectActiveChapter:'overview'};
 const informationWindows=env.homeRoot.querySelectorAll;
 env.homeRoot.querySelectorAll=selector=>selector.startsWith('[data-project-')?[]:informationWindows(selector);
 const runtime=createBackgroundRuntime({createRenderer:fieldFactory});
 const driver=createSiteBackgroundDriver({window:env.win,document:env.doc,runtime,canvas:canvas(),backdrop:{style:{getPropertyValue(){return'';},setProperty(){}}}});
 await Promise.resolve();env.siteReady();env.frame(100);env.frame(1100);
 assert.equal(driver.inspect().homeScrolling.enabled,true);
 assert.equal(driver.inspect().projectStudy.paused,false);
 assert.equal(driver.inspect().projectStudy.liquidGlass.ticks,driver.inspect().frames);
 const changePause=value=>{
  if(value)env.homeRoot.setAttribute('data-study-paused','');else env.homeRoot.removeAttribute('data-study-paused');
  for(const observer of env.observers)if(observer.target===env.homeRoot)observer.fn();
 };
 changePause(true);env.frame(1200);
 const time=driver.inspect().playback.activeSeconds;
 assert.equal(driver.inspect().projectStudy.paused,true);assert.equal(driver.inspect().homeScrolling.enabled,false);
 env.win.scrollY=300;env.win.fire('scroll');env.win.fire('wheel',{deltaY:100,deltaMode:0});env.frame(6200);
 assert.equal(driver.inspect().playback.activeSeconds,time,'Paused native reading cannot advance decorative elapsed time');
 assert.equal(driver.inspect().homeScrolling.informationWindows.settled,true);
 changePause(false);env.frame(6300);env.frame(7300);
 assert.equal(driver.inspect().projectStudy.paused,false);assert.equal(driver.inspect().homeScrolling.enabled,true);
 assert(driver.inspect().playback.activeSeconds>time);
 assert.equal(env.frameStats.maxPending,1,'Glass, information and field share one outstanding RAF');
 env.win.fire('pagehide',{persisted:false});
 assert.equal(driver.inspect().disposed,true);assert.equal(driver.inspect().projectStudy.liquidGlass.count,0);
 assert.equal(driver.inspect().events.nativeListeners,0);assert.equal(env.pending.size,0);
 assert.equal(runtime.inspect().activeBindings,0);assert.equal(runtime.inspect().releases,1);
 assert(env.observers.every(observer=>observer.disconnected));
});

test('ordinary pages use the real score, native input envelope, scoped suspension and live Reduced Motion',()=>{
 const env=environment(),runtime=createBackgroundRuntime({createRenderer:fieldFactory});
 const driver=createSiteBackgroundDriver({window:env.win,document:env.doc,runtime,canvas:canvas(),backdrop:{style:{getPropertyValue(){return'';},setProperty(){}}}});
 env.frame(100);assert.equal(driver.inspect().pageField.draws,0);assert.equal(env.pending.size,0);
 env.siteReady();env.frame(200);env.frame(1200);
 const initial=driver.inspect();assert.equal(initial.playback.activeSeconds,1);assert.equal(initial.chapterScene.field.fieldTime,1);assert.ok(initial.pageField.draws>0);
 const wheel={deltaY:300,deltaMode:0,ctrlKey:false,preventDefault(){throw Error('Native scrolling intercepted');}};
 env.win.fire('wheel',wheel);env.frame(2200);assert.ok(driver.inspect().playback.activeSeconds>2);
 assert.equal(env.win.listeners.get('wheel')[0].options.passive,true);
 const time=driver.inspect().playback.activeSeconds,draws=driver.inspect().pageField.draws;
 env.doc.hidden=true;env.doc.fire('visibilitychange');env.frame(12200);assert.equal(driver.inspect().playback.activeSeconds,time);assert.equal(driver.inspect().pageField.draws,draws);assert.equal(env.pending.size,0);
 env.win.fire('pagehide',{persisted:true});env.doc.hidden=false;env.doc.fire('visibilitychange');assert.equal(env.pending.size,0,'BFCache pagehide is still suspended after visibility restore');
 env.win.fire('pageshow');env.frame(22200);assert.equal(driver.inspect().playback.activeSeconds,time,'Hidden time is not replayed');
 const reduced=env.queries.get('(prefers-reduced-motion: reduce)');reduced.matches=true;reduced.fire('change');env.frame(22300);
 assert.equal(driver.inspect().chapterScene.field.fieldWeight,0);assert.equal(env.pending.size,0);
 reduced.matches=false;reduced.fire('change');env.frame(22400);env.frame(23400);assert.ok(driver.inspect().playback.activeSeconds>time);
 driver.dispose();driver.dispose();assert.equal(runtime.inspect().activeBindings,0);assert.equal(driver.inspect().events.nativeListeners,0);assert.equal(env.pending.size,0);
});

test('coarse browser chrome keeps field allocation stable; width changes update the same resource',()=>{
 const env=environment(),runtime=createBackgroundRuntime({createRenderer:fieldFactory});
 env.win.matchMedia('(pointer:coarse)').matches=true;
 const driver=createSiteBackgroundDriver({window:env.win,document:env.doc,runtime,canvas:canvas(),backdrop:{style:{getPropertyValue(){return'';},setProperty(){}}}});
 env.siteReady();env.frame(100);const original=driver.inspect();
 env.win.innerHeight=840;env.win.fire('resize');env.frame(200);
 assert.deepEqual(driver.inspect().size,original.size);assert.equal(driver.inspect().pageField.allocations,original.pageField.allocations);
 env.win.innerWidth=840;env.win.innerHeight=1440;env.win.fire('resize');env.frame(300);
 assert.deepEqual(driver.inspect().size,{width:840,height:1440});assert.equal(runtime.inspect().acquisitions,1);
 driver.dispose();
});

test('ordinary Reduced Motion stays idle through native input and unchanged resize, but updates a real size once and resumes',()=>{
 for(const coarse of [false,true]){
  const env=environment(),runtime=createBackgroundRuntime({createRenderer:fieldFactory}),surface=canvas();
  env.win.matchMedia('(pointer:coarse)').matches=coarse;
  const fine=env.win.matchMedia('(hover: hover) and (pointer: fine)');fine.matches=true;
  const reduced=env.win.matchMedia('(prefers-reduced-motion: reduce)');
  const driver=createSiteBackgroundDriver({window:env.win,document:env.doc,runtime,canvas:surface,backdrop:{style:{getPropertyValue(){return'';},setProperty(){}}}});
  const sample=()=>{const state=driver.inspect();return{frames:state.frames,time:state.playback.activeSeconds,draws:state.pageField.draws,size:state.size};};
  const nativeInput=[
   ['mouse',()=>env.win.fire('pointermove',{pointerType:'mouse',clientX:700,clientY:500})],
   ['pen',()=>env.win.fire('pointermove',{pointerType:'pen',clientX:720,clientY:540})],
   ['touchstart',()=>env.win.fire('touchstart',{touches:[{clientY:500}]})],
   ['touchmove',()=>env.win.fire('touchmove',{touches:[{clientY:350}]})],
   ['touchend',()=>env.win.fire('touchend',{touches:[]})],
   ['touchcancel',()=>env.win.fire('touchcancel',{touches:[]})],
   ['wheel',()=>env.win.fire('wheel',{deltaY:300,deltaMode:0,ctrlKey:false,preventDefault(){throw Error('Native scrolling intercepted');}})],
   ['blur',()=>env.win.fire('blur')],
   ['pointerleave',()=>env.html.fire('pointerleave')],
   ['fine-pointer change',()=>{fine.matches=false;fine.fire('change');fine.matches=true;fine.fire('change');}],
   ['same-size resize',()=>env.win.fire('resize')],
  ];
  const assertIdle=reason=>{
   const expected=sample();
   for(const [name,fire] of nativeInput){
    fire();assert.equal(env.pending.size,0,`${reason}: ${name} cannot schedule an ineffective frame`);
    env.frame(1800);assert.deepEqual(sample(),expected,`${reason}: ${name} cannot deliver a frame or advance/draw`);
   }
  };
  env.frame(100);assertIdle('entry pending');
  env.siteReady();env.frame(200);env.frame(1200);
  env.win.fire('pointermove',{pointerType:'mouse',clientX:700,clientY:500});env.frame(1250);
  assert.equal(driver.inspect().chapterScene.field.fieldPointerStrength,.35);
  const beforeReduced=sample();reduced.matches=true;reduced.fire('change');
  assert.equal(env.pending.size,1,'The preference change itself must deliver its clearing frame');env.frame(1300);
  const frozen=sample();assert.equal(frozen.frames,beforeReduced.frames+1);assert.equal(frozen.time,beforeReduced.time);
  assert.equal(driver.inspect().chapterScene.field.fieldWeight,0);assert.equal(env.pending.size,0);
  assertIdle('Reduced Motion');
  if(coarse){
   env.win.innerHeight-=100;env.win.fire('resize');assert.equal(env.pending.size,0,'Coarse browser-chrome height does not change stable dimensions');env.frame(2000);assert.deepEqual(sample(),frozen);
  }
  env.win.innerWidth+=80;env.win.innerHeight-=40;env.win.fire('resize');
  assert.equal(env.pending.size,1,'A real dimension change can update the static presentation once');
  env.win.fire('resize');assert.equal(env.pending.size,1);env.frame(3000);
  const resized=sample();assert.equal(resized.frames,frozen.frames+1);assert.equal(resized.time,frozen.time);assert.equal(resized.draws,frozen.draws);
  assert.deepEqual(resized.size,{width:env.win.innerWidth,height:env.win.innerHeight});assert.equal(env.pending.size,0);
  assertIdle('resized Reduced Motion');
  reduced.matches=false;reduced.fire('change');assert.equal(env.pending.size,1);env.frame(4000);env.frame(4100);
  assert.ok(driver.inspect().playback.activeSeconds>frozen.time,'Disabling Reduced Motion restores normal time');
  assert.ok(driver.inspect().pageField.draws>frozen.draws);assert.equal(driver.inspect().chapterScene.field.fieldPointerStrength,0,'Blocked input cannot leak a pointer into resume');
  env.win.fire('pointermove',{pointerType:'pen',clientX:700,clientY:500});env.frame(4200);assert.equal(driver.inspect().chapterScene.field.fieldPointerStrength,.35);
  env.doc.hidden=true;env.doc.fire('visibilitychange');assertIdle('hidden');
  driver.dispose();driver.dispose();assert.equal(runtime.inspect().activeBindings,0);assert.equal(runtime.inspect().releases,1);
  assert.equal(driver.inspect().events.nativeListeners,0);assert.equal(env.pending.size,0);assert.equal(surface.width,1);assert.equal(surface.height,1);
 }
});

test('absent optional 2D leaves static atmosphere and stops background scheduling',()=>{
 const env=environment(),surface=canvas();surface.getContext=()=>null;
 const runtime=createBackgroundRuntime({createRenderer:fieldFactory});
 const driver=createSiteBackgroundDriver({window:env.win,document:env.doc,runtime,canvas:surface,backdrop:{style:{getPropertyValue(){return'';},setProperty(){}}}});
 env.siteReady();env.frame(100);assert.equal(driver.inspect().pageField.ready,false);assert.equal(env.pending.size,0);
 driver.dispose();assert.equal(runtime.inspect().activeBindings,0);
});

test('a non-persisted document exit releases the field lease and scoped resources immediately',()=>{
 const env=environment(),runtime=createBackgroundRuntime({createRenderer:fieldFactory}),surface=canvas();
 const driver=createSiteBackgroundDriver({window:env.win,document:env.doc,runtime,canvas:surface,backdrop:{style:{getPropertyValue(){return'';},setProperty(){}}}});
 env.siteReady();env.frame(100);env.frame(200);assert.equal(runtime.inspect().activeBindings,1);
 env.win.fire('pagehide',{persisted:false});
 assert.equal(driver.inspect().disposed,true);assert.equal(driver.inspect().events.nativeListeners,0);assert.equal(env.pending.size,0);
 assert.equal(runtime.inspect().activeBindings,0);assert.equal(runtime.inspect().releases,1);assert.equal(surface.width,1);assert.equal(surface.height,1);
 env.win.fire('pageshow',{persisted:false});env.frame(5000);assert.equal(runtime.inspect().acquisitions,1);
 driver.dispose();assert.equal(runtime.inspect().releases,1);
});

for(const section of ['home','about','projects','contact'])test(`${section} explicitly owns one finite plane presenter and resets all ordinary-page policies`,async()=>{
 const env=environment({home:true,section,plane:true}),surface=canvas();surface.getContext=()=>null;
 const runtime=createBackgroundRuntime({createRenderer:fieldFactory}),driver=createSiteBackgroundDriver({window:env.win,document:env.doc,runtime,canvas:surface,backdrop:{style:{getPropertyValue(){return'';},setProperty(){}}}});
 try{
  await Promise.resolve();let now=100;const step=()=>env.frame(now+=16),item=()=>driver.inspect().homeScrolling.informationWindows.items[0];
  step();assert.equal(item().plane,true);assert.equal(item().skinStrength,0);env.siteReady();step();
  const animate=()=>{env.win.scrollY=env.win.scrollY===200?100:200;env.win.fire('scroll');step();assert.notEqual(item().skinStrength,0);assert.equal(env.pending.size,1);};
  for(const [target,key,event] of [[env.queries.get('(prefers-reduced-motion: reduce)'),'matches','change'],[env.queries.get('(forced-colors: active)'),'matches','change'],[env.win.navigator.connection,'saveData','change'],[env.doc,'hidden','visibilitychange']]){
   animate();target[key]=true;target.fire(event);step();assert.equal(item().skinStrength,0);assert.equal(driver.inspect().homeScrolling.informationWindows.settled,true);assert.equal(env.pending.size,0);
   target[key]=false;target.fire(event);step();assert.equal(item().skinStrength,0);
  }
  animate();for(let i=0;i<180&&env.pending.size;i++)step();assert.equal(env.pending.size,0);assert.equal(item().skinStrength,0);assert.equal(env.frameStats.maxPending,1);
 }finally{driver.dispose();}
 assert.equal(env.homeWindow.getAttribute('data-information-plane'),null);assert.equal(env.homeWindow.style.getPropertyValue('--information-rx'),'');assert.equal(driver.inspect().events.nativeListeners,0);assert.equal(runtime.inspect().releases,1);
});

test('the generic site owner does not acquire information windows for specialist or unknown route roots',()=>{
 for(const section of ['bending-active','xr-bending-active','unknown']){
  const env=environment({home:true,section,plane:true}),surface=canvas();surface.getContext=()=>null;
  const runtime=createBackgroundRuntime({createRenderer:fieldFactory}),driver=createSiteBackgroundDriver({window:env.win,document:env.doc,runtime,canvas:surface,backdrop:{style:{getPropertyValue(){return'';},setProperty(){}}}});
  try{env.siteReady();env.frame(100);assert.equal(driver.inspect().homeScrolling,null);assert.equal(env.homeWindow.getAttribute('data-information-ready'),null);}finally{driver.dispose();}
 }
});
