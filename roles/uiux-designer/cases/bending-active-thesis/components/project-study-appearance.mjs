import * as T from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';

// Source-reviewed presentation recipes, not measured material coefficients or a
// replacement for the original shader graph. No source file is a runtime input.
const profiles={
 'mode-s-of-making':{kind:'neutral',color:[.76,.77,.74],metalness:0,roughness:.88,environment:.32,hemisphere:.4,key:2.2,fill:.35,rim:.55},
 'entrance-installation-art':{kind:'neutral',color:[.58,.60,.62],metalness:.9,roughness:.36,environment:.85,hemisphere:.25,key:2.2,fill:.3,rim:1},
 'special-assemblies':{kind:'neutral',color:[.49,.34,.20],metalness:0,roughness:.76,environment:.45,hemisphere:.35,key:2,fill:.3,rim:.65},
 'dot-based-3d-printing':{kind:'points',color:[.48,.68,.80],environment:0},
 'hc3dp-caustics':{kind:'native-physical',ior:1.5700000524520874,environment:.7,hemisphere:.18,key:1.9,fill:.25,rim:1.2},
};
const directions={key:{color:'#fff4e6',direction:[2.8,3.7,4]},fill:{color:'#b5ccec',direction:[-3,1,2]},rim:{color:'#a9c8ed',direction:[-2,2.5,-4]}};
const activeScenes=new WeakMap(),activeSources=new WeakMap();
const environmentOptions={size:128,sigma:.04,near:.1,far:100};

function bakeEnvironment({renderer,size,sigma,near,far}){
 let room=null,generator=null,target=null;
 try{
  room=new RoomEnvironment();generator=new T.PMREMGenerator(renderer);
  target=generator.fromScene(room,sigma,near,far,{size});return target;
 }catch(error){target?.dispose();throw error;}
 finally{try{room?.dispose();}finally{generator?.dispose();}}
}
function frameFor(bounds){
 const min=bounds?.min?.toArray?.()??bounds?.min,max=bounds?.max?.toArray?.()??bounds?.max;
 if(!Array.isArray(min)||!Array.isArray(max)||min.length!==3||max.length!==3||![...min,...max].every(Number.isFinite)||min.some((value,i)=>value>max[i]))throw Error('Finite original model bounds required for study lighting');
 const center=new T.Vector3().fromArray(min).add(new T.Vector3().fromArray(max)).multiplyScalar(.5),radius=new T.Vector3().fromArray(max).sub(new T.Vector3().fromArray(min)).length()*.5;
 if(!(radius>0))throw Error('Nonempty original model bounds required for study lighting');
 return{center,radius};
}
const scalar=value=>Number.isFinite(value)?value:String(value);
function materialFacts(original,material){
 const result={sourceType:original.type,type:material.type,color:material.color?.toArray()??null,opacity:material.opacity,transparent:material.transparent,side:material.side,toneMapped:material.toneMapped,depthTest:material.depthTest,depthWrite:material.depthWrite,blending:material.blending};
 for(const key of ['metalness','roughness','ior','transmission','thickness','attenuationDistance','clearcoat','clearcoatRoughness','size','sizeAttenuation','flatShading','envMapIntensity'])if(material[key]!==undefined)result[key]=typeof material[key]==='number'?scalar(material[key]):material[key];
 for(const key of ['emissive','attenuationColor'])if(material[key]?.isColor)result[key]=material[key].toArray();
 const textures=Object.entries(original).filter(([,value])=>value?.isTexture);
 result.sourceTextureReferencesPreserved=textures.every(([key,value])=>material[key]===value);
 return result;
}

/** Installs one static appearance lease before genuine source first draw.
 * createEnvironment is synchronous: ({renderer,size,sigma,near,far}) => target.
 * Its factory owns incomplete bake cleanup; this lease owns a returned target.
 * Source geometry, callbacks, transforms, original materials and textures remain
 * caller-owned. Dispose restores assignments before that caller releases source.
 */
