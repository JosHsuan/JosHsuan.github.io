# Bending-Active staged runtime refactor verification

Date: 10 October 2026, Europe/Berlin. Scope: local implementation of the [runtime architecture](BENDING_ACTIVE_RUNTIME_DESIGN.md). That implementation checkpoint excluded commit, push and deployment. The owner explicitly authorized publication on 12 October 2026; the dated follow-up below preserves this distinction.

## Stages and acceptance

1. Scoped event infrastructure and typed contracts. Preserve native listener options and synchronous gesture behavior.
2. Feature controllers for reading/navigation, models, diagrams, evidence and lifecycle. Keep JSX responsible for presentation.
3. Commands and validated discrete state, separated from continuous frame snapshots. Preserve passive rendering acknowledgment.
4. Director, layout/presentation services and deterministic update phases. Preserve samplers, visual assets and render budgets.
5. Explicit feature registration and composition root integration. Verify dependency ordering, failure rollback and mount cleanup.
6. Complete browser, visual and matched performance comparison; provide the built local preview.

Each implementation stage requires portable logic/contract tests, relevant type checks, an audited static build and affected built-artifact browser checks. Matched visual/cadence checks compare to the retained baseline. The final stage runs the full built-public matrix and root framework checks.

## Baseline

- Toolchain: Node 24.19.0 and pnpm 11.19.0. The host initially supplied pnpm 11.25.0; the specified version was downloaded from the npm registry into the task's local artifact directory and its SHA-512 integrity verified.
- Local source baseline: `8833491`, with the previously authorized research documents uncommitted.
- `pnpm check`: passed; 9 root tests, empty public snapshot and 63-file static artifact audit. One existing ESLint warning remains in `tests/pages/reading-contrast.mjs`.
- Case portable tests: 177 passed, 2 conditional fixtures skipped, 0 failures, 179 total.
- `pnpm build:pages`: passed; 80 files and 36 approved assets audited.
- Retained baseline index SHA-256: `372b5b6b82791a41c4d33fd6fda12a3668cbea812522e693a8fa33910919bbb9`.
- Baseline public browser matrix: 99/99 passed across Chromium, WebKit and mobile Chromium. Windows web-server teardown retained its child Node process after all browser workers exited; stopping only the verified test-owned server completed the runner. Future runs use an independently managed local server with explicit reuse.

Raw built baseline, profiles and captures are stored under the current task's Codex visualization directory, outside public build inputs. Resource counters describe counts; attachment estimates are not total GPU/process memory. Browser emulation and synthetic lifecycle checks do not certify physical iPhone crash resolution.

## Stage 1

The shared presentation input/provider, EventManager and DisposableScope are implemented. Browser targets and capture/passive options stay explicit. The publication build uses an explicit source allowlist for the new modules. TypeScript extension imports are enabled with no emit, allowing the portable Node runner to inspect the same typed implementation without generating a second runtime.

- Logic/contract suite: 182 passed, 2 conditional fixtures skipped, 184 total. New contracts cover scope failure cleanup, independent identical native callbacks, once/AbortSignal cleanup, delivery mutation and observer failure.
- `pnpm typecheck`: passed, including negative event-payload type contracts.
- Public build/audit: passed; all 36 released assets match the retained baseline byte hashes. Story SHA-256 remains `4df944efbfca4421457eb2205cdaad9d8c2990adc921c5e95415f9012f77ad32`.
- Built browser matrix: 99/99 passed. The same Windows teardown workaround was required.
- Retained stage-1 index SHA-256: `7a11d8c62be711f0990cc5444d39d51fc18f20a8ce01926d0a5eaa816e837b10`.
- Desktop Chromium stationary Full: baseline 2.617 FPS / p95 416.7 ms, stage 1 2.670 FPS / p95 400 ms. Both use SwiftShader at identical warmed physical size (758×527, density 0.5); Pause adds zero controller/GL frames and active time.
- WebKit unaligned wall-clock samples varied from 9.13 to 10.91 FPS. Those windows started at different story times, so they are retained as observations rather than the acceptance comparison.
- WebKit diagnostic with identical scene pose, optics and phases: baseline 11.097 FPS, stage 1 11.012 FPS, with identical attachment configuration. This is a real-clock diagnostic with fixed scene inputs, not an autonomous-shot claim.
- WebKit normal autonomous shot, aligned to active story time 15 seconds: baseline start 15.065 / 11.206 FPS / p95 107 ms; stage-1 start 15.088 / 11.171 FPS / p95 108 ms. Both render 243×527 pixels under the same 520k cap, zero MSAA and density 0.5; both pauses add zero controller/GL work and active time. No page errors or crashes were recorded.
- Matched visual captures: in progress. Reduced-reading captures and isolated fixed-source scene captures are separate evidence; the latter temporarily hide HTML/2D overlays and do not represent a whole-page composition comparison.

