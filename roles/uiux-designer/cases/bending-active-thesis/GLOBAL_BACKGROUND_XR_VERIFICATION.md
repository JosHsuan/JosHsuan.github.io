# Shared background and XR: integration verification

Date: 16 October 2026 (Europe/Berlin). This is the local integration checkpoint
before publication. It records observed results and retained failures; it does
not certify a later CI run or deployment. The final release is identified by its
Actions run, exact output digest and public `/release.json`.

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

## Local execution checkpoint

| Check | Observed result |
| --- | --- |
| Exact toolchain | Node 24.19.0, pnpm 11.19.0; committed lockfile retained |
| `pnpm check` | Passed: content, lint, types, unit/controller/CI tests, empty-framework production export and 63-file artifact audit |
| Shared-background browser scenarios | 12/12 passed across Chromium, mobile Chromium and WebKit against the frozen v2 public build |
| XR model/phone browser scenarios | 10/10 passed across Chromium and mobile Chromium: native model inputs, vertical touch reading, one draw call, idle/release/context loss, three actual changing video textures, pause/resume, Reduced Motion and real 404s |
| Portfolio/loading/card browser scenarios | 26/26 passed across Chromium and mobile Chromium, including NoJS recording links, critical-image failure/hold, native history, unobscured XR anchors and the retained Bending entry/card |
| Case and role portable checks | 368 passed, zero failed, two existing opt-in browser-only checks skipped; 370 discovered |
| Browser discovery | 222 executions in 19 files; all remain selected by full same-SHA CI |
| Main model / corrected poster | Pinned, independently source-verified and visually reviewed; 96,312 vertices, 190,320 triangles, 352 original meshes, one material/primitive |
| Corrected-poster production build/audit | Passed: 138 files, 57 approved asset/license files; private source data excluded |
| Broader local Chromium/mobile run | In progress at this checkpoint; not represented as a completed pass |
| Same-artifact CI, deployment and live comparison | Pending at this checkpoint |

The scoped browser results above refer to successive explicitly reviewed local
builds. The main-model screenshot run produced sixteen images with zero page,
HTTP or failed-request errors; the corrected poster was then inspected against
those actual Three views and the rebuilt asset was re-audited. They are local
integration evidence, not a substitute for the final exact-artifact CI gate.
Authored XR JSON is canonicalized to LF before commit, with parsed-value
identity checked, so Git's line-ending conversion cannot invalidate its byte
pins. The final model and all other public binary bytes are unchanged by this
storage-only step.

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
