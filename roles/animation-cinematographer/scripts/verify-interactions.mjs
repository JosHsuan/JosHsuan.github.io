import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {executablePath} from './browser-path.mjs';
import {role,studies} from '../src/review/catalog.js';
const {chromium,webkit,devices}=createRequire(new URL('../../../package.json',import.meta.url))('@playwright/test');
const results=[],failures=[];const origin=`http://127.0.0.1:${role.port}`;
await mkdir(new URL('../verification/screenshots/',import.meta.url),{recursive:true});
const wait=page=>page.waitForFunction(()=>window.__study?.inspect().ready&&window.__study.inspect().frames>0,{},{timeout:25000});
async function setProgress(page,u){const r=await page.locator('.canvas-wrap').boundingBox();await page.mouse.move(r.x+r.width*u,r.y+r.height*.5);await page.waitForFunction(value=>Math.abs(window.__study.inspect().u-value)<.003,u);await page.waitForTimeout(70);}
async function check(name,fn){try{await fn();results.push({name,passed:true});console.log('PASS '+name);}catch(error){failures.push({name,error:error.message});console.log('FAIL '+name+': '+error.message.slice(0,220));}}
for(const profile of ['chromium','webkit','mobile']){
 let browser;try{browser=await(profile==='webkit'?webkit:chromium).launch(profile==='webkit'?{headless:true}:{headless:true,executablePath});}catch(error){failures.push({name:profile+' launch',error:error.message});continue;}
 const context=await browser.newContext(profile==='mobile'?{...devices['Pixel 7']}:{viewport:{width:1440,height:1000},deviceScaleFactor:1});const page=await context.newPage(),pageErrors=[];page.on('pageerror',e=>pageErrors.push(e.message));
 try{
 for(const study of studies)await check(`${profile}/${study.id}: input + reversible A/B`,async()=>{
  await page.goto(`${origin}/?study=${study.id}`);await wait(page);await page.locator('.canvas-wrap').scrollIntoViewIfNeeded();
  if(profile==='mobile'){const r=await page.locator('.canvas-wrap').boundingBox();await page.touchscreen.tap(r.x+r.width*.2,r.y+r.height*.3);await page.waitForTimeout(100);}else await setProgress(page,.2);
  let before=await page.evaluate(()=>window.__study.inspect());assert(Math.abs(before.u-.2)<.01);assert.equal(before.views.length,2);
  if(profile==='mobile'){const r=await page.locator('.canvas-wrap').boundingBox();await page.touchscreen.tap(r.x+r.width*.8,r.y+r.height*.3);await page.waitForTimeout(100);}else await setProgress(page,.8);
  let after=await page.evaluate(()=>window.__study.inspect());assert(Math.abs(after.u-.8)<.01);assert.notDeepEqual(after.views,before.views,'Scene parameters did not respond');
  const center=page.locator('.canvas-wrap');await center.focus();await center.press('Home');await page.waitForTimeout(90);assert.equal(await page.evaluate(()=>window.__study.inspect().u),0);await center.press('End');await page.waitForTimeout(90);assert.equal(await page.evaluate(()=>window.__study.inspect().u),1);
  await center.press('Home');for(let i=0;i<8;i++)await center.press('ArrowRight');await page.waitForTimeout(150);const recalled=await page.evaluate(()=>window.__study.inspect());assert(Math.abs(recalled.u-before.u)<.003);for(let i=0;i<2;i++)for(let j=0;j<3;j++)assert(Math.abs(recalled.views[i].position[j]-before.views[i].position[j])<.03,'Pose did not return');
  await page.waitForTimeout(400);const frames=await page.evaluate(()=>window.__study.inspect().frames);await page.waitForTimeout(350);assert.equal(await page.evaluate(()=>window.__study.inspect().frames),frames,'Resting input rendered continuously');
  assert.equal(await page.evaluate(()=>document.querySelectorAll('input[type=range]').length),0);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'Horizontal overflow');
 });
 await check(`${profile}: native scroll is exclusive`,async()=>{
  await page.getByRole('button',{name:'Page scroll',exact:true}).click();await page.evaluate(()=>{const r=document.querySelector('.runway');scrollTo(0,r.offsetTop+100);});await page.waitForTimeout(100);const before=await page.evaluate(()=>window.__study.inspect().u);const r=await page.locator('.canvas-wrap').boundingBox();await page.mouse.move(r.x+r.width*.93,r.y+70);await page.waitForTimeout(80);assert(Math.abs(await page.evaluate(()=>window.__study.inspect().u)-before)<.01);
  await page.mouse.wheel(0,500);await page.waitForTimeout(450);assert(await page.evaluate(()=>window.__study.inspect().u)>before+.05,'Native wheel did not advance');
  await page.getByRole('button',{name:'Mouse position',exact:true}).click();await page.waitForTimeout(200);const fixed=await page.evaluate(()=>window.__study.inspect().u);await page.mouse.move(2,2);await page.mouse.wheel(0,100);await page.waitForTimeout(300);assert.equal(await page.evaluate(()=>window.__study.inspect().u),fixed,'Inactive scroll changed u');
 });
 await check(`${profile}: role review and screenshots`,async()=>{
  await page.goto(`${origin}/?study=${studies[0].id}`);await wait(page);await page.getByRole('button',{name:'Save B',exact:true}).click();await page.locator('textarea').fill('SYNTHETIC VERIFICATION NOTE — not an owner preference.');
  const exported=page.waitForEvent('download');await page.getByRole('button',{name:'Export choices',exact:true}).click();const dl=await exported;assert(dl.suggestedFilename().includes(role.id));
  await page.reload();await wait(page);assert.equal(await page.locator('textarea').inputValue(),'SYNTHETIC VERIFICATION NOTE — not an owner preference.');
  await page.locator('input[type=file]').nth(1).setInputFiles({name:'synthetic-uiux.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({schemaVersion:1,role:'uiux-designer',exportedAt:'2026-10-07T00:00:00Z',saved:[{id:'feedback-card',name:'Synthetic fixture',note:'Not an owner preference',sources:[]}]}))});await page.waitForTimeout(100);assert((await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).uiuxBasis.sha256,role.key)).length===64);
  await page.locator('.canvas-wrap').scrollIntoViewIfNeeded();await page.screenshot({path:fileURLToPath(new URL(`../verification/screenshots/${profile}-review.png`,import.meta.url)),fullPage:profile!=='mobile'});assert.deepEqual(pageErrors,[]);
 });
 }finally{await context.close();await browser.close();}
}
const browser=await chromium.launch({headless:true,executablePath});
try{
 await check('reduced motion: fixed pose and explicit opt-in',async()=>{const page=await browser.newPage({reducedMotion:'reduce'});await page.goto(origin);await wait(page);await page.locator('.canvas-wrap').scrollIntoViewIfNeeded();const a=await page.evaluate(()=>window.__study.inspect().views);const r=await page.locator('.canvas-wrap').boundingBox();await page.mouse.move(r.x+10,r.y+100);await page.waitForTimeout(150);assert.deepEqual(await page.evaluate(()=>window.__study.inspect().views),a);await page.getByRole('button',{name:'Enable manual motion for this review'}).click();await setProgress(page,.8);await page.close();});
 await check('no JavaScript: all comparisons and sources remain readable',async()=>{const page=await browser.newPage({javaScriptEnabled:false});await page.goto(origin);assert.equal(await page.locator('noscript article').count(),studies.length);assert.equal(await page.locator('noscript img').evaluateAll(imgs=>imgs.every(img=>img.complete&&img.naturalWidth>0)),true);await page.close();});
 await check('context loss: captured fallback',async()=>{const page=await browser.newPage();await page.goto(origin);await wait(page);await page.evaluate(()=>window.__study.loseContext());await page.waitForSelector('img.fallback');assert(await page.locator('img.fallback').evaluate(img=>img.naturalWidth>0));await page.close();});
 await check('blocked storage: export still works',async()=>{const page=await browser.newPage();await page.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('blocked');}});});await page.goto(origin);await wait(page);await page.getByRole('button',{name:'Save A',exact:true}).click();const dl=page.waitForEvent('download');await page.getByRole('button',{name:'Export choices',exact:true}).click();await dl;assert((await page.locator('.review').textContent()).includes('storage is unavailable'));await page.close();});
 await check('missing HDR: frozen captured fallback',async()=>{const page=await browser.newPage();await page.route('**/*.hdr',route=>route.abort());await page.goto(origin);await page.waitForSelector('img.fallback');assert(await page.locator('img.fallback').evaluate(img=>img.naturalWidth>0));assert((await page.locator('.transport').textContent()).includes('30%'));await page.close();});
 await check('review import: exact role and source preservation',async()=>{const page=await browser.newPage();await page.goto(origin);await wait(page);const value={schemaVersion:2,role:role.id,saved:[{id:studies[0].id,variant:'b',u:.625,mode:'pointer'}],notes:{[studies[0].id]:'SYNTHETIC ROUND TRIP'},uiuxBasis:null};await page.locator('input[type=file]').first().setInputFiles({name:'synthetic-review.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(value))});await page.waitForTimeout(120);assert.equal(await page.locator('textarea').inputValue(),'SYNTHETIC ROUND TRIP');await page.getByRole('button',{name:'Recall B · 63%'}).click();await page.waitForTimeout(120);assert.equal(await page.evaluate(()=>window.__study.inspect().u),.625);await page.close();});
}finally{await browser.close();}
await check('WebGL unavailable: readable capture',async()=>{const disabled=await chromium.launch({headless:true,executablePath,args:['--disable-webgl']});try{const page=await disabled.newPage();await page.goto(origin);await page.waitForSelector('img.fallback');assert(await page.locator('img.fallback').evaluate(img=>img.naturalWidth>0));assert((await page.locator('.transport').textContent()).includes('30%'));}finally{await disabled.close();}});
await writeFile(new URL('../verification/interaction-browser.json',import.meta.url),JSON.stringify({verifiedAt:new Date().toISOString(),role:role.id,syntheticProfiles:true,results,failures,limits:['Emulated Pixel 7; no physical device','Firefox launch previously unavailable on this Windows host; not claimed passed','Owner UIUX saved state not accessed by these tests']},null,2)+'\n');
console.log(JSON.stringify({passed:results.length,failures},null,2));if(failures.length)process.exitCode=1;
