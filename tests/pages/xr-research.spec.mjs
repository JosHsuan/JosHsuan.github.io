import {test,expect} from '@playwright/test';
import {createServer} from 'node:http';
import {fileURLToPath} from 'node:url';
import {readFile} from 'node:fs/promises';
import {createPagesPreviewHandler} from '../../scripts/serve-pages.mjs';
import {WAIT,frames} from './case-helpers.mjs';

const stage=page=>page.locator('[data-xr-stage]');
const control=page=>page.locator('[data-xr-model-control]');
const video=(page,id)=>stage(page).locator(`[data-xr-stage-video="${id}"]`);
const facts=page=>stage(page).evaluate(node=>node.__xrStage.inspect());
const workspace=JSON.parse(await readFile(new URL('../../roles/uiux-designer/cases/bending-active-thesis/release/xr-workspace.json',import.meta.url),'utf8'));
const studies=JSON.parse(await readFile(new URL('../../roles/uiux-designer/cases/bending-active-thesis/release/project-studies.json',import.meta.url),'utf8')).projects;
async function openingVisible(page){
 await expect(stage(page)).toHaveAttribute('data-xr-opening','true');
 await expect(stage(page).locator('[data-xr-opening-visual]')).toHaveCount(0);
 await expect(page.locator('[data-xr-hero]')).toHaveCount(0);
 await expect(stage(page).locator('[data-xr-workspace-visual]')).toBeHidden();
 await expect(stage(page).locator('canvas')).toBeHidden();await expect(stage(page).locator('[data-xr-model-poster]')).toBeHidden();
 await expect(page.locator('[data-xr-scene-controls]')).toBeHidden();
}
async function contextVisible(page){
 const visual=stage(page).locator('[data-xr-workspace-visual]');await expect(visual).toBeVisible();
 const source=await visual.evaluate(node=>({ready:node.complete&&node.naturalWidth>0&&node.naturalHeight>0,source:new URL(node.currentSrc).pathname,width:node.naturalWidth,height:node.naturalHeight,fit:getComputedStyle(node).objectFit,box:node.getBoundingClientRect().toJSON()})),viewport=page.viewportSize(),expected=viewport.width<800?workspace.image.mobile??workspace.image:workspace.image;
 expect(source.ready).toBe(true);expect(source.source).toBe(expected.src);expect(source.width).toBe(expected.width);expect(source.height).toBe(expected.height);expect(source.source).not.toBe('/assets/xr/portfolio-main-visual.webp');expect(source.source).not.toBe('/assets/xr/research-assembly-poster.webp');expect(source.fit).toBe('contain');
 expect(source.box.x).toBeCloseTo(0,0);expect(source.box.y).toBeCloseTo(0,0);expect(source.box.width).toBeCloseTo(viewport.width,0);expect(source.box.height).toBeCloseTo(viewport.height,0);
 await expect(stage(page).locator('canvas')).toBeHidden();await expect(stage(page).locator('[data-xr-model-poster]')).toBeHidden();await expect(page.locator('[data-xr-scene-controls]')).toBeHidden();
 expect((await facts(page)).workspace.phase).toBe('ready');
}
async function fullCanvas(page){
 const sample=await page.evaluate(()=>{const host=document.querySelector('[data-xr-stage]'),canvas=host.querySelector('canvas');return{box:canvas.getBoundingClientRect().toJSON(),view:host.__xrStage.inspect().resource.surface.viewport};}),viewport=page.viewportSize(),{box,view}=sample;
 expect(box.x).toBeCloseTo(0,0);expect(box.y).toBeCloseTo(0,0);expect(box.width).toBeCloseTo(viewport.width,0);expect(box.height).toBeCloseTo(viewport.height,0);
 expect({left:view.left,top:view.top,width:view.width,height:view.height}).toEqual({left:0,top:0,...viewport});
}
async function viewportFits(page){
 const viewport=page.viewportSize(),actual=await page.evaluate(()=>({clientWidth:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth,innerWidth,innerHeight,visualWidth:visualViewport?.width,visualHeight:visualViewport?.height}));
 expect(actual.clientWidth).toBe(viewport.width);expect(actual.scrollWidth).toBeLessThanOrEqual(actual.clientWidth);expect(actual.innerWidth).toBe(viewport.width);expect(actual.innerHeight).toBe(viewport.height);expect(actual.visualWidth).toBeCloseTo(viewport.width,0);expect(actual.visualHeight).toBeCloseTo(viewport.height,0);
}
async function enter(page,origin='http://127.0.0.1:4186'){
 await page.goto(origin+'/projects/xr-bending-active/');
 await page.waitForFunction(()=>['entered','failed'].includes(window.__site?.inspect().phase),null,{timeout:WAIT});
 expect(await page.evaluate(()=>window.__site.inspect().phase)).toBe('entered');
 await page.waitForFunction(()=>!!document.querySelector('[data-xr-stage]')?.__xrStage,null,{timeout:WAIT});
 await frames(page,2);await viewportFits(page);
}
function closed(state){
 for(const id of new Set(state.history.map(fact=>fact.id))){const own=state.history.filter(fact=>fact.id===id);expect(own.filter(fact=>fact.phase==='requested')).toHaveLength(1);expect(own.filter(fact=>['ready','failed','cancelled'].includes(fact.phase))).toHaveLength(1);}
 for(const id of new Set(state.scene.history.map(fact=>fact.id))){const own=state.scene.history.filter(fact=>fact.id===id);expect(own.filter(fact=>fact.status==='requested')).toHaveLength(1);expect(own.filter(fact=>['completed','cancelled'].includes(fact.status))).toHaveLength(1);}
}
async function settled(page,chapter){
  await page.waitForFunction(chapter=>{const state=document.querySelector('[data-xr-stage]')?.__xrStage?.inspect();return state?.chapter===chapter&&state.scene.chapter===chapter&&state.scene.mode===(['overview','making','credits'].includes(chapter)?'absent':'hold')&&state.scene.settled&&!state.scene.paintPending&&state.camera.settled&&state.informationWindows.settled&&!state.lifecycle.scheduled;},chapter,{timeout:WAIT});
 await frames(page,2);
}
async function scrollChapter(page,chapter){
 await page.locator(`[data-xr-chapter="${chapter}"]`).evaluate(node=>node.scrollIntoView({block:'start',behavior:'instant'}));
 await settled(page,chapter);
 await viewportFits(page);
}
async function modelReady(page,chapter='overview'){
 try{
  await page.waitForFunction(chapter=>{const state=document.querySelector('[data-xr-stage]')?.__xrStage?.inspect();return state?.phase==='failed'||!!state?.resource?.fallbackReason||state?.phase==='ready'&&state.chapter===chapter&&state.resource?.chapter===chapter&&state.resource.mode==='webgl-model'&&state.resource.successfulPaint;},chapter,{timeout:WAIT});
  const current=await facts(page);
  if(current.phase!=='ready'||current.chapter!==chapter||current.resource?.chapter!==chapter||current.resource?.mode!=='webgl-model'||!current.resource?.successfulPaint){
   await test.info().attach('xr-model-readiness-failure',{body:JSON.stringify({expectedChapter:chapter,observed:current},null,2),contentType:'application/json'});
   expect(current).toMatchObject({phase:'ready',chapter,resource:{chapter,mode:'webgl-model',successfulPaint:true}});
  }
 }catch(error){
  try{await test.info().attach('xr-model-readiness-diagnostics',{body:JSON.stringify({expectedChapter:chapter,observed:await facts(page)},null,2),contentType:'application/json'});}catch{/* Preserve the original failure if the test deadline already closed the page. */}
  throw error;
 }
 await settled(page,chapter);
}
async function phoneReady(page,id,{native=false}={}){
 await scrollChapter(page,id);
 await page.waitForFunction(({id,native})=>{const state=document.querySelector('[data-xr-stage]')?.__xrStage?.inspect(),r=state?.resource;return state?.phase==='ready'&&r?.chapter===id&&r.media.stage===id&&!r.media.pending&&r.media.native?.ready&&r.mode===(native?'native-video':'webgl-phone')&&(native||r.successfulPaint&&r.media.frames>2);},{id,native},{timeout:WAIT});
 await frames(page,2);
}
async function hitPoint(page){
 return page.evaluate(()=>{
  const host=document.querySelector('[data-xr-stage]'),aperture=document.querySelector('[data-xr-model-control]').getBoundingClientRect(),runtime=host.__xrStage;
  const left=Math.max(0,aperture.left),right=Math.min(innerWidth,aperture.right),top=Math.max(100,aperture.top),bottom=Math.min(innerHeight-85,aperture.bottom),candidates=[];
  for(let y=.05;y<1;y+=.1)for(let x=.05;x<1;x+=.1)candidates.push({x:left+(right-left)*x,y:top+(bottom-top)*y,distance:Math.hypot(x-.5,y-.5)});
  candidates.sort((a,b)=>a.distance-b.distance);
  for(const point of candidates){const under=document.elementFromPoint(point.x,point.y);if(!under||under.closest('a,button,input,select,textarea,summary,[data-protect],[data-information-window]'))continue;const hit=runtime.hitTest(point.x,point.y);if(hit?.source&&hit.kind==='model')return{x:point.x,y:point.y};}
  throw Error('No actual painted source hit inside the native model aperture: '+JSON.stringify({aperture,chapter:runtime.inspect().chapter,pose:runtime.inspect().resource?.pose}));
 });
}
async function nativeArrowScroll(page){
 await control(page).evaluate(node=>node.focus({preventScroll:true}));await frames(page,2);const before=await page.evaluate(()=>scrollY);
 await control(page).press('ArrowDown');await expect.poll(()=>page.evaluate(()=>scrollY)).toBeGreaterThan(before);
}

