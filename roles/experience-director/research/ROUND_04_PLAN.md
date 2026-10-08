# Round 04 — Lusion research, architecture review and model study

Date: 8 October 2026. Baseline: public commit `c8b658b`. The owner requests all-role research into Lusion and Lusion Labs, a development plan and architecture discussion, further Bending-Active implementation, then categorized commits, push and Pages deployment. This plan extends the earlier optional-interaction contract for the selected public case. The original seven-chapter reading route remains usable independently of the new mode.

## Primary evidence and feature map

| Reference | Evidence / limitation | Transfer to this case |
| --- | --- | --- |
| [Lusion](https://lusion.co/) | Official project pages describe integrated design, motion and real-time storytelling. The current homepage was read; earlier first-round browser observations remain dated evidence. | Give spatial imagery a purpose within the research narrative. |
| [Lusion Labs](https://labs.lusion.co/) | Fresh Chromium DOM/anchor inventory and rendered opening inspected. GRID/LIST and B/W controls are exposed. The opening capture is mid-transition, not a contrast benchmark. | Explicit, discoverable modes and a clear way back; do not copy its loader, custom scrolling or assets. |
| [Atlas Motion](https://lusion.co/projects/atlas_motion/) | Official account describes selective WebGL and deliberate pacing for a manufacturing story. | Keep the factual article primary, offer deeper spatial inspection on demand. |
| [Of The Oak](https://lusion.co/projects/of_the_oak/) | Official account describes a physical-installation companion and a compressed instanced tree pipeline. A fresh live-page read exposed navigation/intro/cookie UI only; tree interaction was not verified by that capture. | Connect the digital object to source evidence; its compression result is specific to that tree pipeline, not a transferable performance promise. |
| [Synthetic Human](https://lusion.co/projects/synthetic_human/) | Official account describes real-time asset optimization and procedural animation from a Houdini workflow. | Separate immutable source geometry from authored presentation; do not invent a bending solver or production pipeline. |
| [Choo-Choo World](https://labs.lusion.co/exp/choochoo) | Official Labs article was read through the rendered DOM. It documents track building, day/night choice and train palette options; this reading is not a completed play-through. | Make controls visibly change a coherent scene and offer recovery. Our light study changes actual illumination, not the source object. |
| [WebGL-Scroll-Sync](https://github.com/lusionltd/WebGL-Scroll-Sync) | Official MIT example explains native-scroll/rAF drift and the overdraw cost of a padded moving canvas. | Retain one fixed background canvas; the new explicit mode freezes document reading instead of creating DOM-anchored moving WebGL labels. No new scroll hijacking or extra canvas. |

Specialists extend this map with official Labs experiments, lighting/material references and their own direct observations in the [artist/cinema](../../3d-artist/research/ROUND_04_LUSION.md), [lighting/scene](../../scene-designer/research/ROUND_04_LUSION.md) and [motion/animation](../../motion-designer/research/ROUND_04_LUSION.md) notes. Observation, source-author description and our design inference are distinguished. Reference code/assets are not copied into the release.

## Cross-role meeting and decisions

| Role | Critique / proposal | Adopted resolution |
| --- | --- | --- |
| Experience Director | The current score is visually authored but passive; another global effect adds little understanding. | Optional model-study mode with meaningful actions and exact return to reading. |
| UIUX Designer | A drag-only viewer would hide functionality and disrupt mobile reading. | Visible view presets/ranges, labeled lighting choices, separation control, Reset/Return, native dialog/focus and no gesture interception outside the study surface. |
| 3D Artist | Changing exposure/material while comparing lamps hides causality. | Same satin PBR and exposure across all studies; sharp optics, no ASCII/DOF/mist. |
| Animation Cinematographer | Variable live bounds would make the layer slider unexpectedly dolly the camera. | Fixed maximum-separation fit envelope; bounded orbit, no pan/zoom, neutral entry and restored story pose on exit. |
| Geometry Engineer / root review | Supplied layers are shell and two groups of real base solids, not inferred fabrication panels. | Reuse exact source-relative offsets and checksum-approved GLB. No deformation, decimation, inferred part splitting or stress colors. |
| 3D Animation Designer | Reduced-motion story sampling forces separation to zero and would break manual inspection. | Extract a shared deterministic separation function; manual controls remain meaningful with immediate updates in reduced motion. |
| Motion Designer | A second animation loop or OrbitControls writer would compete with the story. | Pure target/value/velocity state advanced by the existing tick, with explicit mode ownership and idle settlement. |
| Lighting Designer | Existing camera-following lights would follow orbit and weaken the user's ability to read changing highlights. | Source-fixed inspection lamps; studio, grazing/raking and silhouette studies with stable exposure. |
| Scene Designer | A new showroom or background asset adds weight without solving the comparison. | Reuse the existing sweep and lights; silhouette uses a simple luminous background with the stage hidden, not modified source albedo. |

The specialists exchanged these criticisms directly before implementation. No additional role is needed: the existing nine responsibilities cover the identified work. Root performs UIUX/director integration and the geometry/source audit; specialist agents cover artist/cinema, light/scene and motion/animation.

## Implementation contract

1. **Optional entry and recovery.** FORM and SYSTEM expose model-study links. Without JavaScript they open the actual-model poster. With enhancement, a native dialog holds reading position, preserves focus and temporarily gives the existing scene an unobstructed area. Return/Escape restores the same scroll position and focus. Failed loading preserves a poster and an operable exit.
2. **Explicit inspection state.** `inspection-state.mjs` owns bounded targets and damped values; React owns discrete dialog state. Existing rAF calls the pure advance function. Numeric values stay out of per-frame React state. Named views are Front, Three-quarter and High; azimuth −40°…100°, elevation 12°…70°; separation 0…1; lamp angle −70°…70°.
3. **One final scene writer.** `CinematicScene` selects the story or inspection pose, applies source-relative layer offsets, chooses lighting and renders once. `inspection-camera.mjs` returns a pose fitted to the measured normalized study rectangle. It never mutates the camera. No new camera controls, model instance, renderer or route.
4. **Causal lighting.** `inspection-lighting.mjs` supplies the existing direction schema. The stage cancels camera yaw for inspection lamps while keeping its backdrop usable. Three deliberate presets reuse the same light objects. Parent restores background/environment/fog/visibility on return. Optical effects are disabled in the study; source PBR, positions/normals and exposure stay unchanged.
5. **Evidence and delivery.** Pure tests cover state/time/reversal/geometry/light-frame invariants. Actual-source projection covers control extremes and responsive view rectangles. Built-browser tests cover entry, direct control, drag, keyboard, reset, exit, reduced motion, Light, no-JS/failure and idle/resources. Review actual desktop/tablet/mobile images, then pin runtime hashes and extend the release allowlist. Run framework checks and exact-commit CI before manually deploying the tested Pages artifact; verify the live site.

## Render review corrections

The first built desktop/mobile review found that the fixed AABB fit left too much empty space on phones. Cinema and geometry review replaced its empty corners with 514 full-precision convex support vertices from the approved public GLB at original and maximum separation. The camera still fits the entire fixed slider envelope with a 3% margin and retains the original bounds for target and clip planes. The explicit preparation script reads only the public release, writes to the D: preparation workspace first and pins the source SHA; it does not run during builds or alter geometry. All 105 actual-source projection cases passed again. The same review corrected silhouette header contrast, disabled the ineffective lamp-angle control in silhouette, and added drag-capture recovery on close, blur, hidden page or model failure. Source-fixed shadow maps are cached until source placement or light state changes.

## Further development backlog

These are explicit future candidates, not claims of implementation in this revision: source-anchored measured annotations after anchor authority exists; a documented method-to-evidence comparison with no solver implication; lossless geometry compression after independent decoded position/normal/index verification; optional authored audio with provenance and mute controls. GPU particles, fluid simulation, WebGPU migration, imported Lusion assets and decorative cursor trails do not currently solve a demonstrated thesis-reading need. Real-device timing is still required before a mobile performance guarantee.
