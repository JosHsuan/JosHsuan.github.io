import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const require=createRequire(new URL('../../../package.json',import.meta.url));
const {chromium}=require('@playwright/test');
const executablePath=chromium.executablePath().replace(/chromium-(\d+)([\\/])chrome-win64[\\/]chrome\.exe$/,'chromium_headless_shell-$1$2chrome-headless-shell-win64/chrome-headless-shell.exe');
const out='D:/JosHsuan_Website/_work/bending-active-thesis/cinematic-integration/director-browser';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath,headless:true});
const results=[];
try{
 for(const [name,url] of [['lusion','https://lusion.co/'],['labs','https://labs.lusion.co/']]){
  const page=await browser.newPage({viewport:{width:1440,height:960},deviceScaleFactor:1});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  try{
   await page.goto(url,{waitUntil:'domcontentloaded',timeout:45000});
   await page.waitForTimeout(10000);
   await page.screenshot({path:`${out}/${name}-opening.png`});
   const opening=await page.evaluate(()=>({title:document.title,text:document.body.innerText.slice(0,16000),height:document.documentElement.scrollHeight,canvases:[...document.querySelectorAll('canvas')].map(c=>({width:c.width,height:c.height,position:getComputedStyle(c).position,rect:{x:c.getBoundingClientRect().x,y:c.getBoundingClientRect().y,width:c.getBoundingClientRect().width,height:c.getBoundingClientRect().height}}))}));
   await page.mouse.move(1170,350);await page.waitForTimeout(1200);await page.screenshot({path:`${out}/${name}-pointer.png`});
   await page.mouse.wheel(0,880);await page.waitForTimeout(2500);await page.screenshot({path:`${out}/${name}-scroll.png`});
   const after=await page.evaluate(()=>({scrollY:window.scrollY,text:document.body.innerText.slice(0,16000)}));
   results.push({name,url,opening,after,errors});
  }catch(error){results.push({name,url,error:error.message,errors});}
  await page.close();
 }
}finally{await browser.close();}
await writeFile(`${out}/reference-capture.json`,JSON.stringify({capturedAt:new Date().toISOString(),results},null,2));
console.log(JSON.stringify(results.map(({name,url,opening,after,errors,error})=>({name,url,title:opening?.title,height:opening?.height,canvases:opening?.canvases,scrollY:after?.scrollY,errors,error})),null,2));
