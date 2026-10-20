# Portfolio geometry refinement review

Date: 20 October 2026. Role: the existing Geometry Engineer, independently
reviewing decision 0019. Status: source/CPU review complete; integrated native
browser and exact-release acceptance remain pending.

The review follows the current root and Geometry Engineer instructions, the
role's geometry-review method, the empty-framework decision, architecture and
website guidance, the refinement integration contract, the Director's team
review and the UI/UX composition proposal. It owns this review only. No model,
recipe, public record, original source or runtime file was changed by this role.

## Decision

Keep all five current source GLBs and their camera/material/light recipes.
There is no geometric reason to convert, simplify, recenter, rescale or deform
them for the proposed design. Improve the source aperture, adjacent explanation
and dedicated inspection focus target around those existing renderers. Keep
Caschlatsch documentary: its original portfolio figures supply the requested
voxel/XR evidence without introducing an unreviewed CAD model or simulated XR.

The actual camera fit conservatively encloses the original transformed source
bounds. Enlarging a source well in CSS must not be implemented by altering
source positions, authored node transforms or a per-project camera recipe.
The renderer's established model aperture remains separate from the new broad
photograph/recording composition.

## Fresh source and framing measurements

The five public GLBs were read, SHA-256 checked and actually decoded using the
installed GLTFLoader and MeshoptDecoder. Their complete public model records
were compared with the published application `7ff67ce9d8ad6df91657f615d892fa971d186327`.
Each record, including units, bounds, eligible chapters and chapter views, is
unchanged. Actual decoded positions were streamed through the original world
matrices; renderable/vertex/triangle counts, all index ranges and world bounds
match the pinned metadata. All measured positions are finite. None of the five
GLBs contains skins, morph targets or authored animation channels.

| Project | Source SHA-256 | Bytes | Vertices | Triangles | Source renderables |
| --- | --- | ---: | ---: | ---: | ---: |
| Mode/s of Making | `0a6963f5a206d0dc11b5fd9b0d9fc5e2a09085058d86bca62f3fb435a237cee0` | 13,987,056 | 699,860 | 1,026,294 | 1 |
| Entrance Installation Art | `cb7b5ea27a47c9451bd4220c835fb158aa3e65be19deff684f40eb076c43376c` | 18,828,876 | 897,015 | 997,599 | 1 |
| Dot-Based 3D Printing | `60d49fe978cf0fb552c39f7188a9811dc39aa2e163b3a3388b192dbae502e891` | 122,884 | 14,810 | 0 | 1 point object |
| HC3DP Caustics | `0dd22b441c422f2a9c2406d79288284ee7fc56f1f3028ae453015b3add40bb4a` | 50,438,508 | 1,894,748 | 2,360,266 | 1 |
| Special Assemblies | `43de5ca2dd8095a125d7f29e58851b5a80dc9588625912918d75dbadae8e28df` | 117,672 | 2,040 | 3,840 | 60 |

The current `fitResearchCamera` was exercised on all eight corners of each
measured world-space AABB. The test combined every eligible chapter view with
azimuth offsets `[-0.9, 0, 0.9]`, elevation offsets `[-0.4, 0, 0.5]` and the
renderer's actual pitch clamp. Viewports were 1440×1000, 1024×768, 800×768,
799×844, 390×844, 320×568 and 844×390. This gives 567 fits: 126 each for the
four two-chapter models and 63 for Dot's single chapter. Every corner remains
within the source aperture frustum and near/far interval; the largest absolute
horizontal/vertical normalized coordinate is approximately 0.846085.

That is mathematical containment, not a human acceptance of silhouette size,
glass overlap, pointer hit precision or readability. The desktop aperture's
right edge is at 99% of viewport width; the built native composition and
available prose column still need review at 800/1024px. This review does
not propose changing that established camera/aperture recipe to mask a prose
layout problem.

Source matrices have positive determinants. Mode/s, Entrance and Dot use 1;
Caustics retains approximately `1.0000001424923682e-9`, and Special retains
`1e-9`. These smaller authored/conversion transforms are already represented
in the measured world bounds. Do not apply another millimetre/metre conversion
or infer source size from an untransformed POSITION accessor.

