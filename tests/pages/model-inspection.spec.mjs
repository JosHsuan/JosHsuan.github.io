import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {PerspectiveCamera,Vector3} from 'three';
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
 const r=await page.evaluate(()=>window.__thesis.inspect().representation);
 const record=catalog.representations.find(item=>item.id===r.id),count=chapter==='pattern'?3:4;
 const description=record.description+(r.id==='curvature'?' '+catalog.limits[0]:'');
 const study=page.locator(`[data-model-study][data-study-chapter="${chapter}"]`);
 const label=page.locator(`[data-model-side-label][data-study-chapter="${chapter}"]`);
 await expect(label).toHaveCount(1);
 await expect(label.locator('[data-source-label]')).toHaveText(record.label);
 await expect(label.locator('[data-model-caption-current]')).toHaveText(modelInformationSummary(record));
 await expect(label.locator('[data-source-position]')).toHaveText(`${chapter==='pattern'?'Experiment':'Representation'} ${r.index+1} / ${count}`);
 expect(r.description).toBe(description);expect(r.count).toBe(count);
 await expect(label).toBeVisible();
 await expect(study.locator('[data-model-connector]')).toHaveAttribute('data-annotation-visible',await label.getAttribute('data-model-label-placement')==='native'?'false':'true');
 if(await label.getAttribute('data-model-label-placement')==='native')expect(r.annotation).toBeNull();else expect(r.annotation).toBeTruthy();
 await expect(label.locator('[data-model-annotation-text]')).toHaveText(modelAnnotationLabel(r.id));
 await expect(label.locator('[data-source-description]')).toHaveCSS('display','grid');
 expect(await label.locator('[data-source-description]').evaluate(el=>{
  const current=el.querySelector('[data-model-caption-current]');return current.getBoundingClientRect().height<=el.getBoundingClientRect().height+.1;
 })).toBe(true);
}
async function fit(page){
 const {pose,representation,width,height,display,renderSuspended,canvasPlacement}=await page.evaluate(()=>{const canvas=document.querySelector('[data-cinematic-stage] canvas'),r=canvas.getBoundingClientRect();return {...window.__thesis.inspect(),width:canvas.clientWidth,height:canvas.clientHeight,display:{left:r.left,top:r.top,width:r.width,height:r.height}};});
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
   const host=document.querySelector(`[data-model-study-host="${study.dataset.studyChapter}"]`),next=host.nextElementSibling.getBoundingClientRect();
   const r=window.__thesis.inspect().representation;
   return {native:label.dataset.modelLabelPlacement==='native',position:getComputedStyle(label).position,inHost:label.parentElement===host.querySelector('[data-model-information-host]'),nextTop:next.top,documentY:panel.top+scrollY,documentHeight:document.documentElement.scrollHeight,panel:{left:panel.left,right:panel.right,top:panel.top,bottom:panel.bottom},model:{left:model.left,right:model.right,top:model.top,bottom:model.bottom},annotation:r.annotation,poseAzimuth:window.__thesis.inspect().pose.azimuth,source:r.id};
  });
  const before=await sample();expect(before.native).toBe(width<=780);
  if(width<=780){expect(before.position).toBe('relative');expect(before.inHost).toBe(true);expect(before.panel.left).toBeGreaterThanOrEqual(0);expect(before.panel.right).toBeLessThanOrEqual(width);expect(before.panel.bottom).toBeLessThanOrEqual(before.nextTop);expect(before.panel.bottom-before.panel.top).toBeGreaterThan(0);}
  else{expect(before.panel.left).toBeGreaterThan(before.model.right);expect(before.panel.right).toBeLessThanOrEqual(width);expect(before.panel.top).toBeCloseTo(before.model.top,1);expect(before.panel.bottom).toBeLessThan(height-40);}
  await expect(page.locator('[data-model-study-host] header,[data-model-study-host] footer')).toHaveCount(0);
  await surface(page,'pattern').press('ArrowRight');await settle(page);await expectSourceInformation(page,'pattern');await fit(page);
  const after=await sample();expect(after.panel).toEqual(before.panel);expect(after.documentY).toBe(before.documentY);expect(after.documentHeight).toBe(before.documentHeight);expect(after.poseAzimuth).not.toBe(before.poseAzimuth);
  if(width<=780){expect(before.annotation).toBeNull();expect(after.annotation).toBeNull();}
  else{expect(after.annotation.index).toBe(before.annotation.index);expect(Math.abs(after.annotation.x-before.annotation.x)+Math.abs(after.annotation.y-before.annotation.y)).toBeGreaterThan(.1);}
  await surface(page,'pattern').press('Escape');await settle(page);
 }
});

