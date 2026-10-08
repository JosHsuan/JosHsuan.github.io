// Shared visual response. This module never scrolls the document or starts a clock.
// Native position remains the reading truth; one controller owns this mutable state.
const OMEGA = 12.5;
const POSITION_EPSILON = 0.00002;
const VELOCITY_EPSILON = 0.0001;
const MAX_LAG = 1.5 / 7;
// Ordinary heavy render frames still use the exact analytical solution. Only a
// genuinely stale one-second gap seeks; explicit visibility resume always seeks.
const MAX_FRAME_GAP = 1;
const ENERGY_SPEED = 0.6;
const CHAPTERS = Object.freeze([
  {id: 'overview', hold: [0.2, 0.72]},
  {id: 'form', hold: [0.16, 0.76]},
  {id: 'system', hold: [0.26, 0.66]},
  {id: 'pattern', hold: [0.32, 0.72]},
  {id: 'make', hold: [0.18, 0.8]},
  {id: 'validation', hold: [0.12, 0.84]},
  {id: 'credits', hold: [0.12, 1]},
].map(chapter => Object.freeze({...chapter, hold: Object.freeze(chapter.hold)})));
// Foreground choreography shares these exact hold boundaries with the stage.
// Export an immutable score, not a second mutable timeline or response state.
export {CHAPTERS as RESPONSE_CHAPTERS};

const clamp = value => Math.min(1, Math.max(0, value));
const smoother = value => {const t = clamp(value); return t * t * t * (10 + t * (-15 + 6 * t));};
function normalized(value, name) {
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new TypeError(`${name} must be finite.`);
  return clamp(value);
}
function finish(state, target) {
  state.visualU = target;
  state.velocity = 0;
  state.energy = 0;
  state.direction = 0;
  state.settled = true;
  return state;
}

export function createResponseState(u = 0) {
  const value = normalized(u, 'Initial progress');
  return {nativeU: value, visualU: value, velocity: 0, energy: 0, direction: 0, settled: true};
}

/**
 * Advance one caller-owned visual response and return that same object.
 * Progress is normalized; velocity is progress/second; dt is seconds.
 * Call only while input changed or !state.settled. Do not add another scrub tween.
 */
export function advanceResponse(state, target, dt, {reducedMotion = false, resumed = false} = {}) {
  const nativeU = normalized(target, 'Target progress');
  if (typeof dt !== 'number' || !Number.isFinite(dt) || dt < 0) throw new RangeError('Delta must be finite, nonnegative seconds.');
  if (!state || !Number.isFinite(state.visualU) || !Number.isFinite(state.velocity)) throw new TypeError('A valid response state is required.');
  state.nativeU = nativeU;

  // A resume or a stale frame seeks directly. Hidden time never becomes a replay.
  // The scene binding selects its reduced-motion composition independently.
  if (reducedMotion || resumed || dt > MAX_FRAME_GAP) return finish(state, nativeU);

  let position = clamp(state.visualU), velocity = state.velocity;
  if (Math.abs(nativeU - position) > MAX_LAG) {
    position = nativeU - Math.sign(nativeU - position) * MAX_LAG;
    velocity = 0;
  }
  const displacement = position - nativeU;
  const coefficient = velocity + OMEGA * displacement;
  const decay = Math.exp(-OMEGA * dt);
  position = nativeU + (displacement + coefficient * dt) * decay;
  velocity = (velocity - OMEGA * coefficient * dt) * decay;

  // Preserve momentum during ordinary reversal, while normalized endpoints and
  // the maximum narrative lag are hard bounds rather than overscroll effects.
  if (position < 0 || position > 1) {
    position = clamp(position);
    velocity = 0;
  }
  if (Math.abs(nativeU - position) > MAX_LAG) {
    position = nativeU - Math.sign(nativeU - position) * MAX_LAG;
    velocity = 0;
  }
  if (Math.abs(nativeU - position) <= POSITION_EPSILON && Math.abs(velocity) <= VELOCITY_EPSILON) return finish(state, nativeU);

  state.visualU = position;
  state.velocity = velocity;
  state.energy = Math.min(1, Math.abs(velocity) / ENERGY_SPEED);
  state.direction = Math.abs(velocity) <= VELOCITY_EPSILON ? 0 : Math.sign(velocity);
  state.settled = false;
  return state;
}

/**
 * Author the visual playhead into seven unequal holds. Plateau coordinates are
 * (chapterIndex + .5) / 7. Interpolation spans the entire adjacent exit+entry,
 * so crossing a chapter boundary does not introduce an extra ease/stop.
 * localPhase and chapterId remain tied to visualU for an independent focus beat.
 */
export function sampleResponseScore(visualU) {
  const u = normalized(visualU, 'Visual progress');
  const index = Math.min(6, Math.floor(u * 7));
  const localPhase = Math.min(1, Math.max(0, u * 7 - index));
  const chapter = CHAPTERS[index];
  let from = index, to = index, blend = 0, dwellWeight = 1;

  if (localPhase < chapter.hold[0] && index > 0) {
    from = index - 1;
    const previousExit = 1 - CHAPTERS[from].hold[1];
    const transition = (previousExit + localPhase) / (previousExit + chapter.hold[0]);
    blend = smoother(transition);
    dwellWeight = smoother(Math.abs(transition * 2 - 1));
  } else if (localPhase > chapter.hold[1] && index < 6) {
    to = index + 1;
    const transition = (localPhase - chapter.hold[1]) / (1 - chapter.hold[1] + CHAPTERS[to].hold[0]);
    blend = smoother(transition);
    dwellWeight = smoother(Math.abs(transition * 2 - 1));
  }

  return {
    stageU: (from + 0.5 + (to - from) * blend) / 7,
    chapterId: chapter.id,
    localPhase,
    dwellWeight,
  };
}
