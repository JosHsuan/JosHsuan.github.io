import test from 'node:test';
import assert from 'node:assert/strict';
import {CANVAS_CHAPTERS, CANVAS_SCENE_PROBE, createCanvasMotion, advanceCanvasMotion, sampleCanvasHold} from '../components/canvas-motion.mjs';

const anchors = [0, 1300, 3700, 7800, 10100, 11500, 12900, 14700];
const viewport = {width: 1440, height: 1000};
const input = (docY, patch = {}) => ({anchors, viewport, docY, ...patch});
const near = (a, b, epsilon = 1e-9) => assert(Math.abs(a - b) <= epsilon, `${a} differs from ${b}`);
const visual = state => ({x: state.x, y: state.y, scale: state.scale, opacity: state.opacity, mode: state.mode});

test('the authored scene hold is viewport scale at distinct scroll positions, independent of moving information', () => {
  for (const size of [viewport, {width: 390, height: 844}, {width: 820, height: 1180}]) {
    for (const index of [0, 1, 2, 3, 6]) {
      const sample = sampleCanvasHold(input(anchors[index], {viewport: size, forcedChapter: CANVAS_CHAPTERS[index]}));
      assert(sample.holdEnd - sample.holdStart >= (anchors[index + 1] - anchors[index]) * .62 - 1e-8);
      for (const fraction of [0, .17, .55, 1]) {
        const docY = sample.holdStart + (sample.holdEnd - sample.holdStart) * fraction;
        const pose = sampleCanvasHold(input(Math.min(docY, sample.end - 1e-7), {viewport: size}));
        assert.equal(pose.chapter, CANVAS_CHAPTERS[index]);
        assert.deepEqual(visual(pose), {x: 0, y: 0, scale: 1, opacity: 1, mode: 'hold'});
      }
    }
  }
});

test('scene and information triggers differ rather than sharing the clipped source aperture', () => {
  const docY = anchors[2] - viewport.height * .52;
  assert(docY + viewport.height * .42 < anchors[2], 'existing information focus can remain in FORM');
  assert(docY + viewport.height * CANVAS_SCENE_PROBE > anchors[2]);
  const scene = sampleCanvasHold(input(docY));
  assert.equal(scene.chapter, 'system');
  assert.equal(scene.mode, 'entry');
  assert.equal(scene.scale, 1, 'entry does not shrink the cinematography');
});

test('entry and exit are continuous at the hold, and the scene changes only across a zero-opacity boundary', () => {
  const descriptor = sampleCanvasHold(input(anchors[2]));
  for (const boundary of [descriptor.holdStart, descriptor.holdEnd]) {
    const a = sampleCanvasHold(input(boundary - .001)), b = sampleCanvasHold(input(boundary + .001));
    near(a.x, b.x, 1e-7); near(a.y, b.y, 1e-7); near(a.opacity, b.opacity, 1e-8);
    assert.equal(a.scale, 1); assert.equal(b.scale, 1);
  }
  const before = sampleCanvasHold(input(descriptor.end - .001)), after = sampleCanvasHold(input(descriptor.end + .001));
  assert.equal(before.chapter, 'system'); assert.equal(after.chapter, 'pattern');
  assert(before.opacity < 1e-8 && after.opacity < 1e-8, 'hidden boundary permits repositioning to the next entrance');
});

test('every entry, hold and exit retraces the same screen pose on reverse scroll', () => {
  const positions = Array.from({length: 301}, (_, i) => i * 48);
  const forward = positions.map(docY => sampleCanvasHold(input(docY)));
  const reverse = positions.toReversed().map(docY => sampleCanvasHold(input(docY))).reverse();
  assert.deepEqual(reverse, forward);
  assert(forward.some(p => p.mode === 'exit' && p.x < -viewport.width * .5 && p.scale === 1));
});

test('caller-owned trigger damping agrees at 3, 30, 60 and 120 Hz and settles exactly', () => {
  const results = [];
  for (const rate of [3, 30, 60, 120]) {
    const state = advanceCanvasMotion(createCanvasMotion(), 0, input(2500));
    for (let frame = 0; frame < rate / 3; frame++) advanceCanvasMotion(state, 1 / rate, input(3100));
    assert(state.sceneDocY > 2500 && state.sceneDocY < 3100);
    results.push(state);
  }
  for (const state of results.slice(1)) {
    near(state.sceneDocY, results[0].sceneDocY); near(state.x, results[0].x); near(state.opacity, results[0].opacity);
  }
  const state = results[0];
  for (let frame = 0; frame < 120; frame++) advanceCanvasMotion(state, 1 / 60, input(3100));
  assert(state.settled); assert.equal(state.sceneDocY, 3100);
  const saved = structuredClone(state);
  for (let frame = 0; frame < 10; frame++) advanceCanvasMotion(state, 1 / 60, input(3100));
  assert.deepEqual(state, saved);
});

