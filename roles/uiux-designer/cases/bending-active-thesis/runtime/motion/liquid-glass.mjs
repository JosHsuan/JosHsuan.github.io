/** Original, bounded optics for a rounded slab. The normal follows a circular
 * meniscus and Snell's law; only its rim bends rays. No DOM, clock or renderer. */
export const LIQUID_MAP_PIXEL_LIMIT=65536;
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
const KEYS=['x','y','hover','press'];

export function liquidGlassMode({userAgent='',supportsBackdrop=false,opaque=false}={}){
 if(opaque||!supportsBackdrop)return 'opaque';
 // This is an explicitly tested engine policy, not a claim that parsing url()
 // proves rendering support. WebKit accepts it without displacing the backdrop.
 return /(?:Chrome|Chromium|Edg|OPR)\/\d+/.test(userAgent)&&!/(?:CriOS|EdgiOS|FxiOS)\//.test(userAgent)?'refractive':'reflective';
}

export function sampleLiquidLens(x,y,width,height,radius=14){
 const halfX=width/2,halfY=height/2,r=clamp(radius,0,Math.min(halfX,halfY));
 const px=x-halfX,py=y-halfY,qx=Math.abs(px)-(halfX-r),qy=Math.abs(py)-(halfY-r);
 const ox=Math.max(qx,0),oy=Math.max(qy,0),length=Math.hypot(ox,oy);
 const distance=length+Math.min(Math.max(qx,qy),0)-r;
 const rim=Math.min(22,Math.max(6,Math.min(width,height)*.28));
 if(distance>0||-distance>=rim)return {x:0,y:0};
 let nx=0,ny=0;
 if(length>1e-6){nx=Math.sign(px)*ox/length;ny=Math.sign(py)*oy/length;}
 else if(qx>qy)nx=Math.sign(px);else ny=Math.sign(py);
 const t=clamp(-distance/rim,0,1),angle=(1-t)*1.1;
 const transmitted=Math.asin(Math.sin(angle)/1.45);
 const bend=(Math.tan(angle)-Math.tan(transmitted))/(Math.tan(1.1)-Math.tan(Math.asin(Math.sin(1.1)/1.45)));
 const thickness=.28+.72*Math.sqrt(Math.max(0,1-(1-t)**2));
 return {x:nx*bend*thickness,y:ny*bend*thickness};
}

export function createLiquidLensMap(width,height,radius=14){
 if(!Number.isFinite(width)||!Number.isFinite(height)||width<=0||height<=0)throw RangeError('Liquid lens requires positive finite dimensions');
 const scale=Math.min(1,384/Math.max(width,height),Math.sqrt(LIQUID_MAP_PIXEL_LIMIT/(width*height)));
 const w=Math.max(2,Math.floor(width*scale)),h=Math.max(2,Math.floor(height*scale));
 const data=new Uint8ClampedArray(w*h*4);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const normal=sampleLiquidLens((x+.5)*width/w,(y+.5)*height/h,width,height,radius),offset=(y*w+x)*4;
  data[offset]=Math.round(128+normal.x*127);data[offset+1]=Math.round(128+normal.y*127);data[offset+2]=128;data[offset+3]=255;
 }
 return {width:w,height:h,pixels:w*h,data};
}

export function createLiquidResponse(){return {value:{x:.5,y:.5,hover:0,press:0},velocity:{x:0,y:0,hover:0,press:0},settled:true};}

export function advanceLiquidResponse(state,dt,target={x:.5,y:.5,hover:0,press:0},{snap=false}={}){
 const elapsed=Number.isFinite(dt)?Math.max(0,dt):0;
 const immediate=snap||elapsed>1;
 const seconds=immediate?0:Math.min(elapsed,1/3),steps=Math.max(1,Math.ceil(seconds*120)),step=seconds/steps;
 let settled=true;
 for(const key of KEYS){
  const next=clamp(Number.isFinite(target[key])?target[key]:(key==='x'||key==='y' ? .5 : 0),0,1);
  if(immediate){state.value[key]=next;state.velocity[key]=0;continue;}
  for(let index=0;index<steps;index++){
   state.velocity[key]+=((next-state.value[key])*220-state.velocity[key]*26)*step;
   state.value[key]=clamp(state.value[key]+state.velocity[key]*step,0,1);
  }
  if(Math.abs(next-state.value[key])<.0008&&Math.abs(state.velocity[key])<.006){state.value[key]=next;state.velocity[key]=0;}
  else settled=false;
 }
 state.settled=settled;return !settled;
}
