/** Round 06 visual direction. Pure chapter-owned loops, no clock or scene writes.
 * Input comes from Motion's autonomous playback, not wheel/scroll progress.
 * Camera cues must be resolved BEFORE source-support fitting. Representation
 * slots are editorial requests pending verified asset mapping, never generated
 * geometry, measured curvature, or a claim of structural simulation.
 */
export const CHAPTER_SCENE_IDS = Object.freeze(['overview', 'form', 'system', 'pattern', 'make', 'validation', 'credits']);
const TAU = Math.PI * 2;
const clamp = (n, a = 0, b = 1) => Math.max(a, Math.min(b, n));
const finite = (n, name) => {if (typeof n !== 'number' || !Number.isFinite(n)) throw new RangeError(`Expected finite ${name}`); return n;};
const keys = [
  // orbit/el/dolly/lens/focus travel; stable shadow key with real area/rim energy.
  {az: 5, el: 1.5, dolly: .025, lens: .015, focus: .43, rack: .10, blur: 2.5, aperture: 18, mist: .27, field: .24, sceneMix: .35, foreground: .35, key: .07, area: 5, rim: .12, blend: [0, 0, .75, .25], slots: 1},
  {az: 3.5, el: 1, dolly: .018, lens: 0, focus: .50, rack: .035, blur: .5, aperture: 3, mist: .10, field: .16, sceneMix: .50, foreground: .25, key: .045, area: 3, rim: .08, blend: [.15, 0, .7, .15], slots: 4},
  {az: 4.5, el: 1.8, dolly: .022, lens: 0, focus: .47, rack: .15, blur: 2.8, aperture: 20, mist: .17, field: .30, sceneMix: .40, foreground: .55, key: .06, area: 5.5, rim: .14, blend: [0, .1, .6, .3], slots: 4},
  {az: 6, el: 2, dolly: .03, lens: .02, focus: .42, rack: .18, blur: 3.2, aperture: 24, mist: .24, field: .38, sceneMix: .30, foreground: .65, key: .08, area: 6, rim: .18, blend: [0, 0, .55, .45], slots: 3},
  {az: 1.5, el: .5, dolly: .012, lens: 0, focus: .5, rack: .025, blur: 0, aperture: 0, mist: .08, field: .10, sceneMix: .18, foreground: .12, key: .035, area: 2, rim: .05, blend: [.3, .25, .25, .2], slots: 1},
  {az: 2, el: .6, dolly: .012, lens: 0, focus: .5, rack: .02, blur: 0, aperture: 0, mist: .07, field: .12, sceneMix: .25, foreground: .15, key: .03, area: 2.5, rim: .05, blend: [.1, .2, .45, .25], slots: 1},
  {az: 2.5, el: .8, dolly: .015, lens: 0, focus: .5, rack: .04, blur: 0, aperture: 0, mist: .12, field: .17, sceneMix: .35, foreground: .2, key: .04, area: 3, rim: .07, blend: [.1, 0, .7, .2], slots: 1},
];
function slots(count, phase) {
  const values = Array(count).fill(0), p = phase * count, index = Math.floor(p) % count, next = (index + 1) % count;
  // Closed continuous source-view request, not interpolation of source topology.
  const fraction = p - Math.floor(p), t = fraction * fraction * (3 - 2 * fraction);
  values[index] += 1 - t; values[next] += t; return values;
}

