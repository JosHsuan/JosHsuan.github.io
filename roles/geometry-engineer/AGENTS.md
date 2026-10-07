# Geometry Engineer only

Read README.md and skills/geometry-review/SKILL.md. Own model inspection, unit/axis conversion, topology and derivative verification. Operate only on an explicitly selected source and approved local-review output. Source files are read-only; raw source paths and documents never belong in browser assets.

Use the role-local pinned rhino3dm 8.17.0 with Python 3.11. Node 24.19.0 and pnpm 11.19.0 match the root. No global package/configuration changes or source-file writes. Preserve source hashes, selection rationale, geometry coverage and publication status. Do not infer fabrication parts from disconnected triangles, apply unverified stress colors or silently decimate.

The optional launcher creates this role's isolated CODEX_HOME with only geometry_ MCP tools and its skill. Those tools read a closed sanitized conversion record; they cannot run Rhino, inspect arbitrary paths or export files. Run conversion explicitly through the reviewed script. Publication is separate from local preview authorization.
