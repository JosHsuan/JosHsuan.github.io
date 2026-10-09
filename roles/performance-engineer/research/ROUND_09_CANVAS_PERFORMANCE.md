# Round 09: bounded moving Canvas performance

Date: 2026-10-09. Baseline: published Round 08 release `ed59810` (the complete release identity and HTML hash are retained in each raw profile).

## Owner request and team position

The owner approves the current overall presentation but reports insufficient performance. The requested change is a Canvas that contributes its own spatial motion and chapter transitions instead of remaining a full-page background. The experience, scene and performance roles agree on one retained Canvas with stable local dimensions, translated and uniformly scaled by the existing controller. Source geometry, materials, optics, reading content and native scrolling remain part of the acceptance contract.

Moving a fullscreen Canvas through CSS alone does not reduce the number of pixels shaded by WebGL. The measurable opportunity is a genuinely smaller drawing surface and no GPU submissions while that surface is fully outside the visible page. A separate camera-fitting calculation is ordinary CPU work; current evidence does not establish it as the dominant cost.

## Cost model and architecture constraints

The existing Full compositor uses an HDR color/depth target with two MSAA samples, mist intermediates, a small glyph-cell pass and final output. Its own attachment estimate scales approximately with physical surface area: `width × height × 12 × (samples + 1)`, plus mist and glyph targets. It excludes shadow/environment maps, decoded assets, source buffers, browser composition and driver storage. The estimate is useful for matched comparisons, never a total GPU-memory measurement.

The current source fitter projects the verified support union into the requested viewport after final orbit and FOV. This has a CPU cost, but changing the aperture to Canvas-local coordinates principally removes double-follow behavior. It is not by itself proof of a performance gain. Earlier Round 07 diagnostic callbacks occupied approximately 1.3–1.5 ms per delivered frame while the phone-viewport WebKit cadence was approximately 100 ms; that historical observation motivates measuring pixel and browser composition work before rewriting the camera mathematics.

The agreed constraints are:

- Keep one WebGL context, mounted scene and owned resource set across chapters. Do not remount or reparent Canvas to simulate a moving scene.
- Keep backing width/height stable during scrolling. Only real viewport/orientation layout changes may select new dimensions. Translation and uniform scale are compositor operations; rotation, skew and perspective are excluded because the current ray conversion assumes an axis-aligned client rectangle.
- Fit source geometry in a fixed Canvas-local aperture. Do not simultaneously move the Canvas and chase its document-space slot with camera offsets.
- Skip invalidation and scene rendering when the surface is fully absent. Retain resources for re-entry. CSS opacity or visibility alone is insufficient because the existing controller still publishes state.
- Preserve the one story clock and camera writer. DOM surface placement belongs to the existing experience controller; the scene owns local camera and material writes.
- Keep the existing physical-pixel cap, Full optics and manual detail choices. A smaller frame must remain legible and materially improve actual render area rather than hiding a quality reduction behind an unchanged Canvas size.
- Avoid mandatory backdrop blur, feather masks, animated filters or perspective wrappers until separate measurements justify them. Simple frame treatment is evaluated visually, without assuming it is free.

## Falsifiable acceptance

Use the production export with the same real-clock traversal on the same host, one browser at a time. Record exact artifact, browser version, OS, viewport, device DPR, warmup and phase durations. The reusable profiler records frame cadence, frame/controller counts, long tasks where available, resource counts and estimated compositor attachments. It does not use a mocked clock, synchronous per-frame GPU readback or GPU timing claims.

