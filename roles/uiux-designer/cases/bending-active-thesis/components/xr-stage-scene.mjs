import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {prepareResearchSupport} from './prepared-research-support.mjs';
import {createRendererBudget} from './renderer-budget.mjs';
import {collectResearchSupport,createResearchPhoneGeometry,fitResearchCamera,RESEARCH_MODEL_PIXELS,RESEARCH_PHONE_PIXELS} from './research-scene-geometry.mjs';
import {acquireVideo} from '../runtime/site/video-resource.mjs';
import {createXRStageEnvironment} from './xr-stage-environment.mjs';

const abortError=()=>new DOMException('XR stage released','AbortError');
const boundedShaderLog=read=>{try{return String(read()??'').slice(0,2048);}catch(error){return String(error?.message??error).slice(0,2048);}};
const phoneChapter=chapter=>['adapt','assemble','join'].includes(chapter);
const sourcePoses={overview:[.72,.36,1],context:[.52,.29,1],method:[.92,.28,1],model:[.72,.36,1],making:[.55,.3,1],credits:[.72,.36,1.1]};

/** Editorial set draws cannot acknowledge the source or recorded screen. The
 * pinned assembly has one primitive; the original device has one casing and
 * one screen. Counters come from each real mesh's onBeforeRender callback.
 */
export function xrStagePaintReady({phone=false,shaderError=false,calls,source,phoneBody,phoneScreen,stage}){
 return !shaderError&&source===(phone?0:1)&&phoneBody===(phone?1:0)&&phoneScreen===(phone?1:0)
  &&stage>=1&&stage<=3&&calls===source+phoneBody+phoneScreen+stage;
}

/** Camera presentation only: source positions, normals, units and materials are
 * untouched. The subject has a reading-safe composition inside a full viewport;
 * that composition never limits the canvas or its project-owned surroundings. */
function cameraOptions({chapter='overview',azimuth=0,elevation=0,cameraIntent=null}={}){
 const phone=phoneChapter(chapter),base=sourcePoses[chapter]??sourcePoses.overview,intent=chapter==='method'?cameraIntent:null;
 if(intent&&![intent.yawRad,intent.pitchRad,intent.fovDeg,intent.zoom].every(Number.isFinite))throw RangeError('Finite composed XR camera intent required');
 return {yaw:phone?.1:intent?.yawRad??base[0]+azimuth,pitch:phone?-.025:Math.max(-.1,Math.min(1.15,intent?.pitchRad??base[1]+elevation)),fov:phone?32:intent?.fovDeg??36,zoom:phone?.98:intent?.zoom??base[2]};
}
const cameraSlot=(width,phone)=>width<800?{x:.5,y:phone?.51:.32,width:.94,height:phone?.76:.45}:{x:.735,y:.53,width:.51,height:.78};
export function stageCameraPose(points,width,height,state={}){
 const phone=phoneChapter(state.chapter),slot=cameraSlot(width,phone),options=cameraOptions(state),aspect=width*slot.width/(height*slot.height);
 const pose=typeof points?.fit==='function'?points.fit(aspect,options):fitResearchCamera(points,aspect,options);
 const fov=T.MathUtils.radToDeg(2*Math.atan(Math.tan(T.MathUtils.degToRad(pose.fov/2))/slot.height));
 return {...pose,fov,...(phone?{near:pose.radius*.08,far:pose.distance+pose.radius*2.5}:{}),slot,
  offset:{x:width*(.5-slot.x),y:height*(.5-slot.y)}};
}

/** One genuine full-viewport drawing surface, like Bending's rear scene.
 * A view offset composes the subject around native reading; it never crops the
 * drawing surface into a card. The existing physical-pixel cap remains bounded. */
export function stageRenderView(pose,width,height){
 return {left:0,top:0,width,height,fullWidth:width,fullHeight:height,offsetX:pose.offset.x,offsetY:pose.offset.y};
}

