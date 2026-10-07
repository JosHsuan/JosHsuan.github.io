import {readFile,writeFile,copyFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {studies} from '../src/catalog.js';
const root=new URL('../',import.meta.url);
const sources=[
 ['three-physical','Three.js physical material','https://threejs.org/docs/pages/MeshPhysicalMaterial.html','Installed Three 0.186.1: roughness, clearcoat, transmission, IOR, thickness; additional per-pixel cost.'],
 ['three-source','Three.js source','https://github.com/mrdoob/three.js','Installed npm three@0.186.1; source files hashed locally; MIT.'],
 ['three-shadows','Three.js light shadows','https://threejs.org/docs/pages/LightShadow.html','VSM filter radius and blur samples. Filter softness is not emitter size.'],
 ['three-color','Three.js color management source','https://github.com/mrdoob/three.js/blob/dev/src/math/ColorManagement.js','Installed source checked: linear working space, sRGB output; ACES in Fiber.'],
 ['three-shader','Three.js ShaderMaterial','https://threejs.org/docs/pages/ShaderMaterial.html','WebGL custom shader model; lights/shadows are not automatic.'],
 ['three-points','Three.js Points','https://threejs.org/docs/pages/Points.html','Buffer-based particle rendering.'],
 ['three-camera','Three.js PerspectiveCamera','https://threejs.org/docs/pages/PerspectiveCamera.html','Vertical FOV and projection update; orthographic comparison is an original matched framing.'],
 ['polyhaven','Studio Small 09 — Sergej Majboroda','https://polyhaven.com/a/studio_small_09','1K HDR, CC0. Local bytes only; downloaded asset, not website preview renders.'],
 ['polyhaven-license','Poly Haven asset license','https://polyhaven.com/license','CC0 applies to asset bytes, not all website content.'],
 ['rapier','Rapier JavaScript guide','https://rapier.rs/docs/user_guides/javascript/getting_started_js/','World, rigid bodies, colliders; fixed timestep integration.'],
 ['rapier-source','Rapier JS bindings','https://github.com/dimforge/rapier.js','Pinned @dimforge/rapier3d-compat@0.19.3; Apache-2.0; WASM embedded in local JS. No React peer dependency.'],
 ['r3f-performance','Fiber on-demand rendering','https://r3f.docs.pmnd.rs/advanced/scaling-performance','Invalidate only during active work; imperative state and cleanup.'],
 ['theatre','Theatre project/export lifecycle','https://www.theatrejs.com/docs/latest/manual/projects','Actual Studio save-file export, Core replay through existing adapter.'],
 ['pbrt-scattering','Physically Based Rendering, volume scattering','https://pbr-book.org/4ed/Volume_Scattering','Physical reference that distinguishes volumetric scattering from our labeled surface approximation. No code copied.'],
 ['playwright-mcp','Microsoft Playwright MCP','https://github.com/microsoft/playwright-mcp','Pinned 0.0.83; isolated profile, explicit loopback and tool allowlist.'],
];
await writeFile(new URL('catalog/archive-sources.json',root),JSON.stringify({reviewedAt:'2026-10-07',sources:sources.map(([id,title,url,application])=>({id,title,url,application}))},null,2)+'\n');
await writeFile(new URL('catalog/archive-studies.json',root),JSON.stringify({role:'3d-artist',preferenceBasis:'Written brief; actual UIUX Saved not captured',studies:studies.map(s=>({...s,preview:`http://127.0.0.1:4180/bench/index.html?study=${s.id}`}))},null,2)+'\n');
const asset={path:'assets/studio_small_09_1k.hdr',source:'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_09_1k.hdr',sourcePage:'https://polyhaven.com/a/studio_small_09',author:'Sergej Majboroda / Poly Haven',license:'CC0-1.0',notice:'licenses/CC0-1.0.txt',retrievedAt:'2026-10-07',pinnedFile:'studio_small_09_1k.hdr',use:'Shared environment lighting; converted to PMREM at runtime',versionNote:'Provider URL is mutable; the acquired bytes and SHA-256 are the reproducibility pin.'};
const bytes=await readFile(new URL(asset.path,root));asset.sha256=createHash('sha256').update(bytes).digest('hex');asset.bytes=bytes.length;
await writeFile(new URL('catalog/assets.manifest.json',root),JSON.stringify({schemaVersion:1,assets:[asset],originalGeometry:{author:'3D Artist role / original procedural study',recipe:'src/scenes.jsx',provenance:'Generated independently for this local proposal; no professional project claim'},posters:'catalog/previews.manifest.json'},null,2)+'\n');
await copyFile(new URL('../../node_modules/three/LICENSE',root),new URL('licenses/three-MIT.txt',root));
await copyFile(new URL('../../node_modules/@theatre/core/LICENSE',root),new URL('licenses/theatre-core-Apache-2.0.txt',root));
const manifest=JSON.parse(await readFile(new URL('src/motion/theatre/motion.manifest.json',root)));
manifest.role='3d-artist';manifest.projectId='artist3d.inspection.v1';manifest.provenance='Byte-identical reuse of the genuine UIUX spatial score (2026-10-07), source roles/uiux-designer/src/motion/theatre/spatial/motion.state.json. Its four tracks reveal ring spacing while the camera traverses the aperture. This is deliberate score reuse, not a claim of new Studio authoring.';
await writeFile(new URL('src/motion/theatre/motion.manifest.json',root),JSON.stringify(manifest,null,2)+'\n');
const uiux=JSON.parse(await readFile(new URL('../uiux-designer/catalog/materials.json',root)));
await writeFile(new URL('catalog/uiux-id-reference.json',root),JSON.stringify({purpose:'Read-only ID vocabulary, not preferences',source:'roles/uiux-designer/catalog/materials.json',ids:uiux.materials.map(x=>x.id)},null,2)+'\n');
await writeFile(new URL('src/uiux-reference.js',root),'// Read-only catalog vocabulary. These are not owner choices.\nexport const uiuxIds = '+JSON.stringify(uiux.materials.map(x=>x.id))+';\n');
console.log('Catalog: 7 studies; one CC0 HDR; real score provenance retained.');
