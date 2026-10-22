# Three-case narrative refinement

22 October 2026. Candidate based on published `86a6ce5`; source implementation
only. Build, exact-artifact browser and retained visual acceptance are pending.
See [site-wide coverage](PORTFOLIO_SITEWIDE_COVERAGE.md). This slice does not reopen
accepted Mode/s, Entrance or HC narrative changes, or alter the shared glass and
scroll-camera implementations.

## Evidence and reader gaps

The current `release/project-studies.json`, `components/ProjectCaseStudy.jsx`,
`components/project-study-media.mjs` and `components/project-study-layout.mjs`
are the implementation evidence. `projectStudyEvidence` excludes every primary
background source and duplicate supporting photograph. Consequently, a diagram
listed first in a model chapter does not become an independently readable
foreground plate. Making that causal evidence accessible is the main change;
this is not a new visual-effect or asset-generation project.

Actual original public WebP plates inspected in this pass:
- Dot: `parameter-study.webp`, `path-strategies.webp`.
- Special: `module-aggregation.webp`, `planning-workflow.webp`.
- Caschlatsch: `portfolio-voxel-framework.webp`, `portfolio-module-infill.webp`,
  `portfolio-xr-assembly-sequence.webp`, `portfolio-timber-model.webp`,
  `portfolio-xr-workshop.webp`.

These files remain under `release/public/assets/projects/<case>/` with their
original bytes. Source resolution/softness is not repaired with invented detail.
The historical scratch audit was at `/workspace/shared/NARRATIVE_PHASE_AUDIT.md`;
it is not present in the current cloud filesystem. This record reconstructs only
the necessary current gaps from repository evidence, not a purported copy of
that missing historical document.

| Case | Reader question and source evidence | Minimal sequence correction |
| --- | --- | --- |
| Dot-Based 3D Printing | How does a path change the deposited texture? Fig.7-05 pairs three path rows with actual rings/bead close-ups. The point source is a path sample, not the finished object. | Preserve Context → System → Making → Results. Explain path-to-bead comparison, then cross-form experiments, physical nozzle recording and prototype family. Do not rank settings or imply every source records the same operation. |
| Special Assemblies | How does one module lead to the next, and then to a robot plan? Fig.6-06/07 show create/next-module relations and NE/NW/SE/SW; Fig.6-04/05 show JSON planning, simulation and failure-index replanning. | Preserve chapter order. Make module rules visible before planning; distinguish the trajectory plate, simulation, source assembly model and physical photographs. Do not infer collision-free execution or verified per-part chronology. |
| Project Caschlatsch | How does the digital system support a person assembling a timber module? The five-class framework and infill plate explain geometry; Fig.2-08 shows module/beam tasks. | Keep the five existing chapters. Shorten System to three paragraphs retaining all five classes, 26 directions and occupied-voxel contribution. XR begins with module/beam/sequence tasks, then interface support, then CAD/cloud exchange. Keep the individual's contribution within the collective project. |

## Exact data-only mapping

No new schema, JSX, CSS, runtime, model, camera, media encoding or dependencies.
Four reused primary records free the original diagrams for the existing native
foreground renderer:

| Chapter | Primary source after change | Complete foreground evidence, in order |
| --- | --- | --- |
| Dot / System | Unchanged model poster (`hero.webp`) | `path-strategies.webp`, `form-development.webp` |
| Special / System | Unchanged model poster (`hero.webp`) | `module-aggregation.webp`, `planning-workflow.webp` |
| Caschlatsch / System | Unchanged architectural model photograph (`portfolio-timber-model.webp`) | `portfolio-voxel-framework.webp`, `portfolio-module-infill.webp` |
| Caschlatsch / XR guidance | Existing Making photograph (`portfolio-xr-workshop.webp`) | `portfolio-xr-assembly-sequence.webp`, `portfolio-xr-interface.webp`, `portfolio-xr-data-exchange.webp` |

The reused photographs remain background-owned, not duplicate foreground images.
Special's existing Making trajectory plate remains foreground beside its
simulation. Add `purpose: "diagram"` only to Dot's path-strategies and Special's
module-aggregation, planning-workflow and robot-trajectories records, so the
existing technical-plate layout provides a complete row rather than pairing
small technical lettering. Caschlatsch's diagrams already have this role.

All original image dimensions, source URLs, alternative text, captions and
credits are unchanged. All existing image records remain selected. Hero,
model (including views, path and chapter interval), motionMedia, sourceNote,
related links and credits are unchanged. Chapter IDs, order, labels and kinds
remain unchanged; the other three generic cases are structurally identical.
Chapter-media placements increase from 43 to 47. The chapter-only unique set
becomes 43 because the three reused hero records previously lived outside that
set; the full selected source inventory gains no new asset.

## Acceptance boundary

Local JSON protection checks passed: all non-section fields, chapter identity,
other cases and original image fields except the four approved purpose tags are
unchanged. The actual evidence helper produces the foreground lists above.
`git diff --check` passes. These are source checks, not rendered acceptance.

The independent reviewer owns focused protection and browser tests. Required
acceptance includes loaded complete foreground plates and original full-image
links/credits on desktop and mobile, no-JS/reduced reading, natural wrapping and
source aspect preservation. Retain actual captures of these evidence bands,
not just introductory cards. Preserve continuous model ownership, original
recording/simulation distinctions, source hashes, camera and media timing, and
shared Pause/focus/forced-colors policies. No static screenshot alone proves
motion, field performance or a physical engineering result.
