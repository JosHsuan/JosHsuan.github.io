import {test,expect} from '@playwright/test';
import {WAIT} from './case-helpers.mjs';
test('HC3DP presents observed light, readable path evidence and explicit simulation limits',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/projects/hc3dp-caustics/');
 await page.waitForFunction(()=>window.__site?.inspect().phase==='entered',null,{timeout:WAIT});
 await page.evaluate(()=>document.fonts.ready);
 await expect(page.locator('[data-project-native-source="overview"] [data-editorial-source="/assets/projects/hc3dp-caustics/caustic-observation.webp"] [data-editorial-image]')).toHaveAttribute('src','/assets/projects/hc3dp-caustics/caustic-observation.webp');
 await expect(page.locator('[data-project-native-source="overview"] [data-editorial-source="/assets/projects/hc3dp-caustics/caustic-observation.webp"] figcaption > p')).toContainText('not a measured optical-performance result');
 await expect(page.locator('[data-project-chapter="making"]')).toContainText('not a recording of physical fabrication or a simulation of the resulting light pattern');
 await expect(page.locator('[data-project-chapter="results"]')).toContainText('do not establish a quantified relation');
 const evidence=page.locator('[data-project-evidence-image]');
 expect(await evidence.evaluateAll(images=>images.map(img=>img.getAttribute('src')))).toEqual(['layer-system','path-logic','frame-arrangement','overinflation'].map(name=>`/assets/projects/hc3dp-caustics/${name}.webp`));
 for(const width of [1280,390]){
  await page.setViewportSize({width,height:900});
  for(const img of await evidence.all()){
   await img.scrollIntoViewIfNeeded();await expect.poll(()=>img.evaluate(node=>node.complete&&node.naturalWidth>0)).toBe(true);
   await expect(img).toBeVisible();
   const box=await img.boundingBox();expect(box.x).toBeGreaterThanOrEqual(0);expect(box.x+box.width).toBeLessThanOrEqual(width);
   await expect(img.locator('xpath=ancestor::a')).toHaveCount(0);
  }
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth)).toBe(true);
  const band=page.locator('[data-project-chapter="system"] [data-study-evidence-layout]').first().locator('..');
  const path=test.info().outputPath(`hc3dp-path-evidence-${width}.png`);await band.screenshot({path});await test.info().attach(`hc3dp-path-evidence-${width}`,{path,contentType:'image/png'});
 }
});
test('HC3DP evidence and truthful labels remain available without JavaScript',async({browser,baseURL})=>{
 const context=await browser.newContext({baseURL,javaScriptEnabled:false,viewport:{width:390,height:844}});const page=await context.newPage();
 await page.goto('/projects/hc3dp-caustics/');
 await expect(page.locator('[data-project-model-target]')).toHaveCount(2);
 expect(await page.locator('[data-project-model-target]').evaluateAll(nodes=>nodes.map(node=>node.dataset.projectModelTarget))).toEqual(['context','system']);
 await expect(page.locator('[data-project-chapter="making"] [data-project-motion-id="fabrication-path-motion"]')).toHaveCount(1);
 for(const name of ['layer-system','path-logic','frame-arrangement']){
  const image=page.locator(`[data-project-evidence-image][src$="/${name}.webp"]`);await image.scrollIntoViewIfNeeded();await expect(image).toBeVisible();
  await expect.poll(()=>image.evaluate(node=>node.complete&&node.naturalWidth>0)).toBe(true);
 }
 await expect(page.locator('[data-project-chapter="results"]')).toContainText('do not establish a quantified relation');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth)).toBe(true);
 await context.close();
});
