# Round 02 team, implementation and establishment history

Date: 2026-10-08 (Europe/Berlin).

The owner requested expanded optics/editing, chapter lighting, 3D element processing, appropriate staging, acceleration/deceleration/damping with designed stops, richer information feedback, the original CAD base, and influence relationships between 3D and decorative layers. The team was established and committed before implementation. The subsequent owner-authorized local revision is now implemented and verified; this document distinguishes that current state from the historical establishment checkpoint below.

| Role | Responsibility | Boundary and handoff |
| --- | --- | --- |
| Interactive Experience Director | Shared chapter score, layer influence, coordination and rendered acceptance | Owns [round-02 contract](ROUND_02_LAYER_CONTRACT.md); resolves overlaps and checks actual implementation. |
| Animation Cinematographer | Camera position/target, focal length, focus distance, optical transitions and editing grammar | Expanded existing role; one final camera writer. A separate editor would duplicate the same shot grammar in this single continuous case. |
| Lighting Designer | Key/fill/rim/contact readability and light influence on decoration | New [isolated role](../../lighting-designer/README.md), seven chapter rigs, original skill, closed catalog MCP and browser MCP. |
| Scene Designer | Restrained setting, verified source-base staging, ground datum and negative space | New [isolated role](../../scene-designer/README.md); no automatic recenter/camera fitting or invented project site. |
| 3D Animation Designer | Source-supported rigid part preparation, isolation/reassembly and project elements | New [role](../../3d-animation-designer/README.md); Geometry Engineer retains source audit authority. Original CAD topology and editorial decomposition must be distinguished. |
| Motion Designer | Native-to-visual response, damping, acceleration/deceleration, dwell envelopes and cross-layer timing | New [role](../../motion-designer/README.md); supplies one visual clock, never delays native reading or captures wheel input. |
| 3D Artist | Metal material, depth/luminance-informed compositing, ASCII and optical shader implementation | Expanded existing role; consumes approved score and real 3D inputs. No separate compositor is needed unless the pipeline later becomes independently complex. |
| UIUX Designer | Semantic HTML, responsive typography/evidence, keyboard/hover/focus and decorative media feedback | Implements per-element feedback contracts with Motion Designer; no essential content depends on hover or transitions. |
| Geometry Engineer | Inspect actual Rhino base and assembly, preserve object IDs/transforms and verify derivatives | Verified shell plus 13 lower and 37 upper solid source objects; independent full-buffer/source comparison. No inferred base substitute or fabricated panel topology. |
| Integrator | One scene/controller, resource lifecycle, combined implementation and verification | Bound the shared response, optics, lighting, source layers, compositor and foreground in the same local case, then built and verified the artifact. |

The role authors coordinated these decisions across direction, motion/animation and cinema/compositing. NativeU remains immediate reading truth; a critically damped visualU and unequal chapter holds feed all scene channels. Cinema and the compositor use actual scene depth/luminance and film-gauge-based focal length. Lighting supplies chapter rigs, Scene supplies source-bound ground/haze, and Geometry/3D Animation preserve original rest placement while separating only the verified display layers.

## Current requirement audit

The director independently read the final controller, scene binding, optical score/compositor, element score and foreground CSS/markup, checked the actual final 28-result JSON, and reviewed the specialists' rendered/source records. No new browser/GPU run was used for this audit.

| Owner requirement | Current implementation and evidence |
| --- | --- |
| Camera elements beyond travel; evaluate editing responsibility | `optical-score.mjs` drives focal length and axial depth focus, including a focus transfer within held camera poses and a bounded SYSTEM/PATTERN scene dip. Existing Cinema owns editing; a duplicate editor role was unnecessary. Actual optical pixel tests and integrated focus/focal isolation passed. |
| Lighting Designer and layer-sensitive light | New isolated role feeds three directional lights, hemisphere, environment and one key shadow rig through `scene-direction.mjs` / `CinematicScene.jsx`. Scene luminance changes the decorative glyph signal. Source media/prose remain protected. |
| 3D Animation Designer and processed elements | New isolated role animates the verified shell, lower base and upper base from cached rest transforms; SYSTEM separates, PATTERN partially separates and MAKE rejoins exactly. The caption identifies editorial display separation, never fabrication order. |
| Scene Designer and appropriate 3D setting | New isolated role supplies a restrained ground, fog and chapter staging around the real subject. Ground height follows combined source minY; it does not substitute for the source base. |
| Acceleration, deceleration, damping and designed stops | Motion Designer's analytical spring preserves ordinary heavy-frame deceleration; seven unequal holds remap one visual playhead. Native document input remains immediate. Final wheel/touch, reverse/jump, settling and idle checks passed. |
| Information-element feedback | Headings/labels, glyphs, prose hover accents, media frames/source links, metadata rules and chapter controls have distinct scroll/hover/focus feedback. Source pictures remain opaque and unfiltered; touch/source inspection and keyboard checks passed. |
| Include the supplied model's base | All 50 original solid base objects are included with the shell. Independent comparison verified 172,789 vertices, 227,521 triangles, exact normals/index order and unchanged source/derivative hashes. Geometry plot and final case images show the shaped base. |
| Further layer strategy including scene-driven decoration | Full detail renders linear scene colour/depth, depth-dependent optical blur and scene-derived ASCII on one persistent Canvas, followed by one colour/tone output. Final image review covers 28 chapter/width combinations. |
| Layer influence and useful GitHub/web skill/CLI/MCP integration | Lighting/pose/source layers influence pre-DOF luminance and depth; ASCII uses a bounded screen blend while protected DOM rectangles suppress decorative overlap. Primary-source pins/licences, original scoped skills, fixed read-only MCP catalogs and useful role-local browser MCPs are established and exercised. |
| Build roles first, then collaborate on Bending-Active | Four new roles and two existing-role extensions were verified in the earlier checkpoint, followed by shared centre-anchor contracts, source handoffs, runtime binding, corrective visual review and final validation. |

