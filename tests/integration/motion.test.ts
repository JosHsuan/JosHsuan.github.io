import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createMotionController } from '../../src/motion/createController';
import { SceneDirector } from '../../src/features/scene-viewer/SceneDirector';
import type { MotionDriver } from '../../src/motion/contracts';

function fixture() {
  let resolveReady!: () => void;
  let resolvePlay!: (completed: boolean) => void;
  const calls: (string | number)[] = [];
  const driver: MotionDriver = {
    ready: new Promise((resolve) => { resolveReady = resolve; }),
    play: () => { calls.push('play'); return new Promise((resolve) => { resolvePlay = resolve; }); },
    pause: () => { calls.push('pause'); resolvePlay?.(false); },
    seek: (seconds) => { calls.push(seconds); },
    setStoryOwnership: (owned) => { calls.push(owned ? 'story' : 'released'); },
    applyStaticPose: () => { calls.push('static'); },
    dispose: () => { calls.push('dispose'); },
  };
  return { motion: createMotionController(driver, { overview: { start: 0, end: 4 } }), calls, resolveReady, finish: () => resolvePlay(true) };
}
test('dispose cancels a playback waiting for readiness and prevents resurrection', async () => {
  const f = fixture(); f.motion.setMode('story');
  const play = f.motion.play('overview'); f.motion.dispose(); f.motion.dispose();
  assert.equal(await play, 'cancelled'); f.resolveReady(); await f.motion.ready;
  assert.equal(f.calls.includes('play'), false);
  assert.equal(f.calls.filter((call) => call === 'dispose').length, 1);
});
test('late readiness applies only the latest scroll position', async () => {
  const f = fixture(); f.motion.setMode('story');
  f.motion.seek('overview', 0.2); f.motion.seek('overview', 0.75);
  f.resolveReady(); await f.motion.ready;
  assert.deepEqual(f.calls.filter((call) => typeof call === 'number'), [3]); f.motion.dispose();
});
test('inspection cancels time playback and suppresses scroll writes', async () => {
  const f = fixture(); f.resolveReady(); await f.motion.ready;
  const controls: boolean[] = [];
  const director = new SceneDirector(f.motion, (enabled) => controls.push(enabled));
  director.setMode('story'); const play = director.play('overview'); await Promise.resolve();
  director.setMode('inspect');
  assert.equal(await play, 'cancelled');
  const previous = f.calls.length; director.seekFromScroll('overview', 0.9);
  assert.equal(f.calls.length, previous); assert.equal(controls.at(-1), true);
  director.dispose(); assert.equal(controls.at(-1), false);
});
test('aborting before readiness settles immediately; static mode skips autoplay', async () => {
  const f = fixture(); assert.equal(await f.motion.play('overview'), 'skipped');
  f.motion.setMode('story'); const abort = new AbortController();
  const play = f.motion.play('overview', { signal: abort.signal }); abort.abort();
  assert.equal(await play, 'cancelled'); f.resolveReady(); await f.motion.ready;
  assert.equal(f.calls.includes('play'), false); f.motion.dispose();
});
test('superseded playback cannot reset the newer driver', async () => {
  const f = fixture(); f.resolveReady(); await f.motion.ready;
  const director = new SceneDirector(f.motion, () => {}); director.setMode('story');
  const first = director.play('overview'); await Promise.resolve();
  const second = director.play('overview'); await Promise.resolve();
  assert.equal(await first, 'cancelled'); assert.equal(director.driver, 'time');
  f.finish(); assert.equal(await second, 'completed'); assert.equal(director.driver, 'paused'); director.dispose();
});
