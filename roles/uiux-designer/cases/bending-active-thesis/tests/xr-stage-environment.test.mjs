import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {createXRStageEnvironment} from '../components/xr-stage-environment.mjs';
import {createResearchPhoneGeometry} from '../components/research-scene-geometry.mjs';
import study from '../release/xr-study.json' with {type:'json'};
import {xrStagePaintReady} from '../components/xr-stage-scene.mjs';

function camera(bounds){
 const center=bounds.min.map((v,i)=>(v+bounds.max[i])/2),result=new T.PerspectiveCamera(36,1.44,.001,100);
 result.position.set(center[0]+4,center[1]+2,center[2]+5);result.lookAt(...center);result.updateMatrixWorld();return result;
}

test('editorial-only paint cannot acknowledge a source, casing or recorded screen',()=>{
 const source={phone:false,calls:4,source:1,phoneBody:0,phoneScreen:0,stage:3};
 assert.equal(xrStagePaintReady(source),true);
 assert.equal(xrStagePaintReady({...source,calls:3,source:0}),false,'A fully painted stage cannot stand in for the original model');
 assert.equal(xrStagePaintReady({...source,shaderError:true}),false);
 assert.equal(xrStagePaintReady({...source,calls:1,stage:0}),false,'The requested project background must also be painted');
 const phone={phone:true,calls:5,source:0,phoneBody:1,phoneScreen:1,stage:3};
 assert.equal(xrStagePaintReady(phone),true);
 assert.equal(xrStagePaintReady({...phone,calls:3,phoneBody:0,phoneScreen:0}),false);
 assert.equal(xrStagePaintReady({...phone,calls:4,phoneScreen:0}),false,'The real source screen is required even when the casing paints');
 assert.equal(xrStagePaintReady({...phone,phoneBody:2,phoneScreen:0}),false,'A duplicated casing cannot substitute for the recorded pixels');
 assert.equal(xrStagePaintReady({...phone,calls:4,phoneBody:0}),false);
 assert.equal(xrStagePaintReady({...phone,calls:6}),false,'Unclassified extra draws cannot pass the ownership check');
});

test('XR owns the actual Bending editorial set without modifying original bounds or the final source camera',()=>{
 const bounds=structuredClone(study.model.bounds),before=structuredClone(bounds),scene=new T.Scene(),stage=createXRStageEnvironment({bounds});
 scene.add(stage.group);
 try{
  for(const chapter of ['context','method','adapt','assemble','join','making','credits']){
   const view=camera(bounds),matrix=view.matrixWorld.clone(),projection=view.projectionMatrix.clone();
   const report=stage.update({camera:view,chapter});
   assert.equal(report.owner,'exhibition-stage');assert.equal(report.sourceGeometry,false);assert.equal(report.areaLights,2);assert.equal(report.extraShadowMaps,0);
   assert.ok(report.meshDraws>=1&&report.meshDraws<=3);assert.ok(report.backdropLightField.coolEnergy>0);assert.ok(report.backdropLightField.warmEnergy>0);
   assert.ok(matrix.equals(view.matrixWorld));assert.ok(projection.equals(view.projectionMatrix));assert.deepEqual(bounds,before);
  }
  const meshes=stage.group.children.filter(node=>node.isMesh);
  assert.equal(meshes.length,3);assert.ok(meshes.every(node=>node.userData.sourceGeometry===false&&!node.castShadow));
  assert.equal(meshes.reduce((sum,node)=>sum+node.geometry.index.count/3,0),324);
 }finally{stage.dispose();stage.dispose();}
 assert.equal(scene.children.length,0);assert.equal(stage.group.children.length,0);
});

test('one XR set follows model and original device bounds without owning the phone screen or source materials',()=>{
 const phone=createResearchPhoneGeometry(654/1440),points=phone.support;
 const bounds={min:[0,1,2].map(axis=>Math.min(...Array.from(points).filter((_,i)=>i%3===axis))),max:[0,1,2].map(axis=>Math.max(...Array.from(points).filter((_,i)=>i%3===axis)))};
 const stage=createXRStageEnvironment({bounds:study.model.bounds});
 try{
  const group=stage.group,first=stage.update({camera:camera(study.model.bounds),chapter:'method'});
  const phoneReport=stage.update({camera:camera(bounds),chapter:'adapt',bounds});
  assert.equal(stage.group,group);assert.notEqual(phoneReport.radius,first.radius);
  assert.equal(group.position.y,bounds.min[1]);
  const end=stage.update({camera:camera(study.model.bounds),chapter:'making',bounds:study.model.bounds});assert.equal(end.radius,first.radius);
  assert.equal(phone.dimensions.aspect,654/1440);assert.equal(phone.screen.getAttribute('position').count>0,true);
 }finally{stage.dispose();phone.dispose();}
});

