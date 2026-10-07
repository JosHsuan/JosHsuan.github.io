# Applied feedback — individual material proposals

Round 04, 7 October 2026. [Open the 19 applied materials](http://127.0.0.1:4175/?collection=applied-feedback#materials). This round implements Spatial feedback on the existing Icons, Interface, Motion and Spatial specimens, with Typography and Identity included. It does not substitute a new page layout for those object-level applications.

All original material IDs remain stable. Each individual specimen now has **Feedback → Spatial / Baseline**. Existing controls, source files, notices, downloads, Saved records and notes remain available. Spatial is a new treatment proposal; an existing Saved material does not imply approval of every new animation. The seven Round 02 studies remain separate references. Round 03's connected feature page remains available.

## Start with four objects

| Category | Direct specimen | Try | Proposed decision |
|---|---|---|---|
| Icons | [Lucide](http://127.0.0.1:4175/?collection=applied-feedback&material=icons-lucide) | Press, release, cancel outside, then select a glyph. Compare Baseline. | Prefer this small tactile response for scene tools. Keep navigation glyphs quiet and retain text labels. |
| Interface | [Focus rail](http://127.0.0.1:4175/?collection=applied-feedback&material=ui-focus-rail) | Select Lab or Work; compare the chosen plate with its neighbors. | Use local detents for chapter location or representation choice, with normal links/buttons owning access. |
| Motion | [Theatre section](http://127.0.0.1:4175/?collection=applied-feedback&material=motion-theatre) | Seek the genuine score to 50%, then inspect a numbered section. | Reserve authored motion for an explanation of assembly. Local inspection pauses it and uses a different transform group. |
| Spatial | [Technical hatch](http://127.0.0.1:4175/?collection=applied-feedback&material=spatial-hatch) | Select Band 3 in the diagram; enable 3D, pick a band, vary density and compare Baseline. | Use feedback to identify actual geometry. Keep selection and the static projection available without a canvas. |

Use the same gallery's **Compare** for two or three captured poses, then open one working stage at a time. **Save** and notes refer to the original material ID. **Export discussion choices** produces the actual shortlist. The Applied feedback view orders Icons, Interface, Motion and Spatial first; the existing category buttons narrow the collection.

## Full material-to-effect mapping

| Materials | Spatial vocabulary applied | Actual changed object / functional outcome | Limit |
|---|---|---|---|
| Lucide, Phosphor, Tabler — 3 | Tactile key + separated card | Each of the 12 actual local glyphs has a fixed semantic button; its inner rig compresses and the selected glyph lifts. Original SVG downloads retain their bytes. | CSS planes, not extruded SVG meshes. A later interface should choose one family. |
| Focus rail — 1 | Navigation detents | Current selection comes to the front plane and the native selected state changes immediately. | This specimen chooses a state, not a production route. |
| Commands — 1 | Layered panel + shared input | Outline/Filled buttons and the existing command whitelist change the same three-face object. | No arbitrary execution, camera or invented command result. |
| Aperture reveal — 1 | Hinged cover | Two leaves follow the existing native reveal's evaluated time; pause/replay/reset affect one temporal owner. | A direct native reveal study, not an additional authored Theatre export. |
| SVG linework — 1 | Separated planes | Grid, construction axes and the actual traced SVG stroke have separate planes. Trace and plane separation can be inspected independently. | Illustrative linework, not a fabrication toolpath. |
| GSAP reflow — 1 | Part isolation | GSAP moves outer part groups; six selectable inner faces lift/rotate without overwriting placement. | DOM parts with perspective, not rigid-body dynamics. |
| Theatre section — 1 | Assembly + local inspection | Nine drawn panels gain edge thickness and independent extraction. The unchanged exported sequence controls outer separation. | SVG projection with authored time; the separate curved-rib specimen remains the true 3D score. |
| Parametric wire field — 1 | Pick, lift, settle | Mesh raycast and numbered controls choose a band. CPU vertices deform locally; normals and bounds are recomputed, and the diagram represents the same rule. | Unitless illustrative deformation; no structural claim. |
| Technical hatch — 1 | Geometry/material response | The selected band changes actual geometry, color and shader reference position. Density stays an explicit material parameter. | GLSL and CPU geometry only; no postprocessing or stress visualization. |
| ASCII height field — 1 | Height-range layers | Existing generated samples are partitioned into low/middle/high text planes; select one range or view the whole field. | Optional representation with ordinary controls and a textual description. |
| Five supplied font families — 5 | Word planes | Short heading words fan/lift while original text editing, size and available weights remain. Body copy stays stationary. | Restrict the effect to brief headings; do not animate long paragraphs. |
| Original identity glyphs — 1 | Differentiated axes | FORM, SYSTEM and MAKE mark plates open along different local axes and show their corresponding meaning. | Original flat marks on planes, not new mesh logos. |
| Palette — 1 | Separated surfaces | Actual color swatches separate while hex pairs and calculated contrast figures remain stable. | Contrast-pair calculation is not a full accessibility audit. |

This totals **19 existing materials across six categories**, with 13 effect mappings. The machine-readable [applied manifest](../catalog/applied-feedback.manifest.json) and the primary [material catalog](../catalog/materials.json) keep each mapping, controls, source files and source-vocabulary IDs together. The catalog MCP returns these updated material records; it does not require a new server or global registration.

## Implementation contract

`src/applied-feedback/controls.js` supplies the shared Baseline/Spatial comparison and press cancellation. `src/spatial-feedback/response.js` remains the interruptible numeric response owner. Individual specimen modules map those numbers onto actual glyphs, words, faces, lines or generated samples. This avoids a generic tilt of the entire specimen frame.

Normal direct feedback settles and stops requesting animation frames. Reduced motion snaps directly. The user can still select a part, edit a parameter, seek an authored still pose or operate a command. Existing authored playback remains in `src/motion/theatre`, through the agreed application adapter and versioned genuine export. Studio stays local-only. This round does not create or alter a motion save file.

The wire field/hatch model owns a persistent geometry buffer and shader uniform container. One response changes vertex heights/colors and uniforms, recomputes normals/bounds and requests demand renders. Raycasts use that CPU geometry. The stepped camera has its existing independent owner. No per-frame React state, perpetual idle render loop, physics library or new package was added. Closing the specimen unmounts its canvas; actual context loss retains a parameterized diagram and Retry action.

Preview images are captured from the working objects with exact poses recorded in `catalog/previews.manifest.json`. Icon/font source bytes and notices remain local and pinned. The asset manifest includes the new capture hashes. Public-site assets and private preparation materials are outside this role workspace.

## Research and recommendation

The [pre-build plan](applied-feedback-plan.md) links the primary research and records the rejected generic-tilt approach. [Lucide](https://lucide.dev/how-to/accessibility) supports labeled semantic icon controls with adequate targets; this led to stable buttons around moving inner glyphs. [W3C SC 2.3.3 guidance](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html) supports disabling nonessential motion; direct state remains usable here. [MDN transform-style](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/transform-style) informed the separate clipping viewport and preserving inner rigs. [R3F demand rendering](https://r3f.docs.pmnd.rs/advanced/scaling-performance) informed explicit invalidation and idle checks. These are implementation constraints; the aesthetic mappings are original design proposals.

Adopt the smallest useful depth response first: **icon pressure and interface location**, then **linework/part inspection** where a relationship benefits from explanation. Keep **Theatre and picked geometry** for concentrated authored or exploratory moments. Treat **ASCII and word-plane typography** as occasional secondary accents. Applying the vocabulary everywhere does not mean running every effect simultaneously.

See the [verification record](../verification/README.md) for actual browser checks, captured images and limits. Production integration, approved professional content, field performance and physical-device validation remain later work.
