import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {INSPECTION_LIGHT_PRESETS, sampleInspectionLighting} from '../components/inspection-lighting.mjs';
import {createExhibitionStage} from '../components/exhibition-stage.mjs';
import {sampleSceneDirection} from '../components/scene-direction.mjs';

const bounds = {min: [-1.4, -.008, -1.64], max: [1.24, .725, 1.73]};
const center = new T.Vector3().fromArray(bounds.min.map((value, axis) => (value + bounds.max[axis]) / 2));
const radius = new T.Vector3().fromArray(bounds.max).sub(new T.Vector3().fromArray(bounds.min)).length() / 2;
const near = (a, b, epsilon = 1e-8) => assert.ok(Math.abs(a - b) < epsilon, `${a} differs from ${b}`);
const cameraAt = angle => {
  const camera = new T.PerspectiveCamera();
  camera.position.copy(center).add(new T.Vector3(Math.sin(angle) * 7, 4, Math.cos(angle) * 7));
  camera.lookAt(center); camera.updateMatrixWorld(); return camera;
};

test('Studio and Raking give distinct broad/grazing source-fixed studies without changing material or exposure', () => {
  const studio = sampleInspectionLighting(), raking = sampleInspectionLighting({preset: 'raking'});
  assert.deepEqual(studio, sampleInspectionLighting({preset: 'studio', azimuth: 0}));
  for (const score of [studio, raking]) {
    assert.equal(score.stage.lightFrame, 'source'); assert.equal(score.stage.baseEmphasis, 1);
    assert.equal(score.stage.sourceBaseRequired, true); assert.equal(score.stage.exhibitionOwnsFloor, true);
    assert.equal(score.haze.density, 0); assert.equal(score.halo.opacity, 0); assert.equal(score.exhibition.aperture.radiance, 0);
    assert.equal(score.backgroundColor, null);
    assert.ok(!('material' in score) && !('exposure' in score) && !('camera' in score));
    const key = new T.Vector3().fromArray(score.key.position).normalize();
    const area = new T.Vector3().fromArray(score.exhibition.key.position).normalize();
    assert.ok(key.dot(area) > .999999999, 'Shadow key and area light must share the source-relative ray');
  }
  assert.ok(raking.exhibition.key.size[0] < studio.exhibition.key.size[0] / 5);
  assert.ok(raking.exhibition.key.position[1] < studio.exhibition.key.position[1] / 2);
  assert.ok(raking.environmentIntensity < studio.environmentIntensity / 2);
  assert.deepEqual(studio.key.color, raking.key.color);
});

test('Silhouette retains the complete direction schema, removes illumination and uses a backdrop handoff rather than a material override', () => {
  const score = sampleInspectionLighting({preset: 'silhouette'});
  for (const key of Object.keys(sampleSceneDirection(.5))) assert.ok(key in score, `Missing compatible field ${key}`);
  for (const light of [score.key, score.fill, score.rim, score.hemisphere, score.exhibition.key, score.exhibition.rim]) assert.equal(light.intensity, 0);
  assert.equal(score.environmentIntensity, 0); assert.equal(score.stage.surfaceVisible, false); assert.equal(score.key.castShadow, false);
  assert.equal(score.backgroundColor.length, 3); assert.ok(score.backgroundColor.every(value => value > .2 && value < .5));
  assert.equal(score.inspection.measuredLighting, false);
});

test('lamp azimuth is finite, bounded and rotates a constant source frame without changing elevation, size or energy', () => {
  for (const preset of INSPECTION_LIGHT_PRESETS) {
    const zero = sampleInspectionLighting({preset});
    for (const azimuth of [-70, -35, 0, 35, 70]) {
      const score = sampleInspectionLighting({preset, azimuth});
      for (const id of ['key', 'rim']) {
        near(Math.hypot(...score.exhibition[id].position), Math.hypot(...zero.exhibition[id].position));
        near(score.exhibition[id].position[1], zero.exhibition[id].position[1]);
        near(score.exhibition[id].intensity, zero.exhibition[id].intensity);
        assert.deepEqual(score.exhibition[id].size, zero.exhibition[id].size);
      }
    }
    assert.deepEqual(sampleInspectionLighting({preset, azimuth: -200}), sampleInspectionLighting({preset, azimuth: -70}));
    assert.deepEqual(sampleInspectionLighting({preset, azimuth: 200}), sampleInspectionLighting({preset, azimuth: 70}));
  }
  for (const azimuth of [NaN, Infinity, -Infinity, '30', null]) assert.throws(() => sampleInspectionLighting({azimuth}), RangeError);
  for (const preset of ['analysis', 'stress', '', null]) assert.throws(() => sampleInspectionLighting({preset}), RangeError);
});

