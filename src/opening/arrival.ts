import { clamp } from './choreography.ts'

export const INK_STEPS = 160
export const CACHE_STRIDE = 8
export const inkFrameAt = (progress: number) => Math.floor(clamp(progress) * INK_STEPS)
export function inkLifeAt(progress: number, birth: number, duration: number) {
  const age = (progress - birth) / duration
  return age < 0 || age >= 1 ? 0 : 1 - age
}

export function randomSequence(seed = 19) {
  return () => { seed = (Math.imul(1664525, seed) + 1013904223) | 0; return (seed >>> 0) / 4294967296 }
}

// A circular ink gesture and two loose strokes. Each seed records its emission
// point, birth progress and finite life; no random values are created at runtime.
export function createInkSeeds(count: number) {
  const random = randomSequence(487)
  const origins = new Float32Array(count * 4), timing = new Float32Array(count * 4)
  for (let i = 0; i < count; i++) {
    const s = random(), a = random(), b = random(), c = random()
    let x: number, y: number, z: number, birth: number
    if (i % 10 < 8) {
      const angle = s * Math.PI * 1.88 + 0.22
      const spikes = Math.pow(Math.max(0, Math.sin(angle * 7.0 + 1.2)), 8)
      const radius = 1.5 + Math.sin(angle * 5.0) * 0.05 + (a - 0.5) * (0.14 + spikes * 0.85)
      x = Math.cos(angle) * radius; y = Math.sin(angle) * radius * 0.91
      z = (b - 0.5) * (0.22 + spikes * 0.24)
      birth = 0.06 + s * 0.205 + c * 0.055
    } else {
      x = (s - 0.5) * 4.5
      y = Math.sin(s * 5.8) * 0.43 + (i % 2 ? -1.3 : 0.9) + (a - 0.5) * 0.035
      z = -0.3 + (b - 0.5) * 0.14
      birth = 0.19 + s * 0.15 + c * 0.025
    }
    origins.set([x, y, z, 1], i * 4)
    timing.set([birth, 0.26 + a * 0.21, b, c], i * 4)
  }
  return { origins, timing }
}
