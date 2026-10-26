import {test,expect} from '@playwright/test';
import {WAIT,scenarioTimeout,settle,centerStudy,frames,loadScene,surface} from './case-helpers.mjs';

const stageCanvas='[data-cinematic-stage] canvas';
const sample=page=>page.evaluate(()=>{
 const scene=window.__thesis.inspect(),story=window.__story.inspect(),canvas=document.querySelector('[data-cinematic-stage] canvas'),r=canvas.getBoundingClientRect();
 return {placement:story.canvasPlacement,informationChapter:story.informationChapter,pose:scene.pose,frames:scene.frames,time:story.playback.activeSeconds,field:story.pageField,rect:{x:r.x,y:r.y,width:r.width,height:r.height},surface:story.canvasSurface,screen:{width:innerWidth,height:innerHeight},native:[canvas.width,canvas.height],budget:scene.renderBudget,pressure:scene.renderPressure,suspended:scene.renderSuspended,informationTop:document.querySelector('#system [data-story-heading]').getBoundingClientRect().top};
});
const scrollTo=async(page,y)=>{await page.evaluate(top=>window.scrollTo({top,behavior:'instant'}),y);await settle(page);};
const osPreference=async page=>{await page.emulateMedia({reducedMotion:'reduce'});await frames(page,4);expect(await page.evaluate(()=>window.__story.inspect().playback.reducedMotion)).toBe(false);};
const chapterY=(page,chapter)=>page.locator(`[data-story-chapter="${chapter}"]`).evaluate(el=>{let y=0;for(let n=el;n;n=n.offsetParent)y+=n.offsetTop;return y;});

test('one viewport scene holds its cinematic scale while information scrolls independently',async({page})=>{
 test.setTimeout(scenarioTimeout(120000));
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await loadScene(page);await centerStudy(page,'system');
 const canvas=await page.locator(stageCanvas).elementHandle(),first=await sample(page),observed=[];
 const {holdStart,holdEnd}=first.placement;
 let previous=first;
 for(const fraction of [.1,.5,.9]){
  await scrollTo(page,holdStart+(holdEnd-holdStart)*fraction);const current=await sample(page);observed.push(current);
  expect(current.placement).toMatchObject({chapter:'system',x:0,y:0,scale:1,opacity:1,visible:true,settled:true,mode:'hold'});
  expect(current.rect).toEqual({x:0,y:0,width:current.surface.width,height:current.surface.height});
  expect(current.rect.width).toBe(current.screen.width);expect(current.rect.height).toBe(current.screen.height);
  expect(current.pose.compositionSpace).toBe('viewport-stage');
  // Full playback preserves viewport composition. Sustained slow delivery may
  // lower backing density, but only through the existing pressure policy.
  expect(current.pose.viewport).toEqual(first.pose.viewport);expect(current.time).toBeGreaterThanOrEqual(first.time);
  expect(current.budget.detail).toBe('full');expect(current.native).toEqual([current.budget.width,current.budget.height]);
  expect(current.budget.pixels).toBeLessThanOrEqual(current.budget.pixelBudget);
  expect(current.budget.densityScale).toBeLessThanOrEqual(previous.budget.densityScale);
  if(current.budget.densityScale===previous.budget.densityScale)expect(current.native).toEqual(previous.native);
  else{
   expect(current.pressure.decisions).toBeGreaterThan(previous.pressure.decisions);
   expect(current.native[0]).toBeLessThan(previous.native[0]);expect(current.native[1]).toBeLessThan(previous.native[1]);
  }
  previous=current;
 }
 await test.info().attach('native-reading-density-records',{body:JSON.stringify([first,...observed].map(({native,budget,pressure})=>({native,budget,pressure}))),contentType:'application/json'});
 expect(observed[0].informationTop-observed[2].informationTop).toBeGreaterThan(100);
 // Between the .42vh reading probe and .62vh scene probe, FORM can remain the
 // current information chapter while SYSTEM already owns the displayed scene.
 const separationY=await page.locator('#system').evaluate(el=>{let y=0;for(let n=el;n;n=n.offsetParent)y+=n.offsetTop;return y-innerHeight*.52;});
 await scrollTo(page,separationY);const separate=await sample(page);
 expect(separate.informationChapter).toBe('form');expect(separate.placement.chapter).toBe('system');
 await expect(page.locator('[data-chapter-link="form"]')).toHaveAttribute('aria-current','location');
 expect(await page.evaluate(el=>document.querySelector('[data-cinematic-stage] canvas')===el,canvas)).toBe(true);
 await expect(page.locator(stageCanvas)).toHaveCount(1);await expect(page.locator('canvas[data-ascii-field]')).toHaveCount(1);await expect(page.locator('canvas')).toHaveCount(2);
 await osPreference(page);const active=await sample(page);await frames(page,8);const still=await sample(page);expect(still.time).toBeGreaterThan(active.time);expect(still.placement.chapter).toBe(active.placement.chapter);expect(errors).toEqual([]);
});

