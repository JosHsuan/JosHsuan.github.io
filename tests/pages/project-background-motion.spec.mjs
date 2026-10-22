import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {WAIT,frames,scenarioTimeout} from './case-helpers.mjs';

const projects=JSON.parse(await readFile(new URL('../../roles/uiux-designer/cases/bending-active-thesis/release/project-studies.json',import.meta.url),'utf8')).projects;
const animated=projects.filter(project=>project.motionMedia?.length);
const dot=projects.find(project=>project.id==='dot-based-3d-printing');
const caschlatsch=projects.find(project=>project.id==='project-caschlatsch');
const route=project=>`/projects/${project.slug}/`;
const videoFor=(page,media)=>page.locator(`[data-project-motion-media][data-project-motion-id="${media.id}"]`);
const backdrop=page=>page.evaluate(()=>window.__globalBackground.inspect().driver.projectStudy.backdrop);
const mediaFacts=(page,id)=>page.evaluate(id=>window.__globalBackground.inspect().driver.projectStudy.backdrop.media.find(item=>item.id===id),id);
const imageKey=(project,chapter)=>`image:${chapter==='overview'?project.hero.src:project.sections.find(section=>section.id===chapter).media[0].src}`;

function closed(history){
 for(const id of new Set(history.map(item=>item.id))){
  const facts=history.filter(item=>item.id===id);
  expect(facts.filter(item=>item.status==='requested')).toHaveLength(1);
  expect(facts.filter(item=>['completed','cancelled','failed'].includes(item.status))).toHaveLength(1);
 }
}
async function entered(page){
 await page.waitForFunction(()=>['entered','failed'].includes(window.__site?.inspect().phase),null,{timeout:WAIT});
 await expect(page.locator('[data-site-loader]')).toBeHidden();
 expect(await page.evaluate(()=>window.__site.inspect().phase)).toBe('entered');
 await page.waitForFunction(()=>!!window.__globalBackground?.inspect().driver.projectStudy?.backdrop,null,{timeout:WAIT});
}
async function open(page,project){expect((await page.goto(route(project))).status()).toBe(200);await entered(page);}
async function select(page,chapter){
 await page.locator(`[data-project-chapter-link="${chapter}"]`).click();
 await page.waitForFunction(chapter=>document.querySelector('[data-project-study]')?.dataset.projectActiveChapter===chapter,chapter,{timeout:WAIT});
}
async function selectWithKeyboard(page,chapter){
 const link=page.locator(`[data-project-chapter-link="${chapter}"]`);
 await link.focus();await link.press('Enter');
 await page.waitForFunction(chapter=>document.querySelector('[data-project-study]')?.dataset.projectActiveChapter===chapter,chapter,{timeout:WAIT});
}
async function hold(page,key){
 await page.waitForFunction(key=>{
  const stage=window.__globalBackground?.inspect().driver.projectStudy?.backdrop.stage;
  return stage?.key===key&&stage.mode==='hold'&&stage.settled&&!stage.transition&&stage.pose.opacity===1&&stage.pose.x===0;
 },key,{timeout:WAIT});
 return backdrop(page);
}
// Failure-only evidence; never retries, seeks, resumes or polls the source.
async function attachNativeMediaFailure(page,media,phase,initialTime=null){
 try{
  const facts=await page.evaluate(({id,phase,initialTime})=>{
   const ranges=value=>Array.from({length:Math.min(value.length,8)},(_,i)=>[value.start(i),value.end(i)]);
   return {at:performance.now(),id,phase,initialTime,visibility:document.visibilityState,
    activeElement:document.activeElement?{tag:document.activeElement.tagName,id:document.activeElement.id}:null,
    backdrop:window.__globalBackground?.inspect().driver.projectStudy?.backdrop,
    receipts:(window.__testProjectMediaReceipts??[]).slice(-256),modeReceipts:(window.__testModeNativeMedia??[]).slice(-256),
    native:[...document.querySelectorAll('[data-project-motion-media]')].filter(video=>video.dataset.projectMotionId===id).slice(0,4).map(video=>({
     paused:video.paused,ended:video.ended,seeking:video.seeking,readyState:video.readyState,networkState:video.networkState,
     currentTime:video.currentTime,duration:video.duration,currentSrc:video.currentSrc,loop:video.loop,playbackRate:video.playbackRate,
     width:video.videoWidth,height:video.videoHeight,buffered:ranges(video.buffered),seekable:ranges(video.seekable),
     error:video.error?{code:video.error.code,message:video.error.message}:null,
    })),
   };
  },{id:media.id,phase,initialTime});
  await test.info().attach('native-media-failure',{body:JSON.stringify(facts,null,2),contentType:'application/json'});
 }catch{/* Diagnostic failure or teardown must never replace the original assertion. */}
}
async function playing(page,media){
 await page.evaluate(()=>{
  if(window.__testProjectMediaReceipts)return;
  const receipts=window.__testProjectMediaReceipts=[];
  for(const type of ['play','pause','playing','waiting','timeupdate','seeking','seeked','ended','loadeddata','canplay','stalled','error'])document.addEventListener(type,event=>{
   const video=event.target;if(!(video instanceof HTMLVideoElement)||!video.matches('[data-project-motion-media]'))return;
   receipts.push({at:performance.now(),type:event.type,trusted:event.isTrusted,id:video.dataset.projectMotionId,paused:video.paused,readyState:video.readyState,currentTime:video.currentTime,phase:video.closest('[data-project-media]')?.dataset.projectMediaPhase,error:video.error?.code??null});
   if(receipts.length>256)receipts.splice(0,receipts.length-256);
  },{capture:true,passive:true});
 });
 try{
  await hold(page,`video:${media.id}`);
  await page.waitForFunction(id=>{
   const state=window.__globalBackground.inspect().driver.projectStudy.backdrop.media.find(item=>item.id===id);
   const video=[...document.querySelectorAll('[data-project-motion-media]')].find(node=>node.dataset.projectMotionId===id);
   return state?.firstFrame&&!state.failed&&state.playing&&video&&video.readyState>=2&&!video.paused;
  },media.id,{timeout:WAIT});
 }catch(error){
  await attachNativeMediaFailure(page,media,'playing');throw error;
 }
}
async function nativeVideo(page,media){
 await playing(page,media);
 const video=videoFor(page,media),actual=await video.evaluate(node=>({width:node.videoWidth,height:node.videoHeight,duration:node.duration,source:new URL(node.currentSrc).pathname,rate:node.playbackRate,muted:node.muted,loop:node.loop,fit:getComputedStyle(node).objectFit,filter:getComputedStyle(node).filter,blend:getComputedStyle(node).mixBlendMode}));
 expect(actual).toMatchObject({width:media.width,height:media.height,source:media.src,rate:1,muted:true,loop:media.loop,fit:'contain',filter:'none',blend:'normal'});
 expect(Math.abs(actual.duration-media.durationSeconds)).toBeLessThan(.05);
 expect(media.frameCount).toBeGreaterThan(1);
 const receipt=await mediaFacts(page,media.id);
 expect(['loadeddata','video-frame']).toContain(receipt.frame.method);
 expect(receipt.frame).toMatchObject({width:media.width,height:media.height});
 expect(receipt.callbackPending&&receipt.frame.method==='video-frame').toBe(false);
 expect(receipt.deadlinePending).toBe(false);
 const initial=await video.evaluate(node=>node.currentTime);
 // A source loop may wrap. Either a forward delta or the genuine wrap proves
 // native media time; no test scroll or controller writes currentTime.
 try{
 await expect.poll(()=>video.evaluate((node,before)=>Math.abs(node.currentTime-before),initial),{timeout:WAIT}).toBeGreaterThan(.03);
 }catch(error){await attachNativeMediaFailure(page,media,'advancement',initial);throw error;}
 await expect(page.locator(`[data-project-source-caption="${media.chapter}"]`)).toContainText(media.caption);
 await expect(page.locator(`[data-project-source-caption="${media.chapter}"]`)).toContainText(media.credit);
 await expect(page.locator(`[data-project-motion-source][href="${media.src}"]`)).toHaveAttribute('target','_blank');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
 return video;
}

