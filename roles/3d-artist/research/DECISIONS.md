# 3D Artist research and implementation decisions

Recorded 7 October 2026. The role brief authorizes local prototypes while the portfolio remains empty. The working tree already contained UIUX work; its files and all tracked baseline files are fingerprinted in verification/boundary-before.sha256.

## Visual questions and adopted techniques

The contact sheet compares actual renders, with one live stage and direct study URLs. The repeated aperture is original geometry: seventeen profiled toroidal ribs, four rods and one accent ring. It is a material/assembly specimen, not a professional project or a fabrication claim. System typography, graphite, paper-colored surfaces and orange controls interpret the supplied cinematic engineering editorial brief. No reference-site imagery or layout was copied.

| Study | Technique chosen | Reason and adoption boundary |
|---|---|---|
| Materials | Existing Three MeshPhysicalMaterial | Compare metallic, dielectric and coated responses under the same HDR and camera; no new material package. These are adjustable approximations, not scanned assets. |
| Light & shadow | Directional key/fill/rim; 1024 px VSM | Shadow filtering is visibly adjustable. It is not area-light transport or GI. Exposure remains fixed in the A/B presets. |
| Refraction | Physical transmission, opacity 1 | A striped opaque target shows actual distortion. Raster transmission has screen-space limitations and no solved caustics. |
| Diffusion & scattering | Original Lambert/wrapped/backlight GLSL | Distinguish diffuse reflection from a low-cost surface translucency approximation. No volumetric or subsurface simulation claim. |
| Physics | Rapier 0.19.3, isolated direct API | Rigid-body collision is a genuine new requirement. WASM is self-contained; fixed steps and cleanup are tested. Reassess supported upstream versions before production adoption. |
| Particles | Seeded analytic flow + short history trails | A/B distinguishes axial drift from circulation; count/seed/response controls operate on actual vertices. This is not CFD. |
| Camera | Perspective/orthographic + Theatre adapter | Inspection controls stop/release the score; explicit Play owns the camera exclusively. Existing genuine Studio data is reused because its orbit and assembly parameter suit the rib study. |

Primary sources are linked with their implemented use in [sources.json](../catalog/sources.json). Documentation is referenced, not republished. Installed package source and local rendering are used to resolve version differences. No Blender/DCC server was added because the current procedural geometry and rendered studies do not need one. No postprocessing or React physics wrapper was added.

## Materials and provenance

One externally acquired visual asset is used: Studio Small 09 by Sergej Majboroda / Poly Haven, 1K HDR, CC0. The source URL is mutable, so the acquired file and its SHA-256 are the content pin. The original CC0 legal text is retained. All study posters are generated locally and each records actual camera/parameter/time metadata. Physics and particle posters both use exactly ninety manual 1/60-second steps. The package lockfile pins Rapier and browser tooling, including integrity hashes.

Theatre motion.state.json is a byte-identical copy of the genuine UIUX spatial score whose original manifest records Studio transaction/export provenance. The 3D manifest credits that source. No new keyframes or fake Studio export were created. This delivery demonstrates clean Core replay and ownership, not a new authoring session. A future edit should open local Studio separately, sequence real properties and export through Studio before replacing the state.

## Preferences

The owner said Saved is authoritative. The original browser connector failed again during this session, so the actual UIUX IDs remain unknown. A role-specific import accepts the existing export format, hashes the supplied file and preserves source origin/key/export time and historical IDs. File import is evidence supplied through that UI, not independent verification of who created it. Automated fixtures are explicitly synthetic.

New 3D Saved records include the selected variant, actual parameters, save time and notes. Frozen comparisons additionally include a rendered image and the current camera/simulation state. These do not approve production adoption or publication. The static poster remains its recorded preset until a live stage is opened.

## Scope and resource ownership

All new files stay in this role. The opt-in launcher renders a separate home and copies only role skills; it does not copy credentials. Two MCP servers are protocol-tested. The desktop chat has not hot-loaded them. UIUX ports 4175/4176 are preserved; this role uses 4180 after checking availability.

Canvas uses demand rendering, explicit Play, pause on document hiding/offscreen, bounded DPR and disposal on close/navigation. Physics owns body transforms; the particle buffer owns particle positions; either manual inspection or the Theatre adapter owns the camera. React state stores controls, not frame values. Context loss returns to the poster and permits a deliberate retry.

These are local prototypes. Production minification, physical-device budgets, field performance, screen-reader conformance and calibrated material/physics behavior are separate validation questions. Root publishing remains manual and was not invoked.
