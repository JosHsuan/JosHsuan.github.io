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

// Event policy replaces the historical scroll-pose sampler above. These cases
// verify elapsed-time behavior, independently of the geometric reference curve.
const advanceFor=(state,seconds,options,rate=120)=>{
  for(let time=0;time<seconds-1e-9;time+=1/rate)advanceCanvasMotion(state,Math.min(1/rate,seconds-time),options);
  return state;
};

test('exit consumes fixed active time at different scroll speeds and frame rates',()=>{
  const results=[];
  for(const rate of [3,30,60,120]){
    const state=advanceCanvasMotion(createCanvasMotion(),0,input(2000));
    advanceCanvasMotion(state,0,input(2900));
    const id=state.request.id;
    advanceFor(state,1/3,input(3000),rate);
    assert.equal(state.request.id,id,'scroll within the exit band does not restart the event');
    assert.equal(state.mode,'exit');assert(state.opacity>0&&state.opacity<1);
    results.push({...state.pose});
    advanceFor(state,.7,input(3000),rate);
    assert(state.settled);assert.equal(state.opacity,0);
  }
  for(const result of results.slice(1))for(const key of ['x','y','opacity'])near(result[key],results[0][key]);
});

test('fast jumps finish the old exit then enter only the latest chapter',()=>{
  const state=advanceCanvasMotion(createCanvasMotion(),0,input(2000));
  advanceCanvasMotion(state,0,input(8000));
  assert.equal(state.chapter,'form');assert.equal(state.opacity,1);
  assert.equal(state.request.chapter,'pattern');assert.equal(state.mode,'exit');
  advanceFor(state,.4,input(12900));
  assert.equal(state.chapter,'form');assert.equal(state.request.chapter,'credits');
  advanceFor(state,.55,input(12900));
  assert.equal(state.chapter,'credits');assert.equal(state.opacity,0);assert.equal(state.mode,'entry');
  advanceFor(state,.5,input(12900));
  assert(state.opacity>0&&state.opacity<1);
  advanceFor(state,.61,input(12900));
  assert.deepEqual(visual(state),{x:0,y:0,scale:1,opacity:1,mode:'hold'});
  assert(state.settled);assert(state.request.completed);
});

test('stopping just inside a new chapter completes entry without another scroll event',()=>{
  const state=advanceCanvasMotion(createCanvasMotion(),0,input(2000));
  advanceCanvasMotion(state,0,input(3100));
  advanceFor(state,2.1,input(3100));
  assert.equal(state.chapter,'system');assert.equal(state.mode,'hold');assert.equal(state.opacity,1);
  const id=state.request.id;
  advanceFor(state,2,input(3100));assert.equal(state.request.id,id);assert(state.settled);
});

test('reversal preserves the displayed pose, cancels old intent, and completes a return',()=>{
  const state=advanceCanvasMotion(createCanvasMotion(),0,input(2000));
  advanceCanvasMotion(state,0,input(2900));
  advanceFor(state,.35,input(2900));const pose={...state.pose},old=state.request.id;
  advanceCanvasMotion(state,0,input(2500));
  assert.deepEqual(state.pose,pose);assert.equal(state.mode,'entry');
  assert.deepEqual(state.events.map(e=>[e.id,e.status]),[[old,'cancelled'],[old+1,'requested']]);
  advanceFor(state,1.11,input(2500));assert.equal(state.opacity,1);assert(state.settled);
});

test('resume and renderer wait freeze active time; large frame gaps never finish a passage',()=>{
  const state=advanceCanvasMotion(createCanvasMotion(),0,input(2000));
  advanceCanvasMotion(state,.2,input(2900));const pose={...state.pose},elapsed=state.transition.elapsed;
  for(const options of [{resumed:true},{paused:true},{}]){
    advanceCanvasMotion(state,4,input(2900,options));assert.deepEqual(state.pose,pose);assert.equal(state.transition.elapsed,elapsed);
  }
  advanceFor(state,.8,input(2900));assert(state.settled);assert.equal(state.opacity,0);
});

