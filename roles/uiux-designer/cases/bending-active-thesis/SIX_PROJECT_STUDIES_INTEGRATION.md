# Six project studies — current integration contract

Date: 18 October 2026 (Europe/Berlin).
Status: source/CPU checks, the final 233-file/110-pin local export, 72 chapter
views, five supplementary mobile source-model views and 105 focused browser
checks are recorded. Final local integration checks are running. Exact-commit
CI and same-artifact live publication remain pending.

## Scope and evidence

[Decision 0016](../../../../docs/decisions/0016-three-fabrication-studies.md)
records the owner's six selected pages/cards and the later request to locate and
use their actual 3D source. This contract supersedes the image-only runtime and
three-case scope of [the historical checkpoint](THREE_PROJECT_STUDIES_INTEGRATION.md).
Its initial failures, image selection, browser evidence and dated acceptance are
retained rather than presented as proof of the expanded release.

The primary portfolio is the inspected 86-page 2025 VerFacade PDF, 22,624,290
bytes, SHA256 `61f51b38fdccf712f3e9460c5fdde2b9d117d6d2bd14d6e94b4ae3f9aa08c290`.
Current preparation records supplement it without becoming build dependencies.
Original PDF/CAD/Blender/robot files remain read-only. No private absolute paths,
raw preparation pack, full portfolio, robot program or restricted engineering
record enters the browser. English copy preserves the following boundaries.

