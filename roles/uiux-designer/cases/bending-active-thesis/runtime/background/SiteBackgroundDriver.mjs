import {EventManager} from '../core/EventManager.ts';
import {DOMPresenter} from '../presentation/DOMPresenter.ts';
import {createFrameScheduler} from '../../components/runtime-scheduler.mjs';
import {createChapterPlayback,advanceChapterPlayback,sampleChapterPlayback} from '../../components/chapter-playback.mjs';
import {sampleChapterScene} from '../../components/chapter-scene-score.mjs';

/** Actual Bending Layer 1 score and renderer, without any project runtime,
 * model, source selection, camera, HDR, WebGL or scene compositor. Native full
 * document navigation releases this lifetime; BFCache retains and suspends it.
 */
export function createSiteBackgroundDriver({window:win,document:doc,runtime,canvas,backdrop}={}) {
  const events=new EventManager(),scope=events.createScope('global-background');
  const dom=new DOMPresenter(),publisher=dom.forOwner('global-background');
  const binding=runtime.acquire({owner:'site',canvas,backdrop,publisher});
  const playback=createChapterPlayback('overview');
  const reduced=win.matchMedia('(prefers-reduced-motion: reduce)');
  const fine=win.matchMedia('(hover: hover) and (pointer: fine)');
  let previous=0,resumed=true,pendingImpulse=0,touchY=null,disposed=false,frames=0;
  let pointer={x:0,y:0,active:false},size={width:win.innerWidth,height:win.innerHeight};
  let stableWidth=0,latest=null;
  const scheduler=createFrameScheduler({request:fn=>win.requestAnimationFrame(fn),cancel:id=>win.cancelAnimationFrame(id),onFrame:tick});
  scheduler.suspend('visibility',doc.hidden);
  const listen=(target,type,handler,options)=>events.listen(scope,target,type,handler,options);
  const ready=()=>['entered','failed'].includes(doc.documentElement.getAttribute('data-site-entry-state'));
  const measure=()=>{
    // Same coarse-pointer browser-chrome stability rule as the case Director.
    if(!win.matchMedia('(pointer:coarse)').matches||stableWidth!==win.innerWidth){
      stableWidth=win.innerWidth;size={width:win.innerWidth,height:win.innerHeight};
    }
  };
  function tick(now) {
    if(disposed||scheduler.suspended)return;
    const dt=previous?(now-previous)/1000:1/60;previous=now;frames++;
    const impulse=pendingImpulse;pendingImpulse=0;
    advanceChapterPlayback(playback,dt,{chapter:'overview',impulse,reducedMotion:reduced.matches,resumed,paused:!ready()});
    resumed=false;
    const score=sampleChapterPlayback(playback);
    const uv=[pointer.x/win.innerWidth,1-pointer.y/win.innerHeight];
    latest=sampleChapterScene(score,{reducedMotion:reduced.matches,aspect:size.width/size.height,pointer:{uv,active:fine.matches&&pointer.active&&!reduced.matches&&uv.every(value=>value>=0&&value<=1),strength:.35}});
    binding.present(latest,{frameTimeMs:now,paused:!ready(),hidden:doc.hidden,systemReduced:reduced.matches},size.width,size.height);
    if(score.needsFrame&&binding.inspect().ready&&!binding.inspect().failed)scheduler.schedule();
    else previous=0;
  }
  const reset=()=>{pointer={x:0,y:0,active:false};pendingImpulse=0;touchY=null;scheduler.schedule();};
  const suspend=(reason,value)=>{
    const before=scheduler.suspended;scheduler.suspend(reason,value);
    if(before===scheduler.suspended)return;
    previous=0;resumed=true;pendingImpulse=0;touchY=null;pointer={x:0,y:0,active:false};
    if(scheduler.suspended)advanceChapterPlayback(playback,0,{hidden:true});
    else{measure();scheduler.schedule();}
  };
  const visibility=()=>suspend('visibility',doc.hidden);
  const siteState=()=>{previous=0;resumed=true;scheduler.schedule();};
  const wheel=event=>{
    if(event.ctrlKey||scheduler.suspended||!ready()||reduced.matches)return;
    const delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?win.innerHeight:1);
    pendingImpulse=Math.max(-1,Math.min(1,pendingImpulse+delta/600));scheduler.schedule();
  };
  listen(win,'wheel',wheel,{passive:true});
  listen(win,'touchstart',event=>{touchY=event.touches.length===1?event.touches[0].clientY:null;},{passive:true});
  listen(win,'touchmove',event=>{
    if(touchY===null||event.touches.length!==1)return;
    const y=event.touches[0].clientY;
    if(!scheduler.suspended&&ready()&&!reduced.matches)pendingImpulse=Math.max(-1,Math.min(1,pendingImpulse+(touchY-y)/500));
    touchY=y;scheduler.schedule();
  },{passive:true});
  for(const type of ['touchend','touchcancel'])listen(win,type,()=>{touchY=null;},{passive:true});
  listen(win,'pointermove',event=>{
    if(scheduler.suspended||!['mouse','pen'].includes(event.pointerType))return;
    pointer={x:event.clientX,y:event.clientY,active:fine.matches&&!reduced.matches};scheduler.schedule();
  },{passive:true});
  listen(doc.documentElement,'pointerleave',reset);listen(win,'blur',reset);listen(fine,'change',reset);
  listen(reduced,'change',()=>{reset();previous=0;resumed=true;scheduler.schedule();});
  listen(win,'resize',()=>{measure();scheduler.schedule();},{passive:true});
  listen(doc,'visibilitychange',visibility);
  // A retained BFCache document may resume the same resource. A real document
  // exit releases backing storage, observation and listeners immediately.
  listen(win,'pagehide',event=>{if(event.persisted)suspend('page',true);else dispose();});
  listen(win,'pageshow',()=>{visibility();suspend('page',false);});
  listen(doc,'freeze',()=>suspend('freeze',true));
  listen(doc,'resume',()=>{visibility();suspend('freeze',false);});
  if(win.MutationObserver){const observer=new win.MutationObserver(siteState);observer.observe(doc.documentElement,{attributes:true,attributeFilter:['data-site-entry-state']});scope.add(()=>observer.disconnect());}
  measure();scheduler.schedule();
  function dispose(){if(disposed)return;disposed=true;scheduler.dispose();scope.dispose();events.dispose();binding.dispose();}
  return {
    inspect:()=>({owner:'site',frames,playback:sampleChapterPlayback(playback),chapterScene:latest,size:{...size},lifecycle:scheduler.inspect(),events:events.inspect(),pageField:binding.inspect(),domPublication:publisher.inspect(),disposed}),
    dispose,
  };
}
