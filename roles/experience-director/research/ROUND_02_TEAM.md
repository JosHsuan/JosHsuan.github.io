# Round 02 team and establishment milestone

Date: 2026-10-08 (Europe/Berlin).

The owner requested expanded optics/editing, chapter lighting, 3D element processing, appropriate staging, acceleration/deceleration/damping with designed stops, richer information feedback, the original CAD base, and influence relationships between 3D and decorative layers. Roles are established before new case implementation. The latest owner request is to categorise current changes into staged commits and push; this milestone records the established team and handoff, not completion of the full experience revision.

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
| Geometry Engineer | Inspect actual Rhino base and assembly, preserve object IDs/transforms and verify derivatives | Source-base identification and the new derivative remain pending. No inferred base substitute or fabricated panel topology. |
| Integrator | One scene/controller, resource lifecycle, combined implementation and verification | Parent owns runtime changes after the role-establishment gate; no specialist starts a competing page. |

The role authors coordinated these decisions across direction, motion/animation and cinema/compositing. Motion proposes nativeU as reading truth and a critically damped visualU with explicit dwell; cinematography/compositing proposes actual depth/luminance and a film-gauge-based lens contract. Lighting and staging supply chapter records while leaving source-base identification to geometry inspection.

## Establishment gate

Each new role needs its scoped instructions, local launcher/configuration, original discoverable skill, read-only fixed catalog MCP, useful pinned tools and actual verification. All four new role packages have passed their scoped skill, real MCP and isolated configuration checks. Lighting, Scene and Motion also exercised their pinned browser MCP against the existing local case; 3D Animation uses its closed source catalog without a browser dependency. The two existing-role skill extensions passed their validators and isolated-copy checks. The integrator inspected these records and contracts before preparing this checkpoint. These checks establish the roles; they do not accept the proposed case revision.

No root runtime dependencies, global skills, global MCP configuration or authentication are altered by these role packages. Working captures/materials use D:/JosHsuan_Website/_work/bending-active-thesis/round-02. Publication remains separate. The older case and prior green tests cannot be cited as acceptance of these new requirements.

## Categorized commit checkpoint

The current changes are grouped into motion/source-animation roles, lighting/scene roles, 3D compositing research, cinematic optics/editing research, and the shared team documentation. Each category has its own commit. Private source files, local case handoffs, generated builds, runtime homes and dependencies remain excluded.

Validation on 8 October 2026 used Node 24.19.0 and pnpm 11.19.0:

| Check | Observed result |
| --- | --- |
| Root `pnpm check` | Passed content validation, lint, types, 9 unit/controller tests, static export and the 63-file public artifact audit. |
| Built `out/` browser checks | 9 passed across Chromium, WebKit and mobile Chromium emulation. |
| Firefox | One bounded attempt failed at browser launch with `spawn UNKNOWN`; two remaining tests did not run. |
| Actual mobile hardware | Not tested; browser emulation is the available evidence. |
| Production and local case runtime | No runtime changes in this checkpoint; round-02 implementation and rendered acceptance remain pending. |

The push triggers the existing validation workflow. Pages publication remains a separate manual workflow and is not dispatched by this checkpoint.
