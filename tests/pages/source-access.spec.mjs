import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
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
// The image pixels and captions remain native content; there is no image viewer.
for(const route of routes)test(`${route.id} retains source images without enlargement controls or image links`,async({page})=>{
 await page.goto(route.path);await page.waitForFunction(()=>window.__site?.inspect().phase==='entered',null,{timeout:WAIT});
 await expect(page.locator('[data-evidence-source-link],[data-inspect-figure],[data-evidence-inspector]')).toHaveCount(0);
 expect(await page.locator('a').evaluateAll(nodes=>nodes.filter(a=>/\.(?:webp|png|jpe?g|gif)(?:[?#]|$)/i.test(a.getAttribute('href')??'')).map(a=>a.outerHTML))).toEqual([]);
 for(const source of route.sources){
  expect(source).toBeTruthy();const img=page.locator(`figure img[src="${source.src}"]`);await expect(img).toHaveCount(1);
  expect(await img.evaluate(node=>({width:+node.getAttribute('width'),height:+node.getAttribute('height'),alt:node.alt,interactive:!!node.closest('a,button,summary')}))).toEqual({width:source.width,height:source.height,alt:source.alt,interactive:false});
  const figure=img.locator('xpath=ancestor::figure[1]');await expect(figure.locator('figcaption')).toContainText(source.caption);
 }
 const image=page.locator('figure img').first();await image.scrollIntoViewIfNeeded();await expect.poll(()=>image.evaluate(n=>n.complete&&n.naturalWidth>0),{timeout:WAIT}).toBe(true);
});
test('image reading and captions remain available without JavaScript on every project route',async({browser,baseURL})=>{
 test.setTimeout(120000);const context=await browser.newContext({javaScriptEnabled:false,baseURL});
 try{const page=await context.newPage();for(const route of routes){await page.goto(route.path);await expect(page.locator('main')).not.toHaveAttribute('inert','');await expect(page.locator('[data-evidence-source-link],[data-inspect-figure]')).toHaveCount(0);expect(await page.locator('figure img').count()).toBeGreaterThan(0);expect(await page.locator('figure img').evaluateAll(nodes=>nodes.some(n=>n.closest('a,button,summary')))).toBe(false);}}finally{await context.close();}
});
