# Portfolio refinement: team direction and review

Date: 20 October 2026 (Europe/Berlin).

Status: all twelve existing roles have completed distinct independent review
and handoffs; integrated native design, senior refactor and release acceptance
remain pending.
The owner's current six-part request authorizes corrected Caschlatsch portfolio
imagery, short web-ready Mode/s recordings, six-project visual and interaction
refactoring, senior runtime review, an architecture-led root README, and
same-artifact CI-gated publication. The integration contract and decision for
this request govern implementation. The initial Director findings below remain
the historical starting checkpoint; the updated participation matrix records
actual subsequent work without claiming browser/performance or release acceptance.

## Review basis and boundaries

The director read the repository instructions, empty-framework decision,
architecture Sections 08–09, website design guidance, all twelve existing role
instructions/briefs where present, and their role README responsibilities. The
existing `experience-direction` skill and layer/story contract provide the
review method. This is an actual independent Director review; reading another
role's brief is not that role's independent participation.

Current code inspected includes `ProjectCaseStudy`, its CSS and discrete
controls, `ProjectStudyChrome`, `ProjectCaseStudyStage`, the source-evidence
selector, `SiteBackgroundDriver`, `HomeScrollPresenter`,
`InformationWindowPresenter`, and the project backdrop/scene presenters. XR's
component and CSS provide a comparison for composition and common chrome.
The director inspected the prior release's actual `7ff67ce` native desktop
Mode/s overview, mobile Caschlatsch XR chapter, and mobile physical-recording
aperture captures. Older six-project imagery is historical orientation only;
it is not a current six-page visual acceptance record.

The six pages in scope are Mode/s of Making, Entrance Installation Art,
Dot-Based 3D Printing, HC3DP Caustics, Special Assemblies and Project
Caschlatsch. Bending-Active and XR are protected visual references, not
redesign targets. Their source geometry, camera/material/light recipes and
approved presentation remain. Shared runtime changes require their matched
regression checks. The reusable `src` framework remains empty.

Correct source material precedes the six-page visual implementation. Parallel
source review and design research do not authorize accepting layouts against
temporary or rejected imagery.

## Director findings and required implementation

D01–D08 record the initial pre-refinement implementation and required outcomes.
They are retained rather than rewritten as if the new source/design handoffs
had already passed native acceptance. Current role results follow below.

