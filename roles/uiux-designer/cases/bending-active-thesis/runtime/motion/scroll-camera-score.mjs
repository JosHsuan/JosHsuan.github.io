/** Pure camera intent, not source fitting or a camera writer.
 * Yaw/pitch are radians; FOV degrees; zoom is a positive fit multiplier.
 * Adapters own native reading anchors, clocks, pause snapshots and final fitting.
 */
const TAU = Math.PI * 2;
const clamp = value => Math.max(0, Math.min(1, value));
const finite = (value, name) => {
  if (!Number.isFinite(value)) throw new RangeError(`${name} must be finite`);
  return value;
};
const preparedPaths = new WeakSet();
const EMPTY = Object.freeze({});
function pose(value) {
  finite(value?.yawRad, 'yawRad'); finite(value?.pitchRad, 'pitchRad');
  finite(value?.fovDeg, 'fovDeg'); finite(value?.zoom, 'zoom');
  if (!(value.fovDeg > 1 && value.fovDeg < 175 && value.zoom > 0)) throw new RangeError('Invalid camera lens or zoom');
  return value;
}
const angularDelta = (a, b) => ((b - a + Math.PI) % TAU + TAU) % TAU - Math.PI;

/** Validate once when loading case direction, not on every animation frame.
 * Unwrap yaw once across the complete path: shared endpoints remain numerically
 * continuous even when authored headings cross +/- PI. No topology interpolation.
 */
export function createScrollCameraPath(keys) {
  if (!Array.isArray(keys) || keys.length < 2 || keys[0]?.at !== 0 || keys.at(-1)?.at !== 1) throw new RangeError('Path requires endpoints at 0 and 1');
  const prepared = keys.map((key, index) => {
    finite(key?.at, 'at');
    if (key.at < 0 || key.at > 1 || index && key.at <= keys[index - 1].at) throw new RangeError('Keys must strictly increase');
    return {at: key.at, ...pose(key)};
  });
  for (let i = 1; i < prepared.length; i++) prepared[i].yawRad = finite(prepared[i - 1].yawRad + angularDelta(prepared[i - 1].yawRad, prepared[i].yawRad), 'unwrapped yawRad');
  for (const key of prepared) Object.freeze(key);
  Object.freeze(prepared); preparedPaths.add(prepared);
  return prepared;
}

/** Reversible C1 segment joins; no overshoot and no velocity/history dependency.
 * For reduced motion callers request static=true: nearest authored pose, not a
 * continuously scrubbed camera. Pause freezes the caller's last presented pose.
 */
export function sampleScrollCamera(path, progress, {static: staticPose = false} = EMPTY) {
  const u = clamp(finite(progress, 'progress'));
  if (!preparedPaths.has(path)) throw new RangeError('A prepared path is required');
  let index = 0;
  while (index < path.length - 2 && u > path[index + 1].at) index++;
  const a = path[index], b = path[index + 1];
  const local = clamp((u - a.at) / (b.at - a.at));
  const t = staticPose ? Number(local >= .5) : local * local * (3 - 2 * local);
  return pose({
    yawRad: a.yawRad + (b.yawRad - a.yawRad) * t,
    pitchRad: a.pitchRad + (b.pitchRad - a.pitchRad) * t,
    fovDeg: a.fovDeg + (b.fovDeg - a.fovDeg) * t,
    zoom: a.zoom + (b.zoom - a.zoom) * t,
  });
}

/** Existing idle score supplies offsets; never replace activeSeconds with scroll.
 * Explicit inspection is optional caller-owned intent, not an input feature here.
 * Reduced motion removes autonomous idle, not deliberate user inspection.
 * Freeze/pause at the owning Director, retaining its last composed pose.
 */
function addLayer(output, layer) {
  output.yawRad += finite(layer.yawRad ?? 0, 'yawRad');
  output.pitchRad += finite(layer.pitchRad ?? 0, 'pitchRad');
  const fovScale = finite(layer.fovScale ?? 1, 'fovScale');
  const zoomScale = finite(layer.zoomScale ?? 1, 'zoomScale');
  if (!(fovScale > 0 && zoomScale > 0)) throw new RangeError('Camera scales must be positive');
  output.fovDeg *= fovScale; output.zoom *= zoomScale;
}
export function composeCameraIntent(main, {idle = EMPTY, inspection = EMPTY, reducedMotion = false} = EMPTY) {
  pose(main);
  const output = {yawRad:main.yawRad, pitchRad:main.pitchRad, fovDeg:main.fovDeg, zoom:main.zoom};
  if (!reducedMotion) addLayer(output, idle);
  addLayer(output, inspection);
  return pose(output);
}

/** Compositor-only 2D handheld; not a 3D orbit or parallax simulation. */
export function sampleHandheldSurface(activeSeconds, gain=1){
 finite(activeSeconds,'activeSeconds');finite(gain,'gain');
 if(activeSeconds<0||gain<0||gain>1)throw RangeError('Nonnegative active seconds and handheld gain within [0,1] required');
 if(gain===0)return{xPx:0,yPx:0,rollRad:0};
 return{xPx:Math.sin(activeSeconds*.61)*.8*gain,yPx:Math.sin(activeSeconds*.83)*.65*gain,rollRad:Math.sin(activeSeconds*.47)*.00065*gain};
}
