import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile, readdir, mkdir, writeFile} from 'node:fs/promises';
import {createServer} from 'node:http';
import {createRequire} from 'node:module';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const caseRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const assets = path.join(caseRoot, 'release/public/assets/diagrams');
const read = async kind => JSON.parse(await readFile(path.join(assets, `${kind}.json`), 'utf8'));

test('source diagrams retain native path counts, labels, context images and complete static fallbacks', async () => {
  for (const [kind, paths, labels, images, groups] of [['library', 452, 27, 0, 11], ['miura', 387, 16, 1, 3], ['workflow', 585, 98, 11, 4]]) {
    const source = await read(kind), svg = await readFile(path.join(assets, `${kind}.svg`), 'utf8');
    assert.equal(source.paths.length, paths); assert.equal(source.labels.length, labels);
    assert.equal(source.images.length, images); assert.equal(source.groups.length, groups);
    assert.ok(!/[A-Z]:[\\/]/.test(JSON.stringify(source)), 'public data contains no private filesystem paths');
    assert.equal((svg.match(/<path /g) || []).length, paths + source.images.filter(image => image.clip).length);
    assert.equal((svg.match(/<text /g) || []).length, labels);
    assert.ok(!/<image href="(?!data:image\/png;base64,)/.test(svg), 'fallback embeds source image contexts');
    for (const image of source.images) assert.ok((await readFile(path.join(assets, image.file))).length > 100);
    for (const group of source.groups) for (const id of group.paths) assert.ok(source.paths.some(p => p.id === id));
  }
});

test('library selects the eleven authored long curves, including the single native line segment, without evaluating a predictor', async () => {
  const library = await read('library'), traces = library.groups.map(group => library.paths.find(p => p.id === group.paths[0]));
  assert.deepEqual(library.groups.map(g => g.label), Array.from({length: 11}, (_, i) => `${160-i*10} mm`));
  assert.deepEqual(traces.map(t => t.id), Array.from({length: 11}, (_, i) => `p${927+i}`));
  assert.equal(traces.reduce((n, t) => n + (t.attrs.d.match(/C/g) || []).length, 0), 1949);
  assert.equal(traces.reduce((n, t) => n + (t.attrs.d.match(/L/g) || []).length, 0), 1);
  assert.ok(library.labels.some(label => label.text === '170mm'), 'axis tick retained without inventing a twelfth curve');
  assert.ok(!('samples' in library) && !('predictor' in library));
  const miura = await read('miura'); assert.ok(miura.groups.every(group => group.paths.length > 0));
  const workflow = await read('workflow'); assert.deepEqual(workflow.groups.map(group => group.representation), [0, 1, 2, 3]);
});

test('actual SVG/React rendering, keyboard selection, autonomous highlights and event isolation', {skip: process.env.DIAGRAM_BROWSER !== '1'}, async () => {
  const root = path.resolve(caseRoot, '../../../..');
  const require = createRequire(path.join(root, 'package.json'));
  const esbuild = require(require.resolve('esbuild', {paths: [path.dirname(require.resolve('tsx'))]}));
  const {chromium} = require('@playwright/test');
  const entry = `import React from 'react'; import {createRoot} from 'react-dom/client'; import SourceDiagram from ${JSON.stringify(path.join(caseRoot, 'components/SourceDiagram.jsx'))}; createRoot(document.getElementById('app')).render(React.createElement('main',{},...['library','miura','workflow'].map(kind=>React.createElement(SourceDiagram,{kind,key:kind}))));`;
  const bundle = await esbuild.build({stdin: {contents: entry, loader: 'jsx', resolveDir: root}, bundle: true, write: false, outfile: 'fixture.js', loader: {'.css': 'local-css'}, jsx: 'automatic'});
  const files = new Map(bundle.outputFiles.map(file => [`/${path.basename(file.path)}`, file.contents]));
  for (const name of await readdir(assets)) files.set(`/assets/diagrams/${name}`, await readFile(path.join(assets, name)));
  const html = '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/fixture.css"><style>body{margin:0;background:#101216;font-family:Arial,sans-serif}main{max-width:880px;margin:auto;padding:20px;--sans:Arial,sans-serif;--mono:monospace;--serif:serif}*{box-sizing:border-box}</style></head><body><div id="app"></div><script src="/fixture.js"></script></body></html>';
  const server = createServer((request, response) => {
    const url = new URL(request.url, 'http://127.0.0.1').pathname;
    if (url === '/') {response.setHeader('Content-Type', 'text/html'); return response.end(html);}
    const file = files.get(url);
    if (!file) {response.statusCode = 404; return response.end();}
    response.setHeader('Content-Type', url.endsWith('.js') ? 'text/javascript' : url.endsWith('.css') ? 'text/css' : url.endsWith('.svg') ? 'image/svg+xml' : url.endsWith('.json') ? 'application/json' : 'image/png');
    response.end(file);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({headless: true});
  const output = process.env.DIAGRAM_OUTPUT || 'D:/JosHsuan_Website/_work/bending-active-thesis/round-06/artwork/diagrams/review';
  await mkdir(output, {recursive: true});
  const errors = [];
  try {
    const page = await browser.newPage({viewport: {width: 1120, height: 1000}});
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`http://127.0.0.1:${server.address().port}/`);
    await page.waitForSelector('[data-source-diagram="workflow"] button');
    await page.evaluate(() => {window.selectionEvents = []; window.addEventListener('thesis:representation', event => window.selectionEvents.push(event.detail));});
    const workflow = page.locator('[data-source-diagram="workflow"]');
    await workflow.evaluate(node => node.dataset.autonomousIndex = '3');
    assert.equal(await workflow.getAttribute('data-diagram-selection'), 'origami', 'independent phase never disagrees with actual source');
    await page.evaluate(() => window.dispatchEvent(new CustomEvent('thesis:representation-presented', {detail: {chapterId: 'system', index: 3, pinned: false}})));
    await page.waitForFunction(() => document.querySelector('[data-source-diagram="workflow"]').dataset.diagramSelection === 'colours');
    assert.deepEqual(await page.evaluate(() => window.selectionEvents), []);
    const choice = workflow.locator('button[data-diagram-index="2"]');
    await choice.focus(); await choice.press('Enter');
    assert.deepEqual(await page.evaluate(() => window.selectionEvents), [{chapterId: 'system', index: 2}]);
    await workflow.evaluate(node => node.dataset.autonomousIndex = '0');
    assert.equal(await workflow.getAttribute('data-diagram-selection'), 'bending', 'manual selection remains pinned');
    await choice.press('Escape');
    assert.equal(await workflow.getAttribute('data-diagram-selection'), 'colours', 'return follows actual source');
    await page.evaluate(() => window.dispatchEvent(new CustomEvent('thesis:representation-presented', {detail: {chapterId: 'system', index: 0, pinned: false}})));
    assert.equal(await workflow.getAttribute('data-diagram-selection'), 'origami');
    const library = page.locator('[data-source-diagram="library"]');
    await library.locator('button[data-diagram-index="10"]').focus();
    assert.equal(await library.getAttribute('data-diagram-selection'), 'trace-11');
    for (const width of [1120, 390]) {
      await page.setViewportSize({width, height: 1000});
      for (const kind of ['library', 'miura', 'workflow']) {
        const figure = page.locator(`[data-source-diagram="${kind}"]`);
        await figure.screenshot({path: path.join(output, `${width}-${kind}.png`)});
      }
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    }
    await page.emulateMedia({reducedMotion: 'reduce'});
    assert.equal(await library.locator('button').first().evaluate(node => getComputedStyle(node).transitionDuration), '0s');
    await page.route('**/assets/diagrams/library.json', route => route.abort());
    await page.reload();
    const fallback = page.locator('[data-source-diagram="library"] img');
    await fallback.waitFor();
    await page.waitForFunction(() => document.querySelector('[data-source-diagram="library"] img')?.naturalWidth > 0);
    await fallback.screenshot({path: path.join(output, 'library-static-fallback.png')});
    assert.deepEqual(errors, []);
    await writeFile(path.join(output, 'component-verification.json'), JSON.stringify({engine: 'Chromium', widths: [1120, 390], pageErrors: errors, keyboard: true, autonomousNoEvent: true, deliberateEvent: true, pinnedSelection: true, reduced: true, staticFallback: true}, null, 2));
  } finally {await browser.close(); await new Promise(resolve => server.close(resolve));}
});
