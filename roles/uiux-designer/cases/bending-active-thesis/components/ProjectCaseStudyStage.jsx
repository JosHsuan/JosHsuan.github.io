'use client';
/* eslint-disable @next/next/no-img-element -- The pinned native source poster is the no-WebGL boundary. */
import {useEffect,useRef} from 'react';
import {registerProjectStudyStage} from '../runtime/site/ProjectStudyStageRegistry.mjs';
import styles from './ProjectCaseStudy.module.css';

/** Only the native host and public source configuration belong to React.
 * The existing site driver owns preparation, all active time and disposal. */
export default function ProjectCaseStudyStage({projectId,model}){
 const host=useRef(null);
 useEffect(()=>{
  const node=host.current,root=document.querySelector(`[data-project-study="${projectId}"]`);
  if(!root)return;
  return registerProjectStudyStage(document,{root,host:node,model});
 },[projectId,model]);
 return <div ref={host} className={styles.modelStage} data-project-model-stage data-site-preview-required aria-hidden="true">
  <div className={styles.modelSurface} data-project-model-surface>
   <img className={styles.modelPoster} data-project-model-poster data-site-critical src={model.poster.src} width={model.poster.width} height={model.poster.height} alt="" loading="eager" decoding="async"/>
  </div>
 </div>;
}
