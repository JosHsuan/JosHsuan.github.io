import {test,expect} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
import {WAIT} from './case-helpers.mjs';

// Nonpublishing diagnostic, copied only to the unchanged bb602416 baseline.
// Ordinary initial composition and project index, not a paired motion benchmark.
test('published Home composition baseline at the qualified profile viewport',async({page},info)=>{
 const rows=[];let primary=null;
 const snapshot=()=>page.evaluate(()=>({url:location.href,y:scrollY,viewport:{width:innerWidth,height:innerHeight,dpr:devicePixelRatio},site:window.__site?.inspect(),preview:window.__projectModelPreview?.inspect(),heading:document.querySelector('h1')?.textContent,cards:document.querySelectorAll('[data-project-card]').length,heroCount:document.querySelectorAll('[data-home-research-stage]').length}));
 try{
  await page.goto('/');await expect.poll(()=>page.evaluate(()=>window.__site?.inspect().phase),{timeout:WAIT}).toBe('entered');
  await expect(page.locator('[data-project-card]')).toHaveCount(8);
  rows.push({phase:'initial',...await snapshot()});
  const initial=info.outputPath('baseline-home-initial.png');await page.screenshot({path:initial,scale:'device'});await info.attach('baseline-home-initial',{path:initial,contentType:'image/png'});
  const target=await page.locator('#projects').evaluate(node=>{let y=0;for(let n=node;n;n=n.offsetParent)y+=n.offsetTop;return Math.min(Math.max(0,Math.round(y-110)),document.documentElement.scrollHeight-innerHeight);});
  await page.mouse.wheel(0,target-await page.evaluate(()=>scrollY));await expect.poll(()=>page.evaluate(()=>scrollY),{timeout:WAIT}).toBe(target);
  rows.push({phase:'project-index',...await snapshot()});
  const projects=info.outputPath('baseline-home-projects.png');await page.screenshot({path:projects,scale:'device'});await info.attach('baseline-home-projects',{path:projects,contentType:'image/png'});
 }catch(error){primary=error;throw error;}finally{
  try{const path=info.outputPath('baseline-home.json');await writeFile(path,JSON.stringify({baseline:'bb602416962b558bb746ba71b89b393934f53279',rows},null,2));await info.attach('baseline-home',{path,contentType:'application/json'});}catch(error){if(!primary)throw error;}
 }
});
