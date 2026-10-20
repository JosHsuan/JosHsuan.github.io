# Portfolio story/source verification

Date: 20 October 2026 (Europe/Berlin).

Status: source selection, local build and targeted browser checks verified;
final-candidate visual, hosted CI, same-artifact deployment and live acceptance
remain in progress.
This record does not accept the preceding release as evidence for this revision.
The [integration contract](PORTFOLIO_STORY_CONTINUITY_INTEGRATION.md) and
[decision 0018](../../../../docs/decisions/0018-portfolio-story-source-continuity.md)
retain the complete owner request.

## Source and content evidence

The preceding published application is `4fa0af93600cfa71c02dfd30898a7e9d7b85a33c`;
the working-tree base and remote main checkpoint are
`8bee6022f682f5a83be24ae8aed8b1bc46d08e23`. Pre-commit local exports carry that
base SHA in release metadata and must not be described as exact final-commit
artifacts. CI must build and validate the actual correction commit.

Mode/s now selects six full-frame WebPs and one complete native MP4, totaling
6,241,673 bytes. There are 124 pinned public assets: all 117 preceding paths,
byte counts and hashes are preserved, with seven new paths. Active project data
uses 43 unique documentary images through 46 references and five motion sources;
the former Mode/s real-machine movie and photographs have no active page usage.
Original files remain read-only. The three native 4K animation sources are
visually matched to the edited film, not falsely called encoded-frame-identical
to its 1080p composition.

Independent CPU review reads all four native source hashes, the prepared/public
derivative bytes, six lossless decoded-RGB comparisons, provenance and the
complete protected pin set. Its `sealed:true` selection receipt does not certify
native playback, appearance, CI or publication. Relevant ignored receipts:

| Receipt | SHA-256 / scope |
| --- | --- |
| `mode-film-source-review/mode-film-handoff.json` | `edb5addda31b7f0b0a76b01f191475d71a98f167483907d89ce249018032a8b9`; exact frame/source selection and explicit comparison limits |
| `mode-film-source-review/mode-film-integration.json` | `375db452c1b7b765f5d887ed9fb2afe3cf1f400869348b0d9f21c7f7076fb504`; new public files, native dimensions/timing and record integration |
| `mode-film-seal.json` | `e7ed32402b92eb13eaac6a66ae00f9fa9347b5ee58fb3557871f25a6f5aa6f3c`; reviewed selection bound to actual native source identities |
| `mode-film-seal-integration-review.json` | `f03af859fcca286f2afa97a59fd519066cf0ba00df47604902be533f7e576653`; actual integrated bytes, protected originals and synchronized source records |

These filenames are relative to
`animation-review/.local/source-story-revision/`. Raw preparation records and
private paths do not enter public build inputs.

Caschlatsch has five story chapters, including the owner's cloud/module
selection, beam-ID and assembly-sequence work in COMPAS XR. Its six accepted
photographs and existing photographer/cohort/research/partner credits remain.
Source/editorial review covers direct personal contribution and collaborative
scope on all eight cases. The Mode/s follow-up copy review is separately bound
to its final `project-studies.json` hash; it preserves Jan Kyselý's photographic
credit without assigning him digital animation.

## Local checks

`pnpm check` passes on the integrated source: content validation, root lint/types,
nine framework tests, 27 CI tests and the audited 63-file empty-framework export.
The reusable framework still exports zero project/research records and no
approved content assets. The required exact toolchain remains Node 24.19.0 /
pnpm 11.19.0 with the committed lockfile.

The final case-local command, `node --import tsx --test
roles/uiux-designer/cases/bending-active-thesis/tests/*.test.mjs`, reports 495
tests: 493 pass, zero failures and two existing opt-in browser probes skipped.
Those probes concern actual WebGL rear-layer optics and actual SVG/React
rendering; this CPU command is not their native browser acceptance. An earlier
attempt failed an obsolete XR assertion requiring visible portfolio-edition
and missing-authorship prose. The revised assertion preserves source-image
headers/pins and verifies direct contribution plus named collaboration instead.
Both raw attempts remain separate.

