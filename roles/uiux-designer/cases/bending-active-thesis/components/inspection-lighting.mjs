/** Lighting / Scene Designer: source-fixed reading studies and continuous score.
 * Original artistic lighting, not analysis, measured metal or optical validation.
 * No Three, source mutation, camera input or clock. The standalone study preserves
 * explicit choices; the Round 05 export composes them with caller-owned progress.
 */
import {SCENE_ANCHORS, sampleSceneDirection} from './scene-direction.mjs';

export const INSPECTION_LIGHT_PRESETS = Object.freeze(['studio', 'raking', 'silhouette']);
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const srgbToLinear = value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4;
const rgb = hex => [1, 3, 5].map(offset => srgbToLinear(parseInt(hex.slice(offset, offset + 2), 16) / 255));
const warm = rgb('#fff7ef'), cool = rgb('#cbd8e4'), dark = rgb('#101519');
const rotateY = (position, angle) => {
  const cosine = Math.cos(angle), sine = Math.sin(angle);
  return [position[0] * cosine + position[2] * sine, position[1], -position[0] * sine + position[2] * cosine];
};

/** Complete scene-direction-compatible result. All colours are linear RGB.
 * Area positions use source-radius offsets from the ORIGINAL combined centre.
 * Directional positions are metre offsets along the same ray from that centre.
 * Parent binds backgroundColor to scene.background and restores null on exit.
 */
export function sampleInspectionLighting({preset = 'studio', azimuth = 0} = {}) {
  if (!INSPECTION_LIGHT_PRESETS.includes(preset)) throw new RangeError('Unknown inspection lighting preset');
  if (typeof azimuth !== 'number' || !Number.isFinite(azimuth)) throw new RangeError('Expected a finite lamp azimuth in degrees');
  const angleDegrees = clamp(azimuth, -70, 70), angle = angleDegrees * Math.PI / 180;
  const silhouette = preset === 'silhouette', raking = preset === 'raking';
  const keyRay = rotateY(raking ? [-1.85, .38, 1.05] : [-1.10, 1.35, 1.20], angle);
  const rimRay = rotateY([1.25, .75, -.95], angle);
  const fillRay = rotateY([1.1, .85, 1.55], angle);
  const intensity = value => silhouette ? 0 : value;
  const direction = sampleSceneDirection(SCENE_ANCHORS[1]);
  direction.owner = 'inspection-lighting';
  direction.inspection = {
    preset, azimuth: angleDegrees,
    purpose: silhouette ? 'Read outer contour and actual openings' : raking ? 'Read actual folds and openings under grazing light' : 'Read the complete source form under broad light',
    measuredLighting: false,
  };
  direction.backgroundColor = silhouette ? rgb('#9da8ac') : null;
  direction.key = {position: keyRay.map(value => value * 3), target: [0, 0, 0], color: [...warm], intensity: intensity(raking ? .9 : .8), castShadow: !silhouette};
  direction.fill = {position: fillRay.map(value => value * 3), target: [0, 0, 0], color: [...cool], intensity: intensity(raking ? .03 : .12), castShadow: false};
  direction.rim = {position: rimRay.map(value => value * 3), target: [0, 0, 0], color: [...cool], intensity: intensity(raking ? .22 : .25), castShadow: false};
  direction.hemisphere = {sky: [...cool], ground: [...dark], intensity: intensity(raking ? .03 : .10)};
  direction.environmentIntensity = intensity(raking ? .06 : .20);
  direction.groundColor = [...dark]; direction.groundOpacity = 0;
  direction.haze = {type: 'exp2', color: [...dark], density: 0};
  direction.halo = {color: [...cool], opacity: 0, blend: 'screen'};
  direction.contactOpacity = 0; // Reserved field; actual contact uses the key shadow.
  direction.stage = {...direction.stage, lightFrame: 'source', surfaceVisible: !silhouette, baseEmphasis: 1, subjectSide: 0};
  direction.exhibition = {
    owner: 'exhibition-stage', units: 'source-radius', authoredSetting: true,
    key: {position: keyRay, size: raking ? [.26, 1.75] : [2.3, 1.6], color: [...warm], intensity: intensity(raking ? 7.0 : 4.2)},
    rim: {position: rimRay, size: [.40, 1.70], color: [...cool], intensity: intensity(raking ? 2.5 : 3.8)},
    aperture: {radiance: 0, spread: 1.8, color: [...cool]},
    backdrop: {color: [...dark], roughness: .93},
  };
  return direction;
}

