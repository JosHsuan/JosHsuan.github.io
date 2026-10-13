import {chromium} from '@playwright/test';
import {readFile,writeFile,mkdir,access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';

assert.equal(process.version,'v24.19.0','Use the exact committed Node 24.19.0');
const dir=fileURLToPath(new URL('.',import.meta.url)),repo=path.resolve(dir,'../../../../..'),out=path.join(dir,'.local/window-verification');
await mkdir(out,{recursive:true});
const checks=[],errors=[],hash=bytes=>createHash('sha256').update(bytes).digest('hex'),base='http://127.0.0.1:4198';
const artifactSHA256=hash(await readFile(path.join(dir,'dist/app.js')));
const get=page=>page.evaluate(()=>window.__effectDesk.inspect().detail);
const completed=page=>page.waitForFunction(()=>{const d=window.__effectDesk.inspect().detail;return d.state==='completed'&&!d.scheduled&&d.kinetic.resting;},{},{timeout:7000});
const arrived=(page,region)=>page.waitForFunction(expected=>{const d=window.__effectDesk.inspect().detail;return d.region===expected&&d.state==='completed'&&!d.scheduled&&d.kinetic.resting;},region,{timeout:7000});
const record=(type,details={})=>{checks.push({type,...details,passed:true});console.log('input checked',type,details.id??'');};
async function load(page,layer,id){
 await page.goto(base+'/'+layer+'/#'+id);
 await page.waitForFunction(()=>window.__effectDesk?.inspect().detail?.ready);
 await page.locator('.vt-scroll').scrollIntoViewIfNeeded();
 assert.equal((await get(page)).effect,id);
}
const browser=await chromium.launch(),context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage();
page.on('pageerror',e=>errors.push(e.message));
page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
try{
 for(const [layer,id] of [['3d','window-3d-tension'],['2d','window-2d-paper']]){
  await load(page,layer,id);await page.evaluate(()=>window.__effectDesk.reset());
  const rect=await page.locator('.vt-scroll').boundingBox();await page.mouse.move(rect.x+rect.width/2,rect.y+rect.height/2);
  await page.mouse.wheel(0,230);await arrived(page,'inside');await page.mouse.wheel(0,490);await arrived(page,'after');await page.mouse.wheel(0,-380);await arrived(page,'inside');
  record('native wheel enter / exit / reverse',{id});
  await page.locator('.vt-scroll').focus();await page.keyboard.press('End');await arrived(page,'after');await page.keyboard.press('Home');await arrived(page,'before');
  record('native keyboard scroll boundaries',{id});

  const replayOperation=await page.evaluate(()=>{window.__effectDesk.play();return window.__effectDesk.inspect().detail.operationId;});
  await page.waitForTimeout(150);await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
  const frozen=await get(page);assert.equal(frozen.scheduled,false);await page.waitForTimeout(220);const stillFrozen=await get(page);
  assert.deepEqual(stillFrozen.pose,frozen.pose);assert.deepEqual(stillFrozen.kinetic,frozen.kinetic);assert.equal(stillFrozen.frames,frozen.frames);
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'));});
  await page.waitForFunction(operation=>{const d=window.__effectDesk.inspect().detail;return d.events.some(e=>e.type==='replay:complete'&&e.operationId>=operation)&&d.operationId>=operation&&d.replay===null&&d.state==='completed'&&!d.scheduled&&d.kinetic.resting;},replayOperation,{timeout:8500});
  const replayEnd=await get(page);assert.equal(replayEnd.region,'after');await page.waitForTimeout(120);assert.equal((await get(page)).frames,replayEnd.frames);
  record('hidden freezes / current replay completes / no idle frames',{id,replayOperation,completedOperation:replayEnd.operationId});

  // Synchronous force samples share the same active time: neither has advanced.
  const forces=await page.evaluate(()=>{
   document.querySelector('[data-force="soft"]').click();const soft=window.__effectDesk.inspect().detail;window.__effectDesk.pause();
   document.querySelector('[data-force="strong"]').click();const strong=window.__effectDesk.inspect().detail;window.__effectDesk.pause();return {soft,strong};
  });
  assert.equal(forces.soft.kinetic.progress,forces.strong.kinetic.progress);assert.deepEqual(forces.soft.pose,forces.strong.pose);
  assert.ok(forces.strong.kinetic.velocity>forces.soft.kinetic.velocity*3);assert.ok(forces.strong.kinetic.energy>forces.soft.kinetic.energy*3);
  record('soft / strong at the same initial active time',{id,soft:{velocity:forces.soft.kinetic.velocity,energy:forces.soft.kinetic.energy},strong:{velocity:forces.strong.kinetic.velocity,energy:forces.strong.kinetic.energy}});

  await page.evaluate(()=>window.__effectDesk.play());await arrived(page,'inside');
  // Native wheel is covered above; synchronous scroll events isolate the impulse
  // sign from elapsed spring motion and the browser's wheel-event coalescing.
  const impulses=await page.evaluate(()=>{
   const viewport=document.querySelector('.vt-scroll'),max=viewport.scrollHeight-viewport.clientHeight,before=window.__effectDesk.inspect().detail;
   viewport.scrollTop=max*.49;viewport.dispatchEvent(new Event('scroll'));const forward=window.__effectDesk.inspect().detail;
   viewport.scrollTop=max*.45;viewport.dispatchEvent(new Event('scroll'));const backward=window.__effectDesk.inspect().detail;
   window.__effectDesk.pause();return {before,forward,backward};
  });
  assert.equal(impulses.forward.region,'inside');assert.equal(impulses.backward.region,'inside');
  assert.equal(impulses.forward.inputDirection,1);assert.equal(impulses.backward.inputDirection,-1);
  const positive=impulses.forward.kinetic.velocity-impulses.before.kinetic.velocity,negative=impulses.backward.kinetic.velocity-impulses.forward.kinetic.velocity;
  assert.ok(positive>0,'downward same-region impulse must be positive');assert.ok(negative<0,'reverse same-region impulse must be negative');
  record('same-region reverse scroll changes the impulse sign',{id,positive,negative});

  await page.evaluate(()=>window.__effectDesk.play());await completed(page);await page.mouse.move(30,30);await completed(page);
  const neutral=await get(page),box=await page.locator('.vt-scroll').boundingBox();
  await page.mouse.move(box.x+box.width*.83,box.y+box.height*.70);
  await page.waitForFunction(()=>{const d=window.__effectDesk.inspect().detail;return d.kinetic.pointer.x>.2&&Math.abs(d.pose.x)>1;});
  const pulled=await get(page);assert.notDeepEqual(pulled.pose,neutral.pose);await page.mouse.move(30,30);await completed(page);
  const released=await get(page);assert.equal(released.kinetic.pointer.x,0);assert.equal(released.kinetic.pointer.y,0);assert.deepEqual(released.pose,neutral.pose);
  record('real pointer pulls the window / leave settles to neutral',{id,pulledX:pulled.pose.x,pulledY:pulled.pose.y});

  await page.evaluate(()=>document.querySelector('[data-force="strong"]').click());await page.waitForTimeout(100);assert.equal((await get(page)).scheduled,true);
  await page.emulateMedia({reducedMotion:'reduce'});await arrived(page,'inside');const reduced=await get(page);
  assert.equal(reduced.kinetic.velocity,0);assert.equal(reduced.kinetic.energy,0);assert.equal(reduced.scheduled,false);await page.waitForTimeout(120);assert.equal((await get(page)).frames,reduced.frames);
  await page.emulateMedia({reducedMotion:'no-preference'});record('live Reduced cancels active motion and pending frames',{id});

  await page.evaluate(()=>{window.__effectDesk.seek(.5);document.querySelector('.vt-scroll').scrollTop=0;});await page.waitForTimeout(100);
  assert.equal((await get(page)).region,'inspect');assert.equal((await get(page)).intent,'idle');assert.equal((await get(page)).scheduled,false);
  await page.screenshot({path:path.join(out,'desktop-'+layer+'.png'),fullPage:true});record('phase inspection survives incidental scrolling',{id});
 }

 // Atomic reversal covers every curved/folded mask and the fixed corner origin.
 for(const [layer,id] of [['3d','window-3d-membrane'],['3d','window-3d-fold'],['2d','window-2d-ink'],['2d','window-2d-corner']]){
  await load(page,layer,id);await page.getByRole('button',{name:'離開視野',exact:true}).click();await page.waitForTimeout(110);
  const turn=await page.evaluate(()=>{
   const node=document.querySelector('.vt-window'),capture=()=>({detail:window.__effectDesk.inspect().detail,clipPath:getComputedStyle(node).clipPath,origin:getComputedStyle(node).transformOrigin,transform:getComputedStyle(node).transform});
   const before=capture();document.querySelector('[data-action="return"]').click();const after=capture();return {before,after};
  });
  assert.equal(turn.before.detail.intent,'exit');assert.equal(turn.after.detail.intent,'enter');assert.deepEqual(turn.after.detail.pose,turn.before.detail.pose);
  assert.equal(turn.after.clipPath,turn.before.clipPath);assert.equal(turn.after.origin,turn.before.origin);assert.equal(turn.after.transform,turn.before.transform);
  assert.equal(turn.after.detail.kinetic.progress,turn.before.detail.kinetic.progress);assert.equal(turn.after.detail.kinetic.velocity,turn.before.detail.kinetic.velocity);
  assert.ok(turn.after.detail.operationId>turn.before.detail.operationId);await arrived(page,'inside');
  record('mid-flight reversal preserves pose / clip-path / origin / momentum',{id,clipPath:turn.before.clipPath,origin:turn.before.origin});
 }

 await page.emulateMedia({reducedMotion:'reduce'});await load(page,'3d','window-3d-orbit');
 await page.getByRole('button',{name:'離開視野',exact:true}).click();assert.equal((await get(page)).scheduled,false);assert.equal(await page.locator('.vt-window').getAttribute('aria-hidden'),'true');
 await page.getByRole('button',{name:'進入視野',exact:true}).click();assert.equal((await get(page)).scheduled,false);
 await page.evaluate(()=>window.__effectDesk.play());assert.equal((await get(page)).state,'running');assert.equal((await get(page)).scheduled,true);
 await page.evaluate(()=>window.__effectDesk.pause());record('Reduced native static and explicit replay');

 await page.evaluate(async()=>{await Promise.all(['window-3d-tension','window-3d-orbit','window-3d-membrane','window-3d-fold','window-3d-flythrough'].map(id=>window.__effectDesk.select(id)));});
 assert.equal(await page.locator('.vt-lab').count(),1);assert.equal(await page.locator('#stage canvas').count(),1);assert.equal((await get(page)).effect,'window-3d-flythrough');assert.equal(await page.evaluate(()=>window.__effectDesk.inspect().errorCount),0);
 record('rapid replacement / single canvas');

 const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),touch=await mobile.newPage();touch.on('pageerror',e=>errors.push(e.message));touch.on('console',message=>{if(message.type()==='error')errors.push(message.text());});const cdp=await mobile.newCDPSession(touch);
 for(const [layer,id] of [['3d','window-3d-flythrough'],['2d','window-2d-relay']]){
  await load(touch,layer,id);await touch.evaluate(()=>window.__effectDesk.reset());await touch.waitForTimeout(150);
  const box=await touch.locator('.vt-scroll').boundingBox(),x=box.x+box.width*.5,y=box.y+box.height*.82,point=py=>({x,y:py,id:1,radiusX:2,radiusY:2,force:1});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[point(y)]});
  for(let i=1;i<=6;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[point(y-i*28)]});await touch.waitForTimeout(55);}
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await touch.waitForFunction(()=>window.__effectDesk.inspect().detail.enters>0);assert((await get(touch)).scrollProgress>.18);
  await touch.evaluate(()=>window.__effectDesk.seek(.5));await touch.screenshot({path:path.join(out,'mobile-'+layer+'.png'),fullPage:true});record('real touch scroll triggers entry',{id});
 }
 await mobile.close();

 const release=JSON.parse(await readFile(path.join(dir,'../release/manifest.json'),'utf8'));
 for(const asset of release.assets){const response=await fetch(base+'/'+asset.path);assert.equal(response.status,200);assert.equal(hash(Buffer.from(await response.arrayBuffer())),asset.sha256);}
 const sources=JSON.parse(await readFile(path.join(dir,'dist/source-manifest.json'),'utf8'));
 for(const [file,sha] of Object.entries(sources.hashes)){assert(!file.includes('/animation-review/'),'Production-source manifest must exclude the local catalog');assert.equal(hash(await readFile(path.join(repo,file))),sha);}
 for(const file of ['prototypes-2d.mjs','prototypes-2d.css','prototypes-3d.mjs'])await assert.rejects(()=>access(path.join(dir,file)));
 const expected=['tension','orbit','membrane','fold','flythrough'].map(id=>'window-3d-'+id).concat(['paper','glide','ink','corner','relay'].map(id=>'window-2d-'+id)),catalog=[];
 for(const layer of ['3d','2d']){await page.goto(base+'/'+layer+'/');await page.waitForFunction(()=>window.__effectDesk?.inspect().detail?.ready);catalog.push(...await page.evaluate(()=>window.__effectDesk.catalog().filter(e=>e.availability==='proposal').map(e=>e.id)));}
 assert.deepEqual(catalog.sort(),expected.sort());
 assert.equal(hash(await readFile(path.join(dir,'dist/app.js'))),artifactSHA256,'artifact must not change during verification');
 const served=await fetch(base+'/app.js');assert.equal(served.status,200);assert.equal(hash(Buffer.from(await served.arrayBuffer())),artifactSHA256);
 assert.deepEqual(errors,[]);
 await writeFile(path.join(out,'input.json'),JSON.stringify({passed:true,verifiedAt:new Date().toISOString(),artifactSHA256,approvedAssets:release.assets.length,sourceModules:Object.keys(sources.hashes).length,checks,errors},null,2));
 console.log('Window input and delivery verified',checks.length);
}catch(error){
 await writeFile(path.join(out,'input.json'),JSON.stringify({passed:false,verifiedAt:new Date().toISOString(),artifactSHA256,checks,errors,failure:error.message,lastDetail:await get(page).catch(()=>null)},null,2));
 throw error;
}finally{await browser.close();}
