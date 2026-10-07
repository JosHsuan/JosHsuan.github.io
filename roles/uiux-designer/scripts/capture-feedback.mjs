import { createRequire } from 'node:module';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { executablePath } from './browser-path.mjs';
const role = fileURLToPath(new URL('../', import.meta.url));
const { chromium, expect } = createRequire(path.resolve(role, '../../package.json'))('@playwright/test');
const browser = await chromium.launch({ executablePath });
try {
  const page = await browser.newPage({ viewport: { width: 760, height: 1000 } });
  const manifest = JSON.parse(await readFile(path.join(role, 'catalog/previews.manifest.json'), 'utf8')).filter(r => !r.materialId.startsWith('feedback-'));
  for (const [variant, action, pose] of [
    ['type', 'Fan the word planes', 'Three word planes fanned; no focused word'],
    ['glyph', 'Open mechanism', 'FORM gimbal open'],
    ['key', 'Toggle surface representation', 'Surface selected; key at rest'],
    ['card', 'Inspect layers', 'Rule, drawing and label layers separated'],
    ['navigation', 'SYSTEM', 'SYSTEM section selected'],
    ['panel', 'Open detail panel', 'Two hinged covers open; normal document details visible'],
    ['assembly', 'Enable 3D', 'Actual WebGL, score at 2.4 seconds, rib 5 selected, default inspection turn'],
  ]) {
    const id = `feedback-${variant}`;
    await page.goto(`http://127.0.0.1:4175/specimen.html?id=${id}`);
    await page.getByRole('button', { name: action, exact: true }).click();
    if (variant === 'assembly') {
      await expect(page.locator('.assembly-stage')).toHaveAttribute('data-ready', 'true');
      await page.getByRole('button', { name: 'Open inspection pose', exact: true }).click();
      await expect(page.locator('.assembly-stage')).toHaveAttribute('data-progress', '1.0000');
      await page.getByRole('button', { name: 'R05', exact: true }).click();
    }
    await page.mouse.move(4, 4); await page.locator('h1').click();
    await expect.poll(async () => { const before = await page.locator('.stage').evaluate(e => e.innerHTML); await page.waitForTimeout(120); return await page.locator('.stage').evaluate(e => e.innerHTML) === before; }, { timeout: 8000 }).toBe(true);
    await page.evaluate(() => document.fonts.ready);
    const file = `assets/previews/${id}.png`; await page.locator('.stage').screenshot({ path: path.join(role, file) });
    const bytes = await readFile(path.join(role, file));
    manifest.push({ materialId: id, kind: 'original-preview', path: file, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex'), revision: 'uiux-spatial-feedback-v1', license: 'Project-original specimen; no distribution license assigned', retrievedAt: '2026-10-07', provenance: `Actual Chromium local specimen capture, 760px viewport. ${pose}.` });
  }
  await writeFile(path.join(role, 'catalog/previews.manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
} finally { await browser.close(); }
console.log('Captured seven actual spatial feedback poses. Run write-catalog and build to include them.');
