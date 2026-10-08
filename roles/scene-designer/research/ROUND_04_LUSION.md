# Round 04 — From authored light to source inspection

Date: 2026-10-08. Roles: Lighting Designer / Scene Designer. Baseline audited: `c8b658b`. The owner authorized collaborative Lusion/Lusion Labs research, review, implementation and release of the Bending-Active presentation. This role owns its research, a pure inspection-lighting score, the existing exhibition-stage binding and focused tests. The integrator owns UI, controller, the sole final camera writer, public build and deployment.

## Primary-source research

Only official Lusion pages, their linked official experiments and the `lusionltd` GitHub organization were used. Search results included clones and reverse-engineered repositories; none were adopted as evidence or code. Reference imagery is not a website asset.

| Primary source | Verified observation / declared implementation | Transfer to this case |
| --- | --- | --- |
| [Lusion Labs](https://labs.lusion.co/) | Direct isolated-browser inspection at 1440×960 showed a light atmospheric field, restrained navigation, Grid/List controls and large experiment cards. A wheel event brought the Akari card forward while the introductory heading receded; captured `window.scrollY` stayed zero. | Give an experiment an explicit entry and a focused viewing surface, with controls subordinate to the object. This observation does not justify replacing our native document scrolling. |
| [AKARI](https://akari.lusion.co/) | The live scene displayed dark letterforms, colored luminous strips and a compact row of experiment selectors. Its own information text explicitly identifies 2D light tracing, jump-flood-generated distance fields and 2D ray marching. | Light can be an understandable subject of interaction. Our translation is manual light direction and named studies on the real mesh, not AKARI's renderer, graphics, UI or undisclosed implementation. |
| [ION/X1](https://exp-ion.lusion.co/) | Official page text introduces an aluminium product study, an explicit Change Material control and a custom-finish section; it also clearly labels the product conceptual. This role read the official page but did not visually exercise its material control. | A bounded object experiment can follow a narrative. For this real thesis, keep the appearance authored and clearly separate light studies from physical material claims. |
| [Of The Oak](https://lusion.co/projects/of_the_oak/) | Lusion describes a web companion to a physical installation and a custom compressed/instanced tree pipeline. | Source and context should govern representation. That tree-specific optimization is not evidence that our perforated source mesh can be reduced without a separate fidelity study. |
| [Atlas Motion](https://lusion.co/projects/atlas_motion/) | Lusion explicitly describes selective WebGL and visual pacing around a manufacturing story. | Keep live 3D where viewing the object adds information; let photographs and reading dominate evidence chapters. No machinery, fabrication context or technical result is invented for our setting. |
| [Oryzo BTS, Part 2](https://blog.lusion.co/oryzo-bts-part-2-7-3d-design-and-motion-graphics) | Lusion's authors explain why they combined rendered splats, simpler textured surfaces and an interactive material view instead of using one representation everywhere. They identify their production tools and specific workflow decisions. | Select the representation for the question being answered. Our exact mesh remains useful for geometry/light inspection; existing photographs remain the physical evidence. No splat pipeline or procedural microstructure is required here. |
| [Oryzo BTS, Part 3](https://blog.lusion.co/oryzo-bts-part-3-7-website-ux-ui-and-illustrations) | The authors place the product at the center and explain restrained interface decisions around richer imagery. | A small inspection control set is preferable to another decorative dashboard. Borrow the decision principle, not the desk, typography, props or jokes. |
| [Official WebGL-Scroll-Sync](https://github.com/lusionltd/WebGL-Scroll-Sync) | MIT demo documents one-Canvas/native-scroll synchronization and an overscan tradeoff. The role's earlier pinned reference is `d2f2c844b449878c760e3f435ab01c85ed5ee072`. | Our fixed background scene and modal inspection do not need DOM-anchored overscan. Retain one Canvas and existing native-scroll semantics; do not add a library or render extra pixels without a demonstrated problem. |

The browser-control runtime failed twice during initialization with a host sandbox-helper error. A bounded, isolated Playwright session then visited only the official Labs and AKARI pages, took opening/wheel captures and closed the browser. Four images were opened directly. AKARI's first screenshot still showed its 100% loading screen; the later screenshot showed the live experiment. Pointer movement, time and a wheel event were not isolated from each other, so this review does not claim an exact pointer-to-light algorithm. No experiment control, minigame, phone experience or browser compatibility was certified.

Research captures and the extracted visible text/link record are private working evidence under `D:/JosHsuan_Website/_work/bending-active-thesis/round-04/lighting-scene/research/`. No copied reference image, shader or Lusion asset enters the release. The official organization does not supply a generic scene/light framework for this feature; its coaster-model release is unrelated to the thesis. No new skill, MCP, renderer, network dependency or global configuration is needed.

## Baseline architecture and cost assessment

At `c8b658b`, the source has 172,789 vertices and 227,521 triangles; these remain over the earlier source-geometry budget. The authored set adds 324 triangles, three Full mesh draws or one Light mesh draw, two LTC area lights, and no extra shadow maps. Its four shared LTC data arrays total 196,608 CPU bytes; that number is not measured GPU memory.

The recorded Round 03 FORM comparison at 1440×1000 / DPR 1 submits 10 calls and 455,368 triangles with diffusion off, versus 12 calls and 455,372 triangles with it on. Those figures include source shadow and output passes, not just original mesh triangles. Full uses a linear RGBA16F/depth target with two requested MSAA samples and, when diffusion is enabled, two quarter-resolution passes. The approximate target formula in the current compositor gives 53,280,000 bytes at that size with allocated diffusion targets; physical driver allocation, other resources and phone performance are separate. Turning diffusion off skips its passes but does not necessarily free previously allocated targets.

The important design deficiency is ownership, not a missing effect: the existing stage group follows camera yaw and contains the area lights. Rotating a view therefore also rotates its principal highlights. That is appropriate for the authored story's controlled composition but unsuitable for comparing a material or opening under fixed illumination. Inspection must fix light directions to the source frame while keeping the camera's ownership independent.

Other bounded architecture observations:

- The existing World writer updates the one directional shadow map on every Full render. A later cache could key shadow updates to source offsets, light transforms, quality and shadow parameters; camera-only orbit should not automatically change a fixed source light. This role does not implement that cache or claim a measured speedup.
- A hidden source still leaves the exhibition/compositor path available in evidence chapters. An explicit future render-activity policy could skip settled invisible enhancement work while leaving DOM reading active. Do not infer savings from opacity alone.
- Inspection's DOF, ASCII, mist and veil should all be zero. The comparison should hold material, exposure, geometry and camera constant while changing light, rather than adding a second simultaneous renderer or another postprocessing pass.

## Two visible feature proposals and decision

| Feature | User action and visible result | Interface and cost | Decision |
| --- | --- | --- | --- |
| Source light study | Enter inspection from Form/System; choose Studio, Raking or Silhouette, and move a bounded lamp-azimuth control. Broad light describes the whole form; grazing light exposes actual folds/openings; silhouette isolates the actual outer contour and holes. Orbiting changes the view relative to a fixed source light. | One pure light score, the existing two area lights and directional rig. No new mesh, render target, shadow map, source texture or asset. Inspection skips optical effects. Silhouette is a contour view, not a material-quality test. | Selected by the team; this role implements the light score and source-frame stage binding. |
| Original / source-layer presentation | In the same inspection surface, compare original placement and the verified shell/upper-base/lower-base display separation, use named views, then return to the exact story state. The stage datum and lighting remain fixed while the source layers move. | Existing three source nodes and known offsets only, with the camera fitted to a fixed maximum-separation envelope. No mesh copy, invented parts, bending solver or construction sequence. Full source draw cost remains; UI and motion state are owned elsewhere. | Selected as the companion feature. Scene role supplies the invariant original-bounds lighting/stage constraint; Motion/Cinema/Integrator own the controls and view. |

A new decorative room, more glowing geometry, SSR, environment recapture and volumetric smoke were not selected. They would increase cost and ambiguity without answering a new source question. Source photographs remain the physical reference; neither selected feature establishes structural behavior or measured illumination.

## Cross-role review and ownership agreement

The Scene/Lighting review identified the camera-following-lamp problem and sent it directly to Cinema/Artist and Motion. Cinema/Artist agreed that fixed source-frame lighting is required for meaningful BRDF observation. They distinguished Silhouette from material inspection, requested a constant PBR finish and zero DOF/ASCII/mist, and required the existing shadow key to follow the same selected light direction. Motion confirmed an existing-tick state model with no independent lamp timer; presets apply immediately, numerical controls use the shared response, and Reduced motion preserves direct user choices.

The integrator accepted the three presets, bounded azimuth in degrees `[-70, 70]`, one final writer and a `scene.background` handoff for Silhouette. The stage keeps its view-conditioned geometry if needed, but inverse set-yaw transforms keep inspection lamps fixed in source coordinates. No second light updater or camera controller is introduced. On exit, the same stage restores the original story behavior.

## Implemented contract

`components/inspection-lighting.mjs` exports:

```js
sampleInspectionLighting({preset = 'studio', azimuth = 0})
```

It returns the complete existing `sampleSceneDirection` schema plus:

- `stage.lightFrame: 'source'`: area positions are source-radius offsets from the **original combined center**, rather than the story set's base datum and camera-facing frame.
- `stage.surfaceVisible`: true for Studio/Raking and false for Silhouette; the lamp objects remain present so the light count stays stable.
- `backgroundColor`: a linear RGB gray for Silhouette, otherwise null. The integrator applies it to `scene.background` and restores the previous/null background on exit.
- `inspection`: preset, clamped lamp azimuth, a concise reading purpose and `measuredLighting: false`.

The sampler has no Three dependency, camera input, story progress, clock, material mutation or automatic reduced-motion override. Invalid presets and nonfinite azimuth fail explicitly. New samples own their arrays. All colors are linear RGB, consumed without a second sRGB conversion.

Studio uses a broad 2.3×1.6-radius area key, low fill and low HDR contribution. Raking uses a narrow 0.26×1.75-radius area key from a much lower source-relative direction, with reduced fill/IBL. Their directional shadow keys point along the same respective source ray. These are artistic study settings, not measured fixtures or surface diagnostics.

Silhouette sets all existing light and IBL intensities to zero, hides the editorial surfaces/practicals and hands off a plain gray background. The source material has no emissive contribution; its actual geometry therefore supplies the contour and holes without rewriting albedo, normals, indices or source-base appearance. Exposure/material remain the integrator's fixed values. The sampler marks its key `castShadow: false`; the integrator owns the final shadow policy.

`exhibition-stage.mjs` now recognizes `stage.lightFrame`. It cancels the camera-facing set yaw for the lamps, translates them around the original source center, and keeps their emitting faces aimed at that center. It suppresses story light-sweep motion in inspection, including Full. Manual light changes still work under Light and Reduced. Studio/Raking show one existing stage mesh; Silhouette shows none. No light object is recreated between presets.

Root mapping from Motion's state is:

```js
const direction = sampleInspectionLighting({
  preset: inspection.value.preset,
  azimuth: inspection.value.lightAzimuth,
});
```

Root resolves stage bounds from original metadata, applies/restores the background, disables inspection optical effects, and remains the final property writer. This role did not edit the controller, CinematicScene, material, camera or compositor.

## Module verification and limits

Node 24.19.0 executed `node --test` for `inspection-lighting.test.mjs`, `exhibition-stage.test.mjs` and `scene-direction.test.mjs`: **18 passed, zero failed/skipped**. Six new groups verify the broad/grazing distinction, lighting-only silhouette schema, bounded azimuth rotation, identical world-space lamp positions and emitting directions across full camera orbit, Full/Light/Reduced manual-control parity, deterministic samples and exact return to the story's camera-relative stage. The prior 12 stage/score groups still pass.

These checks establish source-frame causality and module lifecycle, not integrated modal behavior. The first built images were subsequently inspected as recorded below. View/light independence in a live comparison, shadow correspondence, exact story restoration, touch/keyboard/focus, and static/failed-WebGL paths still require the integrator's built-artifact checks. The baseline geometry/transfer overruns and lack of physical-phone measurements remain. No build, commit or deployment was performed by this role.

## First built inspection review — 2026-10-08

This role directly opened all six existing images in `case/verification/round04/`: desktop at 1440×1000 and mobile at 390×844, with the same three-quarter view, original placement and zero light azimuth. No new browser or GPU workload was launched for this review. These are the first integration captures, before the integrator's subsequent Silhouette header-contrast and disabled-light-angle fixes; those fixes are not visually certified by these images.

| Preset | Observed result on desktop and mobile | Acceptance / limit |
| --- | --- | --- |
| Studio | The complete assembly, actual shaped base, large openings and perforations remain visible. Broad reflections describe the shell's source surface, while the dark continuous setting stays subordinate. No bright artificial disc, detached horizon or luminous stage bar competes with the source. | Accepted as the default inspection light. The source surface's rippled appearance remains visible; this is not evidence of a measured material finish. |
| Raking | The same pose becomes visibly darker, with localized bright facets across the front/lower shell and cooler relief on the right. Low fill produces a useful comparison against Studio without adding diffusion or changing the geometry. | Accepted as a comparative study. The rear shell and actual base approach black, especially at phone size; retain Studio as the default whole-assembly reference. This is not a new blocker or a reason to brighten every preset equally. |
| Silhouette | The actual shell and base form a black silhouette against a plain light gray field. Both the large negative spaces and small perforations remain readable. Editorial floor and practicals are absent. | Geometry/background relationship accepted. The first-build white heading and orange eyebrow have weak contrast on the gray field, and the visible light-angle control has no effect in a zero-light preset. The integrator reports both UI issues fixed; rebuilt evidence is still required. |

No stage or light-code change was needed after this review. The mobile control panel is shown scrolled to its lower controls; these still images do not establish complete panel navigation or focus behavior. Likewise, a preset comparison at one fixed view and azimuth does not alone establish that orbit leaves the lamps fixed or that moving the azimuth control visibly moves reflections. The source-frame tests establish the transforms; actual interactive causality remains a separate integration check.

The integrator now reports a shadow cache that updates the existing 1024 map only when source/lamp/frame/detail state changes, rather than on camera-only orbit. Reported current FORM study counters are 5 calls / 227,843 submitted triangles for settled Studio, 8 / 455,364 for the first Raking update, and 4 / 227,523 for Silhouette; program variants changed from 7 to 9 around the shadow variant. These are integration counters supplied by the integrator, not independent timings or physical-phone performance measurements. They supersede the Round 03 counts only for these specific inspection states; the baseline figures above remain historical evidence. No additional shadow map was introduced.

Capture identities, SHA-256:

```text
desktop-studio.png     ae8e04079785e9c0812505129de93cf78d1a977cc79d5c7c8aacb032d02e0b37
desktop-raking.png     87dc8fc4a472245d9ab580c47e5e7ffef51a98d0a4adbbc9925e5c9ffb2be020
desktop-silhouette.png 9e7a137bf5760689747614ae0ec89db36804395750b568afd7c798ca0cabc71a
mobile-studio.png      1a0e1ccad9281d56ac40f5e2365ec5f6dc9ea58c2596c477ebc59e91ba47cb1e
mobile-raking.png      70031cc127bcebf562bcf0d99f42c1488f1a1648080f277444eb3a785b352c5c
mobile-silhouette.png  8433f2890ebbafd097e55a5c29d5a74dfa799c1b3dd81b183dbc1c0bc7db7f86
```
