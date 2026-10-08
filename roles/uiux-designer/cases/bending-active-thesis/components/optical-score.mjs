// Cinematographer: all channels seek the shared response; this module owns no clock.
const clamp = (n, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, Number.isFinite(n) ? n : lo));
const mix = (a, b, t) => a + (b - a) * t;
const smooth = n => {const t = clamp(n); return t * t * t * (10 + t * (-15 + 6 * t));};
const names = ['overview', 'form', 'system', 'pattern', 'make', 'validation', 'credits'];
// Lens is relative to the geometry-framed camera; full-object/mobile fits survive.
const anchors = [
  {lens: 1.08, focus: .36, aperture: 18, blur: 3, ascii: 0, mist: .34, radius: 26},
  {lens: .96, focus: .5, aperture: 0, blur: 0, ascii: 0, mist: .18, radius: 18},
  {lens: 1.05, focus: .44, aperture: 27, blur: 4, ascii: .09, mist: .30, radius: 24},
  {lens: 1.16, focus: .37, aperture: 35, blur: 5, ascii: .20, mist: .42, radius: 30},
  {lens: 1.02, focus: .54, aperture: 0, blur: 0, ascii: 0, mist: .20, radius: 26},
  {lens: .98, focus: .5, aperture: 0, blur: 0, ascii: 0, mist: .16, radius: 22},
  {lens: .96, focus: .5, aperture: 0, blur: 0, ascii: 0, mist: .25, radius: 28},
];

export function focalLengthForFov(fov, aspect, filmGaugeMm = 35) {
  if (!(aspect > 0) || !Number.isFinite(aspect) || !(fov > 0 && fov < 180)) throw new RangeError('Finite camera aspect and vertical FOV required.');
  return .5 * filmGaugeMm / Math.max(aspect, 1) / Math.tan(fov * Math.PI / 360);
}

export function axialFocusRange(pose, bounds) {
  const vector = value => Array.isArray(value) && value.length === 3 && value.every(Number.isFinite);
  if (![pose?.position, pose?.target, bounds?.min, bounds?.max].every(vector) || bounds.min.some((v, i) => v > bounds.max[i])) throw new RangeError('Finite camera and source bounds required.');
  const forward = pose.target.map((v, i) => v - pose.position[i]);
  const length = Math.hypot(...forward);
  if (length < 1e-8) throw new RangeError('Camera position and target must differ.');
  const unit = forward.map(v => v / length);
  const near = Math.max(.00001, pose.near ?? .01), far = Math.max(near * 2, pose.far ?? 100);
  const depths = Array.from({length: 8}, (_, mask) => bounds.min.reduce((sum, v, i) => sum + ((mask & (1 << i) ? bounds.max[i] : v) - pose.position[i]) * unit[i], 0));
  return [clamp(Math.min(...depths), near * 1.01, far * .99), clamp(Math.max(...depths), near * 1.01, far * .99)];
}

export function sampleOpticalScore(input, pose, {bounds}) {
  const reduced = input.reducedMotion === true;
  const u = clamp(input.stageU), visual = clamp(input.visualU ?? u);
  const coordinate = clamp(u * 7 - .5, 0, 6), a = Math.floor(coordinate), b = Math.min(6, a + 1), t = coordinate - a;
  const local = Math.min(6, Math.floor(visual * 7)), phase = visual === 1 ? 1 : visual * 7 - local;
  const value = key => mix(anchors[a][key], anchors[b][key], t);
  const focusRangeM = axialFocusRange(pose, bounds);
  // A focus transfer deliberately continues through a selected stationary pose hold.
  const rack = [0, 2, 3].includes(local) ? (smooth((phase - .2) / .42) - .5) * .26 : 0;
  const rackEnvelope = Math.max(0, 1 - Math.abs(coordinate - local));
  const focusFraction = clamp(value('focus') + rack * rackEnvelope, .16, .8);
  const aspect = input.aspect ?? pose.aspect;
  const mobile = clamp((1.1 - aspect) / .5);
  const focalBase = focalLengthForFov(pose.fov, aspect);
  const lensRatio = reduced ? 1 : mix(value('lens'), 1 + (value('lens') - 1) * .3, mobile);
  // The camera's continuous off-frame passage now performs the editorial exit.
  // Keep the old flat veil control for diagnostics, but no authored black flash.
  const veil = 0;
  return {
    filmGaugeMm: 35,
    focalLengthMm: focalBase * lensRatio,
    focusDistanceM: mix(focusRangeM[0], focusRangeM[1], reduced ? .5 : focusFraction),
    focusRangeM,
    apertureScale: reduced ? 0 : value('aperture'),
    maxBlurPx: reduced ? 0 : value('blur') * mix(1, .65, mobile),
    asciiWeight: reduced ? 0 : value('ascii') * mix(1, .6, mobile),
    asciiCellPx: mix(11, 9, mobile),
    asciiBlend: 'screen-limited',
    asciiTint: [0.38, 0.75, 0.69], // linear RGB decorative tint
    mistStrength: reduced ? 0 : value('mist') * mix(1, .8, mobile),
    mistRadiusPx: value('radius') * mix(1, .8, mobile),
    mistThreshold: .65,
    veil,
    chapter: names[local], stageU: u, visualU: visual,
    opticalMode: reduced ? 'sharp-static' : 'axial-depth-gather',
    editKind: pose.sourcePresence === 0 ? 'source-absence' : pose.framingIntent === 'transition-crop' ? 'continuous-off-frame' : 'held-composition',
    source: 'source-bounds axial planes; artistic optics, not lens calibration',
  };
}
