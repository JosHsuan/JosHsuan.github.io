import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { executablePath } from './browser-path.mjs';
const role = fileURLToPath(new URL('../', import.meta.url));
const { chromium, devices, expect } = createRequire(path.resolve(role, '../../package.json'))('@playwright/test');
await mkdir(path.join(role, 'verification/screenshots'), { recursive: true });
const browser = await chromium.launch({ executablePath });
try {
  const context = await browser.newContext({ ...devices['Pixel 7'], viewport: { width: 390, height: 844 } }); const page = await context.newPage();
  for (const [id, name] of [['icons-lucide', 'Inspect aperture'], ['ui-command', 'Filled'], ['motion-linework', undefined], ['motion-theatre', 'Inspect section 5'], ['spatial-hatch', 'Band 3'], ['spatial-ascii', undefined]]) {
    await page.goto(`http://127.0.0.1:4175/specimen.html?id=${id}`); await expect(page.getByRole('combobox', { name: 'Feedback', exact: true })).toBeVisible();
    if (id === 'motion-theatre') await expect(page.getByRole('button', { name: 'Replay authored sequence' })).toBeEnabled();
    if (name) await page.getByRole('button', { name, exact: true }).tap();
    if (id === 'spatial-hatch') { await page.getByRole('button', { name: 'Enable 3D', exact: true }).tap(); await expect(page.locator('.specimen-status')).toContainText('3D ready'); }
    await expect(page.locator('.stage')).toHaveAttribute('data-moving', 'false'); await page.locator('h1').tap(); await page.screenshot({ path: path.join(role, `verification/screenshots/applied-touch-${id}.png`), fullPage: true });
  }
  await context.close();
} finally { await browser.close(); }
console.log('Captured six actual touch-emulated layouts for visual inspection.');
