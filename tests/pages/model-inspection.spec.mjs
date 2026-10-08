import {test, expect} from '@playwright/test';
import {PerspectiveCamera, Vector3} from 'three';
import {INSPECTION_FRAMING_SUPPORT} from '../../roles/uiux-designer/cases/bending-active-thesis/components/inspection-framing-support.mjs';

const WAIT = 30000;
const DEFAULT_STUDY = {azimuth: 30, elevation: 30, separation: 0, lightAzimuth: 0, preset: 'studio'};
const study = page => page.locator('[data-model-study]');
const surface = page => page.locator('[data-model-viewport]');

async function frames(page, count = 2) {
  await page.evaluate(async count => {for (let i = 0; i < count; i++) await new Promise(requestAnimationFrame);}, count);
}

async function settle(page) {
  await frames(page);
  await page.waitForFunction(() => {
    const value = window.__story?.inspect();
    return value?.settled && value.inspection.settled && !value.scheduled;
  }, null, {timeout: WAIT});
  await frames(page);
}

async function loadScene(page) {
  await page.goto('/');
  await page.waitForFunction(() => window.__thesis?.inspect().ready && window.__story, null, {timeout: WAIT});
  await page.evaluate(() => document.fonts.ready);
  await settle(page);
}

async function centerStudy(page, {ready = true} = {}) {
  await surface(page).scrollIntoViewIfNeeded();
  await surface(page).evaluate(element => {
    element.focus({preventScroll: true});
    let y=0;for(let node=element;node;node=node.offsetParent)y+=node.offsetTop;
    scrollTo({top:y-Math.max(112,(innerHeight-element.offsetHeight)*.34),behavior:'instant'});
  });
  await settle(page);
  if (ready) {
    await page.waitForFunction(() => window.__thesis?.inspect().studyWeight === 1, null, {timeout: WAIT});
    await frames(page);
  }
}

async function pressRange(page, name, key) {
  await selectControls(page, name === 'Layer separation' ? 'Layers' : name === 'Light angle' ? 'Light' : 'View');
  const range = study(page).getByRole('slider', {name, exact: true});
  await range.evaluate(element => element.focus({preventScroll: true}));
  await page.keyboard.press(key);
  await settle(page);await centerStudy(page);
}

async function selectControls(page, tab) {
  const button = study(page).getByRole('button', {name: tab, exact: true});
  if (await button.getAttribute('aria-pressed') !== 'true') {
    await button.click();
    await centerStudy(page);
  }
}

async function choose(page, name) {
  if (['Front', 'Three-quarter', 'High'].includes(name)) await selectControls(page, 'View');
  if (['Original placement', 'Separate layers'].includes(name)) await selectControls(page, 'Layers');
  if (['Studio', 'Raking'].includes(name)) await selectControls(page, 'Light');
  await study(page).getByRole('button', {name, exact: true}).click();
  await centerStudy(page);
}

async function camera(page) {
  return page.evaluate(() => {
    const {position, target, fov, viewOffsetNormalized} = window.__thesis.inspect().pose;
    return {position, target, fov, viewOffsetNormalized};
  });
}

function expectCameraEqual(actual, expected) {
  for (const key of ['position', 'target']) actual[key].forEach((value, i) => expect(value).toBeCloseTo(expected[key][i], 7));
  expect(actual.fov).toBeCloseTo(expected.fov, 8);
  for (const axis of ['x', 'y']) expect(actual.viewOffsetNormalized[axis]).toBeCloseTo(expected.viewOffsetNormalized[axis], 7);
}

