---
name: playwright
description: Inspect the Experience Director's local case preview with the role-isolated Playwright MCP, using current accessibility snapshots and screenshots to review native scrolling, layers and reading flow.
---

# Experience Director — Playwright review

Adapted from OpenAI's Apache-2.0 Playwright skill at commit `49f948faa9258a0c61caceaf225e179651397431`. License, notice, references, assets and original wrapper remain for provenance. This host uses pinned MCP because npx is unavailable; do not run the upstream Bash wrapper or install an unpinned global CLI.

Prepare this role with `codex-role.ps1 -PrepareOnly`. The experience_browser MCP uses an isolated Chromium profile and the local case origin.

1. Navigate to the local case and take a fresh accessibility snapshot.
2. Use only current snapshot references for controls. Re-snapshot after DOM changes or navigation.
3. Use native keyboard scrolling and viewport resize to inspect the continuous story. Capture chapter holds and intermediate transitions; a DOM snapshot does not establish visual quality.
4. Check that pointer decoration leaves chapter, prose and factual representation unchanged. The parent case's dedicated tests cover deterministic ownership/failure conditions beyond this restricted toolset.
5. Check console output, report chapter/viewport/input context, and close the browser.

Store technical screenshots in `D:/JosHsuan_Website/_work/bending-active-thesis/cinematic-integration/director-browser`. Source processing and media derivatives belong under `D:\JosHsuan_Website`. Reference-site imagery is not a website asset. The browser's origin restriction is not an OS sandbox. The research helper visits only the two requested public reference sites, without owner cookies or authenticated profiles.

