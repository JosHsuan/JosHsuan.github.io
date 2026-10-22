import test from 'node:test';
import assert from 'node:assert/strict';
import {DOMPresenter} from '../runtime/presentation/DOMPresenter.ts';
import {registerProjectStudyStage,observeProjectStudyStage} from '../runtime/site/ProjectStudyStageRegistry.mjs';
import {acquirePagePreviewReadiness} from '../runtime/site/PagePreviewReadiness.mjs';
import {createProjectStudyScenePresenter,createProjectStudyStageMotion,advanceProjectStudyStageMotion,cancelProjectStudyStageMotion} from '../runtime/site/ProjectStudyScenePresenter.mjs';
import {createSiteBackgroundDriver} from '../runtime/background/SiteBackgroundDriver.mjs';
import {createProjectStudyBackdropPresenter} from '../runtime/site/ProjectStudyBackdropPresenter.mjs';
import {createBackgroundRuntime} from '../runtime/background/BackgroundRuntime.mjs';
import {acquireProjectStudyScene} from '../components/project-study-scene.mjs';
import {createHash} from 'node:crypto';

const keys=['overview','context','system','making','results','credits'],models=['context','system'];
const flush=async()=>{for(let i=0;i<16;i++)await Promise.resolve();};
const deferred=()=>{let resolve;const promise=new Promise(done=>{resolve=done;});return{promise,resolve};};
const closed=history=>{for(const id of new Set(history.map(item=>item.id))){const facts=history.filter(item=>item.id===id);assert.equal(facts.filter(item=>(item.status??item.phase)==='requested').length,1);assert.equal(facts.filter(item=>['ready','failed','cancelled','completed'].includes(item.status??item.phase)).length,1);}};
class Target{
 constructor(){this.listeners=new Map();this.attributes=new Map();this.dataset={};this.styles=new Map();this.style={getPropertyValue:key=>this.styles.get(key)??'',setProperty:(key,value)=>this.styles.set(key,String(value))};this.captured=new Set();}
 addEventListener(type,fn){const rows=this.listeners.get(type)??[];rows.push(fn);this.listeners.set(type,rows);}
 removeEventListener(type,fn){this.listeners.set(type,(this.listeners.get(type)??[]).filter(value=>value!==fn));}
 fire(type,event={}){for(const fn of [...this.listeners.get(type)??[]])fn(event);}
 getAttribute(name){return this.attributes.get(name)??null;}setAttribute(name,value){this.attributes.set(name,String(value));}removeAttribute(name){this.attributes.delete(name);}
 querySelector(){return null;}querySelectorAll(){return[];}closest(selector){return selector.split(',').some(part=>part===this.marker||this.markers?.includes(part))?this:this.parentElement?.closest(selector)??null;}
 setPointerCapture(id){this.captured.add(id);}hasPointerCapture(id){return this.captured.has(id);}releasePointerCapture(id){this.captured.delete(id);}
}
function fixture({pending=false,firstDraw=true,reduced=false,externalStage=false,posterPending=false,camera=false}={}){
 const doc=new Target(),win=new Target(),root=new Target(),host=new Target(),surface=new Target(),timers=new Map(),policy={hidden:false,reduced,saveData:false,paused:false,siteReady:false},waiting=deferred();
 const modelUI=Object.fromEntries(models.map(key=>{const row=Object.fromEntries(['target','state','help','reset'].map(field=>{const node=new Target();node.id=`${key}-${field}`;node.dataset['projectModel'+field[0].toUpperCase()+field.slice(1)]=key;node.markers=[`[data-project-model-${field}]`];if(field==='target')node.markers.push('[data-project-model-control]');if(['help','reset'].includes(field))node.setAttribute('hidden','');return[field,node];}));row.target.setAttribute('aria-describedby',`${row.state.id} ${row.help.id}`);return[key,row];})),control=modelUI.context.target;
 let timerId=0,schedules=0,disposed=0,starts=0,fixtureSignal,failResource,now=0;const presentations=[],calls=[],sizes=[],poster=posterPending?Object.assign(new Target(),{complete:false,naturalWidth:0}):null;
 doc.documentElement=new Target();doc.querySelectorAll=()=>[host];root.dataset.projectActiveChapter='overview';root.querySelectorAll=selector=>selector==='[data-project-chapter]'?keys.map(key=>({dataset:{projectChapter:key}})):Object.values(modelUI).flatMap(row=>Object.values(row).filter(node=>node.markers.includes(selector)));host.querySelector=selector=>selector==='[data-project-model-surface]'?surface:selector==='[data-project-model-poster]'?poster:null;
 Object.assign(win,{innerWidth:1440,innerHeight:1000,performance:{now:()=>now},setTimeout:(fn,delay)=>{timers.set(++timerId,{fn,delay});return timerId;},clearTimeout:id=>timers.delete(id)});
 const model={chapters:models,alt:'Verified source geometry',...(camera?{views:{context:{yaw:.56,pitch:.18,fov:36,zoom:1.04},system:{yaw:.84,pitch:.26,fov:36,zoom:1.04}},cameraPath:[{chapter:'context',progress:0,yawRad:.56,pitchRad:.18,fovDeg:36,zoom:1.04},{chapter:'system',progress:0,yawRad:.84,pitchRad:.26,fovDeg:36,zoom:1.04},{chapter:'system',progress:1,yawRad:.98,pitchRad:.30,fovDeg:36,zoom:1.04}]}:{})},handle={resize(w,h){calls.push('resize');sizes.push([w,h]);},present(value){calls.push('present');presentations.push({...value});},inspect:()=>({firstDraw:firstDraw?{completed:true}:null,successfulPaint:firstDraw,view:presentations.at(-1)}),hitTest:()=>true,dispose(){disposed++;}};
 const publisher=new DOMPresenter().forOwner('test-scene'),scene=createProjectStudyScenePresenter({root,host,model,externalStage,window:win,document:doc,publisher,schedule:()=>schedules++,policy:()=>policy,acquire:options=>{starts++;fixtureSignal=options.signal;failResource=options.onFailure;return pending?waiting.promise:Promise.resolve(handle);}});
 const step=(dt=.016,resumed=false)=>scene.publish({dt,resumed});
 const settle=()=>{let remaining=240;while(step()&&remaining-->0);assert(remaining>0,'Finite work settles on supplied active seconds');};
 const select=key=>{root.dataset.projectActiveChapter=key;step();settle();};
 const pointer=(type,overrides={})=>{const event={type,target:control,pointerId:1,pointerType:'mouse',isPrimary:true,button:0,clientX:600,clientY:400,prevented:0,preventDefault(){this.prevented++;},...overrides};doc.fire(type,event);return event;};
 const key=(name,target=control,overrides={})=>{const event={target,key:name,prevented:0,preventDefault(){this.prevented++;},...overrides};doc.fire('keydown',event);return event;};
 return{doc,win,root,host,surface,control,modelUI,publisher,policy,timers,waiting,handle,scene,step,settle,select,pointer,key,presentations,calls,sizes,poster,advanceClock:ms=>{now+=ms;},fail:reason=>failResource(reason),get starts(){return starts;},get disposed(){return disposed;},get schedules(){return schedules;},get signal(){return fixtureSignal;}};
}

