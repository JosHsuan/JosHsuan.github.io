# Native input and continuous-observation corrections — 4 November 2026

## Rejected candidate

Full CI [41742955325](https://github.com/JosHsuan/JosHsuan.github.io/actions/runs/41742955325)
tested `af995f1aacf2bf16926329cbaefd5802a15d6fd4`. All thirteen public browser
shards completed without the preceding run's 45-minute job timeout. Their logs
report 603 passing and 15 failing cases out of 618. Quality, static build and
both framework profiles passed, including 24 framework browser cases. The
required validation gate failed. This artifact is rejected, not publishable.
Its independently verified static digest is
`a7ecebb75304f65f6c58f227fdee5d4610a946b79d2c3ab7ffb65c4df2444984`.

The retained export has 268 files and all 147 approved manifest entries,
including every one of the 137 original protected entries. Live publication
remains `a46a65aebc5c69c805d6e9740d5366ab451d8e63` at this review checkpoint.

## Production correction

Chromium and Linux WebKit could hit the deck list instead of the active card
between exact card positions. The trusted Chromium pointer capture and bubble
receipts identified `OL` at the active card center; the card was not inert and
its instance was active. This was reproduced against the exact CI artifact
through native browser input. The deck list's shared `preserve-3d` context put
negative-depth cards behind its own hit plane.

Removing that one shared `transform-style` declaration restores native hit
testing. Each card retains its authored perspective projection, explicit stack
order, liquid deformation, instance lifecycle and source navigation. A new
regression enters the actual deck, travels 45 native pixels into the interval,
checks five hit points and clicks the real card center. It fails against the
old artifact and passes after the CSS correction. The complete eight-card
forward/reverse journey and compact landscape layouts also pass: 12/12 across
Chromium, Windows WebKit and mobile Chromium. The original public entry test
then passes on all three profiles.

## Observation corrections

These changes preserve production behavior, assertions about source quality and
ownership, real input, zero retries and the existing scenario deadlines.

| Failed observations | Evidence and correction |
| --- | --- |
| Load failure / context recovery, three profiles | A disabled source control also denotes pending acquisition. The test now waits for the actual failed fallback and persisted failed lease, then uses the visible native **Enable 3D** recovery action after reload. It retains the real context-loss, gesture-release and readable-fallback assertions. Recovery plus public entry pass 6/6 locally. |
| OS Reduced source labels, Chromium and mobile Chromium | Sequential label/source queries crossed the bounded eight-second comparison lease. Representation, label, annotation, placement and geometry are now captured in one evaluation; all original assertions apply to that same instant. |
| Home direction, Chromium | The observer retained only its first 32 moving samples. Four native deliveries exhausted this capacity before the final endpoint, although negative tilt was recorded at the intermediate positions. A bounded rolling phase window retains the latest 32 samples, within the existing 120-total limit. |
| Bending direction, Linux WebKit | Native input moved from 11 to 600 and finally 611 pixels. A real negative tilt of −4.686 degrees was captured at 600; the spring had rebounded to +0.069 at 611. Exact endpoint remains required by the native-input helper. Direction now belongs to a sample strictly beyond the start and within the actual excursion, excluding stale positioning tails. Endpoint and direction need not occur in the same frame. |
| Bending navigation, Chromium | Independent fixed-navigation observations are read concurrently; visibility, viewport, transitions, links, opaque paint, contrast and the real one-Tab focus requirement remain. |
| Home/Bending font checks and mobile Home width aggregate, four cases | The original font assertions succeeded before several failures in late observation/capture. Preload and CJK cascade checks join the existing atomic layout snapshot. All native platform-font and isolated Latin queries remain, with at most 64 independent read-only CDP requests in flight. The four Home widths become independent native documents, each with the unchanged 60-second budget and original layout assertions. |
| Three-phone native XR journey, Chromium | Six element screenshots incurred implicit scroll, stability and geometry round trips despite an already-proven full-viewport canvas. Six native viewport PNG captures cover that same exact rectangle, retaining native decoded-frame progression, image inequality, full source dimensions/durations, canvas identity and the whole forward/return journey. |

The Home/Bending Chromium and mobile field checks passed 4/4 after the rolling
window/concurrent-read changes. The four main Home/Bending Chromium font cases
pass with the 64-request bound. The preceding Home typography and four-width
checks pass 15/15 across all three local profiles. Atomic model-label checks
pass 9/9: autonomous release, desktop/native-mobile placement at four widths and
continuous playback under OS Reduced on all three profiles. Both complete XR
journeys pass on Chromium and mobile Chromium in 52.6 seconds combined, with
all six native captures per profile and every source/ownership assertion.
The final direction predicate passes the complete Bending case on Chromium and
mobile Chromium. Windows WebKit passes its forward/reverse deformation and rest
checks (observed tilt extrema −9.948 / +10.186 degrees), then reproduces the
previously isolated native Tab policy: focus moves to a `BUTTON` instead of the
next anchor. That local case remains failed; its required Linux CI counterpart
is unchanged. This three-profile run finishes with two passes and one failure
in 4.1 minutes. None of these local results substitutes for a new full CI run.

## Artifact and remaining gate

The rebuilt local CSS-corrected artifact contains 270 files and has digest
`0055342cc8227a2cec9ca3da83cb244257b9049163463a1b39e76b05c53cf641`.
Its release record still identifies the preceding commit; it is local evidence
only. The new source inventory enumerates 630 browser identities in 40 files:
three added native-hit checks and nine additional independent width identities.
No original scenario is removed. Source geometry, protected assets, the one
Director clock and the empty reusable framework are unchanged.

The known Windows WebKit native-anchor Tab policy and H.264 code-4 limitation
remain explicit local limitations. Neither waives the Linux WebKit identities.
A fresh passing complete CI, same-artifact Pages deployment, live byte checks
and native desktop/mobile review are still required.
