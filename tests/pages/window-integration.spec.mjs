import {test,expect} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
import {loadScene,centerStudy,settle,frames,scenarioTimeout,WAIT} from './case-helpers.mjs';

test('native scroll triggers a timed Canvas departure and completion follows the submitted frame',async({page})=>{
 // Pattern ends the continuous Overview-to-Pattern source passage. Internal
 // chapter boundaries retain the scene and must not trigger a departure.
 test.setTimeout(scenarioTimeout(120000));await page.clock.install();await loadScene(page);await centerStudy(page,'pattern');
 const canvas=await page.locator('[data-cinematic-stage] canvas').elementHandle();
 const range=await page.evaluate(()=>{const s=window.__story.inspect();return{start:s.canvasPlacement.holdEnd-80,target:s.canvasPlacement.holdEnd+30,end:s.canvasPlacement.end};});
 await page.evaluate(y=>scrollTo({top:y,behavior:'instant'}),range.start);await settle(page);
 await page.clock.pauseAt(new Date(Date.now()+3600000));
 try{
  await page.evaluate(y=>scrollTo({top:y,behavior:'instant'}),range.target);
  await page.clock.fastForward(100);
  const first=await page.evaluate(()=>window.__story.inspect().canvasPlacement);
  expect(first.mode).toBe('exit');expect(first.opacity).toBeGreaterThan(0);expect(first.transition.duration).toBe(.95);
  const id=first.request.id;
  // Consume much more native distance without consuming active animation time.
  await page.evaluate(y=>scrollTo({top:y,behavior:'instant'}),range.end-1);
  for(let i=0;i<3;i++)await page.clock.fastForward(100);
  const moving=await page.evaluate(()=>window.__story.inspect().canvasPlacement);
  expect(moving.request.id).toBe(id);expect(moving.opacity).toBeGreaterThan(0);expect(moving.transition.elapsed).toBeLessThan(.6);
  for(let i=0;i<8;i++)await page.clock.fastForward(100);
  const gone=await page.evaluate(()=>window.__story.inspect());
  expect(gone.canvasPlacement.opacity).toBe(0);expect(gone.canvasPlacement.settled).toBe(true);
  expect(gone.canvasTransitions.history.filter(e=>e.id===id).map(e=>e.status)).toEqual(['requested','completed']);
  // Reversing back requests a full timed return even after native input stops.
  await page.evaluate(y=>scrollTo({top:y,behavior:'instant'}),range.start);
  for(let i=0;i<18;i++)await page.clock.fastForward(100);
  const arrived=await page.evaluate(()=>{const s=window.__story.inspect(),r=window.__thesis.inspect();return{placement:s.canvasPlacement,events:s.canvasTransitions,frame:r.renderedControllerFrame,opacity:Number(document.querySelector('[data-cinematic-stage]').style.opacity)};});
  expect(arrived.placement).toMatchObject({chapter:'pattern',mode:'hold',scale:1,opacity:1,settled:true});
  expect(arrived.opacity).toBe(1);expect(arrived.events.pending).toBe(null);expect(arrived.events.open).toBe(null);
  expect(arrived.events.history.at(-1).status).toBe('completed');
  expect(await page.evaluate(el=>document.querySelector('[data-cinematic-stage] canvas')===el,canvas)).toBe(true);
 }finally{await page.clock.resume();}
});

test('slow delivered foreground frames finish the Canvas and matching scene without another scroll',async({page})=>{
 test.setTimeout(scenarioTimeout(120000));await page.clock.install();await loadScene(page);await centerStudy(page,'form');
 const canvas=await page.locator('[data-cinematic-stage] canvas').elementHandle();
 const target=await page.evaluate(()=>window.__story.inspect().canvasPlacement.end+innerHeight*.3);
 await page.clock.pauseAt(new Date(Date.now()+3600000));
 try{
  await page.evaluate(y=>scrollTo({top:y,behavior:'instant'}),target);
  const samples=[];
  // Deliver one RAF per 1.317 active seconds: the Full-mode CI failure cadence.
  // Real lifecycle/renderer gates still run; no runtime state is overwritten.
  for(let i=0;i<8;i++){
   await page.clock.fastForward(1317);
   samples.push(await page.evaluate(()=>{const s=window.__story.inspect();return{delta:s.frameDelta,placement:s.canvasPlacement,waiting:s.canvasAwaitingPaint,events:s.canvasTransitions,rendered:window.__thesis.inspect().representation?.chapterId,opacity:Number(document.querySelector('[data-cinematic-stage]').style.opacity)};}));
  }
  expect(samples.some(s=>s.delta>1)).toBe(true);
  const last=samples.at(-1);
  expect(last.placement).toMatchObject({chapter:'system',mode:'hold',opacity:1,scale:1,settled:true});
  expect(last.waiting).toBe(false);expect(last.rendered).toBe('system');expect(last.opacity).toBe(1);
  expect(last.events.open).toBe(null);expect(last.events.pending).toBe(null);
  expect(last.events.history.filter(e=>e.id===last.placement.request.id).map(e=>e.status)).toEqual(['requested','completed']);
  expect(await page.evaluate(el=>document.querySelector('[data-cinematic-stage] canvas')===el,canvas)).toBe(true);
 }finally{await page.clock.resume();}
});

