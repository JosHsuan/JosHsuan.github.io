# Native velocity skin pilot

21 October 2026. Implementation candidate; browser and owner visual acceptance are not implied by portable tests.

The owner asked for faster-scroll deformation informed by Lusion, while preserving Bending-Active and Motion Capture as presentation references. The current pilot opts in only Mode/s of Making through `data-information-motion-profile="velocity-skin"`. All other pages retain their previous material response. This is a deliberate bounded first iteration, not completion of all-project refinement.

## Role handoff and boundaries

Motion Designer defines the speed response; Animation Cinematographer keeps acceleration and recovery reversible; Experience Director limits it to decorative material so reading, source fidelity and navigation remain stable. Integration ownership is the existing InformationWindowPresenter and HomeScrollPresenter. The ordinary-page Director retains its clock and native scroll ownership. No new RAF, timer, observer, listener, smooth-scroll controller or renderer is introduced. Ambient 3D, idle handheld and existing camera glides are unchanged.

Lusion's current official public bundle demonstrates scroll-coupled image distortion and inertial scroll handling. The cloud browser could open the site but could not initialize its WebGL renderer; therefore these parameters are original design proposals, not visually measured or copied Lusion settings. Reference: https://lusion.co/ . No reference assets or proprietary implementation are included.

## Parameters and behavior

- Actual native displacement divided by active seconds and viewport height drives the effect, not wheel-event units.
- Below 0.08 viewport heights per second, reading is neutral. Above that, a smooth bounded response uses a 1.8 viewport-height/second scale.
- Attack time constant is 55 ms; release time constant is 90 ms (approximately 270 ms for 95% recovery). Residual below 0.0005 snaps to exact idle.
- Signed strength reverses continuously. Only skin edge centres bow; maximum is 2.5% of the smaller panel dimension, capped at 9 px (5 px for panels narrower than 480 px).
- Text, image/video source pixels, controls, native layout and hit targets receive no pilot translation, rotation, scale, clipping, blur or opacity animation.
- Focus within a panel, Reduced Motion, forced colors, Save Data, suspension, seek, resume, a time gap over one second, and offscreen state return to neutral through existing policy gates.
- A zero-time retarget preserves displacement for the next supplied clock tick; policy resets deliberately establish a new position baseline.
- Once neutral, unchanged skins skip pose/Bezier generation even while ambient 3D continues. Resize/measurement invalidation still repaints the current pose, and final idle attributes are published.

## Evidence and next gate

Portable tests cover viewport/frame-rate-normalized speed, bounded response, reversal, finite rest, neutral source/content transforms, focused/policy resets, zero-time retargets, resize invalidation, idle-work suppression and preservation of default Home/Bending response. `tests/pages/velocity-skin.spec.mjs` adds native built-page scroll, stable content geometry, focus, Reduced Motion and overflow checks; its existence is not evidence of a completed browser run.

Before expansion to other projects: inspect fast/slow forward and reverse motion at desktop/mobile sizes, verify real keyboard/touch use and source media continuity, compare protected Bending/XR captures, and obtain owner feedback on the pilot's feel. Physical iPhone/Safari or accelerated-device evidence must be reported separately from emulation.
