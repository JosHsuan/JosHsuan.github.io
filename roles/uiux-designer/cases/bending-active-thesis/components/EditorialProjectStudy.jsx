/* eslint-disable @next/next/no-img-element -- Complete documentary sources preserve their original dimensions and captions. */
import ProjectStudyChrome,{StudyLabel} from './ProjectStudyChrome';
import ProjectCaseStudyControls from './ProjectCaseStudyControls';
import InformationSkin from './InformationSkin';
import {editorialProjectLayout} from './project-editorial-layout.mjs';
import styles from './EditorialProjectStudy.module.css';

export function ReadingRail({children}){
 return <div className={styles.rail} data-information-window="editorial" data-information-motion-surface="plane" data-home-scroll-window="project-narrative"><InformationSkin/>{children}</div>;
}
export function SourceReference({image}){
 return <div className={styles.reference} data-editorial-source-reference={image.src}><p>{image.caption}</p><span>{image.credit}</span></div>;
}
export function SourceFigure({image,evidence=false,eager=false}){
 const technical=image.purpose==='diagram';
 return <figure className={technical?styles.evidence:styles.scene} data-editorial-source={image.src} data-study-evidence-layout={evidence?'full':undefined} data-study-evidence-role={evidence?(technical?'technical-plate':'photograph'):undefined}>
  <div className={styles.imageLink}>
   <img data-editorial-image data-project-evidence-image={evidence?'':undefined} src={image.src} width={image.width} height={image.height} alt={image.alt} loading={eager?'eager':'lazy'} decoding="async" data-site-critical={eager?'':undefined} style={{aspectRatio:`${image.width} / ${image.height}`}}/>
  </div>
  <span className={styles.imageFailure} role="status">Image unavailable. The source caption and project text remain available.</span>
  <figcaption data-information-window="evidence-caption" data-information-motion-surface="plane" data-home-scroll-window="project-caption"><InformationSkin/><p>{image.caption}</p><span>{image.credit}</span></figcaption>
 </figure>;
}
/** Native still-source roles for hybrid cases; model/video ownership stays with the caller. */
export function NativeStudyOpening({project}){
 const prefix=project.id;
 return <header id={`${prefix}-overview`} tabIndex={-1} className={`${styles.nativeSurface} ${styles.nativeOpening}`} data-project-chapter="overview" data-project-native-source="overview" data-study-composition="native-still">
  <div className={styles.chapterHeading}><a className={styles.sourceAction} href="/projects/">← All projects</a><StudyLabel opening>{project.yearLabel} / {project.category}</StudyLabel><h1 id={`${prefix}-overview-heading`} tabIndex={-1}>{project.title}</h1></div>
  <div className={styles.nativeOpeningRow}>
   <div className={styles.sourceColumn}><SourceFigure image={project.hero} eager/></div>
   <ReadingRail>{project.subtitle&&<p>{project.subtitle}</p>}<p>{project.summary}</p><dl className={styles.metadata}><div><dt>Context</dt><dd>{project.context}</dd></div><div><dt>Role</dt><dd>{project.role}</dd></div></dl><p className={styles.scrollCue}>Scroll to follow the study <span aria-hidden="true">↓</span></p></ReadingRail>
  </div>
 </header>;
}
export function NativeStudyChapter({project,section,index,scene,evidence=[]}){
 const prefix=project.id;
 return <section id={`${prefix}-${section.id}`} tabIndex={-1} className={styles.nativeSurface} data-project-chapter={section.id} data-project-native-source={section.id} data-study-composition="native-still" aria-labelledby={`${prefix}-${section.id}-heading`}>
  <div className={styles.chapterHeading}><StudyLabel kind={section.kind}>{String(index+1).padStart(2,'0')} / {section.label}</StudyLabel><h2 id={`${prefix}-${section.id}-heading`} tabIndex={-1}>{section.title}</h2></div>
  <div className={styles.nativeSceneRow}>
   <div className={styles.sourceColumn}><SourceFigure image={scene}/></div>
   <ReadingRail>{section.paragraphs.map(paragraph=><p key={paragraph}>{paragraph}</p>)}</ReadingRail>
  </div>
  {evidence.length>0&&<div className={styles.evidenceSequence}>{evidence.map(image=><SourceFigure key={image.src} image={image} evidence/>)}</div>}
 </section>;
}
/** Native chapter-owned sources: no fixed backdrop registration or additional clock. */
export default function EditorialProjectStudy({project,layout}){
 const scenes=layout??editorialProjectLayout(project),prefix=project.id;
 const chapters=[{id:'overview',label:'Overview'},...project.sections.map(({id,label})=>({id,label})),{id:'credits',label:'Credits'}];
 return <>
  <ProjectStudyChrome chapters={chapters} prefix={prefix} navigationLabel={`${project.shortTitle} project sections`} railClassName={styles.chapterRail}/>
  <ProjectCaseStudyControls projectId={prefix} chapterCount={chapters.length}/>
  <main id="portfolio-main" tabIndex={-1} className={styles.page} data-project-study={prefix} data-study-presentation="editorial-scenes" data-information-motion-profile="velocity-skin" data-portfolio-root data-portfolio-section="project-study">
   <article aria-labelledby={`${prefix}-overview-heading`}>
    <header id={`${prefix}-overview`} tabIndex={-1} className={styles.opening} data-project-chapter="overview">
     <a className={styles.sourceAction} href="/projects/">← All projects</a>
     <StudyLabel opening>{project.yearLabel} / {project.category}</StudyLabel>
     <h1 id={`${prefix}-overview-heading`} tabIndex={-1}>{project.title}</h1>
     <p>{project.subtitle}</p><p>{project.summary}</p>
     <p className={styles.scrollCue}>Scroll to follow the study <span aria-hidden="true">↓</span></p>
    </header>
    {scenes.map(({section,scene,composition,evidence,references},index)=><section key={section.id} id={`${prefix}-${section.id}`} tabIndex={-1} className={styles.chapter} data-project-chapter={section.id} data-editorial-composition={composition} aria-labelledby={`${prefix}-${section.id}-heading`}>
     <div className={styles.chapterHeading}><StudyLabel kind={section.kind}>{String(index+1).padStart(2,'0')} / {section.label}</StudyLabel><h2 id={`${prefix}-${section.id}-heading`} tabIndex={-1}>{section.title}</h2></div>
     <div className={styles.sceneRow}>
      <div className={styles.sourceColumn}><SourceFigure image={scene} eager={index===0} evidence={section.media.indexOf(scene)>0}/></div>
      <ReadingRail>{section.id==='context'&&<dl className={styles.metadata}><div><dt>Context</dt><dd>{project.context}</dd></div><div><dt>Role</dt><dd>{project.role}</dd></div></dl>}{section.paragraphs.map(paragraph=><p key={paragraph}>{paragraph}</p>)}{references.map(image=><SourceReference key={image.src} image={image}/>)}</ReadingRail>
     </div>
     {evidence.length>0&&<div className={styles.evidenceSequence}>{evidence.map(image=><SourceFigure key={image.src} image={image} evidence/>)}</div>}
    </section>)}
    <footer id={`${prefix}-credits`} tabIndex={-1} className={styles.credits} data-project-chapter="credits" aria-labelledby={`${prefix}-credits-heading`}>
     <ReadingRail><StudyLabel kind="make">{String(chapters.length-1).padStart(2,'0')} / CREDITS</StudyLabel><h2 id={`${prefix}-credits-heading`} tabIndex={-1}>Project credits.</h2><dl>{project.credits.map(credit=><div key={credit.role}><dt>{credit.role}</dt><dd>{credit.names}</dd></div>)}</dl><p>{project.sourceNote}</p><a className={styles.related} href={project.related.href}><span>RELATED STUDY</span><strong>{project.related.title}</strong><span aria-hidden="true">↗</span></a></ReadingRail>
    </footer>
   </article>
  </main>
 </>;
}
