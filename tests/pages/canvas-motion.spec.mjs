import {test,expect} from '@playwright/test';
import {WAIT,scenarioTimeout,settle,centerStudy,frames,loadScene,expectIdle,surface} from './case-helpers.mjs';

const stageCanvas='[data-cinematic-stage] canvas';
const sample=page=>page.evaluate(()=>{
 const scene=window.__thesis.inspect(),story=window.__story.inspect(),canvas=document.querySelector('[data-cinematic-stage] canvas'),r=canvas.getBoundingClientRect();
 return {placement:story.canvasPlacement,informationChapter:story.informationChapter,pose:scene.pose,frames:scene.frames,time:story.playback.activeSeconds,field:story.pageField,rect:{x:r.x,y:r.y,width:r.width,height:r.height},surface:story.canvasSurface,screen:{width:innerWidth,height:innerHeight},native:[canvas.width,canvas.height],budget:scene.renderBudget,pressure:scene.renderPressure,suspended:scene.renderSuspended,informationTop:document.querySelector('#system [data-story-heading]').getBoundingClientRect().top};
});
const scrollTo=async(page,y)=>{await page.evaluate(top=>window.scrollTo({top,behavior:'instant'}),y);await settle(page);};
const reduce=async page=>{await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>window.__story.inspect().playback.reducedMotion,null,{timeout:WAIT});};

test('one viewport scene holds its cinematic scale while information scrolls independently',async({page})=>{
 test.setTimeout(scenarioTimeout(120000));
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await loadScene(page);await centerStudy(page,'system');
 const canvas=await page.locator(stageCanvas).elementHandle(),first=await sample(page),observed=[];
 const {holdStart,holdEnd}=first.placement;
 let previous=first;
 for(const fraction of [.1,.5,.9]){
  await scrollTo(page,holdStart+(holdEnd-holdStart)*fraction);const current=await sample(page);observed.push(current);
  expect(current.placement).toMatchObject({chapter:'system',x:0,y:0,scale:1,opacity:1,visible:true,settled:true,mode:'hold'});
  expect(current.rect).toEqual({x:0,y:0,width:current.surface.width,height:current.surface.height});
  expect(current.rect.width).toBe(current.screen.width);expect(current.rect.height).toBe(current.screen.height);
  expect(current.pose.compositionSpace).toBe('viewport-stage');
  // Full playback preserves viewport composition. Sustained slow delivery may
  // lower backing density, but only through the existing pressure policy.
  expect(current.pose.viewport).toEqual(first.pose.viewport);expect(current.time).toBeGreaterThanOrEqual(first.time);
  expect(current.budget.detail).toBe('full');expect(current.native).toEqual([current.budget.width,current.budget.height]);
  expect(current.budget.pixels).toBeLessThanOrEqual(current.budget.pixelBudget);
  expect(current.budget.densityScale).toBeLessThanOrEqual(previous.budget.densityScale);
  if(current.budget.densityScale===previous.budget.densityScale)expect(current.native).toEqual(previous.native);
  else{
   expect(current.pressure.decisions).toBeGreaterThan(previous.pressure.decisions);
   expect(current.native[0]).toBeLessThan(previous.native[0]);expect(current.native[1]).toBeLessThan(previous.native[1]);
  }
  previous=current;
 }
 await test.info().attach('native-reading-density-records',{body:JSON.stringify([first,...observed].map(({native,budget,pressure})=>({native,budget,pressure}))),contentType:'application/json'});
 expect(observed[0].informationTop-observed[2].informationTop).toBeGreaterThan(100);
 // Between the .42vh reading probe and .62vh scene probe, FORM can remain the
 // current information chapter while SYSTEM already owns the displayed scene.
 const separationY=await page.locator('#system').evaluate(el=>{let y=0;for(let n=el;n;n=n.offsetParent)y+=n.offsetTop;return y-innerHeight*.52;});
 await scrollTo(page,separationY);const separate=await sample(page);
 expect(separate.informationChapter).toBe('form');expect(separate.placement.chapter).toBe('system');
 await expect(page.locator('[data-chapter-link="form"]')).toHaveAttribute('aria-current','location');
 expect(await page.evaluate(el=>document.querySelector('[data-cinematic-stage] canvas')===el,canvas)).toBe(true);
 await expect(page.locator(stageCanvas)).toHaveCount(1);await expect(page.locator('canvas[data-ascii-field]')).toHaveCount(1);await expect(page.locator('canvas')).toHaveCount(2);
 await reduce(page);await expectIdle(page);
 const reduced=await sample(page);await frames(page,8);const still=await sample(page);
 expect(still.time).toBe(reduced.time);expect(still.pose.position).toEqual(reduced.pose.position);expect(errors).toEqual([]);
});

