# Round 06 — Autonomous chapter playback and information choreography

Date: 8 October 2026. Reviewed baseline: `704ba9f`.

## Owner request and diagnosis

The owner requests a substantial redesign: each chapter continues an authored performance without wheel input; wheel and touch can accelerate a passage or carry the reader into another chapter, but no longer scrub every scene property linearly. Information needs distinct anticipation, pop and settlement, perspective shadowboxes, and a coherent relationship between original diagrams and source geometry. Model interaction should be direct and intelligible rather than a panel of technical parameters. IBM Plex is the chosen typography; typography implementation belongs to the parent.

Round 05 is an insufficient base for that request if retained unchanged. Its `visualDocY → visualU → stageU` chain still determines camera, source separation and light. Its frame loop stops when the reading spring settles. A small idle sine added to that chain would leave the underlying interaction unchanged. Round 06 introduces an autonomous scene clock and retains native reading as the semantic navigation source.

This revision supersedes historical scroll-only and visible-idle requirements for the active Full experience. It does not remove Pause, Reduced, hidden-page suspension, accessible reading, truthful geometry or one-writer ownership.

## Cross-role agreement

The parent accepted the pure API before implementation. Motion, Cinema and Scene agreed the following division:

| Layer | Responsibility |
| --- | --- |
| Native document and parent controller | Reading, long mobile chapters, focus/hash/history, semantic chapter selection, consumed input impulses and the sole RAF schedule. |
| Motion playback | One shared active clock, bounded tempo, chapter passage weights, explicit suspension, entrance bookkeeping and semantic beat labels. |
| Scene score | Periodic camera/light/material/field cues sampled from playback, with no second timer. Blend every active chapter weight. |
| Cinema and World | Resolve approved source representation, framing and bounded manual offsets. World alone writes the camera. |
| Foreground choreography | Once-per-reveal anticipation, arrival, overshoot and exact settlement on inner content planes. Outer native targets stay stable. |

Scene requested one monotonic `activeSeconds` and per-chapter phases so re-entry does not create seven independently managed clocks. Motion accepted this: all chapter phases derive from the same tempo-integrated time, with different periods. Chapters do not advance automatically. A visitor can read a long System section across several loops and leave at any point.

Cinema agreed that deliberate direct manipulation holds the shared phase. The controller may keep `engaged` true while its bounded view offset returns to the held composition; then the same phase continues. Ordinary hover does not engage or stop atmosphere. No OrbitControls or second camera owner is introduced by this module.

Cinema's source audit reported candidates for different representations, with different topologies. Motion does not infer a vertex morph, physical bending simulation, fabrication chronology or structural solution. `representationCue` remains semantic until verified source identities are bound by the geometry/camera owners. The existing source-layer separation remains an explicitly labeled display operation.

## Pure playback contract

Files:

- `roles/uiux-designer/cases/bending-active-thesis/components/chapter-playback.mjs`
- `roles/uiux-designer/cases/bending-active-thesis/tests/chapter-playback.test.mjs`

```js
createChapterPlayback(chapter = 0)
advanceChapterPlayback(state, dtSeconds, {
  chapter, impulse = 0, paused = false, reducedMotion = false,
  hidden = false, resumed = false, engaged = false, seek = false,
})
sampleChapterPlayback(state)
```

`chapter` is an exact known id or integer 0–6; unknown values throw. The state is caller-owned and mutated in place. The module has no DOM, RAF, event listener, camera or renderer. It does not read fractional scroll progress. `impulse` is one consumed wheel/touch event delta, clamped to −1…1; do not resubmit the previous event every frame. Its sign is a navigation-direction diagnostic, while its magnitude increases the forward playback rate. Native semantic chapter selection handles forward/backward movement.

The tempo envelope is analytically integrated: base rate 1, maximum rate 2.4, exponential decay 2.6 per second. This preserves equal elapsed-time results at different frame rates. The 0.92-second chapter passage uses the same tempo-integrated delta. There is no chapter tour queue: the latest request retargets from the actual current chapter weights.

