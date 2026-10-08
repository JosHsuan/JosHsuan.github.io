# Round 03 — Foreground motion and shared scene accents

Date: 2026-10-08. Motion Designer and 3D Animation Designer handoff.

The owner authorized a richer collaborative revision of the published thesis: content and interaction should reflect the earlier applied studies, lighting and black mist should have a clear role, and the model may be deliberately cropped or absent. [Decision 0006](../../../docs/decisions/0006-public-thesis-pages.md) establishes the public presentation boundary. This handoff changes presentation code only; source geometry, publication evidence and attribution limits remain intact.

## Reading and motion direction

The earlier [applied feedback](../../uiux-designer/research/applied-feedback.md) distinguishes moving inner objects from stationary controls. It calls for short typographic planes, separate icon paths, selected-layer advance and alignment. The [UIUX plan](../../uiux-designer/UIUX_DESIGN_PLAN.md) also records that the owner's actual Saved snapshot was not captured. This revision applies the documented vocabulary; it does not claim to reproduce unseen Saved preferences.

- **Advance:** short heading lines and method rows arrive in sequence. A row's trace follows immediate native reading progress.
- **Separate:** heading lines fan sideways; media and captions move in opposing directions; glyph child paths separate. Long prose stays stationary.
- **Align:** every foreground plane rests throughout its chapter's authored camera hold. The scene may rack focus during a hold without moving those planes.
- **Return:** exit order reverses, and backward scrolling restores the exact sampled composition. There is no accumulated offset or elapsed-time reveal.

Essential text and source figures keep their ordinary document visibility. The score exports no opacity, clipping, visibility or scroll commands. Link/button hit regions remain stationary; bindings apply transforms to inner children. Press/focus feedback and the evidence inspector are controller/CSS responsibilities, with direct semantic alternatives.

## Interface

Implemented in [editorial-score.mjs](../../uiux-designer/cases/bending-active-thesis/components/editorial-score.mjs):

```js
sampleEditorialScore({
  visualU,                 // the existing single spring
  nativeU = visualU,       // immediate document reading position
  energy = 0,
  direction = 0,
  index = 0,              // chapter 0..6
  elementIndex = 0,       // index within heading-line or method-row group
  elementCount = 1,
  reducedMotion = false,  // includes the user's Pause motion preference
  light = false,
})
```

Use one call per chapter for its media/caption/glyph, and indexed calls for heading lines or method rows. The function is pure and owns no frame loop. Inputs must be finite; indices must identify a valid group. Finite progress outside 0..1 is clamped.

| Output | Meaning and binding |
| --- | --- |
| `chapterId`, `visualPhase` | Chapter identity and continuous local visual coordinate; phase may be outside 0..1 for adjacent sections. |
| `nativeProgress`, `ruleProgress` | Native local progress, clamped 0..1; immediate reading rule. |
| `entry`, `dwell`, `exit` | Bounded decorative phase weights. Every item aligns by the hold start; last item exits first. |
| `headingShift`, `lineOffset`, `lineRotate` | Heading line Y, fan X and plane rotation. Total absolute translation is at most 24 px; rotation at most 1.1°. |
| `bodyShift` | Always 0; long paragraphs do not become moving panels. |
| `mediaShift`, `mediaScale` | Evidence inner plane Y within −18..22 px, scale .982..1. |
| `captionShift` | Independent caption Y within −6..5 px. |
| `glyphSpread`, `glyphRotate` | Child-path separation within 0..8 px and rotation within ±3°. Use distinct axes for the original FORM/SYSTEM/MAKE marks. |
| `methodShift`, `methodProgress` | Row inner-plane X within −6..8 px; immediate sequential native trace. The trace is a reading aid, not measured project completion. |
| `transitionWeight` | Exactly the existing shared stage transition gate, `1 − dwellWeight`, bounded 0..1. No second remapping of stage progress. |
| `materialLift`, `lightSweep` | `energy × transitionWeight` and its signed equivalent. Optional scene accents: 0 at rest and throughout holds. |

