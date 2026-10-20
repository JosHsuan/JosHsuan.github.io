# Portfolio refinement: 3D Artist review

Date: 20 October 2026. Role: the existing 3D Artist, independently participating
in decision 0019. Status: source/code/image review and design handoff complete;
integrated native-browser, final visual and release acceptance remain pending.

## Decision and review boundary

Retain the five existing model appearance recipes. Their different material and
primitive treatments explain different work. The visual refinement should give
each source an unobstructed reading aperture, an adjacent caption and appropriate
inspection guidance. It does not require a common new shader, brighter lighting,
photo grade, point-to-solid conversion or fabricated assembly animation.

This role read the root and role instructions, `roles/3d-artist/SESSION_BRIEF.md`
and README, the root README, decisions 0001 and 0019, architecture Sections 00,
08, 13–15 and the website design guidance. The role applied its existing
`roles/3d-artist/skills/layer-compositing/SKILL.md` and round-02 compositing
contract. Current revision inputs were the refinement integration/team review,
UI/UX composition design, Scene Designer review, Geometry Engineer review and
3D Animation Designer review. The latest owner request and root allocation
authorize this cross-role review; the older isolated proposal desk remains
historical, and its saved preferences are not new owner design evidence.

Actual code inspected includes `components/project-study-scene.mjs`,
`project-study-appearance.mjs`, `research-scene-geometry.mjs`, the separate
Bending-source `project-model-recipe.mjs`, `ProjectCaseStudy.jsx` and its CSS,
`project-study-media.mjs`, `InformationSkin.jsx`, `app/globals.css`, XR's CSS,
and the scene/backdrop presenters. Public study records and the prepared
Caschlatsch and Mode/s handoffs were read. The current three generic recipe
files have no diff against published `7ff67ce9d8ad6df91657f615d892fa971d186327`.

This role changed only this document. It did not launch a browser, run a build,
capture GPU frames, alter runtime/data/assets, reopen original CAD or mutate Git.
Geometry Engineer's independently measured 567 fit cases are useful containment
evidence, not a replacement for native silhouette/readability acceptance.

## Images actually inspected

The following repository-local native captures were viewed, not merely listed:

- `animation-review/.local/newcase-transitions/native-2026-10-19T23-15-51.629Z/`:
  desktop System for Mode/s, Entrance, Dot, Caustics and Special Assemblies;
  mobile Dot System; desktop Caustics Results and Special Assemblies Making.
- `animation-review/.local/manufacture-xr-revision/live-7ff67ce/held-native/`:
  desktop Mode/s Context and mobile Caschlatsch XR guidance.
- `animation-review/.local/ocr-space-xr-live-ddafd44/2026-10-18T18-06-31.529Z/`:
  desktop Bending Form and XR Assemble phone.
- `animation-review/.local/portfolio-refactor-20261020/mode-video/`:
  `candidate-comparison-sheet.png`, with source/encode comparisons for both
  physical recordings and the simulation.

All ten new Caschlatsch public WebPs were individually viewed: timber model,
tower on site, voxel framework, module infill, XR interface, XR assembly
sequence, XR data exchange, XR workshop, robotic assembly and timber interior.
These are prepared source assets, not a native rendering of the new layout.
Their original-PDF extraction/credit verification belongs to Information
Designer. This review does not independently claim a complete PDF extraction
audit or authorship identification.

The older native images show specific defects. Lower model geometry is covered
by the caption block in Entrance, Dot, Caustics and Special. Technical diagrams
within those captions become small thumbnails even when the source itself is
large. The mobile Dot capture shows prose and navigation but does not offer a
visible complete-model reading position at that sampled scroll point. The
preceding Caschlatsch XR capture places the rejected bright workflow behind
extended prose. These are reasons to implement source-sensitive composition;
they do not accept the pending replacement layout.

The Bending reference establishes a deliberate object aperture, a distinct
explanation and useful visible interaction/return language. XR's reference
shows the full recorded portrait interface at an appropriate viewing distance.
Its phone geometry belongs to that research source; copying a phone shell onto
Caschlatsch's authored multi-phone figures would change their meaning.

