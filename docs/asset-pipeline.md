# Content and public assets

All four source files are empty. No private originals are required to build the site.

The designated external preparation root is `D:\JosHsuan_Website\_private\portfolio-preparation`. Its current project packs, CV draft, evidence, attribution and asset manifests govern materials/content preparation. This document describes only the repository's eventual publication inputs. See [architecture Section 12](architecture.md#12-content-architecture-and-materials-preparation) for source priorities, the inventory, schema differences and the inactive future handoff.

The current integration is documentation-only. No importer, watched folder, environment-variable binding or preparation script connects that root to the website. `website-candidates.json` is a provisional private format, and its flags do not map automatically to `published` or `approved: true`. Preparation `public-export/` contains only its directory marker. English public copy and selected assets will be discussed before any material enters the repository inputs.

- `content/projects/index.json`, `content/research/index.json`: arrays. A draft may contain `status`, `id`, `slug`, and optional `title`. Published entries must satisfy the complete schema in `src/content/schema.ts`.
- `content/profile/index.json`: `null` until approved profile data exists. Email, external links and CV are optional; absent values render no links.
- `content/assets.manifest.json`: approved public files only, with logical ID, root-relative path, revision, SHA-256, alternative text, and credit.

Schemas reject unknown fields. Drafts never enter the public snapshot or generated routes. Keep private notes and private source assets outside these files and outside a potentially public repository. Do not use a draft record as private storage.

Put web assets in `public/media`, `models`, `decoders`, or `downloads`. Files in `public` are deployed even when unlinked, so validation rejects unlisted files and mismatched hashes. `.gitkeep` files reserve directories only. Local asset URLs pass through `publicAssetUrl()` exactly once; external links use explicit HTTPS fields.

For future geometry: normalize meters/Y-up, pivot and semantic node IDs; preserve required topology/attributes; measure before selecting a decoder. Review the optimized geometry, metadata and binding behavior. A scene requires an approved poster in the same manifest. Raw CAD/Blender source is not a web artifact.

`pnpm content:export` validates then writes a stable public JSON snapshot and concrete entry routes. No timestamps make repeated empty exports differ. `pnpm build` runs this automatically. Generated snapshots are reviewable; generated route files are ignored and recreated. Database/Neon export is deferred until there is an actual authoring need; UI depends only on the snapshot-reading interface.
