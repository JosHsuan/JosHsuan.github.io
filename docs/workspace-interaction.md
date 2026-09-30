# Reversible glass workspace

September 30 update: the personal website now uses a static CSS background and an
820-pixel reversible expansion across the whole range. The reading-priority
contract below is preserved. See [Portfolio release](portfolio-release.md) for the
active implementation; the September 28 parameters below are historical.

September 28, 2026. The owner requested complete removal of the particle feature
and its cube while retaining the frosted-glass terminal. The fully expanded
workspace must remain reversible by scrolling upward.

## Current behavior

- Open `/` for the retained neutral background and glass terminal. Old feature
  query strings no longer select a separate application.
- Scroll on the background to advance or reverse the 2,600-pixel transition.
  The original panel layout and expansion interval remain unchanged.
- Full expansion is a position, not a latched state. Upward scrolling on the
  background immediately returns toward the compact window.
- Within the terminal, content scrolling has priority. At the top of the
  content, further upward wheel input reverses the expansion. Downward input
  in the expanded terminal continues ordinary reading.
- A gesture started on the background keeps ownership as the growing window
  moves underneath the pointer. Moving or clicking the pointer releases it.
- Both direct expansion buttons synchronize the underlying scroll position,
  so they do not create an endpoint that cannot be reversed.
- Reduced motion keeps the static expanded workspace and ordinary reading.
  Existing native touch scrolling and keyboard access remain available.

## Implementation

- `opening/controller.ts`: completion derives from current progress; seeking
  backward remains possible after full expansion. Smoothing stops at rest.
- `opening/scroll.ts`: pure input-routing rules for reading versus expansion.
- `App.tsx`: scroll input, button/scroll-source synchronization and status copy.
- `ui/Terminal.tsx`: preserved layout, content, reading anchors and frosted UI.
- `scene/NeutralScene.tsx`, `CinematicLens.tsx`, `GlassPass.ts`: retained neutral
  illumination and glass rendering. The particle feature is not imported.

The removed feature's source, shaders, texture assets, source cache, tests,
feature documentation, review screenshots and public credits were deleted.
Unused scene modules that depended on those shaders were also removed.
Earlier concept documents remain historical records and must not reintroduce
the removed feature. Unrelated historical artwork keeps its attribution.

## Verification

Controller tests cover repeated full expansion and reversal, direct expansion,
idle settling and reduced motion. Routing tests cover reading priority, reversal
at the top, background gestures, and reduced motion. Browser review checks both
expansion buttons and real wheel reversal while retaining the glass appearance.

Verified locally: 14 tests pass and the production build succeeds. At 1280 × 720,
real wheel input reached progress 1 / scrollTop 2600, scrolled terminal content
to 720 and back to 0 while preserving progress 1, then returned the opening to
progress 0 / scrollTop 0. Both expansion buttons also reached 2600 and reversed
without Replay. No references to the removed feature remain in source, tests,
public assets or generated production files. Screenshots are saved under
`references/reviews/workspace-reversible/`.
