import {createRequire} from 'node:module';
import {mkdir,readFile,writeFile,copyFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const require=createRequire(new URL('../../../../../package.json',import.meta.url));
const {chromium}=require('@playwright/test'),sharp=createRequire(require.resolve('next/package.json'))('sharp');
const prepared='D:/JosHsuan_Website/_work/bending-active-thesis/round-03/prepared';
const release=fileURLToPath(new URL('../release/',import.meta.url));
await mkdir(prepared,{recursive:true});
const browser=await chromium.launch(),records=[];
try {
  for(const [width,height,name] of [[1440,1000,'model-poster.webp'],[390,844,'model-poster-mobile.webp']]) {
    const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
    await page.goto('http://127.0.0.1:4186/');await page.waitForFunction(()=>window.__thesis?.inspect().ready,null,{timeout:45000});
    const before=await page.evaluate(()=>window.__thesis.inspect().frames);
    await page.evaluate(()=>window.__thesis.setOverrides({stageU:1.5/7,visualU:1.5/7,optical:{apertureScale:0,maxBlurPx:0,asciiWeight:0,mistStrength:0}}));
    await page.waitForFunction(before=>window.__thesis.inspect().frames>before,before);
    const state=await page.evaluate(()=>window.__thesis.inspect());assert.equal(state.pose.framingIntent,'held-source');assert(state.sourceVisible);
    await page.addStyleTag({content:'body > :not([data-cinematic-background]){visibility:hidden!important}[data-cinematic-background] > :not(:has(canvas)){display:none!important}'});
    const png=await page.locator('canvas').screenshot({path:prepared+'/'+name.replace('.webp','.png')});
    const bytes=await sharp(png).webp({quality:88}).toBuffer();await writeFile(prepared+'/'+name,bytes);
    records.push({path:'assets/cinematic/'+name,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),width,height,material:state.material.version});await page.close();
  }
}finally{await browser.close();}
await writeFile(prepared+'/poster-capture.json',JSON.stringify({capturedAt:new Date().toISOString(),operation:'Actual round-three FORM render, source shell/base and exhibition, sharp scene-only capture',records},null,2)+'\n');
if(process.argv.includes('--release')) {
  const manifest=JSON.parse(await readFile(release+'manifest.json','utf8'));
  for(const record of records) {
    await copyFile(prepared+'/'+record.path.split('/').at(-1),release+'public/'+record.path);
    const entry=manifest.assets.find(asset=>asset.path===record.path);assert(entry);
    entry.bytes=record.bytes;entry.sha256=record.sha256;entry.source='Owner-authorized round-three actual-model FORM capture with editorial stage';
  }
  await writeFile(release+'manifest.json',JSON.stringify(manifest,null,2)+'\n');
}
console.log(JSON.stringify({prepared,releaseUpdated:process.argv.includes('--release'),records}));
