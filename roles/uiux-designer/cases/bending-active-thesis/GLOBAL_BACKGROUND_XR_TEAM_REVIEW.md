# Shared background and XR: team review

Date: 16 October 2026 (Europe/Berlin).

Status: local implementation and cross-review checkpoint before publication. The owner authorizes completion
through testing, commit, push, same-artifact CI-gated deployment and live
verification. This record does not claim that final acceptance or publication
has completed.

## Actual participation

Four collaborating agent groups cover the twelve existing responsibilities named
in the [role index](../../../README.md), plus the additional content, frontend,
QA and release responsibilities required by this task. These are role-based
agent assignments, not twelve independent people or human approvals.

| Group | Existing role | Work and decision in this revision |
| --- | --- | --- |
| Architecture | Software Architect / Runtime Engineer | Implemented the shared background boundary and exclusive lease; updated architecture/authorization records and cross-reviewed XR resource ownership. |
| Architecture | Interactive Experience Director | Preserved Bending's background/stage/field order and original Director inputs; separated the common background from project content and project 3D. |
| Architecture | Motion Designer | Reused the actual playback, field score and native input equations; retained Bending's clock and explicit suspension/Reduced Motion behavior. |
| Architecture | Browser and GPU Performance Engineer | Kept the existing bounded 2D field and one background binding; reviewed cancellation, stale handles and teardown without claiming measured device performance. |
| Visual / baseline | UIUX Designer | Designed the visual-first XR reading rhythm, source-first media hierarchy and restrained device presentation; reviewed desktop/mobile reading and baseline comparisons. |
| Visual / baseline | 3D Artist | Reviewed project-specific model/device presentation while keeping the shared background free of a copied Bending project model or compositor. |
| Visual / baseline | Lighting Designer | Preserved Bending's approved lighting and common atmosphere; coordinated XR presentation as its own scene rather than changing the original case. |
| Visual / baseline | Scene Designer | Kept background, reading content and project resources distinct; exposed the common background through the XR page and retained appropriate reading surfaces. |
| Source / research | Geometry Engineer | Audited source variants, units and geometry; converted the explicitly selected `only_interior.3dm` assembly with an independent original-source fidelity check. |
| Source / research | 3D Animation Designer | Preserved the three separate complete Adapt/Assemble/Join recordings and their native timing; rejected invented deformation or a fabricated construction sequence. |
| Source / research | Information Designer | Mapped the verified portfolio argument to original diagrams, real photographs and concise captions; retained collaboration and evidence limits. |
| Integration | Animation Cinematographer | Coordinated source-relative XR model framing and the restrained 3D phone/screen presentation without changing Bending's camera or composition. |

The source group also acts as **Content / Research Editor**: it compared actual
portfolio versions, selected the 86-page 2025 portfolio, reviewed its eight-page
XR chapter and inventoried 494 relevant image/GIF files. It supplied real
photographs, original diagrams and complete native recordings converted into
efficient silent video. Its [source record](XR_PROJECT_INTEGRATION.md) owns the
provenance, encoding details and authorship limits.

The integration group also acts as **Frontend / 3D Developer, QA and DevOps**:
it implements the isolated XR model/phone modules, visibility and failure
lifecycles, native decoded-frame-driven screen rendering, integrated tests,
build/audit and CI/deployment. The phone is a website display device, not a claim
to source-scanned hardware or a live tracking system. Final CI, deployment and
live verification remain pending at this checkpoint.

## Adopted decisions and resolved boundaries

- Promote the real CSS atmosphere, vignette and independent Canvas 2D field into
  Layer 1, retain native content in Layer 2 and project-owned 3D/interaction in
  Layer 3. Ordinary routes use one scoped driver; Bending delegates the shared
  binding to its original Director. No global WebGL model or second case clock
  is introduced. The earlier static common-background proposal is superseded.
- Protect the published `6288286` Bending presentation. Its content, source
  model, materials, lighting, camera, animation and interaction are comparison
  constraints, not redesign opportunities. Any integration regression must be
  repaired in the common infrastructure rather than accommodated by changing
  the case. Native full-document navigation and actual BFCache behavior retain
  the limits documented in [the background contract](GLOBAL_BACKGROUND_INTEGRATION.md).
