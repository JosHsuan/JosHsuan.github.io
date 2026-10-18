# OCR identity and XR viewport verification

Date: 18 October 2026 (Europe/Berlin).
Status: published as `ddafd44`. Full CI and same-artifact publication pass;
live byte/range checks and native desktop/mobile interaction acceptance pass.
Native room source identity and Rhino shutdown remain verified. Detailed
historical failures and comparison limits below remain preserved.

This record covers [decision 0015](../../../../docs/decisions/0015-ocr-identity-xr-workspace.md)
and the [current integration contract](OCR_XR_VIEWPORT_INTEGRATION.md). It does not
replace earlier raw receipts or imply that the preceding published artifact
contains this work.

## Published result

- Deployed source: `ddafd44c343d0e5e02be472beee53eb6396acec0`.
- [Full CI 39149807622](https://github.com/JosHsuan/JosHsuan.github.io/actions/runs/39149807622)
  completes successfully, including quality, both framework variants, all eight
  public browser runners and `Required validation gate`. All **267 unique public
  executions pass**, with no failed/flaky/skipped summaries. The formerly
  interrupted Chromium 2/4 suite completes all twenty cases in 30.7 minutes
  under the repaired job ceiling; individual assertions/deadlines are unchanged.
- The verified **145-file / 63-pin** artifact digest is
  `22da03dff3392a2ce79d0dbb4ff0b9d1d75be4caa1b14351b16761531e04c1f4`.
  The final validated release is downloaded and independently checked before
  dispatch. Its exact-source gate receipt is
  `animation-review/.local/ocr-space-xr-ci-ddafd44/release-verification-gate.json`.
- [Pages publication 39152480089](https://github.com/JosHsuan/JosHsuan.github.io/actions/runs/39152480089)
  succeeds using that tested artifact without rebuilding. The dispatch returns
  HTTP 204 before a local Node cleanup assertion; an independent GET confirms
  one unique successful deployment. It is not dispatched twice.
- The public `/release.json` reports the exact deployed SHA and both pinned
  typography identities. **114 exact HTTP comparisons** cover all seven HTML
  documents, the index alias, release/sitemap, approved assets/licenses and
  JavaScript/CSS. All match CI bytes. Eight prefix/suffix MP4 requests return
  correct HTTP 206, MIME, content ranges and bytes. The live receipt is
  `animation-review/.local/ocr-space-xr-ci-ddafd44/release-verification-live.json`.
- The live native protocol passes **40/40 checks and 36 actual views**, with
  **zero failed requests**, zero pending transports at every departure/close,
  and no page/console/HTTP errors. It covers actual OCR/Space glyphs, prepared
  Home/offscreen resources, all public routes/404, whole 4K Context, full-viewport
  XR model hits and native drag, all three original phone recordings, pause and
  scene closure/re-entry, original Bending Full/material/camera facts and a
  separate Reduced Motion profile. Its strict result is **true**.
  Raw receipt:
  `animation-review/.local/ocr-space-xr-live-ddafd44/2026-10-18T18-06-31.529Z/results.json`,
  SHA256 `233dce9ea40e2b681890bd28cbad030acc6dedc8c77ace8e6c9db46ff6729669`.

The independent CI summary verifies eight log identities, consecutive case
indices, unique project/test union, original pass summaries, pre/post artifact
checks and gate provenance. Raw suite times are 9.3/30.7/27.8/8.2 minutes for
Chromium, 14.8/10.4 for WebKit and 17.5/11.5 for mobile Chromium. The observed
parallel browser-job log span is 31m22.191s and the summed suite duration is
130m10.912s; neither is a queue-inclusive workflow or production-lead-time
measurement. Receipt:
`animation-review/.local/ocr-space-xr-ci-ddafd44/ci-final-summary/2026-10-18T18-08-30.946Z/summary.json`,
SHA256 `4d0bf7bb66312a2d6e332ddecf84952d61dc7cd4179b56429a770205606dfd66`.
The owner-requested [DORA CI/delivery plan](../../../../docs/CI_DELIVERY_PLAN.md)
separates the proposed fast-feedback target from the complete acceptance gate
and current 45-minute safety ceiling. It records official sources and the five
production delivery metrics without treating CI cancellation as a production
incident.

The published artifact also completes fourteen native static Bending chapter
captures under the unchanged Reduced Motion/Enable 3D protocol. All fourteen
physical camera, material (including progress), lights, optics, source and
compositor settings agree with the original `6288286` baseline; before/after
self-variance is zero. The raw **full-tuple result remains false, 7/14 exact**:
six caption-derived `annotation.end.y` differences and the mobile Credits
derived signed-zero comparison remain recorded. Every published protected-tuple
JSON string equals its corresponding `813a553` local capture on the same client.
JSON equality cannot recover runtime zero signs lost during serialization.
The unchanged presenter derives the caption endpoint from its DOMRect centre;
the authorized font/wrapping changes explain that geometry without changing the
physical scene. No tolerance, comparator omission or whole-page pixel equality
is claimed. There are no failed/pending requests or page/console/HTTP errors;
all eight raw warnings remain preserved. Raw receipt:
`animation-review/.local/ocr-bending-static7-ddafd44/2026-10-18T18-10-39.038Z/results.json`,
SHA256 `b812513451377452d1aacad2b1eb5ca676816eff9e6a123c488f9cc006714909`.
Independent assessment:
`animation-review/.local/ocr-bending-static7-assessment/2026-10-18T18-14-10.667Z-independent-postdeploy-ddafd44/assessment.json`,
SHA256 `d1dc339cebeb99872bba8bd94228d88882d1e768528e5b686c14e08a1afc7903`.
The original, intermediate and published PNG hashes are verified separately;
raw images, comparison helpers and historical results remain unchanged.

The checkpoint sections below retain what was known or pending at each earlier
stage. Their raw false/incomplete results do not become passing reports through
this final acceptance. Browser touch profiles are emulation; physical-device
performance and iPhone/Safari certification are not claimed.

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

## Two-face candidate checkpoints and native observation

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

Those same twenty unchanged Chromium cases pass **20/20 in 12.1 minutes** on
the separately served `813a553` CI artifact under local Windows hardware
(`animation-review/.local/ocr-space-chromium-shard2-local.log`). This includes
the last native fragment/focus/history case. The CI-capacity patch also passes
all **15 CI selector/artifact/gate tests**
(`ocr-space-ci-wallclock-unit.log`). These are independent evidence, not a
replacement for the interrupted hosted result or a controlled speed benchmark.

### Final artifact identity after the capacity repair

The replacement source is `ddafd44c343d0e5e02be472beee53eb6396acec0`,
with [CI run 39149807622](https://github.com/JosHsuan/JosHsuan.github.io/actions/runs/39149807622).
Its full plan retains all 20 specs, 267 executions and eight runners. The new
145-file export has digest
`22da03dff3392a2ce79d0dbb4ff0b9d1d75be4caa1b14351b16761531e04c1f4`.
The commit changes only the workflow wall-clock ceiling and this verification
record; all other 1,164 tracked Git tree entries match `813a553` exactly.

Independent CPU review verifies every one of its 63 pins, all active font and
notice revisions, 42 original Bending assets, 24 protected code modules and
every native 4K RGBA byte. The complete **three CSS and 38 JavaScript contents
are byte-identical** to the preceding CI export. The exports themselves are
different: 37 HTML/RSC files change their explicitly identified Next build ID,
`release.json` changes commit, and two content-identical manifests move under
the new build-ID directory. All original raw hashes and differences remain in
`animation-review/.local/ocr-bending-protected-cpu/2026-10-18T17-35-23.708Z-independent-ci-ddafd44/results.json`,
SHA256 `a19fec7e2693781bb91f1b2dd75a4f11608eb856da21e98a31bffbca5dbf4870`.
This is source/artifact identity evidence; the new export still requires its
own complete CI gate and live acceptance.

Native observation of this exact replacement export also completes **40/40
semantic checks and 36 views**, with all 63 pins and seven document/release
preflights verified. Its strict raw result remains **false**, with one unused
desktop poster candidate cancelled before HTTP and 446 finished requests.
All 18 departure/close drains and context closes have zero pending requests;
page, console, HTTP and report error lists are empty. The raw receipt is
`animation-review/.local/ocr-space-xr-local-ddafd44/2026-10-18T17-41-21.944Z/results.json`,
SHA256 `031501a783fc1bf0528d9194220799e4a506d30d5fe1b4a8347fe9c220b2cb00`.
Its separate assessment verifies the actual matching mobile candidate succeeds
HTTP 200, cancellation precedes page-chunk completion by 8ms and source-GLB
acquisition by 426ms, and no source-ready React removal can explain that timing.
Native responsive/shared-image scheduling remains a bounded inference, with
the missing browser-internal initiator/per-element pre-3D observations recorded.
The raw result is not rewritten. Assessment SHA256:
`84302c526e7b2614870c64d0ddf157615f8e680140d7e92de94bbe6634843d92`,
saved beside the raw receipt as `native-transport-assessment.json`.

### Preceding 813a553 native and visual checkpoint

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
At native handoff, the manifest retained 61 assets and its other 59 pins were
unchanged; the later canonical-LF correction also repins the OCR notice's line
endings, preserving its complete text. The other 58 pins and both native image
pins stay unchanged through that correction. Workspace JSON has 11,544 bytes,
notice has 1,845 bytes, both contain zero CRLF and each has equal Git filtered
and no-filter blob identity. The source hashes therefore survive Git's
`text/eol=lf` normalization. The later heading font and notice bring the published
manifest to 63 assets. Exact image
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

## Final image review and acceptance limits

The original CAD remains read-only. The first elevated three-quarter workspace
capture was explicitly rejected by the owner. Its temporary pins and local
captures do not constitute visual acceptance. The replacement native room pair
above satisfies the reviewed source/camera, authorized visibility, actual
materials/lighting, true alpha and high-resolution image requirements. Its
engine and source identity are recorded. Subsequent responsive framing and
text/model relationships are checked against the built artifact and actual
published page, as recorded above.

The completed full CI and live protocol cover all-route typography and 404,
shared Bending/XR chrome geometry, full-viewport XR canvas geometry, workspace
decode/error terminal behavior, model hits, all three native phone recordings,
interrupted lifecycle checks, and Bending regression with the intentional
typography change distinguished from protected scene behavior.

Actual published-page high-resolution captures are saved under
`animation-review/.local/room4k-live-2026-10-18T18-12-18.641Z/`: desktop Context
is **3840 × 2160**, mobile Context and reading are **1170 × 2532**. PNG IHDR
dimensions are independently read and agree with these pixel counts. The image
elements decode the original **4096 × 2880 / 2160 × 4674** sources with `contain`,
without horizontal document overflow or page errors. The root visually inspects
the actual desktop and whole-room mobile captures; source structure and TV
proportions remain intact. These captures use native page scrolling and no
product, CSS, geometry, clock or media overrides. They are browser viewport
emulation, with the actual source and complete native room retained.

Publication is complete at the exact commit/run/digest above. Subsequent
Markdown-only evidence and the DORA plan do not create another public build or
replace the deployed artifact. Preserve original CAD files, all raw source and
historical failure receipts, and the distinction between source proof, visual
inspection and physical-device testing.