| ID | Evidence in current implementation | Consequence | Required change and acceptance |
| --- | --- | --- | --- |
| D01 | Generic CSS uses the same 12-column, left prose/right source arrangement for every chapter; `chapterInner` has a 116svh minimum, `visualSlot` 90svh, and ready-state source slots add 70/80svh padding. XR varies opening, narrative, physical and concluding compositions. | Source dimensions, narrative length and task meaning do not determine pacing. | Introduce a small explicit generic composition policy for opening, model, recording, documentary and concluding reading chapters. Use source aspect and actual reading content; do not add arbitrary per-project overrides or six identical viewport cards. Inspect every chapter and its boundary on all six pages. |
| D02 | On mobile the generic slot is at least 82svh, with 62svh ready-state padding; DOM order is visual/caption before narrative. | Long caption and long prose sequences can create excessive separation from the source they explain. A heading-only capture does not prove a source is readable. | Keep an unobstructed source-first aperture and a coherent caption-to-story continuation, with content-driven heights. Verify both source aperture and prose reading positions, then native forward and reverse movement between them. |
| D03 | The current Caschlatsch XR chapter uses the same conceptual `workflow.webp` background as the system chapter. The owner rejects that source choice. | The claimed original XR interface and voxel/beam logic are not visually evidenced by the current conceptual substitute. | Replace active placements with the corresponding original portfolio materials, including the XR assembly material. Remove the rejected Design/fabrication/assembly graphic from presentation. Preserve original authored labels, dimensions, proportions and source credit. Information Designer owns source selection and extraction. |
| D04 | Generic primary media, caption surfaces and prose are separate; the prior mobile Caschlatsch capture places a bright source behind the long foreground prose while fixed chrome overlaps the upper/lower reading area. | The image and prose are individually present, but their intermediate composition needs review. | Keep source pixels unaltered. Adjust generic layout/aperture and reading-safe spacing so headings, focused controls and complete paragraphs have an available readable position clear of chrome. Review bright-white diagrams as well as dark photographs; do not use image recolouring as a readability fix. |
| D05 | Every model slot is focusable and describes drag/arrow inspection in an accessible label, but the visible text mainly describes the object. The scene presenter already supports actual-hit dragging, horizontal touch commitment, arrows and Home/Escape return. | Sighted keyboard and touch readers have limited visible discovery of useful existing interaction. | Provide a concise visible inspection hint/state only for eligible model chapters; include usable keyboard return guidance. Distinguish loading, ready, poster and paused states without pretending a failed model can be inspected. Preserve native vertical touch scrolling and document reading. |
| D06 | `ProjectCaseStudyControls.update` scans each chapter's `getBoundingClientRect()` directly on every scroll, IntersectionObserver callback, resize, hash change and pageshow. The site driver separately owns measurements, source transactions and scheduled frame work. | Chapter selection and presentation have separate event/measurement pathways, making event closure and layout cost harder to reason about. | Give generic native-chapter measurement/selection one lifecycle owner and publish a single semantic result to navigation, counter and source intent. Preserve immediate native reading, current midpoint semantics, deep links, late layout changes and BFCache restoration. Do not introduce a second frame loop or a general global event bus. |
| D07 | The current Mode/s physical sources are 10.01s/75.97MB and 20.88s/43.86MB; the existing native media owner already provides preload-none, policy fallback, playback control and source teardown. | Correct footage is too expensive for a portfolio background. | Replace active web derivatives with clear real-operation excerpts of at most 8–10s and measured compact web encodes. Retain original files read-only and explicit lossy provenance. Inspect decoded source/output frames, native timeline, first-frame latency, byte sizes and browser playback. Do not substitute diagrams or label compressed output pixel-identical. |
| D08 | The current source transaction already owns exit, prepare, enter and hold, with supersession history, native-video transport facts, policy fallback and one active source. | This is valuable working infrastructure, not a reason to replace the entire renderer. | Retain this ownership. Extend tests around actual events and visual continuity where the refactor changes boundaries; keep one playing recording, no scroll-seek, no late stale-source upgrade and no idle controller work after settling. |

The intended aesthetic is the existing cinematic engineering editorial system:
large truthful source material, clear heading hierarchy, disciplined negative
space, restrained glass information and quiet controls. Reusing Bending/XR
materials is necessary but insufficient: every chapter must form a designed
relationship between source, explanation and available interaction. Source
photos, diagrams and footage remain documentary evidence rather than decorative
textures.

## Per-project direction

| Page | Chapter-specific design work | Interaction and source acceptance |
| --- | --- | --- |
| Mode/s of Making | Give the opening a clear unit/system identity; let the actual 3D system, simulation and physical cutting read as distinct stages. Keep the two real-operation excerpts concise. Avoid repeating the same caption/prose layout through all six middle chapters. | The simulation remains explicitly a simulation. Both physical chapters show source-backed operation, pause/replay and direct-source access; switching among all three preserves independent native media time and closes the previous play owner. |
| Entrance Installation Art | Respect the long portrait installation and engineering drawings rather than forcing both into the same landscape well. Keep fabrication support and the built night result connected to the narrative. | Original panel inspection remains discoverable where eligible. Portrait night video retains its full frame and a clear pause state; static/reduced operation still explains the finished installation. |
| Dot-Based 3D Printing | Distinguish the point-based system from close-up nozzle deposition and the physical family of experiments. Give the small path/parameter evidence enough readable area. | Preserve source points and source scale; do not turn point appearance into a new simulated material claim. Existing short deposition motion has an accessible still and native playback lifecycle. |
| HC3DP Caustics | Separate geometric/path logic, the robot-path demonstration, and photographed optical results. Use a readable complete frame for the light observations and failure samples. | Do not describe the path movie as a successful physical print or generated caustics. Inspection, caption and source links must remain usable over both bright diagrams and dark photographic evidence. |
| Special Assemblies | Make reciprocal module logic, robot simulation and physical prototype composition distinct. Pair supporting details deliberately rather than appending repeated broad galleries. | Preserve actual simulation framing and its finite end. Keep whole-source inspection separate from unverified part movement or collision-safety claims. |
| Project Caschlatsch | Use original portfolio voxel/beam and XR assembly evidence. Let extended system/XR explanations use an appropriate reading composition instead of forcing them into the short-chapter pacing of other studies. | Source reading must work without private CAD, live COMPAS or cloud access. Photographs and interface illustrations retain authored aspect, visible labels and accurate owner/team contribution. |

