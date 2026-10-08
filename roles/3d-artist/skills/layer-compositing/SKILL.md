---
name: layer-compositing
description: Build and review 3D-derived decorative layers, depth-aware effects and explicit blend relationships for the 3D Artist role while preserving sharp semantic HTML and documentary evidence.
---

# Layer compositing

The 3D Artist owns the image-processing graph and shader implementation. Cinema supplies optical intent; Lighting Designer supplies illumination; UIUX owns semantic surfaces; the Director agrees influence edges and the Motion Designer supplies the sole response state. A second Compositor role would duplicate these responsibilities for the current single-scene case.

Read `research/round-02/COMPOSITING_CONTRACT.md` from this role root, or `roles/3d-artist/research/round-02/COMPOSITING_CONTRACT.md` from the repository root. Source verification lives beside it. These research files remain in the role workspace when the launcher copies this skill into the isolated home.

- Define an acyclic graph before writing passes: linear scene color/depth, depth-aware optical image, luminance/coverage-derived decoration, output transform, protected HTML. Name the input, operation, output, controlling score field and final writer for every edge.
- Build ASCII from the rendered object's sampled luminance and depth/coverage. Random glyphs or a text animation that happens to follow scrolling is not geometry-derived ASCII. Distinguish a scene-derived mask from a subject-only mask; a floor with depth will also pass a depth-only mask.
- Preserve a clean scene sample for the effect input. Do not recursively feed a composited ASCII output back into its next sample. Do not read back pixels each frame when one GPU pass can express the operation.
- State each blend operator and its color space. `screen`, multiply and normal alpha are different operations, not generic opacity names. Keep Photoshop-inspired blend controls within their own effect group; never apply page-wide blending to essential text or source photographs.
- Reuse root-pinned Three 0.186.1 and existing role code where suitable. Confirm installed source APIs before using newer web examples. Use one linear-HDR-to-display conversion, bounded pass resolution, deterministic resize and explicit resource disposal.
- Keep decoration below HTML and suppress it within padded screen rectangles of prose, controls and evidence media. Keep labels available with no JavaScript/WebGL and no motion. ASCII is decorative and hidden from accessibility APIs.

Verify rendered influence, not just uniform changes: isolate light changes and prove glyph coverage/intensity reacts; isolate focus changes and prove near/far sharpness differs; move a protected rectangle and inspect the mask. Capture off/on and reverse states. Check clipping/transparent-depth limitations, idle CPU and GPU behavior, context loss, repeated mount and mobile budget.

Do not rewrite source evidence or present filters, rigid separations, false colors or derived glyphs as structural simulation or measurement.
