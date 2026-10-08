# Round 04 — From authored motion to source inspection

Date: 2026-10-08. Motion Designer, 3D Animation Designer and interaction-systems review.

The owner requested collaborative research into Lusion and Lusion Labs, a concrete feature plan, implementation of the Bending-Active presentation, then categorized commits, push and deployment. This role owns the pure inspection response, exact source-layer sampling and this research record. The parent owns mode/UI integration and release work. No reference artwork, geometry, texture or source code is imported into the public case.

## Primary research and observation limits

Research separates three kinds of evidence: **observed** means an actual browser action or rendered capture; **publisher description** means the official case text; **proposal** means our own design decision. Neither screenshots nor marketing copy establish an unseen algorithm or performance guarantee.

### Lusion Labs and Lost in Parallel Universe

The [Labs gallery](https://labs.lusion.co/) exposes an experiment collection and individual project pages. Its initial loader was still visible in the first short capture; that capture is not evidence of the finished gallery composition.

On the official [Lost in Parallel Universe experiment](https://exp-lost-in-parallel-universe.lusion.co/), an isolated Chromium session rendered the scene and visible controls. Dragging changed the camera viewpoint. Activating About exposed the explanation while retaining the experiment. The site explicitly advertises Space to pause, new artwork generation and an image export.

The pause test has an important limit: two captures after Space were not pixel-identical, so full visual stillness or stopped rendering was **not** established. The capture after requesting a new visual showed a black transition, not a completed new composition. No export was requested. These observations support explicit controls and explainable actions, not a claim that this reference satisfies our idle or reduced-motion contract.

Our inference: give inspection an obvious entry, purpose, Reset and Return. Do not copy an endless animation loop or make a gesture the only discoverable control.

### Gemini Car Demo

The rendered official [Gemini Labs case](https://labs.lusion.co/exp/gemini-car) describes exterior inspection and choosing the car's colour, and links to its [live project](https://exp-gemini.lusion.co/). We read the actual case text in the browser; the live colour interaction was not exercised in this handoff. The publisher also discusses device performance and coordinated design/development, but does not establish our implementation's costs.

Our inference: a bounded control should change something useful in the displayed subject. For this thesis, the truthful equivalent is comparison of supplied source layers and observation under defined lighting, rather than arbitrary material customisation or invented mechanical deformation.

### Oryzo: material inspection as a distinct task

Lusion's official [Oryzo production article, part 2](https://blog.lusion.co/oryzo-bts-part-2-7-3d-design-and-motion-graphics) describes a microscopic view inside the larger scrolling story, including a drag/shake interaction. It also documents a hybrid rendering approach selected for the particular scene. This is producer evidence, not a directly tested interaction here; it does not prove the easing, event handling or idle policy used by that view.

Our inference: separate a focused inspection task from narrative scrolling. A task can have its own bounded parameters while preserving the user's reading context. We do not need its production pipeline, simulated tearing, or hidden gesture reward to implement that principle.

Research captures and the action log are local under `roles/motion-designer/.runtime/round04-research/`, excluded from the public release. The in-app browser tool failed twice before initialization, so the bounded reference checks used a separate Playwright Chromium session. Only one reference page was active at a time. Touch, keyboard completeness, reduced motion and reference-site GPU idle were not verified.

## Feature decisions and cross-role critique

| Feature | Meaningful user action | Decision |
| --- | --- | --- |
| Enter source inspection | Inspect the same supplied assembly from bounded views; compare a stable object under deliberate lighting; Reset or Return to the exact reading context. | Implement in Round 04. |
| Original / display-separated comparison | Set a real three-layer display weight from 0 to 1; see the exact original placement again. | Implement in Round 04. |
| Evidence-linked method selection | Select a documented research view alongside the explanation. | Defer. The published method sequence is not a reversible live simulation, and the available three source nodes do not encode that process. |

Cinema agreed to one camera resolver, no OrbitControls and no initial pan/zoom. The inspection fit envelope includes maximum separation before the user moves the slider; changing separation must not trigger an automatic dolly that changes the comparison. Final views are Front (0°, 18°), Three-quarter (30°, 30°), and High (30°, 65°). “High” avoids suggesting a true orthographic top view.

Scene Direction supplies source-fixed Studio, Raking and Silhouette presets. Their meaning remains stable while the user changes camera angle. Its pure API accepts `sampleInspectionLighting({preset, azimuth})`, where `azimuth` is the inspection state's `lightAzimuth`. There is no perpetual light sweep. The parent maps those names once at the scene boundary.

Inspection uses direct, clear geometry: DOF, ASCII and black mist are disabled there. They remain authored story treatments outside inspection. The existing Canvas and loaded geometry are reused; the scene remains the sole final writer of camera, source transforms, visibility, lighting and materials.

## Existing architecture: retain and change

The analytical story spring, seven authored holds and reversible editorial/source scores already have useful ownership and settlement contracts. Keep them. Their purpose is narrative response, while inspection is a user-directed task.

The current controller sends every input patch to all listeners and updates foreground styles/protected rectangles on its frame tick. A modal drag must not turn that into two loops or redundant story-layout work. Branch the existing tick by the active mode: advance the inspection response, publish its sampled values and invalidate while it is unsettled; leave the suspended story response untouched. Cache or measure only the active dialog layout when it changes. No new state-management package is required.

The current story's reduced-motion path deliberately forces a quiet whole-model composition and zero source separation. Reusing that policy inside inspection would disable meaningful controls. Inspection instead applies the user's target immediately under reduced motion or Pause. Similarly, its source visibility must not inherit Make/Validation's narrative absence, nor the story's dimmed reduced composition.

Diagnostic `__thesis.setOverrides` is not an interaction API. User controls use validated targets and a single mode-aware resolver. Generic scroll listeners, global pointer tilt and inspection drag must not write the same camera at once. Pointer capture belongs only to the explicit inspection surface; release it on pointer-up, cancellation, close, hidden state and failure.

No extra role is necessary for this scope. The parent should explicitly own interaction lifecycle and accessibility, with Motion reviewing clock/target ownership, Cinema reviewing framing, Scene reviewing lighting, and Geometry retaining source fidelity authority.

## Implemented pure API

[inspection-state.mjs](../../uiux-designer/cases/bending-active-thesis/components/inspection-state.mjs) exports:

```js
createInspectionState()
setInspectionTarget(state, patch)
resetInspectionState(state)
advanceInspection(state, dtSeconds, {reducedMotion, resumed})

INSPECTION_DEFAULTS
INSPECTION_LIMITS
INSPECTION_VIEWS
INSPECTION_PRESETS
```

The mutable state has this exact shape:

```js
{
  target: {azimuth: 30, elevation: 30, separation: 0,
           lightAzimuth: 0, preset: 'studio'},
  value:  {azimuth: 30, elevation: 30, separation: 0,
           lightAzimuth: 0, preset: 'studio'},
  velocity: {azimuth: 0, elevation: 0, separation: 0, lightAzimuth: 0},
  settled: true
}
```

Controls read semantic `target`; the scene consumes a snapshot of `value`. Angles are degrees, separation is normalized and velocities use each channel's units per second. Exported defaults, view presets and bounds are frozen; independently created states do not share mutable values.

| Channel | Bounds |
| --- | --- |
| `azimuth` | −40° to 100° |
| `elevation` | 12° to 70° |
| `separation` | 0 to 1 |
| `lightAzimuth` | −70° to 70° |
| `preset` | `studio`, `raking`, `silhouette` |

Target patches validate atomically; unknown keys, nonfinite numbers and unknown presets throw before any change. Finite numbers clamp to their bounds. A preset switches immediately. Every user command must request one controller tick even when the numeric response is already settled, so a preset-only change still renders.

Four numeric channels use one caller-owned analytical critically damped response (frequency parameter 16 per second), with normalized per-channel settlement thresholds and hard bounds. A heavy ordinary frame uses the same exact solution; a gap over one second, explicit resume or reduced motion applies the latest target immediately. Reset restores all defaults and zero velocities in one operation. No DOM access, RAF, timer, camera writes or dependency is added.

[element-score.mjs](../../uiux-designer/cases/bending-active-thesis/components/element-score.mjs) now exports `sampleSourceSeparation(weight)`. `sampleElementPose` delegates to it without changing story behavior. The shared result retains `modelRevision`, `separationWeight`, `offsets`, `boundsPadding` and `caption`:

- Shell: `[0, 0.24 × weight, 0]` metres.
- Upper base: `[0, 0.09 × weight, 0]` metres.
- Lower base: `[0, 0, 0]`.

Apply offsets from cached original positions, never cumulatively. Nonzero separation keeps “Source layers · display separation, not a construction sequence.” The original coordinates, topology, source revision and original placement remain unchanged. Manual reduced-motion selection may use any weight; the story's static mode still selects original placement.

## Lifecycle and acceptance contract

1. **Enter:** capture native scroll, focus origin, current story response and preferences. Stop narrative/pointer advancement. Open the native dialog, clear decorative pointer influence, show the inspection composition directly and schedule one frame. A delayed model load must never reopen a dialog the user already closed.
2. **Control:** ranges, named views and reset buttons provide keyboard/touch alternatives to drag. Only the inspection surface captures drag, with touch handling confined to that surface. The control value is immediate; optional camera/layer settling runs on the existing tick. Long prose and underlying page scroll remain unaffected.
3. **Idle:** when targets settle and no layout/input changes, stop requesting frames. There is no idle camera orbit, material animation or light sweep. Light quality may reduce cost but must not disable the selected inspection values.
4. **Reduced / Pause:** keep angles, layer comparison and lighting operable, applying targets immediately; do not animate entry/exit or inherit the story's fixed credits camera.
5. **Hidden / cancelled drag:** release capture, stop frames and retain the latest target. On resume, snap to that target rather than replaying hidden input/time.
6. **Return / Escape:** release capture, restore source/story settings through the one scene writer, restore saved native scroll and focus, remeasure if the viewport changed, and reset the tick timestamp. Modal elapsed time must not become a story catch-up animation. If entry occurred mid-spring, preserve the captured response and explicitly test the first restored frame and its remaining settlement.
7. **Failure:** unavailable WebGL/source or context loss must end live manipulation cleanly and preserve the source poster, evidence and ordinary reading controls. No invisible draggable surface or permanently locked page may remain.

Browser acceptance should exercise visible angle changes, named view/reset, exact original/separated positions, source-fixed light comparisons, keyboard and touch alternatives, Escape/focus/scroll return, close while dragging/loading, live reduced preference, hidden/resume, context loss, one Canvas, no additional loaded geometry, and idle/resource stability. The camera must fit the fixed maximum-separation envelope within the dialog's measured safe rectangle, including mobile controls. Pure tests do not prove those integration outcomes.

## Verification

Node **24.19.0**: **34/34 pure motion tests passed**, comprising the 27 existing response/editorial/source-layer tests and seven new inspection groups. New checks cover independent mutable state, acceleration/settlement, equal-time agreement at 3/30/60/120 Hz, reversal and hard bounds, reduced/resume/stale application, immediate preset/reset/idle behavior, atomic invalid-input rejection, and exact shared source-layer placement/captions.

No build, commit, deployment or application browser acceptance was run by this handoff. The parent owns those integration steps. Reference-site observation is research evidence, not application acceptance.
