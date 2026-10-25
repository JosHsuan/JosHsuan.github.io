// Host-side acceptance accounting only. No timers, races, browser calls or cancellation.
// An in-flight operation is bounded by the runner, not preempted by this helper.
export function createJourneyPhaseBudget(now=()=>performance.now()) {
 const names=['entry-pause-capture','native-reading-resume'],limitMs=60000,rows=[];
 let active=null,terminal=false,lastNow=-Infinity;
 const clock=()=>{const value=now();if(!Number.isFinite(value)||value<lastNow)throw Error('Journey phase clock must be finite and monotonic');lastNow=value;return value;};
 const running=()=>{if(terminal||!active||active.status!=='running')throw Error('Journey phase is not running');return active;};
 const check=()=>{
  const row=running(),at=clock();row.observedAtMs=at;row.elapsedMs=at-row.startedAtMs;
  if(row.elapsedMs>limitMs){row.endedAtMs=at;row.status='failed';row.reason='phase-budget-exceeded';terminal=true;throw Error(`Journey phase ${row.name} exceeded ${limitMs}ms acceptance budget (${row.elapsedMs}ms); pending operations are not preempted by this check`);}
  return at;
 };
 return {
  start(name){
   if(terminal||active||rows.length>=names.length||name!==names[rows.length])throw Error('Journey phases must start once in the declared order');
   const at=clock();active={name,limitMs,startedAtMs:at,observedAtMs:at,elapsedMs:0,status:'running'};rows.push(active);
  },
  check,
  finish(){const at=check();active.endedAtMs=at;active.status='completed';active=null;if(rows.length===names.length)terminal=true;},
  // Failure accounting must never replace the already-caught primary exception.
  fail(error){
   try{if(active?.status==='running'){try{const at=clock();active.observedAtMs=at;active.endedAtMs=at;active.elapsedMs=at-active.startedAtMs;}catch(clockError){active.clockError=String(clockError.message).slice(0,240);}active.status='failed';active.reason='operation-failed';active.error=String(error?.message??error).slice(0,240);}}catch{/* Preserve the primary error even if diagnostic formatting fails. */}
   terminal=true;
  },
  snapshot(){return{outerRunnerLimitMs:135000,phaseLimitMs:limitMs,clock:'host performance.now',semantics:'Sequential completed-phase acceptance, not 60s cancellation; pending operations remain bounded by the fixed 135s runner. Cleanup is unconditional.',phases:rows.map(row=>({...row}))};},
 };
}
