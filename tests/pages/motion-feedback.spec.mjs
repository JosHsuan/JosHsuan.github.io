import {test,expect} from '@playwright/test';
import {pause,expectIdle,settle} from './case-helpers.mjs';
const WAIT=30000;
async function load(page,path='/'){await page.goto(path);await page.getByRole('combobox',{name:'Visual detail',exact:true}).selectOption('light');await page.waitForFunction(()=>window.__thesis?.inspect().ready&&window.__story,null,{timeout:WAIT});await page.evaluate(()=>document.fonts.ready);await settle(page);}
async function phase(page,id,value){await page.evaluate(({id,value})=>{const el=document.getElementById(id);let y=0;for(let n=el;n;n=n.offsetParent)y+=n.offsetTop;scrollTo({top:y+el.offsetHeight*value-innerHeight*.45,behavior:'instant'});},{id,value});await settle(page);}
// Locator auto-scroll may finish before the authored reading plane settles.
// Click the visible, settled summary instead of a stale pre-response coordinate.
async function openSourceFigure(page){const summary=page.getByText('Compare with the original thesis figure',{exact:true});await summary.scrollIntoViewIfNeeded();await settle(page);await summary.click();await expect(summary.locator('..')).toHaveAttribute('open','');await settle(page);}


test('whole reading plane shares model progress, damping, content stops and reversible native travel',async({page})=>{
 test.setTimeout(180000);
 // Install before navigation so every application RAF uses the same clock.
 // Loading and native chapter navigation still advance in real time.
 await page.clock.install({time:new Date('2026-01-01T00:00:00Z')});await load(page);
 // Use the supported Light renderer for frame-sensitive DOM sampling. Full
 // initialization and optics are covered by public smoke and optical fixtures.
 const canvas=await page.locator('canvas').elementHandle();await phase(page,'system',.35);
 const realtimeFrameDelta=await page.evaluate(()=>window.__story.inspect().frameDelta);let samples=[];
 try {
  // A future pause point avoids a protocol race with Date.now(). pauseAt fires
  // overdue callbacks once; runFor then advances only this 160ms motion sample.
  // The built page, native scroll, DOM and Canvas remain active at full size.
  await page.clock.pauseAt(new Date('2026-01-01T01:00:00Z'));
  await page.evaluate(()=>{
   const sample={values:[],raf:0};window.__motionTimingSample=sample;
   scrollBy({top:160,behavior:'instant'});
   const tick=()=>{
    const s=window.__story.inspect(),scene=window.__thesis.inspect(),el=document.getElementById('system');
    if(Math.abs(s.nativeDocY-scrollY)<.01&&!s.readingPending)sample.values.push({native:s.nativeDocY,visual:s.visualDocY,shift:s.readingShiftY,top:el.getBoundingClientRect().top,velocity:s.velocity,acceleration:s.acceleration,settled:s.settled,frameDelta:s.frameDelta,rule:Number.parseFloat(el.querySelector('[data-choreography]').style.getPropertyValue('--choreo-progress')||'0'),visualU:s.visualU,sceneVisualU:scene.visualU});
    sample.raf=requestAnimationFrame(tick);
   };
   sample.raf=requestAnimationFrame(tick);
  });
  // No locator action, RAF promise or settle wait may block a paused clock.
  await page.clock.runFor(160);
  samples=await page.evaluate(()=>window.__motionTimingSample.values);
 } finally {
  try {await page.evaluate(()=>{const sample=window.__motionTimingSample;if(sample)cancelAnimationFrame(sample.raf);delete window.__motionTimingSample;});}
  finally {await page.clock.resume();}
 }
 await settle(page);
 const moving=samples.find(s=>s.shift>5&&!s.settled);expect(moving,JSON.stringify({realtimeFrameDelta,samples})).toBeTruthy();expect(Math.abs(moving.velocity)).toBeGreaterThan(1);expect(Number.isFinite(moving.acceleration)).toBe(true);
 for(const s of samples){expect(Number.isFinite(s.rule)).toBe(true);expect(s.sceneVisualU).toBe(s.visualU);expect(Math.abs((s.top+s.visual)-(samples[0].top+samples[0].visual))).toBeLessThan(.1);}
 const stop=await page.evaluate(()=>{const s=window.__story.inspect();return s.stops.find(stop=>stop.y>s.visualDocY+200);});expect(stop).toBeTruthy();
 await page.evaluate(y=>scrollTo({top:y,behavior:'instant'}),stop.start-40);await settle(page);
 await page.evaluate(y=>scrollTo({top:y,behavior:'instant'}),stop.holdStart+2);await settle(page);
 const before=await page.evaluate(()=>window.__story.inspect());expect(before.holdWeight,JSON.stringify({native:before.nativeDocY,visual:before.visualDocY,bypass:before.bypassHoldId,seek:before.seekUntilInput,hold:before.holdId,stop})).toBeGreaterThan(.99);
 await page.evaluate(y=>scrollTo({top:y,behavior:'instant'}),stop.holdEnd-2);await settle(page);
 const after=await page.evaluate(()=>window.__story.inspect());expect(after.nativeDocY).toBeGreaterThan(before.nativeDocY);expect(after.holdId).toBe(before.holdId);expect(after.holdWeight).toBeGreaterThan(.99);expect(Math.abs(after.stops.find(item=>item.id===stop.id).y-stop.y),'Autonomous content must not move the authored reading stop.').toBeLessThan(.1);expect(Math.abs(after.visualDocY-before.visualDocY)).toBeLessThan(.1);
 for(const id of ['pattern','make','system']){await phase(page,id,.5);expect(await page.evaluate(original=>document.querySelector('canvas')===original,canvas)).toBe(true);}
 const autonomous=await page.evaluate(async()=>{const before=window.__thesis.inspect(),time=window.__story.inspect().playback.activeSeconds;for(let i=0;i<12;i++)await new Promise(requestAnimationFrame);const after=window.__thesis.inspect();return{time,afterTime:window.__story.inspect().playback.activeSeconds,beforeField:before.compositor.field.time,afterField:after.compositor.field.time,beforePose:before.pose.position,afterPose:after.pose.position,frames:[before.frames,after.frames]};});expect(autonomous.afterTime).toBeGreaterThan(autonomous.time);expect(autonomous.afterField).toBeGreaterThan(autonomous.beforeField);expect(autonomous.afterPose).not.toEqual(autonomous.beforePose);expect(autonomous.frames[1]).toBeGreaterThan(autonomous.frames[0]);await pause(page);await expectIdle(page);
});

