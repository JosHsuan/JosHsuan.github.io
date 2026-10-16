# XR immersive presentation: verification record

Date: 16 October 2026 (Europe/Berlin).

This is the implementation checkpoint for [decision 0013](../../../../docs/decisions/0013-xr-immersive-stage.md).
Final same-SHA CI, deployment and live acceptance are separate required evidence;
no local result below certifies publication. Earlier raw failures and prototype
captures remain immutable in the ignored project-local research directory.

## Implemented boundary

`XRSceneStage` mounts one transparent fixed project layer. One `XRStageDirector`
owns native chapter geometry, finite inspection intent, demand scheduling and
the existing information-window presenter. One renderer/camera displays the
verified source assembly or a phone with an actual `VideoTexture`. The shared
background driver and all protected Bending case source remain unchanged.

The renderer fits a safe subject rectangle. Its transparent canvas uses the
equivalent cropped camera subfrustum, preserving global screen coordinates and
hit rays while spending the same pixel budget on the subject instead of empty
background. The model and phone caps remain 524,288 and 393,216 backing pixels.
These are configured limits, not a physical-device performance measurement.

React publishes discrete chapter/policy/phase facts and owns native fallback
visibility. The renderer alone owns decoded media, video readiness, its camera,
paint facts and GPU resources. Native scroll does not seek or retime video.
The three complete recordings are sequential reading chapters; inactive video
sources and textures are released. No stage tabs, face-screen/zoom/reset button
cluster or disclosure is required to read the research. Scoped keyboard/direct
model inspection and a meaningful recording pause/play remain.

## Source and geometry evidence

- All 57 approved public asset/license byte sequences retain their pins. Source
  model, material, normals, source transforms and the three original recording
  derivatives are unchanged.
- Independent source/content review finds all 74 research title/copy/caption/
  credit/limitation strings in the new SSR document. Nine principal figures are
  directly readable; three recording links and posters remain available.
- Four production camera tests project all 96,312 actual source vertices, all
  phone geometry and complete recorded-screen bounds across desktop, narrow and
  breakpoint viewports. They check clear regions, depth precision, source-buffer
  identity and cropped/full-stage projection plus native-hit-ray equivalence.
- Eight production Director tests cover first paint, native chapter/gesture
  ownership, static fallback reading, cancellation/late handles, preferences,
  visibility/page/freeze transitions, demand idle and complete disposal.

## Retained findings and corrections

The initial v2 visual capture contains 22 PNGs with zero page, HTTP, console or
request errors, but **does not pass visual acceptance**. Its original overflow
predicate compared against an already-expanded `innerWidth` and missed a mobile
document width of 394–406 pixels in a configured 390-pixel viewport. Fixed controls
were partly outside the actual screen. The XR reading boundary now clips only
horizontal decorative overflow and headings reserve native anchor clearance.
The strengthened browser assertion compares client, scroll, inner and visual
viewport dimensions against the configured device, and checks control bounds.

That prototype also shows desktop phone softness: a full-viewport 393,216-pixel
canvas spends its budget on transparent background. The equivalent bounded
subfrustum raises effective desktop density from approximately .523 to .829
without increasing the cap or changing the subject, projection or recording.
Source/native GIF dithering remains part of the original evidence.

Review found that static preferences never acquire a renderer, so a fallback
phone hidden only by renderer logic could remain absent. React now solely
selects the fallback shell from the discrete reading chapter in every mode;
the renderer never writes that visibility. Reduced/Save Data can show the
correct phone poster without downloading GLB or MP4.

The v3 built-artifact browser run records **26 passes and two failures out of
28**, with zero retries. Both failures are the same genuine cache defect in the
desktop/mobile HTTP-failure scenario: after a failed phone recording, returning
to the previously painted overview pose retained its old cache key while the
paint marker had been invalidated. The model was not redrawn. A cache hit now
also requires a currently successful paint. The original recovery assertion,
45-second deadline, failure traces and raw results remain unchanged. The rebuilt
v4 run passes both recoveries in 8.3 and 7.9 seconds; no v3 failure is changed
into a pass.

## Current local checkpoint

`pnpm check` passes with Node 24.19.0 and pnpm 11.19.0, including the empty
framework's 63-file audit. The complete portable selection discovers 386 checks:
384 pass, zero fail and two pre-existing conditional browser-only checks skip.
The latest v4 public build/audit passes with 139 local files and 57 approved
asset/license files. Browser discovery selects 225 executions across 19 files.
Focused source/test ESLint also passes.

The rebuilt v4 selection passes **28/28 with zero failures, skips or retries**
across Chromium and mobile Chromium in 2.5 minutes: six XR and eight homepage
cases per project. Its immutable preflight inventory binds 139 exported files
and verifies 84 served HTML/script/style responses against that exact output.
The run log SHA-256 is
`6afdca2b2565abdd78d55121dbf2aa54afca48a972a2548f858c0abeb148a865`;
its independent summary SHA-256 is
`c745dfcf87088ce64d1e89ea1baf71e282b21b5d552c74f995958078d5dd67d5`.

The v4 positive browser evidence includes the real model raycast/capture and
matching hand direction, native vertical touch reading, all three complete
changing video textures, pause/resume continuity, static preferences, genuine
`WEBGL_lose_context` with continuing native video, centered/full source-phone
card framing and corrected mobile viewport/control bounds. The exact recovery
assertions now also prove actual repaint after both source-failure paths. The
v3 raw failures remain separate retained checkpoints.

The corrected v4 visual protocol retains another 22 desktop/mobile PNGs and
passes with zero failed requests, page/HTTP/console errors. The actual images
show complete centered card phones and an exposed glass rim, sharper recorded
interface labels, full phone bodies/screens, heading clearance and controls
inside the configured 390×844 viewport. The raw JSON SHA-256 is
`2843c327bfabd500e4f75e144a292ad0894b98725f062b8bef74a31013969dfd`.
This is local rendered-image review, not live or physical-device acceptance.

## Protected Bending comparison

The frozen published `0012b057` export and v4 output were observed at matching
desktop/mobile sizes with native input, source-SVG readiness, visible image/font
readiness and explicit source-portal image decoding before alignment. All 68
PNGs are retained. All **34 paired static states have zero changed RGB pixels**
and identical layout, camera/source/scene and diagram facts. The comparison
receipt SHA-256 is
`430deff5612e94911609983c12a92adb58b6187837a4bbdd80ab951bf6af17ce`.
No clock/style/scene override, pixel tolerance, mask or selected green frame was
used. The v4 candidate's 34 states pass with zero failed requests.

The combined raw comparison remains false because the frozen baseline's desktop
primary recorded two HTTP-200 `ERR_ABORTED` fetches, `source-layers.glb` and
`studio-small.hdr`, about 8.5 seconds before closing. Their cancellation caller
is unproven; they are not attributed to context close. There are no page/HTTP
errors and all eight context closures have no pending requests. Those original
failures are retained rather than waived or replaced by a green rerun. Pixel
equality and a clean current candidate do not change the baseline's raw flag.

The complete Bending SSR text, seven chapters, ten headings, seven media records
and resolved ARIA/document relationships also match the original protected
`6288286` reference. Its case source and the common background are unchanged in
this revision. Static evidence is not a claim of identical phases for all normal
animation or of zero pixel difference in the eventual live deployment.

Required next evidence: review/commit/push, the full exact-artifact CI gate,
deployment and actual live routes/assets/
scene checks. Physical iPhone/Safari decoding and sustained performance remain
unmeasured. Windows WebKit's known native H.264 decoder limitation does not waive
positive playback assertions in Linux WebKit CI.
