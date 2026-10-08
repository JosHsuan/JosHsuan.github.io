# Project Architecture: Website Framework and Materials Preparation

> **Build a complete, readable portfolio first. Treat 3D and motion design as an independently testable presentation layer—not as a prerequisite for accessing the work.**
>
> Keep Theatre.js as the motion-design authoring and playback system. Integrate it through a small application-owned adapter, with direct Core bindings as the preferred starting point. Do not make `@theatre/r3f` a mandatory dependency until its exact package combination has passed compatibility and authoring tests.

| Document information | Value |
|---|---|
| Owner | JosHsuan Chao |
| Audience | The owner, collaborating developers, and coding agents |
| Revision | **2.5 — 8 October 2026; explicit Bending-Active public release and Pages artifact pipeline** |
| Language | English for project documentation and future website content; Traditional Chinese for discussion with the owner |
| Scope | Portfolio, Research & Development, About/CV, Contact, and selected interactive project stories |
| Delivery baseline | Next.js static export to GitHub Pages; no paid domain, paid storage, or continuously running backend required for the initial release |
| Status | **Reusable framework remains empty. The completed Bending-Active case now has an owner-authorized public release and an independently tested Pages artifact.** |
| Evidence | Existing repository implementation, inspected preparation records, and the original official-documentation/source register; evidence scope is recorded in Sections 12 and 22 |
| Repository destination | `docs/architecture.md` is the maintained architecture; software implementation in the GitHub working folder takes precedence over older proposed layouts |
| Design reference | `docs/WEBSITE_DESIGN_GUIDELINES.md` — supplied v1.0, preserved verbatim; presentation requirements for a later explicitly authorized implementation |
| Materials preparation root | `D:\JosHsuan_Website\_private\portfolio-preparation` — designated source for all project, CV, and content preparation |

## Executive decision

**Public thesis release — 8 October 2026:** The owner made the repository public and requested commits, push and GitHub Pages deployment. [Decision 0006](decisions/0006-public-thesis-pages.md) authorizes the completed Bending-Active presentation and required prepared derivatives. A checked-in release allowlist supplies a clean `.pages-workspace/out/` build, with no private-drive or ignored-input dependency. CI validates this public case separately from the unchanged empty framework; the manual deployment consumes its successful same-commit artifact. Earlier local-only restrictions below are historical for this selected release; unrelated materials remain private. The immersive background behavior is retained for this presentation with its documented fallbacks and performance limits.

**Owner-authorized local thesis review — 7 October 2026:** The owner explicitly confirmed the Bending-Active Thesis local work page following further 3D Artist texture/shader research. [Decision 0004](decisions/0004-local-thesis-review.md) records the narrow private-source/local-derivative boundary. The [case workspace](../roles/uiux-designer/cases/bending-active-thesis/README.md) is a separate Next static review at port 4184 with sanitized local data, a verified CAD mesh and on-demand rendering. A scoped Geometry Engineer role fills the model-conversion gap. The production public snapshot, generated routes and publication gates remain unchanged; the ordinary build does not read private drives.

**Cinematic case revision — 8 October 2026:** The owner subsequently requested continuous background 3D, layered native-scroll storytelling, decorative pointer tilt and a coordinating role. [Decision 0005](decisions/0005-cinematic-thesis-integration.md) records the local implementation and the new Interactive Experience Director. Seven measured chapters now share one demand-rendered scene and camera writer. New working material processing and captures take place under `D:\JosHsuan_Website\_work\bending-active-thesis\cinematic-integration`, followed by an explicit sanitized review handoff. Automatic background loading is a local immersive-preview exception, with the measured mobile transfer overrun retained rather than silently changing the Section 14 targets. This does not populate the production root or authorize publication.

**UI/UX role proposal scope — 7 October 2026:** After the documentation-only integration, the owner requested UI/UX-specific skills/MCP setup, public-source asset research and individually working local proposals. [The opt-in role workspace](../roles/uiux-designer/README.md) contains those materials and its inspection desk. This authorizes local prototypes within that role, while the production framework/content/routes remain empty. [Decision 0003](decisions/0003-uiux-material-workspace.md) defines the separation; role tooling is not automatically activated for other roles or imported by the public site.

The subsequent [spatial editorial feature proposal](../roles/uiux-designer/research/spatial-editorial-system.md) extends the owner's Saved preferences into an index, method reader, media inspection, comparison, geometry workbench and shared actions. Its same-origin review surface reads local Saved choices without rewriting them. These are tested role prototypes and proposed integration contracts, not populated portfolio features or changes to the approved production stack.

Round 04 additionally applies [material-specific spatial feedback](../roles/uiux-designer/research/applied-feedback.md) to all 19 original materials across Icons, Interface, Motion, Spatial, Typography and Identity. Stable IDs preserve Saved records; each specimen offers Baseline/Spatial comparison. The existing Theatre export and property-ownership boundary remain intact, while picked geometry, shader response and DOM/SVG feedback stay inside the role workspace.

**Preserved documentation checkpoint — 7 October 2026:** The owner requested withdrawal of the portfolio implementation and integration of [Website Design Guidelines v1.0](WEBSITE_DESIGN_GUIDELINES.md) without starting implementation. The software/content baseline was restored to the empty framework in revision 2.2. Its execution brief, phase sequence and ready-to-use prompt remain reference material and do not activate portfolio work. [Decision 0002](decisions/0002-design-guidelines-integration.md) records the withdrawal, precedence and deferred choices. The subsequent role proposal request is separately scoped above.

**Recommended composition:** Next.js + React + TypeScript for the website; Three.js + React Three Fiber + Drei for 3D; Theatre Core + development-only Studio for authored motion; GSAP for DOM animation and scroll input; narrowly scoped Zustand stores for shared interaction state; Playwright for browser regression testing.

**The important change is the dependency boundary, not the addition of more tools.** The website calls its own motion interface. The Theatre adapter translates that interface into Theatre operations. Scene bindings apply the resulting values to Three.js objects. Studio edits the same motion schema locally and exports versioned JSON for production.

This follows Theatre's documented framework-agnostic integration model, but the particular adapter architecture below is **a recommendation for this project**, not a proven industry-wide standard or a guarantee of compatibility with every future React/R3F release. [S03], [S04]

### What revision 2.0 changed from revision 1.0

| Area | Revision 2.0 decision |
|---|---|
| Theatre integration | Core bindings are the preferred P0 route; the official R3F extension is conditional, not required. |
| Evidence | Separate documented features, historical reports, architectural recommendations, and untested assumptions. |
| Version control | Treat package compatibility, motion-data changes, and model revisions as separate but coordinated concerns. |
| Authoring | Specify the real editing experience, including optional camera capture, local-storage conflicts, and clean production replay. |
| Lifecycle | Define playback cancellation, camera ownership, route re-entry, project identity, and demand-rendering behavior. |
| Upgrades | Add compatibility branches, old-data/new-runtime checks, release records, and atomic rollback. |
| Long-term scope | Preserve static hosting and the PostgreSQL/Neon export path without adding a live backend requirement. |

### Reading guide

