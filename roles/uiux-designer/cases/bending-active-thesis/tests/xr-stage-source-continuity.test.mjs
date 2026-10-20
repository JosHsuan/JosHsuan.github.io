import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {acquireXRStage} from '../components/xr-stage-scene.mjs';

const flush=async()=>{for(let i=0;i<12;i++)await Promise.resolve();};
class Canvas extends EventTarget{
 constructor(){super();this.style={};this.dataset={};this.width=1;this.height=1;}
 setAttribute(){} remove(){this.removed=true;}
}
class Video{
 constructor(){this.currentTime=1;this.paused=false;this.readyState=4;this.callbacks=new Map();this.serial=0;this.source=null;}
 requestVideoFrameCallback(fn){const id=++this.serial;this.callbacks.set(id,fn);return id;}
 cancelVideoFrameCallback(id){this.callbacks.delete(id);}
 pause(){this.paused=true;}
 play(){this.paused=false;return Promise.resolve();}
}
function renderer(){
 const canvas=new Canvas(),context={lost:false,isContextLost(){return this.lost;}};let width=1,height=1,dpr=1;
 return{domElement:canvas,debug:{},capabilities:{maxTextureSize:8192},info:{render:{calls:0}},failure:null,shaderLogs:null,skipSource:false,disposed:0,forced:0,
  setClearColor(){},getClearAlpha:()=>0,getContext:()=>context,
  getSize(target){return target.set(width,height);},getPixelRatio:()=>dpr,
  setSize(){},setPixelRatio(){},setViewport(){},setDrawingBufferSize(w,h,p){width=w;height=h;dpr=p;canvas.width=Math.floor(w*p);canvas.height=Math.floor(h*p);},
  render(scene,camera){
   this.info.render.calls=0;
   if(this.shaderLogs){const logs=this.shaderLogs;this.debug.onShaderError({getProgramInfoLog:()=>logs.program,getShaderInfoLog:shader=>logs[shader]},'program','vertex','fragment');}
   if(this.failure)throw this.failure;
   scene.traverseVisible(node=>{if(!node.isMesh||this.skipSource&&node.userData.sourceGeometry!==false)return;node.onBeforeRender(this,scene,camera,node.geometry,node.material,null);this.info.render.calls++;});
  },dispose(){this.disposed++;},forceContextLoss(){this.forced++;context.lost=true;},
 };
}

async function setup(t){
 const study=JSON.parse(await readFile(new URL('../release/xr-study.json',import.meta.url))),bytes=await readFile(new URL('../release/public'+study.model.src,import.meta.url));
 const oldFetch=globalThis.fetch;globalThis.fetch=async()=>({ok:true,arrayBuffer:async()=>bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength)});t.after(()=>{globalThis.fetch=oldFetch;});
 const videos=Object.fromEntries(study.phoneStages.map(stage=>[stage.id,new Video()])),nodes=new Map(study.phoneStages.map(stage=>[stage.id,{dataset:{},hidden:true}])),timers=new Map(),pending=new Map(),acquisitions=[];let serial=0;
 const host={dataset:{},ownerDocument:{defaultView:{devicePixelRatio:1,location:{origin:'https://site.test'},setTimeout(fn){timers.set(++serial,fn);return serial;},clearTimeout(id){timers.delete(id);}}},
  querySelector(selector){const match=selector.match(/data-xr-native-phone="([^"]+)"/);return match?nodes.get(match[1]):null;},appendChild(){}};
 const acquireMedia=({video,signal,src,onFailure})=>new Promise((resolve,reject)=>{
  video.source=src;video.paused=false;let disposed=false,ready=false;
  const dispose=()=>{if(disposed)return;disposed=true;signal.removeEventListener('abort',dispose);video.pause();video.source=null;reject(new DOMException('Released','AbortError'));};
  signal.addEventListener('abort',dispose,{once:true});
  const handle={dispose,inspect:()=>({ready,disposed,hasSource:!!video.source,paused:video.paused})};
  const acquisition={src,handle,fail(){dispose();if(ready)onFailure(new Error('Native source failed'));}};acquisitions.push(acquisition);
  pending.set(src,()=>{ready=true;resolve(handle);});
 });
 const abort=new AbortController(),gpu=renderer(),scene=await acquireXRStage({host,signal:abort.signal,model:study.model,stages:study.phoneStages,videos,createRenderer:()=>gpu,acquireMedia});t.after(()=>scene.dispose());scene.resize(1440,1000);
 return{study,videos,nodes,timers,pending,acquisitions,abort,scene,gpu,source:id=>study.phoneStages.find(stage=>stage.id===id).src,
  selectNativeChapter(id){for(const [key,node]of nodes)node.hidden=key!==id;}};
}
const textureSources=nodes=>[...nodes].filter(([,node])=>node.dataset.videoTextureSource==='true').map(([id])=>id);

