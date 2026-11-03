import {test,expect} from '@playwright/test';
import {readFile,writeFile} from 'node:fs/promises';
import {WAIT} from './case-helpers.mjs';

const release='../../roles/uiux-designer/cases/bending-active-thesis/release/';
const projects=JSON.parse(await readFile(new URL(release+'project-studies.json',import.meta.url),'utf8')).projects;
const contact=JSON.parse(await readFile(new URL(release+'contact.json',import.meta.url),'utf8'));
const routes=['/','/about/','/projects/','/contact/',...projects.map(project=>`/projects/${project.slug}/`),'/projects/xr-bending-active/','/projects/bending-active/'];
async function persist(info,name,receipt){const path=info.outputPath(name+'.json');await writeFile(path,JSON.stringify(receipt,null,2));await info.attach(name,{path,contentType:'application/json'});}
async function open(page,path,noJS=false){
 expect((await page.goto(path)).status()).toBe(200);await page.evaluate(()=>document.fonts.ready);
 if(!noJS)await expect.poll(()=>page.evaluate(()=>window.__site?.inspect().phase),{timeout:WAIT}).toMatch(/^(entered|failed)$/);
}
async function declarations(page){
 return page.locator('a[target="_blank"]').evaluateAll(nodes=>nodes.map(node=>{
  const walker=document.createTreeWalker(node,NodeFilter.SHOW_TEXT),parts=[];
  while(walker.nextNode()){const text=walker.currentNode;if(!text.parentElement.closest('[aria-hidden="true"]'))parts.push(text.textContent);}
  const ids=(node.getAttribute('aria-describedby')??'').split(/\s+/).filter(Boolean),descriptors=ids.map(id=>{const matches=[...document.querySelectorAll('[id]')].filter(element=>element.id===id),element=matches[0];return{id,count:matches.length,text:element?.textContent??null,hidden:element?.hidden??false,display:element?getComputedStyle(element).display:null,rects:element?.getClientRects().length??null};});
  return{href:node.getAttribute('href'),rel:node.rel,label:node.getAttribute('aria-label'),description:descriptors.map(item=>item.text).join(' ')||null,descriptors,
   visibleText:parts.join(' ').replace(/[↗↘]/g,'').replace(/\s+/g,' ').trim(),alt:node.querySelector('img')?.alt??null,
   inspect:node.hasAttribute('data-inspect-figure'),caption:node.hasAttribute('data-evidence-source-link'),
   visible:node.checkVisibility({visibilityProperty:true,opacityProperty:true})};
 }));
}
async function audit(page,noJS,receipt){
 await page.emulateMedia({reducedMotion:'reduce'});
 for(const path of routes){
  await open(page,path,noJS);const rows=await declarations(page);receipt.push({path,noJS,rows});
  for(const [index,row] of rows.entries()){
   const link=page.locator('a[target="_blank"]').nth(index);expect(row.rel.split(/\s+/)).toContain('noreferrer');expect(row.label).toBeTruthy();
   if(row.visibleText)expect(row.label).toContain(row.visibleText);
   if(row.alt&&!row.inspect)expect(row.label).toContain(row.alt);
   expect(row.inspect).toBe(false);expect(row.caption).toBe(false);expect(row.label+' '+(row.description??'')).toMatch(/new tab/i);
   if(row.visible){await expect(link).toHaveAccessibleName(row.label);if(row.description)await expect(link).toHaveAccessibleDescription(row.description);}
  }
  if(path==='/'||path==='/contact/')for(const profile of contact.socialLinks){
   const row=rows.find(row=>row.href===profile.href);expect(row,profile.label+' native public profile declaration').toBeTruthy();expect(row.label).toContain(profile.label);
  }
  // Naming must survive the actual browser forced palette. This is not a new
  // contrast or external-destination-availability claim.
  await page.emulateMedia({forcedColors:'active'});expect(await page.evaluate(()=>matchMedia('(forced-colors: active)').matches)).toBe(true);
  const forced=await declarations(page);expect(forced.map(({label,description,href})=>({label,description,href}))).toEqual(rows.map(({label,description,href})=>({label,description,href})));
  const representative=forced.findIndex(row=>row.visible);if(representative>=0){await expect(page.locator('a[target="_blank"]').nth(representative)).toHaveAccessibleName(forced[representative].label);if(forced[representative].description)await expect(page.locator('a[target="_blank"]').nth(representative)).toHaveAccessibleDescription(forced[representative].description);}
  await page.emulateMedia({forcedColors:'none'});
 }
}
test('remaining recording and profile links announce new tabs in native and forced palettes',async({page},info)=>{
 test.setTimeout(240000);const receipt=[];try{await audit(page,false,receipt);}finally{await persist(info,'native-link-names',receipt);}
});
test('new-tab destination announcements and image-viewer removal survive without JavaScript',async({browser,baseURL},info)=>{
 test.setTimeout(240000);const context=await browser.newContext({javaScriptEnabled:false,baseURL}),receipt=[];
 try{await audit(await context.newPage(),true,receipt);}finally{await context.close();await persist(info,'nojs-link-names',receipt);}
});
test('Bending native keyboard chapter navigation preserves live motion and inline figures',async({page})=>{
 await open(page,'/projects/bending-active/');await expect.poll(()=>page.evaluate(()=>window.__thesis?.inspect().ready),{timeout:WAIT}).toBe(true);
 const link=page.locator('[data-story-navigation] a[href="#make"]');await link.focus();await page.keyboard.press('Enter');
 await expect.poll(()=>page.evaluate(()=>location.hash)).toBe('#make');await expect(page.locator('#make')).toBeFocused();
 await expect(page.locator('#make figure img')).toBeVisible();await expect(page.locator('[data-inspect-figure],[data-source-comparison],[data-bending-motion-toggle]')).toHaveCount(0);
 const time=await page.evaluate(()=>window.__story.inspect().playback.activeSeconds);
 await expect.poll(()=>page.evaluate(()=>window.__story.inspect().playback.activeSeconds)).toBeGreaterThan(time);
});
