import test from 'node:test';
import assert from 'node:assert/strict';
import {sampleChapterScene, applyChapterLighting} from '../components/chapter-scene-score.mjs';
import {sampleContinuousLighting} from '../components/inspection-lighting.mjs';
import {sampleOpticalScore, focalLengthForFov} from '../components/optical-score.mjs';
import {normalizeProtectedRects, sampleSemanticMask} from '../components/scene-compositor.mjs';

const playback = (index, phase = .2, time = 4) => ({chapterWeights: Array.from({length: 7}, (_, i) => Number(i === index)), phases: Array(7).fill(phase), activeSeconds: time});
const near = (a, b, epsilon = 1e-9) => assert.ok(Math.abs(a - b) < epsilon, `${a} differs from ${b}`);
const numbers = value => typeof value === 'number' ? [value] : value && typeof value === 'object' ? Object.values(value).flatMap(numbers) : [];

test('every chapter has closed autonomous camera/light/focus cues and separate advancing field time', () => {
  for (let index = 0; index < 7; index++) {
    const a = sampleChapterScene(playback(index, 0, 0)), b = sampleChapterScene(playback(index, 1, 0));
    for (const group of ['camera', 'optics', 'light']) numbers(a[group]).forEach((value, i) => near(value, numbers(b[group])[i]));
    const later = sampleChapterScene(playback(index, .3, 5));
    assert.notEqual(later.camera.azimuthOffsetDeg, a.camera.azimuthOffsetDeg);
    assert.notEqual(later.optics.focusFraction, a.optics.focusFraction);
    assert.notEqual(later.light.rimEnergy, a.light.rimEnergy);
    assert.ok(later.field.fieldTime > a.field.fieldTime); assert.ok(later.field.fieldWeight > 0);
    assert.equal(later.light.shadowKeyPosition, 'fixed during chapter loop');
  }
});

test('interrupted transitions blend full chapter-weight snapshots, not only from/to labels', () => {
  const input = playback(0), weights = [.2, .3, .1, .4, 0, 0, 0]; input.chapterWeights = weights;
  const result = sampleChapterScene(input);
  for (const key of ['azimuthOffsetDeg', 'elevationOffsetDeg', 'distanceScale', 'fovScale']) {
    const expected = weights.reduce((sum, weight, index) => sum + weight * sampleChapterScene(playback(index)).camera[key], 0);
    near(result.camera[key], expected);
  }
  assert.deepEqual(result.chapterWeights, weights);
  const alternative = {...input, chapters: input.phases.map(phase => ({phase}))}; delete alternative.phases;
  assert.deepEqual(sampleChapterScene(alternative), result);
});

test('bounded authored loops preserve source identity and emit only generic, normalized representation requests', () => {
  const slots = sampleChapterScene(playback(1)).representation.sourceSlots;
  assert.equal(slots.find(value => value.chapter === 'form').slots.length, 4);
  assert.equal(slots.find(value => value.chapter === 'system').slots.length, 4);
  for (let index = 0; index < 7; index++) for (let i = 0; i <= 100; i++) {
    const score = sampleChapterScene(playback(index, i / 100, i), {aspect: .46});
    assert.ok(numbers(score).every(Number.isFinite));
    assert.ok(Math.abs(score.camera.azimuthOffsetDeg) <= 6); assert.ok(Math.abs(score.camera.elevationOffsetDeg) <= 2);
    assert.ok(score.camera.distanceScale >= 1 && score.camera.distanceScale <= 1.04);
    assert.ok(score.optics.focusFraction >= .16 && score.optics.focusFraction <= .84);
    assert.ok(score.light.keyEnergy > .9 && score.light.keyEnergy < 1.1);
    assert.equal(score.representation.evidenceBound, false);
    for (const item of score.representation.sourceSlots) near(item.slots.reduce((sum, value) => sum + value, 0), 1);
    assert.ok(!('geometry' in score) && !('material' in score));
  }
});

test('pause freezes through caller time, Reduced removes autonomous motion, and pointer affects only editorial field', () => {
  const input = {...playback(3), paused: true};
  assert.deepEqual(sampleChapterScene(input), sampleChapterScene(input));
  const reduced = sampleChapterScene(input, {reducedMotion: true, pointer: {x: .5, y: -.2, active: true}});
  assert.equal(reduced.camera.azimuthOffsetDeg, 0); assert.equal(reduced.field.fieldTime, 0); assert.equal(reduced.field.fieldWeight, 0);
  assert.equal(reduced.layers.foregroundMix, 0); assert.equal(reduced.optics.maxBlurPx, 0);
  const base = sampleChapterScene(input), pointer = sampleChapterScene(input, {pointer: {x: .5, y: -.2, active: true}});
  assert.deepEqual(pointer.camera, base.camera); assert.deepEqual(pointer.representation, base.representation);
  assert.deepEqual(pointer.field.fieldPointerUv, [.75, .6]); assert.equal(pointer.field.fieldPointerStrength, 1);
  assert.ok(sampleChapterScene(input, {quality: 'light'}).field.fieldWeight > 0);
  assert.equal(sampleChapterScene(input, {quality: 'light'}).optics.maxBlurPx, 0);
});