| Study / slug | Content source and attribution |
| --- | --- |
| Mode/s of Making / `mode-s-of-making` | PDF physical pp.54–61 / printed49–56; NCKU studio, tutor Kane Yanagawa, Jan Kyselý's figure-specific photography. The 2018/2020 year conflict is retained. Matching Print-PDF image objects supply higher resolution only. |
| Entrance Installation Art / `entrance-installation-art` | PDF pp.6–13 / printed1–8; PKD Engineering Consultants. Scheme development, modelling and fabrication drawings are distinguished from Zhi-Yu Guo's 2D, Monita's structural and Peter Chen's employer credits, plus Fu Tsu Construction's commissioning context. Date/material/quantity conflicts are not silently resolved. |
| Dot-Based 3D Printing / `dot-based-3d-printing` | PDF pp.70–75 / printed65–70 and original Group1 presentation/source revision. Namdev Talluru and historical member JunJie remain credited; individual code/operation/media tasks and conflicting formula versions are not reassigned. |
| HC3DP Caustics / `hc3dp-caustics` | Final Group-Red presentation, slides1–27; no corresponding named chapter in the primary PDF. Paul Jaeggi / Behnur Baiju / Kevin Seav / JosHsuan Chao remain the team. Precise year and separate personal tasks are not inferred. |
| Special Assemblies / `special-assemblies` | PDF pp.62–69 / printed57–64 and Group6 records. Chia-Hsuan Chao / Kevin Seav / Megi Sinani are credited; collective work does not assign every algorithm or robot/media task to one person. |
| Project Caschlatsch / `project-caschlatsch` | [Official ETH project](https://masdfab.arch.ethz.ch/projects/2023-24/caschlatsch.html) and [2024 cohort/construction account](https://arch.ethz.ch/en/news-und-veranstaltungen/news-kanal/2024/09/how-humans-and-robots-built-a-wooden-tower-in-disentismustr.html); PDF pp.34–35 only corroborate the personal COMPAS XR improvement scope. Complete public cohort/research/partner/client/expert/sponsor credits remain in the record. Six public photographs credit Wataru Nomura; one original workflow uses public facts. No open photo licence is asserted and no restricted private CAD/engineering diagram is selected. |

## Public records and exact model identity

`release/project-studies.json` holds six native narratives, each with an opening,
four chapters and credits. Its **52,090 bytes** are pinned to SHA256
`e02c3205063d500ee1ba4968097112fa09eee2c32a39819d7248a5aa35f08706`.
`release/project-assets.json` records all **42 WebPs and five GLBs**, selected
sources, authorship, processing and limits: **95,226 bytes**, SHA256
`ba192fa51e8b460886fc6f9fb398c8b55aec6e3929823fcafc2dcb685a199e4c`.
The release has **110 asset pins**. Metadata, byte hashes, decoded image sizes
and actual model declarations are audited before copy and in the built export.
Builds read this explicit repository-local allowlist, not the preparation drives.

| Model | Exact GLB SHA256 / bytes | Actual decoded geometry |
| --- | --- | --- |
| Mode/s | `0a6963f5a206d0dc11b5fd9b0d9fc5e2a09085058d86bca62f3fb435a237cee0` / 13,987,056 | 699,860 vertices / 1,026,294 triangles / 1 mesh |
| Entrance | `cb7b5ea27a47c9451bd4220c835fb158aa3e65be19deff684f40eb076c43376c` / 18,828,876 | 897,015 vertices / 997,599 triangles / 1 mesh |
| Dot | `60d49fe978cf0fb552c39f7188a9811dc39aa2e163b3a3388b192dbae502e891` / 122,884 | 14,810 original samples / native points / no solid triangles |
| Caustics | `0dd22b441c422f2a9c2406d79288284ee7fc56f1f3028ae453015b3add40bb4a` / 50,438,508 | 1,894,748 vertices after normal/UV seam splits / 2,360,266 triangles / 1 mesh |
| Special | `43de5ca2dd8095a125d7f29e58851b5a80dc9588625912918d75dbadae8e28df` / 117,672 | 2,040 vertices / 3,840 original triangles / 60 meshes |

All five declare meters / Y-up and pinned transformed bounds. No model is
decimated, deformed or replaced by procedural lookalike geometry. Four use
byte-exact meshopt compression without quantization or reordering; Special is
uncompressed. The following source selections define what is actually shown.

- Mode/s uses all 800 original visible normal-mode meshes in
  `HeatRotateCuttingSimulation.3dm`, source SHA256
  `3259a6ac24d82757d92f4ba06c956b451950c062869b103f5ed866bed8effd6f`.
  Hidden alternate studies and two points are excluded by source state.
- Entrance uses all 2,245 visible normal-mode Breps in the original ver03 scheme:
  600 panels, 1,620 fixings, 23 pipes and two original column/base solids.
  Source SHA256 `56df16f327bb0061024b53e4ea1b9aea3cb1cc28189d36669cdb6712af29abbc`;
  text/dimensions are excluded. This scheme is not asserted to certify the built
  installation or resolve the portfolio's material/version discrepancies.
- Dot uses every `velocity=2` record in Group1's `out_printpoints.json`, source
  SHA256 `affe5abbde9b3160596cf69994020c002687a4613a08d5e970c59db7312e9437`,
  revision `da8f34bacd8e4aab22a290fab013206ec10d191d`. These **14,810 points**
  are recorded path samples, not an inferred finished surface. The source robot
  wrapper establishes mm-to-m conversion; it is read for evidence, not executed.
- Caustics selects the complete visible `Lamp_mesh.001` from
  `Four Lamps_Simulation_1.blend`, source SHA256
  `a0017b6531d671f14dadcd781e19607609929c01dfea00391b05b17302be346a`.
  It excludes room/props/fog/other lamps and scene lighting by object identity.
- Special selects all 60 explicit `Part.shape` meshes from `stick_assembly.json`,
  source SHA256 `f95ec30b3656f4838fa5d785a0e30c2cbb85d7a324fe91dedd5ff5e2fce54128`.
  World-coordinate shapes are not transformed again by their metadata frames.
  No cylinders, faces or final as-built configuration are inferred.

## Source proofs and material limits

Special's v2 unit correction has a direct same-file consumer chain:
`202_plan_motion.py` line25 selects `data/stick_assembly.json`, line29 imports the
helper and active line35 calls `scale_and_move_to_point`. In `scripts/helpers.py`,
line42 defines that function and line45 states `factor = 0.001 # 1mm to M`.
Those original files were read, not run. The web derivative applies that uniform
scale and Y-up conversion, excluding the robot-cell translation. Its positions,
normals and indices remain byte-identical to v1's payload; only the verified root
scale changes. Maximum source float32 position error is
**1.5255199002695008e-8 m**, with additional axis recomposition roundoff at most
**9.974659986866641e-17 m**. The ignored source/proof is
`animation-review/.local/three-projects/special-model-v2/conversion-provenance.json`,
SHA256 `38e4911f9723c105a5547248f0a77588c1e2d148debc92486a5b86098404ada5`.

Caustics has an independent Blender 4.0.2 CPU reread with autoexec disabled,
no render/save and confirmed process exit. Source SHA before/after is exact.
All **2,360,266 oriented triangles** match the actual final Three decoder;
all **7,080,798 triangle-corner UVs**, after the standard V flip, match exact
float32 tuple bytes. Maximum world-position error is **1.217454592664719e-15 m**;
bounds/extents are exactly equal. The ignored
`caustics-model/independent-audit/independent-assessment.json` under the same task
folder has SHA256 `372ce66bbfd6d237e379230816237fe5a018a139a91a5874488ea88c65959189`.

This proves source geometry/UV, not an equivalent optical shader. Export retains
the original material's metallic/roughness/alpha/transmission scalars, but Three
uses **IOR 1.5**, while the source Principled field is **1.5700000524520874** and
connected to a view-dependent graph. Procedural Noise/Mapping/Bump and associated
IOR/emission links are not graph-equivalent in glTF. Photographed caustics remain
the physical evidence; the web model is not a new caustics solver. Normal-buffer
compression is independently byte-exact; this audit does not separately assert
native corner-normal equivalence or rendered-pixel equivalence.

## Runtime and event closure

`ProjectCaseStudyStage` only registers an SSR-declared host and approved model
descriptor through `ProjectStudyStageRegistry`. `ProjectStudyScenePresenter`
owns preparation, chapter/gesture requests and terminal cleanup. The imperative
`components/project-study-scene.mjs` alone owns its project renderer and camera.
`SiteBackgroundDriver` invokes it on the existing ordinary-page demand scheduler
and Layer 1 lease; no autonomous RAF, second clock, per-frame React state, new
background owner or competing Bending/XR camera writer is introduced.

Readiness follows **fetch → exact bytes/SHA → actual GLTF primitive/counts and
transformed bounds → every source renderable's `onBeforeRender` participation →
successful real paint → required-page readiness**. An empty/decorative draw cannot
satisfy entry. The existing **15-second** preview/site startup boundary resolves
to a real model or explicit static terminal. Reduced Motion, Save-Data,
unavailable WebGL, hidden pending arrival, failure and timeout close partial work;
the static latch rejects late model upgrades. No-JavaScript retains native images,
headings, links, anchors and readable text.

Chapter selection is native scroll geometry. Finite entry/exit borrows the
existing Bending durations, keeps a single camera writer, and closes superseded
requests as cancelled. Drag/key inspection requires the source to be ready,
painted and held in an allowed chapter. Native vertical touch scrolling wins;
release, cancellation, lost capture, blur, chapter change, pause and disposal close
the gesture. Pause affects decoration, never document scrolling or reading.
Ready resources remain resident off chapter, hidden/frozen and in persisted
BFCache; suspension stops active time. True page exit disposes the renderer,
geometry/material/texture resources, requests, observers, listeners and lease.

Shared project chrome, three glass controls, native six-anchor structure,
InformationSkin, source image proportions and OCR/Space typography remain.
Caschlatsch has no model registration or claim to publish its restricted CAD.
Home/Projects contain eight real cases within the nine-cell minimum, retaining
the original prepared live Bending card and model-free introduction.

## Protection and acceptance checkpoint

The 24 protected Bending scene modules and prior Bending/XR source presentation
remain unchanged. Of the preceding 63 asset pins, **61 remain exact**; only the
explicit OCR proper-name font/notice amendments change those two pins. OCR 2.003
preserves all 158 preceding GIDs/outlines/programs/metrics/cmaps and adds é/è;
[the typography record](OCR_TYPOGRAPHY_INTEGRATION.md) supplies exact pins/proof.
The reusable `src` framework and generated empty entries remain unpopulated.

Completed local evidence at this checkpoint:

- Exact Node **24.19.0** / pnpm **11.19.0** `pnpm check` exits 0; raw
  `animation-review/.local/three-projects/pnpm-check-six.log`.
- All **9 new CPU regressions** pass, covering registration, actual-source first
  draw, finite/reversed chapter closure, static failure/late upgrade, context loss,
  retention/BFCache, single-clock composition and real GLTF primitives;
  `stage-bounds-cpu.log` in the same ignored folder.
- The selected release builds/audits **233 files / 110 pinned assets**. This is
  distinct from the empty framework's build/audit and from a successful CI gate.
- The first six-case native capture passes **72 views**: six chapters × six
  projects × desktop/mobile, with genuine first-draw inspection, viewport/source
  checks, one driver clock, no page errors and no failed/pending requests.
  Raw `six-native-2026-10-18T20-12-57.334Z/results.json` is preserved, SHA256
  `3712dc411666cbef3278b408b06ce2d4473b81c53d020a82f329494150b49e38`.
  This is operational evidence, not final visual acceptance: subsequent screenshot
  review prompts a mobile camera-slot change from 0.32 to 0.42 and a rebuilt
  233-file/110-pin artifact; supplementary views remain pending at this writing.
- The subsequent focused study/typography suite passes **105/105** in **7.7 min**:
  **35 each** in Chromium, WebKit and mobile Chromium. Each profile runs six
  native project cases, six no-JavaScript cases, seven failure/interaction/policy/
  context-loss/history cases and sixteen typography/header cases. Coverage
  includes native source inspection, static-arrival latching during a delayed
  source response, HTTP recovery without late upgrade, context-loss cleanup and
  a real history return with one background lease. Raw
  `animation-review/.local/three-projects/browser-six-studies-fonts.log` is
  **19,636 bytes**, SHA256
  `253ff854bd59b980f89abf63fb34d0b8f1214c8fa0fcb40cd4f42b9527ce8440`.
  This completed run applies to its tested artifact; it is not CI, live or
  physical-device acceptance.

After that run, `components/project-study-scene.mjs` changes retained ownership
from the complete parsed GLTF result to `gltf={scene:parsed.scene}`. This keeps
the scene needed for presentation/disposal while allowing parser and compressed
body/cache references to become collectible. The final local build and subsequent
five-source native mobile capture below exercise this change. They do not
establish observed garbage collection, a measured heap reduction or
physical-device memory safety.

At 20:37 UTC, the final local `pnpm build:pages` again audits **233 files /
110 pins** (`build-six-final.log`), and `pnpm check` exits 0
(`pnpm-check-six-final.log`). A supplementary native capture uses the actual
390×844 mobile document at DPR 3, scrolls the five real source-model controls
into view, and records **1170×2532 PNGs**. All five source revisions, vertex
counts, complete source first draws, full-viewport canvases and the single
background lease match; there are no page errors and the artifact digest is
unchanged. Its raw record is
`animation-review/.local/three-projects/mobile-model-first-2026-10-18T20-37-46.061Z/results.json`.
The original 72-view capture and these supplementary views remain separate
receipts because the camera/retention revisions differ.

The root reviewer inspects all twelve desktop/mobile six-chapter contact sheets,
the selected full-resolution desktop model chapters, all five supplementary
mobile model-first PNGs and the native Caschlatsch opening. The source models
are whole and clear of fixed navigation in the mobile visual phase; original
photos/diagrams retain their proportions, and the later reading phase keeps
native scroll rather than freezing the document. This is browser-emulated
visual acceptance, not physical-device certification.

The final Pages inventory is **114 unique cases × three profiles = 342
executions**, in 21 spec files, collected with the pinned local CLI without
launching browsers. A final 114-execution local study/Home/background/preview
integration run is in progress; no result is claimed here before completion.

Pending: completion of that final local integration run, exact-commit CI gate,
same-artifact deployment and live route/byte/native verification. The 105
completed checks and earlier native/history receipts remain preserved; earlier
three-case or published-release receipts do not satisfy the remaining stages.
