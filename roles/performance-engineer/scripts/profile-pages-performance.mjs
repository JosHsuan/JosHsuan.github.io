/** Real-time production-export profile. No clock mocks or per-frame snapshots.
 * Run one instance at a time; results are observations, not hardware guarantees.
 * node roles/performance-engineer/scripts/profile-pages-performance.mjs
 *   --engine chromium --out D:/.../baseline
 */
import {chromium, webkit} from '@playwright/test';
import {mkdir, writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {platform, release as osRelease, cpus} from 'node:os';

const options = Object.fromEntries(process.argv.slice(2).reduce((pairs, value, index, args) => value.startsWith('--') ? [...pairs, [value.slice(2), args[index + 1]]] : pairs, []));
const engine = options.engine ?? 'chromium';
if (!['chromium', 'webkit'].includes(engine)) throw Error('Use chromium or webkit');
const base = options.url ?? 'http://127.0.0.1:4186';
const directory = path.resolve(options.out ?? 'performance-results');
const resultName = `${engine}${options.scenario ? `-${options.scenario}` : ''}`;
const viewport = engine === 'webkit' ? {width:390,height:844} : {width:1440,height:1000};
const deviceScaleFactor = engine === 'webkit' ? 3 : 2;
const sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
await mkdir(directory, {recursive:true});
const published = await (await fetch(`${base}/release.json`)).json();
const artifactIndexSHA256=createHash('sha256').update(await (await fetch(base)).text()).digest('hex');
const report = {startedAt:new Date().toISOString(), engine, release:published, artifactIndexSHA256, os:`${platform()} ${osRelease()}`, cpu:cpus()[0]?.model,
  viewport, deviceScaleFactor, methodology:'Real wall clock; RAF histogram and bounded duration samples. Renderer memory values are resource counts; compositor bytes are estimated attachments, not total VRAM.',
  errors:[], crashes:[], samples:[], phases:[], lifecycle:{}, instrumentation:{rafReservoirLimit:4096,resourceSampleIntervalSeconds:5,cpuProfile:false,synchronousPerFrameGpuQueries:false}};
const browser = await ({chromium,webkit}[engine]).launch({headless:true});
report.browserVersion = browser.version();
const context = await browser.newContext({viewport,deviceScaleFactor,isMobile:engine==='webkit',hasTouch:engine==='webkit',reducedMotion:'no-preference'});
const page = await context.newPage();
page.on('crash', () => report.crashes.push({time:new Date().toISOString(),event:'page-crash'}));
page.on('pageerror', error => report.errors.push({type:'pageerror',message:error.message}));
page.on('console', message => {if(message.type()==='error')report.errors.push({type:'console',message:message.text()});});
await page.addInitScript(() => {
  const fresh = () => ({count:0,total:0,max:0,samples:new Float64Array(4096),buckets:Array(8).fill(0)});
  const bounds=[16.8,25,34,50,100,250,1000,Infinity];
  const add = (metric,value) => {metric.samples[metric.count%4096]=value;metric.count++;metric.total+=value;metric.max=Math.max(metric.max,value);metric.buckets[bounds.findIndex(limit=>value<=limit)]++;};
  let frames=fresh(),longtasks=fresh(),previous=0;
  const summary = metric => {const values=Array.from(metric.samples.subarray(0,Math.min(metric.count,4096))).sort((a,b)=>a-b);return {count:metric.count,mean:metric.count?metric.total/metric.count:0,max:metric.max,p50:values[Math.floor(values.length*.5)]??0,p95:values[Math.floor(values.length*.95)]??0,p99:values[Math.floor(values.length*.99)]??0,buckets:metric.buckets,bucketUpperBounds:bounds.map(v=>Number.isFinite(v)?v:'Infinity'),quantiles:'last 4096 bounded observations'};};
  const tick=now=>{if(previous&&!document.hidden)add(frames,now-previous);previous=now;requestAnimationFrame(tick);};requestAnimationFrame(tick);
  document.addEventListener('visibilitychange',()=>{previous=0;});
  let observer;
  if(PerformanceObserver.supportedEntryTypes?.includes('longtask')){observer=new PerformanceObserver(list=>list.getEntries().forEach(entry=>add(longtasks,entry.duration)));observer.observe({type:'longtask',buffered:true});}
  const contextLoss=[];
  document.addEventListener('webglcontextlost',()=>contextLoss.push(performance.now()),true);
  window.__performanceProfile={reset(){frames=fresh();longtasks=fresh();previous=0;},summary(){return {raf:summary(frames),longtasks:observer?summary(longtasks):null,contextLoss:[...contextLoss],visibility:document.visibilityState};}};
});
let cdp;
if(engine==='chromium'){cdp=await context.newCDPSession(page);await cdp.send('Performance.enable');}
const sample = async phase => {
  const value = await page.evaluate(() => {
    const scene=window.__thesis?.inspect(),story=window.__story?.inspect();
    return {time:performance.now(),visibility:document.visibilityState,canvasCount:document.querySelectorAll('canvas').length,scrollY,
      ready:scene?.ready,detail:scene?.detail,frames:scene?.frames,controllerFrame:story?.controllerFrame,activeSeconds:story?.playback?.activeSeconds,
      chapter:story?.playback?.chapterId,representation:scene?.representation?.id,renderer:scene?.renderer,memory:scene?.memory,
      compositor:scene?.compositor?{width:scene.compositor.width,height:scene.compositor.height,dpr:scene.compositor.dpr,approximateTargetBytes:scene.compositor.approximateTargetBytes,passes:scene.compositor.passes,requestedSamples:scene.compositor.requestedSamples}:null,
      performancePolicy:scene?.performance??scene?.renderPolicy??null,renderBudget:scene?.renderBudget??null,renderPressure:scene?.renderPressure??null,domPublication:story?.domPublication??null,lifecycle:story?.lifecycle??null,metrics:window.__performanceProfile.summary(),domNodes:document.getElementsByTagName('*').length};
  });
  if(cdp){const metrics=await cdp.send('Performance.getMetrics');value.cdp=Object.fromEntries(metrics.metrics.filter(v=>['JSHeapUsedSize','JSHeapTotalSize','Nodes','Documents','LayoutCount','RecalcStyleCount','LayoutDuration','RecalcStyleDuration','TaskDuration','ScriptDuration'].includes(v.name)).map(v=>[v.name,v.value]));}
  report.samples.push({phase,...value});
  return value;
};
const flush = () => writeFile(path.join(directory,`${resultName}-profile.json`),JSON.stringify(report,null,2));
const phase = async (name,seconds,action) => {
  console.log(JSON.stringify({engine,phase:name,seconds}));
  await page.evaluate(()=>window.__performanceProfile.reset());
  const initial=await sample(name),start=Date.now();let nextSample=0,nextAction=0;
  while(Date.now()-start<seconds*1000){
    const elapsed=(Date.now()-start)/1000;
    if(action&&elapsed>=nextAction){await action(elapsed);nextAction=elapsed+1;}
    if(elapsed>=nextSample){await sample(name);nextSample=elapsed+5;await flush();}
    await sleep(250);
  }
  const final=await sample(name);
  const value={name,elapsedSeconds:(Date.now()-start)/1000,renderedFrames:(final.frames??0)-(initial.frames??0),controllerFrames:(final.controllerFrame??0)-(initial.controllerFrame??0),storySeconds:(final.activeSeconds??0)-(initial.activeSeconds??0),cadence:final.metrics};
  report.phases.push(value);await flush();console.log(JSON.stringify({engine,completed:name,...value}));
};
try {
  await page.goto(base,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>window.__thesis?.inspect().ready,{},{timeout:120000});
  report.gpu=await page.evaluate(()=>{const canvas=document.querySelector('canvas'),gl=canvas?.getContext('webgl2');if(!gl)return null;const extension=gl.getExtension('WEBGL_debug_renderer_info');return {vendor:gl.getParameter(gl.VENDOR),renderer:gl.getParameter(gl.RENDERER),unmaskedVendor:extension?gl.getParameter(extension.UNMASKED_VENDOR_WEBGL):null,unmaskedRenderer:extension?gl.getParameter(extension.UNMASKED_RENDERER_WEBGL):null};});
  await phase('warmup-full',15);
  const traverse = offset => async elapsed => {
    const chapter=Math.floor(elapsed/12+offset)%7,progress=(elapsed%12)/12;
    await page.evaluate(({chapter,progress})=>{const sections=[...document.querySelectorAll('[data-story-chapter]')];const el=sections[chapter];let top=0;for(let node=el;node;node=node.offsetParent)top+=node.offsetTop;window.scrollTo({top:Math.max(0,top+Math.max(0,el.offsetHeight-innerHeight*.8)*progress),behavior:'instant'});},{chapter,progress});
    if(engine==='chromium'&&chapter>=1&&chapter<=3){const surface=page.locator('[data-model-viewport]').nth(chapter-1),box=await surface.boundingBox();if(box&&box.y>=0&&box.y<viewport.height)await page.mouse.move(box.x+box.width*.55,Math.min(viewport.height-20,box.y+box.height*.45));}
  };
  if(options.scenario === 'stationary') {
    await phase('full-stationary',25);
  } else if(options.scenario !== 'lifecycle') {
  await phase('full-traverse',84,traverse(0));
  await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
  await phase('full-stationary',25);
  await page.getByLabel('Visual detail').selectOption('light');
  await phase('light-traverse',60,traverse(1));
  }
  await page.getByRole('button',{name:'Pause motion',exact:true}).click();
  await sleep(2000);
  await phase('paused',10);
  await page.getByRole('button',{name:'Resume motion',exact:true}).click();
  await phase('resumed',10);
  const second=await context.newPage();await second.goto('about:blank');await second.bringToFront();await sleep(500);
  report.lifecycle.backgroundAttempt={method:'second tab bringToFront',actualHidden:await page.evaluate(()=>document.hidden)};
  if(report.lifecycle.backgroundAttempt.actualHidden)await phase('hidden',10);
  else report.lifecycle.backgroundAttempt.limitation='Headless engine kept the original tab visible; no synthetic hidden state substituted.';
  await second.close();await page.bringToFront();
  await phase('after-background-attempt',5);
  await page.screenshot({path:path.join(directory,`${resultName}-final.png`)});
  report.completedAt=new Date().toISOString();
}catch(error){report.failure={message:error.message,stack:error.stack};console.error(error);process.exitCode=1;}
finally{await flush();await browser.close();}
