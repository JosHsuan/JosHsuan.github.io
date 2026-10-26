import {test,expect} from '@playwright/test';
import {createServer} from 'node:http';
import {fileURLToPath} from 'node:url';
import {readFile,writeFile} from 'node:fs/promises';
import {createPagesPreviewHandler} from '../../scripts/serve-pages.mjs';
import {WAIT,frames} from './case-helpers.mjs';

const stage=page=>page.locator('[data-xr-stage]');
const control=page=>page.locator('[data-xr-model-control]');
const video=(page,id)=>stage(page).locator(`[data-xr-stage-video="${id}"]`);
const facts=page=>stage(page).evaluate(node=>node.__xrStage.inspect());
const workspace=JSON.parse(await readFile(new URL('../../roles/uiux-designer/cases/bending-active-thesis/release/xr-workspace.json',import.meta.url),'utf8'));
const studies=JSON.parse(await readFile(new URL('../../roles/uiux-designer/cases/bending-active-thesis/release/project-studies.json',import.meta.url),'utf8')).projects;
const phoneDiagnostics=new WeakMap();
async function observePhoneLifecycle(page){
 // Test-only, bounded event receipts survive an unresponsive page. No polling,
 // playback changes, extra animation clock, recovery or timeout extension.
 const entries=[],prefix='xr-phone-lifecycle:',browser=page.context().browser();
 const push=value=>{if(entries.length<50)entries.push(value);};
 const consoleEntry=message=>{const value=message.text();if(value.startsWith(prefix)){try{push(JSON.parse(value.slice(prefix.length)));}catch{/* Keep the original application/test failure. */}}};
 const crashed=()=>push({event:'page-crash',hostTime:Date.now()});
 const disconnected=()=>push({event:'browser-disconnected',hostTime:Date.now()});
 page.on('console',consoleEntry);page.on('crash',crashed);browser?.on('disconnected',disconnected);
 phoneDiagnostics.set(page,{entries,dispose(){page.off('console',consoleEntry);page.off('crash',crashed);browser?.off('disconnected',disconnected);}});
 await page.addInitScript(({prefix})=>{
  let count=0;
  const record=event=>{
   const video=event.target;if(!video?.matches?.('[data-xr-stage-video]')||count>=48)return;count++;
   try{
    const state=document.querySelector('[data-xr-stage]')?.__xrStage?.inspect();
    console.debug(prefix+JSON.stringify({event:event.type,at:performance.now(),source:video.dataset.xrStageVideo,
     native:{readyState:video.readyState,networkState:video.networkState,paused:video.paused,seeking:video.seeking,time:video.currentTime,error:video.error?.code??null},
     owner:state?{phase:state.phase,chapter:state.chapter,scene:state.scene?.mode,sceneSettled:state.scene?.settled,paintPending:state.scene?.paintPending,cameraSettled:state.camera?.settled,windowsSettled:state.informationWindows?.settled,scheduled:state.lifecycle?.scheduled,
      rendering:state.resource?.mode,mediaStage:state.resource?.media?.stage,mediaPending:state.resource?.media?.pending,mediaFrames:state.resource?.media?.frames,fallback:state.resource?.fallbackReason,lastRenderFailure:state.resource?.lastRenderFailure}:null}));
   }catch{/* Diagnostics never alter the page's native event delivery. */}
  };
  for(const name of ['loadstart','loadedmetadata','loadeddata','canplay','play','playing','waiting','stalled','error','pause','seeking','seeked'])document.addEventListener(name,record,true);
 },{prefix});
}
test.afterEach(async({page},info)=>{
 const receipt=phoneDiagnostics.get(page);if(!receipt)return;
 receipt.dispose();phoneDiagnostics.delete(page);
 try{await info.attach('xr-phone-lifecycle',{body:JSON.stringify(receipt.entries,null,2),contentType:'application/json'});}catch{/* Diagnostic attachment cannot replace the original test outcome. */}
});
async function openingVisible(page){
 await expect(stage(page)).toHaveAttribute('data-xr-opening','true');
 await expect(stage(page).locator('[data-xr-opening-visual]')).toHaveCount(0);
 await expect(page.locator('[data-xr-hero]')).toHaveCount(0);
 await expect(stage(page).locator('[data-xr-workspace-visual]')).toBeHidden();
 await expect(stage(page).locator('canvas')).toBeHidden();await expect(stage(page).locator('[data-xr-model-poster]')).toBeHidden();
 await expect(page.locator('[data-xr-scene-controls]')).toHaveCount(0);
}
async function contextVisible(page){
 const visual=stage(page).locator('[data-xr-workspace-visual]');await expect(visual).toBeVisible();
 const source=await visual.evaluate(node=>({ready:node.complete&&node.naturalWidth>0&&node.naturalHeight>0,source:new URL(node.currentSrc).pathname,width:node.naturalWidth,height:node.naturalHeight,fit:getComputedStyle(node).objectFit,box:node.getBoundingClientRect().toJSON()})),viewport=page.viewportSize(),expected=viewport.width<800?workspace.image.mobile??workspace.image:workspace.image;
 expect(source.ready).toBe(true);expect(source.source).toBe(expected.src);expect(source.width).toBe(expected.width);expect(source.height).toBe(expected.height);expect(source.source).not.toBe('/assets/xr/portfolio-main-visual.webp');expect(source.source).not.toBe('/assets/xr/research-assembly-poster.webp');expect(source.fit).toBe('contain');
 expect(source.box.x).toBeCloseTo(0,0);expect(source.box.y).toBeCloseTo(0,0);expect(source.box.width).toBeCloseTo(viewport.width,0);expect(source.box.height).toBeCloseTo(viewport.height,0);
 await expect(stage(page).locator('canvas')).toBeHidden();await expect(stage(page).locator('[data-xr-model-poster]')).toBeHidden();await expect(page.locator('[data-xr-scene-controls]')).toHaveCount(0);
 expect((await facts(page)).workspace.phase).toBe('ready');
}
async function fullCanvas(page){
 await expect(stage(page).locator('canvas')).toHaveCount(1);
 // One synchronous snapshot keeps the continuously changing compositor receipt,
 // computed transform and actual DOM bounds on the same animation frame.
 const sample=await stage(page).evaluate(node=>{
  const canvas=node.querySelector('canvas'),surface=node.querySelector('[data-xr-scene-surface]'),css=getComputedStyle(canvas),surfaceBox=surface.getBoundingClientRect();
  const width=parseFloat(css.width),height=parseFloat(css.height),origin=css.transformOrigin.split(' ').map(Number.parseFloat),matrix=new DOMMatrix(css.transform==='none'?undefined:css.transform);
  const corners=[[0,0],[width,0],[0,height],[width,height]].map(([x,y])=>{const p=new DOMPoint(x-origin[0],y-origin[1]).matrixTransform(matrix);return{x:p.x+origin[0]+surfaceBox.x,y:p.y+origin[1]+surfaceBox.y};});
  const minX=Math.min(...corners.map(p=>p.x)),maxX=Math.max(...corners.map(p=>p.x)),minY=Math.min(...corners.map(p=>p.y)),maxY=Math.max(...corners.map(p=>p.y));
  return{host:node.getBoundingClientRect().toJSON(),surface:surfaceBox.toJSON(),canvas:canvas.getBoundingClientRect().toJSON(),position:getComputedStyle(node).position,
   layout:{position:css.position,width,height,left:parseFloat(css.left),top:parseFloat(css.top),right:parseFloat(css.right),bottom:parseFloat(css.bottom),offsetLeft:canvas.offsetLeft,offsetTop:canvas.offsetTop,offsetWidth:canvas.offsetWidth,offsetHeight:canvas.offsetHeight},
   origin,matrix:Object.fromEntries(['a','b','c','d','e','f','m13','m14','m23','m24','m31','m32','m33','m34','m43','m44'].map(key=>[key,matrix[key]])),expected:{x:minX,y:minY,width:maxX-minX,height:maxY-minY},
   compositor:node.__xrStage.inspect().resource.surface.compositor,
   view:node.__xrStage.inspect().resource.surface.viewport};
 }),viewport=page.viewportSize();
 expect(sample.position).toBe('fixed');
 for(const box of [sample.host,sample.surface]){expect(box.x).toBeCloseTo(0,0);expect(box.y).toBeCloseTo(0,0);expect(box.width).toBeCloseTo(viewport.width,0);expect(box.height).toBeCloseTo(viewport.height,0);}
 expect(sample.layout.position).toBe('absolute');
 for(const key of ['left','top','offsetLeft','offsetTop'])expect(sample.layout[key]).toBeCloseTo(0,0);
 for(const key of ['width','offsetWidth'])expect(sample.layout[key]).toBeCloseTo(viewport.width,0);
 for(const key of ['height','offsetHeight'])expect(sample.layout[key]).toBeCloseTo(viewport.height,0);
 const micro=sample.compositor;expect(micro.kind).toBe('2d-pan-roll');
 expect(Math.abs(micro.xPx)).toBeLessThanOrEqual(1.2);expect(Math.abs(micro.yPx)).toBeLessThanOrEqual(1.2);expect(Math.abs(micro.rollRad)).toBeLessThanOrEqual(.0012);
 // Equivalent matrix()/matrix3d() serialization must have the same effective
 // 2D affine coefficients, without perspective, depth translation or tilt.
 for(const key of ['m13','m14','m23','m24','m31','m32','m34','m43'])expect(sample.matrix[key]===0).toBe(true);
 for(const key of ['m33','m44'])expect(sample.matrix[key]).toBe(1);
 const intended={a:Math.cos(micro.rollRad),b:Math.sin(micro.rollRad),c:-Math.sin(micro.rollRad),d:Math.cos(micro.rollRad),e:micro.xPx,f:micro.yPx};
 for(const key of Object.keys(intended))expect(sample.matrix[key]).toBeCloseTo(intended[key],5);
 expect(sample.origin[0]).toBeCloseTo(micro.originX,2);expect(sample.origin[1]).toBeCloseTo(micro.originY,2);
 // The canvas layout remains exactly full viewport; its intentional pan/roll
 // changes only the visual AABB, which must match transformed corners, not an
 // arbitrary widened tolerance or a frozen idle snapshot.
 for(const key of ['x','y','width','height'])expect(sample.canvas[key]).toBeCloseTo(sample.expected[key],0);
 expect({left:sample.view.left,top:sample.view.top,width:sample.view.width,height:sample.view.height}).toEqual({left:0,top:0,...viewport});
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
  await page.waitForFunction(chapter=>{const state=document.querySelector('[data-xr-stage]')?.__xrStage?.inspect();return state?.chapter===chapter&&state.scene.chapter===chapter&&state.scene.mode===(['overview','making','credits'].includes(chapter)?'absent':'hold')&&state.scene.settled&&!state.scene.paintPending&&state.camera.settled&&state.informationWindows.settled&&!state.camera.recovering&&(!state.lifecycle.scheduled||state.camera.idleActive&&state.resource?.mode==='webgl-model'&&state.scene.mode==='hold');},chapter,{timeout:WAIT});
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
async function nativeArrowScroll(page){
 await page.locator('#portfolio-main').evaluate(node=>node.focus({preventScroll:true}));await frames(page,2);const before=await page.evaluate(()=>scrollY);
 await page.keyboard.press('ArrowDown');await expect.poll(()=>page.evaluate(()=>scrollY)).toBeGreaterThan(before);
}
async function methodProgress(page,progress){
 const destination=await page.evaluate(progress=>{const method=document.querySelector('[data-xr-chapter="method"]'),next=document.querySelector('[data-xr-chapter="adapt"]'),top=method.getBoundingClientRect().top+scrollY,end=next.getBoundingClientRect().top+scrollY;return top+(end-top)*progress-innerHeight*.42;},progress);
 const before=await page.evaluate(()=>scrollY);await page.mouse.wheel(0,destination-before);await page.waitForFunction(destination=>Math.abs(scrollY-destination)<=1,destination,{timeout:WAIT});await settled(page,'method');return facts(page);
}

test('XR retains shared page navigation while chapter progress and documentary reading require no controls',async({page})=>{
 const chrome=()=>page.evaluate(()=>{
  const box=selector=>{const node=document.querySelector(selector),rect=node.getBoundingClientRect(),css=getComputedStyle(node);return{x:rect.x,y:rect.y,width:rect.width,height:rect.height,font:css.fontFamily,size:css.fontSize,direction:css.flexDirection,position:css.position};};
  return{masthead:box('[data-page-masthead]'),identity:box('[data-liquid-glass="identity"]'),navigation:box('[data-page-masthead] nav')};
 });
 await page.goto('/projects/bending-active/');await page.waitForFunction(()=>window.__site?.inspect().phase==='entered',null,{timeout:WAIT});const bending=await chrome();
 await enter(page);const xr=await chrome();for(const key of ['masthead','identity','navigation'])expect(xr[key]).toEqual(bending[key]);
 await expect(page.locator('[data-xr-chapter-link]')).toHaveCount(8);await expect(page.locator('[data-xr-chapter-navigation] :is(a,button,input,select),[data-xr-reading-tools],[data-xr-scene-controls]')).toHaveCount(0);
 await expect(page.locator('[data-xr-study]')).toHaveAttribute('data-xr-reading-mode','scroll');
 await expect(page.locator('[data-xr-study] :is(button,details,summary),a[href^="/assets/"],a[href^="#"]')).toHaveCount(0);
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

test('one project background stage preserves source geometry and follows bold reversible native-scroll cameras without click or drag inspection',async({page,isMobile})=>{
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
 await expect(page.locator('[data-xr-chapter-navigation] :is(a,button)')).toHaveCount(0);
 await scrollChapter(page,'method');await modelReady(page,'method');await fullCanvas(page);
 const originalViewport=page.viewportSize();await page.setViewportSize({width:originalViewport.width-10,height:originalViewport.height-20});await settled(page,'method');await fullCanvas(page);
 await page.setViewportSize(originalViewport);await settled(page,'method');await fullCanvas(page);
 const transitions=await passage.evaluate(value=>value.samples);await passage.evaluate(value=>value.dispose());await passage.dispose();
 expect(transitions.some(sample=>sample.mode==='entry'&&sample.chapter==='context')).toBe(true);expect(transitions.some(sample=>sample.mode==='exit'&&sample.chapter==='context')).toBe(true);
 expect((await facts(page)).scene.mode).toBe('hold');
 const wide=await methodProgress(page,.05),crane=await methodProgress(page,.5),opposite=await methodProgress(page,.95),reverse=await methodProgress(page,.05);
 expect(opposite.camera.intent.yawRad-wide.camera.intent.yawRad).toBeGreaterThan(2.3);expect(crane.camera.intent.pitchRad-wide.camera.intent.pitchRad).toBeGreaterThan(.45);
 expect(reverse.camera.intent.yawRad).toBeCloseTo(wide.camera.intent.yawRad,3);expect(reverse.camera.intent.pitchRad).toBeCloseTo(wide.camera.intent.pitchRad,3);
 const box=await control(page).boundingBox(),point={x:box.x+box.width*.5,y:Math.max(120,Math.min(page.viewportSize().height-90,box.y+box.height*.45))};
 await page.mouse.move(point.x,point.y);await page.mouse.down();await page.mouse.move(point.x+70,point.y+10,{steps:5});await page.mouse.up();await settled(page,'method');
 expect((await facts(page)).gesture).toBeNull();expect((await facts(page)).gestures).toEqual([]);expect((await facts(page)).camera.value).toEqual({azimuth:0,elevation:0});
 expect(await stage(page).evaluate(node=>node.__xrStage.hitTest(innerWidth*.7,innerHeight*.35))).toBe(false);
 await nativeArrowScroll(page);await modelReady(page,'method');
 const receipt=test.info().outputPath('xr-scroll-camera-source.json');await writeFile(receipt,JSON.stringify({wide,crane,opposite,reverse},null,2));await test.info().attach('xr-scroll-camera-source',{path:receipt,contentType:'application/json'});
 const final=await facts(page);expect(final.gesture).toBeNull();for(const id of new Set(final.gestures.map(item=>item.id))){const own=final.gestures.filter(item=>item.id===id);expect(own.filter(item=>item.phase==='requested')).toHaveLength(1);expect(own.filter(item=>['released','cancelled'].includes(item.phase))).toHaveLength(1);}
 await scrollChapter(page,'overview');await modelReady(page);await openingVisible(page);closed(await facts(page));
 expect(final.acquisitions).toBe(1);expect(requests).toEqual([expect.stringContaining('/assets/xr/xr-research-assembly.glb')]);expect(errors).toEqual([]);
});

test('native scrolling selects all three complete recordings in the same scene without media-operation controls',async({page})=>{
 await observePhoneLifecycle(page);
 const errors=[];page.on('pageerror',error=>errors.push(error.message));await enter(page);await modelReady(page);
 const originalCanvas=await stage(page).locator('canvas').elementHandle();
 // Keep the same retained canvas and native screenshot action. Batch related
 // observations at one instant instead of resolving the same locator for each
 // assertion while the recording and the real scene clock continue to run.
 const decodedFrames=()=>page.evaluate(()=>{
  const hosts=document.querySelectorAll('[data-xr-stage]');if(hosts.length!==1)throw Error('Expected exactly one XR stage');
  return hosts[0].__xrStage.inspect().resource.media.frames;
 });
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
 await expect(page.locator('[data-xr-reading-tools],[data-xr-scene-controls],[data-xr-motion-toggle]')).toHaveCount(0);
 await scrollChapter(page,'overview');await modelReady(page);await openingVisible(page);
 const returned=await originalCanvas.evaluate(()=>{const hosts=document.querySelectorAll('[data-xr-stage]');if(hosts.length!==1)throw Error('Expected exactly one XR stage');return{state:hosts[0].__xrStage.inspect(),videoSources:hosts[0].querySelectorAll('video[src]').length};});
 expect(returned.videoSources).toBe(0);expect(returned.state.resource.media.stage).toBeNull();expect(returned.state.acquisitions).toBe(1);expect(errors).toEqual([]);
  for(const chapter of ['making','credits']){
   await scrollChapter(page,chapter);const state=await facts(page);expect(state.scene).toMatchObject({chapter,mode:'absent',visible:false,opacity:0});
   await expect(stage(page).locator('[data-xr-scene-surface]')).toHaveCSS('opacity','0');await expect(stage(page).locator('[data-xr-scene-surface]')).toHaveCSS('pointer-events','none');
   await expect(stage(page).locator('[data-xr-model-poster]')).toBeHidden();await expect(page.locator('[data-xr-scene-controls]')).toHaveCount(0);await expect(stage(page).locator('video[src]')).toHaveCount(0);
  }
});

test('a genuinely delayed recording preserves its paused native frame through a pending reverse and atomic replacement',async({page})=>{
 await observePhoneLifecycle(page);
 let release;const held=new Promise(resolve=>{release=resolve;});let waiting=false;
 await page.route('**/assets/xr/assemble-interface.mp4',async route=>{waiting=true;await held;await route.continue();});
 let continuity,primaryError,advancementBaseline;const advancement=[];
 const saveAdvancement=async outcome=>{
  const path=test.info().outputPath('delayed-recording-advance-diagnostic.json');
  await writeFile(path,JSON.stringify({outcome,baseline:advancementBaseline,advancement,lifecycle:phoneDiagnostics.get(page)?.entries??[]},null,2));
  await test.info().attach('delayed-recording-advance-diagnostic',{path,contentType:'application/json'});
 };
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
  const before=await video(page,'assemble').evaluate(node=>node.currentTime);advancementBaseline=before;
  await expect.poll(async()=>{
   // Observe the same native read as the original predicate: no extra roundtrip,
   // wait, playback request or clock. Keep only bounded diagnostic history.
   const snapshot=await video(page,'assemble').evaluate(node=>{
    const currentTime=node.currentTime,state=document.querySelector('[data-xr-stage]')?.__xrStage?.inspect();
    const range=value=>Array.from({length:Math.min(value.length,4)},(_,index)=>[value.start(index),value.end(index)]);
    const native=Array.from(document.querySelectorAll('[data-xr-stage-video]')).slice(0,4).map(video=>{
     const quality=video.getVideoPlaybackQuality?.();
     return{stage:video.dataset.xrStageVideo,src:video.getAttribute('src'),currentSrc:video.currentSrc,
      currentTime:video.currentTime,paused:video.paused,ended:video.ended,seeking:video.seeking,
      readyState:video.readyState,networkState:video.networkState,duration:Number.isFinite(video.duration)?video.duration:String(video.duration),
      bufferedLength:video.buffered.length,seekableLength:video.seekable.length,buffered:range(video.buffered),seekable:range(video.seekable),error:video.error?{code:video.error.code,message:video.error.message?.slice(0,240)}:null,
      quality:quality?{totalVideoFrames:quality.totalVideoFrames,droppedVideoFrames:quality.droppedVideoFrames,corruptedVideoFrames:quality.corruptedVideoFrames}:null};
    });
    return{currentTime,native,owner:state?{phase:state.phase,chapter:state.chapter,scene:state.scene?.mode,
     scheduled:state.lifecycle?.scheduled,rendering:state.resource?.mode,resourceChapter:state.resource?.chapter,
     successfulPaint:state.resource?.successfulPaint,paused:state.resource?.paused,media:state.resource?.media,
     fallback:state.resource?.fallbackReason,lastRenderFailure:state.resource?.lastRenderFailure}:null};
   });
   if(advancement.length===32)advancement.shift();advancement.push(snapshot);
   return snapshot.currentTime;
  }).toBeGreaterThan(before);closed(await facts(page));
  const samples=await continuity.evaluate(value=>value.samples);expect(samples.some(sample=>sample.chapter==='assemble')).toBe(true);
  for(const sample of samples){expect(sample).toMatchObject({opacity:1,cssOpacity:1,painted:true,phoneCalls:2});expect(['entry','exit']).not.toContain(sample.mode);}
  await test.info().attach('continuous-pending-reverse-phone',{body:JSON.stringify(samples),contentType:'application/json'});
  await saveAdvancement('passed');
 }catch(error){
  primaryError=error;
  try{
   await saveAdvancement('failed');
  }catch{/* Persisted diagnostics must never replace the original assertion. */}
  throw error;
 }
 finally{
  try{
   try{if(continuity){try{await continuity.evaluate(value=>value.dispose());}finally{await continuity.dispose();}}}
   finally{release();await page.unrouteAll({behavior:'wait'});}
  }catch(cleanupError){
   // A closed/unresponsive page must not replace the failed readiness or
   // transaction assertion. Cleanup failures still fail an otherwise passed test.
   if(!primaryError)throw cleanupError;
  }
 }
});

test('OS motion and data-saving preference changes do not automatically replace the scroll-led model or recordings with static posters',async({page})=>{
 await page.addInitScript(()=>Object.defineProperty(navigator,'connection',{configurable:true,value:Object.assign(new EventTarget(),{saveData:true})}));
 await page.emulateMedia({reducedMotion:'reduce'});await enter(page);await modelReady(page);await openingVisible(page);
 const canvas=await stage(page).locator('canvas').elementHandle();await scrollChapter(page,'method');await modelReady(page,'method');await nativeArrowScroll(page);
 expect((await facts(page)).reduced).toBe(false);expect((await facts(page)).saveData).toBe(false);expect(await page.evaluate(()=>navigator.connection.saveData)).toBe(true);await phoneReady(page,'adapt');const initial=await facts(page),before=await video(page,'adapt').evaluate(node=>node.currentTime);
 await expect.poll(()=>video(page,'adapt').evaluate(node=>node.currentTime)).toBeGreaterThan(before);
 await page.emulateMedia({reducedMotion:'no-preference'});await page.evaluate(()=>{navigator.connection.saveData=false;navigator.connection.dispatchEvent(new Event('change'));});await page.emulateMedia({reducedMotion:'reduce'});await page.evaluate(()=>{navigator.connection.saveData=true;navigator.connection.dispatchEvent(new Event('change'));});await frames(page,8);
 const changed=await facts(page);expect(changed.reduced).toBe(false);expect(changed.saveData).toBe(false);expect(changed.acquisitions).toBe(initial.acquisitions);expect(changed.disposals).toBe(initial.disposals);expect(changed.resource.mode).toBe('webgl-phone');
 expect(await canvas.evaluate(node=>node.isConnected&&node===document.querySelector('[data-xr-stage] canvas'))).toBe(true);
 for(const id of ['assemble','join'])await phoneReady(page,id);
 await scrollChapter(page,'credits');const excerpt=page.locator('[data-xr-presentation-recording] [data-project-animation-preview]');await excerpt.scrollIntoViewIfNeeded();await expect(excerpt).toHaveAttribute('data-animation-state','playing',{timeout:WAIT});
 const recorded=excerpt.locator('video');await expect(recorded).toHaveAttribute('src',new URL('/assets/xr/background-preview.mp4',page.url()).href);expect(await recorded.evaluate(node=>({width:node.videoWidth,height:node.videoHeight,playing:node.muted&&node.loop&&node.playsInline&&!node.paused}))).toEqual({width:960,height:540,playing:true});const archivedTime=await recorded.evaluate(node=>node.currentTime);await expect.poll(()=>recorded.evaluate(node=>node.currentTime)).toBeGreaterThan(archivedTime);
 await expect(page.locator('[data-xr-study] :is(button,details,summary),a[href^="/assets/"],a[href^="#"]')).toHaveCount(0);closed(await facts(page));
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
  await expect(page.locator('#xr-adapt-heading')).toBeVisible();await expect(page.locator('#xr-adapt a')).toHaveCount(0);await scrollChapter(page,'overview');await modelReady(page);await page.getByRole('link',{name:'← All projects',exact:true}).click();
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
