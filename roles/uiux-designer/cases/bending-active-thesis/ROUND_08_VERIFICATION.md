# Round 08 — Mobile viewport allocation stability

Date: 9 October 2026. Released baseline: `2457c896eda76e0ee76ae94cd69ea1ad4e546ab0`.

## Owner evidence and scope

The owner reports that the Safari repeat-crash still occurs, although much less often; desktop browsing is now working. This contradicts any claim that Round 07 completely resolved the physical-device failure. Device model, iOS version, triggering sequence and Light-mode behavior have been requested. The goal remains open until the affected-device behavior is verified.

This follow-up preserves the current source geometry, materials, optical passes, autonomous score, story and 36 public assets. Desktop sizing is unchanged. It addresses allocation frequency during touch-browser viewport changes, not a newly established root cause of the process crash.

## Evidence and decision

The released scene uses a fixed `inset: 0` stage. Its height is therefore controlled by the containing viewport's top/bottom bounds. Fiber observes that size and the renderer/compositor reallocate their buffers when it changes. The Round 07 guard bounds each allocation, but does not prevent repeated bounded allocations.

On the actual released artifact at a 390 × 844 touch viewport, an instrumented sequence of 40 alternating 0/80-pixel bottom insets produced, in **both Chromium and WebKit**, 40 additional texture-storage calls, 80 renderbuffer-storage calls and 80 native Canvas dimension writes. Resource counts returned to the same values, so this demonstrates churn rather than a proven leak. Applying a stable large-viewport stage height reduced all three deltas to zero for the same sequence. The test is a synthetic inset intervention, not a physical Safari toolbar or jetsam reproduction. The full scene was paused to isolate sizing; Full/MSAA remained enabled.

WebKit documents `lvh` as the large viewport and `dvh` as the changing viewport in its [Safari 15.4 feature explanation](https://webkit.org/blog/12445/new-webkit-features-in-safari-15-4/). A [historical iOS WebGL resize report](https://bugs.webkit.org/show_bug.cgi?id=232122) demonstrates why resize churn warrants investigation, but its iOS 15 diagnosis does not identify this owner's current failure.

## Implementation

- On coarse, non-hover input, the rear stage uses `height: 100lvh` with a `100vh` fallback and an automatic bottom edge. Browser chrome can change the visible reading area without resizing the drawing surface. Real orientation/window changes still resize it and retain the existing pixel cap.
- Source apertures are clipped to visible client coordinates and normalized against the actual Canvas rectangle. This distinction preserves source fitting and mesh hit testing when a stable Canvas is taller than the visible page. The rectangle is measured during existing layout/resize work, not queried anew for every frame.
- Desktop uses its existing inset sizing and equivalent source-coordinate calculations. Full retains its two-sample MSAA, depth-of-field, mist and glyph-cell passes. No quality downgrade, asset conversion, dependency change, new scheduler or alternative camera writer is introduced.

## Verification

The production build passed the public audit: 80 files, 36 approved assets, no private inputs. Three new pure viewport tests pass. Six new browser scenarios pass across the existing Chromium, WebKit and mobile-Chromium projects; each creates a touch viewport explicitly. They verify zero allocation churn under repeated insets, retained Full sampling, real orientation resizing, a 1000-pixel Canvas behind an 844-pixel visible page, every selected source support point inside the visible aperture with the existing 3% margin, and actual mesh taps changing the representation.

The complete portable suite passed 146 tests, with two conditional browser fixtures skipped and no failures. `pnpm check` passed, including the separate empty-framework static export and its 63-file audit. Six existing source-family and whole-reading-plane browser regressions also passed across the three projects. Full-mode SYSTEM captures were inspected on desktop and on a touch viewport with the taller Canvas; the source and captions remain aligned. Exact-commit CI/publication results belong in the final task report and private publication record. Private raw evidence is under `D:/JosHsuan_Website/_work/bending-active-thesis/round-08/verification`; it is not a build input. No Windows Playwright result certifies the owner's actual iPhone stability. The affected-device follow-up remains required even if all automated checks pass.

## Publication gate

The existing owner authorization covers committing, pushing and publishing these follow-up fixes. Deployment must consume a successful same-SHA `ci.yml` push artifact without rebuilding. The final task report and private publication record identify the run, deployment and live SHA, avoiding a self-referential commit identity in this file.
