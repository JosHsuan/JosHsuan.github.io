# OCR reading and Space Grotesk display typography

Date: 18 October 2026 (Europe/Berlin)

The current owner revision keeps actual OCR for reading and requests a suitable
GitHub-sourced font for titles, together with a site-wide review of tracking and
leading against Apple's UI guidance. **Portfolio OCR B** supplies body text,
navigation, controls, captions and generated diagram labels. **Space Grotesk**
supplies headings and explicitly marked logical titles. This covers Home,
About, Projects, Contact, Bending-Active, XR and the not-found page.

This revision supersedes the earlier same-day one-face OCR implementation before
publication, as well as the earlier IBM Plex selection for active typography.
The approved source images, videos, geometry, camera and motion remain intact.
A bounded search of maintained project Markdown and preparation font-term
context did not identify an earlier OCR-A/OCR-B subtype choice.

## OCR source and rights

The implementation selects **OCR B Regular** from Matthew Skala's
[Tsukurimashou OCR package](https://tsukurimashou.org/ocr.php.en), version
0.3.1, released 30 March 2021 and retrieved 18 October 2026. OCR B has actual
OCR letterforms and a more readable lowercase alphabet for continuous prose.
The author explicitly permits free use, including commercial applications.
The original source notices by Norbert Schwarz permit use, modification and
distribution without limitation; Skala claims no copyright on his contribution.
Those original notices are preserved in the published
[`ocr-b-NOTICE.txt`](release/public/licenses/ocr-b-NOTICE.txt). This source is
independent of commercial OCR-B redistributions and their unrelated licences.

| Input | Identity |
| --- | --- |
| Original package | [`ocr-0.3.1.zip`](https://tsukurimashou.org/files/ocr-0.3.1.zip) |
| Package SHA-256 | `58136fccfdee0923cc83a20996a067b98bae054570ee41bf896d7ca8224399bf` |
| Original font | `OCRB.otf`, 18,324 bytes, internal family `OCR B`, Regular |
| Original font SHA-256 | `87c8d5bfd541d28023d2ba3383169c49f565e10d487ebb027ea0d735ef558707` |
| Original retained copy | [`ocr-b-original.otf`](../../assets/fonts/ocr-b-original.otf) |
| Browser font | `assets/fonts/portfolio-ocr-b.woff2`, 12,840 bytes |
| Browser font SHA-256 | `8806e9a6ed3260df742c43ef996dc1d82ab090f899de08cc486fe3882b0f7d79` |
| Published notice | `licenses/ocr-b-NOTICE.txt`, 1,845 bytes, UTF-8 with LF line endings |
| Published notice SHA-256 | `8676f6ac15567452d394a4576c41bb8a28eb37e8b14dabdcc973cbf91e60076b` |

## Local font adaptation

The original font supports the entire basic Latin alphabet and the currently
published personal names. The published HTML pages also use nine
characters missing from its original character map: `· × – — ← → ↔ ↗ ↘`.
Allowing those to fall back would produce a mixed family despite the OCR rule.
The explicitly named **Portfolio OCR B** derivative preserves every original
glyph program and metric, and adds those nine symbols plus the source SVG degree
sign and legacy control minus/ellipsis. All twelve derive only from the original
dot, lowercase o, hyphen, plus and up-arrow geometry. No original letter is redrawn.

[`prepare-ocr-font.py`](tools/prepare-ocr-font.py) records the exact transforms,
source hash and metadata. It runs only for this prepared font asset, using
the existing Python environment's fontTools 4.25.0 and brotlipy 0.7.0. It is
not a website build dependency and downloads nothing. The checked-in browser
font and licence are hash-pinned in the existing public release allowlist.
The preparation script checks the canonical notice hash and writes only a
CRLF-to-LF normalization with `write_bytes`, independent of the host operating
system. This preserves the original licence text and matches Git's LF storage;
it does not generate or rewrite the notice's content. The initial Windows
notice was 1,882 bytes with 37 CRLF sequences; the portable 1,845-byte version
has the same text and 37 LF sequences. The WOFF2 is unchanged by this correction.
The original glyph advance is 723 units in a 1,000-unit em. Original embedding
permissions are unrestricted (`OS/2.fsType = 0`). The derivative retains those
permissions and adds no restriction. The twelve project additions use CC0 1.0.

## Display source and rights

The selected display face is **Space Grotesk 2.000**, from Florian Karsten's
[primary GitHub repository](https://github.com/floriankarsten/space-grotesk).
The project describes it as a proportional sans serif derived from Space Mono,
retaining details of its monospace origin. That relationship supports the
technical and spatial identity of the OCR reading face while giving long titles
a narrower proportional rhythm. Existing IBM Plex Sans was considered, but
Space Grotesk offers a more direct visual connection with the OCR system.
Neither family is presented as an Apple system font.

The repository's complete [SIL Open Font License 1.1](https://github.com/floriankarsten/space-grotesk/blob/03507d024a01282884232081fc6011c09ff4e849/OFL.txt)
and copyright notice are retained. The browser file is the unmodified upstream
variable WOFF2, with a weight axis from 300 to 700 and unrestricted embedding
(`OS/2.fsType = 0`). The internal default family name is `Space Grotesk Light`;
the declared CSS/FontFaceSet family is `Space Grotesk`. Headings use real weight
500; no synthetic bold or italic is requested.

Retrieved 18 October 2026 and pinned to upstream commit
`03507d024a01282884232081fc6011c09ff4e849`:

| Input | Identity |
| --- | --- |
| Original browser font | [`fonts/woff2/SpaceGrotesk[wght].woff2`](https://raw.githubusercontent.com/floriankarsten/space-grotesk/03507d024a01282884232081fc6011c09ff4e849/fonts/woff2/SpaceGrotesk%5Bwght%5D.woff2) |
| Published browser font | `assets/fonts/space-grotesk-variable.woff2`, 49,256 bytes; upstream bytes unchanged |
| Browser font SHA-256 | `8e085aa438094f11487a836652edd5c054fa6a96f63fc7c282105ee3a4b08c07` |
| Original OFL | [`OFL.txt`](https://raw.githubusercontent.com/floriankarsten/space-grotesk/03507d024a01282884232081fc6011c09ff4e849/OFL.txt), 4,495 bytes |
| Original OFL SHA-256 | `564ce565c371c5e5bbf286006565a7c9aa55a9f56e7ca58d56e05d649dd61a72` |
| Published OFL | `licenses/space-grotesk-OFL.txt`, 4,402 bytes, UTF-8 with LF line endings |
| Published OFL SHA-256 | `c6dec685825f73b18c20926fddc65e8315642e12986f15db0699170940a09efc` |

Only the OFL file's 93 CRLF sequences are normalized to LF for portable Git and
release hashes. Its copyright and licence text are unchanged. This font needs
no local font-generation step. The two new display records extend the public
manifest from 61 to 63 assets; the earlier 61 records retain their exact pins.

## Tracking, leading and hierarchy

Apple's [Typography guidance](https://developer.apple.com/design/human-interface-guidelines/typography)
and [UI design tips](https://developer.apple.com/design/tips/), reviewed on
18 October 2026, support clear relative hierarchy, a small set of typefaces,
legible custom fonts, enough leading for long passages and layouts that avoid
overlapping text at constrained widths. The English HIG content was also read
through its [official DocC data](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/typography.json).

The following CSS values are **project design choices**, not Apple-prescribed
values or conversions of SF point-based tracking tables. OCR already has a wide,
fixed advance, so prose uses neutral tracking. Proportional display text uses
moderate negative tracking rather than the former tightly packed display rules.
Leading is unitless; tracking is in `em` of the element's own font size.

| Role | Font | Leading | Tracking |
| --- | --- | --- | --- |
| Main title / H1 | Space Grotesk 500 | 1.12 | −0.025em |
| Section title / H2 | Space Grotesk 500 | 1.18 | −0.025em |
| Small heading / H3–H6 and logical title | Space Grotesk 500 | 1.3 | −0.015em |
| Body and long prose | Portfolio OCR B 400 | 1.65 | 0em |
| Caption / source note | Portfolio OCR B 400 | 1.55 | 0.01em |
| Navigation / native control | Portfolio OCR B 400 | 1.4 | 0.02em |
| Small label / eyebrow | Portfolio OCR B 400 | 1.45 | 0.06em |

Shared `--type-leading-*` and `--type-tracking-*` tokens in `app/globals.css`
define these roles. Caption/control size tokens are 0.75rem and the small-label
token is 0.6875rem; responsive prose and heading scales retain their individual
reading roles. The compact About article H2s deliberately use the small-heading
role, while standalone page H1s use the main-title role. This is a size-based
hierarchy within valid document heading semantics. Existing label spans inside
captions can retain the label role while the caption container uses caption
leading and tracking.

Two non-heading logical titles carry `data-display-type`: Home's project
invitation and XR's related Bending study. Ordinary `strong` and `em` inside
reading content remain OCR. Actual heading descendants inherit the display
family, including Bending's final heading line. The small entry-loader heading,
source-diagram heading and native model-inspector heading also use the display
family rather than their former OCR font shorthand.

The 361px CI hit-area measurement exposed a Contact link ending at 361.375px.
The narrow Home navigation now permits native wrapping at 375px and below,
retaining labels and clickable areas. The 320×700 native model-inspector case
also exposed a panel extending to approximately 698px. Its narrow annotation
column now recovers space from padding, paragraph gaps and reserved heading
height, retaining source sentences and the 11px OCR reading size. At widths
up to 360px and heights up to 740px, the column uses neutral OCR tracking,
3px padding and the available width ending 0.5rem from the viewport edge.
Heading and description gaps use 4px, callout gaps use 6px, and the callout
index stays on one line. Display-heading and native-control tracking remain
unchanged; all source captions and gesture instructions remain available.
These are source repairs for measured failures; the original browser assertions
remain the acceptance gate, with no clipped text or relaxed bounds.

## Presentation boundary

- Two local faces are preloaded with explicit `data-site-font-family` values:
  `Portfolio OCR B` and `Space Grotesk`. These names also identify the required
  native FontFaceSet loads in the existing readiness service. Entry remains
  pending until those required faces resolve within the existing deadline;
  unused historical fonts are not added to the readiness requirement.
- `--sans`, `--mono` and `--serif` remain compatible semantic tokens but all
  resolve to `--ocr`; `--display` resolves to Space Grotesk. Synthetic weight
  and slant are disabled. H1–H6 and `data-display-type` own the display family;
  body, controls and generated SVG/Canvas 2D text retain OCR ownership.
- Typography and the measured header/annotation spacing repairs retain existing
  native reading ownership. They do not alter Bending's renderer, source
  geometry, camera, lighting or motion.
- The background ASCII field and source-radiance glyphs are analytic geometry,
  not text rendered through a font. They retain the approved implementation.
- Original photographs, videos and image/SVG documentary evidence keep their
  pinned bytes. Fonts embedded in those source pixels are not rewritten.
- The three historical IBM Plex files and original notice remain approved,
  unchanged source pins. Active styles and preload no longer request them.
- The empty reusable `src` framework and local-only research/catalogue tools
  remain outside this published typography change.

This record documents source-level integration. The final `ddafd44` artifact
also passes all 267 hosted public-browser executions and the live native
desktop/mobile protocol. Actual font/glyph, wrapping, interaction, output and
publication receipts, with their device limits and historical failures, are
maintained in [the verification record](OCR_XR_VIEWPORT_VERIFICATION.md).
