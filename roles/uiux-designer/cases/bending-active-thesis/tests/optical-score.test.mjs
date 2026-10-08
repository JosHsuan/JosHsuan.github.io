import test from 'node:test';
import assert from 'node:assert/strict';
import {PerspectiveCamera} from 'three';
import {axialFocusRange, focalLengthForFov, sampleOpticalScore} from '../components/optical-score.mjs';
import {normalizeProtectedRects} from '../components/scene-compositor.mjs';
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

test('protected CSS rectangles convert Y correctly and retain offscreen overlap', () => {
  const r = normalizeProtectedRects([{left: 20, top: 10, right: 80, bottom: 40}], 100, 100, 0);
  assert.deepEqual(r.rects, [[.2, .6, .8, .9]]);
  assert.equal(normalizeProtectedRects([{left: -100, top: 0, right: -20, bottom: 20}], 100, 100).rects.length, 0);
  assert.equal(normalizeProtectedRects([{left: -20, top: 0, right: 20, bottom: 20}], 100, 100).rects.length, 1);
});

test('protected rectangle overflow uses an enclosing reading mask instead of dropping text', () => {
  const rects = Array.from({length: 22}, (_, i) => [.01 * i, .1, .02 + .01 * i, .8]);
  const result = normalizeProtectedRects(rects, 1200, 800, 0);
  assert.equal(result.mode, 'reading-union-fallback'); assert.equal(result.rects.length, 1); assert.equal(result.inputCount, 22);
  for (const r of rects) {assert.ok(result.rects[0][0] <= r[0]); assert.ok(result.rects[0][2] >= r[2]); assert.ok(result.rects[0][1] <= r[1]); assert.ok(result.rects[0][3] >= r[3]);}
});

test('actual WebGL depth focus, glyphs and black-mist radiance/alpha/masks', {skip: process.env.OPTICAL_BROWSER !== '1'}, async () => {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../..');
  const require = createRequire(path.join(root, 'package.json'));
  const engine = process.env.OPTICAL_ENGINE === 'webkit' ? 'webkit' : 'chromium';
  const browserType = require('@playwright/test')[engine];
  const sources = new Map([
    ['/three.module.js', await readFile(path.join(root, 'node_modules/three/build/three.module.js'))],
    ['/three.core.js', await readFile(path.join(root, 'node_modules/three/build/three.core.js'))],
    ['/compositor.mjs', await readFile(new URL('../components/scene-compositor.mjs', import.meta.url))],
  ]);
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
  function draw(overrides={},rects=[]){compositor.render(scene,camera,{...settings,overrides},{width:512,height:320,dpr:1,protectedRects:rects});return pixels();}
  let bright=null;
  window.fixture={draw,light,compositor,run(){
    const near=draw({focusDistanceM:5}),far=draw({focusDistanceM:9});
    const clean=draw({maxBlurPx:0}),glyphs=draw({maxBlurPx:0,asciiWeight:1});
    const masked=draw({maxBlurPx:0,asciiWeight:1},[[0,0,.5,1]]);
    light.intensity=.05; const darkClean=draw({maxBlurPx:0}),darkGlyphs=draw({maxBlurPx:0,asciiWeight:1}); light.intensity=2;
    const result={near:{front:gradient(near,132,219),back:gradient(near,292,379)},far:{front:gradient(far,132,219),back:gradient(far,292,379)},glyphDifference:diff(clean,glyphs,100,410),protectedDifference:diff(clean,masked,100,235),unprotectedDifference:diff(clean,masked,285,410),darkGlyphDifference:diff(darkClean,darkGlyphs,100,410),cornerAlpha:near[3],subjectAlpha:near[(160*512+177)*4+3],diagnostics:compositor.inspect()};
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
    return {haloDifference,dimHaloDifference,farBlackMaximum,protectedDifference:diff(clean,masked,100,410),displayDifference,haloAlphaBefore,haloAlphaAfter,cornerAlpha:transparentMist[3],coreAlpha:transparentMist[(160*512+256)*4+3],off,on};
  },endMist(){
    scene.remove(bright);bright.geometry.dispose();bright.material.dispose();bright=null;front.visible=back.visible=true;scene.background=null;
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
    assert.ok(result.glyphDifference > 10000); assert.equal(result.protectedDifference, 0); assert.ok(result.unprotectedDifference > 1000);
    assert.notEqual(result.darkGlyphDifference, result.glyphDifference, 'Glyph result must respond to actual light/radiance');
    assert.equal(result.cornerAlpha, 0); assert.equal(result.subjectAlpha, 255);
    const work = 'D:/JosHsuan_Website/_work/bending-active-thesis/round-03/verification';
    await mkdir(work, {recursive: true}); await page.screenshot({path: path.join(work, 'optical-fixture-' + engine + '.png')});
    const mist = await page.evaluate(() => window.fixture.runMist());
    assert.deepEqual(errors, [], 'Mist shader compilation and browser errors');
    assert.ok(mist.haloDifference > 10000, JSON.stringify(mist));
    assert.equal(mist.dimHaloDifference, 0, 'Below-threshold source does not create a highlight halo');
    assert.equal(mist.farBlackMaximum, 0, 'No unrelated black lift');
    assert.equal(mist.protectedDifference, 0, 'Diffusion never enters a protected rectangle');
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
    await page.evaluate(() => window.fixture.compositor.dispose());
  } finally {await browser.close(); await new Promise(resolve => server.close(resolve));}
});
