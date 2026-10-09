import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveRenderBudget, RENDER_PIXEL_BUDGET} from '../components/render-budget.mjs';

test('physical render area and hardware dimensions remain bounded across displays and quality changes', () => {
  for (const [width, height] of [[390,844],[1440,1000],[2560,1440],[3840,2160],[7680,4320],[20000,200]]) {
    for (const detail of ['full', 'light']) for (const deviceDpr of [1,1.25,2,3]) {
      const result=resolveRenderBudget({width,height,deviceDpr,detail,maxTextureSize:4096});
      assert.ok(result.pixels<=RENDER_PIXEL_BUDGET[detail],`${width}x${height} ${detail} exceeds pixel cap`);
      assert.ok(result.width<=4096 && result.height<=4096);
      assert.ok(result.width>0 && result.height>0 && result.dpr>0);
      assert.ok(result.dpr<=deviceDpr);
      assert.equal(result.width,Math.floor(width*result.dpr));
      assert.equal(result.height,Math.floor(height*result.dpr));
    }
  }
});

test('a source-sized phone keeps the existing Full density; large displays do not allocate by screen area', () => {
  assert.equal(resolveRenderBudget({width:390,height:844,deviceDpr:3}).dpr,1.25);
  const large=resolveRenderBudget({width:3840,height:2160,deviceDpr:2});
  assert.equal(large.bounded,true);
  assert.ok(large.pixels<1_600_001);
  const pixelsBefore=3840*2160*1.25**2;
  assert.ok(large.pixels/pixelsBefore<.124);
});

test('invalid inputs cannot propagate an unbounded renderer allocation', () => {
  for (const patch of [{width:0},{height:-1},{deviceDpr:Infinity},{maxTextureSize:NaN},{detail:'unknown'},{densityScale:0},{densityScale:1.1}]) {
    assert.throws(()=>resolveRenderBudget({width:1440,height:1000,...patch}),RangeError);
  }
});

test('pressure scales the already bounded density without shrinking the authored optical footprint', () => {
  for (const [width,height] of [[390,844],[3840,2160]]) {
    const base=resolveRenderBudget({width,height,deviceDpr:3});
    const relieved=resolveRenderBudget({width,height,deviceDpr:3,densityScale:.5});
    assert.equal(relieved.dpr,base.dpr*.5);
    assert.equal(relieved.requestedDpr,base.requestedDpr);
    assert.ok(relieved.pixels<=base.pixels*.251);
  }
});