test('keyboard inspection across the information and scene gap presents its requested chapter before freezing',async({page})=>{
 test.setTimeout(scenarioTimeout(120000));await loadScene(page);await centerStudy(page,'form');
 const control=surface(page,'form');await expect(control).toBeFocused();
 // Native scrolling preserves the focused FORM control while the earlier
 // scene probe enters SYSTEM. Do not refocus it: that would trigger a semantic
 // seek and conceal the pending-passage/engagement regression.
 const gap=await page.locator('#system').evaluate(el=>{let y=0;for(let n=el;n;n=n.offsetParent)y+=n.offsetTop;return y-innerHeight*.52;});
 await scrollTo(page,gap);await expect(control).toBeFocused();
 expect(await page.evaluate(()=>({information:window.__story.inspect().informationChapter,scene:window.__story.inspect().canvasPlacement.chapter,source:window.__thesis.inspect().representation.chapterId}))).toEqual({information:'form',scene:'system',source:'system'});
 await page.evaluate(()=>{
  window.__pendingSceneHits=[];
  window.__pendingSceneObserver=new MutationObserver(()=>{
   const story=window.__story.inspect();if(!story.canvasAwaitingPaint)return;
   const scene=window.__thesis.inspect(),canvas=document.querySelector('[data-cinematic-stage] canvas'),r=canvas.getBoundingClientRect(),v=scene.pose.viewport;
   let hit=false;
   for(let y=.1;y<1&&!hit;y+=.1)for(let x=.1;x<1&&!hit;x+=.1)hit=!!window.__thesis.hitTest(r.left+r.width*(v.left+v.width*x),r.top+r.height*(v.top+v.height*y));
   window.__pendingSceneHits.push({chapter:story.canvasPlacement.chapter,sourceChapter:scene.representation.chapterId,presented:scene.canvasPresented,opacity:Number(document.querySelector('[data-cinematic-stage]').style.opacity),hit});
  });
  window.__pendingSceneObserver.observe(document.body,{subtree:true,attributes:true,attributeFilter:['style']});
 });
 await page.keyboard.press('ArrowRight');await settle(page);
 const pending=await page.evaluate(()=>{window.__pendingSceneObserver.disconnect();return window.__pendingSceneHits;});
 expect(pending.length,'The real chapter retarget must traverse its renderer-acknowledgment window.').toBeGreaterThan(0);
 for(const value of pending){
  expect(value).toMatchObject({chapter:'form',presented:true,opacity:1});
  if(value.sourceChapter!=='form')expect(value.hit).toBe(false);
 }
 const held=await page.evaluate(()=>{const story=window.__story.inspect();return {information:story.informationChapter,chapter:story.canvasPlacement.chapter,weights:story.playback.chapterWeights,engaged:story.modelEngaged,awaiting:story.canvasAwaitingPaint,source:window.__thesis.inspect().representation.chapterId,azimuth:story.inspection.value.azimuth,opacity:Number(document.querySelector('[data-cinematic-stage]').style.opacity)};});
 expect(held).toEqual({information:'form',chapter:'form',weights:[0,1,0,0,0,0,0],engaged:true,awaiting:false,source:'form',azimuth:23,opacity:1});
 await expectIdle(page);
 await page.keyboard.press('Escape');await settle(page);
 expect(await page.evaluate(()=>({chapter:window.__story.inspect().canvasPlacement.chapter,engaged:window.__story.inspect().modelEngaged,awaiting:window.__story.inspect().canvasAwaitingPaint,source:window.__thesis.inspect().representation.chapterId}))).toEqual({chapter:'system',engaged:false,awaiting:false,source:'system'});
});

