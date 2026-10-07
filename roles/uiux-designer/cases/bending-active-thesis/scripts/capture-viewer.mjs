import {createRequire} from 'node:module';
import {mkdir,copyFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const {chromium}=createRequire(new URL('../../../../../package.json',import.meta.url))('@playwright/test');
const executablePath='C:/Users/JosHsuan/AppData/Local/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-win64/chrome-headless-shell.exe';
const browser=await chromium.launch({headless:true,executablePath});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});const errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.goto('http://127.0.0.1:4184/');await page.getByRole('button',{name:'Explore the model'}).click();
 await page.waitForFunction(()=>window.__thesis?.inspect().ready,{},{timeout:45000});await page.waitForTimeout(500);
 const canvas=page.locator('canvas');await canvas.scrollIntoViewIfNeeded();
 await mkdir(new URL('../verification/',import.meta.url),{recursive:true});
 const caption=page.getByText('Source geometry · neutral metal finish').locator('..');
 await caption.evaluate(el=>el.style.visibility='hidden');
 await canvas.screenshot({path:fileURLToPath(new URL('../public/assets/model-poster.png',import.meta.url))});
 await caption.evaluate(el=>el.style.visibility='');
 await copyFile(new URL('../public/assets/model-poster.png',import.meta.url),new URL('../out/assets/model-poster.png',import.meta.url));
 await page.screenshot({path:fileURLToPath(new URL('../verification/viewer.png',import.meta.url))});
 const state=await page.evaluate(()=>window.__thesis.inspect());
 await writeFile(new URL('../verification/first-render.json',import.meta.url),JSON.stringify({errors,state},null,2));
 console.log(JSON.stringify({errors,state},null,2));
}finally{await browser.close();}
