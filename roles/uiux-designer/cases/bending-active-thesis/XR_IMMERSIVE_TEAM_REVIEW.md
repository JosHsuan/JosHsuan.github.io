# XR immersive presentation: team review

Date: 16 October 2026 (Europe/Berlin).

Status: owner-approved direction and initial implementation. The current
published reference is `0012b05720c3feb7969c78513831f54009a701f3`. This document
records decisions, not completed browser acceptance or publication of this
revision. Commit, push and same-artifact CI-gated deployment are already
authorized by the owner; the existing gate remains required.

## Participation and reference review

Four collaborating agent groups cover the twelve existing project roles.
These are role assignments and cross-reviews, not twelve independent people or
human approvals. The visual group inspected the current Bending and XR source,
material and interaction contracts, the original XR main visual, and existing
desktop captures before proposing changes. No new browser or GPU run was used
to establish this initial design review.

| Group | Role | Finding and adopted decision |
| --- | --- | --- |
| Visual | UI/UX Designer | Bending establishes the model behind native reading, with clear reading islands and direct interaction. XR currently separates an opaque editorial grid, boxed model and boxed phone. Replace that sequence with one coherent scene and native chapters; viewing the three app stages must not require tabs or disclosures. |
| Visual | 3D Artist | Preserve the complete verified bamboo assembly and its original layer colour. Let camera composition establish the subject instead of adding geometry, textures or a structural deformation. The recorded phone screen remains complete and colour-faithful. |
| Visual | Lighting Designer | Retain the shared cool/warm atmosphere and articulate woven strips with restrained warm key and cool fill. Preserve source diffuse colour and emissive screen output. Reading contrast and documentary colours take priority over a brighter glass appearance. |
| Visual | Scene Designer | Place the project in a transparent viewport stage with deliberate space for native HTML. Move attention from assembly to interface to physical evidence. Do not reconstruct a fictional room, copy Bending's exhibition set or add decorative props. |
| Architecture | Software Architect / Runtime Engineer | Use one project-local transparent fixed stage and one WebGL context. A single renderer owns camera and source transforms; the XR Director reads native document geometry. Keep common background and Bending ownership unchanged. |
| Architecture | Interactive Experience Director | Derive the active model/phone subject from native chapter visibility, not a separate viewer mode. Coordinate finite scene and information-skin response, resource acquisition, first paint, interruption and terminal cleanup. |
| Architecture | Motion Designer | Native scrolling changes the active explanatory subject. Adapt, Assemble and Join play their original sequences with native video time; scrolling does not scrub, join or retime the clips. No autonomous orbit, scroll lock or frame-by-frame React state is introduced. |
| Architecture | Browser / GPU Performance Engineer | Keep one context and demand-based rendering. Model and phone drawing budgets switch with the active content rather than adding together: initial bounds are 524,288 and 393,216 pixels respectively. Idle response schedules no continuing scene frames. Native decoded-video callbacks invalidate that same renderer. These are configured limits, not measured device performance. |
| Source | Geometry Engineer | Keep the designated `only_interior.3dm` assembly: 352 original meshes, 96,312 vertices and 190,320 triangles in the verified one-primitive derivative. Preserve source transforms, units, material and asset identity; do not recenter, decimate or synthesize modules. |
| Source | 3D Animation Designer | Keep the complete 13.000-second Adapt, 24.960-second Assemble and 20.300-second Join recordings. No invented assembly animation, tracking result or deformation is added to the source model. |
| Source | Information Designer | Preserve the accepted narrative, captions, collaboration, contributions and limitations. Show source diagrams and real photographs directly in the reading flow. Keep all previous section anchors; use the prototype section as the parent for the three unambiguous app chapters. |
| Integration | Animation Cinematographer | Fit the complete source assembly to explicit desktop/mobile safe composition, leaving the reading area clear. Treat the recorded phone as a 3D explanatory subject with a readable, nearly frontal screen. Remove pointless view toggles and orbit buttons; source-safe camera composition remains the renderer's single responsibility. |

The source group also owns content editing and the existing provenance record.
The integration group owns frontend/3D implementation, QA and release. Their
current source facts and evidence limits remain in
[XR_PROJECT_INTEGRATION.md](XR_PROJECT_INTEGRATION.md).

## Material reference comparison