1. Drawing-buffer area and attachment estimate must decrease at corresponding visible frames, while source families, geometry identities, Full sample count and optical intent remain intact.
2. Native Canvas dimension writes and texture/renderbuffer storage calls must remain unchanged across scroll-only surface transforms after warmup. A real resize must still update correctly.
3. Entirely offscreen intervals must submit zero scene frames after settling, with resources retained; return must render the current chapter immediately without a stale blank frame or resource churn.
4. Source supports must fit the transformed local aperture with the existing margin, and real mesh taps, orbit, keyboard representation changes and native page scrolling must work.
5. Compare visible-scene cadence separately from whole-story traversal. An offscreen sleeping Canvas is a valid saving but makes average rendered frames per second inappropriate as a smoothness score for the complete route.
6. Pause must remain idle in both controller and scene work. Context loss and physical Safari page/process failures remain separate requirements.

## Evidence status

Baseline real-clock profiles completed sequentially from the public `ed598100a3149f328a7906bca3b01e1a807d0a4c` release. Both received the same HTML SHA-256, `c368e2fbdb177d72709290e83e33ce0bd231f8196fd37f6bce4dcba211578823`. Raw measurements are retained outside the public repository under `D:\JosHsuan_Website\_work\bending-active-thesis\round-09\verification\baseline-live`. No physical iPhone has been attached to this host; Playwright WebKit is engine-level coverage and cannot certify that the reported Safari page/process failure is resolved.

The host is Windows 11 (`win32 10.0.22631`), Intel i9-13900HX. Chromium 153.0.8010.12 uses ANGLE Vulkan SwiftShader, viewport 1440 × 1000 and device DPR 2. WebKit 26.6 uses a 390 × 844 touch/mobile viewport and device DPR 3; its renderer identity is not evidence of physical Apple hardware. Each run has 15 seconds of active warmup followed by identical real-time phases. Resource samples occur every five seconds; the independent RAF recorder retains a bounded 4,096-observation reservoir. Chromium also collects CDP counters. These instruments add some overhead and do not expose asynchronous GPU duration.

| Baseline phase | Chromium rendered frames / elapsed time | Chromium RAF p50 / p95 | WebKit rendered frames / elapsed time | WebKit RAF p50 / p95 |
| --- | --- | --- | --- | --- |
| Full traversal | 922 / 84.12 s (10.96 FPS) | 50.1 / 283.3 ms | 525 / 84.08 s (6.24 FPS) | 156 / 273 ms |
| Full stationary overview | 75 / 25.61 s (2.93 FPS) | 333.4 / 350.1 ms | 392 / 25.18 s (15.57 FPS) | 58 / 91 ms |
| Light traversal | 1,901 / 60.06 s (31.65 FPS) | 33.3 / 50.1 ms | 306 / 60.26 s (5.08 FPS) | 183 / 295 ms |
| Explicit Pause | 0 / 10.21 s | — | 0 / 10.05 s | — |

Full and Light traversal intentionally use different chapter offsets; their rows are before/after comparison scenarios, not a quality-mode speed ratio. Both baseline runs completed with zero page/console errors, crashes or context-loss events. Pause also had zero controller frames and zero authored-time advance. Headless tab foregrounding did not make the first page hidden in either engine; actual OS backgrounding remains unverified rather than replaced with a synthetic success.

Warm Full resource counts plateau at 14 geometries and 11 textures. The WebKit stationary surface is 243 × 527 pixels (128,061 pixels, density scale 0.5), with an estimated 4,812,348 compositor attachment bytes. These short runs show retained resource counts, not leak freedom or total process-memory stability.

### Baseline CPU observations

Chromium's completed baseline uses ANGLE Vulkan SwiftShader on this Windows host. During 25.61 seconds of warmed Full stationary overview it delivered 75 frames. CDP recorded 0.141 seconds of JavaScript, 0.018 seconds of layout and 0.437 seconds of style recalculation, versus 25.440 seconds of total task duration. During the 84.12-second Full traversal it delivered 922 frames, with 1.772 seconds of JavaScript, 0.200 seconds of layout and 7.859 seconds of style recalculation. These whole-page metrics are not GPU timings or precise camera attribution; they do show that JavaScript camera arithmetic cannot explain most of the elapsed time on this host.

