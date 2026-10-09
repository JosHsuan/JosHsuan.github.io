// The controller owns one viewport-scale scene plane. Its chapter trigger and
// held screen pose are independent of the information anchors moving past it.
// This module owns no DOM, camera, renderer, dimensions, RAF or clock.
export const CANVAS_CHAPTERS = Object.freeze(['overview', 'form', 'system', 'pattern', 'make', 'validation', 'credits']);
export const CANVAS_SCENE_PROBE = .62;
const RATE = 16;
const EPSILON = .025;
const clamp = value => Math.max(0, Math.min(1, value));
const smooth = value => {const t = clamp(value); return clamp(t * t * t * (10 + t * (-15 + 6 * t)));};

function validate({anchors, docY, viewport, forcedChapter}) {
  if (!Array.isArray(anchors) || anchors.length !== 8 || anchors.some((n, i) => !Number.isFinite(n) || i > 0 && n <= anchors[i - 1])) {
    throw new RangeError('Canvas holds require eight strictly increasing finite chapter boundaries.');
  }
  if (!Number.isFinite(docY)) throw new RangeError('Canvas document position must be finite.');
  if (!viewport || !['width', 'height'].every(key => Number.isFinite(viewport[key]) && viewport[key] > 0)) {
    throw new RangeError('Canvas holds require a finite positive viewport.');
  }
  if (forcedChapter !== undefined && forcedChapter !== null && !CANVAS_CHAPTERS.includes(forcedChapter)) {
    throw new RangeError('Forced Canvas chapter must be a known chapter id.');
  }
}

/** Pure target sampler. anchors are eight natural document chapter boundaries;
 * docY is supplied by the existing reading controller. Information reveal and
 * aria-current keep their own policy: do not replace them with this probe.
 * forcedChapter is reserved for explicit source inspection/navigation, never
 * the current information chapter on every tick. No DOM aperture is accepted.
 */
export function sampleCanvasHold(options, seekHold = null) {
  validate(options);
  const {anchors, docY, viewport, forcedChapter, reducedMotion = false, hold = false} = options;
  const focus = docY + viewport.height * CANVAS_SCENE_PROBE;
  let index = 0;
  while (index < 6 && focus >= anchors[index + 1]) index++;
  if (forcedChapter !== undefined && forcedChapter !== null) index = CANVAS_CHAPTERS.indexOf(forcedChapter);
  const chapter = CANVAS_CHAPTERS[index], span = anchors[index + 1] - anchors[index];
  const start = anchors[index] - viewport.height * CANVAS_SCENE_PROBE, end = start + span;
  const entry = Math.min(span * .18, viewport.height * .45);
  const exit = index === 6 ? 0 : Math.min(span * .20, viewport.height * .50);
  const holdStart = start + entry, holdEnd = end - exit;
  // A history/navigation seek may land in a transition band. Its useful still
  // becomes the nearby hold boundary, so the first real scroll cannot flash.
  const sameSeek = seekHold?.chapter === chapter;
  const entryEnd = sameSeek && seekHold.band === 'entry' ? Math.min(holdStart, seekHold.docY) : holdStart;
  const exitStart = sameSeek && seekHold.band === 'exit' ? Math.max(holdEnd, seekHold.docY) : holdEnd;
  const phase = clamp((docY - start) / span);
  let x = 0, y = 0, opacity = 1, mode = 'hold';
  if (chapter === 'make' || chapter === 'validation') {
    x = -viewport.width * 1.08; opacity = 0; mode = 'absent';
  } else if (!(reducedMotion || hold || forcedChapter !== undefined && forcedChapter !== null)) {
    if (docY < entryEnd) {
      const arrival = smooth((docY - start) / Math.max(.001, entryEnd - start));
      x = (1 - arrival) * viewport.width * .22;
      y = (1 - arrival) * viewport.height * .035;
      opacity = arrival; mode = 'entry';
    } else if (exit > 0 && docY > exitStart) {
      const departure = smooth((docY - exitStart) / Math.max(.001, end - exitStart));
      x = -departure * viewport.width * 1.08;
      y = -departure * viewport.height * .05;
      opacity = 1 - departure; mode = 'exit';
    }
  }
  const visible = opacity > 0 && x < viewport.width && x + viewport.width > 0 && y < viewport.height && y + viewport.height > 0;
  return {chapter, index, phase, start, end, holdStart, holdEnd, x, y, scale: 1, opacity, visible, mode};
}

export function createCanvasMotion() {
  return {chapter: 'overview', index: 0, phase: 0, x: 0, y: 0, scale: 1, opacity: 0, visible: false,
    settled: true, mode: 'absent', initialized: false, sceneDocY: 0, nativeDocY: 0, seekUntilInput: false, seekHold: null};
}

/** Advance using dt seconds from the caller's existing clock. Only the scene
 * trigger position is damped; each entire hold has EXACT x=0,y=0,scale=1.
 * Never fit to a clipped information rectangle or animate backing dimensions.
 * Seek/Reduced/resume and large jumps avoid replaying intermediate chapters.
 * Returns the same state, including chapter for the scene playback owner.
 */
export function advanceCanvasMotion(state, dt, options = {}) {
  validate(options);
  if (!state || !Number.isFinite(state.sceneDocY) || !Number.isFinite(state.nativeDocY)) throw new TypeError('A Canvas motion state is required.');
  if (!Number.isFinite(dt) || dt < 0) throw new RangeError('Canvas motion delta must be finite nonnegative seconds.');
  const {docY, viewport, reducedMotion = false, seek = false} = options;
  const changed = docY !== state.nativeDocY;
  if (changed) state.seekUntilInput = false;
  if (seek) state.seekUntilInput = true;
  const jump = Math.abs(docY - state.nativeDocY) > viewport.height * 1.5;
  const snap = !state.initialized || reducedMotion || seek || dt > 1 || jump;
  const next = snap ? docY : docY + (state.sceneDocY - docY) * Math.exp(-RATE * dt);
  state.settled = Math.abs(next - docY) <= EPSILON;
  state.sceneDocY = state.settled ? docY : next;
  state.nativeDocY = docY;
  state.initialized = true;
  const targetOptions = {...options, docY: state.sceneDocY};
  const natural = sampleCanvasHold({...targetOptions, reducedMotion: false, hold: false, forcedChapter: undefined});
  if (seek || reducedMotion) state.seekHold = ['entry', 'exit'].includes(natural.mode) ? {chapter: natural.chapter, docY: state.sceneDocY, band: natural.mode} : null;
  else if (state.seekHold && (natural.chapter !== state.seekHold.chapter || natural.mode !== state.seekHold.band)) state.seekHold = null;
  Object.assign(state, sampleCanvasHold({...targetOptions, hold: state.seekUntilInput || options.hold}, state.seekHold));
  return state;
}
