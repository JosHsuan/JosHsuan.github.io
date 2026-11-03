# Photograph-led source materials — 3 November 2026

The owner's current material direction supersedes the earlier uniform neutral
display finish. The original CAD geometry, asset bytes, source credits and one
renderer/clock remain protected. This review concerns the six generic project
routes and the additional Mode/s machine. XR and Bending have separate owners.

## Evidence and visual decisions

All references below are already reviewed, pinned public derivatives under
`release/public/assets/projects/`. They were opened and visually inspected.

| Project / photograph | Observed material evidence | Implemented presentation | Limits |
| --- | --- | --- | --- |
| Mode/s, `machine-prototype.webp`, `prototype-cutting-operation-poster.webp` | Silver extrusion frame and round guides; blue printed brackets and clamps; black motor bodies/belt; teal holder; heat-darkened copper/metal tool; white foam blank | Ten component families, selected from the original named CAD layers and separate motor-body geometry. Brushed metal, printed layer variation, rubber, copper and EPS use one PBR program and one original draw. | CAD layer display colors are not photographic evidence and were not copied. The unique rotated cubic workpiece is associated with the photographed EPS blank by geometry/context; this association is an inference. No actual wiring or missing hardware is invented. |
| Mode/s, `film-physical-cutting-poster.webp`, `toolpath-textures.webp` | White/off-white EPS cells and rotary tool striations | Fine cellular roughness and filtered horizontal cutting striations on the original unit study and selected machine blank | These are procedural material cues, not scanned texture maps or proof that the complete digital assembly was physically built. |
| Entrance, `hero.webp` | Satin gray folded metal faces, sharp seams, pale interior/opening areas; upward close view | Satin metallic response, restrained fine finish variation, warm key and cool grazing reflections | The current source is the original complete CAD scheme. Material does not reconstruct photographed infill or change any opening, panel, support or base. No chrome/mirror coating claim. |
| Caschlatsch, `portfolio-timber-interior.webp`, `portfolio-tower-on-site.webp` | Pale warm timber, visible longitudinal grain, varied exposed faces and deep layered lattice | Timber fibre directions follow the principal long axis of each of 2,433 original cached Breps. Fine pores/grain affect color, roughness and analytic normals; light reveals front/back depth. | No species, moisture, measured finish, exact knot placement or as-built texture registration is claimed. |
| Special Assemblies, `assembly-detail.webp`, `hero.webp` | Slender brown wooden dowels with longitudinal fibre; pale joins in the physical photograph | Grain follows each of the 60 retained source cylinders' existing local Z axis, transformed to world coordinates; warmer wood finish | The source stick study is retained. Photographed glue joints, robot and bench are not invented as model geometry. |
| HC3DP, `hero.webp` | Clear/translucent deposited polymer, layered highlights and transmitted light | Existing physical shader and evidenced IOR 1.5700000524520874; photo-informed dielectric metalness 0, roughness .12, full transmission, optical thickness .0015 m and opacity 1; fine filament variation | The optical thickness is a display parameter, not a measured wall thickness. Photographs remain evidence for real caustics; the renderer does not claim caustic simulation. Other original maps and channels remain shared, and originals restore on disposal. |
| Dot printing, `translucent-prototypes.webp` | Pale translucent deposited material, visible discrete construction | Pale circular depth-cued native point samples, still all 14,810 points | A point-path dataset is not relabeled as a fabricated solid. No synthetic connecting mesh or surface reconstruction is introduced. |

## Additive derivatives and source fidelity

The machine derivative is `machine-materials.glb`, 10,309,368 bytes,
SHA-256 `4b70d53fe51ed04e039285d797c1ead2babf027ffc05244b45080757a5877da9`.
It adds only `_SURFACE_FAMILY`, with 503,822 scalar values. The encoded addition is
31,810 bytes. The original `machine.glb` stays present and pinned.

Caschlatsch's `model-materials.glb` is 1,176,628 bytes,
SHA-256 `4cf15112d405619ec27bc82fb81738f12d2da222ac1b720fd79f970a53af3e93`.
It adds only `_FIBER_AXIS`, with 61,362 three-component unit vectors. Each original
member's unique cached vertices define its covariance principal axis; the
smallest major-to-second variance ratio is 1.75634, with no isotropic member.
The encoded addition is 93,311 bytes. Original `model.glb` stays present/pinned.

Both derivatives retain all four original accessors, compressed buffer views
and complete compressed geometry bodies byte-for-byte. There is no quantization,
reordering, simplification, smoothing, source position/normal edit or extra
primitive/material group. Source originals are hashed before and after reads.
Public receipts contain no private drive paths or source object UUIDs:

- `roles/geometry-engineer/verification/machine-surfaces-2026-11-03.json`
- `roles/geometry-engineer/verification/caschlatsch-surfaces-2026-11-03.json`

## Runtime, optics and performance

`project-study-materials.mjs` composes the original shader hooks. Microstructure
uses analytic world-space height gradients. Anti-alias filters apply after the
analytic derivative; no derivative of an `fwidth`-dependent height is taken.
Source geometry and textures remain caller-owned, and all clones are reversible.
The two timber vertex variants have distinct program-cache identities.
The machine's long foreground profiled rail is explicitly silver aluminium even
though the CAD author grouped it in the printed-part layer. The long soldering
shaft has its own heat-darkened steel family; only the knife/loop uses copper.
The hidden underbed plate remains a CAD-layer inference, since the photographs
do not establish its finish clearly.

Three 0.186.1's transparent-canvas transmission pass initializes its target to
white with alpha .5. Without correction this makes the clear HC source appear
milky against the shared CSS background. The HC-only shader removes that known
fallback contribution using its alpha weight. Opaque transmitted scene content
(alpha 1) and physical reflection channels are retained. The CSS field is not
captured, and no extra render pass is added.

There are no new textures, material groups, shadow refreshes or per-frame source
traversals. Original source draw counts remain 1 for each merged source and 60
for Special Assemblies. Existing contact receivers/shadow passes remain separate
editorial scene resources. The 12 Hz light-time sampling remains, camera yaw is
immediate, and the camera director can supply bounded showcase light multipliers.
The fixed shadow key never moves; no environment rebake accompanies light motion.
Entrance and Caschlatsch both cast and receive that same cached shadow, restoring
depth at member/panel intersections without another shadow draw. The reviewed
overview/detail captures showed no visible acne; original receive/cast flags are
restored when the appearance lease ends.

## Verification

The local serial source review loads the actual seven selected GLBs with Three's
real GLTFLoader/MeshoptDecoder, installs the production appearance, renders and
captures each source. All seven compiled/drew without page or shader errors;
original vertex/triangle counts and source draw counts match. Machine and timber
close captures exposed and resolved the former uniform finish and cross-member
grain direction. This standalone review is material evidence, not a substitute
for the parent-owned built Pages/Home/case browser gate or publication checks.

Focused CI independently compares complete original compressed bodies/views,
loads both derivatives, verifies all attribute values and every triangle's
constant family/axis, checks the original and new release pins, tests missing
attribute rollback, composed hooks, cache separation, finite bounded lighting,
12 Hz sampling and exact original resource restoration.
