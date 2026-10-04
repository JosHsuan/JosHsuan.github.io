import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Link, NavLink, Route, Routes, useLocation, useSearchParams } from 'react-router-dom'
import { awards, capabilities, education, experience, filters, profile, projects, publications } from './data/portfolio'
import type { Project } from './data/types'
import ProjectDiagram from './components/ProjectDiagram'

const MethodScene = lazy(() => import('./components/MethodScene'))
const arrow = <span aria-hidden="true">↗</span>
function External({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return <a href={href} className={className} target={href.startsWith('https://') ? '_blank' : undefined} rel={href.startsWith('https://') ? 'noopener noreferrer' : undefined}>{children}{arrow}</a>
}
function PageState() {
  const { pathname } = useLocation()
  const previousPath = useRef(pathname)
  useEffect(() => {
    const path = pathname === '/' ? '/' : `${pathname.replace(/\/$/, '')}/`
    const p = projects.find(p => path === `/projects/${p.slug}/`)
    const title = p?.title || ({ '/': 'Design & computation', '/about/': 'About', '/projects/': 'Projects', '/research/': 'Research & development', '/cv/': 'CV', '/contact/': 'Contact' }[path] || 'Page not found')
    const description = p?.summary || ({ '/projects/': 'Computational design, architecture, digital fabrication and software projects.', '/research/': 'Research, computational workflows and digital fabrication development.', '/cv/': 'Professional experience, education, skills, publications and awards.', '/contact/': 'Contact for computational design, research and design technology collaboration.' }[path] || profile.introduction)
    document.title = `${title} — Chia-Hsuan Chao`
    document.querySelector('meta[name="description"]')?.setAttribute('content', description)
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', document.title)
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', description)
    document.querySelector('meta[property="og:type"]')?.setAttribute('content', p ? 'article' : 'website')
    const canonicalUrl = `https://JosHsuan.github.io${path}`
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', canonicalUrl)
    document.querySelector('meta[property="og:url"]')?.setAttribute('content', canonicalUrl)
    window.scrollTo(0, 0)
    const main = document.getElementById('main-content')
    if (previousPath.current !== pathname && main && !location.hash) main.focus({ preventScroll: true })
    previousPath.current = pathname
  }, [pathname])
  return null
}
function Header() {
  const [open, setOpen] = useState(false)
  const menuButton = useRef<HTMLButtonElement>(null)
  const location = useLocation()
  useEffect(() => setOpen(false), [location.pathname])
  useEffect(() => {
    if (!open) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setOpen(false); menuButton.current?.focus() }
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [open])
  return <header className="site-header">
    <Link to="/" className="wordmark" aria-label="Chia-Hsuan Chao home">JOSHSUAN <span>CHAO</span></Link>
    <button ref={menuButton} className="menu-toggle" aria-expanded={open} aria-controls="primary-nav" onClick={() => setOpen(!open)}>{open ? 'Close menu' : 'Menu'}</button>
    <nav id="primary-nav" aria-label="Primary" className={open ? 'is-open' : ''}>
      {[['/', 'Home'], ['/about/', 'About'], ['/projects/', 'Projects'], ['/research/', 'Research'], ['/cv/', 'CV'], ['/contact/', 'Contact']].map(([to, label]) => <NavLink key={to} to={to} end={to === '/'}>{label}</NavLink>)}
    </nav>
  </header>
}
function Card({ project: p, index }: { project: Project; index: number }) {
  return <article className="project-card" data-testid="project-card">
    <Link to={`/projects/${p.slug}/`} className="card-image" tabIndex={-1} aria-hidden="true">{p.media.images.length ? <img src={p.media.images[0].src} width={p.media.images[0].width} height={p.media.images[0].height} alt="" loading="lazy" decoding="async" /> : <ProjectDiagram kind={p.scene} accent={p.accent} label={`Illustrative method diagram for ${p.title}`} />}</Link>
    <div className="card-meta"><span>{String(index + 1).padStart(2, '0')} / {filters.find(f => f.id === p.category)?.label}</span><span>{p.year}</span></div>
    <h3><Link to={`/projects/${p.slug}/`}>{p.title}{arrow}</Link></h3>
    <p>{p.summary}</p>
    <span className="role-label">{p.role.type}</span>
  </article>
}
function Home() {
  const featured = projects.filter(p => p.featured)
  return <>
    <section className="home-intro" aria-labelledby="home-title">
      <p className="eyebrow">Chia-Hsuan Chao / Computational design</p>
      <h1 id="home-title">Thinking through<br /><em>geometry.</em></h1>
      <div className="intro-bottom"><p>{profile.introduction}</p><Link to="/projects/" className="text-link">Explore the work <span aria-hidden="true">↓</span></Link></div>
      <div className="hero-diagram"><ProjectDiagram kind="surface" accent="#ccd3a2" label="A computational surface study: intersecting curves describe a changing geometric field" /><div className="hero-caption"><span>Geometry → method → making</span><span>Illustrative surface study / 01</span></div></div>
    </section>
    <section className="section" aria-labelledby="selected-title"><div className="section-heading"><div><p className="eyebrow">01 / Selected work</p><h2 id="selected-title">From question<br />to <em>working method.</em></h2></div><Link to="/projects/" className="text-link">All projects {arrow}</Link></div>
      <div className="project-grid">{featured.map((p, i) => <Card key={p.id} project={p} index={i} />)}</div>
    </section>
    <section className="practice-section"><p className="eyebrow">02 / Practice</p><h2>Between digital models<br />and physical decisions.</h2><div className="capability-grid">{capabilities.map((c, i) => <div key={c.title}><span className="number">0{i + 1}</span><h3>{c.title}</h3><p>{c.description}</p></div>)}</div><Link to="/about/" className="text-link">More about my practice {arrow}</Link></section>
    <ContactStrip />
  </>
}
function Title({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return <div className="page-title"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1>{description && <p className="lede">{description}</p>}</div>
}
function Index({ research = false }: { research?: boolean }) {
  const [search, setSearch] = useSearchParams()
  const category = search.get('category') || 'all'
  const query = search.get('q') || ''
  const available = research ? projects.filter(p => ['research', 'computational', 'xr'].includes(p.category)) : projects
  const shown = available.filter(p => (category === 'all' || p.category === category) && `${p.title} ${p.summary} ${p.tools.join(' ')}`.toLowerCase().includes(query.toLowerCase()))
  function update(key: string, value: string) { const next = new URLSearchParams(search); if (!value || value === 'all') next.delete(key); else next.set(key, value); setSearch(next, { replace: true }) }
  return <><Title eyebrow={research ? 'Research / Development' : 'Index / Projects'} title={research ? 'Methods in development.' : 'Work, in detail.'} description={research ? 'Research and software connect geometric ideas to fabrication and interaction. Each project separates my contribution from the collective work.' : 'A selection of computational design, research, fabrication and software projects. Personal work and collaborative work are credited separately.'} />
    <div className="index-controls"><div className="filter-list" aria-label="Project categories">{filters.filter(f => !research || ['all', 'research', 'computational', 'xr'].includes(f.id)).map(f => <button key={f.id} data-testid="project-filter" aria-pressed={category === f.id} onClick={() => update('category', f.id)}>{f.label}</button>)}</div><label className="search-label"><span>Search projects</span><input type="search" value={query} onChange={e => update('q', e.target.value)} placeholder="Title, method or tool" /></label></div>
    <p className="result-count" role="status">{shown.length} {shown.length === 1 ? 'project' : 'projects'}</p><div className="project-grid">{shown.map((p, i) => <Card project={p} key={p.id} index={i} />)}</div>
    {!shown.length && <div className="empty-state"><h2>No projects match this search.</h2><button onClick={() => setSearch({})}>Clear filters</button></div>}
  </>
}
function Bullets({ items }: { items: string[] }) { return <ul className="prose-list">{items.map(s => <li key={s}>{s}</li>)}</ul> }
function Detail() {
  const { pathname } = useLocation()
  const slug = pathname.split('/').filter(Boolean)[1]
  const p = projects.find(p => p.slug === slug)
  if (!p) return <NotFound />
  const related = projects.filter(q => q.id !== p.id && q.category === p.category).slice(0, 2)
  return <article className="project-detail"><Link className="back-link" to="/projects/">← Project index</Link><Title eyebrow={`${filters.find(f => f.id === p.category)?.label} / ${p.year}`} title={p.title} description={p.summary} />
    <dl className="project-facts"><div><dt>Scope</dt><dd>{p.role.type}</dd></div><div><dt>Focus</dt><dd>{p.subtitle}</dd></div><div><dt>Tools</dt><dd>{p.tools.join(' / ')}</dd></div></dl>
    <div className="detail-visual">{p.media.images.length ? p.media.images.map(image => <figure key={image.src}><img src={image.src} width={image.width} height={image.height} alt={image.alt} loading="lazy" decoding="async" /><figcaption>{image.caption}</figcaption></figure>) : <figure><ProjectDiagram kind={p.scene} accent={p.accent} label={`Method illustration for ${p.title}; not an original project image`} /><figcaption>{p.media.label}</figcaption></figure>}</div>
    <div className="detail-body"><aside className="detail-nav" aria-label="On this page"><a href="#context">Context</a><a href="#role">My role</a><a href="#method">Method</a><a href="#process">Process</a><a href="#result">Result</a><a href="#credits">Credits</a></aside><div className="detail-prose">
      <section id="context"><p className="eyebrow">01 / Context</p><h2>The question.</h2><p>{p.context}</p></section>
      <section id="role"><p className="eyebrow">02 / My role</p><h2>My contribution.</h2><Bullets items={p.role.personal} />{p.role.team.length > 0 && <><h3>Shared work</h3><Bullets items={p.role.team} /></>}<p className="scope-note">{p.role.scope}</p></section>
      <section id="method"><p className="eyebrow">03 / Method</p><h2>Building the method.</h2><Bullets items={p.method} />{p.scene === 'subdivision' && <Suspense fallback={<p role="status">Loading the interactive method study…</p>}><MethodScene /></Suspense>}</section>
      <section id="process"><p className="eyebrow">04 / Process</p><h2>From rule to application.</h2><ol className="process-list">{p.process.map((s, i) => <li key={s}><span>0{i + 1}</span><p>{s}</p></li>)}</ol></section>
      <section id="result"><p className="eyebrow">05 / Result</p><h2>What the work produced.</h2><Bullets items={p.result} /></section>
      <section id="credits"><p className="eyebrow">06 / Collaboration and credits</p><h2>People and foundations.</h2><dl className="credit-list">{p.credits.map(c => <div key={c.name + c.role}><dt>{c.name}</dt><dd>{c.role}</dd></div>)}</dl>{p.links.length > 0 && <div className="related-links">{p.links.map(l => <External key={l.url} href={l.url}>{l.label}</External>)}</div>}</section>
    </div></div>
    {related.length > 0 && <section className="related-section"><p className="eyebrow">Continue exploring</p><div className="project-grid">{related.map((q, i) => <Card key={q.id} project={q} index={i} />)}</div></section>}
  </article>
}
function About() { return <><Title eyebrow="About / Chia-Hsuan Chao" title="Designing across scales." description={profile.headline} /><div className="about-grid"><div className="about-graphic"><ProjectDiagram kind="surface" accent="#71806b" label="Illustrative surface lines: geometry as a bridge between design and making" /><span className="graphic-caption">Design / computation / fabrication</span></div><div className="about-prose">{profile.about.map(p => <p key={p}>{p}</p>)}<Link to="/cv/" className="text-link">Experience and education {arrow}</Link></div></div><section className="section"><p className="eyebrow">Capabilities</p><div className="capability-grid">{capabilities.map(c => <div key={c.title}><h2>{c.title}</h2><p>{c.description}</p><p className="tools-line">{c.tools.join(' · ')}</p></div>)}</div></section><ContactStrip /></> }
function Cv() { return <><Title eyebrow="CV / Chia-Hsuan Chao" title="Experience & learning." description="Computational design, architectural geometry, digital fabrication and interactive software." /><div className="cv-actions"><a className="button-link" data-testid="cv-download" href={`${import.meta.env.BASE_URL}cv/chia-hsuan-chao-cv.pdf`} download="Chia-Hsuan-Chao-CV.pdf">Download CV (PDF) {arrow}</a><a href={profile.cvUrl} target="_blank" rel="noopener noreferrer" className="text-link">View / print CV {arrow}</a></div><div className="cv-layout"><div><section><h2>Professional experience</h2>{experience.map(e => <div className="timeline-entry" key={e.organization}><p className="eyebrow">{e.period}</p><h3>{e.organization}</h3><p className="timeline-role">{e.role}</p><Bullets items={e.description} /></div>)}</section><section><h2>Education</h2>{education.map(e => <div className="timeline-entry" key={e.institution}><p className="eyebrow">{e.period}</p><h3>{e.institution}</h3><p>{e.program}</p><p className="muted">{e.focus}</p></div>)}</section></div><div><section><h2>Skills & practice</h2>{capabilities.map(c => <div className="cv-skill" key={c.title}><h3>{c.title}</h3><p>{c.tools.join(' / ')}</p></div>)}</section><section><h2>Research & publications</h2>{publications.length ? publications.map(p => <div className="cv-publication" key={p.title}><p className="eyebrow">{p.year} / {p.venue}</p><h3>{p.url ? <External href={p.url}>{p.title}</External> : p.title}</h3><p>{p.authors.join(', ')}</p></div>) : <p>Research spans bending-active structures and extended-reality assembly workflows.</p>}<Link to="/research/" className="text-link">Read the research {arrow}</Link></section>{awards.length > 0 && <section><h2>Awards</h2>{awards.map(a => <div className="cv-award" key={a.title}><p className="eyebrow">{a.year}</p><h3>{a.title}</h3><p>{a.distinction}</p></div>)}</section>}</div></div></> }
function ContactStrip() { return <section className="contact-strip"><p className="eyebrow">A conversation starts here</p><h2>Have a question<br />worth exploring?</h2><Link to="/contact/" className="text-link">Get in touch {arrow}</Link></section> }
function Contact() { return <><Title eyebrow="Contact / Collaboration" title="Let's work through it." description="For computational design, research collaboration, architecture and digital fabrication." /><div className="contact-layout"><p>{profile.contactNote}</p><div className="contact-links">{profile.email && <External href={`mailto:${profile.email}`}>Email <span className="contact-value">{profile.email}</span></External>}<External href={profile.github}>GitHub <span className="contact-value">JosHsuan</span></External><Link to="/cv/">CV <span className="contact-value">Experience & skills</span>{arrow}</Link></div></div></> }
function NotFound() { return <div className="not-found"><Title eyebrow="404 / Page not found" title="This path ends here." description="The page may have moved, or the address may be incomplete." /><Link to="/projects/" className="button-link">Return to projects →</Link></div> }
function Footer() { return <footer className="site-footer"><Link to="/">Chia-Hsuan Chao / JosHsuan</Link><span>Geometry. Methods. Making.</span><External href={profile.github}>GitHub</External></footer> }
export default function App() { return <><a className="skip-link" href="#main-content">Skip to content</a><PageState /><Header /><main id="main-content" tabIndex={-1}><Routes><Route path="/" element={<Home />} /><Route path="/about" element={<About />} /><Route path="/projects" element={<Index />} /><Route path="/projects/:slug" element={<Detail />} /><Route path="/research" element={<Index research />} /><Route path="/cv" element={<Cv />} /><Route path="/contact" element={<Contact />} /><Route path="*" element={<NotFound />} /></Routes></main><Footer /></> }
