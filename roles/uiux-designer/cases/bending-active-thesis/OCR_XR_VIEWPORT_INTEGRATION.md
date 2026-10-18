# OCR identity and XR viewport integration

Date: 18 October 2026 (Europe/Berlin).
Status: implementation; browser, CI, publication and live acceptance pending.

This is the current contract for [decision 0015](../../../../docs/decisions/0015-ocr-identity-xr-workspace.md).
Earlier decisions and verification records retain their historical evidence.

## Identity and website typography

Home and About present the owner's exact two-sentence introduction:

> I am a computational designer and developer working at the intersection of design technology, digital fabrication, and spatial interaction. My work bridges the physical and digital through computational tools, interactive interfaces, and workflows that translate design and engineering information into fabrication-ready, machine-readable data.

Website theme copy and metadata reflect design technology, computational tools,
digital fabrication, spatial interaction and fabrication-ready data. Do not
infer new employment, clients, results or sole-authorship claims from that text.

All published website routes, including both project pages, use one actual OCR
family. OCR B's source is the Tsukurimashou OCR package; preserve original legal
notices, retrieval date, exact package/font hashes and documented project-named
derivatives. Titles, body, controls, generated diagram labels and any font-based
website canvas text use the family. Native documentary pixels and analytic
ASCII geometry retain their source identity. Typography may change hierarchy,
spacing and wrapping to remain readable; this does not authorize changing
Bending's models, material, lighting, camera or motion.

Verify actual loaded fonts and glyph coverage in all six published routes and
the published 404 document,
including mobile navigation, long reading paragraphs, contact addresses,
project labels, controls and library/SVG labels. Checking CSS declarations alone
does not establish that OCR glyphs were rendered. No private source paths or
font research tools enter the build.

## Shared project interface

XR reuses Bending's actual masthead, identity placement, primary navigation,
chapter rail, chapter-label treatment and floating-control material components.
Desktop uses the same right chapter rail; mobile uses its bottom navigation.
XR keeps its own chapter names, current chapter and native anchors. Navigation
remains usable without JavaScript and in Reduced Motion.

Only the XR Director owns XR's continuous interface/material updates. It shares
its existing scheduler with the existing information presenter and floating
material presenter; it does not start another RAF or take over the global field
or Bending's Director. Pointer/key controls operate only on the actually painted
interactive source and respect native reading and focus.

## Full viewport, opening and Context

The XR page no longer displays its old opening main-visual photograph. Its
model-free introduction remains native text over the shared background. The
independent project-card visual remains approved and unchanged.

Context replaces the isolated woven-assembly background with a native capture
of the complete original working scene and its architectural setting. Geometry,
equipment and their spatial relationships must be traceable to the source CAD
file. Review actual camera alternatives with the geometry, 3D-art,
cinematography and UI responsibilities. Preserve the room behind and beside the
setup; remove only documented front-facing obstructions. Pixels outside this
architectural subject retain real alpha transparency. Do not use generated
replacement geometry or publish original CAD documents, object IDs, private
paths or bitmap links. Verify actual alpha pixels, complete setup framing and
desktop/mobile reading clearance in the built artifact.

The owner rejected the first elevated three-quarter candidate. The accepted
direction is a level frontal camera with a central composition and a single
vanishing point, informed by *The Grand Budapest Hotel*. Hide only the identified
foreground speaker columns and cabinets that obstruct the working area. Keep
the other original object transforms, equipment, people and working relationships
unchanged; camera symmetry does not authorize rearranging the source scene.
Capture rendered materials and lighting, preferably through Rhino's native
Rendered viewport when available. Identify the actual engine in the provenance
record; a physical Three.js render must not be described as a native Rhino
Rendered capture. Retain the rejected candidates as private historical evidence,
never as the final accepted raster.

The latest review also restores the architectural room background. The previous
isolated workspace cutout is a checkpoint, not the final scene. Restore source
background and side walls, real floor, carpet, ceiling and room fittings. Exclude
only the documented front facade or equipment that blocks the frontal view.
Prepare genuine high-resolution native output, with rendering quality suited to
the shared field and glass materials. Improve materials, light and colour without
moving, stretching or regenerating structural geometry or the TV image/UV layout.
Use the existing owner-selected Rhino 8/MCP session; do not install another CAD
bridge. Close the task-created Rhino process after its final captures, without
saving over source documents. Retain actual output dimensions, RGBA evidence,
visibility decisions and capture-engine provenance.

The background layer occupies the full dynamic viewport, with a `vh` fallback.
Later interactive 3D and all
three recorded phone chapters retain one transparent renderer whose DOM box is
the complete viewport, with no cropped camera subfrustum masquerading as full
screen. Camera composition can reserve readable information space while the
renderer remains full screen. Keep explicit mobile/desktop drawing-buffer
budgets, original geometry/material/source pins, real phone body/screen draws,
native media duration/time and Pause/Play continuity.

Context image decode/paint readiness, 3D first paint, finite entry/exit,
replacement, rapid reversal, hidden/resume, policy, HTTP/GPU failure and disposal
have explicit terminal ownership. Context must not briefly reveal the old woven
model while its new image prepares or fails. The original 15-second site-entry
and existing browser scenario deadlines are not silently extended to hide
regressions. No per-frame React state or second media clock is introduced.

## Acceptance and publication

Use Node 24.19.0, pnpm 11.19.0 and the frozen committed lockfile. The public build
allowlist contains only approved application modules, fonts and scene/image
derivatives. Existing original asset bytes remain pinned; additions and the
owner's introduction have updated approved hashes. Preserve the empty framework
and generated-entry ownership.

Run `pnpm check` for the architecture integration, relevant browser checks on
the actual exported artifact, then the existing exact-commit CI gate. Verify
all six published routes and both projects across the browser matrix; record
skips and unavailable physical devices accurately. Full-viewport rectangles,
actual font usage, image alpha/source framing, real model hits, native recordings
and interrupted lifecycle behavior require direct evidence.

Publish only the same validated CI artifact through the existing workflow, then
compare live routes/assets and native video ranges, exercise desktop/mobile
behavior and capture real live screenshots. The owner's authorization includes
commit, push and deployment through completion. No implementation checkpoint,
source fixture or historical passing receipt establishes completed publication.
