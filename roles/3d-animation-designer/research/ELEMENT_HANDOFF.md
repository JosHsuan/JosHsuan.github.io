# Source layer animation handoff

Date: 2026-10-08. Source metadata inspected directly from `D:/JosHsuan_Website/_work/bending-active-thesis/round-02/geometry/source-layers.json`. Geometry conversion/fidelity belongs to the parent's Geometry Engineer work; this role implements the pure display-pose sampler against that explicit handoff.

The local-review derivative revision is `ff112b90be104cca7e3705b5eee481ba3973d25e2f3d4a7350faa2f732cae47e`; its source revision is `c12ca628488a4449ea587965410d7df6baa815b36397c8344e2e14a3f533b14c`. It contains the intact shell, 13 lower source solids in group 78 and 37 upper source solids in group 77. Source-relative coordinates and existing intersections are preserved. These names describe display layers; they do not establish a fabrication sequence or authorize inventing panel groups.

## Binding

`components/element-score.mjs` exports `SOURCE_LAYER_REVISION` and `sampleElementPose(stageU, {reducedMotion})`. Check the derivative revision before binding. The returned object includes:

```js
{
  modelRevision,
  separationWeight,
  offsets: {
    shell: [0, 0.24 * separationWeight, 0],
    'base-lower': [0, 0, 0],
    'base-upper': [0, 0.09 * separationWeight, 0]
  },
  boundsPadding: {min: [0, 0, 0], max: [0, 0.24 * separationWeight, 0]},
  caption
}
```

Offsets are world metres in the exported Y-up frame. Apply them to cached source rest positions, never cumulatively. Do not alter mesh vertices, scale, rotation, normals or source alignment. The parent scene binding remains the one transform writer.

At Motion Designer's shared chapter centres `(index + .5)/7`, the weights are `[0, 0, 1, .7, 0, 0, 0]`: complete object through FORM; full display separation through SYSTEM; partial separation through PATTERN; exact rejoin by the MAKE hold; rest through VALIDATION and CREDITS. Linear interpolation consumes the already-eased stageU, with no second timing curve or animation loop. Reduced motion returns all zero offsets.

While separated, display the caption **Source layers · display separation, not a construction sequence**. At rest the caption is **Source layers · original placement**. No simulated bending, stress, calibration or construction order is implied.

## Framing envelope

Source combined bounds are `[-1.38373486328125, -0.008087958335876465, -1.6362088623046875]` to `[1.24108056640625, 0.7248569269180298, 1.7275496826171874]` metres. At maximum display separation, maximum Y becomes `0.9648569269180298`; X/Z and minimum Y remain unchanged. Cinema must check this expanded envelope. Scene Designer's presentation ground stays below the fixed lower base; it must not follow the lifted shell or become a substitute base.

## Evidence and limits

Run `node --test roles/uiux-designer/cases/bending-active-thesis/tests/story-response.test.mjs roles/uiux-designer/cases/bending-active-thesis/tests/element-score.test.mjs`. All 17 tests pass: eleven response tests and six source-layer choreography tests. The latter cover exact rest chapters, actual known node IDs and offsets, stationary shared holds, MAKE rejoin, reversible drift-free binding, source-based maximum bounds, reduced motion and finite input handling.

These checks prove the sampler's choreography and numerical envelope. They do not independently prove Rhino conversion fidelity, camera coverage, visibility, material identity or final aesthetic quality. Those require the Geometry Engineer's source comparison and the actual integrated scene review.

The subsequent [integrated browser matrix](../../motion-designer/verification/ROUND_02_INTEGRATION.md) passed 28 groups on the final local artifact. It verifies the actual three nodes, 50 distinct base source IDs, separation and exact return, seven holds and responsive fallback behavior. Source-conversion fidelity remains a separate Geometry Engineer responsibility.
