/* eslint-disable @next/next/no-html-link-for-pages -- Native document links preserve site-entry handoff and resource lifetime boundaries. */
import LiquidGlassSkin from './LiquidGlassSkin';
import styles from '../app/page.module.css';
import xr from './XRProject.module.css';

/** The case-study chrome uses Bending's maintained layout/material classes.
 * Native anchors and their accessible labels remain independent of WebGL. */
export function StudyGlyph({kind='form'}){
 return <span className={styles.glyph} data-glyph-kind={kind} aria-hidden="true"><svg viewBox="0 0 40 40" fill="none">
  {kind==='form'&&<><path d="M5 28 13 8l13 3 9 19-18 4Z"/><path d="m5 28 21-17M13 8l4 26m0 0 18-4"/></>}
  {kind==='system'&&<><path d="m9 9 22 4-3 19L9 25Z"/><path d="m9 9 19 23M9 25l22-12"/><circle cx="9" cy="9" r="3"/><circle cx="31" cy="13" r="3"/><circle cx="28" cy="32" r="3"/><circle cx="9" cy="25" r="3"/></>}
  {kind==='make'&&<><path d="m5 14 15-7 15 7-15 7Zm0 7 15 7 15-7M5 28l15 7 15-7"/><path d="M20 21v14"/></>}
 </svg></span>;
}

export function StudyLabel({children,kind='form',opening=false}){
 return <div className={opening?styles.openingLabel:styles.chapterLabel} data-project-section-label><StudyGlyph kind={kind}/><span>{children}</span></div>;
}

export default function ProjectStudyChrome({chapters,mainId='portfolio-main',prefix='xr',navigationLabel='XR project sections',railClassName=''}){
 const isXR=prefix==='xr';
 return <>
  <a href={`#${mainId}`} className={styles.skip}>Skip to content</a>
  <header className={styles.masthead} data-protect data-page-masthead data-portfolio-masthead>
   <a href="/#about" className={styles.owner} data-home-link data-liquid-glass="identity" aria-label="JosHsuan Chao — Home">JosHsuan Chao<span aria-hidden="true"> / </span><span className={styles.discipline}>DESIGN + TECHNOLOGY</span><LiquidGlassSkin id="identity"/></a>
   <nav className={styles.siteLinks} aria-label="Portfolio" data-portfolio-navigation><a href="/about/">About</a><a href="/projects/">Project</a><a href="/contact/">Contact</a></nav>
  </header>
  <nav className={`${styles.chapterRail} ${isXR?xr.chapterRail:railClassName}`} aria-label={navigationLabel} data-protect data-xr-chapter-navigation={isXR?true:undefined} data-project-chapter-navigation={isXR?undefined:prefix} data-liquid-glass="chapter-navigation" style={isXR?undefined:{'--study-chapter-count':chapters.length}}>
   {chapters.map((item,index)=><a key={item.id} href={`#${prefix}-${item.id}`} aria-label={`${String(index+1).padStart(2,'0')} / ${item.label}`} data-xr-chapter-link={isXR?item.id:undefined} data-project-chapter-link={isXR?undefined:item.id}><span>{String(index+1).padStart(2,'0')}</span><span className={styles.railLabel}>{item.label}</span></a>)}
   <LiquidGlassSkin id="chapter-navigation"/>
  </nav>
 </>;
}
