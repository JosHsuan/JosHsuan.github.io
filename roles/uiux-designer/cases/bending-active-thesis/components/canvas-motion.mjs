// The controller owns one viewport-scale scene plane. Its chapter trigger and
// held screen pose are independent of the information anchors moving past it.
// This module owns no DOM, camera, renderer, dimensions, RAF or clock.
export const CANVAS_CHAPTERS = Object.freeze(['overview', 'form', 'system', 'pattern', 'make', 'validation', 'credits']);
export const CANVAS_SCENE_PROBE = .62;
export const CANVAS_ENTRY_SECONDS = 1.1;
export const CANVAS_EXIT_SECONDS = .95;
const clamp = value => Math.max(0, Math.min(1, value));
const smooth = value => {const t = clamp(value); return clamp(t * t * t * (10 + t * (-15 + 6 * t)));};

function validate({anchors, docY, viewport, forcedChapter}) {
  if (!Array.isArray(anchors) || anchors.length !== 8 || anchors.some((n, i) => !Number.isFinite(n) || i > 0 && n <= anchors[i - 1])) {
    throw new RangeError('Canvas holds require eight strictly increasing finite chapter boundaries.');
  }
  if (!Number.isFinite(docY)) throw new RangeError('Canvas document position must be finite.');
  if (!viewport || !['width', 'height'].every(key => Number.isFinite(viewport[key]) && viewport[key] > 0)) {
    throw new RangeError('Canvas holds require a finite positive viewport.');
  }
  if (forcedChapter !== undefined && forcedChapter !== null && !CANVAS_CHAPTERS.includes(forcedChapter)) {
    throw new RangeError('Forced Canvas chapter must be a known chapter id.');
  }
}

/** Pure target sampler. anchors are eight natural document chapter boundaries;
 * docY is supplied by the existing reading controller. Information reveal and
 * aria-current keep their own policy: do not replace them with this probe.
 * forcedChapter is reserved for explicit source inspection/navigation, never
 * the current information chapter on every tick. No DOM aperture is accepted.
 */
export function sampleCanvasHold(options, seekHold = null) {
  validate(options);
  const {anchors, docY, viewport, forcedChapter, reducedMotion = false, hold = false} = options;
  const focus = docY + viewport.height * CANVAS_SCENE_PROBE;
  let index = 0;
  while (index < 6 && focus >= anchors[index + 1]) index++;
  if (forcedChapter !== undefined && forcedChapter !== null) index = CANVAS_CHAPTERS.indexOf(forcedChapter);
  const chapter = CANVAS_CHAPTERS[index], span = anchors[index + 1] - anchors[index];
  const start = anchors[index] - viewport.height * CANVAS_SCENE_PROBE, end = start + span;
  const entry = Math.min(span * .18, viewport.height * .45);
  const exit = index === 6 ? 0 : Math.min(span * .20, viewport.height * .50);
  const holdStart = start + entry, holdEnd = end - exit;
  // A history/navigation seek may land in a transition band. Its useful still
  // becomes the nearby hold boundary, so the first real scroll cannot flash.
  const sameSeek = seekHold?.chapter === chapter;
  const entryEnd = sameSeek && seekHold.band === 'entry' ? Math.min(holdStart, seekHold.docY) : holdStart;
  const exitStart = sameSeek && seekHold.band === 'exit' ? Math.max(holdEnd, seekHold.docY) : holdEnd;
  const phase = clamp((docY - start) / span);
  let x = 0, y = 0, opacity = 1, mode = 'hold';
  if (chapter === 'make' || chapter === 'validation') {
    x = -viewport.width * 1.08; opacity = 0; mode = 'absent';
  } else if (!(reducedMotion || hold || forcedChapter !== undefined && forcedChapter !== null)) {
    if (docY < entryEnd) {
      const arrival = smooth((docY - start) / Math.max(.001, entryEnd - start));
      x = (1 - arrival) * viewport.width * .22;
      y = (1 - arrival) * viewport.height * .035;
      opacity = arrival; mode = 'entry';
    } else if (exit > 0 && docY > exitStart) {
      const departure = smooth((docY - exitStart) / Math.max(.001, end - exitStart));
      x = -departure * viewport.width * 1.08;
      y = -departure * viewport.height * .05;
      opacity = 1 - departure; mode = 'exit';
    }
  }
  const visible = opacity > 0 && x < viewport.width && x + viewport.width > 0 && y < viewport.height && y + viewport.height > 0;
  return {chapter, index, phase, start, end, holdStart, holdEnd, x, y, scale: 1, opacity, visible, mode};
}

export function createCanvasMotion() {
  return {chapter: 'overview', index: 0, phase: 0, x: 0, y: 0, scale: 1, opacity: 0, visible: false,
    settled: true, mode: 'absent', initialized: false, sceneDocY: 0, nativeDocY: 0,
    direction: 1, reverseTravel: 0, pose: {x: 0, y: 0, opacity: 0}, transition: null, request: null,
    sequence: 0, events: [], seekUntilInput: false, seekHold: null};
}

