import {test,expect} from '@playwright/test';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import * as T from 'three';
import {MeshoptDecoder} from 'three/addons/libs/meshopt_decoder.module.js';
import {WAIT,frames,scenarioTimeout} from './case-helpers.mjs';

const root=new URL('../../roles/uiux-designer/cases/bending-active-thesis/',import.meta.url);
const project=JSON.parse(await readFile(new URL('release/project-studies.json',root),'utf8')).projects.find(row=>row.id==='dot-based-3d-printing');
const bytes=await readFile(new URL('release/public'+project.model.src,root));
const sourceSHA=createHash('sha256').update(bytes).digest('hex');
const jsonLength=bytes.readUInt32LE(12),gltf=JSON.parse(bytes.subarray(20,20+jsonLength)),compression=gltf.bufferViews[0].extensions.EXT_meshopt_compression;
await MeshoptDecoder.ready;
const decoded=new Uint8Array(compression.count*compression.byteStride);MeshoptDecoder.decodeGltfBuffer(decoded,compression.count,compression.byteStride,bytes.subarray(28+jsonLength+compression.byteOffset,28+jsonLength+compression.byteOffset+compression.byteLength),compression.mode,compression.filter);
const points=new Float32Array(decoded.buffer),selected=[];
for(let i=0;i<points.length;i+=3)if(points[i]>=.49&&points[i+1]>=.155&&points[i+2]<=-.05)selected.push(i/3);
const route=`/projects/${project.slug}/`,media=project.motionMedia[0];
const facts=page=>page.evaluate(()=>{const driver=window.__globalBackground.inspect().driver;return{y:scrollY,scene:driver.projectStudy.scene,backdrop:driver.projectStudy.backdrop,activeSeconds:driver.playback.activeSeconds};});
function nativeGeometry({chapter,progress}){
 const nodes=[...document.querySelectorAll('[data-project-chapter]')],index=nodes.findIndex(node=>node.dataset.projectChapter===chapter),node=nodes[index],top=node.getBoundingClientRect().top+scrollY,end=(nodes[index+1]?.getBoundingClientRect().top??node.getBoundingClientRect().bottom)+scrollY;
 const result={index,wholeProgress:Math.max(0,Math.min(1,(scrollY+innerHeight*.5-top)/Math.max(1,end-top))),target:top+(end-top)*progress-innerHeight*.5};
 if(chapter==='system'){
  const primary=node.querySelector('[data-dot-detail-passage]'),aperture=primary?.querySelector('[data-project-source-aperture]');if(!aperture)throw Error('Original native Dot source aperture required');
  const startY=top-innerHeight*.5,endY=aperture.getBoundingClientRect().bottom+scrollY-(innerWidth<800?.65:.92)*innerHeight-96,enabled=innerHeight>600&&endY-startY>=innerHeight*.3;
  result.range={startY,endY,enabled,clearancePx:96};result.detailProgress=enabled?Math.max(0,Math.min(1,(scrollY-startY)/(endY-startY))):0;result.detailActive=enabled&&scrollY>=startY&&scrollY<endY;result.target=startY+(endY-startY)*progress;
 }
 result.target=Math.max(0,Math.min(document.documentElement.scrollHeight-innerHeight,result.target));return result;
}
async function reading(page,chapter,progress){
 const measured=await page.evaluate(nativeGeometry,{chapter,progress}),target=measured.target;if(chapter==='system')expect(measured.range.enabled).toBe(true);
 const y=await page.evaluate(()=>scrollY);await page.mouse.move(8,page.viewportSize().height*.55);await page.mouse.wheel(0,target-y);
 await page.waitForFunction(({target,chapter})=>{const scene=window.__globalBackground?.inspect().driver.projectStudy.scene;if(Math.abs(scrollY-target)>1||scene?.camera.reading?.chapter!==chapter)return false;if(chapter!=='system')return document.querySelector('[data-project-study]')?.dataset.projectActiveChapter===chapter;return scene.motion?.mode==='hold'&&scene.motion.settled&&scene.motion.chapter===chapter&&scene.resource?.successfulPaint&&scene.resource.view.chapter===chapter;},{target,chapter},{timeout:WAIT});
 await expect.poll(async()=>{const fresh=await page.evaluate(nativeGeometry,{chapter,progress}),actual=(await facts(page)).scene.camera.reading;return Math.abs(actual.progress-fresh.wholeProgress)<=1e-9&&(chapter!=='system'||actual.detailEnabled===fresh.range.enabled&&actual.detailActive===fresh.detailActive&&Math.abs(actual.detailProgress-fresh.detailProgress)<=1e-9&&Math.abs(actual.detailRange.startY-fresh.range.startY)<=1e-9&&Math.abs(actual.detailRange.endY-fresh.range.endY)<=1e-9);},{timeout:WAIT}).toBe(true);
 const fresh=await page.evaluate(nativeGeometry,{chapter,progress}),state=await facts(page),actual=state.scene.camera.reading;
 expect(actual.index).toBe(fresh.index);expect(Math.abs(actual.progress-fresh.wholeProgress)).toBeLessThanOrEqual(1e-9);
 if(chapter==='system'){expect(actual.detailEnabled).toBe(fresh.range.enabled);expect(actual.detailActive).toBe(fresh.detailActive);expect(Math.abs(actual.detailProgress-fresh.detailProgress)).toBeLessThanOrEqual(1e-9);expect(actual.detailRange.clearancePx).toBe(96);expect(Math.abs(actual.detailRange.startY-fresh.range.startY)).toBeLessThanOrEqual(1e-9);expect(Math.abs(actual.detailRange.endY-fresh.range.endY)).toBeLessThanOrEqual(1e-9);}
 return state;
}
function projection(resource){
 const {pose,size}=resource,narrow=size.width<800,slot=narrow?{x:.5,y:.42,width:.94,height:.45}:{x:.735,y:.53,width:.51,height:.78};
 const camera=new T.PerspectiveCamera();camera.position.fromArray(pose.position);camera.up.fromArray(pose.up);camera.aspect=size.width/size.height;camera.fov=T.MathUtils.radToDeg(2*Math.atan(Math.tan(T.MathUtils.degToRad(pose.fov/2))/slot.height));camera.near=pose.near;camera.far=pose.far;camera.setViewOffset(size.width,size.height,size.width*(.5-slot.x),size.height*(.5-slot.y),size.width,size.height);camera.lookAt(...pose.target);camera.updateProjectionMatrix();camera.updateMatrixWorld(true);
 const point=new T.Vector3(),chosen=new Set(selected),all={min:[Infinity,Infinity,Infinity],max:[-Infinity,-Infinity,-Infinity]},detail={min:[Infinity,Infinity,Infinity],max:[-Infinity,-Infinity,-Infinity]},pixels=[];
 for(let i=0;i<points.length;i+=3){point.fromArray(points,i).project(camera);for(let axis=0;axis<3;axis++){const value=point.getComponent(axis);all.min[axis]=Math.min(all.min[axis],value);all.max[axis]=Math.max(all.max[axis],value);if(chosen.has(i/3)){detail.min[axis]=Math.min(detail.min[axis],value);detail.max[axis]=Math.max(detail.max[axis],value);}}if(chosen.has(i/3))pixels.push({x:(point.x+1)*size.width/2,y:(1-point.y)*size.height/2});}
 const nearest=pixels.map((p,i)=>Math.min(...pixels.filter((_,j)=>i!==j).map(q=>Math.hypot(p.x-q.x,p.y-q.y)))).sort((a,b)=>a-b);
 return{scope:'Actual committed 3D pose projection before bounded 2D handheld; not pixel visibility or a deposition sequence.',all,detail,selectedPixels:pixels,nearestCssPixels:{minimum:nearest[0],median:nearest[Math.floor(nearest.length/2)]}};
}
function sourceGuard(state,weight){
 const r=state.scene.resource;expect(r.sourceRevision).toBe(sourceSHA);expect(r.primitive).toBe('points');expect(r.sourcePoints).toBe(14810);expect(r.vertices).toBe(14810);expect(r.triangles).toBe(0);expect(r.drawnMeshes).toBe(1);expect(r.canvasCount).toBe(1);expect(r.detail.weight).toBe(weight);expect(r.detail.declaredCrop).toBe(weight>0);expect(r.detail.selectedCount).toBe(78);expect(r.detail.allSourcePrimitivesRetained).toBe(true);expect(r.detail.pointSizeChanged).toBe(false);
 expect(r.appearance.materials).toHaveLength(1);for(const material of r.appearance.materials){expect(material.size).toBe(2);expect(material.sizeAttenuation).toBe(false);}
 const projected=projection(r);expect(projected.all.min[2]).toBeGreaterThanOrEqual(-1);expect(projected.all.max[2]).toBeLessThanOrEqual(1);
 const framed=weight===0?projected.all:projected.detail;for(const axis of [0,1]){expect(framed.min[axis]).toBeGreaterThanOrEqual(-1);expect(framed.max[axis]).toBeLessThanOrEqual(1);}return projected;
}
async function capture(page,info,rows,name,weight){
 await expect.poll(()=>page.evaluate(()=>window.__globalBackground.inspect().driver.projectStudy.scene.resource?.detail.weight),{timeout:WAIT}).toBe(weight);
 const state=await facts(page),row={name,state,projection:projection(state.scene.resource)};rows.push(row);
 const label=page.locator('[data-dot-detail-annotation]');await expect(label).toBeVisible();
 row.annotation=await label.evaluate(node=>{const rect=r=>({left:r.left,top:r.top,right:r.right,bottom:r.bottom}),beat=node.dataset.dotDetailBeat,active=node.querySelector(`[data-dot-detail-label="${beat}"]`),range=document.createRange();range.selectNodeContents(active);const selectors=['[data-page-masthead]','[data-project-chapter-navigation]','[data-study-motion-toggle]'],counts=selectors.map(selector=>({selector,count:document.querySelectorAll(selector).length})),chrome=selectors.flatMap(selector=>[...document.querySelectorAll(selector)]).filter(el=>el.checkVisibility({visibilityProperty:true,opacityProperty:true})).map(el=>rect(el.getBoundingClientRect()));const planes=[...document.querySelectorAll('[data-information-window]')].filter(el=>el.checkVisibility({visibilityProperty:true,opacityProperty:true})).map(el=>({kind:el.dataset.informationWindow,chapter:el.closest('[data-project-chapter]')?.dataset.projectChapter??null,transform:getComputedStyle(el).transform,rect:rect(el.getBoundingClientRect())})).filter(({rect:r})=>r.right>0&&r.left<innerWidth&&r.bottom>0&&r.top<innerHeight),surface=document.querySelector('[data-project-model-surface]');return{beat,text:active.textContent,lines:[...range.getClientRects()].map(rect),counts,chrome,planes,surface:rect(surface.getBoundingClientRect()),compositor:{...window.__globalBackground.inspect().driver.projectStudy.scene.resource.compositor},viewport:{width:innerWidth,height:innerHeight}};});
 const path=info.outputPath(name+'.png');await page.screenshot({path,scale:'device'});await info.attach(name,{path,contentType:'image/png'});sourceGuard(state,weight);
 for(const owner of row.annotation.counts)expect(owner.count,owner.selector).toBe(1);expect(row.annotation.lines.length).toBeGreaterThan(0);for(const line of row.annotation.lines){expect(line.left).toBeGreaterThanOrEqual(0);expect(line.right).toBeLessThanOrEqual(row.annotation.viewport.width);expect(line.top).toBeGreaterThanOrEqual(0);expect(line.bottom).toBeLessThanOrEqual(row.annotation.viewport.height);for(const chrome of [...row.annotation.chrome,...row.annotation.planes.map(plane=>plane.rect)])expect(Math.min(line.right,chrome.right)>Math.max(line.left,chrome.left)&&Math.min(line.bottom,chrome.bottom)>Math.max(line.top,chrome.top)).toBe(false);}
 if(weight===1){
  const micro=row.annotation.compositor,surface=row.annotation.surface,c=Math.cos(micro.rollRad),sin=Math.sin(micro.rollRad);
  expect(Math.abs(surface.right-surface.left-state.scene.resource.size.width)).toBeLessThanOrEqual(1e-9);expect(Math.abs(surface.bottom-surface.top-state.scene.resource.size.height)).toBeLessThanOrEqual(1e-9);
  row.projectedDetailOnScreen=row.projection.selectedPixels.map(p=>({x:surface.left+micro.originX+c*(p.x-micro.originX)-sin*(p.y-micro.originY)+micro.xPx,y:surface.top+micro.originY+sin*(p.x-micro.originX)+c*(p.y-micro.originY)+micro.yPx}));
  expect(row.projectedDetailOnScreen).toHaveLength(78);for(const point of row.projectedDetailOnScreen){expect(Number.isFinite(point.x)).toBe(true);expect(Number.isFinite(point.y)).toBe(true);}
  for(const point of row.projectedDetailOnScreen)for(const plane of row.annotation.planes){const r=plane.rect;expect(point.x>=r.left&&point.x<=r.right&&point.y>=r.top&&point.y<=r.bottom,`Selected source point overlaps visible ${plane.kind} / ${plane.chapter}`).toBe(false);}
 }
 return state;
}
async function save(info,name,rows,requests){const path=info.outputPath(name+'.json');await writeFile(path,JSON.stringify({sourceSHA,scope:'All original points retained. Detail is an editorial coordinate-window crop, not chronological deposition or an inferred solid. PNGs require visual review.',rows,requests},null,2));await info.attach(name,{path,contentType:'application/json'});}
const journey=test.extend({video:'on'});
journey('Dot native reading shows full source, selected detail, full return and a distinct Making recording',async({page,isMobile},info)=>{
 test.setTimeout(scenarioTimeout(90000));const rows=[],requests=[];let primary;
 page.on('request',request=>{if(new URL(request.url()).pathname===project.model.src)requests.push(request.url());});
 try{
  expect(sourceSHA).toBe('60d49fe978cf0fb552c39f7188a9811dc39aa2e163b3a3388b192dbae502e891');expect(points.length/3).toBe(14810);expect(selected).toHaveLength(78);
  await page.goto(route);await page.waitForFunction(()=>window.__site?.inspect().phase==='entered',null,{timeout:WAIT});await page.mouse.click(8,page.viewportSize().height*.5);
  await reading(page,'system',.1);await capture(page,info,rows,'full-before',0);
  await reading(page,'system',.54);const detail=await capture(page,info,rows,'selected-detail',1);
  await frames(page,9);const idle=await facts(page);rows.push({name:'detail-idle',state:idle});expect(idle.y).toBe(detail.y);expect(idle.scene.camera.intent).toEqual(detail.scene.camera.intent);expect(idle.scene.resource.detail.weight).toBe(1);expect(idle.scene.resource.draws).toBe(detail.scene.resource.draws);expect(idle.scene.resource.cameraFits).toBe(detail.scene.resource.cameraFits);expect(idle.scene.resource.compositor.writes).toBeGreaterThan(detail.scene.resource.compositor.writes);expect(idle.scene.resource.budget.allocations).toBe(detail.scene.resource.budget.allocations);
  const target=page.locator('[data-project-model-target="system"]');await target.click();await expect(target).toBeFocused();await page.keyboard.press('ArrowRight');
  await expect.poll(()=>page.evaluate(()=>window.__globalBackground.inspect().driver.projectStudy.scene.resource?.detail.weight),{timeout:WAIT}).toBe(0);
  const inspecting=await facts(page);rows.push({name:'native-focused-inspection',state:inspecting,projection:sourceGuard(inspecting,0)});expect(Math.abs(inspecting.scene.camera.value.azimuth)).toBeGreaterThan(0);
  await page.keyboard.press('Escape');await expect(target).toBeFocused();expect((await facts(page)).scene.resource.detail.weight).toBe(0);
  await page.mouse.click(8,page.viewportSize().height*.5);await expect.poll(()=>page.evaluate(()=>window.__globalBackground.inspect().driver.projectStudy.scene.resource?.detail.weight),{timeout:WAIT}).toBe(1);
  const pause=page.locator('[data-study-motion-toggle]');await pause.click();await expect(pause).toHaveAttribute('aria-pressed','true');await frames(page,2);const frozen=await facts(page);await frames(page,5);const still=await facts(page);rows.push({name:'paused',state:still});expect(still.scene.resource.pose).toEqual(frozen.scene.resource.pose);expect(still.scene.resource.compositor).toEqual(frozen.scene.resource.compositor);expect(still.scene.resource.draws).toBe(frozen.scene.resource.draws);expect(still.activeSeconds).toBe(frozen.activeSeconds);
  await pause.click();await page.mouse.click(8,page.viewportSize().height*.5);await reading(page,'system',.54);
  if(isMobile){const original=page.viewportSize();await page.setViewportSize({width:320,height:original.height});await reading(page,'system',.54);await capture(page,info,rows,'selected-detail-320',1);await page.setViewportSize(original);await reading(page,'system',.54);}
  await reading(page,'system',.92);await capture(page,info,rows,'full-after',0);
  await reading(page,'making',.5);
  await page.waitForFunction(id=>{const project=window.__globalBackground.inspect().driver.projectStudy;return project.backdrop.stage.key===`video:${id}`&&project.backdrop.stage.mode==='hold'&&project.backdrop.stage.settled&&project.scene.motion.mode==='absent';},media.id,{timeout:WAIT});await expect(page.locator('[data-dot-detail-annotation]')).toBeHidden();
  const video=page.locator(`[data-project-motion-media][data-project-motion-id="${media.id}"]`);
  await expect.poll(()=>video.evaluate(node=>node.readyState>=2&&!node.paused&&node.videoWidth>0),{timeout:WAIT}).toBe(true);
  const native=await video.evaluate(node=>({src:new URL(node.currentSrc).pathname,width:node.videoWidth,height:node.videoHeight,time:node.currentTime}));expect(native.src).toBe(media.src);expect(native.width).toBe(media.width);expect(native.height).toBe(media.height);
  await expect.poll(()=>video.evaluate(node=>node.currentTime),{timeout:WAIT}).toBeGreaterThan(native.time);rows.push({name:'separate-making-recording',native,state:await facts(page)});
  const making=info.outputPath('making-separate-recording.png');await page.screenshot({path:making,scale:'device'});await info.attach('making-separate-recording',{path:making,contentType:'image/png'});
  await reading(page,'system',.54);await capture(page,info,rows,'reverse-detail',1);await reading(page,'system',.1);const final=await capture(page,info,rows,'reverse-full',0);expect(final.scene.acquisitions).toBe(1);expect(final.scene.disposals).toBe(0);expect(requests).toHaveLength(1);expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
 }catch(error){primary=error;throw error;}finally{try{await save(info,'dot-source-detail',rows,requests);}catch(error){if(!primary)throw error;}}
});

