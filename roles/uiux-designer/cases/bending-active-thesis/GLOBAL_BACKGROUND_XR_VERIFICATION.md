# Shared background and XR: integration verification

Date: 16 October 2026 (Europe/Berlin). This checkpoint includes local integration,
the first CI failures and the ordinary-background correction before publication.
It records observed results and retained failures; it does not certify a successful
final CI gate or deployment. The final release is identified by its Actions run,
exact output digest and public `/release.json`.

## Protected Bending comparison

The before-change target is the frozen, previously published CI artifact for
`62882861cc1ff83ae3abe93f0c84d82eb9060d25`. Both artifacts use Chromium 153,
desktop 1440×1000 and touch-emulated mobile 390×844, DPR 1, en-US,
Europe/Berlin and dark mode. Native inputs, original animation clocks and
stylesheets are retained. This is browser emulation, not physical iPhone testing.

- The primary baseline contains 70 states. Its raw JSON SHA-256 is
  `ba744673d62707e3e026994c79d1a75a27e773bae5ee3309e0100294a3cbbbd0`.
- The supplementary baseline contains 16 source/photograph states. Its raw JSON
  SHA-256 is `865b22bc295f43cd43f24e98397d42f54eb3bc0870bc4d3e0e7c44746e475f0a`.
- The baseline freeze receipt, including hashes for 86 PNGs and 120 exported
  files, has SHA-256
  `1c2dcd62ad96ee7c9c824f0b321f5fa9268af7805b47898725180949bf259a4e`.
- All 34 matched static Reduced Motion views decode to **zero changed RGB
  pixels**, with identical measured layout, source poses, materials, lighting,
  optics and exhibition parameters. This includes all seven chapters, manually
  enabled static 3D, treated photographs, source peeks and original-image portals.
- Normal motion is observed at its recorded active time. Images sampled at
  different phases are not represented as pixel-identical. Existing analytic
  functions, clock/input data and real interactions provide the corresponding
  motion evidence.

The first after-change primary capture stopped after 57/70 states because its
desktop native press did not establish model engagement within 45 seconds. It
also recorded one mobile `source-layers.glb` `ERR_ABORTED`. The supplementary
baseline recorded an HDR `ERR_ABORTED`; the after-change supplement passed all
16 states without page, HTTP or request failures. These raw records are retained
without network exemptions or replacement by a later green run.

A separate passive native-event observation ran once on each frozen artifact:
both recorded a trusted, actual source hit on an unprotected target, successful
pointer capture, model/source engagement, the expected ±30/24 input rotation,
and held scroll/time. Both passed without page, HTTP or request failures.
Another identical focused helper covered the nine missing desktop autonomous,
canvas hold/exit/return, library and context-loss states on each artifact; both
passed without those failures. These four plus nine states supplement the
original 39 matched normal observations. The first batch's missing event/point
receipt prevents retrospective attribution of its timeout; this uncertainty is
not erased by the paired results. No protected Bending content or scene code
was changed to make the comparison pass.

The combined 86-state coverage receipt has SHA-256
`b8967b4c6dae46c05159bf715a5d29ccc6cbe8f30f90109662e6e0679314af50`.
Its `allRawPassed` remains false; full state coverage is not a claim that the
original batch passed. The independent document/ARIA receipt has SHA-256
`06ba8204d4e66dfe495ebeba499ee630f30167defb4b7eb72dcecd31af8313d0`:
all 4,441 reading-text characters, seven chapters, ten headings and seven media
references including alt/dimensions/loading remain identical. Each document has
35 unique IDs and 26 resolved relations, with no dangling reference. Three React
`useId` values change under the new layout tree; their actual DOM relationships
are equivalent and every authored ID is unchanged. This is SSR evidence;
runtime controls and hydration are independently exercised by browser tests.

