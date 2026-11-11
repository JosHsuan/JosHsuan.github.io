# 0023 — Public source boundary and failure-safe lifetimes

Date: 2026-11-11 (Europe/Berlin)

The owner requests a comprehensive architecture audit and revision using the
installed skills and workflow, with implementation through verified deployment
authorized and no paid or potentially charge-incurring services. The preceding
workflow integration was separately committed/pushed as `9dcc58f` without
deployment. This decision records the architecture changes; the
[review record](../ARCHITECTURE_REVIEW_20261111.md) distinguishes implementation
from pending acceptance and publication.

## Decision

Keep the two applications separate. The reusable framework remains empty and
the selected public portfolio retains decisions 0021/0022, its source geometry,
assets, appearance and native document navigation. Do not replace imperative
renderers with R3F, add a scheduler, or move pure helpers only to rename folders.

1. `scripts/pages-sources.mjs` is the explicit source handoff shared by build and
   quality checks. Before copying, audit path containment, import closure,
   duplicate paths and module cycles. `runtime/core` can depend on core and
   contracts, not React, features or presentation. This checks source structure;
   the existing release manifest and output audit still own public asset bytes.
2. `pnpm lint` includes the selected public modules through `pnpm lint:pages`.
   Both `pnpm check` and CI quality therefore cover them automatically. Preserve
   three narrowly scoped native-document link exceptions and the pinned SVG
   fallback. Other role research/prototypes stay outside the public lint scope.
3. A shared document-stage registry gives Project and Home subscriptions the same
   rollback, independent subscription and reentrant release semantics. Failed
   registration cannot leave an owner behind. A superseding registration stops
   stale delivery. The registry owns no camera, frame loop or scene resources.
4. Permanent preview disposal is marked before observers run. A notification
   cannot reactivate the closed controller or schedule another acquisition.
5. Source-diagram managers are created in their connected effect lifetime.
   Cleanup cancels their loads and releases the owned reference. The rendered
   fixture uses the actual provider and typed state, including Strict Mode,
   remount and failure fallback coverage.
6. Patch Zod alone from 4.6.5 to 4.6.6 after inspecting its collection-size
   security fix and local content-validation callers. Keep exact Node/pnpm and
   other dependency versions. Record the development-only minimatch advisory
   and its absent triggering configuration in the review rather than forcing
   an unsupported major into the pinned lint/parser dependency tree.

## Verification and limitations

Behavioral regressions must fail before the lifecycle repair and pass after it.
Boundary tests exercise forbidden dependencies and invalid hooks. Source checks
do not replace built desktop/mobile/WebKit acceptance. The final candidate must
pass the existing exact test-inventory/receipt and artifact gate before its
bytes are deployed; verify the public release and routes afterward.

No original assets, paid runners, services, analytics or hosting providers
change. Local measurements do not establish physical-device
GPU performance or field interaction latency.
