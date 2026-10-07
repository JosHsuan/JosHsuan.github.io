# 3D Artist — session brief

Owner request recorded: 7 October 2026. Role: **3D Artist**. Status: authorized next-session work; this brief is not an implementation or verification report.

## Objective and starting point

Find suitable skills and MCP capabilities, configure them for this role only, research public GitHub/primary web sources, and build individually inspectable local visual proposals covering materials, lighting/shadows, refraction/diffusion, physics, particles and cameras. Deliver working experiments and a coherent review surface, not only a link list or moodboard.

Read repository instructions, README, decisions 0001–0003, the latest architecture, design guidelines and the [UIUX design plan](../uiux-designer/UIUX_DESIGN_PLAN.md) before changes. Inspect the current working tree, assets, exact dependencies and deployment configuration. The working tree already contains substantial uncommitted UIUX work; preserve it. The current request authorizes this separate prototype role, while the production portfolio remains empty.

The visual direction is cinematic engineering editorial, with spatial ambition, an experimental Lab and an original FORM / SYSTEM / MAKE identity. Make original compositions and reusable effects; do not copy reference-site assets or layouts. Use public licensed assets or original procedural studies, with no invented professional claims or imports from the private preparation drive.

## Preference boundary

The owner says Saved is their UIUX preference source. Exact choices have not been captured: the original browser connector failed, and no export was found during this handoff. See the UIUX plan for the exact origin, storage key and existing export format. Synthetic tests, clean-browser presets and curator recommendations are not owner choices.

Continue useful research against the explicit brief without guessing IDs. If actual owner choices become accessible, preserve their provenance and explain which selected principle informed each 3D proposal. Separate inherited UIUX evidence, 3D candidate interpretations and new 3D Saved choices. Do not overwrite the UIUX storage or silently treat an unobserved list as empty. Prefer a real export/import for cross-origin transfer; any browser bridge must be deliberately read-only and must not expose arbitrary local storage.

## Role isolation and tools

Create `roles/3d-artist/AGENTS.md`, a role README, a toolkit/source manifest, role-local skills, a configuration template and an explicit launcher. Keep role-only MCP dependencies and lockfile separate from the root website dependencies. Use a distinct ignored runtime home, browser profile, logs, output directory, MCP names, storage keys and local port. Check availability before selecting a port; UIUX uses 4175 and its local authoring surface reserves 4176.

Inspect the UIUX launcher as a pattern without changing or activating it. Do not register 3D skills/MCP globally or at the repository-root `.agents`/`.codex`, copy credentials, or change another role's settings. Configuration files do not prove that this desktop session has hot-loaded the tools. Verify the actual launcher/config loader and MCP initialize/tool calls; report unavailable integrations precisely.

Read applicable skill-creator/skill-installer and R3F skills when used. Candidate capabilities include scene/resource ownership, custom materials/shaders, procedural motion and browser visual QA. Choose and pin sources after inspection; an available skill is not a dependency requirement. Use a local read-only material catalog MCP and a browser inspection MCP when they serve the implemented workflow. Add DCC/Blender or other services only for a demonstrated requirement and an available, testable host workflow.

