import {test,expect} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
import {WAIT,frames,scenarioTimeout} from './case-helpers.mjs';
test.use({video:'on'});
const facts=page=>page.evaluate(()=>({y:scrollY,...document.querySelector('[data-xr-stage]').__xrStage.inspect()}));
async function nativeReading(page,progress,steps=1){
 const destination=await page.evaluate(progress=>{
  // Match the Director's cached natural-layout contract, not fractional transformed rects.
  const naturalY=node=>{let top=0;for(;node;node=node.offsetParent)top+=node.offsetTop;return top;};
  const nodes=[...document.querySelectorAll('[data-xr-chapter]')],i=nodes.findIndex(n=>n.dataset.xrChapter==='method'),top=naturalY(nodes[i]),end=naturalY(nodes[i+1]);
  return Math.max(0,Math.min(document.documentElement.scrollHeight-innerHeight,top+(end-top)*progress-innerHeight*.42));
 },progress);
 try{
 const from=await page.evaluate(()=>scrollY);await page.mouse.move(8,page.viewportSize().height*.5);
 for(let i=1;i<=steps;i++){
  const goal=from+(destination-from)*i/steps,current=await page.evaluate(()=>scrollY);await page.mouse.wheel(0,goal-current);
  await page.waitForFunction(goal=>Math.abs(scrollY-goal)<=1,goal,{timeout:WAIT});if(steps>1)await frames(page,2);
 }
 await page.waitForFunction(destination=>{
  const s=document.querySelector('[data-xr-stage]')?.__xrStage.inspect();
  if(Math.abs(scrollY-destination)>1||s.chapter!=='method'||s.scene.chapter!=='method'||s.scene.mode!=='hold'||!s.scene.settled||s.scene.paintPending||!s.camera.settled||s.camera.recovering||!s.camera.idleActive||s.resource?.mode!=='webgl-model'||!s.resource.successfulPaint)return false;
  // Match the Director's cached natural-layout contract, not fractional transformed rects.
  const naturalY=node=>{let top=0;for(;node;node=node.offsetParent)top+=node.offsetTop;return top;};
  const nodes=[...document.querySelectorAll('[data-xr-chapter]')],i=nodes.findIndex(n=>n.dataset.xrChapter==='method'),top=naturalY(nodes[i]),end=naturalY(nodes[i+1]);
  const actual=Math.max(0,Math.min(1,(scrollY+innerHeight*.42-top)/Math.max(1,end-top)));
  return Math.abs(s.camera.modelProgress-actual)<=1e-9;
 },destination,{timeout:WAIT});
 }catch(error){
  try{
   const diagnostic=await page.evaluate(destination=>{
    const naturalY=node=>{let top=0;for(;node;node=node.offsetParent)top+=node.offsetTop;return top;};
    const geometry=node=>node?{chapter:node.dataset.xrChapter,offsetTop:naturalY(node),rectTop:node.getBoundingClientRect().top+scrollY,offsetHeight:node.offsetHeight}:null;
    const nodes=[...document.querySelectorAll('[data-xr-chapter]')],i=nodes.findIndex(n=>n.dataset.xrChapter==='method'),method=geometry(nodes[i]),next=geometry(nodes[i+1]),line=scrollY+innerHeight*.42,clamp=value=>Math.max(0,Math.min(1,value));
    const active=document.activeElement;
    return{destination,y:scrollY,viewport:{width:innerWidth,height:innerHeight},inspect:document.querySelector('[data-xr-stage]')?.__xrStage?.inspect(),activeElement:active?{tag:active.tagName,id:active.id,role:active.getAttribute('role'),modelControl:active.hasAttribute('data-xr-model-control')}:null,method,next,progress:method&&next?{offset:clamp((line-method.offsetTop)/Math.max(1,next.offsetTop-method.offsetTop)),rect:clamp((line-method.rectTop)/Math.max(1,next.rectTop-method.rectTop))}:null};
   },destination);
   const receipt=test.info().outputPath('xr-native-reading-failure.json');await writeFile(receipt,JSON.stringify(diagnostic,null,2));await test.info().attach('xr-native-reading-failure',{path:receipt,contentType:'application/json'});
  }catch(diagnosticError){console.warn('XR failure diagnostic unavailable:',diagnosticError.message);}
  throw error;
 }
 return facts(page);
}
test('XR native scrolling directs the complete model while idle is compositor-only and recorded media remains independent',async({page})=>{
 test.setTimeout(scenarioTimeout(90000));
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 expect((await page.goto('/projects/xr-bending-active/')).status()).toBe(200);
 await page.waitForFunction(()=>window.__site?.inspect().phase==='entered',null,{timeout:WAIT});
 await page.mouse.click(8,page.viewportSize().height*.5);
 const a=await nativeReading(page,.15),b=await nativeReading(page,.8,6),reverse=await nativeReading(page,.15,6);
 expect(b.camera.intent.yawRad-a.camera.intent.yawRad).toBeGreaterThan(.1);expect(reverse.camera.intent.yawRad).toBeCloseTo(a.camera.intent.yawRad,3);
 // The authored 38° → 34° → 32° lens is sampled by native document progress,
 // including reversal; handheld motion must never replace this camera intent.
 for(const sample of [a,b,reverse]){
  const progress=sample.camera.modelProgress,local=progress<=.5?progress*2:(progress-.5)*2,ease=local*local*(3-2*local),lens=progress<=.5?38-4*ease:34-2*ease;
  expect(sample.camera.intent.fovDeg).toBeCloseTo(lens,9);expect(sample.resource.view.cameraIntent).toEqual(sample.camera.intent);
 }
 expect(b.camera.intent.fovDeg).toBeLessThan(a.camera.intent.fovDeg);
 expect(reverse.camera.value).toEqual({azimuth:0,elevation:0});expect(reverse.gesture).toBeNull();expect(reverse.acquisitions).toBe(1);
 expect(reverse.resource.sourceRevision).toBe('82e9679c1e47e93cc1a7bbea588eb0f2c8af142d6f7facc6fe5ffaa6148fdc04');
 expect(reverse.resource.support).toMatchObject({disposed:false,points:96312,bytes:2311488});expect(reverse.resource.vertices).toBe(96312);expect(reverse.resource.triangles).toBe(190320);
 const samples=await page.evaluate(()=>new Promise(resolve=>{
  const rows=[];function read(now){const s=document.querySelector('[data-xr-stage]').__xrStage.inspect(),r=s.resource;rows.push({now,y:scrollY,intent:s.camera.intent,draws:r.surface.draws,fits:r.surface.cameraFits,compositor:r.surface.compositor,allocations:r.surface.budget.allocations,pixels:r.surface.budget.budget.width*r.surface.budget.budget.height,transform:document.querySelector('[data-xr-webgl-canvas]').style.transform});if(rows.length===9)resolve(rows);else requestAnimationFrame(read);}requestAnimationFrame(read);
 }));
 for(const row of samples){expect(row.y).toBe(reverse.y);expect(row.intent).toEqual(reverse.camera.intent);expect(row.draws).toBe(reverse.resource.surface.draws);expect(row.fits).toBe(reverse.resource.surface.cameraFits);expect(row.pixels).toBeLessThanOrEqual(524288);expect(Math.abs(row.compositor.xPx)).toBeLessThanOrEqual(1.2);expect(Math.abs(row.compositor.yPx)).toBeLessThanOrEqual(1.2);expect(Math.abs(row.compositor.rollRad)).toBeLessThanOrEqual(.0012);}
 expect(new Set(samples.map(s=>s.transform)).size).toBeGreaterThan(1);expect(new Set(samples.map(s=>s.allocations)).size).toBe(1);
 const png=test.info().outputPath(`xr-scroll-camera-${page.viewportSize().width}.png`);await page.screenshot({path:png});await test.info().attach('xr-authored-camera',{path:png,contentType:'image/png'});
 await expect(page.locator('[data-xr-motion-toggle]')).toHaveCount(0);await expect(page.getByRole('button',{name:/pause|resume/i})).toHaveCount(0);
 const moving=await facts(page);await frames(page,8);const continuous=await facts(page);expect(continuous.camera.intent).toEqual(moving.camera.intent);expect(continuous.camera.activeSeconds).toBeGreaterThan(moving.camera.activeSeconds);expect(continuous.resource.surface.compositor).not.toEqual(moving.resource.surface.compositor);expect(continuous.resource.surface.draws).toBe(moving.resource.surface.draws);
 await page.mouse.click(8,page.viewportSize().height*.5);const neutral=await nativeReading(page,.45);
 const control=page.locator('[data-xr-model-control]');await control.evaluate(node=>node.focus({preventScroll:true}));expect(await page.evaluate(()=>scrollY)).toBe(neutral.y);await control.press('ArrowRight');await page.waitForFunction(()=>document.querySelector('[data-xr-stage]').__xrStage.inspect().camera.settled,null,{timeout:WAIT});
 expect((await facts(page)).camera.value.azimuth).toBeLessThan(0);await control.press('Home');await page.waitForFunction(intent=>{const s=document.querySelector('[data-xr-stage]').__xrStage.inspect();return s.camera.settled&&s.camera.value.azimuth===0&&s.camera.value.elevation===0&&!s.scene.paintPending&&JSON.stringify(s.camera.intent)===JSON.stringify(intent)&&JSON.stringify(s.resource.view.cameraIntent)===JSON.stringify(intent);},neutral.camera.intent,{timeout:WAIT});
 const returned=await facts(page);expect(returned.camera.modelProgress).toBeCloseTo(.45,2);expect(returned.resource.view.cameraIntent).toEqual(neutral.camera.intent);expect(returned.camera.intent).toEqual(neutral.camera.intent);
 await expect(page.locator('[data-xr-model-guidance]')).toContainText('current scroll view');
 await page.setViewportSize({width:320,height:844});await page.mouse.click(8,400);await nativeReading(page,.45);
 const targets=await page.locator('[data-xr-chapter-link]').evaluateAll(nodes=>nodes.map(node=>{const r=node.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom};}));
 expect(targets).toHaveLength(8);for(const r of targets){expect(r.width).toBeGreaterThanOrEqual(44);expect(r.height).toBeGreaterThanOrEqual(44);}
 const navigation=await page.getByRole('navigation',{name:'XR project sections',exact:true}).boundingBox();expect(navigation.x).toBeGreaterThanOrEqual(0);expect(navigation.x+navigation.width).toBeLessThanOrEqual(320);expect(navigation.y).toBeGreaterThanOrEqual(0);expect(navigation.y+navigation.height).toBeLessThanOrEqual(844);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
 const chrome=await page.evaluate(()=>{const brand=document.querySelector('[data-home-link]').getBoundingClientRect(),tools=document.querySelector('[data-xr-reading-tools]').getBoundingClientRect();return {overlapX:Math.max(0,Math.min(brand.right,tools.right)-Math.max(brand.left,tools.left)),overlapY:Math.max(0,Math.min(brand.bottom,tools.bottom)-Math.max(brand.top,tools.top))};});
 expect(chrome.overlapX*chrome.overlapY,'Compact XR reading position must not cover the brand/home target').toBe(0);
 const narrowPNG=test.info().outputPath('xr-scroll-camera-320.png');await page.screenshot({path:narrowPNG});await test.info().attach('xr-compact-controls',{path:narrowPNG,contentType:'image/png'});
 const canvas=await page.locator('[data-xr-webgl-canvas]').elementHandle();await page.emulateMedia({reducedMotion:'reduce'});await frames(page,8);const reduced=await facts(page);expect(reduced.reduced).toBe(false);expect(reduced.camera.idleActive).toBe(true);expect(reduced.acquisitions).toBe(1);expect(reduced.disposals).toBe(0);expect(await canvas.evaluate(node=>node===document.querySelector('[data-xr-webgl-canvas]'))).toBe(true);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);expect(errors).toEqual([]);
 const receipt=test.info().outputPath('xr-scroll-camera-receipt.json');await writeFile(receipt,JSON.stringify({a,b,reverse,samples,moving,continuous,returned,reduced},null,2));await test.info().attach('xr-scroll-camera-receipt',{path:receipt,contentType:'application/json'});
});
