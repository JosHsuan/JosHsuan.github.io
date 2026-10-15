# Current neutral 2D reading material — 15 October 2026

The owner rejected the white proposal below and revoked the earlier approval
for commit, push and deployment. That proposal was never committed, pushed or
deployed. Its successful local checks remain historical functional evidence,
not visual acceptance or validation of the replacement.

The current local neutral revision shares production `app/glass-materials.css`.
Its transparent 2D `.vt-window` is the sole backdrop-filter owner; its `::before`
overscan is the sole tint owner and has no filter. Desktop Chromium uses the
bounded range variant where selected by the existing pure capability policy.
Coarse-pointer / no-hover material uses the `.72` regular neutral fill with
light scoped text: visible-padding probes on Windows Chromium with Pixel 7
emulation showed that range color compression did not paint. These observations
do not establish physical Android/iOS behavior. Original source paper remains
opaque and source bytes/pixels retain their protection.

The corrected neutral manifest enumerates **16 inputs**. All **24 behavior
cases** pass on the same artifact: 12 native-scroll checks at
`2026-10-15T15:16:06.950Z`, eight focused controls at `15:18:39.421Z` and four
registry checks at `15:18:48.689Z`. Their logs are
`.local-neutral-catalog-{scroll,controls,registry}.log`; current receipts are
`.local/scroll-verification/{scroll,controls}.json` and
`.local/verification/catalog-effects.json`, each with zero browser errors.

All **six material cases** passed at `2026-10-15T15:10:53.389Z`: both 2D recipes
in Chromium, WebKit and mobile Chromium. The log is
`.local-neutral-catalog-materials.log`; the receipt is
`.local/bright-catalog-materials/results.json`. Its historical folder name is
retained, but the neutral run has overwritten the former white receipt. These
are the corrected artifact's SHA-256 identities:

| Artifact | SHA-256 |
| --- | --- |
| `dist/app.js` | `291564c2d9d3bbe843d2dfdeba0f7106207b31ab44804b4201a02103fdf62a9a` |
| `dist/style.css` | `78c83053faa162ef7ef5ca2739edabfd58ff2e19a2a32fca6756e62a250cabfd` |
| `dist/source-manifest.json` | `56c4467a32c95a96c4b64f885ad77fcb8c797139aaff44611434273607045d32` |

| Corrected material measurement, both recipes | Chromium | WebKit | Mobile Chromium |
| --- | --- | --- | --- |
| Mean skin RGB over black, 0–255 | 29.77 | 22.00 | 22.18 |
| Black-to-white transmitted RGB difference | 59.81 | 70.00 | 70.00 |
| Lowest text contrast over probe backgrounds | 5.292:1 | 5.096:1 | 5.019:1 |
| Native increased-contrast text minimum | 12.234:1 | 12.234:1 | 12.234:1 |

The single filter/tint ownership, unchanged approved source bytes, opaque paper,
exact same-mode source pixels and bounded one-code cross-mode raster
quantization pass. Earlier white brightness floors and deep-ink assumptions do
not define neutral acceptance; the 4.5:1 small-text / 3:1 large-text and
source-pixel requirements remain.

Together with the public eighteen-case material/interaction run, these are
**48 distinct current browser checks**; the older nine geometry/model cases are
not counted again. Nineteen final public captures at
`2026-10-15T15:15:19.452Z` use desktop and Pixel 7 device emulation, with no
recorded horizontal overflow or page errors. Public HTML SHA-256 is
`15d333e95b3105f5e5015ce6e3c33d3da813f6ee631b377805842af1c8786e6b`.
The integration and architecture visual review found no new layout blocker;
the existing mobile overlay may still cover small original-image thumbnail
text or cross paper edges during scrolling. This is neither a no-occlusion
claim nor a one-to-one Figma reproduction.

Owner visual review remains **pending**. Current changes are local and
uncommitted; the earlier publication approval remains **revoked**, with no
commit/push/deployment authorization or new CI/publication result. See the
[integration contract](../LIQUID_GLASS_INTEGRATION.md) for actual Apple/community
references, production capability limits and the separately verified deployed
`39636b7` baseline. Physical devices were not tested.

---

# Historical rejected white 2D material — 15 October 2026

This historical white proposal followed the owner's request to include the 2D
information page. Its catalog chrome consumed the shared standard-reading
tokens, with the overscan pseudo-element as its background/backdrop owner and
no second parent/nested fill. The approved SVG stayed on opaque source paper.
Static viewport colour bands and sparse rules supplied a changing backdrop
during native travel. No model shader, camera, geometry, motion recipe,
controller or listener changed. This earlier ownership and palette are not the
current neutral implementation.

