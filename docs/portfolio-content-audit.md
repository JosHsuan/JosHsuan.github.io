# Portfolio content audit and presentation proposal

Reviewed September 27, 2026. This is a content-planning document based on the owner's supplied local portfolio and repositories. It does not authorize website implementation or publication of source material.

Current status: on September 30, the owner authorized completion of the personal website and publication on GitHub. [Portfolio release](portfolio-release.md) records the resulting scope, editorial decisions and verification. This audit remains the source inventory and historical proposal.

## Findings and editorial scope

The inspected material supports **15 main projects and 4 short studies**, after consolidating portfolio versions and related repositories. One additional project appears in the CV but lacks a substantial inspected case package. These are editorial presentation units, not counts of folders, applications, or independently verified finished products.

The common thread is computational design connecting digital interaction, material behavior, and fabrication. A balanced cross-disciplinary portfolio is the working assumption while the owner's preferred audience remains open. The proposed categories, featured selection, and page structures below are recommendations made under the owner's request to assess the material and recommend its presentation; they are not individually confirmed design decisions.

Recommended launch scope:

- Six featured cases, selected from the 15 main projects, with fuller explanations.
- Nine additional main projects available through the complete work index, initially with concise case pages.
- Four short studies in a lighter Lab gallery.
- One CV-only lead held outside the ready inventory until supporting material is located.

## Source register and review method

Source folders were inspected read-only. No source project was built or launched, and no Unity, XR hardware, acoustic, geometry, manufacturing, or deployment behavior was independently tested. Code and documentation establish the presence and intended role of components, not their production readiness or the owner's sole authorship.

Portfolio text was extracted and compared across versions. The main 2025 portfolio's project pages and the facade edition's three additional cases were rendered and visually reviewed. Five EchoXR artboards were also rendered. Presentation media were inspected through the PPTX package, frame counts, and representative GIF frames; complete playback quality has not been evaluated.

All page references below are **one-based physical PDF pages**, not printed footer numbers.

| Key | Local source | Use in this audit |
| --- | --- | --- |
| P25 | `C:/Users/JosHsuan/Desktop/JosHsuan_CV_2022/PDF/JosHsuan_CV&Portfolio_2025.Ver2.pdf` | Main inventory. Text reviewed across 70 pages; project pages 6–69 visually reviewed. |
| F25 | `C:/Users/JosHsuan/Desktop/JosHsuan_CV_2022/PDF/JosHsuan_CV&Portfolio_2025.VerFacade.pdf` | Facade inventory. Text reviewed across 86 pages; additional cases on pages 14–29 visually reviewed. |
| P-old | `C:/Users/JosHsuan/Desktop/JosHsuan_CV_2022/PDF/JosHsuan_Portfolio.pdf` | Earlier 34-page portfolio; chapter comparison and metadata reconciliation. |
| P150 | `C:/Users/JosHsuan/Desktop/JosHsuan_CV_2022/PDF/JosHsuan_CV&Portfolio_2025_150dpi.pdf` | Version comparison; not an additional work collection. |
| E-art | `C:/Users/JosHsuan/Desktop/JosHsuan_CV_2022/EchoXR00.ai` through `EchoXR04.ai` | Five PDF-compatible artboards, visually reviewed for setup, interactions, and demonstration images. |
| Deck | `C:/Users/JosHsuan/Desktop/JosHsuan_CV_2022/T3_Interview.pptx` | Seven embedded animated GIFs associated with slides 2, 8, 9, and 11. |
| Materials | `C:/Users/JosHsuan/Desktop/JosHsuan_CV_2022/Materials` | Supporting project images, diagrams, and working-file inventory. |
| Echo | `C:/Users/JosHsuan/Documents/GitHub/echoXR` | README and selected tracking, networking, and voice scripts. |
| MoCap | `C:/Users/JosHsuan/Documents/GitHub/MAS_T3_MoCap` | Selected custom MoCap/MQTT scripts, geometry conversion code, and modeling-file inventory. |
| Woodflow | `C:/Users/JosHsuan/Documents/GitHub/StrongbyForm` | Related repositories' READMEs, development status, selected source, and explanatory diagrams. |

This was a targeted review of the work material, not an exhaustive inspection of every archived binary or document. Personal-information folders and unrelated people's documents were excluded. Raw source extracts and review images remain outside this repository; no source portfolio images or company documents were copied into it.

## Main project inventory

The following primary categories account for all 15 cases. Later filters can use overlapping tags without duplicating projects. Titles are normalized editorial labels and should be reconciled with preferred official titles before publication.

