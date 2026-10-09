import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {PerspectiveCamera,Vector3} from 'three';
import {WAIT,scenarioTimeout,loadScene,pause,settle,centerStudy,surface,hitPoint} from './case-helpers.mjs';
const catalog=JSON.parse(readFileSync(new URL('../../roles/uiux-designer/cases/bending-active-thesis/release/public/assets/thesis/source-diagrams.json',import.meta.url),'utf8'));
const phone={baseURL:'http://127.0.0.1:4186',viewport:{width:390,height:844},deviceScaleFactor:3,isMobile:true,hasTouch:true};

test('touch browser inset changes do not reallocate the Full drawing surface',async({browser})=>{
  test.setTimeout(scenarioTimeout(60000));
  const context=await browser.newContext(phone),page=await context.newPage();
  try{
    await page.addInitScript(()=>{
      const counts={canvasWrites:0,textures:0,renderbuffers:0};window.__mobileAllocations=counts;
      for(const axis of ['width','height']){
        const descriptor=Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype,axis);
        Object.defineProperty(HTMLCanvasElement.prototype,axis,{...descriptor,set(value){counts.canvasWrites++;descriptor.set.call(this,value);}});
      }
      for(const name of ['texStorage2D','renderbufferStorage','renderbufferStorageMultisample']){
        const original=WebGL2RenderingContext.prototype[name];
        WebGL2RenderingContext.prototype[name]=function(...args){counts[name==='texStorage2D'?'textures':'renderbuffers']++;return original.apply(this,args);};
      }
    });
    await page.goto('/');await page.waitForFunction(()=>window.__thesis?.inspect().ready,null,{timeout:WAIT});await pause(page);
    expect(await page.evaluate(()=>matchMedia('(hover:none) and (pointer:coarse)').matches)).toBe(true);
    const before=await page.evaluate(()=>({counts:{...window.__mobileAllocations},budget:window.__thesis.inspect().renderBudget,samples:window.__thesis.inspect().compositor.requestedSamples}));
    expect(before.samples).toBe(2);
    // Synthetic browser-inset changes isolate layout-to-allocation behavior;
    // they are not a physical Safari toolbar or process-crash reproduction.
    for(let index=0;index<12;index++){
      await page.locator('[data-cinematic-stage]').evaluate((el,i)=>{el.style.bottom=(i%2?0:80)+'px';window.dispatchEvent(new Event('resize'));},index);
      await page.waitForTimeout(40);
    }
    await settle(page);
    const after=await page.evaluate(()=>({counts:{...window.__mobileAllocations},budget:window.__thesis.inspect().renderBudget,samples:window.__thesis.inspect().compositor.requestedSamples}));
    expect(after).toEqual(before);
    await page.setViewportSize({width:844,height:390});await settle(page);
    await expect.poll(()=>page.evaluate(()=>window.__thesis.inspect().renderBudget.viewportWidth)).toBe(844);
    expect(await page.evaluate(()=>window.__thesis.inspect().renderBudget.pixels)).toBeLessThanOrEqual(1600000);
    expect(await page.evaluate(()=>window.__mobileAllocations.canvasWrites)).toBeGreaterThan(after.counts.canvasWrites);
    await test.info().attach('mobile-inset-allocation-counts',{body:JSON.stringify({before,after}),contentType:'application/json'});
  }finally{await context.close();}
});

test('a tall touch Canvas preserves source fitting and real mesh hits in the visible viewport',async({browser})=>{
  test.setTimeout(scenarioTimeout(90000));
  const context=await browser.newContext(phone),page=await context.newPage();
  try{
    await loadScene(page);await pause(page);
    // A fixed large Canvas with a shorter visible page models the coordinate
    // mismatch exposed by browser chrome; all source/camera math is production.
    await page.locator('[data-cinematic-stage]').evaluate(el=>{el.style.height='1000px';});
    await expect.poll(()=>page.evaluate(()=>window.__thesis.inspect().renderBudget.viewportHeight)).toBe(1000);
    await centerStudy(page,'system');await surface(page,'system').press('Enter');await settle(page);
    const state=await page.evaluate(()=>{
      const canvas=document.querySelector('canvas').getBoundingClientRect(),slot=document.querySelector('[data-model-viewport][data-study-chapter="system"]').getBoundingClientRect();
      return {scene:window.__thesis.inspect(),canvas:{left:canvas.left,top:canvas.top,width:canvas.width,height:canvas.height},slot:{left:slot.left,top:slot.top,right:slot.right,bottom:slot.bottom},visible:{width:innerWidth,height:innerHeight}};
    });
    const {pose,representation}=state.scene,{canvas,slot,visible}=state;
    const original=catalog.representations.find(item=>item.id===representation.id);expect(original).toBeTruthy();
    const camera=new PerspectiveCamera(pose.fov,canvas.width/canvas.height,pose.near,pose.far);
    camera.position.fromArray(pose.position);camera.up.fromArray(pose.up);camera.lookAt(...pose.target);
    camera.setViewOffset(canvas.width,canvas.height,canvas.width*pose.viewOffsetNormalized.x,canvas.height*pose.viewOffsetNormalized.y,canvas.width,canvas.height);camera.updateMatrixWorld(true);
    const safe={left:Math.max(16,slot.left),right:Math.min(visible.width-16,slot.right),top:Math.max(92,slot.top),bottom:Math.min(visible.height-86,slot.bottom)};
    const point=new Vector3(),bounds={left:Infinity,right:-Infinity,top:Infinity,bottom:-Infinity};
    for(const support of original.framingSupport.points){point.fromArray(support).project(camera);const x=canvas.left+(point.x+1)*.5*canvas.width,y=canvas.top+(1-point.y)*.5*canvas.height;bounds.left=Math.min(bounds.left,x);bounds.right=Math.max(bounds.right,x);bounds.top=Math.min(bounds.top,y);bounds.bottom=Math.max(bounds.bottom,y);}
    const width=safe.right-safe.left,height=safe.bottom-safe.top;
    expect(bounds.left).toBeGreaterThanOrEqual(safe.left+width*.0299);expect(bounds.right).toBeLessThanOrEqual(safe.right-width*.0299);
    expect(bounds.top).toBeGreaterThanOrEqual(safe.top+height*.0299);expect(bounds.bottom).toBeLessThanOrEqual(safe.bottom-height*.0299);
    const hit=await hitPoint(page,'system');await page.touchscreen.tap(hit.x,hit.y);await settle(page);
    expect(await page.evaluate(()=>window.__thesis.inspect().representation.id)).not.toBe(representation.id);
    await expect(page.locator('canvas')).toHaveCount(1);
    await test.info().attach('stable-canvas-visible-source-fit',{body:JSON.stringify({canvas,safe,bounds,representation:representation.id}),contentType:'application/json'});
  }finally{await context.close();}
});
