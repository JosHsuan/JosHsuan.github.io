import { clamp, phaseAt } from './choreography.ts'

type Snapshot = { completed: boolean; phase: string; reduced: boolean }

export class OpeningController {
  progress = 0
  target = 0
  private raf = 0
  private last = 0
  private snapshot: Snapshot = { completed: false, phase: phaseAt(0), reduced: false }
  private listeners = new Set<() => void>()
  private frames = new Set<(p: number) => void>()
  getSnapshot = () => this.snapshot
  subscribe = (callback: () => void) => { this.listeners.add(callback); return () => { this.listeners.delete(callback) } }
  onFrame = (callback: (p: number) => void) => { this.frames.add(callback); return () => { this.frames.delete(callback) } }

  private publish() {
    const phase = phaseAt(this.progress)
    const completed = this.progress === 1
    if (phase !== this.snapshot.phase || completed !== this.snapshot.completed) {
      this.snapshot = { ...this.snapshot, phase, completed }
      this.listeners.forEach(fn => fn())
    }
    this.frames.forEach(fn => fn(this.progress))
  }

  seek = (p: number) => {
    if (this.snapshot.reduced) return
    this.target = clamp(p)
    if (this.target === this.progress && !this.raf) return
    if (!this.raf) { this.last = performance.now(); this.raf = requestAnimationFrame(this.tick) }
  }

  private tick = (now: number) => {
    this.raf = 0
    const dt = Math.min((now - this.last) / 1000, 0.05)
    this.last = now
    const delta = this.target - this.progress
    this.progress += delta * (1 - Math.exp(-22 * dt))
    if (Math.abs(this.target - this.progress) < 0.00012) this.progress = this.target
    this.publish()
    if (this.progress !== this.target) this.raf = requestAnimationFrame(this.tick)
  }

  finish = () => {
    this.stop()
    this.progress = this.target = 1
    this.publish()
  }

  setReduced = (reduced: boolean) => {
    this.snapshot = { ...this.snapshot, reduced }
    this.listeners.forEach(fn => fn())
    if (reduced) this.finish()
  }

  replay = () => {
    if (this.snapshot.reduced) return
    this.stop()
    this.progress = this.target = 0
    this.snapshot = { ...this.snapshot, completed: false, phase: phaseAt(0) }
    this.listeners.forEach(fn => fn())
    this.frames.forEach(fn => fn(0))
  }

  stop = () => { cancelAnimationFrame(this.raf); this.raf = 0 }
}
