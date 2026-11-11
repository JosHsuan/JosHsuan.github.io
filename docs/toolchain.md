# Development toolchain

Baseline selected on 2026-10-06: Windows, Node 24.19.0, pnpm 11.19.0. CI pins the same versions on Ubuntu. This execution host supplies pnpm through a bundled launcher; npm is not available on PATH and is not required.

Dependencies come from `https://registry.npmjs.org/`; exact direct versions and the resolved graph are recorded in `package.json` and `pnpm-lock.yaml`. CI uses a frozen install and strict peer checks. pnpm `allowBuilds` permits esbuild and sharp; unrs-resolver uses its packaged native binding without its postinstall. The explicitly selected fresh Next.js release and matching platform packages are listed in pnpm's generated release-age exceptions.

The 11 November [architecture review](ARCHITECTURE_REVIEW_20261111.md) patches
Zod alone to **4.6.6** after reviewing its collection-bound security fix. It
also records the development-only minimatch advisory and the installed caller's
unaffected optimization configuration. Node/pnpm and the lint/parser cohort stay
pinned; the report does not claim that every development advisory is absent.

TypeScript 5.9.3 satisfies the installed typescript-eslint 8.71.1 range (`>=4.8.4 <6.1.0`). ESLint 9.39.1 satisfies the installed eslint-plugin-react peer range (through `^9.7`); its registry deprecation is recorded. Upgrade to ESLint 10 only with a compatible Next/React lint dependency group. No ignored peer conflicts or force flags were used.

The initial framework work used the existing local `r3f-fundamentals` skill for
Canvas/client boundaries, demand rendering and ownership. The 11 November
[skill integration review](SKILL_INTEGRATION_REVIEW.md) records the expanded
design, R3F and engineering skill inventory, inspected upstream revisions and
local verification. Follow [the agent workflow](AGENT_WORKFLOW.md) to select
skills without replacing current design contracts or runtime ownership. No R3F
MCP dependency was added to the site.

The optional `qa-only` tooling has its own pinned gstack, Bun and Chromium
installation outside this repository. It does not replace this project's
Node/pnpm versions, Playwright dependency, tests or CI gates. Its Windows adapter
and isolated installation smoke test are documented in the integration review.
Skill scripts and browser binaries are local development tools, not runtime or
build prerequisites for the website.

Actual package/type inspection, TypeScript, ESLint, Node test runner via tsx, Next webpack builds, and Playwright provide repository-local validation. See `compatibility.md` for results. No browser authoring tool or real-device GPU check should be inferred from these checks.
