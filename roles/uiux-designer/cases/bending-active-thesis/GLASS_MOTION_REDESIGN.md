# Glass motion redesign

Owner direction: 5 November 2026. Baseline source: `efa376d`; preceding published
application: `0422797`. Implementation is under qualification; publication remains pending.

## Reference evidence and interpretation

The public [Align Canvas editor](https://aligncanvas.com/create) was inspected
without signing in, uploading material, exporting, subscribing or starting a trial.
The three selected examples were available without a Pro marker. Only their
public controls and rendered samples were studied. No template code or sample
media is included in this repository or the published site.

| Example | Directly observed | Our application |
| --- | --- | --- |
| Glass Feed | Vertical image flow; clear central images; content stretches and bends at the top/bottom aperture. Default loop reads 18 s. Controls include gap, lay back, drum curve, depth scatter, snake and edge treatment. | A shared viewport-relative feed field for every reading surface, including native evidence and captions, with a clear central reading zone and bounded peripheral optical displacement. |
| Glass Carousel | Curved cards form an inward-facing horizontal ring. Side cards curve and stretch into the aperture; the middle remains clear. Default loop reads 30 s. Radius, card curve, ellipse, front scale and rim wave are explicit controls. | Home's eight square instances travel through a compact cylindrical arc. Native scroll selects an instance; interpolation and optical edge response never dispatch another selection. |
| Glass Stream | Three columns travel in alternating vertical directions through a common top/bottom glass aperture. Default loop reads 24 s; column spacing/offset/turn and integer fast-column cycles are controls. | Project's native overview uses alternating column flow and spatial material response. It remains a finite, readable index of eight actual projects, not an endless duplicate-link wall. The same counterflow vocabulary informs scene handoffs. |

Local reference screenshots are retained in `.runtime/nov05/align-glass-*.png`.
These observations are not measurements of the reference implementation's shaders
or timings beyond the displayed loop controls. Sites presentation guidance,
r3f-animation and r3f-shaders inform ownership, sampling and rendering checks;
no dependency or hosting service is added.

## Motion direction

The central 50–60% of the viewport is the reading plane. Approaching its edges
progressively changes depth, curvature, directional stretch and glass highlights.
Native scroll velocity adds energy; acceleration adds a short liquid recovery.
The field remains spatially meaningful when input stops instead of leaving every
card at an arbitrary global tilt. Keyboard focus temporarily flattens the focused
surface for accurate reading and activation; it does not pause background motion.

Use a bounded original displacement map for optical deformation. It must affect
only the intended DOM surface, never the document's geometry, canvas fitting or
native media time. Keep a geometric fallback if the optical primitive cannot be
rendered. Avoid full-screen multi-pass blur, scene readback, per-frame map creation
and duplicate WebGL contexts. Source images are unchanged; no AI upscaling.

## Complete motion coverage

| Surface / route | Required change | Owner and evidence |
| --- | --- | --- |
| Home introduction and Contact | Feed field and coordinated material arrival | Existing information presenter / site scheduler; native reading, focus, reverse and mobile captures |
| Home discovery | Cylindrical square carousel with side-edge glass and continuous liquid recovery | HomeDeckPresenter; all eight forward/reverse selections, exactly-once instance events, focus and native links |
| Project overview | Alternating three-column Stream response; square native cards and live Bending tile retained | Information presenter; all eight destinations, column direction, no overflow, focus neutralization |
| About and standalone Contact | Feed response, restrained foreground arrival and glass control feedback | Existing ordinary-page owner; short/long reading, links, keyboard and mobile |
| Bending-Active | Feed text/evidence, redesigned foreground choreography and source surface passage, coordinated camera rhythm | Existing Director and final source writer; independent route journey and source pins |
| Motion capture / XR | Feed reading; redesigned model/phone passage and camera rhythm | Existing XRStageDirector; all three native recordings, complete workspace/model, trusted input and source timing |
| Mode/s, Entrance, Dot, HC3DP, Special, Caschlatsch | Same Feed language across every native chapter, redesigned continuous source handoffs and camera rhythm | Existing chapter/backdrop/scene owners; separate route evidence, no scene replay inside a continuous source interval |
| Home model film | Glass-aware sequential handoff, continuous human-scale and material-detail camera direction | Existing showcase owner; seven original sources, one resident renderer, first-draw and loop joins |
| Navigation, project links, section controls | Common restrained liquid response and immediate native activation | Existing CSS/control owners; hover/touch/focus and no moving hit targets |
| Page entry / departure | Aperture-like glass reveal that joins the same motion language | Existing readiness/navigation owner; real first draw, interruption, timeout/fallback and history |

All categories must be implemented and reviewed; a Home-only demonstration or
changing a shared constant alone is not completion. Maintain a finite readable
document, reversible scroll and one existing writer per property. The Home
About/Discover/Contact threshold sequence remains; no new wheel interception.

## Qualification and publication

- Review actual built frames for all three motion families and all route adapters.
- Verify spatial edge deformation, neutral central reading, velocity response,
  opposite stream lanes, cylindrical card ordering and interruption without jumps.
- Check desktop, phone, short landscape, effective 200% zoom, native keyboard,
  OS motion/Save Data settings, hidden/resume and renderer/media failure.
- Preserve original asset/geometry pins and exact Node 24.19.0 / pnpm 11.19.0.
- Run `pnpm check` for architecture changes and relevant built-artifact browser
  checks. Update assertions only where the new design explicitly changes behavior;
  preserve readiness, disposal, source, hit testing and temporal evidence.
- Require a fresh complete CI inventory with exact-once successful receipts and
  validated-release for the publication candidate. Publish that same export.
- Reconcile public bytes and review actual live desktop/mobile UI. Record honest
  rendering tradeoffs and any physical-device checks that could not be run.

No payment, subscription, trial, external renderer or hosted motion dependency
is necessary. The accepted previous release remains live until this full gate passes.

## Implementation and explicit tradeoffs

`glass-motion.mjs` supplies pure Feed, Carousel and source-passage samples.
`InformationWindowPresenter` and `HomeDeckPresenter` remain their only DOM pose
writers. Existing ordinary, Bending and XR owners supply time; no animation loop,
wheel interception, per-frame React state or rendering dependency is added.
The legacy `velocity-skin` profile marker remains an integration identifier;
`data-glass-motion` and the inspectors identify the new Feed/Stream design.

The Feed centre is clear through 54% of the normalized half-viewport. Spatial
shoulders reach 19 degrees; velocity adds at most 3.2 degrees and a small liquid
stretch. The optical map is one original 96 × 96 RGBA field per presenter/axis,
encoded once and reused across layout changes. It is not a source texture or a
screen capture. Native layout dimensions, document text and source bytes remain
unchanged. Keyboard-visible focus flattens only the focused reading surface.
Pointer focus retains its pose, so a native radio/button cannot jump between
pointer-down and pointer-up. Layout-dependent perspective remains consistent
when a surface leaves the viewport or temporarily receives keyboard focus.

Home uses an inward-facing cylinder without card roll. Adjacent centres are
approximately 34% of a card width apart before perspective; the central card's
outer aspect ratio is 1:1. This replaces the previous 26% overlapping hand while
remaining compact. Native input still dispatches exactly one leave and enter
event to the actual instances; animation frames only interpolate.

Project's desktop columns counterflow on a 24-second cycle, bounded to 12% of
card height and at most 64 px. This is a deliberate finite-index interpretation:
there are eight original links, no duplicated projects and no autoplay scroll.
Single-column phone layouts use Feed. A stationary pointer/focused link retains
normal activation and keyboard-focused cards flatten immediately. Browser tests
use native scroll and hit-tested pointer coordinates for these continuously
moving links, rather than waiting for two identical animation frames.

Pixel qualification found WebKit's SVG displacement could alter and clip the
clear centre. WebKit and unqualified engines therefore use the continuous
geometric field and painted liquid rim; qualified Chromium uses the optical
map. This is an explicit rendering policy, not an automatic performance or
motion-off mode. The 8-bit map's neutral value can add interpolation at hard
edges within one physical pixel under fractional mobile DPR. The optical assay
records that difference, bounds the affected area, and requires all non-edge
central pixels to remain unchanged. It never independently registers image rows
or treats a central spatial warp as acceptable antialiasing.

Reading material reserves 78% dark substrate coverage under regular glass.
An active SVG displacement plane uses this regular substrate instead of relying
on backdrop color compression, which the filtered ancestor can prevent from
painting. The actual, white and black backdrop contrast gate remains 4.5:1.

Model passages open isotropically from 92.5% to the exact native source transform.
The existing authored 3D camera owns architectural perspective; the outer source
surface does not rotate as a poster. One uniform planar mapping keeps real source
hits and annotation leaders aligned throughout departure and reversal. Bending's
source hit apertures share the stage's top-left origin, including their authored
slot offsets; native canvas and backing dimensions never change.
Home's measured positions, human eye heights, targets,
focal lengths and light cues remain, with monotone Hermite motion through shot
joins. Tangents cannot overshoot authored coordinates or lens/light values.
All seven original sources are tested for real visible vertices and genuine
partial crops on desktop and phone. Generic/XR paths use zero-acceleration
joins and a coherent 24-second independent handheld rhythm. Bending retains its
source fit and receives the same passage plus revised chapter drift.

Foreground content enters with restrained recovery; the eleven original library
traces overlap in source order instead of waiting for each preceding stroke.
The readiness owner still waits for both real native animation completions;
the reveal is now a closing rounded aperture. Navigation reflection moves inside
existing hit targets. None of these effects introduces a playback or pause control.

## Local qualification before the publication gate

- `pnpm check` passed with the exact toolchain, including 162 CI policy checks
  and the independent empty-framework build/audit. Final lint passed.
- 720 portable case/tool tests passed; two pre-existing browser-only placeholders
  remain explicitly skipped in that source suite. They are not browser acceptance.
- The built export passed its 270-file / 147-approved-asset audit.
- 24 Chromium route/interaction checks passed: all twelve reading routes,
  complete seven-source Home loop, all eight forward/reverse instance selections,
  native links, short landscape, effective 200% viewport, library and Canvas.
- The final optical/Stream qualification passed all six checks across Chromium,
  WebKit and mobile Chromium. The six existing native-velocity checks also passed
  across those engines. Chromium's stripe assay had central mean difference 0;
  mobile Chromium had mean 5.667 only at hard edges, with 0 difference across
  non-edge central pixels and 4.762% of central samples affected. Peripheral mean
  differences were 95.607 and 92.387 respectively (0–255 channel scale).
- Actual local browser review observed Feed shoulders, compact square carousel
  ordering, a working project link and the large Entrance crop. This is browser
  viewport evidence, not a physical-device frame-rate claim.

These local results do not replace the required complete exact-commit CI,
same-artifact deployment and independent public-byte/browser verification.
Raw local logs and pixel receipts are retained under `.runtime/nov05/` and the
test output workspace; the final release record will identify its immutable CI.

The first candidate, `430f18d`, failed XR's browser lens assertion in CI
42016446382 because that assertion still calculated the superseded cubic easing.
The production path already used decision 0022's quintic joins. The assertion now
independently computes the quintic 38° → 34° → 32° lens with the same nine-decimal
precision; camera ownership, source pins, native media and idle checks are unchanged.
The corrected complete XR journey passed locally in all three browser profiles.
That failed candidate is not eligible for deployment; the correction requires a
new complete exact-commit validation, without retry-only acceptance.

The second candidate, `90343a0`, also failed its complete CI (42018634913) and
was not deployed. Qualification exposed insufficient contrast under bright
backgrounds, source hit-aperture origin drift during the redesigned passage,
and assumptions that curved/continuously moving cards had identity transforms
and stationary screen rectangles. Corrections preserve the original contrast,
source, lifecycle and native-input gates: source geometry is measured before
projection, projected corners use an independent matrix oracle, and native
pointer actions target actual hit-tested positions. Decorative SVG definitions
are excluded when selecting the original documentary SVG. Entrance's mobile
radio labels reserve 56 native pixels so their projected targets remain at
least 44 pixels. One Linux WebKit native video advancement also stalled in
that rejected run; neither a poster nor a timeout/retry relaxation substitutes
for a fresh complete successful playback check.

Source-plate captures also wait until the existing presenter's sampled document
target agrees with the current native scroll position. A settled pose from the
preceding capture is not readiness for a new scroll event; viewport/chrome and
text-line containment assertions remain unchanged.
Complete plate captures are grouped by their native chapter, keeping every
original source and screenshot under the unchanged per-case deadline instead
of accumulating five plates and ten captures into one Caschlatsch case.

The Windows WebKit native-media check reports `NotSupportedError` at readyState
0 for Dot's original H.264 recording. Its rejection is retained as a local
environment limitation, not a pass or evidence of the different Linux stall.
The pinned Linux WebKit CI must still decode and advance this same recording
successfully; no browser exclusion, retry or deadline change is added.

The corrected source-plate chapters passed all 15 built-browser cases across
Chromium, WebKit and mobile Chromium. Entrance's enlarged touch targets passed
all three profiles. The targeted geometry/input/optics/contrast investigations
also passed their corrected assertions; the Windows native-media limitation
above remains explicit. Final `pnpm check`, 720 case/tool checks (two existing
source-only skips), lint and the 270-file / 147-asset public build audit passed.
The next publication candidate still requires its own complete CI and live gate.
