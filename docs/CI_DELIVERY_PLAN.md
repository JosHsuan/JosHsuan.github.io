# DORA-informed CI and delivery plan

Reviewed: 20 October 2026 against the linked official Google Cloud DORA guidance and the checked-in workflows. Scope: this repository's reusable framework and selected public application. The owner requested research and Markdown planning. Current operations remain defined by [CI/CD operations](CI_CD.md), [decision 0009](decisions/0009-impact-selected-ci.md), and the exact-commit, same-artifact publication gate. The October 20 sections below are the historical planning baseline, not a description of current implementation. The [October 22 operational status](#operational-status--october-22-2026) supersedes their planned/current-state labels where explicitly noted.

## Historical planning decision — 20 October 2026

Preserve the existing release protections and improve how quickly developers receive trustworthy feedback. First add timing and machine-readable coverage evidence; then use those observations to balance browser work and introduce a small native smoke stage. Keep each improvement independently reviewable. This amendment updates documentation only: no workflow, test selection, timeout, retry, deployment permission or product runtime changes.

| Checked-in capability | Current state | Next acceptance condition |
| --- | --- | --- |
| Cheap feedback | `quality` is independent of the long browser jobs. A dedicated native smoke stage is not implemented. | Report fast-layer completion separately from the release gate; smoke consumes the same built artifact and cannot authorize publication alone. |
| Browser scheduling | `browserMatrix` in `scripts/ci-impact.mjs` uses file shards: Chromium 4, WebKit 2, mobile Chromium 2 for full candidates; one worker per runner and zero retries. | Measure per-file/per-test costs before changing partitions. Preserve the selected test-ID union, engine coverage, assertions and source/runtime budgets. |
| Completion evidence | `scripts/ci-gate.mjs` checks selected aggregate job results and build identity. Exact per-test completion is currently checked in the separate release audit, not enforced by a structured-receipt CI gate. | Add candidate-bound receipts and reject missing, duplicate, skipped, retried or unfinished required executions before marking the candidate publishable. |
| Artifact promotion | `pages-build` creates one complete export; browser jobs verify its digest before and after testing; deployment checks successful main-push/SHA provenance and promotes that output without rebuilding. | Retain this chain throughout every experiment; stale, tampered or differently built output must still fail. |
| Operational learning | Timing samples and manual live-verification receipts exist. Automatic delivery-metric aggregation and an exercised recovery procedure are not established. | Establish comparable observations, incident links and a verified recovery operation before claiming an improvement, a failure rate or operational rollback. |

The existing selector permits conservative `case-scoped` acceptance as well as `fullCase`. A scoped candidate still runs its release baseline on all three public profiles and promotes the complete audited output. Shared runtime, source assets, workflow/build changes and unknown inputs widen coverage according to the current rules. This plan does not require every unrelated change to run every public scenario, and it does not move required acceptance out of the candidate's release chain.

## Research basis

Google Cloud's DORA research recommends frequent integration of small changes, fast automated feedback on every commit, reliable tests, and prompt repair of broken builds. Its CI capability guidance describes feedback within a few minutes and an approximate ten-minute upper bound; longer tests can be optimized, run on additional independent compute, or separated into later deployment-pipeline stages. This supports separating the fast development loop from the complete release decision. [DORA: Continuous integration](https://dora.dev/capabilities/continuous-integration/).

