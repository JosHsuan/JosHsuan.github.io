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

// Round 05: the document remains the semantic scroll surface. This pixel-space
// response replaces (rather than runs alongside) the normalized story response
// in the continuous case. It drives the entire reading plane and scene score.
const clampTo = (value, low, high) => Math.min(high, Math.max(low, value));
function finiteNumber(value, name) {
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new TypeError(`${name} must be finite.`);
  return value;
}
function deltaSeconds(dt) {
  finiteNumber(dt, 'Delta');
  if (dt < 0) throw new RangeError('Delta must be nonnegative seconds.');
}
function critical(position, velocity, target, dt, omega) {
  const displacement = position - target, coefficient = velocity + omega * displacement;
  const decay = Math.exp(-omega * dt);
  return {position: target + (displacement + coefficient * dt) * decay, velocity: (velocity - omega * coefficient * dt) * decay};
}

/** Cache only untransformed layout coordinates; no DOM reads occur here.
 * Stop y is a desired DOCUMENT SCROLL position, not an element's document top.
 * The caller aligns measured content to its safe reading inset before passing y.
 * Stop windows never overlap. Nearby candidates are thinned to avoid micro-pauses.
 */
export function createReadingPlan({anchors, viewportHeight, maxScroll, stops = []} = {}) {
  if (!Array.isArray(anchors) || anchors.length !== 8 || anchors.some((value, index) => !Number.isFinite(value) || index > 0 && value <= anchors[index - 1])) throw new RangeError('Reading anchors must contain eight increasing finite document positions.');
  finiteNumber(viewportHeight, 'Viewport height'); finiteNumber(maxScroll, 'Maximum scroll');
  if (viewportHeight <= 0 || maxScroll < 0 || !Array.isArray(stops)) throw new RangeError('Expected positive viewport, nonnegative scroll range and stop array.');
  const candidates = stops.map((stop, index) => {
    if (!stop || typeof stop !== 'object') throw new TypeError('A reading stop must be an object.');
    finiteNumber(stop.y, 'Reading stop position');
    if (stop.id !== undefined && typeof stop.id !== 'string') throw new TypeError('A reading stop identifier must be a string.');
    return {id: stop.id ?? `reading-${index + 1}`, y: clampTo(stop.y, 0, maxScroll)};
  }).sort((a, b) => a.y - b.y);
  const selected = [];
  for (const stop of candidates) {
    if (stop.y < viewportHeight * 0.1 || maxScroll - stop.y < viewportHeight * 0.1) continue;
    if (!selected.length || stop.y - selected.at(-1).y >= viewportHeight * 0.22) selected.push(stop);
  }
  const authored = selected.map((stop, index) => {
    const clearance = Math.min(stop.y, maxScroll - stop.y, (stop.y - (selected[index - 1]?.y ?? 0)) / 2, ((selected[index + 1]?.y ?? maxScroll) - stop.y) / 2);
    const extent = Math.min(viewportHeight * 0.175, clearance * 0.94);
    const halfHold = extent * (0.055 / 0.175), shoulder = extent - halfHold;
    return Object.freeze({...stop, start: stop.y - extent, holdStart: stop.y - halfHold, holdEnd: stop.y + halfHold, end: stop.y + extent, halfHold, shoulder});
  });
  return Object.freeze({anchors: Object.freeze([...anchors]), viewportHeight, maxScroll, focusOffset: viewportHeight * 0.45, maxLag: Math.min(240, viewportHeight * 0.32), stops: Object.freeze(authored)});
}

function validPlan(plan) {
  if (!plan || !Array.isArray(plan.anchors) || plan.anchors.length !== 8 || !Array.isArray(plan.stops) || !Number.isFinite(plan.maxScroll) || !Number.isFinite(plan.viewportHeight)) throw new TypeError('A reading plan is required.');
  return plan;
}

