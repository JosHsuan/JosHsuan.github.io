import {test,expect} from '@playwright/test';
import {readFile,writeFile} from 'node:fs/promises';
import {WAIT,scenarioTimeout} from './case-helpers.mjs';
const project=JSON.parse(await readFile(new URL('../../roles/uiux-designer/cases/bending-active-thesis/release/project-studies.json',import.meta.url),'utf8')).projects.find(project=>project.id==='entrance-installation-art');
const route=`/projects/${project.slug}/`,sections=project.sections.filter(section=>section.diagramFocus);
async function wheelTo(page,node){
 const target=await node.evaluate(n=>Math.max(0,Math.min(document.documentElement.scrollHeight-innerHeight,n.getBoundingClientRect().top+scrollY-innerHeight*.3)));
 const before=await page.evaluate(()=>scrollY);await page.mouse.move(page.viewportSize().width-3,page.viewportSize().height*.5);await page.mouse.wheel(0,target-before);
 await expect.poll(()=>page.evaluate(y=>Math.abs(scrollY-y),target),{timeout:WAIT}).toBeLessThanOrEqual(1);await expect(node).toBeInViewport();
}
async function audit(page,info,noJS=false){
 test.setTimeout(scenarioTimeout(90000));const receipt={noJS,guides:[]};let primary;
 try{
  await page.emulateMedia({reducedMotion:'reduce'});expect((await page.goto(route)).status()).toBe(200);
  if(!noJS)await page.waitForFunction(()=>window.__site?.inspect().phase==='entered',null,{timeout:WAIT});
  await page.evaluate(()=>document.fonts.ready);await expect(page.locator('[data-entrance-diagram]')).toHaveCount(3);expect(sections).toHaveLength(3);
  for(const section of sections){
   const metadata=section.diagramFocus,source=section.media.find(image=>image.src===metadata.source),guide=page.locator(`[data-entrance-diagram="${project.id}-${section.id}-guide"]`),image=guide.locator('[data-entrance-original]');
   await expect(guide.locator('a,button,input,select,[role="radio"],[tabindex]')).toHaveCount(0);
   await wheelTo(page,image);await expect.poll(()=>image.evaluate(n=>n.complete&&n.naturalWidth>0),{timeout:WAIT}).toBe(true);
   const raster=await image.evaluate(n=>({src:n.getAttribute('src'),width:Number(n.getAttribute('width')),height:Number(n.getAttribute('height')),natural:[n.naturalWidth,n.naturalHeight],alt:n.alt,fit:getComputedStyle(n).objectFit,linked:!!n.closest('a,button')}));
   expect(raster).toEqual({src:source.src,width:source.width,height:source.height,natural:[source.width,source.height],alt:source.alt,fit:'contain',linked:false});
   await expect(guide.locator('svg')).toHaveAttribute('viewBox',`0 0 ${source.width} ${source.height}`);await expect(guide.locator('svg')).toHaveAttribute('aria-hidden','true');await expect(guide.locator('svg')).toHaveCSS('pointer-events','none');
   await expect(guide.locator('[data-focus-region]')).toHaveCount(metadata.steps.length);await expect(guide.locator('ol > li')).toHaveCount(metadata.steps.length);
   const row={section:section.id,raster,steps:[]};receipt.guides.push(row);
   for(const [index,step]of metadata.steps.entries()){
    const region=guide.locator(`[data-focus-region="${index}"]`),description=guide.locator(`[data-focus-description="${index}"]`);
    for(const [key,value]of ['x','y','width','height'].map((key,i)=>[key,step.bounds[i]]))await expect(region).toHaveAttribute(key,String(value));
    await expect(region).toHaveCSS('fill','none');await expect(region).toHaveCSS('stroke-opacity','0.65');
    await expect(description.locator('h4')).toHaveText(`${String(index+1).padStart(2,'0')} ${step.label}`);await expect(description.locator('p')).toHaveText(step.description);
    await wheelTo(page,description);await expect(description).toBeVisible();
    expect(await description.evaluate(n=>!n.hidden&&getComputedStyle(n).display!=='none'&&getComputedStyle(n).visibility==='visible'&&Number(getComputedStyle(n).opacity)===1)).toBe(true);
    row.steps.push({index,label:step.label,y:await page.evaluate(()=>scrollY)});
   }
   await expect(guide).toContainText(source.caption);await expect(guide).toContainText(source.credit);await expect(image).toHaveAttribute('src',source.src);
  }
  for(const width of [390,320]){
   await page.setViewportSize({width,height:844});const guide=page.locator('[data-entrance-diagram]').nth(1);await wheelTo(page,guide.locator('ol > li').last());
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth)).toBe(true);
   for(const paragraph of await guide.locator('ol p').all())expect(await paragraph.evaluate(n=>{const r=n.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.width>0;})).toBe(true);
   await page.screenshot({path:info.outputPath(`entrance-sequential-${width}-${noJS?'no-js':'preference'}.png`)});
  }
  expect(new URL(page.url()).hash).toBe('');
 }catch(error){primary=error;throw error;}finally{try{const path=info.outputPath('entrance-sequential-reading.json');await writeFile(path,JSON.stringify(receipt,null,2));await info.attach('entrance-sequential-reading',{path,contentType:'application/json'});}catch(error){if(!primary)throw error;}}
}
test('Entrance complete plates and every numbered explanation are readable by scrolling without choices',async({page},info)=>audit(page,info));
test.describe('Entrance source reading without application JavaScript',()=>{
 test.use({javaScriptEnabled:false});
 test('all original plates and sequential descriptions remain available without JavaScript',async({page},info)=>audit(page,info,true));
});
