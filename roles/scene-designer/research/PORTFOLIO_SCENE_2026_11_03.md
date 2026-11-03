# Portfolio source and scene direction — 3 November 2026

The owner's current request authorizes showing the actual Mode/s machine and
Caschlatsch structure, and reassessing every model against Bending-Active's
material, lighting, camera, staging and continuous-transition standard. This
supersedes the earlier no-model Caschlatsch presentation within this scope.
Original source files remain read-only. The reusable framework stays empty.

The scene and cinematography roles discussed scale, camera height, lens
progression and source-base contact directly. Scene direction supplies actual
geometry support and a setting; the existing camera adapter remains the only
camera writer. No additional animation clock is required.

## Source-backed geometry handoff

The [sanitized geometry record](../../geometry-engineer/verification/portfolio-models-2026-11-03.json)
contains the exact source/derivative SHA-256, metadata, selection coverage and
four standalone desktop/mobile render receipts. Full original paths and object
selection lists remain in the Geometry Engineer's ignored local audit folder.

| Source assembly | Web extent X / Y / Z, metres | Vertices / triangles | Public GLB |
| --- | --- | --- | --- |
| Entrance, existing scheme | 4.732 / 7.850 / 4.729 | 897,015 / 997,599 | Existing 18,828,876 bytes, unchanged |
| Mode/s, original assembled machine | 0.504 / 0.261 / 0.500 | 503,822 / 737,282 | 10,276,504 bytes |
| Caschlatsch, original full-size structure | 4.233 / 7.786 / 4.222 | 61,362 / 31,152 | 1,082,556 bytes |

The Mode/s source `make2D用.3dm` contains a clean assembled machine matching the
existing portfolio machine-system figure. All 1,500 Breps and 15 extrusions
participate; standalone drafting curves are excluded. The larger
`機構檔案_3.3dm` contains library definitions, duplicate placements and other
working geometry, so it is not used as a blanket merged assembly. The prior
rotary-cut unit GLB remains a separate source; the machine does not replace it.

Caschlatsch uses the finalized `just structure.3dm`: all 2,433 Breps and their
15,085 stored render-mesh faces, excluding five reference points. It includes
the source timber arrangement; it does not include or invent the terrain.
Three cached faces have no vertices, exactly as stored in the original.

Both derivatives preserve positions, normals, UVs and face order, with one
documented translation, mm-to-m conversion and positive-determinant Z-up to
Y-up rotation. No decimation, smoothing, quantization or procedural part
replacement occurs. The compressed position, normal, UV and index buffers were
decoded through the actual Three decoder and compared byte for byte. Original
hashes were checked before and after export. Float32 position rounding is at
most 1.479e-8 m for the machine and 2.366e-7 m for Caschlatsch.

Use actual stored-mesh support for framing. The Caschlatsch Brep bounding boxes
include underlying untrimmed surface extents far outside the visible timber;
those boxes would falsely inflate the model height. The checked decoded vertex
bounds in the handoff are the correct camera support.

## Scale and scene agreement

Entrance's old positive camera pitch placed the eye roughly 7–11 m above the
world origin, making the installation resemble a small table model. The agreed
opening yaw .58, pitch -.14, vertical FOV 42° and complete-source fit 1.06 place
the eye about 1.62 m above the lowest source base. Progress through yaw .82 /
pitch -.09 / FOV 36° / fit 1.04, then yaw 1.08 / pitch -.035 / FOV 32° / fit
1.05. This reveals the installation's vertical scale while retaining its entire
source and smooth joins. Architectural pitch receives its own lower bound;
do not loosen every product-model camera merely to support this case.

Caschlatsch is similarly architectural, but its open lattice needs a restrained
three-quarter view and light separation through its depth. Its true 7.786 m
CAD height supports a low-eye opening and gradual rising sweep. Warm matte
timber and a cool rim distinguish overlap without invented woodgrain, stress
colouring, terrain or people. The existing portfolio photographs continue to
establish the real setting and built outcome.

The Mode/s machine is a half-metre instrument. A moderate elevated product
three-quarter opening shows carriage, rails and the central work area. Use a
separate neutral instrument appearance profile; the existing foam/unit study
must retain its separate material identity. Explain actual machine development
through its original geometry and recordings, without animating invented
kinematics or identifying every hardware vendor from appearance.

Ground/contact is an editorial scene surface, not a source object or an
assertion about a real installation floor. Place it just below the verified
minimum source height, preserve the original base and footing silhouettes, and
use restrained opacity. A single baked environment and cached source contact
shadow give depth economically; camera movement does not require regenerating
the shadow. Broad key/fill/rim lights should reveal form without masking native
HTML or competing with the shared background lease.

## Evidence and remaining acceptance

