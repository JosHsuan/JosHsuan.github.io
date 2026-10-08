/** Lighting Designer + Scene Designer: an original editorial score.
 * Round 03 supersedes the historical Round 02 catalog's intensity endpoints.
 * Rationale: roles/scene-designer/research/ROUND_03_STAGE_LIGHT.md.
 * This module samples values only: no Three.js, DOM, timers or property writes.
 * Input is Motion Designer's already-eased stageU, with chapter holds at
 * (index + 0.5) / 7. Do not pass raw native scroll or apply another hold curve.
 */
export const SCENE_CHAPTERS = Object.freeze(['overview', 'form', 'system', 'pattern', 'make', 'validation', 'credits']);
export const SCENE_ANCHORS = Object.freeze(SCENE_CHAPTERS.map((_, index) => (index + 0.5) / 7));

const mix = (a, b, t) => a + (b - a) * t;
const mixVector = (a, b, t) => a.map((value, index) => mix(value, b[index], t));
const srgbChannelToLinear = value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
const rgb = hex => [1, 3, 5].map(offset => srgbChannelToLinear(parseInt(hex.slice(offset, offset + 2), 16) / 255));
const clamp = value => Math.max(0, Math.min(1, value));

// Directional lights retain one contact-shadow owner. Broad area lights in the
// exhibition module now shape the metal; the busy source HDR is only a low fill.
const authored = [
  {key: [-3, 3.8, 2.6], keyI: 1.15, rim: [3, 1.5, -2], rimI: .55, tint: '#c8dce8', fillI: .10, env: .19, contact: .34, halo: 0, base: .85, ground: .45, groundTint: '#15191b', haze: .060, side: 1},
  {key: [-2.5, 4.5, 3], keyI: 1.35, rim: [2, 2, -3.5], rimI: .65, tint: '#d3e1e8', fillI: .15, env: .24, contact: .38, halo: 0, base: 1, ground: .55, groundTint: '#191d1f', haze: .042, side: 1},
  {key: [-4, 2, 1], keyI: .85, rim: [3, 2.8, -1], rimI: .85, tint: '#afcce0', fillI: .09, env: .17, contact: .28, halo: 0, base: .80, ground: .40, groundTint: '#121a20', haze: .068, side: 1},
  {key: [-4.5, 1.3, 1.7], keyI: .95, rim: [2.5, 1, -3], rimI: .90, tint: '#cfdfeb', fillI: .08, env: .16, contact: .24, halo: 0, base: .70, ground: .32, groundTint: '#12171c', haze: .076, side: 1},
  {key: [3.3, 3.8, 1.5], keyI: 1.25, rim: [-3, 2, -2], rimI: .45, tint: '#e8d5bd', fillI: .17, env: .25, contact: .46, halo: 0, base: 1, ground: .60, groundTint: '#1b1b1b', haze: .038, side: -1},
  {key: [-1, 4, 4], keyI: 1.4, rim: [3, 2, -3], rimI: .40, tint: '#d9e1e4', fillI: .18, env: .28, contact: .40, halo: 0, base: 1, ground: .58, groundTint: '#1a1d1f', haze: .033, side: 1},
  {key: [-3, 4, 3], keyI: 1.10, rim: [3, 2, -3], rimI: .55, tint: '#cbdde4', fillI: .14, env: .22, contact: .38, halo: 0, base: .95, ground: .48, groundTint: '#15191b', haze: .048, side: 0},
].map(value => ({...value, rimColor: rgb(value.tint), groundColor: rgb(value.groundTint)}));
// Position and size use the ORIGINAL combined source radius, not animated shell
// separation. Positive Z is toward the camera in an editorial horizontal frame.
const exhibition = [
  {key: [-1.15, 1.35, 1.15], size: [2.10, 1.35], keyI: 3.8, rim: [1.20, .90, -.80], rimSize: [.38, 1.70], rimI: 6.0, keyTint: '#fff0da', practical: 1.9, spread: 1.55, wall: '#151e24'},
  {key: [-.85, 1.65, 1.30], size: [2.50, 1.65], keyI: 4.2, rim: [1.15, 1.10, -.95], rimSize: [.40, 1.85], rimI: 5.2, keyTint: '#fff5e7', practical: 1.6, spread: 1.80, wall: '#1c2327'},
  {key: [-1.45, 1.10, .65], size: [1.75, 1.50], keyI: 3.6, rim: [1.05, 1.15, -.85], rimSize: [.35, 1.90], rimI: 7.5, keyTint: '#e7f0f6', practical: 2.0, spread: 1.60, wall: '#101c28'},
  {key: [-1.65, .65, .80], size: [1.15, 1.80], keyI: 4.0, rim: [1.20, .80, -.80], rimSize: [.26, 1.65], rimI: 8.0, keyTint: '#e9edf5', practical: 2.2, spread: 1.45, wall: '#131c29'},
  {key: [.95, 1.55, 1.35], size: [2.60, 1.75], keyI: 4.6, rim: [-1.20, .95, -.95], rimSize: [.60, 1.60], rimI: 3.5, keyTint: '#ffebd2', practical: .75, spread: 1.95, wall: '#23211e'},
  {key: [-.60, 1.75, 1.20], size: [2.80, 1.80], keyI: 4.8, rim: [1.15, 1.10, -.85], rimSize: [.70, 1.65], rimI: 3.8, keyTint: '#fff7ed', practical: .60, spread: 2.05, wall: '#1d2327'},
  {key: [-1.05, 1.40, 1.30], size: [2.30, 1.50], keyI: 4.2, rim: [1.20, 1.00, -.85], rimSize: [.45, 1.80], rimI: 4.8, keyTint: '#fff1df', practical: 1.35, spread: 1.80, wall: '#141d23'},
].map(value => ({...value, keyColor: rgb(value.keyTint), wallColor: rgb(value.wall)}));
const keyColor = rgb('#fff2df');
const fillColor = rgb('#bfdaef');
const hemisphereGround = rgb('#161b20');
const backdropColor = rgb('#060b0f');

