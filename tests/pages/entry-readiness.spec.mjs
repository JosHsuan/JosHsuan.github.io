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
  const loader=page.locator('[data-entry-loader]');
  await expect(loader).toBeVisible();
  await expect(loader.getByRole('status')).toHaveText('Preparing the study');
  await expect(loader.locator('[data-ready="false"][aria-hidden="true"]')).toBeVisible();
  await expect(loader.locator('[aria-valuenow]')).toHaveCount(0);
  await expect(loader).not.toContainText(/\d+\s*%/);
  await loader.screenshot({path:testInfo.outputPath('entry-preparing.png')});
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

test('Reduced entry preserves reading when its deep-linked library hydrates after entry',async({page})=>{
 let release;const libraryGate=new Promise(resolve=>{release=resolve;});
 await page.route('**/assets/diagrams/library.json',async route=>{await libraryGate;await route.continue();});
 try{
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/#pattern',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__story?.inspect().entry.phase==='entered',null,{timeout:WAIT});
  const entry=await page.evaluate(()=>window.__story.inspect().entry);
  expect(entry.reason).toBe('static-ready');expect(entry.progress).toBe(100);expect(entry.reveal).toBe(1);
  await expect(page.locator('[data-entry-loader]')).toBeHidden();await expect(page.locator('[data-project-content]')).not.toHaveAttribute('inert','');
  await expect(page.locator('[data-cinematic-stage] canvas')).toHaveCount(0);
  await expect(page.getByRole('button',{name:'Enable 3D',exact:true})).toBeVisible();
  await expect(page.getByRole('combobox',{name:'Visual detail',exact:true})).toHaveCount(0);
  await expect(page.getByRole('button',{name:/^(Pause|Resume) motion$/})).toHaveCount(0);
  const drawing=page.locator('[data-source-diagram="library"] [data-library-drawing]');
  await expect(drawing.locator('svg')).toHaveCount(0);
  expect(await page.evaluate(()=>window.__story.inspect().libraryDiagram.count)).toBe(0);
  // The fallback already reserves the drawing's space. Read it before its JSON
  // arrives, without a pointer/key event that would cancel the startup fragment.
  await drawing.scrollIntoViewIfNeeded();await settle(page);
  const before=await drawing.evaluate(element=>({y:scrollY,top:element.getBoundingClientRect().top,bottom:element.getBoundingClientRect().bottom,height:innerHeight}));
  expect(before.top).toBeLessThan(before.height*.85);expect(before.bottom).toBeGreaterThan(before.height*.1);
  release();
  await page.waitForFunction(()=>window.__story.inspect().libraryDiagram.count===1,null,{timeout:WAIT});
  await page.waitForFunction(()=>window.__story.inspect().libraryDiagram.items[0]?.status==='completed',null,{timeout:WAIT});await settle(page);
  expect(await page.evaluate(()=>window.__story.inspect().libraryDiagram.items[0].progress)).toEqual(Array(11).fill(1));
  const after=await drawing.evaluate(element=>({y:scrollY,top:element.getBoundingClientRect().top,bottom:element.getBoundingClientRect().bottom,height:innerHeight}));
  expect(after.y).toBeCloseTo(before.y,0);expect(after.top).toBeLessThan(after.height*.85);expect(after.bottom).toBeGreaterThan(after.height*.1);
  expect(new URL(page.url()).hash).toBe('#pattern');
 }finally{release();}
});

test('a native hash navigation relinquishes its chapter anchor before later layout measurement',async({page})=>{
 let release;const photoGate=new Promise(resolve=>{release=resolve;});
 await page.route('**/assets/cinematic/connection-detail.webp',async route=>{await photoGate;await route.continue();});
 try{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/#form',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.__story?.inspect().entry.phase==='entered',null,{timeout:WAIT});await settle(page);
 await page.evaluate(async()=>{
  const changed=new Promise(resolve=>addEventListener('hashchange',resolve,{once:true}));
  location.hash='#make';await changed;
 });
 await settle(page);
 const chapter=page.locator('[data-story-chapter="make"]');
 expect(await chapter.evaluate(element=>Math.abs(element.getBoundingClientRect().top-parseFloat(getComputedStyle(element).scrollMarginTop||0)))).toBeLessThan(1);
 const photo=chapter.locator('img[src$="connection-detail.webp"]'),reserved=await photo.boundingBox();
 expect(reserved.width).toBeGreaterThan(100);expect(reserved.height).toBeGreaterThan(100);
 release();await photo.evaluate(element=>element.decode());await settle(page);
 const decoded=await photo.boundingBox();
 expect(decoded.width).toBeCloseTo(reserved.width,1);expect(decoded.height).toBeCloseTo(reserved.height,1);
 expect(await chapter.evaluate(element=>Math.abs(element.getBoundingClientRect().top-parseFloat(getComputedStyle(element).scrollMarginTop||0)))).toBeLessThan(1);
 await page.evaluate(()=>scrollBy({top:200,behavior:'instant'}));await settle(page);
 const before=await chapter.evaluate(element=>({y:scrollY,top:element.getBoundingClientRect().top,frame:window.__story.inspect().controllerFrame}));
 expect(before.top).toBeLessThan(-199);
 // A real one-pixel viewport resize refreshes the measured layout without any
 // direct reading input. Viewport units may reflow slightly; an anchor replay
 // would instead discard the entire 200-pixel position within the chapter.
 const viewport=page.viewportSize();await page.setViewportSize({...viewport,height:viewport.height-1});
 await page.waitForFunction(frame=>window.__story.inspect().controllerFrame>frame,before.frame,{timeout:WAIT});await settle(page);
 const after=await chapter.evaluate(element=>({y:scrollY,top:element.getBoundingClientRect().top}));
 expect(new URL(page.url()).hash).toBe('#make');
 expect(after.y).toBeGreaterThan(before.y-50);expect(after.y).toBeLessThan(before.y+50);
 expect(after.top).toBeLessThan(-150);expect(after.top).toBeGreaterThan(-250);
 }finally{release();}
});