The snapshot contains:

```js
{
  chapterId, index,
  fromChapter, fromIndex, toChapter, toIndex, blend,
  chapterWeights, activeSeconds, chapters, phases,
  loopTime, loopPhase, beat, beatProgress, representationCue,
  tempo, energy, direction, entranceSeconds, entranceProgress,
  paused, reducedMotion, hidden, engaged, needsFrame,
}
```

`chapterWeights` has seven nonnegative entries summing to one. It is the presentation mix. On an interrupted passage, `fromChapter` is only the dominant source label: **blending two labels is insufficient** when three chapters have nonzero weights. Retargeting preserves the current values; it does not promise derivative continuity through an interrupted direction change.

`chapters` contains `{id,index,period,time,phase,beat,beatProgress,cue}` for each chapter. `phases` is a direct seven-entry alias array for scene sampling. `loopTime`, `loopPhase`, `beat` and `representationCue` describe the requested chapter. Periods in document order are 16, 18, 20, 18, 22, 18 and 24 seconds. Scene channels must form closed periodic trajectories; wrapping a phase is not permission to jump a camera or light.

| Beat | Normalized loop interval | Semantic cue |
| --- | --- | --- |
| Arrival | 0–0.16 | `primary` |
| Read | 0.16–0.48 | `read` |
| Examine | 0.48–0.80 | `examine` |
| Return | 0.80–1 | `return` |

These beat names describe editorial attention, not a physical process. The broader read interval supplies a composition in which information can be compared; it is not a timer that blocks scrolling. Scene and Cinema author meaningful variation within the loop, including coherent source comparison when supported by evidence.

`entranceSeconds` resets on chapter requests and is useful for a chapter-level arrival. Individual DOM elements should record their first visible `activeSeconds` and sample elapsed time from that timestamp. Reusing a chapter's reset entrance time for already-read paragraphs would cause an unsolicited replay on reversal. Later paragraphs in a long mobile chapter must receive their own timestamp when they become visible.

## Suspension, navigation and reading

- Full visible playback deliberately returns `needsFrame: true` after all input springs settle. This is necessary for the requested autonomous performance.
- Pause holds the current composition. A chapter navigation while paused resolves immediately so keyboard and reading navigation remain useful.
- Reduced uses a stable `read` pose at phase 0.32, applies requested chapters immediately and never advances the autonomous clock. Direct semantic model choices may still work through the parent's manual path.
- Hidden or deliberate engagement freezes time. Resumed frames and gaps over one second discard their elapsed interval. Ordinary heavy frames up to one second still use the exact integrated solution.
- Explicit `seek` completes a pending passage without rewinding the global clock. The caller uses this for keyboard/hash/history navigation when a visible target must align immediately.
- Re-entry retains global phase. No chapter auto-advance, forced animation completion, scroll mutation or touch trap exists in the pure module.

The parent must continue to derive chapter boundaries from natural layout, not transformed rectangles. A long section must not become a one-viewport carousel that hides paragraphs. Focus, selected text, source links and native headings remain available regardless of playback. A wheel impulse supplements reading; it must not make a user repeatedly fight a chapter lock before reaching the next paragraph.

## Per-element choreography coverage

Files:

- `roles/uiux-designer/cases/bending-active-thesis/components/element-choreography.mjs`
- `roles/uiux-designer/cases/bending-active-thesis/tests/element-choreography.test.mjs`

```js
sampleElementChoreography({
  kind = 'prose', elapsed = 0, index = 0,
  reducedMotion = false, light = false,
})
```

Output is `{kind,phase,progress,delay,duration,settled,x,y,z,rotateX,rotateY,rotateZ,scale,shadowDepth,ruleProgress}`. Translation is CSS pixels, rotation degrees, scale unitless. CSS owns the permanent shadowbox; `shadowDepth` is an additional transient depth cue that returns to zero. The sampler never changes opacity or removes content.