test('a pending static model poster has no timer until selected and preserves its active preparation bound across suspension and source departure',async()=>{
 const f=fixture({reduced:true,externalStage:true,posterPending:true});await flush();assert.equal(f.timers.size,0);f.root.dataset.projectActiveChapter='context';assert.equal(f.scene.prepare('context'),false);assert.equal(f.timers.size,1);assert.equal([...f.timers.values()][0].delay,15000);
 const stale=[...f.timers.values()][0].fn;f.advanceClock(5000);f.policy.hidden=true;f.scene.suspend('page');assert.equal(f.timers.size,0);assert.equal(f.scene.inspect().posterPreparation.remainingMs,10000);f.advanceClock(100000);stale();assert.equal(f.scene.inspect().posterFailed,false);
 f.policy.hidden=false;f.scene.resume();assert.equal([...f.timers.values()][0].delay,10000);f.advanceClock(1000);f.root.dataset.projectActiveChapter='making';f.scene.publish({dt:0,stage:{kind:'image',chapter:'making',mode:'hold',settled:true,history:[]}});assert.equal(f.timers.size,0);assert.equal(f.scene.inspect().posterPreparation.remainingMs,9000);
 f.root.dataset.projectActiveChapter='context';assert.equal(f.scene.prepare('context'),false);assert.equal([...f.timers.values()][0].delay,9000);f.poster.complete=true;f.poster.naturalWidth=1600;f.poster.fire('load');assert.equal(f.timers.size,0);assert.equal(f.scene.prepare('context'),true);f.scene.dispose();assert.equal(f.timers.size,0);
 const exit=fixture({reduced:true,externalStage:true,posterPending:true});await flush();exit.root.dataset.projectActiveChapter='context';exit.scene.prepare('context');const late=[...exit.timers.values()][0].fn;exit.scene.dispose();assert.equal(exit.timers.size,0);late();assert.equal(exit.scene.inspect().posterFailed,false);assert([...exit.poster.listeners.values()].every(rows=>rows.length===0));
});

test('a permanently pending static model poster fails once, closes the shared model source and cannot upgrade after a late load',async()=>{
 for(const startupFallback of [false,true]){
 const f=fixture({reduced:!startupFallback,pending:startupFallback,externalStage:true,posterPending:true}),entry=acquirePagePreviewReadiness(f.doc);await flush();if(startupFallback)entry.fallback('startup-timeout');await flush();assert.equal((await entry.promise).previews[0].mode,'static');f.policy.reduced=false;f.policy.siteReady=true;f.root.dataset.projectActiveChapter='context';
 const figure=new Target(),image=Object.assign(new Target(),{complete:true,naturalWidth:1600,decode:async()=>{}});figure.dataset.projectMedia='context';image.setAttribute('src','/documentary.webp');figure.querySelector=selector=>selector==='img'||selector==='[data-project-media-poster]'?image:null;
 f.root.querySelectorAll=selector=>selector==='[data-project-chapter]'?keys.map(key=>({dataset:{projectChapter:key}})):selector==='[data-project-media]'?[figure]:[];
 const backdrop=createProjectStudyBackdropPresenter({root:f.root,window:f.win,document:f.doc,publisher:new DOMPresenter().forOwner('poster-fallback'),schedule:()=>{},policy:()=>f.policy});backdrop.setScene({actor:f.scene,host:f.host,model:{sha256:'verified-model-revision',chapters:models}});await flush();backdrop.publish({dt:0});assert.equal(backdrop.inspect().stage.mode,'waiting');
 const [id,timer]=[...f.timers][0];f.timers.delete(id);f.advanceClock(15000);timer.fn();assert.equal(f.scene.inspect().posterFailed,true);assert.equal(f.scene.inspect().posterPreparation.reason,'model-poster-timeout');backdrop.publish({dt:0});assert.equal(backdrop.inspect().stage.key,'image:/documentary.webp');assert.equal(backdrop.inspect().stage.mode,'hold');closed(backdrop.inspect().stage.history);assert.equal(backdrop.inspect().stage.history.filter(item=>item.key==='model:verified-model-revision'&&item.status==='failed').length,1);
 assert.equal(backdrop.inspect().stage.history.find(item=>item.key==='model:verified-model-revision'&&item.status==='failed').reason,'model-poster-timeout');
 f.poster.complete=true;f.poster.naturalWidth=1600;f.poster.fire('load');assert.equal(f.scene.inspect().posterFailed,true);assert.equal(f.host.getAttribute('data-project-model-poster-ready'),null);assert.equal(f.scene.prepare('context'),false);assert.equal(f.timers.size,0);if(startupFallback){f.waiting.resolve(f.handle);await flush();assert.equal(f.disposed,1);}backdrop.dispose();f.scene.dispose();
 }
});

test('document registration handles both effect orders and releases only its own stage',()=>{
 const doc={},seen=[],release=registerProjectStudyStage(doc,{model:'real-source'}),stop=observeProjectStudyStage(doc,value=>seen.push(value?.model??null));
 assert.deepEqual(seen,['real-source']);assert.throws(()=>registerProjectStudyStage(doc,{}),/already owns/);release();release();assert.deepEqual(seen,['real-source',null]);
 const next=registerProjectStudyStage(doc,{model:'next-source'});release();assert.deepEqual(seen,['real-source',null,'next-source']);stop();next();assert.equal(seen.length,3);
});

