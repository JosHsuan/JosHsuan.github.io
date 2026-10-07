# Continuous metal appearance for the local thesis case

8 October 2026. The owner authorized a coordinated local Bending-Active Thesis page. This explicitly scoped integration extends the role's earlier isolated proposals; it does not expand public-use permissions or apply bamboo imagery to the actual metal model.

The [cinematic material adapter](../../uiux-designer/cases/bending-active-thesis/components/materials/cinematic-material.js) translates the existing height-contour and focus studies into one continuous appearance. Satin silver is the baseline. Chapter emphasis introduces restrained normalized-height contours and a broad world-X attention band. At zero emphasis the material has no analytical overlay. Neither effect represents stress, curvature measurements, an identified panel, or a physical material calibration. The real mesh and its normals remain unchanged.

## API and ownership

`createCinematicMaterial({bounds})` returns `material`, `update({progress, emphasis})`, `inspect()` and `dispose()`. Bounds must match the world coordinate system after model normalization. Both inputs are clamped to 0–1; omitted or non-finite inputs retain the preceding value. The scene supplies chapter progress and emphasis and owns invalidation. Pointer tilt is decorative and must not change either value. Reduced motion can use zero emphasis and a fixed pose.

The adapter has no clock, camera writes, geometry changes, loading, React state or additional textures. Stable uniforms update without recompilation. One idempotent disposal releases the owned material; the scene retains ownership of its mesh, loader assets and environment. Do not clone this material expecting callbacks to survive automatically.

The patch retains standard normal, lighting, shadow, fog, tone-mapping and color-space chunks. Its world-coordinate varying follows the installed transformed-position path, including batching/instancing conditionals. Only the actual static thesis mesh is covered by the case's rendering evidence; general animated/instanced-model support is not independently verified. Derivative-based line antialiasing fades contours when they cannot be resolved.

## Sources and implementation decision

The [existing texture/shader research](TEXTURE_SHADER_PLAN.md) records the primary GitHub noise source and public texture studies. This integration needs no copied noise or image texture: the imported geometry already supplies the meaningful surface structure.

The [Three.js Material documentation](https://threejs.org/docs/pages/Material.html) describes the WebGL material extension and program-cache hooks; [MeshStandardMaterial](https://threejs.org/docs/pages/MeshStandardMaterial.html) provides the retained lighting model. The official [meshphysical shader on GitHub](https://github.com/mrdoob/three.js/blob/dev/src/renderers/shaders/ShaderLib/meshphysical.glsl.js) was reviewed as primary upstream context. The moving `dev` branch is not the implementation pin. The installed **Three 0.186.1**, supplied by the repository lockfile, is authoritative:

| Installed source | SHA-256 |
|---|---|
| `src/renderers/shaders/ShaderLib/meshphysical.glsl.js` | `7dea93f1118b77d8d04f3b49797dc25dda49e37edf2c2a61b286c2a6297edc9c` |
| `src/renderers/shaders/ShaderChunk/worldpos_vertex.glsl.js` | `d291ca05988f57312c060b33fa271472b3756b6a6b737934f5a04f882bf4f17f` |

The adapter deliberately keeps the verified WebGL path. It is not a WebGPU/TSL material. No dependency, role MCP registration or global configuration change is required.

## Verification boundary

Adapter checks passed on 8 October 2026 using the installed `ShaderLib.standard`: required normal and lighting chunks remain, the uniform containers and program-cache key stay stable while scrubbing, out-of-range inputs clamp, non-finite inputs preserve the preceding state, bounds are copied, invalid bounds fail, and disposal fires exactly once. These checks do not compile GLSL on a GPU.

The adapter is handed to the integrated scene for real shader compilation and visual inspection on the actual assembly. Source inspection alone is not a render pass. Current case verification must capture baseline and emphasized states with the real lighting, overlay and cameras; it must also confirm geometry preservation, stable program count while scrubbing, reverse scrubbing and reduced-motion behavior. Working captures and reports belong under `D:\JosHsuan_Website\_work\bending-active-thesis\cinematic-integration`, with explicit review handoff only where needed.

The integrated case subsequently passed its 24 browser groups in Chromium, WebKit and mobile emulation on 8 October 2026. The actual GLB renders baseline and emphasized states without shader/compiler console errors; returning to the same chapter restores the captured pixels. Repeated traversal keeps one shader program, one geometry and two renderer-reported textures. Pointer movement does not change material emphasis, and live reduced motion resets emphasis to zero. The model hash, 84,626 vertices and 131,881 triangles remain unchanged. These are actual local WebGL checks, not a physical-device performance or material-calibration claim.