- Prefer the latest portfolio's real evidence and opening-page main visual for
  XR. The new explicit `only_interior.3dm` selection takes precedence over the
  earlier archived adaptive-model proposal. The source group has selected native
  groups 577/578, 352 meshes forming the complete assembled pair, with a
  millimetre-to-metre conversion and `(x,z,-y)` Y-up mapping. The handoff preserves
  96,312 vertices and 190,320 triangles in one material/primitive, with all source
  positions, original normals and quad triangulation independently verified.
  The CPU poster's initial reflected view basis was corrected to a right-handed
  rotation and checked against actual desktop/mobile Three renders. Geometry is not recentered,
  decimated or assembled by moving unrelated markers into place.
- Keep the complete three interface recordings inside the phone screen, with
  original aspect/timing and an accessible native-video/static alternative.
  Optional WebGL/media resources are visibility-gated and cancellable; native
  video owns playback time. Reuse suitable display methods without modifying
  Bending or mounting its complete runtime on XR.

## Evidence and remaining acceptance

The visual group completed the protected before-change baseline and a frozen
after-change/static comparison subset. The integrator reports **34 matched
static views with zero pixel difference**. This is scoped static evidence, not
proof that every animated or interactive state is unchanged. A separate paired
native-event diagnosis and focused capture cover all 52 normal states, including
desktop mouse and mobile touch. The initial primary batch's desktop timeout and
cancelled request remain in their raw record with an unproven cause; they are
not retrospectively changed to a pass. The [verification record](GLOBAL_BACKGROUND_XR_VERIFICATION.md)
distinguishes this complete state coverage from `allRawPassed: false`.

CPU cross-review found a real XR fallback issue: model keyboard handling consumed
native reading keys when no interactive resource existed. The integrator fixed
the guard and added a native ArrowDown regression. Source review otherwise
found no additional background pointer/layer ownership blocker or XR resource
cleanup blocker; browser and artifact acceptance remain separate evidence.

The cross-review has inspected all sixteen updated desktop/mobile screenshots,
the corrected source poster and the source assembly. It found no additional
visible publication blocker: branches and interfaces remain fully framed,
phone controls/home indicators are unobscured, mobile text is complete, and the
XR card retains the original dual-phone composition. This is rendered-image
review, not physical-device acceptance. Earlier scoped browser checks pass across
the reviewed local builds. The broader 148-case Chromium/mobile run completed
53 passing cases before it was deliberately interrupted when the first CI found
an ordinary-background Reduced Motion scheduling defect. Its original log,
partial artifacts and interruption proof remain intact; this is not a completed
148-case pass.

The first CI, run `38859743050`, is not accepted. WebKit shard 1/2 records
39 passes and one frozen Reduced Motion failure. Separate pre-fix native-input
reproductions fail in Chromium and WebKit; they establish ineffective scheduling
without proving the original CI's exact event caller. The architecture group
gated ordinary input/reset scheduling and unchanged resizes while preserving the
necessary preference-clearing and actual-size static updates. All seven
background portable checks and the 31-check related selection pass without
skips. The reduced-fix run reports 369 passes, zero failures and two existing
conditional skips out of 371 discovered. `pnpm check` and the local
public build/audit also pass; the corrected background browser selection passes
12/12 across Chromium, mobile Chromium and WebKit. Exact frozen time/frame/draw
assertions remain in place, and the Bending Director is unchanged.

Chromium shard 4/4 of that first CI separately records 16 passes and one XR phone
context-loss classification failure. Native video and zero Canvas elements are
correctly reached, but the reported reason races to `render-unavailable` instead
of `context-lost`. The architecture group corrected production render-path loss
classification before disposal and retained ordinary-error classification.
Three new adapter regressions and the 21-check related selection pass without
skips; the original CI's particular event ordering remains unproven. The rebuilt
actual XR selection passes 10/10 desktop/mobile executions in 32.8 seconds,
including genuine phone context loss and continuing native-video playback. The
final complete portable run reports 372 passes, zero failures and two existing
conditional skips out of 374 discovered; its public build/audit passes with
138 local files and 57 approved asset/license files. The
[verification record](GLOBAL_BACKGROUND_XR_VERIFICATION.md) preserves the
failed checkpoints, corrected local evidence and remaining 19-file /
222-execution same-SHA CI, deployment and live comparison gate. Neither original
CI failure is replaced by the corrective local passes.

Still required at this recorded pre-publication checkpoint: pass the complete
same-SHA CI artifact gate, deploy that tested output and repeat live matched
Bending and route/asset checks. The initial batch's unexplained timeout remains
an explicit limitation alongside the successful paired evidence.
Configured budgets and portable checks do not establish sustained physical-device
performance, real BFCache retention or successful publication.
