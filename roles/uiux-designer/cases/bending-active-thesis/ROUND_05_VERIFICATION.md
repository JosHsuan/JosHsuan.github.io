# Round 05 verification — continuous reading

Date: 8 October 2026. Baseline: `fc29c625c9314fae88be599de300f823beec6d44`. Toolchain: Node **24.19.0**, pnpm **11.19.0**, existing committed lockfile.

## Accepted behavior

The owner requested one continuous page, scroll damping/acceleration/reading stops for information as well as the source model, bounded image/text spatial feedback, and verification of the actual Saved fonts. The [cross-role direction](../../../experience-director/research/ROUND_05_DIRECTION.md) records the shared decisions.

One analytical pixel-space spring now drives the full reading plane and common camera/layer/light score. Natural document coordinates remain authoritative. Measured heading, prose and figure stops preserve access to every intermediate reading position; long phone sections receive multiple stops. Local text/image pointer and keyboard feedback shares the existing tick. There is one Canvas and one camera writer, with no per-frame React state.

FORM model controls and source-image comparison are inline. The fitted source view blends continuously with the story camera according to the measured clear slot; only full study influence promises complete framing. Controls persist across reverse scrolling. Mouse/keyboard model input is bounded; touch continues native page scrolling. Source-fixed Studio/Raking light, existing satin material and exposure remain consistent. Scene optics fade as the study takes over.

Hashes, initial deep links, keyboard paging, focus and exact Back/Forward positions seek to natural coordinates. A seek bypasses its current hold until the reader exits it. Reduced/Pause restores the natural document and immediate explicit controls. Failed assets, unavailable WebGL and context loss preserve reading and source evidence.

## Executed checks

| Check | Result |
| --- | --- |
| Root `pnpm check` | Passed: content validation, lint, types, 9 unit/controller tests, empty-framework build and 63-file audit. |
| Case pure tests | 94 passed, 1 optional GPU fixture skipped, 0 failed. Includes 105 full-source projection cases over 18,142,845 projected vertices, continuous camera/lighting, reading holds, reversal, idle and 3–120 Hz response. |
| Public build, `pnpm build:pages` | Passed: 59 output files, same 15 approved assets, public boundary audit. |
| Scoped JSX lint | No errors; three existing native-image warnings. A broader role-lint attempt traversed ignored generated bundles and failed; that result is not represented as a passing source lint. |
| Model browser matrix | All 15 cases passed across Chromium, WebKit and mobile Chromium: inline controls, lighting/separation, persistence, reduced motion, fallback/recovery and idle. |
| Public browser matrix | All 12 cases passed across the same three projects: reading, navigation, source evidence, quality and failure paths. |
| Final motion browser matrix | All 9 cases passed on the final build: whole-plane response, reading stops, spatial feedback, inline evidence, focus/Pause/Reduced, initial hash, keyboard paging and exact history restoration. |
| Whitespace validation | `git diff --check` passed. |

The local browser results cover all 36 cases across the full run and the final targeted regression; they are not a claim of one final all-green 36-case invocation. The prior full run exposed exact history restoration and a software-renderer-sensitive response assertion. History was fixed in runtime; the DOM response test uses supported Light mode to avoid the explicit one-second stale-frame seek guard. Full camera/model/light behavior remains separately covered. The exact pushed commit must pass the entire remote CI matrix before deployment.

## Visual review

The final capture pass produced 23 screenshots at 1440×1000, 1024×768, 768×1024, 390×844 and 360×800. Recorded chapter samples have one Canvas and no horizontal overflow; all five capture sessions report no page errors. The inline study reaches influence 1 at every captured size. Root reviewed desktop FORM/study, phone study and phone SYSTEM; Lighting/Scene reviewed the final desktop and phone study and accepted both.

Phone acceptance includes the lighter study scrim, larger control labels, a touch-appropriate view hint and no decorative viewport border. The actual source holes, surface relief and complete base remain visible in the fitted view. These are emulated viewport checks, not physical-device certification. Local ignored evidence is under `verification/round05/`; screenshots and browser-profile data are not published.

## Source and release provenance

- Source GLB SHA-256: `ff112b90be104cca7e3705b5eee481ba3973d25e2f3d4a7350faa2f732cae47e`.
- Approved story SHA-256: `4df944efbfca4421457eb2205cdaad9d8c2990adc921c5e95415f9012f77ad32`.
- Framing support SHA-256: `84e5c828e4a788577d6ca8a29eb539332b284763a2087a48a44abc2bca96c53a`.
- Geometry remains 172,789 vertices, 227,521 triangles and 51 source objects, including 50 base solids. No texture, public source asset, narrative, dependency or private input was added.

The integration manifest hashes committed runtime blobs and preserves Round 04 as historical evidence. User-authorized deployment consumes the successful same-commit CI artifact without rebuilding. GitHub Actions and public `/release.json` are the deployment evidence; no remote success is claimed by this pre-push record.

## Outstanding requirement and limits

**Saved typography is unresolved.** Only the original review browser's `uiux-material-review-v1` value or its `uiux-discussion-choices.json` export can establish the owner's selection. Narrow read-only local recovery did not find it, and the browser connector could not initialize. A local recovery page is available for the original browser; no receipt was obtained during acceptance. No curator recommendation, automated fixture or remembered shortlist is presented as the owner's preference. Existing fonts are unchanged pending that evidence.

The earlier transfer and triangle budgets remain exceeded by the unchanged full source. Real-phone performance, physical Safari/Android and measured GPU timings were not certified. Framework browser checks were not rerun locally this round; remote CI covers root/subpath Chromium, Firefox and WebKit. Public-case Firefox is not in the configured browser matrix. No new Theatre export, structural simulation or fabricated engineering fact is asserted.
