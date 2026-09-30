# JosHsuan — Personal portfolio

Computational design, XR and digital fabrication by Chia-Hsuan Chao.

The portfolio presents 15 main projects and four Lab studies within a frosted-glass
terminal workspace. A static neutral background leaves room for a future scene
without coupling it to content or navigation.

## Development

Requires Node.js 24 and pnpm 10 or later.

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm test
pnpm build
pnpm preview
```

The Vite development server runs at `http://127.0.0.1:5173/`; production preview
runs at `http://127.0.0.1:4173/`. `dist/` is generated and ignored.

## Content and architecture

- `src/content/portfolio.ts`: project records, media descriptions, roles and credits.
- `src/ui/Terminal.tsx`: workspace layout, navigation, filters and reading positions.
- `src/ui/CaseStudy.tsx`: case reading and modal image enlargement.
- `src/ui/Profile.tsx`: About and Contact.
- `src/ui/WorkspaceBackdrop.tsx`: independently replaceable static background.
- `src/opening/`: reversible, scroll-driven expansion and input routing.
- `scripts/build-pages.mjs`: complete static case HTML, metadata and sitemap.
- `public/media/`: optimized project images, thumbnails and an editorial diagram.
- `docs/media-provenance.json`: source register for exported project media.

Both hash navigation and static paths such as `/work/echoxr/` open the workspace.
Static pages preserve full case text and images without JavaScript. The owner’s
original portfolio PDFs and company repositories are not bundled.

## Interaction

Scroll outside the compact window to expand it, or use either direct entry button.
Upward input outside reverses immediately. Inside the terminal, reading has
priority until content reaches its top; further upward input returns to the compact
window. The titlebar also provides direct collapse. Reduced motion opens a static
expanded workspace. Background 3D and particle features are not mounted.

## Publication

The GitHub Actions workflow tests and builds main pushes and pull requests. Main
pushes publish `dist/` to GitHub Pages when the repository’s Pages source is set to
GitHub Actions. Live site: <https://joshsuan.github.io/>.

See [release notes](docs/portfolio-release.md) for source decisions and verification.
The [credits page](public/credits.html) preserves project attribution and the
retained historical Thinker mesh’s CC BY-SA 4.0 license.
