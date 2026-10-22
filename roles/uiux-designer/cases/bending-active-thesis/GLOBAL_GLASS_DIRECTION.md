# Shared reading-plane motion — candidate direction

22 October 2026. **Isolated candidate; not live and not global completion.**
The accepted live baseline remains `146e8938`, with CI 39813261739 and deployment
39818623755. The [coverage matrix](PORTFOLIO_SITEWIDE_COVERAGE.md) separates that
baseline from this candidate. Original research facts, source assets, camera
paths and provenance are unchanged.

## Surface ownership

All twelve portfolio routes opt into `data-information-motion-profile="velocity-skin"`.
JSX declares eligible surfaces with `data-information-motion-surface="plane"`;
only the existing information presenter grants `data-information-plane` after
measurement and classification. Declaration alone is not proof of animation.

- Home: introduction, invitation, project heading/cards/note and contact surfaces.
- About: introduction, individual approach articles, project CTA and contact surfaces.
- Projects: heading, native project cards, note and contact surfaces.
- Contact: native copy and actual contact-link group.
- Six generic cases: editorial panels, captions and foreground source-image
  anchors. Entrance's complete raster focus guide is one outer surface, including
  its existing radio controls, labels and original plate.
- Bending: editorial panels, source diagrams, documentary image/caption surfaces,
  open source details and the mobile native-flow source card. The single portal
  card retains its intrinsic variant envelopes and native layout reservation.
- XR: native editorial, documentary image and caption surfaces.

Fixed navigation, chapter rails and controls are not reading planes. Independent
3D stages, primary background images/video, model inspection hit targets, XR
phone/workspace, the fixed EvidenceInspector comparison portal and the interactive
Bending preview tile remain outside whole-plane deformation. Bending's desktop
fixed source label retains its prior ink presentation; only its native-flow
placement opts in. This does not turn source geometry into a deformed mesh.

Nested information windows share one outer owner: for example, an image inside
open Bending source details does not acquire a second plane transform. Foreground
source images are eligible as complete readable cards, not arbitrarily cropped
or modified pixels. Full-source links and original dimensions remain available.

## Motion and accessibility contract

The common CSS consumes existing perspective/rotation/skew values only when the
runtime surface is ready, non-nested, moving and not focused. No recipe numbers,
new animation clock, per-frame React updates or source-camera writer are added.
The original ink path remains for unmarked surfaces. Eligibility is deliberately
shared; amplitude changes require a separately reviewed recipe, not route-local
numeric overrides.

Focus within a surface immediately neutralizes its transform. Settled surfaces
return to neutral; reduced motion, forced colors and print have explicit common
CSS neutral rules. Existing runtime policy also governs static entry, save-data,
visibility, seek, suspension and resume. No-JS content remains native and readable.

The four ordinary routes add **no new Pause control**: they retain OS/static
policies and finite scroll-response recovery. The six generic project routes use
their existing study Pause; XR and Bending use their existing project Pause.
Those policies govern reading-plane motion as well as their established scene
behavior. User Pause remains distinct from system reduced motion. Generic/XR
canvas-only 2D idle and Bending genuine 3D chapter idle are not conflated or changed.

## Source and verification boundary

Primary seams: `components/PortfolioHome.jsx`, `ProjectCaseStudy.jsx`,
`XRProject.jsx`, `BendingProject.jsx`, `ModelInspector.jsx`,
`EntranceDiagramFocus.jsx`, `SourceDiagram.jsx`; common transform in
`app/globals.css`, with the obsolete Mode-only transform removed from
`components/ProjectCaseStudy.module.css`. Existing presenters/directors retain
measurement, lifecycle and final publication ownership.

The initial Next 16.4.0 build compiled all thirteen static pages, then stopped at
a verified security advisory. This candidate includes the independently reviewed
Next 16.4.2 security patch and exact Next-family lockfile updates. Compilation or
source approval alone is not rendered acceptance; integrated build and exact CI
remain required before release.

Exact affected preflight, full browser gate and retained route-level visual
acceptance remain pending. Acceptance must include real forward/reverse native
scroll, neutral recovery, actual links/focus, project Pause, OS/static fallback,
short Contact scrolling, Bending native-card/workflow non-occlusion, nested-owner
exclusion and original source/camera independence. Review actual desktop/mobile
captures and interruption states before publication. Software browser evidence
must not be presented as physical-device FPS or Lusion equivalence.


## Forced-colors contrast correction — rendering pending

The exact `dd50071` WebKit Home recording retains near-black description text
on a dark Canvas in its final forced-colors frames; Chromium's same test phase
uses readable dark text on a light Canvas. Before-frame extracts are
`/tmp/forced-webkit.png` and `/tmp/forced-chromium.png` (each 0.3 seconds before
its retained recording ends). This is a visible accessibility blocker, not a
passing transform-neutrality result or a verified normal-theme regression.

The document root previously fixed `color-scheme: dark`, while forced-colors
material surfaces selected `light dark`. Transparent reading surfaces therefore
could resolve explicit system text colors against a different scheme from the
ancestor Canvas. The scoped correction makes the forced-colors root use the
same `--material-color-scheme` as material surfaces and pairs root background,
`--bg` and `--surface` with `Canvas`, and root foreground/`--ink` with
`CanvasText`. Existing `--paper`/`--muted` system text and `LinkText` mappings
remain. It does not force black/white, disable forced-color adjustment, change
the normal theme, or modify source imagery.

This causal explanation is source-grounded and still requires rendered
confirmation. Acceptance must retain forced-colors PNGs and inspect effective
text/background owners and contrast across all twelve routes; a neutral
transform alone does not establish readability. No corrected visual pass or
site-wide release is claimed here.


### Fixed chrome and secondary notation — follow-up candidate

The `604e8bd` three-profile preflight passed all 36 route tests and retained
all 36 forced-colors screenshots. Actual image review confirms the Home body
contrast correction, but identifies a remaining WebKit gap outside the selected
reading plane: shared project navigation still paints its literal dark fill
behind dark system text. Home's decorative, `aria-hidden` FORM/SYSTEM/MAKE
notation and signature also retain pale literal text against the light Canvas.
Chromium and mobile Chromium do not show those palette failures; their passing
results do not waive WebKit acceptance.

The follow-up changes only forced-colors CSS: shared `.siteLinks a` now uses
`Canvas` / `LinkText` with a `CanvasText` border and paired `Highlight` /
`HighlightText` for hover or keyboard focus; `.notation` and `.signature` join
the existing `CanvasText` mapping. Normal-theme styling, geometry and source
images are unchanged. Shared navigation must be checked independently of a
selected moving plane; decorative notation remains hidden from accessibility
APIs and is not promoted to new content. These corrections are source-only
pending the next retained WebKit images and final cross-profile gate.
