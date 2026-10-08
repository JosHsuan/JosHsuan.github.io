import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createResponseState, advanceResponse, sampleResponseScore} from '../components/story-response.mjs';

const catalog = JSON.parse(await readFile(new URL('../../../../motion-designer/catalog/score.json', import.meta.url)));
const near = (actual, expected, tolerance = 1e-12) => assert(Math.abs(actual - expected) <= tolerance, `${actual} differs from ${expected}`);
function settle(state, target, rate = 60) {
  let frames = 0;
  do {advanceResponse(state, target, 1 / rate); frames += 1;} while (!state.settled && frames < rate * 4);
  assert(state.settled, 'response must stop requesting frames');
  return frames;
}

test('native reading position is immediate while visual motion accelerates then decelerates', () => {
  const state = createResponseState(0.1), speeds = [];
  for (let i = 0; i < 48; i += 1) {
    assert.equal(advanceResponse(state, 0.25, 1 / 120), state);
    assert.equal(state.nativeU, 0.25);
    assert(state.visualU >= 0.1 && state.visualU < 0.25);
    speeds.push(state.velocity);
  }
  assert(speeds[0] > 0 && speeds[3] > speeds[0], 'onset accelerates');
  assert(speeds[9] > speeds[3] && speeds[40] < speeds[9], 'speed peaks, then eases into the hold');
  assert(state.visualU > 0.22, 'the visible response must meaningfully catch up');
  assert(state.energy > 0 && state.energy <= 1);
});

test('equal elapsed time agrees at 30, 60 and 120 Hz through target changes and reversal', () => {
  const samples = [30, 60, 120].map(rate => {
    const state = createResponseState(0.35), values = [];
    for (const target of [0.48, 0.4, 0.44]) {
      for (let frame = 0; frame < rate / 5; frame += 1) advanceResponse(state, target, 1 / rate);
      values.push({...state});
    }
    return values;
  });
  for (let beat = 0; beat < 3; beat += 1) for (const values of samples.slice(1)) {
    near(values[beat].visualU, samples[0][beat].visualU);
    near(values[beat].velocity, samples[0][beat].velocity);
    near(values[beat].energy, samples[0][beat].energy);
  }
});

test('ordinary mid-motion reversal brakes existing momentum before reversing', () => {
  const state = createResponseState(0.2);
  advanceResponse(state, 0.35, 0.06);
  const before = {...state};
  advanceResponse(state, 0.18, 1 / 120);
  assert(state.visualU > before.visualU, 'the previous velocity is retained, not teleported');
  assert(state.velocity > 0 && state.velocity < before.velocity, 'opposite input brakes immediately');
  for (let i = 0; i < 20; i += 1) advanceResponse(state, 0.18, 1 / 120);
  assert(state.velocity < 0 && state.direction === -1);
  settle(state, 0.18);
  assert.equal(state.visualU, 0.18);
});

test('a heavy 316 ms render frame retains the deceleration tail instead of stale-snapping', () => {
  const state = createResponseState(0.2);
  advanceResponse(state, 0.4, 1 / 60);
  advanceResponse(state, 0.4, 1 / 60);
  const before = {...state};
  advanceResponse(state, 0.4, 0.3167);
  assert(state.visualU > before.visualU && state.visualU < 0.4);
  assert(state.velocity > 0 && state.velocity < before.velocity);
  assert.equal(state.settled, false);
  settle(state, 0.4);
  assert.equal(state.visualU, 0.4);
});

test('analytical response remains time-consistent at 3 Hz under heavy rendering', () => {
  const samples = [3, 30, 60, 120].map(rate => {
    const state = createResponseState(0.2);
    for (let frame = 0; frame < rate * 2 / 3; frame += 1) advanceResponse(state, 0.35, 1 / rate);
    return state;
  });
  for (const value of samples.slice(1)) {
    near(value.visualU, samples[0].visualU);
    near(value.velocity, samples[0].velocity);
  }
  assert.equal(samples[0].settled, false);
});

test('large jumps bound narrative lag and never replay every skipped chapter', () => {
  const state = createResponseState(0);
  for (const target of [1, 0, 0.98, 0.05]) {
    advanceResponse(state, target, 1 / 60);
    assert.equal(state.nativeU, target);
    assert(Math.abs(state.visualU - target) <= 1.5 / 7 + 1e-14);
    assert(state.visualU >= 0 && state.visualU <= 1);
    assert(Math.abs(state.velocity) < 1, 'jump resets inherited high velocity');
  }
});

