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
function environment(){
 const win=new Target(),doc=new Target(),html=new Target(),pending=new Map(),queries=new Map();let next=0,observer;
 html.phase='requested';html.getAttribute=()=>html.phase;doc.documentElement=html;doc.hidden=false;
 Object.assign(win,{innerWidth:1440,innerHeight:1000,requestAnimationFrame:fn=>{pending.set(++next,fn);return next;},cancelAnimationFrame:id=>pending.delete(id),matchMedia(query){if(!queries.has(query))queries.set(query,Object.assign(new Target(),{matches:false}));return queries.get(query);},MutationObserver:class{constructor(fn){observer=fn;}observe(){}disconnect(){observer=null;}}});
 const frame=now=>{const work=[...pending.values()];pending.clear();for(const fn of work)fn(now);};
 return{win,doc,html,queries,pending,frame,siteReady(){html.phase='entered';observer?.();}};
}

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
