# Round 10 — restore the cinematic viewport composition

Date: 9 October 2026. Status: owner-requested correction, cross-role agreement and scoped implementation. Integrated browser appearance and performance remain subject to the root verification record.

## Direction and evidence

The owner rejected Round 09's visual result. Restore the pre-Round-09 hierarchy: a large sculptural opening, deliberately cropped by the viewport; complete source studies with the earlier visual footprint; a continuous exhibition setting; and authored absence during MAKE and VALIDATION. The scene holds its screen composition through the chapter interval while information scrolls. Entry and departure occur at chapter boundaries. An information rectangle does not size, clip or steer the camera.

Round 09 treated a resource-saving surface as a small visual specimen card. Its 48vw maximum-width surface, square phone presentation and fixed local 0.88 aperture reduced the model's prominence and separated its light/field from the page. Removing the border alone would not restore the composition. Retain useful architecture from that round: one persistent WebGL context, bounded attachments, renderer acknowledgment before re-entry, demand rendering during absence, correct transformed pointer coordinates and one shared motion clock.

Evidence inspected without opening a browser:

- Current source and the original camera path retained from `ed59810`, including the source fit, Full compositor and chapter score.
- Existing `round-07/verification/visual-final` desktop/mobile overview and source-study captures, plus their `capture-report.json`. These are earlier visual references, not claimed to be exact `ed59810` captures.
- Existing `round-09/verification/final-desktop-overview.png`, `final-desktop-system.png`, `final-phone-overview.png` and `final-phone-form.png`.
- Experience peer's comparison of the existing Round 08 desktop Full and touch/tall captures supports the same hierarchy correction.
- The root-produced exact pair `round-10/verification/round08-desktop-overview.png` and `round10-desktop-overview.png` was subsequently inspected. It confirms the restored large opening scale/crop and reveals that the proposed field underlay is fully occluded by the real exhibition set.

The old capture report gives source apertures of approximately x=0.51, width=0.43 and height=0.52 on a 1440×1000 viewport, and x=0.045, width=0.91 and height=0.43 on 390×844. The old DOM-dependent top coordinate varied with scrolling. Round 10 deliberately authors a fixed top coordinate instead.

## Four professional positions

The following positions draw on each role's actual `AGENTS.md`, `README.md` and existing research contracts. They are a joint review conducted in this task, not a claim that four separate render processes or role MCP sessions were started.

| Role | Position and implementation consequence |
| --- | --- |
| 3D Artist | Restore the source as the dominant form. Keep the verified original geometry, metallic surface response, authored source colours and Full optical path. A separate decorative field may own background motion, but glyphs described as source-derived must still sample actual rendered radiance/depth. Do not replace that response with random or purely decorative noise. |
| Lighting Designer | Preserve the broad oblique rectangular key, narrower cool rim, low HDR fill and one cached shadow owner. Larger presentation must reveal the existing folds and brushed response rather than use an exposure lift to compensate for a smaller object. Preserve highlight-based black mist and true source/base contact; no new shadow maps or per-frame environment generation. |
| Scene Designer | Return to a continuous graphite floor-to-wall exhibition sweep and negative space. A visible card outline is not a universal scene requirement. The original editorial set and verified source base remain distinct. Preserve the set's real opacity and contact; the independent decorative field can be a separate overlay rather than erasing the floor to expose an underlay. |
| Animation Cinematographer | Keep the original viewport opening and complete attribution return. Hold the source study's screen-space aperture through its chapter, with bounded orbit/lens/focus motion inside the shot. Boundary translation and absence belong to the presentation controller; one World callback writes the final camera. Information reveals and scene chapter triggers are related but independently resolved. |

Relevant role references include the 3D Artist's `round-02/COMPOSITING_CONTRACT.md`, Lighting and Scene `research/CONTRACT.md`, Scene `ROUND_03_STAGE_LIGHT.md` and `ROUND_06_AUTONOMOUS_LAYERS.md`, and Cinematographer `round-02/OPTICS_EDIT_CONTRACT.md` and `research/bending-active/cinematic/README.md`.

