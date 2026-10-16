# Prepared page and Home presentation: verification record

Date: 16 October 2026 (Europe/Berlin).

Status: local functional and visual review complete; the first exact-commit CI
failed and correctly blocked publication. The test-observation correction passes
two local browser executions; new exact-commit CI validation, publication and live
acceptance remain pending. Auxiliary strict transport and independent
normal-time pixel comparisons retain their nonpassing flags below. This record
belongs to [decision 0014](../../../../docs/decisions/0014-prepared-page-home.md)
and [its integration contract](PREPARED_PAGE_HOME_INTEGRATION.md). Earlier XR
records and raw failures remain historical evidence; their results do not
certify this changed candidate.

The source baseline at the start of this revision is
`087e8a468b7528c3905162016b7f3ea50b909c01`. The protected Bending presentation
reference remains `6288286`. Neither identifier proves the new work has been
built, tested, committed or deployed.

## Source-level checkpoint

The following checks have been executed during implementation with Node 24.19.0 /
pnpm 11.19.0. CPU fixtures validate production modules, and `pnpm check` validates
the separate reusable framework. Neither establishes this revision's real public
GPU paint, browser animation delivery, screenshots or device performance.

| Check | Available result | Evidence scope |
| --- | --- | --- |
| Stable controller/renderer/Home selection | 82 pass, zero fail/skip, in the retained [source-level log](animation-review/.local/prepared-page-stable-82.log) | Site navigation 49, preview registry 10, lifecycle 10, Home presenter/grid 6 and renderer/source 7. Covers composition/native completion/fallback ordering, retention/cancellation, real-source fitting/HDR/abort and the injected draw/context/shader attachment guard. It is not actual GPU evidence. |
| Shared background driver selection | 8 pass reported by its implementation owner | Actual Home event delivery on the existing scheduler, Reduced Motion/hidden/BFCache/Save Data/forced-colour policy and disposal. Consolidated final run remains required. |
| `pnpm check` | Pass, retained [log](animation-review/.local/prepared-page-pnpm-check.log) | Content, lint, types, unit/integration/CI checks, root build and the empty framework's 63-file artifact audit. This command does not build the selected public Pages application. |
| Public Playwright discovery | 231 executions: 77 in each of Chromium, WebKit and mobile Chromium across 19 spec files; [discovery JSON](animation-review/.local/prepared-page-browser-list.json) | `--list --reporter=json` only. No browser was executed by discovery. |
| `node --check tests/pages/project-previews.spec.mjs` and scoped diff checks | Pass | Browser-spec syntax only; no browser execution. |

The retained log/discovery SHA-256 values are respectively
`6de7eaacd6f075315f5d5ccd8ea2b65f8c2d3f06166e2024db88c34281bbc860`,
`95d7bf86e1e28373191f58d03c5cb6f45720b12f9ed1eb1b15acce4220310c9d`
and `a317874b46ee500ccfc96f342beb809f90101b89130ac7bd46301322292563a5`.
The controller selection and other groups are separate checkpoints; do not sum
overlapping selections or present discovery as a passing browser suite.
These source-level results predate the subsequent XR paint-guard and visual
corrections below. They remain their original checkpoint, not certification of
later edits.

## Exported-browser and retained visual findings

Two actual Chromium/mobile Chromium selections passed before the final visual
corrections: **50 executions** in
[the earlier browser log](animation-review/.local/prepared-page-browser-second.log),
then **22 executions** against the rebuilt source/body/screen paint guard in
[the guard browser log](animation-review/.local/prepared-page-browser-final.log).
Their SHA-256 values are
`d83e795eb13a28139c39fb401469ccbea047b44ec36b5d195b978c90c9a9f998`
and `9f2bc7b1e4738e7fa17f3145ac50ed8160e8220972ba16d5b505b732b6a1ba7b`.
These are passing executions against their respective earlier exports, not a
combined passing run of the later feather/navigation/overflow candidate.

