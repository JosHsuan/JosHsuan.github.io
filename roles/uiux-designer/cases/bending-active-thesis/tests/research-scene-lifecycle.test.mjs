import test from 'node:test';
import assert from 'node:assert/strict';
import {acquireXRPhoneStudy} from '../components/research-scene.mjs';

class Video extends EventTarget{
 currentTime=0;duration=13;paused=true;source=null;pauses=0;plays=0;loads=0;callbacks=new Map();sequence=0;listeners=new Set();
 addEventListener(type,fn,...rest){this.listeners.add(fn);super.addEventListener(type,fn,...rest);}
 removeEventListener(type,fn,...rest){this.listeners.delete(fn);super.removeEventListener(type,fn,...rest);}
 set src(value){this.source=value;}
 hasAttribute(name){return name==='src'&&this.source!==null;}
 removeAttribute(name){if(name==='src')this.source=null;}
 play(){this.plays++;this.paused=false;return Promise.resolve();}
 pause(){this.pauses++;this.paused=true;}
 load(){this.loads++;if(this.source===null)this.currentTime=0;}
 requestVideoFrameCallback(fn){const id=++this.sequence;this.callbacks.set(id,fn);return id;}
 cancelVideoFrameCallback(id){this.callbacks.delete(id);}
 frame(time){this.currentTime=time;const callbacks=[...this.callbacks.values()];this.callbacks.clear();for(const fn of callbacks)fn(1000,{mediaTime:time});}
}

function rendererFixture(){
 const canvas=new EventTarget();canvas.width=300;canvas.height=150;canvas.style={};canvas.setAttribute=()=>{};canvas.parentNode=null;canvas.remove=()=>{canvas.parentNode=null;};
 const context={lost:false,isContextLost(){return this.lost;}};
 const disposals=new Map(),observed=new Set();
 let width=300,height=150,ratio=1;
 const observe=value=>{if(!value||observed.has(value))return;observed.add(value);disposals.set(value,0);value.addEventListener('dispose',()=>disposals.set(value,disposals.get(value)+1));};
 const renderer={domElement:canvas,debug:{},capabilities:{maxTextureSize:4096},info:{render:{calls:0}},disposed:0,forced:0,behavior:'normal',
  setClearColor(){},setSize(){},setPixelRatio(){},setViewport(){},getContext:()=>context,getSize:target=>target.set(width,height),getPixelRatio:()=>ratio,
  setDrawingBufferSize(w,h,dpr){width=w;height=h;ratio=dpr;canvas.width=Math.floor(w*dpr);canvas.height=Math.floor(h*dpr);},
  render(scene){
   scene.traverse(node=>{if(!node.isMesh)return;observe(node.geometry);observe(node.material);observe(node.material.map);});
   if(this.behavior==='loss-return'){context.lost=true;this.info.render.calls=0;return;}
   if(this.behavior==='loss-throw'){context.lost=true;throw Error('GPU operation failed before native loss event');}
   if(this.behavior==='error')throw Error('Non-context render failure');
   this.info.render.calls=2;
  },
  dispose(){this.disposed++;},forceContextLoss(){this.forced++;context.lost=true;},
 };
 return{renderer,canvas,context,disposals};
}

async function phoneFixture(){
 const f=rendererFixture(),video=new Video(),abort=new AbortController(),positions=[],errors=[],modes=[];
 const host={ownerDocument:{defaultView:{devicePixelRatio:1,location:{origin:'https://example.test'}}},appendChild(node){node.parentNode=this;}};
 const pending=acquireXRPhoneStudy({host,video,signal:abort.signal,stage:{id:'adapt',src:'/assets/xr/adapt-interface.mp4',width:666,height:1440},createRenderer:()=>f.renderer,onPosition:value=>positions.push(value),onFailure:error=>errors.push(error),onMode:(mode,reason)=>modes.push({mode,reason})});
 video.dispatchEvent(new Event('loadedmetadata'));video.dispatchEvent(new Event('loadeddata'));
 const resource=await pending;resource.resize(390,600);
 assert.equal(resource.inspect().mode,'webgl-phone');assert.equal(video.paused,false);assert.equal(video.callbacks.size,2,'One adapter draw callback and Three VideoTexture callback');
 return{...f,video,abort,positions,errors,modes,resource};
}
function assertNativeFallback(f,reason){
 assert.equal(f.resource.inspect().mode,'native-video');assert.equal(f.resource.inspect().fallbackReason,reason);
 assert.deepEqual(f.resource.inspect().fallbacks,[{reason}]);assert.equal(f.resource.inspect().surface,null);
 assert.equal(f.canvas.parentNode,null);assert.equal(f.renderer.disposed,1);assert.equal(f.renderer.forced,1);
 assert.equal(f.video.callbacks.size,0,'Both decoded-frame callbacks are cancelled');
 assert.equal(f.video.paused,false);assert.equal(f.video.plays,1);assert.equal(f.video.pauses,0);assert.equal(f.video.source,'https://example.test/assets/xr/adapt-interface.mp4');
 assert.deepEqual(f.errors,[],'GPU fallback cannot terminate the native decoder');
 assert.equal(f.disposals.size,5,'Two geometries, two materials and one video texture');for(const count of f.disposals.values())assert.equal(count,1);
}
function finish(f){
 f.video.currentTime=4.2;f.abort.abort();f.resource.dispose();
 assert.equal(f.resource.inspect().disposed,true);assert.equal(f.video.pauses,1);assert.equal(f.video.source,null);assert.equal(f.video.listeners.size,0);assert.equal(f.video.callbacks.size,0);assert.deepEqual(f.positions,[4.2]);
 assert.equal(f.renderer.disposed,1);assert.equal(f.renderer.forced,1);for(const count of f.disposals.values())assert.equal(count,1);
}

test('phone draw observes genuine loss before the native event and preserves one native-video fallback through frame, resize and face paths',async()=>{
 for(const trigger of ['decoded-frame','resize','face-screen']){
  const f=await phoneFixture();
  if(trigger==='decoded-frame'){f.context.lost=true;f.video.frame(.4);}
  if(trigger==='resize'){f.renderer.behavior='loss-return';f.resource.resize(400,600);}
  if(trigger==='face-screen'){f.renderer.behavior='loss-throw';f.resource.faceScreen(true);}
  assertNativeFallback(f,'context-lost');
  const event=new Event('webglcontextlost',{cancelable:true});f.canvas.dispatchEvent(event);
  assert.equal(f.resource.inspect().fallbacks.length,1,'A delayed native event cannot add a second fallback after teardown');
  f.video.frame(.8);assert.equal(f.video.currentTime,.8);assert.equal(f.video.paused,false);finish(f);
 }
});

test('native context-loss event first cancels pending video-texture and scene callbacks without stopping native playback',async()=>{
 const f=await phoneFixture(),stale=[...f.video.callbacks.values()];f.context.lost=true;
 const event=new Event('webglcontextlost',{cancelable:true});f.canvas.dispatchEvent(event);assert.equal(event.defaultPrevented,true);assertNativeFallback(f,'context-lost');
 // A callback already delivered into the browser task queue is inert after loss.
 stale.at(-1)(1000,{mediaTime:.8});assert.equal(f.resource.inspect().fallbacks.length,1);assert.equal(f.video.callbacks.size,0);finish(f);
});

test('an unrelated draw failure remains render-unavailable and still releases GPU resources while preserving native video',async()=>{
 const f=await phoneFixture();assert.equal(f.context.lost,false);f.renderer.behavior='error';f.video.frame(.4);
 assertNativeFallback(f,'render-unavailable');finish(f);
});
