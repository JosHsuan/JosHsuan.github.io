import {test,expect} from '@playwright/test';
import {settle,scenarioTimeout} from './case-helpers.mjs';
const WAIT=45000;
async function load(page,path='/projects/bending-active/#overview'){await page.goto(path);await page.waitForFunction(()=>window.__thesis?.inspect().ready&&window.__story?.inspect().entry.phase==='entered',null,{timeout:WAIT});await page.evaluate(()=>document.fonts.ready);await settle(page);}
async function phase(page,id,value,settleAfter=settle){await page.evaluate(({id,value})=>{const el=document.getElementById(id);let y=0;for(let n=el;n;n=n.offsetParent)y+=n.offsetTop;scrollTo({top:y+el.offsetHeight*value-innerHeight*.45,behavior:'instant'});},{id,value});await settleAfter(page);}
// Each fastForward fires a due RAF once. A 500ms controller step exercises the
// real heavy-frame response without rendering dozens of intermediate
// software-GPU frames with runFor. This is a functional clock fixture.
async function settleClock(page,{reducedIdle=false}={}){
 let candidate=null,last=null;
 for(let step=0;step<12;step++){
  await page.clock.fastForward(500);
  last=await page.evaluate(()=>{
   const story=window.__story.inspect(),scene=window.__thesis.inspect();
   return {current:Math.abs(story.nativeDocY-scrollY)<.01&&!story.readingPending&&story.settled&&story.inspection.settled&&story.canvasPlacement.settled&&!story.canvasAwaitingPaint,signature:[scrollY,story.visualDocY,document.documentElement.scrollHeight,story.inspection.value.azimuth,story.inspection.value.elevation,story.canvasPlacement.x,story.canvasPlacement.y,story.canvasPlacement.scale].join('/'),native:story.nativeDocY,visual:story.visualDocY,frameDelta:story.frameDelta,controllerFrame:story.controllerFrame,renderedControllerFrame:scene.renderedControllerFrame,ready:scene.ready,renderSuspended:scene.renderSuspended,reducedMotion:story.playback.reducedMotion,scheduled:story.scheduled,pendingFrames:scene.rendererPendingFrames??0};
  });
  if(!last.current)candidate=null;
  else {
   if(candidate?.signature!==last.signature)candidate={signature:last.signature,frame:last.controllerFrame};
   if(last.ready&&(last.renderSuspended||last.renderedControllerFrame>=candidate.frame)&&(!reducedIdle||last.reducedMotion&&!last.scheduled&&last.pendingFrames===0))return;
  }
 }
 throw Error('Controlled controller/render did not settle: '+JSON.stringify(last));
}

async function sampleMoving(page){
 try {
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
  await page.clock.runFor(160);
  return await page.evaluate(()=>window.__motionTimingSample.values);
 } finally {
  await page.evaluate(()=>{const sample=window.__motionTimingSample;if(sample)cancelAnimationFrame(sample.raf);delete window.__motionTimingSample;});
 }
}

test('native reading stays responsive without controller frames while the scene keeps independent playback',async({page})=>{
 test.setTimeout(scenarioTimeout(180000));
 // Install before navigation so every application RAF uses the same clock.
 // Loading and the initial chapter placement still advance in real time.
 await page.clock.install({time:new Date('2026-01-01T00:00:00Z')});await load(page);
 // Full optics remain active while the controlled clock isolates DOM timing.
 const canvas=await page.locator('[data-cinematic-stage] canvas').elementHandle();await phase(page,'system',.35);
 const realtimeFrameDelta=await page.evaluate(()=>window.__story.inspect().frameDelta);
 try {
  // A future pause point avoids a protocol race with Date.now(). pauseAt fires
  // overdue callbacks once. runFor is confined to the 160ms shape sample; the
  // remaining contracts use single-RAF steps and a live OS motion preference.
  // The built page, native scroll, DOM and bounded Canvas remain active when visible.
  await page.clock.pauseAt(new Date('2026-01-01T01:00:00Z'));
  // The browser must move readable content even when application RAFs cannot
  // run. This guards against reintroducing whole-layer scroll compensation.
  for(const delta of [80,-65,900,-900]){
   const result=await page.evaluate(delta=>{
    const element=document.getElementById('system'),root=document.querySelector('[data-story-root]');
    const before={y:scrollY,top:element.getBoundingClientRect().top,frame:window.__story.inspect().controllerFrame};
    scrollBy({top:delta,behavior:'instant'});
    return{before,after:{y:scrollY,top:element.getBoundingClientRect().top,frame:window.__story.inspect().controllerFrame},transform:getComputedStyle(root).transform};
   },delta);
   expect(result.after.y).not.toBe(result.before.y);
   expect(result.after.frame).toBe(result.before.frame);expect(result.transform).toBe('none');
   expect(Math.abs(result.after.top-result.before.top+result.after.y-result.before.y)).toBeLessThan(.1);
  }
  const samples=await sampleMoving(page);await settleClock(page);
  expect(samples.length,JSON.stringify({realtimeFrameDelta,samples})).toBeGreaterThan(0);
  for(const s of samples){expect(s.visual).toBe(s.native);expect(s.shift).toBe(0);expect(s.settled).toBe(true);expect(Number.isFinite(s.rule)).toBe(true);expect(s.sceneVisualU).toBe(s.visualU);expect(Math.abs((s.top+s.native)-(samples[0].top+samples[0].native))).toBeLessThan(.1);}
  const reading=await page.evaluate(()=>window.__story.inspect());
  expect(reading.stops).toEqual([]);expect(reading.holdId).toBe(null);expect(reading.holdWeight).toBe(0);
  for(const id of ['pattern','make','system']){await phase(page,id,.5,settleClock);expect(await page.evaluate(original=>document.querySelector('[data-cinematic-stage] canvas')===original,canvas)).toBe(true);}
  await phase(page,'system',.6,settleClock);
  const snapshot=()=>page.evaluate(()=>{const story=window.__story.inspect(),scene=window.__thesis.inspect();return {time:story.playback.activeSeconds,field:scene.compositor.field.time,pose:scene.pose.position,frames:scene.frames};});
  const autonomousBefore=await snapshot();for(let step=0;step<3;step++)await page.clock.fastForward(500);const autonomousAfter=await snapshot();
  expect(autonomousAfter.time).toBeGreaterThan(autonomousBefore.time);expect(autonomousAfter.field).toBeGreaterThan(autonomousBefore.field);expect(autonomousAfter.pose).not.toEqual(autonomousBefore.pose);expect(autonomousAfter.frames).toBeGreaterThan(autonomousBefore.frames);
  // OS media changes cannot silently replace the authored scroll experience.
  const source=await page.evaluate(()=>window.__thesis.inspect().representation.id);
  await page.emulateMedia({reducedMotion:'reduce'});await settleClock(page);
  expect(await page.evaluate(()=>window.__story.inspect().playback.reducedMotion)).toBe(false);
  const continuing=await snapshot();for(let step=0;step<3;step++)await page.clock.fastForward(500);const later=await snapshot();
  expect(later.time).toBeGreaterThan(continuing.time);expect(later.frames).toBeGreaterThan(continuing.frames);
  expect(await page.evaluate(()=>window.__thesis.inspect().representation.id)).toBe(source);
 } finally {
  await page.clock.resume();
 }
});

