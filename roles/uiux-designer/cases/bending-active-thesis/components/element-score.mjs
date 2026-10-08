// Original display choreography for the three verified source-derived layers.
// These are rigid world-metre offsets from cached rest transforms, never a
// bending simulation, fabrication order, panel split or source alignment fix.
export const SOURCE_LAYER_REVISION = 'ff112b90be104cca7e3705b5eee481ba3973d25e2f3d4a7350faa2f732cae47e';
const DISPLAY_CAPTION = 'Source layers · display separation, not a construction sequence';
// Shared Motion score centres: overview, form, system, pattern, make, validation, credits.
const SEPARATION = [0, 0, 1, 0.7, 0, 0, 0];

/**
 * Consume the already-eased stageU. Apply each offset to a cached rest position;
 * never add it cumulatively. The parent is the only mesh-transform writer.
 */
export function sampleElementPose(stageU, {reducedMotion = false} = {}) {
  if (typeof stageU !== 'number' || !Number.isFinite(stageU)) throw new TypeError('Element stageU must be finite.');
  let slot = Math.max(0, Math.min(6, stageU * 7 - 0.5));
  const nearest = Math.round(slot);
  if (Math.abs(slot - nearest) < 1e-12) slot = nearest;
  const from = Math.floor(slot), to = Math.min(6, from + 1), blend = slot - from;
  const separationWeight = reducedMotion ? 0 : SEPARATION[from] + (SEPARATION[to] - SEPARATION[from]) * blend;
  const shellLift = 0.24 * separationWeight;
  const upperLift = 0.09 * separationWeight;
  return {
    modelRevision: SOURCE_LAYER_REVISION,
    separationWeight,
    offsets: {
      shell: [0, shellLift, 0],
      'base-lower': [0, 0, 0],
      'base-upper': [0, upperLift, 0],
    },
    // Conservative envelope addition; use per-layer bounds + offsets for an
    // exact live box. Camera acceptance must also cover the full 0.24 m lift.
    boundsPadding: {min: [0, 0, 0], max: [0, shellLift, 0]},
    caption: separationWeight > 0 ? DISPLAY_CAPTION : 'Source layers · original placement',
  };
}
