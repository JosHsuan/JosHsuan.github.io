import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {stageCameraPose,stageRenderView} from '../components/xr-stage-scene.mjs';
import {collectResearchSupport,createResearchPhoneGeometry,RESEARCH_MODEL_PIXELS,RESEARCH_PHONE_PIXELS} from '../components/research-scene-geometry.mjs';
import {XR_METHOD_CAMERA_KEYS} from '../runtime/motion/authored-project-camera-scores.mjs';
import {createScrollCameraPath,sampleScrollCamera} from '../runtime/motion/scroll-camera-score.mjs';
import {resolveRenderBudget} from '../components/render-budget.mjs';

const viewports=[[1440,1000],[1920,1080],[800,600],[799,1000],[390,844],[320,700]];
const modelChapters=['overview','context','method','model','making','contribution','limits','credits'];
const study=JSON.parse(await readFile(new URL('../release/xr-study.json',import.meta.url),'utf8'));
const bytes=await readFile(new URL('../release/public'+study.model.src,import.meta.url));
const gltf=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
const sourceSupport=collectResearchSupport(gltf.scene);
const digest=value=>createHash('sha256').update(value).digest('hex');
const arrayDigest=array=>digest(new Uint8Array(array.buffer,array.byteOffset,array.byteLength));

function sourceState(){
 const nodes=[];
 gltf.scene.traverse(node=>{
  if(!node.isMesh)return;
  nodes.push({position:node.position.toArray(),quaternion:node.quaternion.toArray(),scale:node.scale.toArray(),
   positions:arrayDigest(node.geometry.getAttribute('position').array),normals:arrayDigest(node.geometry.getAttribute('normal').array),
   indices:arrayDigest(node.geometry.index.array),colour:node.material.color.toArray(),opacity:node.material.opacity});
 });
 return nodes;
}

function cameraFor(pose,width,height){
 const camera=new T.PerspectiveCamera(pose.fov,width/height,pose.near,pose.far);
 camera.position.fromArray(pose.position);camera.up.fromArray(pose.up);
 camera.setViewOffset(width,height,pose.offset.x,pose.offset.y,width,height);
 camera.lookAt(...pose.target);camera.updateProjectionMatrix();camera.updateMatrixWorld(true);
 return camera;
}

// These are the approved reading-layout clear regions, independent of the
// function's returned slot. A full-screen fit alone would hide a left-panel overlap.
function clearRect(width,height,phone=false){
 if(width>=800)return{left:width*.48,right:width*.99,top:height*.14,bottom:height*.92};
 return phone
  ?{left:width*.03,right:width*.97,top:height*.13,bottom:height*.89}
  :{left:width*.03,right:width*.97,top:height*.095,bottom:height*.545};
}

function assertProjected(points,pose,width,height,phone,label){
 const camera=cameraFor(pose,width,height),rect=clearRect(width,height,phone),point=new T.Vector3();
 const projected={left:Infinity,right:-Infinity,top:Infinity,bottom:-Infinity};
 assert(pose.near>0&&pose.far>pose.near,label+': valid depth range');
 for(let index=0;index<points.length;index+=3){
  point.fromArray(points,index).applyMatrix4(camera.matrixWorldInverse);
  assert(-point.z>pose.near&&-point.z<pose.far,label+': complete source must stay between near and far');
  point.applyMatrix4(camera.projectionMatrix);
  assert(point.z>-1&&point.z<1,label+': projected depth remains in the frustum');
  const x=(point.x+1)*width/2,y=(1-point.y)*height/2;
  assert(x>=rect.left-1e-6&&x<=rect.right+1e-6&&y>=rect.top-1e-6&&y<=rect.bottom+1e-6,
   `${label}: source point ${index/3} at ${x},${y} overlaps reading space or clips the clear region`);
  projected.left=Math.min(projected.left,x);projected.right=Math.max(projected.right,x);
  projected.top=Math.min(projected.top,y);projected.bottom=Math.max(projected.bottom,y);
 }
 const fill=Math.max((projected.right-projected.left)/(rect.right-rect.left),(projected.bottom-projected.top)/(rect.bottom-rect.top));
 assert(fill>.6,label+': fitting must leave a useful subject size, not only avoid clipping');
 return{camera,rect,projected};
}

