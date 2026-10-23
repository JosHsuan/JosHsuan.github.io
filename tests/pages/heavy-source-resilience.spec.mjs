import {test,expect} from '@playwright/test';
import {readFile,writeFile} from 'node:fs/promises';
import {createServer} from 'node:http';
import {fileURLToPath} from 'node:url';
import {createPagesPreviewHandler} from '../../scripts/serve-pages.mjs';
import {WAIT,frames} from './case-helpers.mjs';

const project=JSON.parse(await readFile(new URL('../../roles/uiux-designer/cases/bending-active-thesis/release/project-studies.json',import.meta.url),'utf8')).projects.find(item=>item.id==='hc3dp-caustics');
const route=`/projects/${project.slug}/`,stage=page=>page.locator('[data-project-model-stage]');
const source=project.sections.find(section=>section.id==='context').media.find(image=>image.src.endsWith('/layer-system.webp'));
const snapshot=page=>page.evaluate(()=>({site:window.__site.inspect(),model:window.__globalBackground.inspect().driver.projectStudy.scene,inert:document.querySelector('[data-project-study]').inert,y:scrollY}));
async function terminal(page){await expect.poll(()=>page.evaluate(()=>window.__site?.inspect().phase),{timeout:WAIT}).toMatch(/^(entered|failed)$/);}
function staticModel(value,reason){
 expect(value.model.arrivalStatic).toBe(true);expect(value.model.staticReason).toBe(reason);expect(value.model.pending).toBe(false);expect(value.model.resource).toBeNull();expect(value.inert).toBe(false);
 for(const id of new Set(value.model.history.map(row=>row.id))){
  const own=value.model.history.filter(row=>row.id===id);expect(own.filter(row=>row.phase==='requested')).toHaveLength(1);expect(own.filter(row=>['ready','failed','cancelled'].includes(row.phase))).toHaveLength(1);
 }
}
async function readSource(page,info,receipt){
 await expect(page.locator('[data-site-loader]')).toBeHidden();await expect(page.locator('h1')).toHaveText(project.title);
 await expect(stage(page)).toHaveAttribute('data-project-model-rendering','poster');await expect(stage(page).locator('canvas')).toHaveCount(0);
 for(const chapter of project.model.chapters){
  const control=page.locator(`[data-project-model-control][data-project-model-target="${chapter}"]`);
  await expect(control).toHaveAttribute('aria-disabled','true');await expect(control).toHaveAttribute('data-project-model-availability','static');
 }
 const poster=stage(page).locator('[data-project-model-poster]');await expect(poster).toHaveAttribute('src',project.model.poster.src);
 await expect.poll(()=>poster.evaluate(node=>node.complete&&node.naturalWidth>0)).toBe(true);
 expect(await poster.evaluate(node=>[node.naturalWidth,node.naturalHeight])).toEqual([project.model.poster.width,project.model.poster.height]);
 const link=page.locator(`[data-evidence-source-link][href="${source.src}"]`);await expect(link).toHaveCount(1);
 const count=await page.locator('a[href],button,input,select,textarea,[tabindex]').count();let reached=false;
 for(let index=0;index<count+2;index++){
  await page.keyboard.press('Tab');if(await link.evaluate(node=>document.activeElement===node)){reached=true;break;}
 }
 expect(reached,'Native Tab reaches the real HC evidence source action').toBe(true);
 await expect(link).toHaveText('Open full image (new tab)');await expect(link).toHaveAttribute('target','_blank');
 const figure=link.locator('xpath=ancestor::figure[1]');await expect(figure.locator('figcaption > p')).toHaveText(source.caption);await expect(figure.locator('figcaption > span:not([data-information-skin])')).toHaveText(source.credit);
 const image=figure.locator('img');await expect(image).toHaveAttribute('src',source.src);await expect(image).toHaveAttribute('alt',source.alt);
 await expect.poll(()=>image.evaluate(node=>node.complete&&node.naturalWidth>0)).toBe(true);
 expect(await image.evaluate(node=>[node.naturalWidth,node.naturalHeight])).toEqual([source.width,source.height]);
 for(const chrome of ['[data-page-masthead][data-portfolio-masthead]','[data-portfolio-navigation]','[data-project-chapter-navigation]']){await expect(page.locator(chrome)).toHaveCount(1);await expect(page.locator(chrome)).toBeVisible();}
 const visible=await link.evaluate(node=>{
  const rect=element=>{const r=element.getBoundingClientRect();return{left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height};};
  const box=rect(node),hit=document.elementFromPoint((box.left+box.right)/2,(box.top+box.bottom)/2);
  return{box,y:scrollY,viewport:{width:innerWidth,height:innerHeight},focused:document.activeElement===node,focusVisible:node.matches(':focus-visible'),hit:!!hit&&(hit===node||node.contains(hit)),chrome:[...document.querySelectorAll('[data-portfolio-masthead],[data-portfolio-navigation],[data-project-chapter-navigation],[data-study-motion-toggle]')].filter(element=>element.checkVisibility({visibilityProperty:true,opacityProperty:true})).map(rect)};
 });
 receipt.reading=visible;expect(visible.focused).toBe(true);expect(visible.focusVisible).toBe(true);expect(visible.hit).toBe(true);
 expect(visible.box.width).toBeGreaterThanOrEqual(44);expect(visible.box.height).toBeGreaterThanOrEqual(44);
 expect(visible.box.left).toBeGreaterThanOrEqual(0);expect(visible.box.right).toBeLessThanOrEqual(visible.viewport.width);expect(visible.box.top).toBeGreaterThanOrEqual(0);expect(visible.box.bottom).toBeLessThanOrEqual(visible.viewport.height);
 for(const chrome of visible.chrome)expect(Math.min(visible.box.right,chrome.right)>Math.max(visible.box.left,chrome.left)&&Math.min(visible.box.bottom,chrome.bottom)>Math.max(visible.box.top,chrome.top),'HC source action is not hidden by fixed chrome').toBe(false);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth)).toBe(true);
 const png=info.outputPath('hc-native-source-reading.png');await page.screenshot({path:png});await info.attach('hc-native-source-reading',{path:png,contentType:'image/png'});
}
async function save(info,receipt){const path=info.outputPath('heavy-source-resilience.json');await writeFile(path,JSON.stringify(receipt,null,2));await info.attach('heavy-source-resilience',{path,contentType:'application/json'});}

