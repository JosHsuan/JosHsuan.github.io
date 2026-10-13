import {chromium,webkit} from '@playwright/test';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const dir=new URL('./',import.meta.url),out=new URL('.local/scroll-verification/',dir);await mkdir(out,{recursive:true});
const hash=async()=>createHash('sha256').update(await readFile(new URL('dist/app.js',dir))).digest('hex');
const artifactSHA256=await hash(),rows=[],errors=[],controls=[];
const get=page=>page.evaluate(()=>{
 const d=window.__effectDesk.inspect().detail,n=document.querySelector('.vt-window'),v=document.querySelector('.vt-scroll'),a=n.getBoundingClientRect(),b=v.getBoundingClientRect();
 return {d,box:{top:a.top,bottom:a.bottom},view:{top:b.top,bottom:b.bottom},opacity:getComputedStyle(n).opacity,clip:getComputedStyle(n).clipPath,inert:n.inert};
});
const settled=page=>page.waitForFunction(()=>{const d=window.__effectDesk.inspect().detail;return !d.travel&&d.kinetic.resting&&!d.scheduled;},{},{timeout:7000});
const move=(page,value)=>page.evaluate(p=>{const v=document.querySelector('.vt-scroll');v.scrollTop=(v.scrollHeight-v.clientHeight)*p;v.dispatchEvent(new Event('scroll'));},value);
const opaque=s=>{assert.equal(s.opacity,'1');assert.equal(s.d.pose.alpha,1);assert.equal(s.d.pose.cut,1);assert.equal(s.d.pose.aperture,0);};
await Promise.all([['chromium',chromium,false],['webkit',webkit,false],['mobile-chromium',chromium,true]].map(async([engine,type,mobile])=>{
 const browser=await type.launch(),context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1440,height:1000},isMobile:mobile,hasTouch:mobile}),page=await context.newPage();
 page.on('pageerror',e=>errors.push({engine,message:e.message}));page.on('console',e=>{if(e.type()==='error')errors.push({engine,message:e.text()});});
 try{
  for(const layer of ['3d','2d']){
   await page.goto(`http://127.0.0.1:4198/${layer}/`);await page.waitForFunction(()=>window.__effectDesk?.inspect().detail?.ready);
   const effects=await page.evaluate(()=>window.__effectDesk.catalog().filter(e=>e.availability==='proposal'));assert.equal(effects.length,2);assert.deepEqual(effects.map(e=>e.key).sort(),['ink','membrane']);
   for(const effect of effects){
    await page.evaluate(id=>window.__effectDesk.select(id),effect.id);await page.locator('#stage').scrollIntoViewIfNeeded();await page.waitForTimeout(60);
    const initial=await get(page),bitmap=layer==='3d'?await page.locator('#stage canvas').evaluate(c=>c.toDataURL()):null;opaque(initial);assert(initial.d.visible);
    await move(page,.8);await page.waitForTimeout(110);const moving=await get(page);opaque(moving);assert(moving.d.scheduled,'native scroll must wake elastic feedback');assert(moving.d.kinetic.corners.some(c=>Math.abs(c.error)>.001));
    await settled(page);const partial=await get(page);opaque(partial);assert(partial.d.visible);assert(partial.box.top<partial.view.top&&partial.box.bottom>partial.view.top&&partial.box.bottom<partial.view.bottom,'80% must retain the bottom portion at the upper viewport edge');assert.equal(partial.clip,'inset(0px round 18px)');
    await page.waitForTimeout(180);const held=await get(page);assert.equal(held.d.frames,partial.d.frames);assert.deepEqual(held.box,partial.box);assert.equal(held.d.scrollProgress,partial.d.scrollProgress);assert(held.d.visible);
    await page.locator('#stage').screenshot({path:new URL(`${engine}-${effect.id}-partial.png`,out).pathname.replace(/^\/([A-Z]:)/,'$1')});
    await move(page,1);await settled(page);const outside=await get(page);opaque(outside);assert(outside.box.bottom<=outside.view.top);assert(!outside.d.visible&&outside.inert);
    await move(page,.5);await page.waitForTimeout(90);const momentum=await page.evaluate(()=>{const v=document.querySelector('.vt-scroll'),before=window.__effectDesk.inspect().detail.kinetic;v.scrollTop=(v.scrollHeight-v.clientHeight)*.7;v.dispatchEvent(new Event('scroll'));const after=window.__effectDesk.inspect().detail.kinetic;return {before,after};});
    assert.equal(momentum.after.velocity,momentum.before.velocity);assert.deepEqual(momentum.after.corners,momentum.before.corners);await settled(page);assert((await get(page)).d.visible);
    await move(page,0);await settled(page);const below=await get(page);opaque(below);assert(below.box.top>=below.view.bottom);assert(!below.d.visible);
    await page.emulateMedia({reducedMotion:'reduce'});await move(page,.5);await settled(page);const reduced=await get(page);opaque(reduced);assert(reduced.d.visible);assert.equal(reduced.d.pose.y,0);assert.equal(reduced.d.kinetic.velocity,0);await page.emulateMedia({reducedMotion:'no-preference'});
    if(layer==='3d'){assert.deepEqual(reduced.d.model.camera,initial.d.model.camera);assert.equal(reduced.d.model.frames,initial.d.model.frames);assert.equal(await page.locator('#stage canvas').evaluate(c=>c.toDataURL()),bitmap);}
    assert.equal(await page.locator('#stage canvas').count(),layer==='3d'?1:0);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    rows.push({engine,id:effect.id,passed:true,moving,partial,outside,below});console.log('scroll checked',engine,effect.id);
   }
  }
  // Native input and lifecycle are checked on the last loaded information window.
  await page.locator('.vt-scroll').focus();await page.keyboard.press('End');await page.waitForFunction(()=>window.__effectDesk.inspect().detail.scrollProgress===1);await settled(page);await page.keyboard.press('Home');await page.waitForFunction(()=>window.__effectDesk.inspect().detail.scrollProgress===0);await settled(page);
  if(!mobile){const r=await page.locator('.vt-scroll').boundingBox();await page.mouse.move(r.x+r.width/2,r.y+r.height/2);await page.mouse.wheel(0,280);await page.waitForFunction(()=>window.__effectDesk.inspect().detail.scrollProgress>.2);await page.mouse.move(0,0);await settled(page);assert((await get(page)).d.visible);}
  else{const cdp=await context.newCDPSession(page),r=await page.locator('.vt-scroll').boundingBox(),point=y=>({x:r.x+r.width*.5,y,id:1,radiusX:2,radiusY:2,force:1}),y=r.y+r.height*.85;await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[point(y)]});for(let i=1;i<=6;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[point(y-25*i)]});await page.waitForTimeout(45);}await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForFunction(()=>window.__effectDesk.inspect().detail.scrollProgress>.1);await settled(page);}
  await page.getByRole('button',{name:'離開視野',exact:true}).click();await page.waitForTimeout(130);await page.evaluate(()=>window.__effectDesk.pause());const frozen=await get(page);await page.waitForTimeout(180);const frozenAgain=await get(page);assert.deepEqual(frozenAgain.d.pose,frozen.d.pose);assert.equal(frozenAgain.d.scrollProgress,frozen.d.scrollProgress);assert.equal(frozenAgain.d.frames,frozen.d.frames);await page.evaluate(()=>window.__effectDesk.play());await settled(page);
  await page.getByRole('button',{name:'向上重播',exact:true}).click();await page.waitForFunction(()=>{const d=window.__effectDesk.inspect().detail;return d.events.some(e=>e.type==='replay:complete')&&!d.scheduled&&d.kinetic.resting;},{},{timeout:11000});assert.equal((await get(page)).d.scrollProgress,0);
  await page.getByRole('button',{name:'快推',exact:true}).click();await page.waitForTimeout(140);await page.emulateMedia({reducedMotion:'reduce'});await settled(page);const changed=await get(page);opaque(changed);assert.equal(changed.d.pose.y,0);assert.equal(changed.d.travel,null);
  controls.push({engine,passed:true,nativeKeyboard:true,nativeWheel:!mobile,touch:mobile,pause:true,reverseReplay:true,liveReduced:true});
 }finally{await browser.close();}
}));
assert.deepEqual(errors,[]);assert.equal(await hash(),artifactSHA256);assert.equal(rows.length,12);
await writeFile(new URL('scroll.json',out),JSON.stringify({passed:true,verifiedAt:new Date().toISOString(),artifactSHA256,rows,controls,errors},null,2));console.log('Native scrolling verified:',rows.length,'proposals and',controls.length,'control groups.');
