# Round 07 — Runtime ownership and sustained-use audit

Date: 9 October 2026. Inspected baseline: `5261c5e`. Status: source audit and controller implementation with CPU validation; not an integrated performance or crash-recovery result.

## Problem and evidence boundary

The owner reports stuttering and a whole-page Safari failure on desktop and iPhone after browsing for a while. The supplied crash message reports that a problem repeatedly occurred on the published site. That observation establishes an end-user failure, but does not identify a JavaScript exception, a WebGL loss, GPU exhaustion, a browser-process limit or a device-memory limit. We must not call any one of those the proven cause without a matching trace.

The current successful visual direction is a constraint. Simplifying source geometry, suppressing autonomous chapters, removing direct manipulation or substituting a static site would not satisfy the request. Performance work should first remove redundant work and bound rendering resources while retaining those features.

## Ranked source observations

| Priority | Observed implementation | Consequence / evidence limit |
| --- | --- | --- |
| 1 | `scene-compositor.mjs` allocates a full-viewport RGBA16F target with an unsigned-int depth texture, requests 2 samples in Full, and runs a scene pass, two quarter-resolution mist passes when active, and the output pass. DPR is capped at 1.25 but total pixel area is not bounded. | Large desktop viewports can request a large persistent render surface. Continuous workload and resource pressure are plausible contributors to Safari failure; source inspection alone cannot establish process termination cause or precise VRAM. |
| 1 | `CinematicExperience.jsx` writes root/element CSS before querying sticky choreography, model slots and every `[data-protect]` rectangle in each autonomous frame. | The browser must resolve those writes before returning current rectangles. Repeated layout/style work is demonstrated by ordering; its actual time cost needs a trace. |
| 1 | Canvas z-index changes between rear and foreground layers. Every frame passes semantic rectangles to a per-fragment exclusion mask; over 16 rectangles require greedy pair packing. | Reading safety currently depends on a CPU/GPU clipping pipeline. It produces the dark cutouts the owner wants removed, and replacing that architecture removes work rather than hiding the symptom. |
| 2 | A stationary pointer over a source slot calls `hitTest` every controller frame. That method creates a Raycaster and Vector2 and intersects the complete visible source geometry. | Exact source hit testing must remain, but an idle stationary pointer can trigger repeated triangle work. Reuse scratch objects and schedule hit checks only as often as necessary to track a moving source; explicit press/click must always obtain a current accurate hit. |
| 2 | All feedback planes receive custom-property writes, all sections receive attention/energy writes, and document metadata/navigation attributes are rewritten even when values have not changed. | Avoidable style invalidation and allocation continue after entrances settle. Cache nodes and published values, but retain every visible change and the exact-rest invariant. |
| 2 | World recomputes the complete source fit, projection, shadow camera matrix, layer/material values and a serialized shadow key each frame. | The authored camera/light does change continuously; do not freeze it to improve a metric. Cache only source-family invariants and unchanged properties, and preserve the source-support fit after final optical framing. |
| 3 | Visibility handling cancels the application RAF, publishes stopped playback, and discards hidden elapsed time on resume. The source has no explicit pagehide/pageshow lifecycle handshake. | Current ordinary hidden-page behavior is intentionally handled. Add a bounded lifecycle handshake if testing shows page-cache/page restoration needs it; no second clock or repeated automatic retry. |
| 3 | Context loss invokes the scene failure callback. The parent unmounts Canvas, keeps reading content and shows the poster. | This is a useful contained-WebGL fallback. It cannot intercept an OS/browser process kill, so it is not by itself proof that the reported Safari blank-page crash is resolved. |

## Existing ownership worth preserving

- World owns the one camera write and its scene graph. `useFrame` is imperative; no per-frame React state is used.
- The application controller owns the chapter clock. R3F demand invalidation requests a draw; it does not mean the controller is idle while autonomous playback is active.
- Loaded GLTF geometries/materials and local HDR/PMREM resources are disposed on teardown. Async completion checks cancellation; successful late loads are disposed. The first GLTF/HDR loader requests are not abortable in the present call path, so cancellation may retain them until settlement, but this is a bounded late-load path rather than evidence of a leak.
- Compositor targets are created once, resized when dimensions/samples change and disposed on scene teardown. Scene resources do not visibly accumulate once per frame.
- Exhibition-stage LTC textures use shared reference ownership and release only after the last local user. Source-family changes reuse the same exhibition set and lights.
- Source comparisons select original representations. Geometry Engineer's source counts, color bytes, index/position fidelity, family supports and source separation labels remain authoritative. No decimation, simulated bending, asset re-export or additional model is needed for this refactor.
- Reading anchors use natural layout. Transformed DOM rectangles are only presentation inputs, and source captions reserve the largest actual description. Keep those corrections and native history/focus semantics.

