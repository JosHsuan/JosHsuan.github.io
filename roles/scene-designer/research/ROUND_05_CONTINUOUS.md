# Round 05 — Light and setting within continuous reading

Date: 2026-10-08. Roles: Lighting Designer / Scene Designer, with director critique. Baseline read: `fc29c62`. **Status: the initial proposal below is preserved as discussion history; the subsequent adopted decisions and module verification are recorded at the end. Integrated visual acceptance is still pending.**

The owner accepts the research but asks for one continuous interactive page: the model study should belong to natural scrolling, and information, photographs and text should share damping, acceleration, holds and spatial feedback. The integrator owns final interface decisions, typography, runtime integration and release. This role has read the current public software and role guidance only; it has not opened private source files or run a browser/GPU workload in this round.

## What the current code establishes

- `CinematicExperience.jsx` advances one analytical response during the story, but immediately branches to an independent inspection state and returns while the modal is active. This interrupts the shared reading progression by design.
- `editorial-score.mjs` explicitly sets `bodyShift: 0`; heading/media offsets are small decorative transforms. Native section attention, progress and semantic links advance separately from the delayed scene. This is a good previous reading safeguard, but does not fulfill the owner's new request for visibly coordinated content movement.
- `CinematicScene.jsx` selects story or inspection camera, light score, source separation and optics. Inspection changes the stage-layout bounds to the original metadata. It sets a gray `scene.background` or restores the previous background with no blend.
- `exhibition-stage.mjs` uses camera-relative area lamps in the story and source-fixed lamps in inspection. Its stage surface has a boolean visibility switch. The background set may follow camera yaw without implying a real architectural room, but moving the lamps with the view is unsuitable for a light comparison.
- The current shared story score already supplies unequal holds, reverse traversal and a single eased `stageU`. The existing key shadow is cached from source placement, lamp position and framing data. These useful foundations should survive; a second scroll library, timer, renderer or copy of the model is unnecessary.

The earlier [Round 04 research](ROUND_04_LUSION.md) remains valid as primary-reference evidence. Its modal implementation is a dated design decision, not the required Round 05 interaction. No new Lusion algorithm or implementation claim is made here.

## Proposed continuous sequence

The chapter labels describe the reading purpose, not additional routes or modes. Exact hold intervals and camera composition belong to Motion/Cinema; the following is a proposed lighting sequence to evaluate together.

| Passage | Proposed visible light/stage action | Reading reason and constraint |
| --- | --- | --- |
| Overview → Form | A restrained warm/cool opening resolves to the broad Studio rig. The actual source base remains legible. | Establish the whole assembly before isolating its surface. No opening reset or model-study launch action. |
| Form hold → System | The broad key lowers and narrows continuously while fill/IBL decrease. Known source-layer display separation can progress on the same score. | Light reveals the source's folds and openings while the real base retains the coordinate frame. Light origins and floor do not follow the lifted shell. |
| System → Pattern | The Raking state evolves across a limited source-relative azimuth, then can resolve to a short contour reading against a light field. | A different question becomes visible: surface relief, then actual negative spaces. Full silhouette is a contour study, not a material or structural test. It requires a composition where relevant openings remain visible. |
| Pattern → Make | Restore readable key/fill before the camera yields to fabrication imagery; soften the contour field back to the authored setting continuously. | Do not use blackout to hide a camera jump. Documentary image pixels retain their own unfiltered, readable plane. Cinema alone decides whether the source leaves the frame. |
| Make → Validation → Credits | Quiet broad illumination where the source appears, subordinate to evidence; a complete assembly can close the story. | The scene cannot claim fabrication sequence or validation from the light effect. There is no return/reset path because reading never left the page. |

If a true silhouette conflicts with the chosen Pattern camera or the reading palette, keep a bounded contour interval at a source-readable pose rather than force a full-page pale flash. The meeting must select this placement; it is not settled by the table.

## Proposed blending and ownership contract

### One coordinate and one lamp frame

Motion should expose one visible-reading coordinate derived from its caller-owned response. The same coordinate feeds foreground planes, model/camera, source separation and the light score. The existing `stageU` already contains the authored hold and transition ease: lamp samplers interpolate once, without another smoothstep, spring, elapsed-time loop or scroll remapping.

Use **source-frame lights throughout this revised story**, not a boolean camera-relative/source-relative handoff. The source center and stage floor come from the original combined metadata; the existing maximum-separation envelope may provide a constant shadow-frustum extent. The backdrop may retain its view-conditioned orientation. The final World writer translates all sampled lamps and targets; Scene does not become a camera owner. Cinema must assess the revised actual reflections along its camera path before acceptance.

