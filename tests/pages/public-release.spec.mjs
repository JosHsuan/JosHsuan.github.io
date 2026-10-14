import {test, expect} from '@playwright/test';
import {WAIT, scenarioTimeout, loadScene, centerStudy, holdModel, frames, settle, expectIdle} from './case-helpers.mjs';

async function entered(page){await page.waitForFunction(()=>window.__story?.inspect().entry.phase==='entered',null,{timeout:WAIT});}

test('published story, canonical metadata and every linked asset work without JavaScript', async ({browser}) => {
  const context = await browser.newContext({javaScriptEnabled:false});
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4186/');
  await expect(page.locator('[data-story-chapter]')).toHaveCount(7);
  await expect(page.locator('h1')).toHaveAccessibleName('Bending-Active Metal Panel Deformation');
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('[data-entry-loader]')).toBeHidden();
  await expect(page.locator('[data-project-content]')).not.toHaveAttribute('inert','');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'index, follow');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://joshsuan.github.io/');
  const assets = await page.locator('img, source, a[href^="/assets/"]').evaluateAll(elements => [...new Set(elements.flatMap(el => [el.getAttribute('src'),el.getAttribute('srcset'),el.getAttribute('href')]).filter(Boolean))]);
  for (const asset of assets) expect((await page.request.get('http://127.0.0.1:4186'+asset)).status(), asset).toBe(200);
  await expect(page.locator('body')).not.toContainText('Public release of the project and individual media remains pending');
  await context.close();
});

test('public model initializes in Full and preserves chapter navigation without quality or pause controls', async ({page,isMobile}) => {
  test.setTimeout(scenarioTimeout(120000));
  const errors=[]; page.on('pageerror', error=>errors.push(error.message));
  await loadScene(page);
  // A visitor's real keyboard inspection holds the source while its Full
  // materials, resource policy and geometry are measured.
  await centerStudy(page,'form');await holdModel(page);
  const initial=await page.evaluate(()=>window.__thesis.inspect());
  expect(initial.source).toMatchObject({vertices:172789,triangles:227521,sourceObjects:51});
  expect(initial.material).toMatchObject({finish:'satin',roughness:.58,anisotropy:.35});
  expect(initial.exhibition).toMatchObject({sourceGeometry:false,areaLights:2,extraShadowMaps:0});
  expect(initial.detail).toBe('full');
  expect(initial.compositor.requestedSamples).toBe(isMobile?0:2);
  expect(initial.renderSuspended).toBe(false);
  await expect(page.getByRole('combobox',{name:'Visual detail',exact:true})).toHaveCount(0);
  await expect(page.getByRole('button',{name:/^(Pause|Resume) motion$/})).toHaveCount(0);
  await page.locator('[data-chapter-link="system"]').click();
  // Native document input drives one visible reading plane and scene score.
  // Linux software rendering can exceed the default five-second assertion budget.
  await expect(page.locator('[data-chapter-link="system"]')).toHaveAttribute('aria-current', 'location', {timeout:30000});
  await centerStudy(page,'system');await holdModel(page,'system');
  await page.waitForFunction(() => {
    const story = window.__story?.inspect(), scene = window.__thesis?.inspect();
    return story?.settled && story.chapterId === 'system' && scene?.representation?.chapterId === 'system';
  }, null, {timeout:30000});
  expect(await page.evaluate(()=>window.__thesis.inspect().detail)).toBe('full');
  expect(await page.evaluate(()=>window.__thesis.inspect().compositor.requestedSamples)).toBe(isMobile?0:2);
  expect(await page.evaluate(()=>window.__thesis.inspect().compositor.mist.enabled)).toBe(true);
  await page.locator('[data-chapter-link="make"]').click();
  await settle(page);
  await page.waitForFunction(()=>{const story=window.__story?.inspect(),scene=window.__thesis?.inspect();return story?.settled&&story.chapterId==='make'&&story.canvasPlacement?.settled&&story.canvasPlacement.visible===false&&scene?.renderSuspended&&!scene.sourceVisible;},null,{timeout:30000});
  // An absent surface deliberately retains its previous rendered pose. Prove
  // that the live Canvas is suspended instead of requiring an invisible frame.
  const resting=await page.evaluate(()=>window.__thesis.inspect().frames);await frames(page,8);
  expect(await page.evaluate(()=>window.__thesis.inspect().frames)).toBe(resting);
  await page.locator('[data-chapter-link="form"]').click();
  await centerStudy(page,'form');
  await page.waitForFunction(()=>{const story=window.__story?.inspect(),scene=window.__thesis?.inspect();return story?.settled&&scene?.pose.chapter.id==='form'&&scene.sourceVisible&&!scene.renderSuspended&&scene.canvasPlacement?.visible;},null,{timeout:30000});
  expect(await page.evaluate(()=>window.__thesis.inspect().frames)).toBeGreaterThan(resting);
  await holdModel(page);await expectIdle(page);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
  expect(errors).toEqual([]);
});

test('evidence inspection and method disclosure preserve native reading and keyboard focus', async ({page}) => {
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/');await entered(page);
  await page.locator('[data-chapter-link="system"]').click();
  const step=page.locator('#system details').first();
  await step.locator('summary').click();
  await expect(step).toHaveAttribute('open','');
  await expect(step).toContainText('desired surface geometry');
  await page.getByText('Compare with the original thesis figure',{exact:true}).click();
  const trigger=page.locator('[data-inspect-figure="0"]');
  await trigger.focus();await page.keyboard.press('Enter');
  const comparison=page.getByRole('region',{name:'Original source for FIG. 3–04'});
  await expect(comparison).toBeVisible();
  await expect(comparison.locator('img')).toHaveAttribute('src','/assets/cinematic/source-p024.webp');
  await expect(page.locator('dialog[open]')).toHaveCount(0);
  await comparison.getByRole('button',{name:'Close source comparison'}).focus();
  await page.keyboard.press('Escape');
  await expect(comparison).toHaveCount(0);
  await expect(trigger).toBeFocused();
  expect(await page.evaluate(()=>document.body.style.overflow)).not.toBe('hidden');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
});

test('reduced motion and unavailable model retain the public story', async ({browser}) => {
  const context = await browser.newContext({reducedMotion:'reduce'});
  const page = await context.newPage(); const sceneRequests=[];
  page.on('request', request=>{if(/\.(glb|hdr)(\?|$)/.test(request.url()))sceneRequests.push(request.url());});
  await page.goto('http://127.0.0.1:4186/');
  await entered(page);
  await expect(page.getByRole('button',{name:'Enable 3D',exact:true})).toBeVisible();
  expect(await page.evaluate(()=>window.__story.inspect().entry.reason)).toBe('static-ready');
  expect(sceneRequests).toEqual([]);
  await expect(page.locator('[data-story-chapter]')).toHaveCount(7);
  await context.close();
  const fallback = await browser.newContext(); const failedPage = await fallback.newPage();
  await failedPage.route('**/source-layers.glb', route=>route.abort());
  await failedPage.goto('http://127.0.0.1:4186/');await entered(failedPage);
  await expect(failedPage.locator('[data-scene-fallback]')).toContainText('3D unavailable');
  expect(await failedPage.evaluate(()=>window.__story.inspect().entry.reason)).toBe('scene-unavailable');
  await expect(failedPage.locator('[data-story-chapter]')).toHaveCount(7);
  await fallback.close();
});
