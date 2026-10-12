# Bending-Active event and feature architecture research

Date: 10 October 2026, Europe/Berlin. Local baseline: `8833491`.

The proposed direction is a small presentation runtime with typed events and commands, explicit feature registration, scoped cleanup and a director that preserves the existing chapter clock. Decorators can describe handlers after this foundation is established. The architectural benefit comes from explicit ownership and lifecycle contracts, rather than from decorator syntax or a particular number of Manager classes.

This proposal applies to the Bending-Active presentation. It does not change the reusable portfolio framework, public story, approved assets or publishing contract. Upstream examples establish implementation patterns; they do not establish improved Bending-Active performance or resolution of the reported physical iPhone failure.

## Current integration and its pressure points

`CinematicExperience.jsx` owns the reading plan, history and focus behavior, application scheduler, chapter playback, stage placement, DOM publication and page field. `ModelInspector.jsx`, `SourceDiagram.jsx`, `EvidenceInspector.jsx` and `CinematicScene.jsx` also register listeners or subscriptions. The shared `story-input.js` merges patches and synchronously notifies every subscriber.

Several useful boundaries already exist: pure response samplers, one chapter clock, one final camera writer, demand-driven Fiber rendering, renderer allocation guards, asynchronous cleanup and a passive render-submission acknowledgment. These should survive any reorganization. The application scheduler and Fiber's demand-rendering mechanism have different responsibilities; a shared chapter clock does not imply that the browser has only one RAF callback.

The event boundary is less explicit. A native event, a component action, a shared-state patch and a `CustomEvent` can all communicate a change. Some components dispatch a synthetic `resize` to request remeasurement. The source-selection event named `thesis:representation-presented` is emitted before the compositor submits that frame; `markPresented()` records the submission afterward. These two signals should keep distinct meanings.

## GitHub implementation patterns

### VS Code events commands and disposal

