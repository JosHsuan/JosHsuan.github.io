import {test,expect} from '@playwright/test';
import {readFile,writeFile} from 'node:fs/promises';
import {WAIT} from './case-helpers.mjs';

const root='../../roles/uiux-designer/cases/bending-active-thesis/release/';
const projects=JSON.parse(await readFile(new URL(root+'project-studies.json',import.meta.url),'utf8')).projects;
const xr=JSON.parse(await readFile(new URL(root+'xr-study.json',import.meta.url),'utf8'));
// Explicit foreground scope, independent of production evidence deduplication.
const names={
 'mode-s-of-making':['film-design-workflow','film-rotary-system','film-corexy-system'],
 'entrance-installation-art':['pattern-variations','workshop-assembly','built-installation'],
 'dot-based-3d-printing':['path-strategies','form-development','translucent-prototypes'],
 'hc3dp-caustics':['layer-system','path-logic','frame-arrangement','overinflation'],
 'special-assemblies':['module-aggregation','planning-workflow','robot-trajectories','assembly-detail'],
 'project-caschlatsch':['portfolio-voxel-framework','portfolio-module-infill','portfolio-xr-assembly-sequence','portfolio-xr-interface','portfolio-xr-data-exchange','portfolio-robotic-assembly'],
};
const routes=Object.entries(names).map(([id,files])=>{
 const project=projects.find(item=>item.id===id);
 return{id,path:`/projects/${project.slug}/`,sources:files.map(name=>project.sections.flatMap(section=>section.media).find(image=>image.src===`/assets/projects/${id}/${name}.webp`))};
});
routes.push({id:'xr',path:'/projects/xr-bending-active/',sources:['adaptiveMethod','physicalCapture','measurement','communication','dataCategories','physicalAssembly','assembly','physicalResult'].map(key=>xr.media[key])});
const selector='a[data-evidence-source-link]';

