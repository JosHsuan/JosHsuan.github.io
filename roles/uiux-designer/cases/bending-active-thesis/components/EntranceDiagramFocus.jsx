/* eslint-disable @next/next/no-img-element -- The complete pinned raster is documentary evidence, not a reconstructed vector. */
import InformationSkin from './InformationSkin';
import styles from './EntranceDiagramFocus.module.css';

/** Native radio choices remain usable without hydration. Finite CSS emphasis
 * adds no observer, state loop or competing Director clock. */
export default function EntranceDiagramFocus({guide,image,id}){
 return <figure className={styles.guide} data-entrance-diagram={id} data-information-window="source-diagram" data-information-motion-surface="plane" data-home-scroll-window="project-caption">
  <InformationSkin/>
  <figcaption><h3>{guide.title}</h3><p className={styles.note}>Reading guide over the original raster plate. Outlines mark areas of attention, not new geometry. All source labels remain in the complete image.</p></figcaption>
  <fieldset className={styles.choices}>
   <legend>Choose an area to follow</legend>
   <label><input type="radio" name={id} value="all" defaultChecked/><span>Complete plate</span></label>
   {guide.steps.map((step,index)=><label key={step.label}><input type="radio" name={id} value={String(index)}/><span>{step.label}</span></label>)}
  </fieldset>
  <div className={styles.plate}>
   <img src={image.src} width={image.width} height={image.height} alt={image.alt} loading="lazy" decoding="async" data-entrance-original/>
   <svg viewBox={`0 0 ${image.width} ${image.height}`} aria-hidden="true" focusable="false" className={styles.overlay}>
    {guide.steps.map((step,index)=><rect key={step.label} data-focus-region={index} x={step.bounds[0]} y={step.bounds[1]} width={step.bounds[2]} height={step.bounds[3]} pathLength="1" vectorEffect="non-scaling-stroke"/>)}
   </svg>
  </div>
  <div className={styles.descriptions}>
   <p data-focus-description="all">Select the numbered areas in order, or return to the complete plate at any time. The original image is never cropped or obscured.</p>
   {guide.steps.map((step,index)=><p key={step.label} data-focus-description={index}>{step.description}</p>)}
  </div>
  <p className={styles.note}>{image.caption}</p><p className={styles.note}>{image.credit}</p>
  <a className={styles.source} href={image.src} target="_blank" rel="noreferrer">Open complete source image <span aria-hidden="true">↗</span></a>
 </figure>;
}