/** A read-only observer records delivered application state and actual CSS
 * writes. It never selects a chapter, advances a controller or fakes readiness. */
function tracePassage(page,key){
 return page.evaluate(({key,timeout})=>new Promise((resolve,reject)=>{
  const samples=[];let raf=null,last=null;
  const timer=setTimeout(()=>{if(raf!==null)cancelAnimationFrame(raf);reject(Error('Native source passage did not hold: '+JSON.stringify(last)));},timeout);
  const read=()=>{
   const state=window.__globalBackground?.inspect().driver.projectStudy?.backdrop.stage;
   if(state){
    const figure=document.querySelector('[data-project-media-active]'),style=figure?getComputedStyle(figure):null,matrix=style&&style.transform!=='none'?new DOMMatrixReadOnly(style.transform):null;
    last={at:performance.now(),key:state.key,mode:state.mode,pose:{...state.pose},transition:state.transition?structuredClone(state.transition):null,painted:style?{x:(matrix?.m41??0)/innerWidth,y:(matrix?.m42??0)/innerHeight,opacity:Number(style.opacity)}:null};
    samples.push(last);
    if(state.key===key&&state.mode==='hold'&&state.settled&&!state.transition){clearTimeout(timer);resolve({samples,completedAt:performance.now(),stage:state});return;}
   }
   raf=requestAnimationFrame(read);
  };raf=requestAnimationFrame(read);
 }),{key,timeout:WAIT});
}
function actualPassage(trace,direction){
 const exit=trace.samples.find(sample=>sample.mode==='exit'&&sample.pose.opacity>0&&sample.pose.opacity<1);
 const entry=trace.samples.find(sample=>sample.mode==='entry'&&sample.pose.opacity>0&&sample.pose.opacity<1);
 expect(exit,'A real departing source is observed between its endpoint poses').toBeTruthy();
 expect(entry,'A real prepared source is observed between its endpoint poses').toBeTruthy();
 expect(exit.transition.duration).toBe(.95);expect(entry.transition.duration).toBe(1.1);
 expect(Math.sign(exit.pose.x)).toBe(-direction);expect(Math.sign(entry.pose.x)).toBe(direction);
 for(const sample of [exit,entry]){
  expect(sample.transition.elapsed).toBeGreaterThan(0);expect(sample.transition.elapsed).toBeLessThan(sample.transition.duration);
  expect(sample.painted).toBeTruthy();expect(sample.painted.x).toBeCloseTo(sample.pose.x,4);expect(sample.painted.y).toBeCloseTo(sample.pose.y,4);expect(sample.painted.opacity).toBeCloseTo(sample.pose.opacity,5);
 }
 // Native foreground elapsed time must include the unconsumed exit and the
 // actual entry. Waiting for decode can lengthen this bound, never shorten it.
 expect((trace.completedAt-exit.at)/1000).toBeGreaterThanOrEqual(.95-exit.transition.elapsed+1.1-.1);
 closed(trace.stage.history);
}

