# Project background motion integration

Date: 19 October 2026 (Europe/Berlin).

Status: implemented; local validation and CI/live acceptance are recorded separately below.
The owner authorizes the complete implementation and CI-gated publication.
The preceding public product is `7ccff6d6bdc89cd8574023e23ea2f1848ff1716b`;
its source and accepted visual limits remain in the
[six-study record](SIX_PROJECT_STUDIES_INTEGRATION.md).

## Team review and actual gap

Four collaborating groups cover all twelve existing responsibilities. They are
role assignments, not twelve independent people. The visual group inspected the
twelve accepted desktop/mobile contact sheets representing 72 chapters. The
runtime and source groups read the actual Bending/XR ownership and motion code;
the source group inspected targeted native media, deck text and sampled pixels.
Role-local MCP services were not exposed in this task; source contracts and
pinned built-artifact browser tooling supply the review evidence instead.

| Group | Role | Finding / adopted responsibility |
| --- | --- | --- |
| Visual | UIUX Designer | Hard-switched photos break continuity. Keep native reading immediate and make captions independent of long prose. |
| Visual | 3D Artist | Preserve all five source geometries, authored UVs and accepted display materials; move the whole visual surface. |
| Visual | Lighting Designer | Keep the accepted key/fill/rim and PMREM recipes; do not brighten glass or grade documentary pixels. |
| Visual | Scene Designer | Compose full source frames in the unboxed background with an unobstructed mobile source-first interval. |
| Runtime | Software Architect / Runtime Engineer | One backdrop transaction owns displayed source and timed visibility; the existing model actor owns resource/camera/inspection. |
| Runtime | Browser / GPU Performance Engineer | Borrow the existing demand scheduler; one active native movie, no second animation loop or per-frame React state. |
| Runtime | Motion Designer | Reuse actual 1.1-second entry / 0.95-second exit and quintic passages, with reversal and latest-request closure. |
| Runtime | 3D Animation Designer | Use authentic sequences and native video time; do not invent assembly movement or deform source geometry. |
| Source | Geometry Engineer | Original media stay read-only, all GLB pins remain exact, GIF members match their native deck bytes, and no restricted Caschlatsch CAD enters the handoff. |
| Source | Information Designer | Label real footage, path studies and assembly simulation distinctly; preserve credits and every original static figure. |
| Source | Animation Cinematographer | Retain full source framing, orientation, frame order and timing; no scroll scrubbing or automatic chapter advance when a movie ends. |
| Integration | Interactive Experience Director | Coordinate source preparation, exit/entry, native captions, cancellation and rendered acceptance as one readable story. |

The model stage already has Bending-derived spatial passages. The missing
behavior is `ProjectCaseStudyControls` immediately toggling fixed documentary
figure visibility. The implementation transfers that timed visibility to the
project backdrop owner, rather than adding another model motion controller.

## Agreed presentation and lifetime

- Native chapter selection updates the text/navigation immediately. A finite
  source transaction exits the displayed visual before preparing and entering
  the latest requested visual. Actual image decode, native video-frame readiness
  or successful original-model paint gates entry.
- Use Bending/XR's existing durations, quintic interpolation and directional
  outside poses. Source pixels stay unwarped; the whole surface translates and
  fades. Source image/video aspect is preserved with `contain`.
- Retaining the same source for Credits does not replay a new passage. Rapid
  jumps and reversal close superseded requests and begin from the displayed pose.
- One ordinary-page background lease and its existing active-seconds scheduler
  remain. The source renderer retains its sole camera writer and unchanged
  geometry/material/light recipes. Native video owns its own media time.
- Chapter movies play only when eligible. Pause, hidden documents and BFCache
  suspend playback and callbacks while retaining useful time/resources. True
  departure clears owned callbacks, listeners and native movie sources.
- Reduced Motion and Save Data use pinned stills without automatic movie
  requests. Failure or rejected native playback has an explicit poster terminal;
  it must not leave a pending loader or introduce an unsolicited late upgrade.
- A finite source ends on its last frame without moving the document. Explicit
  replay is available. GIF repeat semantics are recorded separately from the
  presentation choice to repeat a normal source movie.
- Short captions, credits and full-source links occupy their own standard-glass
  native surfaces. Original static images remain directly available in HTML,
  including those displaced by a movie. No-JavaScript reading retains sources
  and direct animation links.

## Selected authentic motion

| Project / chapter | Source meaning | Limits |
| --- | --- | --- |
| Mode/s / Making | Original rotary-cutting prototype footage | Preserve native 1280 × 720; filename does not establish a new project date. |
| Entrance / Results | Completed column's night illumination | Preserve native 540 × 960 portrait framing and existing employer/team attribution. |
| Dot / Making | Original close-up nozzle-deposition GIF from slide 10 | Restore all 27 frames and variable delays, rather than the existing frame-zero-only display. |
| Caustics / Making | Original slide-14 robotic printing-path GIF | Restore all 31 frames; not an optical-caustics result, successful physical print or proof of the selected GLB's identical printed identity. |
| Special / Making | Original robot-assembly simulation | Preserve all 108 frames, source framing and finite GIF semantics; not physical collision-safety evidence. |
| Caschlatsch | Existing public ETH photographs | No reviewed public motion was selected; do not manufacture animation or publish restricted project material. |

Source processing uses silent faststart H264 derivatives, full source frames,
native timestamps and no upscale/trim/retiming. A one-pixel encoding pad may
accommodate an odd dimension; it must not rescale or crop source content.
Original source and output hashes, native GIF frame delays, final-frame duration,
codec/range conversion and poster-frame selection require explicit receipts.
Audio/private metadata are omitted. Owner-selected publication does not imply
an open reuse licence or identify an unknown camera operator.

