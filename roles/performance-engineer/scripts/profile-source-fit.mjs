/** Isolated browser CPU arithmetic, not a rendering or physical-device profile.
 * node roles/performance-engineer/scripts/profile-source-fit.mjs
 *   --engine webkit --ref ed59810 --out D:/.../round-09/verification
 * Imports exact committed source as in-memory modules; never ships a benchmark.
 */
import {chromium, webkit} from '@playwright/test';
import {execFileSync} from 'node:child_process';
import {mkdir, writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {platform, release as osRelease, cpus} from 'node:os';
import path from 'node:path';

const args=process.argv.slice(2), option=name=>args[args.indexOf(`--${name}`)+1];
const engine=args.includes('--engine')?option('engine'):'chromium';
if(!['chromium','webkit'].includes(engine))throw Error('Use chromium or webkit');
const ref=args.includes('--ref')?option('ref'):'HEAD';
const base=args.includes('--url')?option('url'):'https://joshsuan.github.io';
const out=path.resolve(args.includes('--out')?option('out'):'performance-results');
const prefix='roles/uiux-designer/cases/bending-active-thesis/components/';
const files=['vendor/cinematic-plan.mjs','source-scene-score.mjs','inspection-framing-support.mjs'];
const sources=Object.fromEntries(files.map(file=>[file,execFileSync('git',['show',`${ref}:${prefix}${file}`],{encoding:'utf8',maxBuffer:4*1024*1024})]));
const sourceSHA256=Object.fromEntries(Object.entries(sources).map(([file,source])=>[file,createHash('sha256').update(source).digest('hex')]));
const metadata=await(await fetch(`${base}/assets/thesis/source-diagrams.json`)).json();
const sourceCommit=execFileSync('git',['rev-parse',ref],{encoding:'utf8'}).trim();
const browser=await({chromium,webkit}[engine]).launch({headless:true});
try{
  const page=await browser.newPage();
  const measurements=await page.evaluate(async({sources,metadata})=>{
    const urls=[];
    const module=source=>{const url=URL.createObjectURL(new Blob([source],{type:'text/javascript'}));urls.push(url);return url;};
    const vendor=module(sources['vendor/cinematic-plan.mjs']);
    const score=await import(module(sources['source-scene-score.mjs'].replace("'./vendor/cinematic-plan.mjs'",JSON.stringify(vendor))));
    const {INSPECTION_FRAMING_SUPPORT:support}=await import(module(sources['inspection-framing-support.mjs']));
    const bounds={min:[0,1,2].map(i=>Math.min(...support.points.map(p=>p[i]))),max:[0,1,2].map(i=>Math.max(...support.points.map(p=>p[i])))};
    const families=score.prepareSourceFamilies(metadata,{bounds,points:support.points,revision:support.sourceSHA256});
    const results=[];
    let checksum=0;
    for(const aspect of [1.44,390/844])for(const [family,chapterIndex] of [['assembly',0],['representation',2],['experiment',3]])for(const weight of [0,1]){
      const selection={family,chapterId:['overview','form','system','pattern','make','validation','credits'][chapterIndex],chapterIndex};
      const playback={chapterWeights:Array.from({length:7},(_,i)=>+(i===chapterIndex)),phases:Array(7).fill(.32),activeSeconds:10};
      const run=i=>score.sampleSourceScenePose({playback,families,selection,aspect,viewport:{left:.06,top:.06,width:.88,height:.88},weight,
        chapterScene:{camera:{azimuthOffsetDeg:Math.sin(i*.013)*8,elevationOffsetDeg:Math.cos(i*.011)*4,distanceScale:1,fovScale:1}},pointer:{x:0,y:0}});
      for(let i=0;i<200;i++)checksum+=run(i).distance;
      const values=[];
      for(let batch=0;batch<100;batch++){
        const start=performance.now();
        for(let i=0;i<10;i++)checksum+=run(batch*10+i).distance;
        values.push((performance.now()-start)/10);
      }
      values.sort((a,b)=>a-b);
      results.push({aspect,family,studyWeight:weight,supportPoints:families[family].points.length,calls:1000,
        timing:'milliseconds per call, measured in batches of 10 after 200-call warmup',meanMs:values.reduce((a,b)=>a+b,0)/values.length,p50Ms:values[50],p95Ms:values[95],maxBatchMeanMs:values.at(-1)});
    }
    urls.forEach(url=>URL.revokeObjectURL(url));
    return{results,checksum};
  },{sources,metadata});
  const report={measuredAt:new Date().toISOString(),engine,browserVersion:browser.version(),os:`${platform()} ${osRelease()}`,cpu:cpus()[0]?.model,
    sourceCommit,sourceSHA256,metadataRevision:metadata.revision,methodology:'Isolated exact source module on a blank browser page; no WebGL, controller, layout, source rendering, transport timing or GPU timing. Batch averaging mitigates timer granularity; JIT and host scheduling remain material. Not physical iPhone evidence.',...measurements};
  await mkdir(out,{recursive:true});
  await writeFile(path.join(out,`${engine}-source-fit.json`),JSON.stringify(report,null,2));
  console.log(JSON.stringify(report,null,2));
}finally{await browser.close();}