test('chapter passages wait for source paint, preserve reversal continuity and close every request',()=>{
 const state=createProjectStudyStageMotion(),advance=(dt,chapter,readyChapter=null,snap=false)=>advanceProjectStudyStageMotion(state,dt,{chapter,chapters:keys,modelChapters:models,readyChapter,snap});
 advance(.5,'context');assert.equal(state.mode,'waiting');assert.equal(state.pose.opacity,0);advance(.4,'context','context');assert(state.pose.opacity>0&&state.pose.opacity<1);
 const opacity=state.pose.opacity;advance(0,'system','context');assert.equal(state.pose.opacity,opacity,'Retargeting starts from the actual displayed pose');
 advance(3,'system','system');assert.equal(state.mode,'hold');assert.equal(state.chapter,'system');assert.equal(state.pose.opacity,1);closed(state.history);
 advance(.1,'credits','system');advance(.1,'context','context');advance(4,'context','context');closed(state.history);assert.equal(state.mode,'hold');
 advance(.1,'results');cancelProjectStudyStageMotion(state,'page-exit');closed(state.history);assert.equal(state.transition,null);
});

test('preparation requires an actual first draw before entry and retains the same resource through reading and suspension',async()=>{
 const f=fixture(),entry=acquirePagePreviewReadiness(f.doc);assert.equal(entry.inspect().ready,false);await flush();
 assert.equal(f.starts,1);assert.equal(f.scene.inspect().phase,'ready');assert.equal((await entry.promise).previews[0].mode,'model');assert.equal(f.timers.size,0);closed(f.scene.inspect().history);
 f.policy.siteReady=true;f.select('context');assert.equal(f.scene.inspect().motion.mode,'hold');assert.equal(f.host.getAttribute('data-project-model-rendering'),'webgl-model');
 f.pointer('pointerdown',{pointerType:'touch'});const vertical=f.pointer('pointermove',{pointerType:'touch',clientX:602,clientY:470});assert.equal(vertical.prevented,0);assert.equal(f.scene.inspect().gesture,null);
 f.pointer('pointerdown');f.pointer('pointermove',{clientX:680});f.settle();assert(f.scene.inspect().camera.value.azimuth<0);assert.equal(f.control.captured.size,1);
 f.pointer('pointerup');assert(f.scene.inspect().camera.value.azimuth<0,'Release closes capture while retaining the composed camera for finite recovery');f.settle();assert.equal(f.scene.inspect().camera.value.azimuth,0);assert.equal(f.control.captured.size,0);
 f.pointer('pointerdown');f.pointer('pointermove',{clientX:680});f.settle();
 f.policy.paused=true;f.step();assert.equal(f.scene.inspect().gesture,null);assert.equal(f.control.captured.size,0);assert.deepEqual(f.scene.inspect().camera.value,{azimuth:0,elevation:0});
 f.policy.paused=false;f.select('results');assert.equal(f.host.getAttribute('data-project-model-active'),null);assert.equal(f.disposed,0);f.select('system');assert.equal(f.starts,1);
 f.policy.hidden=true;f.scene.suspend('page');assert.equal(f.disposed,0);f.policy.hidden=false;f.scene.resume();f.step(100,true);assert.equal(f.scene.inspect().motion.mode,'hold');assert.equal(f.starts,1);
 f.scene.measure(390,844);assert.deepEqual(f.sizes.at(-1),[390,844]);f.scene.dispose();f.scene.dispose();assert.equal(f.disposed,1);assert.equal(f.timers.size,0);closed(f.scene.inspect().motion.history);
 assert([...f.doc.listeners.values(),...f.win.listeners.values()].every(rows=>rows.length===0));
 assert.equal(f.scene.inspect().events.nativeListeners,0);
});

test('visible inspection guidance follows current painted hold and policy without publishing frame values',async()=>{
 const f=fixture({pending:true,externalStage:true});f.root.dataset.projectActiveChapter='context';f.scene.publish({dt:0,stage:{kind:'model',chapter:'context',mode:'waiting',settled:false}});
 assert.equal(f.modelUI.context.state.textContent,'Preparing 3D view.');assert.equal(f.modelUI.context.help.getAttribute('hidden'),'');assert.equal(f.modelUI.context.target.getAttribute('aria-disabled'),'true');
 await flush();f.waiting.resolve(f.handle);await flush();f.policy.siteReady=true;
 const hold={kind:'model',chapter:'context',mode:'hold',settled:true,history:[]};f.scene.publish({dt:0,stage:{...hold,mode:'entry',settled:false}});assert.equal(f.scene.inspect().inspection.available,false);
 f.scene.publish({dt:0,stage:hold});assert.equal(f.scene.inspect().inspection.available,true);assert.equal(f.modelUI.context.state.textContent,'3D view follows scrolling.');assert.equal(f.modelUI.context.help.getAttribute('hidden'),null);assert.equal(f.modelUI.context.reset.getAttribute('hidden'),'');
 const before=f.publisher.inspect().writes;for(let i=0;i<20;i++)assert.equal(f.scene.publish({dt:.016,stage:hold}),false);assert.equal(f.publisher.inspect().writes,before,'An unchanged hold never writes state/help every frame');
 f.root.dataset.projectActiveChapter='system';f.scene.publish({dt:0,stage:hold});assert.equal(f.modelUI.context.state.textContent,'Original source view.');assert.equal(f.modelUI.context.help.getAttribute('hidden'),'');assert.equal(f.modelUI.system.state.textContent,'Preparing 3D view.');assert.equal(f.scene.inspect().inspection.available,false,'A ready resource cannot advertise the wrong displayed source');
 f.scene.publish({dt:0,stage:{...hold,chapter:'system'}});assert.equal(f.scene.inspect().inspection.available,true);assert.equal(f.scene.inspect().paintedChapter,'system');
 f.policy.paused=true;f.scene.publish({dt:0,stage:{...hold,chapter:'system'}});assert.equal(f.modelUI.system.state.textContent,'Motion paused · original view.');assert.equal(f.modelUI.system.help.getAttribute('hidden'),'');assert.equal(f.modelUI.system.reset.getAttribute('hidden'),'');
 f.policy.paused=false;f.scene.suspend('bfcache');assert.equal(f.modelUI.system.state.textContent,'Motion paused · original view.');f.scene.resume();f.scene.publish({dt:0,stage:{...hold,chapter:'system'}});assert.equal(f.modelUI.system.help.getAttribute('hidden'),null);
 f.fail('context-lost');assert.equal(f.modelUI.system.state.textContent,'Original source view.');assert.equal(f.modelUI.system.help.getAttribute('hidden'),'');f.scene.dispose();assert.equal(f.modelUI.system.target.getAttribute('data-project-model-availability'),null);
});

