import {CANVAS_ENTRY_SECONDS,CANVAS_EXIT_SECONDS} from '../../components/canvas-motion.mjs';

const outside=direction=>direction>0?{x:-1.08,y:-.05,opacity:0}:{x:.22,y:.035,opacity:0};
const held=()=>({x:0,y:0,opacity:1});
const smooth=value=>{const t=Math.max(0,Math.min(1,value));return t*t*t*(10+t*(-15+6*t));};
function fact(state,status,reason){
 if(!state.request)return;
 state.history.push({id:state.request.id,key:state.request.key,chapter:state.request.chapter,status,...(reason?{reason}:{})});
 // Evict whole old transactions so retained diagnostics cannot contain an
 // orphan terminal when the next source is still pending.
 while(state.history.length>96){const oldest=state.history[0].id;state.history=state.history.filter(item=>item.id!==oldest);}
}
function finish(state,reason){
 if(!state.request||state.request.terminal)return;
 state.request.terminal=state.request.failure?'failed':'completed';fact(state,state.request.terminal,state.request.failure||reason);
}
function begin(state,kind){
 state.transition={kind,elapsed:0,duration:kind==='entry'?CANVAS_ENTRY_SECONDS:CANVAS_EXIT_SECONDS,from:{...state.pose},to:kind==='entry'?held():outside(state.request.direction)};
 state.mode=kind;state.settled=false;
}

/** Actual Bending/XR finite outer-surface passage, with a source identity rather
 * than a semantic chapter as its subject. It owns no DOM/resource/clock. */
export function createProjectStudyBackdropMotion(){
 return{key:null,chapter:null,mode:'absent',pose:outside(1),transition:null,request:null,sequence:0,history:[],settled:true};
}
export function cancelProjectStudyBackdropMotion(state,reason='disposed'){
 if(state.request&&!state.request.terminal){state.request.terminal='cancelled';fact(state,'cancelled',reason);}
 state.request=null;state.transition=null;state.settled=true;
}
export function failProjectStudyBackdropMotion(state,key,reason){
 if(state.request?.key!==key||state.request.terminal)return;
 state.request.failure=reason;state.request.terminal='failed';fact(state,'failed',reason);state.transition=null;state.settled=true;
}
export function advanceProjectStudyBackdropMotion(state,dt,{key,chapter,direction=1,ready=false,failure='',snap=false,resumed=false}={}){
 if(!key||!chapter||!Number.isFinite(dt)||dt<0)throw RangeError('An actual source identity, chapter and finite active seconds are required');
 if(state.request?.key!==key){
  if(state.request&&!state.request.terminal){state.request.terminal='cancelled';fact(state,'cancelled','superseded');}
  state.request={id:++state.sequence,key,chapter,direction:Math.sign(direction)||1,terminal:null,failure:''};fact(state,'requested');
 }
 const request=state.request;
  // A source may span several reading chapters. Its identity owns the outer
  // passage; a chapter/view update never sends the same source outside again.
  request.chapter=chapter;
  if(state.key===key)state.chapter=chapter;
 if(failure)request.failure=failure;
 const reconcile=()=>{
  if(state.key!==request.key){
   if(state.pose.opacity>0&&!snap){if(state.transition?.kind!=='exit')begin(state,'exit');return;}
   state.key=request.key;state.chapter=request.chapter;state.pose=outside(-request.direction);state.transition=null;
  }
  if(!ready){state.mode='waiting';state.transition=null;state.settled=false;return;}
  if(snap){state.pose=held();state.transition=null;state.mode='hold';state.settled=true;finish(state,'static');}
  else if(state.pose.opacity!==1||state.pose.x!==0){if(state.transition?.kind!=='entry')begin(state,'entry');}
  else{state.transition=null;state.mode='hold';state.settled=true;finish(state);}
 };
 reconcile();let remaining=resumed?0:dt;
 while(state.transition&&remaining>0){
  const passage=state.transition,step=Math.min(remaining,passage.duration-passage.elapsed);
  passage.elapsed=Math.min(passage.duration,passage.elapsed+step);remaining-=step;
  if(passage.duration-passage.elapsed<1e-10)passage.elapsed=passage.duration;
  const p=smooth(passage.elapsed/passage.duration);
  for(const name of ['x','y','opacity'])state.pose[name]=passage.from[name]+(passage.to[name]-passage.from[name])*p;
  if(passage.elapsed===passage.duration){state.pose={...passage.to};state.transition=null;reconcile();}
 }
 return state;
}
