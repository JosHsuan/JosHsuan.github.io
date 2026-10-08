'use client';
import {Component, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import dynamic from 'next/dynamic';
import {createStoryInput} from './story-input';
import {cinematicProgressFromAnchors, cinematicChapter} from './vendor/cinematic-plan.mjs';
import {createResponseState, advanceResponse, sampleResponseScore} from './story-response.mjs';
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
  const input = useMemo(createStoryInput, []);
  const inspection = useMemo(createInspectionState, []);
  const activateStudy = useCallback(() => setEnabled(true), []);
  const [enabled, setEnabled] = useState(false), [ready, setReady] = useState(false), [failed, setFailed] = useState(false);
  const [still, setStill] = useState(false), [systemReduced, setSystemReduced] = useState(false), [hydrated, setHydrated] = useState(false);
  const [detail, setDetail] = useState('full');
  const stage = useRef(null), progress = useRef(null), status = useRef(null), scrim = useRef(null);
  const onReady = useCallback(() => setReady(true), []), onFailure = useCallback(() => {setFailed(true); setReady(false); document.querySelectorAll('[data-layer-caption]').forEach(element => {element.textContent='Source geometry · static view';});}, []);
  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setSystemReduced(reduced.matches);
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
    const sections = [...document.querySelectorAll('[data-story-chapter]')];
    if (sections.length !== 7) return;
    const fine = matchMedia('(hover: hover) and (pointer: fine)');
    const decorations = [...document.querySelectorAll('[data-parallax]')];
    const protectedElements = [...document.querySelectorAll('[data-story-panel],[data-story-media],[data-protect]')];
    const links = [...document.querySelectorAll('[data-chapter-link]')];
    const foreground = sections.map(section => ({lines:[...section.querySelectorAll('[data-heading-line]')], rows:[...section.querySelectorAll('ol > li')]}));
    const response = createResponseState(), history = [];
    let offsets = [], frame = 0, previous = 0, resumed = true, pointer = {x: 0, y: 0}, target = {x: 0, y: 0};
    let inspectionRevision = input.get().inspectionRevision ?? 0, inspectionActive = false;
    const measure = () => {offsets = sections.map(el => el.getBoundingClientRect().top + scrollY); offsets.push(sections.at(-1).getBoundingClientRect().bottom + scrollY); schedule();};
    const tick = now => {
      frame = 0;
      if (document.hidden) return;
      const state = input.get(), dt = previous ? (now - previous) / 1000 : 1 / 60; previous = now;
      if (state.inspectionActive) {
        advanceInspection(inspection, dt, {reducedMotion:state.reduced, resumed}); resumed = false;
        input.set({inspection:{...inspection.value},inspectionSettled:inspection.settled,pointer:{x:0,y:0},hidden:false});
        if (!inspection.settled) schedule(); else previous = 0;
        return;
      }
      const decorate = fine.matches && !state.reduced;
      const next = decorate ? target : {x: 0, y: 0}, alpha = 1 - Math.exp(-10 * dt);
      pointer = {x: pointer.x + (next.x - pointer.x) * alpha, y: pointer.y + (next.y - pointer.y) * alpha};
      const moving = Math.abs(pointer.x - next.x) + Math.abs(pointer.y - next.y) > .001;
      if (!moving) pointer = {...next};
      const focus = scrollY + innerHeight * .45;
      const u = cinematicProgressFromAnchors(focus, offsets), chapter = cinematicChapter(u);
      advanceResponse(response, u, dt, {reducedMotion: state.reduced, resumed}); resumed = false;
      const score = sampleResponseScore(response.visualU);
      document.documentElement.dataset.activeChapter = chapter.id;
      links.forEach(link => {if (link.dataset.chapterLink === chapter.id) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');});
      const ease = value => {const t = Math.min(1, Math.max(0, value)); return t*t*t*(10+t*(-15+6*t));};
      const reverse = ease((response.visualU * 7 - 3.8) / .4) * (1 - ease((response.visualU * 7 - 4.8) / .4));
      if (scrim.current) {scrim.current.style.setProperty('--reverse', String(reverse)); scrim.current.style.setProperty('--reading-dim', String(ease((u * 7 - 5.8) / .4) * .8));}
      sections.forEach((section, index) => {
        const phase = (focus - offsets[index]) / (offsets[index + 1] - offsets[index]);
        const visibility = Math.min(1, Math.max(0, 1 - Math.abs(phase - .5) * 1.2));
        section.style.setProperty('--reveal', String(state.reduced ? 1 : visibility));
        const editorialInput = {visualU:response.visualU,nativeU:u,energy:response.energy,direction:response.direction,index,reducedMotion:state.reduced,light:state.detail === 'light'};
        const editorial = sampleEditorialScore(editorialInput);
        section.style.setProperty('--media-shift', `${editorial.mediaShift}px`);
        section.style.setProperty('--media-scale', String(editorial.mediaScale));
        section.style.setProperty('--heading-shift', `${editorial.headingShift}px`);
        section.style.setProperty('--rule-progress', String(editorial.ruleProgress));
        section.style.setProperty('--caption-shift', `${editorial.captionShift}px`);
        section.style.setProperty('--glyph-spread', `${editorial.glyphSpread}px`);
        section.style.setProperty('--glyph-rotate', `${editorial.glyphRotate}deg`);
        foreground[index].lines.forEach((line, elementIndex, elements) => {
          const value = sampleEditorialScore({...editorialInput,elementIndex,elementCount:elements.length});
          line.style.setProperty('--line-offset', `${value.lineOffset}px`);
          line.style.setProperty('--line-shift', `${value.headingShift}px`);
          line.style.setProperty('--line-rotate', `${value.lineRotate}deg`);
        });
        foreground[index].rows.forEach((row, elementIndex, elements) => {
          const value = sampleEditorialScore({...editorialInput,elementIndex,elementCount:elements.length});
          row.style.setProperty('--method-shift', `${value.methodShift}px`);
          row.style.setProperty('--method-progress', String(value.methodProgress));
        });
        section.style.setProperty('--energy', String(state.reduced ? 0 : response.energy));
        section.style.setProperty('--attention', String(state.reduced ? 1 : visibility));
      });
      decorations.forEach(el => {el.style.setProperty('--tilt-x', `${decorate ? -pointer.y * .8 : 0}deg`); el.style.setProperty('--tilt-y', `${decorate ? pointer.x * 1.25 : 0}deg`);});
      if (progress.current) progress.current.style.transform = `scaleX(${Math.min(1, scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight))})`;
      if (status.current) status.current.textContent = `${String(chapter.index + 1).padStart(2, '0')} / 07`;
      const protectedRects = [...new Set([...protectedElements, ...document.querySelectorAll('[data-protect]')])].map(el => el.getBoundingClientRect()).filter(r => r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth).map(r => ({left:r.left-16, top:r.top-16, right:r.right+16, bottom:r.bottom+16}));
      const editorial = sampleEditorialScore({visualU:response.visualU,nativeU:u,energy:response.energy,direction:response.direction,index:chapter.index,reducedMotion:state.reduced,light:state.detail === 'light'});
      input.set({u, ...response, ...score, editorial, pointer, protectedRects, hidden: false});
      history.push({time:now, nativeU:u, visualU:response.visualU, velocity:response.velocity, stageU:score.stageU, settled:response.settled}); if (history.length > 240) history.shift();
      if (moving || !response.settled) schedule(); else previous = 0;
    };
    function schedule() {if (!frame && !document.hidden) frame = requestAnimationFrame(tick);}
    const move = e => {if (e.pointerType !== 'mouse' || !fine.matches || input.get().reduced || input.get().inspectionActive) return; target = {x: Math.min(1, Math.max(-1, e.clientX / innerWidth * 2 - 1)), y: Math.min(1, Math.max(-1, e.clientY / innerHeight * 2 - 1))}; schedule();};
    const reset = () => {target = {x: 0, y: 0}; schedule();};
    const visibility = () => {input.set({hidden: document.hidden}); if (document.hidden) {cancelAnimationFrame(frame); frame = 0; previous = 0; target = {x: 0, y: 0};} else {pointer = {x: 0, y: 0}; resumed = true; measure();}};
    const resize = new ResizeObserver(measure); [...sections, ...protectedElements].forEach(el => resize.observe(el));
    window.addEventListener('scroll', schedule, {passive: true}); window.addEventListener('resize', measure);
    window.addEventListener('pointermove', move, {passive: true}); document.documentElement.addEventListener('pointerleave', reset);
    window.addEventListener('blur', reset); document.addEventListener('visibilitychange', visibility); fine.addEventListener('change', reset);
    const unsubscribe = input.subscribe(() => {
      const state=input.get();
      if (!!state.inspectionActive !== inspectionActive) {inspectionActive=!!state.inspectionActive;previous=0;pointer={x:0,y:0};target={x:0,y:0};schedule();}
      if ((state.inspectionRevision??0)!==inspectionRevision) {inspectionRevision=state.inspectionRevision??0;schedule();}
      if (state.reduced && (pointer.x || pointer.y || state.inspectionActive && !inspection.settled)) schedule();
    });
    window.__story = {inspect: () => ({...response, ...sampleResponseScore(response.visualU), history:[...history], scheduled:!!frame,inspectionActive:!!input.get().inspectionActive,inspection:{target:{...inspection.target},value:{...inspection.value},settled:inspection.settled}})};
    document.documentElement.setAttribute('data-cinematic-ready', ''); measure();
    return () => {cancelAnimationFrame(frame); resize.disconnect(); unsubscribe(); window.removeEventListener('scroll', schedule); window.removeEventListener('resize', measure); window.removeEventListener('pointermove', move); document.documentElement.removeEventListener('pointerleave', reset); window.removeEventListener('blur', reset); document.removeEventListener('visibilitychange', visibility); fine.removeEventListener('change', reset); document.documentElement.removeAttribute('data-cinematic-ready'); delete document.documentElement.dataset.activeChapter; delete window.__story;};
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
