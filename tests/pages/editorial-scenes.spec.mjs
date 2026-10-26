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
 const chrome=['[data-page-masthead]','[data-project-chapter-navigation]'].map(selector=>{const nodes=[...document.querySelectorAll(selector)];return {selector,count:nodes.length,boxes:nodes.filter(visible).map(rect)};});
 const image=node.querySelector('img'),caption=node.querySelector('figcaption');
 const fields=[...document.querySelectorAll('[data-global-background-field]')],mains=[...document.querySelectorAll('[data-study-presentation="editorial-scenes"]')];
 const layer=n=>{if(!n)return null;const style=getComputedStyle(n);return {tag:n.tagName,position:style.position,zIndex:style.zIndex,parentTag:n.parentElement?.tagName,directBodyChild:n.parentElement===document.body};};
 const stacking={scope:'Computed sibling stacking contract, not a pixel occlusion certificate.',fieldCount:fields.length,mainCount:mains.length,field:layer(fields[0]),main:layer(mains[0]),sameParent:!!fields[0]&&fields[0].parentElement===mains[0]?.parentElement};
 return {y:scrollY,viewport:{width:innerWidth,height:innerHeight},documentWidth:document.documentElement.scrollWidth,chapter:node.closest('[data-project-chapter]')?.dataset.projectChapter,rect:rect(node),chrome,stacking,
 image:image?{src:image.currentSrc,complete:image.complete,naturalWidth:image.naturalWidth,naturalHeight:image.naturalHeight,rect:rect(image),fit:getComputedStyle(image).objectFit,transform:getComputedStyle(image).transform}:null,
 caption:caption?{rect:rect(caption),text:caption.querySelector('p')?.textContent,credit:caption.querySelector(':scope > span:not([data-information-skin])')?.textContent,paragraph:rect(caption.querySelector('p')),creditRect:rect(caption.querySelector(':scope > span:not([data-information-skin])')),links:caption.querySelectorAll('a').length}:null,
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
  await expect(page.locator('main button,main input,main select,main details,main a[href^="/assets/"],[data-study-motion-toggle]')).toHaveCount(0);
  const root=page.locator('[data-study-presentation="editorial-scenes"]');await expect(root).toHaveCount(1);await expect(page.locator('h1')).toHaveText(project.title);
  await expect(root.locator('[data-editorial-image]')).toHaveCount(10);await expect(root.locator('[data-evidence-source-link]')).toHaveCount(0);await expect(root.locator('[data-editorial-source-reference]')).toHaveCount(1);await expect(root.locator('[data-editorial-source-reference]')).toHaveAttribute('data-editorial-source-reference','/assets/projects/project-caschlatsch/portfolio-xr-workshop.webp');await expect(root.locator('[data-project-media],canvas')).toHaveCount(0);
  const overview=await root.locator('[data-project-chapter="overview"]').evaluate(geometry);receipt.rows.push({name:'overview',...overview});await page.screenshot({path:info.outputPath('overview.png'),scale:'device'});expect(overview.documentWidth).toBeLessThanOrEqual(overview.viewport.width);
  const stack=overview.stacking;expect(stack.fieldCount).toBe(1);expect(stack.mainCount).toBe(1);expect(stack.field.position).toBe('fixed');expect(stack.field.zIndex).toBe('1');expect(stack.main.position).toBe('relative');expect(stack.sameParent).toBe(true);expect(stack.field.directBodyChild).toBe(true);expect(stack.main.directBodyChild).toBe(true);expect(stack.main.zIndex).not.toBe('auto');expect(Number.isFinite(Number(stack.main.zIndex))).toBe(true);expect(Number(stack.main.zIndex)).toBeGreaterThan(Number(stack.field.zIndex));
  for(const [chapter,name] of stops){
   const src=`/assets/projects/${project.id}/${name}.webp`,source=project.sections.find(s=>s.id===chapter).media.find(m=>m.src===src),asset=manifest.find(a=>a.path===src.slice(1));expect(source).toBeTruthy();expect(asset).toBeTruthy();
   const bytes=await readFile(new URL(`public${src}`,release));expect(bytes.length).toBe(asset.bytes);expect(createHash('sha256').update(bytes).digest('hex')).toBe(asset.sha256);
   const figure=root.locator(`[data-editorial-source="${src}"]`);await expect(figure).toHaveCount(1);const image=figure.locator('[data-editorial-image]');await wheelTo(page,figure);
   await expect.poll(()=>image.evaluate(n=>n.complete&&n.naturalWidth>0),{timeout:WAIT}).toBe(true);
   const row={name, ...await figure.evaluate(geometry)};receipt.rows.push(row);await page.screenshot({path:info.outputPath(`${name}.png`),scale:'device'});
   expect(row.chapter).toBe(chapter);expect(row.ownership.presentation).toBe('editorial-scenes');expect(row.ownership.backdrop).toBeNull();expect(row.ownership.scene).toBeNull();expect(row.documentWidth).toBeLessThanOrEqual(row.viewport.width);
   expect(new URL(row.image.src).pathname).toBe(src);expect(row.image.naturalWidth).toBe(source.width);expect(row.image.naturalHeight).toBe(source.height);expect(row.image.fit).toBe('contain');expect(row.image.transform).toBe('none');expect(Math.abs(row.image.rect.width/source.width-row.image.rect.height/source.height)).toBeLessThan(1/source.height);
   expect(row.image.rect.left).toBeGreaterThanOrEqual(0);expect(row.image.rect.right).toBeLessThanOrEqual(row.viewport.width);expect(row.image.rect.top).toBeLessThan(row.viewport.height);expect(row.image.rect.bottom).toBeGreaterThan(0);
   expect(row.caption.text).toBe(source.caption);expect(row.caption.credit).toBe(source.credit);expect(row.caption.paragraph.height).toBeGreaterThan(0);expect(row.caption.creditRect.height).toBeGreaterThan(0);expect(row.caption.links).toBe(0);expect(row.caption.rect.top).toBeGreaterThanOrEqual(row.image.rect.bottom);
   await expect(image).toHaveAttribute('alt',source.alt);await expect(image.locator('xpath=ancestor::a[1]')).toHaveCount(0);
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

async function editorialEntered(page){
 await page.waitForFunction(()=>window.__site?.inspect().phase==='entered',null,{timeout:WAIT});
 await expect(page.locator('[data-site-loader]')).toBeHidden();
}
function nativeOwnerFacts(){
 const background=window.__globalBackground.inspect();
 return {background,documentId:performance.timeOrigin,y:scrollY,sourceCount:document.querySelectorAll('[data-editorial-image]').length,inert:document.querySelector('main').inert};
}
test('Cas native document history releases or suspends the editorial owner and restores one readable lifetime',async({page},info)=>{
 const receipt={scope:'Real document navigation; BFCache retention is asserted only when actually observed.',rows:[]};let primary;
 try{
  await page.addInitScript(()=>addEventListener('pageshow',event=>{window.__editorialPageShow={trusted:event.isTrusted,persisted:event.persisted};}));
  await page.goto(`/projects/${project.slug}/`);await editorialEntered(page);
  await wheelTo(page,page.locator('[data-project-chapter="system"]'));
  expect(new URL(page.url()).hash).toBe('');
  const before=await page.evaluate(nativeOwnerFacts);receipt.rows.push({phase:'before',...before});
  expect(before.sourceCount).toBe(10);expect(before.background.activeBindings).toBe(1);expect(before.background.driver.projectStudy.backdrop).toBeNull();
  await page.evaluate(()=>addEventListener('pagehide',event=>sessionStorage.setItem('editorial-departure',JSON.stringify({trusted:event.isTrusted,persisted:event.persisted,documentId:performance.timeOrigin,background:window.__globalBackground.inspect()})),{once:true}));
  await page.locator('[data-portfolio-navigation] a[href="/contact/"]').click();await editorialEntered(page);
  const departure=await page.evaluate(()=>JSON.parse(sessionStorage.getItem('editorial-departure')));receipt.rows.push({phase:'departure',...departure});
  expect(departure.trusted).toBe(true);
  if(departure.persisted){expect(departure.background.driver.lifecycle.suspended).toBe(true);expect(departure.background.activeBindings).toBe(1);}
  else{expect(departure.background.driver.disposed).toBe(true);expect(departure.background.driver.events.nativeListeners).toBe(0);expect(departure.background.activeBindings).toBe(0);}
  await page.goBack();await editorialEntered(page);
  const restored=await page.evaluate(nativeOwnerFacts),show=await page.evaluate(()=>window.__editorialPageShow);receipt.rows.push({phase:'back',show,...restored});
  expect(show.trusted).toBe(true);if(show.persisted){expect(departure.persisted).toBe(true);expect(restored.documentId).toBe(departure.documentId);}
  expect(restored.background.activeBindings).toBe(1);expect(restored.background.driver.lifecycle.suspended).toBe(false);expect(restored.background.driver.projectStudy.presentation).toBe('editorial-scenes');expect(restored.background.driver.projectStudy.scene).toBeNull();expect(restored.sourceCount).toBe(10);expect(restored.inert).toBe(false);
  await page.goForward();await editorialEntered(page);await expect(page).toHaveURL(/\/contact\/$/);
  receipt.rows.push({phase:'forward',url:page.url()});
 }catch(error){primary=error;throw error;}finally{try{await writeFile(info.outputPath('editorial-native-history.json'),JSON.stringify(receipt,null,2));}catch(error){if(!primary)throw error;}}
});

test('Cas failed native photograph retains its original inline caption and credit and readable chapter without a fixed fallback owner',async({page},info)=>{
 const source=project.sections.find(section=>section.id==='context').media[0],receipt={source:source.src,requests:[]};let primary;
 page.on('request',request=>{if(/\.(?:glb|hdr)(?:\?|$)/.test(request.url()))receipt.requests.push(request.url());});
 try{
  await page.route('**'+source.src,request=>request.abort());
  await page.goto(`/projects/${project.slug}/`);await page.waitForFunction(()=>['entered','failed'].includes(window.__site?.inspect().phase),null,{timeout:WAIT});
  await expect(page.locator('[data-site-loader]')).toBeHidden();
  const figure=page.locator(`[data-editorial-source="${source.src}"]`);await expect(figure).toHaveAttribute('data-editorial-image-state','failed');expect(await figure.locator('img').evaluate(n=>n.complete&&n.naturalWidth===0)).toBe(true);
  await wheelTo(page,figure.locator('[role="status"]'));await expect(figure.locator('[role="status"]')).toBeVisible();
  await expect(figure.locator('figcaption > p')).toHaveText(source.caption);await expect(figure.locator('figcaption > span:not([data-information-skin])')).toHaveText(source.credit);
  const paragraph=figure.locator('figcaption > p');await wheelTo(page,paragraph);await expect(figure.locator('a,button,input,select,details,summary')).toHaveCount(0);
  receipt.reading=await figure.evaluate(geometry);await page.screenshot({path:info.outputPath('editorial-native-image-failure.png'),scale:'device'});
  const readingRect=receipt.reading.caption.paragraph;expect(receipt.reading.caption.links).toBe(0);expect(readingRect.left).toBeGreaterThanOrEqual(0);expect(readingRect.right).toBeLessThanOrEqual(receipt.reading.viewport.width);expect(readingRect.top).toBeGreaterThanOrEqual(0);expect(readingRect.bottom).toBeLessThanOrEqual(receipt.reading.viewport.height);
  for(const owner of receipt.reading.chrome){expect(owner.count).toBe(1);for(const box of owner.boxes)expect(overlap(readingRect,box)).toBe(0);}
  expect(await paragraph.evaluate(node=>{const r=node.getBoundingClientRect(),hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return hit===node||node.contains(hit);})).toBe(true);
  expect(receipt.reading.caption.paragraph.height).toBeGreaterThan(0);expect(receipt.reading.ownership.backdrop).toBeNull();expect(receipt.reading.ownership.scene).toBeNull();expect(receipt.reading.ownership.nativeImages.find(row=>row.source===source.src).state).toBe('failed');
  const state=await page.evaluate(()=>window.__site.inspect());receipt.entry=state;
  expect(state.history.filter(row=>row.id===state.id&&['entered','failed','cancelled'].includes(row.phase))).toHaveLength(1);
  await wheelTo(page,page.locator('[data-project-chapter="credits"]'));await expect(page.locator('[data-project-chapter="credits"]')).toBeInViewport();expect(await page.locator('main').evaluate(node=>node.inert)).toBe(false);expect(receipt.requests).toEqual([]);
 }catch(error){primary=error;throw error;}finally{try{await writeFile(info.outputPath('editorial-native-image-failure.json'),JSON.stringify(receipt,null,2));}catch(error){if(!primary)throw error;}}
});
