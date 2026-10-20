# Six-project UI/UX refinement design

Date: 20 October 2026 (Europe/Berlin).

Status: independent UI/UX Designer design and first implementation handoff.
This record is an actual review by the existing `uiux-designer` responsibility,
not a claim that all twelve roles participated. Corrected Caschlatsch material
and short Mode/s web recordings must be integrated before visual implementation
is accepted. The first scoped implementation is recorded below; integrated
native visual acceptance remains pending.

## Scope and evidence

The owner's current request includes visual composition, motion and useful
interaction on Mode/s of Making, Entrance Installation Art, Dot-Based 3D
Printing, HC3DP Caustics, Special Assemblies and Project Caschlatsch. Bending
and XR supply the quality reference and remain visually protected. Original
source bytes, model geometry, source proportions, camera/material/light recipes,
credits, native document reading, one clock and the empty reusable framework
remain protected.

The review reads root and role instructions, the root README, decision 0001,
architecture Sections 8.1–8.6, the website design guidelines, the current
[Director review](PORTFOLIO_REFINEMENT_TEAM_REVIEW.md), `ProjectCaseStudy`, its
controls, stage and CSS, `ProjectStudyChrome`, the evidence selector, the scene
presenter/adapter, the backdrop presenter, XR's JSX/CSS, Bending's chrome and
reading styles, and the current typography/material tokens. The role's existing
`frontend-design` skill supplies the plan–critique method; this proposal follows
the owner-pinned website identity rather than introducing its generic defaults.

Actual prior-release images inspected were the `7ff67ce` desktop Mode/s overview,
mobile Caschlatsch XR guidance position and full-viewport mobile Mode/s contact
sheet. They demonstrate the existing composition, not acceptance of the new
design. Prepared Caschlatsch voxel-framework, XR-interface and XR-data-exchange
WebPs were also inspected at their native aspect. These supplied figures contain
authored labels; a narrow decorative background cannot be their only useful
reading presentation. Browser/GPU ownership stays with the root agent.

## Findings that change the design

1. The generic page imposes the same 12-column split and 116svh chapter minimum
   on every source. The resulting sequence changes its text but rarely changes
   its composition. XR already separates opening, model/phone, physical evidence
   and concluding reading compositions.
2. Desktop source slots add 70svh of ready-state padding, or 80svh for models.
   On mobile they combine an 82svh minimum with 62svh padding. These fixed
   allowances cannot express a short photograph, tall installation, wide process
   film and five-paragraph technical explanation equally well.
3. The prior mobile Caschlatsch image has the white workflow behind the reading
   panel while the caption and fixed header compete above it. Its heading is
   readable, but this is not a useful complete-source reading position. The new
   original figures need their own unobstructed aperture and immediate caption.
4. The model is genuinely inspectable, but visible copy does not reveal the
   drag/arrows/Home/Escape behavior. The current focus group also contains the
   caption links and video controls. Inspection keys should belong to the
   inspection target rather than ordinary links inside its caption.
5. The current source transaction and native-media lifecycle already implement
   meaningful motion, readiness, pause and cancellation. Retain these owners;
   an additional animation library, scroll hijacker or representation switcher
   would not resolve the actual design defects.

## Visual identity and restraint

Use the existing palette and material family. The named base colors are the
current background `#090d0d`, surface `#121a18`, reading fallback `#202526`,
reading ink `#f0f3f2`, secondary ink `#dfe6e3` and control accent `#ffeadf`.
These explain the present tokens; implementation must consume semantic tokens
instead of copying new hex overrides. Source colors remain unchanged. In
particular, do not recolor white diagrams, add photo grading, or strengthen
lighting to compensate for a layout problem.

Space Grotesk remains the heading face. Portfolio OCR B remains the body,
caption and control face. Retain the current heading, leading and tracking
tokens. Body text remains at least 1rem on narrow mobile, with a reading measure
near 55–68 characters where width permits. Captions use their existing role;
do not shrink original figure labels or controls to fit an arbitrary card.

The memorable element is the actual work: tool contact, the installation's
vertical silhouette, printed deposition, observed light, reciprocal modules,
and the authored voxel/XR figures. Quiet chrome frames these sources. Do not
add a new set of colored tags, decorative metrics or endlessly moving controls.

## Chapter composition policy

Use a small semantic composition policy, independent of source rendering and
timing. It returns a chapter kind, source shape and reading density. It does
not contain camera values, change a source identity, or own an animation.

