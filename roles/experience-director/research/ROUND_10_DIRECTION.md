# Round 10 — restore cinematic scale and hold the scene through the chapter

Date: 9 October 2026. Visual reference: Round 08 `ed59810`. Status: agreed direction, pure motion implementation and browser acceptance contracts; integrated visual/performance acceptance and release are recorded by the root integrator.

The owner rejects Round 09's small framed presentation while retaining its useful resource and lifecycle architecture. This instruction supersedes the Round 09 visual acceptance. Restore the large cinematic composition, separate the scene's scroll trigger from information reveals, and let a chapter hold its scene before the scene departs. Full-page ASCII has its own presentation surface. A visible frame is optional, not a universal requirement. The existing authorization includes implementation, staged commits, push and deployment; this reviewer does not perform release operations.

## What the comparison changes

The reviewed Round 08 `desktop-full.png` and `touch-tall-full.png`, plus the earlier Round 07 overview/source captures, establish a different hierarchy from Round 09: the opening assembly deliberately extends beyond the viewport, and source geometry occupies a larger portion of the page. The earlier source captures are supporting references, not claimed to be exact Round 08 captures. Round 09's 48vw surface plus its fixed local 0.88 aperture made the work feel like a specimen in a card. Removing only the border would leave that reduction intact.

The correction is a viewport-scale visual plane with bounded physical rendering storage. CSS footprint, source-camera aperture and GPU attachment dimensions are separate decisions. A smaller backing buffer must not silently become a smaller composition. Preserve the approved original material, broad light, highlight diffusion, authored source colors, title/reading hierarchy and meaningful absence in MAKE/VALIDATION. The user's Safari failure screenshots establish a page-process failure; they do not establish its cause or prove that a smaller visual card fixes it.

## Twelve-role discussion and resolution

Three concurrent reviewers represent four disciplines each, with root integrating their work. This is an explicit twelve-role review, not twelve separately launched agents or twelve browser sessions. Each group read the maintained role contracts. The four responsibilities owned here draw on the Experience Director's layer/story contract, UIUX design plan, Information Designer README and Round 06 source-diagram direction, and Motion Designer response/playback contracts. Peer records contain their role-specific research and implementation evidence.

| Role | Position, critique and resulting decision |
| --- | --- |
| Interactive Experience Director | Restore the approved scene hierarchy rather than evaluating only whether the model fits. The opening is a large sculptural shot; the source chapters are stable study shots; evidence chapters deliberately clear the stage. Information and scene remain coordinated without sharing one rectangle or one trigger. |
| UIUX Designer | Keep readable opaque HTML cores, ordinary chapter navigation, source controls and fallback posters. Remove the universal specimen-card requirement. A full-size scene may extend behind or beyond editorial layers, but actual links and readable text retain pointer precedence. Touch scrolling remains native. |
| Information Designer | Documentary diagrams retain authored paths, labels, evidence limits and keyboard selection. A workflow's source highlight must describe the geometry actually presented, not merely whichever information chapter is active. Explicit comparison requests go through the shared selection owner; decorative ASCII contains no unique information. |
| Motion Designer | Hold the outer stage at exact x=0, y=0, scale=1 over a measured chapter interval. Entry/departure use reversible translation and opacity near boundaries. The camera/lens/light loop continues on the existing clock. Do not continuously shrink the stage as a source slot clips against the viewport. |
| 3D Artist | Keep the verified metal response and original source colors at the restored visual scale. Source-derived glyphs must still depend on actual radiance/depth; moving decorative contours to a separate layer cannot silently erase that response. |
| Animation Cinematographer | Restore the original opening camera with deliberate edge crop. Source studies use a fixed viewport aperture and the final camera is fitted after optical and inspection cues. World remains the sole camera writer; the outer stage owns only chapter travel. |
| Lighting Designer | Preserve the oblique area key, cool rim, low fill and cached source-relative shadow. Restored scale should reveal the existing folds and surface response. Do not compensate with another shadow owner, extra exposure wash or per-frame environment work. |
| Scene Designer | Return to the continuous graphite exhibition setting without a mandatory rounded frame. Preserve actual floor/base contact. The independent page field must remain visible across the page rather than disappearing behind the real opaque wall/floor. Keep MAKE/VALIDATION absent and restore the quiet CREDITS silhouette. |
| Performance Engineer | A transform alone does not reduce the cost of a large backing store. Retain pixel caps, guarded storage assignments, pressure relief and real offscreen sleep. Compare the restored composition directly; do not transfer Round 09's card-area saving to a different visual footprint. |
| Software Architect | One retained WebGL context, one final camera writer and one shared chapter clock. An independently owned 2D page field is allowed, with no second WebGL context, no new RAF and no GPU readback. Reconcile the old one-Canvas shorthand explicitly. |
| Geometry Engineer | Keep original GLB bytes, topology, source counts, colors and identity transforms. Fit verified family support in the approved aperture. Do not shrink/deform the source to hide a presentation error or infer analysis values from stored colors. |
| 3D Animation Designer | Existing source comparison, bounded orbit and truthful display-only layer separation continue within a held shot. Outer stage departure is editorial motion. No fabricated topology morph or fabrication sequence is introduced. |

