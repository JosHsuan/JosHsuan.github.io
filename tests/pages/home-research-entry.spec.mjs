import {test,expect} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
import {WAIT,frames,scenarioTimeout} from './case-helpers.mjs';
// Only the cross-document journey records native video; other cases remain still-only.
const historyTest=test.extend({video:'on'});
const read=page=>page.evaluate(()=>({y:scrollY,idle:(()=>{const host=document.querySelector('[data-home-research-host]');if(!host)return null;const css=getComputedStyle(host);return{transform:css.transform,name:css.animationName,playState:css.animationPlayState,animations:host.getAnimations().slice(0,2).map(a=>({currentTime:a.currentTime,playState:a.playState}))};})(),nativeProgress:(()=>{const root=document.querySelector('[data-home-research-story]');if(!root)return null;let top=0;for(let n=root;n;n=n.offsetParent)top+=n.offsetTop;return Math.max(0,Math.min(1,(scrollY-top)/Math.max(1,root.offsetHeight-innerHeight)));})(),site:window.__site?.inspect(),hero:window.__homeResearch?.inspect(),presenter:window.__globalBackground?.inspect().driver.homeResearch}));
async function entered(page){await expect.poll(async()=>(await read(page)).site?.phase,{timeout:WAIT}).toBe('entered');await expect(page.locator('[data-site-loader]')).toBeHidden();}
async function exposed(page){
 await expect.poll(async()=>{const s=await read(page);return !!(s.hero?.exposure?.completed&&s.hero.exposure.generation===s.hero.id&&s.hero.resource?.visibleCommit?.completed&&s.presenter.exposedGeneration===s.hero.id&&s.presenter.exposureCommits===1);},{timeout:WAIT}).toBe(true);
 const s=await read(page),surface=s.hero.resource.visibleCommit.surface;
 expect(s.hero.exposure.entryState).toBe('entered');expect(s.hero.exposure.loaderHidden).toBe(true);expect(s.hero.exposure.loaderDisplay).toBe('none');expect(surface.connected).toBe(true);expect(surface.visible).toBe(true);expect(surface.intersectsViewport).toBe(true);expect(surface.cover).toEqual({count:1,hidden:true,display:'none'});
 return s;
}

async function nativeY(page,target){await page.mouse.wheel(0,target-await page.evaluate(()=>scrollY));await expect.poll(()=>page.evaluate(()=>scrollY),{timeout:WAIT}).toBe(target);}
async function current(page){await expect.poll(async()=>{const s=await read(page);return !!(s.presenter?.enabled&&s.hero?.resource&&Math.abs(s.presenter.progress-s.nativeProgress)<1e-9&&Math.abs(s.hero.resource.progress-s.presenter.progress)<1e-9);},{timeout:WAIT}).toBe(true);return read(page);}
async function cleanupPreserving(action,primary){try{await action();}catch(error){if(!primary)throw error;}}
async function receipt(info,name,value){const path=info.outputPath(name+'.json');await writeFile(path,JSON.stringify(value,null,2));await info.attach(name,{path,contentType:'application/json'});}

test('Home native research camera reverses while independent idle adds no 3D work and Pause retains native reading',async({page,isMobile},info)=>{
 let primary;const rows=[],requests=[];page.on('request',r=>{if(/\.(glb|hdr)(?:\?|$)/.test(r.url()))requests.push(r.url());});await page.goto('/');await entered(page);await exposed(page);await expect(page.locator('[data-home-research-poster]')).toHaveCSS('opacity','0');
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
  expect(resumed.hero.resource.vertices).toBe(172789);expect(resumed.hero.resource.triangles).toBe(227521);expect(resumed.hero.resource.presentationSet).toEqual({transparent:true,visibleEditorialMeshes:0,editorialAreaLights:2,contactFloorShadow:false,sourceMeshes:3});
  await expect(page.locator('[data-project-grid] canvas,[data-project-model-preview]')).toHaveCount(0);
  await expect(page.locator('[data-project-card]')).toHaveCount(8);
  for(const suffix of ['/assets/source-layers.glb','/assets/studio-small.hdr'])expect(requests.filter(url=>url.endsWith(suffix))).toHaveLength(1);
  await page.locator('[data-home-research-link]').scrollIntoViewIfNeeded();await capture('home-project-entry');
  const path=info.outputPath('home-research-native.png');await page.screenshot({path});await info.attach('native-research',{path,contentType:'image/png'});
 }catch(error){primary=error;throw error;}finally{await cleanupPreserving(()=>receipt(info,'home-research-native',{range,requests,rows}),primary);}
});

