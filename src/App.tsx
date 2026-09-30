import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react'
import { OPENING_DISTANCE } from './opening/choreography'
import { OpeningController } from './opening/controller'
import { scrollDestination } from './opening/scroll'
import Terminal from './ui/Terminal'
import WorkspaceBackdrop from './ui/WorkspaceBackdrop'

export default function App() {
  const [controller] = useState(() => new OpeningController())
  const state = useSyncExternalStore(controller.subscribe, controller.getSnapshot)
  const scroll = useRef<HTMLDivElement>(null)
  const content = useRef<HTMLDivElement>(null)
  const progress = useRef<HTMLSpanElement>(null)
  const progressTrack = useRef<HTMLDivElement>(null)
  const root = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => controller.setReduced(media.matches)
    update()
    media.addEventListener('change', update)
    return () => { media.removeEventListener('change', update); controller.stop() }
  }, [controller])

  useEffect(() => {
    const update = (p: number) => {
      if (progress.current) progress.current.textContent = String(Math.round(p * 100)).padStart(3, '0')
      if (progressTrack.current) progressTrack.current.style.setProperty('--progress', String(p))
      if (root.current) { root.current.dataset.progress = p.toFixed(4); root.current.style.setProperty('--opening', String(p)) }
      // Skip/expand buttons also position the scroll source at the endpoint,
      // so the next upward wheel event can immediately reverse the expansion.
      if (p === 1 && scroll.current && scroll.current.scrollTop !== OPENING_DISTANCE) scroll.current.scrollTop = OPENING_DISTANCE
      if (p === 0 && controller.target === 0 && scroll.current) scroll.current.scrollTop = 0
    }
    update(controller.progress)
    return controller.onFrame(update)
  }, [controller])

  useEffect(() => {
    let wheelOwner: 'scene' | 'content' | null = null
    let origin: [number, number] = [0, 0]
    const releaseOwner = (event: PointerEvent) => {
      if (Math.hypot(event.clientX - origin[0], event.clientY - origin[1]) > 8) wheelOwner = null
    }
    const claimPointer = () => { wheelOwner = null }
    let touchY: number | null = null
    let touchOpening = false
    const touchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1 || (event.target as Element).closest('dialog')) { touchY = null; return }
      touchY = event.touches[0].clientY
      touchOpening = false
    }
    const touchMove = (event: TouchEvent) => {
      if (touchY === null || event.touches.length !== 1) return
      const delta = touchY - event.touches[0].clientY
      touchY = event.touches[0].clientY
      const inTerminal = Boolean((event.target as Element).closest('.terminal'))
      if (!inTerminal && !touchOpening) return
      const destination = scrollDestination({ delta, inTerminal, contentTop: content.current?.scrollTop ?? 0,
        completed: controller.getSnapshot().completed, sceneGesture: touchOpening, reduced: controller.getSnapshot().reduced })
      if (destination === 'opening') { event.preventDefault(); touchOpening = true; scroll.current?.scrollBy(0, delta) }
    }
    const touchEnd = () => { touchY = null; touchOpening = false }
    // Keep a background gesture with the scene as the window grows under it.
    // Moving or clicking the pointer starts a fresh ownership decision.
    const wheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.metaKey || (event.target as Element).closest('dialog')) return
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return
      const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1)
      const inTerminal = Boolean((event.target as Element).closest('.terminal'))
      if (!wheelOwner) {
        wheelOwner = inTerminal ? 'content' : 'scene'
        origin = [event.clientX, event.clientY]
      }
      const destination = scrollDestination({ delta, inTerminal, contentTop: content.current?.scrollTop ?? 0,
        completed: controller.getSnapshot().completed, sceneGesture: wheelOwner === 'scene', reduced: controller.getSnapshot().reduced })
      wheelOwner = destination === 'opening' ? 'scene' : 'content'
      if (destination === 'opening') {
        event.preventDefault()
        scroll.current?.scrollBy(0, delta)
      } else if (destination === 'content') { event.preventDefault(); content.current?.scrollBy(0, delta) }
    }
    const key = (event: KeyboardEvent) => {
      if (!controller.getSnapshot().completed || event.ctrlKey || event.metaKey || event.altKey) return
      if ((event.target as Element).closest('.terminal, button, input')) return
      const steps: Record<string, number> = { ArrowDown: 48, ArrowUp: -48, PageDown: window.innerHeight * 0.7, PageUp: -window.innerHeight * 0.7, ' ': window.innerHeight * (event.shiftKey ? -0.7 : 0.7), Home: -1e6, End: 1e6 }
      if (event.key in steps) {
        event.preventDefault()
        const delta = steps[event.key]
        const destination = scrollDestination({ delta, inTerminal: false, contentTop: content.current?.scrollTop ?? 0,
          completed: true, sceneGesture: false, reduced: controller.getSnapshot().reduced })
        if (destination === 'opening') scroll.current?.scrollBy(0, delta)
        else content.current?.scrollBy(0, delta)
      }
    }
    window.addEventListener('wheel', wheel, { passive: false, capture: true })
    window.addEventListener('pointermove', releaseOwner)
    window.addEventListener('pointerdown', claimPointer)
    window.addEventListener('keydown', key)
    window.addEventListener('touchstart', touchStart, { passive: true, capture: true })
    window.addEventListener('touchmove', touchMove, { passive: false, capture: true })
    window.addEventListener('touchend', touchEnd)
    window.addEventListener('touchcancel', touchEnd)
    return () => {
      window.removeEventListener('wheel', wheel, true)
      window.removeEventListener('pointermove', releaseOwner)
      window.removeEventListener('pointerdown', claimPointer)
      window.removeEventListener('keydown', key)
      window.removeEventListener('touchstart', touchStart, true)
      window.removeEventListener('touchmove', touchMove, true)
      window.removeEventListener('touchend', touchEnd)
      window.removeEventListener('touchcancel', touchEnd)
    }
  }, [controller])

  return <main ref={root} className="experience" data-progress="0" data-completed={state.completed}>
    <a className="skip-link" href="#portfolio-content" onClick={event => { event.preventDefault(); controller.finish(); content.current?.focus() }}>Skip to portfolio</a>
    <WorkspaceBackdrop />
    <div className="scene-vignette" aria-hidden="true" />
    <div ref={scroll} className="opening-scroll" tabIndex={0} aria-label="Workspace transition. Scroll down to expand, up to return. Or use View work to skip." onScroll={event => controller.seek(event.currentTarget.scrollTop / OPENING_DISTANCE)}>
      <div style={{ height: `calc(100% + ${OPENING_DISTANCE}px)` }} />
    </div>
    <header className="site-header">
      <div className="wordmark"><span className="brand-symbol" aria-hidden="true">J<span>H</span></span><span>JOSH<span className="wordmark-light">SUAN</span></span></div>
      <span className="site-context">PORTFOLIO / WORKSPACE</span>
      {!state.completed ? <button className="enter-button" onClick={controller.finish}>View work <span aria-hidden="true">↗</span></button> : <span className="view-status"><span className="status-dot" /> Independent portfolio</span>}
    </header>
    <Terminal controller={controller} bodyRef={content} />
    <footer className="scene-footer">
      <div className="scroll-instruction"><span className="scroll-arrow" aria-hidden="true">{state.reduced ? '↓' : state.completed ? '↑' : '↓'}</span><div>{state.reduced ? 'SCROLL TO READ' : state.completed ? 'SCROLL UP TO RETURN' : 'SCROLL TO OPEN'}<span>{state.reduced ? 'Scroll inside the window to browse the portfolio.' : state.completed ? 'At the top of the content, keep scrolling up.' : 'Scroll outside the window, or select View work.'}</span></div></div>
      <div className="sequence-status" aria-hidden="true"><span className="phase-label">{state.phase}</span><div ref={progressTrack} className="progress-track"><i /></div><span><span ref={progress}>000</span> / 100</span></div>
    </footer>
    <span className="sr-only" role="status">{state.reduced ? 'Workspace expanded. Scroll to read the portfolio.' : state.completed ? 'Workspace expanded. Scroll up from the top of the content to return.' : ''}</span>
  </main>
}