The [first local visual protocol](animation-review/.local/prepared-page-local-087e8a4/2026-10-16T14-21-09.854Z/results.json)
has SHA-256
`ba9a39ec0a34fc9e1c4651c1eefdfcac8192b5da2b151b45c54744e84a68f10b`.
It records **19 of 34 intended views and 22 checks, with the whole protocol
failed**. Desktop completes 16 views and all 18 checks, including prepared-card
entry, native Home motion, XR source/recordings and Bending default/overview/form.
Mobile confirms its initially prepared offscreen card, then its native moving
Home capture detects real horizontal overflow and stops the remaining normal
mobile path. The separate Reduced Motion context completes both views and both
checks. Thus 21 checks pass and one fails; the missing normal mobile views are
not implied passes. All three contexts retain zero failed network requests,
zero page/HTTP errors and zero pending transports at requested/completed close.
Those clean transports do not waive the mobile visual failure. The original
receipt, screenshots and context failure remain unchanged.

Inspection of the same visual candidate also identifies a hard rectangular
boundary around XR's cropped editorial set and the need to keep chapter
navigation below the masthead. Source corrections now:

- Clip horizontal decorative overflow on the selected portfolio wrapper and
  assert document width throughout native Home movement, rather than only at rest.
- Feather only the three XR editorial materials by 80 desktop / 32 narrow CSS
  pixels, scaled from actual budgeted drawing-buffer dimensions; preserve the
  model, casing and recorded-screen pixels, projection and existing budgets.
- Keep the separate real-source/body/screen paint guard, so scenic draws cannot
  acknowledge a missing source or recorded screen.
- Position the sticky XR navigation below the fixed masthead in both layouts.

These edits are documented in
[the current integration contract](PREPARED_PAGE_HOME_INTEGRATION.md). Source
presence, shader/uniform ownership and disposal checks do not by themselves
prove that the final edge and mobile layout look correct.

## Latest source and public-build checkpoint

The visual-corrected source passes the complete portable selection:
**451 discovered, 449 passed, zero failed, two existing conditional browser-only
checks skipped**. The skips are the actual WebGL rear-layer/glyph/mist and actual
SVG/React rendering checks; their conditional CPU skips are not browser passes.
The retained [portable log](animation-review/.local/prepared-page-portable-visual-final.log)
SHA-256 is
`7c38191f1987b8fa0dbaf6c6f42e0a3448782c5569526389e3600a25d45aa2ef`.

The subsequent public Pages build/audit passes with **140 output files and all
57 approved assets**, without private inputs. Its
[build log](animation-review/.local/prepared-page-build-visual-final.log) SHA-256 is
`757e9e0da92e5ab73c8d75287eaeb4cc3fab3db70fc28efb2d84938c4de031c1`.
This is local build evidence; it is not a validated CI deployment artifact.

The new **14 affected browser executions** pass on the visual-corrected export
in 2.2 minutes across Chromium/mobile Chromium; the
[distinct corrected-export browser log](animation-review/.local/prepared-page-browser-visual-final.log)
has SHA-256
`101db45867efcd0f21938ba588393aa8122caf9bd1dac6f7cb952af6ec0b52cc`
and is separate from the earlier 50/22 runs. Its checks cover actual document width
during native Home movement, sticky navigation/masthead clearance, the actual
80/32 CSS-pixel stage owner and drawing-buffer mapping, classified source/body/
screen draws, normal entry/exit, original recordings, context loss and real
HTTP fallbacks. A complete **34-view visual capture is still pending** at this
checkpoint. Its current protocol records attempted frame facts before asserting
viewport bounds and adds navigation/stage-edge checks; the original failed
capture remains unchanged and no acceptance bound is relaxed.

The integrator must retain the new visual outcome and artifact identity before
adding a local acceptance entry. Protected Bending comparison, final required CI,
commit/push and deployment/live evidence also remain separately required. No CI
run or live publication of this revision is claimed here.

