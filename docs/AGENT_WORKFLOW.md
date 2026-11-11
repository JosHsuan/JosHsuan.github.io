# Agent workflow and skill routing

Established 2026-11-11 for the owner's requested skill integration. This is the
working procedure referenced by root [AGENTS.md](../AGENTS.md), not a new site
redesign, runtime architecture or deployment authorization.

## Authority and task entry

Start with the current user request, existing authorizations and applicable
AGENTS.md files. Read [README](../README.md), [decision 0001](decisions/0001-empty-framework.md),
the relevant [architecture](architecture.md) sections, and for presentation work,
the [design guidelines](WEBSITE_DESIGN_GUIDELINES.md) and current scoped contract.
Use the latest applicable owner decision to resolve historical contradictions.
Generic skill preferences are subordinate to those instructions; platform and
tool permissions continue to apply.

The current presentation authority is [decision 0022](decisions/0022-glass-motion-system.md)
and its [Glass motion contract](../roles/uiux-designer/cases/bending-active-thesis/GLASS_MOTION_REDESIGN.md),
with [decision 0021](decisions/0021-continuous-motion-portfolio.md) where retained.
Earlier role reports remain dated evidence, not automatic overrides. Do not
interpret an old pause, fixed-camera or static-mode recipe as current acceptance.

Identify the requested outcome, affected routes/files, permitted writes, current
candidate/revision, relevant owners and evidence needed. Use a short task plan
for substantial work; a small edit does not require a separate planning document.
Keep owner discussion in Traditional Chinese and maintained documentation/UI in
English. Existing approval persists within its scope; do not add a permission
checkpoint just because a generic skill contains one.

## Select a lead for each phase

Installed skills are instructions and tools, not separate autonomous agents.
Load only the lead skill and relevant supporting references. Do not start
several collection-wide workflows, onboarding routines or competing plans.
Explicit skill requests are honored within the task's scope. A single agent can
perform the roles below; the table does not request parallel agents or new chats.

| Task or phase | Lead | Supporting use and expected result |
| --- | --- | --- |
| New page or authorized visual exploration | `frontend-design` | Establish a direction consistent with the current portfolio; use targeted `ui-ux-pro-max` queries for a specific UX question. |
| Critique, polish or audit of an established interface | `impeccable` | Assess hierarchy, typography, interaction and visual fit against the existing direction; choose only the requested operations. |
| Specific UX rule lookup | `ui-ux-pro-max` | Query one domain/stack and verify the result's relevance. Treat colors, fonts and styles as suggestions within the existing design. |
| Scene architecture, resources or rendering | Appropriate `r3f-*` skill | Use only the affected topics; preserve the actual R3F or imperative adapter and its writer. |
| Broken behavior, exceptions or regressions | `diagnosing-bugs` | Establish a symptom-specific feedback loop, reproduce/minimize, test one hypothesis, then fix within the authorized implementation phase. |
| Measured performance work | `performance-optimization` | Establish comparable baseline, bottleneck and budget; use diagnosis for a regression and R3F guidance for an identified rendering issue. |
| Code or diff review | `code-review-and-quality` | Review correctness, readability, architecture, security and performance. Return actionable findings and evidence limits to the implementer. |
| Exploratory verification or explicit report-only QA | `qa-only` | Test selected surfaces and preserve repro/evidence. Write reports and owned fixtures only; do not repair product code or tests. |

Use `r3f-fundamentals` for Canvas/hooks/ownership, `r3f-geometry` for mesh and
instancing decisions, `r3f-materials` and `r3f-textures` for surfaces, `r3f-lighting`
for lighting/environment/shadows, `r3f-loaders` for assets/cache/Suspense,
`r3f-animation` for motion, `r3f-interaction` for events/controls,
`r3f-shaders` for custom shader code, and `r3f-postprocessing` for composer effects.
Use `r3f-physics` only for a task that actually needs simulation. Its installation
does not add Rapier or authorize a new dependency, scheduler or visual effect.

## Keep the existing responsibilities

The twelve [role workspaces](../roles/README.md) remain responsibility and evidence
owners. Skills support these roles; they do not rename or replace them.

| Existing responsibility | Skill support / handoff |
| --- | --- |
| UIUX Designer | `frontend-design` for exploration; `impeccable` for critique/polish; targeted `ui-ux-pro-max`. |
| Information Designer | Source-backed hierarchy, captions and explanations; targeted design skills without inventing content. |
| Interactive Experience Director | Integrate layer/story/interaction decisions and rendered acceptance against the current contract. |
| Software Architect / Runtime Engineer | Own boundaries, lifecycle and integration; use diagnosis and code review. |
| 3D Artist | Materials, textures and shaders within source/material identity. |
| Geometry Engineer | Source fidelity, measured scale and conversion; R3F geometry/loaders do not authorize decimation. |
| Lighting Designer | R3F lighting and environment guidance within approved recipes. |
| Scene Designer | Staging, negative space and source-relative composition. |
| Motion Designer | Shared motion/damping and foreground/control behavior within current motion direction. |
| 3D Animation Designer | Procedural motion and clips; physics only when selected by the task. |
| Animation Cinematographer | Camera paths, focal behavior and continuous joins with the current final writer. |
| Browser and GPU Performance Engineer | Measured CPU/GPU/lifecycle work with `performance-optimization`; report QA coverage separately. |

## Work from outcome to evidence

1. **Scope and baseline.** Resolve the current contract and owners. Preserve local
   changes. Choose the smallest relevant checks and record the behavior or
   measurement that will establish success. Site-wide work needs a route matrix;
   a Bending or Mode/s slice does not establish coverage for generic, XR and Home.
