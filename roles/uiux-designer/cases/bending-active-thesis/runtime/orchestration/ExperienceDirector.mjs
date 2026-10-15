import {cinematicChapter} from '../../components/vendor/cinematic-plan.mjs';
import {createReadingPlan, sampleReadingScore, createPlaneFeedback} from '../../components/story-response.mjs';
import {createChapterPlayback, advanceChapterPlayback, sampleChapterPlayback} from '../../components/chapter-playback.mjs';
import {publishEditorial} from '../presentation/EditorialPresenter.mjs';
import {sampleChapterScene} from '../../components/chapter-scene-score.mjs';
import {advanceInspection, setInspectionTarget, INSPECTION_DEFAULTS} from '../../components/inspection-state.mjs';
import {createFrameScheduler} from '../../components/runtime-scheduler.mjs';
import {LayoutScheduler} from '../presentation/LayoutScheduler.ts';
import {createCanvasMotion, advanceCanvasMotion} from '../../components/canvas-motion.mjs';
import {viewportStageSourceViewport,SOURCE_COMPARISON_SECONDS} from '../../components/source-scene-score.mjs';
import {expireSourceSelection} from '../features/ModelManager.mjs';
import {modelInformationLayout} from '../../components/model-information.mjs';
import {createPageFieldRenderer} from '../../components/page-field-renderer.mjs';
import {createCanvasTransitionEvents} from './CanvasTransitionEvents.mjs';
import {createInformationWindowPresenter} from '../presentation/InformationWindowPresenter.mjs';
import {createLibraryDiagramPresenter} from '../presentation/LibraryDiagramPresenter.mjs';
import {createLiquidGlassPresenter} from '../presentation/LiquidGlassPresenter.mjs';