Finite light positions, intensity, linear RGB color, area size, environment intensity and haze interpolate between authored keys. Choose paths that keep area lamps outside the source envelope; a normalized direction interpolation or an authored intermediate key avoids a lamp passing through the object. Do not normalize intensity or animate exposure to conceal a change. The source finish stays fixed through a light comparison.

### Numeric stage/background transitions

The former `surfaceVisible` and `backgroundColor: null` choices cannot be the continuous visual interface. Proposed fields extend the complete direction score with numeric `stage.surfaceOpacity` and a defined linear background color. The current transparent stage material can consume surface opacity; only skip its draw after its contribution is effectively zero. Practical radiance can similarly reach zero without creating/removing fixtures. The original source base is never part of this stage fade.

The light field and illumination must overlap in time: establish a readable field before extinguishing the final contour-facing light, and recover the light before removing the field on exit. Do not create a zero-light/black-background interval or an abrupt light/dark theme switch. Exact curves belong to one authored score and reverse with it.

Prefer keeping the pale contour field within the work's available negative space. If the integrator uses a full scene clear-color transition, essential text and controls need their own stable contrasting surface across **every intermediate value**, not only dark/light endpoints. Photograph pixels remain unfiltered. A heading that must swap ink colors needs a tested handoff at a protected reading state; brightness-based improvisation is not sufficient.

### Optional inline adjustments

An inline light-angle or source-layer control may enrich a Form/System hold, but it must not freeze scrolling or own a new render loop. A bounded user target is advanced by the existing tick and multiplied by a shared `studyEnvelope` that fades through the surrounding authored entry/exit. Outside its region its influence is zero; the user's value remains stored so reverse traversal does not unexpectedly reset it.

Preset buttons, if retained, set numeric target weights rather than change the renderer's mode. Convex weights for Studio/Raking/Contour sum to one; the score resolves them into one existing rig. No duplicate lamps, crossfaded model copies or second render target are needed. Discrete controls respond immediately, while the shared caller owns any transition of their visual values. Whether to retain these controls at all is the integrator's interface decision; scrolling alone must deliver the full explanation.

### Information, text and image feedback

The new request applies to content as well as decoration. A shared visual reading-plane compensation can make information, images and text respond to the same damping as the source. Measure chapter anchors in untransformed document coordinates; do not feed transformed rectangles back into progress. Keep section layout and focus targets in the native document and apply authored transforms to a bounded inner visual plane.

Spatial pitch/depth and acceleration accents should return to an aligned readable plane during each hold. Paragraphs must remain selectable and available immediately; there is no opacity gate that makes readers wait for a tween. A focused control needs stable geometry. Reduced motion removes compensation and perspective; anchor navigation, history restoration, focus, resize and visibility resume require an explicit seek/catch-up policy rather than a replay of hidden travel. Motion owns numerical limits and recovery behavior; these are review constraints, not a second motion implementation.

Protected scene-effect rectangles must describe the **final visible** text/media positions after the transform is applied. That screen-space measurement is separate from the untransformed anchors used to derive progress. Mixing the two spaces would cause self-referential scrolling or an effect mask that trails its content.

## Performance and lifecycle contract

- Reuse one source instance, one Canvas, the existing directional/hemi rig, two area lamps, stage meshes, compositor and single 1024 key shadow map. No stage texture, reflection capture, depth copy, new postprocessing pass or new renderer package is proposed.
- A changing source-relative key or source separation legitimately requires fresh shadow work during that transition. Settled holds and camera-only changes should reuse the cached caster map. A backdrop that receives but does not cast shadows is not a reason to rebuild the caster map merely because the backdrop turns.
- Keep the Full shadow/light shader configuration stable across the contour passage where feasible. Intensity may reach zero without removing the lamp or switching its shadow program on every boundary. Light quality retains the same authored directional relationship with its existing reduced rendering cost.
- DOF/ASCII/mist can fade toward zero as the geometry-reading influence reaches one, under Cinema/Artist ownership. Skipping zero-strength passes is useful; it does not prove that previously allocated targets were freed. Keep one tone/color output path and fixed exposure.
- The existing demand loop stops when scroll response, inline values and pointer feedback settle. Hidden time is not replayed. No animated light or DOM transform may keep an idle page ticking just to maintain a visual effect.
- The full source triangle/transfer budget overrun remains. This proposal adds no new source geometry, but continuous illumination can cause more shadow updates than a static inspection hold. Do not treat historic draw counters as a Round 05 GPU-timing result or claim a physical-phone performance guarantee.

## Required meeting decisions and later acceptance

The Lighting/Scene proposal was sent directly to Motion, Cinema/Artist and the integrator before any runtime change. Pending decisions are the exact shared reading fields, the contour interval and camera, the background/DOM contrast solution, and whether optional inline adjustments remain useful. Source-frame lighting, numeric continuity and single ownership are the proposed constraints, not a unilateral rewrite of other roles' modules.

