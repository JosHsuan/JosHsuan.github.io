import {test, expect} from '@playwright/test';
import {scenarioTimeout, frames, loadScene, settle} from './case-helpers.mjs';
import {RENDER_PIXEL_BUDGET} from '../../roles/uiux-designer/cases/bending-active-thesis/components/render-budget.mjs';

const RESOURCE_WAIT = 20000;
const binaryAssets = /\/(?:source-layers\.glb|studio-small\.hdr|source-diagrams\.glb)(?:\?|$)/;

// The installed clock controls renderer sampling only. Native scroll, never
// elapsed idle time or removed comparison buttons, chooses source identity.
async function pauseResourceClock(page) {
  const now=await page.evaluate(()=>Date.now());
  // Read the browser's installed clock, with enough future margin for slow
  // IPC; a Node wall-clock date or a one-second margin can already be past.
  await page.clock.pauseAt(new Date(now+60000));
  return async (operation,stepMilliseconds=48)=>{
    let finished=false,failure;
    const pending=operation().then(()=>{finished=true;},error=>{failure=error;finished=true;});
    for(let step=0;step<600&&!finished;step++)await page.clock.fastForward(stepMilliseconds);
    if(!finished){await page.clock.resume();await pending;throw Error('Controlled allocation route did not complete');}
    await pending;if(failure)throw failure;
  };
}

async function centerStudy(page,chapter='system',progress=.5) {
  const goal=await page.evaluate(({chapter,progress})=>{
    const naturalY=node=>{let y=0;for(;node;node=node.offsetParent)y+=node.offsetTop;return y;};
    const sections=[...document.querySelectorAll('[data-story-chapter]')],index=sections.findIndex(node=>node.dataset.storyChapter===chapter),top=naturalY(sections[index]),end=naturalY(sections[index+1]);
    return Math.max(0,Math.min(document.documentElement.scrollHeight-innerHeight,top+(end-top)*progress-innerHeight*.45));
  },{chapter,progress});
  await page.evaluate(goal=>scrollTo({top:goal,behavior:'instant'}),goal);await settle(page);
  await page.waitForFunction(chapter=>window.__thesis.inspect().representation.chapterId===chapter&&window.__thesis.inspect().sourceVisible,chapter,{timeout:RESOURCE_WAIT});
}

async function warmSourceRepresentations(page,drive) {
  const warm=operation=>drive(operation,500),painted=[];
  for(const [chapter,positions] of [['system',[.125,.375,.625,.77]],['pattern',[.167,.5,.70]]]){
    const seen=new Set();
    for(const [expected,progress] of positions.entries()){
      const previous=await page.evaluate(()=>window.__thesis.inspect().frames);
      await warm(()=>centerStudy(page,chapter,progress));
      const value=await page.evaluate(()=>{
        const scene=window.__thesis.inspect(),story=window.__story.inspect();
        return{id:scene.representation.id,index:scene.representation.index,chapter:scene.representation.chapterId,pinned:scene.representation.pinned,
          selected:story.sourceSelection,held:story.modelHeldSource,engaged:story.modelEngaged,
          memory:scene.memory,programs:scene.renderer.programs,detail:scene.detail,
          frames:scene.frames,controllerFrame:story.controllerFrame,renderedControllerFrame:scene.renderedControllerFrame};
      });
      expect(value).toMatchObject({index:expected,chapter,pinned:false,engaged:false,detail:'full'});
      expect(value.frames).toBeGreaterThan(previous);seen.add(value.id);painted.push(value);
    }
    expect(seen.size).toBe(positions.length);
    await (chapter==='pattern'?drive:warm)(()=>settle(page));
  }
  expect(new Set(painted.map(value=>value.id)).size).toBe(7);
  await test.info().attach('scroll-source-material-warmup',{body:JSON.stringify(painted),contentType:'application/json'});
}