The pinned pnpm launcher was edited while a batch invocation was still active, causing the baseline test command to run once more against the sealed stage-1 artifact. The launcher is now left unchanged during runs. That second matrix is stage-1 evidence, not a second baseline result.

## Stage 2

Feature extraction is in progress while stage-1 visual comparison completes. Model, evidence, diagram, reading/navigation and lifecycle behavior have moved into feature modules; presentation markup and existing samplers remain.

- Four focused ModelManager tests pass: exact source hit gating, native touch travel, blur during a held press and lifecycle capture release.
- Three diagram/evidence tests pass: pinned versus autonomous selection, stale/aborted/invalid response containment, modified native links and focus return.
- Four navigation/lifecycle tests pass: exact history positions, keyboard/focus behavior, activation preferences, storage unavailability and failure-latch preservation. An initial test fixture had four rather than the required eight chapter anchors; the fixture was corrected without changing the sampler.
- Fresh complete portable suite: 193 passed, 2 conditional fixtures skipped, 195 total, 0 failures. Root `pnpm typecheck` passed again after all five feature extractions.
- Stage-2 public build/audit passed, followed by 39/39 affected built-artifact scenarios across Chromium, WebKit and mobile Chromium.

## Stage 3

Typed CommandRouter, TransactionEngine, StateStore and FrameStore are integrated. Model selection commits a grouped source/inspection change, native input keeps synchronous handling, and continuous frames remain outside domain transactions. Source resolution uses a typed fact and layout changes use explicit invalidation; incoming native source events remain a compatibility boundary.

- Portable suite: 198 passed, 2 conditional fixtures skipped, 200 total; type checking and build/audit passed.
- Affected browser matrix: 24/24 passed across the three public projects.
- New contracts cover rejected atomic changes, command ownership, reentrant publication ordering, selective subscriptions, passive submission acknowledgment and committed-effect error reporting.

## Stages 4 and 5

React now hosts the UI and Fiber lifecycle while ExperienceDirector owns frame coordination, EditorialPresenter owns DOM responses and SceneRuntime owns assets, final camera/object updates and submission. LayoutScheduler coalesces explicit measurements. RuntimeRoot assembles the closed FeatureRegistry and Registrar catalog; views connect their feature lifetimes through it. Scene implementation remains dynamically loaded, and model interaction receives only a hit-test port.

