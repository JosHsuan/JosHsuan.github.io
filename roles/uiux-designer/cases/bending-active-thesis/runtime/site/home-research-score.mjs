import {sampleProjectModelRecipe} from '../../components/project-model-recipe.mjs';

export const HOME_RESEARCH_PIXEL_BUDGET=786432;
export const HOME_RESEARCH_TOUCH_PIXEL_BUDGET=393216;
const dot=(a,b)=>a.reduce((sum,value,i)=>sum+value*b[i],0);
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const unit=a=>{const length=Math.hypot(...a);if(!Number.isFinite(length)||length<1e-10)throw RangeError('Invalid hero basis');return a.map(value=>value/length);};
const smooth=x=>x*x*(3-2*x);

/** One exact source fit on resize establishes the existing material/light recipe.
 * Scroll sampling subsequently uses eight conservative, source-derived corners:
 * no repeated full-vertex fitting, geometry edits, or independent time source. */
export function prepareHomeResearchScore(meta,width,height,supportPoints){
 const recipe=sampleProjectModelRecipe(meta,width,height,supportPoints);
 const center=meta.bounds.min.map((value,i)=>(value+meta.bounds.max[i])/2);
 const corners=[];for(const x of [0,1])for(const y of [0,1])for(const z of [0,1])corners.push([x,y,z].map((side,i)=>meta.bounds[side?'max':'min'][i]-center[i]));
 const back=unit(recipe.pose.position.map((value,i)=>value-recipe.pose.target[i]));
 return{recipe,center,corners,azimuth:Math.atan2(back[0],back[2]),elevation:Math.asin(back[1]),radius:Math.hypot(...meta.bounds.max.map((value,i)=>value-meta.bounds.min[i]))/2,width,height};
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
 // Full views retain a generous source-bounds inset. A bounded middle approach
 // gives depth without inventing exploded parts or physical deformation.
 const fill=.88+arc*.12;
 let distance=0,minZ=Infinity,maxZ=-Infinity;
 for(const corner of prepared.corners){const z=dot(corner,back);minZ=Math.min(minZ,z);maxZ=Math.max(maxZ,z);distance=Math.max(distance,z+Math.abs(dot(corner,right))/(tanH*fill),z+Math.abs(dot(corner,up))/(tanV*fill));}
 distance=Math.max(distance,maxZ+prepared.radius*.1);
 const target=[...prepared.center];
 const pose={position:target.map((value,i)=>value+back[i]*distance),target,up,fov,aspect:prepared.width/prepared.height,distance,near:Math.max(prepared.radius*.0001,(distance-maxZ)*.1),far:distance-minZ+prepared.radius,framing:arc>.01?'authored-detail':'source-bounds',supportVertices:prepared.recipe.pose.supportVertices,fill};
 return{...prepared.recipe,pose,progress:p,beat:p<.28?'overall':p<.78?'surface-detail':'project-entry',sourceGeometryUnmodified:true};
}