test('information windows retain single fluid surfaces, source-label reserves and native scroll reading',async({page},info)=>{
 test.setTimeout(scenarioTimeout(150000));await page.clock.install();const errors=[];page.on('pageerror',error=>errors.push(error.message));
 const receipt={scope:'Native reading surfaces and intrinsic source-label reserves; no inspector or automatic static mode.',movement:[],phase:'loading'};let primaryError;
 try{
  await loadScene(page);await centerStudy(page,'system');
  const registered=page.locator('[data-information-window]');expect(await registered.count()).toBeGreaterThan(20);
  const panel=page.locator('#system [data-story-panel]');await panel.scrollIntoViewIfNeeded();await settle(page);
  await page.clock.pauseAt(new Date(Date.now()+3600000));
  try{
   for(let i=0;i<8;i++){
    await page.evaluate(delta=>scrollBy({top:delta,behavior:'instant'}),i<4?55:-55);await page.clock.runFor(48);
    receipt.movement.push(await panel.evaluate(el=>{
     const s=window.__story.inspect(),label=document.querySelector('[data-model-side-label][data-study-chapter="system"]'),r=label.getBoundingClientRect(),title=label.querySelector('[data-source-label]'),sizer=title.parentElement.querySelector('[aria-hidden="true"]');
     return{path:getComputedStyle(el.querySelector('[data-information-skin]')).clipPath,moving:el.dataset.informationMoving,opacity:getComputedStyle(el).opacity,shift:s.readingShiftY,y:scrollY,native:s.nativeDocY,labelCount:document.querySelectorAll('[data-model-side-label][data-study-chapter="system"]').length,label:{width:label.offsetWidth,height:label.offsetHeight,left:r.left,right:r.right},title:title.textContent,allTitles:[...sizer.children].map(node=>node.textContent),controls:label.querySelectorAll('a,button,input,select').length};
    }));
   }
  }finally{await page.clock.resume();}
  expect(receipt.movement.some(value=>value.moving==='true')).toBe(true);expect(receipt.movement.some(value=>value.path.includes('path('))).toBe(true);
  for(const row of receipt.movement){expect(row.opacity).toBe('1');expect(row.shift).toBe(0);expect(Math.abs(row.y-row.native)).toBeLessThan(.01);expect(row.labelCount).toBe(1);expect(row.controls).toBe(0);expect(row.label.width).toBeGreaterThan(0);expect(row.label.height).toBeGreaterThan(0);expect(row.allTitles).toEqual(['Origami representation','Opening representation','Bending-active representation','Authored curvature colors','Source geometry','Assembly reference']);}
  const widths=receipt.movement.map(row=>row.label.width),heights=receipt.movement.map(row=>row.label.height);expect(Math.max(...widths)-Math.min(...widths)).toBeLessThanOrEqual(1);expect(Math.max(...heights)-Math.min(...heights)).toBeLessThanOrEqual(1);
  const time=await page.evaluate(()=>window.__story.inspect().playback.activeSeconds);await page.emulateMedia({reducedMotion:'reduce'});await frames(page,4);
  expect(await page.evaluate(()=>window.__story.inspect().playback.reducedMotion)).toBe(false);await expect.poll(()=>page.evaluate(()=>window.__story.inspect().playback.activeSeconds),{timeout:WAIT}).toBeGreaterThan(time);
  const png=info.outputPath('scroll-model-label-native.png');await page.screenshot({path:png,scale:'device'});await info.attach('scroll-model-label-native',{path:png,contentType:'image/png'});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);expect(errors).toEqual([]);receipt.phase='completed';
 }catch(error){primaryError=error;throw error;}
 finally{try{const file=info.outputPath('model-label-reserve.json');await writeFile(file,JSON.stringify(receipt,null,2));await info.attach('model-label-reserve',{path:file,contentType:'application/json'});}catch(error){if(!primaryError)throw error;}}
});

test('all inline evidence surfaces remain registered once without source popups or disclosure clicks',async({page})=>{
 test.setTimeout(scenarioTimeout(120000));await loadScene(page);
 const source=page.locator('#system [data-information-window="source-details"]');await source.scrollIntoViewIfNeeded();await settle(page);
 await expect(source.locator('img')).toBeVisible();await expect(source).toHaveAttribute('data-information-ready',/.*/,{timeout:WAIT});
 const before=await page.locator('[data-information-window]').count();
 const duplicates=await page.locator('[data-information-window]').evaluateAll(elements=>elements.filter(el=>el.querySelectorAll(':scope > [data-information-skin]').length!==1).map(el=>el.dataset.informationWindow));expect(duplicates).toEqual([]);
 await expect(page.locator('[data-source-comparison],[data-inspect-figure],details,summary')).toHaveCount(0);
 const y=await page.evaluate(()=>scrollY);await page.mouse.wheel(0,300);await expect.poll(()=>page.evaluate(()=>scrollY),{timeout:WAIT}).toBeGreaterThan(y+50);await settle(page);
 await page.emulateMedia({reducedMotion:'reduce'});await frames(page,4);expect(await page.locator('[data-information-window]').count()).toBe(before);expect(await page.evaluate(()=>window.__story.inspect().playback.reducedMotion)).toBe(false);
});
