# Cinematic native-scroll camera — local Thesis proposal

Role: **Animation Cinematographer**. Date: 8 October 2026, Europe/Berlin. This supersedes the earlier three-beat camera only for the newly requested layered case page. The existing 4182 camera desk remains unchanged. The supplied model and evidence media are read-only; no publication or external upload occurs.

## Agreed chapter and composition contract

The Experience Director and UIUX Designer agreed the following seven stable IDs before implementation. Camera progress is `(chapterIndex + actualSectionPhase) / 7`. The page measures the true top positions of these sections and a final end offset. It does not replace native scroll, fix every section to an artificial distance or require equal heights.

| ID | Camera purpose | HTML and negative space |
|---|---|---|
| `overview` | Close sculptural view, low angle, deliberate edge crop | Left title; large model reaches into the lower right |
| `form` | Pull back to the complete selected assembly | Left reading column; full model right |
| `system` | Move toward the opening geometry while reducing background prominence | Left text; recorded method diagram on right |
| `pattern` | Closer actual perforated surface, with a different elevation | Left text; real source sample comparison on right |
| `make` | Reverse the composition and reduce model prominence | Construction evidence left; text right |
| `validation` | Re-establish the assembly behind the physical evidence | Left conclusion; prototype evidence right |
| `credits` | Complete-model ending hold | Model above a quiet footer and attribution |

Every chapter holds its pose from local phase .20 to .80. The .80–1.00 tail and the next .00–.20 head form one continuous transition with a minimum-jerk easing function. This gives the reading layers a stable composition. It is deterministic progress sampling, not a fixed-duration movie or a structural simulation. Rapid user scrolling can still move the camera rapidly; no speed or acceleration measurement is claimed.

The principal-point offset changes the composition independently from camera aim. It is intentionally nonuniform: right-biased on left-text chapters, left-biased during MAKE, centered near the ending. Desktop FOV varies between 34° and 39°. Portrait framing uses a wider 46° FOV and a higher view to reveal the depth of the shallow assembly. Mobile overview is deliberately closer than the whole-model fit; FORM retains every actual model vertex and the ending retains the complete model bounds.

## Single-writer API

`../../../src/bending-active/cinematic-plan.mjs` is a pure module with no library dependency, browser API, clock or renderer mutation. Its only import is the explicitly handed-off, gitignored sibling `framing-hull.private.mjs`, containing private geometry-derived framing support:

```js
const u = cinematicProgressFromAnchors(scrollY, measuredOffsets); // exactly 8 offsets
const pose = sampleCinematicPose(u, width / height, { x: pointerX, y: pointerY }, {
  bounds: metadata.bounds,
  modelRevision: metadata.revision,
  reducedMotion,
});
camera.position.fromArray(pose.position);
camera.up.fromArray(pose.up);
camera.lookAt(...pose.target);
camera.fov = pose.fov;
camera.near = pose.near;
camera.far = pose.far;
camera.setViewOffset(
  width, height,
  width * pose.viewOffsetNormalized.x,
  height * pose.viewOffsetNormalized.y,
  width, height,
);
camera.updateProjectionMatrix();
invalidate();
```

The caller owns the one camera write and any input damping. Recompute measured offsets on layout changes; do not read layout inside each Three.js render callback. `sample` is an alias of `sampleCinematicPose`; `CINEMATIC_CHAPTERS` and `cinematicChapter` expose the shared order and current section phase.

Pointer x/y are normalized to −1…1 and clamped. They contribute at most ±1.25° horizontal and ±0.8° vertical rotation, with a combined magnitude below 2°. They do not change progress, chapter, representation, selected geometry or evidence. Pointer smoothing may continue only until settled, then demand rendering should stop. Use zero pointer on touch/coarse input and when the pointer leaves the viewport. Do not add a second CSS or controls-based camera rotation after the sampler.

The returned `modelVisibility` is a composition hint for fading the model behind documentary evidence. `surfaceEmphasis` can inform an explicitly described analytical display treatment; it is not measured stress or curvature data. The camera module does not change model vertices, normals or transforms. `compositionNDC` records the intended optical center for inspection; `viewOffsetNormalized` is the corresponding Three.js offset, not a CSS translation.

Reduced motion uses a single fixed whole-model ending composition for all scroll and pointer inputs, disables the pointer decoration and surface sweep, and keeps the model quiet behind the reading layers. The HTML may remain naturally scrollable and reveal evidence without an animated camera. If the user explicitly enables motion for the session, the controller can resume the current story pose.

## Real-model and rendered evidence

The asset is the previously converted `assembly.glb`, hash `c56dfda835e6538ad360f76967ba65603ff48d055228a7d400a2293554bbb058`. It contains the selected visible assembly: 84,626 positions and 131,881 triangles. It is already centered, scaled from millimeters to meters and transformed to Y-up. Its measured bounds are embedded as the default, with metadata overrides supported. The raw 3dm, fabrication layouts, alternative meshes and analysis markers are not loaded by this module.

`capture.mjs` builds a separate review harness against that exact GLB and the existing role-local HDR. It overlays stable HTML type and the real current local evidence images. All generated bundles, screenshots and contact sheets go to:

```text
D:\JosHsuan_Website\_work\bending-active-thesis\cinematic-integration\cinema-review
```

The final capture run produced **23 real screenshots**: all seven desktop holds, six transition midpoints, two pointer extrema, one reduced-motion sample and all seven mobile holds. `captures.json` stores exact poses, viewport sizes, actual geometry bounds/counts, per-image hashes and the model hash. The browser recorded no page errors and no additional render while idle. `index.html` is the local contact sheet.

