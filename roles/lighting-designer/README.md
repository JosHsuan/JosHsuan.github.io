# Lighting Designer

Own key/fill/rim, contact readability and light influence on decorative layers. Keep source evidence readable and unaltered.

The original [role skill](skills/lighting-direction/SKILL.md), [chapter catalog](catalog/chapters.json), [direction contract](research/CONTRACT.md) and [primary-source research](research/PRIMARY_RESEARCH.md) are isolated from the portfolio runtime. [Toolkit](toolkit.json) records upstream revisions and what was actually adopted.

Use exact Node 24.19.0 / pnpm 11.19.0:

```powershell
pnpm --dir roles/lighting-designer install --ignore-workspace --frozen-lockfile --ignore-scripts
./roles/lighting-designer/codex-role.ps1 -PrepareOnly
./roles/lighting-designer/codex-role.ps1
pnpm --dir roles/lighting-designer verify:mcp
```

The launcher registers only this role's closed read-only catalog MCP and pinned Playwright MCP in .runtime/codex-home. It copies no authentication and restores the caller's CODEX_HOME. It does not hot-load the desktop app. Start the existing case preview at http://127.0.0.1:4184 before browser verification. Captures go to D:/JosHsuan_Website/_work/bending-active-thesis/round-02/lighting-designer/browser. Pinned browser tooling is a development dependency only.

[Verification](verification/README.md) distinguishes actual initialization/tool calls/config loading from final visual acceptance. No new renderer package, global CLI, external automation service or website dependency is needed for this role.
