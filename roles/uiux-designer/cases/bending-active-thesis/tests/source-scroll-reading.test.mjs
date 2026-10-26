import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PerspectiveCamera,Matrix4} from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {sourceIndexForScroll,resolveSourceSelection,prepareSourceFamilies,sampleSourceScenePose,viewportStageSourceViewport} from '../components/source-scene-score.mjs';
import {sampleChapterScene} from '../components/chapter-scene-score.mjs';
import {BENDING_SCROLL_ORIENTATION,sampleSourceScrollOrientation} from '../components/source-scroll-orientation.mjs';
import {sampleOpticalScore} from '../components/optical-score.mjs';

const playback=(chapter,phase=0,time=0)=>({chapterWeights:Array.from({length:7},(_,i)=>Number(i===chapter)),phases:Array(7).fill(phase),activeSeconds:time});
const reading=(file)=>readFile(new URL(`../${file}`,import.meta.url),'utf8');

test('native scroll exposes every representation in order and reverses without time or clicks',()=>{
 for(const [chapter,count] of [[1,4],[2,4],[3,3]]){
  const progress=Array.from({length:101},(_,i)=>(chapter+i/100)/7);
  const forward=progress.map(u=>sourceIndexForScroll(chapter,count,u));
  assert.deepEqual([...new Set(forward)],Array.from({length:count},(_,i)=>i));
  assert.deepEqual(progress.toReversed().map(u=>sourceIndexForScroll(chapter,count,u)),forward.toReversed());
  for(const u of progress){
   const atRest=resolveSourceSelection(playback(chapter,.01,0),null,null,null,u);
   const muchLater=resolveSourceSelection(playback(chapter,.99,10000),null,null,null,u);
   assert.equal(atRest.id,muchLater.id);assert.equal(atRest.index,sourceIndexForScroll(chapter,count,u));
  }
 }
 assert.throws(()=>sourceIndexForScroll(7,4,.5));assert.throws(()=>sourceIndexForScroll(1,0,.5));assert.throws(()=>sourceIndexForScroll(1,4,NaN));
});

test('Bending research prose and source figures are inline and no click input owns reading',async()=>{
 const page=await reading('components/BendingProject.jsx'),diagram=await reading('components/SourceDiagram.jsx'),model=await reading('components/ModelInspector.jsx'),experience=await reading('components/CinematicExperience.jsx'),policy=await reading('runtime/features/LifecycleManager.mjs');
 assert.doesNotMatch(page,/<details|<summary|EvidenceInspector|data-inspect-figure|href=\{item\.source\}|href="#|href=\{`#/);
 assert.match(page,/styles\.methodStep/);assert.match(page,/story\.media\.geometry/);assert.match(page,/story\.media\.library/);assert.match(page,/review\.credits\.media/);
 assert.doesNotMatch(diagram,/<button|onClick=|onPointerEnter=|onFocus=|data-diagram-caption/);
 for(const kind of ['miura','workflow']){
  const source=JSON.parse(await reading(`release/public/assets/diagrams/${kind}.json`));
  for(const group of source.groups){assert.ok(diagram.includes(group.label));assert.ok(diagram.includes(group.description));}
 }
 assert.doesNotMatch(model,/role="button"|onClick=|onKeyDown=|model\.pointer|connectPointer|Enable model/);
 assert.doesNotMatch(experience,/<button|Pause motion|Enable 3D/);
 assert.doesNotMatch(policy,/prefers-reduced-motion/);
 const css=await reading('app/page.module.css'),modelCSS=await reading('components/model-inspector.module.css');
 assert.ok(css.includes('.evidence[data-media-kind="photo"] .mediaFrame img{filter:none;mix-blend-mode:normal}'),'Original photo colors must not require hover or focus');
 assert.doesNotMatch(modelCSS,/\.surface,\.sideLabel\{pointer-events:none\}/,'Read-only source labels retain native text interaction');
});

test('actual original source vertices fit the bolder scroll camera across desktop and compact passages',async()=>{
 const metadata=JSON.parse(await reading('release/public/assets/thesis/source-diagrams.json'));
 const assembly={bounds:{min:[-1.3,-.01,-1.6],max:[1.3,.97,1.6]},revision:'test-assembly'};
 const families=prepareSourceFamilies(metadata,assembly);
 const bytes=await readFile(new URL('../release/public/assets/thesis/source-diagrams.glb',import.meta.url));
 const gltf=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
 const meshes=new Map();gltf.scene.traverse(node=>{if(node.isMesh)meshes.set(node.userData.representationId,node);});
 let checks=0,minimum=1;
 for(const [width,height] of [[1440,1000],[390,844],[320,700]])for(const chapter of [1,2,3])for(const local of [0,.13,.26,.4,.51,.64,.77,.9,1]){
  const u=(chapter+local)/7,p=playback(chapter,.25,10),aspect=width/height;
  const cue=sampleChapterScene(p,{aspect}),selection=resolveSourceSelection(p,null,cue,null,u);
  const orientation=sampleSourceScrollOrientation(BENDING_SCROLL_ORIENTATION,u);
  const pose=sampleSourceScenePose({playback:p,chapterScene:cue,families,selection,aspect,viewportWidth:width,compositionMode:'viewport-stage',scrollOrientation:orientation,pointer:{x:0,y:0}});
  const optics=sampleOpticalScore({chapterScene:cue,aspect},pose,{bounds:metadata.representations.find(r=>r.id===selection.id).bounds});
  const camera=new PerspectiveCamera(pose.fov,aspect,pose.near,pose.far);camera.position.fromArray(pose.position);camera.lookAt(...pose.target);
  camera.filmGauge=optics.filmGaugeMm;camera.setFocalLength(optics.focalLengthMm);camera.setViewOffset(width,height,width*pose.viewOffsetNormalized.x,height*pose.viewOffsetNormalized.y,width,height);camera.updateMatrixWorld(true);
  const e=new Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse).elements,positions=meshes.get(selection.id).geometry.attributes.position;
  const viewport=viewportStageSourceViewport(aspect,width);
  for(let i=0;i<positions.count;i++){
   const x=positions.getX(i),y=positions.getY(i),z=positions.getZ(i),w=e[3]*x+e[7]*y+e[11]*z+e[15];
   const px=((e[0]*x+e[4]*y+e[8]*z+e[12])/w+1)/2,py=(1-(e[1]*x+e[5]*y+e[9]*z+e[13])/w)/2,pz=(e[2]*x+e[6]*y+e[10]*z+e[14])/w;
   const margin=Math.min((px-viewport.left)/viewport.width,(viewport.left+viewport.width-px)/viewport.width,(py-viewport.top)/viewport.height,(viewport.top+viewport.height-py)/viewport.height);
   minimum=Math.min(minimum,margin);assert.ok(margin>=.03-1e-7,`${selection.id} ${width} ${local}: ${margin}`);assert.ok(pz>=-1&&pz<=1);
  }
  checks++;
 }
 assert.equal(checks,81);console.log(`Bolder scroll source projection: ${checks} original-geometry views, minimum viewport margin ${(minimum*100).toFixed(6)}%`);
});