test('XR feathers only editorial shaders while preserving the original lighting and material extensions',()=>{
 const source=new T.MeshStandardMaterial(),screen=new T.MeshBasicMaterial({toneMapped:false});
 const sourceCompile=source.onBeforeCompile,screenCompile=screen.onBeforeCompile;
 const stage=createXRStageEnvironment({bounds:study.model.bounds});
 try{
  const meshes=stage.group.children.filter(node=>node.isMesh),compiled=[];
  for(const mesh of meshes){
   const original=mesh.material.isMeshStandardMaterial?T.ShaderLib.standard:T.ShaderLib.basic;
   const shader={uniforms:{},vertexShader:original.vertexShader,fragmentShader:original.fragmentShader};
   mesh.material.onBeforeCompile(shader);compiled.push(shader);
   assert.match(shader.fragmentShader,/xrStageEdge/);assert.match(shader.fragmentShader,/gl_FragCoord/);
   assert.match(mesh.material.customProgramCacheKey(),/\/xr-aperture-edge-v1$/);
   assert.ok(shader.fragmentShader.indexOf('diffuseColor.a *= xrStageCoverage')<shader.fragmentShader.indexOf('#include <alphatest_fragment>'));
   if(mesh.material.isMeshStandardMaterial){assert.match(shader.fragmentShader,/exhibitionCool/);assert.match(shader.fragmentShader,/totalEmissiveRadiance \+= exhibitionWarm/);}
   else assert.match(shader.fragmentShader,/vPracticalUv/);
  }
  assert.equal(compiled.length,3);assert.ok(compiled.every(shader=>shader.uniforms.xrStageBuffer===compiled[0].uniforms.xrStageBuffer));
  assert.ok(compiled.every(shader=>shader.uniforms.xrStageFeather===compiled[0].uniforms.xrStageFeather));
  assert.equal(source.onBeforeCompile,sourceCompile);assert.equal(screen.onBeforeCompile,screenCompile);assert.equal(screen.toneMapped,false);
  assert.ok(!source.customProgramCacheKey().includes('xr-aperture-edge'));assert.ok(!screen.customProgramCacheKey().includes('xr-aperture-edge'));
 }finally{stage.dispose();source.dispose();screen.dispose();}
});

test('feather uniforms use actual post-budget buffer dimensions and CSS aperture scale without recompilation',()=>{
 const stage=createXRStageEnvironment({bounds:study.model.bounds});
 try{
  const material=stage.group.children.find(node=>node.isMesh).material,version=material.version;
  const shader={uniforms:{},vertexShader:T.ShaderLib.standard.vertexShader,fragmentShader:T.ShaderLib.standard.fragmentShader};material.onBeforeCompile(shader);
  const buffer=shader.uniforms.xrStageBuffer,feather=shader.uniforms.xrStageFeather;
  const desktop={viewportWidth:1440,renderView:{width:734.4,height:780},drawingBuffer:{width:700,height:748}};
  let report=stage.update({camera:camera(study.model.bounds),chapter:'context',...desktop});
  assert.deepEqual(buffer.value.toArray(),[700,748]);assert.equal(feather.value.x,80*700/734.4);assert.equal(feather.value.y,80*748/780);
  assert.equal(report.edgeFeather.owner,'xr-editorial-materials-only');assert.equal(report.edgeFeather.cssPixels,80);assert.deepEqual(report.edgeFeather.drawingBuffer,[700,748]);
  const mobile={viewportWidth:390,renderView:{width:366.6,height:379.8},drawingBuffer:{width:600,height:622}};
  report=stage.update({camera:camera(study.model.bounds),chapter:'method',...mobile});
  assert.equal(shader.uniforms.xrStageBuffer,buffer);assert.equal(shader.uniforms.xrStageFeather,feather);
  assert.deepEqual(buffer.value.toArray(),[600,622]);assert.equal(feather.value.x,32*600/366.6);assert.equal(feather.value.y,32*622/379.8);assert.equal(report.edgeFeather.cssPixels,32);
  assert.equal(material.version,version,'Dimensions mutate stable uniforms and never force a shader compile');
  assert.deepEqual(report.edgeFeather.physicalPixels,feather.value.toArray());
  assert.throws(()=>stage.update({camera:camera(study.model.bounds),chapter:'context',...desktop,drawingBuffer:{width:0,height:748}}),RangeError);
 }finally{stage.dispose();}
});

test('disposing XR feather extensions restores callbacks and releases each owned set resource exactly once',()=>{
 const stage=createXRStageEnvironment({bounds:study.model.bounds}),meshes=stage.group.children.filter(node=>node.isMesh);
 const materials=new Set(meshes.map(node=>node.material)),geometries=new Set(meshes.map(node=>node.geometry)),releases=new Map();
 for(const resource of [...materials,...geometries])resource.addEventListener('dispose',()=>releases.set(resource,(releases.get(resource)??0)+1));
 const keys=[...materials].map(material=>material.customProgramCacheKey());
 assert.ok(keys.every(key=>key.endsWith('/xr-aperture-edge-v1')));
 stage.dispose();stage.dispose();
 assert.ok([...materials].every(material=>!material.customProgramCacheKey().includes('/xr-aperture-edge-v1')));
 assert.ok([...materials,...geometries].every(resource=>releases.get(resource)===1));
 assert.equal(stage.group.children.length,0);
 assert.throws(()=>stage.update({camera:camera(study.model.bounds),chapter:'context'}),/disposed/);
});