// Quintic Hermite shoulder: derivative 1 at the untouched document edge and 0
// at the plateau; second derivative 0 at both. Its derivative factors into
// (1-t)^2 * ((15R+30H)t^2 + 2Rt + R), proving monotonicity for R,H > 0.
function enterReadingHold(value, stop) {
  const r = stop.shoulder, h = stop.halfHold, t = clamp((value - stop.start) / r);
  return stop.start + r * t + (4 * r + 10 * h) * t ** 3 - (7 * r + 15 * h) * t ** 4 + (3 * r + 6 * h) * t ** 5;
}

/** Reversible, continuous and surjective: no content position is skipped.
 * A hold consumes native travel, never time, a wheel event, or a forced snap.
 */
export function sampleReadingTarget(nativeDocY, plan) {
  validPlan(plan);
  const y = clampTo(finiteNumber(nativeDocY, 'Native document position'), 0, plan.maxScroll);
  const stop = plan.stops.find(candidate => y >= candidate.start && y <= candidate.end);
  if (!stop) return {targetDocY: y, holdId: null, holdWeight: 0};
  if (y >= stop.holdStart && y <= stop.holdEnd) return {targetDocY: stop.y, holdId: stop.id, holdWeight: 1};
  const entering = y < stop.holdStart;
  const targetDocY = entering ? enterReadingHold(y, stop) : 2 * stop.y - enterReadingHold(2 * stop.y - y, stop);
  const distance = entering ? (y - stop.start) / stop.shoulder : (stop.end - y) / stop.shoulder;
  return {targetDocY, holdId: stop.id, holdWeight: smoother(distance)};
}

export function createReadingState(nativeDocY = 0) {
  const y = finiteNumber(nativeDocY, 'Initial document position');
  if (y < 0) throw new RangeError('Initial document position must be nonnegative.');
  return {nativeDocY: y, targetDocY: y, visualDocY: y, velocity: 0, acceleration: 0, energy: 0, direction: 0, settled: true, seekUntilInput: false, bypassHoldId: null};
}
function finishReading(state, targetDocY) {
  Object.assign(state, {targetDocY, visualDocY: targetDocY, velocity: 0, acceleration: 0, energy: 0, direction: 0, settled: true});
  return state;
}

/** The case's ONLY scroll spring. Velocity/acceleration are px/s and px/s².
 * The native document changes immediately. Its visible plane is translated by
 * nativeDocY-visualDocY; no scrollTo, prevented wheel, timer or RAF is owned here.
 */
export function advanceReading(state, nativeDocY, dt, {plan, reducedMotion = false, resumed = false, seek = false} = {}) {
  validPlan(plan); deltaSeconds(dt);
  if (!state || !Number.isFinite(state.visualDocY) || !Number.isFinite(state.velocity) || !Number.isFinite(state.nativeDocY)) throw new TypeError('A reading response state is required.');
  const native = clampTo(finiteNumber(nativeDocY, 'Native document position'), 0, plan.maxScroll);
  const distance = Math.abs(native - state.nativeDocY);
  if (distance > 0) state.seekUntilInput = false;
  state.nativeDocY = native;
  if (reducedMotion || resumed || seek || dt > MAX_FRAME_GAP || distance > plan.viewportHeight * 1.5) {
    state.seekUntilInput = true;
    state.bypassHoldId = sampleReadingTarget(native, plan).holdId;
    return finishReading(state, native);
  }
  const authored = sampleReadingTarget(native, plan);
  if (state.bypassHoldId !== authored.holdId) state.bypassHoldId = null;
  // A focus seek may land midway through a hold shoulder. Re-enabling that
  // shoulder on the first 1px wheel movement could move text BACKWARDS. Keep
  // this one stop in natural flow until it is left; damping resumes immediately.
  const bypass = state.seekUntilInput || state.bypassHoldId !== null;
  const target = bypass ? native : authored.targetDocY;
  state.targetDocY = target;
  let position = clampTo(state.visualDocY, 0, plan.maxScroll), velocity = state.velocity;
  if (Math.abs(target - position) > plan.maxLag) {position = target - Math.sign(target - position) * plan.maxLag; velocity = 0;}
  const next = critical(position, velocity, target, dt, OMEGA);
  position = clampTo(next.position, 0, plan.maxScroll); velocity = next.velocity;
  if (position !== next.position) velocity = 0;
  if (Math.abs(target - position) > plan.maxLag) {position = target - Math.sign(target - position) * plan.maxLag; velocity = 0;}
  if (Math.abs(target - position) <= 0.015 && Math.abs(velocity) <= 0.05) return finishReading(state, target);
  Object.assign(state, {visualDocY: position, velocity, acceleration: -2 * OMEGA * velocity - OMEGA ** 2 * (position - target), energy: clamp(Math.abs(velocity) / (plan.viewportHeight * 1.5)), direction: Math.abs(velocity) <= 0.05 ? 0 : Math.sign(velocity), settled: false});
  return state;
}

