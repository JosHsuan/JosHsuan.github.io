'use client';

import {memo, useEffect, useId, useMemo, useRef, useState} from 'react';
import {useExperienceInput} from '../runtime/ExperienceProvider';
import styles from './source-diagram.module.css';
import InformationSkin from './InformationSkin';

const TITLES = {library: 'Function library', miura: 'Miura fold anatomy', workflow: 'From geometry to fabrication'};
const HINTS = {library: 'Length traces unfold from 60 mm to 160 mm.', miura: 'Read the net, folds and form.', workflow: 'Read the complete workflow, then continue through its source stages.'};
const RATIOS = {library: '360 / 326', miura: '490 / 230', workflow: '560 / 524'};
const ASSETS = '/assets/diagrams/';

const NativeDrawing = memo(function NativeDrawing({data, prefix}) {
  const elements = [...data.paths, ...data.images, ...data.labels].sort((a, b) => a.order - b.order);
  // These source paths already begin at their lower endpoint. Length normalization
  // changes only reveal distance; the authored d, paint, axes and labels stay intact.
  const revealPaths = data.kind === 'library' ? new Map([...data.groups].reverse().flatMap((group,index)=>group.paths.map(path=>[path,index]))) : new Map();
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
      : <path key={item.id} {...item.attrs} pathLength={revealPaths.has(item.id)?1:undefined}
        data-library-trace={revealPaths.get(item.id)} data-source-path={item.id}/>)}
  </g>;
});

// These descriptions are transcribed from the pinned public diagram JSON.
// Keep them in native HTML even before hydration or when the drawing cannot load.
const READING_GROUPS = {
  miura: [
    {label:'Net',description:'The authored Miura diagram, with its source geometry and notation.'},
    {label:'Fold lines',description:'The authored Miura diagram, with its source geometry and notation.'},
    {label:'Folded form',description:'The authored Miura diagram, with its source geometry and notation.'},
  ],
  workflow: [
    {label:'Origami',description:'Representation model (Origami Pattern).'},
    {label:'Opening',description:'Input the Length Value of Opening.'},
    {label:'Bending',description:'Bend-Active Simulation Model (With Material Character).'},
    {label:'Source colours',description:'Curvature Analysis of Simulation Model; original authored colours.'},
  ],
};

/** Source hydration and scroll-led emphasis. The director owns the reveal. */
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
  return <figure ref={frame} className={`${styles.frame} ${className}`} data-source-diagram={validKind} data-information-window="source-diagram" data-information-motion-surface="plane"
    data-diagram-count={available?.groups.length ?? (validKind === 'library' ? 11 : validKind === 'miura' ? 3 : 4)}>
    <InformationSkin/>
    <figcaption className={styles.heading} data-protect data-choreography="caption">
      <span className={styles.eyebrow}>Research study</span>
      <h3 id={`${id}-title`}>{heading}</h3>
      <p>{HINTS[validKind]}</p>
    </figcaption>
    <div className={styles.hitRegion} style={{aspectRatio: RATIOS[validKind]}} data-library-drawing={validKind==='library'?'':undefined}>
      <div className={styles.panel} data-choreography="diagram" data-protect>
        {available ? <svg className={styles.vector} viewBox={available.viewBox.join(' ')} role="img" aria-labelledby={`${id}-title ${id}-description`}>
          <desc id={`${id}-description`}>{validKind==='library'?'Original authored function library. Eleven length traces reveal sequentially from 60 mm to 160 mm, each from its bottom endpoint. All source axes and labels remain visible.':'Original authored diagram. All source traces and stages remain visible; their descriptions follow in reading order.'}</desc>
          <NativeDrawing data={available} prefix={id}/>
          {validKind!=='library'&&available.groups.map((group, index) => <g key={group.id} id={`${id}-${group.id}`} className={styles.highlight}
            data-diagram-index={index} data-diagram-active="false" aria-hidden="true">
            {group.paths.length ? group.paths.map(pathId => <path key={pathId} className={styles.trace} d={paths.get(pathId)?.attrs.d}/>)
              : <rect className={styles.node} x={group.bounds[0]} y={group.bounds[1]} width={group.bounds[2]-group.bounds[0]} height={group.bounds[3]-group.bounds[1]} rx="12"/>}
          </g>)}
        </svg> : <img className={styles.fallback} src={`${ASSETS}${validKind}.svg`} alt={`${heading}: original authored diagram`} loading="lazy"/>}
      </div>
    </div>
    {validKind==='library'&&<p className={styles.caption} data-protect>Eleven original length traces. The sequence reveals the authored drawing; it does not calculate a new structural prediction.</p>}
    {validKind!=='library' && <ol className={styles.readingSequence} aria-label={`${heading} source stages`}>
      {READING_GROUPS[validKind].map((group,index)=><li key={group.label} data-diagram-index={index} data-diagram-active="false"><h4>{group.label}</h4><p>{group.description}</p></li>)}
    </ol>}
  </figure>;
}