VS Code exposes a typed subscription function separately from its emitter. Subscriptions return an `IDisposable`, and a `DisposableStore` groups cleanup. Its emitter also contains error handling, delivery-order logic and optional listener diagnostics. Commands have a separate registration and execution interface. Platform contributions use a registry that rejects duplicate identifiers. Sources: [events](https://github.com/microsoft/vscode/blob/959031245ebb1fe077e0d512e1397c0ae82006e4/src/vs/base/common/event.ts), [lifecycle](https://github.com/microsoft/vscode/blob/959031245ebb1fe077e0d512e1397c0ae82006e4/src/vs/base/common/lifecycle.ts), [commands](https://github.com/microsoft/vscode/blob/959031245ebb1fe077e0d512e1397c0ae82006e4/src/vs/platform/commands/common/commands.ts), [platform registry](https://github.com/microsoft/vscode/blob/959031245ebb1fe077e0d512e1397c0ae82006e4/src/vs/platform/registry/common/platform.ts).

For Bending-Active, adopt typed event ownership, separate commands and a disposable scope per feature. A common event infrastructure can support service-owned channels without granting every feature permission to emit every event. Importing the complete VS Code platform would introduce unnecessary dependencies.

Its dependency injection is another useful distinction: `createDecorator()` records constructor-parameter dependencies, while `registerSingleton()` records service descriptors. These are separate operations, and this decorator protocol is not directly interchangeable with modern TypeScript decorators. Sources: [service identifiers](https://github.com/microsoft/vscode/blob/959031245ebb1fe077e0d512e1397c0ae82006e4/src/vs/platform/instantiation/common/instantiation.ts), [service registration](https://github.com/microsoft/vscode/blob/959031245ebb1fe077e0d512e1397c0ae82006e4/src/vs/platform/instantiation/common/extensions.ts).

### Lit feature controllers and host lifecycle

Lit defines a controller interface for a feature's behavior and state. A host registers controllers and invokes connection, disconnection and update hooks. This is a concrete browser-side example of reusable feature Managers with a shared lifecycle. Source: [ReactiveController](https://github.com/lit/lit/blob/01dbc6673cdc211543932afd0ca04e223e567366/packages/reactive-element/src/reactive-controller.ts).

Use this contract idea with the existing React host. React mounting and cleanup can connect and dispose the presentation runtime, while feature controllers remain independent of JSX. Adopting the pattern does not require replacing React with Lit. Reconnection and permanent disposal must be specified separately.

### Phaser scene systems and frame phases

Phaser's scene systems define an explicit order for pre-update, update, the scene update function and post-update; rendering has a separate method. Shutdown and destruction are distinct operations. Its plugin cache records plugin constructors and mappings. Sources: [scene systems](https://github.com/phaserjs/phaser/blob/02d8931b626d9764c133cbb3fbf99966c03c757c/src/scene/Systems.js), [plugin cache](https://github.com/phaserjs/phaser/blob/02d8931b626d9764c133cbb3fbf99966c03c757c/src/plugins/PluginCache.js).

For this presentation, borrow explicit update phases and feature descriptors. Preserve the application clock and final Three.js writers. Phaser also uses frame-phase events, so its source is not evidence that frame events are always unsuitable; the choice depends on dispatch volume, ordering and measured cost. A Phaser engine migration is unnecessary.

### NestJS decorators and deferred registration

`@OnEvent` stores handler metadata. A separate subscribers loader discovers instance methods during application bootstrap, registers their handlers and marks readiness; shutdown removes subscriptions. Its tests include isolation between application instances and avoiding duplicate delivery through aliased providers. Sources: [decorator](https://github.com/nestjs/event-emitter/blob/2eb15a748914f039b3e532be5ae6b53a686e03b6/lib/decorators/on-event.decorator.ts), [loader](https://github.com/nestjs/event-emitter/blob/2eb15a748914f039b3e532be5ae6b53a686e03b6/lib/event-subscribers.loader.ts), [application tests](https://github.com/nestjs/event-emitter/blob/2eb15a748914f039b3e532be5ae6b53a686e03b6/tests/e2e/module-e2e.spec.ts).

Borrow the separation between declaration and runtime registration. Keep metadata independent of browser side effects, and register handlers only after the feature instance exists. This Node/server-oriented package and its legacy decorator/reflection machinery are not proposed as browser dependencies. Critical Bending-Active failures must propagate to fallback handling; Nest's configurable error-suppression policy should not be copied indiscriminately.

### Zustand selective state subscriptions

`subscribeWithSelector` evaluates a selected slice and calls its listener when the equality check detects a change. It returns the underlying unsubscribe function and supports an initial callback. Source: [selector middleware](https://github.com/pmndrs/zustand/blob/d7a5583cffd80af515f7dfb69583c95cbdc9e2ce/src/middleware/subscribeWithSelector.ts).

The repository already includes Zustand. A vanilla store is a candidate for low-frequency UI preferences and model selection, with subscribers outside React rendering. Selectors still run when the store notifies; this is not zero-cost dispatch. Keep continuous camera and shader values in the existing frame pipeline unless profiling justifies moving them.

### XState explicit transitions and actor cleanup

XState actors process events through a mailbox and expose observable snapshots. Their stop path clears observers and emitted-event listeners. Tests cover parent/child communication and stopped actors. Sources: [actor implementation](https://github.com/statelyai/xstate/blob/da4c74efa441dd3a4c1d9835c42c3d1f87cdcaba/packages/core/src/createActor.ts), [actor tests](https://github.com/statelyai/xstate/blob/da4c74efa441dd3a4c1d9835c42c3d1f87cdcaba/packages/core/test/actor.test.ts).

Use explicit transition modeling for scene activation, loading, failure and manual recovery. Pause, page suspension, quality and inspection should retain independent dimensions where their semantics are independent. Start with a transition table; add XState only if hierarchical states, cancellation or verification needs justify the dependency. Frame-by-frame camera calculation does not need an actor message for every value.

### mitt as a minimal emitter

mitt provides a typed event map with synchronous `on`, `off` and `emit`. Dispatch copies the handler list, and its tests specify duplicate-listener behavior. The implementation has no feature lifecycle, registration readiness or listener exception boundary. Sources: [emitter](https://github.com/developit/mitt/blob/6b41670516ed8e8b738612f60491995470aa63b3/src/index.ts), [tests](https://github.com/developit/mitt/blob/6b41670516ed8e8b738612f60491995470aa63b3/test/index_test.ts).

It is a possible emitter component, not a complete application architecture. A wrapper would still need scope disposal, explicit error handling and diagnostics. A small application-owned typed emitter is also reasonable; compare actual requirements before adding a package.

## Proposed runtime responsibilities

| Unit | Responsibility | Boundary |
| --- | --- | --- |
| Composition root | Create runtime services and feature instances for one mounted presentation | No browser listeners or GPU work merely from importing a module |
| FeatureRegistry | Store named feature factories and their declared dependencies | Registration describes features; it does not start them |
| Registrar | Resolve dependencies, bind handlers, track registration handles and readiness | Reject duplicate feature IDs and dependency cycles; clean up partial startup |
| Event infrastructure | Typed notifications, scoped subscriptions and bounded diagnostics | Native event options, targets and phases remain explicit |
| Command interface | Requests with a designated handler, result and error | A request is distinct from a fact notification |
| State interface | Current preferences, selected source and runtime status | Subscribers can read current state after joining |
| ExperienceDirector | Cross-feature policy and ordered updates using the existing chapter clock | No second autonomous clock |
| Feature controllers | Reading, model interaction, diagrams, evidence and lifecycle behavior | Own their state and cleanup; receive narrow dependencies |
| SceneRuntime | Asset/resource ownership and final scene, camera and compositor writes | Retain source fidelity, render budgets and passive submission acknowledgment |
| React and DOM views | Accessible markup, controls and presentation | Component-local actions can remain React handlers and call the command interface |

Features need not all be classes. Factory-created objects with clear interfaces can use the same registration and cleanup contracts. Existing pure sampling functions should remain ordinary functions.

### Separate requests facts and state

A `selectRepresentation` command has one responsible feature. That feature validates the chapter/source, commits selection state and publishes a `representationChanged` fact. Scene submission acknowledgment has a separate meaning and remains passive. Optional consumers such as captions or diagnostics observe facts without acquiring authority to change the camera.

This avoids relying on a global broadcast to decide which of several handlers is responsible for a command. It also avoids using an event history as the only source of current state. Typed names and payloads protect internal contracts; runtime validation is still required at DOM, asset and external-data boundaries.

### Keep a deterministic frame pipeline

The proposed update order is: consume coalesced browser input; advance native reading and history intent; resolve chapter holds and interaction ownership; advance the existing playback and inspection responses; sample presentation values; publish changed DOM values and the shared frame snapshot; let SceneRuntime submit a demanded frame; draw the optional page field within its existing limits.

Layout measurements retain their current invalidation rules and occur before dependent writes. Lifecycle suspension discards hidden elapsed time. Latest-value coalescing is appropriate for pointer position; clicks, navigation and discrete choices retain their ordering. The new infrastructure must not schedule itself merely because the renderer acknowledges a frame.

### Registration lifecycle and error policy

Start features after their dependencies are ready. Each feature receives a scope that owns listener handles, observers, subscriptions and cancellation signals. Stop/dispose must be idempotent, and new subscriptions on a closed scope must be rejected or immediately cleaned up according to an explicit policy. A startup failure disposes already-started features in reverse dependency order.

Asynchronous completion must respect cancellation and generation/instance identity; disposal must prevent late work from restarting a feature. Core failures route to the established scene fallback. Optional ASCII or diagnostic failures remain isolated. Command failures retain a result/error path rather than becoming unobserved event-listener rejections.

For React development setup/cleanup cycles, create a fresh valid runtime after disposal. Avoid a process-global live instance shared across mounts. Raw native listeners keep their targets, capture/passive options and synchronous browser-cancellation requirements; a generic asynchronous queue must not change those semantics.

### Decorators as an optional declaration layer

First define feature descriptors and the Registrar using explicit objects. If handler declarations become repetitive, decorators can populate the same descriptors. The runtime should behave identically with either declaration style.

Select a decorator protocol deliberately. Modern TypeScript decorators, legacy method/parameter decorators and reflection-based injection have different contracts. VS Code and NestJS demonstrate legacy-specific mechanisms, not a ready-made modern decorator implementation for this JSX/MJS case. Registration must bind instance methods correctly and preserve overrides without duplicate inherited handlers.

## Adoption comparison

| Option | Application fit | Main cost | Decision condition |
| --- | --- | --- | --- |
| Small typed runtime inspired by VS Code and Lit | Strong fit for the existing React/Three presentation | Application owns and tests its contracts | Preferred initial candidate |
| Minimal emitter plus custom Registrar | Useful event primitive | Disposal, policy and readiness still need implementation | Consider if emitter requirements match |
| Zustand vanilla subscriptions | Useful for current low-frequency state | Selector work and equality semantics | Evaluate while separating state from frame values |
| XState for scene lifecycle | Useful for complex guarded transitions | Dependency and model integration | Admit after an explicit state model shows a need |
| Full VS Code DI, NestJS, Phaser or Lit migration | Much broader than this presentation | New platform assumptions and coupling | No present requirement |

Architecture adoption should be measured against maintainability and preserved behavior. Neither a central EventManager nor decorators inherently reduces shader cost, asset size or GPU pressure.

## Staged integration and acceptance

1. Inventory native listeners, custom events, shared-state writes and resource owners. Define command/event payloads, failure semantics and lifecycle scope before moving behavior.
2. Introduce scoped subscription/disposal behind the current handlers. Preserve native navigation, event options and model hit ownership. Compare delivery and cleanup before changing control flow.
3. Extract reading, model interaction and lifecycle controllers with explicit dependencies. Replace synthetic remeasurement events with an explicit layout invalidation interface where appropriate.
4. Introduce the feature registry and Registrar at the composition root. Keep descriptors side-effect-free; validate order, rollback, instance isolation and React remount behavior.
5. Evaluate selective subscriptions, a scene transition table and optional decorators. Admit a library only for a demonstrated requirement.

Acceptance includes meaningful contracts for duplicate registration, subscribe/unsubscribe during delivery, listener exceptions, recursive dispatch, partial startup rollback, disposal during loading and stale completion. Type checks should reject mismatched payloads and access to unavailable channels. Mounted instances must not share active subscriptions accidentally.

The built public artifact must retain native touch scrolling, keyboard/focus/history behavior, source-selection linkage, chapter holds, Full/Light budgets, exact camera ownership and static fallbacks. Pause/hidden behavior must still settle to zero ongoing controller, WebGL and field work. Compare sustained resource counts, dispatch counts, frame work and screenshots against the same approved visual target. Physical-device crash conclusions require physical-device evidence.

Useful upstream contract fixtures: [VS Code event disposal, delivery mutation and errors](https://github.com/microsoft/vscode/blob/959031245ebb1fe077e0d512e1397c0ae82006e4/src/vs/base/test/common/event.test.ts), [Lit controller lifecycle and removal](https://github.com/lit/lit/blob/01dbc6673cdc211543932afd0ca04e223e567366/packages/reactive-element/src/test/reactive-element-controllers_test.ts), [Zustand selective subscriptions](https://github.com/pmndrs/zustand/blob/d7a5583cffd80af515f7dfb69583c95cbdc9e2ce/tests/vanilla/subscribe.test.tsx). These specify upstream behavior; Bending-Active needs its own relevant contracts during implementation.

## Source snapshots

Source links above use immutable commits. The examined source files matched those commits when this study was prepared.

| Repository | Commit |
| --- | --- |
| microsoft/vscode | `959031245ebb1fe077e0d512e1397c0ae82006e4` |
| lit/lit | `01dbc6673cdc211543932afd0ca04e223e567366` |
| phaserjs/phaser | `02d8931b626d9764c133cbb3fbf99966c03c757c` |
| nestjs/event-emitter | `2eb15a748914f039b3e532be5ae6b53a686e03b6` |
| pmndrs/zustand | `d7a5583cffd80af515f7dfb69583c95cbdc9e2ce` |
| statelyai/xstate | `da4c74efa441dd3a4c1d9835c42c3d1f87cdcaba` |
| developit/mitt | `6b41670516ed8e8b738612f60491995470aa63b3` |
