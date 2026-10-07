'use client';
import {useEffect,useRef,useMemo,useState,Suspense} from 'react';
import {Canvas,useFrame,useThree} from '@react-three/fiber';
import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {HDRLoader} from 'three/addons/loaders/HDRLoader.js';
import {createInspectionMaterial} from './materials/inspection-material';
import {createBendingActiveCameraPlan,sampleBendingActivePose,sampleBendingActiveInspection} from './vendor/camera-plan.mjs';
function World({input,onReady,onFailure}){
 const {gl,camera,scene,invalidate,size}=useThree();
 const root=useMemo(()=>new T.Group(),[]),data=useRef(null),frames=useRef(0),lastPose=useRef(null);
 useEffect(()=>input.subscribe(invalidate),[input,invalidate]);
 useEffect(()=>{
  let cancelled=false,cleanup=()=>{};
  const lost=e=>{e.preventDefault();onFailure();};gl.domElement.addEventListener('webglcontextlost',lost);
  Promise.allSettled([new GLTFLoader().loadAsync('/assets/assembly.glb'),new HDRLoader().loadAsync('/assets/studio-small.hdr'),fetch('/assets/model.json').then(r=>{if(!r.ok)throw Error('Missing model record');return r.json();})]).then(results=>{
   if(results.some(result=>result.status==='rejected')){
    if(results[0].status==='fulfilled')results[0].value.scene.traverse(node=>{if(node.isMesh){node.geometry.dispose();const ms=Array.isArray(node.material)?node.material:[node.material];ms.forEach(m=>m.dispose());}});
    if(results[1].status==='fulfilled')results[1].value.dispose();
    if(!cancelled)onFailure();return;
   }
   const [gltf,hdr,meta]=results.map(result=>result.value);
   const pmrem=new T.PMREMGenerator(gl),environment=pmrem.fromEquirectangular(hdr);hdr.dispose();pmrem.dispose();
   const materials=[],geometries=[],lines=[];
   gltf.scene.traverse(node=>{if(!node.isMesh)return;
    geometries.push(node.geometry);const originals=Array.isArray(node.material)?node.material:[node.material];originals.forEach(m=>m.dispose());
    const adapter=createInspectionMaterial({mode:'material',color:'#c3c6c6',metalness:.88,roughness:.33,bounds:meta.bounds});materials.push(adapter);node.material=adapter.material;node.castShadow=true;node.receiveShadow=true;
    const edgeGeometry=new T.EdgesGeometry(node.geometry,45),edgeMaterial=new T.LineBasicMaterial({color:'#dcddd4',transparent:true,opacity:.72,depthTest:true});
    const edge=new T.LineSegments(edgeGeometry,edgeMaterial);edge.visible=false;edge.name='inspected-mesh-edges';node.add(edge);lines.push(edge);
   });
   cleanup=()=>{root.remove(gltf.scene);geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());lines.forEach(e=>{e.geometry.dispose();e.material.dispose();});if(scene.environment===environment.texture)scene.environment=null;environment.dispose();data.current=null;};
   if(cancelled){cleanup();return;}
   scene.environment=environment.texture;scene.environmentIntensity=.75;root.add(gltf.scene);data.current={meta,materials,lines,ready:false};invalidate();
  }).catch(()=>{if(!cancelled)onFailure();});
  window.__thesis={inspect:()=>({ready:!!data.current?.ready,frames:frames.current,...input.get(),pose:lastPose.current,model:data.current?.meta??null,renderer:{calls:gl.info.render.calls,triangles:gl.info.render.triangles},memory:{...gl.info.memory}}),loseContext:()=>gl.getContext().getExtension('WEBGL_lose_context')?.loseContext()};
  return()=>{cancelled=true;gl.domElement.removeEventListener('webglcontextlost',lost);cleanup();delete window.__thesis;};
 },[gl,input,invalidate,onFailure,root,scene]);
 useFrame(()=>{
  const d=data.current;if(!d)return;
  const state=input.get();const plan=createBendingActiveCameraPlan({bounds:d.meta.bounds,aspect:size.width/size.height,forward:[.5,0,.866025403784],modelRevision:d.meta.revision});
  const pose=state.mode==='inspect'?sampleBendingActiveInspection(plan,state.u):sampleBendingActivePose(plan,state.u,{reducedMotion:state.mode==='static'||state.reduced});
  camera.position.fromArray(pose.position);camera.up.fromArray(pose.up);camera.fov=pose.fov;camera.near=pose.near;camera.far=Math.max(pose.far,35);camera.lookAt(...pose.target);camera.updateProjectionMatrix();lastPose.current=pose;
  d.materials.forEach(a=>{a.update({progress:state.u,mode:state.representation==='contours'?'contours':'material'});a.material.color.set(state.representation==='edges'?'#273239':'#c3c6c6');a.material.metalness=state.representation==='edges'?.2:.88;});
  d.lines.forEach(e=>e.visible=state.representation==='edges');frames.current++;
  if(!d.ready){d.ready=true;queueMicrotask(onReady);}
 });
 return <><primitive object={root} dispose={null}/><color attach="background" args={['#11171b']}/><fog attach="fog" args={['#11171b',10,22]}/><hemisphereLight args={['#d4dfea','#444033',.8]}/><directionalLight position={[3,6,2]} intensity={2} color="#fff1d5" castShadow shadow-mapSize={[1024,1024]} shadow-camera-left={-4} shadow-camera-right={4} shadow-camera-top={4} shadow-camera-bottom={-4} shadow-bias={-.0002}/><directionalLight position={[-3,2,-3]} intensity={1.3} color="#c2ddf6"/><mesh rotation={[-Math.PI/2,0,0]} position={[0,-.015,0]} receiveShadow><planeGeometry args={[200,200]}/><meshStandardMaterial color="#161d21" roughness={.9}/></mesh></>;
}
export default function Scene(props){
 const [supported,setSupported]=useState(false);
 useEffect(()=>{let probe;try{probe=document.createElement('canvas').getContext('webgl2');if(!probe){props.onFailure();return;}probe.getExtension('WEBGL_lose_context')?.loseContext();setSupported(true);}catch{props.onFailure();}},[props.onFailure]);
 return supported?<Canvas shadows frameloop="demand" dpr={[1,1.5]} camera={{position:[4,3,6],fov:38}} gl={{antialias:true,alpha:false,powerPreference:'high-performance'}} fallback={<p>3D is unavailable on this device.</p>} onCreated={({gl})=>{gl.toneMapping=T.ACESFilmicToneMapping;gl.toneMappingExposure=1;gl.outputColorSpace=T.SRGBColorSpace;}}><Suspense fallback={null}><World {...props}/></Suspense></Canvas>:null;
}
