import {test,expect} from '@playwright/test';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {WAIT,scenarioTimeout} from './case-helpers.mjs';
const release=new URL('../../roles/uiux-designer/cases/bending-active-thesis/release/',import.meta.url);
const project=JSON.parse(await readFile(new URL('project-studies.json',release),'utf8')).projects.find(p=>p.id==='project-caschlatsch');
const manifest=JSON.parse(await readFile(new URL('project-assets.json',release),'utf8')).assets;
async function entered(page){await page.waitForFunction(()=>window.__site?.inspect().phase==='entered',null,{timeout:WAIT});await expect(page.locator('[data-site-loader]')).toBeHidden();}
async function wheelTo(page,locator){const target=await locator.evaluate(node=>Math.max(0,Math.min(document.documentElement.scrollHeight-innerHeight,node.getBoundingClientRect().top+scrollY-140)));await page.mouse.move(8,page.viewportSize().height*.5);await page.mouse.wheel(0,target-await page.evaluate(()=>scrollY));await expect.poll(()=>page.evaluate(target=>Math.abs(scrollY-target),target),{timeout:WAIT}).toBeLessThanOrEqual(1);await expect.poll(()=>page.locator('[data-information-moving="true"]').count(),{timeout:WAIT}).toBe(0);}
const state=page=>page.evaluate(()=>window.__globalBackground.inspect());
test('Caschlatsch preserves original native evidence, complete images and readable captions alongside its source model',async({page},info)=>{
 test.setTimeout(scenarioTimeout(120000));const rows=[];
 const originals=[...new Map(project.sections.flatMap(section=>section.media).map(image=>[image.src,image])).values()];expect(originals).toHaveLength(10);
 for(const image of originals){const pin=manifest.find(asset=>asset.path===image.src.slice(1));const bytes=await readFile(new URL('public'+image.src,release));expect(bytes.length).toBe(pin.bytes);expect(createHash('sha256').update(bytes).digest('hex')).toBe(pin.sha256);}
 await page.goto(`/projects/${project.slug}/`);await entered(page);await page.evaluate(()=>document.fonts.ready);
 const root=page.locator('[data-study-presentation="hybrid-scenes"]');await expect(root).toHaveCount(1);await expect(page.locator('h1')).toHaveText(project.title);
 await expect(root.locator('[data-editorial-image]')).toHaveCount(7);await expect(root.locator('[data-evidence-source-link],[data-study-motion-toggle]')).toHaveCount(0);
 await expect(page.locator('[data-project-study-canvas]')).toHaveCount(1);
 for(const image of originals){
  const img=root.locator(`img[src="${image.src}"]`).first();await expect(img).toHaveCount(1);await img.evaluate(node=>node.scrollIntoView({block:'center',behavior:'instant'}));
  const actual=await img.evaluate(async node=>{await node.decode();return{width:node.naturalWidth,height:node.naturalHeight,fit:getComputedStyle(node).objectFit};});
  expect(actual).toEqual({width:image.width,height:image.height,fit:'contain'});
  await expect(root).toContainText(image.caption);await expect(root).toContainText(image.credit);await expect(root.locator(`a[href="${image.src}"]`)).toHaveCount(0);
 }
 for(const figure of await root.locator('[data-editorial-source]').all()){
  const src=await figure.getAttribute('data-editorial-source'),source=[project.hero,...originals].find(image=>image.src===src),image=figure.locator('img');
  await wheelTo(page,figure);await expect(image).toBeInViewport();await expect(image).toHaveAttribute('alt',source.alt);
  const geometry=await figure.evaluate(node=>{const image=node.querySelector('img'),caption=node.querySelector('figcaption'),rect=n=>n.getBoundingClientRect().toJSON();return{chapter:node.closest('[data-project-chapter]').dataset.projectChapter,image:rect(image),caption:rect(caption),width:innerWidth,height:innerHeight,documentWidth:document.documentElement.scrollWidth};});
  expect(geometry.image.x).toBeGreaterThanOrEqual(0);expect(geometry.image.right).toBeLessThanOrEqual(geometry.width);expect(geometry.documentWidth).toBeLessThanOrEqual(geometry.width);
  expect(Math.abs(geometry.image.width/source.width-geometry.image.height/source.height)).toBeLessThan(1/source.height);
  expect(geometry.caption.top).toBeGreaterThanOrEqual(geometry.image.bottom);
  await expect(figure.locator('figcaption > p')).toHaveText(source.caption);await expect(figure.locator('figcaption > span:not([data-information-skin])')).toHaveText(source.credit);await expect(figure.locator('a')).toHaveCount(0);
  rows.push({src,geometry,background:await state(page)});await page.screenshot({path:info.outputPath(src.split('/').at(-1)+'.png')});
  await wheelTo(page,figure.locator('figcaption'));await expect(figure.locator('figcaption')).toBeInViewport();
 }
 const background=await state(page);expect(background.activeBindings).toBe(1);expect(background.driver.projectStudy.scene.resource.sourceRevision).toBe(project.model.sha256);
 await writeFile(info.outputPath('Caschlatsch-native-evidence.json'),JSON.stringify(rows,null,2));
});
test('Caschlatsch real history releases or suspends its original model and restores one readable lifetime',async({page},info)=>{
 test.setTimeout(scenarioTimeout(120000));await page.addInitScript(()=>addEventListener('pageshow',event=>{window.__casPageShow={trusted:event.isTrusted,persisted:event.persisted};}));
 await page.goto(`/projects/${project.slug}/`);await entered(page);await page.locator('[data-project-chapter-link="system"]').click();
 await page.waitForFunction(()=>window.__globalBackground.inspect().driver.projectStudy.scene.resource?.view.chapter==='system',null,{timeout:WAIT});
 await page.evaluate(()=>addEventListener('pagehide',event=>sessionStorage.setItem('cas-departure',JSON.stringify({trusted:event.isTrusted,persisted:event.persisted,documentId:performance.timeOrigin,background:window.__globalBackground.inspect()})),{once:true}));
 await page.locator('[data-portfolio-navigation] a[href="/contact/"]').click();await entered(page);
 const departure=await page.evaluate(()=>JSON.parse(sessionStorage.getItem('cas-departure')));expect(departure.trusted).toBe(true);
 if(departure.persisted){expect(departure.background.activeBindings).toBe(1);expect(departure.background.driver.lifecycle.suspended).toBe(true);expect(departure.background.driver.projectStudy.scene.resource.sourceRevision).toBe(project.model.sha256);}else{expect(departure.background.activeBindings).toBe(0);expect(departure.background.driver.disposed).toBe(true);expect(departure.background.driver.events.nativeListeners).toBe(0);}
 await page.goBack();await entered(page);
 const restored=await state(page),show=await page.evaluate(()=>window.__casPageShow);expect(show.trusted).toBe(true);expect(restored.activeBindings).toBe(1);expect(restored.driver.lifecycle.suspended).toBe(false);
 expect(restored.driver.projectStudy.scene.resource).toMatchObject({sourceRevision:project.model.sha256,successfulPaint:true,firstDraw:{completed:true},vertices:61362,triangles:31152});
 await expect(page.locator('[data-project-study-canvas]')).toHaveCount(1);expect(await page.locator('main').evaluate(node=>node.inert)).toBe(false);
 await writeFile(info.outputPath('Caschlatsch-history.json'),JSON.stringify({departure,restored,show},null,2));
});
test('a failed Caschlatsch native photograph retains caption and credits without an image viewer',async({page},info)=>{
 const source=project.sections.find(section=>section.id==='xr-guidance').media[0];
 await page.route('**'+source.src,request=>request.abort());await page.goto(`/projects/${project.slug}/`);await entered(page);
 const figure=page.locator(`[data-editorial-source="${source.src}"]`);await wheelTo(page,figure);
 await expect(figure).toHaveAttribute('data-editorial-image-state','failed',{timeout:WAIT});await expect(figure.locator('[role="status"]')).toBeVisible();
 await expect(figure.locator('figcaption > p')).toHaveText(source.caption);await expect(figure.locator('figcaption > span:not([data-information-skin])')).toHaveText(source.credit);await expect(figure.locator('a')).toHaveCount(0);
 const background=await state(page);expect(background.driver.projectStudy.scene.resource.successfulPaint).toBe(true);expect(background.driver.projectStudy.scene.resource.sourceRevision).toBe(project.model.sha256);
 await page.screenshot({path:info.outputPath('Caschlatsch-native-image-failure.png')});
 await page.locator('[data-project-chapter-link="credits"]').click();await expect(page.locator('[data-project-chapter="credits"]')).toBeInViewport();expect(await page.locator('main').evaluate(node=>node.inert)).toBe(false);
});
