import test from 'node:test';
import assert from 'node:assert/strict';
import {acquireVideo} from '../runtime/site/video-resource.mjs';
import {createPreviewLifecycle} from '../runtime/site/PreviewLifecycle.mjs';

const deferred=()=>{let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return{promise,resolve,reject};};
const flush=async()=>{for(let i=0;i<8;i++)await Promise.resolve();};
class Video extends EventTarget{
 currentTime=0;duration=8;paused=true;currentSource=null;loads=0;pauses=0;plays=0;listeners=new Set();playback=deferred();
 addEventListener(type,callback,...rest){this.listeners.add(callback);super.addEventListener(type,callback,...rest);}
 removeEventListener(type,callback,...rest){this.listeners.delete(callback);super.removeEventListener(type,callback,...rest);}
 set src(value){this.currentSource=value;}
 hasAttribute(name){return name==='src'&&this.currentSource!==null;}
 removeAttribute(name){if(name==='src')this.currentSource=null;}
 play(){this.plays++;this.paused=false;return this.playback.promise;}
 pause(){this.pauses++;this.paused=true;}
 load(){this.loads++;if(!this.currentSource)this.currentTime=0;}
}
function fixture(){
 const video=new Video(),abort=new AbortController(),positions=[],errors=[];
 const options={video,signal:abort.signal,src:'/assets/xr/background-preview.mp4',origin:'https://example.test',onPosition:value=>positions.push(value),onFailure:error=>errors.push(error)};
 return{video,abort,positions,errors,options};
}
function loaded(f){f.video.dispatchEvent(new Event('loadedmetadata'));f.video.dispatchEvent(new Event('loadeddata'));}

test('native playback becomes ready only after data and play resolve, then abort releases decoding and preserves the position',async()=>{
 const f=fixture(),pending=acquireVideo({...f.options,position:2.5});
 assert.equal(f.video.currentSource,'https://example.test/assets/xr/background-preview.mp4');
 assert.equal(f.video.preload,'auto');assert.equal(f.video.muted,true);assert.equal(f.video.loop,true);assert.equal(f.video.playsInline,true);
 loaded(f);assert.equal(f.video.currentTime,2.5);assert.equal(f.video.plays,1);
 let settled=false;pending.then(()=>{settled=true;});await flush();assert.equal(settled,false);
 f.video.playback.resolve();const resource=await pending;assert.equal(resource.inspect().ready,true);
 f.video.currentTime=4.2;f.abort.abort();resource.dispose();
 assert.equal(f.video.currentSource,null);assert.equal(f.video.preload,'none');assert.equal(f.video.pauses,1);assert.equal(f.video.loads,2);
 assert.deepEqual(f.positions,[4.2]);assert.equal(f.video.listeners.size,0);assert.equal(resource.inspect().disposed,true);
});

test('abort rejects pending load immediately, and stale native events do not initiate playback',async()=>{
 const f=fixture(),pending=acquireVideo(f.options),rejected=assert.rejects(pending,{name:'AbortError'});
 f.abort.abort();await rejected;loaded(f);assert.equal(f.video.plays,0);assert.equal(f.video.currentSource,null);assert.equal(f.video.listeners.size,0);
});

test('late play fulfillment or rejection cannot revive a released generation or escape as an unhandled rejection',async()=>{
 for(const result of ['resolve','reject']){
  const f=fixture(),pending=acquireVideo(f.options),rejected=assert.rejects(pending,{name:'AbortError'});
  loaded(f);f.abort.abort();await rejected;
  f.video.playback[result](result==='reject'?Error('stale AbortError'):undefined);await flush();
  assert.equal(f.video.currentSource,null);assert.equal(f.video.paused,true);assert.equal(f.errors.length,0);assert.equal(f.video.listeners.size,0);
 }
});

test('load failure and autoplay rejection clean up without claiming readiness',async()=>{
 for(const result of ['load','play']){
  const f=fixture(),pending=acquireVideo(f.options),rejected=assert.rejects(pending,/could not be loaded or played/);
  if(result==='load')f.video.dispatchEvent(new Event('error'));
  else{loaded(f);f.video.playback.reject(Error('NotAllowedError'));}
  await rejected;assert.equal(f.video.currentSource,null);assert.equal(f.video.listeners.size,0);assert.equal(f.errors.length,0);
 }
});

