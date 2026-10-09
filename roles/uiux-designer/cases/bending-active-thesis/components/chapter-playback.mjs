// One caller owns the clock. This module owns no RAF, DOM, camera or scroll.
const CHAPTER_IDS = ['overview', 'form', 'system', 'pattern', 'make', 'validation', 'credits'];
const PERIODS = [16, 18, 20, 18, 22, 18, 24];
export const PLAYBACK_CHAPTERS = Object.freeze(CHAPTER_IDS.map((id, index) => Object.freeze({id, index, period: PERIODS[index]})));
export const PLAYBACK_BEATS = Object.freeze([
  {id: 'arrival', start: 0, end: .16, cue: 'primary'},
  {id: 'read', start: .16, end: .48, cue: 'read'},
  {id: 'examine', start: .48, end: .8, cue: 'examine'},
  {id: 'return', start: .8, end: 1, cue: 'return'},
].map(Object.freeze));
const TRANSITION_SECONDS = .92;
const BOOST_DECAY = 2.6;
const MAX_BOOST = 1.4;
const STATIC_PHASE = .32;
const clamp = value => Math.max(0, Math.min(1, value));
const smoother = value => {const t = clamp(value); return clamp(t * t * t * (10 + t * (-15 + 6 * t)));};
const oneHot = index => CHAPTER_IDS.map((_, i) => i === index ? 1 : 0);

function chapterIndex(chapter) {
  const index = typeof chapter === 'string' ? CHAPTER_IDS.indexOf(chapter) : chapter;
  if (!Number.isInteger(index) || index < 0 || index >= CHAPTER_IDS.length) throw new RangeError('Chapter must be a known chapter id or an integer from 0 to 6.');
  return index;
}
function finite(value, name) {
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new TypeError(`${name} must be finite.`);
  return value;
}
function validateState(state) {
  if (!state || !Number.isFinite(state.activeSeconds) || !Number.isFinite(state.boost) || !Array.isArray(state.chapterWeights) || state.chapterWeights.length !== 7) throw new TypeError('A chapter playback state is required.');
}

export function createChapterPlayback(chapter = 0) {
  const index = chapterIndex(chapter);
  return {
    index, fromIndex: index, chapterWeights: oneHot(index), fromWeights: oneHot(index),
    transitionElapsed: TRANSITION_SECONDS, activeSeconds: 0, entranceSeconds: 0,
    boost: 0, direction: 0, paused: false, reducedMotion: false, hidden: false,
    engaged: false, needsFrame: true,
  };
}

/**
 * Advance the same mutable state using seconds from the existing controller.
 * `chapter` is semantic navigation, never fractional scroll progress. `impulse`
 * is a consumed wheel/touch delta in [-1,1]; submit it once, then submit zero.
 * No chapter advances automatically. Hidden/resume gaps are never replayed.
 */
export function advanceChapterPlayback(state, dt, {
  chapter = state?.index, impulse = 0, paused = false, reducedMotion = false,
  hidden = false, resumed = false, engaged = false, seek = false,
} = {}) {
  validateState(state);
  finite(dt, 'Delta'); finite(impulse, 'Impulse');
  if (dt < 0) throw new RangeError('Delta must be nonnegative seconds.');
  const index = chapterIndex(chapter);
  const changed = index !== state.index;
  if (changed) {
    // Retarget the actual composed weights, including an interrupted passage.
    // A two-id crossfade would jump if a third chapter arrived mid-transition.
    state.fromWeights = state.chapterWeights.slice();
    state.fromIndex = state.chapterWeights.indexOf(Math.max(...state.chapterWeights));
    state.index = index;
    state.transitionElapsed = 0;
    state.entranceSeconds = 0;
  }
  state.paused = !!paused;
  state.reducedMotion = !!reducedMotion;
  state.hidden = !!hidden;
  state.engaged = !!engaged;
  state.needsFrame = !(paused || reducedMotion || hidden || engaged);

  // A navigation action remains usable while motion is disabled. An explicit
  // inspection can request a chapter different from the reading/scene probe,
  // so finish its pending passage before freezing. Otherwise the reveal waits
  // for a chapter that frozen old weights can never render. A settled same-
  // chapter engagement keeps its existing pose and time unchanged.
  if (seek || reducedMotion || (paused && changed) || (engaged && state.transitionElapsed < TRANSITION_SECONDS)) {
    state.chapterWeights = oneHot(index);
    state.fromWeights = oneHot(index);
    state.fromIndex = index;
    state.transitionElapsed = TRANSITION_SECONDS;
  }

  if (!state.needsFrame || resumed || dt > 1) {
    state.boost = 0;
    state.direction = 0;
    return state;
  }

  const deltaImpulse = Math.max(-1, Math.min(1, impulse));
  if (deltaImpulse !== 0) {
    state.boost = Math.min(MAX_BOOST, state.boost + Math.abs(deltaImpulse) * .85);
    state.direction = Math.sign(deltaImpulse);
  }
  // Integrate the exponential rate envelope exactly. Equal elapsed input yields
  // the same playhead at 3, 30, 60 or 120 Hz; low fps does not slow the artwork.
  const decay = Math.exp(-BOOST_DECAY * dt);
  const activeDelta = dt + state.boost * (-Math.expm1(-BOOST_DECAY * dt)) / BOOST_DECAY;
  state.boost *= decay;
  if (state.boost < 1e-10) {state.boost = 0; state.direction = 0;}
  state.activeSeconds += activeDelta;
  state.entranceSeconds += activeDelta;
  state.transitionElapsed = Math.min(TRANSITION_SECONDS, state.transitionElapsed + activeDelta);
  const blend = smoother(state.transitionElapsed / TRANSITION_SECONDS);
  state.chapterWeights = state.fromWeights.map((weight, i) => weight * (1 - blend) + (i === index ? blend : 0));
  return state;
}

function sampleChapter(chapter, activeSeconds, staticPose) {
  const time = staticPose ? chapter.period * STATIC_PHASE : activeSeconds % chapter.period;
  const phase = time / chapter.period;
  const beat = PLAYBACK_BEATS.find(item => phase < item.end) ?? PLAYBACK_BEATS.at(-1);
  return {
    ...chapter, time, phase, beat: beat.id,
    beatProgress: clamp((phase - beat.start) / (beat.end - beat.start)), cue: beat.cue,
  };
}

/** Snapshot for every layer. Blend chapterWeights, not just from/to labels. */
export function sampleChapterPlayback(state) {
  validateState(state);
  const chapters = PLAYBACK_CHAPTERS.map(chapter => sampleChapter(chapter, state.activeSeconds, state.reducedMotion));
  const target = chapters[state.index];
  return {
    chapterId: target.id, index: state.index,
    fromChapter: CHAPTER_IDS[state.fromIndex], fromIndex: state.fromIndex,
    toChapter: target.id, toIndex: state.index,
    blend: smoother(state.transitionElapsed / TRANSITION_SECONDS),
    chapterWeights: state.chapterWeights.slice(),
    activeSeconds: state.activeSeconds, chapters,
    phases: chapters.map(chapter => chapter.phase),
    loopTime: target.time, loopPhase: target.phase, beat: target.beat,
    beatProgress: target.beatProgress, representationCue: target.cue,
    tempo: 1 + state.boost, energy: state.boost / MAX_BOOST, direction: state.direction,
    entranceSeconds: state.entranceSeconds, entranceProgress: clamp(state.entranceSeconds / 1.8),
    paused: state.paused, reducedMotion: state.reducedMotion, hidden: state.hidden,
    engaged: state.engaged, needsFrame: state.needsFrame,
  };
}
