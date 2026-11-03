import {WINDOW_REST_POSE} from './window-pose.mjs';

// Original pilot parameters, informed by scroll-responsive material references,
// not reverse-engineered Lusion timings. Input is real native displacement, not
// wheel events. The existing Director supplies all active elapsed time.
export const VELOCITY_SKIN_PROFILE=Object.freeze({
 key:'velocity-skin',deadZone:.035,saturationSpeed:1.65,attack:.075,release:.23,restThreshold:.0005,
});
export function createVelocitySkin(docY=0){return {lastY:docY,strength:0,speed:0,acceleration:0,surge:0,resting:true};}
export function advanceVelocitySkin(state,{docY,dt,viewportHeight,immediate=false}){
 if(immediate){state.lastY=docY;state.strength=0;state.speed=0;state.acceleration=0;state.surge=0;state.resting=true;return state;}
 if(!(dt>0))return state;
 const displacement=docY-state.lastY;state.lastY=docY;
 const profile=VELOCITY_SKIN_PROFILE;
 const previousSpeed=state.speed;
 const rawSpeed=displacement/(Math.max(1,viewportHeight)*dt);
 // Filter the shared native input before deriving acceleration. A wheel event
 // is not a velocity: keyboard, touch, scrollbar and inertial scroll all count.
 state.speed+=(rawSpeed-state.speed)*(-Math.expm1(-dt/.045));
 state.acceleration=Math.tanh((state.speed-previousSpeed)/(Math.max(dt,.008)*14));
 state.surge+=(state.acceleration-state.surge)*(-Math.expm1(-dt/.14));
 const magnitude=Math.max(0,Math.abs(state.speed)-profile.deadZone);
 const target=Math.sign(state.speed)*Math.tanh(magnitude/profile.saturationSpeed);
 const time=Math.abs(target)>Math.abs(state.strength)?profile.attack:profile.release;
 state.strength+=(target-state.strength)*(-Math.expm1(-dt/time));
 if(target===0&&Math.abs(state.strength)<profile.restThreshold&&Math.abs(state.surge)<profile.restThreshold){state.strength=0;state.surge=0;state.speed=0;}
 state.resting=state.strength===0&&state.surge===0;
 return state;
}
export function sampleVelocitySkin(state,width,height,radius,{horizontal=0,vertical=0}={}){
 const pose={...WINDOW_REST_POSE,radius};
 // User-confirmed whole-card response. The native panel and its contents share
 // one plane; external navigation and source scene retain their own ownership.
 // These are bounded adaptation parameters, not measured Lusion constants.
 const strength=state.strength,surge=state.surge??0;
 const side=Math.max(-1,Math.min(1,horizontal)),level=Math.max(-1,Math.min(1,vertical));
 const flow=Math.max(-1,Math.min(1,strength+surge*.2));
 // One curved visual field, seen from inside a moving wheel. At its centre
 // there is no arbitrary yaw. Peripheral planes fan in opposite directions;
 // speed supplies perspective and acceleration supplies the liquid stretch.
 pose.rx=-11*flow;pose.ry=-12*side*flow;pose.rz=-2.2*side*flow;pose.skew=2.8*side*flow;
 pose.x=-side*Math.abs(flow)*5||0;pose.y=-level*Math.abs(flow)*3||0;
 pose.sx=1+Math.abs(side)*Math.abs(flow)*.018;
 pose.sy=1+Math.abs(surge)*.012;
 // Keep projected expansion bounded for tall editorial panels as well as cards.
 const perspective=Math.max(850,height*2.7,width*2.7);
 const amplitude=Math.min(width<480?7:12,Math.min(width,height)*.035)*flow;
 pose.ety=amplitude;pose.eby=-amplitude*.8;
 pose.elx=-amplitude*(.35+Math.max(0,-side));pose.erx=amplitude*(.35+Math.max(0,side));
 pose.tlx=side*amplitude*.35;pose.trx=side*amplitude*.35;
 pose.blx=-side*amplitude*.35;pose.brx=-side*amplitude*.35;
 return {pose,edgeMaximum:Math.abs(amplitude)*1.35,perspective,flow};
}