test('an off-origin asymmetric source remains complete inside the desktop/mobile reading clear region',()=>{
 const points=new Float64Array([-81,-10,-200,92,30,240,-81,30,240,92,-10,-200,-26,47,31,67,-28,71]);
 const original=Array.from(points);
 for(const[width,height]of viewports)for(const chapter of modelChapters){
  const pose=stageCameraPose(points,width,height,{chapter});
  assertProjected(points,pose,width,height,false,`${width}×${height} ${chapter}`);
 }
 assert.deepEqual(Array.from(points),original,'Camera composition cannot rebase, scale or alter source positions');
});

test('every pinned assembly vertex fits the reading clear region at chapter poses and native inspection limits',()=>{
 assert.equal(digest(bytes),study.model.sha256,'Use the approved actual XR assembly, not another project or a proxy');
 assert.equal(sourceSupport.length,study.model.vertices*3);
 assert.equal(study.model.vertices,96312);assert.equal(study.model.triangles,190320);
 const original=sourceState(),supportDigest=arrayDigest(sourceSupport);
 for(const[width,height]of viewports)for(const chapter of modelChapters){
  for(const[azimuth,elevation]of [[0,0],[-.9,-.4],[.9,.5]]){
   const pose=stageCameraPose(sourceSupport,width,height,{chapter,azimuth,elevation});
   assertProjected(sourceSupport,pose,width,height,false,`${width}×${height} ${chapter} inspection ${azimuth},${elevation}`);
  }
 }
 assert.equal(arrayDigest(sourceSupport),supportDigest);
 assert.deepEqual(sourceState(),original,'Framing must preserve source positions, normals, topology, transforms and material');
});

test('all three full recorded screens and device bodies fit the phone clear region with sufficient depth precision',()=>{
 for(const stage of study.phoneStages){
  const phone=createResearchPhoneGeometry(stage.width/stage.height);
  try{
   const positions=[];
   for(const geometry of[phone.body,phone.screen]){
    const attribute=geometry.getAttribute('position');
    for(let index=0;index<attribute.count;index++)positions.push(attribute.getX(index),attribute.getY(index),attribute.getZ(index));
   }
   phone.body.computeBoundingBox();phone.screen.computeBoundingBox();
   const screenZ=phone.screen.boundingBox.min.z;
   // Include the four full source-image corners, not only rounded shell vertices.
   for(const x of[-phone.dimensions.width/2,phone.dimensions.width/2])for(const y of[-phone.dimensions.height/2,phone.dimensions.height/2])positions.push(x,y,screenZ);
   const original=arrayDigest(phone.support);
   for(const[width,height]of viewports){
    const pose=stageCameraPose(phone.support,width,height,{chapter:stage.id});
    const{camera}=assertProjected(positions,pose,width,height,true,`${width}×${height} ${stage.id} complete phone`);
    const bodyDepth=new T.Vector3(0,0,phone.body.boundingBox.max.z).project(camera).z;
    const screenDepth=new T.Vector3(0,0,screenZ).project(camera).z;
    assert(Math.abs(bodyDepth-screenDepth)/2*(2**24)>32,'The casing cannot z-fight across recorded interface controls');
   }
   assert.equal(arrayDigest(phone.support),original,'Phone camera fitting cannot change geometry support');
  }finally{phone.dispose();}
 }
});