- An intermediate stage-4 browser run failed to initialize reading/rendering because EditorialPresenter extraction omitted `sections` and `chapter` parameters. The failed run was stopped, those explicit parameters were restored, and a regression contract was added. That intermediate artifact is not accepted.
- Current portable suite: 205 passed, 2 conditional fixtures skipped, 207 total; includes dependency validation, startup rollback, independent instance cleanup, reconnectable stop and permanent disposal contracts.
- Runtime MJS `no-undef` lint passed using the installed ESLint CLI; root type checking passed.
- Four current Chromium smoke scenarios passed: model initialization/Light mode, keyboard engagement through the scene gap, actual source hits and overlapping lifecycle suspension.
- Root `pnpm check` passed again, including 9 tests and the unchanged empty 63-file framework artifact. Public build/audit passed with 80 files and 36 approved assets.
- Current built index SHA-256: `34b529fe3b9077ef7b03928a3a736ed67326572a7a6b86d6314747a8a7a2d4a7`.
- The complete integrated 99-case matrix passed across Chromium, WebKit and mobile Chromium; its runner's final `.last-run.json` reports passed with no failed tests. This artifact predates the final cleanup-failure hardening below.
- Final audit added two exceptional cleanup contracts: rollback and disposal must release every remaining dependency/connection after a cleanup throws, while preserving the startup cause or collected cleanup errors. The final portable suite has 207 passed, 2 conditional skips, 209 total; type checking, runtime lint, root `pnpm check` and public build/audit passed.
- Final hardened artifact index SHA-256: `0f13eca7f5034af6685a65d93b66b9a8863c793a244fcd8cbf8ad078d983ede6`.
- Final captures completed with zero page errors: 24 Reduced-reading captures and 20 isolated fixed-source scene captures across desktop 1440×1000, tablet 820×1180, phone 390×844 and landscape 844×390. All 44 baseline/candidate PNG pairs are pixel-identical. This is controlled visual evidence, not a moving full-page autoplay comparison. Representative desktop/phone reading and source renders were visually inspected.
- All 36 manifest assets match their baseline/approved SHA-256 values. Story SHA-256 remains unchanged.
- Final real-time profiles completed without recorded page/console errors, crashes or context loss. Sequential stationary pairs start at active story time 15 seconds, preserve normal autoplay, and have identical measured render budgets, compositor configuration, geometry/texture/program counts and canvas counts. Chromium (Windows SwiftShader, 1440×1000 / DPR 2) is 2.699 → 2.766 FPS, p95 449.9 → 450 ms; WebKit (390×844 / DPR 3) is 11.110 → 11.165 FPS, p95 108 → 108 ms. Pause adds zero controller frames, WebGL frames and active story time in all four runs. These observations show no material cadence/resource regression in the measured cases; one pair per engine is not a statistical speedup claim or physical-device certification.
- Separate 84-second Full and 60-second Light desktop traversals retain identical resource ranges and pixel configurations, including one WebGL canvas and one 2D field canvas. Both versions record no errors/crashes/context loss. The baseline traversal briefly overlapped a CPU-only root check, so its cadence is secondary observation; the uncontended story-aligned stationary pairs above are the cadence comparison.
- Headless second-tab activation did not make the source tab hidden. Real hidden-page timing is therefore not claimed from these profiles; overlapping synthetic page-cache/freeze signals are covered by built-artifact lifecycle tests.
- Hardened-artifact affected browser regression passed 12/12 across Chromium, WebKit and mobile Chromium: model startup/navigation/Light, evidence disclosure/focus, overlapping suspension, and held-gesture cleanup with explicit Pause preservation. The healthy frame/feature code is unchanged from the full 99-case integrated artifact; cleanup-failure branches additionally have portable contract coverage.
- Root built-framework browser checks passed 9/9 in Chromium, WebKit and mobile Chromium. The three Firefox cases could not execute: Playwright's `firefox-1543/firefox.exe` fails at process launch with `spawn UNKNOWN`, also on a narrow retry outside the sandbox. This is an environment validation gap, not a website pass or an observed application failure.
- The owner's live preview was opened and retained in the visible Codex in-app browser at `http://127.0.0.1:4186/`. Full mode loaded its source model and the independent foreground ASCII field while preserving readable content and navigation. The live composition was inspected; `integrated/preview-live.jpg` records the result.

## Local verification environment

