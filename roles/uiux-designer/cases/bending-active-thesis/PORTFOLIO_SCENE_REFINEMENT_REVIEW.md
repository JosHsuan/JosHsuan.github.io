# Six-project scene and source composition review

Date: 20 October 2026 (Europe/Berlin).

Status: independent Scene Designer review and implementation handoff. These
values resolve the UI/UX proposal's aperture questions; native integrated
acceptance remains pending. This review changes no renderer, source asset or
camera recipe. It is one of the twelve required role contributions.

## Evidence and responsibility

Reviewed root/role instructions, decisions 0001 and 0019, the refinement
integration and team review, the UI/UX refinement design, architecture Sections
07–09, website layout/motion guidance, and the existing `scene-direction` skill
and source-staging contract. Actual code reviewed: `ProjectCaseStudy`, its CSS,
the evidence selector, `ProjectStudyChrome`, the shared masthead/rail CSS,
`ProjectCaseStudyStage`, `ProjectStudyScenePresenter`,
`ProjectStudyBackdropPresenter` and `project-study-scene.mjs`.

Actual image review covered the preceding release's desktop Mode/s overview and
mobile Caschlatsch XR reading capture, the Entrance portrait hero, and the new
original-portfolio voxel framework, module infill, XR interface and XR assembly
sequence extracts. The old Caschlatsch capture demonstrates an existing layout
problem, not acceptance of the rejected workflow source. Source-image review
does not prove browser layout or native interaction. Per the Director's work
allocation this role did not launch a browser, build or GPU capture.

The scene responsibility is negative space, source aperture, document/source
relationship and truthful setting. Camera, source geometry, lighting and
material appearance remain with their current owners. No new backdrop
architecture, plinth, simulated process or photo grade is proposed.

## Resolved generic composition contract

Keep the current shared atmosphere, OCR body, Space Grotesk headings, reading
glass and quiet controls. The actual evidence supplies the page identity.
Use a pure policy helper to emit these discrete facts on each generic chapter:

| Attribute | Values | Selection rule |
| --- | --- | --- |
| `data-study-composition` | `opening`, `model`, `recording`, `documentary`, `closing` | Overview, credits, reviewed motion, eligible model, remaining source, in that precedence. |
| `data-study-layout` | `split`, `broad`, `reading` | Opening/model and portrait documentary split; recording and wide or technical documentary broad; closing reading. All stack below 800px. |
| `data-study-source-shape` | `portrait`, `balanced`, `wide` | Actual active source ratio: below 0.85, below 1.65, otherwise wide. Use motion dimensions when present. |
| `data-study-source-role` | `photograph`, `technical-plate`, `recording`, `simulation`, `model` | Truthful authored source purpose, not an inference from a filename. Technical plates take broad layout even when their ratio is balanced. |
| `data-study-reading-density` | `normal`, `extended` | At least four paragraphs is extended; the policy changes reading width/spacing, never the scene clock or source identity. |

These names are a handoff, not a second schema requirement: the implementer may
use equivalent CSS Module classes if the same facts have one pure owner. Source
selection continues through the existing evidence selector and source
transaction. Do not display a second copy of the active primary source inside
the information layer.

The native chapter's canonical hash should resolve to its composition entry,
before its source-first aperture. Currently IDs sit on headings inside prose;
after moving broad prose below the source, jumping directly to those headings
would skip the intended source passage. Preserve the published hash and heading
association while giving native anchors and the shared selection owner the same
entry point. This is a layout/navigation correction, not permission for scroll
hijacking or a second midpoint threshold.

## Concrete apertures and spacing

Use `svh` for native flow reservation and `dvh` only where the fixed renderer
already follows the visible viewport. Keep `contain`, unchanged aspect and
normal blending for every primary photograph/recording. The aperture is a safe
rectangle; content may letterbox inside it. Never stretch an image to fill it.

