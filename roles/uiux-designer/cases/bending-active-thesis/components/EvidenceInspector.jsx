'use client';
import {useEffect, useMemo, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {useExperienceInput} from '../runtime/ExperienceProvider';
import styles from './evidence-inspector.module.css';
import InformationSkin from './InformationSkin';

// Source comparison stays beside its figure in the document. Without JS the
// original link still opens the approved source image.
export default function EvidenceInspector({items}) {
  const input=useExperienceInput();
  const closeButton=useRef(null);
  const [selected,setSelected]=useState(null);
  const manager=useMemo(()=>input.features.create('evidence',{onChange:setSelected}),[input]);
  const close=manager.close;
  useEffect(()=>input.features.connect('evidence',()=>manager.connect(document,items)),[input,manager,items]);
  useEffect(()=>{if(selected!==null)input.invalidateLayout('evidence');},[selected,input]);
  if(selected===null)return null;
  const item=items[selected],host=document.querySelector(`[data-evidence-host="${selected}"]`);
  if(!host)return null;
  return createPortal(<section className={styles.inspector} aria-label={`Original source for ${item.figure}`} data-source-comparison data-information-window="source-portal" onKeyDown={event=>{if(event.key==='Escape'){event.preventDefault();close();}}}>
    <InformationSkin/>
    <header><span>{item.figure} / SOURCE PAGE</span><button type="button" ref={closeButton} onClick={close}>Close source comparison</button></header>
    <img src={item.source} alt={`Original source page for ${item.figure}`} loading="eager"/>
    <a href={item.source} target="_blank" rel="noreferrer">Open original source ↗</a>
  </section>,host);
}
