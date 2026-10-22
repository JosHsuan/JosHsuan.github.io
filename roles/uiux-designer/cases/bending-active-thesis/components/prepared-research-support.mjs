import * as T from 'three';
const records=new WeakMap();
/** Acquisition-owned complete-source snapshot. Never exposes its mutable storage. */
export function prepareResearchSupport(source){
 if(!source||source.length<3||source.length%3)throw RangeError('Valid source support required');
 const points=new Float64Array(source.length),min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
 for(let i=0;i<points.length;i++){const n=source[i];if(!Number.isFinite(n))throw RangeError('Finite source coordinates required');points[i]=n;const axis=i%3;min[axis]=Math.min(min[axis],n);max[axis]=Math.max(max[axis],n);}
 const center=new T.Vector3(...min.map((n,i)=>(n+max[i])/2)),delta=new T.Vector3();let radius=0;
 for(let i=0;i<points.length;i+=3){delta.fromArray(points,i).sub(center);radius=Math.max(radius,delta.length());}
 radius=Math.max(radius,1e-6);
 const handle=Object.freeze({
  fit(aspect,options){const record=records.get(handle);if(!record)throw RangeError('Research support disposed');return fitPrepared(record,aspect,options);},
  inspect(){const record=records.get(handle);return{disposed:!record,points:record?record.points.length/3:0,bytes:record?record.points.byteLength:0,bounds:record?{min:[...record.min],max:[...record.max]}:null};},
  dispose(){records.delete(handle);},
 });
 records.set(handle,{points,center,radius,min,max});return handle;
}
function fitPrepared(record,aspect,{yaw=.72,pitch=.36,fov=36,zoom=1}={}){
 const {points,center,radius}=record;
 if(![aspect,zoom].every(n=>Number.isFinite(n)&&n>0)||![yaw,pitch,fov].every(Number.isFinite)||fov<=1||fov>=175)throw RangeError('Valid source support and camera required');
 const direction=new T.Vector3(Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),Math.cos(yaw)*Math.cos(pitch));
 const right=new T.Vector3(0,1,0).cross(direction).normalize(),up=direction.clone().cross(right).normalize();
 const tanY=Math.tan(T.MathUtils.degToRad(fov/2))*.88,tanX=tanY*aspect;
 const delta=new T.Vector3();let distance=0;
 for(let i=0;i<points.length;i+=3){
  delta.fromArray(points,i).sub(center);
  const depth=delta.dot(direction);distance=Math.max(distance,depth+Math.abs(delta.dot(right))/tanX,depth+Math.abs(delta.dot(up))/tanY);
 }
 distance=Math.max(distance,radius*1.1)*zoom;
 const position=center.clone().addScaledVector(direction,distance).toArray(),far=distance+radius*8;
 if(![...position,distance,far].every(Number.isFinite)){
  // Exceptional diagnostics only: keep ordinary framing and its hot loop
  // unchanged. A scalar recheck is evidence, never a replacement camera.
  let recheckDistance=0,firstNonFiniteProjection=null;
  for(let i=0;i<points.length;i+=3){
   const dx=points[i]-center.x,dy=points[i+1]-center.y,dz=points[i+2]-center.z;
   const depth=dx*direction.x+dy*direction.y+dz*direction.z;
   const x=depth+Math.abs(dx*right.x+dy*right.y+dz*right.z)/tanX;
   const y=depth+Math.abs(dx*up.x+dy*up.y+dz*up.z)/tanY;
   if(![depth,x,y].every(Number.isFinite)&&firstNonFiniteProjection===null)firstNonFiniteProjection={index:i/3,delta:[dx,dy,dz],depth,x,y};
   recheckDistance=Math.max(recheckDistance,x,y);
  }
  const diagnostic={aspect,yaw,pitch,fov,zoom,count:points.length/3,center:center.toArray(),direction:direction.toArray(),right:right.toArray(),up:up.toArray(),tanX,tanY,radius,distance,position,far,recheckDistance:Math.max(recheckDistance,radius*1.1)*zoom,firstNonFiniteProjection};
  throw new RangeError('Non-finite research camera fit: '+JSON.stringify(diagnostic,(_key,value)=>typeof value==='number'&&!Number.isFinite(value)?String(value):value));
 }
 return {position,target:center.toArray(),up:[0,1,0],fov,near:radius*.001,far,radius,distance};
}

