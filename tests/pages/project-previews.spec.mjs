import {test,expect} from '@playwright/test';
import {createServer} from 'node:http';
import {fileURLToPath} from 'node:url';
import {readFile} from 'node:fs/promises';
import {createPagesPreviewHandler} from '../../scripts/serve-pages.mjs';
import {WAIT,frames,scenarioTimeout} from './case-helpers.mjs';

const model=page=>page.locator('[data-project-model-preview]');
const xrStage=page=>page.locator('[data-xr-stage]');
const xrVideo=page=>xrStage(page).locator('[data-xr-stage-video="adapt"]');
const xrRelease=new URL('../../roles/uiux-designer/cases/bending-active-thesis/release/',import.meta.url);
const [xrStudy,xrWorkspace]=await Promise.all(['xr-study.json','xr-workspace.json'].map(async name=>JSON.parse(await readFile(new URL(name,xrRelease),'utf8'))));
const entryFacts=page=>page.evaluate(()=>{
 const element=document.querySelector('[data-site-loader]'),style=element&&getComputedStyle(element);
 return{
  at:performance.now(),url:location.href,documentState:document.readyState,visibility:document.visibilityState,
  site:window.__site?.inspect()??null,
  model:document.querySelector('[data-project-model-preview]')?.__projectModelPreview?.inspect()??null,
  loader:element?{phase:element.dataset.sitePhase,connected:element.hasAttribute('data-site-connected'),hidden:element.hidden,
   animation:style.animationName,duration:style.animationDuration,playState:style.animationPlayState,display:style.display,visibility:style.visibility}:null,
  images:[...document.querySelectorAll('img[data-site-critical], [data-site-critical] img')].slice(0,12).map(image=>({
   src:image.getAttribute('src'),selected:image.currentSrc,complete:image.complete,width:image.naturalWidth,height:image.naturalHeight,decoding:image.decoding,
  })),
  fonts:{status:document.fonts?.status,faces:[...document.fonts??[]].slice(0,16).map(face=>({family:face.family,weight:face.weight,status:face.status}))},
  resources:performance.getEntriesByType('resource').filter(resource=>/\.(woff2|webp|css|glb|hdr)(?:\?|$)|source-layers\.json(?:\?|$)/.test(resource.name)).slice(-24).map(resource=>({
   url:resource.name,type:resource.initiatorType,start:resource.startTime,end:resource.responseEnd,duration:resource.duration,
   transferred:resource.transferSize,encoded:resource.encodedBodySize,decoded:resource.decodedBodySize,
  })),
 };
});
async function entered(page){
 let waitError;
 try{await page.waitForFunction(()=>['entered','failed'].includes(window.__site?.inspect().phase),null,{timeout:WAIT});}
 catch(error){waitError=error;}
 const facts=await entryFacts(page);
 if(waitError||facts.site?.phase!=='entered')await test.info().attach('site-entry-diagnostics',{body:JSON.stringify(facts,null,2),contentType:'application/json'});
 if(waitError)throw waitError;
 expect(facts.site?.phase,JSON.stringify(facts,null,2)).toBe('entered');
 await expect(page.locator('[data-site-loader]')).toBeHidden();
}
async function openGrid(page){await page.goto('/projects/');await entered(page);}
const modelFacts=page=>model(page).evaluate(node=>node.__projectModelPreview.inspect());
const xrFacts=page=>xrStage(page).evaluate(node=>node.__xrStage.inspect());
async function xrChapter(page,chapter){
 await page.locator(`[data-xr-chapter="${chapter}"]`).evaluate(node=>node.scrollIntoView({block:'start',behavior:'instant'}));
 await page.waitForFunction(chapter=>{
  const state=document.querySelector('[data-xr-stage]')?.__xrStage?.inspect(),resource=state?.resource;
  const settled=state?.phase==='ready'&&state.chapter===chapter&&state.scene.chapter===chapter&&state.scene.mode===(chapter==='overview'?'absent':'hold')&&state.scene.settled&&!state.scene.paintPending&&state.camera.settled&&state.informationWindows.settled;
  if(chapter==='context')return settled&&state.workspace.phase==='ready';
  return settled&&resource?.chapter===chapter&&resource.successfulPaint&&
   (chapter==='adapt'?resource.mode==='webgl-phone'&&resource.media.stage==='adapt'&&!resource.media.pending&&resource.media.frames>2:resource.mode==='webgl-model');
 },chapter,{timeout:WAIT});
}
function closedRequests(state){
 const ids=[...new Set(state.history.map(fact=>fact.id))];
 for(const id of ids){const facts=state.history.filter(fact=>fact.id===id);expect(facts.filter(fact=>fact.phase==='requested')).toHaveLength(1);expect(facts.filter(fact=>['ready','failed','cancelled'].includes(fact.phase))).toHaveLength(1);}
}