/** Invert this canvas-only framing transform; parent hold-stage translation or
 * axis scaling is represented by its actual bounding rectangle. */
export function xrStageCanvasPoint(x,y,rect,size,handheld){
 const {width,height}=size,{xPx=0,yPx=0,rollRad=0,originX=width*.5,originY=height*.5}=handheld;
 const c=Math.cos(rollRad),s=Math.sin(rollRad);
 const corners=[[0,0],[width,0],[0,height],[width,height]].map(([px,py])=>({x:originX+xPx+c*(px-originX)-s*(py-originY),y:originY+yPx+s*(px-originX)+c*(py-originY)}));
 const minX=Math.min(...corners.map(p=>p.x)),maxX=Math.max(...corners.map(p=>p.x)),minY=Math.min(...corners.map(p=>p.y)),maxY=Math.max(...corners.map(p=>p.y));
 if(!(rect.width>0&&rect.height>0&&width>0&&height>0))return null;
 const tx=(x-rect.left)*(maxX-minX)/rect.width+minX-originX-xPx,ty=(y-rect.top)*(maxY-minY)/rect.height+minY-originY-yPx;
 const px=originX+c*tx+s*ty,py=originY-s*tx+c*ty;
 const epsilon=1e-7;return px< -epsilon||px>width+epsilon||py< -epsilon||py>height+epsilon?null:{x:Math.max(0,Math.min(width,px)),y:Math.max(0,Math.min(height,py))};
}

function releaseObject(root){
 const geometries=new Set(),materials=new Set(),textures=new Set();
 root?.traverse(node=>{if(node.geometry)geometries.add(node.geometry);for(const material of(Array.isArray(node.material)?node.material:node.material?[node.material]:[])){materials.add(material);for(const value of Object.values(material))if(value?.isTexture)textures.add(value);}});
 geometries.forEach(v=>v.dispose());materials.forEach(v=>v.dispose());textures.forEach(v=>v.dispose());
}
/** One project renderer/camera. Director supplies chapter and interaction facts;
 * native video supplies decoded frames. Neither owns another animation clock. */
