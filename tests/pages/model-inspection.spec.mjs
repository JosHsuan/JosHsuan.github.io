import {test,expect} from '@playwright/test';
import {SCENE_RECOVERY_KEY} from '../../roles/uiux-designer/cases/bending-active-thesis/components/scene-recovery.mjs';
import {readFileSync} from 'node:fs';
import {writeFile} from 'node:fs/promises';
import {PerspectiveCamera,Vector3,Matrix4} from 'three';
import {viewportStageSourceViewport} from '../../roles/uiux-designer/cases/bending-active-thesis/components/source-scene-score.mjs';
import {modelInformationSummary,modelAnnotationLabel} from '../../roles/uiux-designer/cases/bending-active-thesis/components/model-information.mjs';
import {WAIT,scenarioTimeout,surface,frames,settle,loadScene,centerStudy,hitPoint,expectIdle} from './case-helpers.mjs';
const catalog=JSON.parse(readFileSync(new URL('../../roles/uiux-designer/cases/bending-active-thesis/release/public/assets/thesis/source-diagrams.json',import.meta.url),'utf8'));
// A real keyboard inspection owns the view for geometric measurements. Both
// key presses return to the same angle without adding a hidden pause control.
async function holdView(page,chapter='form'){
 await surface(page,chapter).press('ArrowLeft');await surface(page,chapter).press('ArrowRight');await settle(page);
}
async function entered(page){await page.waitForFunction(()=>window.__story?.inspect().entry?.phase==='entered',null,{timeout:WAIT});}
async function expectSourceInformation(page,chapter) {
 // The representation advances autonomously, including while comparison's
 // bounded lease expires. Read its rendered label and source at one instant.
 const observed=await page.evaluate(chapter=>{
  const one=(root,selector)=>{const nodes=root.querySelectorAll(selector);if(nodes.length!==1)throw Error('Expected one '+selector);return nodes[0];};
  const label=one(document,`[data-model-side-label][data-study-chapter="${chapter}"]`),study=one(document,`[data-model-study][data-study-chapter="${chapter}"]`);
  const text=selector=>one(label,selector).textContent.replace(/\s+/g,' ').trim(),description=one(label,'[data-source-description]'),current=one(description,'[data-model-caption-current]'),box=label.getBoundingClientRect();
  return{representation:window.__thesis.inspect().representation,label:text('[data-source-label]'),summary:text('[data-model-caption-current]'),position:text('[data-source-position]'),annotation:text('[data-model-annotation-text]'),placement:label.getAttribute('data-model-label-placement'),connector:one(study,'[data-model-connector]').getAttribute('data-annotation-visible'),visible:label.checkVisibility({visibilityProperty:true})&&box.width>0&&box.height>0,descriptionDisplay:getComputedStyle(description).display,captionFits:current.getBoundingClientRect().height<=description.getBoundingClientRect().height+.1};
 },chapter);
 const r=observed.representation;
 const record=catalog.representations.find(item=>item.id===r.id),count=chapter==='pattern'?3:4;
 const description=record.description+(r.id==='curvature'?' '+catalog.limits[0]:'');
 expect(observed.label).toBe(record.label);
 expect(observed.summary).toBe(modelInformationSummary(record));
 expect(observed.position).toBe(`${chapter==='pattern'?'Experiment':'Representation'} ${r.index+1} / ${count}`);
 expect(r.description).toBe(description);expect(r.count).toBe(count);
 expect(observed.visible).toBe(true);
 expect(observed.connector).toBe(observed.placement==='native'?'false':'true');
 if(observed.placement==='native')expect(r.annotation).toBeNull();else expect(r.annotation).toBeTruthy();
 expect(observed.annotation).toBe(modelAnnotationLabel(r.id));
 expect(observed.descriptionDisplay).toBe('grid');expect(observed.captionFits).toBe(true);
}
async function fit(page,receipt){
 const observed=await page.evaluate(()=>{const canvas=document.querySelector('[data-cinematic-stage] canvas'),r=canvas.getBoundingClientRect();return {...window.__thesis.inspect(),width:canvas.clientWidth,height:canvas.clientHeight,display:{left:r.left,top:r.top,width:r.width,height:r.height}};});
 const {pose,representation,width,height,display,renderSuspended,canvasPlacement}=observed;
 if(receipt)Object.assign(receipt,{pose,representation,width,height,display,renderSuspended,canvasPlacement,renderProfile:observed.renderProfile,renderPressure:observed.renderPressure,renderPressureDecisions:observed.renderPressureDecisions,renderBudget:observed.renderBudget,compositor:observed.compositor?{requestedSamples:observed.compositor.requestedSamples,width:observed.compositor.width,height:observed.compositor.height}:null});
 expect(renderSuspended).toBe(false);expect(canvasPlacement.visible).toBe(true);expect(width).toBeGreaterThan(0);expect(height).toBeGreaterThan(0);
 expect(display.width/display.height).toBeCloseTo(width/height,5);expect(pose.aspect).toBeCloseTo(width/height,5);
 expect(pose).toMatchObject({compositionSpace:'viewport-stage',viewport:viewportStageSourceViewport(width/height,width)});
 const item=catalog.representations.find(x=>x.id===representation.id);expect(item).toBeTruthy();
 expect(representation.vertices).toBe(item.vertices);expect(representation.triangles).toBe(item.triangles);expect(representation.assetRevision).toBe(catalog.revision);
 const camera=new PerspectiveCamera(pose.fov,width/height,pose.near,pose.far);camera.position.fromArray(pose.position);camera.up.fromArray(pose.up);camera.lookAt(...pose.target);camera.setViewOffset(width,height,width*pose.viewOffsetNormalized.x,height*pose.viewOffsetNormalized.y,width,height);camera.updateProjectionMatrix();camera.updateMatrixWorld(true);
 const viewport=pose.viewport,p=new Vector3(),margin=[Infinity,Infinity,Infinity,Infinity],extent={left:Infinity,right:-Infinity,top:Infinity,bottom:-Infinity};let near=Infinity,far=-Infinity;
 if(representation.annotation){
  p.fromArray(item.framingSupport.points[representation.annotation.index]).project(camera);
  expect(representation.annotation.x).toBeCloseTo((p.x+1)*width/2,3);
  expect(representation.annotation.y).toBeCloseTo((1-p.y)*height/2,3);
 }
 // Projection uses the stable Canvas aspect, not the page viewport. Uniform
 // DOM scale preserves that aspect and actual pointer mapping. Every support
 // point is still projected. Assert the six extrema once instead
 // of generating thousands of identical Playwright assertion/trace events.
 for(const v of item.framingSupport.points){p.fromArray(v).project(camera);const x=(p.x+1)/2,y=(1-p.y)/2;const gaps=[(x-viewport.left)/viewport.width,(viewport.left+viewport.width-x)/viewport.width,(y-viewport.top)/viewport.height,(viewport.top+viewport.height-y)/viewport.height];for(let i=0;i<4;i++)margin[i]=Math.min(margin[i],gaps[i]);near=Math.min(near,p.z);far=Math.max(far,p.z);extent.left=Math.min(extent.left,x);extent.right=Math.max(extent.right,x);extent.top=Math.min(extent.top,y);extent.bottom=Math.max(extent.bottom,y);}
 if(receipt)receipt.projection={supportPoints:item.framingSupport.points.length,margin,near,far,extent};
 for(const gap of margin)expect(gap).toBeGreaterThanOrEqual(.0299);expect(near).toBeGreaterThan(-1);expect(far).toBeLessThan(1);
 return {left:display.left+extent.left*display.width,right:display.left+extent.right*display.width,top:display.top+extent.top*display.height,bottom:display.top+extent.bottom*display.height};
}