// Install before native activation. While a document request is pending, normal
// Playwright frame/locator operations can wait for that same request to commit.
// Event-time facts are pushed to the host instead; no timer, RAF or state write.
function observeOutgoingEntry(){
 const loader=document.querySelector('[data-site-loader]');let sent=0,clicks=0,last='';
 const sample=(reason,event=null)=>{
  if(sent>=16)return;const site=window.__site?.inspect();if(site?.kind!=='navigation')return;
  const image=loader.querySelector('[data-site-research-handoff]'),hero=window.__homeResearch?.inspect();
  let paint=null;
  if(image){const r=image.getBoundingClientRect();let opacity=1,visible=true;for(let n=image;n;n=n.parentElement){const c=getComputedStyle(n);opacity*=Number(c.opacity);visible&&=c.display!=='none'&&c.visibility!=='hidden';}paint={src:image.getAttribute('src'),currentSrc:image.currentSrc,complete:image.complete,naturalWidth:image.naturalWidth,naturalHeight:image.naturalHeight,opacity,visible,left:r.left,top:r.top,right:r.right,bottom:r.bottom};}
  const fact={reason,clicks,time:performance.now(),url:location.href,site:{id:site.id,phase:site.phase,kind:site.kind,url:site.url,presentation:site.presentation},ticket:JSON.parse(sessionStorage.getItem('portfolio-navigation-handoff-v1')),inert:document.querySelector('[data-portfolio-root]').inert,hero:{acquisitions:hero.acquisitions,disposals:hero.disposals,canvasCount:document.querySelectorAll('[data-home-research-canvas]').length},viewport:{width:innerWidth,height:innerHeight},paint,event:event?{trusted:event.isTrusted,x:event.clientX,y:event.clientY,tag:event.target?.tagName,href:event.target?.closest?.('a')?.getAttribute('href')??null}:null};
  const key=JSON.stringify([fact.site,paint?.complete,paint?.naturalWidth,paint?.opacity,fact.inert]);if(reason!=='click'&&key===last)return;last=key;sent++;
  window.__testHomeOutgoing(fact).catch(()=>{});
 };
 const observer=new MutationObserver(()=>sample('mutation'));
 observer.observe(document.documentElement,{attributes:true,attributeFilter:['data-site-entry-state','data-site-project-entry']});
 observer.observe(loader,{attributes:true,attributeFilter:['hidden','data-site-phase','data-site-project-entry'],childList:true,subtree:true});
 const click=event=>{clicks++;queueMicrotask(()=>sample('click',event));},load=event=>{if(event.target?.matches?.('[data-site-research-handoff]'))sample('image-load');};
 window.addEventListener('click',click);document.addEventListener('load',load,true);
 addEventListener('pagehide',()=>{observer.disconnect();window.removeEventListener('click',click);document.removeEventListener('load',load,true);},{once:true});
}
function expectOutgoingPaint(fact){
 expect(fact.inert).toBe(true);expect(fact.paint).not.toBeNull();expect(fact.paint.src).toBe('/assets/cinematic/model-poster.webp');expect(fact.paint.complete).toBe(true);expect(fact.paint.naturalWidth).toBeGreaterThan(0);expect(fact.paint.visible).toBe(true);expect(fact.paint.opacity).toBeGreaterThan(0);expect(fact.paint.right).toBeGreaterThan(0);expect(fact.paint.bottom).toBeGreaterThan(0);expect(fact.paint.left).toBeLessThan(fact.viewport.width);expect(fact.paint.top).toBeLessThan(fact.viewport.height);
}

async function captureEntry(page,info,rows,name,loaderSelector,imageSelector){
 const loader=page.locator(loaderSelector),image=page.locator(imageSelector);
 await expect(loader).toBeVisible();await expect(image).toBeVisible();
 await expect.poll(()=>image.evaluate(node=>node.complete&&node.naturalWidth>0),{timeout:WAIT}).toBe(true);
 const paint=await image.evaluate(node=>{const r=node.getBoundingClientRect(),ancestors=[];let opacity=1;for(let n=node;n;n=n.parentElement){const c=getComputedStyle(n);opacity*=Number(c.opacity);ancestors.push({tag:n.tagName,display:c.display,visibility:c.visibility});}return{src:node.getAttribute('src'),currentSrc:node.currentSrc,naturalWidth:node.naturalWidth,naturalHeight:node.naturalHeight,opacity,ancestors,left:r.left,top:r.top,right:r.right,bottom:r.bottom,viewport:{width:innerWidth,height:innerHeight}};});
 rows.push({phase:name+'-loader-paint',paint});expect(paint.src).toBe('/assets/cinematic/model-poster.webp');expect(paint.opacity).toBeGreaterThan(0);expect(paint.ancestors.every(a=>a.display!=='none'&&a.visibility!=='hidden')).toBe(true);expect(paint.right).toBeGreaterThan(0);expect(paint.bottom).toBeGreaterThan(0);expect(paint.left).toBeLessThan(paint.viewport.width);expect(paint.top).toBeLessThan(paint.viewport.height);
 const path=info.outputPath('home-entry-'+name+'.png');await page.screenshot({path});await info.attach('home-entry-'+name,{path,contentType:'image/png'});
}

