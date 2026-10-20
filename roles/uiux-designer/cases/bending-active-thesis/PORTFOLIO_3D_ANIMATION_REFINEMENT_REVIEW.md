# Portfolio refinement: 3D animation review

Date: 20 October 2026. Role: the existing 3D Animation Designer.
Status: independent source/code/capture review and implementation handoff;
integrated browser and visual acceptance remain pending.

This review follows [decision 0019](../../../../docs/decisions/0019-portfolio-refinement-and-runtime.md),
the [refinement integration contract](PORTFOLIO_REFINEMENT_INTEGRATION.md),
the [team direction](PORTFOLIO_REFINEMENT_TEAM_REVIEW.md), and the
[UI/UX composition proposal](PORTFOLIO_UIUX_REFINEMENT_DESIGN.md). Its scope is
Mode/s, Entrance, Dot, Caustics, Special Assemblies and Caschlatsch. Bending
and XR remain the protected visual references.

## Evidence and scope of the review

The role read its current AGENTS and SESSION_BRIEF, its source-animation skill
and element contract, root instructions and README, decisions 0001/0005/0019,
architecture Sections 07–09, and the website design guidance. The role inspected
the current backdrop motion/presenter, scene presenter and source renderer,
Home scrolling adapter, information-window presenter, generic chapter markup
and CSS, public study records, and the scene/backdrop/native-browser tests.
No source geometry was authored or processed; no model-preparation or GPU tool
was needed for this bounded review.

The role actually viewed three preceding-release native captures: desktop
Mode/s Context, mobile Mode/s physical-film aperture, and mobile Caschlatsch
XR guidance. These show the existing model/caption relationship, substantial
film-to-caption separation, and a white technical source behind extended prose.
They explain concrete composition defects; they do not establish acceptance
of the corrected sources or of all six new compositions.

Using the pinned Node 24.19.0, the role ran these existing CPU suites against
the current worktree:

```text
node --test \
  roles/uiux-designer/cases/bending-active-thesis/tests/project-study-backdrop.test.mjs \
  roles/uiux-designer/cases/bending-active-thesis/tests/project-study-scene.test.mjs
```

Result: 31 tests passed, no failures, skips or retries. These are portable
controller/source-parsing checks. No browser, physical-device, visual,
performance or release acceptance is claimed by that result.

## Decision: refine the reading choreography, retain source motion ownership

The working motion system already supplies the useful cinematic grammar. A
source exits, its replacement prepares from actual decoded pixels or actual
model paint, and that replacement enters and holds. Model identity spans its
entire contiguous chapter interval. The missing design work is a deliberate
source aperture, a nearby caption/control group, readable continuation, and
discoverable inspection with a clear return. A second motion kernel would
obscure these relationships and create competing writers.

The generic redesign should therefore change the native-flow choreography and
its truthful interaction feedback. Keep these explicit motion values:

| Channel | Value / rule | Owner |
| --- | --- | --- |
| Outer entry | 1.10 active seconds, quintic interpolation from the displayed pose to `x=0, y=0, opacity=1` | `ProjectStudyBackdropMotion` |
| Outer exit | 0.95 active seconds; forward target `x=-1.08, y=-0.05, opacity=0`, reverse target `x=0.22, y=0.035, opacity=0`, in viewport units | Same transaction |
| Replacement entry origin | The corresponding opposite-direction outside pose; no independent image/video CSS fade | Same transaction |
| Same model across chapters | Stable source key, transaction sequence and held outer pose; apply only the existing source chapter view | Backdrop transaction, then the scene renderer |
| Inspection azimuth | Pointer gain `-0.004 rad/px`, clamped to `[-0.9, 0.9]`; arrow step `0.12 rad` | Scene presenter intent, renderer final write |
| Inspection elevation | Pointer gain `0.003 rad/px`, clamped to `[-0.4, 0.5]`; arrow step `0.09 rad` | Same scene owner |
| Direct manipulation commitment | 4px mouse / 8px touch; vertical touch intent yields native document scrolling | Scene presenter |
| Release recovery | Existing critically damped recovery, rate `16 s⁻¹`, finite rest threshold; Home/Escape/reset return exactly to the source chapter view | Scene presenter |
| Information response | Preserve the existing limits: translation ±12px, rotation ±1.5°, skin-edge movement at most `min(16px, 8% of the shorter edge)` | Information-window presenter |

These are inspected implementation values, not newly invented source motion.
They are intentionally the same across the six cases. Responsive composition
and source aspect determine reading distance; video duration does not determine
chapter height. Native scroll selects intent immediately and never waits for
the source's 2.05-second exit/entry pair. The visitor can keep reading, reverse
or jump while the finite passage closes.

Do not add elastic deformation, orbit autoplay, part explosion, simulated
stress, a new fabrication order, a source-colour tween or a camera tween to
compensate for the layout. Model geometry, source transforms and existing
camera/material/light recipes remain intact.

## Responsive source and caption choreography

The new composition policy should change source apertures, their matching
native-flow space and the caption/prose relationship together. CSS alone must
not produce a new source-selection threshold.