| Family | Motion character | Reading / ownership constraint |
| --- | --- | --- |
| Heading lines | Offset planes withdraw slightly, pop through the reading plane and settle with line staggering. | Preserve one semantic heading; transform inner line spans. |
| Glyph | Alternating branches spread and rotate, then rejoin. | Decorative paths cannot replace the native control label. |
| Prose | A small anticipation and brief plane response, then exact rest. | At most 8px vertical travel and 1.2° X rotation in tested Full profile; never hidden. |
| Diagram / method | Alternating branches enter from different sides with monotone rule advance. | Branch sequencing is editorial attention, not proof of a fabrication process. |
| Photo / evidence | Larger depth and perspective arrival, with controlled overshoot and shadow response. | Keep the source image opaque; stable outer link opens the actual evidence. |
| Caption | Lateral registration after the image's reveal. | Caption stays semantically attached to its source. |
| Metric | Short vertical pop with a stronger overshoot than prose. | Do not animate factual numbers through invented intermediate values. |
| Credit | Quiet, slower alignment and minimal overshoot. | Attribution remains legible and links keep their native hit area. |
| Navigation | Short plate motion on an inner visual child. | Never move the outer hit region between pointerdown and activation. |

Aliases: `headingLine → heading`, `body → prose`, `method → diagram`, `media/image → photo`, `credits → credit`, `navigation → nav`.

The nine profiles use distinct durations, anticipation peaks, overshoots and axes. Stagger is capped at 0.48 seconds, including very long documents. The longest profile finishes within 1.98 seconds after its reveal timestamp. Every profile settles at exact identity. Reduced immediately samples identity; Light preserves timing with 55% spatial amplitude.

Information entrances are one-shot. Continuous chapter performance should animate the meaningful diagram/model relationship and bounded decorative fields after the text has settled, rather than repeatedly tossing paragraphs away while they are being read. Hover/focus/press feedback composes on a separate inner layer with the existing caller-owned response, not another clock.

## Direct model interaction handoff

The parent subsequently delegated `ModelInspector.jsx` and `model-inspector.module.css` to Motion/UIUX. They now render into three natural hosts: `[data-model-study-host="form"]`, `system` and `pattern`. Each has a frameless source surface, a short header/caption, source label and interaction hint. All tabs, range controls, numeric outputs, lighting presets and duplicated quality selectors were removed. Global Pause/detail remain with the parent.

Cinema confirmed `window.__thesis.hitTest(clientX, clientY)` returns `null` or `{representationId,chapterId,source:true}` for visible source geometry only. Hover, pointer drag and short tap require that hit. An unavailable hit test does not make the whole rectangle falsely interactive. Keyboard access does not depend on a pointer ray.

Form/System expose four source comparisons: Origami representation, Opening representation, Bending-active representation and Authored curvature colors. Pattern exposes Experiment A/B/C. These labels came from Cinema's audited-source handoff; no unproved arc/twist/saddle correspondence or recalculated curvature is claimed by this UI.

The source surface has `data-model-viewport`, `data-study-chapter` and `data-source-count`. The parent can update `data-source-index` to the actual currently presented index; the next click then selects the following representation. Labels use `[data-source-label][data-study-chapter]`. A separate polite status announces explicit selections only, avoiding continuous screen-reader announcements during an autonomous loop.

Every interaction wakes the existing controller through `inspectionRevision`. The event fields are:

```js
{
  sourceSelection: {chapterId, index, selectedAt: playback.activeSeconds},
  modelHover: {x, y, strength, chapterId},
  modelEngaged,
  modelRecovering,
  modelInteractionChapter,
}
```

Mouse/pen pointerdown on the actual object captures the pointer, holds the chapter clock and initializes bounded angle targets from the current visual inspection value. A movement over four CSS pixels is a drag. Release targets the neutral angle through the existing spring; it never resets the visual response directly. The parent should hold playback while `modelEngaged || (modelRecovering && !inspection.settled)`, then clear recovery when the angles settle.

