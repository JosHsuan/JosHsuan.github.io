import {chromium,webkit} from '@playwright/test';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const out=new URL('.local/scroll-verification/',import.meta.url);await mkdir(out,{recursive:true});
const hash=async()=>createHash('sha256').update(await readFile(new URL('dist/app.js',import.meta.url))).digest('hex'),artifactSHA256=await hash(),rows=[],errors=[];
for(const [engine,type] of [['chromium',chromium],['webkit',webkit]]){
 const b=await type.launch(),p=await b.newPage({viewport:{width:1440,height:1000}});p.on('pageerror',e=>errors.push(e.message));
 try{for(const [layer,id] of [['3d','window-3d-membrane'],['3d','window-3d-ink'],['2d','window-2d-membrane'],['2d','window-2d-ink']]){
  await p.goto(`http://127.0.0.1:4198/${layer}/#${id}`);await p.waitForFunction(()=>window.__effectDesk?.inspect().detail?.ready);await p.locator('#stage').scrollIntoViewIfNeeded();
  const forces={};
  for(const kind of ['soft','strong'])forces[kind]=await p.evaluate(kind=>new Promise(resolve=>{
   document.querySelector(`[data-force="${kind}"]`).click();let maxVelocity=0,maxLag=0,frames=0;
   function sample(){const d=window.__effectDesk.inspect().detail;maxVelocity=Math.max(maxVelocity,Math.abs(d.kinetic.velocity));maxLag=Math.max(maxLag,Math.abs(d.kinetic.progress-d.kinetic.target));frames++;if(d.state==='completed'&&!d.scheduled)resolve({maxVelocity,maxLag,frames});else requestAnimationFrame(sample);}sample();
  }),kind);
  assert(forces.strong.maxVelocity>forces.soft.maxVelocity*1.3);assert(forces.strong.maxLag>forces.soft.maxLag*1.3);
  // Physical wheel input interrupts scripted travel and keeps the resulting
  // intermediate native position rather than finishing the old destination.
  await p.getByRole('button',{name:'離開視野',exact:true}).click();await p.waitForTimeout(180);
  const r=await p.locator('.vt-scroll').boundingBox();await p.mouse.move(r.x+r.width/2,r.y+r.height/2);await p.mouse.wheel(0,-100);await p.mouse.move(0,0);
  await p.waitForFunction(()=>{const d=window.__effectDesk.inspect().detail;return d.travel===null&&d.kinetic.resting&&!d.scheduled;});const interrupted=await p.evaluate(()=>window.__effectDesk.inspect().detail);assert(interrupted.scrollProgress<.9);assert(interrupted.visible);await p.waitForTimeout(250);assert.equal(await p.evaluate(()=>window.__effectDesk.inspect().detail.scrollProgress),interrupted.scrollProgress);
  // Host visibility suspension freezes the active-time demo and elastic state.
  await p.evaluate(()=>window.__effectDesk.play());await p.waitForTimeout(180);await p.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
  const a=await p.evaluate(()=>window.__effectDesk.inspect().detail);await p.waitForTimeout(200);const c=await p.evaluate(()=>window.__effectDesk.inspect().detail);assert.equal(c.frames,a.frames);assert.deepEqual(c.pose,a.pose);assert.deepEqual(c.travel,a.travel);assert.equal(c.scrollProgress,a.scrollProgress);
  await p.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'));});await p.waitForFunction(()=>{const d=window.__effectDesk.inspect().detail;return d.events.some(e=>e.type==='replay:complete')&&!d.scheduled;},{},{timeout:11000});
  await p.evaluate(()=>window.__effectDesk.seek(.8));const at=await p.evaluate(()=>window.__effectDesk.inspect().detail);assert.equal(at.mode,'timeline');assert(at.visible);assert.equal(at.pose.alpha,1);await p.waitForTimeout(120);assert.equal(await p.evaluate(()=>window.__effectDesk.inspect().detail.frames),at.frames);
  rows.push({engine,id,passed:true,forces,interrupted,visibilityFrozen:true,stationaryPosition:true});console.log('scroll controls checked',engine,id);
 }}finally{await b.close();}
}
assert.deepEqual(errors,[]);assert.equal(await hash(),artifactSHA256);await writeFile(new URL('controls.json',out),JSON.stringify({passed:true,artifactSHA256,verifiedAt:new Date().toISOString(),rows,errors},null,2));
