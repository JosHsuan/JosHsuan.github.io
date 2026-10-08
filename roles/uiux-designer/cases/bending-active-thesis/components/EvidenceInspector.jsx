'use client';
import {useEffect, useRef, useState} from 'react';
import styles from './evidence-inspector.module.css';

// The ordinary source links work first. This optional layer keeps inspection in
// the reading context, with the original source always one native link away.
export default function EvidenceInspector({items}) {
  const dialog = useRef(null), trigger = useRef(null);
  const [selected, setSelected] = useState(null), [source, setSource] = useState(false);
  const close = () => {dialog.current?.close(); setSelected(null); trigger.current?.focus({preventScroll:true});};
  useEffect(() => {
    const inspect = event => {
      const link = event.target.closest?.('a[data-inspect-figure]');
      if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const index = Number(link.dataset.inspectFigure);
      if (!Number.isInteger(index) || !items[index]) return;
      event.preventDefault(); trigger.current = link; setSource(false); setSelected(index);
    };
    document.addEventListener('click', inspect);
    return () => document.removeEventListener('click', inspect);
  }, [items]);
  useEffect(() => {
    if (selected === null) return;
    if (!dialog.current.open) dialog.current.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {document.body.style.overflow = previous;};
  }, [selected]);
  const item = items[selected ?? 0];
  const change = offset => {setSelected(index => (index + offset + items.length) % items.length); setSource(false);};
  return <dialog ref={dialog} className={styles.inspector} aria-labelledby="evidence-title" onCancel={event => {event.preventDefault(); close();}} onClick={event => {if(event.target !== dialog.current) return; const r=dialog.current.getBoundingClientRect(); if(event.clientX<r.left || event.clientX>r.right || event.clientY<r.top || event.clientY>r.bottom) close();}}>
    <div className={styles.shell}>
      <header className={styles.header}><div><span className={styles.eyebrow}>Research evidence / {String((selected ?? 0)+1).padStart(2,'0')}</span><h2 id="evidence-title">{item.figure}</h2></div><button type="button" onClick={close} autoFocus aria-label="Close evidence inspector">Close <span aria-hidden="true">×</span></button></header>
      <div className={styles.image}><img src={source ? item.source : item.src} alt={source ? `Original source page for ${item.figure}` : item.alt} /></div>
      <div className={styles.caption}><p>{item.caption}</p><a href={item.source} target="_blank" rel="noreferrer">Open original source <span aria-hidden="true">↗</span></a></div>
      <footer className={styles.tools}><button type="button" onClick={() => change(-1)} aria-label="Previous evidence">← Previous</button><button type="button" aria-pressed={source} onClick={() => setSource(value => !value)}>{source ? 'Show cropped figure' : 'Show source page'}</button><button type="button" onClick={() => change(1)} aria-label="Next evidence">Next →</button></footer>
    </div>
  </dialog>;
}
