# OCR identity and XR viewport verification

Date: 18 October 2026 (Europe/Berlin).
Status: native room and Rhino shutdown verified. The later OCR-body /
Space-Grotesk-heading and Apple-informed spacing amendment is implemented;
its final built-browser, CI artifact and live acceptance remain pending.

This record covers [decision 0015](../../../../docs/decisions/0015-ocr-identity-xr-workspace.md)
and the [current integration contract](OCR_XR_VIEWPORT_INTEGRATION.md). It does not
replace earlier raw receipts or imply that the preceding published artifact
contains this work.

## Typography amendment and superseded checkpoint

The owner's later instruction separates OCR body text from a GitHub-sourced
heading face and adds site-wide Apple-informed letter spacing and leading.
The implementation now uses OCR B and Space Grotesk with explicit reading,
caption, control, label and heading roles. The source, OFL notice, exact font
identities and custom spacing decisions are maintained in
[the typography record](OCR_TYPOGRAPHY_INTEGRATION.md).

The single-face commit `330951bc1f5e1962704177776ae5b832d40ab117` was pushed but
never deployed. Its CI run `39142455980` is not a publication gate: actual failures
include a 361px Home navigation hit area extending to 361.375px, a 320 × 700 model
caption extending below its available reading area, the obsolete opening-photo
expectation, and WebKit publishing entry before failed native font acquisition.
The new implementation corrects the layout, aligns the existing evidence test
with the authorized photo removal/real workspace, and waits for the two declared
native font families after DOM readiness. It preserves the 15-second deadline,
all native reading/viewport assertions and the original protected 3D ownership.
Three new readiness regression cases and all existing cases in that file pass:
52/52 (`animation-review/.local/ocr-space-required-font-readiness-unit.log`).
The amended local source checks and focused browser acceptance are recorded
below; their new CI gate and deployment remain pending.

### Amended two-face local acceptance

The exact toolchain passes `pnpm check` again
(`animation-review/.local/ocr-space-pnpm-check.log`). Portable case and role
tests report **458 total, 456 passed, two existing conditional skips, zero
failures** (`ocr-space-portable.log`). Required-font readiness is 52/52 as
recorded above. The final selected application build passes its full audit:
**147 output files, 63 pinned assets**, with the earlier 61 records unchanged
(`ocr-space-selected-build-responsive.log`).

The first two-face focused run retained its **46 passed / two failed** result
(`ocr-space-browser-targeted-initial.log` and `ocr-space-initial-traces/`).
Both failures were measured mobile layout: native XR Adapt anchor clearance
and the 320 × 700 Bending annotation column. Source CSS now gives XR native
chapter anchors 8rem of header clearance at narrow widths, and the annotation
column uses its available width, neutral OCR tracking and smaller paragraph
gaps without hiding source copy or changing font size. Original assertion
bounds and deadlines remain unchanged.

The resulting built-output rerun passes **48/48 cases** across Chromium,
WebKit and mobile Chromium (`ocr-space-browser-targeted-responsive.log`):
seven actual two-face route/glyph/spacing checks including 404, three responsive
header cases, source-artwork font roles, real unavailable-font terminal failure,
native XR evidence navigation, Bending annotation geometry, shared project
chrome, and actual 4K workspace readiness/error closure per engine. This local
focused run does not claim the complete CI suite or physical-device acceptance.

The checkpoint's exact CI export has 143 files, 61 pins and digest
`90ded6eb8038ee896a079e831111f67ca6731d56a097948118673e4e910373fb`.
Its 40 native interaction checks and 36 views completed, but the strict raw
capture report remains **false** because one unused desktop responsive-poster
candidate was cancelled before HTTP transmission. The selected mobile poster
completed with HTTP 200, every departure/close had zero pending requests, and
there were no page, console or HTTP errors. A separate timing/source assessment
records this bounded cancellation and its inference limits without rewriting
the raw result (`native-transport-assessment.json`, SHA256
`6de3b89d680e84fc0dd9c5b70af0e4f2f90244ce00b8f898ea885c79a1380f2c`).

Fourteen static Bending chapter captures also retain their strict **7/14 full
tuple equality, overall false** result. Actual camera parameters, materials
(including progress), lights, source and compositor agree in all fourteen.
Six differences are the DOM caption's typography-dependent connector end.y;
the seventh is a signed-zero distinction in derived composition metadata, whose
sign JSON does not preserve. The independent assessment records those exact
limits instead of claiming whole-page pixel equality:
`animation-review/.local/ocr-bending-static7-assessment/2026-10-18T16-07-41.752Z/assessment.json`,
SHA256 `74d335b4b8582e69d8632f307ce88d03bd39f50e2c8c82f3ff9f426a0824d2ad`.
These checkpoint observations do not accept the amended final typography.

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

## Final two-face CI candidate and native observation

