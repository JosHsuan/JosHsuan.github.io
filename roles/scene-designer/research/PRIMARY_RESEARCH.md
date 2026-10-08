# Primary research and adopted tooling

Reviewed 2026-10-08 (Europe/Berlin). These are engineering constraints and original adaptation decisions, not proof that the new case treatment has been implemented. GitHub API resolved the exact commits below and their repository licences. Browser tooling was actually installed and exercised; rendering references were not installed as new dependencies.

| Primary source | Verified revision / licence | Decision |
| --- | --- | --- |
| [Three.js](https://github.com/mrdoob/three.js/tree/5f0b8eef9b4667eeb3b8853fa2020f836fefc917) | 5f0b8eef9b4667eeb3b8853fa2020f836fefc917 / MIT | Use the existing pinned renderer's lights/materials; current upstream research does not upgrade three 0.186.1. |
| [Drei](https://github.com/pmndrs/drei/tree/bf6f4addf47467d3885de272d94ca5127f6ef68f) | bf6f4addf47467d3885de272d94ca5127f6ef68f / MIT | Review staging helpers selectively; root Drei 10.7.9 stays unchanged. |
| [React Three Fiber](https://github.com/pmndrs/react-three-fiber/tree/d604b18bbda025d9ca682efb322cc76b99350e52) | d604b18bbda025d9ca682efb322cc76b99350e52 / MIT | Demand rendering and explicit invalidation inform the shared settling clock. |
| [Playwright MCP](https://github.com/microsoft/playwright-mcp/tree/f183dad4a52965583e3cc1d59b88cdc279e2e57d) | f183dad4a52965583e3cc1d59b88cdc279e2e57d / Apache-2.0 | Adopted @playwright/mcp 0.0.83 in this role only; installed package retains its licence. |

[RectAreaLight](https://threejs.org/docs/pages/RectAreaLight.html) gives a broad rectangular PBR light but does not cast shadows and needs the renderer-specific light library initialization. It is useful for a future reflected strip highlight, not a drop-in source of contact shadows. The initial role catalog uses existing directional key/rim plus hemispheric fill to avoid adding an unverified lighting path.

[SpotLight](https://threejs.org/docs/pages/SpotLight.html) can cast a shadow, uses a scene target, and retains inverse-square decay by default. A narrow grazing rig can be considered if it materially improves the actual metal view; no spotlight or new shadow allocation is assumed merely because the role exists.

[Drei Stage](https://drei.docs.pmnd.rs/staging/stage) bundles lighting, centering, shadows and camera fitting. Automatic centering/fitting would compete with the single cinematic camera and disrupt the common source transform. Reuse its staging ideas with explicit ownership; do not mount its default camera behavior around the thesis.

[Drei Environment](https://drei.docs.pmnd.rs/staging/environment) can set the lighting environment separately from the background. Its convenience presets depend on remote hosting. Retain the existing licensed local HDR or an explicitly generated local environment; do not introduce a CDN dependency or a second environment writer.

[ContactShadows](https://drei.docs.pmnd.rs/staging/contact-shadows) is comparatively expensive and supports limiting render frames. Static capture works only while its contributing geometry stays static; an editorial part separation invalidates that assumption. Prefer the current bounded shadow path first, then measure any contact-pass benefit.

[PMREMGenerator](https://threejs.org/docs/pages/PMREMGenerator.html) filters environment radiance for roughness-dependent reflection. It is presentation lighting, not measured thesis material calibration. Do not generate or dispose its render target every frame.

[Demand rendering](https://r3f.docs.pmnd.rs/advanced/scaling-performance) requires explicit invalidation when imperative values change. The shared motion response must stop invalidating after values settle and resume on real input; no perpetual lighting/scene ticker is justified.

## Tool and skill decisions

The original scene-direction skill routes actual project decisions into the role catalog and shared layer contract. The custom MCP serves only reviewed records; it is not a renderer or arbitrary file accessor. Pinned Playwright MCP provides real screenshots and native interaction against the existing loopback page. The role's installed CLI/config and both MCP servers were exercised.

No separate Blender MCP, remote 3D generation service, automatic scene generator, global CLI or additional renderer package was adopted. The verified source geometry is handled by Geometry Engineer; introducing another source-processing authority would complicate provenance without solving this role's immediate lighting/staging responsibility. These are scoped choices, not claims that the rejected tools lack capability.

No Three/Drei/R3F source, reference-site media or external skill content was copied. The upstream code licences remain recorded so future copying can preserve the appropriate notices.
