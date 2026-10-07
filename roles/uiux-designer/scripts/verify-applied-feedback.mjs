import { createRequire } from 'node:module';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { executablePath } from './browser-path.mjs';
const role = fileURLToPath(new URL('../', import.meta.url));
const { chromium, webkit, devices, expect } = createRequire(path.resolve(role, '../../package.json'))('@playwright/test');
const catalog = JSON.parse(await readFile(path.join(role, 'catalog/materials.json'), 'utf8'));
const only = process.argv.find(arg => arg.startsWith('--material='))?.slice('--material='.length);
const materials = catalog.materials.filter(m => m.appliedFeedback && (!only || m.id === only)); const results = [], previews = [];
if (!materials.length) throw new Error('No matching applied material to verify');
await mkdir(path.join(role, 'assets/previews'), { recursive: true });
await mkdir(path.join(role, 'verification/screenshots'), { recursive: true });
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const range = (page, name, value) => page.getByRole('slider', { name, exact: true }).evaluate((input, value) => { input.value = String(value); input.dispatchEvent(new Event('input', { bubbles: true })); input.dispatchEvent(new Event('change', { bubbles: true })); }, value);
const style = locator => locator.evaluate(element => getComputedStyle(element).transform);
for (const [name, type, options] of [['chromium', chromium, { viewport: { width: 760, height: 1000 } }], ['webkit', webkit, { viewport: { width: 760, height: 1000 } }], ['touch', chromium, { ...devices['Pixel 7'], viewport: { width: 390, height: 844 } }]]) {
  const browser = await type.launch(type === chromium ? { executablePath } : {});
  try {
    for (const reduced of [false, true]) {
      const context = await browser.newContext({ ...options, reducedMotion: reduced ? 'reduce' : 'no-preference', acceptDownloads: true }); const page = await context.newPage(); const errors = [], external = [];
      page.on('pageerror', error => errors.push(error.message)); page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); }); page.on('request', request => { if (!/^(http:\/\/127\.0\.0\.1:4175\/|data:|blob:)/.test(request.url())) external.push(request.url()); });
      for (const material of materials) {
        const checks = []; let target, pose;
        await page.goto(`http://127.0.0.1:4175/specimen.html?id=${material.id}`);
        await expect(page.getByRole('heading', { name: material.name, exact: true })).toBeVisible();
        const mode = page.getByRole('combobox', { name: 'Feedback', exact: true }), stage = page.locator('.stage');
        await expect(mode).toHaveValue('spatial'); await expect(page.locator('body')).toHaveAttribute('data-reduce', String(reduced));
        if (material.demo === 'font') {
          const paragraph = await page.locator('.font-paragraph').textContent(); await page.getByRole('button', { name: 'Lift heading' }).click(); await expect(stage).toHaveAttribute('data-lift', '1.000'); target = page.locator('.type-word').first();
          assert(await page.locator('.font-paragraph').textContent() === paragraph, 'Body copy unchanged'); pose = 'Heading lifted; original default text and font'; checks.push('Word-local transforms with unchanged body text');
        } else if (material.demo === 'icons') {
          const button = page.locator('.icon-select').first(), box = await button.boundingBox();
          if (options.hasTouch) await button.tap(); else { await button.focus(); await page.keyboard.press('Space'); }
          await expect(button).toHaveAttribute('aria-pressed', 'true'); target = page.locator('.icon-rig').first();
          const after = await button.boundingBox(); assert(Math.abs(after.width - box.width) < .1 && Math.abs(after.height - box.height) < .1, 'Stable icon hit region');
          assert(await page.locator('.masked-icon').count() === 12, 'All 12 original icons retained');
          if (name === 'chromium' && !reduced) {
            const second = page.locator('.icon-select').nth(1), bounds = await second.boundingBox(); await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2); await page.mouse.down(); await page.mouse.move(2, 2); await page.mouse.up(); await expect(second).toHaveAttribute('aria-pressed', 'false'); checks.push('Release outside cancels activation');
            const pending = page.waitForEvent('download'); await page.locator('.icon-cell a').first().click(); const download = await pending; const bytes = await readFile(await download.path()); const original = await readFile(path.join(role, material.assets.find(file => file.endsWith('.svg')))); assert(bytes.equals(original), 'Downloaded original SVG bytes'); checks.push('Original SVG download verified byte-for-byte');
          }
          pose = 'First icon selected, pressure released'; checks.push('Actual glyph selection, keyboard/touch activation and stable button');
        } else if (material.demo === 'glyphs') {
          await page.getByRole('button', { name: 'Inspect SYSTEM', exact: true }).click(); target = page.locator('.glyph-rig').nth(1); await expect(page.locator('.specimen-status')).toContainText('connections'); pose = 'SYSTEM mark plate inspected'; checks.push('Original identity plate and explanation respond');
        } else if (material.demo === 'palette') {
          const before = await page.locator('.palette-chip p').allTextContents(); await page.getByRole('button', { name: 'Separate color plates' }).click(); target = page.locator('.palette-swatch').first(); assert(JSON.stringify(before) === JSON.stringify(await page.locator('.palette-chip p').allTextContents()), 'Contrast values unchanged'); pose = 'Color plates separated; measured pairings remain fixed'; checks.push('Swatch depth with unchanged measured contrast');
        } else if (material.demo === 'focus') {
          await page.getByRole('button', { name: 'Lab', exact: true }).click(); await expect(page.getByRole('button', { name: 'Lab', exact: true })).toHaveAttribute('aria-pressed', 'true'); target = page.locator('.detent-rig').nth(2); pose = 'Lab detent selected'; checks.push('Selected inner plate with native control');
        } else if (material.demo === 'command') {
          await page.getByRole('button', { name: 'Filled', exact: true }).click(); await expect(page.locator('.outline-figure')).toHaveClass(/filled/); target = page.locator('.command-face').last(); pose = 'Filled state; two separated faces'; checks.push('Real shared representation changes its spatial object');
        } else if (material.demo === 'reveal') {
          await range(page, 'Duration / ms', 1200); await page.getByRole('button', { name: 'Play reveal', exact: true }).click();
          if (!reduced) { await expect.poll(() => stage.getAttribute('data-aperture')).not.toBe('1.000'); await page.getByRole('button', { name: 'Pause', exact: true }).click(); const paused = await stage.getAttribute('data-aperture'); await page.waitForTimeout(120); assert(await stage.getAttribute('data-aperture') === paused, 'Hinge shares paused timeline'); await page.getByRole('button', { name: 'Play reveal', exact: true }).click(); await expect(page.locator('.specimen-status')).toContainText('complete'); }
          else await expect(page.locator('.specimen-status')).toContainText('Reduced motion');
          target = page.locator('.aperture-leaf').first(); pose = 'Reveal complete, both hinges open'; checks.push('Hinges follow actual reveal time; pause/replay or reduced direct state');
        } else if (material.demo === 'trace') {
          await range(page, 'Plane separation', .9); await range(page, 'Manual progress / %', 65); assert(Number(await page.locator('.trace-plane.drawing path').evaluate(p => getComputedStyle(p).strokeDashoffset.replace('px', ''))) > 0, 'Actual SVG trace progress'); target = page.locator('.trace-plane.drawing'); pose = 'Plane separation 0.9; actual trace at 65%'; checks.push('Independent construction planes and actual SVG stroke');
        } else if (material.demo === 'reflow') {
          await page.getByRole('button', { name: 'Separated', exact: true }).click(); if (!reduced) await expect(page.locator('.specimen-status')).toContainText('Separated reading.');
          const outer = await style(page.locator('.part-block').nth(2)); await page.getByRole('button', { name: 'Inspect part 3', exact: true }).click(); target = page.locator('.part-face').nth(2); await expect(stage).toHaveAttribute('data-moving', 'false'); assert(await style(page.locator('.part-block').nth(2)) === outer, 'Local inspection does not overwrite GSAP placement'); pose = 'Separated layout; part 3 inspected'; checks.push('GSAP placement and nested part inspection have distinct property owners');
        } else if (material.demo === 'theatre') {
          if (reduced) await expect(page.locator('.specimen-status')).toContainText('Reduced motion'); else await expect(page.getByRole('button', { name: 'Replay authored sequence' })).toBeEnabled();
          if (reduced) await expect(page.getByRole('button', { name: 'Replay authored sequence' })).toBeDisabled();
          await range(page, 'Manual sequence position / %', 50); await expect(page.locator('.value').first()).toContainText('100%');
          const outer = await page.locator('[data-section="4"]').evaluate(n => n.parentElement.getAttribute('transform')); await page.getByRole('button', { name: 'Inspect section 5', exact: true }).click(); target = page.locator('[data-section="4"]'); await expect(stage).toHaveAttribute('data-moving', 'false'); assert(await target.evaluate(n => n.parentElement.getAttribute('transform')) === outer, 'Theatre outer group unchanged by inspection');
          pose = 'Genuine authored midpoint; section 5 inspected'; checks.push('Actual exported midpoint plus independent nested selection');
        } else if (material.demo === 'ascii') {
          const full = await page.locator('.ascii-art').textContent(); await page.getByRole('button', { name: 'High', exact: true }).click(); assert(await page.locator('.ascii-art').textContent() !== full, 'Real height subset'); await expect(page.locator('.ascii-slice:not([hidden])')).toHaveCount(1); await page.getByRole('button', { name: 'All heights' }).click(); target = page.locator('.ascii-slice').last(); pose = 'All three actual height bands; separation 0.7'; checks.push('Actual generated samples partition into height ranges');
          await range(page, 'Columns', 64); assert(await stage.evaluate(stage => { const box = stage.getBoundingClientRect(); return [...stage.querySelectorAll('.ascii-slice pre')].every(pre => { const text = pre.getBoundingClientRect(); return text.top >= box.top && text.bottom <= box.bottom && text.left >= box.left && text.right <= box.right; }); }), 'All text rows and columns fit at maximum density'); await page.getByRole('button', { name: 'Reset', exact: true }).click(); await expect(page.getByRole('slider', { name: 'Columns', exact: true })).toHaveValue('44');
        } else {
          const before = await page.locator('svg').innerHTML(); await page.getByRole('button', { name: 'Band 3', exact: true }).click(); assert(await page.locator('svg').innerHTML() !== before, 'Selected band changes real SVG projection');
          await page.getByRole('button', { name: 'Enable 3D', exact: true }).click(); await expect(page.locator('.specimen-status')).toContainText('3D ready'); await expect(stage).toHaveAttribute('data-moving', 'false');
          assert(Number(await stage.getAttribute('data-deformation')) > .34, 'Actual geometry vertex lift'); const spatialImage = await page.locator('canvas').screenshot();
          await mode.selectOption('baseline'); await expect(stage).toHaveAttribute('data-deformation', '0.0000'); const baseImage = await page.locator('canvas').screenshot(); assert(!spatialImage.equals(baseImage), 'Rendered geometry changes between modes');
          await mode.selectOption('spatial'); await expect(stage).toHaveAttribute('data-moving', 'false'); await expect.poll(async () => { const frames = await stage.getAttribute('data-frames'); await page.waitForTimeout(220); return await stage.getAttribute('data-frames') === frames; }).toBe(true);
          if (name === 'chromium' && !reduced) {
            await page.getByRole('button', { name: 'Clear band', exact: true }).click(); const canvas = page.locator('canvas');
            for (const [x, y] of [[.5,.5],[.5,.4],[.4,.55],[.6,.5]]) { const box = await canvas.boundingBox(); await canvas.click({ position: { x: box.width * x, y: box.height * y } }); if (await stage.getAttribute('data-band') !== '-1') break; }
            assert(await stage.getAttribute('data-band') !== '-1', 'Actual raycast chooses band'); checks.push('Actual canvas raycast synchronizes numbered control');
            if (material.demo === 'hatch') { await canvas.evaluate(el => { const gl = el.getContext('webgl2') ?? el.getContext('webgl'); const ext = gl.getExtension('WEBGL_lose_context'); if (!ext) throw new Error('Context-loss extension unavailable'); ext.loseContext(); }); await expect(page.locator('canvas')).toHaveCount(0); await expect(page.locator('.specimen-status')).toContainText('unavailable'); await page.getByRole('button', { name: 'Retry 3D', exact: true }).click(); await expect(page.locator('.specimen-status')).toContainText('3D ready'); checks.push('Real WebGL context loss retains diagram and Retry remounts'); }
          }
          // Set a repeatable inspection pose for its source-tracked preview.
          if (await stage.getAttribute('data-band') !== '2') await page.getByRole('button', { name: 'Band 3', exact: true }).click(); await expect(stage).toHaveAttribute('data-moving', 'false');
          pose = 'Actual WebGL; band 3 lifted, default amplitude 0.65, angle 0.7, density 18'; checks.push('CPU vertex lift, rendered output, baseline comparison and idle rendering');
        }
        await expect(stage).toHaveAttribute('data-moving', 'false');
        if (name === 'chromium' && !reduced) {
          await page.evaluate(() => document.fonts.ready); await page.locator('h1').click(); const file = `assets/previews/applied-${material.id}.png`; await stage.screenshot({ path: path.join(role, file) }); const bytes = await readFile(path.join(role, file));
          previews.push({ materialId: material.id, kind: 'original-preview', path: file, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex'), revision: 'uiux-applied-feedback-v1', license: 'Project-authored specimen capture; underlying font/icon notices retained with material', retrievedAt: '2026-10-07', provenance: `Actual Chromium local capture at 760px viewport, Spatial mode. ${pose}.` });
        }
        if (target) { const spatial = material.demo === 'theatre' ? await target.getAttribute('transform') : await style(target); await mode.selectOption('baseline'); const baseline = material.demo === 'theatre' ? await target.getAttribute('transform') : await style(target); if (material.demo !== 'ascii') assert(spatial !== baseline, `${material.id} material-local depth changes`); else await expect(page.locator('.ascii-stack')).toHaveAttribute('data-mode', 'baseline'); await mode.selectOption('spatial'); }
        await page.setViewportSize({ width: 320, height: 850 }); assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${material.id} overflow at 320px`); await page.setViewportSize(options.viewport);
        assert(errors.length === 0, `${material.id}: ${errors.join('; ')}`); assert(external.length === 0, 'No external preview requests');
        results.push({ browser: name, reduced, id: material.id, checks: [...checks, 'Baseline/Spatial and narrow layout'], passed: true });
      }
      await page.goto('http://127.0.0.1:4175/?collection=applied-feedback'); await expect(page.locator('.material')).toHaveCount(19);
      await page.evaluate(() => localStorage.setItem('uiux-material-review-v1', JSON.stringify({ saved: ['icons-lucide', 'feedback-key'], notes: { 'icons-lucide': 'Synthetic Round 04 persistence check' } }))); await page.reload(); await expect(page.locator('#saved-count')).toHaveText('2'); await expect(page.locator('[data-material=icons-lucide]').getByRole('button', { name: 'Saved', exact: true })).toBeVisible();
      await page.locator('[data-material=icons-lucide]').getByRole('button', { name: 'Open specimen', exact: true }).click(); await page.frameLocator('#detail iframe').getByRole('combobox', { name: 'Feedback', exact: true }).selectOption('baseline'); await page.getByRole('button', { name: 'Close', exact: true }).click(); await expect(page.locator('#detail iframe')).toHaveCount(0); assert(JSON.parse(await page.evaluate(() => localStorage.getItem('uiux-material-review-v1'))).saved.length === 2, 'Comparison mode never changes Saved');
      console.log(`${name} ${reduced ? 'reduced' : 'normal'}: ${materials.length} applied material flows passed`); await context.close();
    }
  } finally { await browser.close(); }
}
const previous = JSON.parse(await readFile(path.join(role, 'catalog/previews.manifest.json'), 'utf8')).filter(item => !materials.some(material => material.id === item.materialId));
await writeFile(path.join(role, 'catalog/previews.manifest.json'), JSON.stringify([...previous, ...previews], null, 2) + '\n');
await writeFile(path.join(role, `verification/applied-feedback${only ? `-${only}` : ''}-results.json`), JSON.stringify({ checkedAt: new Date().toISOString(), materials: materials.length, configurations: 6, fixtures: 'Synthetic Saved data only; no owner preference inference', results }, null, 2) + '\n');
console.log(`Versioned ${materials.length} actual applied-material previews. Regenerate catalog and build.`);
