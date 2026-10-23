# Adaptive delivery — bounded qualification, not release

23 October 2026. Main/live baseline: `ce12d682`. The owner accepted the bounded
rescue-quality tradeoff for full validation; deployment is not accepted here.

## Policy and preservation

The initial STANDARD pixel budget remains 1,600,000. This is not the earlier
isolated 921,600-cap experiment. After the existing two-second warmup, three
consecutive eligible delivered-frame intervals in the inclusive 500–5000 ms
range can advance **one** existing step: 1 → .8 → .65 → .5. Each decision clears
observations and starts another two-second warmup. A shorter interval clears the
severe streak; a gap above five seconds resets observations instead of counting
as rendering pressure. Existing sustained-delivery observation remains in place.
TOUCH retains its legacy behavior; the severe branch is STANDARD-only.

This observer adds no clock or source simplification. Original geometry, source
bytes, materials, authored cameras, independent idle and full-source access are
retained. A density stage is monotonic for its pressure-instance lifetime:
Pause, hidden/ineligible state and resize clear statistics, not the achieved
stage. Restoration requires pressure-instance recreation; do not promise automatic
quality recovery when load falls or the visitor resumes.

## Actual affected qualification

- `155a0a4`: 12/12 announcement scenarios passed across three profiles, with the
  original 60-second test budgets. Actual Full → native Pause → source-comparison
  behavior is exercised, not a Reduced substitute or debug clock fixture.
- `a15c09b`: 27/27 representation scenarios passed. Chromium's eleven receipt rows
  reached stage 3 / .5, backing 720×500; WebKit's eleven remained stage 1 / .8,
  backing 1214×843; mobile's eleven used legacy stage 2, backing 316×685.
- Three Overview originals and twelve System originals were actually inspected.
  Overview `155` Chromium reached stage 3 / .5; WebKit and mobile remained stage 1.
  Desktop Overview extends outside the right/bottom capture and behind the intro
  card, so those captures do not certify its complete silhouette or no cropping.
- All four System representations at the actual Chromium floor remain fully
  framed, distinct and recognizable: origami edge network, opening surface,
  bending form and authored curvature colors. Main openings remain discernible;
  native prose, source labels, navigation and Pause remain readable. Fine bending
  joints/highlights are soft or merged, and tiny opening slits cannot be reliably
  read individually. This supports a rescue floor, not precise visual inspection.
- WebKit stage-1 and mobile legacy-stage-2 System captures retain complete model
  framing and recognizable representations. Mobile native-card lower keyboard
  guidance falls behind/outside the bottom rail in this capture; it is not proof
  that the entire card is simultaneously visible.

Evidence archives: `/workspace/shared/ci-evidence-archive/bending-adaptive-qualification-155a0a4/`
and `/workspace/shared/ci-evidence-archive/bending-representation-a15c09b/`.
These external retained artifacts are not published runtime assets.

## Interpretation limits and remaining gate

Native captures have different poses, timings and independently evolving pageField
backgrounds. Even the earlier diagnostic same-3D-pose fixture did **not** freeze
the independent pageField raster. Darker warm background or changes through holes
are therefore not density-causation evidence; transparent edges/highlights can
also be affected by compositing. The earlier observation must not be reused as
proof of pixel-budget-only quality loss or visual equivalence.

No physical hardware, GPU timing or FPS guarantee is established. SwiftShader
qualification and a prior single timing pair are not a causal field benchmark.
Original geometry/source tests do not establish that every fine feature remains
visually resolved. Full 504-public + 24-framework exact-candidate validation,
independent review and same-artifact publication acceptance remain pending.
