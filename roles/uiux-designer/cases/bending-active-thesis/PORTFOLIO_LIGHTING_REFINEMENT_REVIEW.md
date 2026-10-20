# Portfolio refinement: lighting and evidence readability

Date: 20 October 2026. Role: the existing Lighting Designer.
Status: independent source/code/capture review and implementation handoff.
Integrated browser, device and release acceptance remain pending.

## Evidence and boundary

This review follows [decision 0019](../../../../docs/decisions/0019-portfolio-refinement-and-runtime.md),
the [refinement integration](PORTFOLIO_REFINEMENT_INTEGRATION.md),
[Director findings](PORTFOLIO_REFINEMENT_TEAM_REVIEW.md),
[UI/UX proposal](PORTFOLIO_UIUX_REFINEMENT_DESIGN.md),
[Scene Designer handoff](PORTFOLIO_SCENE_REFINEMENT_REVIEW.md), and
[3D Animation Designer review](PORTFOLIO_3D_ANIMATION_REFINEMENT_REVIEW.md).
The role read the current root/role instructions, README, decision 0001,
architecture Sections 8.4–8.6, website priorities and reference translation,
its lighting-direction skill and research contract, and the existing shared
Round 02 layer contract. The newer source-preservation/refinement scope controls
this review; no new light score is needed.

Actual code inspected:

- `components/project-study-appearance.mjs` and `project-study-scene.mjs`:
  source-bound static appearance lease, model fit and genuine source paint.
- `components/ProjectCaseStudy.module.css`, `ProjectCaseStudyStage.jsx` and
  `cinematic.module.css`: source containment, local model contrast surface,
  reading positions and shared atmosphere/field stacking.
- `app/glass-materials.css` and `app/globals.css`: actual reading/control
  substrate, fallback, preference and ink tokens.
- `runtime/background/BackgroundRuntime.mjs`, `components/page-field-renderer.mjs`
  and `runtime/site/ProjectStudyBackdropPresenter.mjs`: atmosphere publication,
  independent field, and the one source transform/opacity transaction.

Actual images viewed were all ten newly prepared Caschlatsch portfolio extracts:
timber interior, timber model, robotic assembly, XR workshop, tower on site,
voxel framework, module infill, XR interface, XR assembly sequence and XR data
exchange. The Mode/s source/CRF comparison sheet was also viewed: the pale
tool-contact close-up, dark physical prototype and white simulation frame.
These are the preparation outputs under the ignored
`animation-review/.local/portfolio-refactor-20261020/` review directory.

Native preceding-release images actually viewed include desktop System on all
five model cases, desktop Mode/s Cutting and mobile Caschlatsch XR guidance.
The four Entrance/Dot/Caustics/Special images are from the retained
`source-story-revision/ci-39363796520/live-native/` receipt; Mode/s and Caschlatsch
are from `manufacture-xr-revision/final-local-native/`. Their source state and
composition are historical evidence, not acceptance of the redesigned output.
No browser, GPU render, build, new source processing or benchmark was run by
this role. Original photographs and diagrams were inspected, not relit.

## Decision: retain lighting, correct composition

The accepted five-model rig already separates the actual geometry from the
dark surroundings. The reviewed Mode/s assembly and Entrance panel faces retain
internal relief; Dot remains visibly discrete points; Caustics retains its
patterned silhouette; Special retains thin reciprocal members. Some source
regions are covered by the old caption/rail composition. That is a placement
defect and does not justify stronger key light, brighter exposure or a different
material. Preserve the profiles and camera recipes exactly.