test('Caschlatsch portfolio photographs and plates use actual finite forward/reverse passages, latest wins, and Credits retains the source',async({page})=>{
 test.setTimeout(scenarioTimeout(120000));
 await open(page,caschlatsch);await hold(page,imageKey(caschlatsch,'overview'));
 const forward=tracePassage(page,imageKey(caschlatsch,'context'));await select(page,'context');actualPassage(await forward,1);
 const reverse=tracePassage(page,imageKey(caschlatsch,'overview'));await select(page,'overview');actualPassage(await reverse,-1);
 await select(page,'system');const system=await hold(page,imageKey(caschlatsch,'system'));
 // The owner replaced the repeated conceptual workflow with two distinct
 // original portfolio plates. Changing their identity must perform the real
 // finite source passage; same-model continuity is covered by model cases.
 const xrKey=imageKey(caschlatsch,'xr-guidance');expect(xrKey).not.toBe(system.stage.key);
 const toXR=tracePassage(page,xrKey);await select(page,'xr-guidance');const xrPassage=await toXR;actualPassage(xrPassage,1);
 await expect(page.locator('[data-project-media="xr-guidance"][data-project-media-active] [data-project-media-poster]')).toHaveAttribute('src',caschlatsch.sections.find(section=>section.id==='xr-guidance').media[0].src);
 expect(xrPassage.stage.sequence).toBeGreaterThan(system.stage.sequence);
 const toSystem=tracePassage(page,imageKey(caschlatsch,'system'));await select(page,'system');const systemPassage=await toSystem;actualPassage(systemPassage,-1);
 await expect(page.locator('[data-project-media="system"][data-project-media-active] [data-project-media-poster]')).toHaveAttribute('src',caschlatsch.sections.find(section=>section.id==='system').media[0].src);
 expect(systemPassage.stage.sequence).toBeGreaterThan(xrPassage.stage.sequence);
 await test.info().attach('Caschlatsch-original-portfolio-source-passages',{body:JSON.stringify({systemKey:system.stage.key,xrKey,xrPassage,systemPassage}),contentType:'application/json'});
 await select(page,'context');
 await page.waitForFunction(()=>{const stage=window.__globalBackground.inspect().driver.projectStudy.backdrop.stage;return stage.mode==='exit'&&stage.pose.opacity>0&&stage.pose.opacity<1;},null,{timeout:WAIT});
 const superseded=(await backdrop(page)).stage.request.id;
 // Pointer actionability can legitimately wait for the optical rail to settle,
 // completing the passage before the next click. Native keyboard activation
 // creates the intended rapid interruption without bypassing application state.
 await selectWithKeyboard(page,'system');await selectWithKeyboard(page,'results');
 const final=await hold(page,imageKey(caschlatsch,'results'));
 expect(final.stage.history.filter(item=>item.id===superseded&&item.status==='cancelled')).toHaveLength(1);
 closed(final.stage.history);
 const retained={key:final.stage.key,sequence:final.stage.sequence,history:final.stage.history};
 await select(page,'credits');await frames(page,3);
 const credits=await backdrop(page);expect(credits.stage.key).toBe(retained.key);expect(credits.stage.mode).toBe('hold');expect(credits.stage.sequence).toBe(retained.sequence);expect(credits.stage.history).toEqual(retained.history);
 await expect(page.locator('[data-project-chapter="credits"]')).toBeInViewport();
 await expect(page.locator('[data-project-model-stage]')).toHaveCount(0);
});

