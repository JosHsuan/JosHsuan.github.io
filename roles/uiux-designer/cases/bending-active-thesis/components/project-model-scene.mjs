import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {HDRLoader} from 'three/addons/loaders/HDRLoader.js';
import {createCinematicMaterial} from './materials/cinematic-material.js';
import {createExhibitionStage} from './exhibition-stage.mjs';
import {createRendererBudget} from './renderer-budget.mjs';
import {PROJECT_MODEL_REVISION,PROJECT_MODEL_PIXEL_BUDGET,collectProjectModelSupport,sampleProjectModelRecipe,validateProjectModelMetadata} from './project-model-recipe.mjs';

function disposeObject(object,excludedMaterials=new Set()){
 const geometries=new Set(),materials=new Set(),textures=new Set();
 object?.traverse(node=>{if(node.geometry)geometries.add(node.geometry);for(const material of (Array.isArray(node.material)?node.material:node.material?[node.material]:[])){materials.add(material);for(const value of Object.values(material))if(value?.isTexture)textures.add(value);}});
 geometries.forEach(value=>value.dispose());materials.forEach(value=>{if(!excludedMaterials.has(value))value.dispose();});textures.forEach(value=>value.dispose());
}

/** Submit and validate a real draw before exposing the model canvas. This is
 * renderer completion evidence, not a browser-compositor paint acknowledgment. */
export function commitProjectModelDraw({renderer,scene,camera,host,shaderFailure=()=>null}){
 renderer.render(scene,camera);
 const failure=shaderFailure();if(failure)throw failure;
 if(renderer.getContext().isContextLost()||renderer.info.render.calls<1)throw Error('Project preview did not draw');
 if(!renderer.domElement.parentNode)host.appendChild(renderer.domElement);
 return{calls:renderer.info.render.calls};
}

/** Home removes only the authored exhibition scenery, not source meshes or
 * its area-light rig. The original static-card set is untouched by default. */
export function applyProjectModelPresentationSet(group,presentation){
 let visibleEditorialMeshes=0,editorialAreaLights=0;
 group.traverse(node=>{
  if(node.isMesh&&node.userData.sourceGeometry===false){
   if(presentation?.visibleEditorialSet===false)node.visible=false;
   if(node.visible)visibleEditorialMeshes++;
  }
  if(node.isRectAreaLight&&node.visible)editorialAreaLights++;
 });
 return{transparent:presentation?.transparent===true,visibleEditorialMeshes,editorialAreaLights,contactFloorShadow:presentation?.visibleEditorialSet!==false};
}

/** Pure draw gate; last committed state changes only after a successful render.
 * Desired progress may advance while suspended without dirtying GPU state. */
export function projectModelDrawDecision({lastSize,width,height,animated=false,lastProgress,progress,suspended=false,force=false}){
 const resized=lastSize?.width!==width||lastSize?.height!==height;
 return{resized,draw:!suspended&&(resized||(animated&&(force||lastProgress!==progress))),prepare:!suspended&&animated&&resized};
}

/** Bounded ordinary DOM evidence, not a GPU readback or compositor receipt. */
export function inspectProjectModelSurface(host,canvas){
 const doc=host.ownerDocument,win=doc.defaultView,rect=canvas.getBoundingClientRect();
 const ancestors=[];let opacity=1,visible=true,node=canvas;
 for(let count=0;node&&count<12;count++,node=node.parentElement){
  const style=win.getComputedStyle(node),ownOpacity=Number(style.opacity);
  opacity*=ownOpacity;visible&&=style.display!=='none'&&style.visibility!=='hidden'&&style.visibility!=='collapse';
  ancestors.push({tag:node.tagName,display:style.display,visibility:style.visibility,opacity:ownOpacity});
 }
 const connected=host.isConnected&&canvas.isConnected,truncated=!!node;
 const loaders=[...doc.querySelectorAll('[data-site-loader]')],loader=loaders[0];
 const cover={count:loaders.length,hidden:loader?.hidden===true,display:loader?win.getComputedStyle(loader).display:null};
 return{connected,cover,siteEntryState:doc.documentElement.getAttribute('data-site-entry-state'),hidden:doc.hidden,opacity,visible:visible&&!truncated&&opacity>0,ancestors,truncated,
  rect:{left:rect.left,top:rect.top,right:rect.right,bottom:rect.bottom,width:rect.width,height:rect.height},backing:{width:canvas.width,height:canvas.height},
  intersectsViewport:rect.width>0&&rect.height>0&&rect.right>0&&rect.bottom>0&&rect.left<win.innerWidth&&rect.top<win.innerHeight};
}

