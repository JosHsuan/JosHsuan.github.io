# Spatial editorial — feature proposal and integration contract

Round 03, 7 October 2026. UIUX designer role only. The [working proposal](http://127.0.0.1:4175/features/) extends the original spatial studies into a connected reading and working experience. The production portfolio remains empty. The [pre-build plan](spatial-editorial-plan.md) records the rationale; the [feature registry](../catalog/features.manifest.json) maps the six implemented proposals to their source studies.

## The design decision

Use depth to communicate a relationship. A selected object advances; inspection exposes layers; comparison aligns objects; undo restores a prior arrangement. Keep titles, prose, navigation and controls on a readable plane. Functional state changes immediately; spatial feedback can settle afterwards. No page-wide tilt, scroll hijack, compulsory animation or command-only route is involved.

FORM / SYSTEM / MAKE organizes three questions: what is the form, what rule produces it, and how can its making be inspected? It is an original anthology direction. In this prototype, those annotations describe actual UI studies. They do not stand in for professional contribution evidence or fabrication claims.

Graphite and paper establish reading contrast. Orange indicates a selected state, editable parameter or focus. Plex Sans and Plex Mono are existing locally licensed specimens, used here as an editorial baseline. Wide layouts pair image and method; narrow layouts place them in reading order. Native scrolling carries the visit from discovery to evidence and experimentation.

## Saved is the preference source

The feature page reads **uiux-material-review-v1** from the same origin as the material desk, `http://127.0.0.1:4175`. It never writes that key. **Your design basis** reports the actual recognized Saved entries and retained notes. Opening a different browser/profile, hostname or port does not transfer local storage. An empty or unreadable basis is explicitly labeled as an exploration preset; it is never presented as an inferred owner choice.

| Saved study | Applied interpretation in this prototype |
|---|---|
| Word planes | A restrained static heading perspective; long prose remains flat. |
| Identity mechanisms | Layered context/object/reading diagram in the opening. This is a diagram, not the complete interactive glyph mechanism. |
| Tactile key | Local pressed-state inset on conventional buttons; numbered geometry controls retain immediate state feedback. |
| Separated card | Selected/hovered index image depth and a tilted inspection cover. The media dialog itself is native and opens immediately. |
| Navigation detents | Depth distinguishes the current method chapter; native links still locate sections. |
| Hinged disclosure | A separated anatomy diagram inside a conventional disclosure. No hinge animation is claimed for this reader. |
| Spatial score | Interruptible interpolation of direct geometry parameters. The genuine Theatre-authored 3D score is a separate, explicit inspection action. |

Unselected spatial treatments are suppressed while their functions remain available. Saved font/icon choices are listed as other retained materials, not silently mapped to a typography or icon switch. Flat removes depth, and Reduce or the operating-system preference snaps motion to its target. Static perspective can remain in Reduce; Flat is the separate depth option.

The feature page stores only its presentation, motion and two-study comparison in **uiux-feature-review-v1**. Geometry is session-only and can be exported. **Export feature review** includes the exact read basis, notes, comparison, current geometry and review settings. It records discussion state, not publication approval.

## Six proposals that work together

| Proposal | Implemented interaction | Proposed website use |
|---|---|---|
| Study index | Seven real studies, search, category filter, empty state, selected reader, shareable URL and browser history. | Future Work index, once approved project summaries and cover rights exist. |
| Method reader | Context, mechanism, evidence and limits; native chapter anchors, linked source, annotation text and anatomy disclosure. | Case-study template. Add explicit personal role, team scope, contribution, results and credits from approved evidence. |
| Media inspection | Actual captured image, 100–250% zoom, native scroll/pan, reset, real image download, Escape and focus return. | Case imagery/diagrams with captions and rights. Current PNGs are specimen captures, not professional assets. |
| Comparison | Two items, six aligned criteria, remove/clear, a tray while browsing/reading, and a semantic table with a scrollable narrow-layout region. | Optional Work or Lab comparison. Do not rank unrelated projects or manufacture comparable performance metrics. |
| Geometry workbench | Nine curved ribs generated as an SVG projection; separation/fan, local part isolation, 30-state undo/redo and actual SVG/JSON export. | Lab experiment with reproducible parameters and explicit limits. It performs no engineering analysis or fabrication toolpath generation. |
| Shared actions | Searchable native dialog; search, compare, workbench, reset, flat and reduce actions use existing page controls/state. | Optional secondary interface. Ordinary navigation and controls expose every action. |

The recommended review sequence is: open the same browser's feature page → inspect **Your design basis** → choose a study → read its mechanism → inspect the image → add two studies to comparison → change and export the geometry. Use **Actions** only if useful. The original gallery now links directly to this round.

## Architecture and motion ownership

- `preview/features/index.html` contains the semantic review shell; `system.css` owns static presentation, breakpoints and state selectors.
- `src/feature-system/features.js` owns selection, filtering, dialogs, comparison and undo history. `geometry.js` owns the deterministic projection. The catalog supplies actual study content; no source document, private preparation record or SQL enters the browser.
- `src/spatial-feedback/response.js` owns the local numeric response. Each image or projection has one response instance; it stops at rest and disposes on page exit. Functional state is synchronous. This is direct manipulation feedback, not a second authored timeline engine.
- The optional 3D dialog mounts one existing specimen iframe. Its actual versioned Theatre export is evaluated through the agreed adapter. Studio remains in the separate local authoring surface, excluded from runtime bundles. Closing the dialog removes its scene document. Free SVG parameters do not alter the authored camera or pretend to be keyframes.
- Build output is `roles/uiux-designer/dist`, served locally on 4175. The feature entry initially loads no Three canvas, iframe or external asset request. No new dependency was introduced. Role skills/MCP stay under this role. The existing catalog MCP indexes the 26 materials; the six feature proposals have a separate manifest and are not new MCP material records.

## Suggested adoption sequence

1. **Global navigation and reading primitives:** ordinary links, focus states, selection, chapter location, image captions and responsive prose. These establish access before adding motion.
2. **Work and Case:** reuse the index/reader/media contracts only after approved summaries, individual contributions, evidence, captions and rights are supplied. Keep unpublished fields absent rather than substituting these UI studies as professional work.
3. **Lab:** carry the workbench into a dedicated experiment with reproducible state. Preserve its diagram and controls independently of WebGL availability. Adopt the existing genuine score only where an authored demonstration explains the geometry.
4. **Home:** use one editorial statement and one chosen spatial object to introduce the approved work. Avoid stacking all seven treatments into the opening. The local proposal heading is research copy, not approved portfolio introduction copy.
5. **About/contact:** prioritize plain reading, approved profile/CV/contact details and accessible links. Spatial feedback should be limited to interaction state; missing contact or CV material stays absent.

Formal integration is later work. This round does not rename production routes, change the content schema, populate the profile, publish assets or trigger Pages deployment. See the [verification record](../verification/README.md) for executed checks and unverified limits.
