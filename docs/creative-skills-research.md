# Creative and UI/UX skill research

Initially researched on September 27, 2026 as candidates for discussion. Later that day, the owner requested a final review using multiple skills: the four recommended definitions and relevant references below were read and their compatible review guidance was applied alongside the three installed R3F skills. See the [concept review](concept-review.md). No new skills were installed, no candidate scripts were run, and no website implementation was created.

Scope update: the owner subsequently limited the main 3D visual to the opening few storyboard scenes and confirmed a clear terminal-inspired interface for project browsing. [Current concept direction](concept-direction.md) governs the use of the candidates below. An image-generation comparison was later used for concept discussion; it does not approve its placeholder geometry or materials.

## Project basis

The project is a personal website and portfolio restarting concept planning. The owner wants to develop the opening 3D scenes gradually through storyboards and camera movement. The previous prototype is not a starting point.

The reference image suggests a relationship between a readable interface region and an abstract spatial composition. Terminal-inspired presentation is now an owner-confirmed direction, with weitingworks.com as an additional interface reference. Exact terminal layout, objects, colors, labels, and controls remain open.

The content structure, audience priorities, navigation model, motion triggers, and mobile composition still need discussion. An abstract background does not automatically need characters, a plot, or a film production pipeline.

## Recommended candidates

The links below point to upstream skill definitions. Suitability assessments are project-specific judgments based on those definitions, not runtime tests or a complete audit of every supporting file.

| Skill and source | What it contributes | Fit and adaptation needed |
| --- | --- | --- |
| [cinematic-director — wuwangzhang1216/DirectorSKILL](https://github.com/wuwangzhang1216/DirectorSKILL/blob/main/SKILL.md) | Shot purpose, visual treatment, staging, camera movement, start/end states, and continuity. | Preferred discussion lead for camera intent and spatial composition. Select only the relevant planning modes. Film, dialogue, sound, and video-generation deliverables are optional and mostly unnecessary here. |
| [storyboard-video-previs — gainubi/storyboard-video-skill](https://github.com/gainubi/storyboard-video-skill/blob/main/SKILL.md) | Panel tables, shot vocabulary, movement arrows, continuity notes, rough previs, and image prompts. | Useful when turning an agreed idea into reviewable frames. Start with a small set appropriate to the question; its default 12/16-panel narratives are not project requirements. |
| [ui-ux-pro-max — nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/blob/main/.claude/skills/ui-ux-pro-max/SKILL.md) | Searchable guidance on navigation, typography, responsive layout, accessibility, animation, and interaction quality. | Preferred UX companion. Apply it to content readability over moving backgrounds, navigation, touch input, reduced motion, and interruption behavior. Catalog recommendations do not determine the site's aesthetic. |
| [frontend-design — anthropics/skills](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md) | Subject-specific visual identity, typography, palette, composition, and critique against the brief. | Add when defining the interface's visual language. Its design-to-build workflow remains subject to the project's concept-first phase. |

The two directing skills overlap. Use `cinematic-director` for the reason and geometry of a shot, and `storyboard-video-previs` when a panel-based deliverable is useful. Do not run two full production workflows for the same question.

## Optional and later-stage candidates

| Skill and source | Appropriate use | Why it is secondary |
| --- | --- | --- |
| [manga-creation-pipeline — waterblower/Omni-Art-Skills](https://github.com/waterblower/Omni-Art-Skills/blob/main/manga-creation-pipeline/SKILL.md) | Visual emphasis, information reveal, reading order, pauses, and panel composition. | Relevant if the owner wants comic-like visual reasoning. Its chapter, character, and comic-page structures do not directly specify a real-time 3D camera path. |
| [cinematography — fal-ai-community/skills](https://github.com/fal-ai-community/skills/blob/main/skills/cinematography/SKILL.md) | Lens feel, lighting, framing, camera vocabulary, and color treatment. | Its workflow is coupled to genmedia model routing, uploads, and generation. Concept discussion does not currently need that toolchain. |
| [web-design-guidelines — vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills/blob/main/skills/web-design-guidelines/SKILL.md) | UI implementation review against an external guideline source. | Most useful once there are interface files to review. It is a review skill, not a storyboard or art-direction method. |

## Existing capabilities to use at the right stage

- `imagegen`: available for rough storyboard images or visual alternatives once image creation is requested. It produces raster references, not editable 3D scenes or camera animation.
- `r3f-fundamentals`: already installed; scene structure and explicit resource ownership if React Three Fiber is selected.
- `r3f-animation`: already installed; frame updates, damping, and animation behavior after camera intent and interaction are defined.
- `r3f-shaders`: already installed; custom materials and particle-related shader work if the concept needs it.

The installed R3F guidance comes from [EnzeD/r3f-skills](https://github.com/EnzeD/r3f-skills), as recorded in [technical options](technical-options.md). These capabilities support implementation; they do not choose the creative direction.

## Proposed discussion sequence

This is a proposed process, not an approved storyboard or implementation specification.

1. Start from the confirmed opening viewpoint: floating inside the space among forms at different depths, progressing from open/sparse to dense/interwoven.
2. Describe a few opening visual moments in plain language. Give each moment a purpose before choosing movement; the camera path and motion mechanism remain open.
3. Sketch opening frames and a top-down camera diagram, including the point where the terminal interface becomes the primary focus.
4. Discuss entry timing, interruption, and the transition to the interface. Do not assume that later project navigation drives further camera travel.
5. Review text readability, mobile framing, reduced motion, and a static fallback alongside the opening direction.
6. After the opening tone is established, discuss project content, information architecture, and presentation as a separate stage.
7. When the owner requests implementation, build the agreed limited study and evaluate it in the browser before detailed particles or materials.

For future web storyboards, extend a film-style shot table with these fields:

| Field | Purpose |
| --- | --- |
| Viewer intent | What the visitor should understand or notice. |
| Composition | Subject placement, depth, silhouette, and space reserved for UI. |
| Camera | Start and end positions, viewing target, path, and framing change. |
| Subject motion | What moves independently of the camera. |
| Trigger and progress | Whether movement depends on time, navigation, scrolling, or another chosen input. |
| Hold and interruption | What remains readable when paused, reversed, skipped, or interrupted. |
| Alternate presentation | Mobile composition and reduced-motion/static treatment. |

## Packaging notes

[Official Codex documentation](https://learn.chatgpt.com/docs/build-skills) describes skills as a `SKILL.md` with a name and description, optionally accompanied by scripts, references, and assets. Finding a compatible manifest does not establish that every tool dependency or workflow will work unchanged.

For the instruction-based directing skills, preserve referenced templates and reference files when installing; copying only `SKILL.md` may omit required material. The [UI/UX Pro Max repository](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) documents a Codex-specific CLI installation route and Python-based local searches. Its Claude-specific development path should not be assumed to be the correct Codex package.

No installer, external generation service, or candidate script was run during this research or the later concept review. The remote definitions were used as review guidance; that use does not constitute installation or adoption of their full production workflows.
