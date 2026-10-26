import {test, expect} from '@playwright/test';
import {WAIT, scenarioTimeout, loadScene, centerStudy, surface, hitPoint, frames, settle} from './case-helpers.mjs';

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

test('lifecycle suspension preserves unclaimed pointer input and resumes the same scroll-owned source', async ({page, context, isMobile}) => {
 test.setTimeout(scenarioTimeout(120000));const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await loadScene(page);await centerStudy(page,'form');const canvas=await page.locator('[data-cinematic-stage] canvas').elementHandle();
 const point=await hitPoint(page),before=await page.evaluate(()=>({y:scrollY,source:window.__thesis.inspect().representation.id,time:window.__story.inspect().playback.activeSeconds}));let cdp=null;
 try{
  if(isMobile){cdp=await context.newCDPSession(page);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...point,id:1}]});}
  else{await page.mouse.move(point.x,point.y);await page.mouse.down();}
  expect(await page.evaluate(()=>{const s=window.__story.inspect();return{engaged:s.modelEngaged,held:s.modelHeldSource,selection:s.sourceSelection};})).toEqual({engaged:false,held:null,selection:null});
  await expect(surface(page)).not.toHaveAttribute('data-model-dragging','true');
  await page.evaluate(()=>window.dispatchEvent(new Event('pagehide')));const held=await snapshot(page);await frames(page,5);expect(await snapshot(page)).toEqual(held);
  if(cdp){await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});await cdp.detach();cdp=null;}else await page.mouse.up();
  await page.evaluate(()=>window.dispatchEvent(new Event('pageshow')));await settle(page);
  expect(await page.evaluate(()=>({y:scrollY,source:window.__thesis.inspect().representation.id}))).toEqual({y:before.y,source:before.source});
  await expect.poll(()=>page.evaluate(()=>window.__story.inspect().playback.activeSeconds),{timeout:WAIT}).toBeGreaterThan(held.time);
  expect(await page.evaluate(el=>document.querySelector('[data-cinematic-stage] canvas')===el,canvas)).toBe(true);
  await expect(page.getByRole('button',{name:/Pause|Resume|Enable/})).toHaveCount(0);expect(errors).toEqual([]);
 }finally{if(cdp){try{await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});await cdp.detach();}catch{}}else if(!isMobile)try{await page.mouse.up();}catch{}}
});