function readingProgress(y, plan) {
  const focus = y + plan.focusOffset, anchors = plan.anchors;
  if (focus <= anchors[0]) return 0;
  if (focus >= anchors[7]) return 1;
  let index = 0;
  while (index < 6 && focus >= anchors[index + 1]) index += 1;
  return (index + (focus - anchors[index]) / (anchors[index + 1] - anchors[index])) / 7;
}

/** All scene/foreground samplers consume this SAME visualU and stageU.
 * holdWeight describes the actual arrival at a reading stop, not merely the
 * native pointer being inside its target window. Long sections may have many.
 */
export function sampleReadingScore(state, plan) {
  validPlan(plan);
  if (!state || !Number.isFinite(state.nativeDocY) || !Number.isFinite(state.visualDocY)) throw new TypeError('A reading response state is required.');
  const nativeDocY = clampTo(state.nativeDocY, 0, plan.maxScroll), visualDocY = clampTo(state.visualDocY, 0, plan.maxScroll);
  const nativeU = readingProgress(nativeDocY, plan), visualU = readingProgress(visualDocY, plan);
  const stop = state.seekUntilInput || state.bypassHoldId !== null ? {holdId: null, holdWeight: 0, targetDocY: nativeDocY} : sampleReadingTarget(nativeDocY, plan);
  const arrival = smoother(1 - Math.abs(visualDocY - stop.targetDocY) / (plan.viewportHeight * 0.12));
  return {...sampleResponseScore(visualU), nativeU, visualU, nativeDocY, visualDocY, readingShiftY: nativeDocY - visualDocY, holdId: stop.holdId, holdWeight: stop.holdWeight * arrival};
}

/** Small local feedback states use the SAME controller tick, never scroll input
 * or another RAF. The root composes these onto dedicated inner object planes.
 */
export function createPlaneFeedback() {
  return {x: 0, y: 0, press: 0, velocity: {x: 0, y: 0, press: 0}, settled: true};
}
export function advancePlaneFeedback(state, target, dt, {reducedMotion = false, resumed = false} = {}) {
  deltaSeconds(dt);
  if (!state?.velocity || !target) throw new TypeError('Plane feedback state and target are required.');
  const values = Object.fromEntries(['x', 'y', 'press'].map(key => {
    finiteNumber(state[key], `Plane ${key}`); finiteNumber(state.velocity[key], `Plane ${key} velocity`);
    return [key, clampTo(finiteNumber(target[key] ?? 0, `Plane ${key} target`), key === 'press' ? 0 : -1, 1)];
  }));
  state.settled = true;
  for (const key of ['x', 'y', 'press']) {
    // Reduced motion changes values immediately. Decorative callers send zero
    // targets; semantic controls may retain their explicit selected value.
    const desired = values[key];
    const next = critical(state[key], state.velocity[key], desired, dt, 18);
    if (reducedMotion || resumed || dt > MAX_FRAME_GAP || Math.abs(next.position - desired) < 0.0001 && Math.abs(next.velocity) < 0.001) {state[key] = desired; state.velocity[key] = 0;}
    else {state[key] = clampTo(next.position, key === 'press' ? 0 : -1, 1); state.velocity[key] = state[key] === next.position ? next.velocity : 0; state.settled = false;}
  }
  return state;
}
