import {test,expect} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
import {WAIT,frames,scenarioTimeout} from './case-helpers.mjs';
test.use({video:'on'});
const facts=page=>page.evaluate(()=>({y:scrollY,...document.querySelector('[data-xr-stage]').__xrStage.inspect()}));
async function nativeReading(page,progress,steps=1){
 const destination=await page.evaluate(progress=>{
  const nodes=[...document.querySelectorAll('[data-xr-chapter]')],i=nodes.findIndex(n=>n.dataset.xrChapter==='method'),top=nodes[i].getBoundingClientRect().top+scrollY,end=nodes[i+1].getBoundingClientRect().top+scrollY;
  return Math.max(0,Math.min(document.documentElement.scrollHeight-innerHeight,top+(end-top)*progress-innerHeight*.42));
 },progress);
 const from=await page.evaluate(()=>scrollY);await page.mouse.move(8,page.viewportSize().height*.5);
 for(let i=1;i<=steps;i++){
  const goal=from+(destination-from)*i/steps,current=await page.evaluate(()=>scrollY);await page.mouse.wheel(0,goal-current);
  await page.waitForFunction(goal=>Math.abs(scrollY-goal)<=1,goal,{timeout:WAIT});if(steps>1)await frames(page,2);
 }
 await page.waitForFunction(destination=>{
  const s=document.querySelector('[data-xr-stage]')?.__xrStage.inspect();
  if(Math.abs(scrollY-destination)>1||s.chapter!=='method'||s.scene.chapter!=='method'||s.scene.mode!=='hold'||!s.scene.settled||s.scene.paintPending||!s.camera.settled||s.camera.recovering||!s.camera.idleActive||s.resource?.mode!=='webgl-model'||!s.resource.successfulPaint)return false;
  const nodes=[...document.querySelectorAll('[data-xr-chapter]')],i=nodes.findIndex(n=>n.dataset.xrChapter==='method'),top=nodes[i].getBoundingClientRect().top+scrollY,end=nodes[i+1].getBoundingClientRect().top+scrollY;
  const actual=Math.max(0,Math.min(1,(scrollY+innerHeight*.42-top)/Math.max(1,end-top)));
  return Math.abs(s.camera.modelProgress-actual)<=1e-9;
 },destination,{timeout:WAIT});
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
 expect(reverse.camera.value).toEqual({azimuth:0,elevation:0});expect(reverse.gesture).toBeNull();expect(reverse.acquisitions).toBe(1);
 expect(reverse.resource.sourceRevision).toBe('82e9679c1e47e93cc1a7bbea588eb0f2c8af142d6f7facc6fe5ffaa6148fdc04');
 expect(reverse.resource.support).toMatchObject({disposed:false,points:96312,bytes:2311488});expect(reverse.resource.vertices).toBe(96312);expect(reverse.resource.triangles).toBe(190320);
 const samples=await page.evaluate(()=>new Promise(resolve=>{
  const rows=[];function read(now){const s=document.querySelector('[data-xr-stage]').__xrStage.inspect(),r=s.resource;rows.push({now,y:scrollY,intent:s.camera.intent,draws:r.surface.draws,fits:r.surface.cameraFits,compositor:r.surface.compositor,allocations:r.surface.budget.allocations,pixels:r.surface.budget.budget.width*r.surface.budget.budget.height,transform:document.querySelector('[data-xr-webgl-canvas]').style.transform});if(rows.length===9)resolve(rows);else requestAnimationFrame(read);}requestAnimationFrame(read);
 }));
 for(const row of samples){expect(row.y).toBe(reverse.y);expect(row.intent).toEqual(reverse.camera.intent);expect(row.draws).toBe(reverse.resource.surface.draws);expect(row.fits).toBe(reverse.resource.surface.cameraFits);expect(row.pixels).toBeLessThanOrEqual(524288);expect(Math.abs(row.compositor.xPx)).toBeLessThanOrEqual(1.2);expect(Math.abs(row.compositor.yPx)).toBeLessThanOrEqual(1.2);expect(Math.abs(row.compositor.rollRad)).toBeLessThanOrEqual(.0012);}
 expect(new Set(samples.map(s=>s.transform)).size).toBeGreaterThan(1);expect(new Set(samples.map(s=>s.allocations)).size).toBe(1);
 const png=test.info().outputPath(`xr-scroll-camera-${page.viewportSize().width}.png`);await page.screenshot({path:png});await test.info().attach('xr-authored-camera',{path:png,contentType:'image/png'});
 const toggle=page.locator('[data-xr-motion-toggle]');await expect(toggle).toHaveText('Pause motion');await toggle.click();await expect(toggle).toHaveAttribute('aria-pressed','true');await frames(page,2);
 const paused=await facts(page);await frames(page,8);const still=await facts(page);expect(still.camera.intent).toEqual(paused.camera.intent);expect(still.camera.activeSeconds).toBe(paused.camera.activeSeconds);expect(still.resource.surface.compositor).toEqual(paused.resource.surface.compositor);expect(still.resource.surface.draws).toBe(paused.resource.surface.draws);
 await toggle.click();await page.mouse.click(8,page.viewportSize().height*.5);const neutral=await nativeReading(page,.45);
 const control=page.locator('[data-xr-model-control]');await control.evaluate(node=>node.focus({preventScroll:true}));expect(await page.evaluate(()=>scrollY)).toBe(neutral.y);await control.press('ArrowRight');await page.waitForFunction(()=>document.querySelector('[data-xr-stage]').__xrStage.inspect().camera.settled,null,{timeout:WAIT});
 expect((await facts(page)).camera.value.azimuth).toBeLessThan(0);await control.press('Home');await page.waitForFunction(intent=>{const s=document.querySelector('[data-xr-stage]').__xrStage.inspect();return s.camera.settled&&s.camera.value.azimuth===0&&s.camera.value.elevation===0&&!s.scene.paintPending&&JSON.stringify(s.camera.intent)===JSON.stringify(intent)&&JSON.stringify(s.resource.view.cameraIntent)===JSON.stringify(intent);},neutral.camera.intent,{timeout:WAIT});
 const returned=await facts(page);expect(returned.camera.modelProgress).toBeCloseTo(.45,2);expect(returned.resource.view.cameraIntent).toEqual(neutral.camera.intent);expect(returned.camera.intent).toEqual(neutral.camera.intent);
 await expect(page.locator('[data-xr-model-guidance]')).toContainText('current scroll view');
 await page.setViewportSize({width:320,height:844});await page.mouse.click(8,400);await nativeReading(page,.45);
 const targets=await page.locator('[data-xr-motion-toggle]').evaluateAll(nodes=>nodes.map(node=>{const r=node.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom};}));
 expect(targets).toHaveLength(1);for(const r of targets){expect(r.width).toBeGreaterThanOrEqual(44);expect(r.height).toBeGreaterThanOrEqual(44);expect(r.x).toBeGreaterThanOrEqual(0);expect(r.right).toBeLessThanOrEqual(320);expect(r.y).toBeGreaterThanOrEqual(0);expect(r.bottom).toBeLessThanOrEqual(844);}
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
 const narrowPNG=test.info().outputPath('xr-scroll-camera-320.png');await page.screenshot({path:narrowPNG});await test.info().attach('xr-compact-controls',{path:narrowPNG,contentType:'image/png'});
 await page.emulateMedia({reducedMotion:'reduce'});await expect(page.locator('[data-xr-webgl-canvas]')).toHaveCount(0);const reduced=await facts(page);expect(reduced.reduced).toBe(true);expect(reduced.camera.idleActive).toBe(false);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);expect(errors).toEqual([]);
 const receipt=test.info().outputPath('xr-scroll-camera-receipt.json');await writeFile(receipt,JSON.stringify({a,b,reverse,samples,paused,returned,reduced},null,2));await test.info().attach('xr-scroll-camera-receipt',{path:receipt,contentType:'application/json'});
});
