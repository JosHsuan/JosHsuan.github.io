import test from 'node:test';
import assert from 'node:assert/strict';
import {createXRStageDirector} from '../runtime/xr/XRStageDirector.mjs';

class Target{
 constructor(){this.listeners=new Map();}
 addEventListener(type,fn,options){const list=this.listeners.get(type)??[];list.push({fn,options});this.listeners.set(type,list);}
 removeEventListener(type,fn){this.listeners.set(type,(this.listeners.get(type)??[]).filter(item=>item.fn!==fn));}
 fire(type,event={}){for(const {fn}of[...this.listeners.get(type)??[]])fn(event);}
}
class Element extends Target{
 constructor(doc,{id='',top=0,width=500,height=100,marker=''}={}){
  super();Object.assign(this,{ownerDocument:doc,id,offsetTop:top,offsetHeight:height,clientHeight:height,clientWidth:width,parentElement:null,offsetParent:null,marker,textContent:'Original source caption',dataset:{}});
  this.attributes=new Map();this.styles=new Map();this.style={getPropertyValue:name=>this.styles.get(name)??'',setProperty:(name,value)=>this.styles.set(name,value)};this.captured=new Set();
 }
 getAttribute(name){return this.attributes.get(name)??null;}
 setAttribute(name,value){this.attributes.set(name,String(value));}
 removeAttribute(name){this.attributes.delete(name);}
 getBoundingClientRect(){return{left:0,top:this.offsetTop-this.ownerDocument.defaultView.scrollY,width:this.clientWidth,height:this.clientHeight,bottom:this.offsetTop-this.ownerDocument.defaultView.scrollY+this.clientHeight,right:this.clientWidth};}
 querySelector(){return null;}
 querySelectorAll(){return[];}
 closest(selector){return this.marker&&selector.includes(this.marker)?this:null;}
 contains(node){return node===this||node?.parentElement===this;}
 setPointerCapture(id){this.captured.add(id);}
 hasPointerCapture(id){return this.captured.has(id);}
 releasePointerCapture(id){this.captured.delete(id);}
}
const flush=async()=>{for(let i=0;i<14;i++)await Promise.resolve();};
const deferred=()=>{let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return{promise,resolve,reject};};

