'use client';
/* eslint-disable @next/next/no-img-element -- Pinned source posters are the SSR/no-WebGL fallback. */
import {useEffect,useRef,useState} from 'react';
import {createXRStageDirector} from '../runtime/xr/XRStageDirector.mjs';
import styles from './xr-scene-stage.module.css';

export default function XRSceneStage({model,stages,openingVisual}){
 const host=useRef(null),director=useRef(null),positions=useRef(new Map());
 const [state,setState]=useState({phase:'poster',reason:'initial',chapter:'overview',sceneChapter:'overview',sceneMode:'absent',paused:false,reduced:false,saveData:false});
 const [rendering,setRendering]=useState('poster');
 useEffect(()=>{
  const node=host.current,root=document.querySelector('[data-xr-study]');let connected=true;
  root.dataset.xrEnhanced='';
  const runtime=createXRStageDirector({root,host:node,window,document,onState:next=>{if(connected)setState(next);},acquire:async({signal,onFailure})=>{
   const {acquireXRStage}=await import('./xr-stage-scene.mjs');if(signal.aborted)throw new DOMException('XR stage released','AbortError');
   return acquireXRStage({host:node,signal,model,stages,positions:positions.current,videos:Object.fromEntries(stages.map(stage=>[stage.id,node.querySelector(`[data-xr-stage-video="${stage.id}"]`)])),onFailure,onMode:next=>{if(connected)setRendering(next);}});
  }});
  director.current=runtime;node.__xrStage=runtime;const disconnect=runtime.connect();
  return()=>{connected=false;disconnect?.();director.current=null;delete root.dataset.xrEnhanced;if(node.__xrStage===runtime)delete node.__xrStage;};
 },[model,stages]);
 return <>
  <div ref={host} className={styles.stage} data-xr-stage data-xr-opening={state.sceneChapter==='overview'?'true':'false'} data-research-phase={state.phase} data-research-reason={state.reason} aria-hidden="true">
   <img className={styles.openingVisual} data-xr-opening-visual data-site-critical src={openingVisual.src} width={openingVisual.width} height={openingVisual.height} alt="" loading="eager" decoding="async" fetchPriority="high"/>
   <div className={styles.sceneSurface} data-xr-scene-surface>
    <img className={styles.modelPoster} data-xr-model-poster src={model.poster.src} width={model.poster.width} height={model.poster.height} alt=""/>
    {stages.map(stage=><div className={styles.nativePhone} data-xr-native-phone={stage.id} key={stage.id} hidden={state.sceneChapter!==stage.id}>
     <div className={styles.screen} style={{aspectRatio:`${stage.width}/${stage.height}`}}>
      <video data-xr-stage-video={stage.id} width={stage.width} height={stage.height} muted loop playsInline preload="none" aria-hidden="true"/>
      <img src={stage.poster.src} width={stage.poster.width} height={stage.poster.height} alt=""/>
     </div>
    </div>)}
   </div>
  </div>
  <div className={styles.controls} data-xr-scene-controls data-protect hidden={state.sceneMode!=='hold'||state.sceneChapter!==state.chapter||state.chapter==='overview'||state.phase!=='ready'||!['webgl-model','webgl-phone','native-video'].includes(rendering)}>
   <span aria-live="polite">{['adapt','assemble','join'].includes(state.chapter)?'RECORDED APP INTERFACE':'SOURCE GEOMETRY / DRAG TO EXPLORE'}</span>
   {['adapt','assemble','join'].includes(state.chapter)&&<button type="button" data-xr-motion-toggle disabled={state.reduced||state.saveData||state.phase!=='ready'} aria-pressed={state.paused} onClick={()=>director.current?.setPaused(!state.paused)}>{state.paused?'Play recording':'Pause recording'}</button>}
  </div>
  <noscript><style>{'[data-xr-scene-controls]{display:none!important}'}</style></noscript>
 </>;
}
