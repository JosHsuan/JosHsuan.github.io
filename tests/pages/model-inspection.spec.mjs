import {test, expect} from '@playwright/test';

const RENDER_WAIT = 30000;
const DEFAULT_STUDY = {azimuth: 30, elevation: 30, separation: 0, lightAzimuth: 0, preset: 'studio'};
const dialogFor = page => page.locator('[data-model-dialog]');

async function frames(page, count = 2) {
  await page.evaluate(async count => {
    for (let index = 0; index < count; index += 1) await new Promise(requestAnimationFrame);
  }, count);
}

async function settleStory(page) {
  await frames(page);
  await page.waitForFunction(() => {
    const story = window.__story?.inspect();
    return story && !story.inspectionActive && story.settled && !story.scheduled;
  }, null, {timeout: RENDER_WAIT});
  await frames(page);
}

async function settleStudy(page) {
  await frames(page);
  await page.waitForFunction(() => {
    const story = window.__story?.inspect(), scene = window.__thesis?.inspect();
    return story?.inspectionActive && story.inspection.settled && !story.scheduled && scene?.mode === 'inspection';
  }, null, {timeout: RENDER_WAIT});
  await frames(page);
}

async function loadScene(page) {
  await page.goto('/');
  await page.waitForFunction(() => window.__thesis?.inspect().ready && window.__story, null, {timeout: RENDER_WAIT});
  await page.evaluate(() => document.fonts.ready);
  await settleStory(page);
}

async function openStudy(page, chapter = 'form', {ready = true} = {}) {
  const trigger = page.locator(`[data-open-model-study="${chapter}"]`);
  await trigger.scrollIntoViewIfNeeded();
  await trigger.focus();
  await settleStory(page);
  const before = await page.evaluate(() => ({scrollY, overflow: document.body.style.overflow}));
  await page.keyboard.press('Enter');
  await expect(dialogFor(page)).toBeVisible();
  await expect(dialogFor(page).getByRole('button', {name: 'Return to story'})).toBeFocused();
  if (ready) await settleStudy(page);
  return {trigger, before};
}

async function expectIdle(page) {
  // The browser still services these observation frames; the application must
  // not schedule its own response/render loop after its last meaningful input.
  await frames(page);
  const before = await page.evaluate(() => ({frames: window.__thesis.inspect().frames, scheduled: window.__story.inspect().scheduled}));
  await frames(page, 8);
  const after = await page.evaluate(() => ({frames: window.__thesis.inspect().frames, scheduled: window.__story.inspect().scheduled}));
  expect(before.scheduled).toBe(false);
  expect(after).toEqual(before);
}

async function camera(page) {
  return page.evaluate(() => {
    const {position, target, fov, viewOffsetNormalized} = window.__thesis.inspect().pose;
    return {position, target, fov, viewOffsetNormalized};
  });
}

async function expectReturn(page, {trigger, before}) {
  await expect(dialogFor(page)).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await settleStory(page);
  const restored = await page.evaluate(() => ({scrollY, overflow: document.body.style.overflow, active: window.__story.inspect().inspectionActive}));
  expect(Math.abs(restored.scrollY - before.scrollY)).toBeLessThan(0.5);
  expect(restored.overflow).toBe(before.overflow);
  expect(restored.active).toBe(false);
}

