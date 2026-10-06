# Development toolchain

Baseline selected on 2026-10-06: Windows, Node 24.19.0, pnpm 11.19.0. CI pins the same versions on Ubuntu. This execution host supplies pnpm through a bundled launcher; npm is not available on PATH and is not required.

Dependencies come from `https://registry.npmjs.org/`; exact direct versions and the resolved graph are recorded in `package.json` and `pnpm-lock.yaml`. CI uses a frozen install and strict peer checks. pnpm `allowBuilds` permits esbuild and sharp; unrs-resolver uses its packaged native binding without its postinstall. The explicitly selected fresh Next.js release and matching platform packages are listed in pnpm's generated release-age exceptions.

TypeScript 5.9.3 satisfies the installed typescript-eslint 8.71.1 range (`>=4.8.4 <6.1.0`). ESLint 9.39.1 satisfies the installed eslint-plugin-react peer range (through `^9.7`); its registry deprecation is recorded. Upgrade to ESLint 10 only with a compatible Next/React lint dependency group. No ignored peer conflicts or force flags were used.

The installed local `r3f-fundamentals` skill was read and applied to Canvas/client boundaries, demand rendering and ownership. Its source is the existing local skill installation; upstream revision and license are not independently verified here. No R3F MCP server was discovered or used, and no MCP dependency was added to the site. These optional tools are not runtime prerequisites.

Actual package/type inspection, TypeScript, ESLint, Node test runner via tsx, Next webpack builds, and Playwright provide repository-local validation. See `compatibility.md` for results. No browser authoring tool or real-device GPU check should be inferred from these checks.