test('square project cards retain the live model and inset XR image and reveal titles on hover or keyboard focus',async({page,isMobile})=>{
 await openGrid(page);
 const cards=page.locator('[data-project-tile]');await expect(cards).toHaveCount(2);
 for(const card of await cards.all()){
  const geometry=await card.evaluate(node=>{const rect=node.getBoundingClientRect(),image=node.querySelector('[data-project-card-image]'),media=(image?image.parentElement:node.querySelector('[data-project-model-preview]')).getBoundingClientRect(),css=getComputedStyle(node);return{xr:!!image,width:rect.width,height:rect.height,mediaWidth:media.width,mediaHeight:media.height,rim:[media.left-rect.left-parseFloat(css.borderLeftWidth),media.top-rect.top-parseFloat(css.borderTopWidth),rect.right-media.right-parseFloat(css.borderRightWidth),rect.bottom-media.bottom-parseFloat(css.borderBottomWidth)],radius:parseFloat(css.borderRadius)};});
  expect(Math.abs(geometry.width-geometry.height)).toBeLessThan(1);expect(geometry.radius).toBeGreaterThan(0);
  if(geometry.xr){for(const inset of geometry.rim){expect(inset).toBeGreaterThanOrEqual(7.9);expect(inset).toBeLessThanOrEqual(12.1);}}
  else{expect(geometry.mediaWidth/geometry.width).toBeGreaterThan(.97);expect(geometry.mediaHeight/geometry.height).toBeGreaterThan(.97);}
 }
 const link=page.locator('[data-project-card="bending-active"]'),title=link.locator('[data-project-card-title]');
 await expect(link).toHaveAccessibleName('Bending-Active Metal Panel Deformation');
 if(!isMobile){
  await page.mouse.move(0,0);await expect(title).toHaveCSS('opacity','0');
  await link.hover();await expect(title).toHaveCSS('opacity','1');
  await page.mouse.move(0,0);await expect(title).toHaveCSS('opacity','0');
 }
 await link.focus();await expect(title).toHaveCSS('opacity','1');
 const xr=page.locator('[data-project-card="xr-bending-active"]');
 await expect(xr).toHaveAccessibleName('Motion capture × bending-active');
 await expect(xr).toHaveAttribute('href','/projects/xr-bending-active/');
 await expect(page.locator('[data-project-card-image]')).toHaveAttribute('src','/assets/xr/portfolio-main-visual.webp');
 await expect(page.locator('[data-project-animation-preview],[data-animation-toggle]')).toHaveCount(0);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
});

