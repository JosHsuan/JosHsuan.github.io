# Shared response contract — Round 02

Status: the pure response module and eleven numerical checks are implemented, including the heavy-frame issue found during browser integration. Perceptual acceptance remains separate. Read the exact [integration handoff](RESPONSE_HANDOFF.md) before binding the module.

The Motion Designer owns one response state. Reading position, keyboard focus, anchors, selection and document scrolling stay native and immediate. Cinema, Lighting, 3D Animation, Compositing and UIUX consume the same visual response; none starts a second scrub/spring owner for those channels.

## Proposed API

`createResponseState(u)` creates the caller-owned mutable state. `advanceResponse(state, nativeU, dtSeconds, { reducedMotion, resumed })` returns the same object with `{ nativeU, visualU, velocity, energy, direction, settled }`. `sampleResponseScore(visualU)` returns `{ stageU, chapterId, localPhase, dwellWeight }`. Values live in a mutable controller, never per-frame React state. The closed [score catalog](../catalog/score.json) supplies chapter-specific holds.

The proposed critical spring solves a constant target analytically over a frame: let displacement `y = x - target`, `c = v + omega*y`, `e = exp(-omega*dt)`; then `x = target + (y+c*dt)*e` and `v = (v-omega*c*dt)*e`. Start with omega 12.5 per second; tune by recorded perception, not test convenience. Preserve velocity as a target changes, clamp the normalized output, and stop only when both position and velocity settle. This formula is a mathematical design proposal, not imported maath code.

If lag exceeds 1.5 chapters after a large native jump, rebase to within that bound and reset velocity. Hidden/resumed pages snap to current native position. Never replay a long hidden delta. Reduced motion chooses the useful static whole-object composition and removes decorative response.

Each chapter has unequal entry/hold/exit durations. Its plateau is `(chapterIndex + .5) / 7`. Stage mapping interpolates once across the complete previous hold-end to next hold-start interval, including their chapter boundary. The endpoint inputs stay at the first and last plateau centres. This is a visual plateau only: body content and document motion never freeze. During a hold, small residual energy may affect a decorative rim, image frame or compositing accent; it must not force semantic model changes. Cinema may score a focus transfer inside a designated hold with the same input clock.

## Channel ownership

| Channel | Consumer and boundary |
|---|---|
| nativeU | Immediate reading/chapter state; accessible progress |
| visualU | Shared reversible response; no direct document transform |
| stageU | Cinema pose/optics, source element arrangement, light score |
| energy | Bounded additive rim/decor response; zero at rest |
| direction | Reversible transition emphasis; never evidence selection |
| dwellWeight | Signals designed stillness; no scroll lock or input capture |

UIUX owns hover/focus response on icons, image surfaces, text links and metadata. CSS supplies simple affordance; pointer coordinates and source picking can influence approved decorative channels through the Compositing contract. Pointer tilt remains decorative and cannot change the story position.

## Acceptance after integration

Record actual onset acceleration and settling; compare 30/60/120 Hz wall-clock behavior; reverse mid-transition; jump across chapters; verify no idle frames after settlement. Inspect all seven holds with the real camera, source shell/base and media. Verify keyboard, touch, anchors, selection, reduced-motion live changes and visibility resume. A numerical easing test alone cannot prove an appropriate cinematic feel.
