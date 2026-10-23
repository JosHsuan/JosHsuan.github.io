# Sharing metadata readiness

23 October 2026. Live baseline: `9394233`. This metadata-only candidate is not
published by this record.

## Verified baseline and bounded changes

The exact baseline export has twelve distinct, accurate page titles,
descriptions and self-canonical URLs, except that the Projects description still
advertised only two studies while the visible selection contains eight projects.
The integration audit confirmed the twelve-route sitemap, robots policy and
actual live 404 response. No domain, indexing policy or navigation repair is
introduced here.

Projects now uses a source-backed, count-independent description of computational
design, digital fabrication, spatial interaction, material research, robotic
assembly and XR workflows. Other existing titles/descriptions/canonicals remain
unchanged. Each of the twelve page exports explicitly declares its own Open Graph
and Twitter title/description, with the corresponding Open Graph URL.

The eight project pages reuse their already pinned WebP preview sources, original
dimensions and alt descriptions: Bending's existing model poster, XR's portfolio
main visual and the six generic cases' existing heroes. No image is generated,
recropped, recompressed or replaced. They declare a large-image card; ordinary
Home/About/Projects/Contact declare text-only summary metadata rather than
presenting one project's image as a site-wide identity.

Sharing declarations are page-local, not root metadata. Root layout and the
not-found component remain unchanged, so the error page does not inherit a Home
or project sharing image. Existing 404 noindex behavior remains protected by
export checks. Visible component exports are byte-identical to the baseline;
source JSON/assets, CSS, runtime, robots and canonical policy are untouched.

## Evidence and limits

The helper syntax check, diff check and direct installed ESLint over the helper
and twelve changed JSX files passed. Integration then completed the declared
`node scripts/build-pages.mjs`: 260 output files / 137 assets, including actual
head checks for all twelve routes, eight original WebP previews, 404 protection
and the body-only XR image guard. The legacy XR assertion now distinguishes
permitted metadata URLs from prohibited visible body-image use.

Local validation passed: portable 611 total (609 passed, two existing skips),
124 CI-contract tests, nine root tests, and direct root lint/type checks. These
are local results, not remote full-browser or publication acceptance. Remote
exact-candidate validation and same-artifact release/live verification remain
pending.

These declarations do not prove external crawler fetching, WebP support,
platform crop/render choices, search ranking or click-through improvement. In
particular, Entrance's portrait original is retained without promising a safe
landscape preview crop. No external platform account, analytics or marketing
claim is added. Missing prior OG/Twitter declarations was a preview-control gap,
not proof that sharing was broken.
