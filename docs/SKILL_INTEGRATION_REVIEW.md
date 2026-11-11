# Skill installation and compatibility review

Date: 2026-11-11. Scope: install the owner's selected design/R3F/engineering
skills without reinstalling existing ones, choose code review guidance, and
establish the repository's [agent workflow](AGENT_WORKFLOW.md).

## Installation result

The personal skill directory now contains **18 selected skills**: 10 existing
and 8 newly installed. System skills and plugin-provided skills are outside that
count. The 76 files present across the 10 existing skill directories before this
task retain their original SHA-256 hashes.

| Status | Skills |
| --- | --- |
| Preserved | `frontend-design`, `impeccable` |
| Preserved | `r3f-fundamentals`, `r3f-animation`, `r3f-interaction`, `r3f-lighting`, `r3f-loaders`, `r3f-materials`, `r3f-postprocessing`, `r3f-shaders` |
| Added | `ui-ux-pro-max` |
| Added to complete the 11-topic R3F set | `r3f-geometry`, `r3f-textures`, `r3f-physics` |
| Added engineering selection | `performance-optimization`, `diagnosing-bugs`, `code-review-and-quality`, `qa-only` |

Skills live in the host's `$CODEX_HOME/skills` and are available on the next
turn. This checkout does not vendor them into the website or install them for
every collaborator. No duplicate `frontend-design` entry was added for
Impeccable; its existing standalone `impeccable` entry was preserved.

The request to complete the selection was applied to the three design skills,
all eleven R3F topics and the selected four engineering capabilities. It did not
register every skill from the three engineering collections. Their complete
planning, shipping and agent-management workflows would duplicate this repo's
existing process.

## Sources and reproducibility

New installs used the Codex skill installer's GitHub helper with pinned revisions.
Each new skill has a local `provenance.json` naming its repository, revision,
source path and adaptations. The table records the upstream snapshots inspected
for this review; preserved local skills may already contain host-specific
descriptions or adapters and were not replaced with those snapshots.

