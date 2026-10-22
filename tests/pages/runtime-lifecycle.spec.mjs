import {test, expect} from '@playwright/test';
import {WAIT, scenarioTimeout, loadScene, centerStudy, holdModel, surface, hitPoint, frames, settle, expectIdle} from './case-helpers.mjs';

async function snapshot(page) {
  return page.evaluate(() => {
    const story = window.__story.inspect(), scene = window.__thesis.inspect();
    return {controller: story.controllerFrame, frames: scene.frames, time: story.playback.activeSeconds,
      y: scrollY, native: story.nativeDocY, visual: story.visualDocY,
      scheduled: story.scheduled, hidden: scene.hidden,
      informationTicks:story.informationWindows.ticks,
      liquid:{ticks:story.liquidGlass.ticks,maps:story.liquidGlass.mapGenerations,items:story.liquidGlass.items.map(({kind,x,y,hover,press})=>({kind,x,y,hover,press}))},
      ascii:{draws:story.pageField.draws,time:story.pageField.fieldTime,allocations:story.pageField.allocations}};
  });
}

// Deliberately synthetic lifecycle delivery verifies our event/state contract.
// It is not physical Safari suspension, process eviction or iPhone certification.
test('overlapping page-cache and freeze signals stop work until the last reason resumes', async ({page}) => {
  test.setTimeout(scenarioTimeout(120000));
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await loadScene(page); await centerStudy(page, 'system');
  const before = await page.evaluate(() => {
    const story = window.__story.inspect(), before = {time: story.playback.activeSeconds, y: scrollY, native: story.nativeDocY, visual: story.visualDocY};
    window.dispatchEvent(new Event('pagehide')); document.dispatchEvent(new Event('freeze')); return before;
  });
  const held = await snapshot(page);
  expect(held).toMatchObject({time: before.time, y: before.y, native: before.native, visual: before.visual, scheduled: false, hidden: true});
  await frames(page, 5); expect(await snapshot(page)).toEqual(held);
  await page.evaluate(() => window.dispatchEvent(new Event('pageshow')));
  expect(await page.evaluate(() => window.__story.inspect().lifecycle.reasons)).toEqual(['freeze']);
  await frames(page, 5); expect(await snapshot(page)).toEqual(held);
  // The first resumed controller frame discards the suspended interval. The
  // following real frames continue the same chapter and original clock.
  const firstResume = await page.evaluate(() => new Promise(resolve => {
    document.dispatchEvent(new Event('resume'));
    requestAnimationFrame(() => {const story = window.__story.inspect(); resolve({time: story.playback.activeSeconds, controller: story.controllerFrame, suspended: story.lifecycle.suspended});});
  }));
  expect(firstResume).toMatchObject({time: held.time, suspended: false});
  expect(firstResume.controller).toBeGreaterThan(held.controller);
  await settle(page);
  await expect.poll(() => page.evaluate(() => window.__story.inspect().playback.activeSeconds), {timeout: WAIT}).toBeGreaterThan(held.time);
  expect(await page.evaluate(() => ({y: scrollY, chapter: window.__story.inspect().playback.chapterId}))).toEqual({y: held.y, chapter: 'system'});
  await expect(page.locator('[data-cinematic-stage] canvas')).toHaveCount(1); expect(errors).toEqual([]);
});

