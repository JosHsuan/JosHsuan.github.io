# XR recorded-screen quality review

Date: 3 November 2026. Status: renderer, media and public handoff implemented;
five serial Chromium checks pass on integrated Pages artifact `ab5d1d…`.
Current release: the [4 November full qualification and publication](CONTINUOUS_MOTION_RELEASE_20261104.md) includes all three browser profiles and independent live reconciliation. The local preparation evidence below remains distinct from that final release.

The owner asks for the three Motion Capture phone demonstrations to remain clear
on desktop and other viewport sizes. The investigation found two independent
losses: the phone renderer allocated only 393,216 physical pixels across the
complete viewport, and the published videos came from reduced, palette-limited
GIFs encoded at CRF 32. The original recordings contain 888 × 1920 pixels.

## Renderer change

The phone-only allocation now uses the existing 1,600,000-pixel product ceiling.
The 190,320-triangle research assembly retains its 524,288-pixel budget. The phone
has only a casing, screen and the existing bounded environment; it still draws on
native decoded-frame callbacks, with no additional clock or per-frame React state.
Video uses explicit linear filtering, at most 4× anisotropy, no mipmap rebuild and
no screen tone mapping. Source geometry, camera framing and native media time are
unchanged by this renderer change.

At 1920 × 1080 and 3840 × 2160, the capped buffer is 1686 × 948 at device DPR 2;
the composed recorded screen has approximately 604 vertical samples, versus
approximately 300 under the former allocation. At 1440 × 1000 the screen has
approximately 672 samples. This is a geometrically measured sampling improvement,
not full source-resolution rendering, a frame-rate benchmark or physical-device
acceptance. The approximately fourfold buffer-area increase applies only to this
cheap recorded-screen scene and remains inside the existing product ceiling.

Exact Node 24.19.0 passed 27 tests across `xr-stage-camera.test.mjs`,
`xr-scroll-camera-renderer.test.mjs`, `xr-stage-source-continuity.test.mjs` and
`xr-source-handoff.test.mjs`, including complete source framing, at least
600 desktop/4K screen samples, native phone frame invalidation, unchanged camera
fit reuse, source mesh preservation and disposal. Integrated Chromium checks
confirm actual decode, resize and retained chapter reversal. Desktop captures
retain readable phone interface details within the bounded rendering allocation.

## Full-resolution source preparation

The original `T3_documentation.prproj` contains the named Adapt, Assemble and Join
edits. Its nested clip in/out points and authored speed factors resolve to the
original XWBU4246, AHQU8330 and HASC0659 screen recordings. Their native 888 × 1920
frames avoid both the GIF downsampling and its palette/dither loss. The source
files and Premiere project were read only, hashed and rehashed after conversion.

| Demonstration | Previous delivered size | Candidate size | Frames / delivered duration | Candidate video bytes | Mean compression SSIM |
| --- | --- | --- | --- | ---: | ---: |
| Adapt | 666 × 1440 | 888 × 1920 | 130 / 13.00 s | 1,491,566 | 0.992338 |
| Assemble | 534 × 1152 | 888 × 1920 | 312 / 24.96 s | 9,515,706 | 0.982637 |
| Join | 666 × 1440 | 888 × 1920 | 203 / 20.30 s | 5,502,261 | 0.988456 |

Candidates use free local FFmpeg 7.1/libx264, CRF 26, slow preset, High 4.0,
BT.709 limited-range YUV420P, two-second keyframe intervals, silent faststart and
removed metadata. There is no upscale, crop, generated interpolation or new
authored action. The full-resolution recordings reconstruct the existing selected
actions and authored speed; their variable-rate decode/frame selection is **not
claimed pixel-identical to the GIF exports**. Counts and delivered durations match
the existing public sequences exactly. Source timing is owned by native video,
independently of scroll-driven scene presentation.

The container validator read every MP4 table, confirmed one self-contained silent
H264 track and exact dimensions/counts/durations. All 645 output frames decoded.
Compression SSIM compares every encoded frame with the same native-resolution
source edit immediately before compression, with both inputs using an identical
timebase. It does not measure similarity to the old GIF. Separate low-resolution
all-frame GIF comparisons and inspected source/candidate frames establish action
correspondence, not byte equality. Lossless WebP posters equal their first decoded
candidate video frame in RGB.

Exact source/output hashes, intervals, quality metrics and limits are in
[`animation-review/xr-phone-quality-20261103.json`](animation-review/xr-phone-quality-20261103.json).
The six candidate files and private preparation scripts are staged under the
ignored `animation-review/.local/xr-phone-quality-20261103/` directory. No source
recording, raw project document or private absolute path is a browser input.

The six selected `*-interface-hd.mp4` and `*-poster-hd.webp` files now enter through
the existing release allowlist, with updated phone records and provenance pins.
Portable validation retains the historical GIF byte/dimension checks and adds
independently pinned full-resolution source, codec, dimensions, timing and handoff
checks. Built-audit markers and browser media-interception paths select the new
files; the browser journey also checks actual decoded 888 × 1920 dimensions.
The integrated serial Chromium subset passed 5/5 in 2.2 minutes without extending
test deadlines. It verified native 888 × 1920 decode for all three videos, expected
13.00/24.96/20.30-second durations, continuous native time, no media/page errors,
one canvas, delayed retained-frame replacement and reverse chapter transitions.
Reduced-motion and save-data preferences retain the same active renderer and
recording; actual suspension and source failures remain explicit lifecycle states.
The 1440- and 320-pixel-wide camera captures and lifecycle evidence are retained
under `pages-test-results/media-quality-final`.

Old public derivatives and their historical pins remain unchanged. The larger
transfer is an intentional fidelity tradeoff, with one active chapter recording
loaded at a time. Final CI/publication checks and physical-device throughput remain
outstanding; local Chromium acceptance does not establish those results.