The integrator and visual review re-inspected actual cached pixels from Apple's
official [Materials dark-background illustration](https://developer.apple.com/tutorials/images/com.apple.HIG/materials-ios-liquid-glass-over-dark@2x.png),
alongside the owner-supplied [Figma community UI kit](https://www.figma.com/community/file/1515608601108987500/apple-liquid-glass-ios-26-control-center-ui-kit)
preview at its actual 800 × 450 resolution. The Apple image is a primary official
reference; the community preview is a separate third-party interpretation, not
an Apple publication. The current Figma page request was blocked by robots;
editable-file parameters were not inspected or inferred from that preview.

The adopted visual cues are a thin luminous edge, local backdrop colour showing
through the surface, and a restrained core that preserves readable text.
Neither reference supports reinstating the rejected large white fill. XR reuses
Bending's standard reading material, while its card inset exposes the existing
glass shell. The actual rendered rim and backdrop relationship still require
image review; an inset calculation alone does not establish an optical effect.

## Joint presentation decisions

1. Establish the actual project model in the background of the opening, with
   native semantic headings and floating reading surfaces above it. Retain the
   shared CSS atmosphere and Canvas 2D field as the separate common background.
   XR does not mount Bending's runtime, camera, model, compositor or exhibition
   lights.
2. Keep a native article through overview, context and method, then three
   consecutive Adapt / Assemble / Join chapters, physical making,
   contributions, limitations and credits. The app chapters automatically
   choose their corresponding original recording as they enter the active
   reading region. Original section anchors remain valid; the prototype parent
   does not compete with its child stage markers.
3. Keep all substantive photographs and diagrams visible in HTML. The original
   method, communication and data-flow diagrams retain full frames and direct
   source access. Measurement/module illustrations remain labelled as
   illustrations. The archived montage becomes a quiet source link rather than
   another required disclosure or primary animation.
4. Use the existing standard reading-material family for information windows
   and the floating control family for navigation and playback controls.
   `InformationSkin` owns the outermost tint/backdrop once. Source paper,
   photographs and recorded interface pixels remain opaque and unfiltered;
   text and controls stay outside decorative deformation. "Liquid Glass"
   describes the site's approved visual direction, not Apple's native material
   or permission to refract source content.
5. Remove required stage tabs and Face screen / Perspective / zoom / reset
   button clusters. Native chapter links and one meaningful playback control
   remain. Preserve accessible direct model inspection and keyboard/native
   reading without introducing an alternative view mode. A phone frame must
   not obscure the recording with a notch, status bar or cropped home area.
6. Desktop reading occupies the left portion of the composition while the
   model or phone has a safe subject region on the right. Narrow layouts use
   native document space before the relevant panel: 350 CSS pixels for the
   model and 78svh for a phone (about 658 CSS pixels in an 844-pixel viewport).
   Complete screen framing and
   readable source controls must be verified on the built artifact; these
   layout targets are not a claim of finished device acceptance.

## XR card framing

The approved main visual is the original 2000 × 1125 photographic composition
with two mobile devices. Manual source-pixel review uses conservative bounds
`[742, 390, 1262, 906]` around both complete phone bodies, with midpoint
`[1002, 648]`. These are image-composition bounds, not project measurements or
an automated segmentation claim.

The previous shared image style used `object-position: 55% center`. In a square
cover frame it placed this phone pair left of centre, while vertical
`object-position` alone could not reposition a height-fitted image. The scoped
XR treatment selects a 940-pixel square at source origin `[532, 178]`, ending
at `[1472, 1118]`. It stays inside the original and leaves at least 210 source
pixels around the conservative full-device bounds. The CSS mapping is a
`1125 / 940` scale, with the midpoint correction applied in the square image
box. No public image bytes are changed.

Only the XR tile receives its additional class, crop and 8–12 CSS pixel inset.
The inset exposes the existing glass shell and a restrained inner edge without
adding another backdrop filter. The Bending tile's class, preview props and
styles remain unchanged. The original hover/focus project title and native card
link remain. Built desktop/mobile inspection must still confirm complete
phones, centred composition and a visible glass rim.

## Ownership and acceptance boundaries

- The renderer is the only camera/source-transform writer. The XR Director
  shares finite response timing with its 2D presentation; it does not own video
  playback time. Native video and decoded-frame delivery retain that authority.
  The common background driver does not write the XR camera or recorded media.
- Scene acquisition and successful first paint establish scene readiness.
  Stale work, timeout, hidden/page lifecycle, context loss and disposal need
  explicit terminal behavior. Preserve native-video fallback and distinguish a
  post-ready resource failure from initial enhancement unavailability.
- Reduced Motion, Save-Data, NoJS and unavailable enhancement retain complete
  HTML, truthful posters and original recording access. Preferences do not
  silently start optional animation. No private source file or path becomes a
  runtime/build dependency.
- This revision must preserve the Bending presentation and its card. Earlier
  Bending raw failures and the previously recorded 27-pixel live navigation-edge
  limitation remain historical evidence; a new revision must not relabel those
  records or use a tolerance/mask to claim pixel identity.
- Required evidence remains the pinned-toolchain checks, public build/audit,
  built desktop/mobile and cross-engine interactions, source-media framing,
  native scroll/keyboard behavior, lifecycle/resource closure, matched protected
  Bending checks, successful same-SHA CI gate, exact-artifact deployment and live
  verification. No new acceptance or publication result is claimed here.

## Initial built-image checkpoint and corrective decisions

The visual group captured **22 native-clock views** from the initial local v2
export at port 4196: desktop 1440 × 1000 and mobile Chromium emulation configured
at 390 × 844, both DPR1. The new capture protocol uses current immersive-stage
selectors, actual scene mode/source counts, three additional native decoded
frames for each selected recording, native scroll alignment, fonts and only
genuinely visible image decoding. The helper does not change clocks, source
selection, styles, media time or offscreen lazy loading.

The capture retained all screenshots, DOM facts and request timestamps under
`animation-review/.local/xr-immersive-prototype/2026-10-16T08-29-13.724Z/`.
Its result SHA256 is
`3f2a49546d92504241fc6077cd1a8849d1b0f5e681e5ee7da830aae040024223`;
helper SHA256 is
`addba2a272d8485d35aa595f1194359542471819187ff13e2be04fd94c453038`.
Its 139-file capture-manifest SHA256 is
`105e956de68b5e10562397e17ad7e87557b40c78848a31fb34a2a36d14545234`,
unchanged before/after capture. This is a dirty-tree prototype whose release
metadata still identifies its published parent, not a new deployed commit.

The actual images confirm centred complete dual-phone card bodies and a visible
dark glass rim with thin inner/outer edges. Desktop model framing leaves the
reading panel clear. All three phone recordings show the complete source
interface, including original top controls and home area, without the former
depth stripes or an overlaid notch. The mobile reading panel naturally passes
over the background phone; a complete phone view and its longer explanation
occupy successive native reading positions.

Visual acceptance **failed** in this prototype despite the capture's original
resource/overflow predicate returning `passed: true`:

- The projects route retains the configured mobile 390 × 844 viewport, while
  XR's `innerWidth` grows from 394 to 406 and `innerHeight` from 853 to 879.
  `scrollWidth` grows with it, so comparing only `scrollWidth <= innerWidth`
  misses the defect. Fixed playback controls extend beyond the actual screenshot
  edge; the Adapt example reaches right394/bottom867. Main content panels remain
  within the intended width. Decorative information-skin overscan is the
  identified containment concern; the integrator adds XR-only horizontal clip
  containment at the reading boundary and heading scroll margins. The
  protected Bending page is not changed. A corrected capture must confirm the
  actual viewport and fixed-control bounds, not merely repeat the old predicate.
- Desktop phone labels are visibly softer than the former contained display.
  A full 1440 × 1000 transparent project buffer under the existing 393,216-pixel
  cap yields about 0.523 DPR, leaving roughly 157 backing pixels across a
  300-CSS-pixel phone. The accepted remedy keeps one context, camera framing and
  the same cap, but renders the exact subject subfrustum into a transparent
  canvas positioned at the safe camera slot. Its 51% × 78% rectangle allows about
  0.829 DPR at the same desktop size. It does not crop source content or increase
  the pixel budget; actual readability improvement remains a rendered-image
  requirement. Mobile rendering must be assessed again after its width defect
  is fixed.

The capture has zero page/console/HTTP errors and zero failed requests. Four
native desktop GL `ReadPixels` performance warnings remain in the raw record;
their caller is not established by this capture. They are not silently removed
or treated as measured device performance.

The visual group's production-camera CPU suite passes **4/4**, without skips.
It projects every actual assembly vertex through desktop/mobile chapter and
inspection poses, checks complete phone/screen support and near/far/depth
separation, and verifies the new subject subfrustum preserves global CSS
projection coordinates and native hit rays. It also verifies a useful desktop
resolution gain under the unchanged pixel cap. This numerical evidence does
not replace the pending corrected browser, cross-engine or live review.

## Corrected local v4 visual and protected-page checkpoint

The corrected production export was captured once with a new, stricter protocol:
**22/22 desktop/mobile views passed**, with zero failed requests, page errors,
console errors or HTTP errors. All contexts closed with no pending requests.
Every mobile view retains the configured **390 × 844** viewport and 390px
visual viewport width. The playback group stays inside the screen with 12px
right/bottom clearance. Actual images show complete source interfaces, clearer
desktop labels, headings below the site header, readable captions, centred card
phones and a visible thin glass rim. The mobile complete-phone view and the
subsequent reading position are both retained; neither crops the recording to
fit a caption. Four desktop native GL `ReadPixels` performance warnings remain
recorded with an unestablished caller; mobile records none.

The desktop phone buffer is 608 × 646 (392,768 pixels), with effective DPR
0.828518 in its 734.390625 × 780 CSS-pixel subject slot. Mobile uses 366 × 641
(234,606 pixels) at DPR1. Both respect the existing 393,216-pixel phone cap and
the transparent canvas has clear alpha zero. This is a local Chromium emulation
result, not a physical-device or final deployed-artifact performance claim.

All 22 PNGs and DOM/resource facts are retained under
`animation-review/.local/xr-immersive-corrected/2026-10-16T08-47-44.007Z/`.
Result SHA256:
`2843c327bfabd500e4f75e144a292ad0894b98725f062b8bef74a31013969dfd`.
Helper SHA256:
`1badee97e4dcebe28033387cfb657885cb4f93015e4009806c78403916f482d2`.
The 139-file capture manifest is unchanged before/after, SHA256
`ca1f807890ea0638a8c26a43cfa64d95dc1f3288efca5ab8a0d2a0960ce8acc6`.
The integrator separately reports all **28/28 local browser checks passed**,
without failures, skips or retries. Final same-artifact CI and live validation
remain subsequent publication steps.

A new paired preservation protocol compares this v4 export against the exact
published `0012b05720c3feb7969c78513831f54009a701f3` CI export. Desktop/mobile
Reduced Motion each cover seven native reading chapters, seven Enable 3D
chapters, treated/peek images and the original source portal: **34 states per
artifact, 68 retained PNGs**. The three original source SVGs and their embedded
images must load, visible HTML images and fonts must be ready, and portal image
decoding occurs explicitly before native alignment. No CSS, scene, clock or
media-time overrides, masks or pixel tolerances are used.

All **34/34 pairs have exactly zero changed RGB pixels**, zero layout/scene
differences and zero source-diagram semantic differences. Both artifact file
manifests remain unchanged. Candidate capture passes all 34 states with zero
failed requests. The combined raw capture deliberately remains **failed**:
the baseline desktop primary context records HTTP200 fetches for
`/assets/source-layers.glb` and `/assets/studio-small.hdr` ending in
`net::ERR_ABORTED`. They terminate before context closure, so this evidence
does not establish context-close cancellation or another cause. Baseline page
and HTTP errors are zero, and all eight contexts close with no pending requests.
These two observations are retained without exemption or another capture to
obtain a green result. They do not erase the independently exact presentation
comparison or establish a new candidate regression.

Paired raw evidence:
`animation-review/.local/bending-immersive-preservation/2026-10-16T08-50-57.360Z/results.json`,
SHA256 `b217bd6f8942defb6c1c9aec1487acaa6efc4e9c1689cdc44b6e820d534b347d`.
Capture helper SHA256:
`516bfe2638d702bae561fcbce16c2bb615ab073c4c023822f373294515e27748`.
Exact comparison:
`animation-review/.local/bending-preservation-after/immersive-v4-paired34.json`,
SHA256 `430deff5612e94911609983c12a92adb58b6187837a4bbdd80ab951bf6af17ce`.
This scoped published-parent comparison does not replace or relabel earlier
628/live raw failures and unresolved transport-related pixel observations.
