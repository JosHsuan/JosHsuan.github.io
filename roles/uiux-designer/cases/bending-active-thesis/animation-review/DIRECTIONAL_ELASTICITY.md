# Directional elasticity review

Subsequent owner request: keep this directional response as scrolling feedback and let the complete window leave through the browsing viewport boundary. The current [native-scroll catalog](./README.md) supersedes the fixed-region reveal/opacity presentation described below. Its continuous scroll target, always-opaque surface and residual feedback keep the inertial material model from this review.

## Scroll feedback follow-up — 14 October 2026

The Motion Designer and Experience Director / UIUX review roles confirmed that native page travel already supplies the requested complete exit. The retained membrane and ink recipes remain unchanged across the model and information layers. Elasticity relaxes around the current page position; only continued scrolling takes the window out of the browsing viewport.

The review identified two presentation inconsistencies. The outer position slider did not follow native scrolling or playback, and viewport exit facts used the untransformed page coordinate while elastic lag could still leave content visible. The catalog now synchronizes the position control through the final stopped sample and publishes boundary facts after measuring transformed content bounds. This border-box measure excludes protruding decorative skin. The diagnostic native region remains separate from content visibility. Reset and stationary inspection clear their intent after that final paint.

The 15 October follow-up retains native travel for all four specimens. A scripted exit interrupted by reverse scrolling cannot report exit completion while its content is still visible. This is a catalog consistency correction; the main presentation's event design remains deferred.

The former reverse-return control is labelled Return-to-window because it centres the same surface from either side. Upward replay retains its explicit direction. These changes are confined to the catalog presenter and controls; the deferred main-page event design is not part of this review.

Owner request, 13 October 2026: integrate local elasticity with entrance and exit direction in the catalog. The motion, direction and UI roles discussed the diagnosis and reviewed the implementation. This authorization applies to the isolated catalog; the main presentation's event design remains a separate task.

## Diagnosis agreed by the roles

- **Motion:** the former delayed corner destinations did not represent material inertia. Shape could follow distance from the reading position without responding correctly to acceleration or braking. A new target also changed the nominal direction before the previous movement had stopped.
- **Direction:** vertical traction should produce a leading face and a trailing face. Four simultaneous inward necks read as a separate decorative pulse. Curved trajectories and their echoes must share the same path.
- **UI:** use a broad trailing bow, restrained neighbouring edges and a complete quiet reading surface. Extending a curved perimeter needs matching paint outside the original box; a rigid rectangular border would expose the construction. Preserve the static model and readable content surface.

## Implemented contract

1. One body travels through before (-1), reading (0) and after (+1). The existing spring retains velocity when its destination changes.
2. Four corners and four edge centres follow its actual position and velocity. Their relative displacement obeys a forced damped spring: `e'' + 2*zeta*omega*e' + omega^2*e = -a_body`. No point waits in a delayed destination queue.
3. Leading material follows more firmly; trailing material is softer. A filtered actual velocity exchanges those roles after braking and a physical change of direction. The trailing edge centre is softer than its corners, forming one broad bow.
4. All points use the same signed path as the body. Orbit and glide include their curved translation. The pose removes in-plane rotation/skew from each relative offset before CSS applies the common transform. The echo trails the actual transport velocity.
5. The outline uses one cubic bow per edge and rounded joins. Its normal displacement bends the edge; tangential motion does not add an unrelated side pinch. A common displacement gain bounds the shape without clipping each point independently. Empty paint overscan extends the surface without resizing or duplicating content.
6. Entry overshoot is physical movement, not an exit command. I3 has a reveal coordinate on the same active clock: it advances monotonically toward the current destination, holds fully open after entry and preserves its current value on retargeting. A velocity-based rate cap prevents a sudden crop when leaving during an existing overshoot. It adds no timer or frame owner.
7. Completion waits for body, all eight material points, reveal coordinate, energy and pointer response. Pause freezes their active time; Reduced applies exact endpoints. A settled reading surface is an exact rounded rectangle and owns no scheduled animation frame.

The perimeter and whole-window transform carry the elasticity. The source geometry, camera, model pixels, SVG and text are not non-linearly warped. Local spring material motion is an interaction model, not a cloth simulation.

## Review findings and correction

The first directional artifact removed the four-petal/hourglass outline. The direction role inspected C1/C2/C3/I2/I3 at six elapsed times and during reversal. The UI role inspected C1/C4/I1/I3/I4 at five times on desktop and 390-pixel mobile emulation, producing 50 captures. They agreed that acceleration, braking and trailing motion now belong to the same gesture; the UI inspection found no rigid rectangular cutoff or mismatched paint skin.

Both roles independently found one remaining I3 defect: body overshoot crossed zero and started the opposite reveal mask, cropping an already revealed title. The monotonic reveal coordinate and rate cap above address that finding. Follow-up visual review and final artifact results are recorded in [VERIFICATION.md](./VERIFICATION.md), including the limits of emulated mobile testing.