test('information stays a single native surface with inline figures and no click gates',async({page,isMobile})=>{
 test.setTimeout(scenarioTimeout(150000));await load(page);await phase(page,'system',.45);
 const source=page.locator('#system [data-information-window="source-details"]'),media=source.locator('[data-feedback-plane]');
 await source.scrollIntoViewIfNeeded();await settle(page);await expect(media).toBeVisible();
 if(!isMobile){await media.hover({position:{x:15,y:15}});await settle(page);expect(await media.evaluate(el=>getComputedStyle(el).transform)).toBe('none');await page.mouse.move(1,1);}
 await expect(page.locator('details,summary,[data-inspect-figure],[data-source-comparison]')).toHaveCount(0);
 for(const id of ['make','credits','form']){await phase(page,id,.4);expect(await page.evaluate(()=>window.__story.inspect().readingShiftY)).toBe(0);await expect(page.locator(`[data-chapter-link="${id}"]`)).toHaveAttribute('aria-current','location');}
 await page.emulateMedia({reducedMotion:'reduce'});await settle(page);expect(await page.evaluate(()=>window.__story.inspect().playback.reducedMotion)).toBe(false);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
});

test('initial fragments, native keyboard scrolling and browser history retain exact reading positions without chapter buttons',async({page})=>{
 test.setTimeout(scenarioTimeout(150000));await load(page,'/projects/bending-active/#system');
 await expect(page.locator('[data-chapter-link="system"]')).toHaveAttribute('aria-current','location');
 const heading=await page.locator('#system [data-story-heading]').boundingBox();expect(heading.y+heading.height).toBeGreaterThan(100);expect(heading.y).toBeLessThan(await page.evaluate(()=>innerHeight));
 await expect(page.locator('[data-story-navigation] a,[data-story-navigation] button')).toHaveCount(0);
 const before=await page.evaluate(()=>scrollY);await page.keyboard.press('PageDown');await settle(page);expect(await page.evaluate(()=>scrollY)).toBeGreaterThan(before);
 await page.keyboard.press('Home');await settle(page);expect(await page.evaluate(()=>scrollY)).toBe(0);
 await page.keyboard.press('End');await settle(page);expect(await page.evaluate(()=>Math.abs(scrollY-(document.documentElement.scrollHeight-innerHeight)))).toBeLessThan(1);
 await phase(page,'system',.45);await page.mouse.wheel(0,160);await settle(page);const saved=await page.evaluate(()=>({y:scrollY,hash:location.hash}));
 await page.getByRole('link',{name:'Project',exact:true}).click();await page.waitForURL('**/projects/');await page.goBack();await settle(page);
 expect(await page.evaluate(()=>location.hash)).toBe(saved.hash);expect(Math.abs(await page.evaluate(()=>scrollY)-saved.y)).toBeLessThan(1);expect(await page.evaluate(()=>window.__story.inspect().readingShiftY)).toBe(0);
 await page.goForward();await page.waitForURL('**/projects/');
});
