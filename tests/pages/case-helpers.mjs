import {expect} from '@playwright/test';
export const WAIT = 45000;
// Functional assertions keep their precision; shared Linux software-GPU runners
// need a larger wall-clock budget than a local hardware-rendered browser.
export const scenarioTimeout = milliseconds => process.env.CI ? milliseconds * 2 : milliseconds;
export const surface = (page, chapter='form') => page.locator(`[data-model-viewport][data-study-chapter="${chapter}"]`);
export async function frames(page,count=3){await page.evaluate(async n=>{for(let i=0;i<n;i++)await new Promise(requestAnimationFrame);},count);}
export async function settle(page){
 await page.evaluate(timeout=>new Promise((resolve,reject)=>{
  let candidate=null,last=null,raf=0;
  const timer=setTimeout(()=>{cancelAnimationFrame(raf);reject(Error('Controller/render did not settle: '+JSON.stringify(last)));},timeout);
  const sample=()=>{
   const story=window.__story?.inspect(),scene=window.__thesis?.inspect();
   last={native:story?.nativeDocY,scroll:scrollY,settled:story?.settled,inspectionSettled:story?.inspection?.settled,canvasSettled:story?.canvasPlacement?.settled,canvasVisible:story?.canvasPlacement?.visible,pending:story?.readingPending,controllerFrame:story?.controllerFrame,renderedControllerFrame:scene?.renderedControllerFrame,frameDelta:story?.frameDelta};
   const current=story&&Math.abs(story.nativeDocY-scrollY)<.01&&!story.readingPending&&story.settled&&story.inspection.settled&&story.canvasPlacement?.settled!==false&&!story.canvasAwaitingPaint;
   if(!current)candidate=null;
   else {
    const signature=[scrollY,story.visualDocY,document.documentElement.scrollHeight,story.inspection.value.azimuth,story.inspection.value.elevation,story.canvasPlacement?.x,story.canvasPlacement?.y,story.canvasPlacement?.scale].join('/');
    if(candidate?.signature!==signature)candidate={signature,frame:story.controllerFrame};
    // Wait for the actual render of this settled controller state, rather than
    // six arbitrary RAFs. Static/no-WebGL content has no renderer to await.
    if(!scene?.ready||story.canvasPlacement?.visible===false||scene.renderedControllerFrame>=candidate.frame){clearTimeout(timer);resolve();return;}
   }
   raf=requestAnimationFrame(sample);
  };
  raf=requestAnimationFrame(sample);
 }),WAIT);
}
export async function loadScene(page){await page.goto('/');await page.getByRole('combobox',{name:'Visual detail',exact:true}).selectOption('light');await page.waitForFunction(()=>window.__thesis?.inspect().ready&&window.__story,null,{timeout:WAIT});await page.evaluate(()=>document.fonts.ready);await settle(page);}
export async function centerStudy(page,chapter='form',{ready=true}={}){
 const el=surface(page,chapter);
 await el.evaluate(el=>{
  const naturalY=element=>{let y=0;for(let n=element;n;n=n.offsetParent)y+=n.offsetTop;return y;};
  const section=el.closest('[data-story-chapter]'),sections=[...document.querySelectorAll('[data-story-chapter]')],index=sections.indexOf(section);
  const start=naturalY(section),end=index<sections.length-1?naturalY(sections[index+1]):start+section.offsetHeight;
  const height=document.querySelector('[data-cinematic-stage]')?.offsetHeight||innerHeight,span=end-start;
  const holdStart=start-height*.62+Math.min(span*.18,height*.45),holdEnd=end-height*.62-Math.min(span*.20,height*.50);
  // Put the document controls near the authored scene, but never make their
  // rectangle the camera/stage owner. Long source chapters have a true hold.
  const desired=naturalY(el)-Math.max(112,(innerHeight-el.offsetHeight)*.34);
  el.focus({preventScroll:true});
  scrollTo({top:Math.max(holdStart+1,Math.min(holdEnd-1,desired)),behavior:'instant'});
 });
 await settle(page);
 if(ready)await page.waitForFunction(id=>window.__thesis?.inspect().representation?.chapterId===id&&window.__thesis.inspect().studyWeight>.99,chapter,{timeout:WAIT});
}
export async function hitPoint(page,chapter='form'){
 return page.evaluate(id=>{
  const scene=window.__thesis.inspect(),canvas=document.querySelector('[data-cinematic-stage] canvas'),r=canvas.getBoundingClientRect(),aperture=scene.pose.viewport,candidates=[];
  const hit=(x,y)=>{
   if(x<0||x>=innerWidth||y<100||y>innerHeight-90)return false;
   const under=document.elementFromPoint(x,y);
   if(!under||under.closest('button,a,select,input,summary,[data-protect],[data-feedback-plane]'))return false;
   const h=window.__thesis.hitTest(x,y);return h?.source&&h.chapterId===id;
  };
  for(let y=.05;y<.96;y+=.05)for(let x=.05;x<.96;x+=.05)candidates.push({x:r.left+r.width*(aperture.left+aperture.width*x),y:r.top+r.height*(aperture.top+aperture.height*y),distance:Math.hypot(x-.5,y-.5)});
  candidates.sort((a,b)=>a.distance-b.distance);let best=null;
  for(const {x,y} of candidates){if(!hit(x,y))continue;const interior=[[-6,0],[6,0],[0,-6],[0,6]].filter(([dx,dy])=>hit(x+dx,y+dy)).length;if(interior===4)return{x,y};if(!best||interior>best.interior)best={x,y,interior};}
  if(best)return{x:best.x,y:best.y};throw Error('No unobscured actual source hit in '+id+' at '+JSON.stringify(aperture));
 },chapter);
}
export async function pause(page){const b=page.getByRole('button',{name:'Pause motion',exact:true});if(await b.count())await b.click();await settle(page);}
export async function expectIdle(page){
 await settle(page);
 await page.waitForFunction(()=>{
  const story=window.__story.inspect(),scene=window.__thesis.inspect();
  // A controller can be idle while Fiber still owes its final requested paint.
  // Require the latest controller acknowledgment and an empty renderer queue
  // before measuring zero work; an absent scene deliberately need not paint.
  return !story.scheduled&&(story.canvasPlacement?.visible===false||!scene.ready||scene.renderedControllerFrame>=story.controllerFrame&&(scene.rendererPendingFrames??0)===0);
 },null,{timeout:WAIT});
 const sample=()=>page.evaluate(()=>({frames:window.__thesis.inspect().frames,time:window.__story.inspect().playback.activeSeconds,fieldDraws:window.__story.inspect().pageField.draws}));
 const before=await sample();await frames(page,8);expect(await sample()).toEqual(before);
}
