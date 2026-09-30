import { useEffect, useRef, useState } from 'react'
import type { Media, Project } from '../content/portfolio'
import { mediaUrl } from './ProjectCard'
import MotionMedia from './MotionMedia'

export default function CaseStudy({ project, section, next }: { project: Project; section: 'work' | 'lab'; next: Project }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [viewing, setViewing] = useState<Media | null>(null)
  const sectionMedia = (index: number) => {
    const item = project.sections[index]
    return item.media === undefined ? project.gallery.slice(index, index + 1) : project.gallery.filter(media => item.media?.includes(media.id))
  }
  const assignedMedia = new Set(project.sections.flatMap((_, index) => sectionMedia(index).map(media => media.id)))
  const sectionId = (index: number) => `case-${project.slug}-${index + 1}`
  const readSection = (index: number) => {
    const element = document.getElementById(sectionId(index))
    const body = element?.closest<HTMLElement>('.terminal-body')
    if (element && body) {
      const top = element.getBoundingClientRect().top - body.getBoundingClientRect().top + body.scrollTop - 24
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      body.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' })
    }
    element?.querySelector('h2')?.focus({ preventScroll: true })
  }
  const close = () => { dialog.current?.close(); setViewing(null) }
  useEffect(() => {
    if (!viewing) return
    dialog.current?.closest('.case-study')?.querySelectorAll('video').forEach(video => video.pause())
    if (!dialog.current?.open) dialog.current?.showModal()
  }, [viewing])
  const figure = (media: Media, hero = false) => <figure className={hero ? 'case-hero' : 'case-figure'} key={media.id} data-reading-anchor>
    {media.video ? <MotionMedia media={media} onEnlarge={() => setViewing(media)} /> : <button className={`figure-open${media.fit === 'contain' ? ' image-contain' : ''}`} onClick={() => setViewing(media)} aria-label={`Enlarge image: ${media.caption}`}>
      <img src={mediaUrl(media)} alt={media.alt} loading={hero ? 'eager' : 'lazy'} decoding="async" />
      <span className="image-open" aria-hidden="true">↗</span>
    </button>}
    <figcaption>{media.caption}<span>{media.credit}</span></figcaption>
  </figure>
  return <article className="case-study">
    <a className="back-link" href={`#/${section}`}><span aria-hidden="true">←</span> Back to {section === 'work' ? 'work' : 'Lab'}</a>
    <header className="case-heading" data-reading-anchor><p className="eyebrow">{project.category} <span> / {project.year}</span></p><h1 className="page-heading" tabIndex={-1}>{project.title}</h1><p className="case-subtitle">{project.subtitle}</p></header>
    {figure(project.cover, true)}
    <div className="case-overview" data-reading-anchor><p className="case-premise">{project.premise}</p><dl className="project-facts"><div><dt>Context</dt><dd>{project.context}</dd></div><div><dt>Location</dt><dd>{project.location}</dd></div><div><dt>My role</dt><dd>{project.role}</dd></div><div><dt>Tools & themes</dt><dd>{project.tags.join(' / ')}</dd></div></dl></div>
    {project.sections.length > 2 && <nav className="case-contents" aria-label="Case sections"><span className="eyebrow">CONTENTS</span>{project.sections.map((item, index) => <button key={item.title} onClick={() => readSection(index)}><span>{String(index + 1).padStart(2, '0')}</span>{item.title}</button>)}</nav>}
    <div className="case-sections">{project.sections.map((item, index) => <section key={item.title} id={sectionId(index)} className={`case-section${sectionMedia(index).length ? '' : ' case-section-no-media'}`} data-reading-anchor><div className="case-section-text"><span className="section-number">{String(index + 1).padStart(2, '0')}</span><h2 tabIndex={-1}>{item.title}</h2>{item.text.split('\n\n').map((paragraph, paragraphIndex) => <p key={paragraphIndex}>{paragraph}</p>)}</div>{sectionMedia(index).length > 0 && <div className="case-section-media">{sectionMedia(index).map(media => figure(media))}</div>}</section>)}</div>
    {project.gallery.filter(media => !assignedMedia.has(media.id)).map(media => figure(media))}
    <section className="case-credits" data-reading-anchor><h2>Credits & context</h2>{project.credits.map(credit => <p key={credit}>{credit}</p>)}{project.links && <div className="source-links">{project.links.map(link => <a key={link.url} href={link.url} target="_blank" rel="noreferrer">{link.label} <span aria-hidden="true">↗</span><span className="sr-only"> (opens in a new tab)</span></a>)}</div>}</section>
    <a className="next-project" href={`#/${section}/${next.slug}`} data-reading-anchor><span className="eyebrow">NEXT {section === 'lab' ? 'STUDY' : 'PROJECT'}</span><span>{next.title}</span><span aria-hidden="true">↗</span></a>
    <dialog ref={dialog} className="image-dialog" aria-label={viewing?.caption ?? 'Project media'} onCancel={() => setViewing(null)} onClick={event => { if (event.target === event.currentTarget) close() }}>{viewing && <><button className="dialog-close" onClick={close} autoFocus aria-label={`Close enlarged ${viewing.video ? 'video' : 'image'}`}>Close <span aria-hidden="true">×</span></button>{viewing.video ? <MotionMedia key={viewing.id} media={viewing} enlarged /> : <img src={mediaUrl(viewing)} alt={viewing.alt} />}<p>{viewing.caption}<span>{viewing.credit}</span></p></>}</dialog>
  </article>
}