test('inspection keys require the current dedicated target and preserve native link, form and editable keys even under legacy nesting',async()=>{
 const f=fixture();await flush();f.policy.siteReady=true;f.select('context');assert.equal(f.key('ArrowLeft').prevented,1);f.settle();const inspected={...f.scene.inspect().camera.value};assert.equal(inspected.azimuth,.12);
 for(const marker of ['a','button','input','select','textarea','summary','[contenteditable]:not([contenteditable="false"])','[role="textbox"]','[data-protect]','[data-information-window]']){
  const native=new Target();native.marker=marker;native.parentElement=f.control;
  for(const name of ['ArrowLeft','Home','Escape']){assert.equal(f.key(name,native).prevented,0,`${marker} keeps ${name}`);assert.deepEqual(f.scene.inspect().camera.target,inspected);}
 }
 for(const target of [f.modelUI.system.target,new Target()])assert.equal(f.key('ArrowLeft',target).prevented,0,'Another or absent model aperture never owns this source');
 for(const overrides of [{defaultPrevented:true},{isComposing:true},{altKey:true},{ctrlKey:true},{metaKey:true}])assert.equal(f.key('ArrowLeft',f.control,overrides).prevented,0);
 const child=new Target();child.parentElement=f.control;assert.equal(f.key('ArrowRight',child).prevented,1);f.settle();assert.deepEqual(f.scene.inspect().camera.value,{azimuth:0,elevation:0});f.scene.dispose();
});

test('visible reset and Home or Escape return through one owner while focus can reach the reset without losing the inspected pose',async()=>{
 const f=fixture();await flush();f.policy.siteReady=true;f.select('context');const row=f.modelUI.context;
 const click=target=>{const event={target,prevented:0,preventDefault(){this.prevented++;}};f.doc.fire('click',event);return event;};
 for(const action of ['reset','Home','Escape']){
  f.key('ArrowLeft');f.settle();assert.equal(row.state.textContent,'Inspecting 3D view.');assert.equal(row.reset.getAttribute('hidden'),null);
  if(action==='reset'){
   f.root.fire('focusout',{target:f.control,relatedTarget:row.reset});assert.equal(f.scene.inspect().camera.value.azimuth,.12,'Focusing its own Return control does not erase or hide the action before click');
   assert.equal(row.reset.getAttribute('hidden'),null);assert.equal(click(row.reset).prevented,1);
  }else assert.equal(f.key(action).prevented,1);
  f.step();assert.deepEqual(f.scene.inspect().camera.value,{azimuth:0,elevation:0});assert.deepEqual(f.presentations.at(-1),{chapter:'context',azimuth:0,elevation:0});assert.equal(row.state.textContent,'3D view follows scrolling.');assert.equal(row.reset.getAttribute('hidden'),'');
 }
 f.key('ArrowLeft');f.settle();const foreign=new Target();foreign.marker='[data-project-model-reset]';foreign.dataset.projectModelReset='context';assert.equal(click(foreign).prevented,0);assert.equal(click(f.modelUI.system.reset).prevented,0);assert.equal(f.scene.inspect().camera.value.azimuth,.12);
 f.root.fire('focusout',{target:row.reset,relatedTarget:new Target()});f.step();assert.deepEqual(f.scene.inspect().camera.value,{azimuth:0,elevation:0},'Leaving the inspection controls closes inspection');
 f.key('ArrowLeft');f.settle();f.policy.paused=true;f.step();assert.equal(click(row.reset).prevented,0,'A stale hidden reset never bypasses inspection eligibility');
 f.scene.dispose();const writes=f.publisher.inspect().writes;click(row.reset);f.key('ArrowLeft');assert.equal(f.publisher.inspect().writes,writes);assert([...f.doc.listeners.values(),...f.root.listeners.values()].every(rows=>rows.length===0));
});

test('actual-hit drag exposes a finite returning state, yields vertical touch reading and closes on source departure',async()=>{
 const f=fixture();await flush();f.policy.siteReady=true;f.select('context');const row=f.modelUI.context;
 f.handle.hitTest=()=>false;f.pointer('pointerdown');assert.equal(f.scene.inspect().gesture,null);f.handle.hitTest=()=>true;
 f.pointer('pointerdown',{pointerType:'touch'});assert.equal(f.pointer('pointermove',{pointerType:'touch',clientX:602,clientY:407}).prevented,0);assert.equal(f.control.captured.size,0,'Touch movement below eight pixels does not commit');
 assert.equal(f.pointer('pointermove',{pointerType:'touch',clientX:604,clientY:460}).prevented,0);assert.equal(f.scene.inspect().gesture,null);assert.equal(f.scene.inspect().gestures.at(-1).reason,'native-scroll');
 f.pointer('pointerdown',{pointerType:'touch'});assert.equal(f.pointer('pointermove',{pointerType:'touch',clientX:660,clientY:404}).prevented,1);f.settle();assert.equal(row.state.textContent,'Inspecting 3D view.');assert.equal(f.control.captured.size,1);
 f.pointer('pointerup');f.step();assert.equal(row.state.textContent,'Returning to current scroll view.');assert.equal(row.reset.getAttribute('hidden'),null);assert.equal(f.control.captured.size,0);f.settle();assert.equal(row.state.textContent,'3D view follows scrolling.');assert.equal(row.reset.getAttribute('hidden'),'');
 f.pointer('pointerdown');f.pointer('pointermove',{clientX:660});f.step();f.select('results');assert.equal(f.scene.inspect().gesture,null);assert.deepEqual(f.scene.inspect().camera.value,{azimuth:0,elevation:0});assert.equal(row.help.getAttribute('hidden'),'');assert.equal(row.reset.getAttribute('hidden'),'');f.scene.dispose();
});

