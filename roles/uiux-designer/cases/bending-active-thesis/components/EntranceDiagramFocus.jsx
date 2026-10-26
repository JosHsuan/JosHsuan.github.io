/* eslint-disable @next/next/no-img-element -- The complete pinned raster is documentary evidence, not a reconstructed vector. */
import InformationSkin from './InformationSkin';
import styles from './EntranceDiagramFocus.module.css';

/** Every numbered source region and its explanation is native scroll content.
 * The complete source plate remains untouched; no choice or hydration is needed. */
export default function EntranceDiagramFocus({guide,image,id}){
 return <figure className={styles.guide} data-entrance-diagram={id} data-information-window="source-diagram" data-information-motion-surface="plane" data-home-scroll-window="project-caption">
  <InformationSkin/>
  <figcaption><h3>{guide.title}</h3><p className={styles.note}>Read the numbered areas in sequence below the complete source plate. Outlines mark areas of attention, not new geometry. All source labels remain in the image.</p></figcaption>
  <div className={styles.plate}>
   <img src={image.src} width={image.width} height={image.height} alt={image.alt} loading="lazy" decoding="async" data-entrance-original/>
   <svg viewBox={`0 0 ${image.width} ${image.height}`} aria-hidden="true" focusable="false" className={styles.overlay}>
    {guide.steps.map((step,index)=><g key={step.label}><rect data-focus-region={index} x={step.bounds[0]} y={step.bounds[1]} width={step.bounds[2]} height={step.bounds[3]} vectorEffect="non-scaling-stroke"/><text x={step.bounds[0]+8} y={step.bounds[1]+22}>{String(index+1).padStart(2,'0')}</text></g>)}
   </svg>
  </div>
  <ol className={styles.descriptions}>
   {guide.steps.map((step,index)=><li key={step.label} data-focus-description={index}><h4><span>{String(index+1).padStart(2,'0')}</span> {step.label}</h4><p>{step.description}</p></li>)}
  </ol>
  <p className={styles.note}>{image.caption}</p><p className={styles.note}>{image.credit}</p>
 </figure>;
}
