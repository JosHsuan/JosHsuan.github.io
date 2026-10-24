import {test,expect} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
import {WAIT,frames,scenarioTimeout} from './case-helpers.mjs';
const read=page=>page.evaluate(()=>({y:scrollY,idle:(()=>{const host=document.querySelector('[data-home-research-host]');if(!host)return null;const css=getComputedStyle(host);return{transform:css.transform,name:css.animationName,playState:css.animationPlayState,animations:host.getAnimations().slice(0,2).map(a=>({currentTime:a.currentTime,playState:a.playState}))};})(),nativeProgress:(()=>{const root=document.querySelector('[data-home-research-story]');if(!root)return null;let top=0;for(let n=root;n;n=n.offsetParent)top+=n.offsetTop;return Math.max(0,Math.min(1,(scrollY-top)/Math.max(1,root.offsetHeight-innerHeight)));})(),site:window.__site?.inspect(),hero:window.__homeResearch?.inspect(),presenter:window.__globalBackground?.inspect().driver.homeResearch}));
async function entered(page){await expect.poll(async()=>(await read(page)).site?.phase,{timeout:WAIT}).toBe('entered');await expect(page.locator('[data-site-loader]')).toBeHidden();}
async function nativeY(page,target){await page.mouse.wheel(0,target-await page.evaluate(()=>scrollY));await expect.poll(()=>page.evaluate(()=>scrollY),{timeout:WAIT}).toBe(target);}
async function current(page){await expect.poll(async()=>{const s=await read(page);return !!(s.presenter?.enabled&&s.hero?.resource&&Math.abs(s.presenter.progress-s.nativeProgress)<1e-9&&Math.abs(s.hero.resource.progress-s.presenter.progress)<1e-9);},{timeout:WAIT}).toBe(true);return read(page);}
async function cleanupPreserving(action,primary){try{await action();}catch(error){if(!primary)throw error;}}
async function receipt(info,name,value){const path=info.outputPath(name+'.json');await writeFile(path,JSON.stringify(value,null,2));await info.attach(name,{path,contentType:'application/json'});}

