# Compatibility record — empty framework

Test date: 2026-10-06 (Europe/Berlin). Host: Windows. Node: 24.19.0. pnpm: 11.19.0. Framework baseline commit: `0bfe8d6` (parent `19d8387`); the framework was tested in the working tree and committed without runtime changes. Content schema: 1; no model or motion revisions exist yet.

Registry metadata was retrieved directly from `https://registry.npmjs.org/<package>/latest`. Exact installed versions are in `package.json` and `pnpm-lock.yaml`.

| Group | Selected versions / important peers |
|---|---|
| Website | Next 16.4.0; React / React DOM 19.3.0. Next supports React 19; Node >=20.9. |
| 3D | Fiber 9.8.1 (React >=19 <19.4, Three >=0.156); Drei 10.7.9 (Fiber ^9, React ^19); Three 0.186.1. |
| Motion | Theatre Core / Studio 0.7.2; Studio peers on Core. `@theatre/r3f` not installed. |
| DOM / state | GSAP 3.15.0; @gsap/react 2.1.2; Zustand 5.0.15. |
| Validation | Zod 4.6.5; TypeScript 5.9.3; ESLint 9.39.1 / eslint-config-next 16.4.0; Playwright 1.63.0; tsx 4.23.15. |

Bundler: Next webpack explicitly selected in dev/build. Static export, trailing slashes, unoptimized images, no browser source maps, build-time base path. Authoring modules cause a production compilation failure. A separate output audit rejects editor markers, source files and asset hash mismatches.

| Check | Result |
|---|---|
| Strict/frozen dependency installation | PASS |
| Content, lint, types, unit/controller tests | PASS — 9 tests; empty snapshot/drafts, asset paths, clip bounds, cancellation, late readiness and inspection ownership |
| Root/subpath production builds and audits | PASS — root and `/portfolio-test`, 5 empty sections + 404 |
| Public artifact Chromium / mobile Chromium / WebKit | PASS — 9 checks at root and the same 9 at subpath; navigation, reload/history, no-JS reading, keyboard, preference, 404 and widths 390/768/1440 |
| Firefox | NOT RUN — executable launch failed with `spawn UNKNOWN`, including a retry outside the restricted execution environment; browser assertions did not execute |
| Actual 3D scene / Studio authoring / exported-state replay | NOT RUN — intentionally deferred; no scene or authored data |
| Real iOS / Android, GPU budget and performance | NOT RUN |
| Remote GitHub Actions / Pages deployment / rollback | NOT RUN |

Theatre Core's installed package declares Apache-2.0; Studio declares AGPL-3.0-only. GSAP and @gsap/react declare the GSAP Standard License. The remaining main selected runtimes declare MIT. Studio is isolated from the public module graph, not merely hidden or tagged devDependency.

References: [Next support policy](https://nextjs.org/support-policy), [Next static export](https://nextjs.org/docs/app/guides/static-exports), [R3F installation](https://r3f.docs.pmnd.rs/getting-started/installation). Installed Theatre 0.7.2 type declarations were inspected for playback, subscriptions and project APIs. These sources establish API/peer constraints, not an authored-scene compatibility pass.

WebKit initially skipped the skip-link during Tab navigation. Giving the skip-link an explicit `tabIndex=0` restored focus in the actual browser; the test now verifies both Tab focus and Enter transferring focus to the main region. Browser screenshots were reviewed. [Related upstream keyboard discussion](https://github.com/microsoft/playwright/issues/5609).

The Windows build logged webpack persistent-cache snapshot warnings; compilation and static export succeeded. No claim is made about the unexecuted Linux CI, authored 3D or device performance. Browser reports/screenshots are generated in ignored `playwright-report/` and `test-results/`; CI retains them as artifacts.
