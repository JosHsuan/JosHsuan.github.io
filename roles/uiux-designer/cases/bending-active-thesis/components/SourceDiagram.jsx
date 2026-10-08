'use client';

import {memo, useEffect, useId, useRef, useState} from 'react';
import styles from './source-diagram.module.css';

const TITLES = {library: 'Function library', miura: 'Miura fold anatomy', workflow: 'From geometry to fabrication'};
const HINTS = {library: 'Follow a length trace.', miura: 'Read the net, folds and form.', workflow: 'Follow the source. Select a stage to compare its model.'};
const RATIOS = {library: '360 / 326', miura: '490 / 230', workflow: '560 / 524'};
const ASSETS = '/assets/diagrams/';

const NativeDrawing = memo(function NativeDrawing({data, prefix}) {
  const elements = [...data.paths, ...data.images, ...data.labels].sort((a, b) => a.order - b.order);
  return <g className={styles.original}>
    {elements.map((item, index) => item.type === 'image'
      ? <g key={`image-${index}`}>
        {item.clip && <defs><clipPath id={`${prefix}-clip-${index}`}><path d={item.clip}/></clipPath></defs>}
        <g clipPath={item.clip ? `url(#${prefix}-clip-${index})` : undefined}>
          <image href={`${ASSETS}${item.file}`} opacity={item.opacity} width="1" height="1" preserveAspectRatio="none" transform={`matrix(${item.matrix.join(' ')})`}/>
        </g>
      </g>
      : item.type === 'text' ? <text key={`label-${index}`} x={item.x} y={item.y} fill={item.fill} opacity={item.opacity}
        fontSize={item.size} textLength={item.width} lengthAdjust="spacingAndGlyphs"
        transform={`rotate(${item.rotation} ${item.x} ${item.y})`}>{item.text}</text>
      : <path key={item.id} {...item.attrs}/>)}
  </g>;
});