test('model information follows autonomous changes and explicit comparison release',async({page})=>{
 test.setTimeout(scenarioTimeout(120000));await loadScene(page);await centerStudy(page,'form');
 const initial=await page.evaluate(()=>window.__thesis.inspect().representation.id);
 await expect.poll(()=>page.evaluate(()=>window.__thesis.inspect().representation.id),{timeout:WAIT}).not.toBe(initial);
 await holdView(page);await expectSourceInformation(page,'form');
 // Observe the actual painted comparison before slow driver roundtrips can
 // consume its eight-second lease; keyboard hold has independent ownership.
 const pinObservation=await surface(page).evaluateHandle(node=>{
  const before=window.__thesis.inspect().representation,expectedIndex=(before.index+1)%before.count;
  let sample=null;
  const observer=new MutationObserver(()=>{
   const current=window.__thesis.inspect().representation;
   if(current.pinned&&current.chapterId===before.chapterId&&current.index===expectedIndex){sample={index:current.index,id:current.id};observer.disconnect();}
  });
  observer.observe(node.closest('[data-model-study]'),{subtree:true,attributes:true,childList:true,characterData:true});
  observer.observe(document.querySelector(`[data-model-side-label][data-study-chapter="${node.dataset.studyChapter}"]`),{subtree:true,attributes:true,childList:true,characterData:true});
  return{get sample(){return sample;},dispose(){observer.disconnect();}};
 });
 try{
  await surface(page).press('Enter');
  await expect.poll(()=>pinObservation.evaluate(value=>value.sample!==null)).toBe(true);
 }finally{await pinObservation.evaluate(value=>value.dispose());await pinObservation.dispose();}
 await holdView(page);await expectSourceInformation(page,'form');
 expect(await page.evaluate(()=>window.__thesis.inspect().representation.held)).toBe(true);
 const heldTime=await page.evaluate(()=>window.__story.inspect().playback.activeSeconds);
 await surface(page).press('Escape');await settle(page);
 expect(await page.evaluate(()=>({engaged:window.__story.inspect().modelEngaged,selection:window.__story.inspect().sourceSelection,held:window.__story.inspect().modelHeldSource}))).toEqual({engaged:false,selection:null,held:null});
 expect(await page.evaluate(()=>window.__thesis.inspect().representation.pinned)).toBe(false);
 await expect.poll(()=>page.evaluate(()=>window.__story.inspect().playback.activeSeconds),{timeout:WAIT}).toBeGreaterThan(heldTime);
 // After proving release resumes the shared clock, use real keyboard ownership
 // before checking multiple DOM fields against one rendered representation.
 await holdView(page);await expectSourceInformation(page,'form');await expectIdle(page);
});

