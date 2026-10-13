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
