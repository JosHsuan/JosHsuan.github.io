import {EventManager} from '../core/EventManager.ts';
import {DOMPresenter} from '../presentation/DOMPresenter.ts';
import {createFrameScheduler} from '../../components/runtime-scheduler.mjs';
import {createChapterPlayback,advanceChapterPlayback,sampleChapterPlayback} from '../../components/chapter-playback.mjs';
import {sampleChapterScene} from '../../components/chapter-scene-score.mjs';
import {createHomeScrollPresenter} from '../site/HomeScrollPresenter.mjs';

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
  const homeRoot=doc.querySelector?.('[data-portfolio-root][data-portfolio-section="home"]')??null;
  const home=homeRoot?createHomeScrollPresenter({root:homeRoot,publisher:dom.forOwner('home-information')}):null;
  const forced=home?win.matchMedia('(forced-colors: active)'):null,connection=home?win.navigator?.connection:null;
  const naturalY=element=>{let top=0;for(let node=element;node;node=node.offsetParent)top+=node.offsetTop;return top;};
  let homeDirty=!!home;
  let previous=0,resumed=true,pendingImpulse=0,touchY=null,disposed=false,frames=0;
  let pointer={x:0,y:0,active:false},size={width:win.innerWidth,height:win.innerHeight};
  let stableWidth=0,latest=null;
  const scheduler=createFrameScheduler({request:fn=>win.requestAnimationFrame(fn),cancel:id=>win.cancelAnimationFrame(id),onFrame:tick});
  scheduler.suspend('visibility',doc.hidden);
  const listen=(target,type,handler,options)=>events.listen(scope,target,type,handler,options);
  const ready=()=>['entered','failed'].includes(doc.documentElement.getAttribute('data-site-entry-state'));
  const motionAllowed=()=>!scheduler.suspended&&ready()&&!reduced.matches;
  const homePolicy=()=>({ready:ready(),reduced:reduced.matches,suspended:scheduler.suspended,saveData:!!connection?.saveData,forcedColors:!!forced?.matches});
  const homeInvalidate=()=>{if(disposed||!home)return;homeDirty=true;scheduler.schedule();};
  const measure=()=>{
    // Same coarse-pointer browser-chrome stability rule as the case Director.
    if(win.matchMedia('(pointer:coarse)').matches&&stableWidth===win.innerWidth)return false;
    stableWidth=win.innerWidth;
    if(size.width===win.innerWidth&&size.height===win.innerHeight)return false;
    size={width:win.innerWidth,height:win.innerHeight};return true;
  };
  function tick(now) {
    if(disposed||scheduler.suspended)return;
    const dt=previous?(now-previous)/1000:1/60;previous=now;frames++;
    const wasResumed=resumed;
    if(homeDirty){home.measure({naturalY,viewportHeight:win.innerHeight,docY:win.scrollY});homeDirty=false;}
    const impulse=pendingImpulse;pendingImpulse=0;
    advanceChapterPlayback(playback,dt,{chapter:'overview',impulse,reducedMotion:reduced.matches,resumed,paused:!ready()});
    resumed=false;
    const score=sampleChapterPlayback(playback);
    const uv=[pointer.x/win.innerWidth,1-pointer.y/win.innerHeight];
    latest=sampleChapterScene(score,{reducedMotion:reduced.matches,aspect:size.width/size.height,pointer:{uv,active:fine.matches&&pointer.active&&!reduced.matches&&uv.every(value=>value>=0&&value<=1),strength:.35}});
    binding.present(latest,{frameTimeMs:now,paused:!ready(),hidden:doc.hidden,systemReduced:reduced.matches},size.width,size.height);
    const moving=home?.publish({...homePolicy(),dt,docY:win.scrollY,resumed:wasResumed,seek:wasResumed})??false;
    if(moving||score.needsFrame&&binding.inspect().ready&&!binding.inspect().failed)scheduler.schedule();
    else previous=0;
  }
  const reset=()=>{pointer={x:0,y:0,active:false};pendingImpulse=0;touchY=null;if(motionAllowed())scheduler.schedule();};
  const suspend=(reason,value)=>{
    const before=scheduler.suspended;scheduler.suspend(reason,value);
    if(before===scheduler.suspended)return;
    previous=0;resumed=true;pendingImpulse=0;touchY=null;pointer={x:0,y:0,active:false};
    if(scheduler.suspended){advanceChapterPlayback(playback,0,{hidden:true});home?.publish({...homePolicy(),dt:0,docY:win.scrollY,seek:true});}
    else{measure();scheduler.schedule();}
  };
  const visibility=()=>suspend('visibility',doc.hidden);
  const siteState=()=>{previous=0;resumed=true;homeDirty=!!home;scheduler.schedule();};
  const wheel=event=>{
    if(event.ctrlKey||!motionAllowed())return;
    const delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?win.innerHeight:1);
    pendingImpulse=Math.max(-1,Math.min(1,pendingImpulse+delta/600));scheduler.schedule();
  };
  listen(win,'wheel',wheel,{passive:true});
  listen(win,'touchstart',event=>{touchY=motionAllowed()&&event.touches.length===1?event.touches[0].clientY:null;},{passive:true});
  listen(win,'touchmove',event=>{
    if(!motionAllowed()){touchY=null;return;}
    if(touchY===null||event.touches.length!==1)return;
    const y=event.touches[0].clientY;
    pendingImpulse=Math.max(-1,Math.min(1,pendingImpulse+(touchY-y)/500));
    touchY=y;scheduler.schedule();
  },{passive:true});
  for(const type of ['touchend','touchcancel'])listen(win,type,()=>{touchY=null;},{passive:true});
  listen(win,'pointermove',event=>{
    if(!motionAllowed()||!['mouse','pen'].includes(event.pointerType))return;
    pointer={x:event.clientX,y:event.clientY,active:fine.matches&&!reduced.matches};scheduler.schedule();
  },{passive:true});
  listen(doc.documentElement,'pointerleave',reset);listen(win,'blur',reset);listen(fine,'change',reset);
  listen(reduced,'change',()=>{reset();previous=0;resumed=true;scheduler.schedule();});
  listen(win,'resize',()=>{if(measure())scheduler.schedule();homeInvalidate();},{passive:true});
  if(home){
    // Native scrolling, including keyboard and anchor movement, invalidates the
    // same demand scheduler. Home never starts a second frame clock.
    listen(win,'scroll',()=>{if(ready()&&!scheduler.suspended&&!reduced.matches&&!connection?.saveData&&!forced?.matches)scheduler.schedule();},{passive:true});
    listen(homeRoot,'load',homeInvalidate,{capture:true});
    listen(homeRoot,'focusin',()=>{if(!scheduler.suspended)scheduler.schedule();});
    listen(homeRoot,'focusout',()=>{if(!scheduler.suspended)scheduler.schedule();});
    listen(forced,'change',()=>{resumed=true;scheduler.schedule();});
    if(connection?.addEventListener)listen(connection,'change',()=>{resumed=true;scheduler.schedule();});
    if(win.ResizeObserver){const observer=new win.ResizeObserver(homeInvalidate);observer.observe(homeRoot);for(const element of homeRoot.querySelectorAll('[data-home-scroll-window]'))observer.observe(element);scope.add(()=>observer.disconnect());}
    if(win.MutationObserver){const observer=new win.MutationObserver(homeInvalidate);observer.observe(homeRoot,{childList:true,subtree:true});scope.add(()=>observer.disconnect());}
    Promise.resolve(doc.fonts?.ready).then(homeInvalidate,homeInvalidate);
  }
  listen(doc,'visibilitychange',visibility);
  // A retained BFCache document may resume the same resource. A real document
  // exit releases backing storage, observation and listeners immediately.
  listen(win,'pagehide',event=>{if(event.persisted)suspend('page',true);else dispose();});
  listen(win,'pageshow',()=>{visibility();suspend('page',false);});
  listen(doc,'freeze',()=>suspend('freeze',true));
  listen(doc,'resume',()=>{visibility();suspend('freeze',false);});
  if(win.MutationObserver){const observer=new win.MutationObserver(siteState);observer.observe(doc.documentElement,{attributes:true,attributeFilter:['data-site-entry-state']});scope.add(()=>observer.disconnect());}
  measure();scheduler.schedule();
  function dispose(){if(disposed)return;disposed=true;scheduler.dispose();home?.dispose();scope.dispose();events.dispose();binding.dispose();}
  return {
    inspect:()=>({owner:'site',frames,playback:sampleChapterPlayback(playback),chapterScene:latest,size:{...size},lifecycle:scheduler.inspect(),events:events.inspect(),pageField:binding.inspect(),homeScrolling:home?.inspect()??null,domPublication:publisher.inspect(),disposed}),
    dispose,
  };
}
