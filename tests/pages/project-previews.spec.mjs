import {test,expect} from '@playwright/test';
import {createServer} from 'node:http';
import {fileURLToPath} from 'node:url';
import {createPagesPreviewHandler} from '../../scripts/serve-pages.mjs';
import {WAIT,scenarioTimeout} from './case-helpers.mjs';

const model=page=>page.locator('[data-project-model-preview]');
const movie=page=>page.locator('[data-project-animation-preview]');
async function entered(page){
 await page.waitForFunction(()=>window.__site?.inspect().phase==='entered',null,{timeout:WAIT});
 await expect(page.locator('[data-site-loader]')).toBeHidden();
}
async function openGrid(page){await page.goto('/projects/');await entered(page);}
const modelFacts=page=>model(page).evaluate(node=>node.__projectModelPreview.inspect());
const movieFacts=page=>movie(page).evaluate(node=>node.__animationPreview.inspect());
function closedRequests(state){
 const ids=[...new Set(state.history.map(fact=>fact.id))];
 for(const id of ids){const facts=state.history.filter(fact=>fact.id===id);expect(facts.filter(fact=>fact.phase==='requested')).toHaveLength(1);expect(facts.filter(fact=>['ready','failed','cancelled'].includes(fact.phase))).toHaveLength(1);}
}

test('project cards are full-bleed squares and reveal their real title on hover or keyboard focus',async({page,isMobile})=>{
 await openGrid(page);
 const cards=page.locator('[data-project-tile]');await expect(cards).toHaveCount(2);
 for(const card of await cards.all()){
  const geometry=await card.evaluate(node=>{const rect=node.getBoundingClientRect(),media=node.querySelector('[data-project-model-preview],[data-project-animation-preview]').getBoundingClientRect();return{width:rect.width,height:rect.height,mediaWidth:media.width,mediaHeight:media.height,radius:parseFloat(getComputedStyle(node).borderRadius)};});
  expect(Math.abs(geometry.width-geometry.height)).toBeLessThan(1);expect(geometry.radius).toBeGreaterThan(0);
  expect(geometry.mediaWidth/geometry.width).toBeGreaterThan(.97);expect(geometry.mediaHeight/geometry.height).toBeGreaterThan(.97);
 }
 const link=page.locator('[data-project-card="bending-active"]'),title=link.locator('[data-project-card-title]');
 await expect(link).toHaveAccessibleName('Bending-Active Metal Panel Deformation');
 if(!isMobile){
  await page.mouse.move(0,0);await expect(title).toHaveCSS('opacity','0');
  await link.hover();await expect(title).toHaveCSS('opacity','1');
  await page.mouse.move(0,0);await expect(title).toHaveCSS('opacity','0');
 }
 await link.focus();await expect(title).toHaveCSS('opacity','1');
 const button=page.locator('[data-animation-toggle]');
 expect(await button.evaluate(node=>node.closest('a'))).toBeNull();
 expect(await button.evaluate(node=>{const rect=node.getBoundingClientRect();return rect.width>=44&&rect.height>=44;})).toBe(true);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
});

test('the real model loads only inside a visible card, sleeps at rest, and releases on exit and navigation',async({page})=>{
 test.setTimeout(scenarioTimeout(150000));
 const requests=[];page.on('request',request=>{if(/\.(glb|hdr)(?:\?|$)/.test(request.url()))requests.push(request.url());});
 await page.goto('/');await entered(page);
 expect(requests).toEqual([]);await expect(page.locator('canvas')).toHaveCount(0);
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
 await expect(page.locator('canvas')).toHaveCount(0);
});

