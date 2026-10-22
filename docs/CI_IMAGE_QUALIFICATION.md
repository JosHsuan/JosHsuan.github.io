# Opt-in official image qualification — not release acceptance

Status: image preflight at `e0d29550` passed 50 selected tests per profile (150 total); all three runtime/font/browser/config/lock fingerprints matched, with nonroot UID 1001. WebKit scoped visual/media review passed. Chromium/mobile visual review and unchanged library stress acceptance remain prerequisites before adopting the staged full-gate migration below. No pixel-identical or full-release acceptance is claimed.

The existing manual preflight workflow gains `qualify_image` (default **false**). When true, only the separate `image-qualification` job runs. Dispatch on a reserved `preflight/**` candidate branch, choosing the same exact files/profile as normal preflight. The manual preflight VM default is unchanged. The separately staged full-CI migration is described below; deployment verification is unchanged.

## Identity and security

Official `mcr.microsoft.com/playwright:v1.63.0-noble` was verified through the Microsoft registry. Its index digest is `sha256:eff16c30e6f3f4af0a03fa4b706120d5e9b0891c344a27d64559aff5900a4a27`; the workflow pins the Linux amd64 manifest `sha256:bc6ab0d6d44ff4826e4cb8c1e6d801e185bfc42bb0753f8e2a30efc70db054c7`, not a mutable tag. Project Playwright stays 1.63.0, Node 24.19.0, pnpm 11.19.0 and frozen lockfile. The official image preinstalls the browsers and OS dependencies; this job performs no apt/browser installation or fallback download.

The job uses `pwuser`, private 1 GiB shared memory, and ordinary container isolation. There is no root fallback, chmod/chown workaround, privileged mode, host IPC, sandbox override or new token permission. The first step requires a nonroot named user and writable workspace, HOME, runner temp/toolcache and runner environment/path files. GitHub bind-mount ownership is a qualification risk: if incompatible, stop and report the failing path rather than escalating. Actions may still fail during container startup before this check; that is a failed qualification, not permission to weaken isolation.

Existing Playwright launch configuration stays byte-identical, including Linux WebKit playbin3 media environment, software rendering behavior, one worker, no retries and native media tests. Nonroot execution is not proof of equivalent graphics, sandbox, fonts or codec behavior. Official image defaults to root; our override is intentional and must be exercised in cloud before adoption.

## Evidence and behavioral qualification

`image-fingerprint.json` records the workflow-declared image digest (not independent in-container attestation), commit/run/attempt, exact toolchain, user/OS, package versions, font file names/families and hashes, browser registry revisions/executable hashes including Chromium headless shell, shared-memory size, lock/config hashes and available media/library diagnostics. Missing optional `gst-inspect` is recorded, not silently interpreted as codec success. Required package/font/identity/executable checks fail closed. Browser behavior remains established by actual tests.

Suggested focused selection on **each** profile (`chromium`, `webkit`, `mobile-chromium`):

- `tests/pages/typography.spec.mjs` — font metrics/readability;
- `tests/pages/project-background-motion.spec.mjs` — native video, source timings, decode/fallback and reduced/save-data paths;
- `tests/pages/model-inspection.spec.mjs` — software GPU, source model visibility, geometry and inspection;
- `tests/pages/bending-scroll-camera.spec.mjs` — native scrolling, pause and source idle;
- `tests/pages/xr-scroll-camera.spec.mjs` — XR camera, idle and pause;
- `tests/pages/xr-research.spec.mjs` — native phone-video decode, retained/delayed first frame, WebGL texture and media ownership.

Inspect retained video/screenshots/traces, not merely green counts. Compare font/package/browser fingerprints with successful VM evidence; image libraries and fonts may have different patch revisions despite the same Ubuntu release. Image Node is only major-version 24 in its Dockerfile, so setup-node and runtime checks are mandatory. Private shared memory is not a visual-equivalence guarantee. Container pull latency is a new network cost; no speed promise is made.

