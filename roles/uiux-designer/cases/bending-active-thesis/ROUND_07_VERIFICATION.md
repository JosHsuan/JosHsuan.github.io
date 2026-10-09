# Round 07 — Rendering pressure and clear reading layers

Date: 9 October 2026. Baseline: `5261c5eba83315b9b465b469a08fa35f60407544`.

## Scope and evidence limits

The owner reported Safari's whole-page “A problem repeatedly occurred” screen on desktop and iPhone. The supplied screenshots establish the failure symptom, not its cause. No identical process crash has been reproduced on this Windows host. This release addresses measured rendering pressure and concrete allocation/lifecycle issues; it does not claim physical Safari crash certification.

The [Experience Director](../../../experience-director/research/ROUND_07_LAYER_REFACTOR.md), [Performance Engineer](../../../performance-engineer/research/ROUND_07_PERFORMANCE_AUDIT.md) and [Software Architect](../../../software-architect/research/ROUND_07_RUNTIME_AUDIT.md) coordinated the change. A separate material/motion peer reviewed source geometry, optics and sizing. Existing discipline records supplied source and motion contracts; this is not a claim that every historical role independently ran a new review.

## Delivered behavior

- One permanent rear Canvas replaces foreground promotion and semantic alpha masks. Near-opaque rounded graphite surfaces preserve clear reading boundaries. Chapter light and pointer-coupled rims connect layers without full-screen blur or black scrims. Models remain visible through clear source apertures.
- Physical rendering is capped at 1.6 million pixels in Full and 1.2 million in Light, additionally bounded by texture dimensions. A renderer guard runs before Fiber sizing; it also shrinks the old height before a wide new width can create an oversized intermediate canvas allocation.
- A single passive cadence observer reduces density through 1, 0.8, 0.65 and 0.5 stages only after sustained slow delivery. It does not schedule frames, modify story time or remove effects. Warmup, actual new shader programs, resize, hidden/Pause/Reduced and deliberate interaction discard incomplete observations. Density does not oscillate upward automatically.
- A small glyph-cell pass amortizes field/luminance/depth calculation. Original 16-tap depth-of-field and highlight diffusion remain. Fractional density scales optical radius to preserve the requested CSS footprint. Disabled mist/cell targets are released.
- The controller caches nodes, batches relevant layout reads, skips unchanged DOM publication and bounds hover hit testing. Page-cache, freeze and visibility suspension compose; returning clears stale time and held gestures. Assets that finish while hidden wait before GPU construction.
- Source title/hint groups enter together with their backing, correcting observed boundary escapes and text overlap. Opening and study-label backings paint directly on their containers with compensating margins/padding. Phone versions use inset-only shadows. Completed entrances release identity 3D/filter transforms, while active pointer/focus feedback retains perspective; the long reading root uses an equivalent 2D translation.

Original story, all 36 approved assets, topology, normals, source colors, source edges, fonts, camera/light/element scores and documentary evidence remain unchanged. One Canvas, one camera writer, one active story clock and no per-frame React state remain the ownership contract.

## Verification record

Local integration checks, final real-time profiles and visual review are complete. Exact-head CI and Pages deployment remain mandatory publication gates below.

The current `pnpm check` passed, including nine framework tests and the 63-file framework artifact audit. The final portable case run passed **143 tests**, with two conditional browser fixtures skipped and no failures. Scoped ESLint passed with one expected static-image warning in `SourceDiagram.jsx`. Build 6 passed the public audit: **80 files, 36 unchanged approved assets, no private inputs**.

All **60 browser scenarios** have passing results across Chromium, WebKit and mobile Chromium. The first full matrix passed 59; one WebKit assertion sampled the last tiny pointer-return transform before it became idle. Polling the actual settled transform repaired the test synchronization without changing runtime behavior or its expected value. That scenario then passed in all three projects. Coverage includes every native drawing-buffer assignment during tall-to-4K resize, quality/resource plateaus, hidden asset completion, overlapping synthetic lifecycle signals, source gestures, navigation/history and contrast over actual/white/black backgrounds.

