'use client';
import {Component, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import dynamic from 'next/dynamic';
import {createStoryInput} from './story-input';
import {cinematicProgressFromAnchors, cinematicChapter} from './vendor/cinematic-plan.mjs';
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
  const [enabled, setEnabled] = useState(false), [ready, setReady] = useState(false), [failed, setFailed] = useState(false);
  const [still, setStill] = useState(false), [systemReduced, setSystemReduced] = useState(false), [hydrated, setHydrated] = useState(false);
  const stage = useRef(null), progress = useRef(null), status = useRef(null), scrim = useRef(null);
  const onReady = useCallback(() => setReady(true), []), onFailure = useCallback(() => {setFailed(true); setReady(false);}, []);
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
  useEffect(() => {
    const sections = [...document.querySelectorAll('[data-story-chapter]')];
    if (sections.length !== 7) return;
    const fine = matchMedia('(hover: hover) and (pointer: fine)');
    const decorations = [...document.querySelectorAll('[data-parallax]')];
    let offsets = [], frame = 0, previous = 0, pointer = {x: 0, y: 0}, target = {x: 0, y: 0};
    const measure = () => {offsets = sections.map(el => el.getBoundingClientRect().top + scrollY); offsets.push(sections.at(-1).getBoundingClientRect().bottom + scrollY); schedule();};
    const tick = now => {
      frame = 0;
      if (document.hidden) return;
      const state = input.get(), dt = Math.min(.1, previous ? (now - previous) / 1000 : 1 / 60); previous = now;
      const decorate = fine.matches && !state.reduced;
      const next = decorate ? target : {x: 0, y: 0}, alpha = 1 - Math.exp(-10 * dt);
      pointer = {x: pointer.x + (next.x - pointer.x) * alpha, y: pointer.y + (next.y - pointer.y) * alpha};
      const moving = Math.abs(pointer.x - next.x) + Math.abs(pointer.y - next.y) > .001;
      if (!moving) pointer = {...next};
      const focus = scrollY + innerHeight * .45;
      const u = cinematicProgressFromAnchors(focus, offsets), chapter = cinematicChapter(u);
      input.set({u, pointer, hidden: false});
      document.documentElement.dataset.activeChapter = chapter.id;
      const ease = value => {const t = Math.min(1, Math.max(0, value)); return t*t*t*(10+t*(-15+6*t));};
      const reverse = ease((u * 7 - 3.8) / .4) * (1 - ease((u * 7 - 4.8) / .4));
      if (scrim.current) {scrim.current.style.setProperty('--reverse', String(reverse)); scrim.current.style.setProperty('--reading-dim', String(ease((u * 7 - 5.8) / .4) * .8));}
      sections.forEach((section, index) => {
        const phase = (focus - offsets[index]) / (offsets[index + 1] - offsets[index]);
        const visibility = Math.min(1, Math.max(0, 1 - Math.abs(phase - .5) * 1.2));
        section.style.setProperty('--reveal', String(state.reduced ? 1 : visibility));
        section.style.setProperty('--media-shift', `${state.reduced ? 0 : Math.max(-20, Math.min(20, (.5 - phase) * 32))}px`);
        section.style.setProperty('--media-scale', String(state.reduced ? 1 : .985 + visibility * .015));
      });
      decorations.forEach(el => {el.style.setProperty('--tilt-x', `${decorate ? -pointer.y * .8 : 0}deg`); el.style.setProperty('--tilt-y', `${decorate ? pointer.x * 1.25 : 0}deg`);});
      if (progress.current) progress.current.style.transform = `scaleX(${Math.min(1, scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight))})`;
      if (status.current) status.current.textContent = `${String(chapter.index + 1).padStart(2, '0')} / 07`;
      if (moving) schedule();
    };
    function schedule() {if (!frame && !document.hidden) frame = requestAnimationFrame(tick);}
    const move = e => {if (e.pointerType !== 'mouse' || !fine.matches || input.get().reduced) return; target = {x: Math.min(1, Math.max(-1, e.clientX / innerWidth * 2 - 1)), y: Math.min(1, Math.max(-1, e.clientY / innerHeight * 2 - 1))}; schedule();};
    const reset = () => {target = {x: 0, y: 0}; schedule();};
    const visibility = () => {input.set({hidden: document.hidden}); if (document.hidden) {cancelAnimationFrame(frame); frame = 0; previous = 0; target = {x: 0, y: 0};} else {pointer = {x: 0, y: 0}; measure();}};
    const resize = new ResizeObserver(measure); sections.forEach(el => resize.observe(el));
    window.addEventListener('scroll', schedule, {passive: true}); window.addEventListener('resize', measure);
    window.addEventListener('pointermove', move, {passive: true}); document.documentElement.addEventListener('pointerleave', reset);
    window.addEventListener('blur', reset); document.addEventListener('visibilitychange', visibility); fine.addEventListener('change', reset);
    const unsubscribe = input.subscribe(() => {if (input.get().reduced && (pointer.x || pointer.y)) schedule();});
    document.documentElement.setAttribute('data-cinematic-ready', ''); measure();
    return () => {cancelAnimationFrame(frame); resize.disconnect(); unsubscribe(); window.removeEventListener('scroll', schedule); window.removeEventListener('resize', measure); window.removeEventListener('pointermove', move); document.documentElement.removeEventListener('pointerleave', reset); window.removeEventListener('blur', reset); document.removeEventListener('visibilitychange', visibility); fine.removeEventListener('change', reset); document.documentElement.removeAttribute('data-cinematic-ready'); delete document.documentElement.dataset.activeChapter;};
  }, [input]);
  // Discrete preference changes also wake the DOM decoration controller once.
  useEffect(() => {window.dispatchEvent(new Event('resize'));}, [still, systemReduced]);
  return <>
    <div className={styles.backdrop} aria-hidden="true" data-cinematic-background>
      <img className={styles.poster} src="/assets/cinematic/model-poster.webp" alt="" fetchPriority="high" style={{opacity: ready ? 0 : .35}} />
      <div className={styles.stage} ref={stage} style={{visibility: ready ? 'visible' : 'hidden'}}>
        {enabled && !failed && <SceneBoundary onFailure={onFailure}><Scene input={input} stage={stage} onReady={onReady} onFailure={onFailure} /></SceneBoundary>}
      </div>
      <div className={styles.vignette} />
      <div className={styles.scrim} ref={scrim}><div className={styles.scrimLeft} /><div className={styles.scrimRight} /><div className={styles.scrimQuiet} /></div>
    </div>
    {hydrated && <div className={styles.readingTools}>
      <span ref={status} aria-hidden="true">01 / 07</span>
      <button type="button" aria-pressed={still || systemReduced || !enabled || failed} disabled={systemReduced || failed} onClick={() => {if (!enabled) {setEnabled(true); setStill(false);} else setStill(value => !value);}}>{failed ? 'Still background' : systemReduced ? 'Reduced motion' : !enabled ? 'Enable 3D' : still ? 'Resume motion' : 'Pause motion'}</button>
    </div>}
    <div className={styles.progress} aria-hidden="true"><span ref={progress} /></div>
  </>;
}
