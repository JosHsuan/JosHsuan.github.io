/** Pure native-reading orientation layer. Degrees match the source fitter.
 * No time, source selection, geometry, DOM, or camera writes. The existing
 * Director owns pause holding/recovery and the existing chapter score owns idle.
 */
const paths=new WeakSet();
export function createSourceScrollOrientation(keys){
 if(!Array.isArray(keys)||keys.length<2)throw RangeError('At least two orientation keys required');
 const path=keys.map(key=>{
  if(!key||![key.at,key.azimuthOffsetDeg,key.elevationOffsetDeg].every(Number.isFinite)||key.at<0||key.at>1||Math.abs(key.azimuthOffsetDeg)>30||Math.abs(key.elevationOffsetDeg)>10)throw RangeError('Finite normalized keys and bounded degree offsets required');
  return Object.freeze({at:key.at,azimuthOffsetDeg:key.azimuthOffsetDeg,elevationOffsetDeg:key.elevationOffsetDeg});
 });
 if(path[0].at!==0||path.at(-1).at!==1||path.some((key,i)=>i>0&&key.at<=path[i-1].at))throw RangeError('Strictly increasing complete [0,1] path required');
 Object.freeze(path);paths.add(path);return path;
}
export function sampleSourceScrollOrientation(path,nativeU,{reducedMotion=false}={}){
 if(!paths.has(path)||!Number.isFinite(nativeU)||typeof reducedMotion!=='boolean')throw RangeError('Prepared orientation path, finite reading progress and boolean policy required');
 if(reducedMotion)return {azimuthOffsetDeg:0,elevationOffsetDeg:0};
 const u=Math.max(0,Math.min(1,nativeU));let i=1;
 while(i<path.length-1&&u>path[i].at)i++;
 const a=path[i-1],b=path[i],t=(u-a.at)/(b.at-a.at),w=t*t*(3-2*t);
 return {azimuthOffsetDeg:a.azimuthOffsetDeg+(b.azimuthOffsetDeg-a.azimuthOffsetDeg)*w,elevationOffsetDeg:a.elevationOffsetDeg+(b.elevationOffsetDeg-a.elevationOffsetDeg)*w};
}

// Reviewed editorial proposal, not a claim of measured structural behavior.
// Make/Validation remain exactly neutral; sourcePresence still owns absence.
export const BENDING_SCROLL_ORIENTATION=createSourceScrollOrientation([
 [0,0,0],[.5,2,.5],[1,4,1],[1.5,7,2],[2,4,1],[2.5,0,3],
 [3,-4,2],[3.5,-7,0],[4,0,0],[6,0,0],[6.5,2,.5],[7,0,0],
].map(([chapter,azimuthOffsetDeg,elevationOffsetDeg])=>({at:chapter/7,azimuthOffsetDeg,elevationOffsetDeg})));
