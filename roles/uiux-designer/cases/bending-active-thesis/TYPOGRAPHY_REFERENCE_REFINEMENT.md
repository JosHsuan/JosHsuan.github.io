# Owner-reference typography refinement — 21 October 2026

## Scope and evidence

The owner rejected the heading-only size refinement and requested the font,
tracking, leading and text arrangement of https://weitingworks.com/about across
all levels. This supersedes the former OCR B / Space Grotesk identity only for
this typography correction. No reference-site content, branding, assets or
terminal-window layout is copied. Original source assets and scene recipes,
motion clocks, information-skin behavior and the empty reusable framework remain
unchanged.

Cloud Chromium DOM measurements and an actual screenshot at **1180 × 757**:

| Reference role | Actual family / weight | Size / leading | Tracking |
| --- | --- | --- | --- |
| Navigation | Roboto Mono / 400 | 14 / 20 px | normal |
| Intro and prose | Roboto Mono / 400 | 16 / 24 px | normal |
| Terminal section labels and table entries | Roboto Mono / 400 | 18 / 28 px | normal |
| Name display | Roboto Mono / 400 | 72 / 72 px | −1.8 px (−.025 em) |

Reference prose spans 1068.59 px at x48.20. Intro rows occupy y137.64–161.64
and161.64–185.64; narrative starts y209.64 (24 px separation), ends257.64;
next section starts321.64. Paragraph computed margins are0: do not mistake
utility class names for rendered spacing. The root also loads Source Sans3,
but the inspected visible name, navigation and prose explicitly use Roboto Mono.

Downloaded public HTML/CSS (`/_next/static/css/fc53df6c0efd73ec.css`) declares
mobile prose14/20, section labels16/24 and display36/40; md starts48rem and
changes prose to16/24, labels18/28, display60px; lg display72px. These are
**source-derived mobile values, not a rendered mobile measurement**. Cloud
DevTools responsive mode is organization-denied; it was dismissed, not retried
or bypassed. Reference headings are not indiscriminately small: the useful
relationship is a shared mono face, neutral reading tracking, regular weight and
predictable vertical rhythm.

## Adaptation, not imitation

Use the unmodified, licensed, locally served Roboto Mono variable face at every
Latin text level. See the font provenance record maintained by integration.
`Noto Sans CJK TC`, `PingFang TC`, `Microsoft JhengHei`, then `monospace` are
**system fallbacks**, not bundled assets or guaranteed CJK coverage. The upstream
font does not cover CJK or all arrow symbols. Language-tagged CJK paragraphs use
1.65 leading and normal word breaking; actual CJK platform rendering remains an
explicit browser acceptance item.

| Portfolio role | Size | Leading | Tracking |
| --- | --- | --- | --- |
| Home/Bending H1 | 32–48 px fluid | 1.2 | −.025 em |
| Other page H1 | 30–40 px fluid | 1.2 | −.025 em |
| H2 | 22–28 px fluid | 1.3 | −.025 em |
| H3 / card title | 18–20 px fluid | 1.4 (semantic H2 retains1.3) | 0 (semantic H2 retains−.025em) |
| Main prose and introduction | 16 px, including mobile | 24 px | 0 |
| Metadata values / supporting explanation | 14 px | 21 px | 0 |
| Captions / credits / footnotes | 13 px | 20 px | 0 |
| Labels / metadata keys | 12 px | 18 px | 0 |
| Navigation and controls | 14 px | 20 px | 0 |

The portfolio retains a16px reading floor rather than copying reference14px
mobile prose. Text uses a60ch maximum measure and captions68ch, constrained by
existing panels. Prose separation is1em; main heading separation1rem (hero1.5rem),
subheadings.75rem, metadata key/value separation.25rem. Metadata keys are no
longer forced uppercase. Native navigation wraps rather than shrinking below14px;
existing44px hit-area minima remain. Scene/source frames are untouched.

## Implementation ownership

UI/UX and visual/information hierarchy: `app/globals.css`,
`app/portfolio.module.css`, `app/page.module.css`,
`components/ProjectCaseStudy.module.css`, `components/XRProject.module.css`.
The two old OCR/heading-only override tails were consolidated into coherent role
maps, not another stacked generic shrink pass. Integration owns font provenance,
preload/readiness, manifest pins and built-artifact audit.

`tests/pages/typography.spec.mjs` now checks the unified real font, per-role
leading/tracking and heading bounds, body reading floor, resolved prose sizes,
text clipping, header overlap and responsive hit-area geometry. Chromium actual
glyph checks require custom Roboto for Latin, while permitting truthful native
fallback for unsupported symbols instead of asserting nonexistent font coverage.

## Verification status

Completed source checks: all five CSS files parsed by installed PostCSS;
JavaScript syntax and scoped ESLint pass; `git diff --check` passes.
Rendered candidate/browser/CI acceptance is **pending**, not implied by these
checks. Cloud desktop Terminal can read the same current repository, offering a
permitted same-host preview path after the integration build. No user-computer
access, denied browser-launch retry or public preview tunnel was used.

### Native cloud desktop review, 21 October 09:52–09:58 UTC

The supported preview path succeeded: cloud desktop Terminal (`python3 -m
http.server`, bound only127.0.0.1:4186) serves `.pages-workspace/out`, and cloud
Chromium can reach that same host. This differs from the previously isolated
executor-shell loopback. No external tunnel or user-computer access was needed.

Screenshots were rendered and visually inspected in cloud-browser tool output
at1180×757 for Home, About, XR, Mode/s and Bending. All five show a coherent
monospace hierarchy with readable body text, separate navigation groups and no
horizontal document overflow. About H1 resolves35.4/42.48px, body16/24 with
576.09px60ch cap; Mode/s body16/24 is further constrained to349.31px by its
existing panel. Home navigation resolves14px with44px link and46px identity hit
heights. Bending H1 resolves47.2/56.64px; original source fallback remains visible.
These are human visual/native DOM checks, **not** platform-font instrumentation,
mobile acceptance, animation legibility or a WebGL pass. Bending explicitly
reports3D unavailable in this cloud browser.

The rebuilt candidate includes a language-specific1.65 leading override with
explicit precedence over CSS modules. Browser tests tag a real reading paragraph
and verify the actual cascade. Semantic primary prose is selected before size
checks (undersized prose cannot disappear from the test);60ch and68ch bounds
are compared to same-font rendered measure probes. Mixed symbol/Latin text uses
isolated ASCII glyph probes so a supported Latin fallback cannot hide behind an
unsupported arrow. Home/About/Bending/XR/Mode-s tests attach loaded-font viewport
screenshots in the existing permitted CI desktop and mobile projects for visual
inspection **before release**. Those artifacts and exact-commit browser results
remain pending at this record's writing.
