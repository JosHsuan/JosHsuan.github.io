# 0011 — Selected portfolio navigation and XR case

Date: 16 October 2026 (Europe/Berlin).

## Owner request and scope

The owner explicitly requested a model-free home background, About / Project / Contact, a home-to-project-index scroll, a nine-cell project grid, the existing loading presentation at site entry and internal page changes, and a new case for **An Extended-Reality App Using Motion Capture for Bending-Active Structure**. Commit, push and publication through the existing successful same-commit CI gate are authorized through completion.

This supersedes the home-to-thesis transition in decision 0010. It extends the already published application inside `roles/uiux-designer/cases/bending-active-thesis`; it does not populate the reusable `src` framework, its public snapshot, scene registry or generated entry directory. Normal builds remain independent of the private preparation drive.

## Routes and content

- `/`: personal introduction, then `#projects`, then Contact. The background uses an original static ASCII field and CSS light field, without a model, poster, Canvas or model requests.
- `/about/`, `/projects/`, `/contact/`: direct static pages, with native navigation and canonical metadata.
- `/projects/bending-active/`: the existing seven-chapter cinematic study, with its original source assets and interaction ownership.
- `/projects/xr-bending-active/`: an evidence-backed collaborative XR research case, four individually reviewed source images, contribution boundaries, limitations and credits.

The desktop project index has a three-column, three-row grid. Only the two selected real projects are cards; the other cells remain unfilled grid space. Narrow layouts use two or one column. No unreviewed project, fake asset or fabricated project is published to fill the grid.

The XR preparation records govern facts and authorship. The explicitly selected public derivatives and authored summary are pinned before the public build. Raw CVs, full source documents, source code, source CAD and unrelated preparation data are excluded. On 16 October the owner directly supplied the public email `chiahsuanchao@icloud.com` and exact LinkedIn, Instagram and GitHub profile URLs. The authored `release/contact.json` pins those four destinations; no other private contact information is inferred.

## Runtime and loading

Native full-document links provide direct reload, history and JavaScript-disabled access. One root-layout `SiteExperience` owns discrete site readiness and navigation facts. Current-document DOM, fonts and marked critical images resolve the generic readiness gate; its existing visual language finishes through CSS animation events. A bounded resource or reveal failure records a failure terminal and releases readable content.

The Bending page delegates to its existing EntryManager and Director: the same document-readiness service feeds the original scene gate and discrete entry facts are bridged to the site lifecycle. The Director remains the sole case reveal/frame clock. No site RAF, extra scene, competing camera writer or per-frame React state is added.

Every site request has one `entered`, `cancelled` or `failed` terminal. Outgoing navigation hands its ID to the destination document when session storage is available; prevented, superseded, abandoned and restored-history paths are explicit. Same-document anchor scrolling, external links and modified clicks retain native behavior without a page-loading request. [The runtime integration](../../roles/uiux-designer/cases/bending-active-thesis/PORTFOLIO_RUNTIME_INTEGRATION.md) records the concrete event table and limits.

## Team and verification

All twelve existing role responsibilities were assigned across three specialist groups and cross-reviewed: [four visual roles](../../roles/uiux-designer/cases/bending-active-thesis/PORTFOLIO_UI_REVIEW.md), [three evidence/geometry roles](../../roles/uiux-designer/cases/bending-active-thesis/XR_PROJECT_INTEGRATION.md), and [five runtime/direction roles](../../roles/uiux-designer/cases/bending-active-thesis/PORTFOLIO_RUNTIME_INTEGRATION.md). These are role-based agent reviews, not claims of twelve independent human reviewers.

Validation must cover the built multi-page artifact, not source imports alone: model-free home requests, the exact nine-grid geometry, all six direct routes, NoJS and Reduced Motion, real blocked and failed assets, loading request closure, navigation/history, XR evidence, and the retained Bending interaction suites. Publishing still consumes the successful same-commit CI artifact without rebuilding. Results and visual receipts are recorded separately when performed.