The following recipe files are byte-identical to the same published baseline:

| File | Current SHA-256 |
| --- | --- |
| `components/project-study-scene.mjs` | `965cca9fd4bf2704dc757ae61704996467834861132868debc87b20ed85d3e57` |
| `components/research-scene-geometry.mjs` | `83effc1e5770b226cc5e1bf8ef82c3f27ec60012296626af28ed379af80a6764` |
| `components/project-study-appearance.mjs` | `9314e35913f3bc2547f16dd319773beb35357582f8bc7159fecab3d1e4e5b0b8` |
| `components/project-model-recipe.mjs` | `8853992d826fa710441bffda22283963972fda78e508eb3cdb4956b72418fdc4` |

The last file is the separate Bending-source Home card recipe, not the generic
five-model camera adapter. Preserve that distinction in any architecture
refactor. No original CAD was reopened or reconverted during this review;
unchanged pinned derivatives do not constitute a new audit of every original
CAD object or a claim of manufacturing/structural validity.

## Actual rendering and interaction ownership

`components/project-study-scene.mjs` validates source bytes and SHA before
decoding, rejects nonembedded resource URLs, checks primitive/count/bounds
metadata, and counts actual participation of every source renderable during a
successful draw. Readiness requires that first draw. `resize` and `present`
draw only on changed source/size intent. The scene alone writes its camera;
no object-position edits are required for inspection.

`runtime/site/ProjectStudyScenePresenter.mjs` owns bounded azimuth/elevation
intent, damped return and gesture closure. It advances on the ordinary site
driver's clock. In external-stage mode, the shared backdrop transaction owns
the surface translation/opacity; the scene presenter paints only the source
chapter actually displayed. The material lease restores original assignments
before source disposal and owns only its clones/environment/lights. Preserve
these divisions rather than adding a UI camera writer or a second render loop.

Pointer acquisition checks the native ray against the source scene. Dot uses
point proximity with `Points.threshold = source span × 0.015`; this is not a
triangle hit or an exact rendered-pixel test. Preserve its point primitive and
truthful path description. A bounding rectangle alone must not begin a model
gesture. Vertical touch motion is released to native reading before horizontal
commit; pointer cancellation, focus departure, policy changes and chapter
changes close capture and restore the chapter viewpoint.

One concrete interaction defect needs implementation attention: currently
`ProjectCaseStudy.jsx` puts `data-project-model-control` on the complete visual
slot, including caption links. The scene presenter's keydown handler checks
only that ancestry and does not apply its existing blocked-native-target
guard. Thus Arrow/Home/Escape can be intercepted when a caption/source link
has focus. The proposed dedicated focusable empty-aperture target fixes this
DOM relationship. Also guard native interactive/editable targets in the
keydown handler as defense against future markup changes. Do not duplicate
keyboard handling in React or make the caption itself an inspection target.

Publish any new visible help state from the existing `canInspect()` predicate:
the resource must have painted, the source must be current and held/settled,
and site/readiness/policy must permit inspection. Canvas presence or a past
successful first draw alone is insufficient. A small discrete state such as
preparing/ready/paused/static can be published only when it changes. That state
must update after stage, chapter and policy changes as well as load/error
callbacks. It must not create per-frame React state, a polling timer or a new
clock. Keep the full-source link independently focusable and expose useful
static/failure copy when inspection cannot run.

## Replacement imagery and motion handoffs

The proposed Caschlatsch handoff was read from
`animation-review/.local/portfolio-refactor-20261020/caschlatsch-materials/caschlatsch-public-integration-proposal.json`.
All ten prepared public WebPs were freshly byte/hash checked and decoded using
Pillow. Actual dimensions and RGB SHA-256 match the handoff. For each raster
figure crop, the recorded integer rectangle dimensions equal the output
dimensions. The handoff explicitly records no internal reassembly, relabelling,
geometric deformation, colour grading or post-raster resize. This independent
check establishes consistency of the prepared outputs with that handoff;
Information Designer owns verification against the original PDF.