The amended source candidate is `813a55397f2a928ed70d31f15aa15039ff1a11f3`,
pushed to `main` for [CI run 39147112657](https://github.com/JosHsuan/JosHsuan.github.io/actions/runs/39147112657).
Its plan selects full validation, all 20 public spec files, 267 public browser
executions and eight browser runners. The unique CI build contains **145 files
and 63 pinned sources**, with artifact digest
`d0885fb13aa40f9b9b74cf3db9dc6def3f66f672f13a92f6ad981fc60b7a26df`.
Local generated output has two additional files; publication uses this verified
CI artifact only. Candidate verification checks every source pin, all release
revision fields, the full native 4K/geometry/TV contract and seven HTML documents.
Its independent receipt is
`animation-review/.local/ocr-space-xr-ci-813a553/release-verification-candidate.json`.
This is candidate provenance, not a successful final CI or publication claim.

CI run `39147112657` is **not publishable**. Seven public browser runners
complete with **247 passing executions**; Chromium shard 2/4 is cancelled by
the workflow's 30-minute job wall-clock limit while its twentieth case is
running. Its raw log shows continued progress through all twenty starts, with
no reported assertion failure, but lacks a terminal result for the last case
and the post-test artifact check. No complete 267-pass claim is made for it.
The final case starts at 17:23:32.477 UTC and cancellation occurs at
17:25:21.886 UTC. Its unchanged CI scenario budget is six minutes; the
remaining job time is shorter than that valid scenario budget.
Raw log: `animation-review/.local/github-job-117733294145.log`.

The bounded workflow repair raises only the browser-job wall-clock limit to
45 minutes, leaving all functional assertions, per-test deadlines, no-retry
policy, eight-runner selection, single-build provenance and before/after
artifact checks unchanged. The resulting commit requires its own full CI
gate and matching tested artifact; this interrupted run cannot authorize
publication. A separate local run of those same twenty unchanged cases is
recorded independently, without treating it as the missing CI result.

An independent CPU review verifies all 63 pins between the committed source,
working files and exact CI export. Original Bending assets are **42/42 identical**
to `6288286`, and the protected renderer/camera/material/lighting/chapter/ASCII
relative-import closure remains **24/24 identical Git blobs**. Only two working
files have CRLF rather than LF; their filtered Git contents are identical.
The two native room WebPs in CI decode exactly to every original PNG RGBA byte.
Receipt:
`animation-review/.local/ocr-bending-protected-cpu/2026-10-18T16-59-05.811Z-independent-ci813/results.json`,
SHA256 `22e465bc9d432dc01c1a3be38ea7a195f3c9c8f2eaffae0fb99e2d3dc5931938`.

Native observation of the same served CI artifact completes **40/40 semantic
checks and 36 views**, including both actual font roles/glyphs, Home's prepared
first draw/offscreen retention, full-viewport XR model hits, whole 4K Context,
all three real phone recordings, pause/resume, scene exit/re-entry, original
Bending Full/material/camera facts and a separate Reduced Motion profile.
The artifact is unchanged afterward. The strict raw result remains **false**:
one of 447 transports is a cancelled unused desktop poster candidate, with
446 finished requests. All 18 native departure/close drains and every context
close have zero pending transports; page, console and HTTP error lists are empty.
Raw receipt:
`animation-review/.local/ocr-space-xr-local-813a553/2026-10-18T16-56-19.976Z/results.json`,
SHA256 `0e060c61968760de9234f6c5be31cd8141878c5ba72d6913e275b3e03b617027`.

The separate transport assessment records that request 162 is cancelled in its
start millisecond, before any HTTP request/response timing, while matching
mobile request 161 finishes HTTP 200. Cancellation precedes the page chunk's
completion by 9ms and source-GLB acquisition by 428ms. This cannot be attributed
to source-ready React poster removal. Native responsive/shared-image scheduling
is a bounded inference; browser-internal initiators were not captured. No broad
abort exclusion or raw-result rewrite is used. Assessment SHA256:
`78666ede1ad2dc2d3d0d877b05d885d84e4a0976a55b574675857b0040812f02`,
saved beside that raw receipt as `native-transport-assessment.json`.

Actual 2× desktop/mobile opening, Context and reading captures of the exact CI
artifact are under
`animation-review/.local/room4k-page-2026-10-18T17-01-27.292Z/`.
These are browser-emulated viewports; no physical-phone certification is claimed.

The XR interface/composition reviewer independently inspected those three
desktop/mobile Context/reading views and both public native images. The level
central-axis composition retains the architectural room and visible working
setup; whole-image portrait framing and the native reading-panel overlay are
consistent with the shared glass presentation. No visible structure/TV aspect
distortion or publication-blocking composition issue was found. Pixel/UV/source
identity is established by the separate CPU/native evidence, not visual opinion.

The same CI artifact also has fourteen complete native static Bending chapter
views under the original Reduced Motion/Enable 3D protocol. Raw capture completes
without page/console/HTTP errors, failed/pending requests or self-variance, but
the strict full-tuple result remains **false, 7/14 exact**. Six differences are
caption-derived `annotation.end.y`; source anchors, screen projections and
`end.x` are unchanged. The seventh is mobile Credits' derived signed-zero
comparison, whose runtime sign JSON does not preserve. All fourteen physical
camera, material **including progress**, lights, optics, source and compositor
settings match. The unchanged presenter still derives `end.y` from the caption
DOMRect centre; the authorized fonts and wrapping alter that caption geometry.
No comparator field is removed, tolerance added or whole-page pixel equality
claimed. Raw receipt:
`animation-review/.local/ocr-bending-static7-813a553/2026-10-18T16-59-22.399Z/results.json`,
SHA256 `c3a7dd9807242b6ef85cc229e7c418de011509aaf8a39b24e5fe1dad115ea18b`.
Independent assessment:
`animation-review/.local/ocr-bending-static7-assessment/2026-10-18T17-03-15.558Z-independent-ci813/assessment.json`,
SHA256 `455f71b648cbe9cdd2ecefa23d1c67464b03a884c6c6b88882845dc855846738`.
All raw images, warnings, helpers and comparison outputs retain their original
hashes. Normal dynamic and full publication acceptance remain separate checks.

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
