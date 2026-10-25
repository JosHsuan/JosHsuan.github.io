/* Both native documents retain the same pinned original responsive posters. */
import styles from './research-entry-composition.module.css';

/** Presentation only: no handoff state, readiness, image capture or clock. */
export default function ResearchEntryComposition({children,outgoing=false}){
 return <div className={styles.frame} data-research-entry-composition="bending-active">
  <div className={styles.backdrop} aria-hidden="true" data-research-entry-backdrop>
   <picture>
    <source media="(max-width:780px)" srcSet="/assets/cinematic/model-poster-mobile.webp"/>
    <img src="/assets/cinematic/model-poster.webp" width="1440" height="1000" alt="" decoding="async" data-site-research-handoff={outgoing?'':undefined}/>
   </picture>
  </div>
  {children}
 </div>;
}
