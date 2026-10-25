import {test,expect} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
import {loadScene,centerStudy,settle,expectIdle,scenarioTimeout,WAIT} from './case-helpers.mjs';

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

test('information windows share one fluid surface while native reading, focus and Reduced remain intact',async({page},info)=>{
 const receipt={movement:[]};let primaryError;
 try{
 test.setTimeout(scenarioTimeout(120000));const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.clock.install();await loadScene(page);
 await centerStudy(page,'system');
 // Seed prior RO entries in this diagnostic epoch; first prior remains unknown.
 // Existing expectIdle clears the ring, not this baseline. Earlier failures have no retained idle receipt.
 expect(await page.evaluate(()=>{window.__story.setWakeDiagnostics(true);return window.__story.inspect().informationWindows.recipe;})).toBe('ink');
 const registered=page.locator('[data-information-window][data-information-ready]');
 expect(await registered.count()).toBeGreaterThanOrEqual(13);
 expect(await page.locator('[data-cinematic-stage] [data-information-window]').count()).toBe(0);
 const ownership=await registered.evaluateAll(elements=>elements.map(el=>({kind:el.dataset.informationWindow,skin:el.querySelectorAll(':scope > [data-information-skin]').length,clip:getComputedStyle(el).clipPath,opacity:getComputedStyle(el).opacity,nested:!!el.parentElement.closest('[data-information-window][data-information-ready]')})));
 for(const row of ownership){expect(row.skin).toBe(1);expect(row.clip).toBe('none');expect(row.opacity).toBe('1');expect(row.nested).toBe(false);}
 const panel=page.locator('#system [data-story-panel]');
 await panel.scrollIntoViewIfNeeded();await settle(page);
 const movement=receipt.movement;
 await page.clock.pauseAt(new Date(Date.now()+3600000));
 try{
  // Two real RAF deliveries can exceed the entire elastic response on a
  // software GPU. Sample fixed active time, including the actual painted clip.
  for(let i=0;i<8;i++){
   await page.evaluate(delta=>scrollBy({top:delta,behavior:'instant'}),i<4?55:-55);
   await page.clock.runFor(48);
   movement.push(await panel.evaluate(el=>{const label=document.querySelector('[data-model-side-label][data-study-chapter="system"]');const box=node=>{if(!node)return null;const r=node.getBoundingClientRect();return{left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height,layoutWidth:node.offsetWidth,layoutHeight:node.offsetHeight};};const title=label?.querySelector('[data-source-label]'),position=label?.querySelector('[data-source-position]'),description=label?.querySelector('[data-source-description]'),callout=label?.querySelector('[data-model-annotation-label]'),annotation=label?.querySelector('[data-model-annotation-text]');const components=[['label',label],['title',title],['position',position],['description',description],['callout',callout]].map(([name,node])=>({name,box:box(node),text:node?.textContent?.trim().slice(0,1000)??null}));const range=document.createRange();if(title)range.selectNodeContents(title);const geometry={placement:label?.dataset.modelLabelPlacement??null,labelCount:document.querySelectorAll('[data-model-side-label][data-study-chapter="system"]').length,componentCounts:['[data-source-label]','[data-source-position]','[data-source-description]','[data-model-annotation-label]','[data-model-annotation-text]'].map(selector=>label?.querySelectorAll(selector).length??0),components,titleTextRects:title?[...range.getClientRects()].slice(0,8).map(r=>({left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height})):[],slots:[box(title?.parentElement),box(position?.parentElement),box(annotation?.parentElement)],controls:[...label?.querySelectorAll('button,a,input')??[]].slice(0,4).map(node=>({box:box(node),text:node.textContent?.trim().slice(0,160)})),chrome:['[data-page-masthead]','[data-story-navigation]','[data-reading-tools]'].map(selector=>{const nodes=[...document.querySelectorAll(selector)],node=nodes[0];return{selector,count:nodes.length,visible:node?.checkVisibility({visibilityProperty:true,opacityProperty:true})??false,box:box(node)};}),viewport:{width:innerWidth,height:innerHeight},y:scrollY};return{path:getComputedStyle(el.querySelector('[data-information-skin]')).clipPath,moving:el.dataset.informationMoving,opacity:getComputedStyle(el).opacity,geometry};}));
  }
 }finally{await page.clock.resume();}
 expect(movement.some(value=>value.moving==='true')).toBe(true);
 expect(movement.some(value=>value.path.includes('path('))).toBe(true);
 expect(movement.every(value=>value.opacity==='1')).toBe(true);
 const control=page.locator('[data-chapter-link="form"]');await control.focus();await expect(control).toBeFocused();
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>window.__story.inspect().playback.reducedMotion,null,{timeout:WAIT});await settle(page);await expectIdle(page);
 const reducedState=await registered.evaluateAll(elements=>{const label=document.querySelector('[data-model-side-label][data-study-chapter="system"]');const box=node=>{if(!node)return null;const r=node.getBoundingClientRect();return{left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height,layoutWidth:node.offsetWidth,layoutHeight:node.offsetHeight};};const title=label?.querySelector('[data-source-label]'),position=label?.querySelector('[data-source-position]'),description=label?.querySelector('[data-source-description]'),callout=label?.querySelector('[data-model-annotation-label]'),annotation=label?.querySelector('[data-model-annotation-text]');const components=[['label',label],['title',title],['position',position],['description',description],['callout',callout]].map(([name,node])=>({name,box:box(node),text:node?.textContent?.trim().slice(0,1000)??null}));const range=document.createRange();if(title)range.selectNodeContents(title);const geometry={placement:label?.dataset.modelLabelPlacement??null,labelCount:document.querySelectorAll('[data-model-side-label][data-study-chapter="system"]').length,componentCounts:['[data-source-label]','[data-source-position]','[data-source-description]','[data-model-annotation-label]','[data-model-annotation-text]'].map(selector=>label?.querySelectorAll(selector).length??0),components,titleTextRects:title?[...range.getClientRects()].slice(0,8).map(r=>({left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height})):[],slots:[box(title?.parentElement),box(position?.parentElement),box(annotation?.parentElement)],controls:[...label?.querySelectorAll('button,a,input')??[]].slice(0,4).map(node=>({box:box(node),text:node.textContent?.trim().slice(0,160)})),chrome:['[data-page-masthead]','[data-story-navigation]','[data-reading-tools]'].map(selector=>{const nodes=[...document.querySelectorAll(selector)],node=nodes[0];return{selector,count:nodes.length,visible:node?.checkVisibility({visibilityProperty:true,opacityProperty:true})??false,box:box(node)};}),viewport:{width:innerWidth,height:innerHeight},y:scrollY};return{rows:elements.map(el=>({moving:el.dataset.informationMoving,transform:getComputedStyle(el).transform})),geometry};});
 receipt.after=reducedState.geometry;const reduced=reducedState.rows;
 const png=info.outputPath('reduced-model-label-native.png');await page.screenshot({path:png,scale:'device'});await info.attach('reduced-model-label-native',{path:png,contentType:'image/png'});
 const before=movement.at(-1).geometry;expect(receipt.after.viewport).toEqual(before.viewport);
 for(const geometry of [before,receipt.after]){
  expect(geometry.labelCount).toBe(1);expect(geometry.componentCounts).toEqual([1,1,1,1,1]);expect(geometry.components).toHaveLength(5);expect(geometry.slots).toHaveLength(3);expect(geometry.titleTextRects.length).toBeGreaterThan(0);
  for(const box of [...geometry.components.map(row=>row.box),...geometry.slots,...geometry.titleTextRects,...geometry.controls.map(row=>row.box)]){expect(box).not.toBeNull();for(const key of ['left','top','right','bottom','width','height'])expect(Number.isFinite(box[key])).toBe(true);expect(box.width).toBeGreaterThan(0);expect(box.height).toBeGreaterThan(0);}
 }
 if(receipt.after.viewport.width>=781){expect(receipt.after.placement).toBe('overlay');expect(before.placement).toBe('overlay');}
 if(receipt.after.placement==='overlay'&&receipt.after.viewport.width>=781){
 const card=receipt.after.components[0].box;
 for(const box of [card,...receipt.after.controls.map(row=>row.box)]){expect(box.left).toBeGreaterThanOrEqual(0);expect(box.top).toBeGreaterThanOrEqual(0);expect(box.right).toBeLessThanOrEqual(receipt.after.viewport.width);expect(box.bottom).toBeLessThanOrEqual(receipt.after.viewport.height);}
 for(const item of receipt.after.chrome){expect(item.count,item.selector).toBe(1);if(item.visible){const c=item.box;expect(Math.max(0,Math.min(card.right,c.right)-Math.max(card.left,c.left))*Math.max(0,Math.min(card.bottom,c.bottom)-Math.max(card.top,c.top))).toBe(0);}}

 for(const [index,after] of [receipt.after.components[0].box,...receipt.after.slots].entries()){
  const prior=[before.components[0].box,...before.slots][index];expect(after).not.toBeNull();expect(prior).not.toBeNull();
  for(const key of ['layoutWidth','layoutHeight']){expect(Number.isFinite(after[key])&&Number.isFinite(prior[key])).toBe(true);expect(Math.abs(after[key]-prior[key])).toBeLessThanOrEqual(1);}
 }
 }
 for(const row of reduced){expect(row.moving).not.toBe('true');expect(row.transform).toBe('none');}
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);expect(errors).toEqual([]);
 }catch(error){primaryError=error;throw error;}finally{try{const file=info.outputPath('model-label-reserve.json');await writeFile(file,JSON.stringify(receipt,null,2));await info.attach('model-label-reserve',{path:file,contentType:'application/json'});}catch(error){if(!primaryError)throw error;}}
});

test('dynamic evidence windows join and leave the shared presenter without duplicate surfaces under OS Reduced',async({page})=>{
 test.setTimeout(scenarioTimeout(120000));await loadScene(page);await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>window.__story.inspect().playback.reducedMotion,null,{timeout:WAIT});await settle(page);
 const trigger=page.locator('[data-inspect-figure]').filter({visible:true}).first();
 await trigger.scrollIntoViewIfNeeded();await settle(page);await trigger.click();
 const portal=page.locator('[data-source-comparison]');await expect(portal).toBeVisible();
 await expect(portal).toHaveAttribute('data-information-ready',/.*/,{timeout:WAIT});
 await expect(portal.locator(':scope > [data-information-skin]')).toHaveCount(1);
 await page.getByRole('button',{name:'Close source comparison'}).click();await expect(portal).toHaveCount(0);
 await expect(trigger).toBeFocused();await expectIdle(page);
});
