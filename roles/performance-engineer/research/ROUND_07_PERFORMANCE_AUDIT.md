# Round 07: sustained performance and Safari stability

Date: 2026-10-09. Inspected release: `5261c5eba83315b9b465b469a08fa35f60407544`.

## Reported failure and limits

The owner reports sustained browsing jank and Safari replacing the whole page on desktop and iPhone with “A problem repeatedly occurred”. Treat this as a page/process failure, not merely an uncaught JavaScript exception. GPU pressure, CPU load, resource accumulation and browser/driver defects are hypotheses until a relevant trace or reproduction distinguishes them. No physical Safari device has been measured by this role.

Existing Round 06 evidence confirms functional interactions, source fidelity and small optical fixtures. It does not certify sustained real-device performance. The compositor A/B fixtures used 512 × 320 pixels; the public live captures were short visits. CI software rendering also exposed severe frame delays but is not representative of target hardware.

## Inspected findings

Paths in this table are relative to `roles/uiux-designer/cases/bending-active-thesis/components/`; line references identify the baseline above.

| Finding | Source evidence | Consequence / verification needed |
| --- | --- | --- |
| Full rendering allocates an uncapped viewport-size RGBA16F color/depth target at up to DPR 1.25 and two MSAA samples. | `scene-compositor.mjs`, `createSceneCompositor` target creation and `render` sizing; `CinematicScene.jsx:282`–284. | Storage and bandwidth grow with viewport area even though DPR is capped. Record dimensions and estimated attachments; bound pixels and review resulting image quality. |
| Full uses scene, two quarter-resolution mist gathers and a full-resolution output pass. Output may gather 16 extra color/depth samples, then evaluate both ASCII and the autonomous field. | `scene-compositor.mjs`, fragment `main` and render passes. | Sustained shader/bandwidth cost is plausible. Preserve effect intent while changing where/how often expensive work occurs. |
| Semantic foreground masking executes up to 16 rectangle exclusions. Its transparent-core early return skips all subsequent shader work. | `scene-compositor.mjs`, `exclusion` / foreground branches. | Removing masks also removes those early returns. Rear-layer design alone is not proof of a speedup; measure total work after both changes. |
| The controller runs continuously for autonomous playback and mixes DOM writes and layout reads. | `CinematicExperience.jsx:95`–218: root/section/feedback writes, then sticky/model/protected bounds and scroll-height reads. | Potential forced style/layout and repeated query costs. Cache membership, batch reads/writes, skip equal values and avoid measuring distant content per frame. Trace before claiming their share of frame time. |
| A stationary pointer over a model requests a real triangle raycast every controller tick; event hover adds its own request. | `CinematicExperience.jsx:174`–183; `CinematicScene.jsx:172`–178; `ModelInspector.jsx:59`–72. | High-triangle cases can consume CPU even without pointer movement. Reuse ray objects and coalesce hover sampling while keeping click/drag hit tests exact and source-backed. |
| Fitted source cameras traverse fixed verified support unions each frame and allocate small arrays during dot/projection math. | `source-scene-score.mjs:71`–91 and `sampleSourceScenePose`. | Source-fidelity-preserving arithmetic/scratch reuse is possible; do not replace exact fitting with a guessed box or remove the 3% margin. |
| Light mode retains HDR color/depth output and autonomous field; it removes MSAA/shadows/mist/DOF/scene ASCII. | `CinematicScene.jsx:218`–223, 248, 282–284. | Light is not a zero-cost fallback. Distinguish artistic detail from an internal bounded performance tier. |
| Resource cleanup is substantially explicit and bounded in source. | `CinematicScene.jsx:91`–101; compositor `dispose`; `exhibition-stage.mjs` LTC refcount and disposal; controller effect cleanup. | No static proof of an unbounded GPU leak. Verify counts after shader warmup, resizing, quality changes and full unmount/re-entry before claiming leak-free behavior. |
| No sustained-performance adaptation exists; Full is initial state. | `CinematicExperience.jsx:27`; no performance feedback policy in frame owner. | A slow device can remain under continuous load indefinitely. Add bounded, hysteretic relief based on sustained measured cadence, with manual controls and no quality oscillation. |