function fixture({pending=false,firstPaintFailure=false,firstPaint,workspacePending=false,workspaceDecode,plane=false}={}){
 const win=new Target(),doc=new Target(),queries=new Map(),raf=new Map(),timers=new Map(),observers=[];let serial=0,now=100;
 const connection=Object.assign(new Target(),{saveData:false});doc.hidden=false;
 Object.assign(win,{innerWidth:1440,innerHeight:1000,scrollY:0,navigator:{connection,userAgent:'Mozilla/5.0 Version/26.0 Safari/605.1.15'},CSS:{supports:()=>true},requestAnimationFrame:fn=>{const id=++serial;raf.set(id,fn);return id;},cancelAnimationFrame:id=>raf.delete(id),setTimeout:(fn,delay)=>{const id=++serial;timers.set(id,{fn,delay});return id;},clearTimeout:id=>timers.delete(id),matchMedia(query){if(!queries.has(query))queries.set(query,Object.assign(new Target(),{matches:false}));return queries.get(query);}});
 doc.defaultView=win;doc.fonts={ready:Promise.resolve()};doc.documentElement=new Element(doc);doc.documentElement.setAttribute('data-site-entry-state','requested');
 const observer=kind=>class{constructor(fn){this.fn=fn;this.kind=kind;this.nodes=new Set();this.disconnected=false;observers.push(this);}observe(node){this.nodes.add(node);}unobserve(node){this.nodes.delete(node);}disconnect(){this.nodes.clear();this.disconnected=true;}};
 Object.assign(win,{ResizeObserver:observer('resize'),IntersectionObserver:observer('intersection'),MutationObserver:observer('mutation')});
 win.getComputedStyle=()=>({background:'rgba(24, 29, 30, .72)',borderTopWidth:'1px',borderRightWidth:'1px',borderBottomWidth:'1px',borderLeftWidth:'1px',outlineStyle:'none',outlineWidth:'0px',borderTopColor:'#fff',borderRightColor:'#fff',borderBottomColor:'#fff',borderLeftColor:'#fff',borderTopLeftRadius:'18px',boxShadow:'0 8px 20px #0003'});
 const root=new Element(doc,{height:11000}),host=new Element(doc,{width:1440,height:1000}),keys=['overview','context','method','adapt','assemble','join','making','credits'];
 const chapters=keys.map((key,index)=>{const node=new Element(doc,{id:`xr-${key}`,top:index*1100,height:1100});node.dataset.xrChapter=key;node.parentElement=root;return node;});
 const links=chapters.map(node=>{const link=new Element(doc,{marker:'a'});link.setAttribute('href',`#${node.id}`);return link;});
 const workspaceImage=Object.assign(new Element(doc),{complete:!workspacePending,naturalWidth:workspacePending?0:1920,naturalHeight:workspacePending?0:1080,currentSrc:'https://site.test/assets/xr/workspace-desktop.png',decode:()=>workspaceDecode??Promise.resolve()});
 host.querySelector=selector=>selector==='[data-xr-workspace-visual]'?workspaceImage:null;
 const glass=['identity','chapter-navigation','reading-controls'].map(kind=>{
  const node=new Element(doc,{width:220,height:60,marker:'[data-liquid-glass]'}),skin=new Element(doc),image=new Element(doc),displacement=new Element(doc);node.dataset.liquidGlass=kind;
  node.querySelector=selector=>selector===':scope > [data-liquid-skin]'?skin:null;skin.querySelector=selector=>selector==='[data-liquid-map]'?image:selector==='[data-liquid-displacement]'?displacement:null;
  node.getBoundingClientRect=()=>({left:0,top:0,width:220,height:60,right:220,bottom:60});return node;
 });
 doc.querySelectorAll=selector=>selector==='[data-liquid-glass]'?glass:selector==='[data-xr-chapter-link]'?links:[];
 const info=new Element(doc,{top:1200,width:500,height:160,marker:'[data-information-window]'}),skin=new Element(doc);info.parentElement=root;info.setAttribute('data-information-window','editorial');info.querySelector=selector=>selector===':scope > [data-information-skin]'?skin:null;
 if(plane){root.setAttribute('data-information-motion-profile','velocity-skin');info.setAttribute('data-information-motion-surface','plane');}
 root.querySelectorAll=selector=>selector==='[data-xr-chapter]'?chapters:selector==='a[href^="#"]'?links:selector==='[data-information-window]'?[info]:[];
 doc.getElementById=id=>chapters.find(node=>node.id===id)??null;
 const control=new Element(doc,{marker:'[data-xr-model-control]'});control.parentElement=root;doc.activeElement=control; // Default fixtures exercise focused, finite reading; idle is tested explicitly below.
 const protectedNode=new Element(doc,{marker:'[data-protect]'});protectedNode.parentElement=root;
 const starts=[],handles=[],states=[],acquired=deferred();let hit={source:true,kind:'model'};
 const makeHandle=()=>{
  const value={disposed:0,mode:'webgl-model',successfulPaint:true,presents:[],sizes:[],pauseCalls:[],nativePaused:false,hitTest:()=>hit,resize(w,h){value.sizes.push([w,h]);},setPaused(paused){value.pauseCalls.push(paused);value.nativePaused=paused;},present(state){if(firstPaintFailure)throw Error('first-paint-unavailable');value.presents.push({...state});if(value.presents.length===1)return firstPaint;},inspect:()=>({mode:value.mode,successfulPaint:value.successfulPaint,presents:value.presents.length,size:value.sizes.at(-1)}),dispose(){value.disposed++;}};
  handles.push(value);return value;
 };
 const director=createXRStageDirector({root,host,window:win,document:doc,onState:value=>states.push(value),acquire:options=>{starts.push(options);return pending&&starts.length===1?acquired.promise:Promise.resolve(makeHandle());}});
 const cleanup=director.connect();
 const frame=(elapsed=16)=>{now+=elapsed;const work=[...raf.values()];raf.clear();for(const fn of work)fn(now);};
 const settle=async()=>{await flush();for(let i=0;i<240&&raf.size;i++){frame();await flush();}assert.equal(raf.size,0,'Finite scene and reading-skin work must settle');};
 const site=phase=>{doc.documentElement.setAttribute('data-site-entry-state',phase);for(const o of observers.filter(o=>o.kind==='mutation'))o.fn([]);};
 const scroll=key=>{win.scrollY=chapters.find(node=>node.dataset.xrChapter===key).offsetTop;win.fire('scroll');};
 const pointer=(type,overrides={})=>{const event={type,pointerId:1,pointerType:'mouse',isPrimary:true,button:0,clientX:600,clientY:400,target:control,prevented:0,preventDefault(){this.prevented++;},...overrides};doc.fire(type,event);return event;};
 const key=name=>{const event={key:name,target:control,prevented:0,preventDefault(){this.prevented++;}};doc.fire('keydown',event);return event;};
 return{win,doc,root,host,info,skin,links,chapters,control,protectedNode,workspaceImage,glass,queries,observers,raf,timers,connection,starts,handles,states,acquired,director,cleanup,frame,settle,site,scroll,pointer,key,makeHandle,setHit:value=>{hit=value;}};
}
function closed(facts){for(const id of new Set(facts.map(f=>f.id))){const own=facts.filter(f=>f.id===id);assert.equal(own.filter(f=>f.phase==='requested').length,1);assert.equal(own.filter(f=>['ready','failed','cancelled'].includes(f.phase)).length,1);}}