| # | Project | Primary category | Case focus and existing evidence | Source |
| --- | --- | --- | --- | --- |
| 1 | EchoXR | XR & Interaction | Collaborative VR architectural-acoustics exploration. Existing artboards show tracking setup, hand interactions, room states, and headset use. Code includes OptiTrack integration, networked state, and voice components. A recorded acoustic comparison has not been verified. | E-art; Echo |
| 2 | XR-assisted Bending-Active Assembly | XR & Interaction | MAS thesis linking motion capture, material deformation, adaptive geometry, and XR assembly guidance. Show the physical change beside the corresponding digital update. Photos, system diagrams, interface images, and two animated GIF sources are available. | P25 pp. 6–13; MoCap; Deck slide 2 |
| 3 | Woodflow / Strong by Form | Computational Tools | One program case covering the geometry foundation, product representation, and development workflow. Source and explanatory diagrams support a technical narrative. Public-facing scope and a suitable demonstration example still need selection; roadmap items must be distinguished from implemented components. | Woodflow |
| 4 | Project Caschlatch | Fabrication & Materials | A full-scale collaborative timber project with documented contributions to COMPASXR module selection and assembly guidance. Built work, computation, fabrication, site assembly, and app GIFs can form one coherent case. | P25 pp. 14–21; Deck slides 8–9 |
| 5 | Bending-Active Metal Panel Deformation | Fabrication & Materials | Individual research connecting target geometry, Miura-based representation, prediction, and physical panel behavior. Rich prototype, parameter-study, connection, and deployment imagery. | P25 pp. 22–29 |
| 6 | Mode/s of Making — Heat Rotate Cutting | Fabrication & Materials | A custom digitally controlled heated-cutting apparatus and its material results. Hardware diagrams, fabrication setup, toolpaths, and prototypes support a process-led case. | P25 pp. 30–37 |
| 7 | Special Assemblies — V-Shape Modular Based Aggregation | Fabrication & Materials | Reciprocal stick aggregation, robotic sequencing, and assembly. Use the physical result with a short robot sequence and a simple planning diagram. | P25 pp. 46–53; Deck slide 11 |
| 8 | Printing Architecture — Dot-Based Non-Planar 3D Printing | Fabrication & Materials | Toolpath and deposition experiments producing textile-like surfaces. Macro photographs and two animated printing sequences are especially useful. | P25 pp. 54–59; Deck slide 11 |
| 9 | Inside Out | Fabrication & Materials | Workshop-scale form finding, differential tiling, and physical assembly. Prototype photographs and unrolling diagrams support a concise collaborative case. | P25 pp. 60–63 |
| 10 | Entrance Installation — Taichung Nan Shan no.6 Square | Architecture & Facades | A professional fabricated installation. Lead with the built result, then explain the owner's scheme development, 3D modeling, and fabrication drawings within the team. | P25 pp. 38–45; F25 pp. 6–13 |
| 11 | Kaohsiung Port Terminal — Lobe-D | Architecture & Facades | Facade coordination and drawing workflows for a defined part of a larger building. Explain the owner's Lobe-D/interface and specified facade-system scope rather than implying authorship of the entire architecture. | F25 pp. 14–19 |
| 12 | Dome Tessellation Study — Taiwan ChinPaoSan Necropolis | Architecture & Facades | Geometry analysis, panelization, deviation, and cost-related studies. Present this as a bounded design-development contribution; construction delivery of the whole project is not established by this review. | F25 pp. 20–23 |
| 13 | Church of Hyatt Regency Jinshan Resort | Architecture & Facades | Facade geometry optimization and marble panel-system studies under project constraints. Renderings, panel/deviation diagrams, sections, and construction images support the story. | F25 pp. 24–29 |
| 14 | Mesh Subdivision — Stare at the Silence | Generative Studies | A geometry study using subdivision and detailed visual output. A compact image-led case can explain the rule and its effect. | P25 pp. 64–65 |
| 15 | Generative Art — Planet of Colorful Garden | Generative Studies | A separate generative project involving branching, vegetation-like geometry, and variation on a three-dimensional surface. Show the rule, a small family of variations, and the final colored composition. | P25 pp. 66–67; `Colour_Planet.ai` in the portfolio root |

Category totals: XR & Interaction **2**, Computational Tools **1**, Fabrication & Materials **6**, Architecture & Facades **4**, Generative Studies **2**.

## Short studies and reserve material

