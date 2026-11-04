# HC3DP clear-shell rendering tradeoff

The owner authorizes material and file-format tradeoffs that keep motion active.
This revision changes the HC3DP display material, not its original geometry,
source asset, transformations, or published source identity.

## Evidence

The original `hc3dp-caustics/hero.webp` shows clear layered printed shells with
bright surface reflections, visible openings and translucent overlap. The
`caustic-observation.webp` photograph records a real projected light experiment.
Neither photograph supplies a measured opacity or roughness coefficient.

GitHub Actions run `41718674490`, jobs `126209169192` and `126209169180`, reached
all first five Home midpoint receipts. Both stopped answering browser evaluations
as the sixth source, HC3DP, loaded. Its GLB request completed successfully in 221 ms
and 154 ms respectively; the final evaluation had no completion in either trace.
The failing 40-second receipt deadline is retained. These observations identify
the HC3DP acquisition/first-paint boundary, not a network or test sampling error.

The pinned Three renderer adds an offscreen multisampled transmission target
and, for this double-sided physical material, a separate source backface pass.
This source contains 1,894,748 vertices. Three documents the additional per-pixel
cost of [physical materials](https://threejs.org/docs/pages/MeshPhysicalMaterial.html)
and the [transmission render target](https://threejs.org/docs/pages/WebGLRenderer.html).
The traces do not isolate shader compilation from GPU execution, so this record
does not claim a measured GPU bottleneck or hardware frame rate.

## Display approximation

Retain the MeshPhysicalMaterial clone, reviewed IOR `1.5700000524520874`, original
maps and composed source shader hooks. Retain dielectric metalness 0, roughness
0.12, environment reflections, animated Home lighting and the procedural print
layer normal cue. Use alpha 0.28 as an authored starting value, transparency on,
depth writing off, double-sided shading and `forceSinglePass` on. Set transmission
to zero, removing the screen-space transmission target and backface pass.
The first built visual review exposed excessive white diffuse scattering.
The HC-only shader therefore scales diffuse illumination to 0.08 while retaining
the physical specular contribution. View-dependent alpha varies from 0.14 on
face-on areas to 0.644 at grazing edges; these are authored display coefficients,
not measured material properties. No additional source pass or texture is added.

This is a clear-shell alpha approximation. It does not compute refraction,
background distortion or projected caustics. The factual caustics remain in the
original photography and case narrative. Alpha layering within a single mesh is
an approximation, not sorted volumetric transport. All source geometry remains
available to the original camera, source participation check and interaction ray.
Disposal restores the exact original material assignment.

## Validation boundary

Appearance and Home presenter portable checks pass 26/26, with no skips. The
material check requires transmission zero, one transparent pass, retained IOR,
source geometry/maps/hooks and exact original-material restoration. It does not
substitute these checks for a browser draw or visual review.

The Home browser test now exports bounded, read-only observations to its host
as they occur. A `finally` record preserves the last source receipt and heartbeat
even if a later browser evaluation blocks. The complete seven-source sequence,
actual source paint, authored partial views, independent lens/light changes,
one-renderer bound and 40-second per-source deadline remain required.

The first alpha-only local build completed real source paint in 1.743 seconds
from document initialization with one source call and zero page errors. Its
white diffuse appearance was rejected in visual review. This is local browser
evidence, not a measurement of the Linux CI artifact or a GPU timing claim.
The refined local build completed its real first source paint in 0.941 seconds,
with one source call and no page errors. Context and System screenshots show
the background through the patterned shell and retain pale surface/edge detail,
without the rejected white-solid appearance. This clear-shell approximation is
accepted for the authored display. The 61.7 ms first render observation is CPU
submission only, not GPU execution time. Screenshots and the source receipt are
retained under `pages-test-results/hc-clear-review/`.
The unchanged Home loop passed on local Chromium and mobile Chromium (2/2,
4.4 minutes). Both observed the complete sequence `[0,1,2,3,4,5,6,0]`, one maximum
live canvas, all seven actual source receipts, no resource failures and no page
errors. HC3DP acquisition-to-ready took approximately 5.28 seconds and 5.15
seconds respectively in those loops; both retained its single source pass and
continued lens/light motion through the required midpoint and source return.
The original 40-second per-source receipt deadline was not changed. Host-side
observations and final receipts remain under `pages-test-results/hc-clear-home-loop/`.
This qualifies the local rebuilt runtime. The subsequent [4 November release](../../uiux-designer/cases/bending-active-thesis/CONTINUOUS_MOTION_RELEASE_20261104.md) separately records successful full exact-artifact CI and publication; it does not turn these local timings into hardware performance claims.
