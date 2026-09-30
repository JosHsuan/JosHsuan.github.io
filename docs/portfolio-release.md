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
- 78 subject-specific case sections and 93 attributed photographs/figures, with
  a contents list for longer cases and figures paired with the methods they explain.
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
  [GKR project page](https://gramaziokohler.arch.ethz.ch/web/lehre/e/0/0/0/496.html),
  with a full-team link. The [opening record](https://dfab.ch/news/opening-of-caschlatsch)
  supports September 2024 unveiling.
- Metal panels: NCKU's [thesis record](https://thesis.lib.ncku.edu.tw/thesis/detail/e9eac9c2b822e64726474a184f9e5c1a/)
  and [publication listing](https://researchoutput.ncku.edu.tw/en/persons/kane-yanagawa/)
  distinguish the 2020 thesis from the 2023 co-authored CAADRIA paper.
- Heat Rotate Cutting uses its chapter date, 2018; Nan Shan uses its chapter date,
  2021. Conflicting index dates are documented in the coverage record rather than
  treated as continuous development periods. Stare at the Silence uses 2023.
- Kaohsiung uses a professional-practice date label because the chapter and
  employment dates do not establish a precise project period.
- The owner's content revision removes Woodflow and ChinPaoSan from the active
  inventory, generated pages, sitemap and dedicated public images. The original
  source archives remain read only.
- Jan Kyselý's credited photographs, Li Wei construction photography, institutional
  context, collaborators, architecture teams and source project credits are retained.
- Birth date, personal phone numbers, third-party CVs and personal-information
  directories are excluded. The public résumé is newly typeset from selected
  professional information; the original CV PDFs are not distributed.

[Content revision](content-revision.md) records the institutional narrative
references. [Case coverage](portfolio-case-coverage.md) maps all retained cases to
their source chapters and records date reconciliation and attribution limits.
[Presentation supplement](presentation-supplement.md) records the two new cases,
the Computational Art expansion and 26 additional presentation-derived figures.

## Build and publication

`pnpm test` checks the reading controller, reversal, routing, bounded panel
geometry, complete content inventory and attributed media availability.
`pnpm build` checks TypeScript, builds Vite, then produces static pages from the
same content records with `scripts/build-pages.mjs`.

`.github/workflows/pages.yml` runs tests and the production build for main pushes
and pull requests. Only main pushes/manual runs deploy the build artifact to
GitHub Pages. Publication and live verification are recorded after execution.

## Initial release verification (before the content revision)

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

## Content revision verification

- 22 automated tests pass. TypeScript, the production build and the strengthened
  static release verifier pass for 17 complete cases and 271 local references.
- The source coverage record accounts for all 62 case sections and 67 project
  photographs/figures, including 23 new process exports with exact provenance.
- All 17 production case routes were reviewed at 320 × 568. Each renders its
  expected sections and figures with no horizontal overflow or WebGL canvas.
- Contents navigation moves focus to the requested heading and scrolls only the
  reading body. The outer terminal clips its contents without becoming an
  additional scroll container. Reduced-motion navigation uses immediate scrolling.
- The new process figure dialog opens, closes with Escape and restores focus to
  its image trigger. Desktop and phone layouts retain readable text and captions.
- Static documents contain a no-JavaScript scrolling override so the complete
  case text remains reachable outside the interactive workspace.

Publication uses the existing [Pages workflow](https://github.com/JosHsuan/JosHsuan.github.io/actions/workflows/pages.yml).
The post-deployment comparison checks every generated page and resource against
the local production build by SHA-256, and separately checks HTTP 404 responses
for both retired cases and their five dedicated media paths. Its local execution
report is kept in the ignored `.asset-cache/live-verification.json`.

## Supplementary presentation verification

- Two new Work cases, HC3DP Caustics and Harmonic Stacking, use the existing
  shared case structure. Planet of Colorful Garden is expanded on its existing route.
- The inventory contains 15 main cases, four Lab studies, 78 sections and 93
  attributed photographs/figures. The 26 new exports include exact slide/media
  provenance and thumbnails. The source presentations are not uploaded.
- All 22 automated tests pass. TypeScript, the production build and static
  release verification pass for 19 complete cases and 321 local references.
- Desktop preview was reviewed at 1280 × 720, with mobile views at 390 × 844
  and 320 × 568. The three supplemented routes render their expected headings,
  sections and figures without horizontal overflow or a WebGL canvas.
- The contents list focuses the selected section heading. The new inflation
  diagram opens in the image dialog, closes with Escape and restores trigger focus.
- Searches for `light lights`, `robotic bricks` and `colorful garden` each find
  the correct case. All projects displays the complete 15-case Work inventory.
- Release commit `f492705` was published successfully by
  [run 36767410848](https://github.com/JosHsuan/JosHsuan.github.io/actions/runs/36767410848).
  Both the build and Pages deployment jobs completed successfully.
- All 221 generated public pages and resources match the reviewed local build
  by SHA-256, with text line endings normalized. All seven retired case/media
  paths continue to return the current custom HTTP 404. The comparison report
  remains in the ignored `.asset-cache/live-verification.json`.

## Printing and motion supplement verification

- The existing Dot-Based Non-Planar Printing case expands from four to eight
  sections using the supplied Group 1 deck, with JunJie added to the team credit.
  Slice-plane, seam, material and fabrication evidence is mapped in the
  [motion source review](motion-supplement.md).
- The inventory remains 15 Work cases and four Lab studies, with six featured
  cases. It now contains 82 sections, 119 attributed media figures and 26 clips
  across seven cases. Static posters keep the index still; clips never autoplay.
- All 26 clips were individually played and paused in the production browser
  at 320 × 568. Every player decoded its expected video, with no playback error.
  All seven routes had zero horizontal content overflow and no WebGL canvas.
- Desktop review at 1280 × 720 verifies the expanded case layout and manual
  playback. Navigating to another section pauses a clip when it leaves the
  reading viewport. A dialog pauses the inline player, plays separately and
  stops on Escape, returning focus to its enlargement trigger.
- The video dialog was reviewed at 390 × 844, with readable captions/credits
  and no horizontal overflow. Viewport overrides were reset after review.
- All 23 automated tests pass, including MP4 atom structure, streaming metadata,
  source timing, visual-only tracks, exact provenance and poster availability.
  TypeScript, the production build and static release verification pass for 19
  complete cases and 399 local references. Static players have native manual
  controls and preserve captions and credits without JavaScript.
- Release commit `0aa8d93` was published successfully by
  [run 36781004855](https://github.com/JosHsuan/JosHsuan.github.io/actions/runs/36781004855).
  Both the build and Pages deployment jobs completed successfully.
- All 299 generated public pages and resources, including the 26 MP4 files,
  match the reviewed production build by SHA-256, with text line endings
  normalized. All seven retired case/media paths return the current custom
  HTTP 404. The ignored `.asset-cache/live-verification.json` retains the report.
- The live printing case was opened in the browser. Its native fabrication
  recording decoded at 1280 × 720, played and paused successfully with the
  expected 10.93-second duration and Group 1 credit.

## Requested recording removal

- The owner requested removing the Caschlatsch numbered-beam guidance recording
  and the companion Group 1 successive-layer deposition recording. Their case
  figures, captions, MP4 files, posters and thumbnails are removed. The original
  archive files remain read only.
- The printing deposition paragraph now describes its retained dot-deposition
  recording. The Caschlatsch assembly-data section retains its text and uses the
  existing layout for sections without media.
- The current inventory contains 82 sections, 117 attributed figures and 24 clips
  across seven cases. Caschlatsch retains one clip and printing retains nine.
- All 23 automated tests pass. TypeScript, production build and static release
  verification pass for 19 complete cases and 393 local references. The release
  check also rejects the six retired media paths.
- Both affected production-preview pages were checked in the browser: the
  requested captions and players are absent, retained recordings appear and
  neither reading body has horizontal overflow.
- Publication uses the existing Pages workflow. The post-deployment comparison
  includes all generated resources and checks that both removed MP4 files and
  their four poster/thumbnail paths return the current custom HTTP 404.

## Looping motion release

October 1, 2026. The owner requests GIF-like motion or continuously looping video
and authorizes adjustment through completion. This supersedes the earlier
manual-only playback policy. The existing 24 silent MP4 exports are retained;
the two previously removed recordings remain excluded.

- Every inline and enlarged player loops. Visible recordings start automatically,
  while offscreen recordings retain their posters and pause. Manual pauses persist
  across scrolling. Reduced-motion users start the loops manually.
- A dialog suspends inline recordings, plays its own loop and stops on close.
  Visible inline recordings resume unless the reader paused them. Hidden pages
  pause playback; returning to the page resumes eligible visible recordings.
- All 24 recordings were individually reviewed at 320 × 568. Every inline and
  modal player had looping enabled; each modal recording started automatically,
  decoded at its expected width and advanced in time without error. All modal
  views had zero horizontal overflow and suspended every inline recording.
- Desktop review directly observed the 2.17-second comparison finish and wrap to
  its beginning, both inline and enlarged. Manual pause persisted after scrolling
  away and back. Closing with Escape stopped the modal and restored focus. A
  visible recording resumed after returning to the reading viewport.
- All 23 tests, TypeScript, production build and release checks pass. Static
  fallback markup preserves native controls and looping for all 24 clips across
  19 complete cases and 393 local references. The fallback requires manual start
  so readers without JavaScript retain control over motion.
- Publication uses the existing Pages workflow, followed by comparison of all
  generated files with the reviewed build and HTTP 404 checks for retired media.

## EchoXR highlights and thesis archive link

October 1, 2026. The owner authorizes selecting short looping highlights from
the supplied EchoXR footage and adding the professor's lab archive link to the
XR-assisted Bending-Active Assembly credits. Source selection and edit windows
are recorded in [the supplement](echoxr-video-supplement.md).

- Four EchoXR excerpts show palm-menu room controls, sound-source manipulation,
  another participant's tracked headset/hands, and co-located lab interaction.
  The silent exports run for 12–13.3 seconds, with a short blended loop boundary,
  still posters and manual pause controls. The physical recording retains real
  timing rather than using the source capture's high frame rate as slow motion.
- Existing narrative sections, project/team credits and bounded contributions
  are retained. The four clips add approximately 8.4 MB. Raw recordings, unused
  takes, audio and embedded source metadata are not published.
- The inventory contains 15 Work cases, four Lab studies, 82 sections, 121
  attributed figures and 28 clips across eight cases. The two owner-removed
  recordings and all other retired routes/media remain excluded.
- All four clips were individually observed completing a natural loop at
  320 × 568. Each decoded without error and suspended the inline players while
  enlarged. Captions and credits fit the dialog without horizontal overflow.
  Manual pause worked, and Escape closed the dialog and restored trigger focus.
- Desktop review at 1280 × 720 confirms zero reading-body horizontal overflow
  and no WebGL canvas. The XAIA Lab link appears after the credit paragraphs in
  Credits & context; its official destination was reviewed in the browser.
- All 23 automated tests, TypeScript, production build and release checks pass
  for 19 complete static cases and 405 local references. Media checks verify
  exact source provenance, posters, durations, one visual track and streaming
  metadata for all 28 clips.
- Publication uses the existing Pages workflow. Post-deployment verification
  compares the 305 generated public resources with the reviewed production
  build and checks HTTP 404 responses for the 13 retired case/media paths.
