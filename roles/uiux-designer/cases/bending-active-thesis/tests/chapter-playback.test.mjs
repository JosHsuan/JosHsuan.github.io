import test from 'node:test';
import assert from 'node:assert/strict';
import {createChapterPlayback, advanceChapterPlayback, sampleChapterPlayback, PLAYBACK_CHAPTERS} from '../components/chapter-playback.mjs';

const near = (actual, expected, epsilon = 1e-9) => assert(Math.abs(actual - expected) <= epsilon, `${actual} differs from ${expected}`);
const vectorNear = (a, b) => a.forEach((value, index) => near(value, b[index]));
const advance = (state, seconds, options = {}, fps = 60) => {
  for (let frame = 0; frame < Math.round(seconds * fps); frame += 1) advanceChapterPlayback(state, 1 / fps, options);
  return sampleChapterPlayback(state);
};

test('a visible chapter plays every authored beat and multiple loops with no wheel or automatic navigation', () => {
  for (const chapter of PLAYBACK_CHAPTERS) {
    const state = createChapterPlayback(chapter.id), beats = new Set();
    for (let frame = 0; frame < chapter.period * 2 * 30; frame += 1) {
      advanceChapterPlayback(state, 1 / 30);
      const score = sampleChapterPlayback(state);
      beats.add(score.beat);
      assert.equal(score.chapterId, chapter.id);
      assert.equal(score.chapterWeights[chapter.index], 1);
      assert.equal(score.needsFrame, true);
      assert(score.loopPhase >= 0 && score.loopPhase < 1);
    }
    assert.deepEqual([...beats], ['arrival', 'read', 'examine', 'return']);
    near(state.activeSeconds, chapter.period * 2, 1e-8);
  }
});

test('rate impulses and chapter passages agree at 3, 30, 60 and 120 Hz for equal elapsed input', () => {
  const run = fps => {
    const state = createChapterPlayback();
    for (let second = 0; second < 8; second += 1) {
      const chapter = [0, 1, 1, 4, 2, 0, 6, 6][second];
      advanceChapterPlayback(state, 0, {chapter, impulse: [0, .6, 0, 1, -.8, -1, 0, 0][second]});
      advance(state, 1, {chapter}, fps);
    }
    return sampleChapterPlayback(state);
  };
  const reference = run(120);
  for (const fps of [3, 30, 60]) {
    const score = run(fps);
    near(score.activeSeconds, reference.activeSeconds);
    near(score.tempo, reference.tempo);
    near(score.entranceSeconds, reference.entranceSeconds);
    vectorNear(score.chapterWeights, reference.chapterWeights);
    vectorNear(score.phases, reference.phases);
  }
});

test('wheel energy accelerates a forward clock, decays analytically, and never becomes a scrub coordinate', () => {
  const state = createChapterPlayback('system');
  advanceChapterPlayback(state, 0, {impulse: -1});
  let score = sampleChapterPlayback(state);
  near(score.tempo, 1.85);
  assert.equal(score.direction, -1);
  score = advance(state, .5);
  near(score.activeSeconds, .5 + .85 * (1 - Math.exp(-2.6 * .5)) / 2.6);
  near(score.tempo, 1 + .85 * Math.exp(-2.6 * .5));
  assert.equal(score.chapterId, 'system');
  assert(score.loopTime > .5, 'backward wheel speeds a forward authored beat, rather than reversing its time');
  advanceChapterPlayback(state, 0, {impulse: 100});
  advanceChapterPlayback(state, 0, {impulse: 100});
  near(sampleChapterPlayback(state).tempo, 2.4);
  score = advance(state, 10);
  near(score.tempo, 1, 1e-9);
  assert.equal(score.direction, 0);
  assert.equal(score.needsFrame, true, 'visible autonomous playback deliberately does not idle');
});

test('interrupted third-chapter transitions and rapid reversals preserve the actual current composition', () => {
  const state = createChapterPlayback('overview');
  advance(state, .3, {chapter: 'form'});
  const before = sampleChapterPlayback(state);
  assert(before.chapterWeights[0] > 0 && before.chapterWeights[1] > 0);
  advanceChapterPlayback(state, 0, {chapter: 'make'});
  vectorNear(sampleChapterPlayback(state).chapterWeights, before.chapterWeights);
  advance(state, .2, {chapter: 'make'});
  const middle = sampleChapterPlayback(state);
  assert(middle.chapterWeights.filter(value => value > 0).length === 3);
  advanceChapterPlayback(state, 0, {chapter: 'overview'});
  vectorNear(sampleChapterPlayback(state).chapterWeights, middle.chapterWeights);
  for (let frame = 0; frame < 120; frame += 1) {
    advanceChapterPlayback(state, 1 / 60, {chapter: 'overview'});
    const weights = sampleChapterPlayback(state).chapterWeights;
    near(weights.reduce((sum, value) => sum + value, 0), 1);
    assert(weights.every(value => value >= 0 && value <= 1));
  }
  assert.deepEqual(sampleChapterPlayback(state).chapterWeights, [1, 0, 0, 0, 0, 0, 0]);
});

