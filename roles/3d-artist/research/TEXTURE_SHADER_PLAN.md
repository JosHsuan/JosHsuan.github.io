# Texture and shader studies — 3D Artist

The four additions retain the existing one-input desk and its eight studies. They answer four different questions at the same A/B camera and progress: what direction a strip reads, what PBR data changes, how neighbouring heights relate, and where attention is directed. All geometry here is an original study fixture, not project geometry.

| Study | Visual question | Representation | Boundary |
|---|---|---|---|
| Direction belongs to the strip | Does a subtle grain make length legible? | MIT simplex noise in checked strip UV coordinates | Appearance proposal, not measured fibre or material scan |
| A texture is more than colour | How does surface data respond to grazing light? | Public CC0 Bamboo Wall: colour vs colour/normal/roughness | Independent reference swatch, not a texture applied to owner geometry |
| Read the section without cutting | Which neighbouring points are at the same height? | World-space contour lines and moving height band | No cutting, deformation, engineering units or stress field |
| Attention travels across the surface | Which region is being discussed? | World-X Gaussian band and antialiased hatch | A region, not automatically an identified component |

## Public sources and decisions

- [Poly Haven Bamboo Wall](https://polyhaven.com/a/bamboo_wall), Amal Kumar, CC0: three original 1K JPG files, 1,883,768 bytes total. Full culm-wall photographs are shown only on the independent reference swatch. The repeated wall pattern is unsuitable for wrapping one thin member. Source width is 2 m; no physical scale is assigned to the visual study. The maps are byte-identical to upstream MD5 and recorded local SHA-256. No website preview render was copied.
- [stegu/webgl-noise](https://github.com/stegu/webgl-noise/tree/22434e04d7753f7e949e8d724ab3da2864c17a0f), MIT: only `src/noise2D.glsl` and licence retained, plus a byte-preserving JavaScript string wrapper. The original coordinate mapping and material logic were created here. This is a small WebGL-compatible source inclusion, not a package/runtime upgrade.
- [Three material extension](https://threejs.org/docs/pages/Material.html), [standard material](https://threejs.org/docs/pages/MeshStandardMaterial.html), [colour management](https://threejs.org/manual/en/color-management.html): retain the installed WebGL runtime and standard PBR lights. `onBeforeCompile` uses inspected installed chunks and a stable program-cache key. Colour maps use sRGB; normal and roughness are data. The existing HDR environment, exposure and compositor are unchanged.

WebGPU/TSL was considered but is not appropriate for this repository's verified WebGL baseline. General wood scans were rejected as evidence for another material. Additional remote asset-search MCPs would expand credentials/network surface without helping the fixed local study; the already-pinned browser MCP plus the read-only recipe catalog covers this task.

## Material adapter

`src/materials/inspection-material.js` exports `createInspectionMaterial({mode, color, bounds, grainAmount, metalness, roughness})`. The return value has `material`, `update({progress, mode})`, `inspect()` and `dispose()`. Modes are `material`, `grain`, `contours`, `focus`. Bounds must use the same world coordinate system as the rendered geometry. A later scene integration should compute them after model normalization. Explicit metalness/roughness options allow a metal presentation without changing the shader or implying a measured finish. Uniform changes do not request material recompilation, mutate geometry, write cameras or advance time. The caller owns `invalidate()` and disposal.

Grain requires meaningful UVs with UV X along the member. Contours and attention use rendered world coordinates and therefore work without UVs on ordinary static meshes. Instanced, skinned and morph-deformed geometry are not covered by the original-position world-coordinate binding; adapt and independently verify those before use. No clipping, alpha ghosting or shadow deformation is introduced. The shader reads a normalized box, not fabrication or structural data.

```js
const finish = createInspectionMaterial({
  mode: 'contours',
  bounds: {min: [-2, -1, -1], max: [2, 1, 1]},
});
mesh.material = finish.material;
finish.update({progress: input.u, mode: 'contours'});
invalidate();
// On teardown: finish.dispose(); restore/release the previous material separately.
```

## UIUX / cinematography discussion

Role discussion recommended a stationary reading plane, anchors and captions; a shared progress value; restrained grazing illumination; and representation switches that hold camera/progress fixed. Material is useful for continuous form, contours for level relationships, and focus for attention. A camera or documentary detail must use inspected geometry rather than invented construction motion. Mist should not obscure joints. These are design proposals; the owner's Saved UIUX choices remain unknown until a real export is imported.

The study desk retains pointer X or native scroll as mutually exclusive continuous input. Keyboard/touch are equivalent controls. There is no autonomous animation or extra material slider. Each study has its own deep link and actual A/B captures at 30% and 70%; the same evidence remains visible without WebGL or JavaScript.

## Isolated tools

The original skill `artist3d-texture-shader` is copied by the opt-in role launcher only to the role runtime home. `artist3d_catalog` now adds `artist3d_get_material_recipe`: an optional bounded recipe ID returns the local workflow or the full four-recipe list. It is read-only and cannot read arbitrary files, execute code or fetch URLs. The registered browser remains pinned `@playwright/mcp@0.0.83`, with loopback origin, isolated profile and role output directory. No global MCP, package, credentials or other role config changes are required.

## Verification

Build, browser/visual, capture, material-unit, asset-hash and actual MCP results are recorded under `verification/`. These are prototype checks, not calibrated material measurements or field performance. Chromium/WebKit and mobile emulation are the local targets; physical devices and Firefox remain explicitly unverified.
