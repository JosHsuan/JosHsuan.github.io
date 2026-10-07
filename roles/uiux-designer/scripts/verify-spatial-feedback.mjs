import { createRequire } from 'node:module';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { executablePath } from './browser-path.mjs';
const role = fileURLToPath(new URL('../', import.meta.url));
const { chromium, webkit, expect, devices } = createRequire(path.resolve(role, '../../package.json'))('@playwright/test');
const only = process.argv[2];
const materials = JSON.parse(await readFile(path.join(role, 'catalog/materials.json'), 'utf8')).materials.filter(m => m.collection === 'spatial-feedback-v1' && (!only || m.id === `feedback-${only}`));
if (!materials.length) throw new Error('No matching spatial feedback specimens');
const output = path.join(role, 'verification/screenshots'); await mkdir(output, { recursive: true });
const results = []; const assert = (value, message) => { if (!value) throw new Error(message); };
async function settle(page, selector = '.feedback-stage') { await expect(page.locator(selector)).toHaveAttribute('data-scheduler', 'idle', { timeout: 8000 }); }
async function setSlider(page, name, value) { await page.getByRole('slider', { name, exact: true }).evaluate((element, next) => { element.value = String(next); element.dispatchEvent(new Event('input', { bubbles: true })); }, value); }
for (const [name, type, options] of [
  ['chromium-desktop', chromium, { viewport: { width: 1280, height: 1000 } }],
  ['webkit-desktop', webkit, { viewport: { width: 1280, height: 1000 } }],
  ['chromium-touch', chromium, { ...devices['Pixel 7'] }],
]) {
  const browser = await type.launch(type === chromium ? { executablePath } : {});
  const context = await browser.newContext(options); const page = await context.newPage(); const errors = [], external = [];
  page.on('pageerror', error => errors.push(error.message)); page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('request', request => { if (!request.url().startsWith('http://127.0.0.1:4175/') && !request.url().startsWith('data:')) external.push(request.url()); });
  try {
    for (const material of materials) {
      await page.goto(`http://127.0.0.1:4175/specimen.html?id=${material.id}`);
      await page.getByRole('heading', { name: material.name, exact: true }).waitFor();
      if (material.variant === 'type') {
        const initial = await page.locator('.type-plane').first().evaluate(e => e.style.transform);
        await page.getByRole('button', { name: 'Fan the word planes' }).click(); await settle(page);
        assert(await page.locator('.type-plane').first().evaluate(e => e.style.transform) !== initial, `${name} type fan changes transform`);
        await page.getByRole('button', { name: 'Inspect SYSTEM', exact: true }).focus(); await page.keyboard.press('Enter'); await expect(page.locator('.specimen-status')).toContainText('SYSTEM selected');
      } else if (material.variant === 'glyph') {
        await page.getByRole('button', { name: 'Open mechanism' }).click(); await settle(page);
        const initial = await page.locator('.mechanism-part').first().evaluate(e => e.style.transform);
        await page.getByRole('combobox', { name: 'Object logic' }).selectOption('system');
        await expect(page.locator('.mechanism')).toHaveAttribute('data-mode', 'system');
        assert(await page.locator('.mechanism-part').first().evaluate(e => e.style.transform) !== initial, `${name} mechanism changes local axes`);
        await page.getByRole('combobox', { name: 'Object logic' }).selectOption('make'); await expect(page.locator('.mechanism')).toHaveAttribute('data-mode', 'make');
      } else if (material.variant === 'key') {
        const key = page.getByRole('button', { name: 'Toggle surface representation' });
        await key.focus(); await page.keyboard.press('Space'); await expect(key).toHaveAttribute('aria-pressed', 'true'); await expect(page.locator('.key-result')).toHaveAttribute('data-filled', 'true');
        await page.keyboard.press('Enter'); await expect(key).toHaveAttribute('aria-pressed', 'false');
        if (options.hasTouch) { await key.tap(); await expect(key).toHaveAttribute('aria-pressed', 'true'); }
        else { const b = await key.boundingBox(); await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await page.mouse.down(); await settle(page); const pressedTransform = await page.locator('.key-cap').evaluate(e => e.style.transform); await key.dispatchEvent('pointercancel', { pointerId: 1 }); await page.mouse.up(); await settle(page); assert(await page.locator('.key-cap').evaluate(e => e.style.transform) !== pressedTransform, `${name} cancelled press releases depth; pressed=${pressedTransform}; released=${await page.locator('.key-cap').evaluate(e => e.style.transform)}`); }
      } else if (material.variant === 'card') {
        if (options.hasTouch) await page.getByRole('button', { name: 'Inspect the layered specimen' }).tap(); else await page.getByRole('button', { name: 'Inspect layers', exact: true }).click();
        await settle(page); await expect(page.getByRole('button', { name: 'Inspect the layered specimen' })).toHaveAttribute('aria-pressed', 'true');
        assert((await page.locator('.card-layer').last().evaluate(e => e.style.transform)).includes('86px'), `${name} card layer separates in z`);
      } else if (material.variant === 'navigation') {
        await page.getByRole('button', { name: 'SYSTEM', exact: true }).focus(); await page.keyboard.press('Enter');
        await expect(page.locator('.rail-content h2')).toHaveText('SYSTEM'); await page.getByRole('button', { name: 'Next section' }).click(); await expect(page.locator('.rail-content h2')).toHaveText('MAKE'); await settle(page);
      } else if (material.variant === 'panel') {
        await expect(page.locator('#hinge-details')).toBeHidden(); await page.getByRole('button', { name: 'Open detail panel' }).click();
        await expect(page.locator('#hinge-details')).toBeVisible(); await settle(page); await expect(page.getByRole('button', { name: 'Close detail panel' })).toHaveAttribute('aria-expanded', 'true');
        await page.getByRole('button', { name: 'Close detail panel' }).click(); await expect(page.locator('#hinge-details')).toBeHidden(); await page.getByRole('button', { name: 'Open detail panel' }).click(); await settle(page);
      } else if (material.demo === 'assembly') {
        await page.getByRole('status').filter({ hasText: 'Score ready' }).waitFor();
        await page.getByRole('button', { name: 'R03', exact: true }).click(); await expect(page.locator('.assembly-reading')).toContainText('R03 selected');
        await page.getByRole('button', { name: 'Enable 3D', exact: true }).click(); await expect(page.locator('.assembly-stage')).toHaveAttribute('data-ready', 'true');
        await page.getByRole('button', { name: 'Open inspection pose' }).click(); await expect(page.locator('.assembly-stage')).toHaveAttribute('data-progress', '1.0000');
        await page.getByRole('button', { name: 'R07', exact: true }).click(); await expect(page.locator('.assembly-stage')).toHaveAttribute('data-selected', '6'); await settle(page, '.assembly-stage');
        await page.getByRole('button', { name: 'Play spatial score' }).click();
        await expect.poll(() => page.locator('.assembly-stage').getAttribute('data-progress')).not.toBe('1.0000');
        await page.getByRole('button', { name: 'Pause', exact: true }).click();
        const paused = await page.locator('.assembly-stage').getAttribute('data-camera');
        await setSlider(page, 'Inspection turn / degrees', 45); await settle(page, '.assembly-stage');
        assert(await page.locator('.assembly-stage').getAttribute('data-camera') === paused, `${name} inspection does not fight story camera`);
        await expect(page.locator('.assembly-stage')).toHaveAttribute('data-yaw', '0.7854');
        await page.getByRole('button', { name: 'Reset', exact: true }).click(); await settle(page, '.assembly-stage'); await expect(page.locator('.assembly-stage')).toHaveAttribute('data-progress', '0.0000'); await expect(page.locator('.assembly-stage')).toHaveAttribute('data-selected', '-1');
        await expect.poll(async () => { const before = await page.locator('.assembly-stage').getAttribute('data-frames'); await page.waitForTimeout(200); return await page.locator('.assembly-stage').getAttribute('data-frames') === before; }, { timeout: 5000, message: `${name} WebGL returns to idle` }).toBe(true);
        await page.getByRole('button', { name: 'Open inspection pose' }).click(); await expect(page.locator('.assembly-stage')).toHaveAttribute('data-progress', '1.0000');
      }
      if (material.demo === 'feedback') {
        await page.getByRole('combobox', { name: 'Response character' }).selectOption('elastic');
        const action = page.locator('.controls button').first(); await action.click(); await action.click(); await action.click(); await settle(page);
        await setSlider(page, 'Perspective / px', 450); await expect(page.locator('.feedback-stage')).toHaveCSS('--perspective', '450px');
      }
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1); assert(!overflow, `${name} ${material.id} no horizontal overflow`);
      await page.screenshot({ path: path.join(output, `${name}-${material.id}.png`), fullPage: true });
      if (material.demo === 'assembly') { await page.getByRole('button', { name: 'Use diagram', exact: true }).click(); await expect(page.locator('canvas')).toHaveCount(0); await expect(page.locator('.assembly-stage svg')).toBeVisible(); }
      results.push({ browser: name, id: material.id, reduced: false, passed: true });
      await page.goto(`http://127.0.0.1:4175/specimen.html?id=${material.id}&motion=reduce`);
      await page.getByRole('heading', { name: material.name, exact: true }).waitFor();
      if (material.demo === 'feedback') {
        await expect(page.getByRole('combobox', { name: 'Response character' })).toHaveCount(0);
        await page.locator('.controls button').first().click(); await expect(page.locator('.feedback-stage')).toHaveAttribute('data-scheduler', 'idle');
        if (material.variant === 'card') { const before = await page.locator('.card-rig').evaluate(e => e.style.transform); await page.locator('.card-hit').dispatchEvent('pointermove', { pointerType: 'mouse', clientX: 20, clientY: 30 }); assert(await page.locator('.card-rig').evaluate(e => e.style.transform) === before, 'reduced pointer tilt disabled'); }
      } else {
        await expect(page.getByRole('button', { name: 'Play spatial score' })).toBeDisabled();
        await page.getByRole('button', { name: 'Enable 3D', exact: true }).click(); await expect(page.locator('.assembly-stage')).toHaveAttribute('data-ready', 'true');
        await page.getByRole('button', { name: 'Open inspection pose' }).click(); await expect(page.locator('.assembly-stage')).toHaveAttribute('data-progress', '1.0000');
        await page.getByRole('button', { name: 'R04', exact: true }).click(); await expect(page.locator('.assembly-stage')).toHaveAttribute('data-selected', '3'); await settle(page, '.assembly-stage');
      }
      results.push({ browser: name, id: material.id, reduced: true, passed: true });
      console.log(`${name}: ${material.id} normal + reduced passed`);
    }
    assert(errors.length === 0, `${name} browser errors: ${errors.join('; ')}`); assert(external.length === 0, `${name} external requests`);
  } finally { await context.close(); await browser.close(); }
}
await writeFile(path.join(role, `verification/spatial-feedback${only ? `-${only}` : ''}-results.json`), JSON.stringify({ checkedAt: new Date().toISOString(), scope: `${materials.length} spatial feedback studies; normal and reduced motion; actual controls and true WebGL assembly`, results }, null, 2) + '\n');
console.log(`Passed ${results.length} spatial feedback checks.`);
