import {createRequire} from 'node:module';
import {mkdir,writeFile,copyFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {executablePath} from './browser-path.mjs';
import {role,studies} from '../src/review/catalog.js';
const {chromium}=createRequire(new URL('../../../package.json',import.meta.url))('@playwright/test');
const browser=await chromium.launch({executablePath,headless:true}),results=[];
const folder=new URL('../assets/captures/',import.meta.url),dist=new URL('../dist/assets/captures/',import.meta.url);await mkdir(folder,{recursive:true});await mkdir(dist,{recursive:true});
try{const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});for(const study of studies){await page.goto(`http://127.0.0.1:${role.port}/?study=${study.id}&u=0.3`);await page.waitForFunction(()=>window.__study?.inspect().ready&&window.__study.inspect().frames>0);await page.locator('.canvas-wrap').scrollIntoViewIfNeeded();for(const u of [.3,.7]){const rect=await page.locator('.canvas-wrap').boundingBox();await page.mouse.move(rect.x+rect.width*u,rect.y+rect.height*.6);await page.waitForFunction(value=>Math.abs(window.__study.inspect().u-value)<.003,u);await page.waitForTimeout(150);const filename=study.id+(u===.3?'':'-late')+'.png',target=fileURLToPath(new URL(filename,folder)),bytes=await page.locator('.canvas-wrap').screenshot({path:target,animations:'disabled'});await copyFile(target,new URL(filename,dist));results.push({id:study.id,u,filename,sha256:createHash('sha256').update(bytes).digest('hex'),state:await page.evaluate(()=>window.__study.inspect())});}console.log(`Captured ${role.id}/${study.id}`);}await page.close();}finally{await browser.close();}
await writeFile(new URL('../catalog/captures.manifest.json',import.meta.url),JSON.stringify({capturedAt:new Date().toISOString(),source:'Actual built dist, Chromium headless shell, 1440x1000 DPR1; synthetic review profile',results},null,2)+'\n');
