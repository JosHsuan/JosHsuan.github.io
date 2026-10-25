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

test('resize diagnostics do not read entries or retain baselines while disabled',()=>{
 let reads=0;const d=createDirectorWakeDiagnostics(()=>{reads++;return{};});
 d.recordResize(new Proxy([],{get(){throw Error('Disabled diagnostic inspected entries');}}));
 assert.equal(reads,0);assert.deepEqual(d.inspect(),{enabled:false,events:[]});
});
const resizeTarget=(id='system')=>({tagName:'SECTION',getAttribute:key=>key==='id'?id:key==='data-story-chapter'?id:null,hasAttribute:()=>false,
 getBoundingClientRect(){throw Error('Must not query layout');}});
const resizeEntry=(target,width,height)=>({target,contentRect:{x:0,y:0,width,height}});
test('resize diagnostics use observer rectangles and never invent an initial baseline',()=>{
 const d=createDirectorWakeDiagnostics(()=>({controllerFrame:105})),target=resizeTarget();d.setEnabled(true);
 d.recordResize([resizeEntry(target,400,300)]);
 let row=d.inspect().events[0].resize.targets[0];assert.equal(row.prior,null);assert.equal(row.baseline,'unknown-before-first-enabled-observation');
 assert.deepEqual(row.current,{x:0,y:0,width:400,height:300});assert.deepEqual(row.target,{tag:'SECTION',id:'system',chapter:'system',chapterId:null,information:null,glass:null,stage:false});
 d.recordResize([resizeEntry(target,400,320)]);row=d.inspect().events.at(-1).resize.targets[0];
 assert.deepEqual(row.prior,{x:0,y:0,width:400,height:300});assert.equal(row.current.height,320);
 assert.equal(row.baseline,'previous-observed-in-enabled-epoch');
 row.current.height=-1;row.prior.height=-2;assert.equal(d.inspect().events.at(-1).resize.targets[0].current.height,320);
 d.recordResize([resizeEntry(target,400,320)]);assert.equal(d.inspect().events.at(-1).resize.targets[0].prior.height,320);
});
test('ring reset retains only already-enabled observer history and disable ends baseline epoch',()=>{
 const d=createDirectorWakeDiagnostics(()=>({})),target=resizeTarget();d.setEnabled(true);d.recordResize([resizeEntry(target,1,2)]);
 d.setEnabled(true);assert.deepEqual(d.inspect().events,[]);d.recordResize([resizeEntry(target,1,3)]);
 assert.equal(d.inspect().events[0].resize.targets[0].prior.height,2);
 d.setEnabled(false);d.recordResize([resizeEntry(target,99,99)]);d.setEnabled(true);d.recordResize([resizeEntry(target,1,4)]);
 assert.equal(d.inspect().events[0].resize.targets[0].prior,null);
});
test('resize receipt is bounded and does not retain target nodes or unobserved entries',()=>{
 const d=createDirectorWakeDiagnostics(()=>({}));d.setEnabled(true);const entries=Array.from({length:10},(_,i)=>resizeEntry(resizeTarget('x'.repeat(150)+i),100,i));
 for(let i=0;i<40;i++)d.recordResize(entries);
 const snapshot=d.inspect();assert.equal(snapshot.events.length,32);const receipt=snapshot.events[0].resize;
 assert.equal(receipt.total,10);assert.equal(receipt.truncated,true);assert.equal(receipt.targets.length,8);assert.equal(receipt.targets[0].target.id.length,120);
 assert.equal(JSON.stringify(snapshot).includes('getBoundingClientRect'),false);
 d.recordResize([entries[9]]);assert.equal(d.inspect().events.at(-1).resize.targets[0].prior,null);
});
test('resize callback retains unconditional existing invalidation and no diagnostic layout reads',async()=>{
 const source=await readFile(new URL('../runtime/orchestration/ExperienceDirector.mjs',import.meta.url),'utf8');
 assert.match(source,/new ResizeObserver\(entries=>\{wakeDiagnostics.recordResize\(entries\);layout.invalidate\('element-size'\);\}\)/);
 const helper=source.slice(source.indexOf('/** Opt-in evidence only'),source.indexOf('/** Owns chapter time'));
 assert.doesNotMatch(helper,/getBoundingClientRect|offsetWidth|clientWidth|requestAnimationFrame|setTimeout|new ResizeObserver/);
});

 test('resize target identity is weak-keyed and stable only within its enabled epoch',()=>{
 const d=createDirectorWakeDiagnostics(()=>({})),a=resizeTarget(''),b=resizeTarget('');
 a.closest=selector=>{assert.equal(selector,'[data-story-chapter]');return{getAttribute:key=>key==='id'?'system':null};};
 d.setEnabled(true);d.recordResize([resizeEntry(a,10,20),resizeEntry(b,10,20)]);
 let rows=d.inspect().events[0].resize.targets;assert.equal(rows[0].targetId,1);assert.equal(rows[1].targetId,2);assert.equal(rows[0].target.chapterId,'system');
 d.setEnabled(true);d.recordResize([resizeEntry(b,10,21),resizeEntry(a,10,22)]);
 rows=d.inspect().events[0].resize.targets;assert.equal(rows[0].targetId,2);assert.equal(rows[1].targetId,1);assert.equal(rows[0].prior.height,20);
 d.setEnabled(false);d.setEnabled(true);d.recordResize([resizeEntry(b,10,23)]);
 rows=d.inspect().events[0].resize.targets;assert.equal(rows[0].targetId,1);assert.equal(rows[0].prior,null);
 });
