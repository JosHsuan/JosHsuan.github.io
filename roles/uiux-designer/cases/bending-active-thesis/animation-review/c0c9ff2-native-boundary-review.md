# Native observation boundaries — 4 November 2026

Candidate `c0c9ff2ff9a459e1e2c9dc8ff7a411835d8eec0c`, full run
[41768188956](https://github.com/JosHsuan/JosHsuan.github.io/actions/runs/41768188956),
finishes 627/630: Chromium 210/210, WebKit 209/210, mobile Chromium 208/210.
The required gate rejects it. Quality and both framework jobs pass. The complete
XR fallback journey and its WebKit 3/3 shard pass (59/59); this does not identify
the cause of the earlier target closure. This candidate is not deployed.

## Resource baseline belongs to native input

The mobile source click is trusted, hits the original `opening` source at
integer pixel [133,329], and correctly selects `bending`. Geometry, source
records, canvas identity and native document position remain intact. The failed
comparison is between an earlier host probe's density 0.65 and the final 0.5.
The actual pointerdown capture already reports 0.5 and three completed pressure
decisions. Pointerdown bubble immediately reports the existing inactive pressure
guard. The density change precedes input ownership; it is not evidence of a
resize during the gesture.

Trace timing places probe completion at 142087.185 ms and native click start at
142247.879 ms, a 160.694 ms protocol gap. The corrected observer preserves that
probe and adds exact budget/native-size/storage-write receipts to every native
pointer phase. It accepts a pre-input change only with the retained monotonic
pressure history, known density stages, matching decision timestamps, unchanged
policy inputs, bounded physical dimensions and exactly two storage writes per
new density decision. From pointerdown capture through release and settled
paint, budget, backing dimensions and write count must remain exactly equal.
The click is still issued once; no pressure floor, frozen clock or synthetic hit
is used.

## Phone clipping uses one coordinate space

The mobile XR tile receipt combines a transformed viewport AABB measuring
310.3146 × 308.1913 px with local image dimensions of 308 × 308 px. Its computed
1.1612 px centre error therefore mixes two coordinate spaces; the bottom rim
similarly becomes 7.8690 px during the ancestor's ongoing perspective motion.
Both complete source-phone rectangles are still inside the rounded mask.

The corrected audit projects the original [742,390]–[1262,906] source rectangle
through native object-fit, object-position, transform-origin and the image's
matrix into the actual clipping plane. It requires the original offset owners,
an untransformed absolute clip without unexpected padding/borders, and measures
all four native CSS insets. The same 0.6 px centring, 7.9–12.1 px inset and full
rounded-mask containment requirements remain. The actual viewport bounds and
ancestor matrix are retained separately as diagnostics. Motion is not disabled
or awaited into an artificial static presentation.

## Preserve the complete Special journey without redundant waits

WebKit reaches the final reverse-System screenshot after all fourteen recorded
journey rows, including original photos/captions, two model chapters, real native
simulation advancement, native Results/Credits and reverse model readiness.
The 60-second outer limit closes the test while that final PNG is being taken.
The preceding ten PNGs individually take roughly 1.2–2.6 seconds in the trace.
The final model assertions and complete screenshot are therefore not accepted.

The correction anchors the native wheel pointer at its existing blank margin
once per test rather than repeatedly issuing the same mouse move. Later clicks
either use that margin or follow the final wheel. Native wheel destinations,
all eleven screenshots, original byte hashes, dimensions, captions, overlap
checks, model counts, video advancement, reverse entry and one-lease checks
remain. Continuous playback is observed by its actual advancing clock rather
than an arbitrary eight-RAF wait. Both the 60-second test and 45-second readiness
limits are unchanged.

## Evidence and qualification

- Mobile source-click artifact `13294691190`, ZIP SHA-256
  `6ece6192ecac8662afac6c47db5f922331a7d55e55ea0ac10139e777e573a6cc`.
- Mobile projection artifact `13294776106`, ZIP SHA-256
  `eb39045b3bce70dd81270b11949902c34a75b24a6d82c323c31d6ddecffa5596`.
- WebKit Special artifact `13294463374`, ZIP SHA-256
  `10359dd8c8381e254c95febeed71bbe9c94b0531d8280c129a2d46a891c14ecc`.
- Candidate export digest
  `22215c52b1596f21da107811a9d1a2a52f40393d3cb0c31cbd25e9a69873462a`;
  all 147 approved and 137 protected original asset entries match.
- Local resource-boundary checks: 3/3 browser profiles in 45.7 seconds. Clipping
  checks: 3/3 in 12.8 seconds. Pinned Linux mobile checks: 2/2 in 30.0 seconds;
  the native click retains density 0.65 and six storage writes through all phases.
- The Windows Special/history/failure suite passes 8/9; its WebKit native-video
  stage does not settle. This is recorded separately from the Linux CI failure
  at the final screenshot and is not claimed as passing platform evidence.
- Pinned Linux WebKit Special/history/failure checks pass 3/3 in 1.2 minutes.
  The full original journey retains all eleven PNGs and fourteen recorded rows,
  including reverse-System model ownership with one acquisition and no disposal.
- Scoped lint, 162/162 CI contracts and the unchanged 630-identity / 40-file
  inventory pass. The complete fresh CI gate remains required.

No production code, approved asset, material, camera, scheduling owner, timeout,
retry count or test identity changes in these observer corrections.