for(const project of animated)for(const media of project.motionMedia)test(`${project.shortTitle} (${media.id}) decodes the pinned native recording with original dimensions, timing and advancing media time`,async({page})=>{
 // The existing Caustics source is 50 MB / 1.9 million vertices and prepares on
 // page open. Its native decode scenario shares the established source budget.
 if(project.model?.bytes>40000000)test.setTimeout(scenarioTimeout(180000));
 const requests=[];page.on('request',request=>{if(new URL(request.url()).pathname===media.src)requests.push(request.url());});
 await open(page,project);expect(requests).toEqual([]);await select(page,media.chapter);const video=await nativeVideo(page,media);expect(requests.length).toBeGreaterThan(0);
 if(project.id==='special-assemblies'){
  expect(media.loop).toBe(false);
  // Seek the real native recording near its finite end; its browser owns the
  // final playback and trusted ended event. No ended event is dispatched here.
  await video.evaluate(node=>{window.__testMotionEnded=null;node.addEventListener('ended',event=>{window.__testMotionEnded={trusted:event.isTrusted,time:node.currentTime,duration:node.duration};},{once:true});node.currentTime=Math.max(0,node.duration-.2);});
  await expect.poll(()=>mediaFacts(page,media.id),{timeout:WAIT}).toMatchObject({ended:true,playing:false,paused:true,phase:'ended'});
  const ended=await video.evaluate(node=>({event:window.__testMotionEnded,time:node.currentTime,duration:node.duration,ended:node.ended,paused:node.paused}));
  expect(ended.event.trusted).toBe(true);expect(ended.ended).toBe(true);expect(ended.paused).toBe(true);expect(ended.time).toBeCloseTo(ended.duration,2);
  await frames(page,5);expect(await video.evaluate(node=>node.currentTime)).toBe(ended.time);
  await expect(page.locator(`[data-project-media="${media.chapter}"]`)).toHaveAttribute('data-project-media-mode','video');
  const replay=page.locator(`[data-project-motion-replay="${media.id}"]`);await expect(replay).toBeVisible();await replay.click();await playing(page,media);
  expect(await video.evaluate(node=>node.currentTime)).toBeLessThan(ended.duration-.2);expect((await mediaFacts(page,media.id)).ended).toBe(false);
 }
 closed((await backdrop(page)).stage.history);
});

