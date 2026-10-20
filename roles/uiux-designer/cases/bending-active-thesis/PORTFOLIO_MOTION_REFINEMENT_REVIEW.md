# Portfolio motion refinement review

Date: 20 October 2026. Role: the existing Motion Designer, independent review
and implementation for decision 0019. Status: implemented and CPU-verified;
integrated native visual/interaction and release acceptance remain pending.

## Brief and retained movement

The visitor should understand each original source before manipulating it.
An unobstructed source aperture establishes the object; its adjacent caption
explains whether inspection is available. A deliberate drag or arrow key can
reveal the geometry's existing spatial relationships. Returning restores the
chapter composition, while normal vertical reading remains immediate. The
interface does not imply assembly, deformation or structural simulation.
Caschlatsch's portfolio figures remain documentary sources without fabricated
inspection or XR functionality.

The review read the current root and Motion Designer instructions, role brief
and response contract, empty-framework and cinematic decisions, architecture
Sections 07–09, website interaction guidance, refinement integration/team
review, UI/UX design and Scene/3D Animation/Geometry reviews. The existing
imperative source renderer, scene presenter and their meaningful tests were
inspected. The UI/UX implementer coordinated the exact empty-aperture and
caption/state/help/reset markup before integration.

Retain the existing 1.1-second entry and 0.95-second exit, quintic passage and
single displayed-source transaction. Same-source chapters retain one continuous
interval; a superseding request closes from the displayed pose. The existing
bounded azimuth/elevation and critically damped return remain on the ordinary
site driver's clock. Camera/material/light recipes, source geometry and native
video transport are unchanged. No additional RAF, timer, scroll handler,
per-frame React state, camera writer or CSS transform owner was introduced.
Bending-Active and XR are references, not modification targets.

## Implemented interaction refinement

`runtime/site/ProjectStudyScenePresenter.mjs` now consumes the dedicated
`data-project-model-target` aperture and sibling state/help/reset elements.
This scene owner publishes these discrete states only when the semantic state
or control eligibility changes:

| State | Visible message | Availability |
| --- | --- | --- |
| Loading | Preparing 3D view. | The current model cannot yet be inspected. |
| Ready | 3D view · drag to inspect. | Current chapter, actual first paint, held/settled model source and permitted policy. |
| Inspecting | Inspecting 3D view. | A deliberate inspection has displaced the chapter view. |
| Returning | Returning to chapter view. | Pointer release is completing the existing finite damped return. |
| Paused | Motion paused · original view. | Global pause, hidden or suspended presentation. |
| Static | Original source view. | Static/error/data/reduced fallback, or another chapter's inactive aperture. |

`data-project-model-availability` exposes that discrete state on the status and
target, with `aria-disabled` when inspection cannot run. The help is visible
only when the existing scene owner can actually inspect. A successful past draw
or a canvas alone is insufficient: policy, stage kind/mode/settlement, current
chapter and actually painted chapter must agree. The Return button appears only
while that eligible view has an offset or is returning. Unchanged held frames
do not rewrite status/help/reset or publish numeric camera values to the DOM.

Home, Escape and the visible Return button call one return operation in the
scene owner. It closes pointer capture, resets bounded camera intent/value and
schedules the existing demand draw. Focus can move between the aperture and
its own Return button without hiding the button before activation. Leaving
that interaction group restores the chapter view. Foreign/stale chapter
targets and reset controls cannot operate the current camera.

The key handler now requires the current dedicated target and rejects native
links/buttons/forms/summary, editable content and reading windows even if
future markup nests them inside a model target. Already handled, composing or
browser-modified keys are left alone. Source/caption links therefore keep
their own arrow/Home/Escape behavior.

Actual source hit testing, the eight-pixel touch commitment threshold,
vertical-touch release to native scrolling, horizontal drag, pointer cancel,
focus departure, chapter change, policy change and disposal retain their
existing closure. Source links remain independent. Disposal removes native
listeners and live availability, returns the status to original-source copy,
and hides help/reset; late events cannot publish or move a released scene.

## Verification and acceptance handoff

Node 24.19.0 and pnpm 11.19.0 were confirmed. Sixteen scene tests pass,
including four new meaningful interaction tests for actual held-source and
policy state, no repeated state writes at rest, blocked native keys, current
and foreign targets, Home/Escape/reset equivalence, reset focus transfer,
hit/miss, touch commitment, finite return and departure/disposal. Together
with the existing geometry and appearance suites, all 32 CPU tests pass:

```powershell
node --test roles/uiux-designer/cases/bending-active-thesis/tests/project-study-scene.test.mjs roles/uiux-designer/cases/bending-active-thesis/tests/research-scene-geometry.test.mjs roles/uiux-designer/cases/bending-active-thesis/tests/project-study-appearance.test.mjs
```

The two modified runtime/test files pass the role's actual ESLint configuration
by running its local ESLint from `roles/uiux-designer`. An earlier root-config
lint command ignored these role files and is not treated as lint evidence.

CPU fixtures establish event ownership and numerical/resource closure, not
native rendering or aesthetic acceptance. Root still needs built-artifact
desktop/mobile journeys on all five source models and nine eligible chapter
views: visible initial/ready/static guidance, actual-hit horizontal inspection,
native vertical reading, arrow/Home/Escape/reset, source-link key independence,
focus to/reset/from controls, chapter reversal during a gesture, global pause,
live reduced/data fallback, failed source, hidden/BFCache and true departure.
Observe the original forward/reverse passage signs and intermediate durations,
source participation and resource revision. Source apertures, complete prose,
captions and the last control line require actual human inspection at the
reviewed desktop/intermediate/mobile widths. This role ran no browser, GPU,
full build, Git mutation, source conversion or deployment, and makes no
physical-device or release acceptance claim.
