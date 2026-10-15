import {chromium,webkit} from '@playwright/test';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {renderedTextContrast} from '../../../../../tests/pages/reading-contrast.mjs';

// This verifier never rebuilds. Its screenshots and pixels belong to the same
// frozen local artifact used by the existing catalog behavior verifiers.
assert.equal(process.version,'v24.19.0','Use the committed Node 24.19.0');
const directory=new URL('./',import.meta.url),out=new URL('.local/bright-catalog-materials/',directory);
const repository=new URL('../../../../../',directory),origin='http://127.0.0.1:4198';
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const fileHash=async name=>sha(await readFile(new URL(name,directory)));
const artifactHashes=async()=>Object.fromEntries(await Promise.all(['app.js','style.css','source-manifest.json'].map(async name=>[name,await fileHash('dist/'+name)])));
const artifacts=await artifactHashes(),manifest=JSON.parse(await readFile(new URL('dist/source-manifest.json',directory),'utf8'));
const materialSource='roles/uiux-designer/cases/bending-active-thesis/app/glass-materials.css';
assert(manifest.hashes[materialSource],'The artifact must include the shared material source');
for(const [file,expected] of Object.entries(manifest.hashes))assert.equal(sha(await readFile(new URL(file,repository))),expected,file+' changed since build');
const approved=JSON.parse(await readFile(new URL('../release/manifest.json',directory),'utf8')).assets.find(asset=>asset.path==='assets/diagrams/library.svg');
assert(approved,'Approved catalog source diagram must be declared');
await mkdir(out,{recursive:true});
const rows=[],errors=[];

function materialFacts(){
 const owner=document.querySelector('.vt-window'),paper=owner.querySelector('img');
 const capability=owner.closest('.vt-lab').dataset.materialCapability,variantName=`--material-reading-${capability}-fill`;
 const backdrop=style=>style.getPropertyValue('backdrop-filter')||style.getPropertyValue('-webkit-backdrop-filter')||'none';
 const paint=(element,pseudo)=>{const style=getComputedStyle(element,pseudo),box=element.getBoundingClientRect();return{backgroundColor:style.backgroundColor,backgroundImage:style.backgroundImage,backdrop:backdrop(style),opacity:Number(style.opacity),filter:style.filter,mixBlendMode:style.mixBlendMode,clipPath:style.clipPath,maskImage:style.maskImage||style.webkitMaskImage,isolation:style.isolation,transform:style.transform,willChange:style.willChange,position:style.position,zIndex:style.zIndex,inset:style.inset,box:{x:box.x,y:box.y,width:box.width,height:box.height}};};
 // A nonpainted probe resolves the shared variables in this exact ancestry.
 const probe=document.createElement('span');probe.style.cssText='display:none;background:var(--material-reading-fill);backdrop-filter:var(--material-reading-backdrop);-webkit-backdrop-filter:var(--material-reading-backdrop);color:var(--material-reading-ink)';owner.appendChild(probe);
 const expected=paint(probe),expectedInk=getComputedStyle(probe).color;probe.remove();
 const owners=[];
 for(const element of [owner,...owner.querySelectorAll('*')])for(const pseudo of [null,'::before','::after']){
  const style=getComputedStyle(element,pseudo),value=backdrop(style);
  if(value!=='none')owners.push({node:element===owner?'window':element.className||element.tagName,pseudo,value});
 }
 const detail=window.__effectDesk.inspect().detail,box=owner.getBoundingClientRect(),viewport=document.querySelector('.vt-scroll').getBoundingClientRect(),ancestors=[];
 for(let node=owner.parentElement;node;node=node.parentElement)ancestors.push({node:node.tagName,className:node.className,...paint(node)});
 return{
  expected,expectedInk,skin:paint(owner,'::before'),skinContent:getComputedStyle(owner,'::before').content,ancestors,
  transparent:Object.fromEntries([['window',owner],['bar',owner.querySelector('.vt-windowbar')],['foot',owner.querySelector('.vt-windowfoot')],['info',owner.querySelector('.vt-info')]].map(([name,element])=>[name,paint(element)])),
  ink:getComputedStyle(owner).color,owners,canvasCount:document.querySelectorAll('#stage canvas').length,
  token:getComputedStyle(owner).getPropertyValue('--material-reading-fill').trim(),rootToken:getComputedStyle(document.documentElement).getPropertyValue('--material-reading-fill').trim(),
  materialCapability:capability,variantToken:getComputedStyle(owner).getPropertyValue(variantName).trim(),rootVariantToken:getComputedStyle(document.documentElement).getPropertyValue(variantName).trim(),
  paper:{...paint(paper),source:paper.getAttribute('src'),naturalWidth:paper.naturalWidth,naturalHeight:paper.naturalHeight,forcedColorAdjust:getComputedStyle(paper).forcedColorAdjust},
  progress:detail.scrollProgress,mode:detail.mode,visible:detail.visible,resting:detail.kinetic.resting,scheduled:detail.scheduled,
  box:{x:box.x,y:box.y,width:box.width,height:box.height},viewport:{x:viewport.x,y:viewport.y,width:viewport.width,height:viewport.height},
  contrastMore:matchMedia('(prefers-contrast: more)').matches,
 };
}