test('Mode/s physical recordings and simulation retain separate native times through forward, reverse and manual pause',async({page})=>{
 test.setTimeout(scenarioTimeout(120000));
 const mode=projects.find(project=>project.id==='mode-s-of-making');
 const [simulation,film,prototype]=['film-machine-simulation','film-physical-cutting','prototype-cutting-operation'].map(id=>mode.motionMedia.find(media=>media.id===id));
 await open(page,mode);
 await page.evaluate(()=>{
  const samples=window.__testModeNativeMedia=[];
  for(const type of ['play','pause','playing','timeupdate'])document.addEventListener(type,event=>{
   if(!event.target.matches?.('[data-project-motion-media]'))return;
   samples.push({type:event.type,trusted:event.isTrusted,playing:[...document.querySelectorAll('[data-project-motion-media]')].filter(video=>!video.paused).map(video=>video.dataset.projectMotionId)});
  },{capture:true,passive:true});
 });
 await select(page,simulation.chapter);await nativeVideo(page,simulation);
 await select(page,film.chapter);const filmVideo=await nativeVideo(page,film);
 await expect(page.locator(`[data-project-motion-source][href="${film.src}"]`)).toContainText('View recording');
 await page.locator(`[data-project-motion-toggle="${film.id}"]`).click();
 await expect.poll(()=>filmVideo.evaluate(video=>video.paused),{timeout:WAIT}).toBe(true);
 const filmTime=await filmVideo.evaluate(video=>video.currentTime);
 await select(page,prototype.chapter);const prototypeVideo=await nativeVideo(page,prototype);
 expect(await filmVideo.evaluate(video=>video.currentTime)).toBe(filmTime);
 await expect(page.locator(`[data-project-motion-source][href="${prototype.src}"]`)).toContainText('View recording');
 await select(page,film.chapter);await hold(page,`video:${film.id}`);
 expect(await filmVideo.evaluate(video=>video.paused)).toBe(true);
 expect(await filmVideo.evaluate(video=>video.currentTime)).toBe(filmTime);
 const prototypeTime=await prototypeVideo.evaluate(video=>video.currentTime);
 await page.locator(`[data-project-motion-toggle="${film.id}"]`).click();await nativeVideo(page,film);
 await selectWithKeyboard(page,simulation.chapter);await nativeVideo(page,simulation);
 expect(await prototypeVideo.evaluate(video=>video.currentTime)).toBe(prototypeTime);
 await select(page,prototype.chapter);await nativeVideo(page,prototype);
 const samples=await page.evaluate(()=>window.__testModeNativeMedia);
 expect(samples.some(sample=>sample.trusted&&sample.type==='playing'&&sample.playing.includes(film.id))).toBe(true);
 expect(samples.some(sample=>sample.trusted&&sample.type==='playing'&&sample.playing.includes(prototype.id))).toBe(true);
 for(const sample of samples)expect(sample.playing.length,'Only one actual native video plays at a time').toBeLessThanOrEqual(1);
 await test.info().attach('Mode-native-media-forward-reverse-pause',{body:JSON.stringify({filmTime,prototypeTime,samples}),contentType:'application/json'});
 closed((await backdrop(page)).stage.history);
});

