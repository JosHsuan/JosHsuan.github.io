# Native link announcements — bounded accessibility candidate

23 October 2026. Baseline: published `ce12d682b75c4c1867f67250550996114196b004`.
Implementation and browser acceptance below are separate from publication.

## Evidence and scope

The twelve-route static audit found 129 `target="_blank"` anchors:

- 31 already explicit full-image caption actions: retain unchanged.
- 31 original image anchors sharing those figures: preserve image/source names
  and add an accessible new-tab notice, not another visible button.
- 63 other native actions: 12 shared ordinary-route social links, 33 generic
  primary-image links, seven generic recording links, four XR recording/excerpt
  links, three Entrance complete-image links and four Bending source-list links.
- Four Bending inspection triggers: these are not unconditionally new-tab actions.

The dynamic inspector's original-source link is another native new-tab action,
outside that static count. Unreferenced ModelViewer/XRPhoneStudy components are
not published-route evidence and are outside this slice.

The Bending manager intercepts an unmodified primary activation to open an inline
source comparison (not a dialog). Without JavaScript, or for native modified
activation, its original link remains available. Its accessible name must retain
the visible words “Inspect evidence”; its description must explain both paths.
Do not change its selector, destination, target or event manager.
The conditional description uses a unique `aria-describedby` reference to hidden
text, without adding visible layout or a CSS import. W3C
[accessible-name/description guidance](https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/)
permits explicitly referenced hidden descriptions; actual browser description
assertions remain required, not inferred from markup alone.

## Minimal candidate contract

The link-announcement slice changes only accessible names/descriptions in six existing JSX components.
Visible labels, arrows, source text, layout, CSS, destinations, original assets,
camera and runtime behavior remain unchanged. Native-link names include their
visible wording and an explicit new-tab notice. Image links retain source context.
Existing 31 caption actions retain their exact accepted markup and behavior.

Independent portable contracts must prove the six files reduce to the exact
baseline after removing only explicitly approved additions/replacements. Do not
strip arbitrary ARIA attributes or weaken source, asset, CSS or data pins.
Actual browser acceptance must cover names, native activation/return, the
conditional Bending path, mobile, forced colors and no-JS reading. It is not
screen-reader product certification or a guarantee about external-site uptime.
Targeted tests, whole portable/CI checks, the exact full browser/framework gate,
retained visuals and same-artifact live verification remain required to publish.

## Prior HC investigation closed without a production change

The HC model is already meshopt-compressed (50,438,508 bytes); the live CDN also
serves gzip. The original decoded buffer allocation is 88,955,128 bytes. Neither
fact justifies replacing geometry or promising faster browser decoding.