## Existing team participation and handoffs

All twelve rows now have actual independent role work, rather than inferred
participation from reading another role's brief. This checkpoint records review,
prepared materials, concrete implementation or a reasoned no-change decision;
it does not treat those different evidence types as integrated acceptance.
Root has integrated the first two media corrections and the scoped UI/UX and
inspection implementation, built the candidate, and is gathering native design
captures. Their completeness and visual quality have not yet been accepted.

| Existing role | Completed independent participation and handoff | Evidence and resulting implementation or decision | Remaining acceptance |
| --- | --- | --- | --- |
| experience-director | Independent source/code/prior-image review, cross-role direction and integrated native still-image peer review complete | This document's D01–D08 define the initial direction. The integrated follow-up inspected twenty unchanged native PNGs spanning desktop/mobile samples of all six generic pages; the bounded result and exact filenames are in local `design-director-peer-review.json`. Original Caschlatsch figures, portrait evidence, broad sources, model/prose separation and visible inspection guidance support the design direction. | Close the observed desktop source/current-label collision and rebuilt mobile credit safe area; complete all-chapter reading, continuous motion/native interaction and final cross-role/release evidence. |
| information-designer | Original portfolio review, derivative preparation and public-integration handoff complete | Local `caschlatsch-materials/INFORMATION_DESIGN_REVIEW.md`, source handoff and integration proposal: ten verified portfolio WebPs, full voxel/infill/XR labels, chapter placement and truthful attribution; rejected workflow/previous web photographs removed from active selection while historical pins remain. | Inspect complete original figures, source access and caption/prose continuity on the integrated desktop/mobile candidate. |
| animation-cinematographer | Source/format research, local encode comparison and compact-media handoff complete | Local `mode-video/ROLE_REVIEW.md` and `recommended-motion-replacements.json`: H264/faststart MP4; physical A 8.008s, B 8s and complete simulation 4.8s, totaling 6,841,683 bytes; honest lossy/interval/resolution records and unchanged originals. | Native first frame, advancing time, pause/return/loop and decoded full-frame visual quality across supported engines. |
| uiux-designer | Independent design and first allocated implementation complete | [UI/UX design and implementation checkpoint](PORTFOLIO_UIUX_REFINEMENT_DESIGN.md): five composition kinds, pure source/aspect/density policy, source/caption/prose ordering, canonical chapter-entry hashes, 799/800px alignment and empty model target with sibling controls; five focused policy tests pass at that checkpoint. | Every chapter's full source, caption/control ending and prose tail at desktop/intermediate/mobile widths; native navigation and protected-reference regression. |
| scene-designer | Independent source/code/prior-image review and concrete staging handoff complete | [Scene review](PORTFOLIO_SCENE_REFINEMENT_REVIEW.md): split/broad/reading apertures, fixed-renderer alignment, native-flow reservations, rail-safe margins, portrait/technical-plate treatment and no camera/source changes. | Integrated aperture versus native spacer, long reading, original-label visibility and forward/reverse boundary composition. |
| motion-designer | Independent review and allocated inspection refinement complete | [Motion implementation review](PORTFOLIO_MOTION_REFINEMENT_REVIEW.md): truthful discrete availability/help/reset, current painted-source gating, native-key exclusion, one Home/Escape/button return and focus closure; 32 related CPU tests and actual role ESLint pass at that checkpoint. Existing finite passage/damping/clock remain. | Actual hit/drag, vertical touch, arrows/return/reset focus, source-link key independence, policy and lifecycle behavior on nine eligible chapter views. |
| 3d-artist | Independent code/source/image review and reasoned no-recipe-change handoff complete | [3D Artist review](PORTFOLIO_ARTIST_REFINEMENT_REVIEW.md): retain the five distinct source appearance/primitive recipes; improve silhouette aperture and source/caption hierarchy without shader, grade, solidification or fabricated animation. | Native fine-member/point/transparent silhouette readability, source fidelity and final composition after integration. |
| lighting-designer | Independent code/source/prior-capture review and reasoned no-light-change handoff complete | [Lighting review](PORTFOLIO_LIGHTING_REFINEMENT_REVIEW.md): preserve accepted rigs/exposure/material tokens, original white plates and bright/dark footage; fix layout rather than relighting. Analytic contrast examples explicitly do not claim native contrast acceptance. | Actual composited source/reading contrast, aperture, source opacity and capability/fallback paths on the built candidate. |
| 3d-animation-designer | Independent source/code/prior-capture review and motion handoff complete | [3D Animation review](PORTFOLIO_3D_ANIMATION_REFINEMENT_REVIEW.md): retain 1.10s entry/0.95s exit, same-model interval, actual-hit commitment, finite return and independent native media time; 31 existing controller/source tests passed at its earlier checkpoint. No invented deformation or assembly order. | Native intermediate/reverse/rapid-jump continuity, real source participation, independent clip times and finite-end/replay behavior. |
| geometry-engineer | Independent actual-GLB decoding, source comparison and framing/ownership handoff complete | [Geometry review](PORTFOLIO_GEOMETRY_REFINEMENT_REVIEW.md): five protected GLBs/records and source recipes unchanged, 567 actual-bound camera-fit cases, prepared figure/media consistency checks and 28 related CPU tests at its checkpoint; retain source transforms and no new CAD conversion. | Actual render/hit/inspection coverage and complete-source reading; mathematical containment is not native visual or physical-engineering acceptance. |
| performance-engineer | Independent source/primary-reference audit and bounded measurement protocol/helper complete | [Performance review](PORTFOLIO_PERFORMANCE_REFINEMENT_REVIEW.md): identify duplicate layout/event work and secondary hypotheses; define paired native layout/task/media/idle/lifecycle measurement, overhead reporting and lab-versus-field limits. | Root-exclusive equivalent before/after measurements, attributed regressions, hidden/actual-BFCache/departure facts and final resource/idle acceptance. No native performance result is accepted yet. |
| software-architect | Separate senior independent source/primary-GitHub-reference audit and implementation plan complete | [Architecture/event review](PORTFOLIO_ARCHITECTURE_REFACTOR_REVIEW.md): map actual source/event/render owners, consolidate chapter selection on the existing demand driver, preserve lifecycle/media/source transactions, and use architecture-led README structure. | Implement after the native design checkpoint, validate measured benefit and unchanged visuals, then complete README, exact-artifact CI/deployment and live closure. |

