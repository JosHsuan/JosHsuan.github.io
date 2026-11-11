# Architecture review and revision — 11 November 2026

Status: **in progress**. The owner authorizes a comprehensive architecture audit,
implementation, commit/push, verification and same-artifact deployment, with no
paid services or charge-incurring features. The preceding skill/workflow change
was committed separately as `9dcc58f` and pushed without deployment.

## Scope and acceptance

Review both the empty reusable framework and the selected public application,
including all route adapters, runtime lifetimes, content/build boundaries,
quality gates and maintained architecture records. Use the
[agent workflow](AGENT_WORKFLOW.md), with code review as the lead and diagnosis,
performance, design and R3F skills where their subject actually applies.

This is an architecture revision: preserve the current Glass motion design,
source assets/geometry, native content and renderer identities. Existing
Directors/schedulers retain their final writers. The empty framework remains
empty. Do not use paid model reviews, hosted profiling, trials or new hosting.
GitHub metadata confirms the repository is public; existing workflows use
standard `ubuntu-latest` runners and Pages deployment remains manual.

Completion requires evidence-backed improvements, relevant source and built
browser checks, an exact default-branch CI candidate, publication of its tested
bytes, and live route/asset/desktop/mobile verification. A code cleanup or report
alone does not complete the task.

## Review coverage

| Area | Current evidence | Revision / remaining investigation |
| --- | --- | --- |
| Reusable framework and toolchain | Exact Node 24.19.0 / pnpm 11.19.0 baseline and revised `pnpm check` pass, including build and 63-file public audit. Root compiler inspection found 66 inputs, including the intended runtime contracts; hidden scratch directories are not included. | Keep the empty content/registry and compiler coverage. Public lint is now automatic. Installed Zod 4.6.6 and the subsequent fresh `pnpm check` pass. |
| Public application import structure | Initial wider workspace scan: 166 modules, 285 internal edges, no cycles. The exact revised public handoff contains 173 files / 151 code modules / 265 code edges. Runtime's component-folder imports are pure scores/helpers or scene adapters, not evidence of a React cycle. | Shared explicit manifest, import closure/cycle checks and enforced core independence. Avoid a directory-only migration of 25 helpers that would not simplify ownership. |
| Native lifecycle and resources | Failed stage notification left an owner registered; a disposal callback could reactivate a closed preview. Nine regression cases failed before repair. | Shared transactional stage registry and terminal-before-notification disposal; focused lifecycle tests pass 55/55. Revised portable suite: 731 total, 729 pass, 2 opt-in rendering skips. |
| R3F / imperative scenes | Inspected Bending `SceneRuntime`/Canvas, generic `project-study-scene`, Home prepared scene/presenter, and XR scene/director. GLTF validation, PMREM ownership, first-draw gating, cancellation, geometry/material/texture disposal and context release remain in their existing adapters. | Preserve demand Canvas and final renderer/camera writers. No extra RAF, physics dependency, model conversion or render-mode downgrade. Browser resource/lifecycle acceptance remains a separate gate. |
| Presentation and accessibility | Paired baseline/revision desktop 1440×1000 and mobile-emulated 390×844 captures for Home, Bending, XR and Mode/s initialize without page errors or horizontal overflow. Original typography, source images/models and Glass layout remain. | Diagram's actual Chromium fixture passes keyboard selection, Strict Mode, remount listener counts and SVG failure fallback. Full built browser/route acceptance is pending; this is not a physical-device or WCAG certification. |
| Performance | Existing draw/pixel budgets, demand schedulers, cached source bounds and retained prepared resources were reviewed. Revision adds no frame work or rendering resource. | No demonstrated CPU/GPU bottleneck warrants changing visual fidelity. No speedup, field INP or physical-device performance is claimed. Long-run and software-GPU evidence is qualified separately. |
| Public content and build | Fresh baseline and revised builds each audit 270 output files and 147 approved assets. No release asset or pinned source record changed. | Build/lint consume one reviewed source list. Reject escaping paths, duplicate sources, nonliteral imports, unapproved dependencies and core-to-presentation imports before copying. Existing output and byte-pin audits remain. |
| CI and publication | Documentation commit `9dcc58f` passed run `43074353466`; no deployment dispatched for that batch. Existing gate verifies candidate-bound test inventory/receipts. | `pnpm lint` and CI quality now include public code. Five negative source/lint tests pass. Revised candidate CI/deployment/live acceptance remains pending. |
| Dependency security | Registry audit identified Zod 4.6.5 (high) and development-only minimatch 10.2.6 (moderate). Maintainer advisory/fix and actual repository callers were inspected. | Pin Zod 4.6.6 with a minimal lockfile update. Minimatch's vulnerable optimization level is absent from its installed caller; retain the compatible lint cohort and document the limited deferral below. |
| Documentation | README and CI/CD falsely described receipt enforcement as unimplemented; current architecture retained superseded pause-policy wording. | Corrected actual coverage/gates and current policy; retained historical decisions and dated release evidence. Added decision 0023. |