## Cross-role agreement

Software Architect and Performance Engineer independently identified the same layout read/write ordering and unbounded render-target area. Neither found a proven accumulating resource leak. Runtime measurements remain necessary before attributing the reported crash to a specific mechanism.

The Interactive Experience Director accepts a constant rear Canvas and removal of semantic GPU alpha masks. Rounded DOM reading planes establish stable visual boundaries. Light hue/direction/energy and the existing choreography can influence a rim or highlight without placing rendered pixels above essential content. Source imagery and diagrams retain their factual appearance.

Glass should be a bounded design treatment, not a new full-page rendering burden. Prefer a readable base, translucent edge and restrained highlight; do not attach a live backdrop blur to every text/media plane. A small real blur surface requires profiling and a legible fallback.

Motion's Round 06 contract remains active: autonomous chapter time, bounded input tempo, one-shot anticipation/overshoot, exact settled text, no automatic chapter advancement, Pause/Reduced/hidden suspension, truthful source changes and direct source interaction. This refactor supersedes only the old foreground-mask implementation contract.

## Bounded implementation plan and acceptance

1. Replace foreground promotion/masking with the director's DOM layer contract. Remove protected-rectangle queries and shader exclusion work completely from the active path; do not leave the old black cutouts behind an opaque repaint.
2. Cache stable DOM collections and compare values before publishing attributes/styles. Batch required geometry reads, keeping source slots aligned with the actual transformed layout. Use a persistent raycaster and bounded hover sampling while preserving fresh explicit interaction hits.
3. Bound the actual rendering area and expensive attachment/sample policy based on measured cost. Keep authored materials, light trajectories, optics and scene timing; validate the visible tradeoff across desktop and mobile dimensions.
4. Preserve stable allocation and teardown, pause every application-owned scheduled path when hidden, and make any sustained-pressure fallback one-way and explicit. Do not oscillate quality after individual slow frames or infer capability from device names.
5. Compare the same built artifact and viewport in before/after traces; record CPU work, frame cadence, target allocation estimate and resource counts separately. Repeated chapter/representation/quality/navigation cycles should show bounded resource counts, not just one good screenshot.
6. Verify real-time operation, long sessions, hidden/resume and forced context loss. Deterministic clock tests remain functional tests only. Browser automation is not physical iPhone certification; record that gap unless actual-device evidence is obtained.
7. Run the unchanged same-commit CI and Pages gate. Release only the validated artifact, then check live `release.json`, reading layers, source interactions and both Full/Light render paths.

## Audit references

- Repository architecture Sections 8, 9, 13 and 14.
- Geometry Engineer: `roles/geometry-engineer/research/ROUND_06_SOURCE_MAPPING.md`.
- Motion Designer: `roles/motion-designer/research/ROUND_06_CHAPTER_PLAYBACK.md`.
- 3D Animation Designer: `roles/3d-animation-designer/research/ELEMENT_HANDOFF.md`.
- Interactive Experience Director: `roles/experience-director/research/ROUND_06_DIRECTION.md` (historical foreground-mask implementation superseded by the current owner request).

## Controller implementation checkpoint

The integrated scene additionally observes actual compiled program identities with a WeakSet. A selected source can be absent, and Full/Light may compile different variants; selection alone is therefore not sufficient evidence that shader warmup finished. New programs discard the current pressure window and the following delivery interval. A two-second warmup precedes each observation window. Density only steps after at least four seconds and eight delivered samples, mean interval over 42 ms and more than 65% intervals over 50 ms. Stages are 1, 0.8, 0.65 and 0.5 of the already bounded base density, with no automatic upward oscillation.

The owner-authorized implementation now removes protected-rectangle measurement/state, Canvas foreground promotion and the full-page scrim from `CinematicExperience.jsx`. Scene/compositor and CSS integration are separately owned by Performance, the parent and Experience Direction.

Stable feedback-plane, source-diagram and model-slot collections refresh through the existing resize/source-hydration path. Settled choreography no longer reads sticky rectangles; remaining sticky reads occur together before individual transform writes. Model slots still read their actual transformed rectangles after grouped writes, preserving the camera's fitting contract. Inline style/attribute/text publication compares current values and skips unchanged writes; it also reconciles discrete React replacements. The unused continuously written diagram phase/energy variables are removed; the actual discrete source-highlight index remains.

The stationary hover check runs at most every 100 ms, retaining exit detection when an autonomous source moves away. Moving pointers are coalesced by the controller RAF, and the duplicate `ModelInspector` pointermove raycast is removed. The explicit source-press hit path remains accurate. Mouse/pen source hover remains available during explicit Pause/Reduced, while decorative tilt retains its original preference rules. World owns raycaster scratch storage. This bounds one controller cost without claiming the entire source interaction is now cost-free.