test('source inspection reuses the loaded Canvas and separates real layers without moving the comparison camera', async ({page}) => {
  test.setTimeout(180000);
  const models = [], errors = [];
  page.on('request', request => {if (/\.glb(?:\?|$)/.test(request.url())) models.push(request.url());});
  page.on('pageerror', error => errors.push(error.message));
  await loadScene(page);
  const canvas = await page.locator('canvas').elementHandle();
  const entry = await openStudy(page);
  const initial = await page.evaluate(() => window.__thesis.inspect());
  const hintClearance = await page.evaluate(() => {const v=window.__thesis.inspect().pose.viewport;return document.getElementById('model-study-help').getBoundingClientRect().top-(v.top+v.height)*innerHeight;});
  expect(hintClearance, 'the complete-source framing viewport excludes the gesture label').toBeGreaterThanOrEqual(7.99);
  expect(initial.source).toMatchObject({vertices: 172789, triangles: 227521, sourceObjects: 51});
  expect(initial.layers.map(layer => layer.id).sort()).toEqual(['base-lower', 'base-upper', 'shell']);
  for (const layer of initial.layers) expect(layer.position, layer.id).toEqual(layer.restPosition);
  expect(await page.evaluate(() => window.__story.inspect().inspection.value)).toEqual(DEFAULT_STUDY);
  const fixedCamera = await camera(page);
  const range = dialogFor(page).getByRole('slider', {name: 'Layer separation'});
  await range.focus();
  await range.press('End');
  await settleStudy(page);
  expect(await range.inputValue()).toBe('1');
  const separated = await page.evaluate(() => window.__thesis.inspect());
  expect(separated.elements.separationWeight).toBe(1);
  expect(separated.elements.caption).toContain('not a construction sequence');
  for (const layer of separated.layers) {
    const verticalOffset = {shell: 0.24, 'base-upper': 0.09, 'base-lower': 0}[layer.id];
    expect(layer.position[0]).toBe(layer.restPosition[0]);
    expect(layer.position[1] - layer.restPosition[1], layer.id).toBeCloseTo(verticalOffset, 12);
    expect(layer.position[2]).toBe(layer.restPosition[2]);
  }
  expect(await camera(page), 'separation keeps the fixed comparison envelope').toEqual(fixedCamera);
  await dialogFor(page).getByRole('button', {name: 'Original placement', exact: true}).click();
  await settleStudy(page);
  const returnedLayers = await page.evaluate(() => window.__thesis.inspect().layers);
  for (const layer of returnedLayers) expect(layer.position, layer.id).toEqual(layer.restPosition);
  await dialogFor(page).getByRole('button', {name: 'High', exact: true}).click();
  await settleStudy(page);
  expect(await camera(page)).not.toEqual(fixedCamera);
  await dialogFor(page).getByRole('button', {name: 'Reset study'}).click();
  await settleStudy(page);
  expect(await page.evaluate(() => window.__story.inspect().inspection.value)).toEqual(DEFAULT_STUDY);
  expect(await camera(page)).toEqual(fixedCamera);
  await expectIdle(page);
  await page.keyboard.press('Escape');
  await expectReturn(page, entry);

  // A second narrative entry must reset the study, not inherit the System
  // chapter's authored display separation or create another loaded scene.
  const nextEntry = await openStudy(page, 'system');
  expect(await page.evaluate(() => window.__story.inspect().inspection.value)).toEqual(DEFAULT_STUDY);
  await expect(page.locator('canvas')).toHaveCount(1);
  expect(await page.evaluate(original => document.querySelector('canvas') === original, canvas)).toBe(true);
  expect(models).toHaveLength(1);
  await dialogFor(page).getByRole('button', {name: 'Return to story'}).click();
  await expectReturn(page, nextEntry);
  expect(errors).toEqual([]);
});

