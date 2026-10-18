# XR source-workspace capture and art direction

Date: 18 October 2026 (Europe/Berlin).

## Current architectural-room revision

The latest owner instruction restores the architectural scene behind the
workspace, permits removal of front-view obstructions, requires high-resolution
native output without deforming the structure or TV imagery, and requests that
Rhino close after the capture work finishes. The isolated transparent images
documented below are an intermediate checkpoint, not the final response to
this architectural-room revision.

CPU source review identifies **127 originally visible architectural objects**
to restore: 126 floor/carpet/plates, ceiling, rear doors, side/rear walls,
diffusion/acoustic wall elements and fixtures, plus one non-obstructing window
threshold at source floor level. The **29 front-facade glass/frame objects**
lie at native Y approximately −4.09 to −4.315 metres and obstruct the level
source +Y view; they stay hidden with the already authorized 118 foreground
speaker/cabinet objects. The original ten hidden ceiling/projector objects and
25 non-surface/clipping annotations retain their exclusions. This gives
**4,022 selected source objects / 182 excluded**, without moving, mirroring,
remodelling or retexturing the source.

A second native-source read independently counts the restored geometry as
386 mesh parts, 1,466,402 vertices and 2,881,748 triangles. The room selection
therefore contains **18,007 mesh parts, 31,361,185 vertices and 59,354,803
triangles**. The source copy's SHA256 before and after this read is unchanged.
The source TV screen's exact original four world-space vertices, quad topology,
UVs and material assignment are recorded privately. The protected native
capture additionally compares each of the 4,204 original objects' geometry
DataCRC before/after capture and compares the TV vertices/topology/UVs directly
against the independently read original, failing on any discrepancy.

The private `room-visibility-private.json` records every restored and excluded
source identity and its original bounds. The actual native room candidate was
visually reviewed by the root and source agent: the room's front opening,
back/side walls, ceiling, floor and complete rig create the accepted central
architectural composition. Its level source camera is **(25, −24,000, 3,000)**,
target **(25, 0, 3,000)**, direction **(0, 1, 0)** and up **(0, 0, 1)**, all in
source millimetres/Z-up. No source transformation or mirrored symmetry is used.

