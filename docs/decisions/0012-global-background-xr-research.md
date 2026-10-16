# 0012 — Shared Bending background and XR research extension

Date: 16 October 2026 (Europe/Berlin).

## Owner request and precedence

The owner explicitly requests implementation, testing, commit, push, CI-gated GitHub Pages deployment and live verification of a common background and an extended XR research case. The common background must reuse Bending-Active's real implementation, visual parameters, animation and input behavior. It is not permission to redesign that completed case. The latest verified portfolio is the XR narrative authority; real documentary media takes precedence over supplementary simulation/rendering where available.

This supersedes decision 0011's static common-background proposal and earlier XR presentation/card selection within the stated task. About / Project / Contact, native routes, the nine-cell project index and the completed Bending card remain. The reusable `src` framework, empty publication snapshot, generated entries, pinned dependencies and unrelated private-material boundaries remain unchanged. Earlier decisions retain their dated history.

## Protected Bending presentation

The published `62882861cc1ff83ae3abe93f0c84d82eb9060d25` is the pre-change comparison target. Preserve its page structure, narrative, text, diagrams, images and other media; project geometry, materials, lighting, camera and controls; motion, transitions, scroll behavior and final desktop/mobile presentation. Necessary extraction of background components, root mounting and resource ownership is allowed only while preserving that result.

Create a before-change baseline, then compare matching post-change and deployed states, including real model/source interactions and fallback/preference paths. If shared integration changes Bending, repair that integration rather than adapting the protected case to it. Portable/source equivalence is useful evidence but cannot replace matched browser and live acceptance. This decision records authorization and implementation boundaries, not a claim that those checks or publication have completed.

## Three layers and one active background binding

| Layer | Responsibility | Explicit exclusion |
|---|---|---|
| 1 — Global Background | Existing steel-blue/warm-copper CSS atmosphere, vignette and independent bounded Canvas 2D ASCII field | No global project model, camera, HDR, WebGL renderer or source-depth compositor |
| 2 — Page Content | Native semantic layout, narrative, documentary media, reading surfaces, navigation and project cards | No duplicate background implementation or alternate motion clock |
| 3 — Project-specific 3D / Interaction | Each project's source model, materials, lighting, camera, controls and explanatory interaction | No replacement of another project's model or reverse changes to Bending for XR |

One DOM-free root-layout `GlobalBackground` provider supplies the shared backdrop/field surfaces and an exclusive `BackgroundRuntime` resource lease. A simultaneous `site` and `bending-director` acquisition is rejected. The service owns the original field renderer and five backdrop properties, with no clock or input listeners. Bending keeps the original classes, backdrop/stage/field sibling order, CSS publication quantization and field inputs; its original Director remains the sole case frame/chapter clock. Its project stage, exhibition lighting, HDR, source-depth ASCII, compositor and poster remain case-owned.

Ordinary routes mount one `SiteBackgroundDriver`, using the existing overview playback/scene score and native input equations. This driver is absent on Bending. Its decorative listeners are scoped and passive where appropriate; they do not prevent native scrolling, perform model hit testing, capture project input or issue project commands. No per-frame React state or global WebGL context is added. The unchanged field bounds are 900,000 physical pixels, 12,000 cells and at most 30 real-time draw deliveries per second; these are configured limits, not measured sustained performance.

## Lifecycle, readiness and navigation

Background enhancement is optional and adds no readiness prerequisite. Existing SiteNavigation and delegated Bending EntryManager retain their request/terminal ownership; the ordinary background begins advancing after readable site entry. Reduced Motion and unavailable Canvas 2D retain static CSS atmosphere and readable content without an ongoing optional field loop.

Visibility, page and freeze suspension compose; hidden time is not replayed. Disposal cancels pending frames, removes scoped listeners/observation, releases field resources and relinquishes the lease. Repeated disposal is safe and stale bindings cannot publish.

Routes continue using native full-document links with direct reload, history and NoJS access. A new document receives a new background lifetime; this is not a persistent canvas across documents or a client-router migration. On ordinary pages a non-persisted `pagehide` disposes the lifetime, while a browser-retained BFCache document keeps it suspended and resumes without hidden-time catch-up. Retention is browser-dependent. Bending's original suspension and component teardown remain intact. Synthetic persisted-event/controller checks must not be described as proof of real browser BFCache retention.

## XR evidence and project resources

The XR page follows the latest verified portfolio's research argument through visual-first sections, with concise headings, guidance and captions. Prefer real operation, prototype and testing evidence where available. Preserve collaborators, contribution boundaries and limitations; do not present a simulation as a physical result.

The owner explicitly selects `D:\ETH_MAS_DFab\T3\Presentation\3D_Files\only_interior.3dm` for the XR model. Inspect and derive a reviewed browser asset without altering the original. Reuse suitable loading, framing and interaction methods in an independent XR module; do not modify Bending's model or scene to accommodate it. The [XR source record](../../roles/uiux-designer/cases/bending-active-thesis/XR_PROJECT_INTEGRATION.md) owns conversion provenance, geometry/material facts, pins and review limits. This architecture decision does not certify a conversion or authorize unrelated source files.

The selected interface animation belongs on the project-specific phone screen with correct aspect, masking, corners and alignment. An efficient native-video derivative may replace GIF decoding while preserving the original and core interface content; provide a readable static alternative for reduced or unavailable enhancement. The XR card uses the latest portfolio's first-page main visual, retaining recognizable composition and native navigation. This card change is confined to XR; the completed Bending card remains unchanged.

Only reviewed, pinned public derivatives and authored summaries enter the release. Raw CAD, portfolio documents, private source paths, drafts and unrelated materials do not enter the browser or become build dependencies. Builds remain possible without the private drive.

## Review and acceptance

The existing team roles contribute within their ownership: architecture/experience/motion/performance review background extraction and lifecycle; visual/content/geometry roles establish XR evidence and presentation; QA/DevOps verify the built artifact and publication. These are role-based agent reviews, not invented independent human approvals. Concrete decisions and actual execution evidence belong to the [background integration](../../roles/uiux-designer/cases/bending-active-thesis/GLOBAL_BACKGROUND_INTEGRATION.md), XR source record and integrator's verification records.

Use Node 24.19.0, pnpm 11.19.0 and the committed lockfile. Run `pnpm check`, relevant portable tests, the public production build/audit and the required Playwright projects against that built artifact. Cover all direct routes, dynamic background/input/lifecycle, Reduced Motion, unavailable WebGL/2D, readable fallback, media paths and XR interaction, plus the protected Bending comparisons. Record unperformed browser/device checks and actual failures honestly; do not infer physical Safari stability, sustained GPU performance or Apple-native optics from functional tests.

Commit, push and deployment are already owner-authorized through completion. Publication still requires the existing successful same-SHA CI gate and deployment of that exact tested artifact without rebuilding, followed by live paths/assets and matched Bending regression. A local build, push or workflow dispatch alone is not completion.