Classification order is explicit: overview → opening; credits → closing;
reviewed movie → recording; eligible model chapter → model; remaining source
→ documentary. Source shape comes from its recorded width/height: portrait
below 0.85, wide from 1.65, otherwise balanced. Four or more paragraphs mark
extended reading. A truthful semantic exception may be authored if the final
source requires it; do not infer technical meaning from an asset filename.

| Kind | Desktop composition | Portrait/mobile composition | Meaningful difference |
| --- | --- | --- | --- |
| Opening | Title/summary/metadata on the left; full source on the right. Two compact metadata columns when space allows. A chapter-height minimum is appropriate only here. | Identity, title, summary and entry link read first; then the complete source aperture and its caption. Do not place the project title behind fixed navigation. | Establishes the project and directs the first deliberate continuation. |
| Model | Preserve the existing right-hand 3D aperture and camera recipe. Narrative uses the left reading column; the source caption follows the inspection aperture. | A source-first aperture aligned to the existing mobile model fit, then compact interaction help, caption and prose. The vertical reading gesture remains native. | Gives the reader a real spatial investigation with a visible return path. |
| Recording | Wide landscape processes receive a broad, unobstructed source aperture; portrait recordings receive a tall contained aperture. Caption/playback controls follow the source, and the narrative continues in a readable measure beneath it. | Complete frame above caption and native playback controls, then prose. No fixed extra viewport of blank space after a short caption. | Distinguishes real operation, recorded path and animation through the source caption, not a new player shell. |
| Documentary | Portrait photos can retain the source/prose split. Wide or label-dense figures receive a broad source-first composition with narrative below. Balanced photographs can use a compact split. | Full source, adjacent caption/full-image link, then the narrative. Extended text is naturally taller rather than padded to another viewport. | The document's aspect and content determine the reading distance. |
| Closing | A quiet reading block with credits and related study; no empty companion source slot. | Content-driven reading block with clear space above the bottom rail. | Resolves attribution and gives an ordinary next destination. |

Two desktop arrangements are sufficient; they are not six microsite themes:

```text
Spatial / portrait split             Broad documentary / recording
┌────────────────┬────────────────┐  ┌─────────────────────────────────┐
│ narrative      │ source aperture│  │ complete source aperture        │
│                │                │  │                                 │
│                │ visible help   │  ├─────────────────────────────────┤
│                │ caption/source │  │ caption + controls + source     │
└────────────────┴────────────────┘  ├─────────────────────────────────┤
                                    │ narrative in a readable measure │
                                    └─────────────────────────────────┘
```

The primary source remains the one background participant selected by the
existing transaction. A broad composition changes its CSS aperture, native
caption/story positions and reading spacing. It must not add a duplicate of
that same image into the information layer. Supporting figures remain native
in-flow evidence and are displayed once by the existing evidence selector.

### Initial layout values for the implementer

These are concrete starting values for native visual review, not passing-test
claims. Resolve them with Scene Designer before publishing.

- Retain the maximum 1800px page grid and 6vw desktop margins, reserving the
  existing rail width. Desktop narrative maximum: 35rem in a split and 50rem in
  broad/extended reading. Caption maximum: 42rem; it need not stretch across a
  full-width technical plate.
- Remove the unconditional 116svh chapter minimum and blanket 70/80svh source
  padding. Use source-kind classes for real apertures and content-driven text.
  The opening may retain approximately one viewport of breathing space; credits
  and a small documentary chapter do not need a forced screen.
- A broad desktop documentary/recording aperture initially uses 8vw side safe
  space, a top safe edge below the masthead and at most 64svh of source height.
  `contain` remains mandatory. Its source-first native spacer plus immediately
  following caption must make the complete source visible before the prose
  enters it. Tall video instead uses the available height and preserves side
  negative space.
- Keep model apertures at the current adapter fit: desktop center 73.5%/53%,
  width 51%, height 78%; narrow center 50%/42%, width 94%, height 45%. Do not
  copy broad-photo aperture values onto models or alter a protected camera to
  make a text panel fit.
- At widths up to 780px, use 1.25–1.5rem page margins, 1rem caption padding,
  1.5rem narrative padding and a 1.25–1.75rem caption-to-story gap. Reserve the
  actual masthead/site-link and bottom-rail safe areas. The source interval
  derives from its aperture, not a universal 82svh minimum plus more padding.
- At 800–1100px, retain the model fit's existing desktop branch but constrain
  the prose to its available left column. Broad documentary/recording chapters
  already use the source-then-story layout; long copy must not cross the model
  aperture. Test 800px and 1024px explicitly before deciding another breakpoint.
- Supporting technical plates use one full-width figure per row. Photographic
  supporting pairs may use two columns only where each remains intelligible;
  narrow/tablet layouts stack them. Never put the authored XR interface or
  voxel framework into a small two-up tile.
