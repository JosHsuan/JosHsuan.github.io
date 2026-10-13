import {chromium,webkit} from '@playwright/test';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
const dir=fileURLToPath(new URL('.',import.meta.url)),out=path.join(dir,'.local/window-verification');await mkdir(out,{recursive:true});
const digest=async()=>createHash('sha256').update(await readFile(path.join(dir,'dist/app.js'))).digest('hex');
const artifactSHA256=await digest(),rows=[],errors=[];
const arrived=(page,region)=>page.waitForFunction(region=>{const d=window.__effectDesk.inspect().detail;return d.region===region&&d.kinetic.resting&&!d.scheduled;},region,{timeout:7500});
async function snapshot(page){return page.evaluate(()=>{const d=window.__effectDesk.inspect().detail,node=document.querySelector('.vt-window');return {pose:d.pose,kinetic:d.kinetic,region:d.region,clip:getComputedStyle(node).clipPath,transform:getComputedStyle(node).transform};});}
for(const [engine,type] of [['chromium',chromium],['webkit',webkit]]){
 const browser=await type.launch(),page=await browser.newPage({viewport:{width:1440,height:1000}});
 page.on('pageerror',e=>errors.push({engine,message:e.message}));
 try{
  for(const layer of ['3d','2d']){
   await page.goto(`http://127.0.0.1:4198/${layer}/`);await page.waitForFunction(()=>window.__effectDesk?.inspect().detail?.ready);
   let effects=await page.evaluate(()=>window.__effectDesk.catalog().filter(e=>e.availability==='proposal'));
   if(engine==='webkit')effects=effects.filter(e=>['window-3d-tension','window-2d-ink'].includes(e.id));
   for(const effect of effects){
    await page.evaluate(id=>window.__effectDesk.select(id),effect.id);await page.locator('.vt-scroll').scrollIntoViewIfNeeded();
    await page.evaluate(()=>window.__effectDesk.reset());
    const rect=await page.locator('.vt-scroll').boundingBox();await page.mouse.move(rect.x+rect.width/2,rect.y+rect.height/2);
    const samples=[];
    for(const [name,delta,region,ySign,direction] of [['down-entry',230,'inside',1,1],['down-exit',490,'after',-1,1],['up-entry',-380,'inside',-1,-1],['up-exit',-400,'before',1,-1]]){
     await page.mouse.wheel(0,delta);await page.waitForTimeout(110);const sample=await snapshot(page);
     assert.equal(sample.region,region,`${effect.id} ${name}`);assert.equal(sample.kinetic.direction,direction);
     assert(sample.pose.y*ySign>0,`${effect.id} ${name} must approach/leave on the correct side`);
     assert(sample.clip.startsWith('path('),`${effect.id} needs a deforming boundary`);
     const corners=sample.kinetic.corners.map(c=>c.error);assert(Math.max(...corners)-Math.min(...corners)>.01,`${effect.id} front and rear must carry different inertial lag`);
     assert.equal(sample.kinetic.edges.length,4);
     assert([...sample.kinetic.corners,...sample.kinetic.edges].every(p=>Number.isFinite(p.error)&&Number.isFinite(p.errorVelocity)));
     const {vx,vy}=sample.kinetic.transport;
     assert(sample.pose.echoX*vx+sample.pose.echoY*vy<=0,`${effect.id} echo must trail the actual movement`);
     samples.push({name,...sample});
     if(['window-3d-tension','window-2d-paper'].includes(effect.id))await page.locator('#stage').screenshot({path:path.join(out,`${engine}-${effect.id}-${name}.png`)});
     await arrived(page,region);
     if(region==='inside'){assert.equal((await snapshot(page)).clip,'inset(0px round 18px)');}
    }
    if(['window-3d-tension','window-2d-ink'].includes(effect.id)){
     await page.getByRole('button',{name:'向上重播',exact:true}).click();
     await page.waitForFunction(()=>{const d=window.__effectDesk.inspect().detail;return d.region==='before'&&d.events.some(e=>e.type==='replay:complete')&&!d.scheduled&&d.kinetic.resting;},{},{timeout:8500});
    }
    rows.push({engine,id:effect.id,passed:true,samples});console.log('four directions checked',engine,effect.id);
   }
  }
 }finally{await browser.close();}
}
assert.deepEqual(errors,[]);assert.equal(await digest(),artifactSHA256);
await writeFile(path.join(out,'direction.json'),JSON.stringify({passed:true,verifiedAt:new Date().toISOString(),artifactSHA256,rows,errors},null,2));
console.log('Elastic direction checks passed',rows.length);
