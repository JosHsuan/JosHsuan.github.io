# Native-event and atomic observation — 4 November 2026

## Rejected full run

[Full CI 41749077663](https://github.com/JosHsuan/JosHsuan.github.io/actions/runs/41749077663)
tested `c75d7e6c99548043dc238630be2fcab7b7057526`. All thirteen browser shards
completed. Chromium passed 207/210; Linux WebKit and mobile Chromium each passed
210/210. The three remaining Chromium cases exceeded their existing deadlines:
Bending typography (60 seconds), the complete native XR recording journey
(60 seconds), and the complete Bending information-plane journey (240 seconds).
The required gate rejected this run. It is not publication evidence.

The downloaded export contains 268 files and independently hashes to
`6600a49b573751871e6c17cf069f4df09fcdfba735d80a2a17b6b80abcb60e7b`.
All 147 approved manifest entries match, including all 137 protected original
entries. Quality has 714 passing application/tool checks, two pre-existing
intentional skips and zero failures; the nine framework source checks and
24 framework browser checks pass. The dependency-free planning phase has
159 passes and three explicitly deferred installed-CLI checks (162 total).
The preceding installed local `pnpm check` exercised all 162 contracts.

The actual native-card hit correction passes in all three CI profiles. Linux
WebKit also completes the unchanged native Tab assertion and all three native
H.264 recordings; the known local Windows limitations do not waive those checks.

## Trace evidence and correction

Complete failure ZIPs were hashed against GitHub before extraction:

- Chromium shard 3/6: `455288e5b456ea0da5b4335a0e40e897d734f720575f6ee4a5956f40cb451947`.
- Chromium shard 6/6: `884c4818c61fc7306f491acf86b87f053c3d8d1f4b627296529f24cbb3801e76`.

**Typography.** All 259 source and 16 isolated Latin platform-font queries
complete, in 8.371 seconds with the existing 64-request bound. Before those
queries, a standalone `[data-project-study]` count costs 10.268 seconds at the
browser command level, or 13.280 seconds including trace observation. The test
already owns the reviewed route inventory. It now uses that inventory to choose
the six native documentary openings and checks the actual marker count in the
existing atomic layout snapshot. Every font, glyph, spacing, clipping, source
and native screenshot requirement remains; no font sample is removed.

**XR.** All three 888 × 1920 sources and six native PNG captures are recorded
before the deadline. Viewport screenshots take 2.69–2.92 seconds each on this
runner. The former chapter helper and recording helper each wait for two
additional RAFs after actual readiness, adding about one second per wait plus
serial viewport/control queries. The complete-journey helper now requires all
of the original settled scene, camera, information-plane, successful source
paint, selected recording and decoded-frame conditions at one instant. The
viewport assertions join the existing per-recording snapshot. Independent
absence-of-controls checks run concurrently with unchanged native locators.
Six captures, native progression, exact source dimensions/durations, ownership,
continuity, return to Overview and the Making/Credits absence checks remain.

**Bending information plane.** The trace records successful forward/reverse
feedback before the timeout during later policy checks. Many individual reads
take 1.6–5 seconds behind source rendering. Four independent startup conditions
now share one readiness observation. The pointer is placed once at the same
unobstructed document edge, then every actual excursion still uses native wheel
input. The endpoint observer resolves on a real native scroll event, or the
already-reached exact endpoint, and captures its state in that same delivery.
It removes a second position read and repeated identical pointer moves; a zero
displacement no longer dispatches a zero wheel. The selected plane still must
show signed motion during actual displacement and reach neutral afterward.
All three navigation links retain native visibility/intersection assertions;
their href, transition and painted contrast are sampled together. Focus and
blur include their before/after scroll evidence, with the original single Tab,
`:focus-visible`, exact coordinate and contrast requirements intact.

These are observer corrections, not measured improvements to application frame
rate or entry latency. They do not alter production code, pause the scene,
change source geometry/materials, extend test deadlines, add retries or omit
required identities. The next full inventory remains 630 cases in 40 files.

## Local qualification

- The revised typography branches pass 9/9 across all three local profiles:
  Home, Bending and the native Mode/s opening, retaining all font probes.
- The complete XR journey plus OS motion/data ownership checks pass 4/4 on
  Chromium and mobile Chromium, in 1.1 minutes combined.
- Native-event information-plane qualification passes 8/8 on Chromium and mobile
  Chromium: Home, Bending, Project and Contact, in 5.1 minutes combined.
- Local Windows WebKit Home, Project and Contact all reach the unchanged native
  Tab assertion after successful signed forward/reverse movement and neutral
  rest. All three fail that keyboard assertion: the document loses focus and
  the active element becomes `BODY`, not the next anchor. The existing standalone
  Windows probe already records native anchor-skipping behavior without any
  application code. Palette readings are retained, but the final contrast and
  ownership assertions after Tab are not reached; these are three failed local
  cases, not passes. The required Linux WebKit cases are unchanged and mandatory.
- Scoped ESLint and `git diff --check` pass. The fresh inventory contains exactly
  630 cases in 40 files. Complete fresh CI, same-artifact publication and public
  byte/UI verification remain required.

The local checks use the already-built CSS-corrected application, digest
`0055342cc8227a2cec9ca3da83cb244257b9049163463a1b39e76b05c53cf641`.
Its old release metadata is local-only evidence. The last verified public
release remains `a46a65aebc5c69c805d6e9740d5366ab451d8e63` at this checkpoint.
