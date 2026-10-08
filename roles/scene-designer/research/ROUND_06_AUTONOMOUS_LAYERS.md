# Round 06 — Autonomous chapter scenes and semantic compositing

Date: 2026-10-08. Baseline: `704ba9f`. Roles: Visual Direction / Lighting / Scene / compositing implementation. Scope authorized by the owner through the integrator: chapter-owned autonomous camera/focus/light loops, an independently evolving ASCII field, softer layer transitions and source imagery that can pass in front of decorative framing while actual reading remains legible. This supersedes the earlier settled-only scene contract for this round; native scrolling still selects the reading chapter and is never intercepted.

The role read the repository and relevant role guidance, the existing shared layer contract, the installed Three.js 0.186.1 / Fiber 9.8.1 shader pipeline, and the scoped `r3f-shaders` skill. [W3C Compositing and Blending](https://www.w3.org/TR/compositing-1/#blending) supplies the alpha/compositing and named blend formulas. Installed Three tone-mapping and color-output shader chunks establish the actual output path. Our blend operates in the existing linear scene pipeline; it is an editorial translation, not a promise of pixel-identical Photoshop output or a PSD renderer.

## Cross-role decisions

- Motion owns the only autonomous playback clock. Native chapter changes start interruptible timed transitions; wheel/touch supplies a decaying tempo impulse rather than directly seeking a camera. There is no automatic chapter advance. Full visible playback continues after the reading spring settles. Pause, Reduced, hidden state and deliberate manipulation stop playback; ordinary hover does not stop it. Hidden time is not replayed.
- The agreed snapshot is `chapterWeights[7]`, `phases[7]` (or `chapters[].phase`), `activeSeconds`, `tempo` and lifecycle metadata. Interrupted transitions preserve the complete weight snapshot, not merely two chapter labels. The scene sampler owns no timer, scheduler or mutable state.
- Cinema/root remain the final camera/scene writers. Loop cues are applied **before** fitting the verified active source/support. Focus uses the final camera's axial source depths. No lens multiplier is applied after the fit. New experiments require their own verified bounds; the original thesis envelope is not assumed to fit every asset.
- Geometry/Cinema own source identity and the requested origami/surfacing, four-source system and arc/twist/saddle candidates. Representation weights in this role are unbound requests until that mapping is verified. They do not synthesize Gaussian curvature, stress colors, new source geometry or a topology morph.
- Root owns typography, rounded shadowbox DOM, source-image presentation, direct diagram interaction and the stacking order. The Canvas may cross decorative rims, but real text/photo/control cores are protected by a shader alpha exclusion. Source images retain an accessible original view under root's separately authorized presentation treatment.

## Authored chapter score

Motion's periods are 16 / 18 / 20 / 18 / 22 / 18 / 24 seconds. These are artistic loop durations, not a playback claim about a fabrication process. Every loop channel closes at its phase endpoints. Incoming/outgoing chapter results blend using the shared snapshot weights.

| Chapter | Camera / focus intention | Lighting / layer intention | Representation request |
| --- | --- | --- | --- |
| Overview | A small five-degree orbital excursion, slow outward breathing and restrained focal attention around the complete source. | Warm graphic field; slow broad-light movement and a visible rim. | One verified source view. |
| Form | Smaller orbit, stable lens and nearly sharp surface reading. | Studio illumination, weaker background glyphs and modest rim crossing. | Four verified origami/opening/bending/source-colour representations; actual asset selection belongs to Cinema. |
| System | A bounded orbit with more axial focus travel. | Grazing area light, independent moving contour bands and deeper overlap at decorative edges. | Four authored source-view slots; crossfade requests are not topology interpolation. |
| Pattern | A slightly larger local orbit and stronger focus/field activity, resolved before source fitting. | Narrow light reveals geometry while coherent glyph contours evolve independently. | Three verified experiment slots if mapped. |
| Make | Quiet camera excursion, no optical blur. | Actual photos lead; low-strength field and restrained lights remain in open margins. | A single factual reference, never a fabricated construction animation. |
| Validation | Quiet whole-source/case framing and sharp optics. | Documentary evidence remains clear; low-amplitude light and field changes. | Verified evidence, with no invented numerical result. |
| Credits | Slow complete-source motion with stable optics. | Restrained warm field and rim maintain life without hiding limitations or attribution. | One closing source view. |

`camera.distanceScale` only moves outward from its base; the bounded FOV cue is supplied before fitting. These small numeric excursions are input to Cinema's authored compositions, not a substitute for a verified complete-source or deliberate-detail framing policy.

## Exact sampler and light interface

```js
const chapterScene = sampleChapterScene(playback, {
  reducedMotion: false,
  quality: 'full',
  aspect: width / height,
  pointer: {x, y, active: true}, // signed screen coordinates; y points down
});
const direction = applyChapterLighting(baseDirection, chapterScene);
const optics = sampleOpticalScore({chapterScene, aspect}, finalPose, {bounds});
```

`sampleChapterScene` also accepts pointer `{uv: [u, v], active, strength}`, where UV has a bottom-left origin. An inactive pointer has zero interference. It does not change source identity, representation weights, semantic chapter or camera cues.

The return contains:

- `camera`: `azimuthOffsetDeg`, `elevationOffsetDeg`, `distanceScale`, `fovScale`, and an explicit pre-fit instruction.
- `optics`: `focusFraction`, bounded aperture/blur, mist strength/radius/threshold.
- `light`: `keyEnergy`, `areaAzimuthDeg`, `areaEnergy`, `rimEnergy`.
- `layers`: `foregroundMix`, `semanticFeatherPx`.
- `field`: the compositor controls described below, including caller-owned time.
- `representation.sourceSlots`: normalized per-chapter generic view weights, `evidenceBound: false` and the verified-asset-only policy.

`applyChapterLighting` returns a new complete light record. It rotates only the existing area fixtures around the source and adjusts key/area/rim energies. The directional contact-shadow key position and target stay fixed within the loop, so intensity/area-only motion need not invalidate its caster map. Chapter transitions or source changes may legitimately invalidate it. The real unshadowed area-light response plus a separate directional contact shadow is an approximation; it is not measured photography, volumetric lighting or a photometric simulation. Exposure, source material and geometry remain untouched.

Actual build-2 review found the satin bending source too dark under the older raking preset. A subsequent Round 06-only adjustment blends minimum environment intensity 0.32, directional fill 0.20 and hemisphere intensity 0.15 through the combined FORM/SYSTEM/PATTERN chapter weights. Values already above those floors remain unchanged. This preserves grazing key/rim direction, light colours and cached shadow placement while restoring readable midtones. Historical Studio/Raking/Silhouette samplers and their tests remain unchanged; the original source-colour material is not recoloured.

`sampleOpticalScore` recognizes `input.chapterScene`; its legacy branch remains for earlier tests and consumers. The new branch derives axial focus from the final pose/bounds and converts the final fitted FOV directly to focal length. It disables the older scene-only ASCII score and supplies the new independent field. Reduced motion removes field/foreground/blur/mist motion. Source evidence cores are protected separately; an interactive representation may require additional sharpness constraints from its owning role.

## Compositor controls and layer behavior

The compositor still renders one scene color/depth buffer and performs one final tone mapping/output conversion. The new field is evaluated in that existing final shader; it allocates no new texture or pass. The existing optional two quarter-resolution mist passes remain independent.

Callers can provide the following fields in `render(..., score, ...)`, or call `compositor.setFrame(controls)` before render. `setFrame` replaces its local parameter record; explicit score values and score overrides take precedence. It schedules nothing and does not request shader recompilation.

| Control | Meaning / range |
| --- | --- |
| `fieldTime` | Caller-owned active seconds, finite and bounded; it continues at a fixed camera while playback runs. |
| `fieldWeight` | New independent field opacity, clamped 0–0.65. Zero preserves legacy rendering. |
| `fieldSceneMix` | 0–1 contribution from actual rendered scene luminance/depth where a scene surface exists. |
| `fieldSurfaceGain` | Default 0.24. Attenuates glyph alpha over bright depth-bearing surfaces, gated by linear luminance `smoothstep(0.015,0.10,luminance)`. Clear pixels and near-black stage pixels retain the full independent field. This is scene coverage, including eligible stage surfaces, not a source-only object-ID mask. |
| `fieldFlow` | Two-component analytic field advection rate. |
| `fieldEnvelope` | UV center X/Y and two radii; two overlapping soft lobes avoid a rectangular video boundary. |
| `fieldPointerUv` / `fieldPointerStrength` | Bottom-left UV and 0–1 local phase/vortex interference. No source displacement. |
| `fieldBlendMix` | Four normalized weights: normal, multiply, screen, soft-light. They blend continuously. |
| `asciiCellPx` / `asciiTint` | Existing CSS-pixel glyph scale and linear RGB ink. |
| `semanticFeatherPx` | Rounded outward exclusion falloff in CSS pixels; 40–52 in the new score, legacy default 8. |
| `foregroundMix` | Zero uses legacy background behavior. Positive values enable whole-output semantic protection and continuously change the outer rim falloff. Core protection remains exactly zero at every positive value. |

The autonomous field combines two smooth travelling contour/ribbon families. It changes glyph density and shape over time without random seeds, texture noise or wheel input. The pointer warps its local phase in a bounded neighborhood. A separate soft lobed coverage mask prevents the field from becoming a rectangular wallpaper. Scene luminance/depth adds genuine visual response where source surfaces exist; outside geometry the authored signal remains visible through properly composited alpha. This is a graphic/video-like field, not a decoded source video or an engineering map.

The blend stage uses backdrop-aware source-over alpha. The glyph layer can create coverage where scene alpha was zero; one final premultiplication follows the existing tone/color conversion. Multiply/screen/soft-light affect graphic overlap with rendered color; their use does not turn the source appearance into measured evidence.

### Foreground weaving and safe masks

Root passes the final transformed bounds of essential text, real media pixels and controls as `protectedRects`; whole decorative panels/rims should not be included. Those rectangles establish fully excluded cores. Euclidean CSS-pixel distance outside a core gives circular corner contours and a smooth outward feather. It does **not** round away protection from the text core itself. The actual field envelope is independently nonrectangular.

With foreground mode requested, the mask multiplies **all final Canvas alpha**, including source geometry, focus blur, mist and glyphs. A mesh can overlap a shadowbox rim or decorative annotation plane while the copy/photo core remains unobscured. The transition between stronger and softer outer falloff does not fade core protection. Navigation stays highest in the DOM and Canvas stays pointer-inert.

No valid masks while foreground mode is requested fails closed to a transparent Canvas. `inspect().foreground.missingMasks` reports this; the integrator must restore the background stacking order rather than leave a foreground Canvas unmasked. During integration, Motion identified that the old all-rectangle overflow union could suppress almost the entire viewport. The CPU packer now merges the pair with the smallest added area until at most 16 regions remain. Every original core is fully enclosed; far-apart navigation and reading regions no longer immediately become one full-viewport rectangle. The shader/uniform budget remains unchanged. Masks alone do not change CSS stacking; root must bind both sides of this contract.

## Verification and remaining work

The scoped Node run passes **20 pure tests**, with the one optional actual-WebGL fixture skipped. Eight new tests cover periodic chapter cues, interrupted multiweight transitions, finite bounded representation requests, caller-owned pause/reduced/pointer policy, exact final-FOV preservation and axial focus, stable shadow-key placement, circular mask corners with wholly excluded cores, and independent samples. Earlier optics/material tests still pass.

The existing opt-in WebGL fixture is extended for the shader run. It checks independent field coverage with no source mesh, visible time and pointer changes, zero alpha over protected cores for both source and field, fail-closed missing masks, and unchanged pass/output-transform counts. Round 06 outputs go to `D:/JosHsuan_Website/_work/bending-active-thesis/round-06/verification/` by default; `OPTICAL_WORKDIR` can override that working destination.

The integrator then explicitly authorized an isolated GPU run before app integration. `OPTICAL_BROWSER=1` passed **8/8 groups in Chromium and 8/8 in WebKit**, with no shader compilation, console or page errors. No fix was required after those runs. In the empty-scene fixture, alpha sums were 1,968,569 / 1,968,536, time-difference sums were 3,728,784 / 3,728,745, and pointer-difference sums were 809,471 / 809,487 (Chromium / WebKit). These are byte-sample sums confirming changed pixels, not frame timings. Protected field-core alpha, protected source-core alpha and missing-mask alpha were all exactly zero in both engines. Field-only rendering retained two passes and one output transform; the previous focus and mist assertions also passed. JSON records are `autonomous-field-fixture-{chromium,webkit}.json` and `optical-fixture-{chromium,webkit}.json` in the Round 06 directory. The isolated fixture confirms GPU behavior, not final app composition or a physical-phone benchmark.

The later brightness/field-legibility adjustment passed 22 focused CPU tests, including unchanged historical inspection presets, weighted fill floors, source-frame lamps and stage resource invariants. The actual optical fixture then passed 8/8 in both Chromium and WebKit again. On the bright source fixture, the field's pixel-difference sum fell from 5,451 to 1,854 in Chromium and from 5,448 to 1,741 in WebKit. Clear-background and dark-stage output differences remained exactly zero; reading-core and missing-mask alpha remained zero. There was no extra texture, Canvas, render pass or colour/depth fetch. These records are under the Round 06 `verification/legibility/` directory. Refreshed actual-source Full visual acceptance remains separate from that synthetic fixture.

Root still must verify real runtime loop progression without wheel input, no auto-chapter advance, transitions/reversal/pause/hidden handling, source-aware camera fit, safe foreground/DOM stacking at intermediate frames, reading/photo contrast, pointer interference and resource/frame cost in the integrated app. Autonomous playback deliberately changes the previous idle-render budget; no physical-phone timing claim is made.

Initial integrated captures showed black regions crossing some DOM cores. A bounded actual build-2 desktop diagnostic at 1440×1000 compared the ordinary scene, a forced full-viewport protected mask, and a reset frame. The full mask made the entire Canvas transparent while leaving the underlying DOM intact; the renderer reported `alpha:true` and `premultipliedAlpha:true`. All 13 published reading masks matched the current transformed DOM cores exactly (maximum difference 0 CSS pixels). After awaiting controller settlement and a rendered R3F frame, ordinary/reset captures showed the complete workflow heading, all source labels, image boundary and controls clearly. The earlier intrusion was not reproduced, and no shader change was justified. This confirms that captured state and frame synchronization matter; it is not a claim that every future transition is accepted. Evidence is `mask-debug-build2.json` and `desktop-workflow-build2-{before,full,after}-mask-debug.png` in the private Round 06 verification folder. No page errors occurred.

The later source-family handoff extends `exhibition.update({bounds})`: the existing three stage meshes and two area lights reframe around a supplied fixed verified family envelope. Radius, source datum, centre and lamp targets update without new objects, extra shadow maps, camera writes or source mutation. Seven stage tests now include finite/refit/disposal invariants. FORM's generic slot count changed from two to four after source mapping was verified. The combined focused run passes 24 CPU tests across chapter score, optics/masks, stage and source-diagram data; optional browser fixtures are separate.

The integrator subsequently added an Information Designer responsibility, documented in [Round 06 source diagrams](ROUND_06_INFORMATION_DESIGN.md). That separately authorized work creates diagram components/styles and source-native artwork derivatives. No page/controller/manifest edits, commits, pushes or deployment were performed by this role.

## Final integrated visual checkpoint

The final rebuilt public artifact was reviewed in Full at 1440 and 390 px for SYSTEM bending and PATTERN experiment-a. All four captures show legible source contours/openings with the final .32/.20/.15 environment/fill/hemisphere floors and .24 bright-surface field gain. Essential visible text and source captions remain clear; no black-mask intrusion or page error was reproduced. Phone PATTERN is small but identifiable; fixed phone navigation can overlap a partially entering next heading at an intermediate scroll position, with native scrolling preserving access. These four states do not establish all source/color/loop states or physical GPU performance. Captures and source-legibility-acceptance.json are in the private Round 06 verification/final folder. See the case Round 06 verification record for the independent full browser matrix.
