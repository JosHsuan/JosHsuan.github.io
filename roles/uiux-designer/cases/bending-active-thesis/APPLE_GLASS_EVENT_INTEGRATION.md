# Apple-inspired materials, entry and event lifecycle

Owner request, 15 October 2026: redesign loading with Apple UI guidance, unify information-panel frost, reconcile the complete 2D / 3D / ASCII event lifecycle, then commit, push and publish through the existing CI/CD gate. This authorizes Bending-Active implementation. Preserve the reusable empty framework, source evidence, exact Node 24.19.0 / pnpm 11.19.0, committed dependencies and one final writer per property.

This supersedes the loading visual treatment in [the Full-mode contract](FULL_MODE_INTERACTION_ENTRY.md). Its Full renderer, drag direction, original library reveal and actual entry prerequisites remain in force. The animation catalog remains a separate local review surface.

## Reference translation

Apple distinguishes standard materials in content from Liquid Glass in floating controls/navigation. Our reading panels use a consistent, thicker frost; navigation shares its neutral family with a floating treatment. Original diagrams retain opaque paper. This is a CSS interpretation, not native Apple framework material or a claim of full optical refraction. [Apple HIG: Materials](https://developer.apple.com/design/human-interface-guidelines/materials), [Meet Liquid Glass](https://developer.apple.com/videos/play/wwdc2025/219/).

The compact central loading panel uses the existing project title/poster and an activity indicator. Waiting duration is unknown, so it shows no download percentage or artificial minimum duration. The existing service still waits for actual prerequisites or an explicit readable fallback. [Apple HIG: Loading](https://developer.apple.com/design/human-interface-guidelines/loading), [Progress indicators](https://developer.apple.com/design/human-interface-guidelines/progress-indicators).

References were read on 15 October 2026, including Apple's linked Markdown. No reference-site assets, fonts or code are copied.

## Cross-role decisions

The collaborating agents considered all twelve project roles; this is not twelve independent human approvals.

| Role | Decision |
| --- | --- |
| Experience Director | One preparation surface; close finite operations after presentation or explicit cancellation. |
| Software Architect | Retain typed scoped events, validated transactions and the separate frame store. |
| Performance Engineer | One backdrop owner per surface; keep existing render budgets and one GPU worker per CI runner. |
| UI/UX Designer | Moderate typography, stable status, clear hierarchy and consistent focus/contrast. |
| Motion Designer | Existing active time controls the indicator and restrained dismissal; no CSS animation clock. |
| Animation Cinematographer | Approved static poster supplies context; replace giant titles and the split curtain. |
| Information Designer | Opaque text, source-paper diagrams and one material family for all seven information-window types. |
| 3D Artist | Frost belongs to DOM backs; retain scene shaders, compositor and source-derived ASCII. |
| Geometry Engineer | Preserve immutable geometry, IDs and original curve direction. |
| Scene Designer | Retain composition/negative space; avoid full-page blur and stacked glass. |
| Lighting Designer | Consistent neutral tint, restrained hairline highlight and depth. |
| 3D Animation Designer | Preserve inspection ownership and active-time comparison semantics through interruption. |

## Material and clock ownership

`app/globals.css` defines shared `--glass-*` tokens. Editorial, model-label, source-diagram, evidence-image, evidence-caption, source-details and source-portal windows use regular frost. Navigation/reading controls share the floating treatment. Nested controls use a fill without another backdrop filter.

Before JavaScript the surface paints its material. After registration, the React-owned decorative skin is the sole backdrop/material owner; text and controls stay outside its deforming clip. The skin reads live tokens rather than the presenter's cached computed background. Fixed overscan extends paint during elasticity without copying content. Original SVG paper and evidence remain documentary content. No new WebGL pass or asset is introduced.

Unsupported filtering has an opaque fallback. Reduced Transparency, increased contrast and forced colors replace translucency as appropriate; Reduced Motion suppresses movement. Accessibility changes update material immediately.

One Director owns RAF and frame dt. Typed state owns discrete preferences, selection and inspection; FrameStore carries continuous samples. Native scroll owns document position. Font/network completion are external readiness signals. SceneRuntime remains the final camera/scene writer.

Sharing a caller does not make all time values interchangeable: chapter `activeSeconds` may accelerate with wheel energy and freezes during inspection; entry/library use the Director's unboosted active dt. ASCII animation samples field time derived from chapter time, while its 30 fps work bound uses the same RAF's monotonic wall timestamp. Hidden/resume intervals do not advance these animations. No layer adds a second scheduler to reconcile these different purposes.

## Lifecycle matrix

| Surface / operation | Trigger | Interruption | Completion / cleanup |
| --- | --- | --- | --- |
| Entry | Scoped service receives document, typography and actual scene paint or explicit static readiness. | Hidden time excluded; deadline selects fallback. Disconnect restores DOM before cancellation. | Director advances reveal; DOM/inert restoration precedes entered. Connection identity separates replacement histories. No-JS bypasses loader. |
| Startup fragment / navigation | ReadingManager anchors during preparation; later hash/native input selects a new navigation. | Entered consumes startup positioning; stale queued hash cannot replay an older destination. | Remeasure preserves subsequent reading position; explicit history restoration retains its own ownership. |
| Information windows | Native geometry continuously retargets shared material feedback. | Reversal retains momentum; focus/Reduced restore readable rest; hidden time excluded. | Feedback settles without an invented per-frame request. Remove/dispose releases attributes and variables. |
| Library curves | Reading-area entry after project entry requests an identified 60–160 mm sequence. | Early departure cancels/restores; reentry requests again. Hidden freezes; Reduced completes. | Original paths publish before terminal facts. Completed drawings stay complete. Remove/dispose closes pending requests; replacement identities do not collide. |
| Miura / workflow | DiagramManager owns local hover/focus/pin; workflow comparison submits the existing typed source transaction. | Pointer leave/blur releases transient selection; replacement uses current intent. | Follow chapter / Escape release the workflow's shared comparison as well as local pinning, without clearing another chapter's newer request or an independent held source. |
| Evidence disclosure | An unmodified source-link activation opens an inline original-image portal. | Selecting another source replaces it; modified native links retain browser behavior. | Close/Escape restores the opener; disconnect clears selected/expanded state without stealing focus. This is an inline section, not a modal focus trap. |
| Canvas placement | Chapter navigation requests identified hold/away transitions. | Replacement cancels the old operation; unavailability/teardown release ownership. | DOM placement plus same-chapter/frame scene acknowledgment precede completion. Clear open ownership before terminal observers run. |
| Model gesture | Actual source hit or keyboard takes ownership of the painted source; a pending explicit keyboard comparison preserves its requested first paint. | Cancel/lost capture, blur, hidden/page lifecycle, chapter/selection changes and unavailable scene release it. | Existing transaction clears engaged/held state; the camera writer performs recovery. Requests do not rename unpainted sources. |
| Comparison | Validated selection records chapter/index/active-time origin. | Existing inspection/lifecycle holds freeze active time; replacement has one current state. | At eight active seconds, one transaction clears selection and emits state/representation facts. Independent held source is preserved. |
| Page ASCII | Director samples the independent 2D field; renderer owns Canvas/atlas. | Hidden/paused freeze; Reduced/zero weight clear. | Continuous idle/disabled state replaces artificial requests. Context failure stays contained; dispose removes listeners and releases stores. |
| Scene ASCII | Compositor samples source radiance/depth from the same scene frame. | Complete scene visibility/context policy applies. | Compositor owns/releases its resources; other layers never write those pixels. |
| Recovery lease | Explicit activation begins; Director supplies heartbeat. | Failure survives late pageshow/pagehide/heartbeat. | Normal BFCache resume may reactivate an ended lease; explicit new activation is required to reopen failure. |
| Runtime registration | Registrar connects explicit feature factories. | Stop/dispose invalidates setup in progress; cleanup cannot register a replacement during stopping. | A late setup return immediately releases its resources. Cleanup faults do not prevent releasing other connections; a normal stopped runtime may reconnect. |

Entry, Canvas and library have finite histories. Information response and ASCII are continuous samples with explicit idle/disabled/disposed outcomes. Typed/native runtime subscriptions use disposable scopes; renderer-owned context listeners have explicit disposal. Observer faults are isolated. A terminal observer must not leave an old open operation that emits a second terminal fact during synchronous cleanup.

## Corrections and verification

Review identified startup-fragment reanchoring after entry, stale hash delivery, failure reopened by pageshow, expired comparison state retained beyond its sampler lifetime, synchronous terminal-observer reentrancy, registration revived during stop, an expanded evidence disclosure retained after disconnect, and a workflow Follow action that released only local pinning. Native fragment navigation also dispatches `popstate`: an unrecognized entry must select its fragment rather than restore an invented zero position. Known history entries retain their actual saved reading position, including same-fragment traversal. Focused tests exercise actual transactions, state, DOM publication and event ordering. The final checkpoint will record portable tests, built-artifact/browser results, visual acceptance and output identity before publication.

Browser verification also exposed a separate post-navigation shift: the height-capped connection photograph used two automatic dimensions and collapsed before lazy decoding. Chromium then moved the document to preserve its chosen scroll anchor. The image now reserves its final capped size using the approved source aspect ratio, retaining the loaded composition and mobile sizing. The regression delays that real image until after native fragment navigation and verifies both geometry and reading position before and after decoding. No additional loading prerequisite or persistent scroll lock is introduced.

The no-JavaScript contrast fixture inserts its temporary style synchronously instead of awaiting an unavailable inline `style.onload` handler. It retains the same screenshot, PNG decoding, per-pixel contrast calculation and acceptance thresholds.

Public-network verification showed that preceding Miura/workflow control rows could hydrate during the delayed-library fixture. That unrelated insertion changes the absolute document coordinate through native scroll anchoring. The fixture now waits for those two diagrams before recording its baseline, while still withholding the library until after entry and reading-area positioning. All original static/readiness, library completion, absolute-position and visible-reading assertions remain.

Full-case CI retains four Chromium file shards and uses two each for WebKit/mobile. The preceding successful release's mobile suite took 26.1 minutes against a 30-minute job limit. Partitioning retains every scenario, one worker per runner, exact output digest checks and the unchanged deadline/gate. Scoped checks remain unsharded. [CI/CD procedure](../../../../docs/CI_CD.md).

Publish the successful same-commit default-branch push artifact and validated record without rebuilding. CI/deployment links belong in the delivery report. Physical iOS/Android and real-time GPU performance measurements remain separate from emulated functional validation.

Desktop and mobile loading captures were inspected for hierarchy, clipping and poster balance. Material checks cover all seven information-window kinds, nested surfaces, navigation, opaque original diagrams and real screenshot-based no-JavaScript text contrast. Native increased contrast and forced colors are exercised in Chromium, WebKit and mobile Chromium. Reduced Transparency is emulated through Chromium's native protocol on desktop/mobile; the WebKit run does not claim that emulation. Physical-device blur cost and sustained frame rate remain unmeasured.

## Local validation checkpoint — 15 October 2026

The final source passed `pnpm check`, case TypeScript and 284 portable cases (282 passed, two existing conditional skips, no failures). Public Build C passed the 80-file / 36-approved-asset audit. All 18 entry/material scenarios passed against that built output in Chromium, WebKit and mobile Chromium, including the delayed-photo native-navigation regression. The local pre-commit `index.html` SHA-256 is `2675cc2d2b7b1ec8309e57f4c7662ae35c28f92e129963294ccd818f25fa407d`; this identifies local validation, not CI release provenance.

Full CI selects 49 public cases per browser (147 total), plus the empty framework's root/subpath checks. Exact shard listing proves no omitted or duplicated public cases. The required gate, successful push identity and complete tested-output digest must pass before deployment; the delivery report records those final results and the deployed commit.

The complete implementation at `7df1992` passed [CI 38719669734](https://github.com/JosHsuan/JosHsuan.github.io/actions/runs/38719669734): all 147 public scenarios, 24 framework browser scenarios and the required gate. Its deployment passed exact public HTML/release-record comparison. The subsequent fixture-only correction above leaves application code unchanged and is checked through the existing impact-selected entry/public-release coverage.
