import {test,expect} from '@playwright/test';
import {WAIT} from './case-helpers.mjs';
const route='/projects/entrance-installation-art/';
test('Entrance original plates support reversible keyboard focus, pause and compact mobile reading',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto(route);
 await page.waitForFunction(()=>window.__site?.inspect().phase==='entered',null,{timeout:WAIT});
 const guides=page.locator('[data-entrance-diagram]');await expect(guides).toHaveCount(3);
 for(const guide of await guides.all()){
  await guide.scrollIntoViewIfNeeded();
  const image=guide.locator('[data-entrance-original]');await expect.poll(()=>image.evaluate(img=>img.complete&&img.naturalWidth>0)).toBe(true);
  const original=await image.getAttribute('src');await expect(guide.getByRole('link',{name:'Open complete source image'})).toHaveAttribute('href',original);
  const radios=guide.getByRole('radio');await radios.first().focus();await radios.first().press('ArrowRight');
  await expect(radios.nth(1)).toBeChecked();await expect(guide.locator('[data-focus-description="0"]')).toBeVisible();
  await expect(guide.locator('[data-focus-region="0"]')).toHaveCSS('stroke-dashoffset','0px');
  await expect(guide.locator('[data-focus-region="0"]')).toHaveCSS('transition-duration','0s');
  await radios.nth(1).press('ArrowLeft');await expect(radios.first()).toBeChecked();
  await expect(guide.locator('[data-focus-region="0"]')).toHaveCSS('opacity','0');
  await expect(image).toHaveAttribute('src',original);
 }
 await page.emulateMedia({reducedMotion:'no-preference'});
 await guides.first().getByRole('radio').nth(1).check();
 await expect(guides.first().locator('[data-focus-region="0"]')).toHaveCSS('transition-duration','0.22s');
 await expect(guides.first().locator('[data-focus-region="0"]')).toHaveCSS('stroke-dashoffset','0px');
 await page.getByRole('button',{name:'Pause motion',exact:true}).click();
 await guides.first().getByRole('radio').nth(2).check();
 await expect(guides.first().locator('[data-focus-region="1"]')).toHaveCSS('transition-duration','0s');
 for(const width of [390,320]){
  await page.setViewportSize({width,height:844});
  const guide=guides.nth(1);await guide.scrollIntoViewIfNeeded();await guide.getByRole('radio').nth(2).check();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth)).toBe(true);
  for(const label of await guide.locator('label').all())expect((await label.boundingBox()).height).toBeGreaterThanOrEqual(44);
  if(width===390){const path=test.info().outputPath('entrance-joint-focus-mobile.png');await page.screenshot({path});await test.info().attach('entrance-joint-focus-mobile',{path,contentType:'image/png'});}
 }
});
test('Entrance diagram choices and complete sources remain usable without JavaScript',async({browser,baseURL})=>{
 const context=await browser.newContext({baseURL,javaScriptEnabled:false,viewport:{width:390,height:844}});const page=await context.newPage();
 await page.goto(route);const guide=page.locator('[data-entrance-diagram]').nth(2);
 await guide.getByRole('radio').nth(2).check();await expect(guide.locator('[data-focus-description="1"]')).toBeVisible();
 await expect(guide.getByRole('link',{name:'Open complete source image'})).toHaveAttribute('href',/fabrication-drawings.webp$/);
 await expect(guide.locator('[data-entrance-original]')).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth)).toBe(true);
 await context.close();
});
