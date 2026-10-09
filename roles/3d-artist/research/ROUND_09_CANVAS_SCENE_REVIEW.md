# Round 09 — scene composition inside a moving Canvas

Date: 9 October 2026. Status: cross-role design review and implemented pure camera sampler for the owner-authorized integration; integrated browser evidence belongs to the case verification record.

## Decision

Keep the approved source geometry, satin-metal treatment, exhibition lighting, camera orbit and Full optics inside one persistent, bounded Canvas. Give the existing DOM motion controller ownership of the Canvas surface's translation, uniform scale, opacity and chapter docking. Give the existing `World` frame callback sole ownership of the camera and scene properties. The camera composes within its own surface; it must not follow the same page-space source slot that the moving surface already follows.

This follows the owner's request to retain the successful visual direction while making the Canvas itself participate in scrolling and chapter transitions. It supersedes the permanent full-viewport background only for this presentation. It does not authorize new content, source-model simplification or an effects downgrade.

## Source inspection and cost interpretation

The current renderer uses a demand Canvas but its visible autonomous chapter motion keeps invalidating frames. The Full compositor renders linear RGBA16F scene colour and depth with two MSAA samples, the final optical pass, two reduced-size mist passes when active, and one glyph-cell pass when active. Its target-size report estimates the main targets as `width * height * 12 * (samples + 1)` bytes, plus mist and cell targets. This is an allocation estimate, not a measured VRAM total.

Moving a full-size Canvas with CSS would leave that WebGL workload unchanged. The concrete benefit comes from a smaller stable backing surface, no scroll-driven buffer resizing, and no scene rendering while the surface is outside the reading composition. DOM movement can reuse the last rendered image during its presentation motion. It does not eliminate the cost of rendering genuinely changing material, lighting or camera animation while visible.

The current exact support-fit loop visits 514 assembly support points, 1,130 points for the four-source representation family, or 487 points for the three experiments. Those are immutable verified support unions, not all model vertices. There is no evidence from this inspection that these camera calculations are the dominant cost. Keep the exact fit initially and measure the result before replacing it with a less faithful approximation.

## Joint review

| Perspective | Recommendation and reason |
| --- | --- |
| 3D Artist | Preserve original satin-metal shader, approved texture/procedural response, authored curvature colours, Full depth-of-field/mist and scene-derived glyph field. Scale the presentation surface, not the source geometry. |
| Geometry Engineer | Fit the original source-support union against a fixed Canvas-local aperture. Preserve all source hashes, counts, family envelopes, metre units and source-relative separation. Representation changes must not rescale or morph geometry. |
| Animation Cinematographer | Page travel belongs to the surface; object orbit and optical focus belong to the sole camera/scene owner. Preserve the sculptural opening, source-study holds, evidence absence and quiet ending return. |
| Scene and Lighting Designer | Keep the continuous exhibition ground/wall, broad area-light shaping and cached shadow owner. The bounded frame becomes an intentional specimen surface within the editorial page; do not add another full-page rendering pass to disguise its boundary. |
| Experience and Motion review | Use stable dimensions with translation and uniform scale; keep native scrolling, existing reading motion, source controls and keyboard/touch alternatives. Start with a restrained graphite frame/overflow boundary. |
| Performance review | Do not resize buffers for scrolling, remount one Canvas per chapter, or assume CSS opacity stops rendering. Make offscreen rendering suspension explicit and measure GPU target sizes, frame delivery and allocation events. |

An initial edge-feather suggestion was rejected in this review in favour of inspecting a simple intentional frame first. CSS masks and blur are not required for the first implementation and may add compositing work. A future feather would require visual need and measured cost, and must not erase the verified source silhouette.

## Composition and ownership contract

