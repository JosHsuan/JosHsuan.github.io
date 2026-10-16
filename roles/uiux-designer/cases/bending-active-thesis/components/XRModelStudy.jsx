'use client';
/* eslint-disable @next/next/no-img-element -- The exact source-geometry poster is the native fallback. */
import {useEffect,useRef,useState} from 'react';
import {createPreviewLifecycle,observePreviewEligibility} from '../runtime/site/PreviewLifecycle.mjs';
import styles from './research-media.module.css';

export default function XRModelStudy({model}){
 const host=useRef(null),resource=useRef(null),drag=useRef(null);
 const [view,setView]=useState({phase:'poster',reason:'initial'});
 useEffect(()=>{
  const node=host.current;let connected=true;
  const controller=createPreviewLifecycle({onState:value=>{if(connected)setView({phase:value.phase,reason:value.reason});},start:async({signal})=>{
   const {acquireXRModelStudy}=await import('./research-scene.mjs');
   if(signal.aborted)throw new DOMException('Study released','AbortError');
   const handle=await acquireXRModelStudy({host:node,signal,model,onFailure:reason=>controller.fail(reason)});
   if(signal.aborted){handle.dispose();throw new DOMException('Study released','AbortError');}resource.current=handle;
   return {...handle,dispose(){if(resource.current===handle)resource.current=null;handle.dispose();}};
  }});
  const eligibility=observePreviewEligibility({element:node,window,document,onChange:({active,reason})=>controller.setActive(active,reason),onSize:(width,height)=>controller.resize(width,height)});
  const diagnostics={inspect:()=>({...controller.inspect(),eligibility:eligibility.inspect()})};node.__xrModelStudy=diagnostics;
  return()=>{connected=false;eligibility.dispose();controller.dispose();drag.current=null;if(node.__xrModelStudy===diagnostics)delete node.__xrModelStudy;};
 },[model]);
 const down=event=>{
  if(!resource.current||!event.isPrimary||event.button!==0)return;
  drag.current={id:event.pointerId,x:event.clientX,y:event.clientY,startX:event.clientX,startY:event.clientY,touch:event.pointerType==='touch',locked:false};
 };
 const move=event=>{
  const current=drag.current;if(!current||current.id!==event.pointerId||!resource.current)return;
  if(!current.locked){
   const dx=event.clientX-current.startX,dy=event.clientY-current.startY;
   if(Math.hypot(dx,dy)<8)return;
   if(current.touch&&Math.abs(dy)>Math.abs(dx)){drag.current=null;return;}
   current.locked=true;event.currentTarget.setPointerCapture?.(event.pointerId);
  }
  event.preventDefault();resource.current.rotate(-(event.clientX-current.x)*.006,(event.clientY-current.y)*.004);
  current.x=event.clientX;current.y=event.clientY;
 };
 const up=event=>{if(drag.current?.id!==event.pointerId)return;drag.current=null;if(event.currentTarget.hasPointerCapture?.(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);};
 const key=event=>{
  if(!resource.current)return;
  const commands={ArrowLeft:()=>resource.current?.rotate(-.13,0),ArrowRight:()=>resource.current?.rotate(.13,0),ArrowUp:()=>resource.current?.rotate(0,-.09),ArrowDown:()=>resource.current?.rotate(0,.09),Home:()=>resource.current?.reset(),'+':()=>resource.current?.zoom(-.15),'-':()=>resource.current?.zoom(.15)};
  if(commands[event.key]){event.preventDefault();commands[event.key]();}
 };
 const ready=view.phase==='ready';
 return <figure className={styles.modelStudy} data-xr-model-study>
  <div className={styles.studyHeading}><h3>{model.title}</h3><p>{model.description}</p></div>
  <div ref={host} className={styles.modelViewport} tabIndex={0} role="group"
   aria-label="Research structure, interactive 3D. Drag horizontally or use the arrow keys to rotate. Plus and minus zoom; Home resets."
   data-xr-model-surface data-research-phase={view.phase} data-research-reason={view.reason}
   onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onLostPointerCapture={()=>{drag.current=null;}} onKeyDown={key}>
   <img src={model.poster.src} width={model.poster.width} height={model.poster.height} alt={model.poster.alt} loading="lazy" decoding="async"/>
  </div>
  <div className={styles.modelControls} aria-label="Structure view controls">
   <span>{ready?'DRAG TO ROTATE / SCROLL TO READ':'SOURCE GEOMETRY / STATIC VIEW'}</span>
   <div><button type="button" disabled={!ready} onClick={()=>resource.current?.zoom(-.15)} aria-label="Zoom in on structure">+</button><button type="button" disabled={!ready} onClick={()=>resource.current?.zoom(.15)} aria-label="Zoom out from structure">−</button><button type="button" disabled={!ready} onClick={()=>resource.current?.reset()}>Reset view</button></div>
  </div>
  <figcaption><p>{model.caption}</p><span>{model.credit}</span></figcaption>
  <noscript><style>{'[data-xr-model-study] button{display:none!important}'}</style></noscript>
 </figure>;
}
