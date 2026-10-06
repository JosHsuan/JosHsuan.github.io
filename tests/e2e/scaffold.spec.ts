import { expect, test } from '@playwright/test';

test('empty shell navigates, reloads and preserves browser history without 3D requests', async ({ page }) => {
  const errors: string[] = [];
  const requests: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('./');
  await expect(page.getByRole('heading', { level: 1, name: '首頁' })).toBeVisible();
  for (const [label, path] of [['作品', 'projects'], ['研究與開發', 'research'], ['關於', 'about'], ['聯絡', 'contact']]) {
    await page.getByRole('navigation').getByRole('link', { name: label, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/${path}/$`));
    await page.reload();
    await expect(page.getByRole('heading', { level: 1, name: label })).toBeVisible();
    await expect(page.getByText('尚未新增內容。')).toBeVisible();
  }
  await page.goBack();
  await expect(page.getByRole('heading', { level: 1, name: '關於' })).toBeVisible();
  await expect(page.locator('canvas')).toHaveCount(0);
  expect(requests.filter((url) => /\.(glb|gltf|hdr|ktx2)|theatre|studio/.test(url))).toEqual([]);
  expect(errors).toEqual([]);
});

test('no-JavaScript reading and deep links', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(`${baseURL}research/`);
  await expect(page.getByRole('heading', { level: 1, name: '研究與開發' })).toBeVisible();
  await page.getByRole('link', { name: '關於', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1, name: '關於' })).toBeVisible();
  await context.close();
});

test('keyboard, preference, responsive layout and 404', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./');
  await expect(page.getByRole('heading', { level: 1, name: '首頁' })).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: '跳至主要內容' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();
  await page.getByRole('combobox', { name: '動態效果' }).selectOption('reduce');
  await expect(page.getByRole('combobox')).toHaveValue('reduce');
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
  await page.screenshot({ path: testInfo.outputPath('empty-home.png'), fullPage: true });
  const response = await page.goto('./missing/');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: '找不到此頁面' })).toBeVisible();
});
