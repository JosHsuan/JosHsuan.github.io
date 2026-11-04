# Bending raster policy and native history clocks — 4 November 2026

## Rejected full run

[Full CI 41754878281](https://github.com/JosHsuan/JosHsuan.github.io/actions/runs/41754878281)
tested `a33fc879c5691bedc0fad7c2a75c479d56482bc4`. All thirteen browser shards
finished: Chromium 208/210, Linux WebKit 209/210 and mobile Chromium 210/210.
The required gate rejected the 627/630 result. No deployment was dispatched.
Live remains `a46a65aebc5c69c805d6e9740d5366ab451d8e63` at this checkpoint.

The independently downloaded 268-file export hashes to
`66223721f6c3575878d9003a2a343aea621016302659dda70e4669ae5485173c`.
All 147 approved manifest entries and 137 protected original entries match.
Quality has 714 passes, two pre-existing intentional skips and no failures;
nine framework source checks and 24 framework browser checks pass. Planning
has 159 passes and three explicitly deferred installed-CLI checks, 162 total.

The complete native XR recording journey now passes, including its original
60-second bound. Linux WebKit passes all twelve native information-plane routes
with the unchanged single Tab, focus-visible, exact scroll, final contrast and
ownership assertions. Local Windows native-anchor navigation remains a separate
documented platform limitation.

Complete failure archives were verified before extraction:

- Chromium 3/6: `289d53951191786cde1979b70a3b49c4025c9dd5977c8b782faa3bab5c7dd8fb`.
- Chromium 6/6: `fa1931cc678cea6aa55dc35b0616c6bffe1189f61fb02d70bf0667f0fdca00ef`.
- WebKit 2/3: `270a406e36f9e5f567a989fccdef50ff7b7362952db90a9a2bbaeba76e06183f`.

## Authored raster tradeoff

The two Chromium failures remain complete Bending journeys: typography reaches
its native screenshot after all font assertions, but exceeds 60 seconds; the
information-plane journey reaches forced-palette navigation after actual signed
motion/rest and exceeds 240 seconds before its keyboard sequence. Source entry
takes 20.7/21.6 seconds in these traces. Individual browser observations take
several seconds; the latter receipt records a 1.7-second delivered controller
interval. These observations do not establish GPU execution time or hardware FPS.

Reducing protocol reads alone did not resolve this cost. The owner's current
continuous-motion request explicitly allows authored delivery/material tradeoffs.
Bending's desktop raster ceiling therefore changes from 1,600,000 to 921,600
pixels, a fixed 1280 × 720 pixel budget and 42.4% lower maximum pixel allocation.
At 1440 × 1000 it produces 1152 × 800 before existing pixel-only pressure relief.
The scene retains complete source geometry, 2× MSAA, HDR/depth composition,
the existing optical gathers, photographic materials, cached 1024-pixel shadows,
camera paths, independent idle, scene transitions and the same final writer.

This deliberately reduces raster detail at large desktop sizes. Native HTML
reading remains at display resolution. The touch ceiling stays 520,000 and the
separate XR recording ceiling stays 1,600,000. No preference, benchmark or
automatic static mode selects this desktop ceiling. Existing bounded pixel-only
pressure relief remains; it does not stop motion. No application acquisition,
readiness or test deadline changes.

## Clock metadata is not document identity

Mode/s WebKit history reaches a successful fresh Forward entry with native
`back_forward` timing and trusted `pageshow`. Two adjacent `timeOrigin` getters
return `1793756768011` and `1793756768010`: a one-millisecond difference, while
the existing assertion demanded exact equality. Both original readings remain
in the retained receipt.

[WebKit issue 258572](https://bugs.webkit.org/show_bug.cgi?id=258572) records the
same-page drift caused by repeated monotonic-to-wall conversion. The current
[WebKit implementation](https://github.com/WebKit/WebKit/blob/main/Source/WebCore/page/Performance.cpp)
uses a one-millisecond time quantum and performs that conversion in the getter.
The [High Resolution Time specification](https://www.w3.org/TR/hr-time-3/)
distinguishes monotonic durations, wall-clock origins and coarsening; it does
not make a drifting wall-clock value a reliable document identity.

The four diagnostic history audits now retain both native clock readings and
require agreement within one millisecond on WebKit; Chromium remains exact.
Finite positive values, the `performance.now` clock name, event epochs, bounded
event rings, trusted native history, successful entry and all original resource
conditions remain mandatory. This metadata allowance does not alter event
durations or application deadlines.

All five hybrid history audits use a read-only, test-owned UUID initialized once
per native document as their identity. Native `pagehide` must retain the exact
initial identity; persisted Back must retain it, and a fresh document must differ.
The former native `timeOrigin` stays in receipts as separate metadata. The test
marker does not change application navigation, source lifetime or scheduling.

## Qualification

The rebuilt public export passes its 147-asset/private-input audit, with local
digest `bab9f5a3509eff409b5d806a1b2dfcadcf4eadfba655623ce4f4f8cce3cde4ad`.
Its old `a33fc87` release metadata is local evidence only. The three render-profile
unit checks pass, including desktop allocation at three viewport sizes and the
existing touch/invalid-budget guards. `pnpm check` passes under Node 24.19.0 and
pnpm 11.19.0, including nine framework source checks, all 162 installed CI
contracts and the 63-file empty-framework build audit. The complete portable
application/tool run has 714 passes, two existing intentional skips and no failures.

The two previously timing-out Bending Chromium scenarios pass unchanged on this
rebuilt artifact, in 1.7 minutes combined. All fifteen native hybrid history
journeys pass across Chromium, WebKit and mobile Chromium, in 2.0 minutes combined.
Their original acquisition, readiness and outer test deadlines remain intact.

Actual desktop browser review uses the old exact CI export and the new local
export at a measured 1440 × 1000 viewport. The visible scene buffer changes from
1517 × 1054 to 1152 × 800, while native heading/body rendering remains separate.
Overview retains legible metallic highlights, openings and the authored partial
source framing. Native navigation to System retains the source representation,
vertex colors, model annotation and readable information plane. Captured console
errors are empty and document width does not exceed its client width. Images are
retained locally as `raster-before-overview.jpg`, `raster-after-overview.jpg` and
`raster-after-system.jpg` under `.runtime/nov04/`. The running idle phases are not
synchronized pixel comparisons; these views do not establish identical pixels,
GPU timing, hardware FPS or complete physical-device acceptance.

The complete fresh browser/receipt gate, same-artifact publication and public
byte/UI reconciliation remain mandatory. This record is not release acceptance.
