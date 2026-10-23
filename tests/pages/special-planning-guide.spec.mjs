import {test,expect} from '@playwright/test';
import {readFile,writeFile} from 'node:fs/promises';
const data=JSON.parse(await readFile(new URL('../../roles/uiux-designer/cases/bending-active-thesis/release/project-studies.json',import.meta.url),'utf8'));
const project=data.projects.find(p=>p.id==='special-assemblies'),section=project.sections.find(s=>s.id==='system');
const source=section.media.find(image=>image.src.endsWith('/planning-workflow.webp'));
const route='/projects/special-assemblies/',bounds=[[132,1180,238,102],[590,1204,162,78],[828,1204,474,78]];
function contrast(foreground,background){
 const luminance=color=>{const match=color.match(/^rgba?\(\s*([\d.]+)[, ]+([\d.]+)[, ]+([\d.]+)(?:\s*[,/]\s*([\d.]+))?\s*\)$/);expect(match,'Opaque browser RGB color: '+color).toBeTruthy();expect(Number(match[4]??1)).toBe(1);const rgb=match.slice(1,4).map(Number);expect(rgb.every(v=>Number.isFinite(v)&&v>=0&&v<=255)).toBe(true);return rgb.map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);};
 const a=luminance(foreground),b=luminance(background);return(Math.max(a,b)+.05)/(Math.min(a,b)+.05);
}
async function persist(info,receipt){const path=info.outputPath('special-planning-guide.json');await writeFile(path,JSON.stringify(receipt,null,2));await info.attach('special-planning-guide',{path,contentType:'application/json'});}
async function tabTo(page,target){
 const count=await page.locator('a[href],button,input,select,textarea,[tabindex]').count();
 for(let i=0;i<count+2;i++){await page.keyboard.press('Tab');if(await target.evaluate(node=>node===document.activeElement))return;}
 throw Error('Native Tab did not reach planning control');
}
async function visibleControl(control){
 const value=await control.evaluate(node=>{
  const el=node.closest('label')??node,r=el.getBoundingClientRect(),hit=document.elementFromPoint((r.left+r.right)/2,(r.top+r.bottom)/2);
  const rect=r=>({left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height});
  const chrome=['[data-page-masthead]','[data-project-chapter-navigation]','[data-study-motion-toggle]'].map(selector=>{const nodes=[...document.querySelectorAll(selector)],el=nodes[0];return{selector,count:nodes.length,visible:el?.checkVisibility({visibilityProperty:true,opacityProperty:true})??false,rect:el?rect(el.getBoundingClientRect()):null};});
  return{rect:rect(r),viewport:{width:innerWidth,height:innerHeight},hit:hit===el||el.contains(hit),focused:document.activeElement===node,focusVisible:node.matches(':focus-visible'),chrome};
 });
 const {rect:r,viewport:v}=value;expect(r.left).toBeGreaterThanOrEqual(0);expect(r.right).toBeLessThanOrEqual(v.width);expect(r.top).toBeGreaterThanOrEqual(0);expect(r.bottom).toBeLessThanOrEqual(v.height);expect(r.height).toBeGreaterThanOrEqual(44);expect(value.hit).toBe(true);
 for(const item of value.chrome){expect(item.count,item.selector).toBe(1);if(item.visible){const c=item.rect;expect(Math.max(0,Math.min(r.right,c.right)-Math.max(r.left,c.left))*Math.max(0,Math.min(r.bottom,c.bottom)-Math.max(r.top,c.top))).toBe(0);}}
 return value;
}
async function inspect(page,receipt){
 const guide=page.locator('[data-special-planning-guide]');await expect(guide).toHaveCount(1);
 const image=guide.locator('[data-project-evidence-image]');await expect(image).toHaveCount(1);await image.scrollIntoViewIfNeeded();await expect.poll(()=>image.evaluate(node=>node.complete&&node.naturalWidth>0)).toBe(true);
 await expect(image).toHaveAttribute('src',source.src);await expect(image).toHaveAttribute('alt',source.alt);await expect(page.locator(`img[src="${source.src}"]`)).toHaveCount(1);
 await expect(guide).toHaveAttribute('data-study-evidence-layout','full');await expect(guide).toHaveAttribute('data-study-evidence-role','technical-plate');
 await expect(guide.locator('[data-information-window]')).toHaveCount(2);
 await expect(page.locator('[data-evidence-source-link]')).toHaveCount(4);
 await expect(guide.locator('figcaption > p')).toHaveText(source.caption);await expect(guide.locator('figcaption > span:not([data-information-skin])')).toHaveText(source.credit);
 const original=image.locator('xpath=ancestor::a[1]');await expect(original).toHaveAttribute('href',source.src);await expect(original).toHaveAttribute('target','_blank');
 const action=guide.locator('[data-evidence-source-link]');await expect(action).toHaveAttribute('href',source.src);await expect(action).toHaveAccessibleName(`Open full image (new tab): ${source.alt}`);
 receipt.geometry=await image.evaluate(node=>{const r=node.getBoundingClientRect();return{natural:[node.naturalWidth,node.naturalHeight],rendered:[r.width,r.height],objectFit:getComputedStyle(node).objectFit,src:node.currentSrc,bodyWidth:document.documentElement.scrollWidth,viewport:innerWidth};});
 expect(receipt.geometry.natural).toEqual([1536,1903]);expect(Math.abs(receipt.geometry.rendered[0]/receipt.geometry.rendered[1]-1536/1903)).toBeLessThan(.001);expect(receipt.geometry.objectFit).not.toBe('cover');expect(receipt.geometry.bodyWidth).toBeLessThanOrEqual(receipt.geometry.viewport);
 const overlay=guide.locator('svg');await expect(overlay).toHaveAttribute('viewBox','0 0 1536 1903');await expect(overlay).toHaveAttribute('aria-hidden','true');await expect(overlay).toHaveCSS('pointer-events','none');
 const rects=guide.locator('[data-planning-region] [data-planning-stroke=outline]');await expect(rects).toHaveCount(3);
 expect(await rects.evaluateAll(nodes=>nodes.map(node=>['x','y','width','height'].map(key=>Number(node.getAttribute(key)))))).toEqual(bounds);
 const radios=guide.getByRole('radio');await expect(radios).toHaveCount(4);for(const [index,label] of ['Complete plate','Generate assembly','Plan trajectories','Replan failed index'].entries())await expect(radios.nth(index)).toHaveAccessibleName(label);expect(await radios.evaluateAll(nodes=>nodes.map(node=>node.value))).toEqual(['all','0','1','2']);await expect(radios.first()).toBeChecked();
 return{guide,image,radios,action};
}
async function capture(page,info,name){const path=info.outputPath(name+'.png');await page.screenshot({path,scale:'device'});await info.attach(name,{path,contentType:'image/png'});}
async function choices(page,guide,radios,receipt,info){
 await tabTo(page,radios.first());receipt.initialFocus=await visibleControl(radios.first());expect(receipt.initialFocus.focused).toBe(true);expect(receipt.initialFocus.focusVisible).toBe(true);
 receipt.choices=[];
 for(let index=0;index<3;index++){
  await page.keyboard.press('ArrowRight');await expect(radios.nth(index+1)).toBeChecked();await expect(guide.locator(`[data-planning-description="${index}"]`)).toBeVisible();await expect(guide.locator(`[data-planning-description="${index}"]`)).toHaveText(section.diagramFocus.steps[index].description);await expect(guide.locator(`[data-planning-region="${index}"]`)).toHaveCSS('opacity','1');
  receipt.choices.push(await visibleControl(radios.nth(index+1)));
  if(index===2){
   const feedback=()=>guide.evaluate(node=>{
    const box=el=>{const r=el.getBoundingClientRect();return{top:r.top,bottom:r.bottom,left:r.left,right:r.right,intersectsViewport:r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth,fullyInViewport:r.top>=0&&r.bottom<=innerHeight&&r.left>=0&&r.right<=innerWidth};};
    const chrome=['[data-page-masthead]','[data-project-chapter-navigation]','[data-study-motion-toggle]'].map(selector=>{const nodes=[...document.querySelectorAll(selector)],el=nodes[0];return{selector,count:nodes.length,visible:el?.checkVisibility({visibilityProperty:true,opacityProperty:true})??false,rect:el?box(el):null};});
    const chosen=node.querySelector('input:checked'),active=document.activeElement;
    return{description:box(node.querySelector('[data-planning-description="2"]')),region:box(node.querySelector('[data-planning-region="2"]')),chrome,chosen:chosen?.value,focusedValue:node.contains(active)?active.value??null:null,viewport:{width:innerWidth,height:innerHeight},y:scrollY};
   });
   receipt.selectedFeedback=await feedback();await capture(page,info,'special-planning-selected-controls');
   // Preserve the unassisted selection viewport above. Native document reading
   // may then scroll to the explanation; do not pretend this was simultaneous.
   await guide.locator('[data-planning-description="2"]').evaluate(node=>node.scrollIntoView({block:'center',behavior:'instant'}));
   receipt.explanationReading=await feedback();await capture(page,info,'special-planning-explanation-reading');
   const reading=receipt.explanationReading,d=reading.description;expect(reading.chosen).toBe('2');expect(d.fullyInViewport).toBe(true);
   for(const item of reading.chrome){expect(item.count,item.selector).toBe(1);if(item.visible){const c=item.rect;expect(Math.max(0,Math.min(d.right,c.right)-Math.max(d.left,c.left))*Math.max(0,Math.min(d.bottom,c.bottom)-Math.max(d.top,c.top))).toBe(0);}}

  }
 }
 for(let index=2;index>=0;index--){await page.keyboard.press('ArrowLeft');await expect(radios.nth(index)).toBeChecked();}
 await expect(guide.locator('[data-planning-description="all"]')).toBeVisible();for(const region of await guide.locator('[data-planning-region]').all())await expect(region).toHaveCSS('opacity','0');
}

