/* eslint-disable @next/next/no-img-element -- Pinned documentary pixels and source posters use native images with exact public asset identity. */
import ProjectStudyChrome,{StudyLabel} from './ProjectStudyChrome';
import InformationSkin from './InformationSkin';
import XRSceneStage from './XRSceneStage';
import study from '../release/xr-study.json';
import workspace from '../release/xr-workspace.json';
import styles from './XRProject.module.css';

function Panel({children,className=''}) {
  return <div className={`${styles.panel} ${className}`} data-information-window="editorial"><InformationSkin/>{children}</div>;
}
function Heading({number,label,title,id,kind='system'}) {
  return <><StudyLabel kind={kind}>{number} / {label}</StudyLabel><h2 id={id}>{title}</h2></>;
}
function EvidenceFigure({item,label,eager=false}) {
  return <figure className={styles.figure} data-xr-evidence={item.src}>
    <div className={styles.figureIndex}>{label}</div>
    <a className={styles.mediaFrame} data-information-window="evidence-image" href={item.src} target="_blank" rel="noreferrer" aria-label={`View full image: ${item.alt}`}>
      <InformationSkin/><span className={styles.mediaPlane}><img src={item.src} width={item.width} height={item.height} alt={item.alt} loading={eager?'eager':'lazy'} decoding="async" data-site-critical={eager?'':undefined}/></span>
    </a>
    <figcaption data-information-window="evidence-caption"><InformationSkin/><p>{item.caption}</p><span>{item.credit}</span></figcaption>
  </figure>;
}
function SceneSlot({stage,inspect=false,context=false}) {
  const poster=context?workspace.image:stage?.poster??study.model.poster;
  return <div className={styles.sceneSlot} data-xr-scene-slot data-xr-scene-kind={context?'workspace':stage?'phone':'model'}
    data-xr-model-control={inspect?'':undefined} tabIndex={inspect?0:undefined} role={inspect?'group':undefined}
    aria-label={inspect?'Original bamboo assembly. When 3D is available, drag horizontally or use arrow keys to inspect. Home resets; Escape returns to the chapter view.':undefined}>
    <noscript><figure className={styles.staticFigure}><picture>{context&&workspace.image.mobile&&<source media="(max-width:799px)" srcSet={workspace.image.mobile.src}/>}<img src={poster.src} width={poster.width} height={poster.height} alt={poster.alt} loading="lazy"/></picture><figcaption>{context?workspace.caption:stage?stage.caption:study.model.caption}</figcaption></figure></noscript>
  </div>;
}
function PhoneChapter({stage,index}) {
  return <section id={`xr-${stage.id}`} className={`${styles.chapter} ${styles.phoneChapter}`} data-xr-chapter={stage.id} data-xr-recording={stage.id} aria-labelledby={`xr-${stage.id}-heading`}>
    <div className={styles.chapterInner}>
      <SceneSlot stage={stage}/>
      <Panel className={styles.narrative}>
        <Heading number={String(index+1).padStart(2,'0')} label={`${stage.id.toUpperCase()} / RECORDED APP INTERFACE`} title={stage.title} id={`xr-${stage.id}-heading`}/>
        <p>{stage.description}</p><p className={styles.caption}>{stage.caption}</p>
        <a className={styles.recordingLink} href={stage.src} target="_blank" rel="noreferrer">Open full recording <span aria-hidden="true">↗</span></a>
        <p className={styles.recordingNote}>Original interface recording, presented on an iPhone display model. The website does not connect to tracking hardware.</p>
        <p className={styles.credit}>{stage.credit}</p>
      </Panel>
    </div>
  </section>;
}
export default function XRProject() {
  return <>
    <ProjectStudyChrome chapters={[{id:'overview',label:'Overview'},{id:'context',label:'Context'},{id:'method',label:'Method'},{id:'adapt',label:'Adapt'},{id:'assemble',label:'Assemble'},{id:'join',label:'Join'},{id:'making',label:'Physical study'},{id:'credits',label:'Credits & sources'}]}/>
    <XRSceneStage model={study.model} stages={study.phoneStages} workspaceVisual={workspace.image}/>
    <main id="portfolio-main" tabIndex={-1} className={styles.page} data-xr-study data-portfolio-root data-portfolio-section="xr-project">
      <article aria-labelledby="xr-title">
        <header id="xr-overview" className={`${styles.chapter} ${styles.hero}`} data-xr-chapter="overview">
          <div className={styles.chapterInner}>
            <Panel className={`${styles.narrative} ${styles.heroCopy}`}>
              <a className={styles.backLink} href="/projects/">← All projects</a>
              <StudyLabel opening>2024 / RESEARCH / PHYSICAL ↔ DIGITAL</StudyLabel>
              <h1 id="xr-title">{study.title}</h1><p className={styles.introduction}>{study.introduction}</p>
              <dl className={styles.metadata}>
                <div><dt>Context</dt><dd>{study.context}</dd></div><div><dt>Research</dt><dd>{study.authors.join(' / ')}</dd></div>
                <div><dt>Practice</dt><dd>Computational design / XR / Digital fabrication</dd></div>
              </dl>
              <a className={styles.readingLink} href="#xr-context">Scroll to follow the research <span aria-hidden="true">↓</span></a>
            </Panel>
          </div>
        </header>
        <section id="xr-context" className={styles.chapter} data-xr-chapter="context" aria-labelledby="xr-context-heading">
          <div className={styles.chapterInner}><SceneSlot context/><Panel className={styles.narrative}>
            <Heading number="01" label="CONTEXT" title={study.sections.context.title} id="xr-context-heading" kind="form"/>
            {study.sections.context.paragraphs.map(text=><p key={text}>{text}</p>)}
            <p className={styles.credit} data-xr-workspace-credit>{workspace.caption} {workspace.credit}</p>
          </Panel></div>
          <div className={styles.evidenceBand}>
            <EvidenceFigure item={study.media.adaptiveMethod} label="ADAPTIVE DESIGN / ORIGINAL METHOD DIAGRAM"/>
            <div className={styles.mediaPair}><EvidenceFigure item={study.media.physicalCapture} label="MEASUREMENT / PHYSICAL RECORD"/><EvidenceFigure item={study.media.measurement} label="MEASUREMENT TOOLS / PROJECT ILLUSTRATION"/></div>
          </div>
        </section>
        <section id="xr-method" className={styles.chapter} data-xr-chapter="method" aria-labelledby="xr-method-heading">
          <div className={styles.chapterInner}><SceneSlot inspect/><Panel className={styles.narrative}>
            <Heading number="02" label="METHOD" title={study.sections.method.title} id="xr-method-heading"/>
            {study.sections.method.paragraphs.map(text=><p key={text}>{text}</p>)}
            <ol className={styles.workflow} aria-label="Research feedback workflow">{study.workflow.map((step,index)=><li key={step.label}><span>{String(index+1).padStart(2,'0')} / {step.label}</span><h3>{step.title}</h3><p>{step.description}</p></li>)}</ol>
            <div className={styles.modelExplanation}><h3>{study.model.title}</h3><p>{study.model.description}</p></div>
            <p className={styles.caption}>{study.model.caption}</p><p className={styles.credit}>{study.model.credit}</p>
          </Panel></div>
          <div className={styles.evidenceBand}><EvidenceFigure item={study.media.communication} label="MEASUREMENT → MODEL → XR / ORIGINAL SYSTEM DIAGRAM"/><EvidenceFigure item={study.media.dataCategories} label="DATA FLOW / LIVE GEOMETRY, CONFIGURATION + ASSEMBLY"/></div>
        </section>
        <section id="xr-prototype" className={styles.prototype} aria-labelledby="xr-prototype-heading">
          <div className={styles.sectionIntroduction}><Panel><Heading number="03" label="PROTOTYPE" title={study.sections.prototype.title} id="xr-prototype-heading"/>{study.sections.prototype.paragraphs.map(text=><p key={text}>{text}</p>)}</Panel></div>
          {study.phoneStages.map((stage,index)=><PhoneChapter key={stage.id} stage={stage} index={index}/>)}
        </section>
        <section id="xr-making" className={styles.chapter} data-xr-chapter="making" aria-labelledby="xr-making-heading">
          <div className={styles.chapterInner}><SceneSlot/><Panel className={styles.narrative}><Heading number="04" label="PHYSICAL STUDY" title={study.sections.making.title} id="xr-making-heading" kind="make"/>{study.sections.making.paragraphs.map(text=><p key={text}>{text}</p>)}</Panel></div>
          <div className={styles.evidenceBand}>
            <div className={styles.mediaPair}><EvidenceFigure item={study.media.physicalAssembly} label="APP-ASSISTED ASSEMBLY / PHYSICAL RECORD"/><EvidenceFigure item={study.media.assembly} label="MODULE ASSEMBLY / PROJECT ILLUSTRATION"/></div>
            <EvidenceFigure item={study.media.physicalResult} label="BAMBOO DEMONSTRATOR / PHYSICAL RECORD"/>
          </div>
        </section>
        <footer id="xr-credits" className={styles.readingChapter} data-xr-chapter="credits" aria-labelledby="xr-credits-heading"><Panel>
          <Heading number="05" label="CREDITS & SOURCES" title="A collaborative foundation." id="xr-credits-heading"/>
          <dl className={styles.credits}>{study.credits.map(item=><div key={item.role}><dt>{item.role}</dt><dd>{item.names}</dd></div>)}</dl><p className={styles.sourceNote}>{study.sourceNote}</p>
          <p className={styles.caption}>{study.limitations[1]} {study.limitations[3]}</p>
          <div className={styles.recordingSource}><a className={styles.recordingLink} href={study.media.motion.src} target="_blank" rel="noreferrer">Original presentation excerpt <span aria-hidden="true">↗</span></a><p>{study.media.motion.caption}</p><p className={styles.credit}>{study.media.motion.credit}</p></div>
          <a className={styles.nextProject} href="/projects/bending-active/"><span>RELATED STUDY</span><strong>Bending-Active Metal Panel Deformation</strong><span aria-hidden="true">↗</span></a>
        </Panel></footer>
      </article>
    </main>
  </>;
}