export function installProjectStudyAppearance({scene,source,renderer,bounds,projectId,createEnvironment=bakeEnvironment}){
 const profile=Object.hasOwn(profiles,projectId)?profiles[projectId]:null;
 let disposed=false,environmentTarget=null,generations=0,createdClones=0,renderables=0,finalMaterials=null;
 const replacements=new Map(),assignments=[],ownedObjects=[],lights=[];
 let previous=null,frame=null;
 const ownership={sourceGeometry:false,sourceTextures:false,sourceMaterials:false,replacementMaterials:!!profile,environmentTarget:!!profile&&profile.kind!=='points',lightRig:!!profile&&profile.kind!=='points'};
 const inspect=()=>({profileID:profile?projectId:'source-only',kind:profile?.kind??'source-only',phase:disposed?'disposed':'installed',disposed,renderables,materialClones:createdClones,ownedMaterialClones:disposed?0:replacements.size,materialsRestored:disposed,materials:finalMaterials??[...replacements].map(([original,material])=>materialFacts(original,material)),
  environment:{kind:profile&&profile.kind!=='points'?'room-pmrem':'none',generations,size:generations?128:0,atlas:generations?[384,512]:null,intensity:profile?.environment??null,rotationY:profile&&profile.kind!=='points' ? .35 : null,owned:!!environmentTarget&&!disposed,released:disposed&&generations>0},
  frame:frame?{center:frame.center.toArray(),radius:frame.radius}:null,
  ownedLightObjects:ownedObjects.length,lights:lights.map(({role,light})=>({role,type:light.type,color:light.color.toArray(),groundColor:light.groundColor?.toArray()??null,intensity:light.intensity,position:light.position.toArray(),target:light.target?.position.toArray()??null,targetInScene:light.target?.parent===scene,castShadow:light.castShadow,released:disposed})),ownership:{...ownership}});
 const dispose=()=>{
  if(disposed)return;disposed=true;
  finalMaterials=[...replacements].map(([original,material])=>materialFacts(original,material));
  for(const {node,material}of assignments)node.material=material;
  assignments.length=0;
  if(previous){scene.environment=previous.environment;scene.environmentIntensity=previous.intensity;scene.environmentRotation.copy(previous.rotation);scene.background=previous.background;}
  if(typeof environmentTarget?.dispose==='function')environmentTarget.dispose();environmentTarget=null;
  for(const material of replacements.values())material.dispose();replacements.clear();
  for(const object of ownedObjects){object.removeFromParent();object.dispose?.();}ownedObjects.length=0;
  if(activeScenes.get(scene)===dispose)activeScenes.delete(scene);
  if(activeSources.get(source)===dispose)activeSources.delete(source);
 };
 if(!profile)return{inspect,dispose};
 if(!scene?.isScene||!source?.traverse)throw Error('An owned study scene and original source root are required');
 if(activeScenes.has(scene)||activeSources.has(source))throw Error('Study appearance already has an active owner');
 frame=frameFor(bounds);activeScenes.set(scene,dispose);activeSources.set(source,dispose);
 try{
  previous={environment:scene.environment,intensity:scene.environmentIntensity,rotation:scene.environmentRotation.clone(),background:scene.background};
  if(profile.kind!=='points'){
   environmentTarget=createEnvironment({renderer,...environmentOptions});generations++;
   if(!environmentTarget?.texture?.isTexture||typeof environmentTarget.dispose!=='function'||environmentTarget.width!==384||environmentTarget.height!==512)throw Error('A complete 128-face study PMREM target is required');
   scene.environment=environmentTarget.texture;scene.environmentRotation.set(0,.35,0);
  }else scene.environment=null;
  scene.environmentIntensity=profile.environment;scene.background=null;
  const replacement=original=>{
   if(!original?.isMaterial)throw Error('Original study material required');
   if(replacements.has(original))return replacements.get(original);
   if(profile.kind==='points'?!original.isPointsMaterial:profile.kind==='native-physical'?!original.isMeshPhysicalMaterial:!original.isMeshStandardMaterial)throw Error('Original study material class differs from its source profile');
   const material=original.clone();replacements.set(original,material);createdClones++;
   // Three's Material.copy does not copy custom program hooks. Preserve their
   // source identity alongside ordinary cloned PBR fields and shared textures.
   material.onBeforeCompile=original.onBeforeCompile;material.customProgramCacheKey=original.customProgramCacheKey;
   if(profile.kind==='native-physical')material.ior=profile.ior;
   else{
    material.color.setRGB(...profile.color,T.LinearSRGBColorSpace);
    if(profile.kind==='points'){material.size=2;material.sizeAttenuation=false;material.toneMapped=false;}
    else{material.metalness=profile.metalness;material.roughness=profile.roughness;}
   }
   return material;
  };
  source.traverse(node=>{
   if(!node.isMesh&&!node.isPoints)return;
   if(profile.kind==='points'?!node.isPoints:!node.isMesh)throw Error('Original study primitive differs from its appearance profile');
   assignments.push({node,material:node.material});renderables++;
   node.material=Array.isArray(node.material)?node.material.map(replacement):replacement(node.material);
  });
  if(!renderables)throw Error('Original study renderables required before appearance');
  if(profile.kind!=='points'){
   const hemisphere=new T.HemisphereLight('#d9e3ef','#4a4138',profile.hemisphere);lights.push({role:'hemisphere',light:hemisphere});ownedObjects.push(hemisphere);scene.add(hemisphere);
   for(const [role,{color,direction}]of Object.entries(directions)){
    const light=new T.DirectionalLight(color,profile[role]);light.position.fromArray(direction).normalize().multiplyScalar(3*frame.radius).add(frame.center);light.target.position.copy(frame.center);light.castShadow=false;
    lights.push({role,light});ownedObjects.push(light,light.target);scene.add(light,light.target);
   }
  }
  return{inspect,dispose};
 }catch(error){dispose();throw error;}
}