- On a low-height landscape viewport, content may exceed the screen. Allow
  native scrolling; do not scale body copy or clip focus rings to achieve a
  screenshot of an entire chapter.

## Per-page implementation target

All existing truthful paragraphs, study roles, links and credits survive. This
table specifies the intended change in composition and discovery; it does not
authorize replacing or inventing sources.

| Page | Chapter design | Interaction and ending |
| --- | --- | --- |
| Mode/s of Making | Opening identifies the heat-cutting study. Context/System use the actual model split. Making uses the broad simulation frame. Fabrication and Cutting use the two compact real-operation frames with their captions close to the footage. Results becomes a shorter documentary conclusion rather than another movie-height section. | Distinguish simulation and physical recording in visible caption/link copy. Each source keeps its own native time. Pause A, leave for B and return to A without clearing the visitor's pause intent. A movie ending does not advance the chapter. |
| Entrance Installation Art | Give the portrait opening and completed night recording a tall contained source window. Context/System keep the verified installation/model visible while explaining support. Making's wide construction drawing gets a broad reading composition; supporting construction photographs follow in source order. | Visible model inspection only on its declared chapters. Night footage has an adjacent play/pause state and a full-height still fallback; it is never cropped into landscape. |
| Dot-Based 3D Printing | Context's process graphic is documentary; System uses the actual point-based model; Making enlarges the close-up deposition frame; Results presents the physical samples with supporting detail once. | Explain inspection as a change of viewpoint on the source points, not a live print solver. Keep the deposition recording's native duration and explicit replay/end semantics. |
| HC3DP Caustics | Context/System keep the geometry/path model composition. Making gives the recorded robot path an unobstructed complete frame. Results gives optical observations and failure samples a broad, readable photographic sequence. | Path footage remains labelled as a path demonstration. Do not imply it proves successful printing or the optical result. Bright diagrams and dark photographs retain readable caption/controls. |
| Special Assemblies | Context/System expose reciprocal module geometry and details. Making presents the robot animation as its own broad simulation passage. Results moves to a compact physical prototype/documentary composition and supporting image. | The finite simulation holds its last frame and offers replay. Drag/arrows change viewpoint only; do not add an invented part-explosion or claim collision verification. |
| Project Caschlatsch | Original portfolio timber imagery replaces rejected active material. The full voxel/beam framework and module infill are wide documentary evidence. The original XR interface, assembly sequence and data exchange figures stay complete and form a readable source sequence around the extended System/XR copy. Making/Results return to physical fabrication and built work. | No artificial 3D controls, cloud connection or mock phone interaction. Full-image links make authored interface labels inspectable at native size. Source captions identify portfolio figures and actual authorship. Remove active placement of the rejected Design/fabrication/assembly graphic. |

The new Caschlatsch assets inspected for planning have markedly different
proportions: voxel framework 2270×1782, module infill 2245×830, XR interface
2481×1035, assembly sequence 2325×1690 and data exchange 2310×1240. Therefore
one 3200×1000 conceptual-background slot is not an acceptable layout substitute.
The Information Designer's final source/provenance handoff determines their
actual primary/supporting placements.

## Interaction design and truthful state

### Model inspection

Place the focusable inspection target around the actual empty model aperture,
not around caption links. Show concise visible help beside that target:
“Drag the model to inspect. With focus, use arrow keys; Home or Esc returns.”
The target's accessible label contains the existing truthful model description.
Use a visible focus outline and retain a minimum 44px path to focus. The source
panel's original-image link remains an independent ordinary link.

The scene presenter owns availability and exposes a discrete semantic state:
loading, ready, paused or static. Suggested visible state text is “Preparing
3D view”, “3D view · drag to inspect”, “Motion paused · original view”, and
“Original source view”. Show the help only when inspection can actually run:
the source is held, fully painted, current, and the existing policy permits it.
Fallback/error text explains source reading without a nonfunctional inspect
button. Do not infer availability from the presence of a canvas alone.

Retain current actual-hit pointer behavior, horizontal touch commitment, arrow
increments, Home/Escape return, pointer-cancel, focus-leave and chapter-change
closure. Reading vertically must win before a horizontal touch gesture commits.
Do not bind arrow/Home keys on caption links or editable/native controls. A
reset button, if added, calls the same scene owner as Home/Escape; it does not
write a camera pose from React.

### Reading and chapter navigation

Retain the existing native anchor links, numbered rail, skip link, counter and
Pause motion action. Current chapter indication, counter and source intent
must receive the same semantic chapter selection. A layout change must not
introduce a second scroll threshold or select a different chapter just because
a source caption is taller.

