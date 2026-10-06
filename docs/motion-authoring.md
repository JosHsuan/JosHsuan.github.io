# Motion integration and later authoring

There are currently **no registered scenes, models, motion manifests, or exported Theatre states**. The adapter is typed and the neutral controller lifecycle is tested. Studio editing, keyframing, viewport composition, and clean production replay remain NOT RUN.

## Module boundaries

- `src/motion/contracts.ts`: application types and validated clip mapping.
- `src/motion/createController.ts`: cancellation, late readiness, modes and disposal.
- `src/motion/theatre`: the only runtime integration importing Theatre; matching Core/Studio 0.7.2.
- `SceneDirector`: mutually exclusive time/scroll drivers and inspection handoff.
- `useSceneScroll`: scoped ScrollTrigger and cleanup, with late font/layout refresh.
- Scene bindings apply semantic poses directly to owned Three.js objects and call `invalidate()`; frame values do not enter React state.

## Adding the first scene after content discussion

1. Establish its motion brief, approved poster/model, units (meters/Y-up), revision and static pose.
2. Add an explicit lazy loader and poster to `src/scenes/registry.ts`. The registry starts empty.
3. In the scene effect, create the Theatre controller with stable project/sheet IDs and committed state. Connect `applyPose` to the actual camera and assembly. Catch readiness failures and retain the static pose/poster. Dispose on unmount and on setup failure.
4. Use one SceneDirector per mounted scene. Set the new mode when the viewer's `mode` prop changes. The story owns the camera only in story mode. Mount `InspectionControls` only in inspect mode, using the last authored target. Unmount it before resuming the story.
5. The scene must add its own approved lighting and asset Suspense handling. The generic viewer deliberately does not invent geometry, lights, camera choreography or clips.
6. Create a local authoring entry when the real scene is ready. `initializeStudio()` is available as an isolated module, but no authoring route is currently exposed. Do not import it into public routes; production webpack rejects it even behind a hidden UI.
7. Author real keyframes, export with Studio and save `motion.state.json`. Never fabricate a state file to make validation pass.
8. Save `motion.manifest.json` alongside it with the SHA-256 of the exact state bytes, schema identity, actual Core/Studio versions, model revision, clip ranges, bindings and static pose.
9. Extend version-specific contract checks to assert actual evaluated values/keyframes at approved checkpoints. The current manifest validator checks metadata, hash and asset coherence only; it is not an animation correctness test.
10. Rebuild and replay in a fresh browser without authoring storage, check responsive framing, repeated navigation, reduced motion, model/renderer failures, idle rendering and real devices.

Export unsaved Studio work before switching branches or clearing project-specific storage. The project registry rejects simultaneous ownership and state changes under an existing project ID. Full reload is required when that state changes. A public runtime cannot enable Studio with a query parameter.
