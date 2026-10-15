import {test,expect} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
import {WAIT,frames,scenarioTimeout,settle,loadScene} from './case-helpers.mjs';
import {renderedTextContrast} from './reading-contrast.mjs';

const identity='[data-liquid-glass="identity"]';
const liquid=page=>page.evaluate(()=>window.__story.inspect().liquidGlass);
async function staticPage(page){
 await page.emulateMedia({reducedMotion:'reduce',contrast:'no-preference',forcedColors:'none'});await page.goto('/');
 await page.waitForFunction(()=>window.__story?.inspect().entry.phase==='entered'&&window.__story.inspect().liquidGlass.count===3,null,{timeout:WAIT});
 await page.evaluate(()=>document.fonts.ready);await settle(page);
 await expect(page.locator('[data-cinematic-stage] canvas')).toHaveCount(0);
}

// A synthetic background goes behind the real, built identity surface. Its
// React skin, SVG filter, normal map, CSS material and Director stay untouched.
async function backdropFixture(page,{pattern=false,geometry=false}={}){
 return page.evaluate(({pattern,geometry})=>{
  const background=document.createElement('div');background.dataset.liquidPixelBackground='';
  Object.assign(background.style,{position:'fixed',left:'0',top:'0',width:'390px',height:'220px',zIndex:'2147483000',pointerEvents:'none',background:'#17221e'});
  if(pattern){
   const colors=['#ff2727','#16e545','#2354fa','#f2cf24','#bd37ef','#19d9dd'];let rectangles='';
   for(let y=0;y<13;y++)for(let x=0;x<22;x++)rectangles+=`<rect x="${x*18}" y="${y*18}" width="18" height="18" fill="${colors[(x+y*2)%colors.length]}"/>`;
   background.style.backgroundImage='url("data:image/svg+xml;base64,'+btoa('<svg xmlns="http://www.w3.org/2000/svg" width="396" height="234">'+rectangles+'</svg>')+'")';
  }
  document.body.appendChild(background);
  const header=document.querySelector('[data-page-masthead]'),surface=document.querySelector('[data-liquid-glass="identity"]');
  header.style.zIndex='2147483001';
  if(geometry){
   Object.assign(header.style,{left:'40px',top:'40px',right:'auto',padding:'0',minHeight:'0',width:'300px',height:'80px'});
   Object.assign(surface.style,{display:'block',position:'relative',width:'300px',height:'80px',margin:'0',padding:'24px 20px',borderRadius:'24px'});
  }
  const rect=surface.getBoundingClientRect();return{width:rect.width,height:rect.height};
 },{pattern,geometry});
}

async function comparePixels(page,first,second,size){
 return page.evaluate(async({first,second,width,height})=>{
  width=Math.round(width);height=Math.round(height);
  const decode=async base64=>{
   const bitmap=await createImageBitmap(await(await fetch('data:image/png;base64,'+base64)).blob()),canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
   const context=canvas.getContext('2d');context.drawImage(bitmap,0,0,width,height);bitmap.close();return context.getImageData(0,0,width,height).data;
  };
  const a=await decode(first),b=await decode(second);let rim=0,rimCount=0,core=0,coreCount=0,positive=0,negative=0,positiveX=0,negativeX=0,total=0;
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
   const offset=(y*width+x)*4;let difference=0,signed=0;
   for(let channel=0;channel<3;channel++){difference+=Math.abs(a[offset+channel]-b[offset+channel])/3;signed+=(a[offset+channel]-b[offset+channel])/3;}
   total+=difference;
   if(x>30&&x<width-30&&(y>=4&&y<12||y>height-12&&y<=height-4)){rim+=difference;rimCount++;}
   if(x>width*.35&&x<width*.65&&y>height*.4&&y<height*.6){core+=difference;coreCount++;}
   if(signed>0){positive+=signed;positiveX+=signed*x;}else{negative-=signed;negativeX-=signed*x;}
  }
  const verticalShift=(start,end)=>{
   const candidates=[];
   for(let shift=-4;shift<=4;shift++){
    let error=0,count=0;
    for(let y=start;y<end;y++)for(let x=40;x<width-40;x++)for(let channel=0;channel<3;channel++){
     error+=Math.abs(a[(y*width+x)*4+channel]-b[((y+shift)*width+x)*4+channel]);count++;
    }
    candidates.push({shift,error:error/Math.max(1,count)});
   }
   return candidates.sort((a,b)=>a.error-b.error)[0];
  };
  return{width,height,rimMean:rim/Math.max(1,rimCount),coreMean:core/Math.max(1,coreCount),totalMean:total/(width*height),positiveEnergy:positive,negativeEnergy:negative,positiveX:positiveX/Math.max(1,positive),negativeX:negativeX/Math.max(1,negative),top:verticalShift(5,11),bottom:verticalShift(height-11,height-5)};
 },{first:first.toString('base64'),second:second.toString('base64'),...size});
}

