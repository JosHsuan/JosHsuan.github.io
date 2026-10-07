# 0003 — Isolated UI/UX materials and working local proposals

Date: 2026-10-07 (Europe/Berlin)

After withdrawing the portfolio implementation and integrating its design guide, the owner requested a UI/UX designer role setup plus public-source visual materials, reusable interactions/effects/animation and individually built local proposals. This is a new authorized **role research/prototyping** scope. It does not resume the portfolio slice or populate professional content.

## Role isolation

Use `roles/<role>/` for opt-in role workspaces. The first is `roles/uiux-designer/`, with role AGENTS, a skill/source registry, config template and launcher. Three skills are local to that role: a project-specific material-curation workflow, pinned Anthropic frontend-design, and pinned OpenAI Playwright guidance. Display names identify UIUX designer; their upstream licenses/notices remain with them.

The launcher renders an ignored role-specific Codex home and copies only this role's skills. Its two MCP registrations are uiux_catalog and uiux_browser. The former is a read-only lookup over the same material records used by the browser; the latter is an actual Microsoft Playwright MCP setup for loopback review, with isolated browser state and a tool allowlist. Both were initialized and exercised. Default/global Codex config remained byte-identical. No root `.agents` or `.codex` registration, credential copying or other-role activation was introduced.

MCP 0.0.83's alpha Playwright dependency is confined to the role's separate package/lockfile. Its browser uses the existing project headless-shell binary, and the exact local combination was tested. Website dependencies, main lockfile, source, publication inputs, routing and deployment configuration remain unchanged. Root lint excludes `roles/**` as a neutral future-role boundary; each role owns its own checks. This is the sole root tooling change.

## Materials and review architecture

The first collection has 19 proposals across Typography, Icons, Identity, Interface, Motion and Spatial. It includes five actual font files, 36 icon SVGs from three libraries, three original identity glyphs and eight original license files. External files are pinned to GitHub revisions with exact hashes and notices; builds use local bytes. Original code/geometry is labeled as a UI/UX specimen with no professional or engineering claim.

The local artifact is a separate `dist/` on port 4175, never the Pages `out/` artifact. Its category/search view leads to an individual working specimen with conventional controls, source/license links, proposal notes and reusable source. Compare holds up to three still previews; a single live specimen avoids multiple canvases. Saved choices and notes stay in browser storage and export as discussion JSON. They are not publication approval or content writes. Print styling provides a contact sheet.

Theatre remains the authored-motion core. The section specimen uses the existing application adapter and actual Studio-exported state. Studio authoring stays in a separate loopback surface, excluded from runtime bundles. Native CSS/Web Animations, SVG, GSAP DOM reflow, deterministic geometry, a Three/R3F shader and ASCII projection each have their own explicit property owner and implementation notes. No extra portfolio effect/physics/postprocessing runtime was added.

The inspection tool uses English labels and Traditional Chinese owner-directed proposal notes. It does not read the private preparation folder. Formal adoption, professional content, public assets, production performance budgets and deployment remain later owner-selected work.

## Verification

The [role verification record](../../roles/uiux-designer/verification/README.md) records actual asset hashes, font signatures, Studio checkpoints, two MCP protocol/browser checks, role lint and 57 material/browser checks across Chromium, WebKit and a narrow Chromium viewport. Core review flows and real local downloads were exercised. Root `pnpm check` and 9 existing portfolio browser checks passed; the artifact remains the empty scaffold. Real devices, Firefox for this collection, field performance and comprehensive accessibility conformance are not claimed.

The design guide and decisions 0001–0002 are preserved. Its previous "do not begin implementation" boundary continues to protect the portfolio; the current explicit request separately authorizes these isolated UI/UX proposal artifacts.

## Round 02 — more expressive spatial motion

The owner subsequently asked to consider every object through 3D motion and explore interactive feedback for different objects. The role now contains 26 proposals, adding six CSS perspective studies and one genuine WebGL assembly under Spatial feedback. A [research matrix](../../roles/uiux-designer/research/spatial-feedback.md) covers every existing object family, sources, response states, design limits and suggested adoption order. All seven have individual live specimens and captured stills; they reuse the same review/save/export interface.

The new Theatre score is an actual Studio export with four sequenced tracks, six poses and 24 keyframes, replayed through the unchanged application adapter. Direct interaction owns separate nested transforms. An original response kernel provides interruptible precise/elastic feedback for DOM surfaces without an added library. Tests cover normal/reduced motion, keyboard, touch emulation, real raycast selection, complete playback, idle rendering, context-loss fallback/recovery and review flows. The role verification record contains current results and explicitly retains real-device/performance/accessibility limits. The production portfolio and deployment boundary remain unchanged.

## Round 03 — a connected spatial editorial proposal

The owner liked Spatial feedback, saved preferences and requested their extension into a website design approach and further features. The owner clarified that **Saved is the preference source**. The role now includes a connected `/features/` review page on the existing 4175 origin. It reads and displays those choices without overwriting them; a clean browser is explicitly an exploration preset. Automated fixtures are not described as observed owner choices.

The [design approach and integration contract](../../roles/uiux-designer/research/spatial-editorial-system.md) map spatial selection, inspection, alignment and return to six working feature proposals: study index, method reader, image inspection, two-study comparison, parameterized SVG workbench and shared actions. Real original studies supply the demonstration content. Downloads contain actual current geometry or review state. The existing Theatre score is opt-in and has a separate scene owner; Studio and the production framework remain untouched. A separate feature manifest preserves the material catalog's 26-entry contract.

The new browser suite exercises the connected flows, synthetic Saved basis, local-storage failures, direct URL/history, keyboard/touch, reduced motion, image zoom, undo/redo, exported file contents and actual 3D mounting/disposal. The verification record states results and limits. No additional dependency, professional content, public route, publication or global role registration is authorized by this prototype work.

## Round 04 — apply feedback to each material family

The owner clarified that Spatial feedback should be applied to Icons, Interface, Motion, Spatial and other features. [The applied material proposal](../../roles/uiux-designer/research/applied-feedback.md) extends all 19 original materials, retaining their IDs, Saved records, licenses and original controls. Each gains a Baseline/Spatial comparison with a material-specific property mapping. The seven Round 02 studies remain the vocabulary reference; the six Round 03 connected features remain separate.

This includes actual glyph input feedback, interface detents/representation, four motion treatments, picked CPU geometry with responsive GLSL hatch, and actual ASCII height-range decomposition. The genuine Theatre export and adapter remain unchanged; direct inspection owns nested groups and pauses authored playback. No optional package, global tool registration, professional material or deployment change was introduced. The role's applied manifest, captured-pose records and verification report document the current evidence and limits.
