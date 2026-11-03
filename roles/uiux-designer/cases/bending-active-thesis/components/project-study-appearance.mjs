import * as T from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {installPhotoSurface} from './project-study-materials.mjs';

// Source-reviewed presentation recipes, not measured material coefficients or a
// replacement for the original shader graph. No source file is a runtime input.
const profiles={
 'mode-s-of-making':{kind:'photo-surface',color:[.85,.84,.81],metalness:0,roughness:.88,environment:.38,hemisphere:.32,key:2.2,fill:.35,rim:.7},
 'mode-s-machine':{kind:'photo-surface',color:[.59,.63,.68],metalness:.91,roughness:.29,environment:.72,hemisphere:.25,key:2.2,fill:.38,rim:1.1},
 'entrance-installation-art':{kind:'photo-surface',color:[.37,.40,.42],metalness:.52,roughness:.40,environment:.75,hemisphere:.2,key:2.3,fill:.38,rim:1.2,ground:true},
 'special-assemblies':{kind:'photo-surface',color:[.38,.235,.12],metalness:0,roughness:.72,environment:.45,hemisphere:.3,key:2,fill:.34,rim:.8},
 'project-caschlatsch':{kind:'photo-surface',color:[.62,.40,.20],metalness:0,roughness:.76,environment:.5,hemisphere:.28,key:2.2,fill:.38,rim:.95,ground:true},
 'dot-based-3d-printing':{kind:'points',color:[.74,.79,.82],environment:0},
 'hc3dp-caustics':{kind:'native-physical',ior:1.5700000524520874,optics:{metalness:0,roughness:.12,transmission:1,thickness:.0015,opacity:1,transparent:false},environment:.7,hemisphere:.18,key:1.9,fill:.25,rim:1.2},
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
 return{center,radius,min:[...min],max:[...max]};
}
const scalar=value=>Number.isFinite(value)?value:String(value);
function materialFacts(original,material,surface){
 const result={sourceType:original.type,type:material.type,color:material.color?.toArray()??null,opacity:material.opacity,transparent:material.transparent,side:material.side,toneMapped:material.toneMapped,depthTest:material.depthTest,depthWrite:material.depthWrite,blending:material.blending};
 for(const key of ['metalness','roughness','ior','transmission','thickness','attenuationDistance','clearcoat','clearcoatRoughness','size','sizeAttenuation','flatShading','envMapIntensity'])if(material[key]!==undefined)result[key]=typeof material[key]==='number'?scalar(material[key]):material[key];
 for(const key of ['emissive','attenuationColor'])if(material[key]?.isColor)result[key]=material[key].toArray();
 const textures=Object.entries(original).filter(([,value])=>value?.isTexture);
 result.sourceTextureReferencesPreserved=textures.every(([key,value])=>material[key]===value);
 result.surface=surface??null;
 return result;
}

/** Installs one source-relative appearance lease before genuine first draw.
 * createEnvironment is synchronous: ({renderer,size,sigma,near,far}) => target.
 * Its factory owns incomplete bake cleanup; this lease owns a returned target.
 * Source geometry, callbacks, transforms, original materials and textures remain
 * caller-owned. Dispose restores assignments before that caller releases source.
 */
