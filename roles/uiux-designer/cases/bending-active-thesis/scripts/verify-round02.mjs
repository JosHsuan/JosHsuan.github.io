import {createRequire} from 'node:module';
import {mkdir, writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const require = createRequire(new URL('../../../../../package.json', import.meta.url));
const {chromium, webkit} = require('@playwright/test');
const sharp = createRequire(require.resolve('next/package.json'))('sharp');
const executablePath = 'C:/Users/JosHsuan/AppData/Local/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-win64/chrome-headless-shell.exe';
const output = 'D:/JosHsuan_Website/_work/bending-active-thesis/round-02/verification';
const origin = 'http://127.0.0.1:4184/';
const chapters = ['overview','form','system','pattern','make','validation','credits'];
const selected = process.argv.find(arg=>arg.startsWith('--profile='))?.split('=')[1];
const checkFilter = process.argv.find(arg=>arg.startsWith('--check='))?.slice('--check='.length);
const profiles = selected ? [selected] : ['chromium','webkit','mobile'];
assert(profiles.every(profile=>['chromium','webkit','mobile'].includes(profile)), 'Unknown browser profile');
const reportPath = output + '/browser-round02' + (selected ? '-'+selected : '') + (checkFilter ? '-'+checkFilter.replace(/[^a-z0-9]+/gi,'-') : '') + '.json';
const results = [], failures = [], metrics = [], pixels = [];
const started = new Date().toISOString();
const artifactHtml = await (await fetch(origin)).text();
const artifactHTMLSHA256 = createHash('sha256').update(artifactHtml).digest('hex');
await mkdir(output, {recursive:true});
async function save() {
  await writeFile(reportPath,JSON.stringify({started,verifiedAt:new Date().toISOString(),artifactHTMLSHA256,profiles,checkFilter,results,failures,metrics,pixels,
    limits:['390px Chromium device emulation; no physical phone tested','Firefox not part of this matrix','Geometry fidelity uses the separate all-vertex source comparison; browser checks verify the handed-off model, placement and effects','Local review only; no publication or structural-analysis claim']},null,2)+'\n');
}
async function check(name, fn, page) {
  if(checkFilter && !name.includes(checkFilter)) return;
  try {await fn();results.push({name,passed:true});console.log('PASS '+name);}
  catch(error) {const failure={name,error:error.stack??error.message};if(page)failure.observation=await page.evaluate(()=>({scrollY,story:window.__story?.inspect(),scene:window.__thesis?.inspect()})).catch(()=>null);failures.push(failure);console.log('FAIL '+name+' '+error.message.slice(0,250));if(page)await page.screenshot({path:output+'/failure-'+name.replace(/[^a-z0-9]+/gi,'-')+'.png'}).catch(()=>{});}
  await save();
}
const near = (a,b,epsilon=1e-7) => assert(Math.abs(a-b)<=epsilon, a+' differs from '+b);
const state = page => page.evaluate(()=>window.__thesis.inspect());
const waitReady = page => page.waitForFunction(()=>window.__thesis?.inspect().ready,null,{timeout:60000});
async function settle(page) {
  // WebKit can defer a native scroll event beyond scrollTo/input resolution.
  // Observe the resulting scheduled response, not the previous settled state.
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  await page.waitForFunction(()=>window.__story?.inspect().settled && !window.__story.inspect().scheduled,null,{timeout:15000});
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
}
async function chapter(page,id,phase=.46) {
  await page.evaluate(({id,phase})=>{const el=document.getElementById(id),top=el.getBoundingClientRect().top+scrollY;scrollTo({top:top+el.offsetHeight*phase-innerHeight*.45,behavior:'instant'});},{id,phase});
  await settle(page);
}
async function override(page, values) {
  const before=(await state(page)).frames;
  await page.evaluate(values=>window.__thesis.setOverrides(values),values);
  await page.waitForFunction(frames=>window.__thesis.inspect().frames>frames,before,{timeout:20000});
}
async function capture(page,name) {
  return page.locator('canvas').screenshot({path:output+'/'+name+'.png',timeout:30000});
}
async function delta(a,b,rect) {
  const first=await sharp(a).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  const second=await sharp(b).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  assert.equal(first.info.width,second.info.width);assert.equal(first.info.height,second.info.height);
  const {width,height,channels}=first.info;
  const x0=Math.max(0,Math.floor(rect?.left??0)),y0=Math.max(0,Math.floor(rect?.top??0));
  const x1=Math.min(width,Math.ceil(rect?.right??width)),y1=Math.min(height,Math.ceil(rect?.bottom??height));
  let sum=0,changed=0,count=0,max=0;
  for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){
    const offset=(y*width+x)*channels;
    const d=Math.abs(first.data[offset]-second.data[offset])+Math.abs(first.data[offset+1]-second.data[offset+1])+Math.abs(first.data[offset+2]-second.data[offset+2]);
    sum+=d;max=Math.max(max,d);if(d>3)changed++;count++;
  }
  return {pixels:count,changed,meanRGB:count?sum/(count*3):0,maxRGBSum:max};
}
async function resetPointer(page) {await page.evaluate(()=>window.dispatchEvent(new Event('blur')));await settle(page);}
async function assertReadable(page) {
  assert.equal(await page.locator('[data-story-chapter]').count(),7);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'horizontal overflow');
  const hidden=await page.locator('[data-story-panel]').evaluateAll(elements=>elements.filter(el=>{const s=getComputedStyle(el);return s.display==='none'||s.visibility==='hidden'||Number(s.opacity)<.99;}).length);
  assert.equal(hidden,0,'a semantic panel became hidden');
}