// Native cards retain layout while the existing information presenter applies
// finite pan/roll. Capture layout, CSS matrix and rendered corners synchronously.
async function nativeCardGeometry(panel,baseline=null){
 return panel.evaluate((el,baseline)=>{
  const style=getComputedStyle(el),host=el.parentElement,parent=host.getBoundingClientRect(),rect=el.getBoundingClientRect();
  const number=value=>parseFloat(value)||0;
  const natural={x:0,y:0};for(let node=el;node;node=node.offsetParent){natural.x+=node.offsetLeft;natural.y+=node.offsetTop;}
  // Initial capture is permitted only after the presenter is genuinely neutral.
  // Native used layout can differ from serialized CSS padding by a layout unit.
  const box=baseline??{width:rect.width,height:rect.height,left:rect.left-parent.left,top:rect.top-parent.top};
  const {width,height}=box,left=parent.left+box.left,top=parent.top+box.top;
  const origin=style.transformOrigin.split(' ').map(Number.parseFloat),matrix=new DOMMatrix(style.transform==='none'?undefined:style.transform);
  const points=[[0,0],[width,0],[width,height],[0,height]].map(([x,y])=>{
   const point=new DOMPoint(x-origin[0],y-origin[1]).matrixTransform(matrix);return {x:left+origin[0]+point.x,y:top+origin[1]+point.y};
  });
  const ancestors=[];for(let node=host;node;node=node.parentElement)ancestors.push(getComputedStyle(node).transform);
  return {box,computedSize:[style.width,style.height],natural,documentHeight:document.documentElement.scrollHeight,position:style.position,insets:[style.left,style.right,style.top,style.bottom],onlyChild:host.children.length===1,ancestors,
   width,height,vars:{x:number(style.getPropertyValue('--information-x')),y:number(style.getPropertyValue('--information-y')),rz:number(style.getPropertyValue('--information-rz'))},
   matrix:{a:matrix.a,b:matrix.b,c:matrix.c,d:matrix.d,e:matrix.e,f:matrix.f,offPlane:[matrix.m13,matrix.m14,matrix.m23,matrix.m24,matrix.m31,matrix.m32,matrix.m34,matrix.m43],depth:[matrix.m33,matrix.m44]},
   actual:{left:rect.left,right:rect.right,top:rect.top,bottom:rect.bottom},expected:{left:Math.min(...points.map(p=>p.x)),right:Math.max(...points.map(p=>p.x)),top:Math.min(...points.map(p=>p.y)),bottom:Math.max(...points.map(p=>p.y))}};
 },baseline);
}
function expectNativeCardGeometry(value){
 expect(value.position).toBe('relative');for(const inset of value.insets)expect(['auto','0px']).toContain(inset);expect(value.onlyChild).toBe(true);
 expect(value.ancestors.every(transform=>transform==='none')).toBe(true);
 expect(value.width).toBeGreaterThan(0);expect(value.height).toBeGreaterThan(0);
 expect(Math.abs(value.vars.x)).toBeLessThanOrEqual(12);expect(Math.abs(value.vars.y)).toBeLessThanOrEqual(12);expect(Math.abs(value.vars.rz)).toBeLessThanOrEqual(1.5);
 const angle=value.vars.rz*Math.PI/180,expected={a:Math.cos(angle),b:Math.sin(angle),c:-Math.sin(angle),d:Math.cos(angle),e:value.vars.x,f:value.vars.y};
 for(const [key,number] of Object.entries(expected))expect(value.matrix[key]).toBeCloseTo(number,6);
 expect(value.matrix.offPlane.every(coefficient=>coefficient===0)).toBe(true);expect(value.matrix.depth).toEqual([1,1]);
 for(const side of ['left','right','top','bottom'])expect(Math.abs(value.actual[side]-value.expected[side]),`${side}: ${JSON.stringify(value)}`).toBeLessThanOrEqual(.01);
}

