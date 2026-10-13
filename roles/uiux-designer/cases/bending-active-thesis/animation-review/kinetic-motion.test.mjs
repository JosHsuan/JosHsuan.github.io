import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createKineticState, retargetKinetic, injectKineticInput, setKineticPointer, advanceKinetic} from './kinetic-motion.mjs';

const close = (actual, expected, tolerance = 1e-9) => assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} != ${expected}`);
function advanceFor(state, seconds, hz = 60) {
  for (let frame = 0; frame < Math.round(seconds * hz); frame++) advanceKinetic(state, 1 / hz);
  return state;
}

test('entrance accelerates, overshoots visibly and settles exactly without idle updates', () => {
  const state = createKineticState();
  retargetKinetic(state, 1);
  assert.equal(state.velocity, 0);
  assert.equal(state.resting, false);
  const samples = [];
  for (let frame = 0; frame < 180; frame++) {
    advanceKinetic(state, 1 / 60);
    samples.push({progress: state.progress, velocity: state.velocity});
  }
  assert.ok(samples[1].velocity > samples[0].velocity, 'onset must accelerate');
  assert.ok(samples.some(sample => sample.progress > 1.05), 'motion must have a perceptible overshoot');
  assert.ok(samples.every(sample => sample.progress >= -.2 && sample.progress <= 1.2));
  assert.equal(state.progress, 1);
  assert.equal(state.velocity, 0);
  assert.equal(state.reveal, 1);
  assert.equal(state.resting, true);
  const snapshot = structuredClone(state);
  advanceKinetic(state, 30);
  assert.deepEqual(state, snapshot, 'a settled response stays unchanged');
});

test('reversal carries momentum through the turn instead of snapping or restarting', () => {
  const state = createKineticState();
  retargetKinetic(state, 1);
  advanceFor(state, .1);
  const position = state.progress, velocity = state.velocity;
  assert.ok(velocity > 0);
  retargetKinetic(state, 0);
  assert.equal(state.progress, position);
  assert.equal(state.velocity, velocity);
  advanceKinetic(state, 1 / 240);
  assert.ok(state.progress > position, 'old momentum remains initially visible');
  advanceFor(state, 3);
  assert.equal(state.progress, 0);
  assert.equal(state.velocity, 0);
  assert.equal(state.resting, true);
});

test('equal wall-clock input gives matching samples at 30, 60 and 120 Hz', () => {
  const run = hz => {
    const state = createKineticState();
    retargetKinetic(state, 1, {impulse: .8, energy: .9});
    setKineticPointer(state, .7, -.8);
    const samples = [];
    for (let segment = 0; segment < 15; segment++) {
      if (segment === 2) retargetKinetic(state, 0, {energy: .4});
      if (segment === 5) retargetKinetic(state, 1, {impulse: .4});
      if (segment === 8) setKineticPointer(state, 0, 0);
      advanceFor(state, .1, hz);
      samples.push({q: state.progress, v: state.velocity, e: state.energy, x: state.pointer.x, y: state.pointer.y, vx: state.pointer.vx});
    }
    return samples;
  };
  const reference = run(120);
  for (const hz of [30, 60]) for (const [index, sample] of run(hz).entries()) {
    for (const key of Object.keys(sample)) close(sample[key], reference[index][key]);
  }
});

test('pause freezes every channel and resumed active time excludes the pause gap', () => {
  const state = createKineticState();
  retargetKinetic(state, 1, {energy: .8});
  setKineticPointer(state, -1, .5);
  advanceFor(state, .1);
  const checkpoint = structuredClone(state);
  advanceKinetic(state, 45, {paused: true});
  assert.deepEqual(state, checkpoint);
  advanceKinetic(state, 1 / 60);
  advanceKinetic(checkpoint, 1 / 60);
  assert.deepEqual(state, checkpoint);
  assert.ok(state.progress !== state.target, 'resume must not jump to the end');
});

test('pointer has finite settling and can return to neutral independently of the transition', () => {
  const state = createKineticState({progress: 1});
  setKineticPointer(state, 3, -4);
  assert.equal(state.pointer.targetX, 1);
  assert.equal(state.pointer.targetY, -1);
  assert.equal(state.transitionResting, true);
  assert.equal(state.pointerResting, false);
  advanceFor(state, 2);
  assert.equal(state.pointer.x, 1);
  assert.equal(state.pointer.y, -1);
  assert.equal(state.resting, true, 'holding a still pointer does not demand idle frames');
  setKineticPointer(state, 0, 0);
  advanceFor(state, 2);
  assert.deepEqual(state.pointer, {x: 0, y: 0, vx: 0, vy: 0, targetX: 0, targetY: 0});
  assert.equal(state.progress, 1);
  assert.equal(state.resting, true);
});

test('same-target input adds bounded momentum and energy without resetting the pose', () => {
  const state = createKineticState();
  retargetKinetic(state, 1);
  advanceFor(state, .1);
  const position = state.progress, velocity = state.velocity;
  retargetKinetic(state, 1, {impulse: .2, energy: .4});
  assert.equal(state.progress, position);
  close(state.velocity, velocity + .2);
  assert.equal(state.energy, .4);
  injectKineticInput(state, {impulse: 1e9, energy: 1e9});
  assert.equal(state.velocity, 8);
  assert.equal(state.energy, 1);
  advanceFor(state, .1);
  close(state.energy, Math.exp(-.4));
  advanceFor(state, 3);
  assert.equal(state.energy, 0);
  assert.equal(state.resting, true);
});

test('live reduced motion produces a useful exact end pose and clears motion residuals', () => {
  const state = createKineticState();
  retargetKinetic(state, 1, {impulse: 2, energy: .9});
  setKineticPointer(state, 1, 1);
  advanceFor(state, .1);
  advanceKinetic(state, 0, {reduced: true});
  assert.equal(state.progress, 1);
  assert.equal(state.energy, 0);
  assert.equal(state.velocity, 0);
  assert.equal(state.pointer.x, 0);
  assert.equal(state.pointer.targetX, 0);
  assert.equal(state.resting, true);
  retargetKinetic(state, 0, {reduced: true, impulse: 3, energy: 1});
  assert.equal(state.progress, 0);
  assert.equal(state.resting, true);
});

test('rapid alternating impulses and long active frames remain bounded and finite', () => {
  const state = createKineticState({frequency: 8, damping: .2, pointerFrequency: 12, pointerDamping: .2});
  for (let index = 0; index < 500; index++) {
    const sign = index % 2 ? -1 : 1;
    retargetKinetic(state, sign > 0 ? 1 : 0, {impulse: sign * 40, energy: 3});
    setKineticPointer(state, sign, -sign);
    advanceKinetic(state, index % 5 === 0 ? .25 : 1 / 60);
    assert.ok(state.progress >= -.2 && state.progress <= 1.2);
    assert.ok(state.reveal >= 0 && state.reveal <= 1);
    assert.ok(Math.abs(state.velocity) <= 8);
    for (const key of ['x', 'y']) assert.ok(Math.abs(state.pointer[key]) <= 1.2);
    for (const key of ['vx', 'vy']) assert.ok(Math.abs(state.pointer[key]) <= 12);
    assert.ok(state.energy >= 0 && state.energy <= 1);
  }
  advanceKinetic(state, 30);
  assert.equal(state.resting, true);
});

test('invalid inputs are rejected before any live state is mutated', () => {
  assert.throws(() => createKineticState({frequency: 0}), /frequency/);
  assert.throws(() => createKineticState({damping: 2}), /damping/);
  const state = createKineticState({target: 1});
  advanceFor(state, .1);
  const snapshot = structuredClone(state);
  const invalid = [
    () => retargetKinetic(state, NaN),
    () => retargetKinetic(state, 0, {energy: Infinity}),
    () => injectKineticInput(state, {impulse: 2, energy: NaN}),
    () => setKineticPointer(state, .5, Infinity),
    () => advanceKinetic(state, -.1),
    () => advanceKinetic(state, Infinity),
  ];
  for (const operation of invalid) {
    assert.throws(operation);
    assert.deepEqual(state, snapshot);
  }
});

test('critical damping remains monotonic and reaches the same finite resting contract', () => {
  const state = createKineticState({damping: 1});
  retargetKinetic(state, 1);
  let previous = state.progress;
  for (let frame = 0; frame < 240; frame++) {
    advanceKinetic(state, 1 / 60);
    assert.ok(state.progress >= previous && state.progress <= 1);
    previous = state.progress;
  }
  assert.equal(state.resting, true);
});
