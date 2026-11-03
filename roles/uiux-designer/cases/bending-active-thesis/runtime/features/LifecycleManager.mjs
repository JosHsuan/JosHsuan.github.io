import {createSceneRecovery} from '../../components/scene-recovery.mjs';

/** Activation policy and best-effort session lease; no timer or renderer ownership. */
export function createLifecycleManager({events,onSystemReduced,onHydrated,onAutomaticEnable,onPolicy=()=>{}}){
 let recovery=null;
 function initialize({document:documentTarget,readStorage}){
  const scope=events.createScope('preferences');
  onSystemReduced(false);onHydrated(true);
  let storage;try{storage=readStorage();}catch{storage=null;}
  recovery=createSceneRecovery(storage);
  documentTarget.documentElement.toggleAttribute('data-scene-recovery',recovery.recovery);
  onPolicy('pending');onAutomaticEnable();
  return()=>scope.dispose();
 }
 function connectLease(windowTarget,{enabled,failed}){
  if(!enabled||failed)return()=>{};
  const scope=events.createScope('scene-lease');recovery?.begin();
  events.listen(scope,windowTarget,'pagehide',()=>recovery?.end());
  events.listen(scope,windowTarget,'pageshow',()=>recovery?.resume());
  return()=>scope.dispose();
 }
 return{initialize,connectLease,fail:()=>recovery?.fail(),heartbeat:()=>recovery?.heartbeat(),
  inspect:()=>({recovery:recovery?.recovery??false}),};
}
