# Round 03 — Sculptural exhibition and broad light

Date: 2026-10-08. Roles: Lighting Designer / Scene Designer. This implements the owner's new request for better material, changing light, black-mist transitions and freely designed presentation. [Decision 0006](../../../docs/decisions/0006-public-thesis-pages.md) governs the public asset boundary. The original CAD, source meshes, normals, triangle indices and factual story remain unchanged.

## Design decision and observed starting point

The published `live-desktop-overview.png` was opened and reviewed before this revision. Small bright patches and a very pale base competed with the metal form; the surrounding space was almost entirely an undifferentiated dark field. Round 02's recorded shadow comparison already tied some base spotting to real openings and shadows. Removing source holes or changing their normals would therefore be the wrong correction. This round reduces the busy HDR contribution and gives the surface broader light sources. The 3D Artist separately replaces the moving gold treatment with satin silver, and the integrator changes the base's presentation material to graphite.

The current designed set is a graphite exhibition field: one continuous floor-to-wall sweep and two softly feathered practical apertures. It is expressly an editorial setting, not a reconstruction of the thesis installation or its architectural context. The actual source base remains an independent pair of verified source layers above the editorial floor. The set adds 324 triangles, three mesh draws in Full and one in Light, plus two rectangular area lights and no shadow maps. Existing source geometry still exceeds the 150k-triangle starting budget; adding a small set does not resolve that overrun.

The rear sweep and apertures use a horizontal frame oriented toward the final camera position. All raised geometry stays behind the source bounding sphere; the flat floor continues under the source. The world Y datum remains fixed. This is an intentional view-conditioned studio set, not a physically fixed room. It permits negative space across chapter angles without a ceiling or side wall entering a close camera. The integrator and Cinematographer still own framing, visibility, clipping and HTML protection.

## Primary research and limits

