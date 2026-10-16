# 0014 — Prepared page entry, persistent project cards and native scroll presentation

Date: 16 October 2026 (Europe/Berlin).

The owner requests a destination-ready loading transition, preparation of the
live project card when its page opens, an expandable project grid without drawn
cell dividers, and the same scrolling response as Bending on Home. Subsequent
steering selects the XR main visual for its opening, retains the later 3D and
adds project-local stage background/entry/exit; the separate Contribution and
Limits sections are removed while source facts and credits remain. Implementation,
tests, commit, push and deployment through the existing CI gate are authorized
through completion.

This supersedes decision 0011's visibility-only model acquisition and fixed
nine-cell index, and decision 0013's opening-model and ten-chapter presentation.
It preserves the two approved projects, approved source bytes, Bending's protected
`6288286` case, the empty reusable framework, native navigation and same-artifact
publication. Earlier dated records remain historical evidence.

## Adopted ownership

- `SiteNavigation` composes document/font/critical-image readiness with
  SSR-declared page preview participants. A model participant reports success only
  after verified GLB/metadata/HDR/PMREM preparation and a successful real draw.
  Fetch completion or positive intersection alone cannot release the loader.
- The existing generic 15-second preparation endpoint, native `Animation.ready`
  acceptance and both 720 ms effects' real `finished` promises remain. The
  1600 ms reveal-completion bound starts at accepted readiness. Failures close as
  explicit failures; they never fabricate `entered` or animation completion.
- A static fallback is explicit and uses the existing decoded critical poster.
  A global preparation failure synchronously closes pending card resources before
  uncovering the document. Startup hidden/page-away, load/GPU failure or deadline
  fallback is latched for that arrival so a late result cannot introduce a
  visible 2D-to-3D replacement. Explicit Reduced Motion/Save Data policy changes
  retain their separate lifecycle.
- The model card starts while page loading still covers Home or Projects,
  including when the card is offscreen. Offscreen movement retains its resource;
  drawing remains demand-only. Hidden/BFCache documents suspend prepared work,
  normal departure disposes it, and policy/failure transitions close owned
  transport and GPU resources. The introduction and shared background contain no
  project model; this does not mean the whole Home document has no model canvas.
- At desktop three-column layout, `max(3, ceil(projectCount / 3))` rows provide
  at least nine conceptual cells and then 12, 15 and onward. Only approved
  projects become actual list items. Grid separators are not painted; existing
  card alignment, rounded glass, hover/focus identification and responsive layout
  are retained.
- Home reuses `InformationWindowPresenter` through `HomeScrollPresenter` on the
  existing ordinary-page `SiteBackgroundDriver` scheduler. Native document
  scrolling remains authoritative. No second RAF clock, scroll hijack, React
  frame state or Bending Director changes are introduced.
- XR's opening visibly shows its pinned main visual. Its existing 3D may prepare
  behind that opening, with the stage canvas hidden and controls unavailable.
  Later source model and phone chapters retain their real 3D. Project-local
  exhibition background and finite stage entry/exit share `XRStageDirector`'s
  scheduler, including real-paint acceptance at model/phone handoffs. Native video
  remains the recording clock; scroll never seeks the clips.
- XR renders eight chapter markers: overview, context, method, Adapt, Assemble,
  Join, physical making and credits. The removed Contribution/Limits sections
  and their navigation targets are absent. The approved study JSON, attribution,
  source note, original recordings and source limits remain preserved; credits
  retain the relevant absence-of-benchmark and hardware-reexecution statements.

## Acceptance and publication

The [integration contract](../../roles/uiux-designer/cases/bending-active-thesis/PREPARED_PAGE_HOME_INTEGRATION.md)
maps resources and event closure. Its [verification record](../../roles/uiux-designer/cases/bending-active-thesis/PREPARED_PAGE_HOME_VERIFICATION.md)
separates source-level checks from pending built-artifact, visual, CI and live
evidence. Use Node 24.19.0, pnpm 11.19.0 and the committed lockfile; run `pnpm check`
and relevant Playwright projects against the actual exported artifact. Verify
protected Bending presentation and approved source pins. Only successful
same-commit CI may authorize deployment of that exact tested artifact, with no
deployment rebuild. Authorization is not a claim that acceptance has completed.
