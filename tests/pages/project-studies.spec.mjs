import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {createServer} from 'node:http';
import {fileURLToPath} from 'node:url';
import {createPagesPreviewHandler} from '../../scripts/serve-pages.mjs';
import {WAIT,frames,scenarioTimeout} from './case-helpers.mjs';

const studies=JSON.parse(await readFile(new URL('../../roles/uiux-designer/cases/bending-active-thesis/release/project-studies.json',import.meta.url),'utf8')).projects;
const route=project=>`/projects/${project.slug}/`;
const stage=page=>page.locator('[data-project-model-stage]');
// This is the real ordinary-page driver adapter, not a second stage clock.
const facts=page=>page.evaluate(()=>window.__globalBackground.inspect().driver.projectStudy.scene);
const dot=studies.find(project=>project.id==='dot-based-3d-printing');
const inspection=async page=>{const {target,value,settled}= (await facts(page)).camera;return{target,value,settled};};
function closed(state){
 for(const id of new Set(state.history.map(fact=>fact.id))){const own=state.history.filter(fact=>fact.id===id);expect(own.filter(fact=>fact.phase==='requested')).toHaveLength(1);expect(own.filter(fact=>['ready','failed','cancelled'].includes(fact.phase))).toHaveLength(1);}
 if(state.motion===null){
  // Initial Reduced Motion can settle arrival before the ordinary driver's
  // first source publication. No model acquisition or motion request exists.
  expect(state).toMatchObject({externalStage:true,phase:'poster',reason:'reduced-motion',arrivalStatic:true,staticReason:'reduced-motion',active:false,pending:false,id:null,acquisitions:0,disposals:0,renders:0,resource:null,paintedChapter:null,preparedChapter:null,sharedStage:null});
  expect(state.history).toEqual([]);expect(state.resourceFailures).toEqual([]);
  expect(state.posterPreparation).toMatchObject({requested:false,pending:false});
  return;
 }
 for(const id of new Set(state.motion.history.map(fact=>fact.id))){const own=state.motion.history.filter(fact=>fact.id===id);expect(own.filter(fact=>fact.status==='requested')).toHaveLength(1);expect(own.filter(fact=>['completed','cancelled','failed'].includes(fact.status))).toHaveLength(1);}
}
function sourceDraw(state,model,viewport){
 expect(state.phase).toBe('ready');expect(state.arrivalStatic).toBe(false);expect(state.acquisitions).toBe(1);expect(state.disposals).toBe(0);
 const resource=state.resource;expect(resource.successfulPaint).toBe(true);expect(resource.disposed).toBe(false);
 expect(resource.sourceRevision).toBe(model.sha256);expect(resource.primitive).toBe(model.primitive??'triangles');
 expect(resource.vertices).toBe(model.vertices);expect(resource.triangles).toBe(model.triangles);
 expect(resource.meshes).toBe(model.meshes);expect(resource.renderables).toBe(model.meshes);expect(resource.drawnMeshes).toBe(model.meshes);
 expect(resource.sourceCalls).toBeGreaterThanOrEqual(model.meshes);expect(resource.sourcePoints).toBe(model.primitive==='points'?model.vertices:0);
 expect(resource.firstDraw).toMatchObject({completed:true,sourceRevision:model.sha256,meshes:model.meshes,...viewport});
 expect(resource.firstDraw.sourceCalls).toBeGreaterThanOrEqual(model.meshes);expect(resource.draws).toBeGreaterThan(0);expect(resource.canvasCount).toBe(1);
 expect(resource.size).toEqual(viewport);expect(resource.budget.budget.width*resource.budget.budget.height).toBeLessThanOrEqual(resource.pixelBudget);
 const id=model.src.split('/')[3],look=resource.appearance;
 expect(look.profileID).toBe(id);expect(look.phase).toBe('installed');expect(look.disposed).toBe(false);expect(look.renderables).toBe(model.meshes);
 expect(look.materialClones).toBe(1);expect(look.materials).toHaveLength(1);expect(look.materials[0].sourceTextureReferencesPreserved).toBe(true);
 if(model.primitive==='points'){
  expect(look.environment).toMatchObject({kind:'none',generations:0,owned:false});expect(look.lights).toHaveLength(0);
  expect(look.materials[0]).toMatchObject({type:'PointsMaterial',size:2,sizeAttenuation:false,toneMapped:false});
 }else{
  expect(look.environment).toMatchObject({kind:'room-pmrem',generations:1,size:128,atlas:[384,512],owned:true});expect(look.lights).toHaveLength(4);
  const center=model.bounds.min.map((value,index)=>(value+model.bounds.max[index])*.5);
  for(const light of look.lights.filter(light=>light.type==='DirectionalLight')){expect(light.targetInScene).toBe(true);expect(light.target).toEqual(center);expect(light.castShadow).toBe(false);}
 }
 if(id==='hc3dp-caustics')expect(look.materials[0]).toMatchObject({type:'MeshPhysicalMaterial',ior:1.5700000524520874,metalness:.31024929881095886,roughness:.14681440591812134,transmission:1,opacity:.1052631139755249,transparent:false,side:2,thickness:0});
 const intent=resource.view.cameraIntent;
 const view=intent?{yaw:intent.yawRad,pitch:intent.pitchRad,fov:intent.fovDeg}:model.views?.[resource.view.chapter];
 if(view){
  const direction=resource.pose.position.map((value,index)=>value-resource.pose.target[index]);
  expect(Math.atan2(direction[0],direction[2])).toBeCloseTo(view.yaw+(intent?0:resource.view.azimuth),10);
  expect(Math.atan2(direction[1],Math.hypot(direction[0],direction[2]))).toBeCloseTo(Math.max(-.1,Math.min(1.15,view.pitch+(intent?0:resource.view.elevation))),10);
  expect(resource.pose.fov).toBe(view.fov);
 }
}
async function settled(page,chapter,model){
 await page.waitForFunction(({chapter,wanted})=>{
  const state=window.__globalBackground?.inspect().driver.projectStudy.scene;
  return state?.chapter===chapter&&state.motion.chapter===chapter&&state.motion.mode===(wanted?'hold':'absent')&&state.motion.settled&&!state.motion.transition&&state.camera.settled&&(!wanted||state.arrivalStatic||state.resource?.view.chapter===chapter&&state.resource.successfulPaint);
 },{chapter,wanted:model.chapters.includes(chapter)},{timeout:WAIT});
}
async function fullCanvas(page){
 await expect(page.locator('canvas')).toHaveCount(2);await expect(page.locator('[data-project-study-canvas]')).toHaveCount(1);await expect(stage(page).locator('canvas')).toBeVisible();
 // One synchronous snapshot keeps the continuously changing compositor receipt,
 // computed transform and actual DOM bounds on the same animation frame.
 const sample=await stage(page).evaluate(node=>{
  const canvas=node.querySelector('canvas'),surface=node.querySelector('[data-project-model-surface]'),css=getComputedStyle(canvas),surfaceBox=surface.getBoundingClientRect();
  const width=parseFloat(css.width),height=parseFloat(css.height),origin=css.transformOrigin.split(' ').map(Number.parseFloat),matrix=new DOMMatrix(css.transform==='none'?undefined:css.transform);
  const corners=[[0,0],[width,0],[0,height],[width,height]].map(([x,y])=>{const p=new DOMPoint(x-origin[0],y-origin[1]).matrixTransform(matrix);return{x:p.x+origin[0]+surfaceBox.x,y:p.y+origin[1]+surfaceBox.y};});
  const minX=Math.min(...corners.map(p=>p.x)),maxX=Math.max(...corners.map(p=>p.x)),minY=Math.min(...corners.map(p=>p.y)),maxY=Math.max(...corners.map(p=>p.y));
  return{host:node.getBoundingClientRect().toJSON(),surface:surfaceBox.toJSON(),canvas:canvas.getBoundingClientRect().toJSON(),position:getComputedStyle(node).position,
   layout:{position:css.position,width,height,left:parseFloat(css.left),top:parseFloat(css.top),right:parseFloat(css.right),bottom:parseFloat(css.bottom),offsetLeft:canvas.offsetLeft,offsetTop:canvas.offsetTop,offsetWidth:canvas.offsetWidth,offsetHeight:canvas.offsetHeight},
   origin,matrix:Object.fromEntries(['a','b','c','d','e','f','m13','m14','m23','m24','m31','m32','m33','m34','m43','m44'].map(key=>[key,matrix[key]])),expected:{x:minX,y:minY,width:maxX-minX,height:maxY-minY},
   compositor:window.__globalBackground.inspect().driver.projectStudy.scene.resource.compositor,
   project:node.closest('[data-project-study]').dataset.projectStudy,surround:getComputedStyle(surface).backgroundImage};
 }),viewport=page.viewportSize();
 expect(sample.position).toBe('fixed');
 for(const box of [sample.host,sample.surface]){expect(box.x).toBeCloseTo(0,0);expect(box.y).toBeCloseTo(0,0);expect(box.width).toBeCloseTo(viewport.width,0);expect(box.height).toBeCloseTo(viewport.height,0);}
 expect(sample.layout.position).toBe('absolute');
 for(const key of ['left','top','right','bottom','offsetLeft','offsetTop'])expect(sample.layout[key]).toBeCloseTo(0,0);
 for(const key of ['width','offsetWidth'])expect(sample.layout[key]).toBeCloseTo(viewport.width,0);
 for(const key of ['height','offsetHeight'])expect(sample.layout[key]).toBeCloseTo(viewport.height,0);
 const micro=sample.compositor;expect(micro.kind).toBe('2d-pan-roll');
 expect(Math.abs(micro.xPx)).toBeLessThanOrEqual(1.2);expect(Math.abs(micro.yPx)).toBeLessThanOrEqual(1.2);expect(Math.abs(micro.rollRad)).toBeLessThanOrEqual(.0012);
 // Equivalent matrix()/matrix3d() serialization must have the same effective
 // 2D affine coefficients, without perspective, depth translation or tilt.
 for(const key of ['m13','m14','m23','m24','m31','m32','m34','m43'])expect(sample.matrix[key]===0).toBe(true);
 for(const key of ['m33','m44'])expect(sample.matrix[key]).toBe(1);
 const intended={a:Math.cos(micro.rollRad),b:Math.sin(micro.rollRad),c:-Math.sin(micro.rollRad),d:Math.cos(micro.rollRad),e:micro.xPx,f:micro.yPx};
 for(const key of Object.keys(intended))expect(sample.matrix[key]).toBeCloseTo(intended[key],5);
 expect(sample.origin[0]).toBeCloseTo(micro.originX,2);expect(sample.origin[1]).toBeCloseTo(micro.originY,2);
 // The canvas layout remains exactly full viewport; its intentional pan/roll
 // changes only the visual AABB, which must match transformed corners, not an
 // arbitrary widened tolerance or a frozen idle snapshot.
 for(const key of ['x','y','width','height'])expect(sample.canvas[key]).toBeCloseTo(sample.expected[key],0);
 if(['dot-based-3d-printing','special-assemblies'].includes(sample.project))expect(sample.surround).toContain('radial-gradient');else expect(sample.surround).toBe('none');
}
async function decodeSource(chapter,image){
 const identity=await chapter.evaluate(node=>({project:node.closest('[data-project-study]').dataset.projectStudy,chapter:node.dataset.projectChapter}));
 if(identity.project==='project-caschlatsch'||['special-assemblies','hc3dp-caustics','dot-based-3d-printing'].includes(identity.project)&&['overview','results'].includes(identity.chapter)||['entrance-installation-art','mode-s-of-making'].includes(identity.project)&&identity.chapter==='overview'){
  const root=chapter.locator('xpath=ancestor::main[@data-project-study]'),canonical=root.locator(`[data-editorial-source="${image.src}"]`);await expect(canonical).toHaveCount(1);
  const owner=await canonical.evaluate(node=>node.closest('[data-project-chapter]').dataset.projectChapter);
  if(owner!==identity.chapter&&identity.chapter!=='overview'){
   const reference=chapter.locator(`[data-editorial-source-reference="${image.src}"]`);await expect(reference).toHaveCount(1);await expect(reference).toContainText(image.caption);await expect(reference).toContainText(image.credit);await expect(reference.locator('a')).toHaveAttribute('href',image.src);await expect(reference.locator('a')).toHaveAttribute('target','_blank');
  }
  if(identity.chapter==='overview')expect(owner).toBe(identity.project==='project-caschlatsch'?'system':'overview');
  if(['special-assemblies','hc3dp-caustics','dot-based-3d-printing','entrance-installation-art','mode-s-of-making'].includes(identity.project))expect(owner).toBe(identity.chapter);
  const original=canonical.locator('[data-editorial-image]');await expect(original).toHaveCount(1);await original.scrollIntoViewIfNeeded();
  expect(await original.evaluate(async node=>{await node.decode();return{src:node.getAttribute('src'),width:node.naturalWidth,height:node.naturalHeight,fit:getComputedStyle(node).objectFit,alt:node.alt};})).toEqual({src:image.src,width:image.width,height:image.height,fit:'contain',alt:image.alt});
  await expect(canonical.locator('figcaption > p')).toHaveText(image.caption);await expect(canonical.locator('figcaption > span:not([data-information-skin])')).toHaveText(image.credit);await expect(canonical.locator('figcaption > a')).toHaveAttribute('href',image.src);await expect(original.locator('xpath=ancestor::a[1]')).toHaveAttribute('href',image.src);await expect(original.locator('xpath=ancestor::a[1]')).toHaveAttribute('target','_blank');return;
 }
 const project=studies.find(item=>item.id===identity.project),motion=project.motionMedia?.find(item=>item.chapter===identity.chapter&&item.poster.src===image.src);
 const element=chapter.locator(`img[src="${image.src}"]`).first();
 if(await element.count()===0){
  // This exact image is intentionally shown once by another chapter's
  // background. That owning chapter performs its native decode below; the
  // duplicate placement must not be recreated just to satisfy an old fixture.
  const root=chapter.locator('xpath=ancestor::main[@data-project-study]');
  expect(await root.locator(`[data-project-media-poster][src="${image.src}"]`).count()).toBeGreaterThan(0);
  await expect(root.locator(`a[href="${image.src}"]`).first()).toHaveAttribute('target','_blank');
  await expect(chapter.locator(`[data-project-evidence-image][src="${image.src}"]`)).toHaveCount(0);
  return;
 }
 await expect(element).toHaveAttribute('src',image.src);
 await element.scrollIntoViewIfNeeded();
 expect(await element.evaluate(async node=>{await node.decode();return{width:node.naturalWidth,height:node.naturalHeight,fit:getComputedStyle(node).objectFit,alt:node.alt};})).toEqual({width:image.width,height:image.height,fit:'contain',alt:motion?.alt??image.alt});
 await expect(chapter.locator(`a[href="${image.src}"]`).first()).toHaveAttribute('target','_blank');
 await expect(chapter).toContainText(motion?.caption??image.caption);await expect(chapter).toContainText(motion?.credit??image.credit);
}

