import {test,expect} from '@playwright/test';
import {WAIT,scenarioTimeout,settle} from './case-helpers.mjs';
import {renderedTextContrast} from './reading-contrast.mjs';

// This function runs in the browser. Inspect the actual material owner and
// painted alpha rather than treating a matching token string as visual proof.
function readMaterial(input){
 const backdrop=style=>style.getPropertyValue('backdrop-filter')||style.getPropertyValue('-webkit-backdrop-filter')||'none';
 const alpha=color=>{
  const values=color.match(/^rgba?\(([^)]+)\)$/)?.[1].replace('/',' ').split(/[,\s]+/).filter(Boolean).map(Number);
  if(!values)throw Error('Unsupported computed material colour: '+color);
  return values.length===4?values[3]:1;
 };
 const sample=element=>{
  const style=getComputedStyle(element),skin=element.querySelector(':scope > [data-information-skin],:scope > [data-liquid-skin]');
  const liquid=element.hasAttribute('data-liquid-glass'),skinStyle=skin&&getComputedStyle(skin);
  const paint=skinStyle?.display!=='none'&&skin?(liquid?skinStyle:getComputedStyle(skin,'::before')):style;
  const owners=[{node:'surface',value:backdrop(style)}];
  if(skinStyle?.display!=='none'&&skin){
   owners.push({node:'skin',value:backdrop(skinStyle)},{node:'skin paint',value:backdrop(getComputedStyle(skin,'::before'))});
  }
  return {
   kind:element.dataset.informationWindow||element.dataset.liquidGlass,material:style.getPropertyValue('--glass-material').trim(),mode:element.dataset.liquidMode,
   ready:element.hasAttribute('data-information-ready')||element.hasAttribute('data-liquid-ready'),nested:!!element.parentElement?.closest('[data-information-window]'),
   skinCount:element.querySelectorAll(':scope > [data-information-skin],:scope > [data-liquid-skin]').length,
   owners:owners.filter(owner=>owner.value!=='none'),opacity:Number(style.opacity),
   alpha:alpha(paint.backgroundColor),background:paint.background,filter:style.filter,
   supportsBackdrop:CSS.supports('backdrop-filter','blur(1px)')||CSS.supports('-webkit-backdrop-filter','blur(1px)'),
  };
 };
 return Array.isArray(input)?input.map(sample):sample(input);
}

async function staticStudy(page){
 await page.emulateMedia({reducedMotion:'reduce',contrast:'no-preference',forcedColors:'none'});
 await page.goto('/');
 await page.waitForFunction(()=>window.__story?.inspect().entry.phase==='entered'&&window.__story.inspect().libraryDiagram.count===1,null,{timeout:WAIT});
 await page.evaluate(()=>document.fonts.ready);await settle(page);
 await expect(page.locator('[data-cinematic-stage] canvas')).toHaveCount(0);
}

function expectSingleMaterial(row){
 expect(row.opacity,`${row.kind}: content opacity`).toBe(1);
 expect(row.filter,`${row.kind}: content must not be blurred`).not.toContain('blur(');
 expect(row.skinCount,`${row.kind}: React owns one decorative skin`).toBe(1);
 if(row.nested){
  expect(row.material).toBe('nested');expect(row.owners).toEqual([]);expect(row.alpha).toBe(0);
 }else{
  expect(row.material).toBe('regular');
  if(row.supportsBackdrop){
   expect(row.owners.map(owner=>owner.node)).toEqual([row.ready?'skin':'surface']);
   expect(row.owners[0].value).toContain('blur(');expect(row.alpha).toBeGreaterThan(0);expect(row.alpha).toBeLessThan(1);
  }else{
   expect(row.owners).toEqual([]);expect(row.alpha).toBe(1);
  }
 }
}