## Agreed composition contract

`sampleSourceScenePose({compositionMode:'viewport-stage', ...})` restores viewport authority without changing the historic/default sampler or removing the optional Round 09 local mode.

- OVERVIEW uses the original authored story pose at study weight zero. It keeps intentional viewport-edge cropping instead of fitting the whole assembly into a small rectangle.
- FORM, SYSTEM and PATTERN use the immutable source-family support union at full fit weight. `viewportStageSourceViewport(aspect, viewportWidth)` follows the actual CSS reading breakpoint: up to 780px, `{left:.045, top:.205, width:.91, height:.43}`; 781–1100px, `{left:.51, top:.20, width:.41, height:.52}`; above 1100px, `{left:.51, top:.20, width:.43, height:.52}`. The same exported function is used by the controller/interaction contract, and the sampler receives `viewportWidth`. The historic aspect-only fallback remains available when width is omitted.
- Scroll-provided slot rectangles and weights do not change those source fits. The final orbit, bounded manual inspection and optical FOV are resolved before exact fitting. The existing minimum three-percent per-edge margin remains inside the authored aperture.
- MAKE and VALIDATION retain source absence. Their independent page field may continue from the same clock while scene rendering sleeps.
- CREDITS uses the original complete, quiet viewport return at study weight zero. It is not forced back into the small local card.
- Ordinary scroll uses a stable logical viewport and presentation transform. It does not resize backing attachments. Genuine viewport/orientation changes are handled through the existing resource budget.

Actual model hit testing must follow the transformed Canvas and final camera. Reading controls, links and opaque reading surfaces take pointer precedence. A source's old HTML information slot cannot be the only place where its visible viewport model receives an interaction. Keyboard controls remain attached to their semantic source surface.

## Separate the independent field from the source response

The old combined cell pass mixed an evolving contour field with actual scene luminance/depth. The chapter optical score currently gives the older dedicated `asciiWeight` layer zero weight, so merely moving `fieldWeight` into a 2D layer would silently remove the source response.

The approved split is explicit:

1. A page-sized 2D Canvas draws only the independent analytic glyph field. It shares the controller's chapter field/time/pointer values, adds no WebGL context, RAF or timer, and does not read GPU pixels. Performance owns its cell, pixel and update-rate bounds.
2. The initial underlay proposal was rejected after actual capture: the real exhibition floor/wall covers the field even with a transparent scene background. The revised order is the GL scene, the independent decorative 2D field, then reading DOM. The original set retains real opacity. The Scene callback remains the sole scene-background owner. The 2D layer has no depth-aware attenuation claim.
3. `compositor.render(scene, camera, score, {..., independentField:true})` retains only the scene response in GL. Glyph selection derives from actual scene radiance; actual scene depth/alpha and the quiet surface gain bound its coverage. Independent contour/pointer evolution does not run through that response. This is scene-derived coverage, including the floor, not a fabricated object-ID mask.
4. Full depth focus, linear HDR colour, bounded highlight diffusion, premultiplied alpha and the single final tone/output transform remain. Clear corners stay transparent; genuine highlight scatter may still expand coverage locally. No full-frame grey veil, CSS blur or background readback is added.
5. The historic combined compositor remains the default for its existing fixtures. Diagnostics expose `field.mode:'source-only'` and `layering.independentField:true` when the split is active.

The independent 2D field has a visual approximation limit: the initial atlas conversion from numeric linear tint through an ACES approximation appeared olive/beige in actual captures. The final approved decorative display colour is copper `#e07b3b` (224,123,59), with a 0.65 overall field-opacity multiplier. GL linear tint and source-only gain stay unchanged. The 2D layer cannot reproduce the old scene-dependent blend in clear and depth-bearing pixels exactly; this is an intentional separation judged in actual captures, not a byte-equivalence claim. The old GL field applied a 0.24 gain over bright scene surfaces; the overlay cannot reproduce that per-pixel quieting without depth. Do not make the entire set translucent or introduce a readback to recover decorative glyph density.

