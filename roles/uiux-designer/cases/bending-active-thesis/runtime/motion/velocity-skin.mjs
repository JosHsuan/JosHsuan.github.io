import {WINDOW_REST_POSE} from './window-pose.mjs';

// Original pilot parameters, informed by scroll-responsive material references,
// not reverse-engineered Lusion timings. Input is real native displacement, not
// wheel events. The existing Director supplies all active elapsed time.
export const VELOCITY_SKIN_PROFILE=Object.freeze({
 key:'velocity-skin',deadZone:.08,saturationSpeed:1.8,attack:.055,release:.09,restThreshold:.0005,
});
export function createVelocitySkin(docY=0){return {lastY:docY,strength:0,speed:0,resting:true};}
export function advanceVelocitySkin(state,{docY,dt,viewportHeight,immediate=false}){
 if(immediate){state.lastY=docY;state.strength=0;state.speed=0;state.resting=true;return state;}
 if(!(dt>0))return state;
 const displacement=docY-state.lastY;state.lastY=docY;
 const profile=VELOCITY_SKIN_PROFILE;
 state.speed=displacement/(Math.max(1,viewportHeight)*dt);
 const magnitude=Math.max(0,Math.abs(state.speed)-profile.deadZone);
 const target=Math.sign(state.speed)*Math.tanh(magnitude/profile.saturationSpeed);
 const time=Math.abs(target)>Math.abs(state.strength)?profile.attack:profile.release;
 state.strength+=(target-state.strength)*(-Math.expm1(-dt/time));
 if(target===0&&Math.abs(state.strength)<profile.restThreshold)state.strength=0;
 state.resting=state.strength===0;
 return state;
}
export function sampleVelocitySkin(state,width,height,radius){
 const pose={...WINDOW_REST_POSE,radius};
 // User-confirmed whole-card response. The native panel and its contents share
 // one plane; external navigation and source scene retain their own ownership.
 // These are bounded adaptation parameters, not measured Lusion constants.
 const strength=state.strength;
 pose.rx=-8*strength;pose.ry=4*strength;pose.rz=-1.1*strength;pose.skew=.7*strength;
 // Keep projected expansion bounded for tall editorial panels as well as cards.
 const perspective=Math.max(800,height*3,width*3);
 const amplitude=Math.min(width<480?5:9,Math.min(width,height)*.025)*state.strength;
 pose.ety=amplitude;pose.eby=-amplitude*.7;
 return {pose,edgeMaximum:Math.abs(amplitude),perspective};
}
