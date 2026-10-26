import {test,expect} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
import {WAIT,scenarioTimeout,loadScene,centerStudy,hitPoint,surface,frames,settle} from './case-helpers.mjs';

// Native gestures are input evidence. Programmatic scroll fixtures in the
// projection suite do not substitute for the actual mouse/touch reading path.
test('source geometry never captures mouse dragging and native touch scrolling remains document-owned',async({page,context,isMobile},info)=>{
 test.setTimeout(scenarioTimeout(150000));const errors=[];page.on('pageerror',error=>errors.push(error.message));
 const receipt={scope:'Native pointer/touch neutrality, not physical-device performance.',phase:'loading',inputs:[]};let primaryError,cdp=null;
 try{
  await loadScene(page);await centerStudy(page,'form');
  await expect(surface(page)).toHaveCSS('pointer-events','none');await expect(surface(page)).not.toHaveAttribute('role','button');
  const p=await hitPoint(page),before=await page.evaluate(()=>({y:scrollY,source:window.__thesis.inspect().representation.id,inspection:window.__story.inspect().inspection.target}));
  if(isMobile){
   cdp=await context.newCDPSession(page);
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...p,id:1}]});
   for(let i=1;i<=8;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:p.x,y:p.y-i*15,id:1}]});
   await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
   await expect.poll(()=>page.evaluate(()=>scrollY),{timeout:WAIT}).toBeGreaterThan(before.y+30);
  }else{
   await page.mouse.move(p.x,p.y);await page.mouse.down();await page.mouse.move(p.x+45,p.y-30,{steps:5});await page.mouse.up();await frames(page,4);
   expect(await page.evaluate(()=>scrollY)).toBe(before.y);
   expect(await page.evaluate(()=>window.__thesis.inspect().representation.id)).toBe(before.source);
  }
  await settle(page);
  const after=await page.evaluate(()=>{const s=window.__story.inspect();return{y:scrollY,inspection:s.inspection.target,engaged:s.modelEngaged,held:s.modelHeldSource,selection:s.sourceSelection};});
  expect(after.inspection).toEqual(before.inspection);expect(after).toMatchObject({engaged:false,held:null,selection:null});
  await expect(surface(page)).not.toHaveAttribute('data-model-dragging','true');receipt.inputs.push({point:p,before,after,isMobile});
  const y=await page.evaluate(()=>scrollY);await page.mouse.wheel(0,220);await expect.poll(()=>page.evaluate(()=>scrollY),{timeout:WAIT}).toBeGreaterThan(y+50);await settle(page);
  expect(await page.evaluate(()=>window.__story.inspect().readingShiftY)).toBe(0);expect(await page.evaluate(()=>document.body.style.overflow)).not.toBe('hidden');
  expect(errors).toEqual([]);receipt.phase='completed';
 }catch(error){primaryError=error;throw error;}
 finally{
  if(cdp){try{await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});await cdp.detach();}catch{}}
  try{const path=info.outputPath('native-source-scroll-neutrality.json');await writeFile(path,JSON.stringify(receipt,null,2));await info.attach('native-source-scroll-neutrality',{path,contentType:'application/json'});}catch(error){if(!primaryError)throw error;}
 }
});
