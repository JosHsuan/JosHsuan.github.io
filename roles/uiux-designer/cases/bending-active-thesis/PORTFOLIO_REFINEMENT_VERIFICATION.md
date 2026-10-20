# Portfolio refinement verification

Date: 20 October 2026. Status: local implementation and acceptance in progress;
no new CI, deployment or live acceptance is claimed here yet.

[Decision 0019](../../../../docs/decisions/0019-portfolio-refinement-and-runtime.md)
and the [integration contract](PORTFOLIO_REFINEMENT_INTEGRATION.md) define the
six-part scope. The preceding published application is `7ff67ce`; its successful
release is a comparison baseline, not acceptance of this revision.

## Source and media

Caschlatsch now uses ten reviewed derivatives of the original portfolio PDF.
Five photographs preserve embedded source RGB pixels; five technical plates
retain their reviewed 300-dpi page-raster crops without post-raster resizing,
redrawing or invented detail. The module-infill plate is explicitly the upper
schematic detail of Fig. 2-05, including all labels within that detail; its lower
module group and original caption are outside the extract. Public captions and
provenance describe this limit. Existing team credits remain separate from
source-publication credit. The seven earlier Caschlatsch assets remain byte-pinned
historical files and have no active project placement.

| Mode/s web derivative | Selected source interval | Output | Bytes |
| --- | --- | --- | --- |
| Physical cutting from RELAX.mov | Frames [90,330), real operation | 8.008 s, native 1920×1080 | 3,167,168 |
| Black-background prototype cutting | Frames [150,350), real operation | 8.000 s, native 1920×1080 | 3,176,212 |
| Machine simulation | All 120 source presentation frames | 4.800 s, proportional 4096×2304 → 1920×1080 | 498,303 |

The three silent, fast-start H.264 MP4 derivatives total **6,841,683 bytes**,
compared with the previous 123,125,597 bytes. Provenance explicitly records
intentional trimming/compression and the simulation's proportional downsample.
All 560 output-frame relative presentation timestamps and durations were checked
against the selected original intervals; compressed/decoded pixels are not
claimed lossless. Original footage, PDF, existing posters and five model files
remain unchanged. The 138 public pins comprise 125 unchanged preceding pins,
three authorized video replacements and ten new Caschlatsch images.

The independent media audit `media-peer-audit.json` has SHA-256
`f0e4df490ec90faa362fbd23e4ce1e4b101de7dc564c1bcb59b9562b6da00095`.
The broader source/code/document audit `refactor-release-source-audit.json` has
SHA-256 `f8cb0ad106b854619f0d77417b1760299aa74982490cb345f88b1a2f8d1f2fa8`.
Both are ignored local receipts under
`animation-review/.local/portfolio-refactor-20261020/`, not public build inputs.
Their conclusions are limited to their actual source/media review.

## Implemented design and runtime

All [twelve existing roles](PORTFOLIO_REFINEMENT_TEAM_REVIEW.md) independently
reviewed or implemented their allocated work. The six generic studies now use
source-sensitive opening, model, recording, documentary and closing compositions;
portrait/wide sources, technical plates and long reading receive distinct space.
The 799/800px DOM breakpoint matches the protected renderer projection. Inspection
has real ready/inspecting/returning/paused/static states, visible guidance and a
native Return control; source links and editable targets retain native keys.
Credits use the same safe entry top as other reading. Selected mouse-hover rail
labels are suppressed on generic pages to keep clicked source drawings clear;
keyboard focus and other destination hints remain available.

One `ProjectStudyChapterPresenter`, owned by `SiteBackgroundDriver`, now caches
fractional native chapter anchors on existing layout invalidation and publishes
chapter intent, rail and counter before source presentation on the same demand
frame. Markup controls no longer run a separate scroll/IntersectionObserver scan
or mirror pause in React state. Scoped pause handling publishes its truthful
label/ARIA synchronously and deduplicates external observation. Source
transactions, native video time, model/camera/material/light recipes, field
algorithms and established owner-specific clocks are unchanged. This does not
claim a single global RAF for XR and every other independent property domain.

The root [README](../../../../README.md) now describes the two real applications,
source/public-data boundaries, runtime and deployment flow, exact toolchain,
commands, reference architecture and evidence limits. Planning documents and
the reusable empty framework remain intact.

## Local evidence checkpoint

- Exact Node 24.19.0 / pnpm 11.19.0: `pnpm check` passed, including 45 CI-contract
  tests and the audited empty framework export.
- Public build passed: 261 output files, 138 approved assets, no private inputs.
- Portable case/tool suite: 525 tests, 523 passed, two skipped, zero failures.
- Explicit scoped ESLint over all 15 changed/new JavaScript/test files passed.
- Initial native captures: all eight routes, desktop and mobile, 108 unchanged
  viewport PNGs, no loading/state errors. The Director independently inspected
  20 originals across all six generic studies. This supported the direction and
  identified the credit/selected-hover fixes; it was not final visual closure.
- Dot's initial post-refactor native smoke passed drag, arrows, Home/Escape,
  Tab-to-Return/Enter and source-key behavior plus 799/800px apertures in three
  contexts. The full reading/interaction and regression work remains separate.

These local exports were built from an **uncommitted working tree** based on
`9add8195db77090027f37b163146cc65b7dda042`. Their `release.commit` is that base HEAD,
not proof that their changed code equals that commit. Frozen exports, native
facts, source hashes and an output inventory are retained locally. Final release
acceptance must bind the resulting actual commit and downloaded CI artifact.

## Performance evidence and limits

The before profile completed all eight routes at desktop/mobile. Six generic
pages made 1,134 / 1,054 chapter-rectangle reads during paired forward/reverse
journeys. Desktop rectangle work was only 2.3–7.6 ms per journey pair; eliminating
duplicate ownership cannot honestly explain seconds-long native stalls.
All six generic paused three-second intervals had zero controller, layout,
style, DOM-mutation or media-operation work.

CPU/trace diagnostics identified native Canvas 2D `drawImage` in the unchanged
decorative field as the regular callback cost on this software-rendered host.
SystemInfo reported SwiftShader and software canvas/compositing/rasterization;
HC3DP also had approximately five-second native transition stalls outside the
measured application JS callbacks. These remain an explicit lab limitation.
A bounded immutable-atlas experiment matched all 20 full-RGBA pairs but saved
only approximately 0.9 ms desktop / 0.17 ms mobile in two isolated blocks per
source. It was rejected because the extra resource/async lifetime was not justified.
The renderer and effect therefore remain unchanged. A full-Chromium diagnostic
could not launch; there is no accelerated-hardware acceptance claim.

The [performance review](PORTFOLIO_PERFORMANCE_REFINEMENT_REVIEW.md) records raw
receipt hashes and attribution. Headless hidden-tab attempts that stayed visible
are reported as such. The first profiler's early pagehide observation was
unreliable; the late-listener lifecycle diagnostic separately proved actual
nonpersisted Mode/s cleanup and history re-entry. Neither lab Event Timing nor
browser mobile emulation establishes field INP, physical-device stability or a
real persisted BFCache restoration.

## Remaining acceptance

Complete current reading/interaction/visual acceptance, protected Bending/XR
comparison, paired after measurements, updated maintained browser tests,
exact-commit CI execution coverage, same-artifact deployment and live verification
are still required. No preceding release counts substitute for those results.