/** Owns chapter time and frame coordination, independently of React presentation. */
export function createExperienceDirector({input,inspection,lifecycle,stage,fieldCanvas,progress,status}){
  return {connect(){
    const modelOverlay=document.querySelector('[data-model-overlay]');
    const root = document.querySelector('[data-story-root]');
    const backdrop = document.querySelector('[data-cinematic-background]');
    const sections = [...document.querySelectorAll('[data-story-chapter]')];
    if (!root || sections.length !== 7) return;
    const scope=input.events.createScope('director');
    const fine = matchMedia('(hover: hover) and (pointer: fine)');
    const glassPreferences=['(prefers-reduced-transparency: reduce)','(prefers-contrast: more)','(forced-colors: active)'].map(query=>matchMedia(query));
    const opaqueGlass=()=>glassPreferences.some(query=>query.matches);
    const links = [...document.querySelectorAll('[data-chapter-link]')];
    const planeMap = new Map(), publisher = input.dom.forOwner('director');
    const pageField=createPageFieldRenderer(fieldCanvas.current);
    const windowPresenter=createInformationWindowPresenter({publisher:input.dom.forOwner('information-windows')});
    const libraryPresenter=createLibraryDiagramPresenter({publisher:input.dom.forOwner('library-diagram'),emit:value=>input.events.emit('diagramReveal',value)});
    const liquidPresenter=createLiquidGlassPresenter({publisher:input.dom.forOwner('liquid-glass')});
    const informationObserved=new Set();
    const canvasEvents=createCanvasTransitionEvents(value=>input.events.emit('canvasTransition',value));
    let planes=[], diagrams=[];
    // offsetTop follows untransformed layout; rect + scrollY would feed our own
    // compensation back into anchors and cause drift on every ResizeObserver.
    const naturalY = element => {let y=0;for(let node=element;node;node=node.offsetParent)y+=node.offsetTop;return y;};
    const readingManager=input.features.create('reading',{window,document,root,naturalY,seek:()=>seek(),
      onKeyboard:()=>{pointerFocus=false;liquidKeyboardFocus=true;liquidPresenter.reset();},isPointerFocus:()=>pointerFocus,
      onFocus:event=>{focused=event.target.closest?.('[data-feedback-plane]')??event.target.querySelector?.('[data-feedback-plane]')??null;const item=planeMap.get(focused);if(item)item.target={x:.3,y:-.3,press:.35};}});
    const reading=readingManager.reading,playback=createChapterPlayback(),history=[],choreography=new Map();
    let canvasSurface={width:1,height:1},canvasPlacement=null,canvasWasVisible=false,canvasActivation=-1,canvasAwaitingPaint=false,stableWidth=0;
    const canvasMotion=createCanvasMotion();
    let plan, offsets=[], previous=0, controllerFrame=0, frameDelta=0, resumed=true, seekPending=false, semanticSeekPending=false;
    let inspectionRevision=input.get().inspectionRevision??0, wasReduced=input.get().reduced;
    let preferenceKey='', pendingImpulse=0, touchY=null, pointerActive=false, latestScene=null, lastChapter=null;
    readingManager.start();
    if(input.entry.inspect().phase==='entered')readingManager.completeInitialNavigation();
    input.events.on(scope,'entryReadiness',({phase,id})=>{if(phase==='entered'&&id===input.entry.inspect().id)readingManager.completeInitialNavigation();});
    let pointer={x:0,y:0}, pointerTarget={x:0,y:0}, hovered=null, focused=null, pointerFocus=false;
    let pointerSurface=null,pointerClient={x:0,y:0},pointerMoved=false,lastHoverCheck=-Infinity,disposed=false;
    let liquidKeyboardFocus=true;
    const scheduler=createFrameScheduler({request:callback=>requestAnimationFrame(callback),cancel:id=>cancelAnimationFrame(id),onFrame:now=>tick(now)});
    const layout=new LayoutScheduler(()=>scheduler.schedule());
    scheduler.suspend('visibility',document.hidden);
    const measure = () => {
      if(disposed||(scheduler.suspended&&plan))return;
      // Mobile browser bars change available height frequently. Preserve the
      // drawing surface until width/orientation changes instead of reallocating
      // all GPU attachments as chrome slides in and out.
      if(stage.current&&(!matchMedia('(pointer:coarse)').matches||stableWidth!==innerWidth)){
        stableWidth=innerWidth;stage.current.style.setProperty('--scene-height',innerHeight+'px');
      }
      canvasSurface={width:stage.current?.offsetWidth||1,height:stage.current?.offsetHeight||1};
      // Discrete resize/source hydration refreshes collections. No document-wide
      // selector walk is needed while a settled chapter keeps playing.
      planes=[...document.querySelectorAll('[data-feedback-plane]')].filter(element=>!element.closest('[data-information-window]')).map(element=>{
        if(!planeMap.has(element))planeMap.set(element,{element,response:createPlaneFeedback(),target:{x:0,y:0,press:0}});
        return planeMap.get(element);
      });
      for(const element of planeMap.keys())if(!element.isConnected||element.closest('[data-information-window]'))planeMap.delete(element);
      diagrams=[...document.querySelectorAll('[data-source-diagram]:not([data-source-diagram="library"])')].map(element=>({element,index:Math.max(0,sections.indexOf(element.closest('[data-story-chapter]')))}));
      for(const element of choreography.keys())if(!element.isConnected||element.closest('[data-information-window]'))choreography.delete(element);
      offsets=sections.map(naturalY);offsets.push(naturalY(sections.at(-1))+sections.at(-1).offsetHeight);
      windowPresenter.measure({naturalY,viewportHeight:innerHeight,docY:scrollY});
      libraryPresenter.measure({naturalY,viewportHeight:innerHeight});
      liquidPresenter.measure({opaque:opaqueGlass()});
      const informationElements=new Set(document.querySelectorAll('[data-information-window],[data-liquid-glass]'));
      for(const element of informationObserved)if(!informationElements.has(element)){resize.unobserve(element);informationObserved.delete(element);}
      for(const element of informationElements)if(!informationObserved.has(element)){resize.observe(element);informationObserved.add(element);}
      // Reading follows the native document; only the separate Canvas keeps
      // authored chapter holds. No paragraph/media pause points are measured.
      plan=createReadingPlan({anchors:offsets,viewportHeight:innerHeight,maxScroll:Math.max(0,document.documentElement.scrollHeight-innerHeight),stops:[]});readingManager.setPlan(plan);
      const counters=new Map();
      document.querySelectorAll('[data-choreography]').forEach(element=>{
        if(element.closest('[data-information-window]'))return;
        const kind=element.dataset.choreography||'prose', section=element.closest('[data-story-chapter]');
        const key=`${section?.id??'page'}:${kind}`, index=counters.get(key)??0;counters.set(key,index+1);
        if(!choreography.has(element))choreography.set(element,{kind,index,firstVisibleAt:null,last:null});
        const host=element.closest('[data-model-study-host]');
        Object.assign(choreography.get(element),{top:naturalY(element),height:element.offsetHeight,viewportFixed:!!element.closest('[data-page-masthead],[data-story-navigation],[data-reading-tools]'),stickyStudy:!!host&&getComputedStyle(host).position==='sticky'});
      });
      if(readingManager.initialHash)hash();schedule();
    };
    const tick = now => {
      if(scheduler.suspended||!plan)return;
      layout.flush(resetTime=>{if(resetTime)resumed=true;measure();});
      const didResume=resumed,didSeek=semanticSeekPending,dt=previous?(now-previous)/1000:1/60;previous=now;
      controllerFrame++;frameDelta=dt;
      let state=input.get();
      if(state.sceneEnabled&&!state.sceneFailed)lifecycle.heartbeat();
      const readingScore=readingManager.advance(scrollY,dt,{reducedMotion:state.reduced,resumed,seek:seekPending}),u=readingScore.nativeU;
      // Native reading selects a semantic chapter. It never supplies scene time.
      const chapter=cinematicChapter(u);
      if(lastChapter!==chapter.id&&state.modelInteractionChapter&&state.modelInteractionChapter!==chapter.id){
        setInspectionTarget(inspection,{azimuth:INSPECTION_DEFAULTS.azimuth,elevation:INSPECTION_DEFAULTS.elevation});
        input.updateInteraction({modelEngaged:false,modelRecovering:false,modelInteractionChapter:null,modelHeldSource:null,modelHover:{x:0,y:0,strength:0,chapterId:null}});
        state=input.get();
      }
      const requested=state.sourceSelection,requestAge=playback.activeSeconds-(requested?.selectedAt??-Infinity);
      const explicitChapter=state.modelEngaged?state.modelInteractionChapter:requested?.chapterId===chapter.id&&requestAge>=0&&requestAge<SOURCE_COMPARISON_SECONDS?requested.chapterId:undefined;
      canvasPlacement=advanceCanvasMotion(canvasMotion,dt,{anchors:offsets,docY:scrollY,viewport:{width:canvasSurface.width,height:canvasSurface.height},reducedMotion:state.reduced,seek:didSeek,resumed:didResume,paused:canvasAwaitingPaint,forcedChapter:explicitChapter});
      advanceInspection(inspection,dt,{reducedMotion:state.reduced,resumed});
      const recovering=!!state.modelRecovering&&!inspection.settled;
      const impulse=pendingImpulse;pendingImpulse=0;
      advanceChapterPlayback(playback,dt,{
        chapter:canvasPlacement.chapter,impulse,paused:!state.sceneEnabled||state.sceneFailed,
        reducedMotion:!!state.systemReduced,resumed,engaged:!!state.modelEngaged||recovering,
        seek:didSeek||lastChapter===null,
      });
      const playbackScore=sampleChapterPlayback(playback);
      if(expireSourceSelection(input,playbackScore.activeSeconds))state=input.get();
      lastChapter=chapter.id;resumed=false;seekPending=false;semanticSeekPending=false;
      // Read the few unsettled sticky labels together, before any element
      // transform writes. Already-settled labels need no live rectangle.
      const stickyRects=new Map();
      choreography.forEach((item,element)=>{if(item.stickyStudy&&!item.last?.settled)stickyRects.set(element,element.getBoundingClientRect());});
      const hoveredPlane=pointerMoved?planeMap.get(hovered):null;
      if(hoveredPlane){const r=hoveredPlane.element.getBoundingClientRect();hoveredPlane.target={x:Math.min(1,Math.max(-1,(pointerClient.x-r.left)/Math.max(1,r.width)*2-1)),y:Math.min(1,Math.max(-1,(pointerClient.y-r.top)/Math.max(1,r.height)*2-1)),press:0};}
      publisher.attribute(document.documentElement,'data-active-chapter',chapter.id);
      publisher.attribute(document.documentElement,'data-chapter-beat',playbackScore.beat);
      links.forEach(link=>publisher.attribute(link,'aria-current',link.dataset.chapterLink===chapter.id?'location':null));

      const decorate=fine.matches&&!state.reduced,alpha=1-Math.exp(-10*Math.min(dt,1)),next=decorate?pointerTarget:{x:0,y:0};
      pointer={x:pointer.x+(next.x-pointer.x)*alpha,y:pointer.y+(next.y-pointer.y)*alpha};
      let moving=Math.abs(pointer.x-next.x)+Math.abs(pointer.y-next.y)>.001;if(!moving)pointer={...next};

      moving=publishEditorial({choreography,stickyRects,reading,playbackScore,state,didSeek,didResume,sections,planes,hovered,focused,fine,dt,publisher,viewportHeight:innerHeight,chapter})||moving;
      moving=windowPresenter.publish({docY:scrollY,dt,reduced:state.reduced,seek:didSeek,resumed:didResume,canvasPlacement})||moving;
      moving=input.entry.advance(dt,{resumed:didResume,hidden:state.hidden,systemReduced:state.systemReduced})||moving;
      moving=libraryPresenter.publish({docY:scrollY,dt,reduced:state.systemReduced,resumed:didResume,hidden:state.hidden||input.entry.inspect().phase!=='entered'})||moving;
      moving=liquidPresenter.publish({dt,reduced:state.reduced,resumed:didResume,hidden:state.hidden,opaque:opaqueGlass(),keyboardFocus:liquidKeyboardFocus})||moving;

      // Chapter boundaries own the viewport hold. Information rectangles never
      // determine the scene size or camera framing.
      const modelViewports={};
      let inspectionWeight=0,inspectionViewport=state.inspectionViewport;
      const canvasChapter=canvasPlacement.chapter;
      const authoredViewport=viewportStageSourceViewport(canvasSurface.width/canvasSurface.height,canvasSurface.width);
      const informationViewport=modelInformationLayout(canvasSurface.width/canvasSurface.height,canvasSurface.width).information;
      const modelUIVisible=canvasPlacement.visible&&['form','system','pattern'].includes(canvasPlacement.chapter);
      if(modelOverlay){
        publisher.style(modelOverlay,'height',`${canvasSurface.height}px`);
        for(const [prefix,rect] of [['slot',authoredViewport],['info',informationViewport]]){
          for(const [name,value] of [['left',rect.left*canvasSurface.width],['top',rect.top*canvasSurface.height],['width',rect.width*canvasSurface.width],['height',rect.height*canvasSurface.height]])publisher.style(modelOverlay,`--model-${prefix}-${name}`,`${value}px`);
        }
        // Native focus must survive the momentary empty boundary between two
        // scene passages, just as the previous document controls did.
        publisher.attribute(modelOverlay,'hidden',modelUIVisible||modelOverlay.contains(document.activeElement)?null:'');
        publisher.attribute(modelOverlay,'data-model-ui-visible',String(modelUIVisible));
        if(!state.sceneReady||state.sceneFailed)modelOverlay.querySelectorAll('[data-model-study]').forEach(study=>{study.dataset.modelActive=String(study.dataset.studyChapter===canvasPlacement.chapter);});
      }
      const canvasActive=canvasPlacement.visible&&state.sceneEnabled&&!state.sceneFailed;
      if(canvasActive&&!canvasWasVisible)canvasActivation=controllerFrame;
      canvasWasVisible=canvasActive;
      const presented=input.getPresentation();
      canvasAwaitingPaint=canvasActive&&(presented.controllerFrame<canvasActivation||presented.chapterId!==canvasChapter);
      publisher.style(stage.current,'transform',`translate3d(${canvasPlacement.x}px,${canvasPlacement.y}px,0) scale(${canvasPlacement.scale})`);
      publisher.style(stage.current,'opacity',canvasAwaitingPaint?0:canvasPlacement.opacity);
      if(modelOverlay){
        // The information column is permanent; only its model aperture follows
        // the existing scene entry/exit. Source leader points use the real Canvas rect.
        publisher.style(modelOverlay,'opacity',canvasAwaitingPaint||!modelUIVisible?0:1);
        modelOverlay.querySelectorAll('[data-model-viewport]').forEach(surface=>publisher.style(surface,'transform',`translate3d(${canvasPlacement.x}px,${canvasPlacement.y}px,0) scale(${canvasPlacement.scale})`));
      }
      publisher.attribute(stage.current,'data-canvas-mode',canvasPlacement.mode);
      moving=moving||!canvasPlacement.settled||canvasAwaitingPaint;
      for(const id of ['form','system','pattern']){
        const weight=canvasPlacement.visible&&id===canvasChapter?1:0;
        modelViewports[id]={viewport:authoredViewport,weight};
        if(id===chapter.id){inspectionWeight=weight;inspectionViewport=authoredViewport;}
      }
      // Moving pointers are checked each delivered frame; a stationary pointer
      // still notices a moving source leaving it within 100 ms, without a
      // full mesh intersection on every autonomous frame. Press stays exact.
      let modelHover=state.modelHover??{x:0,y:0,strength:0,chapterId:null};
      if(pointerSurface&&!state.modelEngaged&&(pointerMoved||now-lastHoverCheck>=100)){
        lastHoverCheck=now;
        const under=document.elementFromPoint(pointerClient.x,pointerClient.y);
        const over=pointerSurface.isConnected&&under&&!under.closest?.('button,a,select,input,summary,[data-protect],[data-feedback-plane]');
        const hit=over&&window.__thesis?.hitTest?.(pointerClient.x,pointerClient.y);
        const found=!!hit&&hit.source===true&&hit.chapterId===pointerSurface.dataset.studyChapter;
        publisher.attribute(pointerSurface,'data-model-hit',found?'true':null);
        const r=pointerSurface.getBoundingClientRect();
        modelHover={x:Math.min(1,Math.max(-1,(pointerClient.x-r.left)/Math.max(1,r.width)*2-1)),y:Math.min(1,Math.max(-1,(pointerClient.y-r.top)/Math.max(1,r.height)*2-1)),strength:found?1:0,chapterId:pointerSurface.dataset.studyChapter};
      }
      pointerMoved=false;
      const fieldUv=[pointerClient.x/innerWidth,1-pointerClient.y/innerHeight];
      const fieldActive=decorate&&pointerActive&&fieldUv.every(value=>value>=0&&value<=1);
      latestScene=sampleChapterScene(playbackScore,{reducedMotion:!!state.systemReduced,aspect:canvasSurface.width/canvasSurface.height,pointer:{...pointer,uv:fieldUv,active:fieldActive,strength:modelHover.strength||.35}});
      // Same chapter weights as the scene, quantized to avoid repainting a
      // stationary light field for autonomous camera/ASCII beats.
      const lightField=latestScene.backdrop;
      publisher.style(backdrop,'--backdrop-cool-rgb',lightField.coolRgb.join(' '));
      publisher.style(backdrop,'--backdrop-warm-rgb',lightField.warmRgb.join(' '));
      publisher.style(backdrop,'--backdrop-cool-energy',Math.round(lightField.coolEnergy*100)/100);
      publisher.style(backdrop,'--backdrop-warm-energy',Math.round(lightField.warmEnergy*100)/100);
      publisher.style(backdrop,'--backdrop-warm-x',Math.round(63-lightField.warmSide*45)+'%');
      pageField.render({field:latestScene.field,frameTimeMs:now,paused:!state.sceneEnabled||state.sceneFailed,hidden:state.hidden,systemReduced:state.systemReduced},canvasSurface.width,canvasSurface.height);
      diagrams.forEach(({element:diagram,index})=>{
        const count=Math.max(1,Number(diagram.dataset.diagramCount)||4),phase=playbackScore.phases[index];
        // The discrete index owns source highlighting. The old continuously
        // written phase/energy custom properties were not consumed by CSS.
        publisher.attribute(diagram,'data-autonomous-index',Math.floor(phase*count)%count);
        publisher.attribute(diagram,'data-source-presented',index===2&&canvasChapter==='system'&&canvasPlacement.visible&&!canvasAwaitingPaint&&state.sceneEnabled&&!state.sceneFailed?'true':null);
      });
      // Contained rear Canvas; readable DOM cores need no geometry mask. A small
      // quantized rim shares the existing scene light/field and pointer clock.
      const tint=latestScene.field.asciiTint,neutral=[200,214,201];
      publisher.style(root,'--scene-rim-rgb',neutral.map((v,i)=>Math.round(v*.88+tint[i]*255*.12)).join(' '));
      publisher.style(root,'--scene-rim-strength',Math.round(Math.min(1,Math.max(0,.35+(latestScene.light.rimEnergy-1)*1.5))*20)/20);
      publisher.style(root,'--scene-rim-x',Math.round(50+latestScene.light.areaAzimuthDeg*2+pointer.x*15)+'%');
      if(progress.current)publisher.style(progress.current,'transform','scaleX('+Math.min(1,reading.visualDocY/Math.max(1,plan.maxScroll))+')');
      publisher.text(status.current,String(chapter.index+1).padStart(2,'0')+' / 07');
      const stageU=playbackScore.chapterWeights.reduce((sum,weight,index)=>sum+weight*(index+.5)/7,0);
      if(state.modelRecovering!==recovering)input.commands.execute('model.interact',{modelRecovering:recovering});
      input.publishFrame({
        controllerFrame,u,...reading,...readingScore,readingStageU:readingScore.stageU,stageU,playback:playbackScore,chapterScene:latestScene,
        editorial:{lightSweep:0,materialLift:0},pointer,modelHover,hidden:false,
        inspection:{...inspection.value,lightMix:0},inspectionSettled:inspection.settled,
        inspectionActive:inspectionWeight>0,inspectionWeight,inspectionViewport,modelViewports,
        compositionMode:'viewport-stage',independentAscii:true,informationChapter:chapter.id,canvasLocal:false,canvasPresented:canvasActive&&!canvasAwaitingPaint&&canvasPlacement.opacity>0,canvasPlacement:{...canvasPlacement},canvasSurface,
      });
      canvasEvents.consume(canvasMotion.events,controllerFrame);
      moving=canvasEvents.flush({presented:input.getPresentation(),requiresScene:state.sceneEnabled&&!state.sceneFailed})||moving;
      history.push({time:now,...reading,...readingScore,playback:{chapterId:playbackScore.chapterId,activeSeconds:playbackScore.activeSeconds,loopPhase:playbackScore.loopPhase,tempo:playbackScore.tempo,needsFrame:playbackScore.needsFrame}});
      if(history.length>240)history.shift();
      if(playbackScore.needsFrame||moving||!reading.settled||!inspection.settled)schedule();else previous=0;
    };
    function schedule(){scheduler.schedule();}
    const move=event=>{
      if(scheduler.suspended)return;
      if(liquidPresenter.pointer(event))schedule();
      if(!['mouse','pen'].includes(event.pointerType))return;
      pointerMoved=true;pointerClient={x:event.clientX,y:event.clientY};
      pointerSurface=event.target.closest?.('[data-model-viewport]')??document.querySelector(`[data-model-viewport][data-study-chapter="${input.get().canvasPlacement?.chapter}"]`);
      // Explicit source hover remains usable with Reduced motion or with a pen;
      // decorative whole-page tilt still respects the original pointer policy.
      if(!fine.matches||input.get().reduced){pointerActive=false;pointerTarget={x:0,y:0};hovered=null;schedule();return;}
      pointerActive=true;
      pointerTarget={x:Math.min(1,Math.max(-1,event.clientX/innerWidth*2-1)),y:Math.min(1,Math.max(-1,event.clientY/innerHeight*2-1))};
      hovered=event.target.closest?.('[data-feedback-plane]')??null;
      schedule();
    };
    const reset=()=>{pointerTarget={x:0,y:0};hovered=null;focused=null;pointerFocus=false;pointerActive=false;pointerSurface=null;pointerMoved=false;lastHoverCheck=-Infinity;liquidPresenter.reset();schedule();};
    const focusout=()=>{focused=null;schedule();};
    const seek=()=>{seekPending=true;semanticSeekPending=true;schedule();};
    const focus=event=>readingManager.focus(event);
    const hash=event=>readingManager.hash(event);
    const anchor=event=>readingManager.anchor(event);

    const keyboard=event=>readingManager.key(event);
    const scroll=()=>{const shouldSeek=readingManager.scroll();if(shouldSeek)seekPending=true;schedule();};
    const wheel=event=>{if(event.ctrlKey)return;readingManager.directInput();const delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?innerHeight:1);pendingImpulse=Math.max(-1,Math.min(1,pendingImpulse+delta/600));schedule();};
    const touchstart=event=>{touchY=event.touches.length===1?event.touches[0].clientY:null;readingManager.directInput();};
    const touchmove=event=>{if(touchY===null||event.touches.length!==1)return;const y=event.touches[0].clientY;pendingImpulse=Math.max(-1,Math.min(1,pendingImpulse+(touchY-y)/500));touchY=y;schedule();};
    const touchend=()=>{touchY=null;};
    const representation=event=>{
      const detail=event.detail;if(!detail||detail.origin==='presentation'||detail.origin==='scene')return;
      const count={form:4,system:4,pattern:3}[detail.chapterId];
      if(!count||!Number.isInteger(detail.index)||detail.index<0||detail.index>=count)return;
      input.commands.execute('model.select',{chapterId:detail.chapterId,index:detail.index,selectedAt:playback.activeSeconds});
      input.publishFrame({inspectionRevision:(input.get().inspectionRevision??0)+1});
    };
    const pop=event=>readingManager.pop(event);
    const press=event=>{if(scheduler.suspended)return;readingManager.pointerInput();pointerFocus=event.type==='pointerdown';if(pointerFocus)liquidKeyboardFocus=false;if(liquidPresenter.pointer(event))schedule();const element=event.target.closest?.('[data-feedback-plane]');const item=planeMap.get(element);if(item){hovered=element;item.target.press=event.type==='pointerdown'?1:element===focused ? .35 : 0;schedule();}};
    const suspension=(reason,hidden)=>{
      const wasSuspended=scheduler.suspended;scheduler.suspend(reason,hidden);
      if(wasSuspended===scheduler.suspended)return;
      if(scheduler.suspended){
        previous=0;pendingImpulse=0;touchY=null;
        advanceChapterPlayback(playback,0,{hidden:true});
        input.publishFrame({hidden:true,playback:sampleChapterPlayback(playback)});reset();
      }else{
        pointer={x:0,y:0};resumed=true;previous=0;
        input.publishFrame({hidden:false});measure();
      }
    };
    const visibility=()=>suspension('visibility',document.hidden);
    const pagehide=()=>suspension('page',true);
    const pageshow=()=>{visibility();suspension('page',false);};
    const freeze=()=>suspension('freeze',true);
    const resume=()=>{visibility();suspension('freeze',false);};
    const resizeWindow=()=>layout.invalidate('viewport',true);
    input.events.on(scope,'layoutInvalidated',request=>layout.invalidate(request.reason,request.resumed));
    const resize=new ResizeObserver(()=>layout.invalidate('element-size'));sections.forEach(el=>resize.observe(el));
    if(stage.current)resize.observe(stage.current);
    const listen=(target,type,handler,options)=>input.events.listen(scope,target,type,handler,options);
    listen(window,'scroll',scroll,{passive:true});listen(window,'wheel',wheel,{passive:true});listen(window,'popstate',pop);listen(document,'pointerdown',press);listen(document,'pointerup',press);listen(document,'pointercancel',press);listen(window,'resize',resizeWindow);listen(window,'pointermove',move,{passive:true});
    listen(window,'touchstart',touchstart,{passive:true});listen(window,'touchmove',touchmove,{passive:true});listen(window,'touchend',touchend,{passive:true});listen(window,'touchcancel',touchend,{passive:true});listen(window,'thesis:representation',representation);
    listen(document.documentElement,'pointerleave',reset);listen(window,'blur',reset);listen(document,'visibilitychange',visibility);listen(fine,'change',reset);
    for(const query of glassPreferences)listen(query,'change',()=>{liquidPresenter.reset();layout.invalidate('liquid-preferences');});
    listen(window,'pagehide',pagehide);listen(window,'pageshow',pageshow);listen(document,'freeze',freeze);listen(document,'resume',resume);
    listen(document,'focusin',focus);listen(document,'focusout',focusout);listen(document,'click',anchor);listen(window,'hashchange',hash);listen(document,'keydown',keyboard);
    const unsubscribe=input.subscribe(()=>{
      const state=input.get();if((state.inspectionRevision??0)!==inspectionRevision){inspectionRevision=state.inspectionRevision??0;schedule();}
      if(state.reduced!==wasReduced){wasReduced=state.reduced;seekPending=true;schedule();}
      const key=[state.systemReduced,state.sceneEnabled,state.sceneFailed,state.sceneReady].join('/');if(key!==preferenceKey){preferenceKey=key;schedule();}
    });
    window.__story={inspect:()=>({...reading,...sampleReadingScore(reading,plan),controllerFrame,frameDelta,readingPending:seekPending||resumed||Math.abs(reading.nativeDocY-scrollY)>.01,playback:sampleChapterPlayback(playback),chapterScene:latestScene,informationChapter:lastChapter,pageField:pageField.inspect(),canvasPlacement:canvasPlacement?{...canvasPlacement}:null,canvasSurface,canvasAwaitingPaint,canvasTransitions:canvasEvents.inspect(),informationWindows:windowPresenter.inspect(),liquidGlass:liquidPresenter.inspect(),entry:input.entry.inspect(),libraryDiagram:libraryPresenter.inspect(),history:[...history],stops:plan.stops,scheduled:scheduler.inspect().scheduled,lifecycle:scheduler.inspect(),domPublication:publisher.inspect(),inspectionActive:!!input.get().inspectionActive,inspectionWeight:input.get().inspectionWeight,modelViewports:input.get().modelViewports,modelEngaged:!!input.get().modelEngaged,modelRecovering:!!input.get().modelRecovering,sourceSelection:input.get().sourceSelection,modelHeldSource:input.get().modelHeldSource,choreography:[...choreography].map(([element,item])=>({kind:item.kind,firstVisibleAt:item.firstVisibleAt,phase:element.dataset.choreographyPhase,settled:item.last?.settled??false})),inspection:{target:{...inspection.target},value:{...inspection.value},lightMix:0,settled:inspection.settled}})};
    input.publishFrame({hidden:scheduler.suspended});document.documentElement.setAttribute('data-cinematic-ready','');measure();if(location.hash)hash();
    return()=>{disposed=true;canvasEvents.dispose();windowPresenter.dispose();libraryPresenter.dispose();liquidPresenter.dispose();pageField.dispose();readingManager.dispose();layout.dispose();scheduler.dispose();scope.dispose();resize.disconnect();unsubscribe();document.documentElement.removeAttribute('data-cinematic-ready');delete document.documentElement.dataset.activeChapter;delete document.documentElement.dataset.chapterBeat;delete window.__story;};

  }};
}
