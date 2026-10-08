import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {createExhibitionStage} from '../components/exhibition-stage.mjs';
import {SCENE_ANCHORS, sampleSceneDirection} from '../components/scene-direction.mjs';

const bounds = {min: [-1.38373486328125, -.008087958335876465, -1.6362088623046875], max: [1.24108056640625, .7248569269180298, 1.7275496826171874]};
const center = new T.Vector3().fromArray(bounds.min.map((value, axis) => (value + bounds.max[axis]) / 2));
const cameraAt = (angle = .7, aspect = 1.44) => {
  const camera = new T.PerspectiveCamera(38, aspect, .05, 100);
  camera.position.copy(center).add(new T.Vector3(Math.sin(angle) * 8, 4, Math.cos(angle) * 8));
  camera.lookAt(center); camera.updateMatrixWorld(); return camera;
};
const near = (a, b, tolerance = 1e-8) => assert.ok(Math.abs(a - b) <= tolerance, `${a} differs from ${b}`);

test('set construction preserves source bounds and labels all three meshes as editorial with bounded geometry', () => {
  const before = structuredClone(bounds), stage = createExhibitionStage({bounds});
  try {
    const stats = stage.update({camera: cameraAt(), direction: sampleSceneDirection(SCENE_ANCHORS[1])});
    assert.deepEqual(bounds, before); assert.equal(stats.meshDraws, 3); assert.equal(stats.areaLights, 2); assert.equal(stats.extraShadowMaps, 0);
    const meshes = stage.group.children.filter(node => node.isMesh);
    assert.equal(meshes.length, 3);
    for (const mesh of meshes) {assert.equal(mesh.userData.sourceGeometry, false); assert.equal(mesh.castShadow, false);}
    const triangles = meshes.reduce((sum, mesh) => sum + mesh.geometry.index.count / 3, 0);
    assert.equal(triangles, 324);
    assert.equal(stage.group.getObjectByName('editorial-flush-apron-not-source-base'), undefined);
    const gallery = stage.group.getObjectByName('editorial-continuous-gallery-not-source-base');
    const top = new T.Vector3().setFromMatrixPosition(gallery.matrixWorld);
    near(top.y, bounds.min[1] - .001);
    assert.equal(gallery.receiveShadow, true); assert.equal(gallery.material.metalness, 0);
  } finally {stage.dispose();}
});

test('rear wall and practicals stay behind the source sphere across chapters, view directions and portrait aspects without camera writes', () => {
  const stage = createExhibitionStage({bounds}), point = new T.Vector3();
  try {
    for (const aspect of [1.78, 1.44, .75, .462]) for (const angle of [-2.6, -.7, 0, .7, 2.6]) for (const u of SCENE_ANCHORS) {
      const camera = cameraAt(angle, aspect), before = camera.matrixWorld.clone();
      const stats = stage.update({camera, direction: sampleSceneDirection(u)});
      assert.ok(camera.matrixWorld.equals(before));
      const back = camera.position.clone().sub(center).setY(0).normalize();
      for (const mesh of stage.group.children.filter(node => node.isMesh)) {
        const positions = mesh.geometry.attributes.position;
        for (let index = 0; index < positions.count; index++) {
          // Flat source-datum vertices form the continuous floor. Only raised
          // rear geometry must lie entirely beyond the subject's rear tangent.
          if (mesh.name.includes('gallery') && positions.getY(index) < 1e-6) continue;
          point.fromBufferAttribute(positions, index).applyMatrix4(mesh.matrixWorld).sub(center);
          assert.ok(point.dot(back) < -stats.radius * 1.5, `${mesh.name} enters the source sphere`);
        }
      }
    }
  } finally {stage.dispose();}
});

test('area-light emitting faces aim at the source and share one source-radius unit system', () => {
  const stage = createExhibitionStage({bounds});
  try {
    for (const u of SCENE_ANCHORS) {
      const score = sampleSceneDirection(u), stats = stage.update({camera: cameraAt(-.8), direction: score});
      const aim = stage.group.localToWorld(new T.Vector3(0, (bounds.max[1] - bounds.min[1]) * .55, 0));
      for (const id of ['key', 'rim']) {
        const light = stage.group.getObjectByName(`exhibition-area-${id}`);
        const outward = new T.Vector3(0, 0, -1).applyQuaternion(light.getWorldQuaternion(new T.Quaternion()));
        const toward = aim.clone().sub(light.getWorldPosition(new T.Vector3())).normalize();
        assert.ok(outward.dot(toward) > .999999);
        near(light.width, score.exhibition[id].size[0] * stats.radius); near(light.height, score.exhibition[id].size[1] * stats.radius);
        assert.equal(light.castShadow, false);
      }
    }
  } finally {stage.dispose();}
});