| Existing source profile | Inspected values to preserve | Readability consequence for the new layout |
| --- | --- | --- |
| Mode/s | neutral color `[.76,.77,.74]`, roughness `.88`, environment `.32`, hemisphere `.4`, key/fill/rim `2.2/.35/.55` | Pale units need their existing dark surrounding aperture, with their full silhouette available before the caption enters it. |
| Entrance | neutral color `[.58,.60,.62]`, metalness `.9`, roughness `.36`, environment `.85`, hemisphere `.25`, key/fill/rim `2.2/.3/1` | Broad highlight and triangular openings remain readable without a white backdrop or extra rim. Preserve the full portrait source and safe caption position. |
| Dot | point color `[.48,.68,.80]`, fixed `2px` points, no environment, `toneMapped=false` | Do not replace the points with a solid surface or larger emissive dots. Keep the existing restrained dark local surface and avoid caption overlap. |
| Caustics | native physical material, IOR `1.5700000524520874`, environment `.7`, hemisphere `.18`, key/fill/rim `1.9/.25/1.2` | Existing bright ridges must remain distinct from the photographed light observations. A browser highlight is not evidence of a generated optical result. |
| Special Assemblies | neutral color `[.49,.34,.20]`, roughness `.76`, environment `.45`, hemisphere `.35`, key/fill/rim `2/.3/.65` | Thin warm members compete most with the copper decorative field. Retain the existing dark local surface and obtain clear inspection space through layout. |

These are presentation recipes, not measured source material coefficients.
The shared rig uses warm key `#fff4e6`, cool fill `#b5ccec`, rim `#a9c8ed`, and
hemisphere sky/ground `#d9e3ef`/`#4a4138`. Directional positions are defined
relative to the original bounds; none casts a new shadow. Preserve their
source-bound positions, the 128-face room PMREM, environment rotation `.35`,
single color-management path and ownership/disposal. No light animation,
exposure response, bloom, new ground or shadow pass is proposed.

## Original evidence and material handoff

1. **White technical plates remain opaque authored documents.** The voxel and
   infill figures contain pale gray lines, red construction axes and small
   original labels. The XR figures include white page fields, phone interfaces,
   fine arrows and their figure captions. Use the Scene Designer's broad
   contained aperture, one complete technical plate per row and normal blending.
   Keep source opacity `1` at hold, `filter:none` and the complete aspect. Do not
   invert, recolor, contrast-grade, sharpen, make white transparent or add a
   translucent image mask. Their light paper is an intentional documentary
   contrast with the dark website, not a color-system error.
2. **Place the caption and narrative outside the source-reading aperture.**
   The inspected old mobile Caschlatsch frame places a white rectangle directly
   behind an extended reading panel. The panel remains readable, but the source
   cannot be read. Source-first broad composition followed by the grouped
   caption/credit/full-image link and then prose resolves both concerns. Adopt
   the existing Scene bounds: broad desktop 8vw side insets, top
   `max(7rem,14svh)`, at most 64svh; narrow 1.25rem insets, top
   `max(8.5rem,16svh)`, at most 52svh, each limited by the stated bottom-safe
   area. These are layout reservations, not new image scaling or camera values.
3. **Keep the physical recordings' distinct lighting.** Mode/s A is a soft,
   pale close-up; B has bright foam, blue clamps and a dark background. The
   comparison sheet retains tool contact and texture in both. Use one quiet
   containing frame and the same caption material for both. Do not lift B's
   blacks, warm its foam, sharpen A or color-match either to the CSS atmosphere.
   Existing source softness cannot be fixed through browser effects. The old
   B image has its lower source/caption and right rail competing; the broad
   aperture and following caption must remove that collision.
4. **Preserve the portfolio photographs' existing tonal story.** The interior
   has sunlit timber/blue sky, the model has a cool bright base, robotic assembly
   has a bright workshop, XR workshop has a close physical action, and the site
   tower has dark foliage and pale timber. Keep those differences. Use complete
   frames and native full-image links instead of a common grade or cropped
   decorative tiles. Preserve existing visible source authorship and credits.
