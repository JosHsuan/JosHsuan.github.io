/* eslint-disable @next/next/no-img-element -- Documentary images retain pinned native sources, dimensions and accessible captions. */
import ProjectStudyChrome,{StudyLabel} from './ProjectStudyChrome';
import ProjectCaseStudyControls from './ProjectCaseStudyControls';
import ProjectCaseStudyStage from './ProjectCaseStudyStage';
import InformationSkin from './InformationSkin';
import EntranceDiagramFocus from './EntranceDiagramFocus';
import {projectStudyEvidence} from './project-study-media.mjs';
import {projectStudyLayout,projectStudyEvidenceLayout} from './project-study-layout.mjs';
import styles from './ProjectCaseStudy.module.css';

function Panel({children,opening=false}){
 return <div className={`${styles.panel} ${opening?styles.openingPanel:''}`} data-information-window="editorial" data-information-motion-surface="plane" data-home-scroll-window="project-narrative"><InformationSkin/>{children}</div>;
}
function SourceLink({image}){
 return <a className={styles.sourceLink} href={image.src} target="_blank" rel="noreferrer" aria-label={`View full image (new tab): ${image.alt}`}>View full image <span aria-hidden="true">↗</span></a>;
}
function layoutAttributes(layout){
 return{'data-study-composition':layout.composition,'data-study-layout':layout.layout,'data-study-source-shape':layout.sourceShape,'data-study-source-role':layout.sourceRole,'data-study-reading-density':layout.readingDensity};
}
function PrimaryVisual({image,chapter,prefix,opening=false,model,motion}){
 const inspect=model?.chapters.includes(chapter),poster=motion?.poster??image,source=motion??image;
 return <div className={styles.visualSlot}>
  <div className={styles.sourceAperture} data-project-source-aperture>
  <figure className={styles.primaryFigure} data-project-media={chapter} aria-describedby={`${prefix}-${chapter}-caption ${prefix}-${chapter}-credit`}>
   <div className={styles.mediaFrame} data-project-media-frame>
    <picture><img data-project-media-poster src={poster.src} width={poster.width} height={poster.height} alt={source.alt} loading={opening?'eager':'lazy'} decoding="async" fetchPriority={opening?'high':undefined} data-site-critical={opening?'':undefined}/></picture>
    {motion&&<video className={styles.motionMedia} data-project-motion-media data-project-motion-id={motion.id} data-project-video-src={motion.src} width={motion.width} height={motion.height} muted playsInline preload="none" loop={motion.loop} aria-label={motion.alt} aria-describedby={`${prefix}-${chapter}-caption ${prefix}-${chapter}-credit`}/>}
    <span className={styles.imageFailure} role="status">Image unavailable. The source caption and project text remain available.</span>
   </div>
  </figure>
  {inspect&&<div className={styles.modelTarget} data-project-model-control data-project-model-target={chapter} tabIndex={0} role="group" aria-label={`${model.alt} When 3D is available, scroll to follow the camera. With keyboard focus, use arrow keys to inspect. Home or Escape returns to the current scroll view.`} aria-describedby={`${prefix}-${chapter}-model-state ${prefix}-${chapter}-model-help`}/>}
  </div>
  <div className={styles.sourcePanel} data-project-source-caption={chapter} data-information-window="evidence-caption" data-information-motion-surface="plane" data-home-scroll-window="project-caption">
   <InformationSkin/>
   {inspect&&<>
    <p className={styles.modelState} id={`${prefix}-${chapter}-model-state`} data-project-model-state={chapter} role="status">Original source view.</p>
    <p className={styles.modelDescription} data-project-model-description>{model.alt}</p>
    <p className={styles.modelHelp} id={`${prefix}-${chapter}-model-help`} data-project-model-help={chapter} hidden>Scroll to follow the camera. With focus, use arrow keys to inspect; Home or Esc returns to the current scroll view.</p>
    <button className={styles.sourceAction} type="button" data-project-model-reset={chapter} hidden>Return to scroll view</button>
   </>}
   <p id={`${prefix}-${chapter}-caption`} className={styles.sourceCaption}>{source.caption}</p>
   <p id={`${prefix}-${chapter}-credit`} className={styles.credit}>{source.credit}</p>
   <div className={styles.sourceLinks}>{motion?<>
    <a className={styles.sourceLink} data-project-motion-source href={motion.src} target="_blank" rel="noreferrer" aria-label={`${motion.kind==='recording'?'View recording':'View animation'} (new tab): ${motion.alt}`}>{motion.kind==='recording'?'View recording':'View animation'} <span aria-hidden="true">↗</span></a>
    <SourceLink image={poster}/>
   </>:<SourceLink image={image}/>}</div>
   {motion&&<>
    <div className={styles.motionControls}>
     <button type="button" data-project-motion-toggle={motion.id} aria-pressed="false" hidden>Play recording</button>
     <button type="button" data-project-motion-replay={motion.id} hidden>Replay recording</button>
    </div>
    <p className={styles.motionStatus} data-project-motion-status={motion.id} role="status"/>
   </>}
  </div>
 </div>;
}
function EvidenceFigure({image}){
 return <figure className={styles.evidence} data-study-evidence-layout={projectStudyEvidenceLayout(image)} data-study-evidence-role={image.purpose==='diagram'?'technical-plate':'photograph'}>
  <a className={styles.evidenceImage} data-information-window="evidence-image" data-information-motion-surface="plane" data-home-scroll-window="project-evidence" href={image.src} target="_blank" rel="noreferrer" aria-label={`View full image (new tab): ${image.alt}`}><InformationSkin/><img data-project-evidence-image src={image.src} width={image.width} height={image.height} alt={image.alt} loading="lazy" decoding="async"/></a>
  <figcaption data-information-window="evidence-caption" data-information-motion-surface="plane" data-home-scroll-window="project-caption"><InformationSkin/><p>{image.caption}</p><span>{image.credit}</span><a className={styles.sourceLink} data-evidence-source-link href={image.src} target="_blank" rel="noopener noreferrer" aria-label={`Open full image (new tab): ${image.alt}`}>Open full image (new tab)</a></figcaption>
 </figure>;
}