Independent review then reproduces an additional pending reverse: Adapt is
painted, Assemble is still loading, and native reading returns to Adapt. The old
retained Adapt owner could clear a newly acquired handle on the same video node.
The repair promotes the original retained controller/handle by source identity
and routes failure callbacks by current ownership. Three added regressions fail
before the fix and pass afterwards, including paused reversal, supersession,
later native errors and complete disposal. The preceding 492-test result remains
an earlier checkpoint; none of its cases were removed to obtain 495.

`pnpm build:pages` passes the complete public export/audit: 248 files and 124
approved assets, with no private inputs. The new SSR evidence-selection module
is in the explicit build allowlist. An initial pre-film build exposed its missing
allowlist entry; that entry was repaired before the successful build.

An additional `--no-ignore` lint comparison for BendingProject/SourceDiagram
finds the same three errors and two warnings at identical locations in the base
and working files. No diagnostic was introduced by this revision. The root's
normal lint scope intentionally excludes role prototypes; neither that baseline
comparison nor the required root check claims those pre-existing case findings
were repaired. The other modified SSR/helper and native-test files pass their
explicit lint checks.

## Native and release acceptance

Pre-film desktop/mobile checks prove Bending's continuous source block and XR's
continuous model/phone behavior. The delayed-phone check now compares real
paused native frame pixels/time rather than PNG equality of a transparent
full-viewport composition containing moving information/background layers.
Its source retention and atomic replacement checks pass on both profiles.
Caschlatsch's identical System/XR-guidance background retains its source key,
sequence, visible CSS opacity and lifecycle history while native reading advances.

Failed observations remain in their original logs/traces. They include the
composited-PNG assumption, treating an opacity-zero retained canvas as
Playwright layout-hidden, and comparing a canonical source's first chapter with
the current native reading chapter. Corrected checks retain actual native
source, paint, opacity, playback and interaction requirements. Windows preview
process cleanup is recorded separately from test outcomes.

The integrated 248-file pre-commit output completes 96 desktop/mobile scenarios
across canvas motion, project backgrounds, six-study reading/interaction, the
release baseline and XR: all pass, with zero retries, in 13.3 minutes. This is the
artifact before the independently discovered pending-reverse repair, so it does
not prove that edge or accept the final runtime. A rebuilt XR native suite must
exercise the real held HTTP response, reverse to the retained source, subsequent
atomic replacement, continuous visible paint and actual advancing native time.

After that repair, `pnpm check` and the complete 248-file/124-pin public build
pass again. The rebuilt XR suite completes **18 desktop/mobile executions**, all
passing without retries in **2.2 minutes**. It includes the held-response pending
reverse, original native owner restoration, rejection of late superseded source
updates, subsequent true decode/replacement, continuous phone paint, native time,
failure/context-loss, Reduced Motion and document navigation. These are local
Windows Chromium/mobile-emulation results; hosted Linux WebKit remains required.
Raw evidence is retained in `pending-reverse-native.log` and its result folder.

Final native checks and their completed scenario inventory plus high-resolution
visual review must be recorded here,
followed by the exact pushed source, successful hosted CI union/gate, downloaded
artifact digest, same-artifact deployment and live byte/native verification.
Until those receipts exist, publication and overall completion remain unproven.

## Rejected first candidate and replacement checks

