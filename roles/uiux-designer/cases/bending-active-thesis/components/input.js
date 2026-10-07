export function createReviewInput(){
 let value={u:0,mode:'static',representation:'material',reduced:false};
 const listeners=new Set();
 return {get:()=>value,subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn);},set(patch){
  const next={...value,...patch};next.u=Math.max(0,Math.min(1,Number.isFinite(next.u)?next.u:0));
  if(Object.keys(next).every(k=>next[k]===value[k]))return;
  value=next;listeners.forEach(fn=>fn(value));
 }};
}