test('native XR chapters, real information presenter and first paint compose one idle scene without changing shared owners',async t=>{
 const f=fixture();t.after(f.cleanup);await f.settle();assert.equal(f.starts.length,0);assert.equal(f.info.getAttribute('data-information-ready'),'');assert.equal(f.info.textContent,'Original source caption');
 assert.equal(f.doc.documentElement.getAttribute('data-cinematic-ready'),null);assert.equal(f.doc.documentElement.getAttribute('data-cinematic-static'),null);
 f.site('entered');await f.settle();assert.equal(f.starts.length,1);assert.equal(f.director.inspect().phase,'ready');assert.ok(f.handles[0].presents.length>=1);closed(f.director.inspect().history);
 assert.ok(f.states.findIndex(s=>s.phase==='ready')>f.states.findIndex(s=>s.phase==='requested'));
 const baseline=f.director.inspect(),draws=f.handles[0].presents.length,count=f.states.length;
 assert.equal(f.director.hitTest(600,400),false,'The opening main visual cannot expose the prepared, invisible model');assert.equal(f.director.hitTest(NaN,400),false);assert.equal(f.raf.size,0,'Read-only source hit diagnostics cannot schedule or mutate the scene');
 f.win.fire('resize');f.pointer('pointermove');f.win.fire('wheel',{deltaY:300});await f.settle();
 assert.equal(f.director.inspect().frames,baseline.frames);assert.equal(f.handles[0].presents.length,draws);assert.equal(f.states.length,count);
 f.scroll('adapt');await f.settle();assert.equal(f.director.inspect().chapter,'adapt');assert.equal(f.handles[0].presents.at(-1).chapter,'adapt');assert.equal(f.links[3].getAttribute('aria-current'),'location');assert.equal(f.starts.length,1);
 f.director.setPaused(true);await f.settle();assert.equal(f.handles[0].presents.at(-1).paused,true);assert.equal(f.states.at(-1).paused,true);
 const pausedDraws=f.handles[0].presents.length;f.director.setPaused(true);await f.settle();assert.equal(f.handles[0].presents.length,pausedDraws);
});

test('the model-free opening and full-workspace Context keep a prepared assembly inert; later chapters reuse it and returning closes inspection',async t=>{
 const f=fixture();t.after(f.cleanup);f.site('entered');await f.settle();
 assert.equal(f.director.inspect().chapter,'overview');assert.equal(f.starts.length,1);
 const resource=f.handles[0],frames=f.director.inspect().frames;
 f.pointer('pointerdown');assert.equal(f.director.inspect().gesture,null);
 assert.equal(f.key('ArrowRight').prevented,0);assert.equal(f.director.hitTest(600,400),false);
 await f.settle();assert.equal(f.director.inspect().frames,frames,'An invisible source never acquires a motion frame');
 f.scroll('context');await f.settle();
 assert.equal(f.director.inspect().workspace.phase,'ready');assert.equal(f.director.hitTest(600,400),false);
 f.pointer('pointerdown');assert.equal(f.director.inspect().gesture,null);assert.equal(f.key('ArrowRight').prevented,0);
 f.scroll('method');await f.settle();
 assert.deepEqual(f.director.hitTest(600,400),{source:true,kind:'model'});
 f.pointer('pointerdown');f.pointer('pointermove',{clientX:680});await f.settle();
 assert.ok(f.director.inspect().camera.value.azimuth<0);
 f.scroll('overview');await f.settle();
 assert.equal(f.director.inspect().gesture,null);assert.deepEqual(f.director.inspect().camera.value,{azimuth:0,elevation:0});
 assert.equal(f.director.hitTest(600,400),false);assert.equal(f.control.captured.size,0);
 assert.equal(f.starts.length,1);assert.equal(resource.disposed,0,'Native reading reuses the already prepared scene');
 f.scroll('method');await f.settle();assert.equal(f.key('ArrowRight').prevented,1);
 await f.settle();assert.ok(f.director.inspect().camera.value.azimuth<0);assert.equal(f.starts.length,1);
});

test('source-hit gestures follow Bending camera direction, keep vertical touch native and close on release/cancellation',async t=>{
 const f=fixture();t.after(f.cleanup);f.site('entered');f.scroll('method');await f.settle();
 for(const hit of [false,{source:false,kind:'model'},{source:true,kind:'phone'}]){f.setHit(hit);f.pointer('pointerdown');assert.equal(f.director.inspect().gesture,null);}
 f.setHit({source:true,kind:'model'});f.pointer('pointerdown',{target:f.protectedNode});assert.equal(f.director.inspect().gesture,null);
 f.pointer('pointerdown',{pointerType:'touch'});const vertical=f.pointer('pointermove',{pointerType:'touch',clientX:604,clientY:440});assert.equal(vertical.prevented,0);assert.equal(f.director.inspect().gesture,null);assert.equal(f.control.captured.size,0);assert.equal(f.director.inspect().gesture,null);
 f.pointer('pointerdown',{pointerType:'touch'});const horizontal=f.pointer('pointermove',{pointerType:'touch',clientX:670,clientY:408});assert.equal(horizontal.prevented,0);assert.equal(f.control.captured.size,0);f.pointer('pointerdown');const drag=f.pointer('pointermove',{clientX:670,clientY:408});await f.settle();assert.equal(drag.prevented,1);assert.ok(f.director.inspect().camera.value.azimuth<0);assert.equal(f.control.captured.size,1);
 f.pointer('pointerup');await f.settle();assert.deepEqual(f.director.inspect().camera.value,{azimuth:0,elevation:0});assert.equal(f.control.captured.size,0);
 f.pointer('pointerdown');f.pointer('pointermove',{clientX:680,clientY:430});f.pointer('pointercancel');await f.settle();assert.equal(f.director.inspect().gesture,null);assert.deepEqual(f.director.inspect().camera.value,{azimuth:0,elevation:0});
 f.pointer('pointerdown');f.pointer('pointermove',{clientX:640});f.frame();f.pointer('pointermove',{clientX:720});f.frame(1300);assert.deepEqual(f.director.inspect().camera.value,f.director.inspect().camera.target,'A long foreground frame retains the latest held pointer intent');assert.ok(f.director.inspect().gesture.locked);f.doc.fire('lostpointercapture',{pointerId:1});await f.settle();assert.equal(f.director.inspect().gesture,null);assert.equal(f.director.inspect().gestures.at(-1).reason,'lost-capture');
 f.pointer('pointerdown');f.doc.documentElement.fire('pointerleave');await f.settle();assert.equal(f.director.inspect().gesture,null);assert.equal(f.director.inspect().gestures.at(-1).reason,'pointer-left');
 assert.equal(f.key('ArrowRight').prevented,1);await f.settle();assert.ok(f.director.inspect().camera.value.azimuth<0);assert.equal(f.key('Home').prevented,1);await f.settle();assert.deepEqual(f.director.inspect().camera.value,{azimuth:0,elevation:0});
 f.key('ArrowLeft');await f.settle();f.win.fire('blur');await f.settle();assert.deepEqual(f.director.inspect().camera.value,{azimuth:0,elevation:0});
 f.scroll('join');await f.settle();assert.equal(f.key('ArrowDown').prevented,0,'Phone reading does not inherit model arrow controls');
 f.scroll('method');await f.settle();f.handles[0].mode='poster';f.handles[0].successfulPaint=false;const fallbackFrames=f.director.inspect().frames;
 assert.equal(f.key('ArrowDown').prevented,0,'A prepared source fallback retains native keyboard scrolling');assert.equal(f.director.hitTest(600,400),false);f.pointer('pointerdown');assert.equal(f.director.inspect().gesture,null);await f.settle();assert.equal(f.director.inspect().frames,fallbackFrames);
 for(const id of new Set(f.director.inspect().gestures.map(s=>s.id))){const own=f.director.inspect().gestures.filter(s=>s.id===id);assert.equal(own.length,2);assert.equal(own[0].phase,'requested');assert.ok(['released','cancelled'].includes(own[1].phase));}
});

