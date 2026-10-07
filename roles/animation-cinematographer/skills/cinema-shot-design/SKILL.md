---
name: cinema-shot-design
description: Design and compare camera paths, timing, lenses, shot scales, depth of field and diffusion in the isolated Animation Cinematographer role. Use for camera-language proposals in this role, not general UI design or unrelated projects.
---

# Camera proposals in this role

Read the role's catalog/studies.json and research/INTERACTION_PLAN.md. Identify the communicative purpose of a shot before adding movement. Keep the comparison scene, exposure, progress and target fixed unless the tested distinction requires changing them.

Use src/review/model.js for deterministic pose sampling. Treat trajectory, time law, lens and composition as separate concepts even when one semantic progress drives them together. Describe canonical-time derivatives separately from actual user movement speed. Use arc-length curve sampling when the study calls for constant spatial speed.

Keep one writer for each camera. Formula-driven poses and Theatre poses are mutually exclusive per view. Only src/motion/theatre may import Theatre directly. For an authored proposal, export real Studio state and record provenance; reusing an existing export is not new authoring.

Evaluate in the local A/B desk at matched u values, including endpoints and transitions. Compare actual pixels and camera state. A dolly zoom should preserve its reference plane, a locked camera should remain locked, and a focus or diffusion claim must be visible in rendered output.

Distinguish simulation from approximation. The role's screen-space focus gather has silhouette limits; its highlight diffusion is not a measured Tiffen filter grade. Keep exact dependency/source pins and asset license notes in the source register.

Use existing stable HTML reading labels and reduced-motion stills when motion competes with comprehension. A technique can be marked unsuitable without deleting the comparison.