test('the selected native recording plays only while eligible and a pause click does not navigate',async({page})=>{
 await page.goto('/');await entered(page);await movie(page).scrollIntoViewIfNeeded();
 await expect(movie(page)).toHaveAttribute('data-animation-state','playing',{timeout:WAIT});
 const video=page.locator('[data-animation-video]');
 expect(await video.evaluate(node=>node.muted&&node.loop&&node.playsInline&&!node.paused&&node.readyState>=2)).toBe(true);
 const initial=await video.evaluate(node=>node.currentTime);await expect.poll(()=>video.evaluate(node=>node.currentTime)).toBeGreaterThan(initial);
 const before=page.url();await page.getByRole('button',{name:'Pause animation',exact:true}).click();
 expect(page.url()).toBe(before);await expect(movie(page)).toHaveAttribute('data-animation-state','paused');
 expect(await video.getAttribute('src')).toBeNull();closedRequests(await movieFacts(page));
 await page.getByRole('button',{name:'Play animation',exact:true}).click();
 await expect(movie(page)).toHaveAttribute('data-animation-state','playing',{timeout:WAIT});
 await page.locator('[data-home-introduction] h1').scrollIntoViewIfNeeded();
 expect(await movie(page).evaluate(node=>{const rect=node.getBoundingClientRect();return rect.bottom<=0||rect.top>=innerHeight;})).toBe(true);
 await expect(video).not.toHaveAttribute('src',/.+/);
 expect((await movieFacts(page)).resource).toBeNull();closedRequests(await movieFacts(page));
 await page.goto('/projects/xr-bending-active/');await entered(page);
 const detail=page.locator('[data-xr-recording] [data-project-animation-preview]');
 await detail.scrollIntoViewIfNeeded();
 await expect(detail).toHaveAttribute('data-animation-state','playing',{timeout:WAIT});
 const detailVideo=detail.locator('[data-animation-video]');
 const detailControl=detail.locator('[data-animation-toggle]');
 const placement=await detail.evaluate(node=>{
  const button=node.querySelector('[data-animation-toggle]'),video=node.querySelector('[data-animation-video]');
  const controlRect=button.getBoundingClientRect(),videoRect=video.getBoundingClientRect();
  return{aboveFrame:controlRect.bottom<=videoRect.top,width:controlRect.width,height:controlRect.height,nestedInLink:!!button.closest('a')};
 });
 expect(placement.aboveFrame).toBe(true);expect(placement.width).toBeGreaterThanOrEqual(44);expect(placement.height).toBeGreaterThanOrEqual(44);expect(placement.nestedInLink).toBe(false);
 const detailUrl=page.url();
 await expect(detailControl).toHaveAccessibleName('Pause animation');await detailControl.click();
 expect(page.url()).toBe(detailUrl);await expect(detail).toHaveAttribute('data-animation-state','paused');
 await expect(detailVideo).not.toHaveAttribute('src',/.+/);closedRequests(await movieFacts(page));
 await expect(detailControl).toHaveAccessibleName('Play animation');await detailControl.click();
 await expect(detail).toHaveAttribute('data-animation-state','playing',{timeout:WAIT});expect(page.url()).toBe(detailUrl);
});

test('motion preference changes close active previews and preserve the same-frame fallback',async({page})=>{
 await openGrid(page);
 await expect(model(page)).toHaveAttribute('data-preview-phase','ready',{timeout:WAIT});
 await page.emulateMedia({reducedMotion:'reduce'});await expect(model(page).locator('canvas')).toHaveCount(0);
 closedRequests(await modelFacts(page));
 await page.emulateMedia({reducedMotion:'no-preference'});await movie(page).scrollIntoViewIfNeeded();
 await expect(movie(page)).toHaveAttribute('data-animation-state','playing',{timeout:WAIT});
 await page.emulateMedia({reducedMotion:'reduce'});
 await expect(model(page).locator('canvas')).toHaveCount(0);
 await expect(page.locator('[data-animation-video]')).not.toHaveAttribute('src',/.+/);
 await expect(page.locator('[data-animation-poster]')).toBeVisible();
 await expect(page.locator('[data-animation-toggle]')).toBeDisabled();
 closedRequests(await modelFacts(page));closedRequests(await movieFacts(page));
 await page.emulateMedia({reducedMotion:'no-preference'});
 await expect(movie(page)).toHaveAttribute('data-animation-state','playing',{timeout:WAIT});
});

test('failed optional model and video assets leave native links and truthful posters available',async({page})=>{
 // Native WebKit media can bypass Playwright routing. A real HTTP 404 from an
 // isolated server proves the failure without altering the audited artifact.
 const denied={model:0,video:0};let handler;
 const server=createServer((request,response)=>{
  const asset=request.url.split('?')[0];
  const kind=asset==='/assets/source-layers.glb'?'model':asset==='/assets/xr/background-preview.mp4'?'video':null;
  if(kind){denied[kind]++;response.writeHead(404,{'Content-Type':'text/plain','Cache-Control':'no-store'}).end('Unavailable test asset');return;}
  return handler(request,response);
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const port=server.address().port;
 handler=createPagesPreviewHandler({root:fileURLToPath(new URL('../../.pages-workspace/out/',import.meta.url)),port});
 try{
 await page.goto(`http://127.0.0.1:${port}/projects/`);await entered(page);
 await expect(model(page)).toHaveAttribute('data-preview-phase','failed',{timeout:WAIT});
 await expect(page.locator('[data-model-poster]')).toBeVisible();closedRequests(await modelFacts(page));
 await movie(page).scrollIntoViewIfNeeded();
 await expect(movie(page)).toHaveAttribute('data-animation-state','failed',{timeout:WAIT});
 await expect(page.locator('[data-animation-poster]')).toBeVisible();
 await expect(page.locator('canvas')).toHaveCount(0);
 expect(denied.model).toBeGreaterThan(0);expect(denied.video).toBeGreaterThan(0);
 closedRequests(await modelFacts(page));closedRequests(await movieFacts(page));
 await page.locator('[data-project-card="xr-bending-active"]').click();await entered(page);
 await expect(page.locator('h1')).toHaveText('An Extended-Reality App Using Motion Capture for Bending-Active Structure');
 }finally{
  try{await page.goto('about:blank');}finally{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
 }
});