Information Designer and Animation Cinematographer evidence paths above are
under the ignored local `animation-review/.local/portfolio-refactor-20261020/`
preparation directory. They are source-review handoffs, not public build inputs
or portable native-browser receipts. Public integration uses allowlisted asset,
study and provenance records rather than importing that directory.

The table's CPU counts belong to distinct role checkpoints and are not summed
as a final suite total. Root allocates exact implementation paths and resolves
conflicting proposals before edits. Browser/GPU acceptance and sustained
measurement retain one exclusive owner at a time.

## Acceptance needed before publication

1. Correct Caschlatsch source placements and compact Mode/s media are integrated
   and pinned first. Removed material has no active presentation reference.
   Original source files remain unchanged and provenance distinguishes excerpts,
   compression and faithful framing.
2. All six generic pages receive actual chapter-sensitive visual and interaction
   implementation. Review every chapter at desktop and portrait sizes, an
   intermediate tablet width, source apertures, long prose endings, and forward
   and reverse boundaries. Heading-only screenshots and passing source tests
   cannot establish this visual requirement.
3. Native wheel, PageDown/keyboard anchors, deep-link entry, focus, eligible model
   hit/drag and return, recording pause/replay, rapid chapter changes and true
   document departure close correctly. Hidden/BFCache, live reduced-motion,
   Save Data, failed media/WebGL and no-JavaScript reading retain meaningful
   source/text alternatives. Test media end without advancing the document.
