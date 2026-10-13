// One material surface follows the actual window path. Corners and edge centres
// lag under acceleration and catch up under braking; no phase-shaped necks.
const mix=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
const prefixes=['tl','tr','br','bl','et','er','eb','el'];
const unit=(a,b)=>{const d=Math.max(.00001,distance(a,b));return [(b[0]-a[0])/d,(b[1]-a[1])/d];};

export function sampleWindowBoundary(effect,pose,width,height){
 const offsets=prefixes.map(key=>[pose[key+'x']??0,pose[key+'y']??0]);
 // One common gain keeps relative material motion intact. Independent clipping
 // of each point would erase direction and create straight safety-limit cuts.
 const max=Math.max(...offsets.map(p=>Math.hypot(...p))),limit=Math.min(width,height)*(effect.outlineLimit??.06);
 const gain=max>0?Math.min(1,limit/max):1;
 // Reveal follows passage history toward the current intent. Body overshoot
 // cannot reopen the opposite closing edge after the reading surface is open.
 const q=Math.max(-1,Math.min(1,pose.aperture??0));
 const left=effect.key==='ink'?Math.max(0,q)*width:0,right=effect.key==='ink'?(1-Math.max(0,-q))*width:width;
 const corners=[[left,0],[right,0],[right,height],[left,height]];
 const centres=corners.map((p,i)=>mix(p,corners[(i+1)%4],.5));
 const points=[...corners,...centres].map((point,i)=>[point[0]+offsets[i][0]*gain,point[1]+offsets[i][1]*gain]);
 return {corners:points.slice(0,4),centres:points.slice(4),gain,resting:max<.001&&(effect.key!=='ink'||Math.abs(q)<.00001)};
}

export function sampleWindowOutline(effect,pose,width,height){
 const cornerRadius=Number.isFinite(pose.radius)?Math.max(0,pose.radius):18;
 const rest=`inset(0 round ${cornerRadius}px)`;
 if(!(width>0&&height>0))return rest;
 const boundary=sampleWindowBoundary(effect,pose,width,height);
 if(boundary.resting)return rest;
 const {corners:points,centres}=boundary,incoming=[],outgoing=[],radii=[];
 points.forEach((point,index)=>{
  const previous=points[(index+3)%4],next=points[(index+1)%4];
  const radius=Math.min(cornerRadius,distance(point,previous)*.25,distance(point,next)*.25);radii.push(radius);
  incoming.push(mix(point,previous,radius/Math.max(.001,distance(point,previous))));
  outgoing.push(mix(point,next,radius/Math.max(.001,distance(point,next))));
 });
 const edges=points.map((point,index)=>{
  const next=(index+1)%4,start=outgoing[index],end=incoming[next],middle=mix(point,points[next],.5);
  const tangent=unit(point,points[next]),normal=[-tangent[1],tangent[0]];
  // Only the normal component bends an edge. Tangential follower motion slides
  // along it, so a vertical pull cannot independently pinch both side edges.
  const bow=(centres[index][0]-middle[0])*normal[0]+(centres[index][1]-middle[1])*normal[1];
  const handle=t=>{const p=mix(start,end,t);return [p[0]+normal[0]*bow*4/3,p[1]+normal[1]*bow*4/3];};
  return {start,end,c1:handle(1/3),c2:handle(2/3)};
 });
 const format=p=>p.map(v=>Number(v.toFixed(3))).join(' ');
 let path=`M ${format(outgoing[0])}`;
 edges.forEach((edge,index)=>{
  const next=(index+1)%4,following=edges[next],a=unit(edge.c2,edge.end),b=unit(following.start,following.c1),radius=radii[next]*.55228475;
  const c1=[edge.end[0]+a[0]*radius,edge.end[1]+a[1]*radius];
  const c2=[following.start[0]-b[0]*radius,following.start[1]-b[1]*radius];
  path+=` C ${format(edge.c1)},${format(edge.c2)},${format(edge.end)} C ${format(c1)},${format(c2)},${format(following.start)}`;
 });
 return `path('${path} Z')`;
}
