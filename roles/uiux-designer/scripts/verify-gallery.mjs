import { createRequire } from 'node:module';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const role = fileURLToPath(new URL('../', import.meta.url)); const project = path.resolve(role, '../..');
const { chromium, webkit, expect } = createRequire(path.join(project, 'package.json'))('@playwright/test');
const catalog = JSON.parse(await readFile(path.join(role, 'catalog/materials.json'), 'utf8'));
await mkdir(path.join(role, 'verification/screenshots'), { recursive: true });
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const results = [];
for (const [name, browserType, viewport] of [['chromium-desktop', chromium, { width: 1440, height: 1000 }], ['webkit-desktop', webkit, { width: 1280, height: 900 }], ['chromium-mobile-emulation', chromium, { width: 390, height: 844 }]]) {
  const browser = await browserType.launch(); const context = await browser.newContext({ viewport, acceptDownloads: true }); const page = await context.newPage();
  const errors = []; const external = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('request', request => { if (!request.url().startsWith('http://127.0.0.1:4175/') && !request.url().startsWith('data:')) external.push(request.url()); });
  await page.goto('http://127.0.0.1:4175/');
  await page.waitForFunction(count => document.querySelectorAll('.material').length === count, catalog.materials.length);
  await page.keyboard.press('Tab'); assert(await page.getByRole('link', { name: 'Skip to materials' }).evaluate(node => node === document.activeElement), `${name}: skip focus`);
  await page.keyboard.press('Enter'); assert(await page.locator('#materials').evaluate(node => node === document.activeElement), `${name}: main focus`);
  await page.screenshot({ path: path.join(role, `verification/screenshots/${name}-gallery.png`), fullPage: true });
  await page.keyboard.press('/'); assert(await page.locator('#search').evaluate(node => node === document.activeElement), `${name}: search shortcut`);
  await page.locator('#search').fill('Plex'); assert(await page.locator('.material').count() === 2, `${name}: real filter`); await page.locator('#search').fill('');
  let checked = 0;
  for (const material of catalog.materials) {
    const card = page.locator(`[data-material="${material.id}"]`);
    await card.getByRole('button', { name: 'Open specimen', exact: true }).click();
    const frame = page.frameLocator('#detail iframe');
    await frame.getByRole('heading', { name: material.name, exact: true, level: 1 }).waitFor();
    if (material.demo === 'font') {
      await frame.getByRole('status').filter({ hasText: 'Local font loaded' }).waitFor();
      await frame.getByRole('textbox', { name: 'Specimen text' }).fill('Rule / system / 0123');
      assert(await frame.locator('.font-display').textContent() === 'Rule / system / 0123', `${name}: text specimen`);
      await frame.getByRole('slider', { name: 'Size / px' }).focus(); await page.keyboard.press('End');
      assert(await frame.locator('.font-display').evaluate(node => getComputedStyle(node).fontSize) === '72px', `${name}: font size control`);
    } else if (material.demo === 'icons') {
      assert(await frame.locator('.masked-icon').count() === 12, `${name}: actual icon count`);
      await frame.getByRole('slider', { name: 'Size / px' }).focus(); await page.keyboard.press('End');
      assert(await frame.locator('.masked-icon').first().evaluate(node => node.getBoundingClientRect().width) === 64, `${name}: icon size control`);
    } else if (material.demo === 'glyphs') {
      assert(await frame.locator('.specimen-glyphs img').count() === 3, `${name}: original glyphs`);
    } else if (material.demo === 'palette') {
      await frame.getByRole('button', { name: 'Raised surface' }).click(); assert((await frame.getByRole('status').textContent()).includes('#14181d'), `${name}: palette context`);
    } else if (material.demo === 'focus') {
      await frame.getByRole('button', { name: 'Lab', exact: true }).click(); assert(await frame.getByRole('button', { name: 'Lab', exact: true }).getAttribute('aria-pressed') === 'true', `${name}: navigation selected state`);
    } else if (material.demo === 'command') {
      await frame.getByRole('button', { name: 'Open commands' }).click();
      await frame.getByRole('textbox', { name: 'Command', exact: true }).fill('view filled'); await page.keyboard.press('Enter');
      assert(await frame.locator('.outline-figure').evaluate(node => node.classList.contains('filled')), `${name}: shared command state`);
      await frame.getByRole('textbox', { name: 'Command', exact: true }).fill('inspect'); await page.keyboard.press('Enter');
      assert((await frame.locator('.command-status').textContent()).includes('Unavailable'), `${name}: contextual command truth`);
      await page.keyboard.press('Escape');
      await expect(frame.getByRole('button', { name: 'Open commands' })).toBeFocused();
    } else if (material.demo === 'reveal') {
      await frame.getByRole('button', { name: 'Play reveal' }).click(); await frame.getByRole('status').filter({ hasText: 'complete' }).waitFor();
      await frame.getByRole('button', { name: 'Reset', exact: true }).click();
    } else if (material.demo === 'trace') {
      await frame.getByRole('slider', { name: 'Manual progress / %' }).focus(); await page.keyboard.press('Home');
      assert(Number(await frame.locator('path').evaluate(node => getComputedStyle(node).strokeDashoffset.replace('px', ''))) > 0, `${name}: actual path changed`);
      await frame.getByRole('button', { name: 'Replay trace' }).click(); await frame.getByRole('status').filter({ hasText: 'Complete outline' }).waitFor();
    } else if (material.demo === 'reflow') {
      const before = await frame.locator('.part-block').first().evaluate(node => getComputedStyle(node).transform);
      await frame.getByRole('button', { name: 'Separated', exact: true }).click(); await frame.getByRole('status').filter({ hasText: 'Separated reading.' }).waitFor();
      assert(await frame.locator('.part-block').first().evaluate(node => getComputedStyle(node).transform) !== before, `${name}: actual GSAP movement`);
    } else if (material.demo === 'theatre') {
      await frame.getByRole('status').filter({ hasText: 'Theatre Core ready' }).waitFor();
      await frame.getByRole('slider', { name: 'Manual sequence position / %' }).focus(); await page.keyboard.press('Home');
      for (let i = 0; i < 50; i++) await page.keyboard.press('ArrowRight');
      assert((await frame.locator('.value').first().textContent()).includes('100%'), `${name}: actual exported midpoint`);
      await frame.getByRole('button', { name: 'Replay authored sequence' }).click(); await frame.getByRole('status').filter({ hasText: 'completed' }).waitFor({ timeout: 10000 });
      await frame.getByRole('button', { name: 'Reset', exact: true }).click();
    } else if (['wirefield', 'hatch'].includes(material.demo)) {
      const before = await frame.getByRole('img').innerHTML(); await frame.getByRole('slider', { name: 'Amplitude', exact: true }).focus(); await page.keyboard.press('End');
      assert(await frame.getByRole('img').innerHTML() !== before, `${name}: actual parametric diagram`);
      await frame.getByRole('button', { name: 'Enable 3D', exact: true }).click(); await frame.getByRole('status').filter({ hasText: '3D ready' }).waitFor();
      assert(await frame.locator('canvas').count() === 1, `${name}: actual canvas`);
      const initial = await frame.locator('canvas').screenshot(); await frame.getByRole('button', { name: 'Rotate right' }).click();
      assert(!(await frame.locator('canvas').screenshot()).equals(initial), `${name}: camera inspection`);
      if (material.demo === 'hatch') { await frame.getByRole('slider', { name: 'Hatch density', exact: true }).focus(); await page.keyboard.press('End'); await frame.getByRole('button', { name: 'Surface', exact: true }).click(); await frame.getByRole('button', { name: 'Hatch', exact: true }).click(); }
      await page.screenshot({ path: path.join(role, `verification/screenshots/${name}-${material.demo}.png`) });
      await frame.getByRole('button', { name: 'Use diagram', exact: true }).click(); assert(await frame.locator('canvas').count() === 0, `${name}: canvas disposal`);
    } else if (material.demo === 'ascii') {
      const before = await frame.locator('.ascii-art').textContent(); await frame.getByRole('slider', { name: 'Phase / radians' }).focus(); await page.keyboard.press('End'); assert(await frame.locator('.ascii-art').textContent() !== before, `${name}: actual ASCII calculation`);
    }
    for (const file of [...material.assets, ...material.notices]) assert((await page.request.get(`http://127.0.0.1:4175/${file}`)).status() === 200, `${name}: source file missing ${file}`);
    for (const file of material.sourceFiles) assert((await page.request.get(`http://127.0.0.1:4175/samples/${file}`)).status() === 200, `${name}: reusable source missing ${file}`);
    await page.getByRole('button', { name: 'Close', exact: true }).click();
    await page.waitForFunction(() => !document.querySelector('#detail').open);
    await page.waitForFunction(() => !document.querySelector('#detail iframe'));
    assert(await page.locator('#detail iframe').count() === 0, `${name}: closed specimen still active`);
    checked++;
  }
  const plex = page.locator('[data-material="font-plex-sans"]');
  await plex.getByRole('button', { name: 'Save', exact: true }).click(); await plex.getByRole('button', { name: 'Compare', exact: true }).click();
  await page.locator('[data-material="font-inter"]').getByRole('button', { name: 'Compare', exact: true }).click();
  await page.locator('#compare-open').click(); await page.getByRole('heading', { name: 'IBM Plex Sans', exact: true }).last().waitFor();
  assert(await page.locator('.compare-column').count() === 2, `${name}: comparison`); await page.getByRole('button', { name: 'Close comparison' }).click();
  await plex.getByRole('button', { name: 'Open specimen', exact: true }).click(); await page.getByRole('textbox', { name: 'Discussion note for IBM Plex Sans' }).fill('Prefer this for body reading.');
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  const downloadPromise = page.waitForEvent('download'); await page.locator('#export-review').click(); const download = await downloadPromise; const downloadPath = await download.path(); const exported = JSON.parse(await readFile(downloadPath, 'utf8'));
  assert(exported.saved.some(item => item.id === 'font-plex-sans' && item.note.includes('Prefer')), `${name}: real review export`);
  await page.reload(); await page.waitForFunction(count => document.querySelectorAll('.material').length === count, catalog.materials.length); assert(await page.locator('#saved-count').textContent() === '1', `${name}: preference persistence`);
  await page.locator('#motion').selectOption('reduce'); await page.locator('[data-material="motion-theatre"]').getByRole('button', { name: 'Open specimen', exact: true }).click();
  const reducedFrame = page.frameLocator('#detail iframe'); await reducedFrame.getByRole('status').filter({ hasText: 'Reduced motion' }).waitFor(); assert(await reducedFrame.getByRole('button', { name: 'Replay authored sequence' }).isDisabled(), `${name}: reduced-motion playback`); await page.getByRole('button', { name: 'Close', exact: true }).click();
  for (const width of [320, 390, 768, 1440]) { await page.setViewportSize({ width, height: 900 }); assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${name}: overflow at ${width}`); }
  assert(errors.length === 0, `${name}: runtime errors ${errors.join(' | ')}`); assert(external.length === 0, `${name}: unexpected external preview request`);
  results.push({ browser: name, initialViewport: viewport, materialSpecimens: checked, result: 'PASS', runtimeErrors: errors.length, externalPreviewRequests: external.length, flows: ['filter', 'keyboard/skip', 'actual asset loading/downloads', 'first collection controls; second collection mount/source smoke (dedicated interaction report separately)', 'actual Studio replay/seek', 'real R3F/GLSL', 'comparison', 'notes/preferences', 'download export', 'reduced motion', 'responsive widths', 'closed-stage disposal'] });
  await context.close(); await browser.close();
  console.log(`${name}: ${checked} working specimens and review flows passed.`);
}
await writeFile(path.join(role, 'verification/gallery-results.json'), JSON.stringify({ date: '2026-10-07', role: 'uiux-designer', results }, null, 2) + '\n');
