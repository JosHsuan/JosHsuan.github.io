# Portfolio refinement verification

Date: 20 October 2026. Status: implemented, validated and published. Exact
application source `567d1c051f95049ce417ee7e426d067e708ed411` passed fresh CI,
same-artifact deployment, live HTTP/media checks and scoped native capture/image
inspection. Historical failed and uncommitted checkpoints remain below.

[Decision 0019](../../../../docs/decisions/0019-portfolio-refinement-and-runtime.md)
and the [integration contract](PORTFOLIO_REFINEMENT_INTEGRATION.md) define the
six-part scope. The preceding published application is `7ff67ce`; its successful
release is a comparison baseline, not acceptance of this revision. Later
documentation-only commits do not replace the deployed application's tested bytes.

## Released candidate and evidence identity

All six requested outcomes are implemented: original-portfolio Caschlatsch
evidence, compact Mode/s A/B operation footage and simulation, six-study
UI/UX/motion/interaction refinement with all twelve existing roles, bounded
senior event/lifecycle/performance refactoring, the architecture-led README,
and owner-authorized publication with live verification. Performance and
unavailable-device limits below remain explicit.

| Release fact | Actual result |
| --- | --- |
| Application source | `567d1c051f95049ce417ee7e426d067e708ed411` |
| Required push CI | [39459999497, attempt 1](https://github.com/JosHsuan/JosHsuan.github.io/actions/runs/39459999497); all fourteen jobs successful |
| Exact execution audit | **411/411 passed**: 129 public cases on each of Chromium, WebKit and mobile Chromium; 12 framework-root and 12 simulated-subpath cases. No required skips, retries, duplicates or failures. |
| CI export | 259 files, 138 pinned public assets; distinct from the 261-file local Windows build |
| Canonical output digest | `857dd9262f3be5a8055e3433a63b1c04488a5e87e4c2e2f296fca8505e889179` |
| Tested static artifact | ID `12281314857`; ZIP SHA-256 `71094b9a6fc1a9345b5666bd174802fbc9751c99cbe964597565666e9a84479d` |
| Validated release artifact | ID `12284695977`; ZIP SHA-256 `c08660721a04c3b86a96170a8b1c0cfc1d87ac961251c7b6c70853affafc3745` |
| Publication | [39465817087, attempt 1](https://github.com/JosHsuan/JosHsuan.github.io/actions/runs/39465817087); all thirteen deployment steps successful; tested output verified, packaged and deployed **without rebuilding** |
| Live origin | [joshsuan.github.io](https://joshsuan.github.io/); release identity stable throughout checks |
| Live HTTP equality | **205** requested response bodies exactly match the CI export, including twelve sitemap routes plus index/404/metadata/assets/licenses/static files. This request plan does not cover every internal/RSC artifact file. |
| Live video delivery | Eleven active unique MP4s, **22** prefix/suffix 32-byte Range comparisons: status 206, content type, Content-Range and exact bytes passed |

The fresh required inventory/raw-log union is separate from the checked-in
gate's aggregate job-result checks; structured per-test enforcement in the
gate remains a proposed improvement. The Pages transport archive is a distinct
packaging artifact, not the original static ZIP; its payload identity and
ordering are verified through deployment evidence, without claiming an
independent transport-archive download. CI creation-to-terminal-update took
33m53s; that is pipeline elapsed time, not website performance.

All receipt paths below are relative to the ignored local
`animation-review/.local/portfolio-refactor-20261020/` evidence directory.
They are not public build inputs. Portable maintained facts remain in this
document and the linked workflow runs.

| Independent evidence | SHA-256 |
| --- | --- |
| `refactor-ci-union-2026-10-20T17-18-46.236Z.json` | `b94db75e9c57c1b13c4c49dab55765a725af0f65248dcdc7d5dd7c017a0b93f3` |
| `ci-39459999497/ci-release-audit-2026-10-20T17-18-59.015Z.json` | `be988850520b3a6e3129f1a4baec443fb1ee40d31a37db23224fd5e5e65e52a3` |
| `deployment-39465817087/deployment-provenance-2026-10-20T17-28-26.220Z.json` | `8ac1b05cd2525ed65e8d6fea97f145a248724012b5c8d5d469c9d5b6ac4028a6` |
| `deployment-39465817087/deployment-provenance-peer.json` | `2aab3b02fd151f7cb81a19432bbb499c617c42d929515207b9a18233306719b8` |
| `live-http-39459999497-2026-10-20T17-29-01.782Z-014-passed.json` | `74ff2312ffd752ec8a524b13c8ca16d0580ec54ebe61c986a05b8149e8f02b9f` |

### Native and visual acceptance scope

The downloaded exact CI export and the actual live site each completed all
eight projects at desktop 1440×1000/DPR 2 and mobile 390×844/DPR 3, producing
**108 original viewport PNGs per capture**, with no scenario/page-loading errors.
Each capture closed its browser and retained stable release identity. Native
continuous interaction, model/source participation, fallback and native-media
time are covered separately by the required CI journeys and local diagnostics;
a held PNG alone cannot establish them.

The independent candidate assistant inspected all sixteen project/profile
contact sheets and 24 selected originals. Its original receipt used the phrase
“human review” incorrectly; the append-only terminology correction explicitly
identifies assistant visual inspection, with no owner/human approval claimed.
Root separately inspected eighteen candidate originals and four contact sheets.
The matched comparison source is the frozen uncommitted design export at the
same viewport/DPR, not a claim of raw pixel identity with an old release.
The current generic rail/credit corrections and Caschlatsch distinct plates
were accepted within the recorded scope; protected Bending/XR composition and
source recipes remain unchanged.

The live capture completed at 17:38:06.945 UTC. Root inspected twelve selected
live originals and four contact sheets spanning both actual Mode/s operations,
Caschlatsch System/XR plates/credits, all six generic projects and protected
Bending/XR key states.
The live contact mapping binds all 108 unmodified originals to sixteen uniformly
scaled QA sheets; labels are outside viewport rectangles. Independent live
image inspection is recorded alongside the capture, separately from HTTP equality:
the independent assistant reviewed all sixteen live contact sheets and twelve
named originals (six desktop, six mobile), checked their hash/dimension mapping
and compared the accepted CI composition. Its verdict is accepted within the
listed live visual scope, with zero definite must-fix items.

| Native/image evidence | SHA-256 |
| --- | --- |
| `ci-39459999497/visual-candidate-review-567d1c0.json` | `a30c9ac35fb963580c5a75dc49e4bf19c0cff2dc52cfbc66b363e449ddc1b0e0` |
| `ci-39459999497/visual-candidate-review-567d1c0-terminology-correction.json` | `bcefdd3b3ced073dba13bc5730840e42e2553a067b24f3f034f7c25375a2cd25` |
| `deployment-39465817087/native-live/results.json` | `3f773df62329687b7c06c965056faaeb71025089360cec35b164b04fa19ee43e` |
| `deployment-39465817087/native-live/qa-contacts/qa-contacts.json` | `7decb2dcc6878f039858020224b0404809ce4244d2ff1205085403f4bbe108a3` |
| `deployment-39465817087/root-live-original-visual-review.json` | `6a0a2b8b9b6e8f8ed586c9af1d6e43e254814bcfb5f791ff4726d25bf53b7978` |
| `deployment-39465817087/root-live-contact-visual-review.json` | `e854486377ab4d8e2e4fc9829a0db2e0d89c355c8270a7014837b2c7862430db` |
| `deployment-39465817087/visual-live-review-567d1c0.json` | `5bc87b8a771dee8477be316aaea6623b7bc5e475f848047ef999785074fcc8fe` |

This is scoped assistant inspection, not owner approval, every-glyph review or
pixel equality across all 108 originals. Native video/field phases can differ.
Long mobile captions/prose/control tails may cross the fixed rail in a held
viewport; native wheel/source-link checks establish their reachability, not
simultaneous fit. Protected Bending mobile Form/Pattern's existing opaque prose
occlusion is retained. Original soft footage and small portfolio labels are
preserved rather than reconstructed. Physical iPhone/real Safari, accelerated
hardware, field INP, sustained frame rate, complete GPU-memory accounting and
genuine persisted BFCache restoration remain unverified.

## Source and media

Caschlatsch now uses ten reviewed derivatives of the original portfolio PDF.
Five photographs preserve embedded source RGB pixels; five technical plates
retain their reviewed 300-dpi page-raster crops without post-raster resizing,
redrawing or invented detail. The module-infill plate is explicitly the upper
schematic detail of Fig. 2-05, including all labels within that detail; its lower
module group and original caption are outside the extract. Public captions and
provenance describe this limit. Existing team credits remain separate from
source-publication credit. The seven earlier Caschlatsch assets remain byte-pinned
historical files and have no active project placement.

| Mode/s web derivative | Selected source interval | Output | Bytes |
| --- | --- | --- | --- |
| Physical cutting from RELAX.mov | Frames [90,330), real operation | 8.008 s, native 1920×1080 | 3,167,168 |
| Black-background prototype cutting | Frames [150,350), real operation | 8.000 s, native 1920×1080 | 3,176,212 |
| Machine simulation | All 120 source presentation frames | 4.800 s, proportional 4096×2304 → 1920×1080 | 498,303 |

The three silent, fast-start H.264 MP4 derivatives total **6,841,683 bytes**,
compared with the previous 123,125,597 bytes. Provenance explicitly records
intentional trimming/compression and the simulation's proportional downsample.
All 560 output-frame relative presentation timestamps and durations were checked
against the selected original intervals; compressed/decoded pixels are not
claimed lossless. Original footage, PDF, existing posters and five model files
remain unchanged. The 138 public pins comprise 125 unchanged preceding pins,
three authorized video replacements and ten new Caschlatsch images.

The independent media audit `media-peer-audit.json` has SHA-256
`f0e4df490ec90faa362fbd23e4ce1e4b101de7dc564c1bcb59b9562b6da00095`.
The broader source/code/document audit `refactor-release-source-audit.json` has
SHA-256 `f8cb0ad106b854619f0d77417b1760299aa74982490cb345f88b1a2f8d1f2fa8`.
Both are ignored local receipts under
`animation-review/.local/portfolio-refactor-20261020/`, not public build inputs.
Their conclusions are limited to their actual source/media review.

## Implemented design and runtime

All [twelve existing roles](PORTFOLIO_REFINEMENT_TEAM_REVIEW.md) independently
reviewed or implemented their allocated work. The six generic studies now use
source-sensitive opening, model, recording, documentary and closing compositions;
portrait/wide sources, technical plates and long reading receive distinct space.
The 799/800px DOM breakpoint matches the protected renderer projection. Inspection
has real ready/inspecting/returning/paused/static states, visible guidance and a
native Return control; source links and editable targets retain native keys.
Credits use the same safe entry top as other reading. Selected mouse-hover rail
labels are suppressed on generic pages to keep clicked source drawings clear;
keyboard focus and other destination hints remain available.

One `ProjectStudyChapterPresenter`, owned by `SiteBackgroundDriver`, now caches
fractional native chapter anchors on existing layout invalidation and publishes
chapter intent, rail and counter before source presentation on the same demand
frame. Markup controls no longer run a separate scroll/IntersectionObserver scan
or mirror pause in React state. Scoped pause handling publishes its truthful
label/ARIA synchronously and deduplicates external observation. Source
transactions, native video time, model/camera/material/light recipes, field
algorithms and established owner-specific clocks are unchanged. This does not
claim a single global RAF for XR and every other independent property domain.

The root [README](../../../../README.md) now describes the two real applications,
source/public-data boundaries, runtime and deployment flow, exact toolchain,
commands, reference architecture and evidence limits. Planning documents and
the reusable empty framework remain intact.

## Local evidence checkpoint

- Exact Node 24.19.0 / pnpm 11.19.0: `pnpm check` passed, including 45 CI-contract
  tests and the audited empty framework export.
- Public build passed: 261 output files, 138 approved assets, no private inputs.
- Portable case/tool suite: 525 tests, 523 passed, two skipped, zero failures.
- Explicit scoped ESLint over all 15 changed/new JavaScript/test files passed.
- Initial native captures: all eight routes, desktop and mobile, 108 unchanged
  viewport PNGs, no loading/state errors. The Director independently inspected
  20 originals across all six generic studies. This supported the direction and
  identified the credit/selected-hover fixes; it was not final visual closure.
- Dot's initial post-refactor native smoke passed drag, arrows, Home/Escape,
  Tab-to-Return/Enter and source-key behavior plus 799/800px apertures in three
  contexts. The full reading/interaction and regression work remains separate.

These local exports were built from an **uncommitted working tree** based on
`9add8195db77090027f37b163146cc65b7dda042`. Their `release.commit` is that base HEAD,
not proof that their changed code equals that commit. Frozen exports, native
facts, source hashes and an output inventory are retained locally. Final release
acceptance must bind the resulting actual commit and downloaded CI artifact.

### Follow-up after the first CI failure

The distinct Caschlatsch System/XR portfolio sources now have actual forward
and reverse passage assertions. Dot's native source-link Home waits for native
scroll and source-exit completion before the next command; exact canvas bounds,
source geometry and all inspection checks remain. These six targeted executions
passed across Chromium, WebKit and mobile Chromium. Their failed predecessor is
retained, without claiming its exact cause from incomplete CI timing evidence.

No-JavaScript coverage now enters the canonical source-first section and uses
native wheel input to read complete headings, authored paragraphs, captions and
credits within the fixed chrome. It opens an actual full-image source link and
inherits the declared browser/device context. Fractional wheel destinations are
not treated as exact browser pixel coordinates. The first revised run exposed
that test assumption; the next passed 13 cases before a mobile source-link
click was intercepted by the rail. Explicit native reading of that link before
clicking resolved the missing action precondition; all five remaining mobile
cases then passed. These are composite local results, not one final-source
24-case run. Fresh CI must execute the complete current tests without retries.

The late-listener native lifecycle diagnostic checked all eight routes and
observed nonpersisted departure/new-document history return, not BFCache.
It found Bending's retained suspended lease and SiteNavigation's remaining
listeners. A narrow follow-up now calls their existing permanent disposal only
for explicit `persisted === false`, preserving destination-owned handoff tickets
and persisted/bare suspension behavior. The Registrar releases features before
the kernel. No private R3F frame counter is forced to zero. Source review and
the focused 67-test suite do not replace native proof.

After this follow-up, `pnpm check` passed again, the public build passed with
261 files/138 assets, and the portable suite passed **528 of 530 tests**, with
zero failures. The two skipped tests require actual WebGL rear-layer rendering
and actual SVG/React browser behavior respectively; portable execution does not
establish those results. This latest local export has base metadata `05cece4`
and uncommitted follow-up code; it is not a deployable exact-commit artifact.

The rebuilt `lifetime-export` then passed a second all-eight-route late-listener
native lifecycle diagnostic: every SiteNavigation was disposed with zero
listeners; every departing background lease was released and every new history
entry held exactly one lease. Bending's Director reported disposed and no
scheduled work. Its unchanged R3F `rendererPendingFrames` allowance remained one;
that counter alone is not evidence of a live browser callback. All eight rows
reported zero scenario errors. Native events were again nonpersisted and Back
created new documents; real persisted BFCache restoration remains unverified.

## Performance evidence and limits

The before profile completed all eight routes at desktop/mobile. Six generic
pages made 1,134 / 1,054 chapter-rectangle reads during paired forward/reverse
journeys. Desktop rectangle work was only 2.3–7.6 ms per journey pair; eliminating
duplicate ownership cannot honestly explain seconds-long native stalls.
All six generic paused three-second intervals had zero controller, layout,
style, DOM-mutation or media-operation work.

Paired after measurements completed all eight routes at both profiles. Generic
journey rectangle reads changed from **1,134 to 729** on desktop and **1,054 to
723** on mobile; wheel-phase reads changed from 240 to 52 and 148 to zero.
Mode/s mobile journey reads increased from 254 to 288, so no uniform reduction
is claimed. All six generic pause intervals still had zero measured work.
All 128 paired source/model/appearance/view/camera comparisons matched; the
clean Mode/s companion added 16 matching comparisons. Native operation latency
was mixed. A contaminated initial mobile Mode/s phase remains in the evidence;
the separate clean companion is identified rather than silently substituted.
These measurements precede the permanent-departure cleanup follow-up, which
changes no active reading/render algorithm.

CPU/trace diagnostics identified native Canvas 2D `drawImage` in the unchanged
decorative field as the regular callback cost on this software-rendered host.
SystemInfo reported SwiftShader and software canvas/compositing/rasterization;
HC3DP also had approximately five-second native transition stalls outside the
measured application JS callbacks. These remain an explicit lab limitation.
A bounded immutable-atlas experiment matched all 20 full-RGBA pairs but saved
only approximately 0.9 ms desktop / 0.17 ms mobile in two isolated blocks per
source. It was rejected because the extra resource/async lifetime was not justified.
The renderer and effect therefore remain unchanged. A full-Chromium diagnostic
could not launch; there is no accelerated-hardware acceptance claim.

The [performance review](PORTFOLIO_PERFORMANCE_REFINEMENT_REVIEW.md) records raw
receipt hashes and attribution. Headless hidden-tab attempts that stayed visible
are reported as such. The first profiler's early pagehide observation was
unreliable; the late-listener lifecycle diagnostic separately proved actual
nonpersisted Mode/s cleanup and history re-entry. Neither lab Event Timing nor
browser mobile emulation establishes field INP, physical-device stability or a
real persisted BFCache restoration.

## Historical failed candidate

Candidate `05cece4dbac044323e352b5e7ce5ff4c3fd71bbf` was pushed and checked by
[CI 39451663831](https://github.com/JosHsuan/JosHsuan.github.io/actions/runs/39451663831).
Quality, both framework exports, public export and five public browser shards
passed; three public shards and the aggregate gate failed. The failed cases
concern the former shared System/XR Caschlatsch image assumption, six no-JavaScript
heading-at-entry assumptions after source-first chapter layout, and Dot's
source-link Home followed by model selection. The last includes a desktop
settlement timeout and a mobile canvas position assertion; those are retained
failures requiring diagnosis, not accepted retries. Raw failed logs and the
candidate's downloaded export remain local evidence. Its output digest is
`51bd1e9c892cbc9b9c5f7524e6f92a42796cd6b0cd40f98643d232ac7d11aaf7`;
there is no validated-release artifact and it must not be published.

The subsequent `567d1c0` candidate corrected the maintained tests and explicit
document closure, then passed its own complete fresh CI inventory, publication
and live acceptance recorded above. The failed candidate was never deployed;
its errors and local diagnostic iterations are retained rather than counted as
accepted retries. No preceding release counts substitute for the current proof.
