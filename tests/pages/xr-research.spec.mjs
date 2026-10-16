import {test,expect} from '@playwright/test';
import {createServer} from 'node:http';
import {fileURLToPath} from 'node:url';
import {createPagesPreviewHandler} from '../../scripts/serve-pages.mjs';
import {WAIT} from './case-helpers.mjs';

const model=page=>page.locator('[data-xr-model-surface]');
const phone=page=>page.locator('[data-xr-phone-surface]');
const modelFacts=page=>model(page).evaluate(node=>node.__xrModelStudy.inspect());
const phoneFacts=page=>phone(page).evaluate(node=>node.__xrPhoneStudy.inspect());
async function enter(page,origin='http://127.0.0.1:4186'){
 await page.goto(origin+'/projects/xr-bending-active/');
 await page.waitForFunction(()=>['entered','failed'].includes(window.__site?.inspect().phase),null,{timeout:WAIT});
 expect(await page.evaluate(()=>window.__site.inspect().phase)).toBe('entered');
}
function closed(state){
 for(const id of new Set(state.history.map(fact=>fact.id))){const facts=state.history.filter(fact=>fact.id===id);expect(facts.filter(fact=>fact.phase==='requested')).toHaveLength(1);expect(facts.filter(fact=>['ready','failed','cancelled'].includes(fact.phase))).toHaveLength(1);}
}
async function visiblePhone(page){await phone(page).scrollIntoViewIfNeeded();await expect(phone(page)).toHaveAttribute('data-research-phase','ready',{timeout:WAIT});}

test('the source XR model is visibility-gated, static at rest, operable with real inputs, and released offscreen',async({page,isMobile,browserName})=>{
 const requests=[],errors=[];page.on('request',r=>{if(/\.(glb|hdr)(?:\?|$)/.test(r.url()))requests.push(r.url());});page.on('pageerror',e=>errors.push(e.message));
 await enter(page);expect(requests).toEqual([]);
 await model(page).scrollIntoViewIfNeeded();await expect(model(page)).toHaveAttribute('data-research-phase','ready',{timeout:WAIT});
 const initial=await modelFacts(page);closed(initial);
 expect(initial.resource.sourceRevision).toBe('82e9679c1e47e93cc1a7bbea588eb0f2c8af142d6f7facc6fe5ffaa6148fdc04');
 expect(initial.resource.vertices).toBe(96312);expect(initial.resource.triangles).toBe(190320);expect(initial.resource.sourceUnits).toBe('Millimeters');expect(initial.resource.webUnits).toBe('Metres');
 expect(initial.resource.sourceTransforms.every(transform=>transform.scale.every(n=>n===1))).toBe(true);
 expect(initial.resource.surface.calls).toBe(1);expect(initial.resource.surface.budget.budget.pixels).toBeLessThanOrEqual(524288);
 await page.waitForTimeout(350);expect((await modelFacts(page)).resource.surface.draws).toBe(initial.resource.surface.draws);
 await model(page).focus();await model(page).press('ArrowRight');expect((await modelFacts(page)).resource.view.yaw).toBeGreaterThan(initial.resource.view.yaw);
 await model(page).press('Home');expect((await modelFacts(page)).resource.view).toEqual({yaw:.72,pitch:.36,zoom:1});
 const box=await model(page).boundingBox(),x=box.x+box.width*.5,y=box.y+box.height*.55;
 if(isMobile&&browserName==='chromium'){
  const cdp=await page.context().newCDPSession(page);
  try{
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
   for(const delta of [24,48,72])await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+delta,y}]});
   await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
   expect((await modelFacts(page)).resource.view.yaw).not.toBe(.72);
   const before=await page.evaluate(()=>scrollY);
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
   for(const delta of [35,70,110,150])await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y-delta}]});
   await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
   await expect.poll(()=>page.evaluate(()=>scrollY)).toBeGreaterThan(before+30);
  }finally{await cdp.detach();}
 }else{
  await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+80,y+20,{steps:5});await page.mouse.up();
  expect((await modelFacts(page)).resource.view.yaw).not.toBe(.72);
 }
 await page.locator('h1').scrollIntoViewIfNeeded();await expect(model(page).locator('canvas')).toHaveCount(0);
 const stopped=await modelFacts(page);expect(stopped.resource).toBeNull();expect(stopped.disposals).toBe(stopped.acquisitions);closed(stopped);
 // A second visibility acquisition must survive a genuine GPU-loss boundary
 // through the source poster and one separate post-ready resource failure.
 await model(page).scrollIntoViewIfNeeded();await expect(model(page)).toHaveAttribute('data-research-phase','ready',{timeout:WAIT});
 const lost=await model(page).locator('canvas').evaluate(canvas=>{const ext=canvas.getContext('webgl2').getExtension('WEBGL_lose_context');if(!ext)return false;ext.loseContext();return true;});expect(lost).toBe(true);
 await expect(model(page)).toHaveAttribute('data-research-phase','failed',{timeout:WAIT});await expect(model(page).locator('canvas')).toHaveCount(0);await expect(model(page).locator('img')).toBeVisible();
 const failed=await modelFacts(page);closed(failed);expect(failed.resource).toBeNull();expect(failed.disposals).toBe(failed.acquisitions);expect(failed.resourceFailures).toHaveLength(1);expect(failed.resourceFailures[0].reason).toBe('context-lost');
 expect(requests.every(url=>url.endsWith('/assets/xr/xr-research-assembly.glb'))).toBe(true);expect(errors).toEqual([]);
});

