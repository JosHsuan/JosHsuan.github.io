import {createRequire} from 'node:module';
import {mkdir,writeFile,copyFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {executablePath} from './browser-path.mjs';
import {studies,preset} from '../src/catalog.js';
const {chromium}=createRequire(new URL('../../../package.json',import.meta.url))('@playwright/test');
const browser=await chromium.launch({executablePath,headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1100},deviceScaleFactor:1});
const captures=[];let errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&!m.text().includes('404'))errors.push(m.text());});
await mkdir(new URL('../dist/assets/posters/',import.meta.url),{recursive:true});
try{for(const study of studies)for(const variant of ['a','b']){
 await page.goto(`http://127.0.0.1:4180/?study=${study.id}&variant=${variant}`);
 await page.getByRole('button',{name:'Open live stage',exact:true}).click();
 await page.waitForFunction(()=>window.__artist3d?.inspect().frames>=1);
 await page.waitForTimeout(180);
 if(['physics','particles'].includes(study.id)){
   if(study.id==='physics')await page.waitForFunction(()=>window.__artist3d?.inspect().bodies?.length===12);
   for(let i=0;i<90;i++){await page.evaluate(()=>window.__artist3d.step());await page.waitForFunction(target=>window.__artist3d.inspect().time>=target,(i+1)/60-1e-8);}
 }
 const state=await page.evaluate(()=>window.__artist3d.inspect());
 const bytes=await page.locator('canvas').screenshot({style:'.stage-badge{visibility:hidden}'});
 const name=`${study.id}-${variant}.png`;
 await writeFile(new URL(`../assets/posters/${name}`,import.meta.url),bytes);
 await writeFile(new URL(`../dist/assets/posters/${name}`,import.meta.url),bytes);
 captures.push({id:study.id,variant,path:`assets/posters/${name}`,params:preset(study,variant),actualState:state,viewport:{width:1440,height:1100},sha256:createHash('sha256').update(bytes).digest('hex'),capture:'Actual Chromium canvas; deterministic 90 manual steps for physics/particles, initial pose for static studies.',capturedAt:new Date().toISOString()});
 console.log(name,state.time,state.physicsSteps);
 await page.getByRole('button',{name:'Close live stage',exact:true}).click();
}
if(errors.length)throw new Error(errors.join('\n'));
await writeFile(new URL('../catalog/previews.manifest.json',import.meta.url),JSON.stringify({captures},null,2)+'\n');
await copyFile(new URL('../catalog/previews.manifest.json',import.meta.url),new URL('../dist/catalog/previews.manifest.json',import.meta.url));
await page.goto('http://127.0.0.1:4180/');await page.screenshot({path:fileURLToPath(new URL('../verification/screenshots/desk.png',import.meta.url)),fullPage:true});
}finally{await browser.close();}
