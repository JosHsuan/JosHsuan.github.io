# Round 02 — optical attention and editing

Role: Animation Cinematographer. Date: 8 October 2026, Europe/Berlin. This is a local Bending-Active revision contract; the previous 4182 comparison desk remains historical evidence of techniques, not evidence of their new integration.

## Role and timing

Cinema now owns shot composition, focal length, axial focus and reversible editorial transitions. A separate Editor is not needed: one seven-chapter scene benefits from the same author arranging framing and its cuts. The 3D Artist implements the image passes; the Director coordinates the overall layer graph. New lighting, scene, animation and motion roles retain their own property ownership.

The Motion Designer supplies `{ nativeU, visualU, stageU, energy, direction, dwellWeight }`. `nativeU` describes immediate semantic document position; the controller alone damps `visualU`; authored chapter entry/hold/exit remapping produces `stageU`. Cinema samples this shared state and does not smooth it again. Fine-pointer tilt is composed at the end; it never selects a focus subject or edit. Inputs are reversible and there is no wall-clock-only cut.

## Preferred adapter contract

```js
sampleOpticalScore({ stageU, energy, dwellWeight, aspect, reducedMotion }, pose, landmarks)
// Returns data; never writes a camera or starts an animation loop.
{
  lens: {
    filmGaugeMm: 35,
    focalLengthMm,       // lens convention, not calibrated historical photography
    focusDistanceM,     // dot(focusPoint - cameraPosition, cameraForward)
    apertureScale,      // artistic gather strength, NOT a physical f-number
    maxBlurPx           // radius in render-target pixels, not CSS pixels
  },
  edit: { kind, veil },  // none | focus-bridge | veiled-cut | match-dissolve
  layers: { asciiWeight, contourWeight }
}
```

The final camera writer sets aspect, `filmGauge = 35`, then `setFocalLength(focalLengthMm)` and its composition view offset. Do not write a second independent FOV. Three defines film height as `filmGauge / max(aspect, 1)`, so lens millimetres cannot be derived using an assumed 24 mm image height at every viewport. Match a desired FOV through the actual film-height convention when mobile requires reframing. Reset `zoom = 1` unless the score intentionally models digital zoom.

Focus uses the camera-forward dot product, clamped to a valid positive depth between near/far planes. Assembly and base landmarks must come from their verified exported coordinates. A valid named base is required before planning a base-to-shell rack. Use an inspected assembly depth plane when a small component cannot be identified; do not invent a fastener landmark.

## Initial seven-chapter direction

These are authored starting ranges for the integrated visual review, not camera-calibration facts or proof of acceptance. The final score must retain its actual tuned values.

| Chapter | Photographic operation | Initial lens / focus | Editorial purpose |
|---|---|---|---|
| Overview | Quiet low three-quarter hero, then open the image optically | 52 → 43 mm; short front-shell → assembly-centre focus pull; maximum 5 px blur | Separate an initial surface impression from the complete subject. |
| Form | Stable whole assembly and real base | 40 mm; assembly centre, deep focus / 0–1 px blur | Make the object and its support legible without a continual orbit. |
| System | Small dolly with compression; hold the frame while attention shifts | 45 → 58 mm; inspected near shell → centre; 4–6 px blur in a brief bridge, sharp reading hold | Relate method evidence to the object without blurring the evidence itself. |
| Pattern | Close, oblique material study; sparse geometry-derived ASCII | 62 → 70 mm; inspected near surface, 2–4 px maximum peripheral blur | Read openings and repeated members, not fabricated stress. |
| Make | Reveal source base and rigid explanatory separation, then settle | 42 mm; base centre → shell centre; 0–3 px blur | Tie object support and staged construction explanation to source photography. |
| Validation | Match a whole-object composition; clear optics | 42 → 39 mm; assembly centre, blur 0 | Let real prototype evidence carry the result. |
| Credits | Whole source assembly plus base, still ending | 43 mm; deep focus, blur 0 | End with the actual subject and readable attribution. |

