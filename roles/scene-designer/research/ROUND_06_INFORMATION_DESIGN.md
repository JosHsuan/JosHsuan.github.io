# Round 06 — Source diagram interaction

Date: 2026-10-08. Added responsibility: Information Designer, alongside Visual Direction / Lighting / Scene. The owner requested broader role assessment and source-derived interactive diagrams. The integrator explicitly assigned these three adaptations and retained page placement, shared playback, model binding and publication ownership.

## Evidence and adaptation

The supplied `BendingActive_00.ai` and `BendingActive_01.ai` contain PDF-native paths, text, clips and embedded context images. The isolated source-tools Python reads them with PyMuPDF 1.27.2. Original-file SHA-256 values are checked before and after extraction; both remain unchanged. Source paths, checksums, licensing limits, command counts and audit details stay in the designated D-drive Round 06 artwork workspace. Public data includes only source filename/page and sanitized counts. These are owner-supplied thesis derivatives, not newly licensed third-party assets.

| Adaptation | Source area | Retained drawing paths / labels | Interactive reading |
| --- | --- | --- | --- |
| Function library | AI01, page 1, 610/18–970/344 | 452 / 27 | Eleven original long curves, drawing indices 927–937; length-axis positions 160 through 60 mm. |
| Miura fold anatomy | AI00, page 1, 650/270–1140/500 | 387 / 16 | Net, fold lines and folded form. One embedded source image supplies the original folded-surface shading. |
| Geometry-to-fabrication workflow | AI01, page 1, 20/18–580/542 | 585 / 98 | Four actual source stages: origami, opening, bending and authored curvature colours. Eleven embedded placements reference eight source context images. |

The library has 1,949 cubic Bézier segments and one straight segment across its eleven selected traces. The 170 mm tick remains in the original axis but is not treated as a twelfth curve. Selection highlights existing paths; there is no curve fitting, sampled predictor, calculated bending output or invented engineering result. Miura region selection does not animate a claimed physical fold. Workflow links preserve original branches and wording. The four selectable nodes request known source representations; they do not reinterpret the chart as a new simulation.

Extraction preserves native line/cubic/rectangle/quad coordinates with a maximum serialization rounding of 5e-10 source units. Source image soft masks, native clip paths, paint order and relevant transparency groups are retained. SVG labels preserve wording, positions, rotation and authored width; available Sans typography replaces the original embedded fonts, which are not redistributed. This is an interactive vector adaptation, not a pixel-identical facsimile. Full source evidence remains separately available through the page's source disclosure.

Visual comparison caught and corrected two conversion pitfalls: mapping source images into a normalized SVG image without `preserveAspectRatio="none"` misaligned shading, and flattening text/images after all paths lost native paint order, clipping and group opacity. Final inspected captures show aligned Miura surfaces, subdued source annotations and no stray pixels outside workflow thumbnails.

## Component and shared ownership

`SourceDiagram` accepts `kind` (`library`, `miura`, `workflow`), optional `title` and `className`. It loads `/assets/diagrams/{kind}.json`; a complete self-contained `{kind}.svg` remains the static/load-failure fallback. Native source paths are rendered as SVG, not retraced from screenshots. Rounded outer framing is stable; the inner SVG panel and discrete heading/label/caption elements opt into Motion's existing choreography. Essential evidence and controls carry `data-protect`.

The outer `[data-source-diagram]` exposes `data-diagram-count`, `data-diagram-selection` and accepts `data-autonomous-index`, `--diagram-phase`, `--diagram-energy`. Native buttons reference their SVG families and expose `aria-pressed`; keyboard focus highlights a library/Miura group and activation pins it. Escape or Follow chapter releases the local pin. Pointer hit strokes do not alter source curves. Only discrete load/selection work occurs in the component; it has no RAF, timer, animation loop or per-frame React state. Reduced-motion CSS removes selection transitions, while the shared controller owns autonomous Pause/Reduced/hidden behavior.

Library/Miura may follow their chapter phase. Workflow instead follows `thesis:representation-presented` with `{chapterId:'system', index, pinned}` and maps through each group's explicit `representation` value. This prevents disagreement between floor-of-phase UI and the scene's dominant source slot. `pinned:false` releases a stale local pin; Follow chapter restores the actual displayed representation. Deliberate workflow activation dispatches `thesis:representation` with `{chapterId:'system',index}`. Automatic presentation, hover and focus never dispatch representation requests or create a feedback loop.

## Handoff, verification and limits

The extractor is `roles/uiux-designer/scripts/extract-source-diagrams.py`. It requires an explicit D-drive work directory and only copies public derivatives with an explicit `--publish-dir`. Original AI files, rendered source-review PNGs, absolute source paths and private audits never enter the public folder.

The handoff has exactly 15 files: three JSON/SVG pairs, `miura-context-1530.png`, and `workflow-context-{8378,8379,8382,8383,8384,8385,8386,8387}.png`. They total 4,955,732 raw bytes. An offline estimate applying gzip to JSON/SVG while leaving PNG unchanged totals 2,406,622 bytes; this is not an observed network-transfer measurement. Static SVG fallbacks embed their context images and consequently duplicate some packaged bytes. Public delivery budgets must include these derivatives honestly.

Two CPU tests verify native drawing/label counts, complete fallback contents, public path sanitation, all references, eleven exact curve identities/command counts and the four representation mappings. An isolated Chromium React/SVG fixture passes keyboard activation, auto/manual event isolation, actual workflow-source follow, pinned selection, Escape, reduced motion, static fallback and no horizontal overflow at 1120 and 390 CSS pixels. No page errors occurred. It creates no WebGL scene and does not substitute for full app compositing acceptance.

The role inspected actual desktop library/Miura/workflow and mobile library/workflow captures against the source artwork. A subsequent actual build-2 desktop workflow capture also confirmed that all labels, source nodes and controls remain visible with the real 3D scene, and that the bending-node highlight agrees with the displayed bending source. The compact mobile workflow remains an overview; readable external selection labels and descriptions provide its four key stages. Tiny original annotations remain in the vector artwork rather than being replaced with fabricated simplified results. Full integrated page composition, shared choreography, all source-model transitions and Canvas alpha protection remain the integrator's acceptance responsibility.
