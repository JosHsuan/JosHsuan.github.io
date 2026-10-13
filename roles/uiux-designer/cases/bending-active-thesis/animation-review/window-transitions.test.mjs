import {test} from 'node:test';
import assert from 'node:assert/strict';
import {windowEffects3D,windowEffects2D,viewportRegion,blendPose,sampleWindowTimeline} from './window-transitions.mjs';
test('two complete window recipes per layer, distinct IDs and visible center holds',()=>{
 assert.equal(windowEffects3D.length,2);assert.equal(windowEffects2D.length,2);const all=[...windowEffects3D,...windowEffects2D];assert.equal(new Set(all.map(e=>e.id)).size,4);
 for(const effect of all){assert.deepEqual(sampleWindowTimeline(effect,0),effect.before);assert.deepEqual(sampleWindowTimeline(effect,.5),effect.visible);assert.deepEqual(sampleWindowTimeline(effect,1),effect.after);assert.notDeepEqual(effect.before,effect.visible);assert.notDeepEqual(effect.after,effect.visible);assert(effect.trigger&&effect.end&&effect.source.length>=3);}
});
test('viewport threshold hysteresis prevents boundary flickering and permits reverse re-entry',()=>{
 assert.equal(viewportRegion(.17,'before'),'before');assert.equal(viewportRegion(.19,'before'),'inside');assert.equal(viewportRegion(.17,'inside'),'inside');assert.equal(viewportRegion(.15,'inside'),'before');assert.equal(viewportRegion(.73,'inside'),'inside');assert.equal(viewportRegion(.75,'inside'),'after');assert.equal(viewportRegion(.71,'after'),'inside');
});
test('replacement can interpolate from every current rendered property without initial jump',()=>{
 for(const effect of [...windowEffects3D,...windowEffects2D]){const middle=blendPose(effect.before,effect.visible,.37);assert.deepEqual(blendPose(middle,effect.after,0),middle);for(const n of [0,.2,.8,1])assert(Object.values(blendPose(middle,effect.after,n)).every(Number.isFinite));}
});
