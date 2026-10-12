# Advanced runtime patterns for Bending-Active

Date: 10 October 2026, Europe/Berlin. Scope: architecture research for the existing Bending-Active presentation.

The next useful architectural level is an extensible interaction runtime: feature declarations, a coherent state transition boundary, explicit effect scheduling and isolated lifecycle tests. The initial [event architecture study](EVENT_ARCHITECTURE_RESEARCH.md) supplies the subscription and cleanup foundation. The patterns below extend it where a concrete requirement justifies the added machinery.

The strongest near-term candidates are declarative feature contracts, validated state commits and scheduled DOM measurements. Actor orchestration and a render graph become candidates when asynchronous workflows or optical pass composition need that structure. These choices do not imply a framework migration or a measured rendering improvement.

## Declarative features and contribution lifecycle

CodeMirror's `ViewPlugin.define()` combines an instance factory with event-handler and extension declarations. Plugin instances receive update/destroy hooks, and failed plugins can be deactivated. Its state `Facet` combines contributed configuration with declared dependencies. Sources: [view plugins](https://github.com/codemirror/view/blob/fbff59ba004d80d8c914f64c42586387b08706ac/src/extension.ts), [facets](https://github.com/codemirror/state/blob/9c801279cb83011e6f92af778f4443406e8f1200/src/facet.ts), [plugin tests](https://github.com/codemirror/view/blob/fbff59ba004d80d8c914f64c42586387b08706ac/test/webtest-extension.ts).

