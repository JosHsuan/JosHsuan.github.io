import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as T from 'three';
import {GENERIC_PROJECT_CAMERA_KEYS,XR_METHOD_CAMERA_KEYS,BENDING_SCROLL_ORIENTATION_KEYS} from '../runtime/motion/authored-project-camera-scores.mjs';
import {createScrollCameraPath,sampleScrollCamera} from '../runtime/motion/scroll-camera-score.mjs';
import {fitResearchCamera} from '../components/research-scene-geometry.mjs';

const data=JSON.parse(await readFile(new URL('../release/project-studies.json',import.meta.url)));
const corners=bounds=>Array.from({length:8},(_,mask)=>bounds.min.map((value,i)=>mask&(1<<i)?bounds.max[i]:value));
const compile=(keys,chapters)=>createScrollCameraPath(keys.map(key=>({at:(chapters.indexOf(key.chapter)+key.progress)/chapters.length,...key})));

test('each source-model project has a distinct exterior shot score; no invented Caschlatsch model',()=>{
 assert.deepEqual(Object.keys(GENERIC_PROJECT_CAMERA_KEYS).sort(),data.projects.filter(row=>row.model).map(row=>row.id).sort());
 assert.equal(GENERIC_PROJECT_CAMERA_KEYS['caschlatsch'],undefined);
 for(const [id,keys] of Object.entries(GENERIC_PROJECT_CAMERA_KEYS)){
  const row=data.projects.find(row=>row.id===id),path=compile(keys,row.model.chapters);
  assert.deepEqual(row.model.cameraPath,keys,'Pinned release data consumes the actual authored score, not a disconnected proposal');
  assert(Object.isFrozen(keys)&&keys.every(Object.isFrozen));
  assert(Math.max(...keys.map(k=>k.yawRad))-Math.min(...keys.map(k=>k.yawRad))>2.4,'Purposeful wide arc, not the former small wiggle');
  assert(Math.max(...keys.map(k=>k.pitchRad))>=.7,'Authored crane explains upper relationships');
  assert(Math.max(...keys.map(k=>k.fovDeg))-Math.min(...keys.map(k=>k.fovDeg))>=10,'Dolly/lens reframing differs from fixed-lens orbit');
  for(let i=0;i<=100;i++)assert.deepEqual(sampleScrollCamera(path,i/100),sampleScrollCamera(path,i/100),'Native progress deterministically seeks either way');
 }
});

test('every intermediate generic pose retains complete source bounds in its reading aperture and keeps the eye outside the source sphere',()=>{
 let poses=0,projected=0;
 for(const [id,keys] of Object.entries(GENERIC_PROJECT_CAMERA_KEYS)){
  const row=data.projects.find(row=>row.id===id),path=compile(keys,row.model.chapters),support=corners(row.model.bounds).flat();
  for(const [width,height] of [[1440,1000],[1024,768],[390,844],[320,700]]){
   const slot=width<800?{x:.5,y:.42,width:.94,height:.45}:{x:.735,y:.53,width:.51,height:.78};
   for(let i=0;i<=100;i++){
    const intent=sampleScrollCamera(path,i/100),pose=fitResearchCamera(support,width*slot.width/(height*slot.height),{yaw:intent.yawRad,pitch:intent.pitchRad,fov:intent.fovDeg,zoom:intent.zoom});
    assert(pose.distance>=pose.radius*1.1-1e-12,'Eye remains exterior throughout orbit, not merely at authored keys');
    assert.deepEqual(pose.target,row.model.bounds.min.map((v,axis)=>(v+row.model.bounds.max[axis])/2),'Verified source centre remains the orientation anchor');
    const camera=new T.PerspectiveCamera();camera.position.fromArray(pose.position);camera.up.fromArray(pose.up);camera.aspect=width/height;
    camera.fov=T.MathUtils.radToDeg(2*Math.atan(Math.tan(T.MathUtils.degToRad(pose.fov/2))/slot.height));camera.near=pose.near;camera.far=pose.far;
    camera.setViewOffset(width,height,width*(.5-slot.x),height*(.5-slot.y),width,height);camera.lookAt(...pose.target);camera.updateProjectionMatrix();camera.updateMatrixWorld(true);
    for(const point of corners(row.model.bounds)){
     const ndc=new T.Vector3(...point).project(camera),x=(ndc.x+1)/2,y=(1-ndc.y)/2;
     assert(x>slot.x-slot.width/2&&x<slot.x+slot.width/2,`${id}: source width is contained`);
     assert(y>slot.y-slot.height/2&&y<slot.y+slot.height/2,`${id}: source height is contained`);
     assert(ndc.z>-1&&ndc.z<1,`${id}: no near/far clipping`);projected++;
    }
    poses++;
   }
  }
 }
 assert.equal(poses,2020);assert.equal(projected,16160);
});

test('XR model gets an exterior arc while Bending absence and exact endpoints stay authored',()=>{
 const path=createScrollCameraPath(XR_METHOD_CAMERA_KEYS);
 assert.equal(path[0].yawRad,-.4);assert(Math.abs(path.at(-1).yawRad-2.2)<1e-14);
 for(let i=0;i<=100;i++){const pose=sampleScrollCamera(path,i/100);assert(pose.zoom>=1);assert(pose.pitchRad>=.18&&pose.pitchRad<=.72);}
 assert.deepEqual(BENDING_SCROLL_ORIENTATION_KEYS.filter(k=>k.at>=4/7&&k.at<=6/7).map(k=>[k.azimuthOffsetDeg,k.elevationOffsetDeg]),[[0,0],[0,0]]);
 assert.equal(Math.max(...BENDING_SCROLL_ORIENTATION_KEYS.map(k=>k.azimuthOffsetDeg)),46);
 assert.equal(Math.min(...BENDING_SCROLL_ORIENTATION_KEYS.map(k=>k.azimuthOffsetDeg)),-48);
});
