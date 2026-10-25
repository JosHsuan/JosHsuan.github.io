import {readEntryComposition,assertEntryComposition} from './research-entry-composition-helpers.mjs';
import {writeFile} from 'node:fs/promises';
import {test,expect} from '@playwright/test';
import {WAIT,frames,scenarioTimeout,settle} from './case-helpers.mjs';

test('entry waits for actual scene paint and releases a deep-linked library only after entry',async({page},testInfo)=>{
 test.setTimeout(scenarioTimeout(180000));
 let release;const assetGate=new Promise(resolve=>{release=resolve;});
 await page.route('**/assets/source-layers.glb',async route=>{await assetGate;await route.continue();});
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 try{
  await page.goto('/projects/bending-active/#pattern',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__story?.inspect().libraryDiagram.count===1,null,{timeout:WAIT});
  await frames(page,8);
  const preparing=await page.evaluate(()=>window.__story.inspect());
  expect(preparing.entry.phase).toBe('preparing');expect(preparing.entry.progress).toBeLessThan(100);
  expect(preparing.entry.prerequisites.scene).toBe(false);expect(preparing.libraryDiagram.open).toEqual([]);expect(preparing.libraryDiagram.history).toEqual([]);
  await expect(page.locator('[data-project-content]')).toHaveAttribute('inert','');
  const loader=page.locator('[data-entry-loader]');
  await expect(loader).toBeVisible();
  await expect(loader.getByRole('status')).toHaveText('Preparing the study');
  await expect(loader.locator('[data-ready="false"][aria-hidden="true"]')).toBeVisible();
  await expect(loader.locator('[aria-valuenow]')).toHaveCount(0);
  await expect(loader).not.toContainText(/\d+\s*%/);
  await expect.poll(()=>loader.locator('[data-research-entry-backdrop] img').evaluate(node=>node.complete&&node.naturalWidth>0),{timeout:WAIT}).toBe(true);
  const composition=await loader.locator('[data-research-entry-composition]').evaluate(readEntryComposition);
  const receiptPath=testInfo.outputPath('direct-entry-composition.json');await writeFile(receiptPath,JSON.stringify(composition,null,2));await testInfo.attach('direct-entry-composition',{path:receiptPath,contentType:'application/json'});assertEntryComposition(composition);
  await loader.screenshot({path:testInfo.outputPath('entry-preparing.png')});
  release();
  await page.waitForFunction(()=>window.__story.inspect().entry.phase==='entered',null,{timeout:WAIT});await settle(page);
  const entered=await page.evaluate(()=>({entry:window.__story.inspect().entry,ready:window.__thesis.inspect().ready,initialization:window.__thesis.inspect().initialization}));
  expect(entered.ready).toBe(true);expect(entered.initialization.phase).toBe('ready');expect(entered.entry.progress).toBe(100);
  expect(entered.entry.history.map(event=>event.phase)).toEqual(['preparing','ready','revealing','entered']);
  await expect(page.locator('[data-project-content]')).not.toHaveAttribute('inert','');
  await expect(page.locator('[data-entry-loader]')).toBeHidden();
  // The fragment selects the reading chapter. Bringing its lower diagram into
  // view now requests its own sequence, with no request consumed by the loader.
  await page.locator('[data-source-diagram="library"]').scrollIntoViewIfNeeded();await settle(page);
  await page.waitForFunction(()=>window.__story.inspect().libraryDiagram.history.some(event=>event.status==='completed'),null,{timeout:WAIT});
  const events=await page.evaluate(()=>window.__story.inspect().libraryDiagram.history);
  expect(events.filter(event=>event.status==='requested')).toHaveLength(1);
  expect(events.filter(event=>event.status==='completed')).toHaveLength(1);
  expect(errors).toEqual([]);
 }finally{release();}
});