for(const profile of profiles) {
  const browser=await(profile==='webkit'?webkit:chromium).launch(profile==='webkit'?{headless:true}:{headless:true,executablePath});
  const context=await browser.newContext(profile==='mobile'?{viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true}:{viewport:{width:1440,height:1000},deviceScaleFactor:1});
  const page=await context.newPage(),errors=[],requests=[];
  page.setDefaultTimeout(15000);
  page.on('pageerror',error=>errors.push(error.message));
  page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
  page.on('request',request=>requests.push(request.url()));
  try {
    await page.goto(origin);await waitReady(page);await settle(page);
    await page.evaluate(()=>window.__round02Canvas=document.querySelector('canvas'));
    await check(profile+'/source shell and 50 real base objects in one scene',async()=>{
      const meta=await(await context.request.get(origin+'assets/source-layers.json')).json();
      assert.equal(meta.revision,'ff112b90be104cca7e3705b5eee481ba3973d25e2f3d4a7350faa2f732cae47e');
      assert.equal(meta.triangles,227521);assert.equal(meta.vertices,172789);
      const lower=meta.layers.find(layer=>layer.id==='base-lower'),upper=meta.layers.find(layer=>layer.id==='base-upper');
      assert.equal(lower.sourceObjects.length,13);assert.equal(upper.sourceObjects.length,37);
      assert(lower.sourceObjects.every(object=>object.sourceGroups.includes(78)));assert(upper.sourceObjects.every(object=>object.sourceGroups.includes(77)));
      const baseIds=[...lower.sourceObjects,...upper.sourceObjects].map(object=>object.sourceObjectId);assert.equal(new Set(baseIds).size,50);
      const s=await state(page);assert.equal(s.source.triangles,227521);assert.equal(s.source.sourceObjects,51);assert.equal(s.layers.length,3);
      assert.equal(s.layers.reduce((sum,layer)=>sum+layer.triangles,0),227521);assert(s.layers.every(layer=>layer.visible));
      assert.equal(await page.locator('canvas').count(),1);
      const box=await page.locator('canvas').boundingBox(),view=page.viewportSize();near(box.width,view.width);near(box.height,view.height);
      assert.equal(s.compositor.passes,2);assert.equal(s.compositor.requestedSamples,2);assert.equal(s.compositor.depthResolve,true);assert(s.renderer.calls>=4,'scene+composite calls missing');
      await page.evaluate(()=>window.__round02Canvas=document.querySelector('canvas'));
      await assertReadable(page);
    },page);
    await check(profile+'/native input accelerates, decelerates and settles without an idle loop',async()=>{
      await chapter(page,'form');await resetPointer(page);
      const begin=await page.evaluate(()=>performance.now());
      const beforeY=await page.evaluate(()=>scrollY);
      if(profile==='mobile'){
        const session=await context.newCDPSession(page);
        await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:195,y:620}]});
        for(let y=580;y>=300;y-=40){await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:195,y}]});await page.waitForTimeout(25);}
        await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await session.detach();
      }else await page.mouse.wheel(0,260);
      // Input dispatch resolves before the browser necessarily commits scrolling.
      // Wait for actual document movement before observing response settlement.
      await page.waitForFunction(y=>scrollY>y,beforeY);
      await settle(page);
      assert(await page.evaluate(()=>scrollY)>beforeY,'native scroll did not move');
      const history=await page.evaluate(since=>window.__story.inspect().history.filter(frame=>frame.time>since),begin);
      metrics.push({profile,responseHistory:history});
      assert(history.length>=4,'too few actual response frames');
      assert(history.some(frame=>Math.abs(frame.nativeU-frame.visualU)>.0001),'no visible visual lag');
      const speeds=history.map(frame=>Math.abs(frame.velocity)),peak=Math.max(...speeds),peakAt=speeds.indexOf(peak);
      assert(peak>.005,'response energy too small');
      assert(speeds.slice(0,peakAt+1).some((v,i,a)=>i>0&&v>a[i-1]+.0001),'no measured acceleration');
      assert(speeds.slice(peakAt+1).some(v=>v<peak*.5),'no measured deceleration');
      assert(history.at(-1).settled);near(history.at(-1).nativeU,history.at(-1).visualU,0);
      const start=(await state(page)).frames;await page.waitForTimeout(500);assert.equal((await state(page)).frames,start,'renderer kept drawing at rest');
      const y=await page.evaluate(()=>scrollY);await page.keyboard.press('PageDown');await page.waitForFunction(previous=>scrollY>previous,y);await settle(page);assert(await page.evaluate(()=>scrollY)>y,'keyboard reading did not move');
    },page);
    await check(profile+'/seven designed holds, actual separation, reverse boundaries and fast jumps',async()=>{
      const snapshots=[];
      for(const [index,id] of chapters.entries()){
        await chapter(page,id);const s=await state(page);snapshots.push({id,state:s});
        near(s.stageU,(index+.5)/7,1e-6);assert.equal(s.chapterId,id);assert.equal(await page.evaluate(()=>document.querySelector('canvas')===window.__round02Canvas),true);
        await assertReadable(page);
        if(id==='system'){near(s.elements.separationWeight,1);near(s.layers.find(layer=>layer.id==='shell').position[1]-s.layers.find(layer=>layer.id==='shell').restPosition[1],.24);}
        if(['form','make','credits'].includes(id))assert(s.layers.every(layer=>layer.position.every((value,axis)=>Math.abs(value-layer.restPosition[axis])<1e-12)));
        await page.screenshot({path:output+'/'+profile+'-hold-'+id+'.png'});
      }
      for(const index of [1,2,3,4,5,6,5,4,3,2,1]){
        await page.evaluate(id=>{const el=document.getElementById(id);scrollTo({top:el.getBoundingClientRect().top+scrollY-innerHeight*.45,behavior:'instant'});},chapters[index]);
        await settle(page);const s=await state(page);assert(Number.isFinite(s.stageU));assert(s.layers.every(layer=>layer.position.every(Number.isFinite)));
        await assertReadable(page);
      }
      await chapter(page,'system');const system=(await state(page)).elements;await chapter(page,'credits');await chapter(page,'system');assert.deepEqual((await state(page)).elements,system);
      assert.equal(requests.filter(url=>url.endsWith('/source-layers.glb')).length,1);assert.equal(requests.filter(url=>url.endsWith('/studio-small.hdr')).length,1);
      metrics.push({profile,holds:snapshots});
    },page);
    await check(profile+'/fixed-stage focus rack, light quality and sharp reduced path',async()=>{
      await chapter(page,'system');await resetPointer(page);
      await override(page,{stageU:2.5/7,visualU:2.28/7});const a=await state(page);
      await override(page,{stageU:2.5/7,visualU:2.6/7});const b=await state(page);
      assert.deepEqual(b.pose.position,a.pose.position);assert.deepEqual(b.pose.target,a.pose.target);near(b.pose.focalLengthMm,a.pose.focalLengthMm);
      assert(Math.abs(b.compositor.focusDistanceM-a.compositor.focusDistanceM)>.05,'no actual focus transfer in stationary hold');
      await page.getByLabel('Visual detail').selectOption('light');await page.waitForFunction(()=>window.__thesis.inspect().detail==='light');
      const light=await state(page);assert.equal(light.compositor.asciiWeight,0);assert.equal(light.compositor.apertureScale,0);assert.equal(light.compositor.maxBlurPx,0);assert.equal(light.compositor.requestedSamples,0);assert.equal(light.renderer.shadowEnabled,false);
      await page.getByLabel('Visual detail').selectOption('full');await page.waitForFunction(()=>window.__thesis.inspect().detail==='full');await override(page,{});
    },page);
    await check(profile+'/image source links, chapter rail keyboard and visible feedback',async()=>{
      const rail=page.getByRole('navigation',{name:'Study chapters'});assert.equal(await rail.locator('a').count(),7);
      const link=rail.locator('[data-chapter-link="pattern"]');await link.focus();await page.keyboard.press('Enter');await settle(page);
      assert.equal(new URL(page.url()).hash,'#pattern');assert.equal(await link.getAttribute('aria-current'),'location');
      const imageLink=page.getByRole('link',{name:/Inspect original source:/}).filter({has:page.locator('img')}).nth(1);
      await imageLink.focus();assert(await imageLink.evaluate(el=>el.matches(':focus-visible')));
      const href=await imageLink.getAttribute('href'),response=await context.request.get(new URL(href,origin).href);assert.equal(response.status(),200);
      const [popup]=await Promise.all([context.waitForEvent('page'),page.keyboard.press('Enter')]);await popup.waitForLoadState('domcontentloaded');assert.equal(popup.url(),new URL(href,origin).href);await popup.close();
      await page.bringToFront();await settle(page);
      if(profile!=='mobile'){
        await chapter(page,'form');await page.mouse.move(5,500);await page.waitForTimeout(250);
        const glyph=page.locator('#form [data-parallax] svg').first();const before=await glyph.evaluate(el=>getComputedStyle(el).strokeWidth);
        await glyph.hover();await page.waitForTimeout(300);const after=await glyph.evaluate(el=>getComputedStyle(el).strokeWidth);assert.notEqual(after,before,'glyph hover did not respond');
      }
      await assertReadable(page);
    },page);
    await check(profile+'/decorative pointer, pause, live reduced motion and visibility resume',async()=>{
      await chapter(page,'form');await override(page,{});await resetPointer(page);const a=await state(page);
      await page.mouse.move(10,10);await settle(page);await page.mouse.move(page.viewportSize().width-10,page.viewportSize().height*.5);await settle(page);const b=await state(page);
      near(a.nativeU,b.nativeU);near(a.stageU,b.stageU);assert.deepEqual(a.elements,b.elements);
      if(profile==='mobile')assert.deepEqual(b.pose.pointerDegrees,[0,0]);else assert.notDeepEqual(b.pose.position,a.pose.position);
      await page.getByRole('button',{name:'Pause motion',exact:true}).click();await settle(page);const still=(await state(page)).pose.position;
      await chapter(page,'make');assert.deepEqual((await state(page)).pose.position,still);
      await page.getByRole('button',{name:'Resume motion',exact:true}).click();await settle(page);
      await page.emulateMedia({reducedMotion:'reduce'});await settle(page);const reduced=await state(page);assert.equal(reduced.compositor.asciiWeight,0);assert.equal(reduced.compositor.maxBlurPx,0);
      await chapter(page,'system');assert.deepEqual((await state(page)).pose.position,reduced.pose.position);assert.equal((await state(page)).elements.separationWeight,0);
      await page.emulateMedia({reducedMotion:'no-preference'});await settle(page);assert.equal((await state(page)).reduced,false);
      // Deterministic lifecycle dispatch exercises the application's hidden/resume
      // branch; it is not a claim of physical tab-throttling performance.
      await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
      const frozen=(await state(page)).frames;await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(250);assert.equal((await state(page)).frames,frozen);
      await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});await settle(page);
      const resumed=await state(page);near(resumed.nativeU,resumed.visualU);await assertReadable(page);
    },page);
    if(profile==='chromium')await check(profile+'/actual scene pixel effects, focal isolation and protected ASCII regions',async()=>{
      await chapter(page,'pattern');await resetPointer(page);
      const base={stageU:3.5/7,visualU:3.5/7,optical:{apertureScale:0,maxBlurPx:0,asciiWeight:0,veil:0}};
      await override(page,base);const initial=await state(page),plain=await capture(page,'pixel-plain');
      await override(page,{...base,focalLengthMm:initial.pose.focalLengthMm*.85});const wide=await state(page),widePixels=await capture(page,'pixel-wide');
      await override(page,{...base,focalLengthMm:initial.pose.focalLengthMm*1.15});const tele=await state(page),telePixels=await capture(page,'pixel-tele');
      assert.deepEqual(wide.pose.position,tele.pose.position);assert.deepEqual(wide.pose.target,tele.pose.target);assert.notEqual(wide.pose.fov,tele.pose.fov);
      const lensDelta=await delta(widePixels,telePixels);assert(lensDelta.changed>100,'lens did not change actual pixels');pixels.push({effect:'focal-length',...lensDelta});
      await override(page,{...base,keyIntensityScale:.15});const dark=await capture(page,'pixel-key-low');
      await override(page,{...base,keyIntensityScale:2.5});const lit=await capture(page,'pixel-key-high');
      const lightDelta=await delta(dark,lit);assert(lightDelta.changed>100,'key light did not affect actual geometry');pixels.push({effect:'light',...lightDelta});
      await override(page,{...base,optical:{...base.optical,focusDistanceM:initial.optics.focusRangeM[0],apertureScale:90,maxBlurPx:8}});const nearPixels=await capture(page,'pixel-focus-near');
      await override(page,{...base,optical:{...base.optical,focusDistanceM:initial.optics.focusRangeM[1],apertureScale:90,maxBlurPx:8}});const farPixels=await capture(page,'pixel-focus-far');
      const focusDelta=await delta(nearPixels,farPixels);assert(focusDelta.changed>50,'focus depth did not affect actual geometry');pixels.push({effect:'focus-distance',...focusDelta});
      await override(page,base);const sharpPixels=await capture(page,'pixel-ascii-off');
      await override(page,{...base,optical:{...base.optical,asciiWeight:1}});const asciiPixels=await capture(page,'pixel-ascii-on'),asciiState=await state(page);
      const asciiDelta=await delta(sharpPixels,asciiPixels);assert(asciiDelta.changed>10,'ASCII did not influence unprotected scene pixels');assert(asciiState.compositor.protectedRectCount>0);pixels.push({effect:'ascii',...asciiDelta});
      const protectedRect=asciiState.protectedRects.find(rect=>rect.left<400&&rect.right>250&&rect.top<700&&rect.bottom>200);
      assert(protectedRect,'actual reading-panel mask missing');
      const inner={left:Math.max(0,protectedRect.left+8),top:Math.max(0,protectedRect.top+8),right:Math.min(1440,protectedRect.right-8),bottom:Math.min(1000,protectedRect.bottom-8)};
      const protectedDelta=await delta(sharpPixels,asciiPixels,inner);assert(protectedDelta.pixels>1000);assert(protectedDelta.meanRGB<.025,'ASCII changed protected reading pixels');pixels.push({effect:'protected-reading-region',rect:inner,...protectedDelta});
      await override(page,{...base,protectedRects:[{left:0,top:0,right:1440,bottom:1000}],optical:{...base.optical,asciiWeight:1}});
      const masked=await capture(page,'pixel-ascii-full-mask'),maskedDelta=await delta(plain,masked);assert(maskedDelta.meanRGB<.025,'full-viewport mask failed');pixels.push({effect:'full-mask',...maskedDelta});
      await override(page,{});
    },page);
    await check(profile+'/resize resources, renderer idle and clean console',async()=>{
      await page.getByLabel('Visual detail').selectOption('full');await override(page,{});await chapter(page,'form');await resetPointer(page);
      // Warm both shader variants before comparing repeated resize/quality cycles.
      await page.getByLabel('Visual detail').selectOption('light');await page.waitForFunction(()=>window.__thesis.inspect().detail==='light');
      await page.getByLabel('Visual detail').selectOption('full');await page.waitForFunction(()=>window.__thesis.inspect().detail==='full');await settle(page);
      const before=await state(page),size=page.viewportSize();
      for(let index=0;index<2;index++){await page.setViewportSize({width:size.width-20,height:size.height-35});await settle(page);await page.setViewportSize(size);await settle(page);}
      await chapter(page,'form');await resetPointer(page);const after=await state(page);
      assert.deepEqual(after.memory,before.memory);assert.equal(after.renderer.programs,before.renderer.programs);assert.equal(after.compositor.width,before.compositor.width);assert.equal(after.compositor.height,before.compositor.height);
      const frames=after.frames;await page.waitForTimeout(500);assert.equal((await state(page)).frames,frames);
      for(const image of await page.locator('main img').all()){await image.scrollIntoViewIfNeeded();await image.evaluate(img=>img.decode());}
      assert.deepEqual(errors,[]);await assertReadable(page);
      metrics.push({profile,resourceBefore:before.memory,resourceAfter:after.memory,programs:after.renderer.programs,resources:await page.evaluate(()=>performance.getEntriesByType('resource').map(entry=>({name:entry.name,bytes:entry.encodedBodySize,duration:entry.duration})))});
    },page);
  }catch(error){failures.push({name:profile+'/initialization',error:error.stack??error.message});console.log('FAIL '+profile+'/initialization '+error.message);await save();}
  finally{await context.close();await browser.close();}
}

