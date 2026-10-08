/** Animation Cinematographer: original geometry-dependent camera proposal.
 * Native reading progress is the only semantic input. Pointer decoration is composed
 * here before the caller's single camera write. No clock, mesh motion, or Theatre JSON.
 */
export const THESIS_MODEL_REVISION = 'c56dfda835e6538ad360f76967ba65603ff48d055228a7d400a2293554bbb058';
export const THESIS_MODEL_BOUNDS = Object.freeze({ min: Object.freeze([-1.18810498046875, 0, -1.5502127685546876]), max: Object.freeze([1.18810498046875, 0.7248569269180298, 1.5502127685546876]) });
export const CINEMATIC_CHAPTERS = Object.freeze(['overview', 'form', 'system', 'pattern', 'make', 'validation', 'credits']);
// Current shell/base framing uses verified combined bounds, with no dependency
// on the historical private shell-only support vertices.
export const THESIS_FRAMING_HULL = Object.freeze([]);
const rad = n => n * Math.PI / 180;
const clamp = (n, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, Number.isFinite(n) ? n : 0));
const ease = n => { const t = clamp(n); return t ** 3 * (10 + t * (-15 + 6 * t)); };
const mix = (a, b, t) => a + (b - a) * t;
const mixV = (a, b, t) => a.map((v, i) => mix(v, b[i], t));
const add = (a, b) => a.map((v, i) => v + b[i]);
const sub = (a, b) => a.map((v, i) => v - b[i]);
const mul = (a, s) => a.map(v => v * s);
const dot = (a, b) => a.reduce((sum, v, i) => sum + v * b[i], 0);
const length = a => Math.hypot(...a);
const unit = a => mul(a, 1 / length(a));
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const direction = (az, el) => [Math.sin(rad(az)) * Math.cos(rad(el)), Math.sin(rad(el)), Math.cos(rad(az)) * Math.cos(rad(el))];
const corners = b => Array.from({ length: 8 }, (_, mask) => b.min.map((v, i) => mask & (1 << i) ? b.max[i] : v));
const definitions = [
  { az: 58, el: 20, d: 1.95, fov: 34, focus: [0.06, 0.02, 0], shift: [0.34, -0.06], full: false, dim: 1, surface: 0, purpose: 'Sculptural opening; intentional edge crop' },
  { az: 32, el: 25, d: 2.4, fov: 38, focus: [0, 0, 0], shift: [0.38, -0.06], full: true, dim: 1, surface: 0, purpose: 'Whole assembled geometry' },
  { az: 5, el: 34, d: 2.2, fov: 36, focus: [0.10, 0.15, 0.15], shift: [0.30, -0.04], full: false, dim: 0.38, surface: 0.35, purpose: 'Openings and curvature behind method evidence' },
  { az: -16, el: 43, d: 1.65, fov: 36, focus: [0.20, 0.18, 0.18], shift: [0.28, -0.02], full: false, dim: 0.46, surface: 0.65, purpose: 'Closer real surface, not a bending simulation' },
  { az: -38, el: 22, d: 3.15, fov: 39, focus: [0, 0, 0], shift: [-0.30, -0.10], full: false, dim: 0.18, surface: 0, purpose: 'Quiet reverse composition behind construction photographs' },
  { az: 40, el: 20, d: 3.15, fov: 38, focus: [0, 0, 0], shift: [0.32, -0.08], full: false, dim: 0.16, surface: 0, purpose: 'Re-establish result behind prototype evidence' },
  { az: 58, el: 25, d: 2.85, fov: 38, focus: [0, 0, 0], shift: [0, 0.12], full: true, dim: 0.78, surface: 0, purpose: 'Complete model and ending hold' },
];
// Round 03 is an editorial camera score, not a requirement to display the complete
// object at every scroll position. Only the shared case opts into these new shots.
const exhibitionDefinitions = [
  {az: 64, el: 17, d: 1.7, fov: 35, focus: [.10, .10, 0], shift: [.52, -.06], mobileShift: [.28, -.20], full: false, dim: 1, surface: 0, purpose: 'Close satin-metal opening; deliberate edge crop'},
  {az: 30, el: 28, d: 2.35, fov: 38, focus: [0, 0, 0], shift: [.34, -.04], mobileShift: [.07, -.40], full: true, dim: 1, surface: 0, purpose: 'Complete source assembly as the spatial reference'},
  {az: -8, el: 30, d: 2.05, desktopD: 3.55, fov: 36, focus: [.05, .28, .12], shift: [.55, -.02], desktopShift: [.50, .44], mobileShift: [.32, -.28], full: false, dim: 1, surface: .25, purpose: 'Separated silhouette above method evidence; macro reserved for the next shot'},
  {az: -36, el: 18, d: 1.32, fov: 34, focus: [.20, .20, .12], shift: [-.42, .08], mobileShift: [-.55, -.30], full: false, dim: 1, surface: .5, purpose: 'Macro inspection; surface continues beyond the frame'},
  {az: -54, el: 17, d: 2.3, fov: 38, focus: [0, 0, 0], shift: [-3.8, -.12], mobileShift: [-3.8, -.2], full: false, dim: 0, surface: 0, purpose: 'Source departs completely; construction photograph owns the frame'},
  {az: 22, el: 24, d: 2.8, fov: 38, focus: [0, 0, 0], shift: [3.8, .10], mobileShift: [3.8, -.2], full: false, dim: 0, surface: 0, purpose: 'Source remains absent while the built-object evidence is read'},
  {az: 64, el: 23, d: 2.85, fov: 38, focus: [0, 0, 0], shift: [.05, .08], mobileShift: [0, -.26], full: true, dim: 1, surface: 0, purpose: 'Quiet complete silhouette returns for attribution'},
];