export async function acquireXRStage({host,signal,model,stages,videos,positions=new Map(),onMode=()=>{},createRenderer=options=>new T.WebGLRenderer(options),acquireMedia=acquireVideo}){
 if(signal.aborted)throw abortError();
 const win=host.ownerDocument.defaultView;
 let disposed=false,renderer=null,budget=null,scene=null,camera=null,gltf=null,support=null,phone=null,texture=null,environment=null;
  let mediaController=null,mediaHandle=null,frameCallback=null,mediaGeneration=0,mediaDeadline=null,activeStage=null,retainedMedia=null;
 let state={chapter:'overview',azimuth:0,elevation:0,paused:false},size={width:0,height:0},pose=null;
 let gpuReason=null,mediaReason=null,draws=0,mediaFrames=0,lastPaintKey='',revision=null,vertices=0,triangles=0,shaderError=false,mode='poster';
 let contextListener=null,mediaTime=null,mediaPending=false,successfulPaint=false,selection=null,renderView=null;
 let lastRenderFailure=null,shaderLogs=null,lastFit=null,cameraFits=0;
 let handheld={xPx:0,yPx:0,rollRad:0,originX:0,originY:0},compositorWrites=0;
 let drawCounts={source:0,phoneBody:0,phoneScreen:0,stage:0};
 const raycaster=new T.Raycaster(),ndc=new T.Vector2(),manager=new T.LoadingManager();
 const nativeNodes=new Map(stages.map(stage=>[stage.id,host.querySelector(`[data-xr-native-phone="${stage.id}"]`)]));
 const countDraws=(root,kind)=>root.traverse(node=>{if(!node.isMesh)return;const original=node.onBeforeRender;node.onBeforeRender=function(...args){drawCounts[kind]++;original.apply(this,args);};});
 const announce=(next,reason='')=>{const changed=mode!==next||host.dataset.xrFallback!==reason;mode=next;host.dataset.xrRendering=next;host.dataset.xrFallback=reason;if(changed)onMode(next,reason);};
 const stopFrames=()=>{if(frameCallback!==null&&activeStage){videos[activeStage.id]?.cancelVideoFrameCallback?.(frameCallback);frameCallback=null;}};
 function disposePhone(){
  stopFrames();if(phone){scene?.remove(phone.group);releaseObject(phone.group);phone.support.dispose();}phone=null;texture=null;lastFit=null;
  for(const node of nativeNodes.values())delete node.dataset.videoTextureSource;
 }
 function releaseRetainedMedia(){
  const retained=retainedMedia;retainedMedia=null;
  if(retained)delete nativeNodes.get(retained.stage.id).dataset.videoTextureSource;
  retained?.controller?.abort();retained?.handle?.dispose();
 }
 function stopMedia(retainPhone=false){
  mediaGeneration++;if(mediaDeadline!==null){win.clearTimeout(mediaDeadline);mediaDeadline=null;}stopFrames();
  // Release both application and VideoTexture frame callbacks before resetting
  // the native source. The texture must not retain a video being unloaded.
   const controller=mediaController,handle=mediaHandle;mediaController=null;mediaHandle=null;mediaPending=false;
   if(!retainPhone)disposePhone();
   if(retainPhone&&phone&&handle){
    releaseRetainedMedia();videos[activeStage.id].pause();retainedMedia={controller,handle,stage:activeStage};
   }else{controller?.abort();handle?.dispose();}
   if(!retainPhone)releaseRetainedMedia();
   for(const node of nativeNodes.values())delete node.dataset.videoReady;activeStage=null;mediaReason=null;
 }
 function mediaFailed(controller,node){
  const active=mediaController===controller,retained=retainedMedia?.controller===controller;
  if(disposed||!active&&!retained)return;
  if(active)mediaReason='recording-unavailable';
  disposePhone();releaseRetainedMedia();delete node.dataset.videoReady;delete host.dataset.xrScenePainted;successfulPaint=false;
  announce('poster','recording-unavailable');
 }
 function applyPaused(next){
  if(disposed)return;const paused=!!next;if(state.paused===paused)return;state={...state,paused};
  if(!activeStage||!mediaHandle)return;
  const video=videos[activeStage.id],generation=mediaGeneration;
  if(paused){stopFrames();video.pause();}
  else{void video.play().then(()=>{if(!disposed&&generation===mediaGeneration&&!state.paused)nextFrame();},()=>{if(!disposed&&generation===mediaGeneration&&!state.paused){mediaReason='playback-blocked';announce('native-video',mediaReason);}});}
 }
 function disposeGPU(){
  stopFrames();if(renderer){renderer.domElement.removeEventListener('webglcontextlost',contextListener);renderer.domElement.remove();budget?.dispose();renderer.dispose();renderer.forceContextLoss();}renderer=null;budget=null;
   disposePhone();releaseRetainedMedia();environment?.dispose();environment=null;releaseObject(gltf?.scene);gltf=null;support?.dispose();support=null;lastFit=null;scene?.clear();scene=null;camera=null;successfulPaint=false;delete host.dataset.xrScenePainted;
 }
 function fallbackGPU(reason){
  if(disposed)return;gpuReason=reason;disposeGPU();announce(activeStage&&mediaHandle?'native-video':'poster',reason);
 }
 function dispose(){
  if(disposed)return;disposed=true;signal.removeEventListener('abort',dispose);manager.abort();stopMedia();disposeGPU();delete host.dataset.xrRendering;delete host.dataset.xrFallback;
 }
 signal.addEventListener('abort',dispose,{once:true});
 function applyPose(points){
  const key=JSON.stringify([size,cameraOptions(state)]);if(lastFit?.points===points&&lastFit.key===key)return;
  cameraFits++;pose=stageCameraPose(points,size.width,size.height,state);camera.position.fromArray(pose.position);camera.up.fromArray(pose.up);camera.aspect=size.width/size.height;camera.fov=pose.fov;camera.near=pose.near;camera.far=pose.far;
  renderView=stageRenderView(pose,size.width,size.height);
  camera.setViewOffset(size.width,size.height,renderView.offsetX,renderView.offsetY,renderView.width,renderView.height);camera.lookAt(...pose.target);camera.updateProjectionMatrix();camera.updateMatrixWorld(true);
  lastFit={points,key};
  Object.assign(renderer.domElement.style,{inset:'auto',left:renderView.left+'px',top:renderView.top+'px',width:renderView.width+'px',height:renderView.height+'px'});
 }
 function rememberRenderFailure(error,operation){
  const caught={operation,name:String(error?.name??'Error'),message:String(error?.message??error).slice(0,2048)};
  try{
   lastRenderFailure={...caught,state:{...state},viewport:{...size},pose:pose?structuredClone(pose):null,renderView:renderView?{...renderView}:null,
    budget:budget?structuredClone(budget.inspect()):null,drawCounts:{...drawCounts},rendererCalls:renderer?.info.render.calls??null,
    contextLost:renderer?.getContext().isContextLost()??null,shaderError,shaderLogs:shaderLogs?{...shaderLogs}:null,
    environment:environment?structuredClone(environment.inspect()):null};
  }catch(diagnosticError){lastRenderFailure={...caught,diagnosticError:String(diagnosticError?.message??diagnosticError).slice(0,2048)};}
 }
 function draw(force=false){
  if(disposed||!renderer||!size.width||!size.height)return;
  const isPhone=phoneChapter(state.chapter);if(isPhone&&!phone)return;if(!isPhone&&!support)return;
  const options=cameraOptions(state);
  const micro=state.chapter==='method'&&state.handheld?state.handheld:{xPx:0,yPx:0,rollRad:0},slot=cameraSlot(size.width,isPhone);
  if(![micro.xPx,micro.yPx,micro.rollRad].every(Number.isFinite)||Math.abs(micro.xPx)>1.2||Math.abs(micro.yPx)>1.2||Math.abs(micro.rollRad)>.0012)throw RangeError('Bounded compositor handheld required');
  const originX=size.width*slot.x,originY=size.height*slot.y;
  const hint=state.chapter==='method'&&state.handheld?'transform':'';if(renderer.domElement.style.willChange!==hint)renderer.domElement.style.willChange=hint;
  if(micro.xPx!==handheld.xPx||micro.yPx!==handheld.yPx||micro.rollRad!==handheld.rollRad||originX!==handheld.originX||originY!==handheld.originY){
   handheld={...micro,originX,originY};compositorWrites++;
   renderer.domElement.style.transformOrigin=`${slot.x*100}% ${slot.y*100}%`;
   renderer.domElement.style.transform=micro.xPx||micro.yPx||micro.rollRad?`translate3d(${micro.xPx}px,${micro.yPx}px,0) rotate(${micro.rollRad}rad)`:'none';
  }
  const key=JSON.stringify([size,state.chapter,options,isPhone?mediaFrames:0]);if(!force&&key===lastPaintKey&&successfulPaint)return;
  let operation='context-before';
  try{
   if(renderer.getContext().isContextLost()){rememberRenderFailure(new Error('XR context lost before draw'),operation);return fallbackGPU('context-lost');}
   operation='source-visibility';
   gltf.scene.visible=!isPhone;if(phone)phone.group.visible=isPhone;
   operation='camera';
   applyPose(isPhone?phone.support:support);
   operation='budget';
   budget.sync(renderView.width,renderView.height);
   operation='environment';
   environment?.update({camera,chapter:state.chapter,bounds:isPhone?phone.bounds:model.bounds,viewportWidth:size.width,renderView,drawingBuffer:{width:renderer.domElement.width,height:renderer.domElement.height}});
   operation='render';
   drawCounts={source:0,phoneBody:0,phoneScreen:0,stage:0};renderer.render(scene,camera);
   operation='context-after';
   if(renderer.getContext().isContextLost()){rememberRenderFailure(new Error('XR context lost after draw'),operation);return fallbackGPU('context-lost');}
   operation='participation';
   if(!xrStagePaintReady({phone:isPhone,shaderError,calls:renderer.info.render.calls,...drawCounts}))throw Error('XR source or recorded screen did not paint');
   lastPaintKey=key;draws++;successfulPaint=true;host.dataset.xrScenePainted=isPhone?'phone':'model';announce(isPhone?'webgl-phone':'webgl-model');
  }catch(error){rememberRenderFailure(error,operation);fallbackGPU(renderer?.getContext().isContextLost()?'context-lost':'render-unavailable');}
 }
 function nextFrame(){
  if(disposed||!renderer||!activeStage||state.paused||!mediaHandle||frameCallback!==null)return;
  const video=videos[activeStage.id],generation=mediaGeneration;
  if(typeof video.requestVideoFrameCallback!=='function'){fallbackGPU('decoded-frame-events-unavailable');return;}
  frameCallback=video.requestVideoFrameCallback((_now,metadata)=>{
   frameCallback=null;if(disposed||generation!==mediaGeneration||state.paused)return;
   mediaFrames++;mediaTime=metadata.mediaTime;if(texture)texture.needsUpdate=true;draw(true);nextFrame();
  });
 }
 async function selectMedia(stage){
   // Consecutive recordings share one visible phone passage. Keep its paused
   // last native frame until the next real decoded source can replace it.
   stopMedia(true);activeStage=stage;mediaReason=null;const node=nativeNodes.get(stage.id),video=videos[stage.id];
   // A quick reversal can select the exact native node still owned by the
   // retained phone. Transfer that owner instead of acquiring the node twice:
   // disposing the old handle would otherwise unload the new handle's source.
   const retained=retainedMedia;
   if(retained?.stage.id===stage.id&&!retained.controller.signal.aborted&&retained.handle.inspect().hasSource){
    retainedMedia=null;mediaController=retained.controller;mediaHandle=retained.handle;node.dataset.videoReady='true';
    const generation=mediaGeneration;
    if(state.paused)video.pause();
    else{
     try{await video.play();if(!disposed&&generation===mediaGeneration&&!state.paused)nextFrame();}
     catch{if(!disposed&&generation===mediaGeneration){mediaReason='playback-blocked';announce('native-video',mediaReason);}}
    }
    return;
   }
   if(!phone){delete host.dataset.xrScenePainted;successfulPaint=false;}
   const generation=mediaGeneration,controller=new AbortController();mediaController=controller;mediaPending=true;if(!phone)announce('poster',gpuReason??'recording-loading');
   mediaDeadline=win.setTimeout(()=>{if(!disposed&&generation===mediaGeneration){mediaReason='recording-timeout';controller.abort();mediaPending=false;disposePhone();releaseRetainedMedia();announce('poster',mediaReason);}},15000);
  try{
    const handle=await acquireMedia({video,src:stage.src,signal:controller.signal,position:positions.get(stage.id)??0,onPosition:value=>positions.set(stage.id,value),origin:win.location.origin,onFailure:()=>mediaFailed(controller,node)});
   if(disposed||controller.signal.aborted||generation!==mediaGeneration){handle.dispose();return;}
   win.clearTimeout(mediaDeadline);mediaDeadline=null;mediaPending=false;mediaHandle=handle;node.dataset.videoReady='true';
   if(state.paused)video.pause();
   if(renderer){
     disposePhone();releaseRetainedMedia();
    const geometry=createResearchPhoneGeometry(stage.width/stage.height);texture=new T.VideoTexture(video);texture.colorSpace=T.SRGBColorSpace;texture.generateMipmaps=false;
    const group=new T.Group(),body=new T.Mesh(geometry.body,new T.MeshStandardMaterial({color:'#292e30',metalness:.65,roughness:.33})),screen=new T.Mesh(geometry.screen,new T.MeshBasicMaterial({map:texture,toneMapped:false}));
    group.add(body,screen);countDraws(body,'phoneBody');countDraws(screen,'phoneScreen');
    const phoneSupport=prepareResearchSupport(geometry.support);
    phone={group,support:phoneSupport,dimensions:geometry.dimensions,bounds:phoneSupport.inspect().bounds};scene.add(group);
    // React owns chapter visibility. Keep the VideoTexture's actual native
    // source in layout until this phone is released, including a pending
    // chapter or a reverse before React commits its new hidden attributes.
    node.dataset.videoTextureSource='true';draw(true);nextFrame();
   }else announce('native-video',gpuReason??'webgl-unavailable');
  }catch(error){
   if(disposed||generation!==mediaGeneration)return;mediaPending=false;if(mediaDeadline!==null)win.clearTimeout(mediaDeadline);mediaDeadline=null;
    if(!controller.signal.aborted)mediaReason=error?.message??'recording-unavailable';disposePhone();releaseRetainedMedia();announce('poster',mediaReason??'recording-unavailable');
  }
 }
 try{
  try{
   renderer=createRenderer({alpha:true,antialias:true,powerPreference:'default'});renderer.setClearColor(0,0);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1;
   renderer.debug.onShaderError=(gl,program,vertex,fragment)=>{shaderError=true;shaderLogs={program:boundedShaderLog(()=>gl.getProgramInfoLog(program)),vertex:boundedShaderLog(()=>gl.getShaderInfoLog(vertex)),fragment:boundedShaderLog(()=>gl.getShaderInfoLog(fragment))};};const canvas=renderer.domElement;canvas.dataset.xrWebglCanvas='';canvas.setAttribute('aria-hidden','true');Object.assign(canvas.style,{position:'absolute',inset:'0',width:'100%',height:'100%',display:'block',pointerEvents:'none'});
   contextListener=event=>{event.preventDefault();fallbackGPU('context-lost');};canvas.addEventListener('webglcontextlost',contextListener);
   budget=createRendererBudget(renderer,()=>({deviceDpr:win.devicePixelRatio||1,pixelBudget:phoneChapter(state.chapter)?RESEARCH_PHONE_PIXELS:RESEARCH_MODEL_PIXELS}));
   scene=new T.Scene();camera=new T.PerspectiveCamera();scene.add(new T.HemisphereLight('#d8e9f4','#484b40',2));
   const key=new T.DirectionalLight('#fff0df',2.2);key.position.set(2,4,3);scene.add(key);const fill=new T.DirectionalLight('#90b9d8',.8);fill.position.set(-3,1,-2);scene.add(fill);
  }catch{gpuReason='webgl-unavailable';disposeGPU();announce('poster',gpuReason);}
  if(renderer){
   const url=new URL(model.src,win.location.origin);if(url.origin!==win.location.origin||!url.pathname.startsWith('/assets/xr/'))throw Error('Public XR source required');
   const response=await fetch(url,{signal});if(!response.ok)throw Error('XR source unavailable');const bytes=await response.arrayBuffer();if(signal.aborted)throw abortError();
   revision=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),n=>n.toString(16).padStart(2,'0')).join('');if(revision!==model.sha256)throw Error('XR source revision differs');
   if(disposed||signal.aborted)throw abortError();
   const parsed=await new GLTFLoader(manager).parseAsync(bytes,'');if(disposed||signal.aborted){releaseObject(parsed.scene);throw abortError();}gltf=parsed;
   gltf.scene.traverse(node=>{if(node.isMesh){vertices+=node.geometry.getAttribute('position').count;triangles+=(node.geometry.index?.count??node.geometry.getAttribute('position').count)/3;}});
   if(vertices!==model.vertices||triangles!==model.triangles)throw Error('XR source geometry differs');support=prepareResearchSupport(collectResearchSupport(gltf.scene));countDraws(gltf.scene,'source');scene.add(gltf.scene);
   environment=createXRStageEnvironment({bounds:model.bounds});countDraws(environment.group,'stage');scene.add(environment.group);
   (host.querySelector('[data-xr-scene-surface]')??host).appendChild(renderer.domElement);
  }
  if(disposed||signal.aborted)throw abortError();
  return {
   resize(width,height){if(disposed||!(width>0&&height>0))return;if(size.width===width&&size.height===height)return;size={width,height};lastPaintKey='';draw();},
   present(next){
    if(disposed)return;const paused=next.paused??state.paused;state={...state,...next,paused:state.paused};const stage=stages.find(item=>item.id===state.chapter);
    if(stage&&activeStage?.id!==stage.id)selection=selectMedia(stage);
    else if(!stage&&activeStage){stopMedia();delete host.dataset.xrScenePainted;successfulPaint=false;if(!renderer)announce('poster',gpuReason??'webgl-unavailable');}
    applyPaused(paused);
    draw();
    if(stage&&mediaPending)return selection;
   },
   // A semantic media command is acknowledged by the native owner immediately;
   // it must not wait for the next camera/information animation frame.
   setPaused:applyPaused,
   hitTest(clientX,clientY){
    if(disposed||!renderer||!successfulPaint||phoneChapter(state.chapter)||!gltf)return false;
    const rect=renderer.domElement.getBoundingClientRect();if(clientX<rect.left||clientX>rect.right||clientY<rect.top||clientY>rect.bottom)return false;const local=xrStageCanvasPoint(clientX,clientY,rect,size,handheld);if(!local)return false;ndc.set(local.x/size.width*2-1,-local.y/size.height*2+1);raycaster.setFromCamera(ndc,camera);
    return raycaster.intersectObject(gltf.scene,true).length?{source:true,kind:'model'}:false;
   },
   inspect:()=>({mode,chapter:state.chapter,successfulPaint,sourceRevision:revision,sourceUnits:model.sourceUnits,webUnits:model.webUnits,vertices,triangles,pose,view:{azimuth:state.azimuth,elevation:state.elevation,cameraIntent:state.cameraIntent??null},support:support?.inspect()??{disposed:true,points:0,bytes:0,bounds:null},sourceTransforms:gltf?.scene.children.map(node=>({position:node.position.toArray(),scale:node.scale.toArray(),quaternion:node.quaternion.toArray()})),surface:renderer?{draws,cameraFits,compositor:{...handheld,writes:compositorWrites,kind:'2d-pan-roll'},calls:renderer.info.render.calls,sourceCalls:drawCounts.source,phoneCalls:drawCounts.phoneBody+drawCounts.phoneScreen,phoneBodyCalls:drawCounts.phoneBody,phoneScreenCalls:drawCounts.phoneScreen,stageCalls:drawCounts.stage,environment:environment?.inspect()??null,viewport:renderView?{...renderView}:null,clearAlpha:renderer.getClearAlpha(),budget:budget.inspect(),pixelBudget:phoneChapter(state.chapter)?RESEARCH_PHONE_PIXELS:RESEARCH_MODEL_PIXELS}:null,media:{stage:activeStage?.id??null,pending:mediaPending,frames:mediaFrames,time:mediaTime,native:mediaHandle?.inspect()??null,reason:mediaReason,position:activeStage?videos[activeStage.id].currentTime:null},fallbackReason:gpuReason,lastRenderFailure,paused:state.paused,disposed}),
   dispose,
  };
 }catch(error){dispose();throw error;}
}