function blendAt(stageU) {
  const slot = Math.max(0, Math.min(6, stageU * 7 - 0.5));
  // Eliminate floating-point neighbours at exact documented chapter anchors.
  const nearest = Math.round(slot);
  const exact = Math.abs(slot - nearest) < 1e-12 ? nearest : slot;
  const from = Math.floor(exact), to = Math.min(6, from + 1);
  return {from, to, weight: exact - from};
}

/**
 * All colours are LINEAR RGB arrays. Apply with Color.fromArray(), not a second
 * sRGB conversion. Light positions are metre offsets from the verified combined
 * shell/base centre; the parent binding translates position and target together.
 * Ground is an editorial presentation plane, never a replacement source base.
 */
export function sampleSceneDirection(stageU, {reducedMotion = false} = {}) {
  if (typeof stageU !== 'number' || !Number.isFinite(stageU)) throw new RangeError('Expected finite normalized stageU');
  const u = reducedMotion ? SCENE_ANCHORS[6] : clamp(stageU);
  const {from, to, weight: t} = blendAt(u), a = authored[from], b = authored[to];
  const keyPosition = mixVector(a.key, b.key, t), fillIntensity = mix(a.fillI, b.fillI, t);
  const color = mixVector(a.rimColor, b.rimColor, t);
  const groundColor = mixVector(a.groundColor, b.groundColor, t);
  const ea = exhibition[from], eb = exhibition[to];
  return {
    owner: 'scene-direction', colorSpace: 'linear-srgb', reducedMotion,
    transition: {from: SCENE_CHAPTERS[from], to: SCENE_CHAPTERS[to], weight: t},
    key: {position: keyPosition, target: [0, 0, 0], color: [...keyColor], intensity: mix(a.keyI, b.keyI, t), castShadow: true},
    fill: {position: [-keyPosition[0] * .65, 2.2, 3.5], target: [0, 0, 0], color: [...fillColor], intensity: fillIntensity, castShadow: false},
    rim: {position: mixVector(a.rim, b.rim, t), target: [0, 0, 0], color, intensity: mix(a.rimI, b.rimI, t), castShadow: false},
    hemisphere: {sky: [...fillColor], ground: [...hemisphereGround], intensity: fillIntensity * .65},
    environmentIntensity: mix(a.env, b.env, t),
    groundColor, groundOpacity: mix(a.ground, b.ground, t),
    contactOpacity: mix(a.contact, b.contact, t),
    haze: {type: 'exp2', color: [...backdropColor], density: mix(a.haze, b.haze, t)},
    halo: {color: [...color], opacity: reducedMotion ? 0 : mix(a.halo, b.halo, t), blend: 'screen'},
    exhibition: {
      owner: 'exhibition-stage', units: 'source-radius', authoredSetting: true,
      key: {position: mixVector(ea.key, eb.key, t), size: mixVector(ea.size, eb.size, t), color: mixVector(ea.keyColor, eb.keyColor, t), intensity: mix(ea.keyI, eb.keyI, t)},
      rim: {position: mixVector(ea.rim, eb.rim, t), size: mixVector(ea.rimSize, eb.rimSize, t), color: [...color], intensity: mix(ea.rimI, eb.rimI, t)},
      aperture: {radiance: mix(ea.practical, eb.practical, t), spread: mix(ea.spread, eb.spread, t), color: [...color]},
      backdrop: {color: mixVector(ea.wallColor, eb.wallColor, t), roughness: .93},
    },
    stage: {
      baseEmphasis: mix(a.base, b.base, t), subjectSide: mix(a.side, b.side, t),
      groundYPolicy: 'combined-bounds-min-minus-offset', groundOffsetM: .004,
      exhibitionOwnsFloor: true,
      groundExtentMultiplier: 3.2, groundRoughness: .92, sourceBaseRequired: true,
      shadow: {mapSize: 1024, bias: -.00008, normalBias: .008, boundsMargin: 1.3},
    },
  };
}

/** Resolve presentation geometry only from current verified shell + base bounds.
 * The caller may include editorial part offsets in these bounds. No source IDs,
 * dimensions, base geometry or fabrication facts are invented by this helper.
 */
export function resolveSceneStage(bounds, direction = sampleSceneDirection(1, {reducedMotion: true})) {
  if (!bounds || !['min', 'max'].every(key => Array.isArray(bounds[key]) && bounds[key].length === 3 && bounds[key].every(Number.isFinite)) || bounds.min.some((value, index) => value > bounds.max[index])) throw new RangeError('Expected finite ordered combined bounds');
  const size = bounds.min.map((value, index) => bounds.max[index] - value);
  const diagonal = Math.hypot(...size);
  if (!Number.isFinite(diagonal) || diagonal <= 0) throw new RangeError('Expected nonempty combined bounds');
  const center = bounds.min.map((value, index) => value + size[index] / 2);
  const {groundOffsetM, groundExtentMultiplier, shadow} = direction.stage;
  const radius = diagonal / 2;
  return {
    center, radius,
    groundPosition: [center[0], bounds.min[1] - groundOffsetM, center[2]],
    groundSize: [Math.max(size[0], radius) * groundExtentMultiplier, Math.max(size[2], radius) * groundExtentMultiplier],
    lightTarget: [...center],
    shadowHalfExtent: radius * shadow.boundsMargin,
  };
}
