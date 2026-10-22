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

## Affected preflight and retained visual checkpoint

Exact `70dc4ad` affected preflight passed 60/60 executions: 20 each in
Chromium, WebKit and mobile Chromium. This is not the full gate; the upcoming
483-execution public suite and final release remain pending. The preceding
`2147d16` failures exposed test assumptions, not demonstrated application fixes:
caption scroll extents included the existing clipped decorative skin overscan;
tests now measure actual caption text bounds independently. Reused physical
background-source identity is checked without assuming one DOM host per chapter.

All 30 retained figure PNGs (10 sources per profile) were actually inspected:
- Chromium: archive `narrative-70dc4ad/12459527442/files`.
- WebKit: archive `narrative-70dc4ad/12460310328/files`.
- Mobile Chromium: archive `narrative-70dc4ad/12459503009/files`.

Within those captures the original plates retain source extent, proportions,
figure labels and intended technical full-width layout. Captions wrap normally,
without the hypothesized 23px text overflow. No new source crop or application
layout blocker was identified. WebKit's stronger background translucency remains
visible, with the captured caption text still distinguishable.

These are reduced/static reading captures, not nonzero glass-motion or hardware
performance evidence. A full-figure element capture can include fixed navigation,
Pause, the focused skip link or the chapter rail crossing the pictured source at
that scroll position. Desktop tall plates therefore do not prove every original
label is simultaneously unobscured. Mobile shows complete source plates, but
only 8/10 HTML captions/credits are fully visible in the current images: the
Caschlatsch XR data-exchange caption/credit and the Special module-aggregation
credit have portions behind the fixed bottom rail. This is an explicit capture
limit, not evidence that native scrolling cannot reveal them. The next full gate
will retain additional native-centered caption captures, without hiding chrome
or changing application layout, to close that evidence gap.

Dense original raster lettering remains small/soft, particularly at 390px.
Complete aspect preservation does not establish that every embedded label is
legible inline. Native captions and original full-image links remain necessary
for orientation and detailed reading; no invented sharpening, labels, measured
performance or physical research outcomes are inferred from these screenshots.