test('absent evidence scenes sleep WebGL while the independent page ASCII keeps the shared clock',async({page})=>{
 test.setTimeout(scenarioTimeout(120000));await loadScene(page);
 const canvas=await page.locator(stageCanvas).elementHandle();
 for(const chapter of ['make','validation','credits']){
  await page.locator('[data-chapter-link="'+chapter+'"]').click();await settle(page);
  const before=await sample(page);expect(before.placement).toMatchObject({chapter,visible:false,settled:true,mode:'absent'});expect(before.suspended).toBe(true);
  await frames(page,12);const after=await sample(page);
  expect(after.frames).toBe(before.frames);expect(after.time).toBeGreaterThan(before.time);expect(after.field.draws).toBeGreaterThan(before.field.draws);expect(after.field.fieldTime).toBeGreaterThan(before.field.fieldTime);
  expect(after.field.drawnGlyphs).toBeGreaterThan(0);expect(after.field.cssWidth).toBe(after.surface.width);expect(after.field.cssHeight).toBe(after.surface.height);
  expect(await page.evaluate(el=>document.querySelector('[data-cinematic-stage] canvas')===el,canvas)).toBe(true);
 }
 await centerStudy(page,'system');const returned=await sample(page);expect(returned.suspended).toBe(false);expect(returned.placement.visible).toBe(true);
 await expect.poll(()=>page.evaluate(()=>window.__thesis.inspect().frames),{timeout:WAIT}).toBeGreaterThan(returned.frames);
 await reduce(page);await expectIdle(page);
 await expect(page.locator(stageCanvas)).toHaveCount(1);await expect(page.locator('canvas[data-ascii-field]')).toHaveCount(1);
});

