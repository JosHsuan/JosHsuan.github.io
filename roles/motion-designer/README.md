# Motion Designer

The role owns temporal response and shared visual timing. Native document position remains the reading authority; the visual playhead has momentum, bounded lag and deliberately unequal holds. Cinema owns framing/optics, Lighting owns light placement, Compositing owns influence, and UIUX owns semantic interaction.

- [Role contract](research/RESPONSE_CONTRACT.md)
- [Primary research](research/SOURCES.md)
- [Scoped skill](skills/motion-response/SKILL.md)
- [Tool inventory](toolkit.json)
- [Verification](verification/README.md)

Prepare this isolated role with `./roles/motion-designer/codex-role.ps1 -PrepareOnly`; launch with the same command without the switch. The launcher creates a dedicated ignored role home, copies only this role's skills, and restores the previous CODEX_HOME afterward. No authentication is copied. The prepared home is a CLI profile, not an assertion that desktop tools hot-load.

Run `node roles/motion-designer/scripts/verify-mcp.mjs` for actual closed-catalog MCP checks. Install the role package with exact pnpm 11.19.0 and its frozen lockfile; use `node scripts/verify-browser.mjs` from this role for the pinned browser MCP against the existing local case at 4184. Browser tools are explicitly limited and the profile is isolated; request-origin restrictions are not an OS sandbox.
