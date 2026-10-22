import {test,expect} from '@playwright/test';
import {readFile,writeFile} from 'node:fs/promises';
import {WAIT,scenarioTimeout} from './case-helpers.mjs';

const studies=JSON.parse(await readFile(new URL('../../roles/uiux-designer/cases/bending-active-thesis/release/project-studies.json',import.meta.url),'utf8')).projects;
const routes=[['home','/'],['about','/about/'],['projects','/projects/'],['contact','/contact/'],...studies.map(project=>[project.id,`/projects/${project.slug}/`]),['bending','/projects/bending-active/'],['xr','/projects/xr-bending-active/']];
const filmed=test.extend({video:'on'}),plane='[data-information-window][data-information-ready][data-information-plane]';
const recorded=new Set(['home','mode-s-of-making','bending','xr']);

async function nativeY(page,target,diagnostics){
 const sample=()=>page.evaluate(()=>{
  const s=window.__story?.inspect(),policy=window.__thesis?.inspect();
  return{y:scrollY,controllerFrame:s?.controllerFrame,frameDelta:s?.frameDelta,entry:s?.entry?.phase,
   informationWindows:s?{ticks:s.informationWindows.ticks,moving:s.informationWindows.moving,settled:s.informationWindows.settled,items:s.informationWindows.items.slice(0,32)}:null,policy:{reduced:policy?.reduced,motionPaused:policy?.motionPaused,hidden:document.hidden,saveData:!!navigator.connection?.saveData,forcedColors:matchMedia('(forced-colors: active)').matches,static:document.documentElement.hasAttribute('data-cinematic-static'),focused:document.activeElement?.tagName}};
 });
 const before=diagnostics?await sample():{y:await page.evaluate(()=>scrollY)},from=before.y;
 await page.mouse.move(page.viewportSize().width-4,page.viewportSize().height*.5);
 await page.mouse.wheel(0,target-from);
 await page.waitForFunction(y=>scrollY===y,target,{timeout:WAIT});
 if(!diagnostics)return page.evaluate(()=>scrollY);
 const after=await sample();if(diagnostics.length<32)diagnostics.push({target,before,after});return after.y;
}
async function neutral(page,selector=plane){
 await page.waitForFunction(selector=>{
  const nodes=[...document.querySelectorAll(selector)];
  return nodes.length>0&&nodes.every(node=>{
   const transform=getComputedStyle(node).transform;
   return node.dataset.informationMoving==='false'&&new DOMMatrix(transform==='none'?undefined:transform).isIdentity&&['rx','ry','rz','skew'].every(key=>parseFloat(node.style.getPropertyValue('--information-'+key))===0);
  });
 },selector,{timeout:WAIT});
}
async function ownership(page){
 return page.evaluate(selector=>{
  const panels=[...document.querySelectorAll(selector)];
  const external='canvas,video,[data-portfolio-masthead],[data-portfolio-navigation],[data-story-navigation],[data-project-chapter-navigation],[data-xr-chapter-navigation],nav[aria-label="Portfolio"],[data-cinematic-stage],[data-project-model-stage],[data-xr-stage],[data-model-viewport],[data-xr-model-control],[data-project-model-control],[data-xr-reading-tools],[data-bending-motion-toggle],[data-study-motion-toggle],[data-liquid-glass]';
  const problems=[];
  for(const node of document.querySelectorAll(external))if(node.closest(selector))problems.push({reason:'independent source or chrome inside moving plane',tag:node.tagName,attributes:[...node.attributes].map(a=>a.name)});
  for(const node of panels){
   if(node.parentElement?.closest('[data-information-window][data-information-ready]'))problems.push({reason:'nested plane owner',kind:node.dataset.informationWindow});
   for(const child of node.querySelectorAll('[data-information-window]'))if(child.hasAttribute('data-information-ready')||child.hasAttribute('data-information-plane'))problems.push({reason:'nested active window',kind:child.dataset.informationWindow});
   if(node.getAttribute('data-information-motion-surface')!=='plane'||!node.closest('[data-information-motion-profile="velocity-skin"]'))problems.push({reason:'missing explicit opt-in'});
   if(node.querySelectorAll(':scope > [data-information-skin]').length!==1)problems.push({reason:'skin ownership'});
   if(node.dataset.informationWindow==='model-label'&&node.dataset.modelLabelPlacement!=='native')problems.push({reason:'fixed model label acquired plane'});
  }
  const images=panels.flatMap(node=>[...node.querySelectorAll('img')].map(image=>({src:image.currentSrc||image.getAttribute('src'),owner:image.closest(selector)===node,fixed:getComputedStyle(image).position==='fixed'})));
  return{count:panels.length,problems,images};
 },plane);
}


