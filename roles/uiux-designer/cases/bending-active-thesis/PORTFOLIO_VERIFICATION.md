# Selected portfolio acceptance — 16 October 2026

This records the local implementation checkpoint for [decision 0011](../../../../docs/decisions/0011-selected-portfolio-navigation.md). The owner authorized commit, push and deployment through the existing CI gate. Local output is a worktree candidate based on `05923b7`, not a successful CI publication identity. Final CI and deployment provenance are separate.

## Requirement mapping

| Owner requirement | Implemented evidence and acceptance |
| --- | --- |
| Model-free Home matching the supplied direction | `PortfolioHome` has a CSS cold/warm light field and an original static ASCII field. The built Home has no scene, model poster or Canvas; normal-browser Home tests reject GLB/HDR/poster requests. |
| About / Project / Contact and team review | Six direct static routes share native navigation. All twelve existing role responsibilities were reviewed in three specialist groups; the visual, runtime and XR integration documents record their decisions and cross-review. |
| Preserve loading at entry and internal page changes | One root-layout SiteExperience waits for DOM, fonts and marked critical images. The original Bending EntryLoader remains its visible scene gate; its Director alone advances scene entry. Browser checks hold a real image, abort real fonts/images, inspect the outgoing native-click loading state and require one correlated terminal after navigation. CPU tests cover cancellation, deadlines, malformed/expired handoffs, history restoration and cleanup. |
| Scroll into Project, rather than into the thesis | Home's direct sections are About introduction, Project index and Contact. Its native `#projects` link and wheel movement are checked on the built artifact. The original seven chapters exist only on `/projects/bending-active/`. |
| Nine-grid project cards | The desktop index measures three columns and three rows. Only two selected real projects are cards; the remaining cells are unfilled grid space. Both use actual approved project images, native case links and responsive one/two-column layouts. |
| XR research case | The exact requested title, context, method, prototype, personal contribution, limitations and shared credits are present. Four inspected source derivatives and the authored summary are hash-pinned; the case adds no fabricated model, animation or live tracking claim. |
| Commit, push and Pages publication | The existing workflow requires successful same-commit default-branch push CI, verifies the complete tested output digest, and deploys that artifact without rebuilding. Publication is performed after local acceptance. |

## Executed checks

- `pnpm check` passed on Node **24.19.0** / pnpm **11.19.0**, including lint/types, framework/controller tests, CI selector/gate tests and the unchanged empty **63-file** reusable-framework artifact audit.
- The complete public build and privacy/asset audit passed for **115 output files / 40 approved assets**. It builds without the private preparation drive, and emits all six direct routes with one H1 and their canonical URLs. Existing thesis story and original asset bytes remain pinned.
- The case/tool portable command passed **332 tests**, with **two existing conditional skips** (334 total).
- All **54 focused built-artifact browser checks** passed across Chromium, WebKit and Pixel 7 emulation: Home/site navigation, original entry readiness, public-release baseline and Liquid Glass. This includes NoJS, actual failed resources, native history, one site loader, one case scene, and original optical/interaction thresholds.
- A separate actual-pixel contrast run measured **168 visible text lines across 60 targets**, desktop and mobile. All passed their original **3 / 4.5** requirements; the lowest measured ratio was **4.679**. One line hidden by the index card's deliberate line clamp is recorded as unmeasured, not silently counted as visible text. This is scoped sampling, not every page/time/device.

Ignored local logs are `.local-portfolio-{check,build,portable,browser-final}.log`. Contrast evidence is `animation-review/.local/portfolio-contrast-final/2026-10-15T22-33-15.385Z/results.json`.

## Diagnostic findings and limits

The first cross-page test fixture waited on a Locator while deliberately holding the document response; Playwright itself waits for that navigation, so it could not observe the old document. The final check captures the outgoing loader state in the actual click event, then checks the new document's correlated request, phases and terminal. It does not claim that a computed-style observation proves a compositor frame was presented before unload.

The mobile optical assay enlarges the real identity lens to 300×80. The newly added sibling route navigation then overlapped that synthetic lens's bottom rim. Actual-size controls do not overlap. Only that sibling is hidden inside the geometry-isolated assay; the preceding actual-size captures and all native filter, rim/core, direction, foreground, scroll and map-count assertions remain intact. Independent visual/source review confirmed this diagnosis, and the full final browser run passed unchanged thresholds.

Source review also found two real event-lifecycle gaps: FontFaceSet readiness can fulfill after a failed font, and an expired cross-document handoff could remain unclosed. The production manager now inspects actually failed FontFace statuses and explicitly closes or clears expired/mismatched/malformed handoffs without duplicating a stored terminal. Meaningful regression tests exercise these branches.

The first visual capture collected 24 viewport images and four supplemental full-grid element images. Its 16 received HTML documents exactly match the frozen built routes, and visual review found no blocking layout or authorship issue. Its raw receipt deliberately remains failed because it recorded one desktop GLB `ERR_ABORTED` with insufficient timing to establish whether this happened during document cleanup. The first receipt is not relabelled.

A fresh instrumented capture of the same frozen build passed **24 viewport checks / 28 PNGs**, with **zero failed requests, page errors, HTTP errors, overflow or capture issues**. No cleanup-abort exception was needed. Request start/failure timestamps, main-frame document generations and close intervals are recorded. All four Bending views reached actual Full readiness with one scene Canvas; generic routes requested no case assets. Its 16 received HTML documents again exactly match the frozen output. The previous abort did not recur; its cause remains unproven. The authoritative local capture is `animation-review/.local/portfolio-final-audited/2026-10-15T22-38-50.354Z/results.json` (SHA-256 `669eaf12d7cbfdbe9fbb2cec3cb798dae3d698825f20b5ee47ea5acf6562e9c0`).

Full-grid element screenshots extend beyond the viewport and can composite fixed navigation differently. Normal viewport screenshots are the primary visual evidence. Browser emulation and functional checks do not establish physical iOS/Android behavior, sustained GPU performance, all-scene contrast or the reliability of the archived XR application.