historyTest('Home native project entry disposes its own source and destination readiness remains independent through history',async({page,context,isMobile},info)=>{
 test.setTimeout(scenarioTimeout(120000));
 let primary,activation,activationError,releaseDocument,releaseModel,documentHeld=false,modelHeld=false;
 const documentGate=new Promise(resolve=>{releaseDocument=resolve;}),modelGate=new Promise(resolve=>{releaseModel=resolve;});
 const rows=[],outgoingFacts=[],navigationRequests=[],videoTimeline=[];
 const hostStartedAt=performance.now(),video=page.video();
 const mark=phase=>{if(videoTimeline.length<24)videoTimeline.push({phase,hostElapsedMs:performance.now()-hostStartedAt,hostEpochMs:Date.now()});};
 mark('case-start-video-handle-obtained');
 try{expect(video).not.toBeNull();await page.goto('/');await entered(page);await exposed(page);
 await page.exposeBinding('__testHomeOutgoing',(_source,fact)=>{if(outgoingFacts.length<16)outgoingFacts.push({...fact,hostReceivedElapsedMs:performance.now()-hostStartedAt,hostReceivedEpochMs:Date.now()});});
 await page.evaluate(observeOutgoingEntry);
 page.on('request',request=>{if(request.isNavigationRequest()&&request.frame()===page.mainFrame()&&navigationRequests.length<8)navigationRequests.push(request.url());});
 let firstDocument=true,firstModel=true;
 await page.route('**/projects/bending-active/',async route=>{if(firstDocument&&route.request().isNavigationRequest()){firstDocument=false;documentHeld=true;await documentGate;}await route.continue();});
 await page.route('**/assets/source-layers.glb',async route=>{if(firstModel){firstModel=false;modelHeld=true;await modelGate;}await route.continue();});
 await page.evaluate(()=>addEventListener('pagehide',event=>{sessionStorage.setItem('test-home-research-departure',JSON.stringify({persisted:event.persisted,hero:window.__homeResearch.inspect()}));},{once:true}));
 const before=await read(page);rows.push({phase:'home',...before});
 mark('home-ready-before-native-activation');
 const entry=page.locator('[data-home-research-link]');let activationPoint;
 if(isMobile){await entry.scrollIntoViewIfNeeded();const r=await entry.boundingBox();activationPoint={x:r.x+r.width/2,y:r.y+r.height/2};activation=entry.tap();}
 else{
  await page.locator('[data-home-research-entry] h2').click();
  // A non-focusable heading click does not establish the same sequential
  // starting point in every engine. Traverse real controls, never set focus.
  const traversal=[];rows.push({phase:'native-entry-tab-order',traversal});
  for(let step=0;step<4;step++){
   await page.keyboard.press('Tab');
   const focus=await page.evaluate(()=>{const node=document.activeElement;return{tag:node?.tagName??null,id:node?.id??null,href:node?.getAttribute('href')??null,name:node?.textContent?.trim().slice(0,160)??'',pause:node?.hasAttribute('data-home-research-pause')??false,entry:node?.hasAttribute('data-home-research-link')??false,y:scrollY};});
   traversal.push(focus);if(focus.entry)break;
  }
  await expect(entry).toBeFocused();
  const focus=await entry.evaluate(node=>{const r=node.getBoundingClientRect(),s=getComputedStyle(node);return{visible:node.matches(':focus-visible'),outline:parseFloat(s.outlineWidth),top:r.top,bottom:r.bottom,height:innerHeight,name:node.textContent.trim()};});
  expect(focus.visible).toBe(true);expect(focus.outline).toBeGreaterThan(0);expect(focus.top).toBeGreaterThanOrEqual(0);expect(focus.bottom).toBeLessThanOrEqual(focus.height);expect(focus.name).toContain('Explore Bending-Active');rows.push({phase:'native-keyboard-entry',focus});
  const r=await entry.boundingBox();activationPoint={x:r.x+r.width/2,y:r.y+r.height/2};
  activation=page.keyboard.press('Enter');
 }
 mark('native-activation-issued');
 activation.catch(error=>{activationError=error;});
 await expect.poll(()=>{if(activationError)throw activationError;return documentHeld;},{timeout:WAIT}).toBe(true);
 mark('document-request-held');
 await expect.poll(()=>outgoingFacts.some(f=>f.site.presentation==='bending-active'&&f.paint?.complete&&f.paint.naturalWidth>0&&f.paint.visible&&f.paint.opacity>0),{timeout:WAIT}).toBe(true);
 const outgoing=outgoingFacts.findLast(f=>f.site.presentation==='bending-active'&&f.paint?.complete&&f.paint.naturalWidth>0&&f.paint.visible&&f.paint.opacity>0);rows.push({phase:'outgoing-held-original-document',...outgoing});
 expect(outgoing.site.presentation).toBe('bending-active');expect(outgoing.ticket.presentation).toBe('bending-active');expect(outgoing.ticket.url).toBe(new URL('/projects/bending-active/',outgoing.url).href);expect(outgoing.ticket.id).toBe(outgoing.site.id);expectOutgoingPaint(outgoing);
 mark('loaded-outgoing-paint-observed');
 const previousClicks=outgoing.clicks;
 if(isMobile)await page.touchscreen.tap(activationPoint.x,activationPoint.y);else await page.mouse.click(activationPoint.x,activationPoint.y);
 await expect.poll(()=>outgoingFacts.some(f=>f.reason==='click'&&f.clicks>previousClicks),{timeout:WAIT}).toBe(true);
 const repeated=outgoingFacts.findLast(f=>f.reason==='click'&&f.clicks>previousClicks);rows.push({phase:'native-repeat-during-outgoing-loading',activationPoint,...repeated});
 expect(repeated.event.trusted).toBe(true);expect(repeated.site.id).toBe(outgoing.site.id);expect(repeated.ticket.id).toBe(outgoing.ticket.id);expect(repeated.inert).toBe(true);expect(repeated.hero).toEqual(outgoing.hero);expect(navigationRequests).toEqual([outgoing.ticket.url]);
 // Native recordVideo starts with the context. Pinned 1.63 page.video() only
 // returns its artifact handle; saveAs delegates to that artifact after close.
 // No screenshot, frame query or capture command runs against the pending
 // document. Host receipts delimit a search interval, not exact video PTS:
 // recorder start, delivery latency and dropped/duplicated frames may differ.
 mark('repeat-observed-before-document-release');
 releaseDocument();mark('document-gate-released');
 await expect.poll(()=>modelHeld,{timeout:WAIT}).toBe(true);
 mark('destination-model-request-held');
 await expect.poll(()=>page.evaluate(()=>window.__story?.inspect().entry.phase),{timeout:WAIT}).toBe('preparing');
 const arrival=await page.evaluate(()=>({site:window.__site.inspect(),entry:window.__story.inspect().entry,sceneReady:window.__thesis?.inspect().ready===true,marker:document.documentElement.getAttribute('data-site-project-entry')}));rows.push({phase:'arrival-held-original-model',...arrival});
 expect(arrival.marker).toBe('bending-active');expect(arrival.site.phase).toBe('requested');expect(arrival.sceneReady).toBe(false);
 await captureEntry(page,info,rows,'arrival','[data-entry-loader]','[data-entry-loader] img');
 mark('committed-arrival-png-completed');
 releaseModel();await activation;
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
 const backPath=info.outputPath('home-native-back-restoration.png');await page.screenshot({path:backPath});await info.attach('home-native-back-restoration',{path:backPath,contentType:'image/png'});
 await page.goForward();await expect.poll(()=>page.evaluate(()=>window.__story?.inspect().entry.phase),{timeout:WAIT}).toBe('entered');
 await expect(page.locator('[data-home-research-canvas]')).toHaveCount(0);
 rows.push({phase:'forward',url:page.url(),site:await page.evaluate(()=>window.__site.inspect())});
 }catch(error){primary=error;throw error;}finally{
  releaseDocument();releaseModel();
  let cleanupError=primary;
  mark('cleanup-gates-released');
  for(const cleanup of [()=>receipt(info,'home-native-project-history',[...rows,{phase:'bounded-outgoing-observer',facts:outgoingFacts,navigationRequests},{phase:'native-video-search-window',file:'home-native-entry.webm',recording:{mode:'on',size:'Playwright default fits viewport within 800x800; verify encoded dimensions with ffprobe after collection',use:'continuity observation only; not original-resolution typography or fine-detail acceptance'},timeline:videoTimeline,note:'Host elapsed time starts after recorder creation, not at video PTS zero. Observer page time and host receipt time have distinct origins; use visual inspection to locate outgoing frames, not exact timestamp subtraction.'}]),()=>page.unrouteAll({behavior:'wait'}),()=>activation,()=>context.close(),async()=>{if(video){const path=info.outputPath('home-native-entry.webm');await video.saveAs(path);await info.attach('home-native-entry',{path,contentType:'video/webm'});}}]){
   try{await cleanup();}catch(error){cleanupError??=error;}
  }
  if(!primary&&cleanupError)throw cleanupError;
 }
});

