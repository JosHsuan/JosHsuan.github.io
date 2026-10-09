import CinematicExperience from '../components/CinematicExperience';
import EvidenceInspector from '../components/EvidenceInspector';
import SourceDiagram from '../components/SourceDiagram';
import review from '../release/story.json';
import styles from './page.module.css';

const story = review.cinematic;
const evidence = Object.values(story.media);
const methodNotes = [
  'Start with the desired surface geometry.',
  'Miura representation describes the surface’s local angles.',
  'A sampled function library relates opening dimensions and angle.',
  'Paired edges describe how openings close and the panel bends.',
];

function Glyph({ kind = 'form' }) {
  return <span className={styles.glyph} data-glyph-kind={kind} data-choreography="glyph" data-parallax aria-hidden="true"><svg viewBox="0 0 40 40" fill="none">
    {kind === 'form' && <><path d="M5 28 13 8l13 3 9 19-18 4Z" /><path d="m5 28 21-17M13 8l4 26m0 0 18-4" /></>}
    {kind === 'system' && <><path d="m9 9 22 4-3 19L9 25Z" /><path d="m9 9 19 23M9 25l22-12" /><circle cx="9" cy="9" r="3" /><circle cx="31" cy="13" r="3" /><circle cx="28" cy="32" r="3" /><circle cx="9" cy="25" r="3" /></>}
    {kind === 'make' && <><path d="m5 14 15-7 15 7-15 7Zm0 7 15 7 15-7M5 28l15 7 15-7" /><path d="M20 21v14" /></>}
  </svg></span>;
}

function Heading({ number, label, lines, id, kind }) {
  return <><div className={styles.chapterLabel}><Glyph kind={kind} /><span data-protect data-choreography="caption">{number} / {label}</span></div>
    <h2 id={id} className={styles.chapterHeading} data-story-heading data-feedback-plane>{lines.map((line, index) => <span key={line} data-heading-line data-protect data-choreography="heading" style={{'--line-index':index}} className={index === lines.length - 1 ? styles.headingLast : undefined}>{line}</span>)}</h2>
  </>;
}

function EvidenceImage({ item, className = '', kind = 'photo' }) {
  return <figure className={[styles.evidence, className].join(' ')} data-story-media data-media-kind={kind}>
    <div className={styles.figureIndex} data-protect data-choreography="caption" aria-hidden="true"><span>Evidence / {String(evidence.indexOf(item)+1).padStart(2,'0')}</span><span>{kind === 'diagram' ? 'RESEARCH DRAWING' : 'PHYSICAL RECORD'}</span></div>
    <a className={styles.mediaFrame} data-inspect-figure={evidence.indexOf(item)} href={item.source} target="_blank" rel="noreferrer" aria-label={`Inspect original source: ${item.figure}`}><span className={styles.mediaPlane} data-protect data-choreography={kind === 'photo' ? 'photo' : 'diagram'} data-feedback-plane><span className={styles.frameCorner} aria-hidden="true"/><img src={item.src} width={item.width} height={item.height} alt={item.alt} loading="lazy" /></span><span className={styles.mediaAction}>Inspect evidence <span aria-hidden="true">↗</span></span></a>
    <figcaption data-editorial-caption data-protect data-choreography="caption"><span>{item.figure}</span><p>{item.caption}</p></figcaption>
    <div data-evidence-host={evidence.indexOf(item)} />
  </figure>;
}

function Paragraphs({ paragraphs }) {
  return paragraphs.map((paragraph, index) => <p key={paragraph} data-editorial-copy data-protect data-choreography="prose" data-feedback-plane style={{'--copy-index':index}}>{paragraph}</p>);
}

function SceneAnchor({chapter}) {
  return <div className={styles.sceneAnchor} data-canvas-anchor={chapter} aria-hidden="true">
    <picture><source media="(max-width:780px)" srcSet="/assets/cinematic/model-poster-mobile.webp"/><img src="/assets/cinematic/model-poster.webp" alt="" width="1440" height="1000" loading={chapter==='overview'?'eager':'lazy'}/></picture>
  </div>;
}

