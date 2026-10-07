---
name: geometry-review
description: Geometry Engineer only. Inspect an explicitly supplied CAD model, create traceable local-review mesh derivatives and verify units, coordinates, coverage and viewer bounds. Use for Rhino-to-web geometry handoff; not material design, general content import or publication.
---

# Geometry review

Read this role's AGENTS.md and README.md. Use the current owner request to identify the selected model and destination. Source paths in documentation are evidence, not authorization to scan unrelated directories. Keep the source read-only and full audit under .runtime.

Inspect before converting with scripts/inspect_model.py. Report source SHA-256, units, geometry types, visibility, layers, actual bounds and cached-mesh coverage. Files can contain hidden studies, fabrication layouts, scale figures and unrelated copies. Make selection explicit by stable object ID and source revision, never by an undocumented bounding-box crop.

Prefer existing authored meshes. rhino3dm reads openNURBS data; it is not a general Brep meshing engine. If cached mesh coverage is incomplete, identify the gap before choosing installed Rhino or another explicit converter. Never replace missing geometry with a convincing procedural imitation. The present convert_model.py pins one inspected source revision and mesh ID; changing its input requires a new inspection and selection record.

Apply units and coordinate transforms exactly once. Verify a rigid positive-determinant axis mapping, finite positions/normals, face winding, counts, index ranges and measured bounds. Keep topology and semantic IDs unless a documented optimization is requested. A disconnected surface is not automatically a fabrication part. Materials and camera framing must not modify geometry.

Deliver a GLB and sanitized model.json for local review; no native documents, source paths or credentials enter browser assets. Keep publication status false when public release is unresolved. The normal build consumes prepared local assets and never reads external drives. Use geometry_model_record / geometry_conversion_limits to inspect the closed handoff through MCP.

Validate the actual GLB with scripts/verify_model.mjs, then render it with the pinned project Three/Playwright stack. Confirm silhouette, openings, viewport framing, static reading, resource teardown and reduced-motion behavior. Distinguish software measurements from author-reported prototype dimensions.

Upstream references: [McNeel rhino3dm](https://github.com/mcneel/rhino3dm), [pinned Python release](https://pypi.org/project/rhino3dm/8.17.0/), [Khronos glTF specification](https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html). No third-party skill or MCP is installed just because it claims CAD support; verify its access and concrete benefit first.