Translations use CSS pixels, angles degrees. For each line, combine `translate(lineOffset, headingShift)` with `rotateX(lineRotate)` on one owned inner plane with a parent perspective. Do not let a CSS tween and this sampler write the same transform. If pointer response is retained, give it a separate inner parent/child and keep the semantic target fixed.

Reduced motion sets all transforms to rest immediately, while native reading indicators remain meaningful. Light retains 45% of bounded foreground travel and suppresses the optional moving light/material accents. Changing either setting must wake the existing controller once; it must not wait for a future scroll event.

## One response, unchanged source layers

[story-response.mjs](../../uiux-designer/cases/bending-active-thesis/components/story-response.mjs) now exposes the immutable `RESPONSE_CHAPTERS` table so foreground and stage use the same boundaries. Its analytical critical damping, jump/reversal handling, one-second stale threshold, explicit visibility-resume seek and settlement remain unchanged. The heavy-frame regression from Round 02 remains in the test suite.

| Chapter | Local stationary hold | Shared stage centre |
| --- | --- | --- |
| Overview | .20–.72 | .5 / 7 |
| Form | .16–.76 | 1.5 / 7 |
| System | .26–.66 | 2.5 / 7 |
| Pattern | .32–.72 | 3.5 / 7 |
| Make | .18–.80 | 4.5 / 7 |
| Validation | .12–.84 | 5.5 / 7 |
| Credits | .12–1 | 6.5 / 7 |

[element-score.mjs](../../uiux-designer/cases/bending-active-thesis/components/element-score.mjs) is unchanged. Only the known shell and upper base receive bounded rigid display offsets; the lower base stays at rest. The display rejoins at Make. Retain “Source layers · display separation, not a construction sequence” while separated. There is no fabricated bending, topology partition, assembly order or corrective source alignment.

Cinema owns the single model-presence channel. Foreground and element scores do not fade the source mesh. Scene Direction owns area lights and gallery geometry; it may consume the shared transition/energy accents once. Camera, optics, materials, background and DOM must not add independent scroll smoothers or idle clocks.

## Research consulted

Primary sources read on 2026-10-08. These are design and lifecycle references; no source code was copied and no package was added or upgraded.

