# Bending-Active Thesis — cinematography handoff

Role: **Animation Cinematographer**. Date: 7 October 2026. Local proposal, not publication approval. The owner explicitly confirmed the Thesis local page during this round. This handoff leaves the existing 4182 comparison desk and its tools unchanged.

## Subject and inspected evidence

The subject is **Bending-Active Metal Panel Deformation**, the individual thesis at National Cheng Kung University with Prof. Kane Yanagawa as tutor. It is not the separate T3 motion-capture bamboo project. The authoritative preparation pack is `D:\JosHsuan_Website\_private\portfolio-preparation\projects\bending-active-metal-panel`. Its `evidence.md` explicitly maps the owner's additional `E:\Window備份\Simulation` source to this thesis. Read this pack's current attribution and publication limits before adapting any text.

This role directly read `evidence.md`, `interaction-plan.md`, `content-draft.md` and `asset-manifest.json`, and visually inspected full derived portfolio pages 22 and 28. Page 22 shows a low, broad, perforated metal assembly whose silhouette and varying curvature remain legible against a dark ground. Page 28 shows opening-sewing and panel-joint details, with plastic bands/rivets and a physical prototype. These observations justify a low three-quarter whole-object opening and restrained lateral change of view. They do not prove that the supplied CAD contains the photographed fasteners or the original simulation history.

The current primary attribution reference is the **VerFacade** portfolio pages 38–45; the inspected older complete-page derivatives 22–29 are secondary visual evidence. Keep these two locators distinct. The pack flags a 2020/2021 date conflict, collaborative assembly, unverified image authorship/public rights and no independently verified structural performance. The model viewer must not turn these limits into implied claims. Raw source files stay external; only reviewed local derivatives belong in the local case-study bundle.

## Viewing sequence

UIUX proposed stable HTML chapter anchors `#form`, `#system` and `#make`. Native document scroll supplies one progress scalar. The canvas carries no body copy. Keep the chapter heading and geometry caption on a stable reading plane.

| Beat | Reading purpose | Camera | Evidence alongside the model |
|---|---|---|---|
| FORM, u 0–0.30 | Establish the complete panel assembly and its silhouette | Fixed 38° vertical FOV; low three-quarter angle; brief initial hold | Real model identity, derivative/source status, project overview |
| SYSTEM, u 0.30–0.70 | Make curvature and openings readable as the viewer changes side | Bounded lateral arc, from +28° to −28° around the measured model center; gentle elevation change | Source workflow and sample comparisons; no invented regression or simulation |
| MAKE, u 0.70–1 | Relate model geometry to real construction evidence | Return toward +12°; focus only on an identified, inspected sub-bound; otherwise retain the full model | Complete source page showing actual opening sewing and panel joints |

The angular interpolation has a minimum-jerk easing law and stable holds. It is a function of scroll progress, not a fixed-duration movie. A fast wheel gesture can still move rapidly; do not describe progress derivatives as physical camera speed or measured acceleration. No time-based camera loop, handheld jitter, dolly zoom, mist or automatic focus pull is needed to explain this work. A neutral light and restrained specular response should preserve the perforation edges; material research may add an explicitly labeled analytical surface treatment without changing geometry.

Reduced motion uses one instantaneous, static composition per chapter. All source images, captions and comparisons remain available. A static poster is the initial and failure state. Optional inspection is explicit and uses a separate one-dimensional pointer angle; wheel input remains page scrolling. Do not add simultaneous pointer offset to the story camera.

## Implementation contract

The original dependency-free module lives at `../../src/bending-active/camera-plan.mjs`. It does not import another role, Theatre, Three.js, a model or browser APIs. It accepts the **actual converted geometry bounds after all display transforms**. The caller remains the single owner of camera writes.

```js
const plan = createBendingActiveCameraPlan({
  bounds: { min: measuredMin, max: measuredMax },
  aspect: canvasWidth / canvasHeight,
  modelRevision: derivedModelSHA256,
  up: [0, 1, 0],
  forward: [0, 0, 1],
  detail: null,
});
const u = progressFromAnchors(scrollY, [formTop, systemTop, makeTop, storyEnd]);
const pose = sampleBendingActivePose(plan, u, { reducedMotion, chapter });
camera.position.fromArray(pose.position);
camera.up.fromArray(pose.up);
camera.lookAt(...pose.target);
camera.fov = pose.fov;
camera.near = pose.near;
camera.far = pose.far;
camera.updateProjectionMatrix();
invalidate();
```

