import {test, expect} from '@playwright/test';
import {WAIT, scenarioTimeout, centerStudy, frames, settle} from './case-helpers.mjs';

async function entered(page){await page.waitForFunction(()=>window.__story?.inspect().entry.phase==='entered',null,{timeout:WAIT});}

test('published story, canonical metadata and every linked asset work without JavaScript', async ({browser}) => {
  const context = await browser.newContext({javaScriptEnabled:false});
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4186/projects/bending-active/');
  await expect(page.locator('[data-story-chapter]')).toHaveCount(7);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('h1')).toHaveAccessibleName('Bending-Active Metal Panel Deformation');
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.getByRole('heading',{level:1,name:'Bending-Active Metal Panel Deformation'})).toBeVisible();
  await expect(page.locator('[data-entry-loader]')).toBeHidden();
  await expect(page.locator('[data-project-content]')).not.toHaveAttribute('inert','');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'index, follow');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://joshsuan.github.io/projects/bending-active/');
  const assets = await page.locator('img, source, a[href^="/assets/"]').evaluateAll(elements => [...new Set(elements.flatMap(el => [el.getAttribute('src'),el.getAttribute('srcset'),el.getAttribute('href')]).filter(Boolean))]);
  for (const asset of assets) expect((await page.request.get('http://127.0.0.1:4186'+asset)).status(), asset).toBe(200);
  await expect(page.locator('body')).not.toContainText('Public release of the project and individual media remains pending');
  await context.close();
});

async function chapter(page,id){await page.locator(`[data-story-chapter="${id}"]`).evaluate(el=>{let y=0;for(let n=el;n;n=n.offsetParent)y+=n.offsetTop;scrollTo({top:y,behavior:'instant'});});await settle(page);}

test('public model initializes in Full and all project reading follows scroll without quality or pause controls',async({page,isMobile})=>{
 test.setTimeout(scenarioTimeout(120000));const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('/');await expect(page.locator('[data-site-loader]')).toBeHidden({timeout:WAIT});await expect(page.locator('[data-home-introduction]')).toBeVisible();
 await page.locator('[data-project-grid]').scrollIntoViewIfNeeded();await expect(page.locator('[data-project-grid]')).toBeInViewport();
 await page.locator('[data-project-card="bending-active"]').click();await expect(page).toHaveURL(/\/projects\/bending-active\/$/);
 await page.waitForFunction(()=>window.__thesis?.inspect().ready&&window.__story?.inspect().entry.phase==='entered',null,{timeout:WAIT});await page.evaluate(()=>document.fonts.ready);await settle(page);
 await centerStudy(page,'form');const initial=await page.evaluate(()=>window.__thesis.inspect());
 expect(initial.source).toMatchObject({vertices:172789,triangles:227521,sourceObjects:51});expect(initial.material).toMatchObject({finish:'satin',roughness:.58,anisotropy:.35});expect(initial.exhibition).toMatchObject({sourceGeometry:false,areaLights:2,extraShadowMaps:0});expect(initial.detail).toBe('full');expect(initial.compositor.requestedSamples).toBe(isMobile?0:2);expect(initial.renderSuspended).toBe(false);
 await expect(page.getByRole('combobox',{name:'Visual detail',exact:true})).toHaveCount(0);await expect(page.locator('[data-bending-motion-toggle],[data-story-navigation] a,[data-story-navigation] button')).toHaveCount(0);
 await centerStudy(page,'system');await expect(page.locator('[data-chapter-link="system"]')).toHaveAttribute('aria-current','location',{timeout:WAIT});
 expect(await page.evaluate(()=>window.__thesis.inspect().detail)).toBe('full');expect(await page.evaluate(()=>window.__thesis.inspect().compositor.requestedSamples)).toBe(isMobile?0:2);
 await chapter(page,'make');await page.waitForFunction(()=>{const story=window.__story?.inspect(),scene=window.__thesis?.inspect();return story?.canvasPlacement?.settled&&story.canvasPlacement.visible===false&&scene?.renderSuspended&&!scene.sourceVisible;},null,{timeout:WAIT});
 const resting=await page.evaluate(()=>window.__thesis.inspect().frames);await frames(page,8);expect(await page.evaluate(()=>window.__thesis.inspect().frames)).toBe(resting);
 await centerStudy(page,'form');await page.waitForFunction(()=>window.__thesis.inspect().sourceVisible&&!window.__thesis.inspect().renderSuspended,null,{timeout:WAIT});expect(await page.evaluate(()=>window.__thesis.inspect().frames)).toBeGreaterThan(resting);
 const before=await page.evaluate(()=>({time:window.__story.inspect().playback.activeSeconds,source:window.__thesis.inspect().representation.id}));await frames(page,8);expect(await page.evaluate(()=>window.__story.inspect().playback.activeSeconds)).toBeGreaterThan(before.time);expect(await page.evaluate(()=>window.__thesis.inspect().representation.id)).toBe(before.source);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);expect(errors).toEqual([]);
});

