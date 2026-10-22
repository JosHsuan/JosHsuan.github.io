# XR scroll-camera direction

22 October 2026 — source candidate, browser and live acceptance pending.
See [site-wide coverage](PORTFOLIO_SITEWIDE_COVERAGE.md).

## Source-led scope

Only Method owns the visible model. Context owns the workspace; Adapt, Assemble
and Join own phone recordings. Overview, Making and Credits have no model
source owner in this score, so they receive no invented camera path.

Method's authored progress anchors (yaw/pitch radians) are 0: .92/.28,
.5: 1.06/.32, 1: 1.16/.36. The entry retains its existing source view;
continuous interpolation supports forward and reverse native scrolling. Source
entry/exit timing remains the existing scene score, not a new chapter timeline.
Phone projection, fit, recordings and workspace composition stay unchanged.

The renderer prepares all 96,312 original source points for exact fitting; this
is not decimation, a simplified mesh or an approximation of the source. Prepared
support belongs to the acquired renderer and is released with it. Scroll and
optional inspection still produce real camera changes. The independent subtle
idle layer is explicitly a **2D canvas pan/roll**, not true 3D parallax. It shares
the existing Director rather than adding a perpetual scheduler.

## Reading and controls

Native touch scrolling is primary and does not require inspection capture.
Existing optional mouse/keyboard inspection returns to the current authored
scroll view; Home/Escape clear inspection offsets, not the document position.
Method's visible conditional guidance and accessible model label agree.
The fixed reading controls use a compact “SCROLL VIEW” hint and an actual
“Pause motion” / “Resume motion” button bound to the existing Director.
Phone “Pause recording” / “Play recording” labels and behavior are unchanged.
Reduced-motion, save-data and unavailable states keep the existing static
policy; model controls are not falsely offered as usable. No ready-dependent
paragraph is inserted into native reading flow.

## Acceptance boundary

Source checks and focused runtime/renderer tests do not establish visual quality.
Exact-candidate browser acceptance must retain actual Method desktop/mobile
screenshots and forward/reverse scroll video, check all source extents, readable
fixed controls at compact widths, optional keyboard return, native touch, and
the real Pause/Resume button. Check independent idle updates without repeated
settled-idle 3D fitting/drawing; verify hidden/resume, reduced motion and disposal.
Preserve the workspace and all three phone compositions/recording times.
No smooth physical-device FPS, true parallax or site-wide completion is claimed.
The historical XR non-finite-camera anomaly still needs evidence if it recurs;
a later passing run does not establish its cause.

## Candidate validation checkpoint

- 562 portable case tests: 560 passed, two existing skips; 63 CI-policy tests and
  nine framework tests passed. Independent XR-focused review passed 28 tests.
- Public build/audit: 259 files, 137 pinned assets. Empty-framework build/audit:
  61 files. Browser inventory is 426 executions across 28 files, not a browser pass.
- Local Node is exactly 24.19.0. The shell's pnpm launcher reports 11.25.0 and
  correctly refuses package-script execution against the required 11.19.0.
  Validation used the installed checked dependency entrypoints directly; this is
  not a claim that literal `pnpm check` passed. CI retains pinned pnpm 11.19.0 and
  its unchanged install, build, test and publication gates.
- Prepared fitting preserves all-point projection order and exact original
  failure diagnostics. The isolated Node CPU comparison measured mixed-fit
  batch-mean median 1.813 ms raw versus 0.593 ms prepared; this is not a browser,
  GPU or FPS claim. The owned 2,311,488-byte copy temporarily overlaps original
  collection during acquisition, then the unneeded collection is released.

## Compact control correction

Actual a0c9d290 Chromium/mobile 320px captures exposed the new control bar
overlapping the brand/home link despite viewport bounds passing. At widths
up to 360px, Method alone now hides the redundant SCROLL VIEW hint; the real
44px-minimum Pause button and full native/accessible guidance remain. Phone
controls are unchanged. The compact browser gate now also requires zero
intersection between the reading-tools box and brand/home target. Corrected
visual acceptance remains pending; earlier captures are diagnosis, not approval.
