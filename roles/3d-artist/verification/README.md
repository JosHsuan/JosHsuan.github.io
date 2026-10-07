# Verification record

7 October 2026 (Europe/Berlin), Windows. Node 24.19.0, pnpm 11.19.0. This record covers local proposals and the preserved empty portfolio. No publishing workflow was invoked.

## Executed checks

| Scope | Result and evidence |
|---|---|
| Role build | PASS. Standalone `dist/` built from local bytes using the pinned root runtime. [build.json](build.json) lists actual bundle sizes and the compiled Theatre module graph. Studio imports are rejected during compilation. |
| Seven rendered families | PASS. [browser-results.json](browser-results.json): Chromium desktop (14 grouped flows), WebKit desktop (13), Pixel 7 Chromium emulation (13). All seven studies actually rendered; direct URLs, A/B, keyboard parameters, reset, idle, frozen captures and teardown passed. |
| Physics and particles | PASS. Four tests in [invariants.test.mjs](../tests/invariants.test.mjs): seeded particle reproducibility/bounds, rigid-body agreement at 30/60/120 Hz input schedules, floor collision, restitution difference, bounded catch-up and review schema guards. Tests assert local deterministic behavior, not cross-platform physics identity. |
| Theatre | PASS. Actual camera positions and assembly progress changed during clean-browser playback. Manual input released ownership. The full 4.8 s score completed and returned to idle. The genuine reused state retains four tracks, 24 keyframes and its source hash. No new Studio session is claimed. |
| Preference data | PASS. Real JSON downloads, 3D export/import, notes, reload persistence, malformed-input rejection without replacement, separate UIUX file hash/origin/key/time, and preservation of unknown historical IDs. Every QA browser/fixture is synthetic, never owner evidence. |
| Resilience | PASS. [resilience-results.json](resilience-results.json): all seven studies readable with JavaScript disabled; denied local storage still permits in-memory Save/notes/export; actual touch-emulated taps; synthetic document-hidden signal stops time; browser launched with WebGL disabled retains useful fallback and controls. |
| Context loss / offscreen | PASS across the three main profiles. Actual `WEBGL_lose_context` produced the fallback and explicit retry restored the scene. Scrolling the live stage offscreen paused it. Normal close did not report a failure. |
| Network | PASS. Main role browser runs requested no remote runtime resources. HDR, script chunks, motion state and poster bytes are local. |
| MCP | PASS. [mcp-results.json](mcp-results.json): both servers initialized; catalog tool discovery/read-only query/unknown-ID rejection; browser tool discovery/local navigation/accessibility snapshot/screenshot/close. [config-loader.json](config-loader.json) shows the actual installed CLI loading the two artist3d registrations. |
| Skills | PASS. Bundled `quick_validate.py` validated both role skills; UTF-8 mode was needed for the original skill on this Windows locale. The vendor Bash/npx recipe was not executed because npx is unavailable; role MCP and explicit tests were used. |
| Asset / boundary audit | PASS. [validation.json](validation.json): 7 studies, 14 actual poster hashes, 1 acquired HDR asset hash, real score hash, Studio module exclusion and 262 existing tracked/UIUX files byte-identical to the session baseline. |
| Empty production framework | PASS. `pnpm check`: content, ESLint, TypeScript, 9 unit/controller tests, static export and 63-file public artifact audit. Zero projects, research entries, approved assets and motion manifests; no generated detail routes. |
| Existing built-out browser tests | 9 passed: Chromium, WebKit and mobile Chromium. Three Firefox cases could not start: `browserType.launch: spawn UNKNOWN` at the existing `firefox-1543/firefox/firefox.exe`. The overall `pnpm test:e2e` command therefore exited nonzero; it is not reported as a fully passing suite. |

## Inspection and corrections

The actual desktop stage, full contact sheet, touch layout, refraction, scatter, particle and physics captures were visually inspected. Final A/B posters omit the live badge and retain exact captured state in [previews.manifest.json](../catalog/previews.manifest.json). Particle trails were added after inspection because dots alone made static axial/circulating A/B difficult to distinguish. Light presets use the same dielectric surface and exposure, with fill/filter as the compared variables.

The first browser pass found a real demand-loop wake issue on Play; an explicit invalidation fixed it. A context-loss listener was also moved into a cleanup-managed effect so normal disposal does not report failure. Subsequent test-harness fixes wait for actual renderer readiness and async file imports and disambiguate accessible output/status elements. Historical failed pass records are retained as development evidence; browser-results.json is the passing main run.

The final additions after the main browser matrix were static no-JavaScript HTML and explicit known/unresolved UIUX ID labels. The dedicated resilience suite and review unit test validate those changes; the 21 rendered A/B study visits were not redundantly repeated for text-only changes.

## Size and performance interpretation

Offline gzip measurements are in validation.json. The initial desk script is about 130 KiB gzip; the general live-renderer chunk about 560 KiB; the optional Rapier chunk about 811 KiB. The local server serves uncompressed source-readable bundles. These figures are not actual transfer timings. The stage uses DPR 1–1.5 and one active Canvas; demand-frame counters demonstrate idle behavior. Renderer memory counters are object counts, not VRAM byte measurements.

Three Clock and Rapier WASM initialization emit dependency deprecation warnings on this exact pinned stack; no page errors or shader compilation errors occurred in the passing main runs. Packages were not upgraded merely to remove warnings.

## Explicit limits

- The original owner's UIUX Saved snapshot remains inaccessible; no preference ID has been inferred. Imports/tests do not authenticate who made an export.
- Tests use desktop engines and Pixel 7 emulation. No physical mobile device, Safari device, Firefox scene run, field INP/LCP, sustained GPU/power budget or comprehensive screen-reader/WCAG conformance is claimed.
- The document-hidden check dispatches an explicit synthetic visibility signal; actual OS/background-tab suspension was not measured. Offscreen behavior and context loss were tested through actual browser mechanisms.
- Real Studio data is reused, with source attribution and exact hash. New authoring/export interaction was not performed in this role session.
- No root/subpath deployment, remote CI, commit, push, professional material import or private-drive access was performed. All new maintained source/tooling belongs to `roles/3d-artist/`.
