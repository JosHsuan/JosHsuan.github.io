# Round 02 layer and response contract

Date: 2026-10-08 (Europe/Berlin). Status: implemented local case, verified against the final artifact; public release and physical-device performance remain separate.

This contract began as the role-establishment handoff. The current sections below describe the actual round-02 binding; the earlier checkpoint is preserved in [the team history](ROUND_02_TEAM.md). [Final verification](../../uiux-designer/cases/bending-active-thesis/ROUND_02_VERIFICATION.md) records the actual code/artifact hashes and results.

The current seven semantic chapters remain overview, form, system, pattern, make, validation and credits. This round develops their visual rhythm with lens/focus, light, stage, source-supported part transforms and cross-layer feedback. The actual native document is always readable. No scroll capture, synthetic page jumps or forced scroll snapping is required to create designed visual dwell.

## One clock and explicit writers

Native scroll and measured chapter geometry immediately determine nativeU and semantic chapter. Motion Designer's implemented analytical response uses omega 12.5 per second, bounded catch-up on large jumps, exact settling and unequal chapter entry/hold/exit intervals. Seven held stage coordinates are `(index + 0.5) / 7`; camera, lighting and element samplers consume this already-eased coordinate without adding another hold curve. Ordinary heavy frames retain the deceleration tail; a stale gap over one second or explicit visibility resume seeks instead of replaying hidden time. The mapped stageU and shared visual response coordinate scene and DOM decoration.

Body copy, anchor location, focus order and browser scrollbar are never delayed. Designed visual stops hold the scene/lens/light composition while the document continues naturally. The DOM response controller supplies one shared input; one scene binding applies the final composite camera, model transforms and light rig. Hidden documents and settled scenes stop work. Optical focus can continue within selected camera holds through visualU, so a visual stop does not imply that every photographic channel must be frozen.

| Channel | Author | Final consumer |
| --- | --- | --- |
| nativeU / semantic chapter | Measured DOM controller | HTML semantics and reading progress |
| visualU / stageU / energy / direction / dwellWeight | Motion Designer | Camera, lighting, model and decorative feedback |
| camera position/target + film gauge/focal length | Animation Cinematographer | One camera writer; set aspect then focal length, without a competing FOV write |
| focus distance / aperture envelope / bounded blur | Animation Cinematographer | 3D Artist optical pass |
| source-part transforms / base reveal / rejoin | 3D Animation Designer + verified geometry | One model-transform writer; originals remain unchanged |
| key/fill/rim/hemisphere/environment values | Lighting Designer | One lighting writer; one key-light shadow map in Full detail |
| actual source bounds / presentation ground / negative space | Scene Designer | Camera fit handoff and stage application |
| ASCII, depth blur, optical veil and blend parameters | 3D Artist under director approval | One compositor, no essential HTML filtering; source contours stay in the material adapter |
| media frame/icon/type accents | UIUX + Motion Designer | DOM decoration controller; content remains visible |

`CinematicExperience.jsx` binds `story-response.mjs`; `CinematicScene.jsx` binds `element-score.mjs`, the shared-stage camera, `optical-score.mjs`, `scene-direction.mjs` and `scene-compositor.mjs`. The source layers are shell, base-lower and base-upper. At SYSTEM they lift by 0.24 m / 0 m / 0.09 m respectively; PATTERN retains 70% separation and MAKE restores the original placement. This is explicitly labelled display separation, not a fabrication sequence or a physical panel decomposition.

Reserved score fields are not effects: `halo`, `contactOpacity` and `stage.subjectSide` are currently not bound to separate runtime properties. Actual contact comes from the verified base, ground height and key-light shadows. Chapter composition belongs to the camera score. There is no separate halo pass or contact-shadow compositor. These optional proposal fields are not needed to claim the requested actual lighting, scene staging or cross-layer influence.

## Layer stack and influence graph

| Layer | Content | Receives influence | May influence |
| --- | --- | --- | --- |
| 0 | Static true-model/base poster and graphite field | Stable fallback preference | Overall readability |
| 1 | Actual shell and source base, editorial ground, chapter rig | Visual clock, verified part transforms, camera/lens/light | Depth, luminance, subject projection and contact |
| 2 | Optical scene treatment | Camera-forward focus distance and actual DepthTexture | Visible 3D colour only |
| 3 | Scene-derived ASCII and material contour emphasis | Actual pre-DOF scene luminance/depth; visual progress for the material emphasis | Decorative scene treatment; no separate halo |
| 4 | Readability protection | Layout side and actual HTML/media bounds | Masks decorative overlap without modifying evidence |
| 5 | Opaque documentary media and semantic HTML | Native reading state; small frame/heading accent response | Protected screen rectangles and deliberate hover/focus intent |
| 6 | Icons, progress and optional controls | Fine-hover pointer, keyboard focus, visual dwell | Decorative tilt/underline/edge response; no hidden content gate |

The implemented influence graph flows from verified geometry, layer offsets, lights and camera into scene colour/depth. Those buffers drive optical blur and ASCII character density; the chapter score sets blend strength and a scene-only editing veil. Protected HTML bounds suppress ASCII behind critical foreground areas. Pointer input tilts icon/media decoration and adds a bounded camera offset, but does not change the semantic chapter, provenance or representation meaning. DOM accents consume visual response energy rather than a claimed light-to-DOM halo signal.