async function readResources(page) {
  return page.evaluate(() => {
    const scene = window.__thesis.inspect();
    const stage=document.querySelector('[data-cinematic-stage]');
    return {ready: scene.ready, frames: scene.frames, initialization: scene.initialization,detail:scene.detail,shadowEnabled:scene.renderer.shadowEnabled,
      memory: scene.memory, programs: scene.renderer.programs,
      source: scene.source, diagrams: scene.diagramSource, budget: scene.renderBudget,
      logicalSurface:stage?{width:stage.offsetWidth,height:stage.offsetHeight}:null,
      compositor: scene.compositor ?? null, canvases: document.querySelectorAll('[data-cinematic-stage] canvas').length};
  });
}

async function profile(page, viewport) {
  const before = await page.evaluate(() => {
    const stage=document.querySelector('[data-cinematic-stage]');
    return {frame:window.__thesis.inspect().frames,coarse:matchMedia('(pointer:coarse)').matches,width:stage.offsetWidth,height:stage.offsetHeight};
  });
  const frame=before.frame;
  await page.setViewportSize(viewport);
  await centerStudy(page,'system');
  await page.waitForFunction(frame => {
    const scene = window.__thesis?.inspect(), story = window.__story?.inspect(), budget = scene?.renderBudget;
    const stage=document.querySelector('[data-cinematic-stage]');
    return scene?.ready && scene.frames > frame && budget?.viewportWidth === stage?.offsetWidth && budget.viewportHeight === stage?.offsetHeight
      && budget.detail === 'full' && story?.settled && story.canvasPlacement?.settled && !story.readingPending;
  }, frame, {timeout: RESOURCE_WAIT});
  const value = await readResources(page);
  expect(value.canvases).toBe(1);
  const width=viewport.width;
  expect(value.logicalSurface.width).toBeCloseTo(Math.round(width),0);
  // Coarse devices retain their logical height while browser chrome changes
  // only the available height. A width/orientation change refreshes both axes.
  const expectedHeight=before.coarse&&before.width===viewport.width?before.height:viewport.height;
  expect(value.logicalSurface.height).toBeCloseTo(expectedHeight,0);
  expect(value.budget.viewportWidth).toBe(value.logicalSurface.width);
  expect(value.budget.viewportHeight).toBe(value.logicalSurface.height);
  expect(value.budget.pixels).toBe(value.budget.width * value.budget.height);
  expect(value.budget.pixels).toBeLessThanOrEqual(value.budget.pixelBudget);
  expect(value.compositor).toMatchObject({width: value.budget.width, height: value.budget.height, dpr: value.budget.dpr});
  expect(value.detail).toBe('full');expect(value.shadowEnabled).toBe(true);
  expect(value.compositor.mist.enabled).toBe(true);expect(value.compositor.retainedMistBytes).toBeGreaterThan(0);
  if(before.coarse)expect(value.compositor.requestedSamples).toBe(0);
  else expect(value.compositor.requestedSamples).toBeGreaterThan(0);
  return value;
}

