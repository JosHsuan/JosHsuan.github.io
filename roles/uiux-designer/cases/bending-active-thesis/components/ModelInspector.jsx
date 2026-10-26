'use client';
import {useEffect,useState} from 'react';
import {createPortal} from 'react-dom';
import {MODEL_STUDIES} from '../runtime/features/ModelManager.mjs';
import styles from './model-inspector.module.css';
import {modelAnnotationLabel} from './model-information.mjs';

const ANNOTATION_LABELS=[...new Set(['origami','opening','bending','curvature','experiment-a','experiment-b','experiment-c'].map(modelAnnotationLabel))];
import InformationSkin from './InformationSkin';

function SourceInformation({study,ready,failed,native=false}) {
  return <aside className={styles.sideLabel} data-model-side-label data-study-chapter={study.id} data-model-label-placement={native?'native':'overlay'} data-protect data-information-window="model-label" data-information-motion-surface={native?'plane':undefined}><InformationSkin/>
      <span className={styles.eyebrow}>THESIS SOURCE / {study.id.toUpperCase()}</span>
      <div className={styles.information}>
        <div className={styles.titleSlot}><h3 id={`model-source-label-${study.id}`} data-source-label data-study-chapter={study.id}>{ready ? 'Source geometry' : 'Assembly reference'}</h3><div className={styles.titleSizer} aria-hidden="true">{[...study.labels,'Source geometry','Assembly reference'].map(label=><span key={label}>{label}</span>)}</div></div>
        <div className={styles.positionSlot}><p className={styles.position} data-source-position>{failed ? 'Model unavailable' : `${study.id === 'pattern' ? 'Experiment' : 'Representation'} — / ${study.labels.length}`}</p><div className={`${styles.position} ${styles.positionSizer}`} aria-hidden="true"><span>Representation 4 / 4</span><span>Experiment 3 / 3</span><span>Model unavailable</span></div></div>
        <p id={`model-source-description-${study.id}`} className={styles.description} data-source-description>{failed ? 'Interactive geometry unavailable. Source evidence remains available.' : 'Original thesis source geometry.'}</p>
      </div>
      <p className={styles.callout} data-model-annotation-label><span className={styles.calloutIndex}>01</span><span className={styles.annotationSlot}><span data-model-annotation-text>Source surface</span><span className={styles.annotationSizer} aria-hidden="true">{ANNOTATION_LABELS.map(label=><span key={label}>{label}</span>)}</span></span></p>
      <p id={`model-study-help-${study.id}`} className={styles.gesture}>The source sequence follows your scroll position.</p>
    </aside>;
}

export default function ModelInspector({input,ready,failed}){
  const [informationHosts,setInformationHosts]=useState({});
  useEffect(()=>{
    const query=window.matchMedia('(max-width:780px)');
    const place=()=>setInformationHosts(query.matches?Object.fromEntries(MODEL_STUDIES.map(study=>[study.id,document.querySelector(`[data-model-information-host="${study.id}"]`)]).filter(([,host])=>host)):{});
    place();query.addEventListener('change',place);
    return()=>query.removeEventListener('change',place);
  },[]);
  useEffect(()=>{input.invalidateLayout('model-information-placement');},[input,informationHosts]);
  useEffect(()=>{input.invalidateLayout('model-controls');},[input]);


  return <div className={styles.overlay} data-model-overlay>{MODEL_STUDIES.map(study => <div key={study.id} className={styles.study} data-model-study data-study-chapter={study.id} aria-labelledby={`model-source-label-${study.id}`}>
    <svg className={styles.connector} data-model-connector data-annotation-visible={ready&&!failed?undefined:'false'} aria-hidden="true"><polyline data-model-leader/><circle data-model-anchor r="3"/></svg>
    <div className={styles.surface} aria-hidden="true"
      data-model-viewport data-study-chapter={study.id} data-source-count={study.labels.length}>
      {!ready && <div className={styles.fallback}>
        <picture><source media="(max-width:780px)" srcSet="/assets/cinematic/model-poster-mobile.webp"/><img src="/assets/cinematic/model-poster.webp" alt="Reference view of the original metal-panel assembly and its base"/></picture>
        <p role="status">{failed ? 'Interactive geometry unavailable. Continue with the source evidence.' : 'The source evidence remains available while geometry prepares.'}</p>
      </div>}
    </div>
    {informationHosts[study.id]?createPortal(<SourceInformation study={study} ready={ready} failed={failed} native/>,informationHosts[study.id]):<SourceInformation study={study} ready={ready} failed={failed}/>}
  </div>)}</div>;
}