export function installProjectStudyAppearance({scene,source,renderer,bounds,projectId,createEnvironment=bakeEnvironment}){
 const profile=Object.hasOwn(profiles,projectId)?profiles[projectId]:null;
 let disposed=false,environmentTarget=null,generations=0,createdClones=0,renderables=0,finalMaterials=null,lightingRevision=0,lastLightKey='',ground=null;
 const replacements=new Map(),surfaces=new Map(),assignments=[],ownedObjects=[],lights=[];
 const sourceShadowFlags=[];
 let previous=null,frame=null,previousShadow=null;
 const ownership={sourceGeometry:false,sourceTextures:false,sourceMaterials:false,replacementMaterials:!!profile,environmentTarget:!!profile&&profile.kind!=='points',lightRig:!!profile&&profile.kind!=='points'};
 const inspect=()=>({profileID:profile?projectId:'source-only',kind:profile?.kind??'source-only',phase:disposed?'disposed':'installed',disposed,renderables,materialClones:createdClones,ownedMaterialClones:disposed?0:replacements.size,materialsRestored:disposed,materials:finalMaterials??[...replacements].map(([original,material])=>materialFacts(original,material,surfaces.get(material))),
  environment:{kind:profile&&profile.kind!=='points'?'room-pmrem':'none',generations,size:generations?128:0,atlas:generations?[384,512]:null,intensity:profile?.environment??null,rotationY:profile&&profile.kind!=='points' ? .35 : null,owned:!!environmentTarget&&!disposed,released:disposed&&generations>0},
  frame:frame?{center:frame.center.toArray(),radius:frame.radius}:null,
  lighting:{revision:lightingRevision,clock:'caller-active-seconds',loopSeconds:24,cadenceHz:12,shadowKey:'fixed'},
  ground:ground?{y:ground.position.y,kind:'editorial-source-relative-shadow-receiver',shadowMapSize:1024,updates:'initial-source-draw',owned:!disposed}:null,
  ownedLightObjects:ownedObjects.length,lights:lights.map(({role,light})=>({role,type:light.type,color:light.color.toArray(),groundColor:light.groundColor?.toArray()??null,intensity:light.intensity,position:light.position.toArray(),target:light.target?.position.toArray()??null,targetInScene:light.target?.parent===scene,castShadow:light.castShadow,released:disposed})),ownership:{...ownership}});
 const dispose=()=>{
  if(disposed)return;disposed=true;
  finalMaterials=[...replacements].map(([original,material])=>materialFacts(original,material,surfaces.get(material)));
  for(const {node,material}of assignments)node.material=material;
  assignments.length=0;
  for(const {node,castShadow,receiveShadow}of sourceShadowFlags){node.castShadow=castShadow;node.receiveShadow=receiveShadow;}sourceShadowFlags.length=0;
  if(previous){scene.environment=previous.environment;scene.environmentIntensity=previous.intensity;scene.environmentRotation.copy(previous.rotation);scene.background=previous.background;}
  if(typeof environmentTarget?.dispose==='function')environmentTarget.dispose();environmentTarget=null;
  for(const material of replacements.values())material.dispose();replacements.clear();surfaces.clear();
  for(const object of ownedObjects){object.removeFromParent();object.dispose?.();}ownedObjects.length=0;
  ground?.geometry.dispose();ground?.material.dispose();
  if(previousShadow)Object.assign(renderer.shadowMap,previousShadow);
  if(activeScenes.get(scene)===dispose)activeScenes.delete(scene);
  if(activeSources.get(source)===dispose)activeSources.delete(source);
 };
 // The caller's established scheduler supplies time. This lease never renders,
 // rebakes an environment, changes source geometry or creates a second clock.
 const update=({activeSeconds=0,yawRad=0,showcaseLighting=null}={})=>{
  if(!Number.isFinite(activeSeconds)||activeSeconds<0||!Number.isFinite(yawRad))throw RangeError('Finite nonnegative appearance time and yaw required');
  if(disposed||!profile||profile.kind==='points')return false;
  // A 24-second light sweep has 288 samples. Only light time is quantized:
  // camera/orbit intent is immediate and the existing handheld clock stays live.
  const lightSeconds=Math.floor(activeSeconds*12)/12;
  const bounded=(name,fallback,min,max)=>{const value=showcaseLighting?.[name]??fallback;if(!Number.isFinite(value))throw RangeError('Finite showcase lighting required');return Math.max(min,Math.min(max,value));};
  const keyScale=bounded('keyScale',1,.8,1.15),rimScale=bounded('rimScale',1,.8,1.3),environmentScale=bounded('environmentScale',1,.75,1.1),sweepRad=bounded('sweepRad',0,-.18,.18);
  const phase=(lightSeconds%24)/24*Math.PI*2,key=`${phase}:${yawRad}:${keyScale}:${rimScale}:${environmentScale}:${sweepRad}`;
  if(key===lastLightKey)return false;lastLightKey=key;lightingRevision++;
  const sweep=Math.sin(phase)*.18+Math.sin(yawRad)*.06+sweepRad;
  scene.environmentRotation.y=.35+sweep*.55;
  scene.environmentIntensity=profile.environment*environmentScale;
  for(const {role,light}of lights){
   if(role==='hemisphere')continue;
   light.intensity=profile[role]*(role==='key'?keyScale:role==='rim'?rimScale:1)*(1+(role==='rim'?.10:.045)*Math.sin(phase+(role==='fill'?Math.PI*.5:0)));
   // Keep the source-contact shadow key fixed. Fill and rim describe surfaces
   // without paying for moving million-triangle shadow maps on every frame.
   if(role==='key')continue;
   const direction=directions[role].direction,angle=sweep*(role==='rim'?1:-.65),c=Math.cos(angle),s=Math.sin(angle);
   light.position.set(direction[0]*c+direction[2]*s,direction[1],direction[2]*c-direction[0]*s).normalize().multiplyScalar(3*frame.radius).add(frame.center);
  }
  return true;
 };
 if(!profile)return{inspect,dispose,update};
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
   if(profile.kind==='native-physical'){material.ior=profile.ior;Object.assign(material,profile.optics);}
   else{
    material.color.setRGB(...profile.color,T.LinearSRGBColorSpace);
    if(profile.kind==='points'){material.size=2;material.sizeAttenuation=false;material.toneMapped=false;}
    else{material.metalness=profile.metalness;material.roughness=profile.roughness;}
   }
   surfaces.set(material,installPhotoSurface(material,{projectId}));
   return material;
  };
  source.traverse(node=>{
   if(!node.isMesh&&!node.isPoints)return;
   if(profile.kind==='points'?!node.isPoints:!node.isMesh)throw Error('Original study primitive differs from its appearance profile');
   if(projectId==='mode-s-machine'&&node.geometry.getAttribute('_surface_family')?.count!==node.geometry.getAttribute('position')?.count)throw Error('Reviewed machine surface-family attribute required');
   if(projectId==='project-caschlatsch'&&node.geometry.getAttribute('_fiber_axis')?.count!==node.geometry.getAttribute('position')?.count)throw Error('Reviewed source timber fibre-axis attribute required');
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
   if(profile.ground){
    // This is an editorial contact receiver, not an invented site or plinth.
    // It sits below the actual source base and never participates in source
    // bounds, readiness counters, ray hits or factual geometry measurements.
    const epsilon=Math.max(.002,frame.radius*.0002),extent=frame.radius*6;
    ground=new T.Mesh(new T.PlaneGeometry(extent,extent),new T.ShadowMaterial({opacity:.23,depthWrite:false}));
    ground.name='editorial-contact-receiver';ground.rotation.x=-Math.PI/2;ground.position.set(frame.center.x,frame.min[1]-epsilon,frame.center.z);ground.receiveShadow=true;ownedObjects.push(ground);scene.add(ground);
    const key=lights.find(item=>item.role==='key').light,r=frame.radius;
    key.castShadow=true;key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-r*1.25,right:r*1.25,top:r*1.25,bottom:-r*1.25,near:r*.05,far:r*8});key.shadow.camera.updateProjectionMatrix();key.shadow.bias=-.00015;key.shadow.normalBias=r*.00008;
    source.traverse(node=>{if(!node.isMesh)return;sourceShadowFlags.push({node,castShadow:node.castShadow,receiveShadow:node.receiveShadow});node.castShadow=true;node.receiveShadow=true;});
    previousShadow={enabled:renderer.shadowMap.enabled,type:renderer.shadowMap.type,autoUpdate:renderer.shadowMap.autoUpdate,needsUpdate:renderer.shadowMap.needsUpdate};
    Object.assign(renderer.shadowMap,{enabled:true,type:T.PCFShadowMap,autoUpdate:false,needsUpdate:true});
   }
  }
  return{inspect,dispose,update};
 }catch(error){dispose();throw error;}
}
