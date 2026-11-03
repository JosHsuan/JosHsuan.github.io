const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
const mix=(a,b,t)=>a+(b-a)*t;
const ease=t=>t*t*t*(10+t*(-15+6*t));
const neutralLight={keyScale:1,rimScale:1,environmentScale:1,sweepRad:0};
const key=(at,shot,eye,target,focalLengthMm,coverage='partial',lighting={})=>({at,shot,eye,target,focalLengthMm,coverage,lighting:{...neutralLight,...lighting}});

/** Camera coordinates are authored against the verified metre/Y-up source.
 * n() is a source-envelope coordinate; a() keeps a real eye height above its
 * base; m() identifies a measured machine feature. They never scale geometry.
 * Close frames intentionally crop source geometry. This is a Home film score,
 * separate from the complete-source reading aperture on each project page. */
const scores={
 'entrance-installation-art':({n,a})=>[
  key(0,'pedestrian-approach',a(1.35,1.65,1.5),a(.5,3.9,.5),24,'context',{rimScale:.88,sweepRad:-.12}),
  key(4,'upward-panel-field',a(1.3,2,1.42),a(.5,3.9,.5),28,'partial',{keyScale:.94,rimScale:1.06}),
  key(8,'folded-surface-detail',a(1.12,4.2,1.1),n(.68,.58,.68),55,'partial',{keyScale:.88,rimScale:1.23,environmentScale:.88,sweepRad:.13}),
  key(13,'upper-surface-traverse',a(1.18,6.4,1.06),a(.56,6.1,.55),45,'partial',{keyScale:1.02,rimScale:1.16,environmentScale:.93,sweepRad:-.08}),
  key(18,'canopy-rise',a(1.55,2.15,1.35),a(.5,6.1,.5),35,'partial',{rimScale:1.04,sweepRad:.1}),
 ],
 'project-caschlatsch':({m})=>[
  key(0,'tower-from-ground',m(6.5,1.65,8),m(0,3.7,0),28,'context',{keyScale:1.04,rimScale:.9,sweepRad:-.12}),
  key(4,'lattice-approach',m(4.6,1.75,6.3),m(0,3.7,0),35,'partial',{rimScale:1.12}),
  key(9,'through-the-timber-layers',m(2.9,2.65,3.2),m(0,3.7,0),70,'partial',{keyScale:.9,rimScale:1.26,environmentScale:.9,sweepRad:.14}),
  key(14,'upper-lattice-crane',m(3.2,5.4,3),m(0,6.2,0),55,'partial',{keyScale:1.03,rimScale:1.15,sweepRad:-.1}),
  key(20,'tower-side-return',m(4.8,2.1,5.7),m(0,4.2,0),35,'partial',{rimScale:1.04}),
 ],
 'mode-s-machine':({m})=>[
  key(0,'machine-context',m(.85,.48,.95),m(0,.14,0),50,'context',{rimScale:.92,sweepRad:-.1}),
  key(3.5,'working-envelope',m(.72,.38,.78),m(-.02,.14,.03),55,'context',{keyScale:.94,rimScale:1.1}),
  key(7.5,'workpiece-detail',m(.4,.285,.58),m(-.08755,.155,.17928),85,'partial',{keyScale:.9,rimScale:1.23,environmentScale:.88,sweepRad:.12}),
  key(11.5,'knife-side-traverse',m(.48,.245,.46),m(-.00978,.15,.0834),70,'partial',{keyScale:1.04,rimScale:1.13,sweepRad:-.08}),
  key(16,'machine-return',m(.76,.43,.64),m(0,.14,0),55,'context',{rimScale:.98}),
 ],
 'mode-s-of-making':({n})=>[
  key(0,'unit-context',n(1.8,1.5,2.6),n(.5,.48,.5),55,'context',{rimScale:.9}),
  key(3.5,'formed-unit-profile',n(1.65,1.1,2.15),n(.55,.52,.55),65,'context',{keyScale:.96,rimScale:1.1,sweepRad:-.1}),
  key(7,'foam-surface-detail',n(1.2,.95,1.55),n(.65,.57,.62),90,'partial',{keyScale:.9,rimScale:1.2,environmentScale:.9}),
  key(10.5,'surface-traverse',n(1.3,1.2,1.6),n(.4,.6,.5),75,'partial',{keyScale:1.03,rimScale:1.13,sweepRad:.12}),
  key(14,'unit-return',n(1.7,1.35,2.3),n(.5,.5,.5),55,'context'),
 ],
 'dot-based-3d-printing':({n})=>[
  key(0,'point-assembly-context',n(2.3,1.1,2.9),n(.5,.5,.5),50,'context'),
  key(3,'layer-depth',n(2,1.05,2.5),n(.52,.52,.52),60,'partial'),
  key(6,'individual-deposition-field',n(1.6,.78,1.9),n(.58,.53,.52),80,'partial'),
  key(9,'point-layer-traverse',n(1.8,1.15,1.8),n(.45,.58,.55),70,'partial'),
  key(12,'point-assembly-return',n(2.25,1.1,2.6),n(.5,.5,.5),50,'context'),
 ],
 'hc3dp-caustics':({n})=>[
  key(0,'transparent-form-context',n(2,1.2,2.6),n(.5,.5,.5),50,'context',{keyScale:.92,rimScale:1.15}),
  key(4,'transmission-profile',n(1.8,1.05,2.05),n(.55,.48,.55),60,'partial',{keyScale:.88,rimScale:1.25,environmentScale:1.05,sweepRad:-.1}),
  key(8,'optical-surface-detail',n(1.35,.72,1.6),n(.65,.5,.55),85,'partial',{keyScale:.86,rimScale:1.3,environmentScale:1.08,sweepRad:.12}),
  key(12,'edge-light-traverse',n(1.4,1.1,1.65),n(.4,.6,.52),70,'partial',{keyScale:.96,rimScale:1.2,environmentScale:1.03}),
  key(16,'transparent-form-return',n(1.9,1.2,2.25),n(.5,.5,.5),50,'context'),
 ],
 'special-assemblies':({n})=>[
  key(0,'timber-assembly-context',n(1.8,1.1,2.8),n(.5,.5,.5),45,'context',{keyScale:1.04,rimScale:.9}),
  key(4,'curved-assembly-profile',n(1.65,1,2.4),n(.55,.57,.5),55,'partial',{rimScale:1.12,sweepRad:-.1}),
  key(8,'upper-member-overlap',n(1.4,1.1,2.1),n(.65,.66,.5),75,'partial',{keyScale:.91,rimScale:1.24,environmentScale:.91}),
  key(12,'member-layer-traverse',n(1.6,.85,2),n(.38,.48,.5),65,'partial',{keyScale:1.03,rimScale:1.14,sweepRad:.12}),
  key(16,'timber-assembly-return',n(1.85,1.15,2.65),n(.5,.5,.5),45,'context'),
 ],
};

