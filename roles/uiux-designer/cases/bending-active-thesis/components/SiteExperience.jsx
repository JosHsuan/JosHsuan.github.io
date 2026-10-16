'use client';
import {useEffect,useRef,useState} from 'react';
import {createSiteNavigation} from '../runtime/site/SiteNavigation.mjs';
import entry from './entry-loader.module.css';
import styles from './site-experience.module.css';

/** Mounted once by the published layout. Generic pages import no case runtime. */
export default function SiteExperience(){
 const element=useRef(null);
 const [status,setStatus]=useState({phase:'requested',reason:''});
 useEffect(()=>{
  const manager=createSiteNavigation({window,document,element:element.current,onChange:setStatus});
  const inspect={inspect:manager.inspect};window.__site=inspect;
  manager.start();
  return()=>{manager.dispose();if(window.__site===inspect)delete window.__site;};
 },[]);
 const ready=status.phase==='ready'||status.phase==='revealing'||status.phase==='entered';
 return <><div ref={element} className={`${entry.loader} ${styles.loader}`} data-site-loader data-site-phase="requested" aria-label="Preparing this page">
  <div className={`${entry.backdrop} ${styles.backdrop}`} aria-hidden="true"/>
  <div className={entry.content} data-site-loader-content>
   <section className={entry.panel} aria-labelledby="site-entry-title" aria-describedby="site-entry-description">
    <p className={entry.eyebrow}>Portfolio</p>
    <h2 id="site-entry-title" className={entry.title}>JosHsuan Chao</h2>
    <p id="site-entry-description" className={entry.subtitle}>Selected work and research</p>
    <div className={entry.preparation}>
     <span className={entry.activity} data-site-activity data-ready={ready} aria-hidden="true">{ready&&<svg viewBox="0 0 16 16" fill="none"><path d="m4 8 2.5 2.5L12 5"/></svg>}</span>
     <p role="status" aria-live="polite" aria-atomic="true">{ready?'Ready to read':'Preparing this page'}</p>
    </div>
   </section>
   <p className={entry.identity}>JosHsuan Chao <a href="/">Return to home</a></p>
  </div>
 </div><p className={styles.status} role="status" aria-live="polite">{status.phase==='failed'?'This page is available. Some preparation steps could not finish.':''}</p><noscript><style>{'[data-site-loader]{display:none!important}'}</style></noscript></>;
}