The one-RAF scheduler composes visibility, pagehide/pageshow and freeze/resume reasons. Removing one reason cannot restart a still-hidden/frozen page. Suspend/dispose cancel pending work, and a callback generation guard prevents an already-queued old callback from consuming a new resume frame. `ModelInspector` uses its existing gesture cancellation on pagehide/freeze as well, releasing pointer capture and held inspection targets. The caller retains the same clock and stale-time policy; no cadence limit, new timer or source-time quantization is introduced.

Thin DOM rim feedback uses 88% neutral `[200,214,201]` and 12% of the existing decorative field tint. Its strength follows the current light's rim energy at 0.05 increments, and its position follows light azimuth and the existing pointer response at 1% increments. Reading cores retain fixed contrast; no source image is recolored by these variables.

Node 24.19.0 CPU checks pass **31/31 groups**: scheduler suspension/cancellation/resume races and unchanged DOM publication, plus the existing chapter playback, reading response and element choreography contracts. Scoped ESLint and whitespace checks pass. These checks do not establish browser performance, actual context recovery or physical iPhone reliability. No source conversion, dependency installation, commit, push or deployment is performed by this role.

The new `tests/pages/runtime-lifecycle.spec.mjs` adds two browser scenarios for overlapping synthetic lifecycle signals and mid-gesture cancellation. It requires zero controller/Canvas/time advancement while suspended, preserved native reading position, no replayed hidden time on first resume, released capture, and continued explicit Pause. The test itself labels synthetic events accurately; it does not represent actual browser process eviction. Browser execution remains pending the integrated production build and the parent's exclusive GPU-testing schedule.

`tests/pages/render-resources.spec.mjs` adds two further built-artifact scenarios. A complete Full/Light and 1440/3840-pixel-width cycle warms the active profiles, then two repeats must return to identical resource/program counts at the original viewport, while retaining source metadata and one Canvas. Every observed target must match the resolved physical-pixel budget; Light must release its retained mist targets. Counts are compared against the warmed state, never a hardcoded old count or an inferred VRAM capacity. The second scenario holds all three binary asset responses until synthetic pagehide, then requires the explicit `awaiting-visibility` initialization phase with zero GPU initialization attempts and unchanged resource counts. Resume must initialize once from those same requests. Each diagnostic wait is bounded at 20 seconds. Static syntax, scoped lint and whitespace checks pass; browser execution remains pending integration.

## Renderer allocation boundary

The Material/Motion peer review identified a distinct transient-allocation problem in the installed Fiber 9.8.1 / Three 0.186.1 source. Fiber applies its stored DPR and then calls `setSize` during resize, before the application's World frame. A World-only pixel cap therefore cannot prevent the renderer from first allocating a new large viewport at a stale DPR. Three's `setPixelRatio` also invokes `setSize` with the previous logical dimensions. Neither observation proves that this mechanism caused the owner's Safari process crash, but both demonstrate that final-frame target diagnostics alone are insufficient evidence of a bounded allocation path.

`renderer-budget.mjs` installs at the renderer factory, before Fiber's initial sizing. It guards `setSize`, `setPixelRatio` and direct `setDrawingBufferSize`, resolving the current detail/device-DPR/density policy before invoking the captured native combined size method. The combined method avoids the old-size recursion but still assigns canvas width before height. A portrait-to-landscape transition can therefore create an oversized intermediate `newWidth × oldHeight`. The guard first shrinks height when needed, so each native assignment remains inside the current policy. Logical viewport and `updateStyle` semantics remain intact; unchanged World synchronization performs no canvas writes. This adapter is scoped to the case's ordinary Three output buffer and non-XR renderer.

The new pure renderer tests record **every** width/height assignment, including intermediate ones, through portrait-to-4K, 4K-to-portrait, nonmonotonic aspect changes, extreme dimensions, quality changes and density-pressure changes. They also test CSS preservation, unchanged synchronization, invalid inputs and ownership-aware disposal. These five tests and the four render-budget tests pass **9/9**. The production browser resource test now independently instruments native canvas dimension setters, includes a tall 1440×2560 viewport before 4K, and attaches the observed assignment sequence. Browser execution remains required; no precise VRAM or real-device guarantee is inferred from these checks.

## Integrated verification

The handoff-era pending browser checks above were completed against Build 6. All four new allocation/lifecycle scenarios passed in Chromium, WebKit and mobile Chromium. The full public matrix has passing results for all 60 scenarios; the only initial failure was an existing feedback test sampling before the final return transform settled, corrected by polling its unchanged expected value and rerun successfully in all three engines. The integrated portable suite passed 143 tests with two conditional browser-fixture skips. See the [case verification record](../../uiux-designer/cases/bending-active-thesis/ROUND_07_VERIFICATION.md) for final performance, visual and release evidence.
