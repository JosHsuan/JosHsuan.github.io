import {CANVAS_ENTRY_SECONDS,CANVAS_EXIT_SECONDS} from '../../components/canvas-motion.mjs';

export const XR_SCENE_CHAPTERS=Object.freeze(['overview','context','method','adapt','assemble','join','making','credits']);
const outside=direction=>direction>0?{x:-1.08,y:-.05,opacity:0}:{x:.22,y:.035,opacity:0};
const held=()=>({x:0,y:0,opacity:1});
const smooth=value=>{const t=Math.max(0,Math.min(1,value));return t*t*t*(10+t*(-15+6*t));};
export const xrStageSubject=chapter=>chapter==='context'?'workspace':chapter==='method'?'model':['adapt','assemble','join'].includes(chapter)?'phone':'none';
const absent=chapter=>xrStageSubject(chapter)==='none';
function fact(state,status,reason){
 const request=state.request;if(!request)return;
 state.history.push({id:request.id,chapter:request.chapter,status,...(reason?{reason}:{})});
 if(state.history.length>64)state.history.shift();
}
function complete(state,reason){if(state.request&&!state.request.completed){state.request.completed=true;fact(state,'completed',reason);}}
function transition(state,kind,direction){
 state.transition={kind,elapsed:0,duration:kind==='entry'?CANVAS_ENTRY_SECONDS:CANVAS_EXIT_SECONDS,from:{...state.pose},to:kind==='entry'?held():outside(direction)};
 state.mode=kind;state.settled=false;
}
function reconcile(state,readyChapter){
 const request=state.request;
 if(state.chapter!==request.chapter){
  const sameSubject=xrStageSubject(state.chapter)===xrStageSubject(request.chapter);
  if(state.pose.opacity>0&&!sameSubject){if(state.transition?.kind!=='exit')transition(state,'exit',request.direction);return;}
  state.chapter=request.chapter;
  if(!sameSubject){state.pose=outside(-request.direction);state.transition=null;}
 }
 if(absent(state.chapter)){state.pose=outside(request.direction);state.transition=null;state.mode='absent';state.settled=true;complete(state);}
 else if(readyChapter!==state.chapter){state.transition=null;state.mode='waiting';state.settled=false;}
 else if(state.pose.opacity!==1||state.pose.x!==0){if(state.transition?.kind!=='entry')transition(state,'entry',request.direction);}
 else{state.transition=null;state.mode='hold';state.settled=true;complete(state);}
}

/** Project-local adaptation of Bending's finite scene passage. Native reading
 * selects a chapter; only the existing XR Director's active seconds move it.
 * A different subject leaves before preparation; consecutive phone recordings
 * retain the same outer surface while their next native source prepares. This module
 * owns no DOM, resource, camera, timer, observer or animation frame.
 */
export function createXRStageMotion(){
 return{chapter:'overview',requestedChapter:'overview',pose:outside(1),mode:'absent',settled:true,visible:false,
  initialized:false,transition:null,request:null,sequence:0,history:[]};
}
export function advanceXRStageMotion(state,dt,{chapter,readyChapter=null,reduced=false,resumed=false}={}){
 if(!XR_SCENE_CHAPTERS.includes(chapter)||!Number.isFinite(dt)||dt<0)throw RangeError('A known XR chapter and finite nonnegative active seconds are required');
 if(state.request?.chapter!==chapter){
  if(state.request&&!state.request.completed)fact(state,'cancelled','superseded');
  const from=XR_SCENE_CHAPTERS.indexOf(state.requestedChapter),to=XR_SCENE_CHAPTERS.indexOf(chapter);
  state.requestedChapter=chapter;state.request={id:++state.sequence,chapter,direction:Math.sign(to-from)||1,completed:false};
  fact(state,'requested');
  if(state.transition?.kind==='entry'&&state.chapter!==chapter)state.transition=null;
 }
 state.initialized=true;
 if(reduced){
  state.chapter=chapter;state.transition=null;
  state.pose=absent(chapter)?outside(state.request.direction):held();state.mode=absent(chapter)?'absent':'hold';state.settled=true;complete(state,'static');
 }else{
  reconcile(state,readyChapter);
  let remaining=resumed?0:dt;
  while(state.transition&&remaining>0){
   const current=state.transition,step=Math.min(remaining,current.duration-current.elapsed);
   current.elapsed=Math.min(current.duration,current.elapsed+step);remaining-=step;
   if(current.duration-current.elapsed<1e-10)current.elapsed=current.duration;
   const p=smooth(current.elapsed/current.duration);
   for(const key of ['x','y','opacity'])state.pose[key]=current.from[key]+(current.to[key]-current.from[key])*p;
   if(current.elapsed===current.duration){state.pose={...current.to};state.transition=null;reconcile(state,readyChapter);}
  }
 }
 state.visible=state.pose.opacity>0&&state.pose.x<1&&state.pose.x+1>0;
 return state;
}
export function cancelXRStageMotion(state,reason='disposed'){
 if(state.request&&!state.request.completed)fact(state,'cancelled',reason);
 state.request=null;state.transition=null;state.settled=true;
}
