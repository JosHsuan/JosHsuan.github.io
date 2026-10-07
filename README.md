# Portfolio framework

An empty Next.js portfolio framework with a documented external materials-preparation source. The maintained [architecture](docs/architecture.md) defines the software/content boundaries and subsequent discussion steps. No project copy, profile, CV, contact details, images, models or authored animation have been added to the site, and it has not been published.

## Source authority and language

| Responsibility | Primary source |
|---|---|
| Software architecture, dependencies, routes, public schemas and tooling | This GitHub working folder: `C:\Users\JosHsuan\Documents\GitHub\JosHsuan.github.io` |
| All project, CV and content preparation | `D:\JosHsuan_Website\_private\portfolio-preparation` |
| Integration rules and current scope | [Architecture Sections 00 and 12](docs/architecture.md#00-current-project-baseline-and-source-authority) |

English is the primary project language. Discussions with the owner use Traditional Chinese. Original evidence retains its source language. The existing Chinese UI is an interim scaffold state; its later English adaptation and any bilingual support will be discussed separately.

The preparation path is a documentation-level designation. It is not an environment variable, import source, watched directory or build dependency. This integration updates Markdown only; it does not use materials to populate the website. The private folder and website content inputs remain unchanged. Normal builds work without that drive.

## Design guidelines and current scope

The supplied [Website Design Guidelines v1.0](docs/WEBSITE_DESIGN_GUIDELINES.md) are preserved verbatim as the presentation reference. They describe cinematic engineering editorial, an original **FORM / SYSTEM / MAKE** identity, accessible reading/navigation, truthful case studies and future procedural experiments. The [architecture](docs/architecture.md) continues to govern the stack, software boundaries, exact versions and static deployment; preparation records continue to govern factual content and publication limits.

On 7 October 2026 the owner requested withdrawal of the portfolio implementation and integration of this guide **without starting implementation**. The repository is back to the empty framework. The guide's phases, commands, execution brief and embedded implementation prompt are future reference, not a current task. English UI adaptation, Work/Lab route changes, project selection, media, scenes, authored motion and optional terminal/ASCII interfaces remain deferred. Prior approval of the three proposed identity strings is recorded but does not populate the site. See [decision 0002](docs/decisions/0002-design-guidelines-integration.md) for precedence, reconciliation and withdrawal verification.

## Role-specific local proposals

The owner subsequently authorized an isolated [UI/UX designer material workspace](roles/uiux-designer/README.md). Its opt-in skills/MCP configuration, pinned licensed assets and 26 working specimens live under `roles/uiux-designer/`, with a separate local inspection desk at `http://127.0.0.1:4175/`. Round 02 adds seven [spatial motion and object-feedback proposals](roles/uiux-designer/research/spatial-feedback.md). Round 03 extends the Saved direction into [six connected feature proposals](roles/uiux-designer/research/spatial-editorial-system.md), reviewed at `http://127.0.0.1:4175/features/` in the same browser. This is proposal work; the portfolio remains the empty framework. Normal application builds do not include those assets, tools or experiments. [Decision 0003](docs/decisions/0003-uiux-material-workspace.md) records the role and delivery boundaries.

Round 04 applies the spatial vocabulary directly to [19 existing materials](roles/uiux-designer/research/applied-feedback.md): Icons, Interface, Motion, Spatial, Typography and Identity. Each keeps its original controls and Saved ID, with a Baseline/Spatial comparison inside its working specimen. [Review the applied collection](http://127.0.0.1:4175/?collection=applied-feedback#materials).

The owner has recorded these rounds as the [UIUX design plan](roles/uiux-designer/UIUX_DESIGN_PLAN.md), with Saved as the authoritative preference source. The plan preserves the distinction between the original browser choices, an uncaptured snapshot and curator proposals. The separately authorized [3D Artist workspace](roles/3d-artist/README.md) now includes twelve material, lighting, physics, texture and shader studies. Its [initial session brief](roles/3d-artist/SESSION_BRIEF.md) remains historical; the role's research and verification records describe the implemented work. See the [role index](roles/README.md) for workspace boundaries and local preview entry points.

## Development

The owner also authorized a [local Bending-Active Thesis case review](roles/uiux-designer/cases/bending-active-thesis/README.md), now available at `http://127.0.0.1:4184/`. It combines the metal-panel thesis evidence, an inspected derivative of the supplied Rhino assembly, and the UIUX/3D Artist/cinematography research. [Geometry Engineer](roles/geometry-engineer/README.md) provides an isolated conversion skill and read-only MCP. [Decision 0004](docs/decisions/0004-local-thesis-review.md) defines this local-only content boundary; the production framework and public snapshot remain empty.

The subsequent [cinematic integration](docs/decisions/0005-cinematic-thesis-integration.md) replaces the initial boxed viewer with one persistent background scene and seven naturally scrolling chapters. The new [Interactive Experience Director](roles/experience-director/README.md) coordinates layers, source evidence and cross-role acceptance. Working crops, narrative preparation and rendered captures remain under the designated D-drive work area; prepared local handoffs are explicit. Public deployment remains separate.

Use Node **24.19.0** and pnpm **11.19.0**.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open `http://127.0.0.1:3000`. After a later change to repository content inputs, restart the development server or run `pnpm content:export` separately. This reads only repository-local publication inputs, not the private preparation folder.

```sh
pnpm check
pnpm exec playwright install chromium firefox webkit
pnpm test:e2e
pnpm preview
```

`check` runs content validation, ESLint, TypeScript, unit/controller tests, static export and artifact auditing. Browser tests serve the production `out/` artifact. Preview runs at `http://127.0.0.1:4173`.

## Implemented structure

| Path | Responsibility |
|---|---|
| `src/app` | Home, Projects, Research & Development, About, Contact and 404 shells |
| `src/components` | Shared layout, navigation, empty states and entry templates |
| `content` → `src/generated` | Empty publication inputs, strict validation and reproducible public snapshot |
| `src/features/scene-viewer` | User-activated loading, poster boundary, contained failures and presentation modes |
| `src/scenes` | Empty explicit registry and shared camera/inspection helpers |
| `src/motion` | Playback contract, lifecycle, Theatre adapter and native-scroll integration |
| `scripts` | Public-input export, asset/motion validation, artifact audit and static preview |
| `tests` | Content/path tests, cancellation/ownership tests and browser checks |
| `.github/workflows` | Root/subpath validation and a separate manual publishing workflow |

Project/research detail pages are generated from published entries. Empty content produces no fictional slug. Do not edit the generated `src/app/(entries)` directory manually.

## Materials and subsequent discussion

[Architecture Section 12](docs/architecture.md#12-content-architecture-and-materials-preparation) maps the private project packs, CV draft, attribution, evidence, asset manifests, candidates and review records into the current website contract. The candidate schema is provisional and does not directly match the public schema. No importer or synchronization has been implemented.

The owner will choose the next step: project/research selection, public narrative and contributions, CV/contact scope, English copy, selected media and any actual scene. No selection or translation is implied by the folder designation. Preserve existing evidence and permissions while resolving only the questions relevant to that step.

Earlier design documents remain historical references. The [framework decision](docs/decisions/0001-empty-framework.md) records the software baseline. Real-scene, Studio authoring and clean exported-state replay have not been demonstrated; see the [compatibility record](docs/compatibility.md) for verified scaffold checks and remaining gaps.

## Static export and publishing

`pnpm build` creates `out/`. Leave `NEXT_PUBLIC_BASE_PATH` empty for a user site; use one `/repository-name` for a project site. See `.env.example`. Subpath verification in PowerShell:

```powershell
$env:NEXT_PUBLIC_BASE_PATH = '/portfolio-test'
pnpm build
pnpm test:e2e
Remove-Item Env:NEXT_PUBLIC_BASE_PATH
pnpm build
```

CI checks both paths. The publishing workflow accepts a successful CI `push` run from the default branch at the same commit and deploys its tested root artifact without rebuilding. Remote CI, Pages configuration and deployment have not been run. Confirm the actual hosting destination before publication; scaffold pages currently use `noindex`.
