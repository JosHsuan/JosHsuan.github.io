# Native fallback qualification — 4 November 2026

Full candidate `d83826f6eab1eca2328e859435c06e4b919655da`, run
[41764327975](https://github.com/JosHsuan/JosHsuan.github.io/actions/runs/41764327975),
completed 629/630 browser identities: Chromium 210/210, mobile Chromium 210/210,
and Linux WebKit 209/210. Both framework variants passed (24 checks), quality
passed (714 tests, two existing intentional skips), and source tooling passed
9/9. The required gate rejected this candidate; it was not deployed.

The former Bending native source-pixel and retained reading-owner failures both
pass in this run, including the final forced-colors PNG and native focus audit.

## Unexplained native target closure

The WebKit fallback journey loses its target while awaiting Adapt's settled
native-video presentation, before the second context or deliberate context loss
exists. The wait starts at monotonic 857630.019 ms and ends at 896591.610 ms with
`Target page, context or browser has been closed`. The approximately 41.5-second
test duration is below its unchanged 60-second limit; the wait itself also ends
before its 45-second limit. This is not evidence for extending either limit.

The preceding poster/entry assertions pass. There is no explicit crash event,
decoder error, OOM evidence or explanatory process exit in the retained trace.
The cause therefore remains unclassified. No product fix is claimed from this
record, and the closed page is never counted as a passing fallback.

Evidence retained locally:

- Review artifact `13293081400`, ZIP SHA-256
  `acb5201a4ba98dc6392bd63433e3b0f18fd965a4fe535a7ff491afc2c377e291`.
- Environment artifact `13293181144`, ZIP SHA-256
  `ca97c331da7817b8a22b9cdff436a422ee6445b0885c771267aea66c71c1ad2a`.
- Complete export digest
  `63ecf6660da3151a5c53fd4017c4e1f788de48340e02e1cf466548e6133c2758`;
  independent checks preserve 147 approved and 137 protected original assets.

## Reproduction and observation

The unmodified journey passes once in 40.8 seconds against that exact export in
the same pinned Ubuntu image and WebKit 26.6/revision 2359, with Node 24.19.0,
pnpm 11.19.0, the frozen lockfile, nonroot `pwuser`, a 1 GiB shared-memory mount,
and the existing native playbin3 setting. The local container has a 4 CPU / 6 GiB
limit; its host/kernel and performance are not claimed to match GitHub's runner.
This isolated pass cannot explain or replace the failed full run.

The subsequent candidate adds observation only:

- The existing bounded native-media event observer now covers both fallback
  documents and records native page closure as well as crash/disconnection.
- The separately created context's receipt is attached after its actual close;
  all diagnostic listeners are then removed. Native playback and genuine GPU
  context-loss assertions are unchanged.
- Linux WebKit CI logs include Playwright's process launch/exit and native stderr
  through `pw:browser`, so a target loss has process evidence as well as a trace.

There is no retry, skipped case, changed deadline, synthetic playback, paused
motion, renderer/material change or replacement of the native context-loss
event. The inventory remains 630 identities. Fresh complete qualification,
exact-artifact provenance and public verification are still mandatory.