test('hidden pending acquisition is cancelled once, late handles are disposed and BFCache cannot resume a hidden document',async t=>{
 const f=fixture({pending:true});t.after(f.cleanup);f.site('entered');await flush();assert.equal(f.starts.length,1);
 f.doc.hidden=true;f.doc.fire('visibilitychange');assert.equal(f.starts[0].signal.aborted,true);assert.equal(f.raf.size,0);closed(f.director.inspect().history);
 const late=f.makeHandle();f.acquired.resolve(late);await flush();assert.equal(late.disposed,1);assert.equal(late.presents.length,0);
 f.win.fire('pagehide',{persisted:true});f.win.fire('pageshow');await flush();assert.equal(f.starts.length,1);assert.equal(f.raf.size,0);
 f.doc.hidden=false;f.doc.fire('visibilitychange');await f.settle();assert.equal(f.starts.length,2);assert.equal(f.director.inspect().phase,'ready');
 f.win.fire('pagehide',{persisted:true});assert.equal(f.handles.at(-1).disposed,1);assert.equal(f.director.inspect().resource,null);
 f.win.fire('pageshow');await f.settle();assert.equal(f.starts.length,3);closed(f.director.inspect().history);
});

test('Reduced Motion and Save Data keep native reading usable, clear inspection and resume only legitimate scene eligibility',async t=>{
 const f=fixture();t.after(f.cleanup);const reduced=f.queries.get('(prefers-reduced-motion: reduce)');reduced.matches=true;reduced.fire('change');f.site('entered');await f.settle();
 assert.equal(f.starts.length,0);assert.equal(f.key('ArrowDown').prevented,0);const frames=f.director.inspect().frames;
 f.pointer('pointerdown');f.pointer('pointermove',{clientX:800});f.pointer('pointerup');f.win.fire('blur');f.win.fire('resize');await f.settle();assert.equal(f.director.inspect().frames,frames);
 f.scroll('method');await f.settle();assert.equal(f.director.inspect().chapter,'method');assert.equal(f.starts.length,0);
 reduced.matches=false;reduced.fire('change');await f.settle();assert.equal(f.starts.length,1);
 f.pointer('pointerdown');f.pointer('pointermove',{clientX:750});reduced.matches=true;reduced.fire('change');await f.settle();assert.equal(f.handles[0].disposed,1);assert.equal(f.director.inspect().resource,null);assert.equal(f.director.inspect().gesture,null);assert.deepEqual(f.director.inspect().camera.value,{azimuth:0,elevation:0});
 f.connection.saveData=true;f.connection.fire('change');reduced.matches=false;reduced.fire('change');await f.settle();assert.equal(f.starts.length,1);
 f.connection.saveData=false;f.connection.fire('change');await f.settle();assert.equal(f.starts.length,2);
 f.doc.fire('freeze');f.win.fire('pageshow');await flush();assert.equal(f.starts.length,2,'pageshow cannot reacquire while freeze suspension remains');
 f.doc.fire('resume');await f.settle();assert.equal(f.starts.length,3);closed(f.director.inspect().history);
});

