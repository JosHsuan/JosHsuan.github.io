# Animation Cinematographer — local comparison desk

Open [the desk on 4182](http://127.0.0.1:4182/). Thirteen working camera and image-making proposals share one scene and one input. Move horizontally, or choose Page scroll for native scroll control. A/B stay synchronized; narrow screens stack the pair. No separate lens/effect sliders or autonomous playback are present.

Start with [fixed/dolly](http://127.0.0.1:4182/?study=locked), [speed/acceleration](http://127.0.0.1:4182/?study=timing), [zoom/dolly](http://127.0.0.1:4182/?study=zoom) and [shot language](http://127.0.0.1:4182/?study=language). Then compare handheld, curved paths, pan/truck, dolly zoom, focus pull, black diffusion, occlusion, crane and an authored Theatre score. Rationale, proposed use and limitations appear below each comparison.

The contact sheet uses actual u = 0.30 captures; source panels link u = 0.70. Save A/B records the progress point. Notes, export and import preserve a review without technical sliders. Keyboard arrows/Home/End and touch map to the same scalar. Reduced motion defaults to a static midpoint with explicit session-only manual-motion opt-in.

## Build and start

Use Node **24.19.0** and pnpm **11.19.0**. Runtime libraries resolve to the unchanged root lockfile. The separate role lockfile contains its development MCP dependency.

```powershell
pnpm --dir roles/animation-cinematographer install --ignore-workspace --frozen-lockfile --ignore-scripts
node roles/animation-cinematographer/scripts/build.mjs
.\roles\animation-cinematographer\open-desk.ps1
node --test roles/animation-cinematographer/tests/interaction.test.mjs
node roles/animation-cinematographer/scripts/verify-interactions.mjs
node roles/animation-cinematographer/scripts/verify-mcp.mjs
```

`capture-interactions.mjs` intentionally refreshes actual images and pose/effect/hash evidence. Rebuild afterward to include the manifest. Current browser results and device limits are in `verification/interaction-browser.json`.

## Role skills and MCP

```powershell
.\roles\animation-cinematographer\codex-role.ps1 -PrepareOnly
.\roles\animation-cinematographer\codex-role.ps1 mcp list --json
.\roles\animation-cinematographer\codex-role.ps1
```

- `cinema-shot-design`: scoped camera trajectory, time law, lens, shot scale and approximation guidance.
- `cinema-interaction-review`: single-input validation, review exports and UIUX evidence handling.
- `cinematic-editing`: shared-score focal length, actual depth focus, reading holds and reversible edit envelopes. The [round-02 optics/edit contract](research/round-02/OPTICS_EDIT_CONTRACT.md) extends this role's responsibility. Its local Bending-Active case adapter is implemented; [adapter checks](../3d-artist/research/round-02/RUNTIME_ADAPTER_CHECKS.md) and [actual image review](../3d-artist/research/round-02/VISUAL_REVIEW.md) distinguish verified rendering from outstanding device/performance acceptance.
- `playwright`: pinned OpenAI skill with original Apache notice and role display metadata. Its Bash/npx recipe is unavailable here; actual Node scripts and MCP calls are exercised instead.
- `cinema_catalog`: three read-only local catalog tools, without arbitrary-file or shell access.
- `cinema_browser`: Playwright MCP 0.0.83 with a headless ephemeral profile, loopback origin restriction, tool allowlist and role output directory.

The launcher uses only `.runtime/codex-home` and restores the parent environment. No credentials or global registrations are copied. A full session may require its own authentication. This is not a claim of hot loading into this chat. Actual loader and tool-call evidence appears in `verification/config-loader.json` and `verification/mcp-results.json`. Allowed origins is a request restriction, not an OS sandbox.

## Evidence and boundaries

Storage is `cinema-interaction-review-v1` on 4182, independent from UIUX 4175 and 3D 4180. Import UIUX choices accepts the original export with origin/key, time, notes/sources and SHA-256. Until the actual file is imported, owner preferences are unknown. Known IDs retain revision uncertainty. Synthetic tests never establish preferences.

The initial shared review shell is a deliberate source copy. This runtime never imports another role's code or state. Theatre uses the root controller and a genuine existing export with its own project identity. Each view has one writer; per-frame values stay outside React state; Studio is absent from viewer bundles.

Black diffusion and depth of field are screen-space approximations, not calibrated optical models. Geometry is an original abstract test fixture. The local Poly Haven environment is CC0. No private content, commercial reference-site art or invented professional claims were used.

Read the [research plan](research/INTERACTION_PLAN.md), [sources](catalog/sources.json), [studies](catalog/studies.json), [captures](catalog/captures.manifest.json) and [toolkit](toolkit.json). Production, existing UIUX files, root dependencies, global configuration and deployment remain unchanged.
