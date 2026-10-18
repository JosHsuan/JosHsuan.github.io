# OCR identity and XR viewport verification

Date: 18 October 2026 (Europe/Berlin).
Status: native room, Rhino shutdown, local responsive image review and OCR/shared
chrome checks verified; exact CI artifact and live publication remain pending.

This record covers [decision 0015](../../../../docs/decisions/0015-ocr-identity-xr-workspace.md)
and the [current integration contract](OCR_XR_VIEWPORT_INTEGRATION.md). It does not
replace earlier raw receipts or imply that the preceding published artifact
contains this work.

## Completed local checks

- The exact Node 24.19.0 and pnpm 11.19.0 toolchain ran `pnpm check` successfully.
  Raw output: `animation-review/.local/ocr-xr-pnpm-check.log`. This validates the
  empty framework, source lint/types, portable framework tests and framework
  export; it is not public-case browser acceptance.
- Public-case and role-tooling portable tests completed with 455 tests:
  453 passed, two existing conditional skips and no failures. The initial run
  retained 11 failures from old XR DOM fixtures. The fixtures now represent the
  workspace image and glass nodes; an unrelated-key RAF regression was repaired
  without removing its assertion. The two raw runs remain separate:
  `animation-review/.local/ocr-xr-portable-initial.log` and
  `animation-review/.local/ocr-xr-portable-corrected.log`.
- OCR B's original outlines and metrics survive the documented derivative.
  The package, original font, published WOFF2 and public notice have recorded
  hashes in [the typography record](OCR_TYPOGRAPHY_INTEGRATION.md). Actual browser
  font usage, text clipping and all-route coverage still require the built
  browser checks.

The first selected public build passed its export audit: 145 output files and
61 approved assets. That output contains the isolated native front-view
checkpoint, which the subsequent architectural-background request supersedes.
The first typography browser run completed with 24 passes and six failures.
All seven route font/glyph/readability checks passed across Chromium, WebKit and
mobile Chromium, as did Home's responsive header checks. Both project headers
overlapped at 781px in all three engines: the identity was 336.3px wide and
intersected the centered navigation. The shared header now extends its existing
compact identity treatment to 1100px. The subsequent unchanged header assertions
pass against the rebuilt room output. The raw run and six traces remain preserved at
`animation-review/.local/ocr-xr-typography-initial.log` and
`animation-review/.local/ocr-xr-typography-initial-traces/`.

The Windows preview-server teardown stalled after all 30 cases finished. Its
exact task-created process and command were verified before stopping that one
server, allowing the runner to emit its complete failure report. No other Node
or Rhino process was stopped. This is not a passing rerun or an altered deadline.

The native architectural-room checkpoint completed 69 targeted browser cases:
62 passed and seven failed. Two failures compared the desktop chapter rail's
content-derived CSS `bottom`, although its fixed `top`, width, right anchor and
appearance already matched. Bending has seven links and XR eight. The comparison
now preserves those shared invariants and checks the fixed top on desktop and
fixed bottom on mobile. Five Windows WebKit failures require actual native MP4
playback and remain failures, with no relaxed playback assertion or deadline.
Raw output and all seven traces remain at
`animation-review/.local/ocr-xr-browser-room4k-targeted.log` and
`animation-review/.local/ocr-xr-room4k-initial-traces/`.

A separate native-video probe without WebGL used the same pinned Adapt MP4.
Windows Chromium loaded its 666 × 1440, 13-second recording and played it;
Windows WebKit returned native MediaError code 4, zero decoded dimensions and
`NotSupportedError` from `play()`, despite advertising codec support. The probe
receipt is `animation-review/.local/native-mp4-probe-2026-10-18T15-47-17.368Z.json`.
This establishes the local port's native acquisition failure, not Safari-wide
compatibility or successful playback. The strict Linux CI WebKit media checks
are still required.

The final canonical-LF source build again passes the full release audit:
145 files and 61 assets (`ocr-xr-selected-build-room4k-lf.log`). All 33 focused
cases pass on that output across Chromium, WebKit and mobile Chromium: seven
actual OCR route/font/readability cases, three responsive header cases and the
shared study chrome case per engine. Raw output is
`animation-review/.local/ocr-xr-browser-room4k-final-font-chrome.log`.
The root also inspected actual 2× desktop/mobile opening and Context captures,
including mobile reading scroll, under
`animation-review/.local/room4k-page-2026-10-18T15-49-33.015Z/`.
The native room remains proportionally contained, uses the correct 4K source
for each viewport, and leaves the structure/TV pixels unchanged. These are
browser-emulated viewports, not physical-device tests.

