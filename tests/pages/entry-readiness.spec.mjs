import {test,expect} from '@playwright/test';
import {WAIT,frames,scenarioTimeout,settle} from './case-helpers.mjs';

test('entry waits for actual scene paint and releases a deep-linked library only after entry',async({page},testInfo)=>{
 test.setTimeout(scenarioTimeout(180000));
 let release;const assetGate=new Promise(resolve=>{release=resolve;});
 await page.route('**/assets/source-layers.glb',async route=>{await assetGate;await route.continue();});
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 try{
  await page.goto('/#pattern',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__story?.inspect().libraryDiagram.count===1,null,{timeout:WAIT});
  await frames(page,8);
  const preparing=await page.evaluate(()=>window.__story.inspect());
  expect(preparing.entry.phase).toBe('preparing');expect(preparing.entry.progress).toBeLessThan(100);
  expect(preparing.entry.prerequisites.scene).toBe(false);expect(preparing.libraryDiagram.open).toEqual([]);expect(preparing.libraryDiagram.history).toEqual([]);
  await expect(page.locator('[data-project-content]')).toHaveAttribute('inert','');
  await expect(page.locator('[data-entry-loader]')).toBeVisible();
  await page.locator('[data-entry-loader]').screenshot({path:testInfo.outputPath('entry-preparing.png')});
  release();
  await page.waitForFunction(()=>window.__story.inspect().entry.phase==='entered',null,{timeout:WAIT});await settle(page);
  const entered=await page.evaluate(()=>({entry:window.__story.inspect().entry,ready:window.__thesis.inspect().ready,initialization:window.__thesis.inspect().initialization}));
  expect(entered.ready).toBe(true);expect(entered.initialization.phase).toBe('ready');expect(entered.entry.progress).toBe(100);
  expect(entered.entry.history.map(event=>event.phase)).toEqual(['preparing','ready','revealing','entered']);
  await expect(page.locator('[data-project-content]')).not.toHaveAttribute('inert','');
  await expect(page.locator('[data-entry-loader]')).toBeHidden();
  // The fragment selects the reading chapter. Bringing its lower diagram into
  // view now requests its own sequence, with no request consumed by the loader.
  await page.locator('[data-source-diagram="library"]').scrollIntoViewIfNeeded();await settle(page);
  await page.waitForFunction(()=>window.__story.inspect().libraryDiagram.history.some(event=>event.status==='completed'),null,{timeout:WAIT});
  const events=await page.evaluate(()=>window.__story.inspect().libraryDiagram.history);
  expect(events.filter(event=>event.status==='requested')).toHaveLength(1);
  expect(events.filter(event=>event.status==='completed')).toHaveLength(1);
  expect(errors).toEqual([]);
 }finally{release();}
});

test('Reduced entry publishes readable static content without claiming scene readiness',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/#pattern');
 await page.waitForFunction(()=>window.__story?.inspect().entry.phase==='entered',null,{timeout:WAIT});
 const entry=await page.evaluate(()=>window.__story.inspect().entry);
 expect(entry.reason).toBe('static-ready');expect(entry.progress).toBe(100);expect(entry.reveal).toBe(1);
 await expect(page.locator('[data-entry-loader]')).toBeHidden();await expect(page.locator('[data-project-content]')).not.toHaveAttribute('inert','');
 await expect(page.locator('[data-cinematic-stage] canvas')).toHaveCount(0);
 await expect(page.getByRole('button',{name:'Enable 3D',exact:true})).toBeVisible();
 await expect(page.getByRole('combobox',{name:'Visual detail',exact:true})).toHaveCount(0);
 await expect(page.getByRole('button',{name:/^(Pause|Resume) motion$/})).toHaveCount(0);
 await page.locator('[data-source-diagram="library"]').scrollIntoViewIfNeeded();await settle(page);
 await page.waitForFunction(()=>window.__story.inspect().libraryDiagram.items[0]?.status==='completed',null,{timeout:WAIT});
 expect(await page.evaluate(()=>window.__story.inspect().libraryDiagram.items[0].progress)).toEqual(Array(11).fill(1));
});
