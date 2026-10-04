# Running and deploying the portfolio

The site is a static React, Vite and TypeScript application for the user-site repository `JosHsuan.github.io`. Its public base path is `/`, and its intended production URL is `https://JosHsuan.github.io/`.

## Local workflow

Use Node.js 24 and pnpm 11.19.0. Dependencies are pinned by `pnpm-lock.yaml`.

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm exec playwright install chromium
pnpm build:cv
pnpm typecheck
pnpm build
pnpm test
pnpm preview
```

On Windows the Playwright configuration uses installed Chrome by default. Set `PLAYWRIGHT_CHANNEL` to select another compatible installed channel. Linux CI uses Playwright's Chromium. Test results, screenshots, traces and the HTML report go to an operating-system temporary directory; set `PORTFOLIO_QA_DIR` to a private directory to retain them. They are never uploaded by the deployment workflow.

The tests run against the production build on port 4173. Set `PORTFOLIO_BASE_URL` to test an already-running preview or the deployed website. This bypasses starting a local server. The server and tests do not start an MCP service.

## Static routes and sharing metadata

`scripts/prerender.mjs` reads the curated public `src/data/portfolio.ts` data after Vite builds. It generates complete HTML entry documents for `/about/`, `/projects/`, `/research/`, `/cv/`, `/contact/` and every published `/projects/<slug>/` route. Each document contains a route-specific title, description, canonical URL, social metadata and readable HTML content. React mounts the interactive interface from the same data; the static body remains available when JavaScript is unavailable.

`/404.html` provides a useful unknown-route fallback. Known deep links are directory entry files, so GitHub Pages can serve and refresh them without an SPA redirect workaround. The build also generates a sitemap, `robots.txt` and `.nojekyll`. Keep links and assets rooted at `/` for this user-site repository.

The CV entry links to a standalone print-friendly HTML document generated from the same public profile data. Visitors can view it, print it or use their browser's Save as PDF function. Run `pnpm build:cv` before `pnpm build` whenever CV data changes; this regenerates the public PDF at `/cv/chia-hsuan-chao-cv.pdf`. The deployment workflow regenerates it on every verified build. These documents do not reuse the private source CV or include its private fields.

## Public artifact checks

The build runs `scripts/check-public-safety.mjs`. It checks the complete `dist` tree for private filesystem paths, credential patterns, source/debug formats, non-English copy and development control code. It rejects MCP bridges, WebSocket control and runtime code injection in production. This automated check complements manual attribution and rights review; it cannot establish ownership or publication permission for an asset.

Use only curated public text and assets explicitly cleared for publication. A generated process illustration must keep its illustrative caption. Missing or uncleared source photographs, videos and models must remain excluded from `public` and the public data. Recheck this boundary whenever adding work.

## GitHub Pages deployment

Choose **Settings → Pages → Build and deployment → Source: GitHub Actions**. The workflow in `.github/workflows/deploy.yml` runs installation, typechecking, public CV generation, the production build, public artifact checks and desktop/mobile browser tests. A push or manual run on `main` can upload the verified `dist` artifact and deploy it to the `github-pages` environment. Pull requests run verification without deployment.

The deployment job has only the Pages and OIDC permissions needed by GitHub's artifact deployment flow. No API keys or development MCP credentials are required. Deployment does not run Codex, an MCP server or live injection, and visitors need none of those tools.

After deployment, verify the workflow result and its reported URL. Open the home page, one project deep link, the CV document and an unknown URL, then reload each. Confirm the same fallback, navigation and asset behavior as the production preview. A successful local build alone does not confirm a completed live deployment.

This workflow follows [GitHub's custom Pages workflow documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) and [Playwright's production web-server configuration](https://playwright.dev/docs/test-webserver).