test('external scene actor paints and inspects while the unified stage alone owns surface motion',async()=>{
 const f=fixture({externalStage:true});await flush();f.policy.siteReady=true;f.root.dataset.projectActiveChapter='context';assert.equal(f.scene.prepare('context'),true);
 const stage={key:'model:context',kind:'model',chapter:'context',mode:'hold',settled:true,pose:{x:0,y:0,opacity:1},history:[]};
 const step=()=>f.scene.publish({dt:.016,stage});step();f.pointer('pointerdown');f.pointer('pointermove',{clientX:680});
 let left=150;while(step()&&left-->0);assert(left>0);assert(f.scene.inspect().camera.value.azimuth<0);
 const inspected=f.scene.inspect().camera.value.azimuth,draws=f.presentations.length;
 assert.equal(f.scene.inspect().paintedChapter,'context','The external stage owns the actual painted source chapter');
 assert.equal(f.scene.prepare('context'),true);assert.equal(f.presentations.length,draws,'A prepared source never redraws a zero-offset camera before restoring the inspected pose');
 step();assert.equal(f.scene.inspect().camera.value.azimuth,inspected,'Readiness inspection never reapplies a zero-offset camera');
 assert.equal(f.host.getAttribute('data-project-model-active'),null);assert.equal(f.surface.style.getPropertyValue('transform'),'');assert.equal(f.surface.style.getPropertyValue('opacity'),'');assert.equal(f.scene.inspect().motion.key,'model:context');
 f.root.dataset.projectActiveChapter='system';f.scene.publish({dt:.016,stage:{...stage,mode:'exit',settled:false}});assert.equal(f.control.captured.size,0);assert.equal(f.presentations.at(-1).chapter,'context','An exiting source retains its own painted chapter');
 assert.equal(f.scene.prepare('system'),true);assert.equal(f.presentations.at(-1).chapter,'system');f.scene.dispose();assert.equal(f.disposed,1);
});

test('missing first paint closes preparation as an explicit static fallback',async()=>{
 const f=fixture({firstDraw:false}),entry=acquirePagePreviewReadiness(f.doc);await flush();assert.equal(f.scene.inspect().phase,'failed');assert.equal((await entry.promise).previews[0].mode,'static');assert.equal(f.disposed,1);assert.equal(f.timers.size,0);closed(f.scene.inspect().history);f.select('context');assert.equal(f.host.getAttribute('data-project-model-rendering'),'poster');f.scene.dispose();
});

test('context loss after a genuine ready terminal releases the source and preserves a separate resource-failure fact',async()=>{
 const f=fixture(),entry=acquirePagePreviewReadiness(f.doc);await flush();assert.equal((await entry.promise).previews[0].mode,'model');f.policy.siteReady=true;f.select('context');f.pointer('pointerdown');f.pointer('pointermove',{clientX:670});
 f.fail('context-lost');f.step();assert.equal(f.disposed,1);assert.equal(f.control.captured.size,0);assert.equal(f.scene.inspect().phase,'failed');assert.equal(f.scene.inspect().arrivalStatic,true);assert.equal(f.host.getAttribute('data-project-model-rendering'),'poster');
 closed(f.scene.inspect().history);assert.deepEqual(f.scene.inspect().resourceFailures.map(value=>value.reason),['context-lost']);assert.equal(entry.inspect().previews[0].mode,'model','Completed preparation is an immutable historical fact, not rewritten after a later resource failure');f.scene.dispose();assert.equal(f.disposed,1);
});

test('initial reduced policy and startup deadline latch static, abort work and reject late upgrades',async()=>{
 const reduced=fixture({reduced:true}),reducedEntry=acquirePagePreviewReadiness(reduced.doc);await flush();assert.equal(reduced.starts,0);assert.equal((await reducedEntry.promise).previews[0].mode,'static');reduced.policy.reduced=false;reduced.step();await flush();assert.equal(reduced.starts,0);reduced.scene.dispose();
 const f=fixture({pending:true}),entry=acquirePagePreviewReadiness(f.doc);await flush();assert.equal(f.starts,1);entry.fallback('startup-timeout');assert.equal(f.signal.aborted,true);assert.equal(f.timers.size,0);assert.equal((await entry.promise).previews[0].mode,'static');f.waiting.resolve(f.handle);await flush();assert.equal(f.disposed,1);assert.equal(f.scene.inspect().arrivalStatic,true);assert.equal(f.scene.inspect().phase,'poster');closed(f.scene.inspect().history);f.scene.dispose();
});

test('a hidden pending arrival and true departure close partial work without late DOM publication',async()=>{
 for(const action of ['hide','dispose']){
  const f=fixture({pending:true});await flush();if(action==='hide'){f.policy.hidden=true;f.scene.suspend('visibility');}else f.scene.dispose();
  assert.equal(f.signal.aborted,true);assert.equal(f.timers.size,0);const writes=[...f.host.attributes];f.waiting.resolve(f.handle);await flush();assert.equal(f.disposed,1);assert.deepEqual([...f.host.attributes],writes);closed(f.scene.inspect().history);f.scene.dispose();
 }
});