No missing requested local function was found in that code/evidence audit. This is scoped local acceptance, not a claim that every proposed catalog field became an effect: halo, contactOpacity and subjectSide remain reserved/unbound score fields; actual contact uses key-light shadows, ground placement and base geometry. Scene-derived ASCII includes the base and editorial ground, not a shell-only semantic mask.

Current evidence is linked in [the final case record](../../uiux-designer/cases/bending-active-thesis/ROUND_02_VERIFICATION.md): 28/28 integrated groups; 37 CPU/HTTP passes with one optional fixture skipped in the ordinary invocation; separate Chromium and WebKit optical suites 8/8 each; 90 actual-vertex framing checks; 28 final image reviews; fresh root `pnpm check` (9 unit/controller tests, 63-file audit) and 9 built-root browser checks. The final browser HTML hash is `a77a84e572bd6b0db9886d73f4c37810ae895bd9af39d8b66b757097679dfa79`.

Source preparation/captures remain on D: with explicit sanitized local handoffs. Raw scene/triangle budgets remain exceeded; gzip model+HDR body is 4.499 MiB and still exceeds the 2 MiB mobile target. Physical phones, Firefox assertions, final public hosting and deployment remain unverified. These limits are retained instead of relabelled as passing checks.

Lighting and Scene launchers were also corrected after the current audit found that copied skills' relative research/catalog links were missing inside CODEX_HOME. Both now copy only those reviewed resources; actual prepared links resolve with matching hashes, isolated CLI registration checks pass and global configuration is unchanged.

## Historical establishment gate

Each new role needs its scoped instructions, local launcher/configuration, original discoverable skill, read-only fixed catalog MCP, useful pinned tools and actual verification. All four new role packages have passed their scoped skill, real MCP and isolated configuration checks. Lighting, Scene and Motion also exercised their pinned browser MCP against the existing local case; 3D Animation uses its closed source catalog without a browser dependency. The two existing-role skill extensions passed their validators and isolated-copy checks. The integrator inspected these records and contracts before preparing this checkpoint. These checks establish the roles; they do not accept the proposed case revision.

No root runtime dependencies, global skills, global MCP configuration or authentication are altered by these role packages. Working captures/materials use D:/JosHsuan_Website/_work/bending-active-thesis/round-02. Publication remains separate. The older case and prior green tests cannot be cited as acceptance of these new requirements.

## Historical categorized commit checkpoint — before runtime implementation

At this earlier checkpoint, changes were grouped into motion/source-animation roles, lighting/scene roles, 3D compositing research, cinematic optics/editing research, and shared team documentation. Each category had its own commit. Private source files, local case handoffs, generated builds, runtime homes and dependencies remained excluded.

Validation on 8 October 2026 used Node 24.19.0 and pnpm 11.19.0:

| Check | Observed result |
| --- | --- |
| Root `pnpm check` | Passed content validation, lint, types, 9 unit/controller tests, static export and the 63-file public artifact audit. |
| Built `out/` browser checks | 9 passed across Chromium, WebKit and mobile Chromium emulation. |
| Firefox | One bounded attempt failed at browser launch with `spawn UNKNOWN`; two remaining tests did not run. |
| Actual mobile hardware | Not tested; browser emulation is the available evidence. |
| Production and local case runtime | No runtime changes in this checkpoint; round-02 implementation and rendered acceptance remain pending. |

The push triggers the existing validation workflow. Pages publication remains a separate manual workflow and is not dispatched by this checkpoint.