test('Home native research camera reverses while independent idle adds no 3D work and Pause retains native reading',async({page,isMobile},info)=>{
 let primary;const rows=[],requests=[];page.on('request',r=>{if(/\.(glb|hdr)(?:\?|$)/.test(r.url()))requests.push(r.url());});await page.goto('/');await entered(page);
 const capture=async name=>{await expect.poll(async()=>{const s=await read(page);return Math.abs(s.presenter.progress-s.nativeProgress)<1e-9&&(!s.presenter.enabled||Math.abs(s.hero.resource.progress-s.presenter.progress)<1e-9);},{timeout:WAIT}).toBe(true);const before=await read(page),path=info.outputPath(name+'.png');await page.screenshot({path});const after=await read(page);rows.push({phase:name,before,after});expect(after.hero.resource.pose).toEqual(before.hero.resource.pose);await info.attach(name,{path,contentType:'image/png'});};
 await capture('home-initial');
 const range=await page.locator('[data-home-research-story]').evaluate(root=>{
  const top=node=>{let y=0;for(;node;node=node.offsetParent)y+=node.offsetTop;return y;};
  const visual=root.querySelector('[data-home-research-visual]'),host=root.querySelector('[data-home-research-host]'),sticky=getComputedStyle(visual).position==='sticky';
  const low=sticky?top(root):Math.max(0,top(host)-innerHeight+48),high=sticky?top(root)+root.offsetHeight-innerHeight:top(host)+host.offsetHeight-48;
  return{low:Math.ceil(low),high:Math.floor(Math.min(high,document.documentElement.scrollHeight-innerHeight)),sticky};
 });
 expect(range.high-range.low).toBeGreaterThan(64);
 const a=Math.round(range.low+(range.high-range.low)*.25),b=Math.round(range.low+(range.high-range.low)*.65);
 try{
  await nativeY(page,a);const first=await current(page);rows.push({phase:'first',...first});
  await nativeY(page,b);const detail=await current(page);rows.push({phase:'detail',...detail});
  expect(detail.hero.resource.pose.position).not.toEqual(first.hero.resource.pose.position);
  expect(detail.hero.resource.sourceRevision).toBe(first.hero.resource.sourceRevision);await capture('home-detail');
  await nativeY(page,a);const reversed=await current(page);rows.push({phase:'reverse',...reversed});
  expect(reversed.hero.resource.pose).toEqual(first.hero.resource.pose);
  expect(reversed.hero.acquisitions).toBe(1);expect(reversed.hero.disposals).toBe(0);
  const before=await read(page);await frames(page,8);const after=await read(page);rows.push({phase:'idle',before,after});
  expect(after.hero.resource.frames).toBe(before.hero.resource.frames);expect(after.hero.resource.preparations).toBe(before.hero.resource.preparations);
  expect(before.idle.animations).toHaveLength(1);expect(after.idle.animations).toHaveLength(1);expect(before.idle.animations[0].playState).toBe('running');expect(after.idle.animations[0].currentTime).toBeGreaterThan(before.idle.animations[0].currentTime);expect(after.idle.transform).not.toBe(before.idle.transform);
  const pause=page.locator('[data-home-research-pause]');
  const button=await pause.evaluate(node=>{const r=node.getBoundingClientRect(),s=getComputedStyle(node),rgba=value=>{const a=value.match(/[\d.]+/g)?.map(Number);if(!a||a.length<3||(a[3]??1)!==1)throw Error('Opaque button palette required');return a.slice(0,3);},lum=a=>a.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0),f=lum(rgba(s.color)),b=lum(rgba(s.backgroundColor));return{width:r.width,height:r.height,foreground:s.color,background:s.backgroundColor,ratio:(Math.max(f,b)+.05)/(Math.min(f,b)+.05)};});
  expect(button.width).toBeGreaterThanOrEqual(44);expect(button.height).toBeGreaterThanOrEqual(44);expect(button.ratio).toBeGreaterThanOrEqual(4.5);rows.push({phase:'pause-control',button});await pause.click();await expect(pause).toHaveAttribute('aria-pressed','true');
  const held=await read(page);await nativeY(page,b);await frames(page,3);const paused=await read(page);rows.push({phase:'paused',held,paused});
  expect(paused.hero.resource.pose).toEqual(held.hero.resource.pose);expect(paused.hero.resource.frames).toBe(held.hero.resource.frames);expect(paused.idle.animations).toHaveLength(0);expect(paused.idle.name).toBe('none');
  await pause.click();await expect(pause).toHaveAttribute('aria-pressed','false');const resumed=await current(page);rows.push({phase:'resumed',...resumed});
  expect(resumed.hero.resource.pose.position).not.toEqual(held.hero.resource.pose.position);
  expect(resumed.hero.resource.pixelBudget).toBe(isMobile?393216:786432);
  expect(resumed.hero.resource.vertices).toBe(172789);expect(resumed.hero.resource.triangles).toBe(227521);
  await expect(page.locator('[data-project-grid] canvas,[data-project-model-preview]')).toHaveCount(0);
  await expect(page.locator('[data-project-card]')).toHaveCount(8);
  for(const suffix of ['/assets/source-layers.glb','/assets/studio-small.hdr'])expect(requests.filter(url=>url.endsWith(suffix))).toHaveLength(1);
  await page.locator('[data-home-research-link]').scrollIntoViewIfNeeded();await capture('home-project-entry');
  const path=info.outputPath('home-research-native.png');await page.screenshot({path});await info.attach('native-research',{path,contentType:'image/png'});
 }catch(error){primary=error;throw error;}finally{await cleanupPreserving(()=>receipt(info,'home-research-native',{range,requests,rows}),primary);}
});

test('Home native project entry disposes its own source and destination readiness remains independent through history',async({page,isMobile},info)=>{
 test.setTimeout(scenarioTimeout(120000));
 let primary;const rows=[];try{await page.goto('/');await entered(page);
 await page.evaluate(()=>addEventListener('pagehide',event=>{sessionStorage.setItem('test-home-research-departure',JSON.stringify({persisted:event.persisted,hero:window.__homeResearch.inspect()}));},{once:true}));
 const before=await read(page);rows.push({phase:'home',...before});
 const entry=page.locator('[data-home-research-link]');
 if(isMobile)await entry.tap();
 else{
  await page.locator('[data-home-research-entry] h2').click();await page.keyboard.press('Tab');await expect(entry).toBeFocused();
  const focus=await entry.evaluate(node=>{const r=node.getBoundingClientRect(),s=getComputedStyle(node);return{visible:node.matches(':focus-visible'),outline:parseFloat(s.outlineWidth),top:r.top,bottom:r.bottom,height:innerHeight,name:node.textContent.trim()};});
  expect(focus.visible).toBe(true);expect(focus.outline).toBeGreaterThan(0);expect(focus.top).toBeGreaterThanOrEqual(0);expect(focus.bottom).toBeLessThanOrEqual(focus.height);expect(focus.name).toContain('Explore Bending-Active');rows.push({phase:'native-keyboard-entry',focus});
  await page.keyboard.press('Enter');
 }
 await expect(page).toHaveURL(/\/projects\/bending-active\/$/);
 await expect.poll(()=>page.evaluate(()=>window.__story?.inspect().entry.phase),{timeout:WAIT}).toBe('entered');
 const destination=await page.evaluate(()=>({departure:JSON.parse(sessionStorage.getItem('test-home-research-departure')),site:window.__site.inspect(),scene:window.__thesis.inspect(),heroCanvases:document.querySelectorAll('[data-home-research-canvas]').length}));rows.push({phase:'destination',...destination});
 expect(destination.scene.ready).toBe(true);expect(destination.heroCanvases).toBe(0);
 if(destination.departure.persisted)expect(destination.departure.hero.active).toBe(false);
 else{expect(destination.departure.hero.disposed).toBe(true);expect(destination.departure.hero.resource).toBeNull();}
 await page.goBack();await entered(page);await expect(page).toHaveURL(/\/$/);
 const back=await read(page);rows.push({phase:'back',...back});
 await expect(page.locator('[data-home-research-canvas]')).toHaveCount(1);
 expect(back.hero.resource.sourceRevision).toBe(before.hero.resource.sourceRevision);
 expect(await page.locator('[data-portfolio-root]').evaluate(node=>node.inert)).toBe(false);
 await page.goForward();await expect.poll(()=>page.evaluate(()=>window.__story?.inspect().entry.phase),{timeout:WAIT}).toBe('entered');
 await expect(page.locator('[data-home-research-canvas]')).toHaveCount(0);
 rows.push({phase:'forward',url:page.url(),site:await page.evaluate(()=>window.__site.inspect())});
 }catch(error){primary=error;throw error;}finally{await cleanupPreserving(()=>receipt(info,'home-native-project-history',rows),primary);}
});