for(const policy of ['reduced','save-data','forced-colors','no-js'])test(`Home ${policy} keeps original poster and eight native destinations without model acquisition`,async({browser,baseURL,viewport,isMobile,deviceScaleFactor},info)=>{
 let primary;const context=await browser.newContext({baseURL,viewport,isMobile,hasTouch:isMobile,deviceScaleFactor,javaScriptEnabled:policy!=='no-js',...(policy==='reduced'?{reducedMotion:'reduce'}:{}),...(policy==='forced-colors'?{forcedColors:'active'}:{})});
 try{
  if(policy==='save-data')await context.addInitScript(()=>Object.defineProperty(navigator,'connection',{configurable:true,value:{saveData:true,addEventListener(){},removeEventListener(){}}}));
  const page=await context.newPage(),requests=[];page.on('request',r=>{if(/\.(glb|hdr)(?:\?|$)/.test(r.url()))requests.push(r.url());});
  await page.goto('/');if(policy!=='no-js')await entered(page);
  const poster=page.locator('[data-home-research-poster]');await expect(poster).toHaveAttribute('src','/assets/cinematic/model-poster.webp');
  await expect.poll(()=>poster.evaluate(node=>node.complete&&node.naturalWidth>0),{timeout:WAIT}).toBe(true);await expect(poster).toHaveCSS('opacity','1');
  await expect(page.locator('[data-home-research-canvas],[data-project-model-preview]')).toHaveCount(0);
  await expect(page.locator('[data-project-card]')).toHaveCount(8);
  await expect(page.locator('[data-home-research-link]')).toHaveAttribute('href','/projects/bending-active/');
  if(policy!=='no-js'){const state=await read(page);expect(state.hero.acquisitions).toBe(0);expect(state.hero.arrivalStatic).toBe(true);expect(state.hero.exposure).toBeNull();}
  expect(requests).toEqual([]);const sizes=[];
  for(const width of policy==='reduced'&&isMobile?[390,320]:[viewport.width]){await page.setViewportSize({width,height:viewport.height});await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await expect.poll(()=>page.evaluate(()=>scrollY),{timeout:WAIT}).toBe(0);const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);expect(overflow).toBe(false);sizes.push({width,overflow});const path=info.outputPath(`home-${policy}-${width}.png`);await page.screenshot({path});await info.attach(`home-${policy}-${width}`,{path,contentType:'image/png'});
   await poster.evaluate(node=>node.scrollIntoView({block:'center',behavior:'instant'}));
   const bounds=await poster.evaluate(node=>{const r=node.getBoundingClientRect(),css=getComputedStyle(node);return{left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:innerWidth,height:innerHeight,opacity:css.opacity,fit:css.objectFit,naturalWidth:node.naturalWidth,naturalHeight:node.naturalHeight,y:scrollY};});
   expect(bounds.left).toBeGreaterThanOrEqual(0);expect(bounds.top).toBeGreaterThanOrEqual(0);expect(bounds.right).toBeLessThanOrEqual(bounds.width);expect(bounds.bottom).toBeLessThanOrEqual(bounds.height);expect(bounds.opacity).toBe('1');expect(bounds.fit).toBe('contain');sizes.at(-1).poster=bounds;
   const fallbackPath=info.outputPath(`home-${policy}-${width}-poster.png`);await page.screenshot({path:fallbackPath});await info.attach(`home-${policy}-${width}-poster`,{path:fallbackPath,contentType:'image/png'});
  }
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
  await expect(page.locator('[data-home-research-poster]')).toBeVisible();await expect(page.locator('[data-home-research-poster]')).toHaveCSS('opacity','1');await expect(page.locator('[data-home-research-link]')).toHaveAttribute('href','/projects/bending-active/');
  await receipt(info,'home-failed-poster',{failed,after});
 }catch(error){primary=error;throw error;}finally{await cleanupPreserving(()=>page.unrouteAll({behavior:'wait'}),primary);}
});