test('the real model paints behind loading before its offscreen card appears, stays resident while scrolling, and closes on navigation',async({page})=>{
 test.setTimeout(scenarioTimeout(150000));
 const requests=[];page.on('request',request=>{if(/\.(glb|hdr)(?:\?|$)/.test(request.url()))requests.push(request.url());});
 let release,held=false,paintAssay;
 const sourceGate=new Promise(resolve=>{release=resolve;});
 // Continue the real approved GLB response: no generated bytes, clock override
 // or synthetic renderer/readiness event can satisfy this preparation gate.
 await page.route('**/assets/source-layers.glb',async route=>{held=true;await sourceGate;await route.continue();});
 try{
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await expect.poll(()=>held,{timeout:WAIT}).toBe(true);
  await page.waitForFunction(()=>window.__site&&document.querySelector('[data-project-model-preview]')?.__projectModelPreview,null,{timeout:WAIT});
  paintAssay=await model(page).evaluateHandle(node=>{
   const observations=[],loader=document.querySelector('[data-site-loader]'),root=document.querySelector('[data-portfolio-root]');
   const sample=()=>{
    const css=getComputedStyle(loader),rect=node.getBoundingClientRect();
    return{site:window.__site.inspect(),loader:{hidden:loader.hidden,display:css.display,visibility:css.visibility,opacity:Number(css.opacity)},
     inert:root.inert,offscreen:rect.top>=innerHeight||rect.bottom<=0,model:node.__projectModelPreview.inspect()};
   };
   const initial=sample();
   const observer=new MutationObserver(records=>{
    for(const record of records)for(const added of record.addedNodes)if(added.nodeType===1&&added.matches('[data-project-model-canvas]'))observations.push(sample());
   });
   observer.observe(node,{childList:true});
   return{initial,observations,dispose(){observer.disconnect();}};
  });
  const waiting=await paintAssay.evaluate(assay=>assay.initial);
  expect(waiting.site.phase).toBe('requested');expect(waiting.site.previews.ready).toBe(false);
  expect(waiting.site.previews.pending).toEqual(['preview-1']);expect(waiting.inert).toBe(true);expect(waiting.offscreen).toBe(true);
  expect(waiting.loader.hidden).toBe(false);expect(waiting.loader.display).not.toBe('none');expect(waiting.loader.visibility).toBe('visible');expect(waiting.loader.opacity).toBeGreaterThan(0);
  expect(waiting.model.pending).toBe(true);expect(waiting.model.resource).toBeNull();
  release();await page.unrouteAll({behavior:'wait'});await entered(page);
  const painted=await paintAssay.evaluate(assay=>assay.observations);
  await test.info().attach('model-preload-order',{body:JSON.stringify({waiting,painted},null,2),contentType:'application/json'});
  expect(painted).toHaveLength(1);
  expect(['requested','ready','revealing']).toContain(painted[0].site.phase);expect(painted[0].inert).toBe(true);expect(painted[0].offscreen).toBe(true);
  expect(painted[0].loader.hidden).toBe(false);expect(painted[0].loader.display).not.toBe('none');expect(painted[0].loader.visibility).toBe('visible');expect(painted[0].loader.opacity).toBeGreaterThan(0);
  expect(painted[0].model.resource.firstDraw.completed).toBe(true);expect(painted[0].model.resource.firstDraw.environmentReady).toBe(true);expect(painted[0].model.resource.firstDraw.calls).toBeGreaterThan(0);
  await paintAssay.evaluate(assay=>assay.dispose());await paintAssay.dispose();paintAssay=null;
  await expect(model(page)).toHaveAttribute('data-preview-phase','ready');await expect(model(page)).not.toBeInViewport();
  await expect(model(page).locator('canvas')).toHaveCount(1);await expect(page.locator('canvas')).toHaveCount(2);
  await expect(page.locator('canvas[data-global-background-field]')).toHaveCount(1);await expect(page.locator('[data-cinematic-stage]')).toHaveCount(0);
  const first=await modelFacts(page),site=await page.evaluate(()=>window.__site.inspect());
  expect(site.previews.ready).toBe(true);expect(site.previews.previews).toEqual([{mode:'model',reason:''}]);
  expect(first.acquisitions).toBe(1);expect(first.disposals).toBe(0);expect(first.resource.firstDraw.completed).toBe(true);
  expect(first.resource.firstDraw.sourceRevision).toBe(first.resource.sourceRevision);expect(first.resource.firstDraw.width).toBeGreaterThan(0);expect(first.resource.firstDraw.height).toBeGreaterThan(0);closedRequests(first);
  for(let visit=0;visit<2;visit++){
   await page.locator('[data-home-project-link]').click();await expect(model(page)).toBeInViewport();
   await page.locator('[data-home-introduction] h1').scrollIntoViewIfNeeded();await expect(model(page)).not.toBeInViewport();
   const retained=await modelFacts(page);expect(retained.phase).toBe('ready');expect(retained.acquisitions).toBe(first.acquisitions);expect(retained.disposals).toBe(0);expect(retained.resource.frames).toBe(first.resource.frames);
   await expect(model(page).locator('canvas')).toHaveCount(1);closedRequests(retained);
  }
  for(const suffix of ['/assets/source-layers.glb','/assets/studio-small.hdr'])expect(requests.filter(url=>url.endsWith(suffix))).toHaveLength(1);
  // An idle observation is intentional: the retained static preview must sleep.
  const beforeIdle=await modelFacts(page);await page.waitForTimeout(500);const idle=await modelFacts(page);expect(idle.renders).toBe(beforeIdle.renders);expect(idle.resource.frames).toBe(beforeIdle.resource.frames);
  await page.locator('[data-home-project-link]').click();await expect(model(page)).toBeInViewport();
  const contextLoss=await model(page).locator('canvas').evaluate(canvas=>{const extension=canvas.getContext('webgl2').getExtension('WEBGL_lose_context');if(!extension)return false;extension.loseContext();return true;});
  expect(contextLoss).toBe(true);await expect(model(page)).toHaveAttribute('data-preview-phase','failed');
  await expect(model(page).locator('canvas')).toHaveCount(0);await expect(page.locator('[data-model-poster]')).toBeVisible();
  const failed=await modelFacts(page);expect(failed.resourceFailures.some(fact=>fact.reason==='context-lost')).toBe(true);
  expect(failed.resource).toBeNull();expect(failed.disposals).toBe(failed.acquisitions);closedRequests(failed);
  await page.locator('[data-home-introduction] h1').scrollIntoViewIfNeeded();await expect(model(page)).not.toBeInViewport();
  await page.locator('[data-home-project-link]').click();await expect(model(page)).toBeInViewport();
  const stillFailed=await modelFacts(page);expect(stillFailed.phase).toBe('failed');expect(stillFailed.acquisitions).toBe(failed.acquisitions);expect(stillFailed.resource).toBeNull();
  await expect(model(page).locator('canvas')).toHaveCount(0);closedRequests(stillFailed);
  for(const suffix of ['/assets/source-layers.glb','/assets/studio-small.hdr'])expect(requests.filter(url=>url.endsWith(suffix))).toHaveLength(1);
  // A deliberate reload is a new preparation lifetime. It supplies an active
  // resource for the real pagehide-disposal check after the failure above.
  await page.reload();await entered(page);await expect(model(page)).toHaveAttribute('data-preview-phase','ready');
  const renewed=await modelFacts(page);expect(renewed.resource.firstDraw.completed).toBe(true);expect(renewed.disposals).toBe(0);closedRequests(renewed);
  await page.evaluate(()=>addEventListener('pagehide',()=>{const state=document.querySelector('[data-project-model-preview]').__projectModelPreview.inspect();sessionStorage.setItem('test-preview-departure',JSON.stringify(state));},{once:true}));
  await page.locator('[data-portfolio-navigation] a[href="/contact/"]').click();await entered(page);
  const departed=await page.evaluate(()=>JSON.parse(sessionStorage.getItem('test-preview-departure')));
  expect(departed.resource).toBeNull();expect(departed.disposals).toBe(departed.acquisitions);closedRequests(departed);
  await expect(page.locator('canvas')).toHaveCount(1);await expect(page.locator('canvas[data-global-background-field]')).toHaveCount(1);
 }finally{
  release();await page.unrouteAll({behavior:'wait'});
  if(paintAssay){await paintAssay.evaluate(assay=>assay.dispose());await paintAssay.dispose();}
 }
});

