import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {WAIT,scenarioTimeout,loadScene} from './case-helpers.mjs';

const studies=JSON.parse(await readFile(new URL('../../roles/uiux-designer/cases/bending-active-thesis/release/project-studies.json',import.meta.url),'utf8')).projects;
const facts=page=>page.evaluate(()=>window.__globalBackground?.inspect());
async function entered(page){
 await page.waitForFunction(()=>['entered','failed'].includes(window.__site?.inspect().phase),null,{timeout:WAIT});
 expect(await page.evaluate(()=>window.__site.inspect().phase)).toBe('entered');
 await expect(page.locator('[data-site-loader]')).toBeHidden();
 await page.waitForFunction(()=>window.__globalBackground?.inspect().activeBindings===1,null,{timeout:WAIT});
}

test('all direct portfolio routes share exactly one background surface and one active owner',async({page})=>{
 test.setTimeout(scenarioTimeout(180000));
 // Static policy avoids optional project models; it still exercises each real
 // exported layout, current-document entry and the delegated Bending Director.
 await page.emulateMedia({reducedMotion:'reduce'});
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 for(const route of ['/','/about/','/projects/','/contact/','/projects/xr-bending-active/','/projects/bending-active/',...studies.map(project=>`/projects/${project.slug}/`)]){
  const response=await page.goto(route);expect(response.status()).toBe(200);await entered(page);
  await expect(page.locator('[data-global-background]')).toHaveCount(1);
  await expect(page.locator('canvas[data-global-background-field]')).toHaveCount(1);
  await expect(page.locator('[data-cinematic-background]')).toHaveCount(1);
  await expect(page.locator('canvas:not([data-global-background-field])')).toHaveCount(0);
  const state=await facts(page),bending=route==='/projects/bending-active/';
  expect(state.activeBindings).toBe(1);expect(state.acquisitions).toBe(1);expect(state.releases).toBe(0);
  expect(state.owner).toBe(bending?'bending-director':'site');expect(state.delegated).toBe(bending);
  if(bending)expect(state.driver).toBeNull();else expect(state.driver.owner).toBe('site');
  expect(await page.locator('[data-global-background-field]').evaluate(node=>getComputedStyle(node).pointerEvents)).toBe('none');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
 }
 expect(errors).toEqual([]);
});

test('ordinary background animates from native time and input, preserves scroll and freezes under live Reduced Motion',async({page})=>{
 await page.goto('/about/');await entered(page);
 await page.waitForFunction(()=>window.__globalBackground.inspect().driver.pageField.draws>0,null,{timeout:WAIT});
 const before=await facts(page);
 await expect.poll(async()=>(await facts(page)).driver.pageField.draws,{timeout:WAIT}).toBeGreaterThan(before.driver.pageField.draws+2);
 const animated=await facts(page);expect(animated.driver.playback.activeSeconds).toBeGreaterThan(before.driver.playback.activeSeconds);
 expect(animated.driver.pageField.fieldTime).toBeGreaterThan(before.driver.pageField.fieldTime);
 expect(animated.driver.pageField.pixels).toBeLessThanOrEqual(900000);expect(animated.driver.pageField.cells).toBeLessThanOrEqual(12000);
 const elapsed=(animated.driver.pageField.frameTimeMs-before.driver.pageField.frameTimeMs)/1000;
 expect(animated.driver.pageField.draws-before.driver.pageField.draws).toBeLessThanOrEqual(Math.floor(elapsed*30+1e-5)+1);
 const screen=page.viewportSize();await page.mouse.move(screen.width*.7,screen.height*.55);
 const fine=await page.evaluate(()=>matchMedia('(hover: hover) and (pointer: fine)').matches);
 await expect.poll(async()=>(await facts(page)).driver.chapterScene.field.fieldPointerStrength,{timeout:WAIT}).toBe(fine ? .35 : 0);
 if(fine){const pointer=(await facts(page)).driver.chapterScene.field.fieldPointerUv;expect(pointer[0]).toBeCloseTo(.7,2);expect(pointer[1]).toBeCloseTo(.45,2);}
 const y=await page.evaluate(()=>scrollY);await page.mouse.wheel(0,240);
 await expect.poll(()=>page.evaluate(()=>scrollY),{timeout:WAIT}).toBeGreaterThan(y);
 await expect.poll(async()=>(await facts(page)).driver.playback.tempo,{timeout:WAIT}).toBeGreaterThan(1.01);
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.waitForFunction(()=>{const value=window.__globalBackground.inspect().driver;return value.chapterScene.field.fieldWeight===0&&!value.lifecycle.scheduled;},null,{timeout:WAIT});
 const sample=()=>page.evaluate(()=>{const value=window.__globalBackground.inspect().driver;return{time:value.playback.activeSeconds,frames:value.frames,draws:value.pageField.draws};});
 const frozen=await sample(),reducedY=await page.evaluate(()=>scrollY);
 await page.mouse.move(screen.width*.25,screen.height*.2);await page.mouse.wheel(0,80);await page.mouse.move(-8,-8);
 await expect.poll(()=>page.evaluate(()=>scrollY)).toBeGreaterThan(reducedY);
 await page.evaluate(async()=>{for(let i=0;i<4;i++)await new Promise(requestAnimationFrame);});expect(await sample()).toEqual(frozen);
 await page.emulateMedia({reducedMotion:'no-preference'});
 await expect.poll(async()=>(await facts(page)).driver.pageField.draws,{timeout:WAIT}).toBeGreaterThan(frozen.draws);
 expect((await facts(page)).activeBindings).toBe(1);
});

