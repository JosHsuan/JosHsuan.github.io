import {test,expect} from '@playwright/test';
import {readFile,writeFile} from 'node:fs/promises';
import {WAIT,frames} from './case-helpers.mjs';

const release='../../roles/uiux-designer/cases/bending-active-thesis/release/';
const projects=JSON.parse(await readFile(new URL(release+'project-studies.json',import.meta.url),'utf8')).projects;
const xr=JSON.parse(await readFile(new URL(release+'xr-study.json',import.meta.url),'utf8'));
const story=JSON.parse(await readFile(new URL(release+'story.json',import.meta.url),'utf8')).cinematic;
const contact=JSON.parse(await readFile(new URL(release+'contact.json',import.meta.url),'utf8'));
const routes=['/','/about/','/projects/','/contact/',...projects.map(project=>`/projects/${project.slug}/`),'/projects/xr-bending-active/','/projects/bending-active/'];
async function persist(info,name,receipt){const path=info.outputPath(name+'.json');await writeFile(path,JSON.stringify(receipt,null,2));await info.attach(name,{path,contentType:'application/json'});}
async function open(page,path,noJS=false){
 expect((await page.goto(path)).status()).toBe(200);await page.evaluate(()=>document.fonts.ready);
 if(!noJS)await expect.poll(()=>page.evaluate(()=>window.__site?.inspect().phase),{timeout:WAIT}).toMatch(/^(entered|failed)$/);
}
async function declarations(page){
 return page.locator('a[target="_blank"]').evaluateAll(nodes=>nodes.map(node=>{
  const walker=document.createTreeWalker(node,NodeFilter.SHOW_TEXT),parts=[];
  while(walker.nextNode()){const text=walker.currentNode;if(!text.parentElement.closest('[aria-hidden="true"]'))parts.push(text.textContent);}
  const ids=(node.getAttribute('aria-describedby')??'').split(/\s+/).filter(Boolean),descriptors=ids.map(id=>{const matches=[...document.querySelectorAll('[id]')].filter(element=>element.id===id),element=matches[0];return{id,count:matches.length,text:element?.textContent??null,hidden:element?.hidden??false,display:element?getComputedStyle(element).display:null,rects:element?.getClientRects().length??null};});
  return{href:node.getAttribute('href'),rel:node.rel,label:node.getAttribute('aria-label'),description:descriptors.map(item=>item.text).join(' ')||null,descriptors,
   visibleText:parts.join(' ').replace(/[↗↘]/g,'').replace(/\s+/g,' ').trim(),alt:node.querySelector('img')?.alt??null,
   inspect:node.hasAttribute('data-inspect-figure'),caption:node.hasAttribute('data-evidence-source-link'),
   visible:node.checkVisibility({visibilityProperty:true,opacityProperty:true})};
 }));
}
async function audit(page,noJS,receipt){
 await page.emulateMedia({reducedMotion:'reduce'});
 for(const path of routes){
  await open(page,path,noJS);const rows=await declarations(page);receipt.push({path,noJS,rows});
  if(!['/about/','/projects/'].includes(path))expect(rows.length).toBeGreaterThan(0);
  for(const [index,row] of rows.entries()){
   const link=page.locator('a[target="_blank"]').nth(index);expect(row.rel.split(/\s+/)).toContain('noreferrer');expect(row.label).toBeTruthy();
   if(row.visibleText)expect(row.label).toContain(row.visibleText);
   if(row.alt&&!row.inspect)expect(row.label).toContain(row.alt);
   if(row.inspect){
    expect(row.label).toContain('Inspect evidence');expect(row.descriptors).toHaveLength(1);expect(row.descriptors[0]).toMatchObject({count:1,hidden:true,display:'none',rects:0});expect(row.description).toBe('Opens an inline source comparison when available; otherwise opens the original in a new tab.');expect(row.description).not.toMatch(/dialog/i);
   }else expect(row.label+' '+(row.description??'')).toMatch(/new tab/i);
   if(row.visible){await expect(link).toHaveAccessibleName(row.label);if(row.description)await expect(link).toHaveAccessibleDescription(row.description);}
  }
  if(path==='/'||path==='/contact/')for(const profile of contact.socialLinks){
   const row=rows.find(row=>row.href===profile.href);expect(row,profile.label+' native public profile declaration').toBeTruthy();expect(row.label).toContain(profile.label);
  }
  // Naming must survive the actual browser forced palette. This is not a new
  // contrast or external-destination-availability claim.
  await page.emulateMedia({forcedColors:'active'});expect(await page.evaluate(()=>matchMedia('(forced-colors: active)').matches)).toBe(true);
  const forced=await declarations(page);expect(forced.map(({label,description,href})=>({label,description,href}))).toEqual(rows.map(({label,description,href})=>({label,description,href})));
  const representative=forced.findIndex(row=>row.visible);if(representative>=0){await expect(page.locator('a[target="_blank"]').nth(representative)).toHaveAccessibleName(forced[representative].label);if(forced[representative].description)await expect(page.locator('a[target="_blank"]').nth(representative)).toHaveAccessibleDescription(forced[representative].description);}
  await page.emulateMedia({forcedColors:'none'});
 }
 const inventory=receipt.flatMap(route=>route.rows);expect(inventory).toHaveLength(129);expect(inventory.filter(row=>row.inspect)).toHaveLength(4);expect(inventory.filter(row=>row.caption)).toHaveLength(31);
}
async function tabTo(page,target,receipt=[]){
 const bound=await page.locator('a[href],button,input,select,textarea,[tabindex],summary').count();let reached=false;
 for(let index=0;index<bound+2;index++){await page.keyboard.press('Tab');const observed=await target.evaluate(node=>{const active=document.activeElement;return{reached:active===node,y:scrollY,tag:active?.tagName,id:active?.id,href:active?.getAttribute('href'),label:active?.getAttribute('aria-label'),text:active?.textContent?.trim().slice(0,160)};});receipt.push(observed);if(observed.reached){reached=true;break;}}
 expect(reached,'Native Tab traversal reaches the announced action').toBe(true);await expect(target).toBeFocused();
}
async function facts(page,target){return{url:page.url(),...await target.evaluate(node=>({y:scrollY,focused:document.activeElement===node,href:node.getAttribute('href'),sourceChapter:node.closest('[data-project-chapter],[data-xr-chapter],[data-story-chapter]')?.id??null,semanticChapter:document.querySelector('[data-project-active-chapter]')?.getAttribute('data-project-active-chapter')??document.querySelector('[data-xr-active-chapter]')?.getAttribute('data-xr-active-chapter')??null}))};}
async function popup(page,target,activate,dimensions){
 if(await page.locator('[data-project-active-chapter],[data-xr-active-chapter]').count())await page.waitForFunction(()=>{
  const xr=document.querySelector('[data-xr-study]'),nodes=[...document.querySelectorAll(xr?'[data-xr-chapter]':'[data-project-chapter]')],line=scrollY+innerHeight*(xr ? .42 : .5);
  const top=node=>{if(!xr)return node.getBoundingClientRect().top+scrollY;let y=0;for(let el=node;el;el=el.offsetParent)y+=el.offsetTop;return y;};
  let current=nodes[0];for(const node of nodes)if(top(node)<=line)current=node;
  return current?.getAttribute(xr?'data-xr-chapter':'data-project-chapter')===document.querySelector(xr?'[data-xr-active-chapter]':'[data-project-active-chapter]')?.getAttribute(xr?'data-xr-active-chapter':'data-project-active-chapter');
 },null,{timeout:WAIT});
 const before=await facts(page,target);let child,primaryError,result;
 try{
  [child]=await Promise.all([page.waitForEvent('popup'),activate()]);await child.waitForLoadState('domcontentloaded');expect(new URL(child.url()).pathname).toBe(before.href);
  const image=child.locator('img');await expect(image).toHaveCount(1);await expect.poll(()=>image.evaluate(node=>node.complete&&node.naturalWidth>0)).toBe(true);
  result=await image.evaluate(node=>({src:node.currentSrc,width:node.naturalWidth,height:node.naturalHeight}));if(dimensions)expect([result.width,result.height]).toEqual(dimensions);
 }catch(error){primaryError=error;throw error;}
 finally{try{if(child)await child.close();await page.bringToFront();}catch(error){if(!primaryError)throw error;}}
 expect(await facts(page,target)).toEqual(before);return{before,source:result};
}
async function nativeImage(page,route,src,dimensions,isMobile,receipt){
 await open(page,route);const target=page.locator(`a[target="_blank"][href="${src}"]`).filter({has:page.locator('img')}).first();await tabTo(page,target);
 receipt.keyboard=await popup(page,target,()=>page.keyboard.press('Enter'),dimensions);
 if(isMobile){
  // Native focus scroll has positioned the actual image anchor. Use a genuine
  // uncovered point, never a fabricated DOM click or hidden chrome.
  const point=await target.evaluate(node=>{
   const r=node.getBoundingClientRect();for(const fraction of [.5,.35,.65,.2,.8]){
    const x=Math.max(1,Math.min(innerWidth-1,r.left+r.width*.5)),y=r.top+r.height*fraction;
    if(y<0||y>=innerHeight)continue;const hit=document.elementFromPoint(x,y);if(hit&&(hit===node||node.contains(hit)))return{x,y};
   }throw Error('No uncovered native image action point');
  });
  receipt.touch=await popup(page,target,()=>page.touchscreen.tap(point.x,point.y),dimensions);
 }
}