| Composition | Implementable aperture / pacing rule | Closure |
| --- | --- | --- |
| Model split at width ≥800px | Keep renderer slot centred at `(73.5%, 53%)`, width `51%`, height `78%`; the corresponding empty inspection area is `x=48–99%`, `y=14–92%` before safe-edge constraints. Preserve the left reading column. | Caption and help sit beside/below the available source area without becoming the model's pointer target. |
| Model at width ≤799px | Keep the renderer slot centred at `(50%, 42%)`, width `94%`, height `45%`, corresponding to `x=3–97%`, `y=19.5–64.5%`. Use source-first flow and then help/caption/prose. | Native vertical reading continues; the source remains within its existing model interval. |
| Broad movie or technical figure | Use the UI/UX proposal's broad contained aperture, initially at most `64svh` high on desktop, below actual masthead space and inside rail-safe horizontal bounds. Preserve full source aspect. | Caption, source link and movie controls follow the aperture with `1.25–1.75rem` gap rather than an unconditional extra viewport spacer. |
| Portrait installation/photo/movie | Allocate source height to the portrait frame and allow side negative space; do not crop it into a landscape well. | Caption follows its actual contained frame, not the bottom edge of an oversized universal visual slot. |
| Extended Caschlatsch reading | Display the complete original primary figure, then caption/source access and naturally tall prose; supporting original figures follow once in source order. | Final paragraph, full-image access and next chapter remain reachable clear of fixed chrome. |
| Closing | Content-driven credits and related destination; no forced empty model/image companion slot | Last source can remain held without opening a new source transaction. |

The current generic CSS changes its column layout at 780px, while the actual
Three renderer changes its model slot below 800px. At 781–799px, the renderer
therefore uses the centred model slot while the DOM still uses desktop source
columns. Align the new model aperture/focus target with the renderer's existing
799/800 boundary. Test both 799px and 800px, then 1024×768, rather than changing
the protected camera to conceal the discrepancy. Documentary layout may have
its own justified breakpoint, provided the model target still matches its
rendered slot.

The existing caption and reading windows retain their small scroll feedback.
Focus within a reading window already settles that window; preserve it. A
link or playback control must not move away from the pointer/focus while being
used. Source pixels themselves do not inherit the elastic skin deformation.

## Inspection feedback and event contract

Publish a discrete inspection state from the scene owner rather than inferring
readiness from a canvas node. The existing `canInspect` conditions are the
authority: current eligible model chapter, same actually displayed source and
chapter, held/settled passage, actual successful paint, ready lifecycle,
site ready, and no hidden/reduced/data/paused/suspended/static policy.

| Visible state | Required actual facts | UI behavior |
| --- | --- | --- |
| Preparing 3D view | The current model is not yet inspectable and a model arrival is genuinely pending | Show preparing text; no active reset/drag promise. |
| 3D view · drag to inspect | All `canInspect` conditions hold | Empty aperture is focusable; nearby text explains drag, arrows and Home/Escape return. |
| Motion paused · original view | Pause policy is active, with no inspection offset/capture | Keep useful source view and text, leave native reading usable. |
| Original source view | Static fallback/reduced/data/error terminal applies | Show source/caption/link; no nonfunctional inspection control. |

Availability is a discrete DOM attribute/text update. Do not publish camera
values into React or update a live region every animation frame. It should
change when readiness, displayed source or policy changes.

The dedicated `[data-project-model-control]` belongs to the empty model
aperture. Caption/source links and any Reset view button are siblings, not
descendants. Use the existing 44px minimum control targets and visible focus.
The reset action, if included, calls the same scene-owner return operation as
Home/Escape; it must not directly mutate camera values or manufacture a DOM
keyboard event.

One current issue needs a small real fix during integration: the scene
presenter's keydown handler checks `closest('[data-project-model-control]')`
but does not exclude its `BLOCKED` interactive/native-control selector. With
the current wrapper structure, source links are descendants of that wrapper.
Add the same native-control exclusion before intercepting arrow/Home/Escape
keys, even after moving those controls outside the target. Also exclude
editable content if the target contract later permits it. A full-image link
must keep ordinary keyboard behavior and never alter the model camera.

Retain actual model-hit testing on pointerdown. An empty aperture hit is not a
source hit. The presenter owns pointer capture only after commitment. Closure
must cover release, pointercancel, lost capture, pointer leaving, window blur,
focus departure, chapter departure, pause, hidden, Reduced Motion, Save Data,
source failure and disposal. Every requested gesture gets one released or
cancelled terminal; the camera returns to the chapter's rest offset.

## Six source stories