for(const policy of ['reduced','save-data','forced-colors','no-js'])test(`Home ${policy} keeps original poster and eight native destinations without model acquisition`,async({browser,baseURL,viewport,isMobile,deviceScaleFactor},info)=>{
 let primary;const context=await browser.newContext({baseURL,viewport,isMobile,hasTouch:isMobile,deviceScaleFactor,javaScriptEnabled:policy!=='no-js',...(policy==='reduced'?{reducedMotion:'reduce'}:{}),...(policy==='forced-colors'?{forcedColors:'active'}:{})});
 try{
  if(policy==='save-data')await context.addInitScript(()=>Object.defineProperty(navigator,'connection',{configurable:true,value:{saveData:true,addEventListener(){},removeEventListener(){}}}));
  const page=await context.newPage(),requests=[];page.on('request',r=>{if(/\.(glb|hdr)(?:\?|$)/.test(r.url()))requests.push(r.url());});
  await page.goto('/');if(policy!=='no-js')await entered(page);
  const poster=page.locator('[data-home-research-poster]');await expect(poster).toHaveAttribute('src','/assets/cinematic/model-poster.webp');
  await expect.poll(()=>poster.evaluate(node=>node.complete&&node.naturalWidth>0),{timeout:WAIT}).toBe(true);
  await expect(page.locator('[data-home-research-canvas],[data-project-model-preview]')).toHaveCount(0);
  await expect(page.locator('[data-project-card]')).toHaveCount(8);
  await expect(page.locator('[data-home-research-link]')).toHaveAttribute('href','/projects/bending-active/');
  if(policy!=='no-js'){const state=await read(page);expect(state.hero.acquisitions).toBe(0);expect(state.hero.arrivalStatic).toBe(true);}
  expect(requests).toEqual([]);const sizes=[];
  for(const width of policy==='reduced'&&isMobile?[390,320]:[viewport.width]){await page.setViewportSize({width,height:viewport.height});const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);expect(overflow).toBe(false);sizes.push({width,overflow});const path=info.outputPath(`home-${policy}-${width}.png`);await page.screenshot({path});await info.attach(`home-${policy}-${width}`,{path,contentType:'image/png'});}
  await receipt(info,'home-static-policy',{policy,requests,sizes});
 }catch(error){primary=error;throw error;}finally{await cleanupPreserving(()=>context.close(),primary);}
});


test('Home failed acquisition latches its genuine poster without late source upgrade',async({page},info)=>{
 let primary;await page.route('**/assets/source-layers.glb',route=>route.abort('failed'));
 try{
  await page.goto('/');await entered(page);const failed=await read(page);
  expect(failed.hero.arrivalStatic).toBe(true);expect(failed.hero.phase).toBe('failed');expect(failed.hero.resource).toBeNull();
  await expect(page.locator('[data-home-research-canvas]')).toHaveCount(0);
  await page.unrouteAll({behavior:'wait'});await page.mouse.wheel(0,150);await frames(page,8);const after=await read(page);
  expect(after.hero.acquisitions).toBe(failed.hero.acquisitions);expect(after.hero.resource).toBeNull();expect(after.hero.arrivalStatic).toBe(true);
  await expect(page.locator('[data-home-research-poster]')).toBeVisible();await expect(page.locator('[data-home-research-link]')).toHaveAttribute('href','/projects/bending-active/');
  await receipt(info,'home-failed-poster',{failed,after});
 }catch(error){primary=error;throw error;}finally{await cleanupPreserving(()=>page.unrouteAll({behavior:'wait'}),primary);}
});
