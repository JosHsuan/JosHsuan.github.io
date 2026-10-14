import {test,expect} from '@playwright/test';
import {WAIT,scenarioTimeout,loadScene,centerStudy,hitPoint,surface,frames,settle} from './case-helpers.mjs';

// Mobile uses browser-native touch input, so this exercises CSS touch-action,
// pointer capture and actual page pan instead of synthetic PointerEvents.
test('model follows mouse or touch in both axes and outside gestures scroll the page',async({page,context,isMobile})=>{
 test.setTimeout(scenarioTimeout(150000));
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await loadScene(page);await centerStudy(page);
 const p=await hitPoint(page),before=await page.evaluate(()=>({
  scroll:scrollY,source:window.__thesis.inspect().representation.id,
  azimuth:window.__story.inspect().inspection.value.azimuth,
  elevation:window.__story.inspect().inspection.value.elevation,
 }));
 await expect(surface(page)).toHaveCSS('touch-action','none');
 await expect(surface(page)).toHaveCSS('pointer-events','auto');
 const cdp=isMobile?await context.newCDPSession(page):null;
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
  await start();
  await expect.poll(()=>page.evaluate(()=>window.__story.inspect().modelEngaged),{timeout:WAIT}).toBe(true);
  await settle(page);
  const heldPose=await page.evaluate(()=>window.__thesis.inspect().pose);
  await move(30,24);
  await expect.poll(()=>page.evaluate(()=>window.__story.inspect().inspection.target.azimuth)).toBeCloseTo(before.azimuth-6.9,4);
  await expect.poll(()=>page.evaluate(()=>window.__story.inspect().inspection.target.elevation)).toBeCloseTo(before.elevation+4.32,4);
  await settle(page);
  const rightDown=await page.evaluate(()=>({pose:window.__thesis.inspect().pose,scroll:scrollY,source:window.__thesis.inspect().representation.id}));
  // The existing camera owner renders the requested orbit. Reversing camera
  // azimuth makes the source surface turn right; elevation makes it turn down.
  expect(rightDown.pose.azimuth).toBeLessThan(heldPose.azimuth);expect(rightDown.pose.elevation).toBeGreaterThan(heldPose.elevation);
  expect(rightDown.scroll).toBe(before.scroll);expect(rightDown.source).toBe(before.source);
  await move(-30,-24);await settle(page);
  const leftUp=await page.evaluate(()=>window.__thesis.inspect().pose);
  expect(leftUp.azimuth).toBeGreaterThan(heldPose.azimuth);expect(leftUp.elevation).toBeLessThan(heldPose.elevation);
  if(cdp){await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});touchActive=false;}else await page.mouse.up();
  await settle(page);
  const released=await page.evaluate(()=>window.__story.inspect());
  expect(released.modelEngaged).toBe(false);expect(released.sourceSelection).toBeNull();
  expect(released.inspection.value).toMatchObject({azimuth:30,elevation:30});
  await expect(surface(page)).not.toHaveAttribute('data-model-dragging','true');

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
 }
});
