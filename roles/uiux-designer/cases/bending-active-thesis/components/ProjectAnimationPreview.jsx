'use client';
import {useEffect,useId,useRef,useState} from 'react';
import {createPreviewLifecycle,observePreviewEligibility} from '../runtime/site/PreviewLifecycle.mjs';
import {acquireVideo} from '../runtime/site/video-resource.mjs';

/** Optional project media. The surrounding project link is a sibling, so this
 * native pause button never creates nested interactive content. */
export default function ProjectAnimationPreview({animation,poster,className,label,controlPlacement='overlay',controlLabel,mediaClassName}){
 const host=useRef(null),video=useRef(null),manager=useRef(null),eligibility=useRef(null);
 const paused=useRef(false),position=useRef(0),videoId=useId();
 const [view,setView]=useState({phase:'poster',reason:'initial',id:null});
 const [preference,setPreference]=useState({reduced:false,saveData:false});
 useEffect(()=>{
  let connected=true;
  const element=host.current,media=video.current;
  position.current=0;
  const controller=createPreviewLifecycle({
   start:({signal})=>acquireVideo({video:media,src:animation.src,signal,position:position.current,
    onPosition:value=>{position.current=value;},origin:window.location.origin,onFailure:()=>{
     if(!connected||signal.aborted)return;
     controller.fail('playback-unavailable');
    }}),
   onState:snapshot=>{
    if(!connected)return;
    const phase=snapshot.phase==='ready'?'playing':snapshot.phase==='requested'?'loading':snapshot.phase==='failed'?'failed':paused.current?'paused':'poster';
    setView({phase,reason:snapshot.reason,id:snapshot.id});
   },
  });
  manager.current=controller;
  const observer=observePreviewEligibility({element,window,document,onChange:state=>{
   if(!connected)return;
   setPreference({reduced:state.reduced,saveData:state.saveData});
   controller.setActive(state.active&&!paused.current,paused.current?'user-paused':state.reason);
  }});
  eligibility.current=observer;
  const diagnostics={inspect:()=>({...controller.inspect(),eligibility:observer.inspect(),userPaused:paused.current,position:position.current})};
  element.__animationPreview=diagnostics;
  return()=>{
   connected=false;observer.dispose();controller.dispose();
   if(element.__animationPreview===diagnostics)delete element.__animationPreview;
   if(manager.current===controller)manager.current=null;
   if(eligibility.current===observer)eligibility.current=null;
  };
 },[animation.src]);
 const toggle=()=>{
  const shouldPause=!paused.current&&['loading','playing'].includes(view.phase);
  paused.current=shouldPause;
  const eligible=eligibility.current?.inspect();
  if(!shouldPause&&view.phase==='failed')manager.current?.setActive(false,'user-retry');
  manager.current?.setActive(!!eligible?.active&&!paused.current,paused.current?'user-paused':eligible?.reason??'not-ready');
  // A poster may already be inactive, so no lifecycle transition is required.
  setView(current=>({...current,phase:paused.current?'paused':current.phase==='paused'?'poster':current.phase}));
 };
 const blocked=preference.reduced||preference.saveData;
 const pauseAction=!blocked&&['loading','playing'].includes(view.phase);
 const actionLabel=pauseAction?'Pause animation':'Play animation';
 const media=<>
  <img src={poster.src} width={poster.width} height={poster.height} alt={poster.alt} loading="eager" decoding="async" data-site-critical data-animation-poster hidden={view.phase==='playing'} style={{position:'absolute',inset:0,width:'100%',height:'100%',zIndex:1,pointerEvents:'none'}}/>
  <video ref={video} id={videoId} width={animation.width} height={animation.height} muted loop playsInline preload="none" aria-hidden="true" data-animation-video hidden={!['loading','playing'].includes(view.phase)} style={{position:'absolute',inset:0,width:'100%',height:'100%',zIndex:0,pointerEvents:'none'}}/>
 </>;
 const control=<button type="button" data-animation-toggle aria-controls={videoId} aria-label={actionLabel} disabled={blocked}
  title={blocked?'Animation is paused by your motion or data-saving preference.':actionLabel} onClick={toggle}>
  <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" focusable="false">
   {pauseAction?<><rect x="4" y="3" width="4" height="14" rx=".7"/><rect x="12" y="3" width="4" height="14" rx=".7"/></>:<path d="M5 3.2a.7.7 0 0 1 1.07-.6l10.8 6.8a.7.7 0 0 1 0 1.2l-10.8 6.8A.7.7 0 0 1 5 16.8Z"/>}
  </svg>
 </button>;
 return <div ref={host} className={className} role="group" aria-label={label??animation.alt}
  data-project-animation-preview data-animation-state={view.phase} data-animation-reason={view.reason} data-animation-request-id={view.id??undefined}>
  {controlPlacement==='outside'?<>
   <div data-animation-control-row><span data-animation-label>{controlLabel}</span>{control}</div>
   <div className={mediaClassName} data-animation-frame>{media}</div>
  </>:<>{media}{control}</>}
  <noscript><style>{'[data-animation-toggle]{display:none!important}'}</style></noscript>
 </div>;
}