test('Full 4K resize cycles retain source data, optics and bounded stable rendering resources', async ({page}) => {
  // Seven actual source paints precede three resize rounds; this wall-clock
  // allowance includes controlled warmup plus real-time resize IPC on a
  // software GPU; it is not a product performance threshold.
  test.setTimeout(scenarioTimeout(300000));
  // Observe each native dimension setter, including the intermediate width /
  // old-height combination. A final correct diagnostic cannot hide a transient
  // oversized backing buffer allocated by Fiber before the next World frame.
  await page.addInitScript(() => {
    const records = new WeakMap();
    for (const axis of ['width', 'height']) {
      const descriptor = Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype, axis);
      Object.defineProperty(HTMLCanvasElement.prototype, axis, {...descriptor, set(value) {
        descriptor.set.call(this, value);
        if (!records.has(this)) records.set(this, []);
        records.get(this).push({axis, width: this.width, height: this.height, pixels: this.width * this.height});
      }});
    }
    window.__recordedCanvasSizes = element => records.get(element) ?? [];
  });
  const errors = [], requests = []; page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => {if (binaryAssets.test(request.url())) requests.push(new URL(request.url()).pathname);});
  const originalViewport = page.viewportSize();
  await page.clock.install();await loadScene(page);
  const drive=await pauseResourceClock(page);
  try{await warmSourceRepresentations(page,drive);}finally{await page.clock.resume();}
  // Resize rounds retain normal autonomous playback and pressure adaptation.
  await centerStudy(page,'system');
  const canvas = await page.locator('[data-cinematic-stage] canvas').elementHandle(), source = await readResources(page);
  expect(source.source).toMatchObject({vertices: 172789, triangles: 227521, sourceObjects: 51});
  expect(source.diagrams.representations).toHaveLength(7);
  const round = async () => {
    for (const viewport of [{width:1440,height:1000},{width:1440,height:2560},{width:3840,height:2160},originalViewport]) {
      const value = await profile(page, viewport);
      expect(value.source).toEqual(source.source); expect(value.diagrams).toEqual(source.diagrams);
      if (viewport.width === 3840) expect(value.logicalSurface).toEqual({width:3840,height:2160});
    }
    // The fullviewport layout uses a bounded drawing buffer. Exercise the native
    // budget boundary separately with deliberately oversized fixture dimensions,
    // including a wide-new-width / tall-old-height intermediate assignment.
    for(const dimensions of [{width:1440,height:2560},{width:3840,height:2160}]){
      await page.locator('[data-cinematic-stage]').evaluate((element,value)=>{
        element.style.width=value.width+'px';element.style.height=value.height+'px';
      },dimensions);
      await page.waitForFunction(expected=>{
        const budget=window.__thesis.inspect().renderBudget;
        return budget.viewportWidth===expected.width&&budget.viewportHeight===expected.height;
      },dimensions,{timeout:RESOURCE_WAIT});
      await settle(page);
      const oversized=await readResources(page);
      expect(oversized.budget.bounded).toBe(true);
      expect(oversized.budget.pixels).toBeLessThanOrEqual(oversized.budget.pixelBudget);
      expect(oversized.source).toEqual(source.source);expect(oversized.diagrams).toEqual(source.diagrams);
    }
    await page.locator('[data-cinematic-stage]').evaluate(element=>{element.style.removeProperty('width');element.style.removeProperty('height');});
    await page.waitForFunction(()=>{
      const stage=document.querySelector('[data-cinematic-stage]'),budget=window.__thesis.inspect().renderBudget;
      return budget.viewportWidth===stage.offsetWidth&&budget.viewportHeight===stage.offsetHeight;
    },null,{timeout:RESOURCE_WAIT});
    await settle(page);
    const value = await readResources(page);
    expect(value.compositor).toMatchObject({width:value.budget.width,height:value.budget.height,dpr:value.budget.dpr});
    return {memory: value.memory, programs: value.programs, width: value.compositor.width, height: value.compositor.height,densityScale:value.budget.densityScale};
  };
  // Normal scroll-owned views retain Full source detail; measured slow-device
  // pressure may legitimately lower drawing density without changing geometry.
  // Explicit source
  // warmup covers lazy geometry/shader creation; one complete resize cycle warms
  // the target configuration, then returns to the same viewport;
  // these resource counts are neither byte-accurate VRAM nor device capacity.
  const warm = await round(),rounds=[warm];
  for(let cycle=0;cycle<2;cycle++){
    const previous=rounds.at(-1),value=await round();rounds.push(value);
    expect(value.memory).toEqual(warm.memory);expect(value.programs).toBe(warm.programs);
    expect(value.densityScale).toBeLessThanOrEqual(previous.densityScale);
    if(value.densityScale===previous.densityScale){
      expect(value.width).toBe(previous.width);expect(value.height).toBe(previous.height);
    }else{
      expect(value.width).toBeLessThanOrEqual(previous.width);expect(value.height).toBeLessThanOrEqual(previous.height);
    }
  }
  await test.info().attach('resize-round-resource-records',{body:JSON.stringify(rounds),contentType:'application/json'});
  expect(await page.evaluate(element => document.querySelector('[data-cinematic-stage] canvas') === element, canvas)).toBe(true);
  const assignments = await page.evaluate(element => window.__recordedCanvasSizes(element), canvas);
  expect(assignments.length).toBeGreaterThan(20);
  const oversized = assignments.filter(value => value.pixels > RENDER_PIXEL_BUDGET);
  expect(oversized, 'Every native width/height assignment must remain inside the Full product budget.').toEqual([]);
  await test.info().attach('canvas-size-assignments', {body: JSON.stringify(assignments), contentType: 'application/json'});
  expect(requests.filter(path => path.endsWith('source-layers.glb'))).toHaveLength(1);
  expect(requests.filter(path => path.endsWith('source-diagrams.glb'))).toHaveLength(1);
  expect(requests.filter(path => path.endsWith('studio-small.hdr'))).toHaveLength(1);
  expect(errors).toEqual([]);
});

