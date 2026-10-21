import {test,expect} from '@playwright/test';
import {WAIT,scenarioTimeout} from './case-helpers.mjs';

test('Mode/s pilot responds to native scroll with skin-only motion and finite readable rest',async({page})=>{
 test.setTimeout(scenarioTimeout(120000));
 await page.goto('/projects/mode-s-of-making/');
 await page.waitForFunction(()=>window.__site?.inspect().phase==='entered',null,{timeout:WAIT});
 await expect.poll(()=>page.evaluate(()=>window.__globalBackground.inspect().driver.homeScrolling.enabled)).toBe(true);
 await expect(page.locator('main')).toHaveAttribute('data-information-motion-profile','velocity-skin');
 const panel=page.locator('[data-information-window="editorial"]').first();
 const observation=await panel.evaluateHandle(node=>{
  const samples=[];
  const observer=new MutationObserver(()=>{
   if(node.getAttribute('data-information-moving')==='true'&&samples.length<120){
    const style=getComputedStyle(node),matrix=new DOMMatrix(style.transform==='none'?undefined:style.transform);
    samples.push({y:scrollY,path:node.style.getPropertyValue('--information-skin-path'),neutral:matrix.isIdentity,clip:style.clipPath,opacity:style.opacity});
   }
  });
  observer.observe(node,{attributes:true,attributeFilter:['style','data-information-moving']});
  return {samples,dispose(){observer.disconnect();}};
 });
 try{
  await page.mouse.wheel(0,180);
  await expect.poll(()=>observation.evaluate(value=>value.samples.some(s=>s.y>0&&s.path.startsWith("path('")))).toBe(true);
  expect(await observation.evaluate(value=>value.samples.every(s=>s.neutral&&s.clip==='none'&&s.opacity==='1'))).toBe(true);
  await expect.poll(()=>page.evaluate(()=>window.__globalBackground.inspect().driver.homeScrolling.informationWindows.settled)).toBe(true);
  await expect(panel).toHaveAttribute('data-information-moving','false');
  await page.mouse.wheel(0,-100);
  await expect.poll(()=>page.evaluate(()=>window.__globalBackground.inspect().driver.homeScrolling.informationWindows.settled)).toBe(true);
  await panel.locator('a').first().focus();
  await expect(panel).toHaveCSS('transform','none');
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect.poll(()=>page.evaluate(()=>window.__globalBackground.inspect().driver.homeScrolling.enabled)).toBe(false);
  await expect(panel).toHaveAttribute('data-information-moving','false');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }finally{await observation.evaluate(value=>value.dispose());await observation.dispose();}
});
