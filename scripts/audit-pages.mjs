import {readFile, readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {assertProjectStudies,assertProjectImage,assertProjectModel,assertProjectAssetRecord,PROJECT_SLUGS} from './project-studies.mjs';
import {projectMotionMedia,assertProjectVideo} from './project-motion-media.mjs';

const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
const OCR_FONT='/assets/fonts/portfolio-ocr-b.woff2',OCR_NOTICE='licenses/ocr-b-NOTICE.txt';
const DISPLAY_FONT='/assets/fonts/space-grotesk-variable.woff2',DISPLAY_NOTICE='licenses/space-grotesk-OFL.txt';
const INTRO_STATEMENT='I am a computational designer and developer working at the intersection of design technology, digital fabrication, and spatial interaction.';
const INTRO_DESCRIPTION='My work bridges the physical and digital through computational tools, interactive interfaces, and workflows that translate design and engineering information into fabrication-ready, machine-readable data.';
const markerCount=(html,name)=>(html.match(new RegExp(`\\b${name}(?:=|(?=[\\s>]))`,'g'))??[]).length;
const tagAttribute=(tag,name)=>(tag??'').match(new RegExp(`(?:^|\\s)${name}="([^"]*)"`,'i'))?.[1]??null;
const tagWith=(html,name,marker)=>[...html.matchAll(new RegExp(`<${name}\\b[^>]*>`,'g'))].map(match=>match[0]).find(tag=>new RegExp(`\\b${marker}(?:=|(?=[\\s>]))`).test(tag));

export function assertXRWorkspaceImage(bytes,image){
  assert(bytes.length>=20,'A complete workspace WebP');
  assert.equal(bytes.subarray(0,4).toString(),'RIFF','A workspace derivative must be a real WebP');
  assert.equal(bytes.subarray(8,12).toString(),'WEBP');
  assert.equal(bytes.readUInt32LE(4)+8,bytes.length,'The complete native derivative is retained');
  let width=null,height=null,alpha=false,lossless=false,offset=12;
  for(;offset+8<=bytes.length;){
    const kind=bytes.subarray(offset,offset+4).toString(),length=bytes.readUInt32LE(offset+4),start=offset+8;
    assert(start+length<=bytes.length,'Complete WebP chunk');
    assert(!['ANIM','ANMF'].includes(kind),'The workspace derivative is a still native capture');
    assert.notEqual(kind,'VP8 ','Native source pixels cannot pass through a lossy WebP frame');
    let frameWidth=null,frameHeight=null;
    if(kind==='VP8X'){
      assert(length>=10);alpha||=!!(bytes[start]&0x10);
      frameWidth=bytes.readUIntLE(start+4,3)+1;frameHeight=bytes.readUIntLE(start+7,3)+1;
    }
    if(kind==='ALPH')alpha=true;
    if(kind==='VP8L'){
      assert(length>=5&&bytes[start]===0x2f,'A real lossless WebP frame');
      lossless=true;
      const bits=bytes.readUInt32LE(start+1);alpha||=!!(bits&0x10000000);
      frameWidth=(bits&0x3fff)+1;frameHeight=((bits>>>14)&0x3fff)+1;
    }
    if(frameWidth!==null){
      if(width!==null)assert.deepEqual([frameWidth,frameHeight],[width,height],'WebP frame and canvas agree');
      width=frameWidth;height=frameHeight;
    }
    offset=start+length+(length%2);
  }
  assert.equal(offset,bytes.length,'No incomplete trailing WebP chunk');assert(lossless,'An actual lossless frame preserves the verified native RGBA pixels');
  assert(alpha,'Both responsive workspace derivatives retain an alpha channel');
  assert.deepEqual([width,height],[image.width,image.height],'Actual WebP pixels match the native capture, without a resized metadata substitute');
}

/** Public pins bind the independently verified native receipts; CI does not
 * reopen or publish the private source CAD, texture files or object-ID list. */
export function assertXRWorkspaceRecord(workspace,manifest){
  assert.equal(workspace.schemaVersion,1,'Supported complete-workspace record');
  assert.equal(workspace.sourceSHA256,'52a2c77039977c612afd05d1179410927cbe0a48b83439aa55ac98a9eaef666b','Owner-designated original research room');
  assert.equal(workspace.sourceOriginalUnchanged,true);
  const capture=workspace.render,visibility=capture?.visibility;
  assert(capture&&Number.isInteger(capture.selectedObjects)&&capture.selectedObjects>352,'Context represents the complete workspace, beyond the bamboo-only selection');
  assert.equal(capture.sourceObjectTotal,4204,'All original source objects remain accounted for');
  assert.equal(capture.selectedObjects+capture.excludedObjects,capture.sourceObjectTotal,'Every original source object is accounted for');
  assert.equal(capture.geometrySimplified,false);assert.equal(capture.sourceObjectPositionsChanged,false);
  assert.equal(capture.sourceVertexColourMeshes,9,'Retain all original authored-colour study meshes');
  assert.equal(capture.sourceVertexColourVertices,1997801);assert.equal(capture.sourceVertexColour8BitRoundtripExact,true);
  assert.equal(capture.clearAlpha,0,'The source capture has a transparent background');
  assert(capture.nativeEngine&&/Rhino/.test(capture.nativeEngine.name)&&/^8\./.test(capture.nativeEngine.version),'Native Rhino 8 source-renderer provenance');
  assert.equal(capture.nativeEngine.displayMode,'Rendered','The approved source Rendered display mode');
  assert.equal(visibility?.architectureRestoredObjects,127,'Retain the approved original room architecture');
  assert.equal(visibility.foremostSpeakerRowObjects,116);assert.equal(visibility.foremostCabinetObjects,2);
  assert.equal(visibility.foregroundHiddenObjects,visibility.foremostSpeakerRowObjects+visibility.foremostCabinetObjects,'Only the approved foremost speaker row and two cabinets are hidden');
  assert.equal(visibility.frontFacadeHiddenObjects,29,'Only the obstructing front facade is opened');
  assert.equal(visibility.originalHiddenObjects,10);assert.equal(visibility.nonSurfaceOrClippingObjects,25);
  assert.equal(capture.excludedObjects,visibility.foregroundHiddenObjects+visibility.frontFacadeHiddenObjects+visibility.originalHiddenObjects+visibility.nonSurfaceOrClippingObjects,'No unexplained architecture or equipment exclusion');
  assert.equal(visibility.sourceObjectsMoved,false);assert.equal(visibility.sourceObjectsMirrored,false);
  assert.equal(capture.environment?.sourceFloorGeometryRetained,true,'The actual source room floor receives the lighting');
  assert.equal(capture.environment.syntheticGroundPlaneEnabled,false,'No invented infinite ground plane replaces the original room');
  assert.equal(capture.nativePixelOutput?.upscaled,false,'The native output is never enlarged to manufacture 4K');
  const camera=capture.camera;
  assert.equal(camera.projection,'perspective');assert.equal(camera.frontAxis,'source +Y');assert.equal(camera.level,true);assert.equal(camera.singlePoint,true);
  assert.deepEqual(camera.up,[0,0,1],'Level original Z-up source camera');assert.deepEqual(camera.direction,[0,1,0]);
  assert.equal(camera.position[0],camera.target[0]);assert.equal(camera.position[2],camera.target[2]);assert(camera.position[1]<camera.target[1],'The original front view retains its single central axis');
  for(const [kind,image]of [['desktop',workspace.image],['mobile',workspace.image?.mobile]]){
    assert(image&&/^\/assets\/xr\/[a-zA-Z0-9._-]+\.webp$/.test(image.src),'Approved local workspace image');
    assert(Number.isInteger(image.width)&&Number.isInteger(image.height)&&Math.min(image.width,image.height)>=2160&&Math.max(image.width,image.height)>=3840,'Both native responsive captures have true 4K-class pixel dimensions');
    assert(kind==='desktop'?image.width>image.height:image.height>image.width,'Native captures retain the selected landscape and portrait compositions');
    assert.deepEqual(capture.nativePixelOutput[kind],[image.width,image.height],'Published pixels equal the actual native output');
    const pin=manifest.assets.find(asset=>'/'+asset.path===image.src);assert(pin&&pin.sha256===image.sha256&&pin.bytes===image.bytes,'Workspace record matches the approved derivative');
    const framing=camera[kind],proof=capture.verification?.[kind],alpha=proof?.alpha,shape=proof?.sourceShape;
    assert(framing&&proof&&alpha&&shape,`${kind}: native camera, pixel and original-shape receipts`);
    for(const key of ['projection','frontAxis','position','target','direction','up','level','singlePoint'])assert.deepEqual(framing[key],camera[key],`${kind}: source camera ${key}`);
    assert.deepEqual([framing.width,framing.height],[image.width,image.height]);
    assert.match(proof.nativePNGSHA256,/^[a-f0-9]{64}$/);assert.equal(proof.decodedRGBAExact,true);assert.equal(proof.decodedAlphaExact,true);
    assert.equal(alpha.total,image.width*image.height,'The native pixel receipt covers the whole output');
    for(const key of ['zero','opaque','intermediate','nonblackVisible'])assert(Number.isInteger(alpha[key])&&alpha[key]>0,`${kind}: real transparent, opaque, antialiased and visible pixels`);
    assert.equal(alpha.zero+alpha.opaque+alpha.intermediate,alpha.total);assert(alpha.nonblackVisible<=alpha.opaque+alpha.intermediate);
    assert.equal(alpha.allEdgesClear,true);assert.deepEqual(alpha.edgeVisiblePixels,{left:0,right:0,top:0,bottom:0},'The retained original room is fully inside the uncropped native output');
    assert.deepEqual(framing.actualAlphaSupport,alpha.support,'Requested composition cannot replace actual native alpha support');
    const [left,top,right,bottom]=alpha.support;
    assert(left>0&&top>0&&right>left&&bottom>top&&right<image.width&&bottom<image.height,'Real source alpha support remains inside the complete image');
    assert.equal(shape.sourceObjectCount,capture.sourceObjectTotal);assert.equal(proof.allSourceGeometryDataCRCUnchanged,true,'Every original CAD geometry CRC is unchanged after capture');
    assert.equal(shape.sceneGeometryDataCRCListSHA256,'c7276283bd2b7f9d24ed378c630360ecac2b1c4a968add2c8f62a001913e8294','All 4204 geometry CRCs match the independently inspected original scene');
    for(const key of ['originalTVVerticesExact','originalTVTopologyExact','originalTVUVsExact','originalTVMaterialAssignmentExact'])assert.equal(shape[key],true,`${kind}: preserve source TV ${key}`);
  }
  assert.equal(capture.lighting?.scheme,'SceneLighting','Source materials are lit without a white-model/AO replacement');
  assert.equal(capture.lighting.sourceOriginalLightsChanged,false);assert.equal(capture.lighting.temporaryCaptureLightsRemoved,true);
  assert.equal(capture.lighting.userOpenGLAAUnchanged,true);assert.equal(capture.lighting.displayProfileUpdated,false);assert.equal(capture.lighting.colourGradeApplied,false);
}

export async function auditPages() {
  const root = fileURLToPath(new URL('../', import.meta.url));
  const out = path.join(root, '.pages-workspace/out');
  const source=path.join(root,'roles/uiux-designer/cases/bending-active-thesis/release');
  const manifest = JSON.parse(await readFile(path.join(source,'manifest.json'), 'utf8'));
  const records={};
  for(const [name,revision]of [['story','storySHA256'],['introduction','introductionSHA256'],['xr-study','xrStudySHA256'],['xr-workspace','xrWorkspaceSHA256'],['contact','contactSHA256'],['project-studies','projectStudiesSHA256'],['project-assets','projectAssetsSHA256']]){
    const bytes=await readFile(path.join(source,`${name}.json`));
    assert.equal(digest(bytes),manifest[revision],`Approved ${name} source record`);records[name]=JSON.parse(bytes);
  }
  const expected = new Map(manifest.assets.map(asset => [asset.path, asset]));
  const projectImages=assertProjectStudies(records['project-studies'],manifest);
  const projectVideos=projectMotionMedia(records['project-studies']);
  assertProjectAssetRecord(records['project-assets'],projectImages,manifest,records['project-studies']);
  const files = [];
  async function walk(folder) {
    for (const entry of await readdir(folder, {withFileTypes: true})) {
      assert(!entry.isSymbolicLink(), 'No links in the deployment artifact');
      const file = path.join(folder, entry.name);
      if (entry.isDirectory()) await walk(file); else files.push(file);
    }
  }
  await walk(out);
  for (const file of files) {
    const relative = path.relative(out, file).replaceAll('\\', '/');
    assert(!/\.(3dm|psd|psb|ai|sql|map|private\.[^/]+)$|(^|\/)(content|research|verification|node_modules)\//i.test(relative), 'Private/editor artifact: ' + relative);
    const bytes = await readFile(file);
    if (relative.startsWith('assets/') || relative.startsWith('licenses/')) {
      const asset = expected.get(relative); assert(asset, 'Unapproved asset: ' + relative);
      assert.equal(bytes.length, asset.bytes);
      assert.equal(digest(bytes), asset.sha256, relative);
      const projectImage=projectImages.find(image=>image.src==='/'+relative);
      if(projectImage)assertProjectImage(bytes,projectImage);
      const projectModel=records['project-studies'].projects.find(project=>project.model?.src==='/'+relative)?.model;
      if(projectModel)assertProjectModel(bytes,projectModel);
      const projectVideo=projectVideos.find(media=>media.src==='/'+relative);
      if(projectVideo)assertProjectVideo(bytes,projectVideo);
      expected.delete(relative);
    }
    if (/\.(html|js|json|txt|css)$/.test(relative)) {
      const text = bytes.toString('utf8');
      assert(!/JosHsuan_Website|Window備份|portfolio-preparation|framing-hull\.private|@theatre\/studio|sourceObjectId|sourceGroups/.test(text), 'Private source information: ' + relative);
    }
  }
  assert.equal(expected.size, 0, 'Missing approved public assets');
  const typography=manifest.assets.find(asset=>'/'+asset.path===OCR_FONT),notice=manifest.assets.find(asset=>asset.path===OCR_NOTICE);
  assert(typography&&notice,'The actual OCR B derivative and original notices are both approved');
  assert.equal((await readFile(path.join(out,typography.path))).subarray(0,4).toString(),'wOF2','A real WOFF2 is published');
  const fontNotice=await readFile(path.join(out,OCR_NOTICE),'utf8');
  for(const text of ['Matthew Skala','Norbert Schwarz','0.3.1','Portfolio OCR B','without limitation','CC0'])assert(fontNotice.includes(text),`Original font notices: ${text}`);
  const displayTypography=manifest.assets.find(asset=>'/'+asset.path===DISPLAY_FONT),displayNotice=manifest.assets.find(asset=>asset.path===DISPLAY_NOTICE);
  assert(displayTypography&&displayNotice,'The actual Space Grotesk font and its original OFL are approved');
  assert.equal(displayTypography.sha256,'8e085aa438094f11487a836652edd5c054fa6a96f63fc7c282105ee3a4b08c07','Unmodified upstream Space Grotesk variable font');
  assert.equal((await readFile(path.join(out,displayTypography.path))).subarray(0,4).toString(),'wOF2','A real display WOFF2 is published');
  const displayFontNotice=await readFile(path.join(out,DISPLAY_NOTICE),'utf8');
  for(const text of ['Space Grotesk Project Authors','floriankarsten/space-grotesk','SIL Open Font License, Version 1.1','Reserved Font Name'])assert(displayFontNotice.includes(text),`Original display font notice: ${text}`);
  const css=(await Promise.all(files.filter(file=>file.endsWith('.css')).map(file=>readFile(file,'utf8')))).join('\n');
  assert(/@font-face\s*\{[^}]*font-family\s*:\s*["']?Portfolio OCR B["']?\s*;[^}]*\/assets\/fonts\/portfolio-ocr-b\.woff2/.test(css),'Built CSS uses the actual self-hosted OCR B face');
  assert(/@font-face\s*\{[^}]*font-family\s*:\s*["']?Space Grotesk["']?\s*;[^}]*\/assets\/fonts\/space-grotesk-variable\.woff2/.test(css),'Built CSS uses the actual self-hosted Space Grotesk face');
  assert(/--display\s*:\s*["']?Space Grotesk["']?\s*,\s*sans-serif/.test(css),'The display role names the actual Space Grotesk font');
  for(const token of ['sans','mono','serif'])assert(new RegExp(`--${token}\\s*:\\s*var\\(--ocr\\)`).test(css),`${token} retains OCR body/control ownership`);
  const loadedFaceFamilies=new Set([...css.matchAll(/@font-face\s*\{[^}]*font-family\s*:\s*([^;}]+)/g)].map(match=>match[1].trim().replaceAll(/["']/g,'')));
  assert.deepEqual([...loadedFaceFamilies].sort(),['Portfolio OCR B','Space Grotesk'],'Only the two approved website typefaces are declared');
  for(const [token,value]of Object.entries({
    'leading-display':1.12,'leading-heading':1.18,'leading-subheading':1.3,'leading-body':1.65,'leading-caption':1.55,'leading-control':1.4,'leading-label':1.45,
    'tracking-display':-.025,'tracking-subheading':-.015,'tracking-body':0,'tracking-caption':.01,'tracking-control':.02,'tracking-label':.06,
  })){
    const declared=css.match(new RegExp(`--type-${token}\\s*:\\s*([^;}]+)`))?.[1];
    assert.equal(Number.parseFloat(declared),value,`The reviewed ${token} project role value is retained`);
  }
  assert(!/IBM Plex|ibm-plex-[a-z-]+\.woff2|font-family\s*:\s*["']?(?:Arial|system-ui|Georgia|Times New Roman|Courier New)/i.test(css),'Built styles do not select a replaced type family');
  const auditTypography=(page,route)=>{
    for(const [font,family]of [[OCR_FONT,'Portfolio OCR B'],[DISPLAY_FONT,'Space Grotesk']]){
      // React can add an equivalent automatic preload without custom data.
      // Only the explicit marker is the document's required-family owner.
      const owners=[...page.matchAll(/<link\b[^>]*>/g)].map(match=>match[0]).filter(tag=>tagAttribute(tag,'href')===font&&tagAttribute(tag,'as')==='font'&&tagAttribute(tag,'data-site-font-family')===family);
      assert.equal(owners.length,1,`${route}: one explicit ${family} readiness declaration`);
      const [preload]=owners;
      assert(preload&&tagAttribute(preload,'type')==='font/woff2'&&/\bcrossorigin(?:=|[ >])/i.test(preload),`${route}: actual ${font} preload and CORS policy`);
      assert.equal(tagAttribute(preload,'data-site-font-family'),family,`${route}: explicit actual font readiness owner`);
    }
    assert(!/style="[^"]*font-family\s*:\s*(?:system-ui|Arial|Georgia|Times New Roman|Courier New)/i.test(page),`${route}: no inline replacement font`);
  };
  // Include every exported error-page alias as well as the six selected routes.
  // The custom 404 retains the same display/body roles as the six routes.
  for(const file of files.filter(file=>file.endsWith('.html')))auditTypography(await readFile(file,'utf8'),path.relative(out,file));
  const suppliedIntroduction=records.introduction;
  assert.equal(suppliedIntroduction.statement,INTRO_STATEMENT,'Exact owner-supplied introduction first sentence');
  assert.equal(suppliedIntroduction.description,INTRO_DESCRIPTION,'Exact owner-supplied introduction second sentence');
  const html = await readFile(path.join(out, 'index.html'), 'utf8');
  const auditBackground=(page,route)=>{
    assert.equal((page.match(/data-global-background(?:=|[ >])/g)||[]).length,1,`${route}: one shared backdrop`);
    assert.equal((page.match(/data-global-background-field(?:=|[ >])/g)||[]).length,1,`${route}: one shared 2D field`);
  };
  auditBackground(html,'/');
  assert(html.includes('Bending-Active')); assert(!html.includes('noindex'));
  assert.equal((html.match(/data-story-chapter=/g) || []).length, 0, 'Home must not scroll into a case');
  assert.equal((html.match(/<h1[ >]/g) || []).length, 1, 'One personal introduction heading');
  assert(html.includes('data-home-introduction'), 'Public introduction is present');
  assert(html.includes('data-home-project-link') && html.includes('href="#projects"'), 'Native introduction-to-project-index link');
  assert(!html.includes('data-cinematic-stage'), 'Home does not mount the case stage');
  const introduction=html.match(/<section id="about"[\s\S]*?<\/section>/)?.[0];
  assert(introduction&&!/model-poster|<canvas|data-project-model-preview/.test(introduction), 'Home introduction stays model-free');
  assert.equal((html.match(/data-project-card=/g)||[]).length,2+PROJECT_SLUGS.length,'The two existing and six newly selected evidence-backed projects');
  assert.equal((html.match(/data-site-preview-required(?:=|[ >])/g)||[]).length,1,'Home declares its live card before component effects');
  assert(html.includes('data-project-grid-cells="9"'),'Five projects occupy the existing minimum nine-cell index');
  assert(html.includes('data-home-scroll-window="introduction"'),'Home declares its material scrolling owner');
  for(const route of ['', 'about/']){
    const page=await readFile(path.join(out,route,'index.html'),'utf8');
    assert(page.includes(INTRO_STATEMENT)&&page.includes(INTRO_DESCRIPTION),`${route||'/'}: exact public introduction`);
    assert(page.includes('data-introduction-statement')&&page.includes('data-introduction-description'),`${route||'/'}: visible introduction owners`);
  }
  assert(html.includes(suppliedIntroduction.metadataTitle)&&html.includes(suppliedIntroduction.metadataDescription),'Home metadata follows the supplied design-technology direction');
  for(const route of ['about','projects','contact','projects/bending-active','projects/xr-bending-active',...PROJECT_SLUGS.map(slug=>`projects/${slug}`)]){
    const page=await readFile(path.join(out,route,'index.html'),'utf8');
    auditBackground(page,route);
    assert.equal((page.match(/<h1[ >]/g)||[]).length,1,`${route}: one heading`);
    assert(!page.includes('noindex'),route);
    assert(page.includes(`${manifest.origin}/${route}/`),`${route}: canonical`);
    if(route==='projects/bending-active')assert.equal((page.match(/data-story-chapter=/g)||[]).length,7);
    else {
      assert(!page.includes('data-cinematic-stage'),`${route}: no case runtime stage`);
      if(route!=='projects')assert(!page.includes('/assets/cinematic/model-poster'),`${route}: no unrelated Bending model`);
    }
  }
  const sitemap=await readFile(path.join(out,'sitemap.xml'),'utf8');
  for(const project of records['project-studies'].projects){
    const route=`/projects/${project.slug}/`,page=await readFile(path.join(out,route.slice(1),'index.html'),'utf8');
    assert(html.includes(`data-project-card="${project.id}"`)&&html.includes(`href="${route}"`),'Selected project has a real Home card');
    assert(sitemap.includes(manifest.origin+route),'Selected project is discoverable in the sitemap');
    assert.equal(tagAttribute(tagWith(page,'main','data-project-study'),'data-project-study'),project.id);
    assert.equal(markerCount(page,'data-project-chapter'),6,'Opening, four actual chapters and credits');
    assert.equal(markerCount(page,'data-project-chapter-link'),6,'Every chapter has a native direct link');
    for(const group of ['identity','chapter-navigation','reading-controls'])assert.equal((page.match(new RegExp(`data-liquid-glass="${group}"`,'g'))??[]).length,1,'One shared study control group: '+group);
    assert(page.includes(project.title)&&page.includes(project.role),'Actual title and individual/team role');
    for(const credit of project.credits)assert(page.includes(credit.names.replaceAll('&','&amp;')),'Preserved source credit: '+credit.names);
    for(const image of [project.hero,...project.sections.flatMap(section=>section.media)])assert(page.includes(image.src),'Source image stays readable in the native document');
    const nativeMotionTags=[...page.matchAll(/<video\b[^>]*\bdata-project-motion-media(?:=|[\s>])[^>]*>/g)].map(match=>match[0]);
    assert.equal(nativeMotionTags.length,project.motionMedia?.length??0,'Only selected authentic sequences enter the native document');
    for(const media of project.motionMedia??[]){
      const tag=nativeMotionTags.find(tag=>tagAttribute(tag,'data-project-motion-id')===media.id);
      assert(tag,'Each selected sequence has its own native player');
      assert.equal(tagAttribute(tag,'data-project-video-src'),media.src);
      assert.equal(tagAttribute(tag,'src'),null,'Runtime policy owns movie acquisition; no initial automatic source');
      assert.equal(Number(tagAttribute(tag,'width')),media.width);assert.equal(Number(tagAttribute(tag,'height')),media.height);
      assert.equal(/\bloop(?:=|[\s>])/.test(tag),media.loop,'Finite source semantics are preserved');
      assert(page.includes(media.poster.src)&&page.includes(`href="${media.src}"`),'Pinned poster and direct no-JavaScript animation link remain available');
    }
    assert(!page.includes('data-xr-stage')&&!page.includes('data-cinematic-stage'),'Documentary evidence does not acquire an unrelated 3D scene');
  }
  const xr=await readFile(path.join(out,'projects/xr-bending-active/index.html'),'utf8');
  for(const marker of ['data-xr-study','xr-context','xr-method','xr-prototype','xr-making','xr-credits','Wataru Nomura'])assert(xr.includes(marker),`XR: ${marker}`);
  for(const removed of ['xr-contribution','xr-limits'])assert(!xr.includes(`id="${removed}"`)&&!xr.includes(`href="#${removed}"`),`XR removed section: ${removed}`);
  const study=records['xr-study'],workspace=records['xr-workspace'];
  assertXRWorkspaceRecord(workspace,manifest);
  assert(xr.includes('data-xr-opening="true"')&&!xr.includes('data-xr-opening-visual')&&!xr.includes('data-xr-hero'),'XR opens with its native introduction and no removed opening photograph');
  assert(!xr.includes(study.hero.src),'The former XR opening photograph is absent from the case document');
  const picture=[...xr.matchAll(/<picture\b[^>]*>[\s\S]*?<\/picture>/g)].map(match=>match[0]).find(tag=>tag.includes('data-xr-workspace-visual'));
  assert(picture,'Context has its own full-workspace responsive picture');
  const workspaceImage=tagWith(picture,'img','data-xr-workspace-visual');
  assert.equal(markerCount(xr,'data-xr-workspace-visual'),1,'One full-viewport workspace image owner');
  assert.equal(tagAttribute(workspaceImage,'src'),workspace.image.src);assert.equal(Number(tagAttribute(workspaceImage,'width')),workspace.image.width);assert.equal(Number(tagAttribute(workspaceImage,'height')),workspace.image.height);
  assert(/\bdata-site-critical(?:=|[ >])/.test(workspaceImage),'Real workspace decoding participates in page readiness');
  assert(picture.includes('media="(max-width:799px)"')&&new RegExp(`srcset="${workspace.image.mobile.src.replaceAll('.','\\.')}"`,'i').test(picture),'Portrait capture is selected natively on narrow viewports');
  for(const image of [workspace.image,workspace.image.mobile]){
    assert(image&&/^\/assets\/xr\/[a-zA-Z0-9._-]+\.webp$/.test(image.src));
    assert(Number.isInteger(image.width)&&image.width>0&&Number.isInteger(image.height)&&image.height>0);
    const pin=manifest.assets.find(asset=>'/'+asset.path===image.src);assert(pin&&pin.sha256===image.sha256&&pin.bytes===image.bytes,'Workspace record matches the published approved derivative');
    assertXRWorkspaceImage(await readFile(path.join(out,pin.path)),image);
  }
  for(const chapter of ['overview','context','method','adapt','assemble','join','making','credits'])assert.equal((xr.match(new RegExp(`data-xr-chapter="${chapter}"`,'g'))??[]).length,1,`One native XR chapter: ${chapter}`);
  assert.equal(markerCount(xr,'data-xr-chapter-link'),8,'Every native XR chapter remains directly navigable');
  assert.equal(markerCount(xr,'data-project-section-label'),9,'Opening and all eight section labels use the shared glyph/label API');
  assert.equal((xr.match(/data-glyph-kind=/g)??[]).length,9,'Every section label retains its readable glyph');
  assert.equal(markerCount(xr,'data-xr-evidence'),8,'Only the opening photograph is removed from the original nine evidence figures');
  for(const group of ['identity','chapter-navigation','reading-controls'])assert.equal((xr.match(new RegExp(`data-liquid-glass="${group}"`,'g'))??[]).length,1,`One shared XR glass group: ${group}`);
  const bending=await readFile(path.join(out,'projects/bending-active/index.html'),'utf8');
  assert.equal(tagAttribute(tagWith(xr,'header','data-page-masthead'),'class'),tagAttribute(tagWith(bending,'header','data-page-masthead'),'class'),'XR and Bending use the same maintained masthead class');
  const bendingRail=tagAttribute(tagWith(bending,'nav','data-story-navigation'),'class');
  assert(tagAttribute(tagWith(xr,'nav','data-xr-chapter-navigation'),'class').split(/\s+/).includes(bendingRail),'XR keeps the original shared chapter-rail class');
  for(const marker of ['data-xr-stage','data-xr-chapter','data-xr-model-control','data-information-window','data-xr-native-phone',study.model.poster.src,'adapt-interface.mp4','assemble-interface.mp4','join-interface.mp4'])assert(xr.includes(marker),`XR immersive integration: ${marker}`);
  assert(!xr.includes('data-phone-front-toggle')&&!xr.includes('data-phone-stage='),'XR recording chapters must not depend on view/stage buttons');
  assert(!xr.includes('<details'),'XR core evidence remains directly readable');
  const modelPin=manifest.assets.find(asset=>'/'+asset.path===study.model.src);
  assert(modelPin&&modelPin.sha256===study.model.sha256,'XR main source model must match the approved asset');
  const release=JSON.parse(await readFile(path.join(out,'release.json'),'utf8'));
  assert.equal(release.release,manifest.id);assert.match(release.commit,/^[a-f0-9]{40}$/,'Public source commit');
  assert.equal(release.storyRevision,manifest.storySHA256);assert.equal(release.introductionRevision,manifest.introductionSHA256,'Public exact-introduction revision');
  assert.equal(release.xrModelRevision,study.model.sha256,'Public XR model revision');
  assert.equal(release.xrStudyRevision,manifest.xrStudySHA256,'Public XR narrative revision');
  assert.equal(release.xrWorkspaceRevision,manifest.xrWorkspaceSHA256,'Public complete-workspace capture revision');
  assert.equal(release.projectStudiesRevision,manifest.projectStudiesSHA256,'Public selected-project narrative revision');
  assert.equal(release.projectAssetsRevision,manifest.projectAssetsSHA256,'Public image provenance revision');
  assert.equal(release.typography,'Portfolio OCR B');assert.equal(release.typographyRevision,typography.sha256);assert.equal(release.typographyNoticeRevision,notice.sha256);
  assert.equal(release.displayTypography,'Space Grotesk');assert.equal(release.displayTypographyRevision,displayTypography.sha256);assert.equal(release.displayTypographyNoticeRevision,displayNotice.sha256);
  assert.equal(release.diagramRevision,manifest.assets.find(asset=>asset.path==='assets/thesis/source-diagrams.glb').sha256,'Protected source diagram revision');
  assert.equal(release.modelRevision,manifest.assets.find(asset=>asset.path==='assets/source-layers.glb').sha256,'Protected original Bending model revision');
  const missing=await readFile(path.join(out,'404.html'),'utf8');assert(missing.includes('data-portfolio-section="not-found"')&&missing.includes('This page is not available.')&&missing.includes('href="/"'),'The exported 404 uses the shared OCR/native navigation document');
  assert(html.includes('https://joshsuan.github.io/'));
  console.log(`Public release audit passed: ${files.length} output files, ${manifest.assets.length} approved assets; no private inputs.`);
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await auditPages();