A separate CPU comparison checks the actual Linux CI export for
`9ca26d52bd0bda3a5a7e74e85be681d5e809d127`, not a rebuilt local approximation.
Its 136 files, including 57 approved asset/license files, produce the recorded
digest `7f6546c015da802f5f06b3bfdbed5733932d345a6db75d0678ddbe1ba706d9ce`.
All 42 preceding asset/license files and both Bending-linked CSS files are
byte-identical to the original artifact. All 93 document class names, 131 reading-main
class occurrences, 32 authored IDs and the complete text/media/relationship checks
remain identical or equivalent as specified above. The new document receipt has
SHA-256 `2d9fe066b6d9fae6025e1b6cdd1f9b37e2ce6ec346d3b7dc00f3928e5abc1d68`;
the asset/CSS receipt has SHA-256
`f56d43e7848882b8cadc494344c549029bb8121c83b998268d116f77b6d4caaf`.
An initial helper incorrectly asserted the local build's 138-file count for CI;
that helper/error is retained separately as a metadata error. The exact CI digest
already matched. These CPU results do not turn the failed CI candidate into an
accepted release or establish live/browser timing equality.

## Local execution checkpoint

| Check | Observed result |
| --- | --- |
| Exact toolchain | Node 24.19.0, pnpm 11.19.0; committed lockfile retained |
| `pnpm check` | Reduced-fix run passed: content, lint, types, 9 framework tests, 15 CI tests, empty-framework production export and 63-file artifact audit |
| Shared-background browser scenarios | Corrected build: 12/12 passed across Chromium, mobile Chromium and WebKit in 1.0 minute; earlier v2 12/12 remains a separate checkpoint |
| XR model/phone browser scenarios | Latest corrected build: 10/10 passed across Chromium and mobile Chromium in 32.8 seconds, including genuine phone context loss with native-video time continuing, native model inputs, vertical touch reading, one draw call, idle/release, three changing video textures, pause/resume, Reduced Motion and real 404s |
| Portfolio/loading/card browser scenarios | 26/26 passed across Chromium and mobile Chromium, including NoJS recording links, critical-image failure/hold, native history, unobscured XR anchors and the retained Bending entry/card |
| Case and role portable checks | Latest corrections run: 372 passed, zero failed, two existing opt-in browser-only checks skipped; 374 discovered, including all 7 background checks, the 31-check related selection and 3 new XR lifecycle checks |
| Browser discovery | 222 executions in 19 files; all remain selected by full same-SHA CI |
| Main model / corrected poster | Pinned, independently source-verified and visually reviewed; 96,312 vertices, 190,320 triangles, 352 original meshes, one material/primitive |
| Latest corrected production build/audit | Local build passed: 138 files, 57 approved asset/license files; private source data excluded. The first Linux CI export separately contains 136 files / 57 approved files |
| Broader local Chromium/mobile run | 53 completed passes out of 148 planned, then intentionally interrupted after the CI defect was found; not a completed suite pass |
| First same-artifact CI | Run `38859743050` is not accepted: WebKit shard 1/2 has 39 passes / 1 failure; Chromium shard 4/4 has 16 passes / 1 failure. Corrective coverage is described below |
| Corrected same-artifact CI, deployment and live comparison | Pending at this checkpoint |

The scoped browser results above refer to successive explicitly reviewed local
builds. The main-model screenshot run produced sixteen images with zero page,
HTTP or failed-request errors; the corrected poster was then inspected against
those actual Three views and the rebuilt asset was re-audited. They are local
integration evidence, not a substitute for the final exact-artifact CI gate.
Authored XR JSON is canonicalized to LF before commit, with parsed-value
identity checked, so Git's line-ending conversion cannot invalidate its byte
pins. The final model and all other public binary bytes are unchanged by this
storage-only step.

## First CI failures and corrective evidence

The broad local run was deliberately stopped after 53 completed passes when CI
exposed the ordinary-background Reduced Motion scheduling defect. Its original
log, partial browser artifacts and `interruption.json` remain in the ignored
`animation-review/.local/pre-fix-local-148-partial/` directory. The unfinished
95 planned cases are not counted as passes, and that run is not resumed against
a changed artifact to create a single green result.

