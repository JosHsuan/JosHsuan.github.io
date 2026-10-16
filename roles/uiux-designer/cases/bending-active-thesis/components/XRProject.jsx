import PortfolioNavigation from './PortfolioNavigation';
import ProjectAnimationPreview from './ProjectAnimationPreview';
import XRModelStudy from './XRModelStudy';
import XRPhoneStudy from './XRPhoneStudy';
import study from '../release/xr-study.json';
import styles from './XRProject.module.css';

function EvidenceFigure({ item, label, eager = false }) {
  return <figure className={styles.figure} data-xr-evidence={item.src}>
    <div className={styles.figureIndex}><span>{label}</span><a href={item.src} target="_blank" rel="noreferrer">Open full image <span aria-hidden="true">↗</span></a></div>
    <a href={item.src} target="_blank" rel="noreferrer" aria-label={`View full image: ${item.alt}`}>
      <img src={item.src} width={item.width} height={item.height} alt={item.alt} loading={eager ? 'eager' : 'lazy'} data-site-critical={eager ? '' : undefined} />
    </a>
    <figcaption><p>{item.caption}</p><span>{item.credit}</span></figcaption>
  </figure>;
}

function SectionHeading({ number, label, title, id }) {
  return <div className={styles.sectionHeading}>
    <p className={styles.eyebrow}>{number} / {label}</p>
    <h2 id={id}>{title}</h2>
  </div>;
}

function MotionFigure({item}) {
  return <figure className={styles.figure} data-xr-recording>
    <ProjectAnimationPreview animation={item} poster={item.poster} label="Archived XR research recording"
      controlPlacement="outside" controlLabel="ARCHIVED RESEARCH — ORIGINAL PRESENTATION EXCERPT" critical={false}
      className={styles.motionPreview} mediaClassName={styles.motionMedia}/>
    <figcaption><p>{item.caption}</p><span>{item.credit}</span></figcaption>
  </figure>;
}