async function expectSourceFit(page) {
  const {pose, width, height} = await page.evaluate(() => ({pose: window.__thesis.inspect().pose, width: innerWidth, height: innerHeight}));
  expect(pose.studyWeight).toBe(1);
  expect(pose.framingSourceSHA256).toBe(INSPECTION_FRAMING_SUPPORT.sourceSHA256);
  expect(pose.framingSupportPoints).toBe(514);
  const view = new PerspectiveCamera(pose.fov, width / height, pose.near, pose.far);
  view.position.fromArray(pose.position); view.up.fromArray(pose.up); view.lookAt(...pose.target);
  view.setViewOffset(width, height, width * pose.viewOffsetNormalized.x, height * pose.viewOffsetNormalized.y, width, height);
  view.updateProjectionMatrix(); view.updateMatrixWorld(true);
  const point = new Vector3(), viewport = pose.viewport;
  for (const vertex of INSPECTION_FRAMING_SUPPORT.points) {
    point.fromArray(vertex).project(view);
    const x = (point.x + 1) / 2, y = (1 - point.y) / 2;
    expect((x - viewport.left) / viewport.width).toBeGreaterThanOrEqual(.03 - 1e-7);
    expect((viewport.left + viewport.width - x) / viewport.width).toBeGreaterThanOrEqual(.03 - 1e-7);
    expect((y - viewport.top) / viewport.height).toBeGreaterThanOrEqual(.03 - 1e-7);
    expect((viewport.top + viewport.height - y) / viewport.height).toBeGreaterThanOrEqual(.03 - 1e-7);
    expect(point.z).toBeGreaterThanOrEqual(-1); expect(point.z).toBeLessThanOrEqual(1);
  }
  const hintGap = await page.evaluate(() => {
    const v = window.__thesis.inspect().pose.viewport;
    return document.getElementById('model-study-help').getBoundingClientRect().top - (v.top + v.height) * innerHeight;
  });
  expect(hintGap).toBeGreaterThanOrEqual(7.99);
}

async function expectIdle(page) {
  await settle(page);
  const before = await page.evaluate(() => ({frames: window.__thesis.inspect().frames, scheduled: window.__story.inspect().scheduled}));
  await frames(page, 8);
  expect(await page.evaluate(() => ({frames: window.__thesis.inspect().frames, scheduled: window.__story.inspect().scheduled}))).toEqual(before);
  expect(before.scheduled).toBe(false);
}

test('inline source uses one Canvas and one GLB, with exact layers and fitted source evidence', async ({page}) => {
  test.setTimeout(180000);
  const models = [], errors = [];
  page.on('request', request => {if (/\.glb(?:\?|$)/.test(request.url())) models.push(request.url());});
  page.on('pageerror', error => errors.push(error.message));
  await loadScene(page);
  const originalCanvas = await page.locator('canvas').elementHandle();
  await centerStudy(page);
  await expect(page.locator('dialog,[data-model-dialog]')).toHaveCount(0);
  const initial = await page.evaluate(() => window.__thesis.inspect());
  expect(initial.mode).toBe('continuous-story');
  expect(initial.source).toMatchObject({revision: INSPECTION_FRAMING_SUPPORT.sourceSHA256, vertices: 172789, triangles: 227521, sourceObjects: 51});
  expect(initial.layers.map(layer => layer.id).sort()).toEqual(['base-lower', 'base-upper', 'shell']);
  expect(await page.evaluate(() => window.__story.inspect().inspection.value)).toMatchObject(DEFAULT_STUDY);
  await expectSourceFit(page);
  await selectControls(page, 'Layers');
  const fixedCamera = await camera(page);
  await pressRange(page, 'Layer separation', 'End');
  const separated = await page.evaluate(() => window.__thesis.inspect());
  expect(separated.elements.separationWeight).toBe(1);
  expect(separated.elements.caption).toContain('not a construction sequence');
  for (const layer of separated.layers) {
    const offset = {shell: .24, 'base-upper': .09, 'base-lower': 0}[layer.id];
    expect(layer.position[0]).toBe(layer.restPosition[0]);
    expect(layer.position[1] - layer.restPosition[1]).toBeCloseTo(offset, 12);
    expect(layer.position[2]).toBe(layer.restPosition[2]);
  }
  expectCameraEqual(await camera(page), fixedCamera);
  await choose(page, 'High');
  await expectSourceFit(page);
  expect(await page.evaluate(() => window.__thesis.inspect().pose.elevation)).toBe(65);
  await choose(page, 'Reset study');
  for (const layer of await page.evaluate(() => window.__thesis.inspect().layers)) expect(layer.position).toEqual(layer.restPosition);
  await expect(page.locator('canvas')).toHaveCount(1);
  expect(await page.evaluate(original => document.querySelector('canvas') === original, originalCanvas)).toBe(true);
  expect(models).toHaveLength(1); expect(errors).toEqual([]);
  await expectIdle(page);
});