test('pause and deliberate engagement freeze the pose; navigation and semantic seeks remain usable', () => {
  const state = createChapterPlayback('form');
  advance(state, .3, {chapter: 'system'});
  const moving = sampleChapterPlayback(state);
  advance(state, 5, {paused: true});
  let score = sampleChapterPlayback(state);
  near(score.activeSeconds, moving.activeSeconds);
  vectorNear(score.chapterWeights, moving.chapterWeights);
  assert.equal(score.needsFrame, false);
  advanceChapterPlayback(state, .5, {paused: true, chapter: 'credits'});
  assert.deepEqual(sampleChapterPlayback(state).chapterWeights, [0, 0, 0, 0, 0, 0, 1]);
  advanceChapterPlayback(state, .5, {engaged: true});
  near(state.activeSeconds, moving.activeSeconds);
  assert.equal(state.needsFrame, false);
  advanceChapterPlayback(state, 0, {chapter: 'form', seek: true});
  score = sampleChapterPlayback(state);
  assert.deepEqual(score.chapterWeights, [0, 1, 0, 0, 0, 0, 0]);
  near(score.activeSeconds, moving.activeSeconds);
  assert.equal(score.needsFrame, true);
  advanceChapterPlayback(state, .1);
  assert(state.activeSeconds > moving.activeSeconds);
});

test('engagement resolves a retargeted or in-flight chapter before freezing its presented pose', () => {
  const retargeted = createChapterPlayback('system');
  advanceChapterPlayback(retargeted, .2, {chapter: 'form', engaged: true});
  let score = sampleChapterPlayback(retargeted);
  assert.equal(score.chapterId, 'form');
  assert.deepEqual(score.chapterWeights, [0, 1, 0, 0, 0, 0, 0]);
  assert.equal(score.blend, 1); assert.equal(score.activeSeconds, 0); assert.equal(score.needsFrame, false);

  const inflight = createChapterPlayback('form');
  advanceChapterPlayback(inflight, .2, {chapter: 'system'});
  const before = sampleChapterPlayback(inflight);
  assert(before.chapterWeights[1] > before.chapterWeights[2], 'the old chapter still dominates before engagement');
  advanceChapterPlayback(inflight, .5, {chapter: 'system', engaged: true});
  score = sampleChapterPlayback(inflight);
  assert.deepEqual(score.chapterWeights, [0, 0, 1, 0, 0, 0, 0]);
  assert.equal(score.blend, 1); assert.equal(score.activeSeconds, before.activeSeconds); assert.equal(score.needsFrame, false);
  const held = structuredClone(inflight);
  advanceChapterPlayback(inflight, .8, {chapter: 'system', engaged: true});
  assert.deepEqual(inflight, held, 'settled same-chapter engagement changes no pose or clock bookkeeping');
});

test('hidden, resumed and stale gaps discard elapsed time while ordinary heavy frames integrate exactly', () => {
  const state = createChapterPlayback();
  advance(state, .5, {impulse: 0});
  const time = state.activeSeconds;
  advanceChapterPlayback(state, 600, {hidden: true, impulse: 1});
  near(state.activeSeconds, time);
  assert.equal(state.needsFrame, false);
  advanceChapterPlayback(state, 600, {resumed: true});
  near(state.activeSeconds, time);
  assert.equal(state.needsFrame, true);
  advanceChapterPlayback(state, 2);
  near(state.activeSeconds, time);
  const a = createChapterPlayback(), b = createChapterPlayback();
  advanceChapterPlayback(a, 0, {impulse: .75});
  advanceChapterPlayback(b, 0, {impulse: .75});
  advanceChapterPlayback(a, .5);
  advance(b, .5);
  near(a.activeSeconds, b.activeSeconds);
  near(a.boost, b.boost);
});

test('Reduced selects a stable readable beat, stops clocks and immediately respects every requested chapter', () => {
  const state = createChapterPlayback('form');
  advance(state, .5);
  const time = state.activeSeconds;
  for (const chapter of PLAYBACK_CHAPTERS) {
    advanceChapterPlayback(state, .5, {chapter: chapter.id, reducedMotion: true, impulse: 1});
    const score = sampleChapterPlayback(state);
    near(score.activeSeconds, time);
    assert.equal(score.chapterWeights[chapter.index], 1);
    assert.equal(score.beat, 'read');
    near(score.loopPhase, .32);
    assert.equal(score.needsFrame, false);
    assert.equal(score.energy, 0);
  }
});

test('chapter re-entry preserves the shared time and resets only chapter entrance bookkeeping', () => {
  const state = createChapterPlayback('form');
  advance(state, 3);
  advance(state, 2, {chapter: 'system'});
  const before = sampleChapterPlayback(state);
  advanceChapterPlayback(state, 0, {chapter: 'form'});
  const after = sampleChapterPlayback(state);
  near(after.activeSeconds, before.activeSeconds);
  vectorNear(after.phases, before.phases);
  near(after.entranceSeconds, 0);
  assert(after.loopPhase > 0, 're-entry is not an unsolicited new introduction');
  after.chapterWeights[0] = 999;
  after.chapters[0].phase = 999;
  assert(sampleChapterPlayback(state).chapterWeights[0] <= 1);
  assert(sampleChapterPlayback(state).chapters[0].phase < 1);
});

test('invalid chapters and timing cannot silently select a fabricated chapter or corrupt the clock', () => {
  for (const chapter of ['unknown', '', -1, 7, .3, NaN, null]) assert.throws(() => createChapterPlayback(chapter), /Chapter/);
  for (const dt of [-1, NaN, Infinity]) assert.throws(() => advanceChapterPlayback(createChapterPlayback(), dt));
  assert.throws(() => advanceChapterPlayback(createChapterPlayback(), 0, {chapter: 'unknown'}), /Chapter/);
  assert.throws(() => advanceChapterPlayback(createChapterPlayback(), 0, {impulse: NaN}), /Impulse/);
  assert.throws(() => sampleChapterPlayback({}), /state/);
  assert(Object.isFrozen(PLAYBACK_CHAPTERS) && PLAYBACK_CHAPTERS.every(Object.isFrozen));
});
