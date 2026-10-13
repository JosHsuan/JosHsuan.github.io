/** Shared signed transport path for the retained membrane and ink recipes. */
export function sampleWindowPath(effect,q){
 if(!Number.isFinite(q))throw new TypeError('Finite path progress required');
 const [x,y,z]=effect.axis;return {x:x*q,y:y*q,z:z*q};
}

/** dR/dq; multiplying this derivative by q velocity yields transport velocity. */
export function sampleWindowTangent(effect,q){
 if(!Number.isFinite(q))throw new TypeError('Finite path progress required');
 const [x,y,z]=effect.axis;return {x,y,z};
}
