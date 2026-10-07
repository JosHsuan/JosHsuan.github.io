import * as T from 'three';
import {simplex2D} from './vendor/noise2D.js';

export const materialModes=Object.freeze(['material','grain','contours','focus']);
export function normalizedMaterialProgress(value){return Number.isFinite(value)?Math.min(1,Math.max(0,value)):.5;}

/** 3D Artist adapter. Owns material uniforms only; never cameras, geometry or clocks. */
export function createInspectionMaterial({mode='material',color='#b8a17b',bounds={min:[-2,-1,-1],max:[2,1,1]},grainAmount=.14,metalness=0,roughness=.63}={}){
 if(!materialModes.includes(mode))throw new Error('Unknown inspection material mode');
 if(!Array.isArray(bounds.min)||!Array.isArray(bounds.max)||bounds.min.length!==3||bounds.max.length!==3||![...bounds.min,...bounds.max].every(Number.isFinite)||bounds.max.some((v,i)=>v<bounds.min[i]))throw new Error('Finite ordered world bounds required');
 const uniforms={artistProgress:{value:.5},artistMode:{value:materialModes.indexOf(mode)},artistGrain:{value:grainAmount},artistMin:{value:new T.Vector3(...bounds.min)},artistSize:{value:new T.Vector3(...bounds.max).sub(new T.Vector3(...bounds.min)).max(new T.Vector3(.001,.001,.001))}};
 const material=new T.MeshStandardMaterial({color,metalness,roughness,side:T.DoubleSide});
 material.name='artist3d-inspection-v1';
 material.customProgramCacheKey=()=> 'artist3d-inspection-v1-three-0.186.1';
 material.onBeforeCompile=shader=>{
  Object.assign(shader.uniforms,uniforms);
  shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 artistWorld;\nvarying vec2 artistUv;').replace('#include <begin_vertex>','#include <begin_vertex>\nartistWorld=(modelMatrix*vec4(position,1.)).xyz;\nartistUv=uv;');
  shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>
varying vec3 artistWorld; varying vec2 artistUv;
uniform float artistProgress; uniform float artistMode; uniform float artistGrain;
uniform vec3 artistMin; uniform vec3 artistSize;
${simplex2D}
`);
  shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
vec3 ap=(artistWorld-artistMin)/artistSize;
if(artistMode>.5 && artistMode<1.5){
 float grain=snoise(vec2(artistUv.x*2.6,artistUv.y*85.));
 float fine=snoise(vec2(artistUv.x*7.5,artistUv.y*180.));
 diffuseColor.rgb*=1.+artistGrain*(grain+.35*fine);
}
if(artistMode>1.5 && artistMode<2.5){
 float section=abs(ap.y-artistProgress);
 float moving=1.-smoothstep(.018,.043,section);
 float grid=abs(fract(ap.y*14.)-.5);
 float aa=max(fwidth(ap.y*14.),.008);
 float line=1.-smoothstep(.028,.028+aa,grid);
 diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.11,.16,.18),line*.55);
 diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.95,.30,.095),moving*.82);
}
if(artistMode>2.5){
 float focus=exp(-pow((ap.x-artistProgress)*8.,2.));
 float diagonal=(ap.x+ap.y)*45.;
 float aa=max(fwidth(diagonal),.01);
 float hatch=1.-smoothstep(.07,.07+aa,abs(fract(diagonal)-.5));
 diffuseColor.rgb=mix(vec3(.17,.21,.22),diffuseColor.rgb,focus*.8+.2);
 diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.90,.34,.12),focus*(.25+hatch*.25));
}
`);
  shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>
if(artistMode>.5 && artistMode<1.5)roughnessFactor=clamp(roughnessFactor+snoise(vec2(artistUv.x*4.,artistUv.y*70.))*.08,.3,.85);
`);
 };
 return {material,uniforms,
  update({progress=.5,mode:next=materialModes[uniforms.artistMode.value]}={}){if(!materialModes.includes(next))throw new Error('Unknown inspection material mode');uniforms.artistProgress.value=normalizedMaterialProgress(progress);uniforms.artistMode.value=materialModes.indexOf(next);},
  inspect(){return {progress:uniforms.artistProgress.value,mode:materialModes[uniforms.artistMode.value],bounds:{min:uniforms.artistMin.value.toArray(),size:uniforms.artistSize.value.toArray()},grainAmount,metalness,roughness,version:'artist3d-inspection-v1'};},
  dispose(){material.dispose();},
 };
}