test('Full chapter holds and transitions preserve one Canvas without reallocating its backing storage',async({page})=>{
  // Full source/material warmup and twelve actual transition positions can
  // exceed two minutes on a software GPU; assertions use controlled frame time.
  test.setTimeout(scenarioTimeout(300000));
  await page.addInitScript(()=>{
    const counts={canvasWrites:0,textures:0,renderbuffers:0};window.__dockingAllocations=counts;
    for(const axis of ['width','height']){
      const descriptor=Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype,axis);
      Object.defineProperty(HTMLCanvasElement.prototype,axis,{...descriptor,set(value){counts.canvasWrites++;descriptor.set.call(this,value);}});
    }
    for(const name of ['texStorage2D','renderbufferStorage','renderbufferStorageMultisample']){
      const original=WebGL2RenderingContext.prototype[name];
      WebGL2RenderingContext.prototype[name]=function(...args){counts[name==='texStorage2D'?'textures':'renderbuffers']++;return original.apply(this,args);};
    }
  });
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.clock.install();await loadScene(page);
  const drive=await pauseResourceClock(page);
  await warmSourceRepresentations(page,drive);
  // Advance browser RAF/timers deliberately while executing the real scroll
  // and renderer pipeline. This checks allocation behavior, not delivered FPS
  // or sustained-device stability. No model hold suppresses Canvas transitions.
  const canvas=await page.locator('[data-cinematic-stage] canvas').elementHandle();
  const capture=()=>page.evaluate(()=>{
    const scene=window.__thesis.inspect(),story=window.__story.inspect(),stage=document.querySelector('[data-cinematic-stage]');
    return{counts:{...window.__dockingAllocations},budget:scene.renderBudget,memory:scene.memory,frames:scene.frames,pressure:scene.renderPressure,frameDelta:story.frameDelta,
      samples:scene.compositor.requestedSamples,placement:story.canvasPlacement,scroll:scrollY,transform:stage.style.transform};
  });
  const route=async()=>{
    const records=[];
    for(const chapter of ['form','system','pattern']){
      await drive(()=>centerStudy(page,chapter));records.push(await capture());
      const start=await page.evaluate(()=>({y:scrollY,travel:Math.min(240,innerHeight*.35)}));
      // All phone studies share one centered frame. Visit two distinct clipped
      // positions within each study, rather than counting the same center and
      // edge repeatedly across three different chapters.
      for(const fraction of [.5,1]){
        await page.evaluate(({y,travel,fraction})=>window.scrollTo({top:y+travel*fraction,behavior:'instant'}),{...start,fraction});
        await drive(()=>settle(page));records.push(await capture());
      }
      await drive(()=>centerStudy(page,chapter));records.push(await capture());
    }
    return records;
  };
  // Every source/material has already been painted, so measure the complete
  // three-chapter route once without an additional duplicate warmup route.
  // Each 48ms step delivers one RAF below the pressure policy's 50ms threshold.
  // This is functional timing, not an FPS measurement; Full optics stay active.
  const before=await capture();expect(before.frameDelta).toBeLessThanOrEqual(.05);
  const records=await route(),after=await capture();
  await test.info().attach('scroll-docking-allocation-records',{body:JSON.stringify({before,records,after}),contentType:'application/json'});
  expect(records).toHaveLength(12);
  for(const value of records){
    expect(value.counts).toEqual(before.counts);
    expect(value.budget).toEqual(before.budget);
    expect(value.samples).toBe(before.samples);
    expect(value.pressure.decisions).toBe(before.pressure.decisions);
    expect(value.frameDelta).toBeLessThanOrEqual(.05);
  }
  expect(after.frames).toBeGreaterThan(before.frames);
  expect(after.memory).toEqual(before.memory);
  expect(records.every(value=>value.placement.scale===1)).toBe(true);
  expect(records.some(value=>value.placement.mode==='hold')).toBe(true);
  expect(records.filter(value=>value.placement.mode==='hold').every(value=>value.placement.x===0&&value.placement.y===0)).toBe(true);
  expect(await page.evaluate(element=>document.querySelector('[data-cinematic-stage] canvas')===element,canvas)).toBe(true);
  await expect(page.locator('[data-cinematic-stage] canvas')).toHaveCount(1);expect(errors).toEqual([]);
  await page.clock.resume();
});

