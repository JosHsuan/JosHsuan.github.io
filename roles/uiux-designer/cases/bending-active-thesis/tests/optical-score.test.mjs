import test from 'node:test';
import assert from 'node:assert/strict';
import {PerspectiveCamera} from 'three';
import {axialFocusRange, focalLengthForFov, sampleOpticalScore} from '../components/optical-score.mjs';
import {createServer} from 'node:http';
import {readFile, mkdir, writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const bounds = {min: [-1, 0, -2], max: [1, 1, 2]};
const pose = {position: [0, .5, 8], target: [0, .5, 0], near: .01, far: 30, fov: 38};
const score = (chapter, phase = .5, extra = {}) => sampleOpticalScore({stageU: (chapter + .5) / 7, visualU: (chapter + phase) / 7, aspect: 1.6, ...extra}, pose, {bounds});

test('focal-length convention preserves requested vertical FOV on landscape and portrait sensors', () => {
  for (const aspect of [.5, 1, 1.6, 2.4]) {
    const camera = new PerspectiveCamera(38, aspect, .01, 30);
    camera.filmGauge = 35; camera.setFocalLength(focalLengthForFov(38, aspect));
    assert.ok(Math.abs(camera.fov - 38) < 1e-10);
  }
});

test('focus is positive axial depth, including off-axis geometry', () => {
  assert.deepEqual(axialFocusRange(pose, bounds), [6, 10]);
  assert.deepEqual(axialFocusRange(pose, {min: [200, 0, -2], max: [202, 1, 2]}), [6, 10]);
  assert.throws(() => axialFocusRange({...pose, target: pose.position}, bounds), /must differ/);
});

test('stationary SYSTEM hold racks real focus while camera and focal length stay fixed', () => {
  const early = score(2, .25), late = score(2, .65);
  assert.notEqual(early.focusDistanceM, late.focusDistanceM);
  assert.equal(early.focalLengthMm, late.focalLengthMm);
  assert.ok(early.focusDistanceM >= 6 && late.focusDistanceM <= 10);
  assert.ok(early.apertureScale > 0 && early.maxBlurPx > 0);
});

test('lens selection changes independently of a fixed pose and evidence holds stay sharp', () => {
  assert.notEqual(score(1).focalLengthMm, score(3).focalLengthMm);
  for (const i of [1, 5, 6]) {assert.equal(score(i).maxBlurPx, 0); assert.equal(score(i).asciiWeight, 0);}
  assert.ok(score(3).asciiWeight >= .15 && score(3).asciiWeight <= .28);
});

test('reduced motion removes optical and glyph motion; sampling is deterministic and reversible', () => {
  for (let i = 0; i < 7; i++) {
    const reduced = score(i, .4, {reducedMotion: true});
    assert.equal(reduced.apertureScale, 0); assert.equal(reduced.maxBlurPx, 0); assert.equal(reduced.asciiWeight, 0); assert.equal(reduced.veil, 0);
    assert.deepEqual(score(i), score(i));
  }
  const forward = Array.from({length: 101}, (_, i) => sampleOpticalScore({stageU: i / 100, visualU: i / 100, aspect: 1.6}, pose, {bounds}));
  const reverse = Array.from({length: 101}, (_, i) => sampleOpticalScore({stageU: (100 - i) / 100, visualU: (100 - i) / 100, aspect: 1.6}, pose, {bounds})).reverse();
  assert.deepEqual(forward, reverse);
});

test('actual WebGL rear-layer depth focus, cell glyphs and black-mist radiance/alpha', {skip: process.env.OPTICAL_BROWSER !== '1'}, async () => {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../..');
  const require = createRequire(path.join(root, 'package.json'));
  const engine = process.env.OPTICAL_ENGINE === 'webkit' ? 'webkit' : 'chromium';
  const browserType = require('@playwright/test')[engine];
  const sources = new Map([
    ['/three.module.js', await readFile(path.join(root, 'node_modules/three/build/three.module.js'))],
    ['/three.core.js', await readFile(path.join(root, 'node_modules/three/build/three.core.js'))],
    ['/compositor.mjs', await readFile(new URL('../components/scene-compositor.mjs', import.meta.url))],
  ]);
  // Explicit diagnostic-only A/B: serve a saved baseline without touching the
  // runtime module, scene controls, resolution or normal pixel assertions.
  if (process.env.OPTICAL_BASELINE_COMPOSITOR) sources.set('/compositor-baseline.mjs', await readFile(process.env.OPTICAL_BASELINE_COMPOSITOR));
  const html = `<!doctype html><html><head><style>html,body{margin:0;background:#101314}canvas{display:block}</style><script type="importmap">{"imports":{"three":"/three.module.js"}}</script></head><body><script type="module">
  import * as T from 'three'; import {createSceneCompositor} from '/compositor.mjs';
  const gl=new T.WebGLRenderer({alpha:true,antialias:false,premultipliedAlpha:true}); gl.setSize(512,320); gl.setPixelRatio(1); gl.setClearColor(0,0); gl.toneMapping=T.ACESFilmicToneMapping; gl.outputColorSpace=T.SRGBColorSpace; document.body.append(gl.domElement);
  const scene=new T.Scene(), camera=new T.PerspectiveCamera(40,1.6,.1,30); camera.position.z=7; camera.lookAt(0,0,0); camera.updateMatrixWorld();
  const data=new Uint8Array(64*64*4); for(let y=0;y<64;y++)for(let x=0;x<64;x++){const i=(y*64+x)*4,c=(x+y)%2?245:15;data.set([c,c,c,255],i);}
  const texture=new T.DataTexture(data,64,64); texture.magFilter=T.NearestFilter;texture.minFilter=T.NearestFilter;texture.needsUpdate=true;
  const material=new T.MeshStandardMaterial({map:texture,roughness:1,metalness:0});
  const front=new T.Mesh(new T.PlaneGeometry(1.4,2),material),back=new T.Mesh(new T.PlaneGeometry(2.52,3.6),material); front.position.set(-.9,0,2);back.position.set(1.62,0,-2);scene.add(front,back);
  const light=new T.DirectionalLight(0xffffff,2);light.position.set(0,0,7);scene.add(light);scene.add(new T.AmbientLight(0xffffff,.2));
  const compositor=createSceneCompositor(gl);const settings={focusDistanceM:5,apertureScale:120,maxBlurPx:9,asciiWeight:0,asciiCellPx:11,asciiBlend:'screen-limited',asciiTint:[.2,.9,.6],veil:0};
  const pixels=()=>{const p=new Uint8Array(512*320*4);gl.getContext().readPixels(0,0,512,320,gl.getContext().RGBA,gl.getContext().UNSIGNED_BYTE,p);return p;};
  function gradient(p,x0,x1){let d=0,n=0;for(let y=90;y<230;y++)for(let x=x0;x<x1;x++){const i=(y*512+x)*4;d+=Math.abs(p[i]-p[i+4]);n++;}return d/n;}
  const diff=(a,b,x0,x1)=>{let d=0;for(let y=70;y<250;y++)for(let x=x0;x<x1;x++){const i=(y*512+x)*4;d+=Math.abs(a[i]-b[i])+Math.abs(a[i+1]-b[i+1])+Math.abs(a[i+2]-b[i+2]);}return d;};
  function draw(overrides={},rects=[],options={}){compositor.render(scene,camera,{...settings,overrides},{width:512,height:320,dpr:1,protectedRects:rects,...options});return pixels();}
  let bright=null;
  window.fixture={draw,light,compositor,resources(){
    draw({maxBlurPx:9,asciiWeight:0,fieldWeight:.3,mistStrength:.3});
    const full=compositor.inspect(),fullTextures=gl.info.memory.textures;
    draw({maxBlurPx:9,asciiWeight:0,fieldWeight:.3,mistStrength:0,asciiCellPx:8});
    const light=compositor.inspect(),lightTextures=gl.info.memory.textures;
    draw({maxBlurPx:9,asciiWeight:0,fieldWeight:.3,mistStrength:0,asciiCellPx:18});
    const changedCell=compositor.inspect(),changedTextures=gl.info.memory.textures;
    gl.setPixelRatio(.4);
    compositor.render(scene,camera,{...settings,maxBlurPx:9,apertureScale:120},{width:512,height:320,dpr:.4,requestedDpr:1.25,samples:0});
    const bounded=compositor.inspect();
    gl.setPixelRatio(1);
    return {full,light,changedCell,bounded,fullTextures,lightTextures,changedTextures};
  },async compareBaseline(){
    const {createSceneCompositor:createBaseline}=await import('/compositor-baseline.mjs');
    const baseline=createBaseline(gl), reports=[];
    const scenarios=[
      {name:'plain',controls:{maxBlurPx:0}},
      {name:'opaque-background-focus',background:0x14201f,controls:{focusDistanceM:9}},
      {name:'depth-focus',controls:{focusDistanceM:9}},
      {name:'scene-glyphs',controls:{maxBlurPx:0,asciiWeight:1}},
      {name:'mist',controls:{mistStrength:.55,mistRadiusPx:32}},
      {name:'field-background',controls:{maxBlurPx:0,fieldWeight:.55,fieldTime:4}},
      {name:'field-pointer',controls:{maxBlurPx:0,fieldWeight:.55,fieldTime:4,fieldPointerUv:[.5,.5],fieldPointerStrength:1}},
      {name:'full-field-optics',controls:{fieldWeight:.3,fieldTime:4,mistStrength:.3,asciiWeight:.3}},
      {name:'light-field',samples:0,controls:{maxBlurPx:0,apertureScale:0,asciiWeight:0,mistStrength:0,fieldWeight:.3}},
    ];
    const render=(which,item)=>{scene.background=item.background?new T.Color(item.background):null;which.render(scene,camera,{...settings,...item.controls},{width:512,height:320,dpr:1,samples:item.samples??2,protectedRects:item.rects??[]});return pixels();};
    const hash=async bytes=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),v=>v.toString(16).padStart(2,'0')).join('');
    try {
      for(const item of scenarios){
        const before=render(baseline,item),after=render(compositor,item);let maxByteDifference=0,changedChannels=0,totalDifference=0;
        for(let i=0;i<before.length;i++){const d=Math.abs(before[i]-after[i]);maxByteDifference=Math.max(maxByteDifference,d);totalDifference+=d;if(d)changedChannels++;}
        reports.push({name:item.name,maxByteDifference,changedChannels,meanByteDifference:totalDifference/before.length,baselineSHA256:await hash(before),optimizedSHA256:await hash(after)});
      }
      // Explicit readback fences each timed fixture frame. This benchmark is
      // diagnostic and never reachable through ordinary compositor.inspect().
      const rounds=[];
      for(const timed of [scenarios[7],scenarios[8]])for(let round=0;round<4;round++){
        for(const [name,which] of round%2?[['optimized',compositor],['baseline',baseline]]:[['baseline',baseline],['optimized',compositor]]){
          for(let i=0;i<3;i++)render(which,timed);
          const started=performance.now();for(let i=0;i<12;i++)render(which,timed);
          rounds.push({profile:timed.name,round,name,millisecondsPerFrame:(performance.now()-started)/12});
        }
      }
      return {width:512,height:320,reports,rounds,readback:'explicit fixture fence; runtime inspection stays CPU-only'};
    }finally{baseline.dispose();}
  },run(){
    const near=draw({focusDistanceM:5}),far=draw({focusDistanceM:9});
    const clean=draw({maxBlurPx:0}),glyphs=draw({maxBlurPx:0,asciiWeight:1});
    const masked=draw({maxBlurPx:0,asciiWeight:1},[[0,0,.5,1]]);
    light.intensity=.05; const darkClean=draw({maxBlurPx:0}),darkGlyphs=draw({maxBlurPx:0,asciiWeight:1}); light.intensity=2;
    const result={near:{front:gradient(near,132,219),back:gradient(near,292,379)},far:{front:gradient(far,132,219),back:gradient(far,292,379)},glyphDifference:diff(clean,glyphs,100,410),obsoleteMaskDifference:diff(glyphs,masked,100,235),unprotectedDifference:diff(clean,masked,285,410),darkGlyphDifference:diff(darkClean,darkGlyphs,100,410),cornerAlpha:near[3],subjectAlpha:near[(160*512+177)*4+3],diagnostics:compositor.inspect()};
    draw({focusDistanceM:5,asciiWeight:.45});return result;
  },runMist(){
    front.visible=back.visible=false;
    bright=new T.Mesh(new T.PlaneGeometry(.12,.9),new T.MeshBasicMaterial({color:new T.Color(4,3,2)}));scene.add(bright);
    scene.background=new T.Color(0,0,0);
    const controls={maxBlurPx:0,asciiWeight:0,mistStrength:.55,mistRadiusPx:32,mistThreshold:.65};
    const clean=draw({...controls,mistStrength:0});
    const off=window.fixture.compositor.inspect();
    gl.render(scene,camera);const direct=pixels();
    let displayDifference=0;for(let y=145;y<175;y++)for(let x=254;x<258;x++)for(let c=0;c<3;c++){const i=(y*512+x)*4+c;displayDifference=Math.max(displayDifference,Math.abs(clean[i]-direct[i]));}
    const mist=draw(controls),on=window.fixture.compositor.inspect();
    const masked=draw(controls,[[0,0,1,1]]);
    const haloDifference=diff(clean,mist,264,283);
    let farBlackMaximum=0;for(let y=0;y<80;y++)for(let x=0;x<80;x++)for(let c=0;c<3;c++)farBlackMaximum=Math.max(farBlackMaximum,mist[(y*512+x)*4+c]);
    bright.material.color.setRGB(.03,.03,.03);
    const dimClean=draw({...controls,mistStrength:0}),dimMist=draw(controls);
    const dimHaloDifference=diff(dimClean,dimMist,264,283);
    bright.material.color.setRGB(4,3,2);scene.background=null;
    const transparentClean=draw({...controls,mistStrength:0}),transparentMist=draw(controls);
    let haloAlphaBefore=0,haloAlphaAfter=0;for(let y=145;y<175;y++)for(let x=264;x<283;x++){const i=(y*512+x)*4+3;haloAlphaBefore=Math.max(haloAlphaBefore,transparentClean[i]);haloAlphaAfter=Math.max(haloAlphaAfter,transparentMist[i]);}
    return {haloDifference,dimHaloDifference,farBlackMaximum,obsoleteMaskDifference:diff(mist,masked,100,410),displayDifference,haloAlphaBefore,haloAlphaAfter,cornerAlpha:transparentMist[3],coreAlpha:transparentMist[(160*512+256)*4+3],off,on};
  },endMist(){
    scene.remove(bright);bright.geometry.dispose();bright.material.dispose();bright=null;front.visible=back.visible=true;scene.background=null;
  },runSeparatedField(){
    const options={independentField:true};
    const controls={maxBlurPx:0,apertureScale:0,asciiWeight:0,mistStrength:0,fieldWeight:.55,fieldTime:0,fieldEnvelope:[.5,.5,.45,.48],fieldSurfaceGain:.24};
    scene.background=null;front.visible=back.visible=false;
    const empty=draw(controls,[],options);
    let emptyMaximum=0;for(const value of empty)emptyMaximum=Math.max(emptyMaximum,value);
    front.visible=back.visible=true;
    const clean=draw({...controls,fieldWeight:0},[],options),source=draw(controls,[],options);
    const decorativeChange=draw({...controls,fieldTime:4,fieldPointerUv:[.5,.5],fieldPointerStrength:1},[],options);
    let addedOutsideCoverage=0;for(let i=3;i<clean.length;i+=4)if(clean[i]===0&&source[i]>0)addedOutsideCoverage++;
    light.intensity=.05;
    const dimClean=draw({...controls,fieldWeight:0},[],options),dimSource=draw(controls,[],options);
    light.intensity=2;
    return {emptyMaximum,addedOutsideCoverage,sourceDifference:diff(clean,source,100,410),dimSourceDifference:diff(dimClean,dimSource,100,410),decorativeDifference:diff(source,decorativeChange,0,512),diagnostics:compositor.inspect()};
  },runField(){
    front.visible=back.visible=false;
    const controls={maxBlurPx:0,asciiWeight:0,mistStrength:0,fieldWeight:.55,fieldTime:0,fieldEnvelope:[.5,.5,.45,.48],fieldSceneMix:.35,semanticFeatherPx:36};
    const empty=draw({...controls,fieldWeight:0}),a=draw(controls),b=draw({...controls,fieldTime:4});
    const pointer=draw({...controls,fieldTime:4,fieldPointerUv:[.5,.5],fieldPointerStrength:1});
    const masked=draw({...controls,fieldTime:4,foregroundMix:1},[[.25,.25,.75,.75]]);
    let fieldAlpha=0,coreAlpha=0;for(let y=0;y<320;y++)for(let x=0;x<512;x++){const i=(y*512+x)*4+3;fieldAlpha+=a[i];if(x>=140&&x<=370&&y>=90&&y<=230)coreAlpha=Math.max(coreAlpha,masked[i]);}
    const missing=draw({...controls,foregroundMix:1});let missingAlpha=0;for(let i=3;i<missing.length;i+=4)missingAlpha=Math.max(missingAlpha,missing[i]);
    front.visible=back.visible=true;
    const cleanSurface=draw({...controls,fieldTime:4,fieldWeight:0});
    const fullSurface=draw({...controls,fieldTime:4,fieldSurfaceGain:1});
    const quietSurface=draw({...controls,fieldTime:4,fieldSurfaceGain:.24});
    const regionDiff=(a,b,x0,x1,y0,y1,brightOnly=false)=>{let sum=0;for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const pixel=(y*512+x)*4;if(brightOnly&&a[pixel]<128)continue;for(let c=0;c<4;c++){const i=pixel+c;sum+=Math.abs(a[i]-b[i]);}}return sum;};
    const fullSurfaceDifference=regionDiff(cleanSurface,fullSurface,150,200,110,210,true);
    const quietSurfaceDifference=regionDiff(cleanSurface,quietSurface,150,200,110,210,true);
    const backgroundAttenuationDifference=regionDiff(fullSurface,quietSurface,0,90,100,220);
    material.color.setScalar(.00001);
    const darkStageFull=draw({...controls,fieldTime:4,fieldSurfaceGain:1}),darkStageQuiet=draw({...controls,fieldTime:4,fieldSurfaceGain:.24});
    const darkSurfaceAttenuationDifference=regionDiff(darkStageFull,darkStageQuiet,150,200,110,210);
    material.color.setScalar(1);
    const sourceMasked=draw({...controls,fieldWeight:0,foregroundMix:1},[[0,0,.5,1]]);
    let sourceCoreAlpha=0;for(let y=100;y<220;y++)for(let x=132;x<219;x++)sourceCoreAlpha=Math.max(sourceCoreAlpha,sourceMasked[(y*512+x)*4+3]);
    return {fieldAlpha,appearance:diff(empty,a,0,512),timeDifference:diff(a,b,0,512),pointerDifference:diff(b,pointer,0,512),coreAlpha,missingAlpha,sourceCoreAlpha,fullSurfaceDifference,quietSurfaceDifference,backgroundAttenuationDifference,darkSurfaceAttenuationDifference,diagnostics:compositor.inspect()};
  }};
  </script></body></html>`;
  const server = createServer((req, res) => {const source = sources.get(req.url); res.writeHead(200, {'Content-Type': source ? 'text/javascript' : 'text/html'}); res.end(source ?? html);});
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await browserType.launch({headless: true});
  try {
    const page = await browser.newPage({viewport: {width: 512, height: 320}}), errors = [];
    page.on('pageerror', error => errors.push(error.message)); page.on('console', msg => {if (msg.type() === 'error') errors.push(msg.text());});
    await page.goto(`http://127.0.0.1:${server.address().port}/`); await page.waitForFunction(() => window.fixture);
    const result = await page.evaluate(() => window.fixture.run());
    assert.deepEqual(errors, [], 'Shader compilation and browser errors');
    assert.ok(result.near.front > result.far.front * 1.2, JSON.stringify(result));
    assert.ok(result.far.back > result.near.back * 1.2, JSON.stringify(result));
    assert.ok(result.glyphDifference > 10000); assert.equal(result.obsoleteMaskDifference, 0); assert.ok(result.unprotectedDifference > 1000);
    assert.notEqual(result.darkGlyphDifference, result.glyphDifference, 'Glyph result must respond to actual light/radiance');
    assert.equal(result.cornerAlpha, 0); assert.equal(result.subjectAlpha, 255);
    const work = process.env.OPTICAL_WORKDIR ?? 'D:/JosHsuan_Website/_work/bending-active-thesis/round-07/verification/optics';
    await mkdir(work, {recursive: true}); await page.screenshot({path: path.join(work, 'optical-fixture-' + engine + '.png')});
    const mist = await page.evaluate(() => window.fixture.runMist());
    assert.deepEqual(errors, [], 'Mist shader compilation and browser errors');
    assert.ok(mist.haloDifference > 10000, JSON.stringify(mist));
    assert.equal(mist.dimHaloDifference, 0, 'Below-threshold source does not create a highlight halo');
    assert.equal(mist.farBlackMaximum, 0, 'No unrelated black lift');
    assert.equal(mist.obsoleteMaskDifference, 0, 'Rear Canvas ignores obsolete foreground rectangle inputs');
    assert.ok(mist.displayDifference <= 1, 'No-effect output matches direct one-transform rendering');
    assert.equal(mist.haloAlphaBefore, 0); assert.ok(mist.haloAlphaAfter > 0, 'Real highlight scatter grows coverage');
    assert.equal(mist.cornerAlpha, 0); assert.equal(mist.coreAlpha, 255);
    assert.equal(mist.off.passes, 2); assert.equal(mist.on.passes, 4); assert.equal(mist.on.outputTransformCount, 1);
    assert.deepEqual(mist.on.mist.resolution, [128, 80]);
    // Publish this last offscreen/composited frame before the browser screenshot.
    // WebKit may otherwise capture its preceding presentation surface even while
    // synchronous readPixels above already contains the correct new frame.
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => {
      window.fixture.draw({maxBlurPx: 0, asciiWeight: 0, mistStrength: .55, mistRadiusPx: 32, mistThreshold: .65});
      requestAnimationFrame(resolve);
    })));
    await page.screenshot({path: path.join(work, 'optical-mist-fixture-' + engine + '.png')});
    console.log('Optical WebGL evidence', JSON.stringify(result));
    console.log('Black-mist WebGL evidence', JSON.stringify(mist));
    await writeFile(path.join(work, 'optical-fixture-' + engine + '.json'), JSON.stringify({verifiedAt: new Date().toISOString(),engine,threeVersion: JSON.parse(await readFile(path.join(root, 'node_modules/three/package.json'), 'utf8')).version,errors,optical: result,mist,scope: 'Actual 512x320 synthetic WebGL optical fixture; no physical-phone performance or source-material appearance claim'}, null, 2) + '\n');
    await page.evaluate(() => window.fixture.endMist());
    const field = await page.evaluate(() => window.fixture.runField());
    assert.deepEqual(errors, [], 'Autonomous field shader compilation and browser errors');
    assert.ok(field.fieldAlpha > 0 && field.appearance > 1000, 'Autonomous glyph field exists without any source mesh');
    assert.ok(field.timeDifference > 1000, 'Fixed-camera glyph field evolves with caller time');
    assert.ok(field.pointerDifference > 100, 'Pointer interference changes the coherent field');
    assert.ok(field.coreAlpha > 0); assert.equal(field.sourceCoreAlpha, 255, 'Rear source geometry stays whole without semantic cutouts');
    assert.ok(field.missingAlpha > 0, 'Rear field stays visible without semantic rectangle measurements');
    assert.ok(field.fullSurfaceDifference > 1000 && field.quietSurfaceDifference < field.fullSurfaceDifference * .5, 'Surface field is visibly attenuated');
    assert.equal(field.backgroundAttenuationDifference, 0, 'Clear background field retains its exact output');
    assert.equal(field.darkSurfaceAttenuationDifference, 0, 'Dark editorial stage retains its exact field output');
    assert.equal(field.diagnostics.passes, 2); assert.equal(field.diagnostics.layering.position, 'rear'); assert.equal(field.diagnostics.layering.semanticMask, false); assert.equal(field.diagnostics.outputTransformCount, 1);
    await writeFile(path.join(work, 'autonomous-field-fixture-' + engine + '.json'), JSON.stringify({verifiedAt:new Date().toISOString(),engine,field,errors}, null, 2) + '\n');
    console.log('Autonomous field WebGL evidence', JSON.stringify(field));
    const separated=await page.evaluate(()=>window.fixture.runSeparatedField());
    assert.deepEqual(errors,[],'Separated source-field shader compilation and browser errors');
    assert.equal(separated.emptyMaximum,0,'The GL surface remains wholly transparent without scene geometry');
    assert.equal(separated.addedOutsideCoverage,0,'Source-derived glyphs never fill pixels outside actual scene coverage');
    assert.ok(separated.sourceDifference>1000,'Retained GL glyph response remains visible on real scene radiance');
    assert.notEqual(separated.dimSourceDifference,separated.sourceDifference,'Retained glyph response changes with actual lighting');
    assert.equal(separated.decorativeDifference,0,'Independent contour time and pointer motion are owned by the separate page field');
    assert.equal(separated.diagnostics.field.mode,'source-only');
    assert.equal(separated.diagnostics.layering.independentField,true);
    assert.equal(separated.diagnostics.outputTransformCount,1);
    await writeFile(path.join(work,'separated-field-fixture-'+engine+'.json'),JSON.stringify({engine,separated,errors},null,2)+'\n');
    const resources=await page.evaluate(()=>window.fixture.resources());
    assert.ok(resources.full.retainedMistBytes>0);assert.equal(resources.light.retainedMistBytes,0);
    assert.equal(resources.fullTextures-resources.lightTextures,2,'Disabled mist releases both retained target textures');
    assert.deepEqual(resources.changedCell.field.cellResolution,resources.light.field.cellResolution,'Authored cell-size changes keep allocation dimensions stable');
    assert.equal(resources.changedTextures,resources.lightTextures);
    assert.equal(resources.bounded.width,204);assert.equal(resources.bounded.height,128);
    assert.equal(resources.bounded.dpr,.4,'A large-display budget may legitimately require density below .5');
    assert.ok(Math.abs(resources.bounded.maxBlurPx/.4-9/1.25)<1e-10,'Authored CSS focus footprint survives density budgeting');
    assert.ok(Math.abs(resources.bounded.apertureScale/.4-120/1.25)<1e-10);
    assert.deepEqual(errors,[]);
    await writeFile(path.join(work,'compositor-resources-'+engine+'.json'),JSON.stringify({engine,resources,errors},null,2)+'\n');
    if (process.env.OPTICAL_BASELINE_COMPOSITOR) {
      const comparison = await page.evaluate(() => window.fixture.compareBaseline());
      assert.deepEqual(errors, [], 'Baseline comparison shader/browser errors');
      console.log('Optical comparison results',JSON.stringify(comparison.reports));
      for (const record of comparison.reports) {assert.ok(record.maxByteDifference <= 3, record.name + ': local display deviation exceeds 3/255');assert.ok(record.meanByteDifference <= .05, record.name + ': mean display deviation exceeds .05/255');}
      await writeFile(path.join(work, 'optical-baseline-comparison-' + engine + '.json'), JSON.stringify({verifiedAt:new Date().toISOString(),engine,comparison,errors}, null, 2) + '\n');
      console.log('Bounded optical comparison evidence', JSON.stringify(comparison));
    }
    await page.evaluate(() => window.fixture.compositor.dispose());
  } finally {await browser.close(); await new Promise(resolve => server.close(resolve));}
});
