# Personal introduction within the Bending-Active case

Date: 15 October 2026 (Europe/Berlin).

The owner directly requested a friendly personal home introduction based on the existing Bending-Active presentation and previously supplied preparation materials, followed by a transition into the project. The owner also authorized commit, push and deployment through the existing CI gate. [Decision 0010](../../../../docs/decisions/0010-case-home-introduction.md) records this narrow implementation authorization. Content provenance and local verification are recorded here; final CI/publication provenance is separate.

## Public scope and exact copy

The introduction belongs to this case's existing public page: `#home` leads to `#overview` on the same page. It does not populate the reusable empty portfolio framework, generate project entries or publish an additional project collection. The approved Bending-Active story and existing release assets remain the project content; `release/story.json` and asset bytes are unchanged by this documentation work.

The selected copy is an original English summary of supported work and the owner's requested tone. It is not a quotation from a private CV or an external website:

> Hi, I’m JosHsuan.

> I work between geometry, code and making.

> My work brings together computational design, digital fabrication and interactive systems. I’m interested in how digital methods connect with physical materials.

> A good place to start is Bending-Active.

> Explore Bending-Active

The final line is the conventional project link to `#overview`. The owner's reference to [maxshelepov.com](https://maxshelepov.com/) informs the requested friendly tone; no reference copy, assets or layout is imported. A second example was not identified and is not invented here.

## Evidence and interpretation

The authoritative preparation root is `D:\JosHsuan_Website\_private\portfolio-preparation`. Paths below document provenance for maintainers; they are not browser content, runtime inputs or build dependencies. The new owner request permits the narrow homepage summary while preserving the source files' private status and their review limits.

| Public wording / fact | Evidence | Scope of the interpretation |
| --- | --- | --- |
| “JosHsuan” | `cv-draft.md`, line 3; `checkpoints/agent-s12/cv-facts.json`, fact `S12-CV01`. | The existing preferred signature is JosHsuan Chao / JosHsuan. The formal name appears as Chia-Hsuan Chao in the draft and CV evidence. This does not invent another professional identity. |
| “geometry, code and making” | `cv-draft.md`, project/contribution section and skills section; `projects/bending-active-metal-panel/evidence.md` and `attribution.json`. | An editorial summary of computational geometry, code-supported methods and physical prototypes, not a formal employment title or a claim of sole authorship of every tool or object. |
| “computational design, digital fabrication and interactive systems” | `cv-draft.md`, documented geometric/fabrication work, EchoXR/T3 contributions and supported technologies; `projects/echo-xr/attribution.json`; `projects/t3-mocap-bending-active/attribution.json`. | Describes supported areas of work. It does not publish those projects, their media or team-owned material, or assert that their SDKs/frameworks were created by the owner. |
| “interested in how digital methods connect with physical materials” | The same contribution evidence, especially the Bending-Active target-geometry / opening-pattern / physical-prototype workflow. | Original introductory framing selected for this homepage, not a measured impact claim. |
| Bending-Active as the featured starting point | Current repository `release/story.json`; preparation `projects/bending-active-metal-panel/evidence.md`, `attribution.json` and `content-draft.md`. | The already published project is an individual thesis at National Cheng Kung University. Assembly and image attribution retain their existing limits; individual research does not mean sole manufacturing, photography or underlying-software authorship. |

Preparation `README.md`, `report.md`, `project-map.json`, `website-candidates.json` and `review-needed.md` establish the source hierarchy and private-review boundary. The owner-designated main attribution reference is `C:\Users\JosHsuan\Desktop\JosHsuan_CV_2022\PDF\JosHsuan_CV&Portfolio_2025.VerFacade.pdf`; Bending-Active's role evidence cites physical pages 38–45. This task reads the maintained evidence records rather than importing that PDF.

The supplementary `cache/short-intro-native-text.json` records the name on slide 1 of `D:\JosHsuan_D\GKR&Design++\JosHsuan_Short_Intro.pptx`. It is a native-text cache, not a claim that this task visually reviewed every slide or cleared the presentation for publication.

## Unknown facts and material boundaries

The introduction does not add a current location, current employer, employment dates, degree-award claim, availability/commission status, seniority, awards, publication authorship or performance percentages. The 2025 CV's GKR “2024–Now” is historical text, not confirmation of employment in 2026. The thesis chapter's 2020 date and the portfolio index's 2021 date remain unresolved, so this introduction does not add a project year.

No public email, LinkedIn URL or preferred contact channel has been confirmed in the reviewed publication inputs. Do not manufacture a contact link, extract private contact details from CV imagery or add a dead contact control. Formal degree/title/date, publication, media-rights and contact questions remain in preparation `review-needed.md`, especially its CV review table.

The preparation workspace's `public-export` contains only `.gitkeep`; its private candidate records are not a public manifest. Caschlatsch / Timber remains explicitly restricted, Voxel-related NDA scope remains unresolved, and other company/research media have separate attribution and permission questions. They support only the appropriately scoped general bio here. No raw CV, portrait, private file, source CAD, unpublished project or asset byte is imported, uploaded or added to the release. Existing approved Bending-Active derivatives remain the visual source.

