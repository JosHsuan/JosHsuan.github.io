# Round 05 — One continuous reading and source composition

Date: 8 October 2026. Baseline: `fc29c62`. Roles: 3D Artist, Animation Cinematographer and geometry review. The owner corrected the previous optional-modal direction: the intended work is one continuous interactive page, with information and the source model sharing damping, acceleration and deliberate reading holds. The Round 04 research and source preparation remain valid; its separate dialog and suspended-story behavior are superseded for this case.

## Critique and cross-role resolution

The old controller returned early while inspection was active. Consequently the model study and the article were separate motion states. In the ordinary story, several information channels still followed native section position while the camera followed the damped score. Increasing camera or material effects would not resolve this mismatch.

Motion Designer and root now own one visible reading coordinate and its shared tick. The DOM reading plane compensates native travel; scene and editorial scores sample the same visible coordinate. Measurements of natural chapter anchors must stay outside their own transformed feedback loop. The actual clear study rectangle and optical exclusion rectangles are read after presentation transforms. Cinema consumes this result directly and adds no clock, scroll response or camera smoother.

Lighting Designer and Cinema agreed to use source-fixed lamps throughout the narrative. FORM carries the broad studio study, SYSTEM/PATTERN carry grazing light, and evidence chapters quiet the source. A full pale silhouette was removed from the inline choices: PATTERN is deliberately a macro composition, while changing the entire background and foreground contrast would create another competing transition. Studio and Raking preserve source material, exposure and a stable background. Their numeric mixture is advanced by the existing controller tick.

The single inline manual study lives in FORM. SYSTEM retains its authored source-layer separation. Native reading never locks; scrolling away reduces the manual contribution, and scrolling back retains the selected view. The compact View / Layers / Light controls are root-owned DOM. The original supplied positions, normals, indices and three source-layer identities remain unchanged.

## Camera and scene contract

`sampleInlineStudyPose({storyPose, weight, bounds, framingSupport, aspect, azimuth, elevation, viewport})` extends the existing pure fitter. The controller owns `inspectionWeight` from the clear inline slot, plus the bounded study values and normalized clear rectangle. The boolean `inspectionActive` is diagnostic/UI state; Scene no longer uses it to select a second camera mode.

- At weight zero, the resolved story pose is preserved exactly. Its FOV already includes the story's optical focal-length ratio.
- During entry/exit, the camera's target, distance, shortest azimuth path, elevation, projection scale and view offset compose continuously. No additional easing is applied. These intermediate frames are explicitly permitted to crop the source.
- At weight one, the 36-degree study lens fits the fixed original-plus-maximum-separation source support with three-percent inset. Applying another lens multiplier after this fit is prohibited by the binding contract.
- Source separation is a continuous combination of the authored layer score and the user's source-layer value. One transform writer always applies the result to cached rest positions.
- Lights and the stage keep original source bounds. The shadow envelope covers maximum separation. Layer movement therefore does not drag the light target or presentation floor.
- DOF, ASCII, mist and the diagnostic veil attenuate with one minus study weight. Full study is sharp. The existing compositor remains the single display output; no additional render target or source draw is introduced by this integration.
- World remains the only final camera writer and the only source-transform writer. The existing demand loop wakes from shared input and can settle at idle.

The source SHA remains `ff112b90be104cca7e3705b5eee481ba3973d25e2f3d4a7350faa2f732cae47e`: 172,789 vertices, 227,521 triangles, 51 source objects grouped into shell/base-lower/base-upper. The checked-in 514-point convex support is reused without regeneration or quantization. No private CAD or unapproved source was read.

## Verification checkpoint

Seven camera unit/projection groups pass. They cover exact reversible endpoints, the effective optical lens, no input mutation, clipped-slot transitions and the original full-source proof. The latter projects every actual GLB vertex for five aspect ratios, seven named/extreme views and three separation values: 105 cases and 18,142,845 projected vertices. All retain the required viewport inset and valid depth; the source checksum remains unchanged. Another 420 transition cases use all 514 verified support points to check finite projection and depth while the inline slot changes from 20 to 44 percent of viewport height. Intermediate full-frustum containment is deliberately not asserted as source evidence.

The five browser tests in `tests/pages/model-inspection.spec.mjs` were rewritten for inline behavior: one Canvas/GLB and real layer placement; continued wheel reading and reversible choice persistence; keyboard/mouse bounds, touch scrolling and causal source-fixed lamps; explicit Reduced activation and Light; and load/context failure, pointer-capture release and idle. Syntax is checked. Built-browser execution and visual acceptance are pending the root's integrated build at this checkpoint; this document does not claim new rendered evidence or real-device performance.

The [Round 04 official-source research](ROUND_04_LUSION.md) remains the dated source register. This round makes an original integration decision from the owner's correction and inspected repository behavior, not a claim about Lusion's private production implementation.
