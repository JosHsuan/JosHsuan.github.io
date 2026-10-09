'use client';
import {useCallback, useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {INSPECTION_DEFAULTS, setInspectionTarget} from './inspection-state.mjs';
import styles from './model-inspector.module.css';

const SOURCE_LABELS = ['Origami representation', 'Opening representation', 'Bending-active representation', 'Authored curvature colors'];
const STUDIES = [
  {id: 'form', title: 'From folds to form.', labels: SOURCE_LABELS},
  {id: 'system', title: 'Read the source.', labels: SOURCE_LABELS},
  {id: 'pattern', title: 'Compare the experiments.', labels: ['Experiment A', 'Experiment B', 'Experiment C']},
];

export default function ModelInspector({input, inspection, activate, ready, failed}) {
  const surfaces = useRef(new Map()), press = useRef(null), pinned = useRef(false);
  const [hosts, setHosts] = useState([]);
  const publish = useCallback(patch => {
    input.set({...patch, inspectionRevision: (input.get().inspectionRevision ?? 0) + 1});
  }, [input]);
  const clearHover = useCallback(() => {
    surfaces.current.forEach(element => {if (element) delete element.dataset.modelHit;});
    publish({modelHover: {x: 0, y: 0, strength: 0, chapterId: null}});
  }, [publish]);
  const returnView = useCallback((clearSelection = false) => {
    pinned.current = false;
    setInspectionTarget(inspection, {azimuth: INSPECTION_DEFAULTS.azimuth, elevation: INSPECTION_DEFAULTS.elevation});
    publish({modelEngaged: false, modelRecovering: !inspection.settled, ...(clearSelection ? {sourceSelection: null} : {})});
  }, [inspection, publish]);
  const cancelPress = useCallback(() => {
    const current = press.current;
    press.current = null;
    if (current?.surface.hasPointerCapture(current.id)) current.surface.releasePointerCapture(current.id);
    surfaces.current.forEach(element => {if (element) delete element.dataset.modelDragging;});
    returnView();
  }, [returnView]);
  // Only discrete hydration state enters React. Pointer/keyboard feedback uses
  // the same input store and controller tick as the authored chapter playback.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {setHosts(STUDIES.flatMap(study => {const host = document.querySelector(`[data-model-study-host="${study.id}"]`); return host ? [{...study, host}] : [];}));}, []);
  useEffect(() => {if (hosts.length) window.dispatchEvent(new Event('resize'));}, [hosts]);
  useEffect(() => {if (!ready) {cancelPress(); clearHover();}}, [ready, cancelPress, clearHover]);
  useEffect(() => {
    const cancel = () => {cancelPress(); clearHover();};
    const visibility = () => {if (document.hidden) cancel();};
    window.addEventListener('blur', cancel);
    window.addEventListener('pagehide', cancel);
    document.addEventListener('visibilitychange', visibility);
    document.addEventListener('freeze', cancel);
    return () => {window.removeEventListener('blur', cancel); window.removeEventListener('pagehide', cancel); document.removeEventListener('visibilitychange', visibility); document.removeEventListener('freeze', cancel); cancel();};
  }, [cancelPress, clearHover]);

  function hit(event, chapterId) {
    if (!ready || typeof window.__thesis?.hitTest !== 'function') return false;
    const result = window.__thesis.hitTest(event.clientX, event.clientY);
    return !!result && result.source === true && (!result.chapterId || result.chapterId === chapterId);
  }
  function choose(study, surface) {
    if (!ready) return;
    const state = input.get(), selection = state.sourceSelection;
    const presented = Number(surface.dataset.sourceIndex);
    const previous = Number.isInteger(presented) && presented >= 0 && presented < study.labels.length ? presented : selection?.chapterId === study.id ? selection.index : -1;
    const index = (previous + 1) % study.labels.length;
    returnView();
    publish({sourceSelection: {chapterId: study.id, index, selectedAt: state.playback?.activeSeconds ?? 0}, modelInteractionChapter: study.id});
    surface.dataset.sourceIndex = String(index);
    const parent = surface.closest('[data-model-study]');
    const label = parent?.querySelector('[data-source-label]');
    if (label) label.textContent = study.labels[index];
    const announcement = parent?.querySelector('[data-source-announcement]');
    if (announcement) announcement.textContent = `${study.labels[index]}. Comparison selected. Escape returns to the chapter.`;
  }
  function begin(event, study, surface = event.currentTarget) {
    if (!ready || event.button !== 0 || event.isPrimary === false || press.current || !hit(event, study.id)) return;
    press.current = {id: event.pointerId, surface, study, x: event.clientX, y: event.clientY, at: event.timeStamp, moved: false, touch: event.pointerType === 'touch', azimuth: inspection.value.azimuth, elevation: inspection.value.elevation};
    if (event.pointerType === 'touch') return; // Native pan and selection remain available.
    surface.setPointerCapture(event.pointerId);
    surface.dataset.modelDragging = 'true';
    publish({modelEngaged: true, modelRecovering: false, modelInteractionChapter: study.id});
  }
  function move(event) {
    const current = press.current;
    // The existing chapter RAF samples hover once for the latest pointer. Only
    // an explicit press needs an immediate exact raycast between rendered frames.
    if (!current || current.id !== event.pointerId) return;
    if (!ready) {cancelPress(); return;}
    const dx = event.clientX - current.x, dy = event.clientY - current.y;
    current.moved ||= Math.hypot(dx, dy) > (current.touch ? 10 : 4);
    if (current.touch || !current.moved) return;
    setInspectionTarget(inspection, {azimuth: current.azimuth + dx * .23, elevation: current.elevation - dy * .18});
    publish({modelEngaged: true, modelRecovering: false, modelInteractionChapter: current.study.id});
  }
  function end(event, cancelled = false) {
    const current = press.current;
    if (!current || current.id !== event.pointerId) return;
    press.current = null;
    if (current.surface.hasPointerCapture(current.id)) current.surface.releasePointerCapture(current.id);
    delete current.surface.dataset.modelDragging;
    returnView();
    if (!cancelled && !current.moved && event.timeStamp - current.at < 650) choose(current.study, current.surface);
  }
  function key(event, study) {
    if (!ready) return;
    const patch = {
      ArrowLeft: {azimuth: inspection.target.azimuth - 7}, ArrowRight: {azimuth: inspection.target.azimuth + 7},
      ArrowUp: {elevation: inspection.target.elevation + 5}, ArrowDown: {elevation: inspection.target.elevation - 5},
    }[event.key];
    if (patch) {
      event.preventDefault(); pinned.current = true;
      setInspectionTarget(inspection, patch);
      publish({modelEngaged: true, modelRecovering: false, modelInteractionChapter: study.id});
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault(); if (!event.repeat) choose(study, event.currentTarget);
    } else if (event.key === 'Escape' || event.key === 'Home') {
      event.preventDefault(); cancelPress(); returnView(true); clearHover();
      const announcement = event.currentTarget.closest('[data-model-study]')?.querySelector('[data-source-announcement]');
      if (announcement) announcement.textContent = 'Returned to the chapter view.';
    }
  }

  // A held scene may extend beyond its document controls. Route only exact
  // visible mesh hits through the same gesture owner; ordinary links and text
  // keep their native interaction and touch scrolling is never prevented.
  useEffect(() => {
    const down=event=>{
      if(event.target.closest?.('button,a,select,input,summary,[data-protect],[data-feedback-plane]'))return;
      const result=window.__thesis?.hitTest?.(event.clientX,event.clientY);
      const study=hosts.find(value=>value.id===result?.chapterId),surface=surfaces.current.get(study?.id);
      if(study&&surface)begin(event,study,surface);
    };
    const up=event=>end(event),cancel=event=>end(event,true);
    document.addEventListener('pointerdown',down);document.addEventListener('pointermove',move);
    document.addEventListener('pointerup',up);document.addEventListener('pointercancel',cancel);
    return()=>{document.removeEventListener('pointerdown',down);document.removeEventListener('pointermove',move);document.removeEventListener('pointerup',up);document.removeEventListener('pointercancel',cancel);};
  });

  return hosts.map(study => createPortal(<div className={styles.study} data-model-study data-study-chapter={study.id} aria-labelledby={`model-study-title-${study.id}`}>
    <header className={styles.header} data-protect>
      <div className={styles.headerText} data-choreography="caption"><span className={styles.eyebrow}>SOURCE / COMPARISON</span><h3 id={`model-study-title-${study.id}`}>{study.title}</h3></div>
      {!ready && !failed && <button type="button" onClick={activate}><span data-choreography="nav">Enable model</span></button>}
    </header>
    <div ref={element => {if (element) surfaces.current.set(study.id, element); else surfaces.current.delete(study.id);}} className={styles.surface}
      role="button" aria-label={`Explore ${study.id === 'pattern' ? 'source experiments' : 'source representations'} in ${study.id}`} aria-describedby={`model-study-help-${study.id} model-source-label-${study.id}`} aria-disabled={!ready} tabIndex={ready ? 0 : -1}
      data-model-viewport data-study-chapter={study.id} data-source-count={study.labels.length}
      onLostPointerCapture={event => {if (press.current?.id === event.pointerId) cancelPress();}} onPointerLeave={() => {if (!press.current) clearHover();}}
      onKeyDown={event => key(event, study)} onBlur={() => {
        // A visible mesh can receive a press outside this semantic control.
        // Its native focus loss releases keyboard ownership, not the active
        // pointer gesture owned by pointerup/cancel and window lifecycle.
        if (pinned.current) {pinned.current = false; if (!press.current) returnView();}
        clearHover();
      }}
      onClick={event => {if (event.detail === 0) choose(study, event.currentTarget);}}>
      {!ready && <div className={styles.fallback}>
        <picture><source media="(max-width:780px)" srcSet="/assets/cinematic/model-poster-mobile.webp"/><img src="/assets/cinematic/model-poster.webp" alt="Reference view of the original metal-panel assembly and its base"/></picture>
        <p role="status">{failed ? 'Interactive geometry unavailable. Continue with the source evidence.' : 'Enable the model to explore the supplied geometry.'}</p>
      </div>}
    </div>
    <footer className={styles.caption} data-protect data-choreography="caption">
      <p id={`model-source-label-${study.id}`} data-source-label data-study-chapter={study.id}>{ready ? 'Source geometry' : 'Assembly reference'}</p>
      <p id={`model-study-help-${study.id}`} className={styles.gesture}>{ready ? <><span className={styles.mouseHint}>Click to compare · drag to turn</span><span className={styles.touchHint}>Tap the object to compare · scroll to continue</span><span className={styles.keyboardHint}>Enter compares · arrows turn · Escape returns</span></> : 'Source evidence remains available below.'}</p>
    </footer>
    <p className={styles.announcement} role="status" aria-live="polite" aria-atomic="true" data-source-announcement/>
  </div>, study.host, study.id));
}