async function observeContinuousModel(page,chapter){
 const handle=await page.evaluateHandle(({chapter,timeout})=>{
  const samples=[];let raf=null,timer=null,held=0,cancel;
  const stop=()=>{if(raf!==null)cancelAnimationFrame(raf);clearTimeout(timer);raf=null;timer=null;};
  const promise=new Promise((resolve,reject)=>{
   cancel=()=>{stop();reject(Error('Continuous-source observer cancelled'));};
   timer=setTimeout(()=>{stop();reject(Error('Continuous source view did not paint: '+JSON.stringify(samples.at(-1))));},timeout);
   const read=()=>{try{
    const host=document.querySelector('[data-project-model-stage]'),surface=host.querySelector('[data-project-model-surface]'),scene=window.__globalBackground.inspect().driver.projectStudy.scene;
    samples.push({visibility:getComputedStyle(host).visibility,opacity:Number(getComputedStyle(surface).opacity),pose:scene.motion.pose.opacity,mode:scene.motion.mode,view:scene.resource?.view.chapter,source:scene.resource?.sourceRevision});
    if(scene.motion.chapter===chapter&&scene.motion.mode==='hold'&&scene.motion.settled&&scene.resource?.view.chapter===chapter)held++;else held=0;
    if(held>=8){stop();resolve(samples);return;}
    raf=requestAnimationFrame(read);
   }catch(error){stop();reject(error);}};raf=requestAnimationFrame(read);
  });
  return{promise,dispose:()=>cancel()};
 },{chapter,timeout:WAIT});
 // Attach rejection handling immediately, including when a later native click
 // or assertion fails before the observation is awaited.
 const result=handle.evaluate(owner=>owner.promise).then(value=>({value}),error=>({error}));
 return{result,async dispose(){try{await handle.evaluate(owner=>owner.dispose());}finally{await handle.dispose();}}};
}
async function modelChapter(page,project,chapter=project.model.chapters[0]){
 const control=page.locator(`[data-project-chapter="${chapter}"] [data-project-model-control]`);
 await control.evaluate(node=>node.scrollIntoView({block:'center',behavior:'instant'}));
 await settled(page,chapter,project.model);sourceDraw(await facts(page),project.model,page.viewportSize());await fullCanvas(page);
 return control;
}
async function pressSource(page,control){
 // The presenter exposes no synthetic hit/readiness hook. Try bounded native
 // pointer presses in the visible aperture; a gesture exists only after its
 // actual source raycast succeeds. No generated replacement can satisfy this.
 const candidates=await control.evaluate(node=>{
  const box=node.getBoundingClientRect(),left=Math.max(1,box.left),right=Math.min(innerWidth-1,box.right),top=Math.max(110,box.top),bottom=Math.min(innerHeight-100,box.bottom),points=[];
  for(let y=.05;y<1;y+=.1)for(let x=.05;x<1;x+=.1){const point={x:left+(right-left)*x,y:top+(bottom-top)*y,distance:Math.hypot(x-.5,y-.5)},under=document.elementFromPoint(point.x,point.y);if(under&&!under.closest('a,button,input,select,textarea,summary,[data-protect],[data-information-window]'))points.push(point);}
  return points.sort((a,b)=>a.distance-b.distance);
 });
 for(const point of candidates){await page.mouse.move(point.x,point.y);await page.mouse.down();if((await facts(page)).gesture)return point;await page.mouse.up();}
 throw Error('No native pointer press hit the painted Dot source: '+JSON.stringify(await facts(page)));
}
function closedGestures(state){
 for(const id of new Set(state.gestures.map(fact=>fact.id))){const own=state.gestures.filter(fact=>fact.id===id);expect(own.filter(fact=>fact.status==='requested')).toHaveLength(1);expect(own.filter(fact=>['released','cancelled'].includes(fact.status))).toHaveLength(1);}
 expect(state.gesture).toBeNull();
}
async function entered(page,phase='entered'){
 await page.waitForFunction(()=>['entered','failed'].includes(window.__site?.inspect().phase),null,{timeout:WAIT});
 await expect(page.locator('[data-site-loader]')).toBeHidden();
 expect(await page.evaluate(()=>window.__site.inspect().phase)).toBe(phase);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
}

