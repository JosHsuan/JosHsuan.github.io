# Dot-Based 3D Printing: native-timing web delivery

## Scope and source

This delivery candidate re-encodes the existing public `printing-process-motion.mp4` into the separate `printing-process-motion-web.mp4`. The previous MP4 remains unchanged. The recording depicts actual nozzle deposition; no new geometry, footage, motion, or empirical result is synthesized.

The input is **already a lossy public MP4 derivative**, not the original GIF. The inherited provenance remains `image61.gif` from slide 10 of the recorded Group1 presentation. Original GIF and container identity, hashes, credits and rights remain in `project-assets.json`; this trial does not independently reverify those source files. Quality measurements below compare decoded pixels against the previous public MP4 only.

## Candidate and tradeoff

| Encoding | Bytes | Reduction from previous MP4 | All-frame SSIM mean |
| --- | ---: | ---: | ---: |
| Previous public MP4 | 24,383,755 | — | Reference |
| CRF 20 trial | 17,652,424 | 27.60% | 0.977019 |
| **CRF 22 candidate** | **13,211,595** | **45.82%** | **0.963079** |
| CRF 24 trial | 8,929,953 | 63.38% | 0.944286 |

CRF 22 is the intermediate delivery choice. Side-by-side inspection of frame 13 compared the full composition at 600 px width and a native-pixel 600 × 500 nozzle/deposition crop. Contact, deposited bead forms and highlights remain legible, with modest texture softening. CRF 24 softened fine texture more visibly; CRF 20 was more conservative but saved less. These are lossy derivatives, not pixel-identical replacements. The source's existing GIF quantization is not newly recovered detail.

The size reduction concerns the **active encoded video payload** only. It is not evidence of faster startup, higher FPS, or lower decoding cost. Retaining the previous MP4 and adding a delivery file increases total published artifact storage.

## Exact timing and processing

- Native 2500 × 1304 geometry; no crop, resize, trim, interpolation or retiming.
- All 27 presentation timestamps and all 27 presentation durations match exactly as rational seconds, including absolute origin zero.
- Duration 4.400 seconds; first frame 0.160 seconds; last frame 0.130 seconds.
- H.264 High / yuv420p; output timescale 12800. Color tags remain unspecified, as on the input. No creative grading.
- Existing source-informed loop policy is unchanged. This work does not add chapter advancement on video end.

Reproduction from the preserved public input:

```sh
ffmpeg -hide_banner -loglevel error -i printing-process-motion.mp4 \
  -map 0:v:0 -an -map_metadata -1 -c:v libx264 -preset slow -crf 22 \
  -pix_fmt yuv420p -fps_mode passthrough -enc_time_base 1:12800 \
  -video_track_timescale 12800 -movflags +faststart \
  printing-process-motion-web.mp4
```

## Receipt and validation boundary

`release/dot-web-delivery.json` records exact input/output hashes and bytes, the full rational presentation/duration timeline, tool version, command, inherited provenance chain, all 27 per-frame SSIM values and raw SSIM-statistics hash. Mean SSIM is 0.963079; minimum is 0.954977. These metrics are a comparison aid, not a perceptual-quality guarantee.

FFmpeg decoded all candidate frames successfully. At this media handoff, native-browser playback/loop behavior, registry integration, build validation and publication remain separate integration checks. This document does not claim they have passed or that the candidate is deployed.

Integration source checks: the delivery registry selects only the new Dot URL and pins both old and new bytes; the other six motion sources are unchanged. Actual MP4 composition/edit tables independently reproduce every native VFR display interval for both files. The portable suite passes 584 tests with 2 intentional skips; the public build audits 137 approved assets. Browser inventory includes a genuine native-loop observation and retained playback video/PNG in all three engines. Those browser results remain pending until exact-commit CI; source checks are not a browser or physical-device performance certification.
