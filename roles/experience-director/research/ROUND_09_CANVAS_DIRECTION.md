# Round 09 — A moving specimen Canvas

Date: 9 October 2026. Inspected release baseline: `ed59810`. Status: cross-role direction and implementation acceptance; measured results and publication are recorded by the integrator separately.

The owner approves the current presentation and asks the team to reduce its remaining performance cost. Their proposed direction is to give a bounded Canvas its own scroll and chapter motion, instead of keeping a continuously rendered scene across the entire background. They authorize implementation, categorized commits, push and GitHub Pages deployment. This request supersedes the fixed full-viewport Canvas requirement in the earlier layer-story contract for this case. It does not authorize unrelated portfolio content or changes to source geometry.

## Finding and decision

The released scene already renders inside one Canvas. The expensive coupling is its full-viewport drawing surface and the repeated fitting of source geometry into moving document apertures. Moving a smaller DOM surface can reduce pixels processed by the material, optical and scene passes, while separating screen travel from the camera's local viewpoint. A CSS transform alone does not reduce the work inside an unchanged full-size drawing buffer. The implementation must change the actual bounded render envelope and stop GPU drawing when the surface has left the composition.

Keep one mounted Canvas and its retained renderer, model resources and compositor. Give that Canvas a stable logical size for the current layout and move its wrapper with translation and uniform scale. Its motion contributes to chapter transitions; the internal camera supplies the source viewpoint, deliberate optical movement and direct object inspection. Scrolling must not animate Canvas width, height or DPR. Real orientation/window layout changes can resize the stable envelope once through the existing bounded resize path.

The integrated target envelope is desktop `min(48vw, 720px)` at a 6:5 aspect, and a square `calc(100vw - 36px)` surface on a phone. Held scale is capped at 1: the motion response does not enlarge a pressure-relieved raster beyond its chosen logical envelope. Root adds real OVERVIEW/CREDITS document anchors, placing the existing approved fallback posters inside those anchors. On a phone the opening order is heading/subtitle, model anchor, then introduction; this lets the model participate early without sitting behind the entire opening text plate. Source-study anchors retain their existing positions.

The current performance limitation is not evidence that camera arithmetic alone dominates frame time. The performance reviewer must compare the released and bounded implementations under matched conditions before attributing the result. The owner's Safari crash is also not explained or declared solved by a smaller Canvas without affected-device evidence.

## Team discussion and role synthesis

Three concurrent reviewers represented grouped disciplines, with root integrating their work. The discussion below records actual exchanges between the Experience/UIUX/Motion reviewer, Performance/Architecture reviewer and Scene/Artist/Cinema reviewer. Other role obligations were read from their maintained contracts; this document does not imply eleven separately active agents.

| Discipline | Decision carried into Round 09 |
| --- | --- |
| Experience Director | Make the moving surface a coherent part of the existing editorial composition. Preserve the approved opening, source comparisons, evidence absence and closing return. The page must remain understandable without the surface. |
| UIUX Designer | Keep native scrolling, the large title, readable graphite planes, rounded source/evidence framing and conventional navigation. Avoid a generic small video-player box. On narrow screens, reserve a real reading position for the opening and closing surface instead of placing it over the title or controls. |
| Motion Designer | The shared controller owns screen translation/scale and reversible settlement. Source studies settle exactly; long travel and decorative following stop under Reduced. Do not introduce an additional RAF or per-frame React state. |
| 3D Animation Designer | Preserve the existing representation sequence, exact source placements and justified display-only layer offsets. Outer surface travel is presentation, not deformation or fabrication evidence. No new source morph or split is required. |
| 3D Artist | Retain the approved source materials, texture detail, authored curvature colors and Full/Light choices inside the smaller surface. A smaller raster envelope must not silently become a different material direction. |
| Animation Cinematographer | The wrapper owns page composition; the camera owns internal azimuth, elevation, lens and truthful source fit. Remove double following. Visible source studies use a fixed Canvas-local aperture rather than moving page-space projection offsets. |
| Lighting Designer | Keep the same authored chapter light and source-relative shadow direction. Existing small DOM rim responses can use that score. Do not add a second screen-space lighting simulation. |
| Scene Designer | Keep the exhibition/field identity within the bounded surface. The inspected score intentionally has no source model in MAKE/VALIDATION and restores it in CREDITS. Preserve this before deciding when the entire surface exits or sleeps. |
| Information Designer | Diagrams, source labels and evidence remain ordinary accessible DOM content. Their source correspondence and shared chapter phase remain authoritative while the Canvas travels or sleeps. Do not move the caption's semantic meaning into decorative stage motion. |
| Geometry Engineer | Keep all seven source representations and the complete assembly unchanged. Fit each fixed family support union rather than refitting individual comparison silhouettes to unrelated scales. Preserve source hashes and evidence limits. |
| Performance Engineer / Software Architect | Retain one context and resource allocation; bound physical pixels; measure actual storage writes, frame delivery and sleep. No remount/reparent cycle at each chapter and no scroll-time backing-buffer resize. |

