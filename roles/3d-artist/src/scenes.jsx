import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js';
import { createInspectionScore } from './motion/theatre/runtime';
import { seedParticles, writeParticles } from './particles';

export function Stage({study,params,playing,setPlaying,epoch,api,onReady,onFailure}) {
  return <Canvas frameloop="demand" dpr={[1,1.5]} shadows="variance" camera={{position:[4.8,3.2,6.8],fov:35}} gl={{antialias:true,alpha:false}} fallback={<p>WebGL is unavailable. The static comparison remains available.</p>}>
    <color attach="background" args={['#171c20']}/>
    <World {...{study,params,playing,setPlaying,epoch,api,onReady,onFailure}}/>
  </Canvas>;
}
function World({study,params,playing,setPlaying,epoch,api,onReady,onFailure}) {
  const {gl,scene,camera,invalidate} = useThree();
  const state=useRef({frames:0,time:0,physicsSteps:0,owner:'inspection',assembly:0,pose:{}});
  const [environmentReady,setEnvironmentReady]=useState(false);
  useEffect(()=>{const lost=event=>{event.preventDefault();onFailure();};gl.domElement.addEventListener('webglcontextlost',lost);return()=>gl.domElement.removeEventListener('webglcontextlost',lost);},[gl,onFailure]);
  useEffect(()=>{
    let live=true,target;
    new HDRLoader().load('/assets/studio_small_09_1k.hdr', texture=>{
      if(!live){texture.dispose();return;}
      const generator=new THREE.PMREMGenerator(gl);target=generator.fromEquirectangular(texture);generator.dispose();texture.dispose();scene.environment=target.texture;scene.environmentIntensity=.8;setEnvironmentReady(true);invalidate();
    },undefined,onFailure);
    return()=>{live=false;scene.environment=null;target?.dispose();};
  },[gl,scene,invalidate,onFailure]);
  useEffect(()=>{gl.toneMappingExposure=params.exposure;invalidate();},[gl,params.exposure,invalidate]);
  useEffect(()=>{if(playing)invalidate();},[playing,invalidate]);
  useEffect(()=>{state.current.time=0;},[epoch,study.id]);
  useEffect(()=>{
    api.current={step:()=>{state.current.stepPending=true;invalidate();},inspect:()=>({...state.current,camera:{position:camera.position.toArray(),projection:camera.type,fov:camera.fov??null},memory:{...gl.info.memory},calls:gl.info.render.calls}),capture:()=>{gl.render(scene,camera);return{image:gl.domElement.toDataURL('image/png'),state:{...state.current,camera:{position:camera.position.toArray(),projection:camera.type,fov:camera.fov??null}}};},loseContext:()=>gl.getContext().getExtension('WEBGL_lose_context')?.loseContext()};
    window.__artist3d=api.current;
    return()=>{api.current=null;delete window.__artist3d;};
  },[gl,scene,camera,api,invalidate]);
  useEffect(()=>{if(environmentReady){onReady();invalidate();}},[environmentReady,onReady,invalidate]);
  useFrame((_,delta)=>{state.current.frames++;state.current.stepDelta=state.current.stepPending?1/60:0;state.current.stepPending=false;state.current.time+=state.current.stepDelta;if(playing && study.id!=='camera'){state.current.time+=Math.min(delta,.1);invalidate();}},-2);
  return <>
    <CameraOwner {...{params,study,playing,setPlaying,epoch,state}}/>
    <LightRig params={params}/>
    <mesh position={[0,-1.52,0]} rotation={[-Math.PI/2,0,0]} receiveShadow><planeGeometry args={[200,200]}/><meshStandardMaterial color="#22292e" roughness={.85}/></mesh>
    <gridHelper args={[8,16,'#465057','#30383e']} position={[0,-1.50,0]}/>
    {study.id==='refraction'?<Optics params={params}/>:study.id==='scattering'?<ScatterSurface amount={params.scatter}/>:study.id==='physics'?<DropBodies key={epoch+':'+params.restitution+':'+params.gravity} {...{params,playing,state}}/>:study.id==='particles'?<ParticleField key={epoch+':'+params.seed+':'+params.count} {...{params,playing,state}}/>:<Aperture params={params} state={state} animated={study.id==='camera'}/>}
  </>;
}
function LightRig({params}) {
  return <><ambientLight intensity={.08}/><directionalLight position={[3,6,3]} intensity={3} color="#fff2dd" castShadow shadow-mapSize={[1024,1024]} shadow-radius={params.softness} shadow-blurSamples={8} shadow-bias={-.0005} shadow-normalBias={.02} shadow-camera-left={-4} shadow-camera-right={4} shadow-camera-top={4} shadow-camera-bottom={-4}/><directionalLight position={[-4,2,1]} intensity={params.fill} color="#b9d4e3"/><directionalLight position={[0,3,-4]} intensity={2} color="#ff9662"/></>;
}
function Surface({params}) {return <meshPhysicalMaterial color={params.metalness>.5?'#bdc7c8':'#e4bfa0'} metalness={params.metalness} roughness={params.roughness} clearcoat={params.coat} clearcoatRoughness={.12}/>;}
function Aperture({params,state,animated}) {
  const rings=useRef([]);
  useFrame(()=>{if(animated) rings.current.forEach((ring,i)=>{if(ring) ring.position.z=(i-8)*(.115+state.current.assembly*.095);});});
  return <group rotation={[.12,-.15,0]}>
    {Array.from({length:17},(_,i)=><mesh key={i} ref={e=>rings.current[i]=e} position={[0,0,(i-8)*.115]} rotation={[0,0,(i-8)*.03]} scale={[1, .88+.1*Math.cos(i*.3),1]} castShadow receiveShadow><torusGeometry args={[1.06+.18*Math.cos((i-8)*.2),.055,12,96]}/><Surface params={params}/></mesh>)}
    {[0,Math.PI*.5,Math.PI,Math.PI*1.5].map((angle,i)=><mesh key={i} position={[Math.sin(angle)*1.25,Math.cos(angle)*1.1,0]} rotation={[Math.PI/2,0,0]} castShadow><cylinderGeometry args={[.04,.04,2.1,16]}/><meshStandardMaterial color="#646c70" metalness={.85} roughness={.3}/></mesh>)}
    <mesh position={[0,0,-.9]}><torusGeometry args={[.61,.035,12,64]}/><meshStandardMaterial color="#ff7a45" metalness={.25} roughness={.35}/></mesh>
  </group>;
}
function Optics({params}) {
  return <><mesh position={[0,0,-.25]} rotation={[.1,-.35,.15]}><torusGeometry args={[.91,.35,32,128]}/><meshPhysicalMaterial color="#ffffff" transmission={1} opacity={1} roughness={params.roughness} thickness={params.thickness} ior={params.ior} attenuationColor="#d6e5df" attenuationDistance={3} metalness={0}/></mesh>
    {Array.from({length:13},(_,i)=><mesh key={i} position={[(i-6)*.25,0,-1.45]}><boxGeometry args={[.1,3,.04]}/><meshStandardMaterial color={i%3===0?'#ff7a45':'#e4e0d6'} roughness={.7}/></mesh>)}
    <mesh position={[0,0,-1.5]}><boxGeometry args={[3.6,3.2,.05]}/><meshStandardMaterial color="#11171b"/></mesh></>;
}
const vertex=`varying vec3 vNormalWorld; varying vec3 vPositionWorld; void main(){vNormalWorld=normalize(mat3(modelMatrix)*normal);vPositionWorld=(modelMatrix*vec4(position,1.0)).xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`;
const fragment=`uniform float amount; varying vec3 vNormalWorld; varying vec3 vPositionWorld; void main(){vec3 n=normalize(vNormalWorld);vec3 l=normalize(vec3(-2.5,1.5,-3.0)-vPositionWorld);float nl=dot(n,l);float lambert=max(0.,nl);float wrap=max(0.,(nl+.5)/1.5);float thickness=.25+.75*abs(n.z);float through=max(0.,dot(-n,l))*exp(-thickness*1.8);vec3 base=vec3(.62,.26,.10);vec3 c=base*(.12+mix(lambert,wrap,amount))+amount*through*vec3(1.,.43,.14)*2.;gl_FragColor=vec4(c,1.);#include <tonemapping_fragment>
#include <colorspace_fragment>
}`.replace(';#include',';\n#include');
function ScatterSurface({amount}) {
  const uniforms=useMemo(()=>({amount:{value:amount}}),[]);
  useEffect(()=>{uniforms.amount.value=amount;},[amount,uniforms]);
  return <group rotation={[.2,-.3,0]}>{[-.6,0,.6].map((z,i)=><mesh key={i} position={[0,0,z]}><torusGeometry args={[1,.19,24,96]}/><shaderMaterial vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms}/></mesh>)}</group>;
}
function DropBodies({params,playing,state}) {
  const sim=useRef(null),meshes=useRef([]);const {invalidate}=useThree();
  useEffect(()=>{let live=true;import('./physics.js').then(async({initPhysics,createDropWorld})=>{await initPhysics();if(!live)return;sim.current=createDropWorld(params.restitution,params.gravity);invalidate();});return()=>{live=false;sim.current?.dispose();sim.current=null;};},[params.restitution,params.gravity,invalidate]);
  useFrame((_,delta)=>{if(!sim.current)return;if(playing||state.current.stepDelta)sim.current.advance(playing?delta:state.current.stepDelta);state.current.physicsSteps=sim.current.steps;state.current.bodies=sim.current.bodies.map((b,i)=>{const p=b.translation(),q=b.rotation();meshes.current[i]?.position.set(p.x,p.y,p.z);meshes.current[i]?.quaternion.set(q.x,q.y,q.z,q.w);return[p.x,p.y,p.z];});});
  return <>{Array.from({length:12},(_,i)=><mesh key={i} ref={e=>meshes.current[i]=e} castShadow><sphereGeometry args={[.25,24,16]}/><meshPhysicalMaterial color={i%3===0?'#ed844e':'#afc1c9'} metalness={.7} roughness={.25}/></mesh>)}
    <mesh position={[0,-1.5,0]} receiveShadow><boxGeometry args={[4.6,.24,3.2]}/><meshStandardMaterial color="#424c51" metalness={.5} roughness={.45}/></mesh>
    {[[-2.3,-.95,0,.2,1.1,3.2],[2.3,-.95,0,.2,1.1,3.2],[0,-.95,-1.6,4.6,1.1,.2],[0,-.95,1.6,4.6,1.1,.2]].map(([x,y,z,w,h,d],i)=><mesh key={i} position={[x,y,z]}><boxGeometry args={[w,h,d]}/><meshStandardMaterial color="#738085" transparent opacity={.18} depthWrite={false}/></mesh>)}
  </>;
}
function ParticleField({params,state}) {
  const seeds=useMemo(()=>seedParticles(params.count,params.seed),[params.count,params.seed]);
  const positions=useMemo(()=>writeParticles(new Float32Array(seeds.length),seeds,0,params.flow),[seeds]);const attr=useRef();
  const trail=useMemo(()=>new Float32Array(Math.min(params.count,120)*3*2*8),[params.count]);const trailAttr=useRef();
  useFrame(()=>{
    writeParticles(positions,seeds,state.current.time,params.flow);attr.current.needsUpdate=true;state.current.particleSample??=new Array(9);for(let j=0;j<9;j++)state.current.particleSample[j]=positions[j];
    let offset=0;for(let i=0;i<Math.min(params.count,120);i++)for(let segment=0;segment<8;segment++){
      let previousY;for(let end=0;end<2;end++){const t=state.current.time-(segment+end)*.12;const a=seeds[i*3]*Math.PI*2+t*params.flow*(.35+seeds[i*3+1]*.3),r=.6+seeds[i*3+1]*1.25,y=((seeds[i*3+2]*3+t*.3)%3+3)%3-1.3;
        if(end===1&&Math.abs(y-previousY)>1){trail[offset]=trail[offset-3];trail[offset+1]=trail[offset-2];trail[offset+2]=trail[offset-1];offset+=3;}else{trail[offset++]=Math.cos(a)*r;trail[offset++]=y;trail[offset++]=Math.sin(a)*r;}previousY=y;
      }
    }trailAttr.current.needsUpdate=true;
  });
  return <><points><bufferGeometry><bufferAttribute ref={attr} attach="attributes-position" args={[positions,3]}/></bufferGeometry><pointsMaterial color="#f0a476" size={.035} sizeAttenuation/></points><lineSegments><bufferGeometry><bufferAttribute ref={trailAttr} attach="attributes-position" args={[trail,3]}/></bufferGeometry><lineBasicMaterial color="#dcaa82" transparent opacity={.5}/></lineSegments><mesh><cylinderGeometry args={[.4,.4,2.6,48]}/><meshStandardMaterial color="#78898e" metalness={.85} roughness={.3}/></mesh></>;
}
function CameraOwner({params,study,playing,setPlaying,epoch,state}) {
  const {camera:defaultCamera,set,size,invalidate}=useThree();
  const cameras=useMemo(()=>({perspective:new THREE.PerspectiveCamera(35,1,.1,100),orthographic:new THREE.OrthographicCamera(-4,4,3,-3,.1,100)}),[]);
  const score=useRef(null);const current=cameras[params.projection];
  useEffect(()=>{set({camera:current});return()=>set({camera:defaultCamera});},[current,set]);
  useEffect(()=>{
    const aspect=size.width/size.height;
    const distance=9.1*(aspect<1?1.3:1);
    const az=params.azimuth*Math.PI/180,el=params.elevation*Math.PI/180;
    state.current.owner='inspection';score.current?.setMode('inspect');
    current.position.set(Math.sin(az)*Math.cos(el)*distance,Math.sin(el)*distance,Math.cos(az)*Math.cos(el)*distance);current.lookAt(0,0,0);
    if(current.isPerspectiveCamera){current.aspect=aspect;current.fov=params.lens;}
    else {const h=distance*Math.tan(35*Math.PI/360);current.left=-h*aspect;current.right=h*aspect;current.top=h;current.bottom=-h;}
    current.updateProjectionMatrix();invalidate();
  },[params.projection,params.lens,params.azimuth,params.elevation,current,size,epoch,invalidate,state]);
  useEffect(()=>{
    if(study.id!=='camera')return;
    const controller=createInspectionScore(pose=>{if(state.current.owner!=='theatre')return;current.position.set(pose.camera.position.x,pose.camera.position.y,pose.camera.position.z);current.lookAt(pose.camera.target.x,pose.camera.target.y,pose.camera.target.z);if(current.isPerspectiveCamera){current.fov=pose.camera.fov;current.updateProjectionMatrix();}state.current.assembly=pose.assemblyProgress;state.current.pose=pose;},invalidate);
    score.current=controller;
    return()=>{controller.dispose();score.current=null;state.current.assembly=0;};
  },[study.id,current,invalidate,state]);
  useEffect(()=>{
    if(!score.current)return;
    if(playing){state.current.owner='theatre';score.current.setMode('story');void score.current.play('inspection').then(result=>{if(result==='completed')setPlaying(false);});}
    else score.current.pause();
    return()=>score.current?.pause();
  },[playing,epoch,study.id,current,setPlaying,state]);
}
