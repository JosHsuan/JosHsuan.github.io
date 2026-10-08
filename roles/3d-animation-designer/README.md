# 3D Animation Designer

The role owns topology-aware preparation and animation of actual source elements. Geometry Engineer owns source inspection and conversion fidelity; this role decides which verified elements may move, separate, reveal or rejoin. Lighting and Scene Designer consume the same coordinate system.

- [Role contract](research/ELEMENT_CONTRACT.md)
- [Primary research](research/SOURCES.md)
- [Scoped skill](skills/source-animation/SKILL.md)
- [Tool inventory](toolkit.json)
- [Verification](verification/README.md)

Prepare this isolated role with `./roles/3d-animation-designer/codex-role.ps1 -PrepareOnly`; launch with the same command without the switch. The launcher creates a dedicated ignored role home, copies only this role's skills, and restores the previous CODEX_HOME afterward. No authentication is copied. The prepared home is a CLI profile, not an assertion that desktop tools hot-load.

Run `node roles/3d-animation-designer/scripts/verify-mcp.mjs` for actual closed-catalog MCP checks. This role deliberately has no remote Blender MCP or shell-execution bridge: source preparation remains a reviewed local operation, and the MCP reads only the closed element contract.