// Default emulated forced palette only: resolved opaque paint, not a claim
// about every user-selected high-contrast theme or photographic source pixels.
function forcedPalette(panel,{allowDecorativeHidden=false}={}){
 const rgba=value=>{const parts=value.match(/^rgba?\(([^)]+)\)$/)?.[1].replace('/',' ').split(/[,\s]+/).filter(Boolean).map(Number);if(!parts||parts.some(n=>!Number.isFinite(n)))throw Error('Unsupported computed color '+value);return[...parts.slice(0,3),parts[3]??1];};
 const luminance=rgb=>rgb.slice(0,3).map(c=>c/255).map(c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4).reduce((sum,c,i)=>sum+c*[.2126,.7152,.0722][i],0);
 const paintFacts=(element,css)=>({tag:element.tagName,class:(element.getAttribute('class')??'').slice(0,160),
  href:(element.getAttribute('href')??'').slice(0,160),ariaCurrent:element.getAttribute('aria-current'),
  background:css.backgroundColor,opacity:css.opacity,transitionProperty:css.transitionProperty.slice(0,160),
  transitionDuration:css.transitionDuration.slice(0,120),transitionDelay:css.transitionDelay.slice(0,120),
  animations:element.getAnimations().slice(0,4).map(animation=>({property:String(animation.transitionProperty??animation.animationName??'').slice(0,80),playState:animation.playState}))});
 const opaque=(element,color,owner,scheme)=>{
  // Group opacity also composites the background; a foreground-only formula
  // cannot certify that case. Keep it fail-closed and inspect the saved PNG.
  for(let current=element;current;current=current.parentElement)if(Number(getComputedStyle(current).opacity)!==1)throw Error('Unsupported translucent paint-owner group '+owner);
  return{color,owner,scheme};
 };
 const owner=element=>{
  for(let current=element;current;current=current.parentElement){
   const css=getComputedStyle(current),skin=current.querySelector(':scope > [data-information-skin]');
   if(skin){
    const skinCSS=getComputedStyle(skin),paint=getComputedStyle(skin,'::before');
    if(skinCSS.display!=='none'&&skinCSS.visibility==='visible'&&Number(skinCSS.opacity)>0&&paint.content!=='none'&&paint.display!=='none'&&paint.visibility==='visible'&&Number(paint.opacity)>0){
     const alpha=rgba(paint.backgroundColor)[3];
     if(alpha>0){
      if(alpha!==1||Number(skinCSS.opacity)!==1||Number(paint.opacity)!==1)throw Error('Unsupported translucent skin paint');
      return opaque(current,paint.backgroundColor,current.tagName+'[data-information-window="'+current.dataset.informationWindow+'"] skin::before',paint.colorScheme);
     }
    }
   }
   const alpha=rgba(css.backgroundColor)[3];
   if(alpha>0){if(alpha!==1)throw Error('Unsupported translucent ancestor paint '+JSON.stringify(paintFacts(current,css)).slice(0,1400));return opaque(current,css.backgroundColor,current.tagName+(current.id?'#'+current.id:''),css.colorScheme);}
  }return null;
 };
 const samples=[],walker=document.createTreeWalker(panel,NodeFilter.SHOW_TEXT);
 while(walker.nextNode()&&samples.length<32){
  const node=walker.currentNode,element=node.parentElement,hidden=element.closest('[aria-hidden="true"]');
  const allowedHiddenRoot=allowDecorativeHidden&&hidden===panel&&!panel.parentElement?.closest('[aria-hidden="true"]');
  if(!node.textContent.trim()||!element.checkVisibility({visibilityProperty:true,opacityProperty:true})||(hidden&&!allowedHiddenRoot))continue;
  const range=document.createRange();range.selectNodeContents(node);
  if(![...range.getClientRects()].some(r=>r.width>0&&r.height>0&&r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth))continue;
  const css=getComputedStyle(element),paint=owner(element),foreground=rgba(css.color);let opacity=1;
  for(let current=element;current;current=current.parentElement)opacity*=Number(getComputedStyle(current).opacity);
  const background=paint?rgba(paint.color):null,alpha=foreground[3]*opacity;
  const actual=background?foreground.slice(0,3).map((c,i)=>c*alpha+background[i]*(1-alpha)):null;
  const a=actual?luminance(actual):0,b=background?luminance(background):0;
  samples.push({text:node.textContent.trim().slice(0,100),link:!!element.closest('a[href]'),foreground:css.color,opacity,background:paint?.color??null,backgroundOwner:paint?.owner??null,backgroundScheme:paint?.scheme??null,scheme:css.colorScheme,ratio:paint?(Math.max(a,b)+.05)/(Math.min(a,b)+.05):0,required:parseFloat(css.fontSize)>=24||(parseFloat(css.fontSize)>=18.6667&&Number(css.fontWeight)>=700)?3:4.5});
 }
 return{rootScheme:getComputedStyle(document.documentElement).colorScheme,cardScheme:getComputedStyle(panel).colorScheme,samples};
}