const alpha=color=>{const values=color.match(/[\d.]+/g)?.map(Number);assert(values?.length>=3,'Unsupported computed color '+color);return values[3]??1;};
function assertOwnership(facts,more=false){
 assert.equal(facts.canvasCount,0,'2D information must not create a Canvas');
 assert.equal(facts.progress,.5);assert.equal(facts.mode,'scroll');assert(facts.visible&&facts.resting&&!facts.scheduled);
 assert(facts.token);assert.match(facts.materialCapability,/^(range|regular)$/,'The mounted capability chooses the shared token branch');
 assert.equal(facts.token,facts.variantToken,'The material consumes the capability-selected shared variant');
 assert.equal(facts.variantToken,facts.rootVariantToken,'The selected variant remains identical to its shared root source');
 assert.equal(facts.ink,facts.expectedInk);
 // Native sampling belongs to the actual window; its overscan pseudo-element
 // paints the sole tint without starting a second backdrop/compositor stack.
 for(const key of ['backgroundColor','backgroundImage'])assert.equal(facts.skin[key],facts.expected[key],'Tint skin resolves shared '+key);
 assert.equal(facts.skin.backdrop,'none','The tint-only pseudo-element must not sample another backdrop');
 assert.equal(facts.transparent.window.backdrop,facts.expected.backdrop,'The window resolves the shared native backdrop');
 assert.notEqual(facts.skinContent,'none');assert.equal(facts.skin.opacity,1);assert.equal(facts.skin.filter,'none');
 for(const [name,paint] of Object.entries(facts.transparent)){
  assert.equal(alpha(paint.backgroundColor),0,name+' must not double the tint');assert.equal(paint.backgroundImage,'none',name+' must not paint another material');
  if(name!=='window')assert.equal(paint.backdrop,'none',name+' must not add a backdrop stack');assert.equal(paint.opacity,1);assert.equal(paint.filter,'none');
 }
 assert.equal(facts.paper.source,'/assets/diagrams/library.svg');assert(facts.paper.naturalWidth>0&&facts.paper.naturalHeight>0);
 assert.equal(alpha(facts.paper.backgroundColor),1,'Only the source paper remains opaque');assert.equal(facts.paper.backgroundImage,'none');
 assert.equal(facts.paper.opacity,1);assert.equal(facts.paper.filter,'none');assert.equal(facts.paper.backdrop,'none');assert.equal(facts.paper.mixBlendMode,'normal');
 assert.equal(facts.contrastMore,more);
 if(more){assert.equal(alpha(facts.skin.backgroundColor),1);assert.deepEqual(facts.owners,[]);assert.equal(facts.skin.backdrop,'none');}
 else{
  assert(alpha(facts.skin.backgroundColor)>0&&alpha(facts.skin.backgroundColor)<1);
  assert.deepEqual(facts.owners.map(({node,pseudo})=>({node,pseudo})),[{node:'window',pseudo:null}]);assert.match(facts.transparent.window.backdrop,/blur\(/);
 }
}

async function pixels(page,bytes,raw=false){
 // The temporary Canvas decodes screenshot bytes only; it never enters the DOM.
 return page.evaluate(async({png,raw})=>{
  const bitmap=await createImageBitmap(await(await fetch('data:image/png;base64,'+png)).blob());
  const canvas=document.createElement('canvas');canvas.width=bitmap.width;canvas.height=bitmap.height;
  const context=canvas.getContext('2d');context.drawImage(bitmap,0,0);bitmap.close();
  const data=context.getImageData(0,0,canvas.width,canvas.height).data,rgb=[0,0,0];
  for(let offset=0;offset<data.length;offset+=4)for(let channel=0;channel<3;channel++)rgb[channel]+=data[offset+channel]/(data.length/4);
  return{rgb,width:canvas.width,height:canvas.height,...(raw?{rgba:[...data]}:{})};
 },{png:bytes.toString('base64'),raw});
}

async function skinPixels(page){
 const owner=page.locator('.vt-window');
 const saved=await owner.evaluate(element=>{
  const restore={style:element.getAttribute('style'),children:[...element.children].map(child=>child.getAttribute('style'))};
  // Keep the original owner, pseudo-element, transform and all ancestors. Hide
  // only content for this center crop, including any bare inherited text.
  element.style.setProperty('color','transparent','important');element.style.setProperty('-webkit-text-fill-color','transparent','important');
  for(const child of element.children)child.style.setProperty('visibility','hidden','important');
  return restore;
 });
 try{
  const box=await owner.boundingBox();assert(box&&box.width>60&&box.height>30);
  const width=Math.min(64,box.width*.3),height=Math.min(32,box.height*.3);
  const bytes=await page.screenshot({animations:'disabled',clip:{x:box.x+(box.width-width)/2,y:box.y+(box.height-height)/2,width,height}});
  return await pixels(page,bytes);
 }finally{
  await owner.evaluate((element,saved)=>{
   [...element.children].forEach((child,index)=>{if(saved.children[index]===null)child.removeAttribute('style');else child.setAttribute('style',saved.children[index]);});
   if(saved.style===null)element.removeAttribute('style');else element.setAttribute('style',saved.style);
  },saved);
 }
}

function paperGeometry(image){
 const box=image.getBoundingClientRect(),style=getComputedStyle(image),number=key=>parseFloat(style[key])||0;
 const scaleX=box.width/image.offsetWidth,scaleY=box.height/image.offsetHeight;
 const border=[number('borderLeftWidth'),number('borderTopWidth'),number('borderRightWidth'),number('borderBottomWidth')];
 const padding=[number('paddingLeft'),number('paddingTop'),number('paddingRight'),number('paddingBottom')];
 const width=(image.clientWidth-padding[0]-padding[2])*scaleX,height=(image.clientHeight-padding[1]-padding[3])*scaleY;
 const x=box.left+(border[0]+padding[0])*scaleX,y=box.top+(border[1]+padding[1])*scaleY;
 const ratio=Math.min(width/image.naturalWidth,height/image.naturalHeight),assetWidth=image.naturalWidth*ratio,assetHeight=image.naturalHeight*ratio;
 const clips=[image.closest('.vt-info'),image.closest('.vt-scroll')].map(element=>element.getBoundingClientRect());
 return{
  image:{x:box.x,y:box.y,width:box.width,height:box.height},border,padding,objectFit:style.objectFit,objectPosition:style.objectPosition,
  // These specimens use centered object-fit:contain. Its actual SVG rectangle
  // excludes both the CSS border/padding and any letterbox margins.
  asset:{x:x+(width-assetWidth)/2,y:y+(height-assetHeight)/2,width:assetWidth,height:assetHeight},
  visible:{left:Math.max(0,...clips.map(box=>box.left)),top:Math.max(0,...clips.map(box=>box.top)),right:Math.min(innerWidth,...clips.map(box=>box.right)),bottom:Math.min(innerHeight,...clips.map(box=>box.bottom))},
 };
}

async function paperRegion(page){
 const geometry=await page.locator('.vt-info img').evaluate(paperGeometry);
 assert.equal(geometry.objectFit,'contain');assert.equal(geometry.objectPosition,'50% 50%');
 const {asset,visible,image}=geometry;
 // Choose exactly one integer pixel crop, well inside the drawn source SVG.
 // Re-centering each measurement can compare different source pixels after a
 // preference/layout change; decorative border/radius colors are not artwork.
 const left=Math.ceil(Math.max(asset.x,visible.left))+8,top=Math.ceil(Math.max(asset.y,visible.top))+8;
 const right=Math.floor(Math.min(asset.x+asset.width,visible.right))-8,bottom=Math.floor(Math.min(asset.y+asset.height,visible.bottom))-8;
 const width=Math.min(64,right-left),height=Math.min(64,bottom-top);assert(width>8&&height>8,'Original source paper must be visible');
 const x=Math.floor((left+right-width)/2),y=Math.floor((top+bottom-height)/2);
 return{offsetX:x-image.x,offsetY:y-image.y,width,height,geometry};
}

async function paperPixels(page,region,name){
 const geometry=await page.locator('.vt-info img').evaluate(paperGeometry),original=region.geometry;
 for(const key of ['width','height'])assert.equal(geometry.image[key],original.image[key],'Source image '+key+' must remain stable');
 for(const key of ['border','padding','objectFit','objectPosition'])assert.deepEqual(geometry[key],original[key],'Source image '+key+' must remain stable');
 const clip={x:geometry.image.x+region.offsetX,y:geometry.image.y+region.offsetY,width:region.width,height:region.height};
 for(const axis of ['x','y'])assert(Math.abs(clip[axis]-Math.round(clip[axis]))<.001,'Source sampling grid must remain fixed');
 assert(clip.x>=geometry.visible.left&&clip.y>=geometry.visible.top&&clip.x+clip.width<=geometry.visible.right&&clip.y+clip.height<=geometry.visible.bottom,'Fixed source crop must remain visible');
 const bytes=await page.screenshot({animations:'disabled',clip}),sample=await pixels(page,bytes,true),rgba=Buffer.from(sample.rgba);delete sample.rgba;
 const file=name+'-probe-paper.png';await writeFile(new URL(file,out),bytes);
 const result={sha256:sha(rgba),pngSha256:sha(bytes),...sample,clip,file};
 // Pixel bytes are retained only for comparison diagnostics, not the JSON.
 Object.defineProperty(result,'rgba',{value:rgba});return result;
}

function assertPaperPixels(actual,expected,message,{allowRasterQuantization=false}={}){
 assert.equal(actual.width,expected.width);assert.equal(actual.height,expected.height);
 const totalPixels=actual.rgba.length/4;let maxChannelDelta=0,changedPixels=0,totalChannelDelta=0,maxAlphaDelta=0;
 for(let offset=0;offset<actual.rgba.length;offset+=4){
  let changed=false;
  for(let channel=0;channel<3;channel++){const delta=Math.abs(actual.rgba[offset+channel]-expected.rgba[offset+channel]);maxChannelDelta=Math.max(maxChannelDelta,delta);totalChannelDelta+=delta;changed||=delta>0;}
  maxAlphaDelta=Math.max(maxAlphaDelta,Math.abs(actual.rgba[offset+3]-expected.rgba[offset+3]));if(changed)changedPixels++;
 }
 const comparison={mode:allowRasterQuantization?'cross-mode raster quantization':'same-mode exact RGBA',totalPixels,maxChannelDelta,changedPixels,meanChannelDelta:totalChannelDelta/(totalPixels*3),maxAlphaDelta,expected:expected.file,actual:actual.file,expectedClip:expected.clip,actualClip:actual.clip};
 const diagnostic=message+' '+JSON.stringify(comparison);assert.equal(maxAlphaDelta,0,diagnostic);
 if(allowRasterQuantization){
  // Changing native contrast removes a compositor backdrop layer. Observed
  // one-code-value raster rounding at a few antialiased source pixels is not
  // recoloring. Keep alpha exact and tightly bound both extent and mean error.
  assert(maxChannelDelta<=1,diagnostic);assert(changedPixels<=totalPixels*.01,diagnostic);assert(comparison.meanChannelDelta<=.01,diagnostic);
 }else assert.equal(actual.sha256,expected.sha256,diagnostic);
 return comparison;
}

const settled=page=>page.waitForFunction(()=>{
 const detail=window.__effectDesk?.inspect().detail;
 return detail?.ready&&detail.mode==='scroll'&&detail.scrollProgress===.5&&detail.visible&&!detail.travel&&detail.kinetic.resting&&!detail.scheduled;
},null,{timeout:10000});
const paint=page=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
async function contrastRows(page){
 return renderedTextContrast(page,page.locator('.vt-window'));
}
function assertContrastRows(measurements){
 assert(measurements.length>=5,'Measure actual title, muted copy, accent and footer text');
 for(const row of measurements)assert(row.ratio>=row.required,`${row.text}: ${row.ratio.toFixed(3)} < ${row.required}`);
}

let failure;
try{
 // Deliberately serial: never run two GPU/browser engines at the same time.
 for(const [engine,type,mobile] of [['chromium',chromium,false],['webkit',webkit,false],['mobile-chromium',chromium,true]]){
  const browser=await type.launch();
  try{
   const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1440,height:1000},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:1});
   const page=await context.newPage();page.on('pageerror',error=>errors.push({engine,message:error.message}));page.on('console',message=>{if(message.type()==='error')errors.push({engine,message:message.text()});});
   await page.emulateMedia({reducedMotion:'no-preference',contrast:'no-preference',forcedColors:'none'});
   await page.goto(origin+'/2d/');await page.waitForFunction(()=>window.__effectDesk?.inspect().detail?.ready);
   for(const id of ['window-2d-membrane','window-2d-ink']){
    await page.emulateMedia({reducedMotion:'no-preference',contrast:'no-preference',forcedColors:'none'});
    // Recipe changes are same-document hash navigation. They do not reload
    // app.js/style.css, so a fresh network response event is not a readiness
    // contract. Select the real specimen and inspect its loaded source links.
    await page.evaluate(id=>window.__effectDesk.select(id),id);
    await page.waitForFunction(id=>window.__effectDesk?.inspect().id===id&&window.__effectDesk.inspect().detail?.ready,id);
    const loadedSources=await page.evaluate(()=>{
     const script=document.querySelector('script[type="module"][src]'),style=document.querySelector('link[rel="stylesheet"]');
     return{script:script?.src,stylesheet:style?.href,stylesheetLoaded:!!style?.sheet&&style.sheet.cssRules.length>0,location:location.href};
    });
    assert.equal(loadedSources.script,origin+'/app.js');assert.equal(loadedSources.stylesheet,origin+'/style.css');assert(loadedSources.stylesheetLoaded);
    const served={};
    for(const [name,url] of [['app.js',loadedSources.script],['style.css',loadedSources.stylesheet]]){
     // API GET is independent of browser response-event/cache reuse. The DOM
     // links, active styles, ready specimen and frozen local hashes remain the
     // evidence chain; this verifier never supplies replacement source bytes.
     const response=await page.request.get(url,{headers:{'Cache-Control':'no-cache'}});assert(response.ok());served[name]=sha(await response.body());assert.equal(served[name],artifacts[name],engine+' served '+name);
    }
    const servedManifest=await page.request.get(origin+'/source-manifest.json');assert(servedManifest.ok());assert.equal(sha(await servedManifest.body()),artifacts['source-manifest.json']);
    await page.locator('#stage').scrollIntoViewIfNeeded();await page.evaluate(()=>document.fonts.ready);
    await page.evaluate(()=>{window.__effectDesk.reset();const viewport=document.querySelector('.vt-scroll');viewport.scrollTop=(viewport.scrollHeight-viewport.clientHeight)/2;viewport.dispatchEvent(new Event('scroll'));});
    await page.mouse.move(0,0);await settled(page);await paint(page);
    const owner=page.locator('.vt-window'),normal=await page.evaluate(materialFacts);
    const result={engine,id,passed:false,status:'measuring',appearance:'neutral-dark',monotonicQuantizationTolerance:1,served,loadedSources,normal,samples:[]};rows.push(result);
    const sourceResponse=await page.request.get(origin+normal.paper.source);assert(sourceResponse.ok());assert.equal(sha(await sourceResponse.body()),approved.sha256,'Keep approved source bytes');
    const screenshotFiles={viewport:`${engine}-${id}-viewport.png`,stage:`${engine}-${id}-stage.png`};
    assert.deepEqual(errors,[],'Normal screenshots require an error-free catalog');
    await page.screenshot({path:fileURLToPath(new URL(screenshotFiles.viewport,out)),animations:'disabled'});
    await page.locator('#stage').screenshot({path:fileURLToPath(new URL(screenshotFiles.stage,out)),animations:'disabled'});
    const screenshotSha256=Object.fromEntries(await Promise.all(Object.entries(screenshotFiles).map(async([kind,file])=>[kind,sha(await readFile(new URL(file,out)))])));
    const fixedPaperRegion=await paperRegion(page),probeName=engine+'-'+id;
    const normalPaper=await paperPixels(page,fixedPaperRegion,probeName+'-normal'),normalContrast=await contrastRows(page),samples=result.samples;
    Object.assign(result,{sourceSha256:approved.sha256,screenshotFiles,screenshotSha256,fixedPaperRegion,normalPaper,normalContrast});
    const viewportStyle=await page.locator('.vt-scroll').getAttribute('style');
    try{
     for(const background of ['#000000','#404040','#808080','#c0c0c0','#ffffff']){
      await page.locator('.vt-scroll').evaluate((element,color)=>element.style.setProperty('background',color,'important'),background);await paint(page);
      const skin=await skinPixels(page),contrast=await contrastRows(page),paper=await paperPixels(page,fixedPaperRegion,probeName+'-'+background.slice(1)),facts=await page.evaluate(materialFacts);
      const coreMean=skin.rgb.reduce((sum,value)=>sum+value,0)/3,channelSpread=Math.max(...skin.rgb)-Math.min(...skin.rgb);
      samples.push({background,...skin,coreMean,channelSpread,contrast,paper,facts});
     }
     // Explicit project dark-appearance target; no Apple numeric budget is implied.
     const mean=rgb=>rgb.reduce((sum,value)=>sum+value,0)/3,brightness=samples[0].coreMean,transmission=samples.at(-1).coreMean-brightness;
     Object.assign(result,{brightness,transmission,status:'measured-normal'});
     // Persist the full five-point evidence before a quality assertion can fail.
     assertOwnership(normal);assertContrastRows(normalContrast);
     for(const [index,sample] of samples.entries()){
      sample.paperComparison=assertPaperPixels(sample.paper,normalPaper,'The source paper pixels must not change with the backdrop');
      assertOwnership(sample.facts);assertContrastRows(sample.contrast);
      assert(sample.channelSpread<14,`${engine} ${id}: neutral core channel spread ${sample.channelSpread}`);
      if(index)assert(sample.coreMean+1>samples[index-1].coreMean,`${engine} ${id}: gray transfer must increase within one-code quantization`);
     }
     assert(brightness>8&&brightness<85,`${engine} ${id}: black core ${brightness} must remain within the visible dark range 8..85`);
     assert(transmission>20&&transmission<85,`${engine} ${id}: actual transmission ${transmission} must be within 20..85`);
     await page.emulateMedia({contrast:'more'});await page.waitForFunction(()=>matchMedia('(prefers-contrast: more)').matches);await paint(page);
     const more=await page.evaluate(materialFacts),opaqueSamples=[];result.increasedContrast={facts:more,samples:opaqueSamples};
     for(const background of ['#000000','#ffffff']){
      await page.locator('.vt-scroll').evaluate((element,color)=>element.style.setProperty('background',color,'important'),background);await paint(page);
      const paper=await paperPixels(page,fixedPaperRegion,probeName+(background==='#000000'?'-more-black':'-more-white'));
      opaqueSamples.push({background,...await skinPixels(page),contrast:await contrastRows(page),paper});
     }
     assertOwnership(more,true);
     for(const [index,sample] of opaqueSamples.entries()){
      sample.paperComparison=assertPaperPixels(sample.paper,normalPaper,'Native increased contrast preserves source colors within bounded raster quantization',{allowRasterQuantization:true});
      sample.sameModePaperComparison=index?assertPaperPixels(sample.paper,opaqueSamples[0].paper,'Source pixels remain exact across backgrounds in increased contrast'):null;
      assertContrastRows(sample.contrast);
     }
     assert(Math.abs(mean(opaqueSamples[1].rgb)-mean(opaqueSamples[0].rgb))<1,'Native increased contrast must paint opaque material');
     Object.assign(result,{passed:true,status:'passed'});
     console.log('catalog material checked',engine,id);
    }finally{
     await page.locator('.vt-scroll').evaluate((element,style)=>{if(style===null)element.removeAttribute('style');else element.setAttribute('style',style);},viewportStyle);
     await page.emulateMedia({contrast:'no-preference'});await paint(page);assertOwnership(await page.evaluate(materialFacts));assert.equal(await owner.locator('canvas').count(),0);
    }
   }
   await context.close();
  }finally{await browser.close();}
 }
 assert.equal(rows.length,6);assert.deepEqual(errors,[]);assert.deepEqual(await artifactHashes(),artifacts,'Artifact changed during verification');
}catch(error){failure=error;}
finally{
 await writeFile(new URL('results.json',out),JSON.stringify({passed:!failure,verifiedAt:new Date().toISOString(),node:process.version,origin,artifacts,sourceManifest:{inputs:Object.keys(manifest.hashes).length,materialSha256:manifest.hashes[materialSource]},expectedCases:6,rows,errors,...(failure?{failure:{message:failure.message,stack:failure.stack}}:{})},null,2)+'\n');
}
if(failure)throw failure;
console.log('Catalog glass materials verified:',rows.length,'cases.');
