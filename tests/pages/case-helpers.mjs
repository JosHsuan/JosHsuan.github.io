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
 const el=surface(page,chapter);await el.scrollIntoViewIfNeeded();
 await el.evaluate(el=>{el.focus({preventScroll:true});let y=0;for(let n=el;n;n=n.offsetParent)y+=n.offsetTop;scrollTo({top:y-Math.max(112,(innerHeight-el.offsetHeight)*.34),behavior:'instant'});});
 await settle(page);
 if(ready)await page.waitForFunction(id=>window.__thesis?.inspect().representation?.chapterId===id&&window.__thesis.inspect().studyWeight>.99,chapter,{timeout:WAIT});
}
export async function hitPoint(page,chapter='form'){
 return page.evaluate(id=>{const r=document.querySelector(`[data-model-viewport][data-study-chapter="${id}"]`).getBoundingClientRect(),candidates=[];const hit=(x,y)=>{const h=window.__thesis.hitTest(x,y);return h?.source&&h.chapterId===id;};for(let y=.12;y<.9;y+=.07)for(let x=.12;x<.9;x+=.07)candidates.push({x:r.left+r.width*x,y:r.top+r.height*y,distance:Math.hypot(x-.5,y-.5)});candidates.sort((a,b)=>a.distance-b.distance);let best=null;for(const {x,y} of candidates){if(y<100||y>innerHeight-90||!hit(x,y))continue;const interior=[[-6,0],[6,0],[0,-6],[0,6]].filter(([dx,dy])=>hit(x+dx,y+dy)).length;if(interior===4)return{x,y};if(!best||interior>best.interior)best={x,y,interior};}if(best)return{x:best.x,y:best.y};throw Error('No actual source hit in '+id);},chapter);
}
export async function pause(page){const b=page.getByRole('button',{name:'Pause motion',exact:true});if(await b.count())await b.click();await settle(page);}
export async function expectIdle(page){await settle(page);await page.waitForFunction(()=>!window.__story.inspect().scheduled,null,{timeout:WAIT});const before=await page.evaluate(()=>({frames:window.__thesis.inspect().frames,time:window.__story.inspect().playback.activeSeconds}));await frames(page,8);expect(await page.evaluate(()=>({frames:window.__thesis.inspect().frames,time:window.__story.inspect().playback.activeSeconds}))).toEqual(before);}
