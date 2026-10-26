import {test,expect} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
import {WAIT,scenarioTimeout,settle,centerStudy} from './case-helpers.mjs';
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
 // A real blocked resource is the static material fixture, not OS motion policy.
 await page.emulateMedia({contrast:'no-preference',forcedColors:'none'});
 await page.route('**/assets/source-layers.glb',route=>route.abort());
 await page.goto('/projects/bending-active/#overview');
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

// Measure the real skin, with its original layout and paint. Hiding sibling
// content for this one crop prevents opaque source paper or glyphs from being
// mistaken for a bright, transmitting interface material.
async function skinPixels(page,owner){
 const parentStyle=await owner.evaluate(element=>{
  const style=element.getAttribute('style');element.style.setProperty('color','transparent','important');element.style.setProperty('-webkit-text-fill-color','transparent','important');return style;
 });
 const saved=await owner.evaluate(element=>[...element.children].filter(child=>!child.hasAttribute('data-information-skin')).map(child=>{
  const style=child.getAttribute('style');child.style.setProperty('visibility','hidden','important');return{style};
 }));
 try{
  const box=await owner.boundingBox();expect(box).not.toBeNull();
  const width=Math.min(64,box.width*.3),height=Math.min(32,box.height*.3);
  const png=await page.screenshot({animations:'disabled',clip:{x:box.x+(box.width-width)/2,y:box.y+(box.height-height)/2,width,height}});
  return await page.evaluate(async png=>{
   const bitmap=await createImageBitmap(await(await fetch('data:image/png;base64,'+png)).blob()),canvas=document.createElement('canvas');canvas.width=bitmap.width;canvas.height=bitmap.height;
   const context=canvas.getContext('2d');context.drawImage(bitmap,0,0);bitmap.close();const pixels=context.getImageData(0,0,canvas.width,canvas.height).data,rgb=[0,0,0];
   for(let offset=0;offset<pixels.length;offset+=4)for(let channel=0;channel<3;channel++)rgb[channel]+=pixels[offset+channel]/(pixels.length/4);
   return rgb;
  },png.toString('base64'));
 }finally{
  await owner.evaluate((element,saved)=>{
   const children=[...element.children].filter(child=>!child.hasAttribute('data-information-skin'));
   for(let index=0;index<children.length;index++){const style=saved[index].style;if(style===null)children[index].removeAttribute('style');else children[index].setAttribute('style',style);}
  },saved);
  await owner.evaluate((element,style)=>{if(style===null)element.removeAttribute('style');else element.setAttribute('style',style);},parentStyle);
 }
}

function materialDiagnostic(element){
 const read=(node,pseudo)=>{
  const style=getComputedStyle(node,pseudo),box=node.getBoundingClientRect();
  return{node:node.tagName,kind:node.dataset.informationWindow,pseudo,background:style.background,backdrop:style.backdropFilter||style.webkitBackdropFilter||'none',clipPath:style.clipPath,maskImage:style.maskImage||style.webkitMaskImage,filter:style.filter,opacity:style.opacity,isolation:style.isolation,transform:style.transform,willChange:style.willChange,visibility:style.visibility,position:style.position,zIndex:style.zIndex,inset:style.inset,box:{x:box.x,y:box.y,width:box.width,height:box.height}};
 };
 const skin=element.querySelector(':scope > [data-information-skin]'),ancestors=[];
 for(let node=element.parentElement;node;node=node.parentElement)ancestors.push(read(node));
 return{surface:read(element),skin:skin?read(skin):null,skinPaint:skin?read(skin,'::before'):null,ancestors};
}

