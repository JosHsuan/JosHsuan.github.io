/** Verified source selection and framing. No clock, mesh/camera writes or morphs.
 * A fixed support union per family prevents a comparison cut from also dollying.
 * The sole World writer supplies Motion's chapter weights and resolved loop cues.
 */
import {sampleCinematicPose, CINEMATIC_CHAPTERS} from './vendor/cinematic-plan.mjs';

export const SOURCE_DIAGRAM_REVISION = '13fbd10da48e6aa71fe6bfb8c7711741293833f7bba33611f394f9b1543e505a';
export const REPRESENTATION_IDS = Object.freeze(['origami', 'opening', 'bending', 'curvature']);
export const EXPERIMENT_IDS = Object.freeze(['experiment-a', 'experiment-b', 'experiment-c']);
// The moving DOM surface owns page composition. Its camera fits within this
// stable local aperture and never follows a second, page-space source slot.
export const CANVAS_LOCAL_SOURCE_VIEWPORT = Object.freeze({left:.06,top:.06,width:.88,height:.88});
// Round 10 restores the viewport-composed study footprint. These authored
// apertures are stable for the chapter hold; no scrolling DOM slot owns them.
const VIEWPORT_STAGE_DESKTOP = Object.freeze({left:.51,top:.20,width:.43,height:.52});
const VIEWPORT_STAGE_COMPACT = Object.freeze({left:.51,top:.20,width:.41,height:.52});
const VIEWPORT_STAGE_PORTRAIT = Object.freeze({left:.045,top:.205,width:.91,height:.43});
export function viewportStageSourceViewport(aspect, viewportWidth) {
  if (!(aspect>0) || !Number.isFinite(aspect)) throw RangeError('Finite positive stage aspect required');
  if (viewportWidth!==undefined&&(!(viewportWidth>0)||!Number.isFinite(viewportWidth))) throw RangeError('Finite positive stage width required');
  // The authored reading layout stacks at 780 CSS px. A tall tablet may still
  // have two columns, so portrait aspect alone must not center its source
  // behind the left reading plane. This is viewport policy, not DOM tracking.
  const stacked=viewportWidth===undefined?aspect<1:viewportWidth<=780;
  return stacked ? VIEWPORT_STAGE_PORTRAIT : viewportWidth<=1100 ? VIEWPORT_STAGE_COMPACT : VIEWPORT_STAGE_DESKTOP;
}
const clamp = (n, a = 0, b = 1) => Math.max(a, Math.min(b, Number.isFinite(n) ? n : a));
const rad = n => n * Math.PI / 180;
const dot = (a, b) => a.reduce((sum, v, i) => sum + v * b[i], 0);
const cross = (a, b) => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
const unit = v => {const l = Math.hypot(...v); return v.map(n => n/l);};
const corners = bounds => Array.from({length:8}, (_, mask) => bounds.min.map((v, i) => mask & (1 << i) ? bounds.max[i] : v));
const vector = v => Array.isArray(v) && v.length === 3 && v.every(Number.isFinite);
const backAt = (az, el) => [Math.sin(rad(az))*Math.cos(rad(el)), Math.sin(rad(el)), Math.cos(rad(az))*Math.cos(rad(el))];
export function unionSourceBounds(records) {
  if (!records.length || records.some(b => !vector(b.min) || !vector(b.max) || b.min.some((v,i) => v > b.max[i]))) throw RangeError('Finite ordered source bounds required');
  return {min:[0,1,2].map(i=>Math.min(...records.map(b=>b.min[i]))), max:[0,1,2].map(i=>Math.max(...records.map(b=>b.max[i])))};
}

export function prepareSourceFamilies(metadata, assembly) {
  if (metadata?.revision !== SOURCE_DIAGRAM_REVISION || metadata.viewerUnits !== 'meters' || metadata.upAxis !== 'Y'
    || metadata.representations?.length !== 7) throw Error('Unexpected source-diagram revision or coordinate system');
  const result = {assembly};
  for (const [family, ids] of [['representation',REPRESENTATION_IDS], ['experiment',EXPERIMENT_IDS]]) {
    const records = ids.map(id => metadata.representations.find(record => record.id === id));
    if (records.some(record => !record || record.family !== family)) throw Error('Missing verified source representation');
    const bounds = unionSourceBounds(records.map(record=>record.bounds));
    for (const record of records) {
      const support = record.framingSupport;
      if (support?.assetSHA256 !== SOURCE_DIAGRAM_REVISION || support.geometrySHA256 !== record.geometrySHA256
        || !Array.isArray(support.points) || support.points.length < 4 || support.points.some(p => !vector(p)
          || p.some((v,i) => v < record.bounds.min[i]-1e-7 || v > record.bounds.max[i]+1e-7))) throw Error('Source support does not match its geometry record');
    }
    result[family] = {bounds, points:records.flatMap(record=>record.framingSupport.points), revision:SOURCE_DIAGRAM_REVISION};
  }
  return result;
}

