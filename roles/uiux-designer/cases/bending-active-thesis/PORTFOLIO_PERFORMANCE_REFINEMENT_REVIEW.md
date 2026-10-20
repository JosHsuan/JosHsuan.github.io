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

## Paired post-refactor measurements

Root completed the same native profiler on all eight routes at both desktop and
mobile sizes, plus one separately labelled clean Mode/s mobile companion. All
scenarios completed without page/scenario errors. The profiler remains the same
`4c7d4eb3…f43cc91` implementation. This binds two uncommitted working-tree
exports, not an exact final committed/CI/live candidate.

| Raw post-refactor receipt | SHA-256 |
| --- | --- |
| `performance-after/after-chromium-desktop.json` | `79bcf1f4ec2f11f36fb1346858c6d33036efbf9640836466a33bc3ddbfdc0447` |
| `performance-after/after-chromium-mobile.json` | `2760a406b3c69868b59ae14aff1e8783dbca8498fa9c2d9df93d49fa4bc2ca25` |
| `performance-after-clean-mode/after-clean-chromium-mobile.json` | `cf8e338dffeb76de10b190bb551cf066188c79bfb26daee6c5fff9b6f4d88abc` |

The first post-mobile Mode/s forward phase overlapped a roughly 3.4-second
artifact hashing operation. Its raw receipt and observed 680 ms maximum remain
preserved, but this interval is excluded from latency claims. The later clean
companion completed from 16:21:20 to 16:22:09 UTC; it is reported separately,
without replacing or hiding the contaminated run. Its forward/reverse maxima
were 688 / 720 ms, against the original baseline's 752 / 752 ms. These individual
observations do not establish a causal speedup.

| Generic page | Desktop chapter reads, before → after | Mobile chapter reads, before → after |
| --- | ---: | ---: |
| Mode/s of Making | 294 → 288 | 254 → 288, also 288 in clean companion |
| Entrance Installation Art | 164 → 96 | 144 → 90 |
| Dot-Based 3D Printing | 157 → 102 | 153 → 102 |
| HC3DP Caustics | 163 → 108 | 155 → 108 |
| Special Assemblies | 156 → 114 | 153 → 114 |
| Project Caschlatsch | 200 → 21 | 195 → 21 |
| Total | 1,134 → 729 | 1,054 → 723 |

Wheel phases delivered the same twelve wheel inputs per generic page. Chapter
rectangle reads changed from 240 to 52 on desktop and 148 to zero on mobile.
Cached selection therefore removes actual repeated geometry work; it does not
eliminate legitimate late media/caption/layout invalidations. Mode/s's mobile
journey reads increased, which is explicitly retained above. Chrome's total
layout time and scene/field frame counts varied between runs; a lower rectangle
count is not a sustained-FPS or overall responsiveness claim.

All 108 requested chapter intents matched in each post-refactor eight-route
profile. The five generic models' 64 same-chapter comparisons per size retained
identical source revisions, source geometry counts, appearance/light facts,
views and fitted camera poses; the clean Mode/s companion adds sixteen matching
model comparisons. These inspector facts do not replace pixel comparisons or
human visual review. Sampled native chapter positions showed at most one playing
video. Every generic paused interval, including clean Mode/s, added zero
controller/field frames, layout/style work, DOM mutations, native media
operations and media-time change. Bending/XR's absent global pause control still
limits that particular idle measurement; no paused result is fabricated.

Latency remained mixed. Desktop Mode/s's forward tail increased from 648 to
848 ms, Special Assemblies from 184 to 208 ms, and Bending's reverse tail from
592 to 720 ms. The Mode/s 848 ms key event spent 0.8 ms in handlers and about
846.9 ms awaiting presentation, near a 763 ms native/unattributed task. Special's
208 ms key event spent 1.6 ms in handlers and 206.3 ms awaiting presentation.
Bending's worst 720 ms keyup contained 396.7 ms input delay and 323.3 ms
presentation delay. These observations do not demonstrate a newly expensive
chapter handler or prove that the changed ownership caused the increases.

Mobile Entrance's reverse tail changed from 1,016 to 1,056 ms, HC3DP's reverse
tail from 5,168 to 5,432 ms, and protected XR's forward/reverse tails from
96 / 120 to 184 / 144 ms. Other routes improved or remained similar. HC3DP's
handler p95 remained approximately 1.8 ms; the known software/native cost persists.
The measured results do not support a blanket performance improvement, field
INP, hardware-accelerated or physical-device claim. Protected Bending/XR were
included as references, and their mixed timings are not attributed to the
generic chapter presenter that does not select their chapters.

Independent CPU-only paired receipts are
`performance-after/independent-paired-desktop-review.json` (SHA-256
`d8787214c2b176c7526e1b22ff2d195a100f5fbc53845bfae8e757f8e0908e24`)
and `performance-after/independent-paired-mobile-review.json` (SHA-256
`7a701037f8f5ea4d7d72f95544be62fdc95587ae96accee0bc05aabb1e09add7`).

