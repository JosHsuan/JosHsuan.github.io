import test from 'node:test';
import assert from 'node:assert/strict';
import {ShaderLib, UniformsUtils} from 'three';
import {createCinematicMaterial} from '../components/materials/cinematic-material.js';
import {sampleCinematicPose} from '../components/vendor/cinematic-plan.mjs';
import {sampleOpticalScore} from '../components/optical-score.mjs';

const bounds = {min: [-1.38, -.009, -1.64], max: [1.25, .97, 1.73]};
const sample = (slot, reducedMotion = false) => {
  const stageU = (slot + .5) / 7;
  const pose = sampleCinematicPose(stageU, 1.44, {x: .3, y: -.2}, {bounds, sharedStage: true, reducedMotion});
  return {pose, optics: sampleOpticalScore({stageU, visualU: stageU, aspect: 1.44, reducedMotion}, pose, {bounds})};
};

test('satiny physical finish retains its shader variant through diagnostic comparison', () => {
  const adapter = createCinematicMaterial({bounds}), original = JSON.stringify(bounds);
  assert(adapter.material.isMeshPhysicalMaterial);
  assert.equal(adapter.material.clearcoat, 0);
  const shader = {vertexShader: ShaderLib.physical.vertexShader, fragmentShader: ShaderLib.physical.fragmentShader, uniforms: UniformsUtils.clone(ShaderLib.physical.uniforms)};
  adapter.material.onBeforeCompile(shader);
  // This source has no UVs: an explicit view-space frame must replace default TBN.
  assert(shader.fragmentShader.includes('tbn = mat3(cinematicTangent'));
  assert(!shader.fragmentShader.includes('cinematicFocus'));
  const key = adapter.material.customProgramCacheKey(), version = adapter.material.version;
  adapter.update({finish: 'legacy'}); const legacy = adapter.inspect();
  adapter.update({finish: 'satin'}); const satin = adapter.inspect();
  assert(satin.roughness > legacy.roughness && satin.anisotropy > legacy.anisotropy);
  assert.equal(adapter.material.customProgramCacheKey(), key); assert.equal(adapter.material.version, version);
  assert.equal(JSON.stringify(bounds), original);
  adapter.dispose(); adapter.dispose(); assert(adapter.inspect().disposed);
});

test('evidence absence is exact and its boundaries move off-frame before visibility changes', () => {
  for (const slot of [4, 4.2, 4.5, 4.8, 5]) {
    const {pose} = sample(slot); assert.equal(pose.sourcePresence, 0); assert.equal(pose.framingIntent, 'evidence-absence');
  }
  assert.equal(sample(4 - 1e-5).pose.sourcePresence, 1);
  assert.equal(sample(5 + 1e-5).pose.sourcePresence, 1);
  assert(Math.abs(sample(4 - 1e-5).pose.compositionNDC[0]) > 3.7);
  assert(Math.abs(sample(5 + 1e-5).pose.compositionNDC[0]) > 3.7);
});

test('new camera path seeks continuously and reverses without its own clock', () => {
  for (let slot = 0; slot < 6; slot++) {
    const before = sample(slot + 1 - 1e-7).pose, after = sample(slot + 1 + 1e-7).pose;
    for (const field of ['position', 'target', 'compositionNDC']) assert(Math.max(...before[field].map((value, i) => Math.abs(value - after[field][i]))) < 1e-4);
  }
  const forward = Array.from({length: 61}, (_, i) => sample(i / 10));
  const reverse = Array.from({length: 61}, (_, i) => sample((60 - i) / 10)).reverse();
  assert.deepEqual(forward, reverse);
});

test('reduced motion always has a visible fixed whole-source pose and no optical sweep', () => {
  const first = sample(0, true);
  for (let i = 0; i <= 6; i++) {
    const {pose, optics} = sample(i, true);
    assert.deepEqual(pose.position, first.pose.position); assert.deepEqual(pose.compositionNDC, first.pose.compositionNDC);
    assert.equal(pose.sourcePresence, 1); assert.equal(pose.framingIntent, 'held-source');
    assert.equal(optics.mistStrength, 0); assert.equal(optics.maxBlurPx, 0); assert.equal(optics.asciiWeight, 0); assert.equal(optics.veil, 0);
  }
});

test('black-mist score is stronger in macro passage while evidence stays sharp', () => {
  assert(sample(3).optics.mistStrength > sample(1).optics.mistStrength);
  for (const slot of [1, 4, 5, 6]) assert.equal(sample(slot).optics.maxBlurPx, 0);
  for (let i = 0; i <= 60; i++) {
    const {optics} = sample(i / 10);
    assert(optics.focusDistanceM > 0 && optics.mistStrength >= 0 && optics.mistStrength <= .8);
    assert(optics.mistRadiusPx >= 4 && optics.mistRadiusPx <= 56); assert.equal(optics.veil, 0);
  }
});
