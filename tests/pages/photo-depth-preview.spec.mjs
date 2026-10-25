import {test,expect} from '@playwright/test';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';

// Nonpublishable numerical-depth experiment. This synthetic document is not a
// production route, and its captures are evidence for visual review, not a
// claim that displaced pixels reconstruct hidden geometry or improve quality.
test.use({video:'on'}); // Native interaction continuity; PNGs retain device-scale detail.
const fixture=new URL('../fixtures/photo-depth/',import.meta.url);
const provenance=JSON.parse(await readFile(new URL('provenance.json',fixture),'utf8'));
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const html=`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Isolated numerical-depth preview</title><style>html{scroll-behavior:auto}body{margin:0;background:#e8e6df;color:#202020;font:16px/1.5 system-ui}header{height:110px;padding:12px 16px;box-sizing:border-box}h1{font-size:18px;margin:0}#preview{width:min(662px,calc(100% - 32px));margin:0 auto}footer{height:140vh;padding:20px}button,label{min-height:44px}*{box-sizing:border-box}</style><header><h1>Isolated estimated-depth preview</h1><p>Diagnostic only; original photograph and estimated relative depth.</p></header><main id="preview"></main><footer>Native scroll space. This experiment is not part of the published portfolio.</footer><script type="module">import {initPhotoDepthPreview} from '/photo-depth/preview.mjs';try{window.preview=await initPhotoDepthPreview({host:document.querySelector('#preview'),imageUrl:${JSON.stringify(provenance.source.url)},depthUrl:'/photo-depth/depth.bin',provenanceUrl:'/photo-depth/provenance.json'});}catch(error){window.previewError=String(error);}</script></html>`;

async function frames(page,count=5){await page.evaluate(n=>new Promise(resolve=>{const next=()=>{if(--n<=0)resolve();else requestAnimationFrame(next);};requestAnimationFrame(next);}),count);}
async function snapshot(page,rows,phase){const value=await page.evaluate(()=>({inspect:window.preview?.inspect(),error:window.previewError??null,y:scrollY,viewport:{width:innerWidth,height:innerHeight}}));rows.push({phase,...value});expect(value.error).toBeNull();return value;}
async function png(page,info,name){const path=info.outputPath(name+'.png');await page.screenshot({path,scale:'device'});await info.attach(name,{path,contentType:'image/png'});}
function inputFacts(point){
 const state=window.preview.inspect(),target=document.elementFromPoint(point.x,point.y),ancestors=[];
 for(let node=target;node&&ancestors.length<5;node=node.parentElement)ancestors.push({tag:node.tagName,id:node.id,class:String(node.className).slice(0,160),touchAction:getComputedStyle(node).touchAction});
 return{y:scrollY,scrollHeight:document.scrollingElement.scrollHeight,clientHeight:document.scrollingElement.clientHeight,viewport:{width:innerWidth,height:innerHeight},point,ancestors,draws:state.draws,pose:state.pose,visible:state.visible,canvasVisible:state.canvasVisible,lastEvent:state.lastEvent,events:window.__photoInput?.events.slice()??[]};
}
async function touchScroll(cdp,page,distance,diagnostic){
 const viewport=page.viewportSize(),params={x:viewport.width-4,y:viewport.height*.7,yDistance:distance,gestureSourceType:'touch',preventFling:true};
 const row={params,before:await page.evaluate(inputFacts,params),hostStarted:performance.now()};diagnostic.commands.push(row);
 await cdp.send('Input.synthesizeScrollGesture',params);row.hostCompleted=performance.now();row.after=await page.evaluate(inputFacts,params);
}
async function pointerSweep(page,from,to,diagnostic){
 const started=performance.now(),row={from,to,requestedDurationMs:1000,steps:20,hostStarted:started,scope:'Paced diagnostic gesture for video, not a performance benchmark.'};diagnostic.sweeps.push(row);
 for(let i=1;i<=20;i++){await new Promise(resolve=>setTimeout(resolve,Math.max(0,started+i*50-performance.now())));await page.mouse.move(from.x+(to.x-from.x)*i/20,from.y+(to.y-from.y)*i/20);}
 row.hostCompleted=performance.now();row.actualDurationMs=row.hostCompleted-started;
}

