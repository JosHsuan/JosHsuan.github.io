// Pure, caller-clocked response for an outer HTML window. There is no scheduler,
// DOM access or scene ownership here. Frequencies are in Hz, velocities in units/s.
const TAU = Math.PI * 2;
const MAX_STEP = 1 / 240;
const POSITION_EPSILON = .0008;
const VELOCITY_EPSILON = .008;
const ENERGY_EPSILON = .001;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function finite(value, name) {
  if (!Number.isFinite(value)) throw new TypeError(`${name} must be finite`);
  return value;
}

function parameter(value, name, min, max) {
  finite(value, name);
  if (value < min || value > max) throw new RangeError(`${name} must be ${min}–${max}`);
  return value;
}

function atRest(position, velocity, target) {
  return Math.abs(position - target) <= POSITION_EPSILON && Math.abs(velocity) <= VELOCITY_EPSILON;
}

function status(state) {
  state.reveal = clamp(state.progress, 0, 1);
  state.transitionResting = state.progress === state.target && state.velocity === 0;
  const p = state.pointer;
  state.pointerResting = p.x === p.targetX && p.y === p.targetY && p.vx === 0 && p.vy === 0;
  state.resting = state.transitionResting && state.pointerResting && state.energy === 0;
  return state;
}

function snap(state) {
  state.progress = state.target;
  state.velocity = 0;
  state.energy = 0;
  Object.assign(state.pointer, {x: 0, y: 0, vx: 0, vy: 0, targetX: 0, targetY: 0});
  return status(state);
}

/** Create caller-owned mutable values; progress may overshoot, reveal never does. */
export function createKineticState({
  progress = 0, target = progress, velocity = 0, energy = 0,
  frequency = 2.3, damping = .62, pointerFrequency = 5, pointerDamping = .75, range = [0, 1],
} = {}) {
  if(!Array.isArray(range)||range.length!==2||!range.every(Number.isFinite)||range[0]>=range[1])throw new RangeError('Ordered finite range required');
  const tuning = Object.freeze({
    range: Object.freeze([...range]),
    frequency: parameter(frequency, 'frequency (Hz)', .5, 8),
    damping: parameter(damping, 'damping', .2, 1),
    pointerFrequency: parameter(pointerFrequency, 'pointerFrequency (Hz)', .5, 12),
    pointerDamping: parameter(pointerDamping, 'pointerDamping', .2, 1),
  });
  return status({
    progress: clamp(finite(progress, 'progress'), range[0]-.2, range[1]+.2),
    target: clamp(finite(target, 'target'), range[0], range[1]),
    velocity: clamp(finite(velocity, 'velocity'), -8, 8),
    energy: clamp(finite(energy, 'energy'), 0, 1),
    tuning,
    pointer: {x: 0, y: 0, vx: 0, vy: 0, targetX: 0, targetY: 0},
  });
}

/** Input pulses add momentum rather than restarting an existing transition. */
export function injectKineticInput(state, {impulse = 0, energy = 0} = {}) {
  // Validate both inputs before changing a live state.
  finite(impulse, 'impulse');
  finite(energy, 'energy');
  state.velocity = clamp(state.velocity + clamp(impulse, -8, 8), -8, 8);
  state.energy = clamp(state.energy + clamp(energy, 0, 1), 0, 1);
  return status(state);
}

/** Reversing changes the destination and preserves position and momentum. */
export function retargetKinetic(state, target, {impulse = 0, energy = 0, reduced = false} = {}) {
  finite(target, 'target');
  finite(impulse, 'impulse');
  finite(energy, 'energy');
  state.target = clamp(target, ...state.tuning.range);
  if (reduced) return snap(state);
  return injectKineticInput(state, {impulse, energy});
}

/** The caller supplies pointer coordinates normalized around the window centre. */
export function setKineticPointer(state, x, y, {reduced = false} = {}) {
  finite(x, 'pointer x');
  finite(y, 'pointer y');
  if (reduced) {
    Object.assign(state.pointer, {x: 0, y: 0, vx: 0, vy: 0, targetX: 0, targetY: 0});
  } else {
    state.pointer.targetX = clamp(x, -1, 1);
    state.pointer.targetY = clamp(y, -1, 1);
  }
  return status(state);
}

// Exact solution of a constant-target damped harmonic oscillator. Short bounded
// substeps only make the safety limits consistent during unusually strong input;
// ordinary response does not depend on Euler integration or the display rate.
function spring(position, velocity, target, dt, frequency, damping, min, max, maxVelocity) {
  const omega = TAU * frequency;
  const offset = position - target;
  const decay = Math.exp(-damping * omega * dt);
  let nextOffset, nextVelocity;
  if (damping === 1) {
    const c = velocity + omega * offset;
    nextOffset = (offset + c * dt) * decay;
    nextVelocity = (velocity - omega * c * dt) * decay;
  } else {
    const damped = omega * Math.sqrt(1 - damping * damping);
    const cosine = Math.cos(damped * dt);
    const sine = Math.sin(damped * dt);
    const b = (velocity + damping * omega * offset) / damped;
    const oscillation = offset * cosine + b * sine;
    nextOffset = decay * oscillation;
    nextVelocity = decay * (-damping * omega * oscillation + damped * (-offset * sine + b * cosine));
  }
  const nextPosition = clamp(target + nextOffset, min, max);
  nextVelocity = clamp(nextVelocity, -maxVelocity, maxVelocity);
  // A safety boundary absorbs outward momentum; no reflection can add energy.
  if ((nextPosition === min && nextVelocity < 0) || (nextPosition === max && nextVelocity > 0)) nextVelocity = 0;
  return atRest(nextPosition, nextVelocity, target) ? [target, 0] : [nextPosition, nextVelocity];
}

/**
 * Advance using active elapsed seconds only. Paused calls are exact no-ops;
 * the host must rebase its clock on resume rather than passing a hidden gap.
 * Reduced mode settles immediately and clears decorative pointer/energy values.
 * The host may stop requesting frames when resting is true, and report entrance
 * or exit completion at transitionResting even if pointer feedback is active.
 */
export function advanceKinetic(state, dtSeconds, {paused = false, reduced = false} = {}) {
  parameter(dtSeconds, 'dtSeconds', 0, 60);
  if (paused) return state;
  if (reduced) return snap(state);
  if (dtSeconds === 0 || state.resting) return state;
  const steps = Math.max(1, Math.ceil(dtSeconds / MAX_STEP - 1e-10));
  const dt = dtSeconds / steps;
  const t = state.tuning;
  const p = state.pointer;
  for (let index = 0; index < steps; index++) {
    [state.progress, state.velocity] = spring(state.progress, state.velocity, state.target, dt, t.frequency, t.damping, t.range[0]-.2, t.range[1]+.2, 8);
    [p.x, p.vx] = spring(p.x, p.vx, p.targetX, dt, t.pointerFrequency, t.pointerDamping, -1.2, 1.2, 12);
    [p.y, p.vy] = spring(p.y, p.vy, p.targetY, dt, t.pointerFrequency, t.pointerDamping, -1.2, 1.2, 12);
    state.energy *= Math.exp(-4 * dt);
    if (state.energy <= ENERGY_EPSILON) state.energy = 0;
    status(state);
    if (state.resting) break;
  }
  return state;
}