test('lifecycle suspension releases mouse inspection and preserves native touch neutrality in the Full story', async ({page, context, isMobile}) => {
  test.setTimeout(scenarioTimeout(120000));
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await loadScene(page); await centerStudy(page);
  await surface(page).evaluate(element => {
    element.addEventListener('gotpointercapture', event => {element.dataset.testCapturedPointer = String(event.pointerId);}, {once: true});
    element.__testOriginalCapture=element.setPointerCapture;const capture=element.setPointerCapture.bind(element);element.__testExplicitCaptures=0;
    element.setPointerCapture=id=>{element.__testExplicitCaptures++;return capture(id);};
  });
  let cdp=null;
  try{
  const point = await hitPoint(page);cdp=isMobile?await context.newCDPSession(page):null;
  if (isMobile) {
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...point,id:1}]});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:point.x+40,y:point.y,id:1}]});
  } else {
    await page.mouse.move(point.x, point.y);
    await expect(surface(page)).toHaveAttribute('data-model-hit', 'true');
    await page.mouse.down(); await page.mouse.move(point.x + 40, point.y - 12, {steps: 3});
  }
  if(isMobile){
    // Browser implicit touch capture is legal; the model must never request it
    // or turn native touch tracking into inspection ownership.
    await expect(surface(page)).not.toHaveAttribute('data-model-dragging','true');
    expect(await surface(page).evaluate(element=>element.__testExplicitCaptures)).toBe(0);
    expect(await page.evaluate(()=>{const s=window.__story.inspect();return {engaged:s.modelEngaged,held:s.modelHeldSource,selection:s.sourceSelection};})).toEqual({engaged:false,held:null,selection:null});
  }else{
    await expect(surface(page)).toHaveAttribute('data-model-dragging', 'true');
    expect(await surface(page).evaluate(element => element.hasPointerCapture(Number(element.dataset.testCapturedPointer)))).toBe(true);
    await frames(page, 2);
    expect(await page.evaluate(() => window.__story.inspect().modelEngaged)).toBe(true);
  }
  const held = await snapshot(page);
  await page.evaluate(() => window.dispatchEvent(new Event('pagehide')));
  expect(await page.evaluate(() => window.__story.inspect().modelEngaged)).toBe(false);
  expect(await page.evaluate(() => window.__story.inspect().modelHeldSource)).toBeNull();
  await expect(surface(page)).not.toHaveAttribute('data-model-dragging', 'true');
  if(cdp){
    await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});await cdp.detach();cdp=null;
    expect(await surface(page).evaluate(element=>element.__testExplicitCaptures)).toBe(0);
  }else{
    // Suspension, not pointerup, must release the application's mouse capture.
    expect(await surface(page).evaluate(element=>element.hasPointerCapture(Number(element.dataset.testCapturedPointer)))).toBe(false);
    await page.mouse.up();
  }
  expect(await surface(page).evaluate(element => element.hasPointerCapture(Number(element.dataset.testCapturedPointer)))).toBe(false);
  await surface(page).evaluate(element=>{element.setPointerCapture=element.__testOriginalCapture;delete element.__testOriginalCapture;delete element.__testExplicitCaptures;});
  const suspended = await snapshot(page); await frames(page, 5); expect(await snapshot(page)).toEqual(suspended);
  await page.evaluate(() => window.dispatchEvent(new Event('pageshow'))); await settle(page);
  expect(await page.evaluate(() => ({angle: window.__story.inspect().inspection.value.azimuth, y: scrollY, detail:window.__thesis.inspect().detail}))).toEqual({angle: 30, y: held.y, detail:'full'});
  await expect.poll(()=>page.evaluate(()=>window.__story.inspect().playback.activeSeconds),{timeout:WAIT}).toBeGreaterThan(held.time);
  const pause=page.getByRole('button',{name:'Pause motion',exact:true});
  await expect(pause).toHaveCount(1);await expect(pause).toBeEnabled();await expect(pause).toHaveAttribute('aria-pressed','false');
  await holdModel(page);await expectIdle(page);
  const keyboardY=await page.evaluate(()=>scrollY);await surface(page).press('Escape');await settle(page);
  expect(await page.evaluate(()=>{const s=window.__story.inspect();return {engaged:s.modelEngaged,held:s.modelHeldSource,angle:s.inspection.value.azimuth,y:scrollY};})).toEqual({engaged:false,held:null,angle:30,y:keyboardY});
  expect(errors).toEqual([]);
  }finally{
    // Cleanup must also run after a failed lifecycle assertion, without
    // replacing its diagnostic with a best-effort input/session error.
    if(cdp){try{await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});}catch{}try{await cdp.detach();}catch{}}
    if(!isMobile)try{await page.mouse.up();}catch{}
    try{await surface(page).evaluate(element=>{if(element.__testOriginalCapture){element.setPointerCapture=element.__testOriginalCapture;delete element.__testOriginalCapture;}delete element.__testExplicitCaptures;});}catch{}
  }
});