| Source/layout | Desktop, width at least 800px | Narrow, width below 800px |
| --- | --- | --- |
| Model | Existing renderer rectangle: center 73.5%/53%, width 51%, height 78%; left edge 48%, top 14%, right 99%, bottom 92%. | Existing rectangle: center 50%/42%, width 94%, height 45%; left 3%, top 19.5%, right 97%, bottom 64.5%. |
| Split opening / portrait documentary | Primary image frame left 51%, right 6vw, top `max(7rem, 14svh)`; height limited by the lower safe edge. Narrative remains in columns 1–5 with 35rem maximum. Portrait content uses the full safe height, with empty side space. | Identity/prose first for opening, source first for documentary. Inline margins 1.25–1.5rem. Use the safe source rectangle below; preserve the portrait's full frame. |
| Broad recording / documentary | Left and right 8vw; top `max(7rem, 14svh)`; maximum height 64svh, additionally limited by `100svh - top - 6rem`. Caption maximum 42rem; subsequent prose maximum 50rem. | Left/right 1.25rem; top `max(8.5rem, 16svh)`; maximum height 52svh, additionally limited by `100svh - top - 7rem`. Source aperture, caption, then narrative. |
| Closing | Reading block only, maximum 50rem, no empty source companion or screen-height minimum. | Content-driven block, same normal reading margins and bottom safe space. |

The desktop right inset of 8vw deliberately leaves room for the numbered rail.
At 800–1100px retain the existing desktop model recipe but constrain the split
prose to its available left column; do not let the old tablet `1/7` column span
cross the model's 48% left edge. Broad composition already stacks source and
story and needs no intermediate model-camera adjustment.

**Align generic layout at 800px.** The renderer checks `width < 800`; the old
generic CSS switches only at 780px. The interval 781–799px therefore has a narrow
model projection under desktop prose. Use `max-width:799px` and
`min-width:800px` for this generic composition. Shared Bending/XR chrome need not
be changed to do so.

Remove the blanket 116svh chapter minimum, 90/82svh visual minimum and 70/80/62svh
ready-state padding. Replace them with one explicit aperture reservation in the
source slot, immediately followed by its caption. Account for the chapter's
own top safe padding once, not both in top padding and another full viewport.
The fixed source rectangle and the corresponding native spacer must agree at
the chapter entry; inspect that relationship in the built artifact rather than
assuming a CSS height alone proves it. A source-only dwell is intentional, an
extra screen of blank padding after a short caption is not.

Use a 1.5rem caption-to-story gap on narrow screens, 2rem on broad desktop, and
ordinary content height for long reading. Keep source caption/credit/full-image
link and native playback actions in one group. Source plates must not sit
between a paragraph's beginning and its continuation. Support figures remain
in ordinary flow after their narrative with a 2.5–3rem gap.

For low-height landscape screens, preserve safe top/bottom controls and permit
native scrolling. Reduce decorative blank reservation if necessary; do not
reduce body text, clip authored labels or change the model camera to make a
whole chapter fit into a screenshot.

## Per-project staging handoff

| Project | Opening and spatial passages | Process, evidence and resolution |
| --- | --- | --- |
| Mode/s of Making | Opening identifies the original unit/system. Context/System retain the existing model rectangle and continuous model interval. | Making's simulation and Fabrication/Cutting's real recordings use broad contained apertures. Visible captions distinguish their meaning. Results is a shorter documentary passage, not another film-height spacer. |
| Entrance Installation Art | The 2400×3200 opening keeps the complete portrait source, without forcing landscape crop. Context/System keep the verified model fit and discoverable inspection. | Wide fabrication drawing uses broad technical-plate layout. Completed 540×960 night recording takes the full safe vertical aperture with side negative space and adjacent pause/status. Its original full frame supplies the static fallback. |
| Dot-Based 3D Printing | Opening gives the physical study room; Context's parameter graphic takes a broad technical plate, not a narrow side tile. System keeps the actual source-point model. | Close-up deposition uses the movie's actual 2500×1304 shape, then caption and prose. Physical samples return to a compact documentary composition with supporting detail once. No new particle simulation or material appearance. |
| HC3DP Caustics | Context/System retain the actual geometry/path model and existing source camera. | Making is a near-square recorded path, 2308×2500; derive shape from this active movie, not an adjacent landscape photograph. Preserve the complete path frame. Results' observed light and failure samples stay documentary, with unchanged source color. |
| Special Assemblies | Context/System retain reciprocal-module geometry, viewpoint and real point of inspection. | The 2508×1268 robot simulation gets broad composition despite its 1542×1375 documentary poster alternative. Hold the real finite ending. Results presents physical prototype and supporting detail without invented part separation. |
| Project Caschlatsch | Use only the new portfolio-selected active imagery. There is no eligible public 3D model, so no inspection affordance. | System's voxel framework and infill are technical plates. XR's interface, assembly sequence and data exchange are complete original figures, not interactive phone mockups. Extended System/XR prose flows naturally after caption; Making/Results resolve through portfolio physical evidence. |

