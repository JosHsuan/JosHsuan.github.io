# Maintaining public content

[`src/data/portfolio.ts`](../src/data/portfolio.ts) is the shared source for the interface, static route generation and PDF CV. [`src/data/types.ts`](../src/data/types.ts) defines the public contract. Write English, plain-text content and keep supporting evidence in a separate private record.

## Project and CMS contract

The module exports `profile`, `projects`, `filters`, `capabilities`, `experience`, `education`, `publications` and `awards`. `projects` is an ordered `Project[]`; `featured` selects home-page work. Each project has these fields:

| Fields | Shape and purpose |
| --- | --- |
| `id`, `slug` | Stable, unique strings. `slug` becomes `/projects/<slug>/`; use lowercase words separated by hyphens. |
| `title`, `subtitle`, `year` | Display strings. `year` may be a period or a neutral study label when an exact date is unresolved. |
| `category`, `tags`, `featured` | One category ID, search keywords as `string[]`, and a boolean. |
| `summary`, `context` | A concise project overview and the design or research question. |
| `role` | `{ type, personal: string[], team: string[], scope }`. Describe specific personal tasks, shared outcomes and the boundary of attribution. |
| `method`, `process`, `result`, `tools` | Separate `string[]` lists for the approach, development steps, documented outcomes and tools. |
| `credits` | `{ name, role }[]`, distinguishing collaborators, tutors, photographers and reference authors. |
| `links` | `{ label, url }[]` of verified public references or repositories. |
| `media` | The image/media structure below. |
| `scene`, `sceneCaption`, `accent` | An illustration key, its explanatory caption and a CSS colour. |

Category IDs are `research`, `fabrication`, `computational`, `creative` and `xr`. Filter display labels live in `filters`. Scene keys are `bending`, `dots`, `aggregation`, `stacking`, `garden`, `waffle`, `toolpath`, `subdivision`, `cutting`, `surface` and `none`. A scene key selects an existing illustration; it does not import an original project model.

For a future CMS, store the same public fields as JSON records and map them to these TypeScript interfaces through an adapter. There is currently no CMS connection or runtime import endpoint. The authored TypeScript module includes helpers and spreads, so it is not a raw JSON file.

Validate CMS records before adding them: unique IDs/slugs, supported category and scene keys, required strings, arrays with the correct item shape, valid public links, and positive image dimensions when supplied. Preserve record ordering and stable published slugs. Keep rich text as plain strings unless an explicit renderer and sanitisation contract are introduced. Run `pnpm typecheck` and the complete production checks after adaptation.

Other export shapes are defined alongside `Project`: profile/contact strings; capability descriptions and tool lists; experience descriptions; education focus; publication title/authors/venue/year/URL; and award title/distinction/year. Do not infer current employment, degree conferral or publication details from a historical record.

## Personal work and shared outcomes

For each content update:

1. Check the primary role description and the relevant page, figure or code contribution. A portfolio cover, folder name or team photograph alone does not assign every task to one person.
2. Put supported personal tasks in `role.personal`. Put collective research, fabrication and installation in `role.team`. Use `role.scope` for a concise boundary when responsibilities are only partly recorded.
3. Separate documented results from intentions, proposals and simulations. Quantitative claims need a stated source and comparison basis; avoid converting design goals into measured performance.
4. Preserve credit roles. A tutor, photographer or source-library author is not automatically a project coauthor. Verify names and dates rather than silently resolving conflicting records.
5. Confirm that the public wording fits the permitted scope. Keep company/client details and restricted work out of the public records until their publication conditions are established.

The current public copy uses conservative historical dates and contribution descriptions. Add public repository links only after verifying the repository and its relationship to the project. A proceedings contents link should remain labelled as contents rather than as the full paper.

## Images, video and models

`media` uses this shape:

```ts
interface ProjectMedia {
  status: 'original' | 'illustrative' | 'unavailable';
  label: string;
  images: Array<{ src: string; alt: string; caption: string; width?: number; height?: number }>;
  video?: { src: string; caption: string };
  model?: { src: string; caption: string };
}
```

Use root-relative public asset URLs such as `/images/example.webp`. Image captions identify the outcome and its creator, with relevant assembly or method credits; alt text describes what is visible. `original` means a verified project image, even when resized or cropped for the site. `illustrative` means a separately made explanatory asset. `unavailable` uses an empty image list and a neutral label.

`video` and `model` are reserved optional fields. The current interface does not render them; filling those fields alone does not add a player or model viewer. A future implementation needs accessible DOM controls, captions, loading/failure fallbacks and device testing. Models also need confirmed version, units, axes and permitted use before conversion or display.

Project authorship and media permission are separate checks. The present permission covers personally made material outside company, client and NDA restrictions. It does not automatically cover another person's photographs, team-wide assets, reference artwork or industry models.

Before adding a derivative, record privately its source locator, creator, permission scope, source/output hashes, crop or conversion, and visual review. Inspect the complete source context and the actual output. Retain or restore the applicable credits in the public caption, remove embedded private metadata, and copy only the approved derivative into `public`. Keep source PDFs, native design files, evidence records and private paths outside the repository. Do not publish an entire source document to obtain one image.

The original Inside Out prototype photograph, generative-art poster and mesh global/detail images are project outcomes. The site's SVG diagrams and interactive subdivision mesh are new explanations. The interactive mesh uses a synthetic sphere and refinement operations; it does not reproduce the coursework model, Mola implementation, manufacturing output or structural simulation. Preserve `sceneCaption` and this distinction when changing the scene or artwork.

## CV and release checks

Update the public profile and chronology arrays first, then run:

```sh
pnpm build:cv
pnpm typecheck
pnpm build
pnpm test
```

`scripts/create-cv.mjs` renders a fresh public PDF from these arrays at `public/cv/chia-hsuan-chao-cv.pdf`; it does not copy the private CV. The production build generates the printable HTML document at `profile.cvUrl` in `dist`. Review both documents after a content change. Keep only the intended professional contact details; omit private addresses, birth dates and unrelated personal records.

The production safety scan checks deployable output, while browser tests cover navigation, assets and interactive fallbacks. Neither establishes ownership or publication permission, so review attribution and rights before building. See [deployment](deployment.md) for route and release verification, and [local 3D inspection](3d-inspection.md) for the development-only scene workflow.
