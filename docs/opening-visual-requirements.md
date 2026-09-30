# Opening study 03 — The chamber / inscription

**Superseded:** the owner subsequently rejected this 3D background and requested
one feature at a time. Keep this document as history. The approved UI and glass
remain. The later particle feature has also been removed entirely. The active
baseline is the [reversible glass workspace](workspace-interaction.md).

Updated September 28, 2026. The owner's Arrival reference supersedes the earlier particle rectangle, glass loop, metal strokes, tumbling assembly and glossy sculpture. Keep the established scroll and terminal contract. Film stills guide atmosphere and composition; they are not embedded website assets.

## Concept and staging

A visitor is already inside a dark, textured chamber. A wide, low luminous opening reveals suspended mist. A back-facing Thinker occupies the foreground at right; the terminal floats independently at left. The fog is the visual light source. A broken circular inscription and two loose strokes appear quickly, curl into smoky filaments, then disperse. Their disappearance makes room for reading.

All visible subject geometry is rendered as points: ink, suspended mist and the Thinker silhouette. The chamber is a procedural screen-space light field, not a scanned room or a ray-traced volume. The ink has actual three-dimensional particle positions and feedback simulation. There are no glass/metal loops, slabs or shards in this version. No movie image or external HDR photograph is used at runtime.

| Scroll interval | Direction |
| --- | --- |
| 0–6% | Empty luminous fog; dark, back-facing silhouette. The terminal is immediately usable. |
| 6–36% | Fast particle emission writes a broken ring and two independent curved strokes. Each particle has its own emission instant and life. |
| 36–84% | Emission ends; curl advection relaxes, sprites broaden, density fades and strokes fragment into mist. |
| 85–100% | Ink is gone. The terminal expands and reflows to a reading surface; background light remains quiet. |

These intervals are reviewable parameters. No automatic movie timer was introduced: the prior wheel timeline remains authoritative, including reverse scrubbing before completion and a latched reading state afterward. The current interpretation of “fast movement, then dissipating frames” is rapid writing followed by progressively thinning particles, not a reduction in display frame rate.

## Skills and rendering decisions

| Guidance | Application |
| --- | --- |
| [cinematic-director](https://github.com/wuwangzhang1216/DirectorSKILL/blob/main/SKILL.md), previously researched | Motivated backlight, foreground/middle/background separation, stable orientation, negative space and an unbroken visual axis. Story beats are adapted to interactive progress instead of a timed shot. |
| `r3f-animation` | Fixed simulation steps, deterministic seeds, checkpointed reverse seeks, bounded catch-up and no idle timeline advancement. |
| `r3f-shaders` | Native GLSL with actual material-reference uniform updates, explicit normal-based edge light, soft particle kernels, owned simulation textures and a single final output conversion. |
| `r3f-fundamentals` | Independent DOM interface, lazy Canvas, demand rendering, error boundary, explicit ownership and disposal. |
| [Apple: Meet Liquid Glass](https://developer.apple.com/videos/play/wwdc2025/219/) | Interpret lensing, layered scattering, edge highlights and optical separation while protecting content legibility. This is a web shader/CSS interpretation, not Apple's native Liquid Glass API. |

The terminal's scene-only optical pass bends the image near its rounded boundary, spreads background light and increases body density during expansion. CSS adds a soft rim, backdrop blur and a separate navigation layer. HTML text is never refracted or scaled. The scene has no bright chrome reflections; the Thinker's sampled surface has an almost-black diffuse value and a narrow restrained silhouette light.

## The Spirit adaptation

Actual derivative simplex/curl GLSL is vendored from [Edan Kwan's The Spirit](https://github.com/edankwan/The-Spirit), pinned to `c2ed239be0d7ed4ba28acf42dae42de994d37b8a`, MIT. The [live demonstration](https://edankwan.com/experiments/the-spirit/) and [position shader](https://github.com/edankwan/The-Spirit/blob/c2ed239be0d7ed4ba28acf42dae42de994d37b8a/src/glsl/position.frag) informed the flow.

This iteration uses GPU feedback positions, emitter attraction, derivative curl and finite life. It changes continuous respawning into finite stroke emission and dark, soft particles. Fixed integration steps and cached position textures make the original feedback approach compatible with reverse scrolling. This is a source-based adaptation, not a copy of the original entire demo, fluid solver, or motion-blur pipeline.

## Assets and light

- The retained [Scan the World / Jonathan Beck Thinker scan](https://commons.wikimedia.org/wiki/File:Scan_the_World_-_The_Thinker_(Auguste_Rodin).stl) is CC BY-SA 4.0. Its simplified, Laplacian-smoothed GLB is sampled by surface area into points, turned away from the camera, and shaded as a silhouette. The underlying mesh remains downloadable with attribution and its share-alike license.
- `Chamber.tsx` creates the rough chamber, aperture illumination and layered particle mist procedurally. Soft sprites provide depth-dependent haze; this is an artistic atmospheric approximation, not physically integrated volumetric scattering.
- The installed Three.js `GPUComputationRenderer` supplies ping-pong storage, `MeshSurfaceSampler` supplies area-weighted point sampling, and EffectComposer / UnrealBloomPass / OutputPass supply HDR rendering and output. Sources and MIT notices remain linked in `public/credits.html`.
- The Apple glass reference is used as design guidance. No Apple code, branded UI assets or native framework is bundled.

Review actual output and validation in [Opening implementation](opening-implementation.md). Final aesthetic approval remains with the owner; this implementation establishes a local, adjustable interpretation of the new brief.