4. Event selection, shared-clock presentation, native media time and resource
   ownership are explicit. Capture actual event histories and idle/frame facts,
   and measure built-artifact cost under a documented browser/profile. Do not
   equate resource counters with exact GPU bytes or laboratory results with
   physical-device/field performance.
5. Matched Bending/XR desktop/mobile captures and native interactions establish
   preservation after shared refactoring. Original geometry, light/material and
   camera recipes and all unaffected pinned assets remain exact.
6. The root README describes actual framework/public-application boundaries,
   content pipeline, event/render ownership, commands and exact-artifact release
   rather than a chronological approval log. Research links support specific
   architectural choices; proposals are distinguished from implementation.
7. Root runs the required architecture checks and relevant native built-export
   tests, then publishes the exact successful CI artifact through the existing
   gate. Final role acceptance and live verification identify the commit and
   actual scope, including unavailable physical-device checks.

## Integrated native still-image peer review

The Experience Director independently inspected twenty unchanged native PNGs
from root's `design-smoke` and `design-other-six` receipts on 20 October 2026.
The inspected samples include desktop and mobile views of all six generic pages,
the original bright Caschlatsch voxel/AR figures, portrait built-tower and
Entrance footage, wide fabrication drawings, model/narrative splits, physical
cutting and simulation frames, visible inspection guidance and a closing credit
position. Local `design-director-peer-review.json` lists each actual filename
and the specific findings. No new browser/GPU session or image modification was
performed by this reviewer.

These images show the frozen **uncommitted working-tree design baseline** at
1440 × 1000/DPR 2 and 390 × 844/DPR 3. Its `release.json` commit field is the
base HEAD `9add8195db77090027f37b163146cc65b7dda042`; it does not establish
equality with that committed source. The export's study and asset revisions are
`5e9c7a358ef3558ba15977e59faae4791b899073dba90aa6ac83999b63c4123e`
and `1eb8a2b34c10172c5788c55e395f6f09ec9c2615c0e7ea4d2ae931eacdef6c67`.

The integrated direction is supported: the sources form distinct engineering
stories within the established typography, restrained glass and shared field.
Full portrait frames and original diagram proportions survive; model help is
visible and factual source/simulation distinctions remain. A new aesthetic
concept is not required. Two observed collisions prevent current visual closure:
the current desktop `MAKING` rail label projects across Entrance's wide drawing
edge, and the frozen mobile credit label sits beneath the fixed site navigation.
Root has already corrected the latter in source; rebuilt native verification
remains necessary. The post-freeze module-infill caption/provenance correction
also needs verification on the resulting candidate. Generic safe-area changes
must preserve the protected Bending/XR presentation.

Still frames do not prove continuous transitions, gesture/focus behavior,
advancing native-media time, long prose/control tails, fallback/lifecycle closure
or performance. Those current-candidate checks, intermediate widths and matched
protected-reference evidence remain separate requirements. This review grants
neither release acceptance nor a physical-device claim.

## Closure ledger

All twelve independent role reviews and their scoped handoffs are complete.
Corrected media and first six-page composition/inspection implementation are
integrated and built. Root's initial captures now cover all eight routes at
desktop/mobile; the bounded Director peer review above supports the six-page
visual direction and records two chrome/source-reading collisions for closure.
It is not complete visual, continuous-motion or interaction acceptance.
The bounded senior architecture implementation and architecture-led README are
complete at source level. Root's framework check, public build and portable
runtime/source suites pass; the initial native Dot interaction and 799/800px
boundary smoke also pass on the resulting local export. Matched runtime
performance, complete current native visual and interaction acceptance,
protected-reference regression, exact-artifact CI, deployment and live
verification remain pending.
Later acceptance must identify the actual resulting candidate and scope rather
than converting these source/CPU handoffs or historical images into final proof.
