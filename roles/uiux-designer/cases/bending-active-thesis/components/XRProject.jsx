import PortfolioNavigation from './PortfolioNavigation';
import ProjectAnimationPreview from './ProjectAnimationPreview';
import study from '../release/xr-study.json';
import styles from './XRProject.module.css';

function EvidenceFigure({ item, label, eager = false }) {
  return <figure className={styles.figure}>
    <div className={styles.figureIndex}>{label}</div>
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
      controlPlacement="outside" controlLabel="04 / ARCHIVED RESEARCH — RECORDING EXCERPT"
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
          <a className={styles.backLink} href="/projects/">← All projects</a>
          <p className={styles.eyebrow}>RESEARCH / PHYSICAL ↔ DIGITAL</p>
          <h1 id="xr-title" className={styles.title}>{study.title}</h1>
          <p className={styles.intro}>{study.introduction}</p>
          <dl className={styles.metadata}>
            <div><dt>Context</dt><dd>{study.context}</dd></div>
            <div><dt>Research</dt><dd>{study.authors.join(' / ')}</dd></div>
            <div><dt>Practice</dt><dd>Computational design / XR / Digital fabrication</dd></div>
          </dl>
        </header>

        <div className={styles.heroMedia}><EvidenceFigure item={study.hero} label="01 / RESEARCH ENVIRONMENT — RENDERING" eager /></div>

        <section className={styles.section} aria-labelledby="xr-context">
          <SectionHeading number="01" label="CONTEXT" title={study.sections.context.title} id="xr-context" />
          <div className={styles.sectionBody}>{study.sections.context.paragraphs.map(text => <p key={text}>{text}</p>)}</div>
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
          <div className={styles.mediaPair}>
            <EvidenceFigure item={study.media.measurement} label="02 / MEASUREMENT TOOLS — RENDERING" />
            <EvidenceFigure item={study.media.assembly} label="03 / MODULE ASSEMBLY — RENDERING" />
          </div>
        </section>

        <section className={styles.section} aria-labelledby="xr-prototype">
          <SectionHeading number="03" label="PROTOTYPE" title={study.sections.prototype.title} id="xr-prototype" />
          <div className={styles.sectionBody}>{study.sections.prototype.paragraphs.map(text => <p key={text}>{text}</p>)}</div>
          <MotionFigure item={study.media.motion}/>
        </section>

        <section className={styles.section} aria-labelledby="xr-contribution">
          <SectionHeading number="04" label="CONTRIBUTION" title="My work within a shared research project." id="xr-contribution" />
          <ul className={styles.contributionList}>{study.contributions.map(item => <li key={item.title}><h3>{item.title}</h3><p>{item.description}</p></li>)}</ul>
          <div className={styles.sectionBody}><p>{study.contributionNote}</p></div>
        </section>

        <section className={`${styles.section} ${styles.limits}`} aria-labelledby="xr-limits">
          <SectionHeading number="05" label="LIMITS" title="A prototype, with open questions." id="xr-limits" />
          <div className={styles.sectionBody}><ul>{study.limitations.map(text => <li key={text}>{text}</li>)}</ul></div>
        </section>

        <footer className={styles.section} aria-labelledby="xr-credits">
          <SectionHeading number="06" label="CREDITS & SOURCES" title="A collaborative foundation." id="xr-credits" />
          <dl className={styles.credits}>{study.credits.map(item => <div key={item.role}><dt>{item.role}</dt><dd>{item.names}</dd></div>)}</dl>
          <p className={styles.sourceNote}>{study.sourceNote}</p>
          <a className={styles.nextProject} href="/projects/bending-active/"><span>RELATED STUDY</span><strong>Bending-Active Metal Panel Deformation</strong><span aria-hidden="true">↗</span></a>
        </footer>
      </article>
    </main>
  </>;
}