test('interruption preserves the presented trigger position instead of restarting an entrance', () => {
  const state = advanceCanvasMotion(createCanvasMotion(), 0, input(2500));
  advanceCanvasMotion(state, 1 / 30, input(3200));
  const before = state.sceneDocY;
  advanceCanvasMotion(state, 0, input(2500));
  near(state.sceneDocY, before);
  advanceCanvasMotion(state, 1 / 60, input(2500));
  assert(state.sceneDocY < before && state.sceneDocY > 2500);
  assert.equal(state.scale, 1);
});

test('seek and Reduced choose a useful still hold while real subsequent scroll resumes authored passage', () => {
  const y = anchors[2] - viewport.height * .59;
  const state = advanceCanvasMotion(createCanvasMotion(), 0, input(y, {seek: true}));
  assert.equal(state.chapter, 'system'); assert.equal(state.mode, 'hold'); assert.equal(state.opacity, 1);
  advanceCanvasMotion(state, 1 / 60, input(y));
  assert.equal(state.mode, 'hold');
  advanceCanvasMotion(state, 1 / 60, input(y + 1));
  assert(!state.seekUntilInput); assert.equal(state.mode, 'hold'); assert.equal(state.opacity, 1);
  advanceCanvasMotion(state, 1, input(y - 1));
  assert.equal(state.mode, 'entry'); assert(state.opacity > .999 && state.opacity < 1, 'reverse leaves the seek hold continuously');
  advanceCanvasMotion(state, 1, input(anchors[2]));
  assert.equal(state.seekHold, null); assert.equal(state.mode, 'hold');
  const reduced = advanceCanvasMotion(createCanvasMotion(), 0, input(y, {reducedMotion: true}));
  assert.deepEqual(visual(reduced), {x: 0, y: 0, scale: 1, opacity: 1, mode: 'hold'});
  const forced = sampleCanvasHold(input(0, {forcedChapter: 'pattern'}));
  assert.equal(forced.chapter, 'pattern'); assert.equal(forced.mode, 'hold'); assert.equal(forced.opacity, 1);
  const descriptor = sampleCanvasHold(input(anchors[2]));
  const exitY = descriptor.end - 200;
  const departure = advanceCanvasMotion(createCanvasMotion(), 0, input(exitY, {seek: true}));
  advanceCanvasMotion(departure, 1, input(exitY + 1));
  assert.equal(departure.mode, 'exit'); assert(departure.opacity > .999 && departure.opacity < 1);
  advanceCanvasMotion(departure, 1, input(exitY - 1));
  assert.equal(departure.mode, 'hold'); assert.equal(departure.opacity, 1);
});

test('MAKE and VALIDATION are genuinely absent, while credits return and remain full scale at the end', () => {
  for (const index of [4, 5]) {
    const state = advanceCanvasMotion(createCanvasMotion(), 0, input(anchors[index]));
    assert.equal(state.chapter, CANVAS_CHAPTERS[index]);
    assert(state.settled && !state.visible && state.opacity === 0 && state.mode === 'absent');
  }
  for (const y of [anchors[6], anchors[7] - viewport.height, anchors[7]]) {
    const state = advanceCanvasMotion(createCanvasMotion(), 1.01, input(y));
    assert.equal(state.chapter, 'credits'); assert(state.visible && state.opacity === 1 && state.scale === 1);
  }
  const state = advanceCanvasMotion(createCanvasMotion(), 0, input(0));
  advanceCanvasMotion(state, 1 / 60, input(anchors[6]));
  assert.equal(state.sceneDocY, anchors[6]); assert.equal(state.chapter, 'credits');
});

test('invalid chapter ranges, viewport, time or explicit scene request are rejected', () => {
  assert.throws(() => sampleCanvasHold(input(0, {anchors: [0, 1]})), /eight/);
  assert.throws(() => sampleCanvasHold(input(0, {anchors: [0, 1, 1, 3, 4, 5, 6, 7]})), /increasing/);
  assert.throws(() => sampleCanvasHold(input(NaN)), /position/);
  assert.throws(() => sampleCanvasHold(input(0, {viewport: {width: 0, height: 844}})), /viewport/);
  assert.throws(() => sampleCanvasHold(input(0, {forcedChapter: 'invented'})), /known/);
  assert.throws(() => advanceCanvasMotion(createCanvasMotion(), -1, input(0)), /delta/);
});
