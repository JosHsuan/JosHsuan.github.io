import {test,expect} from '@playwright/test';
import {WAIT,scenarioTimeout} from './case-helpers.mjs';

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

test('all portfolio categories and both selected projects have direct readable no-JavaScript pages',async({browser})=>{
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
  await expect(page.locator('[data-project-card]')).toHaveCount(2);
  await page.locator('[data-project-card="xr-bending-active"]').click();
  await expect(page.locator('[data-xr-study]')).toBeVisible();
  for(const button of await page.locator('[data-xr-model-study] button,[data-xr-phone-study] button').all())await expect(button).toBeHidden();
  const nativeRecordings=page.locator('[data-xr-phone-study] a[href$="-interface.mp4"]');
  expect(await nativeRecordings.evaluateAll(links=>links.map(link=>link.getAttribute('href')).sort())).toEqual(['/assets/xr/adapt-interface.mp4','/assets/xr/adapt-interface.mp4','/assets/xr/assemble-interface.mp4','/assets/xr/join-interface.mp4']);
  for(const link of await nativeRecordings.all())await expect(link).toBeVisible();
 }finally{await context.close();}
});

test('Home has no project model and scrolls directly into the nine-grid project index',async({page,isMobile})=>{
 const modelRequests=[],errors=[];
 page.on('request',request=>{if(/\.(glb|hdr)(?:\?|$)/.test(request.url()))modelRequests.push(request.url());});
 page.on('pageerror',error=>errors.push(error.message));
 await page.goto('/');await entered(page);
 await expect(page.locator('[data-home-introduction] h1')).toHaveText('Hi, I’m JosHsuan.');
 expect(await page.locator('main>section').evaluateAll(sections=>sections.map(section=>section.id))).toEqual(['about','projects','contact']);
 await expect(page.locator('[data-cinematic-stage],[data-story-chapter],canvas[data-project-model-canvas]')).toHaveCount(0);
 await expect(page.locator('canvas')).toHaveCount(1);
 await expect(page.locator('canvas[data-global-background-field]')).toHaveCount(1);
 await expect(page.locator('[data-global-background] img,[data-home-introduction] canvas')).toHaveCount(0);
 expect(modelRequests).toEqual([]);
 const first=await page.evaluate(()=>scrollY);await page.mouse.wheel(0,130);
 await expect.poll(()=>page.evaluate(()=>scrollY)).toBeGreaterThan(first);
 await page.locator('[data-home-project-link]').click();await expect(page).toHaveURL(/\/#projects$/);
 await expect(page.locator('[data-project-grid]')).toBeInViewport();
 const geometry=await page.locator('[data-project-grid]').evaluate(element=>{const css=getComputedStyle(element);return{columns:css.gridTemplateColumns.split(' ').length,rows:css.gridTemplateRows.split(' ').length};});
 expect(geometry.columns).toBe(isMobile?1:3);if(!isMobile)expect(geometry.rows).toBe(3);
 await expect(page.locator('[data-project-card]')).toHaveCount(2);
 const cards=await page.locator('[data-project-tile]').evaluateAll(tiles=>tiles.map(tile=>{const image=tile.querySelector('img');const rect=tile.getBoundingClientRect();return{loaded:image.complete&&image.naturalWidth>0,alt:image.alt,square:Math.abs(rect.width-rect.height)<1};}));
 expect(cards.every(card=>card.loaded&&card.alt.length>15&&card.square)).toBe(true);
 expect(errors).toEqual([]);
});

test('site loading waits for actual critical images and same-page movement does not start another lifecycle',async({page})=>{
 let release;const imageGate=new Promise(resolve=>{release=resolve;});
 let revealAssay;
 await page.route('**/assets/xr/portfolio-main-visual.webp',async route=>{await imageGate;await route.continue();});
 try{
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await expect(loader(page)).toBeVisible();
  await expect(page.locator('[data-portfolio-root]')).toHaveAttribute('inert','');
  await page.waitForFunction(()=>window.__site?.inspect().phase==='requested');
  // Reinsert the real compiled case fallback last. Its ownership must remain
  // correct even when stylesheet arrival order would otherwise win a tie.
  revealAssay=await page.evaluateHandle(()=>{
   const candidates=[...document.styleSheets].flatMap(sheet=>[...sheet.cssRules]).filter(rule=>rule.selectorText?.includes('[data-entry-context]')&&rule.style?.cssText.includes('entry-fail-open'));
   if(candidates.length!==1)throw Error(`Expected one compiled case fallback, found ${candidates.length}`);
   const element=document.querySelector('[data-site-loader]'),style=document.createElement('style'),events=[];
   style.textContent=candidates[0].cssText;document.head.append(style);
   const ended=event=>{if(event.target===element)events.push({name:event.animationName,trusted:event.isTrusted,elapsed:event.elapsedTime});};
   element.addEventListener('animationend',ended);
   return{events,dispose(){element.removeEventListener('animationend',ended);style.remove();}};
  });
  release();await page.unrouteAll({behavior:'wait'});
  const ready=await entered(page);
  expect(ready.history.filter(fact=>fact.id===ready.id).map(fact=>fact.phase)).toEqual(['requested','ready','revealing','entered']);
  const animations=await revealAssay.evaluate(assay=>assay.events);
  expect(animations.filter(event=>event.trusted&&event.name.includes('site-reveal')&&event.elapsed>0)).toHaveLength(1);
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
  await expect(page.locator('h1')).toHaveText('About the way I work.');
  await page.locator('[data-portfolio-navigation] a[href="/projects/"]').click();await entered(page);
  await expect(page.locator('[data-project-card]')).toHaveCount(2);
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
 await expect(page.locator('h1')).toHaveText('An Extended-Reality App Using Motion Capture for Bending-Active Structure');
 await expect(page.locator('[data-xr-study]')).toContainText('Wataru Nomura');
 for(const id of ['xr-context','xr-method','xr-prototype','xr-contribution','xr-limits','xr-credits'])await expect(page.locator('#'+id)).toBeVisible();
 for(const summary of await page.locator('[data-xr-study] details summary').all())await summary.click();
 const expectedImages=['portfolio-main-visual.webp','adaptive-method.webp','physical-capture.webp','communication-system.webp','data-categories.webp','xr-research-assembly-poster.webp','measuring-tools.webp','module-assembly.webp','adapt-poster.webp','background-poster.webp','physical-assembly.webp','physical-result.webp'].map(name=>'/assets/xr/'+name).sort();
 expect(await page.locator('[data-xr-study] figure img').evaluateAll(images=>images.map(image=>image.getAttribute('src')).sort())).toEqual(expectedImages);
 for(const image of await page.locator('[data-xr-study] figure img').all()){await image.scrollIntoViewIfNeeded();await expect.poll(()=>image.evaluate(element=>element.complete&&element.naturalWidth>0)).toBe(true);}
 const entryId=await page.evaluate(()=>window.__site.inspect().id);
 await page.locator('a[href="#xr-prototype"]').click();
 await expect.poll(()=>page.evaluate(()=>{const heading=document.querySelector('#xr-prototype').getBoundingClientRect(),masthead=document.querySelector('[data-portfolio-navigation]').getBoundingClientRect();return heading.top>=masthead.bottom&&heading.top<innerHeight;})).toBe(true);
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
  await page.locator('[data-home-link]').click();await entered(page);await expect(page.locator('canvas')).toHaveCount(1);await expect(page.locator('canvas[data-global-background-field]')).toHaveCount(1);
 }finally{release();await page.unrouteAll({behavior:'wait'});}
});
