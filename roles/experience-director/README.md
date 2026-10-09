# Interactive Experience Director

The missing responsibility was integration direction: deciding how content, scene, evidence and interaction form one readable experience. This role establishes the shared composition and acceptance contract and coordinates the existing specialists. It does not add another general UI or 3D implementation team.

- [Layer and story contract](research/LAYER_STORY_CONTRACT.md): seven chapters, layer ownership, native scroll and restrained pointer tilt.
- [Lusion research](research/LUSION_RESEARCH.md): primary-source observations, transferred principles and limits.
- [Team responsibilities](research/TEAM.md): responsibility boundaries and handoffs.
- [Toolkit](toolkit.json): pinned upstream skill/MCP sources and role-local configuration.
- [Verification](verification/README.md): actual role/config/MCP evidence; does not substitute for the parent case's browser review.
- [Independent integration review](verification/INTEGRATION_REVIEW.md): observed first-build defects, coordinated corrections and inspected closure on the revised artifact.
- [Round 07 layer refactor](research/ROUND_07_LAYER_REFACTOR.md): current cross-role contract for clear reading surfaces, sustained rendering and the owner-reported browser failure; implementation checks remain distinct from release acceptance.

Run from this repository using the pinned toolchain:

```powershell
pnpm --dir roles/experience-director install --ignore-workspace --frozen-lockfile --ignore-scripts
./roles/experience-director/codex-role.ps1 -PrepareOnly
./roles/experience-director/codex-role.ps1
pnpm --dir roles/experience-director verify:mcp
```

The launcher prepares `.runtime/codex-home`, copies only this role's skills and restores the caller's home variable after the session. It never copies authentication or edits the global configuration. Existing CLI authentication may need a separate normal sign-in; this role does not promise desktop hot-loading. Start the case's existing local preview before the browser MCP verification.

The upstream Playwright skill is role-local and adapted for this Windows host's pinned MCP instead of a global or unpinned CLI install. The custom read-only story MCP supplies reviewed direction. The browser MCP uses an isolated profile, an explicit tool list and `http://127.0.0.1:4184`; its request-origin restriction is not an OS security sandbox. Working browser captures go to `D:/JosHsuan_Website/_work/bending-active-thesis/cinematic-integration/director-browser`; independent boundary captures go to the adjacent `verification/director-boundaries` folder. Configuration and tool code remain role-local.
