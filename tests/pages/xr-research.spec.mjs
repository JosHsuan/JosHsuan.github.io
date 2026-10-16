import {test,expect} from '@playwright/test';
import {createServer} from 'node:http';
import {fileURLToPath} from 'node:url';
import {createPagesPreviewHandler} from '../../scripts/serve-pages.mjs';
import {WAIT,frames} from './case-helpers.mjs';

const stage=page=>page.locator('[data-xr-stage]');
const control=page=>page.locator('[data-xr-model-control]');
const video=(page,id)=>stage(page).locator(`[data-xr-stage-video="${id}"]`);
const facts=page=>stage(page).evaluate(node=>node.__xrStage.inspect());
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
}
async function settled(page,chapter){
 await page.waitForFunction(chapter=>{const state=document.querySelector('[data-xr-stage]')?.__xrStage?.inspect();return state?.chapter===chapter&&state.camera.settled&&state.informationWindows.settled&&!state.lifecycle.scheduled;},chapter,{timeout:WAIT});
 await frames(page,2);
}
async function scrollChapter(page,chapter){
 await page.locator(`[data-xr-chapter="${chapter}"]`).evaluate(node=>node.scrollIntoView({block:'start',behavior:'instant'}));
 await settled(page,chapter);
 await viewportFits(page);
}
async function modelReady(page,chapter='overview'){
 await page.waitForFunction(chapter=>{const state=document.querySelector('[data-xr-stage]')?.__xrStage?.inspect();return state?.phase==='ready'&&state.chapter===chapter&&state.resource?.chapter===chapter&&state.resource.mode==='webgl-model'&&state.resource.successfulPaint;},chapter,{timeout:WAIT});
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

test('one transparent background source stage preserves geometry, stays idle, and follows real hit-based keyboard and pointer inspection',async({page,isMobile,browserName})=>{
 const requests=[],errors=[];page.on('request',request=>{if(/\.(glb|hdr)(?:\?|$)/.test(request.url()))requests.push(request.url());});page.on('pageerror',error=>errors.push(error.message));
 await enter(page);await modelReady(page);
 await expect(stage(page)).toHaveCSS('position','fixed');await expect(stage(page).locator('canvas')).toHaveCount(1);
 await expect(page.locator('canvas[data-global-background-field]')).toHaveCount(1);await expect(page.locator('canvas')).toHaveCount(2);
 const initial=await facts(page),source=initial.resource;closed(initial);
 expect(source.sourceRevision).toBe('82e9679c1e47e93cc1a7bbea588eb0f2c8af142d6f7facc6fe5ffaa6148fdc04');expect(source.vertices).toBe(96312);expect(source.triangles).toBe(190320);
 expect(source.sourceUnits).toBe('Millimeters');expect(source.webUnits).toBe('Metres');expect(source.sourceTransforms.every(value=>value.scale.every(n=>n===1))).toBe(true);
 expect(source.surface.calls).toBe(1);expect(source.surface.clearAlpha).toBe(0);expect(source.surface.budget.budget.pixels).toBeLessThanOrEqual(524288);
 expect(source.pose.near).toBeGreaterThan(0);expect(source.pose.far).toBeGreaterThan(source.pose.near);expect(source.pose.slot.x-source.pose.slot.width/2).toBeGreaterThanOrEqual(0);expect(source.pose.slot.x+source.pose.slot.width/2).toBeLessThanOrEqual(1);
 const idle={frames:initial.frames,draws:source.surface.draws};await frames(page,8);const afterIdle=await facts(page);expect({frames:afterIdle.frames,draws:afterIdle.resource.surface.draws}).toEqual(idle);
 await scrollChapter(page,'method');await modelReady(page,'method');await control(page).evaluate(node=>node.focus({preventScroll:true}));await control(page).press('ArrowRight');
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
 expect(final.acquisitions).toBe(1);expect(requests).toEqual([expect.stringContaining('/assets/xr/xr-research-assembly.glb')]);expect(errors).toEqual([]);
});

test('native scrolling selects all three complete recordings in the same scene and pause preserves native media time',async({page})=>{
 const errors=[];page.on('pageerror',error=>errors.push(error.message));await enter(page);await modelReady(page);
 const originalCanvas=await stage(page).locator('canvas').elementHandle();
 await expect(page.locator('[data-phone-stage],[data-phone-front-toggle]')).toHaveCount(0);
 for(const [id,duration]of[['adapt',13],['assemble',24.96],['join',20.3]]){
  await phoneReady(page,id);const state=await facts(page);closed(state);expect(state.acquisitions).toBe(1);expect(state.resource.media.reason).toBeNull();expect(state.resource.fallbackReason).toBeNull();
  await expect(stage(page).locator('canvas')).toHaveCount(1);await expect(stage(page).locator('video[src]')).toHaveCount(1);
  expect(await originalCanvas.evaluate(node=>node.isConnected&&node===document.querySelector('[data-xr-stage] canvas'))).toBe(true);
  expect(state.resource.surface.budget.budget.pixels).toBeLessThanOrEqual(393216);expect(await video(page,id).evaluate(node=>node.muted&&node.loop&&node.playsInline&&!node.paused)).toBe(true);expect(await video(page,id).evaluate(node=>node.duration)).toBeCloseTo(duration,2);
  const first=await stage(page).locator('canvas').screenshot(),count=state.resource.media.frames;
  await expect.poll(async()=>(await facts(page)).resource.media.frames).toBeGreaterThan(count+2);expect((await stage(page).locator('canvas').screenshot()).equals(first)).toBe(false);
 }
 const url=page.url();await page.getByRole('button',{name:'Pause recording',exact:true}).click();
 await expect.poll(()=>video(page,'join').evaluate(node=>node.paused)).toBe(true);await settled(page,'join');const frozen=await facts(page);await frames(page,8);const still=await facts(page);
 expect(still.resource.media.position).toBe(frozen.resource.media.position);expect(still.resource.media.frames).toBe(frozen.resource.media.frames);expect(still.resource.surface.draws).toBe(frozen.resource.surface.draws);
 const resume=await video(page,'join').evaluateHandle(node=>{const events=[];const record=event=>events.push({time:node.currentTime,trusted:event.isTrusted});node.addEventListener('play',record,{once:true});return{events,dispose(){node.removeEventListener('play',record);}};});
 try{
  await page.getByRole('button',{name:'Play recording',exact:true}).click();await expect.poll(()=>resume.evaluate(value=>value.events.length)).toBe(1);
  const played=await resume.evaluate(value=>value.events[0]),duration=await video(page,'join').evaluate(node=>node.duration),delta=Math.abs(played.time-frozen.resource.media.position);
  expect(played.trusted).toBe(true);expect(Math.min(delta,Math.abs(duration-delta))).toBeLessThan(.3);await expect.poll(async()=>(await facts(page)).resource.media.frames).toBeGreaterThan(frozen.resource.media.frames);expect(page.url()).toBe(url);
 }finally{await resume.evaluate(value=>value.dispose());await resume.dispose();}
 const controls=await page.locator('[data-xr-scene-controls]').evaluate(node=>({rect:node.getBoundingClientRect().toJSON(),buttons:[...node.querySelectorAll('button')].map(button=>button.getBoundingClientRect().toJSON())})),viewport=page.viewportSize();
 expect(controls.rect.left).toBeGreaterThanOrEqual(0);expect(controls.rect.top).toBeGreaterThanOrEqual(0);expect(controls.rect.right).toBeLessThanOrEqual(viewport.width);expect(controls.rect.bottom).toBeLessThanOrEqual(viewport.height);expect(controls.buttons.every(rect=>rect.width>=44&&rect.height>=44)).toBe(true);
 await scrollChapter(page,'overview');await modelReady(page);await expect(stage(page).locator('video[src]')).toHaveCount(0);expect((await facts(page)).resource.media.stage).toBeNull();expect((await facts(page)).acquisitions).toBe(1);expect(errors).toEqual([]);
});

test('Reduced Motion preserves the selected source posters, native reading and recording links and cancels an active enhancement',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});const requests=[];page.on('request',request=>{if(/\.(glb|mp4)(?:\?|$)/.test(request.url()))requests.push(request.url());});
 await enter(page);await expect(stage(page).locator('[data-xr-model-poster]')).toBeVisible();await expect(stage(page).locator('canvas')).toHaveCount(0);
 await scrollChapter(page,'method');await nativeArrowScroll(page);
 for(const id of ['adapt','assemble','join']){await scrollChapter(page,id);await expect(stage(page).locator(`[data-xr-native-phone="${id}"] img`)).toBeVisible();await expect(page.locator(`[data-xr-recording="${id}"] a[href="/assets/xr/${id}-interface.mp4"]`)).toBeVisible();}
 expect(requests).toEqual([]);await expect(stage(page).locator('video[src]')).toHaveCount(0);
 await page.emulateMedia({reducedMotion:'no-preference'});await phoneReady(page,'join');await page.emulateMedia({reducedMotion:'reduce'});
 await expect(stage(page).locator('canvas')).toHaveCount(0);await expect(stage(page).locator('video[src]')).toHaveCount(0);await expect(stage(page).locator('[data-xr-native-phone="join"] img')).toBeVisible();
 const state=await facts(page);expect(state.resource).toBeNull();expect(state.disposals).toBe(state.acquisitions);closed(state);
});

