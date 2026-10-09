import test from 'node:test';
import assert from 'node:assert/strict';
import {createRendererBudget} from '../components/renderer-budget.mjs';
import {RENDER_PIXEL_BUDGET} from '../components/render-budget.mjs';

function fakeRenderer(getPolicy) {
  let width = 390, height = 844, ratio = 1, canvasWidth = width, canvasHeight = height;
  const allocations = [], viewport = [], calls = [];
  const record = axis => allocations.push({axis, width: canvasWidth, height: canvasHeight,
    pixels: canvasWidth * canvasHeight, limit: getPolicy().pixelBudget ?? RENDER_PIXEL_BUDGET[getPolicy().detail]});
  const canvas = {style: {}, get width() {return canvasWidth;}, set width(value) {canvasWidth = value; record('width');},
    get height() {return canvasHeight;}, set height(value) {canvasHeight = value; record('height');}};
  const renderer = {domElement: canvas, capabilities: {maxTextureSize: 4096}, xr: {isPresenting: false},
    getSize(target) {return target.set(width, height);}, getPixelRatio() {return ratio;},
    setViewport(...value) {viewport.splice(0, viewport.length, ...value);},
    setSize(w, h, updateStyle = true) {calls.push('setSize'); width = w; height = h; canvas.width = Math.floor(w * ratio); canvas.height = Math.floor(h * ratio); if (updateStyle) {canvas.style.width = w + 'px'; canvas.style.height = h + 'px';} this.setViewport(0, 0, w, h);},
    setPixelRatio(value) {calls.push('setPixelRatio'); ratio = value; this.setSize(width, height, false);},
    setDrawingBufferSize(w, h, dpr) {calls.push('setDrawingBufferSize'); width = w; height = h; ratio = dpr; canvas.width = Math.floor(w * dpr); canvas.height = Math.floor(h * dpr); this.setViewport(0, 0, w, h);},
  };
  return {renderer, allocations, calls, viewport};
}

function assertEveryAllocation(allocations) {
  assert(allocations.length > 0);
  for (const value of allocations) {
    assert(value.pixels <= value.limit, `Intermediate ${value.axis} allocation ${value.width}x${value.height} exceeds ${value.limit}`);
    assert(value.width <= 4096 && value.height <= 4096);
  }
}

test('stale Fiber DPR never allocates an oversized buffer in either resize direction', () => {
  const policy = {detail: 'full', deviceDpr: 3}, fake = fakeRenderer(() => policy), guard = createRendererBudget(fake.renderer, () => policy);
  for (const [width, height] of [[390,844],[3840,2160],[390,844],[1440,2560],[3840,2160],[900,3000],[3000,900],[20000,200],[200,20000],[1440,1000]]) {
    // This is Fiber's real ordering: stale DPR first, new viewport second.
    fake.renderer.setPixelRatio(1.25); fake.renderer.setSize(width, height);
    const budget = guard.inspect().budget;
    assert.equal(fake.renderer.domElement.width, budget.width); assert.equal(fake.renderer.domElement.height, budget.height);
    assert.deepEqual(fake.viewport, [0,0,width,height]);
    assert.equal(fake.renderer.domElement.style.width, width + 'px');
  }
  assertEveryAllocation(fake.allocations);
  assert(guard.inspect().intermediateShrinks > 0, 'The portrait-to-landscape intermediate needs a shrink');
  assert(fake.calls.every(name => name === 'setDrawingBufferSize'), 'Never call native recursive setPixelRatio/setSize');
});

test('a quality change also bounds intermediate allocations and direct drawing-buffer calls', () => {
  const policy = {detail: 'full', deviceDpr: 2}, fake = fakeRenderer(() => policy), guard = createRendererBudget(fake.renderer, () => policy);
  guard.sync(1440,2560);
  policy.detail = 'light'; fake.renderer.setPixelRatio(3); fake.renderer.setSize(3840,2160,false);
  fake.renderer.setDrawingBufferSize(2160,3840,8);
  policy.detail = 'full'; fake.renderer.setSize(3840,2160);
  assertEveryAllocation(fake.allocations);
  assert.equal(guard.inspect().budget.detail, 'full');
});

test('unchanged sync makes no canvas writes and preserves caller CSS/viewport semantics', () => {
  const policy = {detail: 'full', deviceDpr: 1}, fake = fakeRenderer(() => policy), guard = createRendererBudget(fake.renderer, () => policy);
  fake.renderer.setSize(1440,1000); const count = fake.allocations.length;
  for (let frame = 0; frame < 120; frame++) guard.sync(1440,1000);
  assert.equal(fake.allocations.length, count);
  fake.renderer.setSize(3840,2160,false);
  assert.equal(fake.renderer.domElement.style.width, '1440px'); assert.equal(fake.renderer.domElement.style.height, '1000px');
  assert.deepEqual(fake.viewport,[0,0,3840,2160]);
  const before = fake.allocations.length; fake.renderer.setPixelRatio(undefined); assert.equal(fake.allocations.length,before);
});

test('density pressure applies before stale ratio callbacks and invalid sizes allocate nothing', () => {
  const policy = {detail: 'full', deviceDpr: 2, densityScale: 1}, fake = fakeRenderer(() => policy), guard = createRendererBudget(fake.renderer, () => policy);
  const full = guard.sync(3840,2160);
  policy.densityScale = .5; fake.renderer.setPixelRatio(1.25);
  assert.equal(guard.inspect().budget.dpr, full.dpr * .5);
  fake.renderer.setSize(1440,2560);
  policy.densityScale = 1; fake.renderer.setSize(3840,2160);
  assertEveryAllocation(fake.allocations);
  const before = fake.allocations.length;
  for (const [width,height] of [[NaN,100],[100,Infinity],[-1,100]]) assert.throws(() => guard.sync(width,height), RangeError);
  assert.equal(fake.allocations.length,before);
});

test('guard disposal restores only its own methods and rejects further sync', () => {
  const fake = fakeRenderer(() => ({detail: 'full', deviceDpr: 1})), original = fake.renderer.setSize;
  const guard = createRendererBudget(fake.renderer, () => ({detail: 'full', deviceDpr: 1}));
  const replacement = () => {}; fake.renderer.setPixelRatio = replacement;
  guard.dispose(); guard.dispose(); assert.equal(fake.renderer.setSize,original); assert.equal(fake.renderer.setPixelRatio,replacement);
  assert.throws(() => guard.sync(1440,1000), /disposed/);
});

test('touch cap also guards every native width/height assignment across repeated orientation and quality changes',()=>{
  const policy={detail:'full',deviceDpr:3,pixelBudget:520000},fake=fakeRenderer(()=>policy),guard=createRendererBudget(fake.renderer,()=>policy);
  for(let cycle=0;cycle<60;cycle++)for(const [width,height] of [[430,932],[932,430],[430,852]]){
    policy.detail=cycle%2?'full':'light';policy.pixelBudget=policy.detail==='full'?520000:360000;
    fake.renderer.setPixelRatio(3);fake.renderer.setSize(width,height,false);
    const writes=fake.allocations.length;for(let frame=0;frame<60;frame++)guard.sync(width,height);
    assert.equal(fake.allocations.length,writes,'Held chapter frames cannot allocate another backing store');
  }
  assertEveryAllocation(fake.allocations);assert.ok(guard.inspect().intermediateShrinks>0);
});
