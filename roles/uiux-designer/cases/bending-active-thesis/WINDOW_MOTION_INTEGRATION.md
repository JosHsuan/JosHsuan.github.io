# Shared information material and timed Canvas passages

Owner-authorized implementation, 13 October 2026. The owner subsequently selected
Fluid page edge for information windows and authorized commit, push and Pages
publication through the existing same-commit validation gate.

## Scope and ownership

The review catalog retains two window recipes, **Pressure aperture** (`membrane`)
and **Fluid page edge** (`ink`). Each recipe supports the static model Canvas and
the HTML/SVG information specimen. The original C3 model, camera, lighting and
recipe parameters are retained. Earlier catalog studies remain historical files.

`runtime/motion/window-motion-api.mjs` is the shared pure implementation. Neither
the public runtime nor its build imports the review catalog. Recipes, body motion,
eight material followers, path sampling and outline sampling have one source.
The catalog owns its own isolated review controller; the published-case source
uses the existing `ExperienceDirector` and frame scheduler.

In the catalog, the native page carries a specimen completely across the viewport
boundary. At an intermediate scroll position the window stays there, fully
opaque, while its residual elasticity settles. Reverse scrolling returns it
through the same boundary. Explicit replay controls move that native scroll
position; they do not substitute a fade or collapse for page travel.

The main information windows use **Fluid page edge** (`ink`): the catalog's shared
1.60 Hz, 0.58 damping recipe and fluid perimeter. Explicit React markers
cover chapter copy, source diagrams, model side labels, evidence frames/captions,
original-figure disclosures and the dynamically opened source comparison. Only
the outermost marked window registers a response. Nested paragraphs, buttons and
figures do not acquire another material controller. Navigation and model hit
surfaces remain separate.

`InformationWindowPresenter` receives batched layout measurements and elapsed
seconds from the director. It owns the information CSS variables through
`DOMPresenter`; it creates no listener, observer, RAF, timer or React frame state.
The director's existing `ResizeObserver` also observes marked windows, including
hidden side labels, and releases disconnected targets.

Native document scrolling still owns information position. The material response
settles at every intermediate position without fading the content. A decorative
React-owned skin receives the shared outline; text, source SVG, hit areas and
focus rings are not clipped. Residual translation is bounded to 12 px, edge
displacement to 16 px, with existing radii and materials retained. This smaller
presentation limit accommodates mobile padding without changing the common
physical recipe. Focus, Pause, Reduced, semantic seek and stale/resumed frames
return a readable still. Old nested choreography and plane-feedback writers are
excluded from these windows.

## Model Canvas passage contract

The native reading probe remains independent of the scene probe at `0.62 ×
viewport height`. Existing chapter boundaries, full-scale holds, camera fitting,
scene resources and model transforms are preserved. MAKE and VALIDATION remain
scene-free. Only the placement timing changes:

| Intent | Trigger | Completion |
| --- | --- | --- |
| Enter | Native scene chapter changes, or a confirmed return from departure | 1.10 active seconds to the existing full-scale hold |
| Leave | Cross the outgoing shoulder, or request a different scene chapter | 0.95 active seconds to the existing offscreen pose |
| Replace | Another chapter arrives during a passage | Finish the current scene's departure, then enter only the latest requested chapter |
| Reverse | At least 12 px of accumulated native travel in the opposite direction | Retarget from the displayed pose, with no position jump |
| Seek / Reduced / explicit source inspection | Existing semantic navigation or preference policy | Useful still pose, including true absence in evidence chapters |
| Resume / renderer wait | Existing suspension or passive submission gate | Preserve passage time; do not replay hidden elapsed time |

Scroll distance and the chapter playback's wheel-tempo boost never supply passage
time. Repeated samples within the same intent do not restart it. Remaining active
time is carried across an exit/entry boundary, including low frame rates. A new
chapter does not replace a still-visible old chapter during ordinary scrolling.

The pure motion state produces a per-update outbox. After DOM writes and frame
publication, `CanvasTransitionEvents` publishes `canvasTransition` facts through
the existing `EventManager`. Each request has an ID and one terminal fact:
`completed` or `cancelled`. A hold completes after the passive renderer mailbox
acknowledges the settled frame for the matching chapter; an offscreen or fallback
completion needs no GPU wake. Superseding an unacknowledged request and disposing
the director cancel it. The acknowledgment does not schedule itself.

The scene presenter retains each successfully painted annotation anchor. After
the director publishes Canvas placement and information material transforms, the
existing scene subscription remaps that anchor and its caption endpoint against
the current DOM rectangles. Projection changes still follow a successful scene
paint. Repeated notifications for the same controller frame are skipped; hidden,
absent, disconnected or failed presentations hide their connector. This prevents
the former one-frame leader lag without adding a clock, GPU submission or camera
writer.

## Review decisions

The motion role extracted the shared recipes and checked numerical equivalence
with C3. The UI role selected outer information containers and identified mobile
text/focus clipping risks, leading to the separate skin. The direction review
identified stale terminal facts, unacknowledged completion, disposal cancellation,
low-frame-rate remainder loss and reversal jitter; regression tests cover them.
Controlled-clock browser review also found the moving leader lag, which a test
that waited for settlement could not expose. Its replacement samples the actual
displayed Canvas and caption at three times during departure, then verifies that
the stopped native scroll still reaches the terminal event.

## Pressure-aperture integration checkpoint

The following evidence records the completed integration before the owner's
subsequent Fluid page edge selection. Its artifact hashes are historical; the
fluid selection is verified separately below.

