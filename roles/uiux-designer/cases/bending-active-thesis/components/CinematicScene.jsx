'use client';
import {useEffect,useMemo} from 'react';
import {Canvas,useFrame,useThree} from '@react-three/fiber';
import * as T from 'three';
import {createRendererBudget} from './renderer-budget.mjs';
import {createRenderPressure} from './render-pressure.mjs';
import {resolveRenderProfile} from './render-profile.mjs';
import {createSceneRuntime} from '../runtime/presentation/SceneRuntime.mjs';

function World({input,onReady,onFailure,runtime}){
  const {gl,camera,scene,invalidate,size,get}=useThree();
  const world=useMemo(()=>input.features.create('scene',{factory:createSceneRuntime,onReady,onFailure,runtime,gl,camera,scene,invalidate,get}),[input,onReady,onFailure,runtime,gl,camera,scene,invalidate,get]);
  useEffect(()=>input.features.connect('scene.input',()=>world.connect()),[input,world]);
  useEffect(()=>{world.viewportChanged();},[world,size.width,size.height]);
  useEffect(()=>input.features.connect('scene.assets',()=>world.initialize()),[input,world]);
  useFrame(()=>world.render(),1);
  return <primitive object={world.root} dispose={null}/>;
}
export default function CinematicScene({onFailure,...props}) {
  const runtime=useMemo(()=>({pressure:createRenderPressure(),budget:null,profile:resolveRenderProfile({coarsePointer:matchMedia('(pointer:coarse)').matches,userAgent:navigator.userAgent,platform:navigator.platform,maxTouchPoints:navigator.maxTouchPoints})}),[]);
  const input=props.input;
  const rendererFactory=useMemo(()=>defaults=>{
    const renderer=new T.WebGLRenderer({...defaults,antialias:false,alpha:true,powerPreference:'default'});
    runtime.budget=createRendererBudget(renderer,()=>{const detail=input.get().detail==='light'?'light':'full';return {detail,deviceDpr:devicePixelRatio||1,densityScale:runtime.pressure.inspect().scale,pixelBudget:runtime.profile.pixelBudgets[detail]};});
    return renderer;
  },[input,runtime]);
  // Construct only the retained renderer. A throwaway capability context can
  // coexist with it until browser cleanup; SceneBoundary owns startup failure.
  return <Canvas frameloop="demand" resize={{scroll:false,offsetSize:true,debounce:0}} dpr={1} camera={{position: [4, 3, 6], fov: 38}} gl={rendererFactory} onCreated={({gl}) => {gl.toneMapping = T.ACESFilmicToneMapping; gl.toneMappingExposure = 1; gl.outputColorSpace = T.SRGBColorSpace; gl.setClearColor(0x090d0d, 0); gl.shadowMap.type = T.PCFShadowMap; gl.info.autoReset = false;}}><World {...props} runtime={runtime} onFailure={onFailure}/></Canvas>;
}
