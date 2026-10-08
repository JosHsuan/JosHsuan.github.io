import {expect} from '@playwright/test';
export const WAIT = 45000;
export const surface = (page, chapter='form') => page.locator(`[data-model-viewport][data-study-chapter="${chapter}"]`);
export async function frames(page,count=3){await page.evaluate(async n=>{for(let i=0;i<n;i++)await new Promise(requestAnimationFrame);},count);}
export async function settle(page){await frames(page);await page.waitForFunction(()=>window.__story?.inspect().settled&&window.__story.inspect().inspection.settled,null,{timeout:WAIT});await frames(page);}
export async function loadScene(page){await page.goto('/');await page.getByRole('combobox',{name:'Visual detail',exact:true}).selectOption('light');await page.waitForFunction(()=>window.__thesis?.inspect().ready&&window.__story,null,{timeout:WAIT});await page.evaluate(()=>document.fonts.ready);await settle(page);}
export async function centerStudy(page,chapter='form',{ready=true}={}){
 const el=surface(page,chapter);await el.scrollIntoViewIfNeeded();
 await el.evaluate(el=>{el.focus({preventScroll:true});let y=0;for(let n=el;n;n=n.offsetParent)y+=n.offsetTop;scrollTo({top:y-Math.max(112,(innerHeight-el.offsetHeight)*.34),behavior:'instant'});});
 await settle(page);
 if(ready)await page.waitForFunction(id=>window.__thesis?.inspect().representation?.chapterId===id&&window.__thesis.inspect().studyWeight>.99,chapter,{timeout:WAIT});
}
export async function hitPoint(page,chapter='form'){
 return page.evaluate(id=>{const r=document.querySelector(`[data-model-viewport][data-study-chapter="${id}"]`).getBoundingClientRect();for(let y=.12;y<.9;y+=.07)for(let x=.12;x<.9;x+=.07){const p={x:r.left+r.width*x,y:r.top+r.height*y};if(p.y<100||p.y>innerHeight-90)continue;const h=window.__thesis.hitTest(p.x,p.y);if(h?.source&&h.chapterId===id)return p;}throw Error('No actual source hit in '+id);},chapter);
}
export async function pause(page){const b=page.getByRole('button',{name:'Pause motion',exact:true});if(await b.count())await b.click();await settle(page);}
export async function expectIdle(page){await settle(page);await page.waitForFunction(()=>!window.__story.inspect().scheduled,null,{timeout:WAIT});const before=await page.evaluate(()=>({frames:window.__thesis.inspect().frames,time:window.__story.inspect().playback.activeSeconds}));await frames(page,8);expect(await page.evaluate(()=>({frames:window.__thesis.inspect().frames,time:window.__story.inspect().playback.activeSeconds}))).toEqual(before);}
