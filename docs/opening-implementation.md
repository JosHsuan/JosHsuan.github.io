# Local implementation status

September 28, 2026 reset: the owner rejected the 3D background and retained the
UI/UX and glass. The main page now mounts a neutral light surface and the unchanged
glass pipeline. The particle feature has subsequently been removed entirely.
Full terminal expansion is now reversible. See [Workspace interaction](workspace-interaction.md)
for the current development baseline.
The iteration 03 record below is historical, not the next iteration's brief.

# Historical opening study — iteration 03

September 28, 2026. A new local interpretation of the owner's Arrival brief. The previous particle rectangle, reflective sculpture and solid curves have been replaced; the rejected prototype was not restored. [Visual requirements](opening-visual-requirements.md) records the concept, skills, sources and material decisions.

## Review the scene

Run `pnpm dev` and open `http://127.0.0.1:5173/`.

- Scroll outside the terminal to write and dissipate the ink; reverse before completion to return to earlier states.
- Read inside the terminal without advancing the scene. `View work` or the expand control resolves directly to reading.
- Final scrolling expands the terminal; completion stays latched during later upward and downward content scrolling.
- `Study controls` offers Mist (0%), Write (30%), Dissolve (62%), Read (100%), a slider, scene-only inspection and Replay.
- Reduced motion resolves to the still, expanded workspace. The DOM interface remains independent of Canvas readiness.
- Credits link to the Spirit / Three.js MIT notices, Thinker attribution and the downloadable CC BY-SA 4.0 mesh.

Case-study development remains paused. The work index is a reading/layout study aid. No source portfolio images, company material or film stills were published. No deployment was performed.

## Working parameters

| Area | Implementation |
| --- | --- |
| Timeline | 2,600 CSS px, bounded exponential input smoothing. No autoplay or idle animation clock. |
| Camera | 42 degree vertical FOV; stable orientation; x 0 to 0.42, z 10.5 to 9.8; travel settles at 60%. |
| Chamber | Procedural screen-space light field with a broad luminous fog opening, rough dark surround and soft illumination spill. |
| Ink | 65,536 desktop / 16,384 narrow-screen points. A ring gesture and two curved strokes have different finite emission schedules. Dark, normal-blended soft sprites broaden and fade with age. |
| Simulation | 160 fixed progress steps. GPU ping-pong positions use original Spirit derivative curl, emitter attraction and finite life. No continuous respawn. Initial advection relaxes exponentially with age. |
| Reverse / seeking | Cache every 8 simulation steps; restore the nearest earlier texture and integrate forward. At most 12 steps per rendered frame bound catch-up work after a large seek. |
| Thinker | Retained 1.25 MB smoothed GLB sampled by area into 100,000 / 40,000 points. Back-facing orientation, black silhouette and restrained edge light. No glossy mesh is drawn. |
| Mist | 4,600 depth-distributed soft particles, subtle curl movement sampled from scroll progress. No elapsed-time drift. |
| Glass | Screen-space edge lensing and scattered light, increasing body density during expansion; CSS blur and layered rims. DOM text stays crisp and unscaled. |
| Reading | Panel expands at 85–100%; completion latches. Existing scroll ownership, anchor compensation, pointer hold and independent content navigation are retained. |
| Graphics | R3F demand loop, half-float HDR composer, 4/2 MSAA samples, DPR caps of 1.5/1, restrained bloom and one OutputPass. No Bokeh depth pass or PMREM studio is retained. |

Simulation caches occupy at most about 16 MiB at desktop density before the 85% cutoff, plus ping-pong and seed textures. Framebuffers and the figure's point buffers are additional. All simulation textures/checkpoints and composer resources have explicit disposal; the loader retains its shared GLB cache.

## Module responsibilities

- `opening/arrival.ts`: seeded stroke sources and finite-life/sample helpers.
- `opening/choreography.ts`: camera, phase labels, panel bounds and expansion.
- `opening/controller.ts`: progress smoothing, idleness, completion latch, reduced motion and replay.
- `scene/SpiritSimulation.ts`: fixed-step feedback and reversible checkpoints.
- `scene/InkWriting.tsx`: simulation ownership, GPU point rendering and development-only validation counters/checksum.
- `scene/spiritField.ts` and `scene/vendor/spirit/`: source-pinned derivative simplex/curl integration.
- `scene/Chamber.tsx`: procedural environment light and particle mist.
- `scene/ParticleThinker.tsx`: area-weighted mesh sampling and silhouette shader.
- `scene/OpeningScene.tsx`: composition and graphics boundary.
- `scene/GlassPass.ts` / `scene/CinematicLens.tsx`: scene optics, output pipeline and cleanup.
- `ui/Terminal.tsx` / `App.tsx`: independent reading interface, input ownership and review controls.
- `scripts/prepare-thinker.mjs`: reproducible source verification, simplification and Laplacian smoothing.

## Validation record

- TypeScript/production build and nine automated tests pass. Tests cover finite ink lifetime before expansion, repeatable seeds, bounded sample indices, smooth camera settling, viewport bounds, idle scheduling, reverse input, completion latch, reduced motion, and GLB geometry/index/normal validity.
- Desktop browser inspected at 1440 x 900. At 30%, the full 65,536-particle state fingerprint was `48:2795026751:59956`; after advancing to 62% and reversing to 30%, the fingerprint was identical. The final field gives the live particle count.
- Real background wheel input returned 30% to 4.05%. A terminal wheel gesture moved content to 450 px while scene progress stayed at 4.05%. The renderer remained at 47 frames across separate idle/reading observations.
- Real background wheel input advanced 0% to 51.92%, then through expansion to 100%. The panel reached 1310 x 774 at (64.8,70), with the heading still 40 CSS px. Upward content scrolling returned to the top while progress stayed at 100%; the renderer stayed at 81 frames.
- Actual browser captures are stored in `references/reviews/opening-03/`. These are rendered application screenshots, not generated illustrations. Iteration 02 captures remain historical.
- A 390 x 844 browser viewport was inspected for writing and reading. The reduced-density silhouette initially had excess pinholes; a minimum mobile sprite size restored continuity. The expanded panel is 362 x 724 at (14,64), the heading stays 40 CSS px, and document width remains 390 px. Direct `View work` entry succeeds. This does not certify physical touch hardware.
- Final fresh loads show no application or shader errors. Earlier hot-reload diagnostics and an initial glass sampling warning were corrected/rechecked after reload. The upstream Clock deprecation remains.
- Resizing while idle exposed a stale glass boundary. Target resizing now explicitly invalidates the demand renderer, and a panel ResizeObserver requests a repaint after layout changes. The final desktop first frame was rechecked with aligned DOM and glass boundaries.

## Practical limits

This is a local visual study. The chamber light field, sprite haze and terminal refraction approximate optical effects; they are not volumetric path tracing or Apple's native Liquid Glass. The ink reuses actual Spirit shader sources and feedback principles, but its finite emission and reversible stepping differ from the original free-running demo.

The lazy 3D bundle is about 1 MB uncompressed / 268 kB gzip plus the separately loaded GLB. Vite reports a bundle-size advisory. Physical phone touch behavior and cross-GPU performance are not established by viewport resizing. The installed Fiber/Three pairing reports an upstream Clock deprecation; replacing Fiber's clock internals is outside this visual change.
