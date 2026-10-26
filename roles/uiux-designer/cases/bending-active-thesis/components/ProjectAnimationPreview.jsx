'use client';
/* eslint-disable @next/next/no-img-element -- Native poster pixels remain the honest failed-media fallback. */
import {useEffect,useRef,useState} from 'react';
import {createPreviewLifecycle,observePreviewEligibility} from '../runtime/site/PreviewLifecycle.mjs';
import {acquireVideo} from '../runtime/site/video-resource.mjs';

/** Muted inline media follows actual viewport and document lifetime. It never
 * requires a click to reveal content or opens an original in another page. */
export default function ProjectAnimationPreview({animation,poster,className,label,controlPlacement='overlay',controlLabel,mediaClassName,critical=true}){
 const host=useRef(null),video=useRef(null),position=useRef(0);
 const [view,setView]=useState({phase:'poster',reason:'initial',id:null});
 useEffect(()=>{
  let connected=true;
  const element=host.current,media=video.current;
  position.current=0;
  const controller=createPreviewLifecycle({
   start:({signal})=>acquireVideo({video:media,src:animation.src,signal,position:position.current,
    onPosition:value=>{position.current=value;},origin:window.location.origin,onFailure:()=>{
     if(connected&&!signal.aborted)controller.fail('playback-unavailable');
    }}),
   onState:snapshot=>{
    if(!connected)return;
    const phase=snapshot.phase==='ready'?'playing':snapshot.phase==='requested'?'loading':snapshot.phase==='failed'?'failed':'poster';
    setView({phase,reason:snapshot.reason,id:snapshot.id});
   },
  });
  const observer=observePreviewEligibility({element,window,document,onChange:state=>{
   if(connected)controller.setActive(state.active,state.reason);
  }});
  const diagnostics={inspect:()=>({...controller.inspect(),eligibility:observer.inspect(),userPaused:false,position:position.current})};
  element.__animationPreview=diagnostics;
  return()=>{connected=false;observer.dispose();controller.dispose();if(element.__animationPreview===diagnostics)delete element.__animationPreview;};
 },[animation.src]);
 const media=<>
  <img src={poster.src} width={poster.width} height={poster.height} alt={poster.alt} loading={critical?'eager':'lazy'} decoding="async" data-site-critical={critical?'':undefined} data-animation-poster hidden={view.phase==='playing'} style={{position:'absolute',inset:0,width:'100%',height:'100%',zIndex:1,pointerEvents:'none'}}/>
  <video ref={video} width={animation.width} height={animation.height} muted loop playsInline preload="none" aria-hidden="true" data-animation-video hidden={!['loading','playing'].includes(view.phase)} style={{position:'absolute',inset:0,width:'100%',height:'100%',zIndex:0,pointerEvents:'none'}}/>
 </>;
 return <div ref={host} className={className} role="group" aria-label={label??animation.alt}
  data-project-animation-preview data-animation-state={view.phase} data-animation-reason={view.reason} data-animation-request-id={view.id??undefined}>
  {controlPlacement==='outside'?<>
   {controlLabel&&<div data-animation-control-row><span data-animation-label>{controlLabel}</span></div>}
   <div className={mediaClassName} data-animation-frame>{media}</div>
  </>:media}
 </div>;
}