test('XR reuses Bending study-header, section-label and control-rail positions with native project navigation',async({page,isMobile})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 const chrome=()=>page.evaluate(()=>{
  const box=selector=>{const node=document.querySelector(selector),rect=node.getBoundingClientRect(),css=getComputedStyle(node);return{x:rect.x,y:rect.y,width:rect.width,height:rect.height,rightEdge:rect.right,bottomEdge:rect.bottom,font:css.fontFamily,size:css.fontSize,direction:css.flexDirection,position:css.position,top:css.top,right:css.right,bottom:css.bottom,padding:css.padding,background:css.background,borderRadius:css.borderRadius,backdrop:css.backdropFilter};};
  return{masthead:box('[data-page-masthead]'),identity:box('[data-liquid-glass="identity"]'),navigation:box('[data-page-masthead] nav'),rail:box('[data-liquid-glass="chapter-navigation"]'),reading:box('[data-liquid-glass="reading-controls"]')};
 });
 await page.goto('/projects/bending-active/');await page.waitForFunction(()=>window.__site?.inspect().phase==='entered',null,{timeout:WAIT});
 await page.locator('[data-liquid-glass="chapter-navigation"][data-liquid-ready]').waitFor();const bending=await chrome();
 await enter(page);await page.locator('[data-liquid-glass="chapter-navigation"][data-liquid-ready]').waitFor();const xr=await chrome();
 for(const key of ['masthead','identity','navigation'])expect(xr[key]).toEqual(bending[key]);
 for(const key of ['x','width','font','size','direction','position','right','padding','background','borderRadius','backdrop'])expect(xr.rail[key]).toEqual(bending.rail[key]);
 // Seven and eight links have different desktop heights. Compare the fixed
 // top anchor there; its auto bottom is derived from the content height.
 // The mobile rail uses the same fixed bottom anchor instead.
 expect(xr.rail[isMobile?'bottom':'top']).toEqual(bending.rail[isMobile?'bottom':'top']);
 expect(isMobile?xr.rail.bottomEdge:xr.rail.y).toEqual(isMobile?bending.rail.bottomEdge:bending.rail.y);
 if(!isMobile)for(const key of ['y','rightEdge','font','size','position','top','right','padding','background','borderRadius','backdrop'])expect(xr.reading[key]).toEqual(bending.reading[key]);
 await expect(page.locator('[data-liquid-glass]')).toHaveCount(3);await expect(page.locator('[data-xr-chapter-link]')).toHaveCount(8);
 for(const [label,href]of[['About','/about/'],['Project','/projects/'],['Contact','/contact/']])await expect(page.locator('[data-portfolio-navigation]').getByRole('link',{name:label,exact:true})).toHaveAttribute('href',href);
 await scrollChapter(page,'context');await contextVisible(page);await expect(page.locator('[data-xr-chapter-link="context"]')).toHaveAttribute('aria-current','location');
 const label=page.locator('#xr-context [data-project-section-label]');await expect(label).toContainText('01 / CONTEXT');await expect(label.locator('svg')).toHaveCount(1);
});

