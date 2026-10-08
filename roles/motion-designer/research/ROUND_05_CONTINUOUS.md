# Round 05 — One continuous reading and scene response

Date: 2026-10-08. Reviewed baseline: `fc29c62`.

The owner accepted the research but clarified the intended experience: one continuous page, with scrolling information receiving motion design, damping, acceleration, holds and appropriate perspective/tilt alongside the model. The Round 04 modal model study does not satisfy that direction. This round replaces its interruption with an inline study and makes the complete reading layer participate in the shared motion response.

## Review and decisions

The previous `story-response` already supplied an analytical spring and seven unequal stage holds. However, natural document travel bypassed that response. `editorial-score` explicitly returned `bodyShift: 0`, its reading indicators consumed `nativeU`, and headings/images added only small offsets to otherwise immediate DOM travel. The modal branch then suspended the narrative. That architecture could produce a damped model with decorative typography, but not the requested continuous information composition.

The Motion and 3D Animation roles reread their AGENTS/briefs, repository decisions and motion/accessibility constraints, the actual page/controller, and the installed `r3f-animation` skill. Installed React 19.3.0 and Fiber 9.8.1 match that skill's ownership guidance. Its relevant principles are one final property writer, caller-owned response state, frame-rate-aware advancement and demand rendering that returns to idle. No additional runtime animation library is needed; the existing analytical response can serve both layers.

Cross-role agreement:

- **Parent/UI:** native scroll and the semantic document remain. One complete reading plane receives `nativeDocY - visualDocY`; its natural anchors are measured from the `offsetTop` chain. Enhanced CSS sticky positioning is removed so it cannot supply a competing native travel curve. The containing natural-flow frame prevents transformed overflow from changing the scroll range.
- **Cinema:** camera and optical samplers receive the final visible reading coordinate, with no camera-only smoothing. Existing authored stage anchors remain useful. Protected text rectangles are measured after transforms, while chapter and slot layout measurements must not feed transformed rectangles back into natural anchors.
- **Scene Direction:** the visible reading score is the sole lighting timeline. Inline Studio/Raking values are numeric local input, not another autonomous lighting clock. Source-frame lights retain their meaning as camera angle changes; the backdrop may still face the camera. Numeric interpolation avoids a preset-string jump.
- **Motion:** actual content positions supply reading stops. Long mobile sections need multiple heading, prose and evidence stops; a single chapter midpoint could skip the title or earlier explanation. The source assembly remains unchanged. Separation remains a labelled display relationship, not a reconstruction of the fabrication process.

There is no forced scroll snap, prevented wheel gesture, mandatory pause duration, copied prose layer or new RAF. The native page remains navigable with JavaScript disabled. Reduced/Pause restores the natural reading plane. Focus, hash, history, keyboard jumps and hidden resume must seek directly to their visible semantic target.

## Pure API and units

`components/story-response.mjs` retains its historical normalized-response exports for existing callers and tests, and adds:

```js
createReadingPlan({anchors, viewportHeight, maxScroll, stops})
sampleReadingTarget(nativeDocY, plan)
createReadingState(nativeDocY = 0)
advanceReading(state, nativeDocY, dtSeconds,
  {plan, reducedMotion, resumed, seek})
sampleReadingScore(state, plan)

createPlaneFeedback()
advancePlaneFeedback(state, target, dtSeconds,
  {reducedMotion, resumed})
```

The continuous case uses `advanceReading` as its **only scroll spring**; it must not also advance the older normalized story spring. `anchors` contains eight increasing natural document positions for seven chapters. A stop is `{id, y}`, where `y` is the desired document **scroll position**, after the controller has accounted for its safe reading inset; it is not simply the element's raw top.

The reading state contains `nativeDocY`, `targetDocY`, `visualDocY`, `velocity`, `acceleration`, `energy`, `direction`, `settled`, `seekUntilInput` and `bypassHoldId`. Positions are CSS pixels, velocity is pixels/second and acceleration is pixels/second². Per-frame values remain outside React state.

The plan maps native position to an authored target with short local plateaus and quintic shoulders. At each untouched boundary the mapping has derivative 1; at each plateau it has derivative 0. Second derivatives match at the joins. The shoulder's derivative factors into a nonnegative polynomial, so the mapping is monotone. Identity outside each nonoverlapping window, continuity and unchanged document endpoints preserve access to every intervening content position. Holds consume native travel, not an elapsed timer.

Nominal hold half-width is 5.5% of viewport height, with 12% shoulders; windows shrink to adjacent-stop clearance. Very close candidates are thinned. The dynamic lag is bounded by `min(240px, 0.32 × viewportHeight)`. Authored displacement was tested below 11% of viewport height. These are initial design limits; actual readable composition still requires browser and visual review.

The analytical critical response uses the existing frequency parameter of 12.5 per second. Heavy ordinary frames use the exact solution. Reduced/Pause, explicit seek/resume, a frame gap over one second, or a native jump over 1.5 viewports seeks directly. Settlement sets position exactly and zeroes velocity, acceleration and energy.

