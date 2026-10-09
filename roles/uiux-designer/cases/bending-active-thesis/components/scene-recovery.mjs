// A best-effort session lease, not a crash detector. A process termination may
// bypass pagehide. In that case a recent unfinished lease suppresses automatic
// WebGL startup on reload; the owner can still explicitly enable the scene.
export const SCENE_RECOVERY_KEY='thesis-scene-session-v1';
const WINDOW_MS=30*60*1000;
export function createSceneRecovery(storage,now=()=>Date.now()) {
  const read=()=>{try{return JSON.parse(storage.getItem(SCENE_RECOVERY_KEY));}catch{return null;}};
  const write=value=>{try{storage.setItem(SCENE_RECOVERY_KEY,JSON.stringify(value));}catch{/* Reading never depends on storage. */}};
  const previous=read();let lastWrite=-Infinity,failed=previous?.status==='failed'&&Number.isFinite(previous.at);
  // Confirmed failures stay gated for this tab's session until explicit begin.
  // Only an uncertain interrupted active lease has a freshness window.
  const recovery=failed||(!!previous&&previous.status==='active'&&Number.isFinite(previous.at)&&now()-previous.at>=0&&now()-previous.at<WINDOW_MS);
  return {
    recovery,
    begin(){failed=false;lastWrite=now();write({status:'active',at:lastWrite});},
    heartbeat(){if(!failed&&now()-lastWrite>=30000)this.begin();},
    end(){if(!failed)write({status:'ended',at:now()});},
    fail(){failed=true;lastWrite=now();write({status:'failed',at:lastWrite});},
  };
}