The scene reviewer challenged the first local-aperture assumption: a fixed 0.88 camera fit inside a small surface was itself a new composition. Direction accepts the original viewport camera for OVERVIEW and fixed viewport study apertures instead. The performance reviewer challenged keeping the old reduced pixel count while enlarging its display: that would materially soften edges. Direction accepts independently measured resource limits and a conservative touch profile, with visual fidelity checked rather than presumed.

The Information/UIUX review challenged coupling workflow highlights to the information chapter after scene triggers were separated. Source correspondence must follow the actual presented representation while the model is visible. The Motion review challenged continuing to chase natural DOM slot rectangles: only measured chapter boundaries now enter the pure stage sampler. These critiques change implementation, rather than being parallel descriptions of the same initial proposal.

## Scene and information ownership

The existing information controller keeps its native reading probe, one-shot entrances, settling and semantic `aria-current`. Scene selection uses document position plus a separate 0.62-viewport-height probe. Between the existing 0.42-height reading probe and the scene probe, the visible information chapter and scene chapter can legitimately differ. The controller publishes both meanings distinctly. Direct source inspection may explicitly request its associated scene; it must not make every information update force the scene back into its old slot.

The stage is one retained full-viewport logical surface. CSS translation and opacity belong to the pure stage response. Camera orientation, focus and final fitting belong to the scene sampler/World writer. Logical/backing dimensions belong to discrete viewport and resource-budget handling. Normal scroll owns none of those dimensions. Pointer ray coordinates follow the transformed actual Canvas and final camera; exact source mesh hits remain interactive outside the former document slot. Opaque reading surfaces, links and controls intercept their ordinary actions first.

Source-study apertures are fixed in normalized viewport coordinates: landscape/square uses `{left:.51, top:.20, width:.43, height:.52}`; portrait uses `{left:.045, top:.205, width:.91, height:.43}`. These preserve the earlier source-region footprint while removing scroll-dependent camera chasing. Full source studies retain their verified support margin. OVERVIEW instead uses the original cinematic camera at source-study weight zero: cropping at the page edge is intentional and must not trigger universal assembly fitting. CREDITS retains the original closing composition.

## Scroll interval and pure interface

For a chapter with document boundaries `a` and `b`, viewport height `h` and span `s=b-a`:

- Scene interval begins at `a - 0.62h` and ends at `b - 0.62h`.
- Entry occupies at most `min(0.18s, 0.45h)`; departure at most `min(0.20s, 0.50h)`.
- The remaining middle interval holds exactly at x=0, y=0, scale=1, opacity=1. It is at least 62% of the chapter span.
- Entry arrives from +0.22 viewport width and +0.035 height. Departure travels to -1.08 width and -0.05 height. Quintic easing supplies zero boundary velocity/acceleration. There is no rotation, perspective or scale animation.
- At a natural chapter boundary both adjacent shots reach zero opacity, allowing their hidden placement to change. Reverse scroll retraces the same passage. MAKE and VALIDATION are absent; CREDITS has no forced terminal exit, so attribution does not end in an empty stage.

`createCanvasMotion()` creates mutable state. The existing controller calls:

```js
advanceCanvasMotion(state, dt, {
  anchors, // eight finite, increasing natural chapter boundaries
  docY, // native document position
  viewport: {width, height},
  reducedMotion,
  seek,
  forcedChapter, // optional explicit inspection/navigation request only
});
```

The returned same state exposes `chapter`, `index`, `phase`, `start`, `end`, `holdStart`, `holdEnd`, `x`, `y`, `scale`, `opacity`, `visible`, `settled` and `mode`, plus response bookkeeping. Root resolves scene playback from this returned chapter before sampling the scene score. `sampleCanvasHold(options)` exposes the pure target sampler for contract checks. It accepts no DOM rectangle, Canvas element, camera, renderer or scheduling callback.

