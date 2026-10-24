import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {collectProjectModelSupport} from '../components/project-model-recipe.mjs';
import {prepareHomeResearchScore,sampleHomeResearchScore,HOME_RESEARCH_PIXEL_BUDGET,HOME_RESEARCH_TOUCH_PIXEL_BUDGET} from '../runtime/site/home-research-score.mjs';
import {projectModelDrawDecision,applyProjectModelPresentationSet,inspectProjectModelSurface} from '../components/project-model-scene.mjs';
import {resolveRenderBudget} from '../components/render-budget.mjs';
const meta=JSON.parse(await readFile(new URL('../release/public/assets/source-layers.json',import.meta.url),'utf8'));
const bytes=await readFile(new URL('../release/public/assets/source-layers.glb',import.meta.url));
const gltf=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
const support=collectProjectModelSupport(gltf.scene);
const sourceHash=()=>createHash('sha256').update(new Uint8Array(support.buffer)).digest('hex');

test('Home camera samples original complete geometry at desktop/mobile ratios without editing source',()=>{
 const before=sourceHash(),metadata=JSON.stringify(meta),point=new T.Vector3();
 assert.equal(createHash('sha256').update(bytes).digest('hex'),meta.revision);
 for(const [width,height] of [[900,800],[390,420],[1440,900]]){
  const prepared=prepareHomeResearchScore(meta,width,height,support);
  for(const progress of [0,.14,.28,.4,.55,.7,.78,.9,1]){
   const result=sampleHomeResearchScore(prepared,progress),{pose}=result;
   assert.equal(result.sourceRevision,meta.revision);assert.equal(result.sourceGeometryUnmodified,true);assert.equal(pose.supportVertices,172789);
   assert.equal(result.material.finish,'satin');assert.deepEqual(result.direction,prepared.recipe.direction);
   const projected={min:[Infinity,Infinity],max:[-Infinity,-Infinity]};
   assert.equal(pose.fitSupportVertices,444);
   const camera=new T.PerspectiveCamera(pose.fov,pose.aspect,pose.near,pose.far);
   camera.position.fromArray(pose.position);camera.up.fromArray(pose.up);camera.lookAt(...pose.target);camera.updateMatrixWorld(true);
   for(let i=0;i<support.length;i+=3){
    point.fromArray(support,i).applyMatrix4(camera.matrixWorldInverse);
    assert(-point.z>pose.near&&-point.z<pose.far);
    point.applyMatrix4(camera.projectionMatrix);
    assert(Math.abs(point.x)<=pose.fill+1e-6&&Math.abs(point.y)<=pose.fill+1e-6,'actual source stays within convex support fit');
    for(const [axis,value] of [point.x,point.y].entries()){projected.min[axis]=Math.min(projected.min[axis],value);projected.max[axis]=Math.max(projected.max[axis],value);}
   }
   assert(Math.abs(Math.max(...projected.max.map((value,i)=>(value-projected.min[i])/2))-pose.fill)<1e-6,'real silhouette fills target rather than empty box corners');
  }
 }
 assert.equal(sourceHash(),before);assert.equal(JSON.stringify(meta),metadata);
});

test('scroll score is deterministic, reversible, continuous and has a genuine authored camera orbit',()=>{
 const prepared=prepareHomeResearchScore(meta,900,800,support);
 const samples=Array.from({length:101},(_,i)=>sampleHomeResearchScore(prepared,i/100));
 for(let i=100;i>=0;i--)assert.deepEqual(sampleHomeResearchScore(prepared,i/100),samples[i]);
 assert.deepEqual(samples[0].pose,samples[100].pose);
 assert.notDeepEqual(samples[0].pose.position,samples[55].pose.position);
 const start=new T.Vector3().fromArray(samples[0].pose.position).sub(new T.Vector3().fromArray(samples[0].pose.target));
 const detail=new T.Vector3().fromArray(samples[55].pose.position).sub(new T.Vector3().fromArray(samples[55].pose.target));
 assert(start.angleTo(detail)>.2,'orbit changes viewing direction, not only CSS scale');
 for(const boundary of [.28,.55,.78]){
  const a=sampleHomeResearchScore(prepared,boundary-1e-7),b=sampleHomeResearchScore(prepared,boundary+1e-7);
  assert(Math.hypot(...a.pose.position.map((value,i)=>value-b.pose.position[i]))<1e-4);
 }
 assert.deepEqual(sampleHomeResearchScore(prepared,-3),samples[0]);assert.deepEqual(sampleHomeResearchScore(prepared,3),samples[100]);
 for(const invalid of [NaN,Infinity,undefined])assert.throws(()=>sampleHomeResearchScore(prepared,invalid),/Finite/);
});

