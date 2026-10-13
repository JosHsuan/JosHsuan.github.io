'use client';

import {memo, useEffect, useId, useMemo, useRef, useState} from 'react';
import {useExperienceInput} from '../runtime/ExperienceProvider';
import styles from './source-diagram.module.css';
import InformationSkin from './InformationSkin';

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
  const input=useExperienceInput();
  const validKind = Object.hasOwn(TITLES, kind) ? kind : 'library';
  const frame = useRef(null);
  const [data, setData] = useState(null);
  const id = useId().replaceAll(':', '');
  const heading = title || TITLES[validKind];

  const manager=useMemo(()=>input.features.create('diagram',{kind:validKind,getRoot:()=>frame.current,onData:setData,
    requestLayout:()=>input.invalidateLayout('diagram-'+validKind)}),[validKind,input]);
  useEffect(()=>input.features.connect('diagram.load.'+validKind,()=>{
    const abort=new AbortController();void manager.load({signal:abort.signal});
    return()=>{abort.abort();manager.cancelLoad();};
  }),[input,validKind,manager]);
  useEffect(()=>input.features.connect('diagram.'+validKind,()=>manager.connect()),[input,manager,validKind,data]);

  const available = data?.kind === validKind ? data : null;
  const paths = available ? new Map(available.paths.map(path => [path.id, path])) : null;
  return <figure ref={frame} className={`${styles.frame} ${className}`} data-source-diagram={validKind} data-information-window="source-diagram"
    data-diagram-count={available?.groups.length ?? (validKind === 'library' ? 11 : validKind === 'miura' ? 3 : 4)}
    onKeyDown={manager.key}
    onBlur={manager.blur}>
    <InformationSkin/>
    <figcaption className={styles.heading} data-protect data-choreography="caption">
      <span className={styles.eyebrow}>Source study</span>
      <h3 id={`${id}-title`}>{heading}</h3>
      <p>{HINTS[validKind]}</p>
    </figcaption>
    <div className={styles.hitRegion} style={{aspectRatio: RATIOS[validKind]}}>
      <div className={styles.panel} data-choreography="diagram" data-protect>
        {available ? <svg className={styles.vector} viewBox={available.viewBox.join(' ')} role="img" aria-labelledby={`${id}-title ${id}-description`}>
          <desc id={`${id}-description`}>Original authored diagram. The controls below highlight its source traces and stages.</desc>
          <NativeDrawing data={available} prefix={id}/>
          {available.groups.map((group, index) => <g key={group.id} id={`${id}-${group.id}`} className={styles.highlight}
            data-diagram-index={index} data-diagram-active="false" aria-hidden="true"
            onPointerEnter={event => {if (validKind !== 'workflow' && event.pointerType !== 'touch') {manager.hover(index);}}}
            onPointerLeave={() => {manager.leave();}}
            onClick={() => manager.activate(index)}>
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
          onFocus={() => {if (validKind !== 'workflow') {manager.hover(index);}}} onClick={() => manager.activate(index)}><span data-choreography="nav">{group.label}</span></button>)}
        <button type="button" className={styles.follow} onClick={() => {manager.follow();}}><span data-choreography="nav">Follow chapter</span></button>
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
