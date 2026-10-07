'use client';
import dynamic from 'next/dynamic';
import {Component,useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {createReviewInput} from './input';
import {progressFromAnchors} from './vendor/camera-plan.mjs';
import styles from './viewer.module.css';
const Scene=dynamic(()=>import('./Scene'),{ssr:false});
class Boundary extends Component{
 state={failed:false};static getDerivedStateFromError(){return{failed:true};}
 componentDidCatch(){this.props.onFailure();}
 render(){return this.state.failed?null:this.props.children;}
}
export default function ModelViewer(){
 const input=useMemo(createReviewInput,[]),readout=useRef(null),viewport=useRef(null);
 const [active,setActive]=useState(false),[ready,setReady]=useState(false),[failed,setFailed]=useState(false);
 const [mode,setMode]=useState('static'),[representation,setRepresentation]=useState('material'),[reduced,setReduced]=useState(false),[attempt,setAttempt]=useState(0);
 const failure=useCallback(()=>{setFailed(true);setActive(false);setReady(false);},[]);
 const onReady=useCallback(()=>setReady(true),[]);
 useEffect(()=>{
  const query=matchMedia('(prefers-reduced-motion: reduce)');const changed=()=>{setReduced(query.matches);input.set({reduced:query.matches,mode:'static'});setMode('static');};changed();query.addEventListener('change',changed);
  return()=>query.removeEventListener('change',changed);
 },[input]);
 useEffect(()=>input.subscribe(state=>{if(readout.current)readout.current.textContent=`${Math.round(state.u*100)}% · ${state.mode==='story'?'Page scroll':state.mode==='inspect'?'Pointer inspection':'Fixed view'}`;}),[input]);
 useEffect(()=>{
  let anchors=[];
  const measure=()=>{const nodes=['form','system','make'].map(id=>document.getElementById(id));if(nodes.some(n=>!n))return;
   anchors=nodes.map(n=>n.getBoundingClientRect().top+scrollY-innerHeight*.35);anchors.push(nodes[2].getBoundingClientRect().bottom+scrollY-innerHeight*.35);update();};
  const update=()=>{if(input.get().mode==='story'&&anchors.length===4&&anchors.every((v,i)=>i===0||v>anchors[i-1]))input.set({u:progressFromAnchors(scrollY,anchors)});};
  const observer=new ResizeObserver(measure);observer.observe(document.body);measure();
  addEventListener('scroll',update,{passive:true});addEventListener('resize',measure);const unsubscribe=input.subscribe(update);
  return()=>{observer.disconnect();removeEventListener('scroll',update);removeEventListener('resize',measure);unsubscribe();};
 },[input]);
 const chooseMode=next=>{setMode(next);input.set({mode:next});};
 const changeRepresentation=next=>{setRepresentation(next);input.set({representation:next});};
 const point=event=>{if(!active||!ready||mode!=='inspect')return;const b=event.currentTarget.getBoundingClientRect();input.set({u:(event.clientX-b.left)/b.width});};
 const keyboard=event=>{if(!active||!ready||mode!=='inspect')return;let value=input.get().u;
  if(event.key==='Home')value=0;else if(event.key==='End')value=1;else if(event.key==='ArrowLeft')value-=.025;else if(event.key==='ArrowRight')value+=.025;else return;event.preventDefault();input.set({u:value});};
 return <section className={styles.viewer} aria-label="Interactive thesis model">
  <div className={styles.topline}><span>01 / ASSEMBLED SURFACE</span><span>3D STUDY</span></div>
  <div ref={viewport} className={styles.viewport} tabIndex={active&&mode==='inspect'?0:-1} role="group" aria-label="Model inspection. Use left and right arrow keys, Home or End." onPointerMove={point} onPointerDown={point} onKeyDown={keyboard}>
   {active&&!failed&&<Boundary key={attempt} onFailure={failure}><Scene input={input} onReady={onReady} onFailure={failure}/></Boundary>}
   {(!active||!ready||failed)&&<img className={styles.poster} src="/assets/model-poster.png" width="1400" height="1000" alt="Converted CAD assembly of the bending-active perforated metal surface"/>}
   {!active&&!failed&&<div className={styles.invite}><button onClick={()=>{setActive(true);setReady(false);}}>Explore the model <span aria-hidden="true">↗</span></button><span>Loads a 3.6 MB model</span></div>}
   {active&&!ready&&<p className={styles.loading} role="status">Preparing the surface…</p>}
   <div className={styles.caption}><span>Source geometry · neutral metal finish</span><output ref={readout}>0% · Fixed view</output></div>
  </div>
  <div className={styles.tools}>
   <noscript><p className={styles.hint}>The interactive model needs JavaScript. The model capture, study text and source photographs remain available.</p></noscript>
   <div className={styles.row} aria-label="Model representation">{[['material','Material'],['contours','Contours'],['edges','Edges']].map(([id,label])=><button key={id} disabled={!ready} aria-pressed={representation===id} onClick={()=>changeRepresentation(id)}>{label}</button>)}</div>
   <div className={styles.row} aria-label="Model navigation">{[['static','Fixed'],['story','Follow page'],['inspect','Inspect']].map(([id,label])=><button key={id} disabled={!ready||(reduced&&id==='story')} aria-pressed={mode===id} onClick={()=>chooseMode(id)}>{label}</button>)}{active&&<button onClick={()=>{setActive(false);setReady(false);chooseMode('static');}}>Close 3D</button>}</div>
   <p className={styles.hint}>{failed?'The interactive view is unavailable. The model capture and project evidence remain available.':reduced?'Reduced motion is on. Fixed views are the default; Inspect enables deliberate manual movement.':mode==='inspect'?'Move horizontally, tap or use ← → to inspect. Motion stops with your input.':mode==='story'?'Scroll through FORM / SYSTEM / MAKE to move around the same geometry.':'Choose a fixed view, follow the page, or inspect with one horizontal gesture.'}</p>
   {failed&&attempt<1&&<button onClick={()=>{setFailed(false);setAttempt(attempt+1);setActive(true);}}>Retry 3D</button>}
   <details className={styles.details}><summary>What this view shows</summary><p>The detailed assembled surface from the supplied Rhino model. Units are converted from millimetres to metres; geometry is unchanged. Contours reveal height and Edges reveal mesh boundaries. These are reading aids, not stress analysis or a new physical simulation.</p><p>CAD bounds: 2.376 × 3.100 × 0.725 m. These differ from the reported built prototype dimensions. Separate layouts, duplicate studies, markers and scale figures are outside this view.</p><a href="/assets/model.json" target="_blank" rel="noreferrer">Conversion record ↗</a></details>
  </div>
 </section>;
}