test('all information surfaces share one glass owner and preserve readable source paper',async({page})=>{
 test.setTimeout(scenarioTimeout(120000));await staticStudy(page);
 const details=page.locator('#pattern [data-information-window="source-details"]');
 await details.locator(':scope > summary').click();await expect(details).toHaveJSProperty('open',true);await settle(page);
 const trigger=page.locator('#make [data-inspect-figure]');
 await trigger.scrollIntoViewIfNeeded();await settle(page);await trigger.click();
 const portal=page.locator('[data-source-comparison]');await expect(portal).toBeVisible();
 await expect(portal).toHaveAttribute('data-information-ready',/.*/,{timeout:WAIT});
 await expect.poll(()=>portal.locator('img').evaluate(image=>image.complete&&image.naturalWidth>0),{timeout:WAIT}).toBe(true);await settle(page);
 const surfaces=await page.locator('[data-information-window]').evaluateAll(readMaterial);
 expect([...new Set(surfaces.map(row=>row.kind))].sort()).toEqual(['editorial','evidence-caption','evidence-image','model-label','source-details','source-diagram','source-portal']);
 expect(surfaces.some(row=>row.nested)).toBe(true);expect(surfaces.some(row=>row.ready)).toBe(true);
 for(const row of surfaces)expectSingleMaterial(row);

 await expect(page.locator('[data-liquid-glass][data-liquid-ready]')).toHaveCount(3,{timeout:WAIT});
 const navigation=await page.locator('[data-story-navigation],[data-page-masthead] > span,[data-reading-tools]').evaluateAll(readMaterial);
 expect(navigation).toHaveLength(3);
 for(const row of navigation){
  expect(row.material).toBe('navigation');expect(row.opacity).toBe(1);expect(row.skinCount).toBe(1);expect(row.ready).toBe(true);
  expect(row.mode).toMatch(/^(refractive|reflective|opaque)$/);
  expect(row.owners.map(owner=>owner.node)).toEqual(row.supportsBackdrop&&row.mode!=='opaque'?['skin']:[]);
  expect(row.background).toBe(navigation[0].background);
  // Each refracting group has its own bounded map. Compare the common native
  // diffusion while keeping each unique SVG URL on its sole decorative owner.
  const diffusion=value=>value.replace(/url\([^)]*\)\s*/g,'');
  expect(row.owners.map(owner=>diffusion(owner.value))).toEqual(navigation[0].owners.map(owner=>diffusion(owner.value)));
 }
 const papers=await page.locator('[data-source-diagram] [data-choreography="diagram"]').evaluateAll(readMaterial);
 expect(papers).toHaveLength(3);
 for(const paper of papers){expect(paper.material).toBe('source-paper');expect(paper.alpha).toBe(1);expect(paper.filter).not.toContain('blur(');expect(paper.owners).toEqual([]);}
 // Backdrop blur belongs behind the interface. Neither its text, original
 // vector linework nor original comparison image may inherit a content blur.
 const content=await page.locator('#overview h1,#system [data-editorial-copy],[data-source-diagram] svg,[data-model-side-label] h3,[data-source-comparison] img').evaluateAll(elements=>elements.map(element=>{
  const filters=[];for(let owner=element;owner;owner=owner.parentElement)filters.push(getComputedStyle(owner).filter);
  const style=getComputedStyle(element);return{filters,backdrop:style.getPropertyValue('backdrop-filter')||style.getPropertyValue('-webkit-backdrop-filter')||'none'};
 }));
 expect(content.length).toBeGreaterThan(6);
 for(const row of content){expect(row.filters.some(filter=>filter.includes('blur('))).toBe(false);expect(row.backdrop).toBe('none');}
 await page.getByRole('button',{name:'Close source comparison'}).click();await expect(portal).toHaveCount(0);await expect(trigger).toBeFocused();
});

