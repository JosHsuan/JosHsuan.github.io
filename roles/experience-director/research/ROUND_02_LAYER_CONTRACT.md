# Round 02 layer and response contract

Date: 2026-10-08 (Europe/Berlin). Status: coordinated implementation handoff; new case runtime not yet accepted.

The current seven semantic chapters remain overview, form, system, pattern, make, validation and credits. This round develops their visual rhythm with lens/focus, light, stage, source-supported part transforms and cross-layer feedback. The actual native document is always readable. No scroll capture, synthetic page jumps or forced scroll snapping is required to create designed visual dwell.

## One clock and explicit writers

Native scroll and measured chapter geometry immediately determine nativeU and semantic chapter. Motion Designer supplies an analytical critically damped visualU with acceleration/deceleration, bounded catch-up on large jumps, exact settle, and explicit chapter entry/hold/exit envelopes. The initial proposal uses omega 12.5 per second in [the response contract](../../motion-designer/research/RESPONSE_CONTRACT.md); acceptance depends on observed behavior, not the initial constant. The mapped stageU, visual energy, direction and dwellWeight drive scene decoration together.

Body copy, anchor location, focus order and browser scrollbar are never delayed. Designed visual stops come from a held scene/lens/light composition while the document continues naturally. A single frame controller applies the final composite camera, model transforms, light rig and decoration; no independent system rewrites those properties. Hidden documents and settled scenes stop work.

| Channel | Author | Final consumer |
| --- | --- | --- |
| nativeU / semantic chapter | Measured DOM controller | HTML semantics and reading progress |
| visualU / stageU / energy / direction / dwellWeight | Motion Designer | Camera, lighting, model and decorative feedback |
| camera position/target + film gauge/focal length | Animation Cinematographer | One camera writer; set aspect then focal length, without a competing FOV write |
| focus distance / aperture envelope / bounded blur | Animation Cinematographer | 3D Artist optical pass |
| source-part transforms / base reveal / rejoin | 3D Animation Designer + verified geometry | One model-transform writer; originals remain unchanged |
| key/fill/rim/environment/contact values | Lighting Designer | One lighting writer |
| actual source bounds / presentation ground / negative space | Scene Designer | Camera fit handoff and stage application |
| ASCII, contour, optical veil and blend parameters | 3D Artist under director approval | One compositor, no essential HTML filtering |
| media frame/icon/type accents | UIUX + Motion Designer | DOM decoration controller; content remains visible |

A channel is not implemented merely because it is listed here. Handoff APIs must be reconciled against actual role modules before integration.

## Layer stack and influence graph

| Layer | Content | Receives influence | May influence |
| --- | --- | --- | --- |
| 0 | Static true-model/base poster and graphite field | Stable fallback preference | Overall readability |
| 1 | Actual shell and source base, editorial ground, chapter rig | Visual clock, verified part transforms, camera/lens/light | Depth, luminance, subject projection and contact |
| 2 | Optical scene treatment | Camera-forward focus distance and actual DepthTexture | Visible 3D colour only |
| 3 | ASCII/contour/halo decoration | Pre-DOF actual scene luminance/depth, projected subject/key direction, shared visual energy | Decorative atmosphere and frame accents |
| 4 | Readability protection | Layout side and actual HTML/media bounds | Masks decorative overlap without modifying evidence |
| 5 | Opaque documentary media and semantic HTML | Native reading state; small frame/heading accent response | Protected screen rectangles and deliberate hover/focus intent |
| 6 | Icons, progress and optional controls | Fine-hover pointer, keyboard focus, visual dwell | Decorative tilt/underline/edge response; no hidden content gate |

The influence graph flows from verified geometry + light + camera into depth/luminance/projection; these drive optical/ASCII/halo layers. Protected HTML bounds suppress decoration behind critical foreground areas. Pointer input may tilt decoration and add bounded camera offset, but does not change the semantic chapter, provenance or visualisation meaning.

Compositor proposal: sample linear scene colour and real depth once; gather a bounded depth-dependent blur; derive ASCII from the actual pre-DOF subject signal; compose decoration with explicit screen/normal/opacity choices; perform tone mapping and output colour conversion once. Subject-only ASCII needs a real subject mask or separate verified subject render target when a stage/ground would otherwise contribute depth. A generic depth<1 test alone includes the floor and is insufficient for subject-only claims.

The Three.js scene luminance supplies character density, so a changed key direction or pose produces a corresponding decorative change. No arbitrary noise-only ASCII field may be described as model-derived. ASCII is aria-hidden, pointer-events none and absent from the essential reading path. This is a presentation effect, not stress/curvature/engineering data.

Focus distance is the camera-forward projection of the chosen subject point, not an arbitrary Euclidean target distance. Optical defocus acts only on scene colour, never the document or source-image pixels. If the measured optical pass is too costly, simplify its resolution/radius while retaining the intentional focal/focus direction; record what was actually rendered.

## Chapter direction

| Chapter | Designed stop / editorial intention | Light, staging and feedback |
| --- | --- | --- |
| overview | Discover the complete metal silhouette with the real base; deliberate focus arrival | Raking key, restrained rim, readable title; pointer tilt remains decorative. |
| form | Hold a comprehensible complete assembly; use lens change independently from translation where useful | Broad soft light, ground datum; title/annotation emphasis settles with the pose. |
| system | Transition from whole object to documented method; permit a motivated optical edit | Cool side key and subdued stage; source process image remains opaque with hover/focus frame response. |
| pattern | Dwell on real openings/folds; isolate only verified source elements | Grazing light, detail focal choice, controlled geometry-derived ASCII/contour accent. |
| make | Reverse the visual composition and reveal actual base/assembly relationship | Warmer key, contact emphasis, rigid rejoin if supported; construction images keep their source treatment. |
| validation | Restore whole geometry and reduce visual activity while reading evidence | Neutral clear rig; documentary evidence is distinct from browser presentation. |
| credits | Settle on a complete model and base | Balanced fixed ending; modest focus/hover response on actual controls and links. |

Exact values live in the lighting/scene catalogs and specialist handoffs. These records are original editorial choices, not verified measurements. The previous chapter boundaries are not proof of a successful new dwell design.

## Interaction and reduced-motion acceptance

Every information family is considered: headings get bounded accent/position response without hidden glyphs; body text stays fully readable; images receive frame/parallax response while source pixels stay opaque and unfiltered; icons support fine-pointer tilt and equivalent focus emphasis; links/controls have visible hover, focus and activation states. UIUX chooses restrained differences so the page does not animate every object identically.

Reduced motion uses a complete stable shell/base view or accurate poster and direct state changes. Disable camera travel, damping trails, decorative parallax/ASCII motion and optical transition veils; retain visible keyboard focus and necessary controls. Coarse pointers receive no hover requirement. Live preference changes and WebGL/asset failure preserve the full HTML story.

## Required proof before the overall round is complete

Inspect actual source base IDs/geometry, unchanged source hashes and explicit D-drive handoff. Render all seven dwells and their transitions at desktop/tablet/mobile aspect ratios, including reverse scroll, fast jump and resize. Verify separate focal-length and focus changes, visible deliberate damping/settle behavior, distinct light rigs, meaningful scene/base staging and source-supported animation.

Prove the decorative output responds to actual model/light/depth changes and respects protected media. Verify hover and keyboard feedback for every relevant information family. Check one persistent Canvas/camera writer, no idle ticker, bounded memory/passes and actual cost; no-JS, reduced motion/live changes, asset failures and lost WebGL context must retain readable content. Role catalogs, manifests, source pins and tool startup tests do not substitute for this runtime and visual evidence.
