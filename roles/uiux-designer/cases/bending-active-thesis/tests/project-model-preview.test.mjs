import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {HDRLoader} from 'three/addons/loaders/HDRLoader.js';
import {validateProjectModelMetadata,collectProjectModelSupport,sampleProjectModelRecipe,PROJECT_MODEL_PIXEL_BUDGET,PROJECT_MODEL_FRAME_FILL} from '../components/project-model-recipe.mjs';
import {acquireProjectModelScene,commitProjectModelDraw} from '../components/project-model-scene.mjs';
import {sampleCinematicPose} from '../components/vendor/cinematic-plan.mjs';
import {resolveRenderBudget} from '../components/render-budget.mjs';

const meta=JSON.parse(await readFile(new URL('../release/public/assets/source-layers.json',import.meta.url),'utf8'));
const bytes=await readFile(new URL('../release/public/assets/source-layers.glb',import.meta.url));
const gltf=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
const meshes=[];gltf.scene.traverse(node=>{if(node.isMesh)meshes.push(node);});
const support=collectProjectModelSupport(gltf.scene);
const geometryState=()=>meshes.map(node=>({role:node.userData.role,position:node.position.toArray(),rotation:node.quaternion.toArray(),scale:node.scale.toArray(),digest:createHash('sha256').update(new Uint8Array(node.geometry.attributes.position.array.buffer)).digest('hex')}));
test('the static card fits every actual GLB vertex without cropping and centers a 90-percent-wide square composition',()=>{
 const original=JSON.stringify(meta);assert.equal(validateProjectModelMetadata(meta),meta);
 assert.equal(createHash('sha256').update(bytes).digest('hex'),meta.revision);
 assert.equal(support.length,meta.vertices*3);assert.deepEqual(meshes.map(node=>node.userData.role).sort(),['base-lower','base-upper','shell']);
 const sourceGeometry=geometryState(),point=new T.Vector3();let offset=0;
 for(const node of meshes){
  assert.equal(node.geometry.attributes.position.count,meta.layers.find(layer=>layer.id===node.userData.role).vertices);
  for(let i=0;i<node.geometry.attributes.position.count;i++){
   point.fromBufferAttribute(node.geometry.attributes.position,i).applyMatrix4(node.matrixWorld);
   for(const value of point.toArray())assert(Math.abs(value-support[offset++])<1e-12);
  }
 }
 for(const [width,height] of [[400,400],[320,500],[700,240],[1600,900]]){
  const recipe=sampleProjectModelRecipe(meta,width,height,support),{pose}=recipe;
  assert.equal(recipe.sourceRevision,meta.revision);assert.equal(recipe.chapterScene.chapter,'overview');assert.equal(recipe.chapterScene.activeSeconds,0);assert.equal(recipe.pixelBudget,262144);
  assert.equal(recipe.material.progress,0);assert.equal(recipe.material.finish,'satin');assert(Number.isFinite(recipe.material.emphasis));assert.equal(recipe.baseMultiplier,.6+recipe.direction.stage.baseEmphasis*.4);
  assert.equal(pose.framing,'source-vertices');assert.equal(pose.supportVertices,172789);assert.equal(pose.fill,PROJECT_MODEL_FRAME_FILL);
  const originalPose=sampleCinematicPose(.5/7,width/height,{x:0,y:0},{bounds:meta.bounds,modelRevision:meta.revision,sharedStage:true});
  const originalBack=new T.Vector3().fromArray(originalPose.position).sub(new T.Vector3().fromArray(originalPose.target)).normalize();
  const fittedBack=new T.Vector3().fromArray(pose.position).sub(new T.Vector3().fromArray(pose.target)).normalize();
  assert(originalBack.distanceTo(fittedBack)<1e-12);assert.equal(pose.fov,originalPose.fov);
  const camera=new T.PerspectiveCamera(pose.fov,pose.aspect,pose.near,pose.far);camera.position.fromArray(pose.position);camera.up.fromArray(pose.up);camera.lookAt(...pose.target);camera.updateMatrixWorld(true);
  const projected={min:[Infinity,Infinity],max:[-Infinity,-Infinity]},roles=new Set();
  for(const node of meshes){
   roles.add(node.userData.role);
   for(let i=0;i<node.geometry.attributes.position.count;i++){
    point.fromBufferAttribute(node.geometry.attributes.position,i).applyMatrix4(node.matrixWorld).applyMatrix4(camera.matrixWorldInverse);
    assert(-point.z>pose.near&&-point.z<pose.far,'every real source vertex remains between near and far');
    point.applyMatrix4(camera.projectionMatrix);assert(Math.abs(point.x)<=.9+1e-9&&Math.abs(point.y)<=.9+1e-9&&Math.abs(point.z)<1,'every source vertex projects inside the inset frustum');
    projected.min[0]=Math.min(projected.min[0],point.x);projected.max[0]=Math.max(projected.max[0],point.x);projected.min[1]=Math.min(projected.min[1],point.y);projected.max[1]=Math.max(projected.max[1],point.y);
   }
  }
  assert.equal(roles.size,3);
  const occupancy=projected.max.map((value,i)=>(value-projected.min[i])/2);
  assert(Math.abs(Math.max(...occupancy)-.9)<1e-8,'at least one real silhouette axis fills 90 percent');
  projected.max.forEach((value,i)=>assert(Math.abs(value+projected.min[i])<1e-6,'true perspective silhouette is centered'));
  if(width===height)assert(occupancy[0]>=.85&&occupancy[0]<=.92,'square-card model width matches the approved framing target');
  assert.deepEqual(sampleProjectModelRecipe(meta,width,height,support),recipe);
 }
 assert.equal(JSON.stringify(meta),original);assert.deepEqual(geometryState(),sourceGeometry);
});
test('source support includes nested native node transforms instead of local positions or empty box corners',()=>{
 const assembly=gltf.scene.clone(true),parent=new T.Group();parent.position.set(.4,-.2,.7);parent.rotation.set(.2,-.3,.1);parent.scale.set(1.1,.9,1.2);parent.add(assembly);
 const points=collectProjectModelSupport(parent),point=new T.Vector3();let offset=0;
 assembly.traverse(node=>{
  if(!node.isMesh)return;
  for(let i=0;i<node.geometry.attributes.position.count;i++){
   point.fromBufferAttribute(node.geometry.attributes.position,i).applyMatrix4(node.matrixWorld);
   point.toArray().forEach(value=>assert(Math.abs(value-points[offset++])<1e-12));
  }
 });
 assert.equal(offset,meta.vertices*3);assert.notDeepEqual(points,support);
});
test('preview allocation stays below its smaller cap and rejects unaudited metadata before a renderer is created',()=>{
 for(const [width,height] of [[400,400],[10000,300],[300,10000]]){
  const budget=resolveRenderBudget({width,height,deviceDpr:4,maxTextureSize:4096,pixelBudget:PROJECT_MODEL_PIXEL_BUDGET});assert(budget.pixels<=262144);
 }
 for(const patch of [{revision:'wrong'},{triangles:1},{layers:[]},{viewerUnits:'millimeters'}])assert.throws(()=>validateProjectModelMetadata({...meta,...patch}));
 assert.throws(()=>sampleProjectModelRecipe(meta,0,300));
 assert.throws(()=>sampleProjectModelRecipe(meta,400,400),/All preview source vertices/);
 assert.throws(()=>sampleProjectModelRecipe(meta,400,400,support.subarray(3)),/All preview source vertices/);
 const invalid=support.slice();invalid[0]=NaN;assert.throws(()=>sampleProjectModelRecipe(meta,400,400,invalid),/Non-finite preview vertex/);
});
test('an already aborted acquisition does not access host, import assets or create a GPU context',async()=>{
 const abort=new AbortController();abort.abort();
 await assert.rejects(acquireProjectModelScene({host:null,signal:abort.signal}),error=>error.name==='AbortError');
});