if(!selected||selected==='chromium'){
  const browser=await chromium.launch({headless:true,executablePath});
  try{
    await check('fallback/no JavaScript retains seven chapters, images, native source links and poster',async()=>{
      const page=await browser.newPage({javaScriptEnabled:false,viewport:{width:390,height:844}});try{
        await page.goto(origin);assert.equal(await page.locator('canvas').count(),0);await assertReadable(page);
        for(const image of await page.locator('img').all()){await image.scrollIntoViewIfNeeded();await image.evaluate(img=>img.decode());}
        assert((await page.locator('main').innerText()).includes('regression'));assert.equal(await page.getByRole('navigation',{name:'Study chapters'}).locator('a').count(),7);
        assert.equal(await page.getByRole('link',{name:/Inspect original source:/}).count(),4);await page.screenshot({path:output+'/no-js-round02.png'});
      }finally{await page.close();}
    });
    await check('fallback/initial reduced motion prevents model transfer',async()=>{
      const page=await browser.newPage({reducedMotion:'reduce'}),seen=[];page.on('request',request=>seen.push(request.url()));try{
        await page.goto(origin);await page.getByRole('button',{name:'Reduced motion',exact:true}).waitFor();assert.equal(await page.locator('canvas').count(),0);assert(!seen.some(url=>url.endsWith('.glb')||url.endsWith('.hdr')));await assertReadable(page);
      }finally{await page.close();}
    });
    await check('fallback/Save-Data retains poster and requires deliberate model loading',async()=>{
      const page=await browser.newPage(),seen=[];page.on('request',request=>seen.push(request.url()));try{
        await page.addInitScript(()=>Object.defineProperty(navigator,'connection',{value:{saveData:true},configurable:true}));await page.goto(origin);
        await page.getByRole('button',{name:'Enable 3D',exact:true}).waitFor();assert.equal(await page.locator('canvas').count(),0);assert(!seen.some(url=>url.endsWith('.glb')));
        await page.getByRole('button',{name:'Enable 3D',exact:true}).click();await waitReady(page);assert.equal((await state(page)).source.triangles,227521);
      }finally{await page.close();}
    });
    await check('fallback/blocked source layer GLB preserves complete reading',async()=>{
      const page=await browser.newPage();try{
        await page.route('**/assets/source-layers.glb',route=>route.abort());await page.goto(origin);
        await page.getByRole('button',{name:'Still background',exact:true}).waitFor({timeout:30000});assert.equal(await page.locator('canvas').count(),0);await assertReadable(page);
        assert(await page.locator('[data-cinematic-background] img').evaluate(img=>img.complete&&img.naturalWidth>0));await page.screenshot({path:output+'/blocked-model-round02.png'});
      }finally{await page.close();}
    });
    await check('fallback/WebGL unavailable and real context loss retain the document',async()=>{
      const page=await browser.newPage();try{
        await page.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return /^webgl|experimental-webgl/.test(type)?null:original.call(this,type,...args);};});
        await page.goto(origin);await page.getByRole('button',{name:'Still background',exact:true}).waitFor();assert.equal(await page.locator('canvas').count(),0);await assertReadable(page);
      }finally{await page.close();}
      const next=await browser.newPage();try{
        await next.goto(origin);await waitReady(next);await next.evaluate(()=>window.__thesis.loseContext());
        await next.getByRole('button',{name:'Still background',exact:true}).waitFor();assert.equal(await next.locator('canvas').count(),0);await assertReadable(next);
      }finally{await next.close();}
    });
    await check('artifact/local review contains no raw source path, native model, PDF or Studio',async()=>{
      const html=await(await fetch(origin)).text();assert(!/D:\\|E:\\|portfolio-preparation|Final_Model\.3dm|Theatre Studio/.test(html));
      const meta=await(await fetch(origin+'assets/source-layers.json')).json();assert.equal(meta.publishable,false);
      assert.equal((await fetch(origin,{method:'POST'})).status,403);assert.equal((await fetch(origin+'source.pdf')).status,404);
    });
  }finally{await browser.close();}
}
await save();
assert(results.length+failures.length>0,'No acceptance check matched the requested filter');
console.log(JSON.stringify({reportPath,passed:results.length,failed:failures.length,failures:failures.map(failure=>({name:failure.name,error:failure.error.split('\n')[0]}))},null,2));
if(failures.length)process.exitCode=1;
