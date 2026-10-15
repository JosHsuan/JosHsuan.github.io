import {chromium} from '@playwright/test';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const directory=fileURLToPath(new URL('.',import.meta.url)),out=path.join(directory,'.local','verification');await mkdir(out,{recursive:true});
const artifactHash=async()=>createHash('sha256').update(await readFile(path.join(directory,'dist/app.js'))).digest('hex');
const artifactSHA256=await artifactHash();
const browser=await chromium.launch(),page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[],rows=[];
page.on('pageerror',error=>errors.push(error.message));page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
try{
 for(const layer of ['2d','3d']){
  await page.goto(`http://127.0.0.1:4198/${layer}/`);await page.waitForFunction(()=>window.__effectDesk?.catalog().length>0);
  const catalog=await page.evaluate(()=>window.__effectDesk.catalog());assert.deepEqual(catalog.map(x=>x.id),[`window-${layer}-membrane`,`window-${layer}-ink`]);assert(catalog.every(x=>x.title&&x.trigger&&x.logic&&x.end&&x.source));
  assert.equal(await page.locator('#effects button').count(),2);assert.equal(await page.locator('#count').textContent(),'2 / 2 RECIPES');
  assert.equal(await page.locator('#family, #show-dormant').count(),0,'retired inventory must not be selectable through filters');
  await page.locator('#search').fill('壓力開口');assert.equal(await page.locator('#effects button').count(),1);await page.locator('#search').fill('');
  const selection=await page.evaluate(()=>window.__effectDesk.inspect().id);await page.evaluate(()=>window.__effectDesk.select('2d-model-annotation'));assert.equal(await page.evaluate(()=>window.__effectDesk.inspect().id),selection,'retired IDs must not be registered');
  for(const effect of catalog){
   await page.evaluate(async id=>{await window.__effectDesk.select(id);},effect.id);
   await page.evaluate(()=>window.__effectDesk.reset());await page.waitForTimeout(100);
   const before=await page.evaluate(()=>window.__effectDesk.inspect());assert.equal(before.errorCount,0,effect.id);assert(before.canvasCount<=1,effect.id);assert.equal(before.detail.intent,'idle');
   await page.evaluate(()=>window.__effectDesk.seek(.62));await page.waitForTimeout(180);const sampled=await page.evaluate(()=>window.__effectDesk.inspect());assert.equal(sampled.detail.intent,'idle');
   await page.evaluate(()=>window.__effectDesk.play());await page.waitForTimeout(250);await page.evaluate(()=>window.__effectDesk.pause());await page.waitForTimeout(100);
   const paused=await page.evaluate(()=>window.__effectDesk.inspect());assert.equal(paused.errorCount,0,effect.id);assert(!paused.detail?.failed,effect.id);
   assert.equal(paused.detail?.ready,true,effect.id);assert(paused.detail.frames>0,effect.id);
   assert.equal(await page.locator('#mode').textContent(),'共用配方 · 獨立展示');assert((await page.locator('#source a').count())>0);assert.equal(paused.detail.scheduled,false);
   rows.push({layer,id:effect.id,title:effect.title,before:before.detail,sampled:sampled.detail,paused:paused.detail});
   await page.locator('#stage').screenshot({path:path.join(out,effect.id+'.png')});
   console.log('checked',layer,effect.id);
  }
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 }
 assert.equal(rows.length,4);assert.deepEqual(errors,[]);assert.equal(await artifactHash(),artifactSHA256,'Artifact changed during verification');await writeFile(path.join(out,'catalog-effects.json'),JSON.stringify({passed:true,verifiedAt:new Date().toISOString(),artifactSHA256,rows,errors},null,2));console.log('All catalog specimens checked:',rows.length);
}finally{await browser.close();}
