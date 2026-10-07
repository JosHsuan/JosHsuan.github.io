import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {executablePath} from './browser-path.mjs';
const require=createRequire(new URL('../../../package.json',import.meta.url));
const {chromium}=require('@playwright/test');
const out='D:/JosHsuan_Website/_work/bending-active-thesis/cinematic-integration/verification/director-boundaries/revised/';await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath,headless:true});
const report=[];
try{
for(const width of [1440,390]){
const page=await browser.newPage({viewport:{width,height:width===390?844:1000},deviceScaleFactor:1});
await page.goto('http://127.0.0.1:4184/',{waitUntil:'networkidle'});
await page.waitForFunction(()=>window.__thesis?.inspect().ready,{timeout:30000});
const canvas=await page.locator('canvas').elementHandle();
for(const id of (width===1440?['form','system','pattern','make','validation','credits']:['pattern','make'])){
const y=await page.locator('[data-story-chapter="'+id+'"]').evaluate(el=>el.getBoundingClientRect().top+window.scrollY-innerHeight*.5);
await page.evaluate(y=>window.scrollTo(0,y),y);await page.waitForTimeout(650);
await page.screenshot({path:out+width+'-before-'+id+'.png'});
report.push(await page.evaluate(({id,width})=>({id,width,scrollY,chapter:window.__thesis.inspect().pose?.chapter,canvasCount:document.querySelectorAll('canvas').length,pose:window.__thesis.inspect().pose,overflow:document.documentElement.scrollWidth>innerWidth}),{id,width}));
}
report.push({width,sameCanvas:await canvas.evaluate(el=>el===document.querySelector('canvas'))});
await page.close();
}
}finally{await browser.close();}
await writeFile(out+'report.json',JSON.stringify({reviewedAt:new Date().toISOString(),report},null,2));
console.log(JSON.stringify(report.map(({pose,...item})=>item)));
