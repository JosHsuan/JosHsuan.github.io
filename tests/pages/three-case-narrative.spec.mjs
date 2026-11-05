import {test,expect} from '@playwright/test';
import {readFile,writeFile} from 'node:fs/promises';
import {WAIT} from './case-helpers.mjs';

const projects=JSON.parse(await readFile(new URL('../../roles/uiux-designer/cases/bending-active-thesis/release/project-studies.json',import.meta.url),'utf8')).projects;
// Explicit reviewed plates: do not derive eligibility from the production dedup
// helper, which would let a lost foreground plate silently remove its own test.
const cases=[
 {id:'dot-based-3d-printing',truth:{system:'not a finished solid or a complete fabrication sequence',making:'not presented as one continuous recorded operation'},plates:{system:['path-strategies','form-development']}},
 {id:'special-assemblies',truth:{system:'failure-index branch supports replanning an identified trajectory',making:'simulation, not footage of a completed physical assembly'},plates:{system:['module-aggregation','planning-workflow'],making:['robot-trajectories']}},
 {id:'project-caschlatsch',truth:{system:'part of the shared research','xr-guidance':'My interface contributions sat within this collaborative CAD, cloud and XR system.'},plates:{system:['portfolio-voxel-framework','portfolio-module-infill'],'xr-guidance':['portfolio-xr-assembly-sequence','portfolio-xr-interface','portfolio-xr-data-exchange']}}
];