| Study | Suggested Lab presentation | Source |
| --- | --- | --- |
| Enter the Void | A short gallery pairing the gyroid lamp with the fabrication principle and collaboration credit. | P25 p. 68 |
| Puff Waffle | A small sequence explaining differential growth, inflation, and the resulting spherical composition. | P25 p. 68 |
| EggShell | A close-up of the printed shell with a path diagram explaining the continuous fabrication logic. | P25 p. 69 |
| F5 | A brief workshop entry about collective robotic construction, with explicit participation and team credits. | P25 p. 69 |

The CV also lists **Reinterpretation of Refinery — Turning Brownfield into Urban Habitat: A Case Study of Kaohsiung Refinery** (2017, P25 p. 3). Keep it as a reserve lead until project drawings or a case package can be located. It is not included in the 19 supported presentation units.

### Deduplication decisions

- MAS_T3_MoCap supplies technical evidence for the XR bending-active thesis already in the portfolio. It is not a second project.
- StrongbyForm's `woodflow-core`, `woodflow-dev`, `woodflow-core-roadmap`, `woodflow-docs`, and `cloud-infra` belong to one proposed Woodflow program case. They can become chapters where useful, not five automatically separate portfolio entries.
- The facade edition adds three main cases beyond P25; its other repeated work is not counted again.
- Older editions, compressed PDFs, and alternative artboards do not create additional projects.
- `Colour_Planet.ai` belongs to Planet of Colorful Garden. That project is distinct from Stare at the Silence; visual review confirms separate content.
- Third-party frameworks, plugins, and example assets inside repositories are dependencies, not additional authored works.

## Proposed featured selection

These six cases balance interactive systems, computational tooling, research, and built results. Their order is editorial, not chronological. If the owner prioritizes facade employment, move the professional facade cases forward; if XR or computational R&D is the priority, retain the emphasis of the first three.

| Order | Featured case | What the visitor should understand first | Recommended lead media |
| --- | --- | --- | --- |
| 1 | EchoXR | Designing an interactive relationship between architectural space, people, and sound. | A clear VR interaction image paired with a human-in-the-loop setup photograph. Add a short operation recording when available. |
| 2 | XR-assisted Bending-Active Assembly | Physical changes can inform the digital model and assembly guidance. | A physical/digital comparison, followed by a short tracking demonstration from the existing animated source. |
| 3 | Woodflow | Computational geometry can be organized into reusable tools for an industrial design workflow. | A public-safe input-to-output example and a simplified system diagram. This slot depends on defining an appropriate public case package. |
| 4 | Bending-Active Metal Panel Deformation | Material behavior and geometric computation inform one another. | A strong physical prototype photograph, then a target-to-result sequence. |
| 5 | Project Caschlatch | Digital methods support collaborative fabrication and full-scale assembly. | The completed structure, followed by the owner's XR contribution and site sequence. |
| 6 | Taichung Nan Shan Entrance Installation | Design development can be carried through to fabrication information and a built result. | A built photograph, a key detail, and a concise model-to-drawing example. |

If a public Woodflow case is not ready for the first release, use Heat Rotate Cutting in that featured position while retaining a properly scoped Woodflow entry for later. This is a content-readiness fallback, not a conclusion that the software is unfinished or unsuitable.

## Terminal presentation proposal

### Work index

Use the terminal as a recognizable frame for visual work. Each project entry should show a meaningful preview, a title, a one-sentence purpose, the owner's role, and a few relevant tags. Present these as generous visual rows on desktop, with the image and summary adjacent; stack them on narrow screens. Avoid reproducing dense portfolio PDF pages as the primary reading format.

The expanded terminal can have a compact navigation column and one main content area:

- **Work** — selected work by default, with an All projects view and category filters.
- **Lab** — the four short studies in a lighter gallery.
- **About** — concise profile, capabilities, selected experience, and an appropriate CV download.
- **Contact** — deliberate contact options chosen by the owner.

Selected work is a subset of All projects. Category tags should filter the same records rather than create copies. Do not require typed commands to navigate. Keep the directory navigation compact enough that images and explanations have useful space; collapse it on small screens.

Opening a project keeps the case within the terminal frame, with a readable location such as `~/work/echoxr` and an obvious return to Work. Returning should retain the previous filter and reading position. A permanent third pane is unnecessary for the current inventory.

In the initial smaller terminal, prioritize the owner's name, a concise field statement, and direct access to work. Proposed field statement: **Computational design, XR, and digital fabrication.** The content should already be usable, and the existing direct-entry behavior can provide immediate access to the expanded reading layout. Ordinary case browsing must not restart the opening choreography.

### Case structure

Use a consistent basic reading order, with depth matched to the work:

