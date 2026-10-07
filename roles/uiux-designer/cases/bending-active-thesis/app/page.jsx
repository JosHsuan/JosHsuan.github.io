import CinematicExperience from '../components/CinematicExperience';
import review from '../content/review.json';
import styles from './page.module.css';

const story = review.cinematic;

function Glyph({ kind = 'form' }) {
  return <span className={styles.glyph} data-parallax aria-hidden="true"><svg viewBox="0 0 40 40" fill="none">
    {kind === 'form' && <><path d="M5 28 13 8l13 3 9 19-18 4Z" /><path d="m5 28 21-17M13 8l4 26m0 0 18-4" /></>}
    {kind === 'system' && <><path d="m9 9 22 4-3 19L9 25Z" /><path d="m9 9 19 23M9 25l22-12" /><circle cx="9" cy="9" r="3" /><circle cx="31" cy="13" r="3" /><circle cx="28" cy="32" r="3" /><circle cx="9" cy="25" r="3" /></>}
    {kind === 'make' && <><path d="m5 14 15-7 15 7-15 7Zm0 7 15 7 15-7M5 28l15 7 15-7" /><path d="M20 21v14" /></>}
  </svg></span>;
}

function Heading({ number, label, lines, id, kind }) {
  return <><div className={styles.chapterLabel}><Glyph kind={kind} /><span>{number} / {label}</span></div>
    <h2 id={id} className={styles.chapterHeading} data-story-heading>{lines.map((line, index) => <span key={line} className={index === lines.length - 1 ? styles.headingLast : undefined}>{line}</span>)}</h2>
  </>;
}

function EvidenceImage({ item, className = '', kind = 'photo' }) {
  return <figure className={[styles.evidence, className].join(' ')} data-story-media data-media-kind={kind}>
    <div className={styles.mediaFrame} data-parallax><img src={item.src} width={item.width} height={item.height} alt={item.alt} loading="lazy" /></div>
    <figcaption><span>{item.figure}</span><p>{item.caption}</p></figcaption>
  </figure>;
}

function Paragraphs({ paragraphs }) {
  return paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>);
}