After a semantic seek, unchanged native input remains exact. The first genuine scroll resumes damping. If the seek landed within a hold shoulder, that one hold is bypassed until the reader exits its window: immediately reapplying it could otherwise move text backwards on the first forward wheel movement. Subsequent stops retain their authored behavior.

`sampleReadingScore` returns:

```js
{
  nativeDocY, visualDocY, readingShiftY,
  nativeU, visualU,
  stageU, chapterId, localPhase, dwellWeight,
  holdId, holdWeight
}
```

Both progress values use the natural chapter anchors and the same 45%-viewport reading reference. `stageU` comes from `sampleResponseScore(visualU)` once. `holdWeight` also accounts for actual arrival at the reading target, so entering its native window does not falsely report an already stationary composition. DOM, camera, source-layer score and lighting consume the same final `visualU`/`stageU`.

## Information planes and local feedback

`editorial-score.mjs` keeps distinct heading-line, method-row, image, caption and glyph phases. Visible rule/method progression now follows `visualU`; `nativeProgress` remains separately available for semantic diagnostics. New channels are `headingRotateX`, `headingRotateY`, `headingZ`, `bodyRotateX`, `bodyRotateY`, `bodyZ`, `mediaRotateX`, `mediaRotateY` and `mediaZ`, alongside the existing translation/scale channels. Prose has a bounded entry/exit plane. All essential copy remains present; no opacity, clipping or content hiding is authored by this sampler.

Scroll-driven perspective uses shared energy/direction and quiets at actual `holdWeight`. These channels enhance the full reading-plane travel rather than substituting a small hover transform for it. Reduced returns identity transforms. Light reduces spatial amplitude and disables the prior material/light speed accents.

Local feedback state is `{x, y, press, velocity: {x, y, press}, settled}`. Targets clamp x/y to −1…1 and press to 0…1. The existing controller tick advances these states; they own no clock or scroll coordinate. Reduced/resume applies the target immediately. Decorative callers submit zero targets under Reduced; explicit semantic inputs such as Studio/Raking may retain their chosen value. The parent can map the `press` channel of a dedicated semantic record to a numeric light mix, while keeping its button label immediate.

## Read-only integration review

The first parent integration correctly applies whole-plane compensation, disables enhanced sticky positioning, uses natural offsets, publishes the common visible score and reads protected rectangles after the transform writes. The modal early-return branch is gone.

Motion reported these follow-up checks before acceptance:

1. History restoration needs a direct seek, including returning to an empty hash. A `hashchange` handler alone does not cover every Back/Forward path.
2. Keyboard paging should retain a seek for the actual resulting scroll event. Consuming the request in a RAF before the browser dispatches its native scroll can accidentally re-enable damping for that jump.
3. Focus navigation needs natural target bounds and a safe viewport inset. The browser may auto-scroll using an old transformed rectangle; clearing compensation must not leave the focused control outside the viewport.
4. Initial deep links should be aligned after enhanced natural layout is measured. Measurement must not repeatedly move the reader during normal scrolling.
5. A literal `.openingText` selector does not match the compiled CSS-module class; use a semantic marker for its stop. Keyboard focus feedback should not depend on a fine pointing device. Local feedback resume should discard stale hidden input as the reading response does.

These are review findings, not claims that the later parent build still contains them. The parent owns their runtime resolution and final browser evidence.

## Verification and limits

Node **24.19.0**: **43/43 pure tests passed** on this handoff: nine new reading/feedback groups, ten revised editorial groups, eleven retained normalized-response groups, six exact source-layer groups and seven inspection-state groups. Scoped whitespace validation passed.

New coverage includes continuous monotone holds and exact reachable paragraph positions; multiple mobile System stops; acceleration/settlement and idle; equal elapsed-time agreement at 3/30/60/120 Hz; reversal and bounded lag; focus seek followed by real input; Reduced/resume/stale/large jumps; shared camera/reading progress; independent same-tick feedback; immutable plans and rejected invalid input. Revised editorial tests remove the obsolete requirement that visible prose remain stationary while the model responds.

This handoff did **not** run a build or browser acceptance, create a commit, push, or deploy. Pure tests cannot prove typography, reading-plane clipping, touch/keyboard navigation, final source framing, real GPU idle or the perceived strength of the continuous motion. Those remain the parent integration and visual acceptance work.

## Parent integration acceptance — 8 October 2026

The review findings above were resolved in the integrated controller: per-entry native history positions, explicit keyboard paging, natural-bounds focus seeks, delayed initial-hash alignment, a semantic hero reading marker, and pointer-independent focus feedback. A pointer press also retains its natural position through focusout until pointerup, preventing click targets from moving between press and release. The final motion browser matrix passed 9/9 across Chromium, WebKit and mobile Chromium. See the case Round 05 verification record for aggregate model/public coverage, capture evidence and remaining typography/device limits.