test('native transparency and contrast preferences update an already registered material',async({page,context,browserName},testInfo)=>{
 test.setTimeout(scenarioTimeout(120000));await staticStudy(page);
 const panel=page.locator('#overview [data-information-window="editorial"]');
 await expect(panel).toHaveAttribute('data-information-ready',/.*/,{timeout:WAIT});
 const skin=await panel.locator(':scope > [data-information-skin]').elementHandle();
 const initial=await panel.evaluate(readMaterial);expectSingleMaterial(initial);
 const fallback=async()=>{
  const row=await panel.evaluate(readMaterial);expect(row.owners).toEqual([]);expect(row.alpha).toBe(1);expect(row.opacity).toBe(1);
  expect(await panel.evaluate((element,original)=>element.querySelector(':scope > [data-information-skin]')===original,skin)).toBe(true);
  await expect(page.locator('[data-cinematic-stage] canvas')).toHaveCount(0);
 };
 await page.emulateMedia({reducedMotion:'reduce',contrast:'more'});
 await expect.poll(()=>page.evaluate(()=>matchMedia('(prefers-contrast:more)').matches)).toBe(true);await fallback();
 await page.emulateMedia({reducedMotion:'reduce',contrast:'no-preference'});expectSingleMaterial(await panel.evaluate(readMaterial));

 if(browserName==='chromium'){
  const cdp=await context.newCDPSession(page);
  const features=value=>[{name:'prefers-reduced-motion',value:'reduce'},{name:'prefers-contrast',value:'no-preference'},{name:'forced-colors',value:'none'},{name:'prefers-reduced-transparency',value}];
  try{
   await cdp.send('Emulation.setEmulatedMedia',{features:features('reduce')});
   await expect.poll(()=>page.evaluate(()=>matchMedia('(prefers-reduced-transparency:reduce)').matches)).toBe(true);await fallback();
   await cdp.send('Emulation.setEmulatedMedia',{features:features('no-preference')});expectSingleMaterial(await panel.evaluate(readMaterial));
  }finally{await cdp.send('Emulation.setEmulatedMedia',{features:features('no-preference')});await cdp.detach();}
 }else{
  testInfo.annotations.push({type:'coverage-limit',description:'WebKit has no CDP transparency emulation here. Native prefers-contrast is covered; prefers-reduced-transparency is not claimed.'});
 }
 await page.emulateMedia({reducedMotion:'reduce',contrast:'no-preference',forcedColors:'active'});
 // Both pinned browser drivers expose native forced-colors emulation. Require
 // the actual media query, rather than accepting an ignored API call as proof.
 await expect.poll(()=>page.evaluate(()=>matchMedia('(forced-colors:active)').matches)).toBe(true);
 await fallback();
 expect(await panel.locator(':scope > [data-information-skin]').evaluate(element=>getComputedStyle(element).boxShadow)).toBe('none');
 await page.emulateMedia({reducedMotion:'reduce',contrast:'no-preference',forcedColors:'none'});expectSingleMaterial(await panel.evaluate(readMaterial));
});

test('without JavaScript the reading material remains legible and original drawings remain opaque',async({browser,baseURL},testInfo)=>{
 test.setTimeout(scenarioTimeout(120000));
 const context=await browser.newContext({javaScriptEnabled:false,reducedMotion:'reduce',baseURL,viewport:testInfo.project.use.viewport});
 try{
  const page=await context.newPage();await page.goto('/');await page.evaluate(()=>document.fonts.ready);
  await expect(page.locator('[data-entry-loader]')).toBeHidden();await expect(page.locator('[data-cinematic-stage] canvas')).toHaveCount(0);
  const panel=page.locator('#overview [data-information-window="editorial"]'),row=await panel.evaluate(readMaterial);
  expect(row.ready).toBe(false);expectSingleMaterial(row);
  const contrast=await renderedTextContrast(page,page.locator('#overview [data-reading-copy]'));
  expect(contrast.length).toBeGreaterThan(0);for(const line of contrast)expect(line.ratio,line.text).toBeGreaterThanOrEqual(line.required);
  const drawing=page.locator('[data-source-diagram="library"] [data-choreography="diagram"]');
  await drawing.scrollIntoViewIfNeeded();const original=drawing.locator('img');await expect(original).toBeVisible();
  await expect.poll(()=>original.evaluate(image=>image.complete&&image.naturalWidth>0),{timeout:WAIT}).toBe(true);
  expect((await drawing.evaluate(readMaterial)).alpha).toBe(1);
  expect(await original.evaluate(element=>getComputedStyle(element).filter)).not.toContain('blur(');
  const details=page.locator('#pattern [data-information-window="source-details"]');await details.locator(':scope > summary').click();await expect(details).toHaveJSProperty('open',true);
  await expect(details.locator('[data-inspect-figure]')).toHaveAttribute('href',/\/assets\/cinematic\/source-p\d+\.webp$/);
 }finally{await context.close();}
});