test('Dot exchanges photographs, the original model and video through one transaction while pause preserves native reading and media time',async({page})=>{
 test.setTimeout(scenarioTimeout(120000));const media=dot.motionMedia[0];
 await open(page,dot);await hold(page,imageKey(dot,'overview'));await select(page,'context');await hold(page,imageKey(dot,'context'));
 await select(page,'system');await hold(page,`model:${dot.model.sha256}`);
 const model=await page.evaluate(()=>window.__globalBackground.inspect().driver.projectStudy.scene);
 expect(model.externalStage).toBe(true);expect(model.resource.successfulPaint).toBe(true);expect(model.resource.sourceRevision).toBe(dot.model.sha256);expect(model.resource.view.chapter).toBe('system');
 await expect(page.locator('[data-project-model-stage]')).toHaveAttribute('data-project-model-active','');await expect(page.locator('[data-project-media-active]')).toHaveCount(0);
 await select(page,media.chapter);const video=await nativeVideo(page,media);await expect(page.locator('[data-project-model-stage]')).not.toHaveAttribute('data-project-model-active','');
 await select(page,'results');await hold(page,imageKey(dot,'results'));expect((await mediaFacts(page,media.id)).paused).toBe(true);
 await select(page,media.chapter);await nativeVideo(page,media);
 const toggle=page.locator('[data-study-motion-toggle]');await toggle.click();await expect(toggle).toHaveAttribute('aria-pressed','true');
 await expect.poll(()=>video.evaluate(node=>node.paused),{timeout:WAIT}).toBe(true);const paused=await video.evaluate(node=>node.currentTime);await frames(page,5);expect(await video.evaluate(node=>node.currentTime)).toBe(paused);
 const before=await page.evaluate(()=>scrollY);await select(page,'results');await hold(page,imageKey(dot,'results'));expect(await page.evaluate(()=>scrollY)).not.toBe(before);expect(await video.evaluate(node=>node.currentTime)).toBe(paused);
 await toggle.click();await expect(toggle).toHaveAttribute('aria-pressed','false');await select(page,media.chapter);await playing(page,media);
 closed((await backdrop(page)).stage.history);
});

test('real history departure retains or disposes native media correctly, and a real reload clears the departed source and callbacks',async({page})=>{
 test.setTimeout(scenarioTimeout(120000));const media=dot.motionMedia[0];
 await page.addInitScript(()=>addEventListener('pageshow',event=>{window.__testMotionPageShow={trusted:event.isTrusted,persisted:event.persisted};}));
 await open(page,dot);await select(page,media.chapter);await nativeVideo(page,media);
 const installReceipt=async key=>page.evaluate(key=>{
  window.__testMotionDocument=performance.timeOrigin;
  addEventListener('pagehide',event=>sessionStorage.setItem(key,JSON.stringify({trusted:event.isTrusted,persisted:event.persisted,documentId:window.__testMotionDocument,background:window.__globalBackground.inspect(),videos:[...document.querySelectorAll('[data-project-motion-media]')].map(video=>({id:video.dataset.projectMotionId,src:video.getAttribute('src'),paused:video.paused,currentTime:video.currentTime}))})),{once:true});
 },key);
 const checkDeparture=(receipt,retained)=>{
  expect(receipt.trusted).toBe(true);expect(receipt.persisted).toBe(retained);
  const driver=receipt.background.driver,state=driver.projectStudy.backdrop,native=state.media.find(item=>item.id===media.id);
  expect(native.paused).toBe(true);expect(native.callbackPending).toBe(false);expect(native.deadlinePending).toBe(false);
  if(retained){expect(driver.lifecycle.suspended).toBe(true);expect(state.suspended).toBe(true);expect(native.sourceAttached).toBe(true);expect(receipt.background.activeBindings).toBe(1);}
  else{expect(driver.disposed).toBe(true);expect(state.disposed).toBe(true);expect(state.events.nativeListeners).toBe(0);expect(native.sourceAttached).toBe(false);expect(receipt.background.activeBindings).toBe(0);expect(receipt.videos.every(video=>video.src===null&&video.paused)).toBe(true);}
  closed(state.stage.history);
 };
 await installReceipt('test-motion-history-departure');await page.locator('[data-portfolio-navigation] a[href="/contact/"]').click();await enteredPlain(page);
 const departure=await page.evaluate(()=>JSON.parse(sessionStorage.getItem('test-motion-history-departure')));checkDeparture(departure,departure.persisted);
 test.info().annotations.push({type:'native-media-lifecycle',description:departure.persisted?'A real BFCache departure paused and retained its native source.':'This engine discarded the real departed document; BFCache retention was not observed.'});
 await page.goBack();await entered(page);
 const restored=await page.evaluate(()=>({show:window.__testMotionPageShow,documentId:window.__testMotionDocument,background:window.__globalBackground.inspect()}));expect(restored.show.trusted).toBe(true);expect(restored.background.activeBindings).toBe(1);expect(restored.background.driver.lifecycle.suspended).toBe(false);
 if(restored.show.persisted){expect(departure.persisted).toBe(true);expect(restored.documentId).toBe(departure.documentId);}
 await select(page,media.chapter);await playing(page,media);await installReceipt('test-motion-reload-departure');await page.reload();await entered(page);
 const discarded=await page.evaluate(()=>JSON.parse(sessionStorage.getItem('test-motion-reload-departure')));checkDeparture(discarded,false);
});

