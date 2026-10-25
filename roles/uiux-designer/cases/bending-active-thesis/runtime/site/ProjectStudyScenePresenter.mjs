import {createScrollCameraPath,sampleScrollCamera,composeCameraIntent,sampleHandheldSurface} from '../motion/scroll-camera-score.mjs';
import {DOT_SOURCE_REVISION,sampleDotDetail} from '../../components/dot-detail-score.mjs';
import {EventManager} from '../core/EventManager.ts';
import {createPreviewLifecycle} from './PreviewLifecycle.mjs';
import {registerPagePreviewReadiness} from './PagePreviewReadiness.mjs';
import {CANVAS_ENTRY_SECONDS,CANVAS_EXIT_SECONDS} from '../../components/canvas-motion.mjs';

const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
const smooth=value=>{const t=clamp(value,0,1);return t*t*t*(10+t*(-15+6*t));};
const rest=()=>({azimuth:0,elevation:0});
const outside=direction=>direction>0?{x:-1.08,y:-.05,opacity:0}:{x:.22,y:.035,opacity:0};
const held=()=>({x:0,y:0,opacity:1});
const BLOCKED='a,button,input,select,textarea,summary,[contenteditable]:not([contenteditable="false"]),[role="textbox"],[data-protect],[data-information-window]';
const fact=(state,status,reason)=>{
 if(!state.request)return;
 state.history.push({id:state.request.id,chapter:state.request.chapter,status,...(reason?{reason}:{})});if(state.history.length>64)state.history.shift();
};
const complete=(state,reason)=>{if(state.request&&!state.request.completed){state.request.completed=true;fact(state,'completed',reason);}};
export function createProjectStudyStageMotion(){return{chapter:'overview',pose:outside(1),mode:'absent',transition:null,request:null,sequence:0,history:[],settled:true};}
export function cancelProjectStudyStageMotion(state,reason){if(state.request&&!state.request.completed)fact(state,'cancelled',reason);state.request=null;state.transition=null;state.settled=true;}
/** Finite passages borrow Bending's durations, never its chapter identities.
 * Only the caller's active seconds advance them. Superseded requests close. */
export function advanceProjectStudyStageMotion(state,dt,{chapter,chapters,modelChapters,readyChapter=null,snap=false,resumed=false}){
 if(!Number.isFinite(dt)||dt<0||!chapters.includes(chapter))throw RangeError('A known native chapter and nonnegative active seconds are required');
 const wanted=modelChapters.includes(chapter),key=chapter+':'+wanted;
 if(state.request?.key!==key){
  if(state.request&&!state.request.completed)fact(state,'cancelled','superseded');
  const direction=Math.sign(chapters.indexOf(chapter)-chapters.indexOf(state.request?.chapter??state.chapter))||1;
  state.request={id:++state.sequence,key,chapter,wanted,direction,completed:false};fact(state,'requested');
 }
 const begin=kind=>{state.transition={kind,elapsed:0,duration:kind==='entry'?CANVAS_ENTRY_SECONDS:CANVAS_EXIT_SECONDS,from:{...state.pose},to:kind==='entry'?held():outside(state.request.direction)};state.mode=kind;state.settled=false;};
 const reconcile=()=>{
  if(state.chapter!==chapter){
   if(state.pose.opacity>0){if(state.transition?.kind!=='exit')begin('exit');return;}
   state.chapter=chapter;state.pose=outside(-state.request.direction);state.transition=null;
  }
  if(!wanted){state.pose=outside(state.request.direction);state.transition=null;state.mode='absent';state.settled=true;complete(state);}
  else if(readyChapter!==chapter){state.transition=null;state.mode='waiting';state.settled=false;}
  else if(state.pose.opacity!==1||state.pose.x!==0){if(state.transition?.kind!=='entry')begin('entry');}
  else{state.transition=null;state.mode='hold';state.settled=true;complete(state);}
 };
 if(snap){state.chapter=chapter;state.transition=null;state.pose=wanted?held():outside(state.request.direction);state.mode=wanted?'hold':'absent';state.settled=true;complete(state,'static');}
 else{
  reconcile();let remaining=resumed?0:dt;
  while(state.transition&&remaining>0){const passage=state.transition,step=Math.min(remaining,passage.duration-passage.elapsed);passage.elapsed=Math.min(passage.duration,passage.elapsed+step);remaining-=step;if(passage.duration-passage.elapsed<1e-10)passage.elapsed=passage.duration;const p=smooth(passage.elapsed/passage.duration);for(const name of ['x','y','opacity'])state.pose[name]=passage.from[name]+(passage.to[name]-passage.from[name])*p;if(passage.elapsed===passage.duration){state.pose={...passage.to};state.transition=null;reconcile();}}
 }
 return state;
}

