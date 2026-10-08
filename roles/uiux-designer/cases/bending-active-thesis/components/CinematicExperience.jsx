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
  const stage = useRef(null), progress = useRef(null), status = useRef(null), scrim = useRef(null);
  const onReady = useCallback(() => setReady(true), []), onFailure = useCallback(() => {setFailed(true); setReady(false); document.querySelectorAll('[data-layer-caption]').forEach(element => {element.textContent='Source geometry · static view';});}, []);
  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setSystemReduced(reduced.matches);
    // Hydration reads browser-only media/data preferences once, then subscribes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    update(); setHydrated(true);
    // Respect the explicit data-saving request. Every story layer still works.
    if (!navigator.connection?.saveData && !reduced.matches) setEnabled(true);
    reduced.addEventListener('change', update);
    return () => reduced.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    const reduce = systemReduced || still || !enabled || failed;
    input.set({reduced: reduce, systemReduced, paused: still, sceneEnabled: enabled, sceneFailed: failed});
    document.documentElement.toggleAttribute('data-cinematic-static', reduce);
    document.documentElement.dataset.motionPaused=String(still);
    return () => {document.documentElement.removeAttribute('data-cinematic-static');delete document.documentElement.dataset.motionPaused;};
  }, [input, systemReduced, still, enabled, failed]);
  useEffect(() => {input.set({detail});}, [input, detail]);
  useEffect(() => {
    const root = document.querySelector('[data-story-root]');
    const sections = [...document.querySelectorAll('[data-story-chapter]')];
    if (!root || sections.length !== 7) return;
    const fine = matchMedia('(hover: hover) and (pointer: fine)');
    const links = [...document.querySelectorAll('[data-chapter-link]')];
    const planes = [...document.querySelectorAll('[data-feedback-plane]')].map(element => ({element, response:createPlaneFeedback(), target:{x:0,y:0,press:0}}));
    const reading = createReadingState(scrollY), playback = createChapterPlayback(), history = [], choreography = new Map();
    // offsetTop follows untransformed layout; rect + scrollY would feed our own
    // compensation back into anchors and cause drift on every ResizeObserver.
    const naturalY = element => {let y=0;for(let node=element;node;node=node.offsetParent)y+=node.offsetTop;return y;};
    const ease = value => {const t=Math.min(1,Math.max(0,value));return t*t*t*(10+t*(-15+6*t));};
    let plan, offsets=[], frame=0, previous=0, controllerFrame=0, frameDelta=0, resumed=true, seekPending=false, semanticSeekPending=false, seekOnScroll=false, initialHash=!!location.hash, historyNavigation=null;
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
    let pointerSurface=null,pointerClient={x:0,y:0};
    const measure = () => {
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
      frame=0;if(document.hidden||!plan)return;
      const didResume=resumed,didSeek=semanticSeekPending,dt=previous?(now-previous)/1000:1/60;previous=now;
      controllerFrame++;frameDelta=dt;
      let state=input.get();
      advanceReading(reading,scrollY,dt,{plan,reducedMotion:state.reduced,resumed,seek:seekPending});
      const readingScore=sampleReadingScore(reading,plan),u=readingScore.nativeU;
      // Native reading selects a semantic chapter. It never supplies scene time.
      const chapter=cinematicChapter(u);
      if(lastChapter!==chapter.id&&state.modelInteractionChapter&&state.modelInteractionChapter!==chapter.id){
        setInspectionTarget(inspection,{azimuth:INSPECTION_DEFAULTS.azimuth,elevation:INSPECTION_DEFAULTS.elevation});
        input.set({modelEngaged:false,modelRecovering:false,modelInteractionChapter:null,modelHover:{x:0,y:0,strength:0,chapterId:null}});
        state=input.get();
      }
      advanceInspection(inspection,dt,{reducedMotion:state.reduced,resumed});
      const recovering=!!state.modelRecovering&&!inspection.settled;
      const impulse=pendingImpulse;pendingImpulse=0;
      advanceChapterPlayback(playback,dt,{
        chapter:chapter.id,impulse,paused:state.paused||!state.sceneEnabled||state.sceneFailed,
        reducedMotion:!!state.systemReduced,resumed,engaged:!!state.modelEngaged||recovering,
        seek:didSeek||lastChapter===null,
      });
      const playbackScore=sampleChapterPlayback(playback);
      lastChapter=chapter.id;resumed=false;seekPending=false;semanticSeekPending=false;
      root.style.setProperty('--reading-shift',readingScore.readingShiftY+'px');
      document.documentElement.dataset.activeChapter=chapter.id;
      document.documentElement.dataset.chapterBeat=playbackScore.beat;
      links.forEach(link=>{if(link.dataset.chapterLink===chapter.id)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});

      const decorate=fine.matches&&!state.reduced,alpha=1-Math.exp(-10*Math.min(dt,1)),next=decorate?pointerTarget:{x:0,y:0};
      pointer={x:pointer.x+(next.x-pointer.x)*alpha,y:pointer.y+(next.y-pointer.y)*alpha};
      let moving=Math.abs(pointer.x-next.x)+Math.abs(pointer.y-next.y)>.001;if(!moving)pointer={...next};

      choreography.forEach((item,element)=>{
        if(!element.isConnected){choreography.delete(element);return;}
        // Sticky visibility may use a live rect; it never feeds reading anchors.
        const rect=item.stickyStudy?element.getBoundingClientRect():null;
        const top=rect?rect.top:item.top-(item.viewportFixed?0:reading.visualDocY),bottom=rect?rect.bottom:top+item.height;
        const visible=bottom>(item.viewportFixed?0:80)&&top<innerHeight-(item.viewportFixed?0:24);
        if(visible&&item.firstVisibleAt===null)item.firstVisibleAt=playbackScore.activeSeconds;
        if(visible&&(didSeek||state.systemReduced||state.paused||state.sceneFailed))item.firstVisibleAt=playbackScore.activeSeconds-3;
        if(item.firstVisibleAt===null)return;
        if(item.last?.settled)return;
        const value=sampleElementChoreography({kind:item.kind,index:item.index,elapsed:playbackScore.activeSeconds-item.firstVisibleAt,reducedMotion:state.reduced,light:state.detail==='light'});
        const values={'x':[value.x,'px'],'y':[value.y,'px'],'z':[value.z,'px'],'rx':[value.rotateX,'deg'],'ry':[value.rotateY,'deg'],'rz':[value.rotateZ,'deg'],'scale':[value.scale,''],'shadow':[value.shadowDepth,'px']};
        for(const [key,[amount,unit]]of Object.entries(values))element.style.setProperty('--choreo-'+key,amount+unit);
        element.style.setProperty('--choreo-transform','translate3d('+value.x+'px,'+value.y+'px,'+value.z+'px) rotateX('+value.rotateX+'deg) rotateY('+value.rotateY+'deg) rotateZ('+value.rotateZ+'deg) scale('+value.scale+')');
        element.style.setProperty('--choreo-progress',String(value.ruleProgress));
        element.dataset.choreographyPhase=value.phase;item.last=state.sceneEnabled?value:null;
      });
      sections.forEach((section,index)=>{
        section.style.setProperty('--attention',String(state.reduced?1:Math.max(.25,playbackScore.chapterWeights[index])));
        section.style.setProperty('--energy',String(state.reduced?0:playbackScore.energy));
      });
      planes.forEach(item=>{
        const active=item.element===hovered||item.element===focused;
        const target=!state.reduced&&active&&(fine.matches||item.element===focused)?item.target:{x:0,y:0,press:0};
        advancePlaneFeedback(item.response,target,dt,{reducedMotion:state.reduced,resumed:didResume});
        const value=item.response.value??item.response,amplitude=item.element.hasAttribute('data-editorial-copy')?1.2:3;
        item.element.style.setProperty('--feedback-x',-value.y*amplitude+'deg');item.element.style.setProperty('--feedback-y',value.x*amplitude+'deg');item.element.style.setProperty('--feedback-z',value.press*(amplitude>2?12:4)+'px');
        moving=moving||!item.response.settled;
      });

      // Slots are clear natural reading positions. Only their visible clipped
      // subrect is sent to the sole camera resolver, after foreground transforms.
      const modelViewports={};
      let inspectionWeight=0,inspectionViewport=state.inspectionViewport;
      document.querySelectorAll('[data-model-viewport]').forEach(slot=>{
        const id=slot.dataset.studyChapter,r=slot.getBoundingClientRect();
        const top=Math.max(92,r.top),left=Math.max(16,r.left),right=Math.min(innerWidth-16,r.right),bottom=Math.min(innerHeight-(innerWidth<=780?86:28),r.bottom);
        const height=bottom-top,width=right-left;
        let weight=0,viewport={left:.08,top:.2,width:.84,height:.55};
        if(height>innerHeight*.16&&width>100){
          weight=ease((height/Math.max(1,r.height)-.35)/.5)*ease((height/innerHeight-.16)/.15);
          viewport={left:left/innerWidth,top:top/innerHeight,width:width/innerWidth,height:height/innerHeight};
        }
        if(id)modelViewports[id]={viewport,weight};
        if(id===chapter.id){inspectionWeight=weight;inspectionViewport=viewport;}
      });
      // A stationary pointer must cease hovering when a moving source leaves it.
      let modelHover=state.modelHover??{x:0,y:0,strength:0,chapterId:null};
      if(pointerSurface&&!state.modelEngaged){
        const under=document.elementFromPoint(pointerClient.x,pointerClient.y);
        const over=pointerSurface.isConnected&&(under===pointerSurface||pointerSurface.contains(under));
        const hit=over&&window.__thesis?.hitTest?.(pointerClient.x,pointerClient.y);
        const found=!!hit&&hit.source===true&&hit.chapterId===pointerSurface.dataset.studyChapter;
        pointerSurface.toggleAttribute('data-model-hit',found);if(found)pointerSurface.dataset.modelHit='true';
        const r=pointerSurface.getBoundingClientRect();
        modelHover={x:Math.min(1,Math.max(-1,(pointerClient.x-r.left)/Math.max(1,r.width)*2-1)),y:Math.min(1,Math.max(-1,(pointerClient.y-r.top)/Math.max(1,r.height)*2-1)),strength:found?1:0,chapterId:pointerSurface.dataset.studyChapter};
      }
      latestScene=sampleChapterScene(playbackScore,{reducedMotion:!!state.systemReduced,quality:state.detail,aspect:innerWidth/Math.max(1,innerHeight),pointer:{...pointer,active:decorate&&pointerActive,strength:modelHover.strength||.35}});
      document.querySelectorAll('[data-source-diagram]').forEach(diagram=>{
        const count=Math.max(1,Number(diagram.dataset.diagramCount)||4);
        const section=diagram.closest('[data-story-chapter]'),index=Math.max(0,sections.indexOf(section)),phase=playbackScore.phases[index];
        diagram.style.setProperty('--diagram-phase',String(phase));
        diagram.style.setProperty('--diagram-energy',String(playbackScore.energy));
        const automatic=Math.floor(phase*count)%count;
        if(diagram.dataset.autonomousIndex!==String(automatic))diagram.dataset.autonomousIndex=String(automatic);
      });
      // Protect only explicitly marked semantic cores, never a whole layout
      // panel. Empty/invalid masks fail closed to the background scene layer.
      const protectedRects=[...document.querySelectorAll('[data-protect]')].map(el=>el.getBoundingClientRect())
        .filter(r=>r.width>0&&r.height>0&&r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth)
        .map(r=>({left:Math.max(0,r.left-5),top:Math.max(0,r.top-5),right:Math.min(innerWidth,r.right+5),bottom:Math.min(innerHeight,r.bottom+5)}));
      if(stage.current)stage.current.style.setProperty('--scene-z',protectedRects.length&&latestScene.layers.foregroundMix>0?'3':'1');
      if(scrim.current){
        scrim.current.style.setProperty('--reverse',String(playbackScore.chapterWeights[4]));
        scrim.current.style.setProperty('--reading-dim',String(playbackScore.chapterWeights[6]*.8));
        scrim.current.style.setProperty('--study-weight',String(inspectionWeight));
      }
      if(progress.current)progress.current.style.transform='scaleX('+Math.min(1,reading.visualDocY/Math.max(1,document.documentElement.scrollHeight-innerHeight))+')';
      if(status.current)status.current.textContent=String(chapter.index+1).padStart(2,'0')+' / 07';
      const stageU=playbackScore.chapterWeights.reduce((sum,weight,index)=>sum+weight*(index+.5)/7,0);
      input.set({
        controllerFrame,u,...reading,...readingScore,readingStageU:readingScore.stageU,stageU,playback:playbackScore,chapterScene:latestScene,
        editorial:{lightSweep:0,materialLift:0},pointer,modelHover,protectedRects,hidden:false,modelRecovering:recovering,
        inspection:{...inspection.value,lightMix:0},inspectionSettled:inspection.settled,
        inspectionActive:inspectionWeight>0,inspectionWeight,inspectionViewport,modelViewports,
      });
      history.push({time:now,...reading,...readingScore,playback:{chapterId:playbackScore.chapterId,activeSeconds:playbackScore.activeSeconds,loopPhase:playbackScore.loopPhase,tempo:playbackScore.tempo,needsFrame:playbackScore.needsFrame}});
      if(history.length>240)history.shift();
      if(playbackScore.needsFrame||moving||!reading.settled||!inspection.settled)schedule();else previous=0;
    };
    function schedule(){if(!frame&&!document.hidden)frame=requestAnimationFrame(tick);}
    const move=event=>{
      if(event.pointerType!=='mouse'||!fine.matches||input.get().reduced)return;
      pointerActive=true;pointerClient={x:event.clientX,y:event.clientY};pointerSurface=event.target.closest?.('[data-model-viewport]')??null;
      pointerTarget={x:Math.min(1,Math.max(-1,event.clientX/innerWidth*2-1)),y:Math.min(1,Math.max(-1,event.clientY/innerHeight*2-1))};
      hovered=event.target.closest?.('[data-feedback-plane]')??null;
      const item=planes.find(item=>item.element===hovered);if(item){const r=item.element.getBoundingClientRect();item.target={x:Math.min(1,Math.max(-1,(event.clientX-r.left)/r.width*2-1)),y:Math.min(1,Math.max(-1,(event.clientY-r.top)/r.height*2-1)),press:0};}schedule();
    };
    const reset=()=>{pointerTarget={x:0,y:0};hovered=null;focused=null;pointerFocus=false;pointerActive=false;pointerSurface=null;schedule();};
    const focusout=()=>{focused=null;schedule();};
    const seek=()=>{seekPending=true;semanticSeekPending=true;schedule();};
    const focus=event=>{focused=event.target.closest?.('[data-feedback-plane]')??event.target.querySelector?.('[data-feedback-plane]')??null;const item=planes.find(item=>item.element===focused);if(item)item.target={x:.3,y:-.3,press:.35};if(root.contains(event.target)&&!pointerFocus){seekOnScroll=false;const top=naturalY(event.target),bottom=top+event.target.offsetHeight,safeBottom=innerHeight-(innerWidth<=780?90:40);let y=scrollY;if(top<y+110)y=top-110;else if(bottom>y+safeBottom)y=Math.min(top-110,bottom-safeBottom);if(y!==scrollY)scrollTo({top:Math.max(0,y),behavior:'instant'});seek();}};
    const hash=event=>{if(event?.newURL===historyNavigation){restoreHistory();historyNavigation=null;return;}let id;try{id=decodeURIComponent(location.hash.slice(1));}catch{return;}const target=document.getElementById(id);if(target&&root.contains(target)){scrollTo({top:Math.max(0,naturalY(target)-parseFloat(getComputedStyle(target).scrollMarginTop||0)),behavior:'instant'});seek();}};
    const anchor=event=>{const link=event.target.closest?.('a[href^="#"]');if(!link||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;const id=link.getAttribute('href');const target=document.getElementById(id.slice(1));if(!target)return;event.preventDefault();initialHash=false;historyNavigation=null;historyPush(id);hash();target.focus({preventScroll:true});};
    const historyPush=id=>{rememberHistory();window.history.replaceState({...window.history.state,thesisReadingId:activeHistoryEntry,thesisReadingPosition:historyPositions.get(activeHistoryEntry)},'',location.href);activeHistoryEntry=`reading-${Date.now()}-${++historySequence}`;window.history.pushState({...window.history.state,thesisReadingId:activeHistoryEntry,thesisReadingPosition:null},'',id);rememberHistory();};
    const keyboard=event=>{pointerFocus=false;initialHash=false;if(event.defaultPrevented||event.target.closest('input,select,textarea,[contenteditable=true]'))return;if(['PageDown','PageUp','Home','End'].includes(event.key)&&!event.altKey&&!event.metaKey){event.preventDefault();const max=Math.max(0,document.documentElement.scrollHeight-innerHeight);const top={Home:0,End:max,PageDown:Math.min(max,scrollY+innerHeight*.85),PageUp:Math.max(0,scrollY-innerHeight*.85)}[event.key];scrollTo({top,behavior:'instant'});seekOnScroll=true;seek();}else if(event.key==='Tab'){seekOnScroll=true;seek();}};
    const scroll=()=>{if(!historyNavigation)rememberHistory();if(!input.get().reduced)root.style.setProperty('--reading-shift',`${scrollY-reading.visualDocY}px`);if(seekOnScroll){seekPending=true;seekOnScroll=false;}schedule();};
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
    const press=event=>{initialHash=false;pointerFocus=event.type==='pointerdown';const element=event.target.closest?.('[data-feedback-plane]');const item=planes.find(item=>item.element===element);if(item){hovered=element;item.target.press=event.type==='pointerdown'?1:element===focused ? .35 : 0;schedule();}};
    const visibility=()=>{input.set({hidden:document.hidden});if(document.hidden){cancelAnimationFrame(frame);frame=0;previous=0;pendingImpulse=0;advanceChapterPlayback(playback,0,{hidden:true});input.set({playback:sampleChapterPlayback(playback)});reset();}else{pointer={x:0,y:0};resumed=true;measure();}};
    const resizeWindow=()=>{resumed=true;measure();};
    const resize=new ResizeObserver(measure);sections.forEach(el=>resize.observe(el));
    window.addEventListener('scroll',scroll,{passive:true});window.addEventListener('wheel',wheel,{passive:true});window.addEventListener('popstate',pop);document.addEventListener('pointerdown',press);document.addEventListener('pointerup',press);document.addEventListener('pointercancel',press);window.addEventListener('resize',resizeWindow);window.addEventListener('pointermove',move,{passive:true});
    window.addEventListener('touchstart',touchstart,{passive:true});window.addEventListener('touchmove',touchmove,{passive:true});window.addEventListener('touchend',touchend,{passive:true});window.addEventListener('touchcancel',touchend,{passive:true});window.addEventListener('thesis:representation',representation);
    document.documentElement.addEventListener('pointerleave',reset);window.addEventListener('blur',reset);document.addEventListener('visibilitychange',visibility);fine.addEventListener('change',reset);
    document.addEventListener('focusin',focus);document.addEventListener('focusout',focusout);document.addEventListener('click',anchor);window.addEventListener('hashchange',hash);document.addEventListener('keydown',keyboard);
    const unsubscribe=input.subscribe(()=>{
      const state=input.get();if((state.inspectionRevision??0)!==inspectionRevision){inspectionRevision=state.inspectionRevision??0;schedule();}
      if(state.reduced!==wasReduced){wasReduced=state.reduced;seekPending=true;schedule();}
      const key=[state.paused,state.systemReduced,state.sceneEnabled,state.sceneFailed,state.detail].join('/');if(key!==preferenceKey){preferenceKey=key;schedule();}
    });
    window.__story={inspect:()=>({...reading,...sampleReadingScore(reading,plan),controllerFrame,frameDelta,readingPending:seekPending||resumed||Math.abs(reading.nativeDocY-scrollY)>.01,playback:sampleChapterPlayback(playback),chapterScene:latestScene,history:[...history],stops:plan.stops,scheduled:!!frame,inspectionActive:!!input.get().inspectionActive,inspectionWeight:input.get().inspectionWeight,modelViewports:input.get().modelViewports,modelEngaged:!!input.get().modelEngaged,modelRecovering:!!input.get().modelRecovering,sourceSelection:input.get().sourceSelection,choreography:[...choreography].map(([element,item])=>({kind:item.kind,firstVisibleAt:item.firstVisibleAt,phase:element.dataset.choreographyPhase,settled:item.last?.settled??false})),inspection:{target:{...inspection.target},value:{...inspection.value},lightMix:0,settled:inspection.settled}})};
    document.documentElement.setAttribute('data-cinematic-ready','');measure();if(location.hash)hash();
    return()=>{window.history.scrollRestoration=previousRestoration;cancelAnimationFrame(frame);resize.disconnect();unsubscribe();window.removeEventListener('scroll',scroll);window.removeEventListener('wheel',wheel);window.removeEventListener('touchstart',touchstart);window.removeEventListener('touchmove',touchmove);window.removeEventListener('touchend',touchend);window.removeEventListener('touchcancel',touchend);window.removeEventListener('thesis:representation',representation);window.removeEventListener('popstate',pop);document.removeEventListener('pointerdown',press);document.removeEventListener('pointerup',press);document.removeEventListener('pointercancel',press);window.removeEventListener('resize',resizeWindow);window.removeEventListener('pointermove',move);document.documentElement.removeEventListener('pointerleave',reset);window.removeEventListener('blur',reset);document.removeEventListener('visibilitychange',visibility);fine.removeEventListener('change',reset);document.removeEventListener('focusin',focus);document.removeEventListener('focusout',focusout);document.removeEventListener('click',anchor);window.removeEventListener('hashchange',hash);document.removeEventListener('keydown',keyboard);document.documentElement.removeAttribute('data-cinematic-ready');delete document.documentElement.dataset.activeChapter;delete document.documentElement.dataset.chapterBeat;root.style.removeProperty('--reading-shift');delete window.__story;};
  }, [input, inspection]);
  // Discrete preference changes also wake the DOM decoration controller once.
  useEffect(() => {window.dispatchEvent(new Event('resize'));}, [still, systemReduced, detail, enabled, failed, ready]);
  return <>
    <div className={styles.backdrop} aria-hidden="true" data-cinematic-background>
      <picture><source media="(max-width:780px)" srcSet="/assets/cinematic/model-poster-mobile.webp"/><img className={styles.poster} src="/assets/cinematic/model-poster.webp" alt="" fetchPriority="high" style={{opacity: ready ? 0 : .35}} /></picture>
      <div className={styles.vignette} data-cinematic-vignette />
      <div className={styles.scrim} ref={scrim} data-cinematic-scrim><div className={styles.scrimLeft} /><div className={styles.scrimRight} /><div className={styles.scrimQuiet} /></div>
    </div>
    <div className={styles.stage} ref={stage} style={{visibility: ready ? 'visible' : 'hidden'}} aria-hidden="true" data-cinematic-stage>
      {enabled && !failed && <SceneBoundary onFailure={onFailure}><Scene input={input} stage={stage} onReady={onReady} onFailure={onFailure} /></SceneBoundary>}
    </div>
    {hydrated && <div className={styles.readingTools} data-protect data-reading-tools>
      <span ref={status} aria-hidden="true" data-choreography="nav">01 / 07</span>
      <label className={styles.detailLabel}><span data-choreography="caption">Visual detail</span><select aria-label="Visual detail" value={detail} onChange={event => setDetail(event.target.value)}><option value="full">Full</option><option value="light">Light</option></select></label>
      <button type="button" aria-pressed={still || systemReduced || !enabled || failed} disabled={systemReduced || failed} onClick={() => {if (!enabled) {setEnabled(true); setStill(false);} else setStill(value => !value);}}><span data-choreography="nav">{failed ? 'Still background' : systemReduced ? 'Reduced motion' : !enabled ? 'Enable 3D' : still ? 'Resume motion' : 'Pause motion'}</span></button>
    </div>}
    <ModelInspector input={input} inspection={inspection} activate={activateStudy} ready={ready} failed={failed}/>
    <div className={styles.progress} aria-hidden="true"><span ref={progress} /></div>
  </>;
}