test('source information uses desktop side placement or stable native mobile flow and follows inspection',async({page})=>{
 test.setTimeout(scenarioTimeout(150000));await loadScene(page);
 for(const [width,height] of [[1440,1000],[820,1180],[390,844],[320,700]]){
  await page.setViewportSize({width,height});await centerStudy(page,'pattern');await surface(page,'pattern').press('Enter');await holdView(page,'pattern');
  const sample=()=>page.evaluate(()=>{
   const study=document.querySelector('[data-model-study][data-model-active="true"]'),label=document.querySelector(`[data-model-side-label][data-study-chapter="${study.dataset.studyChapter}"]`),panel=label.getBoundingClientRect(),model=study.querySelector('[data-model-viewport]').getBoundingClientRect();
   const native=label.dataset.modelLabelPlacement==='native',style=getComputedStyle(label);
   // Capture identity and geometry in one browser delivery. Separate waits and
   // reads can straddle the next native-scroll update on a slow renderer.
   if(native&&(label.dataset.informationMoving!=='false'||!new DOMMatrix(style.transform==='none'?undefined:style.transform).isIdentity))return null;
   const host=document.querySelector(`[data-model-study-host="${study.dataset.studyChapter}"]`),next=host.nextElementSibling.getBoundingClientRect();
   const r=window.__thesis.inspect().representation;
   return {native,position:style.position,inHost:label.parentElement===host.querySelector('[data-model-information-host]'),nextTop:next.top,documentY:panel.top+scrollY,documentHeight:document.documentElement.scrollHeight,panel:{left:panel.left,right:panel.right,top:panel.top,bottom:panel.bottom},model:{left:model.left,right:model.right,top:model.top,bottom:model.bottom},annotation:r.annotation,poseAzimuth:window.__thesis.inspect().pose.azimuth,source:r.id};
  });
  const restingSample=async()=>{let value;await expect.poll(async()=>{value=await sample();return value!==null;},{timeout:WAIT}).toBe(true);return value;};
  const before=await restingSample();expect(before.native).toBe(width<=780);
  if(width<=780){expect(before.position).toBe('relative');expect(before.inHost).toBe(true);expect(before.panel.left).toBeGreaterThanOrEqual(0);expect(before.panel.right).toBeLessThanOrEqual(width);expect(before.panel.bottom).toBeLessThanOrEqual(before.nextTop);expect(before.panel.bottom-before.panel.top).toBeGreaterThan(0);}
  else{expect(before.panel.left).toBeGreaterThan(before.model.right);expect(before.panel.right).toBeLessThanOrEqual(width);expect(before.panel.top).toBeCloseTo(before.model.top,1);expect(before.panel.bottom).toBeLessThan(height-40);}
  await expect(page.locator('[data-model-study-host] header,[data-model-study-host] footer')).toHaveCount(0);
  await surface(page,'pattern').press('ArrowRight');await settle(page);await expectSourceInformation(page,'pattern');await fit(page);
  const after=await restingSample();expect(after.panel).toEqual(before.panel);expect(after.documentY).toBe(before.documentY);expect(after.documentHeight).toBe(before.documentHeight);expect(after.poseAzimuth).not.toBe(before.poseAzimuth);
  if(width<=780){expect(before.annotation).toBeNull();expect(after.annotation).toBeNull();}
  else{expect(after.annotation.index).toBe(before.annotation.index);expect(Math.abs(after.annotation.x-before.annotation.x)+Math.abs(after.annotation.y-before.annotation.y)).toBeGreaterThan(.1);}
  await surface(page,'pattern').press('Escape');await settle(page);
 }
});

