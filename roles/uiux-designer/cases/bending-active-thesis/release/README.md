# Public Bending-Active release

The owner authorized GitHub Pages publication on 8 October 2026 after making the repository public. [Decision 0006](../../../../../docs/decisions/0006-public-thesis-pages.md) records the boundary. `story.json` contains only the visible presentation; `manifest.json` enumerates 36 approved assets and their exact checksums. This directory is intentionally public. Original CAD, unrelated media and private preparation/audit records are excluded.

Run from the repository root using Node 24.19.0 and pnpm 11.19.0:

```sh
pnpm build:pages
pnpm test:pages
node scripts/serve-pages.mjs
```

The disposable artifact is `.pages-workspace/out/`, previewed at `http://127.0.0.1:4186/`. It uses the same maintained cinematic runtime as the local case. Only the release allowlist is copied; the original local `public/assets` folder is never scanned by the public build. The private shell-hull dependency has been removed because the current verified source/base revision uses combined bounds.

The canonical site is `https://joshsuan.github.io/`. `/release.json` identifies the deployed commit. CI validates the original framework and public case; deployment consumes the successful same-commit `static-export-pages` artifact without rebuilding.

Full source geometry and existing fallback/quality controls are retained. Model/HDR transfer and triangle counts still exceed earlier mobile/source budgets. Physical phone performance is not certified. Original source attribution and year uncertainty remain visible; publication does not fabricate missing credits or engineering evidence.

## Round 07 — rendering pressure and reading layers, 9 October 2026

The existing 36 assets and story remain unchanged. The rear Canvas now sits beneath distinct rounded reading surfaces, with shared-light rims replacing foreground masks. Allocation guards, bounded sustained-pressure density relief, compact glyph sampling and controller/lifecycle cleanup reduce work while retaining source geometry and authored optics. [Round 07 verification](../ROUND_07_VERIFICATION.md) separates measured engine results from unverified physical Safari behavior.

## Round 06 — historical autonomous source chapters, 8 October 2026

IBM Plex, rounded shadowboxes, semantic entrances and orange-photo reveal accompany source-native vector diagrams and direct 3D interaction. Seven actual CAD representations join the unchanged assembly model. A single shared clock drives chapter camera/light/focus loops, diagram emphasis and an independent pointer-responsive ASCII field. Essential reading cores remain transparent to the foreground Canvas. Pause, Reduced, native reading and static SVG/model fallbacks remain supported.

The manifest now enumerates 36 assets: the earlier 15, three fonts and their license, the source-representation GLB/JSON, and 15 diagram SVG/JSON/PNG derivatives. The artifact (80 local Windows files; 78 in Linux CI) excludes original AI/PSD/CAD inputs and private audits. `/release.json` includes the commit, diagram revision and IBM Plex identity. Source topology/colors and existing story bytes are preserved. See [Round 06 verification](../ROUND_06_VERIFICATION.md) for browser acceptance and remaining performance/source limits.

## Round 05 — continuous interaction, 8 October 2026

The same public asset allowlist now supports one continuous reading experience. Whole-page damping and measured reading stops coordinate the DOM, source camera, layers and source-fixed light. Model controls live in FORM; evidence sources expand beside their figures. Both former modal interactions are removed. View/layer/light choices survive scrolling, while Reduced and failure fallbacks retain the natural document. Source and story bytes remain unchanged.

Actual owner Saved typography remains unresolved and is explicitly excluded from completion claims. See [Round 05 verification](../ROUND_05_VERIFICATION.md) and the [cross-role direction](../../../../experience-director/research/ROUND_05_DIRECTION.md).

## Round 04 — historical, 8 October 2026

FORM and SYSTEM now offer an optional model study: view controls, source-layer separation and source-fixed Studio/Raking/Silhouette lighting. It reuses one Canvas and the approved GLB, returns to the same reading position and supports direct control under reduced motion. The explicit build allowlist adds the inspection modules and 514-point framing support derived from the existing public GLB; no source asset or narrative bytes change. See [round-04 verification](../ROUND_04_VERIFICATION.md) and the [all-role research/development plan](../../../../experience-director/research/ROUND_04_PLAN.md).

## Round 03 — historical, 8 October 2026

This release added satin metal, a graphite exhibition sweep, area lighting, masked highlight diffusion, deliberate model exit/return, element-specific motion and native evidence inspection. The approved story and source GLB were unchanged. Two actual-scene fallback posters replaced their preceding captures. See [round-03 verification](../ROUND_03_VERIFICATION.md) for the dated results and limits.

CI now runs the portable case tests before building. The public artifact audit contains 59 files and the same 15 approved assets. The public browser matrix contains 18 tests across Chromium, WebKit and mobile Chromium; the original framework remains a separate root/subpath CI matrix. Deployment still requires a successful exact-commit push workflow and consumes its existing artifact.

## First public release verification — historical, 8 October 2026

The public build passed its 58-file artifact audit with all 15 allowlisted assets and no private inputs. All nine public browser tests passed across Chromium, WebKit and 390px mobile emulation, including source links, real shell/base loading, chapter navigation, Light mode and fallback reading. The 90 full-source projection checks remain unchanged after removing the private hull import. Root pnpm check passed (9 unit/controller tests and 63 audited output files), followed by 9 built-framework browser tests. Local Firefox assertions were not repeated after the previously recorded host launch failure; remote CI runs the framework Firefox project on Linux.

## Linux CI synchronization follow-up

The first completed public-case CI run passed eight of nine browser tests. Desktop Chromium reached the native SYSTEM chapter, but a traced GPU readback stalled a single evaluation for more than six seconds, exceeding the original five-second assertion limit. The smoke test now verifies native chapter selection, a settled visual playhead and actual rendered layer separation with a bounded 30-second wait. Continuous trace screenshots are disabled; DOM snapshots and source traces remain available. The scene implementation and separation threshold are unchanged. All nine local public browser tests passed again after this test-only correction; the new commit must pass Linux CI before deployment.