// Read the settled state and its geometry in the same browser task. A separate
// earlier identity receipt can precede a late native scroll/Director update.
// Keep source pixels, real motion, original tolerances and case deadlines.
async function settledReading(element,noJS,kind='state'){
 let sample;
 await expect.poll(async()=>{
  sample=await element.evaluate((node,{noJS,kind})=>{
   const selector='[data-information-window][data-information-ready][data-information-plane]';
   const owners=new Set(node.querySelectorAll('[data-information-window]'));
   for(let parent=node;parent;parent=parent.parentElement)if(parent.matches('[data-information-window]'))owners.add(parent);
   const planes=[...owners].filter(owner=>owner.matches(selector)).map(owner=>{
    const transform=getComputedStyle(owner).transform;
    return{kind:owner.dataset.informationWindow,moving:owner.dataset.informationMoving,transform,flow:Number(owner.style.getPropertyValue('--information-flow')),motion:owner.dataset.glassMotion};
   });
   // Editorial SourceFigure intentionally keeps its image native; its sibling
   // caption owns the liquid plane. This explicit ownerless image is distinct
   // from a declared window whose presenter has not become ready.
   const nativeImage=kind==='image'&&node.matches('[data-editorial-image]')&&owners.size===0;
   // Native scroll changes rectangles before its event reaches the existing
   // Director. Require that owner's current document position, not a settled
   // pose left over from the preceding source-image capture.
   if(!noJS){
    const field=window.__globalBackground?.inspect().driver.homeScrolling.informationWindows;
    for(const owner of owners){
     let top=0;for(let current=owner;current;current=current.offsetParent)top+=current.offsetTop;
     const height=owner.clientHeight,width=owner.clientWidth;
     const item=field?.items.find(row=>row.kind===owner.dataset.informationWindow&&row.top===top&&row.width===width&&row.height===height);
     const target=Math.max(-1,Math.min(1,(scrollY+innerHeight/2-top-height/2)*2/(innerHeight+height)));
     if(!item||Math.abs(item.target-target)>1e-9)return null;
    }
   }
   // Settled input retains Feed's spatial shoulder. A perspective matrix alone
   // is not identity even when all painted z=0 points are visually unchanged.
   if(!noJS&&((!planes.length&&!nativeImage)||planes.length!==owners.size||!planes.every(plane=>plane.moving==='false'&&plane.flow===0&&plane.motion==='feed')))return null;
   const rect=element=>{const r=element.getBoundingClientRect();return{left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height};};
   if(kind==='image'){
    const box=node.getBoundingClientRect(),css=getComputedStyle(node),figure=node.closest('figure'),parent=figure.parentElement,parentCSS=getComputedStyle(parent);
    const inset=['paddingLeft','paddingRight','borderLeftWidth','borderRightWidth'].reduce((sum,key)=>sum+parseFloat(parentCSS[key]),0);
    return{planes,nativeImage,naturalWidth:node.naturalWidth,naturalHeight:node.naturalHeight,width:parseFloat(css.width),height:parseFloat(css.height),x:box.x,screenRight:box.right,viewportWidth:innerWidth,fit:css.objectFit,opacity:css.opacity,clip:css.clipPath,scrollY,
     fullSpan:{figureWidth:parseFloat(getComputedStyle(figure).width),gridContentWidth:parseFloat(parentCSS.width)-inset}};
   }
   if(kind==='caption'){
    const css=getComputedStyle(node),box=rect(node);
    const content={left:box.left+parseFloat(css.borderLeftWidth)+parseFloat(css.paddingLeft),right:box.right-parseFloat(css.borderRightWidth)-parseFloat(css.paddingRight),top:box.top+parseFloat(css.borderTopWidth)+parseFloat(css.paddingTop),bottom:box.bottom-parseFloat(css.borderBottomWidth)-parseFloat(css.paddingBottom)};
    const runs=[...node.querySelectorAll(':scope > p,:scope > span:not([data-information-skin])')].map(element=>{
     const range=document.createRange();range.selectNodeContents(element);
     return{text:element.textContent.trim(),width:element.clientWidth,scrollWidth:element.scrollWidth,height:element.clientHeight,scrollHeight:element.scrollHeight,box:rect(element),lines:[...range.getClientRects()].filter(r=>r.width>0&&r.height>0).map(r=>({left:r.left,right:r.right,top:r.top,bottom:r.bottom}))};
    });
    const skin=node.querySelector(':scope > [data-information-skin]');let decoration=null;
    if(skin){
     const style=getComputedStyle(skin),before=getComputedStyle(skin,'::before');
     decoration={visible:skin.checkVisibility({visibilityProperty:true,opacityProperty:true}),ariaHidden:skin.getAttribute('aria-hidden'),text:skin.textContent.trim(),children:skin.childElementCount,pointerEvents:style.pointerEvents,clip:style.clipPath,box:rect(skin),display:style.display,before:{inset:before.inset,top:before.top,right:before.right,bottom:before.bottom,left:before.left,width:before.width,height:before.height,clip:before.clipPath,content:before.content,pointerEvents:before.pointerEvents}};
    }
    return{planes,width:node.clientWidth,scrollWidth:node.scrollWidth,height:node.clientHeight,scrollHeight:node.scrollHeight,text:node.innerText,box,content,runs,decoration};
   }
   if(kind==='view'){
    const chrome=[...document.querySelectorAll('[data-portfolio-masthead],[data-portfolio-navigation],[data-project-chapter-navigation],[data-study-motion-toggle]')].filter(element=>element.checkVisibility({visibilityProperty:true,opacityProperty:true})).map(element=>({tag:element.tagName,box:rect(element)}));
    let naturalTop=0;for(let current=node;current;current=current.offsetParent)naturalTop+=current.offsetTop;
    const field=window.__globalBackground?.inspect().driver.homeScrolling.informationWindows;
    return{planes,box:rect(node),native:{top:naturalTop,height:node.clientHeight},field:field?.items.filter(item=>item.kind===node.dataset.informationWindow),viewport:{width:innerWidth,height:innerHeight},y:scrollY,chrome};
   }
   return{planes};
  },{noJS,kind});
  return sample!==null;
 },{timeout:WAIT}).toBe(true);
 return sample;
}

