// Photo-informed microstructure on the original PBR shader. These inexpensive
// procedural finishes are visual approximations, not scanned material maps.
// No position, normal buffer, topology, texture or source callback is rewritten.
import {ShaderChunk} from 'three';

// Three's transparent-canvas transmission target starts at white/alpha .5.
// Remove only that fallback contribution, preserving opaque transmitted source
// geometry (alpha 1) and the ordinary physical reflection/specular channels.
const transmissionMarker='vec3 attenuatedColor = transmittance * transmittedLight.rgb;';
if(!ShaderChunk.transmission_pars_fragment.includes(transmissionMarker))throw Error('Review transparent transmission integration for this Three revision');
const transparentTransmission=ShaderChunk.transmission_pars_fragment.replace(transmissionMarker,/* glsl */`
 float transparentCanvasWeight=clamp((1.0-transmittedLight.a)*2.0,0.0,1.0);
 transmittedLight.rgb=max(vec3(0.0),transmittedLight.rgb-vec3(transparentCanvasWeight));
 transmittedLight.a=1.0-transparentCanvasWeight;
 ${transmissionMarker}
`);
const recipes={
 'mode-s-of-making':'eps', 'mode-s-machine':'machine',
 'entrance-installation-art':'satin-metal', 'special-assemblies':'timber',
 'project-caschlatsch':'timber', 'hc3dp-caustics':'clear-print',
 'dot-based-3d-printing':'point-samples',
};
const helpers=/* glsl */`
varying vec3 vPhotoPosition;
float photoHash(vec3 p){p=fract(p*.1031);p+=dot(p,p.yzx+33.33);return fract((p.x+p.y)*p.z);}
vec4 photoNoiseGradient(vec3 p){
 vec3 i=floor(p),f=fract(p),u=f*f*(3.0-2.0*f),du=6.0*f*(1.0-f);
 float a=photoHash(i),b=photoHash(i+vec3(1,0,0)),c=photoHash(i+vec3(0,1,0)),d=photoHash(i+vec3(1,1,0));
 float e=photoHash(i+vec3(0,0,1)),f1=photoHash(i+vec3(1,0,1)),g=photoHash(i+vec3(0,1,1)),h=photoHash(i+vec3(1,1,1));
 float ab=mix(a,b,u.x),cd=mix(c,d,u.x),ef=mix(e,f1,u.x),gh=mix(g,h,u.x);
 float lower=mix(ab,cd,u.y),upper=mix(ef,gh,u.y);
 return vec4(mix(lower,upper,u.z),mix(mix(b-a,d-c,u.y),mix(f1-e,h-g,u.y),u.z)*du.x,mix(cd-ab,gh-ef,u.z)*du.y,(upper-lower)*du.z);
}
float photoNoise(vec3 p){return photoNoiseGradient(p).x;}
float photoFilter(float value){float frequency=fwidth(value);return exp(-frequency*frequency);}
float photoLine(float value){float frequency=fwidth(value);return sin(value)*exp(-frequency*frequency);}
vec3 photoBump(vec3 surfNormal,vec3 worldGradient){
 // Analytic height gradient; filtering is applied after differentiation.
 // No derivative is taken of an fwidth/derivative-dependent quantity.
 vec3 gradient=mat3(viewMatrix)*worldGradient;
 return normalize(surfNormal-gradient+surfNormal*dot(surfNormal,gradient));
}
`;
const eps=/* glsl */`
vec4 cellField=photoNoiseGradient(vPhotoPosition*1400.0);float cells=cellField.x;
float cuttingPhase=vPhotoPosition.y*12566.37,cutting=photoLine(cuttingPhase);
surfaceColor*=.92+.08*cells+.018*cutting;
surfaceRoughness=.84+.10*cells;
vec3 cellFootprint=fwidth(vPhotoPosition*1400.0);
surfaceGradient=.14*cellField.yzw*exp(-dot(cellFootprint,cellFootprint));
surfaceGradient.y+=.31415925*cos(cuttingPhase)*photoFilter(cuttingPhase);
`;
const timber=/* glsl */`
// Grain follows each original member's long axis; no invented scanned knots.
vec3 axis=normalize(vPhotoAxis),across=normalize(cross(axis,abs(axis.y)<.9?vec3(0,1,0):vec3(1,0,0))),third=cross(axis,across);
vec3 grainPosition=vec3(dot(vPhotoPosition,across),dot(vPhotoPosition,axis),dot(vPhotoPosition,third));
vec3 waveScale=vec3(5.0,1.0,5.0),fiberScale=vec3(110.0,2.5,110.0);
vec4 waveField=photoNoiseGradient(grainPosition*waveScale),fiberField=photoNoiseGradient(grainPosition*fiberScale);
float phase=(grainPosition.x+grainPosition.z)*520.0+waveField.x*13.0;
float grain=photoLine(phase),fibre=fiberField.x;
surfaceColor*=.77+.20*fibre+.10*grain;
surfaceRoughness=clamp(surfaceRoughness+.07*(fibre-.5),.45,.88);
vec3 grainGradient=.00010*cos(phase)*(vec3(520.0,0,520.0)+waveField.yzw*waveScale*13.0)*photoFilter(phase);
vec3 fiberFootprint=fwidth(grainPosition*fiberScale);
grainGradient+=.00008*fiberField.yzw*fiberScale*exp(-dot(fiberFootprint,fiberFootprint));
surfaceGradient=across*grainGradient.x+axis*grainGradient.y+third*grainGradient.z;
`;
const machine=/* glsl */`
float family=floor(vPhotoFamily+.5);
if(family<.5){surfaceColor=vec3(.59,.63,.68);surfaceMetalness=.91;surfaceRoughness=.29;}
else if(family<1.5){surfaceColor=vec3(.51,.56,.62);surfaceMetalness=.94;surfaceRoughness=.23;}
else if(family<2.5){surfaceColor=vec3(.012,.085,.46);surfaceMetalness=0.0;surfaceRoughness=.48;}
else if(family<3.5){surfaceColor=vec3(.014,.018,.022);surfaceMetalness=.28;surfaceRoughness=.51;}
else if(family<4.5){surfaceColor=vec3(.009,.011,.013);surfaceMetalness=0.0;surfaceRoughness=.86;}
else if(family<5.5){surfaceColor=vec3(.008,.23,.19);surfaceMetalness=0.0;surfaceRoughness=.43;}
else if(family<6.5){surfaceColor=vec3(.43,.25,.075);surfaceMetalness=.83;surfaceRoughness=.32;}
else if(family<7.5){surfaceColor=vec3(.20,.085,.025);surfaceMetalness=.78;surfaceRoughness=.51;}
else if(family<8.5){surfaceColor=vec3(.85,.84,.81);surfaceMetalness=0.0;${eps}}
else{surfaceColor=vec3(.12,.115,.105);surfaceMetalness=.8;surfaceRoughness=.42;}
if(family<2.0||family>5.5&&family<7.5||family>8.5){
 float brushPhase=(vPhotoPosition.y+vPhotoPosition.z*.11)*19000.0,brush=photoLine(brushPhase);
 surfaceRoughness+=brush*.035;surfaceGradient=vec3(0,.038,.00418)*cos(brushPhase)*photoFilter(brushPhase);
}else if(family>1.5&&family<5.5){
 float layerPhase=vPhotoPosition.y*31415.93,layers=photoLine(layerPhase);
 surfaceColor*=.97+.03*layers;surfaceRoughness+=layers*.025;surfaceGradient=vec3(0,.25132744,0)*cos(layerPhase)*photoFilter(layerPhase);
}
`;