test('opening during native response freezes the story and closing a moving study restores its remaining response without modal elapsed time', async ({page}) => {
  test.setTimeout(180000);
  await loadScene(page);
  const trigger = page.locator('[data-open-model-study="form"]');
  await trigger.scrollIntoViewIfNeeded();
  await trigger.focus();
  await settleStory(page);
  const captured = await page.evaluate(() => new Promise((resolve, reject) => {
    const initial = window.__story.inspect().nativeU, started = performance.now();
    const sample = () => {
      const story = window.__story.inspect();
      if (!story.settled && Math.abs(story.nativeU - initial) > 0.001) {
        const capture = {nativeU: story.nativeU, visualU: story.visualU, velocity: story.velocity, scrollY, overflow: document.body.style.overflow};
        // Launch in the same observed frame so a slow software GPU cannot
        // finish the story response between a protocol read and a click.
        document.querySelector('[data-open-model-study="form"]').click();
        return resolve(capture);
      }
      if (performance.now() - started > 30000) return reject(new Error('No moving native story response was observed.'));
      requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
    scrollBy({top: Math.min(180, innerHeight * 0.2), behavior: 'instant'});
  }));
  await expect(dialogFor(page)).toBeVisible();
  await settleStudy(page);
  // Deliberately exceed the stale-frame boundary while the story is suspended.
  await page.waitForTimeout(1100);
  const frozen = await page.evaluate(() => window.__story.inspect());
  expect(frozen.nativeU).toBe(captured.nativeU);
  expect(frozen.visualU).toBe(captured.visualU);
  expect(frozen.velocity).toBe(captured.velocity);
  const restored = await page.evaluate(() => new Promise(resolve => {
    const field = document.querySelector('[data-inspection-field="azimuth"]');
    field.value = '100';
    field.dispatchEvent(new Event('input', {bubbles: true}));
    const movingStudy = window.__story.inspect().inspection;
    document.querySelector('[data-return-study]').click();
    const immediate = window.__story.inspect();
    requestAnimationFrame(() => resolve({movingStudy, immediate, firstFrame: window.__story.inspect(), scrollY}));
  }));
  expect(restored.movingStudy.settled, 'the closing boundary really has pending manual response').toBe(false);
  expect(restored.immediate.visualU).toBe(captured.visualU);
  expect(restored.immediate.velocity).toBe(captured.velocity);
  expect(restored.firstFrame.inspectionActive).toBe(false);
  expect(Math.abs(restored.firstFrame.visualU - captured.nativeU), 'the first restored frame keeps the remaining story response').toBeGreaterThan(0.000001);
  expect(Math.abs(restored.scrollY - captured.scrollY)).toBeLessThan(0.5);
  await expectReturn(page, {trigger, before: captured});
  await expectIdle(page);
});

test('keyboard and surface drag change bounded views while source-fixed lights, preset-only updates and idle remain independent', async ({page, context, isMobile}) => {
  test.setTimeout(180000);
  await loadScene(page);
  await openStudy(page);
  const surface = page.locator('[data-model-viewport]');
  const sourceLights = await page.evaluate(() => {
    const scene = window.__thesis.inspect();
    return {key: scene.lights.key.position, area: scene.lights.exhibition.key.position};
  });
  await surface.focus();
  await surface.press('ArrowRight');
  await settleStudy(page);
  expect(await page.evaluate(() => window.__story.inspect().inspection.value.azimuth)).toBe(35);
  expect(await page.evaluate(() => {
    const scene = window.__thesis.inspect();
    return {key: scene.lights.key.position, area: scene.lights.exhibition.key.position};
  })).toEqual(sourceLights);
  const beforeGesture = await page.evaluate(() => ({view: window.__story.inspect().inspection.value.azimuth, scrollY}));
  const rect = await surface.boundingBox(), start = {x: rect.x + rect.width * 0.4, y: rect.y + rect.height * 0.45};
  if (isMobile) {
    // Pixel's actual touch input reaches the Pointer Events path; the desktop
    // profiles below use real mouse input rather than synthetic pointer events.
    const cdp = await context.newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{...start, id: 1}]});
    await cdp.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x: start.x + 70, y: start.y - 20, id: 1}]});
    await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []});
    await cdp.detach();
  } else {
    await page.mouse.move(start.x, start.y);
    await page.mouse.down();
    await page.mouse.move(start.x + 70, start.y - 20, {steps: 5});
    await page.mouse.up();
  }
  await settleStudy(page);
  const afterGesture = await page.evaluate(() => ({view: window.__story.inspect().inspection.value.azimuth, scrollY}));
  expect(afterGesture.view).toBeGreaterThan(beforeGesture.view + 10);
  expect(afterGesture.scrollY).toBe(beforeGesture.scrollY);
  const angle = dialogFor(page).getByRole('slider', {name: 'View angle', exact: true});
  await angle.focus(); await angle.press('End'); await settleStudy(page);
  expect(await page.evaluate(() => window.__story.inspect().inspection.value.azimuth)).toBe(100);
  await surface.focus(); await surface.press('ArrowRight'); await settleStudy(page);
  expect(await page.evaluate(() => window.__story.inspect().inspection.value.azimuth)).toBe(100);
  await surface.press('Home'); await settleStudy(page);
  const comparison = await camera(page);
  const studio = await page.evaluate(() => window.__thesis.inspect());
  expect(studio.exhibition.lightFrame).toBe('source');
  await expectIdle(page);
  await dialogFor(page).getByRole('button', {name: 'Raking', exact: true}).click();
  await settleStudy(page);
  const raking = await page.evaluate(() => window.__thesis.inspect());
  expect(raking.frames, 'a discrete light command wakes the settled scene').toBeGreaterThan(studio.frames);
  expect(raking.lights.inspection.preset).toBe('raking');
  expect(raking.keyIntensity, 'the actual bound key intensity changes').not.toBe(studio.keyIntensity);
  expect(raking.lights.key.position).not.toEqual(studio.lights.key.position);
  expect(await camera(page)).toEqual(comparison);
  const lightAngle = dialogFor(page).getByRole('slider', {name: 'Light angle', exact: true});
  await lightAngle.focus(); await lightAngle.press('End'); await settleStudy(page);
  expect(await page.evaluate(() => window.__thesis.inspect().lights.inspection.azimuth)).toBe(70);
  expect(await camera(page)).toEqual(comparison);
  await dialogFor(page).getByRole('button', {name: 'Silhouette', exact: true}).click();
  await settleStudy(page);
  expect(await page.evaluate(() => window.__thesis.inspect().keyIntensity)).toBe(0);
  await expect(lightAngle).toBeDisabled();
  await expectIdle(page);
  await page.keyboard.press('Escape');
});

