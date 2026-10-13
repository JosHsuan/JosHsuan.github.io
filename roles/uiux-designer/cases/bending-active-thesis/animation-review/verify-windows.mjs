import {chromium,webkit} from '@playwright/test';
import {writeFile,mkdir,readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const dir=fileURLToPath(new URL('.',import.meta.url)),out=path.join(dir,'.local/window-verification');await mkdir(out,{recursive:true});const rows=[],errors=[];
const artifactHash=async()=>createHash('sha256').update(await readFile(path.join(dir,'dist/app.js'))).digest('hex');
const artifactSHA256=await artifactHash();
const get=page=>page.evaluate(()=>window.__effectDesk.inspect().detail);
const finished=page=>page.waitForFunction(()=>{const d=window.__effectDesk.inspect().detail;return d?.state==='completed'&&!d.scheduled;},{},{timeout:6500});
for(const [engine,type,mobile] of [['chromium',chromium,false],['webkit',webkit,false],['mobile-chromium',chromium,true]]){
 const browser=await type.launch(),context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1440,height:1000},isMobile:mobile,hasTouch:mobile}),page=await context.newPage();page.on('pageerror',e=>errors.push({engine,message:e.message}));page.on('console',m=>{if(m.type()==='error')errors.push({engine,message:m.text()});});
 try{for(const layer of ['3d','2d']){
  await page.goto(`http://127.0.0.1:4198/${layer}/`);await page.waitForFunction(()=>window.__effectDesk?.inspect().detail?.ready);
  const catalog=await page.evaluate(()=>window.__effectDesk.catalog().filter(e=>e.availability==='proposal'));assert.equal(catalog.length,5);assert(catalog.every(e=>e.id.startsWith('window-'+layer)));assert.equal(await page.locator('.effect-item').count(),5);
  for(const e of catalog){
   await page.evaluate(id=>window.__effectDesk.select(id),e.id);await page.waitForTimeout(80);await page.locator('#stage').scrollIntoViewIfNeeded();const initial=await get(page);assert(initial.ready);assert.equal(initial.scheduled,false);assert.equal(initial.region,'inside');
   const bitmap=layer==='3d'?await page.locator('#stage canvas').evaluate(c=>c.toDataURL()):null;
   await page.evaluate(()=>window.__effectDesk.reset());await page.getByRole('button',{name:'進入視野',exact:true}).click();await page.waitForTimeout(120);const moving=await get(page);assert.equal(moving.intent,'enter');assert.equal(moving.state,'running');
   await page.evaluate(()=>window.__effectDesk.pause());const frozen=await get(page);await page.waitForTimeout(180);assert.deepEqual((await get(page)).pose,frozen.pose);await page.evaluate(()=>window.__effectDesk.play());await finished(page);assert.equal((await get(page)).region,'inside');
   if(layer==='3d'){assert.deepEqual((await get(page)).model.camera,initial.model.camera);assert.equal(await page.locator('#stage canvas').evaluate(c=>c.toDataURL()),bitmap);assert.equal((await get(page)).model.frames,initial.model.frames);}
   await page.getByRole('button',{name:'離開視野',exact:true}).click();await finished(page);assert.equal(await page.locator('.vt-window').getAttribute('aria-hidden'),'true');await page.getByRole('button',{name:'反向返回',exact:true}).click();await finished(page);assert.equal(await page.locator('.vt-window').getAttribute('aria-hidden'),'false');
   await page.getByRole('button',{name:'離開視野',exact:true}).click();await page.waitForTimeout(100);const reversal=await page.evaluate(()=>{const before=window.__effectDesk.inspect().detail.pose;document.querySelector('[data-action="return"]').click();return {before,after:window.__effectDesk.inspect().detail.pose};});assert.deepEqual(reversal.after,reversal.before);await finished(page);
   await page.evaluate(()=>window.__effectDesk.seek(.16));await page.locator('#stage').screenshot({path:path.join(out,`${engine}-${e.id}-enter.png`)});const imageA=await page.locator('.vt-scroll').screenshot();await page.evaluate(()=>window.__effectDesk.seek(.5));const imageB=await page.locator('.vt-scroll').screenshot();assert(!imageA.equals(imageB));await page.evaluate(()=>window.__effectDesk.seek(.84));await page.locator('#stage').screenshot({path:path.join(out,`${engine}-${e.id}-exit.png`)});
   await page.evaluate(()=>window.__effectDesk.play());await page.waitForFunction(()=>window.__effectDesk.inspect().detail.events.some(e=>e.type==='replay:complete'),{},{timeout:7000});const complete=await get(page);assert.equal(complete.scheduled,false);assert.equal(complete.region,'after');assert(complete.enters>0&&complete.exits>0);
   await page.waitForTimeout(120);assert.equal((await get(page)).frames,complete.frames);assert.equal(await page.locator('#stage canvas').count(),layer==='3d'?1:0);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.equal(await page.locator('#source a').count(),e.source.length);
   rows.push({engine,id:e.id,passed:true,initial:initial.model,completed:complete});console.log('window checked',engine,e.id);
  }
 }
 }finally{await browser.close();}
}
assert.deepEqual(errors,[]);assert.equal(await artifactHash(),artifactSHA256,'Artifact changed during verification');await writeFile(path.join(out,'windows.json'),JSON.stringify({passed:true,verifiedAt:new Date().toISOString(),artifactSHA256,rows,errors},null,2));console.log('All window proposals verified',rows.length);
