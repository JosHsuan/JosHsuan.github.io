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

## First CI contract finding

The first pushed candidate, `2a8cc91`, remains an unsuccessful release candidate.
CI run `38877332710` finishes with 213 passes and 12 failures out of 225 public
browser executions, zero skips, and all 14 jobs completed. Ten failures are
obsolete fixture executions (nine archive clicks and one old full-bleed XR card
measurement); two are real WebKit command/release failures described below.
Framework checks pass 24/24 and the portable selection passes 384 with two
pre-existing conditional skips. The run found three obsolete archive actions in
`project-previews.spec.mjs`: the mobile second shard records 32 passes and three
failures while all six new XR cases pass. The failed actions still clicked
`View the archived four-panel research recording`, which the accepted continuous
XR presentation removes. The third failure's cleanup navigation initially hid
the original locator timeout; its retained trace confirms the same obsolete
click at line 173. These are not video decode or model recovery failures. The
failed job log and all three error contexts/traces remain immutable locally.

The five project-preview cases are retained. Their recording, motion-preference
and actual HTTP-failure paths now use native XR chapters and preserve pause,
no-navigation, fallback, cancellation and resource-disposal assertions. Card
geometry distinguishes the full-bleed Bending model from the approved 8–12-pixel
XR image inset. The exact inset excludes the card's actual border; the native
video source is compared to its exact same-origin absolute URL. An initial
adapter check retains seven passes and three observation failures before those
two measurement corrections. No production change, test deletion, skip, retry,
timeout increase or pixel-tolerance expansion resolves this obsolete-fixture finding. A fresh
full same-SHA CI and live acceptance remain required before publication.

The corrected adapter check passes all ten executions (five existing cases in
Chromium and mobile Chromium), with zero failures, skips or retries in 44.3
seconds against the unchanged v4 export. Its earlier failed logs and traces
remain separate. Source ESLint and the diff whitespace check pass.

## WebKit command and release correction

The failed WebKit trace proves all three complete recordings decode and paint.
After the native pause click, React already publishes `Play recording` and
`aria-pressed=true`, while the first native-video observation is still unpaused;
the next evaluation does not return before the test ends. A Reduced Motion
switch fails the original five-second canvas-removal assertion, although a
later snapshot does show the reduced-motion poster state and released scene.
The original evidence proves delayed effects, not a permanent leak or a codec
failure. It does not identify the native/GPU call responsible for the stall.

The Director now forwards pause/play to the same renderer's semantic media
command synchronously, before publishing its UI acknowledgment. That command
cancels the application video-frame callback and pauses the native video without
waiting for a camera RAF or drawing. Presentation and immediate commands share
one media writer. Pending first acquisition still reconciles the latest intent
before publishing ready; a rejected stale resume cannot override a newer pause.

Explicit chapter/preference/scene release now disposes the phone and Three's
VideoTexture callback before aborting/resetting its native source. This removes
an observed ownership-order risk; it is not asserted to be the proven sole
cause of the Linux WebKit stall. Native media-error handling retains its own
existing disposal path. The original failed artifacts remain unmodified.

A ninth production Director test withholds every RAF and checks that native
pause acknowledgment precedes UI state, no presentation/draw is requested by
the command itself, repeated values are idempotent and command errors close the
same resource exactly once. The initial-acquisition test also reconciles a pause
received during first paint. All nine pass. The new complete portable selection
discovers 387 checks: 385 pass, zero fail, and the same two conditional skips.
`pnpm check` and the v5 public build/audit pass with 139 local output files;
the staged Director and renderer sources match their working-source SHA-256.

An unmodified-v4 Windows WebKit diagnostic retains two failures while awaiting
the first phone's ready state: its trace shows the native recording-unavailable
fallback, before either Linux failing action is reached. This is not a local
reproduction of the Linux pause/release defects and cannot certify their fix.
Fresh complete Linux CI and actual live checks remain required.

