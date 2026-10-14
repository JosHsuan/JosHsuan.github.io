'use client';
import {useEffect,useRef,useState} from 'react';
import {useExperienceInput} from '../runtime/ExperienceProvider';
import styles from './entry-loader.module.css';

export default function EntryLoader(){
 const input=useExperienceInput(),element=useRef(null);
 const [status,setStatus]=useState({phase:'preparing',progress:0,reason:''});
 useEffect(()=>input.features.connect('entry.presentation',()=>input.entry.connect({element:element.current,content:document.querySelector('[data-project-content]'),document,onChange:setStatus})),[input]);
 const ready=status.progress===100;
 return <><div ref={element} className={styles.loader} data-entry-loader data-phase="preparing" aria-label="Preparing Bending-Active">
  <div className={styles.upper}/><div className={styles.lower}/>
  <div className={styles.content}>
   <span className={styles.identity}>JOSHSUAN CHAO <span>RESEARCH / 01</span></span>
   <div className={styles.title}><span>BENDING</span><span className={styles.titleLast}>— ACTIVE</span></div>
   <svg className={styles.traces} viewBox="0 0 800 150" fill="none" aria-hidden="true">
    {[0,1,2,3,4,5].map(i=><path key={i} pathLength="1" d={`M0 ${115+i*5} C180 ${115+i*5} 210 ${15+i*9} 400 ${15+i*9} S620 ${115+i*5} 800 ${115+i*5}`}/>)}
   </svg>
   <div className={styles.bottom}><p role="status" aria-live="polite">{ready?(status.reason?'Ready to read':'Study ready'):'Preparing the study'}</p><span className={styles.number} aria-hidden="true">{String(status.progress).padStart(3,'0')}<small>%</small></span></div>
  </div>
 </div><noscript><style>{'[data-entry-loader]{display:none!important}'}</style></noscript></>;
}
