import test from 'node:test';
import assert from 'node:assert/strict';
import {sampleEditorialScore} from '../components/editorial-score.mjs';
import {RESPONSE_CHAPTERS, createResponseState, advanceResponse, sampleResponseScore} from '../components/story-response.mjs';

const near = (actual, expected, tolerance = 1e-12) => assert(Math.abs(actual - expected) <= tolerance, `${actual} differs from ${expected}`);
const at = (index, phase, options = {}) => sampleEditorialScore({visualU: (index + phase) / 7, index, ...options});
const transforms = score => Object.fromEntries(['headingShift', 'lineOffset', 'lineRotate', 'bodyShift', 'mediaShift', 'mediaScale', 'captionShift', 'glyphSpread', 'glyphRotate', 'methodShift', 'lightSweep', 'materialLift'].map(key => [key, score[key]]));
const rest = {headingShift: 0, lineOffset: 0, lineRotate: 0, bodyShift: 0, mediaShift: 0, mediaScale: 1, captionShift: 0, glyphSpread: 0, glyphRotate: 0, methodShift: 0, lightSweep: 0, materialLift: 0};

test('reading progress updates immediately despite delayed visual motion, and prose is stationary', () => {
  const before = at(2, -0.1, {nativeU: 2 / 7});
  const after = at(2, -0.1, {nativeU: 2.9 / 7});
  near(after.ruleProgress, 0.9);
  near(after.nativeProgress, 0.9);
  assert.equal(after.methodProgress, 1);
  assert.deepEqual(transforms(after), transforms(before), 'reading progress cannot introduce a second decorative response');
  assert.equal(after.bodyShift, 0);
  assert(!('opacity' in after) && !('visibility' in after) && !('clip' in after));
});

test('heading and method groups enter sequentially and exit in reverse order', () => {
  const first = at(2, 0, {elementIndex: 0, elementCount: 3});
  const last = at(2, 0, {elementIndex: 2, elementCount: 3});
  assert(first.entry > last.entry);
  assert(first.headingShift < last.headingShift);
  assert(first.methodShift < last.methodShift);
  assert(first.lineOffset < 0 && last.lineOffset > 0, 'separate line planes fan around the shared heading');
  const firstOut = at(2, 0.9, {elementIndex: 0, elementCount: 3});
  const lastOut = at(2, 0.9, {elementIndex: 2, elementCount: 3});
  assert(firstOut.exit < lastOut.exit);
  assert(lastOut.headingShift < firstOut.headingShift);
  assert(first.captionShift < 0 && first.mediaShift > 0, 'caption and evidence frame have distinct depth cues');
});

test('all foreground planes align for every complete authored hold, even while native input moves', () => {
  RESPONSE_CHAPTERS.forEach((chapter, index) => {
    for (const fraction of [0.001, 0.25, 0.75, 0.999]) {
      const phase = chapter.hold[0] + (chapter.hold[1] - chapter.hold[0]) * fraction;
      for (const elementIndex of [0, 1, 2]) {
        const score = at(index, phase, {elementIndex, elementCount: 3, energy: 1, direction: 1});
        near(score.entry, 1); near(score.exit, 0); near(score.dwell, 1);
        for (const [key, value] of Object.entries(rest)) near(score[key], value);
        assert.equal(sampleResponseScore((index + phase) / 7).dwellWeight, 1);
      }
    }
  });
});

test('transitions share the exact camera gate and signed energy rather than an independent clock', () => {
  for (let index = 0; index < 6; index += 1) {
    const start = (index + RESPONSE_CHAPTERS[index].hold[1]) / 7;
    const end = (index + 1 + RESPONSE_CHAPTERS[index + 1].hold[0]) / 7;
    const visualU = (start + end) / 2;
    const forward = sampleEditorialScore({visualU, index, energy: 0.6, direction: 1});
    const backward = sampleEditorialScore({visualU, index, energy: 0.6, direction: -1});
    const idle = sampleEditorialScore({visualU, index});
    near(forward.transitionWeight, 1);
    near(forward.lightSweep, 0.6); near(backward.lightSweep, -0.6);
    near(forward.materialLift, 0.6); near(backward.materialLift, 0.6);
    assert.equal(idle.lightSweep, 0); assert.equal(idle.materialLift, 0);
    const otherElement = sampleEditorialScore({visualU, index: index + 1, elementIndex: 4, elementCount: 5, energy: 0.6, direction: 1});
    near(forward.transitionWeight, otherElement.transitionWeight);
    near(forward.lightSweep, otherElement.lightSweep);
  }
});

test('forward and reverse scrubbing restore the same geometry with no accumulated state', () => {
  const progress = Array.from({length: 141}, (_, index) => index / 140);
  const scores = progress.map(visualU => sampleEditorialScore({visualU, index: 3, elementIndex: 1, elementCount: 4}));
  assert.deepEqual(progress.toReversed().map(visualU => sampleEditorialScore({visualU, index: 3, elementIndex: 1, elementCount: 4})).toReversed(), scores);
  const last = scores.at(-1);
  for (let repeat = 0; repeat < 20; repeat += 1) assert.deepEqual(sampleEditorialScore({visualU: 1, index: 3, elementIndex: 1, elementCount: 4}), last);
});

