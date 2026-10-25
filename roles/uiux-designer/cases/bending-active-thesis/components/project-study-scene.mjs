import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {MeshoptDecoder} from 'three/addons/libs/meshopt_decoder.module.js';
import {createRendererBudget} from './renderer-budget.mjs';
import {DOT_SOURCE_REVISION,createDotDetailCollector,fitDotDetailCamera,inspectDotDetail} from './dot-detail-score.mjs';
import {fitResearchCamera,RESEARCH_MODEL_PIXELS} from './research-scene-geometry.mjs';
import {installProjectStudyAppearance} from './project-study-appearance.mjs';

const ZERO_HANDHELD=Object.freeze({xPx:0,yPx:0,rollRad:0});
const aborted=()=>new DOMException('Project study released','AbortError');
function releaseObject(root){
 const geometries=new Set(),materials=new Set(),textures=new Set();
 root?.traverse(node=>{if(node.geometry)geometries.add(node.geometry);for(const material of(Array.isArray(node.material)?node.material:node.material?[node.material]:[])){materials.add(material);for(const value of Object.values(material))if(value?.isTexture)textures.add(value);}});
 geometries.forEach(value=>value.dispose());materials.forEach(value=>value.dispose());textures.forEach(value=>{value.image?.close?.();value.dispose();});
}
/** Invert this canvas-only framing transform; parent hold-stage translation or
 * axis scaling is represented by its actual bounding rectangle. */
export function projectStudyCanvasPoint(x,y,rect,size,handheld){
 const {width,height}=size,{xPx=0,yPx=0,rollRad=0,originX=width*.5,originY=height*.5}=handheld;
 const c=Math.cos(rollRad),s=Math.sin(rollRad);
 const corners=[[0,0],[width,0],[0,height],[width,height]].map(([px,py])=>({x:originX+xPx+c*(px-originX)-s*(py-originY),y:originY+yPx+s*(px-originX)+c*(py-originY)}));
 const minX=Math.min(...corners.map(p=>p.x)),maxX=Math.max(...corners.map(p=>p.x)),minY=Math.min(...corners.map(p=>p.y)),maxY=Math.max(...corners.map(p=>p.y));
 if(!(rect.width>0&&rect.height>0&&width>0&&height>0))return null;
 const tx=(x-rect.left)*(maxX-minX)/rect.width+minX-originX-xPx,ty=(y-rect.top)*(maxY-minY)/rect.height+minY-originY-yPx;
 const px=originX+c*tx+s*ty,py=originY-s*tx+c*ty;
 const epsilon=1e-7;return px< -epsilon||px>width+epsilon||py< -epsilon||py>height+epsilon?null:{x:Math.max(0,Math.min(width,px)),y:Math.max(0,Math.min(height,py))};
}
/** A single full-viewport renderer. Original source transforms, geometry and UVs
 * stay exact. Scoped material clones and a static light rig own presentation;
 * the existing site driver supplies every time-dependent fact. */
