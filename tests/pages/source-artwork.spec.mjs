import {test,expect} from '@playwright/test';
import {WAIT,scenarioTimeout,loadScene,settle,frames,centerStudy} from './case-helpers.mjs';
import {renderedTextContrast} from './reading-contrast.mjs';
import {SOURCE_COMPARISON_SECONDS} from '../../roles/uiux-designer/cases/bending-active-thesis/components/source-scene-score.mjs';

test('OCR typography, rounded shadowboxes and orange photos retain an accessible original',async({page,isMobile})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/projects/bending-active/#overview');await page.waitForFunction(()=>window.__story?.inspect().entry?.phase==='entered',null,{timeout:WAIT});await page.evaluate(()=>document.fonts.ready);
 const fonts=await page.evaluate(async()=>{const faces=await document.fonts.load('400 16px "Portfolio OCR B"','Original source artwork 60° × 160 mm ↗');return{loaded:document.fonts.check('400 16px "Portfolio OCR B"','Original source artwork 60° × 160 mm ↗'),faces:faces.map(face=>({family:face.family.replaceAll(/['"]/g,''),status:face.status})),body:getComputedStyle(document.body).fontFamily};});expect(fonts).toMatchObject({loaded:true,faces:[{family:'Portfolio OCR B',status:'loaded'}]});expect(fonts.body).toContain('Portfolio OCR B');
 const photo=page.locator('#make [data-media-kind="photo"] img'),link=page.locator('#make [data-inspect-figure]');await link.scrollIntoViewIfNeeded();
 expect(await photo.evaluate(el=>getComputedStyle(el).filter)).toContain('invert(1)');expect(await link.evaluate(el=>parseFloat(getComputedStyle(el).borderTopLeftRadius))).toBeGreaterThanOrEqual(16);
 if(!isMobile){await link.hover();expect(await photo.evaluate(el=>getComputedStyle(el).filter)).toBe('none');}else{await link.focus();expect(await photo.evaluate(el=>getComputedStyle(el).filter)).toBe('none');}
 await link.press('Enter');await expect(page.locator('[data-source-comparison] img')).toBeVisible();expect(await page.locator('[data-source-comparison] img').evaluate(el=>getComputedStyle(el).filter)).toBe('none');await page.getByRole('button',{name:'Close source comparison'}).click();await expect(link).toBeFocused();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
});

test('original SVG paths retain fold and workflow selections, a complete static library and failure fallbacks',async({page})=>{
 test.setTimeout(scenarioTimeout(120000));await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/projects/bending-active/#overview');await page.waitForFunction(()=>window.__story?.inspect().entry?.phase==='entered',null,{timeout:WAIT});
 for(const [kind,count]of [['miura',3],['workflow',4]]){const diagram=page.locator(`[data-source-diagram="${kind}"]`);await diagram.scrollIntoViewIfNeeded();await expect(diagram.locator('svg')).toBeVisible({timeout:WAIT});expect(await diagram.locator('svg path').count()).toBeGreaterThan(10);const buttons=diagram.locator('button[data-diagram-index]');await expect(buttons).toHaveCount(count);await buttons.last().focus();await page.keyboard.press('Enter');await expect(buttons.last()).toHaveAttribute('aria-pressed','true');await expect(diagram.locator('[data-diagram-caption]')).not.toBeEmpty();
  // Every authored caption must fit without changing the reading stop plan.
  // Selection shares the same paint path as autonomous presentation changes.
  await page.evaluate(()=>document.fonts.ready);
  const heights=await diagram.evaluate(async el=>{const values=[];for(const button of el.querySelectorAll('button[data-diagram-index]')){button.click();await new Promise(requestAnimationFrame);values.push({figure:el.getBoundingClientRect().height,document:document.documentElement.scrollHeight});}return values;});
  for(const value of heights){expect(Math.abs(value.figure-heights[0].figure)).toBeLessThan(.01);expect(value.document).toBe(heights[0].document);}
  await diagram.getByRole('button',{name:'Follow chapter'}).click();}
 const library=page.locator('[data-source-diagram="library"]');await library.locator('svg').scrollIntoViewIfNeeded();await settle(page);
 await expect(library.locator('svg path')).toHaveCount(452);await expect(library.locator('svg text')).toHaveCount(27);await expect(library.locator('button')).toHaveCount(0);await expect(library).toHaveAttribute('data-diagram-reveal','completed');
 expect(await library.locator('[data-library-trace]').evaluateAll(paths=>paths.every(path=>getComputedStyle(path).strokeDasharray==='none'&&getComputedStyle(path).visibility==='visible'))).toBe(true);
 await page.route('**/assets/diagrams/*.json',r=>r.abort());await page.reload();await page.waitForFunction(()=>window.__story?.inspect().entry?.phase==='entered',null,{timeout:WAIT});for(const kind of ['miura','library','workflow']){const img=page.locator(`[data-source-diagram="${kind}"] img`);await img.scrollIntoViewIfNeeded();await expect.poll(()=>img.evaluate(el=>el.complete&&el.naturalWidth>0)).toBe(true);}
});

test('zero-wheel chapter loops advance field and workflow selections while OS Reduced stops autonomous time',async({page})=>{
 test.setTimeout(scenarioTimeout(180000));await page.clock.install({time:new Date('2026-01-01T00:00:00Z')});await loadScene(page);await page.locator('[data-chapter-link="system"]').click();await centerStudy(page,'system');await page.mouse.move(10,130);await frames(page,4);
 expect(await page.evaluate(()=>({visible:window.__story.inspect().canvasPlacement.visible,suspended:window.__thesis.inspect().renderSuspended}))).toEqual({visible:true,suspended:false});
 // Fixed sub-stale intervals verify autonomous behavior even when one software
 // GPU frame takes more than a real second. The actual DOM and Canvas still run.
 let first,second;
 const sample=()=>page.evaluate(()=>({time:window.__story.inspect().playback.activeSeconds,field:window.__story.inspect().pageField.fieldTime,draws:window.__story.inspect().pageField.draws,selection:document.querySelector('[data-source-diagram="workflow"]').dataset.diagramSelection,y:scrollY,layering:window.__thesis.inspect().compositor.layering}));
 try{
  await page.clock.pauseAt(new Date('2026-01-01T01:00:00Z'));
  first=await sample();
  // Cross a real source beat; verify the visible SVG selection rather than an
  // unused phase variable. Actual DOM, source presentation and Canvas run.
  for(let i=0;i<24;i++){await page.clock.fastForward(500);second=await sample();if(second.selection&&second.selection!==first.selection)break;}
 }finally{await page.clock.resume();}
 expect(second.y).toBe(first.y);expect(second.time).toBeGreaterThan(first.time);expect(second.field).toBeGreaterThan(first.field);expect(second.draws).toBeGreaterThan(first.draws);expect(second.selection).toBeTruthy();expect(second.selection).not.toBe(first.selection);expect(second.layering).toMatchObject({position:'rear',semanticMask:false,independentField:true});
 const workflow=page.locator('[data-source-diagram="workflow"]'),choice=workflow.locator('button[data-diagram-index="2"]');
 // The SVG controls sit below the source surface. Finish their native focus
 // relocation and the reading response before the real pointer click, rather
 // than clicking while Playwright's autoscroll and the document are settling.
 await choice.focus();await settle(page);
 // Observe the actual pointer click after React's root handler has accepted
 // the comparison. Later software-GPU round trips can outlive its eight-second
 // lifetime; the receipt keeps DOM selection and source state in one event.
 await page.evaluate(()=>{
  window.__testSourceSelectionReceipt=null;
  const observe=event=>{
   const button=event.target.closest('[data-source-diagram="workflow"] button[data-diagram-index="2"]');if(!button)return;
   const state=window.__story.inspect(),selection=state.sourceSelection;
   window.__testSourceSelectionReceipt={trusted:event.isTrusted,pressed:button.getAttribute('aria-pressed'),diagram:button.closest('[data-source-diagram]').dataset.diagramSelection,selection:selection?{...selection}:null,activeSeconds:state.playback.activeSeconds,age:selection?state.playback.activeSeconds-selection.selectedAt:null};
   document.removeEventListener('click',observe);
  };
  document.addEventListener('click',observe);
 });
 await choice.click();await settle(page);
 const selectionReceipt=await page.evaluate(()=>window.__testSourceSelectionReceipt);
 expect(selectionReceipt).toMatchObject({trusted:true,pressed:'true',diagram:'bending',selection:{chapterId:'system',index:2}});
 expect(Number.isFinite(selectionReceipt.activeSeconds)).toBe(true);expect(Number.isFinite(selectionReceipt.selection.selectedAt)).toBe(true);expect(Number.isFinite(selectionReceipt.age)).toBe(true);expect(selectionReceipt.age).toBeGreaterThanOrEqual(0);expect(selectionReceipt.age).toBeLessThan(SOURCE_COMPARISON_SECONDS);
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>window.__story.inspect().playback.reducedMotion,null,{timeout:WAIT});await settle(page);const frozen=await page.evaluate(()=>window.__story.inspect().playback.activeSeconds);await frames(page,10);expect(await page.evaluate(()=>window.__story.inspect().playback.activeSeconds)).toBe(frozen);
});

test('viewport source holds while information scrolls and workflow follows its presented shared phase',async({page})=>{
 test.setTimeout(scenarioTimeout(150000));
 // The narrow stacked layout moves the original HTML source slot away. The
 // viewport scene must retain its own chapter hold while the SVG is read.
 await page.setViewportSize({width:390,height:844});await page.clock.install({time:new Date('2026-01-01T00:00:00Z')});await loadScene(page);await centerStudy(page,'system');
 const workflow=page.locator('[data-source-diagram="workflow"]'),svg=workflow.locator('svg');
 await expect(workflow).toHaveAttribute('data-source-presented','true');
 const before=await page.evaluate(()=>({y:scrollY,viewport:window.__thesis.inspect().pose.viewport,surface:window.__story.inspect().canvasSurface}));
 await svg.scrollIntoViewIfNeeded();await settle(page);
 await svg.evaluate(el=>{const r=el.getBoundingClientRect();scrollBy({top:r.top+r.height/2-innerHeight/2,behavior:'instant'});});await settle(page);await page.mouse.move(10,130);
 await expect(svg).toBeInViewport();await expect(workflow).toHaveAttribute('data-source-presented','true');
 const after=await page.evaluate(()=>({y:scrollY,viewport:window.__thesis.inspect().pose.viewport,surface:window.__story.inspect().canvasSurface,placement:window.__story.inspect().canvasPlacement}));
 expect(Math.abs(after.y-before.y)).toBeGreaterThan(100);expect(after.viewport).toEqual(before.viewport);expect(after.surface).toEqual(before.surface);
 expect(after.placement).toMatchObject({chapter:'system',mode:'hold',x:0,y:0,scale:1,visible:true});
 const sample=()=>page.evaluate(()=>{const root=document.querySelector('[data-source-diagram="workflow"]'),scene=window.__thesis.inspect(),story=window.__story.inspect();return {time:story.playback.activeSeconds,frames:scene.frames,visible:story.canvasPlacement.visible,suspended:scene.renderSuspended,selection:root.dataset.diagramSelection,index:scene.representation.index,pressed:Number(root.querySelector('button[aria-pressed="true"]').dataset.diagramIndex),y:scrollY};});
 let first,second;
 try{
  await page.clock.pauseAt(new Date('2026-01-01T01:00:00Z'));first=await sample();
  for(let i=0;i<24;i++){
   await page.clock.fastForward(500);second=await sample();
   expect(second.visible).toBe(true);expect(second.suspended).toBe(false);expect(second.y).toBe(first.y);
   expect(second.selection).toBe(['origami','opening','bending','colours'][second.index]);expect(second.pressed).toBe(second.index);
   if(second.selection!==first.selection)break;
  }
 }finally{await page.clock.resume();}
 expect(second.time).toBeGreaterThan(first.time);expect(second.frames).toBeGreaterThan(first.frames);expect(second.selection).not.toBe(first.selection);await expect(svg).toBeInViewport();
 // Returning to the information slot does not become a second camera owner.
 await centerStudy(page,'system');await expect(workflow).toHaveAttribute('data-source-presented','true');
 expect(await page.evaluate(()=>{const scene=window.__thesis.inspect();return document.querySelector('[data-source-diagram="workflow"]').dataset.diagramSelection===['origami','opening','bending','colours'][scene.representation.index];})).toBe(true);
});


test('rear scene keeps reading surfaces legible over actual, white and black backdrops',async({page,isMobile})=>{
 test.setTimeout(scenarioTimeout(180000));await page.clock.install();await loadScene(page);await centerStudy(page,'system');await settle(page);
 expect(await page.evaluate(()=>({detail:window.__thesis.inspect().detail,samples:window.__thesis.inspect().compositor.requestedSamples,mist:window.__thesis.inspect().compositor.mist.enabled,suspended:window.__thesis.inspect().renderSuspended}))).toEqual({detail:'full',samples:isMobile?0:2,mist:true,suspended:false});
 const layers=await page.evaluate(()=>({canvases:document.querySelectorAll('canvas').length,glCanvases:document.querySelectorAll('[data-cinematic-stage] canvas').length,asciiCanvases:document.querySelectorAll('canvas[data-ascii-field]').length,stage:Number(getComputedStyle(document.querySelector('[data-cinematic-stage]')).zIndex),reading:Number(getComputedStyle(document.querySelector('[data-reading-frame]')).zIndex),scrim:!!document.querySelector('[data-cinematic-scrim]'),rects:window.__thesis.inspect().protectedRects,layering:window.__thesis.inspect().compositor.layering}));
 expect(layers.canvases).toBe(2);expect(layers.glCanvases).toBe(1);expect(layers.asciiCanvases).toBe(1);expect(layers.stage).toBeLessThan(layers.reading);expect(layers.scrim).toBe(false);expect(layers.rects).toBeUndefined();expect(layers.layering).toMatchObject({position:'rear',semanticMask:false,independentField:true});
 for(const selector of ['#project-title','#system [data-editorial-copy]:first-of-type','[data-source-diagram="workflow"] figcaption','[data-model-study][data-study-chapter="system"] [data-model-side-label]']){
  const target=page.locator(selector);
  if(selector.includes('[data-model-side-label]')){
   // The source information is fixed beside the model; present its chapter
   // instead of trying to scroll a removed document footer into view.
   await centerStudy(page,'system');
  }else{
   await target.scrollIntoViewIfNeeded();await settle(page);
   // Read in the document's unobscured center, away from fixed masthead/tools.
   await target.evaluate(el=>{const r=el.getBoundingClientRect();scrollBy({top:r.top+r.height/2-innerHeight/2,behavior:'instant'});});await settle(page);
  }
  const stage=page.locator('[data-cinematic-stage]'),original=await stage.evaluate(el=>el.style.cssText);
  // Capture the actual Full shot, then stop autonomous RAF delivery while
  // reading pixels. This is contrast acceptance, not an FPS measurement.
  // Use the browser's clock plus a future offset to avoid cross-clock races.
  await page.clock.pauseAt(new Date((await page.evaluate(()=>Date.now()))+60000));
  try{
   for(const backdrop of [null,'#ffffff','#000000']){
    await stage.evaluate((el,color)=>{el.style.background=color??'transparent';el.querySelector('canvas').style.visibility=color?'hidden':'visible';},backdrop);
    const measurements=await renderedTextContrast(page,target);expect(measurements.length).toBeGreaterThan(0);
    for(const value of measurements)expect(value.ratio,`${selector}: ${value.text}, backdrop ${backdrop??'scene'}`).toBeGreaterThanOrEqual(value.required);
   }
  }finally{await stage.evaluate((el,css)=>{el.style.cssText=css;el.querySelector('canvas').style.visibility='';},original);await page.clock.resume();}
 }
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
});