After interface agreement and implementation, acceptance should include continuous forward/reverse scans through every light/state boundary, finite values, source-center/floor invariance across separation, no lamp-frame jump, and complete recovery after fast jumps/resume. Actual desktop/mobile images should cover intermediate blends as well as holds, verify light-angle causality and protected text/media, and check that the real base remains the source base. Root's integrated checks must exercise native keyboard/touch/focus, no dialog/scroll lock, reduced/static/failed-WebGL reading, shadow-cache behavior and idle settlement. None of those Round 05 runtime results is claimed in this proposal.

## Adopted meeting decisions and implementation

The integrator subsequently authorized implementation of `inspection-lighting.mjs`, `exhibition-stage.mjs` and their focused tests. Cinema owns `CinematicScene.jsx` integration and camera blending; Motion/root own reading and inline input state. No Scene/controller/material/camera file was edited by this role.

- **Source-frame lamps across the entire revised story were accepted.** All light weights use the original combined center and ground datum. The integrator/Cinema retain a fixed maximum-separation shadow envelope without moving the illumination target with the shell. There is no frame-basis blend or camera-following hotspot during inspection.
- **Form Studio → System/Pattern Raking → quieter Make was accepted.** Cinema rejected a forced pale-field silhouette inside Pattern because its macro crop cannot show the complete outer contour. Root selected one inline Form surface with Studio/Raking only; System retains authored source-layer separation. The proposed silhouette/background crossfade is therefore deferred rather than claimed implemented. Reading colors stay stable.
- **One visible-reading coordinate was accepted as the shared source of progress.** Motion proposes `visualDocY`, pixel velocity/acceleration, `visualU`, `stageU` and `readingShiftY`; root binds the final foreground plane. Lighting consumes `stageU` without another temporal response. It does not modulate comparison light intensity with scroll acceleration.
- **Numeric preset transition was made explicit.** A string preset alone would jump when the study weight is already one. Root advances a local numeric Studio/Raking target on the existing tick and passes `inspection.lightMix`; the light sampler consumes that value as `studyMix`. Semantic labels may respond immediately. This role adds no state, event listener or spring.

The exported interface is:

```js
sampleContinuousLighting(stageU, {
  reducedMotion: false,
  studyWeight: 0,          // caller-owned continuous study envelope
  studyPreset: 'studio',  // endpoint fallback only
  studyMix: undefined,    // caller-owned 0 Studio .. 1 Raking; overrides fallback
  lightAzimuth: 0,        // finite degrees, clamped to -70 .. 70
})
```

The result remains a complete scene-direction record with `stage.lightFrame: 'source'`, `stage.surfaceOpacity: 1`, constant `backgroundColor: null`, stable key-shadow configuration and base emphasis one. Scalar intensities, area dimensions and linear RGB interpolate once. Lamp directions interpolate after normalization while radial distance interpolates separately: a test caught a straight chord bringing an extreme rim-light mix inside the source sphere, and this path rule corrects it without another easing curve. Shadow key/rim rays and corresponding area-light rays stay aligned. The optional study overlay is not sampled when its weight is zero.

The continuous sampler rejects Silhouette explicitly; the former `sampleInspectionLighting` export and its historical tests remain for compatibility, not as an active continuous-page feature. Reduced reading selects the stable Studio base, while deliberate inline values still change the study. No material, exposure, source geometry or measured-lighting claim is added.

The stage now binds a numeric `surfaceOpacity` to its existing gallery and practical materials. Visibility becomes a zero-contribution optimization only, and the old boolean input remains a compatibility fallback. The approved Studio/Raking page keeps opacity at one throughout; supporting a numeric channel does not mean a new silhouette fade is visible in this revision. Lamp count, geometry count, ownership and disposal are unchanged.

## Scoped module verification

Node 24.19.0 ran `continuous-lighting.test.mjs`, `inspection-lighting.test.mjs`, `exhibition-stage.test.mjs` and `scene-direction.test.mjs`: **25 passed, zero failed/skipped**. Seven new groups cover chapter endpoints, reversible once-eased interpolation, continuous study/preset mixing, finite lamp paths outside the original source sphere and aligned shadow rays, source-fixed world positions across camera orbit, numeric stage opacity without resource replacement, reduced/direct interaction and independent immutable samples. The 18 historical light/stage groups remain unchanged and passing.

The tests use public normalized bounds, not private CAD. They establish module contracts, not the final look, frame timing, DOM compensation, camera framing or live shadow behavior. Those remain the integrator's build/visual checks; this role has performed no Round 05 build, browser capture, commit or deployment.