for(const project of studies)test(`${project.shortTitle} has native evidence chapters, original proportions and a single motion owner`,async({page})=>{
 // The original caustics source is a 50 MB, 1.9-million-vertex model. Only this
 // expanded source-rendering scenario needs more total case time; all startup
 // and transition assertions retain their existing WAIT and exact bounds.
 if(project.model?.bytes>40000000)test.setTimeout(scenarioTimeout(180000));
 const errors=[],models=[];page.on('pageerror',error=>errors.push(error.message));
 page.on('request',request=>{if(/\.(glb|hdr)(?:\?|$)/.test(request.url()))models.push(request.url());});
 expect((await page.goto(route(project))).status()).toBe(200);await entered(page);
 await expect(page.locator('h1')).toHaveText(project.title);
 const openingType=await page.locator('h1').evaluate(async heading=>{
  await document.fonts.ready;
  const text=heading.textContent,bounds=heading.getBoundingClientRect(),words=[];
  const plain=[...heading.childNodes].every(node=>node.nodeType===Node.TEXT_NODE);
  if(plain)for(const match of text.matchAll(/\S+/gu)){
   const range=document.createRange();range.setStart(heading.firstChild,match.index);range.setEnd(heading.firstChild,match.index+match[0].length);
   const rects=[...range.getClientRects()].filter(rect=>rect.width>0&&rect.height>0),lines=[];
   for(const rect of rects)if(!lines.some(top=>Math.abs(top-rect.top)<=1))lines.push(rect.top);
   words.push({word:match[0],lines:lines.length,fits:rects.length>0&&rects.every(rect=>rect.left>=Math.max(0,bounds.left)-1&&rect.right<=Math.min(innerWidth,bounds.right)+1)});
  }
  return{plain,words,scrollWidth:heading.scrollWidth,clientWidth:heading.clientWidth,left:bounds.left,right:bounds.right,viewport:innerWidth};
 });
 expect(openingType.plain,'Opening headings remain native plain text').toBe(true);
 expect(openingType.words.length).toBeGreaterThan(0);
 expect(openingType.words.filter(word=>word.lines!==1),'A complete heading word must occupy one line').toEqual([]);
 expect(openingType.words.filter(word=>!word.fits),'Every heading word fits its heading and the viewport').toEqual([]);
 expect(openingType.scrollWidth).toBeLessThanOrEqual(openingType.clientWidth+1);
 expect(openingType.left).toBeGreaterThanOrEqual(-1);expect(openingType.right).toBeLessThanOrEqual(openingType.viewport+1);
 await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href','https://joshsuan.github.io'+route(project));
 await expect(page.locator('[data-project-chapter]')).toHaveCount(project.sections.length+2);
 await expect(page.locator('[data-project-chapter-link]')).toHaveCount(project.sections.length+2);
 await expect(page.locator('canvas')).toHaveCount(project.model?2:1);
 await expect(page.locator('canvas[data-global-background-field]')).toHaveCount(1);
 await expect(page.locator('[data-xr-stage],[data-cinematic-stage]')).toHaveCount(0);
 let sourceCanvas;
 if(project.model){
  expect(project.model.chapters.length).toBeGreaterThan(0);expect(project.model.chapters.every(chapter=>['overview',...project.sections.map(section=>section.id),'credits'].includes(chapter))).toBe(true);
  sourceDraw(await facts(page),project.model,page.viewportSize());closed(await facts(page));
  sourceCanvas=await stage(page).locator('canvas').elementHandle();
  expect(models).toEqual([new URL(project.model.src,page.url()).href]);
  expect(await page.evaluate(()=>window.__site.inspect().readiness.previews)).toEqual([{mode:'model',reason:''}]);
 }else{await expect(stage(page)).toHaveCount(0);expect(models).toEqual([]);}
 await decodeSource(page.locator('[data-project-chapter="overview"]'),project.hero);
 const visualOwnership=await page.evaluate(()=>{
  const background=new Set([...document.querySelectorAll('[data-project-media-poster],[data-project-model-poster]')].map(image=>image.getAttribute('src')));
  const evidence=[...document.querySelectorAll('[data-project-evidence-image]')].map(image=>image.getAttribute('src'));
  return{duplicates:evidence.filter(src=>background.has(src)),unique:new Set(evidence).size,total:evidence.length,captionImages:document.querySelectorAll('[data-project-source-caption] img').length};
 });
 expect(visualOwnership.duplicates).toEqual([]);expect(visualOwnership.unique).toBe(visualOwnership.total);expect(visualOwnership.captionImages).toBe(0);
 expect(await page.locator('main').innerText()).not.toMatch(/\bportfolio\b|source-backed/i);
 for(const section of project.sections){
  const index=project.sections.indexOf(section),previous=project.sections[index-1]?.id;
  const chapter=page.locator(`[data-project-chapter="${section.id}"]`);
  let continuity=null;
  if(project.model?.chapters.includes(previous)&&project.model.chapters.includes(section.id)){
   await page.locator(`[data-project-chapter-link="${previous}"]`).click();await settled(page,previous,project.model);
   continuity=await observeContinuousModel(page,section.id);
  }
  try{
  await page.locator(`[data-project-chapter-link="${section.id}"]`).click();
  if(project.model){
   await settled(page,section.id,project.model);
   const state=await facts(page);sourceDraw(state,project.model,page.viewportSize());closed(state);
   if(project.model.chapters.includes(section.id)){await expect(stage(page)).toHaveAttribute('data-project-model-active','');await expect(stage(page)).toHaveAttribute('data-project-model-rendering','webgl-model');await fullCanvas(page);}
   else await expect(stage(page)).not.toHaveAttribute('data-project-model-active','');
   expect(await sourceCanvas.evaluate(node=>node===document.querySelector('[data-project-study-canvas]'))).toBe(true);
  }
  if(continuity){
   const outcome=await continuity.result;if(outcome.error)throw outcome.error;
   const samples=outcome.value;expect(samples.length).toBeGreaterThanOrEqual(8);
   expect(samples.every(sample=>sample.visibility==='visible'&&sample.opacity===1&&sample.pose===1&&sample.source===project.model.sha256&&!['exit','entry'].includes(sample.mode))).toBe(true);
  }
  }finally{if(continuity)await continuity.dispose();}
  await expect(chapter).toBeInViewport();await expect(chapter.locator('h2')).toHaveText(section.title);
  // Native anchors must retain the shared label above h2 below fixed controls.
  const label=await chapter.locator('[data-project-section-label]').boundingBox(),navigation=await page.locator('[data-page-masthead] nav').boundingBox();
  expect(label.y).toBeGreaterThanOrEqual(navigation.y+navigation.height+8);
  for(const image of section.media)await decodeSource(chapter,image);
  const background=await page.evaluate(()=>window.__globalBackground.inspect());
  expect(background.owner).toBe('site');expect(background.activeBindings).toBe(1);expect(background.acquisitions).toBe(1);expect(background.releases).toBe(0);
  expect(background.driver.projectStudy.liquidGlass.ticks).toBe(background.driver.frames);
 }
 await page.locator('[data-project-chapter-link="credits"]').click();
 if(project.model){await settled(page,'credits',project.model);closed(await facts(page));await expect(stage(page)).not.toHaveAttribute('data-project-model-active','');}
 for(const credit of project.credits)await expect(page.locator('[data-project-chapter="credits"]')).toContainText(credit.names);
 const toggle=page.locator('[data-study-motion-toggle]');await toggle.click();
 await expect(toggle).toHaveAttribute('aria-pressed','true');
 await expect.poll(()=>page.evaluate(()=>window.__globalBackground.inspect().driver.projectStudy.paused)).toBe(true);
 await frames(page,8);const frozen=await page.evaluate(()=>window.__globalBackground.inspect().driver.playback.activeSeconds);
 await page.mouse.wheel(0,-160);await frames(page,8);
 expect(await page.evaluate(()=>window.__globalBackground.inspect().driver.playback.activeSeconds)).toBe(frozen);
 await toggle.click();await expect(toggle).toHaveAttribute('aria-pressed','false');
 await page.emulateMedia({reducedMotion:'reduce'});
 await expect.poll(()=>page.evaluate(()=>window.__globalBackground.inspect().driver.homeScrolling.enabled)).toBe(false);
 if(project.model){await expect(stage(page).locator('canvas')).toHaveCount(0);expect((await facts(page)).resource).toBeNull();expect((await facts(page)).disposals).toBe((await facts(page)).acquisitions);closed(await facts(page));}
 expect(models).toEqual(project.model?[new URL(project.model.src,page.url()).href]:[]);
 expect(errors).toEqual([]);
});