export function sampleChapterScene(playback, {reducedMotion = false, quality = 'full', aspect = 1, pointer = null} = {}) {
  const supplied = playback?.chapterWeights;
  if (!Array.isArray(supplied) || supplied.length !== 7 || !supplied.every(v => Number.isFinite(v) && v >= 0)) throw new RangeError('Seven finite nonnegative chapter weights required');
  const total = supplied.reduce((sum, value) => sum + value, 0);
  if (!(total > 0)) throw new RangeError('Chapter weights must contain a visible chapter');
  const weights = supplied.map(v => v / total);
  const phases = playback.phases ?? playback.chapters?.map(chapter => chapter.phase);
  if (!Array.isArray(phases) || phases.length !== 7 || !phases.every(Number.isFinite)) throw new RangeError('Seven finite chapter phases required');
  const time = Math.max(0, finite(playback.activeSeconds, 'active seconds'));
  if (!(finite(aspect, 'aspect') > 0)) throw new RangeError('Aspect must be positive');
  const mobile = clamp((1.1 - aspect) / .5), active = !reducedMotion, full = quality === 'full';
  const scalar = (key, sampler = value => value) => keys.reduce((sum, value, i) => sum + weights[i] * sampler(value[key], i), 0);
  const phase = i => ((phases[i] % 1) + 1) % 1;
  const wave = i => active ? Math.sin(phase(i) * TAU) : 0;
  const orbit = (value, i) => value * wave(i);
  const breathing = (value, i) => active ? value * (Math.cos(phase(i) * TAU) - 1) * .5 : 0;
  const pointerUv = pointer?.uv;
  const uv = Array.isArray(pointerUv) && pointerUv.length === 2 && pointerUv.every(Number.isFinite) ? pointerUv.map(v => clamp(v)) : [clamp(((pointer?.x ?? 0) + 1) / 2), clamp((1 - (pointer?.y ?? 0)) / 2)];
  const dominant = weights.indexOf(Math.max(...weights));
  return {
    owner: 'chapter-scene-score', chapter: CHAPTER_SCENE_IDS[dominant], chapterWeights: weights, activeSeconds: time,
    camera: {
      azimuthOffsetDeg: scalar('az', orbit) * (1 - mobile * .3), elevationOffsetDeg: scalar('el', (v, i) => v * (active ? Math.sin(phase(i) * TAU * 2) : 0)),
      distanceScale: 1 - scalar('dolly', breathing), fovScale: 1 + scalar('lens', breathing), fitOrder: 'apply cues then fit verified active source support',
    },
    optics: {focusFraction: clamp(scalar('focus') + scalar('rack', orbit), .16, .84), apertureScale: active && full ? scalar('aperture') : 0, maxBlurPx: active && full ? scalar('blur') * (1 - mobile * .35) : 0, mistStrength: active && full ? scalar('mist') * (1 - mobile * .2) : 0, mistRadiusPx: 22, mistThreshold: .65},
    light: {keyEnergy: 1 + scalar('key', orbit), areaAzimuthDeg: scalar('area', orbit), areaEnergy: 1 + scalar('key', (v, i) => v * (active ? Math.sin(phase(i) * TAU * 2) : 0)), rimEnergy: 1 + scalar('rim', orbit), shadowKeyPosition: 'fixed during chapter loop'},
    layers: {foregroundMix: active ? scalar('foreground') : 0, semanticFeatherPx: 40 + mobile * 12},
    field: {
      fieldTime: reducedMotion ? 0 : time, fieldWeight: active ? scalar('field') * (full ? 1 : .6) * (1 - mobile * .18) : 0,
      fieldSceneMix: scalar('sceneMix'), fieldFlow: [.035, -.018], fieldEnvelope: [mobile > .5 ? .5 : .65, .5, mobile > .5 ? .62 : .5, .62],
      fieldPointerUv: uv, fieldPointerStrength: active && pointer?.active === true ? clamp(pointer.strength ?? 1) : 0,
      fieldBlendMix: [0, 1, 2, 3].map(channel => keys.reduce((sum, key, i) => sum + key.blend[channel] * weights[i], 0)),
      asciiCellPx: 11 - mobile * 2, asciiTint: [.64, .29, .105],
    },
    representation: {sourceSlots: keys.map((key, i) => ({chapter: CHAPTER_SCENE_IDS[i], weight: weights[i], slots: slots(key.slots, phase(i))})), evidenceBound: false, policy: 'resolve only verified source assets; no topology morph or generated analysis colors'},
  };
}

/** Apply editorial fixture cues without moving the cached contact-shadow key.
 * Real area-light illumination moves; its unshadowed approximation and the
 * separate directional contact shadow are not a photometric light simulation.
 */
export function applyChapterLighting(direction, chapterScene) {
  const result = structuredClone(direction), cue = chapterScene.light;
  const angle = finite(cue.areaAzimuthDeg, 'area azimuth') * Math.PI / 180;
  const cosine = Math.cos(angle), sine = Math.sin(angle);
  result.key.intensity *= finite(cue.keyEnergy, 'key energy');
  result.rim.intensity *= finite(cue.rimEnergy, 'rim energy');
  // Round 06 source-study fill: keep grazing direction while making the satin
  // metal readable. This does not rewrite the historical inspection presets.
  const studyWeight = clamp((chapterScene.chapterWeights ?? []).slice(1, 4).reduce((sum, value) => sum + finite(value, 'chapter weight'), 0));
  result.environmentIntensity += Math.max(0, .32 - result.environmentIntensity) * studyWeight;
  result.fill.intensity += Math.max(0, .20 - result.fill.intensity) * studyWeight;
  result.hemisphere.intensity += Math.max(0, .15 - result.hemisphere.intensity) * studyWeight;
  for (const id of ['key', 'rim']) {
    const light = result.exhibition[id], [x, y, z] = light.position;
    light.position = [x * cosine + z * sine, y, -x * sine + z * cosine];
    light.intensity *= id === 'key' ? finite(cue.areaEnergy, 'area energy') : cue.rimEnergy;
  }
  return result;
}