Use a short `focus-bridge` for Overview → Form, a subtle veiled composition change for System → Pattern, and a match in subject placement for Make → Validation. A veiled cut changes pose only when its decorative scene veil covers the change; body text is never flashed or hidden. The veil is a bounded triangular/smooth envelope in progress, so backward scrolling reproduces it. For fast jumps seek directly to the correct story state; do not replay every skipped cut. Avoid rapid bright/dark repeated transitions.

Do not use motion energy as an uncontrolled lens wobble. At most use it to cap blur/veil during the intended short transition. Within long reading holds the camera, lens and focus settle. Changing focal length alone is intentionally represented separately from dolly translation; their visible difference must survive review.

## Optical implementation decision

The installed Three `BokehPass` performs an additional scene render using packed depth and its `BokehShader` gathers 41 color samples. The existing Cinema engine already demonstrates a one-scene-render `DepthTexture` with a 17-sample bounded gather. Prefer adapting that path for this page: one HDR color/depth target, one composite pass, zero per-frame pixel readback. Read the 3D Artist [compositing contract](../../../3d-artist/research/round-02/COMPOSITING_CONTRACT.md) from the repository role hierarchy (or locate that exact repository path).

Depth-aware gather is an image approximation. It can bleed at silhouette discontinuities and cannot reconstruct hidden geometry, lens aberration or physical bokeh. CSS blur of the Canvas does not satisfy this contract. Default maximum radius should remain modest and effects should fade out before still evidence holds. Reduced motion uses sharp, still optics and disables the edit veil.

## Verification required in the actual case

1. Compare two fixed-camera lens settings: world position/target unchanged, focal length and subject image size differ.
2. Compare near and far focus planes at the same pose: depth values stay fixed while region sharpness changes appropriately. Include the real base when exported and visible.
3. Inspect all seven chapter holds, short bridges, abrupt forward jumps and reverse travel at desktop and mobile widths.
4. Confirm one camera writer, one controller clock, no camera FOV overwrite after focal length, correct near/far depth linearization and no per-frame React state.
5. Inspect actual pixels, no-JS/static paths, live reduced-motion changes, context loss and idle frames. Record measured pass costs and device limitations separately from visual acceptance.

## Primary sources

- [Three PerspectiveCamera](https://threejs.org/docs/pages/PerspectiveCamera.html): focal length/film gauge and view offsets, checked against installed 0.186.1 source.
- [Three BokehPass](https://threejs.org/docs/pages/BokehPass.html) and [pinned implementation](https://github.com/mrdoob/three.js/blob/9b4a2ac29c63ccb43fd51c5661f2f873ac2c39b8/examples/jsm/postprocessing/BokehPass.js): actual depth pass and focus semantics.
- [Pinned BokehShader](https://github.com/mrdoob/three.js/blob/9b4a2ac29c63ccb43fd51c5661f2f873ac2c39b8/examples/jsm/shaders/BokehShader.js): perspective depth conversion and 41-sample gather.
- Local `src/review/engine.jsx`: existing original HDR/depth gather implementation, not new case evidence.

The role skill is original instruction text, not a copied upstream skill. No editor dependency, DCC server or new MCP server is needed for this extension; the existing opt-in Cinema tooling and actual browser testing cover its operations. Installed-source hash verification is shared in `roles/3d-artist/research/round-02/source-verification.json`.

## Runtime handoff after role establishment

The shared case adapter is now implemented as `components/optical-score.mjs` with flat fields rather than the proposed nested record. It derives the focal-length baseline from the actual source-framed pose and applies bounded chapter ratios; the initial millimetre ranges above remain design starting points. A scene-only dip is implemented, accurately labeled `scene-dip`; it is not a claim of a hard camera cut. Actual Chromium/WebKit depth-focus fixture evidence is recorded in [the adapter checks](../../../3d-artist/research/round-02/RUNTIME_ADAPTER_CHECKS.md). The adapter is integrated with the actual source shell/base and shared scene score. [Image review](../../../3d-artist/research/round-02/VISUAL_REVIEW.md) records seven chapters at four widths plus focused post-build checks; physical-device performance remains unverified, and the final page behavior matrix is recorded separately.