Commit `14f0649a0fc848218b148798e7b227480b69430e` is pushed and runs
[CI 39356536420](https://github.com/JosHsuan/JosHsuan.github.io/actions/runs/39356536420).
The complete original logs report 402 declared executions, 394 passes and eight
failures. This is a failed candidate, not an accepted per-test union. The required
gate rejects it and no validated-release artifact exists. Its complete raw API
and ten browser logs are bound by `ci-39356536420/ci-raw-evidence-final.json`,
SHA-256 `80de121db9cfbba55c12bd2b57ecfc5f93e9e885eed53926b906898d465208d4`.

Six failed executions come from two old native fixtures still requiring a
departure at internal Form-to-System or System-to-Pattern boundaries. Both failures reproduce locally
against the exact downloaded CI output. The corrected fixtures exercise the
actual final Pattern boundary; durations, rendered-frame completion, leader
precision, event history and canvas identity assertions remain intact. The
window suite then passes eight desktop/mobile executions; the leader exit
check passes two. No production motion is changed to satisfy those old fixtures.

WebKit also reports zero contrast when reading the paused retained Adapt video
through Canvas 2D during a genuinely held next HTTP response. Trace evidence
shows that the still-owned backing video has become `display:none`; this does
not by itself prove that its GPU texture is black. The replacement keeps only
the actual VideoTexture-owned source in layout through pending/reverse changes,
while the existing painted-phone opacity keeps its DOM presentation hidden.
Replacement, failure, deadline, context loss and disposal release that ownership.
Six ownership tests fail before the repair and pass afterwards; 33 related CPU
checks pass. The rebuilt XR suite passes 18 desktop/mobile executions locally.
Native diagnostics now save active, frozen and retained pixel/alpha/transport
facts and composition PNGs before the assertions. All three retain the
contrast-above-32 requirement. Mutable DOM/buffering diagnostics are recorded
separately from the exact frozen pixel/time/frame comparison. Linux WebKit
confirmation remains required.

The fourth failure is Dot's native transport acknowledgement. Its actual source
continues advancing through 179 positive steps and ten loops, while the retained
controller has progress generation zero and play generation thirteen. A current
held, eligible and genuinely advancing `timeupdate` can now bind the current
generation and publish a real receipt. Paused, hidden, inactive, seeking,
unchanged and backward samples, old Promises and `playing` alone cannot do so.
The focused regression changes from 17 passes/two failures to 19 passes; 49
related CPU checks pass. No extra play operation, timer or frame loop is added.
The ignored repair receipts are `xr-texture-layout-receipt.json` (SHA-256
`aa722ea9c4099f1d9b9b604e62926165a1e838ecde85a94d39b8754614e0d27c`)
and `backdrop-native-progress-receipt.json` (SHA-256
`76de509d797c310dc75a68445502c78ab7991482131e79a061485b9e557c0c0a`).

The combined replacement portable run reports **508 declared, 506 passing and
two existing opt-in skips**, with no failures. `pnpm check`, the 248-file/124-pin
local public build and explicit lint for the three modified native specs pass.
A further native run against that rebuilt replacement is in progress. The
preceding 18-run XR result predates the Dot repair and the final diagnostic-only
comparison adjustment, and is not substituted for that run or hosted CI.

## First-candidate visual and photo review

The downloaded CI output has 246 files and 124 pins, digest
`2e694db1964f88930c097a3e16e73617d866d7f1607cae1f3e73daa23080b641`.
It is distinct from the 248-file Windows local build. All eight projects yield
104 completed native chapter captures: 52 desktop PNGs at 2880 by 2000 pixels
and 52 mobile PNGs at 1170 by 2532 pixels. Root and an independent reviewer each
view all sixteen proportional, uncropped contact sheets. Root additionally
views Mode's opening/making, Caschlatsch's XR-guidance and mobile XR Context at
original screenshot paths. Mode's fine, pale linework is preserved from the
native film rather than artificially sharpened or recolored.

The mobile chapter-heading captures often show the readable narrative panel
over the background. They do not prove an unobstructed model. A separate native
scroll capture therefore locates the real flow visual slots and Bending's held
source apertures without changing DOM, CSS, cameras, source selection or video
time. All nine requested apertures complete and root views all nine original
1170-by-2532 PNGs: five generic source models, Caschlatsch's opening photograph
and Bending's three internal source chapters. The existing source geometry and
side information remain visible; panels can be above or below the view. These
are Windows Chromium/mobile-emulation observations, not physical-device proof.

Independent photo review decodes 43 generic active images and 36 custom mapped
rasters, compares their bytes with the CI export and examines 147 same-project
background/evidence pairs. No same-photo or cropped-photo cross-layer duplicate
is confirmed. Similar HC3DP diagrams use the same mechanism with distinct path
annotations and are recorded as such. The combined receipt is
`photo-dedup-14f0649/photo-dedup-review.json`, SHA-256
`3a6287825ad36aa7d535a75423be0fd9e1413825e7420cdb4e5d8379960b58c5`.
The source-panel animation/full-image links receive a small spacing correction
after the visual review. Replacement-artifact and post-deployment verification
remain required; these first-candidate images cannot accept an unknown build.

Physical iPhone/Safari and Android device acceptance is not established by
desktop browser emulation or CI. No frame-rate, physical-device crash-resolution
or unchanged Bending motion claim is made.
