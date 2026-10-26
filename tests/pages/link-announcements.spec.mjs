import {test,expect} from '@playwright/test';
import {readFile,writeFile} from 'node:fs/promises';
import {WAIT,scenarioTimeout} from './case-helpers.mjs';
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
 return page.locator('a[href]').evaluateAll(nodes=>nodes.map(node=>{
  const walker=document.createTreeWalker(node,NodeFilter.SHOW_TEXT),parts=[];
  while(walker.nextNode())if(!walker.currentNode.parentElement.closest('[aria-hidden="true"]'))parts.push(walker.currentNode.textContent);
  return{href:node.getAttribute('href'),target:node.target,rel:node.rel,label:node.getAttribute('aria-label'),visibleText:parts.join(' ').replace(/[↗↘]/g,'').replace(/\s+/g,' ').trim(),visible:node.checkVisibility({visibilityProperty:true,opacityProperty:true}),media:!!node.querySelector('img'),inspect:node.hasAttribute('data-inspect-figure')};
 }));
}
async function audit(page,noJS,receipt){
 test.setTimeout(scenarioTimeout(180000));
 for(const path of routes){
  await open(page,path,noJS);const rows=await declarations(page);receipt.push({path,noJS,rows});expect(rows.length).toBeGreaterThan(0);
  const navigation=page.locator('[data-portfolio-navigation],nav[aria-label="Portfolio"]');await expect(navigation.locator('a[href="/about/"]')).toHaveText('About');await expect(navigation.locator('a[href="/projects/"]')).toHaveText('Project');await expect(navigation.locator('a[href="/contact/"]')).toHaveText('Contact');
  if(/^\/projects\/.+\/$/.test(path)){
   await expect(page.locator('main').locator('a[href^="#"],a[href^="/assets/"],button,input,select,details,summary,[role="radio"],[data-inspect-figure],[data-evidence-source-link]')).toHaveCount(0);
   await expect(page.locator('[data-project-chapter-navigation],[data-xr-chapter-navigation]').locator('a,button,[tabindex]')).toHaveCount(0);
  }
  for(const [index,row]of rows.entries()){
   const link=page.locator('a[href]').nth(index);expect(row.inspect).toBe(false);
   if(row.target==='_blank'){
    expect(row.rel.split(/\s+/)).toContain('noreferrer');expect(row.label).toBeTruthy();expect(row.label).toMatch(/new tab/i);
    if(row.visibleText)expect(row.label).toContain(row.visibleText);
    if(row.visible)await expect(link).toHaveAccessibleName(row.label);
   }else expect(row.href).toMatch(/^(?:\/(?!assets\/)|mailto:|tel:)/);
  }
  if(path==='/'||path==='/contact/')for(const profile of contact.socialLinks){const row=rows.find(row=>row.href===profile.href);expect(row,profile.label+' native public-profile destination').toBeTruthy();expect(row.label).toBe(`${profile.label} (new tab)`);}
  // Keep the existing forced-palette naming guard on the links that remain.
  await page.emulateMedia({forcedColors:'active'});expect(await page.evaluate(()=>matchMedia('(forced-colors: active)').matches)).toBe(true);
  const forced=await declarations(page);expect(forced.map(({label,href,target,rel})=>({label,href,target,rel}))).toEqual(rows.map(({label,href,target,rel})=>({label,href,target,rel})));
  const representative=forced.findIndex(row=>row.visible&&row.target==='_blank');if(representative>=0)await expect(page.locator('a[href]').nth(representative)).toHaveAccessibleName(forced[representative].label);
  await page.emulateMedia({forcedColors:'none'});
 }
}
test('all twelve routes retain honest native page/profile links without image-opening or mode actions',async({page},info)=>{
 const receipt=[];let primary;try{await audit(page,false,receipt);}catch(error){primary=error;throw error;}finally{try{await persist(info,'native-reading-links',receipt);}catch(error){if(!primary)throw error;}}
});
test.describe('native page links without application JavaScript',()=>{
 test.use({javaScriptEnabled:false});
 test('all twelve routes keep the same native navigation and public-profile declarations without JavaScript',async({page},info)=>{
  const receipt=[];let primary;try{await audit(page,true,receipt);}catch(error){primary=error;throw error;}finally{try{await persist(info,'native-reading-links-no-js',receipt);}catch(error){if(!primary)throw error;}}
 });
});
test('real Tab and Enter navigate between documents and browser Back restores the project',async({page},info)=>{
 const receipt={tabs:[]};let primary;
 try{
  await open(page,'/projects/entrance-installation-art/');const target=page.locator('[data-portfolio-navigation] a[href="/about/"]'),bound=await page.locator('a[href],button,input,select,textarea,[tabindex],summary').count();let reached=false;
  for(let index=0;index<bound+2;index++){await page.keyboard.press('Tab');const row=await page.evaluate(()=>({tag:document.activeElement?.tagName,href:document.activeElement?.getAttribute('href'),y:scrollY}));receipt.tabs.push(row);if(await target.evaluate(n=>document.activeElement===n)){reached=true;break;}}
  expect(reached,'Native Tab must reach retained page navigation').toBe(true);await expect(target).toBeFocused();await expect(target).toHaveCSS('pointer-events','auto');
  await Promise.all([page.waitForURL('**/about/'),page.keyboard.press('Enter')]);await page.waitForFunction(()=>window.__site?.inspect().phase==='entered',null,{timeout:WAIT});await expect(page.locator('h1')).toContainText('Between physical and digital');
  await page.goBack();await page.waitForFunction(()=>window.__site?.inspect().phase==='entered',null,{timeout:WAIT});await expect(page).toHaveURL(/\/projects\/entrance-installation-art\/$/);await expect(page.locator('main')).toBeVisible();expect(await page.locator('main').evaluate(n=>n.inert)).toBe(false);receipt.returned=page.url();
 }catch(error){primary=error;throw error;}finally{try{await persist(info,'native-keyboard-page-links',receipt);}catch(error){if(!primary)throw error;}}
});
