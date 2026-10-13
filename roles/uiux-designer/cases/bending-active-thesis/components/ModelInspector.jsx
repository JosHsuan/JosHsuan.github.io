'use client';
import {useEffect,useMemo} from 'react';
import {MODEL_STUDIES} from '../runtime/features/ModelManager.mjs';
import styles from './model-inspector.module.css';

export default function ModelInspector({input,inspection,activate,ready,failed}){
  const manager=useMemo(()=>input.features.create('model',{inspection,hitTest:(x,y)=>input.scene.hitTest(x,y)}),[input,inspection]);
  useEffect(()=>{input.invalidateLayout('model-controls');},[input]);
  useEffect(()=>{if(!ready)manager.unavailable();},[ready,manager]);
  useEffect(()=>input.features.connect('model.lifecycle',()=>manager.connectLifecycle({window,document})),[input,manager]);
  // Native delegation keeps current React availability while the behavior stays in its manager.
  useEffect(()=>input.features.connect('model.pointer',()=>manager.connectPointer(document,MODEL_STUDIES,ready)));

  return <div className={styles.overlay} data-model-overlay>{MODEL_STUDIES.map(study => <div key={study.id} className={styles.study} data-model-study data-study-chapter={study.id} aria-labelledby={`model-source-label-${study.id}`}>
    <svg className={styles.connector} data-model-connector data-annotation-visible={ready&&!failed?undefined:'false'} aria-hidden="true"><polyline data-model-leader/><circle data-model-anchor r="3"/></svg>
    <div ref={element => manager.bindSurface(study.id,element)} className={styles.surface}
      role="button" aria-label={`Explore ${study.id === 'pattern' ? 'source experiments' : 'source representations'} in ${study.id}`} aria-describedby={`model-study-help-${study.id} model-source-label-${study.id} model-source-description-${study.id}`} aria-disabled={!ready} tabIndex={ready ? 0 : -1}
      data-model-viewport data-study-chapter={study.id} data-source-count={study.labels.length}
      onLostPointerCapture={manager.lostCapture} onPointerLeave={manager.leave}
      onKeyDown={event => manager.key(event,study,ready)}
      onFocus={event=>{event.currentTarget.closest('[data-model-study]').dataset.modelControlFocused='true';}}
      onBlur={event=>{delete event.currentTarget.closest('[data-model-study]').dataset.modelControlFocused;manager.blur();}}
      onClick={event => {if(event.detail===0)manager.choose(study,event.currentTarget,ready);}}>
      {!ready && <div className={styles.fallback}>
        <picture><source media="(max-width:780px)" srcSet="/assets/cinematic/model-poster-mobile.webp"/><img src="/assets/cinematic/model-poster.webp" alt="Reference view of the original metal-panel assembly and its base"/></picture>
        <p role="status">{failed ? 'Interactive geometry unavailable. Continue with the source evidence.' : 'Enable the model to explore the supplied geometry.'}</p>
      </div>}
    </div>
    <aside className={styles.sideLabel} data-model-side-label data-protect>
      <span className={styles.eyebrow}>THESIS SOURCE / {study.id.toUpperCase()}</span>
      <div className={styles.information}>
        <h3 id={`model-source-label-${study.id}`} data-source-label data-study-chapter={study.id}>{ready ? 'Source geometry' : 'Assembly reference'}</h3>
        <p className={styles.position} data-source-position>{failed ? 'Model unavailable' : `${study.id === 'pattern' ? 'Experiment' : 'Representation'} — / ${study.labels.length}`}</p>
        <p id={`model-source-description-${study.id}`} className={styles.description} data-source-description>{failed ? 'Interactive geometry unavailable. Source evidence remains available.' : 'Original thesis source geometry.'}</p>
      </div>
      <p className={styles.callout} data-model-annotation-label><span className={styles.calloutIndex}>01</span><span data-model-annotation-text>Source surface</span></p>
      <p id={`model-study-help-${study.id}`} className={styles.gesture}>{ready ? <><span className={styles.mouseHint}>Click to compare<br/>Drag to turn</span><span className={styles.touchHint}>Tap to compare<br/>Scroll to continue</span><span className={styles.keyboardHint}>Enter compares<br/>Arrows turn · Esc returns</span></> : 'Source evidence remains available.'}</p>
      {!ready && !failed && <button type="button" onClick={activate}>Enable model</button>}
    </aside>
    <p className={styles.announcement} role="status" aria-live="polite" aria-atomic="true" data-source-announcement/>
  </div>)}</div>;
}
