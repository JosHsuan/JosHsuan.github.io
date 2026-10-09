# Round 09 — Moving contained Canvas

Date: 9 October 2026. Released baseline: `ed598100a3149f328a7906bca3b01e1a807d0a4c`.

## Requested outcome and team review

The owner approves the current presentation direction and requests a lower-load implementation in which the Canvas itself moves, follows reading and contributes to chapter transitions. The user also authorizes classified commits, push and Pages publication. [Decision 0007](../../../../docs/decisions/0007-moving-thesis-canvas.md) records the changed placement contract.

Three delegated reviewers grouped the established disciplines, exchanged recommendations and reviewed the integration: [experience and information/motion direction](../../../experience-director/research/ROUND_09_CANVAS_DIRECTION.md), [3D, geometry, camera, lighting and scene](../../../3d-artist/research/ROUND_09_CANVAS_SCENE_REVIEW.md), and [performance/runtime architecture](../../../performance-engineer/research/ROUND_09_CANVAS_PERFORMANCE.md). These grouped reviews cover direction, interaction, motion, source geometry, materials, lighting, scenes and runtime performance. Reviews corrected sticky source positioning, local pointer coordinates, first-paint ordering and opening-panel spacing.

## Implemented ownership

- One retained Canvas with stable logical dimensions. The controller translates and uniformly scales the surface between actual anchors, clips its available space to visible reading bounds, and provides bounded entry/exit motion. It never animates backing width/height.
- One scene camera with a fixed local source aperture. Original source supports remain fitted with the existing 3% margin inside that aperture. The exact source geometry, Full MSAA 2, material/lighting/optical direction and all 36 assets are retained.
- OVERVIEW and CREDITS have reserved poster/assembly positions. Phone order is title, model, introduction. Source chapters retain their clear apertures and desktop sticky placement. MAKE/VALIDATION remove the surface and cease GPU submissions while the document remains active.
- Returning surfaces wait for a passive acknowledgment of a current-chapter render before revealing the raster. The acknowledgment schedules no work; the existing controller owns reveal and the existing renderer owns rendering.
- Nonsticky anchors use cached natural positions. Only the current active sticky source needs a live rectangle. Actual mesh coordinates and field interference follow the transformed Canvas. No CSS perspective or rotation breaks the rectangle-based hit-test contract.

## Verification record

The production build at runtime commit `5f83413` passed its public audit: 80 files and 36 approved assets. `pnpm check` passed, including the unchanged empty-framework export and 63-file audit. The portable suite passed 156 tests, with two conditional browser fixtures skipped. New pure coverage includes seven outer-motion tests and 300 exact-support local camera configurations; the minimum measured margin is 3.006567%. Existing 825 public GLB projection configurations still pass.

All 78 current public-browser scenarios have local coverage across Chromium, WebKit and mobile Chromium. The full run passed 76; two workers had already loaded the earlier desktop fixture for a new offscreen-workflow scenario. Their traces show the intentionally sticky desktop Canvas remained docked. The corrected 390 × 844 fixture passed in all three engines in a focused follow-up, retaining the zero-new-GL-frame, visible-SVG progression and actual-source return assertions. This is a test precondition correction, not a relaxed visibility or rendering requirement. The final same-commit CI run remains the publication gate.

Coverage includes a retained Canvas across chapter travel, intermediate and reverse transforms, stable camera and backing dimensions during paused scrolling, no stale re-entry raster, local pointer-field coordinates, real mesh hits, all original source variants, source-support containment, allocation counts, browser inset/orientation changes, Full/Light, native reading and history, keyboard/touch input, Pause/Reduced, failure fallbacks and lifecycle suspension. Every source/asset checksum remains unchanged. The three-engine scroll-allocation check records no new native dimension writes or texture/renderbuffer storage calls after warmup; MAKE/VALIDATION and the narrow offscreen-source interval add zero scene frames after settling.

Direction inspected 27 Full-mode stills: seven chapters plus a SYSTEM clipped boundary and reverse return at 1440 × 1000, 820 × 1180 and 390 × 844. Phone opening padding and the desktop title/Canvas gap are corrected. Tablet review found real source hints behind the fixed rail, so the existing 781–1100px layout now reserves a 94px right gutter. Six final stills at 820 × 1180 and 1050 × 900 confirm the correction. All three source-caption boxes end before the rail: 740 < 751.75px at 820px, and 970 < 978.875px at 1050px. These paused images establish composition; browser motion tests and real-clock performance profiles establish separate behavior and timing evidence.

