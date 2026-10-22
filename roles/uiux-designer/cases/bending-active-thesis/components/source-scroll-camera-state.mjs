import {BENDING_SCROLL_ORIENTATION,sampleSourceScrollOrientation} from './source-scroll-orientation.mjs';
const chapters=['overview','form','system','pattern','make','validation','credits'];
const neutral=()=>({azimuthOffsetDeg:0,elevationOffsetDeg:0});
export function createSourceScrollCameraState(){return {orientation:neutral(),initialized:false,paused:false,correction:null};}
/** Stateful only in the existing Director's ownership. No timer or DOM access. */
export function advanceSourceScrollCamera(state,{nativeU,presentedChapter,dt,paused=false,systemReduced=false,resumed=false}={}){
 const index=chapters.indexOf(presentedChapter);
 if(!state?.orientation||index<0||!Number.isFinite(nativeU)||!Number.isFinite(dt)||dt<0||![paused,systemReduced,resumed].every(v=>typeof v==='boolean'))throw RangeError('Valid owner state, chapter, finite progress/delta and boolean policies required');
 // Canvas .62vh and reading .45vh probes intentionally differ. The first
 // four chapters share one continuous source passage, not four camera clamps.
 const u=index<=3?Math.max(0,Math.min(4/7,nativeU)):Math.max(6/7,Math.min(1,nativeU));
 const desired=index===4||index===5?neutral():sampleSourceScrollOrientation(BENDING_SCROLL_ORIENTATION,u,{reducedMotion:systemReduced});
 const snapshot=()=>({orientation:{...state.orientation},needsFrame:!!state.correction&&!state.paused&&!systemReduced});
 if(systemReduced){state.orientation=desired;state.correction=null;state.paused=paused;state.initialized=true;return snapshot();}
 if(!state.initialized){state.orientation=desired;state.initialized=true;state.paused=paused;return snapshot();}
 if(paused){state.paused=true;state.correction=null;return snapshot();}
 const justUnpaused=state.paused;
 if(justUnpaused){state.correction={azimuthOffsetDeg:state.orientation.azimuthOffsetDeg,elevationOffsetDeg:state.orientation.elevationOffsetDeg,elapsed:0};}
 state.paused=false;
 if(state.correction){
  const c=state.correction;c.elapsed=Math.min(.35,c.elapsed+(resumed||justUnpaused?0:dt));
  const t=c.elapsed/.35,w=t*t*(3-2*t);
  state.orientation={azimuthOffsetDeg:c.azimuthOffsetDeg+(desired.azimuthOffsetDeg-c.azimuthOffsetDeg)*w,elevationOffsetDeg:c.elevationOffsetDeg+(desired.elevationOffsetDeg-c.elevationOffsetDeg)*w};
  if(c.elapsed>=.35){state.orientation=desired;state.correction=null;}
 }else state.orientation=desired;
 return snapshot();
}
