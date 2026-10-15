# Bending-Active scene background and light field

15 October 2026. The owner authorized local scene-background work and screenshots to give Liquid Glass more light and color behind it, then agreed to continue after the visual and model-focus review. The owner then explicitly renewed authorization to commit and push the reviewed neutral glass, 2D/catalog, background and existing keyboard-focus behavior, with deployment subject to the same-SHA CI gate. The earlier withdrawal is historical; execution remains pending. The neutral glass implementation is unchanged. Its earlier 48 browser checks and nineteen captures remain the **previous-background baseline**, not acceptance of this scene revision; see [Liquid Glass integration](LIQUID_GLASS_INTEGRATION.md).

## Direction and role discussion

Use one dark material-study studio with broad steel-blue and warm-copper light regions. The cold/warm relationship supports FORM / SYSTEM / MAKE rather than adding a rainbow, a fictional architectural location or analysis colors. The existing scene and documentary source material remain the subject.

| Role | Decision |
| --- | --- |
| UI/UX Designer | Provide visible background changes through existing glass while retaining quiet reading cores, scoped foregrounds and original source paper. |
| Lighting Designer | Keep the source key and material illumination neutral. Restrict the new color to a bounded scenic wash; do not raise exposure to demonstrate glass. |
| Scene Designer | Extend the existing continuous cyclorama with broad light regions, a dark contact floor and negative space. Add no props or invented source geometry. |
| Animation Cinematographer | Keep camera, framing and chapter holds. FORM / SYSTEM are cooler; MAKE shifts the warm shoulder left, while evidence remains primary. |
| 3D Artist | Add bounded emissive color only to the existing presentation set, preserving source material, authored vertex colors and documentary pixels. This is not measured GI. |
| Software Architect / Runtime Engineer | Sample one pure chapter score, share it between the existing Director and set adapter, and retain their existing property ownership. |
| Browser / GPU Performance Engineer | Add no geometry, lights, render passes, renderer or clock. Account for added shader/CSS work without claiming a measured performance improvement. |

The first actual Full desktop/mobile overview and desktop FORM captures made the cool field visible, but the warm light remained too weak behind the opaque floor. Source curvature colors and orange ASCII did not count as proof of warm background light. V2 moves and strengthens the warm shoulder. The final desktop overview / neutral FORM / MAKE and mobile FORM / MAKE images were inspected: the cool-left / bronze-right relationship is readable, MAKE shifts warmth toward its documentary photograph, and the neutral bending model remains silver-gray. Mobile warmth is subtler. This is a concrete candidate for owner comparison, not owner approval or a one-to-one Apple/Figma reproduction.

## Current implementation

`components/chapter-scene-score.mjs` owns the original palette: cool RGB `[95,144,166]` (`#5f90a6`) and warm `[184,133,80]` (`#b88550`). The existing chapter weights blend these relative strengths; cool energy is the weighted first column × `.64`, warm energy the second × `.65`.

| Chapter | Cool weight | Warm weight | Warm-side weight |
| --- | --- | --- | --- |
| Overview | 1.00 | .55 | 0 |
| FORM | 1.00 | .28 | 0 |
| SYSTEM | .86 | .22 | 0 |
| PATTERN | .76 | .18 | 0 |
| MAKE | .48 | .84 | 1 |
| Validation | .70 | .38 | .25 |
| Credits | .78 | .42 | .10 |

At a pure overview weight, energy is `.64` cool / `.3575` warm. These are artistic project values, not native Apple parameters or calibrated lighting measurements. The score uses existing chapter weights, not an autonomous light animation.

The existing Director publishes RGB strings and energy rounded to two decimal places through its unchanged-write-suppressing style publisher. Warm X is `round(63 − warmSide × 45)%`, moving toward 18% in MAKE. `components/cinematic.module.css` paints a wide cool region at `(12%,12%)`, an `86% × 42%` warm region at default `(63%,66%)`, and the dark steel base. Narrow screens place warm Y at 62%. The warm field was moved from the first draft's lower-right placement and increased from the earlier overview energy `.264`; the glass itself was not retinted.

