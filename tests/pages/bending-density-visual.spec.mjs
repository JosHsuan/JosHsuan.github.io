import {test,expect} from '@playwright/test';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {PerspectiveCamera,Vector3} from 'three';
import {sampleChapterScene} from '../../roles/uiux-designer/cases/bending-active-thesis/components/chapter-scene-score.mjs';
import {WAIT,settle,hitPoint} from './case-helpers.mjs';

const catalog=JSON.parse(await readFile(new URL('../../roles/uiux-designer/cases/bending-active-thesis/release/public/assets/thesis/source-diagrams.json',import.meta.url),'utf8'));
const source=catalog.representations.find(item=>item.id==='bending');
const playback={chapterWeights:[0,0,1,0,0,0,0],phases:Array(7).fill(.32),activeSeconds:0};
const chapterScene=sampleChapterScene(playback,{aspect:1.44,reducedMotion:false,pointer:{x:0,y:0,active:false}});
const fixture={stageU:2.5/7,visualU:2.5/7,playback,chapterScene,sourceSelection:{chapterId:'system',index:2,selectedAt:0}};
for(const dpr of [1,2])test.describe(`visual-only device DPR ${dpr}`,()=>{
 test.use({viewport:{width:1440,height:1000},deviceScaleFactor:dpr,isMobile:false,hasTouch:false});
 test('same authored System source pose at the actual density budget',async({page},info)=>{
  // Explicitly approved standalone visual budget, not a service threshold.
  // No synthetic clock or production change. Debug score is VISUAL ONLY.
  test.setTimeout(150000);
  const receipt={purpose:'Deterministic visual-only fixture; not native-motion or performance evidence',dpr,fixture};let primaryError;
  try{
   expect((await page.goto('/projects/bending-active/')).status()).toBe(200);await page.evaluate(()=>document.fonts.ready);
   await expect.poll(()=>page.evaluate(()=>({entry:window.__site?.inspect().phase,ready:window.__thesis?.inspect().ready,reduced:window.__thesis?.inspect().systemReduced,detail:window.__thesis?.inspect().detail})),{timeout:WAIT}).toEqual({entry:'entered',ready:true,reduced:false,detail:'full'});
   const pause=page.locator('[data-bending-motion-toggle]');await pause.click();await expect(pause).toHaveAttribute('aria-pressed','true');
   await page.locator('[data-story-navigation] a[href="#system"]').click();
   // Genuine native wheel positions the source passage; no scroll setter or
   // element focus injection is used. The debug score does not own DOM layout.
   const goal=await page.evaluate(()=>{const top=el=>{let y=0;for(let n=el;n;n=n.offsetParent)y+=n.offsetTop;return y;};const section=document.getElementById('system'),next=document.getElementById('pattern');return Math.max(0,(top(section)+top(next))/2-innerHeight*.62);});
   await page.mouse.wheel(0,goal-await page.evaluate(()=>scrollY));await expect.poll(()=>page.evaluate(target=>Math.abs(scrollY-target),goal),{timeout:WAIT}).toBeLessThanOrEqual(1);await settle(page);
   await page.evaluate(value=>window.__thesis.setOverrides(value),fixture);await settle(page);
   await expect.poll(()=>page.evaluate(()=>({id:window.__thesis.inspect().representation.id,chapter:window.__thesis.inspect().representation.chapterId,visible:window.__thesis.inspect().canvasPlacement.visible})),{timeout:WAIT}).toEqual({id:'bending',chapter:'system',visible:true});
   const capture=()=>page.evaluate(()=>{const s=window.__thesis.inspect(),canvas=document.querySelector('[data-cinematic-stage] canvas'),r=canvas.getBoundingClientRect();return{pose:s.pose,lights:s.lights,optics:s.optics,chapterScene:s.chapterScene,source:s.source,diagramSource:s.diagramSource,representation:s.representation,renderBudget:s.renderBudget,renderPressure:s.renderPressure,renderer:s.renderer,rendererBudget:s.rendererBudget,compositor:s.compositor,stageLayout:s.stageLayout,shadowUpdated:s.shadowUpdated,detail:s.detail,reduced:s.systemReduced,paused:s.motionPaused,engaged:s.modelEngaged,renderSuspended:s.renderSuspended,canvas:{width:canvas.width,height:canvas.height,cssWidth:canvas.clientWidth,cssHeight:canvas.clientHeight,rect:{left:r.left,top:r.top,width:r.width,height:r.height}},viewport:{width:innerWidth,height:innerHeight,dpr:devicePixelRatio},y:scrollY};});
   receipt.before=await capture();const s=receipt.before;expect(s.viewport).toEqual({width:1440,height:1000,dpr});expect(s.reduced).toBe(false);expect(s.paused).toBe(true);expect(s.engaged).toBe(false);expect(s.detail).toBe('full');expect(s.renderSuspended).toBe(false);expect(s.chapterScene).toEqual(chapterScene);expect(s.representation.assetRevision).toBe(catalog.revision);expect(s.representation.triangles).toBe(106879);expect(s.representation.vertices).toBe(source.vertices);
   const p=s.pose,camera=new PerspectiveCamera(p.fov,p.aspect,p.near,p.far);camera.position.fromArray(p.position);camera.up.fromArray(p.up);camera.lookAt(...p.target);camera.setViewOffset(s.canvas.cssWidth,s.canvas.cssHeight,s.canvas.cssWidth*p.viewOffsetNormalized.x,s.canvas.cssHeight*p.viewOffsetNormalized.y,s.canvas.cssWidth,s.canvas.cssHeight);camera.updateProjectionMatrix();camera.updateMatrixWorld(true);
   const point=new Vector3(),margins=[Infinity,Infinity,Infinity,Infinity];let near=Infinity,far=-Infinity;
   for(const v of source.framingSupport.points){point.fromArray(v).project(camera);const x=(point.x+1)/2,y=(1-point.y)/2,q=p.viewport;const gaps=[(x-q.left)/q.width,(q.left+q.width-x)/q.width,(y-q.top)/q.height,(q.top+q.height-y)/q.height];gaps.forEach((gap,i)=>{margins[i]=Math.min(margins[i],gap);});near=Math.min(near,point.z);far=Math.max(far,point.z);}
   margins.forEach(gap=>expect(gap).toBeGreaterThanOrEqual(.0299));expect(near).toBeGreaterThan(-1);expect(far).toBeLessThan(1);receipt.projection={points:source.framingSupport.points.length,margins,near,far};
   receipt.hitPoint=await hitPoint(page,'system');receipt.hit=await page.evaluate(({x,y})=>window.__thesis.hitTest(x,y),receipt.hitPoint);expect(receipt.hit).toMatchObject({source:true,representationId:'bending',chapterId:'system',index:2});
   const samePose={pose:s.pose,lights:s.lights,optics:s.optics,chapterScene:s.chapterScene,stageLayout:s.stageLayout,assetRevision:s.representation.assetRevision,sourceGeometry:source.geometrySHA256};receipt.samePose=samePose;receipt.samePoseSHA256=createHash('sha256').update(JSON.stringify(samePose)).digest('hex');
   const path=info.outputPath(`system-bending-dpr${dpr}.png`);await page.screenshot({path,scale:'device'});await info.attach(`system-bending-dpr${dpr}`,{path,contentType:'image/png'});
   receipt.after=await capture();for(const field of ['pose','lights','optics','chapterScene','stageLayout','renderBudget'])expect(receipt.after[field]).toEqual(s[field]);expect(receipt.after.y).toBe(s.y);
  }catch(error){primaryError=error;receipt.error=String(error);throw error;}finally{
   try{const path=info.outputPath(`system-bending-dpr${dpr}.json`);await writeFile(path,JSON.stringify(receipt,null,2));await info.attach(`system-bending-dpr${dpr}-receipt`,{path,contentType:'application/json'});}catch(error){if(!primaryError)throw error;}
  }
 });
});
