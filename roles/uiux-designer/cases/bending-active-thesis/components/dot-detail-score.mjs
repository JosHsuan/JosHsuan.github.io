import {fitResearchCamera} from './research-scene-geometry.mjs';
export const DOT_SOURCE_REVISION='60d49fe978cf0fb552c39f7188a9811dc39aa2e163b3a3388b192dbae502e891';
export const DOT_DETAIL_SELECTION=Object.freeze({minX:.49,minY:.155,maxZ:-.05,count:78,sourceCount:14810,indexMin:13412,indexMax:14809,indexSHA256:'49f9a4acfb1f61452dc60d37d5d7077f69abdda3e41c214726309d0d96233a51'});
const smooth=t=>t*t*t*(t*(t*6-15)+10);
export function sampleDotDetail(progress,{enabled=true}={}){
 if(!Number.isFinite(progress))throw RangeError('Finite Dot detail progress required');
 const p=Math.max(0,Math.min(1,progress));
 if(!enabled)return{weight:0,beat:'full',cameraProgress:p};
 if(p<=.2)return{weight:0,beat:'full',cameraProgress:0};
 if(p>=.85)return{weight:0,beat:'full',cameraProgress:1};
 if(p<.45){const weight=smooth((p-.2)/.25);return{weight,beat:'approach',cameraProgress:weight*.5};}
 if(p<=.62)return{weight:1,beat:'detail',cameraProgress:.5};
 const returned=smooth((p-.62)/.23);return{weight:1-returned,beat:'return',cameraProgress:.5+returned*.5};
}
/** Editorial coordinate window, not a fabrication step or semantic source group. */
export function createDotDetailCollector(){
 const points=[],indices=[];let count=0;
 return{add(x,y,z,index){if(![x,y,z,index].every(Number.isFinite)||index!==count)throw Error('Ordered finite Dot source snapshot required');count++;if(x>=.49&&y>=.155&&z<=-.05){points.push(x,y,z);indices.push(index);}},finish(){
  if(count!==14810||indices.length!==78||indices[0]!==13412||indices.at(-1)!==14809)throw Error('Pinned Dot detail source selection differs');
  const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];for(let i=0;i<points.length;i++){const a=i%3;min[a]=Math.min(min[a],points[i]);max[a]=Math.max(max[a],points[i]);}
  return{points:new Float64Array(points),indices:new Uint32Array(indices),bounds:{min,max},target:min.map((v,i)=>(v+max[i])/2)};
 }};
}
export function fitDotDetailCamera(fullSupport,selection,aspect,intent,weight){
 if(!Number.isFinite(weight)||weight<0||weight>1)throw RangeError('Bounded Dot detail weight required');
 const full=fitResearchCamera(fullSupport,aspect,intent);
 if(weight===0)return full;
 if(selection?.points?.length!==234)throw Error('Pinned Dot detail support required');
 const detail=fitResearchCamera(selection.points,aspect,intent),direction=detail.position.map((v,i)=>(v-detail.target[i])/detail.distance);
 // All original source bounds remain between near/far, even in the declared
 // screen-space crop. No points or primitives are filtered out of the draw.
 let maxDepth=-Infinity;
 for(let i=0;i<fullSupport.length;i+=3){let z=0;for(let a=0;a<3;a++)z+=(fullSupport[i+a]-detail.target[a])*direction[a];maxDepth=Math.max(maxDepth,z);}
 const detailDistance=Math.max(detail.distance,maxDepth+full.radius*.02),distance=full.distance+(detailDistance-full.distance)*weight;
 const target=full.target.map((v,i)=>v+(detail.target[i]-v)*weight),position=target.map((v,i)=>v+direction[i]*distance);
 return{...full,position,target,distance};
}
export function inspectDotDetail(selection,weight=0){
 return{selectionKind:'editorial-source-coordinate-window',declaredCrop:weight>0,weight,sourceCount:14810,selectedCount:selection?.indices.length??0,selector:{xMin:.49,yMin:.155,zMax:-.05},indexMin:selection?.indices[0]??null,indexMax:selection?.indices.at(-1)??null,bounds:selection?.bounds??null,target:selection?.target??null,allSourcePrimitivesRetained:true,pointSizeChanged:false};
}