test('an error during established playback releases the decoder and reports one discrete fallback',async()=>{
 const f=fixture(),pending=acquireVideo(f.options);loaded(f);f.video.playback.resolve();const resource=await pending;
 f.video.dispatchEvent(new Event('error'));f.video.dispatchEvent(new Event('error'));resource.dispose();
 assert.equal(f.errors.length,1);assert.equal(f.video.currentSource,null);assert.equal(f.video.pauses,1);assert.equal(f.video.listeners.size,0);
});

test('a completed loop resumes within the native duration, and forbidden sources never start a native request',async()=>{
 const f=fixture(),pending=acquireVideo({...f.options,position:8});loaded(f);assert.equal(f.video.currentTime,7.95);
 f.video.playback.resolve();const resource=await pending;resource.dispose();
 for(const mode of ['aborted','foreign','data']){
  const next=fixture();if(mode==='aborted')next.abort.abort();
  const src=mode==='foreign'?'https://other.test/movie.mp4':mode==='data'?'data:video/mp4;base64,AAA':next.options.src;
  await assert.rejects(acquireVideo({...next.options,src}));assert.equal(next.video.currentSource,null);assert.equal(next.video.loads,0);assert.equal(next.video.listeners.size,0);
 }
});

test('the shared acquisition deadline releases native video and keeps exactly one failed terminal despite late playback',async()=>{
 const f=fixture();let deadline=null;
 const controller=createPreviewLifecycle({start:({signal})=>acquireVideo({...f.options,signal}),setTimeout:callback=>{deadline=callback;return 1;},clearTimeout:()=>{deadline=null;}});
 controller.setActive(true);await flush();loaded(f);assert.equal(f.video.plays,1);
 deadline();await flush();assert.equal(f.video.currentSource,null);assert.equal(controller.inspect().phase,'failed');
 f.video.playback.resolve();await flush();
 assert.deepEqual(controller.inspect().history.map(fact=>fact.phase),['requested','failed']);
 assert.equal(controller.inspect().reason,'load-timeout');controller.dispose();assert.equal(deadline,null);
});

test('offscreen disposal and a later eligibility epoch resume the saved position without a second terminal for the completed request',async()=>{
 const f=fixture();let saved=0;
 const controller=createPreviewLifecycle({start:({signal})=>acquireVideo({...f.options,signal,position:saved,onPosition:value=>{saved=value;}})});
 controller.setActive(true);await flush();loaded(f);f.video.playback.resolve();await flush();
 assert.equal(controller.inspect().phase,'ready');f.video.currentTime=3.4;controller.setActive(false,'offscreen');
 assert.equal(saved,3.4);assert.equal(f.video.currentSource,null);
 assert.deepEqual(controller.inspect().history.map(fact=>fact.phase),['requested','ready']);
 f.video.playback=deferred();controller.setActive(true);await flush();loaded(f);assert.equal(f.video.currentTime,3.4);
 f.video.playback.resolve();await flush();assert.deepEqual(controller.inspect().history.map(fact=>fact.phase),['requested','ready','requested','ready']);
 controller.dispose();assert.equal(f.video.currentSource,null);assert.equal(f.video.listeners.size,0);
});

test('post-ready decoder failure updates the shared visual truth without emitting a second acquisition terminal',async()=>{
 const f=fixture();const controller=createPreviewLifecycle({start:({signal})=>acquireVideo({...f.options,signal,onFailure:()=>controller.fail('playback-unavailable')})});
 controller.setActive(true);await flush();loaded(f);f.video.playback.resolve();await flush();
 assert.equal(controller.inspect().phase,'ready');f.video.dispatchEvent(new Event('error'));
 assert.equal(controller.inspect().phase,'failed');assert.equal(controller.inspect().reason,'playback-unavailable');
 assert.deepEqual(controller.inspect().history.map(fact=>fact.phase),['requested','ready']);assert.equal(f.video.currentSource,null);controller.dispose();
});
