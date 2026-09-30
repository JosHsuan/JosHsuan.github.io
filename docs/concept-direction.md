# Current concept direction

Latest September 28 update: the particle feature and its cube have been removed.
Only the approved glass workspace remains, with scroll reversal available even
after full expansion. [Workspace interaction](workspace-interaction.md) supersedes
conflicting effect and completion-lock decisions in the historical discussion below.

Updated September 28, 2026. This document separates owner-confirmed direction from proposals and reference observations. The owner has now requested gradual local implementation of the opening and paused project-content refinement. The current study is recorded in [Opening implementation](opening-implementation.md).

## Owner-confirmed direction

Latest owner correction (September 28): use Arrival's dark chamber, low horizontal luminous fog opening and foreground silhouettes. Render the inscription, mist and selected subject geometry as particles; write quickly and dissolve. Turn the Thinker away from the viewer and use minimal edge light. Refine the terminal's glass using Apple material guidance. The earlier rectangle, glossy metal, glass loop and tumbling assembly are superseded. Preserve the reversible scroll timeline and terminal reading handoff. See [Visual requirements](opening-visual-requirements.md) for the current implementation. The older geometry and motion decisions below are historical where they conflict.

- The site is a personal work website whose central purpose is to present the owner's previous projects through a good, clear interface.
- The main 3D visual belongs to the opening few storyboard scenes and establishes the site's tone. Visual effects must not dominate the whole browsing experience.
- The opening viewpoint places the visitor inside the 3D space, floating among forms distributed at different depths.
- Spatial density develops over time: open and sparse at the beginning, then dense and interwoven. These are successive stages, not mutually exclusive visual directions.
- The owner requested an even more dispersed first shot to strengthen the contrast between the beginning and the final composition.
- A terminal-inspired interface is desired, with clear information and usable presentation of the work.
- The owner selected an interface that is visible and usable from the first opening shot. Visitors can begin browsing immediately while the opening establishes the atmosphere.
- The terminal starts as a smaller independent window and expands through the final opening scroll interval. The owner originally requested automatic expansion, then specified a scroll-driven opening and accepted the revised handoff. Exact interval boundaries and layout dimensions remain adjustable.
- The terminal uses a frosted-glass material effect. Exact tint, transparency, blur, border treatment, and surface details remain to be discussed.
- The owner accepted an expanded composition in which the terminal occupies most of the screen, a small amount of spatial background remains visible around it, and 3D motion settles. Soft background light remains visible through the frosted surface.
- Expansion smoothly extends the window boundaries and reflows the content while preserving a comfortable reading size.
- The owner endorsed the overall v1 storyboard and requested a second version whose geometry and objects draw inspiration from the supplied abstract tattoo photograph. Preserve the established experience while exploring this new visual vocabulary.
- [weitingworks.com](https://weitingworks.com/) is an owner-supplied interface reference.
- Establish the opening tone first. Discuss and propose project content, categories, and presentation separately afterward.
- The fine lines should incorporate dynamic motion trails, and selected elements should use an effect inspired by [The Spirit](https://github.com/edankwan/The-Spirit). Step 5 established off-white fading traces and localized smoke at the slab notch, with a smaller accent at the spine hook; exact curves, intensity, and emission timing remain to be tuned.
- Selected existing storyboard elements should become more visibly three-dimensional, with glass or highly reflective materials. Step 5 established smoked etched glass for the slab, clearer glass for the loop, and reflective dark silver metal for the spine. Exact geometry and optical parameters remain to be refined.
- Refined fine airborne dust should float through the scene during transitions. Its amount, lighting, depth distribution, and motion remain to be tuned.
- The owner endorsed the current visual effect direction and specified a motion progression from disordered multi-axis rotation and weightless drifting to an ordered arrangement at the final positions. Acceleration must be considered, and each object should have its own pacing.
- For the final assembly, the owner selected visible gaps and independent suspension. The pieces form an ordered spatial relationship while remaining separated; exact positions, orientations, and silhouette are not yet fixed.
- For the opening distribution, the owner accepted widely separated main objects at middle/far depths, different starting orientations, and a small near-field fragment at the periphery. Exact positions and angles remain illustrative.
- For the camera, the owner selected gentle forward travel with a slight rightward shift, stable viewing orientation, and a stop before the objects complete assembly. Exact displacement, lens, and timing remain illustrative.
- For the opening rhythm, the owner accepted independent acceleration and braking, separate translation and rotation slowdown, and staggered arrivals. The camera settles first, then the slab, loop, spine, and small fragments complete the composition before terminal expansion. The later scroll-timeline instruction supersedes the initially accepted six-second duration; relative choreography remains relevant, with exact scroll intervals and curves to be refined.
- For the lighting and material direction, the owner accepted cool gray glass and metal against charcoal, with a small amount of warm-white reflected light. Sparse dust becomes visible in lit regions. Reflections, trails, and localized smoke become more apparent in the middle of the opening, then subside as the composition settles. The reading state retains soft light and very subtle dust rather than sustained prominent effects; exact intensities and motion adaptations remain to be tuned.
- The opening uses the visitor's downward wheel scrolling as its timeline rather than ordinary elapsed-time playback. Camera travel, object movement, convergence, and effect progression follow scroll progress. Time alone must not complete the main sequence. This changes the control of the opening, while retaining the portfolio-first scope and an interface available from the start.
- While the opening is unfinished, upward scrolling can return to earlier stages. At a held scroll position, the main choreography holds after brief smoothing. Once the opening completes, keep the terminal expanded and the background settled; ordinary content scrolling, including upward scrolling, does not automatically reverse the opening.
- During the opening, scrolling the background advances the scene and scrolling terminal content prioritizes reading. Retain a direct entry to the expanded work interface so the scenic sequence does not gate access to projects. Exact input-region behavior and entry copy remain to be refined.
- The owner supplied the local CV/portfolio archive and the echoXR, StrongbyForm, and MAS_T3_MoCap repositories for content assessment, and asked for recommendations on project content and presentation. The resulting inventory and editorial proposals are recorded in [Portfolio content audit](portfolio-content-audit.md).
- After the content audit, the owner explicitly paused EchoXR case development and requested gradual local implementation of the opening. Refine and review the opening before resuming project-content planning. This authorizes a new local study using the confirmed direction; it does not reinstate the rejected prototype or authorize deployment.

The earlier assistant proposal to connect the whole project-browsing journey to camera travel is superseded by this opening-focused scope. It was not an owner-approved interaction specification.

## Interface reference observations

Observed in the live browser on September 27, 2026:

- The [home page](https://weitingworks.com/) uses a terminal window, a shell-style prompt, and a directory listing with clickable entries for internal pages and external profiles. The listing is accessible through ordinary links.
- The [About page](https://weitingworks.com/about) retains a terminal window and visible navigation. It uses headings, a table, and grouped text to present information, with command and filename motifs framing those sections.
- The [Projects page](https://weitingworks.com/projects) currently displays a heading and "Coming soon...". It does not yet supply a substantive project-list or project-detail layout to evaluate or adopt.

Relevant qualities to explore are a recognizable terminal identity, clear navigation, scannable structure, and readable content. File permissions, dates, typing effects, exact colors, and the reference site's personal content are not requirements for this project.

## Proposed design principles

These are recommendations for the next discussion, not finalized behavior:

- Give the opening sequence a clear point at which motion settles and attention rests primarily on the already-visible interface.
- Keep the smaller window's position and text reading scale stable during the opening. Expansion through the final scroll interval provides more layout space while preserving a comfortable text size; exact placement, dimensions, and progress curve remain to be refined.
- Let the frosted surface convey background depth while maintaining readable text and clearly visible controls. Tune transparency and blur against the densest background state.
- Use terminal vocabulary to organize information while keeping navigation discoverable through familiar controls. Whether typed commands are useful remains an open question.
- Let project media and explanations determine the eventual content layout. The terminal framing should accommodate the work being presented.

## Decisions still open

- The opening's exact shot count, composition, geometry, optical settings, light placement, and camera displacement and lens. Scroll distance, precise stage boundaries, and smoothing remain open; reversible control within the unfinished opening is established. Material roles and the cool gray palette with warm-white accents are established.
- The camera direction is established as restrained forward/rightward travel, settling before the objects. Its exact acceleration and synchronization remain to be refined.
- The final assembly's exact layout and silhouette; each object's path, rotational behavior, acceleration curve, and start of convergence. The accepted staggered completion order is slab, loop, spine, then small fragments.
- Which individual fine curves carry trails, their exact lifetime and brightness, and the emission settings for the accepted slab-notch and spine-hook smoke placements.
- Glass thickness and transmission, metal roughness, reflection brightness, and the exact lighting and depth distribution of the sparse dust. The material roles accepted in step 5 do not fix every visual detail of v4.
- The detailed handling of wheel, trackpad, touch, and keyboard input across the opening and terminal regions, including boundary gestures and the direct work-entry control. The broad ownership rule, reverse behavior, and stable expanded browsing state are established.
- The exact resting composition, lighting, and any residual background motion after the opening; the accepted direction is settled 3D motion with some background still visible.
- The terminal's exact expanded dimensions, expansion interval and curve, and any restore behavior; how scrolling through expansion preserves reading, input, focus, and pressed targets. The earlier proposal to wait for scroll input to end before timed expansion is superseded by the scroll-driven discussion.
- The frosted-glass treatment's tint, transparency, blur, edges, and behavior on smaller screens.
- The terminal layout, navigation behavior, optional command input, mobile arrangement, and motion alternatives.
- The final project selection, categories, order, summaries, media, and case structure. The supplied sources support an initial inventory of 15 main projects and 4 short studies after deduplication. The proposed six featured cases, visual work index, and case formats remain editorial recommendations for discussion.

## Current discussion boundary

The current task is gradual local opening implementation. The [content audit](portfolio-content-audit.md) remains available, but detailed project presentation is paused at the owner's request. The [new opening study](opening-implementation.md) establishes a reviewable scroll-controlled scene and terminal handoff. Its exact transforms, materials, layout measurements, and effect levels remain adjustable; running code does not make those values owner-approved design decisions. Do not invent project outcomes or publish the site as part of this local iteration.

The [cross-skill concept review](concept-review.md) records the September 27 review of v4 and the motion plan. Its findings and proposed corrections remain recommendations; they do not change the owner-confirmed direction above.

The [six-step opening discussion](opening-decision-plan.md) is complete at the direction level. Steps 1 through 5 established the assembly, sparse opening, camera travel, independent choreography, and material/effect direction. In step 6, the owner replaced timed playback with a scroll timeline and accepted reversible exploration before completion, scroll-driven expansion, and a stable reading state afterward. Exact transforms, curves, scroll distances, layout measurements, and screen/motion/graphics adaptations remain refinement topics. The later explicit request now authorizes local opening implementation; project-content discussion is paused.

## Storyboard discussion artifact

[Opening storyboard v1](../references/storyboards/opening-storyboard-v1.png) is a four-frame visual draft generated with the built-in image tool: open space, interwoven space, settling motion, and the expanded terminal. The owner subsequently endorsed the overall result and requested tattoo-inspired geometry for a second version. Exact implementation parameters and skeleton content remain illustrative; this is not a website implementation.

The [generation prompt](../references/storyboards/opening-storyboard-v1-prompt.txt) is saved alongside the image for subsequent revisions. Actual expansion should preserve comfortable text sizing and reflow content; the generated board is not a pixel-accurate layout specification.

### Tattoo-inspired version

[Opening storyboard v2](../references/storyboards/opening-storyboard-v2-tattoo.png) preserves the four-frame sequence and frosted terminal treatment while proposing these translations from the owner's tattoo reference:

- The dark upright ink mass, sweeping internal marks, and irregular negative-space edge become an etched, notched suspended plane.
- The long tapered stroke and transverse mark become an elongated calligraphic spine with a short lateral branch.
- Incomplete arcs, small loops, and crossing guide lines become slender spatial curves and filaments distributed across depths.
- Small isolated marks become sparse flat fragments.

These are visual interpretations, not claims about the tattoo's meaning. The new object designs remain pending owner review. The photo's person and room are not design inputs, and the source photograph has not been copied into the repository. The [v2 generation prompt](../references/storyboards/opening-storyboard-v2-tattoo-prompt.txt) records the input roles and edit constraints.

### Motion trails and localized particles

[Opening storyboard v3](../references/storyboards/opening-storyboard-v3-motion.png) revises v2 in response to the owner's request for dynamic fine-line trails and Spirit-inspired effects on selected elements. It is a static visual study of motion, not a working particle simulation or website prototype. The [v3 generation prompt](../references/storyboards/opening-storyboard-v3-motion-prompt.txt) preserves the edit constraints.

Proposed motion treatments:

- Selected fine curves carry a moving light tip and tapered, fading traces. Short overlapping traces suggest prior positions rather than additional permanent rods. Existing tattoo-derived forms remain visible.
- Fine smoky particles gather, curl, and disperse locally along the notched plane's concave edge, with a smaller accent at the hooked end of the long spine. These locations are suggested placements, not yet owner-approved object assignments.
- The particle treatment draws on The Spirit's smoke-like clustered grains and curling motion. Most of each object retains its solid etched form.
- Effects remain behind the terminal. The opening can build visual activity while the terminal stays available; the expanded reading state receives a quiet background.

| Frame | Proposed motion emphasis |
| --- | --- |
| 01 — Open space | A few thin trails and a restrained initial particle curl; retain broad negative space. |
| 02 — Interwoven | The strongest trail overlap and localized particle activity, distributed across depth. |
| 03 — Settle | Moving tips dim, older trails fade, and particle wisps diminish around the objects. |
| 04 — Expand | Trails have nearly disappeared; soft background light remains behind the expanded frosted terminal. |

The generated stills communicate relative activity and placement only. Trail lifetime, particle count, turbulence, camera timing, and motion alternatives require later discussion and implementation validation. The existing v1 and v2 artifacts are preserved for comparison.

### Stronger spatial contrast, glass, and floating dust

[Opening storyboard v4](../references/storyboards/opening-storyboard-v4-glass-dust.png) revises v3 using the built-in image tool. The [v4 generation prompt](../references/storyboards/opening-storyboard-v4-glass-dust-prompt.txt) records the edit target, requested changes, and preserved interface behavior. Earlier boards remain available for comparison.

The owner requested three changes: greater spacing in the first shot, dimensional glass or reflective versions of suitable existing elements, and fine floating dust during transitions. The board proposes the following interpretation:

- Frame 01 removes the large foreground plane, pushes the notched form into the distance, and separates the few remaining silhouettes with broad negative space. The terminal retains its established size and position; the spatial opening comes from the objects' arrangement rather than shrinking the interface.
- Frames 02 and 03 bring glass edges, reflective surfaces, and overlapping forms closer to the viewer. Frame 04 retains the dense arrangement around the expanded terminal's perimeter, while its frosted surface softens the background and motion settles.

| Existing motif | Proposed volumetric/material treatment |
| --- | --- |
| Oval or incomplete loop | A slender bent glass band with readable thickness and refracting edges. |
| Notched etched plane | A shallow smoked-glass slab with beveled sides, selective transmission, and retained dark diagonal markings. |
| Tapered calligraphic spine | A narrow polished dark-metal form whose highlights reveal its cross-section and twist. |
| Small angular fragments | A few clear glass wedges or reflective shards at different depths. |

The motion layers have distinct roles: thin-line trails indicate direction, localized Spirit-inspired wisps curl around selected object edges, and ambient dust reveals the space between objects. Proposed dust is sparse, low-contrast, and visible mainly where light catches it, with modest near/far focus variation. It remains behind the interface and subdued in the expanded reading state.

This is a static concept board. It proposes material appearance and relative depth; actual geometry, physically rendered reflections/refraction, dust drift, camera movement, and browser performance have not been implemented or validated. The object/material assignments are not finalized merely because they appear in the image.

### Motion choreography: drift toward assembly

The owner specified the overall transition and independent object pacing, then selected downward scrolling as the timeline. Read the motion descriptions below as choreography sampled along scroll progress, not free-running elapsed-time playback. Exact paths and progress intervals remain proposals. The existing v4 board remains the visual reference; its still frames do not demonstrate this movement.

| Stage | Proposed movement and acceleration |
| --- | --- |
| 01 — Disordered drift | Widely separated objects begin in different tumbling poses. Scrolling reveals their independent drift paths and multi-axis rotation. Preserve smooth variation in the choreography rather than stepping objects once per wheel event. |
| 02 — Gradual convergence | Objects begin turning toward their destinations at staggered moments. Their existing motion bends into curved approaches; acceleration builds gradually. Different objects can accelerate, coast, or begin braking at the same moment. Multi-axis tumbling progressively gives way to orientation toward the final pose. |
| 03 — Assemble and settle | Objects brake before arrival, following different stopping distances. Translation and rotation can finish at different times: one object may slow its drift while still making a small final turn. Larger forms establish the composition and smaller accents complete it in a proposed staggered arrival order. |
| 04 — Reading state | The main composition holds. Propose expanding the terminal through the final scroll interval, then handing scrolling to ordinary work browsing. Remaining atmospheric motion is subdued. Terminal access remains available throughout the opening. |

Proposed individual pacing:

| Element | Movement character |
| --- | --- |
| Notched glass slab | Broad, slow tumble; begin convergence relatively early and use a long, smooth braking interval. Its changing face angle reveals glass depth and etched texture. |
| Glass loop | A more apparent rolling and tilting motion; approach along an arc, then gradually align its opening with the final composition. |
| Reflective calligraphic spine | A restrained longitudinal turn combined with a slow tilt; converge later than the slab, with a deliberate final orientation and controlled moving reflections. |
| Small fragments | More varied rotation rates and shorter approach paths; stagger their acceleration and arrivals to provide the final accents. Keep their apparent speed restrained near the interface. |

These are artistic movement identities, not a claim that material or apparent size alone determines motion in zero gravity. The convergence is a directed visual transition layered onto the initial weightless impression.

Acceleration remains part of the authored choreography: give each object its own onset, speed peak, braking interval, and rotational slowdown along scroll progress. Actual motion in wall-clock time also depends on the visitor's scrolling speed. Propose only brief, bounded smoothing of input; it must settle at the requested progress rather than continue the sequence after scrolling stops. Preserve continuous paths and avoid synchronized arrivals or repetitive bouncing.

The final assembly is a spatial composition with owner-confirmed gaps and independent suspension. Its exact silhouette, overlap, and depth remain to be refined within that separation. Slow camera movement can support parallax, but object rotation should carry the sense of disorder while the terminal and the viewer's reading frame stay stable.

Supporting effects follow the same progress envelope: line trails taper toward assembly and localized Spirit-inspired wisps occupy selected intervals around the turns. The owner accepted reverse scrubbing within the unfinished opening, so their choreography must produce a coherent result when revisiting the same progress; a forward-only simulation cannot be assumed to reverse correctly. Very subtle independently drifting dust remains a proposed ambient layer and must not advance the main sequence. All effects remain behind the interface. Exact scroll distances, effect reconstruction, motion alternatives, and detailed input handling remain open.