test('the selected native recording plays only while eligible and a pause click does not navigate',async({page})=>{
 await page.goto('/projects/xr-bending-active/');await entered(page);
 await xrChapter(page,'context');
 const workspace=xrStage(page).locator('[data-xr-workspace-visual]');await expect(workspace).toBeVisible();
 const source=await workspace.evaluate(node=>({ready:node.complete&&node.naturalWidth>0&&node.naturalHeight>0,src:new URL(node.currentSrc).pathname,width:node.naturalWidth,height:node.naturalHeight,fit:getComputedStyle(node).objectFit}));
 const expected=page.viewportSize().width<800?xrWorkspace.image.mobile??xrWorkspace.image:xrWorkspace.image;
 expect(source).toEqual({ready:true,src:expected.src,width:expected.width,height:expected.height,fit:'contain'});
 expect((await xrFacts(page)).workspace).toMatchObject({phase:'ready',width:expected.width,height:expected.height});
 await expect(xrStage(page).locator('canvas')).toHaveCount(1);await expect(xrStage(page).locator('canvas')).toBeHidden();
 await expect(xrStage(page).locator('[data-xr-model-poster]')).toBeHidden();await expect(page.locator('[data-xr-scene-controls]')).toBeHidden();
 closedRequests(await xrFacts(page));
 await xrChapter(page,'adapt');
 const video=xrVideo(page);
 expect(await video.evaluate(node=>node.muted&&node.loop&&node.playsInline&&!node.paused&&node.readyState>=2)).toBe(true);
 const initial=await video.evaluate(node=>node.currentTime);await expect.poll(()=>video.evaluate(node=>node.currentTime)).toBeGreaterThan(initial);
 const before=page.url(),button=page.locator('[data-xr-motion-toggle]');await expect(button).toHaveAccessibleName('Pause recording');
 const placement=await button.evaluate(node=>({rect:node.getBoundingClientRect().toJSON(),nestedInLink:!!node.closest('a')}));
 expect(placement.rect.width).toBeGreaterThanOrEqual(44);expect(placement.rect.height).toBeGreaterThanOrEqual(44);expect(placement.nestedInLink).toBe(false);
 await button.click();expect(page.url()).toBe(before);await expect(button).toHaveAccessibleName('Play recording');
 await expect.poll(()=>video.evaluate(node=>node.paused)).toBe(true);const paused=await video.evaluate(node=>node.currentTime);await frames(page,8);expect(await video.evaluate(node=>node.currentTime)).toBe(paused);
 await expect(video).toHaveAttribute('src',new URL('/assets/xr/adapt-interface.mp4',page.url()).href);closedRequests(await xrFacts(page));
 await button.click();await expect(button).toHaveAccessibleName('Pause recording');await expect.poll(()=>video.evaluate(node=>node.currentTime)).not.toBe(paused);expect(page.url()).toBe(before);
 await xrChapter(page,'overview');await expect(xrStage(page).locator('video[src]')).toHaveCount(0);expect((await xrFacts(page)).resource.media.stage).toBeNull();closedRequests(await xrFacts(page));
 await expect(xrStage(page)).toHaveAttribute('data-xr-opening','true');
 await expect(xrStage(page).locator('[data-xr-opening-visual]')).toHaveCount(0);await expect(page.locator('[data-xr-hero]')).toHaveCount(0);
 await expect(page.locator('#xr-overview h1')).toHaveText(xrStudy.title);await expect(page.locator('#xr-overview h1')).toBeVisible();
 await expect(page.locator('#xr-overview p')).toHaveText(xrStudy.introduction);await expect(page.locator('#xr-overview p')).toBeVisible();
 expect((await xrFacts(page)).scene).toMatchObject({chapter:'overview',mode:'absent',settled:true,visible:false});
 await expect(workspace).toBeHidden();await expect(xrStage(page).locator('[data-xr-model-poster]')).toBeHidden();
 await expect(xrStage(page).locator('canvas')).toHaveCount(1);await expect(xrStage(page).locator('canvas')).toBeHidden();await expect(page.locator('[data-xr-scene-controls]')).toBeHidden();
 await page.evaluate(()=>addEventListener('pagehide',()=>sessionStorage.setItem('test-xr-preview-departure',JSON.stringify(document.querySelector('[data-xr-stage]').__xrStage.inspect())),{once:true}));
 await page.locator('[data-portfolio-navigation] a[href="/contact/"]').click();await entered(page);
 const departed=await page.evaluate(()=>JSON.parse(sessionStorage.getItem('test-xr-preview-departure')));expect(departed.resource).toBeNull();expect(departed.disposals).toBe(departed.acquisitions);closedRequests(departed);
 await expect(page.locator('canvas')).toHaveCount(1);await expect(page.locator('canvas[data-global-background-field]')).toHaveCount(1);
});

