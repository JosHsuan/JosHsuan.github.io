import {test,expect} from '@playwright/test';
import {WAIT,scenarioTimeout,loadScene,centerStudy,hitPoint,surface,frames,settle} from './case-helpers.mjs';

// Mobile uses browser-native touch input, so this exercises CSS touch-action,
// pointer capture and actual page pan instead of synthetic PointerEvents.
test('mouse orbits both axes while native source touch pans and taps compare',async({page,context,isMobile})=>{
 test.setTimeout(scenarioTimeout(150000));
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await loadScene(page);await centerStudy(page);
 const touchAction=await surface(page).evaluate(el=>getComputedStyle(el).touchAction);
 expect(['manipulation','pan-x pan-y pinch-zoom']).toContain(touchAction);
 await expect(surface(page)).toHaveCSS('pointer-events','auto');
 const cdp=isMobile?await context.newCDPSession(page):null;
 const pressSnapshot=await page.evaluateHandle(()=>{
  const sample={};
  document.addEventListener('pointerdown',()=>{
   const source=window.__thesis.inspect().representation;
   Object.assign(sample,{source:source.id,index:source.index,chapterId:source.chapterId,scroll:scrollY});
  },{capture:true,once:true});
  return sample;
 });
 const p=await hitPoint(page),scrollBeforePress=await page.evaluate(()=>scrollY);
 let touchActive=false;
 const start=async()=>{
  if(cdp){await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...p,id:1}]});touchActive=true;}
  else{await page.mouse.move(p.x,p.y);await page.mouse.down();}
 };
 const move=async(dx,dy)=>{
  if(cdp)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:p.x+dx,y:p.y+dy,id:1}]});
  else await page.mouse.move(p.x+dx,p.y+dy,{steps:4});
  await frames(page);
 };
 try{
  if(cdp){
   // Observe explicit application capture separately from the browser's legal
   // implicit touch capture. Native touch must never request orbit ownership.
   await surface(page).evaluate(el=>{
    const original=el.setPointerCapture;
    el.__captureCalls=0;
    el.setPointerCapture=function(...args){el.__captureCalls++;return original.apply(this,args);};
    el.__restoreCapture=()=>{delete el.setPointerCapture;delete el.__captureCalls;delete el.__restoreCapture;};
   });
   const neutral=await page.evaluate(()=>window.__story.inspect().inspection.value);
   await start();
   expect(await page.evaluate(()=>window.__story.inspect().modelEngaged)).toBe(false);
   await expect(surface(page)).not.toHaveAttribute('data-model-dragging','true');
   for(let i=1;i<=6;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:p.x,y:p.y-i*20,id:1}]});
   await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});touchActive=false;
   await expect.poll(()=>page.evaluate(()=>scrollY),{timeout:WAIT}).toBeGreaterThan(scrollBeforePress+30);
   await settle(page);
   const panned=await page.evaluate(()=>window.__story.inspect());
   expect(panned.modelEngaged).toBe(false);expect(panned.modelHeldSource).toBeNull();expect(panned.sourceSelection).toBeNull();
   expect(panned.inspection.value).toEqual(neutral);expect(panned.inspection.target).toEqual(neutral);
   expect(await surface(page).evaluate(el=>el.__captureCalls)).toBe(0);
   await expect(surface(page)).not.toHaveAttribute('data-model-dragging','true');

   // A short actual source tap still selects the next painted comparison.
   await centerStudy(page);const tap=await hitPoint(page);
   const tapReceipt=await surface(page).evaluateHandle(el=>{
    const receipt={};document.addEventListener('pointerup',()=>{receipt.index=Number(el.dataset.sourceIndex);},{capture:true,once:true});return receipt;
   });
   try{
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...tap,id:2}]});touchActive=true;
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});touchActive=false;
    const tapped=await tapReceipt.jsonValue();expect(Number.isInteger(tapped.index)).toBe(true);
    await expect.poll(()=>page.evaluate(()=>window.__story.inspect().sourceSelection?.index),{timeout:WAIT}).toBe((tapped.index+1)%4);
    expect(await page.evaluate(()=>window.__story.inspect().sourceSelection.chapterId)).toBe('form');
    await expect.poll(()=>page.evaluate(()=>{const r=window.__thesis.inspect().representation;return {chapterId:r.chapterId,index:r.index,pinned:r.pinned};}),{timeout:WAIT}).toEqual({chapterId:'form',index:(tapped.index+1)%4,pinned:true});
    expect(await surface(page).evaluate(el=>el.__captureCalls)).toBe(0);
    expect(await page.evaluate(()=>window.__story.inspect().modelEngaged)).toBe(false);
    await surface(page).press('Escape');await settle(page);
   }finally{await tapReceipt.dispose();}
  }else{
  await start();
  const pressed=await pressSnapshot.jsonValue();
  await expect.poll(()=>page.evaluate(()=>window.__story.inspect().modelEngaged),{timeout:WAIT}).toBe(true);
  await settle(page);
  // Autoplay may advance before pointerdown, but the source displayed at that
  // native event must survive the handoff to the next successfully drawn frame.
  const held=await page.evaluate(()=>({
   pose:window.__thesis.inspect().pose,source:window.__thesis.inspect().representation.id,
   inspection:window.__story.inspect().inspection.value,time:window.__story.inspect().playback.activeSeconds,scroll:scrollY,
   heldSource:window.__story.inspect().modelHeldSource,pinned:window.__thesis.inspect().representation.pinned,
  }));
  expect(pressed.scroll).toBe(scrollBeforePress);
  expect(held).toMatchObject({source:pressed.source,scroll:pressed.scroll,pinned:false,heldSource:{chapterId:pressed.chapterId,index:pressed.index}});
  await move(30,24);
  await expect.poll(()=>page.evaluate(()=>window.__story.inspect().inspection.target.azimuth)).toBeCloseTo(held.inspection.azimuth-6.9,4);
  await expect.poll(()=>page.evaluate(()=>window.__story.inspect().inspection.target.elevation)).toBeCloseTo(held.inspection.elevation+4.32,4);
  await settle(page);
  const rightDown=await page.evaluate(()=>({pose:window.__thesis.inspect().pose,scroll:scrollY,source:window.__thesis.inspect().representation.id,time:window.__story.inspect().playback.activeSeconds}));
  // The existing camera owner renders the requested orbit. Reversing camera
  // azimuth makes the source surface turn right; elevation makes it turn down.
  expect(rightDown.pose.azimuth).toBeLessThan(held.pose.azimuth);expect(rightDown.pose.elevation).toBeGreaterThan(held.pose.elevation);
  expect(rightDown).toMatchObject({scroll:held.scroll,source:held.source,time:held.time});
  await move(-30,-24);await settle(page);
  const leftUp=await page.evaluate(()=>({pose:window.__thesis.inspect().pose,scroll:scrollY,source:window.__thesis.inspect().representation.id,time:window.__story.inspect().playback.activeSeconds}));
  expect(leftUp.pose.azimuth).toBeGreaterThan(held.pose.azimuth);expect(leftUp.pose.elevation).toBeLessThan(held.pose.elevation);
  expect(leftUp).toMatchObject({scroll:held.scroll,source:held.source,time:held.time});
  if(cdp){await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});touchActive=false;}else await page.mouse.up();
  await settle(page);
  const released=await page.evaluate(()=>window.__story.inspect());
  expect(released.modelEngaged).toBe(false);expect(released.sourceSelection).toBeNull();expect(released.modelHeldSource).toBeNull();
  expect(released.inspection.value).toMatchObject({azimuth:30,elevation:30});
  await expect(surface(page)).not.toHaveAttribute('data-model-dragging','true');

  }

  const outside=await page.evaluate(()=>{
   for(const x of [8,innerWidth-8,innerWidth*.5])for(const y of [innerHeight*.7,innerHeight*.55]){
    const el=document.elementFromPoint(x,y);
    if(el&&!el.closest('[data-model-viewport],button,a,input,select,summary'))return{x,y};
   }
   throw Error('No native reading region outside the model');
  });
  const scrollBefore=await page.evaluate(()=>scrollY);
  if(cdp){
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...outside,id:1}]});touchActive=true;
   for(let i=1;i<=6;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:outside.x,y:outside.y-i*20,id:1}]});
   await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});touchActive=false;
  }else{await page.mouse.move(outside.x,outside.y);await page.mouse.wheel(0,140);}
  await expect.poll(()=>page.evaluate(()=>scrollY),{timeout:WAIT}).toBeGreaterThan(scrollBefore+30);
  expect(await page.evaluate(()=>document.body.style.overflow)).not.toBe('hidden');

  // Retaining keyboard focus keeps the overlay mounted during a non-model
  // chapter. Its invisible viewport must still release native pointer input.
  await surface(page).evaluate(el=>el.focus({preventScroll:true}));
  await page.evaluate(()=>{
   const section=document.querySelector('[data-story-chapter="make"]');
   let y=0;for(let el=section;el;el=el.offsetParent)y+=el.offsetTop;
   scrollTo({top:y+Math.max(0,(section.offsetHeight-innerHeight)/2),behavior:'instant'});
  });
  await settle(page);
  await expect(page.locator('[data-model-overlay]')).toHaveAttribute('data-model-ui-visible','false');
  expect(await surface(page).evaluate(el=>document.activeElement===el)).toBe(true);
  await expect(surface(page)).toHaveCSS('pointer-events','none');
  expect(errors).toEqual([]);
 }finally{
  if(cdp){if(touchActive)await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});await cdp.detach();}
  else await page.mouse.up();
  if(cdp)await surface(page).evaluate(el=>el.__restoreCapture?.()).catch(()=>{});
  await pressSnapshot.dispose();
 }
});