The performance reviewer challenged the assumption that transforms alone save GPU work. Direction accepts a genuinely smaller drawing envelope and measurable offscreen sleep. The scene reviewer identified that CSS rotation or perspective would invalidate the existing axis-aligned rectangle ray mapping; all reviewers therefore chose translation plus uniform scale only. The scene reviewer also corrected the preliminary MAKE composition: the approved model is already absent there and during VALIDATION, so adding an assembly over documentary evidence would undo the existing direction.

A feathered stage edge was proposed and questioned because masking can create additional composition work. The initial treatment should be a deliberate, restrained specimen boundary using the existing graphite vocabulary and a thin edge. Preserve a static radius only if captures and profiling support it. Do not add blur, a second render target or animated feathering simply to disguise the Canvas boundary. If an actual capture shows an unacceptable rectangular edge, compare the smallest corrective treatment before adopting it.

## Spatial choreography

This is an anchor-driven document composition, not seven equal viewport slides. Existing section geometry and source-study apertures determine the positions. The chapter clock retains its authored material/light/representation timing; native scroll provides the surface's relation to those positions.

| Chapter | Surface behavior | Reading and internal-scene constraints |
| --- | --- | --- |
| OVERVIEW | A generous bounded surface establishes the silhouette alongside the opening. It may enter from beyond the viewport and settle. On a phone it occupies a deliberate opening visual position beneath or beyond the title footprint. | Keep the full title, subtitle and introduction readable. The internal lens retains an intentional opening composition; the wrapper supplies screen travel. |
| FORM | The same surface moves into the first source-study position, then stays aligned with its aperture while its material and source sequence continue. | All four representations remain complete and selectable. The local camera supplies the study view and inspection, not a second scroll chase. |
| SYSTEM | The surface carries across to the next source-study position, with a bounded transition and a stable reading hold. | Retain source labels, original placement and the workflow diagram. Dense diagram content remains readable alongside or above/below the surface according to the existing breakpoint. |
| PATTERN | The surface becomes the comparison instrument for Experiment A/B/C using the same retained Canvas. | Hold family scale during representation changes; keep authored colors and neutral experiment names. The frame's motion must not be mistaken for a geometry result. |
| MAKE | The surface exits the reading composition as source presence reaches the approved absence. | The documentary image and prose lead. A model is not added over them. The entire GPU surface can stop drawing after its actual exit settles. |
| VALIDATION | Keep the surface absent through the documentary evidence interval. | Preserve photographs, limits, source-diagram interactions and accessible inspection. CSS invisibility alone is insufficient; confirm draw count stops. |
| CREDITS | Return a smaller, quiet surface containing the approved complete closing silhouette. | The return must not cover attribution or contact/source links. An optional final departure occurs only after those remain fully reachable; no perpetual empty-space drawing is needed beyond the document. |

Reverse scroll and direct chapter navigation must resolve the same surface anchor for the same layout/reading state. Initial hash navigation should begin at the appropriate local position rather than first flying through the opening. Active pointer inspection keeps the source stage stable until release/recovery; touch vertical gestures still belong to the document.

Preserve the approved one-shot information entrances, exact text settlement, source paper opacity and bounded hover/focus feedback. The new motion belongs to the outer Canvas surface. It does not justify reanimating settled paragraphs, shifting navigation hit regions or repeatedly hiding captions.

## One-owner docking contract

The integrated handoff is the pure [`canvas-motion.mjs`](../../uiux-designer/cases/bending-active-thesis/components/canvas-motion.mjs) response, with no DOM reads and no rendering side effects. The controller supplies measured anchors and reading state; one publisher writes the resulting stage transform. The scene receives the local aperture and visibility state through the existing input store. Root caches natural document anchors during layout measurement and derives nonsticky/inactive client positions from the shared visual reading position. The current active desktop source slot is an intentional exception: its sticky host requires the actual slot rectangle, otherwise a natural-position calculation would move the Canvas away while the clickable aperture remains fixed. No per-frame transformed-stage rectangle is needed to derive its own next transform.

For a stable logical Canvas size `B = (W, H)` and a target available rectangle `R`, use a uniform scale:

```text
s = min(1, R.width / W, R.height / H)
x = R.left + (R.width - W * s) / 2
y = R.top  + (R.height - H * s) / 2
transform-origin = 0 0
transform = translate(x, y) scale(s)
```

The controller interpolates between entry/exit and docked rectangles, but must not also change Canvas width/height during the interpolation. The handoff uses exponential, delta-time-based damping with exact epsilon settlement, a bounded initial offset, shrink/fade near a departing anchor, and an explicit rightward exit for MAKE/VALIDATION. Direct seeks, Reduced and stale-frame resume snap to the resolved local position. At the source-study reading hold, use the fixed Canvas-local aperture `{left:.06, top:.06, width:.88, height:.88}` and a complete local source fit. The existing 3% support margin applies inside that aperture. Its purpose is a guaranteed clear interior, not an arbitrary decorative shrink.

For FORM/SYSTEM/PATTERN, the visible local shot is fitted at weight 1. Surface travel/opacity handles entering and leaving the document aperture, instead of interpolating through the former full-page camera offset as the DOM slot moves. Source perspective is computed using `W/H`; uniform CSS scaling leaves that ratio unchanged. Source selection changes only the verified representation, retaining the existing family-support envelope and source identity.

The displayed Canvas rectangle is authoritative for pointer coordinates. The existing hit test reads that rectangle, so translation and uniform scale remain compatible. Do not add CSS rotate, perspective, skew or nonuniform scale unless an explicitly tested inverse coordinate transform is implemented. Avoid reading the transformed stage rectangle merely to derive the next transform: that produces a feedback loop. Source anchors derive from the document, and source fitting derives from the fixed local aperture.

| Property | Sole owner |
| --- | --- |
| Stage backing dimensions / DPR | Existing renderer sizing and quality policy, on discrete layout/quality changes |
| Stage screen translation / uniform scale / visibility | Existing shared controller, using the pure stage pose sampler |
| Internal camera projection / position / target | Existing final scene camera writer |
| Source rigid transforms / representation / material | Existing source/scene writers and approved chapter clock |
| Reading position, selection, focus and links | Native document and existing semantic controls |

## Visibility, quality and fallback

An offscreen or intentionally absent stage must stop renderer invalidation and skip GPU work after one required final state, while retaining the context and source resources. A zero-opacity CSS element alone does not meet this requirement. Returning into a visible composition wakes the existing renderer once and resumes the current shared score without reconstructing the scene.

The shared chapter clock may still be needed by visible information diagrams and bounded DOM motion while the Canvas sleeps. Do not create a second independent Canvas timer or freeze unrelated information simply to report zero GPU draws. Page hidden, Pause, Reduced, failure and lifecycle policies retain their existing separate meanings.

Choose a stable layout envelope large enough for the largest visible local presentation at that breakpoint, rather than full-page dimensions. Proposed pixel-area reductions are hypotheses until verified against the released baseline and readable geometry. Keep the existing pixel budget and Full optical settings unless measured evidence and a separate explicit design decision support another change. The first experiment should isolate the architectural benefit of bounded surface area.

Reduced presents the correct local surface without long flights or decorative lag. Explicit source interaction remains usable. No-JavaScript, WebGL failure and disabled scene states preserve real posters, every heading, source image, caption, limitation and credit. Offscreen sleep must not be reported as a failure or change the quality selector.

## Acceptance evidence

1. Capture OVERVIEW, each of the three source studies, MAKE, VALIDATION and CREDITS at desktop, tablet and portrait phone sizes, including chapter boundaries and a reverse-scroll return. Inspect actual images; no full-page background is silently retained and no bounded frame obscures essential copy or navigation.
2. Show one Canvas/context and the same source resources across chapter transitions. Record unchanged Canvas native dimension writes and texture/renderbuffer storage calls during a forward/backward scroll transform sequence. A genuine orientation/layout change must still resize correctly and remain within the existing allocation cap.
3. Project the complete pinned source support for every representation and interaction extreme through the actual local camera into the displayed surface. Its source-study hold retains at least the existing 3% margin inside the chosen local aperture. A deliberate travel crop must not be mislabeled a held source fit.
4. Perform real mesh hits after translation and scaling, and confirm blank stage space is not treated as the mesh. Compare by mouse/touch/keyboard; verify drag/release/recovery, native touch scroll, focus, history and direct hash entry. No second camera writer or independent per-frame state path appears.
5. Prove no further GPU draws after a settled absent stage, then prove immediate correct return on reverse scroll. Test while the shared information score continues where required. Confirm Pause, live Reduced, page hidden/resume and failed WebGL/model fallback without remount loops.
6. Compare matched released/new desktop and mobile-viewport Full runs using the same host, source asset, traversal duration and detail setting. Report physical rendered area, frame timing, draw/geometry resource counts and allocation churn. Separate measured gains from inferred device benefit; neither headless Chromium nor Windows WebKit certifies the affected iPhone.
7. Preserve the public asset allowlist and hashes. Complete the repository checks, relevant built-artifact browser projects and exact-head CI before the already authorized manual Pages deployment. Record the public release SHA and live interaction evidence separately from this direction document.