export function createHomeShowcaseShotPlan({id,model}={}){
 const bounds=model?.bounds;
 if(!bounds||!['min','max'].every(key=>Array.isArray(bounds[key])&&bounds[key].length===3&&bounds[key].every(Number.isFinite))||bounds.min.some((value,i)=>value>bounds.max[i]))throw RangeError('Verified metre source bounds required for Home shots');
 const span=bounds.max.map((value,i)=>value-bounds.min[i]),diagonal=Math.hypot(...span);
 if(!(diagonal>0))throw RangeError('Nonempty Home source bounds required');
 const planID=id==='mode-s-of-making'&&(model.id==='machine'||/\/machine(?:-materials)?\.glb$/.test(model.src??''))?'mode-s-machine':id;
 if(!scores[planID])throw Error('No authored Home shot score for '+planID);
 const n=(x,y,z)=>[x,y,z].map((value,i)=>bounds.min[i]+span[i]*value);
 const a=(x,height,z)=>[bounds.min[0]+span[0]*x,bounds.min[1]+height,bounds.min[2]+span[2]*z];
 const m=(x,y,z)=>[x,y,z];
 const keys=scores[planID]({n,a,m}),duration=keys.at(-1).at;
 const center=n(.5,.5,.5),architecture=['entrance-installation-art','project-caschlatsch'].includes(planID);
 return Object.freeze({id:planID,duration,architecture,
  shots:Object.freeze(keys.map(({at,shot,coverage,focalLengthMm})=>Object.freeze({at,shot,coverage,focalLengthMm}))),
  sample({seconds=0,aspect=1}={}){
   if(!Number.isFinite(seconds)||!Number.isFinite(aspect)||aspect<=0)throw RangeError('Finite Home shot time and positive aspect required');
   const time=clamp(seconds,0,duration),index=Math.max(0,keys.findIndex((key,i)=>i<keys.length-1&&time>=key.at&&time<keys[i+1].at));
   const first=time===duration?keys.at(-1):keys[index],last=time===duration?first:keys[index+1];
   const t=first===last?0:ease((time-first.at)/(last.at-first.at));
   const position=first.eye.map((value,i)=>mix(value,last.eye[i],t)),target=first.target.map((value,i)=>mix(value,last.target[i],t));
   const focalLengthMm=mix(first.focalLengthMm,last.focalLengthMm,t),filmGaugeMm=36;
   const fovDeg=2*Math.atan(filmGaugeMm/Math.max(1,aspect)/(2*focalLengthMm))*180/Math.PI;
   const lighting=Object.fromEntries(Object.keys(neutralLight).map(key=>[key,mix(first.lighting[key],last.lighting[key],t)]));
   const near=Math.max(.0001,Math.max(...span)*.002),far=Math.hypot(...position.map((value,i)=>value-center[i]))+diagonal*1.5;
   return {planId:planID,shot:first.shot,coverage:first.coverage,time,duration,position,target,focalLengthMm,filmGaugeMm,fovDeg,near,far,
    frame:aspect<.8?{x:.57,y:.30}:{x:.69,y:.49},lighting};
  },
 });
}
