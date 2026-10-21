# Cloud refinement candidate — 21 October 2026

Status: implemented candidate, not a published release or completed native-browser acceptance.
Starting repository commit: `fdac37587eda6620d90a10dce594d48311e19504`.
The live release still identifies `567d1c051f95049ce417ee7e426d067e708ed411`.

## Scope and protected behavior

The owner's latest direction preserves continuous ambient animation, Bending's
handheld motion and existing cross-section camera transitions. Event ownership
and redundant CPU work are optimized without freezing the scene, replacing 3D
with recorded media, adding a clock, or changing original source assets. The
reusable framework remains empty.

- Shared compact typography tokens reduce oversized headings while retaining
  the OCR/Space Grotesk roles, reading size and existing caption/control floors.
- Mode/s alone opts into the [native velocity skin pilot](VELOCITY_SKIN_PILOT.md).
  Native reading and source pixels stay untransformed; only decorative skin
  edges respond. Other projects retain their existing motion profile.
- Information-window presentation skips unchanged neutral outline generation
  while the ambient Director continues. Measurement invalidation and a final
  settled-state publication remain required.
- An already-closed inactive video transport no longer repeatedly calls native
  `pause()` or advances cancellation generations on every ambient frame. Pending
  play, decode callbacks, deadlines, actual playing and seeking state still
  prevent this fast path. Existing transport ownership is unchanged.
- The public build explicitly allowlists the new velocity sampler. No private
  source, new dependency, font or original media is added.

Implementation was coordinated across typography, motion and runtime owners,
with separate source regression review. Existing specialist role contracts were
retained; this is not a claim of twelve new independent reviewer executions.

## Local evidence

Cloud Linux used Node `24.19.0` and pnpm `11.19.0`; frozen dependency installation
succeeded without changing the committed dependency graph.

| Check | Result |
| --- | --- |
| Content validation, root ESLint and TypeScript | Passed |
| Framework unit/integration contracts | 9 passed |
| Combined public runtime, role tools and CI contracts | 581 total: 579 passed, 2 intentional skips |
| Framework static export and audit | Passed; 61 output files |
| Public static export and source/artifact audit | Passed; 259 output files, 138 pinned public assets |
| Whitespace/conflict checks | `git diff --check` passed |

The skipped contracts require actual WebGL optical rendering and SVG/React
browser interaction. They are not counted as browser passes. The standard
`pnpm check` command was blocked by the cloud's tsx CLI IPC socket restriction;
its content/export/motion/audit and TypeScript test entrypoints were executed
with `node --import tsx` instead. Root build and public build ran normally.

The new backdrop regression advances 600 ambient ticks before video acquisition
and another 600 after source departure, asserting no additional native pauses
or cancellation generations. It also verifies that an actual disallowed late
native restart is still stopped. This proves reduced operation count in the
controlled fixture, not improved field INP or real-device frame rate.

## Browser and publication gate still open

The pinned Chromium download returned a non-ZIP response from its official CDN.
The installed Chromium could not launch through the shell's socket restrictions;
the approved execution attempt failed in environment setup. A supported cloud
browser existed, but could not reach the executor-local preview and had no
working WebGL. No local native typography, velocity-pilot, GPU or visual
acceptance is claimed.

Run the complete selected CI matrix for the final committed candidate, including
the updated typography checks and new `velocity-skin.spec.mjs`. Shared presenter
and build-allowlist changes require the conservative full public scope. Keep
the exact-commit validation and tested-output digest gates unchanged. Publication
must consume that CI artifact without rebuilding, followed by live release and
native journey checks. Source tests and successful compilation alone cannot
close this gate. Physical-device and accelerated-GPU results remain separate.
