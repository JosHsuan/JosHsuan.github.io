import {RESPONSE_CHAPTERS, sampleResponseScore} from './story-response.mjs';

const clamp = value => Math.min(1, Math.max(0, value));
const smoother = value => {const t = clamp(value); return clamp(t * t * t * (10 + t * (-15 + 6 * t)));};
const range = (value, from, to) => smoother((value - from) / (to - from));
function finite(value, name) {
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new TypeError(`${name} must be finite.`);
  return value;
}

/**
 * Pure foreground choreography sampled from the one shared visual response.
 * index is the chapter; elementIndex/count describe a heading-line or row group.
 * Translations are CSS pixels and rotations degrees. No opacity, clipping,
 * scroll mutation, clock, spring, camera pose or source-mesh transform is owned.
 * Bind transforms to inner planes. The shared pixel reading response moves the
 * entire information layer; these spatial cues never substitute for that travel.
 */
export function sampleEditorialScore({
  visualU,
  nativeU = visualU,
  energy = 0,
  direction = 0,
  holdWeight = 0,
  index = 0,
  elementIndex = 0,
  elementCount = 1,
  reducedMotion = false,
  light = false,
} = {}) {
  const visual = clamp(finite(visualU, 'Visual progress'));
  const native = clamp(finite(nativeU, 'Native progress'));
  const speed = clamp(finite(energy, 'Energy'));
  const signedDirection = Math.max(-1, Math.min(1, finite(direction, 'Direction')));
  const readingHold = clamp(finite(holdWeight, 'Reading hold weight'));
  if (!Number.isInteger(index) || index < 0 || index >= RESPONSE_CHAPTERS.length) throw new RangeError('Chapter index must be an integer from 0 to 6.');
  if (!Number.isInteger(elementCount) || elementCount < 1 || !Number.isInteger(elementIndex) || elementIndex < 0 || elementIndex >= elementCount) throw new RangeError('Element index must belong to a nonempty group.');

  const chapter = RESPONSE_CHAPTERS[index];
  const visualPhase = visual * 7 - index;
  const nativePhase = native * 7 - index;
  const rank = elementCount === 1 ? 0 : elementIndex / (elementCount - 1);
  const fan = elementCount === 1 ? 0 : rank - 0.5;
  // Every item aligns by the authored hold start and stays aligned for the
  // entire hold. Exit is staggered in reverse order; scrubbing is reversible.
  const entry = reducedMotion ? 1 : range(visualPhase, -0.28 + rank * 0.12, chapter.hold[0] - 0.1 + rank * 0.1);
  const exit = reducedMotion ? 0 : range(visualPhase, chapter.hold[1] + (1 - rank) * 0.08, 1.26 + (1 - rank) * 0.08);
  const incoming = 1 - entry;
  const dwell = entry * (1 - exit);
  const amplitude = reducedMotion ? 0 : light ? 0.45 : 1;
  const travel = (incoming + exit) * amplitude;
  // This is the stage's existing transition gate, not another remap of stageU.
  // Dynamic accents are zero on holds and at rest. Scene bindings may consume
  // the same values once, regardless of which foreground element is sampled.
  const transitionWeight = reducedMotion || light ? 0 : clamp(1 - sampleResponseScore(visual).dwellWeight);
  const materialLift = speed * transitionWeight;
  const flow = signedDirection * speed * (1 - readingHold) * amplitude;
  const approach = (incoming - exit) * amplitude;

  return {
    chapterId: chapter.id,
    visualPhase,
    nativeProgress: clamp(nativePhase),
    entry,
    dwell,
    exit,
    headingShift: (36 * incoming - 28 * exit) * amplitude,
    lineOffset: fan * 20 * travel,
    lineRotate: fan * 3.5 * travel,
    headingRotateX: approach * 3 + flow * 1.2,
    headingRotateY: -flow * 1.2,
    headingZ: travel * -26 + Math.abs(flow) * 10,
    bodyShift: (8 * incoming - 6 * exit) * amplitude,
    bodyRotateX: approach * 0.6 + flow * 0.4,
    bodyRotateY: -flow * 0.35,
    bodyZ: travel * -10,
    ruleProgress: clamp(visualPhase),
    mediaShift: (42 * incoming - 34 * exit) * amplitude,
    mediaScale: 1 - 0.035 * (1 - dwell) * amplitude,
    mediaRotateX: approach * 1.5 + flow * 1.5,
    mediaRotateY: -flow * 2,
    mediaZ: travel * -48 + Math.abs(flow) * 12,
    captionShift: (-6 * incoming + 5 * exit) * amplitude,
    glyphSpread: 6 * travel + 2 * materialLift,
    glyphRotate: (incoming - exit) * 3 * amplitude,
    methodShift: (8 * incoming - 6 * exit) * amplitude,
    // A reading indicator, never a percentage of measured project completion.
    methodProgress: clamp((visualPhase - rank * 0.45) / 0.45),
    holdWeight: readingHold,
    transitionWeight,
    lightSweep: signedDirection * materialLift,
    materialLift,
  };
}
