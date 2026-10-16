import {SOURCE_LAYER_REVISION} from './element-score.mjs';
import {sampleChapterScene,applyChapterLighting} from './chapter-scene-score.mjs';
import {sampleContinuousLighting} from './inspection-lighting.mjs';
import {resolveSceneStage} from './scene-direction.mjs';
import {sampleCinematicPose} from './vendor/cinematic-plan.mjs';

export const PROJECT_MODEL_PIXEL_BUDGET=262144;
export const PROJECT_MODEL_REVISION=SOURCE_LAYER_REVISION;
export const PROJECT_MODEL_FRAME_FILL=.9;
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const unit=a=>{const length=Math.hypot(...a);if(length<1e-10)throw RangeError('Invalid preview camera basis');return a.map(value=>value/length);};
export function validateProjectModelMetadata(meta){
 if(meta?.revision!==SOURCE_LAYER_REVISION||meta.viewerUnits!=='meters'||meta.upAxis!=='Y'||meta.vertices!==172789||meta.triangles!==227521||meta.layers?.length!==3)throw Error('Unexpected project model metadata');
 for(const id of ['shell','base-lower','base-upper'])if(meta.layers.filter(layer=>layer.id===id).length!==1)throw Error('Unexpected project model layer');
 if(!['min','max'].every(key=>meta.bounds?.[key]?.length===3&&meta.bounds[key].every(Number.isFinite))||meta.bounds.min.some((value,i)=>value>=meta.bounds.max[i]))throw Error('Unexpected project model bounds');
 return meta;
}
/** Snapshot every real source vertex in world coordinates once after loading.
 * Geometry and native node transforms remain untouched. Reuse on resize. */
export function collectProjectModelSupport(root){
 root.updateMatrixWorld(true);const meshes=[];let vertices=0;
 root.traverse(node=>{
  if(!node.isMesh)return;
  const position=node.geometry?.attributes.position;
  if(!position||node.isSkinnedMesh||node.isInstancedMesh||node.geometry.morphAttributes.position?.length)throw Error('Preview requires static source vertices');
  meshes.push(node);vertices+=position.count;
 });
 if(!vertices)throw Error('Missing preview source vertices');
 const points=new Float64Array(vertices*3);let offset=0;
 for(const node of meshes){
  const position=node.geometry.attributes.position,m=node.matrixWorld.elements;
  for(let i=0;i<position.count;i++){
   const x=position.getX(i),y=position.getY(i),z=position.getZ(i);
   points[offset++]=m[0]*x+m[4]*y+m[8]*z+m[12];
   points[offset++]=m[1]*x+m[5]*y+m[9]*z+m[13];
   points[offset++]=m[2]*x+m[6]*y+m[10]*z+m[14];
  }
 }
 return points;
}

/** Exact perspective support-plane fit. Each vertex constrains the camera
 * distance and lateral position; empty AABB corners cannot enlarge the crop. */
function fitSourceVertices(points,bounds,{direction,up,aspect,fov}){
 const back=unit(direction),right=unit(cross(up,back)),cameraUp=unit(cross(back,right));
 const center=bounds.min.map((value,i)=>(value+bounds.max[i])/2),radius=Math.hypot(...bounds.max.map((value,i)=>value-bounds.min[i]))/2;
 const tanV=Math.tan(fov*Math.PI/360),tangents=[tanV*aspect,tanV],limits=tangents.map(value=>value*PROJECT_MODEL_FRAME_FILL);
 const lower=[-Infinity,-Infinity],upper=[Infinity,Infinity],local=new Float64Array(points.length);let minZ=Infinity,maxZ=-Infinity;
 for(let i=0;i<points.length;i+=3){
  const relative=[points[i]-center[0],points[i+1]-center[1],points[i+2]-center[2]];
  if(!relative.every(Number.isFinite))throw Error('Non-finite preview vertex');
  const x=dot(relative,right),y=dot(relative,cameraUp),z=dot(relative,back);local[i]=x;local[i+1]=y;local[i+2]=z;
  minZ=Math.min(minZ,z);maxZ=Math.max(maxZ,z);
  for(let axis=0;axis<2;axis++){
   lower[axis]=Math.max(lower[axis],local[i+axis]+limits[axis]*z);
   upper[axis]=Math.min(upper[axis],local[i+axis]-limits[axis]*z);
  }
 }
 const distance=Math.max(maxZ+radius*.05,...limits.map((limit,axis)=>(lower[axis]-upper[axis])/(2*limit)));
 const lateral=limits.map((limit,axis)=>{
  let low=lower[axis]-limit*distance,high=upper[axis]+limit*distance;
  // The limiting axis already touches both inset edges. For the other axis,
  // center the true perspective silhouette with bounded, event-only work.
  for(let step=0;step<24&&high-low>radius*1e-9;step++){
   const center=(low+high)/2;let min=Infinity,max=-Infinity;
   for(let i=0;i<local.length;i+=3){const projected=(local[i+axis]-center)/(distance-local[i+2]);min=Math.min(min,projected);max=Math.max(max,projected);}
   if(min+max>0)low=center;else high=center;
  }
  return(low+high)/2;
 });
 const target=center.map((value,i)=>value+right[i]*lateral[0]+cameraUp[i]*lateral[1]);
 return{position:target.map((value,i)=>value+back[i]*distance),target,up:cameraUp,fov,aspect,distance,near:Math.max(radius*.0001,(distance-maxZ)*.1),far:distance-minZ+radius,framing:'source-vertices',supportVertices:points.length/3,fill:PROJECT_MODEL_FRAME_FILL};
}
/** Frozen overview art direction. Refit the original orientation to the card;
 * no editorial text offset, source scaling, playback or time advancement. */
export function sampleProjectModelRecipe(meta,width,height,supportPoints){
 validateProjectModelMetadata(meta);if(![width,height].every(value=>Number.isFinite(value)&&value>0))throw RangeError('Positive preview size required');
 if(supportPoints?.length!==meta.vertices*3)throw Error('All preview source vertices are required');
 const aspect=width/height,stageU=.5/7;
 const chapterScene=sampleChapterScene({chapterWeights:[1,0,0,0,0,0,0],phases:[0,0,0,0,0,0,0],activeSeconds:0},{aspect});
 const direction=applyChapterLighting(sampleContinuousLighting(stageU),chapterScene);
 const sourcePose=sampleCinematicPose(stageU,aspect,{x:0,y:0},{bounds:meta.bounds,modelRevision:meta.revision,sharedStage:true});
 const pose=fitSourceVertices(supportPoints,meta.bounds,{direction:sourcePose.position.map((value,i)=>value-sourcePose.target[i]),up:sourcePose.up,aspect,fov:sourcePose.fov});
 return{pose,direction,chapterScene,stage:resolveSceneStage(meta.bounds,direction),material:{progress:0,emphasis:sourcePose.surfaceEmphasis,finish:'satin'},baseMultiplier:.6+direction.stage.baseEmphasis*.4,sourceRevision:meta.revision,pixelBudget:PROJECT_MODEL_PIXEL_BUDGET};
}
