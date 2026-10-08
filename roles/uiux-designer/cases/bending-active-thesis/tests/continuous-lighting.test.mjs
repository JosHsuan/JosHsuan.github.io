import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {sampleContinuousLighting, sampleInspectionLighting} from '../components/inspection-lighting.mjs';
import {SCENE_ANCHORS, sampleSceneDirection} from '../components/scene-direction.mjs';
import {createExhibitionStage} from '../components/exhibition-stage.mjs';

// Public, normalized original source envelope; no native CAD or private audit.
const bounds = {min: [-1.38373486328125, -.008087958335876465, -1.6362088623046875], max: [1.24108056640625, .7248569269180298, 1.7275496826171874]};
const center = new T.Vector3().fromArray(bounds.min.map((v, i) => (v + bounds.max[i]) / 2));
const radius = new T.Vector3().fromArray(bounds.max).sub(new T.Vector3().fromArray(bounds.min)).length() / 2;
const near = (a, b, epsilon = 1e-8) => assert.ok(Math.abs(a - b) <= epsilon, `${a} differs from ${b}`);
const visualFields = ['key', 'fill', 'rim', 'hemisphere', 'environmentIntensity', 'groundColor', 'groundOpacity', 'haze', 'halo', 'contactOpacity', 'exhibition'];
const numbers = value => typeof value === 'number' ? [value] : value && typeof value === 'object' ? Object.values(value).flatMap(numbers) : [];
const visualNumbers = score => visualFields.flatMap(key => numbers(score[key]));
const scalarNumbers = value => typeof value === 'number' ? [value] : value && typeof value === 'object' ? Object.entries(value).filter(([key]) => key !== 'position').flatMap(([, value]) => scalarNumbers(value)) : [];
const linearNumbers = score => visualFields.flatMap(key => scalarNumbers(score[key]));

test('Round 05 chapter holds use one source frame, broad Form, grazing System/Pattern and a quieter Make', () => {
  for (const [index, preset] of [[1, 'studio'], [2, 'raking'], [3, 'raking']]) {
    const score = sampleContinuousLighting(SCENE_ANCHORS[index]), expected = sampleInspectionLighting({preset});
    for (const key of visualFields) assert.deepEqual(score[key], expected[key]);
  }
  const make = sampleContinuousLighting(SCENE_ANCHORS[4]), old = sampleSceneDirection(SCENE_ANCHORS[4]);
  assert.ok(make.key.intensity < old.key.intensity); assert.ok(make.exhibition.key.intensity < old.exhibition.key.intensity);
  assert.equal(make.exhibition.aperture.radiance, 0);
  for (const u of SCENE_ANCHORS) {
    const score = sampleContinuousLighting(u);
    assert.equal(score.stage.lightFrame, 'source'); assert.equal(score.stage.surfaceOpacity, 1);
    assert.equal(score.stage.baseEmphasis, 1); assert.equal(score.backgroundColor, null);
    assert.equal(score.key.castShadow, true); assert.equal(score.stage.shadow.mapSize, 1024);
    assert.ok(!('camera' in score) && !('material' in score) && !('exposure' in score));
  }
});

test('continuous chapter interpolation uses the already-eased stage once and is reversible at every anchor', () => {
  for (let index = 0; index < 6; index++) {
    const a = linearNumbers(sampleContinuousLighting(SCENE_ANCHORS[index]));
    const b = linearNumbers(sampleContinuousLighting(SCENE_ANCHORS[index + 1]));
    const u = SCENE_ANCHORS[index] * .75 + SCENE_ANCHORS[index + 1] * .25;
    const quarter = linearNumbers(sampleContinuousLighting(u));
    quarter.forEach((value, axis) => near(value, a[axis] * .75 + b[axis] * .25));
  }
  for (const anchor of SCENE_ANCHORS) {
    const left = visualNumbers(sampleContinuousLighting(anchor - 1e-8));
    const right = visualNumbers(sampleContinuousLighting(anchor + 1e-8));
    left.forEach((value, axis) => near(value, right[axis], 1e-5));
  }
  const forward = Array.from({length: 101}, (_, i) => sampleContinuousLighting(i / 100));
  for (let i = 100; i >= 0; i--) assert.deepEqual(sampleContinuousLighting(i / 100), forward[i]);
});

test('inline weight and numeric preset mix continuously resolve the existing fixtures without light/background switches', () => {
  const u = SCENE_ANCHORS[1], azimuth = 43;
  const a = sampleContinuousLighting(u, {studyWeight: 1, studyMix: 0, lightAzimuth: azimuth});
  const b = sampleContinuousLighting(u, {studyWeight: 1, studyMix: 1, lightAzimuth: azimuth});
  const mixed = sampleContinuousLighting(u, {studyWeight: 1, studyMix: .25, lightAzimuth: azimuth});
  linearNumbers(mixed).forEach((value, i) => near(value, linearNumbers(a)[i] * .75 + linearNumbers(b)[i] * .25));
  for (const studyWeight of [0, 1e-8, .25, .5, .75, 1]) {
    const score = sampleContinuousLighting(u, {studyWeight, studyMix: .25, lightAzimuth: azimuth});
    const base = linearNumbers(sampleContinuousLighting(u)), endpoint = linearNumbers(mixed);
    linearNumbers(score).forEach((value, i) => near(value, base[i] + (endpoint[i] - base[i]) * studyWeight));
    assert.equal(score.backgroundColor, null); assert.equal(score.stage.lightFrame, 'source');
    assert.equal(score.stage.surfaceOpacity, 1); assert.equal(score.key.castShadow, true);
  }
  assert.deepEqual(visualNumbers(sampleContinuousLighting(u, {studyWeight: 0, studyPreset: 'raking', lightAzimuth: 70})), visualNumbers(sampleContinuousLighting(u)));
  assert.deepEqual(visualNumbers(sampleContinuousLighting(u, {studyWeight: 1, studyPreset: 'raking'})), visualNumbers(sampleInspectionLighting({preset: 'raking'})));
});