for(const project of studies)test(`${project.shortTitle} preserves every source chapter and image without JavaScript`,async({browser,contextOptions,viewport,deviceScaleFactor,hasTouch,isMobile,userAgent})=>{
 const context=await browser.newContext({...contextOptions,viewport,deviceScaleFactor,hasTouch,isMobile,userAgent,javaScriptEnabled:false});
 try{
  const page=await context.newPage();
  const readingBox=element=>element.evaluate(node=>{
   const box=node.getBoundingClientRect(),masthead=document.querySelector('[data-page-masthead]').getBoundingClientRect(),rail=document.querySelector('[data-project-chapter-navigation]').getBoundingClientRect();
   const safeTop=Math.max(0,masthead.bottom)+12,safeBottom=rail.width>rail.height?Math.min(innerHeight,rail.top)-12:innerHeight-12;
   const desiredY=Math.max(0,Math.min(document.documentElement.scrollHeight-innerHeight,scrollY+box.top-safeTop-8));
   const under=document.elementFromPoint(box.left+box.width/2,box.top+box.height/2);
   return{top:box.top,bottom:box.bottom,safeTop,safeBottom,desiredY,y:scrollY,unobscured:under===node||node.contains(under)};
  });
  const readNative=async element=>{
   await expect(element).toBeVisible();
   const before=await readingBox(element);
   // Native wheel delivery is asynchronous and can round fractional document
   // coordinates. Leave an eight-pixel guard and verify actual reading geometry.
   if(Math.abs(before.desiredY-before.y)>.5){
    await page.mouse.move(page.viewportSize().width/2,(before.safeTop+before.safeBottom)/2);
    await page.mouse.wheel(0,before.desiredY-before.y);
   }
   let previousY,last;
   try{
    await expect.poll(async()=>{
     last=await readingBox(element);const stable=last.y===previousY;previousY=last.y;
     // Two equal samples can precede WebKit's asynchronous wheel delivery.
     // Do not let the next reading step measure against an unfinished scroll.
     const delivered=Math.abs(last.y-before.desiredY)<=1;
     return delivered&&stable&&last.top>=last.safeTop&&last.bottom<=last.safeBottom&&last.unobscured;
    }).toBe(true);
   }catch(error){error.message+='\nNative reading geometry: '+JSON.stringify(last);throw error;}
  };
  const models=[];page.on('request',request=>{if(/\.(glb|hdr)(?:\?|$)/.test(request.url()))models.push(request.url());});
   expect((await page.goto('http://127.0.0.1:4186'+route(project))).status()).toBe(200);
   expect(page.viewportSize()).toEqual(viewport);await page.evaluate(()=>document.fonts.ready);
   await expect(page.locator('h1')).toHaveText(project.title);
   await expect(page.locator('[data-site-loader]')).toBeHidden();
   await expect(page.locator('[data-project-chapter]')).toHaveCount(project.sections.length+2);await expect(page.locator('canvas')).toHaveCount(1);await expect(page.locator('[data-project-study-canvas]')).toHaveCount(0);
   await decodeSource(page.locator('[data-project-chapter="overview"]'),project.hero);
   const fullSource=['project-caschlatsch','special-assemblies','hc3dp-caustics','dot-based-3d-printing','entrance-installation-art','mode-s-of-making'].includes(project.id)?page.locator(`[data-editorial-source="${project.hero.src}"] figcaption > a`):page.locator(`[data-project-chapter="overview"] a[href="${project.hero.src}"]`);
   await readNative(fullSource);
   const [sourcePage]=await Promise.all([context.waitForEvent('page'),fullSource.click()]);
   await sourcePage.waitForURL(new URL(project.hero.src,page.url()).href);await sourcePage.waitForLoadState('domcontentloaded');expect(new URL(sourcePage.url()).pathname).toBe(project.hero.src);
   await expect(sourcePage.locator('img')).toHaveJSProperty('naturalWidth',project.hero.width);await sourcePage.close();
   for(const section of project.sections){
    const chapter=page.locator(`[data-project-chapter="${section.id}"]`),heading=chapter.locator('h2');
    await page.locator(`[data-project-chapter-link="${section.id}"]`).click();
    await expect(page).toHaveURL(new RegExp(`#${project.id}-${section.id}$`));
    await expect(chapter).toHaveAttribute('id',`${project.id}-${section.id}`);await expect(chapter).toHaveAttribute('aria-labelledby',`${project.id}-${section.id}-heading`);
    // A native chapter link enters the source-first section; its heading can
    // follow a complete image/caption instead of sharing the initial viewport.
    await expect(chapter).toBeInViewport();
    if(project.id==='project-caschlatsch'||['special-assemblies','hc3dp-caustics','dot-based-3d-printing'].includes(project.id)&&section.id==='results'){const native=chapter.locator('[data-editorial-image]').first();await native.scrollIntoViewIfNeeded();await expect(native).toBeInViewport();}else await expect(chapter.locator('[data-project-media] img')).toBeInViewport();
    await expect(heading).toHaveText(section.title);await readNative(heading);
    for(const paragraph of section.paragraphs)await readNative(chapter.getByText(paragraph,{exact:true}));
    for(const image of section.media)await decodeSource(chapter,image);
    for(const caption of await chapter.locator('[data-project-source-caption] > p[id$="-caption"],figure figcaption > p').all())await readNative(caption);
   }
   expect(await page.locator('[data-project-media] img,figure img').evaluateAll(images=>images.every(image=>image.alt.trim().length>10))).toBe(true);
   await page.locator('[data-project-chapter-link="credits"]').click();
   await readNative(page.locator('[data-project-chapter="credits"] h2'));
   for(const credit of project.credits){await expect(page.locator('[data-project-chapter="credits"]')).toContainText(credit.names);await readNative(page.locator('[data-project-chapter="credits"]').getByText(credit.names,{exact:true}));}
   expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
   expect(models).toEqual([]);
 }finally{await context.close();}
});

