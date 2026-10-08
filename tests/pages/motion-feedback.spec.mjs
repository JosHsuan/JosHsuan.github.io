import {test, expect} from '@playwright/test';

const RENDER_WAIT = 30000;

async function settle(page) {
  // WebKit can deliver native scroll after the initiating evaluation returns.
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  await page.waitForFunction(() => {
    const story = window.__story?.inspect();
    return story?.settled && !story.scheduled;
  }, null, {timeout: RENDER_WAIT});
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}

async function chapterPhase(page, id, phase) {
  await page.evaluate(({id, phase}) => {
    const rect = document.getElementById(id).getBoundingClientRect();
    scrollTo({top: scrollY + rect.top + rect.height * phase - innerHeight * 0.45, behavior: 'instant'});
  }, {id, phase});
  await settle(page);
}

async function navigateToHold(page, id) {
  await page.locator(`[data-chapter-link="${id}"]`).click();
  await expect(page.locator(`[data-chapter-link="${id}"]`)).toHaveAttribute('aria-current', 'location', {timeout: RENDER_WAIT});
  // Inspect an actual reading hold. Section heights differ by device, so the
  // native anchor's initial viewport-to-section ratio is not assumed constant.
  await chapterPhase(page, id, 0.5);
  await page.waitForFunction(id => window.__thesis?.inspect().pose?.chapter.id === id, id, {timeout: RENDER_WAIT});
}

async function loadScene(page) {
  await page.goto('/');
  await page.waitForFunction(() => window.__thesis?.inspect().ready && window.__story, null, {timeout: RENDER_WAIT});
  await page.evaluate(() => document.fonts.ready);
  await settle(page);
}

async function innerAndTargetBounds(page) {
  return page.evaluate(() => {
    const anchor = document.querySelector('[data-inspect-figure="0"]');
    const summary = document.querySelector('#system ol summary');
    const relative = (element, reference) => {
      const a = element.getBoundingClientRect(), b = reference.getBoundingClientRect();
      return [a.left - b.left, a.top - b.top, a.width, a.height];
    };
    return {
      // Native page flow is allowed. Moving a whole anchor/list item still
      // fails because its reference is the untransformed figure/list.
      anchor: relative(anchor, anchor.closest('figure')),
      summary: relative(summary, summary.closest('ol')),
      media: relative(anchor.querySelector('[data-parallax]'), anchor),
      method: relative(summary.children[1], summary),
    };
  });
}

async function expectStaticInnerPlanes(page) {
  const planes = await page.evaluate(() => [...document.querySelectorAll(
    '[data-heading-line], [data-glyph-kind], [data-glyph-kind] svg > *, a[data-inspect-figure] > [data-parallax], a[data-inspect-figure] > [data-parallax] > span[aria-hidden], [data-editorial-caption], #system ol summary > span'
  )].map(element => ({tag: element.tagName, transform: getComputedStyle(element).transform})));
  expect(planes.length).toBeGreaterThan(20);
  expect(planes.filter(plane => plane.transform !== 'none'), 'authored inner planes return to static layout').toEqual([]);
}

async function expectStillInspectorEntrance(page) {
  await page.locator('[data-inspect-figure="0"]').click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  const entrance = await dialog.locator(':scope > div').evaluate(element => ({
    animation: getComputedStyle(element).animationName,
    transform: getComputedStyle(element).transform,
    moving: element.getAnimations({subtree: true}).filter(animation => animation.playState === 'running').length,
  }));
  // animationName catches an erroneously enabled short entrance even if the
  // software renderer has already finished its first animation frame.
  expect(entrance).toEqual({animation: 'none', transform: 'none', moving: 0});
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
}

