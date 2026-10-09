import test from 'node:test';
import assert from 'node:assert/strict';
import {createCanvasMotion, advanceCanvasMotion} from '../components/canvas-motion.mjs';

const desktop = {viewport: {width: 1440, height: 1000}, surface: {width: 691.2, height: 576}};
const phone = {viewport: {width: 390, height: 844}, surface: {width: 354, height: 354}};
const options = (patch = {}) => ({...desktop, chapter: 'form', rect: {left: 790, top: 160, width: 550, height: 600}, ...patch});
const near = (a, b, epsilon = 1e-9) => assert(Math.abs(a - b) <= epsilon, `${a} differs from ${b}`);
const settle = (state, input) => {
  for (let frame = 0; frame < 240; frame++) {advanceCanvasMotion(state, 1 / 60, input); if (state.settled) return state;}
  assert.fail('The Canvas response did not return to idle.');
};

test('a held source stage fits its clipped anchor with a uniform scale and clear source interior', () => {
  for (const input of [options(), options({...phone, rect: {left: 18, top: 55, width: 354, height: 780}}),
    options({rect: {left: 900, top: 810, width: 600, height: 450}})]) {
    const state = advanceCanvasMotion(createCanvasMotion(), 0, {...input, seek: true});
    const {rect, viewport, surface} = input;
    const left = Math.max(16, rect.left), top = Math.max(92, rect.top);
    const right = Math.min(viewport.width - 16, rect.left + rect.width);
    const bottom = Math.min(viewport.height - (viewport.width <= 780 ? 86 : 28), rect.top + rect.height);
    assert(state.settled && state.visible && state.mode === 'docked');
    assert(state.scale > 0 && state.scale <= 1);
    assert(state.x >= left - 1e-8 && state.y >= top - 1e-8);
    assert(state.x + surface.width * state.scale <= right + 1e-8);
    assert(state.y + surface.height * state.scale <= bottom + 1e-8);
    // A 3%-padded source fit inside local [.06,.06,.88,.88] is necessarily
    // inside the visible anchor; camera-support projection has separate tests.
    const inset = .06 + .88 * .03;
    assert(state.x + surface.width * state.scale * inset > left);
    assert(state.y + surface.height * state.scale * inset > top);
    near(surface.width * state.scale / (surface.height * state.scale), surface.width / surface.height);
  }
});

test('held-target damping agrees across 3, 30, 60 and 120 Hz without overshoot', () => {
  const results = [];
  for (const rate of [3, 30, 60, 120]) {
    const state = advanceCanvasMotion(createCanvasMotion(), 0, {...options(), seek: true});
    const input = options({chapter: 'system', rect: {left: 690, top: 330, width: 580, height: 420}});
    for (let frame = 0; frame < rate / 3; frame++) advanceCanvasMotion(state, 1 / rate, input);
    results.push(state);
    assert(state.x >= 690 && state.x <= 790);
    assert(state.scale <= 1 && state.opacity === 1);
  }
  for (const state of results.slice(1)) for (const key of ['x', 'y', 'scale', 'opacity']) near(state[key], results[0][key]);
});

test('an interrupted exit reverses continuously and returns to the same exact dock', () => {
  const input = options(), state = advanceCanvasMotion(createCanvasMotion(), 0, {...input, seek: true});
  const original = {...state};
  advanceCanvasMotion(state, 1 / 30, options({chapter: 'make', rect: null}));
  const exiting = {...state};
  assert(exiting.x > original.x && exiting.opacity < 1 && !exiting.settled);
  advanceCanvasMotion(state, 0, input);
  near(state.x, exiting.x); near(state.opacity, exiting.opacity);
  advanceCanvasMotion(state, 1 / 60, input);
  assert(state.x < exiting.x && state.x > original.x);
  assert(state.opacity > exiting.opacity && state.opacity < 1);
  settle(state, input);
  for (const key of ['x', 'y', 'scale', 'opacity']) near(state[key], original[key]);
  assert(state.visible && state.settled && state.mode === 'docked');
});

test('seek, Reduced and stale-frame resume snap to the real source or absent chapter', () => {
  for (const patch of [{seek: true}, {reducedMotion: true}, {}]) {
    const state = createCanvasMotion();
    advanceCanvasMotion(state, Object.keys(patch).length ? 1 / 60 : 1.01, {...options(), ...patch});
    assert(state.visible && state.settled && state.opacity === 1);
    advanceCanvasMotion(state, Object.keys(patch).length ? 1 / 60 : 1.01, {...options({chapter: 'validation', rect: null}), ...patch});
    assert(!state.visible && state.settled && state.opacity === 0 && state.mode === 'absent');
  }
});

test('MAKE exits to a stable absent state, and CREDITS returns without a new motion object', () => {
  const state = advanceCanvasMotion(createCanvasMotion(), 0, {...options(), seek: true});
  const absent = options({chapter: 'make', rect: null});
  advanceCanvasMotion(state, 1 / 60, absent);
  assert(state.visible && !state.settled && state.mode === 'exiting');
  settle(state, absent);
  assert(!state.visible && state.opacity === 0 && state.x > desktop.viewport.width);
  const snapshot = structuredClone(state);
  for (let frame = 0; frame < 12; frame++) advanceCanvasMotion(state, 1 / 60, absent);
  assert.deepEqual(state, snapshot);
  const credits = options({chapter: 'credits', rect: {left: 860, top: 300, width: 420, height: 380}});
  settle(state, credits);
  assert(state.visible && state.settled && state.opacity === 1);
});

test('native anchor departure shrinks and fades to sleep and reverse scrolling restores it', () => {
  const input = options({...phone, rect: {left: 18, top: 250, width: 354, height: 360}});
  const state = advanceCanvasMotion(createCanvasMotion(), 0, {...input, seek: true});
  const heldScale = state.scale;
  const edge = {...input, rect: {...input.rect, top: 45 - input.rect.height}};
  settle(state, edge);
  assert(!state.visible && state.settled && state.opacity === 0 && state.scale < heldScale);
  const sliver = {...input, rect: {...input.rect, top: 112 - input.rect.height}};
  advanceCanvasMotion(state, 0, {...sliver, seek: true});
  assert(state.visible && state.opacity > 0 && state.opacity < 1);
  settle(state, input);
  near(state.scale, heldScale); assert(state.visible && state.opacity === 1);
});

test('initial entry is bounded and invalid dimensions/delta never create a corrupt transform', () => {
  const state = advanceCanvasMotion(createCanvasMotion(), 1 / 60, options());
  assert(state.mode === 'entering' && state.visible && !state.settled);
  assert(state.x - state.target.x <= 64 && state.y - state.target.y <= 18);
  assert(state.opacity > 0 && state.opacity < 1);
  assert.throws(() => advanceCanvasMotion(state, -1, options()), /delta/);
  assert.throws(() => advanceCanvasMotion(state, 0, options({surface: {width: 0, height: 10}})), /surface/);
  assert.throws(() => advanceCanvasMotion(state, 0, options({rect: {left: 1, top: 1, width: NaN, height: 20}})), /anchor/);
});