export function resolveSourceSelection(playback, selection, sceneScore) {
  const supplied = playback?.chapterWeights ?? [1,0,0,0,0,0,0];
  if (supplied.length !== 7 || supplied.some(v=>!Number.isFinite(v)||v<0) || !supplied.some(v=>v>0)) throw RangeError('Seven nonnegative chapter weights required');
  const chapterIndex = supplied.indexOf(Math.max(...supplied)), chapterId = CINEMATIC_CHAPTERS[chapterIndex];
  const ids = chapterId === 'pattern' ? EXPERIMENT_IDS : ['form','system'].includes(chapterId) ? REPRESENTATION_IDS : ['assembly'];
  const time = playback?.activeSeconds ?? 0;
  const age = time - (selection?.selectedAt ?? -Infinity);
  const pinned = selection?.chapterId === chapterId && Number.isInteger(selection.index) && selection.index >= 0 && selection.index < ids.length && age >= 0 && age < 8;
  const phase = playback?.phases?.[chapterIndex] ?? playback?.chapters?.[chapterIndex]?.phase ?? 0;
  const slots = sceneScore?.representation?.sourceSlots?.find(record=>record.chapter === chapterId)?.slots;
  const autoIndex = slots?.length === ids.length ? slots.indexOf(Math.max(...slots)) : Math.min(ids.length-1,Math.floor((((phase%1)+1)%1)*ids.length));
  const index = pinned ? selection.index : autoIndex;
  return {id:ids[index], index, chapterId, chapterIndex, pinned, pinSecondsRemaining:pinned ? 8-age : 0,
    family:ids === EXPERIMENT_IDS ? 'experiment' : ids === REPRESENTATION_IDS ? 'representation' : 'assembly'};
}

function viewRect(value) {
  const rect = value ?? {left:0,top:0,width:1,height:1};
  if (!['left','top','width','height'].every(key=>Number.isFinite(rect[key])) || rect.left<0 || rect.top<0 || rect.width<=0 || rect.height<=0
    || rect.left+rect.width>1+1e-7 || rect.top+rect.height>1+1e-7) throw RangeError('Source viewport must lie inside the Canvas');
  return rect;
}

/** Fit verified support after the final orbit and FOV. Three percent per edge.
 * Bounds/points are immutable source geometry; only the camera distance changes.
 */
export function fitSourcePose({bounds, points, aspect, azimuth=30, elevation=30, fov=36, viewport, distanceScale=1}) {
  unionSourceBounds([bounds]);
  if (!(aspect>0) || !Number.isFinite(aspect) || !(fov>0&&fov<150)) throw RangeError('Finite positive aspect and FOV required');
  const rect = viewRect(viewport), paddingFraction=.03;
  const back=backAt(azimuth,elevation), right=unit(cross([0,1,0],back)), up=cross(back,right);
  const target=bounds.min.map((v,i)=>(v+bounds.max[i])/2), box=corners(bounds);
  const support=points ?? box;
  if (!support.length || support.some(p=>!vector(p))) throw RangeError('Finite source support required');
  const tanV=Math.tan(rad(fov)/2), tanH=tanV*aspect;
  const halfWidth=rect.width*(1-paddingFraction*2), halfHeight=rect.height*(1-paddingFraction*2);
  let distance=0;
  for (const p of support) {
    const delta=p.map((v,i)=>v-target[i]);
    distance=Math.max(distance,dot(delta,back)+Math.max(Math.abs(dot(delta,right))/(tanH*halfWidth),Math.abs(dot(delta,up))/(tanV*halfHeight)));
  }
  distance*=Math.max(1,Number.isFinite(distanceScale)?distanceScale:1);
  const position=target.map((v,i)=>v+back[i]*distance), depths=box.map(p=>dot(position.map((v,i)=>v-p[i]),back));
  const radius=Math.hypot(...bounds.max.map((v,i)=>v-bounds.min[i]))/2;
  const compositionNDC=[2*rect.left+rect.width-1,1-2*rect.top-rect.height];
  return {position,target,up:[0,1,0],aspect,fov,near:Math.max(radius*.0001,Math.min(...depths)*.08),far:Math.max(...depths)+radius*2,
    viewOffsetNormalized:{x:-compositionNDC[0]/2,y:compositionNDC[1]/2},compositionNDC,azimuth,elevation,distance,
    viewport:{...rect},paddingFraction,framingSupportPoints:support.length,sourcePresence:1,modelVisibility:1,surfaceEmphasis:0,
    framingIntent:'held-source-study',framingEvidence:'exact source convex-support union; fixed within comparison family',owner:'cinematic-composite'};
}

/** Chapter blends retain the authored overview/absence/return. Visible diagram
 * slots blend into a support-fitted shot; intermediate crops are intentional.
 * User angles are bounded offsets, not a second camera or independent clock.
 */
