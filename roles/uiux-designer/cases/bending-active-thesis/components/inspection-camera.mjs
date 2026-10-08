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

/** Compose a bounded source study into the existing story camera. Weight is
 * already authored/damped by the shared reading controller: no clock or easing
 * lives here. storyPose.fov MUST be its effective optical FOV, including the
 * story lens, so the final writer must not multiply this result by another lens.
 * The fixed maximum-separation envelope fits fully at weight 1. Intermediate
 * frames are intentional composition transitions, not full-source evidence.
 */
export function sampleInlineStudyPose({storyPose, weight = 0, ...studyInput} = {}) {
  const w = Math.max(0, Math.min(1, Number.isFinite(weight) ? weight : 0));
  const vector = value => Array.isArray(value) && value.length === 3 && value.every(Number.isFinite);
  if (!storyPose || !vector(storyPose.position) || !vector(storyPose.target)
    || !(storyPose.fov > 0 && storyPose.fov < 180)
    || !Number.isFinite(storyPose.viewOffsetNormalized?.x) || !Number.isFinite(storyPose.viewOffsetNormalized?.y)) {
    throw new RangeError('Inline study requires a finite resolved story pose and effective FOV.');
  }
  if (w === 0) return {...storyPose, studyWeight: 0};
  const study = sampleInspectionPose(studyInput);
  if (w === 1) return {...study, chapter:storyPose.chapter, owner: 'cinematic-composite', kind: 'continuous-inline-source-study', framingIntent: 'held-source-study', studyWeight: 1};
  const mix = (a, b) => a + (b - a) * w;
  const from = storyPose.position.map((value, i) => value - storyPose.target[i]);
  const fromDistance = Math.hypot(...from);
  if (!(fromDistance > 1e-8)) throw new RangeError('Story camera and target must differ.');
  const fromAzimuth = Math.atan2(from[0], from[2]), toAzimuth = rad(study.azimuth);
  // The shortest angular path avoids a camera crossing its target, unlike a
  // Cartesian position lerp between opposed views. Elevation stays above ground.
  const azimuthDelta = Math.atan2(Math.sin(toAzimuth - fromAzimuth), Math.cos(toAzimuth - fromAzimuth));
  const azimuth = fromAzimuth + azimuthDelta * w;
  const elevation = mix(Math.asin(Math.max(-1, Math.min(1, from[1] / fromDistance))), rad(study.elevation));
  const back = [Math.sin(azimuth) * Math.cos(elevation), Math.sin(elevation), Math.cos(azimuth) * Math.cos(elevation)];
  const target = storyPose.target.map((value, i) => mix(value, study.target[i]));
  const distance = mix(fromDistance, study.distance);
  const position = target.map((value, i) => value + back[i] * distance);
  const corners = Array.from({length: 8}, (_, mask) => studyInput.bounds.min.map((value, i) => (mask & (1 << i) ? studyInput.bounds.max[i] : value)));
  const depths = corners.map(point => dot(position.map((value, i) => value - point[i]), back));
  const radius = Math.hypot(...studyInput.bounds.max.map((value, i) => value - studyInput.bounds.min[i])) / 2;
  const viewOffsetNormalized = {x: mix(storyPose.viewOffsetNormalized.x, study.viewOffsetNormalized.x), y: mix(storyPose.viewOffsetNormalized.y, study.viewOffsetNormalized.y)};
  // Interpolate projection scale rather than degrees; this keeps apparent size
  // continuous while preserving the exact endpoint lens and viewport fit.
  const fov = 2 * Math.atan(mix(Math.tan(rad(storyPose.fov) / 2), Math.tan(rad(study.fov) / 2))) * 180 / Math.PI;
  return {...storyPose, position, target, up: [0, 1, 0], fov, aspect: study.aspect,
    near: Math.max(radius * .0001, Math.min(...depths) * .08), far: Math.max(...depths) + radius * 2,
    viewOffsetNormalized, compositionNDC: [-2 * viewOffsetNormalized.x, 2 * viewOffsetNormalized.y],
    sourcePresence: 1, modelVisibility: 1, surfaceEmphasis: (storyPose.surfaceEmphasis ?? 0) * (1 - w),
    owner: 'cinematic-composite', kind: 'continuous-inline-source-study', framingIntent: 'transition-crop',
    cropIntent: 'continuous passage into the complete source study; intermediate crop permitted',
    framingEvidence: study.framingEvidence, framingSupportPoints: study.framingSupportPoints,
    framingSourceSHA256: study.framingSourceSHA256, studyWeight: w,
    azimuth: azimuth * 180 / Math.PI, elevation: elevation * 180 / Math.PI, distance,
  };
}
