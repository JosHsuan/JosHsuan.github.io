import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {createRendererBudget} from './renderer-budget.mjs';
import {acquireVideo} from '../runtime/site/video-resource.mjs';
import {collectResearchSupport,createResearchPhoneGeometry,fitResearchCamera,fitResearchPhoneCamera,RESEARCH_MODEL_PIXELS,RESEARCH_PHONE_PIXELS} from './research-scene-geometry.mjs';

const aborted=()=>new DOMException('Research display released','AbortError');
function disposeObject(root,{geometries:extraGeometries=[],textures:extraTextures=[]}={}){
 const geometries=new Set(extraGeometries),materials=new Set(),textures=new Set(extraTextures);
 root?.traverse(node=>{if(node.geometry)geometries.add(node.geometry);for(const material of(Array.isArray(node.material)?node.material:node.material?[node.material]:[])){materials.add(material);for(const value of Object.values(material))if(value?.isTexture)textures.add(value);}});
 geometries.forEach(value=>value.dispose());materials.forEach(value=>value.dispose());textures.forEach(value=>value.dispose());
}

function createSurface(host,pixels,onLost){
 let renderer=null,budget=null,disposed=false,draws=0,shaderError=null;
 try{
  renderer=new T.WebGLRenderer({alpha:false,antialias:true,powerPreference:'default'});
  renderer.setClearColor('#101b22',1);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1;
  renderer.debug.onShaderError=()=>{shaderError=Error('Research display shader unavailable');};
  const canvas=renderer.domElement;canvas.setAttribute('aria-hidden','true');canvas.setAttribute('data-xr-webgl-canvas','');
  Object.assign(canvas.style,{position:'absolute',inset:'0',width:'100%',height:'100%',display:'block',pointerEvents:'none'});
  const lost=event=>{event.preventDefault();if(!disposed)onLost('context-lost');};
  canvas.addEventListener('webglcontextlost',lost);
  budget=createRendererBudget(renderer,()=>({deviceDpr:host.ownerDocument.defaultView.devicePixelRatio||1,pixelBudget:pixels}));
  return {
   renderer,
   draw(scene,camera,width,height){
    if(disposed)throw Error('Research display disposed');
    budget.sync(width,height);renderer.render(scene,camera);
    if(shaderError)throw shaderError;if(renderer.getContext().isContextLost()||renderer.info.render.calls<1)throw Error('Research display did not draw');
    draws++;if(!canvas.parentNode)host.appendChild(canvas);
   },
   inspect:()=>({draws,pixelBudget:pixels,budget:budget.inspect(),calls:renderer.info.render.calls,disposed}),
   dispose(){if(disposed)return;disposed=true;canvas.removeEventListener('webglcontextlost',lost);canvas.remove();budget.dispose();renderer.dispose();renderer.forceContextLoss();},
  };
 }catch(error){budget?.dispose();renderer?.dispose();renderer?.forceContextLoss();throw error;}
}

function applyPose(camera,pose,aspect){
 camera.position.fromArray(pose.position);camera.up.fromArray(pose.up);camera.aspect=aspect;camera.fov=pose.fov;camera.near=pose.near;camera.far=pose.far;
 camera.lookAt(...pose.target);camera.updateProjectionMatrix();camera.updateMatrixWorld(true);
}

/** Source project geometry only. The independent display camera responds to
 * explicit model commands; there is no autonomous orbit or animation clock. */