test('method explanations, research figures and credits are readable inline without disclosure or source-opening clicks',async({page})=>{
 test.setTimeout(scenarioTimeout(120000));await page.goto('/projects/bending-active/#system');await entered(page);await settle(page);
 await expect(page.locator('#system')).toContainText('Start with the desired surface geometry.');await expect(page.locator('#system')).toContainText('Paired edges describe how openings close and the panel bends.');
 const geometry=page.locator('#system [data-information-window="source-details"] img');await geometry.scrollIntoViewIfNeeded();await expect(geometry).toBeVisible();await expect(geometry).toHaveAttribute('src','/assets/cinematic/geometry-strip.webp');
 const library=page.locator('#pattern [data-information-window="source-details"] img');await library.scrollIntoViewIfNeeded();await expect(library).toBeVisible();
 await chapter(page,'credits');await expect(page.locator('#credits')).toContainText('Project credits & reference figures');
 await expect(page.locator('details,summary,[data-inspect-figure],[data-source-comparison],a[href^="/assets/"]')).toHaveCount(0);
 expect(await page.evaluate(()=>document.body.style.overflow)).not.toBe('hidden');expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
});

test('OS motion preference retains authored 3D while an actually unavailable model preserves the public story',async({browser})=>{
 test.setTimeout(scenarioTimeout(120000));const context=await browser.newContext({reducedMotion:'reduce'}),page=await context.newPage(),sceneRequests=[];
 try{
  page.on('request',request=>{if(/\.(glb|hdr)(\?|$)/.test(request.url()))sceneRequests.push(request.url());});await page.goto('http://127.0.0.1:4186/projects/bending-active/#overview');await entered(page);
  await page.waitForFunction(()=>window.__thesis?.inspect().ready,null,{timeout:WAIT});expect(await page.evaluate(()=>window.__story.inspect().playback.reducedMotion)).toBe(false);expect(sceneRequests.length).toBeGreaterThan(0);await expect(page.getByRole('button',{name:/Enable|Pause|Resume/})).toHaveCount(0);
 }finally{await context.close();}
 const fallback=await browser.newContext(),failedPage=await fallback.newPage();
 try{
  await failedPage.route('**/source-layers.glb',route=>route.abort());await failedPage.goto('http://127.0.0.1:4186/projects/bending-active/#overview');await entered(failedPage);
  expect(await failedPage.evaluate(()=>window.__story.inspect().entry.reason)).toBe('scene-unavailable');await expect(failedPage.locator('[data-story-chapter]')).toHaveCount(7);await expect(failedPage.locator('#system')).toContainText('Start with the desired surface geometry.');await expect(failedPage.locator('[data-cinematic-stage] canvas')).toHaveCount(0);await expect(failedPage.locator('a[href^="/assets/"],button')).toHaveCount(0);
 }finally{await fallback.close();}
});
