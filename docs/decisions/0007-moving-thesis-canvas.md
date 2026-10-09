# 0007 — A moving, contained Canvas for the public thesis

Date: 9 October 2026. Supersedes the permanent fullscreen scene placement in decision 0005 for the public Bending-Active presentation only.

The owner approves the current visual direction but reports insufficient performance, and explicitly requests team discussion, implementation of a Canvas that contributes to scrolling and chapter transitions, categorized commits, push and GitHub Pages deployment. The empty portfolio framework and unrelated source materials remain outside this change.

## Decision

Retain one Canvas and resource set. Its layout size is bounded by the presentation: desktop width is 48vw capped at 720px with a 6:5 aspect; phone width is viewport width minus 36px with a square aspect. The existing experience controller moves this surface through actual document anchors using translation and uniform scale. Width and height do not animate. Fiber measures untransformed offset dimensions without scroll measurement, so moving the surface does not reallocate its backing targets.

The sole scene camera composes in a fixed local aperture. Exact source support fitting, original geometry, Full materials/optics, chapter lighting and deliberate source interaction remain. The controller no longer moves the camera projection to follow a page-space source rectangle. The pointer field and actual mesh hit test use the displayed Canvas coordinates.

OVERVIEW and CREDITS have reserved assembly/poster anchors. FORM, SYSTEM and PATTERN use their existing source-study surfaces, including desktop sticky positioning. MAKE and VALIDATION retain their authored source absence: the Canvas exits, stops GPU submissions and keeps its resources for return. The shared chapter clock still serves visible information and document motion. A passive render acknowledgment prevents an entering surface from exposing retained pixels from a previous chapter; it does not notify subscribers or create an animation loop.

The DOM controller remains the only stage transform/opacity writer; World remains the only camera writer. Pause, Reduced, native reading, focus/history, model/context failures and static fallbacks remain separate contracts. No new dependency, public asset or private build input is introduced.

## Evidence and limits

The grouped specialist review is recorded in the [direction](../../roles/experience-director/research/ROUND_09_CANVAS_DIRECTION.md), [scene review](../../roles/3d-artist/research/ROUND_09_CANVAS_SCENE_REVIEW.md) and [performance report](../../roles/performance-engineer/research/ROUND_09_CANVAS_PERFORMANCE.md). Exact released-source microbenchmarks measured camera fitting at approximately 0.05–0.16 ms per call on this host; they do not support treating that calculation as the main bottleneck. Smaller rendered area and explicit absent intervals are the testable performance changes.

The [integration verification](../../roles/uiux-designer/cases/bending-active-thesis/ROUND_09_VERIFICATION.md) records the built artifact, interaction/resource checks, visual review and matched before/after evidence. Browser emulation does not certify physical iPhone behavior or establish the root cause of the earlier Safari process failure.

Publication keeps the existing gate: all same-SHA push CI jobs must succeed, then the authorized manual workflow publishes that exact `static-export-pages` artifact without rebuilding.
