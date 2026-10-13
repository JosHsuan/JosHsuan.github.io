# Native-scroll window catalog

The catalog contains only two recipes: **pressure opening / membrane** and **fluid page edge / ink**. Each is available with a model Canvas and a 2D information surface, giving four specimens. Earlier proposal families and the Bending-Active current/dormant audit are not registered or selectable. Their research source files and historical verification documents remain in the repository.

## Review locally

Use exact Node **24.19.0**, the committed lockfile and existing dependencies:

```powershell
node roles/uiux-designer/cases/bending-active-thesis/animation-review/serve.mjs
```

- [Model-window catalog](http://127.0.0.1:4198/3d/)
- [Information-window catalog](http://127.0.0.1:4198/2d/)

The loopback server builds dist/, verifies approved release asset hashes and serves only that artifact and those assets. No installation is needed. Each page lists exactly two recipes, for **four specimens** across the two content layers. Search filters those two entries; there is no current/dormant inventory filter. Discussion notes remain browser-local and export as JSON, including historical notes already stored in that browser.

| Recipe | Model specimen | Information specimen |
| --- | --- | --- |
| Pressure opening / membrane | `window-3d-membrane` (former C3) | `window-2d-membrane` |
| Fluid page edge / ink | `window-3d-ink` | `window-2d-ink` (former I3) |

Both layers use the same recipe parameters and shared functions. The former C3 membrane keeps its frequency, damping, transport axis, boundary limit and approved model presentation. Changing the content layer does not select a different motion formula.

## Scrolling behavior

The specimen is a native browsing viewport over a page three times its height. The window occupies the middle portion of that page. At 0% it is below the viewport; at 50% it is centred; at 100% it has crossed the upper boundary.

Stopping at an intermediate position leaves content there. Elastic feedback relaxes around that native position. Opacity stays at one and the surface stays fully open. Content leaves sight through the viewport boundary. Upward scroll follows the same page in reverse.

Four corners and four edge centres respond to actual body acceleration and braking. A reversal preserves their momentum: old travel brakes before leading/trailing stiffness exchanges sides. The model, camera, geometry, lights, SVG and text remain static within the containing window. Elasticity deforms the perimeter and common transform; it does not non-linearly warp source content.

## Controls and lifecycle

- Wheel, touch and keyboard scrolling determine native position without wheel cancellation or forced snapping.
- Before, Enter, Leave and Reverse-return animate the demonstration's native scroll position. Soft/Strong use different scroll speeds; native input interrupts the demonstration at the current position.
- Play performs one traversal with an 800 ms reading hold. Upward replay traverses in reverse. These are explicit review controls.
- The position slider samples a native position with feedback at rest.
- Pause, a hidden tab and an offscreen stage freeze active time. Returning excludes the hidden interval.
- Reduced preserves native page travel and removes elastic feedback. A live preference change keeps the current page position and cancels scripted travel; explicit review playback remains opt-in.
- Completion waits for traversal and body/material/pointer/energy settlement. Resting windows request no frames. Offscreen content becomes inert without fading.

## Shared source and ownership

The sole mathematical implementation now lives in [runtime/motion](../runtime/motion/README.md). Its public entry is `runtime/motion/window-motion-api.mjs`. It exports the two immutable recipes, caller-clocked state updates, body/material paths, pose sampling and perimeter functions.

Catalog kinetic-motion, window-motion, window-path, window-scroll and window-outline modules are thin re-exports. window-transitions contains only catalog descriptions and historical review adapters. Production presentation imports the shared runtime directly; it never imports animation-review.

window-specimen owns the catalog's single RAF and scoped listeners. The production director owns its own clock and presentation adapters. The pure math neither starts a loop nor decides which production surface receives a mask. No additional dependency or frame scheduler is introduced.

The static model renders at readiness and actual layout resize only. CSS travel does not resize its buffer. The content renderer, approved model setup, current-effect audit sources and source assets are unchanged by extraction.

## References and history

The direction study used [Lusion](https://lusion.co/), [Atlas Motion](https://lusion.co/projects/atlas_motion/), [WebGL Scroll Sync](https://github.com/lusionltd/WebGL-Scroll-Sync) and [R3F demand rendering](https://r3f.docs.pmnd.rs/advanced/scaling-performance). They informed original local interpretations; no reference assets, layouts or shaders were copied.

[DIRECTIONAL_ELASTICITY.md](./DIRECTIONAL_ELASTICITY.md) preserves the earlier team discussion. [VERIFICATION.md](./VERIFICATION.md) retains artifact-specific history and distinguishes it from this shared-source revision. Old fixed-region verifiers and screenshots are historical evidence, not current acceptance.

## Verification

Run the seven local `*.test.mjs` suites. After the integration owner builds a frozen artifact, run:

```powershell
node roles/uiux-designer/cases/bending-active-thesis/animation-review/verify-window-scroll.mjs
node roles/uiux-designer/cases/bending-active-thesis/animation-review/verify-scroll-controls.mjs
node roles/uiux-designer/cases/bending-active-thesis/animation-review/verify-current.mjs
```

The current browser scope is four specimens × three browser configurations (**12** cases), four specimens × two desktop engines (**8** focused control cases), and the **four**-entry catalog registry/UI check. Pure tests also prove identical function ownership, cross-layer recipe parity and preserved C3 parameters. Browser results from the earlier ten-proposal artifact do not prove this revision.
