# Editorial scenes: chapter-owned documentary sources

## Status and scope

This is an isolated Caschlatsch presentation candidate based on `05b6796`, not a published all-site redesign. The unchanged release data, original image bytes, research statements, authorship and credits remain authoritative. The prototype replaces Caschlatsch's fixed photographic backdrop presentation with native chapter-owned images and adjacent glass reading surfaces. Other cases retain their existing presentation, models, cameras and media policies.

The reusable grammar is **enter a source scene → read its associated explanation → inspect complete evidence → move into the next chapter**. It is a layout and source-ownership change, not a depth effect, generated image treatment, new camera animation, or claim that photographs document an execution sequence. No footage is introduced: this case has neither a model lease nor motion media.

## Explicit role policy

`components/project-editorial-layout.mjs` resolves existing objects from the supplied project. It returns `null` for other projects and rejects unexpected model/motion media or unreviewed/missing Caschlatsch chapter sources. It does not mutate or duplicate release prose. `EditorialProjectStudy.jsx` and its CSS module render the policy without a new clock or per-frame React updates.

| Chapter | Native scene | Reading/evidence role |
| --- | --- | --- |
| Overview | No repeated large hero photograph | Compact identity, existing subtitle/summary and native study entry. Context/role metadata moves to the Context reading rail. |
| Context | `portfolio-tower-on-site.webp`, 1191 × 1786 | Complete portrait with adjacent desktop glass rail: built place, collective project and individual contribution. |
| System | `portfolio-timber-model.webp`, 1141 × 761 | Complete landscape model photograph, then existing explanation and the full `portfolio-voxel-framework.webp` and `portfolio-module-infill.webp` plates. |
| XR guidance | `portfolio-xr-workshop.webp`, 662 × 373 | Source-sized workshop scene beside task-oriented explanation; complete assembly-sequence, interface and data-exchange plates follow. |
| Making | `portfolio-robotic-assembly.webp`, 1024 × 575 | The existing photographic evidence figure becomes the main scene, without a second copy. The repeated workshop occurrence becomes a caption/credit/original-link source reference. |
| Results | `portfolio-timber-interior.webp`, 775 × 517 | Complete interior photograph, existing collective-result prose, then credits and related study. |

There are **10 unique native image figures, including five technical plates**. The **six existing evidence source actions** remain: two System plates, three XR plates and the Making robot photograph. There is **one workshop source reference**. The Overview hero and System image are the same source object content; their duplicate occurrence is consolidated into the canonical System figure, which retains its complete caption, credit and original-image access. No additional redundant hero reference is rendered.

All documentary figures retain their original dimensions, aspect ratio, alternative text, caption, credit and native full-image link. Technical evidence retains the image anchor and direct caption paragraph/credit span/source-action structure. No technical labels are cropped or reconstructed. Low-resolution workshop photography is bounded to its existing 662 CSS-pixel source width, rather than enlarged into a full-screen backdrop.

## Shared visual and interaction boundaries

- Root identity and chapter IDs remain stable. The explicit presentation opt-in is `data-study-presentation="editorial-scenes"`.
- Native figures use `data-editorial-source` and images use `data-editorial-image`; they do not register fixed `data-project-media` backdrop ownership.
- The existing driver skips fixed backdrop/model registration for this presentation and handles image load/error through scoped events. A failed image leaves its intrinsic area, caption, original link and narrative available.
- Glass information rails and captions retain `InformationSkin`, the existing information-window/plane hooks and velocity feedback. They occupy native reading space rather than overlapping unrelated source scenes. Existing project Pause and policy ownership remain; this component adds no controls or scheduler.
- Desktop alternates a portrait/reading spread, landscape source passages and full-width technical evidence. Mobile follows native image-first document order without pinning, artificial viewport-height chapters or sticky narrative panels.
- Original image color supplies the warm site / cool model / neutral technical-sheet progression. There are no filters, invented assets or depth-map distortion.
- Compact semantic typography uses the established title, heading, body, caption, label and control tokens. Body prose remains 16px with 1.5 leading and a 60ch measure; source actions retain 44px minimum height. No global typography changes are introduced.
- Content retains the established `position: relative; z-index: 2` owner above the decorative field. Fixed navigation remains above content. The field can remain visible in surrounding negative space, not painted over original source pixels.

## Actual prototype evidence

The first `cb10569` Chromium/mobile prototype passed its two scoped capture cases. Visual review inspected seven native reading stops per profile (14 original PNGs). The layout showed meaningful image/reading adjacency and a coherent portrait → landscape → technical → workshop → interior rhythm, but exposed a real stacking defect: the decorative orange field painted over photographs, technical sheets and text. Green geometry assertions did not justify accepting that defect.

The sole correction restored the established page content z-index. Corrected `c9f8b8f` Chromium and mobile capture cases each passed. Five original-resolution spot checks were then inspected:

