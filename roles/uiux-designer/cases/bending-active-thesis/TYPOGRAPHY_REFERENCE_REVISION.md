# Unified typography reference revision

Status: candidate, not yet visually accepted or published.

The 21 October 2026 owner correction requests the font family, tracking,
leading and text layout of [Weiting Chen's About page](https://weitingworks.com/about)
as a reference for **all** typographic levels, rather than a headings-only
size adjustment. This supersedes the previous OCR B / Space Grotesk family
choice. It does not authorize copying reference content or changing source
artwork, camera recipes, media or motion ownership.

## Font provenance and delivery

One locally served normal variable **Roboto Mono** face supplies Latin headings,
prose, captions, metadata and controls. The upstream file is copied byte-for-byte
from [googlefonts/RobotoMono commit 895ec691990d041dd727c7b5afa3ce56525d98e6](https://github.com/googlefonts/RobotoMono/tree/895ec691990d041dd727c7b5afa3ce56525d98e6):

- Source: `fonts/webfonts/RobotoMono[wght].woff2`.
- Public path: `assets/fonts/roboto-mono-variable.woff2`.
- Size: 105,204 bytes.
- SHA-256: `aafaa5d57a7180d02d1c6a5925523e06b3bcde4b182544a4d793d5ee87e61817`.
- Original `OFL.txt`, including the Roboto Mono Project Authors copyright,
  is retained verbatim at `licenses/roboto-mono-OFL.txt` (4,395 bytes;
  SHA-256 `50ab8dd54680d3473f649c9db86fece88434d097c7834475c1c72d2f8c429215`).

The same-revision upstream variable TTF metadata confirms a `wght` axis of
100–700 and 876 mapped characters. It does not contain Han characters or the
right/up-right arrows used by some controls. Those characters require truthful
system fallback; they must not be reported as rendered Roboto Mono glyphs.
No renamed or generated glyph derivative is introduced. Existing font source
files and historical notices remain in the repository, but the public manifest
and single preload now select only the new face and original OFL notice.

The existing readiness owner waits for the declared face, with `font-display:
swap` preserving reading during delivery. No external font request is needed.
The release records both body and display roles as Roboto Mono, bound to the
same file and notice hashes; build/audit checks enforce these bytes and the
single explicit preload on every route.

## Acceptance boundary

Typography includes role-specific size, weight, line height, tracking, line
measure, paragraph spacing, captions and controls at desktop and mobile sizes.
CJK fallback and symbol fallback remain explicitly distinct from the Latin
font. Native scrolling, fixed chrome clearance, text enlargement, no-JavaScript
reading and original image proportions must remain usable. Tests must check
actual rendered families and geometry, not just matching CSS variables.

Previous CI/deployment receipts belong to the previous typography. This
candidate needs its own built-artifact checks, design review and exact-commit
CI before same-artifact publication. Physical-device or visual checks that
have not run must remain recorded as unverified.

## Local integration evidence (21 October 2026)

- Exact Node 24.19.0 / pnpm 11.19.0 toolchain.
- Content validation, full ESLint, TypeScript and diff whitespace checks passed.
- Portable CI/runtime/provenance suites: 581 tests, 579 passed, two intentional
  skips, zero failures; framework unit/integration: nine passed.
- Public production build and audit passed: 257 output files and 136 approved
  assets. The two-asset reduction is the replacement of two font/notice pairs
  with one; all seven original project motion sources remain pinned.
- Root framework production build/audit passed: 61 output files, editor excluded.
- Existing impact classification selects full validation: 23 public browser spec
  files across eight shards, with 390 enumerated tests. Enumeration is not a
  browser execution receipt; new candidate CI remains pending.
- Local output is an uncommitted preview based on `f0ae495`; its inherited release
  commit field is not evidence that these new typography bytes were deployed.

Reference measurements and role-specific visual decisions are recorded in
[`TYPOGRAPHY_REFERENCE_REFINEMENT.md`](./TYPOGRAPHY_REFERENCE_REFINEMENT.md).