The compositor renders RGBA16F linear scene colour with a real depth texture, gathers a bounded depth-dependent blur, derives ASCII from pre-DOF scene luminance/depth, applies a limited screen blend and performs tone mapping/output colour conversion once. Its normal-blend branch remains available to the bounded score/diagnostics; the authored case uses screen-limited blending. Full detail requests two MSAA samples with depth resolve; Light requests zero and disables blur, ASCII, veil and shadows while preserving real geometry.

ASCII is deliberately scene-derived: its depth/alpha coverage includes the shell, actual base and editorial ground. It is not labelled as a shell-only semantic mask. Protected regions use actual reading/media/control rectangles, with a conservative union if the fixed 16-rectangle capacity is exceeded. Actual fixture and integrated pixel comparisons verify that protected-region content is unchanged by ASCII.

The Three.js scene luminance supplies character density, so a changed key direction or pose produces a corresponding decorative change, confirmed by fixed-pose/light pixel checks. The effect is inside the aria-hidden, pointer-inert background and absent from the essential reading path. It is an artistic presentation, not stress/curvature/engineering data.

Focus distance is sampled within the camera-forward depths of current combined source bounds, not arbitrary Euclidean target distance. Selected held compositions perform a focus rack; focal length is set after aspect/film gauge, with no later competing FOV assignment. Optical defocus and the short SYSTEM/PATTERN dip act only on scene colour, never document or source-image pixels. Full caps DPR at 1.25; Light uses DPR 1. The poster path avoids model/HDR loading for initial reduced motion and Save-Data.

## Chapter direction

| Chapter | Designed stop / editorial intention | Light, staging and feedback |
| --- | --- | --- |
| overview | Introduce the metal silhouette and real base through a cinematic close view; deliberate focus arrival | Raking key, restrained rim, readable title; pointer tilt remains decorative. |
| form | Hold a comprehensible complete assembly; use lens change independently from translation where useful | Broad soft light, ground datum; title/annotation emphasis settles with the pose. |
| system | Separate the three verified display layers and attend to documented method | Cool side key, controlled optical focus and source process image with hover/focus frame response. |
| pattern | Hold a closer view with partial display-layer separation | Grazing light, detail focus transfer and controlled scene-derived ASCII/material contours. |
| make | Reverse composition and restore actual source placement | Warmer rig, actual base/contact shadow and exact rigid rejoin; source pictures retain their original treatment. |
| validation | Restore whole geometry and reduce visual activity while reading evidence | Neutral clear rig; documentary evidence is distinct from browser presentation. |
| credits | Settle on a complete model and base | Balanced fixed ending; modest focus/hover response on actual controls and links. |

Runtime values live in the case's pure score modules; catalogs preserve the original authored endpoints and handoff intent. They are editorial choices, not calibrated lights/lenses or verified physical measurements. Final browser tests exercise each hold, transitions, reverse input and fast jumps; 28 settled image reviews cover the seven chapters at four widths.

## Interaction and reduced-motion acceptance

Every information family has a defined response: headings shift slightly with shared visual progress; rules and glyph accents respond to energy; prose has a restrained hover border/colour cue while staying fully readable; opaque images move with their frames and expose original-source links; decorative icons tilt under fine-pointer input; links, image actions, chapter navigation and controls retain visible keyboard focus/activation. Decorative icons are not added to keyboard tab order. Coarse pointers receive a visible image action and no hover requirement.

Reduced motion uses the true shell/base poster initially, or a complete stable source pose on a live preference change. It removes camera travel, display separation, damping trails, decorative transforms, ASCII/defocus and editing veils while retaining controls and focus visibility. Pausing motion likewise restores the static complete object. No-JavaScript, model failure and lost WebGL context preserve the HTML story and poster. These are verified runtime behaviors, separate from the role setup checks.

## Acceptance evidence and retained limits

The final independent read-only audit checked the bound code and actual 28/28 browser-result JSON at HTML hash `a77a84e572bd6b0db9886d73f4c37810ae895bd9af39d8b66b757097679dfa79`. The scene/optical runtime was tested separately from the empty production root: 37 CPU/HTTP checks passed (one optional GPU fixture skipped in that ordinary invocation); separate optical fixtures passed 8/8 in both Chromium and WebKit; the final integrated matrix passed 28/28 including native input, dwells, reverse/jump, pixel influence/protection, resource/idle behavior, UI feedback and fallback modes. All 28 final captures were reviewed across the Cinema/Compositing and parent reviewers; this document does not claim a new independent image run.

Source fidelity independently verifies all 172,789 vertices, 227,521 triangles and 50 base objects, unchanged source hashes, exact normals and triangle order. Ninety whole-source projection checks prove FORM/CREDITS containment across five ratios and pointer extrema; deliberate detail crops in other chapters are not falsely reported as whole-object fits. Prepared material/source work remains under D: with explicit local handoffs.

The final render retains real source complexity, so 227,521 triangles exceed the 150,000 target. Model+HDR uses 8,495,096 raw bytes / 4,717,754 gzip body bytes; raw desktop/mobile and encoded mobile limits remain exceeded. Full MSAA/shadows add GPU cost; Light keeps the geometry and reduces effects, while the poster avoids scene transfer. No physical phone benchmark, successful Firefox assertion, public-host performance or deployment is claimed. The [final verification](../../uiux-designer/cases/bending-active-thesis/ROUND_02_VERIFICATION.md) retains those limits and the resolved heavy-frame/caption/edge-quality findings.