async function enteredPlain(page){await page.waitForFunction(()=>['entered','failed'].includes(window.__site?.inspect().phase),null,{timeout:WAIT});await expect(page.locator('[data-site-loader]')).toBeHidden();}

test('Reduced Motion and Save Data show pinned source posters without requesting an animation',async({page})=>{
 test.setTimeout(scenarioTimeout(120000));const media=dot.motionMedia[0],requests=[];
 page.on('request',request=>{if(animated.some(project=>project.motionMedia.some(item=>new URL(request.url()).pathname===item.src)))requests.push(request.url());});
 await page.emulateMedia({reducedMotion:'reduce'});await open(page,dot);await select(page,media.chapter);await hold(page,`poster:${media.id}`);
 expect((await mediaFacts(page,media.id))).toMatchObject({started:false,firstFrame:false,sourceAttached:false});expect(await videoFor(page,media).getAttribute('src')).toBeNull();
 await expect(page.locator(`[data-project-media="${media.chapter}"]`)).toHaveAttribute('data-project-media-mode','poster');
 await page.goto('/contact/');await enteredPlain(page);await page.emulateMedia({reducedMotion:'no-preference'});
 await page.addInitScript(()=>{
  if(navigator.connection)Object.defineProperty(navigator.connection,'saveData',{configurable:true,get:()=>true});
  else Object.defineProperty(navigator,'connection',{configurable:true,value:Object.assign(new EventTarget(),{saveData:true})});
 });
 await open(page,dot);expect(await page.evaluate(()=>navigator.connection.saveData)).toBe(true);await select(page,media.chapter);await hold(page,`poster:${media.id}`);
 expect((await mediaFacts(page,media.id))).toMatchObject({started:false,firstFrame:false,sourceAttached:false});expect(await videoFor(page,media).getAttribute('src')).toBeNull();expect(requests).toEqual([]);closed((await backdrop(page)).stage.history);
});

