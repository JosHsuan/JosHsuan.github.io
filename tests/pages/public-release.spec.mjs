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
  test.setTimeout(90000);
  const errors=[]; page.on('pageerror', error=>errors.push(error.message));
  await page.goto('/');
  await page.waitForFunction(()=>window.__thesis?.inspect().ready);
  expect(await page.evaluate(()=>window.__thesis.inspect().source)).toMatchObject({vertices:172789,triangles:227521,sourceObjects:51});
  expect(await page.evaluate(()=>window.__thesis.inspect().material)).toMatchObject({finish:'satin',roughness:.58,anisotropy:.35});
  expect(await page.evaluate(()=>window.__thesis.inspect().exhibition)).toMatchObject({sourceGeometry:false,areaLights:2,extraShadowMaps:0});
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
  expect(await page.evaluate(()=>window.__thesis.inspect().compositor.mist.enabled)).toBe(false);
  await page.locator('[data-chapter-link="make"]').click();
  await page.waitForFunction(()=>window.__story?.inspect().settled && window.__thesis?.inspect().pose.framingIntent === 'evidence-absence' && !window.__thesis.inspect().sourceVisible,null,{timeout:30000});
  await page.locator('[data-chapter-link="form"]').click();
  await page.waitForFunction(()=>window.__story?.inspect().settled && window.__thesis?.inspect().pose.chapter.id === 'form' && window.__thesis.inspect().sourceVisible,null,{timeout:30000});
  await page.getByRole('button',{name:'Pause motion'}).click();
  await expect(page.getByRole('button',{name:'Resume motion'})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
  expect(errors).toEqual([]);
});

test('evidence inspection and method disclosure preserve native reading and keyboard focus', async ({page}) => {
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/');
  await page.locator('[data-chapter-link="system"]').click();
  const step=page.locator('#system details').first();
  await step.locator('summary').click();
  await expect(step).toHaveAttribute('open','');
  await expect(step).toContainText('desired surface geometry');
  const trigger=page.locator('[data-inspect-figure="0"]');
  await trigger.focus();await page.keyboard.press('Enter');
  const dialog=page.getByRole('dialog',{name:'FIG. 3–04'});
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('button',{name:'Close evidence inspector'})).toBeFocused();
  await dialog.getByRole('button',{name:'Show source page'}).click();
  await expect(dialog.locator('img')).toHaveAttribute('src','/assets/cinematic/source-p024.webp');
  await dialog.getByRole('button',{name:'Next evidence'}).click();
  await expect(page.getByRole('dialog')).toHaveAccessibleName('FIG. 3–05');
  await page.getByRole('button',{name:'Previous evidence'}).click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(trigger).toBeFocused();
  expect(await page.evaluate(()=>document.body.style.overflow)).not.toBe('hidden');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
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