test('Home presentation has explicit bounded desktop/mobile allocations, independent of source resolution',()=>{
 assert.equal(HOME_RESEARCH_PIXEL_BUDGET,786432);assert.equal(HOME_RESEARCH_TOUCH_PIXEL_BUDGET,393216);
 for(const pixelBudget of [HOME_RESEARCH_PIXEL_BUDGET,HOME_RESEARCH_TOUCH_PIXEL_BUDGET])for(const [width,height] of [[390,844],[1440,1000],[10000,300]]){
  const actual=resolveRenderBudget({width,height,deviceDpr:4,maxTextureSize:4096,pixelBudget});assert(actual.pixels<=pixelBudget);
 }
});

// This exercises the production pure gate, not browser GPU completion.
test('draw gate deduplicates committed poses, retains suspended intent and prepares only on resize',()=>{
 let lastSize=null,lastProgress,draws=0,preparations=0;
 const submit=(progress,{width=900,height=800,suspended=false,success=true}={})=>{
  const decision=projectModelDrawDecision({lastSize,lastProgress,progress,width,height,suspended,animated:true});
  if(decision.prepare)preparations++;
  if(decision.draw){draws++;if(success){lastSize={width,height};lastProgress=progress;}}
  return decision;
 };
 submit(0);assert.equal(draws,1);assert.equal(preparations,1);
 for(let i=0;i<100;i++)submit(0);
 assert.equal(draws,1);assert.equal(preparations,1);
 submit(.5,{suspended:true});assert.equal(lastProgress,0);assert.equal(draws,1);
 submit(.5);assert.equal(draws,2);assert.equal(preparations,1);assert.equal(lastProgress,.5);
 submit(.7,{success:false});assert.equal(lastProgress,.5);
 submit(.7);assert.equal(draws,4);assert.equal(preparations,1);assert.equal(lastProgress,.7);
 submit(.7,{width:700,suspended:true});assert.equal(preparations,1);
 submit(.7,{width:700});assert.equal(draws,5);assert.equal(preparations,2);
 assert.deepEqual(projectModelDrawDecision({lastSize:{width:400,height:400},width:400,height:400,lastProgress:0,progress:1}),{resized:false,draw:false,prepare:false},'static card ignores presentation progress');
});

test('transparent Home scenery policy hides only non-source meshes and retains actual area lights',()=>{
 const group=new T.Group(),source=new T.Mesh(),scenery=new T.Mesh(),light=new T.RectAreaLight();
 source.userData.sourceGeometry=true;scenery.userData.sourceGeometry=false;group.add(source,scenery,light);
 const original={geometry:source.geometry,material:source.material,matrix:source.matrix.clone()};
 assert.deepEqual(applyProjectModelPresentationSet(group,null),{transparent:false,visibleEditorialMeshes:1,editorialAreaLights:1,contactFloorShadow:true});
 assert.deepEqual(applyProjectModelPresentationSet(group,{transparent:true,visibleEditorialSet:false}),{transparent:true,visibleEditorialMeshes:0,editorialAreaLights:1,contactFloorShadow:false});
 assert.equal(source.visible,true);assert.equal(light.visible,true);assert.equal(source.geometry,original.geometry);assert.equal(source.material,original.material);assert(source.matrix.equals(original.matrix));
});

test('one exposure draw can bypass same-pose dedup without refitting or bypassing suspension',()=>{
 const same={lastSize:{width:900,height:800},width:900,height:800,animated:true,lastProgress:0,progress:0};
 assert.deepEqual(projectModelDrawDecision(same),{resized:false,draw:false,prepare:false});
 assert.deepEqual(projectModelDrawDecision({...same,force:true}),{resized:false,draw:true,prepare:false});
 assert.deepEqual(projectModelDrawDecision({...same,force:true,suspended:true}),{resized:false,draw:false,prepare:false});
 assert.deepEqual(projectModelDrawDecision({...same,force:true,animated:false}),{resized:false,draw:false,prepare:false});
});

test('exposure surface evidence distinguishes DOM connection, hidden ancestors and viewport without GPU readback',()=>{
 const doc={hidden:false,querySelectorAll:()=>[{hidden:true,css:{display:'none'}}],documentElement:{getAttribute:()=> 'entered'},defaultView:{innerWidth:900,innerHeight:800,getComputedStyle:node=>node.css}};
 const css={display:'block',visibility:'visible',opacity:'1'},host={ownerDocument:doc,isConnected:true,tagName:'DIV',css,parentElement:null};
 const canvas={isConnected:true,width:900,height:800,tagName:'CANVAS',css,parentElement:host,getBoundingClientRect:()=>({left:0,top:0,right:900,bottom:800,width:900,height:800})};
 let surface=inspectProjectModelSurface(host,canvas);assert.equal(surface.connected,true);assert.equal(surface.visible,true);assert.equal(surface.intersectsViewport,true);assert.equal(surface.ancestors.length,2);
 host.css={...css,opacity:'0'};surface=inspectProjectModelSurface(host,canvas);assert.equal(surface.visible,false);assert.equal(surface.opacity,0);
 host.css={...css,visibility:'hidden'};assert.equal(inspectProjectModelSurface(host,canvas).visible,false);
 host.css=css;canvas.isConnected=false;assert.equal(inspectProjectModelSurface(host,canvas).connected,false);
});
