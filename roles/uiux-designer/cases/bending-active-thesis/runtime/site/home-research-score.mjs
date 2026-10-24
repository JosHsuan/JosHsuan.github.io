import {Vector3} from 'three';
import {ConvexHull} from 'three/addons/math/ConvexHull.js';
import {sampleProjectModelRecipe} from '../../components/project-model-recipe.mjs';

export const HOME_RESEARCH_PIXEL_BUDGET=786432;
export const HOME_RESEARCH_TOUCH_PIXEL_BUDGET=393216;
const dot=(a,b)=>a.reduce((sum,value,i)=>sum+value*b[i],0);
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const unit=a=>{const length=Math.hypot(...a);if(!Number.isFinite(length)||length<1e-10)throw RangeError('Invalid hero basis');return a.map(value=>value/length);};
const smooth=x=>x*x*(3-2*x);
const hulls=new WeakMap();
/** Convex support is used only for camera fitting, never as rendered geometry.
 * Original points remain untouched; each extreme is an actual source vertex. */
function sourceHull(points){
 let hull=hulls.get(points);if(hull)return hull;
 const vertices=[];for(let i=0;i<points.length;i+=3)vertices.push(new Vector3(points[i],points[i+1],points[i+2]));
 const convex=new ConvexHull().setFromPoints(vertices),unique=new Set();
 for(const face of convex.faces){let edge=face.edge;do{unique.add(edge.vertex.point);edge=edge.next;}while(edge!==face.edge);}
 hull=[...unique].map(point=>point.toArray());
 if(hull.length<4)throw Error('Missing source convex support');
 hulls.set(points,hull);return hull;
}

/** One exact source fit on resize establishes the existing material/light recipe.
 * Scroll sampling subsequently fits cached original convex support vertices:
 * no repeated full-source scan, geometry edits, or independent time source. */
export function prepareHomeResearchScore(meta,width,height,supportPoints){
 const recipe=sampleProjectModelRecipe(meta,width,height,supportPoints);
 const center=meta.bounds.min.map((value,i)=>(value+meta.bounds.max[i])/2);
 const support=sourceHull(supportPoints).map(point=>point.map((value,i)=>value-center[i]));
 const back=unit(recipe.pose.position.map((value,i)=>value-recipe.pose.target[i]));
 return{recipe,center,support,azimuth:Math.atan2(back[0],back[2]),elevation:Math.asin(back[1]),radius:Math.hypot(...meta.bounds.max.map((value,i)=>value-meta.bounds.min[i]))/2,width,height};
}

/** Reversible authored overall → opening/surface detail → project composition.
 * The middle view is explicitly a closer detail, not a full-source claim. */
export function sampleHomeResearchScore(prepared,progress){
 if(!Number.isFinite(progress))throw RangeError('Finite hero progress required');
 const p=Math.max(0,Math.min(1,progress));
 const arc=p<=.55?smooth(p/.55):1-smooth((p-.55)/.45);
 const azimuth=prepared.azimuth+arc*Math.PI*24/180,elevation=prepared.elevation+arc*Math.PI*5/180;
 const back=[Math.sin(azimuth)*Math.cos(elevation),Math.sin(elevation),Math.cos(azimuth)*Math.cos(elevation)];
 const right=unit(cross([0,1,0],back)),up=unit(cross(back,right));
 const fov=prepared.recipe.pose.fov,tanV=Math.tan(fov*Math.PI/360),tanH=tanV*prepared.width/prepared.height;
 // Full views retain a source-silhouette inset. A bounded middle approach
 // gives depth without inventing exploded parts or physical deformation.
 const fill=.9+arc*.04,limits=[tanH*fill,tanV*fill];
 const lower=[-Infinity,-Infinity],upper=[Infinity,Infinity],local=[];
 let minZ=Infinity,maxZ=-Infinity;
 for(const support of prepared.support){
  const point=[dot(support,right),dot(support,up),dot(support,back)];local.push(point);
  minZ=Math.min(minZ,point[2]);maxZ=Math.max(maxZ,point[2]);
  for(let axis=0;axis<2;axis++){
   lower[axis]=Math.max(lower[axis],point[axis]+limits[axis]*point[2]);
   upper[axis]=Math.min(upper[axis],point[axis]-limits[axis]*point[2]);
  }
 }
 const distance=Math.max(maxZ+prepared.radius*.1,...limits.map((limit,axis)=>(lower[axis]-upper[axis])/(2*limit)));
 const lateral=limits.map((limit,axis)=>{
  let low=lower[axis]-limit*distance,high=upper[axis]+limit*distance;
  for(let step=0;step<24&&high-low>prepared.radius*1e-9;step++){
   const center=(low+high)/2;let min=Infinity,max=-Infinity;
   for(const point of local){const projected=(point[axis]-center)/(distance-point[2]);min=Math.min(min,projected);max=Math.max(max,projected);}
   if(min+max>0)low=center;else high=center;
  }
  return(low+high)/2;
 });
 const target=prepared.center.map((value,i)=>value+right[i]*lateral[0]+up[i]*lateral[1]);
 const pose={position:target.map((value,i)=>value+back[i]*distance),target,up,fov,aspect:prepared.width/prepared.height,distance,near:Math.max(prepared.radius*.0001,(distance-maxZ)*.1),far:distance-minZ+prepared.radius,framing:arc>.01?'authored-detail':'source-convex-support',supportVertices:prepared.recipe.pose.supportVertices,fitSupportVertices:prepared.support.length,fill};
 return{...prepared.recipe,pose,progress:p,beat:p<.28?'overall':p<.78?'surface-detail':'project-entry',sourceGeometryUnmodified:true};
}
