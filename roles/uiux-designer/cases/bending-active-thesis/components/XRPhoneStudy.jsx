'use client';
/* eslint-disable @next/next/no-img-element -- Source-frame posters preserve the recorded interface without JavaScript or WebGL. */
import {useEffect,useId,useRef,useState} from 'react';
import {createPreviewLifecycle,observePreviewEligibility} from '../runtime/site/PreviewLifecycle.mjs';
import styles from './research-media.module.css';

export default function XRPhoneStudy({stages}){
 const [selected,setSelected]=useState(0),[view,setView]=useState({phase:'poster',reason:'initial',userPaused:false}),[front,setFront]=useState(false),[preference,setPreference]=useState({reduced:false,saveData:false});
 const stage=stages[selected],id=useId(),host=useRef(null),video=useRef(null),resource=useRef(null),manager=useRef(null),eligibility=useRef(null);
 const paused=useRef(false),facing=useRef(false),positions=useRef(new Map());
 useEffect(()=>{
  const node=host.current,media=video.current;let connected=true;
  const controller=createPreviewLifecycle({onState:value=>{
   if(connected)setView({phase:value.phase,reason:value.reason,stageId:stage.id,userPaused:paused.current});
  },start:async({signal})=>{
   const {acquireXRPhoneStudy}=await import('./research-scene.mjs');if(signal.aborted)throw new DOMException('Recording released','AbortError');
   const handle=await acquireXRPhoneStudy({host:node,video:media,signal,stage,position:positions.current.get(stage.id)??0,
    onPosition:value=>positions.current.set(stage.id,value),onFailure:()=>controller.fail('recording-unavailable'),
    onMode:(mode,reason)=>{if(connected&&!signal.aborted){node.dataset.phoneRendering=mode;node.dataset.phoneFallback=reason??'';}}});
   if(signal.aborted){handle.dispose();throw new DOMException('Recording released','AbortError');}resource.current=handle;handle.faceScreen(facing.current);
   return {...handle,dispose(){if(resource.current===handle){resource.current=null;node.dataset.phoneRendering='poster';delete node.dataset.phoneFallback;}handle.dispose();}};
  }});
  manager.current=controller;
  const observer=observePreviewEligibility({element:node,window,document,onChange:state=>{
   if(!connected)return;setPreference({reduced:state.reduced,saveData:state.saveData});
   controller.setActive(state.active&&!paused.current,paused.current?'user-paused':state.reason);
  },onSize:(width,height)=>controller.resize(width,height)});
  eligibility.current=observer;
  const diagnostics={inspect:()=>({...controller.inspect(),eligibility:observer.inspect(),stage:stage.id,userPaused:paused.current,front:facing.current})};node.__xrPhoneStudy=diagnostics;
  return()=>{connected=false;observer.dispose();controller.dispose();if(node.__xrPhoneStudy===diagnostics)delete node.__xrPhoneStudy;if(manager.current===controller)manager.current=null;if(eligibility.current===observer)eligibility.current=null;};
 },[stage]);
 const toggle=()=>{
  paused.current=!paused.current&&['requested','ready'].includes(view.phase);
  const allowed=eligibility.current?.inspect();if(!paused.current&&view.phase==='failed')manager.current?.setActive(false,'user-retry');
  manager.current?.setActive(!!allowed?.active&&!paused.current,paused.current?'user-paused':allowed?.reason??'entry-pending');
  setView(current=>({...current,userPaused:paused.current,reason:paused.current?'user-paused':current.reason}));
 };
 const face=()=>{const next=!facing.current;facing.current=next;setFront(next);resource.current?.faceScreen(next);};
 const playing=view.phase==='ready'&&view.stageId===stage.id,blocked=preference.reduced||preference.saveData;
 return <figure className={styles.phoneStudy} data-xr-phone-study>
  <div className={styles.stageButtons} role="group" aria-label="Recorded research stages">
   {stages.map((item,index)=><button type="button" key={item.id} aria-pressed={index===selected} aria-controls={id} data-phone-stage={item.id} onClick={()=>setSelected(index)}><span>{String(index+1).padStart(2,'0')}</span>{item.label.replace(/^\d+\s*\/\s*/,'')}</button>)}
  </div>
  <div className={styles.phoneGrid}>
   <div ref={host} id={id} className={styles.phoneViewport} data-xr-phone-surface data-research-phase={view.stageId===stage.id?view.phase:'poster'} data-research-reason={view.reason} data-phone-front={front?'true':'false'}>
    <div className={styles.nativePhone} style={{'--screen-aspect':`${stage.width} / ${stage.height}`,'--screen-ratio':stage.width/stage.height}}>
     <div className={styles.nativeScreen}>
      <video ref={video} width={stage.width} height={stage.height} muted loop playsInline preload="none" aria-hidden="true" data-phone-video/>
      <img src={stage.poster.src} width={stage.poster.width} height={stage.poster.height} alt={stage.poster.alt} loading="lazy" decoding="async" hidden={playing}/>
     </div>
    </div>
   </div>
   <div className={styles.phoneNarrative} aria-live="polite" aria-atomic="true">
    <p className={styles.eyebrow}>{String(selected+1).padStart(2,'0')} / RECORDED APP INTERFACE</p><h3>{stage.title}</h3><p>{stage.description}</p>
    <div className={styles.phoneControls}>
     <button type="button" data-phone-toggle disabled={blocked} aria-controls={id} onClick={toggle}>{blocked?'Motion paused by preference':!view.userPaused&&['requested','ready'].includes(view.phase)?'Pause recording':'Play recording'}</button>
     <button type="button" data-phone-front-toggle aria-pressed={front} onClick={face}>{front?'Perspective view':'Face screen'}</button>
    </div>
    <a className={styles.fullRecording} href={stage.src} target="_blank" rel="noreferrer">Open full recording <span aria-hidden="true">↗</span></a>
    <p className={styles.recordingNote}>Original interface recording, presented on an iPhone display model. The website does not connect to tracking hardware.</p>
   </div>
  </div>
  <figcaption><p>{stage.caption}</p><span>{stage.credit}</span></figcaption>
  <noscript><style>{'[data-xr-phone-study] button{display:none!important}'}</style><div className={styles.recordingLinks}>{stages.map(item=><a key={item.id} href={item.src}>{item.label} — view original-sequence recording</a>)}</div></noscript>
 </figure>;
}