test('the real source renderer retains a paused phone during an unresolved next decode and releases it only at atomic replacement or departure',async t=>{
 const {study,videos,nodes,timers,pending,scene,selectNativeChapter}=await setup(t);
 selectNativeChapter('adapt');const first=scene.present({chapter:'adapt'});assert.deepEqual(textureSources(nodes),[],'An unresolved recording has no phone texture owner');
 pending.get(study.phoneStages[0].src)();await first;assert.equal(scene.inspect().mode,'webgl-phone');assert.equal(scene.inspect().successfulPaint,true);assert.deepEqual(textureSources(nodes),['adapt']);
 selectNativeChapter('assemble');
 const next=scene.present({chapter:'assemble'});await flush();
 assert.equal(scene.inspect().media.pending,true);assert.equal(scene.inspect().mode,'webgl-phone');assert.equal(scene.inspect().surface.phoneBodyCalls,1);assert.equal(scene.inspect().surface.phoneScreenCalls,1);
 assert.equal(videos.adapt.paused,true);assert.equal(videos.adapt.source,study.phoneStages[0].src);assert.equal(videos.assemble.paused,false);
 assert.equal(nodes.get('adapt').hidden,true,'React may hide the preceding native wrapper before its texture is replaced');assert.deepEqual(textureSources(nodes),['adapt'],'The real paused source stays in layout while its replacement is unresolved');
 pending.get(study.phoneStages[1].src)();await next;assert.equal(videos.adapt.source,null);assert.equal(videos.adapt.callbacks.size,0);assert.equal(scene.inspect().successfulPaint,true);assert.equal(scene.inspect().surface.phoneCalls,2);
 assert.deepEqual(textureSources(nodes),['assemble'],'Replacement releases the old native layout owner atomically');
 const superseded=scene.present({chapter:'join'});await flush();assert.equal(videos.assemble.paused,true);assert.equal(videos.assemble.source,study.phoneStages[1].src);
 scene.present({chapter:'making'});await superseded;assert.equal(scene.inspect().media.stage,null);assert.equal(timers.size,0);
 for(const video of Object.values(videos)){assert.equal(video.source,null);assert.equal(video.callbacks.size,0);}
 assert.deepEqual(textureSources(nodes),[]);
 scene.dispose();assert.equal(scene.inspect().disposed,true);
});

test('returning to a retained recording transfers its original native owner and keeps later media failures effective',async t=>{
 const {videos,nodes,pending,acquisitions,scene,source,timers,selectNativeChapter}=await setup(t);
 const first=scene.present({chapter:'adapt'});pending.get(source('adapt'))();await first;
 selectNativeChapter('assemble');const delayed=scene.present({chapter:'assemble'});await flush();assert.deepEqual(textureSources(nodes),['adapt']);
 const returned=scene.present({chapter:'adapt'});await flush();pending.get(source('adapt'))();await returned;await delayed;
 assert.equal(videos.adapt.source,source('adapt'));assert.equal(videos.adapt.paused,false);assert.equal(videos.assemble.source,null);
 assert.equal(acquisitions.filter(item=>item.src===source('adapt')).length,1,'Returning to the retained native node must not acquire a second owner');
 assert.equal(nodes.get('adapt').hidden,true,'The media owner must not assume React has committed the reverse chapter yet');assert.deepEqual(textureSources(nodes),['adapt'],'Returning ownership preserves native layout until the phone is actually released');
 assert.equal(scene.inspect().media.pending,false);assert.equal(scene.inspect().media.native.hasSource,true);assert.equal(scene.inspect().successfulPaint,true);assert.equal(scene.inspect().surface.phoneCalls,2);assert.equal(timers.size,0);
 acquisitions.find(item=>item.src===source('adapt')).fail();
 assert.equal(scene.inspect().mode,'poster');assert.equal(scene.inspect().media.reason,'recording-unavailable');assert.equal(scene.inspect().successfulPaint,false);
 for(const video of Object.values(videos)){assert.equal(video.source,null);assert.equal(video.callbacks.size,0);}
 assert.deepEqual(textureSources(nodes),[]);
});

