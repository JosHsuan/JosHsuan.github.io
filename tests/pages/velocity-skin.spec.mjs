import {test,expect} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
import {WAIT,scenarioTimeout} from './case-helpers.mjs';

test.use({video:'on'});

test('Shared velocity field responds to native scroll with whole-panel motion and finite readable rest',async({page})=>{
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
  // WebKit serializes CSS strings with double quotes; require a valid closed path, not a quote style.
  await expect.poll(()=>observation.evaluate(value=>value.samples.some(s=>s.y>0&&(/^path\((['"])M[\s\S]+Z\1\)$/.test(s.path)&&CSS.supports('clip-path',s.path))))).toBe(true);
  expect(await observation.evaluate(value=>value.samples.some(s=>!s.neutral))).toBe(true);
  expect(await observation.evaluate(value=>value.samples.every(s=>s.clip==='none'&&s.opacity==='1'))).toBe(true);
  await expect.poll(()=>page.evaluate(()=>window.__globalBackground.inspect().driver.homeScrolling.informationWindows.settled)).toBe(true);
  await expect(panel).toHaveAttribute('data-information-moving','false');
  expect(await panel.evaluate(node=>parseFloat(node.style.getPropertyValue('--information-flow')))).toBe(0);
  expect(await panel.evaluate(node=>Math.abs(parseFloat(node.style.getPropertyValue('--information-rx'))))).toBeLessThanOrEqual(19.001);
  await page.mouse.wheel(0,-100);
  await expect.poll(()=>page.evaluate(()=>window.__globalBackground.inspect().driver.homeScrolling.informationWindows.settled)).toBe(true);
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect.poll(()=>page.evaluate(()=>window.__globalBackground.inspect().driver.homeScrolling.enabled)).toBe(true);
  await expect(panel).toHaveAttribute('data-information-moving','false');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }finally{await observation.evaluate(value=>value.dispose());await observation.dispose();}
});

test('the shared field bends opposite desktop peripheries and stretches during acceleration without clipping content',async({page,isMobile},info)=>{
 await page.goto('/projects/');await page.waitForFunction(()=>window.__site?.inspect().phase==='entered',null,{timeout:WAIT});
 const cards=page.locator('[data-project-tile][data-information-plane]');await expect(cards).toHaveCount(8);
 const observation=await cards.first().evaluateHandle(()=>{
  const samples=[];const observer=new MutationObserver(()=>{
   if(samples.length>=100)return;
   const rows=[...document.querySelectorAll('[data-project-tile][data-information-plane]')].map(node=>{
    const rect=node.getBoundingClientRect(),css=getComputedStyle(node),value=name=>parseFloat(node.style.getPropertyValue('--information-'+name))||0;
    return{x:rect.x+rect.width/2,y:rect.y,visible:rect.bottom>0&&rect.top<innerHeight,rx:value('rx'),ry:value('ry'),sx:value('sx'),sy:value('sy'),flow:value('flow'),clip:css.clipPath,opacity:css.opacity};
   });
   if(rows.some(row=>Math.abs(row.rx)>.01))samples.push(rows);
  });observer.observe(document.querySelector('[data-project-grid]'),{subtree:true,attributes:true,attributeFilter:['style']});
  return{samples,dispose:()=>observer.disconnect()};
 });
 let primaryError;
 try{
  await page.mouse.wheel(0,300);
  // The phone grid is a centered single column: its cylindrical axis has no
  // lateral stretch. Acceleration still stretches it vertically; the desktop
  // peripheries additionally require horizontal stretch and opposing yaw.
  await expect.poll(()=>observation.evaluate((o,mobile)=>o.samples.some(rows=>rows.some(r=>r.visible&&r.sy>1&&(mobile||r.sx>1))),isMobile),{timeout:WAIT}).toBe(true);
  if(!isMobile)await expect.poll(()=>observation.evaluate(o=>o.samples.some(rows=>{
   const left=rows.find(r=>r.visible&&r.x<innerWidth*.4),right=rows.find(r=>r.visible&&r.x>innerWidth*.6);
   return left&&right&&left.ry*right.ry<0&&left.rx*right.rx>0;
  })),{timeout:WAIT}).toBe(true);
  expect(await observation.evaluate(o=>o.samples.flat().every(r=>r.clip==='none'&&r.opacity==='1'))).toBe(true);
  await expect.poll(()=>page.evaluate(()=>window.__globalBackground.inspect().driver.homeScrolling.informationWindows.items.every(item=>item.skinStrength===0)),{timeout:WAIT}).toBe(true);
 }catch(error){primaryError=error;throw error;}finally{
  try{
   const samples=await observation.evaluate(o=>o.samples),path=info.outputPath('peripheral-field.json');
   await writeFile(path,JSON.stringify({viewport:page.viewportSize(),isMobile,samples},null,2));await info.attach('peripheral-field',{path,contentType:'application/json'});
   await observation.evaluate(o=>o.dispose());await observation.dispose();
  }catch(error){if(!primaryError)throw error;}
 }
});
