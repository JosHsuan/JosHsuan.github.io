# Dot source-detail reading candidate

Status: isolated candidate based on published 05b6796. Source implementation is not rendered acceptance or publication.

## Purpose and evidence boundaries

The Dot System chapter contains 14,810 recorded low-speed path sample positions, not a finished solid or a complete deposition sequence. A declared source-selected close view is intended to distinguish individual samples from the overall twisted form. The proposed passage is full record → selected detail → full record → the existing, separate physical recording. Point-array order is not used as a fabrication timeline. No inferred mesh, altered source geometry, generated image or additional recording is introduced.

The scene/score owner selects actual source support and owns camera fitting. Its source-selection receipts and original geometry checks remain authoritative; this UI does not select coordinates or alter the camera. All original documentary captions, credits, full-source actions and media timing remain intact.

## Native and optional annotation

Only Dot/System adds a complete native summary inside the existing source panel. It remains available without JavaScript and with static/reduced presentation:

> 14,810 recorded low-speed path sample positions. The close view examines a selected part of this point record, not an inferred surface or a deposition sequence. The next chapter shows a separate physical recording.

An optional visual-only annotation is attached to the existing fixed model stage, outside its transformed canvas. It is hidden in SSR and has no controls, live region, independent clock or information-plane registration. The existing presenter owns eligibility and `data-dot-detail-beat`, using committed model visibility and actual detail weight rather than desired scroll state. Its four labels are:

- `overview`: 14,810 recorded path sample positions.
- `detail`: Selected point detail · no inferred surface.
- `return`: Complete point record.
- `handoff`: Next: a separate physical recording.

Labels share a grid cell with intrinsic height reserved for every variant. Existing caption size, leading and tracking are reused. The desktop strip sits below the existing renderer slot, at 92% + 0.5rem, with left 48% / width 51%. Below the renderer's exact 800px breakpoint it uses top 65% + 0.5rem, left 3% / width 94%. The optional strip is omitted at viewport heights of 600px or less, in reduced motion, forced colors and print; the full native summary remains. Pause and inspection behavior are owned by the existing presenter, not React text animation.

## Cached native source-reading window

The four beats normalize a bounded, cached native scroll window, **not** the entire System chapter or its primary `chapterInner`. That primary container also includes long native captions and prose; the complete System section additionally contains the original evidence plates.

With viewport height `H`, the approved candidate window is:

- Start: `System.top - 0.5 * H`.
- End: untransformed `sourceAperture.bottom - slotBottom * H - 96` CSS pixels.
- `slotBottom` is `0.65` below the renderer's 800px width breakpoint and `0.92` otherwise.
- Enable only for finite geometry, `H > 600`, and a window span of at least `0.3 * H`.

The 96 CSS-pixel allowance is a conservative source-layout provision, **not** pixel proof of clearance. After the window, the model returns to the full record and the optional annotation is hidden while native captions, prose and plates are read. Other cases retain their existing chapter progress. Existing invalidated measurements cache the untransformed geometry; there is no added document height, pinning or per-frame DOM measurement. Insufficient windows keep the complete-source presentation rather than compressing a detail sequence into an unusable interval.

Actual model, annotation, native reading-plane and fixed-chrome geometry and screenshots still require acceptance. Final integrated local test counts will be recorded by integration; no earlier count is represented as validation of this updated window.

## Required acceptance, still pending

Actual desktop/mobile detail images must demonstrate separated samples rather than a brighter solid-looking surface. Full endpoints must preserve original source framing; the detail view must be explicitly identified. Check annotation legibility, source/chrome/native-body clearance, continuous forward/reverse camera joins, Pause, keyboard inspection and native recording handoff. In short viewports or static policies, test the complete native summary instead of demanding an intentionally suppressed annotation. A successful test counter alone does not establish artistic benefit, physical-device performance or research validity.

No paid service, new asset or extra GPU resource is part of this UI change. Browser screenshots, integrated build and release acceptance are pending.