export async function acquireProjectStudyScene({host,model,signal,onFailure=()=>{},createRenderer=options=>new T.WebGLRenderer(options)}){
 if(signal.aborted)throw aborted();
 const win=host.ownerDocument.defaultView,manager=new T.LoadingManager();
 let renderer=null,budget=null,scene=null,camera=null,gltf=null,support=null,appearance=null,disposed=false,shaderError=false;
 let size={width:0,height:0},state={chapter:model.chapters[0],azimuth:0,elevation:0},lastDraw=null,cameraFits=0,draws=0,firstDraw=null,successfulPaint=false,pose=null;
 let handheld={xPx:0,yPx:0,rollRad:0,originX:0,originY:0},compositorWrites=0,lastRenderSubmitMs=0,totalRenderSubmitMs=0;
 let detailSelection=null,detailWeight=0;
 let revision=null,vertices=0,triangles=0,meshes=0,drawnMeshes=0,sourceCalls=0,sourcePoints=0;
 const ray=new T.Raycaster(),point=new T.Vector2(),painted=new Set();
 const lost=event=>{event.preventDefault();successfulPaint=false;onFailure('context-lost');};
 const dispose=()=>{
  if(disposed)return;disposed=true;signal.removeEventListener('abort',dispose);manager.abort();
  appearance?.dispose();appearance=null;releaseObject(gltf?.scene);gltf=null;support=null;detailSelection=null;scene?.clear();scene=null;
  if(renderer){renderer.domElement.removeEventListener('webglcontextlost',lost);renderer.domElement.remove();budget?.dispose();renderer.dispose();renderer.forceContextLoss();renderer=null;}
 };
 signal.addEventListener('abort',dispose,{once:true});
 const draw=()=>{
  if(disposed||!renderer||!size.width||!size.height)return;
  const narrow=size.width<800,slot=narrow?{x:.5,y:.42,width:.94,height:.45}:{x:.735,y:.53,width:.51,height:.78},view=model.views?.[state.chapter]??{};
  // The presenter owns main + optional inspection composition. Never
  // add legacy inspection twice; the renderer remains the only camera writer.
  const intent=state.cameraIntent;
  if(intent!=null&&(!Number.isFinite(intent.yawRad)||!Number.isFinite(intent.pitchRad)||!Number.isFinite(intent.fovDeg)||!Number.isFinite(intent.zoom)))throw RangeError('Finite composed project camera intent required');
  const yaw=intent?.yawRad??((view.yaw??.72)+state.azimuth),pitch=Math.max(-.1,Math.min(1.15,intent?.pitchRad??((view.pitch??.3)+state.elevation))),fov=intent?.fovDeg??view.fov??36,zoom=intent?.zoom??view.zoom??1;
  const nextDetail=detailSelection?(intent?.detailWeight??0):0;
  if(!Number.isFinite(nextDetail)||nextDetail<0||nextDetail>1)throw RangeError('Bounded Dot detail weight required');
  // Continuous generic handheld is an honest 2D pan/roll, without parallax.
  // Its canvas owns only this transform; the parent stage still owns entry/exit.
  const micro=state.handheld??ZERO_HANDHELD;
  if((!Number.isFinite(micro.xPx)||!Number.isFinite(micro.yPx)||!Number.isFinite(micro.rollRad))||Math.abs(micro.xPx)>1.2||Math.abs(micro.yPx)>1.2||Math.abs(micro.rollRad)>.0012)throw RangeError('Bounded compositor handheld required');
  const hint=state.handheld?'transform':'';if(renderer.domElement.style.willChange!==hint)renderer.domElement.style.willChange=hint;
  const originX=size.width*slot.x,originY=size.height*slot.y;
  if(micro.xPx!==handheld.xPx||micro.yPx!==handheld.yPx||micro.rollRad!==handheld.rollRad||originX!==handheld.originX||originY!==handheld.originY){
   handheld={xPx:micro.xPx,yPx:micro.yPx,rollRad:micro.rollRad,originX,originY};compositorWrites++;
   renderer.domElement.style.transformOrigin=`${slot.x*100}% ${slot.y*100}%`;
   renderer.domElement.style.transform=micro.xPx||micro.yPx||micro.rollRad?`translate3d(${micro.xPx}px,${micro.yPx}px,0) rotate(${micro.rollRad}rad)`:'none';
  }
  if(successfulPaint&&lastDraw?.width===size.width&&lastDraw.height===size.height&&lastDraw.yaw===yaw&&lastDraw.pitch===pitch&&lastDraw.fov===fov&&lastDraw.zoom===zoom&&detailWeight===nextDetail)return;
  // Native context loss may become observable before its queued DOM event.
  // Both paths must retain the same terminal failure classification.
  if(renderer.getContext().isContextLost())throw Error('context-lost');
  cameraFits++;
  pose=detailSelection?fitDotDetailCamera(support,detailSelection,size.width*slot.width/(size.height*slot.height),{yaw,pitch,fov,zoom},nextDetail):fitResearchCamera(support,size.width*slot.width/(size.height*slot.height),{yaw,pitch,fov,zoom});
  camera.position.fromArray(pose.position);camera.up.fromArray(pose.up);camera.aspect=size.width/size.height;
  camera.fov=T.MathUtils.radToDeg(2*Math.atan(Math.tan(T.MathUtils.degToRad(pose.fov/2))/slot.height));camera.near=pose.near;camera.far=pose.far;
  camera.setViewOffset(size.width,size.height,size.width*(.5-slot.x),size.height*(.5-slot.y),size.width,size.height);camera.lookAt(...pose.target);camera.updateProjectionMatrix();camera.updateMatrixWorld(true);
  budget.sync(size.width,size.height);painted.clear();sourceCalls=0;
  // CPU-side submission observation only; this is not a GPU timer or FPS claim.
  const submitStarted=performance.now();renderer.render(scene,camera);lastRenderSubmitMs=performance.now()-submitStarted;totalRenderSubmitMs+=lastRenderSubmitMs;
  drawnMeshes=painted.size;
  // A genuine transparent double-sided source material can issue two native
  // draw calls for one onBeforeRender callback. Every source object must still
  // participate; a decorative or empty render can never satisfy this boundary.
  if(renderer.getContext().isContextLost())throw Error('context-lost');
  if(shaderError||drawnMeshes!==meshes||sourceCalls<meshes||renderer.info.render.calls<sourceCalls)throw Error('The complete original project model did not draw');
  successfulPaint=true;detailWeight=nextDetail;lastDraw={width:size.width,height:size.height,yaw,pitch,fov,zoom};draws++;firstDraw??={completed:true,sourceRevision:revision,meshes:drawnMeshes,sourceCalls,width:size.width,height:size.height};
 };
 try{
  const url=new URL(model.src,win.location.origin);
  if(url.origin!==win.location.origin||!url.pathname.startsWith('/assets/projects/')||!url.pathname.endsWith('.glb'))throw Error('Pinned public project model required');
  const response=await fetch(url,{signal});if(!response.ok)throw Error('Project model unavailable');
  const bytes=await response.arrayBuffer();if(disposed||signal.aborted)throw aborted();
  if(bytes.byteLength!==model.bytes)throw Error('Project model byte count differs');
  revision=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),value=>value.toString(16).padStart(2,'0')).join('');
  if(revision!==model.sha256)throw Error('Project model revision differs');
  if(disposed||signal.aborted)throw aborted();
  // The approved GLB is self-contained. Blob image URLs are internal decoder
  // resources; a source document cannot introduce an unpinned remote request.
  manager.setURLModifier(value=>{if(!value.startsWith('blob:')&&!value.startsWith('data:'))throw Error('Embedded project model resources required');return value;});
  const parsed=await new GLTFLoader(manager).setMeshoptDecoder(MeshoptDecoder).parseAsync(bytes,'');
  if(disposed||signal.aborted){releaseObject(parsed.scene);throw aborted();}
  // These are static source studies. Retain the scene's geometry/materials,
  // while allowing the parser and its large compressed GLB body/cache to be
  // collected after acquisition. No animation or parser service is needed.
  gltf={scene:parsed.scene};
  if(model.webUnits!=='meters'||model.upAxis!=='Y')throw Error('Verified web model coordinates required');
  const primitive=model.primitive??'triangles';if(!['triangles','points'].includes(primitive))throw Error('A verified source primitive is required');
  gltf.scene.traverse(node=>{
   if(!node.isMesh&&!node.isPoints)return;
   if(primitive==='points'?!node.isPoints:!node.isMesh)throw Error('Project source primitive differs');
   meshes++;vertices+=node.geometry.getAttribute('position').count;
   if(node.isPoints)sourcePoints+=node.geometry.getAttribute('position').count;
   else triangles+=(node.geometry.index?.count??node.geometry.getAttribute('position').count)/3;
   const previous=node.onBeforeRender;node.onBeforeRender=function(...args){painted.add(node);sourceCalls++;previous.apply(this,args);};
  });
  if(meshes!==model.meshes||vertices!==model.vertices||triangles!==model.triangles||!meshes)throw Error('Project source geometry differs');
  // Stream the actual transformed source bounds once. A large authored mesh
  // must not create a second multi-million-element JavaScript number array or
  // make every drag frame scan every source vertex. The eight exact box corners
  // conservatively contain the complete source for every subsequent camera fit.
  const detailCollector=revision===DOT_SOURCE_REVISION?createDotDetailCollector():null;let sourceIndex=0;
  gltf.scene.updateWorldMatrix(true,true);const sourceBounds=new T.Box3(),vertex=new T.Vector3();
  gltf.scene.traverse(node=>{if(!node.isMesh&&!node.isPoints)return;const positions=node.geometry.getAttribute('position');for(let i=0;i<positions.count;i++){vertex.fromBufferAttribute(positions,i).applyMatrix4(node.matrixWorld);sourceBounds.expandByPoint(vertex);detailCollector?.add(vertex.x,vertex.y,vertex.z,sourceIndex++);}});
  detailSelection=detailCollector?.finish()??null;
  const extent=sourceBounds.getSize(new T.Vector3()),tolerance=Math.max(extent.length()*1e-7,1e-7);
  for(let i=0;i<3;i++)if(Math.abs(sourceBounds.min.getComponent(i)-model.bounds.min[i])>tolerance||Math.abs(sourceBounds.max.getComponent(i)-model.bounds.max[i])>tolerance)throw Error('Project source bounds differ');
  support=new Float64Array(24);let corner=0;
  for(const x of[sourceBounds.min.x,sourceBounds.max.x])for(const y of[sourceBounds.min.y,sourceBounds.max.y])for(const z of[sourceBounds.min.z,sourceBounds.max.z]){support[corner++]=x;support[corner++]=y;support[corner++]=z;}
  const span=Math.max(...model.bounds.max.map((value,i)=>value-model.bounds.min[i]));ray.params.Points.threshold=span*.015;
  renderer=createRenderer({alpha:true,antialias:true,powerPreference:'default'});renderer.setClearColor(0,0);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1;
  renderer.debug.onShaderError=()=>{shaderError=true;};renderer.domElement.dataset.projectStudyCanvas='';renderer.domElement.setAttribute('aria-hidden','true');
  Object.assign(renderer.domElement.style,{position:'absolute',inset:'0',width:'100%',height:'100%',display:'block',pointerEvents:'none'});renderer.domElement.addEventListener('webglcontextlost',lost);
  budget=createRendererBudget(renderer,()=>({deviceDpr:win.devicePixelRatio||1,pixelBudget:RESEARCH_MODEL_PIXELS}));
  scene=new T.Scene();camera=new T.PerspectiveCamera();scene.add(gltf.scene);
  appearance=installProjectStudyAppearance({scene,source:gltf.scene,renderer,bounds:model.bounds,projectId:url.pathname.split('/')[3]});
  (host.querySelector('[data-project-model-surface]')??host).appendChild(renderer.domElement);
  return{
   resize(width,height){if(disposed||!(width>0&&height>0))return;size={width,height};draw();},
   present(next){if(disposed)return;state={...state,...next};draw();},
   hitTest(x,y){if(disposed||!successfulPaint||!renderer)return false;const rect=renderer.domElement.getBoundingClientRect();if(x<rect.left||x>rect.right||y<rect.top||y>rect.bottom)return false;const local=projectStudyCanvasPoint(x,y,rect,size,handheld);if(!local)return false;point.set(local.x/size.width*2-1,-local.y/size.height*2+1);ray.setFromCamera(point,camera);return ray.intersectObject(gltf.scene,true).length>0;},
   inspect:()=>({sourceRevision:revision,primitive:model.primitive??'triangles',vertices,triangles,renderables:meshes,sourcePoints,meshes,drawnMeshes,sourceCalls,successfulPaint,firstDraw:firstDraw?{...firstDraw}:null,draws,cameraFits,renderSubmit:{lastMs:lastRenderSubmitMs,totalMs:totalRenderSubmitMs,kind:'cpu-submission-only'},compositor:{...handheld,writes:compositorWrites,kind:'2d-pan-roll'},supportPoints:(support?.length??0)/3,...(revision===DOT_SOURCE_REVISION?{detail:inspectDotDetail(detailSelection,detailWeight)}:{}),pose,view:{...state},size:{...size},appearance:appearance?.inspect()??null,pixelBudget:RESEARCH_MODEL_PIXELS,budget:budget?.inspect()??null,canvasCount:disposed?0:1,disposed}),
   dispose,
  };
 }catch(error){dispose();throw error;}
}
