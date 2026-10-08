# Optical/compositing adapter checks

Date: 8 October 2026, Europe/Berlin. This records the next implementation step after the role-extension commit snapshot. It proves the isolated adapter operations, not acceptance of the complete Bending-Active page.

## Implemented handoff

The case now provides `components/optical-score.mjs` and `components/scene-compositor.mjs`. `sampleOpticalScore(input, pose, {bounds})` reads the shared centre-anchored `stageU` and `visualU`, and returns a flat record: `filmGaugeMm`, `focalLengthMm`, `focusDistanceM`, `focusRangeM`, `apertureScale`, `maxBlurPx`, `asciiWeight`, `asciiCellPx`, `asciiBlend`, `asciiTint`, `veil`, plus explanatory diagnostics. The original nested contract was flattened for the parent adapter; ownership and units are unchanged.

Focal length starts from the source-framed camera's actual vertical FOV and Three film-gauge convention, then applies chapter-specific lens ratios. This keeps a controlled change in framing instead of imposing the initial millimetre ranges on a differently framed scene. The final camera writer still owns `setFocalLength` and the camera matrix. Focus samples actual camera-forward depth planes of the supplied source bounds. Selected holds can change focus through `visualU` while camera/lens remain still at the `stageU` plateau.

`createSceneCompositor(gl)` returns `render(scene,camera,score,{width,height,dpr,samples,protectedRects})`, `inspect()` and idempotent `dispose()`. `score.overrides` is the deliberate diagnostic hook for same-pose focus/ASCII comparisons; ordinary browsing does not expose effect sliders. Protected rectangles accept bottom-left normalized UV arrays or CSS client-rectangle objects. More than 16 visible rectangles become one conservative reading-region union, so no protected content is discarded.

The compositor uses one linear RGBA16F color target with the real unsigned-int depth attachment and one display pass. It performs a bounded 17-sample depth-aware gather, then scene-derived glyph blending, then one output transformation. Original procedural glyph strokes approximate `. : - + * # @`; no copied atlas or per-frame readback is used by the runtime. The test harness alone reads pixels to verify effects. Screen-limited blending leaves existing HDR highlights above one unchanged. Alpha remains transparent around the subject. The pass rejects logarithmic/reversed/orthographic depth and checks framebuffer completeness when allocating/resizing.

No hard camera cut has been implemented by this adapter: the reversible SYSTEM/PATTERN treatment is accurately labeled a scene dip. A parent camera edit, if added later, must provide its own composition continuity evidence.

## Observed tests

The table below records the initial zero-sample target run. Subsequent integrated-image inspection justified requesting two MSAA samples in full detail with actual depth resolution; the same Chromium/WebKit groups passed again. Near/far sharpness and protected-region/alpha assertions remain unchanged. See [the visual review](VISUAL_REVIEW.md) for the source-scene observations and additional memory cost. Light detail continues to request zero samples.

Command from the repository root:

```powershell
$env:OPTICAL_BROWSER = '1'
node --test roles/uiux-designer/cases/bending-active-thesis/tests/optical-score.test.mjs
$env:OPTICAL_ENGINE = 'webkit'
node --test roles/uiux-designer/cases/bending-active-thesis/tests/optical-score.test.mjs
Remove-Item Env:OPTICAL_BROWSER, Env:OPTICAL_ENGINE
```

Both Chromium and WebKit passed eight groups: seven numerical/ownership/mask invariants and one actual WebGL fixture group. Ordinary test execution without `OPTICAL_BROWSER=1` skips only the browser fixture. The fixture has two checker surfaces at different actual camera depths and a real directional light; it is explicitly a test fixture, not portfolio content.

| Pixel evidence | Chromium | WebKit |
|---|---:|---:|
| Near focus, front gradient | 86.18 | 86.18 |
| Far focus, front gradient | 9.06 | 9.04 |
| Near focus, rear gradient | 9.11 | 9.07 |
| Far focus, rear gradient | 86.18 | 86.18 |
| ASCII off/on channel-difference sum | 1,592,358 | 1,522,380 |
| Difference inside protected reading region | 0 | 0 |
| Difference outside protected region | 700,974 | 700,774 |
| Glyph difference with weaker directional light | 530,880 | 489,088 |
| Corner alpha / opaque surface alpha | 0 / 255 | 0 / 255 |

No browser/shader compilation errors occurred. The actual Chromium capture was visually inspected: the front checker stays sharp while the rear loses contrast, and the derived glyph marks follow both surfaces. Working captures are under `D:\JosHsuan_Website\_work\bending-active-thesis\round-02\verification\optical-fixture*.png` and are not public assets.

The later `CinematicScene.jsx` integration loads the pinned three-node source shell/base, verifies recorded vertex/triangle counts, binds the shared lighting and element scores, collects current DOM protection rectangles and renders once through the compositor. Full detail requests two MSAA samples with depth resolution; Light disables MSAA, DOF, ASCII and shadows. Source counts and render counts are distinct: the source has 172,789 vertices / 227,521 triangles, while shadow and display passes add submitted GPU work. Actual seven-chapter captures at four widths were visually inspected; subsequent FORM framing and same-pose antialiasing checks are in [the visual review](VISUAL_REVIEW.md).

The final page behavior matrix, fallback and frame-cost results are recorded by the case verification harness separately. Neither desktop browser emulation nor these adapter tests establishes physical-phone performance or complete user-goal acceptance. No hard camera cut is claimed.
