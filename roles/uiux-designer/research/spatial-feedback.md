# Round 02 — spatial motion and object feedback

Owner request, 7 October 2026: the initial motion feels too rigid; think about all objects through 3D motion and explore interactive feedback for different objects. This extends the role's local proposals. It does not populate the portfolio.

## Design response

Treat an object as a surface with thickness, a local pivot, a relationship to adjacent objects and a reason to move. Assign a different spatial verb to each object family. Keep its hit region stable and its response interruptible. Selection is persistent; hover is temporary; a press has a down/release/cancel lifecycle. Functional state changes immediately, before the decorative response finishes.

The new set has six CSS perspective studies and one actual WebGL assembly. CSS studies use layered planes, not rendered solid meshes. They retain ordinary HTML text, buttons and focus. The WebGL study uses generated curved ribs, lighting, perspective, raycast selection and a four-track Theatre score. All assets and code remain within this role. No optional library was added.

## Inspect locally

Open [the seven studies](http://127.0.0.1:4175/?collection=spatial-feedback). Open individual specimens to operate them; Compare uses actual captured stills. Save and notes preserve discussion choices in this browser. The round banner offers a direct start with the 3D assembly. No specimen autoplays.

| Object | Spatial verb and feedback | Working proposal | Input and actual outcome |
|---|---|---|---|
| Short headings | Fold into distinct local planes; focus comes slightly forward | [Word planes](http://127.0.0.1:4175/?material=feedback-type) | Fan, keyboard focus and select each word; reading order stays intact |
| Identity marks | Gimbal rotation / network depth / interlocking faces | [Identity mechanisms](http://127.0.0.1:4175/?material=feedback-glyph) | Three rules for the same five parts; open/close each mechanism |
| Icons and buttons | Lift when ready; compress on press; rebound on release | [Tactile key](http://127.0.0.1:4175/?material=feedback-key) | Pointer capture/cancel, Enter, Space and tap change the adjacent tile's wire/surface state |
| Cover / diagram / caption | Tilt as one rig, then separate into independently offset planes | [Evidence card](http://127.0.0.1:4175/?material=feedback-card) | Bounded mouse parallax; click/tap or Inspect layers separates rule, field and label |
| Navigation and chapter tabs | Selected plate sits forward; focus uses a smaller lift | [Depth detents](http://127.0.0.1:4175/?material=feedback-navigation) | Buttons immediately switch real local section copy; Next cycles sections |
| Notes and metadata panels | Rotate around two edge pivots | [Hinged disclosure](http://127.0.0.1:4175/?material=feedback-panel) | Native button expanded state opens/closes actual document content and link |
| Geometric parts | Gather → staggered fan → hold → return; selected part lifts locally | [Curved ribs](http://127.0.0.1:4175/?material=feedback-assembly) | Theatre play/pause/seek, nine raycast/numbered picks, inspection turn, wireframe, complete reset |

## Applying spatial thinking to the whole material catalog

| Existing family | Spatial interpretation | Deliberate limit / further production decision |
|---|---|---|
| All five fonts | Heading planes have distinct depth and pivots; monospace labels describe state | Body paragraphs stay in a fixed reading plane. Font choice itself is unchanged. |
| Three icon packs | Raised control cap, compressed active state and explicit release | Compare icon shape separately; one family should eventually own controls. |
| FORM / SYSTEM / MAKE SVGs | Three mechanism logics, consistent material vocabulary | Original static marks remain the small-size identity; mechanism geometry is a companion study. |
| Graphite / paper / orange | Near/far layers and material/light contrast; orange identifies active parts | Depth and color never carry the only state label. No physical material claim. |
| Focus rail | Forward selected plane plus lighter focus elevation | A real route remains a normal anchor; the proposal is a local chapter switcher. |
| Command panel | Optional disclosure shell and shared selected state | Do not animate terminal typing or require commands. Existing unavailable-command behavior stays truthful. |
| Aperture | Use a local text-plane fold for short titles | Keep the original flat aperture as a comparison, not a universal entrance. |
| Linework trace | Place explanatory outline on a diagram plane within the card | No invented fabrication toolpath. Existing trace remains a flat baseline. |
| GSAP reflow | Replace uniform separation with staggered local pivots where it explains assembly | GSAP's existing DOM ownership remains separate from the Theatre scene. |
| Theatre section | Camera and staggered curved ribs create the new spatial score | The earlier SVG sequence remains available as a simpler comparison. |
| Wire field / hatch | Object picking and inspection are demonstrated in the new assembly | Existing shader/wave geometry remains unchanged; no speculative physics or postprocessing. |
| ASCII | A secondary planar projection in the same representation family | Keep text selectable/readable; no 3D camera control is needed to decode it. |
| Sliders and status | A parameter changes the actual spatial relationship, with an immediate numeric state | No depth animation on long labels or aria-live per frame. Native range inputs remain usable. |
| Errors / unsupported rendering | Return to the static projection and retain selection controls | No fake loading, success, transmission or analysis state. |

## Motion direction and ownership

### Direct feedback

`src/spatial-feedback/response.js` owns all animated channels in each DOM specimen. Pointer/focus/click handlers set targets; they never write those transforms directly. The small original response integrator supports a precise settle and a more elastic rebound, reverses from its current velocity, caps resume time and substeps integration. It stops requesting frames after settling, snaps when hidden, and cancels on disposal. It is procedural input response, not a substitute for authored storytelling.

Perspective is tunable from 450–1400 px for comparison. Default 850 px; restrained production choices should be reviewed at the actual component size. Card pointer rotation is bounded to ±12° yaw / ±9° pitch. A stable outer button owns focus and hit testing; transformed inner surfaces do not chase the pointer. Press handling uses native button activation and pointer capture. State text describes real changes, not the render loop.

### Authored score

Theatre Core 0.7.2 evaluates the versioned state through the unchanged production `createTheatreController` adapter. Actual Studio transactions authored six checkpoints on assembly progress and camera x/y/z; `createContentOfSaveFile` produced the export. The previous genuine section export seeds the project, and the real Studio **Sequence all** menu creates the camera tracks. No JSON keyframes were fabricated. See the [versioned manifest](../src/motion/theatre/spatial/motion.manifest.json).

| Time | Progress | Camera x/y/z | Intent |
|---|---:|---|---|
| 0.0 s | 0 | 4.8 / 3.2 / 6.8 | Compact object / establish silhouette |
| 0.4 s | .05 | 4.6 / 3.1 / 6.7 | Small anticipation / gather attention |
| 1.2 s | .38 | 3.2 / 3.6 / 7.4 | Staggered parts begin to fan |
| 2.4 s | 1 | −1.8 / 4.2 / 8.2 | Open relationships / camera reveals depth |
| 3.6 s | .88 | −3.8 / 3.7 / 7.4 | Reading interval / hold most separation |
| 4.8 s | 0 | 4.8 / 3.2 / 6.8 | Return to compact pose |

```text
Theatre Pose → camera + story parent + each rib's assembly group
  inspection group → procedural user yaw
    rib assembly group → deterministic mapping from authored progress
      feedback group → selected/hover lift
        mesh → owned geometry + material state
```

Picking a part or changing inspection turn pauses playback. Hover stays a small temporary cue on the child feedback group. Selection has numbered DOM alternatives, so raycasting is optional. Reset restores camera, timeline, selection, inspection turn and representation. Canvas uses demand rendering and DPR capped at 1.5. Closing or choosing the diagram unmounts the canvas. The shape is an original unitless arch, with no claim of structural analysis or manufacturing validity.

## Research and evidence

Primary sources reviewed 7 October 2026. These are technical constraints informing original designs, not copied assets/layouts:

- [MDN perspective](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/perspective) and [transform-style](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/transform-style): local perspective and preserved depth; grouping/flattening constraints informed nested surfaces. Clipping stays outside each 3D rig.
- [MDN pointer capture](https://developer.mozilla.org/en-US/docs/Web/API/Element/setPointerCapture): retain a press's release/cancel lifecycle when a pointer moves off the key.
- [R3F events](https://r3f.docs.pmnd.rs/api/events): nearest meshes must stop propagation; objects otherwise do not behave like opaque DOM targets. Mesh picking is mapped to the same selection action as numbered buttons.
- [R3F demand rendering](https://r3f.docs.pmnd.rs/advanced/scaling-performance): imperative changes invalidate; the frame loop continues only while interpolation is moving. Resource owners clean up on unmount.
- [Theatre Studio API](https://www.theatrejs.com/docs/latest/api/studio): transactions and save export support actual authored, reproducible state. Installed 0.7.2 behavior was checked with a real authoring session and clean runtime replay.
- [W3C animation from interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html) and [dragging movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html): remove nonessential motion for the user's preference and provide simple pointer alternatives to path-dependent gestures. These inform design, not a claim of complete WCAG conformance.

The Material 3 motion page could not be meaningfully read in this environment; no design claim relies on it. A direct GitHub Fiber tag URL did not load; the official event docs and locally pinned package are the implementation evidence. No new external asset was acquired in this round. The tactile key reuses the pinned Lucide `layers.svg` and existing ISC notice.

## Recommendation and review order

Start with the curved-rib score, then the card and tactile key. These address three different scales: narrative, object inspection and immediate input feedback. Add depth detents if chapter orientation benefits from them. Keep the word planes, identity mechanisms and hinged disclosure as accents pending review; using all of them at once would compete with the content.

Use **Precise** as the default control response, **Elastic** as an explicit comparison for exploratory specimens. Compare the same interaction at two perspectives before choosing. The research covers all object families; production adoption still depends on actual approved content, the owner’s preferred motion intensity and real-device validation.

See [verification](../verification/README.md) for actual checks, captures and limitations.