test('Dot detail explanation remains native in Reduced and no-JavaScript reading',async({page,browser,baseURL},info)=>{
 const rows=[],requests=[];let nativeContext,primary;
 try{
  page.on('request',request=>{if(new URL(request.url()).pathname===project.model.src)requests.push(request.url());});await page.emulateMedia({reducedMotion:'reduce'});await page.goto(route);await page.waitForFunction(()=>window.__site?.inspect().phase==='entered',null,{timeout:WAIT});
  for(const kind of ['reduced','no-js']){
   let current=page;if(kind==='no-js'){const use=info.project.use;nativeContext=await browser.newContext({baseURL,viewport:use.viewport,deviceScaleFactor:use.deviceScaleFactor,isMobile:use.isMobile,hasTouch:use.hasTouch,userAgent:use.userAgent,javaScriptEnabled:false});current=await nativeContext.newPage();await current.goto(route);}
   await expect(current.locator('[data-project-study-canvas]')).toHaveCount(0);await expect(current.locator('[data-dot-detail-annotation]')).toBeHidden();const summary=current.locator('[data-dot-detail-summary]');await expect(summary).toHaveCount(1);await summary.evaluate(node=>node.scrollIntoView({block:'center',behavior:'instant'}));await expect(summary).toBeVisible();const text=await summary.innerText();expect(text).toBe('14,810 recorded low-speed path sample positions. The close view examines a selected part of this point record, not an inferred surface or a deposition sequence. The next chapter shows a separate physical recording.');await expect(current.locator(`[data-project-chapter="system"] a[href="${project.model.poster.src}"]`).last()).toHaveAttribute('target','_blank');expect(await current.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);rows.push({kind,text});const path=info.outputPath(`dot-native-summary-${kind}.png`);await current.screenshot({path,scale:'device'});await info.attach(`dot-native-summary-${kind}`,{path,contentType:'image/png'});
  }
  expect(requests).toEqual([]);
 }catch(error){primary=error;throw error;}finally{let failure=primary;for(const cleanup of [()=>save(info,'dot-native-detail-summary',rows,requests),()=>nativeContext?.close()])try{await cleanup();}catch(error){failure??=error;}if(!primary&&failure)throw failure;}
});
