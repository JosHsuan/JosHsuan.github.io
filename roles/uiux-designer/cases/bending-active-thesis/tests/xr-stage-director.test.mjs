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

function fixture({pending=false,firstPaintFailure=false,firstPaint}={}){
 const win=new Target(),doc=new Target(),queries=new Map(),raf=new Map(),timers=new Map(),observers=[];let serial=0,now=100;
 const connection=Object.assign(new Target(),{saveData:false});doc.hidden=false;
 Object.assign(win,{innerWidth:1440,innerHeight:1000,scrollY:0,navigator:{connection},requestAnimationFrame:fn=>{const id=++serial;raf.set(id,fn);return id;},cancelAnimationFrame:id=>raf.delete(id),setTimeout:(fn,delay)=>{const id=++serial;timers.set(id,{fn,delay});return id;},clearTimeout:id=>timers.delete(id),matchMedia(query){if(!queries.has(query))queries.set(query,Object.assign(new Target(),{matches:false}));return queries.get(query);}});
 doc.defaultView=win;doc.fonts={ready:Promise.resolve()};doc.documentElement=new Element(doc);doc.documentElement.setAttribute('data-site-entry-state','requested');
 const observer=kind=>class{constructor(fn){this.fn=fn;this.kind=kind;this.nodes=new Set();this.disconnected=false;observers.push(this);}observe(node){this.nodes.add(node);}unobserve(node){this.nodes.delete(node);}disconnect(){this.nodes.clear();this.disconnected=true;}};
 Object.assign(win,{ResizeObserver:observer('resize'),IntersectionObserver:observer('intersection'),MutationObserver:observer('mutation')});
 win.getComputedStyle=()=>({background:'rgba(24, 29, 30, .72)',borderTopWidth:'1px',borderRightWidth:'1px',borderBottomWidth:'1px',borderLeftWidth:'1px',outlineStyle:'none',outlineWidth:'0px',borderTopColor:'#fff',borderRightColor:'#fff',borderBottomColor:'#fff',borderLeftColor:'#fff',borderTopLeftRadius:'18px',boxShadow:'0 8px 20px #0003'});
 const root=new Element(doc,{height:11000}),host=new Element(doc,{width:1440,height:1000}),keys=['overview','context','method','adapt','assemble','join','making','contribution','limits','credits'];
 const chapters=keys.map((key,index)=>{const node=new Element(doc,{id:`xr-${key}`,top:index*1100,height:1100});node.dataset.xrChapter=key;node.parentElement=root;return node;});
 const links=chapters.map(node=>{const link=new Element(doc,{marker:'a'});link.setAttribute('href',`#${node.id}`);return link;});
 const info=new Element(doc,{top:1200,width:500,height:160,marker:'[data-information-window]'}),skin=new Element(doc);info.parentElement=root;info.setAttribute('data-information-window','editorial');info.querySelector=selector=>selector===':scope > [data-information-skin]'?skin:null;
 root.querySelectorAll=selector=>selector==='[data-xr-chapter]'?chapters:selector==='a[href^="#"]'?links:selector==='[data-information-window]'?[info]:[];
 doc.getElementById=id=>chapters.find(node=>node.id===id)??null;
 const control=new Element(doc,{marker:'[data-xr-model-control]'});control.parentElement=root;
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
 return{win,doc,root,host,info,skin,links,chapters,control,protectedNode,queries,observers,raf,timers,connection,starts,handles,states,acquired,director,cleanup,frame,settle,site,scroll,pointer,key,makeHandle,setHit:value=>{hit=value;}};
}
function closed(facts){for(const id of new Set(facts.map(f=>f.id))){const own=facts.filter(f=>f.id===id);assert.equal(own.filter(f=>f.phase==='requested').length,1);assert.equal(own.filter(f=>['ready','failed','cancelled'].includes(f.phase)).length,1);}}

test('native XR chapters, real information presenter and first paint compose one idle scene without changing shared owners',async t=>{
 const f=fixture();t.after(f.cleanup);await f.settle();assert.equal(f.starts.length,0);assert.equal(f.info.getAttribute('data-information-ready'),'');assert.equal(f.info.textContent,'Original source caption');
 assert.equal(f.doc.documentElement.getAttribute('data-cinematic-ready'),null);assert.equal(f.doc.documentElement.getAttribute('data-cinematic-static'),null);
 f.site('entered');await f.settle();assert.equal(f.starts.length,1);assert.equal(f.director.inspect().phase,'ready');assert.ok(f.handles[0].presents.length>=1);closed(f.director.inspect().history);
 assert.ok(f.states.findIndex(s=>s.phase==='ready')>f.states.findIndex(s=>s.phase==='requested'));
 const baseline=f.director.inspect(),draws=f.handles[0].presents.length,count=f.states.length;
 assert.deepEqual(f.director.hitTest(600,400),{source:true,kind:'model'});assert.equal(f.director.hitTest(NaN,400),false);assert.equal(f.raf.size,0,'Read-only source hit diagnostics cannot schedule or mutate the scene');
 f.win.fire('resize');f.pointer('pointermove');f.win.fire('wheel',{deltaY:300});await f.settle();
 assert.equal(f.director.inspect().frames,baseline.frames);assert.equal(f.handles[0].presents.length,draws);assert.equal(f.states.length,count);
 f.scroll('adapt');await f.settle();assert.equal(f.director.inspect().chapter,'adapt');assert.equal(f.handles[0].presents.at(-1).chapter,'adapt');assert.equal(f.links[3].getAttribute('aria-current'),'location');assert.equal(f.starts.length,1);
 f.director.setPaused(true);await f.settle();assert.equal(f.handles[0].presents.at(-1).paused,true);assert.equal(f.states.at(-1).paused,true);
 const pausedDraws=f.handles[0].presents.length;f.director.setPaused(true);await f.settle();assert.equal(f.handles[0].presents.length,pausedDraws);
});

test('source-hit gestures follow Bending camera direction, keep vertical touch native and close on release/cancellation',async t=>{
 const f=fixture();t.after(f.cleanup);f.site('entered');f.scroll('method');await f.settle();
 for(const hit of [false,{source:false,kind:'model'},{source:true,kind:'phone'}]){f.setHit(hit);f.pointer('pointerdown');assert.equal(f.director.inspect().gesture,null);}
 f.setHit({source:true,kind:'model'});f.pointer('pointerdown',{target:f.protectedNode});assert.equal(f.director.inspect().gesture,null);
 f.pointer('pointerdown',{pointerType:'touch'});const vertical=f.pointer('pointermove',{pointerType:'touch',clientX:604,clientY:440});assert.equal(vertical.prevented,0);assert.equal(f.director.inspect().gesture,null);assert.equal(f.control.captured.size,0);assert.equal(f.director.inspect().gestures.at(-1).reason,'native-scroll');
 f.pointer('pointerdown',{pointerType:'touch'});const drag=f.pointer('pointermove',{pointerType:'touch',clientX:670,clientY:408});await f.settle();assert.equal(drag.prevented,1);assert.ok(f.director.inspect().camera.value.azimuth<0);assert.equal(f.control.captured.size,1);
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
  else{assert.equal(f.director.inspect().phase,'ready');assert.equal(f.handles[0].presents.at(-1).chapter,'join');assert.equal(f.handles[0].presents.at(-1).paused,true,'An unbound first paint reconciles the latest pause intent before readiness');assert.deepEqual(f.handles[0].pauseCalls,[]);assert.deepEqual(f.handles[0].sizes.at(-1),[700,1000]);assert.equal(f.states.filter(s=>s.phase==='ready').length,1);}
  closed(f.director.inspect().history);
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
