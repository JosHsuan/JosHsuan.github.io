# 0009 — Select validation by change impact and publish the shared tested output

Date: 2026-10-13 (Europe/Berlin).

The owner authorized CI optimization, documentation updates, and commit/push/Pages publication of the latest Bending-Active changes, including native reading and permanent model-side information. This decision updates the validation selection policy in decisions 0006–0008. Publication remains separate and manual, with successful default-branch push validation at the exact selected commit.

## Decision

Use an explicit file-to-feature/integration-test map, with conservative full validation for shared or unknown inputs. Pushes compare against the last successful ancestor push of this CI workflow; failed or cancelled intermediate pushes are included. PRs compare against their merge base. Missing history, an unavailable baseline query, dependencies, workflow/build changes and unclassified shared files require full validation. A manual full-validation run remains available but cannot be substituted for push provenance at deployment.

Documentation-only updates run the impact/gate regression checks and produce an inspectable plan; they do not build a new website. Known framework-only inputs run root and subpath validation independently. A public-case update always runs inexpensive lint/type/content/unit checks, all case portable tests, the complete clean public build and asset/private-data audit, and the public-release browser baseline. Additional browser files are selected from the union of affected features, including cross-feature events, CSS, pointer routing and source/diagram synchronization. Shared case code runs every case browser spec.

Build the public case once, then download the same output into Chromium, WebKit and mobile-Chromium runners. Full-case Chromium uses two file-level shards on separate runners, with one browser worker per runner. Install only the engine used by that case job. Cache the pnpm store and Next compiler cache; regenerate all source/public/output files and retain only `.next/cache` during workspace cleanup. Superseded validation runs are cancelled; the deployment concurrency policy remains non-cancelling.

A mandatory `Required validation gate` checks success for every selected job and accepts skips only for jobs excluded by the plan. It uploads `validated-release`, recording the exact SHA, baseline, selected files, job outcomes and an SHA-256 digest of every static output path and byte. Browser jobs verify this digest before and after tests. Deployment requires both a successful same-SHA default-branch push and this record, then verifies the downloaded output/release metadata before publishing without rebuilding. A documentation/framework-only run is not a publishable case release.

## Consequences and verification

The test map is maintained alongside code; an import graph alone would miss CSS, dynamic assets and event contracts. New/renamed/deleted paths are included, and unknown inputs widen validation instead of silently losing coverage. Fast portable tests remain complete because their cost is small; browser selection targets the expensive checks. This change does not alter camera ownership, motion sampling, website content or root framework data.

Regression tests cover selection unions, shared/unknown fallbacks, cancelled/failed baseline exclusion, cumulative changes and renames, unexpected skipped/failed jobs, cache isolation, and artifact/provenance tampering. See [CI/CD operations](../CI_CD.md) for commands, the workflow diagram and evidence/limitations. CI elapsed-time improvement must be measured from runs; no fixed speedup or physical-device stability is asserted.