## Acceptance requirements

Verify the built artifact with native forward/reverse/jump scrolling, images
through model/video boundaries, actual moving decoded frames, source end/replay,
pause/resume, reduced/data policies, failure, hidden/BFCache and departure. Check
desktop, WebKit and mobile Chromium, source-first composition and caption contrast.
Inspect intermediates as well as held frames. Verify original source pins and
protected Bending/XR behavior, loader name count/home link, exact artifact digest,
successful CI gate, same-artifact deployment and public bytes/native presentation.
Record unavailable device checks and every failed attempt without relabelling it.

Initial private role/source receipts are retained under
`animation-review/.local/newcase-transitions`. They are not public source assets
and do not substitute for final built-browser or live acceptance.

## Implemented source and event boundaries

`ProjectStudyBackdropPresenter` is the production surface owner for all six
studies. `ProjectStudyBackdropMotion` borrows the existing Director durations;
the model presenter receives the external stage and retains source painting,
camera intent and gestures. Original model geometry, appearance, light and
camera recipe files are unchanged. The generic loader retains one owner-name
heading and its home link; Bending's delegated custom loader is unchanged.

The previous 109 asset pins remain exact. Five movies and three native-frame
posters bring the release to 117 pins, 44 unique WebPs, 42 original chapter image
uses plus five motion-poster uses, and five unchanged GLBs. Mode/s and Entrance
use silent faststart remuxes of the original H264 samples: encoded packets,
avcC, PTS/DTS, all durations, range and identity track matrices match the source.
The three GIF derivatives retain every native frame and delay, including the
final delay. Caustics adds one white pixel on the right; Special adds one on the
bottom. No original content is cropped, retimed, interpolated, enlarged or
geometrically deformed. GIF H264 encoding is lossy; pixel-byte equality is not
claimed. Dot/Caustics reuse their exact earlier selected posters.

Review found and repaired three actual readiness gaps: unbounded image/decode
waiting, a same-source chapter checking a different record from the rendered
record, and unbounded static model-poster waiting after startup fallback.
Only an actually requested source starts its 15-second preparation deadline;
hidden/BFCache suspension retains the remaining budget. Failure latches reject
late load/decode/handle upgrades and close the real source request. A decoded
native `loadeddata` frame with nonzero dimensions can prepare hidden video;
an optional visible `requestVideoFrameCallback` records compositor submission
separately. Neither a timer nor native play acceptance manufactures readiness.
Long diagnostic histories evict complete transactions, preserving paired facts.

## Local verification checkpoint — 19 October 2026

- Exact Node 24.19.0 / pnpm 11.19.0, committed dependencies and lockfile retained.
  `pnpm check` passes with the empty framework; the public build/audit verifies
  117 approved assets and observes 241 local output files. CI output count must
  be measured independently.
- The final broad portable run has 497 cases: 495 pass, zero fail and two opt-in
  browser probes skipped (`OPTICAL_BROWSER` and `DIAGRAM_BROWSER`). Those two
  are not CPU passes. Source schemas and actual MP4 tables additionally reject
  substituted sources, dropped frames, incorrect durations, external references,
  truncation and unapproved pixel changes.
- Initial Chromium and subsequent mobile Chromium each pass all ten new native
  scenarios, including all five actual recordings, trusted finite end/replay,
  media pause, real departure and failure deadlines. A fresh complete inventory
  lists 124 cases per profile / 372 public executions; this is an inventory,
  not a completed full-run result.
- The first Windows WebKit attempt is incomplete: four failures were observed
  before diagnosis stopped it. An isolated visible-video probe rejects a new
  remux, a new TV-range derivative and the previously accepted XR control with
  native `NotSupportedError` / media error 4. This does not identify source range
  as the cause and does not justify retranscoding. Windows WebKit media acceptance
  is unavailable here; native Linux WebKit CI remains mandatory. Playwright
  documents [platform-dependent media codec availability](https://playwright.dev/docs/browsers#webkit).
- The initial rapid-interruption fixture allowed optical pointer actionability
  to wait until the old request had completed. Native keyboard activation now
  creates the intended interruption; pointer-driven forward/reverse passages
  remain covered. Windows WebKit passes both the corrected passage scenario
  and Reduced Motion/Save Data scenario. No media assertion or release engine
  is skipped or weakened. The first traces were inspected but cleared by the
  next Playwright invocation before archival; the retained account explicitly
  distinguishes tool observations from unavailable original trace bytes.
- The first existing Home/source run passes 28 of 29 checks. Mode/s' Results
  label intrudes below the fixed masthead during information-window motion.
  Its raw trace remains retained. New-study anchor clearance increases from
  8 to 10 rem on desktop and 11.5 to 13.5 rem on mobile; the original clearance
  assertion is unchanged. Replacement source navigation and final captures
  follow this repair. No Bending/XR margin is changed.

The replacement source-navigation run passes all twelve cases: the complete six
study journeys on Chromium and mobile Chromium, including the unchanged masthead
clearance assertion. Final high-resolution native capture, full Linux CI and
publication remain pending at this candidate checkpoint.

The [DORA CI plan](../../../../docs/CI_DELIVERY_PLAN.md) remains a separate
planning record. This feature retains the existing complete acceptance union,
one-worker GPU isolation and exact-SHA, same-artifact publication gate. No new
smoke stage, duration partition or CI workflow optimization is claimed here.
