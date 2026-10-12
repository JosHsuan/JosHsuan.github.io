'use client';
import {useEffect,useMemo,useState} from 'react';
import {createPortal} from 'react-dom';
import {MODEL_STUDIES} from '../runtime/features/ModelManager.mjs';
import styles from './model-inspector.module.css';

export default function ModelInspector({input,inspection,activate,ready,failed}){
  const manager=useMemo(()=>input.features.create('model',{inspection,hitTest:(x,y)=>input.scene.hitTest(x,y)}),[input,inspection]);
  const [hosts,setHosts]=useState([]);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(()=>{setHosts(MODEL_STUDIES.flatMap(study=>{const host=document.querySelector(`[data-model-study-host="${study.id}"]`);return host?[{...study,host}]:[];}));},[]);
  useEffect(()=>{if(hosts.length)input.invalidateLayout('model-controls');},[hosts,input]);
  useEffect(()=>{if(!ready)manager.unavailable();},[ready,manager]);
  useEffect(()=>input.features.connect('model.lifecycle',()=>manager.connectLifecycle({window,document})),[input,manager]);
  // Native delegation keeps current React availability while the behavior stays in its manager.
  useEffect(()=>input.features.connect('model.pointer',()=>manager.connectPointer(document,hosts,ready)));

  return hosts.map(study => createPortal(<div className={styles.study} data-model-study data-study-chapter={study.id} aria-labelledby={`model-study-title-${study.id}`}>
    <header className={styles.header} data-protect>
      <div className={styles.headerText} data-choreography="caption"><span className={styles.eyebrow}>SOURCE / COMPARISON</span><h3 id={`model-study-title-${study.id}`}>{study.title}</h3></div>
      {!ready && !failed && <button type="button" onClick={activate}><span data-choreography="nav">Enable model</span></button>}
    </header>
    <div ref={element => manager.bindSurface(study.id,element)} className={styles.surface}
      role="button" aria-label={`Explore ${study.id === 'pattern' ? 'source experiments' : 'source representations'} in ${study.id}`} aria-describedby={`model-study-help-${study.id} model-source-label-${study.id}`} aria-disabled={!ready} tabIndex={ready ? 0 : -1}
      data-model-viewport data-study-chapter={study.id} data-source-count={study.labels.length}
      onLostPointerCapture={manager.lostCapture} onPointerLeave={manager.leave}
      onKeyDown={event => manager.key(event,study,ready)} onBlur={manager.blur}
      onClick={event => {if(event.detail===0)manager.choose(study,event.currentTarget,ready);}}>
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