test('Light and reduced motion remove practicals and moving sweeps without losing the broad-light rig', () => {
  const stage = createExhibitionStage({bounds}), camera = cameraAt();
  try {
    const direction = sampleSceneDirection(.5);
    const active = stage.update({camera, direction, lightSweep: 50});
    assert.equal(active.lightSweep, 1);
    const fullKey = stage.group.getObjectByName('exhibition-area-key').position.clone();
    for (const flags of [{quality: 'light'}, {reducedMotion: true}]) {
      const stats = stage.update({camera, direction, lightSweep: 50, ...flags});
      assert.equal(stats.lightSweep, 0); assert.equal(stats.meshDraws, 1);
      const key = stage.group.getObjectByName('exhibition-area-key');
      assert.ok(key.intensity > 0); assert.ok(key.position.distanceTo(fullKey) > 0);
      assert.equal(stage.group.getObjectByName('editorial-practical-right').visible, false);
    }
    const baseline = stage.update({camera, direction});
    assert.equal(baseline.meshDraws, 3); assert.equal(baseline.lightSweep, 0);
  } finally {stage.dispose();}
});

test('owned geometry/materials dispose once and shared LTC textures survive until the final stage releases them', () => {
  const keys = ['LTC_FLOAT_1', 'LTC_FLOAT_2', 'LTC_HALF_1', 'LTC_HALF_2'];
  const before = keys.map(key => T.UniformsLib[key]);
  const first = createExhibitionStage({bounds}), textures = keys.map(key => T.UniformsLib[key]);
  const second = createExhibitionStage({bounds});
  assert.deepEqual(keys.map(key => T.UniformsLib[key]), textures);
  let textureDisposals = 0;
  textures.forEach(texture => texture.addEventListener('dispose', () => textureDisposals++));
  const resources = new Set();
  first.group.traverse(node => {if (node.geometry) resources.add(node.geometry); if (node.material) resources.add(node.material);});
  const counts = new Map([...resources].map(value => [value, 0]));
  resources.forEach(resource => resource.addEventListener('dispose', () => counts.set(resource, counts.get(resource) + 1)));
  const root = new T.Group(); root.add(first.group);
  first.dispose(); first.dispose();
  assert.equal(root.children.length, 0); assert.ok([...counts.values()].every(count => count === 1)); assert.equal(textureDisposals, 0);
  second.update({camera: cameraAt()}); second.dispose(); second.dispose();
  assert.equal(textureDisposals, 4); assert.deepEqual(keys.map(key => T.UniformsLib[key]), before);
  assert.throws(() => first.update({camera: cameraAt()}), /disposed/);
});

test('invalid bounds/camera fail explicitly and source translation shifts only the authored stage origin', () => {
  assert.throws(() => createExhibitionStage({bounds: {min: [0, 0, 0], max: [0, 0, 0]}}), RangeError);
  const shifted = {min: bounds.min.map(v => v + 10), max: bounds.max.map(v => v + 10)};
  const stage = createExhibitionStage({bounds: shifted});
  try {
    assert.throws(() => stage.update({camera: {position: {x: NaN, y: 0, z: 0}}}), RangeError);
    assert.throws(() => stage.update({camera: cameraAt(), direction: {}}), RangeError);
    near(stage.group.position.x, center.x + 10); near(stage.group.position.y, bounds.min[1] + 10); near(stage.group.position.z, center.z + 10);
    stage.update({camera: cameraAt(), direction: sampleSceneDirection(.5), lightSweep: Infinity});
    assert.ok(stage.group.matrixWorld.elements.every(Number.isFinite));
  } finally {stage.dispose();}
});

test('Round 06 verified family bounds reframe existing set and lamps without allocating or mutating source data', () => {
  const stage = createExhibitionStage({bounds}), smaller = {min: [3, -.2, -2], max: [3.8, .35, -1.2]};
  const before = structuredClone(smaller), camera = cameraAt();
  const children = [...stage.group.children], geometries = children.filter(c => c.isMesh).map(c => c.geometry);
  try {
    const original = stage.update({camera});
    const updated = stage.update({camera, bounds: smaller});
    assert.ok(updated.radius < original.radius / 2);
    near(stage.group.position.x, 3.4); near(stage.group.position.y, -.2); near(stage.group.position.z, -1.6);
    assert.deepEqual(stage.group.children, children);
    assert.deepEqual(children.filter(c => c.isMesh).map(c => c.geometry), geometries);
    assert.deepEqual(smaller, before);
    assert.equal(updated.areaLights, 2); assert.equal(updated.extraShadowMaps, 0);
    const gallery = stage.group.getObjectByName('editorial-continuous-gallery-not-source-base');
    near(gallery.scale.x, updated.radius);
    near(stage.update({camera, bounds}).radius, original.radius);
    assert.throws(() => stage.update({camera, bounds: {min: [], max: []}}), RangeError);
  } finally {stage.dispose();}
});