test('real size changes reuse the scene; offscreen and document exit release all event, frame, material and renderer ownership',async()=>{
 const f=fixture();f.site('entered');await f.settle();f.host.clientWidth=800;f.host.clientHeight=900;f.win.innerWidth=800;f.win.innerHeight=900;f.win.fire('resize');await f.settle();
 assert.equal(f.starts.length,1);assert.deepEqual(f.handles[0].sizes.at(-1),[800,900]);
 const intersection=f.observers.find(o=>o.kind==='intersection');intersection.fn([{target:f.root,isIntersecting:false,intersectionRatio:0}]);assert.equal(f.handles[0].disposed,1);assert.equal(f.director.inspect().resource,null);assert.equal(f.raf.size,0);
 intersection.fn([{target:f.root,isIntersecting:true,intersectionRatio:1}]);await f.settle();assert.equal(f.starts.length,2);
 f.pointer('pointerdown');f.win.fire('pagehide',{persisted:false});f.cleanup();f.cleanup();assert.equal(f.director.inspect().disposed,true);assert.equal(f.director.inspect().events.nativeListeners,0);assert.equal(f.raf.size,0);assert.equal(f.timers.size,0);assert.ok(f.observers.every(o=>o.disconnected));assert.ok(f.handles.every(h=>h.disposed===1));assert.equal(f.info.getAttribute('data-information-ready'),null);assert.equal(f.root.getAttribute('data-xr-director-ready'),null);assert.equal(f.info.textContent,'Original source caption');
 f.win.fire('pageshow');await flush();assert.equal(f.starts.length,2);closed(f.director.inspect().history);
});

test('bounded load failure and unsuccessful first paint never publish false ready or retry on unrelated resize',async t=>{
 for(const firstPaintFailure of [false,true]){
  const f=fixture({pending:!firstPaintFailure,firstPaintFailure});t.after(f.cleanup);f.site('entered');await flush();
  if(!firstPaintFailure){assert.equal([...f.timers.values()][0].delay,15000);for(const {fn}of[...f.timers.values()])fn();}
  await f.settle();assert.equal(f.director.inspect().phase,'failed');assert.equal(f.states.some(s=>s.phase==='ready'),false);assert.equal(f.starts[0].signal.aborted,true);closed(f.director.inspect().history);
  f.win.innerWidth=900;f.win.fire('resize');await f.settle();assert.equal(f.starts.length,1);
  if(!firstPaintFailure){const late=f.makeHandle();f.acquired.resolve(late);await flush();assert.equal(late.disposed,1);}else assert.equal(f.handles[0].disposed,1);
 }
});

test('post-ready GPU loss closes inspection and records a resource failure without a second acquisition terminal',async t=>{
 const f=fixture();t.after(f.cleanup);f.site('entered');f.scroll('method');await f.settle();f.pointer('pointerdown');f.pointer('pointermove',{clientX:700});
 f.starts[0].onFailure('context-lost');await f.settle();const state=f.director.inspect();assert.equal(state.phase,'failed');assert.equal(state.reason,'context-lost');assert.equal(state.resource,null);assert.equal(state.gesture,null);assert.equal(f.control.captured.size,0);assert.equal(f.handles[0].disposed,1);closed(state.history);assert.deepEqual(state.resourceFailures,[{id:state.id,phase:'resource-failed',reason:'context-lost'}]);
 assert.equal(f.director.hitTest(600,400),false);
 assert.equal(f.key('ArrowDown').prevented,0);f.pointer('pointerdown');assert.equal(f.director.inspect().gesture,null);
});

test('an asynchronous first phone paint stays requested, reconciles native chapter and size changes, and cannot publish late readiness',async t=>{
 for(const cancelled of [false,true]){
  const paint=deferred(),f=fixture({firstPaint:paint.promise});t.after(f.cleanup);f.site('entered');f.scroll('adapt');await flush();
  assert.equal(f.director.inspect().phase,'requested');assert.equal(f.states.some(s=>s.phase==='ready'),false);assert.equal(f.handles[0].presents.length,1);
  if(cancelled){f.doc.hidden=true;f.doc.fire('visibilitychange');assert.equal(f.handles[0].disposed,1,'Cancellation releases the acquired scene while first paint is still awaiting native media');}
  else{f.scroll('join');f.director.setPaused(true);f.host.clientWidth=700;f.win.innerWidth=700;f.win.fire('resize');f.frame();}
  paint.resolve();await f.settle();
  if(cancelled){assert.equal(f.states.some(s=>s.phase==='ready'),false);assert.equal(f.handles[0].disposed,1);assert.equal(f.director.inspect().resource,null);}
  else{assert.equal(f.director.inspect().phase,'ready');assert.equal(f.handles[0].presents.at(-1).chapter,'join');assert.equal(f.handles[0].presents.at(-1).paused,true,'An unbound first paint reconciles the latest pause intent before readiness');assert.deepEqual(f.handles[0].pauseCalls,[]);assert.deepEqual(f.handles[0].sizes.at(-1),[700,1000]);assert.equal(f.states.filter((s,index)=>s.phase==='ready'&&f.states[index-1]?.phase!=='ready').length,1,'Scene-mode UI updates do not create a second acquisition readiness transition');}
  closed(f.director.inspect().history);
 }
});