test('the complete workspace image owns Context readiness and a real image failure closes to readable static content',async({page})=>{
 let releaseImage,requestSeen,handler,deny=false;const requested=new Promise(resolve=>{requestSeen=resolve;});let waiting=false;
 const server=createServer((request,response)=>{
  if([workspace.image.src,workspace.image.mobile?.src].includes(request.url.split('?')[0])){
   if(deny){response.writeHead(404,{'Content-Type':'text/plain','Cache-Control':'no-store'}).end('Unavailable workspace');return;}
   waiting=true;requestSeen();releaseImage=()=>handler(request,response);return;
  }
  handler(request,response);
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const port=server.address().port;handler=createPagesPreviewHandler({root:fileURLToPath(new URL('../../.pages-workspace/out/',import.meta.url)),port});
 try{
  await page.goto(`http://127.0.0.1:${port}/projects/xr-bending-active/`,{waitUntil:'domcontentloaded'});await requested;
  await page.waitForFunction(()=>!!document.querySelector('[data-xr-stage]')?.__xrStage,null,{timeout:WAIT});
  await page.locator('[data-xr-chapter="context"]').evaluate(node=>node.scrollIntoView({block:'start',behavior:'instant'}));await frames(page,2);
  const pending=await facts(page);expect(pending.workspace.phase).toBe('loading');expect(pending.scene.mode).toBe('waiting');expect(pending.scene.settled).toBe(false);expect(await page.evaluate(()=>window.__site.inspect().phase)).toBe('requested');
  releaseImage();waiting=false;await page.waitForFunction(()=>window.__site?.inspect().phase==='entered',null,{timeout:WAIT});await settled(page,'context');await contextVisible(page);closed(await facts(page));
  deny=true;await page.goto(`http://127.0.0.1:${port}/projects/xr-bending-active/`);await page.waitForFunction(()=>window.__site?.inspect().phase==='failed',null,{timeout:WAIT});
  await page.waitForFunction(()=>document.querySelector('[data-xr-stage]')?.__xrStage?.inspect().workspace.phase==='failed',null,{timeout:WAIT});
  await scrollChapter(page,'context');const failed=await facts(page);expect(failed.workspace.reason).toMatch(/^workspace-/);expect(failed.scene.mode).toBe('hold');expect(failed.scene.settled).toBe(true);closed(failed);
  await expect(stage(page).locator('canvas')).toHaveCount(0);await expect(stage(page).locator('[data-xr-model-poster]')).toBeHidden();await expect(page.locator('#xr-context-heading')).toBeVisible();
  await expect(page.getByRole('link',{name:'← All projects',exact:true})).toHaveAttribute('href','/projects/');
 }finally{if(waiting)releaseImage?.();await page.goto('about:blank');server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
});

test('one project background stage preserves source geometry, stays idle, and follows finite entries and real hit-based inspection',async({page,isMobile,browserName})=>{
 const requests=[],errors=[];page.on('request',request=>{if(/\.(glb|hdr)(?:\?|$)/.test(request.url()))requests.push(request.url());});page.on('pageerror',error=>errors.push(error.message));
 await enter(page);await modelReady(page);await openingVisible(page);
 await expect(stage(page)).toHaveCSS('position','fixed');await expect(stage(page).locator('canvas')).toHaveCount(1);
 await expect(page.locator('canvas[data-global-background-field]')).toHaveCount(1);await expect(page.locator('canvas')).toHaveCount(2);
 const initial=await facts(page),source=initial.resource;closed(initial);
 expect(source.sourceRevision).toBe('82e9679c1e47e93cc1a7bbea588eb0f2c8af142d6f7facc6fe5ffaa6148fdc04');expect(source.vertices).toBe(96312);expect(source.triangles).toBe(190320);
 expect(source.sourceUnits).toBe('Millimeters');expect(source.webUnits).toBe('Metres');expect(source.sourceTransforms.every(value=>value.scale.every(n=>n===1))).toBe(true);
 expect(source.surface.sourceCalls).toBe(1);expect(source.surface.phoneCalls).toBe(0);expect(source.surface.phoneBodyCalls).toBe(0);expect(source.surface.phoneScreenCalls).toBe(0);expect(source.surface.stageCalls).toBeGreaterThan(0);
 expect(source.surface.calls).toBe(source.surface.sourceCalls+source.surface.phoneCalls+source.surface.stageCalls);expect(source.surface.clearAlpha).toBe(0);expect(source.surface.budget.budget.pixels).toBeLessThanOrEqual(524288);
 expect(source.surface.environment.edgeFeather.owner).toBe('xr-editorial-materials-only');expect(source.surface.environment.edgeFeather.cssPixels).toBe(isMobile?32:80);
 expect(source.surface.environment.edgeFeather.drawingBuffer).toEqual(await stage(page).locator('canvas').evaluate(node=>[node.width,node.height]));
 expect(source.pose.near).toBeGreaterThan(0);expect(source.pose.far).toBeGreaterThan(source.pose.near);expect(source.pose.slot.x-source.pose.slot.width/2).toBeGreaterThanOrEqual(0);expect(source.pose.slot.x+source.pose.slot.width/2).toBeLessThanOrEqual(1);
 const idle={frames:initial.frames,draws:source.surface.draws};await frames(page,8);const afterIdle=await facts(page);expect({frames:afterIdle.frames,draws:afterIdle.resource.surface.draws}).toEqual(idle);
 const passage=await stage(page).evaluateHandle(node=>{
  const samples=[];const observer=new MutationObserver(()=>{const scene=node.__xrStage.inspect().scene;if(['entry','exit'].includes(scene.mode)&&scene.opacity>0&&scene.opacity<1&&samples.length<256)samples.push({...scene});});
  observer.observe(node,{attributes:true,subtree:true,attributeFilter:['style','data-xr-scene-mode']});return{samples,dispose(){observer.disconnect();}};
 });
 await scrollChapter(page,'context');await modelReady(page,'context');await contextVisible(page);
 const chapterNav=await page.getByRole('navigation',{name:'XR project sections',exact:true}).boundingBox(),masthead=await page.locator('[data-portfolio-navigation]').boundingBox();
 await expect(page.getByRole('navigation',{name:'XR project sections',exact:true})).toHaveCSS('position','fixed');
 expect(chapterNav.y).toBeGreaterThan(masthead.y+masthead.height);expect(chapterNav.x).toBeGreaterThanOrEqual(0);expect(chapterNav.x+chapterNav.width).toBeLessThanOrEqual(page.viewportSize().width);
 if(isMobile){expect(chapterNav.height).toBeLessThan(60);expect(chapterNav.y).toBeGreaterThan(page.viewportSize().height*.8);await expect(page.getByRole('navigation',{name:'XR project sections',exact:true})).toHaveCSS('flex-direction','row');const targets=await page.locator('[data-xr-chapter-link]').evaluateAll(nodes=>nodes.map(node=>({width:node.getBoundingClientRect().width,height:node.getBoundingClientRect().height})));expect(targets.every(rect=>rect.width>=44&&rect.height>=44)).toBe(true);}
 else await expect(page.getByRole('navigation',{name:'XR project sections',exact:true})).toHaveCSS('flex-direction','column');
 await scrollChapter(page,'method');await modelReady(page,'method');await control(page).evaluate(node=>node.focus({preventScroll:true}));await control(page).press('ArrowRight');
 await settled(page,'method');await fullCanvas(page);
 const originalViewport=page.viewportSize();await page.setViewportSize({width:originalViewport.width-10,height:originalViewport.height-20});await settled(page,'method');await fullCanvas(page);
 await page.setViewportSize(originalViewport);await settled(page,'method');await fullCanvas(page);
 const transitions=await passage.evaluate(value=>value.samples);await passage.evaluate(value=>value.dispose());await passage.dispose();
 expect(transitions.some(sample=>sample.mode==='entry'&&sample.chapter==='context')).toBe(true);expect(transitions.some(sample=>sample.mode==='exit'&&sample.chapter==='context')).toBe(true);
 expect((await facts(page)).scene.mode).toBe('hold');
 await expect.poll(async()=>(await facts(page)).camera.value.azimuth).toBeLessThan(0);await settled(page,'method');expect((await facts(page)).resource.view.azimuth).toBeLessThan(0);
 await control(page).press('Home');await settled(page,'method');expect((await facts(page)).camera.value).toEqual({azimuth:0,elevation:0});
 const point=await hitPoint(page);
 if(isMobile&&browserName==='chromium'){
  const cdp=await page.context().newCDPSession(page);let touching=false;
  try{
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[point]});touching=true;
   for(const dx of [18,36,60])await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:point.x+dx,y:point.y}]});
   await expect.poll(async()=>(await facts(page)).gesture?.locked).toBe(true);expect(await control(page).evaluate(node=>node.hasPointerCapture(document.querySelector('[data-xr-stage]').__xrStage.inspect().gesture.pointerId))).toBe(true);await expect.poll(async()=>(await facts(page)).camera.value.azimuth).toBeLessThan(0);
   await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});touching=false;await settled(page,'method');expect((await facts(page)).gesture).toBeNull();expect((await facts(page)).camera.value).toEqual({azimuth:0,elevation:0});
   const vertical=await hitPoint(page),before=await page.evaluate(()=>scrollY);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[vertical]});touching=true;
   for(const dy of [30,60,100,150])await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:vertical.x,y:vertical.y-dy}]});
   await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});touching=false;await expect.poll(()=>page.evaluate(()=>scrollY)).toBeGreaterThan(before+30);
  }finally{if(touching)await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});await cdp.detach();}
 }else{
  await page.mouse.move(point.x,point.y);await page.mouse.down();await page.mouse.move(point.x+70,point.y+10,{steps:5});
  await expect.poll(async()=>(await facts(page)).gesture?.locked).toBe(true);expect(await control(page).evaluate(node=>node.hasPointerCapture(document.querySelector('[data-xr-stage]').__xrStage.inspect().gesture.pointerId))).toBe(true);await expect.poll(async()=>(await facts(page)).camera.value.azimuth).toBeLessThan(0);
  await page.mouse.up();await settled(page,'method');expect((await facts(page)).camera.value).toEqual({azimuth:0,elevation:0});
 }
 const final=await facts(page);expect(final.gesture).toBeNull();for(const id of new Set(final.gestures.map(item=>item.id))){const own=final.gestures.filter(item=>item.id===id);expect(own.filter(item=>item.phase==='requested')).toHaveLength(1);expect(own.filter(item=>['released','cancelled'].includes(item.phase))).toHaveLength(1);}
 await scrollChapter(page,'overview');await modelReady(page);await openingVisible(page);closed(await facts(page));
 expect(final.acquisitions).toBe(1);expect(requests).toEqual([expect.stringContaining('/assets/xr/xr-research-assembly.glb')]);expect(errors).toEqual([]);
});

