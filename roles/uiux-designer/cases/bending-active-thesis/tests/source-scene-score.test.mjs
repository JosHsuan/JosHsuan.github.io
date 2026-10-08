import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {dirname,resolve} from 'node:path';
import {PerspectiveCamera,Matrix4} from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {SOURCE_DIAGRAM_REVISION,prepareSourceFamilies,resolveSourceSelection,fitSourcePose,sampleSourceScenePose} from '../components/source-scene-score.mjs';
import {sampleChapterScene} from '../components/chapter-scene-score.mjs';
import {sampleOpticalScore} from '../components/optical-score.mjs';
const metadata=JSON.parse(await readFile(new URL('../release/public/assets/thesis/source-diagrams.json',import.meta.url)));
const assembly={bounds:{min:[-1.3,-.01,-1.6],max:[1.3,.97,1.6]},revision:'test-assembly'};
const families=prepareSourceFamilies(metadata,assembly);
const playback=(chapter,phase=0,time=0)=>({chapterWeights:Array.from({length:7},(_,i)=>Number(i===chapter)),phases:Array(7).fill(phase),activeSeconds:time});

test('verified family support rejects wrong revisions and keeps all exact points',()=>{
  assert.equal(families.representation.points.length,1130);
  assert.equal(families.experiment.points.length,487);
  assert.throws(()=>prepareSourceFamilies({...metadata,revision:'other'},assembly));
  const broken=structuredClone(metadata);broken.representations[0].framingSupport.points[0][0]=1e6;
  assert.throws(()=>prepareSourceFamilies(broken,assembly));
  assert.equal(families.representation.revision,SOURCE_DIAGRAM_REVISION);
});

test('source cues resolve actual variants, with a bounded manual pin and no event feedback',()=>{
  const p=playback(1,.01,10),score=sampleChapterScene(p);
  assert.equal(resolveSourceSelection(p,null,score).id,'origami');
  const chosen={chapterId:'form',index:3,selectedAt:10};
  assert.equal(resolveSourceSelection({...p,activeSeconds:17.999},chosen,score).id,'curvature');
  assert.equal(resolveSourceSelection({...p,activeSeconds:18},chosen,score).pinned,false);
  assert.equal(resolveSourceSelection(playback(3,.2,12),chosen).family,'experiment');
  assert.equal(resolveSourceSelection(playback(0),chosen).id,'assembly');
  assert.equal(resolveSourceSelection(p,{...chosen,index:9},score).pinned,false);
  assert.throws(()=>resolveSourceSelection({chapterWeights:[0,0,0,0,0,0,0]}));
});

test('fixed comparison envelope never changes the camera when selecting another member',()=>{
  for(const chapter of [1,2,3]) {
    const p=playback(chapter,.37,4),cue=sampleChapterScene(p),first=resolveSourceSelection(p,null,cue);
    const common={playback:p,chapterScene:cue,families,aspect:1.6,viewport:{left:.2,top:.25,width:.75,height:.55},weight:1};
    const count=chapter===3?3:4;
    const poses=Array.from({length:count},(_,index)=>sampleSourceScenePose({...common,selection:resolveSourceSelection(p,{chapterId:first.chapterId,index,selectedAt:4},cue)}));
    for(const pose of poses) assert.deepEqual(pose.position,poses[0].position);
  }
});

test('autonomous cues precede fitting; one held phase is deterministic and reduced remains in chapter',()=>{
  const p=playback(1,.1,1),selected=resolveSourceSelection(p),common={playback:p,chapterScene:sampleChapterScene(p),families,selection:selected,aspect:1.6,weight:1};
  const original=structuredClone(common),a=sampleSourceScenePose(common),b=sampleSourceScenePose(common);
  assert.deepEqual(a,b);assert.deepEqual(common,original);
  const later=playback(1,.3,4),next=sampleSourceScenePose({...common,playback:later,chapterScene:sampleChapterScene(later)});
  assert.notDeepEqual(a.position,next.position);
  const reduced=sampleSourceScenePose({...common,reducedMotion:true,chapterScene:sampleChapterScene(p,{reducedMotion:true})});
  assert.equal(reduced.chapter.id,'form');assert.equal(reduced.sourcePresence,1);
  const absent=playback(4),absentPose=sampleSourceScenePose({...common,playback:absent,chapterScene:sampleChapterScene(absent),selection:resolveSourceSelection(absent),weight:0});
  assert.equal(absentPose.sourcePresence,0);
  assert.throws(()=>fitSourcePose({bounds:assembly.bounds,aspect:0}));
});

