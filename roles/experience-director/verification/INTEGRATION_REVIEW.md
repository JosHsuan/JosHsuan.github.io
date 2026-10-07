# Independent integration review

Interactive Experience Director, 2026-10-08. This reviews the first actual rebuilt page, not the earlier camera fixture. The findings below were sent to the parent integrator and UIUX owner; this report does not edit their implementation.

## Inspected evidence

Viewed all seven 1440-wide chapter screenshots, all seven 390-wide chapter screenshots, and 768 Form from `D:/JosHsuan_Website/_work/bending-active-thesis/cinematic-integration/verification/`. Then opened the actual local page in isolated Chromium and captured six intermediate desktop boundaries plus two mobile boundaries. All eight were visually inspected.

Working boundary captures and machine observations are in `D:/JosHsuan_Website/_work/bending-active-thesis/cinematic-integration/verification/director-boundaries/`; `scripts/review-boundaries.mjs` repeats this review. A single Canvas element persisted through the desktop and mobile scroll series, with no horizontal overflow. That evidence does not by itself prove motion preference, failed WebGL, keyboard accessibility or every device; the parent owns those tests.

## Findings for the first build

| Priority | Observed issue | Required direction | Evidence |
| --- | --- | --- | --- |
| P1 | Adjacent section pseudo-backgrounds produce a hard horizontal brightness seam across the one fixed model as their boundary crosses the viewport. | Use one viewport-sized scrim whose directional strength blends with the shared story phase; remove the independent rectangular section gradients. | `1440-before-make.png`, `1440-before-system.png`, with the seam near y=500. |
| P2 | The fixed bottom motion button/counter overlaps the Form annotation at 390/768 and the Pattern caption at 390. The opening repeats its chapter count. | Put the motion control in a clear masthead zone; remove redundant counter/annotation treatment or reserve a genuinely clear strip. | `390-form.png`, `768-form.png`, `390-pattern.png`, `390-overview.png`. |
| P2 | Fading the whole evidence figure makes the background mesh's holes show through the white function chart during entry. | Keep source image/paper opaque; use bounded translation/scale and decorative fading. | `1440-before-pattern.png`. |
| P2 | Body text passing behind the fixed masthead collides with its brand label at intermediate scroll positions. | Strengthen the compact masthead backdrop where those layers meet. | `390-before-pattern.png`, desktop boundaries. |
| P2 | Form's whole-model pose reads as a small separate illustration after the large opening. | Tighten framing around 1.25× desktop and 1.25–1.35× mobile/tablet while keeping full silhouette and the actual prose zone. Revalidate after combining with revised scrim. | `1440-form.png`, `390-form.png`, `768-form.png`. |
| P2 | The lower overview prose crosses the model's left leg, reducing local clarity. | Keep the overview prose side of the global scrim stronger through the actual paragraph width. | `1440-overview.png`. |

The complete opening is spatially strong. The left/right composition changes in Make and the source-derived images establish a coherent research story; body text remains present in the captured intermediate positions. Keep those qualities during fixes. This review asks for targeted integration corrections, not another layout replacement.

## Revised-artifact closure

The director reran the same eight intermediate captures on the corrected built artifact and visually inspected all of them. Evidence is preserved separately in `verification/director-boundaries/revised/` under the D: working root above. Scene progress/poses differ across the scroll samples, and the same single Canvas persists; these were not static-image-only checks. Six revised held frames were also inspected, including overview, Form, mobile Pattern and Credits.

The final reading-zone correction was then reviewed independently on the live page at 1024, 768 and 390 pixels. `scripts/review-final.mjs` captured those three Credits views plus no-JavaScript and forced-no-WebGL opening/closing views at 1440 and 390 pixels. All eleven final images were visually inspected. The final captures and `report.json` are under `D:/JosHsuan_Website/_work/bending-active-thesis/cinematic-integration/verification/director-final/`.

| Finding | Closure evidence |
| --- | --- |
| P1 section-mask seam | Closed: no hard horizontal brightness split in the same before-Make, before-System and remaining boundary frames; the model reads as one continuously lit background. |
| P2 HUD/annotation/caption overlap | Closed: motion control is in the masthead, duplicate opening count is removed, and the mobile Form annotation no longer collides. Pattern captions keep their own reading area. |
| P2 diagram transparency | Closed: white chart paper remains opaque in the before-Pattern frame; model perforations do not show through it. |
| P2 masthead/body collision | Closed: the strengthened compact header mask separates the brand and controls from outgoing text in desktop/mobile boundary captures. |
| P2 Form scale | Closed: the tighter real-model view occupies more of the composition; mobile text is above the complete silhouette instead of crossing the prior small illustrative pose. |
| P2 overview prose contrast | Closed: the left side of the global scrim keeps the paragraph readable while preserving the larger spatial object at right. |
| Credits contrast found during revision | Closed: final 1024/768/390 captures show a quiet reading area under the full credits/limitations copy, with the assembly still visible. |
| Final poster/fallback check | Passed: real model-only poster loads at 1440 × 1000, computed opacity 0.35. No duplicate HTML is baked into it. All seven headings remain in the no-JS and failed-WebGL document; opening/closing text is readable on desktop/mobile, no horizontal overflow or page errors were recorded. |

No essential visual findings remain from this director review. This closes the findings within the inspected views and failure states; it is not a claim of physical-device testing, an exhaustive accessibility audit, remote deployment or universal browser coverage. The parent implementation's full checks and source audit remain separately authoritative.