test('the actual site driver composes source drawing, information and glass with one outstanding frame and retained BFCache resource',async()=>{
 const doc=new Target(),win=new Target(),root=new Target(),host=new Target(),surface=new Target(),tools=new Target(),counter=new Target(),toggle=new Target(),navigation=new Target(),observers=[],raf=new Map(),timers=new Map(),queries=new Map();let id=0,now=100,maxPending=0,disposed=0,acquisitions=0,chapterReads=0;
 const chapters=keys.map((key,index)=>({dataset:{projectChapter:key},getBoundingClientRect(){chapterReads++;return{top:index*1000-win.scrollY};}})),links=keys.map(key=>{const link=new Target();link.dataset.projectChapterLink=key;return link;});
 root.hasAttribute=key=>root.attributes.has(key);root.querySelectorAll=selector=>selector==='[data-project-chapter]'?chapters:[];
 const set=root.setAttribute.bind(root),remove=root.removeAttribute.bind(root);root.setAttribute=(key,value)=>{set(key,value);if(key==='data-project-active-chapter')root.dataset.projectActiveChapter=String(value);};root.removeAttribute=key=>{remove(key);if(key==='data-project-active-chapter')delete root.dataset.projectActiveChapter;};
 tools.querySelector=selector=>selector==='[data-project-chapter-count]'?counter:selector==='[data-study-motion-toggle]'?toggle:null;navigation.querySelectorAll=()=>links;
 host.querySelector=selector=>selector==='[data-project-model-surface]'?surface:null;doc.querySelector=selector=>({'[data-project-study]':root,'[data-project-reading-tools]':tools,'[data-project-chapter-navigation]':navigation}[selector]??null);doc.querySelectorAll=selector=>selector==='[data-site-preview-required]'?[host]:[];
 doc.documentElement=new Target();doc.documentElement.setAttribute('data-site-entry-state','entered');doc.hidden=false;doc.defaultView=win;doc.fonts={ready:Promise.resolve()};
 Object.assign(win,{innerWidth:1440,innerHeight:1000,scrollY:600,navigator:{userAgent:'test',connection:Object.assign(new Target(),{saveData:false})},CSS:{supports:()=>false},
  matchMedia(query){if(!queries.has(query))queries.set(query,Object.assign(new Target(),{matches:false}));return queries.get(query);},
  requestAnimationFrame(fn){raf.set(++id,fn);maxPending=Math.max(maxPending,raf.size);return id;},cancelAnimationFrame:key=>raf.delete(key),
  setTimeout(fn){timers.set(++id,fn);return id;},clearTimeout:key=>timers.delete(key),
  MutationObserver:class{constructor(fn){this.fn=fn;observers.push(this);}observe(target){this.target=target;}disconnect(){this.closed=true;}}
 });
 const source={view:{chapter:'context'},resize(){},present(value){this.view={...value};},inspect(){return{firstDraw:{completed:true},successfulPaint:true,view:this.view};},hitTest:()=>true,dispose(){disposed++;}};
 const release=registerProjectStudyStage(doc,{root,host,model:{chapters:models,views:{context:{yaw:.56,pitch:.18,fov:36,zoom:1.04},system:{yaw:.84,pitch:.26,fov:36,zoom:1.04}}},acquire:async()=>{acquisitions++;return source;}});
 const field={render(){},inspect:()=>({ready:false,failed:false}),dispose(){}},runtime=createBackgroundRuntime({createRenderer:()=>field}),backdrop=new Target();
 const driver=createSiteBackgroundDriver({window:win,document:doc,runtime,canvas:{},backdrop});
 const frame=(seconds=.016)=>{now+=seconds*1000;const callbacks=[...raf.values()];raf.clear();for(const fn of callbacks)fn(now);};
 await flush();for(let i=0;i<150&&raf.size;i++)frame();assert.equal(raf.size,1,'Visible idle retains exactly one frame even when shared field is not ready');assert.equal(acquisitions,1);assert.equal(driver.inspect().projectStudy.scene.motion.mode,'hold');
 assert.equal(driver.inspect().projectStudy.chapters.chapter,'context');assert.equal(root.dataset.projectActiveChapter,'context');assert.equal(counter.textContent,'02 / 06');assert(chapterReads>=keys.length);
 const readsBefore=chapterReads,intentBefore={...source.view.cameraIntent},handheldBefore={...source.view.handheld};frame();assert.equal(chapterReads,readsBefore);assert.deepEqual(source.view.cameraIntent,intentBefore);assert.notDeepEqual(source.view.handheld,handheldBefore);
 assert.equal(driver.inspect().projectStudy.liquidGlass.ticks,driver.inspect().frames);assert.equal(maxPending,1);assert.equal(timers.size,0);
 root.setAttribute('data-study-paused','');for(const observer of observers)if(observer.target===root)observer.fn([{attributeName:'data-study-paused'}]);frame();const activeSeconds=driver.inspect().playback.activeSeconds;
 win.fire('wheel',{deltaY:100,deltaMode:0});win.fire('scroll');frame(10);assert.equal(driver.inspect().playback.activeSeconds,activeSeconds);assert.equal(maxPending,1);
 doc.hidden=true;doc.fire('visibilitychange');win.fire('pagehide',{persisted:true});assert.equal(raf.size,0);assert.equal(disposed,0);
 doc.hidden=false;doc.fire('visibilitychange');assert.equal(raf.size,0);win.fire('pageshow',{persisted:true});frame(100);assert.equal(acquisitions,1);assert.equal(disposed,0);assert.equal(driver.inspect().playback.activeSeconds,activeSeconds);
 win.fire('pagehide',{persisted:false});assert.equal(driver.inspect().disposed,true);assert.equal(disposed,1);assert.equal(runtime.inspect().activeBindings,0);assert.equal(raf.size,0);assert.equal(timers.size,0);assert(observers.every(observer=>observer.closed));release();assert.equal(disposed,1);
});