function validateBounds(b) {
  if (!b || !['min', 'max'].every(k => Array.isArray(b[k]) && b[k].length === 3 && b[k].every(Number.isFinite)) || b.min.some((v, i) => v > b.max[i]) || length(sub(b.max, b.min)) === 0) throw new RangeError('Expected nonempty finite Y-up model bounds');
}

function minimumFit(bounds, target, az, el, fov, aspect, shift, support = null) {
  const back = direction(az, el), right = unit(cross([0, 1, 0], back)), up = cross(back, right);
  const tanV = Math.tan(rad(fov) / 2), tanH = tanV * aspect;
  return Math.max(...(support ?? corners(bounds)).map(point => {
    const p = sub(point, target), z = dot(p, back);
    return z + Math.max(Math.abs(dot(p, right)) * 1.04 / (tanH * (1 - Math.abs(shift[0]))), Math.abs(dot(p, up)) * 1.04 / (tanV * (1 - Math.abs(shift[1]))));
  }));
}

function anchor(index, bounds, aspect, allowMeasuredHull, sharedStage = false) {
  const spec = (sharedStage ? exhibitionDefinitions : definitions)[index], half = mul(sub(bounds.max, bounds.min), 0.5), center = add(bounds.min, half), r = length(half);
  const mobile = clamp((1.1 - aspect) / 0.4);
  // Landscape tablets also need room for the method image below the source.
  // Portrait ratios (including 768/1024) keep their existing close composition.
  const desktop = clamp((aspect - .95) / .18);
  const focus = mixV(spec.focus, [0, 0, 0], mobile * 0.7), target = add(center, focus.map((v, i) => v * half[i]));
  const az = spec.az, el = mix(spec.el, index === 0 ? 36 : 42, mobile);
  const desktopShift = spec.desktopShift ? mixV(spec.shift, spec.desktopShift, desktop) : spec.shift;
  const fov = mix(spec.fov, 46, mobile), shift = mixV(desktopShift, spec.mobileShift ?? [0.07, index === 1 ? -0.48 : -0.26], mobile);
  const support = index === 1 && allowMeasuredHull ? THESIS_FRAMING_HULL : null;
  // Off-frame editorial shifts must not enter the full-fit denominator. They are
  // intentional screen translations, not a reason to push the source to infinity.
  const fittingShift = shift.map(value => clamp(value, -.72, .72));
  const fullDistance = minimumFit(bounds, target, az, el, fov, aspect, fittingShift, support);
  // Small screens retain almost the full surface; mobile storytelling belongs to
  // clear chapter layers rather than making a shallow model fill a tall viewport.
  const mobileFit = spec.full ? 1 : sharedStage ? (index === 0 ? .58 : index === 3 ? .5 : .7) : index === 0 ? .68 : .88;
  const distanceRatio = spec.desktopD ? mix(spec.d, spec.desktopD, desktop) : spec.d;
  let distance = mix(r * distanceRatio, fullDistance * mobileFit, mobile);
  if (spec.full) distance = Math.max(distance, fullDistance);
  if (index === 1 && allowMeasuredHull) {
    // Keep this revision a controlled enlargement of the reviewed FORM framing.
    // Exact hull fit alone made the portrait subject touch the footer region.
    const previousShift = mixV(spec.shift, [0.07, -0.26], mobile);
    const previousFit = minimumFit(bounds, target, az, el, fov, aspect, previousShift);
    const previousDistance = Math.max(mix(r * 3.05, previousFit, mobile), previousFit);
    distance = Math.max(distance, previousDistance / 1.2);
  }
  return { az, el, fov, shift, target, distance, dim: spec.dim, surface: spec.surface };
}

export function cinematicChapter(value) {
  const u = clamp(value), index = Math.min(CINEMATIC_CHAPTERS.length - 1, Math.floor(u * CINEMATIC_CHAPTERS.length));
  return { id: CINEMATIC_CHAPTERS[index], index, phase: u === 1 ? 1 : u * CINEMATIC_CHAPTERS.length - index };
}

function blendAt(value) {
  const c = cinematicChapter(value);
  if (c.phase < 0.2 && c.index > 0) return { a: c.index - 1, b: c.index, t: ease((c.phase + 0.2) / 0.4) };
  if (c.phase > 0.8 && c.index < 6) return { a: c.index, b: c.index + 1, t: ease((c.phase - 0.8) / 0.4) };
  return { a: c.index, b: c.index, t: 0 };
}