Theia collects contributions through a provider and separates application initialization, configuration and startup phases. Its provider source explicitly discusses the importance of choosing root versus child container scope. Sources: [contribution provider](https://github.com/eclipse-theia/theia/blob/29045502ffe2bd1ecd5c655b40f37f0d0bc0c4ad/packages/core/src/common/contribution-provider.ts), [frontend startup](https://github.com/eclipse-theia/theia/blob/29045502ffe2bd1ecd5c655b40f37f0d0bc0c4ad/packages/core/src/browser/frontend-application.ts).

For Bending-Active, a feature descriptor can declare its ID, dependencies, factory, command handlers, events and lifecycle hooks. A small composition root validates the descriptors and resolves dependency order. This topological ordering is an application proposal; the cited Theia startup loops do not establish automatic dependency sorting.

Give controllers narrow interfaces: reading may request a chapter, diagrams may request a source selection, and only SceneRuntime receives the final camera writer. These capabilities express API ownership. They do not sandbox untrusted JavaScript. The current site needs a closed catalog of maintained features, not a remote plugin loader.

## Coherent state commits and deferred effects

CodeMirror represents a state transition as a transaction with changes, effects and a resulting state. tldraw's signal transactions batch atom changes, defer dependent reactions and can restore changed atom values on abort. Sources: [CodeMirror transactions](https://github.com/codemirror/state/blob/9c801279cb83011e6f92af778f4443406e8f1200/src/transaction.ts), [tldraw transactions](https://github.com/tldraw/tldraw/blob/7937be360bcb8239d89e420850843f81313fc07b/packages/state/src/lib/transactions.ts), [batch and rollback tests](https://github.com/tldraw/tldraw/blob/7937be360bcb8239d89e420850843f81313fc07b/packages/state/src/lib/__tests__/transactions.test.ts).

The current `input.set()` already merges a patch before notifying subscribers. A transaction boundary would add value when one command spans several controllers: validate all related changes, produce one accepted state and then request its effects. It is not evidence that the current store necessarily exposes partially merged patches.

For example, selecting a representation may affect selected source, associated chapter request and inspection ownership. The proposal is to validate that combination before commitment. DOM publication and rendering consume the accepted snapshot; a rejected command leaves logical state intact.

Keep state changes and external effects distinct. Restoring atom values cannot undo a submitted GPU frame, network request or DOM mutation. Asset loading remains an asynchronous effect with cancellation and instance/generation checks. Continuous scene samples remain in the existing frame pipeline rather than acquiring a transaction for each scalar.

## Scheduled measurements and reactive work

CodeMirror's `requestMeasure()` coalesces measurement requests and gives them separate DOM read and write phases. tldraw's `EffectScheduler` supports a caller-supplied scheduling function for deferred reactions. Sources: [measurement scheduling](https://github.com/codemirror/view/blob/fbff59ba004d80d8c914f64c42586387b08706ac/src/editorview.ts), [measurement contract](https://github.com/codemirror/view/blob/fbff59ba004d80d8c914f64c42586387b08706ac/src/extension.ts), [effect scheduler](https://github.com/tldraw/tldraw/blob/7937be360bcb8239d89e420850843f81313fc07b/packages/state/src/lib/EffectScheduler.ts).

Replace synthetic `resize` messages used only for remeasurement with an explicit layout invalidation service. Coalesce invalidations, measure natural anchors and relevant live rectangles together, then publish changed styles. Preserve the existing rules that separate natural document positions from transformed presentation rectangles.

A derived-state graph can limit which outputs become dirty after a preference or selection changes. It must still support intentional autonomous playback: chapter effects may need another frame even without new input. Feed deferred work into the existing application scheduler instead of introducing another animation clock. DOM, GPU and ASCII work have different lifetimes and cannot be treated as interchangeable callbacks.

## Scoped workflows and deterministic logic tests

Effector's `fork()` creates a scope with its own store values and optional effect handlers. `allSettled()` tracks effect completion in that scope. Sources: [scope creation](https://github.com/effector/effector/blob/93dd907eb07c1f8b7cf8ec56691c4a58935b8225/src/effector/fork/fork.ts), [effect settlement](https://github.com/effector/effector/blob/93dd907eb07c1f8b7cf8ec56691c4a58935b8225/src/effector/fork/allSettled.ts), [fork tests](https://github.com/effector/effector/blob/93dd907eb07c1f8b7cf8ec56691c4a58935b8225/src/effector/__tests__/fork/fork.test.ts).

An equivalent application-owned scope can supply a clock, asset loader and storage adapter to one presentation instance. Tests can replace those adapters and cover activation, cancellation, loading after disposal and manual recovery. The isolated scope is not a separate worker or process, and effect settlement does not certify browser paint or GPU completion.

For workflows with many guarded transitions, an actor can own scene loading/recovery while other controllers own reading and inspection. The prior study's XState implementation is a reference for mailbox ordering and cleanup. These actors can remain in the same browser thread. Their value is explicit ownership and transition semantics, not automatic parallel computation.

An optional bounded diagnostic trace could capture normalized commands, accepted snapshots, logical time, asset revisions and render-submission acknowledgments. Replaying such a trace would require controlled clocks and effect adapters. It would reproduce logical behavior under those conditions, not a physical Safari process crash. This trace is a proposal, not an existing upstream replay guarantee or implemented Bending-Active feature.

## Task based rendering and resource lifetimes

Babylon.js FrameGraph separates task construction, graph building and execution, with a texture manager for allocation and disposal. Task definitions can record texture dependencies; texture allocation can use resource lifespans and aliases. Sources: [frame graph](https://github.com/BabylonJS/Babylon.js/blob/7cc564f9f73eb7e1dad58933382b133e353c5e71/packages/dev/core/src/FrameGraph/frameGraph.ts), [task contract](https://github.com/BabylonJS/Babylon.js/blob/7cc564f9f73eb7e1dad58933382b133e353c5e71/packages/dev/core/src/FrameGraph/frameGraphTask.ts), [texture manager](https://github.com/BabylonJS/Babylon.js/blob/7cc564f9f73eb7e1dad58933382b133e353c5e71/packages/dev/core/src/FrameGraph/frameGraphTextureManager.ts).

A smaller Three.js-specific pass description could identify scene color/depth, mist passes, glyph sampling and final output, together with inputs, outputs and quality conditions. Full/Light modes could select a predefined plan. Inspection and resource estimates would become easier to reason about as pass composition expands.

This is a later candidate. The current compositor already owns and reuses bounded targets. A graph must demonstrate clearer composition or measured resource/work benefits before replacing that code. The cited FrameGraph executes its task list; it should not be described as automatically sorting arbitrary application dependencies. Texture aliasing needs exact compatibility and lifetime checks, and estimated attachments remain different from total device/process memory.

## Proposed integration levels

| Level | Addition | Bending-Active value | Admission condition |
| --- | --- | --- | --- |
| Foundation | Typed commands/events, feature scopes and Registrar | Clear ownership and cleanup | Existing event study |
| Declarative features | Dependency and lifecycle descriptors with narrow service interfaces | Add features without expanding the main controller | More independently maintained features |
| Coherent state | Validated command transitions and accepted snapshots | Coordinate chapter, selection and inspection consistently | Commands span several state owners |
| Work scheduling | Layout invalidation, read/write phases and dirty outputs | Reduce repeated work while preserving autonomous motion | Traces identify unnecessary work or phase coupling |
| Scoped workflows | Replaceable effects, explicit transition owners and diagnostic traces | Reproduce lifecycle races in controlled tests | Cancellation/recovery complexity justifies the model |
| Render planning | Explicit pass/resource declarations | Manage a growing optical pipeline | Demonstrated compositor complexity or measured benefit |

Start with declarative contracts, coherent commands and explicit layout scheduling. Evaluate these together against the current presentation. Introduce actors or a pass graph separately so a benefit or regression can be attributed to the relevant change. Decorators can describe feature handlers at any suitable later stage; they do not supply the transition or scheduling guarantees themselves.

## Acceptance requirements

Feature registration should detect missing dependencies, cycles, duplicate IDs and partial startup failure. API ownership should prevent ordinary consumers from acquiring a final camera writer. State tests should cover accepted/rejected commands, grouped updates and absence of externally visible effects before a successful commit.

Scheduler tests should check coalescing, read-before-write ordering and no unnecessary remeasurement. Workflow tests should cover multiple independent presentation instances, overlapping suspension reasons, disposal during loading and stale completion. A trace should remain bounded and avoid recording live Three.js objects or GPU resources.

Built-artifact verification must preserve chapter composition, native scrolling, focus/history, direct source hits, Full/Light limits and settled Pause/hidden idleness. A new abstraction does not establish improved frame cadence or resolution of whole-process mobile failure; those outcomes need comparable browser/device measurements.

## Source snapshots

| Repository | Examined commit |
| --- | --- |
| codemirror/view | `fbff59ba004d80d8c914f64c42586387b08706ac` |
| codemirror/state | `9c801279cb83011e6f92af778f4443406e8f1200` |
| tldraw/tldraw | `7937be360bcb8239d89e420850843f81313fc07b` |
| eclipse-theia/theia | `29045502ffe2bd1ecd5c655b40f37f0d0bc0c4ad` |
| effector/effector | `93dd907eb07c1f8b7cf8ec56691c4a58935b8225` |
| BabylonJS/Babylon.js | `7cc564f9f73eb7e1dad58933382b133e353c5e71` |
