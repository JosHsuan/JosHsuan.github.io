import {createRequire} from 'node:module';
import {writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {executablePath} from './browser-path.mjs';
const {chromium}=createRequire(new URL('../../../package.json',import.meta.url))('@playwright/test');
const results=[];
for(const disabled of [false,true]){const browser=await chromium.launch({headless:true,executablePath,...disabled?{args:['--disable-webgl']}: {}});try{
 for(const [role,port]of[['3d-artist',4180],['animation-cinematographer',4182]]){
  const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});await page.goto(`http://127.0.0.1:${port}/`);
  if(disabled){await page.waitForSelector('img.fallback',{timeout:12000});assert(await page.locator('img.fallback').evaluate(img=>img.naturalWidth>0));results.push({role,check:'No WebGL uses frozen captured checkpoint',passed:true});}
  else{await page.waitForFunction(()=>window.__study?.inspect().ready);await page.locator('.contact-sheet img').evaluateAll(imgs=>imgs.forEach(img=>img.loading='eager'));await page.waitForFunction(()=>[...document.querySelectorAll('.contact-sheet img')].every(img=>img.naturalWidth>0));await page.locator('.contact-sheet').screenshot({path:fileURLToPath(new URL(`../../${role}/verification/screenshots/all-proposals.png`,import.meta.url))});results.push({role,check:'All contact-sheet images loaded and captured for visual review',passed:true});}
  await page.close();
 }
 if(!disabled){const page=await browser.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));await page.goto('http://127.0.0.1:4180/bench/index.html?study=materials');await page.waitForSelector('h1');assert((await page.locator('h1').textContent()).includes('Surface / substance'));await page.reload();await page.waitForSelector('h1');assert.equal(new URL(page.url()).pathname,'/bench/index.html');assert.deepEqual(errors,[]);results.push({role:'3d-artist',check:'Archived bench reload retains its own route and sources',passed:true});await page.close();}
}finally{await browser.close();}}
await writeFile(new URL('../verification/interaction-evidence.json',import.meta.url),JSON.stringify({verifiedAt:new Date().toISOString(),results},null,2)+'\n');console.log(JSON.stringify(results,null,2));