Reserved candidate `44b94e52` passed three nonpublishing tests per profile:
[Chromium](https://github.com/JosHsuan/JosHsuan.github.io/actions/runs/39890285107),
[WebKit](https://github.com/JosHsuan/JosHsuan.github.io/actions/runs/39890382897),
[mobile Chromium](https://github.com/JosHsuan/JosHsuan.github.io/actions/runs/39890473163).
All held requests actually reached `readiness-timeout`, closed before delivery
and were cancelled; site-start to transport close was 15,004 / 15,004 / 15,046 ms.
Reading was no longer inert, the original poster and source link remained usable,
and releasing the held gate produced no late acquisition or rendering upgrade.
Six reduced-motion/emulated-SaveData cases made no model request. All nine real
Tab targets were visible, 44px high and clear of the measured fixed chrome;
nine retained reading captures were reviewed.

The alternate model `load-timeout` race did not occur. This proof does not cover
late parsing/disposal, GPU memory, physical SaveData networks or field speed.
The exploratory test remains on its reserved branch, not the production release.
No loading UI, deadline, preload policy or model changes were warranted.

## First targeted feedback — not release acceptance

Exact `0564ff93676c664e02fc405daf3d4e2d2892bb08` passed WebKit 13/13
([39893409198](https://github.com/JosHsuan/JosHsuan.github.io/actions/runs/39893409198)).
Chromium [39893310589](https://github.com/JosHsuan/JosHsuan.github.io/actions/runs/39893310589)
and mobile [39893496298](https://github.com/JosHsuan/JosHsuan.github.io/actions/runs/39893496298)
each passed 12/13; the new combined interaction scenario exhausted its 60-second
budget during native Tab traversal toward Bending's Make trigger. The captured
mobile focus/scroll sequence progressed through Form and System without evidence
of a focus cycle. The preceding original-image keyboard/touch roundtrips passed.
This is not evidence that the new markup broke a destination or created a trap.

All route declaration and no-JS checks passed. The WebKit comparison's source
loaded and inline open/close assertions passed, but its viewport screenshot did
not show the comparison itself. That capture cannot certify comparison-content
readability. The bounded test correction uses the existing chapter navigation's
real keyboard activation, separate unchanged-budget interaction scenarios, and
an actually visible native comparison action. No production focus behavior,
threshold, runtime, source or style changes are justified by these results.

### Corrected navigation and remaining Chromium service latency

At `3f1de78dbe83f10db5ff17001573bd44b91c17bb`, WebKit
[39895301436](https://github.com/JosHsuan/JosHsuan.github.io/actions/runs/39895301436)
and mobile [39895411058](https://github.com/JosHsuan/JosHsuan.github.io/actions/runs/39895411058)
passed all four scenarios. They actually activated Make through native keyboard
navigation, opened the inline comparison, focused its unobscured original-source
link, opened the 1191×1684 original, returned and closed back to the trigger.
The comparison image and action captures close the earlier offscreen-action
capture gap. A tall mobile element capture still overlaps fixed chrome at its
header; it is not proof that the whole comparison is simultaneously unobscured.

Chromium [39895218477](https://github.com/JosHsuan/JosHsuan.github.io/actions/runs/39895218477)
passed three scenarios but exhausted the same 60-second Bending budget before
chapter activation. Only the first Tab reached Pause. Captured ordinary calls
were themselves slow: entry evaluation 8.18 seconds, control count 12.14 seconds,
and first Tab 6.10 seconds. No focus-cycle or missing source-response evidence
was found; a specific CPU/GPU/renderer cause remains unproven. Do not call this a
performance repair or infer it from the passing other engines.

The next bounded semantics scenario remains normal Full mode, explicitly uses
the visitor's real Pause control after source readiness, proves its frozen clock,
and exercises native reading/inspection before a genuine Resume where feasible.
It does not emulate Reduced, inject a clock freeze or enlarge the timeout.
Existing Full model/camera/source/Pause contracts remain unchanged. Existing
comparison-specific public-release/window-integration baselines use Reduced;
they must not be misrepresented as unpaused Full coverage. The successful
unpaused WebKit/mobile runs above remain separately scoped historical evidence.
This was the pending checkpoint before the combined adaptive qualification below.


## Combined qualification checkpoint — not published

Candidate `155a0a4` passed 12/12 affected announcement scenarios across Chromium,
WebKit and mobile Chromium, using the original 60-second budgets and actual Full
readiness, native Pause, navigation and source comparison. Candidate `a15c09b`
then passed 27/27 affected source-representation scenarios across those profiles.
These are targeted qualifications, not the pending full 504-public + 24-framework
gate. Main and the live website remain `ce12d682`.

The candidate now also contains a separately reviewed, STANDARD-only severe
frame-delivery response. The six JSX changes remain accessible-name/description
changes; this combined candidate must no longer be described as runtime-identical
to live. See [adaptive delivery qualification](ADAPTIVE_DELIVERY_QUALIFICATION.md)
for its exact policy, persistent density behavior and observed quality limits.
The owner accepted this rescue-quality tradeoff for full validation, not deployment.

The three actual Overview captures and all twelve System representation captures
were visually reviewed at their achieved stages, not presumed equivalent density.
The actual original-source action is readable and visibly focused in all three
profiles. Tall comparison captures still overlap fixed chrome: mobile Close/header
is not pixel-certified by those captures. Native interaction/name assertions are
separate evidence; screenshots alone do not certify assistive-technology behavior.