test('lamp paths stay finite and outside the original bounding sphere; shadow and area key rays remain aligned', () => {
  for (let i = 0; i <= 70; i++) for (const studyWeight of [0, .5, 1]) for (const studyMix of [0, .5, 1]) for (const lightAzimuth of [-70, 0, 70]) {
    const score = sampleContinuousLighting(i / 70, {studyWeight, studyMix, lightAzimuth});
    assert.ok(numbers(score).every(Number.isFinite));
    for (const id of ['key', 'rim']) {
      assert.ok(Math.hypot(...score.exhibition[id].position) > 1, `${id} entered the source sphere at ${i},${studyWeight},${studyMix},${lightAzimuth}`);
      const key = new T.Vector3().fromArray(score[id].position).normalize();
      const area = new T.Vector3().fromArray(score.exhibition[id].position).normalize();
      assert.ok(key.dot(area) > .999999999);
      assert.ok(score.exhibition[id].size.every(v => v > 0)); assert.ok(score.exhibition[id].intensity > 0);
    }
  }
});

test('all continuous story and inline states keep source-fixed world lamps and datum despite camera orbit', () => {
  const stage = createExhibitionStage({bounds}), original = structuredClone(bounds);
  try {
    for (const u of SCENE_ANCHORS) for (const studyWeight of [0, .5, 1]) for (const angle of [-2.5, 0, 2.5]) {
      const camera = new T.PerspectiveCamera(38, .46, .01, 100);
      camera.position.copy(center).add(new T.Vector3(Math.sin(angle) * 8, 4, Math.cos(angle) * 8)); camera.lookAt(center); camera.updateMatrixWorld();
      const direction = sampleContinuousLighting(u, {studyWeight, studyMix: .4, lightAzimuth: 35});
      const info = stage.update({direction, camera, lightSweep: 1});
      assert.equal(info.lightFrame, 'source'); assert.equal(info.lightSweep, 0); assert.equal(info.areaLights, 2); assert.equal(info.extraShadowMaps, 0);
      for (const id of ['key', 'rim']) {
        const light = stage.group.getObjectByName(`exhibition-area-${id}`), world = light.getWorldPosition(new T.Vector3());
        const expected = new T.Vector3().fromArray(direction.exhibition[id].position).multiplyScalar(radius).add(center);
        assert.ok(world.distanceTo(expected) < 1e-8);
      }
      near(stage.group.position.y, bounds.min[1]);
    }
    assert.deepEqual(bounds, original);
  } finally {stage.dispose();}
});

test('numeric stage opacity blends existing surfaces and disposes no lights or geometry during a transition', () => {
  const stage = createExhibitionStage({bounds}), camera = new T.PerspectiveCamera(); camera.position.set(5, 4, 6);
  const children = [...stage.group.children], direction = sampleContinuousLighting(0);
  try {
    for (const opacity of [1, .75, .5, .25, 0, .25, 1]) {
      direction.stage.surfaceOpacity = opacity;
      const info = stage.update({camera, direction});
      near(info.surfaceOpacity, opacity);
      const gallery = stage.group.getObjectByName('editorial-continuous-gallery-not-source-base');
      near(gallery.material.opacity, opacity); assert.equal(gallery.visible, opacity > 0);
      near(stage.group.getObjectByName('editorial-practical-right').material.opacity, .18 * opacity);
      assert.deepEqual(stage.group.children, children); assert.equal(info.areaLights, 2);
    }
    direction.stage.surfaceOpacity = NaN; assert.throws(() => stage.update({camera, direction}), RangeError);
  } finally {stage.dispose();}
});

test('reduced reading stays stable while deliberate study changes remain causal; inputs and samples are isolated', () => {
  const reduced = sampleContinuousLighting(0, {reducedMotion: true});
  assert.deepEqual(sampleContinuousLighting(1, {reducedMotion: true}), reduced);
  const selected = sampleContinuousLighting(.5, {reducedMotion: true, studyWeight: 1, studyMix: 1, lightAzimuth: 70});
  assert.notDeepEqual(selected.key.position, reduced.key.position); assert.equal(selected.study.mix, 1);
  for (const value of [NaN, Infinity, '1', null]) {
    assert.throws(() => sampleContinuousLighting(value), RangeError);
    for (const field of ['studyWeight', 'studyMix', 'lightAzimuth']) assert.throws(() => sampleContinuousLighting(.5, {[field]: value}), RangeError);
  }
  assert.throws(() => sampleContinuousLighting(.5, {studyPreset: 'silhouette'}), RangeError);
  const first = sampleContinuousLighting(.4), expected = sampleContinuousLighting(.4);
  first.key.position[0] = 99; first.exhibition.key.color[0] = 99; first.stage.surfaceOpacity = 0;
  assert.deepEqual(sampleContinuousLighting(.4), expected);
  assert.equal(sampleContinuousLighting(.5, {studyWeight: 5, studyMix: 5, lightAzimuth: 200}).study.azimuth, 70);
});
