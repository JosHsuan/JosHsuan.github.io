'use client';
import LiquidGlassSkin from './LiquidGlassSkin';
import cinematic from './cinematic.module.css';
import styles from './ProjectCaseStudy.module.css';

/** The site driver's scoped chapter presenter owns native controls and their
 * discrete publication. No second geometry observer, state or clock is mounted. */
export default function ProjectCaseStudyControls({projectId,chapterCount}){
 return <div hidden className={`${cinematic.readingTools} ${styles.readingTools}`} data-project-reading-tools={projectId} data-protect data-liquid-glass="reading-controls">
  <span data-project-chapter-count aria-live="polite">01 / {String(chapterCount).padStart(2,'0')}</span>
  <button type="button" data-study-motion-toggle aria-pressed="false">Pause motion</button>
  <LiquidGlassSkin id="reading-controls"/>
 </div>;
}
