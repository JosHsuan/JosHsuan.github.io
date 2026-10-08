# Round 06 — Original representations and experimental geometry

Date: 8 October 2026. Baseline: `704ba9f`. The owner authorizes source-native diagrams, further experimental models and a continuous autonomous chapter presentation. The source-folder search was explicitly expanded during this round. This inspection prepares only selected sanitized derivatives; original CAD and full inspection records remain outside the public release.

## Source evidence

The supplied four-image reference and the authored `BendingActive_01` artwork distinguish an origami representation, its opening representation, a bending-active form and a colored curvature view. The existing thesis Rhino document contains original mesh candidates with matching outline, polygon structure and related display-row placement. Their Rhino names are generic `MESH` names; semantic association comes from the authored image and inspected geometry, not from meaningful CAD layer labels.

The owner-selected experimental document contains 5,756 objects, including 41 direct meshes and nine meshes with authored vertex colors. Four hidden imported STL meshes alone contain over 2.2 million vertices and are excluded from this handoff. The additionally authorized final-experiment document and angle-test document were inventoried to understand the available evidence; neither contributes an exported object in this selection. All files use millimetres. The read-only inspections use the existing rhino3dm 8.17.0 / Python 3.11 environment.

The `BendingActive_02` artwork names six TYPE rows: Arc, Twist and Saddle, each with width-only or width-and-length variants and single/double sorting patterns. The experimental source contains several related spatial rows, but no corresponding named layers or conclusive object-to-TYPE text association. Three geometrically distinct examples are therefore published as Experiment A, B and C, with neutral shape descriptions. They must not be relabeled as exact TYPE-row matches without further evidence.

## Selected handoff

| Runtime ID | Evidence and display purpose | Original vertices | Exported triangles |
|---|---|---:|---:|
| `origami` | Original coarse folded representation; original polygon edges remain inspectable | 490 | 672 |
| `opening` | Original opening representation with substantially more source boundary edges | 1,771 | 2,688 |
| `bending` | Original detailed bending-active source form | 57,526 | 106,879 |
| `curvature` | Related source form carrying the author's stored vertex colors | 57,526 | 106,879 |
| `experiment-a` | Original sheet with an arched profile; exact authored TYPE row unconfirmed | 3,344 | 6,310 |
| `experiment-b` | Original sheet with pronounced spatial twist; exact authored TYPE row unconfirmed | 3,331 | 6,297 |
| `experiment-c` | Original sheet with alternating rises and depressions; exact authored TYPE row unconfirmed | 5,759 | 11,067 |

`origami-source-edges` is an additional line node sharing the origami position accessor. Its 868 segments come only from original source polygon edges. The glTF triangle conversion introduces no extra edge overlay diagonals. These edges are not newly inferred fabrication seams or crease classifications.

The detailed bending and colored meshes have exactly equal face indices. Removing their CAD display-row displacement leaves a maximum position difference of 0.0002445 mm, consistent with the source's stored precision but still a real difference. Each node therefore retains its own positions. Only byte-identical buffers are deduplicated. The color mesh preserves all 57,526 original RGBA values, with 741 unique colors; no color field is calculated or repainted. Its orange-dominant palette differs from the blue/orange shell strip in the artwork. The source's scalar values, units, display transfer and legend are not available, so this is an authored color view, not a newly verified Gaussian-curvature measurement.

## Bounded pipeline and geometry contract

1. `inspect_round06_sources.py` hashes explicitly selected inputs, records objects/layers/groups/cache/color coverage and verifies each original again after reading. Full paths and IDs are private audit fields.
2. `render_source_candidates.py` makes private CPU contact sheets from selected original polygons and colors. These were opened and compared with the reference and artwork. Neutral face lighting is only a viewing aid.
3. `export_round06_diagrams.py` consumes a private reviewed selection. The four thesis representations remove their known CAD display-row translations and use one shared pivot. Each experiment uses its original horizontal center and minimum-height pivot. All receive exactly one millimetre-to-metre conversion and the positive-determinant rotation `(x,y,z) → (x,z,-y)`. There is no shape normalization, decimation, remeshing or solver.
4. `verify_round06_diagrams.py` independently reads the source and glTF buffers. It compares every position, normal, triangle index, original edge and preserved color byte, then checks public bounds and removal of native paths/object IDs.