| Source inspected | Application and limitation |
| --- | --- |
| [Three.js RectAreaLight](https://threejs.org/docs/pages/RectAreaLight.html), [r186 addon source](https://github.com/mrdoob/three.js/blob/r186/examples/jsm/lights/RectAreaLightUniformsLib.js) | Actual rectangular PBR illumination produces broad continuous responses on the metal. Initialize the existing WebGL LTC library. RectAreaLight has no shadow support; the existing directional key remains the one contact-shadow owner. Runtime stays pinned to the repository's Three 0.186.1, MIT; no dependency upgrade. |
| [LTC authors' reference implementation](https://github.com/selfshadow/ltc_code) | The installed Three addon cites this polygonal-light approximation. This is rasterized analytical lighting, not ray tracing, area-light occlusion, global illumination or a measured material response. No code or asset is copied from this repository. |
| [Drei Lightformer](https://drei.docs.pmnd.rs/staging/lightformer) | Reviewed its broad luminous-shape vocabulary and environment context. A visible emissive plane alone does not illuminate our rasterized scene. We use actual RectAreaLights, separate practical meshes and the existing HDR; no per-frame environment capture, added Lightformer dependency or competing environment writer. |
| [ARRI interview with K.K. Senthil Kumar ISC](https://www.arri.com/news-en/alexa-lf-signature-primes-and-skypanels-on-the-film-rrr) | The cinematographer discusses large soft sources and controlled illumination. Our inference is to shape surface readability with source size, direction and restrained warm/cool separation, rather than higher exposure. This does not establish measured equivalence to an ARRI fixture or a physical diffusion filter. No photographs, layouts or text excerpts are reused. |

The installed `lights_physical_pars_fragment.glsl.js` was checked directly. `RE_Direct_RectArea_Physical` uses scalar roughness in its LTC lookup, not the anisotropic roughness axes. The Artist's anisotropy can affect supported directional/environment routes; the rectangular-light response is described as broad satin shading, not an anisotropic LTC simulation.

All set geometry is original procedural code. The existing Three MIT notice remains applicable. Research pages are linked references only. The official ARRI lighting-handbook PDF search result was found, but direct retrieval timed out twice; no unread handbook text is used as implementation evidence.

## Authored chapter score

The existing shared `stageU` anchors and unequal holds remain unchanged. Values interpolate once between those anchors; this module introduces no ticker, spring or extra easing. Radiance/intensity values are artistic Three parameters, not calibrated lux or exposure measurements.

| Chapter | Broad key / narrow rim | HDR contribution | Set and reading intent |
| --- | --- | --- | --- |
| Overview | Warm broad oblique key; cool rear edge | 0.19 | Dark blue graphite sweep and an asymmetric pair of practicals establish depth around the sculptural close view. |
| Form | Widest balanced warm key and gentler rim | 0.24 | More even illumination supports the complete assembled reference. |
| System | Cooler side key and stronger rear separation | 0.17 | Clear separated source layers, narrow light signals and scene-derived decoration. |
| Pattern | Grazing narrower key; strongest cool rim | 0.16 | Close reading of actual openings, with the Artist's strongest bounded mist treatment. |
| Make | Broad warm reverse key | 0.25 | Muted practicals and graphite support the source photographs; model absence is owned by Cinema. |
| Validation | Broad neutral balanced light | 0.28 | Lowest practical brightness; documentary evidence dominates. |
| Credits | Quiet balanced warm/cool rig | 0.22 | Stable complete-source ending. |

Directional shadow-key intensities are now 0.85–1.4; the HDR is 0.16–0.28. Area-key intensity is 3.6–4.8, area-rim 3.5–8.0. Their widths, heights and positions all scale from the original combined source radius. The practical right aperture reaches at most 2.2 times its linear tint, the left uses 38% of that value, and portrait reduces both to 65%. The practical planes now have 0.18 opacity and analytic UV feather, so those radiance values are not the final composited pixel values. Practical apertures are hidden in Light/reduced motion. Broad lights remain so the silver material does not revert to the old HDR-only appearance.

The Artist owns actual scene-linear highlight diffusion with a threshold around 0.65 and a finite blur kernel. The practicals and area-lit highlights provide real scene inputs to that pass. Ordinary `FogExp2` remains only depth fog: it is not volumetric smoke or a physical black-mist filter. Lower ambient contribution creates dark negative space; the stage does not claim its wall physically blocks the environment light.

## Integration API

Canonical files are under `roles/uiux-designer/cases/bending-active-thesis/components/`:

```js
const exhibition = createExhibitionStage({bounds: metadata.bounds});
root.add(exhibition.group);

// After the sole camera writer applies the final camera pose:
const direction = sampleSceneDirection(stageU, {reducedMotion});
ground.visible = !direction.stage.exhibitionOwnsFloor;
exhibition.update({
  direction,
  camera,
  quality: detail, // 'full' or 'light'
  reducedMotion,
  lightSweep: input.editorial?.lightSweep ?? 0,
});

// This module owns its meshes/materials/LTC allocation. Do not also traverse
// its group through the parent's generic source/rig disposal helper.
exhibition.dispose();
```

Create from **original combined source bounds**, not animated separation bounds. This keeps the stage from breathing when the shell moves. The continuous exhibition floor is 1 mm below the original lowest point. The old separate plane must be hidden when `stage.exhibitionOwnsFloor` is true, avoiding a second horizon/depth layer. No generated floor replaces the actual source base. All procedural mesh names and user data identify editorial geometry.

`sampleSceneDirection` retains the existing key/fill/rim/hemisphere/ground/haze API and adds `exhibition`. The historical Round 02 catalog remains unchanged; this dated score supersedes its light-energy and stage-color endpoints. Existing `halo` and `contactOpacity` fields are retained as reserved channels, not claimed new passes.

Motion's optional signed `lightSweep` is clamped to ±1. It moves the area key at most 0.12 source radii and rim by 0.08 radii, with at most an 8% intensity lift. Light/reduced motion zero the sweep. It consumes the existing response, adds no extra clock, and settles when native input settles. Cinema owns model visibility; this stage cannot move, hide or reframe source objects.

The Three LTC addon allocates four 64×64 RGBA data arrays: two float32 and two float16, totaling 196,608 CPU bytes. Driver uploads/VRAM are separate measurements. The module shares owned LTC textures across simultaneous stage instances, preserves a pre-existing initialized library, and disposes its own allocation only when the last stage releases it. Owned geometry/material disposal is idempotent. There is no new image, font, texture download or render target in this module.

## Verification at module handoff

Executed with the installed Node 24.19.0:

```text
node --test roles/uiux-designer/cases/bending-active-thesis/tests/scene-direction.test.mjs roles/uiux-designer/cases/bending-active-thesis/tests/exhibition-stage.test.mjs
12 passed, 0 failed, 0 skipped
```

The six score groups cover dated Round 03 endpoint changes, interpolation without extra easing, finite continuity, invariant reduced-motion score, real-source bounds and invalid input. The six new stage groups cover unchanged source-bound records, bounded geometry/draw counts, rear-wall/practical containment behind the source sphere over seven chapters × five yaw directions × four aspect ratios, emitting-face direction, shared scale, quality/sweep behavior, source translation, invalid cameras, and one-time disposal across concurrent instances.

These are CPU proofs of the module contract. They do not establish rendered metal quality, clipping at every new cinematic close-up, source-text contrast, mist suitability or phone performance. The parent integrates the public build and owns actual browser/capture verification. No build, deployment, commit or source-asset mutation was performed by this role during the module handoff.

## First actual-render correction

The parent built the first combined revision and reported successful actual GPU rendering. This role opened `verification/round03/desktop-form.png` and `desktop-contact-sheet.png`. The initial separate oval apron was visibly a large hard-edged disk that competed with the source base; a gap to the detached backdrop created a false horizon. Small bright practical streaks looked incidental. Those were visual failures, despite the CPU geometry tests passing.

The corrective revision removes the apron entirely. A single connected mesh now runs from the foreground under the real source base into the curved backdrop. Its floor reflectance is 28% of the wall value, with a smooth height blend, zero metalness and analytic near/side/top feather. It receives the existing key shadow. The new floor has one datum and no disk outline. Soft practical slots replace thin streaks. Full/Light draws drop from four/two to three/one; triangle count drops from 356 to 324.

The Artist separately observed overly bright fragmented highlights. In coordination, the Overview/Form area keys were lowered from 4.8/5.2 to 3.8/4.2, and the Form rim was narrowed from 0.55 to 0.40 source radii; warm/cool distinction remains. The Artist owns its simultaneous darker, rougher silver revision. No source normal or hole was changed to conceal the issue.

All 12 CPU groups passed again after this correction. At that module handoff, the next actual build still needed to compile the two feather shader hooks and verify the continuous floor and softened practicals. The following second-build review closes the desktop stage-composition issue within its stated scope.

## Second-build desktop visual acceptance

This role directly opened the corrected full-resolution Overview, Form, Credits, Make, Make-exit and Validation captures, plus the desktop contact sheet, generated on 2026-10-08 at 13:47 local time. No browser, GPU workload or runtime change was initiated for this review. The contact sheet also shows intermediate chapter views; it is not a substitute for full-resolution inspection of every chapter.

| Inspected view | Actual observation |
| --- | --- |
| Form | The hard ellipse and detached horizon are gone. The continuous graphite field falls away gradually behind and beneath the model. The original shaped base and its thin front edge remain identifiable independently of the floor, and source perforations remain legible. Text and the lower-right stage label retain contrast. |
| Overview | The intended close crop now has a darker silver midtone with broader light transitions and fewer isolated white patches. The base remains visible around the large openings. The continuous stage introduces no competing circular outline or bright horizon behind the title. |
| Credits | The stage reads as a soft field with a restrained practical glow at upper right. The source object and base remain present, subordinate to the attribution. The left-hand part of the object is deliberately difficult to distinguish inside the text-protection gradient; Form remains the clear complete-assembly reference. |
| Make and Validation | Documentary images and reading content dominate. The model is absent in these captured holds. No leftover empty disk or luminous background structure competes with the photographs. Original photograph colors remain visible, including the blue treatment of the Validation source image. |
| Make exit | A subdued broad warm field bridges the evidence views, with no object, hard disk edge or false horizon. The source caption retains its dark backing. |

The broad area-light / darker satin-material relationship is accepted for these desktop captures. Surface rippling and mottled highlights remain visible around the source openings; this review does not call the source surface optically smooth or the material physically calibrated. The stage correction addresses presentation geometry and light balance without substituting for, deforming or flattening the real source base.

No stage blocker was found in this second-build scope. SYSTEM composition is being revised independently by the camera owner and is excluded from final framing acceptance here. This review also does not establish mobile composition, keyboard behavior, reduced-motion fallback, final artifact identity, GPU cost or a deployed result. Those remain the integrator's separate checks.

The following SHA-256 values distinguish these reviewed files from later captures that reuse the same names under the case's ignored `verification/round03` directory:

| Capture | SHA-256 |
| --- | --- |
| desktop-overview.png | `fbf75310bb5744d9efe27d530f3b4515246c93ea415ad7437b3aaa374ca34cde` |
| desktop-form.png | `5c1bfd32c4fb888d59233b902d1e02c17d298b5f07aa18fd0c8a1511e917876a` |
| desktop-credits.png | `727dbbd2f70943908c0195fad2e8889276043f9ff303f27cd88b4de14f18ea73` |
| desktop-make.png | `fbb54af3d0c043006a1d4752adc1f9ed8ea361a822da5d25611dbd37f448f629` |
| desktop-make-exit.png | `0490cfc4c68bc10a3060a396f4f4048754a47a59ec913bb576d9c46d8e4fad89` |
| desktop-validation.png | `f82619877be27c0cfdd3a1f2b781fc5e36a7b5171f26ffe34cf2a5947187ef1b` |
| desktop-contact-sheet.png | `76f6e95601eb206dcb89279b708be9ccc9cb2b04cffc454597ae1b51557e0126` |