export default function Page() {
  return <>
    <CinematicExperience />
    <EvidenceInspector items={evidence} />
    <a href="#main" className={styles.skip}>Skip to the study</a>
    <header className={styles.masthead} data-protect data-page-masthead>
      <span className={styles.owner} data-choreography="nav">{review.owner}<span aria-hidden="true"> / </span><span className={styles.discipline}>RESEARCH</span></span>
    </header>
    <nav className={styles.chapterRail} aria-label="Study chapters" data-protect data-story-navigation>{['overview','form','system','pattern','make','validation','credits'].map((id,index)=><a key={id} href={`#${id}`} data-chapter-link={id}><span data-choreography="nav">{String(index+1).padStart(2,'0')}</span><span className={styles.railLabel}>{id}</span></a>)}</nav>
    <div className={styles.readingFrame} data-reading-frame><main id="main" tabIndex={-1} className={styles.story} data-story-root>
      <section id="overview" className={[styles.chapter, styles.overview].join(' ')} tabIndex={-1} data-story-chapter="overview" data-layout="left" aria-labelledby="project-title">
        <div className={styles.chapterInner}>
          <div className={styles.openingCopy} data-story-panel>
            <div className={styles.openingLabel}><Glyph /><span data-protect data-choreography="caption">{story.overview.eyebrow}</span></div>
            <h1 id="project-title" aria-label={review.title} data-story-heading data-feedback-plane><span data-heading-line data-protect data-choreography="heading" style={{'--line-index':0}}>{review.hero.titleLines[0]}</span><span data-heading-line data-protect data-choreography="heading" style={{'--line-index':1}}>{review.hero.titleLines[1]}</span></h1>
            <p className={styles.subtitle} data-protect data-choreography="prose">{review.hero.subtitle}</p>
          </div>
          <SceneAnchor chapter="overview"/>
          <div className={[styles.openingCopy,styles.openingDetails].join(' ')} data-story-panel>
            <p className={styles.openingText} data-reading-copy data-protect data-choreography="prose" data-feedback-plane>{story.overview.introduction}</p>
            <p className={styles.projectType} data-protect data-choreography="credit">{review.projectType}<span aria-hidden="true"> — </span>{review.institution}</p>
          </div>
          <div className={styles.scrollCue} aria-hidden="true"><span className={styles.scrollLine} />{story.overview.scrollCue}</div>
        </div>
      </section>

      <section id="form" className={[styles.chapter, styles.form].join(' ')} tabIndex={-1} data-story-chapter="form" data-layout="left" aria-labelledby="form-heading">
        <div className={styles.chapterInner}>
          <div className={styles.copy} data-story-panel>
            <Heading number="01" label={story.form.label} lines={story.form.heading} id="form-heading" kind="form" />
            <Paragraphs paragraphs={story.form.paragraphs} />
            <p className={styles.marginNote} data-protect data-choreography="caption">{story.form.aside}</p>
            <a className={styles.studyLink} data-protect href="#model-study"><span data-choreography="nav">Explore the surface</span><span aria-hidden="true">↓</span><small>Hover the model. Click to compare. Drag to explore.</small></a>
          </div>
          <div id="model-study" tabIndex={-1} className={styles.inlineStudy} data-model-study-host="form" />
          <div className={styles.diagramWide}><SourceDiagram kind="miura" title="From a flat grid to a folded surface" /></div>
          <div className={styles.spatialNotation} aria-hidden="true"><span /><p>LOCAL OPENING<br />CONTINUOUS SURFACE</p></div>
        </div>
      </section>

      <section id="system" className={[styles.chapter, styles.system].join(' ')} tabIndex={-1} data-story-chapter="system" data-layout="left" aria-labelledby="system-heading">
        <div className={styles.chapterInner}>
          <div className={styles.copy} data-story-panel>
            <Heading number="02" label={story.system.label} lines={story.system.heading} id="system-heading" kind="system" />
            <Paragraphs paragraphs={story.system.paragraphs} />
            <ol className={styles.methodSequence}>{story.system.sequence.map((step, index) => <li key={step} style={{'--step-index':index}} data-protect><details><summary><span>{String(index + 1).padStart(2, '0')}</span><span data-choreography="diagram">{step}</span><span className={styles.stepArrow} aria-hidden="true">↗</span></summary><p>{methodNotes[index]}</p></details></li>)}</ol>
            <p className={styles.layerCaption} data-protect data-choreography="caption" data-layer-caption>Source geometry · original placement</p>

          </div>
          <div className={styles.inlineStudy} data-model-study-host="system" />
          <div className={styles.diagramWide}><SourceDiagram kind="workflow" title="Read the design-to-fabrication sequence" />
            <details className={styles.sourceComparison}><summary data-protect>Compare with the original thesis figure</summary><EvidenceImage item={story.media.geometry} kind="diagram" /></details>
          </div>
        </div>
      </section>

      <section id="pattern" className={[styles.chapter, styles.pattern].join(' ')} tabIndex={-1} data-story-chapter="pattern" data-layout="left" aria-labelledby="pattern-heading">
        <div className={styles.chapterInner}>
          <div className={styles.copy} data-story-panel>
            <Heading number="03" label={story.pattern.label} lines={story.pattern.heading} id="pattern-heading" kind="system" />
            <Paragraphs paragraphs={story.pattern.paragraphs} />
            <p className={styles.smallNote} data-protect data-choreography="caption">{story.pattern.note}</p>
            <p className={styles.layerCaption} data-protect data-choreography="caption" data-layer-caption>Source geometry · original placement</p>
          </div>
          <div className={styles.inlineStudy} data-model-study-host="pattern" />
          <div className={styles.diagramWide}><SourceDiagram kind="library" title="Follow the sampled function library" />
            <details className={styles.sourceComparison}><summary data-protect>Read the original library figure</summary><EvidenceImage item={story.media.library} kind="diagram" /></details>
          </div>
        </div>
      </section>

      <section id="make" className={[styles.chapter, styles.make].join(' ')} tabIndex={-1} data-story-chapter="make" data-layout="right" aria-labelledby="make-heading">
        <div className={styles.chapterInner}>
          <EvidenceImage item={story.media.connection} className={styles.connectionImage} />
          <div className={styles.copy} data-story-panel>
            <Heading number="04" label={story.make.label} lines={story.make.heading} id="make-heading" kind="make" />
            <Paragraphs paragraphs={story.make.paragraphs} />
            <dl className={styles.measurements}>{story.make.measurements.map(measurement => <div key={measurement.label} data-protect data-choreography="metric"><dt>{measurement.label}</dt><dd>{measurement.value}</dd></div>)}</dl>
            <p className={styles.smallNote} data-protect data-choreography="caption">{story.make.note}</p>
          </div>
        </div>
      </section>

      <section id="validation" className={[styles.chapter, styles.validation].join(' ')} tabIndex={-1} data-story-chapter="validation" data-layout="left" aria-labelledby="validation-heading">
        <div className={styles.chapterInner}>
          <div className={styles.copy} data-story-panel>
            <Heading number="05" label={story.validation.label} lines={story.validation.heading} id="validation-heading" kind="make" />
            <Paragraphs paragraphs={story.validation.paragraphs} />
            <p className={styles.smallNote} data-protect data-choreography="caption">{story.validation.note}</p>
          </div>
          <EvidenceImage item={story.media.prototype} className={styles.prototypeImage} />
        </div>
      </section>

      <section id="credits" className={[styles.chapter, styles.credits].join(' ')} tabIndex={-1} data-story-chapter="credits" data-layout="left" aria-labelledby="credits-heading">
        <div className={styles.chapterInner}>
          <div className={styles.closingCopy} data-story-panel>
            <Heading number="06" label={story.credits.label} lines={story.credits.heading} id="credits-heading" kind="form" />
            <p className={styles.closingSummary} data-protect data-choreography="credit">{story.credits.summary}</p>
            <p data-protect data-choreography="credit">{story.credits.contribution}</p>
            <p className={styles.smallNote} data-protect data-choreography="caption">{story.credits.collaboration}</p>
            <p className={styles.smallNote} data-protect data-choreography="caption">{story.credits.limitation}</p>
            <details className={styles.sourceNotes} data-protect data-choreography="credit">
              <summary>Source notes & credits</summary>
              <p>{review.credits.media}</p><p>{review.credits.sourceEdition} {review.yearNote}</p>
              <div className={styles.sourceLinks} aria-label="Original source pages">{Object.values(story.media).map(item => <a key={item.figure} href={item.source} target="_blank" rel="noreferrer">{item.figure} <span aria-hidden="true">↗</span></a>)}</div>
            </details>
          </div>
          <SceneAnchor chapter="credits"/>
          <footer className={styles.endnote} data-protect data-choreography="credit"><span>{review.owner}</span><span>FORM / SYSTEM / MAKE</span></footer>
        </div>
      </section>
    </main></div>
  </>;
}
