import {test,expect} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
import {WAIT,frames} from './case-helpers.mjs';

// Identical non-publishing baseline/candidate observer. No render hooks, GPU
// queries, screenshots, new clocks, or timeout overrides. Counters are CPU
// metadata; renderer.calls/triangles describe the last render, not GPU timing.
test('Full Bending native Pause service timing diagnostic',async({page,browserName},info)=>{
 const started=performance.now(),receipt={version:1,project:info.project.name,browserName,timeout:info.timeout,operations:[],samples:[],console:[],errors:[],phase:'start'};
 const elapsed=()=>performance.now()-started;
 const boundedPush=(list,value,max=32)=>{list.push(value);if(list.length>max)list.shift();};
 const onConsole=message=>boundedPush(receipt.console,{at:elapsed(),type:message.type(),text:message.text().slice(0,1200)});
 const onError=error=>boundedPush(receipt.errors,{at:elapsed(),message:String(error).slice(0,1200)});
 page.on('console',onConsole);page.on('pageerror',onError);
 async function operation(name,action){
  receipt.phase=name;const record={name,started:elapsed()};boundedPush(receipt.operations,record,128);
  try{const value=await action();record.completed=elapsed();return value;}catch(error){record.failed=elapsed();record.error=String(error).slice(0,1200);throw error;}
 }
 const snapshot=()=>page.evaluate(()=>{
  const scene=window.__thesis?.inspect(),story=window.__story?.inspect();
  const scalars=value=>value?Object.fromEntries(Object.entries(value).filter(([,v])=>v===null||['number','boolean','string'].includes(typeof v)).slice(0,32)):null;
  return{at:performance.now(),phase:window.__site?.inspect().phase,url:location.href,y:scrollY,viewport:{width:innerWidth,height:innerHeight,dpr:devicePixelRatio},mediaReduced:matchMedia('(prefers-reduced-motion: reduce)').matches,
   scene:scene?{ready:scene.ready,detail:scene.detail,systemReduced:scene.systemReduced,motionPaused:scene.motionPaused,hidden:scene.hidden,frames:scene.frames,rendererPendingFrames:scene.rendererPendingFrames,controllerFrame:scene.controllerFrame,renderedControllerFrame:scene.renderedControllerFrame,initialization:scalars(scene.initialization),source:scalars(scene.source),renderBudget:scalars(scene.renderBudget),renderPressure:scalars(scene.renderPressure),rendererBudget:{...scalars(scene.rendererBudget),budget:scalars(scene.rendererBudget?.budget)},renderer:scalars(scene.renderer),memory:scalars(scene.memory)}:null,
   story:story?{scheduled:story.scheduled,controllerFrame:story.controllerFrame,frameDelta:story.frameDelta,activeSeconds:story.playback?.activeSeconds,lifecycle:scalars(story.lifecycle),pageFieldDraws:story.pageField?.draws}:null};
 });
 const sample=async label=>{const value=await operation(label,snapshot);boundedPush(receipt.samples,{label,hostAt:elapsed(),value});return value;};
 let primaryError;
 try{
  const response=await operation('goto',()=>page.goto('/projects/bending-active/'));expect(response.status()).toBe(200);
  await operation('fonts',()=>page.evaluate(()=>document.fonts.ready));
  await operation('ready-poll',()=>expect.poll(async()=>{receipt.ready=await sample('ready-sample');return receipt.ready;},{timeout:WAIT}).toMatchObject({phase:'entered',mediaReduced:false,scene:{ready:true,detail:'full',systemReduced:false,motionPaused:false}}));
  const motion=page.locator('[data-bending-motion-toggle]');await operation('native-pause-click',()=>motion.click());
  await operation('paused-aria',()=>expect(motion).toHaveAttribute('aria-pressed','true'));
  receipt.paused=await sample('paused-state');expect(receipt.paused.scene.motionPaused).toBe(true);expect(receipt.paused.scene.systemReduced).toBe(false);expect(receipt.paused.scene.source).toEqual(receipt.ready.scene.source);
  expect(receipt.paused.story.activeSeconds).toBeGreaterThan(receipt.ready.story.activeSeconds);
  await operation('five-existing-raf',()=>frames(page,5));receipt.frozen=await sample('frozen-state');
  expect(receipt.frozen.story.activeSeconds).toBe(receipt.paused.story.activeSeconds);expect(receipt.frozen.scene.motionPaused).toBe(true);expect(receipt.frozen.scene.source).toEqual(receipt.paused.scene.source);expect(receipt.frozen.y).toBe(receipt.paused.y);
  receipt.outcome='passed';receipt.phase='complete';
 }catch(error){primaryError=error;receipt.outcome='failed';receipt.failurePhase=receipt.phase;receipt.error=String(error).slice(0,1600);throw error;}
 finally{
  receipt.finished=elapsed();page.off('console',onConsole);page.off('pageerror',onError);
  try{const path=info.outputPath('bending-service-diagnostic.json');await writeFile(path,JSON.stringify(receipt,null,2));await info.attach('bending-service-diagnostic',{path,contentType:'application/json'});}catch(error){if(!primaryError)throw error;}
 }
});
