import {createKineticState,retargetKinetic,injectKineticInput,advanceKinetic} from './kinetic-motion.mjs';
import {sampleWindowTangent} from './window-path.mjs';

// Body passage owns the destination. Material points track its actual position
// and velocity; they never queue a region destination, artificial wait or kick.
export const REGION_TARGET=Object.freeze({before:-1,inside:0,after:1});
const CORNERS=[[-1,-1],[1,-1],[1,1],[-1,1]],EDGES=[[0,-1],[1,0],[0,1],[-1,0]];
const MAX_STEP=1/240,FLOW_TIME=.075,FLOW_SPEED=.12,POSITION_EPSILON=.00035,VELOCITY_EPSILON=.0035;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const smooth=x=>{const t=clamp((x+.6)/1.2,0,1);return t*t*(3-2*t);};
const allPoints=state=>[...state.corners,...state.edges];

function point(position,progress,kind){
 return {point:[...position],kind,frontWeight:.5,frequency:4.4,error:0,errorVelocity:0,
  response:{progress,velocity:0,target:progress,transitionResting:true,resting:true}};
}
function refresh(state){
 const bodyRest=state.progress===state.target&&state.velocity===0;
 state.transitionResting=bodyRest&&state.aperture===state.target&&allPoints(state).every(p=>p.response.transitionResting);
 state.resting=state.transitionResting&&state.pointerResting&&state.energy===0;
 if(state.transitionResting){state.flow=0;state.acceleration=0;state.transport={vx:0,vy:0};}
 return state;
}
function snapMaterial(state){
 state.aperture=state.target;
 for(const p of allPoints(state)){
  p.error=0;p.errorVelocity=0;
  Object.assign(p.response,{progress:state.progress,velocity:state.velocity,target:state.progress,transitionResting:true,resting:true});
 }
 state.flow=0;state.acceleration=0;state.transport={vx:0,vy:0};
 return refresh(state);
}
export function createWindowMotion(effect,{region='before'}={}){
 const progress=REGION_TARGET[region];
 if(progress===undefined)throw new RangeError('Unknown window region');
 if(!Array.isArray(effect.axis)||effect.axis.length!==3||!effect.axis.every(Number.isFinite))throw new TypeError('Finite window path axis required');
 const state=createKineticState({frequency:effect.frequency,damping:effect.damping,range:[-1,1],progress});
 state.axis=[...effect.axis];state.path={key:effect.key,axis:state.axis};state.direction=1;state.flow=0;state.acceleration=0;state.transport={vx:0,vy:0};state.aperture=progress;
 state.corners=CORNERS.map(p=>point(p,progress,'corner'));state.edges=EDGES.map(p=>point(p,progress,'edge'));
 return refresh(state);
}
export function retargetWindowMotion(state,region,{strength=.45,reduced=false}={}){
 const target=REGION_TARGET[region];
 if(target===undefined||!Number.isFinite(strength))throw new RangeError('Finite window target and strength required');
 const direction=Math.sign(target-state.target)||Math.sign(target-state.progress)||state.direction;
 state.direction=direction;
 retargetKinetic(state,target,{energy:clamp(strength,0,1)*.75,reduced});
 if(reduced)return snapMaterial(state);
 // Only the body receives a fresh impulse; material absolute velocities survive.
 if(Math.abs(state.velocity)<.008&&state.progress!==target)injectKineticInput(state,{impulse:direction*clamp(strength,0,1)*3});
 return refresh(state);
}
/** Native scroll supplies a continuous destination; it never kicks the body. */
export function setWindowScrollTarget(state,target,{energy=0,reduced=false}={}){
 if(!Number.isFinite(target)||!Number.isFinite(energy))throw new RangeError('Finite scroll target and energy required');
 const next=clamp(target,-1,1);
 state.direction=Math.sign(next-state.target)||state.direction;
 retargetKinetic(state,next,{energy:clamp(energy,0,1),reduced});
 return reduced?snapMaterial(state):refresh(state);
}
export function injectWindowInput(state,{impulse=0,energy=0}={}){
 injectKineticInput(state,{impulse,energy});
 return refresh(state);
}

