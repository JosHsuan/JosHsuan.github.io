# Shared Bending background integration

Status: owner-authorized implementation, 16 October 2026. The protected
pre-change Bending baseline, matched browser comparisons and publication evidence
are recorded by the integrator. The portable results below do not claim browser
visual acceptance, physical-device performance or deployment completion.

The current owner request promotes the existing Bending background implementation
to the selected public application's common background. It expressly protects
the original case's content, source model, materials, camera, interaction and
final presentation. This extends the selected publication boundary; it does not
populate the reusable empty `src` framework or introduce private-drive build
dependencies.

## Three layers

| Layer | Responsibility | Boundary |
| --- | --- | --- |
| 1 — Global Background | Original steel-blue / warm-copper CSS light field, viewport vignette and independent bounded Canvas 2D ASCII field | One document-scoped service and exclusive active binding; shared score, glyph renderer and surface classes |
| 2 — Page Content | Native semantic headings, narrative, documentary media, reading surfaces, navigation and project cards | Generic content sits above the transparent background; Bending's original reading frame and story remain unchanged |
| 3 — Project-specific 3D / Interaction | Project source models, materials, camera, controls, scene resources and project explanation | Bending retains its existing Director, scene runtime, HDR, exhibition set, source-depth ASCII and compositor; XR owns its separate project resources |

The Bending exhibition cyclorama, practical lamps, model illumination and
source-derived scene ASCII remain in Layer 3. They are not copied to every page
or merged into an unrelated project's model. Bending's static source poster is
a case-owned fallback passed through the shared backdrop's child slot.

## Files and ownership

- `components/GlobalBackground.jsx` provides one DOM-free context in the selected
  public root layout. It also supplies the shared backdrop and field components.
- `runtime/background/BackgroundRuntime.mjs` permits one acquired owner,
  `site` or `bending-director`. It owns the field renderer and five backdrop
  custom properties, with no clock, native listeners, camera or WebGL context.
- `runtime/background/SiteBackgroundDriver.mjs` supplies ordinary pages with
  the actual existing chapter playback, chapter scene score and field renderer.
  It owns one ordinary-page scheduler and scoped native lifecycle/input events.
- `CinematicExperience.jsx` uses the shared surfaces in the original locations.
  The Bending Director acquires the same background service and supplies its
  original score, timestamp, stable dimensions and pause/preference facts.

`cinematic.module.css` is reused unchanged. Its SHA-256 at extraction is
`78c69f5e987df211e100b4f03cd5d7d5751f0c69ef1ad7589d4cc80271bc4222`.
The Bending sibling order remains backdrop, project stage, ASCII field,
controls/inspector and progress. The stage and field both have z-index 1, making
this order an explicit pixel-preservation condition. The shared provider adds
no DOM wrapper, isolation boundary or stacking context around the case.

The existing Director's DOM publisher still performs the exact five quantized
backdrop property writes in their original order. The same original field
renderer receives the same `field`, `frameTimeMs`, `paused`, `hidden` and
`systemReduced` inputs. `window.__story.inspect().pageField` retains the original
field-renderer report. No case clock, model writer or readiness condition moves.

The former independent static portfolio CSS/pre field is removed. Its ordinary
page container is transparent at z-index 2 above the shared field. These content
stacking changes are confined to generic portfolio pages; Bending's reading-frame
CSS, global material tokens and project-specific styles are unchanged.

## Motion, lifecycle and resource contract

Ordinary pages use the existing overview chapter as the common background score.
This is the original analytical animated field, not a static imitation. Bending
continues to use its actual seven chapter weights and same active chapter clock.
The CSS light field is chapter-weighted; its palette is not artificially
oscillated by a new independent timer.

The ordinary driver uses the same native wheel/touch impulse envelope and raw
pointer UV equations as the case. Fine pointers activate the bounded field
influence with the original background strength of 0.35. Pointer leave and blur
reset the influence. Coarse pointers and Reduced Motion suppress it. Native
input listeners are passive where appropriate and never prevent scrolling,
claim model selection, or perform scene hit testing.

