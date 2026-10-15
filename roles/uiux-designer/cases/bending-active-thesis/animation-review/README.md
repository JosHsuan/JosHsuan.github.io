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
- Before, Enter, Leave and Return-to-window animate the demonstration's native scroll position. Return-to-window centres the window from either direction; Upward replay explicitly traverses upward. Soft/Strong use different scroll speeds; native input interrupts the demonstration at the current position.
- Play performs one traversal with an 800 ms reading hold. Upward replay traverses in reverse. These are explicit review controls.
- The position slider samples a native position with feedback at rest. Its thumb and percentage also follow native scrolling and review playback through the final stopped position.
- Pause, a hidden tab and an offscreen stage freeze active time. Returning excludes the hidden interval.
- Reduced preserves native page travel and removes elastic feedback. A live preference change keeps the current page position and cancels scripted travel; explicit review playback remains opt-in.
- Completion waits for traversal and body/material/pointer/energy settlement. Resting windows request no frames. Offscreen content becomes inert without fading.
- Viewport entry/leave facts follow transformed content bounds, including elastic lag. This border-box measure excludes any protruding decorative skin. The diagnostic `region` remains the native page coordinate; crossing its threshold alone does not announce a content exit. An interrupted exit cannot report completion while the content remains visible.

## Shared source and ownership

The 15 October neutral-material revision applies to both information specimens.
The owner rejected the intervening white proposal and withdrew its publication
approval. The build prepends production `app/glass-materials.css` tokens to the
catalog stylesheet, so standard reading fill, light ink, muted text, emphasis,
boundaries, shadow and native-preference fallbacks share one source. The
transparent 2D `.vt-window` alone owns the backdrop filter; its `::before`
overscan alone paints tint and has no backdrop filter. Title rows, footer and
text margins add neither fill nor filter. Only the approved diagram's paper
remains opaque. Desktop Chromium can select the bounded range variant; coarse
pointer / no-hover reading uses the regular `.72` neutral tint after actual
Windows mobile-emulation probes found the intended color compression inert.
This does not establish all physical-device behavior. A static viewport
background uses broad neutral colour bands and sparse rules to make native
travel through the material observable. It adds no animation, source-data
overlay, Canvas or clock. Model specimens retain their material and static
camera. The corrected neutral artifact passes its 24 behavior and six material
checks locally; owner visual review remains pending.

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
node roles/uiux-designer/cases/bending-active-thesis/animation-review/verify-glass-material.mjs
```

The current browser scope is four specimens × three browser configurations (**12** cases), four specimens × two desktop engines (**8** focused control cases), and the **four**-entry catalog registry/UI check. Pure tests also prove identical function ownership, cross-layer recipe parity and preserved C3 parameters. Browser results from the earlier ten-proposal artifact do not prove this revision.

The focused material verifier adds **six** information-window cases (two recipes
in Chromium, WebKit and mobile Chromium), running one browser at a time. It
retains the native centered DOM layout and checks shared-token ownership, real
black/white backdrop pixels, UI contrast, opaque unchanged source paper and
native increased-contrast fallback. Normal viewport/stage screenshots are saved
before its temporary black/white probes, alongside artifact hashes and results
in `.local/bright-catalog-materials/`. Despite its historical folder name, that
receipt now identifies the neutral run; the previous white receipt was
overwritten. Historical logs and recorded hashes identify the rejected white
checkpoint.

The rejected white artifact passed **24 behavior cases** and **six material
cases** locally; [VERIFICATION.md](./VERIFICATION.md) preserves those historical
measurements and artifact hashes. The owner subsequently rejected its white
appearance and revoked the earlier approval. It was never committed, pushed or
deployed. The corrected neutral artifact separately passes **24 behavior**
checks (12 scroll, eight controls, four registry) and **six material** checks.
All identify `app.js` SHA-256
`291564c2d9d3bbe843d2dfdeba0f7106207b31ab44804b4201a02103fdf62a9a`;
the material receipt is dated `2026-10-15T15:10:53.389Z`. Its style/manifest
identities and rendered measurements are in [VERIFICATION.md](./VERIFICATION.md).
Current work remains local and uncommitted, with owner visual review pending
and no commit/push/deployment authorization.

Source SVG bytes and same-mode source pixels compare exactly. Across the native
contrast-mode compositor change, RGB raster quantization is limited to one
8-bit code value, at most 1% of sampled pixels, and a mean channel difference of
0.01; alpha, geometry, opaque paper, filter and blend checks remain strict. The
report records observed deltas rather than claiming cross-mode pixel identity.
