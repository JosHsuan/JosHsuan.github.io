import {test, expect} from '@playwright/test';

test('published story, canonical metadata and every linked asset work without JavaScript', async ({browser}) => {
  const context = await browser.newContext({javaScriptEnabled:false});
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4186/');
  await expect(page.locator('[data-story-chapter]')).toHaveCount(7);
  await expect(page.locator('h1')).toHaveAccessibleName('Bending-Active Metal Panel Deformation');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'index, follow');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://joshsuan.github.io/');
  const assets = await page.locator('img, source, a[href^="/assets/"]').evaluateAll(elements => [...new Set(elements.flatMap(el => [el.getAttribute('src'),el.getAttribute('srcset'),el.getAttribute('href')]).filter(Boolean))]);
  for (const asset of assets) expect((await page.request.get('http://127.0.0.1:4186'+asset)).status(), asset).toBe(200);
  await expect(page.locator('body')).not.toContainText('Public release of the project and individual media remains pending');
  await context.close();
});

test('public model initializes with base layers and supports chapter navigation and Light mode', async ({page}) => {
  const errors=[]; page.on('pageerror', error=>errors.push(error.message));
  await page.goto('/');
  await page.waitForFunction(()=>window.__thesis?.inspect().ready);
  expect(await page.evaluate(()=>window.__thesis.inspect().source)).toMatchObject({vertices:172789,triangles:227521,sourceObjects:51});
  await page.locator('[data-chapter-link="system"]').click();
  // Native reading moves first; the damped playhead and rendered scene follow.
  // Linux software rendering can exceed the default five-second assertion budget.
  await expect(page.locator('[data-chapter-link="system"]')).toHaveAttribute('aria-current', 'location', {timeout:30000});
  await page.waitForFunction(() => {
    const story = window.__story?.inspect(), scene = window.__thesis?.inspect();
    return story?.settled && story.chapterId === 'system' && scene?.elements?.separationWeight > .9;
  }, null, {timeout:30000});
  await page.getByRole('combobox',{name:'Visual detail'}).selectOption('light');
  await expect.poll(()=>page.evaluate(()=>window.__thesis.inspect().detail)).toBe('light');
  expect(await page.evaluate(()=>window.__thesis.inspect().compositor.requestedSamples)).toBe(0);
  await page.getByRole('button',{name:'Pause motion'}).click();
  await expect(page.getByRole('button',{name:'Resume motion'})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
  expect(errors).toEqual([]);
});

test('reduced motion and unavailable model retain the public story', async ({browser}) => {
  const context = await browser.newContext({reducedMotion:'reduce'});
  const page = await context.newPage(); const sceneRequests=[];
  page.on('request', request=>{if(/\.(glb|hdr)(\?|$)/.test(request.url()))sceneRequests.push(request.url());});
  await page.goto('http://127.0.0.1:4186/');
  await expect(page.getByRole('button',{name:'Reduced motion'})).toBeVisible();
  expect(sceneRequests).toEqual([]);
  await expect(page.locator('[data-story-chapter]')).toHaveCount(7);
  await context.close();
  const fallback = await browser.newContext(); const failedPage = await fallback.newPage();
  await failedPage.route('**/source-layers.glb', route=>route.abort());
  await failedPage.goto('http://127.0.0.1:4186/');
  await expect(failedPage.getByRole('button',{name:'Still background'})).toBeVisible();
  await expect(failedPage.locator('[data-story-chapter]')).toHaveCount(7);
  await fallback.close();
});
