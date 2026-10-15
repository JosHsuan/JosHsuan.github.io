import {chromium,webkit} from '@playwright/test';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const out=new URL('.local/scroll-verification/',import.meta.url);await mkdir(out,{recursive:true});
const hash=async()=>createHash('sha256').update(await readFile(new URL('dist/app.js',import.meta.url))).digest('hex'),artifactSHA256=await hash(),rows=[],errors=[];
const settled=p=>p.waitForFunction(()=>{const d=window.__effectDesk.inspect().detail;return !d.travel&&d.kinetic.resting&&!d.scheduled;});
const positionMatches=p=>p.evaluate(()=>{const percent=Math.round(window.__effectDesk.inspect().detail.scrollProgress*100);return document.querySelector('#phase').value===String(percent)&&document.querySelector('#phase-value').textContent===percent+'%';});
await Promise.all([['chromium',chromium],['webkit',webkit]].map(async([engine,type])=>{
 const b=await type.launch(),p=await b.newPage({viewport:{width:1440,height:1000}});p.on('pageerror',e=>errors.push(e.message));
 try{for(const [layer,id] of [['3d','window-3d-membrane'],['3d','window-3d-ink'],['2d','window-2d-membrane'],['2d','window-2d-ink']]){
  await p.goto(`http://127.0.0.1:4198/${layer}/#${id}`);await p.waitForFunction(()=>window.__effectDesk?.inspect().detail?.ready);await p.locator('#stage').scrollIntoViewIfNeeded();
  // Native travel and the external position control describe the same page.
  for(const progress of [.2,.8,0,1]){
   await p.evaluate(progress=>{const v=document.querySelector('.vt-scroll');v.scrollTop=(v.scrollHeight-v.clientHeight)*progress;v.dispatchEvent(new Event('scroll'));},progress);
   await settled(p);assert(await positionMatches(p));
   await p.getByRole('button',{name:'返回視窗',exact:true}).click();await settled(p);
   assert.equal(await p.evaluate(()=>window.__effectDesk.inspect().detail.scrollProgress),.5);assert(await positionMatches(p));
  }
  // At either native edge, residual elasticity still keeps a painted strip in
  // view. A viewport leave fact must wait until that strip actually leaves.
  for(const side of ['after','before']){
   const boundary=await p.evaluate(side=>new Promise(resolve=>{
    const before=window.__effectDesk.inspect().detail.exits,v=document.querySelector('.vt-scroll'),a=document.querySelector('.vt-window').getBoundingClientRect(),b=v.getBoundingClientRect();
    // Intrinsic information content can size its grid track differently from
    // the model. Cross the measured edge, not an assumed percentage.
    v.scrollTop+=side==='after'?a.bottom-b.top+4:a.top-b.bottom-4;v.dispatchEvent(new Event('scroll'));
    requestAnimationFrame(()=>{const d=window.__effectDesk.inspect().detail;resolve({before,exits:d.exits,visible:d.visible,region:d.region});});
   }),side);
   assert(boundary.visible,`${engine} ${id} ${side}: elastic strip remains visible`);assert.equal(boundary.exits,boundary.before);
   await settled(p);const outside=await p.evaluate(()=>window.__effectDesk.inspect().detail);
   assert(!outside.visible);assert.equal(outside.exits,boundary.before+1);assert(await positionMatches(p));
   const fact=outside.events.filter(e=>e.type==='viewport:leave').at(-1);assert.equal(fact.visible,false);
   await p.getByRole('button',{name:'返回視窗',exact:true}).click();await settled(p);
  }
  const forces={};
  for(const kind of ['soft','strong'])forces[kind]=await p.evaluate(kind=>new Promise(resolve=>{
   document.querySelector(`[data-force="${kind}"]`).click();let maxVelocity=0,maxLag=0,frames=0;
   function sample(){const d=window.__effectDesk.inspect().detail;maxVelocity=Math.max(maxVelocity,Math.abs(d.kinetic.velocity));maxLag=Math.max(maxLag,Math.abs(d.kinetic.progress-d.kinetic.target));frames++;if(d.state==='completed'&&!d.scheduled)resolve({maxVelocity,maxLag,frames});else requestAnimationFrame(sample);}sample();
  }),kind);
  assert(forces.strong.maxVelocity>forces.soft.maxVelocity*1.3);assert(forces.strong.maxLag>forces.soft.maxLag*1.3);
  // Physical wheel input interrupts scripted travel and keeps the resulting
  // intermediate native position rather than finishing the old destination.
  await p.getByRole('button',{name:'離開視野',exact:true}).click();await p.waitForTimeout(180);
  const interruptedOperation=await p.evaluate(()=>window.__effectDesk.inspect().detail.operationId);
  const r=await p.locator('.vt-scroll').boundingBox();await p.mouse.move(r.x+r.width/2,r.y+r.height/2);await p.mouse.wheel(0,-100);await p.mouse.move(0,0);
  await p.waitForFunction(()=>{const d=window.__effectDesk.inspect().detail;return d.travel===null&&d.kinetic.resting&&!d.scheduled;});const interrupted=await p.evaluate(()=>window.__effectDesk.inspect().detail);assert(interrupted.scrollProgress<.9);assert(interrupted.visible);await p.waitForTimeout(250);assert.equal(await p.evaluate(()=>window.__effectDesk.inspect().detail.scrollProgress),interrupted.scrollProgress);
  assert(!interrupted.events.some(e=>e.operationId===interruptedOperation&&e.type==='exit:complete'),'an interrupted exit must not complete while its content remains visible');
  // Host visibility suspension freezes the active-time demo and elastic state.
  await p.evaluate(()=>window.__effectDesk.play());await p.waitForTimeout(180);await p.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
  const a=await p.evaluate(()=>window.__effectDesk.inspect().detail);await p.waitForTimeout(200);const c=await p.evaluate(()=>window.__effectDesk.inspect().detail);assert.equal(c.frames,a.frames);assert.deepEqual(c.pose,a.pose);assert.deepEqual(c.travel,a.travel);assert.equal(c.scrollProgress,a.scrollProgress);
  await p.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'));});await p.waitForFunction(()=>{const d=window.__effectDesk.inspect().detail;return d.events.some(e=>e.type==='replay:complete')&&!d.scheduled;},{},{timeout:11000});
  await p.evaluate(()=>window.__effectDesk.seek(.8));const at=await p.evaluate(()=>window.__effectDesk.inspect().detail);assert.equal(at.mode,'timeline');assert(at.visible);assert.equal(at.pose.alpha,1);assert(await positionMatches(p));await p.waitForTimeout(120);assert.equal(await p.evaluate(()=>window.__effectDesk.inspect().detail.frames),at.frames);
  await p.mouse.move(r.x+r.width/2,r.y+r.height/2);await p.mouse.wheel(0,-100);await p.mouse.move(0,0);await p.waitForFunction(()=>window.__effectDesk.inspect().detail.mode==='scroll');await settled(p);assert(await positionMatches(p));
  rows.push({engine,id,passed:true,forces,interrupted,visibilityFrozen:true,stationaryPosition:true,positionSynchronized:true,contentBoundaryEvents:true,interruptedExitRemainsVisible:true});console.log('scroll controls checked',engine,id);
 }}finally{await b.close();}
}));
assert.deepEqual(errors,[]);assert.equal(await hash(),artifactSHA256);await writeFile(new URL('controls.json',out),JSON.stringify({passed:true,artifactSHA256,verifiedAt:new Date().toISOString(),rows,errors},null,2));