// Exact forced error spring over one small active-time interval. With e=r-q,
// r''=w²(q-r)+2zw(v-r') is e''+2zw e'+w²e=-a_body. The velocity feed-forward is
// essential: accelerating leaves material behind; braking lets it catch up.
function errorStep(error,velocity,acceleration,dt,frequency,damping){
 const omega=2*Math.PI*frequency,target=-acceleration/(omega*omega),offset=error-target;
 const decay=Math.exp(-damping*omega*dt),wd=omega*Math.sqrt(1-damping*damping),cos=Math.cos(wd*dt),sin=Math.sin(wd*dt);
 const b=(velocity+damping*omega*offset)/wd,oscillation=offset*cos+b*sin;
 return [target+decay*oscillation,decay*(-damping*omega*oscillation+wd*(-offset*sin+b*cos))];
}
export function advanceWindowMotion(state,seconds,{paused=false,reduced=false}={}){
 if(!Number.isFinite(seconds)||seconds<0||seconds>60)throw new RangeError('Active seconds must be finite and between 0 and 60');
 if(paused)return state;
 if(reduced){advanceKinetic(state,0,{reduced:true});return snapMaterial(state);}
 if(seconds===0||state.resting)return state;
 const steps=Math.max(1,Math.ceil(seconds/MAX_STEP-1e-10)),dt=seconds/steps,points=allPoints(state);
 for(let step=0;step<steps;step++){
  const bodyQ=state.progress,bodyV=state.velocity;
  advanceKinetic(state,dt);
  // Reveal follows actual body travel monotonically toward the current intent.
  // Once reading is fully revealed, body overshoot cannot re-crop its content.
  // On reversal this holds the current opening until the body catches up.
  let apertureTarget=state.aperture;
  if(state.target>state.aperture)apertureTarget=Math.max(state.aperture,Math.min(state.progress,state.target));
  else if(state.target<state.aperture)apertureTarget=Math.min(state.aperture,Math.max(state.progress,state.target));
  // A fresh leave intent can find the body already past the reading plane.
  // Catch up at the current transport rate rather than cropping that gap in one
  // frame. The minimum rate also closes a residual gap after the body settles.
  const apertureStep=Math.max(Math.abs(bodyV),Math.abs(state.velocity),1)*dt;
  state.aperture=Math.abs(apertureTarget-state.aperture)<=apertureStep?apertureTarget:state.aperture+Math.sign(apertureTarget-state.aperture)*apertureStep;
  state.acceleration=(state.velocity-bodyV)/dt;
  // Signed flow derives exclusively from current speed. It passes smoothly
  // through neutral after velocity reverses, never from the event target sign.
  const desired=state.velocity/Math.hypot(state.velocity,FLOW_SPEED);
  state.flow+=(desired-state.flow)*(1-Math.exp(-dt/FLOW_TIME));
  if(Math.abs(state.flow)<.0001&&state.velocity===0)state.flow=0;
  const tangent=sampleWindowTangent(state.path,(bodyQ+state.progress)/2),length=Math.hypot(tangent.x,tangent.y);
  const tx=length>.0001?tangent.x/length:0,ty=length>.0001?tangent.y/length:-1,support=Math.max(.001,Math.abs(tx)+Math.abs(ty));
  for(const p of points){
   p.frontWeight=smooth((p.point[0]*tx+p.point[1]*ty)/support*state.flow);
   // Mid-edge material is softer at the trailing face, so the rear develops
   // one broad bow while the leading edge carries the surface cleanly.
   p.frequency=(3.2+2.4*p.frontWeight)*(p.kind==='edge'?.78+.22*p.frontWeight:1);
   const damping=.69+.08*p.frontWeight;
   const error=p.response.progress-bodyQ,errorV=p.response.velocity-bodyV;
   let [nextError,nextErrorV]=errorStep(error,errorV,state.acceleration,dt,p.frequency,damping);
   // Bounds protect only outlier impulses. Presentation applies one common
   // geometric gain; no point is independently clipped to the DOM rectangle.
   nextError=clamp(nextError,-.28,.28);nextErrorV=clamp(nextErrorV,-10,10);
   if((nextError===-.28&&nextErrorV<0)||(nextError===.28&&nextErrorV>0))nextErrorV=0;
   const settled=state.progress===state.target&&state.velocity===0&&Math.abs(nextError)<=POSITION_EPSILON&&Math.abs(nextErrorV)<=VELOCITY_EPSILON;
   p.error=settled?0:nextError;p.errorVelocity=settled?0:nextErrorV;
   p.response.progress=state.progress+p.error;p.response.velocity=state.velocity+p.errorVelocity;p.response.target=state.progress;
   p.response.transitionResting=settled;p.response.resting=settled;
  }
  const velocityTangent=sampleWindowTangent(state.path,state.progress);
  state.transport={vx:velocityTangent.x*state.velocity,vy:velocityTangent.y*state.velocity};
  refresh(state);
  if(state.resting)break;
 }
 return state;
}