// Native cards retain layout while the existing information presenter applies
// the explicit perspective plane. Capture used layout and projected corners
// synchronously; the fixed desktop annotation keeps its separate ink contract.
function authoredPlaneMatrix({x,y,rx,ry,rz,skew,sx,sy,perspective},moving){
 const matrix=new Matrix4();if(!moving)return matrix.elements;
 matrix.elements[11]=-1/perspective;
 matrix.multiply(new Matrix4().makeTranslation(x,y,0));
 const radians=angle=>angle*Math.PI/180;
 matrix.multiply(new Matrix4().makeRotationX(radians(rx)));
 matrix.multiply(new Matrix4().makeRotationY(radians(ry)));
 matrix.multiply(new Matrix4().makeRotationZ(radians(rz)));
 const shear=new Matrix4();shear.elements[1]=Math.tan(radians(skew));
 return matrix.multiply(shear).multiply(new Matrix4().makeScale(sx,sy,1)).elements;
}
async function nativeCardGeometry(panel,baseline=null){
 return panel.evaluate((el,baseline)=>{
  const style=getComputedStyle(el),host=el.parentElement,parent=host.getBoundingClientRect(),rect=el.getBoundingClientRect();
  const matrix=new DOMMatrix(style.transform==='none'?undefined:style.transform),moving=el.dataset.informationMoving==='true';
  if(baseline===null&&(el.dataset.informationMoving!=='false'||!matrix.isIdentity))return null;
  const number=value=>parseFloat(value)||0;
  const natural={x:0,y:0};for(let node=el;node;node=node.offsetParent){natural.x+=node.offsetLeft;natural.y+=node.offsetTop;}
  // Initial capture is permitted only after the presenter is genuinely neutral.
  // Native used layout can differ from serialized CSS padding by a layout unit.
  const box=baseline??{width:rect.width,height:rect.height,left:rect.left-parent.left,top:rect.top-parent.top};
  const {width,height}=box,left=parent.left+box.left,top=parent.top+box.top;
  const origin=style.transformOrigin.split(' ').map(Number.parseFloat);
  const points=[[0,0],[width,0],[width,height],[0,height]].map(([x,y])=>{
   const point=new DOMPoint(x-origin[0],y-origin[1]).matrixTransform(matrix);return {x:left+origin[0]+point.x/point.w,y:top+origin[1]+point.y/point.w,w:point.w};
  });
  const ancestors=[];for(let node=host;node;node=node.parentElement)ancestors.push(getComputedStyle(node).transform);
  return {box,computedSize:[style.width,style.height],natural,documentHeight:document.documentElement.scrollHeight,position:style.position,insets:[style.left,style.right,style.top,style.bottom],onlyChild:host.children.length===1,ancestors,
   width,height,clientSize:[el.clientWidth,el.clientHeight],plane:el.hasAttribute('data-information-plane'),moving,identity:matrix.isIdentity,
   vars:Object.fromEntries(['x','y','rz','rx','ry','skew','sx','sy','perspective'].map(key=>[key,number(style.getPropertyValue('--information-'+key))])),
   matrix:Array.from(matrix.toFloat64Array()),weights:points.map(point=>point.w),
   actual:{left:rect.left,right:rect.right,top:rect.top,bottom:rect.bottom},expected:{left:Math.min(...points.map(p=>p.x)),right:Math.max(...points.map(p=>p.x)),top:Math.min(...points.map(p=>p.y)),bottom:Math.max(...points.map(p=>p.y))}};
 },baseline);
}
function expectNativeCardGeometry(value){
 expect(value.position).toBe('relative');for(const inset of value.insets)expect(['auto','0px']).toContain(inset);expect(value.onlyChild).toBe(true);
 expect(value.ancestors.every(transform=>transform==='none')).toBe(true);
 expect(value.width).toBeGreaterThan(0);expect(value.height).toBeGreaterThan(0);
 expect(value.plane).toBe(true);
 // Independent oracle for the authored curved field's CSS transform order
 // and bounds, including peripheral translation and liquid stretch.
 for(const [key,limit] of [['x',5],['y',3],['rx',11],['ry',12],['rz',2.2],['skew',2.8]])expect(Math.abs(value.vars[key])).toBeLessThanOrEqual(limit);
 for(const [key,limit] of [['sx',1.018],['sy',1.012]]){expect(value.vars[key]).toBeGreaterThanOrEqual(1);expect(value.vars[key]).toBeLessThanOrEqual(limit);}
 expect(value.vars.perspective).toBeGreaterThanOrEqual(850);
 expect(value.vars.perspective).toBeCloseTo(Math.max(850,...value.clientSize.map(size=>size*2.7)),1);
 const expected=authoredPlaneMatrix(value.vars,value.moving);
 for(let i=0;i<16;i++)expect(value.matrix[i]).toBeCloseTo(expected[i],6);
 for(const weight of value.weights){expect(Number.isFinite(weight)).toBe(true);expect(weight).toBeGreaterThan(0);}
 if(!value.moving){expect(value.identity).toBe(true);for(const key of ['x','y','rz','rx','ry','skew'])expect(value.vars[key]).toBe(0);for(const key of ['sx','sy'])expect(value.vars[key]).toBe(1);}
 for(const side of ['left','right','top','bottom'])expect(Math.abs(value.actual[side]-value.expected[side]),`${side}: ${JSON.stringify(value)}`).toBeLessThanOrEqual(.01);
}

