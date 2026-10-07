# Single-input cinematography proposals

## Authorized scope and design decision

The owner asked for camera and image-making research implemented locally, with mouse position or wheel scrolling as the sole parameter input. This role contains thirteen working A/B comparisons. It does not implement the production portfolio, process private preparation materials, or publish a site.

The recommended review form is a synchronous pair of views: one original scene, one progress value, one variable family per comparison. A desktop shows the pair side by side; a narrow viewport stacks them. A contact sheet, two captured checkpoints per proposal, role-local Saved choices and an export make review possible without remembering transient controls. The previous multi-slider material bench is not the model for this round.

Pointer X maps directly to u in [0,1]. Page-scroll mode uses actual document displacement through a sticky review section, with passive scroll listeners and no wheel interception. The selected source is exclusive. Touch and keyboard provide equivalent access to u, not extra camera parameters. There is no time-based playback. Input rests stop GPU work. Reduced motion defaults to a fixed midpoint; explicitly enabling manual motion is local to this review session.

## Research and original adaptation

Lusion's public [WebGL-Scroll-Sync](https://github.com/lusionltd/WebGL-Scroll-Sync/tree/d2f2c844b449878c760e3f435ab01c85ed5ee072) discusses native-scroll/animation-thread drift and an overscanned canvas workaround. This desk avoids that particular alignment problem by keeping the Canvas and its HTML labels in one sticky block. It does not copy their implementation, overscan algorithm, website art or commercial motion. The repository and official sites were consulted; this is not a claim of pixel-level inspection of every Lusion project.

The role uses the installed Three 0.186.1 camera, curve, render-target and physical-material APIs. Catmull–Rom paths are sampled by approximate arc length. The minimum-jerk curve is an original mathematical implementation. Camera velocity/acceleration readouts use a six-second canonical traversal; actual input speed is not sampled as a second control.

The [Tiffen Black Pro-Mist description](https://tiffen.com/products/black-pro-mist-filter) informs the distinction between bright-source diffusion and a whole-image blur. The implementation extracts bright HDR values, applies a separable blur and recombines before tone mapping. It has no measured point-spread data and does not emulate numbered filter grades. No Tiffen media was copied. Depth of field is a bounded single-depth gather; edge bleeding is an explicit limitation.

Theatre Core uses the project's existing controller and a byte-identical genuine UIUX Studio export. A seek replaces time playback. The manifest retains provenance; this is a reuse study rather than a newly authored shot. Each view obtains either a sampled analytic pose or the authored pose, never competing writers.

## Proposal structure

| Comparison | One input drives | What to assess | Suggested UIUX use |
| --- | --- | --- | --- |
| Fixed / dolly | Subject turn; optional distance | Stability versus approach | Inspection card |
| Tripod / handheld | Bounded position, aim and roll trace | Presence versus reading noise | Short process vignette |
| Rail / spline | Path distance | Which spatial relation is revealed | Geometry workbench |
| Linear / minimum jerk | Distance law | Endpoint velocity and acceleration | Arrive at a detail panel |
| Pan / truck | Aim versus lateral position | Parallax as depth information | Layer inspection |
| Zoom / dolly | FOV versus position | Magnification versus perspective | Detail selection |
| Dolly / dolly zoom | Distance and compensating FOV | Stable reference plane, moving context | Deliberate depth reveal |
| Deep / pulled focus | Focus distance | Attention transfer without losing labels | Media inspection |
| Clean / diffusion | Highlight spread | Atmosphere versus surface precision | Optional media treatment |
| Open / occluded reveal | Lateral camera path | How much concealment earns its duration | Entry transition |
| Move / shot sequence | Continuous distance versus three cuts | Orientation, structure, detail | Method reader |
| Level / crane orbit | Azimuth and optional elevation | Whether elevation adds information | Assembly explanation |
| Analytic / Theatre | Formula versus real score seek | Authoring benefit and hierarchy | Shared story contract |

## UIUX integration proposal

The existing UIUX feature manifest supplies candidate relationships: `study-index`, `method-reader`, `media-inspection`, `comparison`, `geometry-workbench`, `shared-actions`. The review UI keeps labels and hit regions on a stable HTML plane. One u updates the spatial view and a stable phase rail. The integrated reader uses Overview / Separate / Return to match the reused score. The 3D role's `reader` study is a concrete integration experiment using assembly, camera and this rail together.

Mapping does not establish approval. The owner's actual Saved export has not been recovered from the original browser. The import flow accepts the original `uiux-material-review-v1` export, retains its source origin and file digest, and distinguishes unresolved IDs from known IDs whose treatment revision remains unconfirmed. Synthetic browser-test notes are isolated in fresh profiles.

Recommended first review: fixed/dolly, timing, zoom/dolly and shot sequence. These establish the information hierarchy before trying diffusion or handheld movement. For a factual portfolio, use stable arrivals and short explanatory moves; the more expressive treatments remain optional candidates.

## Runtime and role boundaries

- Port 4182, storage `cinema-interaction-review-v1`, MCP names `cinema_*`, a role-local package and lockfile, and `.runtime/codex-home` keep activation independent.
- Source copies of the review shell are role-local and identified as the same initial implementation revision. Neither role imports the other's runtime or tool state. Runtime dependencies resolve only to this role and the root's committed versions.
- The two custom skills are original scoped workflows informed by the available R3F skills. The vendor Playwright skill remains pinned with its Apache notice. Its unavailable Bash/npx recipe is not claimed tested; the actual Node/MCP path is.
- The local catalog MCP is read-only and accepts known IDs. Browser MCP uses a headless ephemeral profile, a loopback-origin restriction and a tool allowlist. The origin restriction is not an OS security sandbox.
- Source references, pins, copied CC0 HDR bytes and genuine motion hashes are in `catalog/sources.json`. Captures include actual camera/effect state in `catalog/captures.manifest.json`.

Physical devices, Safari hardware, owner Saved selections and production integration remain outside the evidence from the local browser tests. See `verification/interaction-browser.json` for the measured outcome rather than inferring success from configuration.