/** Native documentary case pages and optional verified source models share the
 * selected application's material, entry and ordinary-page clock. */
export default function ProjectCaseStudy({project}){
 const prefix=project.id,evidenceByChapter=projectStudyEvidence(project),chapters=[{id:'overview',label:'Overview'},...project.sections.map(section=>({id:section.id,label:section.label})),{id:'credits',label:'Credits'}];
 return <>
  <ProjectStudyChrome chapters={chapters} prefix={prefix} navigationLabel={`${project.shortTitle} project sections`} railClassName={styles.chapterRail}/>
  <ProjectCaseStudyControls projectId={project.id} chapterCount={chapters.length}/>
  <main id="portfolio-main" tabIndex={-1} className={styles.page} data-project-study={project.id} data-information-motion-profile="velocity-skin" data-portfolio-root data-portfolio-section="project-study">
   {project.model&&<ProjectCaseStudyStage projectId={project.id} model={project.model}/>}
   <article aria-labelledby={`${prefix}-overview-heading`}>
    <header id={`${prefix}-overview`} tabIndex={-1} className={`${styles.chapter} ${styles.opening}`} data-project-chapter="overview" {...layoutAttributes(projectStudyLayout(project,'overview'))}>
     <div className={styles.chapterInner}>
      <Panel opening>
       <a href="/projects/" className={styles.backLink}>← All projects</a>
       <StudyLabel opening>{project.yearLabel} / {project.category}</StudyLabel>
       <h1 id={`${prefix}-overview-heading`} tabIndex={-1}>{project.title}</h1>
       {project.subtitle&&<p className={styles.subtitle}>{project.subtitle}</p>}
       <p>{project.summary}</p>
       <dl className={styles.metadata}>
        <div><dt>Context</dt><dd>{project.context}</dd></div>
        <div><dt>Role</dt><dd>{project.role}</dd></div>
       </dl>
       <a className={styles.readingLink} href={`#${prefix}-${project.sections[0].id}`}>Follow the study <span aria-hidden="true">↓</span></a>
      </Panel>
      <PrimaryVisual image={project.hero} chapter="overview" prefix={prefix} opening model={project.model} motion={project.motionMedia?.find(media=>media.chapter==='overview')}/>
     </div>
    </header>
    {project.sections.map((section,index)=>{
     const motion=project.motionMedia?.find(media=>media.chapter===section.id),evidence=evidenceByChapter.get(section.id);
     return <section key={section.id} id={`${prefix}-${section.id}`} tabIndex={-1} className={styles.chapter} data-project-chapter={section.id} aria-labelledby={`${prefix}-${section.id}-heading`} {...layoutAttributes(projectStudyLayout(project,section.id))}>
     <div className={styles.chapterInner}>
      {section.media[0]&&<PrimaryVisual image={section.media[0]} chapter={section.id} prefix={prefix} model={project.model} motion={motion}/>}
      <Panel>
       <StudyLabel kind={section.kind}>{String(index+1).padStart(2,'0')} / {section.label}</StudyLabel>
       <h2 id={`${prefix}-${section.id}-heading`} tabIndex={-1}>{section.title}</h2>
       {section.paragraphs.map(paragraph=><p key={paragraph}>{paragraph}</p>)}
      </Panel>
     </div>
     {project.id==='entrance-installation-art'&&section.diagramFocus&&<div className={styles.evidenceBand}><EntranceDiagramFocus guide={section.diagramFocus} image={section.media.find(image=>image.src===section.diagramFocus.source)} id={`${prefix}-${section.id}-guide`}/></div>}
     {evidence.length>0&&<div className={styles.evidenceBand}>{evidence.map(image=><EvidenceFigure key={image.src} image={image}/>)}</div>}
    </section>;})}
    <footer id={`${prefix}-credits`} tabIndex={-1} className={`${styles.chapter} ${styles.creditsChapter}`} data-project-chapter="credits" aria-labelledby={`${prefix}-credits-heading`} {...layoutAttributes(projectStudyLayout(project,'credits'))}>
     <div className={styles.chapterInner}><Panel>
      <StudyLabel kind="make">{String(chapters.length-1).padStart(2,'0')} / CREDITS</StudyLabel>
      <h2 id={`${prefix}-credits-heading`} tabIndex={-1}>Project credits.</h2>
      <dl className={styles.credits}>{project.credits.map(credit=><div key={credit.role}><dt>{credit.role}</dt><dd>{credit.names}</dd></div>)}</dl>
      <p className={styles.sourceNote}>{project.sourceNote}</p>
      <a className={styles.related} href={project.related.href}><span>RELATED STUDY</span><strong data-display-type>{project.related.title}</strong><span aria-hidden="true">↗</span></a>
     </Panel></div>
    </footer>
   </article>
  </main>
 </>;
}