The baseline compositor's own storage model is approximately `pixels × 12 × (samples + 1) + quarterMistPixels × 16`. At DPR 1.25 and samples 2, this is about 79.4 MiB at 1440 × 1000 CSS pixels, 203.2 MiB at 2560 × 1440 and 457.3 MiB at 3840 × 2160. A 390 × 844 phone viewport is only about 18.1 MiB by the same estimate. These values exclude back buffers, driver alignment, shadow/environment maps, geometry, decoded media and browser compositing surfaces. They establish a scaling risk, not the cause of the phone failure.

## Joint design position

Use a constant rear Canvas. Remove foreground promotion, black semantic cutouts and the per-frame DOM-to-shader protection pipeline. Define reading boundaries with rounded DOM planes, actual evidence on stable opaque cores, translucent tinted rims and restrained shared light/pointer cues. Large mandatory backdrop-blur layers are not the default: they sample a continuously changing scene and may replace one expensive compositor with another. Any real blur remains small, bounded and separately measured.

Preserve original meshes and colors, camera intent, autonomous chapter phases, satin materials, source diagrams, direct mesh gestures and native reading. First remove duplicate and unnecessary work. Then bound render pixels and choose supported attachment/sample budgets; validate thin edges and optical character at desktop and phone dimensions. A performance tier must not silently remove the source or stop the approved experience merely to pass a test.

## Measurement protocol

1. Run one production-export browser workload at a time. Pin commit, browser, viewport/DPR and selected detail. Capture startup separately from warmed sustained behavior.
2. Collect real-time frame intervals, rendered-frame deltas, long tasks where supported, renderer geometries/textures/programs, estimated attachment bytes and browser/process failure events. Do not insert synchronous GPU readbacks or `getError` in every frame. GPU timer queries, if available, must be asynchronous and discard disjoint samples.
3. Compare identical chapter visits, stationary reading, source hover/orbit, Full/Light switching and resize sequences. Include real elapsed multi-minute loops with all seven chapters and sufficient time for every representation. Record p50/p95/p99 cadence and worst stall, not an average FPS alone.
4. After warmup, verify resource counts plateau at a fixed size/mode. Resize/quality changes may release/reallocate targets; retained bounded counts alone do not prove process memory is stable. Track process memory separately where the platform exposes it.
5. Verify Pause and hidden-page intervals do not advance story time, controller work or render counts after settling. Restore without replaying stale time or leaving the page blank.
6. Exercise forced context loss separately: the page, evidence and navigation must remain usable with a static fallback. A browser process crash cannot be recovered by the same JavaScript handler, so never equate this check with resolving the reported Safari failure.
7. Repeat final sustained runs in Chromium and Playwright WebKit and inspect all evidence/readability screenshots. Report Playwright WebKit as engine-level coverage, not an iPhone/Safari hardware certificate. Physical-device verification remains a separate recorded limit.

The initial architecture targets (near 60 FPS desktop / stable 30 FPS phone, approximately 150k visible triangles) remain review thresholds. Existing source geometry exceeds the triangle target; lowering its fidelity is not authorized as a shortcut.

## Primary technical references

Reviewed on 2026-10-09. These references guide methodology; none diagnoses this particular page failure.