test('unavailable WebGL and genuine context loss retain native recording playback and model fallback keeps reading keys native',async({page,browser})=>{
 await page.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return /^webgl/.test(type)?null:original.call(this,type,...args);};});
 const errors=[];page.on('pageerror',error=>errors.push(error.message));await enter(page);
 await expect.poll(async()=>(await facts(page)).phase).toBe('ready');expect((await facts(page)).resource.mode).toBe('poster');await expect(stage(page).locator('canvas')).toHaveCount(0);await expect(stage(page).locator('[data-xr-model-poster]')).toBeVisible();
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
  await enter(page,`http://127.0.0.1:${port}`);await expect(stage(page)).toHaveAttribute('data-research-phase','failed',{timeout:WAIT});await expect(stage(page).locator('[data-xr-model-poster]')).toBeVisible();closed(await facts(page));const modelCount=denied.model;expect(modelCount).toBeGreaterThan(0);await frames(page,8);expect(denied.model).toBe(modelCount);
  denyModel=false;await enter(page,`http://127.0.0.1:${port}`);await modelReady(page);await scrollChapter(page,'adapt');
  await expect.poll(async()=>{const r=(await facts(page)).resource;return r?.media.stage==='adapt'&&!r.media.pending&&r.mode==='poster'&&!!r.media.reason;}).toBe(true);
  await expect(stage(page).locator('[data-xr-native-phone="adapt"] img')).toBeVisible();await expect(stage(page).locator('video[src]')).toHaveCount(0);closed(await facts(page));const mediaCount=denied.media;expect(mediaCount).toBeGreaterThan(0);await frames(page,8);expect(denied.media).toBe(mediaCount);
  await expect(page.locator('#xr-adapt a[href="/assets/xr/adapt-interface.mp4"]')).toBeVisible();await scrollChapter(page,'overview');await modelReady(page);await page.getByRole('link',{name:'← All projects',exact:true}).click();
  await page.waitForFunction(()=>window.__site?.inspect().phase==='entered',null,{timeout:WAIT});await expect(page.locator('[data-project-card]')).toHaveCount(2);
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