// Round 05: the continuous page reuses the two useful surface-reading states.
// Silhouette remains a historical standalone score, not an inline page mode:
// changing an opaque background beneath reading content needs a separate design.
export const CONTINUOUS_LIGHT_PRESETS = Object.freeze(['studio', 'raking']);
const lightFields = ['key', 'fill', 'rim', 'hemisphere', 'environmentIntensity', 'groundColor', 'groundOpacity', 'haze', 'halo', 'contactOpacity', 'exhibition'];
const interpolate = (a, b, t, field = '') => {
  if (t === 0) return structuredClone(a);
  if (t === 1) return structuredClone(b);
  if (typeof a === 'number') return a + (b - a) * t;
  if (field === 'position') {
    // A straight chord between distant lamp directions can pass through the
    // source. Blend unit directions and radial distance separately instead.
    // This is geometry interpolation, not another easing or temporal response.
    const ar = Math.hypot(...a), br = Math.hypot(...b);
    const unit = a.map((value, i) => value / ar + (b[i] / br - value / ar) * t);
    const length = Math.hypot(...unit), radius = ar + (br - ar) * t;
    if (length < 1e-8) throw new RangeError('Authored lamp directions cannot be antipodal');
    return unit.map(value => value / length * radius);
  }
  if (Array.isArray(a)) return a.map((value, index) => interpolate(value, b[index], t));
  if (a && typeof a === 'object') return Object.fromEntries(Object.keys(a).map(key => [key, interpolate(a[key], b[key], t, key)]));
  return a; // Shared metadata/booleans; continuous modes do not switch them.
};
const bounded = (value, low, high, name) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new RangeError(`Expected finite ${name}`);
  return clamp(value, low, high);
};
function surfaceStudy(direction, preset, azimuth = 0) {
  const study = sampleInspectionLighting({preset, azimuth});
  const result = structuredClone(direction);
  for (const field of lightFields) result[field] = study[field];
  return result;
}

const continuousAnchors = SCENE_ANCHORS.map((u, index) => {
  let direction = sampleSceneDirection(u);
  direction.backgroundColor = null;
  direction.stage = {...direction.stage, lightFrame: 'source', surfaceOpacity: 1, surfaceVisible: true, baseEmphasis: 1};
  // Match the shadow key/rim rays to the broad fixtures. Offsets stay relative
  // to the original center even when verified source layers separate.
  direction.key.position = direction.exhibition.key.position.map(value => value * 3);
  direction.rim.position = direction.exhibition.rim.position.map(value => value * 3);
  if (index >= 1 && index <= 3) direction = surfaceStudy(direction, index === 1 ? 'studio' : 'raking');
  if (index === 4) {
    for (const id of ['key', 'fill', 'rim']) direction[id].intensity *= .7;
    for (const id of ['key', 'rim']) direction.exhibition[id].intensity *= .65;
    direction.hemisphere.intensity *= .7;
    direction.environmentIntensity *= .7;
    direction.exhibition.aperture.radiance = 0;
  }
  return direction;
});

/**
 * Round 05 complete source-frame story + inline study score. stageU and both
 * weights have ALREADY been advanced/eased by the shared reading controller.
 * No camera, clock, acceleration modulation or second damping is introduced.
 * studyMix is 0 Studio / 1 Raking; pass the caller's damped numeric value to
 * avoid a discontinuous string-preset change. The string is an endpoint fallback.
 * Background stays null and all surfaces retain numeric opacity; no pale flash.
 */
export function sampleContinuousLighting(stageU, {
  reducedMotion = false, studyWeight = 0, studyPreset = 'studio', studyMix,
  lightAzimuth = 0,
} = {}) {
  const u = bounded(stageU, 0, 1, 'stageU');
  const weight = bounded(studyWeight, 0, 1, 'study weight');
  if (!CONTINUOUS_LIGHT_PRESETS.includes(studyPreset)) throw new RangeError('Continuous lighting supports Studio and Raking only');
  const blend = bounded(studyMix === undefined ? (studyPreset === 'raking' ? 1 : 0) : studyMix, 0, 1, 'study mix');
  const azimuth = bounded(lightAzimuth, -70, 70, 'lamp azimuth');
  let slot = clamp((reducedMotion ? SCENE_ANCHORS[1] : u) * 7 - .5, 0, 6);
  const nearest = Math.round(slot);
  if (Math.abs(slot - nearest) < 1e-12) slot = nearest;
  const from = Math.floor(slot), to = Math.min(6, from + 1);
  const story = interpolate(continuousAnchors[from], continuousAnchors[to], slot - from);
  let result = story;
  if (weight > 0) {
    const study = blend === 0 ? surfaceStudy(story, 'studio', azimuth) : blend === 1 ? surfaceStudy(story, 'raking', azimuth) : interpolate(surfaceStudy(story, 'studio', azimuth), surfaceStudy(story, 'raking', azimuth), blend);
    result = interpolate(story, study, weight);
  }
  result.owner = 'continuous-lighting'; result.reducedMotion = reducedMotion;
  result.transition = {from: continuousAnchors[from].transition.from, to: continuousAnchors[to].transition.to, weight: slot - from};
  result.study = {weight, mix: blend, azimuth, measuredLighting: false};
  return result;
}