test('wheel scrolling keeps the shared story moving and reverse scrolling preserves inline choices', async ({page}) => {
  test.setTimeout(180000);
  await loadScene(page); await centerStudy(page); await choose(page, 'High');
  const before = await page.evaluate(() => ({scrollY, story: window.__story.inspect(), pose: window.__thesis.inspect().pose}));
  const box = await surface(page).boundingBox();
  await page.mouse.move(box.x + box.width * .5, box.y + box.height * .4);
  await page.mouse.wheel(0, Math.round((await page.viewportSize()).height * .9));
  await settle(page);
  const after = await page.evaluate(() => ({scrollY, story: window.__story.inspect(), pose: window.__thesis.inspect().pose, overflow: document.body.style.overflow}));
  expect(after.scrollY).toBeGreaterThan(before.scrollY + 200);
  expect(after.story.visualDocY).toBeGreaterThan(before.story.visualDocY + 100);
  expect(after.story.visualU).toBeGreaterThan(before.story.visualU);
  expect(after.story.inspection.target).toEqual(before.story.inspection.target);
  expect(after.pose.position).not.toEqual(before.pose.position);
  expect(after.overflow).not.toBe('hidden');
  await page.mouse.wheel(0, -Math.round((await page.viewportSize()).height * .9));
  await settle(page); await centerStudy(page);
  expect(await page.evaluate(() => window.__story.inspect().inspection.target)).toEqual(before.story.inspection.target);
  expect(await page.evaluate(() => window.__thesis.inspect().pose.elevation)).toBe(65);
  await expectSourceFit(page); await expectIdle(page);
});

test('keyboard and mouse change bounded views, touch scrolls, and source-fixed lighting remains causal', async ({page, context, isMobile}) => {
  test.setTimeout(180000);
  await loadScene(page); await centerStudy(page);
  const sourceLights = await page.evaluate(() => {
    const scene = window.__thesis.inspect(); return {key: scene.lights.key.position, area: scene.lights.exhibition.key.position};
  });
  await surface(page).focus(); await page.keyboard.press('ArrowRight'); await settle(page);
  expect(await page.evaluate(() => window.__story.inspect().inspection.value.azimuth)).toBe(35);
  expect(await page.evaluate(() => {
    const scene = window.__thesis.inspect(); return {key: scene.lights.key.position, area: scene.lights.exhibition.key.position};
  })).toEqual(sourceLights);
  const before = await page.evaluate(() => ({azimuth: window.__story.inspect().inspection.value.azimuth, scrollY}));
  const box = await surface(page).boundingBox(), start = {x: box.x + box.width * .4, y: box.y + box.height * .6};
  if (isMobile) {
    const cdp = await context.newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{...start, id: 1}]});
    for (let i = 1; i <= 6; i++) await cdp.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x: start.x, y: start.y - i * 20, id: 1}]});
    await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); await cdp.detach();
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(before.scrollY + 30);
    await settle(page);
    expect(await page.evaluate(() => window.__story.inspect().inspection.value.azimuth)).toBe(before.azimuth);
    await centerStudy(page);
  } else {
    await page.mouse.move(start.x, start.y); await page.mouse.down();
    await page.mouse.move(start.x + 70, start.y - 20, {steps: 5}); await page.mouse.up(); await settle(page);
    expect(await page.evaluate(() => window.__story.inspect().inspection.value.azimuth)).toBeGreaterThan(before.azimuth + 10);
    expect(await page.evaluate(() => scrollY)).toBe(before.scrollY);
  }
  await pressRange(page, 'View angle', 'End');
  await surface(page).focus(); await page.keyboard.press('ArrowRight'); await settle(page);
  expect(await page.evaluate(() => window.__story.inspect().inspection.value.azimuth)).toBe(100);
  await page.keyboard.press('Home'); await settle(page);
  await choose(page, 'Raking');
  const comparison = await camera(page), raking = await page.evaluate(() => window.__thesis.inspect());
  expect(raking.exhibition.lightFrame).toBe('source');
  expect(raking.lights.key.position).not.toEqual(sourceLights.key);
  await pressRange(page, 'Light angle', 'End');
  const rotated = await page.evaluate(() => window.__thesis.inspect());
  expect(rotated.lights.key.position).not.toEqual(raking.lights.key.position);
  expectCameraEqual(await camera(page), comparison);
  await expectIdle(page);
});

