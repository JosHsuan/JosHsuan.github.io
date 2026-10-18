# DORA-informed CI and delivery plan

Reviewed: 18 October 2026. Scope: this repository's reusable framework and selected public application. The owner requested research and Markdown planning. Current operations remain defined by [CI/CD operations](CI_CD.md), [decision 0009](decisions/0009-impact-selected-ci.md), and the exact-commit, same-artifact publication gate. Future work below is a plan, not a claim that it has been implemented.

## Research basis

Google Cloud's DORA research recommends frequent integration of small changes, fast automated feedback on every commit, reliable tests, and prompt repair of broken builds. Its CI capability guidance describes feedback within a few minutes and an approximate ten-minute upper bound; longer tests can be optimized, run on additional independent compute, or separated into later deployment-pipeline stages. This supports separating the fast development loop from the complete release decision. [DORA: Continuous integration](https://dora.dev/capabilities/continuous-integration/).

DORA recommends finding defects in the cheapest suitable test layer, maintaining trustworthy unit and acceptance suites, and representing real user journeys in acceptance tests. Developers and reviewers share responsibility for keeping tests useful. It does not prescribe a fixed unit/integration/end-to-end percentage. A browser defect that can be reproduced at a lower layer should gain that faster regression check while retaining browser coverage for the actual browser behavior. [DORA: Test automation](https://dora.dev/capabilities/test-automation/).

Deployment automation should promote the same tested packages, keep scripts/configuration in version control, and verify the deployed service. Small independently testable changes should continue through feedback and delivery rather than accumulate into another large release batch. [DORA: Deployment automation](https://dora.dev/capabilities/deployment-automation/), [DORA: Working in small batches](https://dora.dev/capabilities/working-in-small-batches/).

The stage names, p95 targets, shard counts and timeout values below are project engineering decisions. DORA does not specify 45 minutes, eight runners or 267 browser executions, and these values are not performance certification.

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

The later six-study work expands the collected public inventory to **114 unique
cases per profile / 342 executions**, with a further **12 framework executions
for each of root and subpath**. These are inventory counts, not a completed
release result. Its [integration record](../roles/uiux-designer/cases/bending-active-thesis/SIX_PROJECT_STUDIES_INTEGRATION.md)
separates the cancelled `6dcb159` candidate from the owner's subsequent restored
spread and material/light revision. New source, clone/disposal and light-placement
contracts run in the cheap CPU layer; native PMREM/transmission, source first
draw, interaction and visual acceptance remain browser/release checks. Future
duration balancing must account for those GPU costs and retain all source
geometry, original time bounds and the exact scenario union. It must not treat
an owner-superseded candidate as a production change failure or a timing sample
for a completed full run.

## Planned feedback and release stages

The table describes the target structure. Existing jobs implement parts of it; the dedicated fast browser stage and duration reporting are proposed improvements.

| Stage | Scope and output | Target / release relationship |
| --- | --- | --- |
| Change plan | Validate scope mapping, cumulative history, renames and required-job rules. Expose the selected reasons. | Immediate visible plan; a missing baseline selects full coverage. |
| Fast checks | Content/schema/private-path checks, lint/types, portable event/state/readiness/geometry tests, source/font pins and CI gate tests. | Project target: p95 active execution within five minutes; also report queue-inclusive feedback. A failure blocks delivery. |
| Build and native smoke | Create the complete public artifact once; run a small high-value native browser journey for navigation, entry/fonts, prepared first draw and bounded failure. | Project target: required fast-layer feedback within ten minutes of workflow creation, including queue time. A smoke success is an intermediate result. |
| Selected acceptance | Existing impact-selected journeys and release baseline across the three engines/profiles, against the same complete artifact. | All selected cases must pass; shared inputs continue to select full coverage. |
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

## Review responsibilities and acceptance

Developers maintain useful unit/contract tests with changes; browser/QA and interaction roles review native journey coverage; geometry/art-direction roles protect source and visual acceptance; CI/release work owns scope selection, runtime measurements and artifact provenance. The owner retains the existing publication scope. Review the most significant measured constraint first and record outcomes before selecting the next change.

Accept a future CI optimization only when required scenario IDs and artifact checks remain covered, the relevant real browser cases pass, incomplete/cancelled jobs cannot publish, and comparable measurements support the stated latency/cost result. Retain source facts and historical failed receipts. This planning record itself is Markdown-only and does not modify product runtime or the reusable empty framework.
