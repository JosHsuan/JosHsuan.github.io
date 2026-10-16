'use client';
/* eslint-disable @next/next/no-img-element -- The approved static poster is the no-JavaScript and resource-failure boundary. */
import {useEffect,useRef,useState} from 'react';
import {createPreviewLifecycle,createExclusivePreviewLease,observePreviewEligibility} from '../runtime/site/PreviewLifecycle.mjs';

const lease=createExclusivePreviewLease();
export default function ProjectModelPreview({poster,className=''}){
 const host=useRef(null),[state,setState]=useState({phase:'poster',reason:'initial'});
 useEffect(()=>{
  const node=host.current;
  const lifecycle=createPreviewLifecycle({lease,onState:setState,start:async({signal})=>{
   const preview=await import('./project-model-scene.mjs');if(signal.aborted)throw new DOMException('Preview aborted','AbortError');
   return preview.acquireProjectModelScene({host:node,signal,onFailure:reason=>lifecycle.fail(reason)});
  }});
  const eligibility=observePreviewEligibility({element:node,window,document,onChange:({active,reason})=>lifecycle.setActive(active,reason),onSize:(width,height)=>lifecycle.resize(width,height)});
  const diagnostic={inspect:()=>({...lifecycle.inspect(),eligibility:eligibility.inspect()})};node.__projectModelPreview=diagnostic;window.__projectModelPreview=diagnostic;
  return()=>{eligibility.dispose();lifecycle.dispose();delete node.__projectModelPreview;if(window.__projectModelPreview===diagnostic)delete window.__projectModelPreview;};
 },[]);
 return <span ref={host} className={className} data-project-model-preview data-preview-phase={state.phase} data-preview-reason={state.reason} style={{position:'absolute',inset:0,display:'block',overflow:'hidden',pointerEvents:'none'}}>
  <img src={poster.src} width={poster.width} height={poster.height} alt={poster.alt??''} loading="eager" decoding="async" data-site-critical data-model-poster style={{display:'block',width:'100%',height:'100%',objectFit:'cover'}}/>
 </span>;
}
