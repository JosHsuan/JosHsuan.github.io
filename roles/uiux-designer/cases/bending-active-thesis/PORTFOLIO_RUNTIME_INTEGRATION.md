# Portfolio route and readiness integration

Status: owner-authorized implementation, 16 October 2026. The current
[decision 0014](../../../../docs/decisions/0014-prepared-page-home.md) and
[prepared-page/Home contract](PREPARED_PAGE_HOME_INTEGRATION.md) supersede the
earlier visible-only card lifetime, fixed-nine grid and static Home response.
Built-artifact browser acceptance and publication are recorded separately by the integrator. This file
does not claim that local CPU checks prove visible loading, browser history,
performance or deployment.

The current owner request replaces the preceding single-page personal
introduction with Home, About, Projects and Contact navigation,
native Home-to-project-grid scrolling, and directly reloadable Bending-Active
and XR motion-capture detail routes. This selected public application remains
inside the existing case publication boundary. The reusable root `src` framework,
generated entries and empty public-content snapshot are unchanged.

The current card request prepares the real, card-scoped Bending model when Home
or Projects opens, through its successful first draw while loading covers the
document. Positive intersection and completed site entry are not acquisition
prerequisites. The prepared offscreen card remains resident; it does not return
to a poster when scrolling away. The Home introduction and atmospheric background
remain model-free, while the whole Home document may already hold the card canvas.
No full case RuntimeRoot or project stage is mounted on Home. XR uses the approved
static centered/inset main visual for its card; the earlier montage derivative
remains direct source evidence on the XR article.

## Five-role implementation decisions

| Role | Recommendation and implemented boundary |
| --- | --- |
| Software Architect | Keep native, full-document anchors and one site loader controller. `PagePreviewReadiness` composes SSR-declared card model/static terminals with document readiness. The card imports its narrow renderer on page opening without waiting for site entry; no full case RuntimeRoot is mounted. Same-document fragments remain native. |
| Experience Director | Every site request has one `entered`, `cancelled` or `failed` terminal. Preview acquisition separately has one `ready`, `cancelled` or `failed` terminal; a later resource fault cannot rewrite a successful acquisition. Case scene entry is delegated, never driven again. |
| Motion Designer | Generic entry retains the 0.72-second native reveal and both actual `finished` promises; the CSS fallback is exclusive and Reduced Motion remains static. Model cards are fixed-pose demand renders. Home delegates Bending's existing information-window response to the ordinary background driver's existing scheduler. XR keeps its project-local stage scheduler and native recording clock. |
| Performance Engineer | The introduction/shared atmosphere mounts no project model or case RuntimeRoot; Layer 1 retains its existing Canvas 2D field. The card prepares on page opening and retains one bounded resource offscreen, suspends prepared work while hidden/BFCache, and disposes on ordinary departure, preference or failure. Required startup fallback closes partial resources before uncovering and cannot introduce a late upgrade. Functional evidence does not prove physical-device performance. |
| Animation Cinematographer | Card rendering reuses the verified three-layer assembly, source satin/base treatment, HDR PMREM, ACES/SRGB, frozen overview lighting and the existing exhibition light wash. The overview direction is refit to the card's aspect; it is not claimed as pixel-identical to the full case, whose camera, compositor and source remain unchanged. |

## Files and ownership

- `components/SiteExperience.jsx` mounts **once in the published root layout**.
  Generic page components and XR must not mount additional copies.
- `runtime/site/SiteNavigation.mjs` owns `[data-site-loader]` visibility,
  `data-site-phase`, `html[data-site-entry-state]`, and temporary generic-page
  `inert` / `aria-busy` attributes. It uses the existing scoped EventManager.
  For generic arrivals it also owns the finite native reveal handles on the
  loader and `[data-site-loader-content]`. The native path disables the CSS
  reveal, ignores CSS completion events and requires both `finished` promises.
  Missing native APIs retain the CSS-event path; a failed native acquisition
  cannot silently start a second writer. Cancellation, terminal state and
  disposal cancel all owned handles, including their retained fill effects.
  Generic native preparation stays `requested` while it awaits one finite
  presentation opportunity and both original `Animation.ready` promises. The
  same effects may already be running during this preparation; they are not
  paused and replayed. `ready` means that document resources, all required card
  model/static terminals and both native play tasks have been accepted. The card
  terminal separately requires its successful renderer draw; native play acceptance
  itself is not a GPU paint acknowledgment. The
  preparation uses the remaining original 15-second arrival budget; resource
  completion never restarts it. Only then does the original 1.6-second reveal
  completion budget begin. Terminal/preference changes cancel the callback and
  animation handles. No recurring render loop or JavaScript animation clock is
  introduced.
