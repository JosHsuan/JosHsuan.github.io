// One caller-owned interaction response. The existing story controller advances
// it only in inspection mode; this module owns no DOM, camera or frame loop.
export const INSPECTION_DEFAULTS = Object.freeze({azimuth: 30, elevation: 30, separation: 0, lightAzimuth: 0, preset: 'studio'});
export const INSPECTION_LIMITS = Object.freeze({
  azimuth: Object.freeze([-40, 100]),
  elevation: Object.freeze([12, 70]),
  separation: Object.freeze([0, 1]),
  lightAzimuth: Object.freeze([-70, 70]),
});
export const INSPECTION_VIEWS = Object.freeze({
  front: Object.freeze({azimuth: 0, elevation: 18}),
  threeQuarter: Object.freeze({azimuth: 30, elevation: 30}),
  high: Object.freeze({azimuth: 30, elevation: 65}),
});
export const INSPECTION_PRESETS = Object.freeze(['studio', 'raking', 'silhouette']);
const CHANNELS = Object.keys(INSPECTION_LIMITS);
const OMEGA = 16;
const POSITION_EPSILON = 0.00002;
const VELOCITY_EPSILON = 0.0001;
const clamp = (value, limits) => Math.max(limits[0], Math.min(limits[1], value));
const zeros = () => Object.fromEntries(CHANNELS.map(key => [key, 0]));

function validateState(state) {
  if (!state?.value || !state.target || !state.velocity || !INSPECTION_PRESETS.includes(state.target.preset) || !INSPECTION_PRESETS.includes(state.value.preset) || !CHANNELS.every(key => Number.isFinite(state.value[key]) && Number.isFinite(state.target[key]) && Number.isFinite(state.velocity[key]))) throw new TypeError('A valid inspection state is required.');
}

function finish(state) {
  Object.assign(state.value, state.target);
  Object.assign(state.velocity, zeros());
  state.settled = true;
  return state;
}

export function createInspectionState() {
  return {target: {...INSPECTION_DEFAULTS}, value: {...INSPECTION_DEFAULTS}, velocity: zeros(), settled: true};
}

/** Targets are semantic control values, independent of the damped visual value.
 * Validate the complete patch before mutating state. Presets switch immediately;
 * numeric channels are advanced by the caller's existing demand-loop tick. */
export function setInspectionTarget(state, patch) {
  validateState(state);
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) throw new TypeError('Inspection target patch must be an object.');
  const next = {...state.target};
  for (const [key, value] of Object.entries(patch)) {
    if (key === 'preset') {
      if (!INSPECTION_PRESETS.includes(value)) throw new RangeError('Unknown inspection lighting preset.');
      next.preset = value;
    } else {
      if (!Object.hasOwn(INSPECTION_LIMITS, key)) throw new RangeError(`Unknown inspection channel: ${key}`);
      if (typeof value !== 'number' || !Number.isFinite(value)) throw new TypeError(`Inspection ${key} must be finite.`);
      next[key] = clamp(value, INSPECTION_LIMITS[key]);
    }
  }
  Object.assign(state.target, next);
  state.value.preset = next.preset;
  state.settled = CHANNELS.every(key => state.value[key] === next[key] && state.velocity[key] === 0);
  return state;
}

/** Reset restores both semantic targets and visual values in one operation. */
export function resetInspectionState(state) {
  validateState(state);
  Object.assign(state.target, INSPECTION_DEFAULTS);
  return finish(state);
}

/** dt is seconds. Reduced motion and visibility resume preserve the user's
 * requested angle/layer/light values, applying them immediately without replay.
 * Velocity is expressed in each channel's units per second. */
export function advanceInspection(state, dt, {reducedMotion = false, resumed = false} = {}) {
  validateState(state);
  if (typeof dt !== 'number' || !Number.isFinite(dt) || dt < 0) throw new RangeError('Inspection delta must be finite, nonnegative seconds.');
  if (reducedMotion || resumed || dt > 1) return finish(state);
  const decay = Math.exp(-OMEGA * dt);
  let settled = true;
  for (const key of CHANNELS) {
    const limits = INSPECTION_LIMITS[key], span = limits[1] - limits[0];
    const displacement = state.value[key] - state.target[key];
    const coefficient = state.velocity[key] + OMEGA * displacement;
    let position = state.target[key] + (displacement + coefficient * dt) * decay;
    let velocity = (state.velocity[key] - OMEGA * coefficient * dt) * decay;
    if (position < limits[0] || position > limits[1]) {position = clamp(position, limits); velocity = 0;}
    if (Math.abs(position - state.target[key]) <= POSITION_EPSILON * span && Math.abs(velocity) <= VELOCITY_EPSILON * span) {
      position = state.target[key]; velocity = 0;
    } else settled = false;
    state.value[key] = position;
    state.velocity[key] = velocity;
  }
  state.value.preset = state.target.preset;
  state.settled = settled;
  return state;
}
