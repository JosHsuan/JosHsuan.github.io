# Portfolio route and readiness integration

Status: owner-authorized implementation, 16 October 2026. Built-artifact browser
acceptance and publication are recorded separately by the integrator. This file
does not claim that local CPU checks prove visible loading, browser history,
performance or deployment.

The current owner request replaces the preceding single-page personal
introduction with a model-free Home, About, Projects and Contact navigation,
native Home-to-project-grid scrolling, and directly reloadable Bending-Active
and XR motion-capture detail routes. This selected public application remains
inside the existing case publication boundary. The reusable root `src` framework,
generated entries and empty public-content snapshot are unchanged.

The subsequent card request explicitly authorizes a real, card-scoped Bending
model and the source XR animation encoded as a silent MP4. The Home introduction
and atmospheric background remain model-free. Only an actually visible project
card may acquire its optional model/video resources. This supersedes the preceding
whole-Home zero-Canvas statement for that card; it does not authorize a model in
the introduction, a full-page scene, or the full case RuntimeRoot on Home.

## Five-role implementation decisions

| Role | Recommendation and implemented boundary |
| --- | --- |
| Software Architect | Keep native, full-document anchors and a small site loader controller. Optional card previews share `PreviewLifecycle`, separate from site readiness and the full case RuntimeRoot. Only the visible model card dynamically imports its own narrow Three renderer; same-document fragments remain native. |
| Experience Director | Every site request has one `entered`, `cancelled` or `failed` terminal. Preview acquisition separately has one `ready`, `cancelled` or `failed` terminal; a later resource fault cannot rewrite a successful acquisition. Case scene entry is delegated, never driven again. |
| Motion Designer | Generic entry uses a 0.72-second reveal on the native document timeline. SiteNavigation owns the opacity/lift handles and waits for both native `finished` promises; API-absent engines retain the CSS-event fallback. The two writers never run together. Reduced Motion skips the reveal. Model cards are fixed-pose demand renders with no motion clock. XR playback uses the native video clock, with a real pause button, visible-only lifetime and Reduced Motion/Save Data poster fallback. The case Director remains the sole case animation clock. |
| Performance Engineer | The introduction/background mounts no model, case RuntimeRoot or Canvas. One shared optional-preview eligibility service responds to actual intersection, document visibility, site entry and preferences. Offscreen/hidden/pagehide abort and release model contexts or video sources. A shared model lease permits at most one model-card renderer; no JavaScript RAF is added. Functional evidence does not prove physical-device performance. |
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
  paused and replayed. `ready` means that document resources and both native play
  tasks have been accepted, not that a GPU paint has been acknowledged. The
  preparation uses the remaining original 15-second arrival budget; resource
  completion never restarts it. Only then does the original 1.6-second reveal
  completion budget begin. Terminal/preference changes cancel the callback and
  animation handles. No recurring render loop or JavaScript animation clock is
  introduced.
- `runtime/site/SiteReadiness.mjs` shares one resource check per document. Only
  `img[data-site-critical]` or images inside a marked container are critical.
  Their selected source is awaited through load/error and `decode()`; no image
  is cloned or allocated, and lazy documentary images are not promoted implicitly.
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
document deadline produce `failed` and release generic content. Generic native
preparation, including pending play acceptance, shares that arrival's original
15-second budget. A missing reveal completion produces `failed` after 1.6 seconds
from `ready`; it cannot assert that an unseen animation completed. This changes
the earlier resource-only definition of `ready` and the budget allocation: pending
presentation/play now belongs to preparation rather than consuming the reveal
budget. Success remains eligible for at most 16.6 seconds from controller arrival,
not from HTML download. Browser main-thread blocking can delay terminal dispatch.
Hidden or Reduced generic arrivals choose a readable static completion only after
successful document readiness. Live changes close pending native preparation or
reveal explicitly. Every asynchronous boundary checks its monotonic expiry; a
delayed timer cannot permit a late success. These are bounded event waits, not
another render loop. The shared readiness service and Bending gate are unchanged.

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

### Visible project-card resources

`runtime/site/PreviewLifecycle.mjs` supplies both the real model card and native
MP4 preview with a 15-second acquisition bound, AbortSignal, generation checks,
bounded 64-fact request history, cleanup and shared eligibility. Eligibility
requires actual positive intersection, a visible document, completed site entry,
and no Reduced Motion or Save Data preference. It uses IntersectionObserver,
document/policy/page lifecycle events, and a MutationObserver for the existing site
state attribute. No wheel interception, frame callback, iframe or JavaScript
animation loop is introduced. A zero-size model surface releases resources and
can reacquire when its eligible dimensions return.

`ProjectModelPreview.jsx` dynamically imports `project-model-scene.mjs` only after
eligibility. The helper verifies the same source GLB SHA and three layer/count
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
idle-frame checks remain required. Scroll departure, hidden state, pagehide,
preference changes and disposal abort pending work, release geometry/materials,
HDR/PMREM, lights, targets and renderer, and explicitly lose the context. A shared
model lease permits at most one model-card resource at a time. Returning may
rebuild it; a disposed canvas's pixels are never relied on as a fallback.

The SSR poster is eager, marked site-critical and readable without JavaScript.
The model/video enhancement is optional and cannot hold essential links or site
entry waiting on an offscreen resource. Load/GPU/context/playback failures keep
the original poster and surrounding native project link usable. Native MP4
playback owns its own media time, supports a separate accessible pause/play button,
and releases its source/decoder while inactive; no GIF/JavaScript playback clock
is created. Title visibility on fine-pointer hover must also include keyboard
focus, while coarse-pointer/print presentation retains a visible title and the
link's accessible name remains present in every mode.

Acquisition facts have one terminal: `requested → ready`, `cancelled`, or `failed`.
`ready` means that acquisition succeeded, not that the resource cannot later fail.
The public controller `fail(reason)` releases a subsequently lost context/decoder
and sets visual state to `failed`; a separate bounded `resourceFailures` record
describes that later fault without appending a second acquisition terminal.
Repeated failure notification is idempotent. A failed eligible generation does not
restart merely because of resize or unchanged eligibility; a new eligibility
epoch or explicit user retry is required.

The model inspection port is `window.__projectModelPreview.inspect()` or the same
port on the `[data-project-model-preview]` element. It includes eligibility,
acquisition/resource-failure history, actual scene draw count, source revision,
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
