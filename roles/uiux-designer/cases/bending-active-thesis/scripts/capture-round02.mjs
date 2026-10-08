import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
const {chromium}=createRequire(new URL('../../../../../package.json',import.meta.url))('@playwright/test');
const rootRequire=createRequire(new URL('../../../../../package.json',import.meta.url));
const sharp=createRequire(rootRequire.resolve('next/package.json'))('sharp');
const output='D:/JosHsuan_Website/_work/bending-active-thesis/round-02';
await mkdir(`${output}/verification`,{recursive:true});await mkdir(`${output}/prepared`,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'C:/Users/JosHsuan/AppData/Local/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-win64/chrome-headless-shell.exe'});
const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
const errors=[],captures=[];page.on('pageerror',error=>errors.push(error.message));page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
try{
  await page.goto('http://127.0.0.1:4184/');await page.waitForFunction(()=>window.__thesis?.inspect().ready&&window.__thesis.inspect().layers?.length===3,null,{timeout:45000});
  for(const viewport of [{width:1440,height:1000},{width:1024,height:900},{width:768,height:1024},{width:390,height:844}]){
    await page.setViewportSize(viewport);
    for(const id of ['overview','form','system','pattern','make','validation','credits']){
      await page.evaluate(id=>{const section=document.getElementById(id);scrollTo(0,section.offsetTop+section.offsetHeight*.5-innerHeight*.45);},id);
      await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
      await page.waitForFunction(()=>window.__story?.inspect().settled,null,{timeout:7000});await page.waitForTimeout(180);
      await page.screenshot({path:`${output}/verification/${viewport.width}-${id}.png`});
      captures.push({width:viewport.width,id,overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),state:await page.evaluate(()=>window.__thesis.inspect())});
    }
  }
  for(const viewport of [{width:1440,height:1000},{width:390,height:844}]){
    await page.setViewportSize(viewport);await page.evaluate(()=>window.__thesis.setOverrides({stageU:1.5/7,visualU:1.5/7,optical:{apertureScale:0,maxBlurPx:0,asciiWeight:0}}));await page.waitForTimeout(150);
    const hidden=await page.addStyleTag({content:'body > :not([data-cinematic-background]){visibility:hidden!important}[data-cinematic-background] > :not(:has(canvas)){display:none!important}'});
    const pixels=await page.locator('canvas').screenshot({path:`${output}/prepared/model-poster-${viewport.width}.png`});
    await sharp(pixels).webp({quality:88}).toFile(`${output}/prepared/model-poster-${viewport.width}.webp`);
    await hidden.evaluate(element=>element.remove());
  }
  await writeFile(`${output}/verification/captures.json`,JSON.stringify({errors,captures},null,2));
  console.log(JSON.stringify({captures:captures.length,errors,overflow:captures.filter(c=>c.overflow).map(c=>[c.width,c.id])},null,2));
  if(errors.length)process.exitCode=1;
}finally{await browser.close();}