test('all twelve routes announce existing native destinations without changing visible labels in reduced and forced palettes',async({page},info)=>{
 const receipt=[];let primaryError;try{await audit(page,false,receipt);}catch(error){primaryError=error;throw error;}finally{try{await persist(info,'native-link-announcements',receipt);}catch(error){if(!primaryError)throw error;}}
});
test('original generic and XR image actions open and return natively',async({page,isMobile},info)=>{
 const receipt={native:[]};let primaryError;
 try{
  const dot=projects.find(project=>project.id==='dot-based-3d-printing'),source=dot.sections.find(section=>section.id==='system').media.find(image=>image.src.endsWith('/path-strategies.webp'));
  for(const item of [{route:`/projects/${dot.slug}/`,image:source},{route:'/projects/xr-bending-active/',image:xr.media.adaptiveMethod}]){
   const row={route:item.route};receipt.native.push(row);await nativeImage(page,item.route,item.image.src,[item.image.width,item.image.height],isMobile,row);
  }
 }catch(error){primaryError=error;throw error;}finally{try{await persist(info,'native-link-behaviour',receipt);}catch(error){if(!primaryError)throw error;}}
});
test('Full Bending native Pause reading reaches an inline comparison and its original action',async({page,context,isMobile},info)=>{
 const receipt={navigation:[],triggerTabs:[],originalTabs:[],phase:'entry'};let primaryError;
 try{
  receipt.policy='Full source, native Pause-controlled reading; not Reduced. Prior unpaused Chromium service latency remains unresolved.';
  expect((await page.goto('/projects/bending-active/')).status()).toBe(200);await page.evaluate(()=>document.fonts.ready);
  const state=()=>page.evaluate(()=>{const scene=window.__thesis?.inspect(),story=window.__story?.inspect();return{hash:location.hash,y:scrollY,activeId:document.activeElement?.id,phase:window.__site?.inspect().phase,ready:scene?.ready,detail:scene?.detail,systemReduced:scene?.systemReduced,mediaReduced:matchMedia('(prefers-reduced-motion: reduce)').matches,paused:scene?.motionPaused,seconds:story?.playback.activeSeconds,source:scene?.source,renderProfile:scene?.renderProfile,renderPressure:scene?.renderPressure,renderPressureDecisions:scene?.renderPressureDecisions,renderBudget:scene?.renderBudget,rendererBudget:scene?.rendererBudget,representation:scene?.representation,pose:scene?.pose,bounds:scene?.bounds,stageLayout:scene?.stageLayout,sourceVisible:scene?.sourceVisible,compositor:scene?.compositor?{requestedSamples:scene.compositor.requestedSamples,width:scene.compositor.width,height:scene.compositor.height}:null};});
  await expect.poll(async()=>{receipt.entry=await state();return receipt.entry;},{timeout:WAIT}).toMatchObject({phase:'entered',ready:true,detail:'full',systemReduced:false,mediaReduced:false,paused:false});
  const pressureFacts=snapshot=>{
   const expected=isMobile?{id:'conservative-touch',pixelBudget:520000,maxSamples:0,shadowMapSize:512}:{id:'standard',pixelBudget:1600000,maxSamples:2,shadowMapSize:1024};
   expect(snapshot.renderProfile).toEqual(expected);expect(snapshot.renderBudget.pixelBudget).toBe(expected.pixelBudget);expect(snapshot.compositor.requestedSamples).toBe(expected.maxSamples);
   const {stage,scale,decisions}=snapshot.renderPressure,history=snapshot.renderPressureDecisions;
   expect(Number.isInteger(stage)&&stage>=0&&stage<=3).toBe(true);expect(scale).toBe([1,.8,.65,.5][stage]);expect(history).toHaveLength(decisions);expect(history).toHaveLength(stage);
   for(const [index,row] of history.entries()){
    expect(row.stage).toBe(index+1);expect(row.scale).toBe([1,.8,.65,.5][row.stage]);expect(Number.isFinite(row.timestampMs)).toBe(true);
    if(index)expect(row.timestampMs).toBeGreaterThan(history[index-1].timestampMs);
    expect(['sustained-slow-delivery',...(isMobile?[]:['sustained-severe-delivery'])]).toContain(row.reason);
   }
  };
  pressureFacts(receipt.entry);receipt.phase='native-pause';
  const motion=page.locator('[data-bending-motion-toggle]');await motion.click();await expect(motion).toHaveAttribute('aria-pressed','true');
  receipt.paused=await state();expect(receipt.paused.paused).toBe(true);expect(receipt.paused.seconds).toBeGreaterThan(receipt.entry.seconds);expect(receipt.paused.source).toEqual(receipt.entry.source);expect(receipt.paused.systemReduced).toBe(false);
  await frames(page,5);receipt.frozen=await state();expect(receipt.frozen.seconds).toBe(receipt.paused.seconds);expect(receipt.frozen.source).toEqual(receipt.paused.source);expect(receipt.frozen.y).toBe(receipt.paused.y);expect(receipt.frozen.paused).toBe(true);
  pressureFacts(receipt.paused);pressureFacts(receipt.frozen);expect(receipt.frozen.renderPressureDecisions).toEqual(receipt.paused.renderPressureDecisions);
  receipt.phase='paused-overview-capture';
  receipt.overviewCapture={scope:'Native paused Overview; unpaired page-field phase. Not deterministic System material equivalence or performance evidence.',stage:receipt.frozen.renderPressure.stage,stage2Observed:receipt.frozen.renderPressure.stage===2};
  const overviewPng=info.outputPath('bending-paused-overview-device.png');await page.screenshot({path:overviewPng,scale:'device'});await info.attach('bending-paused-overview-device',{path:overviewPng,contentType:'image/png'});
  receipt.phase='native-chapter-and-source';
  const chapter=page.locator('[data-story-navigation] a[href="#make"]');await tabTo(page,chapter,receipt.navigation);await page.keyboard.press('Enter');
  await expect.poll(()=>page.evaluate(()=>({hash:location.hash,focused:document.activeElement===document.getElementById('make')}))).toEqual({hash:'#make',focused:true});
  receipt.chapter=await page.evaluate(()=>({hash:location.hash,y:scrollY,activeId:document.activeElement?.id}));
  const trigger=page.locator('#make [data-inspect-figure]');await tabTo(page,trigger,receipt.triggerTabs);
  const comparisonBefore=await facts(page,trigger),count=context.pages().length;await page.keyboard.press('Enter');const comparison=page.locator('[data-source-comparison]');await expect(comparison).toBeVisible();await expect(comparison).not.toHaveAttribute('role','dialog');expect(context.pages()).toHaveLength(count);
  const original=comparison.locator('a[target="_blank"]');await expect(original).toHaveAccessibleName(/Open original source.*new tab/i);await expect(original).toHaveAttribute('href',await trigger.getAttribute('href'));
  const sourceImage=comparison.locator('img');await expect(sourceImage).toHaveAttribute('src',comparisonBefore.href);await expect.poll(()=>sourceImage.evaluate(node=>node.complete&&node.naturalWidth>0)).toBe(true);
  const dimensions=await sourceImage.evaluate(node=>[node.naturalWidth,node.naturalHeight]);
  await tabTo(page,original,receipt.originalTabs);
  receipt.action=await original.evaluate(node=>{
   const box=r=>({left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height}),r=node.getBoundingClientRect(),hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);
   const chrome=['[data-page-masthead]','[data-story-navigation]','[data-reading-tools]'].map(selector=>{const nodes=[...document.querySelectorAll(selector)],el=nodes[0];return{selector,count:nodes.length,visible:el?.checkVisibility({visibilityProperty:true,opacityProperty:true})??false,rect:el?box(el.getBoundingClientRect()):null};});
   return{rect:box(r),viewport:{width:innerWidth,height:innerHeight},hit:hit===node||node.contains(hit),chrome,comparison:box(node.closest('[data-source-comparison]').getBoundingClientRect()),source:box(node.closest('[data-source-comparison]').querySelector('img').getBoundingClientRect())};
  });
  const {rect,viewport,chrome}=receipt.action;expect(chrome.length).toBeGreaterThan(0);expect(rect.left).toBeGreaterThanOrEqual(0);expect(rect.top).toBeGreaterThanOrEqual(0);expect(rect.right).toBeLessThanOrEqual(viewport.width);expect(rect.bottom).toBeLessThanOrEqual(viewport.height);expect(receipt.action.hit).toBe(true);
  for(const item of chrome){expect(item.count,item.selector+' authoritative chrome owner').toBe(1);if(item.visible){const c=item.rect;expect(Math.max(0,Math.min(rect.right,c.right)-Math.max(rect.left,c.left))*Math.max(0,Math.min(rect.bottom,c.bottom)-Math.max(rect.top,c.top))).toBe(0);}}
  const actionPng=info.outputPath('bending-original-action-visible.png');await page.screenshot({path:actionPng});await info.attach('bending-original-action-visible',{path:actionPng,contentType:'image/png'});
  receipt.original=await popup(page,original,()=>page.keyboard.press('Enter'),dimensions);
  const png=info.outputPath('bending-inline-source-comparison.png');await comparison.screenshot({path:png});await info.attach('bending-inline-source-comparison',{path:png,contentType:'image/png'});
  const dynamicOriginalName=await original.getAttribute('aria-label');
  const close=comparison.getByRole('button',{name:'Close source comparison'});await page.keyboard.press('Shift+Tab');await expect(close).toBeFocused();
  receipt.close=await close.evaluate(node=>{const r=node.getBoundingClientRect(),hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return{top:r.top,bottom:r.bottom,left:r.left,right:r.right,width:innerWidth,height:innerHeight,hit:hit===node||node.contains(hit)};});
  expect(receipt.close.top).toBeGreaterThanOrEqual(0);expect(receipt.close.bottom).toBeLessThanOrEqual(receipt.close.height);expect(receipt.close.left).toBeGreaterThanOrEqual(0);expect(receipt.close.right).toBeLessThanOrEqual(receipt.close.width);expect(receipt.close.hit).toBe(true);
  await page.keyboard.press('Enter');await expect(comparison).toHaveCount(0);await expect(trigger).toBeFocused();
  receipt.bending={mode:'inline comparison, not a dialog',before:comparisonBefore,returned:await facts(page,trigger),dynamicOriginalName};
  receipt.phase='native-resume';receipt.beforeResume=await state();expect(receipt.beforeResume.seconds).toBe(receipt.paused.seconds);expect(receipt.beforeResume.paused).toBe(true);expect(receipt.beforeResume.source).toEqual(receipt.paused.source);
  await motion.click();await expect(motion).toHaveAttribute('aria-pressed','false');
  await expect.poll(async()=>{receipt.resumed=await state();return receipt.resumed.seconds;},{timeout:WAIT}).toBeGreaterThan(receipt.paused.seconds);
  expect(receipt.resumed).toMatchObject({y:receipt.beforeResume.y,paused:false,systemReduced:false,detail:'full'});expect(receipt.resumed.source).toEqual(receipt.paused.source);pressureFacts(receipt.resumed);receipt.phase='completed';
 }catch(error){primaryError=error;throw error;}finally{try{await persist(info,'bending-link-behaviour',receipt);}catch(error){if(!primaryError)throw error;}}
});
test.describe('native link announcements without application JavaScript',()=>{
 test.use({javaScriptEnabled:false});
 test('all twelve routes retain declarations and Bending Inspect opens its original image without JavaScript',async({page},info)=>{
  const receipt={routes:[]};let primaryError;
  try{
   await audit(page,true,receipt.routes);const trigger=page.locator('#make [data-inspect-figure]');await tabTo(page,trigger);
   await expect(trigger).toHaveAttribute('href',story.media.connection.source);receipt.bending=await popup(page,trigger,()=>page.keyboard.press('Enter'));
   await expect(page.locator('[data-source-comparison]')).toHaveCount(0);
  }catch(error){primaryError=error;throw error;}finally{try{await persist(info,'native-link-no-js',receipt);}catch(error){if(!primaryError)throw error;}}
 });
});