test('the visible model commit requires a successful draw, live context and valid shaders before canvas attachment',()=>{
 const events=[],canvas={parentNode:null},scene={},camera={},host={appendChild(value){assert.equal(value,canvas);events.push('append');canvas.parentNode=host;}};
 let lost=false,shader=null,renderError=null;
 const renderer={domElement:canvas,info:{render:{calls:0}},render(actualScene,actualCamera){assert.equal(actualScene,scene);assert.equal(actualCamera,camera);events.push('render');if(renderError)throw renderError;},getContext:()=>({isContextLost:()=>lost})};
 const draw=()=>commitProjectModelDraw({renderer,scene,camera,host,shaderFailure:()=>shader});
 assert.throws(draw,/did not draw/);assert.equal(canvas.parentNode,null);
 renderer.info.render.calls=12;lost=true;assert.throws(draw,/did not draw/);assert.equal(canvas.parentNode,null);
 lost=false;shader=Error('Shader failed');assert.throws(draw,/Shader failed/);assert.equal(canvas.parentNode,null);
 shader=null;renderError=Error('Renderer failed');assert.throws(draw,/Renderer failed/);assert.equal(canvas.parentNode,null);
 renderError=null;events.length=0;assert.deepEqual(draw(),{calls:12});assert.deepEqual(events,['render','append']);
 events.length=0;draw();assert.deepEqual(events,['render'],'later demand draws reuse the same canvas');
});
test('owned native HDR bytes preserve the old loader texture data/defaults and release after a peer asset fails',async t=>{
 const file=await readFile(new URL('../release/public/assets/studio-small.hdr',import.meta.url)),buffer=file.buffer.slice(file.byteOffset,file.byteOffset+file.byteLength);
 const abort=new AbortController(),requests=[],created=[];let disposals=0;
 const parse=HDRLoader.prototype.createDataTexture;
 t.mock.method(HDRLoader.prototype,'createDataTexture',function(bytes){const texture=parse.call(this,bytes);texture.addEventListener('dispose',()=>disposals++);created.push(texture);return texture;});
 t.mock.method(globalThis,'fetch',async(url,options)=>{
  if(url instanceof Request)return{status:200,body:undefined,arrayBuffer:async()=>buffer};
  requests.push({url,signal:options.signal});
  if(url.endsWith('.hdr'))return{ok:true,arrayBuffer:async()=>buffer};
  if(url.endsWith('.json'))return{ok:true,json:async()=>meta};
  return{ok:false};
 });
 // A failed GLB deliberately prevents renderer construction. HDR still runs
 // through the actual production acquisition and must be released on failure.
 await assert.rejects(acquireProjectModelScene({host:null,signal:abort.signal}),/Project model assets unavailable/);
 assert.deepEqual(requests.map(({url})=>url).sort(),['/assets/source-layers.glb','/assets/source-layers.json','/assets/studio-small.hdr']);
 assert(requests.every(request=>request.signal===abort.signal));assert.equal(created.length,1);assert.equal(disposals,1);
 const legacy=await new HDRLoader(new T.LoadingManager()).loadAsync('https://preview.invalid/legacy.hdr'),actual=created[0];
 try{
  assert.deepEqual(actual.image,legacy.image);
  for(const property of ['type','format','colorSpace','flipY','generateMipmaps','wrapS','wrapT','magFilter','minFilter','anisotropy','unpackAlignment','mapping'])assert.equal(actual[property],legacy[property],property);
  assert.equal(actual.type,T.HalfFloatType);assert.equal(actual.colorSpace,T.LinearSRGBColorSpace);
 }finally{legacy.dispose();}
});
test('HTTP failure and an aborted late HDR body never reach parsing or GPU allocation',async t=>{
 let mode='http',parseCount=0,resolveBody,bodyStarted;
 const body=new Promise(resolve=>{resolveBody=resolve;}),started=new Promise(resolve=>{bodyStarted=resolve;});
 t.mock.method(HDRLoader.prototype,'createDataTexture',()=>{parseCount++;throw Error('Unexpected HDR parse');});
 t.mock.method(globalThis,'fetch',async(url,{signal})=>{
  assert(signal instanceof AbortSignal);
  if(url.endsWith('.hdr'))return mode==='http'?{ok:false,arrayBuffer:()=>assert.fail('HTTP failure body must not be read')}:{ok:true,arrayBuffer:()=>{bodyStarted();return body;}};
  if(url.endsWith('.json'))return{ok:true,json:async()=>meta};
  return{ok:false};
 });
 await assert.rejects(acquireProjectModelScene({host:null,signal:new AbortController().signal}),/Project model assets unavailable/);
 mode='late';const abort=new AbortController(),pending=acquireProjectModelScene({host:null,signal:abort.signal});
 await started;abort.abort();await assert.rejects(pending,error=>error.name==='AbortError');
 resolveBody(new ArrayBuffer(16));await new Promise(setImmediate);
 assert.equal(parseCount,0);
});