- [MDN WebGL best practices](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices): bound estimated attachment storage, consider a smaller back buffer, release owned resources and avoid synchronous GPU queries in hot paths. WebGL exposes no portable total VRAM query.
- [R3F performance pitfalls](https://r3f.docs.pmnd.rs/advanced/pitfalls): mutate frame-owned values directly and reuse objects rather than creating avoidable garbage or routing frames through React state.
- [R3F scaling performance](https://r3f.docs.pmnd.rs/advanced/scaling-performance): demand rendering requires explicit invalidation for active motion; quality changes need stable performance evidence rather than repeated reactions to brief fluctuations.

## Current status

The baseline, compositor checks and Build 6 integrated after-profiles are complete. Release acceptance and deployment remain root-owned. The reported physical Safari failure has not been reproduced by these tools.


## Baseline observations

Production artifact from `5261c5e`, real clock, one browser at a time. Chromium 153 reports ANGLE Vulkan SwiftShader; this is software rendering on the current Windows host. Playwright WebKit reports an Apple GPU string, which is an engine identity string, not proof of an attached physical iPhone. Viewports were Chromium 1440 × 1000 / device DPR 2, WebKit 390 × 844 / device DPR 3. Runtime DPR capped both Full profiles at 1.25.

| Matched scenario | Chromium baseline | WebKit mobile baseline |
| --- | --- | --- |
| Full traversal, 84 seconds | 201 frames / 84.91 s; RAF p50 433.3 ms, p95 966.6 ms | 478 / 84.12 s; p50 167 ms, p95 292 ms |
| Full stationary overview, 25 seconds | 27 / 25.62 s; p50 949.9 ms | 312 / 25.19 s; p50 80 ms |
| Light traversal, 60 seconds | 469 / 60.35 s; p50 100 ms | 294 / 60.13 s; p50 179 ms |
| Explicit Pause, 10 seconds | 0 rendered frames, controller frames or story seconds | 0 rendered frames, controller frames or story seconds |

The Light traversal intentionally visits a different chapter sequence from Full; do not use this table to claim a Full-to-Light speed ratio. The after-profile must match each named phase. Chrome's initial run had a harness-only Pause locator typo after its completed workload; the corrected supplementary lifecycle run supplies the Pause/resume results. Raw evidence preserves that failure rather than calling the entire initial script successful.

No crash or context loss was observed. Resource counts reached 14 geometries and 10 textures after representation warmup. Sampled Chromium heap fluctuated with collection rather than increasing continuously; these short runs cannot prove leak freedom. Both headless engines kept the first tab visible after a second tab was foregrounded. The harness records actual visibility and explicitly marks the hidden-page experiment unavailable; it does not synthesize a passing visibility event.

## Compositor refactoring and isolated acceptance

- Removed semantic mask uniforms, rectangle packing, protected-core cutouts and foreground-alpha branches. Reading protection now belongs to the DOM planes.
- Radiance, depth coverage and evolving contour calculations execute in a small glyph-cell prepass. Integer glyph levels remain exact in RGBA16F; only continuous density receives half-float quantization. Final analytic glyph strokes and scene-surface attenuation remain at display resolution. Allocation size is based on the minimum supported cell width so authored cell-size animation does not churn targets.
- Two time-only sine offsets now update in CPU uniforms once per frame. No extra clock, random field or source geometry is introduced.
- Retained mist and glyph targets shrink/release when disabled. The compositor accepts fractional density below 0.5, floors target dimensions and scales DOF radius relative to requested density to preserve its CSS footprint.
- The original 16-tap bilateral DOF remains, including far-background pixels. Two attempted background shortcuts were rejected by optical comparison: resolved MSAA fringes can share depth 1 and still contribute silhouette diffusion, even beside a pure constant background center. Preserving the original gather avoids that visual regression.

Both Chromium and WebKit passed the six optical groups and nine baseline comparison scenes. Plain color, depth-focus, scene glyphs and mist have byte-identical output against the released compositor when no obsolete foreground masks are supplied. Four autonomous-field scenes differ by at most one display-channel value out of 255. These bounded differences come from the compact density intermediate, not changed source geometry, field time or glyph shape.

The 512 × 320 fenced fixture on Chromium measured approximately 17.6 → 16.3 ms for combined optics/field and 6.9 → 6.0 ms for the Light field. WebKit's roughly 1 ms fixture timings are too coarse to support a meaningful speed claim. Neither measurement is a full-page frame-rate or physical-phone result.

Baseline profiles and after-profiles are retained privately under `round-07/verification/baseline` and `round-07/verification/optimized-build1`. The reusable script is `roles/performance-engineer/scripts/profile-pages-performance.mjs`; optical checks use the case's existing `OPTICAL_BROWSER`, `OPTICAL_ENGINE`, `OPTICAL_WORKDIR` and optional `OPTICAL_BASELINE_COMPOSITOR` fixture controls.


## Integrated Build 1 checkpoint (not final acceptance)

The matched real-time Chromium Full traversal improved from 201 / 84.91 seconds to 296 / 84.29 seconds (about 48% more delivered frames per second). Full stationary improved from 27 / 25.62 seconds to 34 / 25.59 seconds; Light traversal from 469 / 60.35 seconds to 736 / 60.12 seconds. The desktop Full compositor estimate fell from 83,253,600 to 59,486,808 bytes. Software rendering is still slow; these changes do not prove a smooth physical desktop or Safari fix.

WebKit mobile Full traversal remained effectively unchanged: 478 / 84.12 seconds before, 472 / 84.10 after. Stationary overview worsened from 312 / 25.19 seconds to 240 / 25.01 seconds. This is an explicit failed performance acceptance for the mobile goal, despite correct optical output and the intended rear-layer design. The removed semantic-mask early exits previously skipped work over reading panels. Further measured density relief is required; the team will not call Build 1 a finished phone optimization.

The selected next step is one-way, bounded render-density relief based on sustained delivered cadence, preserving Full effects, source geometry, camera and motion time. Brief setup/resize/interaction gaps must not trigger a step; requested DPR remains the optical footprint reference. A separate review also identified an intermediate R3F resize allocation risk: a later World-frame cap cannot prevent the renderer's earlier stale-DPR back-buffer resize. Root owns the guarded sizing fix and its peak-allocation tests.

## WebKit composition isolation and correction

Build 4/5 density relief lowered mobile target area but did not recover stationary cadence: about 9.6–9.9 FPS versus the released baseline's 12.4 FPS. A fresh sequential check against the public baseline at `5261c5e` measured 12.93 FPS versus 9.80 FPS locally. This confirmed a regression rather than assuming the earlier machine conditions still applied.

Root ran real-time diagnostic interventions without publishing them. Removing field work, all optical work or MSAA each left cadence near 9.8–9.9 FPS. Hiding the reading frame raised it to about 19 FPS; hiding only Canvas raised it to 12.8 FPS. Instrumented RAF callbacks occupied about 1.3–1.5 ms each delivered frame; native WebGL calls were asynchronous, so this is not GPU timing. Freezing rim updates gave only a partial gain. Paint containment was also rejected after a paired 9.80 / 9.73 / 9.87 FPS control/contained/control sequence. Its [CSS semantics](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/contain) were checked, but it is not part of the implementation.

The added opening backing was the actionable composition cost. A paired CSS intervention measured 9.92 FPS normally, 13.11 FPS when the same material painted directly on its container, 16.24 FPS with a direct backing and inset-only phone shadow, then 9.93 FPS after restoration. Direct backing retains its visual bounds using compensating padding and negative margins. The production integration applies this to opening and study-label surfaces; phone surfaces retain rounded outlines and shared-light rims while dropping the costly outer blur. Desktop shadows remain. These isolated results guide the change; final built-artifact profiles remain the release evidence.

Completed entrances now release identity 3D/filter transforms; actual pointer/focus feedback retains them while active. The long reading root uses a 2D translation. Those changes remove unnecessary retained composition state, but their small observed gain is not presented as the main phone improvement. Raw intermediate and isolation records are preserved, including rejected approaches.

## Final built-artifact observations

Sequential real-clock Build 6 runs completed in Chromium 153.0.8010.12 and WebKit 26.6 with the same viewports and scenarios as the baseline. Chromium Full traversal improved from 2.37 to 11.45 FPS, stationary overview from 1.05 to 3.03, and Light traversal from 7.77 to 31.93. WebKit phone-viewport results improved from 5.68 to 6.25, 12.39 to 16.04, and 4.89 to 5.22 FPS respectively. Phone stationary regression is resolved in this environment; traversal gains remain modest. The proposed 60/30 FPS thresholds are not certified on this host or physical hardware.

Both final runs contain zero page errors, crashes or context losses. Ten-second Pause phases contain zero controller/render frames and no authored-time advance. Warm stationary compositor estimates are 15,102,696 bytes desktop and 4,812,348 bytes phone, versus 83,253,600 and 19,049,568 in the baseline. Source geometry counts plateau at 14; one added cell texture brings Full to 11 textures. Estimated attachments are not measured total VRAM. Actual OS backgrounding remains unavailable in headless mode; synthetic lifecycle tests are reported separately.

Raw evidence is in `optimized-build6/` and `comparison-build6.json` under the private verification directory. The [integrated verification record](../../uiux-designer/cases/bending-active-thesis/ROUND_07_VERIFICATION.md) includes browser checks, screenshot limitations, visuals and the publication gate. Windows WebKit screenshots alone are insufficient evidence of source visibility after resizing; diagnostic final-framebuffer readback confirms actual model/field pixels without adding readbacks to the performance runs or production runtime.
