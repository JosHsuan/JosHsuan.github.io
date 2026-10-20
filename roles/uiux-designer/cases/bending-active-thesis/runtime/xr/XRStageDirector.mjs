import {EventManager} from '../core/EventManager.ts';
import {DOMPresenter} from '../presentation/DOMPresenter.ts';
import {createInformationWindowPresenter} from '../presentation/InformationWindowPresenter.mjs';
import {createLiquidGlassPresenter} from '../presentation/LiquidGlassPresenter.mjs';
import {createFrameScheduler} from '../../components/runtime-scheduler.mjs';
import {createPreviewLifecycle} from '../site/PreviewLifecycle.mjs';
import {createXRStageMotion,advanceXRStageMotion,cancelXRStageMotion} from './XRStageMotion.mjs';

const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
const BLOCKED='a,button,input,select,textarea,summary,[data-protect],[data-information-window]';
const zero=()=>({azimuth:0,elevation:0});
const naturalY=element=>{let top=0;for(let node=element;node;node=node.offsetParent)top+=node.offsetTop;return top;};

/** XR owns one demand scheduler, one inspection intent and its reading skins.
 * The renderer alone writes its camera. The shared Layer 1 background and native
 * video clock are independent owners; this director never writes either one.
 */
export function createXRStageDirector({root,host,window:win,document:doc,acquire,onState=()=>{}}={}){
 if(!root||!host||!win||!doc||typeof acquire!=='function')throw TypeError('XR director requires its native roots and scene acquisition');
 let binding=null,paused=false;
 return{
  connect(){
   if(binding)throw Error('XR director is already connected');
   const events=new EventManager(),scope=events.createScope('xr-stage');
   const dom=new DOMPresenter(),publisher=dom.forOwner('xr-director');
   const windows=createInformationWindowPresenter({root,publisher:dom.forOwner('xr-information')});
   const liquid=createLiquidGlassPresenter({root:doc,publisher:dom.forOwner('xr-liquid-glass')});
   const sceneMotion=createXRStageMotion(),sceneSurface=host.querySelector('[data-xr-scene-surface]')??host;
   const workspaceImage=host.querySelector('[data-xr-workspace-visual]');
   const workspace={phase:workspaceImage?'loading':'failed',reason:workspaceImage?null:'workspace-absent',width:0,height:0,source:null};
   const reduced=win.matchMedia('(prefers-reduced-motion: reduce)'),connection=win.navigator?.connection;
   const glassPreferences=['(forced-colors: active)','(prefers-contrast: more)','(prefers-reduced-transparency: reduce)'].map(query=>win.matchMedia(query));
   const opaqueGlass=()=>glassPreferences.some(query=>query.matches);
   const observerList=[],observed=new Set(),gestureHistory=[];
   let disposed=false,away=false,visible=true,dirty=true,resumed=true,previous=0,frames=0,frameDelta=0;
   let chapters=[],links=[],chapter='overview',progress=0,size={width:0,height:0},resource=null,windowSize={width:win.innerWidth,height:win.innerHeight};
   let target=zero(),value=zero(),velocity=zero(),settled=true,press=null,gestureId=0,lastState='',lastPaint='';
   let paintedChapter=null,paintPending=false,paintGeneration=0,workspaceGeneration=0,liquidKeyboardFocus=true;
   const scheduler=createFrameScheduler({request:fn=>win.requestAnimationFrame(fn),cancel:id=>win.cancelAnimationFrame(id),onFrame:tick});
   const listen=(node,type,fn,options)=>events.listen(scope,node,type,fn,options);
   const policy=()=>({reduced:!!reduced.matches,saveData:!!connection?.saveData,hidden:!!doc.hidden,siteReady:doc.documentElement.getAttribute('data-site-entry-state')==='entered'});
    const canInspect=()=>{const p=policy(),painted=resource?.inspect();return chapter==='method'&&sceneMotion.chapter===chapter&&sceneMotion.mode==='hold'&&sceneMotion.settled&&!!resource&&painted?.mode==='webgl-model'&&painted.successfulPaint&&!disposed&&!scheduler.suspended&&!away&&visible&&!p.hidden&&!p.reduced&&!p.saveData&&p.siteReady;};
   const state=()=>{const p=policy(),s=lifecycle.inspect();return{phase:s.phase,reason:s.reason,chapter,sceneChapter:sceneMotion.chapter,sceneMode:sceneMotion.mode,reduced:p.reduced,saveData:p.saveData,paused};};
   const notify=()=>{if(disposed)return;const next=state(),key=JSON.stringify(next);if(key!==lastState){lastState=key;onState(next);}};
   const presentation=()=>({chapter:sceneMotion.chapter,progress,azimuth:value.azimuth,elevation:value.elevation,paused,reduced:policy().reduced});
   const paint=()=>{
    if(!resource)return;
    const next=presentation(),key=JSON.stringify(next);if(key===lastPaint)return;
    const current=resource,generation=++paintGeneration;paintPending=true;
    const acknowledge=()=>{if(disposed||resource!==current||paintGeneration!==generation)return;paintPending=false;paintedChapter=next.chapter;scheduler.schedule();};
    try{const result=current.present(next);lastPaint=key;if(result?.then)result.then(acknowledge,error=>{if(!disposed&&resource===current&&paintGeneration===generation)lifecycle.fail(error?.message||'render-unavailable');});else acknowledge();}catch(error){lifecycle.fail(error?.message||'render-unavailable');}
   };
   const lifecycle=createPreviewLifecycle({
    setTimeout:win.setTimeout?.bind(win)??globalThis.setTimeout,clearTimeout:win.clearTimeout?.bind(win)??globalThis.clearTimeout,
    onState(){if(disposed)return;const phase=lifecycle.inspect().phase;if(phase==='failed'){closeGesture('resource-unavailable',true);advanceXRStageMotion(sceneMotion,0,{chapter,reduced:true});publishScene();}notify();if(phase==='ready')scheduler.schedule();},
    start:async({signal,width,height})=>{
     const handle=await acquire({signal,onFailure:reason=>lifecycle.fail(reason)});
     if(signal.aborted||disposed){handle.dispose();throw new DOMException('XR scene released','AbortError');}
     let released=false;
     const release=()=>{if(released)return;released=true;if(resource===handle){resource=null;lastPaint='';paintedChapter=null;paintPending=false;paintGeneration++;}handle.dispose();};
     signal.addEventListener('abort',release,{once:true});
     let painted='';
     try{
      // A phone may await native media and its first paint. Reconcile native
      // reading changes made during that wait before publishing ready.
      do{
       if(signal.aborted||disposed)throw new DOMException('XR scene released','AbortError');
       handle.resize(size.width||width,size.height||height);const next=presentation();
       await handle.present(next);painted=JSON.stringify(next);
      }while(!signal.aborted&&!disposed&&painted!==JSON.stringify(presentation()));
     }catch(error){signal.removeEventListener('abort',release);release();throw error;}
     if(signal.aborted||disposed){signal.removeEventListener('abort',release);release();throw new DOMException('XR scene released','AbortError');}
     resource=handle;lastPaint=painted;paintedChapter=JSON.parse(painted).chapter;paintPending=false;
     return{
      resize(width,height){handle.resize(width,height);},
      inspect:()=>handle.inspect(),
      dispose(){signal.removeEventListener('abort',release);release();},
     };
    },
   });
   function closeGesture(reason,immediate=false){
    const current=press;press=null;
    if(current){
     gestureHistory.push({id:current.id,phase:reason==='released'?'released':'cancelled',reason});if(gestureHistory.length>32)gestureHistory.shift();
     if(current.surface.hasPointerCapture?.(current.pointerId))current.surface.releasePointerCapture(current.pointerId);
    }
    target=zero();if(immediate){value=zero();velocity=zero();settled=true;}else settled=Object.keys(value).every(key=>value[key]===0&&velocity[key]===0);
   }
   function updateEligibility(reason){
    const p=policy(),active=!disposed&&!scheduler.suspended&&!away&&visible&&!p.hidden&&!p.reduced&&!p.saveData&&p.siteReady;
    const why=away?'page-exit':p.hidden?'hidden':p.reduced?'reduced-motion':p.saveData?'save-data':!p.siteReady?'entry-pending':!visible?'offscreen':reason;
    if(!active)closeGesture(why,true);
    lifecycle.setActive(active,why);notify();
   }
   function measure(){
    dirty=false;
    chapters=[...root.querySelectorAll('[data-xr-chapter]')].map(element=>({element,key:element.dataset.xrChapter,top:naturalY(element),height:element.offsetHeight})).sort((a,b)=>a.top-b.top);
    links=[...new Set([...root.querySelectorAll('a[href^="#"]'),...doc.querySelectorAll('[data-xr-chapter-link]')])];
    const rect=host.getBoundingClientRect(),next={width:Math.max(0,rect.width),height:Math.max(0,rect.height)};
    if(next.width!==size.width||next.height!==size.height){size=next;lifecycle.resize(size.width,size.height);lastPaint='';}
    if(workspaceImage&&workspace.phase==='ready'&&(!workspaceImage.complete||workspaceImage.currentSrc!==workspace.source)){workspace.phase='loading';workspace.reason='responsive-source-loading';void decodeWorkspace();}
    windows.measure({naturalY,viewportHeight:win.innerHeight,docY:win.scrollY});
    liquid.measure({opaque:opaqueGlass()});
    if(resize){
     const wanted=new Set([root,...chapters.map(item=>item.element),...root.querySelectorAll('[data-information-window]'),...doc.querySelectorAll('[data-liquid-glass]')]);
     for(const node of observed)if(!wanted.has(node)){resize.unobserve(node);observed.delete(node);}
     for(const node of wanted)if(!observed.has(node)){resize.observe(node);observed.add(node);}
    }
   }
   function reading(){
    const line=win.scrollY+win.innerHeight*.42;
    let selected=chapters[0];for(const candidate of chapters){if(candidate.top>line)break;selected=candidate;}
    if(!selected)return;
    const next=chapters[chapters.indexOf(selected)+1],end=next?.top??selected.top+selected.height;
    if(chapter!==selected.key){closeGesture('chapter-change',true);chapter=selected.key;notify();}
    progress=clamp((line-selected.top)/Math.max(1,end-selected.top),0,1);
    publisher.attribute(root,'data-xr-active-chapter',chapter);
    for(const link of links){
     const id=link.getAttribute('href')?.slice(1),section=id&&doc.getElementById(id);
     publisher.attribute(link,'aria-current',section&&(section===selected.element||section.contains(selected.element))?'location':null);
    }
   }
   function advance(dt){
    if(resumed||policy().reduced||dt>1){value={...target};velocity=zero();settled=true;return;}
    const decay=Math.exp(-16*dt);settled=true;
    for(const key of Object.keys(value)){
     const displacement=value[key]-target[key],coefficient=velocity[key]+16*displacement;
     value[key]=target[key]+(displacement+coefficient*dt)*decay;velocity[key]=(velocity[key]-16*coefficient*dt)*decay;
     if(Math.abs(value[key]-target[key])<.00001&&Math.abs(velocity[key])<.0001){value[key]=target[key];velocity[key]=0;}else settled=false;
    }
   }
   function publishScene(){
    publisher.style(sceneSurface,'transform',`translate3d(${sceneMotion.pose.x*size.width}px,${sceneMotion.pose.y*size.height}px,0)`);
    publisher.style(sceneSurface,'opacity',sceneMotion.pose.opacity);
    publisher.attribute(host,'data-xr-scene-mode',sceneMotion.mode);
    publisher.attribute(host,'data-xr-presented-chapter',sceneMotion.chapter);
    publisher.attribute(host,'data-xr-workspace-phase',workspace.phase);
   }
   function tick(now){
    if(disposed||scheduler.suspended)return;
    if(dirty)measure();reading();
    const dt=previous?Math.max(0,(now-previous)/1000):1/60;previous=now;frames++;frameDelta=dt;
    advance(dt);
    const p=policy();
    const readyChapter=sceneMotion.chapter==='context'?(workspace.phase==='ready'?'context':null):paintedChapter;
    advanceXRStageMotion(sceneMotion,dt,{chapter,readyChapter,reduced:p.reduced||p.saveData||lifecycle.inspect().phase==='failed'||chapter==='context'&&workspace.phase==='failed',resumed});
    publishScene();
    const moving=windows.publish({docY:win.scrollY,dt,reduced:policy().reduced,seek:resumed,resumed});
    const glassMoving=liquid.publish({dt,reduced:p.reduced,resumed,hidden:p.hidden,opaque:opaqueGlass(),keyboardFocus:liquidKeyboardFocus});
    resumed=false;paint();notify();
    if(!settled||moving||glassMoving||sceneMotion.transition)scheduler.schedule();else previous=0;
   }
   function invalidate(){if(disposed)return;dirty=true;scheduler.schedule();}
   function down(event){
    if(!canInspect()||event.button!==0||event.isPrimary===false||press||event.target.closest?.(BLOCKED))return;
    const hit=resource.hitTest?.(event.clientX,event.clientY);if(hit?.source!==true||hit.kind!=='model')return;
    const surface=event.target.closest?.('[data-xr-model-control]')??host;
    press={id:++gestureId,pointerId:event.pointerId,surface,x:event.clientX,y:event.clientY,azimuth:target.azimuth,elevation:target.elevation,touch:event.pointerType==='touch',locked:false};
    gestureHistory.push({id:press.id,phase:'requested'});if(gestureHistory.length>32)gestureHistory.shift();
   }
   function move(event){
    const current=press;if(!current||event.pointerId!==current.pointerId||!resource)return;
    const dx=event.clientX-current.x,dy=event.clientY-current.y;
    if(!current.locked){
     if(Math.hypot(dx,dy)<(current.touch?8:4))return;
     if(current.touch&&Math.abs(dy)>Math.abs(dx)){closeGesture('native-scroll',true);return;}
     current.locked=true;current.surface.setPointerCapture?.(current.pointerId);
    }
    event.preventDefault();target={azimuth:clamp(current.azimuth-dx*.004,-.9,.9),elevation:clamp(current.elevation+dy*.003,-.4,.5)};settled=false;scheduler.schedule();
   }
   function end(event,cancelled=false){if(press?.pointerId!==event.pointerId)return;closeGesture(cancelled?'pointer-cancelled':'released',cancelled);scheduler.schedule();}
   function key(event){
    if(!canInspect()||!['overview','context','method','making'].includes(chapter)||!event.target.closest?.('[data-xr-model-control]'))return;
    const change={ArrowLeft:{azimuth:.12},ArrowRight:{azimuth:-.12},ArrowUp:{elevation:-.09},ArrowDown:{elevation:.09}}[event.key];
    if(change){event.preventDefault();for(const [name,delta]of Object.entries(change))target[name]=clamp(target[name]+delta,...(name==='azimuth'?[-.9,.9]:[-.4,.5]));settled=false;scheduler.schedule();}
    else if(event.key==='Escape'||event.key==='Home'){event.preventDefault();closeGesture('keyboard-return',true);scheduler.schedule();}
   }
   function suspend(reason,flag){
    scheduler.suspend(reason,flag);previous=0;resumed=true;
    if(flag){closeGesture(reason,true);liquid.reset();cancelXRStageMotion(sceneMotion,reason);advanceXRStageMotion(sceneMotion,0,{chapter,reduced:true});publishScene();windows.publish({docY:win.scrollY,dt:0,reduced:true,resumed:true});}
    updateEligibility(reason);if(!scheduler.suspended){dirty=true;scheduler.schedule();}
   }
   const resize=win.ResizeObserver?new win.ResizeObserver(invalidate):null;if(resize)observerList.push(resize);
   if(win.IntersectionObserver){const observer=new win.IntersectionObserver(entries=>{for(const entry of entries)if(entry.target===root){const next=entry.isIntersecting&&entry.intersectionRatio>0;if(next!==visible){visible=next;suspend('offscreen',!visible);}}},{threshold:[0,.01]});observer.observe(root);observerList.push(observer);}
   if(win.MutationObserver){const observer=new win.MutationObserver(()=>{updateEligibility('entry-ready');if(!scheduler.suspended)scheduler.schedule();});observer.observe(doc.documentElement,{attributes:true,attributeFilter:['data-site-entry-state']});observerList.push(observer);}
   listen(win,'scroll',()=>scheduler.schedule(),{passive:true});listen(win,'resize',()=>{if(windowSize.width===win.innerWidth&&windowSize.height===win.innerHeight)return;windowSize={width:win.innerWidth,height:win.innerHeight};invalidate();},{passive:true});listen(root,'toggle',invalidate,true);
   const pointerGlass=event=>{if(!scheduler.suspended&&liquid.pointer(event))scheduler.schedule();};
   listen(doc,'pointerdown',event=>{liquidKeyboardFocus=false;pointerGlass(event);down(event);});listen(doc,'pointermove',event=>{pointerGlass(event);move(event);},{passive:false});listen(doc,'pointerup',event=>{pointerGlass(event);end(event);});listen(doc,'pointercancel',event=>{pointerGlass(event);end(event,true);});
   listen(doc,'lostpointercapture',event=>{if(press?.pointerId===event.pointerId){closeGesture('lost-capture',true);scheduler.schedule();}});
   listen(doc.documentElement,'pointerleave',()=>{if(press){closeGesture('pointer-left',true);if(!scheduler.suspended)scheduler.schedule();}});
   listen(doc,'keydown',event=>{liquidKeyboardFocus=true;liquid.reset();key(event);});listen(win,'blur',()=>{liquid.reset();if(press||!settled||Object.values(target).some(Boolean)){closeGesture('blur',true);if(!scheduler.suspended)scheduler.schedule();}});
   listen(root,'focusout',event=>{if(event.target.closest?.('[data-xr-model-control]')){closeGesture('focus-left',true);if(!scheduler.suspended)scheduler.schedule();}});
   listen(doc,'visibilitychange',()=>suspend('visibility',doc.hidden));listen(doc,'freeze',()=>{away=true;suspend('freeze',true);});listen(doc,'resume',()=>{away=false;suspend('freeze',false);});
   listen(win,'pagehide',event=>{away=true;if(event.persisted)suspend('page',true);else dispose();});
   listen(win,'pageshow',()=>{away=false;scheduler.suspend('visibility',doc.hidden);suspend('page',false);});
   listen(reduced,'change',()=>{closeGesture('preference-change',true);previous=0;resumed=true;updateEligibility('preference-change');scheduler.schedule();});
   if(connection?.addEventListener)listen(connection,'change',()=>{closeGesture('preference-change',true);updateEligibility('preference-change');scheduler.schedule();});
   for(const query of glassPreferences)listen(query,'change',()=>{liquid.reset();invalidate();});
   // Native image decoding is Context's own readiness fact. A prepared hidden
   // assembly cannot acknowledge the complete workspace still on its behalf.
   async function decodeWorkspace(){
    if(!workspaceImage||!workspaceImage.complete)return;
    const source=workspaceImage.currentSrc;
    if(workspace.phase==='ready'&&workspace.source===source)return;
    const generation=++workspaceGeneration;workspace.phase='loading';workspace.reason=null;
    try{
     if(!workspaceImage.naturalWidth)throw Error('Workspace image is unavailable');
     await workspaceImage.decode();if(disposed||generation!==workspaceGeneration)return;
     if(workspaceImage.currentSrc!==source){void decodeWorkspace();return;}
     if(!(workspaceImage.naturalWidth>0&&workspaceImage.naturalHeight>0))throw Error('Workspace image is empty');
     workspace.phase='ready';workspace.reason=null;workspace.width=workspaceImage.naturalWidth;workspace.height=workspaceImage.naturalHeight;workspace.source=source;
    }catch{if(disposed||generation!==workspaceGeneration)return;workspace.phase='failed';workspace.reason='workspace-decode-failed';}
    if(!scheduler.suspended)scheduler.schedule();
   }
   if(workspaceImage){listen(workspaceImage,'load',decodeWorkspace);listen(workspaceImage,'error',()=>{workspaceGeneration++;workspace.phase='failed';workspace.reason='workspace-image-unavailable';if(!scheduler.suspended)scheduler.schedule();});void decodeWorkspace();}
   function dispose(){
    if(disposed)return;closeGesture('disposed',true);cancelXRStageMotion(sceneMotion,'disposed');disposed=true;lifecycle.dispose();scheduler.dispose();windows.dispose();liquid.dispose();
    observerList.forEach(observer=>observer.disconnect());observed.clear();scope.dispose();events.dispose();
    publisher.attribute(root,'data-xr-director-ready',null);publisher.attribute(root,'data-xr-active-chapter',null);links.forEach(link=>publisher.attribute(link,'aria-current',null));
    publisher.style(sceneSurface,'transform','');publisher.style(sceneSurface,'opacity','');publisher.attribute(host,'data-xr-scene-mode',null);publisher.attribute(host,'data-xr-presented-chapter',null);publisher.attribute(host,'data-xr-workspace-phase',null);
   }
   const inspect=()=>({...lifecycle.inspect(),chapter,progress,paused,...policy(),size:{...size},workspace:{...workspace},scene:{chapter:sceneMotion.chapter,requestedChapter:sceneMotion.requestedChapter,mode:sceneMotion.mode,settled:sceneMotion.settled,visible:sceneMotion.visible,...sceneMotion.pose,paintPending,paintedChapter,history:sceneMotion.history.map(item=>({...item}))},camera:{target:{...target},value:{...value},settled},gesture:press?{id:press.id,pointerId:press.pointerId,locked:press.locked}:null,gestures:[...gestureHistory],frames,frameDelta,lifecycle:scheduler.inspect(),events:events.inspect(),informationWindows:windows.inspect(),liquidGlass:liquid.inspect(),domPublication:dom.inspect(),disposed});
   binding={dispose,inspect,hitTest:(x,y)=>canInspect()&&[x,y].every(Number.isFinite)?resource.hitTest?.(x,y)??false:false,pause(value){
    if(disposed||paused===value)return;paused=value;
    // Native media commands acknowledge before the UI, independently of the
    // next camera frame. A pending first paint reconciles this intent itself.
    try{resource?.setPaused(paused);}catch(error){lifecycle.fail(error?.message||'render-unavailable');return;}
    notify();if(!scheduler.suspended)scheduler.schedule();
   }};
   publisher.attribute(root,'data-xr-director-ready','');scheduler.suspend('visibility',doc.hidden);measure();reading();updateEligibility('initial');scheduler.schedule();
   Promise.resolve(doc.fonts?.ready).then(()=>{if(!disposed)invalidate();},()=>{if(!disposed)invalidate();});
   return()=>dispose();
  },
  setPaused(value){const next=!!value;if(binding)binding.pause(next);else paused=next;},
  hitTest:(x,y)=>binding?.hitTest(x,y)??false,
  inspect:()=>binding?.inspect()??{phase:'poster',reason:'not-connected',chapter:'overview',paused,disposed:false},
 };
}
