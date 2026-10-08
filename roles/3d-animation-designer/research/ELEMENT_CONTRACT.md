# Source element animation contract — Round 02

Status: role design established. Source base selection, topology mapping, prepared derivatives and case implementation are pending; no new geometry has been produced by this role.

Use [the closed element catalog](../catalog/elements.json) as the starting record. The shell record comes from the existing sanitized local case manifest. Read and verify the current asset before relying on the previous round's evidence. Geometry Engineer must identify the requested source base and its original placement; a procedural floor cannot fulfill that requirement.

## Preparation and handoff

Original CAD is read-only. Inspect only the authorized source. Record object IDs, visible layers, groups, connected components, bounding boxes, units and conversion transform in the private D-drive audit. Processing and derived geometry live under `D:/JosHsuan_Website/_work/bending-active-thesis/round-02`; only an explicit sanitized local-review handoff may enter the case's ignored assets.

The current whole shell has no named fabrication groups. Connected components can be rendering seams or duplicates and are insufficient to label physical panels. Select source-authored groups when defensible; otherwise reveal the intact shell with the verified source base and real contours. Never turn this limitation into a fabricated engineering animation.

Each handoff should contain the model revision, source-relative element origins, animation pivots, allowed offsets, rest transforms, affected bounds and display-only caption. An element manifest must describe the relationship to the source, not merely assert that it was verified.

## Proposed animation API

`sampleElementPose(stageU, { modelRevision, sourceElements })` returns poses for known IDs, plus a representation caption. `baseReveal` controls visibility/emphasis only after base selection; `panelIsolation` is permitted only when source mapping supports those panels; `assemblyRejoin` restores every selected element to its source-relative rest transform. The parent scene binding remains the final mesh-transform writer.

Initial narrative: overview complete source silhouette; form source shell/base relationship; system defensible rigid separation or intact contour reveal; pattern real opening detail; make exact rejoin beside photographic evidence; validation stable geometry with clear limits; credits complete source object. Coordinate the displacement envelope with Cinema before camera framing and with Scene Designer before stage dimensions.

## Validation after geometry work

Hash originals before and after. Compare every rest-pose vertex against the expected unit/axis transform and preserve topology/normals where unchanged. Prove requested source base inclusion by IDs and placement. Ensure exploded views recover exactly, bounds include moved parts, captions identify editorial separation, and no simulated stress or construction order is implied. Reduced motion presents the complete truthful source configuration. Test actual rendered silhouettes; counts alone cannot prove correct object selection.