test('native scrolling selects all three complete recordings in the same scene and pause preserves native media time',async({page})=>{
 const errors=[];page.on('pageerror',error=>errors.push(error.message));await enter(page);await modelReady(page);
 const originalCanvas=await stage(page).locator('canvas').elementHandle();
 // Keep the same retained canvas and native screenshot action. Batch related
 // observations at one instant instead of resolving the same locator for each
 // assertion while the recording and the real scene clock continue to run.
 const decodedFrames=()=>page.evaluate(()=>{
  const hosts=document.querySelectorAll('[data-xr-stage]');if(hosts.length!==1)throw Error('Expected exactly one XR stage');
  return hosts[0].__xrStage.inspect().resource.media.frames;
 });
 const frameSample=count=>originalCanvas.evaluate(async(_canvas,count)=>{
  for(let index=0;index<count;index++)await new Promise(requestAnimationFrame);
  const hosts=document.querySelectorAll('[data-xr-stage]');if(hosts.length!==1)throw Error('Expected exactly one XR stage');
  return hosts[0].__xrStage.inspect();
 },count);
  let continuity;
  try{
 await expect(page.locator('[data-phone-stage],[data-phone-front-toggle]')).toHaveCount(0);
 for(const [id,duration]of[['adapt',13],['assemble',24.96],['join',20.3]]){
  await phoneReady(page,id);
  const sample=await originalCanvas.evaluate((canvas,id)=>{
   const hosts=document.querySelectorAll('[data-xr-stage]');if(hosts.length!==1)throw Error('Expected exactly one XR stage');
   const host=hosts[0],videos=host.querySelectorAll(`[data-xr-stage-video="${id}"]`);if(videos.length!==1)throw Error('Expected exactly one selected recording');
   const recording=videos[0];return{state:host.__xrStage.inspect(),canvasCount:host.querySelectorAll('canvas').length,videoSources:host.querySelectorAll('video[src]').length,
    originalCanvas:canvas.isConnected&&canvas===host.querySelector('canvas'),nativePlaying:recording.muted&&recording.loop&&recording.playsInline&&!recording.paused,duration:recording.duration,
    canvasBox:canvas.getBoundingClientRect().toJSON(),viewport:{width:innerWidth,height:innerHeight}};
  },id);
  const {state}=sample;closed(state);expect(state.acquisitions).toBe(1);expect(state.resource.media.reason).toBeNull();expect(state.resource.fallbackReason).toBeNull();
  expect(sample.canvasCount).toBe(1);expect(sample.videoSources).toBe(1);expect(sample.originalCanvas).toBe(true);
  expect(sample.canvasBox.x).toBeCloseTo(0,0);expect(sample.canvasBox.y).toBeCloseTo(0,0);expect(sample.canvasBox.width).toBeCloseTo(sample.viewport.width,0);expect(sample.canvasBox.height).toBeCloseTo(sample.viewport.height,0);
  expect({left:state.resource.surface.viewport.left,top:state.resource.surface.viewport.top,width:state.resource.surface.viewport.width,height:state.resource.surface.viewport.height}).toEqual({left:0,top:0,...sample.viewport});
  expect(state.resource.surface.budget.budget.pixels).toBeLessThanOrEqual(393216);expect(sample.nativePlaying).toBe(true);expect(sample.duration).toBeCloseTo(duration,2);
  const draw=state.resource.surface;expect(draw.sourceCalls).toBe(0);expect(draw.phoneBodyCalls).toBe(1);expect(draw.phoneScreenCalls).toBe(1);expect(draw.phoneCalls).toBe(2);expect(draw.stageCalls).toBeGreaterThan(0);expect(draw.calls).toBe(draw.sourceCalls+draw.phoneCalls+draw.stageCalls);
  const first=await originalCanvas.screenshot(),count=await decodedFrames();
  await expect.poll(decodedFrames).toBeGreaterThan(count+2);expect((await originalCanvas.screenshot()).equals(first)).toBe(false);
   if(id==='adapt')continuity=await stage(page).evaluateHandle(host=>{
    let running=true,raf;const samples=[];
    const read=()=>{if(!running)return;const s=host.__xrStage.inspect(),canvas=host.querySelector('canvas');samples.push({chapter:s.chapter,mode:s.scene.mode,opacity:s.scene.opacity,cssOpacity:Number(getComputedStyle(host.querySelector('[data-xr-scene-surface]')).opacity),painted:s.resource?.successfulPaint,rendering:s.resource?.mode,phoneCalls:s.resource?.surface?.phoneCalls,connected:!!canvas?.isConnected});raf=requestAnimationFrame(read);};read();
    return{samples,dispose(){running=false;cancelAnimationFrame(raf);}};
   });
 }
  const continuous=await continuity.evaluate(value=>value.samples);expect(continuous.length).toBeGreaterThan(2);
  expect(continuous.some(value=>value.chapter==='assemble')).toBe(true);expect(continuous.some(value=>value.chapter==='join')).toBe(true);
  for(const value of continuous){expect(value.opacity).toBe(1);expect(value.cssOpacity).toBe(1);expect(value.painted).toBe(true);expect(value.rendering).toBe('webgl-phone');expect(value.phoneCalls).toBe(2);expect(value.connected).toBe(true);expect(['entry','exit']).not.toContain(value.mode);}
  await test.info().attach('continuous-native-phone-passages',{body:JSON.stringify(continuous),contentType:'application/json'});
  }finally{if(continuity){await continuity.evaluate(value=>value.dispose());await continuity.dispose();}}
 const url=page.url();await page.getByRole('button',{name:'Pause recording',exact:true}).click();
 await expect.poll(()=>originalCanvas.evaluate(()=>{
  const hosts=document.querySelectorAll('[data-xr-stage]');if(hosts.length!==1)throw Error('Expected exactly one XR stage');
  const videos=hosts[0].querySelectorAll('[data-xr-stage-video="join"]');if(videos.length!==1)throw Error('Expected exactly one Join recording');return videos[0].paused;
 })).toBe(true);await settled(page,'join');const frozen=await frameSample(0),still=await frameSample(8);
 expect(still.resource.media.position).toBe(frozen.resource.media.position);expect(still.resource.media.frames).toBe(frozen.resource.media.frames);expect(still.resource.surface.draws).toBe(frozen.resource.surface.draws);
 const resume=await originalCanvas.evaluateHandle(()=>{
  const hosts=document.querySelectorAll('[data-xr-stage]');if(hosts.length!==1)throw Error('Expected exactly one XR stage');
  const videos=hosts[0].querySelectorAll('[data-xr-stage-video="join"]');if(videos.length!==1)throw Error('Expected exactly one Join recording');
  const node=videos[0],events=[];const record=event=>events.push({time:node.currentTime,trusted:event.isTrusted,duration:node.duration});node.addEventListener('play',record,{once:true});return{events,dispose(){node.removeEventListener('play',record);}};
 });
 try{
  await page.getByRole('button',{name:'Play recording',exact:true}).click();let played;
  await expect.poll(async()=>{const events=await resume.evaluate(value=>value.events);if(events.length===1)played=events[0];return events.length;}).toBe(1);
  const delta=Math.abs(played.time-frozen.resource.media.position);
  expect(played.trusted).toBe(true);expect(Math.min(delta,Math.abs(played.duration-delta))).toBeLessThan(.3);await expect.poll(decodedFrames).toBeGreaterThan(frozen.resource.media.frames);expect(page.url()).toBe(url);
 }finally{await resume.evaluate(value=>value.dispose());await resume.dispose();}
 const controls=await originalCanvas.evaluate(()=>{const nodes=document.querySelectorAll('[data-xr-scene-controls]');if(nodes.length!==1)throw Error('Expected exactly one XR scene control group');const node=nodes[0];return{rect:node.getBoundingClientRect().toJSON(),buttons:[...node.querySelectorAll('button')].map(button=>button.getBoundingClientRect().toJSON())};}),viewport=page.viewportSize();
 expect(controls.rect.left).toBeGreaterThanOrEqual(0);expect(controls.rect.top).toBeGreaterThanOrEqual(0);expect(controls.rect.right).toBeLessThanOrEqual(viewport.width);expect(controls.rect.bottom).toBeLessThanOrEqual(viewport.height);expect(controls.buttons.every(rect=>rect.width>=44&&rect.height>=44)).toBe(true);
 await scrollChapter(page,'overview');await modelReady(page);await openingVisible(page);
 const returned=await originalCanvas.evaluate(()=>{const hosts=document.querySelectorAll('[data-xr-stage]');if(hosts.length!==1)throw Error('Expected exactly one XR stage');return{state:hosts[0].__xrStage.inspect(),videoSources:hosts[0].querySelectorAll('video[src]').length};});
 expect(returned.videoSources).toBe(0);expect(returned.state.resource.media.stage).toBeNull();expect(returned.state.acquisitions).toBe(1);expect(errors).toEqual([]);
  for(const chapter of ['making','credits']){
   await scrollChapter(page,chapter);const state=await facts(page);expect(state.scene).toMatchObject({chapter,mode:'absent',visible:false,opacity:0});
   await expect(stage(page).locator('[data-xr-scene-surface]')).toHaveCSS('opacity','0');await expect(stage(page).locator('[data-xr-scene-surface]')).toHaveCSS('pointer-events','none');
   await expect(stage(page).locator('[data-xr-model-poster]')).toBeHidden();await expect(page.locator('[data-xr-scene-controls]')).toBeHidden();await expect(stage(page).locator('video[src]')).toHaveCount(0);
  }
});

