import {test,expect} from '@playwright/test';
import {readFile,writeFile} from 'node:fs/promises';
import {WAIT,scenarioTimeout} from './case-helpers.mjs';

const root='../../roles/uiux-designer/cases/bending-active-thesis/release/';
const projects=JSON.parse(await readFile(new URL(root+'project-studies.json',import.meta.url),'utf8')).projects;
const xr=JSON.parse(await readFile(new URL(root+'xr-study.json',import.meta.url),'utf8'));
// Explicit foreground inventory, independent of production evidence deduplication.
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
 return{id,study:project,path:`/projects/${project.slug}/`,chapters:['overview',...project.sections.map(section=>section.id),'credits'],sources:files.map(name=>project.sections.flatMap(section=>section.media).find(image=>image.src===`/assets/projects/${id}/${name}.webp`))};
});
routes.push({id:'xr',study:xr,path:'/projects/xr-bending-active/',chapters:['overview','context','method','adapt','assemble','join','making','credits'],sources:['adaptiveMethod','physicalCapture','measurement','communication','dataCategories','physicalAssembly','assembly','physicalResult'].map(key=>xr.media[key])});
const removed='a[data-evidence-source-link],a[href^="/assets/"],a[href^="#"],button,input,select,details,summary,[role="radio"],[data-study-motion-toggle],[data-project-model-engage],[data-project-model-return]';
async function save(info,name,value){const path=info.outputPath(name+'.json');await writeFile(path,JSON.stringify(value,null,2));await info.attach(name,{path,contentType:'application/json'});}
async function open(page,route,noJS=false){
 expect((await page.goto(route.path)).status()).toBe(200);
 if(!noJS)await page.waitForFunction(()=>window.__site?.inspect().phase==='entered',null,{timeout:WAIT});
 await page.evaluate(()=>document.fonts.ready);
}
// Real wheel input, never scrollIntoView, focus injection, section-link activation
// or app diagnostics that could supply a reading command.
async function wheelTo(page,node){
 const target=await node.evaluate(n=>Math.max(0,Math.min(document.documentElement.scrollHeight-innerHeight,n.getBoundingClientRect().top+scrollY-innerHeight*.35)));
 const before=await page.evaluate(()=>scrollY);await page.mouse.move(page.viewportSize().width-3,page.viewportSize().height*.5);await page.mouse.wheel(0,target-before);
 await expect.poll(()=>page.evaluate(y=>Math.abs(scrollY-y),target),{timeout:WAIT}).toBeLessThanOrEqual(1);
 return{before,target,after:await page.evaluate(()=>scrollY)};
}
function sourceFacts(image){
 const figure=image.closest('figure'),box=image.getBoundingClientRect(),css=getComputedStyle(image);
 return{src:image.getAttribute('src'),width:Number(image.getAttribute('width')),height:Number(image.getAttribute('height')),alt:image.alt,natural:[image.naturalWidth,image.naturalHeight],linked:!!image.closest('a,button'),caption:figure?.querySelector('figcaption > p')?.textContent,credit:figure?.querySelector('figcaption > span:not([data-information-skin])')?.textContent,fit:css.objectFit,box:{left:box.left,right:box.right,width:box.width,height:box.height},viewport:{width:innerWidth,height:innerHeight}};
}
async function audit(page,info,noJS){
 test.setTimeout(scenarioTimeout(180000));const receipt=[];let primary;
 try{
  // A browser preference is not an alternate static reading product: it must
  // expose the same complete documents, without introducing a Pause switch.
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const route of routes){
   await open(page,route,noJS);await expect(page.locator('main').locator(removed)).toHaveCount(0);
   await expect(page.locator('[data-project-chapter-navigation],[data-xr-chapter-navigation]').locator('a,button,input,[tabindex]')).toHaveCount(0);
   const row={id:route.id,noJS,sources:[],chapters:[],prose:[]};receipt.push(row);
   for(const source of route.sources){
    expect(source).toBeTruthy();const image=page.locator(`img[src="${source.src}"]`).first();await expect(image).toHaveCount(1);
    const wheel=await wheelTo(page,image);await expect(image).toBeInViewport();
    await expect.poll(()=>image.evaluate(n=>n.complete&&n.naturalWidth>0),{timeout:WAIT}).toBe(true);
    const facts=await image.evaluate(sourceFacts);row.sources.push({wheel,...facts});
    expect(facts).toMatchObject({src:source.src,width:source.width,height:source.height,alt:source.alt,natural:[source.width,source.height],linked:false,caption:source.caption,credit:source.credit});
    // Native dimensions plus contain-fit preserve the complete raster even
    // when a viewport-height ceiling letterboxes its CSS element box.
    expect(facts.fit).toBe('contain');
    expect(facts.box.left).toBeGreaterThanOrEqual(0);expect(facts.box.right).toBeLessThanOrEqual(facts.viewport.width);
    const caption=image.locator('xpath=ancestor::figure[1]').locator('figcaption');await wheelTo(page,caption);await expect(caption).toBeInViewport();await expect(caption).toBeVisible();
   }
   for(const id of route.chapters){
    const chapter=page.locator(`[data-${route.id==='xr'?'xr':'project'}-chapter="${id}"]`);await expect(chapter).toHaveCount(1);
    const heading=chapter.locator('h1,h2').first();const wheel=await wheelTo(page,heading);await expect(heading).toBeInViewport();await expect(heading).toBeVisible();row.chapters.push({id,wheel,text:await heading.textContent()});
   }
   const prose=route.id==='xr'
    ?[xr.introduction,...['context','method','prototype','making'].flatMap(id=>xr.sections[id].paragraphs),...xr.workflow.map(step=>step.description),...xr.phoneStages.flatMap(stage=>[stage.description,stage.caption,stage.credit]),...xr.credits.map(credit=>credit.names),xr.sourceNote]
    :[route.study.summary,...route.study.sections.flatMap(section=>section.paragraphs),...route.study.credits.map(credit=>credit.names),route.study.sourceNote];
   for(const text of new Set(prose)){
    const paragraph=page.locator('main').getByText(text,{exact:true}).first();await expect(paragraph).toHaveCount(1);
    const wheel=await wheelTo(page,paragraph);await expect(paragraph).toBeVisible();await expect(paragraph).toBeInViewport();
    expect(await paragraph.evaluate(n=>!n.closest('[hidden],[inert],details:not([open])'))).toBe(true);row.prose.push({text,wheel});
   }
   expect(new URL(page.url()).hash).toBe('');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth)).toBe(true);
   await page.screenshot({path:info.outputPath(`scroll-source-${route.id}-${noJS?'no-js':'preference'}.png`)});
  }
 }catch(error){primary=error;throw error;}finally{try{await save(info,'scroll-source-reading',receipt);}catch(error){if(!primary)throw error;}}
}
test('all 31 original evidence sources, provenance and every chapter are readable using only scrolling',async({page},info)=>audit(page,info,false));
test.describe('native documentary reading without application JavaScript',()=>{
 test.use({javaScriptEnabled:false});
 test('all seven evidence routes remain complete and scroll-readable without JavaScript',async({page},info)=>audit(page,info,true));
});

