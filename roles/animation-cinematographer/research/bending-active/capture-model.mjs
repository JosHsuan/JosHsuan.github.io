import { createRequire } from 'node:module';
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { executablePath } from '../../scripts/browser-path.mjs';

const folder = fileURLToPath(new URL('./', import.meta.url)), project = path.resolve(folder, '../../../..');
const sourceModel = process.argv[2] ? path.resolve(process.argv[2]) : null;
if (!sourceModel || path.extname(sourceModel).toLowerCase() !== '.glb') throw new Error('Pass the reviewed local GLB derivative path; raw source files are not accepted.');
const bytes = await readFile(sourceModel);
if (bytes.toString('ascii', 0, 4) !== 'glTF') throw new Error('Not a GLB file');
const modelSHA256 = createHash('sha256').update(bytes).digest('hex');
const out = path.join(folder, 'render'), shots = path.join(folder, 'shots');
await mkdir(out, { recursive: true }); await mkdir(shots, { recursive: true });
const fromProject = createRequire(path.join(project, 'package.json'));
const { webpack } = fromProject('next/dist/compiled/webpack/webpack');
await new Promise((resolve, reject) => webpack({ mode: 'production', target: 'web', optimization: { minimize: false }, entry: path.join(folder, 'camera-review.js'), output: { path: out, filename: 'camera-review.js' }, resolve: { modules: [path.join(project, 'node_modules'), 'node_modules'] } }, (error, stats) => error || stats.hasErrors() ? reject(error ?? new Error(stats.toString({ all: false, errors: true }))) : resolve()));
const script = await readFile(path.join(out, 'camera-review.js'));
const html = '<!doctype html><html lang="en"><head><meta name="robots" content="noindex,nofollow"><style>html,body{margin:0;overflow:hidden}canvas{display:block}</style></head><body><script src="/camera-review.js"></script></body></html>';
const server = createServer((req, res) => {
  if (req.method !== 'GET') { res.writeHead(405).end(); return; }
  const pathname = new URL(req.url, 'http://127.0.0.1').pathname;
  const value = pathname === '/' ? [html, 'text/html'] : pathname === '/camera-review.js' ? [script, 'text/javascript'] : pathname === '/model.glb' ? [bytes, 'model/gltf-binary'] : null;
  if (!value) { res.writeHead(404).end(); return; }
  res.writeHead(200, { 'Content-Type': value[1], 'Cache-Control': 'no-store' }).end(value[0]);
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const { chromium } = fromProject('@playwright/test');
let browser; const captures = [], pageErrors = [];
try {
  browser = await chromium.launch({ headless: true, executablePath });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
  page.on('pageerror', error => pageErrors.push(error.message));
  await page.goto(origin); await page.waitForFunction(() => window.__cameraReview?.ready, {}, { timeout: 30000 });
  for (const frontDegrees of [0, 30, 45]) for (const u of [0, 0.3, 0.5, 0.7, 1]) {
    const state = await page.evaluate(({ u, frontDegrees }) => window.__cameraReview.setView(u, frontDegrees), { u, frontDegrees });
    const filename = `front-${frontDegrees}-u-${Math.round(u * 100)}.png`, destination = path.join(shots, filename);
    await page.locator('canvas').screenshot({ path: destination });
    captures.push({ file: `shots/${filename}`, ...state, sha256: createHash('sha256').update(await readFile(destination)).digest('hex') });
  }
  await page.setViewportSize({ width: 560, height: 800 });
  for (const u of [0, 0.5, 1]) {
    const state = await page.evaluate(u => window.__cameraReview.setView(u, 30), u);
    const filename = `portrait-front-30-u-${Math.round(u * 100)}.png`, destination = path.join(shots, filename);
    await page.locator('canvas').screenshot({ path: destination });
    captures.push({ file: `shots/${filename}`, ...state, sha256: createHash('sha256').update(await readFile(destination)).digest('hex') });
  }
  const before = await page.evaluate(() => window.__cameraReview.state().frames);
  await page.waitForTimeout(400);
  if ((await page.evaluate(() => window.__cameraReview.state().frames)) !== before) throw new Error('Static review rendered at rest');
  if (pageErrors.length) throw new Error(pageErrors.join('\n'));
  await writeFile(path.join(folder, 'actual-model-captures.json'), JSON.stringify({ capturedAt: new Date().toISOString(), sourceModel, modelSHA256, bytes: (await stat(sourceModel)).size, fixtureMaterial: { color: '#aeb4b8', metalness: 0.82, roughness: 0.34, source: 'Neutral material for camera review; not a measured reconstruction' }, renderer: 'Chromium headless / repository-pinned Three.js / original role capture harness', idleVerified: true, captures }, null, 2) + '\n');
  const cards = captures.map(c => `<figure><img src="${c.file}" alt="Actual converted model, front ${c.frontDegrees} degrees, progress ${c.u}"><figcaption>${c.width}×${c.height} · front ${c.frontDegrees}° · u ${c.u}</figcaption></figure>`).join('');
  await writeFile(path.join(folder, 'actual-model-contact-sheet.html'), `<!doctype html><html lang="en"><head><meta name="robots" content="noindex,nofollow"><title>Thesis camera review</title><style>body{background:#0b0d10;color:#f2f0ea;font:16px system-ui;margin:24px}main{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}figure{margin:0}img{width:100%;display:block}figcaption{padding:8px}h1{font-size:25px}</style></head><body><h1>Actual model · camera direction review</h1><p>Neutral material proposal. Geometry ${modelSHA256}. Camera samples, not a simulation.</p><main>${cards}</main></body></html>`);
  process.stdout.write(JSON.stringify({ captured: captures.length, modelSHA256, contactSheet: path.join(folder, 'actual-model-contact-sheet.html') }, null, 2) + '\n');
} finally { if (browser) await browser.close(); await new Promise(resolve => server.close(resolve)); }
