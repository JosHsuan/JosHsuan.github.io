import * as T from 'three';

export const RESEARCH_MODEL_PIXELS=524288;
export const RESEARCH_PHONE_PIXELS=393216;

/** A display camera fit. Any verified source-unit/axis conversion belongs to
 * the pinned derivative; camera fitting never rescales or reorients geometry. */
export function fitResearchCamera(points,aspect,{yaw=.72,pitch=.36,fov=36,zoom=1}={}){
 if(!points||points.length<3||points.length%3||![aspect,zoom].every(n=>Number.isFinite(n)&&n>0)||![yaw,pitch,fov].every(Number.isFinite)||fov<=1||fov>=175)throw RangeError('Valid source support and camera required');
 const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
 for(let i=0;i<points.length;i++){const n=points[i];if(!Number.isFinite(n))throw RangeError('Finite source coordinates required');const axis=i%3;min[axis]=Math.min(min[axis],n);max[axis]=Math.max(max[axis],n);}
 const center=new T.Vector3(...min.map((n,i)=>(n+max[i])/2));
 const direction=new T.Vector3(Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),Math.cos(yaw)*Math.cos(pitch));
 const right=new T.Vector3(0,1,0).cross(direction).normalize(),up=direction.clone().cross(right).normalize();
 const tanY=Math.tan(T.MathUtils.degToRad(fov/2))*.88,tanX=tanY*aspect;
 const delta=new T.Vector3();let distance=0,radius=0;
 for(let i=0;i<points.length;i+=3){
  delta.fromArray(points,i).sub(center);radius=Math.max(radius,delta.length());
  const depth=delta.dot(direction);distance=Math.max(distance,depth+Math.abs(delta.dot(right))/tanX,depth+Math.abs(delta.dot(up))/tanY);
 }
 radius=Math.max(radius,1e-6);distance=Math.max(distance,radius*1.1)*zoom;
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

export function fitResearchPhoneCamera(points,aspect,{front=false}={}){
 const pose=fitResearchCamera(points,aspect,{yaw:front?0:.12,pitch:front?0:-.025,fov:32,zoom:.95});
 // The casing and screen are close surfaces. A tight, phone-only depth range
 // prevents the casing from z-fighting over the source interface controls.
 return {...pose,near:pose.radius*.08,far:pose.distance+pose.radius*2.5};
}

function roundedShape(width,height,radius){
 const r=Math.min(radius,width/2,height/2),x=-width/2,y=-height/2,s=new T.Shape();
 s.moveTo(x+r,y);s.lineTo(x+width-r,y);s.quadraticCurveTo(x+width,y,x+width,y+r);
 s.lineTo(x+width,y+height-r);s.quadraticCurveTo(x+width,y+height,x+width-r,y+height);
 s.lineTo(x+r,y+height);s.quadraticCurveTo(x,y+height,x,y+height-r);
 s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s;
}

/** An original, restrained iPhone presentation shell. The screen's exact media
 * aspect is retained; no notch, mask or hardware ornament covers the recording.
 * This display device is not a scan or a research-project source model. */
export function createResearchPhoneGeometry(aspect){
 if(!Number.isFinite(aspect)||aspect<.35||aspect>.8)throw RangeError('Portrait recording aspect required');
 const height=2,width=height*aspect,bodyWidth=width+.092,bodyHeight=height+.164,depth=.072;
 const body=new T.ExtrudeGeometry(roundedShape(bodyWidth,bodyHeight,.105),{depth,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.009,bevelThickness:.009,curveSegments:12});
 body.translate(0,0,-depth/2);
 const screen=new T.ShapeGeometry(roundedShape(width,height,.037),16);
 const positions=screen.getAttribute('position'),uv=screen.getAttribute('uv');
 for(let i=0;i<positions.count;i++)uv.setXY(i,positions.getX(i)/width+.5,positions.getY(i)/height+.5);
 uv.needsUpdate=true;screen.translate(0,0,depth/2+.01);
 const support=new Float32Array([
  -bodyWidth/2,-bodyHeight/2,-depth/2-.009,bodyWidth/2,-bodyHeight/2,-depth/2-.009,
  -bodyWidth/2,bodyHeight/2,-depth/2-.009,bodyWidth/2,bodyHeight/2,-depth/2-.009,
  -bodyWidth/2,-bodyHeight/2,depth/2+.01,bodyWidth/2,-bodyHeight/2,depth/2+.01,
  -bodyWidth/2,bodyHeight/2,depth/2+.01,bodyWidth/2,bodyHeight/2,depth/2+.01,
 ]);
 return {body,screen,support,dimensions:{width,height,bodyWidth,bodyHeight,depth,aspect},dispose(){body.dispose();screen.dispose();}};
}

export function collectResearchSupport(object){
 object.updateWorldMatrix(true,true);const support=[],point=new T.Vector3();
 object.traverse(node=>{if(!node.isMesh)return;const position=node.geometry.getAttribute('position');for(let i=0;i<position.count;i++){point.fromBufferAttribute(position,i).applyMatrix4(node.matrixWorld);support.push(point.x,point.y,point.z);}});
 if(!support.length)throw Error('Research geometry has no source support');
 return new Float64Array(support);
}