test('native reading leads the visual response; reverse navigation reuses the scene and restores source transforms', async ({page}) => {
  test.setTimeout(180000);
  await loadScene(page);
  const canvas = await page.locator('canvas').elementHandle();
  await navigateToHold(page, 'form');
  const rest = await page.evaluate(() => window.__thesis.inspect().layers.map(({id, position, restPosition}) => ({id, position, restPosition})));
  for (const layer of rest) expect(layer.position, layer.id).toEqual(layer.restPosition);

  const response = await page.evaluate(() => new Promise((resolve, reject) => {
    const initial = window.__story.inspect(), initialY = scrollY;
    const rule = () => Number.parseFloat(getComputedStyle(document.getElementById('form')).getPropertyValue('--rule-progress'));
    const initialRule = rule(), samples = [], started = performance.now();
    const sample = () => {
      const state = window.__story.inspect();
      samples.push({scrollY, nativeU: state.nativeU, visualU: state.visualU, rule: rule(), settled: state.settled});
      if (Math.abs(state.nativeU - initial.nativeU) > 0.001 && state.settled && !state.scheduled) return resolve({initialY, initialU: initial.nativeU, initialRule, samples});
      if (performance.now() - started > 30000) return reject(new Error('Native scroll response did not settle within 30 seconds.'));
      requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
    scrollBy({top: Math.min(220, innerHeight * 0.2), behavior: 'instant'});
  }));
  const firstNative = response.samples.find(sample => Math.abs(sample.nativeU - response.initialU) > 0.001);
  expect(firstNative, 'native input reaches the reading controller').toBeTruthy();
  expect(firstNative.scrollY).toBeGreaterThan(response.initialY + 100);
  expect(firstNative.rule).toBeGreaterThan(response.initialRule);
  expect(Math.abs(firstNative.nativeU - firstNative.visualU), 'reading does not wait for visual settlement').toBeGreaterThan(0.00001);
  expect(firstNative.settled).toBe(false);
  const final = response.samples.at(-1);
  expect(final.visualU).toBe(final.nativeU);

  let sawSeparatedLayer = false;
  for (const id of ['system', 'pattern', 'system', 'form']) {
    await navigateToHold(page, id);
    await expect(page.locator('canvas')).toHaveCount(1);
    expect(await page.evaluate(original => document.querySelector('canvas') === original, canvas)).toBe(true);
    const layers = await page.evaluate(() => window.__thesis.inspect().layers);
    if (id === 'system') sawSeparatedLayer ||= layers.some(layer => layer.position.some((value, axis) => value !== layer.restPosition[axis]));
  }
  expect(sawSeparatedLayer, 'the round trip actually leaves the rest configuration').toBe(true);
  expect(await page.evaluate(() => window.__thesis.inspect().layers.map(({id, position, restPosition}) => ({id, position, restPosition})))).toEqual(rest);
  const idle = await page.evaluate(async () => {
    const before = window.__thesis.inspect().frames;
    for (let frame = 0; frame < 8; frame += 1) await new Promise(requestAnimationFrame);
    return {before, after: window.__thesis.inspect().frames, scheduled: window.__story.inspect().scheduled};
  });
  expect(idle.after, 'a settled scene has no continuing render clock').toBe(idle.before);
  expect(idle.scheduled).toBe(false);
});

test('inner objects move inside stable hit regions; Pause and live reduced motion also stop inspector entrance', async ({page}) => {
  test.setTimeout(180000);
  await loadScene(page);
  await navigateToHold(page, 'system');
  await page.waitForFunction(() => {
    const image = document.querySelector('[data-inspect-figure="0"] img');
    return image?.complete && image.naturalWidth > 0;
  }, null, {timeout: RENDER_WAIT});
  await chapterPhase(page, 'system', 0.02);
  const entering = await innerAndTargetBounds(page);
  await chapterPhase(page, 'system', 0.5);
  const held = await innerAndTargetBounds(page);
  for (const target of ['anchor', 'summary']) for (let component = 0; component < 4; component += 1) {
    expect(Math.abs(entering[target][component] - held[target][component]), `${target} hit region is stationary in its native layout`).toBeLessThan(0.25);
  }
  expect(Math.abs(entering.media[1] - held.media[1]), 'evidence moves inside its stable anchor').toBeGreaterThan(0.5);
  expect(Math.abs(entering.method[0] - held.method[0]), 'method text advances inside its stable summary').toBeGreaterThan(0.5);

  await chapterPhase(page, 'system', 0.02);
  await page.getByRole('button', {name: 'Pause motion'}).click();
  await expect(page.getByRole('button', {name: 'Resume motion'})).toBeVisible();
  await settle(page);
  await expectStaticInnerPlanes(page);
  await expectStillInspectorEntrance(page);

  await page.getByRole('button', {name: 'Resume motion'}).click();
  await expect(page.locator('html')).not.toHaveAttribute('data-cinematic-static', '');
  await page.emulateMedia({reducedMotion: 'reduce'});
  await expect(page.getByRole('button', {name: 'Reduced motion'})).toBeVisible();
  for (const phase of [0.02, 0.75]) {
    await chapterPhase(page, 'system', phase);
    await expectStaticInnerPlanes(page);
  }
  await expectStillInspectorEntrance(page);
});