- `runtime/site/SiteReadiness.mjs` shares one resource check per document. Only
  `img[data-site-critical]` or images inside a marked container are critical.
  Their selected source is awaited through load/error and `decode()`; no image
  is cloned or allocated, and lazy documentary images are not promoted implicitly.
- `runtime/site/PagePreviewReadiness.mjs` discovers required SSR hosts before
  awaiting resources and retains their actual first-draw or explicit static
  report. It adds no clock. Global preparation failure invokes pending owners'
  synchronous fallback cleanup before the loader uncovers content; late
  registrations receive the same static latch.
- `runtime/site/HomeScrollPresenter.mjs` delegates to the existing information
  presenter on `runtime/background/SiteBackgroundDriver.mjs`'s scheduler. It
  introduces no second RAF, React frame state or Bending Director change.
- `components/project-grid-layout.mjs` supplies at least three conceptual
  three-column rows, adding complete rows for 12, 15 and later project counts.
  Only approved project records become cards. `scripts/build-pages.mjs` explicitly
  includes the new public runtime modules; `scripts/audit-pages.mjs` checks the
  new SSR readiness/grid/Home/XR contract without treating removed XR sections
  as required content.
- `runtime/site/site-entry-bridge.mjs` carries discrete facts from the existing
  EntryManager. It owns no DOM, elapsed time or animation.
- The existing EntryLoader remains Bending's visible gate. Its optional
  `documentReady` prerequisite composes shared page readiness with the existing
  typography and actual-scene/static readiness checks. The Director alone
  advances that gate. Without the new option, the existing EntryManager API and
  default document readiness are unchanged.

The static routes are `/`, `/about/`, `/projects/`, `/contact/`,
`/projects/bending-active/` and `/projects/xr-bending-active/`. Site navigation
uses real anchors. Home `#projects` and other same-document fragments do not
start site loading; an actual same-URL document reload can start a new request.
The case's ReadingManager retains all Bending chapter fragment/history ownership.

## Readiness, failure and handoff

The site trace uses `requested → ready → revealing → entered`. Cancellation and
failure are terminal alternatives, never followed by `entered` for the same
request. Missing or broken fonts, critical images, decoding and the 15-second
document deadline produce `failed` and release generic content after closing
any pending required-card work to its static fallback. A definitive model-source
or GPU failure can report an explicit static card terminal; with a decoded poster
and otherwise successful prerequisites, this permits honest site entry rather
than a false model-success report. Generic native
preparation, including pending play acceptance, shares that arrival's original
15-second budget. A missing reveal completion produces `failed` after 1.6 seconds
from `ready`; it cannot assert that an unseen animation completed. This changes
the earlier resource-only definition of `ready` and the budget allocation: pending
presentation/play now belongs to preparation rather than consuming the reveal
budget. Success remains eligible for at most 16.6 seconds from controller arrival,
not from HTML download. Browser main-thread blocking can delay terminal dispatch.
Hidden or Reduced generic arrivals choose a readable static completion only after
successful composed page readiness. Startup-hidden card preparation uses its
latched poster policy rather than introducing a later visibility-triggered model.
Live changes close pending native preparation or
reveal explicitly. Every asynchronous boundary checks its monotonic expiry; a
delayed timer cannot permit a late success. These are bounded event waits, not
another render loop. The shared DOM/font/image service and Bending gate are
unchanged; only generic arrivals additionally compose required card preparation.

Native `FontFaceSet.ready` fulfills after font loading settles, including failure;
it is not a successful-font proof and does not reject for ordinary network errors.
The shared document service therefore inspects the settled set for faces with
`status === 'error'` and records `fonts-unavailable`. Loaded faces and unused
`unloaded` faces are accepted. It never calls `load()` or requests unused fonts.
The defensive promise-rejection path also releases the gate, but portable
rejection injection alone is not claimed as proof of browser font-failure handling.

