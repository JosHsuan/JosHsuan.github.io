/** Lighting / Scene Designer: source-fixed, user-operated reading studies.
 * Original artistic lighting, not analysis, measured metal or optical validation.
 * No Three, source mutation, camera input, clock, story progress or reduced-motion
 * override: explicit user choices must work equally in Full, Light and Reduced.
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