Official Codex references checked for this handoff: [configuration/state locations](https://learn.chatgpt.com/docs/config-file/config-advanced), [MCP configuration](https://learn.chatgpt.com/docs/extend/mcp?surface=cli), [skills](https://learn.chatgpt.com/docs/build-skills). Codex configuration/state can use a dedicated home; MCP definitions live in configuration. Role isolation is this project's opt-in packaging decision, and must be verified against the installed client.

## Research and specimen matrix

| Family | Working proposal and comparison | Evidence to make visible |
|---|---|---|
| Materials | Compare metal, rough/diffuse and layered/coated surfaces on controlled original geometry | Local texture provenance or procedural recipe; roughness/metalness/normal/color handling; lighting held constant |
| Light and shadow | Compare editorial key/fill/rim or environment lighting, shadow softness and exposure | Actual light/shadow implementation, tone mapping, limitations and resource costs |
| Refraction / transmission | Inspect a transparent object with thickness, roughness and index-of-refraction controls | Which rays/surfaces the chosen renderer actually approximates; opacity is not refraction; no unsupported caustic claim |
| Diffusion / scattering | Compare surface diffuse response and a clearly labeled scattering/translucency approximation where useful | Distinguish the physical phenomena and the implemented approximation; show a stable baseline |
| Physics | A meaningful constrained assembly, drop/contact or suspension experiment with pause, reset and tunable parameters | Actual engine/integrator and timestep, collision behavior and limitations; do not label a spring easing effect as a full physics simulation |
| Particles | A controlled geometry-related field or flow with actual count/seed/response controls | Determinism where applicable, CPU/GPU ownership, rendering limits, pause and teardown |
| Camera / composition | Compare orthographic/perspective, framing and an authored inspection sequence | Explicit inspection/playback ownership, current lens/pose values, reset and static views; real Theatre export for authored motion |

Use this as coverage, not a mandate to add one library for every row. Prefer capabilities already supplied by Three/R3F/Drei and the agreed stack. Any optional engine must serve a concrete working specimen, have a pinned compatible version/license and stay isolated until production adoption is separately decided. Research primary repositories/docs and actual asset licenses rather than relying on lists or marketing screenshots.

For each acquired asset record source URL, author, pinned revision/file, retrieval date, original license/notice, checksum and intended use. Build from local bytes with no hidden CDN dependency. Keep reference documentation as links. Choose a small coherent set and explain why it suits the project.

## Review format

Build a local **3D material and camera desk**: a lightweight static contact sheet grouped by physical/visual question, leading to one active live stage. Compare captured stills under consistent conditions; use sequential or single-stage A/B for heavy effects. Every proposal needs a direct URL, actual local preview, conventional parameter controls, reset, a plain-language explanation, source/license, tradeoffs and reusable implementation references.

Provide 3D-specific Saved choices, notes and a real export/import with provenance. Preserve any imported UIUX basis separately. Make the current state and differences inspectable; do not infer approval from opening a specimen. A frozen comparison image should record its pose/parameters so it is not misleading. A printable/contact-sheet view is useful for quick review.

Keep the surrounding interface restrained and readable, inheriting the UIUX principle of stable labels and hit regions. Offer keyboard/touch paths, visible focus, reduced motion, manual play/pause, static descriptions/posters and WebGL failure recovery. Navigation must never require commands, animation or a 3D camera gesture. Stop/dispose closed or hidden live experiments.

## Motion, architecture and validation

Keep Node 24.19.0, pnpm 11.19.0, the agreed Next/React/Three/R3F/Drei/Theatre/GSAP/Zustand stack and root lockfile. Preserve static deployment compatibility. Production routes, content snapshots, the generated entries folder and deployment workflow are not destinations for these studies.

Theatre remains the authored-motion core through the agreed runtime adapter. Keep direct Theatre imports in this role's `src/motion/theatre`, version real Studio exports and their manifests, and exclude development-only Studio from runtime output. Reuse an existing genuine score only if it fits and credit its provenance; never fabricate authored exports. Direct procedural effects may own separate properties. Use one writer per camera/property and no per-frame React state.

Verify the role build, source/license/hash catalog, runtime/Studio boundary, actual rendered controls, save/export/import, direct URLs, camera ownership, pause/reset, disposal/idle rendering, reduced motion and failure fallback. Test representative desktop Chromium/WebKit and touch emulation against the built artifact, visually inspect captures, and state actual coverage. Test any physics/particle invariants that affect truthfulness and reproducibility. Run root `pnpm check` and relevant built-`out/` flows when required by repository instructions or shared architecture changes.

Report actual results and limits; do not claim physical-device, screen-reader, field-performance or GPU-budget verification without performing it. Finish with the easiest local review link/launcher, a concise recommended review order, sources and adoption tradeoffs. Do not deploy, publish professional content, commit/push unrelated work, or stop at a research plan when local implementation can proceed.
