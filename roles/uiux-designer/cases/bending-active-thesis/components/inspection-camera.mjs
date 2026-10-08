// Pure inspection framing. The caller owns response timing and the only camera write.
import {INSPECTION_DEFAULTS, INSPECTION_LIMITS} from './inspection-state.mjs';
import {SOURCE_LAYER_REVISION} from './element-score.mjs';

const FOV = 36;
const PADDING = .03; // Three percent of the available viewport on each edge.
const rad = degrees => degrees * Math.PI / 180;
const dot = (a, b) => a.reduce((sum, value, i) => sum + value * b[i], 0);
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unit = vector => {const length = Math.hypot(...vector); return vector.map(value => value / length);};
const bounded = (value, key) => Math.max(INSPECTION_LIMITS[key][0], Math.min(INSPECTION_LIMITS[key][1], Number.isFinite(value) ? value : INSPECTION_DEFAULTS[key]));

function validateBounds(bounds) {
  if (!bounds || !['min', 'max'].every(key => Array.isArray(bounds[key]) && bounds[key].length === 3 && bounds[key].every(Number.isFinite))
    || bounds.min.some((value, i) => value > bounds.max[i]) || bounds.min.every((value, i) => value === bounds.max[i])) {
    throw new RangeError('Inspection framing requires nonempty finite source bounds.');
  }
}

/** viewport is the unobscured CSS rectangle normalized to the full Canvas.
 * bounds must remain the same original-plus-maximum-separation envelope while
 * the separation slider moves. This resolver does not read the current slider.
 * No lens multiplier is applied after this pose: use its 36-degree vertical FOV.
 */
export function sampleInspectionPose({bounds, aspect, azimuth, elevation, framingSupport, viewport = {left: 0, top: 0, width: 1, height: 1}} = {}) {
  validateBounds(bounds);
  if (!(aspect > 0) || !Number.isFinite(aspect)) throw new RangeError('Inspection framing requires a finite positive aspect.');
  if (!viewport || !['left', 'top', 'width', 'height'].every(key => Number.isFinite(viewport[key]))
    || viewport.left < 0 || viewport.top < 0 || viewport.width <= 0 || viewport.height <= 0
    || viewport.left + viewport.width > 1 + 1e-8 || viewport.top + viewport.height > 1 + 1e-8) {
    throw new RangeError('Inspection viewport must be a nonempty normalized rectangle inside the Canvas.');
  }
  const az = bounded(azimuth, 'azimuth'), el = bounded(elevation, 'elevation');
  const back = [Math.sin(rad(az)) * Math.cos(rad(el)), Math.sin(rad(el)), Math.cos(rad(az)) * Math.cos(rad(el))];
  const right = unit(cross([0, 1, 0], back)), cameraUp = cross(back, right);
  const target = bounds.min.map((value, i) => (value + bounds.max[i]) / 2);
  const corners = Array.from({length: 8}, (_, mask) => bounds.min.map((value, i) => (mask & (1 << i) ? bounds.max[i] : value) - target[i]));
  let support = corners;
  if (framingSupport !== undefined) {
    if (framingSupport?.sourceSHA256 !== SOURCE_LAYER_REVISION || !Array.isArray(framingSupport.points) || framingSupport.points.length < 4
      || !framingSupport.points.every(point => Array.isArray(point) && point.length === 3 && point.every((value, i) => Number.isFinite(value)
        && value >= bounds.min[i] - 1e-7 && value <= bounds.max[i] + 1e-7))) {
      throw new RangeError('Inspection support must match the pinned source SHA and remain inside its fixed envelope.');
    }
    support = framingSupport.points.map(point => point.map((value, i) => value - target[i]));
  }
  const radius = Math.hypot(...bounds.max.map((value, i) => value - bounds.min[i])) / 2;
  const tanV = Math.tan(rad(FOV) / 2), tanH = tanV * aspect;
  const halfWidth = viewport.width * (1 - PADDING * 2), halfHeight = viewport.height * (1 - PADDING * 2);
  // Perspective fit includes actual axial depth. Verified source support avoids
  // fitting empty AABB corners; bounds remain the fallback and clip-plane envelope.
  const distance = Math.max(radius * .01, ...support.map(point => dot(point, back)
    + Math.max(Math.abs(dot(point, right)) / (tanH * halfWidth), Math.abs(dot(point, cameraUp)) / (tanV * halfHeight))));
  const position = target.map((value, i) => value + back[i] * distance);
  const depths = corners.map(point => distance - dot(point, back));
  const shift = [2 * viewport.left + viewport.width - 1, 1 - 2 * viewport.top - viewport.height];
  return {
    position, target, up: [0, 1, 0], fov: FOV, aspect,
    near: Math.max(radius * .0001, Math.min(...depths) * .08),
    far: Math.max(...depths) + radius * 2,
    compositionNDC: shift,
    viewOffsetNormalized: {x: -shift[0] / 2, y: shift[1] / 2},
    sourcePresence: 1, modelVisibility: 1, surfaceEmphasis: 0,
    owner: 'inspection-composite', kind: 'user-controlled-source-inspection',
    framingIntent: 'source-inspection', cropIntent: 'complete maximum-separation source envelope',
    framingEvidence: framingSupport ? 'pinned actual-source endpoint convex support' : 'perspective fit of fixed source-envelope corners',
    framingSupportPoints: framingSupport?.points.length ?? 8,
    framingSourceSHA256: framingSupport?.sourceSHA256 ?? null,
    azimuth: az, elevation: el, viewport: {...viewport}, paddingFraction: PADDING, distance,
  };
}