test('phone chapters keep the painted surface visible while the next source waits and close superseded or disposed requests',async t=>{
 for(const superseded of [false,true]){
  const f=fixture();t.after(f.cleanup);f.site('entered');f.scroll('adapt');await f.settle();
  assert.equal(f.director.inspect().scene.mode,'hold');assert.equal(f.director.inspect().scene.chapter,'adapt');
  const paint=deferred(),handle=f.handles[0],original=handle.present;
  handle.present=state=>{const result=original(state);return state.chapter==='join'?paint.promise:result;};
  f.scroll('join');f.frame();
  let scene=f.director.inspect().scene;
   assert.equal(scene.mode,'waiting');assert.equal(scene.chapter,'join');assert.equal(scene.opacity,1);assert.equal(handle.presents.at(-1).chapter,'join');
  f.pointer('pointerdown');assert.equal(f.director.inspect().gesture,null);
  await f.settle();scene=f.director.inspect().scene;
   assert.equal(scene.mode,'waiting');assert.equal(scene.chapter,'join');assert.equal(scene.opacity,1);assert.equal(scene.paintPending,true);
  assert.equal(f.raf.size,0,'A pending native paint does not spin the Director clock');
  if(superseded){f.scroll('method');await f.settle();assert.equal(f.director.inspect().scene.chapter,'method');assert.equal(f.director.inspect().scene.mode,'hold');}
  paint.resolve();await f.settle();scene=f.director.inspect().scene;
  assert.equal(scene.chapter,superseded?'method':'join');assert.equal(scene.mode,'hold');assert.equal(scene.opacity,1);assert.equal(scene.settled,true);
  const history=scene.history;
  for(const id of new Set(history.map(item=>item.id))){const own=history.filter(item=>item.id===id);assert.equal(own.filter(item=>item.status==='requested').length,1);assert.equal(own.filter(item=>['completed','cancelled'].includes(item.status)).length,1);}
  f.scroll('making');f.frame();f.cleanup();
  const final=f.director.inspect().scene.history;
  assert.equal(final.at(-1).status,'cancelled');assert.equal(final.at(-1).reason,'disposed');
 }
});

test('native pause commands acknowledge before UI state without waiting for a camera RAF and failures close the same resource',async t=>{
 const f=fixture();t.after(f.cleanup);f.site('entered');f.scroll('adapt');await f.settle();
 const handle=f.handles[0],initial={frames:f.director.inspect().frames,presents:handle.presents.length},applyPause=handle.setPaused;
 handle.setPaused=next=>{assert.equal(f.states.at(-1).paused,!next,'The renderer receives the semantic command before the UI acknowledges it');applyPause(next);};
 f.director.setPaused(true);
 assert.equal(handle.nativePaused,true);assert.equal(f.states.at(-1).paused,true);assert.deepEqual(handle.pauseCalls,[true]);
 assert.equal(f.director.inspect().frames,initial.frames);assert.equal(handle.presents.length,initial.presents,'Native pause does not draw or await a demand frame');assert.equal(f.raf.size,1);
 const acknowledged=f.states.length;
 f.director.setPaused(true);assert.deepEqual(handle.pauseCalls,[true]);assert.equal(f.states.length,acknowledged);assert.equal(f.raf.size,1);
 f.director.setPaused(false);
 assert.equal(handle.nativePaused,false);assert.equal(f.states.at(-1).paused,false);assert.deepEqual(handle.pauseCalls,[true,false]);assert.equal(handle.presents.length,initial.presents);assert.equal(f.director.inspect().frames,initial.frames);
 await f.settle();assert.equal(handle.presents.length,initial.presents,'Coalesced semantic commands preserve the idle camera paint cache');
 handle.setPaused=()=>{throw Error('native-pause-unavailable');};
 f.director.setPaused(true);
 const failed=f.director.inspect();assert.equal(failed.phase,'failed');assert.equal(failed.reason,'native-pause-unavailable');assert.equal(failed.resource,null);assert.equal(handle.disposed,1);assert.equal(f.raf.size,0);assert.equal(handle.presents.length,initial.presents);closed(failed.history);
 assert.deepEqual(failed.resourceFailures,[{id:failed.id,phase:'resource-failed',reason:'native-pause-unavailable'}]);
});

test('a decoded full-workspace image owns Context entry even when the hidden assembly already painted, without another clock',async t=>{
 const decode=deferred(),f=fixture({workspacePending:true,workspaceDecode:decode.promise});t.after(f.cleanup);
 f.site('entered');f.scroll('context');await f.settle();let state=f.director.inspect();
 assert.equal(state.phase,'ready');assert.equal(state.scene.paintedChapter,'context','The assembly can prepare behind Context');
 assert.equal(state.workspace.phase,'loading');assert.equal(state.scene.mode,'waiting');assert.equal(state.scene.opacity,0);assert.equal(state.scene.settled,false);
 assert.equal(f.raf.size,0,'A pending image cannot spin a second clock or the Director scheduler');assert.equal(f.timers.size,0,'Readiness comes from the native image, not a new simulated image timer');
 Object.assign(f.workspaceImage,{complete:true,naturalWidth:1920,naturalHeight:1080});f.workspaceImage.fire('load');await flush();
 assert.equal(f.director.inspect().workspace.phase,'loading','Native load alone is insufficient while decode still awaits');assert.equal(f.raf.size,0);
 decode.resolve();await f.settle();state=f.director.inspect();
 assert.equal(state.workspace.phase,'ready');assert.equal(state.workspace.source,f.workspaceImage.currentSrc);assert.equal(state.scene.mode,'hold');assert.equal(state.scene.opacity,1);assert.equal(state.scene.settled,true);
 assert.equal(f.director.hitTest(600,400),false,'The complete readonly workspace cannot expose the hidden assembly hit area');assert.equal(f.starts.length,1);
 for(const id of new Set(state.scene.history.map(item=>item.id))){const own=state.scene.history.filter(item=>item.id===id);assert.equal(own.filter(item=>item.status==='requested').length,1);assert.equal(own.filter(item=>['completed','cancelled'].includes(item.status)).length,1);}
});