The rebuilt v5 Chromium/mobile selection passes 22/22 (all six XR and five
project-preview cases per profile), with zero skips, failures or retries in two
minutes. Its 139-file manifest is unchanged before/after; 22 served initial
HTML/script/style responses match that export before testing. The retained run
log SHA-256 is
`3aca7f538f93e8a52e30e3d26e7b19f44ba2935916c4a4a68b9eaf844444b362`.
This local result does not replace the required Linux WebKit confirmation.

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

## Pinned Linux WebKit media backend

The `f20a2ec` candidate passes 223/225 public browser executions, all 24
framework executions and 385 portable checks, with the same two conditional
portable skips. Its two WebKit failures retain the release hold. Neither failed
candidate has been deployed; their complete logs and traces remain unchanged.

An isolated native-video control in the pinned Linux engine reproduces a
13.242-second synchronous `pause()` and a subsequent 13.242648-second difference
between the cached paused DOM position and trusted resumed playback. Without a
pause call, removing `src` and calling `load()` also blocks for 13.236 seconds.
Neither control creates application WebGL. A separate passive application probe
locates an 11.171-second delay inside native `video.pause()`; callback
cancellation, texture deletion and canvas removal are not that measured delay.
Unloading is therefore not a proven fast replacement for pausing.

The supported `WEBKIT_GST_DISABLE_GL_SINK=1` diagnostic still fails continuity
and is not adopted. The distinct `WEBKIT_GST_USE_PLAYBIN3=1` setting selects the
engine's native playbin3 pipeline for regular media. The same native-only control
then passes: pause returns within the recorded 0 ms resolution, paused time is
stable, and the trusted resume gap is 0.000805591 seconds, without seeks or
recorded errors. Process evidence confirms WebKit 2359/26.6, GStreamer 1.24.2.0,
an available playbin3 factory and the actual inherited setting. See the
[pinned engine implementation](https://github.com/WebKit/WebKit/blob/4d05d732e5a84f32675bef4cc135a2e7a9269a87/Source/WebCore/platform/graphics/gstreamer/MediaPlayerPrivateGStreamer.cpp#L3170-L3180).

The test configuration now supplies that setting only to Linux WebKit's browser
launch environment, preserving the existing environment. It changes no public
runtime, source recording, WebGL path, media clock, assertion, timeout, retry or
continuity tolerance. Chromium, mobile Chromium and other operating systems
retain their existing launch configuration. This is a pinned Linux Playwright
WebKit backend configuration, not a claim of repairing production Safari.

The initial two-case application diagnostic passes the original Reduced Motion
five-second release assertion. Its normal-recording case fails earlier at site
entry, before phone assertions. Passive cold-entry probes identify
`reveal-timeout`: fonts and the critical image are ready, but neither native
`animationend` nor the exact root animation's `finished` promise completes before
the existing deadline. The document remains visible. Cancellation rejects that
promise after the failed terminal. This does not prove a lost event after a
completed animation. The existing failure terminal releases the loader and
content guard correctly; shared entry code and its deadline are unchanged.
This Docker cold-entry limitation is retained, not relabeled as a passing test.

The ignored `linux-webkit-f20/2026-10-16T09-53-06.295Z` directory retains the
native controls, passive probes and original failures as distinct checkpoints
03–06 and 08–11. The unchanged complete WebKit shard is the next application
check. Publication still requires fresh complete same-SHA CI, its exact-artifact
gate and actual live acceptance. Physical Safari/iPhone verification remains
unavailable.

## Generic reveal completion correction

The `6578cee` full CI run positively verifies the original XR three-recording,
pause/resume continuity and live Reduced Motion assertions in Linux WebKit. Its
WebKit second shard nevertheless fails one project-card test at site entry,
before card interaction: `requested → ready → revealing → failed`, reason
`reveal-timeout`. Fonts, critical posters and document readiness are successful.
This reproduces the entry limitation in actual CI, so it is no longer treated
as a Docker-only condition. Publication remains held. The complete original log
SHA-256 is
`3e563d6b4de16834f72b928d0bebb713bda39b2402f5ddb2695efe0ee3666349`.

In the isolated same-loader native comparison, the CSS baseline still fails.
The alternative changes only root opacity and content lift to native
`Element.animate` handles with the same 720 ms duration and easing. Both original
native `finished` promises naturally resolve at 1771 ms, before the unchanged
manager deadline at 1954 ms; their native current time is 720 ms, progress is 1
and root opacity is 0. No time setter, synthetic completion event or entered
state is used. The unchanged old controller still fails because it only listens
for a CSS event. That diagnostic remains a raw failure, not a passing application
test, and motivates the completion-owner correction.

The generic site controller now acquires those two native handles when the APIs
are available and waits for both actual completions before entering. It is the
only reveal property writer; the CSS reveal is then disabled. CSS events cannot
complete the native path. API-absent engines retain the existing CSS fallback.
The 720 ms visual recipe and 1600 ms failure deadline are unchanged. Generation
and terminal guards reject stale completions; cancellation, preference changes,
handoff and disposal release owned handles and fill effects. Native acquisition
or completion failure cannot become a successful entry or start a second writer.
The Bending EntryManager, Director and scene-entry delegation are unchanged.

Pinned engine source confirms that `running` can coexist with a pending play
task and unresolved start time; a CSS `animationstart` event alone does not prove
the animation is advancing. These mechanisms do not identify the unobserved
upstream branch responsible for a given failure. The new application path still
requires positive built-artifact browser checks and fresh complete same-SHA CI
before deployment.

The first production-only cold check of the native port still fails. Its two
real handles are created at 360/361 ms but stay pending with current time zero
and unresolved start times until the unchanged deadline. They reject only after
the failed terminal hides the loader and cancels them. There are no transport,
page or console errors and no pending requests at close. The raw failure receipt
SHA-256 is
`5da962acc1c34ed9310ad29c1d353364bec0d7d9856e8d36fd24db7db64ca48d`;
the planned 19 browser cases were not run at this failed checkpoint. This proves
that changing API/completion ownership alone is insufficient.

The next candidate retains `ready` across two finite native presentation
callbacks. Its 32 controller tests and full 400-check portable selection pass
(398 passed, two existing conditional skips), but the actual cold check still
fails. Unwrapped original project-card and XR tests also fail; explicitly
activating the page changes neither failure, with native focus already true.
A passive cadence probe locates the cost: resources are ready at 364 ms, the
first callback arrives at 1001 ms and the second at 1776 ms. Native effects are
then created at 1776/1777 ms, leaving only about 189 ms before the original
1965 ms deadline. A 720 ms animation cannot finish in that remaining budget.
Observed native frame intervals are 783 and 398 ms; no fixed 1 Hz rate is claimed.
The barrier-failure receipt SHA-256 is
`e1983aae75248eb7c35101fb7810f6e6a48eed2b398239a50b7d9318fa348713`.

The subsequent smaller candidate requests one finite native presentation callback
before creating the explicit native keyframes. The same 1600 ms deadline starts
at `ready`, includes that callback and is never moved or extended. One pending
callback is owned and cancelled with the request. Hidden/Reduced/static and
stale-callback paths close explicitly, while Bending's delegated entry schedules
no callback. This is a presentation opportunity, not a GPU paint fence or a
second motion clock. Its production-only cold observer still fails, with resource
readiness at 341 ms and the failed terminal at 1942 ms. It observes no native
animation acquisition; because it does not observe RAF delivery, this does not
prove that no callback ran. The original unwrapped project-card test also fails
at `reveal-timeout`, this time after `revealing`. The original unwrapped XR
scrolling case passes, including the actual model/phone canvas, all three source
durations, decoded frames, native pause/resume continuity and source release.
Thus neither universal failure nor an observer-only explanation fits the evidence.
There are no retries or skipped tests. The frozen 20–21 receipt SHA-256 is
`b41b49bbfbe351a995dae0fb81aabaec7e5b32849cf899a8e19dda438c94d2b4`.

The next candidate changes the generic preparation boundary rather than treating
a frame callback as animation readiness. Document resources, one finite native
presentation opportunity and both original `Animation.ready` promises share the
remaining original 15-second arrival budget. Both effects are acquired once and
may already run while the lifecycle is `requested`; they are never paused,
replayed or moved in time. `ready` now means resources and native play acceptance,
not GPU paint acknowledgment or a promise of another full 720 ms afterward. It
starts the original 1600 ms completion budget, and both original `finished`
promises remain required for `entered`. This is an explicit preparation-policy
change, not evidence that the prior deadline already covered cold native play.
The shared readiness service and Bending's delegated scene gate are unchanged.
Actual browser, full same-SHA CI and live publication acceptance remain pending.

This preparation candidate passes all 40 controller tests, retaining the prior
32 and adding eight cases for original-budget consumption, withheld/rejected or
missing native play acceptance, completion arriving before acceptance, resource
prerequisites for static policies, and early/late deadline delivery. An early
deadline callback re-arms only the remaining time to the same endpoint and does
not prematurely release resources. The complete portable selection discovers
408 checks: 406 pass, zero fail and the same two conditional skips. Runtime and
fixture SHA-256 are respectively
`78012b3f08b4514ad3581ee5bab24fecde9a4aa5caa4e759e7f1a1f4c6b87bbe`
and `acaf8172c36af40822a5ba191dcf4bcfa025c106d3d563c7de73a28f9767b2d0`.
The generic caller also rounds its remaining resource timeout upward to avoid
native integer conversion expiring it a fraction of a millisecond early; the
unchanged generic monotonic endpoint still rejects late success. The shared
service and Bending timeout input remain unchanged. These CPU results do not
certify actual browser entry or publication.

The rebuilt preparation candidate passes the unchanged production-only cold
Linux WebKit observer. Both actual effects are acquired at 2569 ms while still
`requested`; both original `ready` and `finished` promises naturally fulfill at
3357 ms, with current time 720 ms and progress 1. The lifecycle then records
`ready → revealing → entered` at 3358 ms, and hides the loader before releasing
the fill effects. Same-turn mutation observations are not claimed as distinct
paint timestamps. There are no parallel CSS reveal writers, warnings, errors,
failed requests or pending requests at context close; the actual XR WebGL model
also reaches ready. The unchanged observer SHA-256 is
`4bac9cbd4d093951083c18acc9d6c5b5488ea51e2075dcf45acd4cdbbece347a`;
its raw result SHA-256 is
`982e3fa1fd9a724f1fcf3deb5b352314bcd5f173bbe0701ef43d45bfd66ca1ba`.
Full original browser coverage and same-SHA CI remain separately required.
The two unchanged, unwrapped original cases then pass together: the project-card
entry case and XR's native scrolling/three-recording/pause-resume case, 2/2 with
zero retries or skips. The separate original 19-case related selection is still
running at this checkpoint. This is local Linux evidence, not a completed CI
gate or authorization to deploy a failed earlier run.

The first native-port local checkpoint passes `pnpm check`, including the empty
63-file framework, and all 26 site-navigation tests. The complete portable
selection discovers 394 checks: 392 pass, zero fail and the same two conditional
skips. The public build/audit passes with 139 local files and all 57 approved
assets. The rebuilt output digest is
`71c7e74d557f963195dad0cf567489110da32d22b0c8e6fe1393d7f8d39df5d4`.
Its release metadata still names the preceding `6578cee` HEAD; this is an
uncommitted corrective-source build, not the failed commit's CI export. Runtime
and fixture SHA-256 receipts bind it to the new implementation before browser
checks; it cannot be used as a deployment artifact.
