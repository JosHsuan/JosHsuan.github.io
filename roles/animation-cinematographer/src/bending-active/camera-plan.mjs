/**
 * Animation Cinematographer — local Bending-Active Thesis proposal.
 * Original deterministic framing math. No model, Theatre state, clock, or renderer.
 * Input geometry must already be transformed into the viewer's world coordinates.
 */
const radians = degrees => degrees * Math.PI / 180;
const add = (a, b) => a.map((v, i) => v + b[i]);
const subtract = (a, b) => a.map((v, i) => v - b[i]);
const multiply = (a, s) => a.map(v => v * s);
const dot = (a, b) => a.reduce((sum, v, i) => sum + v * b[i], 0);
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const length = a => Math.hypot(...a);
const normalize = a => multiply(a, 1 / length(a));
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const clamp = v => Math.max(0, Math.min(1, Number.isFinite(v) ? v : 0));
const ease = v => { const t = clamp(v); return t ** 3 * (10 + t * (-15 + 6 * t)); };

function assertVector(value, label) {
  if (!Array.isArray(value) || value.length !== 3 || !value.every(Number.isFinite)) throw new TypeError(`${label} must contain three finite numbers`);
}
function validateBounds(bounds, label = 'bounds') {
  assertVector(bounds?.min, `${label}.min`);
  assertVector(bounds?.max, `${label}.max`);
  if (bounds.min.some((v, i) => v > bounds.max[i]) || length(subtract(bounds.max, bounds.min)) === 0) throw new RangeError(`${label} must have positive extent`);
  return { min: [...bounds.min], max: [...bounds.max] };
}
export function boxCorners(bounds) {
  return Array.from({ length: 8 }, (_, mask) => bounds.min.map((v, i) => mask & (1 << i) ? bounds.max[i] : v));
}
const center = bounds => mix(bounds.min, bounds.max, 0.5);
const radius = bounds => length(subtract(bounds.max, bounds.min)) / 2;

/** Exact perspective fit for all 8 AABB corners, including their camera depth. */
export function fitBounds(bounds, { direction, up = [0, 1, 0], aspect = 1, fov = 38, margin = 1.14, target = center(bounds) } = {}) {
  const b = validateBounds(bounds);
  assertVector(direction, 'direction');
  assertVector(up, 'up');
  assertVector(target, 'target');
  if (!(aspect > 0) || !Number.isFinite(aspect) || !(fov > 5 && fov < 120) || !(margin >= 1 && margin <= 2)) throw new RangeError('Invalid camera framing parameters');
  if (length(direction) < 1e-9 || length(cross(direction, up)) < 1e-9) throw new RangeError('Camera direction and up must be nonzero and nonparallel');
  const backward = normalize(direction), right = normalize(cross(up, backward)), cameraUp = normalize(cross(backward, right));
  const tanV = Math.tan(radians(fov) / 2), tanH = tanV * aspect;
  const r = radius(b);
  let distance = r * 0.05;
  for (const point of boxCorners(b)) {
    const relative = subtract(point, target), depth = dot(relative, backward);
    distance = Math.max(distance, depth + Math.abs(dot(relative, right)) * margin / tanH, depth + Math.abs(dot(relative, cameraUp)) * margin / tanV, depth + r * 0.05);
  }
  const position = add(target, multiply(backward, distance));
  const depths = boxCorners(b).map(point => dot(subtract(position, point), backward));
  return { position, target: [...target], up: cameraUp, fov, aspect, near: Math.max(r * 0.0001, Math.min(...depths) * 0.1), far: Math.max(...depths) + r, distance };
}

function viewingDirection(plan, azimuth, elevation) {
  const az = radians(azimuth), el = radians(elevation);
  return normalize(add(add(multiply(plan.forward, Math.cos(az) * Math.cos(el)), multiply(plan.right, Math.sin(az) * Math.cos(el))), multiply(plan.up, Math.sin(el))));
}

/**
 * Bounds are measured from the actual converted model. A detail requires its own
 * measured bounds and stable identifier; otherwise MAKE remains a whole-model view.
 * Custom forward/up only describe coordinates; they do not establish source units.
 */
export function createBendingActiveCameraPlan({ bounds, detail = null, aspect = 16 / 9, forward = [0, 0, 1], up = [0, 1, 0], fov = 38, modelRevision = 'unrecorded' }) {
  const b = validateBounds(bounds);
  assertVector(forward, 'forward'); assertVector(up, 'up');
  if (length(forward) < 1e-9 || length(up) < 1e-9 || length(cross(up, forward)) < 1e-9) throw new RangeError('forward and up must define a basis');
  const normalizedUp = normalize(up), right = normalize(cross(normalizedUp, forward));
  const planarForward = normalize(cross(right, normalizedUp));
  if (detail && (typeof detail.id !== 'string' || !detail.id.trim())) throw new TypeError('detail requires a stable inspected identifier');
  const detailBounds = detail ? validateBounds(detail.bounds, 'detail.bounds') : null;
  if (detailBounds && detailBounds.min.some((v, i) => v < b.min[i] - 1e-8 || detailBounds.max[i] > b.max[i] + 1e-8)) throw new RangeError('detail.bounds must lie inside the supplied model bounds');
  const plan = { version: 1, modelRevision, bounds: b, aspect, fov, up: normalizedUp, right, forward: planarForward, detail: detail ? { id: detail.id, bounds: detailBounds } : null };
  // Validate optical values once, before a render callback can run.
  fitBounds(b, { direction: viewingDirection(plan, 28, 16), up: normalizedUp, aspect, fov });
  return plan;
}

