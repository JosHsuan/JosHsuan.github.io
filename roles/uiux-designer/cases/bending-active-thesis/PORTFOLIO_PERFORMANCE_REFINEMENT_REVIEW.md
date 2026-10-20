# Portfolio performance refinement review

Date: 20 October 2026. Role: the existing Performance Engineer, independently
reviewing decision 0019. Status: source audit, measurement plan and initial native
desktop baseline; post-refactor performance acceptance remains unproven. No field
Core Web Vitals claim.

The role read the current repository and role instructions, empty-framework
decision, architecture boundaries, website design guidance, decision 0019,
refinement/team contracts, ordinary-page driver, generic controls, demand
scheduler, event/disposable scope, information-window presenter, backdrop/scene
presenters, preview lifecycle and native-video resource. Browser/GPU work is
exclusive to root; this review does not start a competing browser or build.

## Primary guidance and its application

- [GoogleChrome/web-vitals](https://github.com/GoogleChrome/web-vitals/blob/main/README.md)
  measures actual user metrics, observes a whole visit and restarts reporting
  after BFCache restoration. Repeated observer registration has a lifetime cost.
  Here, one bounded diagnostic registration per document records native Event
  Timing and lifecycle facts. These controlled lab samples are not field INP,
  CrUX, a population percentile or proof that all physical devices are fast.
- [GoogleChromeLabs/page-lifecycle](https://github.com/GoogleChromeLabs/page-lifecycle/blob/master/src/Lifecycle.mjs)
  accounts for hidden, frozen, terminated and restored documents, including
  browser differences in delivered transitions. Keep composed suspension reasons,
  retain valid BFCache resources, and release listeners, native media and pending
  operations on a real nonpersisted departure. Do not add an unload handler.
- [MDN requestAnimationFrame source](https://github.com/mdn/content/blob/main/files/en-us/web/api/window/requestanimationframe/index.md)
  describes one-shot, timestamp-based callbacks and background throttling. Keep
  the existing demand scheduler, one outstanding application frame and active
  elapsed-time handling; diagnostics decorate existing callbacks rather than
  starting another render loop. Browser throttling alone does not prove that
  application controller/media work has suspended.
- [MDN ResizeObserver source](https://github.com/mdn/content/blob/main/files/en-us/web/api/resizeobserver/index.md)
  explains resize feedback loops. Observers invalidate measurement; the existing
  frame owner batches reads before presentation. Transform/skin updates must not
  change native content dimensions or repeatedly resize their observed source.
- [Chrome layout guidance](https://web.dev/articles/avoid-large-complex-layouts-and-layout-thrashing)
  recommends grouping layout reads before writes and reducing repeated layout
  work. Count actual chapter rectangle reads and Chrome layout/style duration
  before/after, rather than treating fewer listeners as proof of faster layout.

These principles justify a bounded refactor without adding these libraries,
analytics, a global event bus, a production observer or another clock.

## Concrete source findings

| Finding | Evidence before senior refactor | Proposed treatment |
| --- | --- | --- |
| Duplicate chapter measurement/event path | `ProjectCaseStudyControls.update` reads consecutive chapter rectangles for every scroll, IntersectionObserver notification, resize, hash change and pageshow. `SiteBackgroundDriver` separately schedules scroll; the selected chapter attribute then schedules through another MutationObserver. | Senior architect should make one lifecycle owner select native midpoint intent and publish chapter/link/counter/source state through the existing demand cycle. Cache native chapter anchors only with real invalidation for late images/fonts/layout. Preserve native document position, deep links, exact midpoint boundary and BFCache restoration. |
| Repeated inactive video operations | Backdrop `render()` loops all records and calls `pause()` for inactive/noneligible videos even when already paused. This invalidates generations, reads current time and invokes native pause during unrelated finite motion. | Measure invocation and controller cost first. Any idempotent fast path must preserve cancellation of pending play/first-frame callbacks/deadlines, retained time, late native starts, ended state and user pause. Do not merge simulation/recording transport owners. |
| Inspector snapshots on a frame path | `wanted`, `canInspect`, `updatePolicy` and inspection publication call lifecycle/resource inspectors that clone history/resource facts; the driver also calls `binding.inspect()` twice in its frame-tail condition. | Prefer a bounded internal read-only predicate only if a CPU profile identifies material work. Rich debug inspectors remain available. Avoid broad speculative rewrites. |
| All-window outline calculation | Information presentation samples window paths for visible, offscreen and resting windows on each active finite frame. DOMPresenter already avoids unchanged writes, and the demand scheduler stops once motion settles. | Measure controller callback cost and mutation count across long Caschlatsch prose before optimizing. Preserve exact published skin/transform and focused reading. A source-level loop count is not a measured bottleneck. |
| Existing ownership worth preserving | One driver clock, bounded source histories, native video time, generation checks, first-frame receipts, disposal scopes and unchanged-DOM filtering are implemented. | Retain them and test real event closure. Do not exchange this working system for a generalized framework or claim that caught errors establish crash recovery. |

## Built-artifact measurement protocol

An ignored `animation-review/.local/portfolio-refinement/profile-portfolio-refinement.mjs`
helper records the actual release metadata and route HTML hashes, browser/version,
OS/CPU, viewport/DPR, scenario, wall time and instrumentation. It has no production
import. Root runs it alone against the final built export, using the same engine,
viewport, machine and scenario before/after the senior architecture change.
An optional `--instrument 0` companion run provides a lower-overhead comparison;
observer/wrapper timing is included where measurable, not assumed to be zero.

Required coverage is all six redesigned routes plus protected Bending and XR,
desktop and mobile emulation. The helper uses trusted native anchor/keyboard
and wheel input, records all forward/reverse chapter states, then captures
stationary, paused, resumed, native background-tab attempt, and actual departure/
back-navigation facts. It samples existing inspectors at phase boundaries,
decorates existing RAF callbacks, native media operations and targeted chapter reads, and uses bounded
Mutation/Performance observers. Chrome CDP records actual layout/style/task
durations. Other engines must report unsupported APIs as unavailable, never zero.

### Project budgets and interpretation

1. Every selected chapter must match its native midpoint intent after navigation;
   source transactions must reach an honest held/failed/static terminal. Native
   content/navigation remains available independently of WebGL.
2. Paused and genuinely hidden/suspended documents must add zero controller
   frames and zero scene/field draws after the final settling paint; native media
   time must stop. Count final outstanding paints before measuring the interval.
   A background attempt that leaves the document visible proves no hidden claim.
3. Nonpersisted departure closes listeners/scopes, frame requests, decode/play
   deadlines, video sources and callbacks. Persisted departure retains resources
   suspended; actual restored navigation must resume without duplicate owners.
   Synthetic lifecycle events are useful unit tests, not this native evidence.
4. At most one recording plays, no chapter scroll seeks video, and already viewed
   clips retain independent times. New media request counts/transfer bytes and
   first decoded/native advancing time are recorded separately from motion.
5. Target no new attributable long tasks above 50 ms during settled chapter
   interactions, and a lab Event Timing p95 below 200 ms on the recorded machine.
   These are investigation thresholds, not proof of field INP or hard-coded
   passing assertions. Report every overrun with phase/source/LoAF attribution.
   Scrolling is measured as frame/layout work, not mislabeled as INP.
6. Compare actual chapter layout reads, layout/style duration, script/task time,
   RAF callback duration and DOM mutation counts. Ratios without equivalent
   scenarios or tiny samples are descriptive only. Keep paired runs and report
   regression where present; no invented percentage improvement.
7. Preserve matched desktop/mobile Bending/XR captures and all six accepted
   generic visual compositions. Counts, resource estimates and automated checks
   do not establish matching pixels, sustained FPS, total GPU memory or physical
   iPhone stability.

## Initial native desktop baseline

Root ran the frozen design export exclusively from 14:39:37 to 14:46:42 UTC on
20 October. All eight route scenarios completed without a scenario/page error.
The export's metadata names base HEAD `9add8195db77090027f37b163146cc65b7dda042`;
that is **not** the exact uncommitted design source identity. The raw receipt
binds individual route HTML hashes and reviewed public-data revisions. This is
an implementation baseline, not a final release/CI/live receipt.

Environment: Chromium `153.0.8010.12`, Windows `10.0.22631`, Intel i9-13900HX,
1440 × 1000 CSS pixels, DPR 2. The original profiler SHA-256 is
`4c7d4eb37fbb2967ff211da125b046dd5d2f04d10e66ae35a2978039df43cc91`.
Raw `performance-before/before-chromium-desktop.json` SHA-256:
`333c46da723910a2dda11cd0f17c9146cc76a3d41989402e01dcaf5c5448a21a`.
An independent CPU-only analysis is kept beside it as
`independent-baseline-analysis.json` in the ignored revision evidence folder.

| Generic page | Chapter rectangle reads, forward + reverse | All rectangle-read time | Chrome layout time | Largest native lab event, forward / reverse |
| --- | ---: | ---: | ---: | ---: |
| Mode/s of Making | 294 | 7.60 ms | 12.28 ms | 648 / 896 ms |
| Entrance Installation Art | 164 | 5.70 ms | 6.96 ms | 1088 / 1360 ms |
| Dot-Based 3D Printing | 157 | 2.30 ms | 6.90 ms | 208 / 184 ms |
| HC3DP Caustics | 163 | 3.90 ms | 8.04 ms | 5544 / 5504 ms |
| Special Assemblies | 156 | 3.80 ms | 7.51 ms | 184 / 200 ms |
| Project Caschlatsch | 200 | 2.70 ms | 5.10 ms | 176 / 240 ms |

The 1,134 repeated chapter rectangle reads confirm the source finding and
justify consolidating ownership. Their measured cost is much smaller than the
multi-second stalls, so this refactor alone cannot be described as resolving
overall performance. For the large HC3DP events, key-handler processing was
approximately 2 ms, decorated application RAF callbacks stayed below 70 ms,
and long tasks exceeded 5 seconds. Current LoAF entries lack useful function
source attribution. A bounded CPU/trace/GPU diagnostic must identify whether
native rendering, another task or instrumentation is responsible before changing
protected geometry, recipes or visuals.

All six generic pages added zero controller frames, layout/style calculations,
DOM mutations and native media operations during their approximately three-second
paused intervals after real scheduler settlement. This is scoped idle evidence,
not sustained rendering or hidden-page proof. Mode/s's opening made 378 pause
calls to already paused clips in three seconds, but their cumulative measured
native-call time was only 12 ms; repeated work exists without explaining the
large stalls. Regular existing RAF callback p95 was about 20–23 ms at generic
openings and 45–51 ms during many later phases, including model-free Caschlatsch.
That warrants attribution of shared field/presentation work before claiming a
reasonable interaction budget.

Every attempted background-tab switch left the headless document visible; no
hidden claim is made. Bending/XR have no global Pause motion button, so the
generic paused result does not cover those references. The initial helper's
capture-phase pagehide microtask can run before later application pagehide
listeners, making its apparent departure-leak flags **unproven**. The separate
`profile-portfolio-lifecycle-v2.mjs` registers a late window-bubble receipt after
application initialization and visits actual media before About/Back; its native
result is required for disposal/BFCache conclusions. The original baseline helper
remains unchanged to retain paired measurement comparability.

Default automated Chromium disables BFCache, so a successful About/Back reload
cannot establish actual retained-document restoration. The separate lifecycle-v3
fork omits only `--disable-back-forward-cache` from Chromium's default arguments;
v2 remains unchanged. This is a specifically labelled lifecycle configuration,
not a performance comparison. The helper records trusted persisted events,
document tokens, late departure state, native NavigationTiming reasons and CDP
`Page.backForwardCacheNotUsed` explanations where available. A cache rejection
must retain its actual browser reason; no fabricated persisted event, retries or
emulated restoration can replace it. The prepared helper has not itself proved
a successful BFCache restoration.

The corresponding eight-route Chromium mobile-emulation baseline completed at
15:03:12 UTC, 390 × 844 CSS pixels and DPR 3, without scenario/page errors.
Raw `performance-before/before-chromium-mobile.json` SHA-256:
`0cbd9a8c5cf4fd7a4efadc61e8a44b3c0d1d2dd1f2bdfbd7776bcad3919ba717`.
Six generic forward/reverse journeys made 1,054 chapter rectangle reads. Their
paused intervals again added zero controller frames, layout/style work, DOM
mutations and media operations. HC3DP still produced native lab events of
5,072 / 5,168 ms; this is mobile emulation on the same software-rendering host,
not a physical-device result. Hidden-page and early-departure-receipt limitations
remain the same as the desktop baseline. The independent source review of the
architect's new scoped chapter presenter, driver integration and markup-only
controls found no event/lifecycle must-fix; built native regression is still
required before accepting the implementation.

## Bounded CPU/GPU attribution

Root's separate diagnostic completed from 14:55:23 to 14:56:03 UTC. Its raw
`cpu-before/cpu-diagnostic.json` SHA-256 is
`6ec2fe5929a38f05d81215a7c039d1fce72526f5255de207d6a6898321575173`.
The independent `cpu-before/independent-cpu-trace-analysis.json` maps the sampled
bundle location to the actual `createPageFieldRenderer.render` implementation.
Profiling/trace overhead makes these attribution samples unsuitable for a
claimed before/after speedup.

SystemInfo reports `ANGLE_SWIFTSHADER`, SwANGLE `5.0.0`. Canvas 2D is software;
compositing, rasterization and video decode also report software operation.
The installed Playwright launch implementation adds
`--enable-unsafe-swiftshader`, permitting software fallback, and chooses
`chromium-headless-shell` by default for headless execution. That flag alone
does not prove it forcibly selects SwiftShader. Full bundled Chromium and the
system Chrome are present; a separately labelled full-browser headless diagnostic
may reveal hardware availability, but it cannot replace the required browser
matrix or turn a changed browser mode into a paired speedup.

| Diagnostic phase | Native `drawImage` sample weight | Field renderer inclusive sample weight | Interpretation |
| --- | ---: | ---: | --- |
| HC3DP stationary opening | 1,297.420 ms / 41.39% | 1,429.236 ms / 45.59% | Field atlas drawing dominates the active JS path. |
| HC3DP stationary after navigation | 2,216.953 ms / 71.48% | 2,439.384 ms / 78.65% | Same shared source, without material or geometry edits. |
| Caschlatsch stationary opening | 981.291 ms / 32.18% | 1,088.659 ms / 35.70% | Model-free confirmation of a shared field cost. |
| Caschlatsch stationary after navigation | 2,128.516 ms / 69.46% | 2,331.659 ms / 76.09% | No layout/style work occurred in this phase. |

These are weighted samples, not exact process CPU or display FPS. The atlas was
built once, not once per frame; rebuilding it is not the demonstrated problem.
HC3DP's native context/system interval instead has 14.746 s task duration versus
1.676 s script duration, with 13.044 s attributed only to `(program)` by the
sampler. The filtered trace does not identify that native method. The large
software-rendering stalls therefore remain an unresolved environment limitation;
neither chapter ownership nor a small JS cache is proven to solve them.

The only proposed field experiment is an isolated immutable-ImageBitmap copy of
the existing atlas. It keeps the native nine-argument `drawImage`, alpha, source
crop, order, smoothing, math, density, timing and dimensions. The ignored
`compare-page-field-atlas.mjs` checks every RGBA byte for actual field samples,
pointer strengths and portrait dimensions, then runs bounded ABBA timing blocks
with a separately measured readback fence. It changes no production file.
A retained 168 × 384 RGBA bitmap has an approximate 258,048-byte pixel store;
that estimate is not total process or GPU memory. Production adoption requires
native pixel identity, a material measured benefit, explicit bitmap close,
generation-safe late fulfillment, context/tint replacement and reliable canvas
fallback. Those conditions are not yet proven, so no field optimization is
accepted here.

Root completed the isolated Chromium atlas comparison. Raw
`atlas-diagnostic-default/atlas-chromium.json` SHA-256:
`7186cac7b264c1e69fab0c731a2e0c09f4e050cff8da86ce63810aa635ab5943`.
All twenty sampled desktop/mobile RGBA comparisons matched exactly. Desktop
canvas blocks averaged 20.117 / 19.658 ms per explicit render, against 19.000 /
18.950 ms for ImageBitmap; mobile blocks were 2.342 / 2.367 ms against 2.217 /
2.158 ms. Each block contained twelve explicit renders, with a separately
recorded final readback fence. These small, single-engine, two-block differences
do not establish a material application improvement or cover asynchronous
failure/context replacement. The Performance Engineer therefore recommends
**retaining the existing production atlas**, avoiding an extra retained bitmap
and new asynchronous lifecycle complexity. More experiment iterations are not
needed to justify this bounded no-change decision.

Full bundled Chromium headless launch failed with `spawn UNKNOWN`; there is no
accelerated benchmark or hardware-rendering acceptance. The default benchmark's
GPU facts still show SwiftShader. `Browser.getBrowserCommandLine` was unavailable
because its required automation flag was absent, so installed launch defaults
must not be reported as confirmed actual browser arguments.
`independent-atlas-mobile-review.json` records the independent review of these
raw results. No field renderer, algorithm, density, cadence, recipe or visual
effect was changed by the experiment.

## Remaining evidence

Post-refactor measurements, matched visual review and final CI/live acceptance
remain pending. A green source/unit test run cannot close those rows. Root must
append actual candidate identities, measured improvements/regressions and honest
limitations after the paired protocol, including any unavailable physical-device
check. These controlled native lab samples do not establish field INP or CrUX.