Raw local evidence is under ignored `.runtime/architecture-20261111/`. Source
checks, local browser checks, CI, deployment and live acceptance will be recorded
separately as they occur. Local revision builds include uncommitted changes on
`9dcc58f`; their generated release label is not an exact-commit acceptance receipt.
Only the subsequent clean CI candidate can establish that identity. The two portable skips are actual WebGL/SVG rendering
checks; their source tests do not establish rendered acceptance.

## Findings and revisions

1. **P1 — Public source lint was outside the automatic gate.** Root ESLint
   ignores role workspaces, and the Pages build does not perform that lint.
   A direct scan found five errors and one warning. Build and lint now share
   `pages-sources.mjs`; `pnpm lint` runs both scopes. Core import independence
   and complete local import closure are checked before build copying. The
   revised scan has zero errors/warnings across all 151 code files, including
   the two approved vendor modules. Native full-document links and the SVG
   fallback retain explicit narrow exceptions instead of changing navigation
   or source behavior to silence framework advice.
2. **P1 — Stage registration failed without rollback.** If a scene observer
   threw during registration, the caller never received its release handle,
   while the document kept the failed owner. Shared registry delivery now rolls
   back, does not retain failed initial observers, gives duplicate callbacks
   independent subscriptions, and stops stale null delivery after a synchronous
   replacement. Both Home and project wrappers exercise the same contract.
3. **P1 — Permanent preview disposal was reentrant.** A disposed notification
   could call `setActive(true)` before the terminal flag was set, leaving a
   timer and pending acquisition. Disposal marks the controller closed first;
   the regression verifies no timer or restarted work remains.
4. **P2 — Diagram ownership and its opt-in fixture had drifted.** The manager
   factory was called in render memoization with a ref callback, which the
   current React lint rejected. Creation now belongs to the connected effect;
   cancellation and reference cleanup belong to that same lifetime. The old
   rendered fixture lacked the required provider and asserted obsolete native
   events/reduced-motion policy. It now uses the real provider/typed state and
   checks Strict Mode, keyboard behavior, remount counts and source fallback.
   This is a test-harness repair plus clearer ownership, not evidence of a
   previously proven production render-phase resource leak.
5. **P2 — Maintained architecture overstated pending CI work.** Actual
   `ci-inventory`/`ci-receipts` already reject missing, duplicate, skipped,
   retried and foreign executions. README/CI-CD now describe that implemented
   gate; historical planning remains explicitly historical. Current continuous
   motion rules supersede the old selected-application pause wording.
