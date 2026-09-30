import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type RefObject } from 'react'
import { panelRect } from '../opening/choreography'
import type { OpeningController } from '../opening/controller'
import { categories, filterProjects, findProject, lab, PROFILE, projects } from '../content/portfolio'
import { routeFromLocation, routeKey } from '../navigation/routes'
import ProjectCard from './ProjectCard'
import CaseStudy from './CaseStudy'
import { About, Contact } from './Profile'

export default function Terminal({ controller, bodyRef }: { controller: OpeningController; bodyRef: RefObject<HTMLDivElement | null> }) {
  const panel = useRef<HTMLElement>(null)
  const [route, setRoute] = useState(() => routeFromLocation(window.location.hash, window.location.pathname))
  const [selection, setSelection] = useState<'selected' | 'all'>('selected')
  const [category, setCategory] = useState('All')
  const [query, setQuery] = useState('')
  const state = useSyncExternalStore(controller.subscribe, controller.getSnapshot)
  const held = useRef(false)
  const positions = useRef(new Map<string, number>())
  const previousRoute = useRef(routeKey(route))
  const firstRoute = useRef(true)
  const project = route.slug ? findProject(route.slug) : undefined
  const items = route.section === 'lab' ? lab : projects
  const missing = route.missing || Boolean(route.slug && (!project || !items.includes(project)))
  const visible = filterProjects(selection === 'selected' && !query && category === 'All' ? projects.filter(p => p.featured) : projects, category, query)

  useEffect(() => {
    const change = () => { positions.current.set(previousRoute.current, bodyRef.current?.scrollTop ?? 0); setRoute(routeFromLocation(window.location.hash, window.location.pathname)) }
    window.addEventListener('hashchange', change)
    return () => window.removeEventListener('hashchange', change)
  }, [bodyRef])

  useLayoutEffect(() => {
    const key = routeKey(route)
    previousRoute.current = key
    if (bodyRef.current) bodyRef.current.scrollTop = positions.current.get(key) ?? 0
    if (route.slug || route.section !== 'work' || window.location.hash) controller.finish()
    if (!firstRoute.current) panel.current?.querySelector<HTMLElement>('.page-heading')?.focus({ preventScroll: true })
    firstRoute.current = false
    document.title = `${project?.title ?? (route.section === 'work' ? 'Computational design, XR & fabrication' : route.section.charAt(0).toUpperCase() + route.section.slice(1))} — JosHsuan`
    const canonical = `https://joshsuan.github.io/${route.section === 'work' && !route.slug ? '' : `${routeKey(route)}/`}`
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', canonical)
    document.querySelector('meta[name="description"]')?.setAttribute('content', project?.summary ?? PROFILE.statement)
  }, [route, bodyRef, controller, project])

  useLayoutEffect(() => {
    let lastWidth = 0
    const update = () => {
      if (!panel.current || held.current) return
      const rect = panelRect(controller.progress, window.innerWidth, window.innerHeight)
      const body = bodyRef.current
      const top = body?.getBoundingClientRect().top ?? 0
      const anchor = body && body.scrollTop > 0 && lastWidth !== rect.w ? [...body.querySelectorAll<HTMLElement>('[data-reading-anchor]')].find(el => el.getBoundingClientRect().bottom > top) : undefined
      const before = anchor?.getBoundingClientRect().top ?? 0
      panel.current.style.left = `${rect.x}px`; panel.current.style.top = `${rect.y}px`
      panel.current.style.width = `${rect.w}px`; panel.current.style.height = `${rect.h}px`
      if (anchor && body) body.scrollTop += anchor.getBoundingClientRect().top - before
      lastWidth = rect.w
    }
    const release = () => { held.current = false; update() }
    update()
    const unsubscribe = controller.onFrame(update)
    window.addEventListener('resize', update); window.addEventListener('pointerup', release); window.addEventListener('pointercancel', release); window.addEventListener('blur', release)
    return () => { unsubscribe(); window.removeEventListener('resize', update); window.removeEventListener('pointerup', release); window.removeEventListener('pointercancel', release); window.removeEventListener('blur', release) }
  }, [controller, bodyRef])

  const resetReading = () => { if (bodyRef.current) bodyRef.current.scrollTop = 0 }
  return <section ref={panel} className="terminal" aria-label="Portfolio workspace" onPointerDown={() => { held.current = true }}>
    <div className="terminal-titlebar"><span className="window-marks" aria-hidden="true"><i /><i /><i /></span><span className="terminal-path">joshsuan — ~/{routeKey(route)}</span><button className="icon-button" aria-label={state.completed ? 'Return to compact workspace' : 'Expand workspace'} title={state.completed ? 'Return to compact workspace' : 'Expand workspace'} disabled={state.reduced && state.completed} onClick={state.completed ? controller.replay : controller.finish}><svg viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d={state.completed ? 'M3 7h4V3M11 3v4h4M15 11h-4v4M7 15v-4H3' : 'M3 7V3h4M11 3h4v4M15 11v4h-4M7 15H3v-4'} /></svg></button></div>
    <nav className="terminal-nav" aria-label="Portfolio sections">{(['work', 'lab', 'about', 'contact'] as const).map(section => <a key={section} href={`#/${section}`} aria-current={route.section === section ? 'page' : undefined}><span aria-hidden="true">/</span> {section}</a>)}<span className="nav-status"><span /> ready</span></nav>
    <div id="portfolio-content" ref={bodyRef} className="terminal-body" tabIndex={0} aria-label="Portfolio content"><div className="terminal-content">
      {missing ? <div className="empty-state"><p className="eyebrow">PATH NOT FOUND</p><h1 className="page-heading" tabIndex={-1}>Page not found.</h1><a className="primary-button" href="#/work">Browse projects ↗</a></div>
        : project ? <CaseStudy key={project.slug} project={project} section={route.section as 'work' | 'lab'} next={items[(items.indexOf(project) + 1) % items.length]} />
        : route.section === 'about' ? <About /> : route.section === 'contact' ? <Contact />
        : route.section === 'lab' ? <><header className="page-intro" data-reading-anchor><p className="eyebrow">LAB</p><h1 className="page-heading" tabIndex={-1}>Lab studies</h1><p className="intro-deck">Short studies in geometry, material simulation and additive manufacturing, including independent prototypes and collaborative workshops.</p></header><div className="project-grid lab-grid">{lab.map((p, index) => <ProjectCard key={p.slug} project={p} index={index} section="lab" />)}</div></>
        : <><header className="identity" data-reading-anchor><p className="eyebrow"><span className="prompt" aria-hidden="true">~ $</span> CHIA-HSUAN CHAO</p><h1 className="page-heading" tabIndex={-1}>{PROFILE.name}<span className="name-period">.</span></h1><p className="identity-description">Computational designer<br />XR developer</p><p className="identity-note">Research in adaptive geometry, fabrication processes and extended reality, with professional experience in facade rationalization and fabrication drawings.</p>{!state.completed && <button className="primary-button compact-entry" onClick={controller.finish}>View projects <span aria-hidden="true">↗</span></button>}</header>
          <section aria-labelledby="work-heading"><div className="section-label" data-reading-anchor><h2 id="work-heading"><span aria-hidden="true">↳</span> Work</h2><span>{String(visible.length).padStart(2, '0')} / {String(projects.length).padStart(2, '0')} PROJECTS</span></div>
            <div className="work-toolbar" data-reading-anchor><div className="view-switch" aria-label="Work selection"><button aria-pressed={selection === 'selected'} onClick={() => { setSelection('selected'); setCategory('All'); setQuery('') }}>Selected</button><button aria-pressed={selection === 'all'} onClick={() => setSelection('all')}>All projects</button></div><label className="search-field"><span aria-hidden="true">⌕</span><span className="sr-only">Search projects</span><input type="search" placeholder="Search the work" value={query} onChange={e => setQuery(e.target.value)} /></label></div>
            {(selection === 'all' || query) && <div className="category-filters" aria-label="Filter work by field">{['All', ...categories].map(value => <button key={value} aria-pressed={category === value} onClick={() => { setCategory(value); setSelection('all') }}>{value === 'All' ? 'All fields' : value}</button>)}</div>}<p className="results-announcement sr-only" role="status">{visible.length} projects found.</p>
            <div className="project-grid">{visible.map((p, index) => <ProjectCard key={p.slug} project={p} index={index} />)}</div>{!visible.length && <div className="empty-state" data-reading-anchor><h3>No matching projects.</h3><p>Try another field or search term.</p><button className="secondary-button" onClick={() => { setQuery(''); setCategory('All'); setSelection('all') }}>Clear filters</button></div>}
          </section></>}
      <footer className="terminal-end" data-reading-anchor><div><span aria-hidden="true">~</span> {PROFILE.fullName} / {PROFILE.name}<span className="footer-year">© {new Date().getFullYear()}</span></div><div><a href="#/contact">Contact ↗</a><a href="/credits.html" target="_blank" rel="noreferrer">Credits</a><button onClick={() => { resetReading(); bodyRef.current?.focus({ preventScroll: true }) }}>Back to top ↑</button></div></footer>
    </div></div>
    <div className="terminal-statusbar"><span><span className="status-dot" /> ~/{routeKey(route)}</span><span>{route.slug ? 'case study' : 'portfolio'} <span aria-hidden="true"> / UTF-8</span></span></div>
  </section>
}
