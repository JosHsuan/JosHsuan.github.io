export const ENTRY_REVEAL_SECONDS=.72;
export const ENTRY_DEADLINE_SECONDS=30;
export function createEntryMotion(){return{phase:'preparing',time:0,elapsed:0,reveal:0,ready:false,events:['preparing']};}
export function advanceEntryMotion(state,dt,{ready=false,reduced=false,resumed=false,hidden=false}={}){
 if(!Number.isFinite(dt)||dt<0)throw RangeError('Entry delta must be finite nonnegative seconds');
 state.events=[];
 if(state.phase==='entered'||state.phase==='cancelled')return false;
 if(hidden||resumed)return true;
 const starting=ready&&!state.ready,active=dt;
 state.time+=active;
 if(ready&&!state.ready){state.ready=true;state.phase='revealing';state.events.push('ready','revealing');}
 if(state.ready){
  state.elapsed+=starting?0:active;state.reveal=reduced?1:Math.min(1,state.elapsed/ENTRY_REVEAL_SECONDS);
  if(state.reveal===1){state.phase='entered';state.events.push('entered');}
 }
 return state.phase!=='entered';
}
