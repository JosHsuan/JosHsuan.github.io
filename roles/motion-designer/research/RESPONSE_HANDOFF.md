# Response implementation handoff

Implemented on 2026-10-08 in the local case's `components/story-response.mjs`. This module does not import React, bind a scene, transform document content or start a clock. The parent controller remains its sole owner.

```js
const response = createResponseState(initialNativeU);
advanceResponse(response, nativeU, dtSeconds, { reducedMotion, resumed });
const score = sampleResponseScore(response.visualU);
// Consumers receive {...response, ...score}; native reading state uses nativeU.
// Request another controller frame only for changed input, active pointer,
// or !response.settled. Reset the previous timestamp when this loop stops.
```

On the first fresh input after idle, use an ordinary initial delta such as 1/60 second; do not interpret the idle wall-clock gap as animation time. A genuinely stale delta greater than one second, explicit resume or reduced-motion request seeks to current native position with zero velocity/energy. Ordinary heavy render frames still use the exact analytical solution. The scene binding separately selects the useful reduced-motion whole-object composition.

The critical spring uses omega 12.5 per second. State values include immediate `nativeU`, damped `visualU`, normalized-progress velocity per second, bounded `energy`, direction -1/0/1 and `settled`. Ordinary reversal preserves momentum and brakes before changing direction. A jump rebases within 1.5 chapters and resets inherited velocity. The state snaps exactly to the target below position error 0.00002 and speed 0.0001. An observed 0.4 to 0.56 step settles in 60 frames / one second at 60 Hz.

Score output is `{stageU, chapterId, localPhase, dwellWeight}`. Camera, lighting and source element score plateaus are `(index + .5) / 7`, agreed with Cinema and Lighting. Quintic interpolation spans the full adjacent exit/entry and does not stop again at chapter boundaries. `stageU` has a normalized 0–1 domain; endpoint poses stay at .5/7 and 6.5/7. Apply no second dwell or spring to these outputs. `localPhase` derives from visualU, allowing an explicitly authored focus shift while camera pose holds.

Run `node --test roles/uiux-designer/cases/bending-active-thesis/tests/story-response.test.mjs`. Eleven tests pass: perceptible onset acceleration/deceleration; 30/60/120 Hz consistency through target changes; momentum reversal; 316 ms heavy-frame deceleration; analytical consistency down to 3 Hz; jump bounds; exact idle settlement; reduced/resume/stale seeking; invalid input containment; agreement with all seven authored holds; and smooth reversible transitions across chapter boundaries. The heavy-frame checks were added after the actual Full 2x MSAA browser trace revealed that the original 250 ms stale threshold skipped deceleration during an ordinary render stall. Actual rendered optics, feedback and reading behavior require the integrated browser review.
