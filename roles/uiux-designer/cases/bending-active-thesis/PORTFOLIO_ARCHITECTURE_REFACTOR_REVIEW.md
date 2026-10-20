# Portfolio architecture and event review

Date: 20 October 2026. Reviewer: the existing Software Architect / Runtime
Engineer role. Status: bounded ownership and permanent-departure refactoring
implemented and validated; exact-source CI, same-artifact deployment and live
HTTP checks passed for `567d1c051f95049ce417ee7e426d067e708ed411`.
Post-deployment native capture and assistant visual inspection also passed within the final verification's stated scope. The
[final refinement verification](PORTFOLIO_REFINEMENT_VERIFICATION.md) owns the
current acceptance status and receipt identities; the checkpoints below retain
their original scope and limits.

[Decision 0019](../../../../docs/decisions/0019-portfolio-refinement-and-runtime.md)
and the [refinement contract](PORTFOLIO_REFINEMENT_INTEGRATION.md) govern this
work. This records the architecture phase after source correction, compact media
and six-case design integration. Initial implementation and measurement
checkpoints below remain historical evidence; the final acceptance section
distinguishes their scope from the released artifact. Bending-Active and XR
remain protected comparison references.

## Review coverage and actual ownership

The reviewer read the root README, empty-framework decision, current refinement
decision/contract, architecture source-authority/runtime sections, website
design guidance, all twelve existing role README responsibilities, the current
Director team review, and the Software Architect's existing runtime/event
research. Reading another role's instructions does not represent independent
participation by that role. Performance Engineer owns the separate measurement
method; root alone operates the browser/GPU, builds and publication.

The source audit follows actual events through `GlobalBackground`,
`SiteNavigation`, `SiteReadiness`, preview/stage registration,
`SiteBackgroundDriver`, `HomeScrollPresenter`, information/glass publication,
the project backdrop transaction, project scene/preview lifecycle and native
media transport. The separate Bending `RuntimeRoot`, Registrar, feature
services, `ExperienceDirector`, EventManager, DisposableScope, DOMPresenter and
demand scheduler establish the existing infrastructure boundary.

| Concern | Current owner and invariant | Audit result |
| --- | --- | --- |
| Public document and navigation | Native HTML/anchors; SiteNavigation owns only bounded loader/readiness and document handoff. | Retain native navigation and the existing readiness/reveal completion facts. No SPA migration. |
| Shared atmosphere | BackgroundRuntime grants one exclusive document lease. Bending supplies its existing Director frame; Home and ordinary pages use SiteBackgroundDriver. XR's project StageDirector retains its separate property domain alongside the ordinary-page atmosphere driver. | Retain the lease, existing owner-specific clocks and exact field/ASCII algorithms. Native videos retain their own transport time. No single global RAF is claimed. |
| Bending discrete interaction | Closed RuntimeRoot feature catalog, CommandRouter/state transaction and scoped native events. | Existing selected-case architecture remains; do not replace it with a second global bus. |
| Six-case semantic chapter | ProjectStudyChapterPresenter measures section anchors during the existing driver's layout invalidation, then publishes midpoint intent, navigation and counter before the backdrop on that same demand frame. | Replaces the controls' independent scroll/IO geometry scans and the chapter-attribute observer. Fractional anchors preserve the original exact midpoint boundary. |
| Six-case visual source | ProjectStudyBackdropPresenter owns source request, exit, preparation, entry, hold, supersession and failure. | Retain this transaction and its finite shared-clock motion. Native reading does not wait for source readiness. |
| Five source models | StageRegistry registers a host; ScenePresenter/PreviewLifecycle own preparation and retained lifetime; Three adapter owns final source rendering and camera. | Retain complete-source first draw, cancellation generations, off-chapter retention and true-exit disposal. No geometry/material/light/camera changes. |
| Native video time | Backdrop's native media elements own currentTime, play/pause/end/replay and real transport/first-frame facts. | Retain independent media times, one playing owner, no scroll seeking and no synthetic readiness. |
| Reading/glass effects | InformationWindowPresenter and LiquidGlassPresenter borrow the driver's demand frame; DOMPresenter suppresses unchanged writes. | Retain current transforms/opacity and accepted visual values. Invalidation needs measurement, not an unmeasured wholesale rewrite. |
| Hidden/BFCache/exit | Scheduler composes visibility/page/freeze suspension. Explicit `pagehide.persisted === false` permanently disposes through existing scopes/Registrar/kernel; persisted pages retain the established resume path. | Native follow-up observed closed application registrations/resources and released leases on all eight nonpersisted departures. It did not observe genuine persisted BFCache restoration; see the [final verification](PORTFOLIO_REFINEMENT_VERIFICATION.md). |
| Fallbacks | Server-rendered text/posters, reduced motion, Save Data, source failure terminals and no-JS flow. | Essential content remains native and readable. Semantic chapter selection must still work when decorative motion is disabled. |