test('workspace image errors close a readable static Context and a stale decode cannot manufacture readiness after error or disposal',async t=>{
 for(const terminal of ['error','dispose']){
  const decode=deferred(),f=fixture({workspaceDecode:decode.promise});t.after(f.cleanup);f.site('entered');f.scroll('context');await f.settle();
  assert.equal(f.director.inspect().scene.mode,'waiting');
  if(terminal==='error'){
   f.workspaceImage.fire('error');await f.settle();const failed=f.director.inspect();
   assert.equal(failed.workspace.phase,'failed');assert.equal(failed.workspace.reason,'workspace-image-unavailable');assert.equal(failed.scene.mode,'hold');assert.equal(failed.scene.settled,true);
   assert.equal(failed.scene.history.at(-1).status,'completed');assert.equal(failed.scene.history.at(-1).reason,'static');assert.equal(f.director.hitTest(600,400),false);assert.equal(f.key('ArrowDown').prevented,0);
  }else{f.cleanup();assert.equal(f.director.inspect().scene.history.at(-1).status,'cancelled');assert.equal(f.director.inspect().scene.history.at(-1).reason,'disposed');}
  const before={workspace:f.director.inspect().workspace,frames:f.director.inspect().frames};decode.resolve();await flush();
  assert.deepEqual(f.director.inspect().workspace,before.workspace);assert.equal(f.director.inspect().frames,before.frames);assert.equal(f.raf.size,0);
  if(terminal==='dispose'){assert.equal(f.director.inspect().events.nativeListeners,0);assert.equal(f.host.getAttribute('data-xr-workspace-phase'),null);}
 }
});

test('responsive workspace sources require their own decoded epoch and an older source cannot acknowledge a later request',async t=>{
 const f=fixture();t.after(f.cleanup);f.site('entered');f.scroll('context');await f.settle();assert.equal(f.director.inspect().workspace.phase,'ready');
 const oldDecode=deferred(),newDecode=deferred();
 Object.assign(f.workspaceImage,{complete:false,currentSrc:'https://site.test/assets/xr/workspace-mobile.png',decode:()=>oldDecode.promise});
 f.host.clientWidth=390;f.host.clientHeight=844;f.win.innerWidth=390;f.win.innerHeight=844;f.win.fire('resize');await f.settle();
 assert.equal(f.director.inspect().workspace.phase,'loading');assert.equal(f.director.inspect().scene.mode,'waiting');assert.equal(f.raf.size,0);
 Object.assign(f.workspaceImage,{complete:true,naturalWidth:1000,naturalHeight:2164});f.workspaceImage.fire('load');await flush();
 Object.assign(f.workspaceImage,{currentSrc:'https://site.test/assets/xr/workspace-desktop-v2.png',naturalWidth:1920,naturalHeight:1080,decode:()=>newDecode.promise});f.workspaceImage.fire('load');await flush();
 oldDecode.resolve();await flush();assert.equal(f.director.inspect().workspace.phase,'loading','The older native decode cannot acknowledge the new picture source');assert.equal(f.raf.size,0);
 newDecode.resolve();await f.settle();const state=f.director.inspect();
 assert.equal(state.workspace.phase,'ready');assert.equal(state.workspace.source,f.workspaceImage.currentSrc);assert.equal(state.workspace.width,1920);assert.equal(state.workspace.height,1080);assert.equal(state.scene.mode,'hold');assert.equal(f.starts.length,1,'A picture source switch never creates another WebGL context');
});

test('the three shared glass groups use the XR Director scheduler, engine fallback and native keyboard reset without waking an idle model',async()=>{
 const f=fixture();f.site('entered');await f.settle();let state=f.director.inspect();
 assert.equal(state.liquidGlass.count,3);assert.equal(state.liquidGlass.mode,'reflective');assert.equal(state.liquidGlass.settled,true);assert.equal(f.raf.size,0);
 f.pointer('pointermove',{target:f.glass[0],clientX:180,clientY:40});assert.equal(f.raf.size,1);await f.settle();
 state=f.director.inspect();assert.equal(state.liquidGlass.settled,true);assert.equal(state.liquidGlass.items[0].hover,1);assert.equal(f.raf.size,0);
 const before=state.frames;assert.equal(f.key('Tab').prevented,0);assert.equal(f.director.inspect().liquidGlass.items[0].hover,0);assert.equal(f.director.inspect().frames,before);assert.equal(f.raf.size,0,'Keyboard reset must not steal native keys or wake a camera frame');
 const contrast=f.queries.get('(prefers-contrast: more)');contrast.matches=true;contrast.fire('change');await f.settle();assert.equal(f.director.inspect().liquidGlass.mode,'opaque');
 assert.ok(f.glass.every(node=>node.getAttribute('data-liquid-mode')==='opaque'));assert.equal(f.director.inspect().liquidGlass.mapPixels,0);
 f.cleanup();assert.equal(f.director.inspect().events.nativeListeners,0);assert.equal(f.director.inspect().liquidGlass.count,0);assert.ok(f.glass.every(node=>node.getAttribute('data-liquid-ready')===null&&node.getAttribute('data-liquid-mode')===null));assert.equal(f.raf.size,0);
});

