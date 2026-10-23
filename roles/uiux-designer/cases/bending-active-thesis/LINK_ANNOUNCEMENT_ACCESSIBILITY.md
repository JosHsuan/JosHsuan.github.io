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

Only accessible names/descriptions in six existing JSX components change.
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
