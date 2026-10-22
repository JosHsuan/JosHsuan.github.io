import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PerspectiveCamera,Matrix4} from 'three';
import {prepareSourceFamilies,resolveSourceSelection,sampleSourceScenePose,viewportStageSourceViewport} from '../components/source-scene-score.mjs';
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
function parameters(chapter,aspect=1.44,phase=.25) {
  const playback={chapterWeights:Array.from({length:7},(_,i)=>Number(i===chapter)),phases:Array(7).fill(phase),activeSeconds:10};
  const chapterScene=sampleChapterScene(playback,{aspect});
  return {playback,chapterScene,families,selection:resolveSourceSelection(playback,null,chapterScene),aspect,compositionMode:'viewport-stage'};
}


import {BENDING_SCROLL_ORIENTATION,sampleSourceScrollOrientation} from '../components/source-scroll-orientation.mjs';
test('scroll orientation composed with independent idle and inspection preserves all source support',()=>{
  let checks=0,minimum=Infinity;
  for(const [width,height] of [[1440,1000],[1000,1440],[820,1180],[390,844],[844,390],[2560,1080]]) {
    for(const chapter of [1,2,3])for(const phase of [.03,.37,.76])for(const [azimuth,elevation] of [[30,30],[-40,12],[-40,70],[100,12],[100,70]]) {
      const common=parameters(chapter,width/height,phase),selection=common.selection;
      const pose=sampleSourceScenePose({...common,viewportWidth:width,scrollOrientation:sampleSourceScrollOrientation(BENDING_SCROLL_ORIENTATION,(chapter+phase)/7),inspection:{azimuth,elevation},interactionChapter:selection.chapterId});
      const family=families[selection.family],viewport=viewportStageSourceViewport(common.aspect,width);
      const optics=sampleOpticalScore({chapterScene:common.chapterScene,aspect:common.aspect},pose,{bounds:family.bounds});
      const camera=new PerspectiveCamera(pose.fov,common.aspect,pose.near,pose.far);
      camera.position.fromArray(pose.position);camera.lookAt(...pose.target);camera.filmGauge=optics.filmGaugeMm;camera.setFocalLength(optics.focalLengthMm);
      camera.setViewOffset(width,height,width*pose.viewOffsetNormalized.x,height*pose.viewOffsetNormalized.y,width,height);camera.updateMatrixWorld(true);
      const e=new Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse).elements;
      for(const [x,y,z] of family.points) {
        const w=e[3]*x+e[7]*y+e[11]*z+e[15];
        const px=((e[0]*x+e[4]*y+e[8]*z+e[12])/w+1)/2,py=(1-(e[1]*x+e[5]*y+e[9]*z+e[13])/w)/2,pz=(e[2]*x+e[6]*y+e[10]*z+e[14])/w;
        const margin=Math.min((px-viewport.left)/viewport.width,(viewport.left+viewport.width-px)/viewport.width,(py-viewport.top)/viewport.height,(viewport.top+viewport.height-py)/viewport.height);
        assert(margin>=.03-1e-7,`${selection.chapterId}, ${width}x${height}, ${azimuth}/${elevation}: ${margin}`);
        assert(pz>=-1&&pz<=1,'Original support stays within the camera depth interval');
        minimum=Math.min(minimum,margin);
      }
      checks++;
    }
  }
  assert.equal(checks,270);
  console.log(`Viewport-stage source projection: ${checks} configurations; minimum aperture margin ${(minimum*100).toFixed(6)}%`);
});