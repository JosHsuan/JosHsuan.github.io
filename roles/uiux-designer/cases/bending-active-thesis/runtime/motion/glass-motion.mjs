import {WINDOW_REST_POSE} from './window-pose.mjs';

const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const smooth=v=>{const t=clamp(v);return t*t*t*(10+t*(-15+6*t));};
export const GLASS_MOTION=Object.freeze({version:1,readingHalf:.54,edgeEnd:1.18,streamPeriod:24,carouselStep:.43,feedMapSize:96});

/** An original viewport-space field. The clear centre is intentionally broad:
 * text is native and readable; distortion belongs to the aperture shoulders.
 * Seconds come from an existing owner, never a new clock or animation loop. */
export function sampleGlassFeed(state,width,height,radius,{horizontal=0,vertical=0,viewportHeight=height*2,stream=false,lane=0,seconds=0,focused=false}={}){
 const pose={...WINDOW_REST_POSE,radius};
 if(focused)return{pose,edgeMaximum:0,perspective:1400,flow:0,edge:0,warp:0,streamOffset:0};
 const streamOffset=stream?Math.sin(seconds*Math.PI*2/GLASS_MOTION.streamPeriod)*(lane%2?-1:1)*Math.min(64,height*.12):0;
 const x=clamp(horizontal,-1,1),y=clamp(vertical+streamOffset*2/Math.max(1,viewportHeight),-1.5,1.5),speed=clamp(state.strength??0,-1,1),surge=clamp(state.surge??0,-1,1);
 const edge=smooth((Math.abs(y)-GLASS_MOTION.readingHalf)/(GLASS_MOTION.edgeEnd-GLASS_MOTION.readingHalf));
 const flow=clamp(speed+surge*.22,-1,1),direction=Math.sign(y);
 pose.x=-x*edge*7;
 pose.y=direction*edge*Math.min(26,height*.06)-flow*5+streamOffset;
 pose.rx=-direction*edge*19-flow*3.2;
 pose.ry=-x*edge*7;
 pose.rz=-x*edge*.65;pose.skew=x*surge*1.3;
 pose.sx=1+edge*.038+Math.abs(surge)*.009;
 pose.sy=1-edge*.065+Math.abs(surge)*.018;
 const bend=Math.min(20,Math.min(width,height)*.06)*(edge*.8+Math.abs(flow)*.2);
 pose.ety=-bend;pose.eby=bend;pose.elx=-bend*.22;pose.erx=bend*.22;
 pose.tlx=-bend*.16;pose.trx=bend*.16;pose.blx=-bend*.16;pose.brx=bend*.16;
 return{pose,edgeMaximum:bend,perspective:Math.max(1000,height*3,width*3),flow,edge,warp:edge*.6+Math.abs(flow)*.4,streamOffset};
}

/** Compact inward-facing cylinder; native selection stays separate from pose. */
export function sampleGlassCarousel(distance,{width=400,strength=0,surge=0}={}){
 const d=clamp(distance,-3.5,3.5),angle=d*GLASS_MOTION.carouselStep,edge=smooth((Math.abs(d)-.3)/2.2);
 const flow=clamp(strength+surge*.22,-1,1);
 return{x:Math.sin(angle)*width*.83,y:(1-Math.cos(angle))*width*.055,z:-(1-Math.cos(angle))*width*.64,
  yaw:-angle*180/Math.PI*.8,pitch:-flow*2.2,roll:0,scale:1-edge*.065,
  sx:1+edge*.045,sy:1+Math.abs(surge)*.016,edge,flow,
  opacity:clamp(1-(Math.abs(distance)-1.65)/1.35),warp:edge*(.65+Math.abs(flow)*.35)};
}

/** Source handoff: a clear focal plane opens out of a glass shoulder. Does not
 * write a camera, change source fitting or choose/read native media time. */
export function sampleGlassPassage(opacity=1,direction=1){
 const open=smooth(clamp(opacity)),edge=1-open,sign=clamp(direction,-1,1);
 return{scale:1-edge*.075,rotateX:sign*edge*6,rotateY:-sign*edge*3.5};
}

export function glassPassageTransform(x,y,opacity){
 const base=`translate3d(${x}px,${y}px,0)`;
 if(opacity>=1)return base;
 // Rotation follows the currently painted position. A reversed request must
 // not flip a sign while an outgoing source is still halfway through glass.
 const pose=sampleGlassPassage(opacity,clamp(x/240+y/90,-1,1));
 return `${base} perspective(1800px) rotateX(${pose.rotateX.toFixed(4)}deg) rotateY(${pose.rotateY.toFixed(4)}deg) scale(${pose.scale.toFixed(5)})`;
}

/** Two channels encode a deterministic lens, not random turbulence. One 96²
 * map is generated per presenter/axis and reused at all viewport sizes. */
export function createGlassEdgeMap(axis='vertical',size=GLASS_MOTION.feedMapSize){
 if(!['vertical','horizontal'].includes(axis)||!Number.isInteger(size)||size<8||size>256)throw RangeError('A bounded glass map and known axis are required');
 const data=new Uint8ClampedArray(size*size*4);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const u=x/(size-1)*2-1,v=y/(size-1)*2-1,a=axis==='vertical'?v:u,b=axis==='vertical'?u:v;
  const edge=smooth((Math.abs(a)-.5)/.5),long=-Math.sign(a)*edge*.88,cross=-b*edge*.72;
  const dx=axis==='vertical'?cross:long,dy=axis==='vertical'?long:cross,i=(y*size+x)*4;
  data[i]=Math.round(127.5+127.5*dx);data[i+1]=Math.round(127.5+127.5*dy);data[i+2]=128;data[i+3]=255;
 }
 return{width:size,height:size,data,pixels:size*size};
}