6. **P2 — Known dependency advisory in content validation.** Registry audit
   reports [GHSA-mrhx-c7xc-m3w5](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5)
   against Zod 4.6.5. The reviewed [4.6.6 patch](https://github.com/colinhacks/zod/pull/6652)
   checks leading collection size bounds before parsing elements. The exact
   dependency and lockfile are updated, including ESLint's existing peer
   resolution; no other package version changes. A bounded 32-element probe
   on the old version visits all 32 elements before rejecting the size.
   The installed 4.6.6 probe rejects the same input before visiting any element;
   the production dependency audit reports zero advisories. Repository Zod use reads local
   content and a generated snapshot; static hosting exposes no validation API.
   Existing unbounded collections are unchanged by upstream's patch, so this
   update is not claimed to make arbitrary untrusted inputs resource-safe.

### Documented development-tool advisory

[GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249)
requires attacker-controlled glob patterns and `optimizationLevel >= 2`.
The affected minimatch 10.2.6 is development-only, under
`@typescript-eslint/typescript-estree` 8.71.1. Its only installed call in
`useProgramFromProjectService.js` supplies `{dot: true}`; minimatch defaults the
optimization level to 1. This repository does not configure a default-project
pattern service or expose glob input to site visitors. No applicable execution
path was found in the current configuration. The full audit therefore still
reports one moderate development advisory; it is not a zero-advisory claim.
Do not force the unsupported minimatch 11 major into the pinned parser merely
to clear the report. Reassess with the next compatible lint/parser update, or
before introducing untrusted patterns/high-level optimization.

## Review decisions and evidence limits

Final source review covered correctness (the reproduced failure/rollback and
terminal-disposal cases), readability (one shared registry and explicit source
list), architecture (existing owners and two application boundaries), security
(path/import guards and the isolated dependency patch), and performance (no new
frame work or resource acquisition). No additional blocking source defect was
found. This is a single-agent review, not an independent human or multi-model
approval. Its release recommendation remains conditional on the CI/artifact and
live gates below.

- The source manifest does not discover private files or make originals public.
  It reuses the previous explicit list plus the new registry module. The isolated
  Zod patch is the only dependency/lockfile version change. No asset, research
  copy, source geometry, material recipe or camera score changed.
- Framework and public application remain separate outputs. Shared quality
  tooling does not merge their runtime ownership or populate `src`.
- Duplicate registry code was replaced by one used core helper; no uncertain
  research module was deleted. Component-folder helper placement remains an
  acknowledged naming debt, not a runtime correctness defect.
- Source checks and first-viewport captures cannot establish all interactive
  chapters, native media recovery, WebKit behavior or physical iPhone stability.
  Full candidate CI, exact-artifact deployment and live verification are still
  required before marking this revision complete.
- Impeccable's detector reported no findings for the changed diagram component.
  Missing optional design-hook setup is not repaired as part of the architecture
  task. The current Glass contract and implementation remain visual authority.

## Verification ledger

| Evidence | Result | Scope / limitation |
| --- | --- | --- |
| Baseline `pnpm check`, portable suite, Pages build | Pass; 720/722 portable, two rendering skips; 270 output files / 147 assets | Fresh baseline `9dcc58f`, not the older local export. |
| Lifecycle red / green | 9 failing regression cases before repair; 55/55 focused checks pass after | Observer failure/reentry and permanent disposal. |
| Isolated review mutation | Inverting the delivery revision guard fails 6/8 registry cases | Only an ignored copy was mutated; the reviewed product files were unchanged. |
| Revised `pnpm check` | Pass | Includes 5 new source/lint negative tests and unchanged 63-file empty framework audit. |
| Installed Zod and final `pnpm check` | Pass on Zod 4.6.6 | Bounded collection probe rejects before element parsing; production audit zero, full audit retains the documented moderate development advisory. |
| Revised portable case/tool suite | 729 pass, 2 opt-in skips | Total 731; opt-in rendering has separate execution below. |
| Diagram Chromium fixture | 3/3 pass, no skip | Actual SVG/React, keyboard, Strict Mode, remount, preference continuity and failure fallback. |
| Revised and final `pnpm build:pages` | Pass; 270 files / 147 assets | Full selected export, unchanged approved assets; final build follows installed Zod verification. |
| Baseline/revision captures | Eight captures per version; no page errors/overflow | Four adapter families, desktop and mobile emulation; review is not pixel identity for continuous motion. |
| Local built browser regression | 46 pass / 2 fail | Four release/lifecycle/source/preview files across Chromium, mobile Chromium and Windows WebKit. The two WebKit failures require the WebGL decoded-frame path; this Windows build lacks `requestVideoFrameCallback`. No test assertion or timeout was relaxed. |
| Windows WebKit XR diagnosis | Native playback advances after scene settlement | The initial immediate fallback snapshot was transient. A subsequent instrumented probe observes no application pause, a visible native video, and increasing time before any manual play call. Native fallback passes; WebGL phone acceptance still requires the supported CI engine. |
| Full candidate CI | Pending | Must record exact executions before release; local fallback evidence does not replace the required WebGL path. |
| Deployment and live checks | Pending | No revised release has been published. |