test('all three complete recordings update the 3D iPhone screen, keep controls outside it, and resume after pause',async({page})=>{
 const movies=[],errors=[];page.on('request',r=>{if(r.url().endsWith('.mp4'))movies.push(r.url());});page.on('pageerror',e=>errors.push(e.message));
 await enter(page);expect(movies).toEqual([]);await visiblePhone(page);
 for(const [id,duration] of [['adapt',13],['assemble',24.96],['join',20.3]]){
  await page.locator(`[data-phone-stage="${id}"]`).click();await visiblePhone(page);
  await expect.poll(async()=>{const s=await phoneFacts(page);return s.stage===id&&s.resource?.mode==='webgl-phone'&&s.resource.mediaFrames>2;},{timeout:WAIT}).toBe(true);
  const facts=await phoneFacts(page);closed(facts);expect(facts.resource.fallbacks).toEqual([]);
  expect(facts.resource.surface.budget.budget.pixels).toBeLessThanOrEqual(393216);
  const video=phone(page).locator('video');expect(await video.evaluate(node=>node.muted&&node.loop&&node.playsInline&&!node.paused)).toBe(true);
  expect(await video.evaluate(node=>node.duration)).toBeCloseTo(duration,2);
  const first=await phone(page).locator('canvas').screenshot(),frames=facts.resource.mediaFrames;
  await expect.poll(async()=>(await phoneFacts(page)).resource.mediaFrames).toBeGreaterThan(frames+2);
  expect((await phone(page).locator('canvas').screenshot()).equals(first)).toBe(false);
  await expect(page.locator('[data-phone-stage="'+id+'"]')).toHaveAttribute('aria-pressed','true');
 }
 await page.locator('[data-phone-front-toggle]').click();expect((await phoneFacts(page)).resource.front).toBe(true);
 const placement=await page.locator('[data-xr-phone-study]').evaluate(node=>{
  const screen=node.querySelector('[data-xr-phone-surface]').getBoundingClientRect();
  return [...node.querySelectorAll('[data-phone-toggle],[data-phone-front-toggle]')].map(button=>{const r=button.getBoundingClientRect();return{width:r.width,height:r.height,overlap:r.left<screen.right&&r.right>screen.left&&r.top<screen.bottom&&r.bottom>screen.top};});
 });
 expect(placement.every(item=>item.width>=44&&item.height>=44&&!item.overlap)).toBe(true);
 const previous=await phone(page).locator('video').evaluate(v=>v.currentTime),url=page.url();
 await page.locator('[data-phone-toggle]').click();await expect(phone(page).locator('video')).not.toHaveAttribute('src',/.+/);await expect(phone(page).locator('canvas')).toHaveCount(0);
 expect((await phoneFacts(page)).resource).toBeNull();closed(await phoneFacts(page));
 await page.locator('[data-phone-toggle]').click();await expect(phone(page)).toHaveAttribute('data-research-phase','ready',{timeout:WAIT});
 expect(await phone(page).locator('video').evaluate(v=>v.currentTime)).toBeGreaterThanOrEqual(Math.max(0,previous-.3));expect(page.url()).toBe(url);
 await page.locator('h1').scrollIntoViewIfNeeded();await expect(phone(page).locator('video')).not.toHaveAttribute('src',/.+/);await expect(phone(page).locator('canvas')).toHaveCount(0);closed(await phoneFacts(page));
 expect(errors).toEqual([]);
});

