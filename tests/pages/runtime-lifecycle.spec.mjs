import {test, expect} from '@playwright/test';
import {WAIT, scenarioTimeout, loadScene, centerStudy, surface, hitPoint, frames, settle, pause, expectIdle} from './case-helpers.mjs';

async function snapshot(page) {
  return page.evaluate(() => {
    const story = window.__story.inspect(), scene = window.__thesis.inspect();
    return {controller: story.controllerFrame, frames: scene.frames, time: story.playback.activeSeconds,
      y: scrollY, native: story.nativeDocY, visual: story.visualDocY,
      scheduled: story.scheduled, hidden: scene.hidden};
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

test('lifecycle suspension releases a held source gesture and preserves explicit Pause on return', async ({page, isMobile}) => {
  test.setTimeout(scenarioTimeout(120000));
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await loadScene(page); await pause(page); await centerStudy(page);
  if (isMobile) {
    // Touch pan has its own native browser test; keyboard engagement is an
    // accessible source operation on this emulated mobile viewport.
    await surface(page).press('ArrowRight');
  } else {
    await surface(page).evaluate(element => element.addEventListener('gotpointercapture', event => {element.dataset.testCapturedPointer = String(event.pointerId);}, {once: true}));
    const point = await hitPoint(page); await page.mouse.move(point.x, point.y);
    await expect(surface(page)).toHaveAttribute('data-model-hit', 'true');
    await page.mouse.down(); await page.mouse.move(point.x + 40, point.y - 12, {steps: 3});
    await expect(surface(page)).toHaveAttribute('data-model-dragging', 'true');
    expect(await surface(page).evaluate(element => element.hasPointerCapture(Number(element.dataset.testCapturedPointer)))).toBe(true);
  }
  await frames(page, 2);
  expect(await page.evaluate(() => window.__story.inspect().modelEngaged)).toBe(true);
  const held = await snapshot(page);
  await page.evaluate(() => window.dispatchEvent(new Event('pagehide')));
  expect(await page.evaluate(() => window.__story.inspect().modelEngaged)).toBe(false);
  await expect(surface(page)).not.toHaveAttribute('data-model-dragging', 'true');
  if (!isMobile) {
    expect(await surface(page).evaluate(element => element.hasPointerCapture(Number(element.dataset.testCapturedPointer)))).toBe(false);
    await page.mouse.up();
  }
  const suspended = await snapshot(page); await frames(page, 5); expect(await snapshot(page)).toEqual(suspended);
  await page.evaluate(() => window.dispatchEvent(new Event('pageshow'))); await settle(page);
  expect(await page.evaluate(() => ({angle: window.__story.inspect().inspection.value.azimuth, time: window.__story.inspect().playback.activeSeconds, y: scrollY}))).toEqual({angle: 30, time: held.time, y: held.y});
  await expect(page.getByRole('button', {name: 'Resume motion', exact: true})).toBeVisible();
  await expectIdle(page); expect(errors).toEqual([]);
});