test('inspection world-space lamps and emitting directions remain fixed when the camera orbits through a full turn', () => {
  const stage = createExhibitionStage({bounds});
  try {
    for (const preset of INSPECTION_LIGHT_PRESETS) for (const azimuth of [-70, 0, 70]) {
      const direction = sampleInspectionLighting({preset, azimuth});
      for (const angle of [-Math.PI, -2, -1, 0, 1, 2, Math.PI]) {
        const camera = cameraAt(angle), before = camera.matrixWorld.clone();
        const info = stage.update({camera, direction, lightSweep: 1});
        assert.equal(info.lightFrame, 'source'); assert.equal(info.lightSweep, 0); assert.equal(info.areaLights, 2);
        assert.equal(info.meshDraws, preset === 'silhouette' ? 0 : 1);
        assert.ok(camera.matrixWorld.equals(before));
        for (const id of ['key', 'rim']) {
          const light = stage.group.getObjectByName(`exhibition-area-${id}`);
          const expected = new T.Vector3().fromArray(direction.exhibition[id].position).multiplyScalar(radius).add(center);
          const actual = light.getWorldPosition(new T.Vector3());
          assert.ok(actual.distanceTo(expected) < 1e-8);
          const emitting = new T.Vector3(0, 0, -1).applyQuaternion(light.getWorldQuaternion(new T.Quaternion()));
          assert.ok(emitting.dot(center.clone().sub(actual).normalize()) > .999999999);
        }
      }
    }
  } finally {stage.dispose();}
});

test('explicit light choices work in Full, Light and Reduced and returning to the story restores its camera-relative set', () => {
  const stage = createExhibitionStage({bounds}), camera = cameraAt(.8);
  try {
    const direction = sampleInspectionLighting({preset: 'raking', azimuth: 35});
    let reference = null;
    for (const flags of [{quality: 'full'}, {quality: 'light'}, {quality: 'full', reducedMotion: true}]) {
      stage.update({camera, direction, ...flags});
      const light = stage.group.getObjectByName('exhibition-area-key'), position = light.getWorldPosition(new T.Vector3());
      if (reference) assert.ok(reference.distanceTo(position) < 1e-8); else reference = position;
      assert.equal(light.intensity, direction.exhibition.key.intensity);
    }
    stage.update({camera, direction: sampleInspectionLighting({preset: 'silhouette'})});
    assert.equal(stage.group.getObjectByName('editorial-continuous-gallery-not-source-base').visible, false);
    const story = sampleSceneDirection(.2), info = stage.update({camera, direction: story});
    assert.equal(info.lightFrame, 'camera'); assert.equal(info.meshDraws, 3);
    const world = stage.group.getObjectByName('exhibition-area-key').getWorldPosition(new T.Vector3());
    stage.update({camera: cameraAt(-.8), direction: story});
    assert.ok(world.distanceTo(stage.group.getObjectByName('exhibition-area-key').getWorldPosition(new T.Vector3())) > 1);
  } finally {stage.dispose();}
});

test('samples are deterministic independent records and do not mutate the story score', () => {
  const story = sampleSceneDirection(.2), expected = sampleInspectionLighting({preset: 'raking', azimuth: 30});
  const mutated = sampleInspectionLighting({preset: 'raking', azimuth: 30});
  mutated.key.color[0] = 99; mutated.exhibition.key.position[0] = 99; mutated.stage.baseEmphasis = 99;
  assert.deepEqual(sampleInspectionLighting({preset: 'raking', azimuth: 30}), expected);
  assert.deepEqual(sampleSceneDirection(.2), story);
});
