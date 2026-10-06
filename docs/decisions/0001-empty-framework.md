# 0001 — Empty framework before content

Date: 2026-10-06 (Europe/Berlin)

The initial user request was to establish infrastructure from the supplied architecture document and discuss content later. This overrode the document's embedded P0 implementation brief where it called for a populated demonstration, asset, and authored animation. The supplied file was initially copied verbatim to `docs/architecture.md`; it is now maintained as the project architecture and has been reconciled in revision 2.1 with the implemented framework and the designated external materials source.

The repository previously contained only planning documents and no application. There is no working Vite application to migrate. Use Next.js static export, React 19/Fiber 9, CSS Modules, and direct Theatre Core bindings. Preserve earlier planning documents; their single-page/Vite direction and the new multi-route architecture are historical alternatives. The new requested reference drives the scaffold. Content and final visual direction remain open.

This milestone includes usable empty routes, empty validated content, bounded on-demand viewer infrastructure, cancellable motion operations, local-only Studio initialization, tests, and deployment configuration. No project, contact detail, fictional case study, placeholder model, motion state, or authoring success is invented.

Concrete project/research routes are generated from published entries before Next builds. This supports an empty initial site without sentinel slugs or reliance on framework behavior for empty `generateStaticParams()`. The reusable detail renderer lives outside the router. The generated route directory is exclusive to the exporter and rejects unrecognized files before removal.

The Theatre adapter currently standardizes one `Pose` object (camera position/target/FOV and assembly progress). A real scene must bind it, release camera ownership before mounting inspection controls, and export/validate its actual timeline. This is a foundation milestone, not completion of the document's P0 authoring proof.

## Documentation integration follow-up — 2026-10-06

The owner designated `D:\JosHsuan_Website\_private\portfolio-preparation` as the root for all materials preparation. The existing GitHub implementation remains the software authority; that folder's current evidence, project packs and CV preparation govern content work. English is the primary project language, with owner discussions in Traditional Chinese. The current follow-up changes Markdown only and leaves materials use, translation, UI changes and content import for subsequent step-by-step discussion. Architecture Sections 00 and 12 are the maintained record of this integration.
