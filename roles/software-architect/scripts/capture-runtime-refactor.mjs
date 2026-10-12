/** Matched built-artifact captures. Run sequentially with GPU tests/profiles. */
import {chromium,webkit} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {loadScene,centerStudy,pause,frames,settle,WAIT} from '../../../tests/pages/case-helpers.mjs';

const args=Object.fromEntries(process.argv.slice(2).reduce((all,arg,index,list)=>arg.startsWith('--')?[...all,[arg.slice(2),list[index+1]]]:all,[]));
const url=args.url??'http://127.0.0.1:4186',out=path.resolve(args.out??'pages-test-results/runtime-captures'),engine=args.engine??'chromium';
if(!['chromium','webkit'].includes(engine))throw Error('Use chromium or webkit');
await mkdir(out,{recursive:true});
const browser=await ({chromium,webkit}[engine]).launch({headless:true});
const report={engine,browserVersion:browser.version(),url,artifactIndexSHA256:createHash('sha256').update(await(await fetch(url)).text()).digest('hex'),captures:[],errors:[]};
const sizes=args.compact==='1'?[{id:'desktop',width:1440,height:1000,touch:false},{id:'phone',width:390,height:844,touch:true}]:[
 {id:'desktop',width:1440,height:1000,touch:false},{id:'tablet',width:820,height:1180,touch:false},
 {id:'phone',width:390,height:844,touch:true},{id:'landscape',width:844,height:390,touch:true}];
try{
 for(const size of sizes){
  const viewport={width:size.width,height:size.height};
  const context=await browser.newContext({baseURL:url,viewport,deviceScaleFactor:1,isMobile:size.touch,hasTouch:size.touch,reducedMotion:'reduce'});
  const page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
  await page.goto(url,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__story,null,{timeout:WAIT});await page.evaluate(()=>document.fonts.ready);
  for(const chapter of ['overview','form','system','pattern','make','credits']){
   console.log(JSON.stringify({engine,viewport,chapter,type:'reading'}));
   await page.locator(`[data-chapter-link="${chapter}"]`).click();await settle(page);await frames(page,3);
   await page.locator('img').evaluateAll(images=>Promise.all(images.filter(image=>{const r=image.getBoundingClientRect();return r.width>0&&r.height>0&&r.bottom>0&&r.top<innerHeight;}).map(image=>{
    image.loading='eager';return Promise.race([image.decode().catch(()=>{}),new Promise(resolve=>setTimeout(resolve,3000))]);
   })));
   const file=`${engine}-${size.id}-reading-${chapter}.png`;
   await page.screenshot({path:path.join(out,file)});
   report.captures.push({file,type:'reduced-reading',viewport,chapter,scrollY:await page.evaluate(()=>scrollY)});
  }
  await context.close();

  const live=await browser.newContext({baseURL:url,viewport,deviceScaleFactor:1,isMobile:size.touch,hasTouch:size.touch,reducedMotion:'no-preference'});
  const scenePage=await live.newPage();scenePage.on('pageerror',e=>report.errors.push(e.message));
  await loadScene(scenePage);await pause(scenePage);
  await scenePage.getByLabel('Visual detail').selectOption('full');await settle(scenePage);
  for(const [index,chapter] of ['overview','form','system','pattern','credits'].entries()){
   // Release the preceding diagnostic source before waiting for the next real chapter.
   await scenePage.evaluate(()=>window.__thesis.setOverrides({}));await frames(scenePage,2);
   const chapterIndex={overview:0,form:1,system:2,pattern:3,credits:6}[chapter];
   if(['form','system','pattern'].includes(chapter))await centerStudy(scenePage,chapter);
   else{await scenePage.locator(`[data-chapter-link="${chapter}"]`).click();await settle(scenePage);}
   await scenePage.evaluate(({chapterIndex,index})=>{
    const weights=Array.from({length:7},(_,i)=>Number(i===chapterIndex));
    window.__thesis.setOverrides({stageU:(chapterIndex+.5)/7,visualU:(chapterIndex+.5)/7,
     playback:{chapterWeights:weights,phases:Array(7).fill(.32),activeSeconds:24,energy:0},
     sourceSelection:['form','system','pattern'].includes(['overview','form','system','pattern','make','validation','credits'][chapterIndex])?
      {chapterId:['overview','form','system','pattern','make','validation','credits'][chapterIndex],index:0,selectedAt:24}:null,
     optical:{},captureIndex:index});
   },{chapterIndex,index});
   await frames(scenePage,4);
   const sample=await scenePage.evaluate(()=>{const v=window.__thesis.inspect();return {pose:v.pose,representation:v.representation,budget:v.renderBudget,memory:v.memory,compositor:v.compositor,controller:window.__story.inspect().controllerFrame};});
   const file=`${engine}-${size.id}-scene-${chapter}.png`;
   // Locator screenshots clip the composited page, not the raw WebGL buffer.
   // Hide only overlay presentation for this isolated, fixed-pose scene comparison.
   await scenePage.evaluate(()=>{
    window.__captureOverlays=[...document.querySelectorAll('[data-reading-frame],[data-page-masthead],[data-story-navigation],[data-reading-tools],canvas[data-ascii-field]')].map(element=>({element,visibility:element.style.visibility}));
    window.__captureOverlays.forEach(({element})=>{element.style.visibility='hidden';});
   });
   await scenePage.locator('[data-cinematic-stage] canvas').screenshot({path:path.join(out,file)});
   await scenePage.evaluate(()=>{window.__captureOverlays.forEach(({element,visibility})=>{element.style.visibility=visibility;});delete window.__captureOverlays;});
   report.captures.push({file,type:'fixed-source-scene',isolatedOverlays:true,viewport,chapter,...sample});
   console.log(JSON.stringify({engine,viewport,chapter,file}));
  }
  await live.close();
 }
 if(report.errors.length)throw Error(report.errors.join('\n'));
}catch(error){report.failure=error.message;process.exitCode=1;}
finally{await writeFile(path.join(out,`${engine}-captures.json`),JSON.stringify(report,null,2));await browser.close();}