test('a genuinely delayed recording preserves its paused native frame through a pending reverse and atomic replacement',async({page})=>{
 let release;const held=new Promise(resolve=>{release=resolve;});let waiting=false;
 await page.route('**/assets/xr/assemble-interface.mp4',async route=>{waiting=true;await held;await route.continue();});
 let continuity;
 const nativeFrame=()=>video(page,'adapt').evaluate(async node=>{
  if(node.readyState<2||!node.videoWidth||!node.videoHeight)throw Error('Retained native frame is unavailable');
  const sample=document.createElement('canvas');sample.width=node.videoWidth;sample.height=node.videoHeight;
  const context=sample.getContext('2d');context.drawImage(node,0,0);const pixels=context.getImageData(0,0,sample.width,sample.height).data;
  let min=255,max=0,alphaMin=255,alphaMax=0;
  for(let index=0;index<pixels.length;index+=4){min=Math.min(min,pixels[index],pixels[index+1],pixels[index+2]);max=Math.max(max,pixels[index],pixels[index+1],pixels[index+2]);alphaMin=Math.min(alphaMin,pixels[index+3]);alphaMax=Math.max(alphaMax,pixels[index+3]);}
  const sha256=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',pixels)),value=>value.toString(16).padStart(2,'0')).join('');
  const wrapper=node.closest('[data-xr-native-phone]'),css=getComputedStyle(wrapper);
  return{sha256,width:sample.width,height:sample.height,contrast:max-min,alphaMin,alphaMax,position:node.currentTime,decodedFrames:node.getVideoPlaybackQuality().totalVideoFrames,paused:node.paused,readyState:node.readyState,currentSrc:node.currentSrc,wrapper:{hidden:wrapper.hidden,display:css.display,opacity:css.opacity,textureSource:wrapper.dataset.videoTextureSource??null}};
 });
 const frameIdentity=({sha256,width,height,contrast,alphaMin,alphaMax,position,decodedFrames,paused})=>({sha256,width,height,contrast,alphaMin,alphaMax,position,decodedFrames,paused});
 try{
  await enter(page);await phoneReady(page,'adapt');const canvas=stage(page).locator('canvas'),original=await canvas.elementHandle();
  const active=await nativeFrame();
  await test.info().attach('active-native-frame-facts',{body:JSON.stringify(active),contentType:'application/json'});
  await test.info().attach('active-phone-composition',{body:await canvas.screenshot(),contentType:'image/png'});
  continuity=await stage(page).evaluateHandle(host=>{
   let running=true,raf;const samples=[];
   const read=()=>{if(!running)return;const s=host.__xrStage.inspect();samples.push({chapter:s.chapter,mode:s.scene.mode,opacity:s.scene.opacity,cssOpacity:Number(getComputedStyle(host.querySelector('[data-xr-scene-surface]')).opacity),painted:s.resource?.successfulPaint,phoneCalls:s.resource?.surface?.phoneCalls});raf=requestAnimationFrame(read);};read();
   return{samples,dispose(){running=false;cancelAnimationFrame(raf);}};
  });
  await page.locator('[data-xr-chapter="assemble"]').evaluate(node=>node.scrollIntoView({block:'start',behavior:'instant'}));
  await expect.poll(()=>waiting).toBe(true);
  await page.waitForFunction(()=>{const s=document.querySelector('[data-xr-stage]').__xrStage.inspect();return s.chapter==='assemble'&&s.scene.mode==='waiting'&&s.resource.media.pending;},null,{timeout:WAIT});
  await expect(video(page,'adapt')).toHaveAttribute('src',/adapt-interface\.mp4$/);expect(await video(page,'adapt').evaluate(node=>node.paused)).toBe(true);
  // The transparent WebGL surface is composited with moving native reading
  // and Layer 1. Compare the retained decoded source pixels directly instead
  // of treating a screenshot of that whole composition as a paused frame.
  const frozen=await nativeFrame();await frames(page,8);const retained=await nativeFrame();
  await test.info().attach('retained-native-frame-facts',{body:JSON.stringify({active,frozen,retained}),contentType:'application/json'});
  await test.info().attach('pending-phone-composition',{body:await canvas.screenshot(),contentType:'image/png'});
  // Buffer readiness and React's chapter attributes are diagnostic facts;
  // pixel identity, media time and pause are the actual frozen-frame contract.
  expect(active.contrast).toBeGreaterThan(32);expect(frozen.contrast).toBeGreaterThan(32);expect(frameIdentity(retained)).toEqual(frameIdentity(frozen));expect(retained.contrast).toBeGreaterThan(32);expect(retained.paused).toBe(true);
  for(const sample of [active,frozen,retained]){expect(sample.wrapper.textureSource).toBe('true');expect(sample.wrapper.display).not.toBe('none');}
  const pending=await facts(page);expect(pending.scene.opacity).toBe(1);expect(pending.resource.successfulPaint).toBe(true);expect(pending.resource.mode).toBe('webgl-phone');expect(pending.resource.surface.phoneCalls).toBe(2);
  await expect(video(page,'adapt')).toHaveAttribute('src',/adapt-interface\.mp4$/);expect(await video(page,'adapt').evaluate(node=>node.paused)).toBe(true);
  // Reverse while the target HTTP response is still held. The retained video
  // must become the current owner again; a superseded handle cannot clear it.
  await phoneReady(page,'adapt');await expect(video(page,'adapt')).toHaveAttribute('src',/adapt-interface\.mp4$/);
  expect(await original.evaluate(node=>node===document.querySelector('[data-xr-stage] canvas'))).toBe(true);
  await expect(stage(page).locator('video[src]')).toHaveCount(1);
  const restoredTime=await video(page,'adapt').evaluate(node=>node.currentTime);
  await expect.poll(()=>video(page,'adapt').evaluate((node,before)=>Math.abs(node.currentTime-before),restoredTime)).toBeGreaterThan(.03);
  const restored=await facts(page);expect(restored.scene.opacity).toBe(1);expect(restored.resource.mode).toBe('webgl-phone');expect(restored.resource.media).toMatchObject({stage:'adapt',pending:false,reason:null});
  await test.info().attach('pending-reverse-restored-source',{body:JSON.stringify(restored),contentType:'application/json'});
  release();await frames(page,8);expect((await facts(page)).chapter).toBe('adapt');await expect(video(page,'adapt')).toHaveAttribute('src',/adapt-interface\.mp4$/);
  await phoneReady(page,'assemble');expect(await original.evaluate(node=>node===document.querySelector('[data-xr-stage] canvas'))).toBe(true);
  await expect(video(page,'adapt')).not.toHaveAttribute('src');await expect(stage(page).locator('video[src]')).toHaveCount(1);
  const before=await video(page,'assemble').evaluate(node=>node.currentTime);await expect.poll(()=>video(page,'assemble').evaluate(node=>node.currentTime)).toBeGreaterThan(before);closed(await facts(page));
  const samples=await continuity.evaluate(value=>value.samples);expect(samples.some(sample=>sample.chapter==='assemble')).toBe(true);
  for(const sample of samples){expect(sample).toMatchObject({opacity:1,cssOpacity:1,painted:true,phoneCalls:2});expect(['entry','exit']).not.toContain(sample.mode);}
  await test.info().attach('continuous-pending-reverse-phone',{body:JSON.stringify(samples),contentType:'application/json'});
 }finally{
  try{if(continuity){try{await continuity.evaluate(value=>value.dispose());}finally{await continuity.dispose();}}}
  finally{release();await page.unrouteAll({behavior:'wait'});}
 }
});