`SceneRuntime` passes the same sampled backdrop to the existing exhibition adapter. `components/exhibition-stage.mjs` adds bounded wash uniforms to the existing cyclorama `MeshStandardMaterial.onBeforeCompile`, with the same update writer and draw. A broad cool wall band, a warm wall shoulder and restrained lateral floor shoulder connect the 3D set to the DOM background. The central contact floor stays dark. The signed-distance falloffs use `exp(-d*d)` and `exp(-dot(d,d))`, replacing the first draft's signed `pow` calculation. This is decorative set emission, not another lamp, environment capture or global illumination simulation.

No geometry, light, shadow map, render pass, renderer, scene readback or clock is added. Existing source key settings, source materials, camera score, exposure and approved asset bytes remain unchanged. Original diagrams/images keep their opaque unfiltered paper. The existing ASCII implementation is retained; its orange glyphs remain visually prominent, especially around the mobile model, and are separate from the new soft light field.

## Static fallback and limits

No-JavaScript, not-yet-enabled and applicable static/Reduced presentations retain the approved full-screen `model-poster*.webp` assets and original vignette. The poster is opaque, so it covers the new DOM light field; its appearance therefore differs from the revised Full scene. No poster mask or blend mode is used to make the model partly transparent. The source asset bytes are unchanged. This is an explicit fallback inconsistency, not a claim that all modes show identical light/color.

## Local validation checkpoint

| Check | Observed status |
| --- | --- |
| `pnpm check` | Passed; `.local-scene-lighting-check.log`. |
| Portable suites | 363 total: 361 passed, two existing conditional skips, no failures; `.local-scene-lighting-portable.log`. This scope includes the 54 catalog tests omitted from the previous 309-test total. |
| Focused scene / lighting checks | All 27 passed; `.local-scene-lighting-unit.log`. |
| Public build audit | Passed: 80 output files, 36 approved assets; `.local-scene-lighting-build.log`. |
| V2 material / interaction browsers | All 18 passed in 3.8 minutes across Chromium, WebKit and Pixel 7 emulation; `.local-scene-lighting-material.log`. Original contrast and optical thresholds remain unchanged. |
| V2 public / resource / readability regression | All 12 passed in 5.3 minutes across the same three configurations; `.local-scene-lighting-regression.log`. Covers Full initialization/navigation, Reduced/unavailable behavior, one retained Canvas with stable backing storage, and actual/white/black backdrop contrast. |
| Final viewport / control captures | Completed: 22 viewport views and 21 visible control crops from 24 declared crop slots; three hidden mobile reading-control crops were explicitly skipped. Full and Reduced-enabled FORM captures show neutral `bending`; poster captures have zero 3D canvases. |
| Designated natural-background text contrast | Six designated views across the base run and two portal-only supplemental captures have no valid measurement failure. Observed minimum is **5.628768:1**, above unchanged 4.5:1 small-text / 3:1 large-text thresholds. This is scoped visible HTML text, not every page/source text. |

The frozen V2 public HTML SHA-256 is `dc16040beeee32e4b516699daee8b4500390e24266bffcd8626f62b23b94b041`; its artifact digest is `365c0daaca728d2e9c5a180ddbfb93fcbb7f76d6d94b00fd44823d9ae16331b4`. These identify the local tested artifact, not a commit or CI publication. The **30 current browser passes** are `18 + 12`. The catalog's sixteen input hashes remain identical; its previous thirty checks were not rerun or counted as new background acceptance.

The [base capture receipt](animation-review/.local/scene-lighting-built/2026-10-15T16-03-29-553Z/results.json) preserves all 22 views and its original thirteen false-positive rows, all for mobile source-portal/model-label sampling before the helper accounted for occlusion. Its browser-error count is zero. It records one mobile Reduced `studio-small.hdr` request with `net::ERR_ABORTED`; the final scene was ready, but the untimestamped request entry does not establish the exact abort timing or cause. It is not a zero-failed-request record. Four representative cold/warm views in that run pass, with minimum **5.661998:1**.