## Material and silhouette decisions

The inspected generic renderer uses transparent output, sRGB output, ACES Filmic
tone mapping and exposure 1. Each source retains its own transforms, geometry,
UVs and texture references. Presentation uses scoped material clones; disposal
restores source assignments before releasing clones/environment/lights. Keep
that ownership. The PMREM room is a presentation environment, not a measured
reconstruction of the original workshop or site.

| Project | Current appearance and source meaning | Adopted refinement decision |
| --- | --- | --- |
| Mode/s of Making | Neutral nonmetallic model, linear RGB `[.76,.77,.74]`, roughness `.88`, room environment `.32`. It is a geometry study alongside separate original simulations and physical foam cutting. | Preserve the neutral form and complete openings. Give the model a clear aperture; captions must not cover the lower units. Keep real cutting, simulation and model visibly distinguishable through accurate source captions. Do not imply the model is a live cutter or render the foam with invented material detail. |
| Entrance Installation Art | Neutral metallic folded-panel study, RGB `[.58,.60,.62]`, metalness `.9`, roughness `.36`, environment `.85`. | Keep the existing highlights and triangular opening contrast. Preserve the complete base/core/surface at a useful source-reading position. Give the actual portrait installation and night movie height rather than cropping into a wide well. The night photograph/movie supplies observed illumination; no new emissive lighting simulation is needed. |
| Dot-Based 3D Printing | One actual point object. The appearance uses RGB `[.48,.68,.80]`, size `2`, `sizeAttenuation=false`, `toneMapped=false`, without PMREM or light objects. | Retain the sparse blue sample points and their negative spaces. This is a path/sample-position view, not a translucent finished solid or particle solver. Keep the existing quiet local backdrop support and prevent the caption from covering the point form. Do not add bloom, depth blur, enlarged particles or connecting surfaces to imitate a physical print. |
| HC3DP Caustics | Native MeshPhysicalMaterial clone retains the source physical fields and textures; the accepted recipe sets IOR to approximately `1.57`, environment `.7`. | Preserve source transparency, highlight structure and silhouette. Separate the inspectable shade geometry, near-square recorded path and actual photographed light pattern. The browser material is an illustrative shape presentation; it is not a caustic prediction or proof of print success. Fix caption/aperture overlap before proposing exposure, transmission or contrast changes. |
| Special Assemblies | Neutral warm wood-like presentation, RGB `[.49,.34,.20]`, nonmetallic roughness `.76`, environment `.45`; all 60 source renderables retain their relationships. | Keep the fine-member silhouette and existing quiet local background support. A large empty aperture around the actual form is preferable to thicker members or an outline pass. Preserve the finite robot simulation's full frame and ending. Do not introduce exploded parts, growth, unverified movement order or collision claims. |

The non-point rig has hemisphere plus warm key/cool fill/rim lights, without
cast shadows. These are fixed accepted recipes. No inspected image establishes
a need to change them. Mathematical containment does not establish that all fine
members remain readable at a particular DPR, so native desktop and narrow-screen
review must still check Dot's points, Special's thin sticks and Caustics' bright
transparent contours after the new prose/caption placement.

## Source surfaces and optical hierarchy

Adopt the Scene Designer's split/broad/reading policy and 799/800px model
breakpoint alignment. Keep the actual renderer aperture and camera recipe;
change the surrounding document composition. On all model chapters there must
be a reachable scroll position where the complete silhouette is clear of fixed
chrome, source caption and reading panel. Model inspection help and state follow
the aperture; caption links remain independent keyboard/pointer targets.

For documentary sources, retain `object-fit:contain`, normal blending and
`filter:none`. Do not tint, invert, blur, mask internal labels, apply elastic
deformation or crop a source to make it match the dark website. Letterboxing is
appropriate. Reading glass and its local skin may respond to scrolling, but
source pixels and authored figure lettering remain separate from that optical
effect. The existing source transaction owns outer translation/opacity, so CSS
must not add a second crossfade or independent transform writer.