export default function XRProject() {
  return <>
    <PortfolioNavigation current="projects" />
    <main id="portfolio-main" tabIndex={-1} className={styles.page} data-xr-study data-portfolio-root data-portfolio-section="xr-project">
      <article aria-labelledby="xr-title">
        <header className={styles.hero}>
          <div className={styles.heroCopy}>
            <a className={styles.backLink} href="/projects/">← All projects</a>
            <p className={styles.eyebrow}>2024 / RESEARCH / PHYSICAL ↔ DIGITAL</p>
            <h1 id="xr-title" className={styles.title}>{study.title}</h1>
          </div>
          <div className={styles.heroVisual} data-xr-hero>
            <EvidenceFigure item={study.hero} label="PROJECT VISUAL / PHYSICAL STRUCTURE + RECORDED INTERFACE" eager />
          </div>
          <p className={`${styles.intro} ${styles.heroIntro}`}>{study.introduction}</p>
          <dl className={styles.metadata}>
            <div><dt>Context</dt><dd>{study.context}</dd></div>
            <div><dt>Research</dt><dd>{study.authors.join(' / ')}</dd></div>
            <div><dt>Practice</dt><dd>Computational design / XR / Digital fabrication</dd></div>
          </dl>
          <nav className={styles.wide} aria-label="XR project sections">
            <ul className={styles.chapterNavigation}>
              <li><a href="#xr-context">01 / Physical ↔ digital</a></li>
              <li><a href="#xr-method">02 / Method + model</a></li>
              <li><a href="#xr-prototype">03 / App in use</a></li>
              <li><a href="#xr-making">04 / Physical study</a></li>
              <li><a href="#xr-credits">Credits & sources</a></li>
            </ul>
          </nav>
        </header>

        <section className={styles.section} aria-labelledby="xr-context">
          <SectionHeading number="01" label="CONTEXT" title={study.sections.context.title} id="xr-context" />
          <div className={styles.sectionBody}>{study.sections.context.paragraphs.map(text => <p key={text}>{text}</p>)}</div>
          <div className={styles.physicalMedia}>
            <EvidenceFigure item={study.media.adaptiveMethod} label="01 / ADAPTIVE DESIGN — ORIGINAL METHOD DIAGRAM" />
            <EvidenceFigure item={study.media.physicalCapture} label="02 / MEASUREMENT — PHYSICAL RECORD" />
          </div>
        </section>

        <section className={styles.section} aria-labelledby="xr-method">
          <SectionHeading number="02" label="METHOD" title={study.sections.method.title} id="xr-method" />
          <div className={styles.sectionBody}>{study.sections.method.paragraphs.map(text => <p key={text}>{text}</p>)}</div>
          <ol className={styles.workflow} aria-label="Research feedback workflow">
            {study.workflow.map((step, index) => <li className={styles.workflowStep} key={step.label}>
              <span>{String(index + 1).padStart(2, '0')} / {step.label}</span>
              <h3>{step.title}</h3><p>{step.description}</p>
            </li>)}
          </ol>
          <div className={styles.wide}>
            <EvidenceFigure item={study.media.communication} label="03 / MEASUREMENT → MODEL → XR — ORIGINAL SYSTEM DIAGRAM" />
          </div>
          <div className={styles.modelStage} data-xr-model-section>
            <EvidenceFigure item={study.media.dataCategories} label="DATA FLOW / LIVE GEOMETRY, CONFIGURATION + ASSEMBLY" />
            <XRModelStudy model={study.model} />
          </div>
          <details className={styles.archive}>
            <summary>Measurement tools and module setup / project illustrations</summary>
            <div className={styles.mediaPair}>
              <EvidenceFigure item={study.media.measurement} label="MEASUREMENT TOOLS — RENDERING" />
              <EvidenceFigure item={study.media.assembly} label="MODULE ASSEMBLY — RENDERING" />
            </div>
          </details>
        </section>

        <section className={styles.section} aria-labelledby="xr-prototype">
          <SectionHeading number="03" label="PROTOTYPE" title={study.sections.prototype.title} id="xr-prototype" />
          <div className={styles.sectionBody}>{study.sections.prototype.paragraphs.map(text => <p key={text}>{text}</p>)}</div>
          <div className={styles.phoneStage} data-xr-phone-section>
            <XRPhoneStudy stages={study.phoneStages} />
          </div>
          <details className={styles.archive}>
            <summary>View the archived four-panel research recording</summary>
            <MotionFigure item={study.media.motion}/>
          </details>
        </section>

        <section className={styles.section} aria-labelledby="xr-making">
          <SectionHeading number="04" label="PHYSICAL STUDY" title={study.sections.making.title} id="xr-making" />
          <div className={styles.sectionBody}>{study.sections.making.paragraphs.map(text => <p key={text}>{text}</p>)}</div>
          <div className={styles.physicalMedia}>
            <EvidenceFigure item={study.media.physicalAssembly} label="04 / APP-ASSISTED ASSEMBLY — PHYSICAL RECORD" />
            <EvidenceFigure item={study.media.physicalResult} label="05 / BAMBOO DEMONSTRATOR — PHYSICAL RECORD" />
          </div>
        </section>

        <section className={styles.section} aria-labelledby="xr-contribution">
          <SectionHeading number="05" label="CONTRIBUTION" title="My work within a shared research project." id="xr-contribution" />
          <ul className={styles.contributionList}>{study.contributions.map(item => <li key={item.title}><h3>{item.title}</h3><p>{item.description}</p></li>)}</ul>
          <div className={styles.sectionBody}><p>{study.contributionNote}</p></div>
        </section>

        <section className={`${styles.section} ${styles.limits}`} aria-labelledby="xr-limits">
          <SectionHeading number="06" label="LIMITS" title="A prototype, with open questions." id="xr-limits" />
          <div className={styles.sectionBody}><ul>{study.limitations.map(text => <li key={text}>{text}</li>)}</ul></div>
        </section>

        <footer className={styles.section} aria-labelledby="xr-credits">
          <SectionHeading number="07" label="CREDITS & SOURCES" title="A collaborative foundation." id="xr-credits" />
          <dl className={styles.credits}>{study.credits.map(item => <div key={item.role}><dt>{item.role}</dt><dd>{item.names}</dd></div>)}</dl>
          <p className={styles.sourceNote}>{study.sourceNote}</p>
          <a className={styles.nextProject} href="/projects/bending-active/"><span>RELATED STUDY</span><strong>Bending-Active Metal Panel Deformation</strong><span aria-hidden="true">↗</span></a>
        </footer>
      </article>
    </main>
  </>;
}
