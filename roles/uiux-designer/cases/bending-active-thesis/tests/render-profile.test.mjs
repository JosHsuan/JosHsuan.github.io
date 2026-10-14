import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveRenderProfile} from '../components/render-profile.mjs';
import {resolveRenderBudget} from '../components/render-budget.mjs';

test('touch and all iOS presentations retain Full materials without MSAA attachments',()=>{
  for(const input of [{coarsePointer:true},{userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)'},{platform:'MacIntel',maxTouchPoints:5}]){
    const profile=resolveRenderProfile(input);
    assert.equal(profile.id,'conservative-touch');assert.equal(profile.maxSamples,0);assert.equal(profile.shadowMapSize,512);
    assert.equal(profile.pixelBudget,520_000);assert.equal('pixelBudgets' in profile,false);
  }
  assert.equal(resolveRenderProfile({platform:'MacIntel',maxTouchPoints:0}).maxSamples,2);
});

test('sustained phone high-DPR and orientation cycles stay under the touch cap before pressure relief',()=>{
  const profile=resolveRenderProfile({coarsePointer:true});
  for(let cycle=0;cycle<60;cycle++)for(const [width,height] of [[430,932],[430,852],[932,430],[1024,1366]]){
    const result=resolveRenderBudget({width,height,deviceDpr:3,pixelBudget:profile.pixelBudget,densityScale:cycle%3?1:.5});
    assert.ok(result.pixels<=profile.pixelBudget);assert.equal(profile.maxSamples,0);
    assert.equal(result.requestedDpr,1.25);
  }
  // The old 390x844 portrait keeps its exact Full initial raster density.
  assert.equal(resolveRenderBudget({width:390,height:844,deviceDpr:3,pixelBudget:profile.pixelBudget}).dpr,1.25);
});

test('callers may reduce allocation policy but cannot bypass the product cap',()=>{
  for(const pixelBudget of [0,-1,Infinity,NaN,1_600_001])assert.throws(()=>resolveRenderBudget({width:430,height:932,pixelBudget}),RangeError);
  assert.equal(resolveRenderProfile({}).pixelBudget,1_600_000);
  assert.equal(resolveRenderBudget({width:430,height:932,pixelBudget:520_000}).pixelBudget,520_000);
});
