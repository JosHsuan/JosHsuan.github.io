# 3D Artist — material & camera desk

Seven implemented local studies, fourteen captured A/B views, one live stage. This is the role authorized by [SESSION_BRIEF.md](SESSION_BRIEF.md), not a portfolio implementation or professional content collection.

**Open [the desk](http://127.0.0.1:4180/).** To start it again from the repository:

```powershell
.\roles\3d-artist\open-desk.ps1
```

The launcher verifies the port belongs to this desk and never terminates another service. UIUX remains on 4175; its authoring port 4176 is untouched. The new preview is loopback-only. Build output, logs and runtime home are ignored.

## Suggested review order

1. Read the contact sheet; both sides are actual captured renders with recorded settings.
2. Open [materials](http://127.0.0.1:4180/?study=materials), then [light](http://127.0.0.1:4180/?study=lighting), [refraction](http://127.0.0.1:4180/?study=refraction) and [scattering](http://127.0.0.1:4180/?study=scattering). Open live stage, switch A/B and inspect one parameter.
3. Try [physics](http://127.0.0.1:4180/?study=physics) and [particles](http://127.0.0.1:4180/?study=particles). Play is deliberate; Step advances 1/60 second. Reset and A/B restore initial conditions. Posters use step 90.
4. Compare [camera projections](http://127.0.0.1:4180/?study=camera). Play restarts the genuine 4.8-second Theatre inspection score. Manual controls release authored camera ownership.
5. Freeze up to two views, inspect their actual camera/time/parameters, and export the image plus state. Save a preference and write notes; export the 3D review for a durable record.

Static posters show their recorded presets. Parameter edits apply when the live stage opens. Only one Canvas exists. Live stages pause offscreen/when hidden and dispose on close or navigation. Reduced motion starts at rest; a deliberate Play remains available. Ordinary buttons, keyboard controls, touch and the contact sheet require no camera gestures.

## Preference evidence

The owner defined UIUX Saved as their preference source. The exact snapshot is still **not captured**: the original browser connector failed again. It is unknown, not empty. No IDs have been inferred from screenshots, automated fixtures or curator recommendations.

In the original UIUX browser at `http://127.0.0.1:4175/`, **Export discussion choices** downloads the real JSON. Import that file using **Import real UIUX export** in this desk. The original origin/key, export time, file SHA-256 and supplied notes are retained separately. Unknown historical IDs remain visible for review. Earlier Save IDs do not establish that newer treatments were reviewed. Import records supplied evidence; it does not independently authenticate the file's author.

3D choices use `artist3d-review-v1` on `127.0.0.1:4180`, separate from UIUX. Saved records contain variant, parameters and time. Notes remain editable. Export/import round trips were tested with explicitly synthetic data in isolated browsers. Those fixtures are never owner preferences. No browser storage was scraped or overwritten in the owner's original session.

## Role tools and activation

```powershell
.\roles\3d-artist\codex-role.ps1 -PrepareOnly
.\roles\3d-artist\codex-role.ps1 mcp list --json
.\roles\3d-artist\codex-role.ps1
```

The launcher sets a separate home only for its child invocation, then restores the environment. It copies two role skills and registers `artist3d_catalog` and `artist3d_browser`. No root/global `.agents` or `.codex` registration and no credential copying. A full CLI session may require its own authentication. Merely writing this configuration does not hot-load tools into this desktop chat.

- **3D Artist — Controlled studies:** original scene/shader/physics/motion workflow informed by the available R3F fundamentals, shaders and animation skills.
- **3D Artist — Playwright:** pinned OpenAI skill with upstream instructions/notices. The host has no `npx`, so its Bash wrapper was not executed. This Windows role uses the explicitly requested pinned browser MCP and test scripts instead of installing a global CLI.
- **Catalog MCP:** read-only closed catalog, source IDs, study limits and direct URLs; no shell or arbitrary-file tools.
- **Browser MCP:** isolated ephemeral profile, loopback origin, explicit tool allowlist, role output directory. Its configured MCP 0.0.83 / project Chromium 1.63 combination was actually exercised. Allowed origins is not an operating-system sandbox.

[toolkit.json](toolkit.json) records pins, permissions and provenance. [config-loader.json](verification/config-loader.json) is actual output from the installed Codex loader; [mcp-results.json](verification/mcp-results.json) records real initialize, tool calls, navigation, snapshot and screenshot checks. No Blender server or unneeded DCC host was installed.

## Build and verify

Keep Node **24.19.0** and pnpm **11.19.0**. The root's committed Next/React/Three/Fiber/Drei/Theatre/GSAP/Zustand versions remain unchanged. The role reuses their installed modules. Only the isolated role package adds Rapier 0.19.3 and Playwright MCP 0.0.83.

```powershell
pnpm --dir roles/3d-artist install --ignore-workspace --frozen-lockfile --ignore-scripts
node roles/3d-artist/scripts/build.mjs
.\roles\3d-artist\open-desk.ps1 -NoBrowser
node --test roles/3d-artist/tests/invariants.test.mjs
node roles/3d-artist/scripts/verify-browser.mjs
node roles/3d-artist/scripts/verify-resilience.mjs
node roles/3d-artist/scripts/verify-mcp.mjs
node roles/3d-artist/scripts/validate.mjs
```

`--ignore-workspace` is essential for a separate dependency lockfile. `scripts/capture-posters.mjs` updates rendered A/B assets and their pose/parameter/hash records after an intentional visual change. `scripts/catalog.mjs` refreshes study/source metadata; it does not acquire remote assets. Normal builds use local bytes and exclude Studio at module compilation. The standalone role webpack artifact is a local review tool; production remains the existing Next static export.

## Sources and reusable implementation

| Location | Purpose |
|---|---|
| [catalog/studies.json](catalog/studies.json) | Seven implemented questions, controls, approximation limits, source IDs and direct links |
| [catalog/sources.json](catalog/sources.json) | Primary Three, R3F, Rapier, Theatre, Poly Haven and rendering references |
| [catalog/assets.manifest.json](catalog/assets.manifest.json) | Local CC0 HDR source, author, date, notice and checksum |
| [catalog/previews.manifest.json](catalog/previews.manifest.json) | Fourteen real captured views with actual camera, parameters, step and hash |
| [src/scenes.jsx](src/scenes.jsx) | Original aperture, lighting, physical material, transmission, scattering shader and camera ownership |
| [src/physics.js](src/physics.js), [src/particles.js](src/particles.js) | Actual rigid-body integration and deterministic analytic flow |
| [src/motion/theatre](src/motion/theatre) | Existing application adapter binding and genuinely exported score, with credited reuse |
| [research/DECISIONS.md](research/DECISIONS.md) | Technique selection, preference authority and adoption tradeoffs |
| [verification/README.md](verification/README.md) | Actual verification outcomes and limitations |

Poly Haven's Studio Small 09 HDR is CC0, credited to Sergej Majboroda; no reference-site renders were copied. Scene geometry is original local study code. Rapier's npm and Git revision pins match. The historical JS repository has migrated upstream; this package is a deliberately tested prototype pin, not a claim to be latest. Rapier is loaded only for Physics.

Theatre state is an exact copy of the earlier genuine UIUX spatial score. Its real four tracks and 24 keyframes fit this independent rib aperture; the 3D manifest records the source. Clean Core playback is tested through the unchanged application adapter. No new Studio authoring session or fabricated export is claimed. Future score changes require real local Studio authoring and a new versioned export.

## Current limits

Transmission is a screen-space raster approximation; there are no caustics or nested transparent-object transport. Scattering is an explicit surface approximation. Particles are illustrative kinematics, not CFD. Rigid bodies are ideal shapes, not structural or manufacturing analysis.

This desk serves unminified local development-readable bundles and records their actual size. No field INP, physical-device FPS, GPU-memory byte budget, screen-reader audit or production readiness is claimed. Browser emulation is not physical-device testing. Firefox could not launch on this Windows host. Detailed evidence is in the verification record.

All production content remains empty; no private drive was read or imported. No deployment, commit or push was performed.