The warmed stationary backing is already density-relieved to 758 × 527 pixels (399,466 pixels, density scale 0.5), with 15,102,696 bytes of estimated compositor attachments. The visible assembly still reports 227,853 triangles including scene work. A new surface must be compared at the same pressure state: merely escaping the original 1.6-million-pixel ceiling can otherwise increase its allowed DPR and hide a smaller logical area.

The isolated `scripts/profile-source-fit.mjs` diagnostic imports exact committed source into a blank browser page and times the source-pose calculation with verified support points. It measures 1,000 calls per family/aspect/study-weight combination after warmup, using ten-call batches to reduce timer quantization. It intentionally excludes controller, WebGL, layout and composition; it is a test of the camera-arithmetic hypothesis, not a page-performance benchmark.

Both exact-source microbenchmarks completed. Across the two aspect ratios and three source families, a held fitted pose averages 0.048–0.140 ms per call in Chromium and 0.061–0.163 ms in WebKit. Without the held fit it averages 0.008–0.015 ms and 0.009–0.018 ms respectively. The family unions contain 514 assembly support points, 1,130 representation points and 487 experiment points. WebKit's coarse timer makes individual quantiles less informative than batch totals. Blank-page JIT behavior is not identical to the running case, but these results and whole-page script counters consistently support retaining the exact fitter and concentrating this round on render area, browser composition and absence intervals.

The experience role's envelope is 48% of desktop width capped at 720 CSS pixels with a 6:5 aspect, and a phone square of viewport width minus 36 pixels. Its matched-density area reduction is approximately 61–62% on these viewports. The actual adaptive outcomes below differ by engine and must not be summarized as a universal steady-state memory reduction.

## Final matched built-artifact observations

The runtime commits `d780bf6` and `5f83413838083eb600adf4637e50acf892307fc1` were rebuilt for the after profiles. The tested public artifact reports the latter commit and HTML SHA-256 `3a0c2c8d06d75cb4c3936164942473d332277ab79152b875d2ba1406579919a5`. Chromium then WebKit ran sequentially against `http://127.0.0.1:4186`, using the unchanged profiler, same browser versions, host, viewports, device DPR, durations and route algorithm as the public baseline. No concurrent browser suite or build ran. The final profiles completed at 12:42:52 UTC and 12:46:50 UTC on 9 October 2026. Raw results are in `round-09/verification/after-local`; `round-09/verification/comparison.json` collates the observations.

Delivery differs: the baseline loads from public GitHub Pages and the after artifact from the local static server. These runs therefore do not compare network, startup or asset-loading speed. The visible stationary measurement starts after scene readiness, 15 seconds of active warmup and the complete 84-second Full traversal, with source loads completed. It is the stronger matched sustained-rendering observation. The chapter traversal uses the same semantic route algorithm over the intentionally changed layout, not identical pixel positions or identical screen coverage.

### Drawing surface and adaptive density

| Observation | Chromium before → after | Phone-viewport WebKit before → after |
| --- | --- | --- |
| Logical Canvas | 1440 × 1000 → 691 × 576 | 390 × 844 → 354 × 354 |
| First / maximum sampled warmup pixels | 1,598,918 → 621,360 (61.1% lower) | 513,785 → 195,364 (62.0% lower) |
| First / maximum sampled warmup attachments | 59,486,808 → 23,080,128 bytes | 19,084,908 → 7,258,088 bytes |
| Warm stationary density scale | 0.5 → 0.5 | 0.5 → 1.0 |
| Warm stationary backing pixels | 399,466 → 155,160 (61.2% lower) | 128,061 → 195,364 (52.6% higher) |
| Warm stationary attachments | 15,102,696 → 5,830,368 bytes (61.4% lower) | 4,812,348 → 7,258,088 bytes (50.8% higher) |