Direct pixel inspection covered every desktop hold, desktop transitions into FORM and MAKE, both pointer extremes, reduced motion, and mobile overview/FORM/PATTERN. The first mobile overview was too small; the final module moves that intentional crop closer while retaining the full FORM view. The desktop opening now fills the lower-right space with a clear central arch, FORM is fully visible, and the documentary chapters subordinate the model to their source panels. The inspected reduced-motion image retains a complete dimmed model.

These images are a **camera/overlay fixture**, not proof of the final page's typography, transitions, source links or scroll controller. The final integrated page still needs actual input, native-scroll, resize, fallback, mobile, hidden-tab and reduced-motion checks. Source pages must remain readable via their full-size links; the fixture's reduced previews are not a substitute for those links. The chosen metal shading is a display proposal, not measured material reconstruction.

## Verification

```sh
node --test roles/animation-cinematographer/research/bending-active/cinematic/cinematic-plan.test.mjs
node roles/animation-cinematographer/research/bending-active/cinematic/capture.mjs
```

Nine tests pass: unequal section mapping; stable holds and continuous transitions; exact principal-point placement using the installed Three.js camera; ending corner fit; FORM projection of all 84,626 actual GLB vertices at five aspects and three pointer extremes; rejection of measured support for a mismatched revision or bounds; bounded nonsemantic pointer motion; fixed reduced-motion composition; and deterministic reverse seeking with finite values. They are meaningful camera contract tests, not claims of device or visual acceptance by the owner.

### FORM revision after integrated-page review

The Experience Director and integration owner found that the conservative bounding-box fit made FORM too small. A box's unoccupied corners were setting the camera distance. `measure-hull.mjs` therefore reads the exact GLB revision and computes its convex hull: 446 support vertices and 888 faces from 84,626 original positions. These support points live in the private sibling module and are used only for FORM framing; they do not replace, simplify or render the mesh. Both the model hash and expected bounds must match before this support is used. Other revisions fall back to the conservative box.

The revised FORM camera uses that exact geometric support and a controlled distance reduction. Its portrait principal point moves lower to leave room above the model. A first uncapped hull fit brought the mobile model too close to the footer, so the final version limits the enlargement relative to the reviewed framing. Geometry containment is checked against every original GLB vertex, not only the support data that drives the implementation.

`compare-form-fit.mjs` compares the archived pre-change poses with the final poses. At 1440×900 the projected silhouette width increases from **470 to 564 px (1.201×)**. At 390×844 it increases from **203 to 243 px (1.198×)**, with its upper/lower extents at approximately **523/775 px**. These are exact perspective projections of the convex support, not raster segmentation claims. The complete measurements are in `form-fit-comparison.json` beside the captures; `before-form-fit-captures.json` preserves the original camera states.

The final desktop and mobile FORM images, plus the transition into FORM, were directly inspected after the change. This resolves the camera-size issue while preserving the full real silhouette. The integrated page must still avoid putting its mobile FORM callout over the upper arch; the previous actual-page capture had that overlap before this revision. UIUX and the integration owner were informed so text layout and camera composition can be verified together.

To regenerate and audit the model-specific support:

```sh
node roles/animation-cinematographer/research/bending-active/cinematic/measure-hull.mjs --embed
node --test roles/animation-cinematographer/research/bending-active/cinematic/cinematic-plan.test.mjs
node roles/animation-cinematographer/research/bending-active/cinematic/capture.mjs
node roles/animation-cinematographer/research/bending-active/cinematic/compare-form-fit.mjs
```

The retained `--embed` flag now means an explicit private handoff; it never embeds geometry into maintained camera source. It requires the source GLB hash to match the camera module's declared revision, prepares `framing-hull.private.mjs` in the authorized external working directory first, then copies identical bytes to the two narrowly gitignored consumers:

- `roles/animation-cinematographer/src/bending-active/framing-hull.private.mjs`
- `roles/uiux-designer/cases/bending-active-thesis/components/vendor/framing-hull.private.mjs`

`handoff-private-hull.mjs` can repeat that handoff from the existing `convex-hull.json` without recomputing any geometry. The pure camera module imports and re-exports the constant, so its public API remains identical. The final boundary migration compared 435 poses across five aspects, 29 progress values and three pointer positions: every returned value remained exactly equal. All nine camera tests passed afterward, and `git check-ignore -v` confirmed both private copies are ignored. `private-hull-handoff.json` and `private-hull-boundary-verification.json` in the external work folder preserve preparation/copy hashes and the no-recomputation record. No private source model is edited.

No new Theatre state is supplied. The selected camera poses are procedural proposal values tied to the real model revision. If the owner requests timeline authoring, capture and export these model-specific poses through the existing local Theatre boundary, record a real state revision and replace this writer. Do not run the two camera drivers concurrently.

## Reference translation

[Lusion's official WebGL Scroll Sync research](https://github.com/lusionltd/WebGL-Scroll-Sync) describes a native-scroll/rAF synchronization problem for 3D objects aligned to moving DOM elements and an absolute padded-canvas workaround. This page uses a background subject with chapter-level composition, not pixel-anchored DOM boxes. Its fixed background therefore does not implement or claim that workaround. Native reading and a coherent spatial layer are the applicable principles; no reference-site geometry, images or source code were copied.

[Three.js PerspectiveCamera](https://threejs.org/docs/pages/PerspectiveCamera.html) supplies the optical view-offset and projection-update API used here. The framing, chapter interpolation and pointer composition are original project code, tested against the pinned installed runtime. These primary sources were checked on 8 October 2026. They support presentation mechanics, not the thesis's engineering claims or the owner's uncaptured Saved preferences.