5. **Use existing semantic reading tokens.** `--material-reading-ink` is
   `#f0f3f2`, muted ink `#dfe6e3`, accent `#ffeadf`, fallback `#202526` and border
   `rgb(237 244 241 / .22)`. In the regular capability path the substrate is
   `rgb(24 29 30 / .72)` beneath a faint highlight, with 18px backdrop blur
   (14px at the existing narrow material breakpoint). Keep this shared policy;
   do not brighten generic prose to match a white source or add a per-case
   glass preset. Native reduced-transparency/contrast and forced-color
   preferences already select meaningful solid/system materials.

An analytic sRGB check gives approximately 12.23:1 for muted reading ink on the
opaque fallback. For only the regular `.72` substrate over solid white, ignoring
the faint highlight and all native blur, the same calculation is approximately
5.31:1. These numbers explain why a retained dark substrate is useful; they do
not verify composited glyph contrast in a browser or prove an entire panel is
accessible. The range capability uses another backdrop processing path and
coarse-pointer devices deliberately retain the regular substrate. Final native
bright/dark source checks must cover both actual capability paths and fallback.

## Decorative atmosphere and source ownership

The shared CSS atmosphere uses cool RGB `95 144 166`, warm `184 133 80`, initial
energies `.64/.36`, graphite-blue gradient and the existing vignette. The
independent page field uses copper RGB `[224,123,59]`, gain `.65`, a bounded
source-over glyph alpha and the existing 900,000-pixel/12,000-cell/30Hz limits.
It does not sample the five models' radiance and must not be described as their
light simulation. Bending's separate source-depth field retains its own role.

Do not change the global field palette/gain, shared material optics or shared
atmosphere to rescue one generic chapter: that could change Bending/XR. Opaque
documentary media must composite above the decorative field, with no glyphs or
vignette burned into source pixels. The existing `.23` dark radial local
surface for Dot/Special is a backdrop outside the source geometry and remains
the bounded contrast aid; no additional per-source halo is needed. Verify its
center follows the already accepted desktop/mobile model aperture after layout.

The one backdrop transaction remains the sole outer transform/opacity writer
for source entry/exit. Intermediate opacity during that finite transition is
intentional; a fully held source returns to `1`. Do not add an independent CSS
fade, colored source flash, automatic exposure adjustment, canvas sampling
loop, extra light tick or second RAF to coordinate the new broad composition.

## Required integrated acceptance

The role recommends adoption of the above layout/material bounds with **no
lighting-recipe change**. Root/UIUX acceptance must still inspect the built
artifact after source integration and implementation:

- All six cases at desktop, tablet, 800px/799px boundary, 390px and 320px narrow
  widths, plus low-height landscape. Inspect source aperture, caption/credit
  ending, heading and final paragraph independently; a heading capture cannot
  establish source readability.
- All five real model renders at held view and actual-hit inspection/return:
  relief, point primitive, thin members and highlight separation remain visible
  with the unchanged recipe. No prose, control or rail covers the only usable
  inspection area. Capture actual return to the original view.
- Original voxel/infill/XR figures remain complete, proportional, opaque and
  unfiltered; bottom figure captions, arrows and source links survive. Native
  full-image access handles lettering that cannot be comfortable at phone width.
- Both bright Mode/s A and dark B retain actual tool contact/texture; the white
  simulation remains visibly documentary animation. Playback controls and
  credits are readable after the unobstructed source aperture. Verify first
  decoded frame, held frame, pause and source return, not a synthetic poster.
- Forward/reverse boundaries preserve one displayed source with no stale white
  plate flash over prose. Focused reading stays stable. Reduced Motion, paused,
  no-WebGL/media failure, no-JavaScript, reduced-transparency/contrast and print
  give complete readable sources/text without an empty lit stage.
- Matched desktop/mobile Bending/XR comparison is required after shared runtime
  work. Unchanged source/light/material/camera files alone cannot prove the
  same final composition. Physical-device and native capability limits remain
  explicit until exercised.

This review does not report new native contrast measurements, GPU memory,
physical phone acceptance, final browser passes, CI or deployment. Those facts
belong to the candidate-specific integrated verification record.
