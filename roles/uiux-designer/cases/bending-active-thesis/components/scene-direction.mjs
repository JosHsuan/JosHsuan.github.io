/** Lighting Designer + Scene Designer: an original editorial score.
 * Authored from roles/{lighting-designer,scene-designer}/catalog/chapters.json.
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

// Key/rim positions, intensities, environment and contact values follow the
// reviewed role catalog. A weak opposite fill opens the back-facing shell while
// the hemisphere provides a quiet ambient floor; neither casts another shadow.
const authored = [
  {key: [-3, 3.8, 2.6], keyI: 3.8, rim: [3, 1.5, -2], rimI: 2, tint: '#b5d0e2', fillI: .30, env: .75, contact: .34, halo: .15, base: .70, ground: .25, groundTint: '#141b1e', haze: .037, side: 1},
  {key: [-2.5, 4.5, 3], keyI: 4.4, rim: [2, 2, -3.5], rimI: 2.2, tint: '#c2d5dd', fillI: .45, env: .90, contact: .38, halo: .10, base: .85, ground: .32, groundTint: '#172024', haze: .030, side: 1},
  {key: [-4, 2, 1], keyI: 3, rim: [3, 2.8, -1], rimI: 3.1, tint: '#a9cfe1', fillI: .26, env: .65, contact: .28, halo: .20, base: .45, ground: .18, groundTint: '#101d25', haze: .044, side: 1},
  {key: [-4.5, 1.3, 1.7], keyI: 4.6, rim: [2.5, 1, -3], rimI: 2.5, tint: '#d0e8ed', fillI: .20, env: .55, contact: .24, halo: .26, base: .35, ground: .12, groundTint: '#10191d', haze: .048, side: 1},
  {key: [3.3, 3.8, 1.5], keyI: 4.2, rim: [-3, 2, -2], rimI: 1.8, tint: '#e0c3a0', fillI: .40, env: .80, contact: .46, halo: .12, base: 1, ground: .42, groundTint: '#272019', haze: .032, side: -1},
  {key: [-1, 4, 4], keyI: 3.6, rim: [3, 2, -3], rimI: 1.4, tint: '#c4d2d6', fillI: .48, env: .85, contact: .40, halo: .08, base: .80, ground: .35, groundTint: '#192024', haze: .028, side: 1},
  {key: [-3, 4, 3], keyI: 3.5, rim: [3, 2, -3], rimI: 1.6, tint: '#bdd1d7', fillI: .40, env: .82, contact: .38, halo: .08, base: .80, ground: .30, groundTint: '#141b1e', haze: .030, side: 0},
].map(value => ({...value, rimColor: rgb(value.tint), groundColor: rgb(value.groundTint)}));
const keyColor = rgb('#fff2df');
const fillColor = rgb('#bfdaef');
const hemisphereGround = rgb('#161b20');
const backdropColor = rgb('#091217');

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
    stage: {
      baseEmphasis: mix(a.base, b.base, t), subjectSide: mix(a.side, b.side, t),
      groundYPolicy: 'combined-bounds-min-minus-offset', groundOffsetM: .004,
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
