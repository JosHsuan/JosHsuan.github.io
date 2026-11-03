import {createHomeShowcaseShotPlan} from './HomeShowcaseShots.mjs';
const smooth=v=>{const t=Math.max(0,Math.min(1,v));return t*t*(3-2*t);};
/** A single sequential renderer, with at most one live context/source. The
 * current browser cache retains pinned transfer bytes; each acquisition checks
 * them again. This bounds GPU residency even for the largest architecture. */
const acquireScene=async options=>(await import('../../components/project-study-scene.mjs')).acquireProjectStudyScene(options);
export function createHomeShowcasePresenter({root,host,models,publisher,schedule,acquire=acquireScene}){
 let disposed=false,resource=null,controller=null,index=0,time=0,elapsed=0,lastDraw=-1,phase='loading',generation=0;
 let width=1,height=1,visible=true,loading=false,failures=0,loadingAt=0,failureReason='',plan=null;
 const surface=host.querySelector('[data-home-showcase-surface]');
 const release=()=>{const previous=resource;resource=null;try{previous?.dispose();}catch(error){failureReason=String(error?.message??'source-release-failed').slice(0,180);}};
 const fail=error=>{
  generation++;controller?.abort();loading=false;phase='failed';failures++;
  failureReason=String(error?.message??'source-render-failed').slice(0,180);release();
  publisher.attribute(host,'data-showcase-phase',phase);schedule();
 };
 async function load(){
  if(disposed||loading||!models.length)return;
  loading=true;loadingAt=elapsed;const current=++generation;controller?.abort();controller=new AbortController();
  release();phase='loading';publisher.attribute(host,'data-showcase-phase',phase);
  try{
   const item=models[index];plan=createHomeShowcaseShotPlan(item);
   const next=await acquire({host:surface,model:item.model,signal:controller.signal,onFailure:error=>{if(disposed||current!==generation)return;fail(error);},presentation:'showcase'});
   if(disposed||current!==generation){next.dispose();return;}
   resource=next;time=0;lastDraw=-1;
   resource.present({chapter:item.model.chapters[0],showcaseShot:plan.sample({seconds:0,aspect:width/height}),activeSeconds:elapsed});
   resource.resize(width,height);
   if(!resource.inspect().successfulPaint)throw Error('showcase-first-draw-incomplete');
   phase='ready';failures=0;failureReason='';
   publisher.attribute(host,'data-showcase-project',item.id);publisher.attribute(host,'data-showcase-phase',phase);
  }catch(error){if(!disposed&&current===generation)fail(error);}
  finally{if(current===generation){loading=false;schedule();}}
 }
 return{
  measure({viewportHeight}){
   const win=host.ownerDocument.defaultView;width=win.innerWidth;height=viewportHeight;
   try{resource?.resize(width,height,{showcaseShot:plan.sample({seconds:time,aspect:width/height}),activeSeconds:elapsed});}catch(error){fail(error);}
  },
  publish({dt=0,docY=0,ready=false,suspended=false}){
   if(disposed)return false;visible=docY<root.offsetHeight;
   if(suspended||!ready||!visible)return false;
   // Active wall time comes from the existing scheduler. Slow delivery changes
   // sampling frequency, never the authored shot duration; suspension rebases it.
   const delta=Math.max(0,Number.isFinite(dt)?dt:0);elapsed+=delta;
   // A stalled optional model cannot retain a pending acquisition forever.
   // The same active-time clock supplies this deadline; no timer is introduced.
   if(loading&&elapsed-loadingAt>=15)fail(new Error('source-acquisition-timeout'));
   if(!resource&&!loading&&phase!=='failed')load();
   if(phase==='failed'){if(failures<models.length){index=(index+1)%models.length;phase='loading';load();}return loading;}
   if(!resource)return loading;
   time+=delta;
   const duration=plan.duration,item=models[index];
   const opacity=smooth(time/1.2)*smooth((duration-time)/1.2);
   publisher.style(surface,'opacity',opacity.toFixed(4));
   // Cinematic light/lens motion is capped at 24 draws/s, on the site clock.
   // Native scrolling and glass keep their own smoother presentation cadence.
   if(elapsed-lastDraw>=1/24){
    try{resource.present({chapter:item.model.chapters[0],showcaseShot:plan.sample({seconds:time,aspect:width/height}),activeSeconds:elapsed});lastDraw=elapsed;}
    catch(error){fail(error);return true;}
   }
   if(time>=duration){index=(index+1)%models.length;phase='loading';load();}
   return true;
  },
  inspect:()=>({kind:'project-showcase',index,project:models[index]?.id,time,duration:plan?.duration,shot:plan?.sample({seconds:time,aspect:width/height}).shot,phase,failureReason,visible,canvasCount:resource?1:0,resource:resource?.inspect(),disposed}),
  dispose(){if(disposed)return;disposed=true;generation++;controller?.abort();release();},
 };
}