## Required acceptance evidence

The matrix preserves the earlier affected-test checkpoint. The final local
review below supersedes its pending local-capture labels; exact-commit CI,
deployment and live acceptance remain pending for every requirement.

| Owner requirement | Concrete evidence required | Current acceptance |
| --- | --- | --- |
| Loading switches after the actual destination is prepared | Hold a real critical asset and model request; show requested loader/content guard, then actual decoded resources, model draw and native animation completion preceding successful entry. Preserve explicit failure terminals. | Held-resource assertions pass on earlier exports; the corrected affected selection passes, but does not replace required full same-artifact CI. |
| Card prepares when the page opens | Home/Projects acquire before positive intersection; successful `firstDraw` and registry model result while loader covers the offscreen card. Scroll out/in retains the same acquisition and no repeated GLB/HDR transport or poster replacement; idle does not draw. | Earlier browser/desktop visual and mobile initial-readiness evidence pass; full corrected mobile path pending. |
| Safe static fallback with no late replacement | Real source/HTTP/GPU failures, policy behavior and global deadline close work before uncovering. Late component/body results cannot upgrade a latched static arrival. Actual context loss stays failed across scrolling. Normal departure disposes a genuinely active resource; BFCache has its explicit retention policy. | Earlier model checks and two reduced visual checks pass; corrected XR HTTP/context-loss checks pass. Complete new visual/full CI evidence pending. |
| Grid grows beyond nine without lines | Function boundaries through 9/12/15 and later rows; actual three-/two-/one-column geometry with no painted grid dividers, unchanged accepted card alignment/rim, and only approved project items. | Portable/earlier geometry evidence available; complete corrected responsive visuals pending. |
| Home has the Bending scroll response | Same production presenter sampled on one existing site scheduler; actual native wheel/touch/anchor/keyboard movement, visible entry/exit, focus/static policies, idle and teardown. Optional field failure does not block Home motion. | Earlier mobile moving overflow remains a failed checkpoint; corrected affected checks now pass native moving-width assertions. Complete new visuals pending. |
| XR main visual opens, later 3D remains and gains stage transitions | Opening visual visible and hidden prepared canvas/controls; actual later model/phone paint, source projection/hits, project-local background and complete entry/exit under native scrolling/reversal. Original Pause/Play, full durations and source-frame timing stay intact. | Corrected-export affected checks pass the stage-only feather/navigation and native stage/media assertions; complete reviewed visual capture pending. |
| Remove Contribution/Limits sections while keeping truthful credits | Eight chapter markers; removed section IDs/nav/heading blocks absent; section 05 credits, all approved source data/pins, authorship, source note and retained benchmark/hardware limits verified directly. | Current public artifact audit and earlier exported checks pass; final capture/CI acceptance remains separate. |
| Complete deployment | Successful exact-commit required CI, validated export digest, existing workflow consuming that artifact without rebuild, then matching live release/routes/assets and actual live screenshots/interactions. | Candidate `1b46df6` was committed and built by CI; the required gate failed on one desktop Chromium execution. Publication is held; corrected-test revalidation and live acceptance remain pending. |

## Final records to append after execution

### Final local review before commit

The final compact mobile chapter row was rebuilt and audited as 140 public files
with the same 57 approved assets. Its affected desktop/mobile source/transition
checks passed 2/2 in `animation-review/.local/prepared-page-browser-compact-nav.log`.
The preceding corrected-export selection passed 14/14; the full portable
selection remains 451 checks, 449 pass and two existing conditional skips.
These selections overlap and must not be summed as unique coverage.

