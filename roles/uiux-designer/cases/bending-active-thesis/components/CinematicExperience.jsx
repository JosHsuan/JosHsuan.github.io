'use client';
import {Component, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import dynamic from 'next/dynamic';
import {createStoryInput} from './story-input';
import {cinematicChapter} from './vendor/cinematic-plan.mjs';
import {createReadingPlan, createReadingState, advanceReading, sampleReadingScore, createPlaneFeedback, advancePlaneFeedback} from './story-response.mjs';
import {sampleEditorialScore} from './editorial-score.mjs';
import {createInspectionState, advanceInspection} from './inspection-state.mjs';
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
    const reduce = systemReduced || still;
    input.set({reduced: reduce});
    document.documentElement.toggleAttribute('data-cinematic-static', reduce);
    return () => document.documentElement.removeAttribute('data-cinematic-static');
  }, [input, systemReduced, still]);
  useEffect(() => {input.set({detail});}, [input, detail]);
  useEffect(() => {
    const root = document.querySelector('[data-story-root]');
    const sections = [...document.querySelectorAll('[data-story-chapter]')];
    if (!root || sections.length !== 7) return;
    const fine = matchMedia('(hover: hover) and (pointer: fine)');
    const links = [...document.querySelectorAll('[data-chapter-link]')];
    const foreground = sections.map(section => ({lines:[...section.querySelectorAll('[data-heading-line]')], rows:[...section.querySelectorAll('ol > li')]}));
    const planes = [...document.querySelectorAll('[data-feedback-plane]')].map(element => ({element, response:createPlaneFeedback(), target:{x:0,y:0,press:0}}));
    const reading = createReadingState(scrollY), lampFeedback=createPlaneFeedback(), history = [];
    // offsetTop follows untransformed layout; rect + scrollY would feed our own
    // compensation back into anchors and cause drift on every ResizeObserver.
    const naturalY = element => {let y=0;for(let node=element;node;node=node.offsetParent)y+=node.offsetTop;return y;};
    const ease = value => {const t=Math.min(1,Math.max(0,value));return t*t*t*(10+t*(-15+6*t));};
    let plan, offsets=[], frame=0, previous=0, resumed=true, seekPending=false, seekOnScroll=false, initialHash=!!location.hash, historyNavigation=null;
    let inspectionRevision=input.get().inspectionRevision??0, wasReduced=input.get().reduced;
    const previousRestoration=window.history.scrollRestoration;
    window.history.scrollRestoration='manual';
    let historySequence=0,activeHistoryEntry=window.history.state?.thesisReadingId??`reading-${Date.now()}-0`,historyPosition=null;
    window.history.replaceState({...window.history.state,thesisReadingId:activeHistoryEntry},'',location.href);
    const historyPositions=new Map([[activeHistoryEntry,{x:scrollX,y:scrollY}]]);
    const rememberHistory=()=>{historyPositions.set(activeHistoryEntry,{x:scrollX,y:scrollY});};
    const restoreHistory=()=>{if(historyPosition)scrollTo({left:historyPosition.x,top:historyPosition.y,behavior:'instant'});seek();};
    let pointer={x:0,y:0}, pointerTarget={x:0,y:0}, hovered=null, focused=null, pointerFocus=false;
    const measure = () => {
      offsets=sections.map(naturalY);offsets.push(naturalY(sections.at(-1))+sections.at(-1).offsetHeight);
      const candidates=[...root.querySelectorAll('[data-story-heading],[data-editorial-copy],[data-story-media],[data-model-viewport],[data-reading-copy]')];
      const stops=candidates.flatMap((element,index)=>{
        const y=naturalY(element),height=element.offsetHeight;
        const first=y+Math.min(height*.5,innerHeight*.22)-innerHeight*.42;
        return [{id:`reading-${index}`,y:first},...(height>innerHeight*.65?[{id:`reading-${index}-end`,y:y+height-innerHeight*.7}]:[])];
      });
      plan=createReadingPlan({anchors:offsets,viewportHeight:innerHeight,maxScroll:Math.max(0,document.documentElement.scrollHeight-innerHeight),stops});if(initialHash)hash();schedule();
    };
    const tick = now => {
      frame=0;if(document.hidden||!plan)return;
      const didResume=resumed,state=input.get(),dt=previous?(now-previous)/1000:1/60;previous=now;
      advanceReading(reading,scrollY,dt,{plan,reducedMotion:state.reduced,resumed,seek:seekPending});
      advanceInspection(inspection,dt,{reducedMotion:state.reduced,resumed});
      advancePlaneFeedback(lampFeedback,{x:0,y:0,press:inspection.target.preset==='raking'?1:0},dt,{reducedMotion:state.reduced,resumed});
      const score=sampleReadingScore(reading,plan);resumed=false;seekPending=false;
      const u=score.nativeU,visualU=score.visualU,chapter=cinematicChapter(visualU);
      root.style.setProperty('--reading-shift',`${score.readingShiftY}px`);
      document.documentElement.dataset.activeChapter=chapter.id;
      links.forEach(link=>{if(link.dataset.chapterLink===chapter.id)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});
      const decorate=fine.matches&&!state.reduced,alpha=1-Math.exp(-10*dt),next=decorate?pointerTarget:{x:0,y:0};
      pointer={x:pointer.x+(next.x-pointer.x)*alpha,y:pointer.y+(next.y-pointer.y)*alpha};
      let moving=Math.abs(pointer.x-next.x)+Math.abs(pointer.y-next.y)>.001;if(!moving)pointer={...next};
      if(scrim.current){const reverse=ease((visualU*7-3.8)/.4)*(1-ease((visualU*7-4.8)/.4));scrim.current.style.setProperty('--reverse',String(reverse));scrim.current.style.setProperty('--reading-dim',String(ease((visualU*7-5.8)/.4)*.8));}
      sections.forEach((section,index)=>{
        const phase=(reading.visualDocY+innerHeight*.45-offsets[index])/(offsets[index+1]-offsets[index]);
        const visibility=Math.min(1,Math.max(0,1-Math.abs(phase-.5)*1.2));
        const editorialInput={visualU,nativeU:u,energy:reading.energy,direction:reading.direction,holdWeight:score.holdWeight,index,reducedMotion:state.reduced,light:state.detail==='light'};
        const editorial=sampleEditorialScore(editorialInput);
        const values={'media-shift':[editorial.mediaShift,'px'],'media-scale':[editorial.mediaScale,''],'media-depth':[editorial.mediaZ??0,'px'],'media-rotate':[editorial.mediaRotateX??0,'deg'],'heading-shift':[editorial.headingShift,'px'],'body-shift':[editorial.bodyShift??0,'px'],'body-depth':[editorial.bodyZ??0,'px'],'body-rotate':[editorial.bodyRotateX??0,'deg'],'body-y':[editorial.bodyRotateY??0,'deg'],'media-y':[editorial.mediaRotateY??0,'deg'],'heading-z':[editorial.headingZ??0,'px'],'heading-x':[editorial.headingRotateX??0,'deg'],'heading-y':[editorial.headingRotateY??0,'deg'],'rule-progress':[editorial.ruleProgress,''],'caption-shift':[editorial.captionShift,'px'],'glyph-spread':[editorial.glyphSpread,'px'],'glyph-rotate':[editorial.glyphRotate,'deg']};
        for(const [key,[value,unit]] of Object.entries(values))section.style.setProperty(`--${key}`,`${value}${unit}`);
        foreground[index].lines.forEach((line,elementIndex,elements)=>{const value=sampleEditorialScore({...editorialInput,elementIndex,elementCount:elements.length});line.style.setProperty('--line-offset',`${value.lineOffset}px`);line.style.setProperty('--line-shift',`${value.headingShift}px`);line.style.setProperty('--line-rotate',`${value.lineRotate}deg`);});
        foreground[index].rows.forEach((row,elementIndex,elements)=>{const value=sampleEditorialScore({...editorialInput,elementIndex,elementCount:elements.length});row.style.setProperty('--method-shift',`${value.methodShift}px`);row.style.setProperty('--method-progress',String(value.methodProgress));});
        section.style.setProperty('--energy',String(state.reduced?0:reading.energy));section.style.setProperty('--attention',String(state.reduced?1:visibility));
      });
      planes.forEach(item=>{
        const active=item.element===hovered||item.element===focused;
        const target=!state.reduced&&active&&(fine.matches||item.element===focused)?item.target:{x:0,y:0,press:0};
        advancePlaneFeedback(item.response,target,dt,{reducedMotion:state.reduced,resumed:didResume});
        const value=item.response.value??item.response;
        const amplitude=item.element.hasAttribute('data-editorial-copy')?1.2:3;
        item.element.style.setProperty('--feedback-x',`${-value.y*amplitude}deg`);item.element.style.setProperty('--feedback-y',`${value.x*amplitude}deg`);item.element.style.setProperty('--feedback-z',`${value.press*(amplitude>2?12:4)}px`);
        moving=moving||!item.response.settled;
      });
      const slot=document.querySelector('[data-model-viewport]');let inspectionWeight=0,inspectionViewport=state.inspectionViewport;
      if(slot){const r=slot.getBoundingClientRect(),hint=slot.querySelector('#model-study-help')?.getBoundingClientRect();const top=Math.max(100,r.top),left=Math.max(16,r.left),right=Math.min(innerWidth-16,r.right),bottom=Math.min(innerHeight-(innerWidth<=780?78:24),r.bottom,hint?hint.top-8:r.bottom);const height=bottom-top;
        if(height>innerHeight*.2&&right-left>100){inspectionWeight=ease(((Math.min(innerHeight-(innerWidth<=780?78:24),r.bottom)-Math.max(100,r.top))/Math.max(1,r.height)-.45)/.4)*ease((height/innerHeight-.2)/.12);inspectionViewport={left:left/innerWidth,top:top/innerHeight,width:(right-left)/innerWidth,height:height/innerHeight};}
      }
      if(scrim.current)scrim.current.style.setProperty('--study-weight',String(inspectionWeight));
      if(progress.current)progress.current.style.transform=`scaleX(${Math.min(1,reading.visualDocY/Math.max(1,document.documentElement.scrollHeight-innerHeight))})`;
      if(status.current)status.current.textContent=`${String(chapter.index+1).padStart(2,'0')} / 07`;
      const protectedRects=[...document.querySelectorAll('[data-story-panel],[data-story-media],[data-protect]')].map(el=>el.getBoundingClientRect()).filter(r=>r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth).map(r=>({left:r.left-16,top:r.top-16,right:r.right+16,bottom:r.bottom+16}));
      const editorial=sampleEditorialScore({visualU,nativeU:u,energy:reading.energy,direction:reading.direction,holdWeight:score.holdWeight,index:chapter.index,reducedMotion:state.reduced,light:state.detail==='light'});
      input.set({u,...reading,...score,editorial,pointer,protectedRects,hidden:false,inspection:{...inspection.value,lightMix:lampFeedback.press},inspectionSettled:inspection.settled&&lampFeedback.settled,inspectionActive:inspectionWeight>0,inspectionWeight,inspectionViewport});
      history.push({time:now,...reading,...score});if(history.length>240)history.shift();
      if(moving||!reading.settled||!inspection.settled||!lampFeedback.settled)schedule();else previous=0;
    };
    function schedule(){if(!frame&&!document.hidden)frame=requestAnimationFrame(tick);}
    const move=event=>{
      if(event.pointerType!=='mouse'||!fine.matches||input.get().reduced)return;
      pointerTarget={x:Math.min(1,Math.max(-1,event.clientX/innerWidth*2-1)),y:Math.min(1,Math.max(-1,event.clientY/innerHeight*2-1))};
      hovered=event.target.closest?.('[data-feedback-plane]')??null;
      const item=planes.find(item=>item.element===hovered);if(item){const r=item.element.getBoundingClientRect();item.target={x:Math.min(1,Math.max(-1,(event.clientX-r.left)/r.width*2-1)),y:Math.min(1,Math.max(-1,(event.clientY-r.top)/r.height*2-1)),press:0};}schedule();
    };
    const reset=()=>{pointerTarget={x:0,y:0};hovered=null;focused=null;pointerFocus=false;schedule();};
    const focusout=()=>{focused=null;schedule();};
    const seek=()=>{seekPending=true;schedule();};
    const focus=event=>{focused=event.target.closest?.('[data-feedback-plane]')??event.target.querySelector?.('[data-feedback-plane]')??null;const item=planes.find(item=>item.element===focused);if(item)item.target={x:.3,y:-.3,press:.35};if(root.contains(event.target)&&!pointerFocus){seekOnScroll=false;const top=naturalY(event.target),bottom=top+event.target.offsetHeight,safeBottom=innerHeight-(innerWidth<=780?90:40);let y=scrollY;if(top<y+110)y=top-110;else if(bottom>y+safeBottom)y=Math.min(top-110,bottom-safeBottom);if(y!==scrollY)scrollTo({top:Math.max(0,y),behavior:'instant'});seek();}};
    const hash=event=>{if(event?.newURL===historyNavigation){restoreHistory();historyNavigation=null;return;}let id;try{id=decodeURIComponent(location.hash.slice(1));}catch{return;}const target=document.getElementById(id);if(target&&root.contains(target)){scrollTo({top:Math.max(0,naturalY(target)-parseFloat(getComputedStyle(target).scrollMarginTop||0)),behavior:'instant'});seek();}};
    const anchor=event=>{const link=event.target.closest?.('a[href^="#"]');if(!link||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;const id=link.getAttribute('href');const target=document.getElementById(id.slice(1));if(!target)return;event.preventDefault();initialHash=false;historyNavigation=null;historyPush(id);hash();target.focus({preventScroll:true});};
    const historyPush=id=>{rememberHistory();window.history.replaceState({...window.history.state,thesisReadingId:activeHistoryEntry,thesisReadingPosition:historyPositions.get(activeHistoryEntry)},'',location.href);activeHistoryEntry=`reading-${Date.now()}-${++historySequence}`;window.history.pushState({...window.history.state,thesisReadingId:activeHistoryEntry,thesisReadingPosition:null},'',id);rememberHistory();};
    const keyboard=event=>{pointerFocus=false;initialHash=false;if(event.target.closest('input,select,textarea,[contenteditable=true],[data-model-viewport]'))return;if(['PageDown','PageUp','Home','End'].includes(event.key)&&!event.altKey&&!event.metaKey){event.preventDefault();const max=Math.max(0,document.documentElement.scrollHeight-innerHeight);const top={Home:0,End:max,PageDown:Math.min(max,scrollY+innerHeight*.85),PageUp:Math.max(0,scrollY-innerHeight*.85)}[event.key];scrollTo({top,behavior:'instant'});seekOnScroll=true;seek();}else if(event.key==='Tab'){seekOnScroll=true;seek();}};
    const scroll=()=>{if(!historyNavigation)rememberHistory();if(!input.get().reduced)root.style.setProperty('--reading-shift',`${scrollY-reading.visualDocY}px`);if(seekOnScroll){seekPending=true;seekOnScroll=false;}schedule();};
    const wheel=()=>{initialHash=false;historyNavigation=null;seekOnScroll=false;};
    const pop=event=>{initialHash=false;historyNavigation=location.href;activeHistoryEntry=event.state?.thesisReadingId??`reading-${Date.now()}-${++historySequence}`;historyPosition=historyPositions.get(activeHistoryEntry)??event.state?.thesisReadingPosition??{x:0,y:0};seekOnScroll=true;restoreHistory();};
    const press=event=>{initialHash=false;pointerFocus=event.type==='pointerdown';const element=event.target.closest?.('[data-feedback-plane]');const item=planes.find(item=>item.element===element);if(item){hovered=element;item.target.press=event.type==='pointerdown'?1:element===focused ? .35 : 0;schedule();}};
    const visibility=()=>{input.set({hidden:document.hidden});if(document.hidden){cancelAnimationFrame(frame);frame=0;previous=0;reset();}else{pointer={x:0,y:0};resumed=true;measure();}};
    const resizeWindow=()=>{resumed=true;measure();};
    const resize=new ResizeObserver(measure);sections.forEach(el=>resize.observe(el));
    window.addEventListener('scroll',scroll,{passive:true});window.addEventListener('wheel',wheel,{passive:true});window.addEventListener('popstate',pop);document.addEventListener('pointerdown',press);document.addEventListener('pointerup',press);document.addEventListener('pointercancel',press);window.addEventListener('resize',resizeWindow);window.addEventListener('pointermove',move,{passive:true});
    document.documentElement.addEventListener('pointerleave',reset);window.addEventListener('blur',reset);document.addEventListener('visibilitychange',visibility);fine.addEventListener('change',reset);
    document.addEventListener('focusin',focus);document.addEventListener('focusout',focusout);document.addEventListener('click',anchor);window.addEventListener('hashchange',hash);document.addEventListener('keydown',keyboard);
    const unsubscribe=input.subscribe(()=>{const state=input.get();if((state.inspectionRevision??0)!==inspectionRevision){inspectionRevision=state.inspectionRevision??0;schedule();}if(state.reduced!==wasReduced){wasReduced=state.reduced;seek();}});
    window.__story={inspect:()=>({...reading,...sampleReadingScore(reading,plan),history:[...history],stops:plan.stops,scheduled:!!frame,inspectionActive:!!input.get().inspectionActive,inspectionWeight:input.get().inspectionWeight,inspection:{target:{...inspection.target},value:{...inspection.value},lightMix:lampFeedback.press,settled:inspection.settled&&lampFeedback.settled}})};
    document.documentElement.setAttribute('data-cinematic-ready','');measure();if(location.hash)hash();
    return()=>{window.history.scrollRestoration=previousRestoration;cancelAnimationFrame(frame);resize.disconnect();unsubscribe();window.removeEventListener('scroll',scroll);window.removeEventListener('wheel',wheel);window.removeEventListener('popstate',pop);document.removeEventListener('pointerdown',press);document.removeEventListener('pointerup',press);document.removeEventListener('pointercancel',press);window.removeEventListener('resize',resizeWindow);window.removeEventListener('pointermove',move);document.documentElement.removeEventListener('pointerleave',reset);window.removeEventListener('blur',reset);document.removeEventListener('visibilitychange',visibility);fine.removeEventListener('change',reset);document.removeEventListener('focusin',focus);document.removeEventListener('focusout',focusout);document.removeEventListener('click',anchor);window.removeEventListener('hashchange',hash);document.removeEventListener('keydown',keyboard);document.documentElement.removeAttribute('data-cinematic-ready');delete document.documentElement.dataset.activeChapter;root.style.removeProperty('--reading-shift');delete window.__story;};
  }, [input, inspection]);
  // Discrete preference changes also wake the DOM decoration controller once.
  useEffect(() => {window.dispatchEvent(new Event('resize'));}, [still, systemReduced, detail]);
  return <>
    <div className={styles.backdrop} aria-hidden="true" data-cinematic-background>
      <picture><source media="(max-width:780px)" srcSet="/assets/cinematic/model-poster-mobile.webp"/><img className={styles.poster} src="/assets/cinematic/model-poster.webp" alt="" fetchPriority="high" style={{opacity: ready ? 0 : .35}} /></picture>
      <div className={styles.stage} ref={stage} style={{visibility: ready ? 'visible' : 'hidden'}}>
        {enabled && !failed && <SceneBoundary onFailure={onFailure}><Scene input={input} stage={stage} onReady={onReady} onFailure={onFailure} /></SceneBoundary>}
      </div>
      <div className={styles.vignette} data-cinematic-vignette />
      <div className={styles.scrim} ref={scrim} data-cinematic-scrim><div className={styles.scrimLeft} /><div className={styles.scrimRight} /><div className={styles.scrimQuiet} /></div>
    </div>
    {hydrated && <div className={styles.readingTools} data-protect data-reading-tools>
      <span ref={status} aria-hidden="true">01 / 07</span>
      <label className={styles.detailLabel}>Visual detail<select aria-label="Visual detail" value={detail} onChange={event => setDetail(event.target.value)}><option value="full">Full</option><option value="light">Light</option></select></label>
      <button type="button" aria-pressed={still || systemReduced || !enabled || failed} disabled={systemReduced || failed} onClick={() => {if (!enabled) {setEnabled(true); setStill(false);} else setStill(value => !value);}}>{failed ? 'Still background' : systemReduced ? 'Reduced motion' : !enabled ? 'Enable 3D' : still ? 'Resume motion' : 'Pause motion'}</button>
    </div>}
    <ModelInspector input={input} inspection={inspection} activate={activateStudy} ready={ready} failed={failed} detail={detail} setDetail={setDetail}/>
    <div className={styles.progress} aria-hidden="true"><span ref={progress} /></div>
  </>;
}
