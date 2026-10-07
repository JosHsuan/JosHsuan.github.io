import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { executablePath } from './browser-path.mjs';
const role = fileURLToPath(new URL('../', import.meta.url));
const { chromium, webkit, devices, expect } = createRequire(path.resolve(role, '../../package.json'))('@playwright/test');
const screenshots = path.join(role, 'verification/screenshots'); await mkdir(screenshots, { recursive: true });
const results = [];
const fixture = { saved: ['feedback-card', 'feedback-key', 'feedback-navigation', 'feedback-assembly'], notes: { 'feedback-card': 'Verification fixture; this is not the owner’s actual selection.' } };
const assert = (value, message) => { if (!value) throw new Error(message); };
const setRange = (locator, value) => locator.evaluate((el, value) => { el.value = String(value); el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); }, value);
async function readDownload(download) { let text = ''; for await (const chunk of await download.createReadStream()) text += chunk; return text; }
for (const [name, type, options] of [['chromium', chromium, { viewport: { width: 1440, height: 1000 } }], ['webkit', webkit, { viewport: { width: 1366, height: 1000 } }], ['chromium-touch', chromium, { ...devices['Pixel 7'], viewport: { width: 390, height: 844 } }]]) {
  const browser = await type.launch(type === chromium ? { executablePath } : {}); const context = await browser.newContext({ ...options, acceptDownloads: true }); const page = await context.newPage(); const errors = [], external = [], checks = [];
  page.on('pageerror', error => errors.push(error.message)); page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); }); page.on('request', request => { if (!request.url().startsWith('http://127.0.0.1:4175/') && !request.url().startsWith('data:') && !request.url().startsWith('blob:')) external.push(request.url()); });
  try {
    await page.goto('http://127.0.0.1:4175/features/'); await expect(page.locator('body')).toHaveAttribute('data-ready', 'true');
    await expect(page.locator('#basis-status')).toContainText('No Saved choices'); await expect(page.locator('canvas, iframe')).toHaveCount(0);
    checks.push('No preference is invented in a clean browser; no initial canvas/iframe');
    await page.evaluate(value => localStorage.setItem('uiux-material-review-v1', JSON.stringify(value)), fixture); await page.locator('#refresh-basis').click();
    await expect(page.locator('#basis-status')).toContainText('4 selected spatial principles'); await expect(page.locator('body')).toHaveAttribute('data-layers', 'true'); await expect(page.locator('body')).toHaveAttribute('data-panel', 'false');
    await expect(page.locator('#basis-list')).toContainText('Verification fixture'); checks.push('Saved fixture and its note are read exactly; selected/unselected patterns are distinguished');
    await page.keyboard.press('Control+Home'); await page.locator('.skip').focus(); await page.keyboard.press('Enter'); await expect(page.locator('#main')).toBeFocused();
    await page.locator('#study-search').fill('no-such-study'); await expect(page.locator('.empty-index')).toBeVisible(); await page.getByRole('button', { name: 'Clear search and filters' }).click();
    await expect(page.locator('.study-card')).toHaveCount(7); await page.getByRole('button', { name: 'Objects', exact: true }).click(); await expect(page.locator('.study-card')).toHaveCount(2); await page.getByRole('button', { name: 'All', exact: true }).click();
    await page.locator('[data-study=feedback-key] .study-link').click(); await expect(page.locator('#reader-title')).toHaveText('Tactile key / press and release'); await expect(page.locator('#reader-title')).toBeFocused(); assert(page.url().includes('study=feedback-key#reader'), `${name} shareable study URL`);
    await page.locator('[data-study=feedback-card] .study-link').click(); await expect(page.locator('#reader-title')).toHaveText('Evidence card / separated layers'); await page.goBack(); await expect(page.locator('#reader-title')).toHaveText('Tactile key / press and release');
    await page.locator('.chapter-nav').getByRole('link', { name: 'Mechanism', exact: true }).click(); await expect(page.locator('#reader-mechanism')).toBeInViewport();
    await page.getByRole('button', { name: 'Open the interaction anatomy' }).click(); await expect(page.locator('#anatomy')).toBeVisible();
    await page.getByRole('button', { name: 'System', exact: true }).click(); await expect(page.locator('#annotation-copy')).toContainText('single visual owner');
    checks.push('Index search/filter/empty state, selected reader/direct URL, native chapter anchors and annotation/anatomy work');
    await page.locator('#inspect-media').click(); await expect(page.locator('#media-dialog')).toBeVisible(); await setRange(page.locator('#image-zoom'), 200); await expect(page.locator('#image-zoom-value')).toHaveText('200%');
    const ratio = await page.locator('#inspection-image').evaluate(img => img.getBoundingClientRect().width / img.parentElement.clientWidth); assert(ratio > 1.95, `${name} actual image zoom`);
    await page.getByRole('button', { name: 'Reset view', exact: true }).click(); await expect(page.locator('#image-zoom')).toHaveValue('100'); await page.keyboard.press('Escape'); await expect(page.locator('#media-dialog')).not.toBeVisible(); await expect(page.locator('#inspect-media')).toBeFocused();
    checks.push('Image inspection actually zooms, resets, closes with Escape and returns focus');
    for (const id of ['feedback-card', 'feedback-key']) await page.locator(`[data-study=${id}]`).getByRole('button', { name: 'Add to comparison', exact: true }).click();
    await expect(page.locator('.comparison-table tbody tr')).toHaveCount(6); await page.locator('[data-study=feedback-assembly]').getByRole('button', { name: 'Add to comparison', exact: true }).click(); await expect(page.locator('#announcement')).toContainText('Two studies');
    await expect(page.locator('.compare-token')).toHaveCount(2); await page.locator('#comparison-tray a').click(); await expect(page.locator('#compare-title')).toBeInViewport();
    checks.push('Two-study limit, aligned comparison criteria and tray link work');
    await page.locator('.site-header nav').getByRole('link', { name: 'Experiment', exact: true }).click(); await expect(page.locator('.site-header nav a[href="#workbench"]')).toHaveAttribute('aria-current', 'location'); await expect(page.locator('#comparison-tray')).not.toBeVisible();
    await page.locator('#separation').focus(); await page.keyboard.press('ArrowRight'); await expect(page.locator('#separation')).toHaveValue('36'); await page.getByRole('button', { name: 'Undo', exact: true }).click(); await expect(page.locator('#separation')).toHaveValue('35');
    const originalPath = await page.locator('#workbench-drawing path').first().getAttribute('d'); await setRange(page.locator('#separation'), 83); await setRange(page.locator('#fan'), -25);
    await page.getByRole('button', { name: 'Select workbench rib 4', exact: true }).click(); await expect(page.locator('#geometry-summary')).toContainText('rib 4 selected');
    await expect.poll(() => page.locator('#workbench-drawing svg').getAttribute('data-separation')).toBe('83.00'); assert(await page.locator('#workbench-drawing path').first().getAttribute('d') !== originalPath, `${name} parameter changes actual path`);
    await page.getByRole('button', { name: 'Undo', exact: true }).click(); await expect(page.locator('#workbench-drawing svg')).toHaveAttribute('data-selected', '-1'); await page.getByRole('button', { name: 'Redo', exact: true }).click(); await expect(page.locator('#workbench-drawing svg')).toHaveAttribute('data-selected', '3');
    let pending = page.waitForEvent('download'); await page.getByRole('button', { name: 'Download parameters', exact: true }).click(); const parameters = JSON.parse(await readDownload(await pending)); assert(parameters.separation === 83 && parameters.fan === -25 && parameters.selected === 3 && parameters.ribCount === 9, `${name} real JSON matches controls`);
    pending = page.waitForEvent('download'); await page.getByRole('button', { name: 'Download SVG', exact: true }).click(); const svg = await readDownload(await pending); assert((svg.match(/<path /g) ?? []).length === 9 && svg.includes('data-separation="83.00"'), `${name} actual SVG contains current geometry`);
    checks.push('Real geometry/part changes, undo/redo, and downloaded SVG/JSON match the current state');
    await page.locator('#open-commands').click(); await page.locator('#command-query').fill('flat'); await page.keyboard.press('Enter'); await expect(page.locator('body')).toHaveAttribute('data-presentation', 'flat'); await expect(page.locator('#presentation')).toBeFocused();
    await page.locator('#open-commands').click(); await page.locator('#command-query').fill('unsupported command'); await expect(page.locator('#command-results button')).toHaveCount(0); await expect(page.locator('#command-status')).toContainText('No matching action'); await page.keyboard.press('Escape'); await expect(page.locator('#command-dialog')).not.toBeVisible(); await expect(page.locator('#open-commands')).toBeFocused();
    checks.push('Command actions update the same state; unsupported action search is explicit');
    await page.locator('#presentation').selectOption('spatial'); await page.emulateMedia({ reducedMotion: 'reduce' }); await expect(page.locator('body')).toHaveAttribute('data-reduced', 'true'); await setRange(page.locator('#separation'), 12); await expect(page.locator('#workbench-drawing svg')).toHaveAttribute('data-separation', '12.00');
    await page.locator('#load-authored').click(); const score = page.frameLocator('#authored-host iframe'); await expect(score.getByRole('button', { name: 'Play spatial score' })).toBeDisabled(); await score.getByRole('button', { name: 'Enable 3D', exact: true }).click(); await expect(score.locator('.assembly-stage')).toHaveAttribute('data-ready', 'true');
    await page.getByRole('button', { name: 'Close 3D score', exact: true }).click(); await expect(page.locator('#authored-host iframe')).toHaveCount(0); await expect(page.locator('#workbench-drawing svg')).toHaveAttribute('data-separation', '12.00'); await page.emulateMedia({ reducedMotion: 'no-preference' });
    checks.push('OS reduced motion applies to direct geometry and authored playback; opt-in actual WebGL closes/disposes without losing the free arrangement');
    pending = page.waitForEvent('download'); await page.locator('#export-feature-review').click(); const review = JSON.parse(await readDownload(await pending)); assert(JSON.stringify(review.basis.saved) === JSON.stringify(fixture.saved), `${name} review identifies exact Saved fixture`); assert(review.comparison.length === 2, `${name} comparison exported`);
    assert(await page.evaluate(() => localStorage.getItem('uiux-material-review-v1')) === JSON.stringify(fixture), `${name} original Saved storage unchanged`);
    await page.reload(); await expect(page.locator('body')).toHaveAttribute('data-ready', 'true'); await expect(page.locator('.compare-token')).toHaveCount(2); await expect(page.locator('#reader-title')).toHaveText('Tactile key / press and release');
    await page.locator('#open-original').click(); await expect(page.locator('#detail')).toBeVisible(); await page.goBack(); await expect(page.locator('body')).toHaveAttribute('data-ready', 'true'); await expect(page.locator('#reader-title')).toHaveText('Tactile key / press and release'); await setRange(page.locator('#fan'), 27); await expect(page.locator('#workbench-drawing svg')).toHaveAttribute('data-fan', '27.00');
    checks.push('Feature review export and comparison persist; original Saved choices remain byte-for-byte unchanged; direct reader reload and returning from the original gallery retain working controls');
    if (options.hasTouch) { await page.locator('#inspect-media').tap(); await page.getByRole('button', { name: 'Close image', exact: true }).tap(); checks.push('Touch image open/close works'); }
    await page.locator('#study-search').blur(); await page.evaluate(() => { document.activeElement?.blur(); scrollTo(0, 0); });
    await expect(page.locator('.site-header nav a[aria-current=location]')).toHaveCount(0); await expect(page.locator('#comparison-tray')).not.toBeVisible();
    await page.screenshot({ path: path.join(screenshots, `features-${name}.png`), fullPage: true });
    await page.screenshot({ path: path.join(screenshots, `features-${name}-opening.png`) });
    await page.locator('.site-header nav').getByRole('link', { name: 'Experiment', exact: true }).click(); await expect(page.locator('.site-header nav a[href="#workbench"]')).toHaveAttribute('aria-current', 'location'); await page.screenshot({ path: path.join(screenshots, `features-${name}-workbench.png`) });
    for (const width of [320, 390, 768, 1440]) { await page.setViewportSize({ width, height: 950 }); assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${name} horizontal overflow ${width}`); }
    await page.evaluate(() => { localStorage.setItem('uiux-material-review-v1', 'null'); localStorage.setItem('uiux-feature-review-v1', 'null'); }); await page.reload(); await expect(page.locator('body')).toHaveAttribute('data-ready', 'true'); await expect(page.locator('#basis-status')).toContainText('No Saved choices');
    await page.evaluate(() => localStorage.setItem('uiux-material-review-v1', '{malformed')); await page.locator('#refresh-basis').click(); await expect(page.locator('#basis-status')).toContainText('could not be read'); await expect(page.locator('.study-card')).toHaveCount(7);
    checks.push('Null/malformed preference records retain working controls and an explicit missing/unreadable basis');
    assert(errors.length === 0, `${name} errors: ${errors.join('; ')}`); assert(external.length === 0, `${name} external requests`);
    results.push({ browser: name, viewport: options.viewport, fixture: 'Synthetic preferences used only in isolated automated browser; not observed owner choices', checks, consoleErrors: errors.length, externalRequests: external.length, passed: true });
    console.log(`${name}: ${checks.length} connected feature flows passed`);
  } finally { await context.close(); await browser.close(); }
}
await writeFile(path.join(role, 'verification/features-results.json'), JSON.stringify({ checkedAt: new Date().toISOString(), results }, null, 2) + '\n');