test('model native progress drives genuine camera reversibly and outgoing model uses its own clamped interval',async t=>{
 const f=fixture();t.after(f.cleanup);f.site('entered');f.scroll('method');await f.settle();const handle=f.handles[0],method=f.chapters.find(row=>row.dataset.xrChapter==='method');
 const read=async progress=>{f.win.scrollY=method.offsetTop+progress*method.offsetHeight-f.win.innerHeight*.42;f.win.fire('scroll');await f.settle();return handle.presents.at(-1);};
 const a=await read(.1),b=await read(.8);assert(b.cameraIntent.yawRad>a.cameraIntent.yawRad);assert(b.cameraIntent.pitchRad>a.cameraIntent.pitchRad);assert.deepEqual((await read(.1)).cameraIntent,a.cameraIntent);assert.equal(f.starts.length,1);
 f.scroll('adapt');f.frame();assert.equal(f.director.inspect().scene.chapter,'method');assert.equal(f.director.inspect().camera.modelProgress,1);assert(Math.abs(handle.presents.at(-1).cameraIntent.yawRad-1.16)<1e-12);await f.settle();assert.equal(handle.presents.at(-1).cameraIntent,null);assert.deepEqual(handle.presents.at(-1).handheld,{xPx:0,yPx:0,rollRad:0});
 f.scroll('method');await f.settle();f.scroll('context');f.frame();assert.equal(f.director.inspect().scene.chapter,'method');assert.equal(f.director.inspect().camera.modelProgress,0);assert.equal(handle.presents.at(-1).cameraIntent.yawRad,.92);await f.settle();assert.equal(handle.presents.at(-1).cameraIntent,null);
});

test('visible XR model idle changes only handheld intent on one scheduler; focus settles and pause resumes finitely',async t=>{
 const f=fixture();t.after(f.cleanup);f.site('entered');f.scroll('method');await f.settle();const handle=f.handles[0];
 f.doc.activeElement=null;f.root.fire('focusout',{target:f.control});for(let i=0;i<30;i++){f.frame();await flush();assert(f.raf.size<=1);}
 const before=handle.presents.at(-1),clock=f.director.inspect().camera.activeSeconds;f.frame();await flush();const after=handle.presents.at(-1);
 assert.deepEqual(after.cameraIntent,before.cameraIntent);assert.notDeepEqual(after.handheld,before.handheld);assert(f.director.inspect().camera.activeSeconds>clock);assert.equal(f.raf.size,1);
 f.director.setPaused(true);await f.settle();const held=handle.presents.at(-1);f.win.scrollY+=250;f.win.fire('scroll');await f.settle();assert.deepEqual(handle.presents.at(-1).cameraIntent,held.cameraIntent);assert.deepEqual(handle.presents.at(-1).handheld,held.handheld);
 f.doc.activeElement=f.control;f.director.setPaused(false);f.frame();await flush();assert.equal(f.director.inspect().camera.recovering,true);await f.settle();assert.equal(f.director.inspect().camera.recovering,false);assert.deepEqual(handle.presents.at(-1).handheld,{xPx:0,yPx:0,rollRad:0});assert.notDeepEqual(handle.presents.at(-1).cameraIntent,held.cameraIntent);
 const stopped=f.director.inspect().camera.activeSeconds;f.doc.hidden=true;f.doc.fire('visibilitychange');f.frame(10000);assert.equal(f.director.inspect().camera.activeSeconds,stopped);assert.equal(f.raf.size,0);
});


test('XR plane windows use the existing clock and neutralize Pause, entry, static preferences and suspension',async t=>{
 const f=fixture({plane:true});t.after(f.cleanup);await f.settle();
 const item=()=>f.director.inspect().informationWindows.items[0];
 assert.equal(item().plane,true);assert.equal(item().skinStrength,0);f.site('entered');f.scroll('context');await f.settle();
 const animate=()=>{f.win.scrollY=f.win.scrollY===1100?1180:1100;f.win.fire('scroll');f.frame();assert.notEqual(item().skinStrength,0);assert.equal(f.raf.size,1);};
 const policies=[
  value=>f.director.setPaused(value),
  value=>{const q=f.queries.get('(forced-colors: active)');q.matches=value;q.fire('change');},
  value=>{f.connection.saveData=value;f.connection.fire('change');},
  value=>{const q=f.queries.get('(prefers-reduced-motion: reduce)');q.matches=value;q.fire('change');},
  value=>f.site(value?'requested':'entered'),
  value=>{f.doc.hidden=value;f.doc.fire('visibilitychange');},
 ];
 for(const policy of policies){
  animate();policy(true);await f.settle();assert.equal(item().skinStrength,0);assert.equal(f.director.inspect().informationWindows.settled,true);assert.equal(f.raf.size,0);
  policy(false);await f.settle();assert.equal(item().skinStrength,0);
 }
 animate();await f.settle();assert.equal(item().skinStrength,0);f.cleanup();assert.equal(f.info.getAttribute('data-information-plane'),null);assert.equal(f.info.style.getPropertyValue('--information-rx'),'');assert.equal(f.director.inspect().events.nativeListeners,0);
});