test('a failed documentary image ends entry once and keeps the source narrative available',async({page})=>{
 const project=studies[0];
 await page.route('**'+project.hero.src,request=>request.abort());
 await page.goto(route(project));await entered(page,'failed');
 await expect(page.locator('h1')).toBeVisible();
 await expect(page.locator('[data-project-chapter-link]')).toHaveCount(project.sections.length+2);
 const state=await page.evaluate(()=>window.__site.inspect());
 expect(state.history.filter(fact=>fact.id===state.id&&['entered','failed','cancelled'].includes(fact.phase))).toHaveLength(1);
 await page.locator('[data-project-chapter-link="credits"]').click();
 await expect(page.locator('[data-project-chapter="credits"]')).toBeInViewport();
});

test('the original Dot source supports native drag and keyboard inspection, returns exactly, and closes on pause and Reduced Motion',async({page,isMobile,browserName})=>{
 test.setTimeout(scenarioTimeout(120000));expect(dot.model.primitive).toBe('points');
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto(route(dot));await entered(page);const control=await modelChapter(page,dot);
 const chapter=dot.model.chapters[0],state=page.locator(`[data-project-model-state="${chapter}"]`),help=page.locator(`[data-project-model-help="${chapter}"]`),reset=page.locator(`[data-project-model-reset="${chapter}"]`),chapterOrder=['overview',...dot.sections.map(section=>section.id),'credits'];
 const semanticChapter=async(wanted,paused)=>{
  await expect.poll(()=>page.evaluate(()=>{
   const owner=window.__globalBackground.inspect().driver.projectStudy.chapters;
   return{chapter:owner.chapter,paused:owner.paused,total:owner.chapters,disposed:owner.disposed,root:document.querySelector('[data-project-study]').dataset.projectActiveChapter,current:[...document.querySelectorAll('[data-project-chapter-link][aria-current="location"]')].map(node=>node.dataset.projectChapterLink),counter:document.querySelector('[data-project-chapter-count]').textContent};
  }),{timeout:WAIT}).toEqual({chapter:wanted,paused,total:chapterOrder.length,disposed:false,root:wanted,current:[wanted],counter:`${String(chapterOrder.indexOf(wanted)+1).padStart(2,'0')} / ${String(chapterOrder.length).padStart(2,'0')}`});
 };
 await semanticChapter(chapter,false);await expect(state).toHaveAttribute('data-project-model-availability','ready');await expect(help).toBeVisible();await expect(reset).toBeHidden();
 await control.evaluate(node=>node.focus({preventScroll:true}));await control.press('ArrowLeft');
 await expect.poll(async()=>(await facts(page)).camera.value.azimuth,{timeout:WAIT}).toBeGreaterThan(.01);
 await control.press('Home');await expect.poll(()=>inspection(page)).toEqual({target:{azimuth:0,elevation:0},value:{azimuth:0,elevation:0},settled:true});
 await control.press('ArrowLeft');await expect.poll(async()=>(await facts(page)).camera.value.azimuth,{timeout:WAIT}).toBeGreaterThan(.01);
 await expect(state).toHaveAttribute('data-project-model-availability','inspecting');await expect(reset).toBeVisible();
 await page.keyboard.press('Tab');await expect(reset).toBeFocused();
 expect((await facts(page)).camera.target.azimuth).toBeCloseTo(.12,8);expect((await facts(page)).camera.value.azimuth).toBeGreaterThan(.01);
 await reset.press('Enter');await expect.poll(()=>inspection(page),{timeout:WAIT}).toEqual({target:{azimuth:0,elevation:0},value:{azimuth:0,elevation:0},settled:true});
 await expect.poll(async()=>{const {chapter:current,azimuth,elevation}= (await facts(page)).resource.view;return{chapter:current,azimuth,elevation};}).toEqual({chapter,azimuth:0,elevation:0});
 const returned=await facts(page);expect(returned.resource.view.cameraIntent).toEqual(returned.camera.intent);await expect(state).toHaveAttribute('data-project-model-availability','ready');await expect(reset).toBeHidden();
 await modelChapter(page,dot);await control.evaluate(node=>node.focus({preventScroll:true}));await control.press('ArrowLeft');
 await expect.poll(async()=>(await facts(page)).camera.value.azimuth,{timeout:WAIT}).toBeGreaterThan(.01);await control.press('Escape');
 await expect.poll(()=>inspection(page)).toEqual({target:{azimuth:0,elevation:0},value:{azimuth:0,elevation:0},settled:true});
 const source=page.locator(`[data-project-source-caption="${chapter}"] a`).first(),sourceKeys=await page.evaluateHandle(()=>{
  const events=[],read=event=>{if(event.target.closest('[data-project-source-caption]'))events.push({key:event.key,trusted:event.isTrusted,prevented:event.defaultPrevented});};
  addEventListener('keydown',read);return{events,dispose:()=>removeEventListener('keydown',read)};
 });
 try{
  for(const key of ['ArrowLeft','Home']){
   await modelChapter(page,dot);await source.evaluate(node=>node.focus({preventScroll:true}));await source.press(key);
   expect(await sourceKeys.evaluate(probe=>probe.events.at(-1))).toEqual({key,trusted:true,prevented:false});
   expect((await facts(page)).camera.target).toEqual({azimuth:0,elevation:0});
   if(key==='Home'){
    // Native Home keyup precedes the browser's default scroll completion.
    // Observe that real operation and source exit before issuing another
    // chapter command, rather than racing it or relaxing viewport geometry.
    await page.waitForFunction(()=>{
     const study=window.__globalBackground?.inspect().driver.projectStudy,scene=study?.scene,source=study?.backdrop.stage;
     return scrollY===0&&study?.chapters.chapter==='overview'&&document.querySelector('[data-project-study]')?.dataset.projectActiveChapter==='overview'&&scene?.chapter==='overview'&&scene.motion.mode==='absent'&&scene.motion.settled&&!scene.motion.transition&&source?.chapter==='overview'&&source.kind==='native'&&source.key==='native:overview'&&source.mode==='absent'&&source.pose.opacity===0&&source.request?.absent===true&&source.settled&&!source.transition;
    },null,{timeout:WAIT});
    await semanticChapter('overview',false);
   }
  }
 }finally{try{await sourceKeys.evaluate(probe=>probe.dispose());}finally{await sourceKeys.dispose();}}
 await modelChapter(page,dot);await semanticChapter(chapter,false);
 const point=await pressSource(page,control),dx=point.x<page.viewportSize().width*.6?60:-60;
 await page.mouse.move(point.x+dx,point.y+12,{steps:6});
 await expect.poll(async()=>Math.abs((await facts(page)).camera.value.azimuth),{timeout:WAIT}).toBeGreaterThan(.01);
 expect((await facts(page)).gesture.locked).toBe(true);await page.mouse.up();
 await expect.poll(()=>inspection(page),{timeout:WAIT}).toEqual({target:{azimuth:0,elevation:0},value:{azimuth:0,elevation:0},settled:true});closedGestures(await facts(page));
 if(isMobile){
  // The configured mobile project is Chromium/Pixel 7. CDP drives its native
  // touch pipeline, including touch-action and pointer cancellation; DOM
  // PointerEvent dispatch cannot prove that vertical document scrolling works.
  expect(browserName).toBe('chromium');const session=await page.context().newCDPSession(page);let touching=false;
  const touch=async(type,x=point.x,y=point.y)=>{await session.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x,y,id:1,radiusX:2,radiusY:2,force:1}]});touching=type!=='touchEnd';};
  try{
   const before=await page.evaluate(()=>scrollY);
   await touch('touchStart');await expect.poll(async()=>!!(await facts(page)).gesture).toBe(true);const horizontal=(await facts(page)).gesture.id;
   for(let step=1;step<=6;step++){await touch('touchMove',point.x+dx*step/6,point.y+3*step/6);await frames(page,1);}
   await expect.poll(async()=>Math.abs((await facts(page)).camera.value.azimuth),{timeout:WAIT}).toBeGreaterThan(.01);expect((await facts(page)).gesture.locked).toBe(true);
   expect(await page.evaluate(()=>scrollY)).toBe(before);await touch('touchEnd');
   await expect.poll(()=>inspection(page),{timeout:WAIT}).toEqual({target:{azimuth:0,elevation:0},value:{azimuth:0,elevation:0},settled:true});
   expect((await facts(page)).gestures.filter(fact=>fact.id===horizontal)).toEqual([{id:horizontal,status:'requested'},{id:horizontal,status:'released',reason:'released'}]);closedGestures(await facts(page));
   await touch('touchStart');await expect.poll(async()=>!!(await facts(page)).gesture).toBe(true);const vertical=(await facts(page)).gesture.id;
   for(let step=1;step<=7;step++){await touch('touchMove',point.x,point.y-14*step);await frames(page,1);}
   await touch('touchEnd');await expect.poll(()=>page.evaluate(()=>scrollY),{timeout:WAIT}).toBeGreaterThan(before);
   await expect.poll(async()=>(await facts(page)).gesture).toBeNull();const cancelled=(await facts(page)).gestures.filter(fact=>fact.id===vertical);
   expect(cancelled).toHaveLength(2);expect(cancelled[0]).toEqual({id:vertical,status:'requested'});expect(cancelled[1].status).toBe('cancelled');expect(['native-scroll','pointercancel']).toContain(cancelled[1].reason);closedGestures(await facts(page));
   expect((await facts(page)).camera.value).toEqual({azimuth:0,elevation:0});await modelChapter(page,dot);
  }finally{try{if(touching)await touch('touchEnd');}finally{await session.detach();}}
 }
 await control.evaluate(node=>node.focus({preventScroll:true}));await control.press('ArrowDown');
 await expect.poll(async()=>(await facts(page)).camera.value.elevation,{timeout:WAIT}).toBeGreaterThan(.01);
 const toggle=page.locator('[data-study-motion-toggle]');await toggle.click();await expect(toggle).toHaveAttribute('aria-pressed','true');
 await expect.poll(()=>inspection(page)).toEqual({target:{azimuth:0,elevation:0},value:{azimuth:0,elevation:0},settled:true});
 await semanticChapter(chapter,true);await expect(state).toHaveAttribute('data-project-model-availability','paused');await expect(help).toBeHidden();await expect(reset).toBeHidden();
 // Native reading/selection remains live while source motion is paused. The
 // one semantic owner must update rail and counter on forward and reverse.
 await page.locator('[data-project-chapter-link="results"]').click();await semanticChapter('results',true);
 await page.locator(`[data-project-chapter-link="${chapter}"]`).click();await settled(page,chapter,dot.model);await semanticChapter(chapter,true);await expect(state).toHaveAttribute('data-project-model-availability','paused');
 await frames(page,2);const frozen=await page.evaluate(()=>{const driver=window.__globalBackground.inspect().driver;return{time:driver.playback.activeSeconds,draws:driver.projectStudy.scene.resource.draws};});
 await control.evaluate(node=>node.focus({preventScroll:true}));await control.press('ArrowLeft');await frames(page,8);
 expect(await page.evaluate(()=>{const driver=window.__globalBackground.inspect().driver;return{time:driver.playback.activeSeconds,draws:driver.projectStudy.scene.resource.draws};})).toEqual(frozen);
 await toggle.click();await expect(toggle).toHaveAttribute('aria-pressed','false');await settled(page,dot.model.chapters[0],dot.model);await semanticChapter(chapter,false);await expect(state).toHaveAttribute('data-project-model-availability','ready');await expect(help).toBeVisible();
 const y=await page.evaluate(()=>scrollY);await page.mouse.wheel(0,80);await expect.poll(()=>page.evaluate(()=>scrollY)).toBeGreaterThan(y);
 await modelChapter(page,dot);await pressSource(page,control);await page.emulateMedia({reducedMotion:'reduce'});await page.mouse.up();
 await expect(stage(page).locator('canvas')).toHaveCount(0);const reduced=await facts(page);closed(reduced);closedGestures(reduced);expect(reduced.resource).toBeNull();expect(reduced.disposals).toBe(reduced.acquisitions);expect(reduced.staticReason).toBe('reduced-motion');
 await expect(state).toHaveAttribute('data-project-model-availability','static');await expect(help).toBeHidden();await expect(reset).toBeHidden();
 await page.emulateMedia({reducedMotion:'no-preference'});await frames(page,8);await expect(stage(page).locator('canvas')).toHaveCount(0);expect((await facts(page)).acquisitions).toBe(reduced.acquisitions);expect(errors).toEqual([]);
});

