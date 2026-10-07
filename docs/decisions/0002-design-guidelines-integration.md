# 0002 — Withdraw implementation; integrate design guidelines only

Date: 2026-10-07 (Europe/Berlin)

The owner's current request is: **withdraw the portfolio implementation and integrate `WEBSITE_DESIGN_GUIDELINES.md` into the project without starting implementation**. This supersedes the earlier implementation request. The uncommitted portfolio slice is removed and the software/content baseline is restored to `e4eb6e2`, the existing framework and materials-source documentation commit. Decision 0001 and the earlier planning documents remain preserved.

## Guide location and authority

The supplied v1.0 file from `C:\Users\JosHsuan\Desktop\WEBSITE_DESIGN_GUIDELINES.md` is copied verbatim to [docs/WEBSITE_DESIGN_GUIDELINES.md](../WEBSITE_DESIGN_GUIDELINES.md). Keeping the original wording preserves its proposal, acceptance criteria and source context; it does not execute its embedded brief.

| Subject | Authority and interpretation |
|---|---|
| Work currently authorized | The owner's current explicit request; this step is documentation integration only. |
| Presentation and visual acceptance | The supplied guide: cinematic engineering editorial, original FORM / SYSTEM / MAKE identity, accessible reading and truthful demonstrations. |
| Stack, versions, module boundaries and deployment | The maintained architecture and existing repository implementation/lockfile. |
| Professional facts, contributions, media and publication rights | The designated private preparation records and explicit owner decisions, with their evidence/review limits. |
| Earlier design documents | Historical references, preserved; conflicting proposed visual direction does not supersede the supplied guide. |

Sections 14–16 of the guide describe future implementation phases, acceptance gates and a reusable prompt. They are not new requests from the owner. Reference links do not authorize copying assets or layouts, visiting every reference site, or installing packages.

## Reconciliation and deferred decisions

- Preserve Next.js static export, React/TypeScript, CSS Modules, the agreed R3F/Theatre boundary, local-only Studio, the exact toolchain and committed dependency lockfile. The guide is not a version-selection or migration instruction.
- The guide's Home/Work/Lab/About structure is a future presentation target. Current `/projects/` and `/research/` scaffold routes remain unchanged; route changes and exporter adaptation require a later implementation scope.
- English remains the language of maintained documentation and future UI. The existing Traditional Chinese scaffold is retained until a later UI adaptation is requested.
- The owner previously approved `JosHsuan Chao`, `Computational Design Lead`, and `I design systems that connect geometry, computation and fabrication.` as proposed identity copy. That content decision is preserved here, while the website profile is restored to `null`. It does not authorize importing other biography, project, CV, contact or media content.
- Palette, typography, glyphs, procedural geometry, authored motion, representation controls, terminal/ASCII and performance targets remain documented requirements or options. No scene, motion export or visual implementation is retained from the withdrawn slice.
- Publication approval, private-source boundaries, truthful contributions and ordinary navigation remain requirements for any future work. Materials preparation recipes and folder access do not expand authorization.
- Deployment remains a separate owner-authorized action. The existing manual Pages workflow is unchanged.

## Withdrawal boundary

The inspected working tree contained 41 modified tracked files and 29 new implementation files, with no staged changes or new commit. Those changes covered the English portfolio UI, Work/Lab routes, case-study renderer, lamella code/asset, Theatre authoring/export, schema/tooling changes, tests and implementation claims in documentation. They were restored or removed. The slice preview was stopped; its isolated authoring profile, generated bundles, measurements, reports and screenshots were removed from the repository workspace.

Generated detail pages are removed only by the restored `pnpm content:export`, which exports an empty public snapshot and zero detail routes. No manual edit is made under `src/app/(entries)`. No private preparation files or deployment configuration are modified.

The retained changes are Markdown only: this decision, the verbatim guide, and integration links/scope notes in README, AGENTS and architecture revision 2.2. Validation runs confirm the restored framework; they do not begin a new implementation phase.

## Withdrawal verification

Verified on 7 October 2026 on Windows, using Node 24.19.0 and pnpm 11.19.0:

| Requirement | Current evidence |
|---|---|
| Source implementation restored | Git differences outside Markdown are empty, including application, content, tooling, tests, dependency lockfile and deployment workflow. |
| New slice removed | All 29 inspected implementation files are absent; isolated authoring outputs/profile and old slice reports were removed. The slice preview process was stopped. |
| Public data empty | Projects, research and assets are `[]`; profile is `null`; the exporter reports zero detail routes and motion validation reports zero manifests. |
| Original scaffold retained | Static output contains only Home, Projects, Research, About, Contact and 404. The UI remains the original Traditional Chinese scaffold. |
| Guide preserved | Source and repository copy are byte-identical: SHA-256 `4fc99cf5faf5ee6107da2a7d0dde05bce7664e994d3b55c1bbe64553e1d0f317`. |
| Framework checks | `pnpm check` passed: content, lint, types, 9 unit/controller tests, static build and public-artifact audit. |
| Browser checks against restored `out/` | 9 passed across Chromium, WebKit and mobile Chromium emulation: empty navigation/reload/history, no-JavaScript reading, keyboard/focus, motion preference, 390/768/1440 layouts and 404. |
| Firefox | One bounded launch attempt failed with `browserType.launch: spawn UNKNOWN`; assertions did not run. |

No new scene/authoring, real-device, subpath, remote CI or deployment verification was performed in this documentation step. Earlier implementation measurements and scene validation do not apply to the restored empty framework and are not retained as current project claims. New ignored build/test outputs describe only the restored scaffold.
