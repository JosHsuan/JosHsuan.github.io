import {createSceneRecovery} from '../../components/scene-recovery.mjs';

/** Activation policy and best-effort session lease; no timer or renderer ownership. */
export function createLifecycleManager({events,onSystemReduced,onHydrated,onAutomaticEnable,onPolicy=()=>{}}){
 let recovery=null;
 function initialize({window:windowTarget,document:documentTarget,navigator:navigatorTarget,readStorage}){
  const scope=events.createScope('preferences'),reduced=windowTarget.matchMedia('(prefers-reduced-motion: reduce)');
  const update=()=>onSystemReduced(reduced.matches);
  update();onHydrated(true);
  let storage;try{storage=readStorage();}catch{storage=null;}
  recovery=createSceneRecovery(storage);
  documentTarget.documentElement.toggleAttribute('data-scene-recovery',recovery.recovery);
  const automatic=!navigatorTarget.connection?.saveData&&!reduced.matches&&!recovery.recovery;
  onPolicy(automatic?'pending':'deferred');
  if(automatic)onAutomaticEnable();
  events.listen(scope,reduced,'change',update);
  return()=>scope.dispose();
 }
 function connectLease(windowTarget,{enabled,failed}){
  if(!enabled||failed)return()=>{};
  const scope=events.createScope('scene-lease');recovery?.begin();
  events.listen(scope,windowTarget,'pagehide',()=>recovery?.end());
  events.listen(scope,windowTarget,'pageshow',()=>recovery?.begin());
  return()=>scope.dispose();
 }
 return{initialize,connectLease,fail:()=>recovery?.fail(),heartbeat:()=>recovery?.heartbeat(),
  inspect:()=>({recovery:recovery?.recovery??false}),};
}