test('settlement is exact and subsequent idle calls make no new motion', () => {
  const state = createResponseState(0.4);
  assert(settle(state, 0.56) < 120);
  assert.deepEqual(state, {nativeU: 0.56, visualU: 0.56, velocity: 0, energy: 0, direction: 0, settled: true});
  const final = {...state};
  for (let frame = 0; frame < 100; frame += 1) advanceResponse(state, 0.56, 1 / 60);
  assert.deepEqual(state, final);
});

test('reduced motion, visibility resume and stale frames seek without inertial replay', () => {
  for (const [options, delta] of [[{reducedMotion: true}, 1 / 60], [{resumed: true}, 0], [{}, 5]]) {
    const state = createResponseState(0.2);
    advanceResponse(state, 0.4, 0.05);
    advanceResponse(state, 0.9, delta, options);
    assert.deepEqual(state, {nativeU: 0.9, visualU: 0.9, velocity: 0, energy: 0, direction: 0, settled: true});
  }
});

test('finite boundaries clamp, zero delta preserves normal momentum, invalid input cannot poison state', () => {
  assert.equal(createResponseState(-1).visualU, 0);
  assert.equal(createResponseState(2).visualU, 1);
  const state = createResponseState(0.3);
  advanceResponse(state, 0.4, 0.05);
  const snapshot = {...state};
  advanceResponse(state, 0.4, 0);
  near(state.visualU, snapshot.visualU); near(state.velocity, snapshot.velocity);
  for (const bad of [NaN, Infinity, '0.5']) {
    assert.throws(() => advanceResponse(state, bad, 1 / 60));
    assert.throws(() => sampleResponseScore(bad));
  }
  for (const bad of [-1, NaN, Infinity]) assert.throws(() => advanceResponse(state, 0.9, bad));
  near(state.visualU, snapshot.visualU); assert.equal(state.nativeU, snapshot.nativeU);
});

test('all seven authored unequal holds resolve to the agreed stationary chapter centres', () => {
  assert.equal(new Set(catalog.chapters.map(chapter => String(chapter.hold))).size, 7);
  catalog.chapters.forEach((chapter, index) => {
    for (const fraction of [0.1, 0.5, 0.9]) {
      const phase = chapter.hold[0] + (chapter.hold[1] - chapter.hold[0]) * fraction;
      const score = sampleResponseScore((index + phase) / 7);
      assert.equal(score.chapterId, chapter.id);
      near(score.localPhase, phase); near(score.stageU, (index + 0.5) / 7);
      assert.equal(score.dwellWeight, 1);
    }
  });
  near(sampleResponseScore(0).stageU, 0.5 / 7);
  near(sampleResponseScore(1).stageU, 6.5 / 7);
});

test('each complete exit-entry transition is smooth, reversible and crosses its chapter boundary without stopping', () => {
  for (let index = 0; index < 6; index += 1) {
    const start = (index + catalog.chapters[index].hold[1]) / 7;
    const end = (index + 1 + catalog.chapters[index + 1].hold[0]) / 7;
    const middle = (start + end) / 2;
    near(sampleResponseScore(middle).stageU, (index + 1) / 7);
    near(sampleResponseScore(middle).dwellWeight, 0);
    const positions = Array.from({length: 41}, (_, step) => start + (end - start) * step / 40);
    const forward = positions.map(u => sampleResponseScore(u).stageU);
    assert(forward.every((value, step) => step === 0 || value >= forward[step - 1]));
    assert.deepEqual(positions.toReversed().map(u => sampleResponseScore(u).stageU).toReversed(), forward);
    const boundary = (index + 1) / 7, h = 1e-6;
    const left = (sampleResponseScore(boundary).stageU - sampleResponseScore(boundary - h).stageU) / h;
    const right = (sampleResponseScore(boundary + h).stageU - sampleResponseScore(boundary).stageU) / h;
    assert(left > 0.1 && right > 0.1, 'boundary must not introduce a second dwell');
    near(left, right, 0.001);
    assert((sampleResponseScore(start + h).stageU - sampleResponseScore(start).stageU) / h < 1e-6);
    assert((sampleResponseScore(end).stageU - sampleResponseScore(end - h).stageU) / h < 1e-6);
  }
});