test('assets completing after synthetic pagehide wait before constructing scene GPU resources', async ({page}) => {
  test.setTimeout(scenarioTimeout(60000));
  const errors = [], requests = [], pending = [];
  page.on('pageerror', error => errors.push(error.message));
  let release; const gate = new Promise(resolve => {release = resolve;});
  await page.route(binaryAssets, async route => {
    requests.push(new URL(route.request().url()).pathname);
    const response = await route.fetch();
    pending.push(response);
    await gate; await route.fulfill({response});
  });
  try {
    await page.goto('/projects/bending-active/#overview', {waitUntil: 'domcontentloaded'});
    await page.waitForFunction(() => window.__thesis && window.__story, null, {timeout: RESOURCE_WAIT});
    await expect.poll(() => pending.length, {timeout: RESOURCE_WAIT}).toBe(3);
    const initial = await readResources(page);
    await page.evaluate(() => window.dispatchEvent(new Event('pagehide')));
    release();
    await page.waitForFunction(() => window.__thesis.inspect().initialization.phase === 'awaiting-visibility', null, {timeout: RESOURCE_WAIT});
    const held = await readResources(page);
    expect(held).toMatchObject({ready: false, frames: 0, initialization: {phase: 'awaiting-visibility', gpuInitializationAttempts: 0}, source: null, budget: null, compositor: null, canvases: 1, memory: initial.memory, programs: initial.programs});
    await frames(page, 5); expect(await readResources(page)).toEqual(held);
    // A WebGL context already exists; only source-scene GPU initialization is
    // deferred. Synthetic delivery does not claim real Safari process recovery.
    await page.evaluate(() => window.dispatchEvent(new Event('pageshow')));
    await page.waitForFunction(() => window.__thesis.inspect().ready, null, {timeout: RESOURCE_WAIT});
    const ready = await readResources(page);
    expect(ready.initialization).toEqual({phase: 'ready', gpuInitializationAttempts: 1}); expect(ready.canvases).toBe(1);
    expect(ready.source).toMatchObject({vertices: 172789, triangles: 227521, sourceObjects: 51});
    expect(ready.diagrams.representations).toHaveLength(7);
    expect(requests).toHaveLength(3); expect(new Set(requests).size).toBe(3); expect(errors).toEqual([]);
  } finally {release();}
});
