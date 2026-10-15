'use client';
import {useEffect,useRef,useState} from 'react';
import {useExperienceInput} from '../runtime/ExperienceProvider';
import styles from './entry-loader.module.css';
import {acquireSiteReadiness} from '../runtime/site/SiteReadiness.mjs';
import {publishSceneEntry} from '../runtime/site/site-entry-bridge.mjs';

export default function EntryLoader({returnHref='/#projects'}){
 const input=useExperienceInput(),element=useRef(null);
 const [status,setStatus]=useState({phase:'preparing',progress:0,reason:''});
 useEffect(()=>input.features.connect('entry.presentation',()=>{
  const readiness=acquireSiteReadiness(document),scope=input.events.createScope('site-entry-bridge');
  input.events.on(scope,'entryReadiness',publishSceneEntry);
  const release=input.entry.connect({element:element.current,content:document.querySelector('[data-project-content]'),document,onChange:setStatus,documentReady:readiness.promise});
  return()=>{release();scope.dispose();readiness.release();};
 }),[input]);
 const ready=status.progress===100;
 return <><div ref={element} className={styles.loader} data-entry-loader data-phase="preparing" aria-label="Preparing Bending-Active">
  <div className={styles.backdrop} aria-hidden="true"><picture>
   <source media="(max-width:780px)" srcSet="/assets/cinematic/model-poster-mobile.webp"/>
   <img src="/assets/cinematic/model-poster.webp" alt="" decoding="async"/>
  </picture></div>
  <div className={styles.content}>
   <section className={styles.panel} aria-labelledby="entry-title" aria-describedby="entry-description">
    <p className={styles.eyebrow}>Thesis study</p>
    <h2 id="entry-title" className={styles.title}>Bending-Active</h2>
    <p id="entry-description" className={styles.subtitle}>Metal Panel Deformation</p>
    <div className={styles.preparation}>
     <span className={styles.activity} data-ready={ready} aria-hidden="true">{ready&&<svg viewBox="0 0 16 16" fill="none"><path d="m4 8 2.5 2.5L12 5"/></svg>}</span>
     <p role="status" aria-live="polite" aria-atomic="true">{ready?(status.reason?'Ready to read':'Study ready'):'Preparing the study'}</p>
    </div>
   </section>
   <p className={styles.identity}>JosHsuan Chao <a href={returnHref} data-entry-return>Back to projects</a></p>
  </div>
 </div><noscript><style>{'[data-entry-loader]{display:none!important}'}</style></noscript></>;
}
