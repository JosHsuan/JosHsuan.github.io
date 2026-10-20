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
 const canvas=new Canvas();let width=1,height=1,dpr=1;
 return{domElement:canvas,debug:{},capabilities:{maxTextureSize:8192},info:{render:{calls:0}},
  setClearColor(){},getClearAlpha:()=>0,getContext:()=>({isContextLost:()=>false}),
  getSize(target){return target.set(width,height);},getPixelRatio:()=>dpr,
  setSize(){},setPixelRatio(){},setViewport(){},setDrawingBufferSize(w,h,p){width=w;height=h;dpr=p;canvas.width=Math.floor(w*p);canvas.height=Math.floor(h*p);},
  render(scene,camera){this.info.render.calls=0;scene.traverseVisible(node=>{if(!node.isMesh)return;node.onBeforeRender(this,scene,camera,node.geometry,node.material,null);this.info.render.calls++;});},dispose(){},forceContextLoss(){},
 };
}

async function setup(t){
 const study=JSON.parse(await readFile(new URL('../release/xr-study.json',import.meta.url))),bytes=await readFile(new URL('../release/public'+study.model.src,import.meta.url));
 const oldFetch=globalThis.fetch;globalThis.fetch=async()=>({ok:true,arrayBuffer:async()=>bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength)});t.after(()=>{globalThis.fetch=oldFetch;});
 const videos=Object.fromEntries(study.phoneStages.map(stage=>[stage.id,new Video()])),nodes=new Map(study.phoneStages.map(stage=>[stage.id,{dataset:{}}])),timers=new Map(),pending=new Map(),acquisitions=[];let serial=0;
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
 const abort=new AbortController(),scene=await acquireXRStage({host,signal:abort.signal,model:study.model,stages:study.phoneStages,videos,createRenderer:renderer,acquireMedia});t.after(()=>scene.dispose());scene.resize(1440,1000);
 return{study,videos,timers,pending,acquisitions,abort,scene,source:id=>study.phoneStages.find(stage=>stage.id===id).src};
}

test('the real source renderer retains a paused phone during an unresolved next decode and releases it only at atomic replacement or departure',async t=>{
 const {study,videos,timers,pending,scene}=await setup(t);
 const first=scene.present({chapter:'adapt'});pending.get(study.phoneStages[0].src)();await first;assert.equal(scene.inspect().mode,'webgl-phone');assert.equal(scene.inspect().successfulPaint,true);
 const next=scene.present({chapter:'assemble'});await flush();
 assert.equal(scene.inspect().media.pending,true);assert.equal(scene.inspect().mode,'webgl-phone');assert.equal(scene.inspect().surface.phoneBodyCalls,1);assert.equal(scene.inspect().surface.phoneScreenCalls,1);
 assert.equal(videos.adapt.paused,true);assert.equal(videos.adapt.source,study.phoneStages[0].src);assert.equal(videos.assemble.paused,false);
 pending.get(study.phoneStages[1].src)();await next;assert.equal(videos.adapt.source,null);assert.equal(videos.adapt.callbacks.size,0);assert.equal(scene.inspect().successfulPaint,true);assert.equal(scene.inspect().surface.phoneCalls,2);
 const superseded=scene.present({chapter:'join'});await flush();assert.equal(videos.assemble.paused,true);assert.equal(videos.assemble.source,study.phoneStages[1].src);
 scene.present({chapter:'making'});await superseded;assert.equal(scene.inspect().media.stage,null);assert.equal(timers.size,0);
 for(const video of Object.values(videos)){assert.equal(video.source,null);assert.equal(video.callbacks.size,0);}
 scene.dispose();assert.equal(scene.inspect().disposed,true);
});

test('returning to a retained recording transfers its original native owner and keeps later media failures effective',async t=>{
 const {videos,pending,acquisitions,scene,source,timers}=await setup(t);
 const first=scene.present({chapter:'adapt'});pending.get(source('adapt'))();await first;
 const delayed=scene.present({chapter:'assemble'});await flush();
 const returned=scene.present({chapter:'adapt'});await flush();pending.get(source('adapt'))();await returned;await delayed;
 assert.equal(videos.adapt.source,source('adapt'));assert.equal(videos.adapt.paused,false);assert.equal(videos.assemble.source,null);
 assert.equal(acquisitions.filter(item=>item.src===source('adapt')).length,1,'Returning to the retained native node must not acquire a second owner');
 assert.equal(scene.inspect().media.pending,false);assert.equal(scene.inspect().media.native.hasSource,true);assert.equal(scene.inspect().successfulPaint,true);assert.equal(scene.inspect().surface.phoneCalls,2);assert.equal(timers.size,0);
 acquisitions.find(item=>item.src===source('adapt')).fail();
 assert.equal(scene.inspect().mode,'poster');assert.equal(scene.inspect().media.reason,'recording-unavailable');assert.equal(scene.inspect().successfulPaint,false);
 for(const video of Object.values(videos)){assert.equal(video.source,null);assert.equal(video.callbacks.size,0);}
});

test('paused return, repeated pending supersession and full abort close every owned native source and callback',async t=>{
 const {videos,pending,acquisitions,scene,source,timers,abort}=await setup(t);
 const first=scene.present({chapter:'adapt'});pending.get(source('adapt'))();await first;scene.setPaused(true);
 const superseded=scene.present({chapter:'assemble'});await flush();const delayed=scene.present({chapter:'join'});await flush();await superseded;
 const returned=scene.present({chapter:'adapt'});await flush();pending.get(source('adapt'))();await returned;await delayed;
 assert.equal(videos.adapt.source,source('adapt'));assert.equal(videos.adapt.paused,true);assert.equal(acquisitions.filter(item=>item.src===source('adapt')).length,1);
 assert.equal(Object.values(videos).filter(video=>video.source&&!video.paused).length,0);assert.equal(timers.size,0);
 scene.setPaused(false);await flush();assert.equal(Object.values(videos).filter(video=>video.source&&!video.paused).length,1);
 const pendingAgain=scene.present({chapter:'join'});await flush();abort.abort();await pendingAgain;
 assert.equal(scene.inspect().disposed,true);assert.equal(timers.size,0);assert.equal(acquisitions.every(item=>item.handle.inspect().disposed),true);
 for(const video of Object.values(videos)){assert.equal(video.source,null);assert.equal(video.callbacks.size,0);}
});

test('failure of a retained native source releases its surface while a different pending recording can still replace it',async t=>{
 const {videos,pending,acquisitions,scene,source,timers}=await setup(t);
 const first=scene.present({chapter:'adapt'});pending.get(source('adapt'))();await first;
 const delayed=scene.present({chapter:'assemble'});await flush();acquisitions.find(item=>item.src===source('adapt')).fail();
 assert.equal(scene.inspect().mode,'poster');assert.equal(scene.inspect().successfulPaint,false);assert.equal(scene.inspect().media.pending,true);assert.equal(videos.adapt.callbacks.size,0);
 pending.get(source('assemble'))();await delayed;assert.equal(scene.inspect().mode,'webgl-phone');assert.equal(scene.inspect().successfulPaint,true);assert.equal(videos.assemble.source,source('assemble'));
 scene.present({chapter:'making'});assert.equal(timers.size,0);assert.equal(acquisitions.every(item=>item.handle.inspect().disposed),true);
 for(const video of Object.values(videos)){assert.equal(video.source,null);assert.equal(video.callbacks.size,0);}
});