test('with OS Reduced, a real visible source hit still compares geometry through transparent side-information overlays',async({page})=>{
 test.setTimeout(scenarioTimeout(150000));await page.setViewportSize({width:390,height:844});
 await page.addInitScript(()=>{
  const writes=new WeakMap();window.__stageStorageWrites=canvas=>writes.get(canvas)??0;
  for(const axis of ['width','height']){
   const descriptor=Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype,axis);
   Object.defineProperty(HTMLCanvasElement.prototype,axis,{...descriptor,set(value){writes.set(this,(writes.get(this)??0)+1);descriptor.set.call(this,value);}});
  }
 });
 await loadScene(page);await reduce(page);await settle(page);await centerStudy(page,'system');
 expect(await page.evaluate(()=>typeof window.__thesis.inspect().rendererPendingFrames)).toBe('number');
 const canvas=await page.locator(stageCanvas).elementHandle();
 const range=await page.evaluate(()=>({start:scrollY,end:window.__story.inspect().canvasPlacement.holdEnd-2}));
 const attempts=[];let point=null,rays=0;
 // Use real native positions through the existing stacked phone layout. The
 // scene stays held while its old semantic control slot scrolls away; no test
 // style mutation or substituted hitTest may expose a synthetic interaction.
 for(let step=0;step<=18&&!point&&rays<360;step++){
  await scrollTo(page,range.start+(range.end-range.start)*step/18);
  const result=await page.evaluate(remaining=>{
   const scene=window.__thesis.inspect(),story=window.__story.inspect(),r=document.querySelector('[data-cinematic-stage] canvas').getBoundingClientRect(),v=scene.pose.viewport;
   const slot=document.querySelector('[data-model-study-host="system"]').getBoundingClientRect(),candidates=[];
   for(let row=1;row<=13;row++)for(let column=1;column<=13;column++){
    const u=column/14,w=row/14,x=r.left+r.width*(v.left+v.width*u),y=r.top+r.height*(v.top+v.height*w);
    if(x<16||x>innerWidth-16||y<100||y>innerHeight-90)continue;
    const clear=[[-3,0],[3,0],[0,-3],[0,3],[0,0]].every(([dx,dy])=>{
     const under=document.elementFromPoint(x+dx,y+dy);
     return under&&!under.closest('button,a,select,input,summary,[data-protect],[data-feedback-plane]');
    });
    if(!clear)continue;
    candidates.push({x,y,distance:Math.hypot(u-.5,w-.5)});
   }
   candidates.sort((a,b)=>a.distance-b.distance);let found=null,used=0;
   for(const candidate of candidates){if(used>=Math.min(remaining,60))break;used++;const hit=window.__thesis.hitTest(candidate.x,candidate.y);if(hit?.source&&hit.chapterId==='system'){found={x:candidate.x,y:candidate.y};break;}}
   return {point:found,rays:used,eligible:candidates.length,docY:scrollY,chapter:story.canvasPlacement.chapter,mode:story.canvasPlacement.mode,presented:scene.canvasPresented,slot:{left:slot.left,right:slot.right,top:slot.top,bottom:slot.bottom}};
  },360-rays);
  rays+=result.rays;attempts.push(result);point=result.point;
 }
 await test.info().attach('outside-slot-native-hit-search',{body:JSON.stringify({range,rays,attempts}),contentType:'application/json'});
  expect(point,'The narrow chapter hold must expose an unobscured real source hit through the transparent UI.').not.toBeNull();
 const last=attempts.at(-1);expect(last).toMatchObject({chapter:'system',mode:'hold',presented:true});
 // Native information slots can be the transparent DOM target above the real
 // source. Production delegates that hit to its registered chapter surface;
 // the fixed overlay still requires the original viewport ancestry.
 const ownership=await page.evaluate(p=>{
  const target=document.elementFromPoint(p.x,p.y),hit=window.__thesis.hitTest(p.x,p.y);
  const chapter=hit?.chapterId,selector=`[data-study-chapter="${CSS.escape(chapter??'')}"]`;
  const surface=document.querySelector('[data-model-viewport]'+selector),viewport=target?.closest('[data-model-viewport]');
  const label=document.querySelector('[data-model-side-label]'+selector),native=label?.dataset.modelLabelPlacement==='native';
  const host=target?.closest('[data-model-information-host],[data-model-study-host]');
  const nativeChapter=host?.dataset.modelInformationHost??host?.dataset.modelStudyHost;
  const ancestors=[];for(let node=target;node&&ancestors.length<8;node=node.parentElement)ancestors.push({tag:node.tagName,chapter:node.dataset.studyChapter??null,informationHost:node.dataset.modelInformationHost??null,studyHost:node.dataset.modelStudyHost??null,viewport:node.hasAttribute('data-model-viewport')});
  return{native,nativeChapter:nativeChapter??null,targetPresent:!!target,ownsPoint:!!surface&&(native||viewport===surface),protected:!!target?.closest('button,a,select,input,summary,[data-protect],[data-feedback-plane]'),target:target?.tagName??null,ancestors,
   active:surface?.closest('[data-model-study]')?.dataset.modelActive,disabled:surface?.getAttribute('aria-disabled'),source:hit?.source,chapter};
 },point);
 await test.info().attach('reduced-source-hit-ownership',{body:JSON.stringify({point,ownership}),contentType:'application/json'});
 expect(ownership).toMatchObject({targetPresent:true,ownsPoint:true,protected:false,active:'true',disabled:'false',source:true,chapter:'system'});
 const resources=()=>page.evaluate(()=>{const scene=window.__thesis.inspect(),canvas=document.querySelector('[data-cinematic-stage] canvas');return {id:scene.representation.id,index:scene.representation.index,source:scene.source,diagrams:scene.diagramSource,budget:scene.renderBudget,initialization:scene.initialization,native:[canvas.width,canvas.height],writes:window.__stageStorageWrites(canvas),docY:scrollY};});
 const before=await resources();await page.mouse.click(point.x,point.y);await settle(page);const after=await resources();
 expect(after.id).not.toBe(before.id);expect(after.index).toBe((before.index+1)%4);
 expect(after.source).toEqual(before.source);expect(after.diagrams).toEqual(before.diagrams);expect(after.initialization).toEqual(before.initialization);
 expect(after.budget).toEqual(before.budget);expect(after.native).toEqual(before.native);expect(after.writes).toBe(before.writes);expect(after.docY).toBe(before.docY);
 expect(await page.evaluate(el=>document.querySelector('[data-cinematic-stage] canvas')===el,canvas)).toBe(true);
 await expect(page.locator(stageCanvas)).toHaveCount(1);await expect(page.locator('canvas[data-ascii-field]')).toHaveCount(1);await expectIdle(page);
});

