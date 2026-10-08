# 0006 — Publish the completed thesis presentation to GitHub Pages

Date: 2026-10-08 (Europe/Berlin).

The owner made the repository public and explicitly requested categorised commits, push and deployment of the completed result to GitHub static Pages. This authorizes publication of the completed Bending-Active presentation and its required prepared derivatives. It supersedes the local-only release restriction for this selected presentation; it does not authorize publishing unrelated preparation records, original CAD files or private audits.

## Release boundary

`roles/uiux-designer/cases/bending-active-thesis/release/` is the checked-in public handoff: the visible English story, a checksum manifest, four prepared figures, four corresponding source-page images, two actual-model posters, the verified shell/base GLB, minimal runtime metadata, the existing CC0 environment and preserved license notices. Metadata omits original object IDs, source groups, native paths and private review fields. The original local snapshot and full audit remain ignored. Source originals are unchanged.

Publication is the owner's explicit decision, not an inference that historical attribution questions were resolved. The displayed year disagreement and incomplete individual image/assembly attribution remain visible. The model is an exact presentation derivative, with the existing artistic material, lighting, focus and layer separation; it is not structural validation.

## Build and deployment

`pnpm build:pages` checks release hashes, creates a bounded disposable `.pages-workspace`, copies only enumerated runtime files and approved release assets, then builds and audits its static `out/`. It has no dependency on ignored local media, private framing modules or external drives. Text asset line endings are pinned for Windows/Linux reproducibility. No new npm dependency or lockfile change is required.

The original root framework, generated routes and public-content arrays remain empty and separately tested. The completed case is deliberately the deployed home page at `https://joshsuan.github.io/`; a broader portfolio/navigation system is not invented for this release. Automatic scene loading is retained for this owner-requested presentation. Initial reduced motion/Save-Data and failed WebGL retain poster/HTML reading; Light lowers renderer cost. Source-size/triangle overruns and the lack of physical-phone benchmarks remain documented.

CI keeps root/subpath framework validation and adds a clean public-case build, asset/private-data audit and Chromium/WebKit/mobile browser checks. It uploads `static-export-pages` after those checks pass. The separately dispatched Pages workflow verifies a successful `push` CI run from the default branch at the exact selected commit, downloads that tested artifact and deploys it without rebuilding. Pages uses the GitHub Actions publishing source.

This follows GitHub's [custom Pages workflow](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) and [Pages API](https://docs.github.com/en/rest/pages/pages) contracts. Push continues to validate; future deployment remains an explicit manual action.

## Verification record

The public artifact must pass `pnpm build:pages`, `pnpm test:pages`, root `pnpm check` and built-root browser tests before the authorized first deployment. Remote CI/deployment run records provide commit-specific evidence; `/release.json` identifies the deployed commit and model revision. Local validation is recorded in the release README. A post-deployment report does not require rebuilding or deploying a different artifact merely to update documentation.