export function sampleSourceScenePose({playback,chapterScene,families,selection,aspect,viewport,viewportWidth,weight=0,inspection,interactionChapter,pointer={x:0,y:0},reducedMotion=false,canvasLocal=false,compositionMode}) {
  const raw=playback?.chapterWeights ?? [1,0,0,0,0,0,0], total=raw.reduce((a,b)=>a+b,0), weights=raw.map(v=>v/total);
  const poses=weights.map((w,i)=>w>0?sampleCinematicPose((i+.5)/7,aspect,reducedMotion?{x:0,y:0}:pointer,
    {bounds:families[i===1||i===2?'representation':i===3?'experiment':'assembly'].bounds,sharedStage:true,reducedMotion:false}):null);
  const scalar=read=>poses.reduce((sum,p,i)=>sum+(p?read(p)*weights[i]:0),0);
  const vec=read=>[0,1,2].map(c=>scalar(p=>read(p)[c]));
  const polar=p=>{const v=p.position.map((n,i)=>n-p.target[i]),d=Math.hypot(...v);return {az:Math.atan2(v[0],v[2])*180/Math.PI,el:Math.asin(v[1]/d)*180/Math.PI,d};};
  const localStudy=['form','system','pattern'].includes(selection.chapterId);
  const viewportStage=compositionMode==='viewport-stage';
  const cue=chapterScene?.camera ?? {}, w=canvasLocal||viewportStage?Number(localStudy):clamp(weight), family=families[selection.family];
  const controlled=interactionChapter===selection.chapterId;
  const userAz=controlled?clamp(inspection?.azimuth??30,-40,100)-30:0;
  const userEl=controlled?clamp(inspection?.elevation??30,12,70)-30:0;
  const azimuth=scalar(p=>polar(p).az)+(cue.azimuthOffsetDeg??0)+userAz*w;
  const elevation=clamp(scalar(p=>polar(p).el)+(cue.elevationOffsetDeg??0)+userEl*w,8,78);
  const fov=clamp(scalar(p=>p.fov)*(cue.fovScale??1),24,65), back=backAt(azimuth,elevation);
  const target=vec(p=>p.target), distance=scalar(p=>polar(p).d)*(cue.distanceScale??1);
  const shift={x:scalar(p=>p.viewOffsetNormalized.x),y:scalar(p=>p.viewOffsetNormalized.y)};
  const presence=scalar(p=>p.sourcePresence??1)>1e-7?1:0;
  const story={position:target.map((v,i)=>v+back[i]*distance),target,up:[0,1,0],fov,aspect,azimuth,elevation,distance,
    viewOffsetNormalized:shift,sourcePresence:presence,modelVisibility:presence,surfaceEmphasis:scalar(p=>p.surfaceEmphasis??0),
    owner:'cinematic-composite',framingIntent:presence?'autonomous-authored-shot':'evidence-absence'};
  let pose=story;
  if(canvasLocal&&!viewportStage) {
    const fit=fitSourcePose({...family,aspect,azimuth,elevation,fov,viewport:CANVAS_LOCAL_SOURCE_VIEWPORT,distanceScale:cue.distanceScale??1});
    // The opening retains a restrained sculptural crop inside its own frame.
    // All complete source studies and the ending hold retain their exact fit.
    // Inactive evidence chapters retain absence even though their local camera
    // is ready for re-entry; fitting does not itself make a source present.
    const opening=selection.chapterId==='overview'&&!reducedMotion;
    const localDistance=fit.distance*(opening ? .88 : 1);
    pose={...story,...fit,distance:localDistance,position:fit.target.map((v,i)=>v+back[i]*localDistance),
      sourcePresence:presence,modelVisibility:presence,surfaceEmphasis:story.surfaceEmphasis,
      compositionSpace:'canvas-local',
      framingIntent:!presence?'evidence-absence':opening?'canvas-local-hero-crop':localStudy?'held-source-study':'held-source'};
  } else if(w>0) {
    const fit=fitSourcePose({...family,aspect,azimuth,elevation,fov,viewport:viewportStage?viewportStageSourceViewport(aspect,viewportWidth):viewport,distanceScale:cue.distanceScale??1});
    const mixedTarget=target.map((v,i)=>v+(fit.target[i]-v)*w), mixedDistance=distance+(fit.distance-distance)*w;
    pose={...story,...fit,target:mixedTarget,position:mixedTarget.map((v,i)=>v+back[i]*mixedDistance),distance:mixedDistance,
      viewOffsetNormalized:{x:shift.x+(fit.viewOffsetNormalized.x-shift.x)*w,y:shift.y+(fit.viewOffsetNormalized.y-shift.y)*w},
      framingIntent:w===1?'held-source-study':'transition-crop'};
  }
  const radius=Math.hypot(...family.bounds.max.map((v,i)=>v-family.bounds.min[i]))/2;
  const depths=corners(family.bounds).map(p=>dot(pose.position.map((v,i)=>v-p[i]),back));
  return {...pose,...(viewportStage?{compositionSpace:'viewport-stage'}:{}),near:Math.max(radius*.0001,Math.min(...depths)*.08),far:Math.max(...depths)+radius*2,
    compositionNDC:[-2*pose.viewOffsetNormalized.x,2*pose.viewOffsetNormalized.y],chapter:{id:selection.chapterId,index:selection.chapterIndex},
    chapterWeights:weights,studyWeight:w,sourceGeometryRevision:family.revision,fitBounds:family.bounds,
    kind:reducedMotion?'static-source-chapter':'autonomous-source-chapter'};
}