A short hit click/tap selects the next source representation for the parent's bounded comparison interval while time continues. Touch is not captured by this code, calls no `preventDefault`, and retains `pan-y pinch-zoom`; a movement over ten pixels or a press longer than 650ms is not a comparison tap. Secondary pointers do not overwrite an active gesture.

Enter/Space compare. Arrow keys deliberately pin a rotated view. Escape/Home return to the authored chapter and clear source selection; blur, hidden-page change, lost capture and unavailable geometry also release manual control. An explicit activation button preserves Reduced/Save-Data access. Failed geometry shows a labeled assembly reference poster and leaves normal source evidence readable. No modal, extra Canvas or parameter console is introduced.

## Controller integration

The parent subsequently delegated `CinematicExperience.jsx`. Its existing RAF now advances reading, manual inspection, chapter playback and bounded local feedback. Semantic chapters come from native document progress; scene time comes only from playback. `input.playback` and unmodified `input.chapterScene` connect the controller to Scene. The legacy `stageU` diagnostic/binding is now a blend of chapter anchor positions; the old reading value remains separately named `readingStageU`.

The controller consumes accumulated wheel/touch impulses once per frame. Ctrl-wheel remains browser zoom. It preserves natural reading anchors, the whole-plane reading response, focus/hash seeks, keyboard paging and exact per-history-entry restoration. A keyboard page action works while a model surface has focus unless its own key handler already consumed the action.

Pause and OS Reduced are distinct input dimensions. Disabled/failed scenes do not keep a perpetual RAF running. Manual recovery holds playback until the existing inspection spring settles. Crossing a semantic chapter boundary releases a manual pin from the previous chapter. Visibility suspension cancels the RAF, publishes a stopped snapshot and discards hidden elapsed time on resume.

Choreography is collected across the document, including persistent masthead, chapter rail and reading-tool labels. It publishes both the individual `--choreo-*` values and `--choreo-transform`. Fixed labels use viewport coordinates for reveal detection; a newly visible paragraph receives its own stable first-visible timestamp. Semantic seeks settle the visible target immediately; preference wakeups do not accidentally suppress the initial entrance. Completed elements stop receiving transform writes.

The three `modelViewports` are normalized, clipped rectangles measured after foreground transforms. A stationary pointer is re-tested against the moving source in the shared tick, so geometry leaving the pointer cannot leave a stale hover cue. `thesis:representation` is a deliberate source-selection request. Scene presentation updates use the separate `thesis:representation-presented` event; mixing those names would turn every autonomous source switch into a fresh manual pin.

Canvas is a sibling of the poster/scrim backdrop. Its foreground z-index is enabled only when visible, valid `[data-protect]` cores exist and the scene score requests foreground presence. Whole panels/media are not selected automatically. The existing `__story.inspect()` now exposes playback, chapter scene, source selection, the three viewports, engagement/recovery and choreography state; Scene retains ownership of `__thesis` and hit testing.

For the parent's desktop sticky source slots, model viewports are excluded from reading-stop candidates while their host is sticky. Sticky label visibility uses its current rectangle only for reveal detection; it never feeds chapter anchors. Mobile natural-flow model stops remain available. Actual source fitting continues to follow the transformed visible slot.

## Independent critique and integration acceptance

The read-only integration review found and reported these actionable issues:

- Global translate/Rz/scale alone left several content families' X/Y choreography rotations unused. The parent added full composition and increased specificity above the historical prose rule; transient shadow depth was also connected.
- SourceDiagram briefly used unsupported `label` and `copy` kinds. Its owner corrected these to `caption`/`nav` and `prose` before final acceptance.
- Diagram CSS expected `data-motion-paused`; the controller now publishes that hook so outstanding trace/control transitions stop on Pause.
- The old motion browser assertion read a removed section-level `--rule-progress`. The parent owns updating it to the actual choreography contract.
- The compositor's previous all-rectangle union on more than 16 masks could erase almost the full artwork. Scene accepted conservative pair packing that preserves every protected core while retaining larger open areas.
- Workflow automatic highlight and actual source selection used different phase boundaries, and their manual selections expired differently. This was escalated to Scene/parent: workflow should follow verified presentation events; library and Miura keep their independent chapter-indexed source-trace loops.
- Scene's retained material progress still read `visualU`; Cinema changed it to the selected chapter phase. Cinema also reconciled actual source-label text/index after the ready-state rerender, while keeping presentation events discrete.
- Persistent inline labels need transformable inner spans (`inline-block` where appropriate); changing custom properties on a non-replaced inline element alone does not prove visible movement. The parent owns the final CSS binding.

These are role review findings and coordinated changes, not a claim that a final browser capture has passed.

The implementation must be judged against this new interaction, not old screenshots or a test that assumes the whole source always stays in frame. Required integrated observations are:

1. Without input, a chosen chapter changes its authored view/light/diagram state across meaningful beats while all prose remains readable. At least one complete loop returns continuously to its initial composition.
2. Wheel/touch changes reading and bounded tempo; it does not directly seek the scene to a proportional phase. A long mobile System section exposes all paragraphs and source links.
3. A rapid third-chapter request and reverse passage blend from the current picture. One Canvas, one camera writer and verified source identities remain intact.
4. Keyboard/hash/history navigation aligns the intended content without a forced animation tour. Inner movement does not relocate native link, summary or button hit regions.
5. Pause, Reduced and hidden-page operation stop autonomous time and rendering requests. Hidden time is not replayed on return. Ordinary hover does not accidentally pause the scene.
6. Source comparisons identify their actual representation. Geometry with different topology is staged or swapped with a truthful comparison transition, never sold as simulated bending. Source separation retains its display-only label.
7. Captures at mobile and desktop demonstrate visible anticipation/depth, clear IBM Plex hierarchy, shadowbox separation, and no model/field interference over protected reading text.

The pure module cannot establish those browser, source or visual outcomes. Final live binding and release verification belong to the parent and relevant role owners.

## Verification

Node **24.19.0**: **15/15 focused groups passed** (nine playback, six foreground choreography). Scoped whitespace validation passed. Tests cover autonomous multi-loop playback, every beat, exact tempo integration, 3/30/60/120 Hz agreement, third-chapter interruption and reversal, weight normalization, pause/navigation, deliberate engagement, Reduced, hidden/resume/stale gaps, ordinary heavy frames, re-entry, immutable public metadata, rejected invalid input, distinct anticipation/overshoot, bounded stagger, readable prose, exact settlement, monotone rules and semantic aliases.

Actual scoped ESLint with `--no-ignore` passed for the two pure modules, direct model UI and integrated controller. The normal root lint intentionally ignores role workspaces, so its initial ignored-file warnings were not counted as validation. Scoped whitespace checks passed. This role handoff did not run a build, browser, GPU capture, commit, push or deployment. These results are pure-module and static integration evidence only; historical Round 05 browser results are not Round 06 acceptance.

## Primary implementation references

The scoped [R3F animation skill](C:/Users/JosHsuan/.codex/skills/r3f-animation/SKILL.md) was read for single-clock ownership, delta-based motion and explicit suspension. Installed React 19.3.0 / Fiber 9.8.1 / Three 0.186.1 were checked; no library or dependency was added.

[R3F scaling performance](https://r3f.docs.pmnd.rs/advanced/scaling-performance) explains demand invalidation and resource reuse. [R3F performance pitfalls](https://r3f.docs.pmnd.rs/advanced/pitfalls) supports direct fast-path updates outside React state. [MDN Page Visibility](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API) documents visibility events used by the caller to suspend and resume work. These are implementation references, not evidence that the final integrated artwork or physical-device performance has passed.
