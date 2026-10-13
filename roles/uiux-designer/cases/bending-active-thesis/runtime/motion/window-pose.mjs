// Pure, content-agnostic pose sampling for the two retained material recipes.
import {sampleWindowPath} from './window-path.mjs';
export const clamp=v=>Math.max(0,Math.min(1,Number(v)||0));
const bounded=(n,a,b)=>Math.max(a,Math.min(b,n));
export const WINDOW_REST_POSE=Object.freeze({x:0,y:0,z:0,rx:0,ry:0,rz:0,sx:1,sy:1,alpha:1,blur:0,radius:18,cut:1,bend:0,skew:0,halo:0,echo:0,shine:0,passage:0,aperture:0,echoX:0,echoY:0,
 tlx:0,tly:0,trx:0,try:0,brx:0,bry:0,blx:0,bly:0,etx:0,ety:0,erx:0,ery:0,ebx:0,eby:0,elx:0,ely:0});
const plain=WINDOW_REST_POSE;
export function sampleKineticPose(effect,state){
 const q=bounded(state.progress,-1.2,1.2),a=Math.abs(q),t=1-clamp(a);
 const e=clamp(state.energy),px=state.pointer?.x??0,py=state.pointer?.y??0;
 const materials=[...(state.corners??[]),...(state.edges??[])],reveal=Math.max(t,...materials.map(c=>1-clamp(Math.abs(c.response.progress))));
 const path=sampleWindowPath(effect,q),p={...plain,...path,passage:q,aperture:state.aperture??q,alpha:clamp(reveal*5),cut:reveal};
 switch(effect.key){
 case 'membrane':Object.assign(p,{x:p.x+px*20*a,rx:-py*9*a,ry:px*12*a,halo:e*.48});break;
 case 'ink':Object.assign(p,{skew:-4*q,halo:e*.3});break;
 }
 // Material lag lives along the real curved path. Undo the in-plane transform
 // so the final CSS rotation/skew does not rotate the traction a second time.
 const angle=p.rz*Math.PI/180,cos=Math.cos(angle),sin=Math.sin(angle),shear=Math.tan(p.skew*Math.PI/180);
 materials.forEach((material,index)=>{
  const at=sampleWindowPath(effect,material.response.progress),dx=at.x-path.x,dy=at.y-path.y;
  const x=cos*dx+sin*dy,y=-sin*dx+cos*dy,prefix=['tl','tr','br','bl','et','er','eb','el'][index];
  p[prefix+'x']=(x-shear*y)/p.sx;p[prefix+'y']=y/p.sy;
 });
 const vx=state.transport?.vx??0,vy=state.transport?.vy??0,trail=Math.min(.04,65/Math.max(1,Math.hypot(vx,vy)));
 p.echoX=-vx*trail;p.echoY=-vy*trail;
 p.x+=px*9*t;p.y+=py*6*t;p.rx-=py*3*t;p.ry+=px*4*t;p.rz+=px*e*1.8;p.shine=e;p.halo=Math.max(p.halo,e*.12);p.sx=Math.max(.18,p.sx);p.sy=Math.max(.18,p.sy);
 if(q===0&&(state.aperture??0)===0&&materials.every(c=>c.response.progress===0&&c.response.velocity===0)&&state.velocity===0&&e===0&&px===0&&py===0)return {...plain};return p;
}
export function blendPose(a,b,value){const t=clamp(value);return Object.fromEntries(Object.keys(plain).map(k=>[k,a[k]+(b[k]-a[k])*t]));}
