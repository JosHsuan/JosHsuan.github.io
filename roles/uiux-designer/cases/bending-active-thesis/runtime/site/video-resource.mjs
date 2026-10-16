/** Native silent-video lifetime; the shared controller owns the deadline and
 * request history. No fetch, playback clock or frame callback is introduced. */
export function acquireVideo({video,src,signal,position=0,onPosition=()=>{},onFailure=()=>{},
 origin=globalThis.location?.origin}={}){
 if(!video||!signal||typeof src!=='string')return Promise.reject(new TypeError('Animation requires a video, source and abort signal'));
 let source;
 try{
  source=new URL(src,origin);
  if(!origin||source.origin!==origin||!['http:','https:'].includes(source.protocol))throw new Error('Animation must use a same-origin public asset');
 }catch(error){return Promise.reject(error);}
 let closed=false,ready=false,playRequested=false,resolveReady,rejectReady;
 const pending=new Promise((resolve,reject)=>{resolveReady=resolve;rejectReady=reject;});
 const aborted=()=>new DOMException('Animation was released','AbortError');
 const removeReadyListeners=()=>{
  video.removeEventListener('loadedmetadata',restorePosition);
  video.removeEventListener('loadeddata',play);
 };
 function dispose(){
  if(closed)return;closed=true;signal.removeEventListener('abort',abort);removeReadyListeners();video.removeEventListener('error',failed);
  if(Number.isFinite(video.currentTime)&&video.currentTime>=0)onPosition(video.currentTime);
  video.pause();video.removeAttribute('src');video.preload='none';video.load();
  if(!ready)rejectReady(aborted());
 }
 const handle={dispose,inspect:()=>({ready,disposed:closed,position:video.currentTime,paused:video.paused,hasSource:video.hasAttribute('src')})};
 function abort(){dispose();}
 function failed(){
  if(closed)return;
  const error=new Error('Animation video could not be loaded or played');
  rejectReady(error);dispose();if(ready)onFailure(error);
 }
 function restorePosition(){
  if(closed||signal.aborted)return;
  if(Number.isFinite(position)&&position>0&&Number.isFinite(video.duration)&&video.duration>0){
   // A loop can report its exact end. Keep resume inside the native time range.
   try{video.currentTime=Math.min(position,Math.max(0,video.duration-.05));}catch{failed();}
  }
 }
 function play(){
  if(closed||signal.aborted||playRequested)return;
  playRequested=true;
  let playback;
  try{playback=video.play();}catch{failed();return;}
  Promise.resolve(playback).then(()=>{
   if(closed||signal.aborted)return;
   ready=true;removeReadyListeners();resolveReady(handle);
  },()=>{if(!closed)failed();});
 }
 if(signal.aborted){rejectReady(aborted());return pending;}
 signal.addEventListener('abort',abort,{once:true});
 video.addEventListener('loadedmetadata',restorePosition);
 video.addEventListener('loadeddata',play);video.addEventListener('error',failed);
 try{
  video.muted=true;video.loop=true;video.playsInline=true;video.preload='auto';
  video.src=source.href;video.load();
 }catch{failed();}
 return pending;
}