async function neutralReadingMaterials(page,testInfo){
 // Native reading must lay out the real model information column before its
 // geometry is preserved. An inactive hidden study has no usable label box.
 await centerStudy(page,'form',{ready:false});
 const modelLabel=page.locator('[data-model-side-label][data-study-chapter="form"]');
 await expect(modelLabel).toBeVisible();
 await expect.poll(async()=>(await modelLabel.boundingBox())?.width??0,{timeout:WAIT}).toBeGreaterThan(60);
 // Check every existing UI variant, including metadata outside the seven
 // representative crops. Original SVG labels retain their source-authored ink.
 const foregrounds=await page.locator('[data-information-window]').evaluateAll(owners=>owners.flatMap(element=>{
  const rows=[],walker=document.createTreeWalker(element,NodeFilter.SHOW_TEXT);
  while(walker.nextNode()){
   const node=walker.currentNode,parent=node.parentElement;if(!node.textContent.trim()||!parent||parent.closest('svg,[role="status"],[aria-hidden="true"]'))continue;
   const style=getComputedStyle(parent);if(style.visibility==='hidden'||style.display==='none')continue;
   const range=document.createRange();range.selectNodeContents(node);if(![...range.getClientRects()].some(rect=>rect.width>3&&rect.height>3))continue;
   const color=style.color.match(/[\d.]+/g)?.map(Number);if(!color||color.length<3)throw Error('Unsupported UI ink: '+style.color);
   let opacity=color[3]??1;for(let owner=parent;owner;owner=owner.parentElement)opacity*=Number(getComputedStyle(owner).opacity);if(opacity===0)continue;
   const luminance=color.slice(0,3).map(channel=>{const value=channel/255;return value<=.04045?value/12.92:((value+.055)/1.055)**2.4;}).reduce((value,channel,index)=>value+channel*[.2126,.7152,.0722][index],0);
   rows.push({kind:parent.closest('[data-information-window]').dataset.informationWindow,text:node.textContent.trim().slice(0,65),color,luminance});
  }
  return rows;
 }));
 expect(foregrounds.length).toBeGreaterThan(30);
 const outside=await page.locator('[data-story-root]').evaluate(element=>({color:getComputedStyle(element).color,background:getComputedStyle(document.body).backgroundColor}));
 const mean=color=>color.match(/[\d.]+/g).slice(0,3).reduce((sum,value)=>sum+Number(value),0)/3;
 expect(mean(outside.color),'the surrounding story retains its light foreground').toBeGreaterThan(180);
 expect(mean(outside.background),'the scene retains its dark page background').toBeLessThan(40);
 const selectors=[
  '#form [data-information-window="editorial"]','[data-source-diagram="miura"]',
  '#make [data-information-window="evidence-image"]','#make [data-information-window="evidence-caption"]',
  '[data-model-side-label][data-study-chapter="form"]','#pattern [data-information-window="source-details"]',
 ];
 const viewport=page.viewportSize(),results=[];
 await page.evaluate(()=>{
  window.dispatchEvent(new Event('pagehide'));
  const background=document.createElement('div');background.dataset.readingMaterialBackground='';Object.assign(background.style,{position:'fixed',inset:'0',zIndex:'2147483000',pointerEvents:'none'});document.body.appendChild(background);
 });
 try{
  for(const selector of selectors){
   // Retain the exact node: its original chapter-scoped selector stops
   // matching while that same node is exposed directly under document.body.
   const owner=await page.locator(selector).first().elementHandle();expect(owner).not.toBeNull();
   const kind=await owner.evaluate(element=>{
    const box=element.getBoundingClientRect(),parent=element.parentNode,next=element.nextSibling,style=element.getAttribute('style'),saved=[];
    // Preserve the typography, box layout and exact ink that the real CSS
    // ancestry produced. Otherwise a moved caption loses .evidence figcaption
    // padding/flex/font rules and its figure index falls outside the round skin.
    // No material paint, opacity, filter or backdrop value is replaced here.
    const typography=['color','-webkit-text-fill-color','font-family','font-size','font-weight','font-style','font-stretch','line-height','letter-spacing','text-transform','white-space','overflow-wrap','word-break'];
    const layoutProperties=['box-sizing','display','width','height','min-width','max-width','min-height','max-height','margin-top','margin-right','margin-bottom','margin-left','padding-top','padding-right','padding-bottom','padding-left','gap','row-gap','column-gap','align-items','justify-content','flex-direction','flex-wrap','flex-grow','flex-shrink','flex-basis','grid-template-columns'];
    const layout=[element,...element.querySelectorAll('*')].filter(node=>node instanceof HTMLElement&&!node.closest('[data-information-skin]')).map(node=>{
     // Preserve the moved window's original box and inherited typography.
     // Descendants retain native layout: freezing resolved flex widths and
     // auto margins can wrap a button while retaining its old row height,
     // placing that button over the next caption on Linux Chromium.
     const captionChild=element.dataset.informationWindow==='evidence-caption'&&node.parentElement===element;
     const ancestryLayout=captionChild&&node.tagName==='P'?['margin-top','margin-right','margin-bottom','margin-left','max-width']:captionChild&&node.tagName==='SPAN'?['padding-top']:[];
     const properties=node===element?[...typography,...layoutProperties]:[...typography,...ancestryLayout];
     const computed=getComputedStyle(node);return{node,style:node.getAttribute('style'),values:properties.map(property=>[property,computed.getPropertyValue(property)])};
    });
    // Move the production node itself, preserving its width, descendants and
    // decorative skin. No copied text, recoloring or replacement panel exists.
    document.body.appendChild(element);
    // Normal inline priority lets the contrast helper's temporary important
    // transparent ink expose the backdrop beneath these exact authored colors.
    for(const row of layout)for(const [property,value] of row.values)row.node.style.setProperty(property,value);
    for(const [key,value] of Object.entries({position:'fixed',left:'12px',top:'12px',right:'auto',bottom:'auto',width:box.width+'px',maxWidth:'none',margin:'0',visibility:'visible',zIndex:'2147483001'}))element.style.setProperty(key.replace(/[A-Z]/g,char=>'-'+char.toLowerCase()),value,'important');
    // Source-authored text is outside interface contrast acceptance. Keep its
    // geometry, but exclude it from this temporary UI-only contrast exposure.
    for(const child of element.querySelectorAll('svg')){
     if(child.closest('[data-information-skin]'))continue;
     saved.push({child,style:child.getAttribute('style')});
     if(child.tagName.toLowerCase()==='svg')child.style.setProperty('visibility','hidden','important');
    }
    const action=element.querySelector('[class*="mediaAction"]');if(action){saved.push({child:action,style:action.getAttribute('style')});action.style.setProperty('opacity','1','important');}
    window.__readingMaterialRestore=()=>{for(const row of saved){if(row.style===null)row.child.removeAttribute('style');else row.child.setAttribute('style',row.style);}for(const row of layout){if(row.style===null)row.node.removeAttribute('style');else row.node.setAttribute('style',row.style);}parent.insertBefore(element,next);if(style===null)element.removeAttribute('style');else element.setAttribute('style',style);delete window.__readingMaterialRestore;};
    return element.dataset.informationWindow;
   });
   try{
    const result={kind,appearance:'neutral-dark',monotonicQuantizationTolerance:1,status:'measuring',samples:[]};results.push(result);
    const box=await owner.boundingBox();expect(box.width).toBeGreaterThan(60);expect(box.height).toBeGreaterThan(30);
    if(box.height+24>page.viewportSize().height)await page.setViewportSize({width:viewport.width,height:Math.ceil(box.height+24)});
    if(kind==='source-diagram'){
     const geometry=await owner.evaluate(element=>{
      const sequence=element.querySelector('ol'),drawing=element.querySelector('[data-library-drawing], [class*="hitRegion"]');
      if(!sequence||!drawing)return null;
      return{drawingBottom:drawing.getBoundingClientRect().bottom,sequenceTop:sequence.getBoundingClientRect().top,sequenceBottom:sequence.getBoundingClientRect().bottom,ownerBottom:element.getBoundingClientRect().bottom,stages:sequence.querySelectorAll('li').length};
     });
     expect(geometry,'source-diagram retains all native stage descriptions').not.toBeNull();
     expect(geometry.stages).toBeGreaterThan(0);expect(geometry.sequenceTop).toBeGreaterThanOrEqual(geometry.drawingBottom-.5);expect(geometry.sequenceBottom).toBeLessThanOrEqual(geometry.ownerBottom+.5);
     result.layout=geometry;
    }
    const samples=result.samples;
    for(const background of ['#000000','#404040','#808080','#c0c0c0','#ffffff']){
     await page.locator('[data-reading-material-background]').evaluate((element,color)=>{element.style.background=color;},background);
     const rgb=await skinPixels(page,owner),rows=await renderedTextContrast(page,owner),facts=await owner.evaluate(materialDiagnostic);
     const coreMean=rgb.reduce((sum,value)=>sum+value,0)/3,channelSpread=Math.max(...rgb)-Math.min(...rgb);
     samples.push({background,rgb,coreMean,channelSpread,rows,facts});
    }
    // Project-selected neutral-dark range, not an Apple numeric requirement.
    const brightness=samples[0].coreMean,transmission=samples.at(-1).coreMean-brightness;
    Object.assign(result,{brightness,transmission,status:'measured'});
    // Complete the five-point evidence before any numeric acceptance assertion.
    for(const [index,sample] of samples.entries()){
     expect(sample.rows.length,kind+' visible UI text').toBeGreaterThan(0);
     for(const row of sample.rows)expect(row.ratio,`${kind} / ${sample.background} / ${row.text}`).toBeGreaterThanOrEqual(row.required);
     expect(sample.channelSpread,`${kind} / ${sample.background}: neutral core`).toBeLessThan(14);
     if(index)expect(sample.coreMean+1,`${kind}: gray transfer must increase within one-code quantization`).toBeGreaterThan(samples[index-1].coreMean);
    }
    expect(brightness,kind+' visible dark core over black').toBeGreaterThan(8);expect(brightness,kind+' must not wash black into a white panel').toBeLessThan(85);
    expect(transmission,kind+' must transmit its real backdrop').toBeGreaterThan(20);expect(transmission,kind+' preserves a stable reading substrate').toBeLessThan(85);
    result.status='passed';
   }finally{await page.evaluate(()=>window.__readingMaterialRestore?.());await owner.dispose();}
  }
  expect(results.map(row=>row.kind).sort()).toEqual(['editorial','evidence-caption','evidence-image','model-label','source-details','source-diagram']);
  expect(await page.locator('[data-story-root]').evaluate(element=>({color:getComputedStyle(element).color,background:getComputedStyle(document.body).backgroundColor}))).toEqual(outside);
 }finally{
  const body=JSON.stringify({foregrounds,results},null,2)+'\n';
  await writeFile(testInfo.outputPath('neutral-reading-material.json'),body);
  await testInfo.attach('neutral-reading-material-pixels-and-contrast',{body,contentType:'application/json'});
  await page.evaluate(()=>{window.__readingMaterialRestore?.();document.querySelector('[data-reading-material-background]')?.remove();});
  await page.setViewportSize(viewport);await page.evaluate(()=>window.dispatchEvent(new Event('pageshow')));await settle(page);
 }
}

