/** Authored exterior-camera scores, 26 October 2026.
 * These are editorial views of unchanged source geometry, not simulations.
 * Targets stay at verified bounds centres; renderers retain exact source fit,
 * safe reading apertures and sole camera ownership. Native scroll is the input.
 * No timer, automatic motion policy, source mutation or rendering is owned here.
 */
const freezeKeys = keys => Object.freeze(keys.map(key => Object.freeze(key)));
const project = keys => freezeKeys(keys.map(([chapter,progress,yawRad,pitchRad,fovDeg,zoom]) => ({chapter,progress,yawRad,pitchRad,fovDeg,zoom})));

export const GENERIC_PROJECT_CAMERA_KEYS = Object.freeze({
  // Low assembly silhouette -> elevated rotary-cut relationships -> opposite side.
  'mode-s-of-making': project([
    ['context',0,-.35,.12,42,1.18], ['context',.20,-.35,.12,42,1.18],
    ['context',.75,.55,.48,36,1.04], ['system',0,1.05,.72,32,1.00],
    ['system',.55,1.90,.32,40,1.06], ['system',1,2.25,.18,38,1.16],
  ]),
  // Tall folded installation: low elevation, rising oblique, top/support relation.
  'entrance-installation-art': project([
    ['context',0,-.55,.10,44,1.14], ['context',.25,-.25,.20,42,1.06],
    ['system',0,.85,.50,34,1.00], ['system',.62,1.65,.70,32,1.04],
    ['system',1,2.15,.22,42,1.16],
  ]),
  // Recorded points remain a whole path: crane reads depth, never a solid crop.
  'dot-based-3d-printing': project([
    ['system',0,-.40,.16,42,1.16], ['system',.18,.10,.24,40,1.08],
    ['system',.52,.85,.82,32,1.00], ['system',.82,1.60,.40,38,1.04],
    ['system',1,2.10,.20,42,1.14],
  ]),
  // Patterned shade: silhouette -> upper opening -> opposite surface silhouette.
  // Photographed caustics remain the evidence, not these editorial studio views.
  'hc3dp-caustics': project([
    ['context',0,-.60,.12,44,1.18], ['context',.35,-.20,.24,40,1.10],
    ['system',0,.70,.72,31,1.00], ['system',.55,1.55,.42,36,1.04],
    ['system',1,2.25,.18,44,1.18],
  ]),
  // Reciprocal members: whole curve -> elevated overlaps -> complementary side.
  // Member identity and placement never become an invented assembly chronology.
  'special-assemblies': project([
    ['context',0,-.55,.18,42,1.16], ['context',.55,.15,.38,38,1.04],
    ['system',0,.85,.82,32,1.00], ['system',.60,1.65,.45,36,1.02],
    ['system',1,2.30,.20,42,1.12],
  ]),
});

// Method is the only XR chapter with a source model. Screen recordings retain
// their frontal, complete projection: their interface is the important subject.
export const XR_METHOD_CAMERA_KEYS = freezeKeys([
  [0,-.40,.18,44,1.18], [.18,.02,.30,40,1.08], [.50,.88,.72,32,1.00],
  [.82,1.75,.40,38,1.06], [1,2.20,.22,44,1.16],
].map(([at,yawRad,pitchRad,fovDeg,zoom]) => ({at,yawRad,pitchRad,fovDeg,zoom})));

// Additive Bending angles are composed before each source-family's exact fit.
// Source-absent Make/Validation remain neutral; no geometry is forced to appear.
export const BENDING_SCROLL_ORIENTATION_KEYS = freezeKeys([
  [0,0,0], [.5,16,6], [1,26,12], [1.5,46,24], [2,12,14], [2.5,-30,26],
  [3,-48,12], [3.5,-18,22], [4,0,0], [6,0,0], [6.5,14,4], [7,0,0],
].map(([chapter,azimuthOffsetDeg,elevationOffsetDeg]) => ({at:chapter/7,azimuthOffsetDeg,elevationOffsetDeg})));