test('motion preference changes close active previews and preserve the same-frame fallback',async({page})=>{
 await openGrid(page);
 await expect(model(page)).toHaveAttribute('data-preview-phase','ready',{timeout:WAIT});
 const beforePolicy=await modelFacts(page);expect(beforePolicy.resource.firstDraw.completed).toBe(true);
 await page.emulateMedia({reducedMotion:'reduce'});await expect(model(page).locator('canvas')).toHaveCount(0);
 await expect(page.locator('[data-model-poster]')).toBeVisible();
 const reducedModel=await modelFacts(page);expect(reducedModel.resource).toBeNull();expect(reducedModel.reason).toBe('reduced-motion');expect(reducedModel.disposals).toBe(reducedModel.acquisitions);closedRequests(reducedModel);
 await page.emulateMedia({reducedMotion:'no-preference'});
 await expect(model(page)).toHaveAttribute('data-preview-phase','ready',{timeout:WAIT});
 const restoredModel=await modelFacts(page);expect(restoredModel.acquisitions).toBeGreaterThan(beforePolicy.acquisitions);expect(restoredModel.resource.firstDraw.completed).toBe(true);closedRequests(restoredModel);
 await page.goto('/projects/xr-bending-active/');await entered(page);
 await xrChapter(page,'adapt');
 await page.emulateMedia({reducedMotion:'reduce'});
 await expect(xrStage(page).locator('canvas')).toHaveCount(0);await expect(xrStage(page).locator('video[src]')).toHaveCount(0);
 await expect(xrStage(page).locator('[data-xr-native-phone="adapt"] img')).toBeVisible();await expect(page.locator('[data-xr-motion-toggle]')).toBeDisabled();
 const reduced=await xrFacts(page);expect(reduced.resource).toBeNull();expect(reduced.disposals).toBe(reduced.acquisitions);closedRequests(reduced);
 await page.emulateMedia({reducedMotion:'no-preference'});
 await xrChapter(page,'adapt');expect((await xrFacts(page)).acquisitions).toBeGreaterThan(reduced.acquisitions);closedRequests(await xrFacts(page));
});

