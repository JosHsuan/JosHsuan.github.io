# Public Bending-Active release

The owner authorized GitHub Pages publication on 8 October 2026 after making the repository public. [Decision 0006](../../../../../docs/decisions/0006-public-thesis-pages.md) records the boundary. `story.json` contains only the visible presentation; `manifest.json` enumerates 15 approved assets and their exact checksums. This directory is intentionally public. Original CAD, unrelated media and private preparation/audit records are excluded.

Run from the repository root using Node 24.19.0 and pnpm 11.19.0:

```sh
pnpm build:pages
pnpm test:pages
node scripts/serve-pages.mjs
```

The disposable artifact is `.pages-workspace/out/`, previewed at `http://127.0.0.1:4186/`. It uses the same maintained cinematic runtime as the local case. Only the release allowlist is copied; the original local `public/assets` folder is never scanned by the public build. The private shell-hull dependency has been removed because the current verified source/base revision uses combined bounds.

The canonical site is `https://joshsuan.github.io/`. `/release.json` identifies the deployed commit. CI validates the original framework and public case; deployment consumes the successful same-commit `static-export-pages` artifact without rebuilding.

Full source geometry and existing fallback/quality controls are retained. Model/HDR transfer and triangle counts still exceed earlier mobile/source budgets. Physical phone performance is not certified. Original source attribution and year uncertainty remain visible; publication does not fabricate missing credits or engineering evidence.

## Local verification — 8 October 2026

The public build passed its 58-file artifact audit with all 15 allowlisted assets and no private inputs. All nine public browser tests passed across Chromium, WebKit and 390px mobile emulation, including source links, real shell/base loading, chapter navigation, Light mode and fallback reading. The 90 full-source projection checks remain unchanged after removing the private hull import. Root pnpm check passed (9 unit/controller tests and 63 audited output files), followed by 9 built-framework browser tests. Local Firefox assertions were not repeated after the previously recorded host launch failure; remote CI runs the framework Firefox project on Linux.

## Linux CI synchronization follow-up

The first completed public-case CI run passed eight of nine browser tests. Desktop Chromium reached the native SYSTEM chapter, but a traced GPU readback stalled a single evaluation for more than six seconds, exceeding the original five-second assertion limit. The smoke test now verifies native chapter selection, a settled visual playhead and actual rendered layer separation with a bounded 30-second wait. Continuous trace screenshots are disabled; DOM snapshots and source traces remain available. The scene implementation and separation threshold are unchanged. All nine local public browser tests passed again after this test-only correction; the new commit must pass Linux CI before deployment.