test('actual public GLB vertices fit after chapter loop, pointer, manual orbit and final optical lens',async()=>{
  const bytes=await readFile(new URL('../release/public/assets/thesis/source-diagrams.glb',import.meta.url));
  assert.equal(createHash('sha256').update(bytes).digest('hex'),SOURCE_DIAGRAM_REVISION);
  const gltf=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
  const meshes=new Map();gltf.scene.traverse(node=>{if(node.isMesh)meshes.set(node.userData.representationId,node);});
  assert.equal(meshes.size,7);
  const formats=[[1440,900],[1024,900],[768,1024],[390,844],[360,800]];
  const controls=[[30,30],[-40,12],[-40,70],[100,12],[100,70]],proof=[];
  for(const [width,height] of formats) for(const chapter of [1,2,3]) for(const phase of [.02,.38,.76]) for(const [azimuth,elevation] of controls) {
    const aspect=width/height,p=playback(chapter,phase,10),cue=sampleChapterScene(p,{aspect});
    const viewport=width>=1100?{left:.3,top:.2,width:.65,height:.48}:{left:.05,top:.22,width:.9,height:.4};
    const count=chapter===3?3:4,chapterId=chapter===1?'form':chapter===2?'system':'pattern';
    for(let index=0;index<count;index++) {
      const selection=resolveSourceSelection(p,{chapterId,index,selectedAt:10},cue);
      const pose=sampleSourceScenePose({playback:p,chapterScene:cue,families,selection,aspect,viewport,weight:1,inspection:{azimuth,elevation},interactionChapter:chapterId,pointer:{x:azimuth<0?-1:1,y:elevation<30?-1:1}});
      const optics=sampleOpticalScore({chapterScene:cue,aspect},pose,{bounds:metadata.representations.find(r=>r.id===selection.id).bounds});
      const camera=new PerspectiveCamera(pose.fov,aspect,pose.near,pose.far);camera.position.fromArray(pose.position);camera.lookAt(...pose.target);
      camera.filmGauge=optics.filmGaugeMm;camera.setFocalLength(optics.focalLengthMm);
      camera.setViewOffset(width,height,width*pose.viewOffsetNormalized.x,height*pose.viewOffsetNormalized.y,width,height);camera.updateMatrixWorld(true);
      const e=new Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse).elements;
      const positions=meshes.get(selection.id).geometry.attributes.position;
      let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity,minZ=Infinity,maxZ=-Infinity;
      for(let i=0;i<positions.count;i++) {
        const x=positions.getX(i),y=positions.getY(i),z=positions.getZ(i),w=e[3]*x+e[7]*y+e[11]*z+e[15];
        const px=((e[0]*x+e[4]*y+e[8]*z+e[12])/w+1)/2,py=(1-(e[1]*x+e[5]*y+e[9]*z+e[13])/w)/2,pz=(e[2]*x+e[6]*y+e[10]*z+e[14])/w;
        minX=Math.min(minX,px);maxX=Math.max(maxX,px);minY=Math.min(minY,py);maxY=Math.max(maxY,py);minZ=Math.min(minZ,pz);maxZ=Math.max(maxZ,pz);
      }
      const margins={left:(minX-viewport.left)/viewport.width,right:(viewport.left+viewport.width-maxX)/viewport.width,top:(minY-viewport.top)/viewport.height,bottom:(viewport.top+viewport.height-maxY)/viewport.height};
      assert(Object.values(margins).every(v=>v>=.03-1e-7),`${selection.id} ${width} ${phase} ${azimuth}/${elevation} ${JSON.stringify(margins)}`);
      assert(minZ>=-1&&maxZ<=1);
      proof.push({id:selection.id,chapterId,width,height,phase,azimuth,elevation,vertices:positions.count,margins,depth:[minZ,maxZ]});
    }
  }
  assert.equal(proof.length,825);
  if(process.env.SOURCE_PROJECTION_REPORT) {
    const target=resolve(process.env.SOURCE_PROJECTION_REPORT),allowed=resolve('D:/JosHsuan_Website/_work/bending-active-thesis/round-06');
    assert(target.toLowerCase().startsWith(`${allowed.toLowerCase()}\\`),'Private full evidence must remain under the approved Round06 work folder');
    await mkdir(dirname(target),{recursive:true});await writeFile(target,JSON.stringify({sourceSHA256:SOURCE_DIAGRAM_REVISION,checks:proof.length,minimumMargin:Math.min(...proof.flatMap(r=>Object.values(r.margins))),proof},null,2));
  }
  console.log(`Actual source projection: ${proof.length} configurations; minimum viewport margin ${(100*Math.min(...proof.flatMap(r=>Object.values(r.margins)))).toFixed(6)}%`);
});
