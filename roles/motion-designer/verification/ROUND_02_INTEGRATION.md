# Round 02 integrated browser acceptance

The frozen local case passed **28 / 28 check groups** on 8 October 2026, 11:24:46–11:29:09 Europe/Berlin. The command exited 0 and all test browser contexts closed. The tested built HTML SHA-256 is `a77a84e572bd6b0db9886d73f4c37810ae895bd9af39d8b66b757097679dfa79`.

Run the [acceptance harness](../../uiux-designer/cases/bending-active-thesis/scripts/verify-round02.mjs) with Node 24.19.0 against the existing `http://127.0.0.1:4184/` preview. It uses the committed root Playwright and Next image decoder; it adds no dependency. `--profile=chromium|webkit|mobile` and a `--check=` name substring are available for scoped repair checks. Filtered runs have separate report names and cannot silently overwrite the full matrix.

| Profile | Groups | Evidence scope |
|---|---:|---|
| Chromium, 1440 × 1000 | 8 | Real source objects; kinetic response and idle; all seven holds and reverse/fast travel; fixed-stage focus; DOM/source-link keyboard actions; pointer/pause/reduced/resume; actual optical/light/ASCII pixels and masks; resize resources |
| WebKit, 1440 × 1000 | 7 | The same source, response, chapter, optical, DOM, lifecycle and resource checks; detailed pixel A/B comparisons are in Chromium |
| Chromium touch emulation, 390 × 844 | 7 | Actual dispatched touch gesture, native reading, full source shell/base, chapters, optics, controls, fallback preference changes and resource stability |
| Fallback and artifact checks | 6 | No JavaScript; initial reduced motion; Save-Data and deliberate loading; blocked model; unavailable WebGL and real context loss; local-only artifact boundary |

The source derivative contains 227,521 triangles and 172,789 vertices across three visible source layers. Browser metadata resolves 13 lower group-78 objects and 37 upper group-77 objects, with 50 distinct base source IDs, plus the intact shell. SYSTEM holds the display separation and MAKE restores exact source-relative positions. This is not a construction or deformation simulation.

Full detail requests two samples with depth resolve; Light requests zero and disables shadow, depth blur and ASCII. The browser checks inspect those current renderer/compositor states. Actual repeated resize/quality cycles retained **5 geometries, 6 textures and 8 warmed shader programs** in each profile. Once settled, frame counters remained unchanged during the idle interval; normal-profile consoles had no errors.

## Actual image comparisons

The lens comparison changes focal length while retaining camera position and target. The focus comparison changes the axial focus plane on the same real source geometry. These differences come from captured pixels, not just reported uniforms.

| Comparison | Changed pixels |
|---|---:|
| Focal length | 681,390 |
| Key-light intensity | 179,365 |
| Focus distance | 4,996 |
| ASCII on/off | 29,836 |
| Actual protected reading region, 262,944 pixels sampled | 0 |
| Full-viewport exclusion mask | 0 |

Changed means summed RGB difference greater than 3 out of 765. The detailed per-comparison means, image dimensions, masks and captures are preserved in the report. Final Chromium SYSTEM and mobile FORM captures were also opened visually: the source base is visible, the separation explanation is in the SYSTEM text panel, and mobile FORM keeps the complete object below its copy and clear of the chapter rail.

## Repairs evidenced by the browser work

An early harness wait could observe the previous settled state because native wheel/scroll dispatch had not yet committed. The harness now waits for actual movement and lets the resulting scroll handler schedule before inspecting settlement.

A later real Full-detail trace contained a 316.7 ms render frame. The original 250 ms stale threshold skipped its deceleration tail. The response now analytically integrates ordinary heavy frames and reserves stale seeking for gaps over one second; explicit hidden/resume and reduced-motion behavior still seek immediately. Two numerical regression cases cover the observed heavy frame and time consistency down to 3 Hz. The final browser matrix confirms acceleration, deceleration and exact idle settlement with this fix. There are **17 passing numerical tests** across the response and source-element modules.

## Evidence location and limits

The full report is `D:/JosHsuan_Website/_work/bending-active-thesis/round-02/verification/browser-round02.json`. It records the artifact hash, all named groups, response histories, chapter states, request transfers, resource counts and pixel comparisons. Captures are in that same working directory. The actual earlier failing trace is preserved as `browser-round02-pre-heavy-frame-fix.json`; it must not be presented as the final result.

This matrix proves local behavior and rendering, not 60 fps performance or physical-device compatibility. Mobile is emulated; Firefox was not part of this matrix. Independent CAD vertex/normal/index fidelity is verified by Geometry Engineer, not inferred from browser counts. The full faithful model still exceeds the initial triangle/mobile-transfer targets; quality and data-saving fallbacks do not erase those measurements. Public release and structural analysis remain outside this local review.
