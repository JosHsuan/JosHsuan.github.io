import {test,expect} from '@playwright/test';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {WAIT} from './case-helpers.mjs';
const release=new URL('../../roles/uiux-designer/cases/bending-active-thesis/release/',import.meta.url);
const project=JSON.parse(await readFile(new URL('project-studies.json',release),'utf8')).projects.find(p=>p.id==='project-caschlatsch');
const manifest=JSON.parse(await readFile(new URL('project-assets.json',release),'utf8')).assets;
const stops=[['context','portfolio-tower-on-site'],['system','portfolio-timber-model'],['system','portfolio-voxel-framework'],['xr-guidance','portfolio-xr-workshop'],['making','portfolio-robotic-assembly'],['results','portfolio-timber-interior']];
const overlap=(a,b)=>Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left))*Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));
async function wheelTo(page,locator,offset=140){
 const target=await locator.evaluate((node,offset)=>Math.max(0,Math.min(document.documentElement.scrollHeight-innerHeight,node.getBoundingClientRect().top+scrollY-offset)),offset);
 const y=await page.evaluate(()=>scrollY);await page.mouse.move(8,page.viewportSize().height*.5);await page.mouse.wheel(0,target-y);
 await expect.poll(()=>page.evaluate(()=>scrollY),{timeout:WAIT}).toBeGreaterThanOrEqual(target-1);
 await expect.poll(()=>page.evaluate(target=>Math.abs(scrollY-target),target),{timeout:WAIT}).toBeLessThanOrEqual(1);
 await expect.poll(()=>page.locator('[data-information-moving="true"]').count(),{timeout:WAIT}).toBe(0);
}
function geometry(node){
 const rect=n=>{const r=n.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height};};
 const visible=n=>{const s=getComputedStyle(n),r=n.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity)>0&&r.width>0&&r.height>0;};
 const chrome=['[data-page-masthead]','[data-project-chapter-navigation]','[data-study-motion-toggle]'].map(selector=>{const nodes=[...document.querySelectorAll(selector)];return {selector,count:nodes.length,boxes:nodes.filter(visible).map(rect)};});
 const image=node.querySelector('img'),caption=node.querySelector('figcaption');
 return {y:scrollY,viewport:{width:innerWidth,height:innerHeight},documentWidth:document.documentElement.scrollWidth,chapter:node.closest('[data-project-chapter]')?.dataset.projectChapter,rect:rect(node),chrome,
 image:image?{src:image.currentSrc,complete:image.complete,naturalWidth:image.naturalWidth,naturalHeight:image.naturalHeight,rect:rect(image),fit:getComputedStyle(image).objectFit,transform:getComputedStyle(image).transform}:null,
 caption:caption?{rect:rect(caption),text:caption.querySelector('p')?.textContent,credit:caption.querySelector(':scope > span:not([data-information-skin])')?.textContent,action:rect(caption.querySelector('a')),href:caption.querySelector('a')?.getAttribute('href')}:null,
 planes:[...document.querySelectorAll('[data-information-window]')].filter(visible).map(n=>({chapter:n.closest('[data-project-chapter]')?.dataset.projectChapter,kind:n.dataset.informationWindow,rect:rect(n)})),
 ownership:window.__globalBackground?.inspect().driver.projectStudy};
}
test('Cas editorial scenes retain native chapter-owned original sources and readable composition',async({page},info)=>{
 const receipt={scope:'Native wheel visual prototype; not a camera, performance or full accessibility qualification. Tall plates may require native reading; retained prior 05b figures are source references, not pixel-matched captures.',rows:[],sources:[],requests:[]};let primary;
 page.on('request',request=>{if(/\.(?:glb|hdr)(?:\?|$)/.test(request.url()))receipt.requests.push(request.url());});
 try{
  // All ten unique original bytes locally; only the six declared sources below receive viewport captures.
  const originals=[...new Map(project.sections.flatMap(s=>s.media).map(image=>[image.src,image])).values()];expect(originals).toHaveLength(10);
  for(const original of originals){const asset=manifest.find(a=>a.path===original.src.slice(1));expect(asset).toBeTruthy();const bytes=await readFile(new URL(`public${original.src}`,release));expect(bytes.length).toBe(asset.bytes);expect(createHash('sha256').update(bytes).digest('hex')).toBe(asset.sha256);receipt.sources.push({src:original.src,bytes:bytes.length,sha256:asset.sha256});}
  await page.goto(`/projects/${project.slug}/`);await page.waitForFunction(()=>window.__site?.inspect().phase==='entered',null,{timeout:WAIT});await page.evaluate(()=>document.fonts.ready);
  const root=page.locator('[data-study-presentation="editorial-scenes"]');await expect(root).toHaveCount(1);await expect(page.locator('h1')).toHaveText(project.title);
  await expect(root.locator('[data-editorial-image]')).toHaveCount(10);await expect(root.locator('[data-evidence-source-link]')).toHaveCount(6);await expect(root.locator('[data-editorial-source-reference]')).toHaveCount(1);await expect(root.locator('[data-editorial-source-reference]')).toHaveAttribute('data-editorial-source-reference','/assets/projects/project-caschlatsch/portfolio-xr-workshop.webp');await expect(root.locator('[data-project-media],canvas')).toHaveCount(0);
  const overview=await root.locator('[data-project-chapter="overview"]').evaluate(geometry);receipt.rows.push({name:'overview',...overview});await page.screenshot({path:info.outputPath('overview.png'),scale:'device'});expect(overview.documentWidth).toBeLessThanOrEqual(overview.viewport.width);
  for(const [chapter,name] of stops){
   const src=`/assets/projects/${project.id}/${name}.webp`,source=project.sections.find(s=>s.id===chapter).media.find(m=>m.src===src),asset=manifest.find(a=>a.path===src.slice(1));expect(source).toBeTruthy();expect(asset).toBeTruthy();
   const bytes=await readFile(new URL(`public${src}`,release));expect(bytes.length).toBe(asset.bytes);expect(createHash('sha256').update(bytes).digest('hex')).toBe(asset.sha256);
   const figure=root.locator(`[data-editorial-source="${src}"]`);await expect(figure).toHaveCount(1);const image=figure.locator('[data-editorial-image]');await wheelTo(page,figure);
   await expect.poll(()=>image.evaluate(n=>n.complete&&n.naturalWidth>0),{timeout:WAIT}).toBe(true);
   const row={name, ...await figure.evaluate(geometry)};receipt.rows.push(row);await page.screenshot({path:info.outputPath(`${name}.png`),scale:'device'});
   expect(row.chapter).toBe(chapter);expect(row.ownership.presentation).toBe('editorial-scenes');expect(row.ownership.backdrop).toBeNull();expect(row.ownership.scene).toBeNull();expect(row.documentWidth).toBeLessThanOrEqual(row.viewport.width);
   expect(new URL(row.image.src).pathname).toBe(src);expect(row.image.naturalWidth).toBe(source.width);expect(row.image.naturalHeight).toBe(source.height);expect(row.image.fit).toBe('contain');expect(row.image.transform).toBe('none');expect(Math.abs(row.image.rect.width/source.width-row.image.rect.height/source.height)).toBeLessThan(1/source.height);
   expect(row.image.rect.left).toBeGreaterThanOrEqual(0);expect(row.image.rect.right).toBeLessThanOrEqual(row.viewport.width);expect(row.image.rect.top).toBeLessThan(row.viewport.height);expect(row.image.rect.bottom).toBeGreaterThan(0);
   expect(row.caption.text).toBe(source.caption);expect(row.caption.credit).toBe(source.credit);expect(row.caption.href).toBe(src);expect(row.caption.action.height).toBeGreaterThanOrEqual(44);expect(row.caption.rect.top).toBeGreaterThanOrEqual(row.image.rect.bottom);
   await expect(image).toHaveAttribute('alt',source.alt);await expect(image.locator('xpath=ancestor::a[1]')).toHaveAttribute('href',src);await expect(image.locator('xpath=ancestor::a[1]')).toHaveAttribute('target','_blank');
   for(const plane of row.planes)expect(overlap(row.image.rect,plane.rect),`${name}: native source and ${plane.chapter}/${plane.kind}`).toBe(0);
   if(source.purpose==='diagram'){await expect(figure).toHaveAttribute('data-study-evidence-layout','full');await figure.screenshot({path:info.outputPath(`${name}-complete-figure.png`),scale:'device'});}
   // Separate genuine reading position; never claim the tall source and caption fit together.
   const caption=figure.locator('figcaption');await wheelTo(page,caption,150);const reading=await figure.evaluate(geometry);receipt.rows.push({name:`${name}-caption-reading`,...reading});await page.screenshot({path:info.outputPath(`${name}-caption.png`),scale:'device'});
   expect(reading.caption.rect.left).toBeGreaterThanOrEqual(0);expect(reading.caption.rect.right).toBeLessThanOrEqual(reading.viewport.width);
   for(const owner of reading.chrome)expect(owner.count).toBe(1);
   if(reading.caption.rect.height<=reading.viewport.height-300){expect(reading.caption.rect.top).toBeGreaterThanOrEqual(0);expect(reading.caption.rect.bottom).toBeLessThanOrEqual(reading.viewport.height);for(const owner of reading.chrome){for(const box of owner.boxes)expect(overlap(reading.caption.rect,box)).toBe(0);}}
  }
  expect(receipt.requests).toEqual([]);
 }catch(error){primary=error;throw error;}finally{try{const path=info.outputPath('editorial-scenes.json');await writeFile(path,JSON.stringify(receipt,null,2));await info.attach('editorial-scenes',{path,contentType:'application/json'});}catch(error){if(!primary)throw error;}}
});