test('Reduced Motion preserves the selected source posters, native reading and recording links and cancels an active enhancement',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});const requests=[];page.on('request',request=>{if(/\.(glb|mp4)(?:\?|$)/.test(request.url()))requests.push(request.url());});
 await enter(page);await openingVisible(page);await expect(stage(page).locator('canvas')).toHaveCount(0);
 await scrollChapter(page,'method');await expect(stage(page).locator('[data-xr-model-poster]')).toBeVisible();await nativeArrowScroll(page);
 for(const id of ['adapt','assemble','join']){await scrollChapter(page,id);await expect(stage(page).locator(`[data-xr-native-phone="${id}"] img`)).toBeVisible();await expect(page.locator(`[data-xr-recording="${id}"] a[href="/assets/xr/${id}-interface.mp4"]`)).toBeVisible();}
 expect(requests).toEqual([]);await expect(stage(page).locator('video[src]')).toHaveCount(0);
 await page.emulateMedia({reducedMotion:'no-preference'});await phoneReady(page,'join');await page.emulateMedia({reducedMotion:'reduce'});
 await expect(stage(page).locator('canvas')).toHaveCount(0);await expect(stage(page).locator('video[src]')).toHaveCount(0);await expect(stage(page).locator('[data-xr-native-phone="join"] img')).toBeVisible();
 const state=await facts(page);expect(state.resource).toBeNull();expect(state.disposals).toBe(state.acquisitions);closed(state);
});

