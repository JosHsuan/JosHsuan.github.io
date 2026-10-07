import { createRequire } from 'node:module';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { executablePath } from './browser-path.mjs';
const role = fileURLToPath(new URL('../', import.meta.url));
const { chromium, expect } = createRequire(path.resolve(role, '../../package.json'))('@playwright/test');
const browser = await chromium.launch({ executablePath }); const results = [];
const assert = (value, message) => { if (!value) throw new Error(message); results.push(message); };
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true }); const page = await context.newPage(); const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('http://127.0.0.1:4175/specimen.html?id=feedback-assembly');
  await page.getByRole('button', { name: 'Enable 3D', exact: true }).click(); await expect(page.locator('.assembly-stage')).toHaveAttribute('data-ready', 'true');
  await page.getByRole('button', { name: 'Open inspection pose' }).click(); await expect(page.locator('.assembly-stage')).toHaveAttribute('data-progress', '1.0000');
  const canvas = page.locator('canvas'), box = await canvas.boundingBox(); let selected = -1;
  for (const y of [.45, .55, .35, .65]) { for (const x of [.5, .45, .55, .4, .6]) {
    await page.mouse.click(box.x + box.width * x, box.y + box.height * y);
    selected = Number(await page.locator('.assembly-stage').getAttribute('data-selected') ?? -1); if (selected >= 0) break;
  } if (selected >= 0) break; }
  assert(selected >= 0, 'Actual canvas raycast click selects a visible rib');
  await expect(page.getByRole('button', { name: `R${String(selected + 1).padStart(2, '0')}`, exact: true })).toHaveAttribute('aria-pressed', 'true');
  assert((await page.locator('.assembly-reading').textContent()).includes('selected'), 'Canvas selection updates ordinary controls and reading');
  await page.mouse.move(5, 5);
  await page.getByRole('button', { name: 'Play spatial score' }).click(); await expect(page.locator('.specimen-status')).toContainText('completed', { timeout: 9000 });
  await expect(page.locator('.assembly-stage')).toHaveAttribute('data-progress', '0.0000');
  assert(await page.locator('.assembly-stage').getAttribute('data-camera') === '4.800,3.200,6.800', 'Actual complete Theatre playback returns to authored camera and compact pose');
  await canvas.evaluate(element => { const gl = element.getContext('webgl2'); const extension = gl.getExtension('WEBGL_lose_context'); if (!extension) throw new Error('No context-loss test extension'); extension.loseContext(); });
  await expect(page.locator('canvas')).toHaveCount(0); await expect(page.locator('.assembly-stage svg')).toBeVisible();
  await page.getByRole('button', { name: 'R09', exact: true }).click(); assert((await page.locator('.assembly-reading').textContent()).includes('R09 selected'), 'Real WebGL context loss falls back to selectable static projection');
  await page.getByRole('button', { name: 'Retry 3D' }).click(); await expect(page.locator('.assembly-stage')).toHaveAttribute('data-ready', 'true'); results.push('Renderer remount after context loss succeeds');
  await page.goto('http://127.0.0.1:4175/specimen.html?id=feedback-key'); const key = page.locator('.depth-key'); await key.waitFor(); const b = await key.boundingBox();
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await page.mouse.down(); await page.mouse.move(5, 5); await page.mouse.up();
  await expect(key).toHaveAttribute('aria-pressed', 'false'); results.push('Press followed by release outside the stable key hit region does not activate');
  await page.emulateMedia({ reducedMotion: 'reduce' }); await page.goto('http://127.0.0.1:4175/specimen.html?id=feedback-assembly');
  await expect(page.getByRole('button', { name: 'Play spatial score' })).toBeDisabled(); results.push('OS reduced-motion preference disables narrative playback without a query flag'); await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('http://127.0.0.1:4175/?collection=spatial-feedback'); await expect(page.locator('.material')).toHaveCount(7);
  await page.locator('[data-material=feedback-card]').getByRole('button', { name: 'Save', exact: true }).click();
  await page.locator('[data-material=feedback-card]').getByRole('button', { name: 'Open specimen', exact: true }).click();
  const frame = page.frameLocator('#detail iframe'); await frame.getByRole('button', { name: 'Inspect layers', exact: true }).click();
  await page.locator('.review-note').fill('Spatial layers: candidate for the Lab index.');
  await page.getByRole('button', { name: 'Close', exact: true }).click(); await expect(page.locator('#detail iframe')).toHaveCount(0);
  await page.reload(); await expect(page.locator('#saved-count')).toHaveText('1');
  const download = page.waitForEvent('download'); await page.getByRole('button', { name: 'Export discussion choices' }).click();
  const downloaded = await download; const stream = await downloaded.createReadStream(); let json = ''; for await (const chunk of stream) json += chunk;
  const review = JSON.parse(json); assert(review.saved[0].id === 'feedback-card' && review.saved[0].note.includes('Lab index'), 'New proposal Save, notes, reload and actual JSON export preserve the chosen feedback study');
  for (const id of ['feedback-card', 'feedback-assembly']) await page.locator(`[data-material=${id}]`).getByRole('button', { name: 'Compare', exact: true }).click();
  await page.locator('#compare-open').click(); await expect(page.locator('#compare .compare-column')).toHaveCount(2); await expect(page.locator('#compare iframe, #compare canvas')).toHaveCount(0); results.push('Comparison shows two captured stills without live canvases');
  await page.getByRole('button', { name: 'Close comparison' }).click();
  await page.locator('[data-material=feedback-assembly]').getByRole('button', { name: 'Open specimen', exact: true }).click();
  await frame.getByRole('button', { name: 'Enable 3D', exact: true }).click(); await expect(frame.locator('.assembly-stage')).toHaveAttribute('data-ready', 'true');
  await page.getByRole('button', { name: 'Close', exact: true }).click(); await expect(page.locator('#detail iframe')).toHaveCount(0); results.push('Closing the native detail dialog removes the live scene iframe');
  for (const width of [320, 390, 768, 1440]) { await page.setViewportSize({ width, height: 1000 }); assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `Collection has no horizontal overflow at ${width}px`); }
  await page.screenshot({ path: path.join(role, 'verification/screenshots/spatial-collection.png'), fullPage: true });
  assert(errors.length === 0, 'No unhandled browser errors in resilience and review flows');
  await context.close();
} finally { await browser.close(); }
await writeFile(path.join(role, 'verification/spatial-resilience-results.json'), JSON.stringify({ checkedAt: new Date().toISOString(), browser: 'Chromium headless shell / desktop', checks: results }, null, 2) + '\n');
console.log(results.join('\n'));
