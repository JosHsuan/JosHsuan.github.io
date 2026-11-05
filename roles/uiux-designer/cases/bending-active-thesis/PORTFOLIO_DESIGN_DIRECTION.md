# Portfolio design direction

Owner amendments, 3 and 5 November 2026. This governs the current application,
not the empty reusable framework. Decision 0021 supplies the continuous-motion,
source-scale and instance-event constraints; decision 0022 and the
[Glass motion contract](GLASS_MOTION_REDESIGN.md) revise their motion language.
Implementation and acceptance remain separate records.

## References and deliberate interpretation

- Apple's [Motion](https://developer.apple.com/design/human-interface-guidelines/motion)
  guidance supports purposeful feedback, gesture continuity, brief transitions
  and interruption. Use those principles for reversible card selection and
  section joins. Apple also recommends optional motion; the owner's explicit
  always-motion direction differs on that point. Do not describe this site as
  fully conforming to Apple's recommendations.
- Apple's [Materials](https://developer.apple.com/design/human-interface-guidelines/materials)
  distinguishes floating functional glass from content materials. Keep reading
  cards sufficiently opaque; use their edge response and restrained deformation
  for fluidity. Decision 0022 extends bounded optical deformation to reading/card
  aperture edges while the central reading zone remains clear. Floating control
  groups retain their functional glass. Native source image bytes remain unchanged.
- Lusion's [Porsche: Dream Machine](https://lusion.co/projects/porsche_dream_machine/)
  is a directed, four-phase CG film. Its project page was inspected at desktop
  size: the media composition expands while title/body retreat during scroll.
  Our interpretation is to compose sequences with changing visual emphasis,
  instead of repeating the same orbit for every source. No Lusion assets are
  copied and no claim is made to reproduce its film or renderer.
- Lusion's [Of The Oak](https://lusion.co/projects/of_the_oak/) connects a physical
  installation with an interactive web experience. Its published technical
  account describes compressed structural data and instancing. Apply the
  performance principle to verified derivatives, source-appropriate materials,
  cached lighting and bounded GPU residency; it is not evidence that our
  different models share that project's size or performance.
- Local `sites`, `r3f-animation` and `r3f-shaders` skills informed implementation. Keep the
  existing Three.js architecture: discrete events set goals, transient values
  stay outside React state, and one existing clock owns interpolation. No new
  Fiber dependency, second scheduler, hosted service or paid feature is needed.

## Compact square discovery cards

Each Home discovery card has a 1:1 outer silhouette. The active card sits at the
front of an inward-facing cylindrical arc, with the nearest adjacent centres
about 35% of a card width away. This ratio follows the card instance across screen
sizes instead of spreading cards by viewport width. Decision 0022 replaces the
preceding 26%-spaced hand and its paper-card roll. Adjacent cards suggest the sequence; only the
active card receives navigation focus. Documentary imagery uses contain fitting
inside the square so meaningful source details are not silently cropped.

The eight projects have a stable order. Native scroll events choose a target
index; the outgoing instance receives `portfolio:card-leave` and the incoming
instance receives `portfolio:card-enter`. Their instance listeners own selected
state and focus availability. Idle frames interpolate poses only and cannot
reissue selection events. Reverse input cancels/reverses immediately. Resize,
history restoration and keyboard focus do not force section jumps. Every
listener is scoped and removed with its instance owner.

The deck samples the same native-velocity/acceleration field as reading cards.
Its own pose writer composes the cylindrical depth with bounded peripheral shear,
stretch, optical edge response and a liquid rim. Settled poses are cached so the ambient scene clock
does not rebuild eight unchanged outlines every frame.

On Project, the prepared model preview is content of its square tile and follows
that tile's plane, like the neighboring images. Three desktop columns counterflow
over 24 seconds; the single-column layout uses the shared Feed field. Its renderer still owns source
geometry and camera. Full-viewport model stages and navigation stay independent
of reading-card transforms.

At the two outer section boundaries, crossing half a viewport completes the
native scroll transition. The seven intervals between eight cards remain fully
reversible. Project retains its separate overview grid. No-JS and print retain
ordinary links; short viewports receive compact typography and spacing.

## Camera and material direction

The cinematography and scene roles jointly author each Home source's sequence.
Use measured source coordinates, eye height, target point and 35 mm-equivalent
focal length. Architecture may extend beyond frame: approach a bay, track along
a structural rhythm or look upward from a human eye line. A view does not need
to contain the complete model. Workbench-scale machines can use assembly and
tool-detail views; material studies can show surface and fabrication detail.
Project-page source inspection keeps its independent complete-geometry framing.

An explicit partial view still requires real visible source geometry and valid
near/far clipping. Frustum culling is not a loading failure. Entrance and
Caschlatsch must not shrink to tabletop specimens on either desktop or phone.
Motion follows a continuous authored path and lighting has a specific key/rim
purpose, rather than random changes. Transitions use the existing site clock
and at most one resident showcase renderer.

Home uses the authored light sweep. Project reading stages keep a stable
photographic key and camera-dependent fill/rim; settled reading reuses the exact
source render while the independent compositor handheld continues. This avoids
re-shading dense CAD geometry for an idle light sweep and keeps native reading
responsive. It is an explicit presentation tradeoff, not automatic motion
suppression. Scroll, inspection and Home camera changes still draw the real
geometry; source resolution and original bytes stay intact.

Bending's desktop scene uses a fixed 921,600-pixel raster ceiling while keeping
2× MSAA, its HDR optics and cached 1024-pixel shadows. This bounds full-screen
shading cost while continuous camera/idle motion remains intact. Native reading
and the separate 1,600,000-pixel XR recording scene retain their own resolution.
See the [raster and clock review](animation-review/a33fc87-raster-clock-review.md)
for the deliberate detail tradeoff and qualification status.

For every material, record a source photograph or source material identity.
Mode/s separates EPS workpieces from silver extrusions/rails, blue printed
components, black drive parts and the cutting tool. XR bamboo follows its real
strip direction. Surface roughness, colour variation and microstructure must
describe the photographed material, not conceal it beneath a uniform clay
shader. Do not invent CAD fixtures or convert point-path data into a solid.
Original geometry and source asset bytes remain protected.

HC3DP uses a photographed clear-print shell approximation: one transparent
physical-material pass, restrained diffuse scattering, filament normals and
stronger edge coverage. This preserves the complete dense source and dielectric
highlights without a screen-space transmission target. It does not simulate
optical refraction or projected caustics. See the
[camera/material tradeoff](../../../animation-cinematographer/research/2026-11-03-HC_CLEAR_SHELL_TRADEOFF.md).

## Acceptance

Verify square dimensions, overlapping spacing, all eight forward/reverse
selections, single instance-event delivery, uninterrupted keyboard/native links,
short landscape and 200% zoom. Review real model/material frames on desktop and
phone, including architectural crops, lens changes, shadows, decode readiness
and loop joins. Check shader compilation and disposal as well as appearance.
The [4 November release](CONTINUOUS_MOTION_RELEASE_20261104.md) completes this acceptance with 630/630 exact-once browser checks and same-artifact public verification. The explicit visual tradeoffs above remain part of the delivered design.
The subsequent [5 November Glass motion release](GLASS_MOTION_RELEASE_20261105.md)
extends that acceptance to the redesigned Feed, Carousel, Stream, source passages
and entry/control motion, with 645/645 exact-once browser checks and independent
verification of the published export. The square-card, architectural-scale,
material-identity and original-source requirements remain in force.
