# 3D Artist — one-input interaction desk

The current desk contains **twelve working interaction proposals**, including four new texture/shader studies. Open [the local desk](http://127.0.0.1:4180/). Pointer X or native page scroll controls one shared progress value; both A/B views respond synchronously. The current desk has no technical sliders or autonomous playback.

New: [directional grain](http://127.0.0.1:4180/?study=bamboo-grain), [sourced PBR texture](http://127.0.0.1:4180/?study=bamboo-pbr), [height contours](http://127.0.0.1:4180/?study=surface-contours), and [attention hatching](http://127.0.0.1:4180/?study=surface-focus). See the [texture/shader plan and material adapter](research/TEXTURE_SHADER_PLAN.md). These are original fixtures and an independent CC0 reference swatch; no owner project geometry is used by this desk.

Start with [selection](http://127.0.0.1:4180/?study=proximity), [section reveal](http://127.0.0.1:4180/?study=section) and the [integrated reader](http://127.0.0.1:4180/?study=reader). Other proposals explore light, a refractive window, a particle brush, cached real contact simulation and finish as focus feedback. Each has an input mapping, use, limitation, sources and candidate UIUX IDs beside the render.

The contact sheet contains actual captures at u = 0.30; source panels offer u = 0.70. Save A/B with a progress point and note, then Export choices. Storage is `artist3d-interaction-review-v2`; original `artist3d-review-v1` data is untouched. Keyboard arrows/Home/End and touch are equivalent access to the same u. Reduced motion defaults to a static midpoint.

The previous seven-study slider bench remains at [the archive](http://127.0.0.1:4180/bench/index.html). Its [original README](research/PARAMETER_BENCH.md), brief and reports are historical, not evidence for this round. Use the current commands below; legacy catalog scripts must not regenerate the current catalog.

## Build and start

Exact Node **24.19.0**, pnpm **11.19.0**, root lockfile and separate role lockfile are required.

```powershell
pnpm --dir roles/3d-artist install --ignore-workspace --frozen-lockfile --ignore-scripts
node roles/3d-artist/scripts/build-interactions.mjs
.\roles\3d-artist\open-desk.ps1
node --test roles/3d-artist/tests/interaction.test.mjs roles/3d-artist/tests/physics-cache.test.mjs
node --test roles/3d-artist/tests/materials.test.mjs
node roles/3d-artist/scripts/validate-materials.mjs
node roles/3d-artist/scripts/verify-interactions.mjs
node roles/3d-artist/scripts/verify-mcp.mjs
```

`capture-interactions.mjs` intentionally refreshes actual comparison images and pose/effect/hash evidence. Rebuild afterward to include the manifest. `verification/interaction-browser.json` reports this round; older browser reports apply to the archived bench.

## UIUX integration and preferences

The [UIUX workspace](http://127.0.0.1:4175/) supplies candidate principles: select, separate, compare, return. The reader study connects real Theatre seek, assembly spacing and fixed HTML chapter labels to one u. See [the current plan](research/INTERACTION_PLAN.md).

The owner's actual UIUX Saved snapshot is unknown. Export discussion choices in the original UIUX browser, then Import UIUX choices here. Origin/key, time, notes, sources and SHA-256 are preserved. Known IDs do not prove newer treatments were reviewed; unknown IDs remain unresolved. Synthetic tests never establish owner preferences.

## Isolated role tools

```powershell
.\roles\3d-artist\codex-role.ps1 -PrepareOnly
.\roles\3d-artist\codex-role.ps1 mcp list --json
.\roles\3d-artist\codex-role.ps1
```

This opt-in launcher uses `.runtime/codex-home`, restores the parent environment, copies only this role's skills and registers `artist3d_catalog` / `artist3d_browser`. The new `artist3d-texture-shader` skill and `artist3d_get_material_recipe` catalog tool are explicitly scoped to this role. No credentials or global registrations are copied. A full session may need separate authentication. Configuration does not hot-load this desktop chat; real loader/MCP evidence is under verification.

[Animation Cinematographer](../animation-cinematographer/README.md) has independent port 4182, skills, MCP namespace, lockfile, runtime home and storage. Shared initial review source was copied deliberately; neither runtime imports the other role.

## Sources and scope

- [Studies](catalog/studies.json): implemented input-to-output mappings.
- [Sources](catalog/sources.json): primary research, revisions and limitations.
- [Captures](catalog/captures.manifest.json): actual rendered states and hashes.
- [Toolkit](toolkit.json): skill/MCP provenance.

Original abstract geometry is a test fixture, not portfolio content. The Poly Haven HDR and three Bamboo Wall maps are local CC0 data; the latter belong only to an independent swatch. The MIT simplex source is pinned and retains its licence. Contact uses two actual Rapier worlds cached at 60 Hz; reverse scrubbing reads earlier states. Particles are analytic, not CFD. Theatre reuses the genuine UIUX export byte-for-byte through the root adapter. Studio is excluded. This role's build reads repository-local role data and installed root dependencies, never private preparation drives; nothing here is deployed.
