# Opt-in official image qualification — not release acceptance

Status: proposed isolated qualification; no successful image execution or environment equivalence claimed.

The existing manual preflight workflow gains `qualify_image` (default **false**). When true, only the separate `image-qualification` job runs. Dispatch on a reserved `preflight/**` candidate branch, choosing the same exact files/profile as normal preflight. The VM default is unchanged. No main/full-CI/deployment migration is included.

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