The existing field budgets remain 900,000 physical pixels, 12,000 cells and at
most 30 real-time draw deliveries per second. The original analytic glyph atlas,
copper ink and gain remain unchanged. Coarse-pointer browser-chrome height
changes retain backing allocation; width/orientation changes update the same
acquired resource. These are allocation policies, not measured device-memory or
frame-rate claims.

Visibility, pagehide/pageshow and freeze/resume compose suspension reasons.
Hidden intervals are not replayed into active time. A native non-persisted
`pagehide` releases the ordinary driver's backing storage, listeners, observation
and lease immediately; a persisted BFCache departure retains a suspended resource.
Live Reduced Motion publishes one clearing frame for the optional field and
returns the driver to idle; disabling it resumes from the retained active time.
Ordinary pointer, wheel, touch and reset-driven scheduling is gated by readable
entry, active lifecycle and motion preference. Thus native input and fine-pointer
capability changes cannot deliver ineffective frames while entry is pending,
Reduced Motion is active or the document is suspended. Reset still clears held
pointer/input facts. An unchanged resize, including a coarse-pointer browser-chrome
height change, does not request a frame. A real measured dimension change may
publish one static update under Reduced Motion without advancing active time or
field draws. These guards belong to the ordinary driver; Bending retains its
original Director. An unavailable or failed optional Canvas 2D context
leaves the static CSS atmosphere and readable native content without an ongoing
background frame request. Disposal cancels scheduled frames, disconnects
observation, removes scoped listeners, releases the field and atlas, and
relinquishes the exclusive lease. Stale disposed bindings cannot publish.

Background enhancement is not a new readiness prerequisite. SiteNavigation and
the delegated Bending EntryManager retain their existing loading request and
terminal ownership. The generic background waits for readable site entry before
advancing its optional animation. Background failure cannot keep navigation or
content behind a loading gate.

Native full-document links replace the current document and its background
lifetime. The implementation therefore initializes once per active document; it
does not claim that a Canvas persists across document replacement. A document
retained by BFCache keeps its suspended background and resumes without hidden
time catch-up. The site was not migrated to client-only navigation to create
cosmetic background continuity.

`window.__globalBackground.inspect()` exposes the active lease owner, acquisition
and release counts, bounded 32-fact lease history, original page-field report and
the ordinary driver's scheduler, playback and scoped-listener diagnostics.
On Bending, `delegated` is true and the ordinary driver is absent. This port is
read-only diagnostics, not an alternate motion or navigation API.

## Four existing role responsibilities

The architecture specialist represents four existing repository roles, with an
additional interaction-protocol review perspective. The other existing role
assignments and combined visual acceptance are recorded by the integrator;
this is not a claim of twelve independent human reviews.

| Role | Decision |
| --- | --- |
| Software Architect | One shared implementation, exclusive resource binding and explicit three-layer boundaries; retain the empty framework, existing dependencies and native navigation |
| Interactive Experience Director | Preserve Bending's exact surface paint order and same sampled inputs; delegate its original frame clock and keep optional background work out of readiness |
| Motion Designer | Reuse the real playback, native input envelope and pointer equations; honor live preference changes and discard suspended time |
| Browser and GPU Performance Engineer | Reuse one bounded 2D field, add no case RAF or global WebGL context, release every scope, and distinguish portable functions from rendered/device measurements |
| Additional protocol perspective | Reject simultaneous drivers; make stale handles inert and cleanup idempotent; preserve current navigation/entry terminal ownership |

## Verification at implementation checkpoint

Seven portable checks in `tests/global-background.test.mjs` pass without skips:

1. All seven chapter samples at desktop and portrait dimensions produce exactly
   the same CSS publication strings, actual Canvas 2D drawing calls and original
   renderer reports as the pre-extraction implementation. Normal, paused,
   hidden and Reduced Motion states are compared.
2. Conflicting owner acquisition is rejected; repeated disposal is idempotent;
   a stale released binding cannot publish after another owner acquires.