Only the presented scene trigger position is exponentially damped using caller-supplied delta seconds. This keeps the entire hold numerically exact while smoothing interrupted scroll near a boundary. First frame, seek, Reduced, stale delta over one second and jumps over 1.5 viewport heights resolve directly. A seek into a transition initially shows a useful still. Its selected point temporarily becomes the neighboring hold boundary, so the first pixel of forward or reverse scroll does not abruptly drop opacity. The exception clears when normal passage reaches the natural hold or another chapter. Reduced selects a useful still without autonomous travel.

The controller keeps scheduling until response settlement and any required reveal paint acknowledgment complete. Heavy GL may suspend after opacity reaches zero or the translated stage leaves the viewport; CSS hiding alone is not suspension. The shared semantic clock and independent page field can continue during MAKE/VALIDATION. Pause/hidden/Reduced retain their stronger existing policies.

## Independent page ASCII

The implementation explicitly has one mounted WebGL Canvas and one mounted 2D decorative page Canvas, plus the field's detached 2D atlas. This supersedes literal one-HTML-Canvas wording while preserving the resource rule of one WebGL scene context. No unique caption, diagram meaning or source claim lives in the decorative layer; it is noninteractive and aria-hidden.

The page field consumes the existing chapter field/time/pointer score and can remain visible when the heavy scene departs. Actual integration review found that the exhibition's opaque wall/floor hid an underlay even with a transparent scene background. Root therefore places the independent decorative 2D layer above GL and below reading HTML. It is an intentional page overlay and does not claim depth attenuation or source geometry occlusion. The actual source-derived glyph response remains inside GL, where it still follows source radiance/depth. Artists own that distinction and the combined visual weight; Performance owns bounded atlas/cell/pixel work and update rate. Reading planes remain above both. This separation does not claim pixel identity with the old combined shader. The peer implementation caps the 2D field at 900,000 physical pixels, 12,000 evaluated cells and 30 clock-driven updates per second, with no independent scheduler.

## Acceptance and current evidence

Accept the restored composition against matched Round 08 chapter, phase, viewport and source representation. Record projected source width/height and silhouette occupancy, not just a screenshot with no clipping. The review target is at least 90% of the reference source footprint during a held study, unless the actual geometry/pose comparison demonstrates why the earlier capture is not comparable. OVERVIEW's deliberate overflow is a positive criterion. A complete tiny assembly does not satisfy the opening direction.

The following are required before release:

1. At three distinct natural scroll positions inside each relevant source hold, the outer stage stays at exact viewport size and x=0/y=0/scale=1. Information continues through its native positions. Camera/light/source loops may continue without redefining the screen aperture.
2. Boundary entry/exit and interrupted reverse scroll are continuous and do not remount GL or resize backing attachments. Direct navigation, history return, Reduced and explicit inspection resolve useful states.
3. Desktop, tablet, phone portrait and phone landscape retain the opening scale, legible source detail, source colors, mist/highlight character and readable navigation/captions. No mandatory card rim is introduced.
4. Visible source interaction hits the actual mesh, including outside the old HTML slot; empty space is not an invisible button. Keyboard comparison remains anchored to semantic controls and touch pan stays native.
5. Workflow selection/label and source presentation correspond even when information and scene chapters differ. The independent full-page field is visibly present through MAKE/VALIDATION while GL draw count stops.
6. Pause/hidden reaches zero controller, GL and 2D field work after settlement. Orientation and quality changes respect guarded allocations; prolonged operation reports actual counts, cadence and limitations.
7. Ordinary reading/fallback remains available through model failure or recovery. Emulated browser checks cannot establish physical iPhone Safari process stability; the final release record must identify that limit.

Scoped work completed here: nine pure motion tests pass on Node, covering exact holds across desktop/tablet/phone layouts, independent triggers, continuous entry/exit and hidden chapter boundaries, reverse passage, 3/30/60/120 Hz damping agreement, interrupted response, seek/Reduced behavior, intentional absence/closing return and input validation. Browser contracts now cover three-position viewport holds, separate semantic/scene chapters, one GL plus one ASCII surface, evidence-phase GL sleep with evolving ASCII, complete Pause idleness and reversible departures. Shared test helpers choose a readable position within a real chapter hold and search actual unobscured projected source hits. These browser files were syntax checked; browser execution remains with root's exclusive GPU slot.

Peer implementation and evidence: [scene direction](../../3d-artist/research/ROUND_10_SCENE_DIRECTION.md) and [runtime review](../../software-architect/research/ROUND_10_RUNTIME_REVIEW.md). Their pure checks and proposed limits are distinct from final rendered acceptance. No new source assets, dependency versions or material claims are introduced by this direction record.
