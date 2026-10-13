# Shared window motion

This directory is the content-independent motion implementation for **membrane** (pressure opening) and **ink** (fluid page edge). The local catalog and production presentation can import the same functions. Production code must import from this directory, never from the catalog.

These modules contain no DOM access, event subscriptions, frame scheduler, React state, renderer, asset loader or application-level manager. The caller owns input, active time, visibility, dimensions, rendering and disposal.

## Public entry

Import from `window-motion-api.mjs`.

| API | Responsibility |
| --- | --- |
| `getWindowMotionRecipe('membrane' | 'ink')` | Returns an immutable, layer-independent recipe. |
| `createWindowMotion(recipe, {region})` | Creates caller-owned body, eight material points, pointer and aperture state. |
| `setWindowScrollTarget(state, target, {energy, reduced})` | Sets a continuous target in [-1, 1], preserving momentum and adding no kick. |
| `advanceWindowMotion(state, activeSeconds, {paused, reduced})` | Advances through the caller's existing active-time frame loop. |
| `setKineticPointer(state, x, y, {reduced})` | Supplies bounded normalized pointer response where the presentation permits it. |
| `scrollTarget(progress)` | Converts normalized native scroll progress [0, 1] into the signed target. |
| `scrollingEffect(recipe, viewportHeight)` | Derives the common body/material transport geometry for a scrolling viewport. |
| `sampleScrollingPose(effect, state)` | Returns residual feedback around native page position; alpha=1, cut=1 and aperture=0. |
| `sampleWindowBoundary(effect, pose, width, height)` | Returns four corners and four edge centres, preserving their shared displacement gain. |
| `sampleWindowOutline(effect, pose, width, height)` | Returns the rounded CSS boundary path. `pose.radius` controls rest and active corners; the default is 18 px. |
| `sampleWindowPath / sampleWindowTangent` | Samples shared path coordinates and their derivative dR/dq. |
| `scrollGeometry` | Describes the catalog's native three-height demonstration page; production may measure its own natural geometry. |

Low-level kinetic functions, `sampleKineticPose`, `blendPose` and region retargeting remain available as pure primitives. Fixed-region opacity/aperture endpoints are not the native-scroll presentation contract.

## Caller contract

1. Measure the actual native surface and viewport; calculate a normalized scroll progress in the presentation adapter.
2. Create the derived effect and state. Initially synchronize to the measured target with `reduced: true` to prevent an unwanted introduction.
3. On native scroll, set the continuous target. Advance with active seconds from the existing director frame loop.
4. Apply only the returned residual pose around native flow, together with the perimeter path. Do not add the full body path a second time.
5. Stop requesting frames at `state.resting`. Pause/hide excludes elapsed background time; Reduced snaps to the current target and removes feedback.
6. If viewport dimensions change, update both the derived effect and the state transport geometry together. Recreating and synchronizing at the measured scroll position is a valid static resize boundary.

The same recipe produces the same numeric response for a model Canvas or an information surface. The caller decides which surface receives it. This extraction does not require applying a new mask to an existing production Canvas.

## Preserved parameters

| Recipe | Body frequency | Damping | Base axis | Boundary limit |
| --- | --- | --- | --- | --- |
| membrane | 1.55 Hz | 0.55 | [0, -100, 60] | 0.105 × short side |
| ink | 1.60 Hz | 0.58 | [-75, -35, 20] | 0.055 × short side |

The membrane values preserve the former C3 catalog response. Model geometry, camera, lighting and material setup remain outside these pure modules. Four corners and four edge centres follow actual body position and velocity; acceleration stretches the trailing material, braking lets it catch up, and direction changes follow actual speed.

Tests in `animation-review/` exercise these exact shared exports, recipe parity across both layers, native-scroll opacity, finite settlement, Reduced behavior and dependency direction. Catalog-only compatibility entries are re-exports, not copied implementations.