Private raw profiles, captures and release evidence are under `D:/JosHsuan_Website/_work/bending-active-thesis/round-09/verification`; this path is not a build input.

## Matched real-clock performance

The unchanged profiler ran the released Round 08 site and the local production export sequentially on the same Windows 11 / Intel i9-13900HX host. Chromium 153.0.8010.12 used a 1440 × 1000 viewport, device DPR 2 and ANGLE SwiftShader. WebKit 26.6 used a 390 × 844 touch viewport and device DPR 3. Each run used 15 seconds of warmup, an 84-second Full traversal, 25-second visible Full overview, 60-second Light traversal and the same pause/resume sequence. The after artifact identifies `5f83413838083eb600adf4637e50acf892307fc1`; its HTML SHA-256 is `3a0c2c8d06d75cb4c3936164942473d332277ab79152b875d2ba1406579919a5`. Delivery differs between the public baseline and local export; visible stationary measurements follow the traversal and completed asset loading. Full methodology and raw counts are in the [performance report](../../../performance-engineer/research/ROUND_09_CANVAS_PERFORMANCE.md).

| Measurement | Round 08 | Round 09 |
| --- | --- | --- |
| Desktop first/max sampled Full target pixels | 1,598,918 | 621,360 (61% fewer) |
| Desktop first/max sampled attachment estimate | 59,486,808 bytes | 23,080,128 bytes (61% lower) |
| Desktop warmed Full target / attachment estimate, both pressure scale 0.5 | 399,466 pixels / 15,102,696 bytes | 155,160 pixels / 5,830,368 bytes |
| Desktop visible Full overview | 75 frames / 25.612 s = 2.93 FPS | 108 frames / 25.236 s = 4.28 FPS |
| Desktop Full traversal browser RAF p50 / p95 | 50.1 / 283.3 ms | 16.7 / 200 ms |
| Phone-viewport first/max sampled Full target pixels | 513,785 | 195,364 (62% fewer) |
| Phone-viewport first/max sampled attachment estimate | 19,084,908 bytes | 7,258,088 bytes (62% lower) |
| Phone-viewport warmed Full target / attachment estimate | 128,061 pixels / 4,812,348 bytes, pressure scale 0.5 | 195,364 pixels / 7,258,088 bytes, pressure scale 1 |
| Phone-viewport visible Full overview | 392 frames / 25.182 s = 15.57 FPS | 608 frames / 25.015 s = 24.31 FPS |
| Phone-viewport Full traversal browser RAF p50 / p95 | 156 / 273 ms | 134 / 240 ms |

The phone result has a material quality/cost tradeoff: the new scene stays at DPR 1.25 instead of dropping to 0.625. Its warmed target therefore has 53% more pixels and about 51% more estimated attachment storage than the old density-relieved state, while delivering the better visible cadence above. The measured reduction applies to initial/max sampled targets; it is not a universal reduction in steady-state memory. The policy and Full two-sample/five-pass optical path remain unchanged.

Entire-route rendered-frame counts are lower because the new Canvas sleeps during evidence passages; they are not used as an FPS score for the route. After resuming at that same absent passage, both engines continue the shared clock but add zero scene frames across the 10-second resumed phase and following 5-second observation. Explicit Pause adds zero controller and scene frames. Both after profiles completed with zero recorded page/console errors, crashes or context-loss events. Resource counts remain bounded; attachment estimates exclude source buffers, environment/shadow maps, browser composition and driver storage. Headless tab foregrounding did not actually hide the first page, so real OS backgrounding remains unverified; the separate browser tests cover synthetic lifecycle composition.

## Scope of conclusions

The source-fit microbenchmark is CPU arithmetic evidence, not a browser FPS test. Production real-clock measurements are reported separately from controlled-clock functional tests. Compositor byte estimates are not total GPU/process memory. Windows Playwright WebKit is not an affected physical iPhone; the earlier Safari whole-process crash remains unverified on the owner's device. This round's completion requires the requested architecture, preserved presentation/interaction, measured lower work and successful publication, without claiming physical-device crash resolution.

## Publication

Use the successful same-commit `ci.yml` push artifact after all five jobs pass. The private publication record and final task report identify the CI run, deployment and live SHA, avoiding a self-referential commit identity in this document.