test('all information surfaces share one glass owner and preserve readable source paper',async({page},testInfo)=>{
 test.setTimeout(scenarioTimeout(120000));await staticStudy(page);
 const details=page.locator('#pattern [data-information-window="source-details"]');
 await details.scrollIntoViewIfNeeded();await expect(details.locator('img')).toBeVisible();await settle(page);
 await expect(page.locator('details,summary,[data-inspect-figure],[data-source-comparison]')).toHaveCount(0);
 const surfaces=await page.locator('[data-information-window]').evaluateAll(readMaterial);
 expect([...new Set(surfaces.map(row=>row.kind))].sort()).toEqual(['editorial','evidence-caption','evidence-image','model-label','source-details','source-diagram']);
 expect(surfaces.some(row=>row.nested)).toBe(true);expect(surfaces.some(row=>row.ready)).toBe(true);
 for(const row of surfaces)expectSingleMaterial(row);

 await expect(page.locator('[data-liquid-glass][data-liquid-ready]')).toHaveCount(1,{timeout:WAIT});
 const navigation=await page.locator('[data-liquid-glass="identity"]').evaluateAll(readMaterial);
 expect(navigation).toHaveLength(1);
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
 const content=await page.locator('#project-title,#system [data-editorial-copy],[data-source-diagram] svg,[data-model-side-label] h3,#pattern [data-information-window="source-details"] img').evaluateAll(elements=>elements.map(element=>{
  const filters=[];for(let owner=element;owner;owner=owner.parentElement)filters.push(getComputedStyle(owner).filter);
  const style=getComputedStyle(element);return{filters,backdrop:style.getPropertyValue('backdrop-filter')||style.getPropertyValue('-webkit-backdrop-filter')||'none'};
 }));
 expect(content.length).toBeGreaterThan(6);
 for(const row of content){expect(row.filters.some(filter=>filter.includes('blur('))).toBe(false);expect(row.backdrop).toBe('none');}
 await neutralReadingMaterials(page,testInfo);
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
  const page=await context.newPage();await page.goto('/projects/bending-active/#overview');await page.evaluate(()=>document.fonts.ready);
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
  const details=page.locator('#pattern [data-information-window="source-details"]');await details.scrollIntoViewIfNeeded();await expect(details.locator('img')).toBeVisible();
  await expect(details.locator('a,button,summary')).toHaveCount(0);await expect(details.locator('img')).toHaveAttribute('src','/assets/cinematic/function-library.webp');
 }finally{await context.close();}
});