test('built glass bends the real background only at its rim and leaves foreground geometry intact',async({page,browserName},testInfo)=>{
 test.setTimeout(scenarioTimeout(120000));await staticPage(page);
 await page.screenshot({path:testInfo.outputPath('actual-liquid-controls.png'),animations:'disabled'});
 for(const kind of ['identity','chapter-navigation','reading-controls'])await page.locator(`[data-liquid-glass="${kind}"]`).screenshot({path:testInfo.outputPath('actual-'+kind+'.png'),animations:'disabled'});
 const surfaces=await page.locator('[data-liquid-glass]').evaluateAll(elements=>elements.map(element=>{
  const skin=element.querySelector(':scope > [data-liquid-skin]'),style=getComputedStyle(element),paint=getComputedStyle(skin);
  return{kind:element.dataset.liquidGlass,mode:element.dataset.liquidMode,skins:element.querySelectorAll(':scope > [data-liquid-skin]').length,parentBackdrop:style.backdropFilter||style.webkitBackdropFilter,skinBackdrop:paint.backdropFilter||paint.webkitBackdropFilter};
 }));
 expect(surfaces.map(row=>row.kind).sort()).toEqual(['chapter-navigation','identity','reading-controls']);
 for(const row of surfaces){expect(row.skins).toBe(1);expect(row.parentBackdrop).toBe('none');expect(row.skinBackdrop).toContain('blur(');}
 const size=await backdropFixture(page,{pattern:true,geometry:true});await settle(page);
 await page.waitForFunction(()=>window.__story.inspect().liquidGlass.items.find(item=>item.kind==='identity')?.width===300,null,{timeout:WAIT});
 const surface=page.locator(identity),skin=surface.locator(':scope > [data-liquid-skin]');
 const before=await surface.evaluate(element=>{
  const r=element.getBoundingClientRect(),filters=[];for(let node=element;node;node=node.parentElement)filters.push(getComputedStyle(node).filter);
  return{rect:{x:r.x,y:r.y,width:r.width,height:r.height},text:element.textContent,filters};
 });
 expect(before.filters.every(value=>value==='none')).toBe(true);
 const onFilter=await skin.evaluate(element=>getComputedStyle(element).backdropFilter||getComputedStyle(element).webkitBackdropFilter);
 const mapDimensions=await skin.locator('[data-liquid-map]').evaluate(element=>({width:element.getAttribute('width'),height:element.getAttribute('height')}));
 if(browserName==='chromium'){expect(Number(mapDimensions.width)).toBe(300);expect(Number(mapDimensions.height)).toBe(80);}
 const on=await surface.screenshot({animations:'disabled',path:testInfo.outputPath('production-optical-on.png')}),mode=await surface.getAttribute('data-liquid-mode');
 // Freeze the actual Director before changing a decorative test control. Keep
 // the complete SVG/native filter pipeline, map, tint and highlights identical;
 // changing only scale isolates ray displacement from pipeline color handling.
 await page.evaluate(()=>window.dispatchEvent(new Event('pagehide')));
 await skin.locator('[data-liquid-displacement]').evaluate(element=>element.setAttribute('scale','0'));
 const offFilter=await skin.evaluate(element=>getComputedStyle(element).backdropFilter||getComputedStyle(element).webkitBackdropFilter);
 expect(offFilter).toBe(onFilter);expect(offFilter).toContain('blur(');
 const off=await surface.screenshot({animations:'disabled',path:testInfo.outputPath('production-optical-without-refraction.png')}),pixels=await comparePixels(page,on,off,size);
 await testInfo.attach('built-optical-pixels',{body:JSON.stringify({mode,onFilter,offFilter,pixels}),contentType:'application/json'});
 await writeFile(testInfo.outputPath('production-optical-pixels.json'),JSON.stringify({mode,onFilter,offFilter,mapDimensions,pixels},null,2)+'\n');
 await testInfo.attach('built-optical-on',{body:on,contentType:'image/png'});await testInfo.attach('built-optical-without-refraction',{body:off,contentType:'image/png'});
 if(browserName==='chromium'){
  expect(mode).toBe('refractive');expect(pixels.rimMean).toBeGreaterThan(.3);expect(pixels.coreMean).toBeLessThan(Math.max(.8,pixels.rimMean*.5));
  expect(pixels.top.shift).toBeLessThan(0);expect(pixels.bottom.shift).toBeGreaterThan(0);
 }else{
  expect(mode).toBe('reflective');expect(pixels.totalMean).toBeLessThan(.5);
  testInfo.annotations.push({type:'coverage-limit',description:'Windows WebKit does not paint SVG backdrop URL displacement. This checks the reflective fallback and does not claim macOS/iOS native blur or DOM refraction.'});
 }
 const after=await surface.evaluate(element=>{const r=element.getBoundingClientRect();return{rect:{x:r.x,y:r.y,width:r.width,height:r.height},text:element.textContent};});
 expect(after.rect).toEqual(before.rect);expect(after.text).toBe(before.text);
 expect(await skin.evaluate(element=>getComputedStyle(element).filter)).toBe('none');
 const stats=await liquid(page);expect(stats.mapPixels).toBeLessThanOrEqual(3*65536);
 // Native scroll moves an ordinary document background behind the same fixed
 // production lens. A CSS transform or a regenerated screenshot/map is not a
 // substitute for this compositor response.
 await page.evaluate(()=>{
  const background=document.querySelector('[data-liquid-pixel-background]');background.style.position='absolute';background.style.top=scrollY+'px';
  document.querySelector('[data-liquid-glass="identity"] [data-liquid-displacement]').setAttribute('scale','12');
  window.dispatchEvent(new Event('pageshow'));
 });
 await settle(page);
 const mapGenerationBefore=(await liquid(page)).mapGenerations;
 const beforeScroll=await surface.screenshot({animations:'disabled'});
 const positionBefore=await page.evaluate(()=>({scroll:scrollY,background:document.querySelector('[data-liquid-pixel-background]').getBoundingClientRect().top}));
 await page.evaluate(()=>scrollBy({top:18,behavior:'instant'}));await settle(page);
 const positionAfter=await page.evaluate(()=>({scroll:scrollY,background:document.querySelector('[data-liquid-pixel-background]').getBoundingClientRect().top}));
 const afterScroll=await surface.screenshot({animations:'disabled'}),scrollPixels=await comparePixels(page,beforeScroll,afterScroll,size);
 expect(positionAfter.scroll-positionBefore.scroll).toBe(18);expect(positionAfter.background-positionBefore.background).toBe(-18);
 expect(scrollPixels.totalMean).toBeGreaterThan(1);expect((await liquid(page)).mapGenerations).toBe(mapGenerationBefore);
 await writeFile(testInfo.outputPath('native-scroll-optical-pixels.json'),JSON.stringify({positionBefore,positionAfter,mapGenerationBefore,mapGenerationAfter:(await liquid(page)).mapGenerations,pixels:scrollPixels},null,2)+'\n');
 expect(await page.locator('canvas').count()).toBe(1);
});