function sourceGLB(points=false){
 const positions=new Float32Array([-1,0,0,1,0,0,0,1,0]),geometry=Buffer.from(positions.buffer);
 const json={asset:{version:'2.0'},scene:0,scenes:[{nodes:[0]}],nodes:[{mesh:0}],meshes:[{primitives:[{attributes:{POSITION:0},material:0,mode:points?0:4}]}],materials:[{pbrMetallicRoughness:{baseColorFactor:[.7,.8,.9,1]}}],buffers:[{byteLength:geometry.length}],bufferViews:[{buffer:0,byteOffset:0,byteLength:geometry.length}],accessors:[{bufferView:0,componentType:5126,count:3,type:'VEC3',min:[-1,0,0],max:[1,1,0]}]};
 let text=Buffer.from(JSON.stringify(json));text=Buffer.concat([text,Buffer.alloc((4-text.length%4)%4,32)]);
 const header=Buffer.alloc(12),jHeader=Buffer.alloc(8),bHeader=Buffer.alloc(8);header.writeUInt32LE(0x46546c67);header.writeUInt32LE(2,4);header.writeUInt32LE(12+8+text.length+8+geometry.length,8);jHeader.writeUInt32LE(text.length);jHeader.writeUInt32LE(0x4e4f534a,4);bHeader.writeUInt32LE(geometry.length);bHeader.writeUInt32LE(0x004e4942,4);
 return{bytes:Buffer.concat([header,jHeader,text,bHeader,geometry]),positions:[...positions]};
}
function rendererFixture({omitSource=false}={}){
 const canvas=new Target();canvas.dataset={};canvas.width=1;canvas.height=1;canvas.remove=()=>{canvas.parentNode=null;};
 const report={renders:0,disposals:0,losses:0,positions:[],primitive:null,pointSize:null,attenuation:null};let width=0,height=0,dpr=1;
 const renderer={domElement:canvas,debug:{},info:{render:{calls:0}},capabilities:{maxTextureSize:4096},xr:{isPresenting:false},
  setClearColor(){},getContext:()=>({isContextLost:()=>false}),setSize(){},setPixelRatio(){},setViewport(){},getPixelRatio:()=>dpr,getSize:value=>value.set(width,height),
  setDrawingBufferSize(w,h,ratio){width=w;height=h;dpr=ratio;canvas.width=Math.floor(w*ratio);canvas.height=Math.floor(h*ratio);},
  render(scene,camera){report.renders++;this.info.render.calls=0;scene.traverse(node=>{if(!node.isMesh&&!node.isPoints)return;report.positions=[...node.geometry.getAttribute('position').array];report.primitive=node.isPoints?'points':'triangles';report.pointSize=node.material.size;report.attenuation=node.material.sizeAttenuation;if(!omitSource)node.onBeforeRender(this,scene,camera,node.geometry,node.material,null);this.info.render.calls++;});},
  dispose(){report.disposals++;},forceContextLoss(){report.losses++;},
 };
 const surface={appendChild(node){node.parentNode=this;}},host={ownerDocument:{defaultView:{location:{origin:'https://portfolio.test'},devicePixelRatio:2}},querySelector:()=>surface};
 return{renderer,report,canvas,host};
}
test('real GLTF parsing retains triangle and point POSITION buffers and validates actual source participation before readiness',async t=>{
 const originalFetch=globalThis.fetch;t.after(()=>{globalThis.fetch=originalFetch;});
 for(const points of [false,true]){
  const {bytes,positions}=sourceGLB(points),f=rendererFixture(),controller=new AbortController();
  globalThis.fetch=async()=>({ok:true,arrayBuffer:async()=>bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength)});
  const model={src:points?'/assets/projects/dot-based-3d-printing/model.glb':'/assets/projects/test/source.glb',sha256:createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length,sourceUnits:'millimeters',webUnits:'meters',upAxis:'Y',primitive:points?'points':'triangles',vertices:3,triangles:points?0:1,meshes:1,bounds:{min:[-1,0,0],max:[1,1,0]},chapters:models};
  const scene=await acquireProjectStudyScene({host:f.host,model,signal:controller.signal,createRenderer:()=>f.renderer});
  assert.equal(scene.inspect().firstDraw,null);scene.resize(4096,2160);assert.equal(scene.inspect().firstDraw.completed,true);assert.equal(scene.inspect().drawnMeshes,1);assert.equal(scene.inspect().sourcePoints,points?3:0);assert.deepEqual(f.report.positions,positions,'No geometry is generated, rescaled or rewritten');
  assert.equal(f.report.primitive,model.primitive);if(points){assert.equal(f.report.pointSize,2);assert.equal(f.report.attenuation,false);}
  assert(f.canvas.width*f.canvas.height<=524288);assert.deepEqual(scene.inspect().size,{width:4096,height:2160});
  const draws=f.report.renders;scene.present({chapter:'context',azimuth:0,elevation:0});assert.equal(f.report.renders,draws,'Identical intent is demand-only');scene.present({chapter:'system',azimuth:.1,elevation:0});assert.equal(f.report.renders,draws+1);
  controller.abort();scene.dispose();assert.equal(f.report.disposals,1);assert.equal(f.report.losses,1);assert.equal(f.canvas.parentNode,null);
 }
 const {bytes}=sourceGLB(),f=rendererFixture({omitSource:true}),model={src:'/assets/projects/test/source.glb',sha256:createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length,webUnits:'meters',upAxis:'Y',vertices:3,triangles:1,meshes:1,bounds:{min:[-1,0,0],max:[1,1,0]},chapters:models};
 globalThis.fetch=async()=>({ok:true,arrayBuffer:async()=>bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength)});
 const scene=await acquireProjectStudyScene({host:f.host,model,signal:new AbortController().signal,createRenderer:()=>f.renderer});assert.throws(()=>scene.resize(1440,1000),/complete original project model did not draw/);assert.equal(scene.inspect().firstDraw,null);scene.dispose();
});

test('scroll camera changes without holding, retains eligible idle, freezes pause and preserves same-lease prepare pose',async()=>{
 const f=fixture({externalStage:true,camera:true});await flush();f.policy.siteReady=true;
 const stage=chapter=>({kind:'model',chapter,mode:'hold',settled:true,pose:{x:0,y:0,opacity:1},history:[]});
 const read=(chapter,progress,seconds)=>{f.root.dataset.projectActiveChapter=chapter;f.scene.setReading({chapter,progress},seconds);return f.scene.publish({dt:1/60,stage:stage(chapter)});};
 assert.equal(read('context',0,0),true,'Visible model idle owns demand on the existing driver');
 const start=f.presentations.at(-1).cameraIntent;
 read('context',.6,0);const mid=f.presentations.at(-1).cameraIntent;assert(mid.yawRad>start.yawRad);
 const beforeHandheld=f.presentations.at(-1).handheld;read('context',.6,1);assert.deepEqual(f.presentations.at(-1).cameraIntent,mid,'Idle does not redraw a new physical camera pose');assert.notDeepEqual(f.presentations.at(-1).handheld,beforeHandheld,'Independent handheld is compositor-only');
 f.root.dataset.projectActiveChapter='system';f.scene.setReading({chapter:'system',progress:.3},1);
 assert.equal(f.scene.prepare('system'),true);const prepared=f.presentations.at(-1).cameraIntent;
 f.scene.publish({dt:0,stage:stage('system')});assert.deepEqual(f.presentations.at(-1).cameraIntent,prepared,'Preparation cannot prepaint an endpoint and jump back');
 assert.equal(f.starts,1,'Same source chapter changes retain the original lease');
 f.policy.paused=true;const frozen=f.presentations.at(-1).cameraIntent;
 assert.equal(read('system',.8,100),false);assert.deepEqual(f.presentations.at(-1).cameraIntent,frozen);
 f.policy.paused=false;assert.equal(read('system',.8,1),true);
 f.policy.hidden=true;assert.equal(read('system',.9,100),false);f.policy.hidden=false;
 f.doc.activeElement={closest:()=>true};for(let i=0;i<30;i++)read('system',.9,2);assert.equal(read('system',.9,2),false,'Focused reading does not request idle');f.doc.activeElement=null;
 read('context',0,0);assert.deepEqual(f.presentations.at(-1).cameraIntent,start,'Reverse native reading is deterministic');
 assert.equal(f.scene.publish({dt:0,stage:{kind:'image',chapter:'making',mode:'hold',settled:true,pose:{opacity:1},history:[]}}),false,'Offscreen model does not request idle frames');
 f.scene.dispose();
});

test('authored scroll camera respects initial reduced static policy without acquiring a model or idle frames',async()=>{
 const f=fixture({camera:true,reduced:true,externalStage:true});await flush();f.policy.siteReady=true;f.root.dataset.projectActiveChapter='context';
 f.scene.setReading({chapter:'context',progress:.6},10);
 assert.equal(f.scene.prepare('context'),true);assert.equal(f.scene.publish({dt:1/60,stage:{kind:'model',chapter:'context',mode:'hold',settled:true,pose:{opacity:1},history:[]}}),false);
 assert.equal(f.starts,0);assert.equal(f.scene.inspect().arrivalStatic,true);f.scene.dispose();
});

