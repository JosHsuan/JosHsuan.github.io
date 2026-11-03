# Portfolio scale, camera and light review

3 November 2026. Cinematography implementation handoff, coordinated directly
with the Scene Designer / source-preparation role. This records source checks
and portable acceptance; it does not establish browser, physical-device or
publication acceptance.

The owner requests continuous motion, architectural scale for Entrance and
Caschlatsch, the real Mode/s machine, and Bending-quality material, camera and
lighting continuity across projects. These explicit directions supersede the
older fixed-lens, no-Caschlatsch-model and focus-stops-idle presentation rules
within this revision. Original source files, exact source geometry, factual
credits and the established clock/camera ownership remain intact.

## Scale and shot design

The previous five generic camera paths all used a 36-degree FOV and 1.04 fit
multiplier. Entrance's positive pitch placed the camera at world Y 7.405 m
at its first pose and 11.530 m at its last pose, looking downward to Y 4.425 m.
That viewpoint made an architectural subject read like a tabletop study.

Scene review confirms these actual decoded mesh extents in metres, Y-up:

| Source | Width × height × depth | Source boundary |
| --- | --- | --- |
| Entrance | 4.732 × 7.850 × 4.729 | Original merged panels, fixings, supports, core and base; lowest point Y 0.5 |
| Caschlatsch | 4.233 × 7.786 × 4.222 | Complete stored structure meshes; source-relative bottom Y 0 |
| Mode/s machine | 0.504 × 0.261 × 0.500 | Clean assembled machine; source-relative bottom Y 0 |

Caschlatsch and machine dimensions come from the preparation role's decoded
derivatives, not loose underlying CAD surface bounds. The camera never rescales
or reorients these source assets. The scene role agrees on a restrained contact
receiver below each tall source's actual lowest point; there are no invented
people, architectural surroundings or plinths.

The following authored keys are `(yaw radians, pitch radians, slot FOV degrees,
fit multiplier)`:

| Source / passage | First | Middle | End |
| --- | --- | --- | --- |
| Entrance, Context → System | `.58, -.14, 42, 1.06` | `.82, -.09, 36, 1.04` | `1.08, -.035, 32, 1.05` |
| Caschlatsch, Context → System | `.62, -.14, 42, 1.06` | `.90, -.08, 36, 1.04` | `1.14, -.025, 32, 1.05` |
| Mode/s machine, Mechanism | `.56, .26, 38, 1.06` | `.82, .34, 34, 1.04` | `1.02, .40, 32, 1.06` |

The tall-source keys establish a low eye line and slowly rise while the lens
narrows. Existing exact support fitting compensates the camera distance before
the single writer publishes the final pose. Entrance starts 1.624 m above its
source base, then rises to 2.271 and 3.225 m. Caschlatsch starts at 1.673 m,
then rises to 2.476 and 3.410 m. These computed values agree at 1440×900 and
390×844 because the complete sources are height-limited in both compositions.
Portable checks also cover 320×568. These are editorial camera heights relative
to the model bottom, not a claim about surveyed site coordinates.

The remaining paths retain their recognizable source angles with differentiated
lens travel: Mode/s unit 38→34→32→36 degrees; Dot points 38→34→36; HC shell
40→34→30; Special Assemblies 38→34→32. Angles and lenses interpolate through
the existing reversible camera sampler. Original `model.views` remain reference
recipes. Large sources alone receive the bounded lower pitch limit of -0.16.