async function save(info,name,value){
 const path=info.outputPath(name+'.json');await writeFile(path,JSON.stringify(value,null,2));await info.attach(name,{path,contentType:'application/json'});
}
async function open(page,route,{noJS=false}={}){
 expect((await page.goto(route.path)).status()).toBe(200);
 if(!noJS)await page.waitForFunction(()=>window.__site?.inspect().phase==='entered',null,{timeout:WAIT});
 await page.evaluate(()=>document.fonts.ready);
}
function visibility(node){
 const rect=element=>{const r=element.getBoundingClientRect();return{left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height};};
 const box=rect(node),chrome=[...document.querySelectorAll('[data-portfolio-masthead],[data-portfolio-navigation],[data-project-chapter-navigation],[data-study-motion-toggle],[data-xr-chapter-navigation],[data-xr-reading-tools]')].filter(element=>element.checkVisibility({visibilityProperty:true,opacityProperty:true})).map(rect);
 const x=(box.left+box.right)/2,y=(box.top+box.bottom)/2,hit=document.elementFromPoint(x,y);
 return{box,viewport:{width:innerWidth,height:innerHeight},chrome,hit:!!hit&&(hit===node||node.contains(hit)),y:scrollY,focused:document.activeElement===node,focusVisible:node.matches(':focus-visible')};
}
function readable(value){
 const {box,viewport}=value;
 expect(box.width).toBeGreaterThanOrEqual(44);expect(box.height).toBeGreaterThanOrEqual(44);
 expect(box.left).toBeGreaterThanOrEqual(0);expect(box.right).toBeLessThanOrEqual(viewport.width);
 expect(box.top).toBeGreaterThanOrEqual(0);expect(box.bottom).toBeLessThanOrEqual(viewport.height);
 for(const chrome of value.chrome)expect(Math.min(box.right,chrome.right)>Math.max(box.left,chrome.left)&&Math.min(box.bottom,chrome.bottom)>Math.max(box.top,chrome.top),'Source action must not intersect visible fixed chrome').toBe(false);
 expect(value.hit,'Native source action is not occluded').toBe(true);
}
async function wheelTo(page,link){
 const target=await link.evaluate(node=>Math.round(Math.max(0,Math.min(document.documentElement.scrollHeight-innerHeight,scrollY+node.getBoundingClientRect().top-innerHeight*.45))));
 const before=await page.evaluate(()=>scrollY);
 await page.mouse.move(page.viewportSize().width-3,page.viewportSize().height*.5);await page.mouse.wheel(0,target-before);
 await page.waitForFunction(y=>Math.abs(scrollY-y)<=1,target,{timeout:WAIT});
}
function forcedContrast(node){
 const rgba=value=>{const a=value.match(/^rgba?\(([^)]+)\)$/)?.[1].split(/[,\s/]+/).filter(Boolean).map(Number);if(!a||a.length<3||a.some(n=>!Number.isFinite(n)))throw Error('Unsupported paint '+value);return[...a.slice(0,3),a[3]??1];};
 const css=getComputedStyle(node),foreground=rgba(css.color);let background,owner;
 for(let element=node;element;element=element.parentElement){
  const style=getComputedStyle(element);if(Number(style.opacity)!==1)throw Error('Unsupported group opacity');
  if(background)continue;
  const skin=element.querySelector(':scope > [data-information-skin]'),skinCSS=skin&&getComputedStyle(skin),paint=skin&&getComputedStyle(skin,'::before');
  const visible=skin&&skinCSS.display!=='none'&&skinCSS.visibility==='visible'&&Number(skinCSS.opacity)>0&&paint.content!=='none'&&paint.display!=='none'&&paint.visibility==='visible'&&Number(paint.opacity)>0;
  const skinColor=visible?rgba(paint.backgroundColor):null;
  const useSkin=skinColor&&skinColor[3]>0,color=useSkin?skinColor:rgba(style.backgroundColor);
  if(color[3]>0){if(color[3]!==1||(useSkin&&(Number(skinCSS.opacity)!==1||Number(paint.opacity)!==1)))throw Error('Unsupported translucent paint');background=color;owner=element.tagName+(useSkin?' skin::before':'');}
 }
 if(!background||foreground[3]!==1)throw Error('Opaque native source link paint required');
 const lum=rgb=>rgb.slice(0,3).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
 const a=lum(foreground),b=lum(background);return{foreground,background,owner,ratio:(Math.max(a,b)+.05)/(Math.min(a,b)+.05)};
}
async function layout(page,info,noJS){
 const receipts=[];let primaryError;
 try{
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const route of routes){
   await open(page,route,{noJS});
   const links=page.locator(selector);await expect(links).toHaveCount(route.sources.length);
   const records=await links.evaluateAll(nodes=>nodes.map(node=>{
    const figure=node.closest('figure'),caption=node.parentElement,image=figure.querySelector('img'),anchor=image.closest('a'),box=node.getBoundingClientRect(),css=getComputedStyle(node);
    return{href:node.getAttribute('href'),target:node.target,rel:node.rel,text:node.textContent,aria:node.getAttribute('aria-label'),width:box.width,height:box.height,display:css.display,visibility:css.visibility,
     caption:caption.querySelector(':scope > p')?.textContent,credit:caption.querySelector(':scope > span:not([data-information-skin])')?.textContent,
     image:{src:image.getAttribute('src'),width:Number(image.getAttribute('width')),height:Number(image.getAttribute('height')),alt:image.alt,href:anchor.getAttribute('href'),target:anchor.target},count:figure.querySelectorAll('[data-evidence-source-link]').length};
   }));
   receipts.push({id:route.id,noJS,records});
   for(const [index,record] of records.entries()){
    const source=route.sources[index];expect(source).toBeTruthy();
    expect(record).toMatchObject({href:source.src,target:'_blank',rel:'noopener noreferrer',text:'Open full image (new tab)',aria:`Open full image (new tab): ${source.alt}`,caption:source.caption,credit:source.credit,count:1,image:{src:source.src,width:source.width,height:source.height,alt:source.alt,href:source.src,target:'_blank'}});
    expect(record.width).toBeGreaterThanOrEqual(44);expect(record.height).toBeGreaterThanOrEqual(44);expect(record.display).not.toBe('none');expect(record.visibility).toBe('visible');
   }
   const link=links.first();await wheelTo(page,link);const visible=await link.evaluate(visibility);receipts.at(-1).visible=visible;readable(visible);
   const image=link.locator('xpath=ancestor::figure[1]').locator('img');await expect.poll(()=>image.evaluate(node=>node.complete&&node.naturalWidth>0)).toBe(true);
   expect(await image.evaluate(node=>[node.naturalWidth,node.naturalHeight])).toEqual([route.sources[0].width,route.sources[0].height]);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth)).toBe(true);
   const png=info.outputPath(`source-access-${route.id}-${noJS?'no-js':'reduced'}.png`);await page.screenshot({path:png});await info.attach(route.id,{path:png,contentType:'image/png'});
   await page.emulateMedia({forcedColors:'active'});expect(await page.evaluate(()=>matchMedia('(forced-colors: active)').matches)).toBe(true);const contrast=await link.evaluate(forcedContrast);receipts.at(-1).forcedContrast=contrast;expect(contrast.ratio).toBeGreaterThanOrEqual(4.5);
   await page.emulateMedia({forcedColors:'none'});
  }
 }catch(error){primaryError=error;throw error;}
 finally{try{await save(info,'source-access-layout',receipts);}catch(error){if(!primaryError)throw error;}}
}
test('all seven evidence routes retain visible native source actions in reduced layout',async({page},info)=>layout(page,info,false));
test.describe('native source access without application JavaScript',()=>{
 test.use({javaScriptEnabled:false});
 test('all seven routes retain complete captions and source actions without JavaScript',async({page},info)=>layout(page,info,true));
});