test('keyboard reading across the information and scene gap does not create inspection ownership',async({page})=>{
 test.setTimeout(scenarioTimeout(120000));await loadScene(page);await centerStudy(page,'form');
 const canvas=await page.locator(stageCanvas).elementHandle(),gap=await page.locator('#system').evaluate(el=>{let y=0;for(let n=el;n;n=n.offsetParent)y+=n.offsetTop;return y-innerHeight*.52;});
 await scrollTo(page,gap);
 expect(await page.evaluate(()=>({information:window.__story.inspect().informationChapter,scene:window.__story.inspect().canvasPlacement.chapter,source:window.__thesis.inspect().representation.chapterId}))).toEqual({information:'form',scene:'system',source:'system'});
 await expect(page.locator('[data-model-viewport][role="button"],[data-model-viewport][tabindex="0"]')).toHaveCount(0);
 const y=await page.evaluate(()=>scrollY);await page.keyboard.press('PageDown');await settle(page);expect(await page.evaluate(()=>scrollY)).toBeGreaterThan(y);
 expect(await page.evaluate(()=>{const s=window.__story.inspect();return{engaged:s.modelEngaged,held:s.modelHeldSource,selection:s.sourceSelection,awaiting:s.canvasAwaitingPaint,shift:s.readingShiftY};})).toEqual({engaged:false,held:null,selection:null,awaiting:false,shift:0});
 expect(await page.evaluate(el=>document.querySelector('[data-cinematic-stage] canvas')===el,canvas)).toBe(true);
});

test('absent evidence scenes sleep WebGL while the independent page ASCII keeps the shared clock',async({page})=>{
 test.setTimeout(scenarioTimeout(120000));await loadScene(page);
 const canvas=await page.locator(stageCanvas).elementHandle();
 for(const chapter of ['make','validation','credits']){
  await scrollTo(page,await chapterY(page,chapter));
  const before=await sample(page);expect(before.placement).toMatchObject({chapter,visible:false,settled:true,mode:'absent'});expect(before.suspended).toBe(true);
  await frames(page,12);const after=await sample(page);
  expect(after.frames).toBe(before.frames);expect(after.time).toBeGreaterThan(before.time);expect(after.field.draws).toBeGreaterThan(before.field.draws);expect(after.field.fieldTime).toBeGreaterThan(before.field.fieldTime);
  expect(after.field.drawnGlyphs).toBeGreaterThan(0);expect(after.field.cssWidth).toBe(after.surface.width);expect(after.field.cssHeight).toBe(after.surface.height);
  expect(await page.evaluate(el=>document.querySelector('[data-cinematic-stage] canvas')===el,canvas)).toBe(true);
 }
 await centerStudy(page,'system');const returned=await sample(page);expect(returned.suspended).toBe(false);expect(returned.placement.visible).toBe(true);
 await expect.poll(()=>page.evaluate(()=>window.__thesis.inspect().frames),{timeout:WAIT}).toBeGreaterThan(returned.frames);
 await osPreference(page);
 await expect(page.locator(stageCanvas)).toHaveCount(1);await expect(page.locator('canvas[data-ascii-field]')).toHaveCount(1);
});

test('OS preference leaves geometry readable and real source clicks do not alter scroll selection or remount resources',async({page})=>{
 test.setTimeout(scenarioTimeout(120000));await page.setViewportSize({width:390,height:844});await loadScene(page);await osPreference(page);await centerStudy(page,'system');
 const canvas=await page.locator(stageCanvas).elementHandle();
 const resources=()=>page.evaluate(()=>{const scene=window.__thesis.inspect(),canvas=document.querySelector('[data-cinematic-stage] canvas'),story=window.__story.inspect();return{id:scene.representation.id,source:scene.source,diagrams:scene.diagramSource,initialization:scene.initialization,docY:scrollY,engaged:story.modelEngaged,held:story.modelHeldSource,selection:story.sourceSelection,native:[canvas.width,canvas.height],pressure:scene.renderPressure,budget:scene.renderBudget};});
 const before=await resources();await surface(page,'system').evaluate(el=>el.scrollIntoView({block:'center',behavior:'instant'}));await settle(page);
 // Click on the displayed source's viewport rather than an old semantic control.
 const point=await page.evaluate(()=>{const c=document.querySelector('[data-cinematic-stage] canvas').getBoundingClientRect(),v=window.__thesis.inspect().pose.viewport;return{x:c.left+c.width*(v.left+v.width*.5),y:c.top+c.height*(v.top+v.height*.5)};});
 const atClick=await resources();await page.mouse.click(point.x,point.y);await settle(page);const after=await resources();
 expect(after.id).toBe(atClick.id);expect(after.docY).toBe(atClick.docY);expect(after).toMatchObject({engaged:false,held:null,selection:null});
 expect(after.source).toEqual(before.source);expect(after.diagrams).toEqual(before.diagrams);expect(after.initialization).toEqual(before.initialization);
 if(after.pressure.stage===atClick.pressure.stage)expect(after.native).toEqual(atClick.native);else expect(after.pressure.decisions).toBeGreaterThan(atClick.pressure.decisions);
 expect(await page.evaluate(el=>document.querySelector('[data-cinematic-stage] canvas')===el,canvas)).toBe(true);await expect(page.locator(stageCanvas)).toHaveCount(1);await expect(page.locator('canvas[data-ascii-field]')).toHaveCount(1);
});

