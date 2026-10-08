# Integrated visual review — first capture set

Reviewer: Cinema/Compositing integration. Date: 8 October 2026, Europe/Berlin.

All 28 PNGs were opened as images and visually inspected: `1440`, `1024`, `768`, and `390` widths, each at `overview`, `form`, `system`, `pattern`, `make`, `validation`, and `credits`. Files live under `D:\JosHsuan_Website\_work\bending-active-thesis\round-02\verification`; they are actual local browser renders, not a claim based only on tool reports. The parent identified three not-yet-settled captures (`768-form`, `390-system`, `390-make`); their model positions need recapture before final composition acceptance.

## Observations

| Views | Pixel observation and action |
|---|---|
| All Overview widths | Real shell and source base are present; title/body remain readable. Desktop hero intentionally crops the object; mobile shows a whole object beneath the introduction. |
| 1440/1024 Form | Whole subject and base remain legible beside the text. Silhouette stair-stepping is visible at native DPR 1. Test bounded MSAA instead of changing source geometry. |
| 390 Form | Whole source object is approximately 200 px high and rather small in its available lower reading area. A modest later framing enlargement is worth comparing after the corrected settled capture; no unverified framing change was made. |
| Desktop System/Pattern | Sparse glyphs visibly track the scene, while the white source graphics retain their original content and stay sharp. Subject cropping is an intentional detail composition. |
| 390 Pattern | The fixed global layer-status caption overlaps the Fig. 3-05 media caption near the bottom navigation. Reported to the parent; the parent replaced that fixed status with chapter-internal captions. Requires final recapture. |
| 768/390 Make | Tall source photograph remains scrollable, sharp and unfiltered. The old fixed layer caption also crosses the photograph at 390; the same parent correction addresses this collision. |
| All Validation widths | Original blue printed treatment is preserved. Caption and explanatory copy are readable; the 3D layer stays subordinate to documentary evidence. |
| All Credits widths | Attribution/limitations remain readable. The quiet whole object is present behind the ending; it is especially subdued at mobile widths. |

The first-set dark spots on the metal coincide with actual source openings, so they are not evidence of random shader noise. The plate's light spots were independently isolated with actual `form-shadow-full.png` / `form-shadow-light.png` captures at the same FORM pose and DPR 1: removing shadows removes that pattern. It is consistent with light passing through the perforated shell onto the base. That physically related pattern was retained; the source geometry, normals, source selection and actual base arrangement were not altered to remove it.

## Bounded antialiasing change

The full detail path now requests two MSAA samples on its scene HDR/depth target and resolves depth before the optical pass. The light detail path requests zero. Installed Three 0.186.1 source was checked for `resolveDepthBuffer`, multisample setup and resolve behavior. Both actual Chromium and WebKit fixture suites again passed all eight groups: focus-plane sharpness reversal, glyph illumination influence, protected-region difference zero, transparent corner alpha zero, opaque surface alpha 255, and no shader/browser errors.

`setOverrides({stageU, visualU, samples: 0})` permits a fixed-pose same-light comparison against the default full-detail two-sample request. `inspect().compositor.requestedSamples` records the request; it does not claim a driver-independent physical sample allocation. Memory reporting now includes an estimate for the multisample attachments, approximately three times the previous color/depth target estimate at two requested samples. This is a cost increase for edge quality, not a claim that the original mobile budget is met.

At this first-set checkpoint, final full-page capture/behavior review still required the parent rebuild, corrected settling, caption change and source-base poster refresh. The later entries below record the completed visual follow-up without treating this first set as blanket final acceptance.

## Post-build checks on 8 October

The rebuilt page was opened at 390 × 844 and scrolled to settled FORM. `final-review-390-form.png` was opened and visually inspected. The shared-stage mobile composition now uses vertical NDC −0.40. The complete source silhouette sits approximately at y = 516–710; it remains modest in size but has no viewport crop or collision with the title/body. The old fixed caption is absent. These observations verify this new FORM view only; SYSTEM/PATTERN caption placement is covered by the separate final capture matrix.