The scalar FOV describes the subject slot. The full-viewport camera expands it
and applies an off-centre view offset; it is therefore not advertised as a
fixed physical focal length. Three's focal-length conversion depends on FOV,
film gauge and aspect. [PerspectiveCamera source](https://github.com/mrdoob/three.js/blob/dev/src/cameras/PerspectiveCamera.js)
documents that relationship; the repository's installed version remains the
implementation authority.

## Bending-aligned scene grammar and tradeoffs

Every generic triangle source uses one environment and a warm key / cool fill
and rim. Material clones preserve original assignments and are restored on
disposal. The machine has its own neutral metal profile, separate from the
Mode/s unit study. Caschlatsch uses matte warm timber without invented grain.
Entrance uses a satin metal response. These are editorial display finishes,
not measured source-material coefficients. HC keeps its original physical
channels; Dot remains all 14,810 genuine point samples without invented solids.

The appearance lease samples a closed 24-second light loop from caller-supplied
active seconds. Fill, rim, their energies and environment orientation respond;
the key's position stays fixed. PMREM bakes only once per acquisition. The
ordinary-page presenter supplies time at 24 samples per second; the appearance
lease samples the slower light sweep at 12 Hz (288 samples per cycle). This
reduces repeated opaque-source draw submissions during idle light changes while
camera direction changes remain immediate and HTML transforms retain their
existing cadence. Focused reading
does not stop visible motion. Camera fits are cached separately from light
redraws, so changing light never refits unchanged geometry.

Entrance and Caschlatsch receive a transparent `ShadowMaterial` ground receiver
below their actual source bottoms and one cached 1024-pixel contact-shadow map.
Only the initial static-source draw updates that shadow. This keeps a real
grounding cue without rendering million-triangle shadow maps every frame.
The appearance lease restores original cast/receive flags and renderer shadow
settings, and releases its receiver, light maps, clones and environment exactly
once. The receiver never enters source bounds, hit tests or readiness counters.

Physical materials have feature-dependent per-pixel cost, which motivates using
ordinary PBR for opaque subjects and retaining transmission only where the source
requires it. [MeshPhysicalMaterial source](https://github.com/mrdoob/three.js/blob/dev/src/materials/MeshPhysicalMaterial.js)
supports this cost distinction. Actual throughput and the chosen 12 Hz light
cadence still require built-browser measurement; no hardware FPS is claimed.

## Source continuity and implementation ownership

`createProjectStudyModelCollection` in `ProjectStudyScenePresenter.mjs` supports
nonoverlapping primary/additional model chapters. Mode/s retains its unit model
through Context and System, selects the actual machine in Mechanism, then returns
to original film material in Making. The backdrop keys each source by its own
SHA. It asks the collection to prepare only after the outgoing source is outside.
The collection disposes the old actor before acquiring another, uses the matching
poster, cancels superseded work and retains at most one model renderer. Reverse
reading follows the same transaction. No RAF, camera writer or media clock is
introduced. Returning to a previously disposed model reacquires it from cached
public bytes; this trades switch latency for bounded GPU residency.

The owner's later 3 November direction replaces the first Home fit-all orbit
with source-scale, partial architectural photography, described below. Project
pages still fit their complete original sources. The Home presenter supplies
time; the scene module does not schedule the film loop itself.

## Actual local checks and remaining acceptance

XR keeps the original bamboo material and the shared Bending cyclorama recipe.
Its assembly path now narrows 38 → 34 → 32 degrees with conservative fit margins
1.05 → 1.04 → 1.05. The camera still fits the actual prepared source vertices,
including inspection offsets. In Method, XR's existing two area lamps stay in
the source frame: a 10% broader key at 94% energy and a rim at 112% energy expose
changing bamboo edges as the camera orbits. Phone chapters retain their separate
optics and camera-relative set. This is an XR-owned score adjustment; it does not
mutate the Bending recipe, original bamboo material, source geometry, recorded
screens or source transforms. The scene adds no lamp or shadow pass. Independent
handheld remains a compositor pan/roll, so idle motion requires no extra source
fit or WebGL draw. Reading focus keeps the live scene; a locked model gesture
smoothly attenuates handheld. Real visibility, entry and resource failure remain
lifecycle gates. OS preferences do not stop motion; forced colors can still
select opaque control materials.

- Node 24.19.0: 88/88 focused appearance, camera, camera-score, scene and backdrop
  tests passed; zero skips. Checks include every primary/additional model's
  conservative source box at desktop and two mobile sizes, inspection extremes,
  both architectural eye lines, closed lighting, exact source-resource restoration,
  Home composition and actual backdrop/collection reversal with late acquisition.
- Explicit scoped ESLint passed on all eight changed production/test modules.
- The later 12 Hz light-only refinement passed 24/24 focused appearance/camera
  checks, including 24 Hz caller deliveries, unchanged camera fits, and immediate
  camera-yaw light response between time samples. No source geometry is reduced.
- The seven continuous-mode lifecycle test files passed 146/146 checks, zero
  skips. They retain real native media readiness, failure deadlines, hidden/freeze
  and BFCache suspension, stale completion rejection and one-frame ownership.
- XR director, actual-source camera, environment and prepared renderer tests
  passed 36/36 checks, zero skips. The new lens check projects all 96,312 pinned
  vertices at five path samples, three viewport sizes and three inspection
  offsets; environment checks verify stable world-space lamps and no additional
  shadow maps. The 18 director checks also belong to the 146-check lifecycle set.
- Scoped ESLint passed on both XR production modules and the nine changed
  lifecycle/camera/environment test modules.
- Source JSON changes by this role were limited to the five existing
  `cameraPath` fields. The source role integrates new model data and pins; the
  integration owner updates manifest hashes and performs the complete build.
- Actual shadow pixels, steel/timber legibility, no washed-out highlights,
  architectural contact cues, inter-model entry/exit, 12 Hz light delivery cost,
  full Home montage and browser/device acceptance remain to be checked against
  the final built artifact. Portable tests are not visual approval or release.

## Home film direction after the owner scale correction

HomeShowcaseShots.mjs now authors seven source scores through
createHomeShowcaseShotPlan({id,model}). The existing Home presenter supplies
seconds and aspect to plan.sample; the score owns no timer or RAF. Eye and
target coordinates resolve to real metres. A 36 mm film gauge and the current
viewport aspect determine the final vertical field of view; focal length is
checked against the final Three camera, including portrait crops.

| Source | Duration | Authored viewing sequence and lenses |
| --- | --- | --- |
| Entrance | 18 s | 1.65 m pedestrian approach, upward panel field, folded-surface detail, upper-surface traversal, canopy rise; 24 / 28 / 55 / 45 / 35 mm |
| Caschlatsch | 20 s | 1.65 m ground view, lattice approach, view through timber layers, upper-lattice crane, side return; 28 / 35 / 70 / 55 / 35 mm |
| Mode/s machine | 16 s | Machine context, working envelope, workpiece detail, knife-side traversal, return; 50 / 55 / 85 / 70 / 55 mm |
| Mode/s unit | 14 s | Unit context, formed profile, foam-surface detail, lateral surface traversal, return; 55 / 65 / 90 / 75 / 55 mm |
| Dot-based printing | 12 s | Point assembly, depth between layers, individual deposition field, traversal, return; 50 / 60 / 80 / 70 / 50 mm |
| HC3DP Caustics | 16 s | Transparent form, transmission profile, optical surface, edge-light traversal, return; 50 / 60 / 85 / 70 / 50 mm |
| Special Assemblies | 16 s | Timber assembly, curved profile, upper-member overlap, layer traversal, return; 45 / 55 / 75 / 65 / 45 mm |

This role directly reviewed the Entrance hero photograph: its upward, cropped
panel field communicates building scale more effectively than a high full-model
orbit. The Caschlatsch portfolio photograph shows an open timber tower; the scene
role's interior reference motivates looking through successive timber layers.
The Special Assemblies photograph shows real overlapping sticks beside the
robotic arm, motivating member-level views without adding an invented robot or
site. Architecture targets describe surface fields and void/lattice regions,
not certified individual joints: Entrance's source axis is approximately
[1.01841, y, -.99272], with lower/middle/upper regions at y=2.0/4.4/6.6 m;
Caschlatsch uses [0, y, 0] at y=3.7/6.2 m. The source role verified the machine
workpiece target [-.08755,.155,.17928] m and knife interaction target
[-.00978,.15,.0834] m. Its half-metre instrument scale is retained.

Eye/target/lens/light joins use a quintic ease with continuous velocity and
acceleration at authored keys. Only the outer existing presenter performs
inter-project fade and source exchange. The score sends restrained key, rim,
environment and fill/rim-sweep cues to the scene-owned material rig. It does not
move the fixed contact-shadow key or add another shadow pass. Small subjects
receive product/macro views; architecture receives ground-level approach and
crane views. No source is forced to keep its entire silhouette in frame.

The project-study scene accepts showcaseShot only in Home presentation. It
waits for that shot before any source draw, even if resize arrives first, then
writes the explicit camera directly. Its source readiness check compares the
actual camera frustum with the source objects expected to draw; valid cropping
of Special Assemblies' 60 objects is allowed, but an empty or decorative-only
frame cannot acknowledge readiness. Project-page full-source checks remain
unchanged. Original geometry, source transforms and asset bytes are retained.
Responsive resize applies the new source-space shot and viewport atomically;
the renderer never paints a new-aspect shot against the previous dimensions.

The Bending connection-detail photograph was also reviewed: broad silvery
highlights and cut-hole edges support retaining the existing satin benchmark
(roughness .58, anisotropy .35) and area-light stage. The photograph does not
justify claiming measured coefficients or adding a fabricated wear texture.
No Bending material edit was made.

The later Home planner/renderer and scene/backdrop integration passed 65/65
focused portable checks, zero skips. This includes all actual pinned source
vertices at 126 Home camera samples (seven sources, nine times, desktop/mobile),
meaningful visible source in every sample, genuine partial crops for every
source, exact physical focal-length agreement, initial shot-before-first-draw,
expected-frustum participation and rejection of empty or decorative-only paints.
The responsive renderer check also verifies exactly one correctly projected
draw per viewport/shot update.
Scoped ESLint passed on the four changed production/test modules.

The current Chromium Bending run completed 24/27 checks. Three test migration
errors were corrected for a later rebuilt-artifact rerun: comparison clicks keep
autonomous time, decoded image layout uses untransformed dimensions, and the
inline geometry image belongs to System. The run verified original-source
framing, absence/return, native input, actual source failure/context loss,
failed-script/no-JS reading, and lifecycle suspension; it is not a green release
gate. No further browser run was started before the consolidated build.

On consolidated artifact `ab5d1d4178236ccbdc0c0faa134993582e94bcf5ac1c8b9b22c2004a18f259a4`,
the Chromium Home collector passed the complete seven-source sequence and return
to Entrance. An observer installed before page code records each ready receipt
in a single browser frame; it does not control runtime time. All seven midpoint
receipts contain actual source geometry, varied authored lenses and partial
coverage. Special Assemblies correctly draws 55 frustum-visible objects rather
than requiring all 60 in its detail crop. Maximum observed Home canvases was one;
there were no runtime failures or page errors. The inline-image motion check also
passed. The comparison-click test passed after observing the actual pointerdown
source rather than a host snapshot that autonomous playback could supersede.

The remaining entry-readiness case exposed a real lazy-image layout defect:
with fonts already loaded, the Connection figure grew from 307 to 353 CSS pixels,
its image from 287 by 586 to 333 by 680, and its chapter from 1000 to 1079 after
decode. A separate built-page CSS experiment with an explicit 100% figure width
kept all before/after native dimensions equal while retaining the final image
size. This evidence was sent to the root integration owner for the production
layout fix and a rebuilt-artifact rerun; the test tolerance was not relaxed.