| Repository | Inspected revision | Selected source / license evidence |
| --- | --- | --- |
| [Anthropic skills](https://github.com/anthropics/skills/tree/2c5958ecac7cee2b583967a2c4981d0f4a75c579/skills/frontend-design) | `2c5958ecac7cee2b583967a2c4981d0f4a75c579` | Existing `frontend-design`; its bundled `LICENSE.txt` remains intact. |
| [Impeccable](https://github.com/pbakaus/impeccable/tree/c1e0e5492fbb524f5df84d635ecfae7dc438ec45) | `c1e0e5492fbb524f5df84d635ecfae7dc438ec45` | Existing standalone skill, release 4.8.2 and engine 0.1.22; preserved. |
| [UI UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/tree/6ae86f61f520d6ca229d2f40e070410638c908c5/.claude/skills/ui-ux-pro-max) | `6ae86f61f520d6ca229d2f40e070410638c908c5` | `.claude/skills/ui-ux-pro-max`; upstream MIT license retained. |
| [EnzeD R3F skills](https://github.com/EnzeD/r3f-skills/tree/4a11805f097396fb0b893172efd1e359e8051f92) | `4a11805f097396fb0b893172efd1e359e8051f92` | `skills/r3f-*`; upstream README declares MIT, with no standalone LICENSE file at this revision. |
| [Addy Osmani agent skills](https://github.com/addyosmani/agent-skills/tree/301b02b12bff98e4688e6984af6556802322bbde) | `301b02b12bff98e4688e6984af6556802322bbde` | `skills/performance-optimization` and `skills/code-review-and-quality`; upstream MIT license retained in each. |
| [Matt Pocock skills](https://github.com/mattpocock/skills/tree/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/skills/engineering/diagnosing-bugs) | `4ae2317ddb22b046e26455e4f9c9b3aaaf62212d` | `skills/engineering/diagnosing-bugs`; upstream MIT license retained. |
| [gstack](https://github.com/garrytan/gstack/tree/554390da387d97c8b93dc2337c2ab41d4271e9f4) | `554390da387d97c8b93dc2337c2ab41d4271e9f4` | `qa-only`, rendered for Codex; upstream MIT license retained. |

`code-review-and-quality` was selected because its correctness, readability,
architecture, security and performance axes fit the repo's existing runtime and
release contracts. It does not require adopting another collection's shipping
workflow. Its mutation-test suggestion is constrained to isolated, authorized
experiments; ordinary review remains report-only.

## Host adaptations and dependencies

These are localized adaptations of newly installed skills, recorded in their
provenance. Existing skills were not rewritten to enforce this project's rules;
those rules belong in root AGENTS.md and the workflow document.

| Skill | Adaptation |
| --- | --- |
| `performance-optimization` | Bundled its referenced repository-level performance checklist into the skill's own `references/` and changed the links accordingly. |
| `ui-ux-pro-max` | Replaced its Claude plugin-root placeholder with the loaded skill's base directory. Search scripts/data remain local to the skill. |
| `qa-only` | Used gstack's official Codex renderer, retained the QA body and shared scope/method/evidence/deadline/reporting sections, and replaced host-global onboarding with `HOST_ADAPTER.md`. Bundled `qa`/`browse` support as `GUIDE.md` references rather than registering their skill entrypoints. Added a PowerShell tool wrapper. |

The gstack source/runtime is isolated under `$CODEX_HOME/tools/gstack-554390d`,
outside skill discovery. Only `qa-only` is registered. The complete source is
present to satisfy its helper dependencies; the full gstack setup, `/qa`,
`/review`, `/ship`, telemetry/onboarding, external model reviews and paid
evaluation workflows were not enabled or invoked.

The optional tool runtime uses gstack **1.99.0**, Bun **1.4.2**, Playwright
**1.65.0** and Chromium revision **1254**. Bun's official Windows archive was
checked against SHA-256
`ce4c17497b2f29712a99d3d53f028de28cd42e3bacb8589599e7f000e49b6405`.
Dependencies were installed from gstack's frozen lockfile with lifecycle scripts
disabled. The browse CLI and the official Windows Node server bundle were built;
the repository's package files, global PATH and Node/pnpm selection were not changed.

On Windows, `qa-only/scripts/qa-tool.ps1` dispatches `browse`, `deadline` and
`evidence` to that pinned runtime. Its adapter requires an owned report directory
and an absolute `BROWSE_STATE_FILE` inside it. Native arguments are forwarded
without PowerShell common-parameter binding; direct PowerShell calls quote the
native separator as `'--'`. The upstream browser path guard remains enabled.
If a sandbox denies reading a Windows ancestor needed by that guard, use the
host's normal permission mechanism or report the affected capture as blocked.

No website dependency was added for R3F physics, QA or design tooling. Local QA
Chromium is separate from the website's pinned Playwright **1.63.0** and its
Chromium/WebKit/mobile acceptance matrix.

## Compatibility assessment

The skills can coexist, but matching names and separate folders do not resolve
instruction conflicts. Skill descriptions influence when they are loaded;
explicit invocation can also load them. See the
[official skill documentation](https://learn.chatgpt.com/docs/build-skills).
The workflow establishes project-specific precedence and phase boundaries; it
is guidance for agents, not an executable mutual-exclusion mechanism.

The most material overlaps are design-direction ownership, motion/accessibility
defaults, rendering clocks, fidelity versus performance, mutation during review,
QA versus repair, competing report/design-system files, and alternate shipping
or telemetry workflows. The workflow's conflict table resolves each against
the current owner instructions and repository gates.

The following are a walkthrough of routing decisions, not independent agent
evaluations or evidence that a website behavior passed:

| Representative request | Expected route and boundary |
| --- | --- |
| Polish the approved Home carousel | Impeccable leads; targeted UI UX query if needed; preserve current square instances, typography and continuous motion. |
| Explore a new authorized page | Frontend Design leads; source-backed content and current visual direction constrain proposals; no empty-framework filler. |
| Fix a scene that disappears after navigation | Diagnose with a repeatable lifecycle repro, then use fundamentals/loaders as needed; preserve the actual renderer owner and retention contract. |
| Reduce GPU cost without changing appearance | Profile first; use lighting/material/shader guidance only for the identified cost; compare conditions and keep original source fidelity. |
| Review a camera refactor | Code review examines writer/clock/lifecycle and test evidence; no working-tree mutation or automatic refactor. |
| Test the site and only report bugs | QA-only writes evidence/findings; no product/test repair, no publication and no forced switch to `/qa`. |
| Fix, validate and publish an already authorized change | Implementation/review/QA phases under existing authority, then the repo's same-commit/same-artifact CI gate; no new skill-imposed approval. |
| Update workflow documentation | Relevant document review and CI selector/gate checks; no website browser acceptance or new deployment artifact implied. |

## Verification performed

| Check | Result and limit |
| --- | --- |
| Skill structure | All 18 selected skills pass the system skill creator's `quick_validate.py`; names and discovery entrypoints checked for duplicates. This is structural validation, not proof of every instruction's behavior. |
| Existing installation preservation | 76/76 original files retain their before-install SHA-256 hashes. |
| UI UX query | `keyboard focus modal --domain ux -n 1` returns the relevant Interaction / Focus States guidance. No design system was persisted. |
| gstack browser | An owned loopback fixture loads, snapshot exposes its button, clicking changes the counter from 0 to 1, screenshot is saved, and console reports no errors. The owned browser and HTTP server are stopped. |
| QA evidence | A synthetic CLI command's output and exit status are captured; `materialize` creates a complete evidence record with no open failures. |
| QA deadline | An expired deadline reports `expired: true`; `run` returns 124 and the forbidden marker file is not created. |
| Repository CI contracts | Exact Node 24.19.0: `node --test tests/ci/*.test.mjs` passes 162/162, with no skips. This is the command behind `pnpm test:ci`, not the full `pnpm check`. |
| Change scope and documents | The actual impact selector classifies the five changed Markdown files as `documentation`, with no framework/pages build or browser jobs. New document links resolve and the diff whitespace check passes. |

Raw local setup evidence is retained under ignored `.runtime/skill-setup/`,
including `validation.json`, `ci-tests.log` and the completed
`smoke-20261111T182641` run. It contains tool/fixture observations, not portfolio
acceptance. Initial smoke attempts exposed PowerShell parameter forwarding and
sandbox ancestor-access issues; forwarding was repaired and the complete smoke
rerun passed with normal host permission escalation. Deadline exit 124 was
verified as the expected refusal, not an installation failure.

No public application code, source assets, package manifest, lockfile or CI
workflow changed. Full application builds, public-site browser suites, physical
devices and live deployment were not exercised for this documentation/tooling
task. The new routing has been inspected against representative scenarios; no
claim is made that arbitrary combinations can never conflict. Recheck routing
and host adapters when updating these pinned upstream skills.