export async function acquireXRModelStudy({host,signal,model,onFailure=()=>{}}){
 if(signal.aborted)throw aborted();
 let closed=false,surface=null,scene=null,gltf=null,camera=null,support=null,lastSize=null;
 let yaw=.72,pitch=.36,zoom=1,pose=null,vertices=0,triangles=0,revision=null;
 const manager=new T.LoadingManager();
 function dispose(){
  if(closed)return;closed=true;signal.removeEventListener('abort',dispose);manager.abort();surface?.dispose();disposeObject(gltf?.scene);scene?.clear();support=null;
 }
 signal.addEventListener('abort',dispose,{once:true});
 const draw=()=>{
  if(closed||!lastSize)return;
  pose=fitResearchCamera(support,lastSize.width/lastSize.height,{yaw,pitch,zoom});applyPose(camera,pose,lastSize.width/lastSize.height);
  surface.draw(scene,camera,lastSize.width,lastSize.height);
 };
 try{
  const url=new URL(model.src,host.ownerDocument.defaultView.location.origin);
  if(url.origin!==host.ownerDocument.defaultView.location.origin||!url.pathname.startsWith('/assets/xr/'))throw Error('Public XR model required');
  const response=await fetch(url,{signal});if(!response.ok)throw Error('XR model unavailable');const bytes=await response.arrayBuffer();
  if(closed||signal.aborted)throw aborted();
  revision=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),n=>n.toString(16).padStart(2,'0')).join('');
  if(revision!==model.sha256)throw Error('XR model revision differs');
  if(closed||signal.aborted)throw aborted();
  const parsed=await new GLTFLoader(manager).parseAsync(bytes,'');
  if(closed||signal.aborted){disposeObject(parsed.scene);throw aborted();}gltf=parsed;
  gltf.scene.traverse(node=>{if(node.isMesh){vertices+=node.geometry.getAttribute('position').count;triangles+=(node.geometry.index?.count??node.geometry.getAttribute('position').count)/3;}});
  if(vertices!==model.vertices||triangles!==model.triangles)throw Error('XR source geometry differs');
  support=collectResearchSupport(gltf.scene);scene=new T.Scene();camera=new T.PerspectiveCamera();scene.add(gltf.scene);
  scene.add(new T.HemisphereLight('#d8e9f4','#484b40',2));
  const key=new T.DirectionalLight('#fff0df',2.2);key.position.set(2,4,3);scene.add(key);
  const fill=new T.DirectionalLight('#90b9d8',.8);fill.position.set(-3,1,-2);scene.add(fill);
  surface=createSurface(host,RESEARCH_MODEL_PIXELS,reason=>{if(!closed)onFailure(reason);});
  const interact=change=>{if(closed)return;try{change();draw();}catch{onFailure('render-unavailable');}};
  return {
   resize(width,height){if(closed)throw Error('XR study disposed');if(!(width>0&&height>0))return;if(lastSize?.width===width&&lastSize?.height===height)return;lastSize={width,height};draw();},
   rotate(x,y){interact(()=>{yaw+=Math.max(-1,Math.min(1,x));pitch=Math.max(-.1,Math.min(1.15,pitch+y));});},
   zoom(delta){interact(()=>{zoom=Math.max(.68,Math.min(2.5,zoom+delta));});},
   reset(){interact(()=>{yaw=.72;pitch=.36;zoom=1;});},
   inspect:()=>({mode:'webgl-model',sourceRevision:revision,vertices,triangles,sourceUnits:model.sourceUnits??'unconfirmed',webUnits:model.webUnits??'unconfirmed',sourceTransforms:gltf?.scene.children.map(node=>({position:node.position.toArray(),scale:node.scale.toArray(),quaternion:node.quaternion.toArray()})),pose,view:{yaw,pitch,zoom},surface:surface?.inspect(),disposed:closed}),
   dispose,
  };
 }catch(error){dispose();throw error;}
}

/** The native video owns all media time. Its decoded-frame events invalidate a
 * low-cost phone scene; no RAF, JS playback timer or React frame state exists.
 * A missing/lost WebGL context retains the same playing video in the DOM shell.
 */