Source/build verification on Node **24.19.0** and pnpm **11.19.0** passed:
**54 pure tests**, ESLint for the five changed catalog JavaScript files and the
new focused material verifier, CSS
parsing with the existing Next dependency PostCSS **8.5.23**, and
`git diff --check`. The rebuilt source manifest contains **15** inputs, including
the shared material stylesheet; recorded hashes matched that white checkpoint's
source at capture time and do not identify the current neutral source.

Artifact SHA-256: `dist/app.js`
**02af010e3ca3facc05f112b8aaf9c6ea3a44286c8c8e968a56c0f49e6103fe6c**;
`dist/style.css`
**f78cde3e072933725824183b57c87588b64752d4b4593e68ccbf44cfd37796e7**.
The ignored `.local/bright-2d-source-verification.json` records these checks and
the shared stylesheet hash. The material run also records source-manifest
SHA-256 **75309a07b85cbb1daa975d06fa1954075fb62a2b1d11c2a3104265565c085e5c**.

All **24 behavior cases** reran against this lighter CSS checkpoint: native
scroll **12 passed** at 13:43:01 UTC, focused controls **8 passed** at 13:45:40,
and registry/UI **4 passed** at 13:47:36. Their ignored reports are
`.local/scroll-verification/scroll.json`, `controls.json`, and
`.local/verification/catalog-effects.json`; all identify the same JavaScript
hash above and contain no browser errors. Model camera, bitmap and render-count
invariance and 2D Canvas count zero remain covered.

The focused material run completed at **14:12:52 UTC** with **6 / 6 passed** and
zero browser errors: membrane and ink in desktop Chromium, desktop WebKit and
390 × 844 mobile Chromium, with browser engines run sequentially. Its receipt
was `.local/bright-catalog-materials/results.json`, identifying the exact JS,
CSS and source-manifest hashes above. That path has since been overwritten by
the neutral run. Historical white logs and the recorded hashes in this section
identify the earlier result; the current file is not its receipt. The white
fixture retained the centered native-scroll DOM and checked one `::before`
background/backdrop owner, transparent parent / title / footer / text margins,
shared tokens and the approved source SVG bytes.

| Material measurement (both recipes) | Chromium | WebKit | Mobile Chromium |
| --- | --- | --- | --- |
| Mean skin RGB over black (0–255) | **194.58** | **194.74** | **194.50** |
| Black-to-white transmitted RGB difference | **44.00** | **44.23** | **44.06** |
| Lowest measured UI contrast across backgrounds | **5.55:1** | **5.57:1** | **5.61:1** |

Every sampled UI text in that run met its 4.5:1 small-text / 3:1 large-text
minimum. Its skin exceeded the then-required brightness 165 and retained
transmission between 20 and 85. That white brightness floor is historical, not
a current Apple-quality or neutral-material requirement. Native
`prefers-contrast: more` produced opaque material with no backdrop owner,
unchanged mean skin RGB across black/white backgrounds and minimum measured
UI contrast **7.56:1**. Source paper stayed opaque with no filter or blend change.

Fixed 64 × 64 interior source crops exclude decorative border/radius and compare
exactly across black/white backgrounds within each mode. Across the native
contrast-mode compositor change, desktop Chromium shows **3 / 4096** pixels
with an RGB difference of **one 8-bit code value**, mean channel difference
**0.000733**; WebKit and mobile Chromium show zero difference. Alpha remains
identical. The verifier explicitly limits cross-mode raster quantization to
one code value, at most 1% of pixels and mean channel difference 0.01; this is
not a claim of cross-mode pixel identity or a relaxed material/contrast gate.

Normal viewport and stage PNGs for all six cases were captured with that CSS
backdrop and normal preferences before black/white probes; filenames and hashes
were recorded in the now-overwritten historical receipt. The owner briefly approved the screenshots and
changes on 15 October 2026, then rejected the white appearance and revoked
commit/push/deployment approval before any publication. This was a **local
functional checkpoint**, never a commit, CI or deployment result. Physical
devices were not tested.

---

# Historical scroll-feedback follow-up — 15 October 2026

This section records the earlier opaque-CSS checkpoint. The lighter-material
checkpoint and its new browser runs are recorded above.

The owner requested that entrance/exit remain scrolling feedback and that continued scrolling carry the complete window across the browsing viewport boundary. Motion and UIUX / Experience Direction review confirmed the native-travel implementation for the two recipes across both content layers. The current catalog synchronizes the position slider with native input and replay, centres the same surface from either side with Return-to-window, and prevents an interrupted exit from reporting completion while its content remains visible.

Boundary facts use transformed content border-box bounds, including elastic translation. They do not claim exact pixel visibility for protruding decorative skin. Full operation/cancellation event design for the main presentation remains deferred.

Verified on Node **24.19.0** and pnpm **11.19.0**, using the committed dependencies and the locally built `dist/` artifact:

| Check | Result |
| --- | --- |
| Pure motion suites | **54 passed** across seven test files; shared function identity, recipe parity, native travel, reversal, pause and Reduced remain covered. |
| Native-scroll browser verifier | **12 passed**: all four specimens in desktop Chromium, desktop WebKit and 390 × 844 mobile Chromium, plus three native input / preference control groups. |
| Focused controls | **Eight passed** across both desktop engines: position synchronization, transformed content boundary facts, soft/strong feedback, native interruption without false exit completion, visibility suspension and replay. |
| Catalog registry / UI | **Four passed**, zero browser errors; exactly two recipes per layer and no selectable retired entries. |
| Content invariance | Model camera, bitmap and render count stay unchanged through scrolling; information specimens use no Canvas. Intermediate positions remain visible and stationary after feedback settles. |
| Source checks | ESLint for all four changed JavaScript files and `git diff --check` passed. |

Historical artifact SHA-256: `dist/app.js` **02af010e3ca3facc05f112b8aaf9c6ea3a44286c8c8e968a56c0f49e6103fe6c**; `dist/style.css` **297b7db788946ccaf4f10275e979143dc5d9837efbaac2b730dba26bea126a9b**. The three ignored browser reports under `.local/scroll-verification/` and `.local/verification/` identify this same JavaScript artifact. Desktop information and mobile model partial-exit captures were visually inspected.

This follow-up changes only the local catalog and its verification/documentation. No production architecture or runtime change requires a root rebuild for this follow-up. Mobile coverage uses emulation and browser-dispatched touch; physical devices were not tested. The catalog remains available on port 4198 and is not included in the public deployment.

---

# Shared-source catalog revision

The current source registers only membrane and ink across both content layers (four specimens). Current/dormant audit entries are no longer imported or selectable in the catalog; their source files remain historical research. The implementation is shared from runtime/motion; catalog entries re-export the same function objects. Unit and dependency-direction results for this extraction are reported separately from the older browser artifact below.

The previous C3 membrane numeric behavior was sampled before extraction at four changing native-scroll targets. Its serialized poses, perimeter paths, body response and material values matched after extraction. Recipe values are also pinned by unit tests. The model renderer and approved assets were not edited.

Pure source validation passed **54 tests across seven test files** on Node **24.19.0**. Checks include shared function identity, the two immutable recipes, matching numeric behavior across both content layers, acceleration/braking and reversal continuity, pause/Reduced settlement, native-scroll visibility, and caller-selected perimeter radius with unchanged 18 px defaults. Shared modules contain no DOM, React or scheduler calls and import only their own pure dependency graph.

The integration owner subsequently built and verified the selected catalog on 13 October 2026. The final `dist/app.js` SHA-256 is `50fd1a765c8a0cb483d069ad97f9c000e88231b8397b06c65de71c381a14fabb`; CSS is `297b7db788946ccaf4f10275e979143dc5d9837efbaac2b730dba26bea126a9b`.

| Current built-artifact check | Result |
| --- | --- |
| Native-scroll verifier | 12 passed: four specimens in Chromium, WebKit and mobile Chromium (390 × 844), plus three input/preference control groups. |
| Focused controls | Eight passed: all four specimens in Chromium and WebKit; force, native interruption, visibility suspension, replay and stationary inspection. |
| Catalog registry and UI | Four passed. Each layer exposes exactly the two selected IDs, two buttons, search filtering and no selectable retired IDs. |
| Model invariance | Static camera, rendered pixels and render count remain unchanged through material motion. |

Current ignored evidence: `.local/scroll-verification/scroll.json`, `.local/scroll-verification/controls.json`, `.local/verification/catalog-effects.json`; all identify the bundle above. Main-page integration has its own [verification record](../WINDOW_MOTION_INTEGRATION.md). The historical hashes and counts below apply only to the earlier ten-proposal artifact.

---

# Historical native-scroll catalog verification

Verified on 13 October 2026 against the local artifact at http://127.0.0.1:4198/, using exact Node **24.19.0** and existing committed dependencies. No dependency installation or lockfile change was required.

## Current contract and artifact

All ten proposals follow continuous native scroll position. Their elastic transform is residual body/material lag, not an autonomous entrance or exit destination. Opacity remains one and the reading surface remains open. A window becomes invisible only after moving past the viewport boundary. Stopping at an intermediate position preserves the visible portion.

| Artifact | SHA-256 |
| --- | --- |
| dist/app.js | 4740000c574c1be201928b90019c43a394e57a1923cce10a033612e5bf73d8c6 |
| dist/style.css | 297b7db788946ccaf4f10275e979143dc5d9837efbaac2b730dba26bea126a9b |
| dist/index.html | 242db7b8583b1e8e871635ee0d2517041d7a2f2ae5fbe1c79fe74e210e19945d |