test('pointer lighting and press share the Director clock and cancel, focus and page lifecycle close them',async({page,context,isMobile},testInfo)=>{
 test.setTimeout(scenarioTimeout(120000));await loadScene(page);await backdropFixture(page);
 const surface=page.locator(identity),rect=await surface.boundingBox();expect(rect).not.toBeNull();
 const read=()=>page.evaluate(()=>window.__story.inspect().liquidGlass.items.find(item=>item.kind==='identity'));
 const maps=(await liquid(page)).mapGenerations;
 await page.mouse.move(rect.x+rect.width*.12,rect.y+rect.height*.5);
 await expect.poll(async()=>(await read()).hover,{timeout:WAIT}).toBeGreaterThan(.99);
 await expect.poll(async()=>(await read()).settled,{timeout:WAIT}).toBe(true);
 const left=await surface.screenshot({animations:'disabled'});
 await page.mouse.move(rect.x+rect.width*.88,rect.y+rect.height*.5);
 await expect.poll(async()=>(await read()).x,{timeout:WAIT}).toBeGreaterThan(.85);
 await expect.poll(async()=>(await read()).settled,{timeout:WAIT}).toBe(true);
 const right=await surface.screenshot({animations:'disabled'}),glint=await comparePixels(page,left,right,rect);
 expect(glint.totalMean).toBeGreaterThan(.1);expect(glint.negativeX-glint.positiveX).toBeGreaterThan(rect.width*.12);
 await testInfo.attach('pointer-glint-displacement',{body:JSON.stringify(glint),contentType:'application/json'});
 await page.mouse.down();await expect.poll(async()=>(await read()).press,{timeout:WAIT}).toBeGreaterThan(.95);
 await surface.dispatchEvent('pointercancel',{pointerId:1,pointerType:'mouse'});expect((await read()).press).toBe(0);expect((await read()).hover).toBe(0);await page.mouse.up();
 if(isMobile){
  const cdp=await context.newCDPSession(page);let touchActive=false;
  try{
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:rect.x+rect.width*.5,y:rect.y+rect.height*.5,id:1}]});touchActive=true;
   await expect.poll(async()=>(await read()).press,{timeout:WAIT}).toBeGreaterThan(.95);
   await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});touchActive=false;
   await expect.poll(async()=>(await read()).press,{timeout:WAIT}).toBe(0);expect((await read()).hover).toBe(0);
  }finally{if(touchActive)await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});await cdp.detach();}
 }
 await page.keyboard.press('Tab');
 const link=page.locator('[data-story-navigation] a').first();await link.focus();await frames(page,2);
 const focused=await page.evaluate(()=>window.__story.inspect().liquidGlass.items.find(item=>item.kind==='chapter-navigation'));
 expect(focused.hover).toBe(0);expect(focused.press).toBe(0);expect(focused.settled).toBe(true);
 await page.evaluate(()=>document.activeElement.blur());await page.mouse.move(rect.x+rect.width*.3,rect.y+rect.height*.5);await expect.poll(async()=>(await read()).hover,{timeout:WAIT}).toBeGreaterThan(.9);
 await page.evaluate(()=>window.dispatchEvent(new Event('pagehide')));
 const held=await liquid(page);expect(held.items.every(item=>item.hover===0&&item.press===0)).toBe(true);
 await frames(page,4);expect(await liquid(page)).toEqual(held);
 await page.evaluate(()=>window.dispatchEvent(new Event('pageshow')));await settle(page);
 expect((await liquid(page)).items.every(item=>item.hover===0&&item.press===0)).toBe(true);
 expect((await liquid(page)).mapGenerations).toBe(maps);
 await page.emulateMedia({reducedMotion:'reduce'});await settle(page);await page.mouse.move(rect.x+rect.width*.8,rect.y+rect.height*.5);await frames(page,2);
 expect((await read()).hover).toBe(0);expect((await read()).press).toBe(0);
 await expect(page.locator('[data-cinematic-stage] canvas')).toHaveCount(1);
});