async function inspectPlates(page,definition,info,{noJS=false}={}){
 const project=projects.find(item=>item.id===definition.id),receipt={project:project.id,noJS,viewport:page.viewportSize(),plates:[]};let primaryError;
 try{
  if(!noJS)await page.emulateMedia({reducedMotion:'reduce'});
  const response=await page.goto(`/projects/${project.slug}/`);expect(response.status()).toBe(200);
  if(!noJS)await page.waitForFunction(()=>window.__site?.inspect().phase==='entered',null,{timeout:WAIT});
  await page.evaluate(()=>document.fonts.ready);
  await expect(page.locator('h1')).toHaveText(project.title);
  for(const [chapter,truth] of Object.entries(definition.truth))await expect(page.locator(`[data-project-chapter="${chapter}"]`)).toContainText(truth);
  for(const [chapter,names] of Object.entries(definition.plates))for(const name of names){
   const src=`/assets/projects/${project.id}/${name}.webp`,source=project.sections.find(section=>section.id===chapter).media.find(image=>image.src===src);
   expect(source,`${chapter}: reviewed source metadata`).toBeTruthy();
   const image=page.locator(`[data-project-chapter="${chapter}"] [data-project-evidence-image][src="${src}"]`);
   const anchor=image.locator('..'),figure=image.locator('xpath=ancestor::figure[1]'),caption=figure.locator('figcaption');
   await expect(image).toHaveCount(1);
   // A source retained as a background anywhere must not also be promoted.
   await expect(page.locator(`[data-project-media-poster][src="${src}"]`)).toHaveCount(0);
   // Inspect and capture the complete figure at one native position, then
   // inspect/capture its centered caption. Repeated figure→caption→figure→
   // caption travel adds two liquid recoveries without additional evidence.
   if(noJS)await image.scrollIntoViewIfNeeded();else await figure.scrollIntoViewIfNeeded();
   await expect.poll(()=>image.evaluate(node=>node.complete&&node.naturalWidth>0)).toBe(true);
   await expect(image).toBeVisible();await expect(image).toHaveAttribute('alt',source.alt);
   await expect(anchor).not.toHaveAttribute('href');
   await expect(image.locator('xpath=ancestor::a')).toHaveCount(0);
   await expect(caption.locator('p')).toHaveText(source.caption);
   await expect(caption.locator(':scope > span:not([data-information-skin])')).toHaveText(source.credit);
   const geometry=await settledReading(image,noJS,'image');
   receipt.plates.push({chapter,src,caption:source.caption,credit:source.credit,geometry});
   if(source.purpose==='diagram'){
    await expect(figure).toHaveAttribute('data-study-evidence-role','technical-plate');
    await expect(figure).toHaveAttribute('data-study-evidence-layout','full');
    const span=geometry.fullSpan;
    receipt.plates.at(-1).fullSpan=span;
    expect(Math.abs(span.figureWidth-span.gridContentWidth)).toBeLessThan(1);
   }
   expect(geometry.naturalWidth).toBe(source.width);expect(geometry.naturalHeight).toBe(source.height);
   expect(geometry.width).toBeGreaterThan(0);expect(geometry.height).toBeGreaterThan(0);
   expect(Math.abs(geometry.width-geometry.height*geometry.naturalWidth/geometry.naturalHeight)).toBeLessThan(1);
   expect(geometry.x).toBeGreaterThanOrEqual(0);expect(geometry.screenRight).toBeLessThanOrEqual(geometry.viewportWidth);
   expect(geometry.fit).toBe('contain');expect(geometry.opacity).toBe('1');expect(geometry.clip).toBe('none');
   if(!noJS){
    // Full element capture preserves the complete source. Tall figures may
    // extend behind fixed chrome; their captions are also captured separately.
    await settledReading(figure,noJS);
    const path=info.outputPath(`${project.id}-${chapter}-${name}.png`);
    await figure.screenshot({path});await info.attach(`${chapter}-${name}`,{path,contentType:'image/png'});
    await caption.evaluate(node=>node.scrollIntoView({block:'center',behavior:'instant'}));
   }else await caption.scrollIntoViewIfNeeded();
   await expect(caption).toBeVisible();
   const text=await settledReading(caption,noJS,'caption');
   receipt.plates.at(-1).captionGeometry=text;
   expect(text.runs.map(run=>run.text)).toEqual([source.caption,source.credit]);
   for(const run of text.runs){
    expect(run.text.length).toBeGreaterThan(0);expect(run.lines.length).toBeGreaterThan(0);
    expect(run.scrollWidth).toBeLessThanOrEqual(run.width+1);expect(run.scrollHeight).toBeLessThanOrEqual(run.height+1);
    for(const line of run.lines)for(const container of [run.box,text.content]){
     expect(line.left).toBeGreaterThanOrEqual(container.left-1);expect(line.right).toBeLessThanOrEqual(container.right+1);
     expect(line.top).toBeGreaterThanOrEqual(container.top-1);expect(line.bottom).toBeLessThanOrEqual(container.bottom+1);
    }
   }
   expect(text.decoration).not.toBeNull();
   if(text.decoration.visible){
    expect(text.decoration.ariaHidden).toBe('true');expect(text.decoration.text).toBe('');expect(text.decoration.children).toBe(1);
    await expect(caption.locator(':scope > [data-information-skin] > svg[data-glass-warp]')).toHaveAttribute('aria-hidden','true');
    await expect(caption.locator(':scope > [data-information-skin] a,:scope > [data-information-skin] button')).toHaveCount(0);
    expect(text.decoration.pointerEvents).toBe('none');expect(text.decoration.before.pointerEvents).toBe('none');
    expect(text.decoration.clip).not.toBe('none');
   }else expect(noJS).toBe(true);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth)).toBe(true);
   if(!noJS){
    // Keep the complete caption at the same real centered reading position.
    const reading=await settledReading(caption,noJS,'view');
    receipt.plates.at(-1).captionReading=reading;
    expect(reading.box.left).toBeGreaterThanOrEqual(0);expect(reading.box.right).toBeLessThanOrEqual(reading.viewport.width);
    expect(reading.box.top).toBeGreaterThanOrEqual(0);expect(reading.box.bottom).toBeLessThanOrEqual(reading.viewport.height);
    for(const {box} of reading.chrome)expect(reading.box.left<box.right&&reading.box.right>box.left&&reading.box.top<box.bottom&&reading.box.bottom>box.top,'Centered caption must not overlap fixed chrome').toBe(false);
    const captionPath=info.outputPath(`${project.id}-${chapter}-${name}-caption.png`);
    await caption.screenshot({path:captionPath});await info.attach(`${chapter}-${name}-caption`,{path:captionPath,contentType:'image/png'});
   }
  }
 }catch(error){primaryError=error;throw error;}finally{
  try{const path=info.outputPath(`${project.id}-${noJS?'nojs':'reduced'}-source-plates.json`);await writeFile(path,JSON.stringify(receipt,null,2));await info.attach('source-plate-receipt',{path,contentType:'application/json'});}
  catch(error){if(!primaryError)throw error;}
 }
}

for(const definition of cases)test.describe(definition.id,()=>{
 // Keep each native chapter's complete plates and captions within the existing
 // case deadline. Every reviewed source remains mandatory; no longer timeout,
 // disabled animation or omitted capture substitutes for event readiness.
 for(const [chapter,plates] of Object.entries(definition.plates)){
  test(`promoted source plates retain complete source geometry and captions without image-viewer links (${chapter})`,async({page},info)=>{
   await inspectPlates(page,{...definition,plates:{[chapter]:plates}},info);
  });
 }
 test.describe('without JavaScript',()=>{
  test.use({javaScriptEnabled:false});
  test('promoted plates and source descriptions remain accessible in native flow',async({page},info)=>{
   await inspectPlates(page,definition,info,{noJS:true});
  });
 });
});
