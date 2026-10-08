# Round 02 final verification

Verified 8 October 2026 on Windows, using Node 24.19.0 and pnpm 11.19.0. This record covers the owner-authorized local Bending-Active revision after the role-establishment checkpoint. It does not authorize public deployment or certify fabrication/structural performance.

## Final artifact and evidence

The final static case build succeeded. The complete browser matrix tested HTML SHA-256 `a77a84e572bd6b0db9886d73f4c37810ae895bd9af39d8b66b757097679dfa79`. Current runtime, model and responsive poster hashes are in [integration-manifest.json](integration-manifest.json). Source model revision: `ff112b90be104cca7e3705b5eee481ba3973d25e2f3d4a7350faa2f732cae47e`.

Detailed captures, traces and geometry witnesses remain under `D:/JosHsuan_Website/_work/bending-active-thesis/round-02`. The committed record contains conclusions and reusable verification code; it does not include private model/media handoffs or full source audits.

| Check | Actual result |
| --- | --- |
| Case build | Final Next static export passed after the heavy-frame response fix and responsive poster handoff. |
| Numerical and local HTTP suite | **37 passed**, zero failures; one optional WebGL fixture skipped by this ordinary invocation. |
| Separate optical WebGL fixture | Chromium **8/8** and WebKit **8/8** passed with Full 2x MSAA and resolved depth. Real near/far focus, scene/light-driven glyph pixels, preserved alpha and zero protected-region difference. |
| Final integrated browser matrix | **28/28 passed**, zero failures: Chromium 8, WebKit 7, mobile Chromium 7, and 6 fallback/artifact groups. Report: `verification/browser-round02.json`. |
| Source fidelity | Independent decoder/source comparison passed: 172,789 positions/normals and 227,521 triangle indices, including 50 base solids. Source and derivative hashes unchanged. Maximum position rounding error 5.913e-8 m; normals and triangle order exact. |
| Actual source framing | **90/90** FORM/CREDITS checks at five aspect ratios and nine pointer samples; all 172,789 vertices checked per sample, including near/far clipping. Report: `verification/source-framing.json`. |
| Responsive visual review | **28 captures**, seven chapters at 1440/1024/768/390 widths; all settled, no console errors or horizontal overflow. Parent and Cinema directly inspected all images. |
| Root `pnpm check` | Passed content, lint, TypeScript, 9 unit/controller tests, static export and the 63-file public artifact audit. Public arrays remain empty; zero generated detail routes and zero motion manifests. |
| Fresh root `out/` browsers | **9/9** passed across Chromium, WebKit and mobile Chromium emulation. |
| Protected boundaries | All **255** protected files match reviewed baseline/revisions. Global Codex configuration SHA-256 unchanged. |
| Local transport | Actual running 4184 HEAD responses return 200, gzip, Vary and noindex. Model 3,530,198 encoded bytes; HDR 1,187,556. HTTP tests confirm exact decompression, HEAD and containment behavior. |

The final behavior suite exercises genuine wheel/touch input, velocity onset and deceleration, idle rendering, all seven holds, reverse/jump interruptions, focus during a stationary camera hold, fixed-pose focal/light/defocus/ASCII pixel changes, protected reading masks, source inspection, keyboard navigation, Full/Light quality changes, pointer pause, live reduced motion, visibility resume, resize/resource stability, no JavaScript, initial reduced motion, Save-Data, blocked model loading and context loss. It validates the actual source revision and three layers rather than a stand-in fixture.

The final visual review confirms that the original base is visible, source figures remain opaque and readable, chapter-level separation captions no longer collide with mobile figures, and 2x MSAA improves thin source edges. See [the detailed review](../../../3d-artist/research/round-02/VISUAL_REVIEW.md). FORM and CREDITS contain the whole object; deliberately close cinematic chapters are not claimed to show every vertex.

## Findings resolved before the final run

The first Full-MSAA integrated run passed 27/28 groups. A real 316 ms rendering interval exceeded the original 250 ms stale-frame threshold and erased the response's deceleration tail. The analytical integrator now tolerates ordinary long frames, with a one-second stale threshold; explicit hidden/resume and reduced-motion events still seek immediately. Two numerical regressions cover heavy-frame deceleration and consistency down to 3 Hz. The rebuilt complete matrix then passed 28/28. The prior failure remains as `verification/browser-round02-pre-heavy-frame-fix.json`.

Earlier harness races waited on the old settled state before the native scroll event arrived. The harness now observes actual scroll and waits through animation-frame delivery. Earlier partial reruns are historical evidence, not added to the final 28-group count.

Motion, 3D Animation, Lighting and Scene launchers now prepare their referenced research/catalog files alongside isolated skills. Their actual prepared references resolve and copied hashes match; no credential file is copied and global configuration remains unchanged. Artist/Cinema skill instructions resolve from the role working directory as designed and required no launcher change.

## Limits retained

- The full source geometry is preserved: 227,521 triangles exceed the 150,000 target. Full rendering submits 455,046 triangles in eight calls including shadows, ground and display pass.
- Model plus HDR is 8,495,096 raw bytes and 4,717,754 gzip body bytes (4.499 MiB). Raw size exceeds both desktop/mobile targets; compressed delivery still exceeds the 2 MiB mobile target. Compression does not lower geometry or decoded GPU memory. Light retains the model and reduces rendering work; the poster avoids model/HDR loading.
- The recorded heavy frame is a local browser observation, not a physical-phone benchmark. No real mobile device was tested. A bounded Firefox attempt at the earlier checkpoint failed at launch with `spawn UNKNOWN`; Firefox assertions remain unverified and were not rerun in this final matrix.
- Focus, material, lighting and separated display layers are artistic presentation. No optical calibration, bending simulation, fabricated panel topology or construction-sequence claim is made. Reserved contract channels are not evidence of an implemented effect.
- Source year/attribution/media-release questions remain visible. The source narrative and assets are local, ignored and not included in Git history. A fresh checkout requires an authorized handoff to build this isolated case.
- No final subpath, remote CI, public hosting or deployment result is claimed. Git push and the manual Pages workflow are separate.

## Commit categories

The implementation follows the already pushed five role-establishment/research commits. New milestones separate source geometry/element animation, shared motion response, chapter lighting/staging, optical compositing, integrated case interactions, compressed local delivery, and final integration/audit documentation. No dependencies, generated output, runtime homes, credentials or ignored private handoffs belong in these commits.
