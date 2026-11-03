import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import test from 'node:test';
const release=new URL('../../roles/uiux-designer/cases/bending-active-thesis/release/',import.meta.url);
const baseline=JSON.parse(await readFile(new URL('./fixtures/original-portfolio-assets-1ca10e7.json',import.meta.url),'utf8'));
const current=JSON.parse(await readFile(new URL('manifest.json',release),'utf8'));
const hash=value=>createHash('sha256').update(value).digest('hex');
// Extracted from the independently published commit, never from candidate output.
// New reviewed sources are additive; changing rendering cannot alter these assets.
const assertOriginalPins=manifest=>{
 const pins=new Map(manifest.assets.map(asset=>[asset.path,asset]));
 assert.equal(pins.size,manifest.assets.length,'No duplicate release paths');
 for(const original of baseline.assets){
  const actual=pins.get(original.path);assert.ok(actual,'Retain original '+original.path);
  assert.deepEqual({path:actual.path,bytes:actual.bytes,sha256:actual.sha256},original,original.path);
 }
};
test('all 137 published source assets remain byte exact beneath the revised presentation',async()=>{
 assert.equal(baseline.publishedCommit,'1ca10e7aeb823d6fa21cf1378cf9270ffcf8990b');
 assert.equal(baseline.manifestSHA256,'6bc10dfa18a7aafc828d9b39f1b046faddb7c8b514e9260a7d9adca0d46179e1');
 assert.equal(baseline.assets.length,137);
 assert.equal(hash(JSON.stringify(baseline.assets)),'70a9d2ffd4a170cd82371200d104b02ef5e5722b7186fcdbe0da80882221ab73');
 assertOriginalPins(current);
 for(const pin of baseline.assets){
  const bytes=await readFile(new URL('public/'+pin.path,release));
  assert.equal(bytes.length,pin.bytes,pin.path);assert.equal(hash(bytes),pin.sha256,pin.path);
 }
});
test('the preservation gate rejects deletion, repinning, duplicate paths and changed byte counts',()=>{
 for(const mutate of [
  x=>x.assets.shift(),x=>x.assets[0].bytes++,x=>x.assets[0].sha256='0'.repeat(64),
  x=>x.assets.push(structuredClone(x.assets[0])),x=>x.assets[0].path='assets/substitute.webp',
 ]){const bad=structuredClone(current);mutate(bad);assert.throws(()=>assertOriginalPins(bad));}
});