/** Discrete source selection only. The shared chapter controller owns time. */
export default function SourceDiagram({kind = 'library', title, className = ''}) {
  const validKind = Object.hasOwn(TITLES, kind) ? kind : 'library';
  const frame = useRef(null), pinned = useRef(null), hover = useRef(null), dataRef = useRef(null), presented = useRef(0);
  const [data, setData] = useState(null);
  const id = useId().replaceAll(':', '');
  const heading = title || TITLES[validKind];

  function paint(index, announce = false) {
    const root = frame.current, source = dataRef.current;
    if (!root || !source?.groups.length) return;
    const selected = ((Number(index) || 0) % source.groups.length + source.groups.length) % source.groups.length;
    root.dataset.diagramSelection = source.groups[selected].id;
    root.querySelectorAll('[data-diagram-index]').forEach(element => {
      const active = Number(element.dataset.diagramIndex) === selected;
      element.dataset.diagramActive = String(active);
      if (element.tagName === 'BUTTON') element.setAttribute('aria-pressed', String(active));
    });
    const caption = root.querySelector('[data-diagram-caption]');
    if (caption) caption.textContent = source.groups[selected].description;
    if (announce) {
      const live = root.querySelector('[data-diagram-announcement]');
      if (live) live.textContent = `${source.groups[selected].label}. ${source.groups[selected].description}`;
    }
  }

  function restore() {
    const root = frame.current;
    paint(pinned.current ?? hover.current ?? (validKind === 'workflow' ? presented.current : Number(root?.dataset.autonomousIndex ?? 0)));
  }

  function activate(index) {
    pinned.current = index;
    paint(index, true);
    const group = dataRef.current?.groups[index];
    if (validKind === 'workflow' && Number.isInteger(group?.representation)) {
      window.dispatchEvent(new CustomEvent('thesis:representation', {detail: {chapterId: 'system', index: group.representation}}));
    }
  }

  useEffect(() => {
    const abort = new AbortController();
    fetch(`${ASSETS}${validKind}.json`, {signal: abort.signal})
      .then(response => {if (!response.ok) throw new Error('Diagram unavailable'); return response.json();})
      .then(source => {
        if (source.version !== 1 || source.kind !== validKind || !Array.isArray(source.groups) || !Array.isArray(source.paths)) throw new Error('Invalid diagram');
        dataRef.current = source;
        pinned.current = null;
        hover.current = null;
        setData(source);
      })
      .catch(() => {/* The complete static source SVG remains available. */});
    return () => abort.abort();
  }, [validKind]);

  useEffect(() => {
    if (!data || !frame.current) return;
    const root = frame.current;
    const update = () => {
      if (pinned.current !== null || hover.current !== null) return;
      paint(validKind === 'workflow' ? presented.current : Number(root.dataset.autonomousIndex ?? 0));
    };
    update();
    const observer = new MutationObserver(update);
    observer.observe(root, {attributes: true, attributeFilter: ['data-autonomous-index']});
    const followPresentation = event => {
      if (validKind !== 'workflow' || event.detail?.chapterId !== 'system') return;
      const index = data.groups.findIndex(group => group.representation === event.detail.index);
      if (index < 0) return;
      presented.current = index;
      if (event.detail.pinned === false) {pinned.current = null; hover.current = null;}
      // Actual displayed source has priority; no representation request is sent.
      paint(index);
    };
    window.addEventListener('thesis:representation-presented', followPresentation);
    // Source loading changes no outer geometry, but a new core may need measuring.
    window.dispatchEvent(new Event('resize'));
    return () => {observer.disconnect(); window.removeEventListener('thesis:representation-presented', followPresentation);};
  }, [data, validKind]);

  const available = data?.kind === validKind ? data : null;
  const paths = available ? new Map(available.paths.map(path => [path.id, path])) : null;
  return <figure ref={frame} className={`${styles.frame} ${className}`} data-source-diagram={validKind}
    data-diagram-count={available?.groups.length ?? (validKind === 'library' ? 11 : validKind === 'miura' ? 3 : 4)}
    onKeyDown={event => {if (event.key === 'Escape') {pinned.current = null; hover.current = null; restore();}}}
    onBlur={event => {if (!event.currentTarget.contains(event.relatedTarget)) {hover.current = null; restore();}}}>
    <figcaption className={styles.heading} data-protect>
      <span className={styles.eyebrow} data-choreography="caption">Source study</span>
      <h3 id={`${id}-title`} data-choreography="heading">{heading}</h3>
      <p data-choreography="prose">{HINTS[validKind]}</p>
    </figcaption>
    <div className={styles.hitRegion} style={{aspectRatio: RATIOS[validKind]}}>
      <div className={styles.panel} data-choreography="diagram" data-protect>
        {available ? <svg className={styles.vector} viewBox={available.viewBox.join(' ')} role="img" aria-labelledby={`${id}-title ${id}-description`}>
          <desc id={`${id}-description`}>Original authored diagram. The controls below highlight its source traces and stages.</desc>
          <NativeDrawing data={available} prefix={id}/>
          {available.groups.map((group, index) => <g key={group.id} id={`${id}-${group.id}`} className={styles.highlight}
            data-diagram-index={index} data-diagram-active="false" aria-hidden="true"
            onPointerEnter={event => {if (validKind !== 'workflow' && event.pointerType !== 'touch') {hover.current = index; paint(index);}}}
            onPointerLeave={() => {hover.current = null; restore();}}
            onClick={() => activate(index)}>
            {group.paths.length ? group.paths.map(pathId => <path key={pathId} className={styles.trace} d={paths.get(pathId)?.attrs.d}/>)
              : <rect className={styles.node} x={group.bounds[0]} y={group.bounds[1]} width={group.bounds[2]-group.bounds[0]} height={group.bounds[3]-group.bounds[1]} rx="12"/>}
            {validKind === 'library' ? <path className={styles.curveHit} d={paths.get(group.paths[0])?.attrs.d}/>
              : <rect className={styles.regionHit} x={group.bounds[0]} y={group.bounds[1]} width={group.bounds[2]-group.bounds[0]} height={group.bounds[3]-group.bounds[1]}/>} 
          </g>)}
        </svg> : <img className={styles.fallback} src={`${ASSETS}${validKind}.svg`} alt={`${heading}: original authored diagram`} loading="lazy"/>}
      </div>
    </div>
    {available && <div className={styles.controls} data-protect>
      <div className={styles.choices} role="group" aria-label={`Select ${heading.toLowerCase()}`}>
        {available.groups.map((group, index) => <button type="button" key={group.id} data-diagram-index={index} data-diagram-active="false"
          aria-controls={`${id}-${group.id}`} aria-pressed="false"
          onFocus={() => {if (validKind !== 'workflow') {hover.current = index; paint(index);}}} onClick={() => activate(index)}><span data-choreography="nav">{group.label}</span></button>)}
        <button type="button" className={styles.follow} onClick={() => {pinned.current = null; hover.current = null; restore();}}><span data-choreography="nav">Follow chapter</span></button>
      </div>
      <p className={styles.caption} data-choreography="prose">
        <span data-diagram-caption>{available.groups[0].description}</span>
        {/* Every real variant contributes its wrapped height without duplicate speech. */}
        {available.groups.map(group => <span key={group.id} className={styles.captionSizer} aria-hidden="true">{group.description}</span>)}
      </p>
      <span className={styles.live} role="status" aria-live="polite" data-diagram-announcement/>
    </div>}
  </figure>;
}
