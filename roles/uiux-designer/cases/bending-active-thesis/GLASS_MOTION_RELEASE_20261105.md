# Glass motion portfolio release — 5 November 2026

Decision 0022's site-wide Glass Feed, Glass Carousel and Glass Stream redesign
is published at [joshsuan.github.io](https://joshsuan.github.io/).
The released application commit is `1e7a19bbfadb397ec12177278b520c823f852153`.
The later documentation commit records acceptance without rebuilding this export.

## Exact release evidence

- [Full CI 42037647616](https://github.com/JosHsuan/JosHsuan.github.io/actions/runs/42037647616)
  passed all 645 public browser identities: 215 each in Chromium, WebKit and
  mobile Chromium. Independent reconciliation of the inventory and 13 execution
  receipts confirms every identity passed exactly once, with zero retries and skips.
- The same CI passed 720 portable application/tool checks, with two pre-existing
  intentional source-suite skips, and 9 framework source checks. Both independent
  framework root/subpath browser jobs passed all 12 checks each (24 total).
- [Pages deployment 42042697431](https://github.com/JosHsuan/JosHsuan.github.io/actions/runs/42042697431)
  consumed that CI's validated-release and exact static export. No deployment
  rebuild or failed candidate was used.
- Downloaded artifact ZIPs matched their GitHub SHA-256 digests. All 147 approved
  asset entries and 137 protected original entries matched their source pins.
- Independent public reconciliation matched all 268 exported files, including
  143 files under `assets/`. Release identity stayed stable before and after
  transfer. An unknown route returned a genuine 404 with `noindex`.
- Exported-file digest: `1ecb84bd00eb5ea1c3626363da7885d6ab2b24286307d9fa7d3207513bf1e128`.
- Node 24.19.0, pnpm 11.19.0, the committed lockfile, existing CI/CD gate and empty
  reusable framework remain unchanged. No paid service, subscription, trial,
  hosted renderer or new dependency was introduced.

Raw local receipts and screenshots are retained under `.runtime/nov05/`;
the identified CI run provides independently downloadable execution evidence.

## Delivered motion and retained owner requirements

| Surface | Released behavior |
| --- | --- |
| Reading throughout all twelve public routes | One shared viewport-relative Feed: clear central reading, cylindrical shoulders, direction-dependent stretch and acceleration recovery, with bounded liquid edges. Keyboard-visible focus provides a neutral reading/activation surface while background motion continues. |
| Home discovery | Eight compact square instances on an inward-facing cylindrical arc. Native input dispatches selection events to the actual instances exactly once; frames interpolate poses. Full forward/reverse discovery and the outer Home/Contact sequence remain. |
| Project overview | A finite eight-project Stream with alternating desktop columns on a 24-second cycle. Native square destinations remain unique; single-column phone layouts use Feed. |
| Model and media passages | Uniform source-plane opening, continuous authored camera joins and independent handheld rhythm on the existing Bending, XR, generic and Home owners. Native source hits, annotation alignment, video time and backing dimensions remain protected. |
| Home showcase and scale | Seven original model sources retain measured camera positions, human eye heights, focal changes, photographic light cues and intentional architectural crops. Revised joins stay within the authored camera and light bounds. |
| Foreground, library, navigation and entry | Coordinated foreground recovery, eleven overlapping original library traces, reflections inside native control targets and a rounded aperture reveal tied to actual native completion. Existing readiness, interruption and disposal ownership remains. |
| Previous owner directions | Continuous motion without pause/preference/performance static modes; introduction-only Home opening; original Mode/s machine and Caschlatsch structure; photograph-informed materials; native HD XR recordings; no image-opening UI; responsive 80%-reference density. Their complete inherited browser contracts remain in the accepted inventory. |

Original geometry/media bytes, contribution/credit content and the existing
scheduler/final writer boundaries are preserved. Public reference inspection
informed original implementation; no Align template code or sample media was copied.

## Actual browser review

Before publication, the exact CI export was reviewed for Project's three-column
Stream, all three original 888 × 1920 XR recordings in actual native playback,
and Bending's source comparison, Escape restoration and complete function library.
The Project cards measured 405 × 405 native layout pixels on the reviewed desktop.
The recording and Bending reviews produced no browser console errors.

After publication, the actual public URL was reviewed at 1440 × 1000 and
390 × 844:

- The approved introduction remained readable over a large folded architectural
  surface extending beyond the viewport, preserving its spatial scale.
- All eight discovery instances retained square native layout dimensions:
  486 × 486 desktop and 258 × 258 phone, measured with integer offset dimensions.
  Neighbours overlapped compactly. Native mobile scrolling moved 03 → 02 → 03.
- The selected Mode/s card opened the correct project. Its native Machine
  assembly chapter displayed the original silver frame/rails, blue components,
  dark mechanical parts and white workpiece on both layouts.
- Home, discovery and machine views had no horizontal document overflow.
  Collected browser console errors were empty. Temporary viewport overrides were
  reset and review tabs closed.

This is actual browser viewport evidence, not a physical-device frame-rate claim.

## Rendering tradeoffs and qualification limits

Chromium uses the original bounded displacement map. WebKit uses the continuous
geometric field and painted liquid rim because its displacement rendering failed
the clear-centre pixel requirement. Neither path disables motion. Fractional-DPR
hard-edge interpolation is bounded separately from central spatial deformation.
Regular reading glass reserves 78% dark substrate coverage; the unchanged actual,
white and black backdrop contrast gate remains 4.5:1.

The earlier fixed raster budgets and HC3DP single-pass clear-shell approximation
remain documented in the [design direction](PORTFOLIO_DESIGN_DIRECTION.md).
Native text and the XR recording buffer retain independent resolution. These
are deliberate material/rendering choices, not automatic motion suppression.

Rejected candidate `b5abe0a` had one Linux WebKit XR reveal completion timeout
after successful source readiness. Its trace did not establish the cause.
The added test-only observation preserves native animations, promises, the
720ms animation duration and original 1600ms completion bound. In this accepted
run, both cover/content animations actually finished on initial arrival and
reload, respectively 236ms and 431ms after accepted readiness, within their
unchanged deadlines. This evidence is not represented as a root-cause fix for
the earlier unclassified delay. No failed artifact or retry-only acceptance was used.

Windows WebKit's local `NotSupportedError` for Dot's original H.264 recording
remains an environment limitation; the accepted Linux WebKit suite decoded and
advanced that same native recording. Physical Safari/phone performance was not
measured. Apple/Lusion/Align inform the design language rather than a claim of
identical rendering or complete guideline conformance.

See [decision 0022](../../../../docs/decisions/0022-glass-motion-system.md),
[the integration and qualification history](GLASS_MOTION_REDESIGN.md),
and [the preceding continuous-motion release](CONTINUOUS_MOTION_RELEASE_20261104.md).