Windows Playwright WebKit screenshots omitted the Canvas after buffer resizing. The pinned 1.63.0 runtime matches the platform/version in [upstream issue 42885](https://github.com/microsoft/playwright/issues/42885); this is a test-environment limitation, not evidence of a physical Safari diagnosis. A one-shot readback immediately after the final default-framebuffer draw confirmed the actual model and field. The initial composed screenshot showed both; after portrait/landscape/portrait resizing, the screenshot omitted them while the framebuffer still contained 101,090 pixels with maximum RGB channel above 40 (487 × 1055, all pixels with nonzero alpha, GL error 0, context not lost). Performance profiles never use this synchronous readback. Chromium captures supply the composed visual acceptance; WebKit fixtures and functional checks remain engine-level coverage.

Completed intermediate checks: the Build 2 Chromium allocation/lifecycle and source interactions passed seven scenarios; the contrast scenario passed after correcting its measurement procedure. The probe now disables its own color transition and reads text in the unobscured viewport center, rather than sampling a transition or fixed-toolbar overlap. These are test-method repairs, not reduced contrast thresholds.

Both engines passed nine optical comparison scenes: plain color, source glyphs, depth focus, opaque-background focus and mist are byte-identical to the baseline compositor with obsolete masks absent. Four autonomous-field scenes differ by at most 1/255 per channel due to half-float density. Two proposed far-background shortcuts were rejected after silhouette-diffusion differences and are absent from the final implementation. Resource fixtures verify disabled mist releases two textures and sub-0.5 DPR retains CSS optical size.

Private raw logs, profiles, comparisons and rendered captures live under `D:/JosHsuan_Website/_work/bending-active-thesis/round-07/verification`; this directory is not a build input. Reusable measurement/capture scripts live with the relevant roles.

## Measurement interpretation

The baseline and after-profile use identical real-time phases, one browser at a time. Chromium reports ANGLE Vulkan SwiftShader on this host; Playwright WebKit's Apple GPU string does not identify a physical iPhone. Test-clock visual/functional captures are never reported as performance measurements. Estimated compositor bytes exclude driver allocations and are not a measured process-memory peak.

Build 1 improved the matched desktop Full traversal by about 48% and reduced its compositor estimate by about 29%, but mobile stationary performance regressed. That checkpoint was rejected as final performance acceptance. Build 6 includes the allocation guard, density policy, direct reading backings and restored original DOF gather.

| Matched real-time phase | Chromium baseline → Build 6 | WebKit phone viewport baseline → Build 6 |
| --- | --- | --- |
| Full traversal, about 84 seconds | 2.37 → 11.45 FPS | 5.68 → 6.25 FPS |
| Full stationary overview, about 25 seconds | 1.05 → 3.03 FPS | 12.39 → 16.04 FPS |
| Light traversal, about 60 seconds | 7.77 → 31.93 FPS | 4.89 → 5.22 FPS |
| Full traversal RAF median / p95 | 433 / 967 → 50 / 283 ms | 167 / 292 → 156 / 281 ms |

The traversal contains scenes of different cost, so average delivered FPS and median RAF are not reciprocals. Full and Light traverse different chapter sequences; compare each row before/after, not modes against each other. The final profiles each cover over three minutes, retain zero page errors/crashes/context losses, and show zero rendered frames, controller frames or authored seconds during the ten-second Pause. These are measured improvements, not achievement of the proposed 60 FPS desktop / 30 FPS phone thresholds on this test host.

At the warmed stationary density floor, estimated compositor storage fell from 83,253,600 to 15,102,696 bytes on desktop and 19,049,568 to 4,812,348 on the phone viewport. These are attachment estimates, not total GPU/process memory. Warm source geometry counts remain 14; Full adds one glyph-cell texture (11 versus 10). Separate repeated resize/quality tests establish bounded resource plateaus. The existing source transfer and triangle budgets remain exceeded; no source simplification or newly fabricated asset was introduced.

Headless tab foregrounding did not make the tested page hidden, so actual OS backgrounding was unavailable. Separate synthetic lifecycle tests verify application handling without claiming physical Safari background coverage. A real-device follow-up remains necessary to establish whether the owner's specific repeat-crash symptom is resolved.

## Actual visual review

Build 6 produced 26 actual Chromium captures: all seven chapters and three source apertures at 1440 × 1000 and 390 × 844, two entrance samples at each size, and overview/SYSTEM at 3840 × 2160. All captures passed one-Canvas, ready/Full, rear-layer and no-horizontal-overflow checks, with zero page errors. Opened captures confirmed the direct opening material, grouped study labels, clear model apertures, original source diagrams, orange evidence treatment and 4K composition. The previously observed study-title escape and diagram-heading/hint overlap are corrected by grouped entrances.

The density floor makes source edges softer on a slow renderer; this is the explicit sampling-cost tradeoff, without changing topology or authored optical radius. Fixed phone navigation can cover the edge of partially entering content; native scrolling exposes it and browser tests verify controls/focus remain reachable. These sampled phases do not certify every animation frame or physical device. The private `visual-final/capture-report.json` records each actual phase and allocation; test-clock captures are excluded from performance claims.

## Publication gate

The owner authorized categorized commits, push and GitHub Pages deployment. The deploy workflow requires a successful exact-default-branch-SHA `ci.yml` push run and consumes its existing `static-export-pages` artifact. The final task report and private release evidence record the run, deployment and live SHA; this file cannot include its own final commit identity without changing it.