## Architecture and publication

The personal introduction and project entry retain the current case-owned native reading and runtime ownership. The project remains reachable without successful 3D initialization. Keyboard access, Reduced Motion, narrow screens and forward/reverse navigation must be checked on the built artifact; this document does not prescribe a competing animation clock or per-frame React state.

Normal builds must remain independent of the private drive. Public copy is a deliberately authored, repository-local summary, not a filesystem import or runtime read of preparation records. Existing source-asset allowlists and audits remain in force; the reusable framework and generated entry directory are not filled by this change.

The current owner instruction authorizes commit/push and publication of the completed homepage/transition through the existing successful same-SHA default-branch CI gate. Deployment must consume the tested artifact without rebuilding; local checks alone do not establish publication.

## Implementation and local verification — 15 October 2026

`release/introduction.json` now holds the deliberately authored public copy; its SHA-256 is pinned by `release/manifest.json` and verified before the isolated public build. The private preparation drive is not a build dependency. The page has one personal H1, a native project link and a return link, with the original Bending-Active title at H2 and all seven chapter anchors preserved. The three existing optical controls and approved source asset bytes remain.

The existing Director publishes Home/Project context from measured native document position. Home remains readable and scrollable while the same project readiness gate runs; the gate limits inert and scroll locking to project reading. Explicit anchor focus preserves its exact scroll position, and unfinished project focus is cancelled when a visitor leaves. Home does not add a Canvas, RAF, clock or per-frame React state.

Local acceptance on the built export:

- `pnpm check` passed, including the empty 63-file framework audit, nine framework tests and fourteen CI selector/gate tests.
- The CI-equivalent case/tool portable command passed **312 tests**, with **two existing conditional skips** (314 total).
- All **39 browser checks** passed across Chromium, WebKit and Pixel 7 emulation: homepage, public release baseline, entry readiness and reading material. The Full baseline enters through the actual homepage link. Checks include native wheel scrolling during delayed model initialization, keyboard focus, Back/Forward, direct chapter reloads, NoJS, Reduced Motion, original source paper and the unchanged contrast requirements.
- The public audit passed for **80 output files and 36 approved assets**. Local candidate HTML SHA-256: `3129477fc1aa010d3e39af5c8099f668940330bac0d6d0173941d1ae098fced7`; complete output digest: `9887b0098bd3d08c7d8a8101574460db1d5ee7a60a17158551ca462a9d49673c`. This is a worktree candidate based on `d34e38a`, not the final CI release identity.
- Five captured views cover desktop Home, mid-scroll transition and project, plus mobile Home and project. [The local receipt](animation-review/.local/home-review-local/results.json) records zero page errors, no horizontal overflow and one 3D Canvas in every view. Visual inspection found no new blocking layout issue; the existing source framing and ASCII remain visible behind the introduction.

An earlier local cached build retained the old global entry scroll rule despite the updated source. Its cache was set aside; a clean build was checked for the actual project-scoped CSS rule before the passing browser run. This records a local cache observation, not a verified root cause or a claim about every CI cache. The pending-model browser scenario validates actual built behavior and remains in full CI.

Local logs: `.local-home-check.log`, `.local-home-portable.log` and `.local-home-final-browser.log` at the repository root (ignored evidence). Full CI/publication provenance remains separate from these local checks. Physical iOS/Android devices and sustained field performance are not established by desktop browser emulation.

## CI follow-up: departure closure and recovery navigation

The `fd2048f` candidate was not published. [CI 38794841423](https://github.com/JosHsuan/JosHsuan.github.io/actions/runs/38794841423) exposed a real library departure defect: the new Home context had been passed as lifecycle `hidden`, suspending the presenter before it could cancel an offscreen reveal. Home now uses normal viewport sampling. Returning there restores the original drawing and emits one `cancelled/offscreen` terminal; actual document hiding and unfinished entry retain their suspension behavior. A production-presenter regression covers suspension, Home cancellation, repeated Home, fresh re-entry and completed departure.

The mobile recovery trace also exposed a test-navigation error. Visiting the same `/#overview` fragment a second time made no new document request, so it did not reinitialize recovery. That check now uses an explicit `page.reload()` and retains all fallback, Enable 3D, context-loss and gesture-release assertions. No recovery policy or acceptance threshold was relaxed.

The follow-up passes `pnpm check`, the public 80-file / 36-asset audit and all **313 portable case/tool tests**, with two existing conditional skips (315 total). All **18 focused built-artifact browser checks** pass across Chromium, WebKit and mobile Chromium: fifteen homepage/library scenarios and three failed-load/reload/context-loss scenarios. Logs are `.local-home-followup-{check,build,portable,browser,recovery}.log`. The previous visual and 39-check milestone above identify their earlier candidate; the follow-up changes departure delivery and explicit test reload, preserving that visual composition. Publication still requires a new successful same-commit push artifact.