test('an actual HTTP source failure settles once, preserves native sources, and never upgrades after the server recovers',async({page})=>{
 let handler,deny=true,requests=0;
 const server=createServer((request,response)=>{if(request.url.split('?')[0]===dot.model.src){requests++;if(deny){response.writeHead(404,{'Content-Type':'text/plain','Cache-Control':'no-store'}).end('Unavailable test source');return;}}handler(request,response);});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const port=server.address().port;
 handler=createPagesPreviewHandler({root:fileURLToPath(new URL('../../.pages-workspace/out/',import.meta.url)),port});
 try{
  await page.goto(`http://127.0.0.1:${port}`+route(dot));await entered(page);
  await expect(stage(page)).toHaveAttribute('data-project-model-phase','failed',{timeout:WAIT});
  const failed=await facts(page);closed(failed);expect(failed.reason).toBe('Project model unavailable');expect(failed.resource).toBeNull();expect(failed.arrivalStatic).toBe(true);expect(requests).toBe(1);
  expect(await page.evaluate(()=>window.__site.inspect().readiness.previews)).toEqual([{mode:'static',reason:'Project model unavailable'}]);
  await expect(page.locator('canvas')).toHaveCount(1);deny=false;
  for(const section of dot.sections){await page.locator(`[data-project-chapter-link="${section.id}"]`).click();await settled(page,section.id,dot.model);for(const image of section.media)await decodeSource(page.locator(`[data-project-chapter="${section.id}"]`),image);}
  await page.emulateMedia({reducedMotion:'reduce'});await page.emulateMedia({reducedMotion:'no-preference'});await frames(page,8);
  await expect(stage(page)).toHaveAttribute('data-project-model-rendering','poster');await expect(page.locator('canvas')).toHaveCount(1);expect(requests).toBe(1);expect((await facts(page)).history).toEqual(failed.history);closed(await facts(page));
 }finally{await page.goto('about:blank');server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
});

test('Reduced Motion during a real pending source request latches its static arrival before the delayed response is released',async({page})=>{
 let release,held=false,continued;const gate=new Promise(resolve=>{release=resolve;}),delivery=new Promise(resolve=>{continued=resolve;});
 await page.route('**'+dot.model.src,async request=>{held=true;await gate;try{await request.continue();}finally{continued();}});
 try{
  await page.goto(route(dot),{waitUntil:'domcontentloaded'});await expect.poll(()=>held,{timeout:WAIT}).toBe(true);await expect(page.locator('[data-site-loader]')).toBeVisible();
  await page.emulateMedia({reducedMotion:'reduce'});await entered(page);
  const reduced=await facts(page);closed(reduced);expect(reduced.arrivalStatic).toBe(true);expect(reduced.staticReason).toBe('reduced-motion');expect(reduced.resource).toBeNull();expect(reduced.pending).toBe(false);
  release();await delivery;await page.emulateMedia({reducedMotion:'no-preference'});
  await page.locator(`[data-project-chapter-link="${dot.model.chapters[0]}"]`).click();await settled(page,dot.model.chapters[0],dot.model);await frames(page,8);
  await expect(page.locator('canvas')).toHaveCount(1);await expect(stage(page)).toHaveAttribute('data-project-model-rendering','poster');
  expect((await facts(page)).history).toEqual(reduced.history);expect((await facts(page)).acquisitions).toBe(reduced.acquisitions);expect((await facts(page)).resource).toBeNull();closed(await facts(page));
 }finally{release();}
});

test('an initially reduced documentary page makes no source request and keeps the same static arrival after preference changes',async({page})=>{
 const models=[];page.on('request',request=>{if(/\.(glb|hdr)(?:\?|$)/.test(request.url()))models.push(request.url());});
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto(route(dot));await entered(page);
 const reduced=await facts(page);expect(reduced.acquisitions).toBe(0);expect(reduced.arrivalStatic).toBe(true);expect(reduced.staticReason).toBe('reduced-motion');expect(reduced.resource).toBeNull();closed(reduced);
 await page.emulateMedia({reducedMotion:'no-preference'});await page.locator(`[data-project-chapter-link="${dot.model.chapters[0]}"]`).click();await settled(page,dot.model.chapters[0],dot.model);await frames(page,8);
 await expect(page.locator('canvas')).toHaveCount(1);expect(models).toEqual([]);expect((await facts(page)).acquisitions).toBe(0);await expect(stage(page)).toHaveAttribute('data-project-model-rendering','poster');
});

test('native WebGL context loss releases the painted source exactly once and retains truthful documentary reading',async({page})=>{
 const models=[],errors=[];page.on('request',request=>{if(/\.glb(?:\?|$)/.test(request.url()))models.push(request.url());});page.on('pageerror',error=>errors.push(error.message));
 await page.goto(route(dot));await entered(page);await modelChapter(page,dot);const prepared=await facts(page);closed(prepared);
 await stage(page).locator('canvas').evaluate(canvas=>new Promise((resolve,reject)=>{
  const context=canvas.getContext('webgl2'),extension=context?.getExtension('WEBGL_lose_context');if(!extension){reject(Error('Native WEBGL_lose_context is required for this loss case'));return;}
  canvas.addEventListener('webglcontextlost',()=>resolve(),{once:true});extension.loseContext();
 }));
 await expect(stage(page)).toHaveAttribute('data-project-model-phase','failed',{timeout:WAIT});await expect(page.locator('canvas')).toHaveCount(1);
 const lost=await facts(page);expect(lost.resource).toBeNull();expect(lost.resourceFailures).toEqual([{id:prepared.id,phase:'resource-failed',reason:'context-lost'}]);expect(lost.history).toEqual(prepared.history);expect(lost.disposals).toBe(1);closed(lost);closedGestures(lost);
 await expect(stage(page)).toHaveAttribute('data-project-model-rendering','poster');
 await decodeSource(page.locator(`[data-project-chapter="${dot.model.chapters[0]}"]`),dot.sections.find(section=>section.id===dot.model.chapters[0]).media[0]);
 await page.emulateMedia({reducedMotion:'reduce'});await page.emulateMedia({reducedMotion:'no-preference'});await frames(page,8);
 expect(models).toEqual([new URL(dot.model.src,page.url()).href]);expect((await facts(page)).resourceFailures).toEqual(lost.resourceFailures);expect(errors).toEqual([]);
});

test('native document departure suspends or disposes the source and a real history return restores one background lease',async({page})=>{
 test.setTimeout(scenarioTimeout(120000));
 const models=[];page.on('request',request=>{if(/\.glb(?:\?|$)/.test(request.url()))models.push(request.url());});
 await page.addInitScript(()=>addEventListener('pageshow',event=>{window.__testStudyPageShow={trusted:event.isTrusted,persisted:event.persisted};}));
 await page.goto(route(dot));await entered(page);await modelChapter(page,dot);closed(await facts(page));
 await page.evaluate(()=>{
  window.__testStudyDocument=performance.timeOrigin;
  addEventListener('pagehide',event=>sessionStorage.setItem('test-study-departure',JSON.stringify({trusted:event.isTrusted,persisted:event.persisted,documentId:window.__testStudyDocument,background:window.__globalBackground.inspect(),canvasCount:document.querySelectorAll('[data-project-study-canvas]').length})),{once:true});
 });
 await page.locator('[data-portfolio-navigation] a[href="/contact/"]').click();await entered(page);
 const departure=await page.evaluate(()=>JSON.parse(sessionStorage.getItem('test-study-departure')));expect(departure.trusted).toBe(true);
 if(departure.persisted){
  expect(departure.background.activeBindings).toBe(1);expect(departure.background.driver.lifecycle.suspended).toBe(true);expect(departure.canvasCount).toBe(1);
  const retained=departure.background.driver.projectStudy.scene;expect(retained.resource.firstDraw.completed).toBe(true);expect(retained.resource.sourceRevision).toBe(dot.model.sha256);expect(retained.gesture).toBeNull();expect(retained.acquisitions).toBe(1);expect(retained.disposals).toBe(0);closed(retained);
  test.info().annotations.push({type:'native-page-lifecycle',description:'This engine retained the real source document in BFCache and suspended its original resource.'});
 }else{
  expect(departure.background.activeBindings).toBe(0);expect(departure.background.driver.disposed).toBe(true);expect(departure.background.driver.events.nativeListeners).toBe(0);expect(departure.background.driver.pageField.disposed).toBe(true);expect(departure.background.driver.projectStudy.scene).toBeNull();expect(departure.canvasCount).toBe(0);
  test.info().annotations.push({type:'native-page-lifecycle',description:'This engine discarded the real source document; the canvas, native listeners and background lease were released. BFCache retention was not observed.'});
 }
 await page.goBack();await entered(page);await modelChapter(page,dot);
 const restored=await page.evaluate(()=>({id:window.__testStudyDocument,pageShow:window.__testStudyPageShow,background:window.__globalBackground.inspect()}));expect(restored.pageShow.trusted).toBe(true);expect(restored.background.activeBindings).toBe(1);expect(restored.background.acquisitions).toBe(1);expect(restored.background.driver.lifecycle.suspended).toBe(false);sourceDraw(restored.background.driver.projectStudy.scene,dot.model,page.viewportSize());closed(restored.background.driver.projectStudy.scene);
 if(restored.pageShow.persisted){expect(departure.persisted).toBe(true);expect(restored.id).toBe(departure.documentId);expect(models).toEqual([new URL(dot.model.src,page.url()).href]);}
 else if(departure.persisted)test.info().annotations.push({type:'native-page-lifecycle',description:'The engine evicted its retained departure before history return; the real new document prepared and painted its source again.'});
 await expect(page.locator('canvas')).toHaveCount(2);
});
