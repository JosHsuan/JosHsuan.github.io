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
   await expect(image).toHaveCount(1);
   // A source retained as a background anywhere must not also be promoted.
   await expect(page.locator(`[data-project-media-poster][src="${src}"]`)).toHaveCount(0);
   await image.scrollIntoViewIfNeeded();
   await expect.poll(()=>image.evaluate(node=>node.complete&&node.naturalWidth>0)).toBe(true);
   await expect(image).toBeVisible();await expect(image).toHaveAttribute('alt',source.alt);
   const anchor=image.locator('..'),figure=image.locator('xpath=ancestor::figure[1]'),caption=figure.locator('figcaption');
   await expect(anchor).toHaveAttribute('href',src);
   await expect(anchor).toHaveAttribute('aria-label',`View full image: ${source.alt}`);
   await expect(caption.locator('p')).toHaveText(source.caption);
   await expect(caption.locator(':scope > span:not([data-information-skin])')).toHaveText(source.credit);
   const geometry=await image.evaluate(node=>{
    const box=node.getBoundingClientRect(),css=getComputedStyle(node);
    return{naturalWidth:node.naturalWidth,naturalHeight:node.naturalHeight,width:box.width,height:box.height,x:box.x,viewportWidth:innerWidth,fit:css.objectFit,opacity:css.opacity,clip:css.clipPath,scrollY};
   });
   receipt.plates.push({chapter,src,caption:source.caption,credit:source.credit,geometry});
   if(source.purpose==='diagram'){
    await expect(figure).toHaveAttribute('data-study-evidence-role','technical-plate');
    await expect(figure).toHaveAttribute('data-study-evidence-layout','full');
    const span=await figure.evaluate(node=>{
     const parent=node.parentElement,css=getComputedStyle(parent);
     const inset=['paddingLeft','paddingRight','borderLeftWidth','borderRightWidth'].reduce((sum,key)=>sum+parseFloat(css[key]),0);
     return{figureWidth:node.getBoundingClientRect().width,gridContentWidth:parent.getBoundingClientRect().width-inset};
    });
    receipt.plates.at(-1).fullSpan=span;
    expect(Math.abs(span.figureWidth-span.gridContentWidth)).toBeLessThan(1);
   }
   expect(geometry.naturalWidth).toBe(source.width);expect(geometry.naturalHeight).toBe(source.height);
   expect(geometry.width).toBeGreaterThan(0);expect(geometry.height).toBeGreaterThan(0);
   expect(Math.abs(geometry.width-geometry.height*geometry.naturalWidth/geometry.naturalHeight)).toBeLessThan(1);
   expect(geometry.x).toBeGreaterThanOrEqual(0);expect(geometry.x+geometry.width).toBeLessThanOrEqual(geometry.viewportWidth);
   expect(geometry.fit).toBe('contain');expect(geometry.opacity).toBe('1');expect(geometry.clip).toBe('none');
   await caption.scrollIntoViewIfNeeded();await expect(caption).toBeVisible();
   const text=await caption.evaluate(node=>({width:node.clientWidth,scrollWidth:node.scrollWidth,height:node.clientHeight,scrollHeight:node.scrollHeight,text:node.innerText}));
   receipt.plates.at(-1).captionGeometry=text;
   expect(text.scrollWidth).toBeLessThanOrEqual(text.width+1);expect(text.scrollHeight).toBeLessThanOrEqual(text.height+1);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth)).toBe(true);
   // Full element capture preserves the complete source, not a fabricated crop.
   // A tall technical plate can exceed the native viewport; this does not claim
   // every label is simultaneously visible or that fixed chrome is hidden.
   if(!noJS){
    await figure.scrollIntoViewIfNeeded();
    const path=info.outputPath(`${project.id}-${chapter}-${name}.png`);
    await figure.screenshot({path});await info.attach(`${chapter}-${name}`,{path,contentType:'image/png'});
   }
  }
 }catch(error){primaryError=error;throw error;}finally{
  try{const path=info.outputPath(`${project.id}-${noJS?'nojs':'reduced'}-source-plates.json`);await writeFile(path,JSON.stringify(receipt,null,2));await info.attach('source-plate-receipt',{path,contentType:'application/json'});}
  catch(error){if(!primaryError)throw error;}
 }
}

for(const definition of cases)test.describe(definition.id,()=>{
 test('promoted source plates retain complete static geometry, captions and full-source links',async({page},info)=>{
  await inspectPlates(page,definition,info);
 });
 test.describe('without JavaScript',()=>{
  test.use({javaScriptEnabled:false});
  test('promoted plates and source descriptions remain accessible in native flow',async({page},info)=>{
   await inspectPlates(page,definition,info,{noJS:true});
  });
 });
});