## Dense original figures

The inspected voxel framework is balanced in shape but dense in purpose. Its
five class areas and Fig.2-03 caption must remain intact. The XR interface has
four authored phone representations, explanatory arrows and the Fig.2-10
caption; the sequence includes both rows of phone states and its Fig.2-08
caption. They require one broad figure per row. Module infill also stays a
single complete figure; do not separate its authored comparisons into new
tiles or independently crop 5-beam/30-beam examples.

At phone width complete diagram lettering cannot all be comfortably read at
once. Preserve a clear native `View full image` link beside its caption so the
reader can inspect the original-size source using browser zoom. Do not fake
legibility with sharpening, rebuilt labels, contrast recoloring, hidden crop or
an unrequested pan/zoom widget. Photo pairs may use two columns only at desktop
width when each remains intelligible; technical plates never inherit that
two-up treatment. The Information Designer's actual source handoff determines
captions, credit and primary/supporting placement.

## Renderer and event boundary

The actual adapter computes one source-bound fit in `project-study-scene.mjs`,
uses its existing yaw/pitch/FOV/zoom values, and presents a full-viewport canvas
with the safe model rectangle above. The visible composition can change only
through native HTML/CSS source/caption/prose layout. Preserve source transforms,
geometry, UVs, appearance clones, light rig, exposure, point primitive and bounds.
No CSS aperture change should be compensated by a camera change.

Inspection help belongs adjacent to a dedicated empty source target, outside
caption links. Presenter's successful-paint, current/held-source and policy facts
decide availability. An eligible canvas alone does not prove the model is ready
to inspect. Native vertical touch scrolling, actual-hit horizontal commitment,
arrows and Home/Escape return stay with the existing scene owner.

The existing source transaction continues to own direction, prepare, exit,
entry, supersession and hold. The ordinary-page Director clock advances it;
native video owns playback time. Layout attributes contain no animation time.
Do not add a CSS crossfade, autonomous observer loop, scroll seek or another
property writer. Bending/XR source recipes and their visual result remain the
protected comparison targets for any later shared runtime refactor.

## Required native acceptance

Acceptance must cover all six pages, not a single representative chapter.
Inspect at 1440×1000, 1024×768, 800px and 799px widths, 390×844 and 320px narrow
reading. Include a low-height landscape viewport and the real portrait movie.
For each chapter inspect entry aperture, caption's last credit/link/control,
heading and final paragraph, supporting figures, then forward and reverse
boundaries. A heading-only capture cannot establish source or long-text quality.

Require an unobstructed source-reading position clear of fixed identity,
portfolio links, pause tools and rail; no horizontal page overflow; complete
source aspect and original figure labels; independent caption links and keyboard
focus. Check native anchors/direct hashes enter the source passage rather than
skip it. Test native wheel/PageDown and vertical touch, model hit/drag/arrows/
Home/Escape, recording pause/return/replay and fast reversal on the built output.

Reduced Motion, Save Data, failed media/WebGL, no JavaScript and print must give
complete source/text reading without an empty animated well. Final matched
Bending/XR desktop/mobile regression, exact CI-artifact visual review and live
review belong to the Director's release acceptance. This document makes no
claim that those pending checks passed.