The retained v3 capture receipt is
`animation-review/.local/prepared-page-local-087e8a4/2026-10-16T14-38-34.621Z/results.json`,
SHA-256 `cd3e179e11216dfb34b2c36d0b551bf6517dab20cbe320de5e396a19c625f47e`.
Its 38 functional checks and 34 actual screenshots complete Home native motion,
prepared-card retention, native navigation, XR photographic opening, all later
model/phone chapters, actual source projection/hits, complete recordings and
Pause/Play, return to the opening, and separate Reduced Motion reading. The
mobile chapter row clears both the fixed masthead and the projected source/phone
by actual measured bounds. Visual review accepted the final stage-only soft
edges and unobstructed mobile source/recording. All 57 source pins and the complete
artifact manifest remained unchanged; no page, console or HTTP errors occurred.
This is an uncommitted local export based on `087e8a4` metadata, not that published
revision or a substitute for the future CI export.

The receipt's strict aggregate remains **false**: it retains two mobile
Bending-destination `ERR_ABORTED` transport observations. The desktop poster was
cancelled before HTTP while its selected mobile picture completed HTTP 200. The
single GLB request reported HTTP 200 and then cancellation, but the original
runtime subsequently parsed and rendered all 172789 vertices, 227521 triangles
and 51 source objects without retry, with Full materials and all three protected
views available. Every issued request reached a terminal and every departure /
context close had zero pending requests. Responsive picture selection is
consistent with the first cancellation; the GLB cancellation's caller is not
proven. These observations are preserved, not relabelled transport success or
an asset-availability failure. Eleven original Bending lifecycle/render/entry
files were independently compared byte-for-byte with `087e8a4` and are unchanged.

The independent normal-motion comparison retained six pairs / twelve raw PNGs:
`animation-review/.local/prepared-bending-comparison/2026-10-16T14-42-47.305Z-961bc361/results.json`,
SHA-256 `a5634416ac5196f66b0d3f32c0bf2d0fa467b8d083abd5fe340efbb517e29b51`.
Its raw transport checks and source/layout/allocation comparison pass, with
identical approved asset bytes and one delegated Bending clock. Pixel, pose and
time-phase equality remain **false**: the two native sessions run at independently
elapsed phases, including automatic representation changes. Material differences
in all six comparisons are solely the recorded `progress` field. Both raw images
and amplified differences remain; no clock, style, scene or preference override
was used, and no normal-time zero-RGB-match claim is made.

Earlier failed or incomplete local receipts remain immutable. No auxiliary
aggregate has been edited to make it green. The existing required CI gate and
same-artifact deployment remain mandatory before publication.

### First exact-commit CI: failed, publication held

