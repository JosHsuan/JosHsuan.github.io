# Bending-Active Thesis — cinematic local review

Open [the local work page](http://127.0.0.1:4184/). It presents **Bending-Active Metal Panel Deformation**, the NCKU metal-panel thesis, separately from the later T3 bamboo motion-capture/XR project. The owner explicitly confirmed the local-page scope after the texture/shader request and subsequently requested a stronger continuous, layered experience.

One full-viewport background Canvas carries the actual Rhino-derived assembly through seven native-scroll chapters: overview, form, system, pattern, make, validation and credits. Text and source figures remain ordinary HTML. The camera holds and transitions around measured chapter positions, with one final writer; bounded pointer tilt is decoration only. The material moves between satin silver and restrained height-contour/focus emphasis. These are appearance choices, not calibrated finish, stress results or simulated bending.

A continuous viewport scrim protects reading without section-edge seams. Documentary images remain opaque. The optional masthead motion control pauses camera travel and tilt. Initial reduced motion or Save-Data uses the actual rendered model poster without loading model/HDR assets. No JavaScript, failed assets, unavailable WebGL or context loss preserve the full story. Live reduced motion switches a running scene to a fixed pose. The renderer becomes idle after input settles.

## Build and reopen

Use the root's exact Node 24.19.0 / pnpm 11.19.0 and committed dependencies; no renderer upgrade or second app installation is needed.

```powershell
node node_modules/next/dist/bin/next build roles/uiux-designer/cases/bending-active-thesis --webpack
node roles/uiux-designer/cases/bending-active-thesis/scripts/serve.mjs
```

`open-preview.ps1` reuses a matching preview or starts it hidden. The server binds only `127.0.0.1:4184`, serves the case's `out/`, validates Host, permits GET/HEAD and sends `noindex`. Root build, public data, generated routes and deployment remain separate and empty.

Prepared narrative and source derivatives are ignored local artifacts. A new checkout needs an explicit authorized handoff; builds do not search source drives. New working material lives in `D:\JosHsuan_Website\_work\bending-active-thesis\cinematic-integration`: source copies, lossless rectangular crops, narrative JSON, actual-model poster, provenance and browser captures. The Geometry Engineer preparation script verifies original hashes before and after processing and explicitly copies sanitized prepared assets into this review. No source original was edited.

## Integration ownership

| Role | Contribution |
| --- | --- |
| Interactive Experience Director | Primary Lusion/Labs research, shared chapter/layer contract, coordination and independent actual-page visual review; isolated skills and story/browser MCP setup. |
| UIUX Designer | Evidence-grounded English narrative, source figures, responsive foreground composition and native reading order. |
| 3D Artist | Twelve separate texture/shader studies and a continuous UV-free metal adapter; original mesh, normals and PBR lighting retained. Bamboo imagery stays in its independent swatch. |
| Animation Cinematographer | Geometry-based framing, reversible chapter transitions, bounded pointer composition and fixed reduced-motion pose; actual mesh projection/render checks. |
| Geometry Engineer | Verified source revision/object selection, units/axis conversion, topology fidelity and faithful source-image preparation. |

`integration-manifest.json` records explicit camera/material/lighting handoffs. The case has no runtime dependency on other role desks or ports. Project-source records remain internal-only. Year disagreement, incomplete media/assembly attribution and the difference between physical dimensions and CAD bounds are preserved. Public release needs a separate approval; no commit, push or deployment occurs here. The original UIUX Saved export remains uncaptured and is not replaced with fabricated owner preferences.

The 446 real-mesh support points used for tighter FORM framing are a private derivative. They are prepared on D and explicitly handed off as Git-ignored `framing-hull.private.mjs` modules beside the role source and case camera copy. The maintained camera source imports that data without embedding it. Moving the data to the private handoff preserved all 435 sampled results exactly and did not recompute geometry.

## Verification and limits

```powershell
node roles/uiux-designer/cases/bending-active-thesis/scripts/capture-cinematic.mjs
node roles/uiux-designer/cases/bending-active-thesis/scripts/verify-cinematic.mjs
node roles/animation-cinematographer/research/bending-active/cinematic/cinematic-plan.test.mjs
node roles/geometry-engineer/scripts/verify_model.mjs
```

Current captures and `verification/browser.json` are under the D-drive working root. The suite covers Chromium, WebKit and mobile emulation: native wheel/touch/keyboard, one persistent Canvas, seven measured chapters, reverse scrubbing, actual shader pixels, decorative pointer invariance, idle rendering, resource/program stability, manual/live reduced motion, no-JavaScript, Save-Data, asset/context failures and local server boundaries. The Director separately reviews intermediate chapter boundaries; still chapter screenshots alone are insufficient.

On 8 October 2026, all **24 cinematic browser groups** passed against the rebuilt case artifact. Rendering stayed at one draw call, one shader program, one geometry and two renderer-reported textures during repeated chapter traversal. Nine camera tests include projection of every actual model vertex at five aspect ratios and pointer extremes. The Director closed the actual-page seam, diagram opacity, control overlap, framing and ending-contrast findings after viewing revised boundaries and fallback captures. Five source crops still match their prepared/handoff hashes and every original source hash remains unchanged. Root `pnpm check` passed (9 unit/controller tests, 63 audited output files); 9 root browser tests passed independently.

The model remains 84,626 vertices and 131,881 triangles, submitted in one draw call. Model plus HDR is 5,229,924 raw bytes, without a decoder or extra material textures. This exceeds the proposed 2 MiB mobile scene target; DPR 1.5 and demand rendering do not reduce payload. Automatic background loading is a scoped local immersive-preview exception to the root's user-activation default. The poster route supports constrained reading, but physical-device performance, Firefox assertions, remote CI and publication/engineering validation are not claimed.

The former ModelViewer/Scene, old camera adapter, capture-viewer.mjs and verify.mjs describe the previous boxed-viewer revision and are retained as implementation history; their old 25-group result does not validate this page. Use the cinematic commands above. Procedural motion does not constitute an authored Theatre export; the root Theatre/Studio boundary is unchanged.