1. **Stable local dimensions.** Choose the surface's logical width and height from the current layout class or a genuine window/orientation change. Normal scroll and browser-chrome motion change its DOM transform, not its backing dimensions. Avoid separate WebGL contexts or per-chapter resource recreation.
2. **Local source aperture.** Start source-study fitting at `{left: 0.06, top: 0.06, width: 0.88, height: 0.88}`. The existing three-percent fit margin remains inside that aperture. The FORM, SYSTEM and PATTERN camera uses this stable local rectangle at full fit weight; visibility/docking must not change its projection offset every frame.
3. **One camera writer.** Keep bounded orbit, user inspection, lens and focus cues resolved before the final camera write. Do not write the camera from DOM motion or add another animation clock. Source-study aspect is the untransformed Canvas width divided by height.
4. **No double page movement.** Historical camera `viewOffsetNormalized` values encode page composition, including large exit shifts. A Canvas-local mode must neutralize these page offsets when the DOM surface owns the corresponding travel. Retain intentional internal opening crops and orbit; do not retain an additional hidden camera exit underneath the surface exit.
5. **Uniform transform.** Translation and uniform scale preserve aspect and permit the current pointer mapping through the actual Canvas `getBoundingClientRect()`. Do not add CSS perspective, rotation, skew or nonuniform scale without implementing and verifying the corresponding inverse transform for interaction.
6. **Real visibility.** Stop GL rendering and scene invalidation when the surface is fully absent/offscreen, while keeping ordinary HTML reading and its required transition controller alive. Retain resource ownership for return; dispose only on actual teardown/failure. Re-entry must render the current chapter before showing a stale earlier representation.
7. **Pointer coordinates.** Map client coordinates through the actual transformed Canvas rectangle, then cast the ray against the active original mesh using the existing camera. Decorative field/pointer UV should use the same local convention. Keep keyboard controls usable when the pointer is over empty canvas pixels.

## Chapter intent

| Chapter | Bounded-surface treatment | Internal scene requirement |
| --- | --- | --- |
| Overview | Enter as a larger editorial object with room for the title; scrolling begins the surface travel. | Preserve the satin-metal opening and its deliberate sculptural crop. The wrapper owns page placement. |
| FORM | Dock beside or within the reserved source-study region. | Full support fit and all four verified representations; keep genuine mesh hits and inspection controls. |
| SYSTEM | Travel with the reading hierarchy into its source-study region. | Preserve the same source family, support union and readable lighting. |
| PATTERN | Dock with its comparison region. | Preserve the three original experiments without topology interpolation. |
| MAKE | Surface departs as the construction evidence becomes dominant. | The existing source score intentionally marks the model absent. Do not introduce an unrequested assembly in front of the photographs. |
| VALIDATION | Remain out of the reading composition; permit rendering to sleep. | Preserve the existing evidence-absence beat and source photographs/text. |
| CREDITS | Return quietly as a smaller complete silhouette near attribution. | Preserve the approved ending return and full-fit source geometry. It may depart after the ending composition, but do not remove this existing beat just to obtain an idle result. |

## Verification required for integration

- Capture the real bounded Full surface at desktop and mobile sizes, both its opening crop and each source family. Check the frame, floor, metal highlights, field and source silhouette at rest and during travel; a pixel-count reduction alone is not visual acceptance.
- Project every retained support point through the actual camera into the local aperture at inspection extremes, then map through the DOM transform to compare against the visible source region. Preserve the existing three-percent per-edge guarantee for complete source studies.
- Verify real mouse and touch mesh hits after translation and scaling, including reverse scroll and chapter changes; empty space must not activate a source.
- Verify offscreen MAKE/VALIDATION stops compositor frames, while reading controls continue; returning to a source chapter wakes one existing Canvas with the current source. Check no resource-count growth after repeated departure/return.
- Count buffer allocations across scroll/chrome transitions and record stable logical size versus actual orientation resizing. Compare Full target area/bytes and visible frame delivery on the same browser/device settings before and after.
- Preserve Pause, reduced motion, Light, poster fallback, WebGL context loss and no-JavaScript reading. Reduced motion should apply a stable chapter composition rather than prolonged decorative travel.
- CI and emulated WebKit can verify these contracts but cannot prove the owner's affected physical iPhone no longer crashes. Keep that limitation explicit.

