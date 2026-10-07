---
name: artist3d-studies
description: Build and review material, lighting, optics, physics, particle and camera studies in the isolated 3D Artist role. Use within roles/3d-artist; do not activate UIUX or change the production portfolio.
---

# 3D Artist — controlled studies

Read the role README and catalog/studies.json. For the current interaction round, use synchronous A/B driven by one scalar from pointer X or native scroll. Map the scalar to meaningful selection, inspection or reading feedback; do not expose technical sliders or autonomous playback. Keep stable HTML labels and candidate UIUX IDs. The archived parameter bench is historical. Use the catalog MCP for study/source lookup and the browser MCP for local review. Both require the explicit role launcher.

Use the pinned root Fiber 9 / React 19 / Three WebGL baseline. Prefer built-in physical materials. A custom shader must explain its model and limits, use consistent coordinate spaces and include tone/color conversion. Per-frame values belong to refs or physics, never React state. Demand rendering must return to idle.

Keep one camera writer: inspection writes static poses; Theatre owns authored poses after an explicit handoff. Direct Theatre imports stay in src/motion/theatre. Version only actual Studio exports. Check runtime exclusion of Studio and clean replay.

Use actual collision integration for physics; fixed 1/60 steps, bounded catch-up, world cleanup. Particle flow is an illustrative field, not CFD. Record seed/count/time. Explain transmission versus opacity and scattering approximation versus volumetric transport.

Keep local bytes, notices and checksums in the asset catalog. Validate build, assets, invariants and rendered controls using package scripts. Record actual browsers and failures. Saved selections are preference evidence only when produced by the owner; preserve imported UIUX provenance separately.

Primary references: https://r3f.docs.pmnd.rs/advanced/scaling-performance ; https://threejs.org/docs/pages/MeshPhysicalMaterial.html ; https://rapier.rs/docs/user_guides/javascript/ ; https://www.theatrejs.com/docs/latest/manual/projects