test('initial Reduced and Pause retain explicit model controls with immediate values and Light preserves the chosen comparison', async ({page}) => {
  test.setTimeout(180000);
  const models = [];
  page.on('request', request => {if (/\.glb(?:\?|$)/.test(request.url())) models.push(request.url());});
  await page.emulateMedia({reducedMotion: 'reduce'});
  await page.goto('/');
  await expect(page.getByRole('button', {name: 'Reduced motion'})).toBeVisible();
  expect(models).toEqual([]);
  const entry = await openStudy(page);
  expect(models).toHaveLength(1);
  const firstFrame = await page.evaluate(() => new Promise(resolve => {
    const field = document.querySelector('[data-inspection-field="separation"]');
    field.value = '1'; field.dispatchEvent(new Event('input', {bubbles: true}));
    requestAnimationFrame(() => resolve(window.__story.inspect().inspection));
  }));
  expect(firstFrame.value.separation).toBe(1);
  expect(firstFrame.settled).toBe(true);
  await dialogFor(page).getByRole('button', {name: 'Front', exact: true}).click();
  await settleStudy(page);
  const manual = await page.evaluate(() => window.__thesis.inspect());
  expect(manual.sourceVisible).toBe(true);
  expect(manual.pose.azimuth).toBe(0);
  expect(manual.pose.elevation).toBe(18);
  expect(manual.elements.separationWeight).toBe(1);
  expect(manual.compositor.apertureScale).toBe(0);
  expect(manual.compositor.asciiWeight).toBe(0);
  expect(manual.compositor.mist.enabled).toBe(false);
  const chosenCamera = await camera(page);
  await dialogFor(page).getByRole('combobox', {name: 'Study visual detail'}).selectOption('light');
  await settleStudy(page);
  const light = await page.evaluate(() => window.__thesis.inspect());
  expect(light.detail).toBe('light');
  expect(light.compositor.requestedSamples).toBe(0);
  expect(light.elements.separationWeight).toBe(1);
  expect(await camera(page)).toEqual(chosenCamera);
  await expectIdle(page);
  await page.keyboard.press('Escape');
  await expectReturn(page, entry);
  for (const layer of await page.evaluate(() => window.__thesis.inspect().layers)) expect(layer.position).toEqual(layer.restPosition);

  await page.emulateMedia({reducedMotion: 'no-preference'});
  await page.getByRole('button', {name: 'Pause motion'}).click();
  await expect(page.getByRole('button', {name: 'Resume motion'})).toBeVisible();
  const pausedEntry = await openStudy(page);
  await dialogFor(page).getByRole('button', {name: 'Separate layers', exact: true}).click();
  await settleStudy(page);
  expect(await page.evaluate(() => window.__story.inspect().inspection)).toMatchObject({value: {separation: 1}, settled: true});
  await expectIdle(page);
  await page.keyboard.press('Escape');
  await expectReturn(page, pausedEntry);
  await expect(page.getByRole('button', {name: 'Resume motion'})).toBeVisible();
});

