# Concept review across creative, UX, and 3D skills

Reviewed September 27, 2026. Scope: the [v4 storyboard](../references/storyboards/opening-storyboard-v4-glass-dust.png), the latest [motion choreography](concept-direction.md#motion-choreography-drift-toward-assembly), and the owner's confirmed direction.

Later direction update: in step 6, the owner selected scrolling as the opening timeline and accepted reversible exploration before completion, followed by stable expanded browsing. Read the timed-playback and automatic-expansion observations below as historical review context. The [current direction](concept-direction.md) and [completed step 6](opening-decision-plan.md#step-6-a-scroll-controlled-opening-with-a-clear-browsing-handoff) now govern progress, expansion, and the browsing handoff. The earlier six-second duration and timed expansion are superseded; exact input handling and adaptations remain to be refined.

## Conclusion

The visual direction is coherent enough to preserve: tattoo-derived forms, a sparse-to-dense opening, weightless motion resolving into an arrangement, and a frosted terminal that becomes the main reading surface. The most important remaining work is to define the final composition, make the motion continuous and finite, and protect people already using the interface when it expands.

This is a concept review, not a measured accessibility, performance, or implementation assessment. No running site, animated sequence, real project content, or mobile layout exists to validate those outcomes. No numerical film-production score is assigned to still images. Recommendations here do not become owner-confirmed requirements merely by being recorded.

## Skills applied

The four remote skills were read directly from their upstream definitions and relevant references. Their compatible review guidance was applied without installing them or running their scripts. The three R3F skills were read from the installed local copies. The implementation stack remains undecided.

| Skill | Review contribution | Scope adaptation |
| --- | --- | --- |
| [cinematic-director](https://github.com/wuwangzhang1216/DirectorSKILL/blob/main/SKILL.md), with its [QC checklist](https://github.com/wuwangzhang1216/DirectorSKILL/blob/main/assets/qc-checklist.md) | Shot purpose, explicit end states, controlled camera behavior, continuity. | Review planning evidence; film-specific faces, dialogue, generated-video gates, and numerical delivery scores do not apply. |
| [storyboard-video-previs](https://github.com/gainubi/storyboard-video-skill/blob/main/SKILL.md), with [shot language](https://github.com/gainubi/storyboard-video-skill/blob/main/references/shot-language.md) | Distinct panel functions and separation of object motion from camera movement. | Preserve the existing four conceptual stages rather than adopting a default panel count or generating another board. |
| [UI/UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/blob/main/.claude/skills/ui-ux-pro-max/SKILL.md), with its [static review reference](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/blob/main/.claude/skills/ui-ux-pro-max/references/quick-reference.md) | Readability, interruption, focus, navigation, responsive behavior, reduced motion. | Use its review checklist, not a database-generated design system. Web guidance takes precedence over unrelated native-app conventions. |
| [frontend-design](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md) | Identity grounded in the owner, deliberate material hierarchy, concentration of decorative motion in the opening. | Preserve the explicitly requested dark terminal/glass direction. Do not invent portfolio content or replace the owner's choices with generic style rules. |
| [r3f-animation](C:/Users/JosHsuan/.codex/skills/r3f-animation/SKILL.md) | Independent pacing under one time owner, rotation continuity, settling and resume behavior. | Architecture recommendations only; no library or physics engine selected. |
| [r3f-fundamentals](C:/Users/JosHsuan/.codex/skills/r3f-fundamentals/SKILL.md) | UI/scene separation, resource ownership, rendering lifecycle. | No scaffold, version selection, or runtime verification. |
| [r3f-shaders](C:/Users/JosHsuan/.codex/skills/r3f-shaders/SKILL.md) | Prefer suitable existing materials; reserve custom shaders for effects that need them; maintain a consistent lighting/color pipeline. | No GLSL, shader compilation, or material benchmarking performed. |

## What should remain

- The opening begins inside a spacious volume. The stronger negative space in v4 frame 01 gives the later overlapping forms a useful contrast.
- The notched etched slab and calligraphic spine make the visual vocabulary personal. Their irregularities should remain recognizable through material and motion changes.
- The interface is present from the start and becomes the dominant reading surface. Decorative motion has an explicit place in the opening rather than driving all portfolio navigation.
- Line trails, localized smoke, and airborne dust have different jobs. Keep those distinctions when tuning their intensity.

## Findings and proposed corrections

### R1 — High priority: the final assembly is not yet reviewable

**Evidence:** In v4, the long spine is nearly upright in the first three frames and the slab retains a broadly similar facing. Frame 03 shows overlap but does not establish a clear assembled silhouette; frame 04 covers most of it with the expanded terminal. The motion notes also leave the destination arrangement open.

**Implication:** The stills establish atmosphere, but do not yet demonstrate the newly requested change from multi-axis disorder to order. Building directly from them would leave the defining motion goal to interpretation.

**Correction:** Define a final pose and position for each main object, then derive the earlier drift from those destinations. Add one internal review view of the final arrangement without the large terminal occluding it, alongside its normal UI composition. This does not require an extra public-facing shot. Annotate distinct starting orientations and approach directions. Decide whether the composition remains separated in depth or includes contact; do not assume a logo or fused sculpture.

**Follow-up:** The owner subsequently selected visible gaps and independent suspension. The [six-step discussion](opening-decision-plan.md) records that decision and the next opening-layout proposal. Exact transforms and motion continuity still need refinement.

### R2 — High priority: independent pacing needs a shared ending

**Evidence:** Each object has a proposed personality, but convergence onset, speed peaks, braking windows, camera contribution, and completion are not specified.

**Correction:** Use one scene timeline with per-object schedules and separate translation/rotation profiles. Preserve the initial drift velocity as the path turns toward its target and smooth the acceleration through that handoff. Angular slowdown can finish before or after positional arrival. Give major forms priority in establishing the composition and stagger the remaining arrivals.

Start with stable camera framing or a small intentional drift so object rotation carries the disorder. Keep the terminal in screen space. Define a finite end to the opening from the main forms' settled state; continuously drifting dust must not prevent automatic expansion. If damping is used later, it needs a practical settled threshold rather than waiting for an asymptote to reach an exact value.

**Later validation:** Compare the same choreography at different refresh rates, after a background/resume cycle, and when interrupted. Check rotation continuity and the velocity at convergence boundaries. These checks have not been run.

### R3 — High priority: automatic expansion can interrupt an active visitor

**Evidence:** The terminal is usable immediately and also expands automatically after the opening. Existing notes leave early browsing behavior open.

**Correction:** Preserve the owner-confirmed automatic expansion while explicitly preserving the selected page, input, keyboard focus, and reading position. Keep a pressed target stable until its activation completes; the exact interaction-safe expansion rule remains a proposal. Reflow content at a readable text size instead of magnifying the whole interface. Avoid moving the user back to an initial view or restarting the opening after navigation.

A visible way to end decorative motion is recommended. Its semantics should be clear: stopping the opening should resolve the composition and expose the usable reading state, not strand objects halfway through a transition. Returning visitors and direct links should also have a proposed behavior before implementation.

### R4 — High priority: mobile and motion alternatives are still missing

**Evidence:** The only composition is a wide desktop storyboard. It does not establish touch targets, text wrapping, keyboard navigation, reduced motion, or a graphics-loading fallback.

**Correction:** Prepare a portrait composition in which the initial independent terminal is already wide enough to read; expansion may provide more height instead of shrinking a desktop window to fit. Keep controls operable by touch and keyboard. Propose a static assembled scene and immediately usable reading layout for reduced motion, and an independent HTML content path while graphics load or fail.

The browser can expose the user's request to reduce nonessential motion through [`prefers-reduced-motion`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion). Merely slowing a long tumbling sequence is not the proposed alternative here.

If nonessential moving content starts automatically, runs for more than five seconds, and accompanies other content, WCAG 2.2 calls for a way to pause, stop, or hide it. This is conditional guidance for the eventual duration and behavior, not a compliance finding against the concept image. See [Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html).

### R5 — Medium priority: material and lighting hierarchy must protect identity and reading

**Evidence:** The glass loop reads volumetrically, but the slab remains visually dominated by its dark etching. Bright edges, trails, smoke, and dust share similar warm highlights. The frosted UI currently contains mostly placeholders.

**Correction:** Keep distinct matte/etched, transmissive, and polished regions. Reserve the strongest reflection for a small number of focal surfaces, with subdued dust and local smoke. Retain the tattoo's imperfect curves, notch, and ink-like face so the material treatment does not erase the original vocabulary.

For the terminal, combine blur with enough surface opacity to hold contrast as a bright object passes behind it. Evaluate actual text over the brightest and densest background states; do not infer readability from a quiet still or apply text thresholds to decorative skeleton bars. Normal informative text generally needs 4.5:1 contrast, with 3:1 for qualifying large text; no ratios have been measured here. See [Contrast Minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).

### R6 — Medium priority: the reading state needs an explicit rendering policy

**Evidence:** The concept combines transmissive glass, reflective surfaces, trails, smoke, dust, and a large frosted interface. The notes also allow dust to continue after the main forms settle.

**Correction:** Keep the terminal and its navigation independent of the 3D scene. Evaluate ordinary materials before custom shaders, and allocate expensive transmission to the forms whose depth benefits from it. Limit effect resolution and complexity based on measurements on chosen devices, not the number of objects alone. The Three.js documentation notes the greater per-pixel cost of advanced physical shading; Drei's transmission material can add a scene render pass. These support investigating cost, not a claim that this particular design will be slow. See [MeshPhysicalMaterial](https://threejs.org/docs/pages/MeshPhysicalMaterial.html) and [MeshTransmissionMaterial](https://drei.docs.pmnd.rs/shaders/mesh-transmission-material).

Visual stillness and rendering idleness are different. A moving dust layer still needs new frames. Propose either a finite atmospheric fade into a static reading state or a deliberately limited ambient update rate. Reducing particle count alone does not make the renderer idle. On-demand rendering helps when the scene can genuinely rest; see the installed fundamentals skill and the [R3F performance guidance](https://r3f.docs.pmnd.rs/next/advanced/scaling-performance). The linked online page is a next-version reference; it is not an API/version selection for this project.

### R7 — Later content phase: portfolio usability cannot yet be judged

**Evidence:** The terminal contains a name, a prompt, and schematic content blocks. Actual works, labels, controls, hierarchy, and project detail views have deliberately not been designed.

**Correction:** Treat the current UI as a framing study. In the agreed later content discussion, verify discoverable project access, useful summaries and media, readable detail pages, and an understandable route back. Typed commands should remain optional if adopted. Do not treat the placeholder grid as an approved content layout or fill it with invented work during this review.

## Resolving conflicts between generic skills and this brief

- Generic limits on the number of animated elements do not override the owner's multi-object choreography. Coordinate attention and phase the activity instead.
- A general preference for transform-only UI animation does not justify scaling all terminal text. Preserve the confirmed reading size and reflow behavior; measure the implementation chosen to achieve it.
- Generic avoidance of dark themes, monospace conventions, or glass does not override this explicit visual direction. Those elements serve the brief; their usability still needs evaluation.
- Film-style prohibitions on rendered text do not invalidate a storyboard that deliberately includes a terminal UI. Actual UI text should remain real, accessible interface content in the later implementation.
- R3F recipes do not select the framework, renderer, physics engine, or dependency versions for this project.

## Proposed next artifact

Refine the motion plan around three concrete decisions: the unobscured final arrangement, the convergence/settling schedule including camera behavior, and the terminal's behavior when someone is already interacting. A mobile and reduced-motion counterpart should accompany that plan. Once the owner requests implementation, validate a small motion-and-interface study before expanding particle and material complexity.

No new storyboard image, website code, dependency installation, or performance test was produced by this review. The existing visuals and confirmed direction are preserved.