export async function acquireXRPhoneStudy({host,video,signal,stage,position=0,onPosition=()=>{},onFailure=()=>{},onMode=()=>{}}){
 if(signal.aborted)throw aborted();
 let closed=false,surface=null,scene=null,camera=null,phone=null,texture=null,videoHandle=null;
 let lastSize=null,front=false,frameCallback=null,mode='native-video',reason=null,mediaFrames=0,renderedMediaTime=null;
 const fallbacks=[];
 const disposeGPU=()=>{if(frameCallback!==null){video.cancelVideoFrameCallback?.(frameCallback);frameCallback=null;}surface?.dispose();surface=null;disposeObject(scene,{geometries:[phone?.body,phone?.screen].filter(Boolean),textures:[texture].filter(Boolean)});texture=null;scene?.clear();scene=null;phone=null;};
 const fallback=value=>{
  if(closed)return;reason=value;mode='native-video';fallbacks.push({reason:value});if(fallbacks.length>8)fallbacks.shift();disposeGPU();onMode(mode,value);
 };
 function dispose(){if(closed)return;closed=true;signal.removeEventListener('abort',dispose);disposeGPU();videoHandle?.dispose();videoHandle=null;}
 signal.addEventListener('abort',dispose,{once:true});
 const draw=()=>{
  if(closed||!surface||!scene||!lastSize)return;
  const pose=fitResearchPhoneCamera(phone.support,lastSize.width/lastSize.height,{front});
  applyPose(camera,pose,lastSize.width/lastSize.height);texture.needsUpdate=true;surface.draw(scene,camera,lastSize.width,lastSize.height);renderedMediaTime=video.currentTime;
 };
 const nextFrame=()=>{
  if(closed||!surface)return;
  frameCallback=video.requestVideoFrameCallback((_now,metadata)=>{
   frameCallback=null;if(closed||!surface)return;
   try{draw();mediaFrames++;renderedMediaTime=metadata.mediaTime;nextFrame();}catch{fallback('render-unavailable');}
  });
 };
 try{
  videoHandle=await acquireVideo({video,src:stage.src,signal,position,onPosition,onFailure,origin:host.ownerDocument.defaultView.location.origin});
  if(closed||signal.aborted){videoHandle.dispose();throw aborted();}
  try{
   if(typeof video.requestVideoFrameCallback!=='function')throw Error('decoded-frame-events-unavailable');
   phone=createResearchPhoneGeometry(stage.width/stage.height);scene=new T.Scene();camera=new T.PerspectiveCamera();
   texture=new T.VideoTexture(video);texture.colorSpace=T.SRGBColorSpace;texture.generateMipmaps=false;
   const bodyMaterial=new T.MeshStandardMaterial({color:'#292e30',metalness:.65,roughness:.33});
   const screenMaterial=new T.MeshBasicMaterial({map:texture,toneMapped:false});
   scene.add(new T.Mesh(phone.body,bodyMaterial),new T.Mesh(phone.screen,screenMaterial));
   scene.add(new T.HemisphereLight('#e0ebf1','#172028',2.3));
   const key=new T.DirectionalLight('#fff0dd',3);key.position.set(-2,3,4);scene.add(key);
   surface=createSurface(host,RESEARCH_PHONE_PIXELS,value=>fallback(value));mode='webgl-phone';onMode(mode,null);
  }catch(error){fallback(error.message||'webgl-unavailable');}
  return {
   resize(width,height){if(closed)throw Error('Phone display disposed');if(!(width>0&&height>0))return;if(lastSize?.width===width&&lastSize?.height===height)return;lastSize={width,height};if(surface){try{draw();if(frameCallback===null)nextFrame();}catch{fallback('render-unavailable');}}},
   faceScreen(value){if(closed)return;front=!!value;try{draw();}catch{fallback('render-unavailable');}},
   inspect:()=>({mode,fallbackReason:reason,fallbacks:[...fallbacks],stage:stage.id,mediaFrames,renderedMediaTime,front,screenAspect:stage.width/stage.height,device:phone?.dimensions??null,surface:surface?.inspect()??null,video:videoHandle?.inspect()??null,disposed:closed}),
   dispose,
  };
 }catch(error){dispose();throw error;}
}