## Primary references and their admission here

Sources were checked online on 20 October 2026. The implementation decisions
below are project-specific applications of the sources, not rules that those
projects impose on this repository. No dependency is added simply because a
reference repository exists.

| Primary source | Applicable principle | Concrete admission or retained boundary |
| --- | --- | --- |
| [MDN addEventListener source](https://github.com/mdn/content/blob/main/files/en-us/web/api/eventtarget/addeventlistener/index.md) | Listener identity, capture, passive options and AbortSignal have explicit registration/removal semantics. | Reuse tested EventManager/DisposableScope for new chapter/control listeners. Wheel/touch observation remains passive; the existing committed model drag alone may prevent default. Replacing tested scopes with AbortController everywhere would not improve the boundary. |
| [React useEffect source](https://github.com/reactjs/react.dev/blob/main/src/content/reference/react/useEffect.md) | Setup and cleanup mirror the external system and tolerate development reconnection. | Remove the controls' separate geometry-observing effect. The driver remains connected/disposed by its existing React host. No module-import listeners or frame-state React updates. |
| [React unnecessary effects guidance](https://github.com/reactjs/react.dev/blob/main/src/content/learn/you-might-not-need-an-effect.md) | Derived state should have an owner instead of repeated synchronization effects. | Chapter counter, active rail and backdrop intent derive from one semantic selection. Avoid synchronizing duplicate chapter state in React and DOM. |
| [GoogleChromeLabs Page Lifecycle implementation](https://github.com/GoogleChromeLabs/page-lifecycle/blob/master/src/Lifecycle.mjs) | Frozen, hidden, resumed and terminated transitions differ, including BFCache restoration. | Keep composed suspension reasons and retained resources. A resumed page remeasures native layout before publishing; permanent departure closes new listeners and observation. No added lifecycle package. |
| [Chrome Page Lifecycle guidance source](https://github.com/GoogleChrome/developer.chrome.com/blob/main/site/en/articles/page-lifecycle-api/index.md) | Browser page lifecycle events have distinct targets and persisted restoration semantics. | Preserve existing window pagehide/pageshow and document visibility/freeze/resume ownership. Browser tests must report whether actual persisted BFCache occurred. |
| [Chrome main-thread guidance source](https://github.com/GoogleChrome/developer.chrome.com/blob/main/site/en/docs/lighthouse/performance/mainthread-work-breakdown/index.md) | Reduce main-thread/style/layout work and diagnose measured causes. | Cache chapter layout offsets during existing invalidation, then select without chapter rectangle reads during native scroll. Compare native profile counters and CDP layout/style/task work before and after. |
| [Chrome animation guidance source](https://github.com/GoogleChrome/web.dev/blob/main/src/site/content/en/blog/animations-and-performance/index.md) | Geometry-changing animation can trigger layout; transform/opacity and bounded layers deserve measured use. | Preserve the accepted transform/opacity presentation and avoid adding per-frame layout/height animation. No blanket `will-change` proliferation. |
| [GoogleChrome web-vitals README](https://github.com/GoogleChrome/web-vitals/blob/main/README.md) | Metrics have page lifecycle and observer lifetimes; repeated instrumentation adds overhead. | Keep diagnostics in the ignored native measurement helper, installed once per document. Event Timing/long-frame lab observations are not field INP or physical-device proof. No analytics dependency is required. |
| [Next.js static export documentation source](https://github.com/vercel/next.js/blob/canary/docs/01-app/02-guides/static-exports.mdx) | Build-time routes export HTML/assets; browser APIs belong to client execution, while server-only features are unavailable. | Preserve the independent allowlisted public export, native readable HTML and client-only external-system setup. Private preparation documents/drives never become build/runtime dependencies. |
| [arc42 architecture template](https://github.com/arc42/arc42-template) | Architecture documentation distinguishes context, building blocks, runtime/deployment and decisions/quality concerns. | Use a compact architecture-led root README after implementation: actual boundaries, data/event flows, commands, release identity and honest limits. Link detailed historical decisions instead of repeating a chronological release log. |

## Bounded refactoring plan

1. Add one project chapter presenter owned by SiteBackgroundDriver. It measures
   natural chapter layout offsets on the driver's existing invalidation and
   selects the last chapter at or above the viewport midpoint using cached
   offsets. Sections themselves have native untransformed layout; only child
   reading surfaces receive material feedback. Preserve the original midpoint,
   before-first/after-last behavior, reverse reading and native hash navigation.
2. Publish one semantic chapter result to the root intent, chapter rail and
   counter before the backdrop/scene presentation in the same demand frame.
   Native scroll requests at most the already-owned frame. No IO callback and
   no chapter attribute MutationObserver need to select or reschedule it again.
3. Make ProjectCaseStudyControls a narrow markup/control surface. Keep its
   no-JS hidden state, actual pause operation, truthful button text/ARIA and
   total. Resolve its connection order from existing SSR nodes; do not create a
   second readiness clock. A scoped pause owner must remain synchronously
   usable, including after BFCache restoration.
4. Reuse existing load, font, root/reading-surface ResizeObserver and child-list
   invalidation to refresh offsets. Refresh retained pages on real pageshow and
   orientation/width changes; distinguish harmless coarse-pointer browser-bar
   changes from actual drawing-surface allocation. The semantic reading
   midpoint still follows the available viewport height.
5. Do not advance hidden/frozen chapter presentation. On restoration invalidate
   measurements before the next frame; on real exit release controller nodes,
   listeners, observer callbacks and delayed font completions through the
   existing lifetime. Add focused CPU tests for selection/measurement closure,
   restoration, policy-independent reading and one pending frame.
6. Performance Engineer has identified repeated inactive-video pause calls and
   repeated diagnostic snapshot cloning as secondary candidates. These remain
   audit hypotheses until the native profile establishes value. Do not change
   native media transport generations, first-frame acknowledgments or model
   inspection gating merely to reduce a counter.

Allocated implementation paths are the new chapter presenter, existing
ProjectCaseStudyControls, SiteBackgroundDriver and directly relevant tests.
Root owns public-build allowlists/contracts and final integration. The Motion
Designer owns ScenePresenter/interaction refinement; this phase does not edit
that file without a new explicit allocation.

## Implemented ownership and focused evidence

Root preserved the built six-case design export, completed an initial native
desktop/mobile checkpoint, gathered the before measurements and explicitly
admitted the bounded architecture implementation. The resulting changes are:

- `runtime/site/ProjectStudyChapterPresenter.mjs` owns cached fractional native
  section anchors and one semantic chapter result. Layout invalidation reads
  section geometry before information/style publication; subsequent scroll,
  anchor and keyboard frames select without further chapter geometry reads.
  Its midpoint uses the current available viewport height even when a coarse
  browser-bar change leaves the drawing-surface allocation stable.
- `components/ProjectCaseStudyControls.jsx` supplies the same hidden no-JS
  markup, counter and pause control. Its separate React chapter effect, IO,
  scroll listeners and duplicate pause state are removed. The existing driver
  scope binds the real native pause button; label/ARIA and root intent update
  synchronously. A pause-only attribute observer admits externally restored
  policy while ignoring the receipt of the same already-processed click.
- `runtime/background/SiteBackgroundDriver.mjs` publishes that chapter result
  before backdrop/scene work on its existing demand scheduler. Generic native
  reading still updates while motion is paused, reduced or data-constrained.
  Retained generic pages invalidate layout before resuming. A true departure
  releases the chapter/control lifetime with the existing resources and lease.
  Bending/XR directors, source transactions, scene/camera/light/material recipes,
  field rendering and motion-pacing algorithms are unchanged.
- New `tests/project-study-chapters.test.mjs` covers exact fractional boundaries,
  reverse reading, unified counter/rail intent, no geometry scans across repeated
  selection, changed viewport/layout, synchronous and externally restored pause,
  and idempotent closed publication. Existing global-background tests add actual
  driver one-frame/policy/BFCache/late-source/departure coverage; the current
  scene-driver fixture includes the real chapter/control connection.

With exact Node **24.19.0**, the three directly affected test files pass
**31/31**, with no skips or retries. Explicit ESLint `--no-ignore` over the six
changed runtime/control/test files exits successfully without warnings. The
initial ordinary root-lint invocation reported that role files were ignored;
that invocation does not establish lint acceptance. These focused checks do not
replace root's complete `pnpm check` or built native-browser tests.

Performance Engineer independently reviewed the resulting source and found no
must-fix in chapter/control ownership, pause deduplication or lifecycle cleanup.
The counter/rail live outside the reading root, so their text publication does
not feed the reading-root subtree observer into another chapter measurement.
Source/status text inside the reading root can affect its native height; the
existing layout invalidation remains necessary. This source review does not
replace root's native interaction and before/after performance evidence.

## Architecture README

After the integrated architecture build/root checks and native model-control
smoke checkpoint, root admitted the required README phase. The rewritten root
README now starts with the two actual applications, source/public-asset
boundaries, runtime building blocks, native event/source/media flow, exact
commands/toolchain and same-artifact CI/deployment. It links current acceptance
and historical decisions instead of duplicating a chronological approval log.
The compact structure applies the arc42 reference without claiming to implement
its full template or adding a dependency. Existing planning documents remain
unchanged.

Commands were checked against `package.json`, build/preview scripts and actual
workflow steps. All **22 distinct local link targets** exist; eight documented
package scripts resolve. The README distinguishes per-owner clocks, the single
background lease and native video time rather than claiming one global RAF for
XR's already-separate project stage/background. It separates implemented architecture from evidence acceptance, identifies
the aggregate gate's limit and keeps real-device/software-rendering uncertainty
visible. The [final verification](PORTFOLIO_REFINEMENT_VERIFICATION.md)
distinguishes source checks, exact-CI execution coverage, deployment provenance,
HTTP identity and native acceptance.

## Native departure follow-up

Root's later native lifecycle capture reports genuine nonpersisted departure
on all eight routes. It exposes a concrete contract gap: SiteNavigation closed
its request resources but retained local event registrations, and Bending's
Director suspended its existing lease while relying on React unmount for final
release. Browser destruction may reclaim the document; these observations do
not establish a memory leak or a physical-device failure. They do establish
that the promised explicit permanent application closure was incomplete.

The admitted visual-neutral correction changes only native destruction:

- SiteNavigation first completes its existing handoff decision, then disposes
  local registrations/resources when `persisted === false`. A tracked outgoing
  ticket remains serialized and destination-owned: `handedOff` suppresses a
  second cancellation. The receiving document still adopts the same request.
- ExperienceProvider registers the minimal DocumentLifetime helper through
  the existing Registrar. Explicit nonpersisted pagehide calls `input.dispose`;
  connections release Director/background, scene assets/input and other scoped
  features before the kernel closes. Effect unmount remains idempotent and
  reconnectable while the document is alive.
- Persisted pagehide retains the existing suspension/restoration path. Bare
  synthetic events without a `persisted` value retain their established test
  semantics. No scene, camera, material, source recipe, clock or timing code is
  changed. No R3F private frame counter is rewritten: `rendererPendingFrames`
  records the library's internal frame allowance and alone cannot prove a live
  native callback after document destruction.

The document-lifetime, navigation and existing Registrar suites pass **67/67**
under Node 24.19.0, with no skips/retries; explicit lint of all five changed
runtime/component/test files passes. New checks establish permanent feature/
kernel/lease closure, pending-acquisition abort and late-handle disposal,
tracked-ticket preservation with successful destination adoption, no late
readiness revival, persisted/bare retention and idempotent unmount. Two older
BFCache fixture departures now explicitly set `persisted: true` before testing
restoration; a nonpersisted destroyed document cannot serve that scenario.
These focused tests are portable/source-level evidence. The later frozen
lifetime-export's native follow-up observed all eight SiteNavigation owners
disposed with zero listeners, every departing background lease released, and
one lease after new-document history re-entry. Bending's Director was disposed
with no scheduled work. That local export carried base metadata rather than
the complete follow-up commit; it must not be relabelled exact-source or live
evidence. The [final verification](PORTFOLIO_REFINEMENT_VERIFICATION.md)
separately records the released `567d1c0` artifact and current native-live
status. Every observed departure was nonpersisted; actual BFCache restoration
remains unverified.

## Measured performance interpretation

The before profile records the frozen design export, Windows/Chromium desktop,
1440 × 1000 at DPR 2 and the actual instrumentation scope. Across the six
generic forward/reverse journeys it records **1,134 chapter rectangle reads**.
Their measured aggregate call time is small; the ownership consolidation must
not be described as resolving the observed multi-second HC3DP interaction stall.
All six measured paused intervals already settle to zero additional controller
frames/layout/style/media work under the scenario, so a new pause-idle fix is
not claimed.

The independent CPU attribution records **ANGLE SwiftShader software rendering**,
software Canvas 2D/compositing/rasterization/video on this host. Native
`drawImage` in the shared 2D field accounts for approximately 69% of the sampled
Caschlatsch post-navigation interval, with the full field path approximately
76%. HC3DP's long model navigation also contains substantial native time outside
JavaScript. Repeated inactive media pause calls are confirmed but their measured
cost is comparatively small. These are scenario-specific laboratory facts;
they neither prove physical-device performance nor justify attributing the
stall to chapter listeners. The bounded refactor changes no field pixels,
density, cadence, source geometry or camera recipe. The later paired results, their source/checkpoint binding and contaminated
Mode/s companion distinction are retained in the
[final verification](PORTFOLIO_REFINEMENT_VERIFICATION.md) and
[performance review](PORTFOLIO_PERFORMANCE_REFINEMENT_REVIEW.md). Desktop/mobile
generic journey rectangle reads changed from 1,134/1,054 to 729/723; Mode/s
mobile increased from 254 to 288. Paused intervals remained idle, while native
operation latency was mixed. These results support the ownership cleanup;
they do not establish a general speedup, accelerated-hardware performance or
resolution of the native stalls. The active rendering algorithm was unchanged
by the subsequent permanent-departure fix.

## Current acceptance and evidence limits

The [final refinement verification](PORTFOLIO_REFINEMENT_VERIFICATION.md)
is the current acceptance record, including original failures, source/media
review, native checkpoints, matched performance and protected Bending/XR
comparisons. The initial plans and focused checks above do not replace those
integrated results.

The released source is `567d1c051f95049ce417ee7e426d067e708ed411`.
[CI 39459999497](https://github.com/JosHsuan/JosHsuan.github.io/actions/runs/39459999497)
passed its complete required jobs and independent exact execution audit:
411 browser executions, comprising 387 public-profile executions plus 12
framework-root and 12 framework-subpath executions. The aggregate gate alone
is not the execution-union proof.
[Deployment 39465817087](https://github.com/JosHsuan/JosHsuan.github.io/actions/runs/39465817087)
promoted the tested export and validation artifact without rebuilding. The
export's 259-file canonical output digest is
`857dd9262f3be5a8055e3433a63b1c04488a5e87e4c2e2f296fca8505e889179`.

Live HTTP verification matched 205 requested responses exactly against that
artifact and 22 video byte ranges, with no retries. These counts describe the
audited request plan, not HTTP coverage of all 259 output files or native
visual/interaction acceptance. The completed live native capture and scoped assistant image review are recorded separately in the final verification; HTTP equality alone does not establish them.

The accepted architectural change is one driver-owned semantic chapter result
with truthful scoped pause, plus explicit permanent application disposal on
nonpersisted departure. It retains source preparation/first draw, source exit
closure, native navigation/media time, retained off-chapter resources and
existing owner-specific clock domains. It changes no protected scene recipe,
field algorithm, camera, geometry or active motion pacing.

Actual persisted BFCache restoration was not observed. The native closure
follow-up proved the nonpersisted/new-document branch; portable persisted
tests do not establish a real retained browser document. Bending's untouched
R3F frame allowance alone neither proves a pending browser callback nor total
renderer/process memory release. Mixed latency and SwiftShader/software
rendering remain lab limitations, with no claim of physical-device stability,
hardware-accelerated performance, field INP or sustained frame-rate acceptance.
