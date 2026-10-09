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

test('viewport-stage owns fixed source apertures independent of scroll slots and local-frame mode',()=>{
  assert.deepEqual(viewportStageSourceViewport(1.44),{left:.51,top:.20,width:.43,height:.52});
  assert.deepEqual(viewportStageSourceViewport(390/844),{left:.045,top:.205,width:.91,height:.43});
  for(const invalid of [0,-1,Infinity,NaN])assert.throws(()=>viewportStageSourceViewport(invalid),/aspect/);
  for(const invalid of [0,-1,Infinity,NaN])assert.throws(()=>viewportStageSourceViewport(.7,invalid),/width/);
  for(const aspect of [1.44,.46])for(const chapter of [1,2,3]) {
    const common=parameters(chapter,aspect),before=structuredClone(common);
    const rest=sampleSourceScenePose({...common,weight:0,viewport:{left:.1,top:.1,width:.8,height:.8}});
    const scrolled=sampleSourceScenePose({...common,weight:1,canvasLocal:true,viewport:{left:.4,top:.5,width:.2,height:.1}});
    assert.deepEqual(rest,scrolled);
    assert.equal(rest.compositionSpace,'viewport-stage');
    assert.equal(rest.studyWeight,1);
    assert.deepEqual(rest.viewport,viewportStageSourceViewport(aspect));
    const inspected=sampleSourceScenePose({...common,inspection:{azimuth:100,elevation:70},interactionChapter:common.selection.chapterId});
    assert.notDeepEqual(inspected.position,rest.position,'Inspection remains a bounded input to the sole camera pose');
    assert.notDeepEqual(sampleSourceScenePose(parameters(chapter,aspect,.7)).position,rest.position,'Shared autonomous phase still changes the camera');
    assert.deepEqual(common,before);
  }
});

test('authored study aperture follows the CSS layout breakpoint on tall tablets and narrow screens',()=>{
  const centered={left:.045,top:.205,width:.91,height:.43},compact={left:.51,top:.20,width:.41,height:.52},right={left:.51,top:.20,width:.43,height:.52};
  for(const [width,height,viewport] of [[430,932,centered],[780,1180,centered],[781,1180,compact],[820,1180,compact],[932,430,compact],[1100,1180,compact],[1101,1180,right]]) {
    assert.deepEqual(viewportStageSourceViewport(width/height,width),viewport);
    for(const chapter of [1,2,3]) {
      const pose=sampleSourceScenePose({...parameters(chapter,width/height),viewportWidth:width});
      assert.deepEqual(pose.viewport,viewport);
      assert.equal(pose.studyWeight,1);
    }
  }
});

test('viewport opening and ending preserve the original authored camera, with evidence absence',()=>{
  for(const aspect of [1.44,390/844])for(const chapter of [0,4,5,6]) {
    const common=parameters(chapter,aspect);
    const restored=sampleSourceScenePose({...common,weight:1,viewport:{left:.1,top:.1,width:.8,height:.8}});
    const original=sampleSourceScenePose({...common,compositionMode:undefined,weight:0});
    const {compositionSpace,...camera}=restored;
    assert.equal(compositionSpace,'viewport-stage');
    assert.deepEqual(camera,original,'The viewport story shot must not be refitted into a small local card');
    assert.equal(restored.studyWeight,0);
    assert.equal(restored.sourcePresence,Number(![4,5].includes(chapter)));
  }
});

test('real source support stays inside authored stage apertures at inspection extremes',()=>{
  let checks=0,minimum=Infinity;
  for(const [width,height] of [[1440,1000],[1000,1440],[820,1180],[390,844],[844,390],[2560,1080]]) {
    for(const chapter of [1,2,3])for(const phase of [.03,.37,.76])for(const [azimuth,elevation] of [[30,30],[-40,12],[-40,70],[100,12],[100,70]]) {
      const common=parameters(chapter,width/height,phase),selection=common.selection;
      const pose=sampleSourceScenePose({...common,viewportWidth:width,inspection:{azimuth,elevation},interactionChapter:selection.chapterId});
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

test('the restored attribution shot retains the complete verified assembly silhouette',()=>{
  for(const [width,height] of [[1440,1000],[1000,1440],[390,844],[844,390],[2560,1080]])for(const phase of [.03,.37,.76]) {
    const common=parameters(6,width/height,phase),pose=sampleSourceScenePose(common);
    const camera=new PerspectiveCamera(pose.fov,common.aspect,pose.near,pose.far);
    camera.position.fromArray(pose.position);camera.lookAt(...pose.target);
    camera.setViewOffset(width,height,width*pose.viewOffsetNormalized.x,height*pose.viewOffsetNormalized.y,width,height);camera.updateMatrixWorld(true);
    const e=new Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse).elements;
    for(const [x,y,z] of families.assembly.points) {
      const w=e[3]*x+e[7]*y+e[11]*z+e[15];
      for(const row of [0,1,2]) {
        const projected=(e[row]*x+e[row+4]*y+e[row+8]*z+e[row+12])/w;
        assert(projected>=-1&&projected<=1,`${width}x${height}, phase ${phase}, projection axis ${row}: ${projected}`);
      }
    }
  }
});
