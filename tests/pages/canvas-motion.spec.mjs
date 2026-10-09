import {test,expect} from '@playwright/test';
import {WAIT,scenarioTimeout,pause,settle,centerStudy,frames} from './case-helpers.mjs';

test('the retained Canvas owns scroll travel while its local camera holds and evidence chapters sleep',async({page})=>{
  test.setTimeout(scenarioTimeout(120000));
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');await page.waitForFunction(()=>window.__thesis?.inspect().ready,null,{timeout:WAIT});await pause(page);
  const canvas=await page.locator('canvas').elementHandle();
  const sample=()=>page.evaluate(()=>{
    const scene=window.__thesis.inspect(),story=window.__story.inspect(),el=document.querySelector('canvas'),r=el.getBoundingClientRect();
    return {placement:story.canvasPlacement,pose:scene.pose,frames:scene.frames,time:story.playback.activeSeconds,rect:{x:r.x,y:r.y,width:r.width,height:r.height},surface:story.canvasSurface,screen:{width:innerWidth,height:innerHeight},native:[el.width,el.height],suspended:scene.renderSuspended};
  });
  const before=await sample();
  expect(before.surface.width*before.surface.height).toBeLessThan(before.screen.width*before.screen.height*.5);
  expect(before.pose.compositionSpace).toBe('canvas-local');
  await page.evaluate(()=>scrollBy({top:100,behavior:'instant'}));await settle(page);
  const moved=await sample();
  expect(moved.rect).not.toEqual(before.rect);
  expect(moved.native).toEqual(before.native);
  expect(moved.pose.position).toEqual(before.pose.position);
  expect(Math.abs(moved.pose.viewOffsetNormalized.x)).toBe(0);expect(Math.abs(moved.pose.viewOffsetNormalized.y)).toBe(0);
  expect(moved.time).toBe(before.time);
  // Resume the authored clock, then prove absence really stops GL work even
  // while the ordinary DOM/story controller and evidence remain available.
  await page.getByRole('button',{name:'Resume motion',exact:true}).click();
  await page.evaluate(()=>{
    const stage=document.querySelector('[data-cinematic-stage]');window.__staleCanvasPaint=[];
    window.__paintObserver=new MutationObserver(()=>{
      const story=window.__story.inspect();
      if(Number(stage.style.opacity)>0&&story.canvasAwaitingPaint)window.__staleCanvasPaint.push(story.canvasPlacement);
    });window.__paintObserver.observe(stage,{attributes:true,attributeFilter:['style']});
  });
  for(const chapter of ['make','validation']){
    await page.locator('[data-chapter-link="'+chapter+'"]').click();await settle(page);
    const held=await sample();expect(held.placement).toMatchObject({visible:false,settled:true,mode:'absent'});expect(held.suspended).toBe(true);
    await frames(page,12);const after=await sample();expect(after.frames).toBe(held.frames);expect(after.time).toBeGreaterThan(held.time);
    expect(await page.evaluate(el=>document.querySelector('canvas')===el,canvas)).toBe(true);
  }
  await centerStudy(page,'system');const returned=await sample();expect(returned.suspended).toBe(false);expect(returned.placement.visible).toBe(true);
  await expect.poll(()=>page.evaluate(()=>window.__thesis.inspect().frames)).toBeGreaterThan(returned.frames);
  expect(await page.evaluate(()=>{window.__paintObserver.disconnect();return window.__staleCanvasPaint;})).toEqual([]);
  // A fine pointer's field interference follows the local displayed raster,
  // including its translation/uniform scale, rather than the page viewport.
  if(await page.evaluate(()=>matchMedia('(hover:hover) and (pointer:fine)').matches)){
    const rect=await page.locator('canvas').boundingBox();await page.mouse.move(rect.x+rect.width*.25,rect.y+rect.height*.25);await settle(page);
    const field=await page.evaluate(()=>window.__story.inspect().chapterScene.field);
    expect(field.fieldPointerUv[0]).toBeCloseTo(.25,2);expect(field.fieldPointerUv[1]).toBeCloseTo(.75,2);expect(field.fieldPointerStrength).toBeGreaterThan(0);
  }
  await expect(page.locator('canvas')).toHaveCount(1);expect(errors).toEqual([]);
});

test('scroll motion travels through intermediate Canvas transforms and reverses without remounting',async({page})=>{
  test.setTimeout(scenarioTimeout(120000));
  await page.clock.install();await page.goto('/');await page.getByRole('combobox',{name:'Visual detail',exact:true}).selectOption('light');
  await page.waitForFunction(()=>window.__thesis?.inspect().ready,null,{timeout:WAIT});await settle(page);
  const initial=await page.evaluate(()=>({...window.__story.inspect().canvasPlacement}));
  await page.clock.pauseAt(new Date(Date.now()+3600000));
  try{
    const samples=[];
    await page.evaluate(()=>scrollBy({top:180,behavior:'instant'}));
    for(let i=0;i<8;i++){await page.clock.fastForward(50);samples.push(await page.evaluate(()=>({...window.__story.inspect().canvasPlacement})));}
    expect(samples.some(s=>!s.settled&&s.mode==='travelling')).toBe(true);
    expect(samples.some(s=>Math.abs(s.y-initial.y)>1||Math.abs(s.scale-initial.scale)>.01)).toBe(true);
    await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
    for(let i=0;i<24;i++)await page.clock.fastForward(250);
    const returned=await page.evaluate(()=>window.__story.inspect().canvasPlacement);
    expect(returned.settled).toBe(true);expect(returned.x).toBeCloseTo(initial.x,1);expect(returned.y).toBeCloseTo(initial.y,1);expect(returned.scale).toBeCloseTo(initial.scale,2);
    await expect(page.locator('canvas')).toHaveCount(1);
  }finally{await page.clock.resume();}
});