The phone-viewport after run no longer requests the old density relief: it retains DPR 1.25 rather than 0.625, improving raster resolution while producing faster visible-scene cadence. This spends part of the smaller-frame saving on sharper output. Its observed initial attachment load is lower, but its warmed attachment estimate is higher than the already-degraded baseline. Neither sampled warmup maximum is a total-process or driver-memory peak; samples occur every five seconds after readiness. There is no claim that phone steady-state memory universally decreased.

Full retains two requested MSAA samples, five compositor passes and unchanged material/optical code. The visible assembly reports the same 227,853 rendered triangles including scene geometry and ten draw calls in both engines before and after. Warm stationary textures remain 11; geometries are 14 in Chromium and 13 in WebKit after traversal. This diagnostic counts uploaded resources; approved source arrays and hashes remain unchanged. These counts are not source-file changes, total bytes or proof against long-term leaks.

### Visible-scene cadence and complete-route responsiveness

| Visible Full stationary overview | Before | After |
| --- | --- | --- |
| Chromium rendered cadence | 75 frames / 25.61 s = 2.93 FPS | 108 / 25.24 s = 4.28 FPS |
| Chromium RAF p50 / p95 | 333.4 / 350.1 ms | 233.3 / 250.0 ms |
| WebKit rendered cadence | 392 frames / 25.18 s = 15.57 FPS | 608 / 25.02 s = 24.31 FPS |
| WebKit RAF p50 / p95 | 58 / 91 ms | 29 / 86 ms |

This is a measured whole-experience comparison, including the requested local scene composition; it does not isolate a shader-only speedup. Windows Chromium still uses software rendering and remains slow in the detailed overview. The 60 FPS desktop / stable 30 FPS phone review targets are not certified by these results or on physical Safari hardware.

| Complete-route browser RAF cadence | Before p50 / p95 | After p50 / p95 |
| --- | --- | --- |
| Chromium Full traversal | 50.1 / 283.3 ms | 16.7 / 200.0 ms |
| Chromium Light traversal | 33.3 / 50.1 ms | 16.7 / 33.4 ms |
| WebKit Full traversal | 156 / 273 ms | 134 / 240 ms |
| WebKit Light traversal | 183 / 295 ms | 140 / 246 ms |

The new surface deliberately sleeps outside its visible anchors and in evidence-only chapters. Consequently complete-route rendered-frame totals are not a smoothness score: Chromium Full changes from 922 rendered frames / 922 controller frames to 690 / 2,096; WebKit Full changes from 525 / 525 to 473 / 656. Report browser cadence and intentional render absence separately. The WebKit traversal improvement remains smaller than its stationary improvement; reading, image and DOM composition work still exists while the shared story continues.

### Lifecycle and limits

Both completed after runs contain zero page/console errors, crashes or context-loss events. Their ten-second Pause intervals contain zero scene frames, zero controller frames and no authored-time advance. After Resume at the route's VALIDATION position, both engines submit zero GL frames throughout the next ten seconds and five-second final phase, while the single authored clock and DOM controller continue. This directly measures the intended evidence-chapter saving without unmounting the context or resetting the story.

The headless background attempt still leaves the original tab visible in both engines, so actual OS backgrounding is unverified. No physical iPhone/Safari process-crash reproduction or thermal/memory trace is available. The work demonstrates lower initial drawing attachment load, improved measured cadence, source-preserving local rendering and real offscreen suspension; it does not certify that the earlier physical Safari page/process failure is resolved. Functional and publication acceptance remain recorded by the root integration task.

## Primary references

Reviewed on 2026-10-09:

- [MDN: WebGL best practices](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices) supports smaller back buffers, bounded attachment estimates and avoiding blocking GPU queries.
- [React Three Fiber: scaling performance](https://r3f.docs.pmnd.rs/advanced/scaling-performance) describes demand rendering and explicit invalidation for active changes.
- [web.dev: high-performance CSS animations](https://web.dev/articles/animations-guide) distinguishes compositor-friendly transforms from properties that trigger layout or paint. That guidance does not mean moving a live WebGL surface removes its independent rendering cost.