test('the continuous source block exits only at Pattern and an interrupted scroll reverses without scaling or remounting',async({page})=>{
 test.setTimeout(scenarioTimeout(120000));await page.clock.install();await loadScene(page);await centerStudy(page,'pattern');
 const canvas=await page.locator(stageCanvas).elementHandle(),held=await sample(page);
 const start=held.placement.holdEnd-60,target=held.placement.holdEnd+(held.placement.end-held.placement.holdEnd)*.55;
 await scrollTo(page,start);const initial=await sample(page);expect(initial.placement).toMatchObject({x:0,y:0,scale:1,opacity:1,mode:'hold'});
 await page.clock.pauseAt(new Date(Date.now()+3600000));
 try{
  await page.evaluate(top=>window.scrollTo({top,behavior:'instant'}),target);const forward=[];
  for(let i=0;i<8;i++){await page.clock.fastForward(50);forward.push(await sample(page));}
  expect(forward.some(s=>!s.placement.settled&&s.placement.mode==='exit')).toBe(true);
  expect(forward.some(s=>s.placement.x<-20&&s.placement.opacity<.99)).toBe(true);
  for(const current of forward){expect(current.placement.chapter).toBe('pattern');expect(current.placement.scale).toBe(1);expect(current.rect.width).toBe(initial.rect.width);}
  await page.evaluate(top=>window.scrollTo({top,behavior:'instant'}),start);const reverse=[];
  for(let i=0;i<24;i++){await page.clock.fastForward(100);reverse.push(await sample(page));}
  expect(reverse.some(s=>!s.placement.settled&&s.placement.x>forward.at(-1).placement.x)).toBe(true);
  expect(reverse.at(-1).placement).toMatchObject({chapter:'pattern',x:0,y:0,scale:1,opacity:1,visible:true,settled:true,mode:'hold'});
  expect(await page.evaluate(el=>document.querySelector('[data-cinematic-stage] canvas')===el,canvas)).toBe(true);
  await expect(page.locator(stageCanvas)).toHaveCount(1);await expect(page.locator('canvas[data-ascii-field]')).toHaveCount(1);
 }finally{await page.clock.resume();}
});

test('native forward and reverse chapter scrolling never fades or remounts the already painted Bending source block',async({page})=>{
 test.setTimeout(scenarioTimeout(120000));await loadScene(page);
 const canvas=await page.locator(stageCanvas).elementHandle();
 const trace=await page.evaluateHandle(()=>{
  let running=true,raf;const samples=[];
  const record=()=>{if(!running)return;const story=window.__story.inspect(),scene=window.__thesis.inspect(),stage=document.querySelector('[data-cinematic-stage]');samples.push({chapter:story.canvasPlacement.chapter,pose:{x:story.canvasPlacement.x,y:story.canvasPlacement.y,opacity:story.canvasPlacement.opacity},cssOpacity:Number(getComputedStyle(stage).opacity),source:scene.source,ready:scene.ready});raf=requestAnimationFrame(record);};record();
  return{samples,dispose(){running=false;cancelAnimationFrame(raf);}};
 });
 try{
  for(const chapter of ['form','system','pattern','system','form']){
   const y=await page.locator(`[data-story-chapter="${chapter}"]`).evaluate(node=>{let y=0;for(let n=node;n;n=n.offsetParent)y+=n.offsetTop;return y;});
   await scrollTo(page,y);expect((await sample(page)).placement.chapter).toBe(chapter);
   expect(await page.evaluate(node=>node===document.querySelector('[data-cinematic-stage] canvas'),canvas)).toBe(true);
  }
  const samples=await trace.evaluate(value=>value.samples);expect(samples.length).toBeGreaterThan(5);
  for(const current of samples){expect(current.pose).toEqual({x:0,y:0,opacity:1});expect(current.cssOpacity).toBe(1);expect(current.ready).toBe(true);}
  await test.info().attach('continuous-bending-native-passage',{body:JSON.stringify(samples),contentType:'application/json'});
 }finally{await trace.evaluate(value=>value.dispose());await trace.dispose();}
 await page.locator('[data-chapter-link="credits"]').click();await settle(page);
 expect((await sample(page)).placement).toMatchObject({chapter:'credits',visible:false,opacity:0,mode:'absent'});
 await frames(page,8);expect((await sample(page)).suspended).toBe(true);
});