The same live page was then compared at 1440 × 1000, a fixed FORM pose/light and DPR 1, with only the requested target sample count changed. `final-review-aa0.png` and `final-review-aa2.png` were both opened as images. Two requested samples visibly smooth the outer shell, perforation edges and thin members, while the original shadow pattern on the base remains unchanged. The diagnostic temporarily hid the HTML to isolate the scene; no production content or geometry was changed. Full detail therefore retains the tested two-sample request.

The inspector reported resolved depth and an estimated target cost of 51,840,000 bytes at 1440 × 1000 / DPR 1, or 11,849,760 bytes at 390 × 844 / DPR 1. These include the estimated multisample attachments and are not measured driver memory. The final whole-page browser matrix is a separate record. Physical-device frame cost, thermal behavior and phone browser GPU allocation remain unverified. No further runtime changes followed this review.

## Actual source-vertex framing proof

The CPU-only `scripts/verify-source-framing.mjs` passed 90 checks against the pinned actual `source-layers.glb`, using the current shared-stage camera, final optical focal length and composition view offset. Each check projects all 172,789 source vertices, including both base layers; this does not reuse the previous shell-only support hull. FORM and CREDITS hold centres were each tested at five viewport ratios and nine pointer grid samples (centre, edge extrema and corners), totaling 15,551,010 vertex projections. All vertices remained within the viewport and near/far planes.

Minimum viewport margins across the nine pointer samples are in CSS pixels. Each edge minimum can come from a different pointer sample.

| Viewport | Hold | Left | Right | Top | Bottom |
|---|---|---:|---:|---:|---:|
| 1920 × 1080 | FORM | 1019.59 | 291.47 | 407.69 | 191.71 |
| 1920 × 1080 | CREDITS | 591.68 | 648.34 | 334.05 | 342.90 |
| 1440 × 1000 | FORM | 759.83 | 212.57 | 400.42 | 237.56 |
| 1440 × 1000 | CREDITS | 378.97 | 431.43 | 309.30 | 317.50 |
| 1024 × 768 | FORM | 538.98 | 149.76 | 313.45 | 196.65 |
| 1024 × 768 | CREDITS | 250.09 | 290.38 | 237.54 | 243.84 |
| 768 × 1024 | FORM | 242.62 | 158.79 | 558.77 | 105.36 |
| 768 × 1024 | CREDITS | 192.68 | 169.72 | 508.30 | 214.26 |
| 390 × 844 | FORM | 107.03 | 79.46 | 511.22 | 132.15 |
| 390 × 844 | CREDITS | 99.55 | 83.92 | 470.99 | 216.22 |

The full private report is `verification/source-framing.json` under the working directory above. It records the exact GLB and camera-code hashes, each layer's projected extents, actual vertex witnesses and every check. Only the reusable verifier is committed. This proves containment at those hold/pointer samples; DOM collisions, transition cropping and phone performance remain separate checks.

## Final settled capture follow-up

After `capture-round02.mjs` replaced all 28 chapter captures with the rebuilt page, this reviewer opened the remaining 20 images directly with `view_image`:

- 1440: Overview, Form, Make, Validation, Credits.
- 1024: Form, System, Pattern, Make, Validation, Credits.
- 768: Overview, Form, System, Pattern, Make, Validation.
- 390: Overview, Validation, Credits.

The parent independently reviewed the other eight final images: 390 Form/System/Pattern/Make, 1440 System/Pattern, 768 Credits and 1024 Overview. Thus the team covered all 28 final captures; the 20-image list above states this reviewer's direct inspection scope precisely.

No new visual blocker appeared in those 20 images. Source figures remain sharp and retain their original colors, including the printed blue Validation photograph. Scene-derived glyphs remain on the decorative scene; chapter captions are inside the reading panels. The corrected 768 FORM capture has a complete, settled source object in the lower half. The tall 768 MAKE source photograph extends into the next scrollable area rather than being squeezed into one viewport. At these chosen mid-section scroll positions some content has already passed under the persistent header, which is normal document scrolling rather than hidden semantic content. The 390 ending remains deliberately subdued behind readable attribution and limitations. This final image review does not substitute for the separately run behavior matrix or physical-device performance measurements.
