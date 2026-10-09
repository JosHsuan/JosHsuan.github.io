// One caller-owned response for a retained, bounded Canvas. This module owns no
// DOM, camera, rendering resources or clock. Dimensions change only upstream.
const CHANNELS = ['x', 'y', 'scale', 'opacity'];
const RATE = {x: 16, y: 16, scale: 14, opacity: 12};
const EPSILON = {x: .05, y: .05, scale: .0001, opacity: .001};
const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
const smooth = value => {const t = clamp(value); return t * t * (3 - 2 * t);};

export function createCanvasMotion() {
  return {x: 0, y: 0, scale: 1, opacity: 0, visible: false, settled: true, mode: 'absent', initialized: false,
    target: {x: 0, y: 0, scale: 1, opacity: 0}};
}

function assertSize(value, label) {
  if (!value || !['width', 'height'].every(key => Number.isFinite(value[key]) && value[key] > 0)) {
    throw new RangeError(`Canvas motion requires a finite positive ${label}.`);
  }
}

function targetFor({chapter, rect, viewport, surface}) {
  const {width: vw, height: vh} = viewport, {width: sw, height: sh} = surface;
  const top = Math.min(92, vh / 3), bottom = Math.max(top, vh - (vw <= 780 ? 86 : 28));
  const left = Math.min(16, vw / 4), right = Math.max(left, vw - left);
  const safeWidth = Math.max(1, right - left), safeHeight = Math.max(1, bottom - top);
  // MAKE/VALIDATION carry the approved source absence. Their deterministic
  // side exit never derives its next target from the already transformed stage.
  if (!rect || chapter === 'make' || chapter === 'validation') {
    return {x: vw + 24, y: top + (safeHeight - sh * .68) / 2, scale: .68, opacity: 0};
  }
  if (!['left', 'top', 'width', 'height'].every(key => Number.isFinite(rect[key])) || rect.width <= 0 || rect.height <= 0) {
    throw new RangeError('Canvas motion requires a finite positive anchor rectangle.');
  }
  const clipLeft = Math.max(left, rect.left), clipRight = Math.min(right, rect.left + rect.width);
  const clipTop = Math.max(top, rect.top), clipBottom = Math.min(bottom, rect.top + rect.height);
  const width = Math.max(0, clipRight - clipLeft), height = Math.max(0, clipBottom - clipTop);
  const availableWidth = Math.min(rect.width, safeWidth), availableHeight = Math.min(rect.height, safeHeight);
  // Fade only at the last edge of the available anchor. The geometry still
  // fits its full family envelope inside the stable Canvas-local aperture.
  const coverage = Math.min(width / availableWidth, height / availableHeight);
  const opacity = smooth(coverage / .3);
  if (!width || !height) {
    const above = rect.top + rect.height <= top, below = rect.top >= bottom;
    const scale = .12;
    return {x: clamp(rect.left + rect.width / 2, left, right) - sw * scale / 2,
      y: above ? -sh * scale - 16 : below ? vh + 16 : top + (safeHeight - sh * scale) / 2,
      scale, opacity: 0};
  }
  // Do not upscale a pressure-relieved raster for a held source study. Scale is
  // uniform so the camera aspect and existing transformed-rect raycast agree.
  const scale = Math.min(1, width / sw, height / sh);
  return {x: clipLeft + (width - sw * scale) / 2, y: clipTop + (height - sh * scale) / 2, scale, opacity};
}

/** dt is seconds supplied by the existing chapter controller. Seeking and
 * Reduced settle immediately. Exponential integration is refresh-rate neutral
 * for a held target, never overshoots, and returns to an exact idle value. */
export function advanceCanvasMotion(state, dt, options = {}) {
  if (!state || !CHANNELS.every(key => Number.isFinite(state[key])) || !state.target) {
    throw new TypeError('A Canvas motion state is required.');
  }
  if (!Number.isFinite(dt) || dt < 0) throw new RangeError('Canvas motion delta must be finite nonnegative seconds.');
  const {viewport, surface, reducedMotion = false, seek = false} = options;
  assertSize(viewport, 'viewport'); assertSize(surface, 'surface');
  const target = targetFor(options), snap = reducedMotion || seek || dt > 1;
  Object.assign(state.target, target);
  const entering = !state.initialized && target.opacity > 0;
  if (!state.initialized) {
    Object.assign(state, target);
    if (entering && !snap) {
      state.x += Math.min(64, viewport.width * .1); state.y += 18;
      state.scale *= .94; state.opacity = 0;
    }
    state.initialized = true;
  }
  let settled = true;
  for (const key of CHANNELS) {
    const value = snap ? target[key] : target[key] + (state[key] - target[key]) * Math.exp(-RATE[key] * dt);
    if (Math.abs(value - target[key]) <= EPSILON[key]) state[key] = target[key];
    else {state[key] = value; settled = false;}
  }
  const intersects = state.x < viewport.width && state.y < viewport.height
    && state.x + surface.width * state.scale > 0 && state.y + surface.height * state.scale > 0;
  state.visible = state.opacity > 0 && intersects;
  state.settled = settled;
  state.mode = target.opacity === 0 ? (settled ? 'absent' : 'exiting') : settled ? 'docked' : entering ? 'entering' : 'travelling';
  return state;
}
