export type Vec3 = [number, number, number]

export const OPENING_DISTANCE = 820
export const EXPANSION_START = 0
export const clamp = (n: number, min = 0, max = 1) => Math.min(max, Math.max(min, n))
export const mix = (a: number, b: number, t: number) => a + (b - a) * t
export const smooth = (t: number) => { const x = clamp(t); return x * x * x * (x * (x * 6 - 15) + 10) }
export const interval = (p: number, start: number, end: number) => smooth((p - start) / (end - start))
export const expansionAt = (p: number) => interval(p, EXPANSION_START, 1)
export const phaseAt = (p: number) => p === 0 ? 'Portfolio' : p < 1 ? 'Opening workspace' : 'Workspace'

export function cameraAt(p: number): Vec3 {
  const t = interval(p, 0.06, 0.60)
  return [mix(0, 0.42, t), mix(0, 0.06, t), mix(10.5, 9.8, t)]
}

export function panelRect(p: number, width: number, height: number) {
  const narrow = width < 720
  const short = height < 500
  const start = narrow
    ? { x: 18, y: height * 0.28, w: width - 36, h: height * 0.59 }
    : { x: width * 0.065, y: Math.max(short ? 64 : 80, height * 0.18), w: clamp(width * 0.39, 430, 560), h: Math.min(610, height * (short ? 0.62 : 0.70)) }
  const margin = narrow ? 14 : clamp(width * 0.045, 24, 78)
  const top = short ? 56 : narrow ? 64 : 70
  const end = { x: margin, y: top, w: width - margin * 2, h: height - top - (short ? 42 : 56) }
  const t = expansionAt(p)
  return { x: mix(start.x, end.x, t), y: mix(start.y, end.y, t), w: mix(start.w, end.w, t), h: mix(start.h, end.h, t) }
}