test('HC native held model reaches its existing deadline, aborts, and leaves real source reading usable without late enhancement',async({page},info)=>{
 let handler,release;const gate=new Promise(resolve=>{release=resolve;}),network=[];
 const server=createServer(async(request,response)=>{
  if(request.url.split('?')[0]===project.model.src){
   const event={requestedAt:Date.now(),closed:false,finished:false,released:false,served:false};network.push(event);
   response.on('finish',()=>{event.finished=true;});response.on('close',()=>{event.closed=true;event.closedAt=Date.now();});
   await gate;event.released=true;
   if(response.destroyed){event.closedBeforeRelease=true;return;}
   event.served=true;await handler(request,response);return;
  }
  await handler(request,response);
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const port=server.address().port;
 handler=createPagesPreviewHandler({root:fileURLToPath(new URL('../../.pages-workspace/out/',import.meta.url)),port});
 const browserRequests=[];
 for(const type of ['request','requestfinished','requestfailed'])page.on(type,request=>{if(new URL(request.url()).pathname===project.model.src&&browserRequests.length<16)browserRequests.push({type,url:request.url(),failure:request.failure()?.errorText??null});});
 const receipt={source:project.model.src,bytes:project.model.bytes,sha256:project.model.sha256,network,browserRequests,scope:'Held HTTP acquisition and abort; no late model parse or geometry substitution'};let primaryError;
 try{
  await page.goto(`http://127.0.0.1:${port}`+route,{waitUntil:'domcontentloaded'});
  await expect.poll(()=>network.length,{timeout:WAIT}).toBe(1);await expect(page.locator('[data-site-loader]')).toBeVisible();
  receipt.pending=await snapshot(page);expect(receipt.pending.model.pending).toBe(true);expect(receipt.pending.model.resource).toBeNull();expect(receipt.pending.inert).toBe(true);
  await terminal(page);receipt.terminal=await snapshot(page);
  // Site startup and acquisition have separate existing 15s bounds. Whichever
  // genuinely owns the terminal must expose its reason; do not fake a timeout.
  const reason=receipt.terminal.model.staticReason;expect(['readiness-timeout','load-timeout']).toContain(reason);staticModel(receipt.terminal,reason);
  const terminalFacts=receipt.terminal.model.history.filter(row=>row.phase!=='requested');
  if(reason==='load-timeout')expect(terminalFacts).toEqual([{id:receipt.terminal.model.history[0].id,phase:'failed',reason}]);
  else{
   expect(receipt.terminal.site.phase).toBe('failed');expect(receipt.terminal.site.reason).toBe(reason);
   expect(terminalFacts).toEqual([{id:receipt.terminal.model.history[0].id,phase:'cancelled',reason}]);
  }
  expect(receipt.terminal.model.acquisitions).toBe(1);
  await expect.poll(()=>network[0].closed,{timeout:WAIT}).toBe(true);expect(network[0].finished).toBe(false);expect(network[0].served).toBe(false);
  release();await expect.poll(()=>network[0].released).toBe(true);expect(network[0].closedBeforeRelease).toBe(true);
  await readSource(page,info,receipt);await frames(page,8);receipt.afterRelease=await snapshot(page);
  staticModel(receipt.afterRelease,reason);expect(receipt.afterRelease.model.history).toEqual(receipt.terminal.model.history);expect(receipt.afterRelease.model.acquisitions).toBe(1);expect(network).toHaveLength(1);await expect(stage(page).locator('canvas')).toHaveCount(0);
 }catch(error){primaryError=error;throw error;}
 finally{
  release();
  try{await save(info,receipt);}catch(error){if(!primaryError){primaryError=error;throw error;}}
  finally{try{if(!page.isClosed())await page.goto('about:blank');}catch(error){if(!primaryError)throw error;}finally{server.closeAllConnections();try{await new Promise((resolve,reject)=>server.close(error=>error?reject(error):resolve()));}catch(error){if(!primaryError)throw error;}}}
 }
});

for(const policy of ['reduced-motion','save-data'])test(`HC ${policy} keeps original source reading without any GLB acquisition`,async({page},info)=>{
 const requests=[],receipt={policy,requests};let primaryError;
 page.on('request',request=>{if(/\.(glb|hdr)(?:\?|$)/.test(request.url()))requests.push(request.url());});
 try{
  if(policy==='reduced-motion')await page.emulateMedia({reducedMotion:'reduce'});
  else await page.addInitScript(()=>{
   if(navigator.connection)Object.defineProperty(navigator.connection,'saveData',{configurable:true,get:()=>true});
   else Object.defineProperty(navigator,'connection',{configurable:true,value:Object.assign(new EventTarget(),{saveData:true})});
  });
  await page.goto(route);await terminal(page);
  receipt.policyObservation={kind:policy==='save-data'?'test-init emulated SaveData; not a physical network measurement':'browser reduced-motion media emulation',active:await page.evaluate(policy=>policy==='reduced-motion'?matchMedia('(prefers-reduced-motion: reduce)').matches:!!navigator.connection?.saveData,policy)};expect(receipt.policyObservation.active).toBe(true);
  receipt.initial=await snapshot(page);staticModel(receipt.initial,policy);expect(receipt.initial.model.acquisitions).toBe(0);expect(requests).toEqual([]);
  await readSource(page,info,receipt);await frames(page,8);receipt.afterReading=await snapshot(page);staticModel(receipt.afterReading,policy);expect(receipt.afterReading.model.acquisitions).toBe(0);expect(requests).toEqual([]);
 }catch(error){primaryError=error;throw error;}
 finally{try{await save(info,receipt);}catch(error){if(!primaryError)throw error;}}
});
