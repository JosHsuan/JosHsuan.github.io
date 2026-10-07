import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import {executablePath} from './browser-path.mjs';
const require=createRequire(new URL('../../../package.json',import.meta.url));
const {chromium}=require('@playwright/test');
const out='D:/JosHsuan_Website/_work/bending-active-thesis/cinematic-integration/verification/director-final/';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath,headless:true});const report=[];
async function chapter(page,id){const y=await page.locator('[data-story-chapter="'+id+'"]').evaluate(el=>el.getBoundingClientRect().top+scrollY+Math.max(0,(el.getBoundingClientRect().height-innerHeight)/2));await page.evaluate(y=>scrollTo(0,y),y);await page.waitForTimeout(700);}
try{
for(const width of [1024,768,390]){
const page=await browser.newPage({viewport:{width,height:width===390?844:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:4184/',{waitUntil:'networkidle'});await page.waitForFunction(()=>window.__thesis?.inspect().ready);
await chapter(page,'credits');await page.screenshot({path:out+width+'-credits.png'});
report.push({mode:'live',width,errors,scene:await page.evaluate(()=>window.__thesis.inspect()),overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)});await page.close();
}
for(const mode of ['no-js','no-webgl'])for(const width of [1440,390]){
const page=await browser.newPage({viewport:{width,height:width===390?844:1000},javaScriptEnabled:mode!=='no-js'});
if(mode==='no-webgl')await page.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return String(type).includes('webgl')?null:get.call(this,type,...args)};});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:4184/',{waitUntil:'networkidle'});await page.waitForTimeout(900);
await page.screenshot({path:out+mode+'-'+width+'-overview.png'});await chapter(page,'credits');await page.screenshot({path:out+mode+'-'+width+'-credits.png'});
report.push({mode,width,errors,headings:await page.locator('h1,h2').allTextContents(),poster:await page.locator('[data-cinematic-background] img').evaluate(el=>({complete:el.complete,width:el.naturalWidth,height:el.naturalHeight,opacity:getComputedStyle(el).opacity})),overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)});await page.close();
}
}finally{await browser.close();}
await writeFile(out+'report.json',JSON.stringify({reviewedAt:new Date().toISOString(),report},null,2));
console.log(JSON.stringify(report.map(({scene,headings,...item})=>({...item,sceneReady:scene?.ready,headingCount:headings?.length}))));