DORA recommends finding defects in the cheapest suitable test layer, maintaining trustworthy unit and acceptance suites, and representing real user journeys in acceptance tests. Developers and reviewers share responsibility for keeping tests useful. It does not prescribe a fixed unit/integration/end-to-end percentage. A browser defect that can be reproduced at a lower layer should gain that faster regression check while retaining browser coverage for the actual browser behavior. [DORA: Test automation](https://dora.dev/capabilities/test-automation/).

Deployment automation should promote the same tested packages, keep scripts/configuration in version control, and verify the deployed service. Small independently testable changes should continue through feedback and delivery rather than accumulate into another large release batch. [DORA: Deployment automation](https://dora.dev/capabilities/deployment-automation/), [DORA: Working in small batches](https://dora.dev/capabilities/working-in-small-batches/).

The stage names, p95 targets, shard counts and timeout values below are project engineering decisions. DORA does not specify 45 minutes, eight runners or 267 browser executions, and these values are not performance certification.

### Research-to-project mapping

| Official guidance | Application in this plan |
| --- | --- |
| [Continuous integration](https://dora.dev/capabilities/continuous-integration/) emphasizes frequent integration, quick automated feedback and immediate repair of broken builds. | Keep small changes and an independently visible fast layer; prioritize diagnosis or a validated revert when a required build breaks. The complete release suite may remain a later pipeline stage. |
| [Test automation](https://dora.dev/capabilities/test-automation/) favors reliable developer-maintained tests and finding defects in the fastest suitable layer. | Add meaningful portable regressions for state/event/geometry defects; retain native browser coverage for layout, WebGL, media and lifecycle. Fix flaky causes rather than hiding failures with retries. |
| [Deployment automation](https://dora.dev/capabilities/deployment-automation/) promotes tested packages through environments. | Preserve the existing build-once, digest-verified artifact chain and check the deployed site. |
| [Working in small batches](https://dora.dev/capabilities/working-in-small-batches/) reduces integration and feedback delays. | Deliver measurement, coverage enforcement, partition experiments and smoke as separate changes rather than one CI rewrite. |
| [Software delivery performance metrics](https://dora.dev/guides/dora-metrics/) measure application-level delivery outcomes in context. | Track the five production metrics below separately from CI duration, cancelled validation runs and test counts. |

These are project-specific applications of the research, not a DORA-prescribed workflow. The existing documentation-only exception is also a local policy: selector/gate regressions still run, but a wholly documentation-only computed change set creates no application build or new publishable output when full validation is not forced and a valid baseline is available.

## Observed baseline and the current repair

The current implementation already provides:

- A conservative change-to-feature/integration-test map, unions for multiple changes, and full validation for shared, unknown, dependency, workflow and build inputs. Pushes include changes since the last successful ancestor; failed/cancelled intermediate commits do not disappear.
- A fast `quality` job, separate framework root/subpath checks, one complete public build/audit, and browser jobs that download that exact output. At the measured `ddafd44` checkpoint, full public validation had 89 scenarios per engine/profile: **267 executions across Chromium, WebKit and mobile Chromium**, in **4/2/2 file shards**. Later feature additions can extend that scenario union; the timing sample below remains tied to its original commit. Each runner uses one software-GPU worker and no automatic test retry.
- Digest checks before and after each browser run, a required gate rejecting failed or unexpectedly skipped jobs, and publication of the validated artifact without rebuilding. Documentation-only runs produce no new public release.

Here, documentation-only means the **entire computed change set** is documentation. It still runs selector/gate tests and the plan, while expensive application jobs are excluded. A Markdown-only latest commit can still require full validation when the successful baseline is missing, earlier application changes remain unvalidated, or full validation is forced. This repository policy is distinct from interpreting every commit as a request to run all 267 browser executions.

Run [39147112657](https://github.com/JosHsuan/JosHsuan.github.io/actions/runs/39147112657) exposes a capacity problem: seven runners finish with 247 passes, but Chromium 2/4 reaches its twentieth case after approximately 28 minutes and is cancelled by the 30-minute job budget. That case has an existing six-minute CI scenario budget and is cancelled after about 109 seconds. There is no final result for it; this run is not a 267-pass release gate. Raw details remain in [the verification record](../roles/uiux-designer/cases/bending-active-thesis/OCR_XR_VIEWPORT_VERIFICATION.md).

Commit `ddafd44` changes the browser-job ceiling to **45 minutes**. Functional assertions, individual test deadlines, the eight-runner union, worker/retry settings and artifact gate stay unchanged. This bounds a complete validation attempt while allowing valid scenarios and final digest checks to finish. It does **not** meet the fast-feedback objective by itself. Its full replacement [run 39149807622](https://github.com/JosHsuan/JosHsuan.github.io/actions/runs/39149807622) completes with all **267 unique executions passing** and a successful required gate; Chromium 2/4 completes its twenty cases in 30.7 minutes. Its own validated artifact is used for promotion.

The completed run provides this first full-run timing sample. Durations below are the original Playwright suite summaries, not queue-inclusive workflow duration or production lead time.

| Browser batch | Passed | Suite duration |
| --- | ---: | ---: |
| Chromium 1/4 | 25 | 9.3 min |
| Chromium 2/4 | 20 | 30.7 min |
| Chromium 3/4 | 22 | 27.8 min |
| Chromium 4/4 | 22 | 8.2 min |
| WebKit 1/2 | 45 | 14.8 min |
| WebKit 2/2 | 44 | 10.4 min |
| Mobile Chromium 1/2 | 45 | 17.5 min |
| Mobile Chromium 2/2 | 44 | 11.5 min |

The eight parallel browser-job logs span approximately 31 minutes 22 seconds; summing suite execution times gives approximately 130 minutes 11 seconds. These are different measurements, and neither establishes a p95 or a controlled speedup. The independent [verification record](../roles/uiux-designer/cases/bending-active-thesis/OCR_XR_VIEWPORT_VERIFICATION.md) records the exact log hashes, timestamps, gate and artifact digest. The uneven distribution makes duration-based partitioning the first performance experiment after the bounded capacity repair.

The six-study revision at commit
`7ccff6d6bdc89cd8574023e23ea2f1848ff1716b` completes full
[CI run 39169380999](https://github.com/JosHsuan/JosHsuan.github.io/actions/runs/39169380999)
on 18 October 2026 UTC: **114 unique cases per profile / 342 public executions**
across three browser profiles (Chromium, WebKit and mobile Chromium), plus
**12 framework executions each at root and `/portfolio-test`**, all passing.
The raw-log union contains all 366 expected executions without duplicate,
missing, skipped, retried or unfinished browser cases. Downloaded run and final
jobs API records identify that exact SHA, run ID and successful completed jobs;
the final union binds their job IDs to the original logs and pinned test
inventory. The successful
[required gate](https://github.com/JosHsuan/JosHsuan.github.io/actions/runs/39169380999/job/117805645781)
and artifact verification bind the same plan/build/run to digest
`8c44c2effb1bf0243439920f55a0de4d0d5c44e344a0d066073c76463132c72e`.
The retained `union-audit-final.json` and `gate-summary.json` record that binding;
their SHA-256 digests are respectively
`55012bb18ec49372f0aece1ecf2cf82eecffc0f7582aabe1aa54e7e156d80c9b`
and `e3658012514603ac1455e767b54d20627b1ba351096e3595160cc13d0f2666e7`.
The [same-artifact deployment](https://github.com/JosHsuan/JosHsuan.github.io/actions/runs/39171781875)
succeeds for the same SHA. Live verification confirms 176 exact HTTP byte
comparisons, all 109 source pins and eight original-video range responses.
The six-study desktop/mobile native captures and protected Bending regression
are recorded separately in the [integration record](../roles/uiux-designer/cases/bending-active-thesis/SIX_PROJECT_STUDIES_INTEGRATION.md).

The eight original Playwright suite summaries provide this second full-run
sample. They exclude job setup, queue time and final artifact checks.

| Browser batch | Passed | Suite duration |
| --- | ---: | ---: |
| Chromium 1/4 | 30 | 18.3 min |
| Chromium 2/4 | 39 | 28.1 min |
| Chromium 3/4 | 17 | 18.1 min |
| Chromium 4/4 | 28 | 4.1 min |
| WebKit 1/2 | 69 | 19.5 min |
| WebKit 2/2 | 45 | 12.4 min |
| Mobile Chromium 1/2 | 69 | 13.4 min |
| Mobile Chromium 2/2 | 45 | 12.9 min |

The workflow was created at **21:47:28 UTC**. API job timestamps put the first
scope-plan result at **19 seconds**, the completed `quality` result at **74
seconds**, and the completed public build at **82 seconds** after creation,
including dependency waits, queue and setup. The quality job itself spans
**53 seconds**; its validation and portable-test steps span **12 and 14 seconds**
respectively. The required gate completes at **22:18:13 UTC**, **30 minutes 45
seconds** after workflow creation. These are distinct observations; the proposed
complete fast layer, including a dedicated native smoke stage, is not established
by the quality timing alone.

The eight browser suites range from **4.1 to 28.1 minutes** and sum to approximately
**126 minutes 48 seconds** using their rounded native summaries. Chromium 2/4 is
the slowest batch; its raw diagnostics identify `model-inspection.spec.mjs`
at **15.6 minutes** and `motion-feedback.spec.mjs` at **6.0 minutes**. Chromium
1/4 and 3/4 also contain **7.4-minute** files, while Chromium 4/4 finishes its
28 cases in 4.1 minutes. File counts alone therefore remain insufficient for
balancing GPU work. Framework root/subpath suites take **18.2 / 17.1 seconds**.
This is one completed sample, not a p95. Coverage expanded from 267 to 342 public
executions, with changed application/source work and uncontrolled runner
variation; the two runs do not establish a controlled acceleration. This revision
does not change the CI workflows. The first offline union-parser attempt mistook
Playwright's `Slow test file` diagnostic for a case; the corrected ignored parser
passes against the same unchanged raw logs, and that helper error is not a product
or CI test failure.

The [integration record](../roles/uiux-designer/cases/bending-active-thesis/SIX_PROJECT_STUDIES_INTEGRATION.md)
keeps the owner-superseded `6dcb159` candidate separate from this restored-spread
and material/light revision. New source, clone/disposal and light-placement
contracts run in the cheap CPU layer; native PMREM/transmission, source first
draw, interaction and visual acceptance remain browser/release checks. Future
duration balancing must account for those GPU costs and retain all source
geometry, original time bounds and the exact scenario union. A superseded-run
cancellation is not a production change failure or a completed-run timing sample.

## Latest motion-workload observation

The native source-motion candidate `4fa0af93600cfa71c02dfd30898a7e9d7b85a33c`
completes [CI 39324474356](https://github.com/JosHsuan/JosHsuan.github.io/actions/runs/39324474356)
with all 14 jobs successful. Its fresh raw-log union contains **124 scenarios
per profile / 372 public executions**, plus **24 framework root/subpath
executions**, all passing without retries, skips or incomplete cases. The
[motion verification record](../roles/uiux-designer/cases/bending-active-thesis/PROJECT_BACKGROUND_MOTION_VERIFICATION.md#exact-successor-ci-and-gate)
binds the exact source inventory, logs, run and artifact gate.

| Browser batch | Passed | Native suite summary |
| --- | ---: | ---: |
| Chromium 1/4 | 32 | 15.3 min |
| Chromium 2/4 | 47 | 16.7 min |
| Chromium 3/4 | 17 | 24.9 min |
| Chromium 4/4 | 28 | 6.9 min |
| WebKit 1/2 | 79 | 15.5 min |
| WebKit 2/2 | 45 | 9.9 min |
| Mobile Chromium 1/2 | 79 | 22.2 min |
| Mobile Chromium 2/2 | 45 | 14.2 min |

The workflow spans **21:03:46–21:31:14 UTC on 19 October 2026: 27m28s**.
Quality takes **49 seconds**, completing **75 seconds after workflow creation**;
the public build takes **56 seconds**, completing **82 seconds after creation**.
These distinguish active job time from queue/dependency-inclusive feedback.
They do not establish the proposed complete fast layer, native smoke or p95.
The slowest batch is now Chromium 3/4 despite its 17 cases. This reinforces
measuring actual duration and workload before changing partitions; comparing
these 372 public executions with the earlier 267/342 public executions is not a
controlled speedup experiment.

This repair also illustrates an appropriate earlier regression layer: controlled
native-event/Promise tests fail before the resumed-media state repair and pass
afterwards, while the actual second-visit time advance remains required in
Linux WebKit and the other browsers. Waiting and seeking are not accepted as
playback evidence. The preceding failed CI attempts remain pipeline failures,
not production incidents; they were not deployed. No workflow optimization,
new smoke stage, metric collector or recurring automation is implemented by
this documentation update.

### Story/source candidate observation — 20 October 2026

The story/source correction at `9608cdb6b018384e96d6130564b69a6e5f5d6665`
completes [CI run 39363796520](https://github.com/JosHsuan/JosHsuan.github.io/actions/runs/39363796520)
with **402 exact required browser executions**: 126 public cases in each of
Chromium, WebKit and mobile Chromium, plus twelve framework cases at each of
root and the simulated subpath. The independent fresh inventory/raw-log union
rejects missing, duplicated, skipped, retried or unfinished cases; all 402 pass.
All fourteen jobs and the required validation gate succeed. This remains an
independent release audit; structured per-test enforcement inside the checked-in
CI gate is still the proposed work below.

| Public browser batch | Passed | Playwright suite duration |
| --- | ---: | ---: |
| Chromium 1/4 | 33 | 21.4 min |
| Chromium 2/4 | 47 | 28.9 min |
| Chromium 3/4 | 17 | 23.2 min |
| Chromium 4/4 | 29 | 9.1 min |
| WebKit 1/2 | 80 | 23.0 min |
| WebKit 2/2 | 46 | 8.1 min |
| Mobile Chromium 1/2 | 80 | 22.4 min |
| Mobile Chromium 2/2 | 46 | 8.2 min |

The workflow spans **03:20:44–03:52:12 UTC: 31m28s**. Quality takes
**40 seconds of active job time** and completes **60 seconds after workflow
creation**; the public build takes **64 seconds**, completing **84 seconds after
creation**. These early results are distinct from complete release acceptance.
The eight suite durations are rounded native summaries, not job wall-clock
times. The workload differs from earlier samples, so this run establishes
neither a controlled speedup nor a p95. The uneven durations support the planned
measurement-first partition experiment; they do not authorize skipping cases
or changing budgets. The [verification record](../roles/uiux-designer/cases/bending-active-thesis/PORTFOLIO_STORY_CONTINUITY_VERIFICATION.md)
retains failed predecessors, raw evidence and exact-artifact provenance.

### Latest refinement candidate observation — 20 October 2026

The subsequent refinement source `567d1c051f95049ce417ee7e426d067e708ed411`
passes [CI 39459999497](https://github.com/JosHsuan/JosHsuan.github.io/actions/runs/39459999497),
with fourteen successful jobs and **411 exact required browser executions**:
129 public cases on each of Chromium, WebKit and mobile Chromium, plus twelve
framework cases at root and twelve at the simulated subpath. The independent
fresh inventory/raw-log union records no missing, duplicated, skipped, retried
or failed required execution. The existing gate still checks aggregate results;
structured per-test gate enforcement remains proposed below.

Workflow creation to terminal update spans **16:43:50–17:17:43 UTC: 33m53s**.
Quality takes 56 seconds of active job time and completes 93 seconds after
creation; the public build takes 59 seconds and completes 96 seconds after
creation. These are distinct pipeline observations, not website interaction
latency, a controlled speedup, a percentile or a DORA production-metric rating.
The changed workload precludes a direct speed comparison with the preceding
402-case sample. [Deployment 39465817087](https://github.com/JosHsuan/JosHsuan.github.io/actions/runs/39465817087)
then promotes the tested artifact without rebuilding. The
[refinement verification](../roles/uiux-designer/cases/bending-active-thesis/PORTFOLIO_REFINEMENT_VERIFICATION.md)
records failures, exact artifact identity and separate live acceptance.

## Planned feedback and release stages

The table describes the target structure. Existing jobs implement parts of it; the dedicated fast browser stage and duration reporting are proposed improvements.

| Stage | Scope and output | Target / release relationship |
| --- | --- | --- |
| Change plan | Validate scope mapping, cumulative history, renames and required-job rules. Expose the selected reasons. | Immediate visible plan; a missing baseline selects full coverage. |
| Fast checks | Content/schema/private-path checks, lint/types, portable event/state/readiness/geometry tests, source/font pins and CI gate tests. | Project target: p95 active execution within five minutes; also report queue-inclusive feedback. A failure blocks delivery. |
| Build and native smoke | Create the complete public artifact once; run a small high-value native browser journey for navigation, entry/fonts, prepared first draw and bounded failure. | Project target: required fast-layer feedback within ten minutes of workflow creation, including queue time. A smoke success is an intermediate result. |
| Selected acceptance | Existing impact-selected journeys and release baseline across three browser profiles (Chromium, WebKit and mobile Chromium), against the same complete artifact. | All selected cases must pass; shared inputs continue to select full coverage. |
| Full release validation | Required cross-engine WebGL/source fitting, pointer/touch/keyboard, lifecycle/context loss, glass/reading, actual media, responsive and protected-source checks. | Full candidates retain the complete scenario union. Longer acceptance work remains a release condition after fast feedback is available. |
| Publication and production feedback | Validate push/main/SHA/digest provenance, publish the tested artifact, then check live release/routes/bytes and required native journeys. | Complete only after live verification. Retain the previous verified release identity and recovery evidence. |

Fast checks can overlap artifact preparation. Browser smoke and comprehensive acceptance must consume the build's recorded digest. Changes to stage selection require regression evidence that their test-ID union preserves all required coverage; a fast green status cannot replace `Required validation gate` or mint a publishable record.

## Ordered improvement work

1. **Measure before repartitioning.** Record queue, checkout/install/cache, build/audit, individual test, browser teardown and artifact-verification times separately. Keep timeouts and cancelled observations. Compare full and scoped runs separately, including engine, runner and toolchain identity. The successful replacement run's 8.2–30.7 minute suite durations demonstrate imbalance; the preceding cancelled run remains a separate capacity observation. Neither establishes a population p95.
2. **Balance isolated GPU jobs.** Use measured file costs to evaluate a duration-balanced partition or additional independent runners. Preserve complete file-local sequences, one GL worker per runner, browser coverage and an exact test-ID union check. Measure the longest shard and total runner-minutes; improving one at the expense of the other must be visible. Do not simply add simultaneous GL workers to the same constrained machine.
3. **Expose fast results independently.** Give the existing inexpensive checks a clear first-feedback status and evaluate a small native smoke layer. Keep the full selected suite in the same candidate's delivery chain. Scope maps must include CSS/event integration and shared inputs, not only direct imports.
4. **Move suitable regressions earlier.** Examples are font readiness terminals, event/state cancellation, geometry calculations, schemas/pins and gate provenance. Keep real browser tests for native font acquisition, layout, WebGL fitting/hits, media, GPU lifecycle and engine compatibility. Reduce repeated setup only after proving readiness, resource ownership and error paths remain exercised.
5. **Keep diagnosis and recovery explicit.** Classify product assertion failures, CI capacity/timeouts, runner/setup failures and superseded-run cancellation separately. Preserve logs/traces and identify the last completed case. Diagnose before rerunning; a rerun success does not erase the original failure. Review unreliable cases and fix their cause rather than increasing retries or relaxing assertions.
6. **Deliver small verified changes.** Separate typography, CAD imagery, shared-runtime work and CI-capacity maintenance when each can be independently reviewed and delivered. Keep source/visual evidence with each candidate. Document and exercise a recovery path compatible with existing SHA/digest checks; a retained old artifact alone is not proof of an operational rollback mechanism.

These improvements should be separate small changes with their own validation. This document does not change the active run's tests, schedule recurring jobs or bypass owner publication scope.

## Implementation sequence and completion evidence

The next implementation should use the following small, independently reviewable changes. These are proposed work items; this planning amendment changes no workflow, selector, browser partition, timeout or publication condition.

| Order / status | Proposed change and repository location | Responsible work | Evidence required before completion |
| --- | --- | --- | --- |
| 1 — planned | Add per-test and stage timing receipts to the existing CI reporting path, starting with `.github/workflows/ci.yml` and `scripts/ci-run-pages.mjs`. | CI/release, with browser/performance review | UTC timestamps and run/attempt/SHA/profile identities; separate queue, setup, execution and teardown; failed/cancelled observations retained. Establish a baseline before comparing improvements. |
| 2 — planned | Enforce the selected execution inventory in `scripts/ci-gate.mjs`, using structured browser receipts and selector/gate regression tests. | CI/release and browser/QA | Bind receipts to the exact plan, source SHA, run/attempt, profile, shard and build digest. Compare actual results with an independently generated expected inventory; fail on omissions, duplicates, unexpected skips/retries, unfinished cases or mismatched identities. Exercise empty, partial, stale and tampered receipt failures. |
| 3 — planned | Experiment with measured-duration partitions in `scripts/ci-impact.mjs` and the browser runner. | CI/release and browser/performance | The same required test-ID union across all profiles, no duplication or omission, one GL worker per runner, unchanged retry/assertion budgets, artifact digest intact. Compare longest-shard duration and total runner-minutes on comparable workloads. |
| 4 — planned | Introduce a clearly named native smoke stage consuming `pages-build` output. | Runtime/development and browser/QA | Real entry/navigation, source first draw and bounded failure journeys; build digest checked before and after; the same candidate still reaches its selected acceptance jobs and required gate. A smoke-only record cannot be published. |
| Ongoing | Move suitable regressions into portable tests alongside changes; retain engine-specific acceptance. | Developers and relevant interaction/source reviewers | A demonstrated defect caught by the earlier layer, with native layout, media, GPU and lifecycle behavior still verified in the browser where needed. No test-count target or fixed test-pyramid percentage. |
| 5 — planned | Exercise recovery against the existing deployment provenance checks and document the operation in `docs/CI_CD.md`. | CI/release and owner within the established publication scope | A verified eligible artifact, recorded failure/recovery times and successful live release/route checks. Do not weaken SHA/digest eligibility to promote an old artifact. Record any current gate limitation before claiming rollback is operational. |

The developer responsible for a breaking change owns the initial diagnosis and repair, with CI/release work checking infrastructure and provenance failures. Repair a broken build before starting the next optimization. If a repair cannot be made promptly, evaluate reverting the offending change, with the same source protection and validation rules. Keep optimization failures separate from production incidents. This follows DORA's emphasis on frequent integration and immediate build repair; it does not authorize unrelated product changes. [DORA: Continuous integration](https://dora.dev/capabilities/continuous-integration/).

For each experiment, retain the candidate and baseline SHAs, scope, raw observations, coverage union, artifact identity and outcome. Report sample count and workload differences before quoting a percentile or speedup. The first objective is a trustworthy feedback loop; adding a measurement dashboard is optional and should follow a demonstrated need. [DORA: Software delivery performance metrics](https://dora.dev/guides/dora-metrics/).

The first receipt change should preserve raw Playwright outcomes rather than parse a green summary alone. Generate expected IDs from the candidate's selected specs and profile configuration; do not freeze a historical total such as 267, 342 or 372 into the gate. Keep collection failures visible and fail closed for required missing evidence. This is a proposed extension to the gate, not a claim about its current behavior.

Before changing CI code, run `pnpm test:ci` for the current selector/gate baseline. An implementation must additionally pass `pnpm check`, relevant negative receipt/selection tests, and the actual required browser matrix against the recorded output. A Markdown-only amendment needs link/source and diff review; rerunning expensive browser suites would not validate the planning text.

## Measurement contract

Use UTC event timestamps, commit/run/attempt/job identities, scope, engine/profile and artifact digest. Publish raw sample counts alongside p50/p95, separate queue from active execution, and flag censored timeout/cancellation data. Fast-feedback latency runs from workflow creation until all required fast-layer results are terminal; the ten-minute p95 target includes queue time. Active execution is a separate diagnostic, not a subtraction used to claim the end-to-end target was met. Set the first measured baseline before claiming an improvement. Also target zero job-wallclock cancellations while a test remains inside its valid scenario budget. The 45-minute safety ceiling is not the target runtime.

Pipeline diagnostics include first-feedback latency, build/acceptance duration, longest-shard versus median-shard time, total runner-minutes, infrastructure cancellations, genuine flaky failures and time to repair a broken build. Test count and green rerun count are insufficient quality measures.

Current DORA guidance defines **five production delivery metrics**, grouped into throughput and instability. Measure them for this application and use trends to guide improvement, with context and raw counts. [DORA: Software delivery performance metrics](https://dora.dev/guides/dora-metrics/), updated 5 January 2026.

| DORA metric | Definition | Evidence for this site |
| --- | --- | --- |
| Change lead time | Commit to production deployment. | Application commit timestamp to the verified deployment that first includes it; retain the deployed SHA. |
| Deployment frequency | Production deployments over time. | Successful Pages deployments with verified public release identity; documentation pushes are not deployments. |
| Failed deployment recovery time | Time to restore service after a failed deployment requiring intervention. | Incident start and verified recovery, including which artifact restored service. |
| Change fail rate | Share of deployments requiring immediate intervention. | Production deployments requiring a hotfix, rollback or equivalent intervention divided by deployments in the same window. |
| Deployment rework rate | Share of deployments that are unplanned responses to production incidents. | Incident-linked unplanned deployments divided by deployments in the same window. |

CI cancellation before publication is a pipeline event, not automatically a production change failure or deployment rework. Recovery time is not the duration of a failed CI run. Mark missing production evidence as unavailable; do not invent zero rates, an “elite” rating or a service-level guarantee from these runs. The five-metric evolution is explained in [DORA's metric history](https://dora.dev/insights/dora-metrics-history/).

**Collection status:** the five production metrics above are defined for future reporting; the current workflows do not automatically aggregate them. Existing run, deployment and live-verification receipts support manual investigation. Incident-linked recovery/rework evidence and a statistical baseline are incomplete. As an initial local review policy, CI/release work should summarize a rolling 30-day window at a monthly delivery review, with the owner reviewing incidents and recovery decisions. Show the window, observed counts and missing data; short or empty windows remain explicitly insufficient for rate or percentile claims. This is a review plan, not a newly scheduled automation.

## Review responsibilities and acceptance

Developers maintain useful unit/contract tests with changes; browser/QA and interaction roles review native journey coverage; geometry/art-direction roles protect source and visual acceptance; CI/release work owns scope selection, runtime measurements and artifact provenance. The owner retains the existing publication scope. Review the most significant measured constraint first and record outcomes before selecting the next change.

Accept a future CI optimization only when required scenario IDs and artifact checks remain covered, the relevant real browser cases pass, incomplete/cancelled jobs cannot publish, and comparable measurements support the stated latency/cost result. Retain source facts and historical failed receipts. This planning record itself is Markdown-only and does not modify product runtime or the reusable empty framework.

## Targeted feedback and balanced acceptance (October 22, 2026)

The manual `Targeted candidate preflight (not publishable)` workflow is a **feedback tool**, never release acceptance. First install this workflow through the normal complete gate. For later iteration, push a candidate to the reserved `preflight/**` branch namespace, select that branch in workflow dispatch, provide exact space/comma-separated `tests/pages/*.spec.mjs` paths, and select one browser profile. The workflow pins the dispatch SHA, checks the checkout, builds the candidate once, and runs those files. Repeat for affected profiles as needed. Only this reserved namespace is excluded from automatic **push** validation; every pull request and ordinary/main push retains its existing required checks. Batch fixes, then run the normal acceptance path before release. Do not treat a green preflight as browser coverage or publication authorization.

Preflight has only `contents: read`, does not persist checkout credentials, and uploads only `preflight-*` evidence with `publishable: false`. It cannot produce the normal release artifacts. The existing deploy workflow still independently requires a successful main push of `ci.yml`, exact commit/run, complete validation and the tested export digest. No deployment verifier or permission was relaxed.

Full acceptance retains four Chromium, two WebKit, and two mobile Chromium runners, one worker each. It now assigns **whole files** by deterministic longest-first historical duration rather than native count-based shards. Existing fixture groups (including the background-motion video fixture) stay in their file's bin. Unknown/new files receive the profile's maximum historical file duration (at least 60 seconds), with deterministic ties. Timing hints affect placement only, never inclusion or test assertions.

The build job independently enumerates the candidate's selected test inventory for all three profiles, including project, file, title path, repeat index and Playwright ID. Each shard uploads observed identities, statuses and durations. The gate checks exact once-only union, selection, commit, workflow run **and attempt**, and the original export digest. Missing/duplicate/stale/failed/skipped/retried executions fail closed. The current suite has no intentional skips or expected failures; adding such policy requires explicit review rather than silently accepting them. Re-run **all jobs** after a failed attempt: reusing an earlier attempt's inventory/receipts is deliberately rejected. Existing before/after export checks and same-artifact deployment remain intact.

Measured baseline: run [39755662853](https://github.com/JosHsuan/JosHsuan.github.io/actions/runs/39755662853), commit `8afd5bc44bc7dc329b9b142d3748f459c6e168de`, took 37m56s; the Pages build job took 58s (actual build 20s). Browser test steps ranged 11m19–31m36 on Chromium, 13m16–27m09 on WebKit, and 13m42–25m16 on mobile. The critical WebKit job additionally spent 7m50 installing dependencies: Ubuntu apt fetched 117 MB in 7m23, while the WebKit binary download took approximately 3s. This network/setup outlier is separate from test balance and is not solved by browser-binary caching.

Retrospectively assigning the logged per-file durations to the same runner budget models maxima of approximately 20m31 Chromium / 20m11 WebKit / 19m27 mobile, **not a runtime guarantee**. The original weights were derived from sequential logged test starts (including intervening setup/teardown), not precise reporter durations. Later per-file calibration sources explicitly identify reporter-duration sums versus logged elapsed spans. No tests, assertions, browser profiles or source quality gates were removed. Targeted preflight supplies iterative feedback; the observed full-image run below is evidence of one completed run, not a controlled measurement of balancing alone.

### Bound setup separately from browser acceptance

Bootstrap run `39762820792` at `183ce448` completed seven browser shards, but WebKit 2/2 exhausted the unchanged 45-minute job budget: apt fetched 116 MB in **42m34s (45.4 kB/s)**; the pinned WebKit binary then downloaded in approximately **3 seconds**. Only about 100 seconds remained for its 73 tests. This establishes an OS-package-fetch delay, not a website test failure; the underlying network cause is unknown. The gate correctly failed and the partial run is not release acceptance.

The initial fail-fast mitigation split Pages-browser and targeted-preflight installation into Playwright's supported separate `install-deps <engine>` and `install <engine>` commands, bounded to **8 minutes** and **3 minutes** respectively. These are conservative fail-fast limits informed by ordinary installations and observed 2m19s/7m50s setup outliers, not performance guarantees. Dependencies, pinned browsers, package mirrors, runner budget, 45-minute job cap and all test assertions remain unchanged. A timeout fails closed and the runner is discarded; there is no automatic retry of possibly interrupted apt/dpkg, no `continue-on-error`, and no fallback package source. This mitigation did not initially change framework installation. It is historical for full CI: Pages-browser and both framework jobs subsequently migrated to the qualified image described below. Only the default VM preflight path still uses the 8-minute dependency / 3-minute browser-install limits; image preflight does not run apt. Every release candidate still requires its complete current-attempt inventory and browser gate; targeted preflight and seven successful bootstrap shards cannot substitute for it.


## Historical operational checkpoint — October 22, 2026

Live/main baseline `146e8938b5937d2eb2ea0e4eed106cf004249325` completed [full run 39813261739](https://github.com/JosHsuan/JosHsuan.github.io/actions/runs/39813261739): **429 Pages browser executions plus 24 framework executions passed**, including Firefox in the root/subpath framework checks. The observed full-run duration was **29m29s**. This is one observation, not a guarantee or controlled before/after speedup: setup, runner scheduling, test content and environment can differ. The historical October 20 receipt/timing/partition proposals above have since been implemented; a separate publication-authorizing smoke-only path has not.

Pages-browser and both framework jobs now use the qualified official Playwright **1.63.0 Noble amd64** image, pinned to `mcr.microsoft.com/playwright@sha256:bc6ab0d6d44ff4826e4cb8c1e6d801e185bfc42bb0753f8e2a30efc70db054c7`, rather than downloading apt dependencies on each runner. Nonroot identity, mount writability, exact Node 24.19.0 / pnpm 11.19.0 / browser versions and environment fingerprints remain checked. Pages keeps 4/2/2 runners, one worker and zero retries; framework keeps two workers and one retry. No deployment eligibility, permissions, required test inventory or same-export-artifact checks changed. The image avoids the observed per-run apt-fetch stage; it does not guarantee graphics equivalence or eliminate every source of CI latency. Qualification retained the observed unsupported ↗ fallback-glyph difference rather than claiming pixel identity.

### Small, provenance-bound scheduling calibration

Only two previously unweighted files receive explicit weights; all existing file weights remain unchanged. `scripts/ci-test-weights.json` retains the original source metadata and adds per-profile/file `calibrationSources` overrides. Unknown future files still get the deterministic maximum-file fallback. These values influence placement only, never selection or acceptance.

| File / source method | Chromium seconds | WebKit seconds | Mobile Chromium seconds |
| --- | ---: | ---: | ---: |
| `bending-scroll-camera.spec.mjs`: sum of passed zero-retry test durations from full run 39813261739 | 234.927 | 56.632 | 105.495 |
| `global-window-motion.spec.mjs`: first logged test start through the 12-passed summary, healthy single-file preflight | 327.119 | 183.289 | 195.052 |

The Bending measurements exclude suite/job setup and some teardown. Global elapsed spans include intervening setup/teardown and final reporter overhead, but exclude earlier build/browser startup. Global source commit is `604e8bd126b9566db1403f17b15aef4f205b1675`; each of [Chromium 39830893383](https://github.com/JosHsuan/JosHsuan.github.io/actions/runs/39830893383), [WebKit 39831042827](https://github.com/JosHsuan/JosHsuan.github.io/actions/runs/39831042827) and [mobile 39831177660](https://github.com/JosHsuan/JosHsuan.github.io/actions/runs/39831177660) passed exactly 12 tests. Exact artifact IDs, attempts and measurement boundaries are recorded beside the weights. Failed earlier global-file timing is not used. Mixed historical methods are scheduling hints, not a comparable benchmark or a predicted runtime reduction.

These 36 targeted executions are **nonpublishable preflight evidence**, not acceptance of the global-glass candidate. Its complete current-SHA 465-test Pages inventory and framework/quality/same-artifact gate remain mandatory and pending at this checkpoint.

### Narrative-file calibration checkpoint — October 22, 2026

The new `tests/pages/three-case-narrative.spec.mjs` adds six tests per browser profile (three source narratives, each with JavaScript and without JavaScript). Healthy targeted runs at exact commit `70dc4ad8c72f57d1aa545f89e234aad20ac323a9` passed **20/20 each**: [Chromium 39855692909](https://github.com/JosHsuan/JosHsuan.github.io/actions/runs/39855692909), [WebKit 39855808399](https://github.com/JosHsuan/JosHsuan.github.io/actions/runs/39855808399), and [mobile Chromium 39855920236](https://github.com/JosHsuan/JosHsuan.github.io/actions/runs/39855920236). Only the new file's measured weight is added: **11.266 / 56.551 / 9.590 seconds**, respectively. Every previously recorded weight and its provenance remain unchanged; failed earlier narrative-preflight timings are excluded. The final candidate additionally captures native-centered caption closeups after the existing full-figure PNGs; these measurements precede that small evidence-capture addition, and no speculative timing adjustment is applied.

Each value sums the six matching file-test intervals from a logged test start to the next logged test start. In all three runs these are positions 14–19; the boundary is test 20, `project-background-motion.spec.mjs`, not the final suite summary. This preserves fixture interleaving: the later Dot native-loop test, earlier files, build, final reporting and upload are not charged to the new file. Intervening setup/teardown remains included. Per-profile metadata records the exact SHA, run/attempt, job ID, selected positions and timestamp boundaries for reconstruction.

This removes the new file's conservative maximum-file fallback without changing the deterministic whole-file algorithm, 4/2/2 runner budget, required test IDs or release gate. The mixed historical weights remain placement hints, not predicted runtime savings. Actual pinned CLI enumeration now contains **483 tests across 31 files, 161 per profile**; inventory listing is not execution. The 60 healthy targeted executions are nonpublishable feedback, not full release acceptance. Complete current-candidate browser/framework/quality validation and same-artifact publication checks remain required.

### Pre-main integration checklist

Before moving a reviewed candidate to `main`, retain results for **both** portable test layers, not only the CI-planning contracts:

- `node --test tests/ci/*.test.mjs`
- `node --test roles/uiux-designer/cases/bending-active-thesis/tests/*.test.mjs roles/uiux-designer/tools/*.test.mjs`
- Repository type checking, scoped/full lint as applicable, and the normal `build:pages` export/audit command.
- Actual pinned Playwright inventory plus independent source review and affected cloud preflight evidence.

If an execution-environment restriction blocks a command, record it as unexecuted rather than treating a different test layer as a substitute. The October 22 narrative integration initially missed an existing Caschlatsch primary-layout expectation because only the CI-planning tests had been run locally; the full cloud quality job correctly blocked release. This checklist does not replace the complete current-SHA cloud quality/framework/browser gate or authorize publication from preflight results.


## Published baseline and bounded calibration — October 23, 2026

Published baseline `33215722b196f4184028e0ad6ae18934fabc6e7a` passed [full validation 39875079270](https://github.com/JosHsuan/JosHsuan.github.io/actions/runs/39875079270): **483 Pages executions plus 24 framework executions**, with the complete quality and same-export gate. [Pages deployment 39879409411](https://github.com/JosHsuan/JosHsuan.github.io/actions/runs/39879409411) succeeded; subsequent live checks matched 12 routes, 52 runtime resources and 133 original assets to that tested export. Earlier pending statuses above describe their historical checkpoints, not the present release.

Two repeatedly underestimated Chromium file weights now use the median of three independently verified, healthy zero-retry Chromium 3/4 shard receipts. `canvas-motion.spec.mjs` samples are **513.272 / 572.506 / 578.791 seconds**, median **572.506**; `library-reveal.spec.mjs` samples are **268.875 / 262.568 / 281.765 seconds**, median **268.875**. Source runs are `39862051603`, `39867624649` and `39875079270`; each contributing shard passed all 31 tests. The first two overall runs failed unrelated tests in other shards, so these are not three successful full-release runs. Exact commits, attempts, artifact IDs, ZIP hashes, test IDs and sums are retained alongside the weights.

These reporter-duration sums exclude setup and some teardown. The medians are scheduling hints, not controlled benchmarks, predicted runtimes or a speed guarantee. Only these two existing Chromium values are updated; all other existing weights and provenance remain unchanged. The whole-file deterministic algorithm, 4/2/2 runner allocation, test selection, permissions and publication gate are untouched.

The new `source-access.spec.mjs` receives weights only after its corrected, healthy single-file preflight at exact `954cc37d47fb2c6525303c5c9604ec07f37069eb`: Chromium **22.744 seconds** (run `39884166988`), WebKit **68.977 seconds** (`39884250539`) and mobile Chromium **21.712 seconds** (`39884339114`). Each passed all three tests. These first-test-start to passed-summary spans include intervening setup/teardown and final reporter overhead, but exclude build/browser startup and upload. The earlier no-JavaScript observation failures are not calibration input. Per-profile timestamp boundaries and artifact IDs are retained in `calibrationSources`.

The new source-access inventory is **492 executions across 32 files, 164 per profile**. Actual targeted acceptance is nine source-access executions, plus the earlier unchanged adjacent narrative/camera checks; it does not authorize publication. Complete current-candidate quality, 24 framework checks, all 492 Pages tests, exact-once receipt union and same-export publication verification remain mandatory.

### Link-announcement calibration checkpoint — October 23, 2026

Only the new `link-announcements.spec.mjs` receives explicit profile weights: **79.258 seconds Chromium**, **57.869 seconds WebKit**, and **40.572 seconds mobile Chromium**. All existing weights and provenance remain unchanged. The source is exact `155a0a478c31a7514777a810198385e0656922a2`, with healthy single-file **4/4** preflights [39904000169](https://github.com/JosHsuan/JosHsuan.github.io/actions/runs/39904000169), [39904058632](https://github.com/JosHsuan/JosHsuan.github.io/actions/runs/39904058632), and [39904124994](https://github.com/JosHsuan/JosHsuan.github.io/actions/runs/39904124994), respectively. These first-test-start to passed-summary wall spans include intervening setup/teardown and final reporter overhead, but exclude build/browser startup and artifact upload. Per-profile metadata retains exact boundaries, run/attempt, source SHA, artifact ID and independently verified ZIP digest. No failed timing, forced quality-stage timing or extrapolated adjustment is used.

The measurements describe that historical qualification build, not a promise about the final combined link-announcement and STANDARD adaptive-rescue candidate. Its pinned CLI inventory is **504 tests across 33 files, 168 per profile**; listing verifies inventory, not execution. All 12 targeted executions passed, but remain nonpublishable feedback. The whole-file algorithm, 4/2/2 allocation, assertions, permissions, exact-once receipts and same-artifact eligibility are unchanged; complete current-candidate quality, 24 framework checks and all 504 Pages tests remain mandatory. Weight calibration neither grants deployment approval nor establishes a speed or image-quality guarantee.