All preparation and full records live first under the designated private Round 06 D-drive workspace. Normal builds never read that workspace. Parent integration explicitly copies only the verified GLB and sanitized JSON into the release allowlist. No source document, original Rhino file, private selection or audit enters browser assets.

Prepared `source-diagrams.glb` is 3,467,136 bytes, SHA-256 `13fbd10da48e6aa71fe6bfb8c7711741293833f7bba33611f394f9b1543e505a`; measured gzip size is 3,067,420 bytes. Its metadata enumerates node names, local metre bounds, counts, display grouping and limitations. Seven meshes contain 129,747 original vertices and 240,792 triangles if all were displayed. The intended active representation has at most 106,879 triangles. These are measured asset costs, not a mobile performance guarantee.

## Scene and interaction proposal

The shared chapter clock owns all autonomous time. FORM/SYSTEM compare four original representations through a matched-camera sequence; PATTERN presents the three independent experimental sheets. A direct object hit can select a representation or engage bounded rotation, holding the shared loop while manipulating. Release returns the bounded offset toward the held authored view before normal playback resumes. No OrbitControls or second camera writer is introduced.

The existing source assembly remains a separate truthful overview/construction context. Variant changes use actual visibility or a declared presentation transition; low-resolution origami and opening meshes do not share topology and must not be presented as a simulated continuous bend. Even a topology-compatible pair is an authored geometry comparison, not a browser structural calculation.

Camera composition must fit each selected source's own bounds/support after chapter loop cues and user offset are resolved. Final evidence poses use the resolved lens without a later optical FOV multiplier. The compositor can provide autonomous decorative ASCII and a fluid transition outside readable evidence cores; these effects are explicitly unrelated to curvature or source deformation. Authored color comparison should use neutral/unlit display and preserve its palette rather than reacting like satin metal.

## Verification checkpoint

The independent source-to-glTF fidelity check passes for every selected vertex/normal/index and every original color byte. Source SHA checks before and after agree. Sanitized GLB/JSON contain no native paths or source object IDs. Installed Three 0.186.1 `GLTFLoader` parses all seven meshes and the edge node, with counts and bounds matching the metadata. Source geometry was visually reviewed through CPU contact sheets. Integrated WebGL rendering, responsive framing, pointer hit testing and chapter-loop acceptance remain subsequent checks at this handoff checkpoint.

The later integration checkpoint adds `source-scene-score.mjs` and the single `CinematicScene` writer. The scene fetches the diagram GLB once and verifies its actual binary SHA-256 before parsing. Every representation's geometry counts and authored color count are checked against the pinned public record. All seven node transforms remain identity. Original assembly metadata and its 51-object provenance remain separately available in diagnostics.

`prepare_round06_support.mjs` derives exact convex support from the sanitized public positions only: 1,130 points across the four thesis representations, and 487 across the three experiments. Support is not decimated or rounded. The fixed union of each family owns camera target, stage scale and framing; selecting another family member changes neither geometry scale nor the fitted comparison distance. The selected source's actual bounds still determine axial optical focus. Normal builds consume the public JSON, never the private preparation folder.

Five camera/selection tests pass. The actual public GLB is additionally projected in 825 combinations covering five viewport formats (1440×900, 1024×900, 768×1024, 390×844, 360×800), three loop phases, neutral/control-corner views, pointer extrema, every FORM/SYSTEM representation and every PATTERN experiment. All original positions remain inside the resolved viewport after the final focal-length conversion; minimum measured edge clearance is 3.003295% of its available viewport. This verifies the camera mathematics and source buffers, not actual DOM placement or real-device performance. Full projection evidence remains in the private Round 06 work folder. Browser rendering, gesture interaction and visual acceptance are still pending at this integration checkpoint.