The final audit confirms served/local JS, CSS and both HTML routes agree; current browser reports and UI evidence identify this same bundle. All 36 approved asset byte counts/hashes and all 21 imported production module hashes still match their manifests.

## Automated results

| Check | Result |
| --- | --- |
| Six local unit suites | **49 passed**: kinetic-motion 10, motion-session 9, window-motion 19, window-transitions 3, window-outline 4, window-scroll 4. The fixed-region primitives remain regression-tested; the live specimen now uses the continuous-target API and scrolling presenter. |
| Continuous-target tests | All ten effects settle at arbitrary intermediate positions without autonomous exit; retargeting retains momentum; Reduced snaps to the current scroll target; invalid values fail atomically. |
| Scroll-presentation tests | Both viewport edges, partially visible intermediate positions, always-opaque/fully-open poses during reversal, neutral feedback after stopping, and native page travel under Reduced. |
| verify-window-scroll.mjs | **30 proposal cases passed**: all ten effects in desktop Chromium, desktop WebKit and 390 × 844 mobile Chromium emulation. Actual native scrollTop drives the controller. The 80% window remains partially visible and stationary after settlement; 0%/100% move its bounds fully outside opposite viewport edges. Reversal preserves body/material momentum. |
| Control groups in that verifier | **3 passed**: native keyboard in all configurations, native wheel in desktop engines, browser-dispatched touch scrolling in mobile emulation, pause/resume, full upward replay and live Reduced changes. |
| verify-scroll-controls.mjs | **4 passed**: C1/I3 in Chromium/WebKit. Strong scrolling produces greater measured peak velocity/lag than soft scrolling; native wheel interrupts a scripted trip and retains the resulting intermediate position; simulated visibility suspension freezes the active clock; replay resumes; position inspection remains stationary. |
| verify-current.mjs | **68 entries passed**, zero browser errors: current inventory, dormant channels and ten proposals; readiness, reset, position/phase inspection, play/pause and Canvas limits. |
| Static content invariance | In the 30-case run, every model's camera, Canvas pixels and WebGL render count remain identical through movement. Information windows contain no Canvas. No horizontal overflow or browser errors were reported. |

The keyboard test waits for the native scroll event before checking settlement. An initial test attempt read the previous resting state before that event; the verifier was corrected and the complete 30-case run then passed. No application change was needed for that test race.

## Visual acceptance

The UI role inspected C1/C4/I1/I3/I4 on desktop and 390-pixel mobile emulation: **90 captures and 34 checks** on the artifact above. Native positions 20%, 50%, 80%, 90% and 100% showed gradual entry and exit through the viewport edges. At 80%, approximately 102.6 desktop pixels or 90.1 mobile pixels remained visible; at 90%, approximately 26.6 or 22.1 pixels remained. At 100%, the complete window had crossed the upper edge.

Each 80% position was held for an additional 2.8 seconds after settlement. Position, pose and frame count stayed constant; opacity remained one. Fast movement retained directional trailing and torsion. Mid-flight reversal did not jump at the command. No four-petal outline, paint leak, horizontal overflow or console error was observed. The two model proposals in the role review preserved camera, bitmap and render count.

The primary integration review also inspected C1 at 80% and fully outside the viewport. The visible portion persists; there is no opacity fade. The existing directional-elasticity discussion is retained in [DIRECTIONAL_ELASTICITY.md](./DIRECTIONAL_ELASTICITY.md), with its earlier fixed-region reveal behavior explicitly superseded.

## Evidence

- .local/scroll-verification/scroll.json: 30 proposal cases, three control groups, geometry, opacity and state samples.
- .local/scroll-verification/controls.json: four focused force/interruption/lifecycle cases.
- .local/scroll-verification/*-partial.png: final-artifact partially visible C1/I3 examples.
- .local/verification/catalog-effects.json: the current 68-entry regression.
- .local/ui-native-scroll-audit/evidence.json and sheet-*.png: the UI role's current native-scroll review.
- .local/scroll-verification/final-audit.json: served/local identity, report identity, approved assets and production source integrity.

Older reports under .local/window-verification/ and their associated verify-windows / verify-window-input / verify-window-direction scripts describe the previous fixed-region revision. Their counts and screenshots are not evidence for the current native-scroll artifact.

## Limits and boundary

Mobile coverage is browser emulation and browser-dispatched touch, not a physical device test. Visibility suspension in the focused verifier is simulated. The visual role used native scrollTop and controls; its screenshots are not claimed as physical wheel/touch hardware testing.

Changes remain in the isolated animation-review catalog. Production architecture, source geometry, ASCII and the main-page event design are unchanged. Root pnpm check and production out/ Playwright tests were not run for this local catalog revision. No commit, push or deployment was performed. The local preview remains available on port 4198.
