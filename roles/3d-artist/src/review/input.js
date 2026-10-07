// One semantic input. Source mode is exclusive; there is no clock or velocity input.
export const clamp=value=>Number.isFinite(value)?Math.max(0,Math.min(1,value)):0;
export function createInput(initial=.5){
 const listeners=new Set();
 const input={u:clamp(initial),mode:'pointer',revision:0,
  set(value,source){if(source!==input.mode&&source!=='equivalent')return false;const next=clamp(value);if(next===input.u)return false;input.u=next;input.revision++;for(const listener of listeners)listener(input.u);return true;},
  subscribe(listener){listeners.add(listener);return()=>listeners.delete(listener);},
  select(mode){if(!['pointer','scroll'].includes(mode))throw new Error('Unknown input mode');input.mode=mode;},
 };
 return input;
}
export function pointerProgress(x,left,width){return clamp((x-left)/Math.max(1,width));}
export function scrollProgress(scrollY,top,height,viewport){return clamp((scrollY-top)/Math.max(1,height-viewport));}