test('seek, Reduced and explicit inspection show a useful still with exactly one terminal event',()=>{
  for(const patch of [{seek:true},{reducedMotion:true},{forcedChapter:'system'}]){
    const state=advanceCanvasMotion(createCanvasMotion(),0,input(2000));
    advanceCanvasMotion(state,.1,input(2900));const old=state.request.id;
    advanceCanvasMotion(state,0,input(3100,patch));
    assert.equal(state.chapter,'system');assert.equal(state.opacity,1);assert(state.settled);
    assert.deepEqual(state.events.map(e=>[e.id,e.status]),[[old,'cancelled'],[old+1,'requested'],[old+1,'completed']]);
    advanceCanvasMotion(state,.1,input(3100,patch));assert.deepEqual(state.events,[]);
  }
});

test('MAKE and VALIDATION become absent only after an ordinary timed departure',()=>{
  for(const chapter of ['make','validation']){
    const y=anchors[CANVAS_CHAPTERS.indexOf(chapter)];
    const state=advanceCanvasMotion(createCanvasMotion(),0,input(8000));
    advanceCanvasMotion(state,0,input(y));assert.equal(state.chapter,'pattern');assert.equal(state.opacity,1);
    advanceFor(state,.96,input(y));
    assert.equal(state.chapter,chapter);assert(state.settled);assert(!state.visible);assert.equal(state.mode,'absent');
    const reduced=advanceCanvasMotion(createCanvasMotion(),0,input(y,{reducedMotion:true}));
    assert.equal(reduced.mode,'absent');assert(!reduced.visible);
  }
});

test('a same-position static preference replaces away with a matching hold event',()=>{
  for(const patch of [{reducedMotion:true},{seek:true},{forcedChapter:'form'}]){
    const state=advanceCanvasMotion(createCanvasMotion(),0,input(2000));
    advanceCanvasMotion(state,.2,input(2900));const id=state.request.id;
    assert.equal(state.request.target,'away');
    advanceCanvasMotion(state,0,input(2900,patch));
    assert.equal(state.request.target,'hold');assert.equal(state.opacity,1);
    assert.deepEqual(state.events.map(e=>[e.id,e.status]),[[id,'cancelled'],[id+1,'requested'],[id+1,'completed']]);
  }
});

test('remaining frame time crosses the exit/entry boundary at low and high frame rates',()=>{
  for(const rate of [3,30,60,120]){
    const state=advanceCanvasMotion(createCanvasMotion(),0,input(1500));
    advanceCanvasMotion(state,0,input(4000));advanceFor(state,2.05,input(4000),rate);
    assert.equal(state.chapter,'system');assert.equal(state.mode,'hold');assert(state.settled);
  }
});

test('small trackpad reversals use accumulated travel from the turning point',()=>{
  const state=advanceCanvasMotion(createCanvasMotion(),0,input(1500));
  advanceCanvasMotion(state,.1,input(2900));const id=state.request.id;
  advanceCanvasMotion(state,.1,input(2950));advanceCanvasMotion(state,.1,input(2949));
  assert.equal(state.request.id,id);assert.equal(state.request.target,'away');
  advanceCanvasMotion(state,0,input(2937));assert.equal(state.request.target,'hold');
});

test('invalid chapter ranges, viewport, time or explicit scene request are rejected', () => {
  assert.throws(() => sampleCanvasHold(input(0, {anchors: [0, 1]})), /eight/);
  assert.throws(() => sampleCanvasHold(input(0, {anchors: [0, 1, 1, 3, 4, 5, 6, 7]})), /increasing/);
  assert.throws(() => sampleCanvasHold(input(NaN)), /position/);
  assert.throws(() => sampleCanvasHold(input(0, {viewport: {width: 0, height: 844}})), /viewport/);
  assert.throws(() => sampleCanvasHold(input(0, {forcedChapter: 'invented'})), /known/);
  assert.throws(() => advanceCanvasMotion(createCanvasMotion(), -1, input(0)), /delta/);
});
