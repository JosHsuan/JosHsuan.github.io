import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PerspectiveCamera,Matrix4} from 'three';
import {CANVAS_LOCAL_SOURCE_VIEWPORT,prepareSourceFamilies,resolveSourceSelection,sampleSourceScenePose} from '../components/source-scene-score.mjs';
import {INSPECTION_FRAMING_SUPPORT} from '../components/inspection-framing-support.mjs';
import {sampleChapterScene} from '../components/chapter-scene-score.mjs';
import {sampleOpticalScore} from '../components/optical-score.mjs';
import {sampleSourceSeparation} from '../components/element-score.mjs';

const metadata=JSON.parse(await readFile(new URL('../release/public/assets/thesis/source-diagrams.json',import.meta.url)));
const assembly=JSON.parse(await readFile(new URL('../release/public/assets/source-layers.json',import.meta.url)));
const separation=sampleSourceSeparation(1),support=INSPECTION_FRAMING_SUPPORT;
assert.equal(support.sourceSHA256,assembly.revision);
const bounds={
  min:[0,1,2].map(i=>Math.min(assembly.bounds.min[i],...assembly.layers.map(layer=>layer.bounds.min[i]+separation.offsets[layer.id][i]))),
  max:[0,1,2].map(i=>Math.max(assembly.bounds.max[i],...assembly.layers.map(layer=>layer.bounds.max[i]+separation.offsets[layer.id][i]))),
};
const families=prepareSourceFamilies(metadata,{bounds,points:support.points,revision:assembly.revision});
const playback=(chapter,phase=.25)=>({chapterWeights:Array.from({length:7},(_,i)=>Number(i===chapter)),phases:Array(7).fill(phase),activeSeconds:10});
function parameters(chapter,aspect=4/3,phase=.25) {
  const p=playback(chapter,phase),chapterScene=sampleChapterScene(p,{aspect});
  return {playback:p,chapterScene,families,selection:resolveSourceSelection(p,null,chapterScene),aspect,canvasLocal:true};
}

test('canvas-local camera ignores page-slot travel while preserving orbit and inspection',()=>{
  for(const chapter of [1,2,3]) {
    const common=parameters(chapter),before=structuredClone(common);
    const rest=sampleSourceScenePose({...common,weight:0,viewport:{left:.05,top:.05,width:.9,height:.9}});
    const travelled=sampleSourceScenePose({...common,weight:1,viewport:{left:.4,top:.3,width:.2,height:.4}});
    assert.deepEqual(rest,travelled);
    assert.equal(rest.studyWeight,1);
    assert.equal(rest.compositionSpace,'canvas-local');
    assert.deepEqual(rest.viewport,CANVAS_LOCAL_SOURCE_VIEWPORT);
    assert(Math.abs(rest.viewOffsetNormalized.x)<1e-12&&Math.abs(rest.viewOffsetNormalized.y)<1e-12);
    const orbit=sampleSourceScenePose({...common,inspection:{azimuth:100,elevation:70},interactionChapter:common.selection.chapterId});
    assert.notDeepEqual(orbit.position,rest.position);
    const later=sampleSourceScenePose(parameters(chapter,4/3,.7));
    assert.notDeepEqual(later.position,rest.position);
    assert.deepEqual(common,before);
  }
});

test('local opening, evidence absence and complete ending preserve authored narrative roles',()=>{
  const opening=sampleSourceScenePose(parameters(0));
  const still=sampleSourceScenePose({...parameters(0),reducedMotion:true});
  assert.equal(opening.framingIntent,'canvas-local-hero-crop');
  assert.equal(opening.sourcePresence,1);
  assert.equal(still.framingIntent,'held-source');
  assert.equal(opening.distance,still.distance*.88);
  for(const chapter of [4,5]) {
    const absent=sampleSourceScenePose({...parameters(chapter),weight:1});
    assert.equal(absent.sourcePresence,0);
    assert.equal(absent.modelVisibility,0);
    assert.equal(absent.framingIntent,'evidence-absence');
    assert.equal(absent.studyWeight,0);
    assert(Math.abs(absent.viewOffsetNormalized.x)<1e-12&&Math.abs(absent.viewOffsetNormalized.y)<1e-12);
  }
  const ending=sampleSourceScenePose(parameters(6));
  assert.equal(ending.sourcePresence,1);
  assert.equal(ending.framingIntent,'held-source');
  assert.equal(ending.studyWeight,0,'Local ending fit does not request source-study optical attenuation');
});

test('every real source support retains its margin in ordinary, tall and mobile local surfaces',()=>{
  let checks=0,minimum=Infinity;
  for(const [width,height] of [[720,600],[354,354],[358,480],[390,844],[844,390]]) {
    for(const chapter of [1,2,3,6]) for(const phase of [.03,.37,.76]) for(const [azimuth,elevation] of [[30,30],[-40,12],[-40,70],[100,12],[100,70]]) {
      const common=parameters(chapter,width/height,phase),selection=common.selection;
      const pose=sampleSourceScenePose({...common,inspection:{azimuth,elevation},interactionChapter:selection.chapterId});
      const family=families[selection.family];
      const optics=sampleOpticalScore({chapterScene:common.chapterScene,aspect:common.aspect},pose,{bounds:family.bounds});
      const camera=new PerspectiveCamera(pose.fov,common.aspect,pose.near,pose.far);
      camera.position.fromArray(pose.position);camera.lookAt(...pose.target);camera.filmGauge=optics.filmGaugeMm;camera.setFocalLength(optics.focalLengthMm);
      camera.setViewOffset(width,height,width*pose.viewOffsetNormalized.x,height*pose.viewOffsetNormalized.y,width,height);camera.updateMatrixWorld(true);
      const e=new Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse).elements;
      const viewport=CANVAS_LOCAL_SOURCE_VIEWPORT;
      for(const [x,y,z] of family.points) {
        const w=e[3]*x+e[7]*y+e[11]*z+e[15];
        const px=((e[0]*x+e[4]*y+e[8]*z+e[12])/w+1)/2,py=(1-(e[1]*x+e[5]*y+e[9]*z+e[13])/w)/2,pz=(e[2]*x+e[6]*y+e[10]*z+e[14])/w;
        const margin=Math.min((px-viewport.left)/viewport.width,(viewport.left+viewport.width-px)/viewport.width,(py-viewport.top)/viewport.height,(viewport.top+viewport.height-py)/viewport.height);
        assert(margin>=.03-1e-7,`${selection.chapterId}, ${width}x${height}, ${azimuth}/${elevation}: ${margin}`);
        assert(pz>=-1&&pz<=1,'Approved support remains within camera depth');
        minimum=Math.min(minimum,margin);
      }
      checks++;
    }
  }
  assert.equal(checks,300);
  console.log(`Canvas-local source projection: ${checks} configurations; minimum aperture margin ${(minimum*100).toFixed(6)}%`);
});