test('native reading keys scroll the document rather than entering model or chapter modes',async({page},info)=>{
 const receipt=[];let primary;
 try{
  for(const route of [routes.find(item=>item.id==='dot-based-3d-printing'),routes.find(item=>item.id==='entrance-installation-art')]){
   await open(page,route);await expect(page.locator('main').locator(removed)).toHaveCount(0);
   const row={id:route.id,keys:[]};receipt.push(row);
   for(const key of ['PageDown','ArrowDown','Space']){
    const before=await page.evaluate(()=>scrollY);await page.keyboard.press(key);await expect.poll(()=>page.evaluate(()=>scrollY),{timeout:WAIT}).toBeGreaterThan(before);row.keys.push({key,before,after:await page.evaluate(()=>scrollY)});
   }
   await page.keyboard.press('End');await expect(page.locator('[data-project-chapter="credits"]')).toBeInViewport();row.end=await page.evaluate(()=>scrollY);
   await page.keyboard.press('Home');await expect.poll(()=>page.evaluate(()=>scrollY),{timeout:WAIT}).toBe(0);expect(new URL(page.url()).hash).toBe('');
   expect(await page.evaluate(()=>document.querySelector('main').inert)).toBe(false);
  }
 }catch(error){primary=error;throw error;}finally{try{await save(info,'native-reading-keys',receipt);}catch(error){if(!primary)throw error;}}
});

test('a genuinely failed opening image keeps truthful status and complete scrolling content',async({page},info)=>{
 const project=projects.find(item=>item.id==='entrance-installation-art'),image=project.hero,receipt={source:image.src};let primary;
 try{
  await page.route('**'+image.src,route=>route.abort());expect((await page.goto(`/projects/${project.slug}/`)).status()).toBe(200);
  await page.waitForFunction(()=>['entered','failed'].includes(window.__site?.inspect().phase),null,{timeout:WAIT});await expect(page.locator('[data-site-loader]')).toBeHidden();
  const figure=page.locator(`[data-project-native-source="overview"] [data-editorial-source="${image.src}"]`);await expect(figure).toHaveAttribute('data-editorial-image-state','failed');
  const status=figure.locator('[role="status"]');await wheelTo(page,status);await expect(status).toBeVisible();await expect(status).toContainText('Image unavailable');
  expect(await figure.locator('img').evaluate(n=>n.complete&&n.naturalWidth===0)).toBe(true);
  await expect(figure.locator('figcaption > p')).toHaveText(image.caption);await expect(figure.locator('figcaption > span:not([data-information-skin])')).toHaveText(image.credit);
  await expect(page.locator('main').locator(removed)).toHaveCount(0);
  for(const id of [...project.sections.map(section=>section.id),'credits']){const chapter=page.locator(`[data-project-chapter="${id}"]`);await wheelTo(page,chapter.locator('h2').first());await expect(chapter.locator('h2').first()).toBeInViewport();}
  receipt.entry=await page.evaluate(()=>window.__site.inspect());receipt.image=await figure.locator('img').evaluate(sourceFacts);receipt.y=await page.evaluate(()=>scrollY);
  expect(receipt.entry.history.filter(row=>row.id===receipt.entry.id&&['entered','failed','cancelled'].includes(row.phase))).toHaveLength(1);
  expect(await page.locator('main').evaluate(n=>n.inert)).toBe(false);expect(new URL(page.url()).hash).toBe('');
 }catch(error){primary=error;throw error;}finally{try{await save(info,'scroll-source-real-failure',receipt);}catch(error){if(!primary)throw error;}}
});