## Pure motion handoff verification

The delegated motion response and [`canvas-motion.test.mjs`](../../uiux-designer/cases/bending-active-thesis/tests/canvas-motion.test.mjs) were implemented without changes to the controller, scene, CSS or source assets. All seven focused tests pass under the repository's Node runtime: clipped source-stage containment, held-target agreement at 3/30/60/120 Hz, uninterrupted values during a reversed exit, seek/Reduced/stale-frame settlement, exact absent idle and CREDITS return, native anchor departure/reentry, and bounded initialization/invalid-input rejection. These are mathematical/state checks; camera-support projection, physical rendering cost and visual acceptance remain integration evidence, not claims established by these tests.

## Initial rendered review

Direction inspected all 14 initial Full-mode captures supplied by root: seven chapters each at desktop and phone viewport sizes. The bounded source surface is visibly distinct, complete source-study silhouettes remain clear, MAKE/VALIDATION give the documentary material room, and the closing assembly returns. The stills were captured with motion paused, so they do not establish transition or performance acceptance.

Two concrete refinements were returned to integration: restore phone opening-panel bottom padding so the subtitle does not sit against the boundary, and separate the desktop opening title plate from the neighboring Canvas edge. Possible stale navigation rings were flagged for state inspection and a clean pointer position before attributing them to chapter selection. Final captures and motion/interaction checks remain with the integrator's verification record.

The runtime integration at `d780eb7` restores 18px phone opening-panel bottom padding and 24px desktop padding, and removes the desktop opening plate's negative right expansion. Direction confirmed those source changes. Root's live DOM inspection found one correct `aria-current="location"` link for SYSTEM and its expected computed active border; the apparent previous rings were captured during the existing 180ms CSS transition and pointer hover. Final captures therefore move the pointer away from navigation and allow that transition to settle. This finding does not call for a new navigation mechanism.

Direction then opened all 27 revised captures: seven chapters plus a SYSTEM boundary and reverse return at 1440×1000, 820×1180 and 390×844. Desktop and phone views pass the visual review, including opening spacing, settled navigation state, complete held-source silhouettes and reversible boundary fitting. The tablet images exposed one remaining layout issue: the right rail overlaps the ends of source-interaction captions at the SYSTEM boundary and the edge of the documentary presentation. Merely moving the Canvas left would not fix those DOM labels. Direction requested a tablet-only content gutter for the entire editorial/source column, with targeted recapture before final tablet acceptance. No material, source geometry, optical or new-effect change was requested.

Root applied that gutter at `5f83413`: 94px chapter-content right padding from 781–1100px, matching the existing tablet layout range. Direction opened all six targeted recaptures at 820×1180 and 1050×900: OVERVIEW, SYSTEM boundary and VALIDATION at each size. The source instructions, documentary header/image/caption and Canvas edge are now clear of the right rail. Root's numeric check for all three source captions reports right edge 740px before rail left 751.75px at width 820, and 970px before 978.875px at width 1050. The media query leaves the accepted 1440px desktop and 390px phone layouts unchanged.

Visual acceptance is complete for these inspected compositions and boundary/return states. The review does not claim physical Safari crash resolution or real-device frame-rate certification. Matched profiling, lifecycle/interaction browser checks, exact-head CI and deployment evidence remain in the integrator's release verification.

## Primary implementation guidance

The browser performance recommendation is to favor transform/opacity for motion and inspect the actual rendering path rather than assume layer promotion is free. This supports wrapper motion while leaving real performance gains to measurement: [web.dev animation guidance](https://web.dev/articles/animations-guide).

React Three Fiber's demand-rendering guidance distinguishes scheduling a frame from rendering it and explains that external mutations require invalidation. That supports a retained Canvas with explicit visibility-aware scheduling, rather than repeated mounting: [React Three Fiber performance guidance](https://r3f.docs.pmnd.rs/advanced/scaling-performance).

These references explain mechanisms. They are not benchmarks of this case and do not establish the cause of the owner's Safari failure.
