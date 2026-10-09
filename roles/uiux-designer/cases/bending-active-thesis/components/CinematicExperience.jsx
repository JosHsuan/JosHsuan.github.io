'use client';
import {Component, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import dynamic from 'next/dynamic';
import {createStoryInput} from './story-input';
import {cinematicChapter} from './vendor/cinematic-plan.mjs';
import {createReadingPlan, createReadingState, advanceReading, sampleReadingScore, createPlaneFeedback, advancePlaneFeedback} from './story-response.mjs';
import {createChapterPlayback, advanceChapterPlayback, sampleChapterPlayback} from './chapter-playback.mjs';
import {sampleElementChoreography} from './element-choreography.mjs';
import {sampleChapterScene} from './chapter-scene-score.mjs';
import {createInspectionState, advanceInspection, setInspectionTarget, INSPECTION_DEFAULTS} from './inspection-state.mjs';
import {createFrameScheduler} from './runtime-scheduler.mjs';
import {createDOMPublisher} from './dom-publisher.mjs';
import {createCanvasMotion, advanceCanvasMotion} from './canvas-motion.mjs';
import {viewportStageSourceViewport} from './source-scene-score.mjs';
import {createPageFieldRenderer} from './page-field-renderer.mjs';
import {createSceneRecovery} from './scene-recovery.mjs';
import ModelInspector from './ModelInspector';
import styles from './cinematic.module.css';

const Scene = dynamic(() => import('./CinematicScene'), {ssr: false});
class SceneBoundary extends Component {
  state = {failed: false};
  static getDerivedStateFromError() {return {failed: true};}
  componentDidCatch() {this.props.onFailure();}
  render() {return this.state.failed ? null : this.props.children;}
}

export default function CinematicExperience() {
  const input = useMemo(() => createStoryInput(), []);
  const inspection = useMemo(() => createInspectionState(), []);
  const [enabled, setEnabled] = useState(false), [ready, setReady] = useState(false), [failed, setFailed] = useState(false);
  const [still, setStill] = useState(false), [systemReduced, setSystemReduced] = useState(false), [hydrated, setHydrated] = useState(false);
  const [detail, setDetail] = useState('full');
  const activateStudy = useCallback(() => setEnabled(true), []);
  const stage = useRef(null), fieldCanvas=useRef(null), recovery=useRef(null), progress = useRef(null), status = useRef(null);
  const onReady = useCallback(() => setReady(true), []), onFailure = useCallback(() => {recovery.current?.fail();setFailed(true); setReady(false); document.querySelectorAll('[data-layer-caption]').forEach(element => {element.textContent='Source geometry · static view';});}, []);
  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setSystemReduced(reduced.matches);
    // Hydration reads browser-only media/data preferences once, then subscribes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    update(); setHydrated(true);
    // Respect the explicit data-saving request. Every story layer still works.
    let storage;try{storage=sessionStorage;}catch{storage=null;}
    recovery.current=createSceneRecovery(storage);
    document.documentElement.toggleAttribute('data-scene-recovery',recovery.current.recovery);
    if (!navigator.connection?.saveData && !reduced.matches && !recovery.current.recovery) setEnabled(true);
    reduced.addEventListener('change', update);
    return () => reduced.removeEventListener('change', update);
  }, []);
  useEffect(()=>{
    if(!enabled||failed)return;
    recovery.current?.begin();
    const end=()=>recovery.current?.end(),begin=()=>recovery.current?.begin();
    window.addEventListener('pagehide',end);window.addEventListener('pageshow',begin);
    return()=>{window.removeEventListener('pagehide',end);window.removeEventListener('pageshow',begin);};
  },[enabled,failed]);
  useEffect(() => {
    const reduce = systemReduced || still || !enabled || failed;
    input.set({reduced: reduce, systemReduced, paused: still, sceneEnabled: enabled, sceneFailed: failed});
    document.documentElement.toggleAttribute('data-cinematic-static', reduce);
    document.documentElement.dataset.motionPaused=String(still);
    return () => {document.documentElement.removeAttribute('data-cinematic-static');delete document.documentElement.dataset.motionPaused;};
  }, [input, systemReduced, still, enabled, failed]);
  useEffect(() => {input.set({detail});}, [input, detail]);
  useEffect(() => {document.documentElement.toggleAttribute('data-canvas-available',ready&&!failed);return()=>document.documentElement.removeAttribute('data-canvas-available');},[ready,failed]);
  useEffect(() => {
    const root = document.querySelector('[data-story-root]');
    const sections = [...document.querySelectorAll('[data-story-chapter]')];
    if (!root || sections.length !== 7) return;
    const fine = matchMedia('(hover: hover) and (pointer: fine)');
    const links = [...document.querySelectorAll('[data-chapter-link]')];
    const planeMap = new Map(), publisher = createDOMPublisher();
    const pageField=createPageFieldRenderer(fieldCanvas.current);
    let planes=[], diagrams=[];
    const reading = createReadingState(scrollY), playback = createChapterPlayback(), history = [], choreography = new Map();
    // offsetTop follows untransformed layout; rect + scrollY would feed our own
    // compensation back into anchors and cause drift on every ResizeObserver.
    const naturalY = element => {let y=0;for(let node=element;node;node=node.offsetParent)y+=node.offsetTop;return y;};
    let canvasSurface={width:1,height:1},canvasPlacement=null,canvasWasVisible=false,canvasActivation=-1,canvasAwaitingPaint=false,stableWidth=0;
    const canvasMotion=createCanvasMotion();
    let plan, offsets=[], previous=0, controllerFrame=0, frameDelta=0, resumed=true, seekPending=false, semanticSeekPending=false, seekOnScroll=false, initialHash=!!location.hash, historyNavigation=null;
    let inspectionRevision=input.get().inspectionRevision??0, wasReduced=input.get().reduced;
    let preferenceKey='', pendingImpulse=0, touchY=null, pointerActive=false, latestScene=null, lastChapter=null;
    const previousRestoration=window.history.scrollRestoration;
    window.history.scrollRestoration='manual';
    let historySequence=0,activeHistoryEntry=window.history.state?.thesisReadingId??`reading-${Date.now()}-0`,historyPosition=null;
    window.history.replaceState({...window.history.state,thesisReadingId:activeHistoryEntry},'',location.href);
    const historyPositions=new Map([[activeHistoryEntry,{x:scrollX,y:scrollY}]]);
    const rememberHistory=()=>{historyPositions.set(activeHistoryEntry,{x:scrollX,y:scrollY});};
    const restoreHistory=()=>{if(historyPosition)scrollTo({left:historyPosition.x,top:historyPosition.y,behavior:'instant'});seek();};
    let pointer={x:0,y:0}, pointerTarget={x:0,y:0}, hovered=null, focused=null, pointerFocus=false;
    let pointerSurface=null,pointerClient={x:0,y:0},pointerMoved=false,lastHoverCheck=-Infinity,disposed=false;
    const scheduler=createFrameScheduler({request:callback=>requestAnimationFrame(callback),cancel:id=>cancelAnimationFrame(id),onFrame:now=>tick(now)});
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
      planes=[...document.querySelectorAll('[data-feedback-plane]')].map(element=>{
        if(!planeMap.has(element))planeMap.set(element,{element,response:createPlaneFeedback(),target:{x:0,y:0,press:0}});
        return planeMap.get(element);
      });
      for(const element of planeMap.keys())if(!element.isConnected)planeMap.delete(element);
      diagrams=[...document.querySelectorAll('[data-source-diagram]')].map(element=>({element,index:Math.max(0,sections.indexOf(element.closest('[data-story-chapter]')))}));
      for(const element of choreography.keys())if(!element.isConnected)choreography.delete(element);
      offsets=sections.map(naturalY);offsets.push(naturalY(sections.at(-1))+sections.at(-1).offsetHeight);
      const candidates=[...root.querySelectorAll('[data-story-heading],[data-editorial-copy],[data-story-media],[data-model-viewport],[data-reading-copy]')];
      const stops=candidates.flatMap((element,index)=>{
        const host=element.closest('[data-model-study-host]');
        if(element.hasAttribute('data-model-viewport')&&host&&getComputedStyle(host).position==='sticky')return [];
        const y=naturalY(element),height=element.offsetHeight;
        const first=y+Math.min(height*.5,innerHeight*.22)-innerHeight*.42;
        return [{id:`reading-${index}`,y:first},...(height>innerHeight*.65?[{id:`reading-${index}-end`,y:y+height-innerHeight*.7}]:[])];
      });
      plan=createReadingPlan({anchors:offsets,viewportHeight:innerHeight,maxScroll:Math.max(0,document.documentElement.scrollHeight-innerHeight),stops});
      const counters=new Map();
      document.querySelectorAll('[data-choreography]').forEach(element=>{
        const kind=element.dataset.choreography||'prose', section=element.closest('[data-story-chapter]');
        const key=`${section?.id??'page'}:${kind}`, index=counters.get(key)??0;counters.set(key,index+1);
        if(!choreography.has(element))choreography.set(element,{kind,index,firstVisibleAt:null,last:null});
        const host=element.closest('[data-model-study-host]');
        Object.assign(choreography.get(element),{top:naturalY(element),height:element.offsetHeight,viewportFixed:!!element.closest('[data-page-masthead],[data-story-navigation],[data-reading-tools]'),stickyStudy:!!host&&getComputedStyle(host).position==='sticky'});
      });
      if(initialHash)hash();schedule();
    };
    const tick = now => {
      if(scheduler.suspended||!plan)return;
      const didResume=resumed,didSeek=semanticSeekPending,dt=previous?(now-previous)/1000:1/60;previous=now;
      controllerFrame++;frameDelta=dt;
      let state=input.get();
      if(state.sceneEnabled&&!state.sceneFailed)recovery.current?.heartbeat();
      advanceReading(reading,scrollY,dt,{plan,reducedMotion:state.reduced,resumed,seek:seekPending});
      const readingScore=sampleReadingScore(reading,plan),u=readingScore.nativeU;
      // Native reading selects a semantic chapter. It never supplies scene time.
      const chapter=cinematicChapter(u);
      if(lastChapter!==chapter.id&&state.modelInteractionChapter&&state.modelInteractionChapter!==chapter.id){
        setInspectionTarget(inspection,{azimuth:INSPECTION_DEFAULTS.azimuth,elevation:INSPECTION_DEFAULTS.elevation});
        input.set({modelEngaged:false,modelRecovering:false,modelInteractionChapter:null,modelHover:{x:0,y:0,strength:0,chapterId:null}});
        state=input.get();
      }
      const requested=state.sourceSelection,requestAge=playback.activeSeconds-(requested?.selectedAt??-Infinity);
      const explicitChapter=state.modelEngaged?state.modelInteractionChapter:requested?.chapterId===chapter.id&&requestAge>=0&&requestAge<8?requested.chapterId:undefined;
      canvasPlacement=advanceCanvasMotion(canvasMotion,dt,{anchors:offsets,docY:scrollY,viewport:{width:canvasSurface.width,height:canvasSurface.height},reducedMotion:state.reduced,seek:didSeek||didResume,forcedChapter:explicitChapter});
      advanceInspection(inspection,dt,{reducedMotion:state.reduced,resumed});
      const recovering=!!state.modelRecovering&&!inspection.settled;
      const impulse=pendingImpulse;pendingImpulse=0;
      advanceChapterPlayback(playback,dt,{
        chapter:canvasPlacement.chapter,impulse,paused:state.paused||!state.sceneEnabled||state.sceneFailed,
        reducedMotion:!!state.systemReduced,resumed,engaged:!!state.modelEngaged||recovering,
        seek:didSeek||lastChapter===null,
      });
      const playbackScore=sampleChapterPlayback(playback);
      lastChapter=chapter.id;resumed=false;seekPending=false;semanticSeekPending=false;
      publisher.style(root,'--reading-shift',readingScore.readingShiftY+'px');
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

      choreography.forEach((item,element)=>{
        if(item.last?.settled)return;
        // Sticky visibility uses the batched current rect, never reading anchors.
        const rect=stickyRects.get(element);
        const top=rect?rect.top:item.top-(item.viewportFixed?0:reading.visualDocY),bottom=rect?rect.bottom:top+item.height;
        const visible=bottom>(item.viewportFixed?0:80)&&top<innerHeight-(item.viewportFixed?0:24);
        if(visible&&item.firstVisibleAt===null)item.firstVisibleAt=playbackScore.activeSeconds;
        if(visible&&(didSeek||state.systemReduced||state.paused||state.sceneFailed))item.firstVisibleAt=playbackScore.activeSeconds-3;
        if(item.firstVisibleAt===null)return;
        const value=sampleElementChoreography({kind:item.kind,index:item.index,elapsed:playbackScore.activeSeconds-item.firstVisibleAt,reducedMotion:state.reduced,light:state.detail==='light'});
        const values={'x':[value.x,'px'],'y':[value.y,'px'],'z':[value.z,'px'],'rx':[value.rotateX,'deg'],'ry':[value.rotateY,'deg'],'rz':[value.rotateZ,'deg'],'scale':[value.scale,''],'shadow':[value.shadowDepth,'px']};
        for(const [key,[amount,unit]]of Object.entries(values))publisher.style(element,'--choreo-'+key,amount+unit);
        publisher.style(element,'--choreo-transform','translate3d('+value.x+'px,'+value.y+'px,'+value.z+'px) rotateX('+value.rotateX+'deg) rotateY('+value.rotateY+'deg) rotateZ('+value.rotateZ+'deg) scale('+value.scale+')');
        publisher.style(element,'--choreo-progress',value.ruleProgress);
        publisher.attribute(element,'data-choreography-phase',value.phase);item.last=state.sceneEnabled?value:null;
      });
      sections.forEach((section,index)=>{
        publisher.style(section,'--attention',state.reduced?1:Math.max(.25,Number(index===chapter.index)));
        publisher.style(section,'--energy',state.reduced?0:playbackScore.energy);
      });
      planes.forEach(item=>{
        const active=item.element===hovered||item.element===focused;
        const target=!state.reduced&&active&&(fine.matches||item.element===focused)?item.target:{x:0,y:0,press:0};
        advancePlaneFeedback(item.response,target,dt,{reducedMotion:state.reduced,resumed:didResume});
        const value=item.response.value??item.response,amplitude=item.element.hasAttribute('data-editorial-copy')?1.2:3;
        publisher.attribute(item.element,'data-feedback-active',Math.abs(value.x)+Math.abs(value.y)+Math.abs(value.press)>.0001?'':null);
        publisher.style(item.element,'--feedback-x',-value.y*amplitude+'deg');publisher.style(item.element,'--feedback-y',value.x*amplitude+'deg');publisher.style(item.element,'--feedback-z',value.press*(amplitude>2?12:4)+'px');
        moving=moving||!item.response.settled;
      });

      // Chapter boundaries own the viewport hold. Information rectangles never
      // determine the scene size or camera framing.
      const modelViewports={};
      let inspectionWeight=0,inspectionViewport=state.inspectionViewport;
      const canvasChapter=canvasPlacement.chapter;
      const authoredViewport=viewportStageSourceViewport(canvasSurface.width/canvasSurface.height,canvasSurface.width);
      const canvasActive=canvasPlacement.visible&&state.sceneEnabled&&!state.sceneFailed;
      if(canvasActive&&!canvasWasVisible)canvasActivation=controllerFrame;
      canvasWasVisible=canvasActive;
      const presented=input.getPresentation();
      canvasAwaitingPaint=canvasActive&&(presented.controllerFrame<canvasActivation||presented.chapterId!==canvasChapter);
      publisher.style(stage.current,'transform',`translate3d(${canvasPlacement.x}px,${canvasPlacement.y}px,0) scale(${canvasPlacement.scale})`);
      publisher.style(stage.current,'opacity',canvasAwaitingPaint?0:canvasPlacement.opacity);
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
      latestScene=sampleChapterScene(playbackScore,{reducedMotion:!!state.systemReduced,quality:state.detail,aspect:canvasSurface.width/canvasSurface.height,pointer:{...pointer,uv:fieldUv,active:fieldActive,strength:modelHover.strength||.35}});
      pageField.render({field:latestScene.field,frameTimeMs:now,paused:state.paused||!state.sceneEnabled||state.sceneFailed,hidden:state.hidden,systemReduced:state.systemReduced},canvasSurface.width,canvasSurface.height);
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
      input.set({
        controllerFrame,u,...reading,...readingScore,readingStageU:readingScore.stageU,stageU,playback:playbackScore,chapterScene:latestScene,
        editorial:{lightSweep:0,materialLift:0},pointer,modelHover,hidden:false,modelRecovering:recovering,
        inspection:{...inspection.value,lightMix:0},inspectionSettled:inspection.settled,
        inspectionActive:inspectionWeight>0,inspectionWeight,inspectionViewport,modelViewports,
        compositionMode:'viewport-stage',independentAscii:true,informationChapter:chapter.id,canvasLocal:false,canvasPresented:canvasActive&&!canvasAwaitingPaint&&canvasPlacement.opacity>0,canvasPlacement:{...canvasPlacement},canvasSurface,
      });
      history.push({time:now,...reading,...readingScore,playback:{chapterId:playbackScore.chapterId,activeSeconds:playbackScore.activeSeconds,loopPhase:playbackScore.loopPhase,tempo:playbackScore.tempo,needsFrame:playbackScore.needsFrame}});
      if(history.length>240)history.shift();
      if(playbackScore.needsFrame||moving||!reading.settled||!inspection.settled)schedule();else previous=0;
    };
    function schedule(){scheduler.schedule();}
    const move=event=>{
      if(scheduler.suspended||!['mouse','pen'].includes(event.pointerType))return;
      pointerMoved=true;pointerClient={x:event.clientX,y:event.clientY};
      pointerSurface=event.target.closest?.('[data-model-viewport]')??document.querySelector(`[data-model-viewport][data-study-chapter="${input.get().canvasPlacement?.chapter}"]`);
      // Explicit source hover remains usable while paused/Reduced or with a pen;
      // decorative whole-page tilt still respects the original pointer policy.
      if(!fine.matches||input.get().reduced){pointerActive=false;pointerTarget={x:0,y:0};hovered=null;schedule();return;}
      pointerActive=true;
      pointerTarget={x:Math.min(1,Math.max(-1,event.clientX/innerWidth*2-1)),y:Math.min(1,Math.max(-1,event.clientY/innerHeight*2-1))};
      hovered=event.target.closest?.('[data-feedback-plane]')??null;
      schedule();
    };
    const reset=()=>{pointerTarget={x:0,y:0};hovered=null;focused=null;pointerFocus=false;pointerActive=false;pointerSurface=null;pointerMoved=false;lastHoverCheck=-Infinity;schedule();};
    const focusout=()=>{focused=null;schedule();};
    const seek=()=>{seekPending=true;semanticSeekPending=true;schedule();};
    const focus=event=>{focused=event.target.closest?.('[data-feedback-plane]')??event.target.querySelector?.('[data-feedback-plane]')??null;const item=planeMap.get(focused);if(item)item.target={x:.3,y:-.3,press:.35};if(root.contains(event.target)&&!pointerFocus){seekOnScroll=false;const top=naturalY(event.target),bottom=top+event.target.offsetHeight,safeBottom=innerHeight-(innerWidth<=780?90:40);let y=scrollY;if(top<y+110)y=top-110;else if(bottom>y+safeBottom)y=Math.min(top-110,bottom-safeBottom);if(y!==scrollY)scrollTo({top:Math.max(0,y),behavior:'instant'});seek();}};
    const hash=event=>{if(event?.newURL===historyNavigation){restoreHistory();historyNavigation=null;return;}let id;try{id=decodeURIComponent(location.hash.slice(1));}catch{return;}const target=document.getElementById(id);if(target&&root.contains(target)){scrollTo({top:Math.max(0,naturalY(target)-parseFloat(getComputedStyle(target).scrollMarginTop||0)),behavior:'instant'});seek();}};
    const anchor=event=>{const link=event.target.closest?.('a[href^="#"]');if(!link||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;const id=link.getAttribute('href');const target=document.getElementById(id.slice(1));if(!target)return;event.preventDefault();initialHash=false;historyNavigation=null;historyPush(id);hash();target.focus({preventScroll:true});};
    const historyPush=id=>{rememberHistory();window.history.replaceState({...window.history.state,thesisReadingId:activeHistoryEntry,thesisReadingPosition:historyPositions.get(activeHistoryEntry)},'',location.href);activeHistoryEntry=`reading-${Date.now()}-${++historySequence}`;window.history.pushState({...window.history.state,thesisReadingId:activeHistoryEntry,thesisReadingPosition:null},'',id);rememberHistory();};
    const keyboard=event=>{pointerFocus=false;initialHash=false;if(event.defaultPrevented||event.target.closest('input,select,textarea,[contenteditable=true]'))return;if(['PageDown','PageUp','Home','End'].includes(event.key)&&!event.altKey&&!event.metaKey){event.preventDefault();const max=Math.max(0,document.documentElement.scrollHeight-innerHeight);const top={Home:0,End:max,PageDown:Math.min(max,scrollY+innerHeight*.85),PageUp:Math.max(0,scrollY-innerHeight*.85)}[event.key];scrollTo({top,behavior:'instant'});seekOnScroll=true;seek();}else if(event.key==='Tab'){seekOnScroll=true;seek();}};
    const scroll=()=>{if(!historyNavigation)rememberHistory();if(!input.get().reduced)publisher.style(root,'--reading-shift',`${scrollY-reading.visualDocY}px`);if(seekOnScroll){seekPending=true;seekOnScroll=false;}schedule();};
    const wheel=event=>{if(event.ctrlKey)return;initialHash=false;historyNavigation=null;seekOnScroll=false;const delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?innerHeight:1);pendingImpulse=Math.max(-1,Math.min(1,pendingImpulse+delta/600));schedule();};
    const touchstart=event=>{touchY=event.touches.length===1?event.touches[0].clientY:null;initialHash=false;historyNavigation=null;seekOnScroll=false;};
    const touchmove=event=>{if(touchY===null||event.touches.length!==1)return;const y=event.touches[0].clientY;pendingImpulse=Math.max(-1,Math.min(1,pendingImpulse+(touchY-y)/500));touchY=y;schedule();};
    const touchend=()=>{touchY=null;};
    const representation=event=>{
      const detail=event.detail;if(!detail||detail.origin==='presentation'||detail.origin==='scene')return;
      const count={form:4,system:4,pattern:3}[detail.chapterId];
      if(!count||!Number.isInteger(detail.index)||detail.index<0||detail.index>=count)return;
      input.set({sourceSelection:{chapterId:detail.chapterId,index:detail.index,selectedAt:playback.activeSeconds},inspectionRevision:(input.get().inspectionRevision??0)+1});
    };
    const pop=event=>{initialHash=false;historyNavigation=location.href;activeHistoryEntry=event.state?.thesisReadingId??`reading-${Date.now()}-${++historySequence}`;historyPosition=historyPositions.get(activeHistoryEntry)??event.state?.thesisReadingPosition??{x:0,y:0};seekOnScroll=true;restoreHistory();};
    const press=event=>{initialHash=false;pointerFocus=event.type==='pointerdown';const element=event.target.closest?.('[data-feedback-plane]');const item=planeMap.get(element);if(item){hovered=element;item.target.press=event.type==='pointerdown'?1:element===focused ? .35 : 0;schedule();}};
    const suspension=(reason,hidden)=>{
      const wasSuspended=scheduler.suspended;scheduler.suspend(reason,hidden);
      if(wasSuspended===scheduler.suspended)return;
      if(scheduler.suspended){
        previous=0;pendingImpulse=0;touchY=null;
        advanceChapterPlayback(playback,0,{hidden:true});
        input.set({hidden:true,playback:sampleChapterPlayback(playback)});reset();
      }else{
        pointer={x:0,y:0};resumed=true;previous=0;
        input.set({hidden:false});measure();
      }
    };
    const visibility=()=>suspension('visibility',document.hidden);
    const pagehide=()=>suspension('page',true);
    const pageshow=()=>{visibility();suspension('page',false);};
    const freeze=()=>suspension('freeze',true);
    const resume=()=>{visibility();suspension('freeze',false);};
    const resizeWindow=()=>{resumed=true;measure();};
    const resize=new ResizeObserver(measure);sections.forEach(el=>resize.observe(el));
    if(stage.current)resize.observe(stage.current);
    window.addEventListener('scroll',scroll,{passive:true});window.addEventListener('wheel',wheel,{passive:true});window.addEventListener('popstate',pop);document.addEventListener('pointerdown',press);document.addEventListener('pointerup',press);document.addEventListener('pointercancel',press);window.addEventListener('resize',resizeWindow);window.addEventListener('pointermove',move,{passive:true});
    window.addEventListener('touchstart',touchstart,{passive:true});window.addEventListener('touchmove',touchmove,{passive:true});window.addEventListener('touchend',touchend,{passive:true});window.addEventListener('touchcancel',touchend,{passive:true});window.addEventListener('thesis:representation',representation);
    document.documentElement.addEventListener('pointerleave',reset);window.addEventListener('blur',reset);document.addEventListener('visibilitychange',visibility);fine.addEventListener('change',reset);
    window.addEventListener('pagehide',pagehide);window.addEventListener('pageshow',pageshow);document.addEventListener('freeze',freeze);document.addEventListener('resume',resume);
    document.addEventListener('focusin',focus);document.addEventListener('focusout',focusout);document.addEventListener('click',anchor);window.addEventListener('hashchange',hash);document.addEventListener('keydown',keyboard);
    const unsubscribe=input.subscribe(()=>{
      const state=input.get();if((state.inspectionRevision??0)!==inspectionRevision){inspectionRevision=state.inspectionRevision??0;schedule();}
      if(state.reduced!==wasReduced){wasReduced=state.reduced;seekPending=true;schedule();}
      const key=[state.paused,state.systemReduced,state.sceneEnabled,state.sceneFailed,state.detail].join('/');if(key!==preferenceKey){preferenceKey=key;schedule();}
    });
    window.__story={inspect:()=>({...reading,...sampleReadingScore(reading,plan),controllerFrame,frameDelta,readingPending:seekPending||resumed||Math.abs(reading.nativeDocY-scrollY)>.01,playback:sampleChapterPlayback(playback),chapterScene:latestScene,informationChapter:lastChapter,pageField:pageField.inspect(),canvasPlacement:canvasPlacement?{...canvasPlacement}:null,canvasSurface,canvasAwaitingPaint,history:[...history],stops:plan.stops,scheduled:scheduler.inspect().scheduled,lifecycle:scheduler.inspect(),domPublication:publisher.inspect(),inspectionActive:!!input.get().inspectionActive,inspectionWeight:input.get().inspectionWeight,modelViewports:input.get().modelViewports,modelEngaged:!!input.get().modelEngaged,modelRecovering:!!input.get().modelRecovering,sourceSelection:input.get().sourceSelection,choreography:[...choreography].map(([element,item])=>({kind:item.kind,firstVisibleAt:item.firstVisibleAt,phase:element.dataset.choreographyPhase,settled:item.last?.settled??false})),inspection:{target:{...inspection.target},value:{...inspection.value},lightMix:0,settled:inspection.settled}})};
    input.set({hidden:scheduler.suspended});document.documentElement.setAttribute('data-cinematic-ready','');measure();if(location.hash)hash();
    return()=>{disposed=true;pageField.dispose();window.history.scrollRestoration=previousRestoration;scheduler.dispose();window.removeEventListener('pagehide',pagehide);window.removeEventListener('pageshow',pageshow);document.removeEventListener('freeze',freeze);document.removeEventListener('resume',resume);resize.disconnect();unsubscribe();window.removeEventListener('scroll',scroll);window.removeEventListener('wheel',wheel);window.removeEventListener('touchstart',touchstart);window.removeEventListener('touchmove',touchmove);window.removeEventListener('touchend',touchend);window.removeEventListener('touchcancel',touchend);window.removeEventListener('thesis:representation',representation);window.removeEventListener('popstate',pop);document.removeEventListener('pointerdown',press);document.removeEventListener('pointerup',press);document.removeEventListener('pointercancel',press);window.removeEventListener('resize',resizeWindow);window.removeEventListener('pointermove',move);document.documentElement.removeEventListener('pointerleave',reset);window.removeEventListener('blur',reset);document.removeEventListener('visibilitychange',visibility);fine.removeEventListener('change',reset);document.removeEventListener('focusin',focus);document.removeEventListener('focusout',focusout);document.removeEventListener('click',anchor);window.removeEventListener('hashchange',hash);document.removeEventListener('keydown',keyboard);document.documentElement.removeAttribute('data-cinematic-ready');delete document.documentElement.dataset.activeChapter;delete document.documentElement.dataset.chapterBeat;root.style.removeProperty('--reading-shift');delete window.__story;};
  }, [input, inspection]);
  // Discrete preference changes also wake the DOM decoration controller once.
  useEffect(() => {window.dispatchEvent(new Event('resize'));}, [still, systemReduced, detail, enabled, failed, ready]);
  return <>
    <div className={styles.backdrop} aria-hidden="true" data-cinematic-background>
      {!ready&&<picture><source media="(max-width:780px)" srcSet="/assets/cinematic/model-poster-mobile.webp"/><img className={styles.poster} src="/assets/cinematic/model-poster.webp" alt=""/></picture>}
      <div className={styles.vignette} data-cinematic-vignette />
    </div>
    <div className={styles.stage} ref={stage} style={{visibility: ready ? 'visible' : 'hidden'}} aria-hidden="true" data-cinematic-stage>
      {enabled && !failed && <SceneBoundary onFailure={onFailure}><Scene input={input} onReady={onReady} onFailure={onFailure} /></SceneBoundary>}
    </div>
    <canvas className={styles.asciiField} ref={fieldCanvas} data-ascii-field aria-hidden="true"/>
    {hydrated && <div className={styles.readingTools} data-protect data-reading-tools>
      <span ref={status} aria-hidden="true" data-choreography="nav">01 / 07</span>
      <label className={styles.detailLabel}><span data-choreography="caption">Visual detail</span><select aria-label="Visual detail" value={detail} onChange={event => setDetail(event.target.value)}><option value="full">Full</option><option value="light">Light</option></select></label>
      <button type="button" aria-pressed={still || systemReduced || !enabled || failed} disabled={systemReduced || failed} onClick={() => {if (!enabled) {setEnabled(true); setStill(false);} else setStill(value => !value);}}><span data-choreography="nav">{failed ? 'Still background' : systemReduced ? 'Reduced motion' : !enabled ? 'Enable 3D' : still ? 'Resume motion' : 'Pause motion'}</span></button>
    </div>}
    <ModelInspector input={input} inspection={inspection} activate={activateStudy} ready={ready} failed={failed}/>
    <div className={styles.progress} aria-hidden="true"><span ref={progress} /></div>
  </>;
}
