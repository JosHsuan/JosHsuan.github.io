// Layer-independent recipes. Content and frame ownership belong to the caller.
const recipe=value=>Object.freeze({...value,axis:Object.freeze([...value.axis])});
export const WINDOW_MOTION_RECIPES=Object.freeze({
 membrane:recipe({key:'membrane',frequency:1.55,damping:.55,axis:[0,-100,60],mask:'membrane',accent:'copper',outlineLimit:.105}),
 ink:recipe({key:'ink',frequency:1.6,damping:.58,axis:[-75,-35,20],mask:'ink',accent:'copper',outlineLimit:.055}),
});
export function getWindowMotionRecipe(key){
 if(!Object.hasOwn(WINDOW_MOTION_RECIPES,key))throw new RangeError('Unknown window motion recipe: '+String(key));
 return WINDOW_MOTION_RECIPES[key];
}