Recompute the plan on resize or a model revision, not each frame. Recompute anchor document offsets after layout, image/font loading and resize, not inside a render callback. `progressFromAnchors` maps the three actual chapter lengths to 0/.30/.70/1 without a scroll trap. Input values can live in a ref or small external store; they are not per-frame React state.

If the conversion preserves Rhino Z-up, pass `up: [0,0,1]` and `forward: [0,-1,0]`; if the display transform already converted to Y-up, use the default basis. Do not rotate the model twice. Bounds and pose share units; a normalized presentation scale is not a measured physical dimension. The model's own unit record governs any dimension label.

A detail requires `{ id: stableInspectedNodeID, bounds: measuredDetailBounds }` inside the full measured model bounds. An arbitrary bounding-box corner is not a joint. The module returns `detailStatus: 'whole-model-fallback'` when no identified detail is supplied. It fits perspective corners including depth, recalculates clipping planes and handles nonzero pivots, thin geometry and portrait viewports. Frustum fit does **not** prove that a close detail is unobstructed or that the camera is outside every surface; inspect real pixels before enabling a crop.

| Mode | Writer | Input and release rule |
|---|---|---|
| Story | This procedural pose sampler through one scene binding | Native scroll only; unmount/disable inspection before writes |
| Inspect | `sampleBendingActiveInspection` through the same binding | Explicit single pointer scalar; pause story updates until exit |
| Static | Chapter pose or poster | No motion loop; essential explanation remains in HTML |
| Future authored story | Existing application-owned Theatre adapter | Replace the procedural writer; never run both against one camera |

The current reusable abstract Theatre score was created for another scene and does not establish valid Thesis model framing. This implementation is therefore labeled **deterministic procedural camera proposal**, not a Studio-authored timeline. Theatre remains the selected system for future authored refinement: capture approved model-specific poses in local Studio, export real state and record the model revision, binding schema and clean-context replay. No fabricated or cosmetically renamed Theatre state is provided here.

## Verification and remaining integration checks

Run `node --test roles/animation-cinematographer/research/bending-active/camera-plan.test.mjs` from the repository root. Eight tests passed on 7 October 2026. The principal projection check uses the installed real Three.js `PerspectiveCamera` to project all bounds corners across 12 geometry/aspect combinations and 101 progress samples. Additional cases cover Z-up, reversibility, immutable plan input, chapter-static reduced motion, valid/invalid detail bounds, inspection framing and unequal DOM chapter heights.

These are camera math tests, not claims of inspected final-model pixels. The integration owner must inspect the converted real model at u 0, .30, .50, .70 and 1 on desktop and portrait; confirm frontal direction, perforations, silhouette contrast and meaningful source captions; test actual native scroll, explicit inspection handoff, reduced motion, resize, route re-entry, static fallback and idle demand rendering. Record the model hash and conversion metadata beside those captures. Physical devices, browser rendering and any production deployment are outside the evidence supplied by these unit tests.

### Actual assembled-model framing preparation

The conversion owner identified source mesh `03aa204e-af4c-4e84-9007-ac16d19c1ecc` in the supplied `Final_Model.3dm`, with 131,881 source faces. The file also contains fabrication layouts, hidden variants, a human layer and small analysis-marker meshes; those are not part of this shot contract. Keep the selected asset distinct from the whole source file and from the photographed final prototype.

The reported source bounds are `[-10900.048828125,-4758.4638671875,8.087958335876465]` to `[-8523.8388671875,-1658.038330078125,732.9448852539062]` in millimeters. The planned derivative centers original X/Y, grounds minimum Z, scales by 0.001 and maps `(x,y,z)` to `(x,z,-y)`. Its expected display bounds are `[-1.18810498046875,0,-1.5502127685546875]` to `[1.18810498046875,0.7248569269180298,1.5502127685546875]`.

