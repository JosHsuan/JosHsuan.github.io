import {test,expect} from '@playwright/test';
import {readFile,writeFile} from 'node:fs/promises';
import {WAIT,frames,scenarioTimeout} from './case-helpers.mjs';

const xrWorkspace=JSON.parse(await readFile(new URL('../../roles/uiux-designer/cases/bending-active-thesis/release/xr-workspace.json',import.meta.url),'utf8'));
const studies=JSON.parse(await readFile(new URL('../../roles/uiux-designer/cases/bending-active-thesis/release/project-studies.json',import.meta.url),'utf8')).projects;
const cardCount=studies.length+2;

const loader=page=>page.locator('[data-site-loader]');
async function entered(page,{failed=false}={}){
 await page.waitForFunction(()=>['entered','failed'].includes(window.__site?.inspect().phase),null,{timeout:WAIT});
 await expect(loader(page)).toBeHidden();
 const state=await page.evaluate(()=>window.__site.inspect());
 expect(state.phase).toBe(failed?'failed':'entered');
 const terminals=state.history.filter(fact=>fact.id===state.id&&['entered','failed','cancelled'].includes(fact.phase));
 expect(terminals).toHaveLength(1);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
 return state;
}

test('all portfolio categories and selected projects have direct readable no-JavaScript pages',async({browser})=>{
 const context=await browser.newContext({javaScriptEnabled:false});
 try{
  const page=await context.newPage();
  for(const route of ['/','/about/','/projects/','/contact/','/projects/xr-bending-active/']){
   const response=await page.goto('http://127.0.0.1:4186'+route);expect(response.status()).toBe(200);
   await expect(page.locator('main')).toHaveCount(1);await expect(page.locator('h1')).toHaveCount(1);
   await expect(loader(page)).toBeHidden();await expect(page.locator('main')).not.toHaveAttribute('inert','');
   await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href','https://joshsuan.github.io'+route);
   await expect(page.locator('canvas')).toHaveCount(1);
   await expect(page.locator('canvas[data-global-background-field]')).toHaveCount(1);
   await expect(page.locator('[data-animation-toggle]')).toBeHidden();
  }
  await page.goto('http://127.0.0.1:4186/');
  await page.locator('[data-home-project-link]').click();await expect(page).toHaveURL(/\/#projects$/);
  await expect(page.locator('[data-project-grid]')).toBeInViewport();
  await expect(page.locator('[data-project-card]')).toHaveCount(cardCount);
  await page.locator('[data-project-card="xr-bending-active"]').click();
  await expect(page.locator('[data-xr-study]')).toBeVisible();
  await expect(page.locator('[data-xr-scene-controls]')).toBeHidden();
  const nativeRecordings=page.locator('[data-xr-recording] a[href$="-interface.mp4"]');
  expect(await nativeRecordings.evaluateAll(links=>links.map(link=>link.getAttribute('href')).sort())).toEqual(['/assets/xr/adapt-interface.mp4','/assets/xr/assemble-interface.mp4','/assets/xr/join-interface.mp4']);
  for(const link of await nativeRecordings.all())await expect(link).toBeVisible();
 }finally{await context.close();}
});

test('Home keeps its introduction model-free and enters with its live project card already prepared',async({page,isMobile},info)=>{
 const modelRequests=[],errors=[];
 page.on('request',request=>{if(/\.(glb|hdr)(?:\?|$)/.test(request.url()))modelRequests.push(request.url());});
 page.on('pageerror',error=>errors.push(error.message));
 await page.goto('/');await entered(page);
 await expect(page.locator('[data-home-introduction] h1')).toHaveText('Hi, I’m JosHsuan.');
 await expect(page.locator('[data-introduction-statement]')).toHaveText('I am a computational designer and developer working at the intersection of design technology, digital fabrication, and spatial interaction.');
 await expect(page.locator('[data-introduction-description]')).toHaveText('My work bridges the physical and digital through computational tools, interactive interfaces, and workflows that translate design and engineering information into fabrication-ready, machine-readable data.');
 expect(await page.locator('main>section').evaluateAll(sections=>sections.map(section=>section.id))).toEqual(['about','projects','contact']);
 await expect(page.locator('[data-cinematic-stage],[data-story-chapter]')).toHaveCount(0);
 await expect(page.locator('canvas[data-project-model-canvas]')).toHaveCount(1);
 await expect(page.locator('canvas')).toHaveCount(2);
 await expect(page.locator('canvas[data-global-background-field]')).toHaveCount(1);
 await expect(page.locator('[data-global-background] img,[data-home-introduction] canvas')).toHaveCount(0);
 expect(modelRequests.sort()).toEqual([new URL('/assets/source-layers.glb',page.url()).href,new URL('/assets/studio-small.hdr',page.url()).href].sort());
 const prepared=await page.locator('[data-project-model-preview]').evaluate(node=>node.__projectModelPreview.inspect());
 expect(prepared.phase).toBe('ready');expect(prepared.resource.firstDraw.completed).toBe(true);expect(prepared.acquisitions).toBe(1);
 expect((await page.evaluate(()=>window.__site.inspect())).readiness.previews).toEqual([{mode:'model',reason:''}]);
 const first=await page.evaluate(()=>scrollY);await page.mouse.wheel(0,130);
 await expect.poll(()=>page.evaluate(()=>scrollY)).toBeGreaterThan(first);
 await page.locator('[data-home-project-link]').click();await expect(page).toHaveURL(/\/#projects$/);
 await expect(page.locator('[data-project-grid]')).toBeInViewport();
 const geometry=await page.locator('[data-project-grid]').evaluate(element=>{const css=getComputedStyle(element);return{columns:css.gridTemplateColumns.split(' ').length,rows:css.gridTemplateRows.split(' ').length};});
 expect(geometry.columns).toBe(isMobile?1:3);if(!isMobile)expect(geometry.rows).toBe(3);
 await expect(page.locator('[data-project-card]')).toHaveCount(cardCount);
 // During native scrolling a square layout intentionally has a non-square
 // perspective AABB. Preserve immediate source readiness, then verify that
 // the existing finite motion returns the original square projected surface.
 const measureCards=()=>page.locator('[data-project-tile]').evaluateAll(tiles=>tiles.map(tile=>{
  const image=tile.querySelector('img'),css=getComputedStyle(tile),rect=tile.getBoundingClientRect();
  const add=keys=>keys.reduce((sum,key)=>sum+parseFloat(css[key]),0);
  const borderWidth=parseFloat(css.width)+(css.boxSizing==='border-box'?0:add(['paddingLeft','paddingRight','borderLeftWidth','borderRightWidth']));
  const borderHeight=parseFloat(css.height)+(css.boxSizing==='border-box'?0:add(['paddingTop','paddingBottom','borderTopWidth','borderBottomWidth']));
  return{id:tile.dataset.projectTile,loaded:image.complete&&image.naturalWidth>0,alt:image.alt,
   boxSizing:css.boxSizing,borderWidth,borderHeight,offsetWidth:tile.offsetWidth,offsetHeight:tile.offsetHeight,
   projectedWidth:rect.width,projectedHeight:rect.height,transform:css.transform,moving:tile.dataset.informationMoving,
   plane:tile.hasAttribute('data-information-plane'),rx:tile.style.getPropertyValue('--information-rx'),ry:tile.style.getPropertyValue('--information-ry')};
 }));
 const geometryReceipt={immediate:await measureCards()};let geometryError;
 try{
  expect(geometryReceipt.immediate.every(card=>card.loaded&&card.alt.length>15&&Number.isFinite(card.borderWidth+card.borderHeight)&&card.borderWidth>0&&card.borderHeight>0&&Math.abs(card.borderWidth-card.borderHeight)<1)).toBe(true);
  await page.waitForFunction(()=>{
   const cards=[...document.querySelectorAll('[data-project-tile]')];
   return window.__globalBackground?.inspect().driver.homeScrolling.informationWindows.settled&&cards.length>0&&cards.every(card=>{
    const transform=getComputedStyle(card).transform;
    return card.dataset.informationMoving==='false'&&new DOMMatrix(transform==='none'?undefined:transform).isIdentity;
   });
  },null,{timeout:WAIT});
  geometryReceipt.rest=await measureCards();
  expect(geometryReceipt.rest.every(card=>card.loaded&&card.alt.length>15&&Math.abs(card.projectedWidth-card.projectedHeight)<1)).toBe(true);
 }catch(error){geometryError=error;throw error;}finally{
  try{const path=info.outputPath('home-card-square-geometry.json');await writeFile(path,JSON.stringify(geometryReceipt,null,2));await info.attach('home-card-square-geometry',{path,contentType:'application/json'});}
  catch(error){if(!geometryError)throw error;}
 }
 expect(errors).toEqual([]);
});

test('Home native scrolling uses the shared material clock, settles, returns and respects Reduced Motion',async({page})=>{
 await page.goto('/');await entered(page);
 const introduction=page.locator('[data-home-scroll-window="introduction"]');
 const canvas=await page.locator('canvas[data-project-model-canvas]').elementHandle();
 await expect.poll(()=>page.evaluate(()=>window.__globalBackground.inspect().driver.homeScrolling.enabled)).toBe(true);
 const observation=await introduction.evaluateHandle(node=>{
  const samples=[];
  const observer=new MutationObserver(()=>{
   const moving=node.getAttribute('data-information-moving')==='true',transform=getComputedStyle(node).transform;
   if(moving&&samples.length<64)samples.push({transform,displaced:transform!=='none'&&!new DOMMatrix(transform).isIdentity,y:scrollY,width:document.documentElement.scrollWidth,client:document.documentElement.clientWidth});
  });
  observer.observe(node,{attributes:true,attributeFilter:['style','data-information-moving']});
  return{samples,dispose(){observer.disconnect();}};
 });
 try{
  await page.mouse.wheel(0,260);
  await expect.poll(()=>observation.evaluate(value=>value.samples.some(sample=>sample.y>0&&sample.displaced))).toBe(true);
  await expect.poll(()=>page.evaluate(()=>window.__globalBackground.inspect().driver.homeScrolling.informationWindows.settled)).toBe(true);
  expect(await observation.evaluate(value=>value.samples.every(sample=>sample.width<=sample.client))).toBe(true);
  await page.locator('footer a[href="#portfolio-main"]').scrollIntoViewIfNeeded();
  expect(await introduction.evaluate(node=>node.getBoundingClientRect().bottom<0)).toBe(true);
  await page.locator('footer a[href="#portfolio-main"]').click();
  await expect.poll(()=>page.evaluate(()=>scrollY)).toBe(0);
  await expect(introduction).toBeInViewport();
  await page.locator('[data-home-project-link]').focus();
  await expect(page.locator('[data-home-project-link]')).toHaveCSS('transform','none');
  expect(await canvas.evaluate(node=>node.isConnected&&node===document.querySelector('canvas[data-project-model-canvas]'))).toBe(true);
  expect(await page.locator('[data-project-model-preview]').evaluate(node=>node.__projectModelPreview.inspect().acquisitions)).toBe(1);
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect.poll(()=>page.evaluate(()=>window.__globalBackground.inspect().driver.homeScrolling.policy.reduced)).toBe(true);
  await expect.poll(()=>page.evaluate(()=>window.__globalBackground.inspect().driver.homeScrolling.informationWindows.settled)).toBe(true);
  await expect(introduction).toHaveCSS('transform','none');
  await frames(page,8);const before=await page.evaluate(()=>window.__globalBackground.inspect().driver.frames);
  await page.mouse.wheel(0,200);await expect.poll(()=>page.evaluate(()=>scrollY)).toBeGreaterThan(0);await frames(page,8);
  expect(await page.evaluate(()=>window.__globalBackground.inspect().driver.frames)).toBe(before);
  expect(await page.evaluate(()=>window.__globalBackground.inspect().driver.homeScrolling.enabled)).toBe(false);
 }finally{await observation.evaluate(value=>value.dispose());await observation.dispose();}
});

test('the project grid retains aligned square cards without lines and supports complete rows of nine, twelve and fifteen',async({page,isMobile})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/projects/');await entered(page);
 const grid=page.locator('[data-project-grid]');
 await expect(grid).toHaveAttribute('data-project-grid-cells',String(Math.max(9,Math.ceil(cardCount/3)*3)));await expect(page.locator('[data-project-tile]')).toHaveCount(cardCount);
 const measure=()=>grid.evaluate(node=>{
  const style=getComputedStyle(node),rect=node.getBoundingClientRect();
  return{width:rect.width,height:rect.height,columns:style.gridTemplateColumns.split(' ').length,rows:style.gridTemplateRows.split(' ').length,
   background:style.backgroundImage,borders:[style.borderTopColor,style.borderLeftColor],
   cards:[...node.children].map(card=>{const r=card.getBoundingClientRect();return{x:r.left-rect.left,y:r.top-rect.top,width:r.width,height:r.height};})};
 });
 const base=await measure();expect(base.background).toBe('none');expect(base.borders).toEqual(['rgba(0, 0, 0, 0)','rgba(0, 0, 0, 0)']);
 expect(base.columns).toBe(isMobile?1:3);for(const card of base.cards)expect(Math.abs(card.width-card.height)).toBeLessThan(1);
 if(!isMobile){
  for(const rows of [3,4,5]){
   // Exercise the real layout's row parameter without inventing public projects.
   // Project-count mapping is separately checked against 9/10/13 source records.
   await grid.evaluate((node,value)=>node.style.setProperty('--project-grid-rows',String(value)),rows);
   const current=await measure();expect(current.rows).toBe(rows);expect(current.height/current.width).toBeCloseTo(rows/3,2);
   for(let i=0;i<base.cards.length;i++)for(const key of ['x','y','width','height'])expect(current.cards[i][key]).toBeCloseTo(base.cards[i][key],1);
  }
  await grid.evaluate(node=>node.style.setProperty('--project-grid-rows','3'));
 }
});

test('site loading waits for actual critical images and same-page movement does not start another lifecycle',async({page})=>{
 let release;const imageGate=new Promise(resolve=>{release=resolve;});
 let revealAssay;
 await page.route('**/assets/xr/portfolio-main-visual.webp',async route=>{await imageGate;await route.continue();});
 try{
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await expect(loader(page)).toBeVisible();
  await expect(loader(page).getByRole('heading',{name:'JosHsuan Chao',exact:true})).toHaveCount(1);
  expect((await loader(page).textContent()).match(/JosHsuan Chao/g)).toHaveLength(1);
  await expect(loader(page).getByRole('link',{name:'Return to home',exact:true})).toHaveAttribute('href','/');
  await expect(page.locator('[data-portfolio-root]')).toHaveAttribute('inert','');
  await page.waitForFunction(()=>window.__site?.inspect().phase==='requested');
  // Reinsert the real compiled case fallback last. Its ownership must remain
  // correct even when stylesheet arrival order would otherwise win a tie.
  revealAssay=await page.evaluateHandle(()=>{
   const candidates=[...document.styleSheets].flatMap(sheet=>[...sheet.cssRules]).filter(rule=>rule.selectorText?.includes('[data-entry-context]')&&rule.style?.cssText.includes('entry-fail-open'));
   if(candidates.length!==1)throw Error(`Expected one compiled case fallback, found ${candidates.length}`);
   const element=document.querySelector('[data-site-loader]'),content=element.querySelector('[data-site-loader-content]'),style=document.createElement('style');
   style.textContent=candidates[0].cssText;document.head.append(style);
   const nativeAnimate=Element.prototype.animate,started=[],fulfilled=[],rejected=[];
   if(typeof nativeAnimate!=='function'||!content)throw Error('Expected native reveal targets');
   const snapshot=(animation,target)=>{
    const timing=animation.effect.getComputedTiming();
    return{target:target===element?'loader':'content',exactTarget:animation.effect.target===target,
     duration:timing.duration,easing:timing.easing,fill:timing.fill,currentTime:animation.currentTime,
     progress:timing.progress,localTime:timing.localTime,playState:animation.playState,
     cssAnimationName:getComputedStyle(target).animationName,
     cssRevealWriters:element.getAnimations({subtree:true}).filter(effect=>/site-(?:reveal|lift)/.test(effect.animationName??'')).length};
   };
   // Observe the exact native promises before the controller subscribes. Its
   // terminal cleanup may cancel fill-both handles before finish events dispatch.
   const observedAnimate=function(...args){
    const animation=Reflect.apply(nativeAnimate,this,args);
    if(this===element||this===content){
     const finished=animation.finished;
     started.push(snapshot(animation,this));
     finished.then(()=>fulfilled.push(snapshot(animation,this)),error=>rejected.push({target:this===element?'loader':'content',name:error.name}));
    }
    return animation;
   };
   Element.prototype.animate=observedAnimate;
   return{started,fulfilled,rejected,dispose(){if(Element.prototype.animate===observedAnimate)Element.prototype.animate=nativeAnimate;style.remove();}};
  });
  release();await page.unrouteAll({behavior:'wait'});
  const ready=await entered(page);
  expect(ready.history.filter(fact=>fact.id===ready.id).map(fact=>fact.phase)).toEqual(['requested','ready','revealing','entered']);
  const animations=await revealAssay.evaluate(assay=>({started:assay.started,fulfilled:assay.fulfilled,rejected:assay.rejected}));
  expect(animations.started.map(animation=>animation.target).sort()).toEqual(['content','loader']);
  expect(animations.fulfilled.map(animation=>animation.target).sort()).toEqual(['content','loader']);
  expect(animations.rejected).toEqual([]);
  for(const animation of [...animations.started,...animations.fulfilled]){
   expect(animation.exactTarget).toBe(true);expect(animation.duration).toBe(720);
   expect(animation.easing).toBe('cubic-bezier(0.45, 0, 0.15, 1)');expect(animation.fill).toBe('both');
   expect(animation.cssAnimationName).toBe('none');expect(animation.cssRevealWriters).toBe(0);
  }
  for(const animation of animations.fulfilled){
   expect(animation.playState).toBe('finished');expect(animation.currentTime).toBe(720);
   expect(animation.localTime).toBe(720);expect(Math.abs(animation.progress-1)).toBeLessThanOrEqual(Number.EPSILON);
  }
  await page.locator('[data-home-project-link]').click();
  const after=await page.evaluate(()=>window.__site.inspect());expect(after.id).toBe(ready.id);expect(after.history).toEqual(ready.history);
  await expect(page.locator('[data-portfolio-root]')).not.toHaveAttribute('inert','');
 }finally{
  release();await page.unrouteAll({behavior:'wait'});
  if(revealAssay){await revealAssay.evaluate(assay=>assay.dispose());await revealAssay.dispose();}
 }
});

test('native internal routes display loading and close the correlated request across navigation and history',async({page})=>{
 await page.goto('/');await entered(page);
 // Read the outgoing document in the native click event. Locator assertions
 // deliberately wait for navigation and cannot inspect a held response here.
 await page.evaluate(()=>document.addEventListener('click',event=>{
  if(event.target.closest('a[href="/about/"]')){
   const node=document.querySelector('[data-site-loader]');
   sessionStorage.setItem('test-site-departure',JSON.stringify({state:window.__site.inspect(),visible:!node.hidden&&getComputedStyle(node).visibility==='visible'}));
  }
 },{once:true}));
 await page.locator('[data-portfolio-navigation] a[href="/about/"]').click();
 const observation=await page.evaluate(()=>JSON.parse(sessionStorage.getItem('test-site-departure')));
 expect(observation.visible).toBe(true);expect(observation.state.phase).toBe('requested');expect(observation.state.kind).toBe('navigation');
 const departure=observation.state;
  const destination=await entered(page);expect(destination.id).toBe(departure.id);
  expect(destination.history.filter(fact=>fact.id===destination.id).map(fact=>fact.phase)).toEqual(['requested','ready','revealing','entered']);
  await expect(page.locator('h1')).toHaveText('Between physical and digital.');
  await page.locator('[data-portfolio-navigation] a[href="/projects/"]').click();await entered(page);
  await expect(page.locator('[data-project-card]')).toHaveCount(cardCount);
  await page.locator('[data-portfolio-navigation] a[href="/contact/"]').click();await entered(page);
  await expect(page.locator('[data-portfolio-contact] a[href="https://github.com/JosHsuan"]')).toBeVisible();
  for(const href of ['mailto:chiahsuanchao@icloud.com','https://www.linkedin.com/in/joshsuan/','https://www.instagram.com/joshsuan.chao/'])await expect(page.locator(`[data-portfolio-contact] a[href="${href}"]`)).toBeVisible();
  await page.goBack();await entered(page);await expect(page).toHaveURL(/\/projects\/$/);
  await page.goForward();await entered(page);await expect(page).toHaveURL(/\/contact\/$/);
});

test('a failed image releases readable content with one explicit failure terminal',async({page})=>{
 await page.route('**/assets/xr/portfolio-main-visual.webp',route=>route.abort());
 await page.goto('/');const state=await entered(page,{failed:true});expect(state.reason).toContain('critical-image-unavailable');
 await expect(page.locator('[data-portfolio-root]')).not.toHaveAttribute('inert','');
 await expect(page.locator('[data-home-project-link]')).toBeVisible();
 await page.locator('[data-home-project-link]').click();await expect(page.locator('[data-project-grid]')).toBeInViewport();
});

test('real unavailable webfonts settle to one explicit failure and readable system typography',async({page})=>{
 await page.route('**/*.woff2',route=>route.abort());
 await page.goto('/');const state=await entered(page,{failed:true});expect(state.reason).toContain('fonts-unavailable');
 expect(await page.evaluate(()=>[...document.fonts].some(face=>face.status==='error'))).toBe(true);
 await expect(page.locator('[data-portfolio-root]')).not.toHaveAttribute('inert','');
 await expect(page.locator('[data-home-introduction] h1')).toBeVisible();
});

test('XR detail preserves real evidence, shared authorship and a native related-project route',async({page})=>{
 const requests=[],errors=[];page.on('request',request=>{if(/\.(glb|hdr)(?:\?|$)/.test(request.url()))requests.push(request.url());});page.on('pageerror',error=>errors.push(error.message));
 await page.goto('/projects/xr-bending-active/');await entered(page);
 const viewport=page.viewportSize(),xrViewport=await page.evaluate(()=>({client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,inner:innerWidth,visual:visualViewport?.width}));
 expect(xrViewport.client).toBe(viewport.width);expect(xrViewport.scroll).toBeLessThanOrEqual(xrViewport.client);expect(xrViewport.inner).toBe(viewport.width);expect(xrViewport.visual).toBeCloseTo(viewport.width,0);
 await expect(page.locator('h1')).toHaveText('An Extended-Reality App Using Motion Capture for Bending-Active Structure');
 await expect(page.locator('[data-xr-study]')).toContainText('Wataru Nomura');
 for(const id of ['xr-context','xr-method','xr-prototype','xr-making','xr-credits'])await expect(page.locator('#'+id)).toBeVisible();
 await expect(page.locator('#xr-contribution,#xr-limits,a[href="#xr-contribution"],a[href="#xr-limits"]')).toHaveCount(0);
 await expect(page.locator('[data-xr-study] details')).toHaveCount(0);
 await expect(page.locator('[data-xr-opening-visual],[data-xr-hero]')).toHaveCount(0);
 const expectedImages=['adaptive-method.webp','physical-capture.webp','communication-system.webp','data-categories.webp','measuring-tools.webp','module-assembly.webp','physical-assembly.webp','physical-result.webp'].map(name=>'/assets/xr/'+name).sort();
 expect(await page.locator('[data-xr-study] figure img').evaluateAll(images=>images.map(image=>image.getAttribute('src')).sort())).toEqual(expectedImages);
 for(const image of await page.locator('[data-xr-study] figure img').all()){await image.scrollIntoViewIfNeeded();await expect.poll(()=>image.evaluate(element=>element.complete&&element.naturalWidth>0)).toBe(true);}
 const entryId=await page.evaluate(()=>window.__site.inspect().id);
 await page.locator('[data-xr-chapter-link="context"]').click();
 await expect.poll(()=>page.locator('[data-xr-stage]').evaluate(node=>node.__xrStage.inspect().workspace.phase)).toBe('ready');
 const expectedWorkspace=viewport.width<800?xrWorkspace.image.mobile:xrWorkspace.image;
 await expect(page.locator('[data-xr-workspace-visual]')).toBeVisible();
 expect(await page.locator('[data-xr-workspace-visual]').evaluate(node=>({src:new URL(node.currentSrc).pathname,width:node.naturalWidth,height:node.naturalHeight,complete:node.complete,fit:getComputedStyle(node).objectFit}))).toEqual({src:expectedWorkspace.src,width:expectedWorkspace.width,height:expectedWorkspace.height,complete:true,fit:'contain'});
 await page.locator('[data-xr-chapter-link="adapt"]').click();
 await expect.poll(()=>page.evaluate(()=>{const heading=document.querySelector('#xr-adapt').getBoundingClientRect(),masthead=document.querySelector('[data-portfolio-navigation]').getBoundingClientRect();return heading.top>=masthead.bottom&&heading.top<innerHeight;})).toBe(true);
 expect(await page.evaluate(()=>window.__site.inspect().id)).toBe(entryId);
 await expect(page.locator('[data-xr-study] a[href="/projects/bending-active/"]')).toBeVisible();
 await page.reload();await entered(page);
 expect(requests.length).toBeGreaterThan(0);
 expect(requests.every(url=>url.endsWith('/assets/xr/xr-research-assembly.glb'))).toBe(true);
 expect(errors).toEqual([]);
});

test('Bending page retains one original scene gate and publishes its terminal into site readiness',async({page})=>{
 test.setTimeout(scenarioTimeout(120000));let release;const modelGate=new Promise(resolve=>{release=resolve;});
 await page.route('**/assets/source-layers.glb',async route=>{await modelGate;await route.continue();});
 try{
  await page.goto('/projects/bending-active/#overview',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__story?.inspect().entry.phase==='preparing',null,{timeout:WAIT});
  await expect(page.locator('[data-entry-loader]')).toBeVisible();await expect(loader(page)).toBeHidden();
  expect((await page.evaluate(()=>window.__site.inspect())).delegated).toBe(true);
  release();await page.unrouteAll({behavior:'wait'});
  await page.waitForFunction(()=>window.__story?.inspect().entry.phase==='entered'&&window.__thesis?.inspect().ready,null,{timeout:WAIT});
  const state=await entered(page);expect(state.delegated).toBe(true);
  await expect(page.locator('[data-entry-loader]')).toBeHidden();await expect(page.locator('[data-cinematic-stage] canvas')).toHaveCount(1);
  await page.locator('[data-home-link]').click();await entered(page);await expect(page.locator('canvas')).toHaveCount(2);await expect(page.locator('canvas[data-project-model-canvas]')).toHaveCount(1);await expect(page.locator('canvas[data-global-background-field]')).toHaveCount(1);
 }finally{release();await page.unrouteAll({behavior:'wait'});}
});