test('isolated numerical depth preserves original source and responds only to native input',async({page,isMobile},info)=>{
 const rows=[],errors=[],diagnostic={sweeps:[],commands:[],poll:[],events:[]};let primary,cdp;
 page.on('pageerror',error=>errors.push(String(error)));
 try{
  await page.route('**/photo-depth/**',async route=>{
   const path=new URL(route.request().url()).pathname;
   if(path==='/photo-depth/')return route.fulfill({contentType:'text/html',body:html});
   const name=path.slice('/photo-depth/'.length),types={'preview.mjs':'text/javascript','depth.bin':'application/octet-stream','provenance.json':'application/json'};
   if(!Object.hasOwn(types,name))return route.abort();
   return route.fulfill({contentType:types[name],body:await readFile(new URL(name,fixture))});
  });
  const source=await page.request.get(provenance.source.url);expect(source.status()).toBe(200);expect(hash(await source.body())).toBe(provenance.source.sha256);
  expect(hash(await readFile(new URL('depth.bin',fixture)))).toBe(provenance.depth.sha256);
  await page.goto('/photo-depth/');
  await expect.poll(()=>page.evaluate(()=>!!window.preview||window.previewError)).toBe(true);
  const initial=await snapshot(page,rows,'neutral-shader');
  expect(initial.inspect.ready).toBe(true);expect(initial.inspect.state).toBe('ready');expect(initial.inspect.renderer.context).toBe('webgl2');expect(initial.inspect.canvasVisible).toBe(true);expect(initial.inspect.pose).toEqual({x:0,y:0});
  expect(initial.inspect.source.sha256).toBe(provenance.source.sha256);expect(initial.inspect.depth.sha256).toBe(provenance.depth.sha256);
  expect(initial.inspect.renderer.width).toBe(662);expect(initial.inspect.renderer.height).toBe(373);
  expect(initial.inspect.bounds.canvas).toEqual(initial.inspect.bounds.image);
  const image=page.locator('#preview img');await expect(image).toHaveCount(1);
  const original=await image.evaluate(node=>({url:new URL(node.currentSrc).pathname,width:node.naturalWidth,height:node.naturalHeight}));
  expect(original).toEqual({url:provenance.source.url,width:662,height:373});
  await png(page,info,'neutral-shader');
  await frames(page);const idle=await snapshot(page,rows,'five-native-raf-idle');expect(idle.inspect.draws).toBe(initial.inspect.draws);
  const toggle=page.locator('[data-depth-static]');await toggle.check();
  const staticOriginal=await snapshot(page,rows,'native-static-original');expect(staticOriginal.inspect.state).toBe('static');expect(staticOriginal.inspect.canvasVisible).toBe(false);expect(staticOriginal.inspect.originalComplete).toBe(true);expect(staticOriginal.inspect.bounds.image).toEqual(initial.inspect.bounds.image);
  await png(page,info,'static-original');await frames(page);expect((await snapshot(page,rows,'static-idle')).inspect.draws).toBe(staticOriginal.inspect.draws);
  await toggle.uncheck();
  const stage=page.locator('[data-depth-stage]'),box=await stage.boundingBox();expect(box).not.toBeNull();
  if(isMobile)await page.evaluate(()=>{
   const events=[],types=['touchstart','touchmove','touchend','touchcancel','pointerdown','pointermove','pointerup','pointercancel','scroll'];
   const observe=event=>{const touch=event.touches?.[0]??event.changedTouches?.[0];events.push({type:event.type,timeStamp:event.timeStamp,trusted:event.isTrusted,x:touch?.clientX??event.clientX??null,y:touch?.clientY??event.clientY??null,scrollY,defaultPrevented:event.defaultPrevented,target:event.target?.tagName??'window'});if(events.length>32)events.shift();};
   for(const type of types)window.addEventListener(type,observe,{passive:true});
   window.__photoInput={events,dispose(){for(const type of types)window.removeEventListener(type,observe);}};
  });
  let preScroll;
  if(!isMobile){
   await page.mouse.move(box.x+box.width*.1,box.y+box.height*.5);const left=await snapshot(page,rows,'native-pointer-left');expect(left.inspect.pose.x).toBeLessThan(0);await png(page,info,'pointer-left');
   await pointerSweep(page,{x:box.x+box.width*.1,y:box.y+box.height*.5},{x:box.x+box.width*.9,y:box.y+box.height*.5},diagnostic);const right=await snapshot(page,rows,'native-pointer-right');expect(right.inspect.pose.x).toBeGreaterThan(0);await png(page,info,'pointer-right');
   await pointerSweep(page,{x:box.x+box.width*.9,y:box.y+box.height*.5},{x:box.x+box.width*.5,y:box.y+box.height*.5},diagnostic);
   await page.mouse.move(2,30);expect((await snapshot(page,rows,'native-pointer-leave-neutral')).inspect.pose).toEqual({x:0,y:0});
   preScroll=await snapshot(page,rows,'before-native-wheel');await page.mouse.wheel(0,100);
  }else{
   cdp=await page.context().newCDPSession(page);preScroll=await snapshot(page,rows,'before-native-touch-scroll');await touchScroll(cdp,page,-100,diagnostic);
  }
  await expect.poll(async()=>{const value=await page.evaluate(()=>{const state=window.preview.inspect();return{y:scrollY,draws:state.draws,pose:state.pose,visible:state.visible,canvasVisible:state.canvasVisible,lastEvent:state.lastEvent};});diagnostic.poll.push(value);if(diagnostic.poll.length>12)diagnostic.poll.shift();return value.y>0&&value.draws>preScroll.inspect.draws;}).toBe(true);
  const moved=await snapshot(page,rows,'native-scroll-depth');expect(moved.inspect.pose.y).toBeGreaterThan(0);expect(moved.inspect.draws).toBeGreaterThan(preScroll.inspect.draws);
  const visibleStage=moved.inspect.bounds.stage;expect(visibleStage.top).toBeGreaterThanOrEqual(0);expect(visibleStage.bottom).toBeLessThanOrEqual(moved.viewport.height);expect(visibleStage.left).toBeGreaterThanOrEqual(0);expect(visibleStage.right).toBeLessThanOrEqual(moved.viewport.width);expect(moved.inspect.canvasVisible).toBe(true);await png(page,info,'native-scroll-depth');
  if(isMobile){await touchScroll(cdp,page,100,diagnostic);}else await page.mouse.wheel(0,-10000);
  await expect.poll(()=>page.evaluate(()=>scrollY)).toBe(0);
  await expect.poll(()=>page.evaluate(()=>window.preview.inspect().pose)).toEqual({x:0,y:0});
  const returned=await snapshot(page,rows,'native-scroll-return-neutral');await png(page,info,'returned-neutral-shader');await frames(page);expect((await snapshot(page,rows,'returned-idle')).inspect.draws).toBe(returned.inspect.draws);
  await page.emulateMedia({reducedMotion:'reduce'});await expect.poll(()=>page.evaluate(()=>{const state=window.preview.inspect();return state.state==='static'&&!state.canvasVisible;})).toBe(true);
  const reduced=await snapshot(page,rows,'reduced-original-fallback');expect(reduced.inspect.policy.reduced).toBe(true);expect(reduced.inspect.canvasVisible).toBe(false);expect(reduced.inspect.originalComplete).toBe(true);await png(page,info,'reduced-original-fallback');
  await frames(page);expect((await snapshot(page,rows,'reduced-idle')).inspect.draws).toBe(reduced.inspect.draws);
  for(const row of rows){
   const state=row.inspect;expect(state.failure).toBeNull();
   for(const probe of Object.values(state.sampleProbes)){expect(Math.abs(probe.offsetSourcePixels.x)).toBeLessThanOrEqual(6);expect(Math.abs(probe.offsetSourcePixels.y)).toBeLessThanOrEqual(3);}
   expect(Math.abs(state.sampleProbes.border.offsetSourcePixels.x)).toBe(0);expect(Math.abs(state.sampleProbes.border.offsetSourcePixels.y)).toBe(0);
  }
  expect(errors).toEqual([]);
 }catch(error){primary=error;throw error;}finally{
  let cleanupError=primary;
  for(const cleanup of [async()=>{if(isMobile)diagnostic.events=await page.evaluate(()=>{const value=window.__photoInput?.events.slice()??[];window.__photoInput?.dispose();return value;});},async()=>{const path=info.outputPath('photo-depth-preview.json');await writeFile(path,JSON.stringify({scope:'Synthetic nonpublishable numerical-depth preview; finite native touch scroll with preventFling, not momentum robustness, production or quality approval.',provenance,rows,errors,diagnostic},null,2));await info.attach('photo-depth-preview',{path,contentType:'application/json'});},()=>cdp?.detach()])try{await cleanup();}catch(error){cleanupError??=error;}
  if(!primary&&cleanupError)throw cleanupError;
 }
});
