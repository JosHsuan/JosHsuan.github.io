import {test,expect} from '@playwright/test';
import {WAIT,scenarioTimeout,loadScene,settle,frames,centerStudy} from './case-helpers.mjs';
import {renderedTextContrast} from './reading-contrast.mjs';

test('Roboto Mono headings and rounded photographic frames retain original pixels and colors in native scroll reading',async({page})=>{
 // Typography and photographic evidence must also work with genuinely unavailable 3D.
 await page.route('**/source-layers.glb',route=>route.abort());
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/projects/bending-active/#overview');await page.waitForFunction(()=>window.__story?.inspect().entry?.phase==='entered',null,{timeout:WAIT});await page.evaluate(()=>document.fonts.ready);
 const fonts=await page.evaluate(async()=>{
  const faces=await Promise.all([document.fonts.load('400 16px "Roboto Mono"','Original source artwork 60° × 160 mm ↗'),document.fonts.load('400 16px "Roboto Mono"','Bending-Active Metal Panel Deformation')]);
  return{loaded:{body:document.fonts.check('400 16px "Roboto Mono"','Original source artwork 60° × 160 mm ↗'),display:document.fonts.check('400 16px "Roboto Mono"','Bending-Active Metal Panel Deformation')},faces:faces.flat().map(face=>({family:face.family.replaceAll(/['"]/g,''),status:face.status})),body:getComputedStyle(document.body).fontFamily,heading:getComputedStyle(document.querySelector('h1')).fontFamily,lastHeading:getComputedStyle(document.querySelector('h1 span:last-child')).fontFamily};
 });expect(fonts).toMatchObject({loaded:{body:true,display:true},faces:[{family:'Roboto Mono',status:'loaded'},{family:'Roboto Mono',status:'loaded'}]});expect(fonts.body).toContain('Roboto Mono');expect(fonts.heading).toContain('Roboto Mono');expect(fonts.lastHeading).toContain('Roboto Mono');
 const photo=page.locator('#make [data-media-kind="photo"] img'),frame=page.locator('#make [data-information-window="evidence-image"]');await frame.scrollIntoViewIfNeeded();await settle(page);
 await expect(photo).toHaveCSS('filter','none');await expect(photo).toHaveCSS('mix-blend-mode','normal');expect(await frame.evaluate(el=>parseFloat(getComputedStyle(el).borderTopLeftRadius))).toBeGreaterThanOrEqual(16);
 await expect(frame.locator('a,button')).toHaveCount(0);await expect(page.locator('[data-source-comparison],[data-inspect-figure]')).toHaveCount(0);
 await expect(photo).toHaveAttribute('src','/assets/cinematic/connection-detail.webp');await expect.poll(()=>photo.evaluate(el=>el.complete&&el.naturalWidth>0),{timeout:WAIT}).toBe(true);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
});

test('original SVG paths retain every inline stage, the complete library and source-preserving failure fallbacks',async({page})=>{
 test.setTimeout(scenarioTimeout(120000));await page.goto('/projects/bending-active/#overview');await page.waitForFunction(()=>window.__story?.inspect().entry?.phase==='entered',null,{timeout:WAIT});
 for(const [kind,count]of [['miura',3],['workflow',4]]){
  const diagram=page.locator(`[data-source-diagram="${kind}"]`);await diagram.scrollIntoViewIfNeeded();await expect(diagram.locator('svg')).toBeVisible({timeout:WAIT});expect(await diagram.locator('svg path').count()).toBeGreaterThan(10);await expect(diagram.locator('button')).toHaveCount(0);await expect(diagram.locator('ol li')).toHaveCount(count);
  const stages=await diagram.locator('ol li').allTextContents();for(const text of stages)expect(text.trim().length).toBeGreaterThan(10);
 }
 const library=page.locator('[data-source-diagram="library"]');await library.locator('svg').scrollIntoViewIfNeeded();await settle(page);
 await expect(library.locator('svg path')).toHaveCount(452);await expect(library.locator('svg text')).toHaveCount(27);await expect(library.locator('button')).toHaveCount(0);await expect(library).toHaveAttribute('data-diagram-reveal','completed',{timeout:WAIT});
 expect(await library.locator('[data-library-trace]').evaluateAll(paths=>paths.every(path=>getComputedStyle(path).strokeDasharray==='none'&&getComputedStyle(path).visibility==='visible'))).toBe(true);
 await page.route('**/assets/diagrams/*.json',r=>r.abort());await page.reload();await page.waitForFunction(()=>window.__story?.inspect().entry?.phase==='entered',null,{timeout:WAIT});
 for(const kind of ['miura','library','workflow']){const img=page.locator(`[data-source-diagram="${kind}"] img`);await img.scrollIntoViewIfNeeded();await expect.poll(()=>img.evaluate(el=>el.complete&&el.naturalWidth>0),{timeout:WAIT}).toBe(true);}
 await expect(page.locator('[data-source-diagram="miura"] ol li')).toHaveCount(3);await expect(page.locator('[data-source-diagram="workflow"] ol li')).toHaveCount(4);
});

test('stationary reading keeps one source while independent field motion and OS-preference-neutral playback continue',async({page})=>{
 test.setTimeout(scenarioTimeout(180000));await page.clock.install({time:new Date('2026-01-01T00:00:00Z')});await loadScene(page);await centerStudy(page,'system');await page.mouse.move(10,130);await frames(page,4);
 const sample=()=>page.evaluate(()=>({time:window.__story.inspect().playback.activeSeconds,field:window.__story.inspect().pageField.fieldTime,draws:window.__story.inspect().pageField.draws,selection:document.querySelector('[data-source-diagram="workflow"]').dataset.diagramSelection,y:scrollY,layering:window.__thesis.inspect().compositor.layering,source:window.__thesis.inspect().representation.id}));let first,second;
 try{await page.clock.pauseAt(new Date('2026-01-01T01:00:00Z'));first=await sample();for(let i=0;i<8;i++)await page.clock.fastForward(500);second=await sample();}finally{await page.clock.resume();}
 expect(second.y).toBe(first.y);expect(second.time).toBeGreaterThan(first.time);expect(second.field).toBeGreaterThan(first.field);expect(second.draws).toBeGreaterThan(first.draws);expect(second.selection).toBe(first.selection);expect(second.source).toBe(first.source);expect(second.layering).toMatchObject({position:'rear',semanticMask:false,independentField:true});
 await page.emulateMedia({reducedMotion:'reduce'});await settle(page);const before=await sample();await frames(page,10);const after=await sample();expect(after.time).toBeGreaterThan(before.time);expect(after.source).toBe(before.source);expect(await page.evaluate(()=>window.__story.inspect().playback.reducedMotion)).toBe(false);
});

test('viewport source holds while native scroll selects the matching source and inline workflow emphasis',async({page})=>{
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
 const sample=()=>page.evaluate(()=>{const root=document.querySelector('[data-source-diagram="workflow"]'),scene=window.__thesis.inspect(),story=window.__story.inspect();return {time:story.playback.activeSeconds,frames:scene.frames,visible:story.canvasPlacement.visible,suspended:scene.renderSuspended,selection:root.dataset.diagramSelection,index:scene.representation.index,emphasis:Number(root.querySelector('ol li[data-diagram-active="true"]').dataset.diagramIndex),y:scrollY};});
 let first,second;
 try{
  await page.clock.pauseAt(new Date('2026-01-01T01:00:00Z'));first=await sample();
  for(let i=0;i<24;i++){
   await page.clock.fastForward(500);second=await sample();
   expect(second.visible).toBe(true);expect(second.suspended).toBe(false);expect(second.y).toBe(first.y);
   expect(second.selection).toBe(['origami','opening','bending','colours'][second.index]);expect(second.emphasis).toBe(second.index);

  }
 }finally{await page.clock.resume();}
 expect(second.time).toBeGreaterThan(first.time);expect(second.frames).toBeGreaterThan(first.frames);expect(second.selection).toBe(first.selection);expect(second.index).toBe(first.index);await expect(svg).toBeInViewport();
 // Returning to the information slot does not become a second camera owner.
 await centerStudy(page,'system');await expect(workflow).toHaveAttribute('data-source-presented','true');
 expect(await page.evaluate(()=>{const scene=window.__thesis.inspect();return document.querySelector('[data-source-diagram="workflow"]').dataset.diagramSelection===['origami','opening','bending','colours'][scene.representation.index];})).toBe(true);
});


test('rear scene keeps reading surfaces legible over actual, white and black backdrops',async({page,isMobile})=>{
 test.setTimeout(scenarioTimeout(180000));await page.clock.install();await loadScene(page);await centerStudy(page,'system');await settle(page);
 expect(await page.evaluate(()=>({detail:window.__thesis.inspect().detail,samples:window.__thesis.inspect().compositor.requestedSamples,mist:window.__thesis.inspect().compositor.mist.enabled,suspended:window.__thesis.inspect().renderSuspended}))).toEqual({detail:'full',samples:isMobile?0:2,mist:true,suspended:false});
 const layers=await page.evaluate(()=>({canvases:document.querySelectorAll('canvas').length,glCanvases:document.querySelectorAll('[data-cinematic-stage] canvas').length,asciiCanvases:document.querySelectorAll('canvas[data-ascii-field]').length,stage:Number(getComputedStyle(document.querySelector('[data-cinematic-stage]')).zIndex),reading:Number(getComputedStyle(document.querySelector('[data-reading-frame]')).zIndex),scrim:!!document.querySelector('[data-cinematic-scrim]'),rects:window.__thesis.inspect().protectedRects,layering:window.__thesis.inspect().compositor.layering}));
 expect(layers.canvases).toBe(2);expect(layers.glCanvases).toBe(1);expect(layers.asciiCanvases).toBe(1);expect(layers.stage).toBeLessThan(layers.reading);expect(layers.scrim).toBe(false);expect(layers.rects).toBeUndefined();expect(layers.layering).toMatchObject({position:'rear',semanticMask:false,independentField:true});
 for(const selector of ['#project-title','#system [data-editorial-copy]:first-of-type','[data-source-diagram="workflow"] figcaption','[data-model-side-label][data-study-chapter="system"]']){
  const target=page.locator(selector);
  if(selector.includes('[data-model-side-label]')){
   // Desktop information remains beside the model. The mobile portal is
   // real document content and must be read at its native unobscured position.
   await centerStudy(page,'system');
  }
  if(!selector.includes('[data-model-side-label]')||await target.getAttribute('data-model-label-placement')==='native'){
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