/**
 * u = (chapterIndex + actualSectionPhase) / 7, not a time value.
 * pointer x/y are bounded -1..1 decoration; caller may damp only this input.
 * Apply viewOffsetNormalized with setViewOffset(W,H,W*x,H*y,W,H).
 */
export function sampleCinematicPose(value, aspect, pointer = { x: 0, y: 0 }, options = {}) {
  if (!(aspect > 0) || !Number.isFinite(aspect)) throw new RangeError('A finite positive canvas aspect is required');
  const bounds = options.bounds ?? THESIS_MODEL_BOUNDS; validateBounds(bounds);
  const revision = options.modelRevision ?? THESIS_MODEL_REVISION;
  const allowMeasuredHull = THESIS_FRAMING_HULL.length > 0 && revision === THESIS_MODEL_REVISION && ['min', 'max'].every(k => bounds[k].every((v, i) => Math.abs(v - THESIS_MODEL_BOUNDS[k][i]) < 1e-8));
  const u = clamp(value), chapter = cinematicChapter(u), reducedMotion = options.reducedMotion === true;
  const slot = clamp(u * 7 - .5, 0, 6), from = Math.floor(slot);
  // The shared response has already authored the transition and hold curve.
  const blend = reducedMotion ? { a: 6, b: 6, t: 0 } : options.sharedStage ? {a: from, b: Math.min(6, from + 1), t: slot - from} : blendAt(u);
  const a = anchor(blend.a, bounds, aspect, allowMeasuredHull, options.sharedStage), b = anchor(blend.b, bounds, aspect, allowMeasuredHull, options.sharedStage), t = blend.t;
  const decoration = reducedMotion ? [0, 0] : [clamp(pointer?.x, -1, 1) * 1.25, clamp(pointer?.y, -1, 1) * 0.8];
  const az = mix(a.az, b.az, t) + decoration[0], el = mix(a.el, b.el, t) + decoration[1];
  const target = mixV(a.target, b.target, t), distance = mix(a.distance, b.distance, t), back = direction(az, el);
  const position = add(target, mul(back, distance)), shift = mixV(a.shift, b.shift, t), fov = mix(a.fov, b.fov, t);
  const r = length(sub(bounds.max, bounds.min)) / 2;
  const depths = corners(bounds).map(point => dot(sub(position, point), back));
  const sourcePresence = reducedMotion || !options.sharedStage ? 1 : slot >= 4 - 1e-9 && slot <= 5 + 1e-9 ? 0 : 1;
  const atHold = Math.abs(slot - Math.round(slot)) < 1e-8;
  const framingIntent = sourcePresence === 0 ? 'evidence-absence' : reducedMotion || atHold && [1, 6].includes(Math.round(slot)) ? 'held-source' : atHold && slot === 0 ? 'hero-crop' : 'transition-crop';
  const currentDefinitions = options.sharedStage ? exhibitionDefinitions : definitions;
  return {
    position, target, up: [0, 1, 0], fov, aspect,
    near: Math.max(r * 0.0001, Math.min(...depths) * 0.08), far: Math.max(...depths) + r * 2,
    compositionNDC: shift, viewOffsetNormalized: { x: -shift[0] / 2, y: shift[1] / 2 },
    progress: u, chapter, transition: { from: CINEMATIC_CHAPTERS[blend.a], to: CINEMATIC_CHAPTERS[blend.b], blend: t },
    modelVisibility: reducedMotion ? 0.32 : options.sharedStage ? sourcePresence : mix(a.dim, b.dim, t), sourcePresence, framingIntent,
    surfaceEmphasis: reducedMotion ? 0 : mix(a.surface, b.surface, t),
    pointerDegrees: decoration, owner: 'cinematic-composite', kind: reducedMotion ? 'fixed-reduced-motion' : 'procedural-native-scroll',
    cropIntent: sourcePresence === 0 ? 'intentional source absence; scene remains' : reducedMotion ? 'whole model' : currentDefinitions[chapter.index].full ? 'whole model at chapter hold' : 'intentional sculptural crop or background framing',
    purpose: currentDefinitions[reducedMotion ? 6 : chapter.index].purpose,
    modelRevision: revision, framingEvidence: allowMeasuredHull ? 'audited-real-mesh-convex-support' : 'conservative-bounding-box',
  };
}

/** Measured chapter start offsets plus final end offset; no DOM reads or scroll capture. */
export function cinematicProgressFromAnchors(scrollY, offsets) {
  if (!Number.isFinite(scrollY) || !Array.isArray(offsets) || offsets.length !== 8 || !offsets.every(Number.isFinite) || offsets.some((v, i) => i && v <= offsets[i - 1])) throw new RangeError('Supply seven measured section starts plus an increasing end offset');
  if (scrollY <= offsets[0]) return 0;
  if (scrollY >= offsets[7]) return 1;
  const i = offsets.findIndex((v, index) => index < 7 && scrollY >= v && scrollY < offsets[index + 1]);
  return (i + (scrollY - offsets[i]) / (offsets[i + 1] - offsets[i])) / 7;
}

export const sample = sampleCinematicPose;
