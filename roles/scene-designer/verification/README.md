# Scene Designer verification

Verified on 2026-10-08 using Node 24.19.0 and exact pnpm 11.19.0. The shell default was pnpm 11.25.0, so frozen installations used `pnpm dlx pnpm@11.19.0 --dir roles/scene-designer install --ignore-workspace --frozen-lockfile --ignore-scripts`. No global package-manager setting changed.

| Check | Actual result |
| --- | --- |
| Role installation | Frozen role-only @playwright/mcp 0.0.83 installation passed; root manifest/lockfile unchanged by this role. |
| Original skill | Bundled skill-creator quick_validate.py passed scene-direction. |
| Real CLI/config loading | scripts/verify-config.ps1 prepared the role home and ran installed codex mcp list --json; exactly scene_catalog and scene_browser were enabled. |
| Skill isolation | Exactly one original skill copied with matching SHA-256; no auth.json copied. |
| Closed catalog MCP | Initialize, tool discovery, all seven chapter lookups and full direction contract passed; missing/unknown/path/inherited-key/type/null/array input rejection passed. Explicit toString and constructor extra-key checks cover the declared additionalProperties:false boundary. |
| Browser MCP | Initialize, discover tools, navigate the actual existing Bending-Active page, read accessible snapshot, PageDown, save screenshot on D:, close passed. |
| Global configuration | SHA-256 unchanged before/after: f2afd101645967225dd475d65cd77fa1a49ead1c55fbf0aea1ec3fb43f801cc2. This is the current baseline, not the previous round's hash. |
| Source pins | GitHub API resolved Three/Drei/R3F current research commits and the exact adopted MCP commit; MIT/Apache-2.0 licences checked. |

Machine results are in ignored verification/mcp-results.json and verification/config-loader.json. Screenshot: D:/JosHsuan_Website/_work/bending-active-thesis/round-02/scene-designer/browser/mcp-local-thesis.png.

The first browser test found the existing preview stopped (connection refused). The existing static out/ artifact was then served with its unchanged loopback-only server; both tool tests passed on the retry. This did not build or revise the case.

This milestone proves role/tool operation. It does not prove the proposed lighting, base staging, optics, ASCII influence or damped motion is in the case. The owner's latest request shifted work to categorised commits/push, so no new runtime implementation or final round-02 visual acceptance is claimed.