test('the real full-viewport canvas preserves every source point, reading-safe camera and hit ray within its bounded physical-pixel budget',()=>{
 const first=new T.Vector3(),second=new T.Vector3(),ndc=new T.Vector2(),fullRay=new T.Raycaster(),croppedRay=new T.Raycaster();
 for(const[width,height]of viewports)for(const chapter of[...modelChapters,...study.phoneStages.map(stage=>stage.id)]){
  const stage=study.phoneStages.find(item=>item.id===chapter),phone=stage?createResearchPhoneGeometry(stage.width/stage.height):null;
  try{
   const support=phone?.support??sourceSupport,pose=stageCameraPose(support,width,height,{chapter}),view=stageRenderView(pose,width,height);
   assert.deepEqual({left:view.left,top:view.top,width:view.width,height:view.height},{left:0,top:0,width,height},
    'The sole canvas must cover the complete viewport, rather than a cropped subject rectangle');
   const fullCamera=cameraFor(pose,width,height),croppedCamera=new T.PerspectiveCamera(pose.fov,width/height,pose.near,pose.far);
   croppedCamera.position.fromArray(pose.position);croppedCamera.up.fromArray(pose.up);
   croppedCamera.setViewOffset(view.fullWidth,view.fullHeight,view.offsetX,view.offsetY,view.width,view.height);
   croppedCamera.lookAt(...pose.target);croppedCamera.updateProjectionMatrix();croppedCamera.updateMatrixWorld(true);
   for(let index=0;index<support.length;index+=3){
    first.fromArray(support,index).project(fullCamera);second.fromArray(support,index).project(croppedCamera);
    const fullX=(first.x+1)*width/2,fullY=(1-first.y)*height/2;
    const croppedX=view.left+(second.x+1)*view.width/2,croppedY=view.top+(1-second.y)*view.height/2;
    assert(Math.abs(fullX-croppedX)<1e-6&&Math.abs(fullY-croppedY)<1e-6,
     'The full-viewport canvas must preserve every source point at the same reading-safe CSS coordinate');
    assert(Math.abs(first.z-second.z)<1e-12,'Changing the canvas rectangle cannot alter source depth or clipping');
    assert(Math.abs(second.x)<1&&Math.abs(second.y)<1&&second.z>-1&&second.z<1,
     'All model or complete phone support must remain inside the full viewport frustum');
   }
   // A native pointer uses the actual canvas rectangle. It must reconstruct
   // the same world ray, rather than orbiting or selecting an offset subject.
   const globalX=view.left+view.width*.43,globalY=view.top+view.height*.57;
   ndc.set(globalX/width*2-1,-globalY/height*2+1);fullRay.setFromCamera(ndc,fullCamera);
   ndc.set((globalX-view.left)/view.width*2-1,-(globalY-view.top)/view.height*2+1);croppedRay.setFromCamera(ndc,croppedCamera);
   assert(fullRay.ray.origin.distanceTo(croppedRay.ray.origin)<1e-12&&fullRay.ray.direction.distanceTo(croppedRay.ray.direction)<1e-12);
   const pixelBudget=phone?RESEARCH_PHONE_PIXELS:RESEARCH_MODEL_PIXELS;
   const fullBudget=resolveRenderBudget({width,height,deviceDpr:1,maxTextureSize:4096,pixelBudget});
   const croppedBudget=resolveRenderBudget({width:view.width,height:view.height,deviceDpr:1,maxTextureSize:4096,pixelBudget});
   assert(croppedBudget.pixels<=pixelBudget,'A full viewport cannot create an unbounded GPU attachment');
   assert.deepEqual(croppedBudget,fullBudget,'The renderer budget now applies to the real full viewport');
  }finally{phone?.dispose();}
 }
});


test('the bold scroll-only XR exterior arc and crane preserve every pinned source vertex and reading clearance on desktop and mobile',()=>{
 const path=createScrollCameraPath(XR_METHOD_CAMERA_KEYS),original=sourceState(),supportDigest=arrayDigest(sourceSupport),bounds={min:[Infinity,Infinity,Infinity],max:[-Infinity,-Infinity,-Infinity]};
 for(let i=0;i<sourceSupport.length;i++){const axis=i%3;bounds.min[axis]=Math.min(bounds.min[axis],sourceSupport[i]);bounds.max[axis]=Math.max(bounds.max[axis],sourceSupport[i]);}
 const centre=bounds.min.map((min,i)=>(min+bounds.max[i])/2);
 assert(path.at(-1).yawRad-path[0].yawRad>2.5,'The authored exterior arc is substantially broader than the former fourteen-degree study');
 assert(Math.max(...path.map(key=>key.pitchRad))-Math.min(...path.map(key=>key.pitchRad))>.5,'The crane deliberately changes elevation as well as orbit');
 for(const[width,height]of viewports)for(let index=0;index<=20;index++){
  const progress=index/20,intent=sampleScrollCamera(path,progress),pose=stageCameraPose(sourceSupport,width,height,{chapter:'method',cameraIntent:intent});
  assertProjected(sourceSupport,pose,width,height,false,`${width}×${height} bold method ${progress}`);
  assert(pose.distance>pose.radius,'The external camera cannot enter the enclosing source sphere');
  assert.deepEqual(pose.target,centre,'The target remains the actual unchanged source centre, not invented internal geometry');
 }
 assert.equal(arrayDigest(sourceSupport),supportDigest);assert.deepEqual(sourceState(),original,'A bolder authored camera never mutates source geometry, topology, normals or material');
});
