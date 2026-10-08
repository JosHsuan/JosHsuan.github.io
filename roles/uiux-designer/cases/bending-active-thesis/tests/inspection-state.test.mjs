import test from 'node:test';
import assert from 'node:assert/strict';
import {INSPECTION_DEFAULTS, INSPECTION_LIMITS, INSPECTION_VIEWS, createInspectionState, setInspectionTarget, resetInspectionState, advanceInspection} from '../components/inspection-state.mjs';
import {sampleElementPose, sampleSourceSeparation, SOURCE_LAYER_REVISION} from '../components/element-score.mjs';

const near = (a, b, epsilon = 1e-10) => assert(Math.abs(a - b) <= epsilon, `${a} differs from ${b}`);
function settle(state) {
  let count = 0;
  do {advanceInspection(state, 1 / 60); count += 1;} while (!state.settled && count < 240);
  assert(state.settled && count < 120, 'inspection response must return to idle');
}

test('independent states expose semantic targets immediately while visual values accelerate and settle', () => {
  const state = createInspectionState(), other = createInspectionState(), velocity = [];
  assert.equal(setInspectionTarget(state, {azimuth: 90, elevation: 60, separation: 1}), state);
  assert.equal(state.target.azimuth, 90); assert.equal(state.value.azimuth, 30);
  assert.deepEqual(other.value, INSPECTION_DEFAULTS);
  for (let i = 0; i < 40; i += 1) {assert.equal(advanceInspection(state, 1 / 120), state); velocity.push(state.velocity.azimuth);}
  assert(velocity[2] > velocity[0] && velocity[35] < velocity[7]);
  settle(state);
  assert.deepEqual(state.value, state.target);
  assert(Object.values(state.velocity).every(value => value === 0));
});

test('all four channels agree at equal elapsed time across 3, 30, 60 and 120 Hz', () => {
  const states = [3, 30, 60, 120].map(rate => {
    const state = createInspectionState();
    for (const patch of [{azimuth: 85, elevation: 60, separation: 0.9, lightAzimuth: -50}, {azimuth: -20, elevation: 18, separation: 0.1, lightAzimuth: 50}]) {
      setInspectionTarget(state, patch);
      for (let i = 0; i < rate / 3; i += 1) advanceInspection(state, 1 / rate);
    }
    return state;
  });
  for (const state of states.slice(1)) for (const key of Object.keys(INSPECTION_LIMITS)) {
    near(state.value[key], states[0].value[key]); near(state.velocity[key], states[0].velocity[key]);
  }
});

test('rapid reversal brakes existing motion and repeated extremes remain inside hard control limits', () => {
  const state = createInspectionState(); setInspectionTarget(state, {azimuth: 90}); advanceInspection(state, 0.05);
  const before = {...state.value}, speed = state.velocity.azimuth;
  setInspectionTarget(state, {azimuth: -40}); advanceInspection(state, 1 / 240);
  assert(state.value.azimuth > before.azimuth && state.velocity.azimuth > 0 && state.velocity.azimuth < speed);
  for (let i = 0; i < 80; i += 1) {
    const value = i % 2 ? -1000 : 1000;
    setInspectionTarget(state, {azimuth: value, elevation: value, separation: value, lightAzimuth: value});
    advanceInspection(state, i % 3 ? 0.016 : 0.3167);
    for (const [key, limits] of Object.entries(INSPECTION_LIMITS)) assert(state.value[key] >= limits[0] && state.value[key] <= limits[1]);
  }
});

test('reduced motion, hidden resume and stale gaps keep manual selections functional without replay', () => {
  for (const [options, dt] of [[{reducedMotion: true}, 0], [{resumed: true}, 0], [{}, 2]]) {
    const state = createInspectionState();
    setInspectionTarget(state, {azimuth: 87, elevation: 58, separation: 0.75, lightAzimuth: -42, preset: 'raking'});
    advanceInspection(state, dt, options);
    assert.deepEqual(state.value, state.target); assert(state.settled);
    assert.equal(sampleSourceSeparation(state.value.separation).offsets.shell[1], 0.18);
    assert(Object.values(state.velocity).every(value => value === 0));
  }
});

test('presets switch without inventing interpolated modes; Reset restores all channels and no idle drift remains', () => {
  const state = createInspectionState();
  setInspectionTarget(state, {...INSPECTION_VIEWS.high, separation: 1, lightAzimuth: 70, preset: 'silhouette'});
  assert.equal(state.value.preset, 'silhouette');
  advanceInspection(state, 0.1); assert(!state.settled);
  const valueReference = state.value;
  assert.equal(resetInspectionState(state), state); assert.equal(state.value, valueReference);
  assert.deepEqual(state, createInspectionState());
  const snapshot = structuredClone(state);
  for (let i = 0; i < 100; i += 1) advanceInspection(state, 1 / 60);
  assert.deepEqual(state, snapshot);
});

test('invalid mixed patches and deltas cannot partly mutate target or response', () => {
  const state = createInspectionState(), snapshot = structuredClone(state);
  for (const patch of [{azimuth: 80, separation: NaN}, {azimuth: Infinity}, {elevation: '30'}, {preset: 'unlit'}, {camera: 1}, null, []]) {
    assert.throws(() => setInspectionTarget(state, patch)); assert.deepEqual(state, snapshot);
  }
  for (const dt of [-1, NaN, Infinity, '0.2']) {assert.throws(() => advanceInspection(state, dt)); assert.deepEqual(state, snapshot);}
  assert(Object.isFrozen(INSPECTION_LIMITS.azimuth) && Object.isFrozen(INSPECTION_VIEWS.high));
});

test('manual separation shares the exact story transforms, source revision and truthful caption', () => {
  for (let step = 0; step <= 100; step += 1) {
    const weight = step / 100, pose = sampleSourceSeparation(weight);
    assert.equal(pose.modelRevision, SOURCE_LAYER_REVISION);
    assert.deepEqual(Object.keys(pose.offsets), ['shell', 'base-lower', 'base-upper']);
    near(pose.offsets.shell[1], weight * 0.24); near(pose.offsets['base-upper'][1], weight * 0.09);
    assert.deepEqual(pose.offsets['base-lower'], [0, 0, 0]);
    assert.equal(pose.caption, weight ? 'Source layers · display separation, not a construction sequence' : 'Source layers · original placement');
    assert.deepEqual(pose.boundsPadding.max, [0, pose.offsets.shell[1], 0]);
  }
  assert.deepEqual(sampleSourceSeparation(1), sampleElementPose(2.5 / 7));
  assert.deepEqual(sampleSourceSeparation(0), sampleElementPose(4.5 / 7));
  assert.deepEqual(sampleSourceSeparation(-10), sampleSourceSeparation(0));
  assert.deepEqual(sampleSourceSeparation(10), sampleSourceSeparation(1));
  for (const invalid of [NaN, Infinity, '0.5']) assert.throws(() => sampleSourceSeparation(invalid));
});