Bending receives the same bounded document result as a prerequisite. Its existing
30-active-second startup bound also releases a still-pending document prerequisite;
generation checks discard stale promise results. The site controller receives
the actual case `ready`, `revealing`, `entered` or `cancelled` facts and starts no
site reveal timer. A case static policy is a valid success; unavailable scene,
font or page-resource fallbacks yield one site `failed` terminal after the existing
case gate has released readable content. Case and site request IDs are separate.

Internal unmodified native link activation shows the outgoing loader and stores
a bounded handoff record in session storage. The destination may adopt that exact
URL and request ID within 60 seconds. Its trace includes the original request;
completion belongs to that destination. Pagehide clears timers and temporary DOM
guards. A tracked handoff is not cancelled merely because its source unloads.
An expired, future-dated, invalid or destination-mismatched handoff with a
recoverable original request receives one explicit cancellation before the current
document starts a fresh arrival. An existing terminal receipt prevents another
terminal for that request. Empty or malformed records without a recoverable
request are removed without inventing request/terminal facts.
If session storage is unavailable, navigation remains native and the old document
records `cancelled / untracked-handoff`; the destination owns a fresh request.
This fallback does not pretend that cross-document identity was retained.

Superseding activations, prevented default activation, native history navigation,
disconnect and unfinished arrival pagehide cancel their current local request.
Outgoing navigation without a commit fails open after 15 seconds. BFCache restore
starts a fresh local arrival without replaying a generic reveal; a terminal receipt
may be incorporated for a transferred request. If that receipt was overwritten,
the old document does not emit a speculative second terminal for a request whose
ownership was transferred. The diagnostic history is bounded to 48 facts and is
not a persistent analytics or exhaustive browsing-history store.

## Progressive enhancement and inspection

The site loader is present in SSR HTML; `noscript` hides it. Bending's own SSR
gate suppresses the generic SSR gate with a scoped `:has()` rule before effects
connect. After mounting, explicit visibility ownership remains separate. An
unconnected loader has a 30-second CSS fail-open escape for hydration failure;
without executing JavaScript this is a visual escape, not a fabricated terminal
event. Main content is not SSR-inert, so no-JavaScript reading and links work.
Connected generic gates preserve and restore prior `inert` / `aria-busy` values.
Forced colors, Reduced Transparency and print reuse the existing entry visual's
accessible material rules; generic Reduced Motion also removes CSS activity.

`window.__site.inspect()` exposes `id`, `phase`, `kind`, `url`, `reason`,
`delegated`, `handedOff`, readiness result, bounded `history` and scoped listener
counts. It is an inspection port, not a renderer or navigation API. Existing
`window.__story` and case event ownership remain case-only. Modifier, external,
download and new-tab activations retain their browser behavior.

## Portable verification

### Page-prepared project-card resources

`runtime/site/PreviewLifecycle.mjs` retains the 15-second acquisition bound,
AbortSignal, generation checks, bounded 64-fact history and cleanup. The required
model card selects page-mode eligibility, independent of positive intersection
and site entry, and `retainWhenInactive` for acquired resources. Hidden/persisted
departure suspends a prepared handle without drawing; dimension changes are
cached until active. Normal departure, policy/failure and disposal release it.
A pending startup that becomes hidden/page-away settles permanently static for
that arrival. Shared visible-only eligibility remains available for the older
optional media primitives; it is not the current model-card policy. No wheel
interception, iframe or model-card animation loop is introduced.

`ProjectModelPreview.jsx` dynamically imports `project-model-scene.mjs` on page
opening while the card can still be offscreen and the loader covers content.
The helper verifies the same source GLB SHA and three layer/count
records, preserves original source transforms/units, and reuses the cinematic
satin treatment, frozen surface emphasis, base multiplier, HDR PMREM, existing
directional/area lights and exhibition light wash. Its camera preserves the existing
overview orientation and FOV, fits every actual mesh vertex transformed by its
native `matrixWorld`, and centers the perspective silhouette at 90% width in the
square card. Both bases and the shell remain inside the inset frustum; empty AABB
corners do not enlarge this card-only fit. Source vertices/transforms are never
scaled for framing. ACES exposure 1 and sRGB
output match the case; the card omits its full compositor, source-diagram assets,
annotations and interactive case runtime. A 262,144-physical-pixel output cap and
512-pixel contact-shadow map are card budgets, not a hardware capability claim.