3. Real playback/scene modules advance from elapsed native time and input;
   wheel remains passive; page and visibility suspension compose; hidden gaps
   are discarded; live Reduced Motion is reversible; disposal removes all
   native listeners and pending frames.
4. Coarse browser-chrome height changes retain dimensions/allocation, while
   width changes resize the same acquired resource.
5. Native input, reset and unchanged resize leave the driver idle while entry
   is pending, Reduced Motion is active or the document is hidden. The preference
   change delivers its clearing frame, an actual dimension change delivers one
   static frame without changing time/draw count, and disabling Reduced Motion
   resumes without leaking blocked pointer/input. Fine and coarse paths are tested.
6. An unavailable optional 2D context leaves the static atmosphere and returns
   the frame scheduler to idle.
7. A non-persisted document exit immediately releases field backing, scoped
   listeners and the lease; later notifications cannot restart that disposed
   driver. The portable persisted branch is a controller test, not a claim that
   a real browser actually retained the document in BFCache.

The related chapter-playback, chapter-scene-score and original page-field suites
pass with these checks: 31 passed, zero failed, zero skipped. Focused role ESLint
also passes on the new modules and modified background integration files.

The reduced-fix portable run discovers 371 checks: 369 pass and two existing
conditional browser-only checks skip. The subsequent complete corrections run,
including three new XR adapter regressions, discovers 374: 372 pass, zero fail
and the same two conditional checks skip. `pnpm check` passes its nine
framework tests, fifteen CI tests and unchanged 63-file framework audit; the
public local build passes its 138-file / 57-approved-file audit. These actual
results are recorded in the root `*-reduced-fix.log` and `*-corrections.log` files.
The rebuilt four background scenarios pass all 12 Chromium/mobile Chromium/WebKit
executions. The latest XR model/phone selection passes all 10 desktop/mobile
executions, including genuine context loss with continuing native-video playback;
its 21 related CPU checks, including three new lifecycle checks, also pass without
skips. These XR corrections retain project-owned resource boundaries and do not
change the delegated Bending Director.

The first CI run `38859743050` remains a failed checkpoint: WebKit shard 1/2
records 39 passes and an ordinary Reduced Motion freeze failure. Pre-fix native
input reproductions establish the ineffective scheduling path in Chromium and
WebKit, but the original CI's exact event caller was not recorded. The initial
53 completed passes from the deliberately interrupted 148-case local run are
retained separately. That CI's separate Chromium 4/4 phone-fallback classification
failure (16 passes / 1 failure) is likewise retained after its CPU and browser
correction. Corrective local passes neither replace these raw records nor certify
the final 19-file / 222-execution CI, deployment or live comparison; see the
[verification record](GLOBAL_BACKGROUND_XR_VERIFICATION.md).

`tests/pages/global-background.spec.mjs` adds four built-artifact scenarios for
the six-route single-background boundary, real autonomous time and native
pointer/wheel response, live Reduced Motion and render budgets, isolated optional
2D failure with readable content, actual trusted native page-departure cleanup,
and a live Bending scene's delegated driver and original sibling order. The native
departure check records the browser's actual `persisted` value and validates that
observed branch. It does not synthesize BFCache events or claim retention when
the browser discarded the document. The 12 executions above establish the
recorded local corrected-build result; final exact-artifact CI remains separate.

Required final acceptance remains the protected pre-change baseline and matched
post-change/post-deployment Bending desktop/mobile comparison, all built routes,
real autonomous background/input/preference states, reading contrast, existing
model/source interaction suites, asset audit and exact-artifact publication
gate. A source or portable pass alone does not satisfy that acceptance.

The build source allowlist explicitly includes the new modules. A shared
build-script change selects full framework and case CI. `pnpm check`, case
portable tests and relevant browser projects must run against the built public
artifact under Node 24.19.0 and pnpm 11.19.0 with the committed lockfile. The
existing same-SHA gate deploys the tested output without rebuilding. Physical
iPhone/Safari stability and sustained-device frame rate are not claimed here.