test('native opacity preferences and no-JavaScript navigation retain readable materials',async({page,browser,baseURL,context,browserName},testInfo)=>{
 test.setTimeout(scenarioTimeout(120000));await staticPage(page);
 const modes=()=>page.locator('[data-liquid-glass]').evaluateAll(elements=>elements.map(element=>{
  const skin=element.querySelector(':scope > [data-liquid-skin]'),style=getComputedStyle(skin);return{mode:element.dataset.liquidMode,backdrop:style.backdropFilter||style.webkitBackdropFilter,background:style.backgroundColor,transform:style.transform,before:getComputedStyle(skin,'::before').display,after:getComputedStyle(skin,'::after').display,map:skin.querySelector('[data-liquid-map]').getAttribute('href')};
 }));
 const opaque=async()=>{await expect.poll(async()=>(await modes()).every(row=>row.mode==='opaque'),{timeout:WAIT}).toBe(true);for(const row of await modes()){expect(row.backdrop).toBe('none');expect(row.transform).toBe('none');expect(row.before).toBe('none');expect(row.after).toBe('none');expect(row.map).toBe('');}expect((await liquid(page)).mapPixels).toBe(0);};
 await page.emulateMedia({reducedMotion:'reduce',contrast:'more'});await opaque();
 await page.emulateMedia({reducedMotion:'reduce',contrast:'no-preference',forcedColors:'active'});await opaque();
 await page.emulateMedia({reducedMotion:'reduce',contrast:'no-preference',forcedColors:'none'});
 await expect.poll(async()=>(await modes()).every(row=>row.mode=== (browserName==='chromium'?'refractive':'reflective')),{timeout:WAIT}).toBe(true);
 if(browserName==='chromium'){
  const cdp=await context.newCDPSession(page);
  try{await cdp.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'},{name:'prefers-reduced-transparency',value:'reduce'}]});await opaque();}
  finally{await cdp.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'},{name:'prefers-reduced-transparency',value:'no-preference'}]});await cdp.detach();}
 }else testInfo.annotations.push({type:'coverage-limit',description:'Native prefers-contrast and forced-colors covered. WebKit reduced-transparency emulation is unavailable.'});
 const nojs=await browser.newContext({javaScriptEnabled:false,reducedMotion:'reduce',baseURL,viewport:testInfo.project.use.viewport});
 try{
  const staticPage=await nojs.newPage();await staticPage.goto('/');await staticPage.evaluate(()=>document.fonts.ready);
  const owner=staticPage.locator(identity);await expect(owner).toBeVisible();await expect(owner).not.toHaveAttribute('data-liquid-ready',/.*/);
  await expect(owner.locator(':scope > [data-liquid-skin]')).toBeHidden();await expect(staticPage.locator('[data-story-navigation] a')).toHaveCount(7);
  const contrast=await renderedTextContrast(staticPage,owner);expect(contrast.length).toBeGreaterThan(0);for(const row of contrast)expect(row.ratio,row.text).toBeGreaterThanOrEqual(row.required);
  await expect(staticPage.locator('[data-story-navigation] a[href="#system"]')).toHaveAttribute('href','#system');await expect(staticPage.locator('[data-cinematic-stage] canvas')).toHaveCount(0);
 }finally{await nojs.close();}
});