The visible hierarchy is source aperture, caption/credit/source access and
controls, then continuous prose. Bright technical plates need their full
unobstructed aperture; dark optical photographs need the same framing without
artificially brightened blacks. Keep essential text on the existing standard
reading material. Optical Liquid Glass remains confined to its approved floating
controls. This follows the compositing boundary without transplanting Bending's
scene-derived effects into generic documentary material.

For Caschlatsch, adopt one complete technical figure per row. The voxel plate
contains five class areas and Fig.2-03; the infill plate contains the authored
orthogonal/diagonal and five-/thirty-beam comparisons. The XR interface contains
four phone representations with their original labels; assembly sequence keeps
both rows and Fig.2-08; exchange keeps the complete CAD/cloud/app data flow and
Fig.2-09. None should become a decorative narrow background, two-up thumbnail
or simulated live application. Preserve original labels, arrows and proportions.

Full-image links are necessary for native-size reading on a phone; they are
not a reason to accept unreadable primary staging. Keep the source figure
complete at the overview scale, then permit ordinary browser zoom through its
full-source link. The 662×373 workshop image has limited native detail. It can
support the assembly story at an honest size; sharpening/upscaling cannot make
it new high-resolution evidence. Preserve timber photographs' source colors
and the visible built/workshop setting. Remove the rejected active Design,
fabrication and assembly graphic as the source handoff specifies.

The Mode/s comparison sheet supports the selected compact candidates at its
displayed comparison scale: actual cutter/foam contact remains recognizable,
the blue holder and cut silhouette remain distinct, and the simulation's line
structure remains recognizable. It does not prove temporal artifacts absent
or replace native full-frame playback review. Preserve the actual soft source
appearance in A. Neither web compression nor proportional simulation reduction
is encoded-packet/decoded-pixel identity; provenance must retain that distinction.

## Native and fallback semantics

Availability must come from the existing scene owner's `canInspect()` facts:
actually painted source, current eligible chapter, held/settled passage and
permitted lifecycle/policy. A canvas element alone cannot justify “drag to
inspect.” Show preparing, available, paused or original-source state honestly.
Use the dedicated empty inspection target; do not let Arrow/Home/Escape on a
source link change the camera. The scene key handler needs the native-control
exclusion identified independently by Geometry and 3D Animation reviewers.

Poster reading remains a complete source alternative under Reduced Motion,
Save Data, failed WebGL/media and no JavaScript. It must not retain an empty
animated well or advertise unavailable inspection. A held video starts only
from actual first-frame/native transport facts, with source caption and pause/
replay nearby. Native video owns time. One selected source and at most one
playing recording remain; page scroll does not become a fabrication simulator.

## Acceptance for the integrated candidate

This role's no-recipe-change decision and composition recommendations are ready
for adoption. Final acceptance requires current built-artifact evidence:

1. All six cases at desktop and mobile, plus 1024px, 800/799px, 320px and low-height
   landscape checks. Inspect the source aperture, complete caption/control group,
   long prose ending and supporting figure rather than only the heading.
2. Every eligible model chapter has a complete-source reading position and
   readable fine structure. Check native first paint, actual-hit drag, miss,
   vertical touch reading, arrows and exact Home/Escape return. Source links
   retain ordinary keyboard behavior. Material/source facts remain unchanged.
3. Original Caschlatsch technical labels/captions remain complete; source links
   permit native-size reading. No rejected workflow or invented interactive XR
   replaces these figures. Verify full-frame bright and dark evidence against
   the same quiet reading/control hierarchy.
4. Compact Mode/s sources show actual operation and independent native playback
   through forward/reverse selection and pause/return; no diagram substitution,
   source deformation, crop or movie-end chapter advance. Special's finite
   simulation holds its real last frame and exposes Replay.
5. Reduced/data/static/error/no-JavaScript/print retain a useful source and text.
   Forward/reverse interruption, hidden/BFCache and departure preserve the
   existing transaction/clock and close their resources without stale pixels.
6. Matched Bending/XR desktop/mobile source and interaction checks establish
   visual preservation after shared refactoring. Bind final acceptance to the
   actual CI artifact and live deployed bytes, with physical-device limits
   stated separately. Historical screenshots do not accept that candidate.
