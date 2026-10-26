import {test,expect} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
import {WAIT,frames,scenarioTimeout} from './case-helpers.mjs';
test.use({video:'on'});
const facts=page=>page.evaluate(()=>({y:scrollY,...document.querySelector('[data-xr-stage]').__xrStage.inspect()}));
async function capture(page,name){const path=test.info().outputPath(name+'.png');await page.screenshot({path});await test.info().attach(name,{path,contentType:'image/png'});}
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
 const a=await nativeReading(page,.15);await capture(page,'xr-camera-early');
 const crane=await nativeReading(page,.5,6);await capture(page,'xr-camera-crane');
 const b=await nativeReading(page,.90,6);await capture(page,'xr-camera-opposite');
 const reverse=await nativeReading(page,.15,10);
 expect(b.camera.intent.yawRad-a.camera.intent.yawRad).toBeGreaterThan(.1);expect(reverse.camera.intent.yawRad).toBeCloseTo(a.camera.intent.yawRad,3);
 expect(reverse.camera.value).toEqual({azimuth:0,elevation:0});expect(reverse.gesture).toBeNull();expect(reverse.acquisitions).toBe(1);
 expect(reverse.resource.sourceRevision).toBe('82e9679c1e47e93cc1a7bbea588eb0f2c8af142d6f7facc6fe5ffaa6148fdc04');
 expect(reverse.resource.support).toMatchObject({disposed:false,points:96312,bytes:2311488});expect(reverse.resource.vertices).toBe(96312);expect(reverse.resource.triangles).toBe(190320);
 const samples=await page.evaluate(()=>new Promise(resolve=>{
  const rows=[];function read(now){const s=document.querySelector('[data-xr-stage]').__xrStage.inspect(),r=s.resource;rows.push({now,y:scrollY,intent:s.camera.intent,draws:r.surface.draws,fits:r.surface.cameraFits,compositor:r.surface.compositor,allocations:r.surface.budget.allocations,pixels:r.surface.budget.budget.width*r.surface.budget.budget.height,transform:document.querySelector('[data-xr-webgl-canvas]').style.transform});if(rows.length===9)resolve(rows);else requestAnimationFrame(read);}requestAnimationFrame(read);
 }));
 for(const row of samples){expect(row.y).toBe(reverse.y);expect(row.intent).toEqual(reverse.camera.intent);expect(row.draws).toBe(reverse.resource.surface.draws);expect(row.fits).toBe(reverse.resource.surface.cameraFits);expect(row.pixels).toBeLessThanOrEqual(524288);expect(Math.abs(row.compositor.xPx)).toBeLessThanOrEqual(1.2);expect(Math.abs(row.compositor.yPx)).toBeLessThanOrEqual(1.2);expect(Math.abs(row.compositor.rollRad)).toBeLessThanOrEqual(.0012);}
 expect(new Set(samples.map(s=>s.transform)).size).toBeGreaterThan(1);expect(new Set(samples.map(s=>s.allocations)).size).toBe(1);
 const png=test.info().outputPath(`xr-scroll-camera-${page.viewportSize().width}.png`);await page.screenshot({path:png});await test.info().attach('xr-authored-camera',{path:png,contentType:'image/png'});
 await expect(page.locator('[data-xr-motion-toggle],[data-xr-model-control],[data-xr-reading-tools]')).toHaveCount(0);
 const keyboardStart=await page.evaluate(()=>scrollY);await page.keyboard.press('PageDown');
 await expect.poll(()=>page.evaluate(()=>scrollY),{timeout:WAIT}).toBeGreaterThan(keyboardStart);
 const returned=await nativeReading(page,.45);
 expect(returned.camera.value).toEqual({azimuth:0,elevation:0});expect(returned.gesture).toBeNull();
 await page.setViewportSize({width:320,height:844});const narrow=await nativeReading(page,.45);
 expect(narrow.resource.successfulPaint).toBe(true);expect(narrow.acquisitions).toBe(1);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
 const narrowPNG=test.info().outputPath('xr-scroll-camera-320.png');await page.screenshot({path:narrowPNG});await test.info().attach('xr-compact-source',{path:narrowPNG,contentType:'image/png'});
 await page.emulateMedia({reducedMotion:'reduce'});await frames(page,2);
 await expect(page.locator('[data-xr-webgl-canvas]')).toHaveCount(1);
 const preference=await facts(page);expect(preference.reduced).toBe(false);expect(preference.resource.mode).toBe('webgl-model');
 const afterPreference=await nativeReading(page,.8,4);expect(afterPreference.camera.intent.yawRad-preference.camera.intent.yawRad).toBeGreaterThan(.1);
 expect(afterPreference.acquisitions).toBe(1);expect(afterPreference.resource.support).toMatchObject({disposed:false,points:96312,bytes:2311488});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);expect(errors).toEqual([]);
 const receipt=test.info().outputPath('xr-scroll-camera-receipt.json');await writeFile(receipt,JSON.stringify({a,crane,b,reverse,samples,returned,narrow,preference,afterPreference},null,2));await test.info().attach('xr-scroll-camera-receipt',{path:receipt,contentType:'application/json'});
});