## Pure camera implementation and verification

`source-scene-score.mjs` now accepts the optional `canvasLocal: true` parameter. The existing default path remains available for historical framing tests. Local FORM/SYSTEM/PATTERN poses use the constant `CANVAS_LOCAL_SOURCE_VIEWPORT` and full study weight regardless of page-slot position or weight; orbit and inspection inputs still resolve before fitting. Local CREDITS fits the entire approved assembly while retaining study weight zero, so the fit itself does not request optical attenuation. OVERVIEW uses a centred support-fit baseline at 88 percent of its fitted distance for an intentional opening crop; reduced motion uses the complete fit. MAKE and VALIDATION retain source absence. The sampler remains pure and does not write to a camera, DOM element or source mesh.

On 9 October 2026, the new `canvas-local-source.test.mjs` and existing `source-scene-score.test.mjs` passed all eight tests. The new projection check covers every retained real family-support point in 300 configurations across ordinary, square, tall mobile and landscape local surfaces, chapter phases and inspection extremes. Its minimum per-edge aperture margin was 3.006567 percent. The historical default-path test still projects actual public GLB vertices in 825 configurations, with minimum margin 3.003295 percent. These are geometric/pure-function checks, not rendered visual acceptance or device performance measurements.

## Final integration review

The integrated runtime includes three corrections identified during this role's read-only review:

- **Local field interaction:** the controller derives field UV from the surface's current translation, uniform scale and logical dimensions, and enables pointer influence only inside that surface. Page-level pointer decoration remains separate. The field no longer treats the page viewport as the moving Canvas coordinate system.
- **Fresh image on entry:** the renderer passively acknowledges its completed controller frame and source chapter. The DOM controller retains sole opacity ownership and holds the surface transparent until the matching current render is available; awaiting that acknowledgment keeps the controller awake, including while motion is paused. Acknowledgment does not notify input subscribers or create another render loop.
- **Independent readable workflow:** the controller publishes whether the SYSTEM source is actually presented. Its workflow SVG follows the rendered representation while visible; when the Canvas is absent, the SVG follows the existing shared chapter phase. Offscreen warm-up events cannot override that state, and the SVG does not wake WebGL or introduce a clock.

The added workflow browser scenario exercises the narrow 390 × 844 stacked layout, where a visible workflow and an offscreen source can coexist. The desktop layout deliberately keeps the source sticky beside the diagram, so forcing absence there would test an incorrect condition. The scenario requires visible SVG selection and pressed-state changes with zero additional GL frames, followed by synchronization with the actual source when returning.

Role checks passed: the camera's eight pure tests described above; two source-diagram data checks; JSX transformation and browser-test syntax checks. The optional component browser fixture was updated but not launched by this role. Root integration runs own rendered captures, complete browser results, performance comparisons and release acceptance. This note does not promote partial or pre-correction browser results to a final pass; the case verification record remains authoritative for that evidence and for physical-device limitations.

## Primary references

The implementation is based on the installed React 19.3.0, Fiber 9.8.1 and Three.js 0.186.1 source and existing case code; no dependency update is proposed. Official references checked on 9 October 2026:

- [Fiber on-demand rendering and explicit invalidation](https://r3f.docs.pmnd.rs/advanced/scaling-performance): demand rendering needs deliberate wake/rest policy for imperative animation.
- [Three.js Raycaster](https://threejs.org/docs/pages/Raycaster.html): pointer coordinates passed to `setFromCamera` use normalized device coordinates.
- [Three.js WebGLRenderer](https://threejs.org/docs/pages/WebGLRenderer.html): renderer drawing-buffer size and pixel ratio are separate from presentation transforms.

These references support API behaviour. They are not evidence that this particular revision is faster or that an affected device is stable; the case's measured verification record must establish those narrower claims.
