import test from 'node:test';
import assert from 'node:assert/strict';
import {createReadingPlan, createReadingState, advanceReading, sampleReadingTarget, sampleReadingScore, sampleResponseScore, createPlaneFeedback, advancePlaneFeedback} from '../components/story-response.mjs';

const near = (actual, expected, tolerance = 1e-9) => assert(Math.abs(actual - expected) <= tolerance, `${actual} differs from ${expected}`);
const planFor = (viewportHeight = 1000) => createReadingPlan({anchors: [0, 1350, 2700, 4900, 6200, 7400, 8600, 10000], viewportHeight, maxScroll: 10000 - viewportHeight, stops: [600, 1800, 2850, 3450, 4100, 4650, 5450, 6700, 8100].map((y, index) => ({id: `stop-${index}`, y}))});
const settle = (state, y, plan) => {
  for (let frame = 0; frame < 240; frame += 1) {advanceReading(state, y, 1 / 60, {plan}); if (state.settled) return state;}
  assert.fail('Reading response did not return to idle.');
};

test('authored reading holds are monotone, continuous, endpoint preserving and cover every long-page position', () => {
  for (const height of [640, 844, 1000]) {
    const plan = planFor(height);
    let previous = -1;
    for (let y = 0; y <= plan.maxScroll; y += 0.5) {
      const target = sampleReadingTarget(y, plan).targetDocY;
      assert(target >= previous - 1e-8, 'forward input never skips backwards through prose');
      assert(target >= 0 && target <= plan.maxScroll);
      assert(Math.abs(target - y) < height * 0.11);
      previous = target;
    }
    near(sampleReadingTarget(0, plan).targetDocY, 0);
    near(sampleReadingTarget(plan.maxScroll, plan).targetDocY, plan.maxScroll);
    for (const stop of plan.stops) {
      for (const y of [stop.holdStart, stop.y, stop.holdEnd]) near(sampleReadingTarget(y, plan).targetDocY, stop.y);
      for (const boundary of [stop.start, stop.holdStart, stop.holdEnd, stop.end]) {
        const h = 0.001, a = sampleReadingTarget(boundary - h, plan).targetDocY, b = sampleReadingTarget(boundary, plan).targetDocY, c = sampleReadingTarget(boundary + h, plan).targetDocY;
        assert(Math.abs((b - a) / h - (c - b) / h) < 0.00001, 'velocity has no corner at a hold boundary');
      }
    }
    // Continuous monotone endpoints imply every intervening reading position is
    // reachable. Also solve for representative exact paragraph positions.
    for (const desired of [2750, 3011, 3420, 3833, 4270, 4800]) {
      let low = 0, high = plan.maxScroll;
      for (let iteration = 0; iteration < 60; iteration += 1) {const mid = (low + high) / 2; if (sampleReadingTarget(mid, plan).targetDocY < desired) low = mid; else high = mid;}
      near(sampleReadingTarget((low + high) / 2, plan).targetDocY, desired, 1e-7);
    }
  }
});

test('whole reading position accelerates, decelerates and ends at an authored stop with no residual clock', () => {
  const plan = planFor(), state = createReadingState(450), speeds = [];
  for (let frame = 0; frame < 180; frame += 1) {
    advanceReading(state, 615, 1 / 60, {plan}); speeds.push(state.velocity);
    const score = sampleReadingScore(state, plan);
    near(score.readingShiftY, 615 - state.visualDocY);
    assert(state.nativeDocY === 615);
    if (state.settled) break;
  }
  assert(speeds[1] > speeds[0] && Math.max(...speeds) > speeds[0] * 1.5);
  assert(state.settled && speeds.at(-1) === 0);
  near(state.visualDocY, 600);
  const score = sampleReadingScore(state, plan);
  assert.equal(score.holdId, 'stop-0'); near(score.holdWeight, 1);
  const saved = structuredClone(state);
  for (let frame = 0; frame < 10; frame += 1) advanceReading(state, 615, 1 / 60, {plan});
  assert.deepEqual(state, saved);
});

test('one pixel response agrees at 3, 30, 60 and 120Hz, including ordinary heavy frames', () => {
  const plan = planFor(), results = [];
  for (const rate of [3, 30, 60, 120]) {
    const state = createReadingState(450);
    for (let frame = 0; frame < rate; frame += 1) advanceReading(state, 640, 1 / rate, {plan});
    results.push(state);
  }
  for (const state of results.slice(1)) {near(state.visualDocY, results[0].visualDocY, 1e-8); near(state.velocity, results[0].velocity, 1e-8);}
});

test('reversal preserves momentum but stays bounded, including fast travel on mobile long sections', () => {
  const plan = planFor(844), state = createReadingState(2700);
  advanceReading(state, 3000, 1 / 60, {plan});
  assert(state.velocity > 0);
  advanceReading(state, 2990, 1 / 60, {plan});
  assert(state.velocity > 0, 'a small reversal does not discard existing forward momentum');
  for (const y of [3200, 3600, 4200, 4700, 3900, 3300, 2850]) {
    advanceReading(state, y, 1 / 30, {plan});
    assert(Math.abs(state.targetDocY - state.visualDocY) <= plan.maxLag + 1e-8);
    assert(Math.abs(state.nativeDocY - state.visualDocY) <= plan.maxLag + plan.viewportHeight * 0.11);
  }
  settle(state, 2850, plan);
  near(state.visualDocY, 2850);
  const targetForward = Array.from({length: 100}, (_, index) => sampleReadingTarget(2700 + index * 20, plan));
  const targetReverse = Array.from({length: 100}, (_, index) => sampleReadingTarget(2700 + (99 - index) * 20, plan)).reverse();
  assert.deepEqual(targetForward, targetReverse);
  assert(plan.stops.filter(stop => stop.y >= 2700 && stop.y <= 4900).length >= 4, 'long mobile System chapter has multiple actual reading stops');
});

