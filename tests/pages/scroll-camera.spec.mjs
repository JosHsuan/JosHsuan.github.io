import {test,expect} from '@playwright/test';
import {readFile,writeFile} from 'node:fs/promises';
import {WAIT,frames,scenarioTimeout} from './case-helpers.mjs';
const projects=JSON.parse(await readFile(new URL('../../roles/uiux-designer/cases/bending-active-thesis/release/project-studies.json',import.meta.url),'utf8')).projects.filter(project=>project.model);
test.use({video:'on'});
const facts=page=>page.evaluate(()=>{const d=window.__globalBackground.inspect().driver;return{scene:d.projectStudy.scene,chapters:d.projectStudy.chapters,activeSeconds:d.playback.activeSeconds,y:scrollY};});
async function nativeReading(page,chapter,progress,steps=1){
 const destination=await page.evaluate(({chapter,progress})=>{
  const nodes=[...document.querySelectorAll('[data-project-chapter]')],index=nodes.findIndex(n=>n.dataset.projectChapter===chapter),top=nodes[index].getBoundingClientRect().top+scrollY,end=(nodes[index+1]?.getBoundingClientRect().top??nodes[index].getBoundingClientRect().bottom)+scrollY;
  return Math.max(0,Math.min(document.documentElement.scrollHeight-innerHeight,top+(end-top)*progress-innerHeight*.5));
 },{chapter,progress});
 const y=await page.evaluate(()=>scrollY);await page.mouse.move(page.viewportSize().width*.5,page.viewportSize().height*.55);
 for(let step=1;step<=steps;step++){
  const goal=y+(destination-y)*step/steps,current=await page.evaluate(()=>scrollY);await page.mouse.wheel(0,goal-current);
  await page.waitForFunction(goal=>Math.abs(scrollY-goal)<=1,goal,{timeout:WAIT});
  if(steps>1)await frames(page,2); // preserve native scroll while recording intermediate authored views
 }
 await page.waitForFunction(({destination,chapter})=>{
  const s=window.__globalBackground?.inspect().driver.projectStudy?.scene,reading=s?.camera.reading;
  if(Math.abs(scrollY-destination)>1||reading?.chapter!==chapter||s.motion?.mode!=='hold'||!s.motion.settled||s.motion.chapter!==chapter||s.resource?.view.chapter!==chapter||!s.resource.successfulPaint)return false;
  // A ready model unhides normal-flow help. Observe the real layout/owner
  // agreement after that publication, not an arbitrary number of drain frames.
  const help=document.querySelector(`[data-project-model-help="${chapter}"]`);if(!help||help.hidden)return false;
  const nodes=[...document.querySelectorAll('[data-project-chapter]')],index=nodes.findIndex(node=>node.dataset.projectChapter===chapter),top=nodes[index].getBoundingClientRect().top+scrollY,end=(nodes[index+1]?.getBoundingClientRect().top??nodes[index].getBoundingClientRect().bottom)+scrollY;
  const expected=Math.max(0,Math.min(1,(scrollY+innerHeight*.5-top)/Math.max(1,end-top)));
  return reading.index===index&&Math.abs(reading.progress-expected)<=1e-9;
 },{destination,chapter},{timeout:WAIT});
 return facts(page);
}
for(const project of projects)test(`${project.shortTitle} scrolls the authored camera with independent idle and one retained source`,async({page})=>{
 test.setTimeout(scenarioTimeout(90000));
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 expect((await page.goto(`/projects/${project.slug}/`)).status()).toBe(200);
 await page.waitForFunction(()=>window.__site?.inspect().phase==='entered'&&!!window.__globalBackground?.inspect().driver.projectStudy?.scene,null,{timeout:WAIT});
 await page.mouse.click(8,page.viewportSize().height*.5); // native empty margin clears automatic entry focus
 const first=project.model.chapters[0],last=project.model.chapters.at(-1);
 const a=await nativeReading(page,first,.15),b=await nativeReading(page,first,.65,6);
 expect(Math.abs(b.scene.camera.intent.yawRad-a.scene.camera.intent.yawRad)).toBeGreaterThan(.02);
 expect(b.scene.camera.value).toEqual({azimuth:0,elevation:0});expect(b.scene.gesture).toBeNull();
 const c=await nativeReading(page,last,.65),reverse=await nativeReading(page,first,.15);
 expect(c.scene.camera.intent.yawRad).toBeGreaterThan(a.scene.camera.intent.yawRad+.05);
 expect(reverse.scene.camera.intent.yawRad).toBeCloseTo(a.scene.camera.intent.yawRad,1); // independent idle stays within ±.006 rad
 expect(reverse.scene.acquisitions).toBe(1);expect(reverse.scene.disposals).toBe(0);expect(reverse.scene.resource.sourceRevision).toBe(project.model.sha256);
 expect(reverse.scene.resource.supportPoints).toBe(8);expect(reverse.scene.resource.drawnMeshes).toBe(project.model.meshes);
 await page.waitForFunction(time=>window.__globalBackground.inspect().driver.projectStudy.scene.camera.activeSeconds>time+.15,reverse.scene.camera.activeSeconds,{timeout:WAIT});
 // Bounded observational receipts, not GPU duration or a physical-device FPS claim.
 const frameSamples=await page.evaluate(()=>new Promise(resolve=>{const rows=[];const read=now=>{const d=window.__globalBackground.inspect().driver,s=d.projectStudy.scene,r=s.resource;rows.push({now,draws:r.draws,cameraFits:r.cameraFits,activeSeconds:s.camera.activeSeconds,allocations:r.budget.allocations,pixels:r.budget.budget.width*r.budget.budget.height});if(rows.length===9)resolve(rows);else requestAnimationFrame(read);};requestAnimationFrame(read);}));
 const idle=await facts(page);expect(idle.y).toBe(reverse.y);expect(idle.scene.camera.reading).toEqual(reverse.scene.camera.reading);
 expect(idle.scene.resource.draws).toBeGreaterThan(reverse.scene.resource.draws);
 expect(new Set(frameSamples.map(row=>row.allocations)).size).toBe(1);for(const row of frameSamples)expect(row.pixels).toBeLessThanOrEqual(idle.scene.resource.pixelBudget);
 expect(Math.abs(idle.scene.camera.intent.yawRad-reverse.scene.camera.intent.yawRad)+Math.abs(idle.scene.camera.intent.pitchRad-reverse.scene.camera.intent.pitchRad)).toBeGreaterThan(1e-9);
 const screenshot=test.info().outputPath(`scroll-camera-${project.id}-${page.viewportSize().width}.png`);await page.screenshot({path:screenshot});await test.info().attach('authored-camera-source',{path:screenshot,contentType:'image/png'});
 const toggle=page.locator('[data-study-motion-toggle]');await toggle.click();await expect(toggle).toHaveAttribute('aria-pressed','true');await frames(page,2);
 const frozen=await facts(page);await frames(page,8);const still=await facts(page);
 expect(still.scene.camera.intent).toEqual(frozen.scene.camera.intent);expect(still.scene.resource.draws).toBe(frozen.scene.resource.draws);expect(still.activeSeconds).toBe(frozen.activeSeconds);
 await toggle.click();await expect(toggle).toHaveAttribute('aria-pressed','false');
 // Native empty-margin activation clears button focus without camera input.
 await page.mouse.click(8,page.viewportSize().height*.5);await nativeReading(page,first,.35);
 expect((await facts(page)).scene.camera.intent.yawRad).not.toBe(frozen.scene.camera.intent.yawRad);
 await page.emulateMedia({reducedMotion:'reduce'});await expect(page.locator('[data-project-study-canvas]')).toHaveCount(0);
 const reduced=await facts(page);expect(reduced.scene.arrivalStatic).toBe(true);expect(reduced.scene.resource).toBeNull();expect(reduced.scene.disposals).toBe(1);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);expect(errors).toEqual([]);
 const receipt=test.info().outputPath('camera-source-receipt.json');await writeFile(receipt,JSON.stringify({project:project.id,forward:a,advanced:b,last:c,reverse,idle,frameSamples,paused:frozen,reduced},null,2));await test.info().attach('camera-source-receipt',{path:receipt,contentType:'application/json'});
});
