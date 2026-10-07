import {CatmullRomCurve3,Vector3} from 'three';
import {clamp} from './input.js';
const DEG=180/Math.PI;
export const duration=6;
export const ease=u=>u*u*u*(10+u*(-15+6*u));
export const curve=new CatmullRomCurve3([[5,2.8,8],[3,4.5,8.3],[-1,2.5,8],[-5,2.8,6]].map(p=>new Vector3(...p)),false,'centripetal');
export function timing(u,smooth){return smooth?{distance:ease(u),speed:30*u*u*(1-u)*(1-u)/duration,acceleration:60*u*(1-u)*(1-2*u)/duration**2}:{distance:u,speed:1/duration,acceleration:0};}
export function sample(id,value,variant){
 const u=clamp(value),b=variant==='b',p={position:[4.8,2.9,7.8],target:[0,0,0],fov:35,roll:0,focus:9,blur:0,mist:0,spread:1,turn:0,assembly:0,selection:-1,light:[4,6,4],finish:0,glass:false,particles:false,contact:false,owner:'analytic'};
 const rail=t=>[5-10*t,2.8,8];
 const axis=d=>[0,1.1*d/9,d];
 if(id==='locked'){p.position=axis(b?12-6*u:12);p.turn=(u-.5)*.5;}
 if(id==='handheld'){p.position=axis(9);if(b){let t=u*duration;p.position=p.position.map((v,i)=>v+.10*Math.sin(t*(1.7+i*.8)+i)+.025*Math.sin(t*(9+i)));p.target=[.035*Math.sin(t*3.3),.055*Math.sin(t*2.1),0];p.roll=.016*Math.sin(t*2.7)+.004*Math.sin(t*12);}}
 if(id==='trajectory')p.position=b?curve.getPointAt(u).toArray():rail(u);
 if(id==='timing')p.position=rail(timing(u,b).distance);
 if(id==='parallax'){p.position=[b?-3+6*u:0,1.2,9];p.target=[b?-3+6*u:-2+4*u,0,0];}
 if(id==='zoom'){p.position=axis(b?12-6*u:12);p.fov=b?35:35-17*u;}
 if(id==='dollyzoom'){const d=12-6*u;p.position=[0,0,d];p.fov=b?2*Math.atan(9*Math.tan(35/2/DEG)/d)*DEG:35;}
 if(id==='focus'){p.position=[0,1,9];p.target=[0,0,0];p.focus=3+12*u;p.blur=b?1:0;}
 if(id==='mist'){p.position=[3,1.8,9];p.mist=b?u*.55:0;p.spread=1+u*3;}
 if(id==='reveal'){p.position=b?[5-5*u,1.1,8]:[0,1.1,8];p.target=[0,0,0];}
 if(id==='language'){const distance=b?(u<1/3?12:u<2/3?8:4.7):12-7.3*u;p.position=[0,distance*.1,distance];p.target=[0,b&&u>=2/3?.2:0,0];}
 if(id==='crane'){const a=(u-.5)*1.1;p.position=[Math.sin(a)*9,b?1+5*u:1,Math.cos(a)*9];}
 if(id==='score'){const a=(u-.5)*1;p.position=[Math.sin(a)*9,3,Math.cos(a)*9];if(b)p.owner='theatre';}
 if(id==='proximity'){p.selection=b?u*16:-1;}
 if(id==='section')p.assembly=b?ease(u):0;
 if(id==='grazing'){if(b)p.light=[-6+12*u,1.3,3];}
 if(id==='lens'){p.position=[0,0,7];p.glass=b;p.lensX=-1.4+2.8*u;}
 if(id==='particles'){p.particles=true;p.brush=b?-2+4*u:100;}
 if(id==='contact'){p.contact=true;p.position=[5,4,7];p.frame=Math.round(u*240);}
 if(id==='finish'){p.selection=b?u*16:-1;p.finish=b?1:0;}
 if(id==='reader'&&b)p.owner='theatre';
 return p;
}
