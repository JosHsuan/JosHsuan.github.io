import {createRequire} from 'node:module';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {executablePath} from './browser-path.mjs';
import {studies} from '../src/catalog.js';
const {chromium,webkit,devices}=createRequire(new URL('../../../package.json',import.meta.url))('@playwright/test');
const root=new URL('../',import.meta.url),results=[];
await mkdir(new URL('verification/screenshots/',root),{recursive:true});
const profiles=[{name:'chromium-desktop',engine:chromium,launch:{executablePath},context:{viewport:{width:1440,height:1100}}},{name:'webkit-desktop',engine:webkit,launch:{},context:{viewport:{width:1440,height:1100}}},{name:'chromium-touch',engine:chromium,launch:{executablePath},context:{...devices['Pixel 7']}}];
for(const profile of profiles){
 let browser;const checks=[];let errors=[];
 try{
  browser=await profile.engine.launch({headless:true,...profile.launch});const context=await browser.newContext(profile.context),page=await context.newPage();
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|WebGL context|Error creating WebGL/.test(m.text()))errors.push(m.text());});
  const external=[];page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith('http://127.0.0.1:4180'))external.push(r.url());});
  async function open(id,variant='a'){await page.goto(`http://127.0.0.1:4180/?study=${id}&variant=${variant}`);await page.getByRole('button',{name:'Open live stage',exact:true}).click();await page.waitForFunction(()=>window.__artist3d?.inspect().frames>=1&&document.querySelector('.stage-badge').textContent.includes('AT REST'));await page.locator('.stage').scrollIntoViewIfNeeded();}
  async function idle(){await page.waitForTimeout(600);const a=await page.evaluate(()=>window.__artist3d.inspect().frames);await page.waitForTimeout(400);assert.equal(await page.evaluate(()=>window.__artist3d.inspect().frames),a);}
  for(const study of studies){
   await open(study.id);assert.equal(await page.locator('canvas').count(),1);await idle();
   const firstImage=await page.evaluate(()=>window.__artist3d.capture().image);
   const variants=page.locator('.variants button');await variants.nth(1).click();await page.waitForFunction(()=>window.__artist3d?.inspect().frames>=1);await page.waitForTimeout(120);
   const secondImage=await page.evaluate(()=>window.__artist3d.capture().image);
   if(study.id!=='physics'&&study.id!=='particles')assert.notEqual(firstImage,secondImage,study.id+' A/B should differ');
   await page.locator('.controls input[type=range]').first().focus();await page.keyboard.press('ArrowRight');
   await page.getByRole('button',{name:'Reset',exact:true}).click();await page.waitForFunction(()=>window.__artist3d?.inspect().frames>=1);
   if(['physics','particles'].includes(study.id)){
    if(study.id==='physics')await page.waitForFunction(()=>window.__artist3d?.inspect().bodies?.length===12);
    const before=await page.evaluate(()=>window.__artist3d.inspect());
    await page.getByRole('button',{name:'Step 1/60 s',exact:true}).click();await page.waitForTimeout(100);
    const stepped=await page.evaluate(()=>window.__artist3d.inspect());assert(stepped.time>before.time);
    await page.getByRole('button',{name:'Play',exact:true}).click();await page.waitForTimeout(300);await page.getByRole('button',{name:'Pause',exact:true}).click();await idle();
    const after=await page.evaluate(()=>window.__artist3d.inspect());if(study.id==='physics'){assert(after.physicsSteps>1);assert.notDeepEqual(after.bodies,before.bodies);}else assert.notDeepEqual(after.particleSample,before.particleSample);
   }
   if(study.id==='camera'){
    const before=await page.evaluate(()=>window.__artist3d.inspect().camera.position);
    await page.getByRole('button',{name:'Play',exact:true}).click();await page.waitForTimeout(800);
    const after=await page.evaluate(()=>window.__artist3d.inspect());assert.equal(after.owner,'theatre');assert.notDeepEqual(after.camera.position,before);assert(after.assembly>0);
    await page.getByRole('button',{name:'Pause',exact:true}).click();await idle();
    await page.locator('.controls input[type=range]').first().focus();await page.keyboard.press('ArrowRight');
    assert.equal(await page.evaluate(()=>window.__artist3d.inspect().owner),'inspection');
    await page.getByRole('button',{name:'Reset',exact:true}).click();await page.waitForFunction(()=>window.__artist3d?.inspect().frames>=1);
    if(profile.name==='chromium-desktop'){await page.getByRole('button',{name:'Play',exact:true}).click();await page.getByRole('button',{name:'Play',exact:true}).waitFor({timeout:9000});await idle();checks.push('Theatre full score completes and returns to idle');}
   }
   await page.getByRole('button',{name:'Freeze comparison',exact:true}).click();assert(await page.locator('.capture-grid img').count()>0);
   await page.getByRole('button',{name:'Clear captures',exact:true}).click();
   await page.getByRole('button',{name:'Close live stage',exact:true}).click();await page.waitForFunction(()=>!window.__artist3d);assert.equal(await page.locator('canvas').count(),0);
   assert.equal(await page.locator('[role=alert]').count(),0,'normal close is not a failure');
   checks.push(study.id+': direct URL, real rendering, A/B, parameter keyboard input, reset, idle, capture, teardown');
  }
  await open('materials');await page.getByRole('button',{name:'＋ Save this study',exact:true}).click();await page.getByRole('textbox',{name:'Review notes'}).fill('Synthetic automated review — not owner evidence.');
  const exported=page.waitForEvent('download');await page.getByRole('button',{name:'Export 3D Saved + notes',exact:true}).click();const download=await exported;const data=JSON.parse(await readFile(await download.path(),'utf8'));assert.equal(data.role,'3d-artist');assert.equal(data.saved[0].id,'materials');assert(data.notes.materials.includes('Synthetic'));assert.equal(data.uiuxBasis,null);
  await page.getByRole('button',{name:'✓ Saved',exact:true}).click();await page.getByLabel('Import 3D review').setInputFiles({name:'restored.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(data))});await page.getByRole('button',{name:'✓ Saved',exact:true}).waitFor();assert.equal(await page.getByRole('button',{name:'✓ Saved',exact:true}).count(),1);
  await page.getByLabel('Import 3D review').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{broken')});await page.waitForFunction(()=>document.querySelector('[role=status]').textContent.includes('Import rejected'));assert((await page.locator('.notice').textContent()).includes('Import rejected'));await page.getByRole('button',{name:'✓ Saved',exact:true}).waitFor();assert.equal(await page.getByRole('button',{name:'✓ Saved',exact:true}).count(),1);
  const uiuxFixture={schemaVersion:1,role:'uiux-designer',exportedAt:'2026-10-07T00:00:00Z',saved:[{id:'unresolved-test-id',name:'SYNTHETIC ONLY',note:'Never owner evidence',sources:[]}]};await page.getByLabel('Import real UIUX export').setInputFiles({name:'synthetic-uiux.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(uiuxFixture))});
  await page.waitForFunction(()=>JSON.parse(localStorage.getItem('artist3d-review-v1')).uiuxBasis?.fileSha256);const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('artist3d-review-v1')));assert.equal(stored.saved[0].id,'materials');assert.equal(stored.uiuxBasis.saved[0].id,'unresolved-test-id');assert.equal(stored.uiuxBasis.fileSha256.length,64);assert.equal(await page.evaluate(()=>localStorage.getItem('uiux-material-review-v1')),null);
  await page.reload();await page.getByRole('button',{name:'✓ Saved',exact:true}).waitFor();assert.equal(await page.getByRole('button',{name:'✓ Saved',exact:true}).count(),1);checks.push('Real download + round-trip import, malformed rejection without overwrite, persistence, separate hashed UIUX evidence');
  await page.goto('http://127.0.0.1:4180/');await page.getByRole('button',{name:'Saved',exact:true}).click();assert.equal(await page.locator('.card').count(),1);await page.getByRole('button',{name:'All',exact:true}).click();assert.equal(await page.locator('.card').count(),7);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.screenshot({path:fileURLToPath(new URL(`verification/screenshots/${profile.name}.png`,root)),fullPage:true});checks.push('Filters, narrow layout without horizontal overflow, captured contact sheet');
  await page.emulateMedia({reducedMotion:'reduce'});await open('particles');assert.equal(await page.getByRole('button',{name:'Pause',exact:true}).count(),0);await idle();assert(await page.locator('.motion-note').isVisible());checks.push('Reduced motion: no autoplay; live stage returns to rest');
  await page.getByRole('button',{name:'Play',exact:true}).click();await page.locator('#review').scrollIntoViewIfNeeded();await page.getByRole('button',{name:'Play',exact:true}).waitFor();await idle();checks.push('Offscreen stage pauses');
  await page.locator('.stage').scrollIntoViewIfNeeded();await page.evaluate(()=>window.__artist3d.loseContext());await page.getByRole('alert').waitFor();assert.equal(await page.locator('canvas').count(),0);await page.getByRole('button',{name:'Open live stage',exact:true}).click();await page.waitForFunction(()=>window.__artist3d?.inspect().frames>=1);checks.push('Real WEBGL_lose_context fallback and recovery');
  assert.equal(external.length,0);assert.deepEqual(errors,[]);checks.push('No remote runtime asset requests or page/shader errors');
  await context.close();results.push({profile:profile.name,result:'PASS',checks});
 }catch(error){results.push({profile:profile.name,result:'FAIL',checks,error:error.stack,consoleErrors:errors});console.error(profile.name,error.stack);}
 finally{await browser?.close();}
 console.log(profile.name,results.at(-1).result,checks.length);
}
await writeFile(new URL('verification/browser-results.json',root),JSON.stringify({verifiedAt:new Date().toISOString(),testData:'All browser contexts and preference fixtures are synthetic. Not owner Saved evidence.',results},null,2)+'\n');
if(results.some(r=>r.result!=='PASS'))process.exitCode=1;