test('unavailable WebGL and genuine context loss retain native recording playback and model fallback keeps reading keys native',async({page,browser})=>{
 await page.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return /^webgl/.test(type)?null:original.call(this,type,...args);};});
 const errors=[];page.on('pageerror',error=>errors.push(error.message));await enter(page);
 await expect.poll(async()=>(await facts(page)).phase).toBe('ready');expect((await facts(page)).resource.mode).toBe('poster');await expect(stage(page).locator('canvas')).toHaveCount(0);await openingVisible(page);
 await phoneReady(page,'adapt',{native:true});const before=await video(page,'adapt').evaluate(node=>node.currentTime);await expect.poll(()=>video(page,'adapt').evaluate(node=>node.currentTime)).toBeGreaterThan(before);
 await scrollChapter(page,'method');expect((await facts(page)).resource.mode).toBe('poster');await nativeArrowScroll(page);expect(errors).toEqual([]);
 // A fresh actual document obtains an unmodified native GPU context.
 const context=await browser.newContext({viewport:page.viewportSize()??{width:1440,height:1000}});
 try{
  const native=await context.newPage();native.on('pageerror',error=>errors.push(error.message));await enter(native);await phoneReady(native,'adapt');
  const lost=await stage(native).locator('canvas').evaluate(canvas=>{const extension=canvas.getContext('webgl2').getExtension('WEBGL_lose_context');if(!extension)return false;extension.loseContext();return true;});expect(lost).toBe(true);
  await expect.poll(async()=>(await facts(native)).resource.mode).toBe('native-video');expect((await facts(native)).resource.fallbackReason).toBe('context-lost');await expect(stage(native).locator('canvas')).toHaveCount(0);
  const position=await video(native,'adapt').evaluate(node=>node.currentTime);await expect.poll(()=>video(native,'adapt').evaluate(node=>node.currentTime)).toBeGreaterThan(position);closed(await facts(native));
  await scrollChapter(native,'method');expect((await facts(native)).resource.mode).toBe('poster');await expect(stage(native).locator('video[src]')).toHaveCount(0);await expect(stage(native).locator('[data-xr-model-poster]')).toBeVisible();await nativeArrowScroll(native);
 }finally{await context.close();}expect(errors).toEqual([]);
});