2. **Design or diagnose as needed.** Explore only when direction is open. For an
   established direction, audit the actual UI. For a bug, make a reproducible,
   symptom-specific failing signal before changing its cause. For performance,
   record conditions, samples, variance and a comparable baseline first.
3. **Implement.** The integrator owns the patch and combines specialist results.
   Keep change groups coherent, dependencies pinned and unrelated work intact.
   Do not add tests for trivial reversible changes or tests that mirror code;
   regression tests should catch the demonstrated failure at the real boundary.
4. **Review.** Apply the five review axes to the final diff and relevant tests.
   Separate defects from optional preferences. Report severity, file/line,
   trigger, consequence and supporting evidence; distinguish speculation.
   Review does not silently repair the files it is judging.
5. **Verify behavior.** Run required repository checks and, when appropriate,
   `qa-only` against the built candidate. QA writes findings/evidence; an
   authorized implementation task may then resume fixing in step 3 and rerun
   affected checks. An explicit report-only request ends with the report.
6. **Deliver.** Summarize what changed, checks actually executed, unresolved
   limitations and local/CI/release status. Commit/push/publish only within the
   applicable authorization and existing gates. Installation alone is not a
   request to publish the portfolio.

Use existing integration/verification records when they own the change. Keep
scratch probes and raw QA artifacts in an owned `.runtime/qa/<run>/` directory;
publish only a sanitized summary where the task requires one. Record revision,
artifact identity, route, device/viewport, command, expected/observed result,
timing and relevant limits. Never reuse old results as a new candidate's proof.

## Resolve known instruction overlaps

| Overlap or conflicting default | Project resolution |
| --- | --- |
| Several design skills offer a new palette, typography or layout | Choose one design lead. Preserve approved OCR body/heading direction, layout, materials and source identity. Do not generate a competing design-system master file or replace canonical contracts without a task requiring that change. |
| Generic motion advice requests reduced-motion/static modes or pause controls | Decisions 0021/0022 govern this authorized presentation. Preserve continuous motion and its current controls; continue checking readable content, keyboard/focus, contrast and touch behavior. Report any tension accurately rather than declaring broad accessibility compliance. |
| R3F examples create `useFrame`, controls or physics ownership | Integrate with the existing driver. Bending uses `ExperienceDirector`, ordinary/Home/generic motion uses `SiteBackgroundDriver`, and XR uses `XRStageDirector`. Keep one final camera/property writer, no competing RAF or per-frame React state; native media keeps native time. Do not convert imperative scenes to R3F merely to fit an example. |
| Performance advice suggests lower fidelity, visibility-only loading or aggressive disposal | Preserve original bytes/geometry, measured scale, material identity, destination readiness and retained prepared resources. Measure an optimization compatible with those requirements or report the tradeoff; do not silently lower the target. |
| Performance skill says to revert a neutral result | Revert only the agent's isolated optimization experiment. Preserve unrelated/user changes and required correctness/visual work. Record noise and inconclusive results; do not fabricate a gain. |
| Performance examples add analytics, services, packages or CI tooling | Use existing local measurement first. Installation does not authorize telemetry, paid tools or an unrelated dependency/CI migration. Lab latency, software-GPU stalls and emulation are not field INP or physical-device evidence. |
| Code review asks to invert a condition and restore the file | Report-only review never mutates the working product. If a mutation experiment is useful and allowed, use an isolated owned copy/worktree, preserve other changes and report its scope. Otherwise inspect existing failure evidence and state the untested limit. Never use broad reset/checkout to restore user work. |
| Review's size thresholds or one-dependency preference conflicts with an atomic change | Treat line counts as review signals. Keep necessary lockfile/React/Next/toolchain cohorts coherent; do not split a change into broken intermediate states or invent refactoring solely to meet a size target. |
| Diagnosis recommends a dev server or stress/bisection loop | Use an isolated, bounded reproducer for diagnosis; verify delivered behavior against the built export. Do not bisect or stress the shared working tree, overload production, or mistake a harness pass for browser acceptance. |
| QA proposes tests or imports another gstack workflow | `qa-only` reports repros and proposed tests; product/test repairs return to implementation. Use the installed standalone host adapter, not `/qa`, `/ship`, onboarding, cross-project learning, cookie import or paid evaluation. |

Keep the reusable `src/` framework empty. Never manually edit generated
`src/app/(entries)`, import private preparation data into runtime, or move
Theatre imports outside their authorized boundary. Skill examples are not
permission to relax asset, content, privacy or architecture rules.

## Verification and publication gates

Use exact Node **24.19.0**, pnpm **11.19.0** and the committed lockfile. An agent
tool's separate Bun/browser runtime does not change those versions. Consult
[toolchain](toolchain.md), [CI/CD](CI_CD.md) and the actual
[impact selector](../scripts/ci-impact.mjs) for scope.

- Architecture changes require `pnpm check`; public-case changes also need
  relevant case/runtime contracts and the selected built-artifact Playwright
  projects. `pnpm lint` includes public source-manifest lint; other isolated role
  workspaces remain outside that approved application boundary.
- Build the selected public application with `pnpm build:pages` and verify
  `.pages-workspace/out/`; framework acceptance uses `out/`. A development
  server and a gstack browser smoke test cannot replace these gates.
- True documentation-only changes use documentation scope and selector/gate
  validation. They do not create a new publishable site artifact.
- Within owner-authorized publication scope, preserve the default-branch push
  validation, same-commit gate and same-artifact deployment. Do not rebuild
  between acceptance and publication or substitute an older green run.
- After an authorized deployment, verify release provenance, route/asset bytes
  and required desktop/mobile journeys. State unavailable browser/device checks
  explicitly; emulated mobile checks do not establish physical iPhone stability.

The [integration review](SKILL_INTEGRATION_REVIEW.md) records the installed
selection and local tool checks. It is not a website acceptance report.
