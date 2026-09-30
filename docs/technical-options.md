# Technical architecture options

Current baseline: [Reversible glass workspace](workspace-interaction.md).
The particle feature has been removed. Particle references below are historical
research, not authorization to restore that implementation.

This document preserves reusable engineering ideas only. It does not preserve the rejected prototype's appearance, objects, motion sequence, geometry, materials, or interface.

Current status: the owner has now requested a new local opening implementation. Its selected stack, resource ownership, controls, and validation are recorded in [Opening implementation](opening-implementation.md). The candidate discussion below is retained as architectural context.

## Candidate stack

- **React and TypeScript:** typed components and application logic.
- **React Three Fiber and Three.js:** browser-rendered 3D scenes and reusable scene components.
- **Vite:** local development and a static production build.
- **GitHub Pages:** a possible destination for the built HTML, CSS, JavaScript, and assets.

Reassess the stack after the new concept is defined. No package versions or application scaffold are retained as requirements.

## Reusable design principles

1. Separate content and DOM interfaces from the 3D scene.
2. Give scene objects explicit responsibilities and independent behavior modules.
3. Separate behavior configuration from geometry generation and material or shader code.
4. Define one owner for scene progress. The owner selected scrolling as the opening timeline and accepted reverse scrubbing while the opening is unfinished. Reconstruct poses and principal effect state consistently at a given progress rather than relying on a forward-only clock. After completion, ordinary content scrolling retains the expanded interface and settled scene. Any independent ambient clock must not advance the main sequence.
5. Update frame-level values through stable references and shader uniforms rather than React state on every frame.
6. Define ownership and cleanup for GPU resources, event listeners, and effects.
7. Treat camera behavior, accessibility, reduced motion, and rendering cost as deliberate design decisions.
8. Validate the agreed visual direction in the browser. Successful compilation and automated tests alone do not establish visual quality.

## Skills reference

The [EnzeD/r3f-skills](https://github.com/EnzeD/r3f-skills) repository contains relevant guidance:

- `r3f-fundamentals`: scene architecture, Canvas, hooks, and resource ownership.
- `r3f-animation`: frame updates, damping, and render-loop behavior.
- `r3f-shaders`: custom materials, uniforms, and vertex deformation.

These skills are installed in the local Codex environment. They are optional development aids; they do not define the creative direction.

See [Creative and UI/UX skill research](creative-skills-research.md) for candidates that support concept discussion, storyboards, and interface design before implementation.

## Particle effect reference

On September 27, 2026, the owner selected [The Spirit by Edan Kwan](https://github.com/edankwan/The-Spirit) as a particle reference and subsequently requested its effect on selected tattoo-inspired elements, alongside dynamic trails on the fine lines. The effect direction is confirmed; exact integration and simulation parameters remain open.

- Its [README](https://github.com/edankwan/The-Spirit/blob/master/README.md) describes noise derivatives and curl noise as the basis for its smoky appearance, and credits Simo Santavirta's particle technique and David Li's Flow as references. The repository states an MIT license.
- Its [live demo](https://edankwan.com/experiments/the-spirit/) was visually inspected for the v3 storyboard. Fine particles form a compact, smoke-like volume with curled boundaries. The proposed adaptation uses localized wisps around selected object edges; the still storyboard does not validate equivalent runtime behavior.
- Treat line trails and smoky particles as distinct visual behaviors. Trail lifetime, emission placement, density, silhouette, and settling behavior remain investigation topics rather than finalized parameters.
- Its [package manifest](https://github.com/edankwan/The-Spirit/blob/master/package.json) uses Browserify/Budo and a repository-local Three.js dependency. Treat it as a visual and algorithmic reference; reassess integration against the eventual stack.
- Implementation update: the original MIT-licensed derivative-noise and curl GLSL helpers are now vendored at commit `c2ed239be0d7ed4ba28acf42dae42de994d37b8a`. They drive an analytic, reversible particle rectangle and a local hook plume. Three.js supplies the depth-of-field and bloom pipeline. This replaces the earlier placement-only sketches; see [Visual requirements](opening-visual-requirements.md).

## Deployment reference

Vite can produce static files for GitHub Pages. The repository's intended root site, `https://JosHsuan.github.io/`, uses the default Vite base path `/`. A deployment workflow can be added once a new implementation is ready.

See the [official Vite GitHub Pages guide](https://vite.dev/guide/static-deploy.html#github-pages). No deployment workflow is currently configured in this repository.