[CI run 38859743050](https://github.com/JosHsuan/JosHsuan.github.io/actions/runs/38859743050)
first exposed a WebKit 1/2 failure in the ordinary background's frozen Reduced
Motion assertion: an additional driver frame was delivered after idle. The
original CI record did not identify the exact event caller. Separate pre-fix
native mouse/wheel/leave reproductions failed in Chromium and WebKit with two
additional driver frames while playback time and field draw count stayed fixed.
Those reproductions establish an ineffective-input scheduling defect; they do
not retrospectively identify which event caused the original CI delivery. The
raw failures and traces are retained, including the earlier mistargeted command
that found no tests.

The correction gates ordinary pointer, wheel, touch and reset-driven requests on
entry readiness, active lifecycle and motion preference. An unchanged resize
does not schedule a frame. A real dimension change may publish one static update
while Reduced Motion keeps active time and field draws fixed; the preference
change itself still publishes the clearing frame, and disabling it resumes
normal motion without replaying blocked input. Bending's delegated Director is
unchanged. The new portable regression covers entry-pending, Reduced, hidden,
fine/coarse input, unchanged/real resize and resume. Its seven background checks
pass without skips, as does the 31-check selection that includes those checks
and the related playback/score/field suites. The complete
reduced-fix portable run discovers 371 checks, with 369 passes and two existing
conditional skips; the rebuilt browser selection passes all 12 background
executions across the three configured projects without weakening the exact
frozen time/frame/draw assertion.

The supporting root logs are `.local-global-background-root-check-reduced-fix.log`,
`.local-global-background-portable-reduced-fix.log`,
`.local-global-background-pages-build-reduced-fix.log` and
`.local-global-background-browser-reduced-fix.log`. These local results do not
complete the new same-SHA CI gate.

The same first CI run's Chromium 4/4 shard also records a genuine XR phone
context-loss fallback classification race: deliberate `WEBGL_lose_context`
correctly leaves native video and zero Canvas elements, but reports
`render-unavailable` where the causal result must be `context-lost`. That shard
has 16 passes and one failure. The renderer now checks the actual context's loss
state before and after rendering, and again on a thrown render error before
resource disposal. A typed loss result preserves `context-lost`; unrelated draw
errors remain `render-unavailable`. This protects frame, resize and face-change
paths while preserving native video through GPU fallback. It does not claim the
first CI trace established a particular event ordering.

Three new production-adapter CPU regressions cover render-before-native-event,
native-event-first and unrelated-error paths. All 21 related lifecycle/geometry/
native-video checks pass without skips in
`animation-review/.local/xr-context-loss-cpu-20261016.log`. They use the production
phone acquisition and real Three resources with a fake renderer, so they do not
replace browser validation. The rebuilt actual XR selection then passes 10/10
Chromium/mobile executions in 32.8 seconds, including genuine context loss,
native-video fallback and continuing playback time. The root log is
`.local-global-background-xr-browser-corrections.log`.

The final local portable run in `.local-global-background-portable-corrections.log`
discovers 374 checks: 372 pass, zero fail and two existing conditional checks skip.
`.local-global-background-pages-build-corrections.log` records the successful
138-file / 57-approved-file public audit. Both original CI failures remain
retained failed checkpoints. The complete 19-file / 222-execution corrected
same-SHA CI selection, deployment and live comparison are still pending.

The Windows host's WebKit 26.6 reports H.264 support as `probably`, but actual
native decoding of all three selected recordings returns media error 4. The
independent capability observation is retained locally. Positive playback
assertions remain mandatory in the complete Linux WebKit CI selection; this
host limitation does not turn those tests into skips. Physical Safari/iPhone
decoder and sustained-device performance have not been measured.

## Scope and source evidence

The [architecture contract](GLOBAL_BACKGROUND_INTEGRATION.md),
[source/conversion record](XR_PROJECT_INTEGRATION.md),
[actual team review](GLOBAL_BACKGROUND_XR_TEAM_REVIEW.md) and
[decision 0012](../../../../docs/decisions/0012-global-background-xr-research.md)
record the implementation boundaries. Original Bending content, 42 preceding
asset/license byte sequences, scene material/light/camera modules and its source
model remain the protected comparison target. Private originals and local raw
diagnostics do not enter the public build.

Raw before/after reports, passive native-event evidence, focused state captures,
PNG hashes, conversion provenance and browser traces live in the ignored local
`animation-review/.local/` research area. They are validation data, not browser
assets or a claim that these local files are published in the repository.