export default function Page() {
  return <>
    <CinematicExperience />
    <a href="#main" className={styles.skip}>Skip to the study</a>
    <header className={styles.masthead}>
      <span className={styles.owner}>{review.owner}<span aria-hidden="true"> / </span><span className={styles.discipline}>RESEARCH</span></span>
    </header>
    <main id="main" className={styles.story} data-story-root>
      <section id="overview" className={[styles.chapter, styles.overview].join(' ')} data-story-chapter="overview" data-layout="left" aria-labelledby="project-title">
        <div className={styles.chapterInner}>
          <div className={styles.openingCopy} data-story-panel>
            <div className={styles.openingLabel}><Glyph /><span>{story.overview.eyebrow}</span></div>
            <h1 id="project-title" aria-label={review.title} data-story-heading>{review.hero.titleLines[0]}<span>{review.hero.titleLines[1]}</span></h1>
            <p className={styles.subtitle}>{review.hero.subtitle}</p>
            <p className={styles.openingText}>{story.overview.introduction}</p>
            <p className={styles.projectType}>{review.projectType}<span aria-hidden="true"> — </span>{review.institution}</p>
          </div>
          <div className={styles.scrollCue} aria-hidden="true"><span className={styles.scrollLine} />{story.overview.scrollCue}</div>
        </div>
      </section>

      <section id="form" className={[styles.chapter, styles.form].join(' ')} data-story-chapter="form" data-layout="left" aria-labelledby="form-heading">
        <div className={styles.chapterInner}>
          <div className={styles.copy} data-story-panel>
            <Heading number="01" label={story.form.label} lines={story.form.heading} id="form-heading" kind="form" />
            <Paragraphs paragraphs={story.form.paragraphs} />
            <p className={styles.marginNote}>{story.form.aside}</p>
          </div>
          <div className={styles.spatialNotation} aria-hidden="true"><span /><p>LOCAL OPENING<br />CONTINUOUS SURFACE</p></div>
        </div>
      </section>

      <section id="system" className={[styles.chapter, styles.system].join(' ')} data-story-chapter="system" data-layout="left" aria-labelledby="system-heading">
        <div className={styles.chapterInner}>
          <div className={styles.copy} data-story-panel>
            <Heading number="02" label={story.system.label} lines={story.system.heading} id="system-heading" kind="system" />
            <Paragraphs paragraphs={story.system.paragraphs} />
            <ol className={styles.methodSequence}>{story.system.sequence.map((step, index) => <li key={step}><span>{String(index + 1).padStart(2, '0')}</span>{step}</li>)}</ol>
          </div>
          <EvidenceImage item={story.media.geometry} className={styles.geometryImage} kind="diagram" />
        </div>
      </section>

      <section id="pattern" className={[styles.chapter, styles.pattern].join(' ')} data-story-chapter="pattern" data-layout="left" aria-labelledby="pattern-heading">
        <div className={styles.chapterInner}>
          <div className={styles.copy} data-story-panel>
            <Heading number="03" label={story.pattern.label} lines={story.pattern.heading} id="pattern-heading" kind="system" />
            <Paragraphs paragraphs={story.pattern.paragraphs} />
            <p className={styles.smallNote}>{story.pattern.note}</p>
          </div>
          <EvidenceImage item={story.media.library} className={styles.libraryImage} kind="diagram" />
        </div>
      </section>

      <section id="make" className={[styles.chapter, styles.make].join(' ')} data-story-chapter="make" data-layout="right" aria-labelledby="make-heading">
        <div className={styles.chapterInner}>
          <EvidenceImage item={story.media.connection} className={styles.connectionImage} />
          <div className={styles.copy} data-story-panel>
            <Heading number="04" label={story.make.label} lines={story.make.heading} id="make-heading" kind="make" />
            <Paragraphs paragraphs={story.make.paragraphs} />
            <dl className={styles.measurements}>{story.make.measurements.map(measurement => <div key={measurement.label}><dt>{measurement.label}</dt><dd>{measurement.value}</dd></div>)}</dl>
            <p className={styles.smallNote}>{story.make.note}</p>
          </div>
        </div>
      </section>

      <section id="validation" className={[styles.chapter, styles.validation].join(' ')} data-story-chapter="validation" data-layout="left" aria-labelledby="validation-heading">
        <div className={styles.chapterInner}>
          <div className={styles.copy} data-story-panel>
            <Heading number="05" label={story.validation.label} lines={story.validation.heading} id="validation-heading" kind="make" />
            <Paragraphs paragraphs={story.validation.paragraphs} />
            <p className={styles.smallNote}>{story.validation.note}</p>
          </div>
          <EvidenceImage item={story.media.prototype} className={styles.prototypeImage} />
        </div>
      </section>

      <section id="credits" className={[styles.chapter, styles.credits].join(' ')} data-story-chapter="credits" data-layout="left" aria-labelledby="credits-heading">
        <div className={styles.chapterInner}>
          <div className={styles.closingCopy} data-story-panel>
            <Heading number="06" label={story.credits.label} lines={story.credits.heading} id="credits-heading" kind="form" />
            <p className={styles.closingSummary}>{story.credits.summary}</p>
            <p>{story.credits.contribution}</p>
            <p className={styles.smallNote}>{story.credits.collaboration}</p>
            <p className={styles.smallNote}>{story.credits.limitation}</p>
            <details className={styles.sourceNotes}>
              <summary>Source notes & credits</summary>
              <p>{review.credits.media}</p><p>{review.credits.sourceEdition} {review.yearNote}</p>
              <p>Owner-authorized local review. Public release of the project and individual media remains pending.</p>
              <div className={styles.sourceLinks} aria-label="Original source pages">{Object.values(story.media).map(item => <a key={item.figure} href={item.source} target="_blank" rel="noreferrer">{item.figure} <span aria-hidden="true">↗</span></a>)}</div>
            </details>
          </div>
          <footer className={styles.endnote}><span>{review.owner}</span><span>FORM / SYSTEM / MAKE</span></footer>
        </div>
      </section>
    </main>
  </>;
}