test('Special planning areas preserve the complete source with native keyboard, reduced, Pause and forced-color reading',async({page},info)=>{
 const receipt={policy:'Reduced reading then native Full/Pause; source unchanged, not a camera or performance test.'};let primary;
 try{
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto(route);await page.evaluate(()=>document.fonts.ready);
  const {guide,image,radios}=await inspect(page,receipt);await choices(page,guide,radios,receipt,info);
  await page.keyboard.press('ArrowRight');await expect(guide.locator('[data-planning-region="0"] [data-planning-stroke=outline]')).toHaveCSS('transition-duration','0s');
  await page.emulateMedia({reducedMotion:'no-preference'});await page.keyboard.press('ArrowRight');await expect(guide.locator('[data-planning-region="1"] [data-planning-stroke=outline]')).toHaveCSS('transition-duration','0.22s');
  const pause=page.locator('[data-study-motion-toggle]');await pause.click();await expect(pause).toHaveAttribute('aria-pressed','true');
  await radios.nth(3).check();await expect(guide.locator('[data-planning-region="2"] [data-planning-stroke=outline]')).toHaveCSS('transition-duration','0s');
  await page.emulateMedia({forcedColors:'active'});expect(await page.evaluate(()=>matchMedia('(forced-colors: active)').matches)).toBe(true);
  receipt.forced=await radios.nth(3).evaluate(node=>{
   const label=node.closest('label'),s=getComputedStyle(label),group=[];for(let el=label;el;el=el.parentElement)group.push(Number(getComputedStyle(el).opacity));
   return{color:s.color,background:s.backgroundColor,opacity:group,outline:getComputedStyle(document.querySelector('[data-planning-region="2"] [data-planning-stroke=outline]')).stroke,halo:getComputedStyle(document.querySelector('[data-planning-region="2"] [data-planning-stroke=halo]')).stroke};
  });
  await capture(page,info,'special-planning-forced');expect(receipt.forced.opacity.every(value=>value===1)).toBe(true);expect(contrast(receipt.forced.color,receipt.forced.background)).toBeGreaterThanOrEqual(4.5);expect(contrast(receipt.forced.outline,receipt.forced.halo)).toBeGreaterThanOrEqual(3);await page.emulateMedia({forcedColors:'none'});
  await page.setViewportSize({width:320,height:844});await radios.nth(3).check();await radios.nth(3).scrollIntoViewIfNeeded();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);for(const label of await guide.locator('label').all())expect((await label.boundingBox()).height).toBeGreaterThanOrEqual(44);
  receipt.compact=await visibleControl(radios.nth(3));await capture(page,info,'special-planning-controls-320');
  await guide.locator('[data-planning-region="2"] [data-planning-stroke=outline]').scrollIntoViewIfNeeded();await capture(page,info,'special-planning-plate-320');const full=info.outputPath('special-planning-complete-figure-320.png');await guide.screenshot({path:full,scale:'device'});await info.attach('special-planning-complete-figure-320',{path:full,contentType:'image/png'});await expect(image).toHaveAttribute('src',source.src);
 }catch(error){primary=error;throw error;}finally{try{await persist(info,receipt);}catch(error){if(!primary)throw error;}}
});
test.describe('Special planning without JavaScript',()=>{
 test.use({javaScriptEnabled:false});
 test('native planning choices and original source remain accessible without JavaScript',async({page,isMobile},info)=>{
  const receipt={policy:'No application JavaScript; native radios and original image.'};let primary;
  try{
   await page.goto(route);await page.evaluate(()=>document.fonts.ready);const {guide,radios,action}=await inspect(page,receipt);await choices(page,guide,radios,receipt,info);
   if(isMobile){const label=radios.nth(3).locator('..');await label.scrollIntoViewIfNeeded();const b=await label.boundingBox();await page.touchscreen.tap(b.x+b.width/2,b.y+b.height/2);await expect(radios.nth(3)).toBeChecked();}
   await tabTo(page,action);receipt.action=await visibleControl(action);const before={url:page.url(),y:await page.evaluate(()=>scrollY)};let popup,failed;
   try{[popup]=await Promise.all([page.waitForEvent('popup'),page.keyboard.press('Enter')]);await popup.waitForLoadState('domcontentloaded');expect(new URL(popup.url()).pathname).toBe(source.src);const img=popup.locator('img');await expect.poll(()=>img.evaluate(node=>node.complete&&node.naturalWidth>0)).toBe(true);expect(await img.evaluate(node=>[node.naturalWidth,node.naturalHeight])).toEqual([1536,1903]);}
   catch(error){failed=error;throw error;}finally{try{if(popup)await popup.close();await page.bringToFront();}catch(error){if(!failed)throw error;}}
   expect(page.url()).toBe(before.url);expect(await page.evaluate(()=>scrollY)).toBe(before.y);await expect(action).toBeFocused();receipt.returned=before;await capture(page,info,'special-planning-nojs-source-action');
  }catch(error){primary=error;throw error;}finally{try{await persist(info,receipt);}catch(error){if(!primary)throw error;}}
 });
});