test('side information and its leader follow the displayed Canvas throughout the timed exit',async({page})=>{
 // The final source chapter owns departure; Form-to-System is continuous.
 test.setTimeout(scenarioTimeout(120000));await page.clock.install();await loadScene(page);await centerStudy(page,'pattern');
 const canvas=await page.locator('[data-cinematic-stage] canvas').elementHandle();
 const panel=page.locator('[data-model-side-label][data-study-chapter="pattern"]');
 const before=await panel.boundingBox(),native=await panel.getAttribute('data-model-label-placement')==='native';
 let nativeBefore=null;
 if(native)await expect.poll(async()=>{nativeBefore=await nativeCardGeometry(panel);return nativeBefore!==null;},{timeout:WAIT}).toBe(true);
 if(native){expect(['x','y','rz','rx','ry','skew'].every(key=>nativeBefore.vars[key]===0)).toBe(true);expectNativeCardGeometry(nativeBefore);}
 const exit=await page.evaluate(()=>{const p=window.__story.inspect().canvasPlacement;return p.holdEnd+(p.end-p.holdEnd)*.4;});
 await page.clock.pauseAt(new Date(Date.now()+3600000));
 try{
  await page.evaluate(y=>scrollTo({top:y,behavior:'instant'}),exit);
  const phases=[.15,.25,.30];let captured=0,requestId;
  for(let frame=0;frame<100&&captured<phases.length;frame++){
   await page.clock.runFor(16);
   const sample=await page.evaluate(()=>{
    const p=window.__story.inspect().canvasPlacement,r=window.__thesis.inspect().representation;
    const canvas=document.querySelector('[data-cinematic-stage] canvas'),display=canvas.getBoundingClientRect();
    const study=document.querySelector('[data-model-study][data-study-chapter="pattern"]'),outer=study.getBoundingClientRect();
    const dot=study.querySelector('[data-model-anchor]'),caption=document.querySelector('[data-model-side-label][data-study-chapter="pattern"] [data-model-annotation-label]').getBoundingClientRect();
    const points=study.querySelector('[data-model-leader]').getAttribute('points')?.trim().split(/\s+/).map(point=>point.split(',').map(Number));
    return{p,annotation:r.annotation,visible:study.querySelector('[data-model-connector]').dataset.annotationVisible,
     expectedX:display.left-outer.left+(r.annotation?.x??NaN)*display.width/canvas.clientWidth,expectedY:display.top-outer.top+(r.annotation?.y??NaN)*display.height/canvas.clientHeight,
     dotX:Number(dot.getAttribute('cx')),dotY:Number(dot.getAttribute('cy')),end:points?.at(-1)??null,expectedEnd:[caption.left-outer.left-10,caption.top-outer.top+caption.height/2]};
   });
   if(sample.p.transition?.kind!=='exit'||sample.p.transition.elapsed<phases[captured])continue;
   captured++;requestId??=sample.p.request.id;
   expect(sample.p.request.id).toBe(requestId);expect(sample.p.scale).toBe(1);
   expect(sample.visible).toBe(native?'false':'true');
   if(native)expect(sample.annotation).toBeNull();
   if(!native){
   expect(sample.annotation.visible).toBe(true);
   expect(sample.dotX).toBeCloseTo(sample.expectedX,2);expect(sample.dotY).toBeCloseTo(sample.expectedY,2);
   expect(sample.end[0]).toBeCloseTo(sample.expectedEnd[0],2);expect(sample.end[1]).toBeCloseTo(sample.expectedEnd[1],2);
   }
   const after=await panel.boundingBox();
   if(native){const geometry=await nativeCardGeometry(panel,nativeBefore.box);expectNativeCardGeometry(geometry);expect(geometry.computedSize).toEqual(nativeBefore.computedSize);expect(geometry.natural).toEqual(nativeBefore.natural);expect(geometry.documentHeight).toBe(nativeBefore.documentHeight);}
   else{expect(Math.abs(after.x-before.x)).toBeLessThanOrEqual(12.01);expect(Math.abs(after.y-before.y)).toBeLessThanOrEqual(12.01);}
  }
  expect(captured).toBe(phases.length);
  // Stopping native scroll must finish this passage, not leave a scrubbed pose.
  await page.clock.runFor(1100);
  const done=await page.evaluate(()=>window.__story.inspect());
  expect(done.canvasPlacement).toMatchObject({mode:'exit',opacity:0,settled:true,scale:1});
  expect(done.canvasTransitions.history.filter(event=>event.id===requestId).map(event=>event.status)).toEqual(['requested','completed']);
  expect(await page.evaluate(el=>document.querySelector('[data-cinematic-stage] canvas')===el,canvas)).toBe(true);
 }finally{await page.clock.resume();}
});