- Retained baseline server: `http://127.0.0.1:4187/`, task artifact `bending-active-refactor/baseline/out`.
- Candidate server: `http://127.0.0.1:4186/`, repository `.pages-workspace/out`. Subsequent Playwright runs set `THESIS_REUSE_SERVER=1` so Windows test-server shutdown does not own this process.
- Current raw artifacts: `C:/Users/JosHsuan/.codex/visualizations/2026/10/10/01a1268a-83b7-7271-a796-cd8d47c9bbc8/bending-active-refactor`.
- A first capture process was stopped after identifying an unbounded lazy-image decode wait. The helper now makes visible images eager and bounds decode waiting. A second partial run exposed a preceding scene override that prevented the next chapter's render acknowledgment from settling. Clearing that override before real navigation resolved the helper issue. Complete accepted captures are in `baseline/captures-final` and `integrated/captures-final`; partial `captures-v2` results are historical.
- Final immutable build snapshot: `integrated-final/out`. Full integration matrix, portable/negative type contracts, pixel review, public input hashing and uncontended cadence comparisons have completed. Final cleanup hardening has exceptional-path contracts and the affected browser regression. Root browser checks have the Firefox launch limitation above; local preview delivery is complete.

## Completion audit

- All five implementation stages are integrated through the real mounted case, rather than unused example classes. RuntimeRoot composes factory services; Registrar owns feature connections, rollback and cleanup; EventManager owns scoped runtime registrations and typed facts. React still owns readable markup and discrete controls.
- CommandRouter/TransactionEngine/StateStore separate validated low-frequency application transitions from the latest frame store. Source selection commits related inspection ownership together. Reentrant commands wait for the current publication; native gesture cancellation/capture/focus retain synchronous behavior.
- Existing reading/chapter/inspection/optical samplers, compositor, geometry, CSS and approved content/assets remain the presentation basis. ExperienceDirector owns the chapter clock; SceneRuntime is the final camera writer; Fiber demand rendering and the timer-free 2D field retain independent submission/cadence responsibilities. Submission acknowledgment remains passive.
- Final checks: 207 portable passes / 2 conditional skips; negative type contracts and runtime lint; root check (9 tests, 63-file artifact); public build/audit (80 files, 36 approved assets); full integrated browser matrix 99 passes; hardened-artifact regression 12 passes; root browser matrix 9 passes with 3 Firefox launch gaps; 44 pixel-identical controlled capture pairs; uncontended real-time profiles with unchanged budgets/resources and zero-work Pause.
- Source/build documentation is reconciled. The reusable portfolio stays empty. No commit, push or deployment was performed. The measured cases show no material functional/visual/cadence regression; physical iPhone crash resolution and Firefox execution remain outside the established evidence.

## Publication authorization — 12 October 2026

The owner requested commit, push and GitHub Pages deployment of the reviewed result. Local portable tests and the root check are rerun before committing. A successful `push` CI run must validate the exact commit across the root/subpath framework matrix and all three public-case browser projects before the separate Pages workflow consumes its tested `static-export-pages` artifact. The workflow/run records and public `/release.json` identify actual publication; this authorization is not itself a deployment-success claim. The approved story and 36 asset hashes remain unchanged, and physical-device limitations remain open.

### Tool invocation for subsequent stages

The specified pnpm launcher is under the task visualization directory at `tools/pnpm-11.19.0/pnpm.cmd`. Prepend that directory to PATH for commands and their child scripts. Do not edit the launcher while a batch invocation is active. Set `GIT_CONFIG_COUNT=1`, `GIT_CONFIG_KEY_0=safe.directory` and `GIT_CONFIG_VALUE_0=C:/Users/JosHsuan/Documents/GitHub/JosHsuan.github.io` for build-time Git provenance reads without changing global Git configuration.

Use `node --test roles/uiux-designer/cases/bending-active-thesis/tests/*.test.mjs`, the pinned `pnpm typecheck`, `pnpm build:pages` and relevant `pnpm test:pages` projects. Browser runs reuse the independent 4186 server. Run real-time profiles and captures sequentially, with no simultaneous browser/GPU suite. Capture/report helpers retain the actual built index hash and separate controlled source captures from real-time autoplay evidence.