Only after all three profiles qualify and independent review accepts the evidence may a separate reviewed proposal migrate the full 4/2/2 gate. The full candidate inventory, exact artifact digest, all required tests and publication verifier remain mandatory; these preflight artifacts cannot publish. Do not count partial VM success or an image fingerprint as release acceptance.

Sources: [official pinned-version Dockerfile](https://github.com/microsoft/playwright/blob/v1.63.0/utils/docker/Dockerfile.noble), [Playwright Docker guidance](https://playwright.dev/docs/docker), [GitHub runner mount implementation](https://github.com/actions/runner/blob/main/src/Runner.Worker/ContainerOperationProvider.cs).


## Full-gate migration (exact candidate acceptance pending)

Only `pages-browser` and `framework` move to the identical pinned image and qualified nonroot mount guard. Planning, quality, the single public export build, independent inventory generation, and the required gate remain on their current VMs. The page matrix stays 4 Chromium / 2 WebKit / 2 mobile workers, with each runner's existing one-worker/no-retry policy and 45-minute cap. Each job consumes and verifies the same export before and after its existing exact-receipt test runner. No receipt, artifact eligibility or deployment verifier changes are included.

Framework root and `/portfolio-test` still build and run all three tests in all four profiles (24 checks total): Chromium, Firefox, WebKit and mobile Chromium, with existing two workers and one retry. Firefox revision 1543 / version 155.0 is declared in the pinned package registry; the extended fingerprint now verifies the actual image executable, and both framework and pages config hashes. Firefox behavior is **not** established by the preceding three-profile pages preflight: the next full framework jobs must establish that acceptance. If it fails, the full gate fails; no old VM evidence or browser-install fallback may replace it. Framework Next cache keys gain the image digest namespace to avoid reusing VM-native build cache.

Every migrated job retains a separate `browser-environment-*` fingerprint artifact. It remains nonpublishable diagnostic evidence, never a replacement for test receipts. Full candidate validation must still pass every required page test and both complete framework suites before release. Configuration, source tests, worker/retry counts and browser launch flags remain unchanged.

Observed qualification difference: the unsupported `↗` glyph uses a thinner/longer system fallback than the earlier VM; reviewed Latin Roboto metrics/wrapping remained unchanged. Preserve this difference in visual review rather than asserting pixel identity. Image pull latency and complete-gate performance still require measurement; avoiding apt downloads is not an end-to-end speed guarantee.

## Accepted bounded qualification receipts

Exact candidate `e0d29550b3e17733ddbc914287a66586edad24c5` passed the six-file selection without altered browser flags or test deadlines:

| Profile | Run | Tests | Test-step duration |
| --- | --- | --- | --- |
| Chromium | [39806628516](https://github.com/JosHsuan/JosHsuan.github.io/actions/runs/39806628516) | 50 passed | 20.6 min |
| WebKit | [39807709228](https://github.com/JosHsuan/JosHsuan.github.io/actions/runs/39807709228) | 50 passed | 12.3 min |
| Mobile Chromium | [39807819589](https://github.com/JosHsuan/JosHsuan.github.io/actions/runs/39807819589) | 50 passed | 13.9 min |

All three verified fingerprints agree on runtime identity (nonroot `pwuser`, UID 1001), 48 font-file hashes, browser executable hashes/revisions, and lock/config hashes. Independent retained-image and sampled-video reviews accepted the bounded typography, compact controls, native source-information card, source framing, Bending absence/re-entry, XR and native Dot media behavior. Foreground reading panels intentionally occlude rear models; no claim of continuous visibility, FPS or exact VM pixel parity is made.

The unchanged Chromium `library-reveal.spec.mjs` additionally passed both tests in 4.3 min in [39811355204](https://github.com/JosHsuan/JosHsuan.github.io/actions/runs/39811355204). The prior VM full run exhausted its test budget amid native ReadPixels GPU-stall warnings despite completed reveal assertions. This qualification preserves the original 240-second scenario limit and source guards; it does not prove the underlying renderer-backpressure cause is fixed. All manifests remain explicitly nonpublishable.