test('tablet source fits beside the reading copy and clear of fixed navigation',async({page})=>{
 test.setTimeout(scenarioTimeout(180000));await page.setViewportSize({width:820,height:1180});await loadScene(page);
 for(const chapter of ['form','system','pattern']) {
  await centerStudy(page,chapter);await page.mouse.move(4,100);
  const layout=await page.evaluate(id=>{const copy=document.querySelector(`#${id} [data-story-panel]`).getBoundingClientRect(),rail=document.querySelector('[data-story-navigation]').getBoundingClientRect();return {copyRight:copy.right,railLeft:rail.left};},chapter);
  const count=chapter==='pattern'?3:4;
  for(let index=0;index<count;index++) {
   await surface(page,chapter).press('Enter');await holdView(page,chapter);
   const projected=await fit(page);
   expect(projected.left,`${chapter}: source must be exposed beside the real reading card`).toBeGreaterThanOrEqual(layout.copyRight+4);
   expect(projected.right,`${chapter}: complete source must clear the permanent rail`).toBeLessThanOrEqual(layout.railLeft-4);
  }
 }
});
test('three source surfaces share one WebGL Canvas and preserve every fitted original representation',async({page},info)=>{
 test.setTimeout(scenarioTimeout(180000));const receipt={scope:'Full source representation inspection using existing DOM document positioning and keyboard hold; not a wheel journey or forced density fixture.',phase:'loading',sources:[]};let primaryError;
 try{const models=[],errors=[];page.on('request',r=>{if(/\.glb(?:\?|$)/.test(r.url()))models.push(r.url());});page.on('pageerror',e=>errors.push(e.message));await loadScene(page);const canvas=await page.locator('[data-cinematic-stage] canvas').elementHandle();
 await expect(page.locator('[data-model-study]')).toHaveCount(3);await expect(page.locator('[data-model-study] input,[data-model-study] select,[data-model-study] [role="tab"],[data-model-study] [role="slider"],[data-model-side-label] input,[data-model-side-label] select,[data-model-side-label] [role="tab"],[data-model-side-label] [role="slider"]')).toHaveCount(0);
 expect(await page.evaluate(()=>window.__thesis.inspect().source)).toMatchObject({vertices:172789,triangles:227521,sourceObjects:51});
 const layout=()=>page.evaluate(()=>({document:document.documentElement.scrollHeight})),before=await layout();
 receipt.phase='source-representations';
 for(const id of ['form','system','pattern']){await centerStudy(page,id);const count=id==='pattern'?3:4;const seen=new Set();
  expect(await layout(),'Changing the source family must preserve native document layout.').toEqual(before);
  for(let n=0;n<count;n++){
   await surface(page,id).press('Enter');await holdView(page,id);const r=await page.evaluate(()=>window.__thesis.inspect().representation);seen.add(r.id);
   const row={chapter:id,index:n,sourceId:r.id};receipt.sources.push(row);await fit(page,row);await expectSourceInformation(page,id);expect(await layout(),'Source representation captions must preserve native document layout.').toEqual(before);
   expect(row.representation.sourceGeometryUnmodified).toBe(true);expect(row.representation.id).toBe(r.id);
   row.floorObserved=row.renderPressure.stage===3;
   if(id==='system'){
    if(r.id==='bending'){
     const point=await hitPoint(page,id);row.hit=await page.evaluate(point=>window.__thesis.hitTest(point.x,point.y),point);row.hitPoint=point;
     expect(row.hit).toMatchObject({source:true,chapterId:'system',representationId:'bending',index:r.index});
    }
    const png=info.outputPath(`system-source-${r.id}-device.png`);await page.screenshot({path:png,scale:'device'});await info.attach(`system-source-${r.id}-device`,{path:png,contentType:'image/png'});row.png=`system-source-${r.id}-device.png`;
   }
  }expect(seen.size).toBe(count);}
 await expect(page.locator('[data-cinematic-stage] canvas')).toHaveCount(1);await expect(page.locator('canvas[data-ascii-field]')).toHaveCount(1);await expect(page.locator('canvas')).toHaveCount(2);expect(await page.evaluate(el=>document.querySelector('[data-cinematic-stage] canvas')===el,canvas)).toBe(true);expect(models.filter(x=>x.includes('source-layers.glb'))).toHaveLength(1);expect(models.filter(x=>x.includes('source-diagrams.glb'))).toHaveLength(1);expect(errors).toEqual([]);await expectIdle(page);receipt.phase='completed';
 }catch(error){primaryError=error;throw error;}finally{try{const path=info.outputPath('source-representation-pressure.json');await writeFile(path,JSON.stringify(receipt,null,2));await info.attach('source-representation-pressure',{path,contentType:'application/json'});}catch(error){if(!primaryError)throw error;}}
});
test('actual object hover and click compare sources; empty space is not an invisible button',async({page,isMobile})=>{
 test.setTimeout(scenarioTimeout(120000));await loadScene(page);await centerStudy(page);const p=await hitPoint(page),before=await page.evaluate(()=>window.__thesis.inspect().representation.id);
 if(!isMobile){await page.mouse.move(p.x,p.y);await expect(surface(page)).toHaveAttribute('data-model-hit','true');await page.mouse.click(p.x,p.y);}else await page.touchscreen.tap(p.x,p.y);
 await holdView(page);expect(await page.evaluate(()=>window.__thesis.inspect().representation.id)).not.toBe(before);await expectSourceInformation(page,'form');
 const empty=await page.evaluate(()=>{const r=document.querySelector('[data-model-viewport][data-study-chapter="form"]').getBoundingClientRect();for(const x of [.02,.98])for(const y of [.03,.9]){const p={x:r.left+r.width*x,y:r.top+r.height*y};if(p.y>100&&p.y<innerHeight-90&&!window.__thesis.hitTest(p.x,p.y))return p;}return null;});expect(empty).toBeTruthy();const selected=await page.evaluate(()=>window.__thesis.inspect().representation.id);await page.mouse.click(empty.x,empty.y);await frames(page);expect(await page.evaluate(()=>window.__thesis.inspect().representation.id)).toBe(selected);
});
test('keyboard holds and returns a view; touch pan outside and across source geometry preserves native reading',async({page,context,isMobile})=>{
 test.setTimeout(scenarioTimeout(150000));await loadScene(page);await centerStudy(page);await surface(page).press('ArrowRight');await settle(page);expect(await page.evaluate(()=>window.__story.inspect().inspection.value.azimuth)).toBe(23);await fit(page);
 const time=await page.evaluate(()=>window.__story.inspect().playback.activeSeconds);await frames(page,8);expect(await page.evaluate(()=>window.__story.inspect().playback.activeSeconds)).toBe(time);
 await surface(page).press('Escape');await settle(page);expect(await page.evaluate(()=>window.__story.inspect().inspection.value.azimuth)).toBe(30);
 if(isMobile){const p={x:8,y:600},before=await page.evaluate(()=>scrollY),cdp=await context.newCDPSession(page);expect(await page.evaluate(p=>!!document.elementFromPoint(p.x,p.y)?.closest('[data-model-viewport]'),p)).toBe(false);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...p,id:1}]});for(let i=1;i<=6;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:p.x,y:p.y-i*20,id:1}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cdp.detach();await expect.poll(()=>page.evaluate(()=>scrollY)).toBeGreaterThan(before+30);
  await centerStudy(page);const inside=await hitPoint(page),nativeBefore=await page.evaluate(()=>({y:scrollY,azimuth:window.__story.inspect().inspection.value.azimuth}));
  const touch=await context.newCDPSession(page);await touch.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...inside,id:2}]});
  for(let i=1;i<=6;i++)await touch.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:inside.x,y:inside.y-i*20,id:2}]});
  await touch.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await touch.detach();
  await expect.poll(()=>page.evaluate(()=>scrollY)).toBeGreaterThan(nativeBefore.y+30);
  expect(await page.evaluate(()=>({engaged:window.__story.inspect().modelEngaged,azimuth:window.__story.inspect().inspection.value.azimuth}))).toEqual({engaged:false,azimuth:nativeBefore.azimuth});
 }
 else{const p=await hitPoint(page);await page.mouse.move(p.x,p.y);await expect(surface(page)).toHaveAttribute('data-model-hit','true');await page.mouse.down();await page.mouse.move(p.x+60,p.y-18,{steps:5});await frames(page);expect(await page.evaluate(()=>window.__story.inspect().inspection.target.azimuth)).toBeLessThan(30);await page.mouse.up();await settle(page);expect(await page.evaluate(()=>window.__story.inspect().inspection.value.azimuth)).toBe(30);}
 await centerStudy(page);await surface(page).press('ArrowRight');await page.locator('[data-chapter-link="make"]').click();await settle(page);await expect.poll(()=>page.evaluate(()=>window.__story.inspect().playback.activeSeconds)).toBeGreaterThan(time);expect(await page.evaluate(()=>document.body.style.overflow)).not.toBe('hidden');
});
test('OS Reduced keeps automatic Full playback and native source comparison available',async({page,isMobile})=>{
 test.setTimeout(scenarioTimeout(120000));const models=[];page.on('request',r=>{if(/\.glb(?:\?|$)/.test(r.url()))models.push(r.url());});await page.emulateMedia({reducedMotion:'reduce'});await loadScene(page);await centerStudy(page);expect(models.length).toBeGreaterThan(0);await expect(page.getByRole('button',{name:'Enable model',exact:true})).toHaveCount(0);
 const before=await page.evaluate(()=>window.__story.inspect().playback.activeSeconds);await frames(page,5);expect(await page.evaluate(()=>window.__story.inspect().playback.activeSeconds)).toBeGreaterThan(before);
 await surface(page).press('Enter');await settle(page);await fit(page);await expectSourceInformation(page,'form');
 await expect(page.getByRole('combobox',{name:'Visual detail',exact:true})).toHaveCount(0);
 const scene=await page.evaluate(()=>window.__thesis.inspect());
 expect(scene.detail).toBe('full');expect(scene.compositor.requestedSamples).toBe(isMobile?0:2);
 expect(scene.systemReduced).toBe(false);expect(scene.motionPaused).toBe(false);
 const comparing=await page.evaluate(()=>window.__story.inspect().playback.activeSeconds);await frames(page,5);expect(await page.evaluate(()=>window.__story.inspect().playback.activeSeconds)).toBeGreaterThan(comparing);
});
test('load failure and context loss preserve fallback reading and release source gestures',async({page})=>{
 test.setTimeout(scenarioTimeout(150000));await page.route('**/source-layers.glb',r=>r.abort());await page.goto('/projects/bending-active/#overview');await entered(page);await centerStudy(page,'form',{ready:false});await expect(page.locator('[data-model-study][data-study-chapter="form"]')).toContainText('Interactive geometry unavailable');await expect(surface(page)).toHaveAttribute('aria-disabled','true');
  // Disabled inspection also describes a pending source. Require the actual
  // failed terminal and persisted lease before reloading its recovery path.
  await expect(page.locator('[data-scene-fallback]')).toHaveText('Source study available · 3D unavailable',{timeout:WAIT});
  await expect.poll(()=>page.evaluate(key=>JSON.parse(sessionStorage.getItem(key))?.status,SCENE_RECOVERY_KEY),{timeout:WAIT}).toBe('failed');
 await page.unroute('**/source-layers.glb');await page.reload();await entered(page);
  // A confirmed failure retains explicit recovery across reload. Activate the
  // real control, then require actual source paint before inspection resumes.
  await expect(page.getByRole('button',{name:'Enable 3D',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Enable 3D',exact:true}).click();
 await page.waitForFunction(()=>window.__thesis?.inspect().ready,null,{timeout:WAIT});await expect(page.getByRole('button',{name:'Enable 3D',exact:true})).toHaveCount(0);
 await page.evaluate(()=>document.fonts.ready);await settle(page);await centerStudy(page);const p=await hitPoint(page);await page.mouse.move(p.x,p.y);await page.mouse.down();await page.evaluate(()=>window.__thesis.loseContext());await expect(surface(page)).toHaveAttribute('aria-disabled','true',{timeout:WAIT});await page.mouse.up();await expect(page.locator('[data-story-chapter]')).toHaveCount(7);expect(await page.evaluate(()=>document.body.style.overflow)).not.toBe('hidden');expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
});
