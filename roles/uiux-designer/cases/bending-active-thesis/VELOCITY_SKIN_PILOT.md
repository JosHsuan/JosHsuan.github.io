# Velocity-responsive whole-panel pilot

Updated 21 October 2026. Mode/s of Making only; other project profiles are unchanged.

## Confirmed reference and correction

The owner rejected the original edge-only pilot as imperceptible and supplied an
8.80-second phone recording of Lusion Featured Work. At approximately 1.7–2.0s,
complete image cards visibly tilt into trapezoids; at 2.3–2.6s reversal changes
the response and the imagery follows. External project titles remain largely
straight. This supersedes our previous choice to keep all native content still.

Desktop supporting evidence is the design director's **historical 2023**
[project demonstration](https://www.thenerodesign.com/project/lusion): at 15.5s
two adjacent cards deform in different directions; at 17.2s the wide reel bows.
This is not a capture of today's desktop website. Current cloud live WebGL is
disabled, so direct desktop wheel timing/curve comparison remains unavailable.
No proprietary code, images or footage enters the application.

## Mapping and bounded proposal

The native information panel, its glass skin and its contained text share a
single temporary perspective plane. Fixed navigation/header and background
source rendering do not follow it. Text remains semantic selectable HTML; no
rasterization, displaced hit-test overlay, cloned content or extra canvas.
This CSS plane is an adaptation, **not a replication of a nonplanar mesh warp**.

- Input: actual native displacement / active elapsed seconds / viewport height;
  wheel units and pointer-up are not used. Touch inertia still counts as motion.
- Dead zone: 0.08 viewport heights/s; saturation scale: 1.8 viewport heights/s.
- Attack/release time constants: 55/90 ms, with exact idle below 0.0005 strength.
- At maximum signed strength: rotateX -8°, rotateY 4°, rotateZ -1.1°, skewY 0.7°.
  Perspective distance is max(800px, 3×panel height, 3×panel width), bounding
  projection on tall reading panels. Parameters are proposals, not Lusion measurements.
- Smaller skin edge bow remains capped at 2.5% of short side and 9px/5px.
  No animated blur, opacity or content clipping; no layout reflow.
- Slow reading/stopping restores the neutral plane. Focus, Reduced Motion,
  existing static policy, pause, resume, seek, time gap >1s and offscreen state
  restore neutral without waiting for recovery. Native controls remain native.
- Existing Director alone supplies time. Events wake finite response; exact
  neutral state skips pose/outline work even if independent ambient 3D keeps
  the Director active. No added RAF, timer, scroll listener or context.

## Evidence and next acceptance gate

Pure tests cover rate normalization, bounded/reversed whole-plane parameters,
zero-time retarget, exact rest, policy/focus resets and unchanged idle work.
The built-page browser scenario records real video and checks nonidentity
native scroll response, finite identity rest, focus, Reduced Motion and overflow.
Test source is not proof of a successful browser run. Integration owns the build
and full matrix; visual desktop/mobile review must inspect actual recordings,
including moving text, fixed chrome, links and continued background media.
No expansion beyond Mode/s until the pilot's visible feel is accepted.

## Official public implementation evidence

Lusion's MIT-licensed [WebGL-Scroll-Sync](https://github.com/lusionltd/WebGL-Scroll-Sync)
is a DOM/WebGL alignment demonstration, not the homepage deformation shader.
Its README explains native-scroll/rAF desynchronization, an absolute scrolling
canvas compensated on rAF, and extra raster cost from 25% vertical overscan.
The useful constraint here is to preserve native scrolling and single-owner
updates, not import another canvas or loop. Our native panel plane requires
neither a DOM-to-WebGL texture copy nor that canvas compensation. No demo code
was copied; no exact public homepage deformation parameters were established.

## Measurable acceptance checklist (pending rendered candidate evidence)

- Native forward/reverse scroll: record actual browser output plus signed pose
  samples; verify displacement is native, nonidentity full-plane projection is
  visible, and direction reversal changes the sign without a discontinuous jump.
- On a stationary document, strength must reach exact zero in under one second
  from bounded strength 1; subsequent 120 ambient ticks add no outline samples.
- Focus, pause and reduced-motion restore identity; verify link activation,
  text selection, fixed chapter rail/header positioning and no horizontal overflow.
- Inspect desktop and narrow viewport video side by side with the user reference.
  A passing nonidentity assertion alone does not establish perceptibility or
  moving-text legibility. Do not accept an edge-only result again.
- Confirm no additional WebGL contexts, RAF/timers, overscan allocation, blur,
  canvas/texture copies or per-frame layout measurement. CSS compositing still
  has nonzero pixel cost; no performance win is claimed without profiling.
- Verify existing ambient 3D/camera/source media remain continuous and the
  independent default Bending/XR/Home profiles remain unchanged.

### Cloud candidate observation, 21 October 2026

Integrated built artifact served privately on port 4186 was exercised with real
cloud native scrolling. A reverse-scroll screenshot sequence showed whole-panel
projection, not only an outline; read-only samples then recorded rotateX
3.226°, 0.733°, 0.167°, 0.038°, 0.010°, and 0°/identity at unchanged scrollY=265.
Sampling follows screenshots and is not exact timestamp synchronization.
Fixed header/rail remained stationary. Focusing the native All projects link
returned `transform:none`; page had no horizontal overflow. Actual Pause motion
control returned all 16 registered panel transforms to `none`, then was resumed.
The bounded strength-1 pure sampler reaches exact idle in 0.7s at 60Hz.

These observations establish working desktop native projection and finite rest,
not exact equivalence to Lusion, moving-text acceptance on all devices, or
hardware performance. Full browser matrix/video and narrow/mobile review remain
pending integration. Cloud WebGL fallback prevents claiming accelerated 3D
continuity from this screenshot sequence; source ownership is unchanged.
