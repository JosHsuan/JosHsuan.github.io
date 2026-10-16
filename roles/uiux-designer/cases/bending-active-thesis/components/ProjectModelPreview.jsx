'use client';
/* eslint-disable @next/next/no-img-element -- The approved static poster is the no-JavaScript and resource-failure boundary. */
import {useEffect,useRef,useState} from 'react';
import {createPreviewLifecycle,createExclusivePreviewLease,observePreviewEligibility} from '../runtime/site/PreviewLifecycle.mjs';
import {registerPagePreviewReadiness} from '../runtime/site/PagePreviewReadiness.mjs';

const lease=createExclusivePreviewLease();
export default function ProjectModelPreview({poster,className=''}){
 const host=useRef(null),[state,setState]=useState({phase:'poster',reason:'initial'});
 useEffect(()=>{
  const node=host.current;
  let readiness=null,lifecycle=null,arrivalStatic=false,staticReason='';
  const staticReady=reason=>readiness?.report({mode:'static',reason});
  const settleStatic=reason=>{
   arrivalStatic=true;staticReason=reason;
   lifecycle?.stop(reason);staticReady(reason);
  };
  // The shared startup deadline closes partial fetch/GPU work synchronously
  // before the loader can expose this document's static fallback.
  readiness=registerPagePreviewReadiness(document,node,{onFallback:settleStatic});
  if(arrivalStatic)staticReady(staticReason);
  lifecycle=createPreviewLifecycle({lease,retainWhenInactive:true,onState:snapshot=>{
   setState(snapshot);
   // Acquisition is not readiness: the lifecycle first asks the real renderer
   // to draw at the measured card size, then publishes its ready terminal.
   if(snapshot.phase==='ready'&&snapshot.resource?.firstDraw?.completed)readiness.report({mode:'model'});
   else if(snapshot.phase==='failed'){arrivalStatic=true;staticReason=snapshot.reason;staticReady(snapshot.reason);}
  },start:async({signal})=>{
   const preview=await import('./project-model-scene.mjs');if(signal.aborted)throw new DOMException('Preview aborted','AbortError');
   return preview.acquireProjectModelScene({host:node,signal,onFailure:reason=>lifecycle.fail(reason)});
  }});
  if(arrivalStatic)lifecycle.stop(staticReason);
  const eligibility=observePreviewEligibility({element:node,window,document,mode:'page',onChange:({active,reason,reduced,saveData})=>{
   if(arrivalStatic)return;
   if(reduced||saveData){lifecycle.stop(reason);staticReady(reason);return;}
   // A page opened/hidden before preparation settles on its decoded SSR
   // poster for this arrival; returning cannot introduce a late 2D-to-3D pop.
   if(!active&&lifecycle.inspect().phase!=='ready'){settleStatic(reason);return;}
   lifecycle.setActive(active,reason);
  },onSize:(width,height)=>lifecycle.resize(width,height)});
  const pagehide=event=>{if(!event.persisted){staticReady('page-exit');lifecycle.dispose();}};
  window.addEventListener('pagehide',pagehide);
  const diagnostic={inspect:()=>({...lifecycle.inspect(),eligibility:eligibility.inspect()})};node.__projectModelPreview=diagnostic;window.__projectModelPreview=diagnostic;
  return()=>{window.removeEventListener('pagehide',pagehide);eligibility.dispose();lifecycle.dispose();readiness.release();delete node.__projectModelPreview;if(window.__projectModelPreview===diagnostic)delete window.__projectModelPreview;};
 },[]);
 return <span ref={host} className={className} data-project-model-preview data-site-preview-required data-preview-phase={state.phase} data-preview-reason={state.reason} style={{position:'absolute',inset:0,display:'block',overflow:'hidden',pointerEvents:'none'}}>
  <img src={poster.src} width={poster.width} height={poster.height} alt={poster.alt??''} loading="eager" decoding="async" data-site-critical data-model-poster style={{display:'block',width:'100%',height:'100%',objectFit:'cover'}}/>
 </span>;
}
