import {test,expect} from '@playwright/test';
import {WAIT,scenarioTimeout,loadScene,settle,frames} from './case-helpers.mjs';
import {SCENE_RECOVERY_KEY} from '../../roles/uiux-designer/cases/bending-active-thesis/components/scene-recovery.mjs';

async function instrumentContexts(page){
  await page.addInitScript(()=>{
    const contexts=new Set();window.__recoveryContexts={attempts:0,canvases:0};
    const original=HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext=function(type,...args){
      if(/^webgl/.test(type)){window.__recoveryContexts.attempts++;contexts.add(this);window.__recoveryContexts.canvases=contexts.size;}
      return original.call(this,type,...args);
    };
  });
}

async function expectStaticReading(page){
  await page.waitForFunction(()=>window.__story?.inspect().entry.phase==='entered',null,{timeout:WAIT});await settle(page);
  await expect(page.locator('#project-title')).toHaveAccessibleName('Bending-Active Metal Panel Deformation');
  await expect(page.locator('[data-story-chapter]')).toHaveCount(7);
  await expect(page.locator('[data-cinematic-stage] canvas')).toHaveCount(0);
  await expect(page.locator('canvas[data-ascii-field]')).toHaveCount(1);
  await expect(page.getByRole('button',{name:/Enable|Retry|Pause|Resume/})).toHaveCount(0);
  expect(await page.evaluate(()=>window.__recoveryContexts)).toEqual({attempts:0,canvases:0});
  const before=await page.evaluate(()=>({time:window.__story.inspect().playback.activeSeconds,draws:window.__story.inspect().pageField.draws}));
  await page.locator('#system').evaluate(el=>{let y=0;for(let n=el;n;n=n.offsetParent)y+=n.offsetTop;scrollTo({top:y,behavior:'instant'});});await settle(page);
  await expect(page.locator('[data-chapter-link="system"]')).toHaveAttribute('aria-current','location');
  expect(await page.evaluate(()=>({chapter:window.__story.inspect().playback.chapterId,time:window.__story.inspect().playback.activeSeconds,draws:window.__story.inspect().pageField.draws}))).toEqual({chapter:'system',...before});
  const source=page.locator('[data-model-viewport][data-study-chapter="system"]');
  await expect(source).not.toHaveAttribute('role','button');
  await expect.poll(()=>source.locator('img').evaluate(image=>image.complete&&image.naturalWidth>0),{timeout:WAIT}).toBe(true);
  await page.waitForFunction(()=>!window.__story.inspect().scheduled,null,{timeout:WAIT});
  const held=await page.evaluate(()=>({controller:window.__story.inspect().controllerFrame,time:window.__story.inspect().playback.activeSeconds}));
  await frames(page,6);expect(await page.evaluate(()=>({controller:window.__story.inspect().controllerFrame,time:window.__story.inspect().playback.activeSeconds}))).toEqual(held);
}

// Synthetic WebGL context loss exercises the application fallback, not the
// owner's physical Safari process termination or its underlying cause.
test('context loss preserves inline reading and reload does not offer automatic or button-triggered retry',async({page})=>{
  test.setTimeout(scenarioTimeout(120000));
  await instrumentContexts(page);const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await loadScene(page);
  expect(await page.evaluate(()=>window.__recoveryContexts.canvases)).toBe(1);
  await page.evaluate(()=>window.__thesis.loseContext());
  await expect(page.locator('[data-cinematic-stage] canvas')).toHaveCount(0,{timeout:WAIT});
  await expect.poll(()=>page.evaluate(key=>JSON.parse(sessionStorage.getItem(key)).status,SCENE_RECOVERY_KEY)).toBe('failed');
  await settle(page);
  // Scene removal and fallback media can queue one final layout update after
  // reading settles. Await the empty controller queue before checking idleness.
  await page.waitForFunction(()=>!window.__story.inspect().scheduled,null,{timeout:WAIT});
  const sample=()=>page.evaluate(()=>{const story=window.__story.inspect();return{
    controller:story.controllerFrame,time:story.playback.activeSeconds,draws:story.pageField.draws,scheduled:story.scheduled,
  };});
  const held=await sample();await frames(page,8);expect(await sample()).toEqual(held);
  await page.reload();await expectStaticReading(page);
  expect(errors).toEqual([]);
});

test('a simulated unfinished scene lease blocks automatic reload without blocking semantic navigation',async({page})=>{
  test.setTimeout(scenarioTimeout(120000));
  await instrumentContexts(page);const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await loadScene(page);
  // Persist the lease after ordinary cleanup to model a process that never
  // completed pagehide. This is deliberately a lease simulation, not a crash.
  await page.evaluate(key=>window.addEventListener('pagehide',()=>sessionStorage.setItem(key,JSON.stringify({status:'active',at:Date.now()})),{once:true}),SCENE_RECOVERY_KEY);
  await page.reload();await expectStaticReading(page);
  expect(await page.evaluate(key=>JSON.parse(sessionStorage.getItem(key)).status,SCENE_RECOVERY_KEY)).toBe('active');
  await expect(page.getByRole('button')).toHaveCount(0);expect(errors).toEqual([]);
});

test('a known failed scene retains safe native reading after the uncertain-lease time window',async({page})=>{
  test.setTimeout(scenarioTimeout(120000));
  await instrumentContexts(page);
  await page.addInitScript(key=>{
    if(!sessionStorage.getItem(key))sessionStorage.setItem(key,JSON.stringify({status:'failed',at:Date.now()-31*60*1000}));
  },SCENE_RECOVERY_KEY);
  await page.goto('/projects/bending-active/#overview');await expectStaticReading(page);
});
