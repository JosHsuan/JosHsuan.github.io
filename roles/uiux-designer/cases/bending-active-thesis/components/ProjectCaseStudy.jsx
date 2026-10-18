/* eslint-disable @next/next/no-img-element -- Documentary images retain pinned native sources, dimensions and accessible captions. */
import ProjectStudyChrome,{StudyLabel} from './ProjectStudyChrome';
import ProjectCaseStudyControls from './ProjectCaseStudyControls';
import ProjectCaseStudyStage from './ProjectCaseStudyStage';
import InformationSkin from './InformationSkin';
import styles from './ProjectCaseStudy.module.css';

function Panel({children,opening=false}){
 return <div className={`${styles.panel} ${opening?styles.openingPanel:''}`} data-information-window="editorial" data-home-scroll-window="project-narrative"><InformationSkin/>{children}</div>;
}
function SourceLink({image}){
 return <a className={styles.sourceLink} href={image.src} target="_blank" rel="noreferrer">View full image <span aria-hidden="true">↗</span></a>;
}
function PrimaryVisual({image,chapter,prefix,opening=false,model}){
 const inspect=model?.chapters.includes(chapter);
 return <div className={styles.visualSlot} data-project-model-control={inspect?'':undefined} tabIndex={inspect?0:undefined} role={inspect?'group':undefined} aria-label={inspect?`${model.alt} When 3D is available, drag horizontally or use arrow keys to inspect. Home or Escape returns to the chapter view.`:undefined}>
  <figure className={styles.primaryFigure} data-project-media={chapter} aria-describedby={`${prefix}-${chapter}-caption ${prefix}-${chapter}-credit`}>
   <picture><img src={image.src} width={image.width} height={image.height} alt={image.alt} loading={opening?'eager':'lazy'} decoding="async" fetchPriority={opening?'high':undefined} data-site-critical={opening?'':undefined}/></picture>
   <span className={styles.imageFailure} role="status">Image unavailable. The source caption and project text remain available.</span>
  </figure>
 </div>;
}
function EvidenceFigure({image}){
 return <figure className={styles.evidence}>
  <a className={styles.evidenceImage} href={image.src} target="_blank" rel="noreferrer" aria-label={`View full image: ${image.alt}`}><img src={image.src} width={image.width} height={image.height} alt={image.alt} loading="lazy" decoding="async"/></a>
  <figcaption data-information-window="evidence-caption" data-home-scroll-window="project-caption"><InformationSkin/><p>{image.caption}</p><span>{image.credit}</span></figcaption>
 </figure>;
}

/** Native documentary case pages and optional verified source models share the
 * selected application's material, entry and ordinary-page clock. */
export default function ProjectCaseStudy({project}){
 const prefix=project.id,chapters=[{id:'overview',label:'Overview'},...project.sections.map(section=>({id:section.id,label:section.label})),{id:'credits',label:'Credits & sources'}];
 return <>
  <ProjectStudyChrome chapters={chapters} prefix={prefix} navigationLabel={`${project.shortTitle} project sections`} railClassName={styles.chapterRail}/>
  <ProjectCaseStudyControls projectId={project.id} chapterCount={chapters.length}/>
  <main id="portfolio-main" tabIndex={-1} className={styles.page} data-project-study={project.id} data-portfolio-root data-portfolio-section="project-study">
   {project.model&&<ProjectCaseStudyStage projectId={project.id} model={project.model}/>}
   <article aria-labelledby={`${prefix}-overview`}>
    <header className={`${styles.chapter} ${styles.opening}`} data-project-chapter="overview">
     <div className={styles.chapterInner}>
      <PrimaryVisual image={project.hero} chapter="overview" prefix={prefix} opening model={project.model}/>
      <Panel opening>
       <a href="/projects/" className={styles.backLink}>← All projects</a>
       <StudyLabel opening>{project.yearLabel} / {project.category}</StudyLabel>
       <h1 id={`${prefix}-overview`} tabIndex={-1}>{project.title}</h1>
       {project.subtitle&&<p className={styles.subtitle}>{project.subtitle}</p>}
       <p>{project.summary}</p>
       <dl className={styles.metadata}>
        <div><dt>Context</dt><dd>{project.context}</dd></div>
        <div><dt>Role</dt><dd>{project.role}</dd></div>
       </dl>
       <p id={`${prefix}-overview-caption`} className={styles.sourceCaption}>{project.hero.caption}</p><p id={`${prefix}-overview-credit`} className={styles.credit}>{project.hero.credit}</p>
       <SourceLink image={project.hero}/>
       <a className={styles.readingLink} href={`#${prefix}-${project.sections[0].id}`}>Follow the study <span aria-hidden="true">↓</span></a>
      </Panel>
     </div>
    </header>
    {project.sections.map((section,index)=><section key={section.id} className={styles.chapter} data-project-chapter={section.id} aria-labelledby={`${prefix}-${section.id}`}>
     <div className={styles.chapterInner}>
      {section.media[0]&&<PrimaryVisual image={section.media[0]} chapter={section.id} prefix={prefix} model={project.model}/>}
      <Panel>
       <StudyLabel kind={section.kind}>{String(index+1).padStart(2,'0')} / {section.label}</StudyLabel>
       <h2 id={`${prefix}-${section.id}`} tabIndex={-1}>{section.title}</h2>
       {section.paragraphs.map(paragraph=><p key={paragraph}>{paragraph}</p>)}
       {project.model?.chapters.includes(section.id)&&<p className={styles.sourceCaption} data-project-model-description>{project.model.alt}</p>}
       {project.model?.chapters.includes(section.id)&&section.media[0]&&<a className={styles.modelReference} href={section.media[0].src} target="_blank" rel="noreferrer" aria-label={`View reference image: ${section.media[0].alt}`}><img src={section.media[0].src} width={section.media[0].width} height={section.media[0].height} alt="" loading="lazy" decoding="async"/></a>}
       {section.media[0]&&<><p id={`${prefix}-${section.id}-caption`} className={styles.sourceCaption}>{section.media[0].caption}</p><p id={`${prefix}-${section.id}-credit`} className={styles.credit}>{section.media[0].credit}</p><SourceLink image={section.media[0]}/></>}
      </Panel>
     </div>
     {section.media.length>1&&<div className={styles.evidenceBand}>{section.media.slice(1).map(image=><EvidenceFigure key={image.src} image={image}/>)}</div>}
    </section>)}
    <footer className={`${styles.chapter} ${styles.creditsChapter}`} data-project-chapter="credits" aria-labelledby={`${prefix}-credits`}>
     <div className={styles.chapterInner}><Panel>
      <StudyLabel kind="make">{String(chapters.length-1).padStart(2,'0')} / CREDITS & SOURCES</StudyLabel>
      <h2 id={`${prefix}-credits`} tabIndex={-1}>Project credits and sources.</h2>
      <dl className={styles.credits}>{project.credits.map(credit=><div key={credit.role}><dt>{credit.role}</dt><dd>{credit.names}</dd></div>)}</dl>
      <p className={styles.sourceNote}>{project.sourceNote}</p>
      <a className={styles.related} href={project.related.href}><span>RELATED STUDY</span><strong data-display-type>{project.related.title}</strong><span aria-hidden="true">↗</span></a>
     </Panel></div>
    </footer>
   </article>
  </main>
 </>;
}