test('closing while source loading and losing a captured-drag context leave a usable fallback and unlocked reading', async ({page}) => {
  test.setTimeout(180000);
  let releaseLoad;
  const loadGate = new Promise(resolve => {releaseLoad = resolve;});
  await page.route('**/source-layers.glb', async route => {await loadGate; await route.abort();});
  await page.goto('/');
  const loadingEntry = await openStudy(page, 'form', {ready: false});
  await expect(dialogFor(page).locator('p[role="status"]')).toContainText('Loading');
  await expect(dialogFor(page).getByRole('slider', {name: 'View angle', exact: true})).toBeDisabled();
  await page.keyboard.press('Escape');
  await expectReturn(page, loadingEntry);
  releaseLoad();
  await expect(page.getByRole('button', {name: 'Still background'})).toBeVisible({timeout: RENDER_WAIT});
  await expect(dialogFor(page)).not.toBeVisible();
  const failedEntry = await openStudy(page, 'form', {ready: false});
  await expect(dialogFor(page).locator('p[role="status"]')).toContainText('Interactive model unavailable');
  await expect(dialogFor(page).getByRole('slider', {name: 'View angle', exact: true})).toBeDisabled();
  await expect.poll(() => dialogFor(page).locator('img').evaluate(image => image.complete && image.naturalWidth > 0), {timeout: RENDER_WAIT}).toBe(true);
  await dialogFor(page).getByRole('button', {name: 'Return to story'}).click();
  await expectReturn(page, failedEntry);
  await page.unroute('**/source-layers.glb');

  await loadScene(page);
  const contextEntry = await openStudy(page);
  const surface = page.locator('[data-model-viewport]');
  await surface.evaluate(element => element.addEventListener('pointerdown', event => {element.dataset.testPointerId = String(event.pointerId);}, {once: true}));
  const rect = await surface.boundingBox();
  await page.mouse.move(rect.x + rect.width * 0.4, rect.y + rect.height * 0.4);
  await page.mouse.down();
  expect(await surface.evaluate(element => element.hasPointerCapture(Number(element.dataset.testPointerId)))).toBe(true);
  await page.evaluate(() => window.__thesis.loseContext());
  await expect(dialogFor(page).locator('p[role="status"]')).toContainText('Interactive model unavailable', {timeout: RENDER_WAIT});
  await expect.poll(() => surface.evaluate(element => element.hasPointerCapture(Number(element.dataset.testPointerId))), {message: 'failure releases the captured surface', timeout: RENDER_WAIT}).toBe(false);
  const failedTarget = await page.evaluate(() => window.__story.inspect().inspection.target);
  await page.mouse.move(rect.x + rect.width * 0.6, rect.y + rect.height * 0.3);
  await page.mouse.up();
  expect(await page.evaluate(() => window.__story.inspect().inspection.target), 'a failed model cannot continue invisible manipulation').toEqual(failedTarget);
  await dialogFor(page).getByRole('button', {name: 'Return to story'}).click();
  await expectReturn(page, contextEntry);
  await expect(page.locator('[data-story-chapter]')).toHaveCount(7);
  await expect(page.getByRole('button', {name: 'Still background'})).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
});