/** Compose, rather than replace, source shader hooks. One original material
 * still creates one clone/program; the machine family attribute adds no draws.
 */
export function installPhotoSurface(material,{projectId}){
 const recipe=recipes[projectId];if(!recipe)return null;
 const prior=material.onBeforeCompile,priorKey=material.customProgramCacheKey;
 const key=priorKey.call(material);
 material.onBeforeCompile=function(shader,renderer){
  prior.call(this,shader,renderer);
  if(recipe==='point-samples'){
   shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
    vec2 sampleDisc=gl_PointCoord*2.0-1.0;float sampleRadius=dot(sampleDisc,sampleDisc);
    if(sampleRadius>1.0)discard;
    float beadLight=.62+.38*sqrt(max(0.0,1.0-sampleRadius));
    diffuseColor.rgb*=beadLight;
   `);
   return;
  }
  const familyDeclaration=recipe==='machine'?'attribute float _surface_family; varying float vPhotoFamily;':recipe==='timber'?`varying vec3 vPhotoAxis;${projectId==='project-caschlatsch'?'attribute vec3 _fiber_axis;':''}`:'';
  shader.vertexShader=shader.vertexShader.replace('#include <common>',`#include <common>\nvarying vec3 vPhotoPosition;\n${familyDeclaration}`)
   .replace('#include <begin_vertex>',`#include <begin_vertex>\nvPhotoPosition=(modelMatrix*vec4(position,1.0)).xyz;\n${recipe==='machine'?'vPhotoFamily=_surface_family;':recipe==='timber'?`vPhotoAxis=normalize(mat3(modelMatrix)*${projectId==='project-caschlatsch'?'_fiber_axis':'vec3(0,0,1)'});`:''}`);
  shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>\n${helpers}\n${recipe==='machine'?'varying float vPhotoFamily;':recipe==='timber'?'varying vec3 vPhotoAxis;':''}`);
  if(recipe==='clear-print')shader.fragmentShader=shader.fragmentShader.replace('#include <transmission_pars_fragment>',transparentTransmission);
  const texture=recipe==='eps'?eps:recipe==='machine'?machine:recipe==='timber'?timber:recipe==='satin-metal'?/* glsl */`
    vec4 finishField=photoNoiseGradient(vPhotoPosition*700.0);float finish=finishField.x;
    surfaceColor*=.96+.04*finish;surfaceRoughness+=.035*(finish-.5);
    vec3 finishFootprint=fwidth(vPhotoPosition*700.0);surfaceGradient=.0056*finishField.yzw*exp(-dot(finishFootprint,finishFootprint));
   `:/* glsl */`
    float filamentPhase=vPhotoPosition.y*12566.37,filament=photoLine(filamentPhase);
    surfaceRoughness=clamp(surfaceRoughness+.012*filament,.02,1.0);surfaceGradient=vec3(0,.07539822,0)*cos(filamentPhase)*photoFilter(filamentPhase);
   `;
  shader.fragmentShader=shader.fragmentShader.replace('#include <metalnessmap_fragment>',`#include <metalnessmap_fragment>
   vec3 surfaceColor=diffuseColor.rgb;float surfaceMetalness=metalnessFactor;
   float surfaceRoughness=roughnessFactor;vec3 surfaceGradient=vec3(0.0);
   ${texture}
   diffuseColor.rgb=surfaceColor;metalnessFactor=surfaceMetalness;roughnessFactor=surfaceRoughness;
  `).replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>\nnormal=photoBump(normal,surfaceGradient);`);
 };
 material.customProgramCacheKey=()=>`${key}|photo-surface-v1:${recipe}:${projectId}`;
 return Object.freeze({recipe,source:'reviewed-project-photographs',method:recipe==='point-samples'?'round-depth-cued-source-samples':'procedural-pbr-microstructure',geometryDisplacement:false,textureAllocations:0,extraDrawCalls:0});
}
