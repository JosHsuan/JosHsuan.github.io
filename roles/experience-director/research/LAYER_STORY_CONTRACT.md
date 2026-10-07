# Bending-Active Thesis — layer and story contract

Owner: Interactive Experience Director. Agreed with UIUX Designer and Animation Cinematographer on 2026-10-08. Applies to the isolated local case preview, not a production publication approval.

## The experience

Read a research story by scrolling a normal document. One real assembly occupies the background throughout; the camera, light and graphic emphasis develop as the explanation moves from form through fabrication to evidence. Photographs and diagrams join the same composition instead of opening a separate viewer. No required mode switch, orbit gesture, timeline control or route change.

## Layers and ownership

| Layer | Responsibility | Owner |
| --- | --- | --- |
| 0 — atmosphere | Graphite foundation and a truthful static model poster; never essential information | UIUX / 3D Artist |
| 1 — assembly | One fixed viewport Canvas, one scene/model allocation per case-route lifetime | Integrator / Geometry Engineer |
| 2 — readability | One full-viewport directional scrim, smoothly blended to the prose side from shared story progress | Integrator; UIUX sets readability targets |
| 3 — evidence | Source-derived image, diagram and caption in the normal document flow | UIUX / Geometry Engineer |
| 4 — story | Semantic headings, readable paragraphs, contributions, limitations and credits | UIUX |
| 5 — feedback | Small decorative icon tilt, visible focus, unobtrusive chapter indication if useful | UIUX |

No CSS blend mode or scene setting may be required to understand the article. Canvas is a background with pointer-events disabled; native document selection, touch scrolling and links retain their normal behavior. A plain background/poster supports all layers when JavaScript or WebGL fails. The scrim is a single viewport layer: per-section rectangular masks are prohibited because their boundaries create visible lighting seams across the fixed model. Its left/right emphasis follows the same deterministic story phase, including reverse scrolling.

## Seven chapters

Stable IDs also identify `section[data-story-chapter]`. Their actual DOM positions establish chapter progress; do not divide the whole document into seven presumed equal ranges.

| ID | Narrative duty | Desktop composition | Spatial emphasis |
| --- | --- | --- | --- |
| overview | Name the metal-panel thesis and its central question | Large left title; open space at right | Recognizable complete assembly, angled approach |
| form | Explain bending-active metal-panel research, with evidence limits | Left prose, clear right silhouette | Hold the full shape long enough to read |
| system | Explain computational workflow and individual contribution | Left short prose, right real workflow image | Recede behind documentary material |
| pattern | Connect material pattern/detail with the research | Left concise statement, right specimen image | Nearer detail or restrained contour emphasis; no invented stress map |
| make | Relate geometry to joining/fabrication | Real documentary image on left, prose on right | Counter-composition, lower contrast behind image |
| validation | Distinguish documented prototype evidence from browser visualization | Left summary, right prototype photograph | Settle toward an understandable complete assembly |
| credits | State limitations, collaborators, source/rights status and closing thought | Quiet regular-flow conclusion | Complete stable model, no exit that hides required content |

Use variable section heights determined by content. As a starting direction, a chapter's local phase has entry at 0–0.2, reading hold at 0.2–0.8, exit at 0.8–1. These proportions tune the camera and decorative transition, never gate text visibility. Cinematographer may interpolate continuously between held poses using measured chapter anchors. Avoid seven identical full-screen cards.

## Input and transitions

- Native scroll controls semantic progress. No wheel interception, fake scrolling, forced snap, scroll lock or scroll-triggered navigation.
- One final camera writer composes the camera's story pose and a bounded decorative pointer offset. No OrbitControls in the main reading route.
- Pointer tilt is decorative: approximately two degrees maximum for the camera; small icon/card tilt only on hover-capable fine pointers. It never changes section progress, representation, evidence, selection or factual values. It settles to neutral on leave and blur.
- Camera easing should resolve in bounded time after input. No ambient autoplay rotation, ongoing particle field or unbounded rAF loop after settling.
- Transition through composition, light and overlap. Keep prose readable at all scroll positions; do not apply low opacity to whole body-copy sections. Source images and their paper backgrounds remain at opacity 1 throughout entry and exit, so model details cannot show through diagrams. Apply subtle translation/scale and ornament fading instead; retain readable captions.
- Use a consistent graphite/off-white/orange palette. Preserve source image colors. Keep paragraph width and text contrast stable over every camera frame.

## Resilience and truthful claims

Mobile remains a single reading column. Keep the model within the same background composition, scale/reframe it for portrait view, and use a stronger lower/side scrim so text is never placed over an uncontrolled bright mesh. Touch vertical gestures belong to the document.

Reduced motion disables pointer tilt and long camera travel. A settled model or static poster supports the full readable article. A change of the OS preference must work without reload. A no-JavaScript page includes every heading, image, caption, credit and limitation in sequence. Failed model/HDR/WebGL loading must reach a poster without a persistent blocking loader.

Only the inspected metal-panel assembly and source-derived materials support this case. Do not mix the T3 motion-capture project into its narrative. Visual contours and material shading are inspection aids, not engineering simulations. No model deformation, stress result or Theatre-export provenance may be invented. If camera motion is procedural, name it procedural in developer documentation.

## Evidence to review before accepting the implementation

1. Desktop 1440 and 1024, portrait mobile 390, and tablet 768: all seven chapters, intermediate scroll boundaries, no horizontal overflow or text/mesh collision.
2. Show that one Canvas/model persists while scrolling; forward/backward scroll reaches the same pose for the same semantic progress.
3. Move the pointer at a fixed scroll position: camera/icon change is subtle; progress, active chapter and evidence remain unchanged. Coarse pointer and reduced motion suppress tilt.
4. Real wheel/touch/keyboard scroll works; no mandatory click begins the experience and no body-copy state becomes hidden.
5. No-JS, reduced motion (including a live change), failed model request and failed WebGL preserve the article and poster.
6. Browser errors, settled rendering, memory/lifecycle, image resolution/crops and readable contrast are inspected, not inferred from source-code checks.

## Research application

[Lusion](https://lusion.co/) and [Lusion Labs](https://labs.lusion.co/) are composition and integration references. Lusion's official [WebGL-Scroll-Sync](https://github.com/lusionltd/WebGL-Scroll-Sync) explains the mismatch between native scrolling and rAF when 3D objects must align precisely with DOM elements; its proposed absolute, padded Canvas is a tradeoff for that use case. This case uses a free-standing background assembly, so it does not promise pixel-locked DOM/mesh anchors and does not need to copy that workaround indiscriminately. Source-site observations and the distinction from our design decisions are recorded in `LUSION_RESEARCH.md`.
