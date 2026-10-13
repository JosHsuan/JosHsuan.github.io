import {sampleKineticPose,clamp} from './window-pose.mjs';
import {sampleWindowPath} from './window-path.mjs';

export const scrollTarget=progress=>2*clamp(progress)-1;
export function scrollingEffect(effect,height){
 // The native page travels vertically. Curved lateral feedback stays modest;
 // body and material followers share this same transport geometry.
 return {...effect,axis:[effect.axis[0]*.35,-height+effect.axis[1]*.25,effect.axis[2]*.3]};
}
export function scrollGeometry(progress,height,windowHeight){
 const top=height+(height-windowHeight)/2-2*height*clamp(progress),bottom=top+windowHeight;
 return {top,bottom,region:top>=height?'before':bottom<=0?'after':'inside',entry:(height-windowHeight)/(4*height),exit:1-(height-windowHeight)/(4*height)};
}
export function sampleScrollingPose(effect,state){
 const p=sampleKineticPose(effect,state),base=sampleKineticPose(effect,{...state,progress:state.target,velocity:0,energy:0,pointer:{x:0,y:0},corners:[],edges:[],aperture:state.target});
 // Native flow owns page position. Only residual lag is applied to the window.
 for(const key of ['x','y','z','rx','ry','rz','skew'])p[key]-=base[key];
 p.x*=.5;p.y*=.28;p.z*=.35;
 p.sx/=base.sx;p.sy/=base.sy;
 p.blur=0;
 // Whole-window visibility is solely viewport clipping. No opacity/reveal exit.
 p.alpha=1;p.cut=1;p.aperture=0;p.passage=0;p.radius=18;
 const q=sampleWindowPath(effect,state.progress),angle=p.rz*Math.PI/180,c=Math.cos(angle),s=Math.sin(angle),shear=Math.tan(p.skew*Math.PI/180);
 [...state.corners,...state.edges].forEach((point,i)=>{
  const at=sampleWindowPath(effect,point.response.progress),dx=at.x-q.x,dy=at.y-q.y,x=c*dx+s*dy,y=-s*dx+c*dy,key=['tl','tr','br','bl','et','er','eb','el'][i];
  p[key+'x']=(x-shear*y)/p.sx;p[key+'y']=y/p.sy;
 });
 return p;
}