test('text and images respond in perspective; focus, hashes, Pause and Reduced keep content reachable',async({page,isMobile})=>{
 test.setTimeout(180000);await load(page);await phase(page,'system',.45);await openSourceFigure(page);
 const source=page.locator('[data-inspect-figure="0"]'),media=source.locator('[data-feedback-plane]');await expect(media).toBeVisible();await source.scrollIntoViewIfNeeded();await settle(page);
 if(!isMobile){await media.hover({position:{x:15,y:15}});await settle(page);expect(Math.abs(await media.evaluate(el=>parseFloat(getComputedStyle(el).getPropertyValue('--feedback-x'))))).toBeGreaterThan(.3);await page.mouse.move(1,1);await settle(page);}
 await source.focus();await settle(page);const focus=await source.boundingBox();expect(focus.y+focus.height).toBeGreaterThan(90);expect(focus.y).toBeLessThan(await page.evaluate(()=>innerHeight));
 await source.press('Enter');await expect(page.locator('[data-source-comparison]')).toBeVisible();expect(await page.evaluate(()=>document.body.style.overflow)).not.toBe('hidden');await page.getByRole('button',{name:'Close source comparison'}).click();await expect(source).toBeFocused();
 for(const id of ['make','credits','form']){await page.locator(`[data-chapter-link="${id}"]`).click();await settle(page);expect(await page.evaluate(()=>window.__story.inspect().readingShiftY)).toBe(0);await expect(page.locator(`[data-chapter-link="${id}"]`)).toHaveAttribute('aria-current','location');}
 await page.getByRole('button',{name:'Pause motion'}).click();await settle(page);
 const staticTransforms=()=>page.evaluate(()=>[...document.querySelectorAll('[data-story-root],[data-feedback-plane],[data-heading-line],[data-editorial-copy]')].map(el=>getComputedStyle(el).transform));expect((await staticTransforms()).every(value=>value==='none')).toBe(true);
 await page.getByRole('button',{name:'Resume motion'}).click();await page.emulateMedia({reducedMotion:'reduce'});await settle(page);await phase(page,'system',.6);expect((await staticTransforms()).every(value=>value==='none')).toBe(true);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
});

test('initial fragments, keyboard focus and browser history preserve exact native reading positions',async({page})=>{
 test.setTimeout(180000);await load(page,'/#system');await expect(page.locator('[data-model-study]').first()).toBeAttached();
 await expect(page.locator('[data-chapter-link="system"]')).toHaveAttribute('aria-current','location');
 const heading=await page.locator('#system [data-story-heading]').boundingBox();expect(heading.y+heading.height).toBeGreaterThan(100);expect(heading.y).toBeLessThan(await page.evaluate(()=>innerHeight));
 const make=page.locator('[data-chapter-link="make"]');await make.focus();await page.keyboard.press('Enter');await settle(page);await expect(page.locator('#make')).toBeFocused();
 await page.keyboard.press('PageDown');await settle(page);expect(await page.evaluate(()=>window.__story.inspect().readingShiftY)).toBe(0);
 await page.keyboard.press('Home');await settle(page);expect(await page.evaluate(()=>scrollY)).toBe(0);
 await page.keyboard.press('End');await settle(page);expect(await page.evaluate(()=>Math.abs(scrollY-(document.documentElement.scrollHeight-innerHeight)))).toBeLessThan(1);
 await page.locator('[data-chapter-link="system"]').click();await settle(page);await page.mouse.wheel(0,160);await settle(page);
 const saved=await page.evaluate(()=>({y:scrollY,hash:location.hash}));
 await page.locator('[data-chapter-link="make"]').click();await settle(page);const forward=await page.evaluate(()=>scrollY);
 await page.goBack();await settle(page);expect(await page.evaluate(()=>location.hash)).toBe(saved.hash);expect(Math.abs(await page.evaluate(()=>scrollY)-saved.y)).toBeLessThan(1);expect(await page.evaluate(()=>window.__story.inspect().readingShiftY)).toBe(0);
 await page.goForward();await settle(page);expect(await page.evaluate(()=>location.hash)).toBe('#make');expect(Math.abs(await page.evaluate(()=>scrollY)-forward)).toBeLessThan(1);
 // A programmatic keyboard focus during a live wheel response must remain
 // in the safe reading viewport after compensation is cleared.
 await openSourceFigure(page);await page.evaluate(()=>{scrollBy({top:140,behavior:'instant'});requestAnimationFrame(()=>document.querySelector('[data-inspect-figure="0"]').focus());});await settle(page);
 const focused=await page.locator('[data-inspect-figure="0"]').boundingBox();await expect(page.locator('[data-inspect-figure="0"]')).toBeFocused();expect(focused.y+focused.height).toBeGreaterThan(100);expect(focused.y).toBeLessThan(await page.evaluate(()=>innerHeight-80));expect(await page.evaluate(()=>window.__story.inspect().readingShiftY)).toBe(0);
});
