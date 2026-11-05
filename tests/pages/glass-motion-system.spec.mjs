import {test,expect} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
import {WAIT,scenarioTimeout} from './case-helpers.mjs';

test('the built Feed uses qualified peripheral optics or a continuous geometric fallback with a clear centre',async({page,browserName},info)=>{
 test.setTimeout(scenarioTimeout(90000));
 await page.goto('/about/');await page.waitForFunction(()=>window.__site?.inspect().phase==='entered',null,{timeout:WAIT});
 if(browserName==='webkit'){
  const state=await page.evaluate(()=>window.__globalBackground.inspect().driver.homeScrolling.informationWindows.optics);
  expect(state.mode).toBe('geometric');expect(state.maps).toBe(0);expect(state.failed).toBe(false);
  await page.mouse.wheel(0,160);
  await expect.poll(()=>page.locator('[data-glass-motion=feed]').evaluateAll(nodes=>nodes.some(node=>Math.abs(parseFloat(node.style.getPropertyValue('--information-rx')))>1))).toBe(true);
  expect(await page.locator('[data-glass-motion=feed]').evaluateAll(nodes=>nodes.every(node=>getComputedStyle(node).filter==='none'))).toBe(true);
  await page.screenshot({path:info.outputPath('glass-feed-geometric-webkit.png')});return;
 }
 await page.waitForFunction(()=>document.querySelector('[data-glass-warp-map]')?.getAttribute('href')?.startsWith('data:image/png'),null,{timeout:WAIT});
 // A bounded diagnostic stripe plate uses the actual generated production map
 // and filter, isolating its rendering from independently moving source scenes.
 await page.evaluate(()=>{
  const source=document.querySelector('[data-glass-warp]'),fixture=document.createElement('div');fixture.dataset.glassPixelFixture='';
  fixture.style.cssText='position:fixed;left:30px;top:120px;width:300px;height:300px;z-index:10000;background:repeating-linear-gradient(0deg,#fff 0px,#fff 8px,#111 8px,#111 16px);filter:url("#glass-pixel-filter");';
  const svg=source.cloneNode(true),filter=svg.querySelector('filter'),map=svg.querySelector('feImage');filter.id='glass-pixel-filter';filter.setAttribute('width','428');filter.setAttribute('height','428');
  for(const [key,value]of Object.entries({x:0,y:0,width:300,height:300}))map.setAttribute(key,String(value));svg.querySelector('feDisplacementMap').setAttribute('scale','40');
  fixture.append(svg);document.body.append(fixture);
 });
 const fixture=page.locator('[data-glass-pixel-fixture]');
 const on=await fixture.screenshot({path:info.outputPath('glass-feed-optics.png')});
 // Keep the same SVG raster pipeline for the neutral comparison. Comparing
 // against an unfiltered fractional-DPR layer measures edge antialiasing as
 // well as optical distortion. A near-zero lens isolates the optical field.
 await fixture.evaluate(node=>node.querySelector('feDisplacementMap').setAttribute('scale','.00001'));
 const off=await fixture.screenshot({path:info.outputPath('glass-feed-clear.png')});
 const pixels=await page.evaluate(async({on,off})=>{
  async function decode(encoded){const bytes=Uint8Array.from(atob(encoded),c=>c.charCodeAt(0)),bitmap=await createImageBitmap(new Blob([bytes],{type:'image/png'})),canvas=document.createElement('canvas');canvas.width=bitmap.width;canvas.height=bitmap.height;const context=canvas.getContext('2d');context.drawImage(bitmap,0,0);bitmap.close();return{width:canvas.width,height:canvas.height,data:context.getImageData(0,0,canvas.width,canvas.height).data};}
  const a=await decode(on),b=await decode(off);let core=0,edge=0,cn=0,en=0,flatCore=0,fn=0,changedCore=0;
  for(let y=1;y<a.height-1;y++)for(let x=Math.floor(a.width*.15);x<a.width*.85;x++){
   const i=(y*a.width+x)*4,d=Math.abs(a.data[i]-b.data[i]);
   if(y>a.height*.3&&y<a.height*.7){core+=d;cn++;if(d>1)changedCore++;
    // An 8-bit neutral displacement can interpolate one physical pixel at a
    // hard stripe edge under fractional DPR. Every non-edge core pixel must
    // remain unchanged; no row registration can conceal a spatial warp.
    if(Math.abs(b.data[i-b.width*4]-b.data[i+b.width*4])<200){flatCore+=d;fn++;}
   }
   if(y<a.height*.2||y>a.height*.8){edge+=d;en++;}
  }return{width:a.width,height:a.height,core:core/cn,edge:edge/en,flatCore:flatCore/fn,changedCore:changedCore/cn,maxEdgeFraction:2/(16*a.height/300)+.005};
 },{on:on.toString('base64'),off:off.toString('base64')});
 const record=info.outputPath('glass-optical-pixels.json');await writeFile(record,JSON.stringify(pixels,null,2)+'\n');await info.attach('glass-optical-pixels',{path:record,contentType:'application/json'});
 expect(pixels.edge).toBeGreaterThan(10);expect(pixels.core).toBeLessThan(8);expect(pixels.core).toBeLessThan(pixels.edge*.12);expect(pixels.flatCore).toBeLessThan(.5);expect(pixels.changedCore).toBeLessThan(pixels.maxEdgeFraction);
 await fixture.evaluate(node=>node.remove());
 const optics=await page.evaluate(()=>window.__globalBackground.inspect().driver.homeScrolling.informationWindows.optics);
 expect(optics.generations).toBe(1);expect(optics.maps).toBe(1);expect(optics.failed).toBe(false);
});

test('Project Stream counterflows by column with eight native square destinations and a neutral focused instance',async({page,isMobile})=>{
 test.setTimeout(scenarioTimeout(90000));await page.goto('/projects/');await page.waitForFunction(()=>window.__site?.inspect().phase==='entered',null,{timeout:WAIT});
 const cards=page.locator('[data-project-tile][data-glass-motion]');await expect(cards).toHaveCount(8);
 const boxes=await cards.evaluateAll(nodes=>nodes.map(node=>({width:node.offsetWidth,height:node.offsetHeight,mode:node.dataset.glassMotion,href:node.querySelector('a').getAttribute('href')})));
 expect(new Set(boxes.map(b=>b.href)).size).toBe(8);for(const box of boxes){expect(Math.abs(box.width-box.height)).toBeLessThanOrEqual(1);expect(box.mode).toBe(isMobile?'feed':'stream');}
 if(!isMobile)await expect.poll(()=>page.evaluate(()=>{
  const items=window.__globalBackground.inspect().driver.homeScrolling.informationWindows.items.filter(i=>i.kind==='home-project-card').slice(0,3);
  return items.length===3&&items[0].motion==='stream'&&Math.abs(items[0].streamOffset)>1&&Math.abs(items[0].streamOffset+items[1].streamOffset)<.01&&Math.abs(items[0].streamOffset-items[2].streamOffset)<.01;
 }),{timeout:WAIT}).toBe(true);
 await cards.first().locator('a').focus();await expect.poll(()=>cards.first().evaluate(node=>getComputedStyle(node).filter)).toBe('none');
 expect(await cards.first().evaluate(node=>getComputedStyle(node).transform)).toBe('none');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