test('full and Light motion stay bounded for all chapters, group sizes, jumps and scroll directions', () => {
  for (let index = 0; index < 7; index += 1) for (const elementCount of [1, 2, 7]) for (let elementIndex = 0; elementIndex < elementCount; elementIndex += 1) {
    for (let step = -1; step <= 71; step += 1) for (const light of [false, true]) {
      const score = sampleEditorialScore({visualU: step / 70, nativeU: 1 - step / 70, index, elementIndex, elementCount, energy: 1, direction: -1, light});
      assert(Math.abs(score.headingShift) + Math.abs(score.lineOffset) <= 24);
      assert(Math.abs(score.lineRotate) <= 1.1);
      assert(Math.abs(score.mediaShift) <= 24 && score.mediaScale >= 0.982 && score.mediaScale <= 1);
      assert(Math.abs(score.captionShift) <= 8 && Math.abs(score.methodShift) <= 8);
      assert(score.glyphSpread >= 0 && score.glyphSpread <= 8);
      for (const key of ['entry', 'exit', 'dwell', 'nativeProgress', 'ruleProgress', 'methodProgress', 'transitionWeight', 'materialLift']) assert(score[key] >= 0 && score[key] <= 1, key);
      for (const value of Object.values(score)) if (typeof value === 'number') assert(Number.isFinite(value));
      assert.equal(score.bodyShift, 0);
    }
  }
});

test('reduced motion restores every inner plane immediately and Light reduces travel without delaying reading', () => {
  for (let index = 0; index < 7; index += 1) for (const phase of [-0.2, 0, 0.5, 0.9, 1.2]) {
    const reduced = at(index, phase, {elementIndex: 2, elementCount: 3, reducedMotion: true, energy: 1, direction: 1});
    for (const [key, value] of Object.entries(rest)) near(reduced[key], value);
    assert.equal(reduced.entry, 1); assert.equal(reduced.exit, 0); assert.equal(reduced.dwell, 1);
    near(reduced.ruleProgress, at(index, phase).ruleProgress);
    const full = at(index, phase), light = at(index, phase, {light: true});
    near(light.mediaShift, full.mediaShift * 0.45);
    near(light.headingShift, full.headingShift * 0.45);
    near(light.ruleProgress, full.ruleProgress);
    assert.equal(light.materialLift, 0); assert.equal(light.lightSweep, 0);
  }
});

test('entry and exit settle smoothly at the authored boundaries with no endpoint twitch', () => {
  const index = 2, h = 1e-5;
  for (const elementIndex of [0, 2]) {
    const options = {elementIndex, elementCount: 3};
    const end = RESPONSE_CHAPTERS[index].hold[0] - 0.1 + elementIndex / 2 * 0.1;
    const start = RESPONSE_CHAPTERS[index].hold[1] + (1 - elementIndex / 2) * 0.08;
    const slopes = [
      (at(index, end, options).headingShift - at(index, end - h, options).headingShift) / h,
      (at(index, start + h, options).headingShift - at(index, start, options).headingShift) / h,
    ];
    for (const slope of slopes) assert(Math.abs(slope) < 0.00001);
  }
});

test('a large shared-response jump reaches a stable foreground without starting another response', () => {
  const state = createResponseState(0.1);
  let frames = 0;
  do {advanceResponse(state, 0.61, 1 / 60); frames += 1;} while (!state.settled && frames < 240);
  assert(state.settled && frames < 120);
  const options = {...state, index: 4, elementIndex: 1, elementCount: 2};
  const score = sampleEditorialScore(options);
  for (let idle = 0; idle < 20; idle += 1) assert.deepEqual(sampleEditorialScore(options), score);
  assert.equal(score.materialLift, 0); assert.equal(score.lightSweep, 0);
});

test('the shared hold table cannot be mutated and invalid inputs cannot produce broken CSS numbers', () => {
  assert(Object.isFrozen(RESPONSE_CHAPTERS) && Object.isFrozen(RESPONSE_CHAPTERS[0]) && Object.isFrozen(RESPONSE_CHAPTERS[0].hold));
  assert.throws(() => {RESPONSE_CHAPTERS[0].hold[0] = 0;});
  for (const key of ['visualU', 'nativeU', 'energy', 'direction']) for (const value of [NaN, Infinity, '0.5']) assert.throws(() => sampleEditorialScore({visualU: 0.5, [key]: value}));
  for (const index of [-1, 7, 0.5, '1']) assert.throws(() => sampleEditorialScore({visualU: 0.5, index}));
  for (const options of [{elementCount: 0}, {elementCount: 1.5}, {elementIndex: -1}, {elementIndex: 1}, {elementIndex: NaN}]) assert.throws(() => sampleEditorialScore({visualU: 0.5, ...options}));
});