const frames = [
  { id: 'form', azimuth: 28, elevation: 16, margin: 1.17 },
  { id: 'system', azimuth: -28, elevation: 10, margin: 1.12 },
  { id: 'make', azimuth: 12, elevation: 14, margin: 1.12 },
];
export function chapterAt(value) { const u = clamp(value); return u < 0.3 ? 'form' : u < 0.7 ? 'system' : 'make'; }

function recipe(value) {
  const u = clamp(value);
  if (u < 0.14) return { a: 0, b: 0, t: 0 };
  if (u < 0.45) return { a: 0, b: 1, t: ease((u - 0.14) / 0.31) };
  if (u < 0.64) return { a: 1, b: 1, t: 0 };
  if (u < 0.90) return { a: 1, b: 2, t: ease((u - 0.64) / 0.26) };
  return { a: 2, b: 2, t: 0 };
}

/** Pure u -> pose. Reversible; no elapsed-time speed, simulation, or camera mutation. */
export function sampleBendingActivePose(plan, value, { reducedMotion = false, chapter = chapterAt(value) } = {}) {
  const u = clamp(value);
  if (!frames.some(frame => frame.id === chapter)) throw new RangeError('Unknown chapter');
  const sampled = reducedMotion ? { a: frames.findIndex(frame => frame.id === chapter), b: frames.findIndex(frame => frame.id === chapter), t: 0 } : recipe(u);
  const a = frames[sampled.a], b = frames[sampled.b], t = sampled.t;
  const detailAmount = (sampled.a === 2 ? 1 : 0) + ((sampled.b === 2 ? 1 : 0) - (sampled.a === 2 ? 1 : 0)) * t;
  const targetBounds = plan.detail ? { min: mix(plan.bounds.min, plan.detail.bounds.min, detailAmount), max: mix(plan.bounds.max, plan.detail.bounds.max, detailAmount) } : plan.bounds;
  const pose = fitBounds(targetBounds, {
    direction: viewingDirection(plan, a.azimuth + (b.azimuth - a.azimuth) * t, a.elevation + (b.elevation - a.elevation) * t),
    up: plan.up, aspect: plan.aspect, fov: plan.fov, margin: a.margin + (b.margin - a.margin) * t,
  });
  // Include the full model in the depth range even when the crop targets a detail.
  const backward = normalize(subtract(pose.position, pose.target));
  const allDepths = boxCorners(plan.bounds).map(point => dot(subtract(pose.position, point), backward));
  pose.near = Math.max(radius(plan.bounds) * 0.0001, Math.min(pose.near, Math.min(...allDepths) * 0.1));
  pose.far = Math.max(pose.far, Math.max(...allDepths) + radius(plan.bounds));
  return { ...pose, owner: 'procedural-story', chapter, progress: u, focusBounds: targetBounds, detailId: plan.detail?.id ?? null, detailStatus: plan.detail ? 'inspected-detail-bounds' : 'whole-model-fallback', motionKind: reducedMotion ? 'static-chapter-pose' : 'deterministic-procedural', modelRevision: plan.modelRevision };
}

/** Optional explicit Inspect mode; the same one-dimensional pointer semantic. */
export function sampleBendingActiveInspection(plan, value) {
  const u = clamp(value);
  return { ...fitBounds(plan.bounds, { direction: viewingDirection(plan, -55 + 110 * u, 14), up: plan.up, aspect: plan.aspect, fov: plan.fov, margin: 1.12 }), owner: 'procedural-inspection', progress: u, motionKind: 'deterministic-procedural', modelRevision: plan.modelRevision };
}

/** Read the actual DOM chapter ranges once in the caller; no layout reads here. */
export function progressFromAnchors(scrollY, anchors) {
  const stops = [0, 0.3, 0.7, 1];
  if (!Number.isFinite(scrollY) || !Array.isArray(anchors) || anchors.length !== 4 || !anchors.every(Number.isFinite) || anchors.some((v, i) => i > 0 && v <= anchors[i - 1])) throw new RangeError('Provide increasing form/system/make/end scroll offsets');
  if (scrollY <= anchors[0]) return 0;
  if (scrollY >= anchors[3]) return 1;
  const i = anchors.findIndex((v, index) => index < 3 && scrollY >= v && scrollY < anchors[index + 1]);
  return stops[i] + (stops[i + 1] - stops[i]) * (scrollY - anchors[i]) / (anchors[i + 1] - anchors[i]);
}
