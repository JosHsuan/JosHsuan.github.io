import test from 'node:test';
import assert from 'node:assert/strict';
import {sampleElementPose, SOURCE_LAYER_REVISION} from '../components/element-score.mjs';
import {sampleResponseScore} from '../components/story-response.mjs';

const centre = index => (index + 0.5) / 7;
const zeroOffsets = {shell: [0, 0, 0], 'base-lower': [0, 0, 0], 'base-upper': [0, 0, 0]};
const near = (a, b, tolerance = 1e-12) => assert(Math.abs(a - b) <= tolerance, `${a} differs from ${b}`);

test('FORM and all completed-object chapters retain exact source-relative rest transforms', () => {
  for (const index of [0, 1, 4, 5, 6]) {
    const pose = sampleElementPose(centre(index));
    assert.equal(pose.modelRevision, SOURCE_LAYER_REVISION);
    assert.equal(pose.separationWeight, 0);
    assert.deepEqual(pose.offsets, zeroOffsets);
    assert.equal(pose.caption, 'Source layers · original placement');
  }
});

test('SYSTEM separates only the real three-layer relationship and keeps the lower base anchored', () => {
  const pose = sampleElementPose(centre(2));
  assert.equal(pose.separationWeight, 1);
  assert.deepEqual(Object.keys(pose.offsets), ['shell', 'base-lower', 'base-upper']);
  assert.deepEqual(pose.offsets.shell, [0, 0.24, 0]);
  assert.deepEqual(pose.offsets['base-upper'], [0, 0.09, 0]);
  assert.deepEqual(pose.offsets['base-lower'], [0, 0, 0]);
  assert.equal(pose.caption, 'Source layers · display separation, not a construction sequence');
  assert(!('scale' in pose) && !('rotation' in pose) && !('deformation' in pose));
});

test('actual shared holds are stationary, then MAKE rejoins without a second easing curve', () => {
  const system = [0.3, 0.45, 0.6].map(phase => sampleElementPose(sampleResponseScore((2 + phase) / 7).stageU));
  assert(system.every(pose => pose.separationWeight === 1));
  const pattern = sampleElementPose(centre(3));
  near(pattern.separationWeight, 0.7);
  const intermediate = sampleElementPose((centre(3) + centre(4)) / 2);
  near(intermediate.separationWeight, 0.35);
  near(intermediate.offsets.shell[1], 0.084);
  const make = [0.2, 0.45, 0.75].map(phase => sampleElementPose(sampleResponseScore((4 + phase) / 7).stageU));
  assert(make.every(pose => pose.separationWeight === 0));
});

test('forward and backward playback return exact repeatable poses without cumulative drift', () => {
  const steps = Array.from({length: 101}, (_, index) => index / 100);
  const forward = steps.map(u => sampleElementPose(sampleResponseScore(u).stageU));
  const reverse = steps.toReversed().map(u => sampleElementPose(sampleResponseScore(u).stageU)).toReversed();
  assert.deepEqual(reverse, forward);
  const rest = {shell: [0.2, 0, -0.3], 'base-lower': [0, -0.008087958335876465, 0], 'base-upper': [0, 0.0019120416641235352, 0]};
  const place = pose => Object.fromEntries(Object.entries(rest).map(([id, position]) => [id, position.map((value, axis) => value + pose.offsets[id][axis])]));
  for (let repeat = 0; repeat < 20; repeat += 1) {
    place(sampleElementPose(centre(2)));
    assert.deepEqual(place(sampleElementPose(centre(4))), rest);
  }
});

test('the camera envelope includes source-layer positions at maximum separation', () => {
  // Sanitized bounds read from the actual source-layers revision; source mesh
  // fidelity is verified separately by Geometry Engineer, not fabricated here.
  const bounds = {
    shell: {min: [-1.18810498046875, 0, -1.5502127685546876], max: [1.18810498046875, 0.7248569269180298, 1.5502127685546876]},
    'base-lower': {min: [-1.38373486328125, -0.008087958335876465, -1.6362088623046875], max: [1.24108056640625, 0.0019120416641235352, 1.7275496826171874]},
    'base-upper': {min: [-1.37358935546875, 0.0019120416641235352, -1.6261209716796876], max: [1.23114990234375, 0.011912041664123536, 1.7175086669921875]},
  };
  const pose = sampleElementPose(centre(2));
  const min = [0, 1, 2].map(axis => Math.min(...Object.entries(bounds).map(([id, box]) => box.min[axis] + pose.offsets[id][axis])));
  const max = [0, 1, 2].map(axis => Math.max(...Object.entries(bounds).map(([id, box]) => box.max[axis] + pose.offsets[id][axis])));
  near(min[1], -0.008087958335876465);
  near(max[1], 0.9648569269180298);
  assert.deepEqual([min[0], min[2], max[0], max[2]], [-1.38373486328125, -1.6362088623046875, 1.24108056640625, 1.7275496826171874]);
  near(pose.boundsPadding.max[1], 0.24);
});

test('reduced motion restores the whole source configuration for every chapter and output is bounded', () => {
  for (let index = 0; index <= 100; index += 1) {
    const pose = sampleElementPose(index / 100);
    assert(pose.separationWeight >= 0 && pose.separationWeight <= 1);
    assert(pose.offsets.shell[1] >= 0 && pose.offsets.shell[1] <= 0.24);
    assert.deepEqual(sampleElementPose(index / 100, {reducedMotion: true}).offsets, zeroOffsets);
  }
  assert.deepEqual(sampleElementPose(-1).offsets, zeroOffsets);
  assert.deepEqual(sampleElementPose(2).offsets, zeroOffsets);
  for (const bad of [NaN, Infinity, '0.5']) assert.throws(() => sampleElementPose(bad));
});
