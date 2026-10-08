import {createRequire} from 'node:module';
import {mkdir, writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const require = createRequire(new URL('../../../../../package.json', import.meta.url));
const {chromium, webkit} = require('@playwright/test');
const sharp = createRequire(require.resolve('next/package.json'))('sharp');
const origin = process.argv.find(a=>a.startsWith('--origin='))?.slice(9) ?? 'http://127.0.0.1:4186/';
const selected = process.argv.find(a=>a.startsWith('--profile='))?.slice(10);
const profiles = {desktop:[1440,1000],tablet:[1024,900],portrait:[768,1024],mobile:[390,844],narrow:[360,780],webkit:[1440,1000]};
assert(!selected || profiles[selected], 'Known profile required');
const output = fileURLToPath(new URL('../verification/round03/',import.meta.url));
await mkdir(output,{recursive:true});
const chapters=['overview','form','system','pattern','make','validation','credits'];
const artifactHTMLSHA256=createHash('sha256').update(await(await fetch(origin)).text()).digest('hex');
const report={origin,artifactHTMLSHA256,started:new Date().toISOString(),profiles:[],limits:['Browser emulation, not physical-device performance','Cropped and absent shots are intentional; original geometry checksum is verified separately']};
async function settle(page) {
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  await page.waitForFunction(()=>window.__story?.inspect().settled && !window.__story.inspect().scheduled,null,{timeout:30000});
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
}
async function at(page,id,phase) {
  await page.evaluate(({id,phase})=>{const e=document.getElementById(id);scrollTo({top:e.getBoundingClientRect().top+scrollY+e.offsetHeight*phase-innerHeight*.45,behavior:'instant'});},{id,phase});
  await settle(page);
}
for(const [name,[width,height]] of Object.entries(profiles).filter(([name])=>!selected||selected===name)) {
  const browser=await(name==='webkit'?webkit:chromium).launch(),context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1,isMobile:name==='mobile'||name==='narrow',hasTouch:name==='mobile'||name==='narrow'}),page=await context.newPage(),errors=[],shots=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  try{
    await page.goto(origin);await page.waitForFunction(()=>window.__thesis?.inspect().ready,null,{timeout:45000});
    for(const id of chapters){
      await at(page,id,.46);
      const state=await page.evaluate(()=>window.__thesis.inspect());
      assert.equal(state.source.vertices,172789);assert.equal(state.source.triangles,227521);assert.equal(state.source.sourceObjects,51);
      assert.equal(await page.locator('canvas').count(),1);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
      const path=output+name+'-'+id+'.png';await page.screenshot({path});
      shots.push({chapter:id,path,pose:state.pose,sourceVisible:state.sourceVisible,material:state.material,exhibition:state.exhibition,optics:state.optics,frames:state.frames});
    }
    if(process.argv.includes('--transitions'))for(const id of chapters.slice(0,-1)){
      await at(page,id,.94);const state=await page.evaluate(()=>window.__thesis.inspect());const path=output+name+'-'+id+'-exit.png';await page.screenshot({path});shots.push({chapter:id,transition:true,path,pose:state.pose,sourceVisible:state.sourceVisible});
    }
    assert.deepEqual(errors,[]);
    const thumbs=await Promise.all(shots.map(async (shot,index)=>({input:await sharp(shot.path).resize({width:width<600?195:360}).png().toBuffer(),left:(index%4)*(width<600?195:360),top:Math.floor(index/4)*Math.round(height*(width<600?195:360)/width)})));
    const thumbWidth=width<600?195:360,thumbHeight=Math.round(height*thumbWidth/width);
    await sharp({create:{width:thumbWidth*4,height:thumbHeight*Math.ceil(shots.length/4),channels:3,background:'#17201e'}}).composite(thumbs).png().toFile(output+name+'-contact-sheet.png');
    report.profiles.push({name,width,height,errors,shots});console.log(JSON.stringify({profile:name,shots:shots.length,sourceVerified:true,errors}));
  }finally{await browser.close();await writeFile(output+'visual-'+(selected??'all')+'.json',JSON.stringify(report,null,2)+'\n');}
}
