# Prepared page entry, Home scrolling and XR presentation

Date: 16 October 2026 (Europe/Berlin).

Status: owner-authorized integration in progress. Source-level checks are
recorded separately in [the verification record](PREPARED_PAGE_HOME_VERIFICATION.md).
This contract does not claim completed built-artifact, visual, CI or live acceptance.

[Decision 0014](../../../../docs/decisions/0014-prepared-page-home.md) is the current
override for page preparation, card lifetime, grid growth, Home motion and the
XR opening/chapter presentation. The older visibility-only card policy, fixed
nine-cell description and ten-chapter XR audit describe preceding checkpoints.
The protected Bending case, shared Layer 1 lease, source pins, two approved
projects, native routes and empty reusable `src` framework remain.

## Page entry and card preparation

`SiteExperience` mounts once in the selected root layout. Native full-document
anchors retain outgoing/destination request correlation; a same-document anchor
scroll does not start another loading lifecycle. The destination controller owns
the decision to uncover its actual document.

| Owner | Work and terminal condition |
| --- | --- |
| `SiteReadiness` | DOM completion, settled successful requested fonts and actual critical-image load plus decode; no invented image or font requests. |
| `PagePreviewReadiness` | Synchronously discovers SSR `[data-site-preview-required]` hosts before awaiting resources; waits for each real renderer or explicit static report. It owns no timer or frame loop. |
| `ProjectModelPreview` / `project-model-scene` | Prepare the approved source GLB, metadata, source-preserving materials, HDR/PMREM and measured camera; append canvas only after successful rendering, valid shader/context and positive draw calls. `firstDraw` records that boundary. |
| `SiteNavigation` | Compose both readiness results, acquire finite native reveal effects, wait for both actual play-acceptance and completion promises, publish one site terminal and release owned effects. |
| Existing Bending EntryManager/Director | Retain Bending's delegated scene/static readiness and original clock; no second generic reveal or model-card prerequisite is added to that route. |

Normal generic arrival remains `requested → ready → revealing → entered`.
Document resources, required card preparation and native pending play consume
the original 15-second arrival budget; successful resource completion does not
restart it. The native effects retain their 720 ms opacity/lift recipe, and the
original 1600 ms completion bound begins at accepted `ready`. The API-absent CSS
path is mutually exclusive. No timer, simulated event, manual native-time write
or failed terminal substitutes for actual successful completion.

Required model preparation ignores intersection and `site-entered`: waiting for
either would recreate a late replacement or a readiness deadlock. Home and
Projects request the card renderer when their page opens. The model-free Home
introduction and shared atmosphere remain separate from that offscreen card.
`firstDraw` proves a renderer draw, not browser-compositor presentation or
physical-device performance; actual built screenshots remain required.

An explicit static report may satisfy card preparation only alongside the normal
critical-poster decode. Reduced Motion/Save Data skip the enhancement. Startup
hidden/page-away, acquisition failure and global preparation fallback latch the
arrival to its poster. The global failure path calls participant fallback
synchronously: latch static, abort/release partial resources, then report static
before the site failure removes its content guard. A participant that registers
after that bound receives the same latch and cannot publish late model success.
Unknown or broken participants remain diagnosable; they do not manufacture readiness.

## Model lifetime and closure

One exclusive model-card lease bounds acquisition. The source revision, three
layer/count checks, native transforms, original satin/base treatment, overview
direction, vertex-fit framing, ACES exposure 1, sRGB output, 262,144-pixel cap and
512-pixel shadow map remain. This task changes preparation/lifetime, not the
Bending card shot or the full Bending case.

| Event | Required behavior |
| --- | --- |
| Scroll card out/in | Retain the prepared canvas and handle; no poster reversion, repeated fetch or reacquisition. A static card adds no autonomous draw loop. |
| Measured size change | Cache valid dimensions; demand-draw the same resource when active. Hidden work does not render just because size changes. |
| Hidden / persisted BFCache departure | Suspend a prepared resource without replaying hidden time; resume that lifetime. Pending startup chooses its latched static policy. |
| Non-persisted departure / component disposal | Abort pending requests and release geometry, materials, HDR/PMREM, renderer/context, observers and registrations. |
| Reduced Motion / Save Data | Release enhancement and retain the truthful decoded poster; an explicit later policy change may initiate its own preparation epoch. |
| Shader, context or source failure | Release resources, preserve one acquisition terminal plus any separate later resource-failure fact, and keep the arrival static. Scroll/visibility alone cannot silently retry it. |

## Expandable grid and Home motion

`projectGridRows(projectCount)` validates a nonnegative integer and returns
`max(3, ceil(projectCount / 3))`. The three-column editorial space therefore
starts at nine conceptual cells, becomes twelve for 10–12 approved projects,
fifteen for 13–15, and continues by complete rows. It does not create placeholder
project records or release any other private candidate. Only the two currently
approved works render as cards. Responsive two-/one-column layouts remain.
Painted cell dividers are removed; transparent alignment edges retain the
accepted card coordinates, margins and individual rounded-glass borders.

