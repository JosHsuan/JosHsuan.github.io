import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {SCENE_ANCHORS, SCENE_CHAPTERS, sampleSceneDirection, resolveSceneStage} from '../components/scene-direction.mjs';

const lighting = JSON.parse(await readFile(new URL('../../../../lighting-designer/catalog/chapters.json', import.meta.url)));
const scenes = JSON.parse(await readFile(new URL('../../../../scene-designer/catalog/chapters.json', import.meta.url)));
const near = (actual, expected, tolerance = 1e-10) => assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} differs from ${expected}`);
function numericLeaves(value, output = []) {
  if (typeof value === 'number') output.push(value);
  else if (value && typeof value === 'object') Object.values(value).forEach(item => numericLeaves(item, output));
  return output;
}

test('all seven shared plateau coordinates reproduce the approved rig and stage endpoints', () => {
  SCENE_CHAPTERS.forEach((id, index) => {
    const sample = sampleSceneDirection(SCENE_ANCHORS[index]);
    const rig = lighting.chapters.find(chapter => chapter.id === id), stage = scenes.chapters.find(chapter => chapter.id === id);
    assert.deepEqual(sample.key.position, rig.key.position);
    assert.deepEqual(sample.rim.position, rig.rim.position);
    near(sample.key.intensity, rig.key.intensity); near(sample.rim.intensity, rig.rim.intensity);
    near(sample.environmentIntensity, rig.environmentIntensity); near(sample.contactOpacity, rig.contactOpacity);
    near(sample.stage.baseEmphasis, stage.baseEmphasis); near(sample.groundOpacity, stage.groundOpacity);
    assert.equal(sample.transition.from, id);
  });
});

test('light interpolation consumes the existing visual curve once without additional easing or overshoot', () => {
  for (let chapter = 0; chapter < 6; chapter++) {
    const a = sampleSceneDirection(SCENE_ANCHORS[chapter]), b = sampleSceneDirection(SCENE_ANCHORS[chapter + 1]);
    for (const t of [.125, .25, .5, .75, .875]) {
      const s = sampleSceneDirection(SCENE_ANCHORS[chapter] + (SCENE_ANCHORS[chapter + 1] - SCENE_ANCHORS[chapter]) * t);
      a.key.position.forEach((value, axis) => near(s.key.position[axis], value + (b.key.position[axis] - value) * t));
      near(s.key.intensity, a.key.intensity + (b.key.intensity - a.key.intensity) * t);
      near(s.haze.density, a.haze.density + (b.haze.density - a.haze.density) * t);
      s.rim.color.forEach((value, channel) => assert.ok(value >= Math.min(a.rim.color[channel], b.rim.color[channel]) - 1e-12 && value <= Math.max(a.rim.color[channel], b.rim.color[channel]) + 1e-12));
    }
  }
});

test('numeric visual channels are continuous through every chapter anchor and bounded over the full score', () => {
  for (const u of SCENE_ANCHORS.slice(1, -1)) {
    const left = sampleSceneDirection(u - 1e-7), right = sampleSceneDirection(u + 1e-7);
    delete left.transition; delete right.transition;
    const l = numericLeaves(left), r = numericLeaves(right);
    l.forEach((value, index) => near(value, r[index], .0001));
  }
  for (let step = 0; step <= 1000; step++) {
    const score = sampleSceneDirection(step / 1000);
    assert.ok(numericLeaves(score).every(Number.isFinite));
    for (const opacity of [score.groundOpacity, score.contactOpacity, score.halo.opacity]) assert.ok(opacity >= 0 && opacity <= 1);
    assert.ok(score.key.position[1] > 1 && score.haze.density < .05);
    assert.equal(score.key.castShadow, true); assert.equal(score.fill.castShadow, false); assert.equal(score.rim.castShadow, false);
  }
});

test('reduced motion gives one invariant complete-source lighting state with no decorative halo', () => {
  const expected = sampleSceneDirection(0, {reducedMotion: true});
  for (const u of [-1, .1, .5, .9, 2]) assert.deepEqual(sampleSceneDirection(u, {reducedMotion: true}), expected);
  assert.equal(expected.transition.from, 'credits'); assert.equal(expected.halo.opacity, 0);
  assert.equal(expected.stage.sourceBaseRequired, true); assert.ok(expected.environmentIntensity > .8);
});

test('real combined bounds set ground below the lowest source point and lights share a translated target', () => {
  const bounds = {min: [-2, -1.3, -4], max: [3, 1.2, 2]}, saved = structuredClone(bounds);
  const stage = resolveSceneStage(bounds, sampleSceneDirection(SCENE_ANCHORS[4]));
  assert.deepEqual(bounds, saved); near(stage.groundPosition[1], -1.304);
  stage.lightTarget.forEach((value, index) => near(value, [.5, -.05, -1][index]));
  assert.ok(stage.groundSize[0] >= 5 && stage.groundSize[1] >= 6);
  assert.ok(stage.shadowHalfExtent > stage.radius);
  const translated = resolveSceneStage({min: bounds.min.map(value => value + 12), max: bounds.max.map(value => value + 12)});
  stage.groundPosition.forEach((value, axis) => near(translated.groundPosition[axis], value + 12));
  assert.deepEqual(translated.groundSize, stage.groundSize);
});

test('bad controller values and invalid bounds fail explicitly; overshoot clamps and samples do not share mutable arrays', () => {
  for (const value of [NaN, Infinity, -Infinity, undefined, '0.5']) assert.throws(() => sampleSceneDirection(value), RangeError);
  for (const bounds of [null, {}, {min: [0, 0, 0], max: [0, 0, 0]}, {min: [1, 0, 0], max: [0, 1, 1]}, {min: [0, NaN, 0], max: [1, 1, 1]}]) assert.throws(() => resolveSceneStage(bounds), RangeError);
  assert.deepEqual(sampleSceneDirection(-1), sampleSceneDirection(0)); assert.deepEqual(sampleSceneDirection(2), sampleSceneDirection(1));
  const sample = sampleSceneDirection(.5), baseline = structuredClone(sample);
  sample.key.color[0] = 100; sample.rim.position[0] = 100;
  assert.deepEqual(sampleSceneDirection(.5), baseline);
});
