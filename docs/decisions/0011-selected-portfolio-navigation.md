# 0011 — Selected portfolio navigation and XR case

Date: 16 October 2026 (Europe/Berlin).

## Owner request and scope

The owner explicitly requested a model-free home background, About / Project / Contact, a home-to-project-index scroll, a nine-cell project grid, the existing loading presentation at site entry and internal page changes, and a new case for **An Extended-Reality App Using Motion Capture for Bending-Active Structure**. The subsequent card revision requires square, full-bleed cells, restrained rounded glass foundations, the actual Bending background model, an excerpt from the specifically supplied XR `Background.mp4`, and hover-revealed titles. The owner confirmed live 3D loaded only while its card is visible, and renewed authorization through implementation, commit, push and completed Pages deployment.

This supersedes the home-to-thesis transition in decision 0010. It extends the already published application inside `roles/uiux-designer/cases/bending-active-thesis`; it does not populate the reusable `src` framework, its public snapshot, scene registry or generated entry directory. Normal builds remain independent of the private preparation drive.

## Routes and content

- `/`: personal introduction, then `#projects`, then Contact. The fixed background and introduction use an original static ASCII field and CSS light field, without a project model or Canvas. Optional project previews exist only inside their below-fold cards.
- `/about/`, `/projects/`, `/contact/`: direct static pages, with native navigation and canonical metadata.
- `/projects/bending-active/`: the existing seven-chapter cinematic study, with its original source assets and interaction ownership.
- `/projects/xr-bending-active/`: an evidence-backed collaborative XR research case, four individually reviewed source images, contribution boundaries, limitations and credits.

The desktop project index has a three-column, three-row grid of square cells. Only the two selected real projects are cards; the other cells remain unfilled grid space. Narrow layouts use two or one column while retaining square cards. Full-bleed previews sit inside rounded, regular-glass foundations, using the existing fallback and preference tokens rather than adding optical lens owners. Native card links keep permanent accessible names. Titles appear over a local scrim on mouse hover or keyboard focus; no-hover devices show a compact title so one tap still navigates. No unreviewed project, fake asset or fabricated project is published to fill the grid.

The XR preparation records govern facts and authorship. The explicitly selected public derivatives and authored summary are pinned before the public build. Raw CVs, full source documents, source code, source CAD and unrelated preparation data are excluded. On 16 October the owner directly supplied the public email `chiahsuanchao@icloud.com` and exact LinkedIn, Instagram and GitHub profile URLs. The authored `release/contact.json` pins those four destinations; no other private contact information is inferred.

## Runtime and loading

Native full-document links provide direct reload, history and JavaScript-disabled access. One root-layout `SiteExperience` owns discrete site readiness and navigation facts. Current-document DOM, fonts and marked critical images are required before generic entry. The CI compatibility correction directly owns native opacity/lift effects and waits for both actual `finished` promises. Its native preparation remains `requested` until both original `Animation.ready` promises accept their play tasks within the remaining original 15-second arrival budget. The effects may already run during preparation; this is not a paint acknowledgment. Only then does `ready` start the 1.6-second completion budget. This explicitly reallocates pending presentation/play from the earlier reveal budget to preparation, with a maximum 16.6-second success-eligibility budget from controller arrival. Engines without the native API retain the mutually exclusive CSS-event fallback. A bounded resource or reveal failure records a failure terminal and releases readable content.

The Bending page delegates to its existing EntryManager and Director: the same document-readiness service feeds the original scene gate and discrete entry facts are bridged to the site lifecycle. The Director remains the sole case reveal/frame clock. This delegated path starts no site RAF or generic reveal. Generic native preparation uses one finite presentation callback within its remaining startup budget; it adds no JavaScript animation clock, competing camera writer or per-frame React state.

The separately authorized optional card previews share a scoped, event-driven acquisition/eligibility controller. Static critical posters participate in page readiness; optional preview enhancement has its own bounded request and never prevents reading or native navigation. The one visible model card dynamically loads the same approved source geometry, material and lighting recipe, paints only on acquisition/resize, and releases its renderer, context and assets when ineligible. It does not mount the case RuntimeRoot or create an animation clock. The XR excerpt uses native silent inline video, an explicit Pause/Play control outside the link, and the same-frame poster. Offscreen, hidden, page-exit, reduced-motion and data-saving conditions stop optional work. Source media remains private; only pinned, reviewed derivatives enter the public artifact.

Every site request has one `entered`, `cancelled` or `failed` terminal. Outgoing navigation hands its ID to the destination document when session storage is available; prevented, superseded, abandoned and restored-history paths are explicit. Same-document anchor scrolling, external links and modified clicks retain native behavior without a page-loading request. [The runtime integration](../../roles/uiux-designer/cases/bending-active-thesis/PORTFOLIO_RUNTIME_INTEGRATION.md) records the concrete event table and limits.

## Team and verification

All twelve existing role responsibilities were assigned across three specialist groups and cross-reviewed: [four visual roles](../../roles/uiux-designer/cases/bending-active-thesis/PORTFOLIO_UI_REVIEW.md), [three evidence/geometry roles](../../roles/uiux-designer/cases/bending-active-thesis/XR_PROJECT_INTEGRATION.md), and [five runtime/direction roles](../../roles/uiux-designer/cases/bending-active-thesis/PORTFOLIO_RUNTIME_INTEGRATION.md). These are role-based agent reviews, not claims of twelve independent human reviewers.

Validation must cover the built multi-page artifact, not source imports alone: model-free home requests, the exact nine-grid geometry, all six direct routes, NoJS and Reduced Motion, real blocked and failed assets, loading request closure, navigation/history, XR evidence, and the retained Bending interaction suites. Publishing still consumes the successful same-commit CI artifact without rebuilding. Results and visual receipts are recorded separately when performed.