- [React Three Fiber: scaling performance](https://r3f.docs.pmnd.rs/advanced/scaling-performance) explains demand rendering, explicit invalidation for imperative mutations and resource reuse. Its [GitHub render loop](https://github.com/pmndrs/react-three-fiber/blob/master/packages/fiber/src/core/loop.ts) is the primary implementation reference. Apply the existing changed-input/settling invalidation contract, then stop. Fiber's MIT licensing and the existing installed version are retained.
- [Lenis's official GitHub README](https://github.com/darkroomengineering/lenis) documents its own animation loop, interpolated scroll and live reduced-motion behavior. Lenis is MIT, but is not installed for this revision: native reading plus the established visual spring already provides the desired separation of reading and decoration. A second scroll controller would duplicate ownership here.
- [GSAP matchMedia](https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/) documents responsive setup and cleanup when media conditions change. Keep live preference changes and cleanup, using the existing controller. This score does not create GSAP timelines or ScrollTriggers; the existing GSAP Standard License is not relabeled MIT.
- [W3C: Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html) distinguishes essential native scrolling from additional motion and supports user control over nonessential animation. Preserve the live system preference and visible Pause motion control; static HTML remains readable.

## Acceptance handoff

The previous blanket “whole model inside the frame” assertion is no longer the correct artistic contract. Replace it with explicit shot expectations:

| Shot | Expected acceptance |
| --- | --- |
| Form hold | The complete shell/base relationship is visible and serves as the whole-assembly reference. Source counts, original geometry and rest transforms are unchanged. |
| System hold | The known display-layer relationship is legible, with its display-only caption. Verify the true offset bounds, not an inferred construction sequence. |
| Pattern | Intentional detail cropping is permitted and should be demonstrated by a rendered capture, not reported as a failed full-object fit. |
| Make evidence hold | Photography and captions remain visible; authored model/scene absence is permitted. Verify that absence is a scored output, not a load failure. |
| Credits | A quiet authored return is repeatable in both scroll directions; essential credits remain visible. |
| Between holds | Crop, lateral motion and absence may be intentional. Test continuity, reversal, exact final poses and source fidelity instead of universal frustum containment. |

Integrated acceptance requires actual Chromium, WebKit and 390 px touch output; native keyboard navigation and evidence-inspector Escape/focus return; live reduced motion and Light changes; no horizontal overflow; text unaffected by compositor effects; idle rendering and resources stable. Visual acceptance also calls for early/late entrance captures to demonstrate per-line/row staggering beyond neutral hold screenshots. Check caption/frame opposite motion and glyph path separation on visible elements. Inspectable numbers alone do not establish visible quality.

## Verification completed in this handoff

Ran Node **24.19.0** directly against the three pure suites: **27/27 passed** (11 response, 6 source-layer, 10 editorial). New coverage includes native/visual independence, stagger and reversed exits, all seven exact holds, shared transition accents, reversible sampling, bounded output across chapters/groups/jumps, reduced/Light behavior, smooth endpoints, post-jump settlement and invalid input. A floating-point endpoint overshoot found by the exhaustive bounded-output check was clamped before the passing run.

These tests verify score behavior, not completed browser integration or final visual acceptance. The parent owns binding, clean public build, browser acceptance, categorized commits, push and deployment. No build, commit or deployment was run by this motion handoff.

## First integrated visual critique

Viewed the actual 1440 × 1000 desktop contact sheet and full-resolution Form, System, Pattern, Credits, System exit, Pattern exit and Make exit captures under `case/verification/round03/` (capture report started 2026-10-08T11:38:34Z). The opening crop, complete Form reference, enlarged detail, photographic absence and quiet return create distinct compositional beats. These captures show no foreground panel collision, but they are still images and do not establish temporal acceleration or perceptible stagger.

Reported concrete refinements to the responsible roles:

1. System's caption crosses the bright mesh; Pattern has a similar weaker contrast problem. A local caption reading surface is needed because compositor protection prevents processing but does not guarantee background contrast.
2. The broad apron dominates Form, Credits and Make exit as a bright disc. Lower its luminance/edge contrast so the actual source base and documentary evidence carry the scene.
3. System's evidence strip masks much of the separated geometry. A modest reframing that exposes the true shell/base gap would better support the display-separation caption, without restoring a universal full-object fit rule.
4. Initial CSS moved the media anchor and the entire method list item. The parent accepted moving those transforms to inner content, differentiating the three glyph axes and respecting Pause motion in the inspector entrance. Final binding/visual verification remains the parent's integration gate.

Method disclosures explain published research steps; they are not simulation controls. Claim the relevant implemented feedback—typographic planes, glyph decomposition, source-layer display, native method disclosure and source/crop inspection—rather than all 19 research specimens.

## Public browser regression handoff

Added [motion-feedback.spec.mjs](../../../tests/pages/motion-feedback.spec.mjs) with two grouped behavioral tests: native reading progress before shared visual settlement, idle rendering, forward/reverse navigation with the same Canvas and exact source transforms on return; and actual media/method inner movement inside stationary hit regions, followed by Pause and live reduced-motion checks including inspector entrance. Element bounds are measured against their native figure/list rather than the viewport, preserving legitimate page flow. Rendering waits are bounded at 30 seconds for software GPU environments.

Final public built-artifact execution completed on 2026-10-08: **6/6 motion checks passed**, with both grouped tests passing in Chromium, WebKit and mobile Chromium. The parent reported the complete public Playwright suite as **18/18 passed** (six checks per browser profile), including the separate dialog content, source-count, Light and authored-absence coverage. Syntax validation and discovery had also passed before execution. This motion handoff records that completed run without rerunning browsers; mobile coverage is browser emulation, not a physical-device performance benchmark.