The root then reviewed a native material-lighting trial and selected it for
the two high-resolution final captures. Its native **SceneLighting** recipe is
a neutral WorldDirectional key (RGB 245/245/245, intensity 0.70), subtle cool
fill (205/220/232, 0.12) and warm rim (224/190/154, 0.06). Directions are
unit-normalized from (0.5,0.6,−0.65), (−0.7,0.5,−0.5) and
(−0.5,−0.7,−0.5). The original scene has no active light or enabled sun; this
documented temporary key replaces the native fallback headlamp during the
capture. The original materials, TV picture/UVs and vertex colours stay intact.
This uses [McNeel's native Rendered lighting/material pipeline](https://docs.mcneel.com/rhino/8/help/en-us/seealso/sak_displaymodes.htm)
and real native lights, with measured image output. The supported
[shadow quality controls](https://docs.mcneel.com/rhino/8/help/en-us/options/view_display_mode_shadows.htm)
were researched; no unverified local display-attribute setting is claimed to
affect the actual ViewCapture, and no global profile change is needed.

All three temporary lights are deleted in `finally`; the active source-light
identities/enabled states return exactly to the original empty set. Native raw
light-table counts can include deleted undo tombstones; they are not claimed
to return to zero. The original sun and OpenGL **Good** antialias setting are
unchanged, and no persistent display-mode profile is updated. The synthetic
infinite ground plane remains disabled while the actual restored source floor
receives native illumination.

The root completed the owner-requested shutdown at **17:35:30 CEST on
18 October 2026**: close the task-created Rhino window with Alt+F4, then choose
**No** at the save-changes prompt. A fresh window inventory contains no Rhino
window, and the task's MCP port 1999 has no listener. The original source and
private working copy both retain SHA256
`52a2c77039977c612afd05d1179410927cbe0a48b83439aa55ac98a9eaef666b`;
neither file was saved. The ignored `rhino-close-verified.json` records this
actual action and independent post-close checks. The first No-click attempt
had a transient approval-stream disconnect and executed no action; the same
reviewed UI action succeeded after a fresh snapshot. This is a verified
application shutdown, not an inference from the completed captures.

## Current high-resolution raster and pin verification

Native ViewCapture writes **4096 × 2880 desktop** and **2160 × 4674 portrait**
pixels directly. Requested frustum scales are 0.90 and 0.86 respectively, both
with centre 0.50. No bitmap is enlarged, cropped, warped, graded, redrawn or
composited. A separate CPU receipt measures each saved native PNG, leaving the
raw native `capture.json` unchanged.

| Current architectural derivative | Dimensions | Bytes | SHA256 |
| --- | --- | ---: | --- |
| `assets/xr/research-workspace.webp` | 4096 × 2880 | 3,715,044 | `d691463248ac34d7dd71c7f8211363f9dd51a46e55cfa22a90006d7e400b27da` |
| `assets/xr/research-workspace-mobile.webp` | 2160 × 4674 | 1,248,596 | `937e8d388a3b4156bc19671ad7d614bee12fbbe3c54d79e9669d9fbe67ef135e` |

Pillow 9.4.0/libwebp 1.2.0 lossless `exact=True` encoding preserves **every RGBA
byte across 21,892,320 native pixels**, including RGB under alpha zero. Desktop
contains 5,775,399 zero-alpha pixels with support `[445,469,3655,2468]`; portrait
contains 8,006,925 zero-alpha pixels with support `[136,1765,2026,2942]`. Both
have zero visible pixels on all four edges. Requested framing and measured
pixel support are separate public metadata fields; no unverified off-axis
placement is claimed.

For **each** final capture, all **4,204 original object IDs**, including hidden
objects, are read directly through native `FindId`, avoiding the default
visible-only enumerator. Sorted per-geometry DataCRC receipts have identical
before/after SHA256
`c7276283bd2b7f9d24ed378c630360ecac2b1c4a968add2c8f62a001913e8294`.
Native TV world vertices, quad topology, texture coordinates and material
assignment match the independently read original exactly. Its genuine source
orientation is retained, including natural perspective; no TV image is
flattened or replaced.

The current public workspace JSON SHA256 is
`d912d9a204f66df5380d9d2f00cc954a6484ee9da18a8bdf362095405a4ed8ec`.
At the native image handoff, the 61-pin release manifest changed only the two
workspace assets and retained its other 59 pins. The subsequent canonical-LF
portability correction also changes the OCR notice's byte pin while preserving
its complete text content. The final other 58 pins and all 21 unrelated XR
asset/provenance entries remain identical. Public metadata describes original room coverage, native
engine, actual camera, documented temporary lighting and source-shape proof;
private paths, object IDs and raw CAD stay outside the published snapshot.
Whole-page browser acceptance, same-artifact CI and deployment remain separate.

The current workspace JSON is **11,544 UTF-8 bytes with LF endings and no
CRLF**. Its earlier 11,874-byte CRLF serialization had SHA256
`3dc93f989315220e9598f23d0eee6039631559186faad0f547fca05453c7fc29`;
that is a pre-normalization checkpoint, with identical parsed JSON and image
pixels. The notice similarly changes from 1,882 CRLF bytes to **1,845 LF
bytes**, SHA256
`8676f6ac15567452d394a4576c41bb8a28eb37e8b14dabdcc973cbf91e60076b`,
with identical text lines. Git filtered and no-filter blob identities are
equal for each canonical source, confirming that `text/eol=lf` staging does not
invalidate the pinned byte hashes. The separate ignored
`native-room-lf-portability.json` records both serializations; original native
receipts remain unchanged.

## Earlier isolated-workspace checkpoint and acceptance boundary

The owner replaces the angled whole-workspace proposal with a frontal, level,
centred composition, taking the central axis, clear perspective and soft-light
principles of *The Grand Budapest Hotel*. Hide the foreground speaker columns
and cabinets that obscure the working area. Keep genuine source materials and
lighting in a rendered capture. The preceding transparent-background requirement
remains. Do not move or mirror source objects to manufacture symmetry.

The owner subsequently selects **Rhino 8 → `MCPStart` → Rhino MCP** as the
control route. Native process experiments below precede that correction and
are evidence, not a substitute for the selected workflow. The root has now
captured and visually reviewed a genuine transparent, material-based front view
in the selected interactive Rhino/MCP session. The two responsive native PNGs
replace the rejected angled stills through exact lossless WebP encoding and
synchronized source/asset pins. Source and raster checks below are complete;
built-page desktop/mobile composition, browser acceptance, CI and deployment
remain separate acceptance requirements.

## Actual team consultation

The source/art-direction agent studied the existing Geometry Engineer,
3D Artist, Scene Designer and Animation Cinematographer briefs, together with
the protected Bending composition/material ownership and the current XR source
record. The root integrator and XR interface agent independently reviewed the
actual candidate pixels and discussed the source/setup coverage, reading region,
camera and materials. These are actual agent consultations across the relevant
responsibilities; this is not a claim that twelve separate people approved
the new still.

The owner rejected the first three-quarter treatment after the initial team
review. The current central-axis instruction takes precedence over that earlier
choice and its desktop reading-space proposal. The root subsequently reviewed
the first native frontal image and accepted its **composition direction only**:
central working area, level front view, complete roof rig and reduced foreground
occlusion. Its wireframe appearance was explicitly rejected for final delivery.
The subsequent interactive MCP native Rendered candidate was independently
viewed by the root and source agent. The root accepted its front, level, central
composition with real materials and original colours. A tighter 0.92 framing
retains the complete rig, outer columns and right-side console. The source
objects' genuine asymmetry is retained.

The primary cinematography references are the [American Society of
Cinematographers' Robert Yeoman interview](https://theasc.com/article/yeoman-asc-awards-honoree/)
and [Yeoman's interview with The Credits](https://www.motionpictures.org/2014/12/2014-in-review-dp-robert-yeoman-on-the-grand-budapest-hotel/).
The soft, broad lighting and deliberate framing inform the editorial choice;
their application to the CAD scene is a design interpretation. No film still,
set, palette, prop or composition is copied into the public image.

## Read-only source and geometry coverage

The source is the owner-designated `only_interior.3dm` recorded in
[the XR source record](XR_PROJECT_INTEGRATION.md). Its identity remains
**1,285,082,734 bytes**, SHA256
`52a2c77039977c612afd05d1179410927cbe0a48b83439aa55ac98a9eaef666b`.
The complete native file contains **4,204 objects** and uses millimetres/Z-up.
It includes the room, capture rig, screens, working tables, furniture, tools,
people, digital studies, loose bamboo and assembled studies. The existing
interactive assembly GLB covers only its already verified assembled groups;
it is not misrepresented as the complete workspace and remains unchanged.

A fresh independent native-file inspection found authored/cached render-mesh
coverage for every selected surface object. The first cutaway selected
**4,013 original objects**, **19,559 mesh parts**, **29,944,777 vertices** and
**56,532,667 triangles**. The 191 excluded source objects are the explicit room
enclosure/floor cutaway, originally hidden objects and non-surface annotations.
No missing geometry was reconstructed, and no mesh was simplified. Full
source IDs, mesh ranges, original visibility, layers and native view records
remain in the ignored private receipts.

The isolated-workspace foreground change selected the original front row of the source
`speakers` layer, using its original object identities after verifying its
position in the source plan, plus the two identified foremost furniture
cabinets. That is **116 speaker-row objects + 2 cabinets = 118 objects**.
Side, rear, overhead and internal equipment remain. This removes 1,938 mesh
parts, 49,994 vertices and 59,612 triangles from the preceding capture selection.
The resulting isolated selection therefore contained **3,895 objects**, **17,621
mesh parts**, **29,894,783 vertices** and **56,473,055 triangles**. This is a
visibility selection, not a geometry crop, deformation, relocation or claim
of a different physical setup. Source IDs and the selection bounds remain
private; public metadata should describe the policy without publishing them.

Nine source meshes have authored vertex colours, covering **1,997,801
vertices**. A second source read independently recovered all original RGBA8
values. The preliminary Three capture cache's reversible sRGB8-to-linear-float32
conversion recovers every original channel, including alpha, exactly when
inverted and rounded to eight bits. The initial material-only candidates
omitted those colours and are explicitly incomplete source-colour evidence.
The native Rhino route reads the source's geometry, colours and material data
directly; it must not be described as the earlier Three conversion or as a
new stress, performance or live-tracking visualization.

Original source integrity was rechecked after the native experiments. Both
the D-drive original and the ignored local source copy retain the exact source
SHA256 above. Native changes concern the private in-memory capture document;
the original file is never saved. The normal site build receives only the
reviewed raster and sanitized metadata, never the 3DM, temporary geometry
buffers, absolute source paths or object-ID receipts.

## Frontal camera and native-render evidence

The earlier isolated-workspace native camera used source coordinates in
millimetres; the current architectural camera above moves farther back:

- Camera position: **(25, −20,000, 3,000)**.
- Target: **(25, 0, 3,000)**; direction **(0, 1, 0)**; up **(0, 0, 1)**.
- Perspective projection; zero roll/pitch/yaw relative to the source front
  axis. The source rig's central axis remains at the frame centre.
- Low-resolution trial: 1000 × 750 pixels, symmetric near-plane frustum
  left/right ±34.6666667, bottom/top ±26, near 100, far 100,000 millimetres.

The native engine is **Rhino 8.35.26251.13001**. The current source document
has zero global/view-specific object display-mode overrides. Its native
Rendered mode is `cae60bae-2d51-4299-abf7-a339fca86f3b`; diagnostics confirm
shading enabled, assigned materials enabled and surface/mesh/isocurve edges
disabled. An initialized mode description alone does not prove rendered pixels.

The ignored experiments retain the actual failures:

1. RhinoCore NoWindow/headless and Hidden/headless opened the native document
   and created a view, but ViewCapture and offscreen drawing returned null.
2. Hidden Rhino.Inside with an active private document reached native
   ViewCapture but terminated with an access violation. No successful image
   is claimed for that route.
3. An owned full Rhino.exe, launched hidden against the private source copy,
   produced a frontal capture. Its ordinary ViewCapture returned a stale
   wireframe image despite the Rendered mode property; its genuine alpha does
   not make it visually acceptable.
4. The full-native explicit
   `activeView.CaptureToBitmap(size, renderedDisplayMode)` overload produced
   real material-based frontal pixels: shaded equipment, wooden furniture,
   source people and source-coloured studies. This image is entirely opaque
   and is **not** a completed transparent deliverable.
5. The owner-selected interactive Rhino/MCP session opened the verified private
   working copy and established a warm Rendered viewport. An explicit-attribute
   trial with `FrameBufferFillMode.Transparent` produced an opaque RGB
   checkerboard, so it was rejected as alpha evidence. A real
   `new ViewCapture { TransparentBackground = true }.CaptureToBitmap(view)`
   then produced true alpha with the material-based surfaces intact.
6. The renderer's synthetic infinite ground plane initially left a shadow band
   touching both image edges. Disabling only
   `doc.RenderSettings.GroundPlane.Enabled` in the private in-memory document
   removed that band. The source floor was already part of the documented
   cutaway; no further source geometry, material, lighting or object placement
   changed. Neither a display-mode profile update nor a source save was used.

The final captures use the same native source-front camera above. Desktop is
2560 × 1800, requested frustum scale 0.92 and requested vertical centre 0.50;
mobile is 1440 × 3116, scale 0.84 and requested vertical centre 0.35. Native
capture does not prove that an off-axis view-window request survives its
internal projection handling. Therefore public provenance separates **requested
framing** from measured alpha support. The actual mobile support is
`[171,1094,1408,1976]`, approximately 35–63% of its image height; no postprocessing
has moved or cropped those pixels. Whole-page phone layout must be evaluated
against that actual image.

## Superseded isolated-raster checkpoint

Both native final PNGs contain true zero-alpha background, nonzero opaque and
antialiased pixels, and zero visible pixels on all four image edges. Pillow
9.4.0/libwebp 1.2.0 encodes them with lossless/exact WebP. Every decoded RGBA
byte matches its actual native PNG, including RGB values under alpha zero:
**9,095,040 pixels** across the pair. There is no resampling, crop, recolouring,
compositing, generated geometry or background erasure.

| Derivative | Dimensions | Bytes | SHA256 |
| --- | --- | ---: | --- |
| `assets/xr/research-workspace.webp` | 2560 × 1800 | 482,470 | `6a2b6f95b6c6d277011e3c3beed0a7e942b2ceea092eaea536d3d10c5e377be0` |
| `assets/xr/research-workspace-mobile.webp` | 1440 × 3116 | 241,668 | `54442daf21c6b96f8b023f546c484f4ef7fc822b63bf74d6d8329c6e632da304` |

Desktop native support is `[445,194,2327,1537]`; its 4,608,000 pixels include
3,585,254 zero-alpha pixels. Mobile's 4,487,040 pixels include 4,039,120
zero-alpha pixels. The checkpoint source record was `release/xr-workspace.json`,
SHA256 `ef20e9a8cc2f355419d7c9e5bcdca88871d249406fb6e62e5288389ab338d526`.
Its `render.nativeEngine` identifies the actual Rhino 8.35 native Rendered
viewport and owner-selected MCP route, not offline Rhino Render/Cycles or the
earlier Three experiment.

`release/manifest.json` retains 61 asset pins; all 59 unrelated pins remain
identical. `release/xr-assets.json` retains its other 21 asset and provenance
entries unchanged. Authorization records the latest frontal/rendered/MCP and
foreground-only visibility scope. No private absolute path, native object ID,
CAD buffer, working copy or standalone source bitmap appears in the public
workspace record.

The root owns the subsequent owner-selected Rhino/MCP session. No agent should
conflate its results with these earlier subprocesses, manipulate a user's
unrelated Rhino document, or report an engine/mode that was not actually used.

## Retained private receipts

All paths below are relative to the ignored
`animation-review/.local/xr-workspace-oct18/` directory:

- `source-inspection.json`, `conversion-private.json`: original visibility,
  source coverage and initial faithful mesh export.
- `coloured/colour-source-verification.json`: independent original RGBA8
  verification and unchanged source hashes.
- `candidates-capture.json`, `cutaway-capture.json`, `final/`,
  `final-coloured/`: earlier three-quarter proposals, retained without
  treating them as the owner's current accepted direction.
- `front-occluders-private.json`: the exact 118 foreground source objects.
- `native-front-exe/`: first native frontal wireframe capture and camera.
- `native-front-exe-v2/pipeline-diagnostic.json`: actual native display/pipeline
  state and zero source overrides.
- `native-front-exe-v2/front-native-rendered-explicit-mode.png`: actual native
  material-based front trial, SHA256
  `ed02f6075ef71957f65906dd8850b097e8fd5206eed0aeb8651e3975c84f22d5`;
  1000 × 750 pixels, 181,249 bytes, all 750,000 pixels opaque.
- `native-source-integrity.json`: post-experiment original/copy hash checks.
- `archive/capture-xr-workspace-rejected-three-quarter.mjs` and its receipt:
  the source agent's rejected, previously untracked Three capture tool,
  archived out of maintained scripts without changing its bytes.
- `archive/prepare-xr-workspace-historical-cpu-investigation.py` and its
  receipt: the source agent's previously untracked CPU cached-mesh exporter,
  retained only as historical source investigation. It does not generate the
  approved native room images, is not a maintained build/runtime tool and is
  excluded from the published snapshot. The source CAD remains private.
- `mcp-front-candidates/`: exact native MCP candidates and receipts, including
  opaque-checkerboard, genuine-alpha-with-ground-shadow and accepted transparent
  no-ground-plane trials. Rejected intermediate output is retained as evidence.
- `native-desktop-webp-verification.json`,
  `native-mobile-webp-verification.json`, `native-final-handoff.json`: final
  isolated-checkpoint PNG identities, decoded-RGBA equality and unrelated pins.
- `room-visibility-private.json`, `room-source-inventory-private.json`: current
  original room restoration/front opening selection, independently counted
  source meshes and exact source TV screen geometry/UV/material evidence.
- `mcp-front-candidates/front-room-desktop-4k-1792336288034/` and
  `mcp-front-candidates/front-room-mobile-4k-1792336387595/`: current native PNGs,
  untouched raw `capture.json`, separate CPU `capture-verified.json`, all-4,204
  geometry guards and native temporary-light cleanup receipts.
- `native-room-desktop-webp-verification.json`,
  `native-room-mobile-webp-verification.json`, `native-room-final-handoff.json`:
  current exact high-resolution RGBA equality and synchronized public pins.
- `rhino-close-verified.json`: authorized task-created application close,
  negative post-close Rhino window/listener checks and unchanged original/copy
  file hashes. Native capture receipts remain unmodified.

These receipts establish their stated source, native workflow, raster and pin
facts. Whole-page desktop/mobile composition, browser checks and same-artifact
deployment remain separate acceptance requirements.
