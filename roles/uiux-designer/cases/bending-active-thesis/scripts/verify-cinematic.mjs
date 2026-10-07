import {createRequire} from 'node:module';
import {mkdir, writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const {chromium, webkit, devices} = createRequire(new URL('../../../../../package.json', import.meta.url))('@playwright/test');
const executablePath = 'C:/Users/JosHsuan/AppData/Local/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-win64/chrome-headless-shell.exe';
const output = 'D:/JosHsuan_Website/_work/bending-active-thesis/cinematic-integration/verification';
const origin = 'http://127.0.0.1:4184/', results = [], failures = [], metrics = [];
await mkdir(output, {recursive:true});
async function check(name, fn) {try {await fn(); results.push({name,passed:true}); console.log('PASS '+name);} catch(e) {failures.push({name,error:e.message}); console.log('FAIL '+name+' '+e.message.slice(0,220));}}
const waitReady = p => p.waitForFunction(()=>window.__thesis?.inspect().ready,null,{timeout:40000});
const state = p => p.evaluate(()=>window.__thesis.inspect());
async function chapter(p,id) {await p.evaluate(id=>{const el=document.getElementById(id); scrollTo(0,el.offsetTop+el.offsetHeight*.45-innerHeight*.45);},id);await p.waitForTimeout(200);}
for (const profile of ['chromium','webkit','mobile']) {
  const browser=await(profile==='webkit'?webkit:chromium).launch(profile==='webkit'?{headless:true}:{headless:true,executablePath});
  const context=await browser.newContext(profile==='mobile'?{...devices['Pixel 7']}:{viewport:{width:1440,height:1000},deviceScaleFactor:1});
  const page=await context.newPage(), errors=[],requests=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('request',r=>requests.push(r.url()));
  try {
    await page.goto(origin); await waitReady(page);
    await check(profile+'/single full viewport scene and truthful geometry', async()=>{
      assert.equal(await page.locator('canvas').count(),1);assert.equal(await page.locator('[data-story-chapter]').count(),7);
      assert((await page.locator('h1').getAttribute('aria-label')).includes('Metal Panel'));
      const s=await state(page); assert.equal(s.renderer.triangles,131881); assert.equal(s.renderer.calls,1); assert.equal(s.pose.owner,'cinematic-composite');
      const box=await page.locator('canvas').boundingBox(), view=page.viewportSize(); assert.equal(box.width,view.width); assert.equal(box.height,view.height);
      await page.evaluate(()=>window.__originalCanvas=document.querySelector('canvas'));
      assert.equal(await page.locator('[data-cinematic-background] img').evaluate(i=>i.complete&&i.naturalWidth>0),true);
    });
    await check(profile+'/native wheel or touch and keyboard reading',async()=>{
      await page.evaluate(()=>scrollTo(0,0)); await page.waitForTimeout(100);const before=await state(page);
      if(profile==='mobile') {
        const session=await context.newCDPSession(page);
        await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:190,y:650}]});
        for(let y=610;y>=250;y-=40){await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:190,y}]});await page.waitForTimeout(20);}
        await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]}); await session.detach();
      } else await page.mouse.wheel(0,380);
      await page.waitForTimeout(400); assert((await state(page)).u>before.u); const y=await page.evaluate(()=>scrollY);
      await page.keyboard.press('PageDown');await page.waitForTimeout(250);assert(await page.evaluate(()=>scrollY)>y);
    });
    await check(profile+'/seven measured chapters, stable canvas and reversible shader',async()=>{
      const poses=[];
      for(const id of ['overview','form','system','pattern','make','validation','credits']) {
        await chapter(page,id);const s=await state(page);assert.equal(s.pose.chapter.id,id);assert.equal(await page.evaluate(()=>document.querySelector('canvas')===window.__originalCanvas),true);poses.push(s.pose.position);
        for(const panel of await page.locator(`#${id} [data-story-panel]`).all()) assert.equal(await panel.evaluate(el=>getComputedStyle(el).opacity),'1');
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
      }
      assert.equal(new Set(poses.map(p=>JSON.stringify(p))).size,7);
      await chapter(page,'pattern');const first=await state(page),pixels=await page.locator('canvas').screenshot();assert(first.material.emphasis>.5);
      await chapter(page,'form');assert.equal((await state(page)).material.emphasis,0);
      await chapter(page,'pattern');assert.deepEqual((await state(page)).pose,first.pose);assert(pixels.equals(await page.locator('canvas').screenshot()));
      assert.equal(requests.filter(u=>u.endsWith('/assembly.glb')).length,1);assert.equal(requests.filter(u=>u.endsWith('/studio-small.hdr')).length,1);
    });
    await check(profile+'/decorative pointer preserves semantic state and settles',async()=>{
      await chapter(page,'overview');await page.mouse.move(10,10);await page.waitForTimeout(850);const a=await state(page);const first=await page.locator('canvas').screenshot();
      await page.mouse.move(page.viewportSize().width-10,page.viewportSize().height-30);await page.waitForTimeout(950);const b=await state(page);
      assert.equal(b.u,a.u);assert.equal(b.pose.chapter.id,a.pose.chapter.id);assert.equal(b.material.emphasis,a.material.emphasis);
      if(profile==='mobile') assert.deepEqual(b.pose.pointerDegrees,[0,0]);
      else {assert.notDeepEqual(b.pose.position,a.pose.position);assert(!first.equals(await page.locator('canvas').screenshot()));assert(Math.abs(b.pose.pointerDegrees[0])<=1.25&&Math.abs(b.pose.pointerDegrees[1])<=.8);}
      await page.evaluate(()=>window.dispatchEvent(new Event('blur')));await page.waitForFunction(()=>window.__thesis.inspect().pose.pointerDegrees.every(n=>n===0),null,{timeout:5000});assert.deepEqual((await state(page)).pose.pointerDegrees,[0,0]);
      // A coarse pointer is already zero before the queued blur frame runs.
      // Flush that bounded DOM/Fiber invalidation before measuring idle work.
      await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))));
      const frames=(await state(page)).frames;await page.waitForTimeout(500);assert.equal((await state(page)).frames,frames);
    });
    await check(profile+'/manual pause and live reduced motion keep reading',async()=>{
      await page.getByRole('button',{name:'Pause motion',exact:true}).click();await page.waitForTimeout(150);const before=(await state(page)).pose.position;
      await chapter(page,'make');assert.deepEqual((await state(page)).pose.position,before);
      await page.getByRole('button',{name:'Resume motion',exact:true}).click();await page.waitForTimeout(150);
      await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(150);const fixed=(await state(page)).pose.position;
      await chapter(page,'overview');await page.mouse.move(300,250);await page.waitForTimeout(200);assert.deepEqual((await state(page)).pose.position,fixed);assert.equal((await state(page)).material.emphasis,0);
      assert(await page.getByRole('button',{name:'Reduced motion',exact:true}).isDisabled());
      await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForTimeout(200);assert.equal((await state(page)).reduced,false);
    });
    await check(profile+'/resource stability, complete images and clean shader console',async()=>{
      const before=await state(page);for(let i=0;i<3;i++){await chapter(page,'credits');await chapter(page,'overview');}
      const after=await state(page);assert.deepEqual(after.memory,before.memory);assert.equal(after.renderer.programs,before.renderer.programs);
      for(const img of await page.locator('main img').all()){await img.scrollIntoViewIfNeeded();await img.evaluate(i=>i.decode());}
      assert.deepEqual(errors,[]); metrics.push({profile,state:await state(page),resources:await page.evaluate(()=>performance.getEntriesByType('resource').map(r=>({name:r.name,bytes:r.encodedBodySize,duration:r.duration})))});
    });
  } finally {await context.close();await browser.close();}
}
const browser=await chromium.launch({headless:true,executablePath});
try {
  await check('no JavaScript preserves all text, evidence images and actual model poster',async()=>{
    const p=await browser.newPage({javaScriptEnabled:false,viewport:{width:390,height:844}});await p.goto(origin);
    assert.equal(await p.locator('[data-story-chapter]').count(),7);assert.equal(await p.locator('canvas').count(),0);
    for(const img of await p.locator('img').all()){await img.scrollIntoViewIfNeeded();await img.evaluate(i=>i.decode());}
    assert((await p.locator('main').innerText()).includes('regression'));assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    await p.screenshot({path:`${output}/no-js.png`});await p.close();
  });
  await check('initial reduced motion uses poster and avoids scene transfer',async()=>{
    const p=await browser.newPage({reducedMotion:'reduce'}),seen=[];p.on('request',r=>seen.push(r.url()));await p.goto(origin);await p.waitForTimeout(600);
    assert.equal(await p.locator('canvas').count(),0);assert(!seen.some(u=>u.endsWith('.glb')||u.endsWith('.hdr')));assert(await p.getByRole('button',{name:'Reduced motion'}).isDisabled());await p.close();
  });
  await check('Save-Data starts with poster and allows deliberate 3D',async()=>{
    const p=await browser.newPage();await p.addInitScript(()=>Object.defineProperty(navigator,'connection',{value:{saveData:true},configurable:true}));await p.goto(origin);await p.getByRole('button',{name:'Enable 3D'}).waitFor();assert.equal(await p.locator('canvas').count(),0);await p.getByRole('button',{name:'Enable 3D'}).click();await waitReady(p);await p.close();
  });
  await check('model failure leaves complete reading and still background',async()=>{
    const p=await browser.newPage();await p.route('**/assets/assembly.glb',r=>r.abort());await p.goto(origin);await p.getByRole('button',{name:'Still background'}).waitFor({timeout:20000});assert.equal(await p.locator('canvas').count(),0);assert.equal(await p.locator('[data-story-chapter]').count(),7);assert(await p.locator('[data-cinematic-background] img').evaluate(i=>i.complete&&i.naturalWidth>0));await p.close();
  });
  await check('unavailable WebGL and context loss fall back without losing content',async()=>{
    const p=await browser.newPage();await p.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return /^webgl|experimental-webgl/.test(type)?null:original.call(this,type,...args);};});await p.goto(origin);await p.getByRole('button',{name:'Still background'}).waitFor();assert.equal(await p.locator('canvas').count(),0);await p.close();
    const q=await browser.newPage();await q.goto(origin);await waitReady(q);await q.evaluate(()=>window.__thesis.loseContext());await q.getByRole('button',{name:'Still background'}).waitFor();assert.equal(await q.locator('canvas').count(),0);assert.equal(await q.locator('[data-story-chapter]').count(),7);await q.close();
  });
  await check('static artifact excludes source paths, documents and Studio',async()=>{
    const html=await(await fetch(origin)).text();assert(!/D:\\|E:\\|portfolio-preparation|Final_Model\.3dm|Theatre Studio/.test(html));
    const meta=await(await fetch(origin+'assets/model.json')).json();assert.equal(meta.publishable,false);
    assert.equal((await fetch(origin,{method:'POST'})).status,403);assert.equal((await fetch(origin+'source.pdf')).status,404);
  });
} finally {await browser.close();}
await writeFile(`${output}/browser.json`,JSON.stringify({verifiedAt:new Date().toISOString(),results,failures,metrics,limits:['Mobile emulation, not a physical phone','Firefox assertions not run; host launch previously failed','Local review only; structural and publication rights not validated']},null,2));
console.log(JSON.stringify({passed:results.length,failures}));if(failures.length)process.exitCode=1;