At mobile widths, the rail remains a horizontally accessible row with 44px
targets and visible focus. The focused/current item must be available without
drag-only discovery. Showing the current chapter's name near the counter is a
useful generic-page enhancement if it fits; do not change Bending/XR's chrome
to obtain it. Header/rail safe spacing must allow every paragraph and link to
reach an unobstructed reading position.

### Recordings, sources and errors

Play/pause, replay, current recording status, source credit and direct recording
link stay in one adjacent caption group. Use “View recording” for real footage
and “View animation” for simulations; keep their existing source semantics.
Paused/ended/unavailable are discreet text states, not color-only signals.
The global Pause motion control remains distinct from a recording's deliberate
pause. Native video owns media time; scroll and chapter motion never seek it.

Every full-source image remains linked with meaningful alternative text.
Original figure lettering is not rewritten as a simplified lookalike. A
source error leaves the caption, prose and source link usable. Reduced Motion,
Save Data, no WebGL and no JavaScript retain meaningful still/source reading.
These paths receive a designed layout instead of inheriting an empty animated
spacer.

## Motion collaboration contract

Motion Designer retains authority over final timing/reversal details. This
proposal adopts the already-working source transaction and 1.1-second entry /
0.95-second exit, with the existing quintic interpolation. It changes native
composition and aperture, not source transform ownership.

There is one displayed source, one prepare/exit/enter/hold transaction and one
ordinary-page clock. Same-source chapters keep their continuous interval.
Superseded requests close from the displayed pose. Focused reading windows stay
stable using the existing focus-within rule. Paused/reduced/data-policy states
show useful settled content. A broad source still uses the same directional
entry/exit, never a second CSS fade or autonomous RAF. Sources and model geometry
do not bend, stretch or warp to match a panel animation.

## Implementation ownership and files

The root agent allocates paths before implementation. This proposal changes
only this document. Expected edits, after source correction, are:

| File | Intended responsibility |
| --- | --- |
| `components/ProjectCaseStudy.jsx` | Emit semantic chapter/source-shape/reading-density classes; keep primary source separate from supporting evidence; place the dedicated model focus target and visible help outside caption controls; composition-aware overview and credits. |
| `components/ProjectCaseStudy.module.css` | Replace blanket height/padding with the split/broad/opening/closing rules; safe areas, complete source aspect, responsive text/caption continuity, dedicated focus target, fallback/print layouts. Scope all changes to generic pages. |
| Pure `components/project-study-layout.mjs` helper | Derive validated composition facts from public chapter/source data; no DOM events, timed values or renderer state. Prefer this to scattered project-ID CSS exceptions. |
| `runtime/site/ProjectStudyScenePresenter.mjs` | Publish truthful discrete inspect availability and bind any visible return action through the existing gesture owner. Do not change geometry/camera/material/light recipes or add a timing owner. |
| `components/ProjectCaseStudyControls.jsx` / the architecture-reviewed chapter owner | Consume the one chapter-selection result for rail/counter/help. Runtime lifecycle consolidation belongs to Software Architect, not a second UI-owned scroll observer. |
| Existing native Pages tests and focused composition tests | Verify actual focus/drag/return and recording behavior plus source apertures, long reading tails and responsive layout. Tests must target the built artifact. |

### First implementation checkpoint

After the first two media corrections were integrated, the root agent allocated
`ProjectCaseStudy.jsx`, `ProjectCaseStudy.module.css`, the pure
`project-study-layout.mjs` helper and its focused CPU test to this role. They
now implement the five semantic composition kinds, authored diagram purpose,
active-movie aspect, extended reading and the 799/800px projection boundary.
Broad chapters have an unobstructed source interval followed by caption and
prose; technical supporting figures retain their whole width and have no
viewport-height cap. Opening identity precedes the source on narrow screens;
credits use ordinary content height. Old blanket minimum heights/padding were
removed. Model camera/appearance values and shared material/type tokens remain.

Published hash names now identify chapter entries, with `-heading` IDs retaining
the explicit heading association, so direct links enter before a broad source.
The empty `[data-project-model-control][data-project-model-target="chapter"]`
is separate from caption controls. Its source-panel siblings expose
`data-project-model-state`, `data-project-model-help` and
`data-project-model-reset`, each valued by chapter. State starts as “Original
source view”; help/reset start hidden. Motion Designer owns actual semantic
availability, visible-state publication and the single reset/return path.

