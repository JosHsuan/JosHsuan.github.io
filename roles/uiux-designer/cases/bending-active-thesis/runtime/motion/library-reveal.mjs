export const LIBRARY_TRACE_COUNT=11;
export const LIBRARY_TRACE_SECONDS=.28;
export const LIBRARY_TRACE_GAP=.04;
export const LIBRARY_REVEAL_SECONDS=LIBRARY_TRACE_COUNT*LIBRARY_TRACE_SECONDS+(LIBRARY_TRACE_COUNT-1)*LIBRARY_TRACE_GAP;

const clamp=value=>Math.min(1,Math.max(0,value));
const smooth=value=>value*value*(3-2*value);
const fact=(state,status,reason)=>({id:state.id,kind:'library',status,reason});

/** Only the caller supplies active elapsed time; source geometry is never sampled here. */
export function createLibraryReveal(){return{status:'waiting',elapsed:0,id:0};}

export function cancelLibraryReveal(state,reason){
 if(state.status!=='playing')return[];
 state.status='cancelled';
 return[fact(state,'cancelled',reason)];
}

export function advanceLibraryReveal(state,dt,{visible,onScreen=visible,reduced=false,resumed=false,hidden=false}={}){
 if(hidden)return[];
 const events=[];
 if(state.status==='playing'&&!onScreen)return cancelLibraryReveal(state,'offscreen');
 if((state.status==='waiting'||state.status==='cancelled')&&visible){
  state.id++;state.elapsed=0;state.status='playing';
  events.push(fact(state,'requested','visible'));
 }else if(state.status==='playing'&&!resumed){
  state.elapsed+=Number.isFinite(dt)?Math.max(0,dt):0;
 }
 if(state.status==='playing'&&(reduced||state.elapsed+1e-9>=LIBRARY_REVEAL_SECONDS)){
  state.status='completed';state.elapsed=LIBRARY_REVEAL_SECONDS;
  events.push(fact(state,'completed',reduced?'reduced':'finished'));
 }
 return events;
}

export function sampleLibraryReveal(state,{reduced=false}={}){
 if(reduced||state.status==='completed'||state.status==='cancelled')return Array(LIBRARY_TRACE_COUNT).fill(1);
 return Array.from({length:LIBRARY_TRACE_COUNT},(_,index)=>smooth(clamp((state.elapsed-index*(LIBRARY_TRACE_SECONDS+LIBRARY_TRACE_GAP))/LIBRARY_TRACE_SECONDS)));
}