Preview GLB, metadata and HDR transport use the same native `fetch` and owned
AbortSignal, with HTTP status validation. HDR bytes are parsed through pinned
Three 0.186.1's public `HDRLoader.createDataTexture(buffer)`, which calls the same
`_applyTexData(parse(buffer))` path as `load()`. The default half-float data,
linear-sRGB colour space, filtering and orientation remain unchanged. Aborted or
disposed generations do not parse a late body; any already-created HDR texture
is released by the existing HDR/PMREM owner. The original case loader is unchanged.
This reduces transport/cancellation ownership to one preview request path. Earlier
capture evidence included intermittent HDR `ERR_ABORTED` while the generation
became ready, without correlating a failed request ID to the bytes actually
consumed. Its cause remains unproven; this change does not relabel those receipts
or establish that the earlier network error has been fixed.

The card renders only on successful acquisition or changed nonzero dimensions.
Its canvas is appended after the first successful renderer draw and context check;
only then does acquisition become `ready`. This is a real draw acknowledgment,
not proof that the browser compositor has presented that frame. Built pixel and
idle-frame checks remain required. `firstDraw` records source revision, measured
size, positive calls and prepared environment after that boundary. Scrolling
away retains this canvas/handle and does not reacquire or expose the poster.
Hidden/BFCache retains a prepared resource without drawing, while normal exit,
preference/failure and disposal release geometry/materials, HDR/PMREM, lights,
targets and renderer and explicitly lose the context. A shared lease permits
at most one model-card resource. A disposed canvas is never a fallback.

The SSR poster is eager, marked site-critical and readable without JavaScript.
Required card preparation is bounded and may settle with its explicit static
poster; no-JavaScript links and content remain directly usable. Global deadline
fallback closes partial work before uncovering, and source/GPU/context failure
is latched so a later scroll/visibility event cannot silently replace the poster.
Reduced Motion/Save Data retain their explicit policy epochs. Native recording
time and pause/play belong to the XR stage rather than the current static card;
no GIF/JavaScript playback clock is created. Title visibility on fine-pointer
hover must also include keyboard
focus, while coarse-pointer/print presentation retains a visible title and the
link's accessible name remains present in every mode.

Acquisition facts have one terminal: `requested → ready`, `cancelled`, or `failed`.
`ready` means that acquisition succeeded, not that the resource cannot later fail.
The public controller `fail(reason)` releases a subsequently lost context/decoder
and sets visual state to `failed`; a separate bounded `resourceFailures` record
describes that later fault without appending a second acquisition terminal.
Repeated failure notification is idempotent. The current card latches a failed
arrival static; resize, intersection or visibility epochs cannot retry it.
An explicit document reload can establish a new preparation lifetime.

The model inspection port is `window.__projectModelPreview.inspect()` or the same
port on the `[data-project-model-preview]` element. It includes eligibility,
acquisition/resource-failure history, actual scene draw count/first-draw fact, source revision,
geometry counts, material and output-allocation diagnostics. The scene remains
static between demand events; these diagnostics do not establish a physical
device's memory cost, sustained frame rate or visual identity to the full case.

### Controller and page-readiness tests

`tests/site-navigation.test.mjs` exercises the actual production controllers with
injected DOM, resource promises, storage and deadline ports. It checks independent
readiness/decode ordering, failure terminals, native-link exclusions, request
replacement/handoff, prevented activation, native history cancellation, BFCache,
blocked storage, scoped disposal, delegated scene phases and EntryManager's new
document prerequisite, including rejection, timeout and stale generation.
`tests/entry-readiness.test.mjs` retains the existing Director-gate checks.

Passing these checks does not prove SSR paint ordering, native navigation paint,
CSS animation events or physical-device performance. The integrator must validate
the built exported routes and relevant browser projects, then publish only the
successful same-commit CI artifact under the existing deployment gate.
