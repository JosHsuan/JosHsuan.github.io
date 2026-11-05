import {test,expect} from '@playwright/test';
import {readFile,writeFile} from 'node:fs/promises';
import {WAIT} from './case-helpers.mjs';

const studies=JSON.parse(await readFile(new URL('../../roles/uiux-designer/cases/bending-active-thesis/release/project-studies.json',import.meta.url),'utf8')).projects;
const routes=['/','/about/','/projects/','/contact/','/projects/bending-active/','/projects/xr-bending-active/',...studies.map(project=>`/projects/${project.slug}/`),'/404.html'];
const families={body:'Roboto Mono',display:'Roboto Mono'};
// Platform-font calls are independent read-only CDP requests. A fixed 64-call
// ceiling retains every source/Latin query while avoiding dozens of serial
// renderer scheduling rounds on the longest continuously animated document.
const FONT_QUERY_CONCURRENCY=64;
// WebKit serializes 19.2/38.4px as 19.200001/38.400002px. Normalize only
// font-size boundary comparisons, far below a layout pixel; keep raw receipts.
const fontPixels=value=>Math.round(value*10000)/10000;

// Retain every native platform-font query while bounding protocol concurrency.
// Independent observations need not wait for a new animated frame one by one.
async function queryFonts(session,nodeIds){
 const usages=new Array(nodeIds.length);let next=0;
 await Promise.all(Array.from({length:Math.min(FONT_QUERY_CONCURRENCY,nodeIds.length)},async()=>{
  while(next<nodeIds.length){const index=next++;usages[index]=await session.send('CSS.getPlatformFontsForNode',{nodeId:nodeIds[index]});}
 }));
 return usages;
}