| Need | Read |
|---|---|
| Understand future visual direction and its current authorization boundary | [Website Design Guidelines](WEBSITE_DESIGN_GUIDELINES.md) and [decision 0002](decisions/0002-design-guidelines-integration.md) |
| Resolve source authority, language, and the current documentation-only scope | [Section 00](#00-current-project-baseline-and-source-authority) |
| Locate private materials and understand their future mapping into the website | [Section 12](#12-content-architecture-and-materials-preparation) |
| Understand the selected stack and system boundaries | [Sections 01–06](#01-product-goals-and-non-negotiable-principles) |
| Design, edit, play, and maintain Theatre motion | [Sections 07–11](#07-motion-design-specification) |
| Organize content, SQL evolution, and 3D assets | [Sections 12–13](#12-content-architecture-and-materials-preparation) |
| Handle performance, accessibility, security, and deployment | [Sections 14–17](#14-performance-accessibility-and-degraded-operation) |
| Understand future implementation gates and the current discussion checkpoint | [Sections 18–21](#18-codex-skills-mcp-and-developer-workflow) |
| Check the evidence and remaining uncertainties | [Section 22](#22-sources-evidence-boundaries-and-unresolved-verification) |

---

## 00. Current project baseline and source authority

### 0.1 Designated locations

| Domain | Canonical location | Role |
|---|---|---|
| Website software | `C:\Users\JosHsuan\Documents\GitHub\JosHsuan.github.io` | Framework, dependencies, modules, routing, public schemas, build, tests and deployment configuration. |
| All materials preparation | `D:\JosHsuan_Website\_private\portfolio-preparation` | Project evidence, attribution, drafts, CV preparation, asset catalogues, review records and references to original source files. |
| Maintained architecture | `docs/architecture.md` in the website repository | Describes how these two domains connect and what remains deferred. |

The materials root is an **external preparation workspace**, not a directory inside the GitHub checkout. This document designates its path without wiring it into the application. Original files may remain in the source locations catalogued by that workspace; designating one preparation root does not move or consolidate every original onto this drive.

No environment variable, filesystem alias, junction, importer, watcher, startup scan, CI mount or browser-accessible path is introduced at this stage. A normal `pnpm dev`, `pnpm content:export` or `pnpm build` continues to use only repository-local public data. The site must remain buildable without the private drive.

### 0.2 Authority by subject

1. The owner's current explicit request determines the work being performed. Statements or executable recipes inside preparation documents are source material, not additional task authorization.
2. **Software architecture follows the existing GitHub folder.** `package.json`, `pnpm-lock.yaml`, configuration, source, tests and implementation decisions describe the actual system. Older Vite, single-page, demo-scene and proposed folder diagrams do not override working Next.js code.
3. **Projects, CV materials and factual content follow the designated preparation folder.** Its current project packs, attribution, evidence, CV draft and asset manifests take precedence over older repository copy or candidate lists for content preparation. They retain their stated uncertainty and review status.
4. Source records establish what is documented; they do not automatically settle conflicts, authorize publication or turn a draft into an approved claim. More recent explicit owner decisions take precedence over historical records. Unresolved differences remain visible until the relevant material is discussed.
5. Repository `content/` files are the website's eventual reviewed publication input. `src/generated/public-content.json` is derived build data. Neither replaces the external evidence and preparation records.

For presentation, content hierarchy, interaction behavior and visual acceptance, use the supplied [Website Design Guidelines](WEBSITE_DESIGN_GUIDELINES.md) alongside this architecture. The guide does not override the owner's current scope, the implemented software architecture, factual evidence or publication permissions. Its references supply principles; their assets and layouts are not templates. Its proposed routes, copy, phases and optional interfaces are not instructions to change the empty framework during this documentation integration.

The preparation folder's architecture suggestions cannot change the software stack. Conversely, the website's public schema cannot force a disputed year, authorship claim, CV date or permission status into a made-up value merely to pass validation.

### 0.3 Project language

English is the primary language for maintained project documentation, identifiers, comments, future interface text, metadata and reviewed website copy. Discuss choices, questions and progress with the owner in Traditional Chinese. Original source documents, quotations, official titles and proper names may retain their source language; translated text must preserve the original meaning and evidence references.

The private candidate file currently declares `zh-Hant`, and the existing empty UI also uses Traditional Chinese. These are recorded current states, not the new default language policy. Translation and an `en` document language belong to the later, explicitly discussed implementation step. A bilingual interface remains an option to discuss; this documentation pass does not add locale routing, translate private drafts or alter UI strings.

### 0.4 Current implementation and scope

The repository already has a Next.js/React/TypeScript static framework, five empty sections and a 404 page, validated empty content, an empty scene registry, motion controller/adapters, and CI/manual deployment definitions. The installed toolchain and earlier verification results are recorded in [compatibility.md](compatibility.md), not inferred from the architectural examples below.

The production portfolio remains at the framework baseline restored by the **Markdown-only integration in revision 2.2**. No projects, private drafts, CVs or professional assets are selected/imported, no preparation drive is wired into build/runtime, and no guide implementation or deployment is activated. Revision 2.3 adds separately authorized UI/UX tools and local proposal specimens under `roles/uiux-designer/`, as scoped in the executive note and decision 0003. Public content arrays remain empty and the profile remains `null`. The existing Chinese scaffold UI and Projects/Research routes remain in place; future English copy and logical Work/Lab routes are deferred.

The owner will discuss how to use the materials step by step. Sections 07–20 retain design requirements and future acceptance criteria; they are not an instruction to begin those phases now. The full P0 scene/Studio proof has not been completed.

### 0.5 Document relationships

| Document | Current interpretation |
|---|---|
| This architecture | Maintained integration plan and source/language policy. |
| `docs/WEBSITE_DESIGN_GUIDELINES.md` | Verbatim supplied v1.0 presentation reference; future phases and embedded prompts are not current implementation authorization. |
| `docs/decisions/0002-design-guidelines-integration.md` | Portfolio withdrawal, documentation-only scope and guide/architecture reconciliation. |
| `README.md`, `docs/decisions/0001-empty-framework.md` | Current setup and framework implementation decision. |
| `docs/compatibility.md`, `docs/toolchain.md` | Actual recorded dependency/tool validation, with explicit gaps. |
| `docs/asset-pipeline.md`, `docs/motion-authoring.md` | Repository publication and later scene-authoring procedures under the scope defined here. |
| `docs/personal-website-direction.md` | Historical design discussion; its single-page/Vite direction, candidate copy and language defaults do not supersede Sections 0.2–0.3. |
| `docs/pmndrs-personal-website-guide.md` | Historical technology research, not a dependency installation list. |
| Preparation `README.md`, `report.md`, current project packs and review records | Primary materials index and evidence; their claims of earlier processing/QA are not new tests performed in this revision. |

---

## 01. Product goals and non-negotiable principles

### 1.1 What the website must communicate

The website should make it easy to understand who JosHsuan is, the relationship between Computational Design, Design Technology, Architecture, Digital Fabrication, and software development, and the specific contribution made to each project.

Every published project should explain its problem, context, personal role, methods, outcomes, limitations, and collaborators. Research pages should distinguish research questions, prototypes, findings, and publications. The CV and contact information must remain easy to find.

A representative mesh can become part of a project's visual identity and respond to mouse, scroll, or interface actions. This does **not** require running a separate interactive Canvas on every project card or making every project depend on a 3D asset.

### 1.2 Visual direction

Prefer a restrained editorial layout: clear grids, strong typography, deliberate whitespace, readable captions, and consistent navigation. Motion should explain a geometric relationship, assembly process, computational method, or design decision.

Do not default to particle fields, floating text, perpetual model rotation, or long cinematic introductions. Use a static image, diagram, or approved video when that communicates the idea more clearly.

### 1.3 Architectural principles

1. **Content remains available without 3D.** A failed model, renderer, or motion runtime must not break navigation, project text, CV access, or contact details.
2. **One writer per animated property.** Camera and object ownership are explicit; systems do not compete by relying on update order.
3. **Authored work is reproducible.** A clean checkout and clean browser must reproduce the approved animation without another person's local storage.
4. **Public assets are intentionally public.** Only approved content enters the repository's public history or deployed artifact.
5. **Complexity requires evidence.** Add a library, abstraction, or service only when an actual requirement justifies its cost.

These are project requirements, not claims about what every creative website must do.

---

## 02. Selected stack and deferred capabilities

### 2.1 Initial implementation

| Layer | Selection | Responsibility and boundary |
|---|---|---|
| Website | **Next.js App Router + React + TypeScript** | Routes, build-time content rendering, metadata, layout, and small interactive client components. |
| Styling | **CSS Modules + CSS custom properties** | Typography, spacing, layout, responsive behavior, and design tokens. |
| 3D | **Three.js + React Three Fiber + Drei** | Scene composition, model loading, cameras, lights, materials, and necessary interaction helpers. |
| Renderer | **Three.js WebGLRenderer** | Establish the tested baseline; do not begin with an unverified WebGPU switch. |
| Authored motion | **Theatre Core + Theatre Studio** | Core evaluates and plays motion; Studio is a local authoring tool. |
| Integration | **Application-owned motion adapter and typed scene bindings** | Isolate Theatre operations and map semantic motion values onto scene objects. |
| DOM and scroll | **GSAP + ScrollTrigger + `@gsap/react`** | DOM transitions and native-scroll progress; no competing writes to Theatre-controlled properties. |
| Shared state | **Zustand, where sharing is actually needed** | Scene mode, selected part, and preferences—not every frame or every piece of content. |
| Content | **Validated public snapshot behind a content-reading interface** | Separate publication data from UI, SQL, models, and animation internals. |
| Quality assurance | **Type checking, unit tests, Playwright, and build auditing** | Protect content, interaction, motion playback, deployment paths, and fallbacks. |
| Development | **Codex + verified Skills/MCP tools** | Assist implementation and inspection; never required by visitors. |

These are chosen roles rather than capability limits. GSAP can animate Three.js and Theatre can animate DOM values; the split is deliberate to keep ownership understandable. [S03], [S15]

### 2.2 Add later only with a specific requirement

| Capability | Admission condition |
|---|---|
| React Postprocessing | A demonstrated visual benefit that cannot be achieved adequately with the base lighting/material setup, within the measured budget. |
| React Three Rapier | A genuine rigid-body or collision interaction. An exploded assembly is not itself a physics requirement. |
| UIKit | Interface elements truly need to exist in 3D/XR space. Navigation and project text remain HTML. |
| React Spring | A concrete spring interaction justifies another animation system and has a clearly assigned property owner. |
| `@theatre/r3f` | The published version declares suitable peers, the full combination passes tests, and the viewport editing benefits justify the coupling. |
| WebGPU/TSL | A measured benefit or necessary feature, validated separately across renderers, materials, effects, and browsers. |
| PostgreSQL/Neon automation | Content management warrants the workflow; public serving still consumes a validated export. |
| Persistent cross-route Canvas | Measured remount cost or a genuine cross-page 3D transition makes it worthwhile. |

Do not initially build a CMS, authentication system, generic scene editor, game engine, real-time backend, or multiplayer infrastructure.

### 2.3 Next.js versus Vite

React is the UI library; Next.js is the selected website framework. Vite is not another renderer beneath React and is not required alongside Next.js. R3F documents both Next.js and Vite integration. [S01]

For this document, retain Next.js because the site is content-rich and should export individual project pages. This is a project-specific trade-off, not a claim that Vite cannot support a portfolio. Next.js static export can produce route HTML without a live Next.js server. [S19]

**Existing-repository rule:** inspect the actual repository before changing frameworks. A working Vite application should not be discarded merely to match this folder diagram. Record a deliberate migration decision and preserve existing functionality.

---

## 03. Overall system and dependency direction

### 3.1 Three separate environments

| Environment | Contains | Must not depend on |
|---|---|---|
| Content and asset preparation | The external materials root from Section 00: evidence, drafts, CV preparation and asset processing; selected publication inputs only after discussion | A visitor's browser, a website build, or the public site remaining open. |
| Local development and authoring | Next.js dev environment, Studio, coding agents, verified MCP tools, inspection utilities | Public access to an editor or production database credentials. |
| Published website | Static HTML/CSS/JS, approved media, selected 3D modules, Theatre Core and exported state | Studio, local storage from the author, SQL availability, Codex, or MCP servers. |

### 3.2 Data and rendering flow

The diagram below describes the eventual public runtime. The private-to-public preparation handoff in Section 12 is documented but not connected; no private folder is read by this flow today.

```text
Approved content + approved media + exported motion state
                           |
                  Validation and build
                           |
                   Next.js static export
                           |
                      GitHub Pages
                           |
          +----------------+------------------+
          |                                   |
  HTML content and DOM UI             On-demand 3D island
          |                                   |
      GSAP / CSS                      React Three Fiber
          |                            |             |
          |                           Drei        Scene objects
          |                                          |
          +--- events / shared low-rate state --- Scene Director
                                                     |
                                           Application Motion API
                                                     |
                                               Theatre adapter
                                                     |
                                                Theatre Core
                                                     |
                                       semantic values / bindings
                                                     |
                                          Three.js scene objects
                                                     |
                                              WebGLRenderer

Local authoring only:
Theatre Studio -> exported state + schema + manifest -> review -> Git
```

Theatre is not above R3F in the React rendering hierarchy. It supplies animation values. The adapter does not become a second scene graph.

### 3.3 Import rules

Pages compose content and features. Viewer features coordinate scene loading and user actions. Scene modules know their geometry and semantic motion parameters. Only the Theatre integration modules import Theatre runtime APIs, apart from deliberately colocated schema-construction code that belongs to that integration boundary.

Generic UI components must not import `@theatre/core`, `@theatre/studio`, or a project's motion JSON. A scene must not import website routing logic or SQL code. Enforce the important restrictions with lint rules when P0 establishes the module layout.

### 3.4 Client and server/build boundaries

Keep article text, project metadata, headings, and posters outside the Canvas boundary. Browser-only loading belongs in a small Client Component. Next.js requires `ssr: false` dynamic imports to be used from a Client Component rather than directly in a Server Component. [S20]

A dynamic import is not automatically an on-demand experience: rendering the imported component immediately still requests it immediately. Gate the first 3D load by an explicit interaction or viewport proximity policy. Keep a correctly sized poster while initialization runs.

Start with at most one active project-story Canvas in the main reading experience. Use thumbnails on project grids. Allow route changes to unmount the viewer until evidence justifies persistent rendering.

---

## 04. Compatibility strategy: evidence before version numbers

### 4.1 What has actually been verified

| Observation checked on 6 October 2026 | Supported conclusion | Not established |
|---|---|---|
| R3F installation documentation pairs Fiber 8 with React 18 and Fiber 9 with React 19. [S01] | React and the R3F renderer must be selected together. | That any arbitrary React 19 patch, Three.js release, or helper version is a tested combination. |
| The public Theatre `packages/r3f/package.json` declares Fiber `^8.13.6`. [S02] | That inspected source does not declare Fiber 9 compatibility. | The exact current npm release, or proof that every unsupported pairing necessarily crashes. |
| Theatre documents a direct Core-to-Three.js values binding. [S03] | `@theatre/r3f` is not required to animate Three.js objects. | Universal compatibility of an application-owned binding without tests. |
| Theatre issue #489, opened 28 April 2024, reports outdated tutorial dependencies. [S09] | Documentation/version mismatch has been reported. | A current React 19 diagnosis or evidence of the most popular workaround. |
| Theatre issue #446, opened 6 September 2023, reports an editor error with mixed Theatre package generations. [S10] | Mixing package generations deserves explicit investigation. | That this older issue explains all current integration failures. |
| The public Theatre README discusses private development of 1.0. [S08] | The public repository contains a roadmap statement. | A release date, support commitment, or migration guarantee. |

**Correction to the earlier discussion:** neither a custom Core adapter nor indefinite use of a legacy stack has been established here as the dominant community practice. The recommendation is based on documented integration capabilities and this project's maintenance needs.

During the original revision 2.0 research, registry metadata could not be retrieved directly. The subsequent framework implementation retrieved package metadata and pinned exact versions, including Theatre Core/Studio 0.7.2; see [compatibility.md](compatibility.md). This revision does not re-query registry dist-tags or claim that any pinned version remains the latest.

### 4.2 Compatibility has several layers

| Layer | Typical failure | Required evidence |
|---|---|---|
| Dependency resolution | Peer ranges disagree; package generations are mixed. | Published package metadata and an explained dependency graph. |
| Build and bundling | Browser code executes during static generation; editor imports leak. | Type checking, production build, and module/bundle inspection. |
| Runtime integration | Reconciler errors, duplicate subscriptions, broken controls. | Browser tests using the actual selected versions. |
| Authoring | Studio cannot edit, capture, save, or reopen the intended values. | A real local authoring round trip. |
| Motion and model data | Renamed parameters, stale model nodes, changed coordinate conventions. | State/schema/asset validation and reference-pose comparisons. |

Passing the first row is necessary, not sufficient. A thin adapter reduces the exposed surface but does not eliminate browser, Three.js, bundler, Studio, or data-format compatibility risks.

### 4.3 Candidate release policy

Use a supported stable Next.js line and its supported React combination. React 19 + Fiber 9 is the initial candidate based on the verified pairing; it is not an instruction to ignore newer supported releases when implementation begins. Avoid prereleases in the baseline. Next.js publishes a support policy that should be checked at selection and upgrade time. [S01], [S23]

Select Three.js, Drei, and any controls together with that renderer combination. Select Theatre Core and Studio as a verified compatible release family; initially prefer matching package versions where that release family provides them. Treat any admitted Theatre extension as part of that compatibility group.

Record exact versions for application-critical direct dependencies. Commit the lockfile and pin the Node/package-manager toolchain used in CI.

### 4.4 Exact versions and lockfiles solve different problems

Exact direct versions make deliberate changes visible. The lockfile records the resolved graph, including transitive packages. A frozen install prevents CI from silently rewriting that graph. A caret range does **not** imply that every normal install with a valid lockfile automatically upgrades the package. [S11]

Use `pnpm install --frozen-lockfile` in CI. Do not delete the lockfile merely to make a conflict disappear. Do not treat `npm --force`, `--legacy-peer-deps`, hoisting changes, or peer-range overrides as proof of runtime compatibility.

This is a repeatability policy, not a permanent freeze: security and maintenance updates still need review and testing.

### 4.5 Required compatibility record

Maintain the existing `docs/compatibility.md` with the test date, OS, Node and pnpm versions, exact direct dependencies, relevant peer ranges, package-metadata source, bundler configuration, and outcomes for production, browser, and authoring tests. Add future P0 results only when those checks have actually run.

Use **PASS / FAIL / NOT RUN**. Record `NOT RUN` when a device or tool was unavailable. Include the commit and motion/model revisions tested; do not claim that a dependency table alone establishes compatibility.

---

## 05. Theatre integration options and the selected boundary

### 5.1 Options considered

| Option | Editing experience | Benefit | Cost and decision |
|---|---|---|---|
| **A. Core + Studio + direct bindings** | Studio parameter panels, timeline, and keyframes; a live R3F preview | Avoids requiring the R3F extension; permits semantic scene controls | Some binding code and optional camera capture are application-owned. **Preferred P0 route.** |
| **B. Official `@theatre/r3f` integration** | Editable components and integrated snapshot/viewport authoring | Less custom viewport integration | Adds peer/version coupling. Admit only with verified published compatibility and successful tests. |
| **C. Separately locked local authoring application** | A dedicated editor environment exports data consumed by the public site | Can isolate an editor-specific stack from the website | Two environments and preview-parity maintenance. Use only when A's authoring ergonomics are insufficient and B cannot be adopted safely. |
| **D. Patch or fork an integration** | Depends on the patch | Can address a specific confirmed defect | Creates a maintenance obligation. Last resort with reviewed code, a fixed revision, tests, ownership, and an exit plan. |

The official R3F guide documents editable objects, a scene editor, and a dedicated editable camera. Core-only bindings do **not** automatically provide those viewport features. [S04]

Option C is a containment strategy proposed here, not a claim that Theatre supplies a ready-made separate editor application. If used, keep browser instances and dependency graphs separate, reuse neutral schemas/assets, and validate exported data against the production Core version. Do not mix two React renderer generations inside the same scene.

### 5.2 What the adapter should do

Expose playback operations, clip selection, progress seeking, cancellation, and a stable value-subscription boundary. Scene-specific bindings apply those values to the appropriate objects and request rendering.

Prefer authoring semantic parameters such as `assemblyProgress`, `sectionReveal`, or `focusTarget` over manually maintaining hundreds of repeated part-transform tracks. Scene code maps those parameters to a known model revision.

The adapter must not grow into a general editor, event bus, routing framework, or animation engine. Start with the one camera and one assembly control needed by P0.

### 5.3 What the adapter cannot promise

It does not make Theatre state a universal animation format. It does not remove the need to test Studio. It does not guarantee future React, Three.js, or browser compatibility. It does not automatically migrate old tracks when a model is reorganized.

Keep a tool-independent motion brief with narrative purpose, key poses, clip ranges, parameter meaning, and fallback compositions. Replacing Theatre may still require conversion or reauthoring; the boundary limits code churn rather than eliminating migration work.

### 5.4 Escalation rule

If A fails, identify whether the problem is the binding, data, editor, or toolchain before changing frameworks. If a visual editing requirement cannot be met with a small helper, evaluate B or C explicitly. Do not quietly downgrade the entire website or start maintaining a large editor fork.

An older compatible environment can be retained temporarily for local authoring when necessary. That is not permission to leave the public website on an unsupported framework indefinitely.

---

## 06. Repository structure and module ownership

### 6.1 Implemented website structure

The GitHub working folder is the software baseline. This describes the current scaffold; private materials are not nested inside it.

```text
JosHsuan.github.io/
├── AGENTS.md / README.md
├── package.json / pnpm-lock.yaml / pnpm-workspace.yaml
├── next.config.ts / tsconfig.json / eslint.config.mjs
├── .node-version / .nvmrc / .npmrc / .env.example
├── .github/workflows/
│   ├── ci.yml
│   └── deploy-pages.yml
├── docs/
│   ├── architecture.md
│   ├── compatibility.md / toolchain.md
│   ├── asset-pipeline.md / motion-authoring.md
│   ├── personal-website-direction.md
│   ├── pmndrs-personal-website-guide.md
│   └── decisions/0001-empty-framework.md
├── content/                         # Empty publication inputs
│   ├── projects/index.json
│   ├── research/index.json
│   ├── profile/index.json
│   └── assets.manifest.json
├── scripts/
│   ├── content-source.ts / validate-content.ts
│   ├── export-content.ts / validate-motion.ts
│   └── audit-build.ts / serve-export.ts
├── public/
│   └── media/ models/ decoders/ downloads/
├── src/
│   ├── app/
│   │   ├── layout.tsx / page.tsx / not-found.tsx
│   │   ├── projects/page.tsx / research/page.tsx
│   │   ├── about/page.tsx / contact/page.tsx
│   │   └── (entries)/               # Generated detail routes; empty today
│   ├── components/
│   │   └── layout/ ui/ content/
│   ├── features/
│   │   ├── preferences/
│   │   └── scene-viewer/
│   │       ├── SceneIsland.tsx / SceneCanvas.tsx
│   │       ├── SceneFallback.tsx / SceneDirector.ts
│   │       └── SceneViewer.module.css
│   ├── scenes/
│   │   ├── registry.ts              # Empty explicit registry
│   │   └── shared/
│   │       └── applyCameraPose.ts / InspectionControls.tsx
│   ├── motion/
│   │   ├── contracts.ts / createController.ts / manifest.ts
│   │   ├── theatre/
│   │   │   └── createController.ts / projectRegistry.ts / studio.dev.ts
│   │   └── scroll/useSceneScroll.ts
│   ├── content/schema.ts / content/read.ts
│   ├── generated/public-content.json
│   ├── styles/
│   └── lib/paths.ts
└── tests/
    └── unit/ integration/ e2e/
```

The exporter writes concrete detail pages under the ignored `src/app/(entries)` group using the shared `EntryDetail` renderer. It generates no fictional slug for empty content. Preserve this implementation instead of replacing it just to match a proposed dynamic-route diagram.

The **Scene Director** coordinates lifecycle and mode transitions. The **motion controller** handles playback. Future **scene bindings** understand a selected model's geometry. There is no populated demo scene, authored motion JSON, `src/dev/authoring` route or separate editor application today. The isolated Studio initialization module is preparation for later local authoring, not a demonstrated authoring workflow.

### 6.2 External preparation structure

```text
D:/JosHsuan_Website/_private/portfolio-preparation/
├── README.md / report.md / review-needed.md / cv-draft.md
├── source-roots.json / inventory.jsonl / processing-log.jsonl
├── project-map.json / asset-catalog.json
├── website-candidates.json / website-candidate-schema.json
├── projects/<project-id>/
│   ├── evidence.md
│   ├── attribution.json
│   ├── content-draft.md
│   ├── asset-manifest.json
│   ├── interaction-plan.md
│   └── optional evidence.json / website-candidate.json
├── checkpoints/                     # Review, resume, validation and history
├── cache/                           # Private extraction and preview outputs
├── scripts/                         # Not website build tools
└── public-export/                   # Only .gitkeep at this review
```

All 25 inspected project directories contain the five core pack records above. Optional JSON records are not present in every pack. Some packs also have media or older review snapshots; canonical record priority is defined in Section 12.

Preparation organizes evidence and materials, while the website defines software and its publication contract. Their only future connection is a deliberate, reviewed handoff. No directory synchronization is configured.

---

## 07. Motion-design specification

### 7.1 Start from the explanation, not the timeline

Before authoring, write a short motion brief describing what the visitor should learn. Identify the key composition, the geometric relationship being revealed, what remains visible in reduced-motion mode, and when manual inspection helps.

For example, an assembly story could have four stages:

| Stage | Communication goal | Presentation |
|---|---|---|
| Overview | Establish the object's identity and scale | A readable hero composition and caption. |
| Relationship | Explain how the parts relate | Controlled separation driven by one assembly parameter. |
| Detail | Show one important interface or method | A focused camera composition and DOM explanation. |
| Result | Connect the method to the outcome | A complete object, approved evidence, and a clear next action. |

A motion diagram is not a structural simulation. Do not present an illustrative deformation, particle path, fabrication sequence, or force-field display as measured or simulated evidence unless its source and meaning are actually established.

### 7.2 Project, sheet, and clip convention

Use one Theatre project for each independently loadable scene story. Theatre sheets group objects and have sequences; the named clips below are an **application convention** mapping IDs onto a sheet's time ranges, not a presumed Theatre API for arbitrary named sequences. [S05], [S07]

```text
Project: portfolio.demo-assembly.v1
└── Sheet: Main
    ├── Camera
    ├── Assembly
    ├── KeyLight
    └── Sequence
        ├── overview : 0–2 seconds
        ├── assembly : 2–5 seconds
        └── detail   : 5–7 seconds
```

These durations are illustrative. Let content set the timing. Do not make every project conform to the same seven-second structure.

### 7.3 Semantic parameters

Prefer a small explicit schema: camera position/target/FOV; assembly progress; a selected reveal amount; a limited set of lighting or material values. Theatre supports typed properties and configurable numeric controls. [S38]

For computational models, allow a semantic parameter to drive precomputed per-vertex data or shader uniforms. Keep expensive source computation outside the per-frame React path. Define the topology and attribute revision required by that mapping so optimization does not silently invalidate it.

### 7.4 Responsive motion

Try a shared story with responsive framing before making separate animations. Introduce desktop/mobile sheet variants only when compositions genuinely need different choreography. Only the active variant may drive the camera.

On small or lower-capability devices, a poster, a short user-triggered sequence, or a simpler inspect view may be more useful than continuous scroll-driven camera movement. Never hide essential explanation inside the desktop timeline.

---

## 08. Animation ownership, state, and interaction modes

### 8.1 Property ownership

| Behavior | Default owner | Rule |
|---|---|---|
| Authored camera, lighting, and assembly motion | Theatre values through the scene binding | One owner for each authored property. |
| Cursor-based offset | A local procedural controller / `useFrame` | Apply to a separate transform layer or compose before the final write. |
| Shader time or continuous procedural behavior | `useFrame` or the selected shader mechanism | Use elapsed time/delta, not a fixed increment tied to frame rate. |
| Scroll progress | ScrollTrigger | Send progress to the motion interface; do not also tween the same mesh. |
| DOM transitions | GSAP | Scope to the component and clean up. |
| Simple hover/focus feedback | CSS | Do not add another runtime for simple effects. |
| Manual camera inspection | Camera controls | Own the camera only during explicit inspection/capture. |
| Future rigid-body transforms | Rapier | Do not simultaneously overwrite dynamic-body transforms from Theatre. |

A safe transform hierarchy is:

```text
AuthoredRoot              <- Theatre
└── InteractionOffset     <- procedural interaction
    └── Model             <- local parts and static geometry
```

For the camera, prefer position + target + FOV with one final application of pose. Do not combine keyframed Euler rotation, `lookAt()`, and active camera controls on the same camera. Update the projection matrix when projection properties change. [S37]

### 8.2 Independent state dimensions

| Dimension | Values | Purpose |
|---|---|---|
| Load status | `idle`, `loading`, `ready`, `error` | Describes whether the scene can be used. |
| Presentation mode | `story`, `inspect`, `static` | Describes the visitor's interaction with the scene. |
| Playhead driver | `paused`, `time`, `scroll` | Describes who advances the story timeline. |
| Render quality | `standard`, `low`, `poster` | Describes resource/visual policy. |

These dimensions should not become one giant enum. `static` can mean a still 3D pose; `poster` means no live 3D rendering is required. Incompatible combinations must be rejected or normalized by the Scene Director.

### 8.3 Timeline ownership

Time-driven playback and scroll-driven seeking are mutually exclusive for a sequence.

For scroll-driven playback, pause time-based playback and map normalized progress into the clip range:

```text
time = clip.start + clamp(progress, 0, 1) * (clip.end - clip.start)
```

Validate finite inputs and ordered clip bounds. Clamping is appropriate for slight scroll overshoot; `NaN` or invalid clip definitions are errors rather than valid animation states.

Entering inspection cancels playback and suppresses scroll writes. Initialize the manual controls from the current camera pose and target. Returning to the story releases those controls and explicitly restores or blends to the current story composition.

In static/reduced-motion mode, ignore nonessential autoplay and scroll-camera motion. A user's direct inspection action can remain available where usable.

### 8.4 Where state belongs

| Information | Location |
|---|---|
| Current project | URL/router; do not maintain a competing global `activeProject`. |
| Shareable filters | URL query state where useful; provide a static-compatible reading strategy. |
| Local hover or disclosure state | Local component state. |
| Cross-DOM/Canvas mode and selected part | Scene-scoped Zustand store/provider. |
| User motion/quality preference | A small preference hook/store with deliberate hydration behavior. |
| Camera pose, shader time, and per-frame scroll progress | Refs/controllers, not React render state. |
| Model loading | Loader/Suspense/error boundary, not an unrelated global duplicate. |
| Theatre/Three.js objects | Adapter/runtime references, not serialized application state. |

R3F recommends direct, delta-based updates for fast animation rather than routing frame updates through React state. This project applies the same discipline to high-frequency store subscriptions. [S14]

### 8.5 Native scrolling and input

Keep native document scrolling. Do not add a smooth-scroll framework initially. Use modest sticky sections where they improve the explanation, with clearly visible ways to continue reading.

Refresh scroll measurements after relevant layout changes. Test deep links, history restoration, resizing, images/fonts arriving, and a model becoming ready after the visitor has already scrolled. ScrollTrigger supplies progress and lifecycle mechanisms; the content-to-time mapping remains application logic. [S16]

Avoid stealing mouse-wheel input from reading. Touch interaction should be intentionally activated and should not trap the page inside the viewer.


---

## 09. Motion adapter contract and lifecycle

### 9.1 Application-owned interface

The following is an application-owned TypeScript contract, **not a Theatre API**. The repository now implements this interface in `src/motion/contracts.ts`, with controller lifecycle tests and a Theatre adapter. Actual scene bindings, authored animation and Studio replay remain unverified. Keep Theatre objects and JSON internals out of callers.

```ts
export type MotionMode = 'story' | 'inspect' | 'static';
export type PlayResult = 'completed' | 'cancelled' | 'skipped';

export interface SceneMotionController<ClipId extends string> {
  readonly ready: Promise<void>;

  setMode(mode: MotionMode): void;

  play(
    clipId: ClipId,
    options?: { signal?: AbortSignal },
  ): Promise<PlayResult>;

  pause(): void;
  seek(clipId: ClipId, progress: number): void;
  applyStaticPose(): void;
  dispose(): void;
}
```

Define clip IDs per scene rather than accepting arbitrary strings. The Scene Director selects the active driver and coordinates camera-control handoff. The adapter enforces that an old time-based playback cannot continue while seeking or after disposal.

### 9.2 Behavioral requirements

| Operation | Required semantics |
|---|---|
| `ready` | Resolves only when runtime and required bindings are usable; initialization failures are surfaced to the scene boundary. |
| `play` | Validates the clip, respects mode/preferences, cancels the prior request, and settles its Promise on completion or cancellation. |
| `pause` | Stops active time playback without resetting the pose. Repeated calls are harmless. |
| `seek` | Validates progress, prevents concurrent time playback, updates the selected range, and schedules a render. |
| `setMode` | Releases the previous ownership arrangement and applies the new one; it must not leave controls and story motion active together. |
| `applyStaticPose` | Applies an explicit, readable fallback without requiring a successful timeline evaluation. |
| `dispose` | Idempotently cancels pending work and owned subscriptions/listeners; it does not destroy shared objects owned elsewhere. |

Expected cancellation or reduced-motion skipping can return a status. Corrupt data, invalid clips, or runtime failures should produce actionable errors; do not disguise them as successful playback.

### 9.3 Initialization and cleanup

Initialize in this order: approved assets and state become available; scene objects exist; bindings attach; Theatre readiness is satisfied; the current mode and pose are applied; controls/playback become available.

Use an abort signal or generation token to prevent a late load or `ready` callback from resurrecting a scene after navigation. Make initialization and teardown safe under development remounts and hot reload.

Retain and call every unsubscribe function. In particular, Theatre's `detachObject()` does not cancel listeners previously attached to that object. [S06]

Clean up the scene's own GSAP context, ScrollTriggers, controls, and DOM listeners. Do not use a global animation cleanup that kills unrelated navigation effects. `useGSAP` supports scoped cleanup; delayed callbacks and manually added listeners still require appropriate handling. [S15]

### 9.4 Project identity and route re-entry

Theatre's `getProject()` returns an existing project for an existing ID. Calling it again with new state must not be assumed to reload a live project. [S05]

Use stable project IDs, schema versions, and a bounded registry of known stories. A route remount should reconnect scene bindings and deliberately restore the intended pose. It must not create a new randomly named project on every render.

Detect attempts to reuse a project ID with a different state revision during development. Require an explicit reset/reload or migration path rather than silently accepting stale state. Keep animation object keys independent from changing display titles.

Use unique, deliberate sheet-instance identities if a future feature truly needs simultaneous instances. Do not solve an accidental duplicate mount by allowing two controllers to share one writable camera.

### 9.5 Demand rendering and clocks

Prefer `frameloop="demand"` for scenes that spend time still. After mutating a Three.js object through a binding, request a frame with R3F's `invalidate()`. Invalidation schedules rendering; it is not an immediate completed frame. [S13]

P0 should first use the libraries' normal timing behavior plus value subscriptions and invalidation. Verify first-frame appearance, time playback, scroll seeking, Studio scrubbing, controls damping, and return to idle. Continuous procedural effects need an explicit active-loop policy; they will not keep advancing merely because a `useFrame` callback exists.

Theatre documents a custom RAF driver for synchronization and manual ticking. Introduce that only when measurements or deterministic tests justify it. If adopted, align both playback and subscriptions with the chosen driver and avoid the deadlock where a demand loop waits for a value update that itself waits for that loop. [S12]

Pause nonessential animation when the page is hidden or the viewer is inactive. On return, restore the correct story position rather than replaying an unwanted introduction. Measure CPU activity as well as rendered frames: demand rendering alone does not prove that every timer has stopped.

### 9.6 GPU resource ownership

Maintain an explicit distinction between scene-owned resources and cached/shared assets. Releasing an instance must not dispose of geometry or materials still used elsewhere. Conversely, a route remount must not keep adding unreleased render targets or subscriptions.

Audit real repeated-navigation behavior rather than assuming that unmounting a component frees every external resource. R3F's performance guidance discusses asset reuse and caching; use that as a starting point for an explicit application policy. [S13]

---

## 10. Theatre authoring and animation-data version control

### 10.1 Minimum acceptable editing experience

The owner must be able to adjust the camera, assembly progress, and selected lighting values in Studio, create keyframes, scrub a sequence, export it, and reproduce the result in production without editing numeric constants throughout scene code.

Core bindings retain Studio's timeline and property editing. Integrated draggable viewport tooling remains a separate requirement. If camera composition is awkward, add the limited capture workflow below before considering a larger editor integration.

### 10.2 Optional “Capture View” helper

Enter an explicit local `capture` workflow: pause the story, suppress scroll/procedural offsets, and temporarily grant the preview controls ownership. Frame the object, then capture position, target, and FOV in the coordinate system defined by the scene schema.

Write those values through a Studio transaction. Theatre documents that setting a sequenced property within a transaction creates a keyframe at the current playhead position; unsequenced properties are not automatically turned into complete animation tracks. [S36]

After capture, release manual ownership and evaluate the authored pose again. Account for parent transforms when converting world-space camera values. Test undo, editing at a nonzero time, and returning to playback.

This helper is a bounded application feature—not a promise of a complete viewport editor. If it expands into selection tools, gizmo management, a parallel scene graph, and general editing infrastructure, stop and revisit Option B or C.

### 10.3 Authoring-to-production workflow

1. **Define the motion brief and schema.** Identify stable keys, parameter units, model revision, key poses, and fallback composition.
2. **Open local authoring mode.** Ensure Studio is enabled intentionally; turn off competing scroll/procedural drivers.
3. **Edit and review.** Check the intended desktop/mobile framing and the actual project content around the scene.
4. **Export state.** Save the Theatre JSON alongside the schema, manifest, and any required model revision.
5. **Review the change.** Compare key poses and changed clips, then commit the coherent set of files.
6. **Replay from a clean context.** Build without Studio and verify the committed state in a fresh browser context with no authoring storage.

Theatre documents exporting project state and passing it to Core. Treat browser persistence as an editing convenience, not the delivery artifact. [S03], [S05]

### 10.4 Manifest and schema requirements

A motion manifest belongs to the application. It is not a replacement for Theatre state and should not duplicate every internal track.

| Field | Purpose |
|---|---|
| `schemaVersion` | Version of the application's semantic parameter contract. |
| `projectId`, `sheetId` | Stable identifiers associated with the export. |
| `stateRevision` or content hash | Identifies the exact approved state file. |
| `authoredWith` | Exact Theatre Core/Studio/extension versions used for the export. |
| `testedRuntime` | Exact runtime used to validate playback; separate from the authoring version. |
| `modelAssetId`, `modelRevision` | Links motion to the asset, node structure, attributes, units, and pivot assumptions it needs. |
| `clips` | Clip IDs, sheet/range references, and their narrative purpose. |
| `requiredBindings` | Semantic objects/parameters the scene must implement. |
| `layoutVariant` | Shared, desktop, or an explicitly authored mobile variant. |
| `staticPose` | A readable configuration that does not depend on evaluating a valid Theatre sequence. |
| `reviewedAt`, `reviewedBy` | Actual review information; do not populate these before review. |

Check that all clip bounds and required data are present before publishing. IDs and hashes help detect mismatches; they do not prove that the composition looks correct.

### 10.5 Local storage and branch switching

A browser's persisted Studio state can conceal the fact that a different Git branch has different animation data. Use separate authoring browser profiles/origins or a documented project-specific reset/import procedure when switching branches.

Export unsaved work before clearing authoring state. Never automate deletion of all local storage just to fix one project. After importing or switching state, verify the project identity, current sequence, and known checkpoint poses.

A clean production browser test is mandatory precisely because an author's familiar browser can hide this problem.

### 10.6 Safe file and Git workflow

Store exported motion JSON, schema, manifest, approved web assets, and reference-pose evidence as a coherent revision. Keep raw private source models elsewhere. Use stable JSON formatting without blindly changing internal arrays or undocumented IDs.

For conflicting edits to one Theatre project, prefer serializing ownership or reconciling the edits in Studio. Do not assume a successful textual Git merge preserves a valid or intended timeline.

`studio.createContentOfSaveFile()` can produce export data programmatically; it does not by itself write to the repository or create a Git commit. Begin with an explicit export workflow. A local save endpoint is an optional development feature requiring its own path restrictions and access controls. [S36]

### 10.7 Production exclusion

Keep Studio in isolated development imports, guarded at build time. A hidden panel, a `devDependency` label, or a production query parameter is not a reliable exclusion boundary.

Inspect the generated module/bundle report and actual network requests. Fail the publication gate if Studio code, authoring-only entry points, or privileged debug surfaces enter the public artifact. A production flag must not allow a visitor to turn editing back on.

Do not use an unverified assumption about tree shaking as the only evidence that the editor is absent. Theatre's production guidance establishes the editor/runtime split; this project adds an explicit artifact audit. [S04], [S08]

---

## 11. Dependency upgrades, data migrations, and rollback

### 11.1 Keep three types of change distinct

| Change | Example | Primary validation |
|---|---|---|
| Dependency upgrade | New React/R3F, Three.js, or Theatre version | Existing scenes and existing state still build, edit, and replay correctly. |
| Motion-data change | New keyframes, renamed parameters, revised clip ranges | Manifest/schema agreement and intended key poses. |
| Model-data change | Different node names, pivot, topology, or material assignment | Bindings and motion remain correct for the new asset revision. |

Prefer separate changes so failures are diagnosable. When a migration necessarily spans categories, preserve the old baseline and document the coordinated transition explicitly.

### 11.2 Upgrade workflow

Create a dedicated branch. Capture the current passing baseline. Read the relevant release notes and package metadata, update one coherent dependency group, and review the lockfile diff.

Run type checking, unit/integration tests, the static build, public-artifact audits, browser E2E, motion checkpoints, and the Studio round trip. Review visual differences before accepting new reference images. Only then merge and publish the tested artifact.

Group React/React DOM/R3F-related changes when their compatibility requires it. Group Theatre packages when their release relationship requires it. Do not update every library, rewrite the scene, and change the motion design in one unreviewable patch.

Review maintained/security updates regularly. Exact pinning is not a reason to stop maintenance. Check the selected framework's support policy rather than assuming an old working build remains an acceptable long-term baseline. [S23]

### 11.3 Motion compatibility matrix

| Runtime | Motion export | Question |
|---|---|---|
| Existing runtime | Existing export | Is the known-good baseline reproducible? |
| Candidate runtime | Existing export | Does the runtime upgrade preserve existing published motion? |
| Candidate runtime | Newly authored export | Does the new authoring workflow produce correct runtime data? |
| Existing runtime | New export | Only required if independent data updates or old-runtime rollback are promised. |

Do not require old software to understand a new data format by assumption. If new exports are incompatible, deploy and roll back runtime, state, schemas, and assets together.

### 11.4 Patch and override policy

An override can be considered when the issue is specifically understood—for example, an inaccurate peer range rather than an incompatible implementation—but it requires evidence, a documented reason, a fixed scope, and regression tests. It is an exception, not the baseline strategy.

A fork also needs an owner, exact commit, reviewed changes, licensing records, and a plan to remove or maintain it. Do not adopt an anonymous compatibility fork solely because an example starts successfully.

### 11.5 Release and rollback record

For each published release, record the source commit, lockfile/toolchain identity, public-content snapshot revision, motion manifests, asset hashes, test results, and static artifact identity.

Rollback should restore the previous **coherent release**, not just `package.json`. Retain externally stored assets needed by that release. A cached old page must not reference a model that has been replaced in place with incompatible geometry.

If a motion feature is broken, an approved poster or static pose can keep the content available while the integration is corrected. That is a controlled degraded state, not a claim that the animation passed.

---

## 12. Content architecture and materials preparation

### 12.1 Designated workspace and inspection scope

All project, CV and content preparation is based on `D:/JosHsuan_Website/_private/portfolio-preparation`, the same Windows path designated in Section 00. Relative preparation paths below are relative to this external root. This architecture records structure and integration rules without copying drafts, personal details, private evidence, source media or converted assets into Git.

This revision inspected root documentation, structured indexes, the candidate schema, project-pack file coverage, relevant review/attribution records and a supplemental-source note. It did not re-review original portfolios, full project narratives, media, CAD/code or the entire source corpus. Existing validation reports are historical evidence; their scripts were not run.

### 12.2 Preparation records and responsibilities

| Preparation record | Role in later content work | Relationship to the website |
|---|---|---|
| `README.md`, `report.md` | Delivery scope, processing limits and recent amendments. | Planning references, never page content by default. |
| `source-roots.json`, `inventory.jsonl` | Original-source IDs, locations and recorded processing scope; baseline S01–S12 means 12 source roots. | Private traceability; website builds do not traverse these roots. |
| `project-map.json` | Stable IDs, aliases, families, classifications and canonical record links. | Starting point for discussing future public project/research identities. |
| `projects/<id>/evidence.md`, optional `evidence.json` | Factual support, uncertainties and supplemental-source notes. | Ground later English copy; detailed source locations remain private. |
| `projects/<id>/attribution.json` | Personal work, team outcomes and separate collaborator/tool/photography roles. | Basis for reviewed role, contribution and credit fields. |
| `projects/<id>/content-draft.md` | Prepared narrative with its existing confidence and publication limits. | Source for later English adaptation, not a ready-to-publish article. |
| `projects/<id>/asset-manifest.json` | Asset identity, derivatives, authorship, rights and validation. | Basis for individually selected public files and asset records. |
| `asset-catalog.json` | Global asset index with private traceability and output references. | Reconcile IDs with per-project manifests; never copy this catalogue into public JSON. |
| `projects/<id>/interaction-plan.md` | Candidate ways to explain material interactively. | Input to a later motion brief under the implemented scene contract. |
| `website-candidates.json`, `website-candidate-schema.json`, optional per-pack `website-candidate.json` | Provisional selection and proposed payload; global integration state is `not_connected_to_website`. | Adapt to `src/content/schema.ts`; these are not a compatible snapshot or an importer. |
| `cv-draft.md` | CV evidence, variants and open questions. | Primary preparation for About/CV; no profile/contact field is populated now. |
| `review-needed.md`, `checkpoints/review-needed.json` | Questions, affected outputs and structured current/historical review states. | Preserve unresolved points for the relevant discussion. |
| `checkpoints/resume.json`, `checkpoints/unprocessed-queue.jsonl`, delivery/validation records, `processing-log.jsonl` | Resume context, unfinished processing and previous operations. | Preparation provenance, not proof of website readiness. |
| `cache/`, old checkpoints and backups | Extraction outputs, previews and history. | Private working material, not competing current content sources. |
| `scripts/` | Preparation/validation recipes with their own assumptions and write guards. | No website build step executes them. |
| `public-export/` | Reserved preparation-side handoff folder. | Only `.gitkeep` currently; not connected to repository `public/`. |

For T3, `projects/t3-mocap-bending-active/asset-manifest.json` is the canonical combined manifest. `asset-manifest-reviewed.json` is an earlier snapshot. Current per-project attribution and the latest attribution update take precedence over older classification fragments, subject to newer explicit owner decisions.

The preparation records designate the S12 **VerFacade** portfolio as the primary personal/team-role reference where it covers a project. Other evidence remains relevant where it does not. This priority concerns roles; it does not automatically establish algorithm originality, media ownership, exact dates or permission to publish.

### 12.3 Recorded preparation state

This is a bounded inventory snapshot on 6 October 2026 from current indexes and recorded delivery counts, not a new audit of every original file.

| Measure | Recorded state | Interpretation |
|---|---|---|
| Project packs / independent families | 25 / 24 | Inside Out is an IDF2019 component, not an unrelated extra workshop. |
| Role classification | 8 individual, 15 collaborative, 2 requiring attribution confirmation across packs; 7/15/2 across families | Separate from media authorship and public rights. |
| Asset records | 244 | Logical records, not 244 approved website assets. |
| Selected website asset references | 48 | Provisional references, not final pages or downloads. |
| Candidate publication | All 25 `publishable=false`; 13 `pending_confirmation`, 11 `internal_only`, 1 `explicitly_not_public` | No automatic publication selection. |
| Asset publication states | 213 `internal_only`, 29 `pending_confirmation`, 2 `explicitly_not_public` | No blanket permission follows from the catalogue. |
| Review records | 63 structured entries | Include historical/updated role questions; not necessarily 63 unresolved blockers. |
| Original-source index | 26,724 files: 1,067 with recorded processing scope, 25,642 pending content processing, 15 excluded | Historical preparation scope, not files re-read in this revision. |
| Public handoff | 0 payload files | `public-export/` contains only its marker. |
| Whole-corpus deep reading | Incomplete | Metadata, hashing, conversion and partial reading establish different things. |

The metal-panel evidence contains a newer supplemental-source pointer outside the S01–S12 baseline, not yet incorporated into its inventory/manifests. This integration preserves that distinction without following the extra source or changing historical totals.

No pack is selected for Home, Projects, Research, CV or a scene here. The full private index remains the starting point for later discussion; the architecture does not duplicate every project's narrative or private review details.

### 12.4 Website sections and future material inputs

| Website area | Preparation inputs when discussed | Responsibility |
|---|---|---|
| Home | Reviewed positioning, CV draft and selected project evidence | Establish the owner and selected work; actual copy and selection are deferred. |
| Projects / detail pages | Project map, attribution, evidence, drafts and selected manifests | Explain context, personal contribution, methods, outcomes, limitations and credits in English. |
| Research & Development | Research evidence, publications/prototypes and related packs | Distinguish research findings from display effects. Choose project/research placement with the owner. |
| About/CV | CV draft, references and review questions | Confirm selected names, qualifications, titles, dates and download content. |
| Contact | Channels chosen by the owner later | Do not automatically extract contact details from historical CV pages. |
| Scene story | Selected model/poster, interaction plan and asset-specific checks | Define a motion brief and scene only after material and explanatory purpose are chosen. |

The website currently contains empty shells. Research and project entries share the existing public entry schema. Preparation labels do not create routes, content types or scenes automatically.

### 12.5 Mapping into the implemented public schema

The repository schema defines the software contract; preparation records define the evidence and material descriptions. This table is an adaptation plan, not import code.

| Preparation input | Eventual repository/public field | Adaptation rule |
|---|---|---|
| Project `id`, aliases and parent/relationship information | Entry `id`, `slug` | Choose stable public identities. Retain a private mapping; do not merge related packs or lose a component relationship automatically. |
| `title`, narrative draft, `contribution_summary` | `title`, `summary`, `sections` | Write reviewed English copy preserving official names and factual limits, using known text/section fields rather than executable MDX. |
| Current attribution and evidence | `role`, `contributions`, `credits` | Separate personal work, collective results, source tools, teaching, fabrication help and media authors. |
| Draft/evidence and interaction plan | `categories`, `methods`, `outcomes`, `limitations` | Confirm the interpretation; animation does not prove a simulation or measured outcome. |
| `year`, `year_text`, date variants | Entry `year` | The current schema requires one integer. Resolve chronology or discuss extending the schema; never guess to satisfy validation. |
| `asset_ids` and matching manifests | Entry `media`, `content/assets.manifest.json` | Select individual files; reconcile identity, rights, captions, alternative text and credits. |
| Asset `output_path`, `output_sha256`, processing/revision records | `path`, `sha256`, `revision`, `alt`, `credit`, `approved` | Produce an intentional final web file and hash its actual bytes. A preview hash applies only if the selected bytes are unchanged. |
| `fact_status`, `public_status`, `publishable`, `required_gates` | Private review state before `status: published` | Not equivalent to the website's `draft/published` union or `approved: true`. No flags are promoted here. |
| CV draft and later chosen public CV | Profile `name`, `summary`, `biography`, optional `cvAssetId` | The current profile schema is small; structured employment/education/publications may need a later schema discussion. |
| Owner-chosen contact details | Optional profile `email`, `links` | A historical contact detail is not a choice to display it. |
| Later reviewed interaction/motion brief | Optional `sceneId`, explicit scene loader, model/motion manifests | A prepared GLB or interaction plan does not establish a scene or runtime compatibility. |
| Private paths, evidence references, confidence notes, review history | No current public DTO field | Keep in preparation records, outside page data, bundles and downloads. |

Repository drafts accept only `status`, `id`, `slug` and optional `title`; they cannot hold full private candidates. The public schema has no `parent_project_id`, `relationship`, `year_text`, locale objects or structured CV timeline. Discuss any needed software extension instead of silently discarding facts or inserting incompatible data.

The detail renderer and scene registry do not decide editorial hierarchy. Slugs, parent/component presentation, asset ordering, CV sections and bilingual behavior remain discussion items.

### 12.6 Reconciliation decisions and open differences

| Difference | Integrated handling |
|---|---|
| Older single-page/Vite plan vs existing Next.js routes | Keep the GitHub software implementation; retain earlier experience ideas for future design discussion. |
| Earlier five-project shortlist vs the larger preparation index | Use the full preparation index for discussion; neither list automatically defines the published selection. |
| Earlier role summaries vs current VerFacade attribution | Use current scoped attribution. Preserve separate questions about original code, media authors and publication rights. |
| Repository wording that Caschlatsch may be shared vs restrictive/pending private records | Preserve the recorded owner permission and material-specific uncertainty. Do not revoke permission solely because an older record differs, or expand it to every related asset/code file. Match the exact material when discussed. |
| Aliases, timber/voxel relationships and IDF2019/Inside Out | Preserve stable IDs and relationships; related imagery or titles do not justify automatic merging or double-counting families. |
| T3 motion-capture/bending-active work vs the metal-panel thesis | Keep their records, models and evidence chains distinct despite shared wording. |
| Supplemental source outside the original index | Preserve its pointer and unprocessed status privately; it is not a validated addition to global totals. |
| CV variants, historical “Now”, titles and dates | Preserve uncertainty; do not infer current employment, formal degree conferral, exact dates or contact choices. |
| Chinese source drafts/current UI vs new language policy | English is the project default. Translation and UI updates wait for the next implementation discussion. |
| Preparation “validation passed” vs website acceptance | Prior preparation QA does not establish scene/Studio, browser or device compatibility. |

### 12.7 Future handoff, currently inactive

```text
External preparation workspace
  evidence + attribution + CV draft + manifests + review states
                         |
             owner discussion of one defined scope
                         |
             reviewed English public content
             + selected web assets and credits
                         |
         deliberate preparation-to-repository handoff
         (manual or a later explicitly designed adapter)
                         |
        repository content/ + approved public/ files
                         |
       existing validation and content:export
                         |
      public snapshot + concrete detail routes
                         |
             existing Next.js static export
```

No file has crossed this handoff in the current integration. Preparation `public-export/` is reserved staging, not a watch folder or mirror. The first later step is discussion of a defined content/material scope, not running an importer.

Keep evidence corrections in the preparation records and deliberate publication edits in repository inputs. Do not edit the generated snapshot as a competing master. A later handoff should preserve private provenance linking the source records, final asset bytes and public revision, without exposing private references to visitors.

### 12.8 PostgreSQL, automation and publication

PostgreSQL/Neon and Python remain optional future preparation/export tools. Do not introduce a database, CMS or automatic conversion simply to connect the two folders. If database authoring later replaces a preparation responsibility, record that change of authority explicitly.

The public snapshot and CI must remain independent of private-drive availability, private source repositories, credentials and authoring browser storage. Keep review notes, raw source paths, private contacts, source CV pages and permission records out of public DTOs. Drafts remain excluded from generated routes and data. Accessibility in the private workspace, a successful conversion or inclusion in a candidate list does not by itself make a file a website asset.

---

## 13. 3D asset and computational-data pipeline

### 13.1 Recommended flow

```text
Approved Rhino / Grasshopper / Blender / other source
                         |
       publication review and geometry cleanup
                         |
   units, axes, pivot, names, materials, UV normalization
                         |
                      GLB/glTF
                         |
       inspection and selective optimization
                         |
      visual + binding + metadata verification
                         |
       versioned asset manifest and web-ready output
                         |
                   on-demand scene
```

Do not assume a raw CAD file is suitable for direct web delivery. Confirm the export path against the actual source application and model requirements.

### 13.2 Asset conventions

| Concern | Project convention |
|---|---|
| Units and axes | Use meters and Y-up in the web presentation; document where any millimeter conversion occurs. |
| Pivot and bounds | Record expected origin, orientation, dimensions, and camera framing assumptions. |
| Semantic parts | Stable names/IDs for selectable or animated parts. |
| Material ownership | Clone or isolate instance-specific materials before changing them; avoid unintentionally changing all shared instances. |
| Color and lighting | A documented renderer/material convention, reviewed after rendering upgrades. |
| Computational attributes | Version any per-vertex vectors, custom attributes, morph targets, or mapping data alongside topology. |
| Preview | An approved poster and textual explanation for every interactive scene. |
| Provenance | Source revision, public-use status, optimization configuration, and final asset identity. |

The unit and naming rules are application conventions. They must be applied once consistently, not inferred differently in every component.

### 13.3 Optimize according to interaction requirements

Measure file size, texture dimensions, visible geometry, draw calls, and startup cost before adding compression. glTF Transform supplies inspection and optimization tools, including geometry and texture processing. [S28]

Choose Meshopt, Draco, or texture transcoding according to the asset and measured result. Do not load every decoder by default. Include decoder/transcoder and environment-map requests in the scene's network budget.

Merging parts, removing nodes, reordering vertices, or changing topology can break selection, assembly bindings, and computational attributes. Validate those contracts after optimization. A smaller GLB is not sufficient evidence of a successful export.

### 13.4 Hosting and public-source boundaries

Keep large original CAD/Blender files out of the static artifact. Small approved web assets can be deployed with the site initially. Use logical asset IDs so a future storage change does not require rewriting every scene.

Git LFS is not a substitute for a web asset delivery pipeline; GitHub documents that LFS cannot be used with Pages sites. Do not publish pointer files and expect a browser loader to receive the underlying model. [S27]

Use content-versioned filenames or hashes for updated assets and preserve those required by rollback releases. Inspect model metadata and filenames as well as visible geometry for confidential information.

---

## 14. Performance, accessibility, and degraded operation

### 14.1 Initial budgets

The following are **proposed starting budgets, not browser limits, official standards, or measured results**. Measure against a production export and record the browser, device, network conditions, and cache state.

| Metric | Initial target | Measurement |
|---|---|---|
| Initial non-3D JavaScript | Approximately 250 KiB compressed | Bundle report and cold-load transfer; record justified exceptions. |
| Essential first-screen transfer | Approximately 1.2 MiB, excluding user-activated media/3D | Network waterfall. |
| First interactive-scene assets | Approximately 5 MiB desktop; about 2 MiB or poster on constrained/mobile devices | Include model, textures, environment, and necessary decoder requests. |
| Visible draw calls | Prefer fewer than 100 | Renderer statistics and actual scene inspection. |
| Visible geometry | Start near or below 150k triangles on desktop, lower where needed | Actual visible scene; not a guarantee of frame rate. |
| Pixel ratio | Initial cap 1.5; low-quality mode 1.0 | Visual/performance comparison on target devices. |
| Active animation | Aim near 60 FPS on the target desktop and a stable 30 FPS on the target phone | Real-device traces, including startup stalls and sustained use. |
| Idle behavior | No unnecessary continuous rendering or background animation work | Compare active and inactive viewer behavior. |

Treat these as review thresholds. Do not hide overruns by changing the target after measuring. Prefer removing unnecessary work over adding an elaborate performance-management system.

Compressed transfer size is not the same as runtime CPU/GPU memory. Monitor actual behavior and resource counts; do not report renderer memory counters as a precise VRAM byte measurement.

### 14.2 Quality policy

Use `standard`, `low`, and `poster` policies. Low quality can reduce pixel ratio, shadow cost, texture resolution, and optional effects. Poster mode preserves the story without live rendering.

Do not infer GPU capability solely from viewport width or user-agent text. Allow a manual override and use actual initialization failures or sustained performance evidence where available. Avoid repeatedly switching modes in response to a brief loading stall.

### 14.3 Accessibility requirements

Use semantic HTML for headings, project text, navigation, and controls. Provide keyboard-accessible alternatives for important model interactions and textual equivalents for selected-part information. A tiny raycast target must not be the only way to understand a project.

Respect `prefers-reduced-motion` and expose a site preference. Disable nonessential autoplay, parallax, camera travel, and long scroll scrubbing under the reduced-motion policy. Prefer an immediate stable composition rather than merely slowing the same motion. The browser media feature communicates the user's system preference. [S34]

Keep visible focus indicators, logical reading order, and non-blocking controls. Project text must remain visible if GSAP never initializes; do not make content permanently dependent on an initial `opacity: 0` state. Reserve layout space for images and Canvas/poster replacement.

Core content, ordinary links, and the CV should remain usable with JavaScript disabled. Decorative Canvas content should not produce redundant accessibility announcements; meaningful interactions need a labeled DOM interface.

### 14.4 Distinguish failure types

| Failure | Preferred response |
|---|---|
| Motion data/runtime fails but model is valid | Stop motion and apply a known static pose, or show the poster. |
| Model request fails | Keep the poster and explanation; offer a bounded retry. |
| Renderer cannot initialize | Use the HTML/poster fallback immediately. |
| WebGL context is lost | Pause controllers, preserve content, and use a controlled recovery or fallback. |
| Performance remains poor | Reduce quality once according to policy, then offer/choose poster mode. |
| Scene component throws | Contain the error inside the viewer; preserve the page and navigation. |

R3F provides Canvas fallback and documented error-handling patterns, but an application's full recovery policy still needs implementation. [S17]

Do not create infinite asset retries or GPU reconstruction loops. Cancellation during normal navigation is not an error message that should alarm the visitor.

---

## 15. Renderer and postprocessing policy

Use **WebGLRenderer** for P0 and the initial public release. Do not describe WebGL/WebGPU as a free interchangeable toggle.

Three.js documents that `WebGPURenderer` can fall back to a WebGL 2 backend. That is behavior within that renderer, not proof that existing custom shaders, third-party postprocessing, and all WebGLRenderer features transfer unchanged. R3F's migration documentation also describes WebGPU-specific initialization and compatibility considerations. [S18], [S35]

Keep a separate experimental branch/fixture for WebGPU. Validate geometry, materials, environment lighting, shadows, custom shaders, effects, controls, asset errors, and target browsers. Adopt it only after a clear benefit is shown.

For postprocessing, begin with no effects. Add one effect at a time with a visual reason, a compatible version, a quality-mode policy, and an agreed cost. Do not use effects to compensate for incorrect color handling or an unreadable composition.


---

## 16. Security, licensing, and publication control

### 16.1 Publication approval is an asset-level gate

Review company work, research collaborations, client geometry, simulation results, factory imagery, and internal labels individually before publication. Browser-delivered models should be treated as downloadable, regardless of interface restrictions.

Review the whole output: HTML, client data, public files, motion JSON, GLB metadata, debug messages, source maps, and filenames. Unlinked content can still be public. A static website is not a confidentiality boundary.

Keep private originals and approval evidence outside any repository that may later become public. Removing a file from the current tree does not remove it from Git history; publication review must address history and previous artifacts as well.

### 16.2 Dependency and tool trust

Install packages and agent tools only from identified sources, with fixed revisions where appropriate. Review dependency scripts and new permissions. Keep production/build secrets out of untrusted pull-request jobs and client-side environment variables.

MCP tools should receive only the required filesystem, shell, network, and account access. Do not send unapproved company assets or credentials to an external service as a convenience for development.

### 16.3 Licensing is not uniform across this stack

| Component | Verified licensing distinction | Project action |
|---|---|---|
| Theatre Core | The public repository identifies Apache-2.0 for Core. [S08] | Record the actual installed package's license and required notices. |
| Theatre Studio | The repository identifies AGPL-3.0 for Studio. [S08] | Keep it local and excluded from public runtime; review obligations before modifying or distributing an editor. |
| GSAP | Uses its own Standard “No Charge” License, including restrictions on certain visual-animation-building products. [S29] | Record the license version and permitted project use; do not label GSAP as MIT/Apache merely because it is available without charge. |
| Models, textures, fonts, photographs, video, and code samples | Rights depend on each asset/source. | Maintain approval and attribution records. |

The intended portfolio is not a visual animation-builder product. Nevertheless, the preference for open-source, low-lock-in tooling should not be translated into an inaccurate claim that every chosen dependency has a permissive open-source license. Treat GSAP's license as an explicit acceptance item in P0. If a strictly open-source-only dependency policy is adopted, revisit that selection rather than silently overlooking the exception.

Do not infer a complete legal conclusion solely from `dependencies` versus `devDependencies`. The actual distributed code and applicable licenses matter.

---

## 17. Static deployment and release workflow

### 17.1 Hosting baseline

Use Next.js static export and GitHub Pages. The actual hosting destination must follow this repository's verified account and Pages configuration; it is not inferred from a personal name or a hostname in older planning material. No domain purchase is required by this architecture. This documentation revision does not configure or publish Pages.

GitHub documents the distinction between user/organization sites and repository project sites. Pages availability for a private source repository depends on the account plan; do not change visibility or purchase a plan without authorization. [S25], [S26]

Next.js static export generates deployable files without a request-time server. Generate published dynamic routes at build time; do not depend on Server Actions, runtime request handlers, or the default server image-optimization service in this deployment mode. [S19]

### 17.2 Configuration baseline

This is a simplified configuration excerpt. The actual implementation and additional production-boundary checks are in `next.config.ts`; recorded root/subpath export results are in `docs/compatibility.md`.

```ts
import type { NextConfig } from 'next';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

// This project allows root hosting or one repository path segment.
if (basePath !== '' && !/^\/[A-Za-z0-9._-]+$/.test(basePath)) {
  throw new Error('BASE_PATH must be empty or a single /repository segment');
}

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath,
  images: { unoptimized: true },
};

export default nextConfig;
```

The path-validation rule is an application convention, not a universal Next.js restriction. The implemented exporter generates concrete routes in `src/app/(entries)` for published projects/research before the build; it does not currently use `[slug]` plus `generateStaticParams()`. Keep this working strategy and leave drafts out of the export. The configuration above is illustrative; `next.config.ts` is authoritative.

### 17.3 Route and asset URLs

Use an empty base path for the user site and `/<repository-name>` for a project-site deployment. Next.js base-path handling for route links does not remove the need to manage model, poster, video, decoder, and download URLs deliberately. [S21]

Create a tested `publicAssetUrl()` helper for approved root-relative asset paths. Add the base path exactly once. Represent external asset URLs separately; do not feed arbitrary external strings into a local-path prefixer.

Test direct access and refresh on nested routes, the 404 page, CV downloads, poster/model loading, and both root and simulated repository-path exports. Check actual MIME responses and decoder loading rather than accepting a successful HTML request as a successful model load.

### 17.4 Images, metadata, and contact

Pre-generate appropriate image sizes/formats and reserve dimensions. `unoptimized` image configuration does not reduce an oversized original file on its own. Generate page titles, descriptions, canonical URLs, Open Graph metadata, and the sitemap from approved content and centralized origin/path settings.

Start Contact with a confirmed email and relevant links. Do not ship a form that appears to submit but has no working delivery mechanism. Adding submissions later is a separate service/security decision.

### 17.5 Build once, test, then publish that artifact

```text
Pinned toolchain and frozen dependency install
  -> type/lint/content/motion/asset validation
  -> unit and integration tests
  -> production static export
  -> public-content and bundle audit
  -> serve the generated output directory
  -> Playwright and failure-mode tests
  -> approval
  -> publish that same output artifact
```

Run instrumented motion fixtures separately where needed, but do not let them replace tests against the exact public artifact. Do not rebuild with different environment variables after the final tests and call the new output tested.

Keep deployment separate from validation so an agent can verify code without automatically publishing it. Retain an identifiable prior release for rollback. Avoid exposing secrets in logs and build reports.

### 17.6 Hosting constraints

Pages has documented site-size, bandwidth, and usage limits. It is suitable here as a static portfolio baseline, not a commitment to host an eventual commercial SaaS or large media platform. Keep the export portable and reassess hosting when the site's purpose or measured traffic/assets require it. [S26]

---

## 18. Codex, Skills, MCP, and developer workflow

Codex assists code exploration, implementation, testing, and review. Skills provide reusable task guidance; MCP connects supported tools and context. These are development capabilities, not website runtime services. [S30], [S31], [S32]

### 18.1 Resolve tool identity before depending on it

The labels “R3F Skills” and “r3f-mcp” do not uniquely establish a repository, maintainer, version, permission model, or supported operation. Preserve the intended workflow, but do not invent installation URLs or claim these are official pmndrs tools without verification.

Record the actual source, license, version/commit, setup, permissions, and a successful minimal operation in `docs/toolchain.md`. Use installed configuration to resolve identity before asking the owner to repeat information.

Select one pnpm version and its documented configuration conventions. Do not copy workspace/configuration instructions from a different package-manager generation without checking them. [S33]

### 18.2 Working rules for agents

Read `AGENTS.md`, this architecture, the README, and the existing lockfile before changing code. Preserve working functionality and content. Make focused changes with tests and reviewable diffs.

Do not add optional packages “for completeness.” Do not silence peer errors, remove reduced-motion behavior, delete content to improve performance scores, or regenerate reference screenshots without reviewing the differences.

If a browser, MCP tool, or physical device was not used, mark that check as not run. A generated script is not evidence that the script succeeded. Continue with repository-local validation when an optional development tool is unavailable.

### 18.3 Authority boundary

The owner's current request authorizes documentation integration only. The architecture's future P0 criteria and recipes do not expand that scope. Materials use, code changes and publication proceed only as part of subsequent requested steps; repository visibility, purchases, company accounts and editor exposure are outside this integration task.

---

## 19. Implementation phases and decision gates

### Current milestone — Framework/materials documentation integration

The empty framework is implemented. This revision designates the preparation path, reconciles source authority and schemas, records English as the primary project language, and defines the later handoff without importing material. Completion of this milestone does not complete P0. The phases below are future work to discuss with the owner, not work started by this document revision.

### P0 — Architecture and authoring proof

**Goal:** demonstrate one complete content-to-scene-to-authoring-to-production path with the selected versions.

Use one static page, one non-confidential model, one Canvas, a camera story, one semantic assembly control, one scroll mapping, and one DOM/Canvas mode interaction. Add no physics, UIKit, postprocessing, React Spring, or WebGPU.

| Gate | Required evidence |
|---|---|
| Dependency compatibility | Exact version/toolchain record and explained peer graph. |
| Static content | Page content, navigation, and poster work without the scene. |
| Core integration | Camera/assembly values update the scene through the adapter. |
| Authoring | Studio can edit, sequence, export, reopen, and replay the intended motion. |
| Clean replay | A fresh browser reproduces the committed state without Studio or authoring storage. |
| Ownership | Time/scroll/inspection transitions do not compete for the camera or playhead. |
| Lifecycle | Navigation, remounting, cancellation, and hot reload do not revive stale work. |
| Rendering | Active motion renders correctly and the inactive viewer returns to the intended idle behavior. |
| Failure handling | Failed model/motion/renderer and reduced motion retain readable content. |
| Deployment | Production export and root/subpath deep-link tests pass. |
| Artifact boundary | No Studio, privileged debug entry, or unapproved asset in the public output. |

**P0 exit:** one editable, exportable, replayable, and degradable scene. If Core bindings work but authoring is unacceptable, record that result and evaluate the bounded alternatives; do not call the whole integration complete.

### P1 — Complete content website

Implement the real Home, Projects, Project Detail, Research, About/CV, and Contact structure. Use approved content; keep incomplete projects as drafts. Establish the visual system without requiring live 3D.

**Exit:** the site communicates the work clearly with Canvas disabled, and adding a content-only project does not require changing the motion system.

### P2 — One representative motion-designed case study

Choose one approved project asset and create a useful story with overview, explanation, detail, and result. Include inspection, mobile framing, a static alternative, and a documented authoring/export procedure.

**Exit:** the motion improves understanding of the project, not merely visual novelty. The owner can edit and export it without reverse-engineering the codebase.

### P3 — Production hardening and release

Complete real-device checks, performance measurement, accessibility review, asset/publication audit, deployment validation, and rollback rehearsal.

**Exit:** an approved static artifact is reproducible, tested, and ready for authorized publication.

### P4 — Evidence-led expansion

Add further stories, SQL automation, postprocessing, physics, 3D UI, WebGPU, or cross-route rendering only when a documented requirement or measurement justifies them. Record benefit, cost, compatibility, and removal/rollback strategy for each material change.

---

## 20. Test matrix and definition of done

### 20.1 Automated coverage

| Layer | Required checks |
|---|---|
| Pure functions | Clip mapping, invalid values, mode/driver transitions, asset URLs, content schema, public whitelist. |
| Motion-data contracts | Export identity, required parameters/tracks, clip bounds, model revision, static pose. |
| Integration | Binding updates, cancellation, route re-entry, project reuse, and listener cleanup. |
| Browser E2E | Navigation, deep links, refresh, history, CV, story/inspect/static controls, delayed loading, and failures. |
| Visual regression | Approved story checkpoints, responsive framing, poster transitions, and relevant DOM context. |
| Public-artifact audit | No Studio/debug/editor code, private content, accidental source assets, or unnecessary initial 3D requests. |
| Upgrade regression | Old exports with candidate runtime, new exports with candidate runtime, and a known-good baseline. |

### 20.2 A motion contract must check actual motion

A test that calls `getProject()` or creates a sheet and then checks that it exists can pass even when the intended exported animation is missing. Validate the export and verify evaluated reference values at selected checkpoints.

Use a version-specific inspection helper when internal state inspection is unavoidable; contain it in test/validation code. Do not spread assumptions about Theatre's undocumented JSON layout through the application.

Test camera position/target/FOV, assembly values, and selected part transforms within intentional numeric tolerances. Then review images. Numeric correctness alone does not establish good framing, and a screenshot alone may miss broken behavior between checkpoints.

### 20.3 Deterministic capture without production debug exposure

For instrumented fixtures, fix the state and asset revision, viewport, DPR, browser/OS, scroll progress, and nondeterministic inputs. Wait for fonts, textures, model readiness, motion evaluation, and an actual rendered frame before capture. Do not rely on a hard-coded sleep.

Playwright explains that screenshots vary with platform and rendering conditions. Its ordinary CSS-animation handling does not make an independently animated WebGL scene deterministic; the scene needs an explicit controlled checkpoint. [S22]

Keep numerical/debug controls in non-public fixtures or test-only builds. Run public E2E against the exact deployable artifact through ordinary UI controls and observable output. This separates detailed instrumentation from the requirement not to ship privileged test hooks.

### 20.4 Browsers, devices, and failure scenarios

Start with layouts near 390×844, 768×1024, and 1440×900. Exercise the key paths in Chromium, Firefox, and WebKit. Validate real iOS Safari and an Android device separately for touch and GPU behavior; browser/device emulation does not substitute for real hardware. [S24]

Include keyboard navigation, no-JavaScript reading, reduced motion, blocked/404 assets, context-loss handling, rapid scrolling, repeated navigation, resizing, and entry via an anchor or nested route.

If headless CI cannot provide usable WebGL, a poster-only pass must not be reported as a 3D pass. Record that limitation and require a successful 3D run in a suitable environment before release.

### 20.5 Completion checklist

- [ ] Published pages contain approved, accurate content and usable navigation/CV/contact access.
- [ ] The core website remains readable without JavaScript-driven animation or 3D.
- [ ] Dependencies and toolchain are locked and compatibility evidence is recorded.
- [ ] Studio editing, export, and clean Core-only replay have been demonstrated.
- [ ] Camera/property and playhead ownership are explicit and tested.
- [ ] Pending playback/loading is cancelled safely on mode changes and navigation.
- [ ] Motion state, schemas, manifests, and model revisions form a coherent release.
- [ ] Static poses/posters handle unsupported, failed, or reduced-motion scenarios.
- [ ] Production excludes Studio, authoring tools, privileged test surfaces, and private assets.
- [ ] Root/subpath exports, nested refresh, model/decoder paths, and downloads pass.
- [ ] Performance and real-device results are recorded honestly, including untested items.
- [ ] The actual public artifact passed browser checks and has a rollback record.
- [ ] Content editing, model replacement, motion export, dependency upgrade, and deployment are documented.

---

## 21. Current integration checkpoint and next discussion

The original first-implementation brief is superseded by the current owner request and the implemented scaffold. The next work is not automatically P0, a material import or a portfolio build.

### 21.1 Documentation integration checkpoint

- The materials preparation root is designated in Section 00 and mapped in Section 12.
- The GitHub folder remains authoritative for software, versions and public schemas.
- Project/CV/content preparation follows the external records, preserving their evidence and review states.
- English is the primary project language; owner discussions remain in Traditional Chinese.
- The actual layout, generated-route strategy and existing test record are distinguished from future scene requirements.
- Public content, profile data, scene registry, application code and private materials remain unchanged by this documentation pass.
- No import, conversion, preparation-script execution, draft translation, content selection or deployment is activated.

### 21.2 Subsequent step-by-step discussion

The owner chooses the next scope. Useful topics include the first project/research family, its public story and personal contribution, CV sections and contact channels, English copy and any Chinese version, and whether the selected explanation benefits from 3D.

For that scope, read its current preparation records and specific open questions. Reuse existing evidence and permissions within their actual scope; do not ask the owner to re-confirm everything indiscriminately. Resolve the differences needed for that step, then adapt the selected material to the software contract.

P0 authoring/animation and later release criteria remain in Sections 19–20 for the point when that implementation is requested.

---

## 22. Sources, evidence boundaries, and unresolved verification

### 22.1 Source register

Checked on **6 October 2026**. These sources support specific capabilities, constraints, and historical observations. The proposed module layout, budgets, ownership rules, escalation policy, and implementation sequence are architectural recommendations, not requirements imposed by the sources.

| Reference | Primary source | Used for |
|---|---|---|
| [S01] | R3F — Installation | React/R3F major-version pairing and framework integration choices. |
| [S02] | Theatre — public `packages/r3f/package.json` | Observed Fiber peer range in the public source branch, not npm release verification. |
| [S03] | Theatre — With THREE.js | Direct values binding and authoring-to-runtime workflow. |
| [S04] | Theatre — With React Three Fiber | Official extension, editable viewport/camera, and development integration. |
| [S05] | Theatre — Projects | Stable project identity, project reuse, state, and readiness. |
| [S06] | Theatre — Core API | Listener-cleanup caveat; an indexed excerpt was available, but full-page retrieval timed out during this revision. |
| [S07] | Theatre — Sheets | Object grouping and sheet/sequence concepts. |
| [S08] | Theatre — repository README | Product scope, public 1.0 statement, and Core/Studio license distinction. |
| [S09] | Theatre — issue #489 | Historical outdated-documentation report, opened 28 April 2024. |
| [S10] | Theatre — issue #446 | Historical mixed-version/editor runtime report, opened 6 September 2023. |
| [S11] | pnpm — Install | Lockfile and frozen-install behavior. |
| [S12] | Theatre — Advanced uses | Custom RAF drivers, subscriptions, and playback timing. |
| [S13] | R3F — Scaling performance | Demand rendering, invalidation, resource reuse, and caching. |
| [S14] | R3F — Performance pitfalls | Fast updates, delta-based animation, and React state boundaries. |
| [S15] | GSAP — React | Scoped cleanup and delayed/event callback handling. |
| [S16] | GSAP — ScrollTrigger | Progress, measurement refresh, and scroll lifecycle APIs. |
| [S17] | R3F — Canvas | Renderer setup, fallback, and error-handling guidance. |
| [S18] | Three.js — WebGPURenderer | WebGPU renderer and WebGL 2 backend fallback. |
| [S19] | Next.js — Static exports | Build output and request-time feature limitations. |
| [S20] | Next.js — Lazy loading | Client boundary and `ssr: false` placement. |
| [S21] | Next.js — basePath | Build-time path configuration and asset considerations. |
| [S22] | Playwright — Visual comparisons | Screenshot environment dependence and baseline management. |
| [S23] | Next.js — Support policy | Maintained framework release selection. |
| [S24] | Playwright — Emulation | Browser/device emulation capabilities. |
| [S25] | GitHub — What is GitHub Pages? | Static hosting and user/project-site structure. |
| [S26] | GitHub — Pages limits | Plan/visibility considerations and hosting limits. |
| [S27] | GitHub — Git LFS | Pointer-file behavior and Pages limitation. |
| [S28] | glTF Transform — CLI | Asset inspection and selective optimization. |
| [S29] | GSAP — Standard License | License distinction and visual-builder restrictions. |
| [S30] | OpenAI — Skills documentation entry | Reusable agent guidance; entry redirects to official learning documentation. |
| [S31] | OpenAI — MCP documentation entry | Tool/context integration; entry redirects to official learning documentation. |
| [S32] | OpenAI — Codex | Development assistant role. |
| [S33] | pnpm — Settings | Version-sensitive package-manager configuration. |
| [S34] | MDN — `prefers-reduced-motion` | Browser support for the system motion preference signal. |
| [S35] | R3F — v9 migration guide | React 19 integration, lifecycle changes, and WebGPU considerations. |
| [S36] | Theatre — Studio API | Transactions, sequenced-property capture, and programmatic state export. |
| [S37] | Three.js — PerspectiveCamera | Projection properties and matrix updates. |
| [S38] | Theatre — Prop types | Typed authoring properties and numeric controls. |

[S01]: https://r3f.docs.pmnd.rs/getting-started/installation "R3F — Installation"
[S02]: https://raw.githubusercontent.com/theatre-js/theatre/main/packages/r3f/package.json "Theatre R3F package metadata — public source branch"
[S03]: https://www.theatrejs.com/docs/latest/getting-started/with-three-js "Theatre — With THREE.js"
[S04]: https://www.theatrejs.com/docs/latest/getting-started/with-react-three-fiber "Theatre — With React Three Fiber"
[S05]: https://www.theatrejs.com/docs/latest/manual/projects "Theatre — Projects"
[S06]: https://www.theatrejs.com/docs/latest/api/core "Theatre — Core API"
[S07]: https://www.theatrejs.com/docs/latest/manual/sheets "Theatre — Sheets"
[S08]: https://github.com/theatre-js/theatre "Theatre repository"
[S09]: https://github.com/theatre-js/theatre/issues/489 "Theatre issue 489 — outdated documentation dependencies"
[S10]: https://github.com/theatre-js/theatre/issues/446 "Theatre issue 446 — editor runtime error"
[S11]: https://pnpm.io/cli/install "pnpm install"
[S12]: https://www.theatrejs.com/docs/latest/manual/advanced "Theatre — Advanced uses"
[S13]: https://r3f.docs.pmnd.rs/advanced/scaling-performance "R3F — Scaling performance"
[S14]: https://r3f.docs.pmnd.rs/advanced/pitfalls "R3F — Performance pitfalls"
[S15]: https://gsap.com/resources/React/ "GSAP — React"
[S16]: https://gsap.com/docs/v3/Plugins/ScrollTrigger/ "GSAP — ScrollTrigger"
[S17]: https://r3f.docs.pmnd.rs/api/canvas "R3F — Canvas"
[S18]: https://threejs.org/docs/pages/WebGPURenderer.html "Three.js — WebGPURenderer"
[S19]: https://nextjs.org/docs/app/guides/static-exports "Next.js — Static exports"
[S20]: https://nextjs.org/docs/app/guides/lazy-loading "Next.js — Lazy loading"
[S21]: https://nextjs.org/docs/app/api-reference/config/next-config-js/basePath "Next.js — basePath"
[S22]: https://playwright.dev/docs/test-snapshots "Playwright — Visual comparisons"
[S23]: https://nextjs.org/support-policy "Next.js — Support policy"
[S24]: https://playwright.dev/docs/emulation "Playwright — Emulation"
[S25]: https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages "GitHub — What is GitHub Pages?"
[S26]: https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits "GitHub — Pages limits"
[S27]: https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-git-large-file-storage "GitHub — Git Large File Storage"
[S28]: https://gltf-transform.dev/cli "glTF Transform — CLI"
[S29]: https://gsap.com/community/standard-license/ "GSAP — Standard License"
[S30]: https://developers.openai.com/codex/skills/ "OpenAI — Skills documentation entry"
[S31]: https://developers.openai.com/codex/mcp/ "OpenAI — MCP documentation entry"
[S32]: https://openai.com/codex/ "OpenAI — Codex"
[S33]: https://pnpm.io/settings "pnpm — Settings"
[S34]: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion "MDN — prefers-reduced-motion"
[S35]: https://r3f.docs.pmnd.rs/tutorials/v9-migration-guide "R3F — v9 migration guide"
[S36]: https://www.theatrejs.com/docs/latest/api/studio "Theatre — Studio API"
[S37]: https://threejs.org/docs/pages/PerspectiveCamera.html "Three.js — PerspectiveCamera"
[S38]: https://www.theatrejs.com/docs/latest/manual/prop-types "Theatre — Prop types"

### 22.2 Evidence status after integration

Revision 2.0 preceded the application. The repository subsequently installed pinned dependencies, implemented the empty framework, and recorded local tests/builds in `docs/compatibility.md`. Those results apply to the scaffold and their stated environment; full scene/Studio validation remains unperformed.

Revision 2.1 is documentation-only reconciliation. It inspected preparation metadata, record structure and selected evidence/review notes against the actual repository. It did not repeat preparation QA, review the original-source corpus, query package releases, execute preparation scripts, import content, translate drafts or run a new scene/device benchmark.

Prior preparation outputs and validation reports do not establish website assets or clean production motion replay. Material selection, English copy, exact public-use scope, potential schema extensions, authored scenes, real-device results, remote CI and deployment remain future work.

Historical reports are not current runtime tests. A documented handoff is not an implemented importer. Future validation must record the scope actually performed.

**The software foundation and materials source are connected in the architecture. Their operational handoff remains inactive until the owner chooses the next step.**