test('same-lease chapter handoff returns inspection finitely rather than snapping',async()=>{
 const f=fixture({externalStage:true,camera:true});await flush();f.policy.siteReady=true;
 const stage=chapter=>({kind:'model',chapter,mode:'hold',settled:true,pose:{opacity:1},history:[]});
 f.root.dataset.projectActiveChapter='context';f.scene.setReading({chapter:'context',progress:.99},0);f.scene.prepare('context');
 f.scene.publish({dt:0,stage:stage('context')});
 for(let i=0;i<7;i++)f.key('ArrowLeft');
 for(let i=0;i<100;i++)f.scene.publish({dt:1/60,stage:stage('context')});
 const held=f.scene.inspect().camera.value.azimuth;assert(held>.8);
 f.root.dataset.projectActiveChapter='system';f.scene.setReading({chapter:'system',progress:0},0);f.scene.prepare('system');
 assert.equal(f.scene.inspect().camera.value.azimuth,held,'prepare preserves current inspection pose');
 f.scene.publish({dt:0,stage:stage('system')});assert.equal(f.scene.inspect().camera.value.azimuth,held,'publish preserves it too');
 f.scene.publish({dt:1/60,stage:stage('system')});assert(f.scene.inspect().camera.value.azimuth>0);assert(f.scene.inspect().camera.value.azimuth<held);
 for(let i=0;i<120;i++)f.scene.publish({dt:1/60,stage:stage('system')});
 assert.equal(f.scene.inspect().camera.value.azimuth,0);assert.equal(f.starts,1);f.scene.dispose();
});

test('pause resume recovers on the existing clock even with focused controls, then normal scrolling stays direct',async()=>{
 const f=fixture({externalStage:true,camera:true});await flush();f.policy.siteReady=true;f.doc.activeElement={closest:()=>true};
 const stage={kind:'model',chapter:'context',mode:'hold',settled:true,pose:{opacity:1},history:[]};
 f.root.dataset.projectActiveChapter='context';f.scene.setReading({chapter:'context',progress:0},0);f.scene.publish({dt:0,stage});
 const original={...f.presentations.at(-1).cameraIntent};f.policy.paused=true;f.scene.publish({dt:0,stage});
 f.scene.setReading({chapter:'context',progress:.8},0);f.scene.publish({dt:0,stage});assert.deepEqual(f.presentations.at(-1).cameraIntent,original);
 f.policy.paused=false;assert.equal(f.scene.publish({dt:0,resumed:true,stage}),true,'Policy resume requests finite work despite focus disabling idle');
 assert.deepEqual(f.presentations.at(-1).cameraIntent,original);assert.equal(f.scene.inspect().camera.recovering,true);
 f.scene.publish({dt:1/60,stage});assert(f.presentations.at(-1).cameraIntent.yawRad>original.yawRad);
 for(let i=0;i<30;i++)f.scene.publish({dt:1/60,stage});assert.equal(f.scene.inspect().camera.recovering,false);assert.equal(f.scene.publish({dt:0,stage}),false);
 f.scene.setReading({chapter:'context',progress:0},0);assert.equal(f.scene.publish({dt:0,stage}),false);assert.deepEqual(f.presentations.at(-1).cameraIntent,original,'Steady native scroll is not filtered');f.scene.dispose();
});

test('compositor handheld retains pause, returns focus finitely, reserves controls before acquisition, and presents intent before sizing',async()=>{
 const f=fixture({externalStage:true,camera:true});assert.equal(f.host.getAttribute('data-project-model-controls-layout'),'reserved');await flush();assert.deepEqual(f.calls.slice(0,2),['present','resize']);f.policy.siteReady=true;
 const stage={kind:'model',chapter:'context',mode:'hold',settled:true,pose:{opacity:1},history:[]};f.root.dataset.projectActiveChapter='context';f.scene.setReading({chapter:'context',progress:.4},2);f.scene.publish({dt:0,stage});
 const intent=f.presentations.at(-1).cameraIntent,handheld=f.presentations.at(-1).handheld;assert(handheld.xPx>0);
 f.policy.paused=true;f.scene.setReading({chapter:'context',progress:.4},20);assert.equal(f.scene.publish({dt:.1,stage}),false);assert.deepEqual(f.presentations.at(-1).handheld,handheld);
 f.policy.paused=false;f.doc.activeElement={closest:()=>true};f.scene.setReading({chapter:'context',progress:.4},2);
 f.scene.publish({dt:1/60,stage});assert(f.presentations.at(-1).handheld.xPx>0);assert(f.presentations.at(-1).handheld.xPx<handheld.xPx);
 for(let i=0;i<30;i++)f.scene.publish({dt:1/60,stage});assert.equal(f.scene.publish({dt:0,stage}),false);assert.deepEqual(f.presentations.at(-1).handheld,{xPx:0,yPx:0,rollRad:0});assert.deepEqual(f.presentations.at(-1).cameraIntent,intent);
 f.scene.dispose();assert.equal(f.host.getAttribute('data-project-model-controls-layout'),null);
 const reduced=fixture({camera:true,reduced:true});assert.equal(reduced.host.getAttribute('data-project-model-controls-layout'),null);reduced.scene.dispose();
});

test('only usable model controls describe help; reserve survives pause but clears fallback/dispose',async()=>{
 const f=fixture({externalStage:true,camera:true});await flush();assert.equal(f.modelUI.context.target.getAttribute('aria-describedby'),'context-state');f.policy.siteReady=true;f.root.dataset.projectActiveChapter='context';
 const stage={kind:'model',chapter:'context',mode:'hold',settled:true,pose:{opacity:1},history:[]};f.scene.setReading({chapter:'context',progress:0},0);f.scene.publish({dt:0,stage});
 assert.equal(f.modelUI.context.target.getAttribute('aria-describedby'),'context-state context-help');f.policy.paused=true;f.scene.publish({dt:0,stage});assert.equal(f.modelUI.context.target.getAttribute('aria-describedby'),'context-state');assert.equal(f.host.getAttribute('data-project-model-controls-layout'),'reserved');
 f.fail('context-lost');assert.equal(f.host.getAttribute('data-project-model-controls-layout'),null);f.scene.dispose();assert.equal(f.modelUI.context.target.getAttribute('aria-describedby'),'context-state context-help');
});