## Native room capture acceptance and application shutdown

The source/art-direction and root integrator reviewed the actual native room
candidate and selected its frontal, level, central-axis composition with the
original side/rear walls, ceiling, floor/carpet and room fixtures retained.
The source selection restores 127 architectural objects and retains **4,022
original objects**, excluding only the 29 obstructing front glazing/frame
objects, approved 118 foreground speaker/cabinet objects, ten originally hidden
objects and 25 non-surface/clipping annotations. The source geometry and all
object placements remain original.

The final image pair is a genuine **Rhino 8.35 native Rendered viewport** capture
through the owner-selected Rhino/MCP session, at **4096 × 2880 desktop** and
**2160 × 4674 portrait** pixels. The selected native lighting recipe uses a
neutral key, subtle cool fill and warm rim, with original materials and TV
texture/UV assignments. All temporary lights are removed afterward; original
active lights/sun and the user's OpenGL Good antialias setting are unchanged.
No persistent display profile is updated. The original room floor is retained;
only the synthetic infinite environment ground plane stays disabled.

For each final capture, all **4,204 original geometry DataCRCs** match before
and after capture. Native TV screen world vertices, quad topology, UVs and
material assignment exactly match independently read source values. The
native PNGs contain real alpha with zero visible pixels on every outer edge.
Lossless exact WebP encoding decodes to identical RGBA bytes across
**21,892,320 original pixels**; there is no upscale, crop, warp, redrawn TV
image, colour grade or compositing. The original raw native receipts remain
untouched; independent CPU alpha measurements live in `capture-verified.json`.

The synchronized public workspace JSON SHA256 is
`d912d9a204f66df5380d9d2f00cc954a6484ee9da18a8bdf362095405a4ed8ec`.
The manifest retains 61 assets. At native handoff, its other 59 pins were
unchanged; the later canonical-LF correction also repins the OCR notice's line
endings, preserving its complete text. The other 58 pins and both native image
pins stay unchanged through that correction. Workspace JSON has 11,544 bytes,
notice has 1,845 bytes, both contain zero CRLF and each has equal Git filtered
and no-filter blob identity. The source hashes therefore survive Git's
`text/eol=lf` normalization. Exact image
hashes, native framing, source identity and private receipt locations are in
[the source review](XR_WORKSPACE_SOURCE_REVIEW.md). These are source/native
image checks, not built-page or deployment acceptance.

The root closed the task-created Rhino window at **17:35:30 CEST on
18 October 2026**, using Alt+F4 and **No** at the save prompt. Fresh window
inventory finds no Rhino window and TCP 1999 has no listener. Both original
CAD and working copy retain source SHA256
`52a2c77039977c612afd05d1179410927cbe0a48b83439aa55ac98a9eaef666b`;
neither file was saved. The actual close action, post-close checks and the
initial no-action UI-stream failure remain in
`animation-review/.local/xr-workspace-oct18/rhino-close-verified.json`.

## Image review and remaining acceptance

The original CAD remains read-only. The first elevated three-quarter workspace
capture was explicitly rejected by the owner. Its temporary pins and local
captures do not constitute visual acceptance. The replacement native room pair
above satisfies the reviewed source/camera, authorized visibility, actual
materials/lighting, true alpha and high-resolution image requirements. Its
engine and source identity are recorded. Responsive framing and text/model
relationships still require the final built-page browser checks.

The exported public application still requires all-route OCR and 404 checks,
shared Bending/XR chrome geometry, full-viewport XR canvas geometry, workspace
decode/error terminal behavior, model hits, all three native phone recordings,
interrupted lifecycle checks, and Bending regression with the intentional OCR
typography change distinguished from protected scene behavior.

Publication remains authorized through completion. Record the exact final
commit, successful CI run, tested artifact digest, deployment run, exact live
bytes and live browser captures here only after those events have occurred.