test('paused return, repeated pending supersession and full abort close every owned native source and callback',async t=>{
 const {videos,nodes,pending,acquisitions,scene,source,timers,abort}=await setup(t);
 const first=scene.present({chapter:'adapt'});pending.get(source('adapt'))();await first;scene.setPaused(true);
 const superseded=scene.present({chapter:'assemble'});await flush();const delayed=scene.present({chapter:'join'});await flush();await superseded;
 assert.deepEqual(textureSources(nodes),['adapt'],'Repeated pending requests do not promote undecoded native nodes');
 const returned=scene.present({chapter:'adapt'});await flush();pending.get(source('adapt'))();await returned;await delayed;
 assert.equal(videos.adapt.source,source('adapt'));assert.equal(videos.adapt.paused,true);assert.equal(acquisitions.filter(item=>item.src===source('adapt')).length,1);
 assert.equal(Object.values(videos).filter(video=>video.source&&!video.paused).length,0);assert.equal(timers.size,0);
 assert.deepEqual(textureSources(nodes),['adapt']);
 scene.setPaused(false);await flush();assert.equal(Object.values(videos).filter(video=>video.source&&!video.paused).length,1);
 const pendingAgain=scene.present({chapter:'join'});await flush();abort.abort();await pendingAgain;
 assert.equal(scene.inspect().disposed,true);assert.equal(timers.size,0);assert.equal(acquisitions.every(item=>item.handle.inspect().disposed),true);
 for(const video of Object.values(videos)){assert.equal(video.source,null);assert.equal(video.callbacks.size,0);}
 assert.deepEqual(textureSources(nodes),[]);
});

test('failure of a retained native source releases its surface while a different pending recording can still replace it',async t=>{
 const {videos,nodes,pending,acquisitions,scene,source,timers}=await setup(t);
 const first=scene.present({chapter:'adapt'});pending.get(source('adapt'))();await first;
 const delayed=scene.present({chapter:'assemble'});await flush();acquisitions.find(item=>item.src===source('adapt')).fail();
 assert.equal(scene.inspect().mode,'poster');assert.equal(scene.inspect().successfulPaint,false);assert.equal(scene.inspect().media.pending,true);assert.equal(videos.adapt.callbacks.size,0);
 assert.deepEqual(textureSources(nodes),[],'A failed retained source cannot keep a hidden native wrapper in layout');
 pending.get(source('assemble'))();await delayed;assert.equal(scene.inspect().mode,'webgl-phone');assert.equal(scene.inspect().successfulPaint,true);assert.equal(videos.assemble.source,source('assemble'));
 assert.deepEqual(textureSources(nodes),['assemble']);
 scene.present({chapter:'making'});assert.equal(timers.size,0);assert.equal(acquisitions.every(item=>item.handle.inspect().disposed),true);
 for(const video of Object.values(videos)){assert.equal(video.source,null);assert.equal(video.callbacks.size,0);}
 assert.deepEqual(textureSources(nodes),[]);
});

test('a pending media deadline releases the retained texture source and cannot restore its layout after a late decode',async t=>{
 const {videos,nodes,pending,acquisitions,scene,source,timers}=await setup(t);
 const first=scene.present({chapter:'adapt'});pending.get(source('adapt'))();await first;assert.deepEqual(textureSources(nodes),['adapt']);
 const delayed=scene.present({chapter:'assemble'});await flush();assert.equal(timers.size,1);assert.deepEqual(textureSources(nodes),['adapt']);
 [...timers.values()][0]();await delayed;await flush();
 assert.equal(scene.inspect().mode,'poster');assert.equal(scene.inspect().media.reason,'recording-timeout');assert.deepEqual(textureSources(nodes),[]);assert.equal(timers.size,0);
 pending.get(source('assemble'))();await flush();assert.deepEqual(textureSources(nodes),[],'A superseded native completion cannot resurrect a texture owner');
 assert.equal(acquisitions.every(item=>item.handle.inspect().disposed),true);
 for(const video of Object.values(videos)){assert.equal(video.source,null);assert.equal(video.callbacks.size,0);}
});