test('side information and its leader follow the displayed Canvas throughout the timed exit',async({page})=>{
 // The final source chapter owns departure; Form-to-System is continuous.
 test.setTimeout(scenarioTimeout(120000));await page.clock.install();await loadScene(page);await centerStudy(page,'pattern');
 const canvas=await page.locator('[data-cinematic-stage] canvas').elementHandle();
 const panel=page.locator('[data-model-side-label][data-study-chapter="pattern"]');
 const before=await panel.boundingBox(),native=await panel.getAttribute('data-model-label-placement')==='native';
 if(native)await page.waitForFunction(()=>{
  const el=document.querySelector('[data-model-side-label][data-study-chapter="pattern"]'),style=getComputedStyle(el);
  const matrix=new DOMMatrix(style.transform==='none'?undefined:style.transform);
  return el.dataset.informationMoving==='false'&&['x','y','rz'].every(key=>parseFloat(style.getPropertyValue('--information-'+key))===0)&&matrix.isIdentity;
 },null,{timeout:WAIT});
 const nativeBefore=native?await nativeCardGeometry(panel):null;
 if(native){expect(Object.values(nativeBefore.vars).every(value=>value===0)).toBe(true);expectNativeCardGeometry(nativeBefore);}
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
test('three source surfaces share one WebGL Canvas and preserve every fitted original representation',async({page})=>{
 test.setTimeout(scenarioTimeout(180000));const models=[],errors=[];page.on('request',r=>{if(/\.glb(?:\?|$)/.test(r.url()))models.push(r.url());});page.on('pageerror',e=>errors.push(e.message));await loadScene(page);const canvas=await page.locator('[data-cinematic-stage] canvas').elementHandle();
 await expect(page.locator('[data-model-study]')).toHaveCount(3);await expect(page.locator('[data-model-study] input,[data-model-study] select,[data-model-study] [role="tab"],[data-model-study] [role="slider"],[data-model-side-label] input,[data-model-side-label] select,[data-model-side-label] [role="tab"],[data-model-side-label] [role="slider"]')).toHaveCount(0);
 expect(await page.evaluate(()=>window.__thesis.inspect().source)).toMatchObject({vertices:172789,triangles:227521,sourceObjects:51});
 const layout=()=>page.evaluate(()=>({document:document.documentElement.scrollHeight})),before=await layout();
 for(const id of ['form','system','pattern']){await centerStudy(page,id);const count=id==='pattern'?3:4;const seen=new Set();
  expect(await layout(),'Changing the source family must preserve native document layout.').toEqual(before);
  for(let n=0;n<count;n++){await surface(page,id).press('Enter');await holdView(page,id);const r=await page.evaluate(()=>window.__thesis.inspect().representation);seen.add(r.id);await fit(page);await expectSourceInformation(page,id);expect(await layout(),'Source representation captions must preserve native document layout.').toEqual(before);}expect(seen.size).toBe(count);}
 await expect(page.locator('[data-cinematic-stage] canvas')).toHaveCount(1);await expect(page.locator('canvas[data-ascii-field]')).toHaveCount(1);await expect(page.locator('canvas')).toHaveCount(2);expect(await page.evaluate(el=>document.querySelector('[data-cinematic-stage] canvas')===el,canvas)).toBe(true);expect(models.filter(x=>x.includes('source-layers.glb'))).toHaveLength(1);expect(models.filter(x=>x.includes('source-diagrams.glb'))).toHaveLength(1);expect(errors).toEqual([]);await expectIdle(page);
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
test('Reduced requires activation and keeps Full source comparison accessible without autonomous motion',async({page,isMobile})=>{
 test.setTimeout(scenarioTimeout(120000));const models=[];page.on('request',r=>{if(/\.glb(?:\?|$)/.test(r.url()))models.push(r.url());});await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/projects/bending-active/#overview');await entered(page);await centerStudy(page,'form',{ready:false});expect(models).toHaveLength(0);await page.locator('[data-model-side-label][data-study-chapter="form"]').getByRole('button',{name:'Enable model'}).click();await page.waitForFunction(()=>window.__thesis?.inspect().ready,null,{timeout:WAIT});await centerStudy(page);await surface(page).press('Enter');await settle(page);await fit(page);await expectSourceInformation(page,'form');
 await expect(page.getByRole('combobox',{name:'Visual detail',exact:true})).toHaveCount(0);
 const scene=await page.evaluate(()=>window.__thesis.inspect());
 expect(scene.detail).toBe('full');expect(scene.compositor.requestedSamples).toBe(isMobile?0:2);
 expect(scene.optics.maxBlurPx).toBe(0);expect(scene.optics.mistStrength).toBe(0);
 await expectIdle(page);
});
test('load failure and context loss preserve fallback reading and release source gestures',async({page})=>{
 test.setTimeout(scenarioTimeout(150000));await page.route('**/source-layers.glb',r=>r.abort());await page.goto('/projects/bending-active/#overview');await entered(page);await centerStudy(page,'form',{ready:false});await expect(page.locator('[data-model-study][data-study-chapter="form"]')).toContainText('Interactive geometry unavailable');await expect(surface(page)).toHaveAttribute('aria-disabled','true');
 await page.unroute('**/source-layers.glb');await page.reload();await entered(page);
 // An intentional failed renderer leaves the same recovery record as an
 // interrupted process. Reload stays readable until the visitor chooses 3D.
 await expect(page.getByRole('button',{name:'Enable 3D',exact:true})).toBeVisible({timeout:WAIT});
 expect(await page.evaluate(()=>window.__thesis?.inspect().ready??false)).toBe(false);
 await page.getByRole('button',{name:'Enable 3D',exact:true}).click();await page.waitForFunction(()=>window.__thesis?.inspect().ready,null,{timeout:WAIT});
 await page.evaluate(()=>document.fonts.ready);await settle(page);await centerStudy(page);const p=await hitPoint(page);await page.mouse.move(p.x,p.y);await page.mouse.down();await page.evaluate(()=>window.__thesis.loseContext());await expect(surface(page)).toHaveAttribute('aria-disabled','true',{timeout:WAIT});await page.mouse.up();await expect(page.locator('[data-story-chapter]')).toHaveCount(7);expect(await page.evaluate(()=>document.body.style.overflow)).not.toBe('hidden');expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
});