const held = () => ({x:0,y:0,opacity:1});
const outside = direction => direction > 0 ? {x:-1.08,y:-.05,opacity:0} : {x:.22,y:.035,opacity:0};
const absent = chapter => chapter === 'make' || chapter === 'validation';
function event(state,status,reason){
  const request=state.request;
  if(request)state.events.push({id:request.id,chapter:request.chapter,target:request.target,status,reason});
}
function begin(state,kind,direction){
  state.transition={kind,elapsed:0,duration:kind==='entry'?CANVAS_ENTRY_SECONDS:CANVAS_EXIT_SECONDS,
    from:{...state.pose},to:kind==='entry'?held():outside(direction)};
  state.mode=kind;state.settled=false;
}
function reconcile(state){
  const request=state.request;
  if(state.chapter!==request.chapter){
    if(state.pose.opacity>0){if(state.transition?.kind!=='exit')begin(state,'exit',request.direction);return;}
    state.chapter=request.chapter;state.index=CANVAS_CHAPTERS.indexOf(state.chapter);
    state.transition=null;
    state.pose=outside(-request.direction);
  }
  if(request.target==='hold'){
    if(state.pose.opacity!==1||state.pose.x!==0){if(state.transition?.kind!=='entry')begin(state,'entry',request.direction);}
    else {state.transition=null;state.mode='hold';state.settled=true;}
  }else{
    if(state.pose.opacity>0){if(state.transition?.kind!=='exit')begin(state,'exit',request.direction);}
    else {state.transition=null;state.mode=absent(state.chapter)?'absent':'exit';state.settled=true;}
  }
  if(state.settled&&!request.completed){request.completed=true;event(state,'completed');}
}

/** Scroll chooses a discrete intent. Only caller-owned active seconds advance
 * the fixed-duration passage; wheel magnitude and scroll distance never do.
 * A superseding chapter leaves the current scene before the latest one enters.
 * Semantic seek/Reduced choose a useful still; resume only rebases the clock.
 * Events are a drainable per-update outbox, not an autonomous timer or bus.
 */
export function advanceCanvasMotion(state, dt, options = {}) {
  validate(options);
  if (!state || !Number.isFinite(state.sceneDocY) || !Number.isFinite(state.nativeDocY)) throw new TypeError('A Canvas motion state is required.');
  if (!Number.isFinite(dt) || dt < 0) throw new RangeError('Canvas motion delta must be finite nonnegative seconds.');
  const {docY, viewport, reducedMotion = false, seek = false, resumed = false, paused = false} = options;
  state.events=[];
  const changed = docY !== state.nativeDocY;
  if(changed){
    const delta=docY-state.nativeDocY;
    if(Math.sign(delta)===state.direction)state.reverseTravel=0;
    else {state.reverseTravel+=Math.abs(delta);if(state.reverseTravel>=12){state.direction=Math.sign(delta);state.reverseTravel=0;}}
  }
  if (changed) state.seekUntilInput = false;
  if (seek) state.seekUntilInput = true;
  const natural=sampleCanvasHold({...options,reducedMotion:false,hold:false});
  const forced=options.forcedChapter!==undefined&&options.forcedChapter!==null;
  const snap=!state.initialized||reducedMotion||seek||forced;
  let target=absent(natural.chapter)?'away':!snap&&state.request?.chapter===natural.chapter&&!changed?state.request.target:'hold';
  // Arrival starts once at the chapter boundary. Direction reversals inside a
  // shoulder can request a return, but repeated scroll samples cannot restart it.
  if(!snap&&!state.seekUntilInput&&changed&&natural.chapter===state.request?.chapter&&!absent(natural.chapter)){
    if((docY>natural.holdEnd+12&&state.direction>0)||(docY<natural.holdStart-12&&state.direction<0))target='away';
    else if(state.request.target==='away'&&((docY>natural.holdEnd-12&&state.direction>0)||(docY<natural.holdStart+12&&state.direction<0)))target='away';
  }
  const key=natural.chapter+':'+target;
  if(state.request?.key!==key){
    if(state.request&&!state.request.completed)event(state,'cancelled','superseded');
    state.request={id:++state.sequence,key,chapter:natural.chapter,target,direction:state.direction,origin:docY,completed:false};
    event(state,'requested');
  }
  state.nativeDocY = docY;
  state.sceneDocY = docY;
  state.initialized = true;
  if(snap){
    state.chapter=natural.chapter;state.index=natural.index;state.transition=null;
    state.pose=absent(state.chapter)?outside(state.direction):held();
    state.mode=absent(state.chapter)?'absent':'hold';state.settled=true;
    if(!state.request.completed){state.request.completed=true;event(state,'completed',seek?'seek':reducedMotion?'reduced':'still');}
  }else{
    reconcile(state);
    // The director explicitly marks suspension/resume and renderer waits. A
    // delivered foreground frame can take over one second on a software GPU;
    // discarding every such delta would leave the request open indefinitely.
    let remaining=!paused&&!resumed?dt:0;
    while(state.transition&&remaining>0){
      const transition=state.transition,step=Math.min(remaining,transition.duration-transition.elapsed);
      remaining-=step;
      transition.elapsed=Math.min(transition.duration,transition.elapsed+step);
      if(transition.duration-transition.elapsed<1e-10)transition.elapsed=transition.duration;
      const p=smooth(transition.elapsed/transition.duration);
      for(const key of ['x','y','opacity'])state.pose[key]=transition.from[key]+(transition.to[key]-transition.from[key])*p;
      if(transition.elapsed===transition.duration){state.pose={...transition.to};state.transition=null;reconcile(state);}
    }
  }
  // Geometry metadata follows the actually displayed chapter while an old
  // scene finishes leaving. Camera fitting and backing size remain untouched.
  const geometry=sampleCanvasHold({...options,forcedChapter:state.chapter,hold:true});
  for(const key of ['phase','start','end','holdStart','holdEnd'])state[key]=geometry[key];
  state.x=state.pose.x*viewport.width;state.y=state.pose.y*viewport.height;state.opacity=state.pose.opacity;
  state.visible=state.opacity>0&&state.x<viewport.width&&state.x+viewport.width>0;
  return state;
}