test('Reduced requires explicit Enable and preserves immediate source controls in Light detail', async ({page}) => {
  test.setTimeout(180000);
  const models = [];
  page.on('request', request => {if (/\.glb(?:\?|$)/.test(request.url())) models.push(request.url());});
  await page.emulateMedia({reducedMotion: 'reduce'}); await page.goto('/');
  await expect(page.getByRole('button', {name: 'Reduced motion', exact: true})).toBeVisible();
  await centerStudy(page, {ready: false});
  expect(models).toHaveLength(0);
  await study(page).getByRole('button', {name: 'Enable model', exact: true}).click();
  await page.waitForFunction(() => window.__thesis?.inspect().ready, null, {timeout: WAIT});
  await centerStudy(page);
  expect(models).toHaveLength(1);
  await pressRange(page, 'Layer separation', 'End'); await choose(page, 'Front');
  const manual = await page.evaluate(() => ({story: window.__story.inspect(), scene: window.__thesis.inspect()}));
  expect(manual.story.inspection).toMatchObject({value: {separation: 1, azimuth: 0, elevation: 18}, settled: true});
  expect(manual.scene.sourceVisible).toBe(true); expect(manual.scene.elements.separationWeight).toBe(1);
  expect(manual.scene.compositor.apertureScale).toBe(0); expect(manual.scene.compositor.asciiWeight).toBe(0); expect(manual.scene.compositor.mist.enabled).toBe(false);
  await study(page).getByRole('combobox', {name: 'Study visual detail'}).selectOption('light'); await centerStudy(page);
  const light = await page.evaluate(() => window.__thesis.inspect());
  expect(light.detail).toBe('light'); expect(light.renderer.dpr).toBe(1); expect(light.compositor.requestedSamples).toBe(0);
  expect(light.elements.separationWeight).toBe(1); expect(light.pose.azimuth).toBe(0); expect(light.pose.elevation).toBe(18);
  await expectSourceFit(page); await expectIdle(page);
});

test('loading failure and context loss retain inline fallback, release drag and leave native reading unlocked', async ({page}) => {
  test.setTimeout(180000);
  await page.route('**/source-layers.glb', route => route.abort());
  await page.goto('/');
  await expect(page.getByRole('button', {name: 'Still background', exact: true})).toBeVisible({timeout: WAIT});
  await centerStudy(page, {ready: false});
  await expect(study(page).locator('p[role="status"]')).toContainText('Interactive model unavailable');
  await expect(study(page).getByRole('slider', {name: 'View angle', exact: true})).toBeDisabled();
  await expect.poll(() => study(page).locator('img').evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true);
  const failedScroll = await page.evaluate(() => scrollY);
  await page.mouse.wheel(0, 250); await settle(page);
  expect(await page.evaluate(() => scrollY)).toBeGreaterThan(failedScroll + 100);
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe('hidden');
  await page.unroute('**/source-layers.glb'); await loadScene(page); await centerStudy(page);
  await surface(page).evaluate(element => element.addEventListener('pointerdown', event => {element.dataset.testPointerId = String(event.pointerId);}, {once: true}));
  const box = await surface(page).boundingBox();
  await page.mouse.move(box.x + box.width * .4, box.y + box.height * .4); await page.mouse.down();
  expect(await surface(page).evaluate(element => element.hasPointerCapture(Number(element.dataset.testPointerId)))).toBe(true);
  await page.evaluate(() => window.__thesis.loseContext());
  await expect(study(page).locator('p[role="status"]')).toContainText('Interactive model unavailable', {timeout: WAIT});
  await expect.poll(() => surface(page).evaluate(element => element.hasPointerCapture(Number(element.dataset.testPointerId)))).toBe(false);
  const target = await page.evaluate(() => window.__story.inspect().inspection.target);
  await page.mouse.move(box.x + box.width * .6, box.y + box.height * .3); await page.mouse.up();
  expect(await page.evaluate(() => window.__story.inspect().inspection.target)).toEqual(target);
  await expect(page.locator('[data-story-chapter]')).toHaveCount(7);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe('hidden');
});
