# Chia-Hsuan Chao — portfolio

An English portfolio of computational design, fabrication, research and interactive systems. Project pages distinguish personal contributions, shared work and collaborator credits. Selected original images accompany new explanatory diagrams; the Mesh Subdivision page also includes an optional interactive 3D study.

The site uses React, TypeScript and Vite, with React Three Fiber for the method illustration. It builds static route documents for GitHub Pages, including readable content without JavaScript, sharing metadata, a sitemap and an unknown-route fallback.

## Local development

Use **Node.js 24+** and **pnpm 11**. The exact pnpm version is declared in `package.json`; dependencies are locked in `pnpm-lock.yaml`.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open `http://127.0.0.1:5173/`. Edit public content in [`src/data/portfolio.ts`](src/data/portfolio.ts); its contract is defined in [`src/data/types.ts`](src/data/types.ts).

## Verify a production build

```sh
pnpm exec playwright install chromium
pnpm build:cv
pnpm typecheck
pnpm build
pnpm test
pnpm preview
```

`build:cv` creates the public PDF from curated profile data. Run it after CV changes and **before** `build`; the build does not regenerate the PDF automatically. On Windows the CV generator and browser tests use installed Chrome. Linux uses Playwright Chromium.

`build` writes `dist`, generates static routes and the printable HTML CV, and checks deployable files for private content and development control code. `test` starts its own production preview on port 4173; stop a manual preview before running it. `preview` opens the built site at `http://127.0.0.1:4173/`.

Browser reports and traces go to the operating-system temporary directory by default. Set `PORTFOLIO_QA_DIR` to retain them in a private directory. Keep evidence, source documents and development inspection output outside this public repository.

For optional desktop/mobile screenshots and initial layout-shift/resource observations, run `node scripts/observe-performance.mjs` against a running preview. Set `PORTFOLIO_BASE_URL` to choose the preview or deployed URL and `PORTFOLIO_QA_DIR` to a private output directory. These browser observations are not a throttled device benchmark or a production speed guarantee.

## Maintenance

- [Content schema, attribution and media updates](docs/content.md)
- [Static routes and GitHub Pages deployment](docs/deployment.md)
- [Opt-in localhost 3D inspection](docs/3d-inspection.md)

The public website needs no AI account or MCP server. The inspection bridge is restricted to an explicitly enabled local development session and is excluded from production builds.