[CI run 38919616325](https://github.com/JosHsuan/JosHsuan.github.io/actions/runs/38919616325)
tested commit `1b46df69fac390a2f0cc923fd094b8d6da0d8386`. The public build
receipt records export digest
`b60a0ea64ba3e164b5d2424d6a45362548007c2efee328dc5ca59ec5f730249e`.
This identifies the failed candidate, not a validated release. Actual results:

| Selection | Result |
| --- | --- |
| Quality / portable | 451 discovered: 449 pass, zero fail, two existing conditional skips. |
| Empty framework, root and `/portfolio-test` | 12/12 pass in each build. |
| Public desktop Chromium | 76/77 pass; the native three-recording XR case fails at its 60-second test deadline. |
| Public WebKit | 77/77 pass. |
| Public mobile Chromium | 77/77 pass. |
| Public total / required validation gate | 230/231 pass. The required gate fails, so this candidate is not published. |

The sole failing execution is in
[desktop Chromium shard 4/4, job 117036494792](https://github.com/JosHsuan/JosHsuan.github.io/actions/runs/38919616325/job/117036494792):
`native scrolling selects all three complete recordings in the same scene and
pause preserves native media time`. That shard retains 17 passes and one failure.
It reaches Join, then exceeds the existing 60000 ms test timeout at the first
actual stage-canvas screenshot, `tests/pages/xr-research.spec.mjs:127`. The failed
test does not establish successful completion of its remaining captures or
Pause/Play assertions. Its call log reaches loaded fonts and the element-stability
wait; it contains no reported "not stable" retry sequence.

The retained trace records the test start at monotonic `979755.784` ms. The
first Join screenshot's locator acquisition starts at `1037703.159` ms, already
**57.947 seconds** into the 60-second test. That acquisition takes `1064.134` ms
and completes at `1038767.293` ms, leaving approximately **988 ms** for the
screenshot and all remaining work. This timing supports reducing sequential
test-observation round trips; it does not prove an unstable scene. Across three
retained snapshots after the stage enters `hold`, the canvas bounds remain
left `691.1875`, top `140`, right `1425.578125`, bottom `920`, and its presented
surface remains `translate3d(0px, 0px, 0px)` with opacity `1`. These sampled facts
do not certify every instant between snapshots, but they provide no basis for a
runtime motion change.

The downloaded failure artifact is `public-case-failures-chromium-3`, ID
`12055032713`; its uploaded ZIP SHA-256 is
`b20d311bacad5aa9ae2cc5b82e3985a6dbf9ab1d8156e3c7498ad284b2e4f196`.
Retained local evidence and SHA-256 values:

- [Failing job log](animation-review/.local/github-job-117036494792.log):
  `808cd99951dbe328459e9d28f5f96b338f55b8f5caedf620793543927aa6705b`.
- [Test-runner trace](animation-review/.local/prepared-page-ci-1b46df6/trace-chromium4/test.trace):
  `45d177ecfa0cf80c67d74fbc34266d6a1bec5470121ce6eef4b9bf2e47ffd12d`.
- [Browser trace](animation-review/.local/prepared-page-ci-1b46df6/trace-chromium4/1-trace.trace):
  `1f393387c9cd52d8dc63c650c3255029377efacf0d02425da498a1ff634ab81a`.
- [CI build receipt](animation-review/.local/prepared-page-ci-1b46df6/build/ci-build.json):
  `b23ee51ea4c382276e8c5214e85af04590b97fc851c645291fc280a8a686b398`.

No runtime edit is warranted by this evidence. The failed candidate's raw
evidence remains unchanged, and a new passing required gate plus same-artifact
deployment and live acceptance are still required.

### Test-observation correction: local execution only

The implemented test-only correction batches related observations in browser
RPCs while preserving the 60-second deadline, all three complete recordings,
every actual canvas capture and all existing assertion thresholds. With Node
24.19.0 / pnpm 11.19.0, the same native-recording case passes on the existing
local `.pages-workspace/out/` artifact in desktop Chromium (**21.7 seconds**) and
mobile Chromium (**13.7 seconds**): **2/2 pass, 36.9 seconds total**. The retained
[local browser log](animation-review/.local/prepared-page-native-observation-browser.log)
has SHA-256
`e0a77a5a7ff9927a1b9307715fac51bbfbf2ae7b13edbea24a4937e60ae23627`.
Source syntax and ESLint checks also pass. This local Windows checkpoint is not
Linux CI evidence or a full browser-matrix pass. A new exact-commit CI run and
its successful required gate, same-artifact deployment and live acceptance are
**pending**; the earlier `1b46df6` failure retains its original result.

### Remaining final evidence

- Final source commit and clean build identity; `pnpm check`, portable discovery
  and scoped/full results, with actual skipped/failed checks retained.
- Export digest and approved-asset verification; SSR counts/content appropriate
  to the new eight-chapter presentation, rather than the obsolete 74-string rule.
- Browser engines/projects, desktop/mobile dimensions, actual model and native
  media readiness, scroll/entry-exit/closure evidence, and reviewed screenshots.
- Matched protected-Bending regression, including final rendered presentation;
  source equivalence alone is insufficient.
- CI run/job results and validation receipt; deployment run and exact consumed
  artifact; live response/range/pin checks and actual live captures.
- Any browser or physical-device checks that could not run. Mobile emulation
  does not establish real Safari/iPhone memory, thermal or crash behavior.

No planned check, test count, green source fixture or old release receipt marks
an unexecuted requirement complete.
