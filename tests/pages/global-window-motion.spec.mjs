import {test,expect} from '@playwright/test';
import {readFile,writeFile} from 'node:fs/promises';
import {WAIT,scenarioTimeout} from './case-helpers.mjs';

const studies=JSON.parse(await readFile(new URL('../../roles/uiux-designer/cases/bending-active-thesis/release/project-studies.json',import.meta.url),'utf8')).projects;
const routes=[['home','/'],['about','/about/'],['projects','/projects/'],['contact','/contact/'],...studies.map(project=>[project.id,`/projects/${project.slug}/`]),['bending','/projects/bending-active/'],['xr','/projects/xr-bending-active/']];
const filmed=test.extend({video:'on'}),plane='[data-information-window][data-information-ready][data-information-plane]';
const recorded=new Set(['home','mode-s-of-making','bending','xr']);

async function nativeY(page,target){
 const from=await page.evaluate(()=>scrollY);
 await page.mouse.move(page.viewportSize().width-4,page.viewportSize().height*.5);
 await page.mouse.wheel(0,target-from);
 await page.waitForFunction(y=>scrollY===y,target,{timeout:WAIT});
 return page.evaluate(()=>scrollY);
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

for(const [key,route] of routes)(recorded.has(key)?filmed:test)(`${key}: native whole-plane motion has reversible feedback, readable rest and independent source ownership`,async({page,isMobile},info)=>{
 info.setTimeout(scenarioTimeout(120000));
 let observation,primaryError;const receipt={route,originalViewport:page.viewportSize()};
 try{
  // Tall Contact legitimately needs no decorative movement when it has no
  // overflow. Exercise its real compact-height layout, never artificial space.
  if(key==='contact'&&!isMobile)await page.setViewportSize({width:receipt.originalViewport.width,height:600});
  receipt.viewport=page.viewportSize();
  const response=await page.goto(route);expect(response.status()).toBe(200);
  await page.waitForFunction(()=>window.__site?.inspect().phase==='entered',null,{timeout:WAIT});
  await page.evaluate(()=>document.fonts.ready);
  if(key==='bending')await page.waitForFunction(()=>window.__thesis?.inspect().ready&&!document.documentElement.hasAttribute('data-cinematic-static'),null,{timeout:WAIT});
  await page.waitForFunction(selector=>document.querySelectorAll(selector).length>0,plane,{timeout:WAIT});
  receipt.ownership=await ownership(page);expect(receipt.ownership.problems).toEqual([]);expect(receipt.ownership.count).toBeGreaterThan(0);
  for(const image of receipt.ownership.images){expect(image.owner).toBe(true);expect(image.fixed).toBe(false);}
  // Choose actual native layout, not the first DOM panel or a transformed rect.
  // Keep the same panel visibly intersecting the viewport in both directions.
  const selection=await page.evaluate(selector=>{
   const naturalY=node=>{let top=0;for(;node;node=node.offsetParent)top+=node.offsetTop;return top;};
   const max=Math.floor(document.documentElement.scrollHeight-innerHeight),nodes=[...document.querySelectorAll(selector)];
   const candidates=nodes.map((node,index)=>{
    const top=naturalY(node),height=node.offsetHeight,margin=Math.min(40,height/3);
    const low=Math.ceil(Math.max(0,top+margin-innerHeight)),high=Math.floor(Math.min(max,top+height-margin));
    const step=Math.min(96,high-low);
    const link=node.matches('a[href]')?node:[...node.querySelectorAll('a[href]')].find(a=>a.checkVisibility({visibilityProperty:true,opacityProperty:true}));
    const start=Math.max(low,Math.min(high-step,Math.round(top+height/2-innerHeight/2)));
    return{index,top,height,low,high,step,start,linked:!!link,visible:node.checkVisibility({visibilityProperty:true,opacityProperty:true})};
   }).filter(row=>row.visible&&row.linked&&row.step>=16);
   candidates.sort((a,b)=>Math.abs(a.start-scrollY)-Math.abs(b.start-scrollY));
   return{chosen:candidates[0]??null,max,candidates};
  },plane);
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
   for(let step=1;step<=4;step++)await nativeY(page,Math.round(from+(to-from)*step/4));
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
