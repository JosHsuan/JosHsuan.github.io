import {test,expect} from '@playwright/test';
import {createServer} from 'node:http';
import {fileURLToPath} from 'node:url';
import {createPagesPreviewHandler} from '../../scripts/serve-pages.mjs';
import {WAIT,frames,scenarioTimeout} from './case-helpers.mjs';

const model=page=>page.locator('[data-project-model-preview]');
const xrStage=page=>page.locator('[data-xr-stage]');
const xrVideo=page=>xrStage(page).locator('[data-xr-stage-video="adapt"]');
const entryFacts=page=>page.evaluate(()=>{
 const element=document.querySelector('[data-site-loader]'),style=element&&getComputedStyle(element);
 return{
  at:performance.now(),url:location.href,documentState:document.readyState,visibility:document.visibilityState,
  site:window.__site?.inspect()??null,
  loader:element?{phase:element.dataset.sitePhase,connected:element.hasAttribute('data-site-connected'),hidden:element.hidden,
   animation:style.animationName,duration:style.animationDuration,playState:style.animationPlayState,display:style.display,visibility:style.visibility}:null,
  images:[...document.querySelectorAll('img[data-site-critical], [data-site-critical] img')].slice(0,12).map(image=>({
   src:image.getAttribute('src'),selected:image.currentSrc,complete:image.complete,width:image.naturalWidth,height:image.naturalHeight,decoding:image.decoding,
  })),
  fonts:{status:document.fonts?.status,faces:[...document.fonts??[]].slice(0,16).map(face=>({family:face.family,weight:face.weight,status:face.status}))},
  resources:performance.getEntriesByType('resource').filter(resource=>/\.(woff2|webp|css)(?:\?|$)/.test(resource.name)).slice(-24).map(resource=>({
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
  return state?.phase==='ready'&&state.chapter===chapter&&state.camera.settled&&state.informationWindows.settled&&resource?.chapter===chapter&&resource.successfulPaint&&
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

test('the real model loads only inside a visible card, sleeps at rest, and releases on exit and navigation',async({page})=>{
 test.setTimeout(scenarioTimeout(150000));
 const requests=[];page.on('request',request=>{if(/\.(glb|hdr)(?:\?|$)/.test(request.url()))requests.push(request.url());});
 await page.goto('/');await entered(page);
 expect(requests).toEqual([]);await expect(page.locator('canvas')).toHaveCount(1);await expect(page.locator('canvas[data-global-background-field]')).toHaveCount(1);
 await page.locator('[data-home-project-link]').click();
 await expect(model(page)).toHaveAttribute('data-preview-phase','ready',{timeout:WAIT});
 await expect(model(page).locator('canvas')).toHaveCount(1);await expect(page.locator('[data-cinematic-stage]')).toHaveCount(0);
 expect(requests.some(url=>url.endsWith('/assets/source-layers.glb'))).toBe(true);
 const first=await modelFacts(page);expect(first.resource).not.toBeNull();closedRequests(first);
 // An idle observation is intentional: a static preview must not keep drawing.
 await page.waitForTimeout(500);const idle=await modelFacts(page);expect(idle.renders).toBe(first.renders);expect(idle.resource.frames).toBe(first.resource.frames);
 const contextLoss=await model(page).locator('canvas').evaluate(canvas=>{const extension=canvas.getContext('webgl2').getExtension('WEBGL_lose_context');if(!extension)return false;extension.loseContext();return true;});
 expect(contextLoss).toBe(true);
 await expect(model(page)).toHaveAttribute('data-preview-phase','failed');
 await expect(model(page).locator('canvas')).toHaveCount(0);await expect(page.locator('[data-model-poster]')).toBeVisible();
 expect((await modelFacts(page)).resourceFailures.some(fact=>fact.reason==='context-lost')).toBe(true);
 await page.locator('[data-home-introduction] h1').scrollIntoViewIfNeeded();
 await expect(model(page).locator('canvas')).toHaveCount(0);
 const stopped=await modelFacts(page);expect(stopped.resource).toBeNull();expect(stopped.disposals).toBe(stopped.acquisitions);closedRequests(stopped);
 await page.locator('[data-home-project-link]').click();
 await expect(model(page)).toHaveAttribute('data-preview-phase','ready',{timeout:WAIT});
 expect((await modelFacts(page)).acquisitions).toBeGreaterThan(first.acquisitions);
 await page.evaluate(()=>addEventListener('pagehide',()=>{const state=document.querySelector('[data-project-model-preview]').__projectModelPreview.inspect();sessionStorage.setItem('test-preview-departure',JSON.stringify(state));},{once:true}));
 await page.locator('[data-portfolio-navigation] a[href="/contact/"]').click();await entered(page);
 const departed=await page.evaluate(()=>JSON.parse(sessionStorage.getItem('test-preview-departure')));
 expect(departed.resource).toBeNull();expect(departed.disposals).toBe(departed.acquisitions);closedRequests(departed);
 await expect(page.locator('canvas')).toHaveCount(1);await expect(page.locator('canvas[data-global-background-field]')).toHaveCount(1);
});

test('the selected native recording plays only while eligible and a pause click does not navigate',async({page})=>{
 await page.goto('/projects/xr-bending-active/');await entered(page);
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
 await page.evaluate(()=>addEventListener('pagehide',()=>sessionStorage.setItem('test-xr-preview-departure',JSON.stringify(document.querySelector('[data-xr-stage]').__xrStage.inspect())),{once:true}));
 await page.locator('[data-portfolio-navigation] a[href="/contact/"]').click();await entered(page);
 const departed=await page.evaluate(()=>JSON.parse(sessionStorage.getItem('test-xr-preview-departure')));expect(departed.resource).toBeNull();expect(departed.disposals).toBe(departed.acquisitions);closedRequests(departed);
 await expect(page.locator('canvas')).toHaveCount(1);await expect(page.locator('canvas[data-global-background-field]')).toHaveCount(1);
});

test('motion preference changes close active previews and preserve the same-frame fallback',async({page})=>{
 await openGrid(page);
 await expect(model(page)).toHaveAttribute('data-preview-phase','ready',{timeout:WAIT});
 await page.emulateMedia({reducedMotion:'reduce'});await expect(model(page).locator('canvas')).toHaveCount(0);
 closedRequests(await modelFacts(page));
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.goto('/projects/xr-bending-active/');await entered(page);
 await xrChapter(page,'adapt');
 await page.emulateMedia({reducedMotion:'reduce'});
 await expect(xrStage(page).locator('canvas')).toHaveCount(0);await expect(xrStage(page).locator('video[src]')).toHaveCount(0);
 await expect(xrStage(page).locator('[data-xr-native-phone="adapt"] img')).toBeVisible();await expect(page.locator('[data-xr-motion-toggle]')).toBeDisabled();
 const reduced=await xrFacts(page);expect(reduced.resource).toBeNull();expect(reduced.disposals).toBe(reduced.acquisitions);closedRequests(reduced);
 await page.emulateMedia({reducedMotion:'no-preference'});
 await xrChapter(page,'adapt');expect((await xrFacts(page)).acquisitions).toBeGreaterThan(reduced.acquisitions);closedRequests(await xrFacts(page));
});

test('failed optional model and video assets leave native links and truthful posters available',async({page})=>{
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
 await expect(page.locator('[data-model-poster]')).toBeVisible();closedRequests(await modelFacts(page));
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
