import test from 'node:test';
import assert from 'node:assert/strict';
import {preparePhysics} from '../src/review/physics-cache.js';
test('cached real Rapier worlds are finite, reversible and distinct at matched contact time',async()=>{const cache=await preparePhysics();assert.equal(cache,await preparePhysics());assert.equal(cache.a.length,241);assert.equal(cache.b.length,241);assert.deepEqual(cache.a[0],cache.b[0]);for(const frame of [...cache.a,...cache.b])for(const position of frame){assert(position.every(Number.isFinite));assert(position[1]>-1.3);}assert.notDeepEqual(cache.a[60],cache.b[60]);const original=JSON.stringify(cache.b[40]);void cache.b[230];assert.equal(JSON.stringify(cache.b[40]),original);});