test('focus seek remains exact until genuine scroll input and resumes damping without a backward shoulder jump', () => {
  const plan = planFor(), state = createReadingState(100);
  advanceReading(state, 700, 1 / 60, {plan, seek: true});
  for (let frame = 0; frame < 8; frame += 1) advanceReading(state, 700, 1 / 60, {plan});
  near(state.visualDocY, 700); assert(state.seekUntilInput);
  advanceReading(state, 701, 1 / 60, {plan});
  assert(!state.seekUntilInput && !state.settled);
  assert(state.visualDocY > 700 && state.visualDocY < 701, 'first wheel movement is damped and keeps its intended direction');
  assert.equal(sampleReadingScore(state, plan).holdWeight, 0);
  settle(state, 900, plan);
  assert.equal(state.bypassHoldId, null);
  settle(state, 1800, plan);
  near(sampleReadingScore(state, plan).holdWeight, 1);
});

test('Reduced, resume, stale frames, endpoint seeks and large page jumps preserve natural reading immediately', () => {
  const plan = planFor(844);
  for (const options of [{reducedMotion: true}, {resumed: true}, {seek: true}, {}]) {
    const state = createReadingState(400);
    advanceReading(state, 620, Object.keys(options).length ? 1 / 60 : 1.01, {plan, ...options});
    near(state.visualDocY, 620); near(sampleReadingScore(state, plan).readingShiftY, 0);
    assert(state.settled && state.velocity === 0 && state.acceleration === 0);
  }
  const state = createReadingState(200);
  advanceReading(state, plan.maxScroll, 1 / 60, {plan});
  near(state.visualDocY, plan.maxScroll);
  advanceReading(state, -100, 1 / 60, {plan});
  near(state.visualDocY, 0);
  const score = sampleReadingScore(state, plan);
  assert(score.nativeU >= 0 && score.visualU <= 1);
});

test('camera and editorial stage progress are sampled from exactly the final visible document position', () => {
  const plan = planFor(), state = createReadingState(2810);
  advanceReading(state, 2970, 1 / 60, {plan});
  const score = sampleReadingScore(state, plan);
  assert(score.nativeU !== score.visualU);
  const expectedPhase = (state.visualDocY + plan.focusOffset - 2700) / (4900 - 2700);
  near(score.visualU, (2 + expectedPhase) / 7);
  assert.deepEqual({stageU: score.stageU, chapterId: score.chapterId, localPhase: score.localPhase, dwellWeight: score.dwellWeight}, sampleResponseScore(score.visualU));
});

test('local pointer or semantic feedback shares the caller tick and returns to idle; Reduced applies semantic values immediately', () => {
  const a = createPlaneFeedback(), b = createPlaneFeedback();
  advancePlaneFeedback(a, {x: 1, y: -0.5, press: 1}, 1 / 60);
  assert(a.x > 0 && a.x < 1 && a.press > 0 && !a.settled);
  assert.deepEqual(b, createPlaneFeedback());
  for (let frame = 0; frame < 180 && !a.settled; frame += 1) advancePlaneFeedback(a, {x: 1, y: -0.5, press: 1}, 1 / 60);
  assert(a.settled); near(a.press, 1);
  advancePlaneFeedback(a, {x: 0, y: 0, press: 0}, 1 / 60, {reducedMotion: true});
  assert.deepEqual(a, createPlaneFeedback());
  advancePlaneFeedback(b, {press: 1}, 1 / 60, {reducedMotion: true});
  near(b.press, 1); assert(b.settled);
  const rates = [30, 60, 120].map(rate => {const state = createPlaneFeedback(); for (let frame = 0; frame < rate / 2; frame += 1) advancePlaneFeedback(state, {x: 1}, 1 / rate); return state;});
  for (const state of rates) near(state.x, rates[0].x);
});

test('reading plans are immutable, stop windows do not overlap and invalid inputs fail before producing CSS numbers', () => {
  const anchors = [0, 1000, 2000, 3000, 4000, 5000, 6000, 7000], stops = [{y: 1500}, {y: 1501}, {y: 1700}, {y: 1900}];
  const plan = createReadingPlan({anchors, viewportHeight: 844, maxScroll: 6156, stops});
  anchors[1] = 200; stops[0].y = 99;
  assert.equal(plan.anchors[1], 1000); assert.equal(plan.stops[0].y, 1500);
  assert(Object.isFrozen(plan) && Object.isFrozen(plan.stops[0]));
  for (let index = 1; index < plan.stops.length; index += 1) assert(plan.stops[index - 1].end < plan.stops[index].start);
  assert.throws(() => createReadingPlan({anchors: [0, 1], viewportHeight: 844, maxScroll: 10}));
  assert.throws(() => createReadingPlan({anchors: plan.anchors, viewportHeight: 0, maxScroll: 10}));
  for (const value of [NaN, Infinity, '20']) {
    assert.throws(() => sampleReadingTarget(value, plan));
    assert.throws(() => advanceReading(createReadingState(), 100, value, {plan}));
    assert.throws(() => advancePlaneFeedback(createPlaneFeedback(), {x: value}, 1 / 60));
  }
});