Python 3.11.4 / rhino3dm 8.17.0 exported both models. Node 24.19.0,
meshoptimizer 1.1.1 and Three 0.186.1 performed exact compression/decode checks.
Chromium loaded and rendered each compressed GLB at 1440×900 and 390×844,
with one complete source draw, finite bounds and no page errors/context loss.
The four retained screenshots were visually reviewed for silhouette, original
assembly arrangement and full-source framing, using the existing camera-fit
helper. The machine matches the existing machine-system drawing; the timber
structure matches the project family represented by the portfolio material.

These standalone previews use a neutral review rig. They do not establish the
production scene material quality, final route choreography, actual touch
interaction, hardware frame rate, CI approval or publication. The parent
integration must still add exact public pins and provenance, route-stage
ownership and source/poster selection, then test the built artifact and verify
the deployed bytes.

## Subsequent integration handoff

The parent subsequently delegated reviewed public metadata integration. Mode/s
now has a `mechanism` chapter between `system` and `making`, with the exact
previously published machine-system drawing and source-backed explanatory copy.
Its new `additionalModels` entry owns that chapter only. The original unit
model still owns `context` through `system`; the following original machine
simulation retains `making`. This avoids displacing the simulation or assigning
two model sources to one chapter.

Caschlatsch's primary model owns `context` through `system`, with the existing
selected timber-model image as poster. XR and fabrication imagery remain their
own evidence. The agreed architectural camera keys and separate product-machine
keys are recorded in the public metadata.

The release manifest adds the two exact model pins. Image provenance restores
the unchanged machine-system figure record from its original source-backed
release. Model provenance records contain source basenames and hashes, without
private paths. Source-record revision hashes remain for the parent to update
after all coordinated edits are final.

The schema now validates every primary and additional model, disjoint chapter
ownership, exact selected provenance and the distinct architectural pitch
range. Thirty-three focused contract checks pass, including exact new GLB
hash/count checks and rejection of overlapping, cross-project or unpinned
models. Runtime stage selection, build/audit iteration over additional models,
full built-artifact checks and publication remain parent-owned integration work.

## Current scope verification

After the authored cameras and source additions were integrated, 65 focused
project, camera, model, narrative and native-source CI assertions passed under
Node 24.19.0. The old per-route historical renderer-text reversal checks were
replaced with functional source-role and negative-input assertions. This change
does not rebaseline original source material: an independent fixture extracted
from published commit `1ca10e7aeb823d6fa21cf1378cf9270ffcf8990b` pins all 137
original public assets, and their current files are checked byte for byte.
Existing case-prose snapshots exclude only the separately tested new Mode/s
machine section/model, Caschlatsch model and authored camera paths.

The architectural camera check uses the actual desktop/mobile study aperture,
not the full browser rectangle, and verifies the opening eye remains between
1.5 and 1.9 metres above each actual source base. Caschlatsch's native source
selector also rejects missing selected sources, unreviewed chapters, incorrect
model intervals and an unexpected movie instead of silently returning an
undefined scene. These are source and runtime-contract checks; they do not
replace final built-artifact browser acceptance or same-artifact publication.

## Initial built-artifact browser observations

The first Chromium pass against the Pages export painted and visually reviewed
both added originals in their production scenes. Mode/s passed exact source,
first-draw, geometry, source-exchange and maximum-one-live-canvas assertions
through unit Context/System, machine Mechanism, the following film interval,
and reverse unit System. Its seven-stop scenario reached the total case budget
before the final Context click, so that run is not recorded as a passing test.
The machine scroll-camera scenario also exhausted its total orchestration
budget after its first two authored readings. Individual source readiness and
geometry assertions did not fail. Redundant screenshots were removed; a
serial rerun is required before browser acceptance.

Caschlatsch's desktop Chromium scroll-camera scenario passed, including native
forward/reverse progress, source identity, independent compositor motion,
continuous rendering after a reduced-motion preference change and one retained
source. The sampled opening eye was 1.716 m above the verified base. The source
remained complete in the reviewed capture, with timber presentation and the
source-relative contact receiver.

Read-only runtime receipts distinguish rendering cost from camera fitting:
the machine went from 5 draws/1 fit to 108 draws/7 fits across six native wheel
steps; the source had one mesh, one material clone, one source draw callback
and eight bounding-box support points. Its viewport target was 868 × 603
(523,404 physical pixels). Caschlatsch idle draws advanced 150 → 168 while
camera fits stayed at 10. CPU submission samples were 0.2–0.4 ms; these are
neither GPU timings nor hardware frame-rate claims. The architecture already
caches camera fitting and does not rescan original geometry on idle light
updates. The parent approved a slower sample cadence for the 24-second light
sweep while preserving immediate camera and continuous compositor motion;
that source change requires a new stable build and serial browser verification.
