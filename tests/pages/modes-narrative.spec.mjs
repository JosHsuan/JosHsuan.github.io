import {test,expect} from '@playwright/test';
import {WAIT} from './case-helpers.mjs';

test('Mode/s preserves its causal chapter order and contains the complete mobile source inside the reading column',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/projects/mode-s-of-making/');
 await page.waitForFunction(()=>window.__site?.inspect().phase==='entered',null,{timeout:WAIT});
 await page.evaluate(()=>document.fonts.ready);
 expect(await page.locator('main [data-project-chapter]').evaluateAll(nodes=>nodes.map(node=>node.dataset.projectChapter))).toEqual(['overview','context','system','making','cutting','fabrication','results','credits']);
 await expect(page.locator('[data-project-chapter="system"] [data-project-evidence-image][src$="film-design-workflow.webp"]')).toHaveCount(1);
 await expect(page.locator('[data-project-chapter="making"] [data-project-evidence-image][src$="film-corexy-system.webp"]')).toHaveCount(1);
 await expect(page.locator('[data-project-chapter="results"]')).toContainText('does not establish a completed physical version');
 for(const width of [390,360,320]){
  await page.setViewportSize({width,height:844});
  await page.locator('h1').scrollIntoViewIfNeeded();
  await expect.poll(()=>page.evaluate(()=>{
   const chapter=document.querySelector('[data-project-chapter="overview"]');
   const panel=chapter.querySelector('[data-home-scroll-window="project-narrative"]'),frame=chapter.querySelector('[data-project-media-frame]'),img=frame.querySelector('img');
   const p=panel.getBoundingClientRect(),f=frame.getBoundingClientRect();
   return {inside:f.left>=p.left+.5&&f.right<=p.right-.5,fit:getComputedStyle(img).objectFit,loaded:img.complete&&img.naturalWidth>0,overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth};
  })).toEqual({inside:true,fit:'contain',loaded:true,overflow:false});
  if(width===390){const path=test.info().outputPath('modes-mobile-source-column.png');await page.screenshot({path});await test.info().attach('modes-mobile-source-column',{path,contentType:'image/png'});}
 }
});