The proposed placement is coherent: the timber model opens; the tower situates
the work; System shows the complete voxel framework and module infill; XR shows
the original assembly sequence, exchange and interface; Making shows workshop
and robotic assembly; Results shows the built interior. Keep the five technical
plates full width with `contain` and a full-image link. Their aspects range
from 1.274 to 2.705; they must not inherit the rejected 3.2:1 workflow well.
The 662×373 workshop photo must retain its finite native detail. Do not invent
inspect controls for Caschlatsch or turn authored phone screenshots into live
XR functionality. Remove `workflow.webp` from active placements while retaining
its historical pin as directed by the source role.

The Mode/s replacement handoff was read from
`animation-review/.local/portfolio-refactor-20261020/mode-video/recommended-motion-replacements.json`.
All three recommended candidate files were freshly byte/SHA checked and probed
with FFprobe. The actual streams match the proposed counts and dimensions:

| Motion | Duration | Frames | Output | Bytes | Required framing distinction |
| --- | ---: | ---: | --- | ---: | --- |
| `film-physical-cutting` | 8.008s | 240 | 1920×1080 | 3,167,168 | Real operation; source frames [90,330), no crop/resize. |
| `prototype-cutting-operation` | 8s | 200 | 1920×1080 | 3,176,212 | Real operation; source frames [150,350), no crop/resize. |
| `film-machine-simulation` | 4.8s | 120 | 1920×1080 | 498,303 | Complete simulation; proportional 4096×2304→1920×1080 downsampling. |

The physical excerpts preserve the 16:9 source frame. The simulation's uniform
scale is 0.46875 on both axes. A proportional raster reduction changes pixel
detail without changing shape; it must remain disclosed and must not be
described as 4K pixel identity. The handoff correctly disclaims encoded-packet,
decoded-pixel and reordered-DTS identity. Native first-frame decode, advancing
time, visual quality and source semantics still need built-browser acceptance.

## Checks run and outstanding acceptance

Node 24.19.0 and pnpm 11.19.0 were confirmed. This role ran the following CPU
tests, all 28 passing:

```powershell
node --test roles/uiux-designer/cases/bending-active-thesis/tests/project-study-scene.test.mjs roles/uiux-designer/cases/bending-active-thesis/tests/research-scene-geometry.test.mjs roles/uiux-designer/cases/bending-active-thesis/tests/project-study-appearance.test.mjs
```

Those tests cover real fixture GLTF parsing and POSITION retention, first-draw
source participation, ownership/disposal, point treatment, camera containment,
vertical touch release, interruption and one-clock lifecycle. Mock renderer
results are not native GPU acceptance. No browser, GPU, build, original CAD
write or Git mutation was performed by this role.

Before release, the integrated built artifact must show all six cases across
desktop/mobile and intermediate widths, including every complete source/caption
and the ends of long prose. For all nine eligible model chapter views, inspect
actual first draw, hit and miss, horizontal drag, vertical touch reading,
focus/arrows/Home/Escape and independent source-link keyboard behavior. Exercise
chapter reversal while dragging, pause, reduced/data/static/error, hidden/BFCache
retention and true departure disposal. Assert immutable source revision/counts
before and after those interactions. Caschlatsch needs complete original figure
labels and accessible native-size source reading; Mode/s needs the three
independent native media times and at most one playing source. Neither case
should gain fabricated geometric interaction.

Repeat matched Bending/XR desktop/mobile native checks after any shared change.
The source/CPU findings above do not accept the pending UI implementation, exact
CI artifact, deployment or physical-device performance. Recheck unchanged model
pins/recipes and integrated inspection state against the final candidate.

The [glTF 2.0 coordinate and transform specification](https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#coordinate-system-and-units)
supports the unit/axis and retained-node-transform boundary. Source geometry
and camera framing remain separate responsibilities; an attractive screenshot
cannot replace their verification.