Local verification used Node **24.19.0**, pnpm **11.19.0**, the committed lockfile,
and the built static artifacts. No development server or hot reload supplied the
browser checks.

| Check | Result |
| --- | --- |
| `pnpm check` | Passed: content, lint, types, unit/integration/CI checks, framework build and public artifact audit |
| Case portable tests | 229 passed; 2 existing browser-only conditional skips |
| Case release build/audit | Passed: 80 output files and 36 approved assets; no private inputs |
| Case browser regression | 117 passed: all 39 scenarios in Chromium, WebKit and 390 px mobile Chromium |
| Catalog pure motion/control tests | 54 passed across seven suites |
| Catalog native scrolling | 12 specimen/browser cases and 3 shared control groups passed |
| Catalog explicit playback controls | 8 cases passed across Chromium and WebKit |
| Catalog registry/UI | 4 cases passed; exactly two entries in each content layer |
| Framework browser checks | 9 passed across Chromium, WebKit and mobile Chromium; Firefox could not launch (`spawn UNKNOWN`) |

The case suite ran against the frozen release with
`playwright test --config playwright.pages.config.mjs --workers=2` and finished
without retries. It covers stopped-scroll timed completion, rapid reversals,
same-Canvas identity/scale, mid-flight leader alignment, focus/history,
Pause/Reduced, evidence portals, resource bounds and suspension/recovery.

Catalog browser coverage is all four specimens in desktop Chromium, desktop
WebKit and 390 px mobile Chromium emulation. Checks include native intermediate
holds, complete viewport departure, reversal, cancellation, settled idle,
Pause/Reduced and unchanged static model pixels/camera/render count.

The UI role inspected seven chapter surfaces, source diagrams, side information,
evidence, open source disclosures and the comparison portal at **1440 × 1000**
and **390 × 844**. It verified absolute skin sizing, no additional flex/grid item,
no horizontal overflow or text/focus clipping, continuous reversal, opacity one,
12 px body/16 px edge limits, settlement and keyboard dismissal. Both inspected
CSS files are byte-identical in the final artifact. Source camera, model fitting,
lighting and compositor modules remain unchanged; the two scene presentation
modules changed only to synchronize annotation placement with the displayed DOM.

Final artifact SHA-256 values:

- Case static tree: `670ec514762a0a943cc1e3226b77a6040fd7ba3873678f1b7150fae6e52551d8`.
- Case index: `3994eeda6df7df2ed23df281cf757fcc8738c98efb2b633412ebd4f410455cec`.
- Catalog app: `50fd1a765c8a0cb483d069ad97f9c000e88231b8397b06c65de71c381a14fabb`.
- Catalog CSS: `297b7db788946ccaf4f10275e979143dc5d9837efbaac2b730dba26bea126a9b`.

Local detailed evidence is under `animation-review/.local/`, including
`main-integration-audit.json`, `main-ui-integration/`, `scroll-verification/` and
`verification/catalog-effects.json`. Earlier timed-annotation measurements retain
the pre-fix failure as diagnostic history, not acceptance evidence for the final
artifact. The two portable skips are the actual WebGL field test and actual
SVG/React rendering test; they are excluded from passed counts. Browser
acceptance is reported separately.

Real-device iPhone/Safari behavior was not tested. Firefox's launch failure is an
environment limitation, not a passed assertion. No publication was performed.

## Fluid page edge publication candidate

The information presenter now selects the shared `ink` recipe for every registered
outermost surface, including dynamically opened source comparisons. Runtime
inspection reports the actual recipe key. Body/edge limits, unclipped readable
content, focus/Pause/Reduced behavior and the director clock are retained. The
catalog still exposes both recipes; the model Canvas retains its appearance and
the previously verified timed passage contract.

The existing presenter and browser regressions explicitly assert `recipe: ink`.
Local verification on the fluid candidate passed `pnpm check`, 229 portable
tests (2 existing conditional skips), the complete 80-file/36-asset release audit,
and **45 browser scenarios** across Chromium, WebKit and 390 px mobile Chromium
for information windows, reading feedback and model/annotation interaction.
Desktop 1440 × 1000 and mobile 390 × 844 visual checks covered all seven chapters,
source diagrams, model labels, evidence, disclosures and dynamic portals. They
confirmed continuous reversal, bounded motion, readable unclipped content,
keyboard dismissal, no horizontal overflow and zero page errors.

The local fluid candidate tree digest is
`e7a614155efcd9e9093ede759a8767be5eef99d5120a46ca36effe3c8b4d0bd9`;
its index digest is
`603dd08a3f929178399a159331f3341b628d00049c7e1f9b7a0a6af3223ac020`.
Detailed local evidence is in `animation-review/.local/main-fluid-integration/`.
These are pre-commit local build identifiers; the hosted build embeds the pushed
commit and supplies the authoritative publication digest.

The first hosted WebKit run exposed a sampling problem in the new material test:
16 real RAF deliveries spanned 9.7 wall-clock seconds, so its snapshots recorded
the resting inset instead of the short-lived fluid outline. The test now advances
48 ms of controlled active time per native-scroll sample and still requires an
actual computed `clip-path: path(...)`, motion and opacity one. All nine window
integration scenarios passed locally across the three browser projects after
this test-only correction. Runtime code and the inspected fluid artifact did not
change.

The release must pass the complete selected hosted matrix and required gate at
the pushed commit before the manual Pages workflow can publish its tested output.
Deployment run URLs and public `/release.json` confirmation are reported with the
delivery, without creating a second release just to record post-release metadata.