`actual-model-checkpoints.mjs` records these conversion-owner measurements and produces five pose checkpoints for each of three frontal directions (0°, 30°, 45°) in desktop and portrait. A ninth test verifies the measured bounding corners in every checkpoint. These alternatives are for visual review, not three simultaneous camera writers. Start by comparing the 30° and 45° front variants: they can expose both the short and long edges of this low vault. Confirm the derivative's actual geometry, orientation and perforations before selecting one. No detail bounds have yet been verified; the final MAKE camera therefore retains the full assembled mesh.

### Actual GLB render review — 7 October 2026

The converted asset was subsequently loaded and rendered from `roles/uiux-designer/cases/bending-active-thesis/public/assets/assembly.glb`. SHA-256: `c56dfda835e6538ad360f76967ba65603ff48d055228a7d400a2293554bbb058`. Its 3,614,676 bytes, 84,626 positions, 131,881 triangles and measured renderer `Box3` agree with the conversion's `model.json`. The pose review does not independently validate the selected mesh against every object in the original 3dm; that remains the conversion owner's record.

The independent local Chromium harness rendered **18 actual geometry captures**: three front directions at five story progress values in 1280×800, plus three samples of the 30° variant in 560×800. `actual-model-captures.json` records the file hash, geometry counts, exact pose/bounds, per-image hashes and idle check. [The contact sheet](actual-model-contact-sheet.html) uses these real captures. The generated `shots/` and `render/` directories are local and ignored.

Six captures were directly inspected at full image size: the 0°/30°/45° openings, the 30° midpoint and end, and the portrait opening. The recommendation is **keep the 30° base direction** (`forward: [0.5,0,0.866025403784]`): the opening preserves a readable central arch and both wings; 45° lets the near panel obscure more of the inner opening; 0° emphasizes the short face. At u .50, the real perforations and the curvature across the front panels are clear. No camera crop is needed to invent an absent joint, and MAKE can return to the complete model beside real construction photography.

The portrait 560×800 capture fits the full shape but the useful geometry occupies only about 290×145 pixels. A mobile canvas approximately 320–380 px high is preferable to a full-height portrait stage; verify the actual page's available width and captions. The conservative bounding-box fit intentionally prioritizes retaining every extent. If future composition needs a closer frame, validate the actual geometry after adjusting it instead of applying an unchecked camera zoom.

The review harness uses a neutral silver material, room environment and simple lights. It reveals a noticeably bright, rippled surface. This is a display proposal, not measured optical reconstruction, and highlights should be checked again with the Artist's selected material in the integrated viewer. The harness runs no animation clock, reports no page errors and remains idle after each capture. This does not replace the main page's UI, scroll, reduced-motion or browser regression tests.

To reproduce the actual review from the repository root:

```sh
node roles/animation-cinematographer/research/bending-active/capture-model.mjs roles/uiux-designer/cases/bending-active-thesis/public/assets/assembly.glb
```

The helper builds only inside this research folder, starts a transient loopback server serving only its HTML/bundle and the explicitly passed GLB bytes, captures frames, then closes browser/server. It neither serves the raw 3dm nor uploads any source or derivative. The neutral capture material replaces the derivative material only in this isolated in-memory review scene.

## Primary technical references

- [Three.js PerspectiveCamera documentation](https://threejs.org/docs/pages/PerspectiveCamera.html): vertical field of view, aspect, clipping planes and projection updates. The module's perspective-fit implementation is original code, validated against the repository's installed Three.js runtime.
- [React Three Fiber on-demand rendering](https://r3f.docs.pmnd.rs/advanced/scaling-performance): use demand rendering and explicitly invalidate after imperative camera changes; no autonomous animation is needed at rest.
- [Theatre advanced uses](https://www.theatrejs.com/docs/latest/manual/advanced): advanced clock coordination exists, but this local static/procedural proposal does not require another RAF driver or fabricate authored data.

Research was checked on 7 October 2026. These sources support the implementation mechanics, not the thesis's scientific claims or the owner's preference selections. Existing skills and `cinema_catalog`/`cinema_browser` remain scoped to the Animation Cinematographer role; no new service is required for a pure geometry-dependent framing function.
