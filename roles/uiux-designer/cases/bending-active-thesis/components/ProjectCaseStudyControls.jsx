'use client';
import {useEffect,useRef,useState} from 'react';
import LiquidGlassSkin from './LiquidGlassSkin';
import cinematic from './cinematic.module.css';
import styles from './ProjectCaseStudy.module.css';

/** Discrete native-document controls only. The existing site background driver
 * owns all timed background, information-window and optical presentation. */
export default function ProjectCaseStudyControls({projectId,chapterCount}){
 const tools=useRef(null),counter=useRef(null),[paused,setPaused]=useState(false);
 useEffect(()=>{
  const root=document.querySelector(`[data-project-study="${projectId}"]`);
  if(!root)return;
  const chapters=[...root.querySelectorAll('[data-project-chapter]')],links=[...document.querySelectorAll('[data-project-chapter-link]')];
  const releases=[];
  let disposed=false,current=null;
  const listen=(node,type,handler,options)=>{node.addEventListener(type,handler,options);releases.push(()=>node.removeEventListener(type,handler,options));};
  const update=()=>{
   if(disposed)return;
   const readingPoint=innerHeight*.5;
   let selected=chapters[0];
   for(const chapter of chapters){if(chapter.getBoundingClientRect().top<=readingPoint)selected=chapter;else break;}
   if(!selected)return;
   const id=selected.dataset.projectChapter,index=chapters.indexOf(selected);
   if(current!==id){
    current=id;root.dataset.projectActiveChapter=id;
    for(const link of links)if(link.dataset.projectChapterLink===id)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');
    if(counter.current)counter.current.textContent=`${String(index+1).padStart(2,'0')} / ${String(chapterCount).padStart(2,'0')}`;
   }
   // Semantic reading is immediate. The existing site driver's unified source
   // transaction owns every documentary/model surface and its decode/paint gate.
  };
  const observer=typeof IntersectionObserver==='function'?new IntersectionObserver(update,{rootMargin:'-20% 0px -40% 0px',threshold:[0,.01,1]}):null;
  for(const chapter of chapters)observer?.observe(chapter);
  for(const event of ['scroll','resize','hashchange','pageshow'])listen(window,event,update,{passive:true});
  const dispose=()=>{
   if(disposed)return;disposed=true;observer?.disconnect();for(const release of releases)release();
  };
  listen(window,'pagehide',event=>{if(!event.persisted)dispose();});
  root.setAttribute('data-project-study-ready','');
  tools.current.hidden=false;update();
  Promise.resolve(document.fonts?.ready).then(update,update);
  return()=>{dispose();root.removeAttribute('data-project-study-ready');};
 },[projectId,chapterCount]);
 const toggle=()=>{
  const root=document.querySelector(`[data-project-study="${projectId}"]`);if(!root)return;
  const next=!root.hasAttribute('data-study-paused');root.toggleAttribute('data-study-paused',next);setPaused(next);
 };
 return <div ref={tools} hidden className={`${cinematic.readingTools} ${styles.readingTools}`} data-project-reading-tools data-protect data-liquid-glass="reading-controls">
  <span ref={counter} aria-live="polite">01 / {String(chapterCount).padStart(2,'0')}</span>
  <button type="button" data-study-motion-toggle aria-pressed={paused} onClick={toggle}>{paused?'Resume motion':'Pause motion'}</button>
  <LiquidGlassSkin id="reading-controls"/>
 </div>;
}
