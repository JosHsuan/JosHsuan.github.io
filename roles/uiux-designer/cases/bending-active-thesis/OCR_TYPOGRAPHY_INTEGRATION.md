# OCR typography integration

Date: 18 October 2026 (Europe/Berlin)

The owner requests actual OCR typography throughout every published page,
including the introduction, About, Project, Contact, Bending-Active and XR.
This explicitly supersedes the earlier IBM Plex selection for typography;
the approved source images, videos, geometry, camera and motion remain intact.
A bounded search of maintained project Markdown and preparation font-term
context did not identify an earlier OCR-A/OCR-B subtype choice.

## Source and rights

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
published personal names. The six current rendered HTML routes also use nine
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

## Presentation boundary

- One preloaded local face supplies every DOM heading, paragraph, caption,
  navigation item, control and generated source-diagram text label.
- `--sans`, `--mono` and `--serif` remain compatible semantic tokens but all
  resolve to `--ocr`. Synthetic weight and slant are disabled; scale, line
  height, spacing and existing colours establish hierarchy.
- The wider OCR advance requires smaller desktop/mobile names and headings.
  These typography rules retain existing native layout and reading ownership;
  they do not alter Bending's renderer, source geometry, camera or motion.
- The background ASCII field and source-radiance glyphs are analytic geometry,
  not text rendered through a font. They retain the approved implementation.
- Original photographs, videos and image/SVG documentary evidence keep their
  pinned bytes. Fonts embedded in those source pixels are not rewritten.
- The three historical IBM Plex files and original notice remain approved,
  unchanged source pins. Active styles and preload no longer request them.
- The empty reusable `src` framework and local-only research/catalogue tools
  remain outside this published typography change.

This is source-level integration evidence. Browser font load, actual glyph
rendering, mobile wrapping, interactions, built-output checks and publication
must be accepted against the resulting artifact; this record does not claim
those later gates have passed.