## Resource and verification limits

The performance peer correctly rejects a promise that Round 09's reported 61% pixel saving survives the restored visual scale. That saving largely came from a smaller displayed surface. The former desktop pressure floor already used about 399k physical pixels; forcing the same viewport to around 155k would visibly soften source edges. Retain the existing attachment cap and pressure policy, introduce the conservative touch profile independently from composition, and measure the actual result. A page field built from thousands of 2D glyph draws also has a real CPU/compositor cost.

No source mesh simplification, additional GL context, readback, increased uncapped attachments or replacement of Full material/optics is authorized by this visual correction. The reported iPhone Safari process failure remains a priority, and browser emulation cannot establish physical-device crash resolution.

Scoped checks performed:

- Node 24.19.0 pure camera/optical run: 16 passed, one GPU fixture intentionally skipped because the root task owns GPU access.
- New viewport-stage projection: 270 configurations covering desktop, tall portrait, 820px tablet, phone portrait/landscape and wide desktop; real retained source support preserves a minimum aperture margin of 3.007406% through phase and inspection extremes.
- Historic tests remain passing: 825 actual public GLB vertex projection configurations and 300 optional local-surface configurations.
- A further pure check passes for the complete verified CREDITS assembly silhouette across 15 aspect/phase combinations.
- Added an actual WebGL optical fixture branch for the split: a wholly transparent empty scene, no glyph coverage outside the real scene, visible lighting-dependent source glyphs, no decorative time/pointer effect in the source-only pass, and one output transform. This branch requires root browser execution before its result is claimed.
- Pages assertions now distinguish one WebGL Canvas from one independent ASCII Canvas, project original geometry into the authored viewport aperture, expect the touch profile's zero MSAA samples while preserving Full mist, and verify a chapter-held scene while the workflow information scrolls and follows its presented shared phase.
- A new 820×1180 Pages regression cycles all 11 presented source variants across the three study chapters. It projects each original support through the actual camera and requires both the existing fit margin and four CSS pixels clear of the real reading-card and permanent navigation bounds. Root reports this passing in all three browser projects. The companion orientation/navigation regression also passes in all three projects: all seven targets remain in the viewport, measure at least 44px, and the ending remains reachable. These focused responsive checks total 6/6; the root integration record remains authoritative.

## Final responsive capture review

The synchronized desktop and phone captures restore the intended scale, complete source studies and quiet copper field. Initial WebKit screenshots had retained an older presentation surface despite current CPU camera diagnostics. The capture process now requests the same-state render followed by two RAF presentations before judging pixels; this does not change the scene's authored camera.

The first 820px portrait capture exposed a real layout error: aspect-based camera selection centered a source behind the left reading card even though CSS still used two columns. Explicit viewport-width selection fixes the mismatch without following an information rectangle. A subsequent right-aligned capture showed the far source edge touching the permanent rail. The compact split aperture therefore uses width 0.41, retaining 95.3% of the ordinary 0.43 horizontal framing allowance while reserving rail clearance. This correction does not change the hero or source geometry.

The first 932×430 capture also showed the vertical navigation rail extending below the viewport. Root implemented a short-landscape horizontal rail and verified all-seven-target reachability. The final corrected captures show all seven entries within the viewport and the complete study source above the rail.

All 20 initial final-layout captures were visually reviewed across OVERVIEW, FORM, SYSTEM, PATTERN and MAKE. All ten corrected tablet and landscape captures were then reviewed again after the responsive fixes. The copper field at 0.65 preserves source and reading priority across all four layouts, including the open background of MAKE. MAKE's source absence leaves the physical evidence and reading card primary. Tablet studies now retain a substantial complete source beside the copy and clear of the permanent rail; the all-variant projection regression complements these selected-source stills. Hero edge cropping remains deliberate. The final composition, field balance and responsive source exposure are visually accepted with no remaining scene blocker.

The root integration record is authoritative for shader compilation, actual rendering, interaction, mobile/desktop screenshots, full browser tests and performance. Pure projection success does not by itself approve the restored visual composition.
