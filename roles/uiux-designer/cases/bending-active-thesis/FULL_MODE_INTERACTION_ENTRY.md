# Full mode, interaction and entry readiness

Owner request, 14 October 2026: all adjustments to Bending-Active must follow the current project architecture and development rules. This requirement applies to implementation, review, validation, commit, push and publication. Preserve the approved source assets, empty reusable framework, exact Node 24.19.0 / pnpm 11.19.0 and committed lockfile. Deployment must consume the successful same-commit default-branch push CI artifact without rebuilding.

## Coordinated role decisions

The following records the responsibilities considered by the collaborating review agents. It is a cross-role design review, not twelve independent human approvals.

| Role | Decision |
| --- | --- |
| Experience Director | Integrate the requested behavior into the existing runtime; keep one active clock, explicit readiness and terminal events. |
| Software Architect | Remove user detail/pause state and commands, including their UI and renderer branches. Register entry readiness as a scoped runtime service. |
| Performance Engineer | Full retains device budgets: desktop 1,600,000 pixels / 2 samples; touch 520,000 / 0 samples. Background suspension, pressure adaptation and real interaction holds remain. |
| UI/UX Designer | Provide a typographic entry threshold and truthful readiness milestones. Retain readable failure, Reduced Motion and no-JavaScript outcomes. |
| Motion Designer | Draw eleven original library curves sequentially, 60–160 mm, with active time independent of scroll distance. |
| Animation Cinematographer | Each curve grows from its lower endpoint: 0.28 seconds drawing plus 0.04 seconds between curves, 3.48 seconds total. |
| Information Designer | Preserve all 452 original paths and 27 labels. Paths p937–p927 already run bottom to top; reveal original linework without inventing structural predictions. |
| 3D Artist | Input changes preserve existing materials and compositing. |
| Geometry Engineer | Keep immutable source meshes, coordinates, IDs and support fitting. |
| Scene Designer | The bounded active model viewport owns two-axis touch; its surrounding page keeps native scrolling. |
| Lighting Designer | Preserve the chapter lighting rig and its existing single writer. |
| 3D Animation Designer | Reverse inspection input signs so the visible source follows the hand; keep common damping, recovery and pointer cancellation. |

## Implementation contract

Full is the only rendering mode. `Visual detail`, `Pause motion`, `Resume motion`, `quality.set` and user `paused` state are removed. Device constraints and OS Reduced Motion remain real lifecycle/accessibility inputs, not alternate visual modes. The fixed `detail: 'full'` diagnostic describes the renderer; it is not a writable setting. Pure samplers can still suspend for hidden pages, rendering handshakes and model interaction.

Mouse and touch drag rotate horizontally and vertically in the hand's direction. Actual source raycasting is required before a gesture rotates or compares a model. Pointer cancellation, lost capture and page lifecycle release the gesture. Native scroll continues outside the model viewport, including on touch devices; the UI explains that boundary. Keyboard inspection follows the same direction contract.

The library removes hover, pinning, choice controls and Follow chapter. Miura and workflow controls keep their existing behavior. Readable viewport entry requests a line reveal after project entry has finished. Partial departure restores the complete diagram and cancels that request; re-entry creates a new request. Completed drawings remain complete. Hidden time is excluded, Reduced immediately publishes the original complete drawing, and removal/disposal closes pending requests. DOMPresenter publishes the paths before terminal facts.

The loading surface is an original typographic and line composition informed by [Lusion](https://lusion.co/)'s immersive presentation direction. No Lusion assets or code are copied, and exact reference-loader choreography has not been visually verified. Three discrete milestones represent document hydration, usable typography and an actually painted scene (or an explicit readable static outcome). Percentages count these prerequisites; they do not estimate network bytes. Deferred scene activation for Reduced, Save Data or interrupted-session recovery reaches the readable page without claiming GPU readiness. A 30-active-second startup deadline routes to the existing scene-failure fallback. Hidden time is excluded.

Entry transitions are preparing → ready → revealing → entered, or cancelled on teardown. The existing Director advances a 0.72-second reveal after readiness; no additional RAF or animation timer is introduced. React only receives discrete phase/progress updates. Project interaction is inert during preparation and the overlay is removed after entry. No-JavaScript reading bypasses the overlay. Below-fold lazy evidence remains progressive content, not a fake prerequisite.

## Validation and publication

Portable tests cover state/command rejection, gesture direction and cleanup, library ordering and terminal events, readiness prerequisites, active-time suspension and teardown. Browser tests run the built public artifact in Chromium, WebKit and mobile Chromium, including delayed assets, static fallbacks, native touch, real source strokes, focus, runtime lifecycle and Full resource budgets. Controlled-clock fixtures prove functional timing, not real-time performance. Physical iOS and Android hardware validation remains separate from browser emulation.

Run the required root `pnpm check`, case portable tests and appropriate built root/public browser checks. Record actual results and artifact identity before committing. After push, require successful CI and its validation gate, deploy that exact artifact through the existing publishing workflow, then verify public `release.json` and the live behavior. Publication is authorized for this owner request; no gate is bypassed.

### Local review checkpoint, 14 October 2026

- Root `pnpm check` passed, including content, lint, types, 9 framework tests, 14 CI policy tests and the audited root export.
- Case portable tests: 251 passed, 2 existing conditional skips. The readiness cancellation observer verifies that interaction and DOM restoration precede the terminal event.
- Model, public-release and runtime-lifecycle browser coverage: 48 cases across Chromium, WebKit and mobile Chromium passed. The initial mobile drag run exposed an extra `touchCancel` in test cleanup after `touchEnd`; tracking active touches corrected the fixture, and the focused native-touch rerun passed without a runtime change.
- Built empty-framework checks passed in Chromium, WebKit and mobile Chromium (9 cases). Local Firefox could not launch (`spawn UNKNOWN`), including an unsandboxed retry. CI must verify Firefox and both root/subpath exports before publication.
- The model group used the first local public build. A subsequent audited build includes the entry cancellation ordering and mobile failure-message visibility fixes; its `index.html` SHA-256 is `57d50407945c0bb38f00a67495f973c77c65eef2ba7073b40e8838522fa680e8`. Local pre-commit release metadata still identifies the parent commit; it is not a deployable provenance claim. The CI artifact and validation gate establish the final commit identity.
- Entry readiness on the subsequent build: 6 cases passed across all three public browser projects, including a delayed source model, deep-linked library sequencing and the Reduced static outcome. Desktop and mobile loading screenshots were visually reviewed.

Remaining browser groups are exercised against the subsequent build and by the complete CI matrix. A local checkpoint does not authorize publication ahead of that gate. Physical iOS/Android checks and real-time GPU performance measurements are not claimed by these functional tests.