test('the continuous source block exits only at Pattern and an interrupted scroll reverses without scaling or remounting',async({page})=>{
 test.setTimeout(scenarioTimeout(120000));await page.clock.install();await loadScene(page);await centerStudy(page,'pattern');
 const canvas=await page.locator(stageCanvas).elementHandle(),held=await sample(page);
 const start=held.placement.holdEnd-60,target=held.placement.holdEnd+(held.placement.end-held.placement.holdEnd)*.55;
 await scrollTo(page,start);const initial=await sample(page);expect(initial.placement).toMatchObject({x:0,y:0,scale:1,opacity:1,mode:'hold'});
 await page.clock.pauseAt(new Date(Date.now()+3600000));
 try{
  await page.evaluate(top=>window.scrollTo({top,behavior:'instant'}),target);const forward=[];
  for(let i=0;i<8;i++){await page.clock.fastForward(50);forward.push(await sample(page));}
  expect(forward.some(s=>!s.placement.settled&&s.placement.mode==='exit')).toBe(true);
  expect(forward.some(s=>s.placement.x<-20&&s.placement.opacity<.99)).toBe(true);
  for(const current of forward){expect(current.placement.chapter).toBe('pattern');expect(current.placement.scale).toBe(1);expect(current.rect.width).toBe(initial.rect.width);}
  await page.evaluate(top=>window.scrollTo({top,behavior:'instant'}),start);const reverse=[];
  for(let i=0;i<24;i++){await page.clock.fastForward(100);reverse.push(await sample(page));}
  expect(reverse.some(s=>!s.placement.settled&&s.placement.x>forward.at(-1).placement.x)).toBe(true);
  expect(reverse.at(-1).placement).toMatchObject({chapter:'pattern',x:0,y:0,scale:1,opacity:1,visible:true,settled:true,mode:'hold'});
  expect(await page.evaluate(el=>document.querySelector('[data-cinematic-stage] canvas')===el,canvas)).toBe(true);
  await expect(page.locator(stageCanvas)).toHaveCount(1);await expect(page.locator('canvas[data-ascii-field]')).toHaveCount(1);
 }finally{await page.clock.resume();}
});

test('native forward and reverse chapter scrolling never fades or remounts the already painted Bending source block',async({page})=>{
 test.setTimeout(scenarioTimeout(120000));await loadScene(page);
 const canvas=await page.locator(stageCanvas).elementHandle();
 const trace=await page.evaluateHandle(()=>{
  let running=true,raf;const samples=[];
  const record=()=>{if(!running)return;const story=window.__story.inspect(),scene=window.__thesis.inspect(),stage=document.querySelector('[data-cinematic-stage]');samples.push({chapter:story.canvasPlacement.chapter,pose:{x:story.canvasPlacement.x,y:story.canvasPlacement.y,opacity:story.canvasPlacement.opacity},cssOpacity:Number(getComputedStyle(stage).opacity),source:scene.source,ready:scene.ready});raf=requestAnimationFrame(record);};record();
  return{samples,dispose(){running=false;cancelAnimationFrame(raf);}};
 });
 try{
  for(const chapter of ['form','system','pattern','system','form']){
   const y=await page.locator(`[data-story-chapter="${chapter}"]`).evaluate(node=>{let y=0;for(let n=node;n;n=n.offsetParent)y+=n.offsetTop;return y;});
   await scrollTo(page,y);expect((await sample(page)).placement.chapter).toBe(chapter);
   expect(await page.evaluate(node=>node===document.querySelector('[data-cinematic-stage] canvas'),canvas)).toBe(true);
  }
  const samples=await trace.evaluate(value=>value.samples);expect(samples.length).toBeGreaterThan(5);
  for(const current of samples){expect(current.pose).toEqual({x:0,y:0,opacity:1});expect(current.cssOpacity).toBe(1);expect(current.ready).toBe(true);}
  await test.info().attach('continuous-bending-native-passage',{body:JSON.stringify(samples),contentType:'application/json'});
 }finally{await trace.evaluate(value=>value.dispose());await trace.dispose();}
 await scrollTo(page,await chapterY(page,'credits'));
 expect((await sample(page)).placement).toMatchObject({chapter:'credits',visible:false,opacity:0,mode:'absent'});
 await frames(page,8);expect((await sample(page)).suspended).toBe(true);
});