test('native HTTP failure, rejected playback and a real pending-source deadline each latch a truthful poster without late upgrades',async({page})=>{
 // Three independent native acquisitions include the real 15-second media
 // deadline. WAIT remains unchanged; this case has the existing multi-step budget.
 test.setTimeout(scenarioTimeout(120000));const media=dot.motionMedia[0],pattern='**'+media.src;
 await page.addInitScript(()=>{
  const play=HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play=function(){if(this.matches('[data-project-motion-media]')&&sessionStorage.getItem('test-motion-reject-play')==='1')return Promise.reject(new DOMException('Deliberate native playback rejection','NotAllowedError'));return play.call(this);};
 });
 const failed=async reason=>{
  await page.waitForFunction(({id,reason})=>{const item=window.__globalBackground.inspect().driver.projectStudy.backdrop.media.find(item=>item.id===id);return item?.failed&&(!reason||item.reason===reason);},{id:media.id,reason},{timeout:WAIT});
  const state=await hold(page,`poster:${media.id}`),native=state.media.find(item=>item.id===media.id);
  expect(native.failed).toBe(true);expect(native.sourceAttached).toBe(false);expect(native.callbackPending).toBe(false);expect(native.deadlinePending).toBe(false);
  expect(state.stage.history.filter(item=>item.key===`video:${media.id}`&&item.status==='failed')).toHaveLength(1);closed(state.stage.history);return native;
 };
 let requests=0;page.on('request',request=>{if(new URL(request.url()).pathname===media.src)requests++;});
 await page.route(pattern,request=>request.fulfill({status:404,contentType:'text/plain',body:'Unavailable native motion source'}));
 await open(page,dot);await select(page,media.chapter);const unavailable=await failed();expect(['media-error','play-rejected']).toContain(unavailable.reason);expect(requests).toBeGreaterThan(0);const attempts=requests;
 await page.unroute(pattern);await select(page,'results');await hold(page,imageKey(dot,'results'));await select(page,media.chapter);await hold(page,`poster:${media.id}`);expect(requests).toBe(attempts);expect((await mediaFacts(page,media.id)).failed).toBe(true);
 await page.goto('/contact/');await enteredPlain(page);await page.evaluate(()=>sessionStorage.setItem('test-motion-reject-play','1'));
 await open(page,dot);await select(page,media.chapter);await failed('play-rejected');await page.evaluate(()=>sessionStorage.removeItem('test-motion-reject-play'));await frames(page,4);expect((await mediaFacts(page,media.id)).sourceAttached).toBe(false);
 await page.goto('/contact/');await enteredPlain(page);
 let release=null,intercepted=false;
 await page.route(pattern,request=>{intercepted=true;return new Promise(resolve=>{release=async()=>{try{await request.abort();}catch{/* The browser may already have cancelled this native request. */}resolve();};});});
 try{
  await open(page,dot);await select(page,media.chapter);
  await expect.poll(()=>intercepted,{timeout:WAIT}).toBe(true);
  await page.waitForFunction(id=>window.__globalBackground.inspect().driver.projectStudy.backdrop.media.find(item=>item.id===id)?.deadlinePending,media.id,{timeout:WAIT});
  await failed('media-timeout');if(release)await release();await page.unroute(pattern);await frames(page,4);expect((await mediaFacts(page,media.id))).toMatchObject({reason:'media-timeout',firstFrame:false,sourceAttached:false});
 }finally{if(release)await release();await page.unroute(pattern);}
});

const dotDeliveryTest=test.extend({video:'on'});
dotDeliveryTest('the smaller Dot delivery decodes and completes a genuine native loop without retiming',async({page})=>{
  const media=dot.motionMedia[0];
  expect(media.src).toBe('/assets/projects/dot-based-3d-printing/printing-process-motion-web.mp4');
  await open(page,dot);await selectWithKeyboard(page,media.chapter);
  const video=await nativeVideo(page,media);
  // Read-only native timeupdate observation: never seek, synthesize an event,
  // or drive the application clock to manufacture a loop.
  await video.evaluate(node=>{
   window.__dotLoop={previous:node.currentTime,wrapped:false,samples:[]};
   node.addEventListener('timeupdate',event=>{
    const state=window.__dotLoop,time=node.currentTime;
    if(event.isTrusted&&state.previous>node.duration*.7&&time<node.duration*.3)state.wrapped=true;
    state.previous=time;state.samples.push({time,trusted:event.isTrusted});
   });
  });
  await expect.poll(()=>page.evaluate(()=>window.__dotLoop.wrapped),{timeout:WAIT}).toBe(true);
  const receipt=await page.evaluate(()=>window.__dotLoop);
  expect(receipt.samples.every(sample=>sample.trusted)).toBe(true);
  const path=test.info().outputPath('dot-compact-native-playback.png');
  await page.screenshot({path,fullPage:false});
  await test.info().attach('dot-compact-native-playback',{path,contentType:'image/png'});
 });
