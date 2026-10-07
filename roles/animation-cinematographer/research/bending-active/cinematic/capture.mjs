import { createRequire } from 'node:module';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { executablePath } from '../../../scripts/browser-path.mjs';

const folder = fileURLToPath(new URL('./', import.meta.url)), project = path.resolve(folder, '../../../../..');
const output = path.resolve('D:/JosHsuan_Website/_work/bending-active-thesis/cinematic-integration/cinema-review');
const assets = path.join(project, 'roles/uiux-designer/cases/bending-active-thesis/public/assets');
const fromProject = createRequire(path.join(project, 'package.json'));
await mkdir(output, { recursive: true }); await mkdir(path.join(output, 'shots'), { recursive: true });
const { webpack } = fromProject('next/dist/compiled/webpack/webpack');
await new Promise((resolve, reject) => webpack({ mode: 'production', target: 'web', optimization: { minimize: false }, entry: path.join(folder, 'review-scene.js'), output: { path: output, filename: 'review.js' }, resolve: { modules: [path.join(project, 'node_modules'), 'node_modules'] } }, (error, stats) => error || stats.hasErrors() ? reject(error ?? new Error(stats.toString({ all: false, errors: true }))) : resolve()));
const files = new Map();
for (const filename of ['assembly.glb', 'studio-small.hdr', 'workflow.webp', 'surface-studies.webp', 'connections.webp', 'assembly.webp']) files.set('/' + filename, [await readFile(path.join(assets, filename)), filename.endsWith('.webp') ? 'image/webp' : 'application/octet-stream']);
const modelSHA256 = createHash('sha256').update(files.get('/assembly.glb')[0]).digest('hex');
files.set('/review.js', [await readFile(path.join(output, 'review.js')), 'text/javascript']);
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><meta name="viewport" content="width=device-width,initial-scale=1"><style>
*{box-sizing:border-box}html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#0b1014;color:#f0eee6;font-family:Arial,sans-serif}#stage{position:fixed;inset:0}canvas{display:block}.scrim{position:fixed;inset:0;background:linear-gradient(90deg,rgba(6,10,13,.82) 0%,rgba(6,10,13,.65) 29%,transparent 63%)}header{position:fixed;top:26px;left:5vw;right:5vw;display:flex;justify-content:space-between;font:11px monospace;letter-spacing:.1em}.copy{position:fixed;left:5vw;top:26vh;width:33vw}.eyebrow{font:12px monospace;letter-spacing:.16em;color:#ff9568}h1{font-size:clamp(46px,5.8vw,98px);line-height:.96;letter-spacing:-.05em;font-weight:500;margin:22px 0}.description{font-size:17px;line-height:1.55;color:#c4ccd0;max-width:340px}.status{position:fixed;bottom:24px;left:5vw;font:11px monospace;color:#94a2a9}figure{position:fixed;right:6vw;top:16vh;width:35vw;height:70vh;margin:0}figure img{width:100%;height:100%;object-fit:contain}body[data-chapter=make] .copy{left:auto;right:6vw;width:30vw}body[data-chapter=make] figure{right:auto;left:6vw}body[data-chapter=make] .scrim{background:linear-gradient(270deg,rgba(6,10,13,.9),transparent 75%)}body[data-chapter=credits] .copy{top:auto;bottom:7vh;left:5vw;width:80vw}body[data-chapter=credits] h1{font-size:32px;margin:12px 0}body[data-chapter=credits] .description{max-width:none;font-size:13px}body[data-chapter=credits] .status{display:none}
@media(max-width:700px){header{top:20px}.copy,body[data-chapter=make] .copy{left:6vw;right:auto;top:12vh;width:85vw}h1{font-size:13vw;max-width:88vw;margin:18px 0}.description{font-size:15px;line-height:1.5;max-width:85vw}.eyebrow{font-size:10px}.scrim{background:linear-gradient(180deg,rgba(6,10,13,.82),rgba(6,10,13,.30) 40%,transparent 68%)}figure,body[data-chapter=make] figure{left:10vw;right:auto;top:41vh;width:80vw;height:51vh}body[data-chapter=system] h1,body[data-chapter=pattern] h1,body[data-chapter=make] h1,body[data-chapter=validation] h1{font-size:9vw}body[data-chapter=credits] .copy{top:auto;bottom:8vh}.status{bottom:17px;font-size:9px}}
</style></head><body><div id="stage"></div><div class="scrim"></div><header><span>FORM / SYSTEM / MAKE</span><span>LOCAL CAMERA REVIEW</span></header><section class="copy"><p class="eyebrow"></p><h1></h1><p class="description"></p></section><figure hidden><img alt="Local thesis source evidence"></figure><div class="status"></div><script src="/review.js"></script></body></html>`;
files.set('/', [html, 'text/html']);
const server = createServer((req, res) => { const item = req.method === 'GET' ? files.get(new URL(req.url, 'http://127.0.0.1').pathname) : null; if (!item) { res.writeHead(404).end(); return; } res.writeHead(200, { 'Content-Type': item[1], 'Cache-Control': 'no-store' }).end(item[0]); });
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const { chromium } = fromProject('@playwright/test'); let browser; const captures = [], errors = [];
try {
  browser = await chromium.launch({ headless: true, executablePath });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  page.on('pageerror', error => errors.push(error.message)); await page.goto(origin); await page.waitForFunction(() => window.__cinematicReview?.ready, {}, { timeout: 30000 });
  async function capture(name, u, pointer = { x: 0, y: 0 }, reducedMotion = false) {
    const state = await page.evaluate(args => window.__cinematicReview.setView(...args), [u, pointer, reducedMotion]);
    await page.waitForFunction(() => [...document.images].every(img => !img.src || img.complete));
    const target = path.join(output, 'shots', name + '.png'); await page.screenshot({ path: target });
    captures.push({ file: `shots/${name}.png`, ...state, sha256: createHash('sha256').update(await readFile(target)).digest('hex') });
  }
  for (let i = 0; i < 7; i++) await capture(`desktop-${i}`, (i + 0.5) / 7);
  for (let i = 1; i < 7; i++) await capture(`transition-${i}`, i / 7);
  await capture('pointer-left', 0.5 / 7, { x: -1, y: -1 }); await capture('pointer-right', 0.5 / 7, { x: 1, y: 1 });
  await capture('reduced-motion', 0.5 / 7, { x: 1, y: 1 }, true);
  await page.setViewportSize({ width: 390, height: 844 });
  for (let i = 0; i < 7; i++) await capture(`mobile-${i}`, (i + 0.5) / 7);
  const frameCount = await page.evaluate(() => window.__cinematicReview.state().frames); await page.waitForTimeout(300);
  if (frameCount !== await page.evaluate(() => window.__cinematicReview.state().frames)) throw new Error('Camera rendered at rest');
  if (errors.length) throw new Error(errors.join('\n'));
  const report = { capturedAt: new Date().toISOString(), modelSHA256, renderer: 'Pinned Chromium / Three.js; independent composition fixture, not the integrated page', cameraModule: 'roles/animation-cinematographer/src/bending-active/cinematic-plan.mjs', frameCount, idleVerified: true, errors, captures };
  await writeFile(path.join(output, 'captures.json'), JSON.stringify(report, null, 2) + '\n');
  await writeFile(path.join(output, 'index.html'), `<!doctype html><html lang="en"><head><meta name="robots" content="noindex,nofollow"><title>Cinematic camera contact sheet</title><style>body{background:#10161a;color:#eee;font:15px system-ui}main{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}figure{margin:0}img{width:100%;display:block}figcaption{padding:8px}</style></head><body><h1>Real model · cinematic camera review</h1><p>Independent HTML overlay fixture; geometry revision ${modelSHA256}.</p><main>${captures.map(c => `<figure><a href="${c.file}"><img src="${c.file}" alt="${c.pose.chapter.id} cinematic composition"></a><figcaption>${c.file} · u ${c.u.toFixed(3)}</figcaption></figure>`).join('')}</main></body></html>`);
  console.log(JSON.stringify({ captures: captures.length, output, modelSHA256 }, null, 2));
} finally { if (browser) await browser.close(); await new Promise(resolve => server.close(resolve)); }