// A separate native document per route keeps the existing 60-second scenario
// budget. OS motion preference is deliberately enabled to verify continuous presentation.
for(const route of routes)test(`the published ${route} document renders a coherent Roboto Mono hierarchy without clipping`,async({page,browserName})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 const fonts=[],errors=[];page.on('request',request=>{if(request.resourceType()==='font')fonts.push(request.url());});page.on('pageerror',error=>errors.push(error.message));
 const response=await page.goto(route);expect(response.status()).toBe(200);
 await page.waitForFunction(()=>window.__site?.inspect().phase==='entered',null,{timeout:WAIT});
 // New documentary openings show the complete source image before their glass
 // copy on mobile. Inspect actual reading glyphs after native movement to h1.
 // The reviewed route inventory already identifies these six documents. A
 // standalone count cost 13.3 seconds including trace observation beside the
 // live Bending renderer; verify the actual marker in the layout snapshot.
 const nativeStudy=studies.some(project=>route===`/projects/${project.slug}/`);
 if(nativeStudy)await page.locator('h1').scrollIntoViewIfNeeded();
 const reading=await page.evaluate(async expected=>{
  await document.fonts.ready;
  const preloads=[...document.querySelectorAll('link[rel="preload"][as="font"][data-site-font-family]')].map(node=>({family:node.dataset.siteFontFamily,href:node.getAttribute('href')}));
  const text=[...document.querySelectorAll('body *')].filter(node=>!['SCRIPT','STYLE','NOSCRIPT'].includes(node.tagName)&&[...node.childNodes].some(child=>child.nodeType===Node.TEXT_NODE&&child.textContent.trim()));
  const displaySelector='h1,h2,h3,h4,h5,h6,[data-display-type]';
  const wrong=text.filter(node=>{const css=getComputedStyle(node),role=node.closest(displaySelector)?'display':'body';return css.display!=='none'&&css.visibility!=='hidden'&&css.fontFamily.split(',')[0].replaceAll(/['"]/g,'').trim()!==expected[role];}).map(node=>({tag:node.tagName,role:node.closest(displaySelector)?'display':'body',text:node.textContent.slice(0,80),font:getComputedStyle(node).fontFamily}));
  const heading=document.querySelector('h1');
  const body=text.find(node=>node.tagName==='P'&&node.closest('main')&&!node.closest(displaySelector+', [aria-hidden="true"]')&&node.checkVisibility({visibilityProperty:true,opacityProperty:true})&&node.getBoundingClientRect().bottom>0&&node.getBoundingClientRect().top<innerHeight);
  const selector=node=>{const parts=[];for(let element=node;element&&element!==document.body;element=element.parentElement)parts.unshift(`${element.localName}:nth-child(${[...element.parentElement.children].indexOf(element)+1})`);return 'body > '+parts.join(' > ');};
  const clipped=[];
  for(const node of text){
   const css=getComputedStyle(node),box=node.getBoundingClientRect();
   if(node.closest('[aria-hidden="true"]')||css.visibility==='hidden'||Number(css.opacity)===0||box.width<3||box.height<3)continue;
   const scrollable=element=>{for(let parent=element;parent&&parent!==document.body;parent=parent.parentElement){const style=getComputedStyle(parent);if(['auto','scroll'].includes(style.overflowX)&&parent.scrollWidth>parent.clientWidth)return true;}return false;};
   if(scrollable(node))continue;
   for(const child of node.childNodes){if(child.nodeType!==Node.TEXT_NODE||!child.textContent.trim())continue;const range=document.createRange();range.selectNodeContents(child);for(const rect of range.getClientRects())if(rect.width>2&&(rect.left<-.5||rect.right>document.documentElement.clientWidth+.5))clipped.push({tag:node.tagName,text:child.textContent.trim().slice(0,80),left:rect.left,right:rect.right});}
  }
  const spacing=node=>{const css=getComputedStyle(node),size=parseFloat(css.fontSize);return{tag:node.tagName,homeIntro:node.matches('[data-home-introduction] #home-title'),deck:!!node.closest('[data-home-deck]'),featured:!!node.closest('[data-home-introduction]'),text:node.textContent.trim().slice(0,80),size,leading:parseFloat(css.lineHeight)/size,tracking:(css.letterSpacing==='normal'?0:parseFloat(css.letterSpacing))/size};};
  // About's three approach titles keep their compact subheading role when
  // standalone-page semantics promote their native elements from h3 to h2.
  const proseSelector='main[data-study-presentation="hybrid-scenes"] [data-project-native-source] [data-information-window="editorial"]>p,main[data-study-presentation="editorial-scenes"] [data-project-chapter="overview"]>p,main[data-study-presentation="editorial-scenes"] [data-information-window="editorial"]>p,main p[data-editorial-copy],main p[class*="_prose__"],main p[class*="_description__"],main p[class*="_statement__"],main p[class*="_sectionIntro__"],main p[class*="_openingText__"],main p[class*="_subtitle__"],main p[class*="_closingSummary__"],main [class*="_approaches__"] article>p:last-child,main [class*="_panel__"]>p';
  const auxiliary=/_((?:source)?caption|credit|sourceNote|recordingNote|eyebrow|smallNote|marginNote)__/i;
  const primary=[...document.querySelectorAll(proseSelector)].filter(node=>!auxiliary.test(node.className)&&!node.closest('[data-model-side-label]'));
  const measure=(node,ch)=>{const probe=document.createElement('span');probe.style.cssText='position:fixed;visibility:hidden;pointer-events:none';probe.style.font=getComputedStyle(node).font;probe.style.width=`${ch}ch`;document.body.append(probe);const width=probe.getBoundingClientRect().width;probe.remove();return width;};
  // Native CSS width governs line length; screen-space glyph clipping is checked separately.
  // Inactive source captions have no layout box and CSSOM legitimately returns
  // width:auto. Their native width is zero; an invalid visible width still fails.
  const nativeWidth=node=>node.getClientRects().length?parseFloat(getComputedStyle(node).width):0;
  const roles={sourceCaptions:[...document.querySelectorAll('[data-model-side-label] [data-source-description]')].map(spacing),measuredCaptions:[...document.querySelectorAll('main[data-study-presentation="hybrid-scenes"] [data-project-native-source] figcaption>p,main[data-study-presentation="editorial-scenes"] figcaption>p,main [class*="_evidence__"] figcaption>p,main [class*="_figure__"] figcaption p,main [class*="_sourcePanel__"]>p')].map(node=>({...spacing(node),width:nativeWidth(node),expectedMeasure:measure(node,68),measure:parseFloat(getComputedStyle(node).maxWidth)})),prose:primary.map(node=>({...spacing(node),width:nativeWidth(node),expectedMeasure:measure(node,60),measure:parseFloat(getComputedStyle(node).maxWidth)})),body:spacing(document.body),display:[...document.querySelectorAll(displaySelector)].map(node=>({...spacing(node),compact:node.matches('[data-portfolio-about] article h2')})),controls:[...document.querySelectorAll('header nav a,button,input,select,textarea,summary')].map(spacing),captions:[...document.querySelectorAll('figcaption,[data-diagram-caption]')].map(spacing),labels:[...document.querySelectorAll('[data-project-section-label]')].map(spacing)};
  const fontProbes=text.filter(node=>node.checkVisibility({visibilityProperty:true,opacityProperty:true})&&node.getBoundingClientRect().width>0&&node.getBoundingClientRect().height>0).map(node=>({selector:selector(node),role:node.closest(displaySelector)?'display':'body',mainHeading:!!node.closest('h1'),subtreeText:[node,...node.querySelectorAll('*')].map(element=>[element===node?element.textContent:'',getComputedStyle(element,'::before').content,getComputedStyle(element,'::after').content].join('')).join(''),text:[...node.childNodes].filter(child=>child.nodeType===Node.TEXT_NODE).map(child=>child.textContent).join('').trim()}));
  // Observe the real CJK cascade in the same layout transaction, restoring
  // the original language before returning or starting platform-font queries.
  const cjkNode=document.querySelector('main p[data-editorial-copy],main p[class*="_prose__"],main [class*="_panel__"]>p:not([class*="_eyebrow__"]),main p[class*="_description__"]');let cjk=null;
  if(cjkNode){const lang=cjkNode.getAttribute('lang');cjkNode.lang='zh-Hant';const css=getComputedStyle(cjkNode);cjk={leading:parseFloat(css.lineHeight)/parseFloat(css.fontSize),family:css.fontFamily};if(lang===null)cjkNode.removeAttribute('lang');else cjkNode.setAttribute('lang',lang);}
  return{projectStudyCount:document.querySelectorAll('[data-project-study]').length,preloads,cjk,rootSize:parseFloat(getComputedStyle(document.documentElement).fontSize),faces:[...document.fonts].filter(face=>face.status==='loaded').map(face=>face.family.replaceAll(/['"]/g,'')),loaded:{body:document.fonts.check(`16px "${expected.body}"`,'Computational design fabrication-ready × 01'),display:document.fonts.check(`400 16px "${expected.display}"`,'Design technology and spatial interaction')},wrong,clipped,roles,fontProbes,textNodes:text.length,headingVisible:heading.checkVisibility({visibilityProperty:true,opacityProperty:true}),headingFamily:getComputedStyle(heading).fontFamily,bodyFamily:body?getComputedStyle(body).fontFamily:null,bodyProbeSelector:body?selector(body):null,clientWidth:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth};
 },families);
 expect(reading.projectStudyCount).toBe(nativeStudy?1:0);
 expect(reading.preloads.filter(row=>row.family===families.body)).toEqual([{family:families.body,href:'/assets/fonts/roboto-mono-variable.woff2'}]);
 if(reading.cjk){expect(reading.cjk.leading).toBeCloseTo(1.65,2);expect(reading.cjk.family).toContain('Noto Sans CJK TC');}
 for(const family of Object.values(families))expect(reading.faces).toContain(family);
 expect(reading.loaded).toEqual({body:true,display:true});expect(reading.wrong).toEqual([]);expect(reading.clipped).toEqual([]);expect(reading.textNodes).toBeGreaterThan(10);expect(reading.headingVisible).toBe(true);expect(reading.headingFamily).toContain(families.display);expect(reading.bodyFamily).toContain(families.body);expect(reading.bodyProbeSelector).toBeTruthy();expect(reading.scrollWidth).toBeLessThanOrEqual(reading.clientWidth);
 const spacing=(value,leading,tracking)=>{const context=`${route}: ${value.tag} ${value.text}`;expect(value.leading,context+' leading').toBeCloseTo(leading,2);expect(value.tracking,context+' tracking').toBeCloseTo(tracking,3);};
 spacing(reading.roles.body,1.5,0);
 // The compact hierarchy changes display scale, not the native root size or
 // reading/control floors. Measure resolved CSS on every published route;
 // checking token strings alone would miss a later responsive override.
 const scale=page.viewportSize().width>=1000?.8:1;expect(reading.rootSize).toBeCloseTo(16*scale,2);
 expect(reading.roles.body.size,`${route}: responsive body scale`).toBeCloseTo(16*scale,2);
 for(const prose of reading.roles.prose){
  if(prose.featured&&route==='/'){expect(fontPixels(prose.size)).toBeGreaterThanOrEqual(fontPixels(14*scale));expect(fontPixels(prose.size)).toBeLessThanOrEqual(fontPixels(24*scale));}
  else{expect(prose.size,`${route}: semantic primary prose size`).toBeCloseTo(16*scale,2);expect(prose.measure,`${route}: 60ch reading measure`).toBeCloseTo(prose.expectedMeasure,0);}
  expect(prose.leading,`${route}: prose leading`).toBeCloseTo(1.5,2);expect(prose.tracking,`${route}: prose tracking`).toBeCloseTo(0,3);
  expect(prose.width,`${route}: prose within readable measure`).toBeLessThanOrEqual(Math.min(prose.measure,prose.expectedMeasure)+.5);
 }
 // Source annotations remain caption-role text when their single card moves
 // into native mobile flow; ancestry must not silently promote them to prose.
 // Model annotations use the 12px label role with an explicit 11px CSS floor;
 // desktop's 80% root scale must not silently remove that reading floor.
 for(const caption of reading.roles.sourceCaptions){expect(caption.size,`${route}: source caption size`).toBe(Math.max(12*scale,11));spacing(caption,20/13,0);}
 for(const caption of reading.roles.measuredCaptions){expect(caption.measure,`${route}: caption measure`).toBeLessThanOrEqual(caption.expectedMeasure+.5);expect(caption.width,`${route}: caption within measure`).toBeLessThanOrEqual(caption.measure+.5);}
 const mainTitle=reading.roles.display.find(role=>role.tag==='H1');
 expect(mainTitle,`${route}: primary heading`).toBeTruthy();
 const hero=route==='/'||route==='/projects/bending-active/';
 expect(fontPixels(mainTitle.size),`${route}: compact primary heading maximum`).toBeLessThanOrEqual(fontPixels((route==='/'?64:hero?48:40)*scale));
 expect(fontPixels(mainTitle.size),`${route}: primary heading remains distinct`).toBeGreaterThanOrEqual(fontPixels((route==='/'?28.8:hero?32:30)*scale));
 for(const role of reading.roles.display.filter(role=>role.tag==='H2')){
  expect(fontPixels(role.size),`${route}: compact chapter/card heading ${role.text}`).toBeLessThanOrEqual(fontPixels((role.deck?40:28)*scale));
 }
 for(const role of reading.roles.display)spacing(role,role.homeIntro?1.15:role.deck?1.3:role.tag==='H1'?1.2:role.tag==='H2'&&!role.compact?1.3:1.4,role.homeIntro?-.05:role.deck&&role.tag==='H2'?-.03:['H1','H2'].includes(role.tag)&&!role.compact?-.025:0);
 for(const [kind,leading,tracking]of [['controls',10/7,0],['captions',20/13,0],['labels',1.5,0]])for(const role of reading.roles[kind])spacing(role,leading,tracking);
 for(const suffix of ['/assets/fonts/roboto-mono-variable.woff2'])expect(fonts.some(url=>url.endsWith(suffix))).toBe(true);
 expect(fonts.some(url=>/plex|arial|serif/i.test(url))).toBe(false);
 if(browserName==='chromium'){
  // Chromium's actual platform-font report catches a fallback face even when
  // computed CSS names the desired family. Target actual text-owning elements,
  // including heading spans/em/strong: a parent with no direct Text children
  // can return no platform-font usage. All levels use the same actual Latin face; system symbol fallbacks are explicit.
  const session=await page.context().newCDPSession(page);
  const latinProbes=reading.fontProbes.flatMap((probe,index)=>{
   const latin=probe.text.replace(/[^\x20-\x7e]/g,'');
   return /[^\x20-\x7e]/.test(probe.subtreeText)&&latin.trim()?[{index,selector:probe.selector,latin}]:[];
  });
  const report={route,sourceProbes:reading.fontProbes.length,isolatedLatinProbes:latinProbes.length,concurrency:FONT_QUERY_CONCURRENCY,queries:[]};
  let primary;
  try{
   // One append/remove pair keeps font observation from repeatedly invalidating
   // the live page's layout. Each direct Latin string retains its own source
   // element's resolved font and its own actual platform-font report.
   await page.evaluate(probes=>{
    const container=document.createElement('div');container.id='type-latin-glyph-probes';container.style.cssText='position:fixed;inset:0 auto auto 0;opacity:0;pointer-events:none';
    for(const probe of probes){const original=document.querySelector(probe.selector),span=document.createElement('span');span.dataset.typeLatinProbe=String(probe.index);span.textContent=probe.latin;span.style.cssText='display:block;white-space:pre';span.style.font=getComputedStyle(original).font;span.style.fontFamily=getComputedStyle(original).fontFamily;container.append(span);}
    document.body.append(container);
   },latinProbes);
   await session.send('DOM.enable');await session.send('CSS.enable');
   const {root}=await session.send('DOM.getDocument');
   const [{nodeIds},{nodeIds:latinIds}]=await Promise.all([
    session.send('DOM.querySelectorAll',{nodeId:root.nodeId,selector:reading.fontProbes.map(probe=>probe.selector).join(',')}),
    session.send('DOM.querySelectorAll',{nodeId:root.nodeId,selector:'#type-latin-glyph-probes [data-type-latin-probe]'}),
   ]);
   expect(nodeIds).toHaveLength(reading.fontProbes.length);
   expect(latinIds).toHaveLength(latinProbes.length);
   const started=performance.now(),usages=await queryFonts(session,[...nodeIds,...latinIds]);report.queryElapsedMs=performance.now()-started;
   report.queries=usages.map((usage,index)=>({kind:index<nodeIds.length?'source':'isolated-latin',index:index<nodeIds.length?index:latinProbes[index-nodeIds.length].index,fonts:usage.fonts}));
   const latinUsageByIndex=new Map(latinProbes.map((probe,index)=>[probe.index,usages[nodeIds.length+index]]));
   let mainHeadingGlyphs=0;
   for(let index=0;index<nodeIds.length;index++){
    const probe=reading.fontProbes[index],usage=usages[index],used=usage.fonts.filter(font=>font.glyphCount>0),expected=/Roboto Mono/i;
    if(probe.mainHeading)mainHeadingGlyphs+=used.reduce((sum,font)=>sum+font.glyphCount,0);
    expect(used.filter(font=>font.isCustomFont&&!expected.test(font.familyName)),`${route}: unexpected custom font for ${probe.text}`).toEqual([]);
    const latin=probe.text.replace(/[^\x20-\x7e]/g,'');
    // CDP reports font use for this node AND descendants/pseudo content.
    // A direct ASCII label such as "Follow the study" owns a separate arrow
    // span: classify that complete report, but isolate only this node's direct
    // Latin text below. Otherwise a legitimate arrow fallback is misreported
    // as fallback of the Latin label. Direct-text samples are not truncated.
    const mixed=/[^\x20-\x7e]/.test(probe.subtreeText);
    if(!mixed)expect(used.filter(font=>!font.isCustomFont),`${route}: actual Latin font ${probe.text}`).toEqual([]);
    if(mixed&&latin.trim()){
     const latinUsage=latinUsageByIndex.get(index);
     expect(latinUsage.fonts.filter(font=>font.glyphCount>0&&(!font.isCustomFont||!expected.test(font.familyName))),`${route}: isolated Latin glyphs for ${probe.text}`).toEqual([]);
     expect(latinUsage.fonts.some(font=>font.isCustomFont&&font.glyphCount>0&&expected.test(font.familyName))).toBe(true);
    }
   }
   expect(mainHeadingGlyphs).toBeGreaterThan(0);
   const bodyIndex=reading.fontProbes.findIndex(probe=>probe.selector===reading.bodyProbeSelector);expect(bodyIndex).toBeGreaterThanOrEqual(0);
   const bodyUsage=usages[bodyIndex];
   expect(bodyUsage.fonts.some(font=>font.isCustomFont&&font.glyphCount>0&&/Roboto Mono/i.test(font.familyName))).toBe(true);
   expect(bodyUsage.fonts.filter(font=>font.glyphCount>0&&(!font.isCustomFont||!/Roboto Mono/i.test(font.familyName)))).toEqual([]);
  }catch(error){primary=error;throw error;}finally{
   let cleanupError;
   try{await page.evaluate(()=>document.querySelector('#type-latin-glyph-probes')?.remove());}catch(error){cleanupError??=error;}
   try{await session.detach();}catch(error){cleanupError??=error;}
   try{const path=test.info().outputPath('platform-fonts.json');await writeFile(path,JSON.stringify(report,null,2));await test.info().attach('platform-fonts',{path,contentType:'application/json'});}catch(error){cleanupError??=error;}
   // A closed-page cleanup must not hide the original font assertion/timeout.
   if(!primary&&cleanupError)throw cleanupError;
  }
 }
 if(['/about/','/projects/bending-active/','/projects/xr-bending-active/','/projects/mode-s-of-making/'].includes(route)){
  const name='typography-native-'+(route.replaceAll('/','-')||'home'),path=test.info().outputPath(name+'.png');
  await page.screenshot({path,fullPage:false});
  await test.info().attach(name,{path,contentType:'image/png'});
 }
 expect(errors).toEqual([]);
});

// CI's Home trace completes every font assertion but spends another 30.7s on
// a software-GPU screenshot of the live model film. Preserve that native image
// in its own 60-second scenario rather than exhausting the font assay's budget.
test('Home retains a native typography capture beside the continuous model film',async({page})=>{
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.emulateMedia({reducedMotion:'reduce'});
 const response=await page.goto('/');expect(response.status()).toBe(200);
 await page.waitForFunction(()=>window.__site?.inspect().phase==='entered',null,{timeout:WAIT});
 await page.evaluate(()=>document.fonts.ready);
 const path=test.info().outputPath('typography-native--.png');
 await page.screenshot({path,fullPage:false});
 await test.info().attach('typography-native--',{path,contentType:'image/png'});
 expect(errors).toEqual([]);
});

// These cases exercise native responsive layout against the built artifact.
// They are not a source-level claim that the OCR header risks have passed.
// Each route retains its own existing 60-second scenario deadline.
const headerCases=[
 // Each Home resize owns a complete 60-second scenario. Its live film can
 // redraw a different dense source at each width; an aggregate four-resize
 // timeout does not establish any single responsive layout's failure.
 ...[320,361,365,390].map(width=>({route:'/',widths:[width]})),
 {route:'/projects/bending-active/',widths:[781,900,1000]},
 {route:'/projects/xr-bending-active/',widths:[781,900,1000]},
];
for(const {route,widths} of headerCases)test(`Monospace header controls stay separate and readable on ${route} at responsive boundaries${widths.length===1?' ('+widths[0]+'px)':''}`,async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 const response=await page.goto(route);expect(response.status()).toBe(200);
 await page.waitForFunction(()=>window.__site?.inspect().phase==='entered',null,{timeout:WAIT});
 await page.evaluate(()=>document.fonts.ready);
 const height=page.viewportSize().height;
 for(const width of widths){
  await page.setViewportSize({width,height});
  const layout=await page.evaluate(async()=>{
   await document.fonts.ready;
   await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
   const header=document.querySelector('header[data-portfolio-masthead],header[data-page-masthead]');
   const identity=header?.querySelector('[data-home-link]');
   // The original Bending markup identifies the same owner by its native
   // accessible label; Home and XR additionally expose the portfolio marker.
   const navigation=header?.querySelector('[data-portfolio-navigation],nav[aria-label="Portfolio"]');
   const rect=element=>{const box=element.getBoundingClientRect();return{left:box.left,top:box.top,right:box.right,bottom:box.bottom,width:box.width,height:box.height};};
   if(!identity||!navigation)return{missing:!header?'header':!identity?'identity':'navigation'};
   const controls=[identity,...navigation.querySelectorAll('a[href]')];
   const textClips=[];
   for(const control of controls){
    const bounds=rect(control),walker=document.createTreeWalker(control,NodeFilter.SHOW_TEXT);
    for(let node=walker.nextNode();node;node=walker.nextNode()){
     if(!node.textContent.trim()||!node.parentElement.checkVisibility({visibilityProperty:true,opacityProperty:true}))continue;
     const range=document.createRange();range.selectNodeContents(node);
     for(const box of range.getClientRects())if(box.width>0&&box.height>0&&(box.left<bounds.left||box.right>bounds.right||box.top<bounds.top||box.bottom>bounds.bottom))textClips.push({control:control.getAttribute('href'),text:node.textContent.trim(),bounds,textBounds:{left:box.left,right:box.right,top:box.top,bottom:box.bottom}});
    }
   }
   const identityBox=rect(identity),navigationBox=rect(navigation);
   const overlaps=box=>Math.max(0,Math.min(identityBox.right,box.right)-Math.max(identityBox.left,box.left))*Math.max(0,Math.min(identityBox.bottom,box.bottom)-Math.max(identityBox.top,box.top));
   return{missing:null,viewport:{width:document.documentElement.clientWidth,height:innerHeight},identity:identityBox,navigation:navigationBox,identityVisible:identity.checkVisibility({visibilityProperty:true,opacityProperty:true}),navigationVisible:navigation.checkVisibility({visibilityProperty:true,opacityProperty:true}),overlap:overlaps(navigationBox),controls:controls.map(control=>({href:control.getAttribute('href'),visible:control.checkVisibility({visibilityProperty:true,opacityProperty:true}),...rect(control)})),linkOverlaps:[...navigation.querySelectorAll('a[href]')].map(control=>({href:control.getAttribute('href'),area:overlaps(rect(control))})),textClips};
  });
  expect(layout.missing,`${route} at ${width}px: required native header owners`).toBeNull();
  expect(layout.identityVisible,`${route} at ${width}px: identity visible`).toBe(true);
  expect(layout.navigationVisible,`${route} at ${width}px: navigation visible`).toBe(true);
  expect(layout.overlap,`${route} at ${width}px: identity/navigation border boxes ${JSON.stringify({identity:layout.identity,navigation:layout.navigation})}`).toBe(0);
  expect(layout.controls).toHaveLength(4);
  for(const control of layout.controls){
   const context=`${route} at ${width}px: ${control.href} native hit area`;
   expect(control.visible,context).toBe(true);expect(control.width,context).toBeGreaterThan(0);expect(control.height,context).toBeGreaterThan(0);
   expect(control.left,context).toBeGreaterThanOrEqual(0);expect(control.top,context).toBeGreaterThanOrEqual(0);expect(control.right,context).toBeLessThanOrEqual(layout.viewport.width);expect(control.bottom,context).toBeLessThanOrEqual(layout.viewport.height);
  }
  expect(layout.linkOverlaps.filter(control=>control.area>0),`${route} at ${width}px: identity/link hit areas`).toEqual([]);
  expect(layout.textClips,`${route} at ${width}px: visible text inside its own clickable link`).toEqual([]);
 }
});
