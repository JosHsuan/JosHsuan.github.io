import {EventManager} from '../core/EventManager.ts';
import {createProjectStudyBackdropMotion,advanceProjectStudyBackdropMotion,cancelProjectStudyBackdropMotion,failProjectStudyBackdropMotion} from './ProjectStudyBackdropMotion.mjs';

const ARRIVAL_MS=15000;
const safeTime=video=>Number.isFinite(video?.currentTime)?video.currentTime:0;

/** One source transaction for documentary stills, native recordings and the
 * optional original-model actor. All finite motion borrows SiteBackgroundDriver
 * active seconds. Native video alone owns media time; no frame loop is added. */
export function createProjectStudyBackdropPresenter({root,window:win,document:doc,publisher,schedule,policy}={}){
 const events=new EventManager(),scope=events.createScope('project-study-backdrop'),motion=createProjectStudyBackdropMotion();
 const chapters=[...root.querySelectorAll('[data-project-chapter]')].map(node=>node.dataset.projectChapter);
 const figures=[...root.querySelectorAll('[data-project-media]')],records=[],descriptors=new Map();
 const listen=(node,type,handler,options)=>events.listen(scope,node,type,handler,options);
 const clock=()=>win.performance?.now?.()??Date.now();
 let disposed=false,suspended=false,scene=null,initial=true,seekPending=false,lastChapter=null,direction=1,ticks=0;
 let size={width:win.innerWidth,height:win.innerHeight};
 const settings=()=>{const value=policy();return{...value,hidden:suspended||!!value.hidden};};
 const eligible=p=>!p.hidden&&!p.reduced&&!p.saveData&&!p.paused&&p.siteReady;
 const findControl=(attribute,id)=>[...root.querySelectorAll(`[${attribute}]`)].find(node=>node.getAttribute(attribute)===id)??null;
 const changed=()=>{if(!disposed)schedule();};
 const closePosterTimer=record=>{
  if(record.posterTimer!==null){win.clearTimeout(record.posterTimer);record.posterRemaining=Math.max(0,record.posterRemaining-(clock()-record.posterTimerStarted));record.posterTimer=null;}
 };
 const failPoster=(record,reason)=>{
  if(disposed||record.posterFailed)return;
  closePosterTimer(record);record.decodeGeneration++;record.posterReady=false;record.posterFailed=true;record.posterReason=reason;
  publisher.attribute(record.figure,'data-project-image-state','failed');
  const target=descriptors.get(motion.request?.key);
  if(target?.kind==='image'&&(target.record??target)===record)failProjectStudyBackdropMotion(motion,target.key,reason);
  changed();
 };
 const preparePoster=(record,p)=>{
  if(record.posterReady||record.posterFailed)return;
  if(record.image)record.image.loading='eager';
  if(p.hidden){closePosterTimer(record);return;}
  if(record.posterTimer!==null)return;
  if(record.posterRemaining<=0){failPoster(record,'image-timeout');return;}
  record.posterTimerStarted=clock();record.posterTimer=win.setTimeout(()=>{record.posterTimer=null;record.posterRemaining=0;failPoster(record,'image-timeout');},record.posterRemaining);
 };
 const closeTimer=record=>{
  if(record.timer!==null){win.clearTimeout(record.timer);record.remaining=Math.max(0,record.remaining-(clock()-record.timerStarted));record.timer=null;}
 };
 const cancelFrame=record=>{
  record.generation++;if(record.callback!==null)record.video.cancelVideoFrameCallback?.(record.callback);record.callback=null;closeTimer(record);
 };
 const pause=record=>{
  if(!record.video)return;cancelFrame(record);
  record.playGeneration++;record.playPending=false;record.preparing=false;record.video.pause();record.playing=false;
  if(record.started&&!record.failed&&!record.ended)record.phase='paused';
 };
 const publishMedia=record=>{
  publisher.attribute(record.figure,'data-project-media-mode',record.visualVideo&&record.firstFrame&&!record.failed?'video':'poster');
  publisher.attribute(record.figure,'data-project-media-phase',record.phase);
  publisher.attribute(record.figure,'data-project-media-reason',record.reason||null);
  const p=settings(),available=record.active&&record.visualVideo&&record.firstFrame&&!record.failed&&!p.reduced&&!p.saveData;
  publisher.attribute(record.toggle,'hidden',available&&!record.ended?null:'');
  publisher.attribute(record.replay,'hidden',available&&record.ended?null:'');
  publisher.attribute(record.toggle,'aria-pressed',record.playing?'true':'false');
  publisher.text(record.toggle,record.playing?'Pause recording':'Play recording');
  publisher.text(record.status,record.failed?'Recording unavailable. The original source poster remains available.':record.ended?'Recording complete. The final source frame is held.':record.userPaused?'Recording paused.':'');
 };
 const releaseVideo=record=>{
  if(!record.video)return;pause(record);record.video.removeAttribute('src');record.video.preload='none';record.video.load?.();
 };
 const fail=(record,reason)=>{
  if(disposed||record.failed)return;record.failed=true;record.reason=reason;record.phase='failed';
  failProjectStudyBackdropMotion(motion,record.key,reason);record.failures.push({reason,currentTime:safeTime(record.video)});releaseVideo(record);publishMedia(record);changed();
 };
 const play=record=>{
  if(disposed||record.failed||record.ended||record.playPending||record.playing)return;
  record.playPending=true;const generation=++record.playGeneration;
  let result;try{result=record.video.play();}catch{record.playPending=false;fail(record,'play-rejected');return;}
  Promise.resolve(result).then(()=>{
   if(disposed||generation!==record.playGeneration)return;record.playPending=false;
   if(!eligible(settings())||!record.active&&!record.preparing||record.userPaused){pause(record);return;}
   record.playing=!record.video.paused;record.phase=record.playing?'playing':record.firstFrame?'paused':'preparing';publishMedia(record);
  },()=>{if(!disposed&&generation===record.playGeneration){record.playPending=false;fail(record,'play-rejected');}});
 };
 const firstFrame=(record,metadata,method)=>{
  if(disposed||record.failed||!record.preparing)return;
  record.firstFrame=true;record.decoded=true;record.preparing=false;record.frame={method,mediaTime:Number.isFinite(metadata?.mediaTime)?metadata.mediaTime:safeTime(record.video),presentedFrames:Number.isFinite(metadata?.presentedFrames)?metadata.presentedFrames:null,width:record.video.videoWidth,height:record.video.videoHeight};
  if(method==='video-frame')record.compositorFrame={...record.frame};
  pause(record);record.phase='ready';publishMedia(record);changed();
 };
 const awaitCompositorReceipt=record=>{
  if(record.compositorFrame||record.callback!==null||!record.video.requestVideoFrameCallback)return;
  const generation=record.generation;
  record.callback=record.video.requestVideoFrameCallback((_now,metadata)=>{
   record.callback=null;if(disposed||generation!==record.generation)return;
   record.compositorFrame={method:'video-frame',mediaTime:metadata.mediaTime,presentedFrames:metadata.presentedFrames,width:record.video.videoWidth,height:record.video.videoHeight};
  });
 };
 const awaitFrame=record=>{
  if(disposed||record.failed||record.firstFrame||record.callback!==null||!record.preparing)return;
  if(record.decoded&&record.video.readyState>=2&&record.video.videoWidth>0&&record.video.videoHeight>0){firstFrame(record,null,'loadeddata');return;}
  if(record.timer===null){
   if(record.remaining<=0){fail(record,'media-timeout');return;}
   record.timerStarted=clock();record.timer=win.setTimeout(()=>{record.timer=null;record.remaining=0;fail(record,'media-timeout');},record.remaining);
  }
  if(record.video.requestVideoFrameCallback){
   const generation=record.generation;
   record.callback=record.video.requestVideoFrameCallback((_now,metadata)=>{record.callback=null;if(disposed||generation!==record.generation)return;firstFrame(record,metadata,'video-frame');});
  }else if(record.video.readyState>=2&&record.video.videoWidth>0&&record.video.videoHeight>0){
   // loadeddata/readyState HAVE_CURRENT_DATA is the native decoded-frame
   // fallback on engines without requestVideoFrameCallback; no polling RAF.
   firstFrame(record,null,'loadeddata');
  }
 };
 const prepareVideo=record=>{
  if(record.failed||record.firstFrame)return;
  record.preparing=true;record.phase='preparing';
  if(!record.started){
   record.started=true;record.video.muted=true;record.video.playsInline=true;record.video.preload='auto';record.video.setAttribute('src',record.src);record.video.load?.();
  }
  awaitFrame(record);if(!record.firstFrame&&!record.failed)play(record);publishMedia(record);
 };
 for(const figure of figures){
  const image=figure.querySelector('[data-project-media-poster]')??figure.querySelector('img'),video=figure.querySelector('[data-project-motion-media]');
  const id=video?.getAttribute('data-project-motion-id')??null,src=video?.getAttribute('data-project-video-src')??null;
  const chapter=figure.dataset.projectMedia,key=video?`video:${id}`:`image:${image?.getAttribute('src')??chapter}`;
  const record={key,kind:video?'video':'image',chapter,figure,image,video,id,src,posterReady:false,posterFailed:false,posterReason:'',posterTimer:null,posterTimerStarted:0,posterRemaining:ARRIVAL_MS,decodeGeneration:0,active:false,visualVideo:false,phase:'poster',reason:'',firstFrame:false,decoded:false,frame:null,compositorFrame:null,started:false,preparing:false,playing:false,playPending:false,playGeneration:0,userPaused:false,ended:false,failed:false,failures:[],generation:0,callback:null,timer:null,timerStarted:0,remaining:ARRIVAL_MS,toggle:id?findControl('data-project-motion-toggle',id):null,replay:id?findControl('data-project-motion-replay',id):null,status:id?findControl('data-project-motion-status',id):null};
  records.push(record);if(!descriptors.has(key))descriptors.set(key,record);
  const decode=()=>{
   if(disposed||record.posterFailed)return;
   const generation=++record.decodeGeneration;
   Promise.resolve().then(()=>image?.decode?.()).then(()=>{
    if(disposed||record.posterFailed||generation!==record.decodeGeneration)return;
    if(!image?.naturalWidth){failPoster(record,'image-unavailable');return;}
    closePosterTimer(record);record.posterReady=true;
    publisher.attribute(figure,'data-project-image-state','ready');changed();
   },()=>{if(disposed||generation!==record.decodeGeneration)return;failPoster(record,'image-unavailable');});
  };
  if(image){listen(image,'load',decode);listen(image,'error',()=>failPoster(record,'image-unavailable'));if(image.complete)decode();}
  else failPoster(record,'image-unavailable');
  if(video){
   if(!id||!src){record.failed=true;record.phase='failed';record.reason='source-unavailable';}
   for(const type of ['loadeddata','canplay'])listen(video,type,()=>{
    if(video.readyState>=2&&video.videoWidth>0&&video.videoHeight>0)record.decoded=true;
    if(disposed||!record.preparing||!eligible(settings()))return;
    // A hidden video may not submit to the compositor yet. HAVE_CURRENT_DATA
    // plus native decoded dimensions acknowledges its actual first source
    // frame, rather than deadlocking entry on a hidden compositor callback.
    if(video.readyState>=2&&video.videoWidth>0&&video.videoHeight>0)firstFrame(record,null,'loadeddata');
    else{awaitFrame(record);if(!record.firstFrame)play(record);}
   });
   listen(video,'playing',()=>{if(disposed)return;if(!eligible(settings())||!record.active&&!record.preparing||record.userPaused){pause(record);return;}record.playing=true;record.phase='playing';publishMedia(record);});
   listen(video,'pause',()=>{if(disposed)return;record.playing=false;if(record.firstFrame&&!record.failed&&!record.ended)record.phase='paused';publishMedia(record);});
   listen(video,'ended',()=>{if(disposed)return;if(!record.firstFrame){if(video.readyState>=2&&video.videoWidth>0&&video.videoHeight>0)firstFrame(record,null,'loadeddata');else{fail(record,'first-frame-unavailable');return;}}record.ended=true;record.playing=false;record.phase='ended';cancelFrame(record);publishMedia(record);changed();});
   listen(video,'error',()=>{if(record.started)fail(record,'media-error');});
   if(record.toggle)listen(record.toggle,'click',()=>{if(!record.active||!record.firstFrame||record.failed)return;record.userPaused=record.playing||record.playPending;if(record.userPaused)pause(record);else if(eligible(settings()))play(record);publishMedia(record);changed();});
   if(record.replay)listen(record.replay,'click',()=>{if(!record.active||!record.firstFrame||record.failed||!eligible(settings()))return;record.video.currentTime=0;record.ended=false;record.userPaused=false;play(record);publishMedia(record);changed();});
  }
  publishMedia(record);
 }
 const wanted=(chapter,p)=>{
  const modelState=scene?.actor.inspect(),modelUnavailable=modelState?.arrivalStatic&&modelState.posterFailed;
  if(modelUnavailable)failProjectStudyBackdropMotion(motion,`model:${chapter}`,modelState.posterFailureReason||modelState.staticReason||'model-poster-unavailable');
  if(scene?.model.chapters.includes(chapter)&&!modelUnavailable){
   const key=`model:${chapter}`;if(!descriptors.has(key))descriptors.set(key,{key,chapter,kind:'model'});return descriptors.get(key);
  }
  const index=chapters.indexOf(chapter);
  const selected=records.filter(record=>chapters.indexOf(record.chapter)<=index).at(-1)??records[0]??null;
  // Repeated native chapters share one source readiness/render owner. A second
  // DOM image cannot acknowledge the canonical figure's decoded pixels.
  const record=selected?descriptors.get(selected.key)??selected:null;
  if(record?.video&&(p.reduced||p.saveData||!p.siteReady||p.paused&&!record.firstFrame||record.failed)){
   const key=`poster:${record.id}`;if(!descriptors.has(key))descriptors.set(key,{key,chapter:record.chapter,kind:'image',record,poster:true});return descriptors.get(key);
  }
  return record;
 };
 const readyTarget=(target,p)=>{
  if(target.kind==='model'){
   const ready=scene?.actor.prepare(target.chapter)??false,state=scene?.actor.inspect();
   return{ready,failure:state?.arrivalStatic&&!['reduced-motion','save-data'].includes(state.staticReason)?state.staticReason:''};
  }
  const record=target.record??target;
  if(target.poster){preparePoster(record,p);return{ready:record.posterReady||record.posterFailed,failure:record.posterFailed?record.posterReason:record.failed?record.reason:''};}
  if(target.video&&eligible(p)&&!target.failed){prepareVideo(target);return{ready:target.firstFrame,failure:target.failed?target.reason:''};}
  preparePoster(record,p);
  return{ready:record.posterReady||record.posterFailed,failure:record.failed?record.reason:record.posterFailed?record.posterReason:''};
 };
 const render=()=>{
  const displayed=descriptors.get(motion.key),displayedRecord=displayed?.record??displayed,visible=motion.pose.opacity>0,transform=`translate3d(${motion.pose.x*size.width}px,${motion.pose.y*size.height}px,0)`;
  const requested=descriptors.get(motion.request?.key),requestedRecord=requested?.record??requested;
  for(const record of records){
   if(record!==requestedRecord||settings().hidden)closePosterTimer(record);
   record.active=record===displayedRecord&&visible;record.visualVideo=record===displayedRecord&&displayed?.kind==='video';
   publisher.attribute(record.figure,'data-project-media-active',record.active?'':null);
   if(record===displayedRecord){publisher.style(record.figure,'transform',transform);publisher.style(record.figure,'opacity',motion.pose.opacity);}
   else{publisher.style(record.figure,'opacity',0);}
   if(record.video){
    const p=settings(),held=record.active&&record.visualVideo&&motion.mode==='hold',preparing=record.preparing&&motion.request?.key===record.key&&motion.key===record.key&&motion.mode==='waiting';
    if(!eligible(p)||!held){if(!preparing||!eligible(p))pause(record);}
    else if(record.firstFrame&&!record.failed&&!record.userPaused&&!record.ended){awaitCompositorReceipt(record);play(record);}
    publishMedia(record);
   }
  }
  if(scene){
   const active=displayed?.kind==='model'&&visible,surface=scene.host.querySelector('[data-project-model-surface]')??scene.host;
   publisher.attribute(scene.host,'data-project-model-active',active?'':null);publisher.attribute(scene.host,'data-project-model-mode',displayed?.kind==='model'?motion.mode:'absent');publisher.attribute(scene.host,'data-project-model-chapter',displayed?.kind==='model'?motion.chapter:null);
   if(displayed?.kind==='model'){publisher.style(surface,'transform',transform);publisher.style(surface,'opacity',motion.pose.opacity);}else publisher.style(surface,'opacity',0);
  }
  publisher.attribute(root,'data-project-presented-source',motion.key);publisher.attribute(root,'data-project-backdrop-mode',motion.mode);
 };
 const snapshot=()=>({...motion,kind:descriptors.get(motion.key)?.kind??null,pose:{...motion.pose},request:motion.request?{...motion.request}:null,transition:motion.transition?{...motion.transition,from:{...motion.transition.from},to:{...motion.transition.to}}:null,history:[...motion.history]});
 return{
  setScene(value){if(disposed)return;scene=value;for(const [key,descriptor]of descriptors)if(descriptor.kind==='model')descriptors.delete(key);changed();},
  measure(width,height){if(!disposed)size={width,height};},
  publish({dt=0,resumed=false}={}){
   if(disposed)return false;ticks++;
   const p=settings(),chapter=root.dataset.projectActiveChapter??chapters[0]??'overview',target=wanted(chapter,p);
   if(!target)return scene?.actor.publish({dt,resumed,stage:null})??false;
   if(chapter!==lastChapter){direction=Math.sign(chapters.indexOf(chapter)-chapters.indexOf(lastChapter))||direction;lastChapter=chapter;}
   if(resumed)seekPending=true;
   const snap=initial||seekPending||p.reduced||p.saveData||p.paused||!p.siteReady;
   // A target may acquire/paint only after the previously displayed subject is
   // completely outside. Its native reading chapter is already immediate.
   let result=motion.key===target.key?readyTarget(target,p):{ready:false,failure:''};
   advanceProjectStudyBackdropMotion(motion,dt,{key:target.key,chapter:target.chapter,direction,...result,snap,resumed});
   if(motion.key===target.key&&motion.mode==='waiting'){
    result=readyTarget(target,p);advanceProjectStudyBackdropMotion(motion,0,{key:target.key,chapter:target.chapter,direction,...result,snap,resumed});
   }
   if(motion.mode==='hold'){initial=false;seekPending=false;}
   render();
   const actorMoving=scene?.actor.publish({dt,resumed,stage:snapshot()})??false;
   return actorMoving||!!motion.transition;
  },
  suspend(reason){if(disposed)return;suspended=true;seekPending=true;for(const record of records){closePosterTimer(record);pause(record);}cancelProjectStudyBackdropMotion(motion,reason);scene?.actor.suspend(reason);},
  resume(){if(disposed)return;suspended=false;seekPending=true;scene?.actor.resume();changed();},
  inspect:()=>({ticks,stage:snapshot(),media:records.map(record=>({id:record.id,key:record.key,chapter:record.chapter,kind:record.kind,active:record.active,posterReady:record.posterReady,posterFailed:record.posterFailed,posterReason:record.posterReason,posterDeadlinePending:record.posterTimer!==null,posterRemaining:Math.max(0,record.posterRemaining-(record.posterTimer===null?0:clock()-record.posterTimerStarted)),phase:record.phase,reason:record.reason,started:record.started,firstFrame:record.firstFrame,frame:record.frame?{...record.frame}:null,compositorFrame:record.compositorFrame?{...record.compositorFrame}:null,playing:record.playing,paused:record.video?record.video.paused:true,currentTime:safeTime(record.video),ended:record.ended,userPaused:record.userPaused,failed:record.failed,source:record.src,sourceAttached:!!record.video?.getAttribute('src'),callbackPending:record.callback!==null,deadlinePending:record.timer!==null,failures:[...record.failures]})),events:events.inspect(),suspended,disposed}),
  dispose(){
   if(disposed)return;cancelProjectStudyBackdropMotion(motion,'disposed');disposed=true;
   for(const record of records){record.decodeGeneration++;closePosterTimer(record);releaseVideo(record);for(const name of ['active','mode','phase','reason'])publisher.attribute(record.figure,'data-project-media-'+name,null);publisher.style(record.figure,'transform','');publisher.style(record.figure,'opacity','');}
   if(scene){const surface=scene.host.querySelector('[data-project-model-surface]')??scene.host;for(const name of ['active','mode','chapter'])publisher.attribute(scene.host,'data-project-model-'+name,null);publisher.style(surface,'transform','');publisher.style(surface,'opacity','');}
   scope.dispose();events.dispose();publisher.attribute(root,'data-project-presented-source',null);publisher.attribute(root,'data-project-backdrop-mode',null);
  },
 };
}