1. A strong result image or short demonstration, with a plain-language project premise.
2. Compact facts: context, date, collaborators, and **My role**.
3. The problem or design question, followed by the approach.
4. Three to five selected process sections, each connecting a visual to a specific decision or capability.
5. The demonstrated result and its limits; avoid inventing performance or business metrics.
6. Credits and optional links to appropriately public project material.

Adapt the evidence to the case:

| Case type | Recommended explanation |
| --- | --- |
| XR and interaction | Show the user's action and the system's response. Pair a short interaction sequence with a simple tracking/data diagram and a real use photograph. For EchoXR, an opt-in audio comparison could be valuable, but no usable recording has been verified. |
| Computational tools | Begin with input and output, then explain a worked example and only the relevant parts of the system. Clearly separate implemented components, prototypes, and planned integrations. Code links are optional evidence, not the main reading path. |
| Fabrication and architecture | Lead with the physical result, then connect geometry, material tests, fabrication information, and assembly. State the owner's precise scope within the team and retain photography/design credits. |
| Generative work and Lab | Use a lighter gallery with an understandable rule, a few variations, and a result. A short study does not need an artificially long problem/solution case. |

Preserve the colors and contrast of actual project media rather than tinting everything to fit the dark interface. Give line drawings and technical figures a neutral local background when needed. Motion should explain an operation; it should not compete with reading. Audio should be explicitly activated. Any later interactive model viewer should be optional and justified by what it helps explain.

### First case to develop: EchoXR

Proposed section sequence for the next content discussion:

1. **Overview** — what can be explored together in the virtual architectural environment.
2. **Interaction** — hand controls and changes to the room, using the available interaction artboard.
3. **Shared space** — how tracked participants and the virtual environment relate, using a simplified setup diagram.
4. **Acoustic exploration** — source/material behavior represented in the available visuals; add perceptual comparison only when a suitable recording exists.
5. **Implementation and contribution** — distinguish the owner's work from collaborators and the existing tracking/network/audio frameworks.
6. **Demonstration and reflection** — verified prototype experience, current limits, and what was learned.

Confirm team attribution and the owner's exact contribution before drafting first-person claims. The available repositories and images alone do not establish those boundaries.

## Material preparation and factual checks

### Available motion sources

Seven embedded GIFs in the interview deck contain multiple frames:

| Deck slide | Embedded source | Observed subject |
| --- | --- | --- |
| 2 | `image11.gif`, `image12.gif` | Motion capture, physical deformation, and XR/digital updates. |
| 8–9 | `image34.gif`, `image37.gif` | Caschlatch/COMPASXR module and assembly interfaces. |
| 11 | `image47.gif`, `image44.gif` | Non-planar/dot printing processes. |
| 11 | `image45.gif` | Robotic stick assembly. |

These are viable candidates for later short web clips, subject to full playback, source-quality, and credit review. No video conversion or site asset preparation was performed in this audit. EchoXR's repository recording folder was empty when inspected; the available artboards are useful, but a current interaction recording would improve its lead presentation.

### Attribution, dates, and scope

- Preserve explicit personal contributions where the portfolio provides them, particularly Caschlatch and the professional facade/installation work. Confirm remaining team-role boundaries before using first-person authorship claims.
- MAS_T3_MoCap extends an existing COMPAS XR context; its inherited README should not be used as a complete account of the owner's contribution. Custom tracking and geometry scripts provide more specific evidence.
- Woodflow documentation identifies private material and separates current implementation from planned integration. Prepare a deliberately public case with selected diagrams and examples; do not publish internal deployment information, project configurations, planning data, or unapproved company screenshots. Do not describe roadmap ERP/Core integration as a delivered end-to-end workflow.
- Some Woodflow foundation implementation acknowledges COMPAS origins. Explain the contribution accurately and retain relevant attribution if that material is shown.
- Portfolio editions disagree on some dates. Examples include the metal-panel thesis (2020/2021), Heat Rotate Cutting (2018/2020), and the entrance installation (2021/2022). Resolve whether dates refer to design, completion, or publication; do not silently choose one.
- Architectural photographs, workshop work, and collaborative research require their existing credits. The large building names must not imply responsibility for their entire architecture.
- Source descriptions of outcomes are not independent tests. Publication, performance, fabrication, or business claims should be supported at the level actually available.

## Next discussion

Use this inventory to establish the featured sequence and develop one representative case, beginning with EchoXR. Then apply the agreed reading depth to the remaining featured work and the shorter entries. Interface implementation remains a separate future request; the confirmed scroll-driven opening and terminal handoff are unchanged.