for(const [key,route] of routes)(recorded.has(key)?filmed:test)(`${key}: native whole-plane motion has reversible feedback, readable rest and independent source ownership`,async({page,isMobile},info)=>{
 info.setTimeout(scenarioTimeout(120000));
 let observation,primaryError;const receipt={route,originalViewport:page.viewportSize()};
 try{
  // Tall Contact legitimately needs no decorative movement when it has no
  // overflow. Exercise its real compact-height layout, never artificial space.

  const response=await page.goto(route);expect(response.status()).toBe(200);
  await page.waitForFunction(()=>window.__site?.inspect().phase==='entered',null,{timeout:WAIT});
  await page.evaluate(()=>document.fonts.ready);
  if(key==='bending')await page.waitForFunction(()=>window.__thesis?.inspect().ready&&!document.documentElement.hasAttribute('data-cinematic-static'),null,{timeout:WAIT});
  await page.waitForFunction(selector=>document.querySelectorAll(selector).length>0,plane,{timeout:WAIT});
  if(key==='contact'){
   await neutral(page);
   receipt.originalContact=await page.evaluate(()=>({y:scrollY,height:innerHeight,scrollHeight:document.documentElement.scrollHeight,overflow:Math.max(0,document.documentElement.scrollHeight-innerHeight)}));
   receipt.originalContact.neutral=true;
   await page.setViewportSize({width:receipt.originalViewport.width,height:600});
   await neutral(page);
  }
  receipt.viewport=page.viewportSize();
  const desktopBending=key==='bending'&&!isMobile;
  const nativeDiagnostics=key==='bending'?(receipt.nativeDiagnostics=[]):undefined;
  receipt.ownership=await ownership(page);expect(receipt.ownership.problems).toEqual([]);expect(receipt.ownership.count).toBeGreaterThan(0);
  for(const image of receipt.ownership.images){expect(image.owner).toBe(true);expect(image.fixed).toBe(false);}
  // Choose actual native layout, not the first DOM panel or a transformed rect.
  // Keep the same panel visibly intersecting the viewport in both directions.
  const selection=await page.evaluate(({selector,largeGesture})=>{
   const naturalY=node=>{let top=0;for(;node;node=node.offsetParent)top+=node.offsetTop;return top;};
   const max=Math.floor(document.documentElement.scrollHeight-innerHeight),nodes=[...document.querySelectorAll(selector)];
   const candidates=nodes.map((node,index)=>{
    const top=naturalY(node),height=node.offsetHeight,margin=Math.min(40,height/3);
    const low=Math.ceil(Math.max(0,top+margin-innerHeight)),high=Math.floor(Math.min(max,top+height-margin));
    const step=Math.min(largeGesture?Math.round(innerHeight*.6):96,high-low);
    const link=node.matches('a[href]')?node:[...node.querySelectorAll('a[href]')].find(a=>a.checkVisibility({visibilityProperty:true,opacityProperty:true}));
    const start=Math.max(low,Math.min(high-step,Math.round(top+height/2-innerHeight/2)));
    return{index,top,height,low,high,step,start,linked:!!link,visible:node.checkVisibility({visibilityProperty:true,opacityProperty:true})};
   }).filter(row=>row.visible&&row.linked&&row.step>=16);
   candidates.sort((a,b)=>Math.abs(a.start-scrollY)-Math.abs(b.start-scrollY));
   return{chosen:candidates[0]??null,max,candidates};
  },{selector:plane,largeGesture:desktopBending});
  receipt.selection=selection;expect(selection.chosen,'Route needs a real linked eligible plane and measurable native scroll excursion').not.toBeNull();
  const chosen=selection.chosen,panel=page.locator(plane).nth(chosen.index);
  await nativeY(page,chosen.start);await neutral(page);
  await expect(panel).toBeInViewport();
  observation=await panel.evaluateHandle(node=>{
   const state={phase:'initial',samples:[],counts:{}};
   const observer=new MutationObserver(()=>{
    if(state.samples.length>=120||(state.counts[state.phase]??0)>=32)return;
    const css=getComputedStyle(node),matrix=new DOMMatrix(css.transform==='none'?undefined:css.transform),box=node.getBoundingClientRect();
    const rx=parseFloat(node.style.getPropertyValue('--information-rx'))||0,ry=parseFloat(node.style.getPropertyValue('--information-ry'))||0;
    if(node.dataset.informationMoving!=='true'||(!rx&&!ry))return;
    state.counts[state.phase]=(state.counts[state.phase]??0)+1;
    state.samples.push({phase:state.phase,y:scrollY,rx,ry,rz:parseFloat(node.style.getPropertyValue('--information-rz'))||0,skew:parseFloat(node.style.getPropertyValue('--information-skew'))||0,matrix:Array.from(matrix.toFloat64Array()),identity:matrix.isIdentity,depth:Math.abs(matrix.m13)+Math.abs(matrix.m23),visible:box.bottom>0&&box.top<innerHeight,opacity:css.opacity,clip:css.clipPath});
   });
   observer.observe(node,{attributes:true,attributeFilter:['style','data-information-moving']});
   return{state,dispose(){observer.disconnect();}};
  });
  const travel=async(phase,from,to)=>{
   await observation.evaluate((value,phase)=>{value.state.phase=phase;},phase);
   // A genuine desktop Bending gesture, not four tiny serial protocol steps
   // that can fall below the .08 viewport/s deadzone on slow source frames.
   const steps=desktopBending?1:4;
   for(let step=1;step<=steps;step++)await nativeY(page,Math.round(from+(to-from)*step/steps),nativeDiagnostics);
   await expect.poll(()=>observation.evaluate((value,phase)=>value.state.samples.some(s=>s.phase===phase&&s.visible&&s.depth>1e-8&&s.rx!==0&&s.ry!==0),phase),{timeout:WAIT}).toBe(true);
   await neutral(page);
  };
  await travel('forward',chosen.start,chosen.start+chosen.step);
  await travel('reverse',chosen.start+chosen.step,chosen.start);
  const motion=await observation.evaluate(value=>value.state.samples);
  expect(motion.some(s=>s.phase==='forward'&&s.rx<0&&s.ry>0)).toBe(true);
  expect(motion.some(s=>s.phase==='reverse'&&s.rx>0&&s.ry<0)).toBe(true);
  for(const sample of motion){expect(sample.matrix.every(Number.isFinite)).toBe(true);expect(Math.abs(sample.rx)).toBeLessThanOrEqual(8);expect(Math.abs(sample.ry)).toBeLessThanOrEqual(4);expect(Math.abs(sample.rz)).toBeLessThanOrEqual(1.1);expect(Math.abs(sample.skew)).toBeLessThanOrEqual(.7);expect(sample.opacity).toBe('1');expect(sample.clip).toBe('none');}
  const focus=await panel.evaluate(node=>{
   const link=node.matches('a[href]')?node:[...node.querySelectorAll('a[href]')].find(a=>a.checkVisibility({visibilityProperty:true,opacityProperty:true}));
   const before=scrollY;link.focus({preventScroll:true});return{before,after:scrollY,focused:document.activeElement===link,transform:getComputedStyle(node).transform,href:link.getAttribute('href')};
  });
  expect(focus.focused).toBe(true);expect(focus.transform).toBe('none');expect(focus.after).toBe(focus.before);receipt.focus=focus;
  await observation.evaluate(value=>{value.state.phase='focused';});
  await nativeY(page,chosen.start+chosen.step);
  expect(await panel.evaluate(node=>getComputedStyle(node).transform)).toBe('none');
  await neutral(page);
  expect(await observation.evaluate(value=>value.state.samples.filter(sample=>sample.phase==='focused'))).toEqual([]);
  await panel.evaluate(node=>{if(node.contains(document.activeElement)||node===document.activeElement)document.activeElement.blur();});
  await nativeY(page,chosen.start);await neutral(page);
  const png=info.outputPath(`global-plane-${key}.png`);await page.screenshot({path:png});await info.attach('global-plane-rest',{path:png,contentType:'image/png'});

  // Existing project Pause controls stay outside the moving plane. XR exposes
  // its real model Pause only after a genuine native visit to Method.
  if(key==='xr'){
   const destination=await page.evaluate(()=>{
    const naturalY=node=>{let top=0;for(;node;node=node.offsetParent)top+=node.offsetTop;return top;};
    const nodes=[...document.querySelectorAll('[data-xr-chapter]')],index=nodes.findIndex(n=>n.dataset.xrChapter==='method'),top=naturalY(nodes[index]),end=naturalY(nodes[index+1]);
    return Math.round(top+(end-top)*.45-innerHeight*.42);
   });
   await nativeY(page,destination);
   await page.waitForFunction(()=>{const s=document.querySelector('[data-xr-stage]')?.__xrStage?.inspect();return s?.chapter==='method'&&s.scene.chapter==='method'&&s.scene.mode==='hold'&&s.scene.settled&&s.phase==='ready'&&s.resource?.successfulPaint;},null,{timeout:WAIT});
  }
  if(key==='bending'||key==='xr'||studies.some(project=>project.id===key)){
   const toggle=page.locator(key==='bending'?'[data-bending-motion-toggle]':key==='xr'?'[data-xr-motion-toggle]':'[data-study-motion-toggle]');
   await expect(toggle).toBeVisible({timeout:WAIT});await expect(toggle).toBeEnabled();await toggle.click();await expect(toggle).toHaveAttribute('aria-pressed','true');
   const before=await page.evaluate(()=>scrollY),target=await page.evaluate(()=>Math.min(Math.floor(document.documentElement.scrollHeight-innerHeight),scrollY+16));
   expect(target).toBeGreaterThan(before);await nativeY(page,target);await neutral(page);receipt.pause={before,after:target};
   await toggle.click();await expect(toggle).toHaveAttribute('aria-pressed','false');
  }
  for(const media of [{reducedMotion:'reduce',forcedColors:'none'},{reducedMotion:'no-preference',forcedColors:'active'}]){
   await page.emulateMedia(media);
   expect(await page.evaluate(query=>matchMedia(query).matches,media.forcedColors==='active'?'(forced-colors: active)':'(prefers-reduced-motion: reduce)')).toBe(true);
   await neutral(page);
   const from=await page.evaluate(()=>scrollY),to=from>=16?from-16:from+16;
   await nativeY(page,to);await neutral(page);
   if(media.forcedColors==='active'){
    // Return to the actual selected reading card; XR Pause navigated to Method.
    await nativeY(page,chosen.start);await neutral(page);
    receipt.forcedColors=await panel.evaluate(forcedPalette);
    receipt.forcedColors.fixedNavigation=[];
    const navigation=page.locator('nav[aria-label="Portfolio"] a[href],[data-portfolio-navigation] a[href]');
    await expect(navigation).toHaveCount(3);
    for(const link of await navigation.all()){
     await expect(link).toBeVisible();await expect(link).toBeInViewport();
     const transition=await link.evaluate(node=>{const css=getComputedStyle(node);return{property:css.transitionProperty,duration:css.transitionDuration,delay:css.transitionDelay};});
     if(['home','about','projects','contact'].includes(key))expect(transition.duration.split(',').map(value=>value.trim()).every(value=>value==='0s'),'Ordinary forced-palette navigation must switch atomically').toBe(true);
     receipt.forcedColors.fixedNavigation.push({href:await link.getAttribute('href'),transition,...await link.evaluate(forcedPalette)});
    }
    const focusY=await page.evaluate(()=>scrollY);
    await navigation.first().evaluate(node=>node.focus({preventScroll:true}));
    expect(await page.evaluate(()=>scrollY)).toBe(focusY);
    await page.keyboard.press('Tab');
    const focusedLink=navigation.nth(1);
    expect(await focusedLink.evaluate(node=>document.activeElement===node&&node.matches(':focus-visible'))).toBe(true);
    expect(await page.evaluate(()=>scrollY)).toBe(focusY);
    receipt.forcedColors.focusedNavigation={href:await focusedLink.getAttribute('href'),y:focusY,...await focusedLink.evaluate(forcedPalette)};
    await focusedLink.evaluate(node=>node.blur());
    expect(await page.evaluate(()=>scrollY)).toBe(focusY);
    receipt.forcedColors.decorative=[];
    if(key==='home')for(const selector of ['[data-portfolio-notation]','[data-portfolio-signature]']){
     const label=page.locator(selector);await expect(label).toHaveCount(1);await expect(label).toHaveAttribute('aria-hidden','true');
     const compact=await page.evaluate(()=>matchMedia('(max-width:640px)').matches);
     if(compact){
      expect(await label.evaluate(node=>getComputedStyle(node).display)).toBe('none');
      receipt.forcedColors.decorative.push({selector,compactHidden:true});
     }else{
      await expect(label).toBeVisible();await expect(label).toBeInViewport();
      receipt.forcedColors.decorative.push({selector,...await label.evaluate(forcedPalette,{allowDecorativeHidden:true})});
     }
    }
    const forcedPng=info.outputPath(`global-plane-${key}-forced-colors.png`);
    await page.screenshot({path:forcedPng});await info.attach('global-plane-forced-colors',{path:forcedPng,contentType:'image/png'});
    const audits=[receipt.forcedColors,receipt.forcedColors.focusedNavigation,...receipt.forcedColors.fixedNavigation,...receipt.forcedColors.decorative.filter(row=>!row.compactHidden)];
    for(const audit of audits)expect(audit.samples.length,`Visible text required: ${audit.href??audit.selector??'selected plane'}`).toBeGreaterThan(0);
    for(const row of audits.flatMap(audit=>audit.samples)){
     expect(row.backgroundOwner,`${row.text}: opaque painted owner`).not.toBeNull();
     expect(row.ratio,`${row.text}: ${row.foreground} on ${row.background} (${row.backgroundOwner})`).toBeGreaterThanOrEqual(row.required);
    }
   }
  }
  receipt.finalOwnership=await ownership(page);expect(receipt.finalOwnership.problems).toEqual([]);
 }catch(error){primaryError=error;throw error;}finally{
  let receiptError;
  try{if(observation){receipt.motion=await observation.evaluate(value=>value.state);await observation.evaluate(value=>value.dispose());await observation.dispose();}}catch(error){receiptError=error;/* Keep already collected fields after page closure. */}
  try{const path=info.outputPath(`global-plane-${key}.json`);await writeFile(path,JSON.stringify(receipt,null,2));await info.attach('global-plane-receipt',{path,contentType:'application/json'});}catch(error){receiptError??=error;}
  // Successful acceptance requires its evidence; failed tests retain the
  // original assertion rather than replacing it with an attachment error.
  if(receiptError&&!primaryError)throw receiptError;
 }
});
