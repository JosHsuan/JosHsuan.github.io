# Mode/s narrative and mobile source-column refinement

21 October 2026. Base: deployed `54499ce60faa7518dba9df807bb3a9382efb1113`.
Status: implemented candidate; independent source review and desktop fallback preview accepted. Exact CI/mobile rendered acceptance remains pending.
Scope: Mode/s only. This does not implement the separate six-case audit wholesale.

## Narrative decision

The owner requested other case narratives as fluent as Bending, authorizing
source-based media, vector and illustrative3D improvements where they help.
The first bounded change addresses a causal gap rather than adding another
animation: the former ending returned to a workflow diagram after two similarly
framed cutting chapters. The System text discussed CoreXY while the persistent
model still showed the unit assembly.

New sequence (stable IDs retained):

| ID | Question / evidence duty | Source treatment |
| --- | --- | --- |
| overview | What could the unit become? | Existing digital assembly hero and factual introduction |
| context | What is the unit being made? | Existing unit geometry/model |
| system | How does that geometry reach the machine? | Same unit/model plus visible original design-to-code workflow |
| making | How do tool and blank move together? | Existing whole-machine simulation, rotary-area and CoreXY diagrams |
| cutting | What does the built prototype actually do? | Existing wide physical operation recording |
| fabrication | What happens at material contact? | Existing close physical cutting recording |
| results | How does making inform the assembly proposition? | Return to original digital assembly image, explicitly not evidence of a completed built assembly |
| credits | Who did the work? | Existing credits/source note unchanged |

The `film-design-workflow.webp` image is **secondary evidence** in System. Making
it the primary would allow the active3D model to obscure the explanation while
the existing background-source deduplication also removed it from foreground
support. `film-corexy-system.webp` now supports Making. Results intentionally
returns to the existing hero rather than fabricating a new finished-object photo.

All three motion IDs/chapter assignments, bytes, timing and simulation/recording
classifications remain unchanged. Model geometry, source hash, context/system
participation interval and all camera views remain unchanged. No original asset,
other project, Bending or XR story changed.

## Mobile composition

The verified mobile capture showed the original white source extending beyond
both sides of the translucent reading panel: source inset20px, panel inset24px.
For Mode/s only below800px, source frame edges now align1px inside the reading
column:25px normally and21px at widths up to360px. The original image remains
`object-fit:contain` with full proportions and original white background. There
is no crop, recoloring, opacity rewrite, clipping of source content, new runtime
clock or removal of native fallback. Source visibility through the intended
translucent material is not claimed eliminated; the protruding external rails
are the specific defect addressed.

## Verification

- `tests/ci/modes-narrative.test.mjs`:3checks pass for causal order, actually
  visible workflow/CoreXY evidence, continuous model/views and exact motion identities.
- Independent before/after JSON comparison: other five cases, Mode/s model,
  motion records and credits are unchanged.
- Syntax, scoped ESLint and `git diff --check` pass.
- `tests/pages/modes-narrative.spec.mjs`: added rendered coverage for order,
  supporting evidence and truthful digital closing;390/360/320px source-column
  containment, full contain-fit, decoded image and no horizontal overflow.
  Saves an actual390px screenshot to the CI output directory for review.
- Existing full no-JS/reduced-motion, source pins, media transport, continuous
  3D, lifecycle, typography and native navigation acceptance still applies.

Build, final browser results, captured before/after pixels, independent review
and exact-artifact deployment must be recorded by integration. Focused source
passes do not establish rendered/mobile acceptance or publication.

## Candidate acceptance checkpoint — 2026-10-21

Independent source review reported no blockers. Integration reports production
build/public audit passed (257 files, 136 assets), portable checks 582 passed /
2 skipped, and lint/diff checks passed. The scoped browser inventory includes
393 tests across 24 files; this is selection, not a claim of a completed CI run.

Native cloud preview of the rebuilt artifact at 1180 × 757 verified:
- Profile-to-path text presents the unit-to-workflow connection; the original
  design-to-code plate decodes and is visibly available as full-width support.
- Tool-and-blank presents the whole-machine simulation, then the rotary-area
  and CoreXY plates side by side with their original source captions intact.
- Assembly-study returns to the digital assembly image; the explicit limitation
  about no proven completed physical assembly is present in rendered DOM.
- Updated rail labels and chapter navigation work; no horizontal page overflow.

This browser has WebGL disabled: these observations establish native/fallback
presentation only, not live 3D continuity. Exact 390/360/320px geometry and the
390px screenshot comparison are pending permitted CI mobile environments.
No denied DevTools emulation route was retried. No deployment is claimed.