test('context loss during pending replacement clears texture layout ownership and preserves only the real native fallback',async t=>{
 const {videos,nodes,pending,scene,source,gpu,timers}=await setup(t);
 const first=scene.present({chapter:'adapt'});pending.get(source('adapt'))();await first;
 const delayed=scene.present({chapter:'assemble'});await flush();assert.deepEqual(textureSources(nodes),['adapt']);
 gpu.getContext().lost=true;gpu.domElement.dispatchEvent(new Event('webglcontextlost',{cancelable:true}));
 assert.equal(scene.inspect().fallbackReason,'context-lost');assert.equal(scene.inspect().successfulPaint,false);assert.deepEqual(textureSources(nodes),[]);assert.equal(videos.adapt.source,null);
 pending.get(source('assemble'))();await delayed;
 assert.equal(scene.inspect().mode,'native-video');assert.equal(videos.assemble.source,source('assemble'));assert.deepEqual(textureSources(nodes),[],'Native fallback has no VideoTexture and must not retain another hidden phone');
 assert.equal(Object.values(videos).filter(video=>video.source).length,1);assert.equal(timers.size,0);
 scene.present({chapter:'making'});assert.deepEqual(textureSources(nodes),[]);
 for(const video of Object.values(videos)){assert.equal(video.source,null);assert.equal(video.callbacks.size,0);}
});

test('a real renderer exception retains bounded pre-disposal failure facts without changing fallback or cleanup',async t=>{
 const {scene,gpu,videos,nodes,timers}=await setup(t);scene.present({chapter:'method'});assert.equal(scene.inspect().mode,'webgl-model');
 const error=new Error('Unique XR return diagnostic failure');error.name='XRDiagnosticFixtureError';gpu.failure=error;
 gpu.shaderLogs={program:'program-'.repeat(400),vertex:'vertex-'.repeat(400),fragment:'fragment-'.repeat(400)};
 scene.present({chapter:'method',azimuth:.12});const failed=scene.inspect(),diagnostic=failed.lastRenderFailure;
 assert.equal(failed.mode,'poster');assert.equal(failed.fallbackReason,'render-unavailable');assert.equal(failed.surface,null);assert.equal(failed.successfulPaint,false);
 assert.equal(diagnostic.operation,'render');assert.equal(diagnostic.name,'XRDiagnosticFixtureError');assert.equal(diagnostic.message,'Unique XR return diagnostic failure');
 assert.equal(diagnostic.state.chapter,'method');assert.equal(diagnostic.state.azimuth,.12);assert.deepEqual(diagnostic.viewport,{width:1440,height:1000});assert.equal(diagnostic.renderView.width,1440);
 assert(diagnostic.pose.position.every(Number.isFinite));assert(diagnostic.budget.budget.pixels<=524288);assert.equal(diagnostic.budget.disposed,false,'Capture the allocation facts before disposing the GPU');
 assert.deepEqual(diagnostic.drawCounts,{source:0,phoneBody:0,phoneScreen:0,stage:0});assert.equal(diagnostic.rendererCalls,0);assert.equal(diagnostic.contextLost,false);assert.equal(diagnostic.shaderError,true);assert.equal(diagnostic.environment.owner,'exhibition-stage');
 for(const key of ['program','vertex','fragment'])assert.equal(diagnostic.shaderLogs[key],gpu.shaderLogs[key].slice(0,2048));
 assert.equal(gpu.disposed,1);assert.equal(gpu.forced,1);assert.equal(gpu.domElement.removed,true);assert.deepEqual(textureSources(nodes),[]);assert.equal(timers.size,0);
 for(const video of Object.values(videos)){assert.equal(video.source,null);assert.equal(video.callbacks.size,0);}
 scene.dispose();scene.dispose();assert.equal(gpu.disposed,1);assert.equal(gpu.forced,1);
});

test('missing real source participation still fails closed and records its exact cause before disposal',async t=>{
 const {scene,gpu,nodes}=await setup(t);scene.present({chapter:'method'});assert.equal(scene.inspect().surface.sourceCalls,1);
 gpu.skipSource=true;scene.present({chapter:'method',azimuth:.12});const failed=scene.inspect(),diagnostic=failed.lastRenderFailure;
 assert.equal(failed.mode,'poster');assert.equal(failed.fallbackReason,'render-unavailable');assert.equal(failed.successfulPaint,false);
 assert.equal(diagnostic.operation,'participation');assert.equal(diagnostic.name,'Error');assert.equal(diagnostic.message,'XR source or recorded screen did not paint');
 assert.equal(diagnostic.drawCounts.source,0);assert.equal(diagnostic.drawCounts.stage,3);assert.equal(diagnostic.rendererCalls,3);assert.equal(diagnostic.shaderError,false);assert.equal(diagnostic.shaderLogs,null);assert.equal(diagnostic.contextLost,false);
 assert.equal(gpu.disposed,1);assert.deepEqual(textureSources(nodes),[]);
});
