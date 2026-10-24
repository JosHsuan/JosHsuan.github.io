'use client';
/* eslint-disable @next/next/no-img-element -- The pinned original poster is the complete native fallback, not a generated replacement. */
import {useEffect,useRef,useState} from 'react';
import {createPreviewLifecycle,createExclusivePreviewLease,observePreviewEligibility} from '../runtime/site/PreviewLifecycle.mjs';
import {registerPagePreviewReadiness} from '../runtime/site/PagePreviewReadiness.mjs';
import {canCommitHomeResearchExposure} from '../runtime/site/HomeResearchPresenter.mjs';
import {registerHomeResearchStage} from '../runtime/site/HomeResearchStageRegistry.mjs';

const lease=createExclusivePreviewLease();
export default function HomeResearchStage({poster,className=''}){
 const host=useRef(null),controls=useRef(null),[state,setState]=useState({phase:'poster',reason:'initial',paused:false,painted:false});
 useEffect(()=>{
  const node=host.current,root=node.closest('[data-home-research-story]');
  if(!root)return;
  const listeners=new Set(),forced=window.matchMedia('(forced-colors: active)');
  let readiness=null,lifecycle=null,resource=null,arrivalStatic=false,staticReason='',disposed=false,paused=false,exposure=null;
  const publish=()=>{for(const listener of [...listeners])if(listeners.has(listener))listener();};
  const staticReady=reason=>readiness?.report({mode:'static',reason});
  const settleStatic=reason=>{arrivalStatic=true;staticReason=reason;lifecycle?.stop(reason);staticReady(reason);publish();};
  readiness=registerPagePreviewReadiness(document,node,{onFallback:settleStatic});
  if(arrivalStatic)staticReady(staticReason);
  lifecycle=createPreviewLifecycle({lease,retainWhenInactive:true,onState:snapshot=>{
   if(disposed)return;
   setState({phase:snapshot.phase,reason:snapshot.reason,paused,painted:snapshot.phase==='ready'&&snapshot.resource?.firstDraw?.completed===true});
   if(snapshot.phase==='ready'&&snapshot.resource?.firstDraw?.completed)readiness.report({mode:'model'});
   else if(snapshot.phase==='failed'){arrivalStatic=true;staticReason=snapshot.reason;staticReady(snapshot.reason);}
   publish();
  },start:async({signal})=>{
   const scene=await import('../runtime/site/home-research-scene.mjs');
   if(signal.aborted)throw new DOMException('Home specimen aborted','AbortError');
   const acquired=await scene.acquireHomeResearchScene({host:node,signal,onFailure:reason=>lifecycle.fail(reason)});
   if(!signal.aborted&&!disposed)resource=acquired;
   return{...acquired,resize(width,height){
    acquired.resize(width,height);
    // Prepare a restored/deep-linked document before its real first-paint
    // readiness is reported. Native offsets are unaffected by presentation.
    let top=0;for(let current=root;current;current=current.offsetParent)top+=current.offsetTop;
    const progress=paused?(acquired.inspect().progress??0):Math.max(0,Math.min(1,(window.scrollY-top)/Math.max(1,root.offsetHeight-window.innerHeight)));
    acquired.present({progress,width,height});
   },dispose(){if(resource===acquired)resource=null;acquired.dispose();}};
  }});
  const inspect=()=>({...lifecycle.inspect(),paused,arrivalStatic,staticReason,entryState:document.documentElement.getAttribute('data-site-entry-state'),exposure});
  const descriptor={root,host:node,inspect,subscribe(listener){listeners.add(listener);return()=>listeners.delete(listener);},present(input){
   const current=lifecycle.inspect();
   if(disposed||arrivalStatic||paused||!current.active||current.phase!=='ready'||!resource)return false;
   try{return resource.present(input);}catch(error){lifecycle.fail(error?.message||'home-render-unavailable');return false;}
  },expose(input){
   const current=lifecycle.inspect(),entryState=document.documentElement.getAttribute('data-site-entry-state');
   const loader=document.querySelector('[data-site-loader]');
   const loaderDisplay=loader?window.getComputedStyle(loader).display:null;
   if(!canCommitHomeResearchExposure({stage:current,generation:input.generation,disposed,arrivalStatic,paused,hidden:document.hidden,connected:node.isConnected,hasResource:!!resource,entryState,loaderHidden:loader?.hidden,loaderDisplay}))return false;
   if(exposure?.generation===current.id)return exposure;
   // A single discrete exposure observation, never a per-frame layout read.
   const visibility=[];for(let element=node; element&&visibility.length<5; element=element.parentElement){
    const style=window.getComputedStyle(element),rect=element.getBoundingClientRect();
    visibility.push({tag:element.tagName,display:style.display,visibility:style.visibility,opacity:style.opacity,transform:style.transform,rect:{x:rect.x,y:rect.y,width:rect.width,height:rect.height}});
   }
   try{
    const result=resource.expose(input);
    if(result?.completed!==true)return false;
    exposure=Object.freeze({generation:current.id,entryState,completed:true,loaderHidden:loader.hidden,loaderDisplay:'none',visibility,resource:result});
    return exposure;
   }catch(error){lifecycle.fail(error?.message||'home-exposure-unavailable');return false;}
  }};
  const release=registerHomeResearchStage(document,descriptor);
  if(arrivalStatic)lifecycle.stop(staticReason);
  if(forced.matches)settleStatic('forced-colors');
  const eligibility=observePreviewEligibility({element:node,window,document,mode:'page',onChange:({active,reason,reduced,saveData})=>{
   if(arrivalStatic)return;
   if(reduced||saveData||forced.matches){settleStatic(forced.matches?'forced-colors':reason);return;}
   if(!active&&lifecycle.inspect().phase!=='ready'){settleStatic(reason);return;}
   lifecycle.setActive(active,reason);
  },onSize:(width,height)=>lifecycle.resize(width,height)});
  const policy=()=>{if(forced.matches)settleStatic('forced-colors');};
  const pagehide=event=>{if(!event.persisted){staticReady('page-exit');lifecycle.dispose();}};
  const toggle=()=>{if(lifecycle.inspect().phase!=='ready')return;paused=!paused;setState(previous=>({...previous,paused}));publish();};
  controls.current=toggle;
  forced.addEventListener('change',policy);window.addEventListener('pagehide',pagehide);
  const diagnostic={inspect:()=>({...inspect(),eligibility:eligibility.inspect()})};node.__homeResearch=diagnostic;window.__homeResearch=diagnostic;
  return()=>{disposed=true;controls.current=null;release();forced.removeEventListener('change',policy);window.removeEventListener('pagehide',pagehide);eligibility.dispose();lifecycle.dispose();readiness.release();listeners.clear();delete node.__homeResearch;if(window.__homeResearch===diagnostic)delete window.__homeResearch;};
 },[]);
 return <div className={className} data-home-research-stage data-preview-phase={state.phase} data-preview-reason={state.reason}>
  <div ref={host} data-home-research-host data-site-preview-required style={{position:'absolute',inset:0,overflow:'hidden',pointerEvents:'none'}}>
   {/* Keep native image semantics and decoded fallback pixels; only a genuine
       ready first draw hides its paint beneath the transparent source canvas. */}
   <img src={poster.src} width={poster.width} height={poster.height} alt={poster.alt??''} loading="eager" decoding="async" data-site-critical data-home-research-poster style={{display:'block',width:'100%',height:'100%',objectFit:'contain',opacity:state.painted?0:1}}/>
  </div>
  {state.phase==='ready'&&<button type="button" data-home-research-pause aria-pressed={state.paused} onClick={()=>controls.current?.()}>{state.paused?'Resume specimen motion':'Pause specimen motion'}</button>}
 </div>;
}
