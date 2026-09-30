# Personal portfolio release

September 30, 2026. The owner requested completion of the personal website and
publication on GitHub, temporarily setting aside the background 3D concept while
retaining the frosted-glass terminal and its interaction design. This supersedes
the earlier local-only phase and paused content work.

## Website scope

- 15 main project entries, six featured cases, and four separate Lab studies.
- Work selection, category filtering, multi-word search and an empty-state reset.
- Individual case pages with original project media, role descriptions, methods,
  credits, source links and previous/next navigation.
- About, selected experience, education, publications, a printable public résumé,
  professional email contact and GitHub profile.
- Keyboard-accessible navigation, focus placement, modal image enlargement,
  reading-position restoration and responsive layouts.
- Static HTML for every case and directory, page metadata, sitemap, robots and a
  useful 404 page. Static routes load the same interactive workspace when JavaScript
  is enabled; without it, the full case text and images remain readable.

## Background and interaction

`ui/WorkspaceBackdrop.tsx` is a separate static background boundary. A future 3D
scene can replace it without owning navigation or reading. Historical scene
modules and the credited Thinker asset remain available, but are not imported
into the active application or its JavaScript bundle.

The background scroll range is now 820 pixels, with expansion across the whole
range. The former 85% empty lead-in served a 3D narrative and is no longer used.
Scrolling upward outside the panel reverses immediately; inside, content reads
upward first and hands input back at its top. Direct expansion and titlebar
collapse synchronize the scroll source. Reduced motion stays expanded. Touch
input has the same top-of-content handoff; pinch gestures remain native.

## Content sources and editorial decisions

The September 27 [content audit](portfolio-content-audit.md) supplies the
deduplicated inventory. Original project images are resized into WebP assets,
with 640-pixel index thumbnails and up to 1600-pixel case images. Original colors
are preserved and embedded metadata is removed. [Media provenance](media-provenance.json)
records the source filename or physical PDF page and image object for every export.
The source archives remain read only and are not uploaded wholesale. Local visual
study references in `references/` also remain outside the public source history.

- EchoXR: the supplied artboards and CV document development responsibilities.
  [ETH Design++](https://designplusplus.ethz.ch/research/concluded-projects/echo-xr.html)
  confirms the research context, team and November 2024–December 2025 project period.
  [IHIET 2025](https://doi.org/10.54941/ahfe1006713) confirms the paper and co-authors.
  The experience date refers to the research project period, not an inferred
  employment termination date.
- Caschlatsch: use the official spelling from the
  [GKR project page](https://www.gramaziokohler.arch.ethz.ch/web/lehre/e/0/0/0/496.html),
  with a full-team link. The [opening record](https://dfab.ch/news/opening-of-caschlatsch)
  supports September 2024 unveiling.
- Metal panels: NCKU's [thesis record](https://thesis.lib.ncku.edu.tw/thesis/detail/e9eac9c2b822e64726474a184f9e5c1a/)
  and [publication listing](https://researchoutput.ncku.edu.tw/en/persons/kane-yanagawa/)
  distinguish the 2020 thesis from the 2023 co-authored CAADRIA paper.
- Heat Rotate Cutting uses 2018–20 because the project metadata and portfolio
  index refer to different dates. The case explains the two archive labels.
- Nan Shan uses 2021–22, preserving the distinction between project metadata and
  the later portfolio index. It retains the three-person development scope.
- Kaohsiung and ChinPaoSan use practice/design-development labels rather than
  silently choosing conflicting project and CV dates.
- Woodflow is one high-level software-practice entry with a newly authored,
  generic editorial diagram and [public company link](https://www.strongbyform.com/).
  It distributes no internal source, infrastructure, roadmap, product values or
  company screenshots, and makes no delivered ERP or production-performance claim.
- Jan Kyselý's credited photographs, Li Wei construction photography, institutional
  context, collaborators, architecture teams and source project credits are retained.
- Birth date, personal phone numbers, third-party CVs and personal-information
  directories are excluded. The public résumé is newly typeset from selected
  professional information; the original CV PDFs are not distributed.

## Build and publication

`pnpm test` checks the reading controller, reversal, routing, bounded panel
geometry, complete content inventory and attributed media availability.
`pnpm build` checks TypeScript, builds Vite, then produces static pages from the
same content records with `scripts/build-pages.mjs`.

`.github/workflows/pages.yml` runs tests and the production build for main pushes
and pull requests. Only main pushes/manual runs deploy the build artifact to
GitHub Pages. Publication and live verification are recorded after execution.

## Verification record

- 20 automated tests pass; TypeScript and the production build pass.
- Desktop preview reviewed at 1280 × 720; mobile at 390 × 844 and 320 × 568;
  landscape at 844 × 390. No horizontal content overflow was found.
- All 19 static case routes were opened in the production browser preview at
  320 pixels wide. Their headings, sections and images load without a WebGL canvas.
- Category filtering, multi-word search, no-result reset and contact email copy
  were verified through the browser interface.
- The image dialog opens, closes with Escape and returns focus to its trigger.
- Native wheel input verifies full expansion, content-first upward reading,
  reversal at its top and immediate background reversal. Both direct expansion
  and collapse synchronize the 820-pixel scroll source.
- The public résumé is readable on mobile and has a print stylesheet. The credits
  page retains project credits, the CC BY-SA license and downloadable adapted mesh.
- Static output checks cover all 19 complete case texts and 275 local references.
  The active JavaScript bundle contains no mounted 3D renderer.
- GitHub Pages now uses the GitHub Actions source. Release commit `fcb81f6`
  was published successfully by [run 36737969752](https://github.com/JosHsuan/JosHsuan.github.io/actions/runs/36737969752).
- The live site at <https://joshsuan.github.io/> was opened in the browser and
  displays the retained frosted-glass workspace and portfolio navigation.
- All 128 published pages and resources match the reviewed production build by
  SHA-256 (text line endings normalized). This covers all case and directory pages,
  résumé, attribution, images, thumbnails, scripts, styles, license files and the
  downloadable retained mesh. An unknown path returns the custom 404 with HTTP 404.
- Raw source archives, local study references and build caches are excluded from
  the public repository. No private company source or original CV PDF is uploaded.