test('autonomous optics resolves focus from the final camera and never changes its fitted FOV', () => {
  const pose = {position: [0, .5, 8], target: [0, .5, 0], near: .01, far: 30, fov: 38};
  const bounds = {min: [-1, 0, -2], max: [1, 1, 2]};
  const score = sampleOpticalScore({chapterScene: sampleChapterScene(playback(2)), aspect: .46}, pose, {bounds});
  assert.deepEqual(score.focusRangeM, [6, 10]); assert.ok(score.focusDistanceM >= 6 && score.focusDistanceM <= 10);
  near(score.focalLengthMm, focalLengthForFov(pose.fov, .46)); assert.equal(score.asciiWeight, 0); assert.ok(score.fieldWeight > 0);
});

test('real autonomous area/rim changes leave the cached shadow key and source material untouched', () => {
  const base = sampleContinuousLighting(3.5 / 7), before = structuredClone(base);
  const a = applyChapterLighting(base, sampleChapterScene(playback(3, 0)));
  const b = applyChapterLighting(base, sampleChapterScene(playback(3, .25)));
  assert.deepEqual(a.key.position, b.key.position); assert.deepEqual(a.key.target, b.key.target);
  assert.notDeepEqual(a.exhibition.key.position, b.exhibition.key.position);
  assert.notEqual(a.key.intensity, b.key.intensity); assert.notEqual(a.exhibition.rim.intensity, b.exhibition.rim.intensity);
  near(Math.hypot(...a.exhibition.key.position), Math.hypot(...b.exhibition.key.position));
  assert.deepEqual(base, before); assert.deepEqual(a.stage, b.stage); assert.equal(a.environmentIntensity, b.environmentIntensity);
});

test('Round 06 source-study fill blends continuously without rewriting presets, colours or the shadow rig', () => {
  const base = sampleContinuousLighting(3.5 / 7), before = structuredClone(base);
  const study = applyChapterLighting(base, sampleChapterScene(playback(2, 0)));
  near(study.environmentIntensity, .32); near(study.fill.intensity, .20); near(study.hemisphere.intensity, .15);
  const mixedPlayback = playback(2, 0); mixedPlayback.chapterWeights = [.5, 0, .5, 0, 0, 0, 0];
  const mixed = applyChapterLighting(base, sampleChapterScene(mixedPlayback));
  near(mixed.environmentIntensity, (base.environmentIntensity + .32) / 2);
  near(mixed.fill.intensity, (base.fill.intensity + .20) / 2);
  for (const key of ['key', 'fill', 'rim']) {assert.deepEqual(study[key].position, base[key].position); assert.deepEqual(study[key].color, base[key].color);}
  assert.deepEqual(study.key.target, base.key.target);
  assert.deepEqual(applyChapterLighting(base, sampleChapterScene(playback(4, 0))).environmentIntensity, base.environmentIntensity);
  assert.deepEqual(base, before);
});

test('semantic core is wholly excluded while the outer feather has circular rather than square corners', () => {
  const rects = normalizeProtectedRects([{left: 100, top: 100, right: 300, bottom: 300}], 400, 400, 0).rects;
  for (const uv of [[.25, .25], [.5, .5], [.75, .75], [.25, .75], [.75, .25]]) assert.equal(sampleSemanticMask(uv, rects, 400, 400, 40), 0);
  const side = sampleSemanticMask([.8, .5], rects, 400, 400, 40);
  const diagonal = sampleSemanticMask([.75 + .05 / Math.sqrt(2), .75 + .05 / Math.sqrt(2)], rects, 400, 400, 40);
  near(side, diagonal); near(side, .5);
  const fartherCorner = sampleSemanticMask([.8, .8], rects, 400, 400, 40);
  assert.ok(fartherCorner > side && fartherCorner < 1);
  near(sampleSemanticMask([.85, .5], rects, 400, 400, 40), 1);
  assert.equal(sampleSemanticMask([.5, .5], [[0, 0, 1, 1]], 400, 400), 0);
});

test('invalid playback fails explicitly and pure samples never share mutable field arrays', () => {
  assert.throws(() => sampleChapterScene({}), RangeError);
  assert.throws(() => sampleChapterScene({...playback(0), chapterWeights: Array(7).fill(0)}), RangeError);
  assert.throws(() => sampleChapterScene({...playback(0), activeSeconds: NaN}), RangeError);
  const result = sampleChapterScene(playback(0)), expected = sampleChapterScene(playback(0)); result.field.fieldBlendMix[0] = 99;
  assert.deepEqual(sampleChapterScene(playback(0)), expected);
});