/** One optional scene adapter on the ordinary-page driver's existing clock.
 * React supplies a host; this owner supplies intent/lifecycle; Three alone owns
 * source rendering and its camera. No RAF or autonomous animation is created. */
export function createProjectStudyScenePresenter({root,host,model,window:win,document:doc,publisher,schedule,policy,externalStage=false,acquire=async options=>{
 const sceneModule=await import('../../components/project-study-scene.mjs');return sceneModule.acquireProjectStudyScene(options);
}}){
 const events=new EventManager(),scope=events.createScope('project-study-scene'),surface=host.querySelector('[data-project-model-surface]')??host,poster=host.querySelector('[data-project-model-poster]');
 const chapters=[...root.querySelectorAll('[data-project-chapter]')].map(element=>element.dataset.projectChapter),motion=createProjectStudyStageMotion(),gestures=[];
 // Compile authored chapter-local keys once. Native reading anchors remain owned
 // by ChapterPresenter; this adapter never measures scroll geometry.
 const authored=model.cameraPath??(model.views?model.chapters.map(id=>({chapter:id,progress:0,yawRad:model.views[id]?.yaw??.72,pitchRad:model.views[id]?.pitch??.3,fovDeg:model.views[id]?.fov??36,zoom:model.views[id]?.zoom??1})):null);
 const cameraKeys=authored?.map(key=>{
  const index=model.chapters.indexOf(key.chapter);
  if(index<0||!Number.isFinite(key.progress)||key.progress<0||key.progress>1)throw RangeError('Camera key requires a model chapter and finite local progress');
  return{at:(index+key.progress)/model.chapters.length,yawRad:key.yawRad,pitchRad:key.pitchRad,fovDeg:key.fovDeg,zoom:key.zoom};
 });
 if(cameraKeys&&cameraKeys.at(-1)?.at<1)cameraKeys.push({...cameraKeys.at(-1),at:1});
 const cameraPath=cameraKeys?createScrollCameraPath(cameraKeys):null;
 let handheldGain=1,lastHandheld={xPx:0,yPx:0,rollRad:0};
 let reading=null,activeSeconds=0,lastCameraIntent=null,cameraWasPaused=false,cameraRecovery=null;
 const dotDetail=model.sha256===DOT_SOURCE_REVISION&&root.dataset.projectStudy==='dot-based-3d-printing';
 const detailAnnotation=dotDetail?host.querySelector('[data-dot-detail-annotation]'):null;
 let detailRecovery=null,detailInspecting=false,detailWasFrozen=false;
 const inspectionNodes=new Map(model.chapters.map(key=>[key,{target:null,state:null,help:null,reset:null,published:''}]));
 for(const [selector,field,data]of [['[data-project-model-target]','target','projectModelTarget'],['[data-project-model-state]','state','projectModelState'],['[data-project-model-help]','help','projectModelHelp'],['[data-project-model-reset]','reset','projectModelReset']])for(const node of root.querySelectorAll(selector)){const row=inspectionNodes.get(node.dataset[data]);if(row)row[field]=node;}
 for(const row of inspectionNodes.values())row.originalDescription=row.target?.getAttribute?.('aria-describedby')??null;
 publisher.attribute(host,'data-project-model-controls-layout',!policy().reduced&&!policy().saveData?'reserved':null);
 let disposed=false,suspended=false,arrivalStatic=false,staticReason='',resource=null,lifecycle=null,readiness=null,sharedStage=null,preparedChapter=null,posterFailed=false;
 let size={width:win.innerWidth,height:win.innerHeight},chapter=root.dataset.projectActiveChapter??'overview',paintedChapter=null,lastPaint='';
 let target=rest(),value=rest(),velocity=rest(),settled=true,press=null,gestureSequence=0;
 let posterRequested=false,posterTimer=null,posterEpoch=0,posterStarted=0,posterRemaining=15000,posterFailureReason='';
 const posterClock=()=>win.performance?.now?.()??Date.now();
 const stopPosterDeadline=()=>{posterEpoch++;if(posterTimer!==null){win.clearTimeout(posterTimer);posterRemaining=Math.max(0,posterRemaining-(posterClock()-posterStarted));posterTimer=null;}};
 const failPoster=reason=>{if(disposed||posterFailureReason)return;stopPosterDeadline();posterFailed=true;posterFailureReason=reason;publisher.attribute(host,'data-project-model-poster-ready',null);announce();schedule();};
 const armPosterDeadline=()=>{
  if(disposed||!posterRequested||!arrivalStatic||!poster||posterFailed||poster.complete&&poster.naturalWidth||suspended||policy().hidden||posterTimer!==null)return;
  if(posterRemaining<=0){failPoster('model-poster-timeout');return;}
  const epoch=++posterEpoch;posterStarted=posterClock();posterTimer=win.setTimeout(()=>{if(disposed||epoch!==posterEpoch)return;posterTimer=null;posterRemaining=0;failPoster('model-poster-timeout');},posterRemaining);
 };
 const syncPosterDeadline=()=>{const native=root.dataset.projectActiveChapter??'overview',active=preparedChapter===native&&(!externalStage||!sharedStage||sharedStage.kind==='model'&&sharedStage.chapter===preparedChapter);if(!active||suspended||policy().hidden)stopPosterDeadline();else armPosterDeadline();};
 const listen=(node,type,fn,options)=>events.listen(scope,node,type,fn,options);
 const posterReady=()=>{if(disposed||posterFailureReason)return;if(poster?.complete&&!poster.naturalWidth){failPoster('model-poster-unavailable');return;}if(poster?.complete&&poster.naturalWidth)stopPosterDeadline();publisher.attribute(host,'data-project-model-poster-ready',poster?.complete&&poster.naturalWidth?'':null);schedule();};
 if(poster){listen(poster,'load',posterReady);listen(poster,'error',posterReady);posterReady();}
 function announce(){if(disposed)return;publisher.attribute(host,'data-project-model-controls-layout',!arrivalStatic&&!policy().reduced&&!policy().saveData?'reserved':null);const state=lifecycle?.inspect();publisher.attribute(host,'data-project-model-phase',state?.phase??'poster');publisher.attribute(host,'data-project-model-reason',posterFailureReason||staticReason||state?.reason||'');publisher.attribute(host,'data-project-model-rendering',!arrivalStatic&&state?.phase==='ready'?'webgl-model':'poster');publishInspection();publishDetailAnnotation();}
 const staticReady=()=>readiness?.report({mode:'static',reason:staticReason});
 const settleStatic=reason=>{if(disposed||arrivalStatic)return;cameraRecovery=null;cameraWasPaused=false;arrivalStatic=true;staticReason=reason;lifecycle?.stop(reason);staticReady();announce();schedule();};
 readiness=registerPagePreviewReadiness(doc,host,{onFallback:settleStatic});if(arrivalStatic)staticReady();
 const closeGesture=(reason,immediate=false)=>{
  if(press){const current=press;press=null;gestures.push({id:current.id,status:reason==='released'?'released':'cancelled',reason});if(gestures.length>32)gestures.shift();if(current.surface.hasPointerCapture?.(current.pointerId))current.surface.releasePointerCapture(current.pointerId);}
  target=rest();if(immediate){value=rest();velocity=rest();settled=true;}else settled=Object.keys(value).every(key=>value[key]===0&&velocity[key]===0);
 };
 lifecycle=createPreviewLifecycle({retainWhenInactive:true,setTimeout:win.setTimeout.bind(win),clearTimeout:win.clearTimeout.bind(win),onState:state=>{
  if(disposed)return;
  if(state.phase==='ready'&&state.resource?.firstDraw?.completed)readiness.report({mode:'model'});
  else if(state.phase==='failed'){arrivalStatic=true;staticReason=state.reason;staticReady();closeGesture('resource-unavailable',true);}
  announce();schedule();
 },start:async({signal,width,height})=>{
  const handle=await acquire({host,model,signal,onFailure:reason=>lifecycle.fail(reason)});
  if(disposed||signal.aborted){handle.dispose();throw new DOMException('Project study released','AbortError');}
  try{
   handle.present(cameraPresentation(model.chapters.includes(chapter)?chapter:model.chapters[0],{forceFull:true}));handle.resize(width,height);
   if(!handle.inspect().firstDraw?.completed||!handle.inspect().successfulPaint)throw Error('Original project model first draw is unavailable');
  }catch(error){handle.dispose();throw error;}
  if(disposed||signal.aborted){handle.dispose();throw new DOMException('Project study released','AbortError');}
  resource=handle;paintedChapter=handle.inspect().view.chapter;let released=false;
  return{resize:(width,height)=>handle.resize(width,height),inspect:()=>handle.inspect(),dispose(){if(released)return;released=true;if(resource===handle){resource=null;lastPaint='';paintedChapter=null;}handle.dispose();}};
 }});
 if(arrivalStatic)lifecycle.stop(staticReason);
 function updatePolicy(){
  if(disposed)return;const p=policy();
  if(p.hidden||p.reduced||p.saveData||p.paused||suspended)closeGesture(p.hidden?'hidden':p.reduced?'reduced-motion':p.saveData?'save-data':p.paused?'paused':'suspended',true);
  if(!arrivalStatic&&(p.reduced||p.saveData))settleStatic(p.reduced?'reduced-motion':'save-data');
  if(!arrivalStatic&&(p.hidden||suspended)&&lifecycle.inspect().phase!=='ready')settleStatic(p.hidden?'hidden':'suspended');
  if(!arrivalStatic)lifecycle.setActive(!p.hidden&&!suspended,'hidden');
  syncPosterDeadline();
 }
 const activeMotion=()=>externalStage?sharedStage:motion;
 function cameraPresentation(forChapter,{forceFull=false}={}){
  const presentation={chapter:forChapter,azimuth:value.azimuth,elevation:value.elevation};
  if(!cameraPath)return presentation;
  const p=policy();
  if(p.paused&&lastCameraIntent){cameraWasPaused=true;cameraRecovery=null;}
  if((p.paused||p.hidden||suspended)&&lastCameraIntent){if(dotDetail)detailWasFrozen=true;return{...presentation,cameraIntent:lastCameraIntent,handheld:lastHandheld};}
  const native=reading?.chapter??forChapter,index=model.chapters.indexOf(native);
  const progress=index<0?(chapters.indexOf(native)<chapters.indexOf(model.chapters[0])?0:1):(index+(reading?.progress??0))/model.chapters.length;
  const primary=reading?.detailEnabled===true&&Number.isFinite(reading.detailProgress)?reading.detailProgress:null;
  const detail=dotDetail?sampleDotDetail(forceFull?0:primary??progress,{enabled:primary!==null&&!forceFull&&!p.reduced&&!p.saveData&&!arrivalStatic}):null;
  const main=sampleScrollCamera(cameraPath,detail?detail.cameraProgress:progress);
  const desired=composeCameraIntent(main,{inspection:{yawRad:value.azimuth,pitchRad:value.elevation},reducedMotion:p.reduced});
  if(cameraWasPaused&&lastCameraIntent&&!p.reduced&&!p.saveData){
   const yaw=lastCameraIntent.yawRad-desired.yawRad,tau=Math.PI*2;
   cameraRecovery={elapsed:0,yawRad:Math.abs(yaw)<=Math.PI?yaw:((yaw+Math.PI)%tau+tau)%tau-Math.PI,pitchRad:lastCameraIntent.pitchRad-desired.pitchRad,fovDeg:lastCameraIntent.fovDeg-desired.fovDeg,zoom:lastCameraIntent.zoom-desired.zoom};
  }
  if(dotDetail){
   const inspecting=!!press?.locked||Object.values(value).some(number=>number!==0)||Object.values(target).some(number=>number!==0)||[...inspectionNodes.values()].some(row=>doc.activeElement===row.target||doc.activeElement===row.reset);
   const desiredWeight=forceFull||inspecting?0:detail.weight;
   if(!forceFull&&(inspecting!==detailInspecting||detailWasFrozen)&&lastCameraIntent)detailRecovery={elapsed:0,from:lastCameraIntent.detailWeight??0};
   detailInspecting=inspecting;detailWasFrozen=false;
   if(forceFull)detailRecovery=null;
   desired.detailWeight=detailRecovery?detailRecovery.from+(desiredWeight-detailRecovery.from)*smooth(detailRecovery.elapsed/.35):desiredWeight;
   desired.detailBeat=desired.detailWeight>0?'detail':inspecting||forceFull?'overview':(primary??progress)>=.85?'handoff':(primary??progress)>=.62?'return':'overview';
  }
  cameraWasPaused=false;
  if(cameraRecovery){
   const weight=1-smooth(cameraRecovery.elapsed/.35);
   desired.yawRad+=cameraRecovery.yawRad*weight;desired.pitchRad+=cameraRecovery.pitchRad*weight;
   desired.fovDeg=clamp(desired.fovDeg+cameraRecovery.fovDeg*weight,1.01,174.99);desired.zoom=Math.max(1,desired.zoom+cameraRecovery.zoom*weight);
  }
  lastCameraIntent=desired;
  // Honest 2D handheld translation/roll of the genuine rendered surface; no parallax.
  lastHandheld=sampleHandheldSurface(activeSeconds,handheldGain);
  return{...presentation,cameraIntent:lastCameraIntent,handheld:lastHandheld};
 }

 function publishDetailAnnotation(){
  if(!detailAnnotation)return;
  const p=policy(),stage=externalStage?sharedStage:motion,actual=resource?.inspect();
  const visible=!disposed&&!arrivalStatic&&!p.reduced&&!p.saveData&&!p.hidden&&!suspended&&p.siteReady&&reading?.detailActive===true&&stage?.chapter==='system'&&(!externalStage||stage.kind==='model')&&stage?.pose?.opacity===1&&actual?.successfulPaint&&paintedChapter==='system';
  publisher.attribute(detailAnnotation,'hidden',visible?null:'');
  if(!visible)return;
  const weight=actual.detail?.weight??0;
  const beat=weight>0?'detail':actual.view?.cameraIntent?.detailBeat??'overview';
  publisher.attribute(detailAnnotation,'data-dot-detail-beat',beat);
 }
 function canInspect(){const p=policy(),stage=externalStage?sharedStage:motion;return!!(!disposed&&!arrivalStatic&&!suspended&&!p.hidden&&!p.reduced&&!p.saveData&&!p.paused&&p.siteReady&&stage?.mode==='hold'&&stage.settled&&model.chapters.includes(chapter)&&stage.chapter===chapter&&(!externalStage||stage.kind==='model')&&lifecycle?.inspect().phase==='ready'&&paintedChapter===chapter&&resource?.inspect().successfulPaint);}
 function publishInspection(){
  if(disposed)return;const p=policy(),phase=lifecycle?.inspect().phase,available=canInspect(),offset=Object.keys(value).some(key=>value[key]!==0||target[key]!==0||velocity[key]!==0),returning=offset&&!press&&Object.values(target).every(number=>number===0);
  for(const [key,row]of inspectionNodes){
   const current=key===chapter,usable=current&&available;
   const state=!current||arrivalStatic||p.reduced||p.saveData?'static':p.paused||p.hidden||suspended?'paused':!p.siteReady||phase==='requested'||!usable?'loading':returning?'returning':offset||press?.locked?'inspecting':'ready';
   const reset=usable&&offset,signature=`${state}:${usable}:${reset}`;if(signature===row.published)continue;row.published=signature;
   const text={loading:'Preparing 3D view.',ready:'3D view follows scrolling.',inspecting:'Inspecting 3D view.',returning:'Returning to current scroll view.',paused:'Motion paused · original view.',static:'Original source view.'}[state];
   publisher.text(row.state,text);publisher.attribute(row.state,'data-project-model-availability',state);publisher.attribute(row.target,'data-project-model-availability',state);publisher.attribute(row.target,'aria-disabled',usable?null:'true');publisher.attribute(row.target,'aria-describedby',[row.state?.id,usable?row.help?.id:null].filter(Boolean).join(' ')||null);publisher.attribute(row.help,'hidden',usable?null:'');publisher.attribute(row.reset,'hidden',reset?null:'');
  }
 }
 const returnToChapter=reason=>{closeGesture(reason,true);publishInspection();schedule();};
 const ownReset=node=>{const button=node?.closest?.('[data-project-model-reset]');return button&&inspectionNodes.get(chapter)?.reset===button?button:null;};
 const ownTarget=node=>{const target=node?.closest?.('[data-project-model-target]');return target&&inspectionNodes.get(chapter)?.target===target?target:null;};
 const surfaceFor=event=>event.target.closest?.('[data-project-model-control]')??host;
 listen(doc,'pointerdown',event=>{
  if(!canInspect()||event.button!==0||event.isPrimary===false||press||event.target.closest?.(BLOCKED)||!resource.hitTest(event.clientX,event.clientY))return;
  press={id:++gestureSequence,pointerId:event.pointerId,surface:surfaceFor(event),x:event.clientX,y:event.clientY,azimuth:target.azimuth,elevation:target.elevation,touch:event.pointerType==='touch',locked:false};gestures.push({id:press.id,status:'requested'});if(gestures.length>32)gestures.shift();
 });
 listen(doc,'pointermove',event=>{
  const current=press;if(!current||current.pointerId!==event.pointerId)return;
  const dx=event.clientX-current.x,dy=event.clientY-current.y;
  if(!current.locked){if(Math.hypot(dx,dy)<(current.touch?8:4))return;if(current.touch&&Math.abs(dy)>Math.abs(dx)){closeGesture('native-scroll',true);schedule();return;}current.locked=true;current.surface.setPointerCapture?.(event.pointerId);}
  event.preventDefault();target={azimuth:clamp(current.azimuth-dx*.004,-.9,.9),elevation:clamp(current.elevation+dy*.003,-.4,.5)};settled=false;schedule();
 },{passive:false});
 for(const type of ['pointerup','pointercancel','lostpointercapture'])listen(doc,type,event=>{if(press?.pointerId===event.pointerId){closeGesture(type==='pointerup'?'released':type,type!=='pointerup');schedule();}});
 listen(doc,'keydown',event=>{
  if(!canInspect()||event.defaultPrevented||event.isComposing||event.altKey||event.ctrlKey||event.metaKey||event.target.closest?.(BLOCKED)||!ownTarget(event.target))return;
  const change={ArrowLeft:{azimuth:.12},ArrowRight:{azimuth:-.12},ArrowUp:{elevation:-.09},ArrowDown:{elevation:.09}}[event.key];
  if(change){event.preventDefault();for(const [key,delta]of Object.entries(change))target[key]=clamp(target[key]+delta,...(key==='azimuth'?[-.9,.9]:[-.4,.5]));settled=false;schedule();}
  else if(['Escape','Home'].includes(event.key)){event.preventDefault();returnToChapter('keyboard-return');}
 });
 listen(doc,'click',event=>{if(canInspect()&&ownReset(event.target)){event.preventDefault();returnToChapter('control-return');}});
 listen(win,'blur',()=>{closeGesture('blur',true);schedule();});
 listen(doc.documentElement,'pointerleave',()=>{if(press){closeGesture('pointer-left',true);schedule();}});
 listen(root,'focusout',event=>{if((ownTarget(event.target)||ownReset(event.target))&&!ownTarget(event.relatedTarget)&&!ownReset(event.relatedTarget))returnToChapter('focus-left');});
 lifecycle.resize(size.width,size.height);updatePolicy();announce();
 const sharedFacts=()=>sharedStage?{...sharedStage,history:[...(sharedStage.history??[])]}:null;
 const motionFacts=()=>{
  if(!externalStage)return{...motion,history:[...motion.history]};
  const shared=sharedFacts();if(!shared)return null;
  // The historical scene inspector describes model participation. Documentary
  // source motion lives in sharedStage/backdrop and does not make a model held.
  return{...shared,...(shared.kind!=='model'?{chapter,mode:'absent',transition:null,settled:true,pose:outside(1)}:{}),history:shared.history.filter(fact=>fact.key?.startsWith('model:'))};
 };
 return{
  setReading(next,seconds=0){if(disposed)return;reading=next;if(Number.isFinite(seconds))activeSeconds=seconds;},
  measure(width,height){if(disposed)return;size={width,height};lifecycle.resize(width,height);},
  prepare(next){
   if(disposed||!model.chapters.includes(next))return false;
   if(preparedChapter===next&&paintedChapter===next&&resource?.inspect().successfulPaint)return true;
   if(preparedChapter!==next){const retained=!!resource&&model.chapters.includes(preparedChapter??chapter);preparedChapter=next;closeGesture('source-change',!retained);}
   if(arrivalStatic){if(posterFailed)return false;if(!poster||poster.complete&&poster.naturalWidth){stopPosterDeadline();return true;}posterRequested=true;armPosterDeadline();return false;}
   if(!resource||lifecycle.inspect().phase!=='ready')return false;
   const presentation=cameraPresentation(next),key=JSON.stringify(presentation);
   if(key!==lastPaint)try{resource.present(presentation);if(!resource.inspect().successfulPaint)throw Error('Project model draw unavailable');lastPaint=key;paintedChapter=next;}catch(error){lifecycle.fail(error?.message||'render-unavailable');return false;}
   return paintedChapter===next&&!!resource?.inspect().successfulPaint;
  },
  publish({dt=0,resumed=false,stage=null}={}){
   if(disposed)return false;updatePolicy();
   if(externalStage)sharedStage=stage;syncPosterDeadline();
   const next=root.dataset.projectActiveChapter??'overview';if(next!==chapter){const retained=!!resource&&model.chapters.includes(chapter)&&model.chapters.includes(next);chapter=next;closeGesture('chapter-change',!retained);}
   const p=policy(),snap=arrivalStatic||p.paused||p.reduced||p.saveData||resumed;
   if(p.reduced||p.saveData||arrivalStatic){cameraRecovery=null;cameraWasPaused=false;}
   if(p.reduced||p.saveData||arrivalStatic)handheldGain=0;
   else if(!p.paused&&!p.hidden&&!suspended){const goal=doc.activeElement?.closest?.(BLOCKED)?0:1,step=Math.min(.1,Math.max(0,resumed?0:dt))/.2;handheldGain=goal>handheldGain?Math.min(goal,handheldGain+step):Math.max(goal,handheldGain-step);}
   if(detailRecovery&&!p.paused&&!p.hidden&&!suspended&&!resumed){detailRecovery.elapsed=Math.min(.35,detailRecovery.elapsed+Math.min(.1,Math.max(0,dt)));if(detailRecovery.elapsed>=.35)detailRecovery=null;}
   if(cameraRecovery&&!p.paused&&!p.hidden&&!suspended&&!resumed){cameraRecovery.elapsed=Math.min(.35,cameraRecovery.elapsed+Math.min(.1,Math.max(0,dt)));if(cameraRecovery.elapsed>=.35)cameraRecovery=null;}
   if(snap||dt>1){value={...target};velocity=rest();settled=true;}
   else{const decay=Math.exp(-16*dt);settled=true;for(const key of Object.keys(value)){const distance=value[key]-target[key],coefficient=velocity[key]+16*distance;value[key]=target[key]+(distance+coefficient*dt)*decay;velocity[key]=(velocity[key]-16*coefficient*dt)*decay;if(Math.abs(value[key]-target[key])<.00001&&Math.abs(velocity[key])<.0001){value[key]=target[key];velocity[key]=0;}else settled=false;}}
   const advance=seconds=>{if(!externalStage)advanceProjectStudyStageMotion(motion,seconds,{chapter,chapters,modelChapters:model.chapters,readyChapter:paintedChapter,snap,resumed});};advance(dt);
   const displayed=activeMotion();
   if(resource&&displayed&&(!externalStage||displayed.kind==='model')&&model.chapters.includes(displayed.chapter)){
    const presentation=cameraPresentation(displayed.chapter),key=JSON.stringify(presentation);
    if(key!==lastPaint)try{resource.present(presentation);if(!resource.inspect().successfulPaint)throw Error('Project model draw unavailable');lastPaint=key;paintedChapter=displayed.chapter;advance(0);}catch(error){lifecycle.fail(error?.message||'render-unavailable');}
   }
   if(!externalStage){publisher.attribute(host,'data-project-model-active',model.chapters.includes(motion.chapter)&&motion.pose.opacity>0?'':null);publisher.attribute(host,'data-project-model-mode',motion.mode);publisher.attribute(host,'data-project-model-chapter',motion.chapter);
    publisher.style(surface,'transform',`translate3d(${motion.pose.x*size.width}px,${motion.pose.y*size.height}px,0)`);publisher.style(surface,'opacity',motion.pose.opacity);}
   publishInspection();publishDetailAnnotation();
   const idleDemand=!!(cameraPath&&resource&&p.siteReady&&!arrivalStatic&&!suspended&&!p.hidden&&!p.paused&&!p.reduced&&!p.saveData&&displayed?.pose?.opacity>0&&(!externalStage||displayed.kind==='model')&&!doc.activeElement?.closest?.(BLOCKED));
   return idleDemand||(detailRecovery||handheldGain>0&&!!doc.activeElement?.closest?.(BLOCKED)||!!cameraRecovery)&&!!resource&&displayed?.pose?.opacity>0&&(!externalStage||displayed.kind==='model')&&!p.paused&&!p.hidden&&!suspended||!settled||!externalStage&&!!motion.transition;
  },
  suspend(reason){if(disposed)return;suspended=true;closeGesture(reason,true);cancelProjectStudyStageMotion(motion,reason);updatePolicy();},
  resume(){if(disposed)return;suspended=false;updatePolicy();},
  inspect:()=>({...lifecycle.inspect(),externalStage,arrivalStatic,staticReason,posterFailed,posterFailureReason,posterPreparation:{requested:posterRequested,pending:posterTimer!==null,remainingMs:posterTimer===null?posterRemaining:Math.max(0,posterRemaining-(posterClock()-posterStarted)),reason:posterFailureReason},chapter,paintedChapter,preparedChapter,inspection:{available:canInspect(),states:Object.fromEntries([...inspectionNodes].map(([key,row])=>[key,row.published.split(':')[0]]))},motion:motionFacts(),sharedStage:externalStage?sharedFacts():null,camera:{target:{...target},value:{...value},settled,intent:lastCameraIntent,reading,activeSeconds,path:!!cameraPath,handheld:lastHandheld,handheldGain,recovering:!!cameraRecovery,...(dotDetail?{detail:{weight:lastCameraIntent?.detailWeight??0,inspecting:detailInspecting,recovering:!!detailRecovery}}:{})},gestures:[...gestures],gesture:press?{id:press.id,locked:press.locked}:null,events:events.inspect(),disposed}),
  dispose(){if(disposed)return;cameraRecovery=null;detailRecovery=null;if(detailAnnotation){publisher.attribute(detailAnnotation,'hidden','');publisher.attribute(detailAnnotation,'data-dot-detail-beat',null);}cameraWasPaused=false;closeGesture('disposed',true);cancelProjectStudyStageMotion(motion,'disposed');stopPosterDeadline();disposed=true;lifecycle.dispose();readiness.release();scope.dispose();events.dispose();for(const row of inspectionNodes.values()){publisher.text(row.state,'Original source view.');publisher.attribute(row.state,'data-project-model-availability',null);publisher.attribute(row.target,'data-project-model-availability',null);publisher.attribute(row.target,'aria-disabled',null);publisher.attribute(row.target,'aria-describedby',row.originalDescription);publisher.attribute(row.help,'hidden','');publisher.attribute(row.reset,'hidden','');}for(const name of ['phase','reason','rendering','poster-ready','controls-layout',...(!externalStage?['active','mode','chapter']:[])])publisher.attribute(host,'data-project-model-'+name,null);if(!externalStage){publisher.style(surface,'transform','');publisher.style(surface,'opacity','');}},
 };
}