/** Prepared on page opening while the site loader still covers the document.
 * No Fiber, scene runtime, DOM
 * annotations, source diagrams, compositor, RAF or autonomous animation. */
export function acquireProjectModelScene({host,signal,onFailure=()=>{},presentation=null}){
 if(signal.aborted)return Promise.reject(new DOMException('Preview aborted','AbortError'));
 const manager=new T.LoadingManager();let renderer=null,budget=null,scene=null,camera=null,gltf=null,hdr=null,environment=null,exhibition=null;
 let disposed=false,frames=0,meta=null,supportPoints=null,lastSize=null,firstDraw=null,shaderFailure=null;const adapters=[],bases=[];
 const pixelBudget=presentation?.pixelBudget??PROJECT_MODEL_PIXEL_BUDGET;
 let prepared=null,preparations=0,progress=0,suspended=false,lastRecipe=null,presentationSet=null,preparationSurface=null,visibleCommit=null;
 const dispose=()=>{
  if(disposed)return;disposed=true;supportPoints=null;signal.removeEventListener('abort',abort);
  manager.abort();
  renderer?.domElement.removeEventListener('webglcontextlost',lost);
  exhibition?.dispose();gltf?.scene.removeFromParent();disposeObject(gltf?.scene,new Set(adapters.map(adapter=>adapter.material)));adapters.forEach(adapter=>adapter.dispose());hdr?.dispose();environment?.dispose();
  if(scene){scene.traverse(node=>{if(node.isLight)node.dispose?.();});disposeObject(scene);scene.clear();scene.environment=null;}
  budget?.dispose();if(renderer){renderer.domElement.remove();renderer.dispose();renderer.forceContextLoss();}
 };
 let rejectAbort;
 const aborted=new Promise((_,reject)=>{rejectAbort=reject;});
 const abort=()=>{dispose();rejectAbort(new DOMException('Preview aborted','AbortError'));};
 const lost=event=>{event.preventDefault();if(!disposed)onFailure('context-lost');};
 signal.addEventListener('abort',abort,{once:true});if(signal.aborted)abort();
 const read=async url=>{const response=await fetch(url,{signal});if(!response.ok)throw Error('Project model asset unavailable');return response;};
 const initialize=async()=>{
  const results=await Promise.allSettled([
   read('/assets/source-layers.glb').then(response=>response.arrayBuffer()).then(async bytes=>{
    const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),value=>value.toString(16).padStart(2,'0')).join('');
    if(digest!==PROJECT_MODEL_REVISION)throw Error('Project model revision differs');
    if(signal.aborted)throw new DOMException('Preview aborted','AbortError');
    const result=await new GLTFLoader(manager).parseAsync(bytes,'');if(disposed)disposeObject(result.scene);else gltf=result;return result;
   }),
   // Own all preview network requests through the same native AbortSignal.
   // This public Three path applies the same parse/defaults as HDRLoader.load.
   read('/assets/studio-small.hdr').then(response=>response.arrayBuffer()).then(bytes=>{
    if(disposed||signal.aborted)throw new DOMException('Preview aborted','AbortError');
    const value=new HDRLoader().createDataTexture(bytes);
    if(disposed||signal.aborted){value.dispose();throw new DOMException('Preview aborted','AbortError');}
    hdr=value;return value;
   }),
   read('/assets/source-layers.json').then(response=>response.json()),
  ]);
  if(disposed)return null;
  if(results.some(value=>value.status==='rejected'))throw Error('Project model assets unavailable');
  meta=validateProjectModelMetadata(results[2].value);
  const roles=new Set();
  gltf.scene.traverse(node=>{
   if(!node.isMesh)return;
   const role=node.userData.role,record=meta.layers.find(layer=>layer.id===role);
   if(!record||roles.has(role)||node.geometry.attributes.position.count!==record.vertices||(node.geometry.index?.count??node.geometry.attributes.position.count)/3!==record.triangles)throw Error('Project source geometry differs');
   roles.add(role);(Array.isArray(node.material)?node.material:[node.material]).forEach(value=>value.dispose());
   if(role==='shell'){const adapter=createCinematicMaterial({bounds:meta.bounds});adapters.push(adapter);node.material=adapter.material;}
   else{node.material=new T.MeshStandardMaterial({color:'#535b5b',roughness:.7,metalness:.12,side:T.DoubleSide});bases.push({node,color:node.material.color.clone()});}
   node.castShadow=true;node.receiveShadow=true;
  });
  if(roles.size!==3)throw Error('Missing project source geometry');
  supportPoints=collectProjectModelSupport(gltf.scene);if(supportPoints.length!==meta.vertices*3)throw Error('Project source support differs');
  renderer=new T.WebGLRenderer({antialias:false,alpha:presentation?.transparent===true,powerPreference:'default'});
  renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1;renderer.outputColorSpace=T.SRGBColorSpace;renderer.setClearColor('#090d0d',presentation?.transparent===true?0:1);
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFShadowMap;renderer.shadowMap.autoUpdate=false;
  renderer.debug.onShaderError=()=>{shaderFailure=Error('Project shader unavailable');};
  renderer.domElement.setAttribute('aria-hidden','true');renderer.domElement.setAttribute(presentation?.canvasAttribute??'data-project-model-canvas','');
  Object.assign(renderer.domElement.style,{position:'absolute',inset:'0',width:'100%',height:'100%',display:'block',pointerEvents:'none'});
  renderer.domElement.addEventListener('webglcontextlost',lost);
  budget=createRendererBudget(renderer,()=>({deviceDpr:host.ownerDocument.defaultView.devicePixelRatio||1,pixelBudget}));
  scene=new T.Scene();camera=new T.PerspectiveCamera();scene.background=presentation?.transparent===true?null:new T.Color('#090d0d');scene.fog=new T.FogExp2('#091217',.03);
  const generator=new T.PMREMGenerator(renderer);try{environment=generator.fromEquirectangular(hdr);}finally{generator.dispose();hdr.dispose();hdr=null;}
  scene.environment=environment.texture;scene.add(gltf.scene);exhibition=createExhibitionStage({bounds:meta.bounds});scene.add(exhibition.group);
  const lights={};for(const id of ['key','fill','rim']){lights[id]=new T.DirectionalLight();scene.add(lights[id],lights[id].target);}
  lights.hemisphere=new T.HemisphereLight();scene.add(lights.hemisphere);lights.key.castShadow=true;lights.key.shadow.mapSize.set(512,512);
  const draw=(width,height,force=false)=>{
    if(disposed||signal.aborted)throw Error('Project preview disposed');
    const decision=projectModelDrawDecision({lastSize,width,height,animated:!!presentation,lastProgress:lastRecipe?.progress,progress,suspended,force});
    if(!decision.draw)return;
    const {resized}=decision;
    if(decision.prepare){prepared=presentation.prepare(meta,width,height,supportPoints);preparations++;}
    const recipe=presentation?presentation.sample(prepared,progress):sampleProjectModelRecipe(meta,width,height,supportPoints),{pose,direction,stage,chapterScene}=recipe;
    adapters.forEach(adapter=>adapter.update(recipe.material));bases.forEach(({node,color})=>node.material.color.copy(color).multiplyScalar(recipe.baseMultiplier));
    budget.sync(width,height);camera.position.fromArray(pose.position);camera.up.fromArray(pose.up);camera.aspect=width/height;camera.fov=pose.fov;camera.near=pose.near;camera.far=pose.far;camera.lookAt(...pose.target);camera.updateProjectionMatrix();camera.updateMatrixWorld(true);
    for(const id of ['key','fill','rim']){const light=lights[id],spec=direction[id];light.position.fromArray(spec.position.map((value,i)=>value+stage.center[i]));light.target.position.fromArray(stage.lightTarget);light.color.fromArray(spec.color);light.intensity=spec.intensity;}
    lights.hemisphere.color.fromArray(direction.hemisphere.sky);lights.hemisphere.groundColor.fromArray(direction.hemisphere.ground);lights.hemisphere.intensity=direction.hemisphere.intensity;
    const shadow=lights.key.shadow;shadow.camera.left=shadow.camera.bottom=-stage.shadowHalfExtent;shadow.camera.right=shadow.camera.top=stage.shadowHalfExtent;shadow.camera.near=.05;shadow.camera.far=Math.max(20,stage.radius*10);shadow.camera.updateProjectionMatrix();shadow.bias=direction.stage.shadow.bias;shadow.normalBias=direction.stage.shadow.normalBias;
    exhibition.update({direction,camera,reducedMotion:false,lightSweep:0,backdrop:chapterScene.backdrop});if(presentation)presentationSet=applyProjectModelPresentationSet(exhibition.group,presentation);scene.environmentIntensity=direction.environmentIntensity;scene.fog.color.fromArray(direction.haze.color);scene.fog.density=direction.haze.density;
    if(!presentation||resized)renderer.shadowMap.needsUpdate=true;
    const connectedAtDraw=renderer.domElement.isConnected===true;
    const draw=commitProjectModelDraw({renderer,scene,camera,host,shaderFailure:()=>shaderFailure});
    lastSize={width,height};lastRecipe=recipe;frames++;
    firstDraw??=Object.freeze({completed:true,width,height,calls:draw.calls,sourceRevision:meta.revision,environmentReady:!!scene.environment});
    if(presentation&&!preparationSurface)preparationSurface={connectedAtDraw,...inspectProjectModelSurface(host,renderer.domElement)};
  };
  return{
   resize:draw,
   present(value){
    if(!presentation)return;
    if(!Number.isFinite(value?.progress))throw RangeError('Finite presentation progress required');
    progress=Math.max(0,Math.min(1,value.progress));
    const width=value.width??lastSize?.width,height=value.height??lastSize?.height;
    if(width&&height)draw(width,height);
   },
   expose(value){
    if(!presentation||disposed||signal.aborted||suspended||host.ownerDocument.hidden)return false;
    if(!Number.isInteger(value?.generation)||value.generation<1)throw RangeError('Exposure requires a live generation');
    const surface=inspectProjectModelSurface(host,renderer.domElement);
    if(!surface.connected||surface.hidden||surface.siteEntryState!=='entered'||surface.cover.count!==1||!surface.cover.hidden||surface.cover.display!=='none'||!surface.visible||!surface.intersectsViewport)return false;
    if(visibleCommit)return visibleCommit.generation===value.generation?structuredClone(visibleCommit):false;
    if(!Number.isFinite(value.progress))throw RangeError('Finite presentation progress required');
    const width=value.width??lastSize?.width,height=value.height??lastSize?.height;
    if(![width,height].every(size=>Number.isFinite(size)&&size>0))return false;
    progress=Math.max(0,Math.min(1,value.progress));
    draw(width,height,true);
    visibleCommit={completed:true,generation:value.generation,frame:frames,progress,sourceRevision:meta.revision,surface:inspectProjectModelSurface(host,renderer.domElement)};
    return structuredClone(visibleCommit);
   },
   suspend(){suspended=true;},
   resume(){suspended=false;},
   inspect:()=>({frames,firstDraw:firstDraw?{...firstDraw}:null,sourceRevision:meta.revision,vertices:meta.vertices,triangles:meta.triangles,canvasCount:disposed?0:1,pixelBudget,budget:budget.inspect(),calls:renderer.info.render.calls,materials:adapters.map(value=>value.inspect()),toneMapping:'ACESFilmic',exposure:1,output:'srgb',compositor:false,disposed,...(presentation?{presentation:presentation.id,preparationSurface:preparationSurface?structuredClone(preparationSurface):null,visibleCommit:visibleCommit?structuredClone(visibleCommit):null,presentationSet:presentationSet?{...presentationSet,sourceMeshes:roles.size}:null,progress:lastRecipe?.progress??null,beat:lastRecipe?.beat??null,pose:lastRecipe?.pose?structuredClone(lastRecipe.pose):null,sourceGeometryUnmodified:true,preparations,suspended}: {})}),
   dispose,
  };
 };
 return Promise.race([initialize(),aborted]).catch(error=>{dispose();throw error;});
}
