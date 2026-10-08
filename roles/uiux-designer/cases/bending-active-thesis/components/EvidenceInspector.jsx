'use client';
import {useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import styles from './evidence-inspector.module.css';

// Source comparison stays beside its figure in the document. Without JS the
// original link still opens the approved source image.
export default function EvidenceInspector({items}) {
  const trigger=useRef(null), closeButton=useRef(null);
  const [selected,setSelected]=useState(null);
  const close=()=>{const previous=trigger.current;setSelected(null);previous?.setAttribute('aria-expanded','false');previous?.focus();};
  useEffect(()=>{
    const inspect=event=>{
      const link=event.target.closest?.('a[data-inspect-figure]');
      if(!link||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
      const index=Number(link.dataset.inspectFigure);if(!Number.isInteger(index)||!items[index])return;
      event.preventDefault();trigger.current?.setAttribute('aria-expanded','false');trigger.current=link;
      if(selected===index){setSelected(null);return;}
      link.setAttribute('aria-expanded','true');setSelected(index);
    };
    document.addEventListener('click',inspect);return()=>document.removeEventListener('click',inspect);
  },[items,selected]);
  useEffect(()=>{if(selected!==null){window.dispatchEvent(new Event('resize')); }},[selected]);
  if(selected===null)return null;
  const item=items[selected],host=document.querySelector(`[data-evidence-host="${selected}"]`);
  if(!host)return null;
  return createPortal(<section className={styles.inspector} aria-label={`Original source for ${item.figure}`} data-source-comparison onKeyDown={event=>{if(event.key==='Escape'){event.preventDefault();close();}}}>
    <header><span>{item.figure} / SOURCE PAGE</span><button type="button" ref={closeButton} onClick={close}>Close source comparison</button></header>
    <img src={item.source} alt={`Original source page for ${item.figure}`} loading="eager"/>
    <a href={item.source} target="_blank" rel="noreferrer">Open original source ↗</a>
  </section>,host);
}