async function state(page,link){return{url:page.url(),...await link.evaluate(node=>({y:scrollY,focused:document.activeElement===node,chapter:node.closest('[data-project-chapter],[data-xr-chapter]')?.getAttribute('data-project-chapter')??node.closest('[data-xr-chapter]')?.getAttribute('data-xr-chapter'),semantic:document.querySelector('[data-project-active-chapter]')?.getAttribute('data-project-active-chapter')??document.querySelector('[data-xr-active-chapter]')?.getAttribute('data-xr-active-chapter')??null}))};}
async function readingCurrent(page){
 // Match the existing native chapter owners, not the link's containing section:
 // a focused action can sit below the viewport's reading probe.
 await page.waitForFunction(()=>{
  const xr=document.querySelector('[data-xr-study]'),nodes=[...document.querySelectorAll(xr?'[data-xr-chapter]':'[data-project-chapter]')];
  const line=scrollY+innerHeight*(xr ? .42 : .5);
  const top=node=>{if(!xr)return node.getBoundingClientRect().top+scrollY;let y=0;for(let el=node;el;el=el.offsetParent)y+=el.offsetTop;return y;};
  let current=nodes[0];for(const node of nodes)if(top(node)<=line)current=node;
  const expected=current?.getAttribute(xr?'data-xr-chapter':'data-project-chapter');
  return !!expected&&document.querySelector(xr?'[data-xr-active-chapter]':'[data-project-active-chapter]')?.getAttribute(xr?'data-xr-active-chapter':'data-project-active-chapter')===expected;
 },null,{timeout:WAIT});
}
async function sourcePopup(page,link,source,activate){
 await readingCurrent(page);
 const before=await state(page,link);expect(before.focused).toBe(true);expect(before.semantic).not.toBeNull();
 let popup,primaryError;
 try{
  [popup]=await Promise.all([page.waitForEvent('popup'),activate()]);
  await popup.waitForLoadState('domcontentloaded');expect(new URL(popup.url()).pathname).toBe(source.src);
  const image=popup.locator('img');await expect(image).toHaveCount(1);await expect.poll(()=>image.evaluate(node=>node.complete&&node.naturalWidth>0)).toBe(true);
  expect(await image.evaluate(node=>[node.naturalWidth,node.naturalHeight])).toEqual([source.width,source.height]);
 }catch(error){primaryError=error;throw error;}
 finally{
  try{if(popup)await popup.close();await page.bringToFront();}catch(error){if(!primaryError)throw error;}
 }
 expect(await state(page,link)).toEqual(before);return before;
}
test('native keyboard and touch open original evidence and return to the unchanged reading position',async({page,isMobile},info)=>{
 const receipts=[];let primaryError;
 try{
  for(const route of [routes.find(item=>item.id==='dot-based-3d-printing'),routes.find(item=>item.id==='xr')]){
   await open(page,route);const link=page.locator(selector).first();
   // Traverse real document tab order, with a bound derived from this page's
   // native focusable elements; never inject focus or scroll into place.
   const bound=await page.locator('a[href],button,input,select,textarea,[tabindex]').count();let reached=false;
   for(let index=0;index<bound+2;index++){
    await page.keyboard.press('Tab');if(await link.evaluate(node=>document.activeElement===node)){reached=true;break;}
   }
   expect(reached,'Native Tab must reach the source action').toBe(true);
   const visible=await link.evaluate(visibility);receipts.push({id:route.id,keyboard:visible});readable(visible);expect(visible.focusVisible).toBe(true);
   receipts.at(-1).keyboardReturn=await sourcePopup(page,link,route.sources[0],()=>page.keyboard.press('Enter'));
   if(isMobile){
    const touch=await link.evaluate(visibility);readable(touch);
    receipts.at(-1).touchReturn=await sourcePopup(page,link,route.sources[0],()=>page.touchscreen.tap((touch.box.left+touch.box.right)/2,(touch.box.top+touch.box.bottom)/2));
   }
  }
 }catch(error){primaryError=error;throw error;}
 finally{try{await save(info,'source-access-return',receipts);}catch(error){if(!primaryError)throw error;}}
});
