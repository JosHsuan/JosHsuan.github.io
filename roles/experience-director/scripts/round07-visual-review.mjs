import {createRequire} from 'node:module';
import {mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';

// Opt-in: preparation and syntax checking never start a competing GPU session.
if (!process.argv.includes('--capture')) {
  console.log('Run with --capture only after the integration owner grants the browser slot. Optional --large includes 4K; ROUND07_VISUAL_BROWSER=webkit selects WebKit.');
  process.exit(0);
}
const require = createRequire(new URL('../../../package.json', import.meta.url));
const browsers = require('@playwright/test');
const browserName = process.env.ROUND07_VISUAL_BROWSER || 'chromium';
if (!['chromium', 'webkit'].includes(browserName)) throw Error('Use the pinned Chromium or WebKit runtime.');
const origin = new URL(process.env.ROUND07_VISUAL_ORIGIN || 'http://127.0.0.1:4186/');
if (!['127.0.0.1', 'localhost'].includes(origin.hostname)) throw Error('This visual review targets the locally built artifact.');
const output = path.resolve(process.env.ROUND07_VISUAL_OUT || 'D:/JosHsuan_Website/_work/bending-active-thesis/round-07/verification/visual');
const chapters = ['overview', 'form', 'system', 'pattern', 'make', 'validation', 'credits'];
const report = {capturedAt: new Date().toISOString(), origin: origin.href, browser: browserName,
  method: 'Actual Full scene and native document scrolling. Test clock advances sub-stale intervals; screenshots are not FPS or hardware performance measurements.',
  canonicalPhase: .25, records: [], errors: []};
const browser = await browsers[browserName].launch({headless: true});
await mkdir(output, {recursive: true});

async function open(width, height) {
  const context = await browser.newContext({viewport: {width, height}, deviceScaleFactor: width < 781 ? 3 : 2,
    isMobile: width < 781, hasTouch: width < 781, reducedMotion: 'no-preference'});
  const page = await context.newPage();
  page.setDefaultTimeout(120000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('crash', () => errors.push('Browser page crashed'));
  await page.clock.install({time: new Date('2026-01-01T00:00:00Z')});
  await page.goto(origin.href, {waitUntil: 'networkidle'});
  await page.waitForFunction(() => window.__thesis?.inspect().ready && window.__story);
  await page.evaluate(() => document.fonts.ready);
  const detail = await page.getByRole('combobox', {name: 'Visual detail', exact: true}).inputValue();
  if (detail !== 'full') throw Error('The visual review must begin in Full.');
  // This jump is discarded by the production stale-time rule. It is followed
  // by ordinary sub-second ticks, never by a test-only camera/playhead override.
  await page.clock.pauseAt(new Date('2026-01-01T01:00:00Z'));
  return {context, page, errors, width, height};
}

async function step(page, milliseconds = 125) {await page.clock.fastForward(milliseconds);}

async function settle(page) {
  let candidate = null, last;
  for (let i = 0; i < 64; i++) {
    await step(page);
    last = await page.evaluate(() => {
      const story = window.__story.inspect(), scene = window.__thesis.inspect();
      return {scroll: scrollY, native: story.nativeDocY, visual: story.visualDocY, pending: story.readingPending,
        settled: story.settled, inspectionSettled: story.inspection.settled,
        frame: story.controllerFrame, rendered: scene.renderedControllerFrame,
        height: document.documentElement.scrollHeight};
    });
    if (!last.settled || !last.inspectionSettled || last.pending || Math.abs(last.native - last.scroll) > .01) {candidate = null; continue;}
    const signature = [last.scroll, last.visual, last.height].join('/');
    if (candidate?.signature !== signature) candidate = {signature, frame: last.frame};
    if (last.rendered >= candidate.frame) return;
  }
  throw Error('Native reading/render did not settle: ' + JSON.stringify(last));
}

async function scrollToElement(page, selector, offset = 170) {
  await page.locator(selector).evaluate((element, top) => {
    let y = 0;
    for (let node = element; node; node = node.offsetParent) y += node.offsetTop;
    scrollTo({top: Math.max(0, y - top), behavior: 'instant'});
  }, offset);
}

async function canonical(page, id) {
  await settle(page);
  const state = await page.evaluate(() => window.__story.inspect().playback);
  if (state.chapterId !== id) throw Error(`Expected native chapter ${id}, found ${state.chapterId}.`);
  const period = state.chapters[state.index].period;
  let remaining = ((period * .25 - state.activeSeconds % period) + period) % period;
  if (remaining < .25) remaining += period;
  // Authoring remains time-based and autonomous. Coarse controlled steps avoid
  // spending minutes on redundant software-rendered frames for a still capture.
  while (remaining > .0001) {
    const seconds = Math.min(.5, remaining);
    await step(page, seconds * 1000);
    remaining -= seconds;
  }
  // The scene consumes the shared controller; give its queued render a turn.
  // Actual phase is recorded rather than asserting an exactly seeked frame.
  await step(page, 32);
}

async function inspect(page) {
  return page.evaluate(() => {
    const story = window.__story.inspect(), scene = window.__thesis.inspect();
    const stage = document.querySelector('[data-cinematic-stage]');
    const boxes = [...document.querySelectorAll('[data-story-panel],[data-model-viewport],[data-source-diagram]')]
      .map(element => {const rect = element.getBoundingClientRect();return {chapter: element.closest('[data-story-chapter]')?.id,
        kind: element.hasAttribute('data-model-viewport') ? 'source aperture' : element.hasAttribute('data-source-diagram') ? 'source diagram' : 'reading plane',
        left: rect.left, top: rect.top, width: rect.width, height: rect.height,
        background: getComputedStyle(element).backgroundColor};})
      .filter(box => box.top + box.height > 0 && box.top < innerHeight);
    return {scrollY, viewport: [innerWidth, innerHeight], deviceDpr: devicePixelRatio,
      overflow: document.documentElement.scrollWidth > innerWidth, canvases: document.querySelectorAll('canvas').length,
      stageZ: getComputedStyle(stage).zIndex, readingZ: getComputedStyle(document.querySelector('[data-reading-frame]')).zIndex,
      ready: scene.ready, detail: scene.detail, source: scene.source, representation: scene.representation,
      budget: scene.renderBudget, compositor: scene.compositor, pose: scene.pose, lighting: scene.lighting,
      playback: story.playback, controllerFrame: story.controllerFrame, renderedControllerFrame: scene.renderedControllerFrame,
      visibleBoxes: boxes};
  });
}

async function capture(session, name, extra = {}) {
  const {page, width, height, errors} = session;
  const file = `${browserName}-${width}x${height}-${name}.png`;
  await page.screenshot({path: path.join(output, file), fullPage: false, scale: 'css', animations: 'allow'});
  const state = await inspect(page);
  const record = {file, width, height, ...extra, state, pageErrors: [...errors]};
  report.records.push(record);
  await writeFile(path.join(output, 'capture-report.json'), JSON.stringify(report, null, 2));
  if (errors.length || state.overflow || state.canvases !== 1 || !state.ready || state.detail !== 'full' || state.compositor.layering?.position !== 'rear' || state.compositor.layering?.semanticMask !== false) {
    throw Error('Rendered capture failed a structural precondition: ' + file);
  }
  console.log(JSON.stringify({file, chapter: state.playback.chapterId, phase: state.playback.loopPhase,
    representation: state.representation?.id, pixels: state.budget.pixels}));
}

async function chaptersAt(width, height) {
  const session = await open(width, height);
  try {
    for (const id of chapters) {
      await scrollToElement(session.page, `#${id} [data-story-panel]`);
      await canonical(session.page, id);
      await capture(session, `${id}-reading-q1`, {requestedChapter: id, requestedPhase: .25});
      if (['form', 'system', 'pattern'].includes(id)) {
        const selector = `[data-model-viewport][data-study-chapter="${id}"]`;
        const top = await session.page.locator(selector).evaluate(element => Math.max(112, (innerHeight - element.offsetHeight) * .34));
        await scrollToElement(session.page, selector, top);
        await canonical(session.page, id);
        await capture(session, `${id}-source-q1`, {requestedChapter: id, requestedPhase: .25});
      }
    }
  } finally {await session.context.close();}
}

async function anticipationAt(width, height) {
  const session = await open(width, height);
  const targets = [
    {name: 'form-heading-anticipation', selector: '#form-heading [data-heading-line]:first-child', threshold: -20.3},
    {name: 'form-source-caption-anticipation', selector: '[data-model-study][data-study-chapter="form"] header [data-choreography="caption"]', threshold: -16.8},
  ];
  try {
    // These FORM elements have not been visited in this fresh document. Native
    // scroll reveals them; no reset of choreography or synthetic CSS pose occurs.
    await scrollToElement(session.page, '#form-heading', 180);
    const captured = new Set(), observed = {};
    for (let i = 0; i < 180 && captured.size < targets.length; i++) {
      await step(session.page, 16);
      for (const target of targets) {
        if (captured.has(target.name)) continue;
        const state = await session.page.locator(target.selector).evaluate(element => {
          const rect = element.getBoundingClientRect();
          return {x: parseFloat(element.style.getPropertyValue('--choreo-x')) || 0, phase: element.dataset.choreographyPhase,
            rect: {left: rect.left, top: rect.top, width: rect.width, height: rect.height}};
        });
        observed[target.name] = state;
        if (state.x <= target.threshold && state.rect.top < height && state.rect.top + state.rect.height > 95) {
          await capture(session, target.name, {entranceTarget: target.selector, entrance: state});
          captured.add(target.name);
        }
      }
    }
    if (captured.size !== targets.length) {
      report.errors.push({kind: 'uncaptured anticipation', width, observed, missing: targets.filter(item => !captured.has(item.name)).map(item => item.name)});
      // Preserve what happened without claiming the peak has been observed.
      await capture(session, 'anticipation-window-ended', {observed, missing: [...targets].filter(item => !captured.has(item.name)).map(item => item.name)});
    }
  } finally {await session.context.close();}
}

try {
  for (const [width, height] of [[1440, 1000], [390, 844]]) {await chaptersAt(width, height); await anticipationAt(width, height);}
  if (process.argv.includes('--large')) {
    const session = await open(3840, 2160);
    try {
      for (const id of ['overview', 'system']) {
        await scrollToElement(session.page, `#${id} [data-story-panel]`);
        await canonical(session.page, id);
        await capture(session, `${id}-density-q1`, {requestedPhase: .25,
          comparisonLimit: 'Different viewport/aspect composition; review source detail, CSS glyph scale and optical-density diagnostics, not pixel equality.'});
      }
    } finally {await session.context.close();}
  }
} catch (error) {report.errors.push({kind: 'capture exception', message: error.message});process.exitCode = 1;}
finally {
  await browser.close();
  await writeFile(path.join(output, 'capture-report.json'), JSON.stringify(report, null, 2));
  const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
  await writeFile(path.join(output, 'index.html'), `<!doctype html><meta charset="utf-8"><title>Round 07 visual evidence</title><style>body{background:#13191b;color:#e6e7df;font:16px system-ui;margin:2rem}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:2rem}figure{margin:0}img{width:100%;height:auto}figcaption{padding:.7rem 0;font-size:.8rem}</style><h1>Round 07 visual evidence</h1><p>Captured rendered states. Human review is separate; this index does not assert visual acceptance.</p><main>${report.records.map(record => `<figure><a href="${escape(record.file)}"><img src="${escape(record.file)}" alt="${escape(record.file)}"></a><figcaption>${escape(record.file)}<br>chapter ${escape(record.state.playback.chapterId)}, phase ${record.state.playback.loopPhase.toFixed(4)}, ${record.state.budget.pixels} target pixels</figcaption></figure>`).join('')}</main>`);
  if (report.errors.length) process.exitCode = 1;
}
