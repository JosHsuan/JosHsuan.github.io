import {test,expect} from '@playwright/test';
import {loadScene,scenarioTimeout,WAIT} from './case-helpers.mjs';

const library=page=>page.locator('[data-source-diagram="library"]');
const sample=page=>page.evaluate(()=>{
 const element=document.querySelector('[data-source-diagram="library"]');
 const paths=[...element.querySelectorAll('[data-library-trace]')].sort((a,b)=>Number(a.dataset.libraryTrace)-Number(b.dataset.libraryTrace));
 return {reveal:window.__story.inspect().libraryDiagram,paths:paths.map(path=>({id:path.dataset.sourcePath,offset:Number.parseFloat(getComputedStyle(path).strokeDashoffset),dash:getComputedStyle(path).strokeDasharray,visibility:getComputedStyle(path).visibility})),scroll:scrollY};
});
const show=page=>library(page).locator('[data-library-drawing]').evaluate(element=>{
 let top=0;for(let node=element;node;node=node.offsetParent)top+=node.offsetTop;
 scrollTo({top:top-innerHeight*.35,behavior:'instant'});
});

test('the original library grows bottom-up in 60–160 mm order and stops after its complete source drawing',async({page})=>{
 test.setTimeout(scenarioTimeout(120000));await page.clock.install();await loadScene(page);await expect(library(page).locator('[data-library-trace]')).toHaveCount(11,{timeout:WAIT});
 await expect(library(page).locator('button')).toHaveCount(0);await expect(library(page).locator('svg path')).toHaveCount(452);await expect(library(page).locator('svg text')).toHaveCount(27);
 await page.clock.pauseAt(new Date(Date.now()+3600000));
 try{
  await show(page);await page.clock.runFor(16);
  const start=await sample(page);expect(start.reveal.items[0].status).toBe('playing');expect(start.reveal.history.at(-1).status).toBe('requested');
  expect(start.paths.map(path=>path.id)).toEqual(Array.from({length:11},(_,index)=>`p${937-index}`));
  await page.clock.runFor(144);const first=await sample(page);
  expect(first.paths[0].offset).toBeGreaterThan(.25);expect(first.paths[0].offset).toBeLessThan(.75);expect(first.paths.slice(1).every(path=>path.visibility==='hidden')).toBe(true);
  await page.clock.runFor(320);const second=await sample(page);
  expect(second.paths[0].dash).toBe('none');expect(second.paths[1].offset).toBeGreaterThan(0);expect(second.paths[1].offset).toBeLessThan(1);expect(second.paths.slice(2).every(path=>path.visibility==='hidden')).toBe(true);
  // One slow foreground frame must still consume elapsed time and close the request.
  await page.clock.fastForward(4000);const complete=await sample(page);
  expect(complete.reveal.items[0].status).toBe('completed');expect(complete.reveal.open).toEqual([]);expect(complete.paths.every(path=>path.dash==='none'&&path.visibility==='visible')).toBe(true);
  expect(complete.reveal.history.map(event=>event.status)).toEqual(['requested','completed']);
  await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.clock.runFor(16);await show(page);await page.clock.runFor(16);
  expect((await sample(page)).reveal.history).toEqual(complete.reveal.history);
 }finally{await page.clock.resume();}
});

test('library departure closes its request, re-entry starts a fresh sequence and Reduced restores every source trace',async({page})=>{
 test.setTimeout(scenarioTimeout(120000));await page.clock.install();await loadScene(page);await expect(library(page).locator('[data-library-trace]')).toHaveCount(11,{timeout:WAIT});
 await page.clock.pauseAt(new Date(Date.now()+3600000));
 try{
  await show(page);await page.clock.runFor(160);const first=await sample(page);expect(first.reveal.items[0].status).toBe('playing');
  await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.clock.runFor(16);const cancelled=await sample(page);
  expect(cancelled.reveal.history.at(-1)).toMatchObject({id:first.reveal.items[0].id,status:'cancelled',reason:'offscreen'});expect(cancelled.paths.every(path=>path.dash==='none'&&path.visibility==='visible')).toBe(true);
  await show(page);await page.clock.runFor(160);const again=await sample(page);expect(again.reveal.items[0].id).toBeGreaterThan(first.reveal.items[0].id);expect(again.reveal.items[0].status).toBe('playing');
  await page.emulateMedia({reducedMotion:'reduce'});
  // Media-query delivery and React publication can follow the emulation reply.
  // Wait for the actual director acknowledgment while advancing its clock.
  await expect.poll(async()=>{await page.clock.runFor(16);return page.evaluate(()=>window.__story.inspect().playback.reducedMotion);},{timeout:WAIT}).toBe(true);
  const reduced=await sample(page);
  expect(reduced.reveal.history.at(-1)).toMatchObject({id:again.reveal.items[0].id,status:'completed',reason:'reduced'});expect(reduced.paths.every(path=>path.dash==='none'&&path.visibility==='visible')).toBe(true);expect(reduced.reveal.open).toEqual([]);
  expect(reduced.reveal.history.map(event=>event.status)).toEqual(['requested','cancelled','requested','completed']);
 }finally{await page.clock.resume();}
});
