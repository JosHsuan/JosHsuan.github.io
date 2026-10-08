import test from 'node:test';
import assert from 'node:assert/strict';
import {sampleElementChoreography, CHOREOGRAPHY_KINDS} from '../components/element-choreography.mjs';

const transform = score => ['x', 'y', 'z', 'rotateX', 'rotateY', 'rotateZ', 'scale', 'shadowDepth'].map(key => score[key]);
const identity = [0, 0, 0, 0, 0, 0, 1, 0];

test('all nine content families anticipate, cross their resting plane and settle exactly without hiding content', () => {
  const signatures = new Set();
  for (const kind of CHOREOGRAPHY_KINDS) {
    const start = sampleElementChoreography({kind});
    const channel = start.x ? 'x' : 'y';
    const values = [];
    for (let step = 0; step <= 1000; step += 1) {
      const score = sampleElementChoreography({kind, elapsed: start.duration * step / 1000});
      values.push(score[channel] / start[channel]);
      assert.equal('opacity' in score, false, 'reading content must never fade to zero');
      assert(score.scale > .8 && score.scale < 1.06);
      assert(transform(score).every(Number.isFinite));
    }
    assert(Math.max(...values) > 1.02, `${kind} has a real anticipation, not just an ease-out`);
    assert(Math.min(...values) < -.025, `${kind} crosses its resting plane before settling`);
    const final = sampleElementChoreography({kind, elapsed: 10});
    assert.deepEqual(transform(final), identity);
    assert.equal(final.settled, true);
    assert.equal(final.ruleProgress, 1);
    signatures.add([start.duration, ...transform(start)].join('/'));
  }
  assert.equal(signatures.size, 9, 'distinct content families do not share a generic transition');
});

test('stagger remains bounded for long mobile prose and each revealed item eventually stays still', () => {
  for (const kind of CHOREOGRAPHY_KINDS) {
    const first = sampleElementChoreography({kind, index: 0});
    const second = sampleElementChoreography({kind, index: 1});
    const last = sampleElementChoreography({kind, index: 500});
    assert(second.delay > first.delay);
    assert(last.delay <= .48, 'large documents never create a minutes-long reveal queue');
    assert.equal(last.phase, 'waiting');
    for (const time of [2.1, 16, 32, 1000]) assert.deepEqual(transform(sampleElementChoreography({kind, index: 500, elapsed: time})), identity);
  }
});

test('Reduced immediately settles every element and Light retains the designed shape at lower amplitude', () => {
  for (const kind of CHOREOGRAPHY_KINDS) {
    assert.deepEqual(transform(sampleElementChoreography({kind, elapsed: -10, index: 5, reducedMotion: true})), identity);
    const full = sampleElementChoreography({kind, elapsed: .2});
    const light = sampleElementChoreography({kind, elapsed: .2, light: true});
    assert.equal(light.phase, full.phase);
    assert.equal(light.progress, full.progress);
    assert(Math.abs(light.z) < Math.abs(full.z));
    assert.equal(light.scale - 1 === 0, full.scale - 1 === 0);
  }
});

test('prose stays within a small legible plane while evidence and heading choreography carry larger depth', () => {
  let proseTravel = 0, proseRotation = 0, photoDepth = 0, headingDepth = 0;
  for (let t = 0; t <= 2; t += .002) {
    const prose = sampleElementChoreography({kind: 'prose', elapsed: t});
    proseTravel = Math.max(proseTravel, Math.abs(prose.y));
    proseRotation = Math.max(proseRotation, Math.abs(prose.rotateX));
    photoDepth = Math.max(photoDepth, Math.abs(sampleElementChoreography({kind: 'photo', elapsed: t}).z));
    headingDepth = Math.max(headingDepth, Math.abs(sampleElementChoreography({kind: 'heading', elapsed: t}).z));
  }
  assert(proseTravel <= 8 && proseRotation <= 1.2);
  assert(photoDepth > 100 && headingDepth > 70, 'substantial shadowbox arrival is not a tiny hover effect');
});

test('diagram and glyph branches separate in alternating directions, then rejoin; rule reveal is monotone', () => {
  for (const kind of ['diagram', 'glyph']) {
    const a = sampleElementChoreography({kind, index: 0});
    const b = sampleElementChoreography({kind, index: 1});
    assert.equal(a.x, -b.x);
    assert.equal(a.rotateY, -b.rotateY);
    let previous = 0;
    for (let t = 0; t <= 2; t += .005) {
      const score = sampleElementChoreography({kind, index: 1, elapsed: t});
      assert(score.ruleProgress >= previous);
      previous = score.ruleProgress;
    }
    assert.deepEqual(transform(sampleElementChoreography({kind, index: 1, elapsed: 3})), identity);
  }
});

test('documented semantic aliases preserve the same movement and unknown kinds fail clearly', () => {
  for (const [alias, kind] of Object.entries({headingLine: 'heading', body: 'prose', method: 'diagram', media: 'photo', image: 'photo', credits: 'credit', navigation: 'nav'})) {
    assert.deepEqual(sampleElementChoreography({kind: alias, elapsed: .4}), sampleElementChoreography({kind, elapsed: .4}));
  }
  for (const kind of ['not-a-content-family', 'toString', '__proto__']) assert.throws(() => sampleElementChoreography({kind}), /Unknown/);
  for (const options of [{elapsed: NaN}, {elapsed: Infinity}, {index: -1}, {index: .5}]) assert.throws(() => sampleElementChoreography(options));
});
