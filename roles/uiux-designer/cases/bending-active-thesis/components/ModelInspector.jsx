'use client';
import {useCallback, useEffect, useRef, useState} from 'react';
import {INSPECTION_LIMITS, INSPECTION_VIEWS, resetInspectionState, setInspectionTarget} from './inspection-state.mjs';
import styles from './model-inspector.module.css';

const presets = {studio:['Studio','Broad light reveals the complete surface.'],raking:['Raking','Grazing light traces the actual folds and openings.'],silhouette:['Silhouette','Read the outline and openings against a light field.']};
const fields = [['azimuth','View angle','°'],['elevation','Elevation','°'],['separation','Layer separation','%'],['lightAzimuth','Light angle','°']];

export default function ModelInspector({input, inspection, activate, ready, failed, detail, setDetail}) {
  const dialog = useRef(null), surface = useRef(null), saved = useRef(null), drag = useRef(null);
  const [open, setOpen] = useState(false);
  const cancelDrag = useCallback(() => {const current=drag.current;drag.current=null;if(current&&surface.current?.hasPointerCapture(current.id))surface.current.releasePointerCapture(current.id);},[]);
  const sync = useCallback(() => {
    const target = inspection.target;
    dialog.current?.querySelectorAll('[data-inspection-field]').forEach(element => {element.value = target[element.dataset.inspectionField];});
    dialog.current?.querySelectorAll('[data-inspection-output]').forEach(element => {const key=element.dataset.inspectionOutput; element.textContent = key==='separation' ? `${Math.round(target[key]*100)}%` : `${Math.round(target[key])}°`;});
    dialog.current?.querySelectorAll('[data-light-preset]').forEach(element=>element.setAttribute('aria-pressed',String(element.dataset.lightPreset===target.preset)));
    dialog.current?.querySelectorAll('[data-inspection-view]').forEach(element=>{const view=INSPECTION_VIEWS[element.dataset.inspectionView];element.setAttribute('aria-pressed',String(view.azimuth===target.azimuth&&view.elevation===target.elevation));});
    const note=dialog.current?.querySelector('[data-light-description]');if(note)note.textContent=presets[target.preset][1];
    if(dialog.current)dialog.current.dataset.lightStudy=target.preset;
    const lamp=dialog.current?.querySelector('[data-inspection-field="lightAzimuth"]');if(lamp)lamp.disabled=target.preset==='silhouette';
  }, [inspection]);
  const command = useCallback(patch => {
    setInspectionTarget(inspection, patch);sync();
    input.set({inspectionRevision:(input.get().inspectionRevision??0)+1});
  }, [input, inspection, sync]);
  const measure = useCallback(() => {
    if (!dialog.current?.open || !surface.current) return;
    const r=surface.current.getBoundingClientRect();
    const hint=surface.current.querySelector('#model-study-help')?.getBoundingClientRect();
    const left=Math.max(0,r.left),top=Math.max(0,r.top),right=Math.min(innerWidth,r.right),bottom=Math.min(innerHeight,r.bottom,hint?hint.top-8:r.bottom);
    if(right>left&&bottom>top)input.set({inspectionViewport:{left:left/innerWidth,top:top/innerHeight,width:(right-left)/innerWidth,height:(bottom-top)/innerHeight},inspectionRevision:(input.get().inspectionRevision??0)+1});
  },[input]);
  const restore = useCallback(() => {
    if(!saved.current)return;
    const previous=saved.current;saved.current=null;cancelDrag();
    document.documentElement.removeAttribute('data-model-inspection');
    document.body.style.overflow=previous.overflow;
    input.set({inspectionActive:false,inspectionRevision:(input.get().inspectionRevision??0)+1,pointer:{x:0,y:0}});
    setOpen(false);scrollTo({top:previous.scrollY,left:previous.scrollX,behavior:'instant'});
    previous.trigger?.focus({preventScroll:true});
  },[input,cancelDrag]);
  const close = useCallback(() => {dialog.current?.close();restore();},[restore]);
  useEffect(() => {
    const launch = event => {
      const trigger=event.target.closest?.('[data-open-model-study]');
      if(!trigger||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
      event.preventDefault();if(dialog.current.open)return;
      saved.current={trigger,scrollX,scrollY,overflow:document.body.style.overflow};
      resetInspectionState(inspection);sync();
      document.body.style.overflow='hidden';document.documentElement.setAttribute('data-model-inspection','');
      dialog.current.showModal();setOpen(true);activate();
      dialog.current.querySelector('aside').scrollTop=0;
      input.set({inspectionActive:true,inspection:{...inspection.value},inspectionSettled:true,inspectionRevision:(input.get().inspectionRevision??0)+1,pointer:{x:0,y:0}});
      measure();dialog.current.querySelector('[data-return-study]').focus({preventScroll:true});
    };
    document.addEventListener('click',launch);
    const observer=new ResizeObserver(measure);if(surface.current)observer.observe(surface.current);
    window.addEventListener('resize',measure);
    return()=>{document.removeEventListener('click',launch);observer.disconnect();window.removeEventListener('resize',measure);restore();};
  },[activate,input,inspection,measure,restore,sync]);
  useEffect(()=>{if(open){sync();measure();}},[open,ready,sync,measure]);
  useEffect(()=>{if(!ready||!open)cancelDrag();},[ready,open,cancelDrag]);
  useEffect(()=>{const hidden=()=>{if(document.hidden)cancelDrag();};window.addEventListener('blur',cancelDrag);document.addEventListener('visibilitychange',hidden);return()=>{window.removeEventListener('blur',cancelDrag);document.removeEventListener('visibilitychange',hidden);cancelDrag();};},[cancelDrag]);
  function reset(){resetInspectionState(inspection);sync();input.set({inspectionRevision:(input.get().inspectionRevision??0)+1});}
  function begin(event){if(!ready||event.button!==0)return;drag.current={id:event.pointerId,x:event.clientX,y:event.clientY,azimuth:inspection.target.azimuth,elevation:inspection.target.elevation};event.currentTarget.setPointerCapture(event.pointerId);}
  function move(event){const start=drag.current;if(!ready||!dialog.current?.open||!start||start.id!==event.pointerId)return;command({azimuth:start.azimuth+(event.clientX-start.x)*.23,elevation:start.elevation-(event.clientY-start.y)*.18});}
  function end(event){if(drag.current?.id!==event.pointerId)return;drag.current=null;if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);}
  function key(event){if(!ready)return;const patch={ArrowLeft:{azimuth:inspection.target.azimuth-5},ArrowRight:{azimuth:inspection.target.azimuth+5},ArrowUp:{elevation:inspection.target.elevation+5},ArrowDown:{elevation:inspection.target.elevation-5},Home:INSPECTION_VIEWS.threeQuarter}[event.key];if(patch){event.preventDefault();command(patch);}}
  return <dialog ref={dialog} className={styles.dialog} aria-labelledby="model-study-title" onCancel={event=>{event.preventDefault();close();}} onClose={restore} data-model-dialog>
    <header className={styles.header}>
      <div><span className={styles.eyebrow}>BENDING-ACTIVE / MODEL STUDY</span><h2 id="model-study-title">Look closer.</h2></div>
      <button type="button" onClick={close} data-return-study>Return to story <span aria-hidden="true">↗</span></button>
    </header>
    <div ref={surface} className={styles.surface} role="group" aria-label="Rotate the model" aria-describedby="model-study-help" tabIndex={ready?0:-1} onPointerDown={begin} onPointerMove={move} onPointerUp={end} onPointerCancel={end} onLostPointerCapture={()=>{drag.current=null;}} onKeyDown={key} data-model-viewport>
      {!ready&&<div className={styles.fallback}><img src="/assets/cinematic/model-poster.webp" alt="The original metal-panel assembly in its exhibition setting"/><p role="status">{failed?'Interactive model unavailable. The source view remains below.':'Loading the source model…'}</p></div>}
      <p id="model-study-help" className={styles.gesture}>{ready?'Drag to rotate · Arrow keys also work':'Original source geometry'}<span>Use the controls to compare views and light.</span></p>
      <span className={styles.crosshair} aria-hidden="true">+</span>
    </div>
    <aside className={styles.controls} aria-label="Model study controls" data-protect>
      <fieldset disabled={!ready}>
        <legend>01 / View</legend>
        <div className={styles.choices}>{[['front','Front'],['threeQuarter','Three-quarter'],['high','High']].map(([id,label])=><button key={id} type="button" data-inspection-view={id} aria-pressed={id==='threeQuarter'} onClick={()=>command(INSPECTION_VIEWS[id])}>{label}</button>)}</div>
        {fields.slice(0,2).map(([id,label])=><label className={styles.range} key={id}><span>{label}<output data-inspection-output={id}/></span><input type="range" aria-label={label} min={INSPECTION_LIMITS[id][0]} max={INSPECTION_LIMITS[id][1]} step="1" defaultValue={inspection.target[id]} data-inspection-field={id} onInput={event=>command({[id]:Number(event.currentTarget.value)})}/></label>)}
      </fieldset>
      <fieldset disabled={!ready}>
        <legend>02 / Source layers</legend>
        <label className={styles.range}><span>Layer separation<output data-inspection-output="separation"/></span><input type="range" aria-label="Layer separation" min="0" max="1" step=".01" defaultValue="0" data-inspection-field="separation" onInput={event=>command({separation:Number(event.currentTarget.value)})}/></label>
        <div className={styles.endpoints}><button type="button" onClick={()=>command({separation:0})}>Original placement</button><button type="button" onClick={()=>command({separation:1})}>Separate layers</button></div>
        <p className={styles.note}>Shell and two source base layers. Display separation, not a construction sequence.</p>
      </fieldset>
      <fieldset disabled={!ready}>
        <legend>03 / Light</legend>
        <div className={styles.choices}>{Object.entries(presets).map(([id,[label]])=><button type="button" key={id} data-light-preset={id} aria-pressed={id==='studio'} onClick={()=>command({preset:id})}>{label}</button>)}</div>
        <p className={styles.note} data-light-description>{presets.studio[1]}</p>
        <label className={styles.range}><span>Light angle<output data-inspection-output="lightAzimuth"/></span><input type="range" aria-label="Light angle" min="-70" max="70" step="1" defaultValue="0" data-inspection-field="lightAzimuth" onInput={event=>command({lightAzimuth:Number(event.currentTarget.value)})}/></label>
      </fieldset>
      <div className={styles.footer}><button type="button" onClick={reset} disabled={!ready}>Reset study</button><label>Detail<select aria-label="Study visual detail" value={detail} onChange={event=>setDetail(event.target.value)}><option value="full">Full</option><option value="light">Light</option></select></label></div>
      <p className={styles.disclaimer}>Explore the supplied geometry. Lighting is a viewing aid; no structural simulation runs here.</p>
    </aside>
  </dialog>;
}