The [portal-only supplemental receipt](animation-review/.local/scene-lighting-built/2026-10-15T16-21-25-990Z/results.json) records two completed viewport recaptures, `contrastPassed: true`, zero browser errors and zero failed requests, with the same frozen HTML/digest. Only the ignored capture helper changed; its SHA-256 is `6357f9be4e6893069ca994f772019c3266a1290babe09bea9dfa5b0de311652b`. The corrected scope measures authored portal HTML and excludes original source artwork: desktop four visible text rows, minimum **10.807499:1**; mobile three, minimum **5.628768:1**. The source link covered by native bottom navigation is recorded as skipped, as are seventeen occluded mobile model-label text ranges. These skipped ranges are not contrast passes. The supplement replaces the two designated portal measurements; it is not another complete-page or all-text run, and the original failed receipt remains intact.

The five-image visual review found no new background/layout blocker. Existing owner-visible tradeoffs remain: orange ASCII is prominent, mobile navigation can cover paper or the original-source link, long model information can meet the following reading card/viewport boundary, and the mobile MAKE view has substantial open background above its text. Glass cores remain deliberately quiet for reading. These observations do not establish no occlusion or complete fallback color parity.

## Model boundary clarification and owner continuation

A read-only native-input audit on the same frozen `dc16040…` artifact records six states in [the audit receipt](animation-review/.local/model-boundary-audit/results.json), with [the pointer comparison](animation-review/.local/model-boundary-audit/pointer-comparison.png). Border width is zero throughout. Browsing, hover and mouse comparison have no outline. Keyboard Arrow focus engages the model and shows the existing 2 px orange focus ring. Escape clears engagement and selection while retaining keyboard focus and its ring; an outside pointer click removes it. The orange rectangle is therefore an existing keyboard focus indicator, not a permanent model border. No production CSS or runtime changed for this audit.

After this visual/focus clarification, the owner agreed to continue and then explicitly renewed **commit/push and same-SHA CI-gated deployment authorization** for the reviewed neutral glass, 2D/catalog, background and existing keyboard-focus behavior. The earlier withdrawal remains historical. Commit/push, successful CI and deployment are pending execution; this record does not claim they have completed. The deployed baseline remains `39636b7` until verified publication. Physical iOS/Android quality, sustained GPU cost and complete fallback color parity are not established by this checkpoint.

## Post-push CI fixture follow-up

The authorized `b11d921` push has a Chromium test-fixture layout failure in CI 38781043505 and is not publishable. The [Liquid Glass CI correction record](LIQUID_GLASS_INTEGRATION.md#ci-fixture-correction-after-the-authorized-push) distinguishes the owner-layout/caption assertion fix from unchanged production material and unchanged acceptance thresholds. The final guarded checks pass in all three browser configurations; a follow-up commit and successful same-SHA CI remain pending. Earlier local validation counts above are preserved without claiming a final CI pass.

## Completed publication checkpoint — 15 October 2026

The earlier pending-execution and `b11d921` failure paragraphs are historical. The corrected release `d34e38aac02c66cfcc4296d5405392eb77501852` is now deployed. [CI 38783455602](https://github.com/JosHsuan/JosHsuan.github.io/actions/runs/38783455602) succeeded in all fourteen jobs, including 156 public browser scenarios across fifteen spec files. [Deployment 38787493080](https://github.com/JosHsuan/JosHsuan.github.io/actions/runs/38787493080), job `116603173386`, succeeded using that tested output.

The CI output digest is `2488327c95629e5cd4ec12991352ad0b32b0b8f6dd218a98d2b978a999cdc449`; deployed HTML SHA-256 is `383469eb09d3fdffad6bfc4991354ce9cac08b6a2e88ed4029920102aa474c77`. All ten live HTTP comparisons of HTML, release metadata, scripts and styles match the validated bytes. The ignored [deployment provenance](animation-review/.local/liquid-ci-d34e38a/deployment-provenance.json) and [live receipt](animation-review/.local/liquid-ci-d34e38a/live-2026-10-15T18-41-55-124Z/results.json) preserve the commit/run/output identity. These publication results do not change the earlier local counts or physical-device/fallback limits.

The subsequent personal homepage introduction is a separate change still under validation. It is not included in `d34e38a` or claimed as published by this checkpoint.