`HomeScrollPresenter` delegates to the existing `InformationWindowPresenter`.
`SiteBackgroundDriver` owns native-scroll/layout invalidation and the existing
demand scheduler; the adapter adds no observer, timer, RAF or independent clock.
Natural document geometry is measured through offset parents so transformed
rectangles cannot feed back into layout. The same finite material response
applies to Home's introduction, invitation, project heading/cards/note and
contact windows. Native scroll carries them into and out of the viewport;
focus, reduced/save-data/forced-colour policy and suspension retain readable
static behavior. Optional Canvas 2D failure cannot starve the finite native
information response. Bending's Director and information-window source remain
unchanged.

The selected portfolio wrapper uses `overflow-x: clip` so Home's temporary
material translation/rotation cannot enlarge the document's horizontal scroll
area during movement. Native vertical scrolling and the existing presenter
response remain. This is scoped to the portfolio wrapper, not Bending's case
stylesheet. Acceptance measures the actual document width during the moving
interval as well as at rest; a settled-only check cannot establish this condition.

## XR opening, later stage and shorter article

The opening displays the approved `portfolio-main-visual.webp`, with a matching
no-JavaScript source visual. Its existing model stage may prepare and retain
resources behind that opening; CSS hides the canvas without changing measured
stage dimensions. Model inspection and scene controls are unavailable there.
This is a presentation rule, not a prohibition on preparation/downloads.

Context, method, recording and physical-study chapters retain their real 3D.
The added exhibition surround is XR-owned Layer 3: reuse the existing exhibition
stage primitive and pure chapter-score samplers with the verified source bounds
and XR camera. Do not move a model, HDR, camera or WebGL scene into shared Layer 1,
and do not modify the protected Bending presentation. `XRStageMotion` takes the
existing Director's delta time and supplies finite entry/exit state, using the
Bending motion timing/direction reference. Model/phone replacement must cross a
zero-opacity boundary and accept the new actual paint before entry. Reversal,
hidden/resume, policy/failure and disposal close their owned work explicitly.
No second stage RAF or JavaScript recording clock is introduced.

The real-paint guard classifies each mesh's actual `onBeforeRender` delivery.
A model frame requires the one pinned source primitive and no phone meshes;
a phone frame requires its original casing and recorded screen separately, with
no source primitive. One to three editorial stage draws must also be present,
and the renderer call total must equal those classified draws. Shader errors,
a stage-only frame, absent screen, duplicated casing or unclassified extra draws
cannot publish `successfulPaint`. The exhibition surround cannot substitute
for the project or its recorded pixels.

XR's three owned decorative stage materials extend the existing exhibition
shader chain with a four-edge alpha feather before alpha testing. The feather
is **80 CSS pixels on desktop and 32 CSS pixels below 800 px viewport width**,
mapped to actual drawing-buffer dimensions after the renderer budget is applied.
This softens the cropped stage boundary into shared Layer 1. Source-model,
device-casing and recorded-screen shaders/alpha remain untouched; there is no
whole-canvas mask, added HDR or changed camera/projection/pixel budget. Disposal
restores the owned callbacks/cache keys and releases that set's resources.
`surface.environment.edgeFeather` reports its owner, CSS width and actual physical
buffer/feather dimensions for acceptance.

The sticky XR chapter navigation sits below the fixed portfolio masthead
(6 rem desktop, 5 rem in its narrow layout). On mobile it is one native horizontal
scroll row with stable position, so its controls stay above the projected source
and recording rather than covering their upper edge. Actual desktop/mobile rectangles,
source-reading space and controls must still be checked in the rebuilt artifact;
the CSS offsets alone do not establish visual acceptance.

The article's chapter markers are overview → context → method → Adapt → Assemble
→ Join → physical making → credits. The previous Contribution/Limits sections,
anchors and navigation targets are removed; Credits & Sources becomes section
05. The full approved study JSON remains unchanged. Credits retain attribution,
source note and the source statements about absent controlled metrics and the
original hardware not being reexecuted. Nine principal figures, three complete
recording files and direct links retain their source identity. The preceding
74-string/ten-chapter SSR audit is historical and cannot certify this shorter
rendered article.

## Publication

The public builder explicitly allowlists `PagePreviewReadiness`,
`HomeScrollPresenter`, `project-grid-layout` and the new XR motion/background
modules. The artifact auditor checks required SSR preview/grid/Home/opening
markers and surviving making/credits content, and rejects removed XR section
IDs/navigation targets. These contract checks complement actual browser/visual
tests; they do not replace them or relax the CI gate.

The owner authorizes implementation through deployment. Use the pinned toolchain
and existing exact-artifact gate; local implementation is not publication.
Required evidence includes actual loading/first-draw ordering, scroll and
resource closure, responsive visuals, original recording timing, protected
Bending regression, approved source pins, full required CI and post-deployment
artifact/live checks. Record unavailable physical-device checks accurately.