Five focused Node 24.19.0 tests pass against all six current public studies:
complete chapter coverage and source immutability; protected model split and
actual movie aspect; balanced-but-dense Caschlatsch plates; authored purpose
rather than filename inference; and invalid-source rejection. These are layout
policy tests, not rendered visual evidence. Native build/capture, interaction,
protected-reference regression and final acceptance remain pending with the
integration owner. No browser, GPU capture, build, commit or publication was
performed by this role.

### Native-smoke correction: Credits safe entry

The integration owner's first native smoke accepted the initial source-first
aperture direction while retaining full design acceptance as pending. This
follow-up inspected the original `mobile--mode-s-of-making--credits.png` and
`mobile--project-caschlatsch--credits.png` from
`animation-review/.local/portfolio-refactor-20261020/design-smoke/`. Both show
the Credits chapter label behind the fixed About / Project / Contact row after
the native chapter-entry anchor move. They are pre-correction evidence, not
passing captures of this change.

Credits had replaced the shared chapter-entry safe top with `3rem` on desktop
and `2rem` on mobile. It now uses `var(--study-source-top)`, including the
existing responsive and low-height values, and has no separate mobile override.
The correction only restores safe entry spacing; it adds no forced chapter
height and changes no model aperture, source geometry, camera, shared chrome or
Bending/XR rule. Source syntax validation is separate from the integration
owner's required post-build Credits capture and full-page native acceptance.
Node 24.19.0/PostCSS parsed all 104 top-level CSS nodes successfully and confirmed
that Credits has exactly one safe-top declaration using the shared variable.
No additional test was added for this small spacing correction; no browser,
build or served-artifact mutation was performed by this follow-up.

### Native-smoke correction: source-clear current rail

The original `desktop--entrance-installation-art--making.png` from
`animation-review/.local/portfolio-refactor-20261020/design-other-six/` shows
the complete fabrication drawing, but the `MAKING` rail label covers part of
its right-hand annotations. The shared `app/page.module.css` displays that label
on hover or visible keyboard focus, not on `aria-current` alone. A pointer left
on the activated native anchor can therefore keep the label over the source.

The generic-only selector
`.chapterRail a[aria-current]:not(:focus-visible)>span:nth-child(2)` now sets
`opacity:0`. The selected number, selected marker, native anchor, `aria-current`
and full accessible chapter label remain. Keyboard focus still displays the
chapter-name help, and hovering other chapter destinations can still reveal
their labels as an intentional temporary navigation aid. This removes the
parked current pointer label without reducing technical-image width or changing
the shared chrome used by Bending/XR. Mobile's existing hidden label policy is
unchanged. The source aperture, complete source pixels and protected model fit
are unchanged. Post-build native source-clear and keyboard-focus checks remain
with the integration owner; the pre-correction capture is not passing evidence.
Node 24.19.0/PostCSS parsed the updated stylesheet's 106 top-level nodes and
confirmed the scoped opacity rule and preserved Credits safe top. This small
CSS policy change added no tests and ran no browser, GPU, build or Git operation.

`ProjectStudyChrome`, shared typography/material CSS, Bending/XR components and
their renderer recipes do not need visual edits for this design. Any shared
architecture edit still requires matched protected-page regression. Do not
rewrite public copy or alter asset pins as an incidental CSS refactor.

## Responsive and interaction acceptance

Acceptance is currently pending. Capture the integrated built artifact on all
six pages, every chapter and its source/caption/prose boundary. At minimum use
1440×1000 desktop, 1024×768 tablet, 800px-width breakpoint coverage, 390×844
mobile and 320px narrow reading. Use available browser profiles and explicitly
record any unavailable physical-device check.

For each page, inspect the complete primary-source aperture, caption including
last credit/link/control, heading, final paragraph, supporting figures, and the
forward and reverse boundary. A heading-only screenshot or a contact sheet is
not sufficient. Original labels must stay present and proportional; native
full-image access is required when phone width cannot make small technical
lettering comfortably readable.

Exercise native wheel/PageDown, anchor and direct hash entry, focus, actual-hit
horizontal inspection, vertical touch reading, arrows/Home/Escape, pause/resume,
recording end/replay, fast chapter reversal and document departure. Check that
one recording plays, manual pause intent survives source return, and no stale
source appears after a jump. Hidden/BFCache, live Reduced Motion, Save Data,
failed media/WebGL, no-JavaScript and print retain source/text alternatives.

The senior runtime/performance review must measure event/layout work, idle
scheduling and resource release on this actual composition. It must preserve
the final visible design. Finally compare Bending/XR desktop/mobile composition
and native interaction before and after any shared change, then repeat the
relevant visual checks on the exact CI artifact and deployed artifact. Do not
call this proposal a completed design refactor until that evidence exists.
