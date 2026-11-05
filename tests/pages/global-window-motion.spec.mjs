import {test,expect} from '@playwright/test';
import {readFile,writeFile} from 'node:fs/promises';
import {WAIT,scenarioTimeout} from './case-helpers.mjs';

const studies=JSON.parse(await readFile(new URL('../../roles/uiux-designer/cases/bending-active-thesis/release/project-studies.json',import.meta.url),'utf8')).projects;
const routes=[['home','/'],['about','/about/'],['projects','/projects/'],['contact','/contact/'],...studies.map(project=>[project.id,`/projects/${project.slug}/`]),['bending','/projects/bending-active/'],['xr','/projects/xr-bending-active/']];
const filmed=test.extend({video:'on'}),plane='[data-information-window][data-information-ready][data-information-plane]';
const recorded=new Set(['home','mode-s-of-making','bending','xr']);

function nativePosition({target,timeout,diagnostics}){
 // Observe an actual native scroll event (or an already-reached endpoint),
 // capturing its diagnostic state in that same delivery. No extra RAF clock.
 return new Promise((resolve,reject)=>{
  let timer;
  const cleanup=()=>{removeEventListener('scroll',read);clearTimeout(timer);};
  const read=()=>{
   if(target!==null&&scrollY!==target)return false;
   const s=diagnostics?window.__story?.inspect():null,policy=diagnostics?window.__thesis?.inspect():null;
   const sample=diagnostics?{y:scrollY,controllerFrame:s?.controllerFrame,frameDelta:s?.frameDelta,entry:s?.entry?.phase,
    informationWindows:s?{ticks:s.informationWindows.ticks,moving:s.informationWindows.moving,settled:s.informationWindows.settled,items:s.informationWindows.items.slice(0,32)}:null,policy:{reduced:policy?.reduced,motionPaused:policy?.motionPaused,hidden:document.hidden,saveData:!!navigator.connection?.saveData,forcedColors:matchMedia('(forced-colors: active)').matches,static:document.documentElement.hasAttribute('data-cinematic-static'),focused:document.activeElement?.tagName}}:{y:scrollY};
   cleanup();resolve(sample);return true;
  };
  if(read())return;
  addEventListener('scroll',read,{passive:true});
  timer=setTimeout(()=>{cleanup();reject(Error(`Native scroll did not reach ${target}; observed ${scrollY}`));},timeout);
 });
}
async function nativeY(page,target,diagnostics){
 const before=await page.evaluate(nativePosition,{target:null,timeout:WAIT,diagnostics:!!diagnostics}),from=before.y;
 if(from!==target)await page.mouse.wheel(0,target-from);
 const after=from===target?before:await page.evaluate(nativePosition,{target,timeout:WAIT,diagnostics:!!diagnostics});
 if(diagnostics&&diagnostics.length<32)diagnostics.push({target,before,after});return after.y;
}
async function neutral(page,selector=plane){
 await page.waitForFunction(selector=>{
  const nodes=[...document.querySelectorAll(selector)];
  return nodes.length>0&&nodes.every(node=>{
   const transform=getComputedStyle(node).transform;
   const matrix=new DOMMatrix(transform==='none'?undefined:transform),value=key=>parseFloat(node.style.getPropertyValue('--information-'+key));
   return (node.dataset.informationMoving==='false'||node.dataset.glassMotion==='stream')&&Array.from(matrix.toFloat64Array()).every(Number.isFinite)&&value('flow')===0&&value('skew')===0&&Math.abs(value('rx'))<=19.001;
  });
 },selector,{timeout:WAIT});
}
async function ownership(page){
 return page.evaluate(selector=>{
  const panels=[...document.querySelectorAll(selector)];
  const external='canvas,video,[data-portfolio-masthead],[data-portfolio-navigation],[data-story-navigation],[data-project-chapter-navigation],[data-xr-chapter-navigation],nav[aria-label="Portfolio"],[data-cinematic-stage],[data-project-model-stage],[data-xr-stage],[data-model-viewport],[data-xr-model-control],[data-project-model-control],[data-xr-reading-tools],[data-bending-motion-toggle],[data-study-motion-toggle],[data-liquid-glass]';
  const problems=[];
  for(const node of document.querySelectorAll(external))if(node.closest(selector)){
   // The prepared model is content of its Project tile, just like the other
   // tile images. Its renderer owns the source; the parent owns card motion.
   const tile=node.closest('[data-project-tile="bending-active"]'),preview=node.closest('[data-project-model-preview]');
   const view=preview?.__projectModelPreview?.inspect();
   const cardSource=node.matches('canvas[data-project-model-canvas]')&&tile===node.closest(selector)&&tile.dataset.informationWindow==='home-project-card'&&view?.phase==='ready'&&view.resource?.firstDraw?.completed;
   if(!cardSource)problems.push({reason:'independent source or chrome inside moving plane',tag:node.tagName,attributes:[...node.attributes].map(a=>a.name)});
  }
  for(const node of panels){
   if(node.parentElement?.closest('[data-information-window][data-information-ready]'))problems.push({reason:'nested plane owner',kind:node.dataset.informationWindow});
   for(const child of node.querySelectorAll('[data-information-window]'))if(child.hasAttribute('data-information-ready')||child.hasAttribute('data-information-plane'))problems.push({reason:'nested active window',kind:child.dataset.informationWindow});
   if(!node.closest('[data-information-motion-profile="velocity-skin"]'))problems.push({reason:'missing shared field'});
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
 if(Array.isArray(panel))return panel.map(node=>{const css=getComputedStyle(node);return{href:node.getAttribute('href'),transition:{property:css.transitionProperty,duration:css.transitionDuration,delay:css.transitionDelay},...forcedPalette(node)};});
 if(!panel.isConnected)throw Error('Forced-palette observation lost its native paint owner');
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
 let observation,panelNode,primaryError;const navigationNodes=[],receipt={route,originalViewport:page.viewportSize()};
 try{
  // Tall Contact legitimately needs no decorative movement when it has no
  // overflow. Exercise its real compact-height layout, never artificial space.

  const response=await page.goto(route);expect(response.status()).toBe(200);
  // All four independent readiness conditions belong to the same document.
  // Separate protocol reads previously queued behind additional source draws.
  await page.waitForFunction(({key,selector})=>window.__site?.inspect().phase==='entered'&&document.fonts.status==='loaded'&&(key!=='bending'||window.__thesis?.inspect().ready&&!document.documentElement.hasAttribute('data-cinematic-static'))&&document.querySelectorAll(selector).length>0,{key,selector:plane},{timeout:WAIT});
  if(key==='contact'){
   await neutral(page);
   receipt.originalContact=await page.evaluate(()=>({y:scrollY,height:innerHeight,scrollHeight:document.documentElement.scrollHeight,overflow:Math.max(0,document.documentElement.scrollHeight-innerHeight)}));
   receipt.originalContact.neutral=true;
   await page.setViewportSize({width:receipt.originalViewport.width,height:600});
   await neutral(page);
  }
  receipt.viewport=page.viewportSize();
  // Every wheel in this scenario uses this same unobstructed document edge.
  // Keyboard/focus/media checks do not move the pointer; do not redispatch an
  // identical mouse move before each native wheel.
  await page.mouse.move(receipt.viewport.width-4,receipt.viewport.height*.5);
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
   }).filter(row=>row.visible&&row.step>=16);
   candidates.sort((a,b)=>Math.abs(a.start-scrollY)-Math.abs(b.start-scrollY));
   return{chosen:candidates[0]??null,max,candidates};
  },{selector:plane,largeGesture:desktopBending});
  receipt.selection=selection;expect(selection.chosen,'Route needs a real eligible plane and measurable native scroll excursion').not.toBeNull();
  const chosen=selection.chosen,panel=page.locator(plane).nth(chosen.index);
  await nativeY(page,chosen.start);await neutral(page);
  await expect(panel).toBeInViewport();
  // These native reading/chrome nodes persist for the document. Retain their
  // actual handles once instead of re-resolving the same locator before every
  // evaluation behind the live GPU queue. Connected-owner checks remain below.
  panelNode=await panel.elementHandle();expect(panelNode).not.toBeNull();
  observation=await panelNode.evaluateHandle((node,{observeNativeScroll,top})=>{
   const state={phase:'initial',samples:[],counts:{},...(observeNativeScroll?{nativeScroll:[],nativeScrollCounts:{},nativeScrollScope:'Native event delivery timestamps/displacement and observed presenter state; not internal velocitySkin speed/dt or a performance benchmark.'}:{})};
   const scroll=event=>{
    if(!observeNativeScroll||state.nativeScroll.length>=48||(state.nativeScrollCounts[state.phase]??0)>=16)return;
    const driver=window.__globalBackground?.inspect().driver,windows=driver?.homeScrolling?.informationWindows;
    const matches=windows?.items.filter(item=>item.kind===node.dataset.informationWindow&&item.top===top)??[];
    const previous=state.nativeScroll.findLast(row=>row.phase===state.phase),y=scrollY;
    const eventElapsedMs=previous?event.timeStamp-previous.eventTimeStamp:null;
    state.nativeScrollCounts[state.phase]=(state.nativeScrollCounts[state.phase]??0)+1;
    state.nativeScroll.push({phase:state.phase,trusted:event.isTrusted,eventTimeStamp:event.timeStamp,browserObservedMs:performance.now(),y,viewportHeight:innerHeight,
     deltaY:previous?y-previous.y:null,eventElapsedMs,deliverySpeedViewportPerSecond:eventElapsedMs>0?(y-previous.y)/innerHeight/(eventElapsedMs/1000):null,
     driverFrames:driver?.frames,windowTicks:windows?.ticks,windowMoving:windows?.moving,windowSettled:windows?.settled,matchingItems:matches.length,
     presenter:matches.slice(0,1).map(item=>({kind:item.kind,top:item.top,skinStrength:item.skinStrength,settled:item.settled,rx:item.rx,ry:item.ry,rz:item.rz,skew:item.skew})),
     published:{moving:node.dataset.informationMoving,rx:node.style.getPropertyValue('--information-rx'),ry:node.style.getPropertyValue('--information-ry')}});
   };
   if(observeNativeScroll)addEventListener('scroll',scroll,{passive:true});
   const observer=new MutationObserver(()=>{
    if(state.samples.length>=120&&(state.counts[state.phase]??0)<32)return;
    const css=getComputedStyle(node),matrix=new DOMMatrix(css.transform==='none'?undefined:css.transform),box=node.getBoundingClientRect();
    const rx=parseFloat(node.style.getPropertyValue('--information-rx'))||0,ry=parseFloat(node.style.getPropertyValue('--information-ry'))||0;
    if(node.dataset.informationMoving!=='true'||(!rx&&!ry))return;
    // Keep the latest bounded phase window. Four real wheel deliveries can
    // produce over 32 decay frames before the requested endpoint; retaining
    // only the first 32 would discard the very position the assertion owns.
    if((state.counts[state.phase]??0)>=32){const oldest=state.samples.findIndex(sample=>sample.phase===state.phase);if(oldest>=0)state.samples.splice(oldest,1);}
    else state.counts[state.phase]=(state.counts[state.phase]??0)+1;
    const windows=window.__story?.inspect().informationWindows??document.querySelector('[data-xr-stage]')?.__xrStage?.inspect().informationWindows??window.__globalBackground?.inspect().driver?.homeScrolling?.informationWindows;
    const strength=windows?.items.find(item=>item.kind===node.dataset.informationWindow&&Math.abs(item.top-top)<1)?.skinStrength??0;
    state.samples.push({phase:state.phase,y:scrollY,rx,ry,strength,rz:parseFloat(node.style.getPropertyValue('--information-rz'))||0,skew:parseFloat(node.style.getPropertyValue('--information-skew'))||0,matrix:Array.from(matrix.toFloat64Array()),identity:matrix.isIdentity,depth:Math.abs(matrix.m13)+Math.abs(matrix.m23),visible:box.bottom>0&&box.top<innerHeight,opacity:css.opacity,clip:css.clipPath});
   });
   observer.observe(node,{attributes:true,attributeFilter:['style','data-information-moving']});
   return{state,dispose(){observer.disconnect();if(observeNativeScroll)removeEventListener('scroll',scroll);}};
  },{observeNativeScroll:key==='projects',top:chosen.top});
  const travel=async(phase,from,to)=>{
   await observation.evaluate((value,phase)=>{value.state.phase=phase;},phase);
   // A genuine desktop Bending gesture, not four tiny serial protocol steps
   // that can fall below the .08 viewport/s deadzone on slow source frames.
   // Projects also uses one native measured excursion, not four serial24px
   // commands. Endpoints and all actual direction/rest/policy guards stay exact.
   const steps=desktopBending||key==='projects'?1:4;
   for(let step=1;step<=steps;step++)await nativeY(page,Math.round(from+(to-from)*step/steps),nativeDiagnostics);
   // nativeY independently requires the exact endpoint. Direction belongs to
   // actual displacement during this gesture: WebKit can deliver 589px then
   // 11px, with the spring already rebounding at the final pixel. Exclude the
   // starting position and any sample outside this excursion so a positioning
   // tail cannot satisfy the next gesture's direction requirement.
   await expect.poll(()=>observation.evaluate((value,{phase,from,to})=>value.state.samples.some(s=>s.phase===phase&&(s.y-from)*Math.sign(to-from)>0&&(to-s.y)*Math.sign(to-from)>=0&&s.visible&&s.depth>1e-8&&s.strength*Math.sign(to-from)>0),{phase,from,to}),{timeout:WAIT}).toBe(true);
   await neutral(page);
  };
  await travel('forward',chosen.start,chosen.start+chosen.step);
  await travel('reverse',chosen.start+chosen.step,chosen.start);
  const motion=await observation.evaluate(value=>value.state.samples);
  expect(motion.some(s=>s.phase==='forward'&&s.strength>0)).toBe(true);
  expect(motion.some(s=>s.phase==='reverse'&&s.strength<0)).toBe(true);
  for(const sample of motion){expect(sample.matrix.every(Number.isFinite)).toBe(true);expect(Math.abs(sample.rx)).toBeLessThanOrEqual(22.201);expect(Math.abs(sample.ry)).toBeLessThanOrEqual(7.001);expect(Math.abs(sample.rz)).toBeLessThanOrEqual(.651);expect(Math.abs(sample.skew)).toBeLessThanOrEqual(1.301);expect(sample.opacity).toBe('1');expect(sample.clip).toBe('none');}
  if(chosen.linked){
  const focus=await panelNode.evaluate(node=>{
   if(!node.isConnected)throw Error('Reading focus lost its native plane');
   const link=node.matches('a[href]')?node:[...node.querySelectorAll('a[href]')].find(a=>a.checkVisibility({visibilityProperty:true,opacityProperty:true}));
   const before=scrollY;link.focus({preventScroll:true});return{before,after:scrollY,focused:document.activeElement===link,transform:getComputedStyle(node).transform,href:link.getAttribute('href')};
  });
  expect(focus.focused).toBe(true);expect(focus.transform).toBe('none');expect(focus.after).toBe(focus.before);receipt.focus=focus;
  await observation.evaluate(value=>{value.state.phase='focused';});
  await nativeY(page,chosen.start+chosen.step);
  expect(await panelNode.evaluate(node=>{if(!node.isConnected)throw Error('Reading focus lost its native plane');return getComputedStyle(node).transform;})).toBe('none');
  await neutral(page);
  expect(await observation.evaluate(value=>value.state.samples.filter(sample=>sample.phase==='focused'))).toEqual([]);
  await panelNode.evaluate(node=>{if(node.contains(document.activeElement)||node===document.activeElement)document.activeElement.blur();});
  await nativeY(page,chosen.start);await neutral(page);
  }
  const png=info.outputPath(`global-plane-${key}.png`);await page.screenshot({path:png});await info.attach('global-plane-rest',{path:png,contentType:'image/png'});

  await expect(page.locator('[data-bending-motion-toggle],[data-xr-motion-toggle],[data-study-motion-toggle]')).toHaveCount(0);
  for(const media of [{reducedMotion:'reduce',forcedColors:'none'},{reducedMotion:'no-preference',forcedColors:'active'}]){
   await page.emulateMedia(media);
   expect(await page.evaluate(query=>matchMedia(query).matches,media.forcedColors==='active'?'(forced-colors: active)':'(prefers-reduced-motion: reduce)')).toBe(true);
   await neutral(page);
   const from=await page.evaluate(()=>scrollY),to=from>=16?from-16:from+16;
   await nativeY(page,to);await neutral(page);
   if(media.forcedColors==='active'){
    // Return to the actual selected reading card; XR Pause navigated to Method.
    await nativeY(page,chosen.start);await neutral(page);
    receipt.forcedColors=await panelNode.evaluate(forcedPalette);
    const navigation=page.locator('nav[aria-label="Portfolio"] a[href],[data-portfolio-navigation] a[href]');
    navigationNodes.push(...await navigation.elementHandles());expect(navigationNodes).toHaveLength(3);
    // Fixed native controls are independent observations. Keep every visibility,
    // viewport, transition and painted-contrast assertion, without serially
    // placing each protocol read behind another live model draw.
    await Promise.all(navigationNodes.flatMap((_,index)=>[expect(navigation.nth(index)).toBeVisible(),expect(navigation.nth(index)).toBeInViewport()]));
    receipt.forcedColors.fixedNavigation=await page.evaluate(forcedPalette,navigationNodes);
    for(const {transition}of receipt.forcedColors.fixedNavigation)if(['home','about','projects','contact'].includes(key))expect(transition.duration.split(',').map(value=>value.trim()).every(value=>value==='0s'),'Ordinary forced-palette navigation must switch atomically').toBe(true);
    const focusStart=await navigationNodes[0].evaluate(node=>{if(!node.isConnected)throw Error('Navigation focus lost its native owner');const before=scrollY;node.focus({preventScroll:true});return{before,after:scrollY,focused:document.activeElement===node};});
    expect(focusStart.focused).toBe(true);expect(focusStart.after).toBe(focusStart.before);const focusY=focusStart.before;
    await page.keyboard.press('Tab');
    const focusedLink=navigationNodes[1];
    receipt.forcedColors.keyboardFocus=[];let focusedState;
    await expect.poll(async()=>{
     const state=await focusedLink.evaluate(node=>({connected:node.isConnected,activeTag:document.activeElement?.tagName,activeHref:document.activeElement?.getAttribute('href'),documentHasFocus:document.hasFocus(),targetActive:document.activeElement===node,targetFocusVisible:node.matches(':focus-visible'),scrollY}));
     focusedState=state;
     if(receipt.forcedColors.keyboardFocus.length<32)receipt.forcedColors.keyboardFocus.push(state);
     return state.connected&&state.targetActive&&state.targetFocusVisible;
    },{timeout:WAIT}).toBe(true);
    expect(focusedState.scrollY).toBe(focusY);
    receipt.forcedColors.focusedNavigation={href:focusedState.activeHref,y:focusedState.scrollY,...await focusedLink.evaluate(forcedPalette)};
    const blurredY=await focusedLink.evaluate(node=>{node.blur();return scrollY;});expect(blurredY).toBe(focusY);
    receipt.forcedColors.decorative=[];
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
  try{if(observation){receipt.motion=await observation.evaluate(value=>{value.dispose();return value.state;});await observation.dispose();}}catch(error){receiptError=error;/* Keep already collected fields after page closure. */}
  for(const handle of [panelNode,...navigationNodes].filter(Boolean))try{await handle.dispose();}catch(error){receiptError??=error;}
  try{const path=info.outputPath(`global-plane-${key}.json`);await writeFile(path,JSON.stringify(receipt,null,2));await info.attach('global-plane-receipt',{path,contentType:'application/json'});}catch(error){receiptError??=error;}
  // Successful acceptance requires its evidence; failed tests retain the
  // original assertion rather than replacing it with an attachment error.
  if(receiptError&&!primaryError)throw receiptError;
 }
});
