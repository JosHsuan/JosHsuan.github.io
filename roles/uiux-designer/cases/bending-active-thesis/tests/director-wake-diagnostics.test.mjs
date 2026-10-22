import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createDirectorWakeDiagnostics} from '../runtime/orchestration/ExperienceDirector.mjs';

test('wake provenance is disabled by default and ignores continuous frame scheduling',()=>{
 let reads=0;const d=createDirectorWakeDiagnostics(()=>{reads++;return{controllerFrame:103,at:1234};});
 d.record('event:scroll');assert.equal(reads,0);assert.deepEqual(d.inspect(),{enabled:false,events:[]});
 d.setEnabled(true);d.record('continuation');assert.equal(reads,0);d.record('event:pointermove');assert.equal(reads,1);assert.deepEqual(d.inspect().events,[{reason:'event:pointermove',controllerFrame:103,at:1234}]);
 d.setEnabled(false);d.record('event:scroll');assert.equal(reads,1);assert.deepEqual(d.inspect(),{enabled:false,events:[]});
});
test('wake provenance retains only32 independent receipts and restarts cleanly',()=>{
 let frame=0;const d=createDirectorWakeDiagnostics(()=>({controllerFrame:frame++,layout:{reasons:['element-size'],measures:1}}));d.setEnabled(true);
 for(let i=0;i<40;i++)d.record('layout');
 const first=d.inspect();assert.equal(first.events.length,32);assert.equal(first.events[0].controllerFrame,8);assert.equal(first.events.at(-1).controllerFrame,39);
 first.events[0].layout.reasons.push('not-real');assert.deepEqual(d.inspect().events[0].layout.reasons,['element-size']);
 d.setEnabled(true);assert.deepEqual(d.inspect(),{enabled:true,events:[]});
});
test('diagnostic wiring observes existing owners without adding a timer or replacing the strict idle window',async()=>{
 const source=await readFile(new URL('../runtime/orchestration/ExperienceDirector.mjs',import.meta.url),'utf8');
 assert.match(source,/new LayoutScheduler\(\(\)=>schedule\('layout'\)\)/);assert.match(source,/wakeOrigin='event:'\+type/);assert.match(source,/finally\{wakeOrigin=prior;\}/);
 assert.match(source,/schedule\('input:inspectionRevision'\)/);assert.match(source,/schedule\('input:reduced'\)/);assert.match(source,/schedule\('input:preferences'\)/);
 const helper=await readFile(new URL('../../../../../tests/pages/case-helpers.mjs',import.meta.url),'utf8');
 assert.match(helper,/for\(let i=1;i<=8;i\+\+\)/);assert.match(helper,/expect\(after\)\.toEqual\(before\)/);assert.match(helper,/finally\{try\{await page.evaluate\(\(\)=>window.__story\?\.setWakeDiagnostics\(false\)\)/);
});