test('unavailable optional 2D leaves native reading and real document-exit cleanup intact',async({page})=>{
 // Contained failure injection denies only the explicitly marked shared 2D
 // surface. Native navigation/pagehide below are actual trusted browser events.
 await page.addInitScript(()=>{
  const original=HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext=function(type,...args){if(type==='2d'&&this.hasAttribute('data-global-background-field'))return null;return original.call(this,type,...args);};
 });
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('/contact/');await entered(page);
 await page.waitForFunction(()=>{const value=window.__globalBackground.inspect().driver;return !value.pageField.ready&&!value.lifecycle.scheduled;},null,{timeout:WAIT});
 await expect(page.locator('h1')).toHaveText('Let’s connect.');await expect(page.locator('[data-contact-email]')).toBeVisible();
 const visual=await page.locator('[data-global-background]').evaluate(node=>{const style=getComputedStyle(node);return{background:style.backgroundImage,pointerEvents:style.pointerEvents};});
 expect(visual.background).toContain('radial-gradient');expect(visual.pointerEvents).toBe('none');
 await page.evaluate(()=>addEventListener('pagehide',event=>sessionStorage.setItem('test-background-departure',JSON.stringify({trusted:event.isTrusted,persisted:event.persisted,state:window.__globalBackground.inspect()})),{once:true}));
 await page.locator('[data-portfolio-navigation] a[href="/about/"]').click();await entered(page);
 const departure=await page.evaluate(()=>JSON.parse(sessionStorage.getItem('test-background-departure')));
 expect(departure.trusted).toBe(true);
 if(departure.persisted){
  expect(departure.state.activeBindings).toBe(1);expect(departure.state.driver.lifecycle.suspended).toBe(true);
  test.info().annotations.push({type:'native-page-lifecycle',description:'The browser retained this real departure in BFCache; its background was suspended.'});
 }else{
  expect(departure.state.activeBindings).toBe(0);expect(departure.state.driver.disposed).toBe(true);
  expect(departure.state.driver.events.nativeListeners).toBe(0);expect(departure.state.driver.pageField.disposed).toBe(true);
  test.info().annotations.push({type:'native-page-lifecycle',description:'The browser discarded this real departure; its background resource and listeners were released. BFCache retention was not observed.'});
 }
 await page.goBack();await entered(page);await expect(page.locator('[data-contact-email]')).toBeVisible();expect((await facts(page)).activeBindings).toBe(1);
 expect(errors).toEqual([]);
});

test('the live Bending scene delegates one existing Director clock to the shared field without an ordinary-page driver',async({page})=>{
 test.setTimeout(scenarioTimeout(120000));
 await loadScene(page);
 const state=await page.evaluate(()=>({background:window.__globalBackground.inspect(),story:window.__story.inspect(),scene:window.__thesis.inspect(),order:[...document.body.querySelectorAll('[data-cinematic-background],[data-cinematic-stage],[data-global-background-field]')].map(node=>node.hasAttribute('data-cinematic-background')?'backdrop':node.hasAttribute('data-cinematic-stage')?'stage':'field')}));
 expect(state.background.owner).toBe('bending-director');expect(state.background.delegated).toBe(true);expect(state.background.driver).toBeNull();
 expect(state.background.activeBindings).toBe(1);expect(state.background.acquisitions).toBe(1);
 expect(state.background.pageField).toEqual(state.story.pageField);expect(state.scene.ready).toBe(true);
 expect(state.order).toEqual(['backdrop','stage','field']);
 await expect(page.locator('[data-cinematic-stage] canvas')).toHaveCount(1);await expect(page.locator('canvas[data-global-background-field]')).toHaveCount(1);await expect(page.locator('canvas')).toHaveCount(2);
 const before=state.story.playback.activeSeconds;
 await expect.poll(()=>page.evaluate(()=>window.__story.inspect().playback.activeSeconds),{timeout:WAIT}).toBeGreaterThan(before);
 expect((await facts(page)).acquisitions).toBe(1);
});