- Chromium Context source plus glass reading rail;
- Chromium System model photograph;
- Chromium white framework plate;
- mobile XR caption/source action and adjacent prose;
- mobile framework plate and source caption.

The field was visibly behind native content; original photographs and technical sheets were clean, the glass material remained, and caption/action text was readable in the inspected reading positions. **This supports a scoped art-direction GO for the Cas prototype**, not an all-site or release GO.

Evidence directories:

- `/workspace/shared/ci-evidence-archive/editorial-scenes-cb10569/{12587618832,12587139745}/pages-test-results/`
- `/workspace/shared/ci-evidence-archive/editorial-scenes-c9f8b8f/{12588455512,12588300891}/pages-test-results/`

## Remaining acceptance and limits

The subsequent `b47ff94` affected batch passed **168/168 checks** across Chromium, WebKit and mobile Chromium, including the selected typography, source-access, static/policy and failure contracts. This is an affected batch, not the full required CI or release verification; those gates remain pending. The retained PNGs do not establish hardware performance, dynamic glass quality, or every scroll position.

A tall portrait or technical plate can extend beyond one viewport and is read with native scrolling; it is not reduced to fit merely for a screenshot. Dense embedded technical labels remain too small for complete mobile inline reading: the original-image entry is the detailed-reading route. A screenshot aligned to a source may show a nonfocused heading passing behind fixed chrome; that alone neither proves a navigation defect nor substitutes for a real anchor/focus test.

The affected typography acceptance now explicitly selects native Overview/rail prose and all ten figure-caption paragraphs. Prose guards retain exact 16px/1.5/60ch requirements; caption measure guards cover the resolved 68ch cap and caption containers retain the 20/13 leading and zero tracking checks. The CSS caption-size token is 13px; the shared caption guards should not be described as a new independent exact-13px assertion when they actually check measure/leading/tracking. No established threshold was relaxed.

The chapter/source/reading grammar can be reused elsewhere only after an explicit source-role policy and case-specific acceptance. Model/video cases require separate lifecycle and framing review; this still-image exemplar does not authorize an automatic global renderer switch.

## b47 affected-batch visual checkpoint

The first actual WebKit composition review inspected four original PNGs: Context portrait with adjacent glass rail, System model photograph, framework plate, and XR caption/reading position. Source colors and white technical backgrounds remained clear, the decorative field stayed behind native content, and the established image/reading rhythm matched the previously accepted Chromium/mobile scope. **WebKit receives the same scoped art-direction GO**, not full-gate or publication approval.

Failure-state review inspected one original PNG in each of Chromium, WebKit and mobile Chromium. The original-image action remained visible and readable; original caption/credit content and continuing narrative were retained, with no fake substitute for the failed tower photograph. The later System image is identified by its own chapter rather than presented as a replacement. The captures have a specific limitation: the failure-status sentence is partly above the viewport or behind fixed navigation; the mobile caption's upper lines also pass behind navigation at the action-centered capture position. These PNGs therefore do **not** prove the entire status/caption simultaneously visible. They support source-entry and continuing-reading availability, without diagnosing a native-focus defect from arbitrary screenshot framing.

Verified artifact directories for this checkpoint:

- Chromium: `/workspace/shared/ci-evidence-archive/editorial-scenes-b47ff94/12588213372/pages-test-results/`
- WebKit: `/workspace/shared/ci-evidence-archive/editorial-scenes-b47ff94/12588862196/pages-test-results/`
- Mobile Chromium: `/workspace/shared/ci-evidence-archive/editorial-scenes-b47ff94/12588223607/pages-test-results/`

No UI or source asset was changed for this checkpoint. Full CI, exact-artifact publication and live verification remain pending.

## First full-gate findings and narrow correction

Full run `40167096661` at `0020d440` completed all 540 public executions:
536 passed and four failed, with no retries. Three failures were the unchanged
Cas no-JavaScript plate guard, one in each engine. Actual Chromium trace showed
the empty decorative skin span incorrectly displayed by the new caption-credit
`>span` rule; its unclipped pseudo-element painted without the runtime's ready
ownership. The correction excludes `[data-information-skin]` from the two
caption-credit selectors. Shared hidden/ready rules, text metrics, original
sources and the existing browser assertions are unchanged. A portable regression
now explicitly protects this selector boundary.

The fourth failure was the existing Full Bending Pause/native-link case in
Chromium: readiness used about 28.2 seconds and the real Pause action 21.47 seconds,
leaving about 8.2 seconds for native tab progression before the total 60-second
case expired. Pause demonstrably froze the scene; six native Tab steps completed,
but the final Make/Inspect path was not reached. This is a failed execution, not
proof of a Cas regression or a diagnosed GPU/CPU cause. Its production source,
assertions and time budget remain unchanged. The corrected candidate requires a
new exact full gate; the failed run cannot authorize publication.
