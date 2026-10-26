import {test,expect} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
import {BENDING_SCROLL_ORIENTATION,sampleSourceScrollOrientation} from '../../roles/uiux-designer/cases/bending-active-thesis/components/source-scroll-orientation.mjs';
import {WAIT,scenarioTimeout,loadScene,settle,frames} from './case-helpers.mjs';
test.use({video:'on'});
const facts=page=>page.evaluate(()=>{
 const s=window.__story.inspect(),r=window.__thesis.inspect();
 return {y:scrollY,u:s.nativeU,chapter:s.canvasPlacement.chapter,orientation:s.scrollCamera.orientation,
  recovery:s.scrollCamera.needsFrame,painted:r.scrollCameraPainted,position:r.pose.position,
  placement:s.canvasPlacement,renderSuspended:r.renderSuspended,sourceVisible:r.sourceVisible,sourceAsset:r.source,diagramSource:r.diagramSource,stageOpacity:Number(getComputedStyle(document.querySelector('[data-cinematic-stage]')).opacity),
  activeSeconds:s.playback.activeSeconds,idle:s.chapterScene.camera,frames:r.frames,
  paused:r.motionPaused,reduced:r.systemReduced,source:r.representation.id,sourceRevision:r.representation.assetRevision};
});
async function nativeReading(page,chapter,fraction,{held=null,targetY=null,absent=false,steps=1}={}){
 const goal=targetY??await page.evaluate(({chapter,fraction})=>{
  const naturalY=el=>{let y=0;for(let n=el;n;n=n.offsetParent)y+=n.offsetTop;return y;};
  const sections=[...document.querySelectorAll('[data-story-chapter]')],i=sections.findIndex(el=>el.dataset.storyChapter===chapter);
  if(i<0)throw Error('Missing chapter '+chapter);
  const top=naturalY(sections[i]),end=i<6?naturalY(sections[i+1]):top+sections[i].offsetHeight;
  return Math.max(0,Math.min(document.documentElement.scrollHeight-innerHeight,top+(end-top)*fraction-innerHeight*.45));
 },{chapter,fraction});
 try{
  const y=await page.evaluate(()=>scrollY);
  for(let step=1;step<=steps;step++){
   const next=y+(goal-y)*step/steps;await page.mouse.wheel(0,next-await page.evaluate(()=>scrollY));
   await page.waitForFunction(next=>Math.abs(scrollY-next)<=1,next,{timeout:WAIT});if(steps>1)await frames(page,2);
  }
  await page.waitForFunction(({goal,exact})=>exact?scrollY===goal:Math.abs(scrollY-goal)<=1,{goal,exact:targetY!==null},{timeout:WAIT});
  await settle(page);
  await page.waitForFunction(({chapter,absent})=>{
   const s=window.__story.inspect(),r=window.__thesis.inspect(),a=s.scrollCamera?.orientation,b=r.scrollCameraPainted;
   if(absent)return s.canvasPlacement.chapter===chapter&&s.canvasPlacement.mode==='absent'&&s.canvasPlacement.settled&&!s.canvasPlacement.visible&&s.canvasPlacement.opacity===0&&r.renderSuspended&&!r.sourceVisible&&Number(getComputedStyle(document.querySelector('[data-cinematic-stage]')).opacity)===0;
   return s.canvasPlacement.chapter===chapter&&s.canvasPlacement.visible&&!s.canvasAwaitingPaint&&r.ready&&r.sourceVisible&&r.representation.chapterId===chapter&&!s.scrollCamera.needsFrame&&a&&b&&a.azimuthOffsetDeg===b.azimuthOffsetDeg&&a.elevationOffsetDeg===b.elevationOffsetDeg;
  },{chapter,absent},{timeout:WAIT});
  const value=await facts(page),expected=held??sampleSourceScrollOrientation(BENDING_SCROLL_ORIENTATION,value.u,{reducedMotion:value.reduced});
  if(targetY!==null)expect(value.y).toBe(goal);else expect(Math.abs(value.y-goal)).toBeLessThanOrEqual(1);
  for(const key of Object.keys(expected))expect(value.orientation[key]).toBeCloseTo(expected[key],10);
  return value;
 }catch(error){
  try{await test.info().attach('bending-native-reading-failure',{body:JSON.stringify({goal,chapter,fraction,absent,facts:await facts(page)}),contentType:'application/json'});}catch{}
  throw error;
 }
}
async function capture(page,name){const path=test.info().outputPath(name+'.png');await page.screenshot({path});await test.info().attach(name,{path,contentType:'image/png'});}
test('Bending bold native camera paths preserve independent idle, scroll-owned source sequence and native reading',async({page})=>{
 test.setTimeout(scenarioTimeout(210000));await loadScene(page);await page.mouse.move(4,400);
 const receipts=[];
 for(const chapter of ['form','system','pattern']){
  const first=await nativeReading(page,chapter,.22);await capture(page,`bending-${chapter}-early`);
  const crane=await nativeReading(page,chapter,.50,{steps:6});await capture(page,`bending-${chapter}-crane`);
  const forward=await nativeReading(page,chapter,.70,{steps:6});await capture(page,`bending-${chapter}-opposite`);
  const reverse=await nativeReading(page,chapter,.22,{targetY:first.y,steps:8});
  expect(forward.orientation).not.toEqual(first.orientation);
  expect(reverse.y).toBe(first.y);expect(reverse.u).toBe(first.u);expect(reverse.orientation).toEqual(first.orientation);
  expect(first.sourceRevision).toBeTruthy();expect(forward.sourceRevision).toBe(first.sourceRevision);expect(reverse.sourceRevision).toBe(first.sourceRevision);
  receipts.push({chapter,first,crane,forward,reverse});
 }
 const idleStart=await nativeReading(page,'system',.22);await frames(page,3);
 await page.waitForFunction(n=>window.__thesis.inspect().frames>n,idleStart.frames,{timeout:WAIT});
 const idleEnd=await facts(page);expect(idleEnd.u).toBe(idleStart.u);expect(idleEnd.orientation).toEqual(idleStart.orientation);
 expect(idleEnd.activeSeconds).toBeGreaterThan(idleStart.activeSeconds);expect(idleEnd.idle).not.toEqual(idleStart.idle);expect(idleEnd.position).not.toEqual(idleStart.position);expect(idleEnd.source).toBe(idleStart.source);
 await capture(page,'bending-scroll-source');
 await expect(page.locator('[data-bending-motion-toggle],[data-reading-tools],[data-model-inspection-control]')).toHaveCount(0);
 const keyboardStart=await page.evaluate(()=>scrollY);await page.keyboard.press('PageDown');
 await expect.poll(()=>page.evaluate(()=>scrollY),{timeout:WAIT}).toBeGreaterThan(keyboardStart);
 const resumed=await nativeReading(page,'system',.70);expect(resumed.orientation).not.toEqual(idleStart.orientation);
 expect(resumed.source).not.toBe(idleStart.source); // source identity follows chapter progress, not waiting
 // Genuine absence must not require a fresh render or equality with stale painted pose.
 const canvas=await page.locator('[data-cinematic-stage] canvas').elementHandle(),absence=[];
 for(const chapter of ['make','validation','credits']){
  const hidden=await nativeReading(page,chapter,.5,{absent:true});await frames(page,3);const heldHidden=await facts(page);
  expect(heldHidden.frames).toBe(hidden.frames);expect(heldHidden.renderSuspended).toBe(true);expect(heldHidden.sourceVisible).toBe(false);
  expect(heldHidden.sourceAsset).toEqual(resumed.sourceAsset);expect(heldHidden.diagramSource).toEqual(resumed.diagramSource);
  expect(await page.evaluate(node=>node===document.querySelector('[data-cinematic-stage] canvas'),canvas)).toBe(true);
  await capture(page,'bending-native-absence-'+chapter);absence.push({chapter,hidden,heldHidden});
 }
 const returned=await nativeReading(page,'system',.70);expect(returned.renderSuspended).toBe(false);expect(returned.sourceVisible).toBe(true);
 expect(returned.sourceAsset).toEqual(resumed.sourceAsset);expect(returned.diagramSource).toEqual(resumed.diagramSource);
 expect(await page.evaluate(node=>node===document.querySelector('[data-cinematic-stage] canvas'),canvas)).toBe(true);await canvas.dispose();
 await capture(page,'bending-native-return-system');
 await page.setViewportSize({width:320,height:700});await nativeReading(page,'system',.50);
 const label=page.locator('[data-model-information-host="system"] [data-model-side-label][data-model-label-placement="native"]');
 await expect(label).toBeVisible();
 const labelGoal=await label.evaluate(el=>scrollY+el.getBoundingClientRect().top-100);
 await page.mouse.wheel(0,labelGoal-await page.evaluate(()=>scrollY));
 await page.waitForFunction(goal=>Math.abs(scrollY-goal)<=1,labelGoal,{timeout:WAIT});await settle(page);
 await page.waitForFunction(()=>{const r=window.__thesis.inspect().representation,l=document.querySelector('[data-model-information-host="system"] [data-source-label]');return r.chapterId==='system'&&l?.textContent===r.label;},null,{timeout:WAIT});
 const compact=await page.evaluate(()=>{
  const rect=el=>{const r=el.getBoundingClientRect();return {left:r.left,top:r.top,right:r.right,bottom:r.bottom};};
  return {brand:rect(document.querySelector('[data-home-link]')),label:rect(document.querySelector('[data-model-information-host="system"] [data-model-side-label]')),workflow:rect(document.querySelector('[data-story-chapter="system"] [data-source-diagram="workflow"]')),information:(()=>{
   const label=document.querySelector('[data-model-information-host="system"] [data-model-side-label]'),r=window.__thesis.inspect().representation;
   return {chapter:r.chapterId,source:r.id,title:label.querySelector('[data-source-label]').textContent,expectedTitle:r.label,description:label.querySelector('[data-model-caption-current]')?.textContent,expectedDescription:r.summary,textChecks:['[data-source-label]','[data-model-caption-current]','#model-study-help-system'].map(selector=>{const el=label.querySelector(selector),box=rect(el),hit=document.elementFromPoint((box.left+box.right)/2,(box.top+box.bottom)/2);return {selector,box,unoccluded:label.contains(hit)};})};
  })(),width:innerWidth,height:innerHeight,documentWidth:document.documentElement.scrollWidth};
 });
 expect(compact.label.bottom).toBeLessThanOrEqual(compact.workflow.top);
 expect(compact.information.chapter).toBe('system');expect(compact.information.title).toBe(compact.information.expectedTitle);expect(compact.information.description).toBe(compact.information.expectedDescription);
 for(const {box,unoccluded} of compact.information.textChecks){expect(unoccluded).toBe(true);expect(box.top).toBeGreaterThanOrEqual(0);expect(box.bottom).toBeLessThanOrEqual(compact.height);expect(box.left).toBeGreaterThanOrEqual(compact.label.left);expect(box.right).toBeLessThanOrEqual(compact.label.right);}
 expect(compact.label.left).toBeGreaterThanOrEqual(-1);expect(compact.label.top).toBeGreaterThanOrEqual(-1);expect(compact.label.right).toBeLessThanOrEqual(321);expect(compact.label.bottom).toBeLessThanOrEqual(701);expect(compact.documentWidth).toBeLessThanOrEqual(compact.width);
 await capture(page,'bending-scroll-source-label-320');
 await page.emulateMedia({reducedMotion:'reduce'});await settle(page);const preference=await facts(page);
 expect(preference.reduced).toBe(false);expect(preference.paused).toBe(false);expect(preference.recovery).toBe(false);
 const afterPreference=await nativeReading(page,'system',.70);expect(afterPreference.sourceVisible).toBe(true);
 expect(afterPreference.orientation.azimuthOffsetDeg).not.toBe(0);expect(afterPreference.sourceRevision).toBe(returned.sourceRevision);
 const receiptPath=test.info().outputPath('bending-scroll-receipts.json');
 await writeFile(receiptPath,JSON.stringify({receipts,idleStart,idleEnd,resumed,absence,returned,compact,preference,afterPreference},null,2));
 await test.info().attach('bending-scroll-receipts',{path:receiptPath,contentType:'application/json'});
});