test('actual HTTP model and recording failures remain readable, do not retry themselves and preserve native project navigation',async({page})=>{
 const denied={model:0,media:0};let denyModel=true,handler;
 const server=createServer((request,response)=>{const pathname=request.url.split('?')[0],kind=pathname==='/assets/xr/xr-research-assembly.glb'&&denyModel?'model':pathname==='/assets/xr/adapt-interface.mp4'?'media':null;if(kind){denied[kind]++;response.writeHead(404,{'Content-Type':'text/plain','Cache-Control':'no-store'}).end('Unavailable test source');return;}handler(request,response);});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const port=server.address().port;handler=createPagesPreviewHandler({root:fileURLToPath(new URL('../../.pages-workspace/out/',import.meta.url)),port});
 try{
  await enter(page,`http://127.0.0.1:${port}`);await expect(stage(page)).toHaveAttribute('data-research-phase','failed',{timeout:WAIT});await openingVisible(page);closed(await facts(page));const modelCount=denied.model;expect(modelCount).toBeGreaterThan(0);await frames(page,8);expect(denied.model).toBe(modelCount);
  denyModel=false;await enter(page,`http://127.0.0.1:${port}`);await modelReady(page);await scrollChapter(page,'adapt');
  await expect.poll(async()=>{const r=(await facts(page)).resource;return r?.media.stage==='adapt'&&!r.media.pending&&r.mode==='poster'&&!!r.media.reason;}).toBe(true);
  await expect(stage(page).locator('[data-xr-native-phone="adapt"] img')).toBeVisible();await expect(stage(page).locator('video[src]')).toHaveCount(0);closed(await facts(page));const mediaCount=denied.media;expect(mediaCount).toBeGreaterThan(0);await frames(page,8);expect(denied.media).toBe(mediaCount);
  await expect(page.locator('#xr-adapt a[href="/assets/xr/adapt-interface.mp4"]')).toBeVisible();await scrollChapter(page,'overview');await modelReady(page);await page.getByRole('link',{name:'← All projects',exact:true}).click();
  await page.waitForFunction(()=>window.__site?.inspect().phase==='entered',null,{timeout:WAIT});await expect(page.locator('[data-project-card]')).toHaveCount(studies.length+2);
  await frames(page,2);await page.waitForFunction(()=>{const node=document.querySelector('[data-project-model-preview]');if(!node)return true;const state=node.__projectModelPreview?.inspect();return state&&!state.pending;},null,{timeout:WAIT});
 }finally{await page.goto('about:blank');server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
});

test('the XR project tile centres both complete source phones inside a measured glass inset',async({page},testInfo)=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/projects/');await page.waitForFunction(()=>window.__site?.inspect().phase==='entered',null,{timeout:WAIT});
 const tile=page.locator('[data-project-tile="xr-bending-active"]');await tile.scrollIntoViewIfNeeded();await tile.locator('img').evaluate(node=>node.decode());
 const projection=await tile.evaluate(tile=>{
  const image=tile.querySelector('img'),clip=image.parentElement,css=getComputedStyle(image),tileCSS=getComputedStyle(tile),clipCSS=getComputedStyle(clip),box=clip.getBoundingClientRect(),outer=tile.getBoundingClientRect();
  if(image.offsetParent!==clip)throw Error('Unexpected image offset owner');
  const w=parseFloat(css.width),h=parseFloat(css.height),nw=image.naturalWidth,nh=image.naturalHeight,fit=css.objectFit;
  let sx=w/nw,sy=h/nh;if(fit==='cover'||fit==='contain'||fit==='scale-down'){const scale=fit==='cover'?Math.max(sx,sy):Math.min(sx,sy,...(fit==='scale-down'?[1]:[]));sx=sy=scale;}else if(fit==='none')sx=sy=1;
  const [ox,oy]=css.objectPosition.split(' ').map((value,index)=>value.endsWith('%')?(index?h-nh*sy:w-nw*sx)*parseFloat(value)/100:parseFloat(value));
  const [originX,originY]=css.transformOrigin.split(' ').map(parseFloat),matrix=new DOMMatrix(css.transform);
  const project=(x,y)=>{const p=matrix.transformPoint(new DOMPoint(x*sx+ox-originX,y*sy+oy-originY));return{x:box.left+image.offsetLeft+originX+p.x,y:box.top+image.offsetTop+originY+p.y};};
  const corners=[[742,390],[1262,390],[1262,906],[742,906]].map(([x,y])=>project(x,y)),center=project(1002,648),radius=parseFloat(clipCSS.borderRadius)||0;
  const inside=point=>{const x=Math.max(box.left+radius,Math.min(box.right-radius,point.x)),y=Math.max(box.top+radius,Math.min(box.bottom-radius,point.y));return point.x>=box.left&&point.x<=box.right&&point.y>=box.top&&point.y<=box.bottom&&Math.hypot(point.x-x,point.y-y)<=radius;};
  return{source:image.getAttribute('src'),natural:{width:nw,height:nh},box:box.toJSON(),outer:outer.toJSON(),fit,scale:{x:sx,y:sy},matrix:[matrix.a,matrix.b,matrix.c,matrix.d,matrix.e,matrix.f],corners,center,centerError:Math.hypot(center.x-(box.left+box.width/2),center.y-(box.top+box.height/2)),allSourcePhoneCornersInside:corners.every(inside),rim:[box.left-outer.left-parseFloat(tileCSS.borderLeftWidth),outer.right-box.right-parseFloat(tileCSS.borderRightWidth),box.top-outer.top-parseFloat(tileCSS.borderTopWidth),outer.bottom-box.bottom-parseFloat(tileCSS.borderBottomWidth)],clipBackdrop:clipCSS.backdropFilter,clipBackground:clipCSS.backgroundColor};
 });
 await testInfo.attach('xr-source-phone-projection',{body:JSON.stringify(projection,null,2),contentType:'application/json'});
 expect(projection.source).toBe('/assets/xr/portfolio-main-visual.webp');expect(projection.natural).toEqual({width:2000,height:1125});expect(projection.scale.x).toBeCloseTo(projection.scale.y,8);expect(projection.matrix[0]).toBeCloseTo(projection.matrix[3],8);expect(projection.matrix[1]).toBe(0);expect(projection.matrix[2]).toBe(0);
 expect(projection.allSourcePhoneCornersInside).toBe(true);expect(projection.centerError).toBeLessThan(.6);for(const inset of projection.rim){expect(inset).toBeGreaterThanOrEqual(7.9);expect(inset).toBeLessThanOrEqual(12.1);}expect(projection.clipBackdrop).toBe('none');
});