test('Reduced entry preserves reading when its deep-linked library hydrates after entry',async({page})=>{
 let release;const libraryGate=new Promise(resolve=>{release=resolve;});
 await page.route('**/assets/diagrams/library.json',async route=>{await libraryGate;await route.continue();});
 try{
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/projects/bending-active/#pattern',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__story?.inspect().entry.phase==='entered',null,{timeout:WAIT});
  const entry=await page.evaluate(()=>window.__story.inspect().entry);
  expect(entry.reason).toBe('static-ready');expect(entry.progress).toBe(100);expect(entry.reveal).toBe(1);
  await expect(page.locator('[data-entry-loader]')).toBeHidden();await expect(page.locator('[data-project-content]')).not.toHaveAttribute('inert','');
  await expect(page.locator('[data-cinematic-stage] canvas')).toHaveCount(0);
  await expect(page.getByRole('button',{name:'Enable 3D',exact:true})).toBeVisible();
  await expect(page.getByRole('combobox',{name:'Visual detail',exact:true})).toHaveCount(0);
  await expect(page.getByRole('button',{name:/^(Pause|Resume) motion$/})).toHaveCount(0);
  // Only the library is delayed in this regression. Let preceding diagrams
  // finish their separate control-row hydration before recording absolute Y;
  // native scroll anchoring can legitimately compensate for those rows.
  await expect(page.locator('[data-source-diagram="miura"] svg[role="img"]')).toHaveCount(1);
  await expect(page.locator('[data-source-diagram="workflow"] svg[role="img"]')).toHaveCount(1);
  const drawing=page.locator('[data-source-diagram="library"] [data-library-drawing]');
  await expect(drawing.locator('svg')).toHaveCount(0);
  expect(await page.evaluate(()=>window.__story.inspect().libraryDiagram.count)).toBe(0);
  // The fallback already reserves the drawing's space. Read it before its JSON
  // arrives, without a pointer/key event that would cancel the startup fragment.
  await drawing.scrollIntoViewIfNeeded();await settle(page);
  const before=await drawing.evaluate(element=>({y:scrollY,top:element.getBoundingClientRect().top,bottom:element.getBoundingClientRect().bottom,height:innerHeight}));
  expect(before.top).toBeLessThan(before.height*.85);expect(before.bottom).toBeGreaterThan(before.height*.1);
  release();
  await page.waitForFunction(()=>window.__story.inspect().libraryDiagram.count===1,null,{timeout:WAIT});
  await page.waitForFunction(()=>window.__story.inspect().libraryDiagram.items[0]?.status==='completed',null,{timeout:WAIT});await settle(page);
  expect(await page.evaluate(()=>window.__story.inspect().libraryDiagram.items[0].progress)).toEqual(Array(11).fill(1));
  const after=await drawing.evaluate(element=>({y:scrollY,top:element.getBoundingClientRect().top,bottom:element.getBoundingClientRect().bottom,height:innerHeight}));
  expect(after.y).toBeCloseTo(before.y,0);expect(after.top).toBeLessThan(after.height*.85);expect(after.bottom).toBeGreaterThan(after.height*.1);
  expect(new URL(page.url()).hash).toBe('#pattern');
 }finally{release();}
});

test('a native hash navigation relinquishes its chapter anchor before later layout measurement',async({page})=>{
 let release;const photoGate=new Promise(resolve=>{release=resolve;});
 await page.route('**/assets/cinematic/connection-detail.webp',async route=>{await photoGate;await route.continue();});
 try{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/projects/bending-active/#form',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.__story?.inspect().entry.phase==='entered',null,{timeout:WAIT});await settle(page);
 await page.evaluate(async()=>{
  const changed=new Promise(resolve=>addEventListener('hashchange',resolve,{once:true}));
  location.hash='#make';await changed;
 });
 await settle(page);
 const chapter=page.locator('[data-story-chapter="make"]');
 expect(await chapter.evaluate(element=>Math.abs(element.getBoundingClientRect().top-parseFloat(getComputedStyle(element).scrollMarginTop||0)))).toBeLessThan(1);
 const photo=chapter.locator('img[src$="connection-detail.webp"]'),reserved=await photo.boundingBox();
 expect(reserved.width).toBeGreaterThan(100);expect(reserved.height).toBeGreaterThan(100);
 release();await photo.evaluate(element=>element.decode());await settle(page);
 const decoded=await photo.boundingBox();
 expect(decoded.width).toBeCloseTo(reserved.width,1);expect(decoded.height).toBeCloseTo(reserved.height,1);
 expect(await chapter.evaluate(element=>Math.abs(element.getBoundingClientRect().top-parseFloat(getComputedStyle(element).scrollMarginTop||0)))).toBeLessThan(1);
 await page.evaluate(()=>scrollBy({top:200,behavior:'instant'}));await settle(page);
 const before=await chapter.evaluate(element=>({y:scrollY,top:element.getBoundingClientRect().top,frame:window.__story.inspect().controllerFrame}));
 expect(before.top).toBeLessThan(-199);
 // A real one-pixel viewport resize refreshes the measured layout without any
 // direct reading input. Viewport units may reflow slightly; an anchor replay
 // would instead discard the entire 200-pixel position within the chapter.
 const viewport=page.viewportSize();await page.setViewportSize({...viewport,height:viewport.height-1});
 await page.waitForFunction(frame=>window.__story.inspect().controllerFrame>frame,before.frame,{timeout:WAIT});await settle(page);
 const after=await chapter.evaluate(element=>({y:scrollY,top:element.getBoundingClientRect().top}));
 expect(new URL(page.url()).hash).toBe('#make');
 expect(after.y).toBeGreaterThan(before.y-50);expect(after.y).toBeLessThan(before.y+50);
 expect(after.top).toBeLessThan(-150);expect(after.top).toBeGreaterThan(-250);
 }finally{release();}
});