test('Reduced Motion preserves real posters and links and closes an active decoded-frame display',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});const requests=[];page.on('request',r=>{if(/\.(glb|mp4)(?:\?|$)/.test(r.url()))requests.push(r.url());});
 await enter(page);await model(page).scrollIntoViewIfNeeded();await expect(model(page).locator('img')).toBeVisible();await expect(model(page).locator('canvas')).toHaveCount(0);
 const y=await page.evaluate(()=>scrollY);await model(page).focus();await model(page).press('ArrowDown');
 await expect.poll(()=>page.evaluate(()=>scrollY)).toBeGreaterThan(y);
 await phone(page).scrollIntoViewIfNeeded();await expect(phone(page).locator('img')).toBeVisible();expect(requests).toEqual([]);
 await expect(page.locator('[data-phone-toggle]')).toBeDisabled();await expect(page.getByRole('link',{name:'Open full recording'})).toHaveAttribute('href','/assets/xr/adapt-interface.mp4');
 await page.emulateMedia({reducedMotion:'no-preference'});await visiblePhone(page);await expect.poll(async()=>(await phoneFacts(page)).resource?.mediaFrames??0).toBeGreaterThan(1);
 await page.emulateMedia({reducedMotion:'reduce'});await expect(phone(page).locator('canvas')).toHaveCount(0);await expect(phone(page).locator('video')).not.toHaveAttribute('src',/.+/);
 const facts=await phoneFacts(page);expect(facts.resource).toBeNull();expect(facts.disposals).toBe(facts.acquisitions);closed(facts);
});

test('unavailable WebGL and actual phone context loss retain the original native recording',async({page})=>{
 await page.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return /^webgl/.test(type)?null:original.call(this,type,...args);};});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await enter(page);
 await model(page).scrollIntoViewIfNeeded();await expect(model(page)).toHaveAttribute('data-research-phase','failed',{timeout:WAIT});await expect(model(page).locator('img')).toBeVisible();closed(await modelFacts(page));
 await visiblePhone(page);const state=await phoneFacts(page);expect(state.resource.mode).toBe('native-video');expect(state.resource.fallbackReason).toBeTruthy();await expect(phone(page).locator('canvas')).toHaveCount(0);
 const video=phone(page).locator('video'),before=await video.evaluate(v=>v.currentTime);await expect.poll(()=>video.evaluate(v=>v.currentTime)).toBeGreaterThan(before);
 closed(state);expect(errors).toEqual([]);
 // Remove the capability fixture through a fresh real document/context. This
 // separate page obtains a genuine context and loses it through the native API.
 const context=await page.context().browser().newContext({viewport:{width:1440,height:1000}});
 try{
  const native=await context.newPage();await enter(native);await visiblePhone(native);
  expect((await phoneFacts(native)).resource.mode).toBe('webgl-phone');
  const lost=await phone(native).locator('canvas').evaluate(canvas=>{const ext=canvas.getContext('webgl2').getExtension('WEBGL_lose_context');if(!ext)return false;ext.loseContext();return true;});expect(lost).toBe(true);
  await expect(phone(native).locator('canvas')).toHaveCount(0);expect((await phoneFacts(native)).resource.mode).toBe('native-video');expect((await phoneFacts(native)).resource.fallbackReason).toBe('context-lost');closed(await phoneFacts(native));
  const position=await phone(native).locator('video').evaluate(v=>v.currentTime);await expect.poll(()=>phone(native).locator('video').evaluate(v=>v.currentTime)).toBeGreaterThan(position);
 }finally{await context.close();}
});

test('real unavailable XR assets terminate once and retain the selected source posters and native navigation',async({page})=>{
 const denied={model:0,phone:0};let handler;
 const server=createServer((request,response)=>{const asset=request.url.split('?')[0],kind=asset==='/assets/xr/xr-research-assembly.glb'?'model':asset==='/assets/xr/adapt-interface.mp4'?'phone':null;if(kind){denied[kind]++;response.writeHead(404,{'Content-Type':'text/plain','Cache-Control':'no-store'}).end('Unavailable test source');return;}handler(request,response);});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const port=server.address().port;handler=createPagesPreviewHandler({root:fileURLToPath(new URL('../../.pages-workspace/out/',import.meta.url)),port});
 try{
  await enter(page,`http://127.0.0.1:${port}`);await model(page).scrollIntoViewIfNeeded();await expect(model(page)).toHaveAttribute('data-research-phase','failed',{timeout:WAIT});closed(await modelFacts(page));
  await phone(page).scrollIntoViewIfNeeded();await expect(phone(page)).toHaveAttribute('data-research-phase','failed',{timeout:WAIT});closed(await phoneFacts(page));
  await expect(model(page).locator('img')).toBeVisible();await expect(phone(page).locator('img')).toBeVisible();await expect(page.locator('[data-xr-webgl-canvas]')).toHaveCount(0);
  expect(denied.model).toBeGreaterThan(0);expect(denied.phone).toBeGreaterThan(0);
  await page.getByRole('link',{name:'← All projects'}).click();await page.waitForFunction(()=>window.__site?.inspect().phase==='entered');await expect(page.locator('[data-project-card]')).toHaveCount(2);
 }finally{await page.goto('about:blank');server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
});
