import {test,expect} from '@playwright/test';
import {WAIT} from './case-helpers.mjs';

const routes=['/','/about/','/projects/','/contact/','/projects/bending-active/','/projects/xr-bending-active/','/404.html'];
const family='Portfolio OCR B';

// A separate native document per route keeps the existing 60-second scenario
// budget. Reduced Motion isolates font/reading acceptance from optional 3D.
for(const route of routes)test(`the published ${route} document actually loads OCR and keeps its text readable`,async({page,browserName})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 const fonts=[],errors=[];page.on('request',request=>{if(request.resourceType()==='font')fonts.push(request.url());});page.on('pageerror',error=>errors.push(error.message));
 const response=await page.goto(route);expect(response.status()).toBe(200);
 await page.waitForFunction(()=>window.__site?.inspect().phase==='entered',null,{timeout:WAIT});
 const reading=await page.evaluate(async expected=>{
  await document.fonts.ready;
  const text=[...document.querySelectorAll('body *')].filter(node=>!['SCRIPT','STYLE','NOSCRIPT'].includes(node.tagName)&&[...node.childNodes].some(child=>child.nodeType===Node.TEXT_NODE&&child.textContent.trim()));
  const wrong=text.filter(node=>{const css=getComputedStyle(node);return css.display!=='none'&&css.visibility!=='hidden'&&css.fontFamily.split(',')[0].replaceAll(/['"]/g,'').trim()!==expected;}).map(node=>({tag:node.tagName,text:node.textContent.slice(0,80),font:getComputedStyle(node).fontFamily}));
  const heading=document.querySelector('h1'),leaf=[heading,...heading.querySelectorAll('*')].find(node=>[...node.childNodes].some(child=>child.nodeType===Node.TEXT_NODE&&child.textContent.trim()));
  const clipped=[];
  for(const node of text){
   const css=getComputedStyle(node),box=node.getBoundingClientRect();
   if(node.closest('[aria-hidden="true"]')||css.visibility==='hidden'||Number(css.opacity)===0||box.width<3||box.height<3)continue;
   const scrollable=element=>{for(let parent=element;parent&&parent!==document.body;parent=parent.parentElement){const style=getComputedStyle(parent);if(['auto','scroll'].includes(style.overflowX)&&parent.scrollWidth>parent.clientWidth)return true;}return false;};
   if(scrollable(node))continue;
   for(const child of node.childNodes){if(child.nodeType!==Node.TEXT_NODE||!child.textContent.trim())continue;const range=document.createRange();range.selectNodeContents(child);for(const rect of range.getClientRects())if(rect.width>2&&(rect.left<-.5||rect.right>document.documentElement.clientWidth+.5))clipped.push({tag:node.tagName,text:child.textContent.trim().slice(0,80),left:rect.left,right:rect.right});}
  }
  const parts=[];for(let node=leaf;node&&node!==heading;node=node.parentElement)parts.unshift(`${node.localName}:nth-child(${[...node.parentElement.children].indexOf(node)+1})`);
  return{faces:[...document.fonts].filter(face=>face.status==='loaded').map(face=>face.family.replaceAll(/['"]/g,'')),loaded:document.fonts.check(`16px "${expected}"`,'Computational design ↗ fabrication-ready × 01'),wrong,clipped,textNodes:text.length,headingVisible:heading.checkVisibility({visibilityProperty:true,opacityProperty:true}),headingFamily:getComputedStyle(heading).fontFamily,probeSelector:'h1'+(parts.length?' > '+parts.join(' > '):''),clientWidth:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth};
 },family);
 expect(reading.faces).toContain(family);expect(reading.loaded).toBe(true);expect(reading.wrong).toEqual([]);expect(reading.clipped).toEqual([]);expect(reading.textNodes).toBeGreaterThan(10);expect(reading.headingVisible).toBe(true);expect(reading.headingFamily).toContain(family);expect(reading.scrollWidth).toBeLessThanOrEqual(reading.clientWidth);
 expect(fonts.some(url=>/\/assets\/fonts\/.*ocr.*\.woff2$/.test(url))).toBe(true);expect(fonts.some(url=>/plex|arial|serif/i.test(url))).toBe(false);
 if(browserName==='chromium'){
  // Chromium's actual platform-font report catches a fallback face even when
  // computed CSS names the desired family. Other engines still check the real
  // FontFace load, all DOM font ownership and native reading geometry above.
  const session=await page.context().newCDPSession(page);
  try{
   await session.send('DOM.enable');await session.send('CSS.enable');
   const {root}=await session.send('DOM.getDocument'),{nodeId}=await session.send('DOM.querySelector',{nodeId:root.nodeId,selector:reading.probeSelector});
   const usage=await session.send('CSS.getPlatformFontsForNode',{nodeId});
   expect(usage.fonts.some(font=>font.isCustomFont&&font.glyphCount>0&&/OCR/i.test(font.familyName))).toBe(true);
   expect(usage.fonts.filter(font=>font.glyphCount>0&&!/OCR/i.test(font.familyName))).toEqual([]);
  }finally{await session.detach();}
 }
 expect(errors).toEqual([]);
});

// These cases exercise native responsive layout against the built artifact.
// They are not a source-level claim that the OCR header risks have passed.
// Each route retains its own existing 60-second scenario deadline.
const headerCases=[
 {route:'/',widths:[320,361,365,390]},
 {route:'/projects/bending-active/',widths:[781,900,1000]},
 {route:'/projects/xr-bending-active/',widths:[781,900,1000]},
];
for(const {route,widths} of headerCases)test(`OCR header controls stay separate and readable on ${route} at responsive boundaries`,async({page})=>{
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
