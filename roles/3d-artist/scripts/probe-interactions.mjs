import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import {executablePath} from './browser-path.mjs';
const {chromium}=createRequire(new URL('../../../package.json',import.meta.url))('@playwright/test');
const browser=await chromium.launch({executablePath,headless:true});
const results=[];
try{for(const [port,id]of[[4180,'section'],[4182,'mist'],[4182,'dollyzoom']]){const page=await browser.newPage({viewport:{width:1440,height:1050},deviceScaleFactor:1});const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});await page.goto(`http://127.0.0.1:${port}/?study=${id}`);try{await page.waitForFunction(()=>window.__study?.inspect().ready&&window.__study.inspect().frames>0,{},{timeout:25000});}catch{}await page.waitForTimeout(300);await mkdir(new URL('../verification/screenshots/',import.meta.url),{recursive:true});await page.screenshot({path:new URL(`../verification/screenshots/${port}-${id}.png`,import.meta.url).pathname.replace(/^\/(\w:)/,'$1')});results.push({port,id,errors,state:await page.evaluate(()=>window.__study?.inspect()),text:(await page.locator('.transport').textContent()).slice(0,300)});await page.close();}}finally{await browser.close();}
console.log(JSON.stringify(results,null,2));await writeFile(new URL('../verification/interaction-probe.json',import.meta.url),JSON.stringify(results,null,2));
