# Native-pixel and retained paint-owner review

The `660f4e1` candidate's [full CI run 41760002127](https://github.com/JosHsuan/JosHsuan.github.io/actions/runs/41760002127)
finishes 628/630: Chromium 209/210, WebKit 209/210 and mobile Chromium 210/210.
The required gate rejects it. A failed WebKit source-click assertion and a
Chromium reading/palette timeout prevent publication.
The failed artifact remains retained; the correction below is new evidence,
not a retrospective pass or a production interaction change.

## Observed failure

WebKit job `126345756191` passes 58 of its 59 identities. The failed scenario
requires an actual source hit through transparent mobile information overlays,
while the owner's continuous camera/source playback remains active.

The search finds `(133.43571428571428, 380.4028571428571)`. Five cross-shaped
source samples and a subsequent ownership query accept that fractional point.
The native pointerdown/up instead report `(133, 380)`, with `hit: null` in both
capture and bubble. The DOM target is unprotected; no source is held and the
original Opening representation remains selected. This is not evidence that
the application ignored a positive native hit: there was no positive hit at
the actual input coordinates. Empty space must not become an invisible button.

The trace also records approximately 141 ms from completion of the search
evaluation to the click command, including separate ownership/resource reads.
The source/camera continues moving during those protocol turns. The retained
evidence does not isolate coordinate quantization from motion as the sole cause;
both invalidate the assumption that the old fractional probe is the later click.

The complete review ZIP was downloaded and independently checked against GitHub:
artifact `13290887106`, SHA-256
`e6608ebac0fca35a5ab00045dd32a12750094c6a094ad9dac884f915ef9ad436`.
Its original search, ownership, pointer-event receipt and Playwright trace remain
under `.runtime/nov04/660-webkit-8-review` and `660-source-click-trace`.

## Observation correction

The browser search rounds candidate coordinates before DOM/ray sampling, so
the chosen pixel equals the native input pixel on every profile. A nine-point
square footprint includes corners as well as axes; this matters for perforated
geometry, where a cross alone does not cover a nearby diagonal sample.
The existing 360-total / 60-per-position ray budgets are unchanged.

One synchronous browser evaluation captures the real source hit, current DOM
ownership and resource state. The very next browser command is the single native
click. Attachment persistence and host assertions follow it. There is no input
retry, clock override, frozen production motion, test style mutation, substituted
hitTest or enlarged readiness/test deadline.

The original native-hit, next-representation, original-source, diagram, renderer
initialization, pixel budget, canvas identity/storage and document-position guards
remain. New assertions additionally require a trusted pointerdown, exact integer
coordinate equality and monotonic ordering after the observed probe. The existing
post-click active-clock assertion still requires continued motion.

## Bounded qualification

All three corrected scenarios pass against the downloaded exact `660f4e1` CI
export, with digest
`56297c1d0ea066e3df3edd0722273e4edea6f5d5b2e0d2df5a08c120bba0ebe9`.
The serial Chromium, WebKit and mobile Chromium run completes 3/3 in 44.9 seconds
under Node 24.19.0 / pnpm 11.19.0. Scoped lint and `git diff --check` pass.
No application rebuild is needed for this test-only correction.

Every retained native receipt has trusted input at the exact probed integer
coordinate. Chromium compares Curvature index 3 to Origami index 0; WebKit
compares Opening 1 to Bending 2; mobile Chromium compares Bending 2 to Curvature 3.
All preserve their original buffer budget and canvas storage-write count.
Receipts remain in `pages-test-results/nov04-native-integer-source-click`.

This local result does not waive the failed full run. A fresh complete 630-case
qualification, same-artifact Pages deployment and independent live byte/UI
reconciliation are still mandatory.

## Retain actual native paint owners through the palette journey

Chromium job `126345756318` passes 43 of its 44 identities. The Bending
whole-plane scenario reaches its unchanged 240-second CI outer limit at the
final forced-colors PNG. It has completed actual forward/reverse gestures,
neutral rest, preference changes, native Tab focus and the focused-palette
observations, but the remaining PNG and final ownership guard do not complete.
This is a failed journey, not a passed screenshot or a waived deadline.

Its complete ZIP is artifact `13290797280`, independently SHA-256 checked as
`b0663808aff556bed5ea850019ca5384e730305c95d8d4e3da88abc21f31846f`.
The retained trace shows repeated locator resolution of already-known static
reading/navigation nodes taking 7.8–8.1 seconds each. This excludes the
subsequent evaluation itself. Native input and multiple evaluations also queue
behind slow continuous source frames; the trace does not establish hardware GPU
timing or claim that only the test contributes to elapsed time.

The observer now retains the actual selected reading node and three native
navigation nodes once. Every palette traversal requires its native owner to
remain connected. Focus still uses the actual nodes, then a native Tab event;
the target must be connected, active, focus-visible and at the unchanged scroll
coordinate. All original visibility/intersection, palette samples, contrast,
transition, motion, rest, ownership, two PNGs and video evidence remain required.
Handles are disposed during the original unconditional cleanup and the original
failure stays primary. No new renderer policy, input substitution, static scene,
test retry, skip or deadline change is introduced by this observer correction.

The corrected complete twelve-route set passes on local Chromium and mobile
Chromium: 24/24 in 7.6 minutes, against the same downloaded CI export. This
includes Bending's final forced-palette PNG and final ownership guard, as well
as Home, About, Project, Contact, XR and all six generic project pages. Original
reading/rest, native gestures, Tab focus, contrast, captures and resource guards
remain present. The earlier Windows WebKit native-Tab policy limitation is
retained in the integration history; no local full-WebKit acceptance is claimed.
Linux WebKit remains mandatory in the fresh full gate. The three-profile native
source-click check above is a separate successful WebKit observation.

The installed CI-contract suite passes 162/162, scoped lint passes and the full
inventory remains 630 tests in 40 files. These are test/documentation changes;
the public application source and approved asset bytes are unchanged from
`660f4e1`. Local logs and receipts are retained under `.runtime/nov04/` and
`pages-test-results/nov04-retained-native-paint-owners`.