test('failed model and video assets settle to explicit static fallbacks with native links and truthful posters available',async({page})=>{
 // Native WebKit media can bypass Playwright routing. A real HTTP 404 from an
 // isolated server proves the failure without altering the audited artifact.
 const denied={model:0,video:0};let handler;
 const server=createServer((request,response)=>{
  const asset=request.url.split('?')[0];
  const kind=asset==='/assets/source-layers.glb'?'model':asset==='/assets/xr/adapt-interface.mp4'?'video':null;
  if(kind){denied[kind]++;response.writeHead(404,{'Content-Type':'text/plain','Cache-Control':'no-store'}).end('Unavailable test asset');return;}
  return handler(request,response);
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const port=server.address().port;
 handler=createPagesPreviewHandler({root:fileURLToPath(new URL('../../.pages-workspace/out/',import.meta.url)),port});
 let primaryError;
 try{
 await page.goto(`http://127.0.0.1:${port}/projects/`);await entered(page);
 await expect(model(page)).toHaveAttribute('data-preview-phase','failed',{timeout:WAIT});
 await expect(page.locator('[data-model-poster]')).toBeVisible();
 const failedModel=await modelFacts(page),fallbackEntry=await page.evaluate(()=>window.__site.inspect());closedRequests(failedModel);
 expect(failedModel.reason).toBe('Project model assets unavailable');expect(failedModel.resource).toBeNull();
 expect(fallbackEntry.phase).toBe('entered');expect(fallbackEntry.previews.ready).toBe(true);expect(fallbackEntry.previews.pending).toEqual([]);
 expect(fallbackEntry.previews.previews).toEqual([{mode:'static',reason:failedModel.reason}]);
 expect(denied.model).toBeGreaterThan(0);
 await page.locator('[data-project-card="xr-bending-active"]').click();await entered(page);
 await expect(page.locator('h1')).toHaveText('An Extended-Reality App Using Motion Capture for Bending-Active Structure');
 await page.locator('[data-xr-chapter="adapt"]').evaluate(node=>node.scrollIntoView({block:'start',behavior:'instant'}));
 await page.waitForFunction(()=>{const state=document.querySelector('[data-xr-stage]')?.__xrStage?.inspect(),resource=state?.resource;return state?.chapter==='adapt'&&resource?.media.stage==='adapt'&&!resource.media.pending&&resource.mode==='poster'&&!!resource.media.reason;},null,{timeout:WAIT});
 await expect(xrStage(page).locator('[data-xr-native-phone="adapt"] img')).toBeVisible();await expect(xrStage(page).locator('video[src]')).toHaveCount(0);
 await expect(page.locator('[data-project-model-preview] canvas')).toHaveCount(0);
 await expect(page.locator('canvas[data-global-background-field]')).toHaveCount(1);
 expect(denied.model).toBeGreaterThan(0);expect(denied.video).toBeGreaterThan(0);
 closedRequests(await xrFacts(page));await expect(page.locator('#xr-adapt a[href="/assets/xr/adapt-interface.mp4"]')).toBeVisible();
 await expect(page.locator('h1')).toHaveText('An Extended-Reality App Using Motion Capture for Bending-Active Structure');
 }catch(error){primaryError=error;throw error;
 }finally{
  try{if(!page.isClosed())await page.goto('about:blank');}catch(error){if(!primaryError)throw error;}
  finally{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
 }
});