## Native departure and BFCache limits

The lifecycle-v3 eight-route diagnostic completed without scenario errors.
Its only Chromium launch change omits the default BFCache-disabling argument;
this is lifecycle evidence, not a paired performance sample. Raw
`lifecycle-after/after-chromium-desktop-v3.json` SHA-256:
`0924dcce7d8c8e729ab8b6535045abed95dd867dd456a93a0da586ff0f997fbd`.

All eight late departure receipts were trusted `persisted=false`; Back produced
another document token. CDP reported `MainResourceHasCacheControlNoStore`,
`JsNetworkRequestReceivedCacheControlNoStoreResource`,
`BrowsingInstanceNotSwapped` and `BackForwardCacheDisabledForDelegate`, with
Caschlatsch reporting only the latter two. There is no successful persisted
BFCache restoration proof. Further forced/synthetic restoration is not substituted
for the browser's actual decision. Headless background-tab attempts also remained
visible, so genuine native hidden behavior is not established by these samples.

Six generic pages and XR released their background lease from one to zero at
departure, then acquired exactly one lease in the new Back document. Their
ordinary-page driver events/scopes reached zero, the generic backdrop and XR
events/scopes reached zero, video sources were removed and paused, and the
generic backdrop had no pending play, decoded-frame callback or media/poster
deadline. This is actual nonpersisted source-controller disposal evidence.

The late receipt also exposes boundaries that must not be called fully closed:
Bending retains its suspended Director/background lease (`activeBindings=1`),
with `scheduled=false`, `renderSuspended=true` and one renderer frame still
reported pending. That R3F internal frame-budget counter is not, by itself,
proof of a pending native animation callback and must not be forcibly zeroed.
SiteNavigation retains one scope and seven native listeners
on every route, although its pagehide path releases preparation/deadline/reveal
work. Native document destruction can reclaim these resources, so the counters
do not prove a cross-document memory leak; they also do not prove explicit
all-owner disposal. These findings were sent to root and the senior architect
for a bounded, visually neutral lifecycle decision. They remain open in this
receipt rather than being hidden behind the eight successful navigation runs.

The independent native lifecycle analysis is
`lifecycle-after/independent-native-lifecycle-v3-review.json`. No CI, deployment,
live-site, physical-device or successful BFCache acceptance is claimed here.

## Explicit-false closure follow-up

The senior architect subsequently corrected the two observed ownership gaps
using the existing disposal paths only when native `pagehide.persisted` is
explicitly false. The historical receipt above remains preserved. Root rebuilt
a separate frozen `lifetime-export` and reran the unchanged lifecycle-v3 helper
on all eight routes, completing at 16:40:33 UTC without scenario/page errors.
Its release metadata names base `05cece4dbac044323e352b5e7ce5ff4c3fd71bbf`;
the closure follow-up was still uncommitted, so that metadata is not the exact
final complete source identity.

Raw `lifecycle-after-closure/after-closure-chromium-desktop-v3.json` SHA-256:
`1d6e20ea92e9ed5bef5f7600bb822617181ccced5aeb0471f15abf2b040c2ed1`.
The independent `independent-native-closure-followup.json` beside it records
all retained-port checks. No must-fix remains in this observed explicit-false
native departure scope:

- Every route now has zero SiteNavigation scopes/listeners/subscriptions, a
  disposed event owner, background leases one → zero → one, and a fresh document
  token on Back. The ordinary-page drivers are disposed with no scheduled frame,
  zero native event scopes/listeners and released field atlases.
- All six generic chapter/backdrop owners are disposed; model actor references
  are released. No play operation, decoded-frame callback, video source or
  media/poster deadline remains pending. All native videos are paused and have
  no attached source. XR additionally reports one acquisition/one disposal,
  no resource, no pending acquisition and zero event scopes/listeners.
- Bending now reports a disposed, unscheduled Director and disposed Layer 1
  field, zero background lease, no ready source, and released source/material/
  compositor references. Renderer geometry counts are zero. The untouched
  R3F frame-budget counter still reads one; the retained renderer diagnostic
  also reports one texture and an undisposed budget bookkeeping object. Those
  values are not native callback counts or proof of zero renderer/process
  storage. No internal counter was changed to manufacture a clean result.

Native BFCache restoration is still unproven: all observed departures remain
trusted `persisted=false`, and the actual browser cache-miss reasons remain
recorded. This follow-up establishes the explicit-false controller/source/event
closure, not successful retained-document restoration, physical-device behavior,
total GPU-memory release or CI/live acceptance.

## Remaining evidence and ownership decisions

The chapter ownership implementation has native paired measurement evidence;
the original field renderer is deliberately retained after the bounded experiment.
The explicit native-departure owner findings are closed by the bounded follow-up
and eight-route native recheck above. Matched visual acceptance, the exact
committed candidate, full required CI/deployment gate and live acceptance remain
separate root-owned records. A green source test cannot close those rows, and
these controlled lab samples do not establish field INP or CrUX.
