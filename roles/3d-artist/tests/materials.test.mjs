import test from 'node:test';
import assert from 'node:assert/strict';
import {createInspectionMaterial,normalizedMaterialProgress} from '../src/materials/inspection-material.js';
import {sample} from '../src/review/model.js';
test('material adapter reverses input without touching geometry or advancing material version',()=>{
 const m=createInspectionMaterial({mode:'contours',bounds:{min:[-3,0,-1],max:[3,4,1]},metalness:1,roughness:.4});
 const version=m.material.version;let disposed=false;m.material.addEventListener('dispose',()=>disposed=true);
 m.update({progress:.2,mode:'contours'});const before=m.inspect();m.update({progress:.8,mode:'focus'});m.update({progress:.2,mode:'contours'});
 assert.deepEqual(m.inspect(),before);assert.equal(m.material.version,version);assert.equal(m.material.metalness,1);assert.equal(m.material.roughness,.4);
 m.dispose();assert(disposed);
});
test('material adapter rejects invalid bounds and modes while clamping progress',()=>{
 assert.throws(()=>createInspectionMaterial({bounds:{min:[0,0,0],max:[-1,1,1]}}));
 assert.throws(()=>createInspectionMaterial({mode:'stress'}));const m=createInspectionMaterial();assert.throws(()=>m.update({mode:'stress'}));
 for(const [raw,expected]of [[-1,0],[4,1],[NaN,.5],[Infinity,.5],[.625,.625]])assert.equal(normalizedMaterialProgress(raw),expected);m.dispose();
});
test('material A/B studies preserve camera, geometry and shared input/light',()=>{
 for(const id of ['bamboo-grain','bamboo-pbr','surface-contours','surface-focus'])for(const u of [0,.2,.7,1]){
  const a=sample(id,u,'a'),b=sample(id,u,'b');assert.deepEqual(a.position,b.position);assert.deepEqual(a.target,b.target);assert.equal(a.fov,b.fov);assert.deepEqual(a.light,b.light);assert.equal(a.materialProgress,u);assert.equal(b.materialProgress,u);assert.equal(a.owner,'analytic');assert.equal(b.owner,'analytic');assert.equal(a.assembly,b.assembly);
 }
});
