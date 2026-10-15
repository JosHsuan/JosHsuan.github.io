import {test,expect} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
import {WAIT,frames,scenarioTimeout,settle,loadScene} from './case-helpers.mjs';
import {renderedTextContrast} from './reading-contrast.mjs';

const identity='[data-liquid-glass="identity"]';
const liquid=page=>page.evaluate(()=>window.__story.inspect().liquidGlass);
async function staticPage(page){
 await page.emulateMedia({reducedMotion:'reduce',contrast:'no-preference',forcedColors:'none'});await page.goto('/#overview');
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

async function controlSkinPixels(page,control){
 // The production skin keeps its real fill, diffusion, refraction and maximum
 // response. Hide only sibling content for a small clear-core pixel exposure.
 const parentStyle=await control.evaluate(element=>{
  // Identity includes a direct text node, so hiding child elements alone does
  // not expose a clear core. The skin's authored paint uses no currentColor.
  const style=element.getAttribute('style');element.style.setProperty('color','transparent','important');element.style.setProperty('-webkit-text-fill-color','transparent','important');return style;
 });
 const saved=await control.evaluate(element=>[...element.children].filter(child=>!child.hasAttribute('data-liquid-skin')).map(child=>{
  const style=child.getAttribute('style');child.style.setProperty('visibility','hidden','important');return style;
 }));
 try{
  const box=await control.boundingBox();expect(box).not.toBeNull();
  const width=Math.min(48,box.width*.3),height=Math.min(24,box.height*.3);
  const png=await page.screenshot({animations:'disabled',clip:{x:box.x+(box.width-width)/2,y:box.y+(box.height-height)/2,width,height}});
  return await page.evaluate(async png=>{
   const bitmap=await createImageBitmap(await(await fetch('data:image/png;base64,'+png)).blob()),canvas=document.createElement('canvas');canvas.width=bitmap.width;canvas.height=bitmap.height;
   const context=canvas.getContext('2d');context.drawImage(bitmap,0,0);bitmap.close();const pixels=context.getImageData(0,0,canvas.width,canvas.height).data,rgb=[0,0,0];
   for(let offset=0;offset<pixels.length;offset+=4)for(let channel=0;channel<3;channel++)rgb[channel]+=pixels[offset+channel]/(pixels.length/4);
   return rgb;
  },png.toString('base64'));
 }finally{
  await control.evaluate((element,saved)=>{
   const children=[...element.children].filter(child=>!child.hasAttribute('data-liquid-skin'));
   for(let index=0;index<children.length;index++){if(saved[index]===null)children[index].removeAttribute('style');else children[index].setAttribute('style',saved[index]);}
  },saved);
  await control.evaluate((element,style)=>{if(style===null)element.removeAttribute('style');else element.setAttribute('style',style);},parentStyle);
 }
}

function controlMaterialDiagnostic(element){
 const read=(node,pseudo)=>{
  const style=getComputedStyle(node,pseudo),box=node.getBoundingClientRect();
  return{node:node.tagName,kind:node.dataset.liquidGlass,pseudo,background:style.background,backdrop:style.backdropFilter||style.webkitBackdropFilter||'none',clipPath:style.clipPath,maskImage:style.maskImage||style.webkitMaskImage,filter:style.filter,opacity:style.opacity,isolation:style.isolation,transform:style.transform,willChange:style.willChange,visibility:style.visibility,position:style.position,zIndex:style.zIndex,inset:style.inset,box:{x:box.x,y:box.y,width:box.width,height:box.height}};
 };
 const skin=element.querySelector(':scope > [data-liquid-skin]'),ancestors=[];
 for(let node=element.parentElement;node;node=node.parentElement)ancestors.push(read(node));
 return{mode:element.dataset.liquidMode,surface:read(element),skin:skin?read(skin):null,skinBefore:skin?read(skin,'::before'):null,skinAfter:skin?read(skin,'::after'):null,ancestors};
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
 await surface.dispatchEvent('pointercancel',{pointerId:1,pointerType:'mouse'});expect((await read()).press).toBe(0);expect((await read()).hover).toBe(0);
 // A synthetic pointercancel cannot cancel the browser's native mouse click.
 // Suppress only this cancelled gesture's default Home navigation.
 const cancelClick=await surface.evaluateHandle(element=>{
  const prevent=event=>event.preventDefault();element.addEventListener('click',prevent,{capture:true,once:true});
  return()=>element.removeEventListener('click',prevent,true);
 });
 try{await page.mouse.up();}finally{await cancelClick.evaluate(dispose=>dispose());await cancelClick.dispose();}
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
 await expect(page).toHaveURL(/#overview$/);
 await expect(page.locator('[data-cinematic-stage]')).toHaveAttribute('data-presentation-context','project');
 await expect(page.locator('[data-story-navigation]')).toBeVisible();
 const link=page.locator('[data-story-navigation] a').first();await link.focus();await expect(link).toBeFocused();await frames(page,2);
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
 await expect.poll(async()=>(await modes()).every(row=>row.mode=== (browserName==='chromium'?'refractive':'reflective')),{timeout:WAIT}).toBe(true);
 await settle(page);
 // Measure the built material's resting gray transfer and maximum authored
 // response, rather than an opaque accessibility replacement.
 // Freeze the Director so Reduced Motion cannot reset these test inputs.
 const contrastFixture=await page.evaluate(()=>{
  window.dispatchEvent(new Event('pagehide'));
  const background=document.createElement('div');background.dataset.liquidContrastBackground='';
  Object.assign(background.style,{position:'fixed',inset:'0',zIndex:'2147483000',pointerEvents:'none',background:'#fff'});document.body.appendChild(background);
  const owners=[document.querySelector('[data-page-masthead]'),document.querySelector('[data-story-navigation]'),document.querySelector('[data-reading-tools]')];
  const surfaces=[...document.querySelectorAll('[data-liquid-glass]')];
  const saved=Array.from(new Set([...owners,...surfaces])).map(element=>({element,style:element.getAttribute('style')}));
  for(const owner of owners)owner.style.zIndex='2147483001';
  const samples=surfaces.map(element=>{
   const box=element.getBoundingClientRect(),walker=document.createTreeWalker(element,NodeFilter.SHOW_TEXT);let text;
   while(walker.nextNode()){
    const node=walker.currentNode;if(!node.textContent.trim())continue;
    const range=document.createRange();range.selectNodeContents(node);const rect=range.getBoundingClientRect();
    if(rect.width>0&&rect.height>0){text=rect;break;}
   }
   if(!text)throw Error('No visible control text for contrast: '+element.dataset.liquidGlass);
   const x=(text.left+text.width/2-box.left)/box.width*100,y=(text.top+text.height/2-box.top)/box.height*100;
   element.style.setProperty('--liquid-glint-x',x+'%');element.style.setProperty('--liquid-glint-y',y+'%');
   element.style.setProperty('--liquid-hover','0');element.style.setProperty('--liquid-press','0');
   return{kind:element.dataset.liquidGlass,glint:{x,y}};
  });
  window.__liquidContrastCleanup=()=>{background.remove();for(const {element,style} of saved){if(style===null)element.removeAttribute('style');else element.setAttribute('style',style);}delete window.__liquidContrastCleanup;window.dispatchEvent(new Event('pageshow'));};
  return samples;
 });
 const renderedContrast=[],normalCurve=[],transferMetrics=[],grayStops=['#000000','#404040','#808080','#c0c0c0','#ffffff'];
 try{
  for(const background of grayStops){
   await page.locator('[data-liquid-contrast-background]').evaluate((element,color)=>{element.style.background=color;},background);
   for(const sample of contrastFixture){
    const control=page.locator(`[data-liquid-glass="${sample.kind}"]`),rgb=await controlSkinPixels(page,control),facts=await control.evaluate(controlMaterialDiagnostic);
    const coreMean=rgb.reduce((sum,value)=>sum+value,0)/3,channelSpread=Math.max(...rgb)-Math.min(...rgb);
    normalCurve.push({background,...sample,rgb,coreMean,channelSpread,facts});
   }
  }
  await page.locator('[data-liquid-glass]').evaluateAll(elements=>{for(const element of elements){element.style.setProperty('--liquid-hover','1');element.style.setProperty('--liquid-press','1');}});
  for(const background of grayStops){
   await page.locator('[data-liquid-contrast-background]').evaluate((element,color)=>{element.style.background=color;},background);
   for(const sample of contrastFixture){
    const control=page.locator(`[data-liquid-glass="${sample.kind}"]`);await expect(control).toBeVisible();
    const response=await control.evaluate(element=>({hover:getComputedStyle(element).getPropertyValue('--liquid-hover').trim(),press:getComputedStyle(element).getPropertyValue('--liquid-press').trim(),glintOpacity:Number(getComputedStyle(element.querySelector(':scope > [data-liquid-skin]'),'::after').opacity)}));
    const rgb=await controlSkinPixels(page,control),rows=await renderedTextContrast(page,control),facts=await control.evaluate(controlMaterialDiagnostic);
    const coreMean=rgb.reduce((sum,value)=>sum+value,0)/3,channelSpread=Math.max(...rgb)-Math.min(...rgb);
    renderedContrast.push({background,...sample,response,rgb,coreMean,channelSpread,rows,facts});
   }
  }
  for(const sample of contrastFixture){
   const normal=normalCurve.filter(row=>row.kind===sample.kind),maximum=renderedContrast.filter(row=>row.kind===sample.kind);
   const brightness=maximum[0].coreMean,transmission=maximum.at(-1).coreMean-brightness,normalTransmission=normal.at(-1).coreMean-normal[0].coreMean;
   maximum[0].brightness=brightness;maximum[0].transmission=transmission;normal[0].transmission=normalTransmission;
   transferMetrics.push({kind:sample.kind,brightness,transmission,normalBrightness:normal[0].coreMean,normalTransmission});
  }
  // Retain all resting/maximum-response points and text rows before validating
  // any material threshold, so a failed point cannot erase its transfer curve.
  for(const sample of contrastFixture){
   const normal=normalCurve.filter(row=>row.kind===sample.kind),maximum=renderedContrast.filter(row=>row.kind===sample.kind);
   for(const [index,row] of normal.entries()){
    expect(row.channelSpread,`${sample.kind} / ${row.background}: resting neutral core`).toBeLessThan(14);
    if(index)expect(row.coreMean+1,sample.kind+' resting gray transfer increases within one-code quantization').toBeGreaterThan(normal[index-1].coreMean);
   }
   for(const [index,row] of maximum.entries()){
    expect(row.response.hover).toBe('1');expect(row.response.press).toBe('1');expect(row.response.glintOpacity).toBeCloseTo(.42,3);
    expect(row.channelSpread,`${sample.kind} / ${row.background}: maximum-glint neutral core`).toBeLessThan(14);
    if(index)expect(row.coreMean+1,sample.kind+' maximum-response gray transfer increases within one-code quantization').toBeGreaterThan(maximum[index-1].coreMean);
    expect(row.rows.length,sample.kind+' visible text').toBeGreaterThan(0);
    for(const text of row.rows)expect(text.ratio,`${sample.kind} / ${row.background} / ${text.text}`).toBeGreaterThanOrEqual(text.required);
   }
   const {brightness,transmission,normalTransmission}=transferMetrics.find(row=>row.kind===sample.kind);
   // These are project dark-appearance bounds, not Apple-published constants.
   expect(brightness,sample.kind+' visible dark core over black').toBeGreaterThan(8);expect(brightness,sample.kind+' maximum glint must not wash the core white').toBeLessThan(85);
   expect(transmission,sample.kind+' must transmit the actual backdrop').toBeGreaterThan(30);expect(transmission,sample.kind+' keeps a legible material substrate').toBeLessThan(110);
   expect(normal[0].coreMean,sample.kind+' resting core over black').toBeGreaterThan(8);expect(normal[0].coreMean,sample.kind+' resting core must remain dark').toBeLessThan(85);
   expect(normalTransmission,sample.kind+' resting transmission').toBeGreaterThan(30);expect(normalTransmission,sample.kind+' resting reading substrate').toBeLessThan(110);
  }
 }finally{
  const body=JSON.stringify({appearance:'neutral-dark',monotonicQuantizationTolerance:1,transferMetrics,normalCurve,maximumResponse:renderedContrast},null,2)+'\n';
  await writeFile(testInfo.outputPath('neutral-control-material.json'),body);
  await testInfo.attach('maximum-glint-rendered-contrast',{body,contentType:'application/json'});
  await page.evaluate(()=>window.__liquidContrastCleanup?.());
 }
 const nojs=await browser.newContext({javaScriptEnabled:false,reducedMotion:'reduce',baseURL,viewport:testInfo.project.use.viewport});
 try{
  const staticPage=await nojs.newPage();await staticPage.goto('/#overview');await staticPage.evaluate(()=>document.fonts.ready);
  const owner=staticPage.locator(identity);await expect(owner).toBeVisible();await expect(owner).not.toHaveAttribute('data-liquid-ready',/.*/);
  await expect(owner.locator(':scope > [data-liquid-skin]')).toBeHidden();await expect(staticPage.locator('[data-story-navigation] a')).toHaveCount(7);
  const contrast=await renderedTextContrast(staticPage,owner);expect(contrast.length).toBeGreaterThan(0);for(const row of contrast)expect(row.ratio,row.text).toBeGreaterThanOrEqual(row.required);
  await expect(staticPage.locator('[data-story-navigation] a[href="#system"]')).toHaveAttribute('href','#system');await expect(staticPage.locator('[data-cinematic-stage] canvas')).toHaveCount(0);
 }finally{await nojs.close();}
});