| Case | Motion story and truthful interaction |
| --- | --- |
| Mode/s of Making | Context→System is one continuous model appearance. Making's simulation, Fabrication's film excerpt and Cutting's prototype excerpt are three distinct source/media identities. Each movie shows its prepared real first frame through entry and starts/resumes only at hold. Each retains its own native time and deliberate pause intent. Physical operation must remain physical operation, with source softness preserved. |
| Entrance Installation Art | The model remains one interval through Context/System while the existing chapter camera view changes. The completed night recording uses its full portrait frame. Do not add part movement or a lighting simulation to the installation to make a new chapter feel different. |
| Dot-Based 3D Printing | System presents the actual source points. Inspection changes viewpoint only. Making's deposition footage is its own source transaction, followed by physical sample evidence. Point appearance must not become a generated print-growth animation. |
| HC3DP Caustics | Context/System keep the complete verified source in one interval; recorded path demonstration and photographed optical outcomes remain different evidence. Do not turn the path movie into a successful printing/caustic prediction claim. |
| Special Assemblies | Context/System retain the source module geometry; the robot animation is a separate finite source. At native end, hold its actual last frame and expose replay. Do not make the page advance, reset the sequence automatically, or introduce an invented collision/assembly solver. |
| Project Caschlatsch | Original portfolio plates are documentary sources. Different voxel/beam and XR figures receive their own real source identity and appropriate broad reading passage. Supporting assembly/data figures remain native evidence. No fabricated model, part animation, cloud state or mock interactive phone is introduced. |

For every recording, `video.currentTime` and decoded native events remain the
transport evidence. Scroll/outer motion never seeks it. Explicit Replay is
the only normal playback action that resets a finite recording to zero.
Leaving a chapter pauses its retained element; returning resumes from its
retained time unless deliberate pause or an ended state applies. A movie ending
does not close the reading chapter. Loop behavior follows reviewed source
metadata, rather than a new blanket policy.

## Closed source transactions and bounded work

Keep the actual state progression:

```text
semantic chapter intent
  → cancel the superseded open request, if any
  → exit the actually displayed old source from its displayed pose
  → prepare the latest source after old pixels are outside
  → decoded frame / successful original-model paint / explicit static result
  → enter once
  → hold; terminal completed or failed
```

Re-requesting the displayed source during exit returns from its actual current
pose; there is no teleport to an entry origin. A new third destination during
exit must not acquire or briefly expose a stale middle source. An already
running exit can finish its established departing direction without a spatial
jump; the latest request determines its replacement's entry side. History
records the old request's cancellation once and the final request's terminal
once. Same-key native chapters update semantic context without restarting the
source's outer passage.

The existing site driver's single scheduled frame drives backdrop passage,
scene inspection recovery, information-window response and shared atmospheric
field. These adapters do not gain another RAF, scroll listener, interval or
CSS transition on their owned properties. Decode waits sleep until native
events/deadlines; a held still image/model does not redraw periodically.
Native video transport does not require a JavaScript frame loop merely to play.

Preserve the existing bounded diagnostic histories, source/media deadlines,
generation/abort checks, retained off-chapter resources and source pixel budget.
Hidden/BFCache cancels current interaction, pauses native media and suspends the
same owners. Return rebases elapsed time and resolves the current useful view,
without replaying hidden time. A true departure closes all scopes, callbacks,
deadlines, source attachments and GPU ownership exactly once.

## Acceptance handoff

The implementer should extend the current focused tests where new ownership or
markup changes create new behavior. Do not replace native tests with simulated
readiness attributes or add retries to make the new design pass.

1. On every one of the five model cases, verify actual eligible hold, visible
   help/state, dedicated focus target, at least one actual-hit drag, arrows and
   exact Home/Escape/reset return. On caption links, arrows/Home leave the
   camera unchanged. Exercise native vertical touch reading and committed
   horizontal inspection on the changed aperture.
2. Observe at least one real intermediate exit and entry in both directions,
   with the original duration/sign assertions. Rapid A→B→C and A→B→A close from
   displayed poses; B never appears after cancellation. Same-model chapters
   retain outer identity, sequence, opacity and one continuous interval.
3. Exercise Mode/s's three independent actual native timelines through forward,
   reverse, manual pause, global pause and source return. Observe real advancing
   time and trusted media events, at most one unpaused participant, and no seek
   caused by scrolling. Special's finite end holds until real Replay.
4. At desktop 1440×1000, tablet 1024×768, 800px, 799px, mobile 390×844 and narrow
   320px, inspect each six-case chapter's complete source, caption/control last
   line, prose ending, supporting evidence, and forward/reverse boundary. The
   aperture and native-flow position must be assessed together. Header/rail
   safe space, original technical labels and source aspect remain intact.
5. Repeat failed source/WebGL, slow first frame, live Reduced Motion, Save Data,
   no-JavaScript, print, hidden/BFCache and real departure checks. Designed
   source/text fallback remains usable; a late source cannot upgrade a terminal
   fallback. Frozen policy states settle without a background redraw loop.
6. Senior runtime/performance review measures actual layout/event work, native
   interaction latency, settling/idle scheduling and resource release on the
   finished composition. Preserve the visible effects during that later
   refactor. Compare Bending/XR before/after on actual desktop/mobile states if
   any shared owner changes.

This role has not run those integrated native journeys or accepted the release.
Root must bind final evidence to the built artifact, exact CI artifact and
deployed bytes, and record unavailable physical-device verification explicitly.