for(const viewport of [{width:320,height:844},{width:844,height:390}])test(`canonical SSR entry remains readable at ${viewport.width}x${viewport.height} with failed scripts`,async({browser,baseURL},info)=>{
 let primary;const rows=[],requests=[],abortedScripts=[],failedScripts=[];
 const context=await browser.newContext({baseURL,viewport,reducedMotion:'no-preference'});let nojs,healthy;
 try{
  const page=await context.newPage();page.on('request',request=>{if(/\.(glb|hdr)(?:\?|$)/.test(request.url()))requests.push(request.url());});
  page.on('requestfailed',request=>{if(request.resourceType()==='script')failedScripts.push({url:request.url(),error:request.failure()?.errorText});});
  await page.route('**/_next/**',async route=>{if(route.request().resourceType()==='script'){abortedScripts.push(route.request().url());await route.abort('failed');}else await route.continue();});
  await page.goto('/projects/bending-active/',{waitUntil:'load'});
  const documentState=await page.evaluate(()=>({readyState:document.readyState,storyAbsent:window.__story===undefined}));
  rows.push({phase:'failed-script-SSR-loaded',documentState});expect(documentState.readyState).toBe('complete');expect(documentState.storyAbsent).toBe(true);expect(abortedScripts.length).toBeGreaterThan(0);expect(failedScripts.map(row=>row.url).sort()).toEqual([...abortedScripts].sort());
  const frame=page.locator('[data-entry-loader] [data-research-entry-composition]'),image=frame.locator('img');await expect(frame).toBeVisible();
  await expect.poll(()=>image.evaluate(node=>node.complete&&node.naturalWidth>0),{timeout:WAIT}).toBe(true);await expect(image).toHaveCSS('object-fit','contain');
  // Prove the actual declared face, not fallback-only FontFaceSet.check success.
  // This completed failed-script document is not a delayed-hydration fixture.
  const fonts=await frame.evaluate(async root=>{
   const normalize=value=>value.replace(/["']/g,'').trim();
   const rows=[];
   for(const element of root.querySelectorAll('[data-research-entry-content] p, [data-research-entry-content] h2, [data-research-entry-content] a')){
    const style=getComputedStyle(element),text=element.textContent.trim();if(!text)continue;
    const family=normalize(style.fontFamily.split(',')[0]);
    const font=`${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    const loaded=await document.fonts.load(font,text);
    rows.push({text,family,font,check:document.fonts.check(font,text),faces:loaded.map(face=>({family:normalize(face.family),status:face.status,registered:document.fonts.has(face)}))});
   }
   return {documentState:document.readyState,rows};
  });
  rows.push({phase:'SSR-declared-fonts',fonts});expect(fonts.rows.length).toBeGreaterThan(0);
  for(const row of fonts.rows){expect(row.family).toBe('Roboto Mono');expect(row.check).toBe(true);expect(row.faces.length).toBeGreaterThan(0);for(const face of row.faces){expect(face.family).toBe('Roboto Mono');expect(face.status).toBe('loaded');expect(face.registered).toBe(true);}}
  for(const forced of [false,true]){
   await page.emulateMedia({forcedColors:forced?'active':'none'});
   const fact=await frame.evaluate(readEntryComposition);rows.push({phase:forced?'forced-SSR':'normal-SSR',reducedMotion:'no-preference',fact});assertEntryComposition(fact);
   expect(await page.evaluate(()=>window.__story===undefined)).toBe(true);
   await expect(page.locator('[data-entry-return]')).toHaveAttribute('href','/#projects');
   const path=info.outputPath(`direct-SSR-${forced?'forced':'normal'}.png`);await page.screenshot({path,scale:'device'});await info.attach(`direct-SSR-${forced?'forced':'normal'}`,{path,contentType:'image/png'});
   if(!forced&&fact.shortLandscape){
    await frame.locator('[data-research-entry-backdrop]').evaluate(node=>node.scrollIntoView({block:'center',behavior:'instant'}));
    rows.push({phase:'short-landscape-native-source-reading',fact:await frame.evaluate(readEntryComposition)});
    const sourcePath=info.outputPath('direct-SSR-native-source.png');await page.screenshot({path:sourcePath,scale:'device'});await info.attach('direct-SSR-native-source',{path:sourcePath,contentType:'image/png'});
    await page.locator('[data-entry-return]').evaluate(node=>node.scrollIntoView({block:'center',behavior:'instant'}));
   }
  }
  await page.emulateMedia({forcedColors:'none'});
  if(viewport.width===320)for(const [width,height] of [[780,1000],[781,1000],[900,1000],[900,900]]){
   await page.setViewportSize({width,height});
   const expected=`/assets/cinematic/model-poster${width<=780?'-mobile':''}.webp`;
   await expect.poll(()=>image.evaluate((node,path)=>node.complete&&node.naturalWidth>0&&new URL(node.currentSrc).pathname===path,expected),{timeout:WAIT}).toBe(true);
   const fact=await frame.evaluate(readEntryComposition);rows.push({phase:'SSR-responsive-breakpoint',width,height,fact});assertEntryComposition(fact);
   if(width!==780){const path=info.outputPath(`direct-SSR-boundary-${width}x${height}.png`);await page.screenshot({path,scale:'device'});await info.attach(`direct-SSR-boundary-${width}x${height}`,{path,contentType:'image/png'});}
  }
  // The unchanged pre-hydration fail-open animation is intentionally shortened
  // by Reduced motion. Measure visible SSR first, then verify that policy before
  // an independent healthy entry; do not freeze the normal 30-second fallback.
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect(page.locator('[data-entry-loader]')).toBeHidden();
  const policy=await page.evaluate(()=>({reduced:matchMedia('(prefers-reduced-motion: reduce)').matches,storyAbsent:window.__story===undefined,context:document.querySelector('[data-entry-loader]').getAttribute('data-entry-context'),loaderVisibility:getComputedStyle(document.querySelector('[data-entry-loader]')).visibility,bodyInert:document.querySelector('[data-project-content]').hasAttribute('inert')}));
  rows.push({phase:'reduced-unhydrated-fail-open',policy});
  expect(policy.reduced).toBe(true);expect(policy.storyAbsent).toBe(true);expect(policy.context).toBeNull();expect(policy.loaderVisibility).toBe('hidden');expect(policy.bodyInert).toBe(false);
  await expect(page.locator('[data-project-content]')).toBeVisible();
  await expect(page.locator('[data-home-link]')).toHaveAttribute('href','/#about');await expect(page.locator('[data-home-link]')).toBeVisible();
  const healthyViewport=page.viewportSize();
  await context.close();
  // Independent healthy entry, not recovery of a context whose scripts failed.
  healthy=await browser.newContext({baseURL,viewport:healthyViewport,reducedMotion:'reduce'});
  const healthyPage=await healthy.newPage(),healthyRequests=[];
  healthyPage.on('request',request=>{if(/\.(glb|hdr)(?:\?|$)/.test(request.url()))healthyRequests.push(request.url());});
  rows.push({phase:'independent-clean-reduced-entry',viewport:healthyViewport,requests:healthyRequests,coverage:'New clean context with original scripts; not failed-context recovery or delayed hydration.'});
  await healthyPage.goto('/projects/bending-active/',{waitUntil:'load'});
  await expect.poll(()=>healthyPage.evaluate(()=>window.__story?.inspect().entry.phase),{timeout:WAIT}).toBe('entered');
  await expect(healthyPage.locator('[data-entry-loader]')).toBeHidden();await expect(healthyPage.locator('[data-project-content]')).not.toHaveAttribute('inert','');await expect(healthyPage.locator('[data-cinematic-stage] canvas')).toHaveCount(0);expect(healthyRequests).toEqual([]);expect(requests).toEqual([]);
  rows.push({phase:'independent-clean-reduced-entered',url:healthyPage.url()});
  nojs=await browser.newContext({baseURL,viewport,javaScriptEnabled:false});const native=await nojs.newPage();await native.goto('/projects/bending-active/');
  await expect(native.locator('[data-entry-loader]')).toBeHidden();await expect(native.locator('[data-project-content]')).not.toHaveAttribute('inert','');await expect(native.locator('[data-project-content]')).toBeVisible();
  const home=native.locator('[data-home-link]');await expect(home).toHaveAttribute('href','/#about');await expect(home).toBeVisible();rows.push({phase:'no-js-native-body',url:native.url(),loaderHidden:true});
 }catch(error){primary=error;throw error;}finally{
  let cleanupError=primary;
  for(const cleanup of [async()=>{const path=info.outputPath('direct-SSR-composition.json');await writeFile(path,JSON.stringify({viewport,coverage:"Failed-script SSR pixels plus independent clean-context Reduced entry; no failed-context recovery or same-document delayed-hydration visual claim.",abortedScripts,failedScripts,requests,rows},null,2));await info.attach('direct-SSR-composition',{path,contentType:'application/json'});},()=>context.close(),()=>healthy?.close(),()=>nojs?.close()])try{await cleanup();}catch(error){cleanupError??=error;}
  if(!primary&&cleanupError)throw cleanupError;
 }
});
